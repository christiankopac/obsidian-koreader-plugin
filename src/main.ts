import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile, normalizePath } from 'obsidian';
import * as crypto from 'crypto';
import * as matter from 'gray-matter';
import { KOReaderMetadata } from './core/koreader-metadata';
import { 
  KOReaderSettings, 
  KOReaderBooks, 
  KOReaderBook, 
  KOReaderHighlight, 
  KOReaderBookmark,
  HighlightData,
  FrontMatter,
  TitleOptions
} from './types/types';

const DEFAULT_SETTINGS: KOReaderSettings = {
  koreaderBasePath: '/media/user/KOBOeReader',
  obsidianNoteFolder: '/',
  noteTitleOptions: {
    maxWords: 5,
    maxLength: 25,
  },
  bookTitleOptions: {
    maxWords: 5,
    maxLength: 25,
    prefix: '(book) ',
  },
  keepInSync: false,
  aFolderForEachBook: false,
  customTemplate: false,
  createBookIndex: false,
  importedNotes: {},
  enableResetImportedNotes: false,
  syncBookmarks: true,
  syncHighlights: true,
  defaultTemplate: `## Book: [[{{bookTitle}}|{{title}}]]

**Author:** {{authors}}  
**Chapter:** {{chapter}}  
**Page:** {{page}}  
**Date:** {{datetime}}

**Highlight:**
{{highlight}}

{{#if notes}}
**Notes:**
{{notes}}
{{/if}}

{{#if text}}
**Context:**
{{text}}
{{/if}}`,
  bookIndexTemplate: `# {{title}} by {{authors}}

**Progress:** {{percent_finished}}%

## Highlights and Bookmarks

{{#each highlights}}
### {{chapter}} (Page {{page}})
- **{{datetime}}** - {{highlight}}
{{#if notes}}
  - Notes: {{notes}}
{{/if}}
{{/each}}`
};

const KOREADER_KEY = 'koreader-sync';
const NOTE_TYPE = 'koreader-sync-note';

export default class KOReaderSyncPlugin extends Plugin {
  settings: KOReaderSettings;

  async onload() {
    await this.loadSettings();

    // Add ribbon icon
    const ribbonIconEl = this.addRibbonIcon(
      'documents',
      'Sync KOReader highlights',
      this.syncHighlights.bind(this)
    );

    // Add commands
    this.addCommand({
      id: 'koreader-sync-highlights',
      name: 'Sync KOReader Highlights',
      callback: () => {
        this.syncHighlights();
      },
    });

    this.addCommand({
      id: 'koreader-reset-imported',
      name: 'Reset Imported Notes List',
      checkCallback: (checking: boolean) => {
        if (this.settings.enableResetImportedNotes) {
          if (!checking) {
            this.settings.importedNotes = {};
            this.settings.enableResetImportedNotes = false;
            this.saveSettings();
            new Notice('Imported notes list has been reset');
          }
          return true;
        }
        return false;
      },
    });

    // Add settings tab
    this.addSettingTab(new KOReaderSettingTab(this.app, this));
  }

  onunload() {
    // Cleanup if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private manageTitle(title: string, options: TitleOptions = {}): string {
    // Clean the title
    title = title
      .replace(/[\\\/:]/g, '_') // Replace invalid characters
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .trim()
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .replace(/\s+/g, ' '); // Normalize spaces

    // Apply length limits
    if (options.maxLength && title.length > options.maxLength) {
      title = `${title.substring(0, options.maxLength)}...`;
    }

    if (options.maxWords && title.split(' ').length > options.maxWords) {
      title = `${title.split(' ').slice(0, options.maxWords).join(' ')}...`;
    }

    return `${options.prefix || ''}${title}${options.suffix || ''}`;
  }

  private generateUniqueId(book: KOReaderBook, highlight: KOReaderHighlight | KOReaderBookmark, isBookmark: boolean): string {
    const base = `${book.title} - ${book.authors} - ${highlight.pos0} - ${highlight.pos1}`;
    return crypto.createHash('md5').update(base).digest('hex');
  }

