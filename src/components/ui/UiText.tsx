import React from 'react';

interface UiTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'muted' | 'destructive' | 'success' | 'warning';
  className?: string;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const colorMap = {
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  destructive: 'text-destructive',
  success: 'text-green-500',
  warning: 'text-orange-400',
};

export const UiText: React.FC<UiTextProps> = ({
  children,
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => (
  <p
    className={`font-body ${sizeMap[size]} ${colorMap[color]} ${className}`.trim()}
    {...props}
  >
    {children}
  </p>
);
