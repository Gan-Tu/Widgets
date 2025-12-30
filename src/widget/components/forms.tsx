import React from "react";

import { Checkbox as UiCheckbox } from "@/components/ui/checkbox";
import { Input as UiInput } from "@/components/ui/input";
import { Label as UiLabel } from "@/components/ui/label";
import { Button as UiButton } from "@/components/ui/button";
import { RadioGroup as UiRadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea as UiTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  getFormValue,
  useWidgetAction,
  useWidgetForm,
  useWidgetTheme,
  WidgetFormProvider
} from "../context";
import type {
  ActionConfig,
  Alignment,
  ControlSize,
  ControlVariant,
  Justification,
  Padding,
  TextAlign,
  TextSize,
  ThemeColor
} from "../types";
import {
  buildBlockStyles,
  resolveAlign,
  resolveJustify
} from "./layout";
import {
  controlGutters,
  controlHeights,
  resolveColor
} from "../style";

type FormProps = React.PropsWithChildren<{
  onSubmitAction?: ActionConfig;
  direction?: "row" | "col";
  align?: Alignment;
  justify?: Justification;
  gap?: number | string;
  padding?: number | string | Padding;
}>;

const FormInner: React.FC<FormProps> = ({
  onSubmitAction,
  children,
  direction = "col",
  align,
  justify,
  gap,
  padding
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const theme = useWidgetTheme();
  const style = buildBlockStyles(
    { direction, align, justify, gap, padding },
    theme
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (onSubmitAction && action) {
      action(onSubmitAction, form?.values ?? {});
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: direction === "row" ? "row" : "column",
        alignItems: resolveAlign(align),
        justifyContent: resolveJustify(justify),
        gap: gap ?? "var(--widget-gap)",
        ...style
      }}
    >
      {children}
    </form>
  );
};

const Form: React.FC<FormProps> = (props) => {
  return (
    <WidgetFormProvider>
      <FormInner {...props} />
    </WidgetFormProvider>
  );
};

function useFieldValue(name: string, defaultValue?: string) {
  const form = useWidgetForm();
  const [localValue, setLocalValue] = React.useState(defaultValue ?? "");
  const formValue = form ? getFormValue(form.values, name) : undefined;
  const value = typeof formValue === "string" ? formValue : localValue;

  const update = (next: string) => {
    setLocalValue(next);
    form?.setValue(name, next);
  };

  React.useEffect(() => {
    if (defaultValue !== undefined && form && formValue === undefined) {
      form.setValue(name, defaultValue);
    }
  }, [defaultValue, form, formValue, name]);

  return [value, update] as const;
}

type InputProps = {
  name: string;
  inputType?: "number" | "email" | "text" | "password" | "tel" | "url";
  defaultValue?: string;
  variant?: "soft" | "outline";
  size?: ControlSize;
  gutterSize?: keyof typeof controlGutters;
  required?: boolean;
  pattern?: string;
  placeholder?: string;
  allowAutofillExtensions?: boolean;
  autoSelect?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  pill?: boolean;
};

const Input: React.FC<InputProps> = ({
  name,
  inputType = "text",
  defaultValue,
  variant = "outline",
  size = "md",
  gutterSize,
  required,
  pattern,
  placeholder,
  allowAutofillExtensions,
  autoSelect,
  autoFocus,
  disabled,
  pill
}) => {
  const [value, setValue] = useFieldValue(name, defaultValue);
  const height = controlHeights[size] ?? controlHeights.md;
  const gutterKey =
    gutterSize ?? (controlGutters[size as keyof typeof controlGutters] ? size : "md");
  const paddingX = controlGutters[gutterKey as keyof typeof controlGutters] ?? "12px";

  return (
    <UiInput
      name={name}
      type={inputType}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      required={required}
      pattern={pattern}
      autoComplete={allowAutofillExtensions ? "on" : "off"}
      autoFocus={autoFocus}
      disabled={disabled}
      style={{
        height,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        borderRadius: pill ? "999px" : "10px",
        borderColor: variant === "outline" ? "#e2e8f0" : "transparent",
        background: variant === "soft" ? "#f8fafc" : "#ffffff"
      }}
      onFocus={(event) => autoSelect && event.target.select()}
    />
  );
};

