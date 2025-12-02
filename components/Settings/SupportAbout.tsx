import {
  BookOpen,
  CircleAlert,
  CircleQuestionMark,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SupportAbout() {
  const help = [
    {
      id: 1,
      title: "User Guide",
      detail: "Learn how to use all features",
      icons: <BookOpen className="w-[17.5px] h-[17.5px]" />,
      button: <SquareArrowOutUpRight className="w-[17.5px] h-[17.5px]" />,
      to: "",
    },
    {
      id: 2,
      title: "FAQs",
      detail: "Frequently asked questions",
      icons: <CircleQuestionMark className="w-[17.5px] h-[17.5px]" />,
      button: <SquareArrowOutUpRight className="w-[17.5px] h-[17.5px]" />,
      to: "",
    },
  ];
  const about =[
    {
      id:1,
      title:"App Version",
      version:"v2.5.1",
      to:""
    },
    {
      id:2,
      title:"Last Updated",
      version:"November 1, 2025",
      to:""
    },
    {
      id:3,
      title:"Build Number",
      version:"251.2024",
      to:""
    },
  ]
  return (
    <div className="gird gap-[14px]">
      {/* Help Center */}
      <div className="border border-[#E5E7EB] bg-white rounded-[8.75px] p-[16px]">
        <div className="flex items-center mb-3 gap-2">
          <CircleQuestionMark className="w-[20px] h-[20px] text-primary" />
          <p className="text-[20px] ">Help Center</p>
        </div>

        <div className="grid gap-[12px]">
          {help.map((each) => {
            return (
              <Link
                key={each.id}
                className="flex cursor-pointer items-center bg-[#F8FAFC] justify-between border border-[#E5E7EB] p-[14px] rounded-[8.75px] "
                to={each.to}
              >
                <div className="flex justify-between items-center gap-5">
                  <div
                    className={`w-[20px] h-[20px] flex items-center text-[#717182] justify-center rounded-[8.75px]`}
                  >
                    {each.icons}
                  </div>
                  <div className="flex flex-col ">
                    <h2 className="font-400 ">{each.title}</h2>
                    <p className="text-[14px] text-[#717182]">{each.detail}</p>
                  </div>
                </div>

                <div className="text-[#717182]">
                  <p>{each.button}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {/* About */}
      <div className="border border-[#E5E7EB] bg-white rounded-[8.75px] p-[16px]">
        <div className="flex items-center mb-3 gap-2">
          <CircleAlert className="w-[20px] h-[20px] text-primary" />
          <p className="text-[14px] ">About</p>
        </div>

        <div className="grid gap-[12px]">
          {about.map((each) => {
            return (
              <Link
                key={each.id}
                className="flex cursor-pointer items-center bg-[#F8FAFC] justify-between border border-[#E5E7EB] p-[14px] rounded-[8.75px] "
                to={each.to}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col ">
                    <p className="text-[14px] text-[#717182]">{each.title}</p>
                  </div>
                </div>

                <div className="text-[#717182]">
                  <p>{each.version}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="w-full mt-2 h-[31.5px] text-[12px] flex justify-center items-center border rounded-[6.57pc] border-[#E5E7EB]">
          <p>Check for Updates</p>
        </div>
      </div>
    </div>
  );
}
