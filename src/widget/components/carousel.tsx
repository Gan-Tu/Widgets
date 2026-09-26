import React from "react";
import { useControlValue, fieldId } from "../binding";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button as UiButton } from "../../components/ui/button";
import { useWidgetAction, buildChangePayload } from "../context";
import { useIsomorphicLayoutEffect, useResizeObserver, useVisibleAction } from "../hooks";
import { applyPadding, resolveRadius, sizeToCss, spaceToCss } from "../style";
import { safeHttpHref } from "../url";
import type { ActionConfig, Padding, RadiusValue } from "../types";
import { Image } from "./content";

type ChildrenProps = { children?: React.ReactNode };
const toCssSize = (value: number | string | undefined, fallback?: string) => sizeToCss(value) ?? fallback;

type CarouselContextValue = { gap: string; visibleItems?: number | Record<string, number>; snapAlign: "start" | "center" | "end" };
const CarouselContext = React.createContext<CarouselContextValue | undefined>(undefined);

const BaseCarousel: React.FC<ChildrenProps & {
  bind?: string;
  name?: string;
  activeIndex?: number;
  defaultIndex?: number;
  onChangeAction?: ActionConfig;
  gap?: number | string;
  visibleItems?: number | Record<string, number>;
  showArrows?: boolean;
  snap?: "none" | "proximity" | "mandatory";
  snapAlign?: "start" | "center" | "end";
  flush?: boolean;
  ariaLabel?: string;
}> = ({ children, bind, name: explicitName, activeIndex: controlledIndex, defaultIndex, onChangeAction, gap = 2, visibleItems = 1, showArrows = true, snap = "proximity", snapAlign = "start", flush, ariaLabel = "Carousel" }) => {
  const action = useWidgetAction();
  const [activeIndex, setActiveIndex, name] = useControlValue({ bind, name: explicitName, value: controlledIndex, defaultValue: defaultIndex, fallback: 0 });
  const programmaticTarget = React.useRef<number | null>(null);
  const lastIndex = React.useRef(-1);
  const lastIncomingIndex = React.useRef<number | undefined>(undefined);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const trackId = React.useId();
  const reducedMotion = useReducedMotion();
  const gapCss = spaceToCss(gap) ?? "0.5rem";
  const [navigation, setNavigation] = React.useState({ index: 0, count: 0, previous: false, next: false });

  const slidePositions = React.useCallback((node: HTMLDivElement) => {
    const inset = parseFloat(getComputedStyle(node).paddingLeft) || 0;
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    return Array.from(node.children, (child) => {
      const item = child as HTMLElement;
      let position = item.offsetLeft - inset;
      if (snapAlign === "center") position -= (node.clientWidth - inset * 2 - item.offsetWidth) / 2;
      if (snapAlign === "end") position -= node.clientWidth - inset * 2 - item.offsetWidth;
      return Math.max(0, Math.min(maxScroll, position));
    });
  }, [snapAlign]);

  const measure = React.useCallback((node: HTMLDivElement) => {
    const positions = slidePositions(node);
    const index = positions.reduce((best, position, i) => Math.abs(position - node.scrollLeft) < Math.abs(positions[best] - node.scrollLeft) ? i : best, 0);
    const next = { index, count: positions.length, previous: node.scrollLeft > 1, next: node.scrollLeft < node.scrollWidth - node.clientWidth - 1 };
    setNavigation(current => current.index === next.index && current.count === next.count && current.previous === next.previous && current.next === next.next ? current : next);
  }, [slidePositions]);

  useResizeObserver(ref, measure);
  useIsomorphicLayoutEffect(() => {
    if (ref.current) measure(ref.current);
  }, [children, measure]);

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const positions = slidePositions(node);
    const index = Math.max(0, Math.min(positions.length - 1, Math.trunc(activeIndex)));
    const left = positions[index] ?? 0;
    // Only a changed incoming index can request an external jump. Re-renders
    // with a stale controlled value must not undo local user navigation.
    const incomingChanged = lastIncomingIndex.current !== activeIndex;
    lastIncomingIndex.current = activeIndex;
    if (incomingChanged && lastIndex.current !== index) {
      lastIndex.current = index;
      programmaticTarget.current = Math.abs(node.scrollLeft - left) > 1 ? left : null;
      node.scrollTo({ left, behavior: "auto" });
    }
    measure(node);
  }, [activeIndex, children, measure, slidePositions]);

  const selectIndex = (index: number) => {
    if (index === lastIndex.current) return;
    lastIndex.current = index;
    setActiveIndex(index);
    if (onChangeAction) action?.(onChangeAction, buildChangePayload(name, index, { index }));
  };

  const scrollTo = (direction: number | "start" | "end") => {
    const node = ref.current;
    if (!node) return;
    const positions = slidePositions(node);
    const position = direction === "start" ? 0 : direction === "end" ? node.scrollWidth - node.clientWidth
      : direction > 0 ? positions.find(p => p > node.scrollLeft + 1) ?? node.scrollWidth - node.clientWidth
      : [...positions].reverse().find(p => p < node.scrollLeft - 1) ?? 0;
    const index = positions.findIndex(p => p === position);
    selectIndex(Math.max(0, index));
    programmaticTarget.current = position;
    node.scrollTo({ left: position, behavior: reducedMotion ? "auto" : "smooth" });
  };

  return (
    <CarouselContext.Provider value={{ gap: gapCss, visibleItems, snapAlign }}>
      <div id={fieldId(name)} className="wg-carousel min-w-0" role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
        <div
          ref={ref}
          id={trackId}
          tabIndex={0}
          aria-label={`${ariaLabel} slides`}
          className="relative flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            gap: gapCss,
            paddingBlock: 2,
            marginInline: flush ? "calc(var(--widget-card-padding, 1rem) * -1)" : undefined,
            paddingInline: flush ? "var(--widget-card-padding, 1rem)" : undefined,
            scrollPaddingInline: flush ? "var(--widget-card-padding, 1rem)" : undefined,
            scrollSnapType: snap === "none" ? undefined : `x ${snap}`
          }}
          onPointerDown={() => { programmaticTarget.current = null; }}
          onWheel={() => { programmaticTarget.current = null; }}
          onScroll={event => {
            const node = event.currentTarget;
            measure(node);
            if (programmaticTarget.current !== null) {
              if (Math.abs(node.scrollLeft - programmaticTarget.current) <= 1) programmaticTarget.current = null;
              return;
            }
            const positions = slidePositions(node);
            const index = positions.reduce((best, position, i) => Math.abs(position - node.scrollLeft) < Math.abs(positions[best] - node.scrollLeft) ? i : best, 0);
            selectIndex(index);
          }}
          onKeyDown={event => {
            if (event.target !== event.currentTarget) return;
            const direction = ({ ArrowLeft: -1, ArrowRight: 1, Home: "start", End: "end" } as Record<string, number | "start" | "end">)[event.key];
            if (direction === undefined) return;
            event.preventDefault();
            scrollTo(direction);
          }}
        >
          {children}
        </div>
        {showArrows && (navigation.previous || navigation.next) ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs tabular-nums text-[var(--widget-text-secondary)]" aria-live="polite">{navigation.index + 1} / {navigation.count}</span>
            <div className="flex gap-1">
              <UiButton type="button" variant="ghost" size="icon-sm" disabled={!navigation.previous} onClick={() => scrollTo(-1)} aria-label="Previous item" aria-controls={trackId}><ChevronLeft size={16} /></UiButton>
              <UiButton type="button" variant="ghost" size="icon-sm" disabled={!navigation.next} onClick={() => scrollTo(1)} aria-label="Next item" aria-controls={trackId}><ChevronRight size={16} /></UiButton>
            </div>
          </div>
        ) : null}
      </div>
    </CarouselContext.Provider>
  );
};

