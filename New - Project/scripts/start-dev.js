#!/usr/bin/env node

/**
 * Simple script to run both backend and frontend
 * Works without concurrently package
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🚀 Starting Mastra Insight Assistant (Backend + Frontend)\n');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Clean frontend .next directory before starting
const frontendNextPath = path.join(process.cwd(), 'frontend', '.next');
if (fs.existsSync(frontendNextPath)) {
  console.log(`${colors.blue}🧹 Cleaning frontend build cache...${colors.reset}`);
  try {
    fs.rmSync(frontendNextPath, { recursive: true, force: true });
    console.log(`${colors.green}✅ Build cache cleaned${colors.reset}\n`);
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Could not clean cache (may be in use): ${error.message}${colors.reset}\n`);
  }
}

console.log(`${colors.green}✅ Starting servers...${colors.reset}`);
console.log(`${colors.cyan}   Backend:  http://localhost:3000${colors.reset}`);
console.log(`${colors.magenta}   Frontend: http://localhost:3001${colors.reset}\n`);
console.log(`${colors.yellow}Press Ctrl+C to stop both servers${colors.reset}\n`);

// Start backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  shell: true,
  stdio: 'inherit',
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(process.cwd(), 'frontend'),
  shell: true,
  stdio: 'inherit',
});

// Handle process termination
const cleanup = () => {
  console.log('\n\n🛑 Stopping servers...\n');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  setTimeout(() => {
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  }, 2000);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Handle process errors
backend.on('error', (error) => {
  console.error(`${colors.cyan}[BACKEND ERROR]${colors.reset}`, error);
});

frontend.on('error', (error) => {
  console.error(`${colors.magenta}[FRONTEND ERROR]${colors.reset}`, error);
});

// Wait for processes to exit
Promise.all([
  new Promise((resolve) => backend.on('exit', resolve)),
  new Promise((resolve) => frontend.on('exit', resolve)),
]).then(() => {
  process.exit(0);
});
