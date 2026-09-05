import React, { createContext, useContext } from "react";
import type { ThemeMode } from "./types";

const WidgetThemeContext = createContext<ThemeMode>("light");

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
