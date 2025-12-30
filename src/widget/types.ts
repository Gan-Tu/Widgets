import type React from "react";

export type ThemeMode = "light" | "dark";

export type ThemeColor = {
  light: string;
  dark: string;
};

export type Padding = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  x?: number | string;
  y?: number | string;
};

export type Margin = {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  x?: number | string;
  y?: number | string;
};

export type Border = {
  size: number;
  color?: string | ThemeColor;
  style?:
    | "solid"
    | "dashed"
    | "dotted"
    | "double"
    | "groove"
    | "ridge"
    | "inset"
    | "outset";
};

export type Borders = {
  top?: number | Border;
  right?: number | Border;
  bottom?: number | Border;
  left?: number | Border;
  x?: number | Border;
  y?: number | Border;
};

export type RadiusValue =
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full"
  | "100%"
  | "none";

export type Alignment = "start" | "center" | "end" | "baseline" | "stretch";
export type Justification =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly"
  | "stretch";

export type ControlVariant = "solid" | "soft" | "outline" | "ghost";
export type ControlSize =
  | "3xs"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export type TextAlign = "start" | "center" | "end";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TitleSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
export type CaptionSize = "sm" | "md" | "lg";
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type WidgetStatus =
  | {
      text: string;
      favicon?: string;
      frame?: boolean;
    }
  | {
      text: string;
      icon?: WidgetIcon;
    };

export type ActionConfig = {
  type: string;
  payload?: Record<string, unknown>;
  handler?: "server" | "client";
  loadingBehavior?: "auto" | "none" | "self" | "container";
};

export type BlockProps = {
  height?: number | string;
  width?: number | string;
  size?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  minSize?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  maxSize?: number | string;
  aspectRatio?: number | string;
  radius?: RadiusValue;
  margin?: number | string | Margin;
};

export type BaseTextProps = {
  value: string;
  textAlign?: TextAlign;
  truncate?: boolean;
  maxLines?: number;
};

export type WidgetIcon =
  | "analytics"
  | "atom"
  | "bolt"
  | "book-open"
  | "book-closed"
  | "calendar"
  | "chart"
  | "check"
  | "check-circle"
  | "check-circle-filled"
  | "chevron-left"
  | "chevron-right"
  | "circle-question"
  | "compass"
  | "cube"
  | "document"
  | "dots-horizontal"
  | "empty-circle"
  | "globe"
  | "keys"
  | "lab"
  | "images"
  | "info"
  | "lifesaver"
  | "lightbulb"
  | "mail"
  | "map-pin"
  | "maps"
  | "name"
  | "notebook"
  | "notebook-pencil"
  | "page-blank"
  | "phone"
  | "plus"
  | "profile"
  | "profile-card"
  | "star"
  | "star-filled"
  | "search"
  | "sparkle"
  | "sparkle-double"
  | "square-code"
  | "square-image"
  | "square-text"
  | "suitcase"
  | "settings-slider"
  | "user"
  | "write"
  | "write-alt"
  | "write-alt2"
  | "reload"
  | "play"
  | "mobile"
  | "desktop"
  | "external-link";

export type WidgetRoot = React.FC<{ children?: React.ReactNode }>;
