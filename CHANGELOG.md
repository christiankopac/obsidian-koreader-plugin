# Changelog

All notable changes to the KOReader Sync Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2024-12-XX

### Fixed
- Removed Node.js builtin module imports (fs, path, crypto) to comply with Obsidian plugin guidelines
- Replaced all `any` types with proper TypeScript type definitions
- Fixed UI text to use sentence case throughout the settings panel
- Removed plugin ID prefix from command IDs (now uses `sync-highlights` and `reset-imported`)
- Fixed unhandled promises by adding proper `void` operators
- Removed unnecessary escape characters in regex patterns
- Replaced TFile type casting with `instanceof` checks for type safety
- Replaced HTML heading elements with `Setting().setHeading()` for consistent UI
- Removed unused imports and variables
- Improved type safety with proper type guards in metadata parsing
- Added descriptions to eslint-disable comments
- Fixed string conversion to prevent `[object Object]` in template rendering
- Removed "settings" and plugin name from settings headings for better UI consistency
- Fixed ribbon icon callback to properly handle async operations
- Removed unused `page` variable in highlight processing

### Changed
- Reorganized source code into `src/` directory
- Improved TypeScript type definitions
- Better template rendering system with proper type handling
- Enhanced error handling with proper type guards
- Settings headings now use more concise labels (e.g., "Sync configuration" instead of "KOReader sync settings")

## [1.0.0] - 2024-01-XX

### Added
- Initial release of KOReader Sync Plugin
- Sync highlights from KOReader to Obsidian
- Sync bookmarks from KOReader to Obsidian
- Custom templates for highlight notes
- Flexible organization options (flat or folder-per-book)
- Book index generation
- Smart sync with KOReader changes
- Customizable title generation
- Settings panel with comprehensive options
- Command palette integration
- Ribbon icon for quick sync

### Features
- **Core Functionality**
  - Parse KOReader metadata files
  - Extract highlights and bookmarks
  - Generate unique identifiers for sync tracking
  - Handle both EPUB and other supported formats

- **Organization Options**
  - Flat structure: all highlights in one folder
  - Folder per book: separate folder for each book
  - Book indexes: summary notes for each book

- **Template System**
  - Default template with book information
  - Custom template support
  - Variable substitution for dynamic content
  - Conditional sections for notes and context

- **Sync Management**
  - Track imported notes to avoid duplicates
  - Keep notes in sync with KOReader changes
  - Reset functionality for re-importing notes
  - Progress tracking and notifications

- **Settings**
  - KOReader path configuration
  - Highlight folder selection
  - Sync options (highlights/bookmarks)
  - Title customization
  - Template configuration

## Version History

### v1.0.0
- Initial release with core sync functionality
- Support for highlights and bookmarks
- Custom templates and organization options
- Comprehensive settings panel
