# Examples

This directory contains examples and templates for the KOReader Sync Plugin.

## Templates

### Default Template (`templates/default-template.md`)
A comprehensive template with book information, chapter details, and organized sections for notes and context.

### Minimal Template (`templates/minimal-template.md`)
A clean, minimal template that focuses on the highlight text with basic attribution.

### Academic Template (`templates/academic-template.md`)
An academic-style template with proper citation format and tagging system.

## Sample Data

### KOReader Metadata (`sample/metadata.epub.lua`)
A sample KOReader metadata file showing the structure of highlights and bookmarks from "Pomodoro Technique Illustrated" by Staffan Noteberg.

## Test Script

### Test Sample (`test-sample.js`)
A Node.js script to test parsing of the sample metadata file. Run with:
```bash
node examples/test-sample.js
```

## Using Templates

1. Copy a template file to your vault
2. Set the template path in plugin settings
3. Enable custom templates
4. Run a sync to see the template in action

## Customizing Templates

Templates support the following variables:
- `{{title}}` - Book title
- `{{authors}}` - Book authors
- `{{chapter}}` - Chapter name
- `{{page}}` - Page number
- `{{datetime}}` - Timestamp
- `{{highlight}}` - Highlight text
- `{{notes}}` - User notes
- `{{text}}` - Context text
- `{{isBookmark}}` - Whether it's a bookmark

Conditional sections:
- `{{#if notes}}...{{/if}}` - Only show if notes exist
- `{{#if text}}...{{/if}}` - Only show if context text exists
