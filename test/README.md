# Testing the KOReader Sync Plugin

This directory contains testing utilities to verify that the plugin can work with your KOReader device.

## Quick Test

Since you have a device connected on `D:\`, you can run the test directly:

```bash
# Test with your D: drive
node test/run-test.js D:\\

# Or with quotes if the path has spaces
node test/run-test.js "D:\\KOBOeReader"
```

## What the Test Does

The test runner will:

1. **Check Path Access** - Verify the device path is accessible
2. **Scan for Metadata Files** - Find all `metadata.*.lua` files
3. **Test Parsing** - Verify the plugin can parse the metadata
4. **Generate Report** - Create a detailed test report

## Test Output

The test will show you:

- ✅ **Path Access**: Whether the device is readable
- 📁 **Files Found**: Number of metadata files discovered
- 📚 **Books Found**: Number of books with highlights/bookmarks
- 🔖 **Highlights**: Total number of highlights found
- 📌 **Bookmarks**: Total number of bookmarks found
- 📊 **Sample Book**: Details of the first book found

## Example Output

```
🔍 KOReader Sync Plugin Test Runner

Testing path: D:\
==================================================
# KOReader Sync Plugin Test Report
Generated: 2024-01-15T10:30:00.000Z
Test Path: D:\

## 1. Path Access Test
- Path exists: ✅
- Path readable: ✅

## 2. Metadata Files Scan
- Metadata files found: 3
- Files:
  - D:\docsettings\book1\metadata.epub.lua
  - D:\docsettings\book2\metadata.epub.lua
  - D:\docsettings\book3\metadata.epub.lua

## 3. Metadata Parsing Test
- Parsing successful: ✅
- Books found: 3
- Total highlights: 45
- Total bookmarks: 12

- Sample book:
  - Title: The Great Gatsby
  - Author: F. Scott Fitzgerald
  - Highlights: 15
  - Bookmarks: 3
  - Progress: 75%

## 4. Test Summary
- Overall result: ✅ PASSED
- Plugin should work correctly with this KOReader device
- You can proceed with using the plugin in Obsidian

📄 Full report saved to: test/test-report.md

🎯 - Overall result: ✅ PASSED
```

## Troubleshooting

### Path Not Found
If you get "Path access failed":
- Check that your device is properly connected
- Try different path formats: `D:\`, `D:\\`, `"D:\KOBOeReader"`
- Make sure the drive letter is correct

### No Metadata Files Found
If no metadata files are found:
- Check that you have books with highlights/bookmarks
- Verify the device structure (should have `docsettings/` folders)
- Make sure KOReader has created metadata files

### Parsing Errors
If parsing fails:
- Check the console for specific error messages
- The test will show which files failed to parse
- This might indicate corrupted metadata files

## Manual Testing

You can also test individual components:

```bash
# Test just path access
node -e "
const { TestUtils } = require('./test-utils.js');
TestUtils.testPathAccess('D:\\').then(console.log);
"

# Test metadata file scanning
node -e "
const { TestUtils } = require('./test-utils.js');
TestUtils.findMetadataFiles('D:\\').then(files => {
  console.log('Found files:', files);
});
"
```

## Next Steps

If the test passes:
1. ✅ Your device is compatible
2. ✅ The plugin can read your data
3. ✅ You can proceed to use the plugin in Obsidian

If the test fails:
1. ❌ Check the error messages
2. ❌ Verify your device setup
3. ❌ Try different path formats
4. ❌ Check that you have highlights/bookmarks to sync


