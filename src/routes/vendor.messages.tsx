import { useState, useRef, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { FileUploadButton } from "@/components/file-upload-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/vendor/messages")({
  ssr: false,
  beforeLoad: requireAuth("vendor"),
  head: () => ({
    meta: [{ title: "Messages — Vendor Verse" }],
  }),
  component: VendorMessagesPage,
});

function VendorMessagesPage() {
  const { threads, chatMessages, sendMessage, uploadDocument } = useDemoStore();
  const vendorThread = threads.find((t) => t.id === "th-5")!;
  const threadMessages = useMemo(
    () => chatMessages.filter((m) => m.threadId === "th-5"),
    [chatMessages],
  );
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  function handleSend() {
    if (!draft.trim()) return;
    sendMessage("th-5", draft, "vendor");
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <AppShell title="Messages" breadcrumb={["Messages"]}>
      <div className="bento-card flex h-[70vh] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {vendorThread.initial}
          </div>
          <div>
            <div className="font-display font-semibold">{vendorThread.name}</div>
            <div className="text-xs text-muted-foreground">Your buyer contact</div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-secondary/30 p-6">
          {threadMessages.map((m) => (
            <Bubble key={m.id} side={m.side} name={m.name}>
              {m.body}
            </Bubble>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2 rounded-xl border border-input bg-background p-2">
            <FileUploadButton
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              successLabel="File attached"
              onFiles={(files) => uploadDocument(files[0]!.name)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </FileUploadButton>
            <Input
              placeholder="Message Procurement"
              className="h-8 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button size="sm" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Bubble({
  side,
  name,
  children,
}: {
  side: "me" | "them";
  name: string;
  children: ReactNode;
}) {
  const mine = side === "me";
  return (
    <div className={`motion-fade-up ${mine ? "flex justify-end" : "flex justify-start"}`}>
      <div className="max-w-[75%]">
        <div
          className={
            "mb-1 text-[11px] " +
            (mine ? "text-right text-muted-foreground" : "text-muted-foreground")
          }
        >
          {name}
        </div>
        <div
          className={
            "rounded-2xl px-4 py-2.5 text-sm shadow-sm " +
            (mine
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card text-card-foreground rounded-bl-sm border border-border")
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
