#!/usr/bin/env node

const { TestUtils } = require('./test-utils.js');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('🔍 KOReader Sync Plugin Test Runner\n');
  
  // Get the path from command line argument or use default
  const testPath = process.argv[2] || 'D:\\';
  
  console.log(`Testing path: ${testPath}`);
  console.log('=' .repeat(50));
  
  try {
    // Generate test report
    const report = await TestUtils.generateTestReport(testPath);
    
    // Save report to file
    const reportPath = path.join(__dirname, 'test-report.md');
    fs.writeFileSync(reportPath, report);
    
    // Display report
    console.log(report);
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    // Quick summary
    const lines = report.split('\n');
    const summaryLine = lines.find(line => line.includes('Overall result:'));
    if (summaryLine) {
      console.log(`\n🎯 ${summaryLine}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Handle command line usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔍 KOReader Sync Plugin Test Runner

Usage:
  node test/run-test.js [path]

Arguments:
  path    Path to your KOReader device (default: D:\\)

Examples:
  node test/run-test.js D:\\
  node test/run-test.js /media/user/KOBOeReader
  node test/run-test.js "D:\\KOBOeReader"

The test will:
1. Check if the path is accessible
2. Scan for metadata files
3. Test parsing of the metadata
4. Generate a detailed report

Report will be saved to: test/test-report.md
`);
  process.exit(0);
}

runTest().catch(console.error);
