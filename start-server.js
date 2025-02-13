#!/usr/bin/env node

// Load environment variables from .env file
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from 'dotenv';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the project root (two levels up if in build directory)
const envPath = resolve(__dirname, '..', '.env');
config({ path: envPath });

// Import and run the server
import('./index.js').catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 