import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const functionToolNames = {
  invokeFunction: 'invoke_function',
  listProjects: 'list_projects',
};

export const functionToolDescriptions = {
  invokeFunction: 'Invoke a Supabase Edge Function',
  listProjects: 'List all Supabase projects',
};

const ResponseSchema = z.object({
  content: z.array(z.object({
    type: z.literal('text'),
    text: z.string(),
  })),
});

export const InvokeFunctionSchema = z.object({
  function: z.string(),
  params: z.record(z.any()).optional(),
  options: z.object({
    headers: z.record(z.string()).optional(),
    responseType: z.enum(['json', 'text', 'arraybuffer']).optional(),
  }).optional(),
});

export const ListProjectsSchema = z.object({
  random_string: z.string(),
});

export const runInvokeFunctionTool = async (supabase: SupabaseClient, args: z.infer<typeof InvokeFunctionSchema>) => {
  const { function: functionName, params, options } = args;
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: params,
    ...options,
  });

  if (error) throw error;
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(data) }],
  });
};

export const runListProjectsTool = async (accessToken: string) => {
  const response = await fetch('https://api.supabase.com/v1/projects', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list projects: ${response.statusText}`);
  }

  const data = await response.json();
  return ResponseSchema.parse({
    content: [{ type: 'text', text: JSON.stringify(Array.isArray(data) ? data : [data]) }],
  });
}; 