import { iconNames } from "@/widget/iconNames";
import { z } from "zod";

const EmptySchema = z.strictObject({});

const Event = z.strictObject({
  id: z.string(),
  isNew: z.boolean(),
  color: z.enum(["red", "blue"]),
  title: z.string(),
  time: z.string()
});

const CalendarConfirmSchema = z.strictObject({
  date: z.strictObject({
    name: z.string(),
    number: z.string()
  }),
  events: z.array(Event)
});

const CalendarDetailSchema = z.strictObject({
  color: z.enum(["red", "blue"]),
  date: z.strictObject({
    dayName: z.string(),
    monthName: z.string(),
    dayNumber: z.string()
  }),
  time: z.string(),
  title: z.string()
});

const TaskSchema = z.strictObject({
  initialTitle: z.string(),
  initialDescription: z.string(),
  initialDueDate: z.iso.date()
});

const Session = z.strictObject({
  id: z.string(),
  title: z.string(),
  time: z.string()
});

const AttendeeSchema = z.strictObject({
  image: z.string(),
  name: z.string(),
  title: z.string(),
  sessions: z.array(Session)
});

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

const AgendaSchema = z.strictObject({
  items: z.array(AgendaItem)
});

const Speaker = z.strictObject({
  id: z.string(),
  image: z.string(),
  name: z.string(),
  title: z.string()
});

const SessionDetailSchema = z.strictObject({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  time: z.string(),
  speakers: z.array(Speaker)
});

const IconName = z.enum(iconNames);

const Device = z.strictObject({
  id: z.string(),
  icon: IconName,
  name: z.string(),
  status: z.string(),
  os: z.string(),
  version: z.string()
});

const DevicesSchema = z.strictObject({
  devices: z.array(Device)
});

const NotificationSchema = z.strictObject({
  title: z.string(),
  description: z.string()
});

const Track = z.strictObject({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  cover: z.string()
});

const PlaylistSchema = z.strictObject({
  bannerImage: z.string(),
  tracks: z.array(Track)
});

const PurchaseItem = z.strictObject({
  image: z.string(),
  title: z.string(),
  subtitle: z.string()
});

const PurchaseConfirmationSchema = z.strictObject({
  product: z.strictObject({
    name: z.string(),
    image: z.string()
  })
});

const PurchaseSchema = z.strictObject({
  items: z.array(PurchaseItem),
  subTotal: z.string(),
  taxPct: z.string(),
  tax: z.string(),
  total: z.string()
});

const Stat = z.strictObject({
  value: z.string(),
  label: z.string()
});

const PlayerSchema = z.strictObject({
  name: z.string(),
  number: z.string(),
  accent: z.string(),
  stats: z.array(Stat)
});

const DataTableSchema = z.strictObject({
  table: z.strictObject({
    caption: z.string().optional(),
    columns: z.array(
      z.strictObject({
        key: z.string(),
        label: z.string(),
        align: z.enum(["start", "center", "end"]).optional()
      })
    ),
    rows: z.array(z.record(z.string(), z.union([z.string(), z.number()])))
  })
});

const ForecastItem = z.strictObject({
  conditionImage: z.string(),
  temperature: z.string()
});

const WeatherSchema = z.strictObject({
  background: z.string(),
  conditionImage: z.string(),
  lowTemperature: z.string(),
  highTemperature: z.string(),
  location: z.string(),
  conditionDescription: z.string(),
  forecast: z.array(ForecastItem)
});

const AnalyticsSchema = z.strictObject({
  title: z.string(),
  subtitle: z.string(),
  chart: z.strictObject({
    data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
    series: z.array(
      z.strictObject({
        type: z.enum(["bar", "line", "area"]),
        dataKey: z.string(),
        label: z.string().optional(),
        color: z.string().optional()
      })
    ),
    xAxis: z.strictObject({
      dataKey: z.string()
    })
  })
});

const TrafficSlice = z.strictObject({
  source: z.string(),
  value: z.number(),
  fill: z.string().optional()
});

const TrafficBreakdownSchema = z.strictObject({
  title: z.string(),
  subtitle: z.string(),
  slices: z.array(TrafficSlice)
});

const RevenuePoint = z.strictObject({
  month: z.string(),
  recurring: z.number(),
  oneTime: z.number()
});

const RevenueStackedSchema = z.strictObject({
  title: z.string(),
  subtitle: z.string(),
  data: z.array(RevenuePoint)
});

const TeamMember = z.strictObject({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.string().optional(),
  status: z.enum(["online", "offline", "away"]).optional()
});

const TeamProgressSchema = z.strictObject({
  squad: z.string(),
  percent: z.number(),
  members: z.array(TeamMember)
});

const RiderStatusSchema = z.strictObject({
  eta: z.string(),
  address: z.string(),
  driver: z.strictObject({
    name: z.string(),
    photo: z.string()
  })
});

const QuickSetupSchema = z.strictObject({
  banner: z.string(),
  workspaceName: z.string(),
  defaultView: z.enum(["overview", "tasks", "analytics"]),
  timezone: z.enum(["America/Los_Angeles", "America/New_York", "Europe/London"]),
  emailUpdates: z.boolean()
});

const CampaignComposerSchema = z.strictObject({
  banner: z.string(),
  brandName: z.string(),
  progress: z.number(),
  initialSubject: z.string(),
  initialMessage: z.string(),
  defaultChannels: z.array(z.enum(["email", "sms", "push"])),
  defaultAudience: z.enum(["all", "active", "churn_risk"]),
  sendOn: z.string(),
  owner: z.string()
});

