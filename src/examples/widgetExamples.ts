import { z } from "zod";
import { iconNames } from "@/widget/iconNames";

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
    }
  ];

export type WidgetExample = (typeof widgetExamples)[number];
