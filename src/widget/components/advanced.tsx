import React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger
} from "@/components/ui/menubar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Toggle as UiToggle } from "@/components/ui/toggle";
import { ToggleGroup as UiToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider as UiSlider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Spinner as UiSpinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button as UiButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getFormValue, useWidgetAction, useWidgetForm } from "../context";

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
  <Collapsible defaultOpen={defaultOpen} className="w-full rounded-lg border border-slate-200 p-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700">{title}</span>
      <CollapsibleTrigger asChild>
        <UiButton size="sm" variant="outline">
          Toggle
        </UiButton>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="mt-3 text-sm text-slate-600">
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
        <div className="rounded-md border border-dashed border-slate-200 p-3 text-sm text-slate-600">
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
};

const TooltipWidget: React.FC<TooltipProps> = ({ label, content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-sm text-slate-700 underline decoration-dotted">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{content}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

type ToggleProps = {
  name?: string;
  label: string;
  defaultPressed?: boolean;
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const ToggleWidget: React.FC<ToggleProps> = ({
  name,
  label,
  defaultPressed,
  disabled,
  onChangeAction
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [pressed, setPressed] = React.useState(defaultPressed ?? false);
  const resolvedPressed =
    typeof name === "string" && form ? Boolean(getFormValue(form.values, name)) : pressed;

  const handlePressedChange = (next: boolean) => {
    setPressed(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) action(onChangeAction, { [name ?? "value"]: next });
  };

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
    if (onChangeAction && action) action(onChangeAction, { [name ?? "value"]: next });
  };

  const handleMultipleChange = (next: string[]) => {
    setValue(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) action(onChangeAction, { [name ?? "value"]: next });
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
    if (onChangeAction && action) action(onChangeAction, { [name ?? "value"]: next });
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
    <SheetContent side={side}>
      <SheetHeader>
        {title ? <SheetTitle>{title}</SheetTitle> : null}
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </SheetHeader>
      {content ? <div className="mt-4 text-sm text-slate-600">{content}</div> : null}
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
    <DrawerContent>
      <DrawerHeader>
        {title ? <DrawerTitle>{title}</DrawerTitle> : null}
        {description ? <DrawerDescription>{description}</DrawerDescription> : null}
      </DrawerHeader>
      {content ? <div className="mt-4 text-sm text-slate-600">{content}</div> : null}
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
  disabled,
  onChangeAction
}) => {
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
    if (onChangeAction && action) action(onChangeAction, { [name ?? "value"]: resolved });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <UiButton
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[220px] justify-between", disabled && "opacity-50")}
          disabled={disabled}
        >
          {selectedLabel ?? placeholder}
          <span className="ml-2 text-xs text-slate-400">⌄</span>
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
  length?: number;
  groupSize?: number;
  defaultValue?: string;
  disabled?: boolean;
  onChangeAction?: { type: string; payload?: Record<string, unknown> };
};

const InputOtpWidget: React.FC<InputOtpProps> = ({
  name,
  length = 6,
  groupSize = 3,
  defaultValue = "",
  disabled,
  onChangeAction
}) => {
  const action = useWidgetAction();
  const form = useWidgetForm();
  const [value, setValue] = React.useState(defaultValue);
  const resolved = name && form ? (getFormValue(form.values, name) as string | undefined) ?? value : value;

  const handleChange = (next: string) => {
    setValue(next);
    if (name && form) form.setValue(name, next);
    if (onChangeAction && action) action(onChangeAction, { [name ?? "value"]: next });
  };

  const slots = Array.from({ length }, (_, index) => index);

  return (
    <InputOTP
      maxLength={length}
      value={resolved}
      onChange={handleChange}
      disabled={disabled}
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
  <div className="flex items-center gap-2 text-sm text-slate-600">
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
    {caption ? <caption className="mt-2 text-xs text-slate-500">{caption}</caption> : null}
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