  private extractPageNumber(pageString: string): number {
    const match = pageString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  private renderTemplate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private async createNoteContent(highlightData: HighlightData): Promise<string> {
    const template = this.settings.customTemplate && this.settings.templatePath
      ? await this.getCustomTemplate()
      : this.settings.defaultTemplate;

    const templateData = {
      title: highlightData.title,
      authors: highlightData.authors,
      bookTitle: highlightData.title,
      chapter: highlightData.chapter,
      page: highlightData.page,
      datetime: highlightData.datetime,
      highlight: highlightData.highlight,
      notes: highlightData.notes,
      text: highlightData.text,
      isBookmark: highlightData.isBookmark
    };

    return this.renderTemplate(template, templateData);
  }

  private async getCustomTemplate(): Promise<string> {
    try {
      const templateFile = this.app.vault.getAbstractFileByPath(this.settings.templatePath!);
      if (templateFile && templateFile instanceof TFile) {
        return await this.app.vault.read(templateFile);
      }
    } catch (error) {
      console.warn('Failed to load custom template, using default');
    }
    return this.settings.defaultTemplate;
  }

  private createFrontMatter(highlightData: HighlightData, uniqueId: string, managedBookTitle: string): FrontMatter {
    return {
      type: NOTE_TYPE,
      uniqueId,
      data: {
        title: highlightData.title,
        authors: highlightData.authors,
        chapter: highlightData.chapter,
        page: highlightData.page,
        highlight: highlightData.highlight,
        datetime: highlightData.datetime,
        text: highlightData.text,
        notes: highlightData.notes,
        pos0: highlightData.pos0,
        pos1: highlightData.pos1,
        isBookmark: highlightData.isBookmark
      },
      metadata: {
        body_hash: crypto.createHash('md5').update(highlightData.highlight).digest('hex'),
        keep_in_sync: this.settings.keepInSync,
        yet_to_be_edited: true,
        managed_book_title: managedBookTitle,
        unique_id: uniqueId,
        source_type: highlightData.isBookmark ? 'bookmark' : 'highlight'
      }
    };
  }

  private async createBookIndex(book: KOReaderBook, managedBookTitle: string, path: string): Promise<void> {
    if (!this.settings.createBookIndex) return;

    const allHighlights: HighlightData[] = [];

    // Collect all highlights
    if (this.settings.syncHighlights) {
      for (const [pageKey, highlights] of Object.entries(book.highlight)) {
        const page = parseInt(pageKey);
        for (const highlight of highlights) {
          allHighlights.push({
            title: book.title,
            authors: book.authors,
            chapter: highlight.chapter,
            page: this.extractPageNumber(highlight.page),
            highlight: highlight.text || highlight.notes,
            datetime: highlight.datetime,
            text: highlight.text || '',
            notes: highlight.notes,
            pos0: highlight.pos0,
            pos1: highlight.pos1,
            isBookmark: false
          });
        }
      }
    }

    // Collect all bookmarks
    if (this.settings.syncBookmarks) {
      for (const bookmark of Object.values(book.bookmarks)) {
        allHighlights.push({
          title: book.title,
          authors: book.authors,
          chapter: bookmark.chapter,
          page: this.extractPageNumber(bookmark.page),
          highlight: bookmark.text || bookmark.notes,
          datetime: bookmark.datetime,
          text: bookmark.text || '',
          notes: bookmark.notes,
          pos0: bookmark.pos0,
          pos1: bookmark.pos1,
          isBookmark: true
        });
      }
    }

    // Sort by page number
    allHighlights.sort((a, b) => a.page - b.page);

    const templateData = {
      title: book.title,
      authors: book.authors,
      percent_finished: book.percent_finished,
      highlights: allHighlights
    };

    const content = this.renderTemplate(this.settings.bookIndexTemplate, templateData);
    const filePath = normalizePath(`${path}/${managedBookTitle}.md`);

    try {
      await this.app.vault.create(filePath, content);
    } catch (error) {
      console.warn(`Failed to create book index for ${managedBookTitle}:`, error);
    }
  }

  async syncHighlights() {
    try {
      new Notice('Starting KOReader sync...');
      
      const metadata = new KOReaderMetadata(this.settings.koreaderBasePath);
      const books: KOReaderBooks = await metadata.scan();

      if (Object.keys(books).length === 0) {
        new Notice('No books with highlights found in KOReader');
        return;
      }

      // Get existing notes
      const existingNotes = this.getExistingNotes();

      let importedCount = 0;
      let updatedCount = 0;

      for (const [fullTitle, book] of Object.entries(books)) {
        const managedBookTitle = this.manageTitle(book.title, this.settings.bookTitleOptions);
        const path = this.settings.aFolderForEachBook
          ? normalizePath(`${this.settings.obsidianNoteFolder}/${managedBookTitle}`)
          : this.settings.obsidianNoteFolder;

        // Create folder if needed
        if (this.settings.aFolderForEachBook) {
          await this.ensureFolderExists(path);
        }

        // Create book index
        await this.createBookIndex(book, managedBookTitle, path);

        // Process highlights
        if (this.settings.syncHighlights) {
          for (const [pageKey, highlights] of Object.entries(book.highlight)) {
            const page = parseInt(pageKey);
            for (const highlight of highlights) {
              const result = await this.processHighlight(book, highlight, false, path, managedBookTitle, existingNotes);
              if (result === 'imported') importedCount++;
              if (result === 'updated') updatedCount++;
            }
          }
        }

        // Process bookmarks
        if (this.settings.syncBookmarks) {
          for (const bookmark of Object.values(book.bookmarks)) {
            const result = await this.processHighlight(book, bookmark, true, path, managedBookTitle, existingNotes);
            if (result === 'imported') importedCount++;
            if (result === 'updated') updatedCount++;
          }
        }
      }

      await this.saveSettings();
      new Notice(`Sync complete! Imported: ${importedCount}, Updated: ${updatedCount}`);
    } catch (error) {
      console.error('Error during sync:', error);
      new Notice(`Sync failed: ${error.message}`);
    }
  }

  private async processHighlight(
    book: KOReaderBook,
    highlight: KOReaderHighlight | KOReaderBookmark,
    isBookmark: boolean,
    path: string,
    managedBookTitle: string,
    existingNotes: Map<string, any>
  ): Promise<'imported' | 'updated' | 'skipped'> {
    const uniqueId = this.generateUniqueId(book, highlight, isBookmark);
    
    // Skip if already imported and not keeping in sync
    if (this.settings.importedNotes[uniqueId] && !this.settings.keepInSync) {
      return 'skipped';
    }

    const highlightData: HighlightData = {
      title: book.title,
      authors: book.authors,
      chapter: highlight.chapter,
      page: this.extractPageNumber(highlight.page),
      highlight: highlight.text || highlight.notes,
      datetime: highlight.datetime,
      text: highlight.text || '',
      notes: highlight.notes,
      pos0: highlight.pos0,
      pos1: highlight.pos1,
      isBookmark
    };

    const content = await this.createNoteContent(highlightData);
    const frontMatter = this.createFrontMatter(highlightData, uniqueId, managedBookTitle);
    const noteTitle = this.manageTitle(highlightData.highlight, this.settings.noteTitleOptions);
    const notePath = normalizePath(`${path}/${noteTitle}.md`);

    // Check if note exists and needs updating
    const existingNote = existingNotes.get(uniqueId);
    if (existingNote && this.settings.keepInSync && !existingNote.yet_to_be_edited) {
      try {
        await this.app.vault.modify(existingNote.file, matter.stringify(content, { [KOREADER_KEY]: frontMatter }));
        return 'updated';
      } catch (error) {
        console.warn(`Failed to update note: ${notePath}`, error);
        return 'skipped';
      }
    }

    // Create new note
    if (!existingNote) {
      try {
        await this.app.vault.create(notePath, matter.stringify(content, { [KOREADER_KEY]: frontMatter }));
        this.settings.importedNotes[uniqueId] = true;
        return 'imported';
      } catch (error) {
        console.warn(`Failed to create note: ${notePath}`, error);
        return 'skipped';
      }
    }

    return 'skipped';
  }

  private getExistingNotes(): Map<string, any> {
    const existingNotes = new Map();
    
    this.app.vault.getMarkdownFiles().forEach((file) => {
      const cache = this.app.metadataCache.getFileCache(file);
      const frontMatter = cache?.frontmatter;
      
      if (frontMatter?.[KOREADER_KEY]?.uniqueId) {
        existingNotes.set(frontMatter[KOREADER_KEY].uniqueId, {
          file: file as TFile,
          keep_in_sync: frontMatter[KOREADER_KEY].metadata.keep_in_sync,
          yet_to_be_edited: frontMatter[KOREADER_KEY].metadata.yet_to_be_edited
        });
      }
    });

    return existingNotes;
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    try {
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
    } catch (error) {
      console.warn(`Failed to create folder: ${folderPath}`, error);
    }
  }
}

class KOReaderSettingTab extends PluginSettingTab {
  plugin: KOReaderSyncPlugin;

