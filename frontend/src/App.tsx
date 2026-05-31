import { useEffect } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { SettingsModal } from "./components/SettingsModal";
import { useChatState } from "./state/useChatState";
import type { ProviderName } from "./types";

const APP_BASE_PATH = "/ai";

function ChatRoute() {
  const state = useChatState();
  const navigate = useNavigate();
  const params = useParams<{ chatId?: string }>();
  const toChatPath = (chatId: string) => `${APP_BASE_PATH}/chat/${chatId}`;

  useEffect(() => {
    if (params.chatId) {
      void state.selectChat(params.chatId);
    }
    // Intentional: path change should trigger select.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.chatId]);

  const onToggleThinking = () => state.setMode({ ...state.mode, thinking: !state.mode.thinking });
  const onToggleFlash = () => state.setMode({ ...state.mode, flash: !state.mode.flash });

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Claude</div>
        <button
          className="new-chat-btn"
          type="button"
          onClick={async () => {
            const created = await state.createNewChat();
            if (created) {
              navigate(toChatPath(created.id));
            }
          }}
        >
          + New chat
        </button>

        <div className="sidebar-section-title">Recents</div>
        <div className="chat-list">
          {state.chats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              className={`chat-item ${state.activeChat?.id === chat.id ? "active" : ""}`}
              onClick={() => {
                void state.selectChat(chat.id);
                navigate(toChatPath(chat.id));
              }}
            >
              <span>{chat.title}</span>
              <span
                className="delete-chat"
                onClick={(event) => {
                  event.stopPropagation();
                  void state.removeChat(chat.id);
                }}
              >
                ✕
              </span>
            </button>
          ))}
          {state.chats.length === 0 ? <div className="empty-list">No chats yet.</div> : null}
        </div>

        <div className="sidebar-footer">
          <button className="profile-btn" type="button" onClick={() => state.setSettingsOpen(true)}>
            <span className="avatar">JS</span>
            <span className="profile-meta">
              <strong>john skibidi</strong>
              <small>Local profile</small>
            </span>
          </button>
        </div>
      </aside>

      <main className="main-pane">
        <div className="status-pill">Free plan · Upgrade</div>
        <section className="center-panel">
          <h1>Good evening, john skibidi</h1>
          {state.loading ? <div className="empty-state">Loading chats and models...</div> : null}

          <div className="composer">
            <textarea
              placeholder="Type your message"
              value={state.prompt}
              onChange={(event) => state.setPrompt(event.target.value)}
              rows={4}
            />

            <div className="composer-controls">
              <div className="mode-row">
                <button className={`chip ${state.mode.thinking ? "on" : ""}`} onClick={onToggleThinking} type="button">
                  Thinking
                </button>
                <button className={`chip ${state.mode.flash ? "on flash" : ""}`} onClick={onToggleFlash} type="button">
                  Flash
                </button>
              </div>
              <div className="mode-row">
                <select value={state.provider} onChange={(event) => state.setProvider(event.target.value as ProviderName)}>
                  <option value="ollama">Ollama</option>
                  <option value="llama-cpp">llama.cpp</option>
                </select>
                <select value={state.model} onChange={(event) => state.setModel(event.target.value)}>
                  {state.availableModels.length > 0 ? (
                    state.availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))
                  ) : (
                    <option value={state.model}>{state.model}</option>
                  )}
                </select>
                {!state.streaming ? (
                  <button className="send-btn" type="button" onClick={() => void state.sendPrompt()}>
                    Send
                  </button>
                ) : (
                  <button className="send-btn stop" type="button" onClick={() => void state.stopStream()}>
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>

          {state.error ? <div className="error-banner">{state.error}</div> : null}

          <div className="messages">
            {state.activeChat?.messages.map((msg) => (
              <article key={msg.id} className={`message ${msg.role}`}>
                <div className="message-role">{msg.role}</div>
                <p>{msg.content}</p>
              </article>
            ))}
            {!state.activeChat ? <div className="empty-state">Create a new chat to begin.</div> : null}
          </div>
        </section>
      </main>

      <SettingsModal
        open={state.settingsOpen}
        settings={state.settings}
        installedModels={state.installedModels}
        downloadForm={state.downloadForm}
        onClose={() => state.setSettingsOpen(false)}
        onSaveSettings={state.saveSettings}
        onDownloadFormChange={state.setDownloadForm}
        onDownload={state.triggerDownload}
      />
    </div>
  );
}

function RootRoute() {
  return (
    <main className="root-route">
      <h1>Basic page</h1>
      <p>
        Please go to the app at <Link to={APP_BASE_PATH}>{APP_BASE_PATH}</Link>.
      </p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path={APP_BASE_PATH} element={<ChatRoute />} />
      <Route path={`${APP_BASE_PATH}/chat/:chatId`} element={<ChatRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
