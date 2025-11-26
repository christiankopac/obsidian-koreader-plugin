# KOReader Sync Plugin for Obsidian

A plugin for Obsidian that syncs highlights and bookmarks from KOReader to your vault.

## Quick Start

1. **Install**: Download and extract to `.obsidian/plugins/koreader-sync/`
2. **Configure**: Set your KOReader path in plugin settings
3. **Sync**: Click the documents icon or use the command palette

## Features

- ✅ Sync highlights and bookmarks from KOReader
- ✅ Flexible organization (flat or folder-per-book)
- ✅ Custom templates for highlight notes
- ✅ Book indexes with all highlights
- ✅ Smart sync with KOReader changes
- ✅ Customizable title generation

## Documentation

📖 **[Full Documentation](docs/README.md)** - Complete setup guide, configuration options, and troubleshooting

## Development

```bash
# Install dependencies
pnpm install

# Development mode
pnpm run dev

# Build for production
pnpm run build
```

## Project Structure

```
├── src/                    # Source code
│   ├── main.ts            # Main plugin file
│   ├── core/              # Core functionality
│   │   └── koreader-metadata.ts
│   └── types/             # TypeScript definitions
│       └── types.d.ts
├── docs/                  # Documentation
├── examples/              # Examples and samples
└── main.js               # Built plugin (generated)
```

## License

MIT License - see [LICENSE](docs/LICENSE) for details.
