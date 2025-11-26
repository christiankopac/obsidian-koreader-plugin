export interface KOReaderHighlight {
  chapter: string;
  datetime: string;
  highlighted: boolean;
  notes: string;
  page: string;
  pos0: string;
  pos1: string;
  text?: string;
  drawer?: string;
}

export interface KOReaderBookmark {
  chapter: string;
  datetime: string;
  highlighted: boolean;
  notes: string;
  page: string;
  pos0: string;
  pos1: string;
  text?: string;
}

export interface KOReaderBook {
  title: string;
  authors: string;
  bookmarks: { [key: number]: KOReaderBookmark };
  highlight: { [key: number]: KOReaderHighlight[] };
  percent_finished: number;
  doc_props?: {
    title: string;
    authors: string;
    description?: string;
    language?: string;
    keywords?: string;
  };
}

export interface KOReaderBooks {
  [fullTitle: string]: KOReaderBook;
}

export interface HighlightData {
  title: string;
  authors: string;
  chapter: string;
  page: number;
  highlight: string;
  datetime: string;
  text: string;
  notes: string;
  pos0: string;
  pos1: string;
  isBookmark: boolean;
}

export interface FrontMatterData {
  title: string;
  authors: string;
  chapter: string;
  page: number;
  highlight: string;
  datetime: string;
  text: string;
  notes: string;
  pos0: string;
  pos1: string;
  isBookmark: boolean;
}

export interface FrontMatterMetadata {
  body_hash: string;
  keep_in_sync: boolean;
  yet_to_be_edited: boolean;
  managed_book_title: string;
  unique_id: string;
  source_type: 'highlight' | 'bookmark';
}

export interface FrontMatter {
  type: string;
  uniqueId: string;
  data: FrontMatterData;
  metadata: FrontMatterMetadata;
}

export interface TitleOptions {
  prefix?: string;
  suffix?: string;
  maxLength?: number;
  maxWords?: number;
}

export interface KOReaderSettings {
  koreaderBasePath: string;
  obsidianNoteFolder: string;
  noteTitleOptions: TitleOptions;
  bookTitleOptions: TitleOptions;
  keepInSync: boolean;
  aFolderForEachBook: boolean;
  customTemplate: boolean;
  templatePath?: string;
  createBookIndex: boolean;
  importedNotes: { [key: string]: boolean };
  enableResetImportedNotes: boolean;
  syncBookmarks: boolean;
  syncHighlights: boolean;
  defaultTemplate: string;
  bookIndexTemplate: string;
}
