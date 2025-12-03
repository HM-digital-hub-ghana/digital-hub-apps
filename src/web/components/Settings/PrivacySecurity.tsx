import { Download, Lock, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

export default function PrivacySecurity() {
  const [toggle, settoggle] = useState(true);
  const dataManager = [
    {
      id: 1,
      title: "Export Your Data",
      detail: "Download all your data in JSON format",
      icons: <Download className="text-primary w-[17.5px] h-[17.5px]" />,
      button: "Export",
      buttoncolor: "text-[#0A0A0A]",
      bg: "bg-[#024D2C14]",
    },
    {
      id: 2,
      title: "Delete All Data",
      detail: "Permanently delete all your data",
      icons: <Trash2 className="text-[#E7000B] w-[17.5px] h-[17.5px]" />,
      buttoncolor: "text-[#E7000B]",
      button: "Delete",
      bg: "bg-[#DC262614]",
    },
  ];
  return (
    <div className="grid gap-[14px]">
      {/* Permissions */}
      <div className="border bg-white h-[131.58px] rounded-[8.75px] p-[16px]">
        <div className="flex items-center  mb-3 gap-2">
          <Lock className="w-[20px] h-[20px] text-primary" />
          <p className="text-[20px] ">Permission</p>
        </div>

        <div className="flex items-center justify-between rounded-[8.75px] px-[14px] bg-[#F8FAFC] border border-[#E5E7EB]">
          <div className="h-[62.58px] rounded-[1px] w-[277.44px] flex justify-center flex-col">
            <h1>Notifications</h1>
            <p className="text-[12px] text-[#717182]">
              Receive app notifications
            </p>
          </div>
          <div>
            <div
              onClick={() => {
                settoggle(!toggle);
              }}
              className={`w-[28px] h-[16.09px] cursor-pointer flex items-center  rounded-full  ${
                toggle == true ? "bg-[#032E1B] justify-end" : "bg-[#CBCED4]"
              } `}
            >
              <div className="w-[14px] h-[14px] rounded-full bg-white"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Data Management */}
      <div className="border border-[#E5E7EB] bg-white rounded-[8.75px] p-[16px]">
        <div className="flex items-center mb-3 gap-2">
          <Shield className="w-[20px] h-[20px] text-primary" />
          <p className="text-[14px] ">Data Management</p>
        </div>
        <div className="grid gap-[12px]">
          {dataManager.map((each) => {
            return (
              <div
                key={each.id}
                className="flex items-center justify-between border border-[#E5E7EB] p-[14px] rounded-[8.75px] "
              >
                <div className="flex justify-between items-center gap-5">
                  <div className={`w-[42px] h-[42px] ${each.bg} flex items-center justify-center rounded-[8.75px]`}>
                    {each.icons}
                  </div>
                  <div className="flex flex-col ">
                    <h2 className="font-400 ">{each.title}</h2>
                    <p className="text-[14px] text-[#717182]">{each.detail}</p>
                  </div>
                </div>

                <div
                  className={`w-[71.5px] h-[31.5px] ${each.bg} rounded-[6.75px] flex items-center justify-center cursor-pointer text-[12.25px] border border-[#E5E7EB]`}
                >
                  <p className={each.buttoncolor}>{each.button}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