type TextareaProps = {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  autoSelect?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  variant?: "soft" | "outline";
  size?: ControlSize;
  gutterSize?: keyof typeof controlGutters;
  rows?: number;
  autoResize?: boolean;
  maxRows?: number;
  allowAutofillExtensions?: boolean;
};

const Textarea: React.FC<TextareaProps> = ({
  name,
  defaultValue,
  required,
  placeholder,
  autoSelect,
  autoFocus,
  disabled,
  variant = "outline",
  size = "md",
  gutterSize,
  rows = 3,
  autoResize,
  maxRows,
  allowAutofillExtensions
}) => {
  const [value, setValue] = useFieldValue(name, defaultValue);
  const height = controlHeights[size] ?? controlHeights.md;
  const gutterKey =
    gutterSize ?? (controlGutters[size as keyof typeof controlGutters] ? size : "md");
  const paddingX = controlGutters[gutterKey as keyof typeof controlGutters] ?? "12px";

  return (
    <UiTextarea
      name={name}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      required={required}
      autoComplete={allowAutofillExtensions ? "on" : "off"}
      autoFocus={autoFocus}
      disabled={disabled}
      rows={rows}
      style={{
        minHeight: height,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        borderRadius: "12px",
        borderColor: variant === "outline" ? "#e2e8f0" : "transparent",
        background: variant === "soft" ? "#f8fafc" : "#ffffff",
        resize: autoResize ? "vertical" : "none",
        maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined
      }}
      onFocus={(event) => autoSelect && event.target.select()}
    />
  );
};

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
};

type SelectProps = {
  name: string;
  options: SelectOption[];
  onChangeAction?: ActionConfig;
  placeholder?: string;
  defaultValue?: string;
  variant?: ControlVariant;
  size?: ControlSize;
  pill?: boolean;
  block?: boolean;
  clearable?: boolean;
  disabled?: boolean;
};

