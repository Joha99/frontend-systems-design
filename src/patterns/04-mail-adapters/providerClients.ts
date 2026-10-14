/**
 * ✅ PROVIDED: don't edit. Two "vendor SDKs" with different shapes, plus
 * in-memory fakes of each (what you'd use in tests).
 *
 * The shapes are simplified versions of the real Gmail API and Microsoft
 * Graph (Outlook) API, so the mismatches are realistic.
 */

// ── Gmail-like ───────────────────────────────────────────────────────────────

export interface GmailMessage {
  id: string;
  threadId: string;
  /** System labels ("INBOX", "UNREAD", "IMPORTANT", "CATEGORY_UPDATES") and
   *  user label ids ("Label_12"). */
  labelIds: string[];
  snippet: string;
  /** Epoch milliseconds, AS A STRING. */
  internalDate: string;
  payload: { headers: Array<{ name: string; value: string }> };
}

export interface GmailClient {
  listMessages(params: {
    labelIds: string[];
    pageToken?: string;
    maxResults: number;
  }): Promise<{ messages: GmailMessage[]; nextPageToken?: string }>;
  modifyLabels(
    id: string,
    change: { addLabelIds: string[]; removeLabelIds: string[] },
  ): Promise<void>;
  /** User label id → display name, e.g. { Label_12: "Receipts" }. */
  getLabels(): Promise<Record<string, string>>;
}

// ── Outlook-like ─────────────────────────────────────────────────────────────

export interface OutlookMessage {
  id: string;
  conversationId: string;
  subject: string | null;
  bodyPreview: string;
  /** ISO 8601. */
  receivedDateTime: string;
  isRead: boolean;
  from: { emailAddress: { name: string; address: string } } | null;
  parentFolderId: "inbox" | "archive";
  categories: string[];
}

export interface OutlookClient {
  getMessages(params: {
    folderId: "inbox" | "archive";
    skip: number;
    top: number;
  }): Promise<{ value: OutlookMessage[]; "@odata.nextLink"?: string }>;
  patchMessage(id: string, patch: { isRead: boolean }): Promise<void>;
  moveMessage(id: string, destinationFolderId: "inbox" | "archive"): Promise<void>;
}

// ── Fakes ────────────────────────────────────────────────────────────────────

export class FakeGmailClient implements GmailClient {
  messages: GmailMessage[];
  labels: Record<string, string>;
  calls: string[] = [];
  failIds = new Set<string>();

  constructor(messages: GmailMessage[], labels: Record<string, string> = {}) {
    this.messages = messages;
    this.labels = labels;
  }

  async listMessages(params: { labelIds: string[]; pageToken?: string; maxResults: number }) {
    this.calls.push(`listMessages:${params.pageToken ?? ""}`);
    const matching = this.messages.filter((m) =>
      params.labelIds.every((l) => m.labelIds.includes(l)),
    );
    const start = params.pageToken ? Number(params.pageToken) : 0;
    const end = start + params.maxResults;
    return {
      messages: matching.slice(start, end),
      nextPageToken: end < matching.length ? String(end) : undefined,
    };
  }

  async modifyLabels(id: string, change: { addLabelIds: string[]; removeLabelIds: string[] }) {
    this.calls.push(`modifyLabels:${id}:+${change.addLabelIds.join(",")}:-${change.removeLabelIds.join(",")}`);
    if (this.failIds.has(id)) throw new Error(`Gmail error for ${id}`);
    const msg = this.messages.find((m) => m.id === id);
    if (!msg) throw new Error("Not found");
    msg.labelIds = [
      ...msg.labelIds.filter((l) => !change.removeLabelIds.includes(l)),
      ...change.addLabelIds.filter((l) => !msg.labelIds.includes(l)),
    ];
  }

  async getLabels() {
    this.calls.push("getLabels");
    return { ...this.labels };
  }
}

export class FakeOutlookClient implements OutlookClient {
  messages: OutlookMessage[];
  calls: string[] = [];
  failIds = new Set<string>();

  constructor(messages: OutlookMessage[]) {
    this.messages = messages;
  }

  async getMessages(params: { folderId: "inbox" | "archive"; skip: number; top: number }) {
    this.calls.push(`getMessages:${params.skip}`);
    const matching = this.messages.filter((m) => m.parentFolderId === params.folderId);
    const end = params.skip + params.top;
    return {
      value: matching.slice(params.skip, end),
      ...(end < matching.length
        ? { "@odata.nextLink": `https://graph.example.com/me/mailFolders/${params.folderId}/messages?$skip=${end}&$top=${params.top}` }
        : {}),
    };
  }

  async patchMessage(id: string, patch: { isRead: boolean }) {
    this.calls.push(`patchMessage:${id}:${patch.isRead}`);
    if (this.failIds.has(id)) throw new Error(`Outlook error for ${id}`);
    const msg = this.messages.find((m) => m.id === id);
    if (!msg) throw new Error("Not found");
    msg.isRead = patch.isRead;
  }

  async moveMessage(id: string, destinationFolderId: "inbox" | "archive") {
    this.calls.push(`moveMessage:${id}:${destinationFolderId}`);
    if (this.failIds.has(id)) throw new Error(`Outlook error for ${id}`);
    const msg = this.messages.find((m) => m.id === id);
    if (!msg) throw new Error("Not found");
    msg.parentFolderId = destinationFolderId;
  }
}
