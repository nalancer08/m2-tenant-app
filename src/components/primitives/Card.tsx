import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...rest }: CardProps) {
  return (
    <div className={cn(styles.root, padded && styles.padded, className)} {...rest}>
      {children}
    </div>
  );
}
