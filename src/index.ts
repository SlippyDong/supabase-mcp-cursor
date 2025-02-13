#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createClient } from "@supabase/supabase-js";

// Import tool modules
import {
  databaseToolNames,
  databaseToolDescriptions,
  CreateRecordSchema,
  ReadRecordsSchema,
  UpdateRecordSchema,
  DeleteRecordSchema,
  runCreateRecordTool,
  runReadRecordsTool,
  runUpdateRecordTool,
  runDeleteRecordTool,
} from "./tools/database.js";

import {
  storageToolNames,
  storageToolDescriptions,
  UploadFileSchema,
  DownloadFileSchema,
  runUploadFileTool,
  runDownloadFileTool,
} from "./tools/storage.js";

import {
  functionToolNames,
  functionToolDescriptions,
  InvokeFunctionSchema,
  ListProjectsSchema,
  runInvokeFunctionTool,
  runListProjectsTool,
} from "./tools/functions.js";

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_KEY ?? "";
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? "";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create MCP server
const server = new Server(
  {
    name: "cursor-tools",  // Changed to match mcptest
    version: "2.0.1",      // Changed to match mcptest
  },
  {
    capabilities: {
      tools: {
        responseSchema: {
          type: "object",
          properties: {
            content: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true
              }
            }
          },
          required: ["content"],
          additionalProperties: false
        }
      },
    },
  },
);

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [

    {
      name: "create_record",
      description: "Create a new record in a Supabase table",
      inputSchema: {  // Changed from parameters to inputSchema
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Table name",
          },
          data: {
            type: "object",
            description: "Record data",
          },
          returning: {
            type: "array",
            items: { type: "string" },
            description: "Fields to return (optional)",
          },
        },
        required: ["table", "data"],
      },
    },
    {
      name: "read_records",
      description: "Read records from a Supabase table",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Table name",
          },
          select: {
            type: "array",
            items: { type: "string" },
            description: "Fields to select (optional)",
          },
          filter: {
            type: "object",
            description: "Filter conditions (optional)",
          },
        },
        required: ["table"],
      },
    },
    {
      name: "update_record",
      description: "Update records in a Supabase table",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Table name",
          },
          data: {
            type: "object",
            description: "Update data",
          },
          filter: {
            type: "object",
            description: "Filter conditions (optional)",
          },
          returning: {
            type: "array",
            items: { type: "string" },
            description: "Fields to return (optional)",
          },
        },
        required: ["table", "data"],
      },
    },
    {
      name: "delete_record",
      description: "Delete records from a Supabase table",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Table name",
          },
          filter: {
            type: "object",
            description: "Filter conditions (optional)",
          },
          returning: {
            type: "array",
            items: { type: "string" },
            description: "Fields to return (optional)",
          },
        },
        required: ["table"],
      },
    },
    {
      name: "upload_file",
      description: "Upload a file to Supabase Storage",
      inputSchema: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            description: "Storage bucket name",
          },
          path: {
            type: "string",
            description: "File path in bucket",
          },
          file: {
            type: "object",
            description: "File to upload",
          },
          options: {
            type: "object",
            properties: {
              cacheControl: { type: "string" },
              contentType: { type: "string" },
              upsert: { type: "boolean" },
            },
            description: "Upload options (optional)",
          },
        },
        required: ["bucket", "path", "file"],
      },
    },
    {
      name: "download_file",
      description: "Download a file from Supabase Storage",
      inputSchema: {
        type: "object",
        properties: {
          bucket: {
            type: "string",
            description: "Storage bucket name",
          },
          path: {
            type: "string",
            description: "File path in bucket",
          },
        },
        required: ["bucket", "path"],
      },
    },
    {
      name: "invoke_function",
      description: "Invoke a Supabase Edge Function",
      inputSchema: {
        type: "object",
        properties: {
          function: {
            type: "string",
            description: "Function name",
          },
          params: {
            type: "object",
            description: "Function parameters (optional)",
          },
          options: {
            type: "object",
            properties: {
              headers: { type: "object" },
              responseType: { 
                type: "string",
                enum: ["json", "text", "arraybuffer"],
              },
            },
            description: "Invocation options (optional)",
          },
        },
        required: ["function"],
      },
    },
    {
      name: "list_projects",
      description: "List all Supabase projects",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (!args) throw new Error('Arguments are required');

  try {
    switch (name) {
      case databaseToolNames.createRecord: {
        const validated = CreateRecordSchema.parse(args);
        return await runCreateRecordTool(supabase, validated);
      }
      case databaseToolNames.readRecords: {
        const validated = ReadRecordsSchema.parse(args);
        return await runReadRecordsTool(supabase, validated);
      }
      case databaseToolNames.updateRecord: {
        const validated = UpdateRecordSchema.parse(args);
        return await runUpdateRecordTool(supabase, validated);
      }
      case databaseToolNames.deleteRecord: {
        const validated = DeleteRecordSchema.parse(args);
        return await runDeleteRecordTool(supabase, validated);
      }
      case storageToolNames.uploadFile: {
        const validated = UploadFileSchema.parse(args);
        return await runUploadFileTool(supabase, validated);
      }
      case storageToolNames.downloadFile: {
        const validated = DownloadFileSchema.parse(args);
        return await runDownloadFileTool(supabase, validated);
      }
      case functionToolNames.invokeFunction: {
        const validated = InvokeFunctionSchema.parse(args);
        return await runInvokeFunctionTool(supabase, validated);
      }
      case functionToolNames.listProjects:
        return await runListProjectsTool(SUPABASE_ACCESS_TOKEN);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    throw error;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cursor Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
