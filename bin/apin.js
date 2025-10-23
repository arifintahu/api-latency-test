#!/usr/bin/env node

import { Command } from 'commander';
import {
  validateEnvironment,
  performLatencyTest,
  calculateMetrics,
  logResults,
  VERSION,
  DEFAULT_REQUEST_COUNT,
  DEFAULT_TIMEOUT,
  DEFAULT_DELAY,
} from '../latency-test.js';
import path from 'path';

const program = new Command();

program
  .name('apin')
  .description('A lightweight CLI tool to measure API performance through sequential HTTP requests')
  .version(VERSION)
  .argument('<url>', 'API endpoint URL to test')
  .option('-c, --count <number>', 'number of requests to perform', DEFAULT_REQUEST_COUNT)
  .option('-t, --timeout <number>', 'request timeout in milliseconds', DEFAULT_TIMEOUT)
  .option('-d, --delay <number>', 'delay between requests in milliseconds', DEFAULT_DELAY)
  .option('-l, --log-path <path>', 'path to save test results', path.join(process.env.HOME || process.env.USERPROFILE || '.', 'apin-results.json'))
  .action(async (url, options) => {
    try {
      // Parse and validate options
      const requestCount = parseInt(options.count, 10);
      const timeout = parseInt(options.timeout, 10);
      const delay = parseInt(options.delay, 10);
      const logPath = options.logPath;

      // Validate inputs
      if (!Number.isFinite(requestCount) || requestCount <= 0) {
        console.error('❌ Error: Count must be a positive number');
        process.exit(1);
      }

      if (!Number.isFinite(timeout) || timeout <= 0) {
        console.error('❌ Error: Timeout must be a positive number');
        process.exit(1);
      }

      if (!Number.isFinite(delay) || delay < 0) {
        console.error('❌ Error: Delay must be a non-negative number');
        process.exit(1);
      }

      // Validate URL
      try {
        new URL(url);
      } catch (error) {
        console.error(`❌ Error: Invalid URL format - ${error.message}`);
        process.exit(1);
      }

      // Set environment variables for the latency test functions
      process.env.API_URL = url;
      process.env.REQUEST_COUNT = requestCount.toString();
      process.env.REQUEST_TIMEOUT = timeout.toString();
      process.env.REQUEST_DELAY = delay.toString();
      process.env.LOG_FILE_PATH = logPath;

      console.log(`🔧 API Latency Testing Tool v${VERSION}`);
      console.log(`${'='.repeat(60)}`);

      // Validate environment (this will check the API_URL we just set)
      const validation = validateEnvironment();
      if (!validation.isValid) {
        console.error(`❌ Configuration Error: ${validation.errorMessage}`);
        process.exit(1);
      }

      console.log(`\n🎯 Starting API latency test...`);
      console.log(`📍 Target URL: ${url}`);
      console.log(`🔢 Number of requests: ${requestCount}`);
      console.log(`⏱️  Timeout: ${timeout}ms`);
      console.log(`⏳ Delay between requests: ${delay}ms`);
      console.log(`💾 Log file: ${path.resolve(logPath)}`);
      console.log(`${'='.repeat(60)}\n`);

      // Perform latency test
      const results = await performLatencyTest(url, requestCount);

      // Calculate metrics
      const metrics = calculateMetrics(results);

      // Display results
      displayResults(results, metrics);

      // Save to log file
      await logResults(url, results, metrics);

      // Exit with appropriate code
      const exitCode = metrics.failedRequests > 0 ? 1 : 0;
      process.exit(exitCode);

    } catch (error) {
      console.error(`❌ Unexpected error during testing: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }
  });

/**
 * Displays formatted results to console
 * @param {Array} results - Array of LatencyResult objects
 * @param {Object} metrics - Calculated metrics
 */
function displayResults(results, metrics) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 TEST RESULTS SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  
  // Individual request results
  console.log(`\n📋 Individual Request Results:`);
  console.log(`${'─'.repeat(60)}`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const statusText = result.success ? 'SUCCESS' : 'FAILED';
    const categoryText = result.success && result.category ? ` (${result.category})` : '';
    console.log(`${status} Request ${result.requestNumber}: ${result.latency}ms - ${statusText}${categoryText}`);
    if (!result.success && result.errorMessage) {
      console.log(`   └─ Error: ${result.errorMessage}`);
    }
  });
  
  // Summary metrics
  console.log(`\n📈 Performance Metrics:`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`🎯 Total Requests: ${metrics.totalRequests}`);
  console.log(`✅ Successful: ${metrics.successfulRequests}`);
  console.log(`❌ Failed: ${metrics.failedRequests}`);
  console.log(`📊 Success Rate: ${metrics.successRate}%`);
  
  if (metrics.successfulRequests > 0) {
    console.log(`⚡ Average Latency: ${metrics.averageLatency}ms`);
    console.log(`🏷️ Average Category: ${metrics.averageCategory}`);
    console.log(`🚀 Fastest Request: ${metrics.minLatency}ms`);
    console.log(`🐌 Slowest Request: ${metrics.maxLatency}ms`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
}

program.parse();