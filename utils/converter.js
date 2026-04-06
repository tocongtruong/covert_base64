/**
 * Convert file Buffer to Base64 string
 * @param {Buffer} buffer - File buffer
 * @returns {string} Base64 encoded string
 */
function fileToBase64(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }
  return buffer.toString('base64');
}

/**
 * Convert Base64 string to Buffer
 * @param {string} base64String - Base64 encoded string
 * @returns {Buffer} File buffer
 */
function base64ToBuffer(base64String) {
  if (typeof base64String !== 'string') {
    throw new Error('Input must be a string');
  }
  try {
    return Buffer.from(base64String, 'base64');
  } catch (error) {
    throw new Error('Failed to decode Base64 string');
  }
}

/**
 * Validate if a string is valid Base64
 * @param {string} str - String to validate
 * @returns {boolean} True if valid Base64, false otherwise
 */
function isValidBase64(str) {
  if (typeof str !== 'string') {
    return false;
  }
  
  // Check if string matches Base64 pattern
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  if (!base64Regex.test(str)) {
    return false;
  }
  
  // Check if length is multiple of 4 (Base64 strings must have length divisible by 4)
  if (str.length % 4 !== 0) {
    return false;
  }
  
  try {
    // Try to decode to validate
    Buffer.from(str, 'base64');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Detect MIME type from file buffer using magic bytes (file signature)
 * @param {Buffer} buffer - File buffer to analyze
 * @returns {object} { mimeType, extension } - Detected file type info
 */
function detectFileType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { mimeType: 'application/octet-stream', extension: 'bin' };
  }

  // Common file signatures (magic bytes)
  const fileSignatures = [
    // Video formats
    { sig: [0xFF, 0xFB], mime: 'audio/mpeg', ext: 'mp3' }, // MP3
    { sig: [0x49, 0x44, 0x33], mime: 'audio/mpeg', ext: 'mp3' }, // MP3 with ID3
    { sig: [0x52, 0x49, 0x46, 0x46], mime: 'audio/wav', ext: 'wav', offset: 8, match: [0x57, 0x41, 0x56, 0x45] }, // WAV
    { sig: [0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4', offset: -4 }, // MP4/MOV (ftyp)
    { sig: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' }, // MP4
    { sig: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], mime: 'video/mp4', ext: 'mp4' }, // MP4
    { sig: [0x1A, 0x45, 0xDF, 0xA3], mime: 'video/x-matroska', ext: 'mkv' }, // Matroska (MKV)
    { sig: [0x00, 0x00, 0x01, 0xBA], mime: 'video/mpeg', ext: 'mpg' }, // MPEG
    { sig: [0x52, 0x49, 0x46, 0x46], mime: 'video/avi', ext: 'avi', offset: 8, match: [0x41, 0x56, 0x49, 0x20] }, // AVI
    { sig: [0x47, 0x49, 0x46, 0x38], mime: 'image/gif', ext: 'gif' }, // GIF
    { sig: [0x89, 0x50, 0x4E, 0x47], mime: 'image/png', ext: 'png' }, // PNG
    { sig: [0xFF, 0xD8, 0xFF], mime: 'image/jpeg', ext: 'jpg' }, // JPEG/JPG
    { sig: [0x42, 0x4D], mime: 'image/bmp', ext: 'bmp' }, // BMP
    { sig: [0x49, 0x49, 0x2A, 0x00], mime: 'image/tiff', ext: 'tiff' }, // TIFF (little-endian)
    { sig: [0x4D, 0x4D, 0x00, 0x2A], mime: 'image/tiff', ext: 'tiff' }, // TIFF (big-endian)
    { sig: [0x52, 0x49, 0x46, 0x46], mime: 'image/webp', ext: 'webp', offset: 8, match: [0x57, 0x45, 0x42, 0x50] }, // WebP
    
    // Document formats
    { sig: [0x25, 0x50, 0x44, 0x46], mime: 'application/pdf', ext: 'pdf' }, // PDF
    { sig: [0x50, 0x4B, 0x03, 0x04], mime: 'application/zip', ext: 'zip' }, // ZIP (also DOCX, XLSX, PPTX)
    { sig: [0x50, 0x4B, 0x03, 0x04], mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', offset: 30, match: [0x77, 0x6F, 0x72, 0x64] }, // DOCX
    { sig: [0x50, 0x4B, 0x03, 0x04], mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', offset: 30, match: [0x78, 0x6C] }, // XLSX
    { sig: [0x50, 0x4B, 0x03, 0x04], mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', offset: 30, match: [0x70, 0x6C] }, // PPTX
    { sig: [0xD0, 0xCF, 0x11, 0xE0], mime: 'application/vnd.ms-word', ext: 'doc' }, // DOC
    { sig: [0xD0, 0xCF, 0x11, 0xE0], mime: 'application/vnd.ms-excel', ext: 'xls' }, // XLS
    
    // Archive formats
    { sig: [0x52, 0x61, 0x72, 0x21], mime: 'application/x-rar-compressed', ext: 'rar' }, // RAR
    { sig: [0x37, 0x7A, 0xBC, 0xAF], mime: 'application/x-7z-compressed', ext: '7z' }, // 7Z
    { sig: [0x1F, 0x8B, 0x08], mime: 'application/gzip', ext: 'gz' }, // GZIP
    { sig: [0x42, 0x5A, 0x68], mime: 'application/x-bzip2', ext: 'bz2' }, // BZIP2
    
    // Text formats
    { sig: [0x3C, 0x3F, 0x78, 0x6D], mime: 'application/xml', ext: 'xml' }, // XML
    { sig: [0x3C, 0x68, 0x74, 0x6D], mime: 'text/html', ext: 'html' }, // HTML
    { sig: [0x23, 0x21], mime: 'text/plain', ext: 'sh' }, // Shell script
  ];

  // Check each signature
  for (const fileSig of fileSignatures) {
    let match = true;
    
    // Check main signature
    for (let i = 0; i < fileSig.sig.length; i++) {
      if (buffer[i] !== fileSig.sig[i]) {
        match = false;
        break;
      }
    }

    if (!match) continue;

    // If there's an offset match requirement, check it
    if (fileSig.match && fileSig.offset) {
      let offsetMatch = true;
      const offset = fileSig.offset > 0 ? fileSig.offset : buffer.length + fileSig.offset;
      
      for (let i = 0; i < fileSig.match.length; i++) {
        if (buffer[offset + i] !== fileSig.match[i]) {
          offsetMatch = false;
          break;
        }
      }

      if (!offsetMatch) continue;
    }

    return {
      mimeType: fileSig.mime,
      extension: fileSig.ext
    };
  }

  // Default fallback
  return {
    mimeType: 'application/octet-stream',
    extension: 'bin'
  };
}

/**
 * Generate a random filename with correct extension
 * @param {string} extension - File extension
 * @returns {string} Random filename with extension
 */
function generateRandomFilename(extension = 'bin') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const cleanExt = extension.toLowerCase().replace(/^\./, '');
  return `file_${timestamp}_${random}.${cleanExt}`;
}

/**
 * Get appropriate filename based on provided name or auto-detect
 * @param {Buffer} buffer - File buffer
 * @param {string} providedFilename - User-provided filename (optional)
 * @returns {object} { filename, mimeType, extension }
 */
function getFileInfo(buffer, providedFilename = null) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Buffer is required');
  }

  const typeInfo = detectFileType(buffer);

  let filename;
  if (providedFilename) {
    // If user provided a filename, validate its extension
    const lastDot = providedFilename.lastIndexOf('.');
    if (lastDot > 0) {
      const userExt = providedFilename.substring(lastDot + 1).toLowerCase();
      // If extension doesn't match detected type, append correct extension
      if (userExt !== typeInfo.extension) {
        filename = `${providedFilename}.${typeInfo.extension}`;
      } else {
        filename = providedFilename;
      }
    } else {
      // No extension provided, add it
      filename = `${providedFilename}.${typeInfo.extension}`;
    }
  } else {
    // Auto-generate filename
    filename = generateRandomFilename(typeInfo.extension);
  }

  return {
    filename,
    mimeType: typeInfo.mimeType,
    extension: typeInfo.extension
  };
}

module.exports = {
  fileToBase64,
  base64ToBuffer,
  isValidBase64,
  detectFileType,
  generateRandomFilename,
  getFileInfo
};
