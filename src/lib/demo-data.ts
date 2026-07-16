export type StatusTone = "muted" | "success" | "warning" | "info" | "destructive";

export const DEMO_VENDOR_NAME = "Aster Manufacturing";
export const DEMO_VENDOR_INITIAL = "AM";

export type Vendor = {
  name: string;
  initial: string;
  category: string;
  location: string;
  spend: string;
  status: string;
  tone: StatusTone;
  risk: string;
};

export type PurchaseOrder = {
  id: string;
  vendor: string;
  items: number;
  value: string;
  created: string;
  delivery: string;
  status: string;
  tone: StatusTone;
  description?: string;
};

export type Invoice = {
  id: string;
  po: string;
  vendor: string;
  value: string;
  due: string;
  status: string;
  tone: StatusTone;
  match: string;
  meta?: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  vendor: string;
  group: "Contracts & MSAs" | "Compliance" | "Tax & Banking" | "Product & Brand";
  meta: string;
  status: string;
  tone: StatusTone;
};

export type PaymentRun = {
  id: string;
  date: string;
  vendors: number;
  count: number;
  total: string;
  status: string;
  tone: StatusTone;
};

export type VendorPayment = {
  id: string;
  date: string;
  method: string;
  invoice: string;
  amount: string;
  status: string;
  tone: StatusTone;
};

export type MessageThread = {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: boolean;
  initial: string;
  vendorFacing: boolean;
};

