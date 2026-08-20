import React from "react";

import { buildChangePayload, useWidgetAction, useWidgetForm } from "../context";
import type { ActionConfig, WidgetIcon } from "../types";
import { safeHttpHref } from "../url";
import { Icon } from "./content";
import { Sparkline } from "./primitives";

type WorkspaceTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger" | "discovery";
type TableValue = string | number | boolean | string[] | null | undefined;
type WorkspaceColumn = {
  key: string;
  label: string;
  type?: "text" | "tags" | "status" | "link" | "number";
  align?: "start" | "center" | "end";
};

function useWorkspaceAction() {
  const dispatch = useWidgetAction();
  return React.useCallback(
    (action: ActionConfig | undefined, payload: Record<string, unknown> = {}) => {
      if (!action || !dispatch) return;
      // Second-argument form: the dispatcher merges the payload itself AND
      // exposes it to deferred $-action expressions — a local pre-merge does
      // neither for deferred actions.
      dispatch(action, payload);
    },
    [dispatch]
  );
}

function valueText(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return "—";
  return String(value);
}

const STATUS_TONES: [RegExp, WorkspaceTone][] = [
  [/^(active|done|ready|complete|completed|approved|live|passed|healthy|connected)$/i, "success"],
  [/^(blocked|failed|error|removed|rejected|critical)$/i, "danger"],
  [/^(pending|paused|waiting|review|draft|stale)$/i, "warning"],
  [/^(running|in progress|syncing|deploying)$/i, "info"]
];

function statusTone(value: string): WorkspaceTone {
  return STATUS_TONES.find(([pattern]) => pattern.test(value.trim()))?.[1] ?? "neutral";
}

function TableValueView({ value, column }: { value: TableValue; column: WorkspaceColumn }) {
  if (column.type === "tags" || Array.isArray(value)) {
    const values = Array.isArray(value) ? value : value ? [String(value)] : [];
    return <span className="wg-record-tags">{values.map((item) => <i key={item}>{item}</i>)}</span>;
  }
  if (column.type === "status") {
    const text = valueText(value);
    return <span className="wg-record-status" data-tone={statusTone(text)}>{text}</span>;
  }
  if (column.type === "link") {
    const href = safeHttpHref(value);
    return href ? <a href={href} target="_blank" rel="noreferrer">{valueText(value)}</a> : <span>{valueText(value)}</span>;
  }
  return <span>{valueText(value)}</span>;
}

