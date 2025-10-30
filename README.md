# Ghost Article Tagger

AI-powered tagging tool for Ghost blog articles using Google Gemini AI. Features a modern web interface with drag-and-drop tag management, keyword extraction, and word cloud visualization.

## Features

- 🤖 **AI Tag Generation** - Generate relevant tags using Google Gemini 2.0 Flash
- 🎯 **Keyword Extraction** - Extract top keywords from articles with clickable word cloud
- 🔄 **Drag & Drop** - Reorder tags with smooth drag-and-drop interface
- ✏️ **Inline Editing** - Double-click tags to edit names
- 🎨 **Color Coding** - Visual distinction between AI, manual, new, and existing tags
- 🔒 **Password Protected** - Simple password authentication for team access
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **UI**: React with Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Authentication**: NextAuth.js
- **APIs**: Ghost Admin/Content API, Google Gemini API
- **Deployment**: Railway

## Prerequisites

- Node.js 18+ installed
- Ghost blog with Admin API access
- Google Gemini API key
- Railway account (for deployment)

## Local Development

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ghost-tagger.git
cd ghost-tagger
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Ghost API Configuration
GHOST_ADMIN_API_KEY=your_admin_api_key_here
GHOST_CONTENT_API_KEY=your_content_api_key_here
GHOST_API_URL=https://yourblog.com

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Authentication
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# App Password
APP_PASSWORD=your_secure_password_here
```

**To generate NEXTAUTH_SECRET**, run:

```bash
openssl rand -base64 32
```

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your APP_PASSWORD.

## Deployment to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/ghost-tagger.git
git push -u origin main
```

2. **Deploy on Railway**

   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `ghost-tagger` repository
   - Railway will auto-detect Next.js and deploy

3. **Configure environment variables**

   In Railway dashboard, go to Variables tab and add:

   ```
   GHOST_ADMIN_API_KEY=your_admin_api_key
   GHOST_CONTENT_API_KEY=your_content_api_key
   GHOST_API_URL=https://yourblog.com
   GEMINI_API_KEY=your_gemini_api_key
   NEXTAUTH_SECRET=your_random_secret
   NEXTAUTH_URL=https://your-app.railway.app
   APP_PASSWORD=your_secure_password
   NODE_ENV=production
   ```

4. **Redeploy** to apply environment variables

### Option 2: Deploy with Railway CLI

1. **Install Railway CLI**

```bash
npm install -g @railway/cli
```

2. **Login to Railway**

```bash
railway login
```

3. **Initialize project**

```bash
railway init
```

4. **Add environment variables**

```bash
railway variables set GHOST_ADMIN_API_KEY="your_key"
railway variables set GHOST_CONTENT_API_KEY="your_key"
railway variables set GHOST_API_URL="https://yourblog.com"
railway variables set GEMINI_API_KEY="your_key"
railway variables set NEXTAUTH_SECRET="your_secret"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set APP_PASSWORD="your_password"
railway variables set NODE_ENV="production"
```

5. **Deploy**

```bash
railway up
```

6. **Get your deployment URL**

```bash
railway domain
```

## Usage Guide

### 1. Sign In

- Navigate to your deployed URL
- Enter the APP_PASSWORD you configured

### 2. Select Article

- Choose an article from the dropdown
- Existing tags will be displayed

### 3. Generate AI Tags

- Click "🤖 Generate AI Tags"
- AI will suggest 10-20 relevant tags
- Keywords will be extracted and displayed in word cloud

### 4. Manage Tags

- **Drag & Drop**: Reorder tags (first tag = PRIMARY)
- **Double-click**: Edit tag names inline
- **Add Custom**: Click "+ Add Custom Tag" for manual tags
- **Word Cloud**: Click keywords to add as tags
- **Select/Deselect**: Use buttons to filter selections

### 5. Color Coding

- **Green**: AI-generated new tags
- **Orange**: Manually added new tags
- **White**: Existing tags

### 6. Special Tags

- Check `#toc` for Table of Contents
- Check `#sidebar` to add article to sidebar

### 7. Update Article

- Click "📝 Update Article Tags"
- Confirm tag order (first tag is PRIMARY)
- Tags will be updated in Ghost

## API Endpoints

- `GET /api/posts` - Fetch all posts
- `GET /api/posts/[id]` - Fetch single post with content
- `POST /api/tags/generate` - Generate AI tags and keywords
- `POST /api/tags/update` - Update post tags

## Configuration

### Ghost API Keys

Get your API keys from Ghost Admin:

1. Go to **Settings** → **Integrations**
2. Create a new **Custom Integration**
3. Copy the **Admin API Key** and **Content API Key**

### Google Gemini API

Get your API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### Password Protection

The app uses a simple password authentication:

- Set `APP_PASSWORD` in environment variables
- Share with your team
- Users enter this password to access the app

For production, consider implementing:

- Individual user accounts
- Role-based access control
- OAuth integration

## Troubleshooting

### "Unauthorized" errors

- Check your Ghost API keys are correct
- Verify GHOST_API_URL is correct (no trailing slash)

### "Failed to generate tags" errors

- Verify GEMINI_API_KEY is valid
- Check API quota limits

### Authentication issues

- Ensure NEXTAUTH_SECRET is set
- Update NEXTAUTH_URL to match your deployment URL
- Clear browser cookies and try again

### Railway deployment issues

- Check build logs in Railway dashboard
- Verify all environment variables are set
- Ensure NODE_ENV=production is set

## Development

### Project Structure

```
ghost-tagger/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth.js
│   │   ├── posts/        # Ghost posts API
│   │   └── tags/         # Tag operations
│   ├── components/       # React components
│   │   ├── TagList.tsx
│   │   ├── WordCloud.tsx
│   │   └── AuthProvider.tsx
│   ├── login/            # Login page
│   ├── layout.tsx
│   ├── page.tsx          # Main app
│   └── globals.css
├── lib/
│   ├── ghost.ts          # Ghost API functions
│   └── gemini.ts         # Gemini API functions
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── railway.toml          # Railway config
└── README.md
```

### Building for Production

```bash
npm run build
npm start
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Railway deployment logs
3. Open an issue on GitHub

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- Integrates with [Ghost CMS](https://ghost.org/)
- Deployed on [Railway](https://railway.app/)

---

Made with ❤️ for better blog tagging
