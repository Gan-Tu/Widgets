import React, { createContext, useContext } from "react";
import type { ThemeMode, WidgetAppearance } from "./types";

const WidgetThemeContext = createContext<ThemeMode>("light");
const WidgetAppearanceContext = createContext<WidgetAppearance>("default");

/** Host presentation preference; does not alter template data or widget state. */
export function WidgetAppearanceProvider({
  appearance,
  children
}: {
  appearance: WidgetAppearance;
  children: React.ReactNode;
}) {
  return <WidgetAppearanceContext.Provider value={appearance}>{children}</WidgetAppearanceContext.Provider>;
}

export function useWidgetAppearance() {
  return useContext(WidgetAppearanceContext);
}

export function WidgetThemeProvider({
  theme,
  children
}: {
  theme: ThemeMode;
  children: React.ReactNode;
}) {
  return (
    <WidgetThemeContext.Provider value={theme}>
      {children}
    </WidgetThemeContext.Provider>
  );
}

export function useWidgetTheme() {
  return useContext(WidgetThemeContext);
}
