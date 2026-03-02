import React, { useState, useEffect, useRef, useCallback } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { ChevronLeftIcon } from '../../icons';

interface WatchPageProps {
  videoUrl: string;
  title?: string;
  logo?: string;
  channelName?: string;
  onExit: () => void;
}

type FocusedControl = 'back' | 'rewind' | 'playpause' | 'forward';

function extractYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match?.[1] ?? '';
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function WatchPage({ videoUrl, title, logo, channelName, onExit }: WatchPageProps) {
  const videoId = extractYouTubeId(videoUrl);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [focusedControl, setFocusedControl] = useState<FocusedControl>('playpause');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 5000);
  }, []);

  const onReady = useCallback((event: YouTubeEvent) => {
    playerRef.current = event.target;
    event.target.playVideo();
    const dur = event.target.getDuration();
    if (dur) setDuration(dur);
    showControls();
  }, [showControls]);

  const onStateChange = useCallback((event: YouTubeEvent<number>) => {
    // YT.PlayerState: 1=PLAYING, 2=PAUSED
    setIsPlaying(event.data === 1);
    if (event.data === 1) {
      const dur = playerRef.current?.getDuration();
      if (dur) setDuration(dur);
    }
  }, []);

  // Progress bar update
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const t = playerRef.current.getCurrentTime();
        if (typeof t === 'number') setCurrentTime(t);
      }
    }, 500);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Auto-hide controls on mount
  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [showControls]);

  // Focus container for keyboard events
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const seekRelative = useCallback((delta: number) => {
    if (!playerRef.current) return;
    const t = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(0, t + delta), true);
    showControls();
  }, [showControls]);

  const controlOrder: FocusedControl[] = ['back', 'rewind', 'playpause', 'forward'];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace'];
    if (navKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }

    switch (e.key) {
      case 'Escape':
      case 'Backspace':
        onExit();
        break;

      case 'Enter':
        if (controlsVisible) {
          switch (focusedControl) {
            case 'back': onExit(); break;
            case 'rewind': seekRelative(-10); break;
            case 'playpause': togglePlayPause(); break;
            case 'forward': seekRelative(10); break;
          }
        } else {
          togglePlayPause();
          showControls();
        }
        break;

      case 'ArrowLeft':
        if (controlsVisible) {
          const idx = controlOrder.indexOf(focusedControl);
          if (idx > 0) setFocusedControl(controlOrder[idx - 1]);
        } else {
          seekRelative(-10);
        }
        showControls();
        break;

      case 'ArrowRight':
        if (controlsVisible) {
          const idx = controlOrder.indexOf(focusedControl);
          if (idx < controlOrder.length - 1) setFocusedControl(controlOrder[idx + 1]);
        } else {
          seekRelative(10);
        }
        showControls();
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        showControls();
        break;
    }
  }, [controlsVisible, focusedControl, onExit, seekRelative, togglePlayPause, showControls, controlOrder]);

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1 as const,
      controls: 0 as const,
      modestbranding: 1 as const,
      rel: 0 as const,
      fs: 0 as const,
      iv_load_policy: 3 as const,
    },
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: '#000',
    zIndex: 9999,
    outline: 'none',
  };

  const playerWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
  };

  const scrimStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
    opacity: controlsVisible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  };

  const topScrimStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
    opacity: controlsVisible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  };

  const controlsLayerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '40px 48px',
    opacity: controlsVisible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: controlsVisible ? 'auto' : 'none',
  };

  const topBarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  };

  const backButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: colors.text.primaryInverse,
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '8px',
    ...typography.body.medium,
    outline: focusedControl === 'back' ? `3px solid ${colors.background.brandPrimary}` : 'none',
    transform: focusedControl === 'back' ? 'scale(1.1)' : 'scale(1)',
    transition: 'outline 0.15s ease, transform 0.15s ease',
  };

  const channelInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  };

  const logoStyle: React.CSSProperties = {
    height: '32px',
    objectFit: 'contain',
  };

  const bottomSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const titleStyle: React.CSSProperties = {
    ...typography.headline.medium,
    color: colors.text.primaryInverse,
    margin: 0,
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  };

  const progressBarFillStyle: React.CSSProperties = {
    width: `${progressPercent}%`,
    height: '100%',
    background: colors.background.brandPrimary,
    borderRadius: '2px',
    transition: 'width 0.5s linear',
  };

  const timeRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    ...typography.label.small,
    color: colors.text.secondaryInverse,
  };

  const buttonsRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    marginTop: '8px',
  };

  const controlBtnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.15)',
    color: colors.text.primaryInverse,
    cursor: 'pointer',
    transition: 'outline 0.15s ease, transform 0.15s ease, background 0.15s ease',
  };

  const getControlBtnStyle = (ctrl: FocusedControl): React.CSSProperties => ({
    ...controlBtnBase,
    outline: focusedControl === ctrl ? `3px solid ${colors.background.brandPrimary}` : 'none',
    transform: focusedControl === ctrl ? 'scale(1.1)' : 'scale(1)',
    background: focusedControl === ctrl ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
  });

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* YouTube Player */}
      <div style={playerWrapperStyle}>
        {videoId ? (
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            style={{ width: '100%', height: '100%' }}
            iframeClassName="watch-youtube-iframe"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.text.primaryInverse, ...typography.headline.medium }}>
            Video não disponível
          </div>
        )}
      </div>

      {/* Scrims */}
      <div style={topScrimStyle} />
      <div style={scrimStyle} />

      {/* Controls */}
      <div style={controlsLayerStyle}>
        {/* Top bar */}
        <div style={topBarStyle}>
          <button style={backButtonStyle} tabIndex={-1}>
            <ChevronLeftIcon size={24} color={colors.text.primaryInverse} />
            Voltar
          </button>
          <div style={channelInfoStyle}>
            {logo && <img src={logo} alt={channelName} style={logoStyle} />}
            {channelName && (
              <span style={{ ...typography.body.medium, color: colors.text.primaryInverse }}>
                {channelName}
              </span>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div style={bottomSectionStyle}>
          {title && <h2 style={titleStyle}>{title}</h2>}

          {/* Progress bar */}
          <div style={progressBarContainerStyle}>
            <div style={progressBarFillStyle} />
          </div>

          {/* Time */}
          <div style={timeRowStyle}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Control buttons */}
          <div style={buttonsRowStyle}>
            <button style={getControlBtnStyle('rewind')} tabIndex={-1}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">10</text>
              </svg>
            </button>

            <button style={getControlBtnStyle('playpause')} tabIndex={-1}>
              {isPlaying ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button style={getControlBtnStyle('forward')} tabIndex={-1}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                <text x="12" y="14.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">10</text>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Global style for YouTube iframe */}
      <style>{`
        .watch-youtube-iframe {
          width: 100% !important;
          height: 100% !important;
          border: none;
        }
      `}</style>
    </div>
  );
}
