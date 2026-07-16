import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  DEMO_VENDOR_NAME,
  documents as seedDocuments,
  initialInvoices,
  initialPurchaseOrders,
  messageThreads as seedThreads,
  paymentRuns as seedPaymentRuns,
  vendorPayments as seedVendorPayments,
  vendors as seedVendors,
  vendorOnboardingSteps as seedOnboardingSteps,
  type DocumentItem,
  type Invoice,
  type MessageThread,
  type PaymentRun,
  type PurchaseOrder,
  type Vendor,
  type VendorPayment,
} from "@/lib/demo-data";

export type ChatMessage = {
  id: string;
  threadId: string;
  side: "me" | "them";
  name: string;
  body: string;
};

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    threadId: "th-1",
    side: "them",
    name: "Sara — Aster",
    body: "Hi Ava, we can hit the Aug 21 delivery window if the revised spec is locked by tomorrow EOD.",
  },
  {
    id: "m2",
    threadId: "th-1",
    side: "me",
    name: "You",
    body: "Confirmed — spec is final. I've attached the updated drawing to PO-24817.",
  },
  {
    id: "m3",
    threadId: "th-1",
    side: "them",
    name: "Sara — Aster",
    body: "Received. We'll acknowledge in the portal within the hour.",
  },
  {
    id: "m4",
    threadId: "th-5",
    side: "them",
    name: "Ava Klein — Procurement",
    body: "Hi Sara, the revised spec for PO-24817 is attached. Let me know if the timeline still works.",
  },
  {
    id: "m5",
    threadId: "th-5",
    side: "me",
    name: "You",
    body: "Thanks Ava! We can hit Aug 21 if the spec is locked by tomorrow EOD.",
  },
  {
    id: "m6",
    threadId: "th-5",
    side: "them",
    name: "Ava Klein — Procurement",
    body: "Confirmed — spec is final. Updated drawing is on the PO.",
  },
  {
    id: "m7",
    threadId: "th-5",
    side: "me",
    name: "You",
    body: "Received. We'll acknowledge in the portal within the hour.",
  },
];

type OnboardingStep = { label: string; done: boolean };