type BaseCarouselItemProps = ChildrenProps & {
  variant?: "none" | "outline" | "soft" | "elevated";
  padding?: number | string | Padding;
  radius?: RadiusValue;
  minWidth?: number | string;
};

const useCarouselItemStyle = ({
  variant = "outline",
  padding = 3,
  radius = "lg",
  minWidth
}: Omit<BaseCarouselItemProps, "children"> = {}) => {
  const context = React.useContext(CarouselContext);
  const requestedCount =
    typeof context?.visibleItems === "number"
      ? context.visibleItems
      : context?.visibleItems?.default ?? 1;
  const visibleCount = Number.isFinite(requestedCount) && requestedCount > 0 ? Math.max(1, requestedCount) : 1;
  const style: React.CSSProperties = {
    flex: `0 0 calc((100% - (${context?.gap ?? "0.5rem"} * ${Math.max(visibleCount - 1, 0)})) / ${visibleCount || 1})`,
    minWidth: minWidth === undefined ? 0 : `min(100%, ${toCssSize(minWidth)})`,
    scrollSnapAlign: context?.snapAlign,
    borderRadius: resolveRadius(radius),
    border: variant === "outline" || variant === "elevated" ? "1px solid var(--widget-border-default)" : undefined,
    background:
      variant === "soft"
        ? "var(--widget-surface-secondary)"
        : variant === "elevated"
        ? "var(--widget-surface-elevated)"
        : undefined,
    boxShadow: variant === "elevated" ? "var(--widget-shadow)" : undefined
  };
  applyPadding(style, padding);
  return style;
};

