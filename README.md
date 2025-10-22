# API Latency Testing Tool

A lightweight JavaScript-based command-line tool designed to measure and monitor API performance through sequential HTTP requests, providing detailed latency metrics and historical tracking capabilities.

## Features

- 🚀 **Sequential Request Testing**: Performs 5 consecutive GET requests to measure API latency
- ⚡ **Real-time Monitoring**: Displays individual request latencies as they complete
- 📊 **Comprehensive Metrics**: Calculates average, minimum, and maximum latencies
- 💾 **Historical Logging**: Saves all test results to JSON log files with timestamps
- 🛡️ **Robust Error Handling**: Handles network issues, timeouts, and invalid responses
- 🔧 **Environment Configuration**: Uses environment variables for flexible setup
- 📈 **Success Rate Tracking**: Monitors request success/failure rates

## Requirements

- Node.js 18.0.0 or higher
- Internet connection (for testing external APIs)

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** and set your API URL:
   ```bash
   API_URL=https://your-api-endpoint.com/path
   ```

3. **Run the test:**
   ```bash
   npm start
   # or
   node latency-test.js
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_URL` | ✅ Yes | - | The API endpoint URL to test |
| `REQUEST_COUNT` | ❌ No | 5 | Number of sequential requests to perform |
| `REQUEST_TIMEOUT` | ❌ No | 30000 | Request timeout in milliseconds |
| `LOG_FILE_PATH` | ❌ No | `./latency-test-results.json` | Path to save historical results |

### Example Configuration

```bash
# Required
API_URL=http://localhost:8081/v1/treasury/timeseries?request_id=0xee17D0A243361997245A0EBA740e26020952f249&balance_addresses=cosmos10z4zxezrqx2lwxcluf7rm9vqf93d2pwfsrvlat

# Optional
REQUEST_COUNT=7
REQUEST_TIMEOUT=30000
LOG_FILE_PATH=./my-api-tests.json
```

## Usage Examples

### Basic Usage
```bash
# Set API URL and run test
export API_URL="https://jsonplaceholder.typicode.com/posts/1"
npm start
```

### Testing Different APIs
```bash
# Test GitHub API
export API_URL="https://api.github.com/users/octocat"
node latency-test.js

# Test with custom timeout
export API_URL="https://httpbin.org/delay/2"
export REQUEST_TIMEOUT=5000
node latency-test.js
```

## Latency Evaluation

This tool categorizes latency using practical user-perception thresholds:

| Category | Latency Range | Description | User Perception |
|---------|---------------|-------------|-----------------|
| Fast (Excellent) | < 100–300 ms | Ideal for most user-facing APIs; feels instantaneous. Common in high-performance systems like e-commerce or social media. | No noticeable delay; seamless experience. |
| Medium (Acceptable/Good) | 300–1000 ms (≈1 second) | Noticeable but tolerable for standard web APIs; suitable for moderately complex operations like data fetches. Beyond 500 ms, users may start feeling a slight wait. | Minor interruption, but flow isn't broken. |
| Slow (Poor/Unacceptable) | > 1000 ms (>1 second) | Degrades performance significantly; users may abandon requests at 2–10 seconds. Critical for optimization in production. | Frustrating wait; high risk of timeouts or user drop-off. |

During the test run, each request and the average latency are labeled with these categories.

## Sample Output

