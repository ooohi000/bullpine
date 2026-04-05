import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" className="shrink-0">
      <Image
        src="/images/logo.png"
        width={150}
        height={50}
        className="h-8 w-auto sm:h-[50px]"
        alt="BullRush Logo"
        priority
      />
    </Link>
  );
};

export default Logo;
