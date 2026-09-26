import React from "react";
import { useControlValue, fieldId } from "../binding";
import { buildChangePayload, useWidgetAction } from "../context";
import type { ActionConfig, WidgetIcon } from "../types";
import { Icon } from "./content";

type TabsContextValue = { active: string; prefix: string };
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

type TabsProps = {
  tabs: { id: string; label: string; icon?: WidgetIcon }[];
  defaultTab?: string;
  activeTab?: string;
  bind?: string;
  name?: string;
  onChangeAction?: ActionConfig;
  children?: React.ReactNode;
};

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, activeTab: controlledTab, bind, name: explicitName, onChangeAction, children }) => {
  const action = useWidgetAction();
  const prefix = React.useId();
  const [active, setActive, name] = useControlValue({ bind, name: explicitName, value: controlledTab, defaultValue: defaultTab ?? tabs?.[0]?.id, fallback: "" });
  if (!Array.isArray(tabs) || tabs.length === 0) return null;
  const activeTab = tabs.some((tab) => tab.id === active) ? active : tabs[0].id;

  const select = (id: string) => {
    setActive(id);
    if (onChangeAction && action) action(onChangeAction, buildChangePayload(name, id, { tab: id }));
  };

  const navigate = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "ArrowLeft": next = (index - 1 + tabs.length) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    select(tabs[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <TabsContext.Provider value={{ active: activeTab, prefix }}>
      <div id={fieldId(name)} className="wg-tabs">
        <div role="tablist" className="wg-tabs-list">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`${prefix}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`${prefix}-panel-${tab.id}`}
              tabIndex={tab.id === activeTab ? 0 : -1}
              className="wg-tabs-tab"
              onClick={() => select(tab.id)}
              onKeyDown={(event) => navigate(event, index)}
            >
              {tab.icon ? <Icon name={tab.icon} size="sm" color="currentColor" /> : null}
              {tab.label}
            </button>
          ))}
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabPanel: React.FC<{ id: string; children?: React.ReactNode }> = ({ id, children }) => {
  const context = React.useContext(TabsContext);
  if (!context || context.active !== id) return null;
  return <div className="wg-tabs-panel" role="tabpanel" id={`${context.prefix}-panel-${id}`} aria-labelledby={`${context.prefix}-tab-${id}`} tabIndex={0}>{children}</div>;
};

export { Tabs, TabPanel };
export type { TabsProps };
