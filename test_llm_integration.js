#!/usr/bin/env node

// Test to verify LLM integration is using API layer
const fs = require('fs');
const path = require('path');

function testLLMIntegration() {
    console.log('🧪 Testing LLM Integration with API Layer...');
    
    const componentsToCheck = [
        'src/components/Results/ResultsSection.js',
        'src/components/Summary/SummaryModal.js',
        'src/components/Chat/ChatSidebar.js',
        'src/contexts/SearchContext.js'
    ];
    
    let allGood = true;
    
    for (const component of componentsToCheck) {
        const fullPath = path.join(__dirname, component);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`❌ File missing: ${component}`);
            allGood = false;
            continue;
        }
        
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for direct OpenAI imports (should not exist in components, but OK in SearchContext)
        if ((content.includes('from \'../../hooks/useOpenAI\'') || content.includes('from \'../hooks/useOpenAI\'')) && !component.includes('SearchContext.js')) {
            console.log(`❌ ${component}: Still has direct useOpenAI import`);
            allGood = false;
        } else if (component.includes('SearchContext.js') && content.includes('useOpenAI')) {
            console.log(`✅ ${component}: Has useOpenAI import for legacy fallback (expected)`);
        } else {
            console.log(`✅ ${component}: No direct OpenAI imports`);
        }
        
        // Check that it's getting LLM functions from SearchContext
        if (component.includes('components/') && (content.includes('generateSummary') || content.includes('generateComprehensiveSummary'))) {
            if (content.includes('useSearch()') && content.includes('generateComprehensiveSummary')) {
                console.log(`✅ ${component}: Using LLM functions from SearchContext`);
            } else {
                console.log(`⚠️  ${component}: May not be using SearchContext for LLM functions`);
            }
        }
    }
    
    // Check that SearchContext is configured correctly
    const searchContextPath = path.join(__dirname, 'src/contexts/SearchContext.js');
    const searchContextContent = fs.readFileSync(searchContextPath, 'utf8');
    
    if (searchContextContent.includes('config.api.useApiLayer ? apiLLM : legacyLLM')) {
        console.log('✅ SearchContext: Correctly configured to use API or legacy LLM hooks');
    } else {
        console.log('❌ SearchContext: Missing API/legacy hook selection');
        allGood = false;
    }
    
    // Check API LLM hook configuration
    const apiLLMPath = path.join(__dirname, 'src/hooks/useApiLLM.js');
    const apiLLMContent = fs.readFileSync(apiLLMPath, 'utf8');
    
    if (apiLLMContent.includes('config.api.baseUrl') && apiLLMContent.includes('getAuthHeaders()')) {
        console.log('✅ useApiLLM: Correctly configured to use API endpoints with authentication');
    } else {
        console.log('❌ useApiLLM: Missing API configuration or authentication');
        allGood = false;
    }
    
    if (allGood) {
        console.log('\n🎉 All LLM functions are correctly configured to use the API layer!');
        console.log('\n📋 Summary:');
        console.log('• Components no longer import useOpenAI directly');
        console.log('• All LLM functions go through SearchContext');
        console.log('• SearchContext automatically chooses API or legacy based on config');
        console.log('• API mode includes user authentication and context');
        console.log('\n🚀 Test your setup:');
        console.log('1. Set REACT_APP_USE_API_LAYER=true in .env');
        console.log('2. Start API: cd api && python run.py');
        console.log('3. Start React: npm start');
        console.log('4. Try generating summaries - they should go through the API!');
    } else {
        console.log('\n❌ Some issues found with LLM integration');
    }
}

testLLMIntegration();