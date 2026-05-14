"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const AccordionContext = React.createContext<{
  value: string | null;
  onValueChange: (value: string) => void;
} | null>(null);

function Accordion({
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState<string | null>(defaultValue ?? null);
  const value = controlledValue ?? internalValue;
  const onValueChange = controlledOnValueChange ?? setInternalValue;

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={cn("flex w-full flex-col", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  className,
  value,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <div
      className={cn("not-last:border-b", className)}
      data-value={value}
      {...props}
    >
      {children}
    </div>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const item = React.useContext(AccordionContext);
  const parent = (React.useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>);

  return (
    <div className="flex">
      <button
        type="button"
        className={cn(
          "group relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
        {...props}
        onClick={(e) => {
          const itemEl = (e.target as HTMLElement).closest("[data-value]");
          const val = itemEl?.getAttribute("data-value") || "";
          if (item?.value === val) {
            item?.onValueChange("");
          } else {
            item?.onValueChange(val);
          }
        }}
      >
        {children}
        <ChevronDown className="pointer-events-none shrink-0 size-4 text-muted-foreground group-aria-expanded:rotate-180 transition-transform" />
      </button>
    </div>
  );
}

function AccordionContent({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: string }) {
  const item = React.useContext(AccordionContext);

  return (
    <div
      className={cn(
        "overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up",
        className
      )}
      {...props}
    >
      <div className="pt-0 pb-2.5">
        {children}
      </div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