export const vendors: Vendor[] = [
  {
    name: "Aster Manufacturing",
    initial: "AM",
    category: "Components",
    location: "Portland, OR",
    spend: "$412,880",
    status: "Active",
    tone: "success",
    risk: "Low",
  },
  {
    name: "Kenji Metals",
    initial: "KM",
    category: "Raw materials",
    location: "Osaka, JP",
    spend: "$298,410",
    status: "Active",
    tone: "success",
    risk: "Low",
  },
  {
    name: "Orbit Logistics",
    initial: "OL",
    category: "Freight & 3PL",
    location: "Chicago, IL",
    spend: "$184,200",
    status: "Review",
    tone: "warning",
    risk: "Med",
  },
  {
    name: "Halcyon Print Co.",
    initial: "HP",
    category: "Packaging",
    location: "Austin, TX",
    spend: "$96,540",
    status: "Active",
    tone: "success",
    risk: "Low",
  },
  {
    name: "Northwind Textiles",
    initial: "NT",
    category: "Textiles",
    location: "Manchester, UK",
    spend: "$58,200",
    status: "Onboarding",
    tone: "info",
    risk: "—",
  },
  {
    name: "Meridian Chemicals",
    initial: "MC",
    category: "Chemicals",
    location: "Rotterdam, NL",
    spend: "$44,120",
    status: "Active",
    tone: "success",
    risk: "High",
  },
  {
    name: "Sable & Sons",
    initial: "SS",
    category: "Hardware",
    location: "Sheffield, UK",
    spend: "$21,400",
    status: "Paused",
    tone: "muted",
    risk: "Low",
  },
  {
    name: "Terra Foundry",
    initial: "TF",
    category: "Castings",
    location: "Pittsburgh, PA",
    spend: "$8,780",
    status: "Onboarding",
    tone: "info",
    risk: "—",
  },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-24817",
    vendor: "Aster Manufacturing",
    items: 14,
    value: "$48,200",
    created: "Aug 12",
    delivery: "Aug 21",
    status: "Awaiting acknowledgement",
    tone: "warning",
    description: "Precision brackets — batch B",
  },
  {
    id: "PO-24816",
    vendor: "Halcyon Print Co.",
    items: 3,
    value: "$12,540",
    created: "Aug 11",
    delivery: "Aug 19",
    status: "Acknowledged",
    tone: "info",
    description: "Carton print run — autumn SKUs",
  },
  {
    id: "PO-24815",
    vendor: "Kenji Metals",
    items: 22,
    value: "$86,900",
    created: "Aug 10",
    delivery: "Aug 28",
    status: "In production",
    tone: "info",
    description: "Alloy plate — grade 6061",
  },
  {
    id: "PO-24814",
    vendor: "Meridian Chemicals",
    items: 5,
    value: "$14,300",
    created: "Aug 10",
    delivery: "Aug 24",
    status: "Draft",
    tone: "muted",
    description: "Solvent lot — Q3 top-up",
  },
  {
    id: "PO-24812",
    vendor: "Northwind Textiles",
    items: 8,
    value: "$5,780",
    created: "Aug 09",
    delivery: "Aug 15",
    status: "Delivered",
    tone: "success",
    description: "Canvas rolls — navy",
  },
  {
    id: "PO-24811",
    vendor: "Terra Foundry",
    items: 2,
    value: "$4,120",
    created: "Aug 08",
    delivery: "Aug 22",
    status: "Acknowledged",
    tone: "info",
    description: "Cast housings — sample set",
  },
  {
    id: "PO-24809",
    vendor: "Orbit Logistics",
    items: 1,
    value: "$22,100",
    created: "Aug 07",
    delivery: "Aug 12",
    status: "Delayed",
    tone: "destructive",
    description: "Chicago → Portland LTL",
  },
  {
    id: "PO-24806",
    vendor: "Sable & Sons",
    items: 6,
    value: "$3,540",
    created: "Aug 05",
    delivery: "Aug 18",
    status: "Delivered",
    tone: "success",
    description: "Fastener assortment",
  },
  {
    id: "PO-24803",
    vendor: "Aster Manufacturing",
    items: 9,
    value: "$32,400",
    created: "Aug 02",
    delivery: "Sep 04",
    status: "In production",
    tone: "info",
    description: "Aluminum extrusions — series 6",
  },
  {
    id: "PO-24798",
    vendor: "Aster Manufacturing",
    items: 4,
    value: "$14,700",
    created: "Jul 28",
    delivery: "Sep 12",
    status: "In production",
    tone: "info",
    description: "Custom fasteners",
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-8842",
    po: "PO-24815",
    vendor: "Kenji Metals",
    value: "$86,900",
    due: "Aug 30",
    status: "Awaiting approval",
    tone: "warning",
    match: "3-way ✓",
    meta: "Submitted Aug 12",
  },
  {
    id: "INV-8841",
    po: "PO-24814",
    vendor: "Meridian Chemicals",
    value: "$14,300",
    due: "Sep 04",
    status: "PO mismatch",
    tone: "destructive",
    match: "2-way ✕",
    meta: "Flagged Aug 13",
  },
  {
    id: "INV-8840",
    po: "PO-24812",
    vendor: "Northwind Textiles",
    value: "$5,780",
    due: "Aug 25",
    status: "Approved",
    tone: "success",
    match: "3-way ✓",
    meta: "Approved Aug 14",
  },
  {
    id: "INV-8839",
    po: "PO-24811",
    vendor: "Terra Foundry",
    value: "$4,120",
    due: "Sep 01",
    status: "Scheduled",
    tone: "info",
    match: "3-way ✓",
    meta: "Pay date Sep 01",
  },
  {
    id: "INV-8838",
    po: "PO-24809",
    vendor: "Orbit Logistics",
    value: "$22,100",
    due: "Aug 22",
    status: "Paid",
    tone: "success",
    match: "3-way ✓",
    meta: "Paid Aug 15",
  },
  {
    id: "INV-8836",
    po: "PO-24806",
    vendor: "Sable & Sons",
    value: "$3,540",
    due: "Aug 21",
    status: "Approved",
    tone: "success",
    match: "3-way ✓",
    meta: "Approved Aug 10",
  },
  {
    id: "INV-8830",
    po: "PO-24803",
    vendor: "Aster Manufacturing",
    value: "$32,400",
    due: "Aug 22",
    status: "Scheduled",
    tone: "info",
    match: "3-way ✓",
    meta: "Pay date Aug 22",
  },
  {
    id: "INV-8821",
    po: "PO-24788",
    vendor: "Aster Manufacturing",
    value: "$18,600",
    due: "Aug 08",
    status: "Paid",
    tone: "success",
    match: "3-way ✓",
    meta: "Paid Aug 08",
  },
  {
    id: "INV-8818",
    po: "PO-24817",
    vendor: "Aster Manufacturing",
    value: "$48,200",
    due: "Sep 05",
    status: "In review",
    tone: "warning",
    match: "2-way ✓",
    meta: "Submitted Aug 14",
  },
];

