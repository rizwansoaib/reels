import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * BeforeAfterReelsTool - A React component for creating animated transitions
 * between BEFORE and AFTER images with various effects
 * 
 * Props:
 * - defaultDuration: Default animation duration in seconds (default: 3)
 * - defaultIntensity: Default effect intensity (0-1, default: 0.8)
 */
const BeforeAfterReelsTool = ({ 
  defaultDuration = 3, 
  defaultIntensity = 0.8 
}) => {
  const canvasRef = useRef(null);
  const beforeImageRef = useRef(null);
  const afterImageRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState('shockZoom');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(defaultDuration);
  const [intensity, setIntensity] = useState(defaultIntensity);
  const [progress, setProgress] = useState(0);

  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;

  // Load image from file
  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const img = await loadImage(file);
      if (type === 'before') {
        beforeImageRef.current = img;
        setBeforeImage(img);
      } else {
        afterImageRef.current = img;
        setAfterImage(img);
      }
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Failed to load image. Please try again.');
    }
  };

  // Draw image centered and scaled to fit canvas
  const drawImage = (ctx, img, alpha = 1) => {
    if (!img) return;

    ctx.save();
    ctx.globalAlpha = alpha;

    const scale = Math.max(
      CANVAS_WIDTH / img.width,
      CANVAS_HEIGHT / img.height
    );

    const x = (CANVAS_WIDTH - img.width * scale) / 2;
    const y = (CANVAS_HEIGHT - img.height * scale) / 2;

    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    ctx.restore();
  };

  // Effect: Shock Zoom
  const applyShockZoom = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;

    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Calculate zoom and position
    const zoomPhase = t < 0.5 ? t * 2 : (1 - t) * 2;
    const zoom = 1 + zoomPhase * intensity * 0.3;
    
    // Draw before image (fading out)
    if (t < 0.8) {
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      drawImage(ctx, beforeImg, Math.max(0, 1 - t * 1.5));
      ctx.restore();
    }

    // Draw after image (fading in)
    if (t > 0.2) {
      ctx.save();
      const afterZoom = 1 + (1 - t) * intensity * 0.5;
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.scale(afterZoom, afterZoom);
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      drawImage(ctx, afterImg, Math.min(1, (t - 0.2) * 1.5));
      ctx.restore();
    }
  };

  // Effect: RGB Glitch
  const applyRGBGlitch = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;

    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw base image
    const showBefore = t < 0.5;
    drawImage(ctx, showBefore ? beforeImg : afterImg, 1);

    // Apply RGB split glitch during transition
    const glitchIntensity = Math.sin(t * Math.PI) * intensity;
    
    if (glitchIntensity > 0.1) {
      const offset = glitchIntensity * 20;
      
      // Red channel
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.5;
      ctx.translate(-offset, 0);
      drawImage(ctx, showBefore ? afterImg : beforeImg, glitchIntensity);
      ctx.restore();

      // Blue channel
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.5;
      ctx.translate(offset, 0);
      drawImage(ctx, showBefore ? afterImg : beforeImg, glitchIntensity);
      ctx.restore();
    }
  };

  // Effect: Film Burn
  const applyFilmBurn = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;

    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw before image
    drawImage(ctx, beforeImg, 1);

    // Create burn effect
    const burnProgress = t;
    const burnRadius = Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2) * burnProgress;

    // Use deterministic center position based on intensity
    const centerX = CANVAS_WIDTH / 2 + Math.sin(intensity * Math.PI) * 50 * intensity;
    const centerY = CANVAS_HEIGHT / 2 + Math.cos(intensity * Math.PI) * 50 * intensity;

    // Draw burning glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, burnRadius * 0.7,
      centerX, centerY, burnRadius
    );
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0)');
    gradient.addColorStop(0.5, `rgba(255, 150, 50, ${intensity * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw after image through burn hole
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, burnRadius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, burnRadius * 0.9, 0, Math.PI * 2);
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();

    // Add noise/grain to burn edge
    if (burnProgress < 0.95) {
      ctx.save();
      ctx.globalAlpha = intensity * 0.3;
      for (let i = 0; i < 100; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = burnRadius * (0.85 + Math.random() * 0.15);
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;
        const size = Math.random() * 5 + 2;
        
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${Math.random()})`;
        ctx.fillRect(x, y, size, size);
      }
      ctx.restore();
    }
  };

  // Effect: Particle Burst
  const applyParticleBurst = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;

    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background transitions from before to after
    drawImage(ctx, beforeImg, Math.max(0, 1 - t));
    drawImage(ctx, afterImg, Math.min(1, t));

    // Create particle burst effect
    const particleCount = Math.floor(200 * intensity);
    const burstPhase = Math.sin(t * Math.PI);

    if (burstPhase > 0.1) {
      ctx.save();
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + t * Math.PI * 0.5;
        const distance = burstPhase * (300 + i * 2) * intensity;
        const size = (1 - burstPhase) * (8 + Math.random() * 4);
        
        const x = CANVAS_WIDTH / 2 + Math.cos(angle) * distance;
        const y = CANVAS_HEIGHT / 2 + Math.sin(angle) * distance;

        // Vary particle colors
        const hue = (i / particleCount) * 360;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${(1 - burstPhase) * 0.8})`;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        glow.addColorStop(0, `hsla(${hue}, 80%, 70%, ${(1 - burstPhase) * 0.5})`);
        glow.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  };

  // Effect: Wipe Reveal
  const applyWipeReveal = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;

    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw before image
    drawImage(ctx, beforeImg, 1);

    // Calculate wipe position
    const wipeX = t * CANVAS_WIDTH;
    const edgeWidth = 50 * intensity;

    // Draw after image with clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, wipeX, CANVAS_HEIGHT);
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();

    // Draw wipe edge effect
    const gradient = ctx.createLinearGradient(
      wipeX - edgeWidth, 0,
      wipeX + edgeWidth, 0
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.8})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(wipeX - edgeWidth, 0, edgeWidth * 2, CANVAS_HEIGHT);

    // Add diagonal motion lines
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.4})`;
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
      const offset = i * 30 - 150;
      ctx.beginPath();
      ctx.moveTo(wipeX + offset, 0);
      ctx.lineTo(wipeX + offset + 200, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Get the current effect function
  const getEffectFunction = () => {
    switch (selectedEffect) {
      case 'shockZoom':
        return applyShockZoom;
      case 'rgbGlitch':
        return applyRGBGlitch;
      case 'filmBurn':
        return applyFilmBurn;
      case 'particleBurst':
        return applyParticleBurst;
      case 'wipeReveal':
        return applyWipeReveal;
      default:
        return applyShockZoom;
    }
  };

  // Animation loop
  const animate = useCallback((startTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const currentTime = Date.now();
    const elapsed = (currentTime - startTime) / 1000;
    const t = Math.min(elapsed / duration, 1);

    setProgress(t);

    const effectFn = getEffectFunction();
    effectFn(ctx, t);

    if (t < 1) {
      animationFrameRef.current = requestAnimationFrame(() => animate(startTime));
    } else {
      setIsPlaying(false);
    }
  }, [duration, selectedEffect, intensity]);

  // Play animation
  const playAnimation = () => {
    if (!beforeImage || !afterImage) {
      alert('Please upload both BEFORE and AFTER images');
      return;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setIsPlaying(true);
    setProgress(0);
    animate(Date.now());
  };

  // Stop animation
  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 text-center">
          Before/After Reels Tool
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Panel - Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-2xl">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full rounded-lg shadow-lg bg-black"
                style={{ aspectRatio: '9/16' }}
              />
              
              {/* Progress Bar */}
              {isPlaying && (
                <div className="mt-3 sm:mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  <p className="text-white text-sm mt-2 text-center">
                    {(progress * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Controls */}
          <div className="space-y-4 sm:space-y-6">
            {/* Image Upload */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Upload Images</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    BEFORE Image {beforeImage && '✓'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'before')}
                    className="w-full text-xs sm:text-sm text-white file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    AFTER Image {afterImage && '✓'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'after')}
                    className="w-full text-xs sm:text-sm text-white file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Effect Selection */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Transition Effect</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                {[
                  { id: 'shockZoom', label: 'Shock Zoom' },
                  { id: 'rgbGlitch', label: 'RGB Glitch' },
                  { id: 'filmBurn', label: 'Film Burn' },
                  { id: 'particleBurst', label: 'Particle Burst' },
                  { id: 'wipeReveal', label: 'Wipe Reveal' }
                ].map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setSelectedEffect(effect.id)}
                    className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all ${
                      selectedEffect === effect.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg sm:scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {effect.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4">Settings</h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Duration: {duration}s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Intensity: {(intensity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={intensity}
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
              <button
                onClick={isPlaying ? stopAnimation : playAnimation}
                disabled={!beforeImage || !afterImage}
                className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm sm:text-base font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPlaying ? '⏸ Stop' : '▶ Play Preview'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center text-white/60 text-xs sm:text-sm">
          <p>Canvas Resolution: {CANVAS_WIDTH}×{CANVAS_HEIGHT} (Vertical 9:16)</p>
          <p className="mt-2">Self-contained React component • No backend required</p>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterReelsTool;
