import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getFormValue, useWidgetForm, useWidgetTheme } from "../context";
import type {
  BaseTextProps,
  CaptionSize,
  TextAlign,
  TextSize,
  ThemeColor,
  TitleSize
} from "../types";
import { resolveColor } from "../style";

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
  minLines
}: {
  textAlign?: TextAlign;
  truncate?: boolean;
  maxLines?: number;
  minLines?: number;
}) {
  const style: React.CSSProperties = {
    textAlign: textAlign === "start" ? "left" : textAlign === "end" ? "right" : textAlign,
    lineHeight: 1.4
  };

  if (truncate) {
    style.whiteSpace = "nowrap";
    style.overflow = "hidden";
    style.textOverflow = "ellipsis";
  }

  if (maxLines !== undefined) {
    style.display = "-webkit-box";
    style.WebkitLineClamp = maxLines;
    style.WebkitBoxOrient = "vertical";
    style.overflow = "hidden";
  }

  if (minLines !== undefined) {
    style.minHeight = `${minLines * 1.4}em`;
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
    className:
      "w-full rounded-md border border-transparent bg-transparent px-0 py-0 text-inherit outline-none focus:border-slate-200 focus:bg-white focus:px-2 focus:py-1"
  };

  if (minLines && minLines > 1) {
    return <textarea {...sharedProps} ref={textareaRef} rows={minLines} />;
  }

  return <input {...sharedProps} ref={inputRef} type="text" />;
};

const Text: React.FC<TextProps> = ({
  value,
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
    fontWeight: weight,
    fontStyle: italic ? "italic" : undefined,
    textDecoration: lineThrough ? "line-through" : undefined,
    width,
    color: resolveColor(color ?? "primary", theme),
    ...buildTextStyle({ ...props, minLines })
  };

  if (editable && editable.name) {
    return (
      <div style={style}>
        <EditableTextField value={value} minLines={minLines} {...editable} />
      </div>
    );
  }

  return <p style={style}>{value}</p>;
};

type TitleProps = BaseTextProps & {
  size?: TitleSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string | ThemeColor;
};

const Title: React.FC<TitleProps> = ({
  value,
  size = "md",
  weight = "medium",
  color = "prose",
  ...props
}) => {
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    fontSize: titleSizeMap[size],
    fontWeight: weight,
    color: resolveColor(color, theme),
    ...buildTextStyle(props)
  };
  return <h3 style={style}>{value}</h3>;
};

type CaptionProps = BaseTextProps & {
  size?: CaptionSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: string | ThemeColor;
};

const Caption: React.FC<CaptionProps> = ({
  value,
  size = "md",
  weight = "normal",
  color = "secondary",
  ...props
}) => {
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    fontSize: captionSizeMap[size],
    fontWeight: weight,
    letterSpacing: "0.01em",
    color: resolveColor(color, theme),
    ...buildTextStyle(props)
  };
  return <span style={style}>{value}</span>;
};

const Markdown: React.FC<{ value: string; streaming?: boolean }> = ({ value }) => {
  const theme = useWidgetTheme();
  return (
    <div
      className={
        theme === "dark"
          ? "prose prose-invert max-w-none text-sm"
          : "prose max-w-none text-sm"
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
    </div>
  );
};

export { Text, Title, Caption, Markdown };
export type { TextProps, TitleProps, CaptionProps };
