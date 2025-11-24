# Deployment Guide

This Before/After Reels Tool is a fully static web application that can be hosted on any static hosting service.

## 🌐 Live Demo

**GitHub Pages URL**: https://rizwansoaib.github.io/reels/

The application is automatically deployed to GitHub Pages whenever changes are pushed to the main branch.

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended)

The repository is already configured with GitHub Pages. The workflow will automatically deploy when:
- Changes are pushed to the main branch
- Manually triggered from Actions tab

**Setup Steps:**
1. Go to your repository settings
2. Navigate to "Pages" section
3. Under "Build and deployment":
   - Source: GitHub Actions
4. The site will be available at: `https://[username].github.io/[repository-name]/`

### Option 2: Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rizwansoaib/reels)

**Manual Deployment:**
1. Sign up at [netlify.com](https://www.netlify.com/)
2. Drag and drop the entire repository folder
3. Or connect your GitHub repository
4. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: (leave empty or use `.`)

### Option 3: Vercel

**Steps:**
1. Sign up at [vercel.com](https://vercel.com/)
2. Click "New Project"
3. Import your GitHub repository
4. Deploy settings:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
5. Click "Deploy"

### Option 4: Cloudflare Pages

**Steps:**
1. Sign up at [cloudflare.com](https://www.cloudflare.com/)
2. Go to Pages
3. Connect to Git
4. Select your repository
5. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`
6. Click "Save and Deploy"

### Option 5: Firebase Hosting

**Steps:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project
# Public directory: .
# Single-page app: No
firebase deploy
```

### Option 6: GitHub.io (Simple)

Just open the `index.html` file directly in your browser! No server needed.

## 📦 What Gets Deployed

The deployment includes:
- `index.html` - Main application (self-contained)
- `demo.html` - Alternative demo file
- `BeforeAfterReelsTool.jsx` - React component source
- `README.md` - Documentation
- `example-integration.jsx` - Integration examples
- `SUMMARY.md` - Implementation summary

## 🔧 Local Testing

To test locally before deployment:

```bash
# Option 1: Python simple server
python -m http.server 8000
# Then open: http://localhost:8000

# Option 2: Node.js simple server
npx http-server
# Then open: http://localhost:8080

# Option 3: Just open the file
# Double-click index.html in your file explorer
```

## 🌟 Features

- ✅ No build process required
- ✅ No dependencies to install
- ✅ Works offline once loaded
- ✅ All assets loaded from CDN
- ✅ Mobile responsive
- ✅ Cross-browser compatible

## 📱 Mobile Access

Once deployed, you can:
1. Access the URL on your mobile device
2. Add to home screen for app-like experience (iOS/Android)
3. Use directly for creating reels
4. Screen record the animations

## 🔒 Security Notes

- All processing happens client-side
- No data is sent to any server
- Images are processed locally in the browser
- Safe to use with private/sensitive images

## 🆘 Troubleshooting

**GitHub Pages not working?**
- Ensure GitHub Actions is enabled in repository settings
- Check that Pages is set to deploy from GitHub Actions
- Wait a few minutes after the workflow completes

**Blank page on deployment?**
- Check browser console for errors
- Ensure all CDN links are accessible
- Verify HTTPS is enabled on your hosting service

**Images not uploading?**
- Check file size (keep under 10MB)
- Verify file format (JPEG, PNG, GIF, WebP)
- Try a different browser

## 📊 Monitoring

Check deployment status:
- GitHub: Actions tab → Deploy to GitHub Pages workflow
- Netlify: Deploys tab
- Vercel: Deployments tab
- Cloudflare: Pages dashboard

## 🔄 Updates

To update the live site:
1. Make changes to your files
2. Commit and push to main branch
3. GitHub Actions will automatically redeploy
4. Changes live in ~1-2 minutes

---

**Repository**: https://github.com/rizwansoaib/reels  
**Live Demo**: https://rizwansoaib.github.io/reels/  
**Issues**: https://github.com/rizwansoaib/reels/issues
