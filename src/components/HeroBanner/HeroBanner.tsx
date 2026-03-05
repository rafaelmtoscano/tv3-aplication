import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { ActionButton } from '../ActionButton';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

export interface HeroBannerSlide {
  id: string;
  mediaType: 'image' | 'video';
  mediaSrc: string;
  logo?: string;
  isLive?: boolean;
  classification?: 'L' | '10' | '12' | '14' | '16' | '18';
  signal?: 'HD' | '4K';
  title: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export interface HeroBannerProps {
  slides: HeroBannerSlide[];
  autoPlayInterval?: number;
  onSlideChange?: (index: number) => void;
  className?: string;
  activeIndex?: number;
}

const getClassificationStyle = (classification: string | undefined) => {
  const styles: Record<string, { background: string; color: string; border?: string }> = {
    'L': { background: '#1A7A1A', color: '#FFF' },
    '10': { background: '#1A4FA0', color: '#FFF' },
    '12': { background: '#C8A000', color: '#000' },
    '14': { background: '#C85000', color: '#FFF' },
    '16': { background: '#C80000', color: '#FFF' },
    '18': { background: '#0A0A0A', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)' },
  };
  return styles[classification || ''] || null;
};

const HlsVideo = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari suporta HLS nativo
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      autoPlay
      muted
      loop
      playsInline
    />
  );
};

export const HeroBanner = memo(
  forwardRef<HTMLDivElement, HeroBannerProps>(
    ({ slides, autoPlayInterval = 15000, onSlideChange, className, activeIndex: controlledIndex }, ref) => {
      const isControlled = controlledIndex !== undefined;
      const [internalIndex, setInternalIndex] = useState(0);
      const activeIndex = isControlled ? controlledIndex : internalIndex;
      const [_isPaused, _setIsPaused] = useState(true);
      const containerRef = useRef<HTMLDivElement>(null);
      const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

      const goToSlide = useCallback(
        (index: number) => {
          if (!isControlled) {
            setInternalIndex(index);
          }
          onSlideChange?.(index);
        },
        [onSlideChange, isControlled]
      );

      useEffect(() => {
        if (_isPaused || slides.length <= 1 || isControlled) return;
        intervalRef.current = setInterval(() => {
          setInternalIndex((i) => {
            const next = (i + 1) % slides.length;
            setTimeout(() => onSlideChange?.(next), 0);
            return next;
          });
        }, autoPlayInterval);
        return () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
        };
      }, [_isPaused, slides.length, autoPlayInterval, onSlideChange, isControlled]);

      const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: colors.background.baseInverse,
        outline: 'none',
      };

      const mediaLayerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      };

      const scrimBaseStyle: React.CSSProperties = {
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 1,
      };

      const contentLayerStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 64px 48px',
        boxSizing: 'border-box',
      };

