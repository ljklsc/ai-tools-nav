import React from 'react';
import Image from 'next/image';

interface MouQiLogoProps {
  className?: string;
}

const MouQiLogo: React.FC<MouQiLogoProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src="/mouqi.png" 
        alt="AI工具导航" 
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    </div>
  );
};

export default MouQiLogo;