const Select: React.FC<SelectProps> = ({
  name,
  options,
  onChangeAction,
  placeholder,
  defaultValue,
  variant = "outline",
  size = "md",
  pill = false,
  block,
  clearable,
  disabled
}) => {
  const action = useWidgetAction();
  const [value, setValue] = useFieldValue(name, defaultValue);
  const height = controlHeights[size] ?? controlHeights.md;

  const handleValueChange = (next: string) => {
    setValue(next);
    if (onChangeAction && action) {
      action(onChangeAction, { [name]: next });
    }
  };

  return (
    <UiSelect value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        style={{
          height,
          borderRadius: pill ? "999px" : "10px",
          width: block ? "100%" : undefined,
          borderColor: variant === "outline" ? "#e2e8f0" : "transparent",
          background: variant === "ghost" ? "transparent" : "#ffffff"
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {clearable && (
          <SelectItem value="">Clear</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-slate-500">{option.description}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
};

type DatePickerProps = {
  name: string;
  onChangeAction?: ActionConfig;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  variant?: ControlVariant;
  size?: ControlSize;
  pill?: boolean;
  block?: boolean;
  clearable?: boolean;
  disabled?: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({
  name,
  onChangeAction,
  placeholder,
  defaultValue,
  min,
  max,
  variant = "outline",
  size = "md",
  pill,
  block,
  clearable,
  disabled
}) => {
  const action = useWidgetAction();
  const [value, setValue] = useFieldValue(name, defaultValue);
  const height = controlHeights[size] ?? controlHeights.md;
  const width =
    size === "sm"
      ? "180px"
      : size === "lg"
      ? "240px"
      : size === "xl"
      ? "260px"
      : "200px";
  const variantClasses =
    variant === "ghost"
      ? "border-transparent bg-transparent shadow-none"
      : variant === "soft"
      ? "bg-slate-50 border-slate-200"
      : "bg-white border-slate-200";

  const handleClear = () => {
    setValue("");
    if (onChangeAction && action) {
      action(onChangeAction, { [name]: "" });
    }
  };

  return (
    <div className="flex items-center gap-2" style={{ width: block ? "100%" : undefined }}>
      <div className={cn("relative", block ? "w-full" : "w-auto")} style={block ? undefined : { width }}>
        <UiInput
          type="date"
          value={value}
          placeholder={placeholder}
          className={cn(variantClasses, "pr-9", block && "w-full")}
          style={{
            height,
            borderRadius: pill ? "999px" : "10px"
          }}
          disabled={disabled}
          min={min}
          max={max}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            if (onChangeAction && action) {
              action(onChangeAction, { [name]: nextValue });
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
            }
          }}
        />
      </div>
      {clearable && value ? (
        <UiButton type="button" variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </UiButton>
      ) : null}
    </div>
  );
};

type CheckboxProps = {
  name: string;
  label?: string;
  defaultChecked?: boolean;
  onChangeAction?: ActionConfig;
  disabled?: boolean;
  required?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label,
  defaultChecked,
  onChangeAction,
  disabled,
  required
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [checked, setChecked] = React.useState(defaultChecked ?? false);
  const resolvedChecked = form ? Boolean(getFormValue(form.values, name)) : checked;

  const handleCheckedChange = (next: boolean) => {
    setChecked(next);
    form?.setValue(name, next);
    if (onChangeAction && action) {
      action(onChangeAction, { [name]: next });
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <UiCheckbox
        name={name}
        checked={resolvedChecked}
        onCheckedChange={(next) => handleCheckedChange(Boolean(next))}
        disabled={disabled}
        required={required}
      />
      {label}
    </label>
  );
};

type RadioGroupProps = {
  name: string;
  options?: { label: string; value: string; disabled?: boolean }[];
  ariaLabel?: string;
  onChangeAction?: ActionConfig;
  defaultValue?: string;
  direction?: "row" | "col";
  disabled?: boolean;
  required?: boolean;
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  ariaLabel,
  onChangeAction,
  defaultValue,
  direction = "row",
  disabled,
  required
}) => {
  const action = useWidgetAction();
  const [value, setValue] = useFieldValue(name, defaultValue);

  const handleChange = (next: string) => {
    setValue(next);
    if (onChangeAction && action) {
      action(onChangeAction, { [name]: next });
    }
  };

  return (
    <UiRadioGroup
      aria-label={ariaLabel ?? name}
      value={value}
      onValueChange={handleChange}
      className={`flex ${direction === "row" ? "flex-row" : "flex-col"} gap-2`}
      disabled={disabled}
      required={required}
    >
      {options?.map((option) => (
        <label key={option.value} className="flex items-center gap-2 text-sm text-slate-700">
          <RadioGroupItem value={option.value} disabled={disabled || option.disabled} />
          {option.label}
        </label>
      ))}
    </UiRadioGroup>
  );
};

type LabelProps = {
  value: string;
  fieldName: string;
  size?: TextSize;
  weight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: TextAlign;
  color?: string | ThemeColor;
};

const Label: React.FC<LabelProps> = ({
  value,
  fieldName,
  size = "sm",
  weight = "medium",
  textAlign = "start",
  color = "secondary"
}) => {
  const theme = useWidgetTheme();
  const style: React.CSSProperties = {
    fontSize: size === "xs" ? "0.7rem" : size === "lg" ? "0.95rem" : "0.8rem",
    fontWeight: weight,
    textAlign: textAlign === "start" ? "left" : textAlign === "end" ? "right" : textAlign,
    color: resolveColor(color, theme)
  };
  return (
    <UiLabel htmlFor={fieldName} style={style}>
      {value}
    </UiLabel>
  );
};

export { Form, Input, Textarea, Select, DatePicker, Checkbox, RadioGroup, Label };
