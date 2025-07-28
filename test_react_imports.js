#!/usr/bin/env node

// Simple test to check if all imports work correctly
const fs = require('fs');
const path = require('path');

function testImportPaths() {
    console.log('🧪 Testing React import paths...');
    
    // Test files that were modified
    const testFiles = [
        'src/hooks/useUnifiedUser.js',
        'src/contexts/SearchContext.js',
        'src/components/User/UserSelector.js',
        'src/hooks/useSavedSearches.js'
    ];
    
    let allGood = true;
    
    for (const file of testFiles) {
        const fullPath = path.join(__dirname, file);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`❌ File does not exist: ${file}`);
            allGood = false;
            continue;
        }
        
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for useUnifiedUser imports
        if (content.includes('useUnifiedUser')) {
            // Check path correctness
            const importMatch = content.match(/import.*useUnifiedUser.*from\s+['"](.*?)['"]/);
            if (importMatch) {
                const importPath = importMatch[1];
                const resolvedPath = path.resolve(path.dirname(fullPath), importPath + '.js');
                
                if (fs.existsSync(resolvedPath)) {
                    console.log(`✅ ${file}: Import path looks good`);
                } else {
                    console.log(`❌ ${file}: Import path not found: ${importPath}`);
                    allGood = false;
                }
            }
        }
        
        // Check for old useUser imports from UserContext
        if (content.includes("from '../../contexts/UserContext'") || content.includes("from '../contexts/UserContext'")) {
            console.log(`⚠️  ${file}: Still has old UserContext import`);
            allGood = false;
        }
    }
    
    if (allGood) {
        console.log('\n🎉 All import paths look correct!');
        console.log('\nNext steps:');
        console.log('1. Start the API: cd api && python run.py');
        console.log('2. Start React: npm start');
        console.log('3. Test authentication at http://localhost:3000');
    } else {
        console.log('\n❌ Some issues found with import paths');
    }
}

testImportPaths();