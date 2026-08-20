type PropDoc = {
  name: string;
  description: string;
  type: string;
  default?: string;
};

type ComponentDoc = {
  id: string;
  name: string;
  description: string;
  category: string;
  usage: string;
  props: PropDoc[];
};

const thinkingReasoningProps: PropDoc[] = [
  { name: "label", description: "Heading shown while reasoning is active.", type: "string", default: '"Thinking"' },
  { name: "summary", description: "Completed-state heading; overrides the elapsed-time summary.", type: "string" },
  { name: "steps", description: "Reasoning steps displayed on the connected rail.", type: 'Array<{ label: string; detail?: string; status?: "pending" | "running" | "completed" | "failed" | "cancelled" }>' },
  { name: "active", description: "Keep the reasoning body open and shimmer the heading.", type: "boolean", default: "false" },
  { name: "elapsed", description: "Elapsed-time value used by the default completed summary.", type: "string | number" },
  { name: "defaultOpen", description: "Initial expanded state; defaults to the active state.", type: "boolean" },
  { name: "collapsible", description: "Allow completed reasoning to be expanded and collapsed.", type: "boolean", default: "true" },
  { name: "onToggleAction", description: "Action dispatched with { open } after a user toggle.", type: "ActionConfig" }
];

const orbProps: PropDoc[] = [
  { name: "variant", description: "Animation family and phase; every phase is a distinct choreography. S lattice pulse — S1 radiates from the centre, S2 sweeps the diagonal, S3 runs the perimeter as a comet, S4 crosses column by column, S5 lands in scrambled order. G globe wave — G1 waves left to right, G2 runs the middle band against its neighbours, G3 cascades down the rows, G4 breathes while spinning, G5 idles in a slow shallow ripple. C ring — C1 single comet chase, C2 slow swell circling the ring, C3 twin heads opposite each other, C4 even/odd blink, C5 scrambled twinkle. B lens blobs — B1 four corners converge on the focus, B2 a pair sweeps around, B3 rings ripple outward, B4 the pair meets on the vertical axis, B5 three lobes rotate one stop at a time. M morphing ring — M1 folds circle to diamond, M2 gathers to a point and expands, M3 unfolds a quarter turn at a time, M4 alternate dots trade radii like gears, M5 disperses outward and re-forms.", type: '"S1" | "S2" | "S3" | "S4" | "S5" | "G1" | "G2" | "G3" | "G4" | "G5" | "C1" | "C2" | "C3" | "C4" | "C5" | "B1" | "B2" | "B3" | "B4" | "B5" | "M1" | "M2" | "M3" | "M4" | "M5"', default: '"S1"' },
  { name: "size", description: "Orb diameter in pixels or as a CSS size.", type: "number | string", default: "20" },
  { name: "color", description: "Orb color token or CSS color.", type: "string | ThemeColor", default: "accent" },
  { name: "label", description: "Optional visible status label and accessible name.", type: "string" }
];

const agentInputProps: PropDoc[] = [
  { name: "name", description: "Form field and submitted payload key.", type: "string", default: '"prompt"' },
  { name: "placeholder", description: "Textarea placeholder.", type: "string", default: '"Ask AI Agent"' },
  { name: "defaultValue", description: "Initial prompt text.", type: "string", default: '""' },
  { name: "models", description: "Optional model picker choices.", type: "Array<{ value: string; label: string }>" },
  { name: "defaultModel", description: "Initially selected model value; defaults to the first model.", type: "string" },
  { name: "attachments", description: "Attached files displayed as removable chips.", type: "Array<{ id?: string | number; name: string; type?: string; size?: string }>" },
  { name: "commands", description: "Slash commands filtered when the prompt ends with /query.", type: "Array<{ value: string; label: string; description?: string; icon?: WidgetIcon }>" },
  { name: "skills", description: "Skills displayed in the toolbar picker.", type: "Array<{ value: string; label: string; description?: string; icon?: WidgetIcon }>" },
  { name: "selectedSkills", description: "Selected skill ids displayed as @skill chips.", type: "string[]" },
  { name: "submitAction", description: "Action dispatched with the prompt value and selected model.", type: "ActionConfig" },
  { name: "attachAction", description: "Action dispatched from the attachment button.", type: "ActionConfig" },
  { name: "removeAttachmentAction", description: "Action dispatched with an attachment and id when its remove button is pressed.", type: "ActionConfig" },
  { name: "commandAction", description: "Action dispatched with a selected slash-command value.", type: "ActionConfig" },
  { name: "skillAction", description: "Action dispatched with a selected skill value.", type: "ActionConfig" },
  { name: "enhanceAction", description: "Action dispatched with the current prompt from the enhance button.", type: "ActionConfig" },
  { name: "cancelEnhanceAction", description: "Action dispatched by the enhancement cancel control.", type: "ActionConfig" },
  { name: "onChangeAction", description: "Action dispatched whenever the prompt changes.", type: "ActionConfig" },
  { name: "enhancing", description: "Show the active enhancement state and cancellation control.", type: "boolean", default: "false" },
  { name: "disabled", description: "Disable prompt entry and submission.", type: "boolean", default: "false" },
  { name: "rows", description: "Visible textarea rows.", type: "number", default: "2" }
];

