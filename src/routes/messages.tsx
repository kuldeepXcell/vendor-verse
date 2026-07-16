import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { requireAuth } from "@/lib/auth-guards";
import { useDemoStore } from "@/lib/demo-store";
import { FileUploadButton } from "@/components/file-upload-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send } from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/messages")({
  ssr: false,
  beforeLoad: requireAuth("admin"),
  head: () => ({
    meta: [
      { title: "Messages — Nexus Portal" },
      { name: "description", content: "Communicate with vendors directly from the portal." },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { threads, chatMessages, sendMessage, markThreadRead, uploadDocument } = useDemoStore();
  const adminThreads = useMemo(() => threads.filter((t) => t.id !== "th-5"), [threads]);
  const [selectedId, setSelectedId] = useState(adminThreads[0]?.id ?? "th-1");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return adminThreads;
    const q = search.toLowerCase();
    return adminThreads.filter(
      (t) => t.name.toLowerCase().includes(q) || t.last.toLowerCase().includes(q),
    );
  }, [adminThreads, search]);

  const selectedThread = adminThreads.find((t) => t.id === selectedId) ?? adminThreads[0];
  const threadMessages = useMemo(
    () => chatMessages.filter((m) => m.threadId === selectedId),
    [chatMessages, selectedId],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages.length]);

  function selectThread(id: string) {
    setSelectedId(id);
    markThreadRead(id);
  }

  function handleSend() {
    if (!draft.trim()) return;
    sendMessage(selectedId, draft, "admin");
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
      <div className="bento-card grid h-[70vh] grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        <aside className="border-r border-border">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations"
                className="h-9 pl-9 bg-secondary/60 border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ul className="max-h-full divide-y divide-border overflow-y-auto">
            {filteredThreads.map((t) => (
              <li
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={
                  "flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-secondary/50 " +
                  (t.id === selectedId ? "bg-secondary/60" : "")
                }
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {t.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{t.name}</span>
                    <span className="text-[11px] text-muted-foreground">{t.time}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className={"truncate text-xs " + (t.unread ? "text-foreground" : "text-muted-foreground")}>
                      {t.last}
                    </p>
                    {t.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-info" />}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {selectedThread?.initial ?? "?"}
              </div>
              <div>
                <div className="font-display font-semibold">{selectedThread?.name ?? "Select a thread"}</div>
                <div className="text-xs text-muted-foreground">3 participants</div>
              </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </FileUploadButton>
              <Input
                placeholder={`Message ${selectedThread?.name ?? ""}`.trim()}
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
        </section>
      </div>
    </AppShell>
  );
}

function Bubble({ side, name, children }: { side: "me" | "them"; name: string; children: ReactNode }) {
  const mine = side === "me";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div className="max-w-[75%]">
        <div className={"mb-1 text-[11px] " + (mine ? "text-right text-muted-foreground" : "text-muted-foreground")}>
          {name}
        </div>
        <div
          className={
            "rounded-2xl px-4 py-2.5 text-sm shadow-sm " +
            (mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card text-card-foreground rounded-bl-sm border border-border")
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
