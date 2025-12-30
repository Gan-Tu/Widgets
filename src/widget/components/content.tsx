import React from "react";
import {
  BarChart3,
  Atom,
  BadgeCheck,
  Box,
  Book,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Compass,
  ExternalLink,
  File,
  FileText,
  FlaskConical,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Images,
  Info,
  Key,
  LifeBuoy,
  Lightbulb,
  Mail,
  Map,
  MapPin,
  Monitor,
  MoreHorizontal,
  Notebook,
  NotebookPen,
  Pen,
  PenLine,
  Pencil,
  Phone,
  Play,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  SquareCode,
  Star,
  Type,
  User,
  UserSquare,
  Zap,
  Smartphone
} from "lucide-react";

import { useWidgetAction, useWidgetTheme } from "../context";
import type { ActionConfig, IconSize, RadiusValue, ThemeColor, WidgetIcon } from "../types";
import {
  controlHeights,
  resolveColor,
  resolveRadius,
  sizeToCss
} from "../style";

type BadgeProps = {
  label: string;
  color?: "secondary" | "success" | "danger" | "warning" | "info" | "discovery";
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
};

const badgePalette: Record<string, { fg: string; bg: string; border: string }> = {
  secondary: {
    fg: "var(--widget-text-secondary)",
    bg: "var(--widget-surface-secondary)",
    border: "var(--widget-border-subtle)"
  },
  success: { fg: "#166534", bg: "#dcfce7", border: "#86efac" },
  danger: { fg: "#991b1b", bg: "#fee2e2", border: "#fecaca" },
  warning: { fg: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  info: { fg: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe" },
  discovery: { fg: "#4338ca", bg: "#e0e7ff", border: "#c7d2fe" }
};

const Badge: React.FC<BadgeProps> = ({
  label,
  color = "secondary",
  variant = "soft",
  size = "sm",
  pill = true
}) => {
  const palette = badgePalette[color] ?? badgePalette.secondary;
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: "0.7rem", padding: "0.15rem 0.5rem" },
    md: { fontSize: "0.8rem", padding: "0.2rem 0.6rem" },
    lg: { fontSize: "0.9rem", padding: "0.3rem 0.8rem" }
  };

  const style: React.CSSProperties = {
    borderRadius: pill ? "999px" : "8px",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    border: "1px solid transparent",
    ...sizeStyles[size]
  };

  if (variant === "solid") {
    style.background = palette.fg;
    style.color = "#fff";
  } else if (variant === "outline") {
    style.background = "transparent";
    style.color = palette.fg;
    style.borderColor = palette.border;
  } else {
    style.background = palette.bg;
    style.color = palette.fg;
    style.borderColor = palette.bg;
  }

  return <span style={style}>{label}</span>;
};

const iconMap: Record<WidgetIcon, React.ComponentType<{ size?: number; color?: string }>> = {
  analytics: BarChart3,
  atom: Atom,
  bolt: Zap,
  "book-open": BookOpen,
  "book-closed": Book,
  calendar: Calendar,
  chart: BarChart3,
  check: Check,
  "check-circle": CheckCircle,
  "check-circle-filled": BadgeCheck,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "circle-question": HelpCircle,
  compass: Compass,
  cube: Box as unknown as React.ComponentType<{ size?: number; color?: string }>,
  document: FileText,
  "dots-horizontal": MoreHorizontal,
  "empty-circle": Circle,
  globe: Globe,
  keys: Key,
  lab: FlaskConical,
  images: Images,
  info: Info,
  lifesaver: LifeBuoy as unknown as React.ComponentType<{ size?: number; color?: string }>,
  lightbulb: Lightbulb,
  mail: Mail,
  "map-pin": MapPin,
  maps: Map,
  name: UserSquare,
  notebook: Notebook,
  "notebook-pencil": NotebookPen,
  "page-blank": File,
  phone: Phone,
  plus: Plus,
  profile: User,
  "profile-card": UserSquare,
  star: Star,
  "star-filled": Star,
  search: Search,
  sparkle: Sparkles,
  "sparkle-double": Sparkles,
  "square-code": SquareCode,
  "square-image": ImageIcon,
  "square-text": Type,
  suitcase: Briefcase,
  "settings-slider": SlidersHorizontal,
  user: User,
  write: Pen,
  "write-alt": PenLine,
  "write-alt2": Pencil,
  reload: RefreshCcw,
  play: Play,
  mobile: Smartphone,
  desktop: Monitor,
  "external-link": ExternalLink
};

const iconSizes: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 28,
  "3xl": 32
};

const Icon: React.FC<{ name: WidgetIcon; color?: string | ThemeColor; size?: IconSize }> = ({
  name,
  color = "prose",
  size = "md"
}) => {
  const theme = useWidgetTheme();
  const Component = iconMap[name] ?? Circle;
  const resolvedColor = resolveColor(color, theme);
  return <Component size={iconSizes[size]} color={resolvedColor} />;
};

