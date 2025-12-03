import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { routes } from "@web/conference-and-visitors-booking/constants/routes";

type Props = {
  children: React.ReactNode;
  routeName:string;
  detail?:string;
};

export default function Layout({ children, routeName, detail }: Props) {
  return (
    <div>
      <div className="w-full mb-5">
        {/* route back to settings */}
        <Link
          to={routes.settings}
          className="flex items-center gap-2 mb-2 cursor-pointer text-[#717182] "
        >
          <ArrowLeft  className="w-[17.5px] h-[17.5px]"/>
          <p className="text-[14px]">Back to Settings</p>
        </Link>
        {/* Settings heading */}
        <div className="h-[56px] flex flex-col  pl-5">
            <h1 className="text-[24px] font-400 ">{routeName}</h1>
            <p className="text-[#717182] text-[14px]"> {detail}</p>
        </div>
      </div>
      <div className="">{children}</div>
    </div>
  );
}
 
