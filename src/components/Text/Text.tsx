import React, { forwardRef, memo } from 'react';
import { typography } from '../../styles/typography';
import type { TypographyVariant } from '../../styles/typography';
import { colors } from '../../styles/colors';

type Size = 'large' | 'medium' | 'small';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  size?: Size;
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Text = memo(
  forwardRef<HTMLElement, TextProps>(
    ({ variant = 'body', size = 'medium', as: Tag = 'p', children, className, style, ...props }, ref) => {
      const variantTypography = typography[variant] as Record<string, React.CSSProperties>;
      const typographyStyle = variantTypography[size] || variantTypography['medium'] || {};

      const Component = Tag as any;

      return (
        <Component
          ref={ref as any}
          style={{ color: colors.text.primary, ...typographyStyle, ...style }}
          className={className}
          {...props}
        >
          {children}
        </Component>
      );
    }
  )
);

Text.displayName = 'Text';
