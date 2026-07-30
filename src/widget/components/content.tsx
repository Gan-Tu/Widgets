import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Atom,
  Award,
  BadgeCheck,
  Ban,
  BarChart3,
  Battery,
  Beer,
  Bell,
  BellRing,
  Bike,
  Book,
  BookOpen,
  Bookmark,
  Box,
  Briefcase,
  Bug,
  Building2,
  Bus,
  Cake,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Camera,
  Car,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clipboard,
  Clock,
  Cloud,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Code,
  Coffee,
  Coins,
  Compass,
  Copy,
  CreditCard,
  Crown,
  Cpu,
  Database,
  DollarSign,
  Download,
  Droplet,
  Dumbbell,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FileText,
  Film,
  Filter,
  Flag,
  Flame,
  FlaskConical,
  Folder,
  Frown,
  Gamepad2,
  Gauge,
  Gem,
  Gift,
  Globe,
  GraduationCap,
  HeartPulse,
  Headphones,
  Heart,
  HelpCircle,
  History,
  Home,
  Hotel,
  Hourglass,
  Image as ImageIcon,
  Images,
  Inbox,
  Info,
  Key,
  Landmark,
  Layers,
  Leaf,
  LifeBuoy,
  Lightbulb,
  LineChart,
  Link,
  Lock,
  Luggage,
  Mail,
  Map,
  MapPin,
  Maximize2,
  Megaphone,
  Menu,
  MessageCircle,
  Mic,
  Minimize2,
  Minus,
  Monitor,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Mountain,
  Music,
  Navigation,
  Newspaper,
  Notebook,
  NotebookPen,
  Package,
  Paperclip,
  PartyPopper,
  Pause,
  Palette,
  Pen,
  PenLine,
  Pencil,
  Percent,
  Phone,
  PieChart,
  Pill,
  Pin,
  Plane,
  Play,
  Plug,
  Plus,
  PlusCircle,
  Power,
  Printer,
  Puzzle,
  QrCode,
  Receipt,
  RefreshCcw,
  Repeat,
  Rocket,
  Route,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Ship,
  ShoppingBag,
  ShoppingCart,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Smartphone,
  Smile,
  Snowflake,
  Sparkles,
  SquareCode,
  Star,
  Stethoscope,
  Store,
  Sun,
  Sunrise,
  Sunset,
  Tag,
  Target,
  Tent,
  Terminal,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  Ticket,
  Timer,
  TrainFront,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  Type,
  Umbrella,
  Unlock,
  Upload,
  User,
  UserPlus,
  UserSquare,
  Users,
  Utensils,
  Video,
  Volume2,
  Wallet,
  Waves,
  Wifi,
  Wind,
  Wine,
  Wrench,
  X,
  XCircle,
  Zap
} from "lucide-react";
import React from "react";

import { useWidgetAction, useWidgetTheme } from "../context";
import {
  applyBorder,
  controlHeights,
  resolveColor,
  resolveRadius,
  sizeToCss
} from "../style";
import type { ActionConfig, Border, IconSize, RadiusValue, ThemeColor, WidgetIcon } from "../types";

type BadgeColor =
  | "secondary"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "discovery";

type BadgeProps = {
  label?: string;
  children?: React.ReactNode;
  color?: BadgeColor;
  variant?: "solid" | "soft" | "outline";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  icon?: WidgetIcon;
};

const badgeSizeStyles: Record<string, React.CSSProperties> = {
  sm: { fontSize: "0.7rem", padding: "0.22rem 0.55rem" },
  md: { fontSize: "0.8rem", padding: "0.28rem 0.65rem" },
  lg: { fontSize: "0.875rem", padding: "0.34rem 0.8rem" }
};

const badgeIconSizes: Record<string, IconSize> = { sm: "xs", md: "sm", lg: "sm" };

const Badge: React.FC<BadgeProps> = ({
  label,
  children,
  color = "secondary",
  variant = "soft",
  size = "sm",
  pill = true,
  icon
}) => {
  const style: React.CSSProperties = {
    borderRadius: pill ? "999px" : "7px",
    ...badgeSizeStyles[size]
  };

  return (
    <span className="wg-badge" data-variant={variant} data-color={color} style={style}>
      {icon ? <Icon name={icon} size={badgeIconSizes[size]} color="currentColor" /> : null}
      {children ?? label}
    </span>
  );
};

type LucideIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}>;

/** Renders a lucide icon with its shape filled by the current color. */
function withFill(Component: LucideIconComponent): LucideIconComponent {
  const FilledIcon: LucideIconComponent = (props) => (
    <Component {...props} fill={props.color ?? "currentColor"} />
  );
  return FilledIcon;
}

