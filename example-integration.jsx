// ============================================
// EXAMPLE INTEGRATION FILES
// ============================================

// ==========================================
// 1. Vite + React Setup
// ==========================================

// File: main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import BeforeAfterReelsTool from './BeforeAfterReelsTool';
import './index.css'; // Make sure Tailwind CSS is imported

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BeforeAfterReelsTool 
      defaultDuration={3}
      defaultIntensity={0.8}
    />
  </React.StrictMode>
);

// ==========================================
// 2. Create React App Setup
// ==========================================

// File: App.js
import BeforeAfterReelsTool from './BeforeAfterReelsTool';
import './App.css'; // Make sure Tailwind CSS is imported

function App() {
  return (
    <div className="App">
      <BeforeAfterReelsTool 
        defaultDuration={4}
        defaultIntensity={0.7}
      />
    </div>
  );
}

export default App;

// ==========================================
// 3. Next.js Setup
// ==========================================

// File: pages/reels.js
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with canvas
const BeforeAfterReelsTool = dynamic(
  () => import('../components/BeforeAfterReelsTool'),
  { ssr: false }
);

export default function ReelsPage() {
  return (
    <div>
      <BeforeAfterReelsTool 
        defaultDuration={5}
        defaultIntensity={0.9}
      />
    </div>
  );
}

// ==========================================
// 4. Custom Integration with State Management
// ==========================================

// File: CustomReelsPage.jsx
import React, { useState } from 'react';
import BeforeAfterReelsTool from './BeforeAfterReelsTool';

function CustomReelsPage() {
  const [settings, setSettings] = useState({
    duration: 3,
    intensity: 0.8
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Custom controls */}
      <div className="p-4 bg-gray-800 text-white">
        <h1>Custom Reels Creator</h1>
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => setSettings({ duration: 2, intensity: 0.5 })}
            className="px-4 py-2 bg-blue-500 rounded"
          >
            Quick & Subtle
          </button>
          <button 
            onClick={() => setSettings({ duration: 5, intensity: 1 })}
            className="px-4 py-2 bg-red-500 rounded"
          >
            Slow & Dramatic
          </button>
        </div>
      </div>
      
      {/* Component */}
      <BeforeAfterReelsTool 
        defaultDuration={settings.duration}
        defaultIntensity={settings.intensity}
      />
    </div>
  );
}

export default CustomReelsPage;

// ==========================================
// 5. Tailwind CSS Configuration
// ==========================================

// File: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

// File: index.css or App.css
/*
@tailwind base;
@tailwind components;
@tailwind utilities;
*/

// ==========================================
// 6. Standalone HTML File (CDN Version)
// ==========================================

/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Before/After Reels Tool</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Copy the BeforeAfterReelsTool component code here
    // Then render it
  </script>
</body>
</html>
*/

// ==========================================
// 7. Usage Tips
// ==========================================

/*
Tips for Best Results:

1. Image Optimization:
   - Recommended resolution: 1080x1920 or higher
   - Keep file size under 5MB for smooth performance
   - Use JPG for photos, PNG for graphics with transparency

2. Mobile Recording:
   - Use landscape orientation on tablets for better preview
   - Ensure good lighting when recording screen
   - Close background apps for smoother playback
   - Use native screen recording (iOS: Control Center, Android: Quick Settings)

3. Effect Selection Guide:
   - Shock Zoom: Best for dramatic transformations
   - RGB Glitch: Perfect for tech/digital content
   - Film Burn: Great for vintage/cinematic feel
   - Particle Burst: Ideal for celebrations/reveals
   - Wipe Reveal: Clean, professional transitions

4. Duration Settings:
   - Short (1-2s): Quick, snappy for social media
   - Medium (3-4s): Standard, balanced viewing
   - Long (5-10s): Detailed, dramatic reveals

5. Intensity Settings:
   - Low (0-40%): Subtle, professional
   - Medium (40-70%): Balanced, engaging
   - High (70-100%): Dramatic, attention-grabbing

6. Performance Optimization:
   - Reduce image size if experiencing lag
   - Close other browser tabs
   - Use Chrome or Edge for best performance
   - On mobile, clear browser cache if needed
*/
