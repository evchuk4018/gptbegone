import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { normalizeMode } from "../lib/mode";
import type { ChatDetail, ChatMode, ChatSummary, InstalledModel, ProviderName, Settings } from "../types";

type DownloadForm = {
  provider: ProviderName;
  model: string;
  hfRepo: string;
  fileName: string;
};

const initialMode: ChatMode = { thinking: true, flash: false };

export function useChatState() {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<ChatMode>(initialMode);
  const [provider, setProvider] = useState<ProviderName>("ollama");
  const [model, setModel] = useState("llama3.1:8b");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadForm, setDownloadForm] = useState<DownloadForm>({
    provider: "ollama",
    model: "",
    hfRepo: "",
    fileName: ""
  });
  const streamAbortRef = useRef<AbortController | null>(null);

  const refreshInstalled = useCallback(async () => {
    const models = await api.listInstalledModels();
    setInstalledModels(models);
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chatList, appSettings, installed] = await Promise.all([
        api.listChats(),
        api.getSettings(),
        api.listInstalledModels()
      ]);
      setChats(chatList);
      setSettings(appSettings);
      setProvider(appSettings.defaultProvider);
      setInstalledModels(installed);
      if (chatList.length > 0) {
        const detail = await api.getChat(chatList[0].id);
        setActiveChat(detail);
        setProvider(detail.provider);
        setModel(detail.model);
        setMode(detail.mode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load app");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const selectChat = useCallback(async (chatId: string) => {
    try {
      setError(null);
      const detail = await api.getChat(chatId);
      setActiveChat(detail);
      setProvider(detail.provider);
      setModel(detail.model);
      setMode(detail.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open chat");
    }
  }, []);

  const createNewChat = useCallback(async () => {
    try {
      const nextMode = normalizeMode(mode);
      const created = await api.createChat({ provider, model, mode: nextMode });
      setChats((prev) => [created, ...prev]);
      await selectChat(created.id);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chat");
      return null;
    }
  }, [mode, model, provider, selectChat]);

  const removeChat = useCallback(
    async (chatId: string) => {
      try {
        await api.deleteChat(chatId);
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (activeChat?.id === chatId) {
          const remaining = chats.filter((c) => c.id !== chatId);
          if (remaining.length) {
            await selectChat(remaining[0].id);
          } else {
            setActiveChat(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete chat");
      }
    },
    [activeChat?.id, chats, selectChat]
  );

  const stopStream = useCallback(async () => {
    if (!activeChat) {
      return;
    }
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
    setStreaming(false);
    await api.stop(activeChat.id).catch(() => undefined);
  }, [activeChat]);

  const sendPrompt = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }
    setError(null);
    let chat = activeChat;
    if (!chat) {
      const created = await api.createChat({ provider, model, mode: normalizeMode(mode) });
      setChats((prev) => [created, ...prev]);
      chat = await api.getChat(created.id);
      setActiveChat(chat);
    }

    const messageText = prompt;
    setPrompt("");
    const ctrl = new AbortController();
    streamAbortRef.current = ctrl;
    setStreaming(true);

    setActiveChat((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        model,
        provider,
        mode: normalizeMode(mode),
        messages: [
          ...prev.messages,
          {
            id: `local-user-${Date.now()}`,
            chatId: prev.id,
            role: "user",
            content: messageText,
            createdAt: new Date().toISOString()
          },
          {
            id: `local-assistant-${Date.now()}`,
            chatId: prev.id,
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString()
          }
        ]
      };
    });

    try {
      await api.streamMessage(
        chat.id,
        { prompt: messageText, provider, model, mode: normalizeMode(mode) },
        (chunk) => {
          setActiveChat((prev) => {
            if (!prev) {
              return prev;
            }
            const messages = [...prev.messages];
            const assistantIndex = [...messages]
              .map((m, i) => ({ message: m, index: i }))
              .reverse()
              .find((entry) => entry.message.role === "assistant")?.index;
            if (assistantIndex === undefined) {
              return prev;
            }
            messages[assistantIndex] = {
              ...messages[assistantIndex],
              content: messages[assistantIndex].content + chunk
            };
            return { ...prev, messages };
          });
        },
        ctrl.signal
      );

      const refreshed = await api.getChat(chat.id);
      setActiveChat(refreshed);
      setChats((prev) => [refreshed, ...prev.filter((c) => c.id !== refreshed.id)]);
      setMode(refreshed.mode);
    } catch (err) {
      if (ctrl.signal.aborted) {
        const refreshed = await api.getChat(chat.id).catch(() => null);
        if (refreshed) {
          setActiveChat(refreshed);
          setChats((prev) => [refreshed, ...prev.filter((c) => c.id !== refreshed.id)]);
        }
      } else {
        setError(err instanceof Error ? err.message : "Message failed");
      }
    } finally {
      setStreaming(false);
      streamAbortRef.current = null;
    }
  }, [activeChat, mode, model, prompt, provider]);

  const saveSettings = useCallback(
    async (next: Partial<Settings>) => {
      const updated = await api.updateSettings(next);
      setSettings(updated);
      setProvider((prev) => next.defaultProvider ?? prev);
    },
    []
  );

  const triggerDownload = useCallback(async () => {
    try {
      setError(null);
      if (downloadForm.provider === "ollama") {
        await api.downloadModel({ provider: "ollama", model: downloadForm.model });
      } else {
        await api.downloadModel({
          provider: "llama-cpp",
          hfRepo: downloadForm.hfRepo,
          fileName: downloadForm.fileName
        });
      }
      await refreshInstalled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  }, [downloadForm, refreshInstalled]);

  const availableModels = useMemo(
    () => installedModels.filter((m) => m.provider === provider).map((m) => m.name),
    [installedModels, provider]
  );

  return {
    chats,
    activeChat,
    installedModels,
    settings,
    prompt,
    mode,
    provider,
    model,
    loading,
    streaming,
    error,
    settingsOpen,
    downloadForm,
    availableModels,
    setPrompt,
    setProvider,
    setModel,
    setMode: (next: ChatMode) => setMode(normalizeMode(next)),
    setSettingsOpen,
    setDownloadForm,
    selectChat,
    createNewChat,
    removeChat,
    sendPrompt,
    stopStream,
    saveSettings,
    triggerDownload,
    refreshInstalled
  };
}
