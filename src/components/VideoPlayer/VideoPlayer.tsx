import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

export interface VideoPlayerProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export const VideoPlayer = React.memo(
  forwardRef<HTMLVideoElement, VideoPlayerProps>(({ src, className, style }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    useImperativeHandle(ref, () => videoRef.current!);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !src) return;

      // Cleanup previous HLS instance if exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = src;
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [src]);

    const defaultStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      backgroundColor: '#000',
      ...style,
    };

    return (
      <video
        ref={videoRef}
        className={className}
        style={defaultStyle}
        autoPlay
        muted
        playsInline
      />
    );
  })
);

VideoPlayer.displayName = 'VideoPlayer';
