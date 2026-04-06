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

module.exports = {
  fileToBase64,
  base64ToBuffer,
  isValidBase64
};
