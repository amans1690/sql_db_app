# Netlify Deployment Guide

This guide will help you deploy your SQL Query Application to Netlify.

## 📋 Prerequisites

- A GitHub account (or GitLab/Bitbucket)
- A Netlify account
- Your code pushed to a Git repository

## 🚀 Deployment Steps

### 1. Prepare Your Repository

Make sure your project is committed and pushed to GitHub:

```bash
git add .
git commit -m "Add Netlify configuration"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Continuous Deployment (Recommended)

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select your repository

2. **Configure Build Settings:**
   Netlify will automatically detect the following from `netlify.toml`:
   - **Build command:** `npm run build:netlify`
   - **Publish directory:** `build`
   - **Node version:** 18

3. **Deploy:**
   - Click "Deplicate site"
   - Netlify will automatically build and deploy your app

#### Option B: Manual Deploy

1. **Build the project:**
   ```bash
   npm run build:netlify
   ```

2. **Deploy manually:**
   - Zip the entire project folder
   - Go to Netlify → "Add new site" → "Deploy manually"
   - Upload the zip file

## 🔧 Configuration Details

### Build Configuration (`netlify.toml`)

```toml
[build]
  base = "."
  publish = "build"
  command = "npm run build:netlify"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--production=false"
```

### Serverless Functions

Your Express.js server will automatically run as a Netlify Function:
- **Location:** `netlify/functions/server.js`
- **Handler:** Processes API routes (`/api/*`)
- **Routes:** All API endpoints preserved

### Redirects

The `_redirects` file in the `public` folder handles:
- **API routes** → Serverless functions
- **SPA routing** → React app for all other routes

## 🌐 Environment Variables

If you need environment variables in production:

1. Go to your Netlify site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add any required variables

## 📊 Monitoring & Debugging

### View Logs
- Go to your Netlify dashboard
- Click "Functions" tab
- Check function logs for any errors

### Test Your Deployment
Once deployed, test these endpoints:
- `https://your-site.netlify.app/` (Main app)
- `https://your-site.netlify.app/api/tables` (API test)
- `https://your-site.netlify.app/api/health` (Health check)

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check the build logs in Netlify dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Routes Not Working:**
   - Check function logs in the Functions tab
   - Verify `netlife/functions/server.js` is correctly configured
   - Test function directly in Netlify

3. **CSV Files Not Loading:**
   - Ensure CSV files are committed to the repository
   - Check file paths in `server.js`
   - Verify function has access to files

### Local Testing

Test your Netlify configuration locally:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build:netlify

# Test locally
netlify dev
```

## 📝 File Structure After Deployment

```
Your Repository/
├── netlify.toml              # Netlify configuration
├── netlify/
│   └── functions/
│       └── server.js         # Serverless function handler
├── public/
│   └── _redirects            # Netlify redirects
├── example_csv/              # CSV data files
├── src/                      # React source code
├── build/                    # Built React app (generated)
└── server.js                 # Express server
```

## 🎯 Performance Optimizations

Netlify automatically provides:
- **CDN:** Global content delivery
- **Caching:** Static files cached for performance
- **HTTPS:** SSL certificates included
- **Headless Forms:** Form handling capabilities

## 🔄 Continuous Deployment

With continuous deployment enabled:
- Every push to your main branch triggers a new deployment
- Preview deployments created for pull requests
- Build status notifications via email/webhook

## 🛠️ Advanced Configuration

### Custom Headers

The `netlify.toml` includes security and caching headers:
- Security headers (XSS protection, content type options)
- Cache control for static assets
- Performance optimizations

### Environment Detection

Your server automatically detects Netlify environment:
```javascript
const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME;
```

This prevents trying to start a regular server in serverless mode.

## 📞 Support

If you encounter issues:
1. Check Netlify documentation: [docs.netlify.com](https://docs.netlify.com)
2. Review build and function logs
3. Test locally with `netlify dev`
4. Check your repository's file structure

---

**Happy Deploying! 🚀**
