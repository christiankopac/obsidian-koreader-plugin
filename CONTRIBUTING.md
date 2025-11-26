# Contributing to KOReader Sync Plugin

Thank you for your interest in contributing to the KOReader Sync Plugin! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Start development mode**: `pnpm run dev`
4. **Make your changes** in the `src/` directory
5. **Test your changes** by reloading Obsidian

## Project Structure

```
src/
├── main.ts                 # Main plugin entry point
├── core/                   # Core functionality
│   └── koreader-metadata.ts # KOReader metadata parser
└── types/                  # TypeScript type definitions
    └── types.d.ts
```

## Code Style

- Use **TypeScript** for all new code
- Follow **ESLint** rules (run `pnpm run lint` to check)
- Use **prettier** for code formatting
- Write **descriptive commit messages**

## Testing

- Test with real KOReader metadata files
- Verify sync functionality works correctly
- Check that settings are properly saved/loaded
- Test error handling scenarios

## Submitting Changes

1. **Create a feature branch** from `main`
2. **Make your changes** with clear commit messages
3. **Test thoroughly** before submitting
4. **Create a pull request** with a clear description
5. **Link any related issues** in the PR description

## Issue Reporting

When reporting issues, please include:

- **Obsidian version**
- **Plugin version**
- **Operating system**
- **KOReader version** (if relevant)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console errors** (if any)

## Feature Requests

For feature requests, please:

- **Describe the use case** clearly
- **Explain the expected behavior**
- **Consider the impact** on existing functionality
- **Provide examples** if possible

## Questions?

Feel free to open an issue for questions or discussions about the project!
