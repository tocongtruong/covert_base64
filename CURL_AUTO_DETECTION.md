# 🎯 Curl Commands - Auto MIME Type Detection

Updated curl examples for Base64 File Converter API with auto file type detection

## 📤 Auto-Detection in /decode Endpoint

### 1. **Decode Base64 without filename (Auto-generate with correct extension)**

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAABdXdX..."
  }' \
  --output result.mp4
```

**Result:**
- ✅ Filename auto-detected: `file_1775459552032_E5E2IU.mp4`
- ✅ MIME Type auto-detected: `video/mp4`
- ✅ Extension auto-appended: `.mp4`

---

### 2. **Decode with custom filename (Auto-append correct extension)**

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "filename": "my_photo"
  }' \
  --output my_photo.png
```

**Result:**
- Input filename: `my_photo`
- ✅ Output filename: `my_photo.png` (extension auto-appended)
- ✅ MIME Type: `image/png`

---

### 3. **Decode with auto-delete source file**

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "JVBERi0xLjQKCjEgMCBvYmoKPDwK...",
    "filename": "document",
    "sourceFile": "/root/covert_base64/text.txt"
  }' \
  --output document.pdf
```

**Result:**
- ✅ File decoded as `document.pdf`
- ✅ Source file auto-deleted after conversion
- ✅ MIME Type: `application/pdf`

---

### 4. **Disable auto-detection (manual MIME type)**

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "SGVsbG8gV29ybGQh",
    "filename": "output.txt",
    "autoDetect": false
  }' \
  --output output.txt
```

**Result:**
- Uses provided filename exactly
- ✅ MIME Type: `application/octet-stream` (default)

---

## 🔍 Getting Detected Info from Response Headers

### Check what was detected:

```bash
curl -i -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAABdXdX..."
  }' \
  --output video.mp4
```

**Response Headers:**
```
x-detected-filename: file_1775459552032_E5E2IU.mp4
x-detected-mime-type: video/mp4
content-type: video/mp4
```

---

## 🎬 Real-World Examples

### Example 1: Convert MP4 Video

File signature: `00 00 00 18 66 74 79 70` (ftyp)

```bash
# Read Base64 from file and decode
BASE64=$(cat video.b64)

curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d "{\"base64\": \"$BASE64\"}" \
  --output video.mp4
```

**Auto-detected as:** `video/mp4` ✅

---

### Example 2: Convert PDF Document

File signature: `25 50 44 46` (%PDF)

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "JVBERi0xLjQKJeLjz9MNCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iCjIgMCBvYmoK..."
  }' \
  --output report.pdf
```

**Auto-detected as:** `application/pdf` ✅

---

### Example 3: Convert PNG Image

File signature: `89 50 4E 47 0D 0A 1A 0A`

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }' \
  --output image.png
```

**Auto-detected as:** `image/png` ✅

---

### Example 4: Convert ZIP Archive

File signature: `50 4B 03 04`

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "UEsDBBQACAAIAFl+ZVYAAAAAAAAAAAAAAAAJAAAAZmlsZS50eHTt...",
    "filename": "archive"
  }' \
  --output archive.zip
```

**Auto-detected as:** `application/zip` ✅

---

### Example 5: Convert DOCX Document

File signature: `50 4B 03 04` (with 'word' marker at offset 30)

```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{
    "base64": "UEsDBBQACAAIAIl+ZVb8u+0KGgEAAKADAAC4Gw0"
  }' \
  --output document.docx
