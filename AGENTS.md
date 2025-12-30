You are a developer designing a resuable, compact widget renderer that complements the chat.

Your MUST read the description, technical specification, and examples below to deeply think about and understand the system.

Your deliverable consists of three parts:

1. A widget renderer that anyone can import to their existing React project. The user can pass the WIDGET SCHEMA and WIDGET TEMPLATE to a component named `<WidgetRenderer .../>`, and it will correctly rendered the user-defined widget according to the below spec and style.
2. A demo page with lots of pre-built widget examples (at least 10) so users can browse example widgets using your `WidgetRenderer` and verify its correctness, flexibility, and style.
3. (Stretch, if possible to do) An interactive page where consists of two text input boxes on the left (one for inputing widget template and the other for providing a widget data in JSON format for widget schema), and a dynmically rendered component on the right based on the inputs on the left.

For implementation, follow rules below:

1. You must use Tailwind CSS v4.1 and above. If you are unsure about the current syntax, search web for documentation.
2. You must use React, shadcn, framer motion as your main UI building blocks for implementation; you can use headless UI for components that shadcn don't support. You MUST search web for latest shadcn and framer motion documentation to ensure your usage is correct.
3. For icons, prefer using hero icons or Lucide React icons.
4. If you are unsure about the current syntax, search web for documentation.
5. Ensure proper and thorough documentation of your code and components you build, so developers unfamiliar with the project can understand and build on top of it.

Analyze this requirement and spec, and ask clarifying questions first before implementation.

If there are other compnoents that is usable for a widget system that's not covered in spec below, proactively implement them without asking user for permission. Include the new widget components in the demo page, and document your new spec additions in a readme file. You can use exsting components covered by shadcn as an inspiration for new specs.

After you finish implementation, review your own code against the spec to ensure you have done all the three parts above; have followed all the rules above; and have met the specs defined below. Fix any bugs, and clean up any code for readability. Make sure eslint return no errors when running lint.

---

**What are widgets?**

Widgets appear in chat conversation and are meant to enhance the conversation, not replace it. Widgets only include key contents and key actions. Since the assistant can include more context in the message text (and because the user can ask follow up questions), the widget does not need to include every possible detail.

Widgets are typically small and visually compact. Widgets are not large, full app interfaces. For example,a recipe widget might only include an image, title, short description, and cooking time badge. The full recipe would only be shown when the user clicks on the card or asks for the recipe steps.

The code language you use to create widgets looks like JSX, but is much more opinionated so please follow the instructions below and don't assume it works like JSX. For example, text can't be children of elements in this language.

# Widget UI

Widget UI is a strict, simplified version of JSX that only permits specific components and props. Failing to follow the spec and adding things like inline styles, class names, or nested text elements will cause the widget to fail.

Widget UI is designed with opinionated components and default styling to match ChatGPT's design aesthetic. While the default component style is often good enough, it can be styled to match a brand's style. For example, a Pan America flight tracker might have a blue gradient background and use theme="dark" to get white text.

Widget UI has limited interactivity because the widgets live as messages in a chat conversation. Some components have built in interactivity like `onClickAction`.

Widget UI can contain loops, conditions, and data binding; similar to a traditional templating system.

Widget UI does NOT allow arbitrary code or callbacks. Do not use IIFEs, all rendering is declarative. All interactivity is also expressed declaratively. All templating logic will ultimately be resolved server side by a thin piece of code that resolves the data bindings, loops, and conditionals.

## Core Widget UI principles

### Opinionated default

Widget UI is extremely opinionated and often no props are needed to create a beautiful widget. Default spacing, typography, radii, shadows, and image sizing are well designed.

Widget UI automatically adds spacing between elements, but this space can be overridden if needed by setting `gap` on the parent element. This is rarely required.

Widget UI components adapt to context. A Button may render solid by default but outline when inside a horizontal row.

### Limited interactivity

- Widgets are not full apps.
- Some components own minimal state. e.g. ListView, Select, Input
- All additional effects are server‑driven: a user action posts a message; the server responds with a new widget as a replacement, the client gracefully transitions between the old and new UI tree.

### Widget UI containers

- Widgets must be wrapped in a root-level container element. If the content is a single thing (summary, confirmation, form) use `Card`. If it is a set of options (restaurants, files), use `ListView`. Only use `Basic` when explicitly instructed to do so.
- `<Basic>`: A minimal container.
- `<Card>`: A simple card with a light border and plain background. Supports confirm and cancel actions.
- `<ListView>`: A scroll‑friendly list with built in “show more” mechanics. Children of ListView must be `<ListViewItem>`. `<ListViewItem>` must only ever be used as the immediate child of `<ListView>`, and extends `<Row>`.

### Layout primitives

- `<Box>`: Base building block, similar to a `<div>`.
- `<Row>`: Horizontal flex container for aligning items in a row.
- `<Col>`: Vertical flex container for stacking items in a column.
- `<Form>`: Like a `<Box>` but with an `onSubmitAction` which will capture any user-entered form state.
- `<Spacer>`: Flexible spacer that expands to fill remaining space in a flex layout.
- `<Divider>`: Theme-aware horizontal rule with optional spacing, thickness, color, and `flush` to remove surrounding padding.

### Spacing and size

- System spacing applies `margin-left` and `margin-top` to components based on the component pair and in some cases based on the parent container.
- System spacing can be overridden by setting `gap` on the parent container.
- `flush` (bool) lets components extend to the container edge and ignore padding. This let's dividers or images bleed to the card edge.

### Important default to be aware of

- Box: defaults to direction="col".
- Row: defaults align="center".
- Button: defaults to color="secondary".
- DatePicker / Select: variant="outline", size="md", pill=false, block=false, clearable=false, disabled=false.
- Divider: color="default", size=1.
- Image: fit="cover", position="center", radius="md", border={ size: 1, color: "subtle" }.
- Markdown: streaming=false.
- Text: size="md", weight="normal", italic=false; color defaults are theme-aware.
- There are other defaults inline below.

### Tips

- Do not include explanations, comments, or JSON alongside the unless explicitly asked
- Use fewer colors and type sizes for a more consistent widget
- Don't overcomplicate the widget, simple is often better.

### Common Mistakes to Avoid

