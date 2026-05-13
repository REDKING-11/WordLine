import { useState } from "react";
import "./startup.css";

export function CreateProjectScreen({
  onBack,
  onCreateProject,
}: {
  onBack: () => void;
  onCreateProject: (projectName: string, locationLabel: string) => void;
}) {
  const [projectName, setProjectName] = useState("");
  const [locationLabel, setLocationLabel] = useState("Choose folder later");
  const [notice, setNotice] = useState("Folder browsing is staged for the desktop build.");
  const canCreate = projectName.trim().length > 0;

  return (
    <main className="startup-shell">
      <section className="startup-card create-card" aria-label="Create project">
        <div className="startup-logo small" aria-hidden="true">
          <span />
        </div>
        <h1>WordLine</h1>
        <p className="version-label">Prototype 0.1</p>

        <button className="back-button" onClick={onBack} type="button">
          {"<-"} Back
        </button>

        <div className="create-title">
          <h2>Create local project</h2>
          <p>A project will become a folder with Markdown notes and optional sidecar data.</p>
        </div>

        <div className="create-form">
          <label className="create-row">
            <span>
              <strong>Project name</strong>
              <small>Name your story, world, campaign, or research space.</small>
            </span>
            <input
              autoFocus
              onChange={(event) => setProjectName(event.currentTarget.value)}
              placeholder="Project name"
              value={projectName}
            />
          </label>

          <label className="create-row">
            <span>
              <strong>Location</strong>
              <small>Choose where the local project folder should live.</small>
            </span>
            <div className="location-control">
              <input
                onChange={(event) => setLocationLabel(event.currentTarget.value)}
                value={locationLabel}
              />
              <button
                onClick={() =>
                  setNotice("Browse will open a native folder picker once Tauri is wired.")
                }
                type="button"
              >
                Browse
              </button>
            </div>
          </label>
        </div>

        <button
          className="primary-start create-submit"
          disabled={!canCreate}
          onClick={() =>
            canCreate && onCreateProject(projectName.trim(), locationLabel.trim())
          }
          type="button"
        >
          Create
        </button>

        <p className="startup-notice">{notice}</p>
      </section>
    </main>
  );
}
