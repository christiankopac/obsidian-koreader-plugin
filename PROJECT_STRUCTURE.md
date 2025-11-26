# Project Structure

This document provides an overview of the organized folder structure for the KOReader Sync Plugin.

## Root Directory

```
obsidian-koreader-sync/
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

## Key Improvements

### ✅ **Organized Source Code**
- Separated core functionality into `src/core/`
- Type definitions in `src/types/`
- Main plugin file in `src/main.ts`

### ✅ **Comprehensive Documentation**
- Quick start guide in root README
- Detailed documentation in `docs/`
- Contributing guidelines
- Changelog tracking

### ✅ **Example Templates**
- Multiple template examples
- Different styles (default, minimal, academic)
- Template documentation

### ✅ **Better Build Configuration**
- Updated esbuild config for new structure
- Proper TypeScript compilation
- Clean build output

### ✅ **Professional Structure**
- Clear separation of concerns
- Easy to navigate and understand
- Follows best practices for Obsidian plugins

## Development Workflow

1. **Source Code**: Edit files in `src/` directory
2. **Build**: Run `pnpm run build` to generate `main.js`
3. **Test**: Use examples in `examples/` directory
4. **Document**: Update files in `docs/` directory

## Benefits

- **Maintainability**: Clear organization makes code easier to maintain
- **Scalability**: Structure supports future growth and features
- **Documentation**: Comprehensive docs help users and contributors
- **Examples**: Templates and samples help users get started quickly
- **Professional**: Follows industry standards for plugin development