function WorkspaceTable({
  columns,
  rows,
  rowTypes,
  selected,
  onRowClick
}: {
  columns: WorkspaceColumn[];
  rows: Record<string, TableValue>[];
  rowTypes?: string[];
  selected?: Set<number>;
  onRowClick?: (row: Record<string, TableValue>, index: number) => void;
}) {
  return (
    <div className="wg-workspace-table-wrap">
      <table className="wg-workspace-table">
        <thead><tr>{columns.map((column) => <th data-align={column.align} key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              data-change={rowTypes?.[index]}
              data-selected={selected?.has(index) || undefined}
              data-clickable={Boolean(onRowClick) || undefined}
              aria-selected={selected?.has(index) || undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row, index) : undefined}
              onKeyDown={onRowClick ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(row, index);
                }
              } : undefined}
              key={String(row.id ?? index)}
            >
              {columns.map((column) => (
                <td data-align={column.align} key={column.key}>
                  <TableValueView value={row[column.key]} column={column} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------
   Knowledge and tabular workspaces
   ------------------------------------------------------------------ */

type ContextSource = {
  label: string;
  type?: string;
  url?: string;
};

type ContextItem = {
  id?: string | number;
  title: string;
  excerpt: string;
  characters?: number | string;
  source?: ContextSource;
};

type ContextCardsProps = {
  title?: string;
  count?: number | string;
  items?: ContextItem[];
  onItemClickAction?: ActionConfig;
};

const ContextCards: React.FC<ContextCardsProps> = ({
  title = "All chunks",
  count,
  items = [],
  onItemClickAction
}) => {
  const invoke = useWorkspaceAction();
  return (
    <div className="wg-context-cards">
      <div className="wg-context-header"><strong>{title}</strong><span>{count ?? items.length}</span></div>
      {items.map((item, index) => {
        const sourceHref = safeHttpHref(item.source?.url);
        const sourceContent = item.source ? (
          <>
            {item.source.type ? <b>{item.source.type}</b> : null}
            <span>{item.source.label}</span>
            <Icon name={sourceHref ? "external-link" : "chevron-right"} size="xs" color="tertiary" />
          </>
        ) : null;
        return (
          <article className="wg-context-card" key={String(item.id ?? index)}>
            <button
              type="button"
              disabled={!onItemClickAction}
              onClick={() => invoke(onItemClickAction, { id: item.id ?? index, item })}
            >
              <span className="wg-context-title"><strong>{item.title}</strong>{item.characters !== undefined ? <small>{item.characters} characters</small> : null}</span>
              <p>{item.excerpt}</p>
            </button>
            {item.source ? sourceHref ? (
              <a className="wg-context-source" href={sourceHref} target="_blank" rel="noreferrer">{sourceContent}</a>
            ) : (
              <span className="wg-context-source">{sourceContent}</span>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};

type ComparisonFeature = {
  label: string;
  values: Array<boolean | string | number>;
};

type ComparisonTableProps = {
  label?: string;
  plans?: string[];
  features?: ComparisonFeature[];
  highlightPlan?: number;
};

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  label = "Feature comparison",
  plans = [],
  features = [],
  highlightPlan
}) => (
  <div className="wg-comparison-table" role="region" aria-label={label} tabIndex={0}>
    <table>
      <thead><tr><th>Feature</th>{plans.map((plan, index) => <th data-highlighted={highlightPlan === index || undefined} key={plan}>{plan}</th>)}</tr></thead>
      <tbody>
        {features.map((feature, rowIndex) => (
          <tr key={`${feature.label}-${rowIndex}`}>
            <th>{feature.label}</th>
            {plans.map((_, columnIndex) => {
              const value = feature.values[columnIndex];
              return (
                <td data-highlighted={highlightPlan === columnIndex || undefined} key={columnIndex}>
                  {typeof value === "boolean" ? (
                    <Icon name={value ? "check" : "minus"} size="sm" color={value ? "success" : "tertiary"} />
                  ) : valueText(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

type DiffTableRow = {
  id?: string | number;
  type?: "add" | "remove" | "context";
  values: Record<string, TableValue>;
  selected?: boolean;
};

type DiffTableProps = {
  title?: string;
  description?: string;
  columns?: WorkspaceColumn[];
  rows?: DiffTableRow[];
  applyLabel?: string;
  applyAction?: ActionConfig;
};

const DiffTable: React.FC<DiffTableProps> = ({
  title = "Proposed changes",
  description = "Select changed rows to include",
  columns = [],
  rows = [],
  applyLabel = "Apply changes",
  applyAction
}) => {
  const invoke = useWorkspaceAction();
  // Only explicit "add"/"remove" rows are changes; an omitted type renders as
  // a context row, so it must not be pre-selected or toggleable either.
  const isChangeRow = (row: DiffTableRow | undefined) => row?.type === "add" || row?.type === "remove";
  const [selected, setSelected] = React.useState<Set<number>>(
    () => new Set(rows.flatMap((row, index) => isChangeRow(row) && row.selected !== false ? [index] : []))
  );
  const toggle = (_row: Record<string, TableValue>, index: number) => {
    if (!isChangeRow(rows[index])) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };
  const additions = rows.filter((row, index) => row.type === "add" && selected.has(index)).length;
  const removals = rows.filter((row, index) => row.type === "remove" && selected.has(index)).length;
  return (
    <div className="wg-diff-table">
      <div className="wg-table-heading"><span><strong>{title}</strong><small>{description}</small></span></div>
      <WorkspaceTable
        columns={columns}
        rows={rows.map((row) => row.values)}
        rowTypes={rows.map((row) => row.type ?? "context")}
        selected={selected}
        onRowClick={toggle}
      />
      <div className="wg-table-footer">
        <span>{removals} removal{removals === 1 ? "" : "s"} · {additions} addition{additions === 1 ? "" : "s"}</span>
        <button type="button" disabled={!applyAction || selected.size === 0} onClick={() => invoke(applyAction, { selected: [...selected], count: selected.size })}>
          {applyLabel} <span>{selected.size}</span>
        </button>
      </div>
    </div>
  );
};

type RecordsTableProps = {
  columns?: WorkspaceColumn[];
  rows?: Record<string, TableValue>[];
  caption?: string;
  selectable?: boolean;
  defaultSortKey?: string;
  defaultSortDirection?: "asc" | "desc";
  onRowClickAction?: ActionConfig;
  onSelectionChangeAction?: ActionConfig;
};

const RecordsTable: React.FC<RecordsTableProps> = ({
  columns = [],
  rows = [],
  caption,
  selectable = false,
  defaultSortKey,
  defaultSortDirection = "asc",
  onRowClickAction,
  onSelectionChangeAction
}) => {
  const invoke = useWorkspaceAction();
  const [sortKey, setSortKey] = React.useState(defaultSortKey ?? "");
  const [direction, setDirection] = React.useState(defaultSortDirection);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const sorted = React.useMemo(() => {
    if (!sortKey) return rows.map((row, index) => ({ row, index }));
    return rows
      .map((row, index) => ({ row, index }))
      .sort((a, b) => valueText(a.row[sortKey]).localeCompare(valueText(b.row[sortKey]), undefined, { numeric: true }) * (direction === "asc" ? 1 : -1));
  }, [direction, rows, sortKey]);
  const displayColumns = selectable ? [{ key: "__selection", label: "", align: "center" as const }, ...columns] : columns;
  const displayRows = sorted.map(({ row, index }) => ({ ...row, __selection: selected.has(index) ? "✓" : "" }));
  const displaySelected = selectable
    ? new Set(sorted.flatMap(({ index }, displayIndex) => (selected.has(index) ? [displayIndex] : [])))
    : undefined;
  const toggleSelection = (displayIndex: number) => {
    const sourceIndex = sorted[displayIndex]?.index;
    if (sourceIndex === undefined) return;
    // Dispatch outside the updater: updaters must stay pure or StrictMode's
    // double invocation fires the host action twice per click.
    const next = new Set(selected);
    if (next.has(sourceIndex)) next.delete(sourceIndex); else next.add(sourceIndex);
    setSelected(next);
    invoke(onSelectionChangeAction, { selected: [...next], count: next.size });
  };
  return (
    <div className="wg-records-table">
      <div className="wg-record-sorters">
        {columns.map((column) => (
          <button
            type="button"
            data-active={sortKey === column.key || undefined}
            onClick={() => {
              if (sortKey === column.key) setDirection((value) => value === "asc" ? "desc" : "asc");
              else { setSortKey(column.key); setDirection("asc"); }
            }}
            key={column.key}
          >
            {column.label}
            {sortKey === column.key ? <Icon name={direction === "asc" ? "arrow-up" : "arrow-down"} size="xs" color="currentColor" /> : null}
          </button>
        ))}
      </div>
      <WorkspaceTable
        columns={displayColumns}
        rows={displayRows}
        selected={displaySelected}
        onRowClick={selectable || onRowClickAction ? (row, displayIndex) => {
          if (selectable) toggleSelection(displayIndex);
          const source = sorted[displayIndex];
          invoke(onRowClickAction, { row: source?.row ?? row, index: source?.index ?? displayIndex });
        } : undefined}
      />
      <div className="wg-records-footer"><span>{rows.length} record{rows.length === 1 ? "" : "s"}</span>{caption ? <small>{caption}</small> : null}</div>
    </div>
  );
};

type FilterOption = { label: string; value: string; count?: number; tone?: WorkspaceTone };
type FilterTableProps = {
  filters?: FilterOption[];
  defaultFilter?: string;
  statusKey?: string;
  columns?: WorkspaceColumn[];
  rows?: Record<string, TableValue>[];
  onFilterAction?: ActionConfig;
  onRowClickAction?: ActionConfig;
};

const FilterTable: React.FC<FilterTableProps> = ({
  filters = [],
  defaultFilter = "all",
  statusKey = "status",
  columns = [],
  rows = [],
  onFilterAction,
  onRowClickAction
}) => {
  const invoke = useWorkspaceAction();
  const [active, setActive] = React.useState(defaultFilter);
  const visibleRows = active === "all" ? rows : rows.filter((row) => valueText(row[statusKey]).toLowerCase() === active.toLowerCase());
  return (
    <div className="wg-filter-table">
      <div className="wg-filter-chips">
        {filters.map((filter) => (
          <button
            type="button"
            data-active={active === filter.value || undefined}
            data-tone={filter.tone ?? "neutral"}
            onClick={() => { setActive(filter.value); invoke(onFilterAction, { filter: filter.value, value: filter.value }); }}
            key={filter.value}
          >{filter.label}{filter.count !== undefined ? <span>{filter.count}</span> : null}</button>
        ))}
      </div>
      <WorkspaceTable columns={columns} rows={visibleRows} onRowClick={onRowClickAction ? (row, index) => invoke(onRowClickAction, { row, index }) : undefined} />
    </div>
  );
};

/* ------------------------------------------------------------------
   Navigation, search, workflows, and inspectors
   ------------------------------------------------------------------ */

type NavItem = { id: string; label: string; icon?: WidgetIcon; badge?: string | number; active?: boolean };
type NavSection = { label?: string; items: NavItem[] };
type SidebarNavProps = {
  workspace: string;
  workspaceIcon?: WidgetIcon;
  sections?: NavSection[];
  compact?: boolean;
  footerAction?: { label: string; action: ActionConfig };
  onNavigateAction?: ActionConfig;
};

const SidebarNav: React.FC<SidebarNavProps> = ({
  workspace,
  workspaceIcon = "cube",
  sections = [],
  compact = false,
  footerAction,
  onNavigateAction
}) => {
  const invoke = useWorkspaceAction();
  return (
    <nav className="wg-sidebar-nav" data-compact={compact || undefined} aria-label={`${workspace} navigation`}>
      <div className="wg-sidebar-workspace"><span><Icon name={workspaceIcon} size="sm" color="currentColor" /></span><strong>{workspace}</strong><Icon name="chevron-down" size="xs" color="tertiary" /></div>
      {sections.map((section, sectionIndex) => (
        <div className="wg-sidebar-section" key={`${section.label ?? "section"}-${sectionIndex}`}>
          {section.label ? <small>{section.label}</small> : null}
          {section.items.map((item) => (
            <button
              type="button"
              data-active={item.active || undefined}
              onClick={() => invoke(onNavigateAction, { id: item.id, item })}
              disabled={!onNavigateAction}
              key={item.id}
            >
              {item.icon ? <Icon name={item.icon} size="sm" color="currentColor" /> : <span className="wg-nav-dot" />}
              <span>{item.label}</span>
              {item.badge !== undefined ? <em>{item.badge}</em> : null}
            </button>
          ))}
        </div>
      ))}
      {footerAction ? <button type="button" className="wg-sidebar-footer" onClick={() => invoke(footerAction.action)}>{footerAction.label}</button> : null}
    </nav>
  );
};

type SearchItem = {
  id?: string | number;
  label: string;
  description?: string;
  keywords?: string;
  icon?: WidgetIcon;
  action?: ActionConfig;
};
type SearchProps = {
  name?: string;
  placeholder?: string;
  defaultQuery?: string;
  items?: SearchItem[];
  emptyText?: string;
  onSelectAction?: ActionConfig;
  onChangeAction?: ActionConfig;
};

const Search: React.FC<SearchProps> = ({
  name = "search",
  placeholder = "Search…",
  defaultQuery = "",
  items = [],
  emptyText = "No matches",
  onSelectAction,
  onChangeAction
}) => {
  const form = useWidgetForm();
  const dispatch = useWidgetAction();
  const invoke = useWorkspaceAction();
  const [query, setQuery] = React.useState(defaultQuery);
  const normalized = query.trim().toLowerCase();
  const matches = normalized
    ? items.filter((item) => `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`.toLowerCase().includes(normalized))
    : items;
  const change = (next: string) => {
    setQuery(next);
    form?.setValue(name, next);
    if (onChangeAction && dispatch) dispatch(onChangeAction, buildChangePayload(name, next));
  };
  return (
    <div className="wg-search">
      <label><Icon name="search" size="sm" color="tertiary" /><input name={name} value={query} onChange={(event) => change(event.target.value)} placeholder={placeholder} /></label>
      <div className="wg-search-results">
        {matches.length > 0 ? matches.map((item, index) => (
          <button type="button" disabled={!item.action && !onSelectAction} onClick={() => invoke(item.action ?? onSelectAction, { id: item.id ?? index, item, query })} key={String(item.id ?? index)}>
            {item.icon ? <Icon name={item.icon} size="sm" color="tertiary" /> : null}
            <span><strong>{item.label}</strong>{item.description ? <small>{item.description}</small> : null}</span>
            <Icon name="arrow-right" size="xs" color="tertiary" />
          </button>
        )) : <div className="wg-search-empty"><Icon name="search" size="md" color="tertiary" /><span>{emptyText}</span></div>}
      </div>
    </div>
  );
};

type FlowchartNode = {
  id: string;
  label: string;
  description?: string;
  kind?: "trigger" | "action" | "condition" | "branch" | "result";
  icon?: WidgetIcon;
};
type FlowchartEdge = { from: string; to: string; label?: string; tone?: WorkspaceTone };
type FlowchartProps = {
  nodes?: FlowchartNode[];
  edges?: FlowchartEdge[];
  onNodeClickAction?: ActionConfig;
};

const Flowchart: React.FC<FlowchartProps> = ({ nodes = [], edges = [], onNodeClickAction }) => {
  const invoke = useWorkspaceAction();
  return (
    <div className="wg-flowchart">
      {nodes.map((node, index) => {
        const incoming = edges.filter((edge) => edge.to === node.id);
        return (
          <React.Fragment key={node.id}>
            {index > 0 ? (
              <div className="wg-flow-edge">
                <span />
                {incoming.map((edge) => <em data-tone={edge.tone ?? "neutral"} key={`${edge.from}-${edge.to}-${edge.label}`}>{edge.label ?? "then"}</em>)}
              </div>
            ) : null}
            <button
              type="button"
              className="wg-flow-node"
              data-kind={node.kind ?? "action"}
              disabled={!onNodeClickAction}
              onClick={() => invoke(onNodeClickAction, { id: node.id, node })}
            >
              <span><Icon name={node.icon ?? (node.kind === "trigger" ? "bolt" : node.kind === "condition" ? "shuffle" : "arrow-right")} size="sm" color="currentColor" /></span>
              <span><strong>{node.label}</strong>{node.description ? <small>{node.description}</small> : null}</span>
              <em>{node.kind ?? "action"}</em>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

type InsightSeries = { label: string; value: string; delta?: string; color?: string; data?: number[] };
type InsightItem = {
  id?: string | number;
  title: string;
  description?: string;
  metrics?: InsightSeries[];
  action?: { label: string; action: ActionConfig };
};
type InsightCardsProps = {
  title?: string;
  items?: InsightItem[];
  defaultIndex?: number;
  onChangeAction?: ActionConfig;
};

const InsightCards: React.FC<InsightCardsProps> = ({
  title = "Insights",
  items = [],
  defaultIndex = 0,
  onChangeAction
}) => {
  const invoke = useWorkspaceAction();
  const [index, setIndex] = React.useState(Math.max(0, Math.min(defaultIndex, Math.max(items.length - 1, 0))));
  const item = items[index];
  const change = (next: number) => {
    const bounded = Math.max(0, Math.min(next, items.length - 1));
    setIndex(bounded);
    invoke(onChangeAction, { index: bounded, id: items[bounded]?.id ?? bounded, value: bounded });
  };
  if (!item) return null;
  return (
    <div className="wg-insight-cards">
      <div className="wg-insight-header"><strong>{title}</strong><span>{index + 1}/{items.length}</span></div>
      <div className="wg-insight-copy"><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div>
      {item.metrics?.length ? (
        <div className="wg-insight-metrics">
          {item.metrics.map((metric, metricIndex) => (
            <div key={`${metric.label}-${metricIndex}`}>
              <small>{metric.label}</small><strong>{metric.value}</strong>{metric.delta ? <em>{metric.delta}</em> : null}
              {metric.data && metric.data.length > 1 ? <Sparkline data={metric.data} color={metric.color} height={34} /> : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="wg-insight-footer">
        <span>
          <button type="button" disabled={index === 0} onClick={() => change(index - 1)} aria-label="Previous insight"><Icon name="chevron-left" size="sm" color="currentColor" /></button>
          <button type="button" disabled={index >= items.length - 1} onClick={() => change(index + 1)} aria-label="Next insight"><Icon name="chevron-right" size="sm" color="currentColor" /></button>
        </span>
        {item.action ? <button type="button" onClick={() => invoke(item.action?.action, { id: item.id ?? index, index })}>{item.action.label}</button> : null}
      </div>
    </div>
  );
};

type FineTuneField = {
  name: string;
  label: string;
  type?: "number" | "text" | "select" | "range";
  value?: string | number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
};
type FineTuneCardProps = {
  title: string;
  badge?: string;
  fields?: FineTuneField[];
  applyLabel?: string;
  applyAction?: ActionConfig;
  onChangeAction?: ActionConfig;
};

const FineTuneCard: React.FC<FineTuneCardProps> = ({
  title,
  badge = "Adjust",
  fields = [],
  applyLabel = "Apply",
  applyAction,
  onChangeAction
}) => {
  const dispatch = useWidgetAction();
  const invoke = useWorkspaceAction();
  const form = useWidgetForm();
  const [values, setValues] = React.useState<Record<string, string | number>>(() => Object.fromEntries(fields.map((field) => [field.name, field.value ?? ""])));
  const change = (field: FineTuneField, value: string) => {
    // Keep "" as "" while a number field is being cleared/retyped — Number("")
    // is 0, which would snap the controlled input to "0" and make it uneditable.
    const numeric = field.type === "number" || field.type === "range";
    const nextValue = numeric && value !== "" ? Number(value) : value;
    setValues((current) => ({ ...current, [field.name]: nextValue }));
    form?.setValue(field.name, nextValue);
    if (onChangeAction && dispatch) dispatch(onChangeAction, buildChangePayload(field.name, nextValue));
  };
  return (
    <div className="wg-fine-tune">
      <div className="wg-fine-heading"><strong>{title}</strong><span><Icon name="settings-slider" size="xs" color="currentColor" />{badge}</span></div>
      <div className="wg-fine-fields">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select value={values[field.name]} onChange={(event) => change(field, event.target.value)}>
                {(field.options ?? []).map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            ) : (
              <span className="wg-fine-input"><input type={field.type === "range" ? "range" : field.type === "number" ? "number" : "text"} min={field.min} max={field.max} step={field.step} value={values[field.name]} onChange={(event) => change(field, event.target.value)} />{field.unit ? <em>{field.unit}</em> : null}</span>
            )}
          </label>
        ))}
      </div>
      {applyAction ? <button type="button" className="wg-fine-apply" onClick={() => invoke(applyAction, { values })}>{applyLabel}</button> : null}
    </div>
  );
};

type SelectionAction = { label: string; value?: string; icon?: WidgetIcon; action?: ActionConfig };
type SelectionActionsProps = {
  text: string;
  selection?: string;
  placeholder?: string;
  actions?: SelectionAction[];
  submitAction?: ActionConfig;
};

const SelectionActions: React.FC<SelectionActionsProps> = ({
  text,
  selection,
  placeholder = "Describe edits",
  actions = [],
  submitAction
}) => {
  const invoke = useWorkspaceAction();
  const [prompt, setPrompt] = React.useState("");
  const selected = selection && text.includes(selection) ? selection : text;
  const start = text.indexOf(selected);
  const before = start >= 0 ? text.slice(0, start) : "";
  const after = start >= 0 ? text.slice(start + selected.length) : "";
  const run = (item?: SelectionAction) => invoke(item?.action ?? submitAction, { action: item?.value ?? item?.label, prompt, selection: selected, text });
  return (
    <div className="wg-selection-actions">
      <p>{before}<mark>{selected}</mark>{after}</p>
      <div className="wg-selection-toolbar">
        <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={placeholder} />
        {actions.map((item) => (
          <button type="button" onClick={() => run(item)} disabled={!item.action && !submitAction} key={item.value ?? item.label}>
            {item.icon ? <Icon name={item.icon} size="xs" color="currentColor" /> : null}{item.label}
          </button>
        ))}
        {submitAction ? <button type="button" className="wg-selection-submit" disabled={!prompt.trim()} onClick={() => run()} aria-label="Submit edit instruction"><Icon name="arrow-right" size="xs" color="currentColor" /></button> : null}
      </div>
    </div>
  );
};

export {
  ComparisonTable,
  ContextCards,
  DiffTable,
  FilterTable,
  FineTuneCard,
  Flowchart,
  InsightCards,
  RecordsTable,
  Search,
  SelectionActions,
  SidebarNav
};

export type {
  ComparisonFeature,
  ComparisonTableProps,
  ContextCardsProps,
  ContextItem,
  ContextSource,
  DiffTableProps,
  DiffTableRow,
  FilterOption,
  FilterTableProps,
  FineTuneCardProps,
  FineTuneField,
  FlowchartEdge,
  FlowchartNode,
  FlowchartProps,
  InsightCardsProps,
  InsightItem,
  InsightSeries,
  NavItem,
  NavSection,
  RecordsTableProps,
  SearchItem,
  SearchProps,
  SelectionAction,
  SelectionActionsProps,
  SidebarNavProps,
  TableValue,
  WorkspaceColumn
};