```

**Auto-detected as:** `application/vnd.openxmlformats-officedocument.wordprocessingml.document` ✅

---

## 📋 Supported Formats & Auto-Detection

| Type | Format | Magic Bytes | Extension |
|------|--------|------------|-----------|
| **Video** | MP4 | `00 00 00 18 66 74 79 70` | `.mp4` |
| **Video** | MKV | `1A 45 DF A3` | `.mkv` |
| **Video** | AVI | `52 49 46 46 ... 41 56 49` | `.avi` |
| **Audio** | MP3 | `FF FB` | `.mp3` |
| **Audio** | WAV | `52 49 46 46 ... 57 41 56 45` | `.wav` |
| **Image** | PNG | `89 50 4E 47 0D 0A 1A 0A` | `.png` |
| **Image** | JPEG | `FF D8 FF` | `.jpg` |
| **Image** | GIF | `47 49 46 38` | `.gif` |
| **Image** | BMP | `42 4D` | `.bmp` |
| **Image** | WebP | `52 49 46 46 ... 57 45 42 50` | `.webp` |
| **Document** | PDF | `25 50 44 46` | `.pdf` |
| **Document** | DOCX | `50 4B 03 04 ... 77 6F 72 64` | `.docx` |
| **Document** | XLSX | `50 4B 03 04 ... 78 6C` | `.xlsx` |
| **Document** | PPTX | `50 4B 03 04 ... 70 6C` | `.pptx` |
| **Archive** | ZIP | `50 4B 03 04` | `.zip` |
| **Archive** | RAR | `52 61 72 21` | `.rar` |
| **Archive** | 7Z | `37 7A BC AF` | `.7z` |
| **Archive** | GZIP | `1F 8B 08` | `.gz` |
| **Text** | XML | `3C 3F 78 6D` | `.xml` |
| **Text** | HTML | `3C 68 74 6D` | `.html` |

---

## 🧪 Test Auto-Detection Script

Run the included test script to verify all file types:

```bash
node test-detection.js
```

**Output:**
```
=== Testing Auto MIME Type Detection ===

Test 1: MP4 Video (with custom name)
  Input name: myvideo
  Output filename: myvideo.mp4
  MIME Type: video/mp4

Test 2: PNG Image (with custom name)
  Input name: myimage
  Output filename: myimage.png
  MIME Type: image/png

Test 3: PDF Document (no custom name)
  Input name: Auto-generated
  Output filename: file_1775459552032_E5E2IU.pdf
  MIME Type: application/pdf

Test 4: JPEG Image
  Input name: Auto-generated
  Output filename: file_1775459552033_HM7BRB.jpg
  MIME Type: image/jpeg

=== All tests passed! ===
```

---

## 📝 PowerShell Examples

### PowerShell - Auto-detect MP4

```powershell
$base64 = Get-Content "video.b64" -Raw
$body = @{
    base64 = $base64
    filename = "myvideo"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://165.232.170.175:3111/decode" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

Write-Host "✅ Filename: $($response.Headers['x-detected-filename'])"
Write-Host "✅ MIME Type: $($response.Headers['x-detected-mime-type'])"
```

---

## 🔄 Roundtrip Example (Encode → Decode with Auto-Detection)

```bash
# Step 1: Encode file to Base64
curl -X POST http://165.232.170.175:3111/encode \
  -F "file=@/path/to/video.mp4" \
  | jq -r '.data.base64' > video.b64

# Step 2: Decode and auto-detect
BASE64=$(cat video.b64)
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d "{\"base64\": \"$BASE64\", \"filename\": \"restored\"}" \
  --output restored.mp4

# Step 3: Verify
echo "✅ Files match: $(diff /path/to/video.mp4 restored.mp4 && echo YES || echo NO)"
```

---

## ⚡ Quick Reference

**Auto-generate name from Base64:**
```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{"base64": "..BASE64_HERE.."}' \
  -O  # Auto-download with detected filename
```

**Custom name + auto-extension:**
```bash
curl -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{"base64": "..BASE64_HERE..", "filename": "myfile"}' \
  --output myfile  # Will become myfile.mp4 (etc.)
```

**Check what was detected:**
```bash
curl -i -X POST http://165.232.170.175:3111/decode \
  -H "Content-Type: application/json" \
  -d '{"base64": "..BASE64_HERE.."}' | grep "x-detected"
```

---

Generated: 2026-04-06
API Version: 1.0.0 with Auto-Detection
