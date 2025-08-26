const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileManager {
  constructor() {
    this.uploadsDir = '/app/uploads';
    this.metadataFile = '/app/metadata.json';
  }

  // Ensure uploads directory exists
  async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  // Load metadata
  async loadMetadata() {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is corrupted, return default structure
      const defaultData = { playables: {}, folders: [] };
      await this.saveMetadata(defaultData);
      return defaultData;
    }
  }

  // Save metadata
  async saveMetadata(data) {
    await fs.writeFile(this.metadataFile, JSON.stringify(data, null, 2));
  }

  // Generate unique filename
  generateUniqueId() {
    return uuidv4();
  }

  // Get file size in bytes
  async getFileSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Validate HTML file
  async validateHtmlFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      // Basic HTML validation
      const hasHtmlTag = content.toLowerCase().includes('<html');
      const hasHeadTag = content.toLowerCase().includes('<head');
      const hasBodyTag = content.toLowerCase().includes('<body');
      
      if (!hasHtmlTag || !hasBodyTag) {
        throw new Error('File does not appear to be a valid HTML document');
      }

      return true;
    } catch (error) {
      throw new Error(`HTML validation failed: ${error.message}`);
    }
  }

  // Save uploaded file
  async saveUploadedFile(file, playableId) {
    await this.ensureUploadsDir();
    
    const fileName = `${playableId}.html`;
    const filePath = path.join(this.uploadsDir, fileName);
    
    // Move uploaded file to final location
    await fs.rename(file.path, filePath);
    
    // Validate HTML content
    await this.validateHtmlFile(filePath);
    
    return fileName;
  }

  // Delete playable file
  async deleteFile(fileName) {
    const filePath = path.join(this.uploadsDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Warning: Could not delete file ${fileName}:`, error.message);
    }
  }

  // Get file path for serving
  getFilePath(fileName) {
    return path.join(this.uploadsDir, fileName);
  }

  // Check if file exists
  async fileExists(fileName) {
    try {
      const filePath = path.join(this.uploadsDir, fileName);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Clean filename for safe storage
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[^a-zA-Z0-9\-_\.\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100); // Limit length
  }
}

module.exports = new FileManager();