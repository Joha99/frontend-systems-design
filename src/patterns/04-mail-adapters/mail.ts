/**
 * Pattern 04: Adapter + Dependency Inversion: One Inbox, Two Providers
 *
 * Patterns: Adapter (make each vendor SDK fit OUR interface), Factory
 * (createProvider picks the adapter), Facade (InboxService is the one simple
 * entry point the UI uses). SOLID: Dependency Inversion (InboxService depends
 * on the MailProvider interface, never on a vendor SDK), Liskov (both
 * adapters must behave identically from the outside), Open/Closed (adding
 * Yahoo = one new adapter + one line in the factory).
 *
 * Where this shows up: Superhuman supports Gmail AND Outlook. Any app that
 * normalizes third-party APIs at the boundary so the rest of the code trusts
 * one model.
 *
 * Run the grader:  node --test 'src/patterns/04-mail-adapters/*.test.ts'
 * Read first: providerClients.ts (the vendor shapes + fakes).
 *
 * ── Part 1 (25 min): GmailAdapter ──────────────────────────────────────────
 * Implement MailProvider over a GmailClient.
 * 1. listInbox(cursor?) → listMessages({ labelIds: ["INBOX"], pageToken:
 *    cursor, maxResults: PAGE_SIZE }). Map each to a Message:
 *    - from: parse the "From" header. '"Ann Lee" <ann@x.com>' → { name:
 *      "Ann Lee", email: "ann@x.com" }; 'Ann Lee <ann@x.com>' → same;
 *      'bob@y.com' → { name: "bob@y.com", email: "bob@y.com" }. Header names
 *      are case-insensitive ("from" counts).
 *    - subject: the "Subject" header, or "(no subject)" if missing/empty.
 *    - receivedAt: new Date(Number(internalDate)).
 *    - unread: labelIds includes "UNREAD".
 *    - labels: USER labels only (ids starting with "Label_"), mapped to their
 *      display names via getLabels(). Unknown label ids are dropped.
 *      getLabels() must be called AT MOST ONCE per adapter (cache it), even
 *      when two listInbox calls run at the same time.
 *    - nextCursor: nextPageToken, or null.
 * 2. archive(id) → modifyLabels(id, { addLabelIds: [], removeLabelIds: ["INBOX"] })
 * 3. markRead(id, read) → remove "UNREAD" (read=true) / add "UNREAD" (read=false)
 *
 * ── Part 2 (15 min): OutlookAdapter ────────────────────────────────────────
 * 4. listInbox(cursor?) → getMessages({ folderId: "inbox", skip, top:
 *    PAGE_SIZE }) where skip = Number(cursor ?? 0). nextCursor: when
 *    "@odata.nextLink" exists, the value of its $skip query param as a
 *    string; else null. (Cursors are opaque to callers: each adapter decides
 *    what's inside.)
 *    - from: from.emailAddress (name falls back to the address if empty);
 *      a null `from` → { name: "(unknown)", email: "" }.
 *    - subject: "(no subject)" if null/empty. labels: categories.
 *    - unread: !isRead. threadId: conversationId. snippet: bodyPreview.
 * 5. archive → moveMessage(id, "archive"). markRead → patchMessage(id, { isRead }).
 *
 * ── Part 3 (15 min): factory + service ─────────────────────────────────────
 * 6. createProvider(account) returns the right adapter for account.kind.
 * 7. InboxService(provider):
 *    - load({ maxPages = 5 }) follows cursors until there are no more pages
 *      or maxPages pages were fetched. Stores the messages (deduped by id),
 *      sorted newest first, exposed via the `messages` getter.
 *    - archive(id): calls the provider, THEN removes it from `messages`.
 *      If the provider throws, `messages` is unchanged and the error propagates.
 *    - markAllRead(): marks every unread message read, in PARALLEL. Updates
 *      `messages` for the ones that succeeded and resolves to
 *      { failed: string[] } (ids that failed). Never rejects.
 *
 * Talk about: why normalize at the boundary; what would leak if the UI
 * used GmailMessage directly; how you'd test InboxService without any
 * network (inject a fake provider: that's DIP paying off).
 */

import type { GmailClient, OutlookClient } from "./providerClients.ts";

export const PAGE_SIZE = 25;

export interface Message {
  id: string;
  threadId: string;
  from: { name: string; email: string };
  subject: string;
  snippet: string;
  receivedAt: Date;
  unread: boolean;
  labels: string[];
}

export interface MailProvider {
  listInbox(cursor?: string): Promise<{ messages: Message[]; nextCursor: string | null }>;
  archive(id: string): Promise<void>;
  markRead(id: string, read: boolean): Promise<void>;
}

export class GmailAdapter implements MailProvider {
  constructor(client: GmailClient) {
    throw new Error("not implemented");
  }

  listInbox(cursor?: string): Promise<{ messages: Message[]; nextCursor: string | null }> {
    throw new Error("not implemented");
  }

  archive(id: string): Promise<void> {
    throw new Error("not implemented");
  }

  markRead(id: string, read: boolean): Promise<void> {
    throw new Error("not implemented");
  }
}

export class OutlookAdapter implements MailProvider {
  constructor(client: OutlookClient) {
    throw new Error("not implemented");
  }

  listInbox(cursor?: string): Promise<{ messages: Message[]; nextCursor: string | null }> {
    throw new Error("not implemented");
  }

  archive(id: string): Promise<void> {
    throw new Error("not implemented");
  }

  markRead(id: string, read: boolean): Promise<void> {
    throw new Error("not implemented");
  }
}

export type Account =
  | { kind: "gmail"; client: GmailClient }
  | { kind: "outlook"; client: OutlookClient };

export function createProvider(account: Account): MailProvider {
  throw new Error("not implemented");
}

export class InboxService {
  constructor(provider: MailProvider) {
    throw new Error("not implemented");
  }

  get messages(): Message[] {
    throw new Error("not implemented");
  }

  load(options: { maxPages?: number } = {}): Promise<void> {
    throw new Error("not implemented");
  }

  archive(id: string): Promise<void> {
    throw new Error("not implemented");
  }

  markAllRead(): Promise<{ failed: string[] }> {
    throw new Error("not implemented");
  }
}
