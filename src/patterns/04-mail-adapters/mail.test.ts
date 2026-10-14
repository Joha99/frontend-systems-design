/// <reference types="node" />
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  createProvider,
  GmailAdapter,
  InboxService,
  OutlookAdapter,
  PAGE_SIZE,
  type MailProvider,
  type Message,
} from "./mail.ts";
import {
  FakeGmailClient,
  FakeOutlookClient,
  type GmailMessage,
  type OutlookMessage,
} from "./providerClients.ts";

const gmailMsg = (id: string, overrides: Partial<GmailMessage> = {}, headers: Record<string, string> = {}): GmailMessage => ({
  id,
  threadId: `t-${id}`,
  labelIds: ["INBOX"],
  snippet: `snippet ${id}`,
  internalDate: "1700000000000",
  payload: {
    headers: Object.entries({ From: '"Ann Lee" <ann@x.com>', Subject: `Subject ${id}`, ...headers }).map(
      ([name, value]) => ({ name, value }),
    ),
  },
  ...overrides,
});

const outlookMsg = (id: string, overrides: Partial<OutlookMessage> = {}): OutlookMessage => ({
  id,
  conversationId: `c-${id}`,
  subject: `Subject ${id}`,
  bodyPreview: `preview ${id}`,
  receivedDateTime: "2026-10-14T12:00:00.000Z",
  isRead: true,
  from: { emailAddress: { name: "Bo Kim", address: "bo@y.com" } },
  parentFolderId: "inbox",
  categories: [],
  ...overrides,
});

describe("Part 1: GmailAdapter", () => {
  test("maps a Gmail message to our Message", async () => {
    const client = new FakeGmailClient(
      [gmailMsg("m1", { labelIds: ["INBOX", "UNREAD", "IMPORTANT", "Label_1", "Label_404"] })],
      { Label_1: "Receipts" },
    );
    const { messages, nextCursor } = await new GmailAdapter(client).listInbox();
    assert.deepEqual(messages, [
      {
        id: "m1",
        threadId: "t-m1",
        from: { name: "Ann Lee", email: "ann@x.com" },
        subject: "Subject m1",
        snippet: "snippet m1",
        receivedAt: new Date(1700000000000),
        unread: true,
        labels: ["Receipts"],
      } satisfies Message,
    ]);
    assert.equal(nextCursor, null);
  });

  test("parses From headers in their different shapes, case-insensitively", async () => {
    const client = new FakeGmailClient([
      gmailMsg("a", {}, { From: "Ann Lee <ann@x.com>" }),
      { ...gmailMsg("b"), payload: { headers: [{ name: "from", value: "bob@y.com" }] } },
    ]);
    const { messages } = await new GmailAdapter(client).listInbox();
    assert.deepEqual(messages[0].from, { name: "Ann Lee", email: "ann@x.com" });
    assert.deepEqual(messages[1].from, { name: "bob@y.com", email: "bob@y.com" });
    assert.equal(messages[1].subject, "(no subject)");
  });

  test("only lists the inbox, pages with the cursor", async () => {
    const all = Array.from({ length: PAGE_SIZE + 3 }, (_, i) => gmailMsg(`m${i}`));
    all.push(gmailMsg("archived", { labelIds: [] }));
    const adapter = new GmailAdapter(new FakeGmailClient(all));
    const page1 = await adapter.listInbox();
    assert.equal(page1.messages.length, PAGE_SIZE);
    assert.equal(typeof page1.nextCursor, "string");
    const page2 = await adapter.listInbox(page1.nextCursor!);
    assert.deepEqual(page2.messages.map((m) => m.id), [`m${PAGE_SIZE}`, `m${PAGE_SIZE + 1}`, `m${PAGE_SIZE + 2}`]);
    assert.equal(page2.nextCursor, null);
  });

  test("getLabels is fetched once, even with concurrent calls", async () => {
    const client = new FakeGmailClient([gmailMsg("m1")], {});
    const adapter = new GmailAdapter(client);
    await Promise.all([adapter.listInbox(), adapter.listInbox()]);
    await adapter.listInbox();
    assert.equal(client.calls.filter((c) => c === "getLabels").length, 1);
  });

  test("archive and markRead map to label changes", async () => {
    const client = new FakeGmailClient([gmailMsg("m1", { labelIds: ["INBOX", "UNREAD"] })]);
    const adapter = new GmailAdapter(client);
    await adapter.markRead("m1", true);
    assert.deepEqual(client.messages[0].labelIds, ["INBOX"]);
    await adapter.markRead("m1", false);
    assert.deepEqual(client.messages[0].labelIds, ["INBOX", "UNREAD"]);
    await adapter.archive("m1");
    assert.deepEqual(client.messages[0].labelIds, ["UNREAD"]);
  });
});

