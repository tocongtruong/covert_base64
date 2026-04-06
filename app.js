const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { fileToBase64, base64ToBuffer, isValidBase64 } = require('./utils/converter');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB default

// Middleware
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Multer configuration for file upload
const storage = multer.memoryStorage(); // Store in memory for processing
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all file types
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next(err);
};

/**
 * POST /encode
 * Converts uploaded file to Base64
 * 
 * Form-data:
 *   - file: (multipart file)
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "filename": "example.txt",
 *       "base64": "VGhpcyBpcyBhIHRlc3Q=",
 *       "mimeType": "text/plain",
 *       "fileSize": 16
 *     }
 *   }
 */
app.post('/encode', upload.single('file'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided. Please upload a file.'
      });
    }

    const base64String = fileToBase64(req.file.buffer);

    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        base64: base64String,
        mimeType: req.file.mimetype,
        fileSize: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error encoding file: ${error.message}`
    });
  }
});

/**
 * POST /decode
 * Converts Base64 string to file buffer
 * 
 * JSON Body:
 *   {
 *     "base64": "VGhpcyBpcyBhIHRlc3Q=",
 *     "filename": "output.txt" (optional),
 *     "sourceFile": "/path/to/source.txt" (optional - file to delete after conversion)
 *   }
 * 
 * Response:
 *   File binary data (application/octet-stream)
 */
app.post('/decode', (req, res) => {
  try {
    const { base64, filename, sourceFile } = req.body;

    if (!base64) {
      return res.status(400).json({
        success: false,
        error: 'No base64 string provided'
      });
    }

    if (!isValidBase64(base64)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Base64 string format'
      });
    }

    const buffer = base64ToBuffer(base64);
    const outputFilename = filename || 'output.bin';

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outputFilename}"`);
    
    // Send response
    res.send(buffer);

    // After response is sent, delete source file if provided
    if (sourceFile) {
      setImmediate(() => {
        fs.unlink(sourceFile, (err) => {
          if (err) {
            console.error(`⚠️ Warning: Could not delete source file ${sourceFile}:`, err.message);
          } else {
            console.log(`✅ Source file deleted: ${sourceFile}`);
          }
        });
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Error decoding base64: ${error.message}`
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Base64 Converter API',
    version: '1.0.0',
    endpoints: {
      'POST /encode': {
        description: 'Convert file to Base64',
        contentType: 'multipart/form-data',
        parameters: {
          file: 'The file to encode'
        }
      },
      'POST /decode': {
        description: 'Convert Base64 to file',
        contentType: 'application/json',
        parameters: {
          base64: 'The Base64 string to decode',
          filename: 'Optional: Output filename'
        }
      },
      'GET /health': {
        description: 'Health check endpoint'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: ['GET /', 'GET /health', 'POST /encode', 'POST /decode']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
});
