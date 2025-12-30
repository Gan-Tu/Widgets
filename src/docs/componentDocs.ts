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
      { name: "radius", description: "Border radius token.", type: "RadiusValue" }
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
      { name: "gap", description: "Gap between children.", type: "number | string" }
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
      { name: "gap", description: "Gap between children.", type: "number | string" }
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
      { name: "value", description: "Text content.", type: "string" },
      { name: "size", description: "Text size.", type: "TextSize", default: '"md"' },
      { name: "weight", description: "Font weight.", type: "\"normal\" | \"medium\" | \"semibold\" | \"bold\"", default: "\"normal\"" },
      { name: "color", description: "Text color.", type: "string | ThemeColor" },
      { name: "italic", description: "Italic text.", type: "boolean", default: "false" },
      { name: "lineThrough", description: "Line-through decoration.", type: "boolean", default: "false" },
      { name: "maxLines", description: "Line clamp.", type: "number" },
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
      { name: "value", description: "Title content.", type: "string" },
      { name: "size", description: "Title size.", type: "TitleSize", default: '"md"' },
      { name: "weight", description: "Font weight.", type: "\"normal\" | \"medium\" | \"semibold\" | \"bold\"", default: '"medium"' },
      { name: "color", description: "Text color.", type: "string | ThemeColor", default: '"prose"' }
    ]
  },
  {
    id: "Caption",
    name: "Caption",
    description: "Caption text, often used for metadata.",
    category: "Typography",
    usage: `<Caption value="Caption" size="sm" />`,
    props: [
      { name: "value", description: "Caption content.", type: "string" },
      { name: "size", description: "Caption size.", type: "CaptionSize", default: '"md"' },
      { name: "color", description: "Text color.", type: "string | ThemeColor", default: '"secondary"' }
    ]
  },
  {
    id: "Markdown",
    name: "Markdown",
    description: "Render markdown content.",
    category: "Typography",
    usage: `<Markdown value="**Hello** _world_" />`,
    props: [
      { name: "value", description: "Markdown string.", type: "string" },
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
      { name: "label", description: "Badge text.", type: "string" },
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
      { name: "height", description: "Explicit height.", type: "number | string" }
    ]
  },
  {
    id: "Button",
    name: "Button",
    description: "Action button with optional icon.",
    category: "Controls",
    usage: `<Button label="Continue" style="primary" />`,
    props: [
      { name: "label", description: "Button label text.", type: "string" },
      { name: "onClickAction", description: "Action fired on click.", type: "ActionConfig" },
      { name: "variant", description: "Visual variant.", type: "ControlVariant", default: '"solid"' },
      { name: "size", description: "Control size.", type: "ControlSize", default: '"lg"' },
      { name: "pill", description: "Pill shape.", type: "boolean", default: "true" },
      { name: "block", description: "Full width.", type: "boolean", default: "false" }
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
      { name: "placeholder", description: "Placeholder text.", type: "string" },
      { name: "required", description: "Required for submit.", type: "boolean", default: "false" },
      { name: "variant", description: "Visual style.", type: "\"soft\" | \"outline\"", default: '"outline"' }
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
      { name: "rows", description: "Visible rows.", type: "number", default: "3" },
      { name: "placeholder", description: "Placeholder text.", type: "string" },
      { name: "variant", description: "Visual style.", type: "\"soft\" | \"outline\"", default: '"outline"' }
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
      { name: "options", description: "Options list.", type: "Array<{ value: string; label: string }>" },
      { name: "defaultValue", description: "Initial value.", type: "string" },
      { name: "variant", description: "Visual style.", type: "ControlVariant", default: '"outline"' },
      { name: "clearable", description: "Allow clear control.", type: "boolean", default: "false" }
    ]
  },
  {
    id: "DatePicker",
    name: "DatePicker",
    description: "Native date input control with ISO value handling.",
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
      { name: "required", description: "Required for submit.", type: "boolean", default: "false" }
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
      { name: "options", description: "Radio options.", type: "Array<{ label: string; value: string }>" },
      { name: "defaultValue", description: "Initial selection.", type: "string" },
      { name: "direction", description: "Layout direction.", type: "\"row\" | \"col\"", default: '"row"' }
    ]
  },
  {
    id: "Chart",
    name: "Chart",
    description: "Data visualization component.",
    category: "Data",
    usage: `<Chart data={data} series={series} xAxis={{ dataKey: "date" }} />`,
    props: [
      { name: "data", description: "Tabular dataset.", type: "Array<Record<string, string | number>>" },
      { name: "series", description: "Series definitions.", type: "Series[]" },
      { name: "xAxis", description: "X-axis config.", type: "XAxisConfig" },
      { name: "showYAxis", description: "Show y-axis labels.", type: "boolean", default: "false" }
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
  }
];

export type ComponentDocEntry = (typeof componentDocs)[number];
