import React, { useEffect, useRef } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  videoUrl: string;
}

export function SplashScreen({ onComplete, videoUrl }: SplashScreenProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 6-second timeout
    timeoutRef.current = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onComplete]);

  const handleVideoEnded = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onComplete();
  };

  const splashStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
    zIndex: 9999,
  };

  const videoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div style={splashStyle}>
      <video
        style={videoStyle}
        src={videoUrl}
        autoPlay
        muted
        onEnded={handleVideoEnded}
      />
    </div>
  );
}