/*
      const topRowStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      };

      const liveTagStyle: React.CSSProperties = {
        background: '#E52207',
        borderRadius: '8px',
        padding: '4px 16px',
        color: '#FFF',
        display: 'inline-flex',
        alignItems: 'center',
        ...typography.body.large,
      };
*/

      const mainContentStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '96px',
        left: '64px',
        maxWidth: '580px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      };

      const titleStyle: React.CSSProperties = {
        color: colors.text.primaryInverse,
        fontFamily: 'Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif',
        fontSize: '56px',
        fontWeight: 700,
        lineHeight: '110%',
        margin: 0,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      };

      const descriptionStyle: React.CSSProperties = {
        ...typography.body.medium,
        color: colors.text.secondaryInverse,
        margin: 0,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      };

      const bottomRowStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '32px',
        marginLeft: '-8px',
      };

      const paginationStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      };

      const slide = slides[activeIndex];

      return (
        <div
          ref={(node) => {
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          style={containerStyle}
          className={className}
          aria-label={`Hero banner: ${slide?.title}`}
          role="region"
        >
          {/* Media layers */}
          {slides.map((s, i) => (
            <div
              key={s.id}
              style={{
                ...mediaLayerStyle,
                opacity: activeIndex === i ? 1 : 0,
                transition: 'opacity 0.6s ease-in-out',
              }}
            >
              {s.mediaType === 'video' ? (
                activeIndex === i ? <HlsVideo src={s.mediaSrc} /> : null
              ) : (
                <img
                  src={s.mediaSrc}
                  alt={s.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          ))}

          {/* Scrim 1 — top radial */}
          <div
            style={{
              ...scrimBaseStyle,
              top: 0,
              left: 0,
              width: '100%',
              height: '50%',
              background:
                'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.15) 0%, rgba(17,23,43,0.0) 60%)',
            }}
          />

          {/* Scrim 2 — left-to-right */}
          <div
            style={{
              ...scrimBaseStyle,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(90deg, rgba(17,23,43,0.92) 0%, rgba(17,23,43,0.6) 35%, rgba(17,23,43,0.0) 65%)',
            }}
          />

          {/* Scrim 3 — bottom fade */}
          <div
            style={{
              ...scrimBaseStyle,
              bottom: 0,
              left: 0,
              width: '100%',
              height: '30%',
              background:
                'linear-gradient(0deg, rgba(17,23,43,0.95) 0%, rgba(17,23,43,0.0) 100%)',
            }}
          />

          {/* Content layer */}
          <div style={contentLayerStyle}>
            {slides.map((s, i) => {
              const isActive = activeIndex === i;
              const classificationStyle = getClassificationStyle(s.classification);
              return (
                <div
                  key={s.id}
                  style={{
                    ...mainContentStyle,
                    position: 'absolute',
                    top: 0,
                    left: '64px',
                    width: '580px',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(16px)',
                    transition: isActive
                      ? 'opacity 0.4s ease-in-out 0.3s, transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
                      : 'opacity 0.25s ease-in-out 0s, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0s',
                    pointerEvents: isActive ? 'auto' : 'none',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Logo row */}
                  {s.logo && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                      <img
                        src={s.logo}
                        alt="Channel logo"
                        style={{ height: '48px', objectFit: 'contain' }}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h1 style={titleStyle}>{s.title}</h1>

                  {/* Tags row */}
                  {(s.classification || s.isLive || s.signal) && (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* Classification tag */}
                      {s.classification && classificationStyle && (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: classificationStyle.background,
                            color: classificationStyle.color,
                            border: classificationStyle.border,
                            ...typography.label.small,
                            fontWeight: 700,
                          }}
                        >
                          {s.classification}
                        </div>
                      )}

                      {/* Live tag */}
                      {s.isLive && (
                        <span style={{
                          background: '#E52207',
                          borderRadius: '8px',
                          padding: '0 16px',
                          color: '#FFF',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...typography.body.large,
                        }}>
                          Ao vivo
                        </span>
                      )}

                      {/* Signal tag */}
                      {s.signal && (
                        <span style={{
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: '8px',
                          padding: '0 12px',
                          color: '#FFF',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...typography.label.small,
                          fontWeight: 700,
                        }}>
                          {s.signal}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {s.description && <p style={descriptionStyle}>{s.description}</p>}

                  {/* Bottom row — button + pagination */}
                  <div style={bottomRowStyle}>
                    {(s.buttonLabel !== undefined || slides.some((slide) => slide.buttonLabel)) && (
                      <ActionButton
                        variant="text"
                        label={s.buttonLabel || 'Assistir'}
                        onClick={s.onButtonClick}
                        state="focus"
                      />
                    )}

                    {slides.length > 1 && (
                      <div style={paginationStyle} role="tablist" aria-label="Slides">
                        {slides.map((dotSlide, dotIndex) => (
                          <button
                            key={dotSlide.id}
                            role="tab"
                            aria-selected={activeIndex === dotIndex}
                            aria-label={`Slide ${dotIndex + 1}: ${dotSlide.title}`}
                            onClick={() => goToSlide(dotIndex)}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '100px',
                              background:
                                activeIndex === dotIndex ? '#FFF' : 'rgba(255,255,255,0.4)',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              transition: 'background 0.3s ease-in-out',
                              outline: 'none',
                              flexShrink: 0,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  )
);

HeroBanner.displayName = 'HeroBanner';