describe("Part 2: OutlookAdapter", () => {
  test("maps an Outlook message to our Message", async () => {
    const client = new FakeOutlookClient([outlookMsg("o1", { isRead: false, categories: ["Travel"] })]);
    const { messages, nextCursor } = await new OutlookAdapter(client).listInbox();
    assert.deepEqual(messages, [
      {
        id: "o1",
        threadId: "c-o1",
        from: { name: "Bo Kim", email: "bo@y.com" },
        subject: "Subject o1",
        snippet: "preview o1",
        receivedAt: new Date("2026-10-14T12:00:00.000Z"),
        unread: true,
        labels: ["Travel"],
      } satisfies Message,
    ]);
    assert.equal(nextCursor, null);
  });

  test("handles missing sender name, null sender and null subject", async () => {
    const client = new FakeOutlookClient([
      outlookMsg("a", { from: { emailAddress: { name: "", address: "x@z.com" } }, subject: "" }),
      outlookMsg("b", { from: null, subject: null }),
    ]);
    const { messages } = await new OutlookAdapter(client).listInbox();
    assert.deepEqual(messages[0].from, { name: "x@z.com", email: "x@z.com" });
    assert.equal(messages[0].subject, "(no subject)");
    assert.deepEqual(messages[1].from, { name: "(unknown)", email: "" });
    assert.equal(messages[1].subject, "(no subject)");
  });

  test("turns @odata.nextLink into an opaque cursor", async () => {
    const all = Array.from({ length: PAGE_SIZE + 2 }, (_, i) => outlookMsg(`o${i}`));
    all.push(outlookMsg("archived", { parentFolderId: "archive" }));
    const client = new FakeOutlookClient(all);
    const adapter = new OutlookAdapter(client);
    const page1 = await adapter.listInbox();
    assert.equal(page1.messages.length, PAGE_SIZE);
    assert.equal(page1.nextCursor, String(PAGE_SIZE));
    const page2 = await adapter.listInbox(page1.nextCursor!);
    assert.deepEqual(page2.messages.map((m) => m.id), [`o${PAGE_SIZE}`, `o${PAGE_SIZE + 1}`]);
    assert.equal(page2.nextCursor, null);
  });

  test("archive moves to the archive folder; markRead patches isRead", async () => {
    const client = new FakeOutlookClient([outlookMsg("o1", { isRead: false })]);
    const adapter = new OutlookAdapter(client);
    await adapter.markRead("o1", true);
    assert.equal(client.messages[0].isRead, true);
    await adapter.archive("o1");
    assert.equal(client.messages[0].parentFolderId, "archive");
  });
});

describe("Part 3: factory + InboxService", () => {
  test("createProvider picks the adapter", () => {
    assert.ok(createProvider({ kind: "gmail", client: new FakeGmailClient([]) }) instanceof GmailAdapter);
    assert.ok(createProvider({ kind: "outlook", client: new FakeOutlookClient([]) }) instanceof OutlookAdapter);
  });

  test("the service works the same over either provider (Liskov)", async () => {
    const gmail = createProvider({
      kind: "gmail",
      client: new FakeGmailClient([
        gmailMsg("old", { internalDate: "1000" }),
        gmailMsg("new", { internalDate: "3000" }),
      ]),
    });
    const outlook = createProvider({
      kind: "outlook",
      client: new FakeOutlookClient([
        outlookMsg("old", { receivedDateTime: new Date(1000).toISOString() }),
        outlookMsg("new", { receivedDateTime: new Date(3000).toISOString() }),
      ]),
    });
    for (const provider of [gmail, outlook]) {
      const service = new InboxService(provider);
      await service.load();
      assert.deepEqual(service.messages.map((m) => m.id), ["new", "old"]);
    }
  });

  // A hand-rolled fake provider: no vendor SDK at all. This is what DIP buys.
  const fakeProvider = (pages: Message[][]): MailProvider & { calls: string[]; failIds: Set<string> } => {
    const calls: string[] = [];
    const failIds = new Set<string>();
    return {
      calls,
      failIds,
      async listInbox(cursor) {
        const i = Number(cursor ?? 0);
        calls.push(`list:${i}`);
        return { messages: pages[i], nextCursor: i + 1 < pages.length ? String(i + 1) : null };
      },
      async archive(id) {
        calls.push(`archive:${id}`);
        if (failIds.has(id)) throw new Error("nope");
      },
      async markRead(id) {
        calls.push(`markRead:${id}`);
        await new Promise((r) => setTimeout(r, 30));
        if (failIds.has(id)) throw new Error("nope");
      },
    };
  };
  const msg = (id: string, t: number, unread = false): Message => ({
    id,
    threadId: id,
    from: { name: "A", email: "a@a.com" },
    subject: id,
    snippet: "",
    receivedAt: new Date(t),
    unread,
    labels: [],
  });

  test("load follows cursors up to maxPages and dedupes", async () => {
    const provider = fakeProvider([[msg("a", 1), msg("b", 2)], [msg("b", 2), msg("c", 3)], [msg("d", 4)]]);
    const service = new InboxService(provider);
    await service.load({ maxPages: 2 });
    assert.deepEqual(provider.calls, ["list:0", "list:1"]);
    assert.deepEqual(service.messages.map((m) => m.id), ["c", "b", "a"]);
  });

  test("archive removes the message only after the provider succeeds", async () => {
    const provider = fakeProvider([[msg("a", 1), msg("b", 2)]]);
    const service = new InboxService(provider);
    await service.load();
    provider.failIds.add("a");
    await assert.rejects(service.archive("a"));
    assert.deepEqual(service.messages.map((m) => m.id), ["b", "a"]);
    await service.archive("b");
    assert.deepEqual(service.messages.map((m) => m.id), ["a"]);
  });

  test("markAllRead runs in parallel and reports failures without rejecting", async () => {
    const provider = fakeProvider([[msg("a", 1, true), msg("b", 2, true), msg("c", 3, false), msg("d", 4, true)]]);
    const service = new InboxService(provider);
    await service.load();
    provider.failIds.add("b");
    const started = Date.now();
    const result = await service.markAllRead();
    const elapsed = Date.now() - started;
    assert.deepEqual(result.failed, ["b"]);
    assert.ok(elapsed < 70, `expected parallel calls (~30ms; sequential would be ~90ms), took ${elapsed}ms`);
    assert.equal(provider.calls.filter((c) => c === "markRead:c").length, 0, "c was already read");
    const unread = Object.fromEntries(service.messages.map((m) => [m.id, m.unread]));
    assert.deepEqual(unread, { a: false, b: true, c: false, d: false });
  });
});
