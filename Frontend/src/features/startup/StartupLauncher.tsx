import { useState } from "react";
import "./startup.css";

export function StartupLauncher({
  onCreateProject,
  onOpenProject,
  onOpenTutorial,
}: {
  onCreateProject: () => void;
  onOpenProject: () => void;
  onOpenTutorial: () => void;
}) {
  const [notice, setNotice] = useState("Local-first desktop project actions are staged for Tauri.");

  function handleFutureAction(action: () => void, message: string) {
    action();
    setNotice(message);
  }

  return (
    <main className="startup-shell">
      <section className="startup-card" aria-label="WordLine startup">
        <div className="startup-logo" aria-hidden="true">
          <span />
        </div>
        <h1>WordLine</h1>
        <p className="version-label">Prototype 0.1</p>

        <button className="primary-start" onClick={onOpenTutorial} type="button">
          Open Welcome World
        </button>

        <div className="startup-options">
          <div className="startup-option">
            <div>
              <h2>Create new project</h2>
              <p>Start a local story/world folder with notes, sidecars, assets, and a clean graph.</p>
            </div>
            <button
              onClick={() =>
                handleFutureAction(
                  onCreateProject,
                  "Create project will become a real folder picker in the desktop build.",
                )
              }
              type="button"
            >
              Create
            </button>
          </div>

          <div className="startup-option">
            <div>
              <h2>Open folder as project</h2>
              <p>Choose an existing folder that contains Markdown notes or a portable project.</p>
            </div>
            <button
              onClick={() =>
                handleFutureAction(
                  onOpenProject,
                  "Open folder needs desktop filesystem access; the Vite prototype uses demo data.",
                )
              }
              type="button"
            >
              Open
            </button>
          </div>

          <div className="startup-option">
            <div>
              <h2>Open tutorial project</h2>
              <p>Explore a neutral sample world with notes, relationships, backlinks, and a graph.</p>
            </div>
            <button onClick={onOpenTutorial} type="button">
              Launch
            </button>
          </div>
        </div>

        <div className="startup-footer">
          <span>?</span>
          <select aria-label="Language" defaultValue="en">
            <option value="en">English</option>
            <option value="fi">Suomi</option>
          </select>
        </div>

        <p className="startup-notice">{notice}</p>
      </section>
    </main>
  );
}