- Missing name on inputs → host receives no form data.
- Inventing props or values → silently ignored.
- Forgetting key on mapped rows → janky animations and lost focus.
- Triggering confirm with invalid fields → action won’t fire (validation error).
- Using unknown icon names → icon will not render.
- Relying on implicit defaults for UX‑critical styling (e.g., forgetting variant when you need a bordered control).
- Do not use any components except the ones defined in the [reference](#component-reference)! These are the only valid components. Do not use intrinsic components like `<div>`.

**Text values**

- Unlike traditional JSX, never use children for text.
- Text-bearing components NEVER accept children. Use value/label props only. This includes Text, Title, Caption, Badge, Button, Label, and Markdown.

```tsx
// Correct
<Text value="Hello world" />
<Title value="Welcome" />
<Caption value="Details" />
<Button label="Continue" />
<Badge label="Beta" />

// Invalid
<Text>Hello world</Text>
<Title>Welcome</Title>
<Caption>Details</Caption>
<Button>Continue</Button>
<Badge>Beta</Badge>
```

### Schema format

Every view also has a schema that describes the state that it expects. Use zod to define this schema.

- Use zod and only zod, do not import other libraries
- Do not import zod as anything other than `import { z } from "zod"`
- The widget schema must be default exported
- Use the v4 version of zod
- Do not create helper functions, or use zod transforms, only define simple schemas using the zod API.
- You can extract parts of the widget schema to named helper schemas when useful for clarity or formatting (e.g. to avoid deep indenting)
- Prefer `z.strictObject` over `z.object`
- Ensure that the zod schema correctly satisfies the widget types. It doesn't need to be an exact match e.g. color could be `z.union(["red", "blue"])` which satisfies `string | ThemeColor`.
- When using colors, generally prefer a subset of good colors over an arbitrary string, first prefer the named tokens, then prefer primitive colors (ala tailwind), avoid using hex colors or only validating as a string.

# Examples

Each example below includes the USER MESSAGE, the WIDGET SCHEMA, and WIDGET TEMPLATE. The WIDGET DATA is included as rich JSON data examples object.

USER MESSAGE
"confirm adding a new calendar event"

WIDGET TEMPLATE

```tsx
<Card
  size="md"
  confirm={{ label: "Add to calendar", action: { type: "calendar.add" } }}
  cancel={{ label: "Discard", action: { type: "calendar.discard" } }}
>
  <Row align="start">
    <Col align="start" gap={1} width={80}>
      <Caption value={date.name} size="lg" color="secondary" />
      <Title value={date.number} size="3xl" />
    </Col>

    <Col flex="auto">
      {events.map((item) => (
        <Row
          key={item.id}
          padding={{ x: 3, y: 2 }}
          gap={3}
          radius="xl"
          background={item.isNew ? "none" : "surface-secondary"}
          border={
            item.isNew
              ? { size: 1, color: item.color, style: "dashed" }
              : undefined
          }
        >
          <Box width={4} height="40px" radius="full" background={item.color} />
          <Col>
            <Text value={item.title} />
            <Text value={item.time} size="sm" color="tertiary" />
          </Col>
        </Row>
      ))}
    </Col>
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Event = z.strictObject({
  id: z.string(),
  isNew: z.boolean(),
  color: z.enum(["red", "blue"]),
  title: z.string(),
  time: z.string()
});

const WidgetState = z.strictObject({
  date: z.strictObject({
    name: z.string(),
    number: z.string()
  }),
  events: z.array(Event)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "date": { "name": "Tue", "number": "14" },
  "events": [
    {
      "id": "event-1",
      "isNew": true,
      "color": "red",
      "title": "Design review",
      "time": "2:00 PM – 3:00 PM"
    },
    {
      "id": "event-2",
      "isNew": false,
      "color": "blue",
      "title": "1:1 catch up",
      "time": "4:30 PM – 5:00 PM"
    }
  ]
}
```

---

USER MESSAGE

"view details of calendar event"

WIDGET TEMPLATE

```tsx
<Card>
  <Row align="stretch" gap={3}>
    <Box width={5} background={color} radius="full" />
    <Col flex={1} gap={1}>
      <Row>
        <Text
          color="alpha-70"
          size="sm"
          value={`${date.dayName}, ${date.monthName} ${date.dayNumber}`}
        />
        <Spacer />
        <Text color={color} size="sm" value={time} />
      </Row>
      <Title value={title} size="md" />
    </Col>
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const WidgetState = z.strictObject({
  color: z.enum(["red", "blue"]),
  date: z.strictObject({
    dayName: z.string(),
    monthName: z.string(),
    dayNumber: z.string()
  }),
  time: z.string(),
  title: z.string()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "color": "blue",
  "date": { "dayName": "Monday", "monthName": "January", "dayNumber": "8" },
  "time": "10:30 AM",
  "title": "Team sync"
}
```

---

USER MESSAGE

"create a new task in issue tracker app"

WIDGET TEMPLATE

```tsx
<Card size="md">
  <Form onSubmitAction={{ type: "task.create" }}>
    <Col gap={3}>
      <Text
        value={initialTitle}
        size="lg"
        weight="semibold"
        editable={{
          name: "task.title",
          required: true,
          placeholder: "Task title",
          autoFocus: false,
          autoSelect: false
        }}
      />

      <Text
        value={initialDescription}
        minLines={5}
        editable={{
          name: "task.body",
          required: true,
          placeholder: "Describe the task…"
        }}
      />
      <Divider flush />
      <Row align="center" gap={3}>
        <Row align="center" gap={2}>
          <DatePicker
            name="task.due"
            placeholder="Due date"
            defaultValue={initialDueDate}
            clearable
            pill
          />
        </Row>
        <Spacer />
        <Button submit label="Create task" style="primary" />
      </Row>
    </Col>
  </Form>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const WidgetState = z.strictObject({
  initialTitle: z.string(),
  initialDescription: z.string(),
  initialDueDate: z.iso.date()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "initialTitle": "Investigate flaky CI",
  "initialDescription": "Track down the intermittent failure in the integration suite and propose a fix.",
  "initialDueDate": "2026-01-05"
}
```

---

USER MESSAGE

"a card that shows an attendee at a conferance and any talks they are giving"

WIDGET TEMPLATE

```tsx
<Card size="sm">
  <Col align="center" padding={{ top: 6, bottom: 4 }} gap={4}>
    <Image
      src={image}
      aspectRatio={1}
      radius="full"
      size={200}
      frame
      background="surface-elevated-secondary"
    />
    <Col gap={1}>
      <Title value={name} size="xl" textAlign="center" />
      <Text value={title} color="secondary" textAlign="center" />
    </Col>
  </Col>
  <Divider flush />
  <Col gap={3}>
    {sessions.map((item) => (
      <Row key={item.id} gap={3}>
        <Col>
          <Text
            value={item.title}
            size="sm"
            weight="semibold"
            color="emphasis"
            maxLines={1}
          />
          <Text value={item.time} size="sm" color="secondary" maxLines={1} />
        </Col>
        <Spacer />
        <Button label="View" variant="outline" />
      </Row>
    ))}
  </Col>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Session = z.strictObject({
  id: z.string(),
  title: z.string(),
  time: z.string()
});

const WidgetState = z.strictObject({
  image: z.string(),
  name: z.string(),
  title: z.string(),
  sessions: z.array(Session)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "image": "/speakers/sam.png",
  "name": "Sam Example",
  "title": "Developer Advocate",
  "sessions": [
    { "id": "s-1", "title": "Practical Agents", "time": "9:30 AM" },
    { "id": "s-2", "title": "UI Patterns", "time": "2:10 PM" }
  ]
}
```

---

USER MESSAGE

"list of agenda items for a conference with a custom note generated by the model"

WIDGET TEMPLATE

```tsx
<ListView>
  {items.map((item) => (
    <ListViewItem gap={2} align="stretch">
      <Box background={item.accent} radius="full" width={3} />
      <Col gap={0}>
        <Row>
          <Caption value={item.time} color={item.accent} />
          <Caption value={item.location} color={item.accent} />
        </Row>
        <Text value={item.title} size="sm" />
        <Text value={item.note} size="sm" color="secondary" />
      </Col>
    </ListViewItem>
  ))}
</ListView>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const AgendaItem = z.strictObject({
  accent: z.union([
    z.literal("red"),
    z.literal("orange"),
    z.literal("yellow"),
    z.literal("green"),
    z.literal("blue"),
    z.literal("purple")
  ]),
  time: z.string(),
  location: z.string(),
  title: z.string(),
  note: z.string()
});

const WidgetState = z.strictObject({
  items: z.array(AgendaItem)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "items": [
    {
      "accent": "purple",
      "time": "10:00 AM",
      "location": "Hall A",
      "title": "Keynote",
      "note": "Arrive early for a good seat; Q&A tends to fill fast."
    },
    {
      "accent": "blue",
      "time": "11:15 AM",
      "location": "Room 204",
      "title": "Agent Tooling Workshop",
      "note": "Bring a laptop; you'll be wiring actions and schema hydration."
    }
  ]
}
```

---

USER MESSAGE

"detail view for a conference session"

WIDGET TEMPLATE

```tsx
<Card size="md">
  <Col gap={1}>
    <Text value={type} size="sm" color="purple" />
    <Title value={title} size="sm" />
    <Text value={description} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <Col gap={3}>
    <Row gap={3}>
      <Box
        size={40}
        background="purple"
        radius="sm"
        align="center"
        justify="center"
      >
        <Icon name="map-pin" size="xl" color="white" />
      </Box>
      <Col>
        <Text
          value={location}
          size="sm"
          weight="semibold"
          color="emphasis"
          maxLines={1}
        />
        <Text value={time} size="sm" color="secondary" maxLines={1} />
      </Col>
      <Spacer />
      <Button label="View" variant="outline" />
    </Row>
    {speakers.map((item) => (
      <Row key={item.id} gap={3}>
        <Image src={item.image} />
        <Col>
          <Text
            value={item.name}
            size="sm"
            weight="semibold"
            color="emphasis"
            maxLines={1}
          />
          <Text value={item.title} size="sm" color="secondary" maxLines={1} />
        </Col>
        <Spacer />
        <Button label="View" variant="outline" />
      </Row>
    ))}
  </Col>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Speaker = z.strictObject({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  title: z.string()
});

const WidgetState = z.strictObject({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  time: z.string(),
  speakers: z.array(Speaker)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "type": "Workshop",
  "title": "Building Reliable Widgets",
  "description": "A hands-on session on schema-first UI construction.",
  "location": "Room 1B",
  "time": "3:40 PM",
  "speakers": [
    {
      "id": "sp-1",
      "image": "/speakers/alex.png",
      "name": "Alex Rivera",
      "title": "Staff Engineer"
    }
  ]
}
```

---

USER MESSAGE

"flight tracker for pan am"

WIDGET TEMPLATE

```tsx
<Card size="md">
  <Col gap={1}>
    <Text value={type} size="sm" color="#FF7B00" />
    <Title value={title} size="sm" />
    <Text value={description} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <Col gap={3}>
    <Row gap={3}>
      <Box
        size={40}
        background="#FF7B00"
        radius="sm"
        align="center"
        justify="center"
      >
        <Icon name="map-pin" size="xl" />
      </Box>
      <Col>
        <Text
          value={location}
          size="sm"
          weight="semibold"
          color="emphasis"
          maxLines={1}
        />
        <Text value={time} size="sm" color="secondary" maxLines={1} />
      </Col>
      <Spacer />
      <Button label="View" variant="outline" />
    </Row>
    {speakers.map((item) => (
      <Row key={item.id} gap={3}>
        <Image src={item.image} />
        <Col>
          <Text
            value={item.name}
            size="sm"
            weight="semibold"
            color="emphasis"
            maxLines={1}
          />
          <Text value={item.title} size="sm" color="secondary" maxLines={1} />
        </Col>
        <Spacer />
        <Button label="View" variant="outline" />
      </Row>
    ))}
  </Col>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Speaker = z.strictObject({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  title: z.string()
});

const WidgetState = z.strictObject({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  time: z.string(),
  speakers: z.array(Speaker)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "type": "Flight status",
  "title": "Pan Am 101",
  "description": "On time • Gate B12",
  "location": "SFO → JFK",
  "time": "Departing 6:45 PM",
  "speakers": [
    {
      "id": "crew-1",
      "image": "/crew/captain.png",
      "name": "A. Pilot",
      "title": "Captain"
    }
  ]
}
```

---

USER MESSAGE

"a list of user devices"

WIDGET TEMPLATE

```tsx
<ListView>
  {devices.map((item) => (
    <ListViewItem
      key={item.id}
      gap={3}
      onClickAction={{ type: "device.select", payload: { id: item.id } }}
    >
      <Box background="alpha-10" radius="sm" padding={2}>
        <Icon name={item.icon} size="lg" />
      </Box>

      <Col gap={0}>
        <Text value={item.name} size="sm" weight="semibold" />
        <Caption
          value={`${item.status} • ${item.os} ${item.version}`}
          color="secondary"
        />
      </Col>
    </ListViewItem>
  ))}
</ListView>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const IconName = z.enum([
  "analytics",
  "atom",
  "bolt",
  "book-open",
  "book-closed",
  "calendar",
  "chart",
  "check",
  "check-circle",
  "check-circle-filled",
  "chevron-left",
  "chevron-right",
  "circle-question",
  "compass",
  "cube",
  "document",
  "dots-horizontal",
  "empty-circle",
  "globe",
  "keys",
  "lab",
  "images",
  "info",
  "lifesaver",
  "lightbulb",
  "mail",
  "map-pin",
  "maps",
  "name",
  "notebook",
  "notebook-pencil",
  "page-blank",
  "phone",
  "plus",
  "profile",
  "profile-card",
  "star",
  "star-filled",
  "search",
  "sparkle",
  "sparkle-double",
  "square-code",
  "square-image",
  "square-text",
  "suitcase",
  "settings-slider",
  "user",
  "write",
  "write-alt",
  "write-alt2",
  "reload",
  "play",
  "mobile",
  "desktop",
  "external-link"
]);

const Device = z.strictObject({
  id: z.string(),
  icon: IconName,
  name: z.string(),
  status: z.string(),
  os: z.string(),
  version: z.string()
});

const WidgetState = z.strictObject({
  devices: z.array(Device)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "devices": [
    {
      "id": "dev-iphone",
      "icon": "mobile",
      "name": "iPhone 16",
      "status": "Online",
      "os": "iOS",
      "version": "18.2"
    },
    {
      "id": "dev-mbp",
      "icon": "desktop",
      "name": "MacBook Pro",
      "status": "Last seen 2h ago",
      "os": "macOS",
      "version": "15.1"
    }
  ]
}
```

---

USER MESSAGE

"a dialog asking user to enable notifications"

WIDGET TEMPLATE

```tsx
<Card>
  <Col align="center" gap={4} padding={4}>
    <Box background="green-400" radius="full" padding={3}>
      <Icon name="check" size="3xl" color="white" />
    </Box>
    <Col align="center" gap={1}>
      <Title value={title} />
      <Text value={description} color="secondary" />
    </Col>
  </Col>

  <Row>
    <Button
      label="Yes"
      block
      onClickAction={{
        type: "notification.settings",
        payload: { enable: true }
      }}
    />
    <Button
      label="No"
      block
      variant="outline"
      onClickAction={{
        type: "notification.settings",
        payload: { enable: true }
      }}
    />
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const WidgetState = z.strictObject({
  title: z.string(),
  description: z.string()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "title": "Enable notifications",
  "description": "Turn on alerts to get timely updates."
}
```

---

USER MESSAGE

"sorftware purchase confrimation for ChatGPT Business. Include purpose, start date, end date, volume, and purchase frequency."

WIDGET TEMPLATE

```tsx
<Card
  size="sm"
  padding={0}
  confirm={{ label: "Confirm", action: { type: "request.submit" } }}
  cancel={{ label: "Discard", action: { type: "request.discard" } }}
>
  <Row align="center" padding={{ x: 4, top: 4, bottom: 1 }}>
    <Title value="Software purchase" size="sm" />
  </Row>
  <Col padding={{ left: 4, right: 2 }}>
    <Row padding={{ right: 2 }}>
      <Text value="What is it for?" size="sm" color="secondary" />
      <Spacer />
      <Box padding={1.1}>
        <Text
          value={productName}
          textAlign="end"
          width="200px"
          editable={{
            name: "purchase.purpose",
            required: true,
            placeholder: "Vendor or tool"
          }}
        />
      </Box>
    </Row>
    <Row>
      <Text value="Start date" size="sm" color="secondary" />
      <Spacer />
      <DatePicker
        name="purchase.start"
        defaultValue={startDate}
        align="end"
        variant="ghost"
      />
    </Row>
    <Row>
      <Text value="End date" size="sm" color="secondary" />
      <Spacer />
      <DatePicker
        name="purchase.end"
        defaultValue={endDate}
        align="end"
        variant="ghost"
      />
    </Row>
    <Row>
      <Text value="Volume" size="sm" color="secondary" />
      <Spacer />
      <Select
        name="purchase.volume"
        options={volumeOptions}
        defaultValue={defaultVolume}
        variant="ghost"
      />
    </Row>
    <Row>
      <Text value="Frequency" size="sm" color="secondary" />
      <Spacer />
      <Select
        name="purchase.frequency"
        options={frequencyOptions}
        defaultValue={defaultFrequency}
        variant="ghost"
      />
    </Row>
  </Col>
  <Row
    padding={{ y: 4, left: 4, right: 5 }}
    background="surface-elevated-secondary"
    border={{ top: { size: 1 } }}
  >
    <Text value="Total amount" size="sm" />
    <Spacer />
    <Text value={totalAmount} weight="semibold" size="sm" />
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const SelectOption = z.strictObject({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional()
});

const WidgetState = z.strictObject({
  productName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  volumeOptions: z.array(SelectOption),
  defaultVolume: z.string(),
  frequencyOptions: z.array(SelectOption),
  defaultFrequency: z.string(),
  totalAmount: z.string()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "productName": "ChatGPT Business",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "volumeOptions": [
    { "label": "10 seats", "value": "10" },
    { "label": "25 seats", "value": "25" },
    { "label": "50 seats", "value": "50" }
  ],
  "defaultVolume": "25",
  "frequencyOptions": [
    { "label": "Monthly", "value": "monthly" },
    { "label": "Annual", "value": "annual" }
  ],
  "defaultFrequency": "annual",
  "totalAmount": "$7,500"
}
```

---

USER MESSAGE

"purchase confirmation for a $20 blue folding chair from OpenAI"

WIDGET TEMPLATE

```tsx
<Card
  size="sm"
  padding={0}
  confirm={{ label: "Confirm", action: { type: "request.submit" } }}
  cancel={{ label: "Discard", action: { type: "request.discard" } }}
>
  <Row align="center" padding={{ x: 4, top: 4, bottom: 1 }}>
    <Title value="Software purchase" size="sm" />
  </Row>
  <Col padding={{ left: 4, right: 2 }}>
    <Row padding={{ right: 2 }}>
      <Text value="What is it for?" size="sm" color="secondary" />
      <Spacer />
      <Box padding={1.1}>
        <Text
          value={productName}
          textAlign="end"
          width="200px"
          editable={{
            name: "purchase.purpose",
            required: true,
            placeholder: "Vendor or tool"
          }}
        />
      </Box>
    </Row>
    <Row>
      <Text value="Start date" size="sm" color="secondary" />
      <Spacer />
      <DatePicker
        name="purchase.start"
        defaultValue={startDate}
        align="end"
        variant="ghost"
      />
    </Row>
    <Row>
      <Text value="End date" size="sm" color="secondary" />
      <Spacer />
      <DatePicker
        name="purchase.end"
        defaultValue={endDate}
        align="end"
        variant="ghost"
      />
    </Row>
    <Row>
      <Text value="Volume" size="sm" color="secondary" />
      <Spacer />
      <Select
        name="purchase.volume"
        options={volumeOptions}
        defaultValue={defaultVolume}
        variant="ghost"
      />
    </Row>
    <Row>
      <Text value="Frequency" size="sm" color="secondary" />
      <Spacer />
      <Select
        name="purchase.frequency"
        options={frequencyOptions}
        defaultValue={defaultFrequency}
        variant="ghost"
      />
    </Row>
  </Col>
  <Row
    padding={{ y: 4, left: 4, right: 5 }}
    background="surface-elevated-secondary"
    border={{ top: { size: 1 } }}
  >
    <Text value="Total amount" size="sm" />
    <Spacer />
    <Box></Box>
    <Text value={totalAmount} weight="semibold" size="sm" />
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const SelectOption = z.strictObject({
  label: z.string(),
  value: z.string(),
  disabled: z.boolean().optional()
});

const WidgetState = z.strictObject({
  productName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  volumeOptions: z.array(SelectOption),
  defaultVolume: z.string(),
  frequencyOptions: z.array(SelectOption),
  defaultFrequency: z.string(),
  totalAmount: z.string()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "productName": "Blue folding chair",
  "startDate": "2026-01-10",
  "endDate": "2026-01-10",
  "volumeOptions": [
    { "label": "1 unit", "value": "1" },
    { "label": "2 units", "value": "2" }
  ],
  "defaultVolume": "1",
  "frequencyOptions": [{ "label": "One-time", "value": "one_time" }],
  "defaultFrequency": "one_time",
  "totalAmount": "$20.00"
}
```

---

USER MESSAGE

"view playlist"

WIDGET TEMPLATE

```tsx
<Card size="sm">
  <Image src={bannerImage} alt="K-POP" height={180} fit="cover" flush />
  <Col padding={{ y: 2 }}>
    {tracks.map((item, index) => (
      <Row key={item.id} align="center" gap={3}>
        <Caption value={`${index + 1}`} />
        <Image src={item.cover} />
        <Col flex="auto" gap={0}>
          <Text value={item.title} weight="semibold" />
          <Text value={item.artist} size="sm" color="secondary" />
        </Col>

        <Button
          iconStart="play"
          variant="ghost"
          uniform
          size="xl"
          onClickAction={{ type: "music.play", payload: { id: item.id } }}
        />
      </Row>
    ))}
  </Col>
  <Button
    label="View playlist"
    variant="outline"
    pill
    block
    onClickAction={{ type: "view.playlist", payload: { name: "kpop" } }}
  />
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Track = z.strictObject({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  cover: z.string()
});

const WidgetState = z.strictObject({
  bannerImage: z.string(),
  tracks: z.array(Track)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "bannerImage": "/kpop.png",
  "tracks": [
    {
      "id": "retrovinyl",
      "title": "retrovinyl",
      "artist": "Erik Mclean",
      "cover": "/album01.png"
    },
    {
      "id": "neon-polaroid",
      "title": "Neon Polaroid",
      "artist": "Efe Kurnaz",
      "cover": "/album03.png"
    },
    {
      "id": "morning-grain",
      "title": "Morning Grain",
      "artist": "Reinhart Julian",
      "cover": "/album02.png"
    }
  ]
}
```

---

USER MESSAGE

"purchase items"

WIDGET TEMPLATE

```tsx
<Card size="sm">
  <Col>
    {items.map((item) => (
      <Row key={item.title} align="center">
        <Image src={item.image} size={48} />
        <Col>
          <Text
            value={item.title}
            size="md"
            weight="semibold"
            color="emphasis"
          />
          <Text value={item.subtitle} size="sm" color="secondary" />
        </Col>
      </Row>
    ))}
  </Col>

  <Divider flush />

  <Col>
    <Row>
      <Text value="Subtotal" size="sm" />
      <Spacer />
      <Text value={subTotal} size="sm" />
    </Row>
    <Row>
      <Text value={`Sales tax (${taxPct})`} size="sm" />
      <Spacer />
      <Text value={tax} size="sm" />
    </Row>
    <Row>
      <Text value="Total with tax" weight="semibold" size="sm" />
      <Spacer />
      <Text value={total} weight="semibold" size="sm" />
    </Row>
  </Col>

  <Divider flush />

  <Col>
    <Button
      label="Purchase"
      onClickAction={{ type: "purchase" }}
      style="primary"
      block
    />
    <Button
      label="Add to cart"
      onClickAction={{ type: "add_to_cart" }}
      style="secondary"
      block
    />
  </Col>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Item = z.strictObject({
  image: z.string(),
  title: z.string(),
  subtitle: z.string()
});

const WidgetState = z.strictObject({
  items: z.array(Item),
  subTotal: z.string(),
  taxPct: z.string(),
  tax: z.string(),
  total: z.string()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "items": [
    {
      "image": "https://cdn.openai.com/API/storybook/blacksugar.png",
      "title": "Black Sugar Hoick Latte",
      "subtitle": "16oz Iced · Boba · $6.50"
    },
    {
      "image": "https://cdn.openai.com/API/storybook/classic.png",
      "title": "Classic Milk Tea",
      "subtitle": "16oz Iced · Double Boba · $6.75"
    },
    {
      "image": "https://cdn.openai.com/API/storybook/matcha.png",
      "title": "Matcha Latte",
      "subtitle": "16oz Iced · Boba · $6.50"
    }
  ],
  "subTotal": "$19.75",
  "taxPct": "8.75%",
  "tax": "$1.72",
  "total": "$21.47"
}
```

---

USER MESSAGE

"breakout session"

WIDGET TEMPLATE

```tsx
<Card size="md">
  <Col gap={1}>
    <Text value={type} size="sm" color="#FF7B00" />
    <Title value={title} size="sm" />
    <Text value={description} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <Col gap={3}>
    <Row gap={3}>
      <Box
        size={40}
        background="#FF7B00"
        radius="sm"
        align="center"
        justify="center"
      >
        <Icon name="map-pin" size="xl" />
      </Box>
      <Col>
        <Text
          value={location}
          size="sm"
          weight="semibold"
          color="emphasis"
          maxLines={1}
        />
        <Text value={time} size="sm" color="secondary" maxLines={1} />
      </Col>
      <Spacer />
      <Button label="View" variant="outline" />
    </Row>
    {speakers.map((item) => (
      <Row key={item.id} gap={3}>
        <Image src={item.image} />
        <Col>
          <Text
            value={item.name}
            size="sm"
            weight="semibold"
            color="emphasis"
            maxLines={1}
          />
          <Text value={item.title} size="sm" color="secondary" maxLines={1} />
        </Col>
        <Spacer />
        <Button label="View" variant="outline" />
      </Row>
    ))}
  </Col>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Speaker = z.strictObject({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  org: z.string(),
  image: z.string()
});

const WidgetState = z.strictObject({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  track: z.string(),
  time: z.string(),
  location: z.string(),
  speakers: z.array(Speaker)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "id": "session-orchestrating-agents-at-scale",
  "title": "Orchestrating Agents at Scale",
  "description": "Click, connect, create. Learn how to quickly design and deploy enterprise-grade agents with a new suite of agentic platform tools.",
  "type": "Breakout session",
  "track": "Deploy and Scale",
  "time": "11:15 AM",
  "location": "Cowell Theater",
  "speakers": [
    {
      "id": "speaker-james-hills",
      "name": "James Hills",
      "title": "Member of Technical Staff",
      "org": "OpenAI",
      "image": "/jameshills.png"
    },
    {
      "id": "speaker-rohan-mehta",
      "name": "Rohan Mehta",
      "title": "Member of Technical Staff",
      "org": "OpenAI",
      "image": "/rohanmehta.png"
    }
  ]
}
```

---

USER MESSAGE

"player card"

WIDGET TEMPLATE

```tsx
<Card
  size="md"
  theme="dark"
  padding={8}
  background="url(https://ik.imagekit.io/m998roxrr/footballfroge.png) no-repeat center / cover"
>
  <Row align="center">
    <Box width="40%" minHeight={160} />
    <Col flex="auto">
      <Title
        value={`${name} (#${number})`}
        size="xl"
        color="white"
        weight="normal"
      />
      <Row>
        {stats.map((item, index) => (
          <Col flex={1} gap={0}>
            <Text value={item.value} weight="semibold" />
            <Caption value={item.label} color={accent} />
          </Col>
        ))}
      </Row>
    </Col>
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const Stat = z.strictObject({
  value: z.string(),
  label: z.string()
});

const WidgetState = z.strictObject({
  name: z.string(),
  number: z.string(),
  accent: z.string(),
  stats: z.array(Stat)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "name": "Froge",
  "number": "22",
  "accent": "blue-100",
  "stats": [
    { "value": "18", "label": "PTS" },
    { "value": "141", "label": "YDS" },
    { "value": "2", "label": "TKL" },
    { "value": "17", "label": "LEAPS" }
  ]
}
```

---

USER MESSAGE

"weather forecast"

WIDGET TEMPLATE

```tsx
<Card theme="dark" size="sm" padding={8} background={background}>
  <Col align="center" gap={3}>
    <Image src={conditionImage} size={60} />

    <Row align="center" gap={2}>
      <Title
        value={lowTemperature}
        size="2xl"
        weight="normal"
        color="alpha-70"
      />
      <Title
        value={highTemperature}
        size="2xl"
        color="emphasis"
        weight="normal"
      />
    </Row>

    <Caption value={location} color="emphasis" />
    <Text value={conditionDescription} textAlign="center" />

    <Row gap={6}>
      {forecast.map((day) => (
        <Col align="center" gap={0}>
          <Image src={day.conditionImage} size={40} />
          <Text value={day.temperature} />
        </Col>
      ))}
    </Row>
  </Col>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const ForecastItem = z.strictObject({
  conditionImage: z.string(),
  temperature: z.string()
});

const WidgetState = z.strictObject({
  background: z.string(),
  conditionImage: z.string(),
  lowTemperature: z.string(),
  highTemperature: z.string(),
  location: z.string(),
  conditionDescription: z.string(),
  forecast: z.array(ForecastItem)
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "background": "linear-gradient(111deg, #1769C8 0%, #258AE3 56.92%, #31A3F8 100%)",
  "conditionImage": "https://cdn.openai.com/API/storybook/mixed-sun.png",
  "lowTemperature": "47°",
  "highTemperature": "69°",
  "location": "San Francisco, CA",
  "conditionDescription": "Partly sunny skies accompanied by some clouds",
  "forecast": [
    {
      "conditionImage": "https://cdn.openai.com/API/storybook/mostly-sunny.png",
      "temperature": "54°"
    },
    {
      "conditionImage": "https://cdn.openai.com/API/storybook/rain.png",
      "temperature": "54°"
    },
    {
      "conditionImage": "https://cdn.openai.com/API/storybook/mixed-sun.png",
      "temperature": "54°"
    },
    {
      "conditionImage": "https://cdn.openai.com/API/storybook/windy.png",
      "temperature": "54°"
    },
    {
      "conditionImage": "https://cdn.openai.com/API/storybook/mostly-sunny.png",
      "temperature": "54°"
    }
  ]
}
```

---

USER MESSAGE

"enable notification"

WIDGET TEMPLATE

```tsx
<Card>
  <Col align="center" gap={4} padding={4}>
    <Box background="green-400" radius="full" padding={3}>
      <Icon name="check" size="3xl" color="white" />
    </Box>
    <Col align="center" gap={1}>
      <Title value={title} />
      <Text value={description} color="secondary" />
    </Col>
  </Col>

  <Row>
    <Button
      label="Yes"
      block
      onClickAction={{
        type: "notification.settings",
        payload: { enable: true }
      }}
    />
    <Button
      label="No"
      block
      variant="outline"
      onClickAction={{
        type: "notification.settings",
        payload: { enable: true }
      }}
    />
  </Row>
</Card>
```

WIDGET SCHEMA

```tsx
import { z } from "zod";

const WidgetState = z.strictObject({
  title: z.string(),
  description: z.string()
});

export default WidgetState;
```

WIDGET DATA (example)

```json
{
  "title": "Enable notification",
  "description": "Notify me when this item ships"
}
```

---

# Component Reference

```ts
export type WidgetRoot = Card | ListView | Basic;

export type WidgetComponent =
  | Text
  | Title
  | Caption
  | Badge
  | Markdown
  | ListViewItem
  | Box
  | Row
  | Col
  | Divider
  | Icon
  | Image
  | Button
  | Checkbox
  | Chart
  | Spacer
  | Select
  | DatePicker
  | Form
  | Input
  | Label
  | RadioGroup
  | Textarea
  | Transition;

// Containers
type Basic = React.FC<BasicProps>;
type BasicProps = Pick<
  BoxProps,
  "gap" | "padding" | "align" | "justify" | "direction"
> & {
  /** Children to render inside this root. Can include WidgetComponents or nested WidgetRoots. */
  children: React.ReactNode;
  /** Force light or dark theme for this subtree. */
  theme?: "light" | "dark";
};

type Card = React.FC<CardProps>;
type CardProps = {
  /** Child components rendered inside the card. Must be WidgetComponents */
  children: React.ReactNode;
  /**
   * Treat the card as an HTML form; enabling the card's `confirm` and `cancel` actions to capture user-entered form data in their payloads.
   *
   * @default false
   */
  asForm?: boolean;
  /**
   * Background color; accepts background color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Valid tokens: `surface` `surface-secondary` `surface-tertiary` `surface-elevated` `surface-elevated-secondary`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "surface-elevated"
   */
  background?: string | ThemeColor;
  /**
   * Visual size of the card.
   *
   * | sm    | md    | lg    | full |
   * | ----- | ----- | ----- | ---- |
   * | 360px | 440px | 560px | 100% |
   *
   * @default "sm"
   */
  size?: "sm" | "md" | "lg" | "full";
  /**
   * Inner spacing of the card; accepts a spacing unit, CSS string, or padding object.
   *
   * @default 4
   */
  padding?: number | string | Padding;
  /** Optional status header displayed above the card. */
  status?: WidgetStatus;
  /**
   * Collapse card body; useful after the card's main action has been completed.
   * The user can still expand the card to view the contents.
   *
   * @default false
   */
  collapsed?: boolean;

  /** Confirmation action button shown in the card footer. */
  confirm?: {
    /** Text inside the confirm button */
    label: string;
    /** Declarative action dispatched when the confirm button is clicked */
    action: ActionConfig;
  };

  /** Cancel action button shown in the card footer. */
  cancel?: {
    /** Text inside the confirm button */
    label: string;
    /** Declarative action dispatched when the confirm button is clicked */
    action: ActionConfig;
  };
  /** Force light or dark theme for this subtree. */
  theme?: "light" | "dark";
};

type ListView = React.FC<ListViewProps>;
type ListViewProps = {
  /** Items to render in the list.
   *
   * **Important:** All direct children must be ListViewItem components.
   */
  children: React.ReactNode;
  /**
   * Max number of items to show before a "Show more" control.
   *
   * @default "auto"
   */
  limit?: number | "auto";
  /** Optional status header displayed above the list. */
  status?: WidgetStatus;
  /** Force light or dark theme for this subtree. */
  theme?: "light" | "dark";
};

type ListViewItem = React.FC<ListViewItemProps>;
type ListViewItemProps = {
  /** Content for the list item. Must be WidgetComponents */
  children: React.ReactNode;
  /** Optional action triggered when the list item is clicked. */
  onClickAction?: ActionConfig;
  /** Gap between children within the list item; accepts a spacing unit or a CSS string. */
  gap?: number | string;
  /**
   *  Y-axis alignment for content within the list item.
   *
   *  @default "center"
   */
  align?: Alignment;
};

// Layout Components

type Box = React.FC<BoxProps>;
type BoxProps = BlockProps & {
  /** Child components to render inside the container. Must be WidgetComponents  */
  children?: React.ReactNode;
  /**
   * Flex direction for content within this container.
   *
   * @default "col"
   */
  direction?: "row" | "col";
  /** Cross-axis alignment of children. */
  align?: Alignment;
  /** Main-axis distribution of children. */
  justify?: Justification;
  /** Wrap behavior for flex items. */
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  /** Flex growth/shrink factor. */
  flex?: number | string;
  /** Gap between direct children; accepts a spacing unit or a CSS string. */
  gap?: number | string;
  /** Inner padding; accepts a spacing unit, a CSS string, or a padding object. */
  padding?: number | string | Padding;
  /** Border applied to the container; accepts a numeric pixel value or a border object. */
  border?: number | Border | Borders;
  /**
   * Background color; accepts surface color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Surface color tokens: `surface` `surface-secondary` `surface-tertiary` `surface-elevated` `surface-elevated-secondary`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   */
  background?: string | ThemeColor;
};

type Row = React.FC<RowProps>;
type RowProps = Omit<BoxProps, "direction">;

type Col = React.FC<ColProps>;
type ColProps = Omit<BoxProps, "direction">;

type Form = React.FC<FormProps>;
type FormProps = BoxProps & {
  /** Action dispatched when the form is submitted. */
  onSubmitAction?: ActionConfig;
};

type Spacer = React.FC<SpacerProps>;
type SpacerProps = {
  /**
   * Minimum size the spacer should occupy along the flex direction; accepts a numeric pixel value or a CSS string.
   *
   * @default "auto"
   */
  minSize?: number | string;
};

type Divider = React.FC<DividerProps>;
type DividerProps = {
  /**
   * Color of the divider; accepts border color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Valid tokens: `default` `subtle` `strong`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "default"
   */
  color?: string | ThemeColor;
  /**
   * Thickness of the divider line; accepts a numeric pixel value or a CSS string.
   *
   * @default 1
   */
  size?: number | string;
  /**
   * Outer spacing applied above and below the divider; accepts a spacing unit or a CSS string.
   *
   * By default, the divider will space itself dynamically based on its siblings' default spacings.
   */
  spacing?: number | string;
  /**
   * Flush the divider to the edge of its container, removing surrounding padding.
   *
   * @default false
   */
  flush?: boolean;
};

/**
 * Used to animate layout changes when conditionally rendering components, or when swapping out different components.
 *
 * **Important:** When swapping between different children, each child should have a distinct `key`.
 */
type Transition = React.FC<TransitionProps>;
type TransitionProps = {
  /** The child component to animate layout changes for. */
  children: WidgetComponent;
};

// Text Components

type Title = React.FC<TitleProps>;
type TitleProps = {
  /**
   * Size of the title text; accepts a title size token.
   *
   * @default "md"
   */
  size?: TitleSize;
  /**
   * Font weight; accepts a font weight token.
   *
   * @default "medium"
   */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /**
   * Text color; accepts text color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "prose"
   */
  color?: string | ThemeColor;
} & BaseTextProps;

type Caption = React.FC<CaptionProps>;
type CaptionProps = {
  /**
   * Size of the caption text; accepts a caption size token.
   *
   * @default "md"
   */
  size?: CaptionSize;
  /**
   * Font weight; accepts a font weight token.
   *
   * @default "normal"
   */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /**
   * Text color; accepts text color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "secondary"
   */
  color?: string | ThemeColor;
} & BaseTextProps;

type Text = React.FC<TextProps>;
type TextProps = {
  /**
   * Size of the text; accepts a text size token.
   *
   * @default "md"
   */
  size?: TextSize;
  /**
   * Font weight; accepts a font weight token.
   *
   * @default "normal"
   */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /**
   * Enables streaming-friendly transitions for incremental updates.
   *
   * **Important:** Once incremental updates are complete, this should be set to `false`.
   *
   * **Note:** Streaming animations are not currently implemented for basic text components, but we plan to add them in the future.
   * This prop is here as a way to opt-in to streaming animations for Text components once they are implemented.
   *
   * @default false
   */
  streaming?: boolean;
  /** Render text in italic style. */
  italic?: boolean;
  /** Render text with a line-through decoration. */
  lineThrough?: boolean;
  /** Constrain the text container width; accepts a numeric pixel value or a CSS string. */
  width?: number | string;
  /** Forces the text container to reserve space for a minimum number of lines. */
  minLines?: number;
  /**
   * Enable inline editing for this text node.
   *
   * @default false
   */
  editable?:
    | false
    | {
        /**
         * The name of the form control field.
         * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
         *
         * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
         */
        name: string;
        /** Placeholder text for the editable input. */
        placeholder?: string;
        /**
         * Autofocus the editable input when it appears.
         * @default false
         */
        autoFocus?: boolean;
        /**
         * Select all text on focus.
         * @default false
         */
        autoSelect?: boolean;
        /** Native autocomplete hint for the input. */
        autoComplete?: string;
        /**
         * Allow browser password/autofill extensions.
         * @default false
         */
        allowAutofillExtensions?: boolean;
        /** Regex pattern for input validation. */
        pattern?: string;
        /**
         * Mark the editable input as required.
         * @default false
         */
        required?: boolean;
      };
} & BaseTextProps;

type Markdown = React.FC<MarkdownProps>;
type MarkdownProps = {
  /** Markdown source string to render. */
  value: string;
  /**
   * Applies streaming-friendly transitions for incremental updates.
   *
   * **Important:** Once incremental updates are complete, this should be set to `false`.
   *
   * @default false
   */
  streaming?: boolean;
};

// Content Components

type Badge = React.FC<BadgeProps>;
type BadgeProps = {
  /** Text to display inside the badge. */
  label: string;
  /**
   * Color of the badge; accepts a badge color token.
   * @default "secondary"
   */
  color?: "secondary" | "success" | "danger" | "warning" | "info" | "discovery";
  /**
   * Visual style of the badge.
   * @default "soft"
   */
  variant?: "solid" | "soft" | "outline";
  /**
   * Size of the badge.
   * @default "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Determines if the badge should be a fully rounded pill shape.
   * @default true
   */
  pill?: boolean;
};

type Icon = React.FC<IconProps>;
type IconProps = {
  /** Name of the icon to display. */
  name: WidgetIcon;
  /**
   * Icon color; accepts a text color token, a primitive color token, aCSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "prose"
   */
  color?: string | ThemeColor;
  /**
   * Size of the icon; accepts an icon size token.
   * @default "md"
   */
  size?: IconSize;
};

type Image = React.FC<ImageProps>;
type ImageProps = {
  /** Image URL source. */
  src: string;
  /** Alternate text for accessibility. */
  alt?: string;
  /**
   * Draw a subtle frame around the image.
   *
   * @default false
   */
  frame?: boolean;
  /**
   * How the image should fit within the container.
   *
   * @default "cover"
   */
  fit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  /**
   * Focal position of the image within the container.
   *
   * @default "center"
   */
  position?:
    | "top left"
    | "top"
    | "top right"
    | "left"
    | "center"
    | "right"
    | "bottom left"
    | "bottom"
    | "bottom right";
  /**
   * Flush the image to the edge of its container, removing surrounding padding.
   *
   * @default false
   */
  flush?: boolean;
} & BlockProps;

type Button = React.FC<ButtonProps>;
type ButtonProps = {
  /**
   * Configure the button as a submit button for the nearest form.
   * @default false
   */
  submit?: boolean;
  /** Text to display inside the button. */
  label?: string;
  /** Action dispatched on click. */
  onClickAction?: ActionConfig;
  /** Icon shown before the label. Can be used without a label to create an icon-only button. */
  iconStart?: WidgetIcon;
  /** Optional icon shown after the label. */
  iconEnd?: WidgetIcon;
  /** Convenience preset for button style. */
  style?: "primary" | "secondary";
  /* Controls the size of icons within the button, defaults to value from `size`. */
  iconSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Color of the button; accepts a button color token.
   * @default "primary"
   */
  color?:
    | "primary"
    | "secondary"
    | "info"
    | "discovery"
    | "success"
    | "caution"
    | "warning"
    | "danger";
  /**
   * Visual variant of the button; accepts a control variant token.
   *
   * @default "solid"
   */
  variant?: ControlVariant;
  /**
   * Controls the overall size of the button; maps to the following height values:
   *
   * | 3xs     | 2xs     | xs      | sm      | md      | lg      | xl      | 2xl     | 3xl     |
   * | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
   * | `22px`  | `24px`  | `26px`  | `28px`  | `32px`  | `36px`  | `40px`  | `44px`  | `48px`  |
   *
   * @default "lg"
   */
  size?: ControlSize;
  /**
   * Determines if the button should be a fully rounded pill shape.
   * @default true
   */
  pill?: boolean;
  /**
   * Determines if the button should have matching width and height, based on the `size`.
   * @default false
   */
  uniform?: boolean;
  /**
   * Extends select to 100% of available width.
   * @default false
   */
  block?: boolean;
  /**
   * Disables interactions and applies disabled styles.
   * @default false
   */
  disabled?: boolean;
};

// Form Controls
type Input = React.FC<InputProps>;
type InputProps = {
  /**
   * The name of the form control field.
   * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
   *
   * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
   */
  name: string;
  /**
   * Native input type.
   * @default "text"
   */
  inputType?: "number" | "email" | "text" | "password" | "tel" | "url";
  /** Initial value of the input. */
  defaultValue?: string;
  /**
   * Visual style of the input.
   * @default "outline"
   */
  variant?: "soft" | "outline";
  /**
   * Controls the size of the input
   *
   * | 3xs     | 2xs     | xs      | sm      | md      | lg      | xl      | 2xl     | 3xl     |
   * | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
   * | `22px`  | `24px`  | `26px`  | `28px`  | `32px`  | `36px`  | `40px`  | `44px`  | `48px`  |
   *
   * @default md
   */
  size?: ControlSize;
  /**
   * Controls gutter on the edges of the input, defaults to value from `size`.
   *
   * | 2xs    | xs     | sm     | md     | lg     | xl     |
   * | ------ | ------ | ------ | ------ | ------ | ------ |
   * | `6px`  | `8px`  | `10px` | `12px` | `14px` | `16px` |
   */
  gutterSize?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Mark the input as required for form submission.
   * @default false
   */
  required?: boolean;
  /** Regex pattern for input validation. */
  pattern?: string;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Allow password managers / autofill extensions to appear.
   *
   * @default inputType == "password"
   */
  allowAutofillExtensions?: boolean;
  /**
   * Select all contents of the input when it mounts.
   * @default false
   */
  autoSelect?: boolean;
  /**
   * Autofocus the input when it mounts.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Disable interactions and apply disabled styles.
   * @default false
   */
  disabled?: boolean;
  /**
   * Determines if the input should be a fully rounded pill shape.
   * @default false
   */
  pill?: boolean;
};

type Textarea = React.FC<TextareaProps>;
type TextareaProps = {
  /**
   * The name of the form control field.
   * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
   *
   * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
   */
  name: string;
  /** Initial value of the textarea. */
  defaultValue?: string;
  /**
   * Mark the textarea as required for form submission.
   * @default false
   */
  required?: boolean;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /**
   * Select all contents of the textarea when it mounts.
   * @default false
   */
  autoSelect?: boolean;
  /**
   * Autofocus the textarea when it mounts.
   * @default false
   */
  autoFocus?: boolean;
  /**
   * Disable interactions and apply disabled styles.
   * @default false
   */
  disabled?: boolean;
  /**
   * Visual style of the textarea.
   * @default "outline"
   */
  variant?: "soft" | "outline";
  /**
   * Controls the size of the textarea
   *
   * | 3xs     | 2xs     | xs      | sm      | md      | lg      | xl      | 2xl     | 3xl     |
   * | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
   * | `22px`  | `24px`  | `26px`  | `28px`  | `32px`  | `36px`  | `40px`  | `44px`  | `48px`  |
   *
   * @default md
   */
  size?: ControlSize;
  /**
   * Controls gutter on the edges of the textarea, defaults to value from `size`.
   *
   * | 2xs    | xs     | sm     | md     | lg     | xl     |
   * | ------ | ------ | ------ | ------ | ------ | ------ |
   * | `6px`  | `8px`  | `10px` | `12px` | `14px` | `16px` |
   */
  gutterSize?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Initial number of visible rows.
   * @default 3
   */
  rows?: number;
  /**
   * Automatically grow/shrink to fit content.
   * @default false
   */
  autoResize?: boolean;
  /**
   * Maximum number of rows when auto-resizing.
   *
   * @default Math.max(rows, 10)
   */
  maxRows?: number;
  /**
   * Allow password managers / autofill extensions to appear.
   * @default false
   */
  allowAutofillExtensions?: boolean;
};

type Select = React.FC<SelectProps>;
type SelectProps = {
  /**
   * The name of the form control field.
   * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
   *
   * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
   */
  name: string;
  /** List of selectable options. */
  options: {
    value: string;
    label: string;
    /**
     * Disable the option.
     * @default false
     */
    disabled?: boolean;
    /** Displayed as secondary text below the option `label`. */
    description?: string;
  }[];
  /** Action dispatched when the value changes. */
  onChangeAction?: ActionConfig;
  /** Placeholder text shown when no value is selected. */
  placeholder?: string;
  /** Initial value of the select. */
  defaultValue?: string;
  /**
   * Visual style of the select.
   * @default "outline"
   */
  variant?: ControlVariant;
  /**
   * Controls the size of the textarea
   *
   * | 3xs     | 2xs     | xs      | sm      | md      | lg      | xl      | 2xl     | 3xl     |
   * | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
   * | `22px`  | `24px`  | `26px`  | `28px`  | `32px`  | `36px`  | `40px`  | `44px`  | `48px`  |
   *
   * @default md
   */
  size?: ControlSize;
  /**
   * Determines if the select should be a fully rounded pill shape.
   * @default false
   */
  pill?: boolean;
  /**
   * Extends select to 100% of available width.
   * @default false
   */
  block?: boolean;
  /**
   * Show a clear control to unset the value.
   * @default false
   */
  clearable?: boolean;
  /**
   * Disable interactions and apply disabled styles.
   * @default false
   */
  disabled?: boolean;
};

type DatePicker = React.FC<DatePickerProps>;
type DatePickerProps = {
  /**
   * The name of the form control field.
   * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
   *
   * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
   */
  name: string;
  /** Action dispatched when the date value changes. */
  onChangeAction?: ActionConfig;
  /** Placeholder text shown when no date is selected. */
  placeholder?: string;
  /** Initial ISO date string (e.g., 2024-01-31). */
  defaultValue?: string;
  /** Earliest selectable ISO date (inclusive). */
  min?: string;
  /** Latest selectable ISO date (inclusive). */
  max?: string;
  /**
   * Visual variant of the datepicker control.
   * @default "outline"
   */
  variant?: ControlVariant;
  /**
   * Controls the size of the textarea
   *
   * | 3xs     | 2xs     | xs      | sm      | md      | lg      | xl      | 2xl     | 3xl     |
   * | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
   * | `22px`  | `24px`  | `26px`  | `28px`  | `32px`  | `36px`  | `40px`  | `44px`  | `48px`  |
   *
   * @default md
   */
  size?: ControlSize;
  /** Preferred side to render the calendar. */
  side?: "top" | "bottom" | "left" | "right";
  /**
   * Preferred alignment of the calendar relative to the datepicker control.
   * @default center
   */
  align?: "start" | "center" | "end";
  /**
   * Determines if the datepicker should be a fully rounded pill shape.
   * @default false
   */
  pill?: boolean;
  /**
   * Extends datepicker to 100% of available width.
   * @default false
   */
  block?: boolean;
  /**
   * Show a clear control to unset the value.
   * @default false
   */
  clearable?: boolean;
  /**
   * Disable interactions and apply disabled styles.
   * @default false
   */
  disabled?: boolean;
};

type Checkbox = React.FC<CheckboxProps>;
type CheckboxProps = {
  /**
   * The name of the form control field.
   * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
   *
   * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
   */
  name: string;
  /** Optional label text rendered next to the checkbox. */
  label?: string;
  /**
   * The initial checked state of the checkbox.
   * @default false
   */
  defaultChecked?: boolean;
  /** Action dispatched when the checked state changes. */
  onChangeAction?: ActionConfig;
  /**
   * Disable interactions and apply disabled styles.
   * @default false
   */
  disabled?: boolean;
  /**
   * Mark the checkbox as required for form submission.
   * @default false
   */
  required?: boolean;
};

type RadioGroup = React.FC<RadioGroupProps>;
type RadioGroupProps = {
  /**
   * The name of the form control field.
   * When the form is submitted, the value of this field will be included in the form's `onSubmitAction` payload.
   *
   * **Note:** Dot-separated paths are supported. e.g. `"myData.myFieldName"` → `payload.myData.myFieldName`
   */
  name: string;
  /** Array of options to render as radio items. */
  options?: {
    label: string;
    value: string;
    /**
     * Disables a specific radio option.
     * @default false
     */
    disabled?: boolean;
  }[];
  /** Accessible label for the radio group; falls back to `name`. */
  ariaLabel?: string;
  /** Action dispatched when the selected value changes. */
  onChangeAction?: ActionConfig;
  /** Initial selected value of the radio group. */
  defaultValue?: string;
  /**
   * Layout direction of the radio items.
   * @default "row"
   */
  direction?: "row" | "col";
  /**
   * Disable interactions and apply disabled styles for the entire group.
   * @default false
   */
  disabled?: boolean;
  /**
   * Mark the group as required for form submission.
   * @default false
   */
  required?: boolean;
};

type Label = React.FC<LabelProps>;
type LabelProps = {
  /** Text content of the label. */
  value: string;
  /** Name of the field this label describes. */
  fieldName: string;
  /**
   * Size of the label text; accepts a text size token.
   * @default "sm"
   */
  size?: TextSize;
  /**
   * Font weight; accepts a font weight token.
   * @default "medium"
   */
  weight?: "normal" | "medium" | "semibold" | "bold";
  /**
   * Horizontal text alignment.
   * @default "start"
   */
  textAlign?: TextAlign;
  /**
   * Text color; accepts a text color token, a primitive color token, aCSS color string, or a theme-aware `{ light, dark }`.
   *
   * Text color tokens: `prose` `primary` `emphasis` `secondary` `tertiary` `success` `warning` `danger`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "secondary"
   */
  color?: string | ThemeColor;
};

type Chart = React.FC<ChartProps>;
type ChartProps = {
  /** Tabular dataset; each object represents a data row.
   *
   * @example
   * [
   *   { date: "2025-01-01", Desktop: 100, Mobile: 200 },
   *   { date: "2025-01-02", Desktop: 200, Mobile: 100 },
   * ]
   */
  data: Record<string, number | string>[];
  /**
   * Series definitions describing how to read and render `data`.
   *
   * @example
   * [
   *   { type: "bar", dataKey: "Desktop" },
   *   { type: "bar", dataKey: "Mobile" },
   * ]
   */
  series: Series[];

  /** X-axis configuration */
  xAxis: XAxisConfig;

  /**
   * Show a left y-axis with tick labels.
   * @default false
   */
  showYAxis?: boolean;
  /**
   * Display a legend describing the series.
   * @default true
   */
  showLegend?: boolean;
  /**
   * Display tooltip when hovering over a datapoint.
   * @default true
   */
  showLegend?: boolean;
  /** Sets a specific gap size in px between bars in the same category. */
  barGap?: number;
  /** Sets a specific gap size in px between bar categories. */
  barCategoryGap?: number;
  /** Flex growth/shrink factor. */
  flex?: number | string;
} & Pick<
  BlockProps,
  | "height"
  | "width"
  | "size"
  | "minSize"
  | "maxSize"
  | "maxHeight"
  | "maxWidth"
  | "minHeight"
  | "minWidth"
  | "aspectRatio"
>;

// Shared types

type ThemeColor = {
  /** Color to use when the theme is dark. */
  dark: string;
  /** Color to use when the theme is light. */
  light: string;
};

type Padding = {
  /** Top padding; accepts a spacing unit or CSS string. */
  top?: number | string;
  /** Right padding; accepts a spacing unit or CSS string. */
  right?: number | string;
  /** Bottom padding; accepts a spacing unit or CSS string. */
  bottom?: number | string;
  /** Left padding; accepts a spacing unit or CSS string. */
  left?: number | string;
  /** Horizontal padding; accepts a spacing unit or CSS string. */
  x?: number | string;
  /** Vertical padding; accepts a spacing unit or CSS string. */
  y?: number | string;
};

type Margin = {
  /** Top margin; accepts a spacing unit or CSS string. */
  top?: number | string;
  /** Right margin; accepts a spacing unit or CSS string. */
  right?: number | string;
  /** Bottom margin; accepts a spacing unit or CSS string. */
  bottom?: number | string;
  /** Left margin; accepts a spacing unit or CSS string. */
  left?: number | string;
  /** Horizontal margin; accepts a spacing unit or CSS string. */
  x?: number | string;
  /** Vertical margin; accepts a spacing unit or CSS string. */
  y?: number | string;
};

type Border = {
  /** Thickness of the border in px. */
  size: number;
  /**
   * Border color; accepts border color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Border color tokens: `default` `subtle` `strong`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * @default "default"
   */
  color?: string | ThemeColor;
  /**
   * Border line style.
   * @default "solid"
   */
  style?:
    | "solid"
    | "dashed"
    | "dotted"
    | "double"
    | "groove"
    | "ridge"
    | "inset"
    | "outset";
};

/** Per-side border configuration with shorthands. */
type Borders = {
  /** Top border or thickness in px. */
  top?: number | Border;
  /** Right border or thickness in px. */
  right?: number | Border;
  /** Bottom border or thickness in px. */
  bottom?: number | Border;
  /** Left border or thickness in px. */
  left?: number | Border;
  /** Horizontal borders or thickness in px. */
  x?: number | Border;
  /** Vertical borders or thickness in px. */
  y?: number | Border;
};

/** Border radius token or CSS keyword/percentage. */
type RadiusValue =
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full"
  | "100%"
  | "none";

/** Cross-axis alignment in a flex layout. */
type Alignment = "start" | "center" | "end" | "baseline" | "stretch";

/** Main-axis distribution in a flex layout. */
type Justification =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly"
  | "stretch";

/** Visual variants shared by several controls. */
type ControlVariant = "solid" | "soft" | "outline" | "ghost";
/** Size scale shared by several controls. */
type ControlSize =
  | "3xs"
  | "2xs"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

/** Horizontal text alignment. */
type TextAlign = "start" | "center" | "end";
/** Generic text size scale. */
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
/** Title size scale. */
type TitleSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
/** Caption size scale. */
type CaptionSize = "sm" | "md" | "lg";
/** Icon size scale. */
type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

/** Optional status header for containers like `Card` and `ListView`. */
type WidgetStatus =
  | {
      /** Status text to display. */
      text: string;
      /** URL of a favicon to render at the start of the status. */
      favicon?: string;
      /** Show a frame around the favicon for contrast. */
      frame?: boolean;
    }
  | {
      /** Status text to display. */
      text: string;
      /** Icon to render at the start of the status. */
      icon?: WidgetIcon;
    };

/** Action to the server */
type ActionConfig = {
  type: string;
  payload?: Record<string, unknown>;
  handler?: "server" | "client";
  loadingBehavior?: "auto" | "none" | "self" | "container";
};

/** Common layout props for block-like components. */
type BlockProps = {
  /** Explicit height; accepts a numeric pixel value or a CSS string. */
  height?: number | string;
  /** Explicit width; accepts a numeric pixel value or a CSS string. */
  width?: number | string;
  /** Shorthand to set both width and height; accepts a numeric pixel value or a CSS string. */
  size?: number | string;
  /** Minimum height constraint; accepts a numeric pixel value or a CSS string. */
  minHeight?: number | string;
  /** Minimum width constraint; accepts a numeric pixel value or a CSS string. */
  minWidth?: number | string;
  /** Shorthand to set both minWidth and minHeight; accepts a numeric pixel value or a CSS string. */
  minSize?: number | string;
  /** Maximum height constraint; accepts a numeric pixel value or a CSS string. */
  maxHeight?: number | string;
  /** Maximum width constraint; accepts a numeric pixel value or a CSS string. */
  maxWidth?: number | string;
  /** Shorthand to set both maxWidth and maxHeight; accepts a numeric pixel value or a CSS string. */
  maxSize?: number | string;
  /** Aspect ratio of the box (e.g., 16/9); accepts a numeric value or a CSS string. */
  aspectRatio?: number | string;
  /** Border radius; accepts a radius token. */
  radius?: RadiusValue;
  /** Outer margin; accepts a spacing unit, a CSS string, or a margin object. */
  margin?: number | string | Margin;
};

/** Shared text props for Title, Text, and Caption. */
type BaseTextProps = {
  /** Text content to display. */
  value: string;
  /**
   * Horizontal text alignment.
   * @default "start"
   */
  textAlign?: TextAlign;
  /**
   * Truncate overflow with ellipsis.
   * @default false
   */
  truncate?: boolean;
  /** Limit text to a maximum number of lines (applies a line clamp). */
  maxLines?: number;
};

type XAxisConfig = {
  /** Data key to use for the x-axis. Should be a key in each row of the `data` array. */
  dataKey: string;
  /**
   * Hide x-axis labels
   * @default false
   */
  hide?: boolean;
  /**
   * Map raw x values to custom label strings.
   * @example
   * {
   *   "2025-01-01": "Jan 1",
   *   "2025-01-02": "Jan 2",
   * }
   */
  labels?: Record<string | number, string>;
};

/** Curve types for line/area charts. */
type CurveType =
  | "basis"
  | "basisClosed"
  | "basisOpen"
  | "bumpX"
  | "bumpY"
  | "bump"
  | "linear"
  | "linearClosed"
  | "natural"
  | "monotoneX"
  | "monotoneY"
  | "monotone"
  | "step"
  | "stepBefore"
  | "stepAfter";

type Series = BarSeries | AreaSeries | LineSeries;

type BarSeries = {
  type: "bar";
  /** Label displayed in legends and tooltips. */
  label?: string;
  /** Key in each data row to read numeric values from. */
  dataKey: string;
  /**
   * Color for the series; accepts chart color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Chart color tokens: `blue` `purple` `orange` `green` `red` `yellow` `pink`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * **Note:** By default, a color will be sequentially assigned from the chart series colors.
   */
  color?: string | ThemeColor;
  /** Group bars together by the same stack id. */
  stack?: string;
};

type AreaSeries = {
  type: "area";
  /** Label displayed in legends and tooltips. */
  label?: string;
  /** Key in each data row to read numeric values from. */
  dataKey: string;
  /**
   * Color for the series; accepts chart color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Chart color tokens: `blue` `purple` `orange` `green` `red` `yellow` `pink`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * **Note:** By default, a color will be sequentially assigned from the chart series colors.
   */
  color?: string | ThemeColor;
  /**
   * Curve interpolation type.
   * @default "natural"
   */
  curveType?: CurveType;
  /** Group areas together by the same stack id. */
  stack?: string;
};

type LineSeries = {
  type: "line";
  /** Label displayed in legends and tooltips. */
  label?: string;
  /**
   * Color for the series; accepts chart color token, a primitive color token, a CSS string, or theme-aware `{ light, dark }`.
   *
   * Chart color tokens: `blue` `purple` `orange` `green` `red` `yellow` `pink`
   *
   * Primitive color token: e.g. `red-100`, `blue-900`, `gray-500`
   *
   * **Note:** By default, a color will be sequentially assigned from the chart series colors.
   */
  color?: string | ThemeColor;
  /** Key in each data row to read numeric values from. */
  dataKey: string;
  /**
   * Curve interpolation type.
   * @default "natural"
   */
  curveType?: CurveType;
};

export type WidgetIcon =
  | "analytics"
  | "atom"
  | "bolt"
  | "book-open"
  | "book-closed"
  | "calendar"
  | "chart"
  | "check"
  | "check-circle"
  | "check-circle-filled"
  | "chevron-left"
  | "chevron-right"
  | "circle-question"
  | "compass"
  | "cube"
  | "document"
  | "dots-horizontal"
  | "empty-circle"
  | "globe"
  | "keys"
  | "lab"
  | "images"
  | "info"
  | "lifesaver"
  | "lightbulb"
  | "mail"
  | "map-pin"
  | "maps"
  | "name"
  | "notebook"
  | "notebook-pencil"
  | "page-blank"
  | "phone"
  | "plus"
  | "profile"
  | "profile-card"
  | "star"
  | "star-filled"
  | "search"
  | "sparkle"
  | "sparkle-double"
  | "square-code"
  | "square-image"
  | "square-text"
  | "suitcase"
  | "settings-slider"
  | "user"
  | "write"
  | "write-alt"
  | "write-alt2"
  | "reload"
  | "play"
  | "mobile"
  | "desktop"
  | "external-link";
```

The description of the widget the user would like you to create is in the next message.
