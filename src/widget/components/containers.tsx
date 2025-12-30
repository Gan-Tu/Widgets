import React from "react";

import { useWidgetAction, useWidgetForm, useWidgetTheme, WidgetFormProvider, WidgetThemeProvider } from "../context";
import type { ActionConfig, Alignment, Justification, Padding, ThemeColor, WidgetStatus } from "../types";
import { applyPadding, resolveColor, resolveGap, spaceToCss } from "../style";
import { Button as UiButton } from "@/components/ui/button";
import { Row, resolveAlign, resolveJustify } from "./layout";
import { Icon, Image } from "./content";

type BasicProps = {
  children: React.ReactNode;
  gap?: number | string;
  padding?: number | string | Padding;
  align?: Alignment;
  justify?: Justification;
  direction?: "row" | "col";
  theme?: "light" | "dark";
};

const Basic: React.FC<BasicProps> = ({
  children,
  gap,
  padding,
  align,
  justify,
  direction = "col",
  theme
}) => {
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: direction === "row" ? "row" : "column",
    alignItems: resolveAlign(align),
    justifyContent: resolveJustify(justify),
    gap: resolveGap(gap)
  };
  applyPadding(style, padding);

  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div className="widget-root" data-theme={resolvedTheme} style={style}>
        {children}
      </div>
    </WidgetThemeProvider>
  );
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
        <span className="text-xs text-slate-500">{status.text}</span>
      </Row>
    );
  }

  if ("icon" in status) {
    return (
      <Row align="center" gap={2} padding={{ bottom: 2 }}>
        {status.icon ? <Icon name={status.icon} size="sm" /> : null}
        <span className="text-xs text-slate-500">{status.text}</span>
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
  theme
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const style: React.CSSProperties = {
    width: "100%",
    maxWidth: cardWidths[size],
    background: resolveColor(background, resolvedTheme),
    border: "1px solid var(--widget-border-default)",
    borderRadius: "var(--widget-radius)",
    boxShadow: "var(--widget-shadow)",
    overflow: "hidden"
  };

  const paddingValue =
    typeof padding === "number"
      ? spaceToCss(padding)
      : typeof padding === "string"
      ? padding
      : spaceToCss(padding?.x ?? padding?.left ?? 4);

  const contentStyle: React.CSSProperties = {
    "--widget-card-padding": paddingValue
  } as React.CSSProperties;
  applyPadding(contentStyle, padding);

  const handleAction = (actionConfig?: ActionConfig) => {
    if (!actionConfig || !action) return;
    action(actionConfig, asForm ? form?.values ?? {} : undefined);
  };

  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div className="widget-root" data-theme={resolvedTheme} style={style}>
        <div style={contentStyle}>
          {status ? <StatusHeader status={status} /> : null}
          {isCollapsed ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">This widget is collapsed.</span>
              <button
                type="button"
                className="text-xs font-semibold text-slate-600"
                onClick={() => setIsCollapsed(false)}
              >
                Expand
              </button>
            </div>
          ) : (
            children
          )}
        </div>
        {(confirm || cancel) && (
          <div className="flex gap-2 border-t border-slate-200 px-4 py-3">
            {cancel ? (
              <UiButton variant="outline" onClick={() => handleAction(cancel.action)}>
                {cancel.label}
              </UiButton>
            ) : null}
            {confirm ? (
              <UiButton onClick={() => handleAction(confirm.action)}>
                {confirm.label}
              </UiButton>
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
};

const ListView: React.FC<ListViewProps> = ({
  children,
  limit = "auto",
  status,
  theme
}) => {
  const inheritedTheme = useWidgetTheme();
  const resolvedTheme = theme ?? inheritedTheme;
  const [expanded, setExpanded] = React.useState(false);
  const items = React.Children.toArray(children);
  const computedLimit = limit === "auto" ? 6 : limit;
  const visibleItems =
    expanded || limit === undefined ? items : items.slice(0, computedLimit);
  const showMore = items.length > visibleItems.length;

  return (
    <WidgetThemeProvider theme={resolvedTheme}>
      <div
        className="widget-root"
        data-theme={resolvedTheme}
        style={{
          border: "1px solid var(--widget-border-default)",
          borderRadius: "var(--widget-radius)",
          background: "var(--widget-surface-elevated)",
          padding: "0.5rem 0"
        }}
      >
        <div style={{ padding: "0 1rem" }}>
          {status ? <StatusHeader status={status} /> : null}
        </div>
        <div className="flex flex-col gap-0">{visibleItems}</div>
        {showMore && (
          <div className="flex justify-center py-3">
            <button
              type="button"
              className="text-xs font-semibold text-slate-500"
              onClick={() => setExpanded(true)}
            >
              Show more
            </button>
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
      className="border-b border-slate-100 last:border-b-0"
      style={{ padding: "0.75rem 1rem" }}
    >
      <Row align={align} gap={gap ?? 3}>
        {children}
      </Row>
    </div>
  );
};

export { Basic, Card, ListView, ListViewItem };
export type { CardProps, ListViewProps, ListViewItemProps };
