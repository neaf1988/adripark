import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white active:bg-primary-dark',
  success: 'bg-success text-white active:bg-green-700',
  danger: 'bg-danger text-white active:bg-red-700',
  secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300',
  ghost: 'bg-transparent text-primary active:bg-blue-50',
};

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex min-h-14 items-center justify-center rounded-xl px-3 py-2.5 text-base font-semibold leading-snug text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
