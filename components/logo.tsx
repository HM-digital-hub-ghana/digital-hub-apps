import { ASSETS } from "src/web/conference-and-visitors-booking/assets/assets";
export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src={ASSETS.smartspaceLogo}
        alt="SmartSpace Logo"
        className="h-10 w-10"
      />
      <h1 className="text-3xl md:text-4xl font-bold text-primary">
        Smart<span className="text-black">Space</span>
      </h1>
    </div>
  );
}
