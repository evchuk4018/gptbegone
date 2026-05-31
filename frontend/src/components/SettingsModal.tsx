import type { ChangeEvent } from "react";
import type { InstalledModel, ProviderName, Settings } from "../types";

type DownloadForm = {
  provider: ProviderName;
  model: string;
  hfRepo: string;
  fileName: string;
};

type Props = {
  open: boolean;
  settings: Settings | null;
  installedModels: InstalledModel[];
  downloadForm: DownloadForm;
  onClose: () => void;
  onSaveSettings: (input: Partial<Settings>) => Promise<void>;
  onDownloadFormChange: (next: DownloadForm) => void;
  onDownload: () => Promise<void>;
};

export function SettingsModal(props: Props) {
  if (!props.open) {
    return null;
  }

  const onProviderChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    await props.onSaveSettings({ defaultProvider: event.target.value as ProviderName });
  };

  const updateField = (key: keyof Settings) => async (event: ChangeEvent<HTMLInputElement>) => {
    await props.onSaveSettings({ [key]: event.target.value });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button onClick={props.onClose} className="ghost-btn" type="button">
            Close
          </button>
        </div>

        <div className="settings-section">
          <label>Default provider</label>
          <select value={props.settings?.defaultProvider ?? "ollama"} onChange={onProviderChange}>
            <option value="ollama">Ollama</option>
            <option value="llama-cpp">llama.cpp</option>
          </select>
        </div>

        <div className="settings-section">
          <label>Ollama base URL</label>
          <input
            value={props.settings?.ollamaBaseUrl ?? ""}
            onChange={updateField("ollamaBaseUrl")}
            placeholder="http://127.0.0.1:11434"
          />
        </div>

        <div className="settings-section">
          <label>llama.cpp base URL</label>
          <input
            value={props.settings?.llamaCppBaseUrl ?? ""}
            onChange={updateField("llamaCppBaseUrl")}
            placeholder="http://127.0.0.1:8080"
          />
        </div>

        <div className="settings-section">
          <label>llama.cpp models directory</label>
          <input
            value={props.settings?.llamaModelsDir ?? ""}
            onChange={updateField("llamaModelsDir")}
            placeholder="C:\\models\\llama-cpp"
          />
        </div>

        <div className="settings-section">
          <h3>Download model</h3>
          <select
            value={props.downloadForm.provider}
            onChange={(event) => props.onDownloadFormChange({ ...props.downloadForm, provider: event.target.value as ProviderName })}
          >
            <option value="ollama">Ollama</option>
            <option value="llama-cpp">llama.cpp</option>
          </select>

          {props.downloadForm.provider === "ollama" ? (
            <input
              value={props.downloadForm.model}
              placeholder="e.g. llama3.1:8b"
              onChange={(event) => props.onDownloadFormChange({ ...props.downloadForm, model: event.target.value })}
            />
          ) : (
            <>
              <input
                value={props.downloadForm.hfRepo}
                placeholder="Hugging Face repo (owner/model)"
                onChange={(event) => props.onDownloadFormChange({ ...props.downloadForm, hfRepo: event.target.value })}
              />
              <input
                value={props.downloadForm.fileName}
                placeholder="GGUF file name"
                onChange={(event) => props.onDownloadFormChange({ ...props.downloadForm, fileName: event.target.value })}
              />
            </>
          )}
          <button className="solid-btn" type="button" onClick={() => void props.onDownload()}>
            Download
          </button>
        </div>

        <div className="settings-section">
          <h3>Installed models</h3>
          <ul className="model-list">
            {props.installedModels.map((model) => (
              <li key={`${model.provider}:${model.id}`}>
                <span>{model.name}</span>
                <small>{model.provider}</small>
              </li>
            ))}
            {props.installedModels.length === 0 ? <li>No models detected yet.</li> : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
