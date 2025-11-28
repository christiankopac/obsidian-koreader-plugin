# Release 1.0.1

## Fixed
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

## Changed
- Reorganized source code into `src/` directory
- Improved TypeScript type definitions
- Better template rendering system with proper type handling
- Enhanced error handling with proper type guards
- Settings headings now use more concise labels (e.g., "Sync configuration" instead of "KOReader sync settings")