  constructor(app: App, plugin: KOReaderSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'KOReader Sync Settings' });

    // KOReader Path
    new Setting(containerEl)
      .setName('KOReader Base Path')
      .setDesc('Path where KOReader is mounted (e.g., /media/user/KOBOeReader)')
      .addText(text => text
        .setPlaceholder('Enter KOReader path')
        .setValue(this.plugin.settings.koreaderBasePath)
        .onChange(async (value) => {
          this.plugin.settings.koreaderBasePath = value;
          await this.plugin.saveSettings();
        }));

    // Obsidian Folder
    new Setting(containerEl)
      .setName('Highlights Folder')
      .setDesc('Folder in your vault where highlights will be saved')
      .addDropdown(dropdown => {
        const folders = this.getFolders();
        folders.forEach(folder => {
          dropdown.addOption(folder, folder);
        });
        return dropdown
          .setValue(this.plugin.settings.obsidianNoteFolder)
          .onChange(async (value) => {
            this.plugin.settings.obsidianNoteFolder = value;
            await this.plugin.saveSettings();
          });
      });

    // Sync Options
    containerEl.createEl('h3', { text: 'Sync Options' });

    new Setting(containerEl)
      .setName('Sync Highlights')
      .setDesc('Import highlights from KOReader')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.syncHighlights)
        .onChange(async (value) => {
          this.plugin.settings.syncHighlights = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Sync Bookmarks')
      .setDesc('Import bookmarks from KOReader')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.syncBookmarks)
        .onChange(async (value) => {
          this.plugin.settings.syncBookmarks = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Keep in Sync')
      .setDesc('Automatically update notes when highlights change in KOReader')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.keepInSync)
        .onChange(async (value) => {
          this.plugin.settings.keepInSync = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Create Folder per Book')
      .setDesc('Create a separate folder for each book')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.aFolderForEachBook)
        .onChange(async (value) => {
          this.plugin.settings.aFolderForEachBook = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Create Book Index')
      .setDesc('Create an index note for each book with all highlights')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.createBookIndex)
        .onChange(async (value) => {
          this.plugin.settings.createBookIndex = value;
          await this.plugin.saveSettings();
        }));

    // Template Settings
    containerEl.createEl('h3', { text: 'Template Settings' });

    new Setting(containerEl)
      .setName('Custom Template')
      .setDesc('Use a custom template for highlight notes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.customTemplate)
        .onChange(async (value) => {
          this.plugin.settings.customTemplate = value;
          await this.plugin.saveSettings();
        }));

    if (this.plugin.settings.customTemplate) {
      new Setting(containerEl)
        .setName('Template File')
        .setDesc('Path to your custom template file')
        .addText(text => text
          .setPlaceholder('templates/highlight.md')
          .setValue(this.plugin.settings.templatePath || '')
          .onChange(async (value) => {
            this.plugin.settings.templatePath = value;
            await this.plugin.saveSettings();
          }));
    }

    // Title Settings
    containerEl.createEl('h3', { text: 'Title Settings' });

    this.addTitleSettings(containerEl, 'Note Titles', this.plugin.settings.noteTitleOptions, 'noteTitleOptions');
    this.addTitleSettings(containerEl, 'Book Titles', this.plugin.settings.bookTitleOptions, 'bookTitleOptions');

    // Danger Zone
    containerEl.createEl('h3', { text: 'Danger Zone' });

    new Setting(containerEl)
      .setName('Enable Reset Imported Notes')
      .setDesc('Enable the command to reset the list of imported notes')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableResetImportedNotes)
        .onChange(async (value) => {
          this.plugin.settings.enableResetImportedNotes = value;
          await this.plugin.saveSettings();
        }));
  }

  private addTitleSettings(containerEl: HTMLElement, title: string, options: TitleOptions, settingKey: string) {
    containerEl.createEl('h4', { text: title });

    new Setting(containerEl)
      .setName('Prefix')
      .addText(text => text
        .setPlaceholder('Enter prefix')
        .setValue(options.prefix || '')
        .onChange(async (value) => {
          options.prefix = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Suffix')
      .addText(text => text
        .setPlaceholder('Enter suffix')
        .setValue(options.suffix || '')
        .onChange(async (value) => {
          options.suffix = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Max Words')
      .setDesc('Maximum number of words in title')
      .addSlider(slider => slider
        .setLimits(1, 20, 1)
        .setValue(options.maxWords || 5)
        .setDynamicTooltip()
        .onChange(async (value) => {
          options.maxWords = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Max Length')
      .setDesc('Maximum number of characters in title')
      .addSlider(slider => slider
        .setLimits(10, 100, 5)
        .setValue(options.maxLength || 25)
        .setDynamicTooltip()
        .onChange(async (value) => {
          options.maxLength = value;
          await this.plugin.saveSettings();
        }));
  }

  private getFolders(): string[] {
    const folders: string[] = [];
    const files = (this.app.vault.adapter as any).files;
    
    for (const [path, file] of Object.entries(files)) {
      if ((file as any).type === 'folder') {
        folders.push(path);
      }
    }
    
    return folders.sort();
  }
}
