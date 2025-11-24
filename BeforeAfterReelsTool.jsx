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

  // Effect 6: Vertical Wipe
  const applyVerticalWipe = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const wipeY = t * CANVAS_HEIGHT;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_WIDTH, wipeY);
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 7: Circular Reveal
  const applyCircularReveal = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const maxRadius = Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2) / 2;
    const radius = t * maxRadius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 8: Zoom In
  const applyZoomIn = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const zoom = 1 + t * intensity * 2;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, beforeImg, 1 - t);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 9: Zoom Out
  const applyZoomOut = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const zoom = 2 - t * intensity;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, beforeImg, 1 - t);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 10: Slide Left
  const applySlideLeft = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const offset = t * CANVAS_WIDTH;
    ctx.save();
    ctx.translate(-offset, 0);
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH - offset, 0);
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 11: Slide Right
  const applySlideRight = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const offset = t * CANVAS_WIDTH;
    ctx.save();
    ctx.translate(offset, 0);
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(-CANVAS_WIDTH + offset, 0);
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 12: Slide Up
  const applySlideUp = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const offset = t * CANVAS_HEIGHT;
    ctx.save();
    ctx.translate(0, -offset);
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(0, CANVAS_HEIGHT - offset);
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 13: Slide Down
  const applySlideDown = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const offset = t * CANVAS_HEIGHT;
    ctx.save();
    ctx.translate(0, offset);
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(0, -CANVAS_HEIGHT + offset);
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 14: Fade Cross
  const applyFadeCross = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1 - t);
    drawImage(ctx, afterImg, t);
  };

  // Effect 15: Spin Clockwise
  const applySpinClockwise = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate(t * Math.PI * 2 * intensity);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, beforeImg, 1 - t);
    ctx.restore();
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate((t - 1) * Math.PI * 2 * intensity);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 16: Spin Counter-Clockwise
  const applySpinCounterClockwise = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate(-t * Math.PI * 2 * intensity);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, beforeImg, 1 - t);
    ctx.restore();
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate(-(t - 1) * Math.PI * 2 * intensity);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 17: Diagonal Wipe
  const applyDiagonalWipe = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(t * (CANVAS_WIDTH + CANVAS_HEIGHT), 0);
    ctx.lineTo(0, t * (CANVAS_WIDTH + CANVAS_HEIGHT));
    ctx.closePath();
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 18: Box Expand
  const applyBoxExpand = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const width = t * CANVAS_WIDTH;
    const height = t * CANVAS_HEIGHT;
    const x = (CANVAS_WIDTH - width) / 2;
    const y = (CANVAS_HEIGHT - height) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 19: Pixelate
  const applyPixelate = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const pixelSize = Math.max(1, Math.floor((1 - Math.abs(t * 2 - 1)) * 100 * intensity));
    
    if (t < 0.5) {
      drawImage(ctx, beforeImg, 1);
      if (pixelSize > 1) {
        ctx.imageSmoothingEnabled = false;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const w = Math.floor(CANVAS_WIDTH / pixelSize);
        const h = Math.floor(CANVAS_HEIGHT / pixelSize);
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCtx.drawImage(canvasRef.current, 0, 0, w, h);
        ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.imageSmoothingEnabled = true;
      }
    } else {
      drawImage(ctx, afterImg, 1);
      if (pixelSize > 1) {
        ctx.imageSmoothingEnabled = false;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const w = Math.floor(CANVAS_WIDTH / pixelSize);
        const h = Math.floor(CANVAS_HEIGHT / pixelSize);
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCtx.drawImage(canvasRef.current, 0, 0, w, h);
        ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.imageSmoothingEnabled = true;
      }
    }
  };

  // Effect 20: Blur Transition
  const applyBlurTransition = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const blurAmount = Math.sin(t * Math.PI) * 20 * intensity;
    ctx.filter = `blur(${blurAmount}px)`;
    drawImage(ctx, beforeImg, 1 - t);
    drawImage(ctx, afterImg, t);
    ctx.filter = 'none';
  };

  // Effect 21: Wave Distortion
  const applyWaveDistortion = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const amplitude = 30 * intensity;
    const frequency = 10;
    
    for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
      const offset = Math.sin((y / CANVAS_HEIGHT) * frequency + t * Math.PI * 2) * amplitude;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, y, CANVAS_WIDTH, 2);
      ctx.clip();
      ctx.translate(offset, 0);
      drawImage(ctx, t < 0.5 ? beforeImg : afterImg, 1);
      ctx.restore();
    }
  };

  // Effect 22: Ripple
  const applyRipple = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1 - t);
    drawImage(ctx, afterImg, t);

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const maxRadius = Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2) / 2;
    const rippleRadius = t * maxRadius;

    for (let i = 0; i < 5; i++) {
      const r = rippleRadius - i * 50;
      if (r > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - i / 5) * intensity * 0.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  };

  // Effect 23: Split Horizontal
  const applySplitHorizontal = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const split = t * CANVAS_HEIGHT / 2;
    
    ctx.save();
    ctx.translate(0, -split);
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.clip();
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(0, split);
    ctx.beginPath();
    ctx.rect(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.clip();
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    drawImage(ctx, afterImg, t);
  };

  // Effect 24: Split Vertical
  const applySplitVertical = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const split = t * CANVAS_WIDTH / 2;
    
    ctx.save();
    ctx.translate(-split, 0);
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.clip();
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    ctx.save();
    ctx.translate(split, 0);
    ctx.beginPath();
    ctx.rect(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.clip();
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    drawImage(ctx, afterImg, t);
  };

  // Effect 25: Flip Horizontal
  const applyFlipHorizontal = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 0);
    ctx.scale(Math.cos(t * Math.PI), 1);
    ctx.translate(-CANVAS_WIDTH / 2, 0);
    
    if (t < 0.5) {
      drawImage(ctx, beforeImg, 1);
    } else {
      drawImage(ctx, afterImg, 1);
    }
    ctx.restore();
  };

  // Effect 26: Flip Vertical
  const applyFlipVertical = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.translate(0, CANVAS_HEIGHT / 2);
    ctx.scale(1, Math.cos(t * Math.PI));
    ctx.translate(0, -CANVAS_HEIGHT / 2);
    
    if (t < 0.5) {
      drawImage(ctx, beforeImg, 1);
    } else {
      drawImage(ctx, afterImg, 1);
    }
    ctx.restore();
  };

  // Effect 27: Checkerboard
  const applyCheckerboard = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const gridSize = 10;
    const cellWidth = CANVAS_WIDTH / gridSize;
    const cellHeight = CANVAS_HEIGHT / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if ((i + j) % 2 === 0) {
          const delay = ((i + j) / (gridSize * 2)) * 0.5;
          const cellT = Math.max(0, Math.min(1, (t - delay) * 2));
          
          if (cellT > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            ctx.clip();
            drawImage(ctx, afterImg, cellT);
            ctx.restore();
          }
        }
      }
    }
  };

  // Effect 28: Random Blocks
  const applyRandomBlocks = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const gridSize = 15;
    const cellWidth = CANVAS_WIDTH / gridSize;
    const cellHeight = CANVAS_HEIGHT / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const random = (Math.sin(i * 12.9898 + j * 78.233) + 1) / 2;
        const delay = random * 0.5;
        const cellT = Math.max(0, Math.min(1, (t - delay) * 2));
        
        if (cellT > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
          ctx.clip();
          drawImage(ctx, afterImg, cellT);
          ctx.restore();
        }
      }
    }
  };

  // Effect 29: Venetian Blinds
  const applyVenetianBlinds = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const blindCount = 20;
    const blindHeight = CANVAS_HEIGHT / blindCount;

    for (let i = 0; i < blindCount; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, i * blindHeight, CANVAS_WIDTH * t, blindHeight);
      ctx.clip();
      drawImage(ctx, afterImg, 1);
      ctx.restore();
    }
  };

  // Effect 30: Swirl
  const applySwirl = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate(t * Math.PI * 4 * intensity);
    ctx.scale(1 - t * 0.5, 1 - t * 0.5);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, beforeImg, 1 - t);
    ctx.restore();
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.rotate((t - 1) * Math.PI * 4 * intensity);
    ctx.scale(0.5 + t * 0.5, 0.5 + t * 0.5);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 31: Diamond Reveal
  const applyDiamondReveal = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const size = t * (CANVAS_WIDTH + CANVAS_HEIGHT);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - size / 2);
    ctx.lineTo(CANVAS_WIDTH / 2 + size / 2, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + size / 2);
    ctx.lineTo(CANVAS_WIDTH / 2 - size / 2, CANVAS_HEIGHT / 2);
    ctx.closePath();
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 32: Bounce In
  const applyBounceIn = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1 - t);

    const bounce = t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    const scale = bounce;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 33: Elastic
  const applyElastic = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const elastic = t === 0 ? 0 : t === 1 ? 1 : 
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
    
    drawImage(ctx, beforeImg, 1 - elastic);
    drawImage(ctx, afterImg, elastic);
  };

  // Effect 34: Page Curl
  const applyPageCurl = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, afterImg, 1);

    const curlWidth = (1 - t) * CANVAS_WIDTH;
    const curlAmount = intensity * 200;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH - curlWidth, 0);
    ctx.quadraticCurveTo(
      CANVAS_WIDTH - curlWidth / 2, curlAmount,
      CANVAS_WIDTH, 0
    );
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.quadraticCurveTo(
      CANVAS_WIDTH - curlWidth / 2, CANVAS_HEIGHT - curlAmount,
      CANVAS_WIDTH - curlWidth, CANVAS_HEIGHT
    );
    ctx.closePath();
    ctx.clip();
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
  };

  // Effect 35: Kaleidoscope
  const applyKaleidoscope = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const segments = 8;
    for (let i = 0; i < segments; i++) {
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.rotate((i * Math.PI * 2) / segments + t * Math.PI * 2);
      ctx.scale(t, t);
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      drawImage(ctx, t < 0.5 ? beforeImg : afterImg, 1 / segments);
      ctx.restore();
    }
  };

  // Effect 36: Color Shift
  const applyColorShift = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const hueRotate = t * 180 * intensity;
    ctx.filter = `hue-rotate(${hueRotate}deg)`;
    drawImage(ctx, beforeImg, 1 - t);
    ctx.filter = 'none';
    drawImage(ctx, afterImg, t);
  };

  // Effect 37: Gradient Wipe
  const applyGradientWipe = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);
    
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const progress = t * 2;
    gradient.addColorStop(Math.max(0, progress - 1), 'rgba(0,0,0,1)');
    gradient.addColorStop(Math.min(1, progress), 'rgba(0,0,0,0)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
    
    ctx.globalCompositeOperation = 'destination-over';
    drawImage(ctx, afterImg, 1);
    ctx.globalCompositeOperation = 'source-over';
  };

  // Effect 38: Zoom Blur
  const applyZoomBlur = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const steps = 10;
    const maxScale = 1 + intensity * 0.5;
    
    for (let i = 0; i < steps; i++) {
      const stepT = i / steps;
      const alpha = (1 - stepT) * 0.1;
      const scale = 1 + stepT * (maxScale - 1) * Math.sin(t * Math.PI);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.scale(scale, scale);
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      drawImage(ctx, t < 0.5 ? beforeImg : afterImg, 1);
      ctx.restore();
    }
    
    drawImage(ctx, t < 0.5 ? beforeImg : afterImg, 1);
  };

  // Effect 39: Shatter
  const applyShatter = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, afterImg, 1);

    const pieces = 20;
    for (let i = 0; i < pieces; i++) {
      const x = (i % 5) * (CANVAS_WIDTH / 5);
      const y = Math.floor(i / 5) * (CANVAS_HEIGHT / 4);
      const w = CANVAS_WIDTH / 5;
      const h = CANVAS_HEIGHT / 4;
      
      // Use deterministic pseudo-random based on piece index
      const seedX = Math.sin(i * 12.9898) * 0.5;
      const seedY = Math.sin(i * 78.233) * 0.5;
      const seedRot = Math.sin(i * 43758.5453) * 0.5;
      
      const offsetX = seedX * 200 * t * intensity;
      const offsetY = seedY * 200 * t * intensity;
      const rotation = seedRot * Math.PI * t;
      
      ctx.save();
      ctx.translate(x + w / 2 + offsetX, y + h / 2 + offsetY);
      ctx.rotate(rotation);
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(beforeImg, 
        x, y, w, h,
        -w / 2, -h / 2, w, h
      );
      ctx.restore();
    }
  };

  // Effect 40: Radial Wipe
  const applyRadialWipe = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const angle = t * Math.PI * 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 
      Math.max(CANVAS_WIDTH, CANVAS_HEIGHT), 
      -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.closePath();
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    ctx.restore();
  };

  // Effect 41: Door Swing
  const applyDoorSwing = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, afterImg, 1);

    ctx.save();
    ctx.translate(0, CANVAS_HEIGHT / 2);
    ctx.scale(Math.cos(t * Math.PI / 2), 1);
    ctx.translate(0, -CANVAS_HEIGHT / 2);
    
    if (t < 1) {
      drawImage(ctx, beforeImg, 1);
    }
    ctx.restore();
  };

  // Effect 42: Twist
  const applyTwist = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const slices = 50;
    const sliceHeight = CANVAS_HEIGHT / slices;
    
    for (let i = 0; i < slices; i++) {
      const y = i * sliceHeight;
      const rotation = (i / slices - 0.5) * t * Math.PI * intensity;
      
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, y + sliceHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-CANVAS_WIDTH / 2, -(y + sliceHeight / 2));
      ctx.beginPath();
      ctx.rect(0, y, CANVAS_WIDTH, sliceHeight);
      ctx.clip();
      drawImage(ctx, t < 0.5 ? beforeImg : afterImg, 1);
      ctx.restore();
    }
  };

  // Effect 43: Fold
  const applyFold = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const foldT = t < 0.5 ? t * 2 : 1;
    const unfoldT = t >= 0.5 ? (t - 0.5) * 2 : 0;
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 0);
    ctx.scale(1 - foldT, 1);
    ctx.translate(-CANVAS_WIDTH / 2, 0);
    drawImage(ctx, beforeImg, 1);
    ctx.restore();
    
    if (unfoldT > 0) {
      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, 0);
      ctx.scale(unfoldT, 1);
      ctx.translate(-CANVAS_WIDTH / 2, 0);
      drawImage(ctx, afterImg, 1);
      ctx.restore();
    }
  };

  // Effect 44: Star Burst
  const applyStarBurst = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1 - t);

    const points = 12;
    const innerRadius = t * CANVAS_WIDTH * 0.3;
    const outerRadius = t * CANVAS_WIDTH * 0.6;
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      ctx.fillStyle = `hsla(${(i / points) * 360}, 80%, 60%, ${t * 0.7})`;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    drawImage(ctx, afterImg, t);
  };

  // Effect 45: Liquid
  const applyLiquid = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const rows = 20;
    const rowHeight = CANVAS_HEIGHT / rows;
    
    for (let i = 0; i < rows; i++) {
      const y = i * rowHeight;
      const offset = Math.sin(t * Math.PI * 2 + i * 0.5) * 50 * intensity;
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, y, CANVAS_WIDTH, rowHeight);
      ctx.clip();
      ctx.translate(offset, 0);
      drawImage(ctx, t < 0.5 ? beforeImg : afterImg, 1);
      ctx.restore();
    }
  };

  // Effect 46: Cube Rotate
  const applyCubeRotate = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const angle = t * Math.PI;
    const scale = Math.abs(Math.cos(angle));
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(scale, 1);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    
    if (Math.cos(angle) > 0) {
      drawImage(ctx, beforeImg, 1);
    } else {
      drawImage(ctx, afterImg, 1);
    }
    ctx.restore();
  };

  // Effect 47: Morph
  const applyMorph = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const morphAmount = Math.sin(t * Math.PI) * intensity * 50;
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(1 + morphAmount / CANVAS_WIDTH, 1 + morphAmount / CANVAS_HEIGHT);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, beforeImg, 1 - t);
    ctx.restore();
    
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.scale(1 - morphAmount / CANVAS_WIDTH, 1 - morphAmount / CANVAS_HEIGHT);
    ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    drawImage(ctx, afterImg, t);
    ctx.restore();
  };

  // Effect 48: Grid Flip
  const applyGridFlip = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const gridSize = 5;
    const cellWidth = CANVAS_WIDTH / gridSize;
    const cellHeight = CANVAS_HEIGHT / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellT = Math.max(0, Math.min(1, (t - (i + j) / (gridSize * 2) * 0.5) * 2));
        const angle = cellT * Math.PI;
        
        ctx.save();
        ctx.translate(i * cellWidth + cellWidth / 2, j * cellHeight + cellHeight / 2);
        ctx.scale(Math.cos(angle), 1);
        ctx.translate(-(i * cellWidth + cellWidth / 2), -(j * cellHeight + cellHeight / 2));
        
        ctx.beginPath();
        ctx.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        ctx.clip();
        
        if (Math.cos(angle) > 0) {
          drawImage(ctx, beforeImg, 1);
        } else {
          drawImage(ctx, afterImg, 1);
        }
        ctx.restore();
      }
    }
  };

  // Effect 49: Spotlight
  const applySpotlight = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawImage(ctx, beforeImg, 1);

    const radius = t * Math.sqrt(CANVAS_WIDTH ** 2 + CANVAS_HEIGHT ** 2) / 2;
    const x = CANVAS_WIDTH / 2;
    const y = CANVAS_HEIGHT / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    drawImage(ctx, afterImg, 1);
    
    const gradient = ctx.createRadialGradient(x, y, radius * 0.7, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(1, `rgba(255, 255, 255, ${intensity * 0.3})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  };

  // Effect 50: Vortex
  const applyVortex = (ctx, t) => {
    const beforeImg = beforeImageRef.current;
    const afterImg = afterImageRef.current;
    if (!beforeImg || !afterImg) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const segments = 30;
    for (let i = 0; i < segments; i++) {
      const segmentT = i / segments;
      const rotation = t * Math.PI * 6 * intensity * (1 - segmentT);
      const scale = 1 - t * segmentT;
      
      ctx.save();
      ctx.globalAlpha = (1 - segmentT) * 0.3;
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      drawImage(ctx, beforeImg, 1);
      ctx.restore();
    }
    
    drawImage(ctx, afterImg, t);
  };

  // Get the current effect function
  const getEffectFunction = () => {
    switch (selectedEffect) {
      case 'shockZoom': return applyShockZoom;
      case 'rgbGlitch': return applyRGBGlitch;
      case 'filmBurn': return applyFilmBurn;
      case 'particleBurst': return applyParticleBurst;
      case 'wipeReveal': return applyWipeReveal;
      case 'verticalWipe': return applyVerticalWipe;
      case 'circularReveal': return applyCircularReveal;
      case 'zoomIn': return applyZoomIn;
      case 'zoomOut': return applyZoomOut;
      case 'slideLeft': return applySlideLeft;
      case 'slideRight': return applySlideRight;
      case 'slideUp': return applySlideUp;
      case 'slideDown': return applySlideDown;
      case 'fadeCross': return applyFadeCross;
      case 'spinClockwise': return applySpinClockwise;
      case 'spinCounterClockwise': return applySpinCounterClockwise;
      case 'diagonalWipe': return applyDiagonalWipe;
      case 'boxExpand': return applyBoxExpand;
      case 'pixelate': return applyPixelate;
      case 'blurTransition': return applyBlurTransition;
      case 'waveDistortion': return applyWaveDistortion;
      case 'ripple': return applyRipple;
      case 'splitHorizontal': return applySplitHorizontal;
      case 'splitVertical': return applySplitVertical;
      case 'flipHorizontal': return applyFlipHorizontal;
      case 'flipVertical': return applyFlipVertical;
      case 'checkerboard': return applyCheckerboard;
      case 'randomBlocks': return applyRandomBlocks;
      case 'venetianBlinds': return applyVenetianBlinds;
      case 'swirl': return applySwirl;
      case 'diamondReveal': return applyDiamondReveal;
      case 'bounceIn': return applyBounceIn;
      case 'elastic': return applyElastic;
      case 'pageCurl': return applyPageCurl;
      case 'kaleidoscope': return applyKaleidoscope;
      case 'colorShift': return applyColorShift;
      case 'gradientWipe': return applyGradientWipe;
      case 'zoomBlur': return applyZoomBlur;
      case 'shatter': return applyShatter;
      case 'radialWipe': return applyRadialWipe;
      case 'doorSwing': return applyDoorSwing;
      case 'twist': return applyTwist;
      case 'fold': return applyFold;
      case 'starBurst': return applyStarBurst;
      case 'liquid': return applyLiquid;
      case 'cubeRotate': return applyCubeRotate;
      case 'morph': return applyMorph;
      case 'gridFlip': return applyGridFlip;
      case 'spotlight': return applySpotlight;
      case 'vortex': return applyVortex;
      default: return applyShockZoom;
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

        {/* Top Play Button */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <button
            onClick={isPlaying ? stopAnimation : playAnimation}
            disabled={!beforeImage || !afterImage}
            className="py-3 sm:py-4 px-8 sm:px-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base sm:text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPlaying ? '⏸ Stop Preview' : '▶ Play Preview'}
          </button>
        </div>

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
              
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                {[
                  { id: 'shockZoom', label: 'Shock Zoom' },
                  { id: 'rgbGlitch', label: 'RGB Glitch' },
                  { id: 'filmBurn', label: 'Film Burn' },
                  { id: 'particleBurst', label: 'Particle Burst' },
                  { id: 'wipeReveal', label: 'Wipe Reveal' },
                  { id: 'verticalWipe', label: 'Vertical Wipe' },
                  { id: 'circularReveal', label: 'Circular Reveal' },
                  { id: 'zoomIn', label: 'Zoom In' },
                  { id: 'zoomOut', label: 'Zoom Out' },
                  { id: 'slideLeft', label: 'Slide Left' },
                  { id: 'slideRight', label: 'Slide Right' },
                  { id: 'slideUp', label: 'Slide Up' },
                  { id: 'slideDown', label: 'Slide Down' },
                  { id: 'fadeCross', label: 'Fade Cross' },
                  { id: 'spinClockwise', label: 'Spin Clockwise' },
                  { id: 'spinCounterClockwise', label: 'Spin Counter' },
                  { id: 'diagonalWipe', label: 'Diagonal Wipe' },
                  { id: 'boxExpand', label: 'Box Expand' },
                  { id: 'pixelate', label: 'Pixelate' },
                  { id: 'blurTransition', label: 'Blur Transition' },
                  { id: 'waveDistortion', label: 'Wave Distortion' },
                  { id: 'ripple', label: 'Ripple' },
                  { id: 'splitHorizontal', label: 'Split Horizontal' },
                  { id: 'splitVertical', label: 'Split Vertical' },
                  { id: 'flipHorizontal', label: 'Flip Horizontal' },
                  { id: 'flipVertical', label: 'Flip Vertical' },
                  { id: 'checkerboard', label: 'Checkerboard' },
                  { id: 'randomBlocks', label: 'Random Blocks' },
                  { id: 'venetianBlinds', label: 'Venetian Blinds' },
                  { id: 'swirl', label: 'Swirl' },
                  { id: 'diamondReveal', label: 'Diamond Reveal' },
                  { id: 'bounceIn', label: 'Bounce In' },
                  { id: 'elastic', label: 'Elastic' },
                  { id: 'pageCurl', label: 'Page Curl' },
                  { id: 'kaleidoscope', label: 'Kaleidoscope' },
                  { id: 'colorShift', label: 'Color Shift' },
                  { id: 'gradientWipe', label: 'Gradient Wipe' },
                  { id: 'zoomBlur', label: 'Zoom Blur' },
                  { id: 'shatter', label: 'Shatter' },
                  { id: 'radialWipe', label: 'Radial Wipe' },
                  { id: 'doorSwing', label: 'Door Swing' },
                  { id: 'twist', label: 'Twist' },
                  { id: 'fold', label: 'Fold' },
                  { id: 'starBurst', label: 'Star Burst' },
                  { id: 'liquid', label: 'Liquid' },
                  { id: 'cubeRotate', label: 'Cube Rotate' },
                  { id: 'morph', label: 'Morph' },
                  { id: 'gridFlip', label: 'Grid Flip' },
                  { id: 'spotlight', label: 'Spotlight' },
                  { id: 'vortex', label: 'Vortex' }
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
