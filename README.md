# 🔄 Base64 File Converter API

A lightweight Node.js/Express API for converting files ↔ Base64

## 🚀 Quick Start

### 1. Install & Run
```bash
npm install
npm start
```

Server runs on **http://localhost:3000**

### 2. Health Check
```bash
curl http://localhost:3000/health
```

### 3. Encode File to Base64
```bash
curl -X POST http://localhost:3000/encode \
  -F "file=@./myfile.txt"
```

### 4. Decode Base64 to File
```bash
curl -X POST http://localhost:3000/decode \
  -H "Content-Type: application/json" \
  -d '{"base64": "SGVsbG8gV29ybGQh", "filename": "output.txt"}' \
  --output output.txt
```

---

## 📖 Documentation

### 📋 Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/encode` | Upload file → Get Base64 JSON |
| POST | `/decode` | Send Base64 → Get file binary |
| GET | `/health` | Server health check |
| GET | `/` | API documentation |

### 🔗 API Specification

Full OpenAPI/Swagger specification: **[openapi.yml](openapi.yml)**

View in Swagger UI: https://editor.swagger.io/ → Upload `openapi.yml`

### 📚 Curl Examples

Comprehensive curl command examples: **[CURL_EXAMPLES.md](CURL_EXAMPLES.md)**

Includes:
- Basic usage examples
- Advanced scenarios
- Batch operations
- Error handling
- PowerShell examples
- Performance testing

---

## 💻 Configuration

File: `.env`

```env
PORT=3000
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

Change as needed, then restart server.

---

## 📤 POST /encode

**Upload a file and receive Base64 encoded string**

### Request
```bash
curl -X POST http://localhost:3000/encode \
  -F "file=@/path/to/file.txt"
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "filename": "document.pdf",
    "base64": "JVBERi0xLjQKJeLjz9MNCjEgMCBvYm...",
    "mimeType": "application/pdf",
    "fileSize": 2048
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 50MB"
}
```

---

## 📥 POST /decode

**Send Base64 and receive file binary**

### Request
```bash
curl -X POST http://localhost:3000/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "SGVsbG8gV29ybGQh",
    "filename": "output.txt",
    "sourceFile": "/path/to/source.txt"  # optional - auto-delete after conversion
  }' \
  --output output.txt
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `base64` | string | Yes | Base64 encoded string |
| `filename` | string | No | Output filename (default: output.bin) |
| `sourceFile` | string | No | Path to delete after conversion |

### Response (Success)
Binary file attachment (Content-Type: application/octet-stream)

### Response (Error)
```json
{
  "success": false,
  "error": "Invalid Base64 string format"
}
```

---

## 🏥 GET /health

**Health check endpoint**

### Request
```bash
curl http://localhost:3000/health
```

### Response
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-04-06T06:42:20.000Z"
}
```

---

## 📖 GET /

**API Documentation**

### Request
```bash
curl http://localhost:3000/
```

### Response
```json
{
  "version": "1.0.0",
  "endpoints": {
    "/encode": {
      "method": "POST",
      "description": "Convert file to Base64",
      "example": "curl -F 'file=@test.txt' http://localhost:3000/encode"
    },
    "/decode": {
      "method": "POST",
      "description": "Convert Base64 to file",
      "example": "curl -X POST http://localhost:3000/decode -H 'Content-Type: application/json' -d '{...}'"
    },
    ...
  }
}
```

---

## 🎯 Real-World Examples

### Example 1: Encode Image
```bash
# Encode image to Base64
curl -s -X POST http://localhost:3000/encode \
  -F "file=@./photo.jpg" \
  | jq '.data.base64' > image.b64

echo "Image encoded to: image.b64"
```

### Example 2: Decode & Auto-Delete
```bash
# Convert Base64 to file and delete source
curl -X POST http://localhost:3000/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "'"$(cat data.b64)"'",
    "filename": "restored.jpg",
    "sourceFile": "/path/to/data.b64"
  }' \
  --output restored.jpg

echo "✅ File restored and source deleted"
```

### Example 3: Roundtrip Test
```bash
# Encode → Decode → Compare
ORIGINAL="test.txt"

# Encode
BASE64=$(curl -s -X POST http://localhost:3000/encode \
  -F "file=@$ORIGINAL" \
  | jq -r '.data.base64')

# Decode
curl -X POST http://localhost:3000/decode \
  -H "Content-Type: application/json" \
  -d "{\"base64\": \"$BASE64\", \"filename\": \"restored.txt\"}" \
  --output restored.txt

# Verify
if diff "$ORIGINAL" restored.txt > /dev/null; then
  echo "✅ Files match perfectly!"
else
  echo "❌ Files differ"
fi
```

---

## ⚙️ Tech Stack

- **Framework**: Express.js
- **File Upload**: Multer
- **Config**: dotenv
- **Node.js**: v14+

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "multer": "^1.4.5-lts.1",
  "dotenv": "^16.0.3"
}
```

## 🛠️ Dev Dependencies

```json
{
  "nodemon": "^2.0.20"
}
```

---

## 🚦 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | N/A |
| 400 | Bad Request | Check parameters (missing `base64` or invalid format) |
| 413 | Payload Too Large | Increase `MAX_FILE_SIZE` in .env |
| 500 | Server Error | Check server logs |

---

## 📊 Limits

- **Max File Size**: 50MB (configurable in `.env`)
- **Supported Formats**: All file types
- **Base64 Validation**: Strict RFC 4648 compliance

---

## 🔒 Notes

- Files are stored in **memory** during processing (no disk I/O)
- Binary responses automatically set `Content-Disposition: attachment`
- Source file deletion is **asynchronous** (doesn't block response)

---

## 📝 Examples Directory

See **[CURL_EXAMPLES.md](CURL_EXAMPLES.md)** for:
- ✅ Basic usage
- ✅ Advanced scenarios  
- ✅ Batch operations
- ✅ Error handling
- ✅ PowerShell examples
- ✅ Performance testing

---

## 📐 API Specification

Full OpenAPI 3.0.0 spec: **[openapi.yml](openapi.yml)**

Use with:
- **Swagger UI**: https://editor.swagger.io/
- **Postman**: Import OpenAPI spec
- **VS Code**: OpenAPI Extension

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill process using port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
```

### File too large error
Increase `MAX_FILE_SIZE` in `.env`:
```env
MAX_FILE_SIZE=104857600  # 100MB
```

Then restart server: `npm start`

### Base64 validation fails
Ensure Base64 string:
- Contains only `[A-Za-z0-9+/=]`
- Length is divisible by 4 (with optional padding)
- No whitespace

---

## 📄 License

MIT

---

## 📧 Support

For issues or questions:
1. Check [CURL_EXAMPLES.md](CURL_EXAMPLES.md)
2. Review [openapi.yml](openapi.yml)
3. Check server logs: `npm start` (without background flag)

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-06
