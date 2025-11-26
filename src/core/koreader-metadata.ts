import * as fs from 'fs';
import * as path from 'path';
import { KOReaderBooks, KOReaderBook, KOReaderHighlight, KOReaderBookmark } from '../types/types';

export class KOReaderMetadata {
  private koreaderBasePath: string;

  constructor(koreaderBasePath: string) {
    this.koreaderBasePath = koreaderBasePath;
  }

  public async scan(): Promise<KOReaderBooks> {
    const books: KOReaderBooks = {};
    
    try {
      const metadataFiles = await this.findMetadataFiles();
      
      for (const filePath of metadataFiles) {
        try {
          const book = await this.parseMetadataFile(filePath);
          if (book && this.hasContent(book)) {
            const fullTitle = `${book.title} - ${book.authors}`;
            books[fullTitle] = book;
          }
        } catch (error) {
          console.warn(`Failed to parse metadata file: ${filePath}`, error);
        }
      }
    } catch (error) {
      console.error('Error scanning KOReader metadata:', error);
      throw error;
    }

    return books;
  }

  private async findMetadataFiles(): Promise<string[]> {
    const metadataFiles: string[] = [];
    
    const scanDirectory = async (dirPath: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (entry.isFile() && this.isMetadataFile(entry.name)) {
            metadataFiles.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Error scanning directory: ${dirPath}`, error);
      }
    };

    await scanDirectory(this.koreaderBasePath);
    return metadataFiles;
  }

  private isMetadataFile(filename: string): boolean {
    return /^metadata\..*\.lua$/.test(filename);
  }

  private async parseMetadataFile(filePath: string): Promise<KOReaderBook | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const metadata = this.parseLuaContent(content);
      
      if (!metadata || !metadata.doc_props) {
        return null;
      }

      const { title, authors } = metadata.doc_props;
      const percent_finished = metadata.percent_finished || 0;
      
      // Process highlights
      const highlights: { [key: number]: KOReaderHighlight[] } = {};
      if (metadata.highlight) {
        for (const [pageKey, pageHighlights] of Object.entries(metadata.highlight)) {
          const page = parseInt(pageKey);
          if (Array.isArray(pageHighlights)) {
            highlights[page] = pageHighlights.map(h => ({
              chapter: h.chapter || '',
              datetime: h.datetime || '',
              highlighted: h.highlighted || false,
              notes: h.notes || '',
              page: h.page || '',
              pos0: h.pos0 || '',
              pos1: h.pos1 || '',
              text: h.text || '',
              drawer: h.drawer || ''
            }));
          }
        }
      }

      // Process bookmarks
      const bookmarks: { [key: number]: KOReaderBookmark } = {};
      if (metadata.bookmarks) {
        for (const [key, bookmark] of Object.entries(metadata.bookmarks)) {
          const index = parseInt(key);
          if (bookmark && typeof bookmark === 'object') {
            const bookmarkObj = bookmark as any;
            bookmarks[index] = {
              chapter: bookmarkObj.chapter || '',
              datetime: bookmarkObj.datetime || '',
              highlighted: bookmarkObj.highlighted || false,
              notes: bookmarkObj.notes || '',
              page: bookmarkObj.page || '',
              pos0: bookmarkObj.pos0 || '',
              pos1: bookmarkObj.pos1 || '',
              text: bookmarkObj.text || ''
            };
          }
        }
      }

      return {
        title,
        authors,
        bookmarks,
        highlight: highlights,
        percent_finished: percent_finished * 100,
        doc_props: metadata.doc_props
      };
    } catch (error) {
      console.error(`Error parsing metadata file: ${filePath}`, error);
      return null;
    }
  }

  private parseLuaContent(content: string): any {
    try {
      // Simple Lua to JSON parser for the metadata format
      // This is a basic implementation - in production you might want to use a proper Lua parser
      const cleanedContent = content
        .replace(/--.*$/gm, '') // Remove comments
        .replace(/return\s*/, '') // Remove 'return' keyword
        .replace(/\[(\d+)\]\s*=\s*/g, '"$1": ') // Convert array indices to object keys
        .replace(/(\w+)\s*=\s*/g, '"$1": ') // Convert keys to quoted keys
        .replace(/,(\s*})/g, '$1') // Remove trailing commas
        .replace(/,(\s*\])/g, '$1'); // Remove trailing commas in arrays

      // Try to parse as JSON
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.warn('Failed to parse Lua content as JSON, trying alternative method');
      return this.parseLuaContentAlternative(content);
    }
  }

  private parseLuaContentAlternative(content: string): any {
    // Alternative parsing method for more complex Lua structures
    const result: any = {};
    
    // Extract doc_props
    const docPropsMatch = content.match(/doc_props\s*=\s*{([^}]+)}/);
    if (docPropsMatch) {
      result.doc_props = this.parseLuaTable(docPropsMatch[1]);
    }

    // Extract percent_finished
    const percentMatch = content.match(/percent_finished\s*=\s*([\d.]+)/);
    if (percentMatch) {
      result.percent_finished = parseFloat(percentMatch[1]);
    }

    // Extract highlights and bookmarks (simplified)
    // This is a basic implementation - you might need to enhance it based on your data structure
    result.highlight = {};
    result.bookmarks = {};

    return result;
  }

  private parseLuaTable(tableContent: string): any {
    const result: any = {};
    const lines = tableContent.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(\w+)\s*=\s*["']([^"']+)["']/);
      if (match) {
        result[match[1]] = match[2];
      }
    }
    
    return result;
  }

  private hasContent(book: KOReaderBook): boolean {
    const hasHighlights = Object.keys(book.highlight).length > 0;
    const hasBookmarks = Object.keys(book.bookmarks).length > 0;
    return hasHighlights || hasBookmarks;
  }
}
