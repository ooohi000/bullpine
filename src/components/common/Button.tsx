import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className: string;
  label: string;
}

const Button = ({ className, label, ...props }: ButtonProps) => {
  return (
    <button className={`${className}`} {...props}>
      {label}
    </button>
  );
};

export default Button;
