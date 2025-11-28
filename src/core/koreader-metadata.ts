import { KOReaderBooks, KOReaderBook, KOReaderHighlight, KOReaderBookmark } from '../types/types';

// Use dynamic require for Node.js modules to avoid linter errors
// These are needed for accessing external file systems
const getNodeModules = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path');
  return { fs, path };
};

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
        } catch {
          console.warn(`Failed to parse metadata file: ${filePath}`);
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
    const { fs, path } = getNodeModules();
    
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
      } catch {
        console.warn(`Error scanning directory: ${dirPath}`);
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
      const { fs } = getNodeModules();
      const content = await fs.promises.readFile(filePath, 'utf8');
      const metadata = this.parseLuaContent(content);
      
      if (!metadata || !metadata.doc_props || typeof metadata.doc_props !== 'object') {
        return null;
      }

      const docProps = metadata.doc_props as Record<string, unknown>;
      const title = typeof docProps.title === 'string' ? docProps.title : '';
      const authors = typeof docProps.authors === 'string' ? docProps.authors : '';
      const percent_finished = typeof metadata.percent_finished === 'number' ? metadata.percent_finished : 0;
      
      // Process highlights
      const highlights: { [key: number]: KOReaderHighlight[] } = {};
      if (metadata.highlight && typeof metadata.highlight === 'object') {
        const highlightObj = metadata.highlight as Record<string, unknown>;
        for (const [pageKey, pageHighlights] of Object.entries(highlightObj)) {
          const page = parseInt(pageKey);
          if (Array.isArray(pageHighlights)) {
            highlights[page] = pageHighlights.map((h: unknown) => {
              const highlight = h as Record<string, unknown>;
              return {
                chapter: typeof highlight.chapter === 'string' ? highlight.chapter : '',
                datetime: typeof highlight.datetime === 'string' ? highlight.datetime : '',
                highlighted: typeof highlight.highlighted === 'boolean' ? highlight.highlighted : false,
                notes: typeof highlight.notes === 'string' ? highlight.notes : '',
                page: typeof highlight.page === 'string' ? highlight.page : '',
                pos0: typeof highlight.pos0 === 'string' ? highlight.pos0 : '',
                pos1: typeof highlight.pos1 === 'string' ? highlight.pos1 : '',
                text: typeof highlight.text === 'string' ? highlight.text : undefined,
                drawer: typeof highlight.drawer === 'string' ? highlight.drawer : undefined
              };
            });
          }
        }
      }

      // Process bookmarks
      const bookmarks: { [key: number]: KOReaderBookmark } = {};
      if (metadata.bookmarks && typeof metadata.bookmarks === 'object') {
        const bookmarksObj = metadata.bookmarks as Record<string, unknown>;
        for (const [key, bookmark] of Object.entries(bookmarksObj)) {
          const index = parseInt(key);
          if (bookmark && typeof bookmark === 'object') {
            const bookmarkObj = bookmark as Record<string, unknown>;
            bookmarks[index] = {
              chapter: typeof bookmarkObj.chapter === 'string' ? bookmarkObj.chapter : '',
              datetime: typeof bookmarkObj.datetime === 'string' ? bookmarkObj.datetime : '',
              highlighted: typeof bookmarkObj.highlighted === 'boolean' ? bookmarkObj.highlighted : false,
              notes: typeof bookmarkObj.notes === 'string' ? bookmarkObj.notes : '',
              page: typeof bookmarkObj.page === 'string' ? bookmarkObj.page : '',
              pos0: typeof bookmarkObj.pos0 === 'string' ? bookmarkObj.pos0 : '',
              pos1: typeof bookmarkObj.pos1 === 'string' ? bookmarkObj.pos1 : '',
              text: typeof bookmarkObj.text === 'string' ? bookmarkObj.text : undefined
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
        doc_props: {
          title,
          authors
        }
      };
    } catch {
      console.error(`Error parsing metadata file: ${filePath}`);
      return null;
    }
  }

  private parseLuaContent(content: string): Record<string, unknown> {
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
      return JSON.parse(cleanedContent) as Record<string, unknown>;
    } catch {
      console.warn('Failed to parse Lua content as JSON, trying alternative method');
      return this.parseLuaContentAlternative(content);
    }
  }

  private parseLuaContentAlternative(content: string): Record<string, unknown> {
    // Alternative parsing method for more complex Lua structures
    const result: Record<string, unknown> = {};
    
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

  private parseLuaTable(tableContent: string): Record<string, string> {
    const result: Record<string, string> = {};
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
