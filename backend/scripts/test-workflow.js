/**
 * This script is used to test the GitHub Actions workflow.
 * It performs a simple check to ensure the environment is set up correctly.
 */

console.log('Starting workflow test...');

// Check if required environment variables are set
const requiredEnvVars = ['NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
} else {
  console.log('All required environment variables are set.');
}

// Check Node.js version
console.log(`Node.js version: ${process.version}`);

// Check if MongoDB module is available
try {
  require('mongoose');
  console.log('MongoDB module (mongoose) is available.');
} catch (error) {
  console.error('Error loading MongoDB module:', error.message);
  process.exit(1);
}

// Check if Express module is available
try {
  require('express');
  console.log('Express module is available.');
} catch (error) {
  console.error('Error loading Express module:', error.message);
  process.exit(1);
}

console.log('Workflow test completed successfully!');
