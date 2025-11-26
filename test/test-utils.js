const fs = require('fs');
const path = require('path');

class TestUtils {
  /**
   * Test if a path exists and is accessible
   */
  static async testPathAccess(testPath) {
    try {
      await fs.promises.access(testPath, fs.constants.R_OK);
      return { exists: true, readable: true };
    } catch (error) {
      return { 
        exists: false, 
        readable: false, 
        error: error.message || 'Unknown error' 
      };
    }
  }

  /**
   * Scan for metadata files in a directory
   */
  static async findMetadataFiles(basePath) {
    const metadataFiles = [];
    
    const scanDirectory = async (dirPath) => {
      try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && /^metadata\..*\.lua$/.test(entry.name)) {
            metadataFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Error scanning directory: ${dirPath}`, error.message);
      }
    };

    await scanDirectory(basePath);
    return metadataFiles;
  }

  /**
   * Simple Lua to JSON parser for testing
   */
  static parseLuaContent(content) {
    try {
      // Remove comments and return statement
      const cleanedContent = content
        .replace(/--.*$/gm, '') // Remove comments
        .replace(/return\s*/, '') // Remove 'return' keyword
        .replace(/\[(\d+)\]\s*=\s*/g, '"$1": ') // Convert array indices to object keys
        .replace(/(\w+)\s*=\s*/g, '"$1": ') // Convert keys to quoted keys
        .replace(/,(\s*})/g, '$1') // Remove trailing commas
        .replace(/,(\s*\])/g, '$1'); // Remove trailing commas in arrays

      return JSON.parse(cleanedContent);
    } catch (error) {
      console.warn('Failed to parse Lua content as JSON:', error.message);
      return null;
    }
  }

  /**
   * Test metadata file parsing
   */
  static async testMetadataFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const metadata = this.parseLuaContent(content);
      
      if (!metadata || !metadata.doc_props) {
        return { success: false, error: 'Invalid metadata structure' };
      }

      const { title, authors } = metadata.doc_props;
      const bookmarks = metadata.bookmarks || {};
      const highlights = metadata.highlight || {};
      
      let totalHighlights = 0;
      for (const pageHighlights of Object.values(highlights)) {
        if (Array.isArray(pageHighlights)) {
          totalHighlights += pageHighlights.length;
        }
      }

      return {
        success: true,
        title,
        authors,
        bookmarksCount: Object.keys(bookmarks).length,
        highlightsCount: totalHighlights,
        percentFinished: (metadata.percent_finished || 0) * 100
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test KOReader metadata parsing
   */
  static async testMetadataParsing(basePath) {
    const errors = [];
    let booksFound = 0;
    let totalHighlights = 0;
    let totalBookmarks = 0;
    let sampleBook = null;

    try {
      const metadataFiles = await this.findMetadataFiles(basePath);
      
      for (const filePath of metadataFiles) {
        const result = await this.testMetadataFile(filePath);
        
        if (result.success) {
          booksFound++;
          totalHighlights += result.highlightsCount;
          totalBookmarks += result.bookmarksCount;
          
          if (!sampleBook) {
            sampleBook = {
              title: result.title,
              authors: result.authors,
              highlightsCount: result.highlightsCount,
              bookmarksCount: result.bookmarksCount,
              percentFinished: result.percentFinished
            };
          }
        } else {
          errors.push(`Failed to parse ${filePath}: ${result.error}`);
        }
      }

      return {
        success: booksFound > 0,
        booksFound,
        totalHighlights,
        totalBookmarks,
        errors,
        sampleBook
      };
    } catch (error) {
      errors.push(error.message);
      return {
        success: false,
        booksFound: 0,
        totalHighlights: 0,
        totalBookmarks: 0,
        errors,
        sampleBook: null
      };
    }
  }

  /**
   * Generate a test report
   */
  static async generateTestReport(basePath) {
    const report = [];
    report.push('# KOReader Sync Plugin Test Report');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push(`Test Path: ${basePath}`);
    report.push('');

    // Test path access
    report.push('## 1. Path Access Test');
    const pathTest = await this.testPathAccess(basePath);
    report.push(`- Path exists: ${pathTest.exists ? '✅' : '❌'}`);
    report.push(`- Path readable: ${pathTest.readable ? '✅' : '❌'}`);
    if (pathTest.error) {
      report.push(`- Error: ${pathTest.error}`);
    }
    report.push('');

    if (!pathTest.exists || !pathTest.readable) {
      report.push('❌ **Path access failed. Cannot proceed with testing.**');
      return report.join('\n');
    }

    // Find metadata files
    report.push('## 2. Metadata Files Scan');
    const metadataFiles = await this.findMetadataFiles(basePath);
    report.push(`- Metadata files found: ${metadataFiles.length}`);
    if (metadataFiles.length > 0) {
      report.push('- Files:');
      metadataFiles.slice(0, 5).forEach(file => {
        report.push(`  - ${file}`);
      });
      if (metadataFiles.length > 5) {
        report.push(`  - ... and ${metadataFiles.length - 5} more`);
      }
    }
    report.push('');

    // Test metadata parsing
    report.push('## 3. Metadata Parsing Test');
    const parseTest = await this.testMetadataParsing(basePath);
    report.push(`- Parsing successful: ${parseTest.success ? '✅' : '❌'}`);
    report.push(`- Books found: ${parseTest.booksFound}`);
    report.push(`- Total highlights: ${parseTest.totalHighlights}`);
    report.push(`- Total bookmarks: ${parseTest.totalBookmarks}`);

    if (parseTest.errors.length > 0) {
      report.push('- Errors:');
      parseTest.errors.forEach(error => {
        report.push(`  - ${error}`);
      });
    }

    if (parseTest.sampleBook) {
      report.push('- Sample book:');
      report.push(`  - Title: ${parseTest.sampleBook.title}`);
      report.push(`  - Author: ${parseTest.sampleBook.authors}`);
      report.push(`  - Highlights: ${parseTest.sampleBook.highlightsCount}`);
      report.push(`  - Bookmarks: ${parseTest.sampleBook.bookmarksCount}`);
      report.push(`  - Progress: ${parseTest.sampleBook.percentFinished}%`);
    }
    report.push('');

    // Summary
    report.push('## 4. Test Summary');
    const allPassed = pathTest.exists && pathTest.readable && parseTest.success;
    report.push(`- Overall result: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (allPassed) {
      report.push('- Plugin should work correctly with this KOReader device');
      report.push('- You can proceed with using the plugin in Obsidian');
    } else {
      report.push('- Please check the errors above and fix them before using the plugin');
    }

    return report.join('\n');
  }
}

module.exports = { TestUtils };