const BaseCarouselItem: React.FC<BaseCarouselItemProps> = ({ children, variant = "outline", padding = 3, radius = "lg", minWidth }) => {
  const style = useCarouselItemStyle({ variant, padding, radius, minWidth });
  return <div role="group" aria-roledescription="slide" style={style}>{children}</div>;
};

const BaseCarouselMediaItem: React.FC<ChildrenProps & React.ComponentProps<typeof Image> & {
  media?: React.ReactNode;
  itemPadding?: number | string | Padding;
  itemRadius?: RadiusValue;
  minWidth?: number | string;
}> = ({
  children,
  media,
  itemPadding = 0,
  itemRadius = "lg",
  minWidth,
  ...props
}) => (
  <BaseCarouselItem variant="none" padding={itemPadding} radius={itemRadius} minWidth={minWidth}>
    {media ?? (props.src ? <Image {...props} width="100%" height={props.height ?? (props.aspectRatio ? undefined : 180)} /> : null)}
    {children ? <div style={{ padding: "0.75rem 0 0" }}>{children}</div> : null}
  </BaseCarouselItem>
);

const CardCarousel: React.FC<React.ComponentProps<typeof BaseCarousel> & { onVisibleAction?: ActionConfig }> = ({
  onVisibleAction,
  ...props
}) => {
  const ref = useVisibleAction<HTMLDivElement>(onVisibleAction);
  return (
    <div ref={ref}>
      <BaseCarousel visibleItems={props.visibleItems ?? 1} {...props} />
    </div>
  );
};

const CardLinkItem: React.FC<ChildrenProps & { href?: string; onClickAction?: ActionConfig }> = ({
  children,
  href,
  onClickAction
}) => {
  const action = useWidgetAction();
  const style = useCarouselItemStyle({ variant: "elevated" });
  if (onClickAction) {
    return (
      <button type="button" className="cursor-pointer appearance-none text-left text-inherit" style={style} onClick={() => action?.(onClickAction)}>
        {children}
      </button>
    );
  }
  // Untrusted template input: fall back to a plain (non-navigating) item
  // rather than emitting a link to a `data:`/`blob:` target.
  const safeHref = safeHttpHref(href);
  return safeHref ? (
    <a href={safeHref} target="_blank" rel="noreferrer" className="block cursor-pointer text-inherit no-underline" style={style}>
      {children}
    </a>
  ) : (
    <BaseCarouselItem variant="elevated">{children}</BaseCarouselItem>
  );
};

export { BaseCarousel, BaseCarouselItem, BaseCarouselMediaItem, CardCarousel, CardLinkItem };
