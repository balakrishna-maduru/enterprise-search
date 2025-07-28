#!/bin/bash

# Script to fix all useUser imports to use useUnifiedUser

echo "Fixing useUser imports in React components..."

# List of files to update (excluding the context files themselves)
files=(
    "src/components/Chat/ChatSidebar.js"
    "src/components/Search/SavedSearchesDropdown.js"
    "src/components/Search/SharedSearchesManagement.js"
    "src/components/Results/ResultsSection.js"
    "src/components/Common/RatingButtons.js"
    "src/components/SavedSearches/SavedSearchModal.js"
    "src/components/SavedSearches/SavedSearchesModal.js"
    "src/components/Summary/SummaryModal.js"
    "src/hooks/useSavedSearches.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Replace the import
        sed -i '' 's/import { useUser } from.*UserContext.*/import { useUnifiedUser } from "..\/..\/hooks\/useUnifiedUser";/g' "$file"
        
        # Handle different path depths
        sed -i '' 's/import { useUser } from.*UserContext.*/import { useUnifiedUser } from "..\/hooks\/useUnifiedUser";/g' "$file"
        
        # Replace the hook usage
        sed -i '' 's/useUser()/useUnifiedUser()/g' "$file"
        
        echo "✅ Updated $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo "Done! All useUser imports have been updated to useUnifiedUser."