# Ghost Article Tagger - Application Overview

## Project Summary
A Next.js web application for tagging Ghost CMS blog articles using AI (Google Gemini 2.5 Pro). Converted from a PyQt6 desktop application to enable team collaboration via Railway deployment.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (password: iabacus4dm1n)
- **Drag & Drop**: @dnd-kit
- **APIs**: Ghost Admin API, Ghost Content API, Google Gemini 2.5 Pro
- **Deployment**: Railway (auto-deploys from GitHub main branch)

## Key Features

### 4-Column Workflow
1. **New Column** (Left)
   - Drag-and-drop reorderable list of selected tags
   - These are the tags that will be saved to the article
   - Can remove individual tags or clear all

2. **Existing Column**
   - Shows current tags already on the selected article
   - Click to add to New column
   - "Add All" button to bulk add
   - Tags grey out when already in New

3. **Library Column**
   - Categorized tag library loaded from JSON file
   - Collapsible categories with tag counts
   - Search functionality across all tags
   - Click to add tags to New column
   - Editable via "Edit Library" button

4. **AI Column**
   - AI-generated tag suggestions from Gemini 2.5 Pro
   - Click "Generate AI Tags" to analyze article
   - Click tags to add to New column
   - "Add All" button to bulk add
   - Prompt is editable via "Edit Prompt" button

### Additional Features
- **Article Preview**: View full article content in modal
- **Open Blog**: Direct link to published article
- **Save Confirmation**: Dialog with option to open article after saving
- **Consistent Capitalization**: Auto-capitalizes first letter of each word, preserves acronyms
- **Uniform Tag Display**: Compact, consistent styling across all columns

## File Structure

### Core Application Files
- `app/page.tsx` - Main application page with 4-column layout
- `app/login/page.tsx` - Login page
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration

### API Routes
- `app/api/posts/route.ts` - Fetch all articles from Ghost
- `app/api/posts/[id]/route.ts` - Fetch single article content
- `app/api/tags/generate/route.ts` - Generate AI tag suggestions
- `app/api/tags/update/route.ts` - Save tags to Ghost article
- `app/api/library/route.ts` - Read/write tag library JSON
- `app/api/prompt/route.ts` - Read/write AI prompt text file

### Components
- `app/components/NewColumn.tsx` - Drag-and-drop selected tags column
- `app/components/TagColumn.tsx` - Reusable column for Existing/AI tags
- `app/components/LibraryColumn.tsx` - Categorized library with search
- `app/components/ArticlePreview.tsx` - Article preview modal
- `app/components/LibraryEditor.tsx` - Edit tag library JSON
- `app/components/PromptEditor.tsx` - Edit AI prompt template

### Library Files
- `lib/ghost.ts` - Ghost CMS API integration (Admin & Content APIs)
- `lib/gemini.ts` - Google Gemini API integration
- `lib/utils.ts` - Tag capitalization utilities
- `lib/tag-library.json` - Categorized tag library
- `lib/ai-prompt.txt` - Editable AI prompt template

## Environment Variables
Required in `.env.local` and Railway:
```
GHOST_ADMIN_API_KEY=your_admin_key
GHOST_CONTENT_API_KEY=your_content_key
GHOST_API_URL=https://blog.iabacus.com
GEMINI_API_KEY=your_gemini_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-app-url.up.railway.app
APP_PASSWORD=iabacus4dm1n
```

## Important Implementation Details

### Ghost API Integration
- Uses JWT authentication with server time sync for Admin API
- Admin API: POST/PUT operations (updating tags)
- Content API: GET operations with query params (reading articles)
- Server time offset handling for JWT signature validation

### Tag Capitalization
- Function: `capitalizeTag()` in `lib/utils.ts`
- Capitalizes first letter of each word
- Preserves acronyms (≤5 chars, all uppercase)
- Applied to ALL tag sources (existing, AI, library, manual)

### Library Refresh Mechanism
- LibraryColumn fetches from API (not static import)
- Uses `key={libraryKey}` prop to force remount
- Increment libraryKey on save to trigger refresh
- Prevents stale data after editing

### AI Prompt System
- Template stored in `lib/ai-prompt.txt`
- Variables: {title}, {content}, {existing_tags}
- Editable through UI (PromptEditor component)
- Falls back to DEFAULT_PROMPT if file read fails

## Development

### Local Development
```bash
cd ghost-tagger
npm install
npm run dev
# Runs on http://localhost:3000
```

### Testing Locally
- Login with password: iabacus4dm1n
- Select an article from dropdown
- Generate AI tags and/or add from library
- Drag to reorder in New column
- Save and verify on blog

### Deployment
- Push to GitHub main branch
- Railway auto-deploys
- Check Railway logs for errors
- Common issue: NEXTAUTH_SECRET not reading (fallback in place)

## Common Issues & Solutions

### Library Not Refreshing After Edit
- **Cause**: Static JSON import instead of API fetch
- **Solution**: LibraryColumn now fetches from `/api/library`
- **Fixed in**: commit 463e98c

### Tags Not Capitalizing
- **Cause**: Not applying capitalizeTag() to all sources
- **Solution**: Apply to existing, AI, library, and manual tags
- **Fixed in**: Previous commit

### Generate AI Tags Button Overflow
- **Cause**: Long titles pushing button off screen
- **Solution**: Flex column layout on mobile (flex-col sm:flex-row)
- **Fixed in**: Previous commit

### TypeScript Implicit Any Errors
- **Cause**: Missing type annotations in .map()/.filter()
- **Solution**: Add explicit `(t: string)` type annotations
- **Fixed in**: lib/gemini.ts

## Key User Requests
1. Web app instead of desktop (Railway deployment)
2. 4-column workflow (New, Existing, Library, AI)
3. Compact, uniform tag display
4. Consistent capitalization
5. Editable library through UI
6. Editable AI prompt through UI
7. Article preview functionality
8. Open blog article link
9. Save confirmation dialog

## Future Considerations
- Add tag analytics (most used, recent, etc.)
- Bulk tagging for multiple articles
- Tag synonyms/aliases
- Export/import library
- Tag usage history
- Custom AI models/providers
- Mobile responsiveness improvements
