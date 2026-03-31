import React, { useRef, useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface StoryCardProps {
  id: string;
  videoUrl: string;
  thumbnail: string;
  title?: string;
  duration?: number;
  isFocused: boolean;
  isActive: boolean;
  onEnded?: () => void;
  onClick?: () => void;
}

const IDLE_WIDTH = 160;
const IDLE_HEIGHT = 240;
const ACTIVE_WIDTH = 280;
const ACTIVE_HEIGHT = 420;
const TRANSITION = '0.35s cubic-bezier(0.34, 1.1, 0.64, 1)';

export function StoryCard({
  videoUrl,
  thumbnail,
  title,
  duration = 30,
  isFocused,
  isActive,
  onEnded,
}: StoryCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    if (!isActive) {
      setProgress(0);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const d = duration > 0 ? duration : video.duration || 30;
    setProgress((video.currentTime / d) * 100);
  };

  const handleEnded = () => {
    setProgress(100);
    onEnded?.();
  };

  const width = isActive ? ACTIVE_WIDTH : IDLE_WIDTH;
  const height = isActive ? ACTIVE_HEIGHT : IDLE_HEIGHT;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width,
    height,
    borderRadius: 16,
    overflow: 'hidden',
    flexShrink: 0,
    transition: `width ${TRANSITION}, height ${TRANSITION}, transform ${TRANSITION}, border ${TRANSITION}`,
    border: isFocused && !isActive ? `4px solid ${colors.background.primary}` : '4px solid transparent',
    transform: isFocused && !isActive ? 'scale(1.05)' : 'scale(1)',
    cursor: 'pointer',
    boxSizing: 'border-box',
  };

  const thumbnailStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: isActive ? 'none' : 'block',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)',
    display: isActive ? 'none' : 'block',
  };

  const titleStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    ...typography.label.small,
    color: colors.text.primaryInverse,
    display: isActive ? 'none' : '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    margin: 0,
  };

  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: isActive ? 'block' : 'none',
  };

  const progressBarBgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'rgba(255,255,255,0.3)',
    zIndex: 2,
    display: isActive ? 'block' : 'none',
  };

  const progressBarFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    background: colors.background.brandPrimary,
    transition: 'width 0.25s linear',
  };

  return (
    <div style={containerStyle}>
      <div style={thumbnailStyle} />
      <div style={overlayStyle} />
      {title && <p style={titleStyle}>{title}</p>}

      <video
        ref={videoRef}
        src={videoUrl}
        style={videoStyle}
        autoPlay={false}
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div style={progressBarBgStyle}>
        <div style={progressBarFillStyle} />
      </div>
    </div>
  );
}
