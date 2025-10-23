#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const VERSION = '1.0.0';

// Configuration constants
const DEFAULT_REQUEST_COUNT = 5;
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_DELAY = 300; // 300 miliseconds
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './latency-test-results.json';

function getConfiguredTimeout() {
  const raw = process.env.REQUEST_TIMEOUT;
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT;
  }
  return parsed;
}

function getConfiguredDelay() {
  const raw = process.env.REQUEST_DELAY;
  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_DELAY;
  }
  return parsed;
}

// Latency evaluation helpers
function categorizeLatency(latencyMs) {
  if (latencyMs < 300) return 'Fast (Excellent)';
  if (latencyMs <= 1000) return 'Medium (Acceptable/Good)';
  return 'Slow (Poor/Unacceptable)';
}

/**
 * Generates a simple UUID v4 string
 * @returns {string} UUID v4 string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validates environment configuration
 * @returns {Object} Validation result with isValid boolean and errorMessage string
 */
function validateEnvironment() {
  const apiUrl = process.env.API_URL;
  
  if (!apiUrl) {
    return {
      isValid: false,
      errorMessage: 'API_URL environment variable is required. Please set it in your .env file or environment.'
    };
  }

  // Basic URL validation
  try {
    new URL(apiUrl);
  } catch (error) {
    return {
      isValid: false,
      errorMessage: `Invalid API_URL format: ${error.message}`
    };
  }

  return {
    isValid: true,
    errorMessage: null
  };
}

/**
 * Performs a single HTTP request and measures latency
 * @param {string} apiUrl - The API endpoint URL
 * @param {number} requestNumber - The request number (1-based)
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Object>} LatencyResult object
 */
async function performSingleRequest(apiUrl, requestNumber, timeout = DEFAULT_TIMEOUT) {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`🚀 Request ${requestNumber}: Starting...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'API-Latency-Tester/1.0.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    const result = {
      requestNumber,
      latency,
      timestamp,
      statusCode: response.status,
      success: response.ok,
      errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
      category: response.ok ? categorizeLatency(latency) : null
    };
    
    console.log(`✅ Request ${requestNumber}: ${latency}ms (Status: ${response.status})${result.category ? ` - ${result.category}` : ''}`);
    return result;
    
  } catch (error) {
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    let errorMessage = 'Unknown error';
    if (error.name === 'AbortError') {
      errorMessage = `Request timeout after ${timeout}ms`;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = `Network connectivity issue: ${error.message}`;
    } else {
      errorMessage = error.message;
    }
    
    const result = {
      requestNumber,
      latency,
      timestamp,
      statusCode: 0,
      success: false,
      errorMessage,
      category: null
    };
    
    console.log(`❌ Request ${requestNumber}: Failed - ${errorMessage}`);
    return result;
  }
}

/**
 * Performs latency testing with multiple sequential requests
 * @param {string} apiUrl - The API endpoint URL
 * @param {number} requestCount - Number of requests to perform
 * @returns {Promise<Object>} Test results with individual results and summary
 */
async function performLatencyTest(apiUrl, requestCount = DEFAULT_REQUEST_COUNT) {
  const timeout = getConfiguredTimeout();
  const delayMs = getConfiguredDelay();
  
  const results = [];
  
  for (let i = 1; i <= requestCount; i++) {
    const result = await performSingleRequest(apiUrl, i, timeout);
    results.push(result);
    
    if (i < requestCount) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

/**
 * Calculates metrics from test results
 * @param {Array} results - Array of LatencyResult objects
 * @returns {Object} Calculated metrics
 */
function calculateMetrics(results) {
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  if (successfulResults.length === 0) {
    return {
      totalRequests: results.length,
      successfulRequests: 0,
      failedRequests: results.length,
      averageLatency: 0,
      minLatency: 0,
      maxLatency: 0,
      successRate: 0,
      averageCategory: 'N/A'
    };
  }
  
  const latencies = successfulResults.map(r => r.latency);
  const averageLatency = Math.round(latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const successRate = Math.round((successfulResults.length / results.length) * 100);
  
  return {
    totalRequests: results.length,
    successfulRequests: successfulResults.length,
    failedRequests: failedResults.length,
    averageLatency,
    minLatency,
    maxLatency,
    successRate,
    averageCategory: categorizeLatency(averageLatency)
  };
}

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

/**
 * Saves test results to log file
 * @param {string} apiUrl - The API endpoint URL
 * @param {Array} results - Array of LatencyResult objects
 * @param {Object} metrics - Calculated metrics
 */
async function logResults(apiUrl, results, metrics) {
  const sessionId = generateUUID();
  const timestamp = new Date().toISOString();
  
  const configuredRequestCount = parseInt(process.env.REQUEST_COUNT) || DEFAULT_REQUEST_COUNT;
  const configuredTimeout = getConfiguredTimeout();
  const configuredDelay = getConfiguredDelay();

  const logEntry = {
    sessionId,
    timestamp,
    apiUrl,
    configuration: {
      requestCount: configuredRequestCount,
      timeout: configuredTimeout,
      delayMs: configuredDelay
    },
    evaluationCriteria: {
      fast: '<300ms',
      medium: '300-1000ms',
      slow: '>1000ms'
    },
    results,
    summary: metrics
  };
  
  try {
    let existingLogs = [];
    
    if (fs.existsSync(LOG_FILE_PATH)) {
      const fileContent = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      if (fileContent.trim()) {
        existingLogs = JSON.parse(fileContent);
      }
    }
    
    if (!Array.isArray(existingLogs)) {
      existingLogs = [];
    }
    
    existingLogs.push(logEntry);
    
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(existingLogs, null, 2));
    
    console.log(`💾 Results saved to: ${path.resolve(LOG_FILE_PATH)}`);
    console.log(`🆔 Session ID: ${sessionId}`);
    
  } catch (error) {
    console.error(`❌ Failed to save results to log file: ${error.message}`);
  }
}

/**
 * Main function that orchestrates the entire testing process
 */
async function main() {
  console.log(`🔧 API Latency Testing Tool v1.0.0`);
  console.log(`${'='.repeat(60)}`);
  
  // Validate environment
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.error(`❌ Configuration Error: ${validation.errorMessage}`);
    console.log(`\n💡 Quick Setup:`);
    console.log(`   1. Create a .env file in the project root`);
    console.log(`   2. Add: API_URL=your_api_endpoint_here`);
    console.log(`   3. Run the script again`);
    process.exit(1);
  }
  
  const apiUrl = process.env.API_URL;
  const envRequestCount = parseInt(process.env.REQUEST_COUNT);
  const requestCount = Number.isFinite(envRequestCount) && envRequestCount > 0 ? envRequestCount : DEFAULT_REQUEST_COUNT;
  
  try {
    // Perform latency test
    const results = await performLatencyTest(apiUrl, requestCount);
    
    // Calculate metrics
    const metrics = calculateMetrics(results);
    
    // Display results
    displayResults(results, metrics);
    
    // Save to log file
    await logResults(apiUrl, results, metrics);
    
    // Exit with appropriate code
    const exitCode = metrics.failedRequests > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error(`❌ Unexpected error during testing: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the main function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export { 
  validateEnvironment, 
  performLatencyTest, 
  performSingleRequest,
  calculateMetrics, 
  logResults, 
  displayResults,
  categorizeLatency,
  getConfiguredTimeout,
  getConfiguredDelay,
  generateUUID,
  VERSION,
  DEFAULT_REQUEST_COUNT,
  DEFAULT_TIMEOUT,
  DEFAULT_DELAY,
};