export const componentDocs: ComponentDoc[] = [
  {
    id: "Basic",
    name: "Basic",
    description: "Root-level flex container that applies widget theme variables without card chrome.",
    category: "Containers",
    usage: `<Basic padding={3} gap={2} theme="light">\n  <Text value="Plain widget content" />\n</Basic>`,
    props: [
      { name: "children", description: "Content rendered in the root container.", type: "ReactNode" },
      { name: "gap", description: "Gap between children.", type: "number | string" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" },
      { name: "align", description: "Cross-axis alignment.", type: "Alignment" },
      { name: "justify", description: "Main-axis distribution.", type: "Justification" },
      { name: "direction", description: "Flex direction.", type: '"row" | "col"', default: '"col"' },
      { name: "theme", description: "Force light or dark theme.", type: '"light" | "dark"' },
      { name: "onVisibleAction", description: "Action fired once when the container enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "Card",
    name: "Card",
    description: "Primary widget container with optional actions and status.",
    category: "Containers",
    usage: `<Card size="sm">\n  <Title value="Widget title" />\n  <Text value="Details" />\n</Card>`,
    props: [
      { name: "children", description: "Child components rendered inside the card.", type: "ReactNode" },
      { name: "asForm", description: "Treat the card as a form and attach form values to actions.", type: "boolean", default: "false" },
      { name: "background", description: "Surface/background color token or CSS string.", type: "string | ThemeColor", default: "surface-elevated" },
      { name: "size", description: "Card size preset.", type: "\"sm\" | \"md\" | \"lg\" | \"full\"", default: '"sm"' },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding", default: "4" },
      { name: "status", description: "Optional status header: { text, icon? } with a WidgetIcon, or { text, favicon?, frame? } with an image URL.", type: "WidgetStatus" },
      { name: "collapsed", description: "Collapse the card body with a toggle.", type: "boolean", default: "false" },
      { name: "confirm", description: "Confirm action button config.", type: "{ label: string; action: ActionConfig }" },
      { name: "cancel", description: "Cancel action button config.", type: "{ label: string; action: ActionConfig }" },
      { name: "onClickAction", description: "Action fired when the full card is clicked; supports client actions like card.open.", type: "ActionConfig" },
      { name: "onVisibleAction", description: "Action fired once when the card enters the viewport.", type: "ActionConfig" },
      { name: "id", description: "DOM id and fallback card id.", type: "string" },
      { name: "cardId", description: "Stable card id used by card.open.", type: "string" },
      { name: "gap", description: "Gap between card children.", type: "number | string" },
      { name: "width", description: "Explicit card width.", type: "number | string" },
      { name: "height", description: "Explicit card height.", type: "number | string" },
      { name: "shadow", description: "Toggle card shadow.", type: "boolean", default: "true" },
      { name: "theme", description: "Force light or dark theme for this card.", type: "\"light\" | \"dark\"" }
    ]
  },
  {
    id: "ListView",
    name: "ListView",
    description: "Scrollable list container with built-in show-more.",
    category: "Containers",
    usage: `<ListView>\n  <ListViewItem>...</ListViewItem>\n</ListView>`,
    props: [
      { name: "children", description: "Must be ListViewItem nodes.", type: "ReactNode" },
      { name: "limit", description: "Number of items to show before \"Show more\". \"auto\" resolves to 6.", type: "number | \"auto\"", default: '"auto"' },
      { name: "status", description: "Optional status header.", type: "WidgetStatus" },
      { name: "theme", description: "Force light or dark theme.", type: "\"light\" | \"dark\"" }
    ]
  },
  {
    id: "ListViewItem",
    name: "ListViewItem",
    description: "Row item for ListView.",
    category: "Containers",
    usage: `<ListViewItem onClickAction={{ type: "item.select" }}>\n  <Text value="Item" />\n</ListViewItem>`,
    props: [
      { name: "children", description: "Content inside the row.", type: "ReactNode" },
      { name: "onClickAction", description: "Action fired when item is clicked.", type: "ActionConfig" },
      { name: "gap", description: "Gap between children.", type: "number | string" },
      { name: "align", description: "Cross-axis alignment.", type: "Alignment", default: '"center"' }
    ]
  },
  {
    id: "Box",
    name: "Box",
    description: "Base flex container.",
    category: "Layout",
    usage: `<Box padding={3} gap={2}>\n  <Text value="Hello" />\n</Box>`,
    props: [
      { name: "children", description: "Content inside the box.", type: "ReactNode" },
      { name: "direction", description: "Flex direction.", type: "\"row\" | \"col\"", default: '"col"' },
      { name: "align", description: "Cross-axis alignment.", type: "Alignment" },
      { name: "justify", description: "Main-axis distribution.", type: "Justification" },
      { name: "wrap", description: "Wrap behavior.", type: "\"nowrap\" | \"wrap\" | \"wrap-reverse\"", default: '"nowrap"' },
      { name: "flex", description: "CSS flex value applied to the box within its flex parent.", type: "number | string" },
      { name: "gap", description: "Gap between children.", type: "number | string" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" },
      { name: "border", description: "Border config.", type: "number | Border | Borders" },
      { name: "background", description: "Background color.", type: "string | ThemeColor" },
      { name: "width", description: "Explicit width.", type: "number | string" },
      { name: "height", description: "Explicit height.", type: "number | string" },
      { name: "size", description: "Square width/height shorthand.", type: "number | string" },
      { name: "minWidth", description: "Minimum width.", type: "number | string" },
      { name: "minHeight", description: "Minimum height.", type: "number | string" },
      { name: "minSize", description: "Minimum width and height shorthand.", type: "number | string" },
      { name: "maxWidth", description: "Maximum width.", type: "number | string" },
      { name: "maxHeight", description: "Maximum height.", type: "number | string" },
      { name: "maxSize", description: "Maximum width and height shorthand.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio value.", type: "number | string" },
      { name: "radius", description: "Border radius token.", type: "RadiusValue" },
      { name: "margin", description: "Outer margin.", type: "number | string | Margin" },
      { name: "onVisibleAction", description: "Action fired once when the box enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "Row",
    name: "Row",
    description: "Horizontal flex layout.",
    category: "Layout",
    usage: `<Row gap={2} align="center">\n  <Icon name="info" />\n  <Text value="Row item" />\n</Row>`,
    props: [
      { name: "align", description: "Cross-axis alignment.", type: "Alignment", default: '"center"' },
      { name: "gap", description: "Gap between children.", type: "number | string" },
      { name: "children", description: "Content inside the row.", type: "ReactNode" },
      { name: "justify", description: "Main-axis distribution.", type: "Justification" },
      { name: "wrap", description: "Wrap behavior.", type: '"nowrap" | "wrap" | "wrap-reverse"' },
      { name: "flex", description: "CSS flex value applied within the flex parent.", type: "number | string" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" },
      { name: "margin", description: "Outer margin.", type: "number | string | Margin" },
      { name: "width", description: "Explicit width.", type: "number | string" },
      { name: "height", description: "Explicit height.", type: "number | string" },
      { name: "size", description: "Square width/height shorthand.", type: "number | string" },
      { name: "border", description: "Border config.", type: "number | Border | Borders" },
      { name: "background", description: "Background color.", type: "string | ThemeColor" },
      { name: "radius", description: "Border radius token.", type: "RadiusValue" },
      { name: "onVisibleAction", description: "Action fired once when the row enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "Col",
    name: "Col",
    description: "Vertical flex layout.",
    category: "Layout",
    usage: `<Col gap={1}>\n  <Title value="Heading" />\n  <Text value="Body" />\n</Col>`,
    props: [
      { name: "align", description: "Cross-axis alignment.", type: "Alignment" },
      { name: "gap", description: "Gap between children.", type: "number | string" },
      { name: "children", description: "Content inside the column.", type: "ReactNode" },
      { name: "justify", description: "Main-axis distribution.", type: "Justification" },
      { name: "wrap", description: "Wrap behavior.", type: '"nowrap" | "wrap" | "wrap-reverse"' },
      { name: "flex", description: "CSS flex value applied within the flex parent.", type: "number | string" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" },
      { name: "margin", description: "Outer margin.", type: "number | string | Margin" },
      { name: "width", description: "Explicit width.", type: "number | string" },
      { name: "height", description: "Explicit height.", type: "number | string" },
      { name: "size", description: "Square width/height shorthand.", type: "number | string" },
      { name: "border", description: "Border config.", type: "number | Border | Borders" },
      { name: "background", description: "Background color.", type: "string | ThemeColor" },
      { name: "radius", description: "Border radius token.", type: "RadiusValue" },
      { name: "onVisibleAction", description: "Action fired once when the column enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "Spacer",
    name: "Spacer",
    description: "Flexible spacer inside flex layouts.",
    category: "Layout",
    usage: `<Row>\n  <Text value="Left" />\n  <Spacer />\n  <Text value="Right" />\n</Row>`,
    props: [
      { name: "minSize", description: "Minimum size along the flex axis, in spacing units (×4px) or a CSS size string. No minimum when omitted.", type: "number | string" }
    ]
  },
  {
    id: "Divider",
    name: "Divider",
    description: "Theme-aware horizontal rule.",
    category: "Layout",
    usage: `<Divider flush />`,
    props: [
      { name: "color", description: "Divider color.", type: "string | ThemeColor", default: '"default"' },
      { name: "size", description: "Thickness.", type: "number | string", default: "1" },
      { name: "spacing", description: "Spacing above and below.", type: "number | string" },
      { name: "flush", description: "Bleed to card edges.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Text",
    name: "Text",
    description: "Body text.",
    category: "Typography",
    usage: `<Text value="Hello world" size="sm" color="secondary" />`,
    props: [
      { name: "value", description: "Text content; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional simple text or inline content when value is omitted.", type: "ReactNode" },
      { name: "size", description: "Text size.", type: "TextSize", default: '"md"' },
      { name: "weight", description: "Font weight.", type: "\"normal\" | \"medium\" | \"semibold\" | \"bold\"", default: "\"normal\"" },
      { name: "color", description: "Text color.", type: "string | ThemeColor" },
      { name: "italic", description: "Italic text.", type: "boolean", default: "false" },
      { name: "lineThrough", description: "Line-through decoration.", type: "boolean", default: "false" },
      { name: "textAlign", description: "Text alignment.", type: "TextAlign" },
      { name: "truncate", description: "Single-line ellipsis truncation.", type: "boolean", default: "false" },
      { name: "maxLines", description: "Line clamp.", type: "number" },
      { name: "width", description: "Explicit text block width.", type: "number | string" },
      { name: "minLines", description: "Minimum line height reservation, useful for editable text. Editable text with minLines > 1 renders a textarea.", type: "number" },
      { name: "streaming", description: "Mark the text as streaming content.", type: "boolean", default: "false" },
      { name: "editable", description: "Inline editable input bound to the nearest form: { name, placeholder?, autoFocus?, autoSelect?, autoComplete?, allowAutofillExtensions?, pattern?, required? }. The value prop provides the initial text.", type: "{ name: string; placeholder?: string; autoFocus?: boolean; autoSelect?: boolean; autoComplete?: string; allowAutofillExtensions?: boolean; pattern?: string; required?: boolean } | false", default: "false" }
    ]
  },
  {
    id: "Title",
    name: "Title",
    description: "Heading text.",
    category: "Typography",
    usage: `<Title value="Widget title" size="lg" />`,
    props: [
      { name: "value", description: "Title content; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional simple text content when value is omitted.", type: "ReactNode" },
      { name: "size", description: "Title size.", type: "TitleSize", default: '"md"' },
      { name: "weight", description: "Font weight.", type: "\"normal\" | \"medium\" | \"semibold\" | \"bold\"", default: '"medium"' },
      { name: "color", description: "Text color.", type: "string | ThemeColor", default: '"prose"' },
      { name: "textAlign", description: "Text alignment.", type: "TextAlign" },
      { name: "truncate", description: "Single-line ellipsis truncation.", type: "boolean", default: "false" },
      { name: "maxLines", description: "Line clamp.", type: "number" }
    ]
  },
  {
    id: "Caption",
    name: "Caption",
    description: "Caption text, often used for metadata.",
    category: "Typography",
    usage: `<Caption value="Caption" size="sm" />`,
    props: [
      { name: "value", description: "Caption content; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional simple text content when value is omitted.", type: "ReactNode" },
      { name: "size", description: "Caption size.", type: "CaptionSize", default: '"md"' },
      { name: "weight", description: "Font weight.", type: "\"normal\" | \"medium\" | \"semibold\" | \"bold\"", default: '"normal"' },
      { name: "color", description: "Text color.", type: "string | ThemeColor", default: '"secondary"' },
      { name: "textAlign", description: "Text alignment.", type: "TextAlign" },
      { name: "truncate", description: "Single-line ellipsis truncation.", type: "boolean", default: "false" },
      { name: "maxLines", description: "Line clamp.", type: "number" }
    ]
  },
  {
    id: "Markdown",
    name: "Markdown",
    description: "Render markdown content.",
    category: "Typography",
    usage: `<Markdown value="**Hello** _world_" />`,
    props: [
      { name: "value", description: "Markdown string; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional markdown text when value is omitted.", type: "ReactNode" },
      { name: "streaming", description: "Enable streaming transitions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Badge",
    name: "Badge",
    description: "Compact badge label.",
    category: "Content",
    usage: `<Badge label="New" color="info" />`,
    props: [
      { name: "label", description: "Badge text; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional simple text content when label is omitted.", type: "ReactNode" },
      { name: "color", description: "Badge color token.", type: "\"secondary\" | \"accent\" | \"success\" | \"danger\" | \"warning\" | \"info\" | \"discovery\"", default: '"secondary"' },
      { name: "variant", description: "Badge style.", type: "\"solid\" | \"soft\" | \"outline\"", default: '"soft"' },
      { name: "size", description: "Badge size.", type: "\"sm\" | \"md\" | \"lg\"", default: '"sm"' },
      { name: "pill", description: "Fully rounded badge.", type: "boolean", default: "true" },
      { name: "icon", description: "Optional leading icon.", type: "WidgetIcon" }
    ]
  },
  {
    id: "Icon",
    name: "Icon",
    description: "Icon from the widget icon set.",
    category: "Content",
    usage: `<Icon name="map-pin" size="lg" />`,
    props: [
      { name: "name", description: "Icon name.", type: "WidgetIcon" },
      { name: "size", description: "Icon size.", type: "IconSize", default: '"md"' },
      { name: "color", description: "Icon color.", type: "string | ThemeColor" }
    ]
  },
  {
    id: "Image",
    name: "Image",
    description: "Responsive image block.",
    category: "Content",
    usage: `<Image src={imageUrl} size={64} radius="lg" />`,
    props: [
      { name: "src", description: "Image source URL.", type: "string" },
      { name: "alt", description: "Alt text.", type: "string" },
      { name: "fit", description: "Object-fit mode.", type: "\"cover\" | \"contain\" | \"fill\" | \"scale-down\" | \"none\"", default: '"cover"' },
      { name: "position", description: "Object position within the frame.", type: '"top left" | "top" | "top right" | "left" | "center" | "right" | "bottom left" | "bottom" | "bottom right"', default: '"center"' },
      { name: "frame", description: "Draw a frame.", type: "boolean", default: "false" },
      { name: "flush", description: "Bleed to card edges.", type: "boolean", default: "false" },
      { name: "size", description: "Square size.", type: "number | string" },
      { name: "width", description: "Explicit width.", type: "number | string" },
      { name: "height", description: "Explicit height.", type: "number | string" },
      { name: "minWidth / minHeight", description: "Minimum image constraints.", type: "number | string" },
      { name: "maxWidth / maxHeight", description: "Maximum image constraints.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio value.", type: "number | string" },
      { name: "radius", description: "Border radius token.", type: "RadiusValue", default: '"md"' },
      { name: "background", description: "Image background color.", type: "string | ThemeColor" },
      { name: "border", description: "Image border config.", type: "number | Border" },
      { name: "onClickAction", description: "Action fired when the image is clicked.", type: "ActionConfig" }
    ]
  },
  {
    id: "Favicon",
    name: "Favicon",
    description: "Small circular image helper for site icons and favicons.",
    category: "Content",
    usage: `<Favicon url="https://example.com/favicon.ico" size={24} alt="Example" />`,
    props: [
      { name: "url", description: "Favicon URL; used when src is omitted.", type: "string" },
      { name: "src", description: "Image source override.", type: "string" },
      { name: "size", description: "Square icon size.", type: "number | string", default: "20" },
      { name: "frame", description: "Draw a circular frame.", type: "boolean", default: "true" },
      { name: "alt", description: "Accessible image alt text.", type: "string" }
    ]
  },
  {
    id: "Svg",
    name: "Svg",
    description: "Inline SVG path renderer for simple custom glyphs.",
    category: "Content",
    usage: `<Svg viewBox="0 0 24 24" paths={[{ d: "M4 12l5 5L20 6", stroke: "currentColor" }]} title="Check" />`,
    props: [
      { name: "viewBox", description: "SVG viewBox.", type: "string", default: '"0 0 24 24"' },
      { name: "paths", description: "Path strings or path objects with d, fill, stroke, and strokeWidth.", type: "Array<string | SvgPath>" },
      { name: "size", description: "Square SVG size.", type: "number | string", default: "24" },
      { name: "width", description: "Explicit width.", type: "number | string" },
      { name: "height", description: "Explicit height.", type: "number | string" },
      { name: "title", description: "Accessible label; makes the SVG role img.", type: "string" }
    ]
  },
  {
    id: "Button",
    name: "Button",
    description: "Action button with optional icon.",
    category: "Forms & controls",
    usage: `<Button label="Continue" style="primary" />`,
    props: [
      { name: "submit", description: "Configure as a submit button for the nearest form.", type: "boolean", default: "false" },
      { name: "label", description: "Button label text; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional simple text content when label is omitted.", type: "ReactNode" },
      { name: "onClickAction", description: "Action fired on click.", type: "ActionConfig" },
      { name: "iconStart", description: "Optional leading icon.", type: "WidgetIcon" },
      { name: "iconEnd", description: "Optional trailing icon.", type: "WidgetIcon" },
      { name: "style", description: "Color style preset.", type: "\"primary\" | \"secondary\"", default: '"secondary"' },
      { name: "color", description: "Extended color preset; overrides style.", type: '"primary" | "secondary" | "accent" | "info" | "discovery" | "success" | "caution" | "warning" | "danger"' },
      { name: "iconSize", description: "Icon size token.", type: "\"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\"", default: '"md"' },
      { name: "variant", description: "Visual variant.", type: "ControlVariant", default: '"solid"' },
      { name: "size", description: "Control size.", type: "ControlSize", default: '"lg"' },
      { name: "pill", description: "Pill shape.", type: "boolean", default: "true" },
      { name: "uniform", description: "Make the button square (icon button).", type: "boolean", default: "false" },
      { name: "block", description: "Full width.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions. When omitted, the button auto-disables if it has neither onClickAction nor submit.", type: "boolean" }
    ]
  },
  {
    id: "Form",
    name: "Form",
    description: "Form state provider and submit wrapper for input controls.",
    category: "Forms & controls",
    usage: `<Form onSubmitAction={{ type: "form.submit" }}>\n  <Input name="email" />\n  <Button submit label="Submit" />\n</Form>`,
    props: [
      { name: "children", description: "Form controls and submit buttons.", type: "ReactNode" },
      { name: "onSubmitAction", description: "Action dispatched with form values on submit.", type: "ActionConfig" },
      { name: "direction", description: "Flex direction.", type: '"row" | "col"', default: '"col"' },
      { name: "align", description: "Cross-axis alignment.", type: "Alignment" },
      { name: "justify", description: "Main-axis distribution.", type: "Justification" },
      { name: "gap", description: "Gap between form children.", type: "number | string" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" }
    ]
  },
  {
    id: "Input",
    name: "Input",
    description: "Single-line input control.",
    category: "Forms & controls",
    usage: `<Input name="email" placeholder="you@example.com" />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "inputType", description: "Input type.", type: "\"text\" | \"email\" | \"number\" | \"password\" | \"tel\" | \"url\"", default: '"text"' },
      { name: "defaultValue", description: "Initial value.", type: "string" },
      { name: "value", description: "Controlled value override.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched with the next value on change.", type: "ActionConfig" },
      { name: "placeholder", description: "Placeholder text.", type: "string" },
      { name: "required", description: "Required for submit.", type: "boolean", default: "false" },
      { name: "pattern", description: "HTML validation pattern.", type: "string" },
      { name: "variant", description: "Visual style.", type: "\"soft\" | \"outline\"", default: '"outline"' },
      { name: "size", description: "Control height.", type: "ControlSize", default: '"md"' },
      { name: "gutterSize", description: "Horizontal padding size token.", type: "ControlSize" },
      { name: "pill", description: "Pill-shaped control.", type: "boolean", default: "false" },
      { name: "allowAutofillExtensions", description: "Allow browser/password-manager autofill.", type: "boolean", default: "false" },
      { name: "autoSelect", description: "Select text on focus.", type: "boolean", default: "false" },
      { name: "autoFocus", description: "Focus the input on mount.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Textarea",
    name: "Textarea",
    description: "Multi-line input control.",
    category: "Forms & controls",
    usage: `<Textarea name="notes" rows={4} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "defaultValue", description: "Initial value.", type: "string" },
      { name: "value", description: "Controlled value override.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched with the next value on change.", type: "ActionConfig" },
      { name: "rows", description: "Visible rows.", type: "number", default: "3" },
      { name: "placeholder", description: "Placeholder text.", type: "string" },
      { name: "required", description: "Required for submit.", type: "boolean", default: "false" },
      { name: "variant", description: "Visual style.", type: "\"soft\" | \"outline\"", default: '"outline"' },
      { name: "size", description: "Minimum control height.", type: "ControlSize", default: '"md"' },
      { name: "gutterSize", description: "Horizontal padding size token.", type: "ControlSize" },
      { name: "autoResize", description: "Allow vertical drag resize; set false to lock the textarea height.", type: "boolean", default: "true" },
      { name: "maxRows", description: "Maximum resize height in rows.", type: "number" },
      { name: "allowAutofillExtensions", description: "Allow browser/password-manager autofill.", type: "boolean", default: "false" },
      { name: "autoSelect", description: "Select text on focus.", type: "boolean", default: "false" },
      { name: "autoFocus", description: "Focus the textarea on mount.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Select",
    name: "Select",
    description: "Dropdown select control.",
    category: "Forms & controls",
    usage: `<Select name="volume" options={[{ label: "10", value: "10" }]} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "options", description: "Options list; each option may include disabled and description.", type: "Array<{ value: string; label: string; disabled?: boolean; description?: string }>" },
      { name: "onChangeAction", description: "Action dispatched with selected value and option.", type: "ActionConfig" },
      { name: "placeholder", description: "Placeholder text.", type: "string" },
      { name: "defaultValue", description: "Initial value.", type: "string" },
      { name: "variant", description: "Visual style.", type: "ControlVariant", default: '"outline"' },
      { name: "size", description: "Control height.", type: "ControlSize", default: '"md"' },
      { name: "pill", description: "Pill-shaped control.", type: "boolean", default: "false" },
      { name: "block", description: "Full-width control.", type: "boolean", default: "false" },
      { name: "clearable", description: "Allow clear control.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "DatePicker",
    name: "DatePicker",
    description: "Popover date picker with calendar UI, storing dates as ISO (YYYY-MM-DD).",
    category: "Forms & controls",
    usage: `<DatePicker name="due" placeholder="Due date" />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "placeholder", description: "Placeholder text.", type: "string" },
      { name: "onChangeAction", description: "Action when date changes.", type: "ActionConfig" },
      { name: "defaultValue", description: "Initial ISO date.", type: "string" },
      { name: "min", description: "Earliest date (ISO).", type: "string" },
      { name: "max", description: "Latest date (ISO).", type: "string" },
      { name: "variant", description: "Visual style.", type: "ControlVariant", default: '"outline"' },
      { name: "size", description: "Control size.", type: "ControlSize", default: '"md"' },
      { name: "side", description: "Preferred popover side.", type: '"top" | "bottom" | "left" | "right"' },
      { name: "align", description: "Popover alignment.", type: '"start" | "center" | "end"' },
      { name: "pill", description: "Pill-shaped control.", type: "boolean", default: "false" },
      { name: "block", description: "Full-width control.", type: "boolean", default: "false" },
      { name: "clearable", description: "Allow clear control.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Checkbox",
    name: "Checkbox",
    description: "Checkbox control.",
    category: "Forms & controls",
    usage: `<Checkbox name="tos" label="Agree" />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "label", description: "Label text.", type: "string" },
      { name: "defaultChecked", description: "Initial checked state.", type: "boolean" },
      { name: "onChangeAction", description: "Action dispatched with checked state on change.", type: "ActionConfig" },
      { name: "required", description: "Required for submit.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "RadioGroup",
    name: "RadioGroup",
    description: "Single selection group.",
    category: "Forms & controls",
    usage: `<RadioGroup name="size" options={[{ label: "Small", value: "sm" }]} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "options", description: "Radio options; each option may include disabled.", type: "Array<{ label: string; value: string; disabled?: boolean }>" },
      { name: "ariaLabel", description: "Accessible group label override.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched with selected value and option.", type: "ActionConfig" },
      { name: "defaultValue", description: "Initial selection.", type: "string" },
      { name: "direction", description: "Layout direction.", type: "\"row\" | \"col\"", default: '"row"' },
      { name: "required", description: "Required for submit.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Label",
    name: "Label",
    description: "Accessible label bound to an input by field name.",
    category: "Forms & controls",
    usage: `<Label value="Email" fieldName="email" />`,
    props: [
      { name: "value", description: "Label text.", type: "string" },
      { name: "fieldName", description: "Input id/name this label targets.", type: "string" },
      { name: "size", description: "Label text size.", type: "TextSize", default: '"sm"' },
      { name: "weight", description: "Font weight.", type: "\"normal\" | \"medium\" | \"semibold\" | \"bold\"", default: '"medium"' },
      { name: "textAlign", description: "Text alignment.", type: "TextAlign", default: '"start"' },
      { name: "color", description: "Text color.", type: "string | ThemeColor", default: '"secondary"' }
    ]
  },
  {
    id: "BarChart",
    name: "BarChart",
    description: "Bar chart (Recharts `BarChart`) with one or more bar series.",
    category: "Charts",
    usage: `<BarChart data={data} series={[{ dataKey: "Desktop" }]} xAxis={{ dataKey: "day" }} showYAxis />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      {
        name: "series",
        description: "Bars to render: { dataKey, label?, color?, stack?, radius? }. Colors accept theme tokens or CSS colors.",
        type: "BarSeries[]"
      },
      {
        name: "xAxis",
        description: "X-axis config.",
        type: "{ dataKey: string; hide?: boolean; labels?: Record<string | number, string> }"
      },
      { name: "xAxis.hide", description: "Hide the x-axis entirely.", type: "boolean", default: "false" },
      { name: "xAxis.labels", description: "Map raw axis values to display labels.", type: "Record<string | number, string>" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "barGap", description: "Gap between bars within a category.", type: "number" },
      { name: "barCategoryGap", description: "Gap between bar categories.", type: "number" },
      { name: "height", description: "Chart container height.", type: "number | string", default: "220" },
      { name: "width", description: "Chart container width.", type: "number | string", default: '"100%"' },
      { name: "size", description: "Square width/height shorthand; overrides height and width.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio for the chart frame. Min/max variants (minWidth, maxHeight, …) are also supported.", type: "number | string" },
      { name: "flex", description: "CSS flex value for the chart frame within a flex parent.", type: "number | string" }
    ]
  },
  {
    id: "LineChart",
    name: "LineChart",
    description: "Line chart (Recharts `LineChart`) with one or more line series.",
    category: "Charts",
    usage: `<LineChart data={data} series={[{ dataKey: "Mobile" }]} xAxis={{ dataKey: "day" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Lines to render: { dataKey, label?, color?, curveType?, strokeWidth?, dot? }. Colors accept theme tokens or CSS colors.", type: "LineSeries[]" },
      { name: "xAxis", description: "X-axis config.", type: "{ dataKey: string; hide?: boolean; labels?: Record<string | number, string> }" },
      { name: "xAxis.hide", description: "Hide the x-axis entirely.", type: "boolean", default: "false" },
      { name: "xAxis.labels", description: "Map raw axis values to display labels.", type: "Record<string | number, string>" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "height", description: "Chart container height.", type: "number | string", default: "220" },
      { name: "width", description: "Chart container width.", type: "number | string", default: '"100%"' },
      { name: "size", description: "Square width/height shorthand; overrides height and width.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio for the chart frame. Min/max variants (minWidth, maxHeight, …) are also supported.", type: "number | string" },
      { name: "flex", description: "CSS flex value for the chart frame within a flex parent.", type: "number | string" }
    ]
  },
  {
    id: "AreaChart",
    name: "AreaChart",
    description: "Area chart (Recharts `AreaChart`) with one or more area series.",
    category: "Charts",
    usage: `<AreaChart data={data} series={[{ dataKey: "Desktop" }]} xAxis={{ dataKey: "day" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Areas to render: { dataKey, label?, color?, stack?, curveType?, fillOpacity? }. Colors accept theme tokens or CSS colors.", type: "AreaSeries[]" },
      { name: "xAxis", description: "X-axis config.", type: "{ dataKey: string; hide?: boolean; labels?: Record<string | number, string> }" },
      { name: "xAxis.hide", description: "Hide the x-axis entirely.", type: "boolean", default: "false" },
      { name: "xAxis.labels", description: "Map raw axis values to display labels.", type: "Record<string | number, string>" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "height", description: "Chart container height.", type: "number | string", default: "220" },
      { name: "width", description: "Chart container width.", type: "number | string", default: '"100%"' },
      { name: "size", description: "Square width/height shorthand; overrides height and width.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio for the chart frame. Min/max variants (minWidth, maxHeight, …) are also supported.", type: "number | string" },
      { name: "flex", description: "CSS flex value for the chart frame within a flex parent.", type: "number | string" }
    ]
  },
  {
    id: "PieChart",
    name: "PieChart",
    description: "Pie / donut chart (Recharts `PieChart`). Use `innerRadius` to create a donut.",
    category: "Charts",
    usage: `<PieChart data={data} series={[{ dataKey: "value", nameKey: "name", innerRadius: "60%" }]} />`,
    props: [
      { name: "data", description: "Tabular dataset. For per-slice colors, add a `fill` field per row (theme tokens or CSS colors).", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Pies to render: { dataKey, nameKey?, innerRadius?, outerRadius?, paddingAngle?, cornerRadius?, color? }. `color` sets the default slice color (theme token or CSS color); per-row `fill` overrides it.", type: "PieSeries[]" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "height", description: "Chart container height.", type: "number | string", default: "220" },
      { name: "width", description: "Chart container width.", type: "number | string", default: '"100%"' },
      { name: "size", description: "Square width/height shorthand; overrides height and width.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio for the chart frame. Min/max variants (minWidth, maxHeight, …) are also supported.", type: "number | string" },
      { name: "flex", description: "CSS flex value for the chart frame within a flex parent.", type: "number | string" }
    ]
  },
  {
    id: "Chart",
    name: "Chart",
    description: "Mixed cartesian chart combining bars/lines/areas via a `series` array.",
    category: "Charts",
    usage: `<Chart data={data} series={[{ type: "bar", dataKey: "Desktop" }, { type: "line", dataKey: "Mobile" }]} xAxis={{ dataKey: "day" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Mixed series: { type: 'bar' | 'line' | 'area', ... }. Colors accept theme tokens or CSS colors.", type: "ComposedSeries[]" },
      { name: "xAxis", description: "X-axis config.", type: "{ dataKey: string; hide?: boolean; labels?: Record<string | number, string> }" },
      { name: "xAxis.hide", description: "Hide the x-axis entirely.", type: "boolean", default: "false" },
      { name: "xAxis.labels", description: "Map raw axis values to display labels.", type: "Record<string | number, string>" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "barGap", description: "Gap between bars within a category.", type: "number" },
      { name: "barCategoryGap", description: "Gap between bar categories.", type: "number" },
      { name: "height", description: "Chart container height.", type: "number | string", default: "220" },
      { name: "width", description: "Chart container width.", type: "number | string", default: '"100%"' },
      { name: "size", description: "Square width/height shorthand; overrides height and width.", type: "number | string" },
      { name: "aspectRatio", description: "CSS aspect-ratio for the chart frame. Min/max variants (minWidth, maxHeight, …) are also supported.", type: "number | string" },
      { name: "flex", description: "CSS flex value for the chart frame within a flex parent.", type: "number | string" }
    ]
  },
  {
    id: "Transition",
    name: "Transition",
    description: "Animate swapping child components.",
    category: "Control flow & state",
    usage: `<Transition>\n  <Card key={state} />\n</Transition>`,
    props: [
      { name: "children", description: "Single child element to animate.", type: "ReactElement" }
    ]
  },
  {
    id: "Avatar",
    name: "Avatar",
    description: "Profile image or initials (custom extension).",
    category: "Content",
    usage: `<Avatar name="Alex" src={image} status="online" />`,
    props: [
      { name: "name", description: "Name for initials; also used as the image alt text.", type: "string" },
      { name: "src", description: "Image source URL.", type: "string" },
      { name: "size", description: "Avatar size in px or a CSS size string.", type: "number | string", default: "40" },
      { name: "radius", description: "Corner radius token.", type: "RadiusValue", default: '"full"' },
      { name: "status", description: "Status dot.", type: "\"online\" | \"offline\" | \"away\" | \"busy\"" }
    ]
  },
  {
    id: "Progress",
    name: "Progress",
    description: "Progress bar (custom extension).",
    category: "Data display",
    usage: `<Progress value={78} label="Milestones" />`,
    props: [
      { name: "value", description: "Progress value; clamped to [0, max].", type: "number" },
      { name: "max", description: "Maximum value.", type: "number", default: "100" },
      { name: "label", description: "Optional label shown above the track.", type: "string" },
      { name: "color", description: "Fill color token or CSS color.", type: "string | ThemeColor" },
      { name: "size", description: "Track thickness.", type: "\"sm\" | \"md\" | \"lg\"", default: '"md"' },
      { name: "showValue", description: "Show the rounded percentage next to the label.", type: "boolean", default: "true" }
    ]
  },
  {
    id: "Accordion",
    name: "Accordion",
    description: "Expandable list of items.",
    category: "Disclosure & overlays",
    usage: `<Accordion items={[{ id: "a", title: "Title", content: "Body" }]} />`,
    props: [
      { name: "items", description: "Accordion items.", type: "Array<{ id: string; title: string; content: string }>" },
      { name: "type", description: "Accordion type.", type: "\"single\" | \"multiple\"", default: '"single"' },
      { name: "collapsible", description: "Allow single accordion to collapse.", type: "boolean", default: "true" }
    ]
  },
  {
    id: "Collapsible",
    name: "Collapsible",
    description: "Toggleable content block.",
    category: "Disclosure & overlays",
    usage: `<Collapsible title="Details" content="Hidden text" />`,
    props: [
      { name: "title", description: "Trigger label.", type: "string" },
      { name: "content", description: "Collapsible content.", type: "string" },
      { name: "defaultOpen", description: "Initially open.", type: "boolean" }
    ]
  },
  {
    id: "Menubar",
    name: "Menubar",
    description: "Top-level menu bar.",
    category: "Disclosure & overlays",
    usage: `<Menubar menus={[{ id: "file", label: "File", items: [{ id: "new", label: "New", action: { type: "file.new" } }] }]} />`,
    props: [
      { name: "menus", description: "Menu definitions; each menu renders a trigger with a dropdown of items.", type: "Array<{ id: string; label: string; items: MenuItem[] }>" },
      { name: "MenuItem.id", description: "Stable item id.", type: "string" },
      { name: "MenuItem.label", description: "Item label.", type: "string" },
      { name: "MenuItem.action", description: "Action dispatched when the item is selected.", type: "{ type: string; payload?: Record<string, unknown> }" },
      { name: "MenuItem.disabled", description: "Disable the item.", type: "boolean" },
      { name: "MenuItem.type", description: "Set to \"separator\" to render a divider instead of a selectable item.", type: '"item" | "separator"', default: '"item"' }
    ]
  },
  {
    id: "ContextMenu",
    name: "ContextMenu",
    description: "Right-click menu for a target.",
    category: "Disclosure & overlays",
    usage: `<ContextMenu triggerLabel="Right click me" items={[{ id: "copy", label: "Copy", action: { type: "item.copy" } }]} />`,
    props: [
      { name: "triggerLabel", description: "Text shown for the trigger.", type: "string" },
      { name: "items", description: "Menu items.", type: "MenuItem[]" },
      { name: "MenuItem.id", description: "Stable item id.", type: "string" },
      { name: "MenuItem.label", description: "Item label.", type: "string" },
      { name: "MenuItem.action", description: "Action dispatched when the item is selected.", type: "{ type: string; payload?: Record<string, unknown> }" },
      { name: "MenuItem.disabled", description: "Disable the item.", type: "boolean" },
      { name: "MenuItem.type", description: "Set to \"separator\" to render a divider instead of a selectable item.", type: '"item" | "separator"', default: '"item"' }
    ]
  },
  {
    id: "Tooltip",
    name: "Tooltip",
    description: "Hover tooltip.",
    category: "Feedback",
    usage: `<Tooltip label="Help" content="More info" delayDuration={150} />`,
    props: [
      { name: "label", description: "Trigger label.", type: "string" },
      { name: "content", description: "Tooltip content.", type: "string" },
      { name: "delayDuration", description: "Hover delay before opening, in milliseconds.", type: "number", default: "150" }
    ]
  },
  {
    id: "Toggle",
    name: "Toggle",
    description: "Binary toggle button.",
    category: "Forms & controls",
    usage: `<Toggle name="subscribe" label="Subscribe" />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "label", description: "Button label.", type: "string" },
      { name: "defaultPressed", description: "Initial pressed state.", type: "boolean" },
      { name: "onChangeAction", description: "Action dispatched with pressed state on change.", type: "ActionConfig" },
      { name: "disabled", description: "Disable interactions.", type: "boolean" }
    ]
  },
  {
    id: "ToggleGroup",
    name: "ToggleGroup",
    description: "Group of toggle buttons.",
    category: "Forms & controls",
    usage: `<ToggleGroup name="view" type="single" options={[{ label: "Grid", value: "grid" }]} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "type", description: "Selection mode.", type: "\"single\" | \"multiple\"", default: '"single"' },
      { name: "options", description: "Toggle options.", type: "Array<{ label: string; value: string }>" },
      { name: "defaultValue", description: "Initial value.", type: "string" },
      { name: "defaultValues", description: "Initial values (multiple).", type: "string[]" },
      { name: "onChangeAction", description: "Action dispatched with selected value(s).", type: "ActionConfig" },
      { name: "disabled", description: "Disable interactions.", type: "boolean" }
    ]
  },
  {
    id: "Slider",
    name: "Slider",
    description: "Continuous range slider.",
    category: "Forms & controls",
    usage: `<Slider name="volume" defaultValue={45} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "defaultValue", description: "Initial value.", type: "number | number[]" },
      { name: "min", description: "Minimum value.", type: "number", default: "0" },
      { name: "max", description: "Maximum value.", type: "number", default: "100" },
      { name: "step", description: "Step size.", type: "number", default: "1" },
      { name: "onChangeAction", description: "Action dispatched with slider value on change.", type: "ActionConfig" },
      { name: "disabled", description: "Disable interactions.", type: "boolean" }
    ]
  },
  {
    id: "Sheet",
    name: "Sheet",
    description: "Side panel overlay.",
    category: "Disclosure & overlays",
    usage: `<Sheet triggerLabel="Open" title="Details" content="Sheet body" />`,
    props: [
      { name: "triggerLabel", description: "Trigger button label.", type: "string" },
      { name: "title", description: "Sheet title.", type: "string" },
      { name: "description", description: "Sheet description.", type: "string" },
      { name: "content", description: "Sheet content.", type: "string" },
      { name: "side", description: "Sheet side.", type: "\"left\" | \"right\" | \"top\" | \"bottom\"" }
    ]
  },
  {
    id: "Drawer",
    name: "Drawer",
    description: "Bottom drawer overlay.",
    category: "Disclosure & overlays",
    usage: `<Drawer triggerLabel="Open" title="Drawer" content="Drawer body" />`,
    props: [
      { name: "triggerLabel", description: "Trigger button label.", type: "string" },
      { name: "title", description: "Drawer title.", type: "string" },
      { name: "description", description: "Drawer description.", type: "string" },
      { name: "content", description: "Drawer content.", type: "string" }
    ]
  },
  {
    id: "Combobox",
    name: "Combobox",
    description: "Searchable select menu.",
    category: "Forms & controls",
    usage: `<Combobox name="assignee" options={[{ label: "Alex", value: "alex" }]} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "options", description: "Selectable options.", type: "Array<{ label: string; value: string }>" },
      { name: "placeholder", description: "Trigger placeholder.", type: "string" },
      { name: "searchPlaceholder", description: "Search input placeholder.", type: "string" },
      { name: "emptyLabel", description: "Empty state text.", type: "string" },
      { name: "defaultValue", description: "Initial selected value.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched with selected value and option.", type: "ActionConfig" },
      { name: "disabled", description: "Disable interactions.", type: "boolean" }
    ]
  },
  {
    id: "InputOTP",
    name: "InputOTP",
    description: "One-time passcode input.",
    category: "Forms & controls",
    usage: `<InputOTP name="code" length={6} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "length", description: "OTP length.", type: "number", default: "6" },
      { name: "groupSize", description: "Slot group size.", type: "number", default: "3" },
      { name: "defaultValue", description: "Initial code value.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched with code value on change.", type: "ActionConfig" },
      { name: "disabled", description: "Disable interactions.", type: "boolean" }
    ]
  },
  {
    id: "Spinner",
    name: "Spinner",
    description: "Inline loading indicator.",
    category: "Feedback",
    usage: `<Spinner size="sm" label="Loading" />`,
    props: [
      { name: "size", description: "Spinner size.", type: "\"xs\" | \"sm\" | \"md\" | \"lg\"", default: '"md"' },
      { name: "label", description: "Optional label.", type: "string" }
    ]
  },
  {
    id: "DataTable",
    name: "DataTable",
    description: "Tabular data display.",
    category: "Data display",
    usage: `<DataTable columns={[{ key: "name", label: "Name" }]} rows={[{ name: "Alex" }]} />`,
    props: [
      { name: "columns", description: "Column definitions; align controls header and cell text alignment.", type: "Array<{ key: string; label: string; align?: \"start\" | \"center\" | \"end\" }>" },
      { name: "rows", description: "Row data; missing cells render an em dash.", type: "Array<Record<string, string | number>>" },
      { name: "caption", description: "Table caption.", type: "string" }
    ]
  },
  {
    id: "Response",
    name: "Response / Debug / Hermes",
    description: "Root-compatible DIL wrappers and runtime fallback blocks. Response/Debug render children; Hermes renders a compact runtime badge.",
    category: "Containers",
    usage: `<Response><Card><Text value="Rendered response" /></Card></Response>`,
    props: [
      { name: "children", description: "Content to render inside the wrapper.", type: "ReactNode" },
      { name: "Response.gap", description: "Gap between response children.", type: "number | string", default: "3" },
      { name: "Response.padding", description: "Response padding.", type: "number | string | Padding" },
      { name: "Response.theme", description: "Accepted for host compatibility; theming comes from children.", type: '"light" | "dark"' },
      { name: "Debug.value", description: "Unknown value rendered as JSON.", type: "unknown" },
      { name: "Debug.label", description: "Debug panel label.", type: "string", default: '"Debug"' },
      { name: "Debug.onVisibleAction", description: "Action fired when debug block enters the viewport.", type: "ActionConfig" },
      { name: "Hermes.title", description: "Runtime fallback title.", type: "string", default: '"Hermes"' },
      { name: "Hermes.subtitle", description: "Runtime fallback subtitle.", type: "string" },
      { name: "CotResolvedIcon.resolved", description: "Whether to show resolved state.", type: "boolean" },
      { name: "CotResolvedIcon.label", description: "Resolved icon label.", type: "string" },
      { name: "FootballLocationIndicator.label", description: "Location indicator label.", type: "string" },
      { name: "FootballLocationIndicator.side", description: "Team side.", type: '"home" | "away"', default: '"home"' }
    ]
  },
  {
    id: "BaseCarousel",
    name: "BaseCarousel",
    description: "Horizontally scrollable carousel with snap behavior and item/media child components.",
    category: "Media",
    usage: `<BaseCarousel visibleItems={2}>\n  <BaseCarousel.Item><Text value="Item" /></BaseCarousel.Item>\n</BaseCarousel>`,
    props: [
      { name: "children", description: "Carousel items.", type: "ReactNode" },
      { name: "visibleItems", description: "Approximate number of items visible.", type: "number | Record<string, number>" },
      { name: "gap", description: "Gap between items.", type: "number | string", default: "2" },
      { name: "showArrows", description: "Show scroll arrows.", type: "boolean", default: "true" },
      { name: "snap", description: "Scroll snap behavior.", type: "\"none\" | \"proximity\" | \"mandatory\"", default: '"proximity"' },
      { name: "snapAlign", description: "Scroll snap alignment for items.", type: '"start" | "center" | "end"', default: '"start"' },
      { name: "flush", description: "Bleed carousel to card edges.", type: "boolean", default: "false" },
      { name: "BaseCarousel.Item.variant", description: "Item surface style.", type: '"none" | "outline" | "soft" | "elevated"', default: '"outline"' },
      { name: "BaseCarousel.Item.padding", description: "Item padding.", type: "number | string | Padding", default: "3" },
      { name: "BaseCarousel.Item.radius", description: "Item corner radius.", type: "RadiusValue", default: '"lg"' },
      { name: "BaseCarousel.Item.minWidth", description: "Minimum item width.", type: "number | string", default: '"220px"' },
      { name: "BaseCarousel.MediaItem.media", description: "Custom media node; otherwise Image props are used.", type: "ReactNode" },
      { name: "BaseCarousel.MediaItem.itemPadding", description: "Media item padding.", type: "number | string | Padding", default: "0" },
      { name: "BaseCarousel.MediaItem.itemRadius", description: "Media item radius.", type: "RadiusValue", default: '"lg"' }
    ]
  },
  {
    id: "CardCarousel",
    name: "CardCarousel / CardLinkItem",
    description: "Card-oriented carousel wrappers for horizontally scrollable related content and links.",
    category: "Media",
    usage: `<CardCarousel><CardLinkItem href="https://example.com"><Text value="Open" /></CardLinkItem></CardCarousel>`,
    props: [
      { name: "visibleItems", description: "Approximate number of cards visible.", type: "number | Record<string, number>" },
      { name: "gap / showArrows / snap / snapAlign / flush", description: "Pass-through BaseCarousel controls.", type: "BaseCarousel props" },
      { name: "onVisibleAction", description: "Action fired once when the carousel enters the viewport.", type: "ActionConfig" },
      { name: "CardLinkItem.children", description: "Card content.", type: "ReactNode" },
      { name: "href", description: "External link for CardLinkItem.", type: "string" },
      { name: "onClickAction", description: "Action dispatched by CardLinkItem instead of href.", type: "ActionConfig" }
    ]
  },
  {
    id: "Grid",
    name: "Grid",
    description: "CSS grid layout with optional Grid.Item spans.",
    category: "Layout",
    usage: `<Grid columns={2}><Grid.Item><Text value="A" /></Grid.Item></Grid>`,
    props: [
      { name: "columns", description: "Column count or CSS grid-template-columns string.", type: "number | string", default: "2" },
      { name: "gap", description: "Grid gap.", type: "number | string", default: "2" },
      { name: "padding", description: "Grid padding.", type: "number | string | Padding" },
      { name: "onVisibleAction", description: "Action fired when grid enters the viewport.", type: "ActionConfig" },
      { name: "Grid.Item.span / columnSpan / colSpan", description: "Grid column span aliases.", type: "number" },
      { name: "Grid.Item.rowSpan", description: "Grid row span.", type: "number" },
      { name: "Grid.Item.padding", description: "Item padding.", type: "number | string | Padding" },
      { name: "Grid.Item.background", description: "Item background color.", type: "string | ThemeColor" },
      { name: "Grid.Item.radius", description: "Item corner radius.", type: "RadiusValue" }
    ]
  },
  {
    id: "Flow",
    name: "Flow / Flow.Item",
    description: "Wrapping or grid-like flow layout with optional item spans.",
    category: "Layout",
    usage: `<Flow columns={3}><Flow.Item span={2}><Text value="Wide" /></Flow.Item></Flow>`,
    props: [
      { name: "columns", description: "Column count or CSS grid-template-columns value.", type: "number | string" },
      { name: "rows", description: "Row count or CSS grid-template-rows value.", type: "number | string" },
      { name: "gap", description: "Gap between flow items.", type: "number | string", default: "2" },
      { name: "layout", description: "Flow behavior.", type: "\"wrap\" | \"grid\" | \"fixed\"", default: '"wrap"' },
      { name: "onVisibleAction", description: "Action fired when flow enters the viewport.", type: "ActionConfig" },
      { name: "Flow.Item.span", description: "Grid column span.", type: "number" },
      { name: "Flow.Item.basis", description: "Flex basis in wrap/fixed layouts.", type: "number | string" },
      { name: "Flow.Item.grow", description: "Flex grow value.", type: "number", default: "0" },
      { name: "Flow.Item.onVisibleAction", description: "Action fired when item enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "OverflowRow",
    name: "OverflowRow",
    description: "Wrapping row that clips after a fixed number of visual rows.",
    category: "Layout",
    usage: `<OverflowRow rows={2}><Badge label="One" /><Badge label="Two" /></OverflowRow>`,
    props: [
      { name: "children", description: "Inline/wrapping children.", type: "ReactNode" },
      { name: "rows", description: "Number of rows to show before clipping.", type: "number", default: "1" },
      { name: "gap", description: "Gap between children.", type: "number | string", default: "2" },
      { name: "onVisibleAction", description: "Action fired when row enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "List",
    name: "List",
    description: "Sequenced list/timeline container with List.Item children.",
    category: "Layout",
    usage: `<List marker="disc"><List.Item><Text value="Step" /></List.Item></List>`,
    props: [
      { name: "marker", description: "Default marker style token, icon name, or custom marker text.", type: "string", default: '"disc"' },
      { name: "connector", description: "Connector line style.", type: "\"none\" | \"solid\"", default: '"none"' },
      { name: "gap", description: "Gap between items.", type: "number | string" },
      { name: "maxMarkerSize", description: "Reserved marker sizing token.", type: '"md" | "lg" | "xl"', default: '"md"' },
      { name: "List.Item.marker", description: "Per-item marker style token, icon name, ReactNode, or custom marker text.", type: "ReactNode | string" },
      { name: "List.Item.onVisibleAction", description: "Action fired when item enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "Pressable",
    name: "Pressable",
    description: "Keyboard-accessible clickable container that dispatches onClickAction.",
    category: "Control flow & state",
    usage: `<Pressable onClickAction={{ type: "copy", handler: "client", payload: { value: "Hi" } }}><Text value="Copy" /></Pressable>`,
    props: [
      { name: "onClickAction", description: "Action dispatched on click, Enter, or Space.", type: "ActionConfig" },
      { name: "onVisibleAction", description: "Action dispatched when visible.", type: "ActionConfig" },
      { name: "disabled", description: "Disable interaction.", type: "boolean" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" },
      { name: "radius", description: "Corner radius.", type: "RadiusValue" },
      { name: "background", description: "Background color.", type: "string | ThemeColor" }
    ]
  },
  {
    id: "Popover",
    name: "Popover",
    description: "Anchored overlay with Popover.Trigger and Popover.Content children.",
    category: "Disclosure & overlays",
    usage: `<Popover><Popover.Trigger><Badge label="Info" /></Popover.Trigger><Popover.Content><Text value="Details" /></Popover.Content></Popover>`,
    props: [
      { name: "open", description: "Controlled open state.", type: "boolean" },
      { name: "showOnHover", description: "Open on hover instead of click.", type: "boolean" },
      { name: "hoverOpenDelay", description: "Hover delay in ms.", type: "number", default: "120" },
      { name: "Popover.Trigger.onClickAction", description: "Action dispatched when trigger is clicked.", type: "ActionConfig" },
      { name: "Popover.Content.side", description: "Overlay side.", type: '"top" | "bottom" | "left" | "right"', default: '"bottom"' },
      { name: "Popover.Content.align", description: "Overlay alignment.", type: '"start" | "center" | "end"', default: '"center"' },
      { name: "Popover.Content.width", description: "Overlay width.", type: "number | string", default: "260" }
    ]
  },
  {
    id: "Table",
    name: "Table",
    description: "Structured DIL table using Table.Row, Table.Cell, and Table.Section children.",
    category: "Data display",
    usage: `<Table><Table.Row><Table.Cell><Text value="Metric" /></Table.Cell></Table.Row></Table>`,
    props: [
      { name: "columnSizing", description: "Column sizing mode.", type: "\"auto\" | \"equal\"", default: '"auto"' },
      { name: "rowDivider", description: "Reserved divider style between rows.", type: "number | Border" },
      { name: "Table.Row.header", description: "Render row cells as header styling when paired with label.", type: "boolean" },
      { name: "Table.Row.label", description: "Optional leading row label cell.", type: "string" },
      { name: "Table.Cell.align", description: "Cell text alignment.", type: '"start" | "center" | "end"', default: '"start"' },
      { name: "Table.Cell.header", description: "Render as th instead of td.", type: "boolean" },
      { name: "Table.Cell.columnSpan", description: "Cell colSpan.", type: "number" },
      { name: "Table.Section.label", description: "Section label row spanning all columns.", type: "string" }
    ]
  },
  {
    id: "Each",
    name: "Each / Show / Scope",
    description: "DIL-style control-flow helpers powered by `$` expression props.",
    category: "Control flow & state",
    usage: `<Each $of="state.items" item="item"><Text $value="item.label" /></Each>`,
    props: [
      { name: "$of", description: "Array expression to iterate.", type: "Expression<unknown[]>" },
      { name: "item", description: "Loop item variable name.", type: "string", default: '"item"' },
      { name: "index", description: "Loop index variable name.", type: "string", default: '"index"' },
      { name: "children", description: "Template rendered for each item.", type: "ReactNode" },
      { name: "$when", description: "Boolean expression for Show / Animate.Item.", type: "Expression<boolean>" },
      { name: "Show.children", description: "Rendered when condition is true.", type: "ReactNode" },
      { name: "Show.Else.children", description: "Fallback branch inside Show.", type: "ReactNode" },
      { name: "Scope.values", description: "Additional scoped values.", type: "Record<string, unknown>" },
      { name: "RunInterval.interval / intervalMs", description: "Tick interval; intervalMs overrides interval.", type: "number" },
      { name: "RunInterval.onTickAction", description: "Action dispatched on each tick.", type: "ActionConfig" },
      { name: "RunInterval.enabled", description: "Enable interval dispatch.", type: "boolean", default: "true" }
    ]
  },
  {
    id: "Animate",
    name: "Animate / AnimateGroup",
    description: "Small Motion-powered wrappers for conditional and repeated children.",
    category: "Control flow & state",
    usage: `<Animate><Animate.Item $when="state.ready"><Text value="Ready" /></Animate.Item></Animate>`,
    props: [
      { name: "children", description: "Animate.Item branches or repeated children.", type: "ReactNode" },
      { name: "Animate.Item.$when", description: "Boolean expression for conditional branch rendering.", type: "Expression<boolean>" },
      { name: "AnimateGroup.$of", description: "Repeat source.", type: "Expression<unknown[]>" },
      { name: "AnimateGroup.item", description: "Loop item variable name.", type: "string", default: '"item"' },
      { name: "AnimateGroup.index", description: "Loop index variable name.", type: "string", default: '"index"' }
    ]
  },
  {
    id: "AudioPlayer",
    name: "AudioPlayer",
    description: "Compact audio transport with native audio controls.",
    category: "Media",
    usage: `<AudioPlayer src="https://example.com/audio.mp3" title="Briefing" compact />`,
    props: [
      { name: "src", description: "Audio URL.", type: "string" },
      { name: "title", description: "Primary title.", type: "string" },
      { name: "subtitle", description: "Secondary text.", type: "string" },
      { name: "durationSeconds", description: "Reserved duration metadata.", type: "number" },
      { name: "compact", description: "Use compact custom controls.", type: "boolean" },
      { name: "autoPlay", description: "Start playback automatically when allowed by the browser.", type: "boolean", default: "false" },
      { name: "loop", description: "Loop playback.", type: "boolean", default: "false" },
      { name: "muted", description: "Start muted.", type: "boolean", default: "false" },
      { name: "preload", description: "Native preload behavior.", type: '"none" | "metadata" | "auto"', default: '"metadata"' },
      { name: "defaultPlaybackRate", description: "Initial playback rate.", type: "number", default: "1" },
      { name: "downloadUrl", description: "Download link override.", type: "string" },
      { name: "downloadFilename", description: "Suggested download filename.", type: "string" }
    ]
  },
  {
    id: "YouTubeEmbed",
    name: "YouTubeEmbed",
    description: "Responsive YouTube iframe embed using a videoId or explicit embed src.",
    category: "Media",
    usage: `<YouTubeEmbed videoId="dQw4w9WgXcQ" title="Demo video" height={220} />`,
    props: [
      { name: "videoId", description: "YouTube video id; used to build embed URL.", type: "string" },
      { name: "src", description: "Explicit embed URL override.", type: "string" },
      { name: "title", description: "Iframe title.", type: "string", default: '"YouTube video"' },
      { name: "height", description: "Iframe height.", type: "number | string", default: "220" }
    ]
  },
  {
    id: "Map",
    name: "Map",
    description: "Token-free map fallback with markers and routes.",
    category: "Media",
    usage: `<Map markers={[{ latitude: 37.77, longitude: -122.43 }]} height={220} />`,
    props: [
      { name: "markers", description: "Marker objects with latitude and longitude.", type: "Array<MapMarker>" },
      { name: "routes", description: "Polyline route objects.", type: "Array<Route>" },
      { name: "height", description: "Map height.", type: "number | string", default: "220" },
      { name: "width", description: "Map width.", type: "number | string", default: '"100%"' },
      { name: "radius", description: "Map corner radius.", type: "RadiusValue", default: '"lg"' },
      { name: "frame", description: "Draw a frame.", type: "boolean", default: "true" },
      { name: "background", description: "Map background color.", type: "string | ThemeColor", default: '"surface-secondary"' }
    ]
  },
  {
    id: "SegmentedControl",
    name: "SegmentedControl",
    description: "Compact segmented option selector.",
    category: "Forms & controls",
    usage: `<SegmentedControl name="view" options={[{ label: "List", value: "list" }]} />`,
    props: [
      { name: "name", description: "Form field name.", type: "string" },
      { name: "options", description: "Selectable options.", type: "Array<{ label: string; value: string }>" },
      { name: "value", description: "Controlled selected value.", type: "string" },
      { name: "defaultValue", description: "Initial selected value.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched when selection changes.", type: "ActionConfig" },
      { name: "ariaLabel", description: "Accessible group label override.", type: "string" },
      { name: "block", description: "Full-width control.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable all options.", type: "boolean", default: "false" },
      { name: "pill", description: "Pill-shaped control.", type: "boolean", default: "false" },
      { name: "size", description: "Control height.", type: "ControlSize", default: '"md"' },
      { name: "textSize", description: "Option text size.", type: "TextSize", default: '"sm"' },
      { name: "variant", description: "Visual variant.", type: '"default" | "ghost"', default: '"default"' }
    ]
  },
  {
    id: "LoadingBlock",
    name: "Loading primitives",
    description: "LoadingBlock, LoadingDot, LoadingIndicator, PulseIndicator, and ShimmerText feedback primitives.",
    category: "Feedback",
    usage: `<PulseIndicator label="Streaming" />
<ShimmerText value="Preparing response" size="sm" />
<LoadingBlock height={40} radius="lg" />
<Row gap={1}>
  <LoadingDot size={6} color="gray" />
  <LoadingDot size={8} color="blue" />
  <LoadingDot size={10} color="green" />
</Row>
<LoadingIndicator label="Loading next card" />`,
    props: [
      { name: "LoadingBlock.height", description: "Skeleton block height.", type: "number | string", default: "64" },
      { name: "LoadingBlock.width", description: "Skeleton block width.", type: "number | string", default: '"100%"' },
      { name: "LoadingBlock.radius", description: "Skeleton block corner radius.", type: "RadiusValue", default: '"md"' },
      { name: "LoadingDot.size", description: "Dot diameter.", type: "number | string", default: "8" },
      { name: "LoadingDot.color", description: "Dot color token or CSS color.", type: "string | ThemeColor", default: '"secondary"' },
      { name: "LoadingIndicator.label", description: "Text shown after the animated dots.", type: "string", default: '"Loading"' },
      { name: "PulseIndicator.color", description: "Pulse color token or CSS color.", type: "string | ThemeColor", default: '"success"' },
      { name: "PulseIndicator.label", description: "Optional status text shown after the pulse.", type: "string" },
      { name: "ShimmerText.value", description: "Text rendered with shimmer styling.", type: "string" },
      { name: "ShimmerText.size", description: "Text size token.", type: "TextSize", default: '"md"' }
    ]
  },
  {
    id: "Bold",
    name: "Bold",
    description: "Inline bold emphasis primitive for text runs.",
    category: "Typography",
    usage: `<Text><Bold value="Important" /></Text>`,
    props: [
      { name: "value", description: "Inline text value.", type: "string" },
      { name: "children", description: "Optional child content when value is omitted.", type: "ReactNode" },
      { name: "color", description: "Text color token or CSS color.", type: "string | ThemeColor" },
      { name: "size", description: "Text size token.", type: "TextSize" }
    ]
  },
  {
    id: "Italic",
    name: "Italic",
    description: "Inline italic emphasis primitive for text runs.",
    category: "Typography",
    usage: `<Text><Italic value="context" /></Text>`,
    props: [
      { name: "value", description: "Inline text value.", type: "string" },
      { name: "children", description: "Optional child content when value is omitted.", type: "ReactNode" },
      { name: "color", description: "Text color token or CSS color.", type: "string | ThemeColor" },
      { name: "size", description: "Text size token.", type: "TextSize" }
    ]
  },
  {
    id: "Underline",
    name: "Underline",
    description: "Inline underlined emphasis primitive for text runs.",
    category: "Typography",
    usage: `<Text><Underline value="underlined" /></Text>`,
    props: [
      { name: "value", description: "Inline text value.", type: "string" },
      { name: "children", description: "Optional child content when value is omitted.", type: "ReactNode" },
      { name: "color", description: "Text color token or CSS color.", type: "string | ThemeColor" },
      { name: "size", description: "Text size token.", type: "TextSize" }
    ]
  },
  {
    id: "Code",
    name: "Code",
    description: "Inline code-style primitive for short identifiers and snippets.",
    category: "Typography",
    usage: `<Text>Run <Code value="npm test" /></Text>`,
    props: [
      { name: "value", description: "Inline code text value.", type: "string" },
      { name: "children", description: "Optional child content when value is omitted.", type: "ReactNode" }
    ]
  },
  {
    id: "Math",
    name: "Math",
    description: "Inline math-style text primitive using serif italic styling.",
    category: "Typography",
    usage: `<Text><Math value="E=mc^2" /></Text>`,
    props: [
      { name: "value", description: "Inline math text value.", type: "string" },
      { name: "children", description: "Optional child content when value is omitted.", type: "ReactNode" }
    ]
  },
  {
    id: "Highlight",
    name: "Highlight",
    description: "Inline marked-text primitive for calling attention to short text.",
    category: "Typography",
    usage: `<Text><Highlight value="Marked" color="yellow" /></Text>`,
    props: [
      { name: "value", description: "Highlighted text value.", type: "string" },
      { name: "children", description: "Optional child content when value is omitted.", type: "ReactNode" },
      { name: "color", description: "Highlight background color token or CSS color.", type: "string | ThemeColor", default: '"yellow"' }
    ]
  },
  {
    id: "Inline",
    name: "Inline",
    description: "Inline flex helper for composing rich text primitives inside a sentence.",
    category: "Layout",
    usage: `<Inline gap={1} wrap="wrap"><Bold value="Bold" /><Code value="code()" /><Highlight value="Marked" /></Inline>`,
    props: [
      { name: "children", description: "Inline primitive children.", type: "ReactNode" },
      { name: "gap", description: "Space between inline children.", type: "number | string", default: "1" },
      { name: "align", description: "Cross-axis alignment for grouped inline children.", type: "Alignment", default: '"center"' },
      { name: "wrap", description: "Whether grouped inline children may wrap in constrained cards.", type: '"nowrap" | "wrap" | "wrap-reverse"', default: '"wrap"' },
      { name: "onVisibleAction", description: "Action fired once when the inline group enters the viewport.", type: "ActionConfig" }
    ]
  },
  {
    id: "Stat",
    name: "Stat",
    description: "Single metric with an optional trend delta, icon, and helper text.",
    category: "Data display",
    usage: `<Stat label="Revenue" value="$48.2k" delta="+12.4%" deltaLabel="vs last month" />`,
    props: [
      { name: "label", description: "Metric label shown above the value.", type: "string" },
      { name: "value", description: "Metric value.", type: "string | number" },
      { name: "delta", description: "Change indicator rendered next to a trend arrow. The trend is inferred from its numeric sign.", type: "string | number" },
      { name: "deltaLabel", description: "Context text shown after the delta (e.g. \"vs last month\").", type: "string" },
      { name: "trend", description: "Force the delta direction instead of inferring it from the sign.", type: '"up" | "down" | "flat"' },
      { name: "upIsPositive", description: "Semantic direction: is \"up\" good (default) or bad (e.g. costs, churn)? Controls the delta color.", type: "boolean", default: "true" },
      { name: "icon", description: "Optional icon shown before the label.", type: "WidgetIcon" },
      { name: "helpText", description: "Helper text shown below the value when no deltaLabel is set.", type: "string" },
      { name: "align", description: "Horizontal alignment of the stat block.", type: "TextAlign", default: '"start"' },
      { name: "size", description: "Value text size.", type: "\"sm\" | \"md\" | \"lg\"", default: '"md"' }
    ]
  },
  {
    id: "Sparkline",
    name: "Sparkline",
    description: "Dependency-free inline trend line with an optional gradient fill.",
    category: "Data display",
    usage: `<Sparkline data={[4, 8, 6, 12, 10, 16]} height={36} />`,
    props: [
      { name: "data", description: "Numeric series to plot. Renders nothing with fewer than 2 points.", type: "number[]" },
      { name: "color", description: "Line color token or CSS color.", type: "string | ThemeColor", default: "accent" },
      { name: "width", description: "Sparkline width.", type: "number | string", default: '"100%"' },
      { name: "height", description: "Sparkline height.", type: "number | string", default: "36" },
      { name: "fill", description: "Draw a gradient area fill under the line.", type: "boolean", default: "true" },
      { name: "strokeWidth", description: "Line stroke width.", type: "number", default: "2" }
    ]
  },
  {
    id: "KeyValue",
    name: "KeyValue",
    description: "Aligned label/value pairs for detail views.",
    category: "Data display",
    usage: `<KeyValue divider rows={[{ label: "Total", value: "$236.90", emphasis: true }]} />`,
    props: [
      { name: "rows", description: "Label/value rows. emphasis renders the value bolder; color tints the value.", type: "Array<{ label: string; value: string | number; icon?: WidgetIcon; emphasis?: boolean; color?: string | ThemeColor }>" },
      { name: "gap", description: "Gap between rows (ignored when divider is set).", type: "number | string", default: "2" },
      { name: "divider", description: "Draw a hairline divider between rows.", type: "boolean", default: "false" },
      { name: "labelWidth", description: "Fixed label column width.", type: "number | string" }
    ]
  },
  {
    id: "Timeline",
    name: "Timeline",
    description: "Vertical sequence of events with a connector rail.",
    category: "Data display",
    usage: `<Timeline items={[{ title: "Shipped", time: "9:41 AM", state: "done" }, { title: "Out for delivery", state: "active" }]} />`,
    props: [
      { name: "items", description: "Timeline events in order. state defaults to \"done\"; \"active\" highlights the dot, \"upcoming\" dims the entry. color overrides the dot tone.", type: "Array<{ title: string; description?: string; time?: string; icon?: WidgetIcon; color?: \"neutral\" | \"accent\" | \"info\" | \"success\" | \"warning\" | \"danger\" | \"discovery\"; state?: \"done\" | \"active\" | \"upcoming\" }>" },
      { name: "gap", description: "Extra gap between entries.", type: "number | string", default: "0" }
    ]
  },
  {
    id: "Steps",
    name: "Steps",
    description: "Horizontal progress indicator for multi-step flows.",
    category: "Data display",
    usage: `<Steps current={1} items={[{ label: "Cart" }, { label: "Shipping" }, { label: "Payment" }]} />`,
    props: [
      { name: "items", description: "Step definitions in order.", type: "Array<{ label: string; description?: string }>" },
      { name: "current", description: "Zero-based index of the active step. Earlier steps render as done, later ones as upcoming.", type: "number", default: "0" },
      { name: "color", description: "Tone for done/active step bars.", type: '"neutral" | "accent" | "info" | "success" | "warning" | "danger" | "discovery"', default: '"accent"' }
    ]
  },
  {
    id: "Callout",
    name: "Callout",
    description: "Inline banner for info, success, warning, or danger messages.",
    category: "Feedback",
    usage: `<Callout color="warning" title="Usage limit" description="You are at 92% of the plan quota." />`,
    props: [
      { name: "title", description: "Callout heading.", type: "string" },
      { name: "description", description: "Supporting text.", type: "string" },
      { name: "children", description: "Optional extra content rendered below the description.", type: "ReactNode" },
      { name: "color", description: "Banner tone.", type: '"neutral" | "accent" | "info" | "success" | "warning" | "danger" | "discovery"', default: '"info"' },
      { name: "icon", description: "Leading icon; defaults to a tone-appropriate icon. Pass \"none\" to hide it.", type: 'WidgetIcon | "none"' },
      { name: "action", description: "Optional trailing action button.", type: "{ label: string; action: ActionConfig }" }
    ]
  },
  {
    id: "EmptyState",
    name: "EmptyState",
    description: "Friendly placeholder for empty lists and no-result states.",
    category: "Feedback",
    usage: `<EmptyState icon="inbox" title="No notifications" description="You're all caught up." />`,
    props: [
      { name: "icon", description: "Icon shown in the badge above the title.", type: "WidgetIcon", default: '"inbox"' },
      { name: "title", description: "Empty-state heading.", type: "string" },
      { name: "description", description: "Supporting text (max-width constrained).", type: "string" },
      { name: "action", description: "Optional call-to-action button.", type: "{ label: string; action: ActionConfig }" },
      { name: "padding", description: "Padding around the block, in spacing units (×4px).", type: "number | string", default: "6" }
    ]
  },
  {
    id: "Rating",
    name: "Rating",
    description: "Star rating with fractional fill.",
    category: "Content",
    usage: `<Rating value={4.3} showValue count={128} />`,
    props: [
      { name: "value", description: "Rating value; supports fractions and is clamped to [0, max].", type: "number" },
      { name: "max", description: "Number of stars.", type: "number", default: "5" },
      { name: "size", description: "Star size.", type: "\"sm\" | \"md\" | \"lg\"", default: '"md"' },
      { name: "color", description: "Filled-star color token or CSS color.", type: "string | ThemeColor", default: "#f59e0b" },
      { name: "showValue", description: "Show the numeric value after the stars.", type: "boolean", default: "false" },
      { name: "count", description: "Review count shown in parentheses.", type: "number | string" }
    ]
  },
  {
    id: "ChipGroup",
    name: "ChipGroup",
    description: "Wrapping set of selectable chips with single or multiple selection.",
    category: "Forms & controls",
    usage: `<ChipGroup name="topics" type="multiple" options={[{ label: "Design", value: "design" }]} />`,
    props: [
      { name: "name", description: "Form field name; the selection is written to the nearest form.", type: "string" },
      { name: "options", description: "Chip options.", type: "Array<{ label: string; value: string; icon?: WidgetIcon; disabled?: boolean }>" },
      { name: "type", description: "Selection mode. Single mode allows deselecting the active chip.", type: "\"single\" | \"multiple\"", default: '"single"' },
      { name: "defaultValue", description: "Initial value (single mode).", type: "string" },
      { name: "defaultValues", description: "Initial values (multiple mode).", type: "string[]" },
      { name: "onChangeAction", description: "Action dispatched with the next selection on change.", type: "ActionConfig" },
      { name: "size", description: "Chip size.", type: "\"sm\" | \"md\"", default: '"md"' },
      { name: "disabled", description: "Disable all chips.", type: "boolean" }
    ]
  },
  {
    id: "Tabs",
    name: "Tabs",
    description: "Lightweight in-widget tab switcher; panels register by id via Tabs.Panel.",
    category: "Disclosure & overlays",
    usage: `<Tabs tabs={[{ id: "a", label: "Tab A" }, { id: "b", label: "Tab B" }]}>\n  <Tabs.Panel id="a"><Text value="Panel A" /></Tabs.Panel>\n  <Tabs.Panel id="b"><Text value="Panel B" /></Tabs.Panel>\n</Tabs>`,
    props: [
      { name: "tabs", description: "Tab definitions rendered in the tab list.", type: "Array<{ id: string; label: string; icon?: WidgetIcon }>" },
      { name: "defaultTab", description: "Initially active tab id; defaults to the first tab.", type: "string" },
      { name: "name", description: "Form field name; the active tab id is written to the nearest form.", type: "string" },
      { name: "onChangeAction", description: "Action dispatched with the selected tab id on change.", type: "ActionConfig" },
      { name: "children", description: "Tabs.Panel nodes (one per tab).", type: "ReactNode" },
      { name: "Tabs.Panel.id", description: "Panel id; the panel renders only while it matches the active tab.", type: "string" },
      { name: "Tabs.Panel.children", description: "Panel content.", type: "ReactNode" }
    ]
  },
  {
    id: "ThinkingState",
    name: "Thinking State",
    description: "Compact live-status label with an icon, shimmer, and optional elapsed value.",
    category: "Agent status & reasoning",
    usage: `<ThinkingState label="Analyzing" elapsed="3s" />`,
    props: [
      { name: "label", description: "Status text.", type: "string", default: '"Thinking"' },
      { name: "active", description: "Apply the active shimmer treatment.", type: "boolean", default: "true" },
      { name: "elapsed", description: "Optional elapsed-time text or number.", type: "string | number" },
      { name: "icon", description: "Leading status icon.", type: "WidgetIcon", default: '"sparkle"' }
    ]
  },
  {
    id: "ThinkingReasoning",
    name: "Thinking Reasoning",
    description: "Expandable reasoning trace with status-aware steps and an active or completed heading.",
    category: "Agent status & reasoning",
    usage: `<ThinkingReasoning summary="Thought for 4s" steps={[{ label: "Inspect inputs", status: "completed" }]} />`,
    props: thinkingReasoningProps
  },
  {
    id: "Thinking",
    name: "Thinking",
    description: "Alias of ThinkingReasoning for concise agent templates.",
    category: "Agent status & reasoning",
    usage: `<Thinking active steps={[{ label: "Compare options", status: "running" }]} />`,
    props: thinkingReasoningProps
  },
  {
    id: "Orb",
    name: "Orb",
    description: "Animated agent activity glyph with 25 distinct choreographies across the lattice, globe, ring, lens, and morph families — the live example animates every variant.",
    category: "Agent status & reasoning",
    usage: `<Orb variant="C3" size={24} label="Streaming" />`,
    props: orbProps
  },
  {
    id: "Orbs",
    name: "Orbs",
    description: "Alias of Orb for compatibility with plural component naming.",
    category: "Agent status & reasoning",
    usage: `<Orbs variant="G4" label="Syncing" />`,
    props: orbProps
  },
  {
    id: "LoadingState",
    name: "Loading State",
    description: "Labeled agent loading row backed by a purpose-specific orb animation.",
    category: "Agent status & reasoning",
    usage: `<LoadingState label="Searching sources" variant="orbit" elapsed="8s" />`,
    props: [
      { name: "label", description: "Loading-state text.", type: "string", default: '"Working"' },
      { name: "elapsed", description: "Optional elapsed-time text or number.", type: "string | number" },
      { name: "variant", description: "Visual loading treatment.", type: '"drive" | "dots" | "orbit" | "surfer"', default: '"drive"' }
    ]
  },
  {
    id: "TextResponse",
    name: "Text Response",
    description: "Prose surface for a completed assistant response.",
    category: "Agent responses",
    usage: `<TextResponse value="The deployment completed successfully." />`,
    props: [
      { name: "value", description: "Response text; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional response content when value is omitted.", type: "ReactNode" },
      { name: "compact", description: "Use tighter response spacing.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "StreamingText",
    name: "Streaming Text",
    description: "Typewriter response with a caret, source disclosure, actions, and follow-up prompts.",
    category: "Agent responses",
    usage: `<StreamingText text="Here is the result." speed={24} />`,
    props: [
      { name: "text", description: "Complete text progressively revealed by the component.", type: "string" },
      { name: "streaming", description: "Animate text reveal; false renders the full value immediately.", type: "boolean", default: "true" },
      { name: "speed", description: "Milliseconds between two-character reveal steps, clamped to at least 8ms.", type: "number", default: "10" },
      { name: "sources", description: "Sources displayed in a collapsible source list.", type: "Array<{ id?: string | number; label: string; host?: string; url?: string }>" },
      { name: "actions", description: "Actions shown below the response.", type: "Array<{ label: string; action: ActionConfig; icon?: WidgetIcon }>" },
      { name: "followUps", description: "Suggested follow-up actions.", type: "Array<{ label: string; action: ActionConfig; icon?: WidgetIcon }>" }
    ]
  },
  {
    id: "InlineCitations",
    name: "Inline Citations",
    description: "Response text that resolves numeric citation markers into a compact source list.",
    category: "Agent responses",
    usage: `<InlineCitations text="Revenue grew 18%.[1]" sources={[{ label: "Q2 report", host: "example.com" }]} />`,
    props: [
      { name: "text", description: "Text containing citation markers such as [1].", type: "string" },
      { name: "sources", description: "Ordered citation sources; ids override displayed source numbers.", type: "Array<{ id?: string | number; label: string; host?: string; url?: string }>" }
    ]
  },
  {
    id: "CodeBlock",
    name: "Code Block",
    description: "Scrollable code output with metadata, line numbers, highlighting, and copy feedback.",
    category: "Agent responses",
    usage: `<CodeBlock code="npm run build" language="shell" />`,
    props: [
      { name: "code", description: "Code string to render.", type: "string" },
      { name: "language", description: "Language label shown in the header.", type: "string", default: '"text"' },
      { name: "file", description: "Optional filename shown as the primary header label.", type: "string" },
      { name: "showLineNumbers", description: "Show the numbered gutter.", type: "boolean", default: "true" },
      { name: "copyable", description: "Show the copy control.", type: "boolean", default: "true" },
      { name: "streaming", description: "Apply streaming-line presentation.", type: "boolean", default: "false" },
      { name: "highlightLines", description: "One-based line numbers to emphasize.", type: "number[]" },
      { name: "onCopyAction", description: "Custom copy action; defaults to the built-in client copy handler.", type: "ActionConfig" }
    ]
  },
  {
    id: "FileDiff",
    name: "File Diff",
    description: "Inline source diff with old/new gutters and computed addition and removal totals.",
    category: "Agent responses",
    usage: `<FileDiff file="src/app.ts" rows={[{ oldLine: 1, newLine: 1, type: "context", text: "export const ready = true;" }]} />`,
    props: [
      { name: "file", description: "Changed file path or name.", type: "string" },
      { name: "rows", description: "Diff rows with optional old and new line numbers.", type: 'Array<{ oldLine?: number; newLine?: number; type?: "context" | "add" | "remove"; text: string }>' },
      { name: "language", description: "Optional language label shown beside the filename.", type: "string" },
      { name: "compact", description: "Use the compact diff density.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "ImageGeneration",
    name: "Image Generation",
    description: "Animated generation canvas that can transition to a finished image.",
    category: "Agent responses",
    usage: `<ImageGeneration prompt="A glass observatory at sunrise" aspectRatio="landscape" progress={64} />`,
    props: [
      { name: "prompt", description: "Prompt caption shown beneath the canvas.", type: "string", default: '"Generating a new image"' },
      { name: "resolution", description: "Resolution badge text.", type: "string", default: '"1024 × 1024"' },
      { name: "aspectRatio", description: "Named aspect preset or any CSS aspect-ratio value.", type: '"square" | "portrait" | "landscape" | string', default: '"square"' },
      { name: "progress", description: "Optional completion percentage, clamped to 0–100.", type: "number" },
      { name: "status", description: "Generation status label.", type: "string", default: '"Generating image"' },
      { name: "image", description: "Completed image URL; only safe HTTP(S) URLs render.", type: "string" },
      { name: "alt", description: "Alternative text for a completed image.", type: "string", default: '"Generated image"' }
    ]
  },
  {
    id: "TaskList",
    name: "Task List",
    description: "Collapsible agent to-do list with progress, nested task data, and status-aware rows.",
    category: "Agent tasks & tools",
    usage: `<TaskList items={[{ label: "Run tests", status: "running", progress: 60 }]} />`,
    props: [
      { name: "title", description: "List heading.", type: "string", default: '"To-dos"' },
      { name: "items", description: "Agent tasks displayed in order.", type: 'Array<{ id?: string | number; label: string; detail?: string; status?: "pending" | "running" | "completed" | "failed" | "cancelled"; progress?: number; children?: Array<{ label: string; detail?: string; status?: "pending" | "running" | "completed" | "failed" | "cancelled" }> }>' },
      { name: "defaultOpen", description: "Initial expanded state.", type: "boolean", default: "true" },
      { name: "collapsible", description: "Allow the heading to collapse the task rows.", type: "boolean", default: "true" },
      { name: "onItemClickAction", description: "Action dispatched with the selected task and id.", type: "ActionConfig" }
    ]
  },
  {
    id: "TaskRows",
    name: "Task Rows",
    description: "Compact task capsules or expanded rows with optional child steps.",
    category: "Agent tasks & tools",
    usage: `<TaskRows variant="list" items={[{ label: "Publish", status: "completed" }]} />`,
    props: [
      { name: "items", description: "Agent tasks, including optional nested children for list mode.", type: 'Array<{ id?: string | number; label: string; detail?: string; status?: "pending" | "running" | "completed" | "failed" | "cancelled"; progress?: number; children?: Array<{ label: string; detail?: string; status?: "pending" | "running" | "completed" | "failed" | "cancelled" }> }>' },
      { name: "variant", description: "Task row presentation.", type: '"capsules" | "list"', default: '"capsules"' },
      { name: "onItemClickAction", description: "Action dispatched with the selected task and id.", type: "ActionConfig" }
    ]
  },
  {
    id: "ToolChips",
    name: "Tool Chips",
    description: "Collapsible activity summary for reads, writes, commands, searches, and other tool calls.",
    category: "Agent tasks & tools",
    usage: `<ToolChips items={[{ type: "write", label: "Updated app.ts", status: "completed", additions: 12 }]} />`,
    props: [
      { name: "summary", description: "Custom summary label; defaults to the item count.", type: "string" },
      { name: "items", description: "Tool activity entries.", type: 'Array<{ id?: string | number; type?: "thinking" | "write" | "command" | "read" | "message" | "search"; label: string; detail?: string; status?: "pending" | "running" | "completed" | "failed" | "cancelled"; additions?: number; deletions?: number }>' },
      { name: "defaultOpen", description: "Initial expanded state.", type: "boolean", default: "true" },
      { name: "onItemClickAction", description: "Action dispatched with the selected tool item and id.", type: "ActionConfig" }
    ]
  },
  {
    id: "AgentInput",
    name: "Agent Input",
    description: "Agent prompt composer with attachment, enhancement, model selection, and submit actions.",
    category: "Agent interfaces",
    usage: `<AgentInput placeholder="Ask the workspace" models={[{ value: "fast", label: "Fast" }]} submitAction={{ type: "agent.submit" }} />`,
    props: agentInputProps
  },
  {
    id: "PromptInput",
    name: "Prompt Input",
    description: "Alias of AgentInput for prompt-focused templates.",
    category: "Agent interfaces",
    usage: `<PromptInput defaultValue="Summarize this report" submitAction={{ type: "prompt.submit" }} />`,
    props: agentInputProps
  },
  {
    id: "ApprovalCard",
    name: "Approval Card",
    description: "Human-in-the-loop approval surface for questions, shell commands, and execution plans.",
    category: "Agent interfaces",
    usage: `<ApprovalCard variant="command" title="Run migration?" command="npm run migrate" approveAction={{ type: "command.run" }} />`,
    props: [
      { name: "variant", description: "Approval content mode.", type: '"questions" | "command" | "plan"', default: '"questions"' },
      { name: "title", description: "Approval heading.", type: "string" },
      { name: "description", description: "Supporting explanation.", type: "string" },
      { name: "options", description: "Radio options for question mode.", type: "Array<{ label: string; value: string; description?: string }>" },
      { name: "questions", description: "Multi-step question definitions; when present these replace the single title/options question.", type: 'Array<{ id: string; title: string; description?: string; options?: Array<{ label: string; value: string; description?: string }>; multiple?: boolean; allowOther?: boolean; otherPlaceholder?: string }>' },
      { name: "defaultValue", description: "Initially selected question option.", type: "string", default: '""' },
      { name: "allowOther", description: "Show a free-text answer in question mode.", type: "boolean", default: "true" },
      { name: "otherPlaceholder", description: "Free-text answer placeholder.", type: "string", default: '"Type something…"' },
      { name: "autoAdvance", description: "Advance after selecting a single-choice answer when another question remains.", type: "boolean", default: "false" },
      { name: "command", description: "Shell command shown in command mode.", type: "string" },
      { name: "planItems", description: "Ordered steps shown in plan mode.", type: "string[]" },
      { name: "approveLabel", description: "Primary action label.", type: "string", default: '"Approve"' },
      { name: "rejectLabel", description: "Secondary rejection or skip label.", type: "string", default: '"Skip"' },
      { name: "approveAction", description: "Primary action, dispatched with the selected or free-text answer.", type: "ActionConfig" },
      { name: "rejectAction", description: "Fallback secondary action.", type: "ActionConfig" },
      { name: "skipAction", description: "Preferred skip action; takes precedence over rejectAction.", type: "ActionConfig" },
      { name: "viewAction", description: "Optional action for opening full plan details.", type: "ActionConfig" },
      { name: "onQuestionChangeAction", description: "Action dispatched with the next question index and id.", type: "ActionConfig" },
      { name: "countdown", description: "Optional auto-approval countdown text in seconds.", type: "number" }
    ]
  },
  {
    id: "Chat",
    name: "Chat",
    description: "Tabbed agent conversation containing user, assistant, reasoning, and tool messages plus a composer.",
    category: "Agent interfaces",
    usage: `<Chat messages={[{ role: "assistant", content: "How can I help?" }]} sendAction={{ type: "chat.send" }} />`,
    props: [
      { name: "tabs", description: "Optional conversation tabs.", type: "Array<{ id: string; label: string }>" },
      { name: "defaultTab", description: "Initially selected tab id; defaults to the first tab.", type: "string" },
      { name: "messages", description: "Conversation messages in display order.", type: 'Array<{ id?: string | number; role?: "user" | "assistant" | "tool" | "reasoning"; content: string; label?: string; detail?: string; duration?: string }>' },
      { name: "placeholder", description: "Composer placeholder.", type: "string", default: '"Write a message…"' },
      { name: "sendAction", description: "Action used by the embedded prompt composer.", type: "ActionConfig" },
      { name: "onTabChangeAction", description: "Action dispatched with the selected tab id.", type: "ActionConfig" }
    ]
  },
  {
    id: "PromptBar",
    name: "Prompt Bar",
    description: "Agent composer with selectable context sources and visible selected-source chips.",
    category: "Agent interfaces",
    usage: `<PromptBar sources={[{ id: "docs", label: "Product docs", connected: true }]} selectedSources={["docs"]} submitAction={{ type: "prompt.submit" }} />`,
    props: [
      ...agentInputProps,
      { name: "sources", description: "Context sources displayed by the source picker.", type: "Array<{ id: string; label: string; description?: string; icon?: WidgetIcon; connected?: boolean }>" },
      { name: "selectedSources", description: "Source ids shown as selected chips.", type: "string[]" },
      { name: "variant", description: "Outer composer shape.", type: '"rounded" | "pill"', default: '"rounded"' },
      { name: "sourceAction", description: "Action dispatched with the selected source id.", type: "ActionConfig" }
    ]
  },
  {
    id: "RecommendationCard",
    name: "Recommendation Card",
    description: "Agent recommendation with confidence, alternative choices, and acceptance actions.",
    category: "Agent interfaces",
    usage: `<RecommendationCard title="Ship the cached query plan" confidence={0.91} acceptAction={{ type: "recommendation.accept" }} />`,
    props: [
      { name: "title", description: "Recommendation heading.", type: "string" },
      { name: "description", description: "Supporting rationale.", type: "string" },
      { name: "confidence", description: "Confidence from 0–1 or as a percentage from 0–100.", type: "number", default: "0.85" },
      { name: "confidenceLabel", description: "Custom confidence label; otherwise inferred from confidence.", type: "string" },
      { name: "alternatives", description: "Alternative recommendations with optional direct actions.", type: "Array<{ label: string; description?: string; status?: string; action?: ActionConfig }>" },
      { name: "acceptLabel", description: "Primary action label.", type: "string", default: '"Accept"' },
      { name: "acceptAction", description: "Primary acceptance action.", type: "ActionConfig" },
      { name: "alternativesAction", description: "Action for requesting or opening alternatives.", type: "ActionConfig" }
    ]
  },
  {
    id: "ComparisonTable",
    name: "Comparison Table",
    description: "Accessible feature-by-plan comparison matrix with boolean and scalar values.",
    category: "Agent workspaces",
    usage: `<ComparisonTable plans={["Starter", "Pro"]} features={[{ label: "Audit log", values: [false, true] }]} />`,
    props: [
      { name: "label", description: "Accessible region label.", type: "string", default: '"Feature comparison"' },
      { name: "plans", description: "Plan or option names used as column headings.", type: "string[]" },
      { name: "features", description: "Feature rows; values align by index with plans.", type: "Array<{ label: string; values: Array<boolean | string | number> }>" },
      { name: "highlightPlan", description: "Zero-based plan column to emphasize.", type: "number" }
    ]
  },
  {
    id: "ContextCards",
    name: "Context Cards",
    description: "Stack of retrieved context chunks with excerpts, source metadata, and selection actions.",
    category: "Agent workspaces",
    usage: `<ContextCards items={[{ title: "Release notes", excerpt: "The renderer now supports agent workspaces.", source: { label: "docs.md", type: "MD" } }]} />`,
    props: [
      { name: "title", description: "Collection heading.", type: "string", default: '"All chunks"' },
      { name: "count", description: "Displayed result count; defaults to the item length.", type: "number | string" },
      { name: "items", description: "Retrieved context chunks.", type: "Array<{ id?: string | number; title: string; excerpt: string; characters?: number | string; source?: { label: string; type?: string; url?: string } }>" },
      { name: "onItemClickAction", description: "Action dispatched with the selected chunk and id.", type: "ActionConfig" }
    ]
  },
  {
    id: "DiffTable",
    name: "Diff Table",
    description: "Selectable tabular change set with addition/removal totals and a bulk apply action.",
    category: "Agent workspaces",
    usage: `<DiffTable columns={[{ key: "name", label: "Name" }]} rows={[{ type: "add", values: { name: "New record" } }]} applyAction={{ type: "changes.apply" }} />`,
    props: [
      { name: "title", description: "Change-set heading.", type: "string", default: '"Proposed changes"' },
      { name: "description", description: "Supporting selection guidance.", type: "string", default: '"Select changed rows to include"' },
      { name: "columns", description: "Table column definitions.", type: 'Array<{ key: string; label: string; type?: "text" | "tags" | "status" | "link" | "number"; align?: "start" | "center" | "end" }>' },
      { name: "rows", description: "Change rows and their cell values; non-context rows start selected unless selected is false.", type: 'Array<{ id?: string | number; type?: "add" | "remove" | "context"; values: Record<string, string | number | boolean | string[] | null | undefined>; selected?: boolean }>' },
      { name: "applyLabel", description: "Bulk action label.", type: "string", default: '"Apply changes"' },
      { name: "applyAction", description: "Action dispatched with selected row indexes and count.", type: "ActionConfig" }
    ]
  },
  {
    id: "FilterTable",
    name: "Filter Table",
    description: "Data table with local status-filter chips and row/filter actions.",
    category: "Agent workspaces",
    usage: `<FilterTable filters={[{ label: "All", value: "all" }, { label: "Open", value: "open" }]} columns={[{ key: "task", label: "Task" }]} rows={[{ task: "Review", status: "open" }]} />`,
    props: [
      { name: "filters", description: "Filter chip definitions.", type: 'Array<{ label: string; value: string; count?: number; tone?: "neutral" | "accent" | "info" | "success" | "warning" | "danger" | "discovery" }>' },
      { name: "defaultFilter", description: "Initially active filter value.", type: "string", default: '"all"' },
      { name: "statusKey", description: "Row field compared with non-all filter values.", type: "string", default: '"status"' },
      { name: "columns", description: "Table column definitions.", type: 'Array<{ key: string; label: string; type?: "text" | "tags" | "status" | "link" | "number"; align?: "start" | "center" | "end" }>' },
      { name: "rows", description: "Table row objects.", type: "Array<Record<string, string | number | boolean | string[] | null | undefined>>" },
      { name: "onFilterAction", description: "Action dispatched with the selected filter value.", type: "ActionConfig" },
      { name: "onRowClickAction", description: "Action dispatched with the selected visible row and index.", type: "ActionConfig" }
    ]
  },
  {
    id: "FineTuneCard",
    name: "Fine Tune Card",
    description: "Compact parameter editor for numeric, text, select, and range controls.",
    category: "Agent workspaces",
    usage: `<FineTuneCard title="Generation settings" fields={[{ name: "temperature", label: "Temperature", type: "range", value: 0.7, min: 0, max: 1, step: 0.1 }]} />`,
    props: [
      { name: "title", description: "Editor heading.", type: "string" },
      { name: "badge", description: "Heading badge text.", type: "string", default: '"Adjust"' },
      { name: "fields", description: "Editable parameter definitions.", type: 'Array<{ name: string; label: string; type?: "number" | "text" | "select" | "range"; value?: string | number; min?: number; max?: number; step?: number; unit?: string; options?: Array<{ label: string; value: string }> }>' },
      { name: "applyLabel", description: "Apply button label.", type: "string", default: '"Apply"' },
      { name: "applyAction", description: "Action dispatched with the complete values object.", type: "ActionConfig" },
      { name: "onChangeAction", description: "Action dispatched when an individual field changes.", type: "ActionConfig" }
    ]
  },
  {
    id: "Flowchart",
    name: "Flowchart",
    description: "Vertical agent workflow diagram with typed nodes and labeled connections.",
    category: "Agent workspaces",
    usage: `<Flowchart nodes={[{ id: "start", label: "Ticket received", kind: "trigger" }, { id: "route", label: "Route request", kind: "action" }]} edges={[{ from: "start", to: "route", label: "then" }]} />`,
    props: [
      { name: "nodes", description: "Workflow nodes rendered in order.", type: 'Array<{ id: string; label: string; description?: string; kind?: "trigger" | "action" | "condition" | "branch" | "result"; icon?: WidgetIcon }>' },
      { name: "edges", description: "Connections between node ids; incoming edges label the connector before a node.", type: 'Array<{ from: string; to: string; label?: string; tone?: "neutral" | "accent" | "info" | "success" | "warning" | "danger" | "discovery" }>' },
      { name: "onNodeClickAction", description: "Action dispatched with the selected node and id.", type: "ActionConfig" }
    ]
  },
  {
    id: "InsightCards",
    name: "Insight Cards",
    description: "Paged insight viewer with metrics, sparklines, navigation, and per-insight actions.",
    category: "Agent workspaces",
    usage: `<InsightCards items={[{ title: "Activation improved", metrics: [{ label: "Rate", value: "68%", delta: "+8%", data: [42, 51, 68] }] }]} />`,
    props: [
      { name: "title", description: "Collection heading.", type: "string", default: '"Insights"' },
      { name: "items", description: "Paged insight cards and their metric series.", type: "Array<{ id?: string | number; title: string; description?: string; metrics?: Array<{ label: string; value: string; delta?: string; color?: string; data?: number[] }>; action?: { label: string; action: ActionConfig } }>" },
      { name: "defaultIndex", description: "Initially visible insight index, clamped to the available items.", type: "number", default: "0" },
      { name: "onChangeAction", description: "Action dispatched with the newly selected insight index and id.", type: "ActionConfig" }
    ]
  },
  {
    id: "RecordsTable",
    name: "Records Table",
    description: "Sortable records grid with optional row selection and action payloads.",
    category: "Agent workspaces",
    usage: `<RecordsTable selectable defaultSortKey="name" columns={[{ key: "name", label: "Name" }]} rows={[{ name: "Ada" }, { name: "Lin" }]} />`,
    props: [
      { name: "columns", description: "Table column definitions.", type: 'Array<{ key: string; label: string; type?: "text" | "tags" | "status" | "link" | "number"; align?: "start" | "center" | "end" }>' },
      { name: "rows", description: "Record objects keyed by column keys.", type: "Array<Record<string, string | number | boolean | string[] | null | undefined>>" },
      { name: "caption", description: "Footer caption beside the record count.", type: "string" },
      { name: "selectable", description: "Enable click-to-select rows and add a selection column.", type: "boolean", default: "false" },
      { name: "defaultSortKey", description: "Column key used for initial sorting.", type: "string" },
      { name: "defaultSortDirection", description: "Initial sort direction.", type: '"asc" | "desc"', default: '"asc"' },
      { name: "onRowClickAction", description: "Action dispatched with the source row and index.", type: "ActionConfig" },
      { name: "onSelectionChangeAction", description: "Action dispatched with selected source indexes and count.", type: "ActionConfig" }
    ]
  },
  {
    id: "Search",
    name: "Search",
    description: "Local search field and result list with form integration and selection actions.",
    category: "Agent workspaces",
    usage: `<Search placeholder="Search knowledge" items={[{ id: "guide", label: "Authoring guide", description: "Widget syntax" }]} />`,
    props: [
      { name: "name", description: "Form field and change-payload key.", type: "string", default: '"search"' },
      { name: "placeholder", description: "Search input placeholder.", type: "string", default: '"Search…"' },
      { name: "defaultQuery", description: "Initial local search query.", type: "string", default: '""' },
      { name: "items", description: "Searchable result items; keywords participate in matching but are not displayed.", type: "Array<{ id?: string | number; label: string; description?: string; keywords?: string; icon?: WidgetIcon; action?: ActionConfig }>" },
      { name: "emptyText", description: "Message shown when no items match.", type: "string", default: '"No matches"' },
      { name: "onSelectAction", description: "Fallback action for result items without their own action.", type: "ActionConfig" },
      { name: "onChangeAction", description: "Action dispatched whenever the query changes.", type: "ActionConfig" }
    ]
  },
  {
    id: "SelectionActions",
    name: "Selection Actions",
    description: "Highlighted text selection paired with quick edit actions and a free-form instruction.",
    category: "Agent workspaces",
    usage: `<SelectionActions text="Make this launch note more concise." selection="more concise" actions={[{ label: "Rewrite", value: "rewrite" }]} submitAction={{ type: "selection.edit" }} />`,
    props: [
      { name: "text", description: "Complete source text.", type: "string" },
      { name: "selection", description: "Substring to highlight; defaults to the complete text when absent or unmatched.", type: "string" },
      { name: "placeholder", description: "Free-form instruction placeholder.", type: "string", default: '"Describe edits"' },
      { name: "actions", description: "Quick actions; each may override the shared submit action.", type: "Array<{ label: string; value?: string; icon?: WidgetIcon; action?: ActionConfig }>" },
      { name: "submitAction", description: "Shared quick-action fallback and free-form submit action.", type: "ActionConfig" }
    ]
  },
  {
    id: "SidebarNav",
    name: "Sidebar Navigation",
    description: "Workspace navigation with grouped items, badges, active state, and an optional footer action.",
    category: "Agent workspaces",
    usage: `<SidebarNav workspace="Research" sections={[{ label: "Workspace", items: [{ id: "threads", label: "Threads", active: true }] }]} />`,
    props: [
      { name: "workspace", description: "Workspace name and navigation accessible label.", type: "string" },
      { name: "workspaceIcon", description: "Workspace badge icon.", type: "WidgetIcon", default: '"cube"' },
      { name: "sections", description: "Grouped navigation items.", type: "Array<{ label?: string; items: Array<{ id: string; label: string; icon?: WidgetIcon; badge?: string | number; active?: boolean }> }>" },
      { name: "compact", description: "Use compact sidebar spacing.", type: "boolean", default: "false" },
      { name: "footerAction", description: "Optional persistent footer button.", type: "{ label: string; action: ActionConfig }" },
      { name: "onNavigateAction", description: "Action dispatched with the selected navigation item and id.", type: "ActionConfig" }
    ]
  }
];

export type ComponentDocEntry = (typeof componentDocs)[number];
