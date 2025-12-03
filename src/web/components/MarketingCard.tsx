

interface MarketingCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  position: 'top' | 'bottom';
}

export function MarketingCard({ title, subtitle, description, imageSrc, position }: MarketingCardProps) {
  const roundedClass = position === 'top' ? 'rounded-br-[80px]' : 'rounded-tl-[80px]';
  
  return (
    <div className={`bg-white h-[269px] w-[525px] overflow-hidden ${roundedClass} relative`}>
      {/* Content Section */}
      <div className="absolute left-[44px] top-[86px] w-[255px]">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-[34px] font-bold text-[#024d2c] leading-[37px] tracking-[-0.68px]">
            {title}
          </h2>
          <h2 className="text-[34px] font-bold text-[#0f1915] leading-[37px] tracking-[-0.68px]">
            {subtitle}
          </h2>
        </div>
        
        {/* Description */}
        <p className="text-[16px] font-medium text-[#718096] leading-[28px] tracking-[-0.32px] mt-[30px]">
          {description}
        </p>
      </div>
      
      {/* Image Section */}
      <div className="absolute right-[-7px] top-[-7px] w-[215px] h-[276px] overflow-hidden">
        <img 
          src={imageSrc} 
          alt={`${title} ${subtitle}`}
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      {/* Background blur effect */}
      <div className="absolute right-[89px] top-[54px] w-[215px] h-[180px] bg-[#5358a7] opacity-[0.06] blur-[5px] rounded-[155px]" />
    </div>
  );
}

