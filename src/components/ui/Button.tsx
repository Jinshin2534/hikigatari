import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-600 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({ variant = 'secondary', size = 'md', className = '', ...props }: ButtonProps) {
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-sm';
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${variantClasses[variant]} ${className}`}
    />
  );
}
