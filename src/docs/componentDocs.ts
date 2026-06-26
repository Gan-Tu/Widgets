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
      { name: "status", description: "Optional status header.", type: "WidgetStatus" },
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
      { name: "limit", description: "Number of items to show before \"Show more\".", type: "number | \"auto\"", default: '"auto"' },
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
      { name: "wrap", description: "Wrap behavior.", type: "\"nowrap\" | \"wrap\" | \"wrap-reverse\"" },
      { name: "gap", description: "Gap between children.", type: "number | string" },
      { name: "padding", description: "Inner padding.", type: "number | string | Padding" },
      { name: "border", description: "Border config.", type: "number | Border | Borders" },
      { name: "background", description: "Background color.", type: "string | ThemeColor" },
      { name: "width", description: "Explicit width.", type: "number | string" },
      { name: "height", description: "Explicit height.", type: "number | string" },
      { name: "size", description: "Square width/height shorthand.", type: "number | string" },
      { name: "minWidth / minHeight / minSize", description: "Minimum sizing constraints.", type: "number | string" },
      { name: "maxWidth / maxHeight / maxSize", description: "Maximum sizing constraints.", type: "number | string" },
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
      { name: "padding / margin", description: "Spacing helpers inherited from Box.", type: "number | string | Padding | Margin" },
      { name: "width / height / size", description: "Sizing helpers inherited from Box.", type: "number | string" },
      { name: "border / background / radius", description: "Surface styling inherited from Box.", type: "number | Border | Borders | string | ThemeColor | RadiusValue" },
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
      { name: "padding / margin", description: "Spacing helpers inherited from Box.", type: "number | string | Padding | Margin" },
      { name: "width / height / size", description: "Sizing helpers inherited from Box.", type: "number | string" },
      { name: "border / background / radius", description: "Surface styling inherited from Box.", type: "number | Border | Borders | string | ThemeColor | RadiusValue" },
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
      { name: "minSize", description: "Minimum size along the flex axis.", type: "number | string", default: '"auto"' }
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
      { name: "minLines", description: "Minimum line height reservation, useful for editable text.", type: "number" },
      { name: "editable", description: "Inline editable input.", type: "EditableTextConfig | false" }
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
      { name: "color", description: "Badge color token.", type: "\"secondary\" | \"success\" | \"danger\" | \"warning\" | \"info\" | \"discovery\"", default: '"secondary"' },
      { name: "variant", description: "Badge style.", type: "\"solid\" | \"soft\" | \"outline\"", default: '"soft"' },
      { name: "size", description: "Badge size.", type: "\"sm\" | \"md\" | \"lg\"", default: '"sm"' },
      { name: "pill", description: "Fully rounded badge.", type: "boolean", default: "true" }
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
      { name: "position", description: "Object position.", type: "string" },
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
    category: "Controls",
    usage: `<Button label="Continue" style="primary" />`,
    props: [
      { name: "submit", description: "Configure as a submit button for the nearest form.", type: "boolean", default: "false" },
      { name: "label", description: "Button label text; preferred for portable templates.", type: "string" },
      { name: "children", description: "Optional simple text content when label is omitted.", type: "ReactNode" },
      { name: "onClickAction", description: "Action fired on click.", type: "ActionConfig" },
      { name: "iconStart", description: "Optional leading icon.", type: "WidgetIcon" },
      { name: "iconEnd", description: "Optional trailing icon.", type: "WidgetIcon" },
      { name: "style", description: "Color style preset.", type: "\"primary\" | \"secondary\"", default: '"secondary"' },
      { name: "color", description: "Extended color preset.", type: '"primary" | "secondary" | "info" | "discovery" | "success" | "caution" | "warning" | "danger"' },
      { name: "iconSize", description: "Icon size token.", type: "\"sm\" | \"md\" | \"lg\" | \"xl\" | \"2xl\"", default: '"md"' },
      { name: "variant", description: "Visual variant.", type: "ControlVariant", default: '"solid"' },
      { name: "size", description: "Control size.", type: "ControlSize", default: '"lg"' },
      { name: "pill", description: "Pill shape.", type: "boolean", default: "true" },
      { name: "uniform", description: "Make the button square (icon button).", type: "boolean", default: "false" },
      { name: "block", description: "Full width.", type: "boolean", default: "false" },
      { name: "disabled", description: "Disable interactions.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "Form",
    name: "Form",
    description: "Form state provider and submit wrapper for input controls.",
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Data",
    usage: `<BarChart data={data} series={[{ dataKey: "Desktop" }]} xAxis={{ dataKey: "day" }} showYAxis />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      {
        name: "series",
        description: "Bars to render: { dataKey, label?, color?, stack?, radius? }.",
        type: "BarSeries[]"
      },
      {
        name: "xAxis",
        description: "X-axis config.",
        type: "XAxisConfig"
      },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "barGap", description: "Gap between bars within a category.", type: "number" },
      { name: "barCategoryGap", description: "Gap between bar categories.", type: "number" },
      { name: "height", description: "Explicit height for the chart container.", type: "number | string", default: "220" }
    ]
  },
  {
    id: "LineChart",
    name: "LineChart",
    description: "Line chart (Recharts `LineChart`) with one or more line series.",
    category: "Data",
    usage: `<LineChart data={data} series={[{ dataKey: "Mobile" }]} xAxis={{ dataKey: "day" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Lines to render: { dataKey, label?, color?, curveType?, strokeWidth?, dot? }.", type: "LineSeries[]" },
      { name: "xAxis", description: "X-axis config.", type: "XAxisConfig" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "height", description: "Explicit height for the chart container.", type: "number | string", default: "220" }
    ]
  },
  {
    id: "AreaChart",
    name: "AreaChart",
    description: "Area chart (Recharts `AreaChart`) with one or more area series.",
    category: "Data",
    usage: `<AreaChart data={data} series={[{ dataKey: "Desktop" }]} xAxis={{ dataKey: "day" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Areas to render: { dataKey, label?, color?, stack?, curveType?, fillOpacity? }.", type: "AreaSeries[]" },
      { name: "xAxis", description: "X-axis config.", type: "XAxisConfig" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "height", description: "Explicit height for the chart container.", type: "number | string", default: "220" }
    ]
  },
  {
    id: "PieChart",
    name: "PieChart",
    description: "Pie / donut chart (Recharts `PieChart`). Use `innerRadius` to create a donut.",
    category: "Data",
    usage: `<PieChart data={data} series={[{ dataKey: "value", nameKey: "name", innerRadius: "60%" }]} />`,
    props: [
      { name: "data", description: "Tabular dataset. For per-slice colors, add a `fill` field per row.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Pies to render: { dataKey, nameKey?, innerRadius?, outerRadius?, paddingAngle?, cornerRadius?, color? }.", type: "PieSeries[]" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "height", description: "Explicit height for the chart container.", type: "number | string", default: "220" }
    ]
  },
  {
    id: "Chart",
    name: "Chart",
    description: "Mixed cartesian chart combining bars/lines/areas via a `series` array.",
    category: "Data",
    usage: `<Chart data={data} series={[{ type: "bar", dataKey: "Desktop" }, { type: "line", dataKey: "Mobile" }]} xAxis={{ dataKey: "day" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Mixed series: { type: 'bar' | 'line' | 'area', ... }.", type: "ComposedSeries[]" },
      { name: "xAxis", description: "X-axis config.", type: "XAxisConfig" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" },
      { name: "showLegend", description: "Show legend.", type: "boolean", default: "true" },
      { name: "showTooltip", description: "Show tooltip.", type: "boolean", default: "true" },
      { name: "showGrid", description: "Show cartesian grid.", type: "boolean", default: "true" },
      { name: "barGap", description: "Gap between bars within a category.", type: "number" },
      { name: "barCategoryGap", description: "Gap between bar categories.", type: "number" },
      { name: "height", description: "Explicit height for the chart container.", type: "number | string", default: "220" }
    ]
  },
  {
    id: "Transition",
    name: "Transition",
    description: "Animate swapping child components.",
    category: "Other",
    usage: `<Transition>\n  <Card key={state} />\n</Transition>`,
    props: [
      { name: "children", description: "Single child element to animate.", type: "ReactElement" }
    ]
  },
  {
    id: "Avatar",
    name: "Avatar",
    description: "Profile image or initials (custom extension).",
    category: "Other",
    usage: `<Avatar name="Alex" src={image} status="online" />`,
    props: [
      { name: "name", description: "Name for initials.", type: "string" },
      { name: "src", description: "Image source URL.", type: "string" },
      { name: "status", description: "Status dot.", type: "\"online\" | \"offline\" | \"away\"" }
    ]
  },
  {
    id: "Progress",
    name: "Progress",
    description: "Progress bar (custom extension).",
    category: "Other",
    usage: `<Progress value={78} label="Milestones" />`,
    props: [
      { name: "value", description: "Progress value.", type: "number" },
      { name: "max", description: "Maximum value.", type: "number", default: "100" },
      { name: "label", description: "Optional label.", type: "string" }
    ]
  },
  {
    id: "Accordion",
    name: "Accordion",
    description: "Expandable list of items.",
    category: "Layout",
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
    category: "Layout",
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
    category: "Navigation",
    usage: `<Menubar menus={[{ id: "file", label: "File", items: [{ id: "new", label: "New" }] }]} />`,
    props: [
      { name: "menus", description: "Menu definitions.", type: "Array<{ id: string; label: string; items: MenuItem[] }>" }
    ]
  },
  {
    id: "ContextMenu",
    name: "ContextMenu",
    description: "Right-click menu for a target.",
    category: "Navigation",
    usage: `<ContextMenu triggerLabel="Right click me" items={[{ id: "copy", label: "Copy" }]} />`,
    props: [
      { name: "triggerLabel", description: "Text shown for the trigger.", type: "string" },
      { name: "items", description: "Menu items.", type: "MenuItem[]" }
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Overlays",
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
    category: "Overlays",
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
    category: "Controls",
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
    category: "Controls",
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
    category: "Data",
    usage: `<DataTable columns={[{ key: "name", label: "Name" }]} rows={[{ name: "Alex" }]} />`,
    props: [
      { name: "columns", description: "Column definitions.", type: "Array<{ key: string; label: string }>" },
      { name: "rows", description: "Row data.", type: "Array<Record<string, string | number>>" },
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "DIL Layout",
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
    category: "Data",
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
    category: "Control Flow",
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
    category: "Motion",
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
    category: "Controls",
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
    category: "Typography",
    usage: `<Inline gap={1} wrap="wrap"><Bold value="Bold" /><Code value="code()" /><Highlight value="Marked" /></Inline>`,
    props: [
      { name: "children", description: "Inline primitive children.", type: "ReactNode" },
      { name: "gap", description: "Space between inline children.", type: "number | string", default: "1" },
      { name: "align", description: "Cross-axis alignment for grouped inline children.", type: "Alignment", default: '"center"' },
      { name: "wrap", description: "Whether grouped inline children may wrap in constrained cards.", type: '"nowrap" | "wrap" | "wrap-reverse"', default: '"wrap"' },
      { name: "onVisibleAction", description: "Action fired once when the inline group enters the viewport.", type: "ActionConfig" }
    ]
  }
];

export type ComponentDocEntry = (typeof componentDocs)[number];
