import React from "react";

import { getFormValue, useWidgetForm, useWidgetTheme } from "../context";
import type {
  BaseTextProps,
  CaptionSize,
  TextAlign,
  TextSize,
  ThemeColor,
  TitleSize
} from "../types";
import { resolveColor, resolveWeight } from "../style";

const textSizeMap: Record<TextSize, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem"
};

const captionSizeMap: Record<CaptionSize, string> = {
  sm: "0.75rem",
  md: "0.825rem",
  lg: "0.9rem"
};

const titleSizeMap: Record<TitleSize, string> = {
  sm: "1.1rem",
  md: "1.25rem",
  lg: "1.5rem",
  xl: "1.75rem",
  "2xl": "2rem",
  "3xl": "2.5rem",
  "4xl": "3rem",
  "5xl": "3.5rem"
};


function buildTextStyle({
  textAlign,
  truncate,
  maxLines,
  minLines,
  lineHeight = 1.5
}: {
  textAlign?: TextAlign;
  truncate?: boolean;
  maxLines?: number;
  minLines?: number;
  lineHeight?: number;
}) {
  const style: React.CSSProperties = {
    textAlign: textAlign === "start" ? "left" : textAlign === "end" ? "right" : textAlign,
    lineHeight
  };

  if (truncate) {
    style.whiteSpace = "nowrap";
    style.overflow = "hidden";
    style.textOverflow = "ellipsis";
    // overflow/text-overflow don't apply to inline elements, so inline
    // renderers (Caption's <span>) need a block context for the ellipsis.
    style.display = "block";
  }

  if (maxLines !== undefined) {
    style.display = "-webkit-box";
    style.WebkitLineClamp = maxLines;
    style.WebkitBoxOrient = "vertical";
    style.overflow = "hidden";
  }

  if (minLines !== undefined) {
    style.minHeight = `${minLines * lineHeight}em`;
  }

  return style;
}

type TextProps = BaseTextProps & {
  size?: TextSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
  streaming?: boolean;
  italic?: boolean;
  lineThrough?: boolean;
  width?: number | string;
  minLines?: number;
  color?: string | ThemeColor;
  editable?:
    | false
    | {
        name: string;
        placeholder?: string;
        autoFocus?: boolean;
        autoSelect?: boolean;
        autoComplete?: string;
        allowAutofillExtensions?: boolean;
        pattern?: string;
        required?: boolean;
      };
};

const EditableTextField: React.FC<{
  name: string;
  value: string;
  minLines?: number;
  placeholder?: string;
  autoFocus?: boolean;
  autoSelect?: boolean;
  autoComplete?: string;
  allowAutofillExtensions?: boolean;
  pattern?: string;
  required?: boolean;
}> = ({
  name,
  value,
  minLines,
  placeholder,
  autoFocus,
  autoSelect,
  autoComplete,
  allowAutofillExtensions,
  pattern,
  required
}) => {
  const form = useWidgetForm();
  const currentValue = form ? getFormValue(form.values, name) : undefined;
  const resolvedValue = typeof currentValue === "string" ? currentValue : value;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (!autoSelect) return;
    inputRef.current?.select();
    textareaRef.current?.select();
  }, [autoSelect]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    form?.setValue(name, event.target.value);
  };

  const sharedProps = {
    value: resolvedValue,
    onChange: handleChange,
    name,
    placeholder,
    autoFocus,
    autoComplete,
    required,
    pattern,
    "data-allow-autofill": allowAutofillExtensions ? "true" : undefined,
    className: "wg-editable"
  };

  if (minLines && minLines > 1) {
    return <textarea {...sharedProps} ref={textareaRef} rows={minLines} />;
  }

  return <input {...sharedProps} ref={inputRef} type="text" />;
};

const Text: React.FC<TextProps> = ({
  value,
  children,
  size = "md",
  weight = "normal",
  italic,
  lineThrough,
  width,
  minLines,
  color,
  editable = false,
  ...props
}) => {
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    fontSize: textSizeMap[size],
    fontWeight: resolveWeight(weight),
    fontStyle: italic ? "italic" : undefined,
    textDecoration: lineThrough ? "line-through" : undefined,
    width,
    color: resolveColor(color ?? "primary", theme),
    ...buildTextStyle({ ...props, minLines })
  };

  if (editable && editable.name) {
    return (
      <div style={style}>
        <EditableTextField value={value ?? ""} minLines={minLines} {...editable} />
      </div>
    );
  }

  return <p style={style}>{children ?? value}</p>;
};

type TitleProps = BaseTextProps & {
  size?: TitleSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string | ThemeColor;
};

const titleTrackingMap: Record<TitleSize, string> = {
  sm: "-0.006em",
  md: "-0.01em",
  lg: "-0.014em",
  xl: "-0.017em",
  "2xl": "-0.02em",
  "3xl": "-0.022em",
  "4xl": "-0.024em",
  "5xl": "-0.026em"
};

const Title: React.FC<TitleProps> = ({
  value,
  children,
  size = "md",
  weight = "semibold",
  color = "emphasis",
  ...props
}) => {
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    fontSize: titleSizeMap[size],
    fontWeight: resolveWeight(weight),
    letterSpacing: titleTrackingMap[size],
    color: resolveColor(color, theme),
    ...buildTextStyle({ ...props, lineHeight: 1.25 }),
    textWrap: "balance"
  };
  return <h3 style={style}>{children ?? value}</h3>;
};

type CaptionProps = BaseTextProps & {
  size?: CaptionSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string | ThemeColor;
};

const Caption: React.FC<CaptionProps> = ({
  value,
  children,
  size = "md",
  weight = "normal",
  color = "secondary",
  ...props
}) => {
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    fontSize: captionSizeMap[size],
    fontWeight: resolveWeight(weight),
    letterSpacing: "0.01em",
    color: resolveColor(color, theme),
    ...buildTextStyle({ ...props, lineHeight: 1.4 })
  };
  return <span style={style}>{children ?? value}</span>;
};

// react-markdown (plus its remark/rehype pipeline) is heavy; load it on demand
// so widgets without Markdown never pay for it. The fallback shows the raw
// text, which keeps content readable during the (brief) load.
const LazyMarkdownContent = React.lazy(() =>
  Promise.all([import("react-markdown"), import("remark-gfm")]).then(
    ([reactMarkdown, remarkGfm]) => ({
      default: ({ markdown }: { markdown: string }) => (
        <reactMarkdown.default remarkPlugins={[remarkGfm.default]}>
          {markdown}
        </reactMarkdown.default>
      )
    })
  )
);

const Markdown: React.FC<{ value?: string; streaming?: boolean; children?: React.ReactNode }> = ({ value, children }) => {
  const theme = useWidgetTheme();
  const markdown =
    value ??
    React.Children.toArray(children)
      .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
      .join("");
  return (
    <div
      className={
        theme === "dark"
          ? "prose prose-invert max-w-none text-sm"
          : "prose max-w-none text-sm"
      }
    >
      <React.Suspense
        fallback={<p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{markdown}</p>}
      >
        <LazyMarkdownContent markdown={markdown} />
      </React.Suspense>
    </div>
  );
};

export { Text, Title, Caption, Markdown };
export type { TextProps, TitleProps, CaptionProps };
