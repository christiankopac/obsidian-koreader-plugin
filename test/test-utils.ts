import * as fs from 'fs';
import * as path from 'path';
import { KOReaderMetadata } from '../src/core/koreader-metadata';
import { KOReaderBooks } from '../src/types/types';

export class TestUtils {
  /**
   * Test if a path exists and is accessible
   */
  static async testPathAccess(path: string): Promise<{ exists: boolean; readable: boolean; error?: string }> {
    try {
      await fs.promises.access(path, fs.constants.R_OK);
      return { exists: true, readable: true };
    } catch (error) {
      return { 
        exists: false, 
        readable: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Scan for metadata files in a directory
   */
  static async findMetadataFiles(basePath: string): Promise<string[]> {
    const metadataFiles: string[] = [];
    
    const scanDirectory = async (dirPath: string): Promise<void> => {
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
        console.warn(`Error scanning directory: ${dirPath}`, error);
      }
    };

    await scanDirectory(basePath);
    return metadataFiles;
  }

  /**
   * Test KOReader metadata parsing
   */
  static async testMetadataParsing(basePath: string): Promise<{
    success: boolean;
    booksFound: number;
    totalHighlights: number;
    totalBookmarks: number;
    errors: string[];
    sampleBook?: any;
  }> {
    const errors: string[] = [];
    let booksFound = 0;
    let totalHighlights = 0;
    let totalBookmarks = 0;
    let sampleBook: any = null;

    try {
      const metadata = new KOReaderMetadata(basePath);
      const books: KOReaderBooks = await metadata.scan();

      booksFound = Object.keys(books).length;

      for (const [title, book] of Object.entries(books)) {
        // Count highlights
        for (const highlights of Object.values(book.highlight)) {
          totalHighlights += highlights.length;
        }

        // Count bookmarks
        totalBookmarks += Object.keys(book.bookmarks).length;

        // Store first book as sample
        if (!sampleBook) {
          sampleBook = {
            title: book.title,
            authors: book.authors,
            highlightsCount: Object.values(book.highlight).reduce((sum, h) => sum + h.length, 0),
            bookmarksCount: Object.keys(book.bookmarks).length,
            percentFinished: book.percent_finished
          };
        }
      }

      return {
        success: true,
        booksFound,
        totalHighlights,
        totalBookmarks,
        errors,
        sampleBook
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
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
  static async generateTestReport(basePath: string): Promise<string> {
    const report: string[] = [];
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
