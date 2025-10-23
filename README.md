# API Latency Testing Tool

A lightweight CLI tool to measure API performance through sequential HTTP requests. Perfect for monitoring API latency, testing response times, and evaluating API performance under different conditions.

## Features

- 🚀 **Fast & Lightweight**: Minimal dependencies, maximum performance
- 📊 **Detailed Metrics**: Average, min, max latency with performance categorization
- 🎯 **Flexible Configuration**: Customizable request count, timeout, and delays
- 💾 **Persistent Logging**: JSON-formatted results with session tracking
- 🌐 **Global CLI**: Install once, use anywhere
- 📈 **Performance Categories**: Automatic categorization (Fast/Medium/Slow)

## Installation

### Global Installation (Recommended)

```bash
npm install -g apin
```

After global installation, you can use `apin` command from anywhere:

```bash
apin "https://api.example.com/health" --count 5 --timeout 30000 --delay 300
```

### Local Installation

```bash
npm install apin
```

Then run using npx:

```bash
npx apin "https://api.example.com/health" --count 5
```

## Usage

### Basic Usage

```bash
apin <url> [options]
```

### Examples

```bash
# Basic test with default settings (5 requests, 30s timeout, 300ms delay)
apin "https://jsonplaceholder.typicode.com/posts/1"

# Custom configuration
apin "https://api.example.com/health" --count 10 --timeout 5000 --delay 1000

# Save results to custom location
apin "https://api.example.com/users" --count 3 --log-path ./my-results.json

# Quick test with minimal delay
apin "https://httpbin.org/get" --count 2 --delay 100
```

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--count` | `-c` | Number of requests to perform | `5` |
| `--timeout` | `-t` | Request timeout in milliseconds | `30000` |
| `--delay` | `-d` | Delay between requests in milliseconds | `300` |
| `--log-path` | `-l` | Path to save test results | `~/latency-test-results.json` |
| `--version` | `-V` | Show version number | - |
| `--help` | `-h` | Show help information | - |

## Performance Categories

APIN automatically categorizes response times:

- **Fast (Excellent)**: < 300ms ⚡
- **Medium (Acceptable/Good)**: 300-1000ms 🟡
- **Slow (Poor/Unacceptable)**: > 1000ms 🔴

## Output Format

### Console Output
```
🔧 API Latency Testing Tool v1.0.0
============================================================

🎯 Starting API latency test...
📍 Target URL: https://jsonplaceholder.typicode.com/posts/1
🔢 Number of requests: 2
⏱️  Timeout: 10000ms
⏳ Delay between requests: 1000ms
💾 Log file: /home/user/latency-test-results.json
============================================================

🚀 Request 1: Starting...
✅ Request 1: 181ms (Status: 200) - Fast (Excellent)
🚀 Request 2: Starting...
✅ Request 2: 37ms (Status: 200) - Fast (Excellent)

============================================================
📊 TEST RESULTS SUMMARY
============================================================

📋 Individual Request Results:
────────────────────────────────────────────────────────────
✅ Request 1: 181ms - SUCCESS (Fast (Excellent))
✅ Request 2: 37ms - SUCCESS (Fast (Excellent))

📈 Performance Metrics:
────────────────────────────────────────────────────────────
🎯 Total Requests: 2
✅ Successful: 2
❌ Failed: 0
📊 Success Rate: 100%
⚡ Average Latency: 109ms
🏷️ Average Category: Fast (Excellent)
🚀 Fastest Request: 37ms
🐌 Slowest Request: 181ms
============================================================

💾 Results saved to: /home/user/latency-test-results.json
🆔 Session ID: bced0e2e-253e-4de8-93ca-a520f31e2e48
```

### JSON Log Format
```json
[
  {
    "sessionId": "bced0e2e-253e-4de8-93ca-a520f31e2e48",
    "timestamp": "2024-01-15T10:30:45.123Z",
    "apiUrl": "https://jsonplaceholder.typicode.com/posts/1",
    "configuration": {
      "requestCount": 2,
      "timeout": 10000,
      "delayMs": 1000
    },
    "evaluationCriteria": {
      "fast": "<300ms",
      "medium": "300-1000ms",
      "slow": ">1000ms"
    },
    "results": [
      {
        "requestNumber": 1,
        "latency": 181,
        "timestamp": "2024-01-15T10:30:45.123Z",
        "statusCode": 200,
        "success": true,
        "errorMessage": null,
        "category": "Fast (Excellent)"
      }
    ],
    "summary": {
      "totalRequests": 2,
      "successfulRequests": 2,
      "failedRequests": 0,
      "averageLatency": 109,
      "minLatency": 37,
      "maxLatency": 181,
      "successRate": 100,
      "averageCategory": "Fast (Excellent)"
    }
  }
]
```

## Exit Codes

- `0`: All requests successful
- `1`: One or more requests failed

## Requirements

- Node.js >= 18.0.0
- Internet connection for API testing

## Development

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd test-api-latency

# Install dependencies
npm install

# Test locally
node bin/apin.js "https://jsonplaceholder.typicode.com/posts/1" --count 2

# Link for global testing
npm link
apin "https://jsonplaceholder.typicode.com/posts/1" --count 2
```

### Project Structure

```
├── bin/
│   └── apin.js          # CLI entry point
├── latency-test.js      # Core testing logic
├── package.json         # Package configuration
└── README.md           # Documentation
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the project repository.