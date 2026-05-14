"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const SheetContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

function Sheet({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  children,
  ...props
}: React.HTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SheetContext);
  return (
    <button type="button" onClick={() => ctx?.onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" | "left" | "right" }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx?.open) return null;

  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l max-w-sm",
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={() => ctx.onOpenChange(false)} />
      <div
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => ctx.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export { Sheet, SheetTrigger, SheetContent }
