import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="shrink-0">
      <h1 className="text-2xl font-bold text-foreground">
        <span className="text-chart-up">B</span>ullpine
      </h1>
    </Link>
  );
};

export default Logo;
