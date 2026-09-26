import React from "react";
import { useControlValue, fieldId } from "../binding";

import { Checkbox as UiCheckbox } from "../../components/ui/checkbox";
import { Label as UiLabel } from "../../components/ui/label";
import { Button as UiButton } from "../../components/ui/button";
import { RadioGroup as UiRadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Calendar as UiCalendar } from "../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";
import { cn } from "../../lib/utils";
import { format, isValid, parseISO, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import {
  buildChangePayload,
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
  resolveColor,
  resolveGap,
  resolveWeight
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
        gap: resolveGap(gap),
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

type InputProps = {
  name?: string;
  bind?: string;
  inputType?: "number" | "email" | "text" | "password" | "tel" | "url";
  defaultValue?: string;
  value?: string;
  onChangeAction?: ActionConfig;
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
  name: explicitName,
  bind,
  inputType = "text",
  defaultValue,
  value: controlledValue,
  onChangeAction,
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
  const action = useWidgetAction();
  const [value, setValue, name] = useControlValue({ name: explicitName, bind, value: controlledValue, defaultValue, fallback: "" });
  const height = controlHeights[size] ?? controlHeights.md;
  const paddingX = controlGutters[gutterSize ?? size] ?? controlGutters.md;

  return (
    <input
      id={fieldId(name)}
      name={name}
      type={inputType}
      className="wg-input"
      data-variant={variant}
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        if (onChangeAction && action) action(onChangeAction, buildChangePayload(name, next));
      }}
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
        borderRadius: pill ? "999px" : "var(--widget-radius-control)"
      }}
      onFocus={(event) => autoSelect && event.target.select()}
    />
  );
};

type TextareaProps = {
  name?: string;
  bind?: string;
  defaultValue?: string;
  value?: string;
  onChangeAction?: ActionConfig;
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
  name: explicitName,
  bind,
  defaultValue,
  value: controlledValue,
  onChangeAction,
  required,
  placeholder,
  autoSelect,
  autoFocus,
  disabled,
  variant = "outline",
  size = "md",
  gutterSize,
  rows = 3,
  autoResize = true,
  maxRows,
  allowAutofillExtensions
}) => {
  const action = useWidgetAction();
  const [value, setValue, name] = useControlValue({ name: explicitName, bind, value: controlledValue, defaultValue, fallback: "" });
  const height = controlHeights[size] ?? controlHeights.md;
  const paddingX = controlGutters[gutterSize ?? size] ?? controlGutters.md;

  return (
    <textarea
      id={fieldId(name)}
      name={name}
      className="wg-input"
      data-variant={variant}
      value={value}
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        if (onChangeAction && action) action(onChangeAction, buildChangePayload(name, next));
      }}
      placeholder={placeholder}
      required={required}
      autoComplete={allowAutofillExtensions ? "on" : "off"}
      autoFocus={autoFocus}
      disabled={disabled}
      rows={rows}
      style={{
        minHeight: height,
        lineHeight: 1.5,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        borderRadius: "12px",
        resize: autoResize ? "vertical" : "none",
        overflow: "auto",
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
  name?: string;
  bind?: string;
  options: SelectOption[];
  onChangeAction?: ActionConfig;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  variant?: ControlVariant;
  size?: ControlSize;
  pill?: boolean;
  block?: boolean;
  clearable?: boolean;
  disabled?: boolean;
};

const Select: React.FC<SelectProps> = ({
  name: explicitName,
  bind,
  options,
  onChangeAction,
  placeholder,
  defaultValue,
  value: controlledValue,
  variant = "outline",
  size = "md",
  pill = false,
  block,
  clearable,
  disabled
}) => {
  const action = useWidgetAction();
  const [value, setValue, name] = useControlValue({ name: explicitName, bind, value: controlledValue, defaultValue, fallback: "" });
  const height = controlHeights[size] ?? controlHeights.md;

  let clearValue = "__widget_clear_selection__";
  while (options.some((option) => option.value === clearValue)) clearValue += "_";

  const handleValueChange = (selectedValue: string) => {
    const next = clearable && selectedValue === clearValue ? "" : selectedValue;
    setValue(next);
    if (onChangeAction && action) {
      const option = options.find((item) => item.value === next);
      action(onChangeAction, buildChangePayload(name, next, { option }));
    }
  };

  return (
    <UiSelect value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        id={fieldId(name)}
        className="wg-input shadow-none"
        data-variant={variant}
        style={{
          height,
          borderRadius: pill ? "999px" : "var(--widget-radius-control)",
          width: block ? "100%" : undefined
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {clearable && (
          <SelectItem value={clearValue}>
            <SelectItemText>Clear selection</SelectItemText>
          </SelectItem>
        )}
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="items-start"
          >
            <div className="flex flex-col gap-0.5">
              <SelectItemText>{option.label}</SelectItemText>
              {option.description ? (
                <span
                  className="text-xs"
                  style={{ color: "var(--widget-text-secondary)" }}
                >
                  {option.description}
                </span>
              ) : null}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </UiSelect>
  );
};

type DatePickerProps = {
  name?: string;
  bind?: string;
  onChangeAction?: ActionConfig;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  min?: string;
  max?: string;
  variant?: ControlVariant;
  size?: ControlSize;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  pill?: boolean;
  block?: boolean;
  clearable?: boolean;
  disabled?: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({
  name: explicitName,
  bind,
  onChangeAction,
  placeholder,
  defaultValue,
  value: controlledValue,
  min,
  max,
  variant = "outline",
  size = "md",
  side,
  align,
  pill,
  block,
  clearable,
  disabled
}) => {
  const action = useWidgetAction();
  const [value, setValue, name] = useControlValue({ name: explicitName, bind, value: controlledValue, defaultValue, fallback: "" });
  const [open, setOpen] = React.useState(false);
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
      : "";
  const variantStyle: React.CSSProperties =
    variant === "ghost"
      ? {}
      : {
          background:
            variant === "soft" ? "var(--widget-surface-secondary)" : "var(--widget-surface)",
          borderColor: "var(--widget-border-default)",
          color: "var(--widget-text-primary)"
        };

  const buttonVariant =
    variant === "ghost"
      ? "ghost"
      : variant === "soft"
      ? "secondary"
      : variant === "outline"
      ? "outline"
      : "default";

  const resolvedDate = (() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  })();

  const minDate = (() => {
    if (!min) return undefined;
    const parsed = parseISO(min);
    return isValid(parsed) ? startOfDay(parsed) : undefined;
  })();

  const maxDate = (() => {
    if (!max) return undefined;
    const parsed = parseISO(max);
    return isValid(parsed) ? startOfDay(parsed) : undefined;
  })();

  const isDayDisabled = (day: Date) => {
    const normalized = startOfDay(day);
    if (minDate && normalized < minDate) return true;
    if (maxDate && normalized > maxDate) return true;
    return false;
  };

  const handleClear = () => {
    setValue("");
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, "", { date: undefined }));
    }
  };

  return (
    <div className="flex min-w-0 max-w-full items-center gap-2" style={{ width: block ? "100%" : undefined }}>
      <div className={cn("relative min-w-0 max-w-full", block ? "w-full" : "w-auto")} style={block ? undefined : { width }}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <UiButton
              id={fieldId(name)}
              type="button"
              variant={buttonVariant as "default" | "secondary" | "outline" | "ghost"}
              disabled={disabled}
              className={cn(
                "wg-field-control min-w-0 max-w-full justify-between font-normal cursor-pointer",
                variantClasses
              )}
              style={{
                height,
                width: block ? "100%" : width,
                borderRadius: pill ? "999px" : "var(--widget-radius-control)",
                ...variantStyle
              }}
            >
              <span
                className="min-w-0 truncate"
                style={
                  resolvedDate ? undefined : { color: "var(--widget-text-tertiary)" }
                }
              >
                {resolvedDate
                  ? format(resolvedDate, "PPP")
                  : (placeholder ?? "Pick a date")}
              </span>
              <CalendarIcon
                className="h-4 w-4"
                style={{ color: "var(--widget-text-secondary)" }}
              />
            </UiButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0 z-[9999]"
            align={align ?? "start"}
            side={side ?? "bottom"}
          >
            <UiCalendar
              mode="single"
              selected={resolvedDate}
              captionLayout="dropdown"
              onSelect={(next: Date | undefined) => {
                if (!next) return;
                const nextValue = format(next, "yyyy-MM-dd");
                setValue(nextValue);
                if (onChangeAction && action) {
                  action(onChangeAction, buildChangePayload(name, nextValue, { date: next }));
                }
                setOpen(false);
              }}
              disabled={isDayDisabled}
            />
          </PopoverContent>
        </Popover>
      </div>
      {clearable && value ? (
        <UiButton
          type="button"
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={handleClear}
        >
          Clear
        </UiButton>
      ) : null}
    </div>
  );
};

