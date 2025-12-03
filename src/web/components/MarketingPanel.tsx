import { MarketingCard } from './MarketingCard';
import { ASSETS } from '@web/conference-and-visitors-booking/assets/assets';

export function MarketingPanel() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute left-0 top-0 w-full h-full">
        {/* Main background container */}
        <div className="absolute h-full left-0 top-0 w-full">
          {/* Background with shadow */}
          <div className="absolute h-full left-0 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-full">
            <div className="absolute bg-[#024d2c] h-full left-0 top-0 w-full" />
          </div>
          
          {/* Cards Container */}
          <div className="absolute inset-0 flex flex-col justify-center gap-20">
            {/* Top Card - touching left edge */}
            <div className="ml-0">
              <MarketingCard
                title="Booking made"
                subtitle="Easy"
                description="Book conference rooms, track visitors, manage workplace."
                imageSrc={ASSETS.chairs}
                position="top"
              />
            </div>
            
            {/* Bottom Card - touching right edge */}
            <div className="self-end mr-0">
              <MarketingCard
                title="Manage visitors"
                subtitle="Seamlessly"
                description="Track visitors, make arrangements, take charge of your space."
                imageSrc={ASSETS.handshake}
                position="bottom"
              />
            </div>
          </div>
          
          {/* Decorative Ellipses */}
          {/* Top Ellipse - positioned at top right */}
          <div className="absolute right-[-200px] top-[-200px]">
            <img 
              src={ASSETS.ellipseTop} 
              alt=""
              className="h-[792.788px] w-[803.187px]"
              style={{ opacity: 1 }}
            />
          </div>
          
          {/* Bottom Ellipse - positioned at bottom left */}
          <div className="absolute left-[-200px] bottom-[-200px]">
            <img 
              src={ASSETS.ellipseBottom} 
              alt=""
              className="h-[792.788px] w-[803.187px]"
              style={{ opacity: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
