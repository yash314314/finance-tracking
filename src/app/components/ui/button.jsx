import React from 'react';

export function Button({
  children,
  onClick,
  className = '',
  variant = 'default',
  size = 'md',
  type = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    default: 'bg-stone-700 text-white hover:bg-stone-800',
    outline: 'border border-white text-white hover:bg-white hover:text-black',
    ghost: 'bg-transparent text-white hover:bg-stone-800',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant] || ''} ${sizeClasses[size] || ''} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
}
