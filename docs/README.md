# KOReader Sync Plugin - Full Documentation

Complete guide for setting up and using the KOReader Sync Plugin for Obsidian.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Templates](#templates)
- [File Structure](#file-structure)
- [Note Format](#note-format)
- [Troubleshooting](#troubleshooting)

## Installation

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/christiankopac/obsidian-koreader-plugin/releases)
2. Extract the plugin folder to your Obsidian vault's `.obsidian/plugins/` directory
3. Enable the plugin in Obsidian settings (Settings → Community Plugins)

### From Source

```bash
# Clone the repository
git clone https://github.com/christiankopac/obsidian-koreader-plugin.git

# Install dependencies
pnpm install

# Build the plugin
pnpm run build

# Copy main.js, manifest.json, and styles.css to your vault's plugin directory
```

## Configuration

### Basic Settings

#### KOReader Base Path

Set the path where your KOReader device is mounted:

- **Linux**: `/media/user/KOBOeReader` or `/mnt/onboard`
- **macOS**: `/Volumes/KOBOeReader`
- **Windows**: `D:\` or `E:\KOBOeReader`

The plugin will recursively scan this directory for `metadata.*.lua` files.

#### Highlights Folder

Choose the folder in your Obsidian vault where highlights will be saved. You can select from existing folders or create a new one.

### Sync Options

- **Sync Highlights**: Enable/disable importing highlights from KOReader
- **Sync Bookmarks**: Enable/disable importing bookmarks from KOReader
- **Keep in Sync**: Automatically update notes when highlights change in KOReader
  - ⚠️ **Warning**: This will overwrite manual edits to notes
- **Create Folder per Book**: Organize highlights in separate folders for each book
- **Create Book Index**: Generate an index note for each book with all highlights

### Template Settings

- **Custom Template**: Use a custom template for highlight notes
- **Template File**: Path to your custom template file (relative to vault root)

### Title Settings

Configure how note and book titles are generated:

- **Prefix/Suffix**: Add text before/after titles
- **Max Words**: Limit title length by word count (default: 5)
- **Max Length**: Limit title length by character count (default: 25)

## Usage

### Manual Sync

1. **Ribbon Icon**: Click the documents icon in the left ribbon
2. **Command Palette**: Use "Sync KOReader Highlights" command
3. The plugin will scan your KOReader device and import new highlights/bookmarks

### Automatic Sync

Enable "Keep in Sync" in settings to automatically update notes when highlights change in KOReader.

⚠️ **Important**: Notes with `keep_in_sync: true` and `yet_to_be_edited: true` will be overwritten during sync.

### Reset Imported Notes

If you need to re-import notes (e.g., after deleting them from trash):

1. Enable "Enable Reset Imported Notes" in settings
2. Use the command palette: "Reset Imported Notes List"
3. This clears the internal tracking list

## Templates

### Default Template

The default template includes:
- Book title and author (with link)
- Chapter and page information
- Highlight text
- Notes (if any)
- Context text (if available)

### Custom Templates

Create custom templates using the following variables:

- `{{title}}` - Book title
- `{{authors}}` - Book authors
- `{{bookTitle}}` - Book title (alias)
- `{{chapter}}` - Chapter name
- `{{page}}` - Page number
- `{{datetime}}` - Timestamp
- `{{highlight}}` - Highlight text
- `{{notes}}` - User notes
- `{{text}}` - Context text
- `{{isBookmark}}` - Whether it's a bookmark (true/false)

### Example Custom Template

```markdown
# {{highlight}}

**Book:** [[{{title}}|{{title}}]] by {{authors}}
**Chapter:** {{chapter}}
**Page:** {{page}}
**Date:** {{datetime}}

{{#if notes}}
## Notes
{{notes}}
{{/if}}

{{#if text}}
## Context
{{text}}
{{/if}}
```

### Template Examples

See the `examples/templates/` directory for:
- **default-template.md** - Comprehensive template
- **minimal-template.md** - Clean, minimal template
- **academic-template.md** - Academic-style with citations

## File Structure

### Default Structure

```
Highlights/
├── Highlight Note 1.md
├── Highlight Note 2.md
└── ...
```

### With Folder per Book

```
Highlights/
├── Book Title 1/
│   ├── Book Title 1.md (index)
│   ├── Highlight Note 1.md
│   └── Highlight Note 2.md
└── Book Title 2/
    ├── Book Title 2.md (index)
    └── Highlight Note 3.md
```

## Note Format

### Front Matter

Each highlight note contains front matter with metadata:

```yaml
---
koreader-sync:
  type: koreader-sync-note
  uniqueId: [unique identifier]
  data:
    title: [book title]
    authors: [book authors]
    chapter: [chapter name]
    page: [page number]
    highlight: [highlight text]
    datetime: [timestamp]
    text: [context text]
    notes: [user notes]
    pos0: [position start]
    pos1: [position end]
    isBookmark: [true/false]
  metadata:
    body_hash: [content hash]
    keep_in_sync: [true/false]
    yet_to_be_edited: [true/false]
    managed_book_title: [sanitized book title]
    unique_id: [unique identifier]
    source_type: [highlight/bookmark]
---
```

### Content

The note content follows your template, typically including:
- Book information
- Chapter and page details
- Highlight text
- Notes and context

## Troubleshooting

### No Books Found

**Symptoms**: Plugin reports "No books with highlights found in KOReader"

**Solutions**:
- Check that the KOReader path is correct
- Ensure your device is properly mounted
- Verify that books have highlights or bookmarks
- Check file permissions on the device
- Try running the test utility: `node test/run-test.js D:\\`

### Sync Issues

**Symptoms**: Sync fails or doesn't import notes

**Solutions**:
- Check the console for error messages (Ctrl+Shift+I)
- Verify file permissions on the KOReader device
- Try resetting the imported notes list
- Ensure the highlights folder path is correct
- Check that you have highlights/bookmarks to sync

### Template Issues

**Symptoms**: Template not rendering correctly or missing variables

**Solutions**:
- Ensure custom template files exist and are readable
- Check template syntax for valid variables
- Verify template file path is correct (relative to vault root)
- Check that template file has `.md` extension
- Review template examples in `examples/templates/`

### Path Access Errors

**Symptoms**: "Path access failed" or permission errors

**Solutions**:
- Verify the device is mounted and accessible
- Check file system permissions
- Try different path formats:
  - Windows: `D:\`, `D:\\`, `"D:\KOBOeReader"`
  - Linux: `/media/user/KOBOeReader`
  - macOS: `/Volumes/KOBOeReader`
- Ensure you have read permissions on the device

### Parsing Errors

**Symptoms**: "Failed to parse Lua content" warnings

**Solutions**:
- This is usually non-critical - the plugin will try alternative parsing
- Check if metadata files are corrupted
- Verify KOReader version compatibility
- Some complex metadata structures may require manual review

### Notes Not Updating

**Symptoms**: Changes in KOReader don't sync to Obsidian

**Solutions**:
- Ensure "Keep in Sync" is enabled in settings
- Check that `keep_in_sync: true` in note front matter
- Verify `yet_to_be_edited: true` in note front matter
- Manually trigger sync after making changes in KOReader
- Check that notes haven't been manually edited (which prevents sync)

## Advanced Usage

### Testing Device Compatibility

Use the included test utilities to verify your device setup:

```bash
# Test with your device path
node test/run-test.js D:\\

# Test with help
node test/run-test.js --help
```

The test will:
1. Check path access
2. Scan for metadata files
3. Test parsing
4. Generate a detailed report

### Manual Note Editing

When editing notes manually:
- Avoid changing the front matter directly
- The plugin tracks changes via `yet_to_be_edited` flag
- Use commands to mark notes as edited/not edited
- Changes to text are automatically detected

### Dataview Integration

The front matter structure allows for powerful Dataview queries:

```dataview
list
where koreader-sync
group by koreader-sync.data.title
```

See the original plugin's README for more Dataview examples.

## Support

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/christiankopac/obsidian-koreader-plugin/issues)
- **Documentation**: This file and the main README
- **Examples**: Check the `examples/` directory for templates and sample data

## License

MIT License - see [LICENSE](../LICENSE) for details.

