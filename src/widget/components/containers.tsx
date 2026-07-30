import React from "react";

import { useWidgetAction, useWidgetForm, useWidgetTheme, WidgetFormProvider, WidgetThemeProvider } from "../context";
import type { ActionConfig, Alignment, Justification, Padding, ThemeColor, WidgetStatus } from "../types";
import { useVisibleAction } from "../hooks";
import { applyPadding, resolveColor, resolveGap, spaceToCss } from "../style";
import { Row, resolveAlign, resolveJustify } from "./layout";
import { Icon, Image, PlainButton } from "./content";

type BasicProps = {
  children: React.ReactNode;
  gap?: number | string;
  padding?: number | string | Padding;
  align?: Alignment;
  justify?: Justification;
  direction?: "row" | "col";
  theme?: "light" | "dark";
  onVisibleAction?: ActionConfig;
};

const Basic: React.FC<BasicProps> = ({
  children,
  gap,
  padding,
  align,
  justify,
  direction = "col",
  theme,
  onVisibleAction
}) => {
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const visibleRef = useVisibleAction<HTMLDivElement>(onVisibleAction);
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: direction === "row" ? "row" : "column",
    // Basic is a root container: fill the available width — shrink-to-fit
    // collapses `repeat(auto-fit, ...)` grids inside to a single column.
    // Children keep the default `stretch` alignment (a `center` default would
    // shrink-wrap width-less children and break Row justify layouts).
    width: "100%",
    alignItems: resolveAlign(align),
    justifyContent: resolveJustify(justify),
    gap: resolveGap(gap)
  };
  applyPadding(style, padding);

  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div ref={visibleRef} className="widget-root" data-theme={resolvedTheme} style={style}>
        {children}
      </div>
    </WidgetThemeProvider>
  );
};

const statusTextStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "var(--widget-text-secondary)"
};

const StatusHeader: React.FC<{ status: WidgetStatus }> = ({ status }) => {
  if ("favicon" in status) {
    return (
      <Row align="center" gap={2} padding={{ bottom: 2 }}>
        {status.favicon ? (
          <Image
            src={status.favicon}
            size={18}
            frame={status.frame}
            radius="full"
          />
        ) : null}
        <span style={statusTextStyle}>{status.text}</span>
      </Row>
    );
  }

  if ("icon" in status) {
    return (
      <Row align="center" gap={2} padding={{ bottom: 2 }}>
        {status.icon ? <Icon name={status.icon} size="sm" color="secondary" /> : null}
        <span style={statusTextStyle}>{status.text}</span>
      </Row>
    );
  }

  return null;
};

type CardProps = {
  children: React.ReactNode;
  asForm?: boolean;
  background?: string | ThemeColor;
  size?: "sm" | "md" | "lg" | "full";
  padding?: number | string | Padding;
  status?: WidgetStatus;
  collapsed?: boolean;
  confirm?: { label: string; action: ActionConfig };
  cancel?: { label: string; action: ActionConfig };
  onClickAction?: ActionConfig;
  onVisibleAction?: ActionConfig;
  gap?: number | string;
  height?: number | string;
  width?: number | string;
  shadow?: boolean;
  id?: string;
  cardId?: string;
  theme?: "light" | "dark";
};

const cardWidths: Record<string, string> = {
  sm: "360px",
  md: "440px",
  lg: "560px",
  full: "100%"
};

