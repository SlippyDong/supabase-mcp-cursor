import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const databaseToolNames = {
  createRecord: 'create_record',
  readRecords: 'read_records',
  updateRecord: 'update_record',
  deleteRecord: 'delete_record',
};

export const databaseToolDescriptions = {
  createRecord: 'Create a new record in a Supabase table',
  readRecords: 'Read records from a Supabase table',
  updateRecord: 'Update records in a Supabase table',
  deleteRecord: 'Delete records from a Supabase table',
};

const ResponseSchema = z.object({
  content: z.array(z.object({
    type: z.literal('text'),
    text: z.string(),
  })),
});

export const CreateRecordSchema = z.object({
  table: z.string(),
  data: z.record(z.any()),
  returning: z.array(z.string()).optional(),
});

export const ReadRecordsSchema = z.object({
  table: z.string(),
  select: z.array(z.string()).optional(),
  filter: z.record(z.any()).optional(),
});

export const UpdateRecordSchema = z.object({
  table: z.string(),
  data: z.record(z.any()),
  filter: z.record(z.any()).optional(),
  returning: z.array(z.string()).optional(),
});

export const DeleteRecordSchema = z.object({
  table: z.string(),
  filter: z.record(z.any()).optional(),
  returning: z.array(z.string()).optional(),
});

export const runCreateRecordTool = async (supabase: SupabaseClient, args: z.infer<typeof CreateRecordSchema>) => {
  const { table, data, returning } = args;
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select(returning?.join(',') || '*');

  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(result || []) }],
  });
};

export const runReadRecordsTool = async (supabase: SupabaseClient, args: z.infer<typeof ReadRecordsSchema>) => {
  const { table, select, filter } = args;
  
  let query = supabase
    .from(table)
    .select(select?.join(',') || '*');

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'object' && value !== null) {
        for (const [op, val] of Object.entries(value)) {
          query = query.filter(key, op, val);
        }
      } else {
        query = query.eq(key, value);
      }
    }
  }

  const { data: result, error } = await query;
  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(result || []) }],
  });
};

export const runUpdateRecordTool = async (supabase: SupabaseClient, args: z.infer<typeof UpdateRecordSchema>) => {
  const { table, data, filter, returning } = args;
  
  let query = supabase
    .from(table)
    .update(data);

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
  }

  const { data: result, error } = await query.select(returning?.join(',') || '*');
  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(result || []) }],
  });
};

export const runDeleteRecordTool = async (supabase: SupabaseClient, args: z.infer<typeof DeleteRecordSchema>) => {
  const { table, filter, returning } = args;
  
  let query = supabase
    .from(table)
    .delete();

  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      query = query.eq(key, value);
    }
  }

  const { data: result, error } = await query.select(returning?.join(',') || '*');
  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(result || []) }],
  });
}; 