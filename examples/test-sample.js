// Simple test script to verify the plugin can parse sample data
const fs = require('fs');
const path = require('path');

// Simple Lua to JSON parser (basic implementation)
function parseLuaContent(content) {
  try {
    // Remove comments and return statement
    const cleanedContent = content
      .replace(/--.*$/gm, '') // Remove comments
      .replace(/return\s*/, '') // Remove 'return' keyword
      .replace(/\[(\d+)\]\s*=\s*/g, '"$1": ') // Convert array indices to object keys
      .replace(/(\w+)\s*=\s*/g, '"$1": ') // Convert keys to quoted keys
      .replace(/,(\s*})/g, '$1') // Remove trailing commas
      .replace(/,(\s*\])/g, '$1'); // Remove trailing commas in arrays

    return JSON.parse(cleanedContent);
  } catch (error) {
    console.warn('Failed to parse Lua content as JSON:', error.message);
    return null;
  }
}

// Test parsing the sample file
const samplePath = path.join(__dirname, 'sample', 'metadata.epub.lua');
const content = fs.readFileSync(samplePath, 'utf8');
const metadata = parseLuaContent(content);

if (metadata) {
  console.log('Successfully parsed metadata file');
  console.log('Book title:', metadata.doc_props?.title);
  console.log('Author:', metadata.doc_props?.authors);
  console.log('Bookmarks count:', Object.keys(metadata.bookmarks || {}).length);
  console.log('Highlights count:', Object.keys(metadata.highlight || {}).length);
  
  // Show first bookmark
  const firstBookmarkKey = Object.keys(metadata.bookmarks || {})[0];
  if (firstBookmarkKey) {
    const firstBookmark = metadata.bookmarks[firstBookmarkKey];
    console.log('\nFirst bookmark:');
    console.log('- Chapter:', firstBookmark.chapter);
    console.log('- Notes:', firstBookmark.notes?.substring(0, 100) + '...');
    console.log('- Date:', firstBookmark.datetime);
  }
  
  // Show first highlight
  const firstHighlightKey = Object.keys(metadata.highlight || {})[0];
  if (firstHighlightKey) {
    const firstHighlight = metadata.highlight[firstHighlightKey];
    if (Array.isArray(firstHighlight) && firstHighlight.length > 0) {
      console.log('\nFirst highlight:');
      console.log('- Chapter:', firstHighlight[0].chapter);
      console.log('- Text:', firstHighlight[0].text?.substring(0, 100) + '...');
      console.log('- Date:', firstHighlight[0].datetime);
    }
  }
} else {
  console.error('Failed to parse metadata file');
}