const CardInner: React.FC<CardProps> = ({
  children,
  asForm,
  background = "surface-elevated",
  size = "sm",
  padding = 4,
  status,
  collapsed = false,
  confirm,
  cancel,
  onClickAction,
  onVisibleAction,
  gap,
  height,
  width,
  shadow = true,
  id,
  cardId,
  theme
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);
  const visibleRef = useVisibleAction<HTMLDivElement>(onVisibleAction);

  const style: React.CSSProperties = {
    width: "100%",
    maxWidth: cardWidths[size],
    height: height === undefined ? undefined : String(typeof height === "number" ? `${height}px` : height),
    ...(width !== undefined
      ? {
          width: typeof width === "number" ? `${width}px` : width,
          maxWidth: typeof width === "number" ? `${width}px` : width
        }
      : null),
    background: resolveColor(background, resolvedTheme),
    boxShadow: shadow ? "var(--widget-shadow)" : undefined,
    overflow: "hidden",
    cursor: onClickAction ? "pointer" : undefined
  };

  const paddingValue =
    typeof padding === "number"
      ? spaceToCss(padding)
      : typeof padding === "string"
      ? padding
      : spaceToCss(padding?.x ?? padding?.left ?? 4);

  const contentStyle: React.CSSProperties = {
    "--widget-card-padding": paddingValue,
    display: "flex",
    flexDirection: "column",
    gap: resolveGap(gap)
  } as React.CSSProperties;
  applyPadding(contentStyle, padding);

  const handleAction = (actionConfig?: ActionConfig) => {
    if (!actionConfig || !action) return;
    action(actionConfig, asForm ? form?.values ?? {} : undefined);
  };

  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div
        ref={visibleRef}
        id={id}
        data-card-id={cardId ?? id}
        className="widget-root wg-card"
        data-theme={resolvedTheme}
        data-clickable={onClickAction ? "true" : undefined}
        style={style}
        role={onClickAction ? "button" : undefined}
        tabIndex={onClickAction ? 0 : undefined}
        onClick={() => handleAction(onClickAction)}
        onKeyDown={(event) => {
          if (!onClickAction) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleAction(onClickAction);
          }
        }}
      >
        <div style={contentStyle}>
          {status ? <StatusHeader status={status} /> : null}
          {isCollapsed ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--widget-text-secondary)" }}>
                This widget is collapsed.
              </span>
              <PlainButton variant="ghost" size="xs" onClick={() => setIsCollapsed(false)}>
                Expand
              </PlainButton>
            </div>
          ) : (
            children
          )}
        </div>
        {(confirm || cancel) && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
              borderTop: "1px solid var(--widget-border-subtle)",
              background: "var(--widget-surface-secondary)",
              padding: "0.75rem 1rem"
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {cancel ? (
              <PlainButton variant="outline" onClick={() => handleAction(cancel.action)}>
                {cancel.label}
              </PlainButton>
            ) : null}
            {confirm ? (
              <PlainButton onClick={() => handleAction(confirm.action)}>
                {confirm.label}
              </PlainButton>
            ) : null}
          </div>
        )}
      </div>
    </WidgetThemeProvider>
  );
};

const Card: React.FC<CardProps> = ({ asForm, ...props }) => {
  if (asForm) {
    return (
      <WidgetFormProvider>
        <CardInner asForm {...props} />
      </WidgetFormProvider>
    );
  }
  return <CardInner {...props} />;
};

type ListViewProps = {
  children: React.ReactNode;
  limit?: number | "auto";
  status?: WidgetStatus;
  theme?: "light" | "dark";
  onVisibleAction?: ActionConfig;
};

const ListView: React.FC<ListViewProps> = ({
  children,
  limit = "auto",
  status,
  theme,
  onVisibleAction
}) => {
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const visibleRef = useVisibleAction<HTMLDivElement>(onVisibleAction);
  const [expanded, setExpanded] = React.useState(false);
  const items = React.Children.toArray(children);
  const computedLimit = limit === "auto" ? 6 : limit;
  const visibleItems =
    expanded || limit === undefined ? items : items.slice(0, computedLimit);
  const showMore = items.length > visibleItems.length;

  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div
        ref={visibleRef}
        className="widget-root wg-card"
        data-theme={resolvedTheme}
        style={{
          background: "var(--widget-surface-elevated)",
          boxShadow: "var(--widget-shadow)",
          padding: "0.5rem 0",
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "0 1rem" }}>
          {status ? <StatusHeader status={status} /> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>{visibleItems}</div>
        {showMore && (
          <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem 0 0.35rem" }}>
            <PlainButton variant="ghost" size="sm" onClick={() => setExpanded(true)}>
              Show more
            </PlainButton>
          </div>
        )}
      </div>
    </WidgetThemeProvider>
  );
};

type ListViewItemProps = {
  children: React.ReactNode;
  onClickAction?: ActionConfig;
  gap?: number | string;
  align?: Alignment;
};

const ListViewItem: React.FC<ListViewItemProps> = ({
  children,
  onClickAction,
  gap,
  align = "center"
}) => {
  const action = useWidgetAction();
  return (
    <div
      role={onClickAction ? "button" : undefined}
      tabIndex={onClickAction ? 0 : undefined}
      onClick={() => {
        if (onClickAction && action) action(onClickAction);
      }}
      onKeyDown={(event) => {
        if (!onClickAction || !action) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          action(onClickAction);
        }
      }}
      className={onClickAction ? "wg-listitem wg-row-clickable" : "wg-listitem"}
      style={{
        padding: "0.75rem 1rem",
        cursor: onClickAction ? "pointer" : undefined
      }}
    >
      <Row align={align} gap={gap ?? 3}>
        {children}
      </Row>
    </div>
  );
};

export { Basic, Card, ListView, ListViewItem };
export type { CardProps, ListViewProps, ListViewItemProps };
