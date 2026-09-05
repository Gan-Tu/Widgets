import React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger
} from "../../components/ui/menubar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "../../components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";
import { Toggle as UiToggle } from "../../components/ui/toggle";
import { ToggleGroup as UiToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import { Slider as UiSlider } from "../../components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../../components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "../../components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../../components/ui/command";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "../../components/ui/input-otp";
import { Spinner as UiSpinner } from "../../components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Button as UiButton } from "../../components/ui/button";
import { cn } from "../../lib/utils";

import { useFormDefaultValue, buildChangePayload, getFormValue, useWidgetAction, useWidgetForm } from "../context";

type AccordionProps = {
  items: { id: string; title: string; content: string }[];
  type?: "single" | "multiple";
  collapsible?: boolean;
};

const AccordionWidget: React.FC<AccordionProps> = ({
  items,
  type = "single",
  collapsible = true
}) => (
  <Accordion type={type} collapsible={type === "single" ? collapsible : undefined} className="w-full">
    {items.map((item) => (
      <AccordionItem key={item.id} value={item.id}>
        <AccordionTrigger>{item.title}</AccordionTrigger>
        <AccordionContent>{item.content}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

type CollapsibleProps = {
  title: string;
  content: string;
  defaultOpen?: boolean;
};

const CollapsibleWidget: React.FC<CollapsibleProps> = ({ title, content, defaultOpen }) => (
  <Collapsible
    defaultOpen={defaultOpen}
    className="w-full rounded-xl border p-3"
    style={{ borderColor: "var(--widget-border-default)" }}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium" style={{ color: "var(--widget-text-primary)" }}>
        {title}
      </span>
      <CollapsibleTrigger asChild>
        <UiButton size="sm" variant="outline">
          Toggle
        </UiButton>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="mt-3 text-sm" style={{ color: "var(--widget-text-secondary)" }}>
      {content}
    </CollapsibleContent>
  </Collapsible>
);

type MenuItem = {
  id: string;
  label: string;
  disabled?: boolean;
  action?: { type: string; payload?: Record<string, unknown> };
  type?: "item" | "separator";
};

type MenubarProps = {
  menus: { id: string; label: string; items: MenuItem[] }[];
};

const MenubarWidget: React.FC<MenubarProps> = ({ menus }) => {
  const action = useWidgetAction();

  return (
    <Menubar>
      {menus.map((menu) => (
        <MenubarMenu key={menu.id}>
          <MenubarTrigger>{menu.label}</MenubarTrigger>
          <MenubarContent>
            {menu.items.map((item) =>
              item.type === "separator" ? (
                <MenubarSeparator key={item.id} />
              ) : (
                <MenubarItem
                  key={item.id}
                  disabled={item.disabled}
                  onSelect={() => {
                    if (item.action && action) action(item.action);
                  }}
                >
                  {item.label}
                </MenubarItem>
              )
            )}
          </MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
};

type ContextMenuProps = {
  triggerLabel: string;
  items: MenuItem[];
};

const ContextMenuWidget: React.FC<ContextMenuProps> = ({ triggerLabel, items }) => {
  const action = useWidgetAction();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="rounded-lg border border-dashed p-3 text-sm"
          style={{
            borderColor: "var(--widget-border-strong)",
            color: "var(--widget-text-secondary)"
          }}
        >
          {triggerLabel}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {items.map((item) =>
          item.type === "separator" ? (
            <ContextMenuSeparator key={item.id} />
          ) : (
            <ContextMenuItem
              key={item.id}
              disabled={item.disabled}
              onSelect={() => {
                if (item.action && action) action(item.action);
              }}
            >
              {item.label}
            </ContextMenuItem>
          )
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

type TooltipProps = {
  label: string;
  content: string;
  delayDuration?: number;
};

const TooltipWidget: React.FC<TooltipProps> = ({ label, content, delayDuration = 150 }) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="self-start rounded-sm cursor-pointer text-sm underline decoration-dotted underline-offset-2"
          style={{
            color: "var(--widget-text-primary)",
            textDecorationColor: "var(--widget-text-tertiary)"
          }}
        >
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

type ToggleProps = {
  name?: string;
  label: string;
  variant?: "button" | "switch";
  defaultPressed?: boolean;
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const ToggleWidget: React.FC<ToggleProps> = ({
  name,
  label,
  variant = "button",
  defaultPressed,
  disabled,
  onChangeAction
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [pressed, setPressed] = React.useState(defaultPressed ?? false);
  useFormDefaultValue(name, defaultPressed);
  const storedPressed = name && form ? getFormValue(form.values, name) : undefined;
  const resolvedPressed = storedPressed === undefined ? pressed : Boolean(storedPressed);

  const handlePressedChange = (next: boolean) => {
    setPressed(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, next, { pressed: next }));
    }
  };

  if (variant === "switch") {
    return (
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={resolvedPressed}
        disabled={disabled}
        className="wg-switch"
        onClick={() => handlePressedChange(!resolvedPressed)}
      >
        <span aria-hidden />
      </button>
    );
  }

  return (
    <UiToggle
      pressed={resolvedPressed}
      onPressedChange={handlePressedChange}
      disabled={disabled}
    >
      {label}
    </UiToggle>
  );
};

type ToggleGroupOption = { value: string; label: string; disabled?: boolean };
type ToggleGroupProps = {
  name?: string;
  type?: "single" | "multiple";
  options: ToggleGroupOption[];
  defaultValue?: string;
  defaultValues?: string[];
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const ToggleGroupWidget: React.FC<ToggleGroupProps> = ({
  name,
  type = "single",
  options,
  defaultValue,
  defaultValues,
  disabled,
  onChangeAction
}) => {
  useFormDefaultValue(name, type === "multiple" ? defaultValues : defaultValue);
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [value, setValue] = React.useState<string | string[]>(
    type === "multiple" ? defaultValues ?? [] : defaultValue ?? ""
  );

  const resolvedValue =
    name && form ? (getFormValue(form.values, name) as string | string[] | undefined) ?? value : value;

  const handleSingleChange = (next: string) => {
    setValue(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, next));
    }
  };

  const handleMultipleChange = (next: string[]) => {
    setValue(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, next));
    }
  };

  if (type === "multiple") {
    return (
      <UiToggleGroup
        type="multiple"
        value={resolvedValue as string[]}
        onValueChange={handleMultipleChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </UiToggleGroup>
    );
  }

  return (
    <UiToggleGroup
      type="single"
      value={resolvedValue as string}
      onValueChange={handleSingleChange}
      disabled={disabled}
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </UiToggleGroup>
  );
};

type SliderProps = {
  name?: string;
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const SliderWidget: React.FC<SliderProps> = ({
  name,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onChangeAction
}) => {
  useFormDefaultValue(name, Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [value, setValue] = React.useState<number[]>(
    Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  );
  const resolvedValue =
    name && form ? (getFormValue(form.values, name) as number[] | undefined) ?? value : value;

  const handleValueChange = (next: number[]) => {
    setValue(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, next));
    }
  };

  return (
    <UiSlider
      value={resolvedValue}
      onValueChange={handleValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    />
  );
};

type SheetProps = {
  triggerLabel: string;
  title?: string;
  description?: string;
  content?: string;
  side?: "left" | "right" | "top" | "bottom";
};

const SheetWidget: React.FC<SheetProps> = ({
  triggerLabel,
  title,
  description,
  content,
  side = "right"
}) => (
  <Sheet>
    <SheetTrigger asChild>
      <UiButton variant="outline">{triggerLabel}</UiButton>
    </SheetTrigger>
    <SheetContent side={side} {...(!description ? { "aria-describedby": undefined } : {})}>
      <SheetHeader>
        <SheetTitle className={title ? undefined : "sr-only"}>{title ?? "Details"}</SheetTitle>
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </SheetHeader>
      {content ? (
        <div className="mt-4 px-4 text-sm" style={{ color: "var(--widget-text-secondary)" }}>
          {content}
        </div>
      ) : null}
    </SheetContent>
  </Sheet>
);

type DrawerProps = {
  triggerLabel: string;
  title?: string;
  description?: string;
  content?: string;
};

const DrawerWidget: React.FC<DrawerProps> = ({ triggerLabel, title, description, content }) => (
  <Drawer>
    <DrawerTrigger asChild>
      <UiButton variant="outline">{triggerLabel}</UiButton>
    </DrawerTrigger>
    <DrawerContent {...(!description ? { "aria-describedby": undefined } : {})}>
      <DrawerHeader>
        <DrawerTitle className={title ? undefined : "sr-only"}>{title ?? "Details"}</DrawerTitle>
        {description ? <DrawerDescription>{description}</DrawerDescription> : null}
      </DrawerHeader>
      {content ? (
        <div className="mt-2 px-4 pb-4 text-sm" style={{ color: "var(--widget-text-secondary)" }}>
          {content}
        </div>
      ) : null}
    </DrawerContent>
  </Drawer>
);

type ComboboxOption = { value: string; label: string };
type ComboboxProps = {
  name?: string;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  defaultValue?: string;
  block?: boolean;
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const ComboboxWidget: React.FC<ComboboxProps> = ({
  name,
  options,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  emptyLabel = "No results found.",
  defaultValue,
  block = false,
  disabled,
  onChangeAction
}) => {
  useFormDefaultValue(name, defaultValue);
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue ?? "");
  const selected =
    name && form ? (getFormValue(form.values, name) as string | undefined) ?? value : value;
  const selectedLabel = options.find((option) => option.value === selected)?.label;

  const handleSelect = (next: string) => {
    const resolved = next === selected ? "" : next;
    setValue(resolved);
    if (name && form) form.setValue(name, resolved);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, resolved));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <UiButton
          id={name}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("wg-field-control h-8 min-w-0 max-w-full justify-between", block ? "w-full" : "w-[220px]", disabled && "opacity-50")}
          disabled={disabled}
        >
          <span className="min-w-0 truncate">{selectedLabel ?? placeholder}</span>
          <span className="ml-2 shrink-0 text-xs text-[var(--widget-text-secondary)]" aria-hidden>⌄</span>
        </UiButton>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type InputOtpProps = {
  name?: string;
  ariaLabel?: string;
  length?: number;
  groupSize?: number;
  defaultValue?: string;
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const InputOtpWidget: React.FC<InputOtpProps> = ({
  name,
  ariaLabel = "Verification code",
  length = 6,
  groupSize = 3,
  defaultValue = "",
  disabled,
  onChangeAction
}) => {
  useFormDefaultValue(name, defaultValue);
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [value, setValue] = React.useState(defaultValue);
  const resolved = name && form ? (getFormValue(form.values, name) as string | undefined) ?? value : value;

  const handleChange = (next: string) => {
    setValue(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) {
      action(onChangeAction, buildChangePayload(name, next));
    }
  };

  const slots = Array.from({ length }, (_, index) => index);

  return (
    <InputOTP
      id={name}
      aria-label={ariaLabel}
      maxLength={length}
      value={resolved}
      onChange={handleChange}
      disabled={disabled}
      autoComplete="off"
      inputMode="numeric"
      pushPasswordManagerStrategy="none"
      data-1p-ignore="true"
      data-form-type="other"
      data-lpignore="true"
    >
      <InputOTPGroup>
        {slots.map((slotIndex) => {
          const showSeparator = groupSize > 0 && slotIndex > 0 && slotIndex % groupSize === 0;
          return (
            <React.Fragment key={slotIndex}>
              {showSeparator ? <InputOTPSeparator /> : null}
              <InputOTPSlot index={slotIndex} />
            </React.Fragment>
          );
        })}
      </InputOTPGroup>
    </InputOTP>
  );
};

type SpinnerProps = { size?: "xs" | "sm" | "md" | "lg"; label?: string };

const SpinnerWidget: React.FC<SpinnerProps> = ({ size = "md", label }) => (
  <div
    className="flex items-center gap-2 text-sm"
    style={{ color: "var(--widget-text-secondary)" }}
  >
    <UiSpinner size={size} />
    {label ? <span>{label}</span> : null}
  </div>
);

type DataTableProps = {
  columns: { key: string; label: string; align?: "start" | "center" | "end" }[];
  rows: Record<string, string | number>[];
  caption?: string;
};

const DataTableWidget: React.FC<DataTableProps> = ({ columns, rows, caption }) => (
  <Table>
    {caption ? (
      <caption className="mt-2 text-xs" style={{ color: "var(--widget-text-secondary)" }}>
        {caption}
      </caption>
    ) : null}
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={column.key}
            className={cn(
              column.align === "center" && "text-center",
              column.align === "end" && "text-right"
            )}
          >
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              className={cn(
                column.align === "center" && "text-center",
                column.align === "end" && "text-right"
              )}
            >
              {row[column.key] ?? "—"}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export {
  AccordionWidget as Accordion,
  CollapsibleWidget as Collapsible,
  MenubarWidget as Menubar,
  ContextMenuWidget as ContextMenu,
  TooltipWidget as Tooltip,
  ToggleWidget as Toggle,
  ToggleGroupWidget as ToggleGroup,
  SliderWidget as Slider,
  SheetWidget as Sheet,
  DrawerWidget as Drawer,
  ComboboxWidget as Combobox,
  InputOtpWidget as InputOTP,
  SpinnerWidget as Spinner,
  DataTableWidget as DataTable
};
