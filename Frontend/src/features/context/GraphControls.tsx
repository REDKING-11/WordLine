import type { GraphOptions } from "../../hooks/useGraphOptions";

export function GraphControls({
  options,
  nodeCount,
  edgeCount,
  onChange,
}: {
  options: GraphOptions;
  nodeCount: number;
  edgeCount: number;
  onChange: (options: GraphOptions) => void;
}) {
  function update<K extends keyof GraphOptions>(key: K, value: GraphOptions[K]) {
    onChange({ ...options, [key]: value });
  }

  return (
    <div className="graph-controls-panel">
      <div className="graph-stat-row">
        <span>{nodeCount} nodes</span>
        <span>{edgeCount} links</span>
      </div>

      <ToggleControl
        checked={options.showWikiLinks}
        label="Wiki links"
        onChange={(checked) => update("showWikiLinks", checked)}
      />
      <ToggleControl
        checked={options.showRelationships}
        label="Relationships"
        onChange={(checked) => update("showRelationships", checked)}
      />
      <ToggleControl
        checked={options.showUnresolved}
        label="Uncreated notes"
        onChange={(checked) => update("showUnresolved", checked)}
      />
      <ToggleControl
        checked={options.showOrphans}
        label="Orphans"
        onChange={(checked) => update("showOrphans", checked)}
      />
      <ToggleControl
        checked={options.showArrows}
        label="Direction arrows"
        onChange={(checked) => update("showArrows", checked)}
      />
      <ToggleControl
        checked={options.focusNeighbors}
        label="Focus neighbors"
        onChange={(checked) => update("focusNeighbors", checked)}
      />

      <SliderControl
        label="Center force"
        max={1}
        min={0}
        step={0.01}
        value={options.centerStrength}
        onChange={(value) => update("centerStrength", value)}
      />
      <SliderControl
        label="Repel force"
        max={20}
        min={0}
        step={0.1}
        value={options.repelStrength}
        onChange={(value) => update("repelStrength", value)}
      />
      <SliderControl
        label="Link force"
        max={1}
        min={0}
        step={0.01}
        value={options.linkStrength}
        onChange={(value) => update("linkStrength", value)}
      />
      <SliderControl
        label="Link distance"
        max={500}
        min={30}
        step={1}
        value={options.linkDistance}
        onChange={(value) => update("linkDistance", value)}
      />
      <SliderControl
        label="Node size"
        max={2}
        min={0.6}
        step={0.05}
        value={options.nodeSize}
        onChange={(value) => update("nodeSize", value)}
      />
      <SliderControl
        label="Line thickness"
        max={3}
        min={0.4}
        step={0.05}
        value={options.lineThickness}
        onChange={(value) => update("lineThickness", value)}
      />

      <div className="legend">
        <span>
          <i className="legend-line wiki" /> Wiki link
        </span>
        <span>
          <i className="legend-line relationship" /> Relationship
        </span>
      </div>
    </div>
  );
}

function ToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-control">
      <span>{label}</span>
      <input
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
        type="checkbox"
      />
    </label>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-control">
      <span>
        {label}
        <strong>{formatControlValue(value)}</strong>
      </span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

function formatControlValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