const iconMap: Record<WidgetIcon, LucideIconComponent> = {
  // Core
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
  copy: Copy,
  cube: Box as unknown as LucideIconComponent,
  document: FileText,
  "dots-horizontal": MoreHorizontal,
  "empty-circle": Circle,
  globe: Globe,
  keys: Key,
  lab: FlaskConical,
  images: Images,
  info: Info,
  lifesaver: LifeBuoy as unknown as LucideIconComponent,
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
  "star-filled": withFill(Star),
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
  "external-link": ExternalLink,
  // Arrows & navigation
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "arrow-down-right": ArrowDownRight,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  menu: Menu,
  // Data & trends
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  activity: Activity,
  "pie-chart": PieChart,
  "line-chart": LineChart,
  gauge: Gauge,
  target: Target,
  layers: Layers,
  filter: Filter,
  database: Database,
  // Time
  clock: Clock,
  timer: Timer,
  hourglass: Hourglass,
  history: History,
  "calendar-days": CalendarDays,
  "calendar-check": CalendarCheck,
  // Commerce & money
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "credit-card": CreditCard,
  wallet: Wallet,
  dollar: DollarSign,
  coins: Coins,
  receipt: Receipt,
  tag: Tag,
  ticket: Ticket,
  percent: Percent,
  gift: Gift,
  package: Package,
  truck: Truck,
  store: Store,
  // Places & travel
  home: Home,
  building: Building2,
  landmark: Landmark,
  hotel: Hotel,
  plane: Plane,
  car: Car,
  train: TrainFront,
  bus: Bus,
  bike: Bike,
  route: Route,
  navigation: Navigation,
  luggage: Luggage,
  tent: Tent,
  ship: Ship,
  // Food & drink
  utensils: Utensils,
  coffee: Coffee,
  wine: Wine,
  beer: Beer,
  cake: Cake,
  // Weather & nature
  sun: Sun,
  moon: Moon,
  sunrise: Sunrise,
  sunset: Sunset,
  cloud: Cloud,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  "cloud-rain": CloudRain,
  "cloud-snow": CloudSnow,
  wind: Wind,
  droplet: Droplet,
  thermometer: Thermometer,
  umbrella: Umbrella,
  snowflake: Snowflake,
  leaf: Leaf,
  flame: Flame,
  mountain: Mountain,
  waves: Waves,
  // Communication
  message: MessageCircle,
  send: Send,
  bell: Bell,
  "bell-ring": BellRing,
  share: Share2,
  link: Link,
  paperclip: Paperclip,
  inbox: Inbox,
  // Media
  camera: Camera,
  video: Video,
  film: Film,
  music: Music,
  mic: Mic,
  volume: Volume2,
  headphones: Headphones,
  pause: Pause,
  "skip-forward": SkipForward,
  "skip-back": SkipBack,
  // Files & actions
  download: Download,
  upload: Upload,
  trash: Trash2,
  save: Save,
  clipboard: Clipboard,
  printer: Printer,
  folder: Folder,
  archive: Archive,
  eye: Eye,
  "eye-off": EyeOff,
  bookmark: Bookmark,
  flag: Flag,
  pin: Pin,
  // People & sentiment
  users: Users,
  "user-plus": UserPlus,
  smile: Smile,
  frown: Frown,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  heart: Heart,
  "heart-filled": withFill(Heart),
  "heart-pulse": HeartPulse,
  // Health & fitness
  dumbbell: Dumbbell,
  pill: Pill,
  stethoscope: Stethoscope,
  // Security & system
  lock: Lock,
  unlock: Unlock,
  shield: Shield,
  "shield-check": ShieldCheck,
  wifi: Wifi,
  battery: Battery,
  power: Power,
  plug: Plug,
  cpu: Cpu,
  server: Server,
  // Status & symbols
  "alert-triangle": AlertTriangle,
  "alert-circle": AlertCircle,
  x: X,
  "x-circle": XCircle,
  minus: Minus,
  "plus-circle": PlusCircle,
  ban: Ban,
  award: Award,
  trophy: Trophy,
  crown: Crown,
  rocket: Rocket,
  gem: Gem,
  "party-popper": PartyPopper,
  // Dev & tools
  terminal: Terminal,
  code: Code,
  bug: Bug,
  wrench: Wrench,
  palette: Palette,
  settings: Settings,
  "qr-code": QrCode,
  // Misc
  "graduation-cap": GraduationCap,
  megaphone: Megaphone,
  newspaper: Newspaper,
  puzzle: Puzzle,
  gamepad: Gamepad2,
  maximize: Maximize2,
  minimize: Minimize2,
  repeat: Repeat,
  shuffle: Shuffle,
  "dots-vertical": MoreVertical
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
  border?: number | Border;
  onClickAction?: ActionConfig;
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
  onClickAction,
  ...props
}) => {
  const theme = useWidgetTheme();
  const action = useWidgetAction();
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
    aspectRatio: props.aspectRatio
  };

  // Image border defaults to `{ size: 1, color: "subtle" }`.
  // `frame` opts into a stronger border by default.
  applyBorder(
    style,
    border ?? { size: 1, color: frame ? "strong" : "subtle" },
    theme
  );

  if (flush) {
    style.marginLeft = "calc(var(--widget-card-padding, 1rem) * -1)";
    style.marginRight = "calc(var(--widget-card-padding, 1rem) * -1)";
    style.width = "calc(100% + var(--widget-card-padding, 1rem) * 2)";
    style.borderRadius = "0px";
  }

  if (onClickAction) {
    style.cursor = "pointer";
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      loading="lazy"
      decoding="async"
      style={style}
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
    />
  );
};

type ButtonColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "discovery"
  | "success"
  | "caution"
  | "warning"
  | "danger";

type ButtonProps = {
  submit?: boolean;
  label?: string;
  children?: React.ReactNode;
  onClickAction?: ActionConfig;
  iconStart?: WidgetIcon;
  iconEnd?: WidgetIcon;
  style?: "primary" | "secondary";
  color?: ButtonColor;
  iconSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: keyof typeof controlHeights;
  pill?: boolean;
  uniform?: boolean;
  block?: boolean;
  disabled?: boolean;
};

const buttonFontSizes: Record<string, string> = {
  "3xs": "0.75rem",
  "2xs": "0.75rem",
  xs: "0.78rem",
  sm: "0.8125rem",
  md: "0.84375rem",
  lg: "0.875rem",
  xl: "0.9375rem",
  "2xl": "0.9375rem",
  "3xl": "1rem"
};

const buttonPaddingX: Record<string, string> = {
  "3xs": "0.5rem",
  "2xs": "0.55rem",
  xs: "0.65rem",
  sm: "0.75rem",
  md: "0.9rem",
  lg: "1.1rem",
  xl: "1.25rem",
  "2xl": "1.4rem",
  "3xl": "1.5rem"
};

type PlainButtonProps = {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "solid" | "soft" | "outline" | "ghost";
  color?: ButtonColor;
  size?: keyof typeof controlHeights;
  pill?: boolean;
  block?: boolean;
  disabled?: boolean;
  submit?: boolean;
  /** Layout overrides (flexShrink, margins) merged over the size styles. */
  style?: React.CSSProperties;
};

/**
 * Internal button for chrome the widget system renders itself (card footers,
 * "Show more", Callout/EmptyState actions). Same wg-btn styling and size
 * tokens as `Button`, but takes a plain onClick instead of an ActionConfig.
 * Not registered in the template registry.
 */
const PlainButton: React.FC<PlainButtonProps> = ({
  children,
  onClick,
  variant = "solid",
  color = "primary",
  size = "lg",
  pill = true,
  block = false,
  disabled = false,
  submit = false,
  style
}) => (
  <button
    type={submit ? "submit" : "button"}
    className="wg-btn"
    data-variant={variant}
    data-color={color}
    disabled={disabled}
    onClick={onClick}
    style={{
      height: controlHeights[size] ?? controlHeights.lg,
      padding: `0 ${buttonPaddingX[size] ?? "1.1rem"}`,
      width: block ? "100%" : undefined,
      borderRadius: pill ? "999px" : "var(--widget-radius-control)",
      fontSize: buttonFontSizes[size] ?? "0.875rem",
      ...style
    }}
  >
    {children}
  </button>
);

const Button: React.FC<ButtonProps> = ({
  submit = false,
  label,
  children,
  onClickAction,
  iconStart,
  iconEnd,
  style: stylePreset = "secondary",
  color,
  iconSize = "md",
  variant = "solid",
  size = "lg",
  pill = true,
  uniform = false,
  block = false,
  disabled
}) => {
  const action = useWidgetAction();
  const isDisabled = disabled ?? (!onClickAction && !submit);
  const resolvedColor = color ?? stylePreset;
  const height = controlHeights[size] ?? controlHeights.lg;

  const style: React.CSSProperties = {
    height,
    padding: `0 ${uniform ? "0px" : buttonPaddingX[size] ?? "1.1rem"}`,
    width: uniform ? height : block ? "100%" : undefined,
    borderRadius: pill ? "999px" : "var(--widget-radius-control)",
    fontSize: buttonFontSizes[size] ?? "0.875rem"
  };

  const iconToken = (iconSize === "2xl" ? "2xl" : iconSize) as IconSize;

  const handleClick = () => {
    if (isDisabled) return;
    // If this is a submit button, let the nearest <Form> handle submission.
    if (submit) return;
    if (onClickAction && action) action(onClickAction);
  };

  return (
    <button
      type={submit ? "submit" : "button"}
      className="wg-btn"
      data-variant={variant}
      data-color={resolvedColor}
      style={style}
      onClick={handleClick}
      disabled={isDisabled}
    >
      {iconStart && <Icon name={iconStart} size={iconToken} color="currentColor" />}
      {(children ?? label) && <span>{children ?? label}</span>}
      {iconEnd && <Icon name={iconEnd} size={iconToken} color="currentColor" />}
    </button>
  );
};

export { Badge, Button, Icon, Image, PlainButton };
export type { BadgeProps, ButtonProps, ImageProps, PlainButtonProps };
