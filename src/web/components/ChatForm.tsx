import { useState } from "react";
import { Card } from "@web/components/ui/card";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@web/components/ui/popover";
import { Sparkles, Maximize2, X, Send } from "lucide-react";

export default function ChatForm() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        {/* Floating Button */}
        <PopoverTrigger asChild>
          <div className="animate-bounce hover:scale-110 hover:-translate-y-1 active:scale-95 transition-transform duration-200">
            <Button
              className="rounded-xl h-14 w-14 p-0 flex items-center justify-center shadow-lg 
              bg-[linear-gradient(to_bottom,#00DD39,#019533,#024D2C)] text-white"
            >
              <Sparkles className="w-10 h-10" />
            </Button>
          </div>
        </PopoverTrigger>

        {/* Chat Popover */}
        <PopoverContent
          side="top"
          align="end"
          sideOffset={0}
          alignOffset={0}
          className="p-0 border-none rounded-xl w-[380px] h-[600px] overflow-hidden shadow-2xl"
        >
          <Card className="w-full h-full flex flex-col overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-[linear-gradient(to_right,#00DD39,#019533,#024D2C)] p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-xl">AI Assistant</h2>
                    <p className="text-sm text-white">Here to help</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-8 w-8"
                    onClick={() => setOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-4">
                  <div className="p-4 rounded-lg shadow-lg shadow-[#00000014]">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700">
                        AI Assistant
                      </span>
                    </div>
                    <p className="text-gray-800">
                      Hi! I'm your booking assistant. What do you need today?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t">
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Ask your question here"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="text-[#098951] border-green-200 bg-[#DEEFE2] hover:bg-green-100 text-sm w-full"
                >
                  Book Conference Room A for 3 pm
                </Button>
              </div>
            </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
