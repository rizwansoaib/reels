# Before/After Reels Tool

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rizwansoaib.github.io/reels/)
[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-blue)](https://rizwansoaib.github.io/reels/)
[![No Build Required](https://img.shields.io/badge/build-none-success)]()
[![Self Contained](https://img.shields.io/badge/dependencies-none-green)]()

A powerful, self-contained React component for creating stunning animated transitions between BEFORE and AFTER images with professional visual effects. Fully responsive and optimized for mobile recording.

## 🎯 Live Demo

**Try it now**: [https://rizwansoaib.github.io/reels/](https://rizwansoaib.github.io/reels/)

No installation needed - just open the link and start creating reels!

## 🎬 Features

- **Multiple Transition Effects**: 5 built-in professional effects
  - 🔍 **Shock Zoom**: Dynamic zoom in/out transition
  - 🌈 **RGB Glitch**: Digital glitch effect with RGB channel separation
  - 🔥 **Film Burn**: Cinematic burn-through transition
  - ✨ **Particle Burst**: Explosive particle animation
  - 👉 **Wipe Reveal**: Smooth directional wipe with edge effects

- **Canvas Rendering**: High-quality 1080×1920 vertical format (9:16 aspect ratio)
- **Smooth Animation**: requestAnimationFrame-based smooth playback
- **Responsive Design**: Adapts to all screen sizes (mobile, tablet, desktop)
- **Customizable Settings**: Adjustable duration (1-10s) and intensity (0-100%)
- **Tailwind CSS**: Beautiful, modern UI design
- **Self-Contained**: No external dependencies or backend required
- **Mobile Friendly**: Optimized for screen recording on mobile devices

## 🚀 Quick Start

### Installation

Simply copy `BeforeAfterReelsTool.jsx` to your project.

### Basic Usage

```jsx
import BeforeAfterReelsTool from './BeforeAfterReelsTool';

function App() {
  return (
    <BeforeAfterReelsTool 
      defaultDuration={3}
      defaultIntensity={0.8}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultDuration` | number | `3` | Default animation duration in seconds (1-10) |
| `defaultIntensity` | number | `0.8` | Default effect intensity (0-1) |

## 📦 Requirements

- React 16.8+ (uses hooks)
- Tailwind CSS (for styling)
- Modern browser with:
  - Canvas API support
  - requestAnimationFrame support

## 🎨 Transition Effects Details

### Shock Zoom
Creates a dramatic zoom effect where the BEFORE image zooms in while fading out, and the AFTER image zooms out while fading in.

### RGB Glitch
Applies a digital glitch effect with RGB channel separation, creating horizontal displacement and scan lines for a cyberpunk aesthetic.

### Film Burn
Simulates a film burn-through effect with a radial burn pattern, glowing edges, and particle embers revealing the AFTER image.

### Particle Burst
Generates an explosive particle burst emanating from the center, with colorful particles creating a dynamic transition.

### Wipe Reveal
A directional wipe from left to right with a glowing edge and motion lines for added impact.

## 💻 Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- Canvas API
- FileReader API (for image upload)
- requestAnimationFrame

Tested on:
- Chrome 80+
- Firefox 75+
- Safari 14+ (iOS and macOS)
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## 🔧 Integration Examples

### Vite

```jsx
// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import BeforeAfterReelsTool from './BeforeAfterReelsTool';
import './index.css'; // Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BeforeAfterReelsTool />
  </React.StrictMode>
);
```

### Create React App

```jsx
// App.js
import BeforeAfterReelsTool from './BeforeAfterReelsTool';
import './App.css';

function App() {
  return <BeforeAfterReelsTool />;
}

export default App;
```

### Next.js

```jsx
// pages/reels.js
import dynamic from 'next/dynamic';

const BeforeAfterReelsTool = dynamic(
  () => import('../components/BeforeAfterReelsTool'),
  { ssr: false }
);

export default function ReelsPage() {
  return <BeforeAfterReelsTool />;
}
```

## 🎯 Usage Instructions

1. **Upload Images**: Click "BEFORE Image" and "AFTER Image" buttons to upload your images
2. **Select Effect**: Choose one of the 5 transition effects
3. **Adjust Settings**: Fine-tune duration and intensity sliders
4. **Play**: Click "Play Preview" to see the animation
5. **Record on Mobile**: Use your device's screen recording feature to capture the animation

### 📱 Recording on Mobile Devices

**iOS (iPhone/iPad):**
1. Add Screen Recording to Control Center (Settings → Control Center)
2. Swipe down from top-right corner
3. Tap the Record button
4. Play the animation
5. Stop recording when complete

**Android:**
1. Swipe down twice to open Quick Settings
2. Tap "Screen Record"
3. Play the animation
4. Stop recording when complete

## 📐 Canvas Specifications

- **Resolution**: 1080×1920 pixels
- **Aspect Ratio**: 9:16 (vertical/portrait)
- **Format**: Optimized for social media reels (Instagram, TikTok, YouTube Shorts)
- **Playback**: Smooth 60 FPS animation
- **Responsive**: Canvas scales to fit screen while maintaining aspect ratio

## 🛠️ Customization

### Adding Custom Effects

To add your own transition effect:

```jsx
// Add to the effect functions section
const applyCustomEffect = (ctx, t) => {
  const beforeImg = beforeImageRef.current;
  const afterImg = afterImageRef.current;
  
  if (!beforeImg || !afterImg) return;
  
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Your custom effect logic here
  // t is the progress (0-1)
  // Use drawImage(ctx, img, alpha) helper
};

// Add to the effect selector
const getEffectFunction = () => {
  switch (selectedEffect) {
    case 'customEffect':
      return applyCustomEffect;
    // ... other cases
  }
};

// Add to the UI buttons
{ id: 'customEffect', label: 'Custom Effect' }
```

### Styling Customization

The component uses Tailwind CSS classes. Modify the className strings to customize the appearance.

## 📝 Technical Notes

- Images are automatically scaled and centered to fit the canvas
- Animation uses requestAnimationFrame for smooth 60 FPS playback
- Fully responsive layout adapts to screen size
- Canvas maintains 9:16 aspect ratio on all devices
- No server-side processing required - everything runs client-side
- Optimized for mobile screen recording

## 🐛 Troubleshooting

**Images don't upload:**
- Verify file is a valid image format (JPEG, PNG, GIF, WebP)
- Check file size (very large images may cause performance issues)
- Ensure browser has permission to access files

**Animation is choppy:**
- Reduce image resolution before uploading
- Close other browser tabs/apps
- Try reducing intensity setting
- On mobile, close background apps for better performance

**Canvas not displaying properly:**
- Ensure Tailwind CSS is properly loaded
- Check browser console for errors
- Try refreshing the page

## 📄 License

This component is provided as-is for use in any project.

## 🌐 Deployment

This application is automatically deployed to GitHub Pages. See [DEPLOY.md](DEPLOY.md) for:
- Live demo link
- Deployment to other platforms (Netlify, Vercel, Cloudflare Pages, Firebase)
- Local testing instructions
- Troubleshooting tips

**Quick Deploy Options:**
- GitHub Pages: Already configured with GitHub Actions
- Netlify: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/rizwansoaib/reels)
- Vercel: Connect repository and deploy
- Or simply open `index.html` in any browser!

## 🤝 Contributing

Feel free to enhance the component with additional effects, optimizations, or features!