type DemoStoreValue = {
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  documents: DocumentItem[];
  paymentRuns: PaymentRun[];
  vendorPayments: VendorPayment[];
  threads: MessageThread[];
  chatMessages: ChatMessage[];
  onboardingSteps: OnboardingStep[];
  acknowledgePurchaseOrder: (id: string) => void;
  approveInvoice: (id: string) => void;
  rejectInvoice: (id: string) => void;
  createPurchaseOrder: (input: {
    vendor: string;
    value: string;
    delivery: string;
    description: string;
  }) => void;
  inviteVendor: (input: { name: string; category: string; location: string }) => void;
  uploadInvoice: (fileName: string, role: "admin" | "vendor") => void;
  uploadDocument: (fileName: string, vendor?: string) => void;
  completeOnboardingStep: (label: string) => void;
  schedulePaymentRun: () => void;
  reschedulePaymentRun: (id: string) => void;
  markPaymentRunProcessed: (id: string) => void;
  sendMessage: (threadId: string, body: string, from: "admin" | "vendor") => void;
  markThreadRead: (threadId: string) => void;
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

function nextId(prefix: string, existing: string[]): string {
  const nums = existing
    .map((id) => Number(id.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `${prefix}${max + 1}`;
}

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState(seedVendors);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [documents, setDocuments] = useState(seedDocuments);
  const [paymentRuns, setPaymentRuns] = useState(seedPaymentRuns);
  const [vendorPayments, setVendorPayments] = useState(seedVendorPayments);
  const [threads, setThreads] = useState(seedThreads);
  const [chatMessages, setChatMessages] = useState(seedMessages);
  const [onboardingSteps, setOnboardingSteps] = useState(seedOnboardingSteps);

  const acknowledgePurchaseOrder = useCallback((id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) =>
        po.id === id ? { ...po, status: "Acknowledged", tone: "info" as const } : po,
      ),
    );
    toast.success("Purchase order acknowledged", { description: id });
  }, []);

  const approveInvoice = useCallback((id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: "Approved", tone: "success" as const } : inv,
      ),
    );
    toast.success("Invoice approved", { description: id });
  }, []);

  const rejectInvoice = useCallback((id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: "Rejected", tone: "destructive" as const }
          : inv,
      ),
    );
    toast.message("Invoice rejected", { description: id });
  }, []);

  const createPurchaseOrder = useCallback(
    (input: {
      vendor: string;
      value: string;
      delivery: string;
      description: string;
    }) => {
      const id = nextId(
        "PO-",
        purchaseOrders.map((p) => p.id),
      );
      const po: PurchaseOrder = {
        id,
        vendor: input.vendor,
        items: 1,
        value: input.value.startsWith("$") ? input.value : `$${input.value}`,
        created: "Today",
        delivery: input.delivery || "TBD",
        status: "Awaiting acknowledgement",
        tone: "warning",
        description: input.description || "New purchase order",
      };
      setPurchaseOrders((prev) => [po, ...prev]);
      toast.success("Purchase order created", { description: id });
    },
    [purchaseOrders],
  );

  const inviteVendor = useCallback(
    (input: { name: string; category: string; location: string }) => {
      const initial = input.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("");
      const vendor: Vendor = {
        name: input.name,
        initial: initial || "NV",
        category: input.category || "General",
        location: input.location || "Remote",
        spend: "$0",
        status: "Onboarding",
        tone: "info",
        risk: "—",
      };
      setVendors((prev) => [vendor, ...prev]);
      toast.success("Vendor invited", { description: input.name });
    },
    [],
  );

  const uploadInvoice = useCallback(
    (fileName: string, role: "admin" | "vendor") => {
      const id = nextId(
        "INV-",
        invoices.map((i) => i.id),
      );
      const inv: Invoice = {
        id,
        po: purchaseOrders[0]?.id ?? "PO-NEW",
        vendor: role === "vendor" ? DEMO_VENDOR_NAME : purchaseOrders[0]?.vendor ?? DEMO_VENDOR_NAME,
        value: "$0",
        due: "TBD",
        status: role === "vendor" ? "In review" : "Awaiting approval",
        tone: "warning",
        match: "Pending",
        meta: `Uploaded ${fileName}`,
      };
      setInvoices((prev) => [inv, ...prev]);
      toast.success("Invoice uploaded", { description: `${id} · ${fileName}` });
    },
    [invoices, purchaseOrders],
  );

  const uploadDocument = useCallback(
    (fileName: string, vendor = DEMO_VENDOR_NAME) => {
      const doc: DocumentItem = {
        id: `doc-${Date.now()}`,
        name: fileName,
        vendor,
        group: "Compliance",
        meta: "Uploaded just now",
        status: "Pending review",
        tone: "info",
      };
      setDocuments((prev) => [doc, ...prev]);
      if (vendor === DEMO_VENDOR_NAME) {
        const lower = fileName.toLowerCase();
        if (lower.includes("coi") || lower.includes("insurance")) {
          setOnboardingSteps((prev) =>
            prev.map((s) => (s.label === "COI upload" ? { ...s, done: true } : s)),
          );
        }
        if (lower.includes("iso")) {
          setOnboardingSteps((prev) =>
            prev.map((s) =>
              s.label === "ISO 9001 certification" ? { ...s, done: true } : s,
            ),
          );
        }
      }
      toast.success("Document uploaded", { description: fileName });
    },
    [],
  );

  const completeOnboardingStep = useCallback((label: string) => {
    setOnboardingSteps((prev) =>
      prev.map((s) => (s.label === label ? { ...s, done: true } : s)),
    );
    toast.success("Task completed", { description: label });
  }, []);

  const schedulePaymentRun = useCallback(() => {
    const id = nextId(
      "RUN-",
      paymentRuns.map((r) => r.id),
    );
    const run: PaymentRun = {
      id,
      date: "Aug 29, 2026",
      vendors: 8,
      count: 12,
      total: "$156,400",
      status: "Scheduled",
      tone: "info",
    };
    setPaymentRuns((prev) => [run, ...prev]);
    toast.success("Payment run scheduled", { description: id });
  }, [paymentRuns]);

  const reschedulePaymentRun = useCallback((id: string) => {
    setPaymentRuns((prev) =>
      prev.map((run) =>
        run.id === id ? { ...run, date: "Aug 29, 2026", status: "Scheduled", tone: "info" } : run,
      ),
    );
    toast.success("Payment run rescheduled", { description: `${id} → Aug 29` });
  }, []);

  const markPaymentRunProcessed = useCallback((id: string) => {
    setPaymentRuns((prev) =>
      prev.map((run) =>
        run.id === id
          ? { ...run, status: "Processed", tone: "success" as const }
          : run,
      ),
    );
    toast.success("Payment run processed", { description: id });
  }, []);

  const sendMessage = useCallback(
    (threadId: string, body: string, from: "admin" | "vendor") => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        threadId,
        side: "me",
        name: from === "admin" ? "You" : "You",
        body: trimmed,
      };
      setChatMessages((prev) => [...prev, msg]);
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, last: trimmed, time: "now", unread: false } : t,
        ),
      );
      toast.success("Message sent");
    },
    [],
  );

  const markThreadRead = useCallback((threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, unread: false } : t)),
    );
  }, []);

  const value = useMemo(
    () => ({
      vendors,
      purchaseOrders,
      invoices,
      documents,
      paymentRuns,
      vendorPayments,
      threads,
      chatMessages,
      onboardingSteps,
      acknowledgePurchaseOrder,
      approveInvoice,
      rejectInvoice,
      createPurchaseOrder,
      inviteVendor,
      uploadInvoice,
      uploadDocument,
      completeOnboardingStep,
      schedulePaymentRun,
      reschedulePaymentRun,
      markPaymentRunProcessed,
      sendMessage,
      markThreadRead,
    }),
    [
      vendors,
      purchaseOrders,
      invoices,
      documents,
      paymentRuns,
      vendorPayments,
      threads,
      chatMessages,
      onboardingSteps,
      acknowledgePurchaseOrder,
      approveInvoice,
      rejectInvoice,
      createPurchaseOrder,
      inviteVendor,
      uploadInvoice,
      uploadDocument,
      completeOnboardingStep,
      schedulePaymentRun,
      reschedulePaymentRun,
      markPaymentRunProcessed,
      sendMessage,
      markThreadRead,
    ],
  );

  return (
    <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>
  );
}

export function useDemoStore(): DemoStoreValue {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within DemoStoreProvider");
  }
  return ctx;
}
