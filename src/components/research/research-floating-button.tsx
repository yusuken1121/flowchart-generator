"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { PenLine, X, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchForm } from "@/components/research/research-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface DocumentPictureInPicture {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export function ResearchFloatingButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pipWindow, setPipWindow] = React.useState<Window | null>(null);

  // Close PiP window when component unmounts
  React.useEffect(() => {
    return () => {
      if (pipWindow) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  const openPiP = async () => {
    // Check API support
    if (!("documentPictureInPicture" in window)) {
      toast.error("Picture-in-Picture is not supported in this browser.");
      return;
    }

    try {
      // Close popover when opening PiP
      setIsOpen(false);

      // Request PiP window
      // Types are now defined globally above
      if (!window.documentPictureInPicture) {
        throw new Error("API not available");
      }

      const win = await window.documentPictureInPicture.requestWindow({
        width: 400,
        height: 600,
      });

      // Copy styles from main window to PiP window
      // This ensures Tailwind/Global styles work there too
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          // Extract CSS rules
          // Note: accessing cssRules might fail for cross-origin stylesheets
          const cssRules = [...styleSheet.cssRules]
            .map((rule) => rule.cssText)
            .join("");
          const style = document.createElement("style");
          style.textContent = cssRules;
          win.document.head.appendChild(style);
        } catch (e: unknown) {
          // Fallback for linked stylesheets (e.g. Google Fonts)
          if (styleSheet.href) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = styleSheet.href;
            win.document.head.appendChild(link);
          }
        }
      });

      // Also copy specific style tags usually injected by Next.js/Tailwind
      const styleTags = document.head.querySelectorAll("style");
      styleTags.forEach((tag) => {
        win.document.head.appendChild(tag.cloneNode(true));
      });

      setPipWindow(win);

      // Handle closing
      win.addEventListener("pagehide", () => {
        setPipWindow(null);
      });
    } catch (error: unknown) {
      console.error("Failed to open PiP", error);
      toast.error("Failed to open separate window.");
    }
  };

  return (
    <>
      {/* 
        If PiP is open, we render nothing in the main window button 
        OR we can keep the button but show it's active. 
        Let's allow re-opening/resetting if needed.
      */}
      {!pipWindow && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 rounded-br-2xl"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <PenLine className="h-6 w-6" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[400px] p-0 mr-6 mb-2 overflow-hidden shadow-2xl border-none"
            side="top"
            align="end"
          >
            <div className="bg-background border rounded-lg flex flex-col max-h-[80vh]">
              <div className="p-2 border-b flex justify-between items-center bg-muted/30">
                <span className="text-xs font-semibold px-2 text-muted-foreground">
                  Quick Note
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openPiP}
                  title="Pop out (Stay on top)"
                >
                  <MoveUpRight className="h-4 w-4 mr-1" />
                  Pop out
                </Button>
              </div>
              <div className="p-1 overflow-y-auto">
                <ResearchForm />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Render into PiP window using Portal */}
      {pipWindow &&
        createPortal(
          <div className="p-4 h-full w-full bg-background text-foreground antialiased font-sans flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="font-bold text-lg">Research Note</h2>
            </div>
            <ResearchForm />
            <div className="mt-auto pt-4 text-xs text-muted-foreground text-center">
              Close this window to return to app
            </div>
          </div>,
          pipWindow.document.body,
        )}
    </>
  );
}
