import { iconNames } from "@/widget/iconNames";
import { z } from "zod";

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

export const iconGalleryExample: ComponentExample = {
  template: `
<Card size="full">
  <Col gap={1}>
    <Row align="center">
      <Title value="Icon gallery" size="sm" />
      <Spacer />
      <Badge label={\`\${icons.length} icons\`} variant="outline" />
    </Row>
    <Box direction="row" wrap="wrap" gap={2} align="center">
      {icons.map((name) => (
        <Col
          key={name}
          align="center"
          gap={1}
          padding={2}
          width={88}
          radius="lg"
          background="surface-secondary"
          border={{ size: 1, color: "default" }}
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
};

export const componentExamples: Record<string, ComponentExample> = {
  Basic: {
    template: `
<Basic padding={3} gap={2} theme="light">
  <Row gap={2} align="center">
    <Icon name="sparkle" color="discovery" />
    <Col gap={0}>
      <Text value="Basic root" weight="semibold" />
      <Caption value="Themed flex container without card chrome." />
    </Col>
  </Row>
</Basic>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
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
    <Button label="Open" variant="outline" iconEnd="external-link" />
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
    name="volume"
    defaultValue="20"
    placeholder="Select volume"
    options={[
      { label: "10", value: "10" },
      { label: "20", value: "20" },
      { label: "30", value: "30" }
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
  <Image
    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80"
    alt="Mountain cabin"
    width={220}
    height={150}
    radius="lg"
    frame
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Favicon: {
    template: `
<Card size="sm" gap={3}>
  <Row gap={3} align="center">
    <Favicon
      url="https://www.google.com/s2/favicons?domain=example.com&sz=64"
      size={32}
      alt="Example favicon"
    />
    <Col gap={0}>
      <Text value="example.com" weight="semibold" />
      <Caption value="Small framed site icon." />
    </Col>
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Icon: {
    template: `
<Card size="sm">
  <Row align="center" gap={3}>
    <Box
      size={44}
      radius="lg"
      background="surface-secondary"
      border={{ size: 1, color: "subtle" }}
      align="center"
      justify="center"
    >
      <Icon name="sparkle" size="xl" />
    </Box>
    <Col gap={0}>
      <Title value="Icon" size="sm" />
      <Caption value="Use the name prop to pick an icon from the library." size="sm" />
    </Col>
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Svg: {
    template: `
<Card size="sm" gap={3}>
  <Row gap={3} align="center">
    <Box
      size={48}
      radius="lg"
      background="surface-secondary"
      border={{ size: 1, color: "subtle" }}
      align="center"
      justify="center"
    >
      <Svg
        title="Launch path"
        size={28}
        paths={[
          { d: "M4 16C8 6 16 4 20 4c0 4-2 12-12 16", stroke: "var(--widget-accent)", strokeWidth: 2 },
          { d: "M9 15l-4 4", stroke: "var(--widget-success)", strokeWidth: 2 }
        ]}
      />
    </Box>
    <Col gap={0}>
      <Text value="Inline Svg" weight="semibold" />
      <Caption value="Use path objects for simple custom glyphs." />
    </Col>
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
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
  BarChart: {
    template: `
<Card size="sm">
  <BarChart
    data={[
      { day: "Mon", Desktop: 120, Mobile: 80 },
      { day: "Tue", Desktop: 140, Mobile: 95 },
      { day: "Wed", Desktop: 160, Mobile: 110 }
    ]}
    series={[
      { dataKey: "Desktop", label: "Desktop" },
      { dataKey: "Mobile", label: "Mobile" }
    ]}
    xAxis={{ dataKey: "day" }}
    showYAxis
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  LineChart: {
    template: `
<Card size="sm">
  <LineChart
    data={[
      { day: "Mon", Mobile: 80 },
      { day: "Tue", Mobile: 95 },
      { day: "Wed", Mobile: 110 }
    ]}
    series={[{ dataKey: "Mobile", label: "Mobile" }]}
    xAxis={{ dataKey: "day" }}
    showYAxis
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  AreaChart: {
    template: `
<Card size="sm">
  <AreaChart
    data={[
      { day: "Mon", Desktop: 120 },
      { day: "Tue", Desktop: 140 },
      { day: "Wed", Desktop: 160 }
    ]}
    series={[{ dataKey: "Desktop", label: "Desktop" }]}
    xAxis={{ dataKey: "day" }}
    showYAxis
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  PieChart: {
    template: `
<Card size="sm">
  <PieChart
    height={240}
    data={[
      { name: "Search", value: 1240, fill: "blue" },
      { name: "Direct", value: 860, fill: "purple" },
      { name: "Referrals", value: 420, fill: "green" }
    ]}
    series={[
      {
        dataKey: "value",
        nameKey: "name",
        innerRadius: "58%",
        outerRadius: "82%",
        paddingAngle: 2,
        cornerRadius: 6
      }
    ]}
  />
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
      { type: "bar", dataKey: "Desktop", label: "Desktop" },
      { type: "line", dataKey: "Mobile", label: "Mobile" }
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
<Card size="sm" gap={3}>
  <Row gap={3}>
    <Tooltip label="Default delay" content="Shows after 150ms." />
    <Tooltip label="Instant" content="delayDuration={0}" delayDuration={0} />
  </Row>
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
  },
  Response: {
    template: `
<Response gap={3}>
  <Card size="sm" status={{ text: "Live", icon: "check-circle" }}>
    <Row gap={3}>
      <Hermes title="Hermes runtime" subtitle="Wrapper blocks render normal children." />
      <Spacer />
      <Debug label="State" value={{ ready: true, mode: "docs" }} />
    </Row>
  </Card>
</Response>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  BaseCarousel: {
    template: `
<Card size="md" gap={3}>
  <Title value="BaseCarousel" size="sm" />
  <BaseCarousel visibleItems={2} gap={3} snap="mandatory">
    {cards.map((card) => (
      <BaseCarousel.Item key={card.id} variant="elevated" minWidth={180}>
        <Col gap={1}>
          <Badge label={card.kind} color={card.color} />
          <Text value={card.title} weight="semibold" />
          <Caption value={card.note} />
        </Col>
      </BaseCarousel.Item>
    ))}
  </BaseCarousel>
</Card>
    `.trim(),
    schema: z.strictObject({
      cards: z.array(z.strictObject({
        id: z.string(),
        kind: z.string(),
        title: z.string(),
        note: z.string(),
        color: z.enum(["secondary", "success", "danger", "warning", "info", "discovery"])
      }))
    }),
    data: {
      cards: [
        { id: "brief", kind: "Brief", title: "Morning check", note: "Review overnight queue.", color: "info" },
        { id: "handoff", kind: "Handoff", title: "Ops summary", note: "Share open incidents.", color: "warning" },
        { id: "launch", kind: "Launch", title: "Release notes", note: "Publish final checklist.", color: "success" }
      ]
    }
  },
  CardCarousel: {
    template: `
<Card size="md" gap={3}>
  <Title value="CardCarousel links" size="sm" />
  <CardCarousel visibleItems={1} gap={3} snap="mandatory">
    <CardLinkItem href="https://example.com/docs">
      <Col gap={1}>
        <Icon name="book-open" />
        <Text value="Open docs" weight="semibold" />
        <Caption value="External link card with hover/click affordance." />
      </Col>
    </CardLinkItem>
    <CardLinkItem href="https://example.com/metrics">
      <Col gap={1}>
        <Icon name="chart" />
        <Text value="Metrics board" weight="semibold" />
        <Caption value="Second carousel item proves horizontal layout." />
      </Col>
    </CardLinkItem>
    <CardLinkItem onClickAction={{ type: "copy", handler: "client", payload: { value: "CARD-CAROUSEL" } }}>
      <Col gap={1}>
        <Icon name="copy" />
        <Text value="Copy code" weight="semibold" />
        <Caption value="Action-backed item instead of href." />
      </Col>
    </CardLinkItem>
  </CardCarousel>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Grid: {
    template: `
<Card size="md" gap={3}>
  <Title value="Grid layout" size="sm" />
  <Grid columns={3} gap={2}>
    <Grid.Item span={2} padding={3} radius="lg" background="surface-secondary">
      <Text value="Wide span" weight="semibold" />
      <Caption value="Grid.Item span={2}" />
    </Grid.Item>
    <Grid.Item padding={3} radius="lg" background="surface-tertiary">
      <Text value="Side" />
    </Grid.Item>
    <Grid.Item padding={3} radius="lg" background="surface-tertiary">
      <Text value="A" />
    </Grid.Item>
    <Grid.Item padding={3} radius="lg" background="surface-tertiary">
      <Text value="B" />
    </Grid.Item>
    <Grid.Item padding={3} radius="lg" background="surface-tertiary">
      <Text value="C" />
    </Grid.Item>
  </Grid>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Flow: {
    template: `
<Card size="md" gap={3}>
  <Title value="Flow layout" size="sm" />
  <Flow layout="grid" columns={3} gap={2}>
    <Flow.Item span={2}>
      <Box padding={3} radius="lg" background="surface-secondary">
        <Text value="Wide flow item" weight="semibold" />
      </Box>
    </Flow.Item>
    <Flow.Item>
      <Box padding={3} radius="lg" background="surface-tertiary">
        <Text value="One" />
      </Box>
    </Flow.Item>
    <Flow.Item>
      <Box padding={3} radius="lg" background="surface-tertiary">
        <Text value="Two" />
      </Box>
    </Flow.Item>
    <Flow.Item span={2}>
      <Box padding={3} radius="lg" background="surface-secondary">
        <Text value="Another span" />
      </Box>
    </Flow.Item>
  </Flow>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  OverflowRow: {
    template: `
<Card size="sm" gap={3}>
  <Title value="OverflowRow" size="sm" />
  <OverflowRow rows={2} gap={2}>
    {["Design", "Build", "Review", "Ship", "Monitor", "Triage", "Polish", "Archive"].map((label, index) => (
      <Badge key={label} label={label} color={index % 2 === 0 ? "info" : "success"} />
    ))}
  </OverflowRow>
  <Caption value="Rows beyond the configured count are clipped." />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  List: {
    template: `
<Card size="md" gap={3}>
  <Title value="Deployment timeline" size="sm" />
  <List marker="decimal" connector="solid" gap={3}>
    {steps.map((step, index) => (
      <List.Item key={step.id} marker={String(index + 1)}>
        <Row gap={2}>
          <Col gap={0}>
            <Text value={step.title} weight="semibold" />
            <Caption value={step.note} />
          </Col>
          <Spacer />
          <Badge label={step.status} color={step.color} />
        </Row>
      </List.Item>
    ))}
  </List>
</Card>
    `.trim(),
    schema: z.strictObject({
      steps: z.array(z.strictObject({
        id: z.string(),
        title: z.string(),
        note: z.string(),
        status: z.string(),
        color: z.enum(["secondary", "success", "danger", "warning", "info", "discovery"])
      }))
    }),
    data: {
      steps: [
        { id: "plan", title: "Plan", note: "Lock the release scope.", status: "Done", color: "success" },
        { id: "ship", title: "Ship", note: "Deploy package and docs.", status: "Now", color: "info" },
        { id: "watch", title: "Watch", note: "Monitor first live test.", status: "Next", color: "warning" }
      ]
    }
  },
  Pressable: {
    template: `
<Card size="sm" gap={3}>
  <Pressable
    padding={3}
    radius="lg"
    background="surface-secondary"
    onClickAction={{ type: "copy", handler: "client", payload: { value: "PRESSABLE-DEMO" } }}
  >
    <Row gap={3}>
      <Icon name="copy" />
      <Col gap={0}>
        <Text value="Copy release token" weight="semibold" />
        <Caption value="Click, Enter, or Space dispatches the action." />
      </Col>
    </Row>
  </Pressable>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Popover: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Click the status badge for anchored details." />
  <Popover>
    <Popover.Trigger>
      <Badge label="SLA details" color="info" />
    </Popover.Trigger>
    <Popover.Content width={260}>
      <Col gap={1}>
        <Text value="99.95% target" weight="semibold" />
        <Caption value="Includes API uptime and webhook delivery." />
      </Col>
    </Popover.Content>
  </Popover>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Table: {
    template: `
<Card size="md" gap={3}>
  <Title value="Structured DIL table" size="sm" />
  <Table columnSizing="equal">
    <Table.Section label="Current run">
      <Table.Row header>
        <Table.Cell header><Text value="Metric" weight="semibold" /></Table.Cell>
        <Table.Cell header align="end"><Text value="Value" weight="semibold" /></Table.Cell>
      </Table.Row>
      {rows.map((row) => (
        <Table.Row key={row.metric}>
          <Table.Cell><Text value={row.metric} /></Table.Cell>
          <Table.Cell align="end"><Badge label={row.value} color={row.color} /></Table.Cell>
        </Table.Row>
      ))}
    </Table.Section>
  </Table>
</Card>
    `.trim(),
    schema: z.strictObject({
      rows: z.array(z.strictObject({
        metric: z.string(),
        value: z.string(),
        color: z.enum(["secondary", "success", "danger", "warning", "info", "discovery"])
      }))
    }),
    data: {
      rows: [
        { metric: "Coverage", value: "96%", color: "success" },
        { metric: "Latency", value: "182ms", color: "info" },
        { metric: "Alerts", value: "1 open", color: "warning" }
      ]
    }
  },
  Each: {
    template: `
<Card size="md" gap={3}>
  <Title value="Each / Show / Scope" size="sm" />
  <Scope values={{ threshold: 90 }}>
    <Each $of="state.metrics" item="metric" index="index">
      <Show $when="metric.score >= threshold">
        <Row gap={2}>
          <Badge $label="'#' + String(index + 1)" color="success" />
          <Text $value="metric.name + ' is healthy'" weight="semibold" />
          <Spacer />
          <Caption $value="String(metric.score) + '%'" />
        </Row>
        <Show.Else>
          <Row gap={2}>
            <Badge $label="'#' + String(index + 1)" color="warning" />
            <Text $value="metric.name + ' needs review'" />
          </Row>
        </Show.Else>
      </Show>
    </Each>
  </Scope>
</Card>
    `.trim(),
    schema: z.strictObject({
      metrics: z.array(z.strictObject({
        name: z.string(),
        score: z.number()
      }))
    }),
    data: {
      metrics: [
        { name: "Renderer", score: 98 },
        { name: "Docs", score: 94 },
        { name: "Packaging", score: 87 }
      ]
    }
  },
  Animate: {
    template: `
<Card size="sm" gap={3}>
  <Animate>
    <Animate.Item $when="state.ready">
      <Row gap={2}>
        <PulseIndicator label="Ready" />
        <Text value="The ready branch is animated into place." />
      </Row>
    </Animate.Item>
    <Animate.Item $when="!state.ready">
      <LoadingIndicator label="Preparing" />
    </Animate.Item>
  </Animate>
  <AnimateGroup $of="state.tasks" item="task">
    <Box padding={2} radius="lg" background="surface-secondary">
      <Text $value="task" />
    </Box>
  </AnimateGroup>
</Card>
    `.trim(),
    schema: z.strictObject({
      ready: z.boolean(),
      tasks: z.array(z.string())
    }),
    data: {
      ready: true,
      tasks: ["Hydrate schema", "Render branch", "Animate rows"]
    }
  },
  AudioPlayer: {
    template: `
<Card size="md" gap={3}>
  <Title value="AudioPlayer" size="sm" />
  <AudioPlayer
    src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    title="Dispatch briefing"
    subtitle="Native audio controls with compact transport."
    preload="metadata"
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  YouTubeEmbed: {
    template: `
<Card size="md" gap={3}>
  <Title value="YouTubeEmbed" size="sm" />
  <YouTubeEmbed
    videoId="dQw4w9WgXcQ"
    title="Demo video"
    height={220}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Map: {
    template: `
<Card size="md" gap={3}>
  <Title value="Map fallback" size="sm" />
  <Map
    height={220}
    markers={[
      { latitude: 37.7749, longitude: -122.4194, label: "HQ", color: "var(--widget-accent)" },
      { latitude: 37.784, longitude: -122.407, label: "Pickup", color: "var(--widget-success)", style: "dot" },
      { latitude: 37.761, longitude: -122.427, label: "Dropoff", color: "var(--widget-danger)" }
    ]}
    routes={[
      { color: "var(--widget-accent)", coordinates: [[-122.4194, 37.7749], [-122.414, 37.781], [-122.407, 37.784]] }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  SegmentedControl: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Switch the operational view." weight="semibold" />
  <SegmentedControl
    name="view"
    defaultValue="live"
    pill
    block
    options={[
      { label: "Live", value: "live" },
      { label: "Forecast", value: "forecast" },
      { label: "Archive", value: "archive" }
    ]}
    onChangeAction={{ type: "view.change" }}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  LoadingBlock: {
    template: `
<Card size="md" gap={4}>
  <Row gap={2}>
    <PulseIndicator label="Streaming" />
    <Spacer />
    <ShimmerText value="Preparing response" size="sm" />
  </Row>
  <Col gap={2}>
    <LoadingBlock height={16} radius="full" />
    <LoadingBlock height={56} radius="lg" />
    <Row gap={2} align="center">
      <LoadingBlock width={72} height={12} radius="full" />
      <LoadingBlock width={120} height={12} radius="full" />
    </Row>
  </Col>
  <Row gap={2} align="center">
    <LoadingDot size={6} color="gray" />
    <LoadingDot size={8} color="blue" />
    <LoadingDot size={10} color="green" />
    <Caption value="Queued stages" />
  </Row>
  <LoadingIndicator label="Loading next card" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Bold: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Bold emphasizes the strongest part of a sentence:" color="secondary" />
  <Text>
    <Bold value="Ship the reviewed build." />
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Italic: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Italic is useful for nuance, titles, or secondary phrasing:" color="secondary" />
  <Text>
    <Italic value="Pending final QA pass." />
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Underline: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Underline draws attention to a specific inline phrase:" color="secondary" />
  <Text>
    <Underline value="Review before publishing" />
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Code: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Code renders compact inline identifiers:" color="secondary" />
  <Text>
    Run <Code value="npm run build:widgets" /> before publishing.
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Math: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Math renders short formula-style text inline:" color="secondary" />
  <Text>
    <Math value="E=mc^2" />
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Highlight: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Highlight marks important text without changing layout:" color="secondary" />
  <Text>
    Status: <Highlight value="Ready for live test" color="yellow" />
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Inline: {
    template: `
<Card size="sm" gap={3}>
  <Text value="Inline composes rich primitives and wraps inside narrow cards:" color="secondary" />
  <Text>
    <Inline gap={1} wrap="wrap">
      <Bold value="Bold" />
      <Italic value="italic" />
      <Underline value="underlined" />
      <Code value="code()" />
      <Math value="E=mc^2" />
      <Highlight value="Marked" />
    </Inline>
  </Text>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Stat: {
    template: `
<Card size="md">
  <Row gap={6}>
    <Stat label="Revenue" value="$48.2k" delta="+12.4%" deltaLabel="vs last month" icon="trending-up" />
    <Stat label="Churn" value="1.8%" delta="-0.4%" upIsPositive={false} deltaLabel="vs last month" />
    <Stat label="NPS" value={62} helpText="Rolling 30 days" />
  </Row>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Sparkline: {
    template: `
<Card size="sm">
  <Col gap={2}>
    <Row align="baseline" gap={2}>
      <Title value="Weekly active users" size="sm" />
      <Spacer />
      <Text value="4,812" weight="semibold" />
    </Row>
    <Sparkline data={points} height={44} />
    <Caption value="Last 12 weeks" size="sm" />
  </Col>
</Card>
    `.trim(),
    schema: z.strictObject({
      points: z.array(z.number())
    }),
    data: {
      points: [2840, 3120, 2980, 3390, 3610, 3480, 3920, 4110, 3980, 4370, 4590, 4812]
    }
  },
  Callout: {
    template: `
<Card size="md" gap={2}>
  <Callout
    color="info"
    title="Scheduled maintenance"
    description="Dashboards may be briefly unavailable on Sunday 02:00-03:00 UTC."
  />
  <Callout
    color="warning"
    title="Approaching plan limit"
    description="You have used 92% of this month's render quota."
    action={{ label: "Upgrade", action: { type: "plan.upgrade" } }}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Timeline: {
    template: `
<Card size="md" gap={3}>
  <Title value="Delivery status" size="sm" />
  <Timeline items={events} />
</Card>
    `.trim(),
    schema: z.strictObject({
      events: z.array(
        z.strictObject({
          title: z.string(),
          description: z.string().optional(),
          time: z.string().optional(),
          icon: z.enum(iconNames).optional(),
          state: z.enum(["done", "active", "upcoming"]).optional()
        })
      )
    }),
    data: {
      events: [
        {
          title: "Order placed",
          description: "Confirmation sent to alex@example.com.",
          time: "9:41 AM",
          icon: "receipt",
          state: "done"
        },
        {
          title: "Packed",
          description: "Left the fulfillment center.",
          time: "1:05 PM",
          state: "done"
        },
        {
          title: "Out for delivery",
          description: "Courier is 3 stops away.",
          time: "Now",
          icon: "truck",
          state: "active"
        },
        { title: "Delivered", state: "upcoming" }
      ]
    }
  },
  Rating: {
    template: `
<Card size="sm" gap={3}>
  <Col gap={1}>
    <Text value="Sunrise Trail Cafe" weight="semibold" />
    <Rating value={4.3} showValue count={128} />
  </Col>
  <Rating value={3.5} size="lg" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ChipGroup: {
    template: `
<Card size="md" gap={2}>
  <Text value="Filter by topic" weight="semibold" size="sm" />
  <ChipGroup
    name="topics"
    type="multiple"
    defaultValues={["design"]}
    options={[
      { label: "Design", value: "design", icon: "palette" },
      { label: "Engineering", value: "engineering", icon: "code" },
      { label: "Research", value: "research" },
      { label: "Launch", value: "launch", icon: "rocket" },
      { label: "Archived", value: "archived", disabled: true }
    ]}
    onChangeAction={{ type: "topics.change" }}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  KeyValue: {
    template: `
<Card size="sm" gap={3}>
  <Title value="Order #10482" size="sm" />
  <KeyValue divider rows={rows} />
</Card>
    `.trim(),
    schema: z.strictObject({
      rows: z.array(
        z.strictObject({
          label: z.string(),
          value: z.union([z.string(), z.number()]),
          icon: z.enum(iconNames).optional(),
          emphasis: z.boolean().optional(),
          color: z.string().optional()
        })
      )
    }),
    data: {
      rows: [
        { label: "Placed", value: "Jul 28, 2026", icon: "calendar-check" },
        { label: "Items", value: 3 },
        { label: "Status", value: "Shipped", color: "success" },
        { label: "Total", value: "$236.90", emphasis: true }
      ]
    }
  },
  Steps: {
    template: `
<Card size="md" gap={3}>
  <Steps
    current={1}
    items={[
      { label: "Cart" },
      { label: "Shipping" },
      { label: "Payment" },
      { label: "Review" }
    ]}
  />
  <Caption value="Step 2 of 4 — Shipping" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  EmptyState: {
    template: `
<Card size="sm">
  <EmptyState
    icon="inbox"
    title="No notifications"
    description="You're all caught up. New alerts will appear here."
    action={{ label: "Refresh", action: { type: "notifications.refresh" } }}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Tabs: {
    template: `
<Card size="md">
  <Tabs
    defaultTab="overview"
    tabs={[
      { id: "overview", label: "Overview", icon: "info" },
      { id: "activity", label: "Activity", icon: "activity" },
      { id: "settings", label: "Settings", icon: "settings" }
    ]}
    onChangeAction={{ type: "tab.change" }}
  >
    <Tabs.Panel id="overview">
      <Col gap={1}>
        <Text value="Project overview" weight="semibold" />
        <Caption value="Panels mount only while their id matches the active tab." />
      </Col>
    </Tabs.Panel>
    <Tabs.Panel id="activity">
      <Col gap={1}>
        <Text value="12 events this week" weight="semibold" />
        <Caption value="Deploys, reviews, and comments show up here." />
      </Col>
    </Tabs.Panel>
    <Tabs.Panel id="settings">
      <Col gap={1}>
        <Text value="Notifications: enabled" weight="semibold" />
        <Caption value="Switch tabs to swap panel content." />
      </Col>
    </Tabs.Panel>
  </Tabs>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ThinkingState: {
    template: `
<Card size="sm">
  <ThinkingState label="Analyzing workspace" elapsed="3s" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ThinkingReasoning: {
    template: `
<Card size="md">
  <ThinkingReasoning
    summary="Thought for 4s"
    elapsed="4s"
    defaultOpen
    steps={[
      { label: "Inspect the component registry", status: "completed" },
      { label: "Match public prop contracts", detail: "32 additions found", status: "completed" },
      { label: "Validate live examples", status: "running" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Thinking: {
    template: `
<Card size="md">
  <Thinking
    active
    steps={[
      { label: "Read the request", status: "completed" },
      { label: "Compare implementation paths", status: "running" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Orb: {
    template: `
<Card size="md" gap={3}>
  <Col gap={0}>
    <Title value="All 25 variants" size="sm" />
    <Caption value="One family per row — each phase is a distinct choreography." />
  </Col>
  <Grid columns="24px repeat(5, minmax(0, 1fr))" gap={2}>
    <Caption value="S" size="sm" />
    <Col align="center" gap={1}><Orb variant="S1" size={20} /><Caption value="S1" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="S2" size={20} /><Caption value="S2" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="S3" size={20} /><Caption value="S3" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="S4" size={20} /><Caption value="S4" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="S5" size={20} /><Caption value="S5" size="sm" /></Col>
    <Caption value="G" size="sm" />
    <Col align="center" gap={1}><Orb variant="G1" size={20} /><Caption value="G1" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="G2" size={20} /><Caption value="G2" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="G3" size={20} /><Caption value="G3" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="G4" size={20} /><Caption value="G4" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="G5" size={20} /><Caption value="G5" size="sm" /></Col>
    <Caption value="C" size="sm" />
    <Col align="center" gap={1}><Orb variant="C1" size={20} /><Caption value="C1" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="C2" size={20} /><Caption value="C2" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="C3" size={20} /><Caption value="C3" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="C4" size={20} /><Caption value="C4" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="C5" size={20} /><Caption value="C5" size="sm" /></Col>
    <Caption value="B" size="sm" />
    <Col align="center" gap={1}><Orb variant="B1" size={20} /><Caption value="B1" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="B2" size={20} /><Caption value="B2" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="B3" size={20} /><Caption value="B3" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="B4" size={20} /><Caption value="B4" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="B5" size={20} /><Caption value="B5" size="sm" /></Col>
    <Caption value="M" size="sm" />
    <Col align="center" gap={1}><Orb variant="M1" size={20} /><Caption value="M1" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="M2" size={20} /><Caption value="M2" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="M3" size={20} /><Caption value="M3" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="M4" size={20} /><Caption value="M4" size="sm" /></Col>
    <Col align="center" gap={1}><Orb variant="M5" size={20} /><Caption value="M5" size="sm" /></Col>
  </Grid>
  <Caption value="S lattice pulse · G globe wave · C ring chase · B lens blobs · M morphing ring" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Orbs: {
    template: `
<Card size="sm">
  <Col gap={3}>
    <Orbs variant="G4" size={26} color="discovery" label="Syncing sources" />
    <Orbs variant="C1" size={26} label="Loading context" />
    <Orbs variant="M5" size={26} color="success" label="Publishing" />
  </Col>
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  LoadingState: {
    template: `
<Card size="sm">
  <LoadingState label="Searching sources" variant="orbit" elapsed="8s" />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  TextResponse: {
    template: `
<Card size="md">
  <TextResponse value="The release is ready. All focused checks passed and the generated package contains the expected files." />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  StreamingText: {
    template: `
<Card size="md">
  <StreamingText
    text="I found three relevant sources and summarized the strongest evidence."
    speed={24}
    sources={[{ label: "Product guide", host: "docs.example.com" }]}
    actions={[{ label: "Copy summary", icon: "copy", action: { type: "summary.copy" } }]}
    followUps={[{ label: "Show the evidence", action: { type: "evidence.show" } }]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  InlineCitations: {
    template: `
<Card size="md">
  <InlineCitations
    text="Activation increased after onboarding was simplified.[1] Support volume also declined.[2]"
    sources={[
      { id: 1, label: "Activation analysis", host: "analytics.example.com", url: "https://example.com/activation" },
      { id: 2, label: "Support report", host: "support.example.com", url: "https://example.com/support" }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  CodeBlock: {
    template: `
<CodeBlock
  code={code}
  language="typescript"
  file="src/total.ts"
  highlightLines={[2]}
  onCopyAction={{ type: "code.copy" }}
/>
    `.trim(),
    schema: z.strictObject({ code: z.string() }),
    data: {
      code: "const items = [18, 24];\nconst total = items.reduce((sum, item) => sum + item, 0);\nconsole.log(total);"
    }
  },
  FileDiff: {
    template: `
<FileDiff
  file="src/config.ts"
  language="typescript"
  rows={[
    { oldLine: 1, newLine: 1, type: "context", text: "export const config = {" },
    { oldLine: 2, type: "remove", text: "  model: 'standard'," },
    { newLine: 2, type: "add", text: "  model: 'reasoning'," },
    { oldLine: 3, newLine: 3, type: "context", text: "};" }
  ]}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ImageGeneration: {
    template: `
<ImageGeneration
  prompt="A glass observatory above a misty forest at sunrise"
  resolution="1536 × 1024"
  aspectRatio="landscape"
  progress={64}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  TaskList: {
    template: `
<TaskList
  title="Release checklist"
  onItemClickAction={{ type: "task.open" }}
  items={[
    { id: "types", label: "Validate prop types", status: "completed" },
    { id: "examples", label: "Render live examples", detail: "In progress", status: "running", progress: 68 },
    { id: "publish", label: "Publish package", status: "pending" }
  ]}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  TaskRows: {
    template: `
<Card size="md">
  <TaskRows
    variant="list"
    onItemClickAction={{ type: "task.select" }}
    items={[
      {
        id: "docs",
        label: "Update documentation",
        status: "running",
        progress: 75,
        children: [
          { label: "Add prop reference", status: "completed" },
          { label: "Verify examples", status: "running" }
        ]
      }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ToolChips: {
    template: `
<Card size="md">
  <ToolChips
    summary="3 tool calls"
    onItemClickAction={{ type: "tool.open" }}
    items={[
      { type: "search", label: "Searched component registry", status: "completed" },
      { type: "read", label: "Read agent.tsx", status: "completed" },
      { type: "write", label: "Updated documentation", status: "running", additions: 32, deletions: 0 }
    ]}
  />
</Card>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  AgentInput: {
    template: `
<AgentInput
  placeholder="Ask the workspace"
  defaultValue="Summarize the latest release"
  models={[
    { value: "fast", label: "Fast" },
    { value: "reasoning", label: "Reasoning" }
  ]}
  defaultModel="reasoning"
  attachments={[{ id: "brief", name: "release-brief.pdf", type: "application/pdf", size: "1.2 MB" }]}
  commands={[
    { value: "summarize", label: "Summarize", description: "Create a concise summary", icon: "sparkle" },
    { value: "review", label: "Review", description: "Find risks and gaps", icon: "search" }
  ]}
  skills={[
    { value: "research", label: "Deep research", description: "Search connected sources", icon: "search" },
    { value: "writing", label: "Writing", description: "Polish the final response", icon: "write" }
  ]}
  selectedSkills={["research"]}
  attachAction={{ type: "prompt.attach" }}
  removeAttachmentAction={{ type: "prompt.attachment.remove" }}
  commandAction={{ type: "prompt.command" }}
  skillAction={{ type: "prompt.skill" }}
  enhanceAction={{ type: "prompt.enhance" }}
  submitAction={{ type: "prompt.submit" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  PromptInput: {
    template: `
<PromptInput
  placeholder="Describe the change"
  defaultValue="Make the dashboard easier to scan"
  enhancing
  cancelEnhanceAction={{ type: "prompt.enhance.cancel" }}
  submitAction={{ type: "prompt.submit" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ApprovalCard: {
    template: `
<ApprovalCard
  title="Confirm deployment"
  questions={[
    {
      id: "window",
      title: "Choose a deployment window",
      description: "The update takes about five minutes.",
      options: [
        { label: "Deploy now", value: "now", description: "Start immediately" },
        { label: "Tonight", value: "tonight", description: "Use the maintenance window" }
      ],
      allowOther: true,
      otherPlaceholder: "Suggest another time"
    },
    {
      id: "checks",
      title: "Which checks should run?",
      options: [
        { label: "Smoke tests", value: "smoke" },
        { label: "Full regression", value: "regression" }
      ],
      multiple: true,
      allowOther: false
    }
  ]}
  autoAdvance
  approveLabel="Continue"
  approveAction={{ type: "deployment.approve" }}
  skipAction={{ type: "deployment.skip" }}
  onQuestionChangeAction={{ type: "deployment.question" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Chat: {
    template: `
<Chat
  tabs={[{ id: "thread", label: "Thread" }, { id: "activity", label: "Activity" }]}
  messages={[
    { role: "user", content: "Can you audit the release?" },
    { role: "reasoning", label: "Reasoning", duration: "3s", content: "I will inspect the package and focused tests." },
    { role: "assistant", content: "The release looks healthy. Two known lint findings remain unrelated." }
  ]}
  onTabChangeAction={{ type: "chat.tab" }}
  sendAction={{ type: "chat.send" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  PromptBar: {
    template: `
<PromptBar
  placeholder="Ask with context"
  variant="rounded"
  sources={[
    { id: "docs", label: "Product docs", description: "12 indexed pages", icon: "document", connected: true },
    { id: "issues", label: "Issues", description: "Open project issues", icon: "clipboard" }
  ]}
  selectedSources={["docs"]}
  sourceAction={{ type: "source.select" }}
  submitAction={{ type: "prompt.submit" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  RecommendationCard: {
    template: `
<RecommendationCard
  title="Ship the cached query plan"
  description="It removes the largest repeated request without changing result quality."
  confidence={0.91}
  alternatives={[
    { label: "Keep the current plan", description: "No behavior change", status: "Low risk", action: { type: "recommendation.choose-current" } }
  ]}
  alternativesAction={{ type: "recommendation.more" }}
  acceptAction={{ type: "recommendation.accept" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ComparisonTable: {
    template: `
<ComparisonTable
  label="Workspace plan comparison"
  plans={["Starter", "Pro", "Enterprise"]}
  highlightPlan={1}
  features={[
    { label: "Agent runs", values: ["100/mo", "Unlimited", "Unlimited"] },
    { label: "Shared workspaces", values: [false, true, true] },
    { label: "Audit log", values: [false, false, true] }
  ]}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  ContextCards: {
    template: `
<ContextCards
  title="Retrieved context"
  onItemClickAction={{ type: "context.open" }}
  items={[
    {
      id: "release",
      title: "Release notes",
      excerpt: "Agent interfaces and workspace primitives are now available to widget templates.",
      characters: 1840,
      source: { label: "RELEASE.md", type: "MD" }
    },
    {
      id: "guide",
      title: "Authoring guide",
      excerpt: "Use registered component names and dispatch actions through ActionConfig objects.",
      characters: 932,
      source: { label: "AGENTS.md", type: "MD" }
    }
  ]}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  DiffTable: {
    template: `
<DiffTable
  title="Proposed catalog changes"
  columns={[
    { key: "field", label: "Field" },
    { key: "value", label: "Value" },
    { key: "status", label: "Status", type: "status" }
  ]}
  rows={[
    { type: "remove", values: { field: "Model", value: "Standard", status: "Removed" } },
    { type: "add", values: { field: "Model", value: "Reasoning", status: "Added" } },
    { type: "context", values: { field: "Region", value: "US West", status: "Unchanged" } }
  ]}
  applyAction={{ type: "changes.apply" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  FilterTable: {
    template: `
<FilterTable
  filters={[
    { label: "All", value: "all", count: 3 },
    { label: "Running", value: "running", count: 1, tone: "info" },
    { label: "Complete", value: "complete", count: 2, tone: "success" }
  ]}
  columns={[
    { key: "task", label: "Task" },
    { key: "owner", label: "Owner" },
    { key: "status", label: "Status", type: "status" }
  ]}
  rows={[
    { task: "Audit registry", owner: "Mira", status: "complete" },
    { task: "Render examples", owner: "Gan", status: "running" },
    { task: "Publish docs", owner: "Lee", status: "complete" }
  ]}
  onFilterAction={{ type: "records.filter" }}
  onRowClickAction={{ type: "record.open" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  FineTuneCard: {
    template: `
<FineTuneCard
  title="Generation settings"
  badge="Fine tune"
  fields={[
    { name: "temperature", label: "Temperature", type: "range", value: 0.7, min: 0, max: 1, step: 0.1 },
    { name: "tokens", label: "Max tokens", type: "number", value: 1200, min: 100, max: 4000 },
    { name: "style", label: "Response style", type: "select", value: "concise", options: [{ label: "Concise", value: "concise" }, { label: "Detailed", value: "detailed" }] }
  ]}
  onChangeAction={{ type: "settings.change" }}
  applyAction={{ type: "settings.apply" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Flowchart: {
    template: `
<Flowchart
  nodes={[
    { id: "ticket", label: "Ticket received", description: "New support request", kind: "trigger" },
    { id: "classify", label: "Classify request", description: "Detect topic and urgency", kind: "action" },
    { id: "route", label: "Route to team", description: "Assign the best queue", kind: "result" }
  ]}
  edges={[
    { from: "ticket", to: "classify", label: "analyze", tone: "info" },
    { from: "classify", to: "route", label: "then", tone: "success" }
  ]}
  onNodeClickAction={{ type: "workflow.node" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  InsightCards: {
    template: `
<InsightCards
  title="Activation insights"
  items={[
    {
      id: "activation",
      title: "Activation improved after onboarding changed",
      description: "The largest lift came from teams with fewer than ten seats.",
      metrics: [
        { label: "Activation", value: "68%", delta: "+8%", color: "success", data: [42, 47, 51, 58, 61, 68] },
        { label: "Time to value", value: "2.1d", delta: "−0.8d", data: [4.1, 3.7, 3.4, 2.9, 2.6, 2.1] }
      ],
      action: { label: "Open analysis", action: { type: "insight.open" } }
    },
    {
      id: "retention",
      title: "Week-four retention is stable",
      metrics: [{ label: "Retention", value: "54%", delta: "+1%", data: [50, 52, 51, 53, 54] }]
    }
  ]}
  onChangeAction={{ type: "insight.change" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  RecordsTable: {
    template: `
<RecordsTable
  selectable
  defaultSortKey="name"
  caption="Active workspace members"
  columns={[
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status", type: "status" }
  ]}
  rows={[
    { name: "Ada", role: "Owner", status: "Active" },
    { name: "Lin", role: "Editor", status: "Active" },
    { name: "Sam", role: "Viewer", status: "Invited" }
  ]}
  onRowClickAction={{ type: "member.open" }}
  onSelectionChangeAction={{ type: "members.select" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  Search: {
    template: `
<Search
  placeholder="Search workspace"
  items={[
    { id: "guide", label: "Authoring guide", description: "Widget syntax and actions", keywords: "docs templates", icon: "document" },
    { id: "release", label: "Release notes", description: "Recent component additions", keywords: "changelog", icon: "sparkle" },
    { id: "settings", label: "Workspace settings", description: "Members and preferences", icon: "settings" }
  ]}
  onSelectAction={{ type: "search.open" }}
  onChangeAction={{ type: "search.change" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  SelectionActions: {
    template: `
<SelectionActions
  text="The launch note is clear, but this sentence could be more concise for readers."
  selection="this sentence could be more concise"
  actions={[
    { label: "Shorten", value: "shorten", icon: "sparkle" },
    { label: "Clarify", value: "clarify" }
  ]}
  submitAction={{ type: "selection.edit" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  },
  SidebarNav: {
    template: `
<SidebarNav
  workspace="Research Lab"
  workspaceIcon="cube"
  sections={[
    {
      label: "Workspace",
      items: [
        { id: "threads", label: "Threads", icon: "message", badge: 4, active: true },
        { id: "sources", label: "Sources", icon: "database" },
        { id: "reports", label: "Reports", icon: "document" }
      ]
    }
  ]}
  footerAction={{ label: "Workspace settings", action: { type: "workspace.settings" } }}
  onNavigateAction={{ type: "workspace.navigate" }}
/>
    `.trim(),
    schema: EmptySchema,
    data: emptyData
  }
};