```
🔧 API Latency Testing Tool v1.0.0
============================================================

🎯 Starting API latency test...
📍 Target URL: https://jsonplaceholder.typicode.com/posts/1
🔢 Number of requests: 5
⏱️  Timeout: 30000ms
============================================================

🚀 Request 1/5: Starting...
✅ Request 1/5: 245ms (Status: 200) (Fast (Excellent))
🚀 Request 2/5: Starting...
✅ Request 2/5: 198ms (Status: 200)
🚀 Request 3/5: Starting...
✅ Request 3/5: 223ms (Status: 200)
🚀 Request 4/5: Starting...
✅ Request 4/5: 201ms (Status: 200)
🚀 Request 5/5: Starting...
✅ Request 5/5: 189ms (Status: 200)

============================================================
📊 TEST RESULTS SUMMARY
============================================================

📋 Individual Request Results:
────────────────────────────────────────────────────────────
✅ Request 1: 245ms - SUCCESS
✅ Request 2: 198ms - SUCCESS
✅ Request 3: 223ms - SUCCESS
✅ Request 4: 201ms - SUCCESS
✅ Request 5: 189ms - SUCCESS

📈 Performance Metrics:
────────────────────────────────────────────────────────────
🎯 Total Requests: 5
✅ Successful: 5
❌ Failed: 0
📊 Success Rate: 100%
⚡ Average Latency: 211ms
🚀 Fastest Request: 189ms
🐌 Slowest Request: 245ms
============================================================

💾 Results saved to: /path/to/latency-test-results.json
🆔 Session ID: 12345678-1234-4567-8901-123456789012
```

## Log File Format

The tool saves detailed results in JSON format:

```json
[
  {
    "sessionId": "12345678-1234-4567-8901-123456789012",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "apiUrl": "https://jsonplaceholder.typicode.com/posts/1",
    "configuration": {
      "requestCount": 5,
      "timeout": 30000
    },
    "results": [
      {
        "requestNumber": 1,
        "latency": 245,
        "timestamp": "2024-01-15T10:30:01.245Z",
        "statusCode": 200,
        "success": true,
        "errorMessage": null
      }
    ],
    "summary": {
      "totalRequests": 5,
      "successfulRequests": 5,
      "failedRequests": 0,
      "averageLatency": 211,
      "minLatency": 189,
      "maxLatency": 245,
      "successRate": 100
    }
  }
]
```

## Error Handling

The tool handles various error scenarios:

### Network Connectivity Issues
```
❌ Request 1/5: Failed - Network connectivity issue: getaddrinfo ENOTFOUND
```

### Request Timeouts
```
❌ Request 2/5: Failed - Request timeout after 30000ms
```

### HTTP Errors
```
❌ Request 3/5: Failed - HTTP 404: Not Found
```

### Missing Environment Variables
```
❌ Configuration Error: API_URL environment variable is required
```

## Exit Codes

- `0`: All requests successful
- `1`: One or more requests failed or configuration error

## Troubleshooting

### Common Issues

1. **"API_URL environment variable is required"**
   - Create a `.env` file with `API_URL=your-endpoint`
   - Or set the environment variable: `export API_URL="your-endpoint"`

2. **"Invalid API_URL format"**
   - Ensure the URL includes protocol (http:// or https://)
   - Check for proper URL encoding of query parameters

3. **"Request timeout"**
   - Increase timeout: `REQUEST_TIMEOUT=60000`
   - Check if the API endpoint is accessible

4. **"Network connectivity issue"**
   - Verify internet connection
   - Check if the API endpoint is reachable
   - Verify firewall settings

### Debug Mode

For additional debugging, you can check the log file for detailed error information and request history.

## API Integration Examples

### Treasury API (from your example)
```bash
API_URL="http://localhost:8081/v1/treasury/timeseries?request_id=0xee17D0A243361997245A0EBA740e26020952f249&balance_addresses=cosmos10z4zxezrqx2lwxcluf7rm9vqf93d2pwfsrvlat,osmo10z4zxezrqx2lwxcluf7rm9vqf93d2pwfccl0te&from_date=2025-10-11T02%3A20%3A40.648Z&to_date=2025-10-20T02%3A20%3A40.648Z&source=balance&granularity=10minutes"
```

### Public APIs for Testing
```bash
# JSONPlaceholder (always available)
API_URL="https://jsonplaceholder.typicode.com/posts/1"

# HTTPBin (with artificial delay)
API_URL="https://httpbin.org/delay/1"

# GitHub API
API_URL="https://api.github.com/users/octocat"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the log files for detailed error information
3. Create an issue with detailed error messages and configuration