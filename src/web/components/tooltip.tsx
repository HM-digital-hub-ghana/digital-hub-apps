import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

interface TooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  title?: string
  body?: string
  hasBody?: boolean
}

function TooltipContent({
  className,
  sideOffset = 8,
  children,
  title,
  body,
  hasBody,
  ...props
}: TooltipContentProps) {
  const hasTitleBody = (title !== undefined || body !== undefined)
  const showBody = hasBody !== false && (body !== undefined || hasTitleBody)

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-[#FAFAFA] border border-[#E5E5E5] text-[#1F2937]",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "z-50 rounded-2xl px-5 py-3.5",
          "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)]",
          "max-w-xs",
          className
        )}
        {...props}
      >
        {hasTitleBody ? (
          <div className="flex flex-col gap-1 text-center">
            {title && (
              <p className="text-base font-semibold leading-[1.4] text-[#1F2937]">
                {title}
              </p>
            )}
            {showBody && body && (
              <p className="text-sm font-normal leading-[1.4] text-[#4B5563]">
                {body}
              </p>
            )}
          </div>
        ) : (
          typeof children === "string" ? (
            <p className="text-base font-semibold leading-[1.4] text-[#1F2937] text-center">
              {children}
            </p>
          ) : (
            children
          )
        )}
        <TooltipPrimitive.Arrow 
          className="fill-[#FAFAFA] z-50"
          width={10}
          height={5}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
export type { TooltipContentProps }
