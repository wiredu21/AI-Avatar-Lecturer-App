import React, { useState, useEffect, useRef } from 'react';
import './AvatarAnimation.css';

const ANIMATION_STATES = {
  IDLE: 'idle',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  THINKING: 'thinking',
};

const AvatarAnimation = ({ 
  avatarId, 
  avatarSrc, 
  isSpeaking, 
  isListening,
  isThinking,
  onLoad 
}) => {
  const [animationState, setAnimationState] = useState(ANIMATION_STATES.IDLE);
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animationRef = useRef(null);
  
  // Configuration for different animations
  const animations = {
    [ANIMATION_STATES.IDLE]: {
      frameCount: 60,
      frameDuration: 50, // ms per frame
      spriteWidth: 300,
      spriteHeight: 300,
      loop: true,
    },
    [ANIMATION_STATES.SPEAKING]: {
      frameCount: 90,
      frameDuration: 33, // faster for speaking
      spriteWidth: 300,
      spriteHeight: 300,
      loop: true,
    },
    [ANIMATION_STATES.LISTENING]: {
      frameCount: 40,
      frameDuration: 42,
      spriteWidth: 300,
      spriteHeight: 300,
      loop: true,
    },
    [ANIMATION_STATES.THINKING]: {
      frameCount: 50,
      frameDuration: 40,
      spriteWidth: 300,
      spriteHeight: 300,
      loop: true,
    },
  };
  
  // Create sprite sheet URLs based on avatarId
  const getSpriteSheetUrl = (state) => {
    return `/assets/avatars/avatar${avatarId}/${state}_spritesheet.png`;
  };
  
  // Sprite sheets for each animation state
  const spriteSheets = {
    [ANIMATION_STATES.IDLE]: new Image(),
    [ANIMATION_STATES.SPEAKING]: new Image(),
    [ANIMATION_STATES.LISTENING]: new Image(),
    [ANIMATION_STATES.THINKING]: new Image(),
  };
  
  // Determine the current animation state based on props
  useEffect(() => {
    if (isSpeaking) {
      setAnimationState(ANIMATION_STATES.SPEAKING);
    } else if (isListening) {
      setAnimationState(ANIMATION_STATES.LISTENING);
    } else if (isThinking) {
      setAnimationState(ANIMATION_STATES.THINKING);
    } else {
      setAnimationState(ANIMATION_STATES.IDLE);
    }
  }, [isSpeaking, isListening, isThinking]);
  
  // Load the sprite sheets
  useEffect(() => {
    let loadedCount = 0;
    const totalSheets = Object.keys(spriteSheets).length;
    
    const handleLoad = () => {
      loadedCount++;
      if (loadedCount === totalSheets) {
        setIsLoaded(true);
        if (onLoad) onLoad();
      }
    };
    
    // Load all sprite sheets
    Object.keys(spriteSheets).forEach(state => {
      // If we can't load the sprite sheets, use single image fallback
      spriteSheets[state].onerror = () => {
        console.warn(`Failed to load sprite sheet for ${state}. Using fallback image.`);
        loadedCount++;
        if (loadedCount === totalSheets) {
          setIsLoaded(false); // Signal to use fallback
          if (onLoad) onLoad();
        }
      };
      
      spriteSheets[state].onload = handleLoad;
      
      // In a real implementation, these would be actual sprite sheets
      // For demo purposes, we're just assigning the same image as fallback
      try {
        spriteSheets[state].src = getSpriteSheetUrl(state);
      } catch (error) {
        console.error(`Error loading sprite sheet for ${state}:`, error);
        spriteSheets[state].src = avatarSrc; // Fallback to static image
      }
    });
    
    return () => {
      // Cleanup
      Object.values(spriteSheets).forEach(sheet => {
        sheet.onload = null;
        sheet.onerror = null;
      });
    };
  }, [avatarId, avatarSrc]);
  
  // Animation loop
  useEffect(() => {
    if (!isLoaded || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      const currentAnimation = animations[animationState];
      const spriteSheet = spriteSheets[animationState];
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate the current frame position in the sprite sheet
      const frameIndex = Math.floor(frameRef.current) % currentAnimation.frameCount;
      const framesPerRow = Math.floor(spriteSheet.width / currentAnimation.spriteWidth) || 1;
      const row = Math.floor(frameIndex / framesPerRow);
      const col = frameIndex % framesPerRow;
      
      // Draw the current frame
      ctx.drawImage(
        spriteSheet,
        col * currentAnimation.spriteWidth,
        row * currentAnimation.spriteHeight,
        currentAnimation.spriteWidth,
        currentAnimation.spriteHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );
      
      // Increment frame
      frameRef.current = (frameRef.current + 1) % currentAnimation.frameCount;
      
      // Schedule next frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded, animationState]);
  
  // Fallback to static image if sprite sheets aren't available
  if (!isLoaded) {
    return (
      <div className="avatar-animation-fallback">
        <img 
          src={avatarSrc} 
          alt="AI Avatar" 
          className="avatar-static-image"
        />
      </div>
    );
  }
  
  return (
    <div className="avatar-animation-container">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300} 
        className="avatar-animation-canvas"
      />
    </div>
  );
};

export default AvatarAnimation; 