export const documents: DocumentItem[] = [
  {
    id: "doc-1",
    name: "MSA — Aster Manufacturing",
    vendor: "Aster Manufacturing",
    group: "Contracts & MSAs",
    meta: "v3.2 · Signed Jul 03",
    status: "Active",
    tone: "success",
  },
  {
    id: "doc-2",
    name: "MSA — Orbit Logistics",
    vendor: "Orbit Logistics",
    group: "Contracts & MSAs",
    meta: "v3.1 · Expired Aug 18",
    status: "Overdue",
    tone: "destructive",
  },
  {
    id: "doc-3",
    name: "NDA — Kenji Metals",
    vendor: "Kenji Metals",
    group: "Contracts & MSAs",
    meta: "Signed Feb 12",
    status: "Active",
    tone: "success",
  },
  {
    id: "doc-4",
    name: "COI — Aster Manufacturing",
    vendor: "Aster Manufacturing",
    group: "Compliance",
    meta: "Expires Aug 24",
    status: "8 days",
    tone: "warning",
  },
  {
    id: "doc-5",
    name: "ISO 9001 — Kenji Metals",
    vendor: "Kenji Metals",
    group: "Compliance",
    meta: "Expires Sep 06",
    status: "21 days",
    tone: "info",
  },
  {
    id: "doc-6",
    name: "SOC 2 — Halcyon Print Co.",
    vendor: "Halcyon Print Co.",
    group: "Compliance",
    meta: "Expires Dec 12",
    status: "OK",
    tone: "muted",
  },
  {
    id: "doc-7",
    name: "W-9 — Aster Manufacturing",
    vendor: "Aster Manufacturing",
    group: "Tax & Banking",
    meta: "On file · Verified",
    status: "Verified",
    tone: "success",
  },
  {
    id: "doc-8",
    name: "W-9 — Halcyon Print Co.",
    vendor: "Halcyon Print Co.",
    group: "Tax & Banking",
    meta: "Expires Aug 30",
    status: "14 days",
    tone: "info",
  },
  {
    id: "doc-9",
    name: "Banking form — Terra Foundry",
    vendor: "Terra Foundry",
    group: "Tax & Banking",
    meta: "Verified Aug 04",
    status: "Verified",
    tone: "success",
  },
  {
    id: "doc-10",
    name: "Brand guidelines — Halcyon",
    vendor: "Halcyon Print Co.",
    group: "Product & Brand",
    meta: "Updated Jun 22",
    status: "Active",
    tone: "success",
  },
  {
    id: "doc-11",
    name: "Spec sheets — Kenji Metals",
    vendor: "Kenji Metals",
    group: "Product & Brand",
    meta: "22 files",
    status: "Library",
    tone: "muted",
  },
  {
    id: "doc-12",
    name: "ISO 9001 — Aster Manufacturing",
    vendor: "Aster Manufacturing",
    group: "Compliance",
    meta: "Upload pending",
    status: "Missing",
    tone: "destructive",
  },
];

export const paymentRuns: PaymentRun[] = [
  {
    id: "RUN-0821",
    date: "Aug 22, 2026",
    vendors: 14,
    count: 22,
    total: "$412,220",
    status: "Scheduled",
    tone: "info",
  },
  {
    id: "RUN-0815",
    date: "Aug 15, 2026",
    vendors: 11,
    count: 18,
    total: "$298,410",
    status: "Processed",
    tone: "success",
  },
  {
    id: "RUN-0808",
    date: "Aug 08, 2026",
    vendors: 9,
    count: 15,
    total: "$186,540",
    status: "Processed",
    tone: "success",
  },
  {
    id: "RUN-0801",
    date: "Aug 01, 2026",
    vendors: 13,
    count: 24,
    total: "$421,880",
    status: "Processed",
    tone: "success",
  },
];

export const vendorPayments: VendorPayment[] = [
  {
    id: "PAY-4412",
    date: "Aug 22, 2026",
    method: "ACH · Chase •• 4821",
    invoice: "INV-8830",
    amount: "$32,400",
    status: "Scheduled",
    tone: "info",
  },
  {
    id: "PAY-4398",
    date: "Aug 08, 2026",
    method: "ACH · Chase •• 4821",
    invoice: "INV-8821",
    amount: "$18,600",
    status: "Paid",
    tone: "success",
  },
  {
    id: "PAY-4371",
    date: "Jul 25, 2026",
    method: "Wire · HSBC •• 9903",
    invoice: "INV-8790",
    amount: "$41,200",
    status: "Paid",
    tone: "success",
  },
];

export const messageThreads: MessageThread[] = [
  {
    id: "th-1",
    name: "Aster Manufacturing",
    last: "PO-24817 — please confirm delivery window",
    time: "4m",
    unread: true,
    initial: "AM",
    vendorFacing: true,
  },
  {
    id: "th-2",
    name: "Kenji Metals",
    last: "Ship notice attached for PO-24815",
    time: "1h",
    unread: true,
    initial: "KM",
    vendorFacing: false,
  },
  {
    id: "th-3",
    name: "Orbit Logistics",
    last: "Estimated 2 day delay on Chicago leg",
    time: "3h",
    unread: true,
    initial: "OL",
    vendorFacing: false,
  },
  {
    id: "th-4",
    name: "Halcyon Print Co.",
    last: "Proof approved — thanks!",
    time: "Yesterday",
    unread: false,
    initial: "HP",
    vendorFacing: false,
  },
  {
    id: "th-5",
    name: "Procurement — Ava Klein",
    last: "Spec is final — updated drawing attached",
    time: "4m",
    unread: true,
    initial: "AK",
    vendorFacing: true,
  },
];

export const vendorOnboardingSteps = [
  { label: "Company profile", done: true },
  { label: "Banking details", done: true },
  { label: "W-9 tax form", done: true },
  { label: "COI upload", done: false },
  { label: "ISO 9001 certification", done: false },
  { label: "Master service agreement", done: true },
];

export function filterByVendor<T extends { vendor: string }>(rows: T[], vendor = DEMO_VENDOR_NAME): T[] {
  return rows.filter((row) => row.vendor === vendor);
}