type CheckboxProps = {
  name?: string;
  bind?: string;
  label?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChangeAction?: ActionConfig;
  disabled?: boolean;
  required?: boolean;
};

const Checkbox: React.FC<CheckboxProps> = ({
  name: explicitName,
  bind,
  checked: controlledChecked,
  label,
  defaultChecked,
  onChangeAction,
  disabled,
  required
}) => {
  const action = useWidgetAction();
  const [resolvedChecked, setChecked, name] = useControlValue({ name: explicitName, bind, value: controlledChecked, defaultValue: defaultChecked, fallback: false });

  const handleCheckedChange = (next: boolean) => {
    setChecked(next);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, next, { checked: next }));
    }
  };

  return (
    <label
      className="flex items-center gap-2 text-sm"
      style={{ color: "var(--widget-text-primary)" }}
    >
      <UiCheckbox
        id={fieldId(name)}
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
  name?: string;
  bind?: string;
  options?: { label: string; value: string; disabled?: boolean }[];
  ariaLabel?: string;
  onChangeAction?: ActionConfig;
  defaultValue?: string;
  value?: string;
  direction?: "row" | "col";
  disabled?: boolean;
  required?: boolean;
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  name: explicitName,
  bind,
  options,
  ariaLabel,
  onChangeAction,
  defaultValue,
  value: controlledValue,
  direction = "row",
  disabled,
  required
}) => {
  const action = useWidgetAction();
  const [value, setValue, name] = useControlValue({ name: explicitName, bind, value: controlledValue, defaultValue, fallback: "" });

  const handleChange = (next: string) => {
    setValue(next);
    if (onChangeAction && action) {
      const option = options?.find((item) => item.value === next);
      action(onChangeAction, buildChangePayload(name, next, { option }));
    }
  };

  return (
    <UiRadioGroup
      id={fieldId(name)}
      aria-label={ariaLabel ?? name}
      value={value}
      onValueChange={handleChange}
      className={`flex ${direction === "row" ? "flex-row flex-wrap" : "flex-col"} gap-2`}
      disabled={disabled}
      required={required}
    >
      {options?.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm"
          style={{ color: "var(--widget-text-primary)" }}
        >
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
    fontWeight: resolveWeight(weight),
    textAlign: textAlign === "start" ? "left" : textAlign === "end" ? "right" : textAlign,
    color: resolveColor(color, theme)
  };
  return (
    <UiLabel htmlFor={fieldId(fieldName)} style={style}>
      {value}
    </UiLabel>
  );
};

export { Form, Input, Textarea, Select, DatePicker, Checkbox, RadioGroup, Label };
