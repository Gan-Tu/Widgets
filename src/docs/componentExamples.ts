import { z } from "zod";
import { iconNames } from "@/widget/iconNames";

type ComponentExample = {
  template: string;
  schema: z.ZodTypeAny;
  data: unknown;
  theme?: "light" | "dark";
};

const EmptySchema = z.strictObject({});
const emptyData = {};
const IconGallerySchema = z.strictObject({
  icons: z.array(z.enum(iconNames))
});

export const componentExamples: Record<string, ComponentExample> = {
  Card: {
    template: `
<Card size="sm">
  <Title value="Widget title" />
  <Text value="Short description goes here." color="secondary" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ListView: {
    template: `
<ListView>
  <ListViewItem gap={2}>
    <Col gap={0}>
      <Text value="First option" />
      <Caption value="Secondary text" color="secondary" />
    </Col>
  </ListViewItem>
  <ListViewItem gap={2}>
    <Col gap={0}>
      <Text value="Second option" />
      <Caption value="Secondary text" color="secondary" />
    </Col>
  </ListViewItem>
</ListView>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ListViewItem: {
    template: `
<ListView>
  <ListViewItem gap={2} onClickAction={{ type: "item.select" }}>
    <Col gap={0}>
      <Text value="Single item" />
      <Caption value="Click to select" color="secondary" />
    </Col>
  </ListViewItem>
</ListView>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Box: {
    template: `
<Card size="sm">
  <Box padding={3} radius="lg" background="surface-secondary">
    <Text value="Box content" />
  </Box>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Row: {
    template: `
<Card size="sm">
  <Row gap={2}>
    <Icon name="info" />
    <Text value="Row item" />
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Col: {
    template: `
<Card size="sm">
  <Col gap={1}>
    <Title value="Heading" size="sm" />
    <Text value="Supporting text" color="secondary" />
  </Col>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Spacer: {
    template: `
<Card size="sm">
  <Row>
    <Text value="Left" />
    <Spacer />
    <Text value="Right" />
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Divider: {
    template: `
<Card size="sm">
  <Text value="Section A" />
  <Divider />
  <Text value="Section B" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Form: {
    template: `
<Card size="sm">
  <Form onSubmitAction={{ type: "form.submit" }}>
    <Col gap={2}>
      <Input name="email" placeholder="Email" />
      <Button submit label="Submit" style="primary" />
    </Col>
  </Form>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Button: {
    template: `
<Card size="sm">
  <Row gap={2}>
    <Button label="Primary" style="primary" />
    <Button label="Outline" variant="outline" />
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Input: {
    template: `
<Card size="sm">
  <Input name="title" placeholder="Type here" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Textarea: {
    template: `
<Card size="sm">
  <Textarea name="notes" rows={3} placeholder="Write a note" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Select: {
    template: `
<Card size="sm">
  <Select
    name="size"
    options={[
      { label: "Small", value: "sm" },
      { label: "Large", value: "lg" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  DatePicker: {
    template: `
<Card size="sm">
  <DatePicker name="due" placeholder="Pick a date" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Checkbox: {
    template: `
<Card size="sm">
  <Checkbox name="tos" label="Agree to terms" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  RadioGroup: {
    template: `
<Card size="sm">
  <RadioGroup
    name="size"
    options={[
      { label: "Small", value: "sm" },
      { label: "Large", value: "lg" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Label: {
    template: `
<Card size="sm">
  <Col gap={2}>
    <Label value="Email" fieldName="email" />
    <Input name="email" placeholder="you@example.com" />
  </Col>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Text: {
    template: `
<Card size="sm">
  <Text value="Body text example." />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Title: {
    template: `
<Card size="sm">
  <Title value="Card title" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Caption: {
    template: `
<Card size="sm">
  <Caption value="Small caption" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Markdown: {
    template: `
<Card size="sm">
  <Markdown value="**Bold** _italic_ and a list:\\n- One\\n- Two" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Image: {
    template: `
<Card size="sm">
  <Image src="https://widgets.chatkit.studio/landscape-01.png" size={160} radius="lg" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Icon: {
    template: `
<Card size="lg">
  <Col gap={3}>
    <Row align="center">
      <Title value="Icon gallery" size="sm" />
      <Spacer />
      <Badge label={\`\${icons.length} icons\`} variant="outline" />
    </Row>
    <Box direction="row" wrap="wrap" gap={2}>
      {icons.map((name) => (
        <Col
          key={name}
          align="center"
          gap={1}
          width={88}
          padding={2}
          radius="lg"
          background="surface-secondary"
          border={{ size: 1, color: "subtle" }}
        >
          <Icon name={name} size="lg" />
          <Caption value={name} size="sm" textAlign="center" />
        </Col>
      ))}
    </Box>
  </Col>
</Card>
    `.trim(),
    schema: IconGallerySchema,
    data: {
      icons: iconNames
    }
  },
  Badge: {
    template: `
<Card size="sm">
  <Row gap={2}>
    <Badge label="Beta" />
    <Badge label="Success" color="success" />
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Chart: {
    template: `
<Card size="sm">
  <Chart
    data={[
      { day: "Mon", Desktop: 120, Mobile: 80 },
      { day: "Tue", Desktop: 140, Mobile: 95 },
      { day: "Wed", Desktop: 160, Mobile: 110 }
    ]}
    series={[
      { type: "bar", dataKey: "Desktop" },
      { type: "bar", dataKey: "Mobile" }
    ]}
    xAxis={{ dataKey: "day" }}
    showYAxis
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Transition: {
    template: `
<Card size="sm">
  <Transition>
    <Row key="state" gap={2}>
      <Icon name="sparkle" />
      <Text value="Animated content" />
    </Row>
  </Transition>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Avatar: {
    template: `
<Card size="sm">
  <Row gap={2} align="center">
    <Avatar name="Alex Rivera" status="online" />
    <Text value="Alex Rivera" />
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Progress: {
    template: `
<Card size="sm">
  <Progress value={62} label="Profile completeness" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Accordion: {
    template: `
<Card size="sm">
  <Accordion
    items={[
      { id: "shipping", title: "Shipping", content: "Free delivery in 2 business days." },
      { id: "returns", title: "Returns", content: "30-day hassle-free returns." }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Collapsible: {
    template: `
<Card size="sm">
  <Collapsible title="Advanced options" content="Show extra configuration here." />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Menubar: {
    template: `
<Card size="sm">
  <Menubar
    menus={[
      {
        id: "file",
        label: "File",
        items: [
          { id: "new", label: "New file" },
          { id: "sep-1", type: "separator" },
          { id: "share", label: "Share" }
        ]
      },
      {
        id: "edit",
        label: "Edit",
        items: [
          { id: "copy", label: "Copy" },
          { id: "paste", label: "Paste" }
        ]
      }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ContextMenu: {
    template: `
<Card size="sm">
  <ContextMenu
    triggerLabel="Right click this box"
    items={[
      { id: "copy", label: "Copy" },
      { id: "sep-1", type: "separator" },
      { id: "delete", label: "Delete" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Tooltip: {
    template: `
<Card size="sm">
  <Tooltip label="Hover me" content="Extra details shown on hover." />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Toggle: {
    template: `
<Card size="sm">
  <Toggle name="subscribe" label="Subscribe" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ToggleGroup: {
    template: `
<Card size="sm">
  <ToggleGroup
    name="view"
    type="single"
    options={[
      { label: "Grid", value: "grid" },
      { label: "List", value: "list" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Slider: {
    template: `
<Card size="sm">
  <Slider name="volume" defaultValue={35} />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Sheet: {
    template: `
<Card size="sm">
  <Sheet
    triggerLabel="Open sheet"
    title="Sheet title"
    description="Optional supporting text."
    content="Sheet content goes here."
    side="right"
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Drawer: {
    template: `
<Card size="sm">
  <Drawer
    triggerLabel="Open drawer"
    title="Drawer title"
    description="Optional supporting text."
    content="Drawer content goes here."
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Combobox: {
    template: `
<Card size="sm">
  <Combobox
    name="assignee"
    options={[
      { label: "Alex Rivera", value: "alex" },
      { label: "Sam Example", value: "sam" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  InputOTP: {
    template: `
<Card size="sm">
  <InputOTP name="code" length={6} />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Spinner: {
    template: `
<Card size="sm">
  <Spinner size="sm" label="Loading" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  DataTable: {
    template: `
<Card size="md">
  <DataTable
    caption="Quarterly revenue"
    columns={[
      { key: "quarter", label: "Quarter" },
      { key: "revenue", label: "Revenue", align: "end" }
    ]}
    rows={[
      { quarter: "Q1", revenue: "$12,400" },
      { quarter: "Q2", revenue: "$18,900" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  }
};
