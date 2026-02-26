import React, { memo } from 'react';

export interface ContentRailGroupProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ContentRailGroup = memo(({ children, className, style }: ContentRailGroupProps) => (
  <div
    className={className}
    style={{
      position: 'relative',
      width: '100%',
      overflowX: 'hidden',
      overflowY: 'visible',
      display: 'flex',
      flexDirection: 'column',
      gap: '64px',
      ...style,
    }}
  >
    {children}
  </div>
));

ContentRailGroup.displayName = 'ContentRailGroup';
