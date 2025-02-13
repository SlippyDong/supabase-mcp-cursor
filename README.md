# Supabase MCP Server for Cursor

A Model Context Protocol (MCP) server that provides tools for interacting with Supabase databases, storage, and edge functions. This fork has been specifically modified to work with Cursor IDE and provides a focused set of essential Supabase operations.

## Overview

The Supabase MCP server acts as a bridge between Cursor and Supabase's services, providing:

- Database CRUD operations
- Storage file management
- Edge function invocation
- Project listing

## Architecture

The server is built using TypeScript and follows a modular architecture:

```
supabase-mcp/
├── src/
│   ├── index.ts              # Main server implementation
│   ├── tools/
│   │   ├── database.ts       # Database operations
│   │   ├── storage.ts        # Storage operations
│   │   └── functions.ts      # Edge functions (invoke, list projects)
│   └── types/
│       └── supabase.d.ts     # Type definitions
├── build/                    # Compiled JavaScript files
├── package.json
├── tsconfig.json
├── start-server.js          # Server startup script
├── config.json              # Configuration file
└── .env                     # Environment variables
```

## Prerequisites

- Node.js 16.x or higher
- A Supabase project with:
  - Project URL
  - Service Role Key (for admin operations)

## Installation

1. Clone the repository to a folder that does not contain spaces - e.g. C:\Development\MCP\supabase-mcp-cursor
The path to the server CAN NOT CONTAIN ANY SPACES or cursor will not be able to start the server and will only show: No tools found.
```bash
git clone https://github.com/SlippyDong/supabase-mcp-cursor.git
cd supabase-mcp-cursor
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```bash
SUPABASE_URL=your_project_url_here
SUPABASE_KEY=your_service_role_key_here # Set the anon key or the service role key
SUPABASE_ACCESS_TOKEN=your_access_token_here # For management operations (not implemented in this fork but required for the server to start)
```

4. Build the server:
```bash
npm run build
```

5. Start the server (for testing purposes):
```bash
npm start
```
The server should start without errors and show: Cursor Tools MCP Server running on stdio
CTRL+C to stop the server.

6. To check if cursor is also able to start the server, run the following command:
```bash
node build/start-server.js
```
You should see Cursor Tools MCP Server running on stdio
CTRL+C to stop the server.


7. Open the Cursor IDE and add the MCP server in: File > Preferences > Cursor Settings > Features > MCP Servers > Add MCP Server
- Provide a name for the server
- Select type: Command
- command: node.exe C:\Full\Path\To\This\Repository\without\spaces\supabase-mcp-cursor\build\start-server.js

Cursor will start the server and you should see a CMD window open and 2 node services running in task manager.
The server connection should turn green and a list with tools should be visible.

### IMPORTANT NOTES
- The path to the server CAN NOT CONTAIN ANY SPACES.
- Adding MCP servers to Cursor can be buggy - If you already have another MCP server added and running, you may need to restart cursor and/or kill the already running node processes in task manager first and then refresh the MCP servers in cursor. Restarting cursor may work but it's not always reliable and killing the node processes is more reliable. Just open task manager, expand the cursor process, kill the node processes and then add the server or refresh the MCP servers in cursor.


## Available Tools

### Database Operations
If you are using the anonymous key, make sure RLS is (temporarily) disabled on the table you are trying to access (for the service role key) or the request will fail. You can find the RLS settings in the table under the Auth policies button in the Table Editor. If you are using the service role key, RLS is automatically bypassed.


#### create_record
Create a new record in a table.
```typescript
{
  table: string;
  data: Record<string, any>;
  returning?: string[];
}
```

#### read_records
Read records from a table with optional filtering and field selection.
```typescript
{
  table: string;
  select?: string[];
  filter?: Record<string, any>;
}
```

#### update_record
Update records in a table.
```typescript
{
  table: string;
  data: Record<string, any>;
  filter?: Record<string, any>;
  returning?: string[];
}
```

#### delete_record
Delete records from a table.
```typescript
{
  table: string;
  filter?: Record<string, any>;
  returning?: string[];
}
```

### Storage Operations

#### upload_file
Upload a file to Supabase Storage.
```typescript
{
  bucket: string;
  path: string;
  file: any; // Can accept various file types/formats
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}
```

#### download_file
Download a file from Supabase Storage.
```typescript
{
  bucket: string;
  path: string;
}
```

### Function Operations

#### invoke_function
Invoke a Supabase Edge Function.
```typescript
{
  function: string;
  params?: Record<string, any>;
  options?: {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text' | 'arraybuffer';
  };
}
```

### Project Operations

#### list_projects
List all available Supabase projects.
```typescript
{
  random_string: string; // Required parameter for the tool to function
}
```

## Configuration

The server can be configured through environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| SUPABASE_URL | Your Supabase project URL | Yes |
| SUPABASE_KEY | Your Supabase service role key | Yes |
| SUPABASE_ACCESS_TOKEN | Your Supabase access token | Yes |

## Notes

- This is a modified version of the original Supabase MCP server, optimized for use with Cursor IDE
- Configuration options have been removed
- Project and organization management tools have been removed
- User authentication and management tools have been removed
- Role-based access control tools have been removed
- The tools have been reorganized into tool-groups in the tools directory: database, storage, functions