type ImageProps = {
  src: string;
  alt?: string;
  frame?: boolean;
  fit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  position?:
    | "top left"
    | "top"
    | "top right"
    | "left"
    | "center"
    | "right"
    | "bottom left"
    | "bottom"
    | "bottom right";
  flush?: boolean;
  height?: number | string;
  width?: number | string;
  size?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  aspectRatio?: number | string;
  radius?: RadiusValue;
  background?: string | ThemeColor;
  border?: number;
};

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  frame,
  fit = "cover",
  position = "center",
  flush = false,
  radius = "md",
  background,
  border,
  ...props
}) => {
  const theme = useWidgetTheme();
  const borderSize = border ?? 1;
  const borderColor = frame ? "var(--widget-border-strong)" : "var(--widget-border-subtle)";
  const hasExplicitSize =
    props.size !== undefined ||
    props.width !== undefined ||
    props.height !== undefined ||
    props.aspectRatio !== undefined;
  const fallbackSize = hasExplicitSize ? undefined : "40px";
  const style: React.CSSProperties = {
    objectFit: fit,
    objectPosition: position,
    borderRadius: resolveRadius(radius),
    background: background ? resolveColor(background, theme) : undefined,
    width: props.size ? sizeToCss(props.size) : sizeToCss(props.width) ?? fallbackSize,
    height: props.size ? sizeToCss(props.size) : sizeToCss(props.height) ?? fallbackSize,
    minWidth: sizeToCss(props.minWidth),
    minHeight: sizeToCss(props.minHeight),
    maxWidth: sizeToCss(props.maxWidth),
    maxHeight: sizeToCss(props.maxHeight),
    aspectRatio: props.aspectRatio,
    border: `${borderSize}px solid ${borderColor}`
  };

  if (flush) {
    style.marginLeft = "calc(var(--widget-card-padding, 1rem) * -1)";
    style.marginRight = "calc(var(--widget-card-padding, 1rem) * -1)";
    style.width = "calc(100% + var(--widget-card-padding, 1rem) * 2)";
    style.borderRadius = "0px";
  }

  return <img src={src} alt={alt ?? ""} style={style} />;
};

type ButtonProps = {
  submit?: boolean;
  label?: string;
  onClickAction?: ActionConfig;
  onPress?: () => void;
  iconStart?: WidgetIcon;
  iconEnd?: WidgetIcon;
  style?: "primary" | "secondary";
  iconSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  color?:
    | "primary"
    | "secondary"
    | "info"
    | "discovery"
    | "success"
    | "caution"
    | "warning"
    | "danger";
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: keyof typeof controlHeights;
  pill?: boolean;
  uniform?: boolean;
  block?: boolean;
  disabled?: boolean;
};

const buttonPalette: Record<string, { fg: string; bg: string; border: string }> = {
  primary: { fg: "#ffffff", bg: "#0f172a", border: "#0f172a" },
  secondary: { fg: "#0f172a", bg: "#f1f5f9", border: "#e2e8f0" },
  info: { fg: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe" },
  discovery: { fg: "#4338ca", bg: "#e0e7ff", border: "#c7d2fe" },
  success: { fg: "#166534", bg: "#dcfce7", border: "#86efac" },
  caution: { fg: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  warning: { fg: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  danger: { fg: "#991b1b", bg: "#fee2e2", border: "#fecaca" }
};

const Button: React.FC<ButtonProps> = ({
  submit = false,
  label,
  onClickAction,
  onPress,
  iconStart,
  iconEnd,
  style: stylePreset,
  iconSize = "md",
  color = "secondary",
  variant = "solid",
  size = "lg",
  pill = true,
  uniform = false,
  block = false,
  disabled = false
}) => {
  const action = useWidgetAction();
  const resolvedColor = buttonPalette[stylePreset ?? color] ?? buttonPalette.secondary;
  const height = controlHeights[size] ?? controlHeights.lg;
  const paddingX = uniform ? "0px" : "1.1rem";

  const style: React.CSSProperties = {
    height,
    padding: `0 ${paddingX}`,
    borderRadius: pill ? "999px" : "12px",
    width: block ? "100%" : undefined,
    borderWidth: "1px",
    borderStyle: "solid",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    background: variant === "solid" ? resolvedColor.bg : "transparent",
    color:
      variant === "solid"
        ? resolvedColor.fg
        : variant === "ghost"
        ? resolvedColor.fg
        : resolvedColor.fg,
    borderColor:
      variant === "outline"
        ? resolvedColor.border
        : variant === "solid"
        ? resolvedColor.bg
        : "transparent"
  };

  if (variant === "soft") {
    style.background = resolvedColor.bg;
    style.color = resolvedColor.fg;
    style.borderColor = resolvedColor.bg;
  }

  const iconToken = (iconSize === "2xl" ? "2xl" : iconSize) as IconSize;

  const handleClick = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    }
    if (onClickAction && action) {
      action(onClickAction);
    }
  };

  return (
    <button type={submit ? "submit" : "button"} style={style} onClick={handleClick} disabled={disabled}>
      {iconStart && <Icon name={iconStart} size={iconToken} color={resolvedColor.fg} />}
      {label && <span>{label}</span>}
      {iconEnd && <Icon name={iconEnd} size={iconToken} color={resolvedColor.fg} />}
    </button>
  );
};

export { Badge, Icon, Image, Button };
export type { BadgeProps, ButtonProps, ImageProps };
