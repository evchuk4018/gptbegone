import { beforeEach, describe, expect, it } from "vitest";
import { createChat, deleteChat, getChat, listChats } from "../src/storage/chatStore.js";
import { resetForTests } from "../src/db.js";

describe("chatStore", () => {
  beforeEach(() => {
    resetForTests();
  });

  it("creates, lists, loads, and deletes chats", () => {
    const created = createChat({
      title: "Test Chat",
      provider: "ollama",
      model: "llama3.1:8b",
      mode: { thinking: true, flash: false }
    });
    expect(created.title).toBe("Test Chat");

    const listed = listChats();
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(created.id);

    const loaded = getChat(created.id);
    expect(loaded?.id).toBe(created.id);
    expect(loaded?.messages).toHaveLength(0);

    const removed = deleteChat(created.id);
    expect(removed).toBe(true);
    expect(getChat(created.id)).toBeNull();
  });
});
