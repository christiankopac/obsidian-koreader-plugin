# Project Structure

This document provides an overview of the organized folder structure for the KOReader Sync Plugin.

## Root Directory

```
koreader-sync/
├── README.md                 # Quick start guide and overview
├── package.json             # Project dependencies and scripts
├── manifest.json            # Obsidian plugin manifest
├── main.js                  # Built plugin (generated)
├── styles.css               # Plugin styles
├── tsconfig.json            # TypeScript configuration
├── esbuild.config.mjs       # Build configuration
├── .gitignore               # Git ignore rules
├── .eslintrc                # ESLint configuration
├── .editorconfig            # Editor configuration
├── LICENSE                  # MIT License
├── versions.json            # Version compatibility
├── version-bump.mjs         # Version bumping script
└── src/                     # Source code directory
```

## Source Code (`src/`)

```
src/
├── main.ts                  # Main plugin entry point
├── core/                    # Core functionality
│   └── koreader-metadata.ts # KOReader metadata parser
├── types/                   # TypeScript definitions
│   └── types.d.ts          # Plugin type definitions
└── utils/                   # Utility functions (future use)
```

## Documentation (`docs/`)

```
docs/
├── README.md               # Comprehensive documentation
├── CONTRIBUTING.md         # Contributing guidelines
├── CHANGELOG.md            # Version history and changes
└── LICENSE                 # License file
```

## Examples (`examples/`)

```
examples/
├── README.md               # Examples documentation
├── test-sample.js          # Test script for sample data
├── templates/              # Example templates
│   ├── default-template.md # Comprehensive template
│   ├── minimal-template.md # Minimal template
│   └── academic-template.md # Academic-style template
└── sample/                 # Sample data
    └── metadata.epub.lua   # Sample KOReader metadata
```