const OpsMetricsSchema = z.strictObject({
  banner: z.string(),
  title: z.string(),
  timeframe: z.enum(["7d", "30d", "90d"]),
  kpis: z.strictObject({
    uptime: z.string(),
    p95: z.string(),
    incidents: z.string()
  }),
  chartData: z.array(
    z.strictObject({
      day: z.string(),
      Uptime: z.number(),
      Incidents: z.number()
    })
  ),
  table: DataTableSchema.shape.table
});

const FlightBookingSegmentSchema = z.strictObject({
  id: z.string(),
  image: z.string(),
  route: z.string(),
  stopsLabel: z.string(),
  flightNumber: z.string(),
  aircraft: z.string(),
  depart: z.string(),
  arrive: z.string()
});

const FlightBookingSchema = z.strictObject({
  bookingId: z.string(),
  heroImage: z.string(),
  tripSummary: z.string(),
  statusLabel: z.string(),
  route: z.string(),
  dates: z.string(),
  guests: z.string(),
  cabinClass: z.string(),
  baggageSummary: z.string(),
  refundPolicy: z.string(),
  segments: z.array(FlightBookingSegmentSchema),
  totalPrice: z.string(),
  priceNote: z.string()
});

export const widgetExamples: {
  id: string;
  title: string;
  description: string;
  template: string;
  schema: z.ZodTypeAny;
  data: unknown;
  theme?: "light" | "dark";
}[] = [
    {
      id: "calendar-confirm",
      title: "Confirm calendar event",
      description: "Multiple events with highlighted new ones.",
      template: `
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
    `.trim(),
      schema: CalendarConfirmSchema,
      data: {
        date: { name: "Tue", number: "14" },
        events: [
          {
            id: "event-1",
            isNew: true,
            color: "red",
            title: "Design review",
            time: "2:00 PM - 3:00 PM"
          },
          {
            id: "event-2",
            isNew: false,
            color: "blue",
            title: "1:1 catch up",
            time: "4:30 PM - 5:00 PM"
          }
        ]
      }
    },
    {
      id: "calendar-detail",
      title: "Event detail",
      description: "Compact detail view for a single event.",
      template: `
<Card>
  <Row align="stretch" gap={3}>
    <Box width={5} background={color} radius="full" />
    <Col flex={1} gap={1}>
      <Row>
        <Text
          color="alpha-70"
          size="sm"
          value={\`\${date.dayName}, \${date.monthName} \${date.dayNumber}\`}
        />
        <Spacer />
        <Text color={color} size="sm" value={time} />
      </Row>
      <Title value={title} size="md" />
    </Col>
  </Row>
</Card>
    `.trim(),
      schema: CalendarDetailSchema,
      data: {
        color: "blue",
        date: { dayName: "Monday", monthName: "January", dayNumber: "8" },
        time: "10:30 AM",
        title: "Team sync"
      }
    },
    {
      id: "task-create",
      title: "Create task",
      description: "Editable text, date picker, and submit action.",
      template: `
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
          placeholder: "Describe the task..."
        }}
      />
      <Divider flush />
      <Row align="center" gap={2} wrap="wrap">
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
    `.trim(),
      schema: TaskSchema,
      data: {
        initialTitle: "Investigate flaky CI",
        initialDescription:
          "Track down the intermittent failure in the integration suite and propose a fix.",
        initialDueDate: "2026-01-05"
      }
    },
    {
      id: "attendee-card",
      title: "Conference attendee",
      description: "Profile with sessions.",
      template: `
<Card size="sm">
  <Col align="center" padding={{ top: 6, bottom: 4 }} gap={4}>
    <Image
      src={image}
      aspectRatio={1}
      radius="full"
      size={150}
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
        <Button
          label="View"
          variant="outline"
          onClickAction={{ type: "session.view", payload: { id: item.id } }}
        />
      </Row>
    ))}
  </Col>
</Card>
    `.trim(),
      schema: AttendeeSchema,
      data: {
        image: "https://widgets.chatkit.studio/zj.png",
        name: "Zheng Jie",
        title: "Developer Advocate",
        sessions: [
          { id: "s-1", title: "Practical Agents", time: "9:30 AM" },
          { id: "s-2", title: "UI Patterns", time: "2:10 PM" }
        ]
      }
    },
    {
      id: "agenda-list",
      title: "Agenda list",
      description: "ListView with accent colors.",
      template: `
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
    `.trim(),
      schema: AgendaSchema,
      data: {
        items: [
          {
            accent: "purple",
            time: "10:00 AM",
            location: "Hall A",
            title: "Keynote",
            note: "Arrive early for a good seat; Q&A tends to fill fast."
          },
          {
            accent: "blue",
            time: "11:15 AM",
            location: "Room 204",
            title: "Agent Tooling Workshop",
            note: "Bring a laptop; you'll be wiring actions and schema hydration."
          }
        ]
      }
    },
    {
      id: "session-detail",
      title: "Session detail",
      description: "Session with speakers and location.",
      template: `
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
      <Button
        label="View"
        variant="outline"
        onClickAction={{ type: "session.map", payload: { location } }}
      />
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
        <Button
          label="View"
          variant="outline"
          onClickAction={{ type: "speaker.view", payload: { id: item.id } }}
        />
      </Row>
    ))}
  </Col>
</Card>
    `.trim(),
      schema: SessionDetailSchema,
      data: {
        type: "Workshop",
        title: "Building Reliable Widgets",
        description: "A hands-on session on schema-first UI construction.",
        location: "Room 1B",
        time: "3:40 PM",
        speakers: [
          {
            id: "sp-1",
            image: "https://widgets.chatkit.studio/rohanmehta.png",
            name: "Rohan Mehta",
            title: "Staff Engineer"
          }
        ]
      }
    },
    {
      id: "device-list",
      title: "Devices",
      description: "Selectable devices list.",
      template: `
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
          value={\`\${item.status} - \${item.os} \${item.version}\`}
          color="secondary"
        />
      </Col>
    </ListViewItem>
  ))}
</ListView>
    `.trim(),
      schema: DevicesSchema,
      data: {
        devices: [
          {
            id: "dev-iphone",
            icon: "mobile",
            name: "iPhone 16",
            status: "Online",
            os: "iOS",
            version: "18.2"
          },
          {
            id: "dev-mbp",
            icon: "desktop",
            name: "MacBook Pro",
            status: "Last seen 2h ago",
            os: "macOS",
            version: "15.1"
          }
        ]
      }
    },
  {
    id: "notifications",
    title: "Enable notifications",
    description: "Confirmation dialog with two actions.",
      template: `
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
      style="primary"
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
        payload: { enable: false }
      }}
    />
  </Row>
</Card>
    `.trim(),
      schema: NotificationSchema,
      data: {
        title: "Enable notifications",
        description: "Turn on alerts to get timely updates."
    }
  },
  {
    id: "purchase-confirmation",
    title: "Purchase confirmation",
    description: "Compact receipt-style order confirmation.",
    template: `
<Card size="sm">
  <Col gap={3}>
    <Row align="center" gap={2}>
      <Icon name="check-circle-filled" color="success" />
      <Text size="sm" value="Purchase complete" color="success" />
    </Row>
    <Divider color="subtle" flush />

    <Row gap={3}>
      <Image src={product.image} alt="Blue folding chair" size={80} frame />
      <Col gap={1}>
        <Title value={product.name} maxLines={2} />
        <Text
          value="Free delivery • 14-day returns"
          size="sm"
          color="secondary"
        />
      </Col>
    </Row>
  </Col>
  <Col gap={2} padding={{ y: 2 }}>
    <Row>
      <Text value="Estimated delivery" size="sm" color="secondary" />
      <Spacer />
      <Text value="Thursday, Oct 8" size="sm" />
    </Row>
    <Row>
      <Text value="Sold by" size="sm" color="secondary" />
      <Spacer />
      <Text value="OpenAI" size="sm" />
    </Row>
    <Row>
      <Text value="Paid" size="sm" color="secondary" />
      <Spacer />
      <Text value="$20.00" size="sm" />
    </Row>
  </Col>

  <Button
    label="View details"
    onClickAction={{ type: "order.view_details" }}
    variant="outline"
    pill
    block
  />
</Card>
    `.trim(),
    schema: PurchaseConfirmationSchema,
    data: {
      product: {
        name: "Blue folding chair",
        image: "https://widgets.chatkit.studio/blue-chair.png"
      }
    }
  },
    {
      id: "playlist",
      title: "Playlist",
      description: "Playlist with play controls.",
      template: `
<Card size="sm" padding={0}>
  <Image src={bannerImage} alt="K-POP" height={180} fit="cover" flush />
  <Col padding={{ y: 2, x: 3 }}>
    {tracks.map((item, index) => (
      <Row key={item.id} align="center" gap={3}>
        <Caption value={\`\${index + 1}\`} />
        <Image src={item.cover} size={48} />
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
  <Col padding={{ x: 3, bottom: 3 }}>
    <Button
      label="View playlist"
      variant="outline"
      pill
      block
      onClickAction={{ type: "view.playlist", payload: { name: "kpop" } }}
    />
  </Col>
</Card>
    `.trim(),
      schema: PlaylistSchema,
      data: {
        bannerImage: "https://widgets.chatkit.studio/kpop.png",
        tracks: [
          {
            id: "retrovinyl",
            title: "retrovinyl",
            artist: "Erik Mclean",
            cover: "https://widgets.chatkit.studio/album01.png"
          },
          {
            id: "neon-polaroid",
            title: "Neon Polaroid",
            artist: "Efe Kurnaz",
            cover: "https://widgets.chatkit.studio/album03.png"
          },
          {
            id: "morning-grain",
            title: "Morning Grain",
            artist: "Reinhart Julian",
            cover: "https://widgets.chatkit.studio/album02.png"
          }
        ]
      }
    },
    {
      id: "purchase-items",
      title: "Purchase items",
      description: "Itemized checkout with totals.",
      template: `
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
      <Text value={\`Sales tax (\${taxPct})\`} size="sm" />
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
    `.trim(),
      schema: PurchaseSchema,
      data: {
        items: [
          {
            image: "https://cdn.openai.com/API/storybook/blacksugar.png",
            title: "Black Sugar Hoick Latte",
            subtitle: "16oz Iced - Boba - $6.50"
          },
          {
            image: "https://cdn.openai.com/API/storybook/classic.png",
            title: "Classic Milk Tea",
            subtitle: "16oz Iced - Double Boba - $6.75"
          },
          {
            image: "https://cdn.openai.com/API/storybook/matcha.png",
            title: "Matcha Latte",
            subtitle: "16oz Iced - Boba - $6.50"
          }
        ],
        subTotal: "$19.75",
        taxPct: "8.75%",
        tax: "$1.72",
        total: "$21.47"
      }
    },
    {
      id: "player-card",
      title: "Player card",
      description: "Dark themed card with stats.",
      template: `
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
        value={\`\${name} (#\${number})\`}
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
    `.trim(),
      schema: PlayerSchema,
      data: {
        name: "Froge",
        number: "22",
        accent: "blue-100",
        stats: [
          { value: "18", label: "PTS" },
          { value: "141", label: "YDS" },
          { value: "2", label: "TKL" },
          { value: "17", label: "LEAPS" }
        ]
      },
      theme: "dark"
    },
    {
      id: "weather-forecast",
      title: "Weather forecast",
      description: "Gradient background with daily temps.",
      template: `
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
    `.trim(),
      schema: WeatherSchema,
      data: {
        background:
          "linear-gradient(111deg, #1769C8 0%, #258AE3 56.92%, #31A3F8 100%)",
        conditionImage: "https://cdn.openai.com/API/storybook/mixed-sun.png",
        lowTemperature: "47°",
        highTemperature: "69°",
        location: "San Francisco, CA",
        conditionDescription: "Partly sunny skies accompanied by some clouds",
        forecast: [
          {
            conditionImage: "https://cdn.openai.com/API/storybook/mostly-sunny.png",
            temperature: "54°"
          },
          {
            conditionImage: "https://cdn.openai.com/API/storybook/rain.png",
            temperature: "54°"
          },
          {
            conditionImage: "https://cdn.openai.com/API/storybook/mixed-sun.png",
            temperature: "54°"
          },
          {
            conditionImage: "https://cdn.openai.com/API/storybook/windy.png",
            temperature: "54°"
          },
          {
            conditionImage: "https://cdn.openai.com/API/storybook/mostly-sunny.png",
            temperature: "54°"
          }
        ]
      },
      theme: "dark"
    },
    // (Charts and "combo" dashboard widgets are intentionally placed at the bottom of the gallery.)
    {
      id: "team-progress",
      title: "Team progress",
      description: "New components: Avatar + Progress.",
      template: `
<Card size="sm">
  <Col gap={3}>
    <Row align="center">
      <Col>
        <Title value={squad} size="sm" />
        <Text value="Onboarding pipeline" size="sm" color="secondary" />
      </Col>
      <Spacer />
      <Badge label="On track" color="success" />
    </Row>
    <Progress value={percent} label="Milestones completed" />
    <Divider flush />
    <Row gap={3}>
      {members.map((member) => (
        <Col align="center" gap={1}>
          <Avatar name={member.name} src={member.avatar} status={member.status} />
          <Caption value={member.name} />
          <Text value={member.role} size="xs" color="secondary" />
        </Col>
      ))}
    </Row>
  </Col>
</Card>
    `.trim(),
      schema: TeamProgressSchema,
      data: {
        squad: "Launch squad",
        percent: 78,
        members: [
          {
            id: "m-1",
            name: "Avery Park",
            role: "Ops lead",
            avatar: "https://widgets.chatkit.studio/jameshills.png",
            status: "online"
          },
          {
            id: "m-2",
            name: "Riley Chen",
            role: "PM",
            avatar: "https://cdn.openai.com/API/storybook/driver.png",
            status: "away"
          },
          {
            id: "m-3",
            name: "Morgan Doe",
            role: "Design",
            status: "offline"
          }
        ]
      }
    },
    {
      id: "rider-status",
      title: "Rider status",
      description: "Ride tracking with driver info and ETA.",
      template: `
<Card size="sm">
  <Title value={eta} size="xl" />
  <Row align="center">
    <Col minWidth="auto">
      <Caption value="Pick up" />
      <Text value={address} truncate />
    </Col>
    <Spacer />
    <Col align="end">
      <Caption value="Driver" />
      <Text value={driver.name} />
    </Col>
    <Image
      src={driver.photo}
      size={40}
      radius="full"
    />
  </Row>
</Card>
    `.trim(),
      schema: RiderStatusSchema,
      data: {
        eta: "1 min",
        address: "1008 Mission St",
        driver: {
          name: "Jonathan",
          photo: "https://cdn.openai.com/API/storybook/driver.png"
        }
      }
    },
    // (Quick setup / campaign / ops review moved to the bottom of the gallery.)
    {
      id: "flight-booking",
      title: "Flight booking",
      description: "A detailed booking review with segments, rules, and a confirm action.",
      template: `
<Card
  size="md"
  padding={0}
  confirm={{
    label: "Confirm booking",
    action: { type: "flight.booking.confirm", payload: { bookingId } }
  }}
  cancel={{
    label: "Cancel",
    action: { type: "flight.booking.cancel", payload: { bookingId } }
  }}
>
  <Image src={heroImage} alt="Destination" height={160} fit="cover" flush />

  <Row align="center" padding={{ x: 4, top: 3, bottom: 2 }}>
    <Col gap={0} flex="auto">
      <Title value="Confirm international booking" size="sm" />
      <Text value={tripSummary} size="sm" color="secondary" />
    </Col>
    <Badge label={statusLabel} variant="soft" color="info" />
  </Row>

  <Divider flush />

  <Row align="center" padding={{ x: 4, y: 3 }} gap={3}>
    <Box
      size={18}
      radius="full"
      border={{ size: 2, color: "subtle" }}
      background="surface"
    />
    <Col flex="auto" gap={0}>
      <Text value={route} size="sm" weight="semibold" />
      <Caption value={dates} />
    </Col>
    <Col align="end" gap={0}>
      <Text value={cabinClass} size="sm" weight="semibold" />
      <Caption value={\`\${guests} guests\`} />
    </Col>
  </Row>

  <Divider flush />

  <Col padding={{ x: 4, y: 3 }} gap={3}>
    <Row gap={2} align="center">
      <Box background="surface-elevated-secondary" radius="full" padding={2}>
        <Icon name="suitcase" size="lg" />
      </Box>
      <Text value="Flight details" size="sm" weight="semibold" />
    </Row>

    <Col gap={2}>
      {segments.map((seg) => (
        <Row key={seg.id} gap={3} align="start">
          <Image src={seg.image} size={52} radius="md" frame />

          <Col flex="auto" gap={1}>
            <Row gap={2} align="center">
              <Text value={seg.route} size="sm" weight="semibold" />
              <Spacer />
              <Badge label={seg.stopsLabel} variant="soft" />
            </Row>

            <Row gap={2} align="center">
              <Text value={seg.flightNumber} size="sm" color="secondary" />
              <Text value="•" size="sm" color="tertiary" />
              <Text value={seg.aircraft} size="sm" color="secondary" />
            </Row>

            <Row gap={3} align="start">
              <Col flex={1} gap={0}>
                <Caption value="Depart" />
                <Text value={seg.depart} size="sm" />
              </Col>
              <Col flex={1} gap={0}>
                <Caption value="Arrive" />
                <Text value={seg.arrive} size="sm" />
              </Col>
            </Row>
          </Col>
        </Row>
      ))}
    </Col>

    <Divider flush />

    <Col gap={2}>
      <Row gap={3} align="center">
        <Box width={110}>
          <Text value="Guests" size="sm" color="secondary" />
        </Box>
        <Spacer />
        <Text value={guests} size="sm" weight="semibold" />
      </Row>

      <Row gap={3} align="center">
        <Box width={110}>
          <Text value="Cabin" size="sm" color="secondary" />
        </Box>
        <Spacer />
        <Text value={cabinClass} size="sm" weight="semibold" />
      </Row>

      <Row gap={3} align="start">
        <Box width={110}>
          <Text value="Baggage" size="sm" color="secondary" />
        </Box>
        <Col flex="auto" gap={0} align="end">
          <Text value={baggageSummary} size="sm" textAlign="end" />
        </Col>
      </Row>

      <Row gap={3} align="start">
        <Box width={110}>
          <Text value="Refundability" size="sm" color="secondary" />
        </Box>
        <Col flex="auto" gap={0} align="end">
          <Text value={refundPolicy} size="sm" textAlign="end" />
        </Col>
      </Row>
    </Col>
  </Col>

  <Row
    padding={{ x: 4, y: 4 }}
    background="surface-elevated-secondary"
    border={{ top: { size: 1 } }}
  >
    <Col gap={0}>
      <Text value="Total" size="sm" weight="semibold" />
      <Caption value={priceNote} />
    </Col>
    <Spacer />
    <Text value={totalPrice} size="sm" weight="semibold" />
  </Row>
</Card>
      `.trim(),
      schema: FlightBookingSchema,
      data: {
        bookingId: "bk-ua-893421",
        heroImage:
          "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80",
        tripSummary: "Round-trip • International",
        statusLabel: "Review",
        route: "SFO → NRT",
        dates: "Mar 12 – Mar 20",
        guests: "2",
        cabinClass: "Premium Economy",
        baggageSummary: "1 checked bag + 1 carry-on per guest",
        refundPolicy: "Non-refundable • Changes allowed with fee",
        segments: [
          {
            id: "seg-1",
            image:
              "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
            route: "SFO → NRT",
            stopsLabel: "Nonstop",
            flightNumber: "United 837",
            aircraft: "Boeing 787-9",
            depart: "Wed 11:30 AM • San Francisco (SFO)",
            arrive: "Thu 3:05 PM • Tokyo Narita (NRT)"
          },
          {
            id: "seg-2",
            image:
              "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80",
            route: "NRT → SFO",
            stopsLabel: "Nonstop",
            flightNumber: "United 838",
            aircraft: "Boeing 787-9",
            depart: "Thu 5:15 PM • Tokyo Narita (NRT)",
            arrive: "Thu 10:40 AM • San Francisco (SFO)"
          }
        ],
        totalPrice: "$3,184.20",
        priceNote: "Includes taxes and fees • 2 guests"
      }
    },
    {
      id: "accordion-demo",
      title: "Accordion",
      description: "Expandable FAQ list.",
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
      data: {}
    },
    {
      id: "menubar-demo",
      title: "Menubar",
      description: "Top navigation menu.",
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
      data: {}
    },
    {
      id: "context-menu-demo",
      title: "Context menu",
      description: "Right-click menu example.",
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
      data: {}
    },
    {
      id: "combobox-demo",
      title: "Combobox",
      description: "Searchable select control.",
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
      data: {}
    },
    {
      id: "toggle-slider-demo",
      title: "Toggle + Slider",
      description: "Interactive controls with state.",
      template: `
<Card size="sm">
  <Col gap={3}>
    <Toggle name="notifications" label="Notifications" />
    <Slider name="volume" defaultValue={42} />
  </Col>
</Card>
    `.trim(),
      schema: EmptySchema,
      data: {}
    },
    {
      id: "tooltip-demo",
      title: "Tooltip",
      description: "Hover to reveal details.",
      template: `
<Card size="sm">
  <Tooltip label="Hover me" content="Extra details shown on hover." />
</Card>
    `.trim(),
      schema: EmptySchema,
      data: {}
    },
    {
      id: "sheet-demo",
      title: "Sheet",
      description: "Side panel overlay.",
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
      data: {}
    },
    {
      id: "drawer-demo",
      title: "Drawer",
      description: "Bottom drawer overlay.",
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
      data: {}
    },
    {
      id: "otp-demo",
      title: "Input OTP",
      description: "One-time passcode input.",
      template: `
<Card size="sm">
  <InputOTP name="code" length={6} />
</Card>
    `.trim(),
      schema: EmptySchema,
      data: {}
    },
    {
      id: "spinner-demo",
      title: "Spinner",
      description: "Loading indicator.",
      template: `
<Card size="sm">
  <Spinner size="sm" label="Loading" />
</Card>
    `.trim(),
      schema: EmptySchema,
      data: {}
    },
    {
      id: "data-table-demo",
      title: "Data table",
      description: "Compact table layout.",
      template: `
<Card size="md">
  <DataTable
    caption={table.caption}
    columns={table.columns}
    rows={table.rows}
  />
</Card>
    `.trim(),
      schema: DataTableSchema,
      data: {
        table: {
          caption: "Quarterly revenue",
          columns: [
            { key: "quarter", label: "Quarter" },
            { key: "revenue", label: "Revenue", align: "end" }
          ],
          rows: [
            { quarter: "Q1", revenue: "$12,400" },
            { quarter: "Q2", revenue: "$18,900" }
          ]
        }
      }
    },
    {
      id: "collapsible-demo",
      title: "Collapsible",
      description: "Toggleable details block.",
      template: `
<Card size="sm">
  <Collapsible title="Advanced options" content="Show extra configuration here." />
</Card>
    `.trim(),
      schema: EmptySchema,
      data: {}
    }
    ,
    {
      id: "setup-form",
      title: "Quick setup",
      description: "A tiny onboarding flow",
      template: `
<Card size="md" padding={0}>
  <Image src={banner} height={150} fit="cover" flush />
  <Form onSubmitAction={{ type: "workspace.setup" }}>
    <Col padding={{ x: 4, y: 4 }} gap={3}>
      <Row align="center">
        <Col gap={0}>
          <Title value="Quick setup" size="sm" />
          <Text value="A compact onboarding form built with widget-native controls." size="sm" color="secondary" />
        </Col>
        <Spacer />
        <Tooltip label="Why?" content="Widgets stay minimal: collect just enough info to move forward." />
      </Row>

      <Col gap={2}>
        <Label value="Workspace name" fieldName="workspace.name" />
        <Input
          name="workspace.name"
          defaultValue={workspaceName}
          placeholder="Acme, Inc."
          required
        />
      </Col>

      <Col gap={2}>
        <Label value="Default view" fieldName="workspace.view" />
        <ToggleGroup
          name="workspace.view"
          type="single"
          defaultValue={defaultView}
          options={[
            { label: "Overview", value: "overview" },
            { label: "Tasks", value: "tasks" },
            { label: "Analytics", value: "analytics" }
          ]}
        />
      </Col>

      <Col gap={2}>
        <Label value="Timezone" fieldName="workspace.timezone" />
        <Select
          name="workspace.timezone"
          defaultValue={timezone}
          options={[
            { label: "San Francisco (PT)", value: "America/Los_Angeles" },
            { label: "New York (ET)", value: "America/New_York" },
            { label: "London (GMT)", value: "Europe/London" }
          ]}
        />
      </Col>

      <Checkbox
        name="workspace.emailUpdates"
        label="Email me weekly updates"
        defaultChecked={emailUpdates}
      />

      <Divider flush />

      <Row align="center" gap={2}>
        <Button
          label="Preview"
          variant="outline"
          onClickAction={{ type: "workspace.preview" }}
        />
        <Spacer />
        <Button submit label="Save" style="primary" />
      </Row>
    </Col>
  </Form>
</Card>
      `.trim(),
      schema: QuickSetupSchema,
      data: {
        banner:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
        workspaceName: "OpenAI Widgets",
        defaultView: "overview",
        timezone: "America/Los_Angeles",
        emailUpdates: true
      }
    },
    {
      id: "campaign-composer",
      title: "Campaign composer",
      description: "Compose Marketing Campaigns.",
      template: `
<Card size="md" padding={0}>
  <Image src={banner} height={150} fit="cover" flush />
  <Form onSubmitAction={{ type: "campaign.send" }}>
    <Col padding={{ x: 4, y: 4 }} gap={3}>
      <Row align="center" gap={2}>
        <Col gap={0}>
          <Title value={\`\${brandName} campaign\`} size="sm" />
          <Text value="Draft a message and schedule a send." size="sm" color="secondary" />
        </Col>
        <Spacer />
        <Badge label={\`\${progress}% ready\`} variant="outline" />
      </Row>

      <Progress value={progress} label="Completeness" />

      <Col gap={2}>
        <Label value="Owner" fieldName="campaign.owner" />
        <Combobox
          name="campaign.owner"
          defaultValue={owner}
          options={[
            { label: "Avery Park", value: "avery" },
            { label: "Riley Chen", value: "riley" },
            { label: "Morgan Doe", value: "morgan" }
          ]}
          placeholder="Select owner"
        />
      </Col>

      <Col gap={2}>
        <Label value="Audience" fieldName="campaign.audience" />
        <Select
          name="campaign.audience"
          defaultValue={defaultAudience}
          options={[
            { label: "All users", value: "all" },
            { label: "Active users", value: "active" },
            { label: "Churn risk", value: "churn_risk" }
          ]}
        />
      </Col>

      <Col gap={2}>
        <Label value="Channels" fieldName="campaign.channels" />
        <ToggleGroup
          name="campaign.channels"
          type="multiple"
          defaultValues={defaultChannels}
          options={[
            { label: "Email", value: "email" },
            { label: "SMS", value: "sms" },
            { label: "Push", value: "push" }
          ]}
        />
      </Col>

      <Col gap={2}>
        <Label value="Subject" fieldName="campaign.subject" />
        <Input
          name="campaign.subject"
          defaultValue={initialSubject}
          placeholder="Subject"
          required
        />
      </Col>

      <Col gap={2}>
        <Label value="Message" fieldName="campaign.message" />
        <Textarea
          name="campaign.message"
          defaultValue={initialMessage}
          rows={4}
          placeholder="Write the message..."
          required
        />
      </Col>

      <Row align="center" gap={2}>
        <Col gap={1}>
          <Label value="Send on" fieldName="campaign.sendOn" />
          <DatePicker name="campaign.sendOn" defaultValue={sendOn} />
        </Col>
        <Spacer />
        <Button submit label="Schedule" style="primary" />
      </Row>
    </Col>
  </Form>
</Card>
      `.trim(),
      schema: CampaignComposerSchema,
      data: {
        banner:
          "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
        brandName: "OpenAI Widgets",
        progress: 72,
        initialSubject: "A faster way to ship compact UI",
        initialMessage:
          "We built a schema-first widget renderer for chat. Try it in the gallery, then tailor the template to your product.",
        defaultChannels: ["email", "push"],
        defaultAudience: "active",
        sendOn: "2026-01-12",
        owner: "riley"
      }
    },
    {
      id: "ops-metrics-review",
      title: "Ops metrics review",
      description: "Combines ToggleGroup + Chart + DataTable with a compact KPI header (all Unsplash imagery).",
      template: `
<Card size="md" padding={0}>
  <Image src={banner} height={150} fit="cover" flush />
  <Col padding={{ x: 4, y: 4 }} gap={3}>
    <Row align="center" gap={2}>
      <Col gap={0}>
        <Title value={title} size="sm" />
        <Text value="A tiny dashboard that stays chat-friendly." size="sm" color="secondary" />
      </Col>
      <Spacer />
      <ToggleGroup
        name="metrics.timeframe"
        type="single"
        defaultValue={timeframe}
        options={[
          { label: "7d", value: "7d" },
          { label: "30d", value: "30d" },
          { label: "90d", value: "90d" }
        ]}
      />
    </Row>

    <Row gap={6} align="center">
      <Col gap={0}>
        <Caption value="Uptime" />
        <Text value={kpis.uptime} weight="semibold" />
      </Col>
      <Col gap={0}>
        <Caption value="p95 latency" />
        <Text value={kpis.p95} weight="semibold" />
      </Col>
      <Col gap={0}>
        <Caption value="Incidents" />
        <Text value={kpis.incidents} weight="semibold" />
      </Col>
      <Spacer />
      <Tooltip label="Tip" content="Use ToggleGroup for quick, compact filters in a chat widget." />
    </Row>

    <Divider flush />

    <Chart
      height={220}
      data={chartData}
      series={[
        { type: "area", dataKey: "Uptime", label: "Uptime", color: "green", stack: "a" },
        { type: "bar", dataKey: "Incidents", label: "Incidents", color: "orange" }
      ]}
      xAxis={{ dataKey: "day" }}
      showYAxis
    />

    <Divider flush />

    <DataTable caption={table.caption} columns={table.columns} rows={table.rows} />
  </Col>
</Card>
      `.trim(),
      schema: OpsMetricsSchema,
      data: {
        banner:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        title: "Ops metrics review",
        timeframe: "30d",
        kpis: { uptime: "99.97%", p95: "182ms", incidents: "4" },
        chartData: [
          { day: "Mon", Uptime: 99.95, Incidents: 1 },
          { day: "Tue", Uptime: 99.99, Incidents: 0 },
          { day: "Wed", Uptime: 99.92, Incidents: 2 },
          { day: "Thu", Uptime: 99.98, Incidents: 0 },
          { day: "Fri", Uptime: 99.97, Incidents: 1 }
        ],
        table: {
          caption: "Recent incidents",
          columns: [
            { key: "id", label: "ID" },
            { key: "summary", label: "Summary" },
            { key: "severity", label: "Severity", align: "end" }
          ],
          rows: [
            { id: "INC-1042", summary: "Elevated 5xx in us-west", severity: "High" },
            { id: "INC-1043", summary: "Webhook retries spiking", severity: "Med" },
            { id: "INC-1044", summary: "Latency regression", severity: "Med" }
          ]
        }
      }
    },
    {
      id: "analytics",
      title: "Analytics snapshot",
      description: "Custom chart component with series definitions.",
      template: `
<Card size="md">
  <Col gap={2}>
    <Title value={title} size="sm" />
    <Text value={subtitle} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <Chart data={chart.data} series={chart.series} xAxis={chart.xAxis} showYAxis />
</Card>
    `.trim(),
      schema: AnalyticsSchema,
      data: {
        title: "Weekly usage",
        subtitle: "Desktop vs. Mobile interactions",
        chart: {
          data: [
            { date: "Mon", Desktop: 320, Mobile: 240 },
            { date: "Tue", Desktop: 280, Mobile: 210 },
            { date: "Wed", Desktop: 360, Mobile: 300 },
            { date: "Thu", Desktop: 420, Mobile: 280 },
            { date: "Fri", Desktop: 380, Mobile: 340 }
          ],
          series: [
            { type: "bar", dataKey: "Desktop", label: "Desktop", color: "blue" },
            { type: "line", dataKey: "Mobile", label: "Mobile", color: "purple" }
          ],
          xAxis: { dataKey: "date" }
        }
      }
    },
    {
      id: "traffic-breakdown",
      title: "Traffic breakdown (donut)",
      description: "Pie / donut chart support using `series.type=\"pie\"` and per-row `fill` colors.",
      template: `
<Card size="sm">
  <Col gap={2}>
    <Title value={title} size="sm" />
    <Text value={subtitle} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <PieChart
    height={240}
    data={slices}
    series={[
      {
        dataKey: "value",
        nameKey: "source",
        innerRadius: "58%",
        outerRadius: "82%",
        paddingAngle: 2,
        cornerRadius: 6
      }
    ]}
  />
</Card>
      `.trim(),
      schema: TrafficBreakdownSchema,
      data: {
        title: "Acquisition",
        subtitle: "Last 7 days",
        slices: [
          { source: "Search", value: 1240, fill: "blue" },
          { source: "Direct", value: 860, fill: "purple" },
          { source: "Referrals", value: 420, fill: "green" },
          { source: "Social", value: 310, fill: "orange" }
        ]
      }
    },
    {
      id: "revenue-mix",
      title: "Revenue mix (stacked bars)",
      description: "Stacked bar chart (cartesian) using `stack` on bar series.",
      template: `
<Card size="md">
  <Col gap={2}>
    <Title value={title} size="sm" />
    <Text value={subtitle} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <BarChart
    height={240}
    data={data}
    series={[
      { dataKey: "recurring", label: "Recurring", color: "blue", stack: "rev" },
      { dataKey: "oneTime", label: "One-time", color: "orange", stack: "rev" }
    ]}
    xAxis={{ dataKey: "month" }}
    showYAxis
    showLegend
    showTooltip
    barCategoryGap={20}
  />
</Card>
      `.trim(),
      schema: RevenueStackedSchema,
      data: {
        title: "Revenue",
        subtitle: "Recurring vs. one-time",
        data: [
          { month: "Jan", recurring: 18_200, oneTime: 3_400 },
          { month: "Feb", recurring: 19_100, oneTime: 4_200 },
          { month: "Mar", recurring: 20_050, oneTime: 2_900 },
          { month: "Apr", recurring: 21_300, oneTime: 5_100 },
          { month: "May", recurring: 22_100, oneTime: 3_800 }
        ]
      }
    },
    {
      id: "conversion-trend",
      title: "Conversion trend (line)",
      description: "Line chart example using `<LineChart />`.",
      template: `
<Card size="md">
  <Col gap={2}>
    <Title value={title} size="sm" />
    <Text value={subtitle} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <LineChart
    height={240}
    data={data}
    series={[
      { dataKey: "conversion", label: "Conversion", color: "green" }
    ]}
    xAxis={{ dataKey: "week" }}
    showYAxis
  />
</Card>
      `.trim(),
      schema: z.strictObject({
        title: z.string(),
        subtitle: z.string(),
        data: z.array(
          z.strictObject({
            week: z.string(),
            conversion: z.number()
          })
        )
      }),
      data: {
        title: "Conversion",
        subtitle: "Weekly signup conversion",
        data: [
          { week: "W1", conversion: 2.1 },
          { week: "W2", conversion: 2.3 },
          { week: "W3", conversion: 2.0 },
          { week: "W4", conversion: 2.6 },
          { week: "W5", conversion: 2.8 }
        ]
      }
    },
    {
      id: "active-users",
      title: "Active users (area)",
      description: "Area chart example using `<AreaChart />`.",
      template: `
<Card size="md">
  <Col gap={2}>
    <Title value={title} size="sm" />
    <Text value={subtitle} size="sm" color="secondary" />
  </Col>
  <Divider flush />
  <AreaChart
    height={240}
    data={data}
    series={[
      { dataKey: "active", label: "Active", color: "blue", fillOpacity: 0.25 }
    ]}
    xAxis={{ dataKey: "day" }}
    showYAxis
  />
</Card>
      `.trim(),
      schema: z.strictObject({
        title: z.string(),
        subtitle: z.string(),
        data: z.array(
          z.strictObject({
            day: z.string(),
            active: z.number()
          })
        )
      }),
      data: {
        title: "Active users",
        subtitle: "Last 7 days",
        data: [
          { day: "Mon", active: 820 },
          { day: "Tue", active: 910 },
          { day: "Wed", active: 880 },
          { day: "Thu", active: 970 },
          { day: "Fri", active: 1020 },
          { day: "Sat", active: 940 },
          { day: "Sun", active: 990 }
        ]
      }
    }
  ];

export type WidgetExample = (typeof widgetExamples)[number];
