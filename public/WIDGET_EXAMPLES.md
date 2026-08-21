# Widget examples

The complete gallery corpus — every demo widget from the gallery as a `template` + `data` pair. This is the optional companion to `AGENTS.md`: the guide defines the authoring contract and a curated example set; this file provides the full corpus for richer LLM context windows, retrieval, or fine-tuning.

> Generated from `src/examples/widgetExamples.ts` by `scripts/build-widget-examples-doc.mjs` — do not edit by hand.

52 widgets across 10 categories.

## Featured

### Analytics overview

Stat row with sparklines, tabbed area chart, and a channel table. (id: `analytics-overview`)

WIDGET TEMPLATE:

```
<Card size="lg" gap={4}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Site analytics" size="sm" />
      <Caption value="Last 30 days · updated 5m ago" />
    </Col>
    <Spacer />
    <Badge label="Live" color="success" icon="activity" />
  </Row>

  <Row gap={5} wrap="wrap">
    <Each $of="stats" item="stat">
      <Col flex={1} minWidth={120} gap={1}>
        <Stat label={stat.label} value={stat.value} delta={stat.delta} size="sm" />
        <Sparkline data={stat.trend} height={30} />
      </Col>
    </Each>
  </Row>

  <Tabs tabs={[
    { id: "traffic", label: "Traffic", icon: "trending-up" },
    { id: "channels", label: "Channels", icon: "layers" }
  ]}>
    <Tabs.Panel id="traffic">
      <AreaChart
        data={series}
        xAxis={{ dataKey: "week" }}
        series={[
          { dataKey: "visitors", label: "Visitors" },
          { dataKey: "signups", label: "Signups", color: "#10b981" }
        ]}
        height={190}
      />
    </Tabs.Panel>
    <Tabs.Panel id="channels">
      <DataTable
        columns={[
          { key: "channel", label: "Channel" },
          { key: "visitors", label: "Visitors", align: "end" },
          { key: "change", label: "Change", align: "end" }
        ]}
        rows={channels}
      />
    </Tabs.Panel>
  </Tabs>
</Card>
```

WIDGET DATA:

```json
{
  "stats": [
    {
      "label": "Visitors",
      "value": "48.2K",
      "delta": "+12.4%",
      "trend": [
        30,
        34,
        32,
        38,
        41,
        39,
        44,
        48
      ]
    },
    {
      "label": "Signups",
      "value": "1,284",
      "delta": "+8.1%",
      "trend": [
        10,
        12,
        11,
        14,
        13,
        16,
        17,
        19
      ]
    },
    {
      "label": "Bounce rate",
      "value": "31%",
      "delta": "-2.3%",
      "trend": [
        40,
        38,
        39,
        36,
        35,
        33,
        32,
        31
      ]
    }
  ],
  "series": [
    {
      "week": "W1",
      "visitors": 5200,
      "signups": 140
    },
    {
      "week": "W2",
      "visitors": 6100,
      "signups": 168
    },
    {
      "week": "W3",
      "visitors": 5800,
      "signups": 155
    },
    {
      "week": "W4",
      "visitors": 7400,
      "signups": 210
    },
    {
      "week": "W5",
      "visitors": 8600,
      "signups": 262
    },
    {
      "week": "W6",
      "visitors": 9800,
      "signups": 301
    }
  ],
  "channels": [
    {
      "channel": "Organic search",
      "visitors": "21,400",
      "change": "+14%"
    },
    {
      "channel": "Direct",
      "visitors": "12,050",
      "change": "+6%"
    },
    {
      "channel": "Referral",
      "visitors": "8,220",
      "change": "+21%"
    },
    {
      "channel": "Social",
      "visitors": "6,530",
      "change": "-3%"
    }
  ]
}
```

### Flight booking

A detailed booking review with segments, fare rules, and confirm actions. (id: `flight-booking`)

WIDGET TEMPLATE:

```
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
    <Box size={18} radius="full" border={{ size: 2, color: "subtle" }} background="surface" />
    <Col flex="auto" gap={0}>
      <Text value={route} size="sm" weight="semibold" />
      <Caption value={dates} />
    </Col>
    <Col align="end" gap={0}>
      <Text value={cabinClass} size="sm" weight="semibold" />
      <Caption value={`${guests} guests`} />
    </Col>
  </Row>

  <Divider flush />

  <Col padding={{ x: 4, y: 3 }} gap={3}>
    <Row gap={2} align="center">
      <Box background="surface-elevated-secondary" radius="full" padding={2}>
        <Icon name="plane" size="lg" />
      </Box>
      <Text value="Flight details" size="sm" weight="semibold" />
    </Row>

    <Col gap={2}>
      <Each $of="segments" item="seg">
        <Row gap={3} align="start">
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
                <Caption value="Depart" size="sm" />
                <Text value={seg.departTime} weight="semibold" />
                <Caption value={seg.departNote} />
              </Col>
              <Col flex={1} gap={0}>
                <Caption value="Arrive" size="sm" />
                <Text value={seg.arriveTime} weight="semibold" />
                <Caption value={seg.arriveNote} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Each>
    </Col>

    <Divider flush />

    <KeyValue rows={reviewRows} />
  </Col>

  <Row padding={{ x: 4, y: 4 }} background="surface-elevated-secondary" border={{ top: { size: 1 } }}>
    <Col gap={0}>
      <Text value="Total" size="sm" weight="semibold" />
      <Caption value={priceNote} />
    </Col>
    <Spacer />
    <Title value={totalPrice} size="sm" />
  </Row>
</Card>
```

WIDGET DATA:

```json
{
  "bookingId": "bk-ua-893421",
  "heroImage": "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=80",
  "tripSummary": "Round-trip · International",
  "statusLabel": "Review",
  "route": "SFO → NRT",
  "dates": "Mar 12 – Mar 20",
  "guests": "2",
  "cabinClass": "Premium Economy",
  "reviewRows": [
    {
      "label": "Guests",
      "value": "2"
    },
    {
      "label": "Cabin",
      "value": "Premium Economy"
    },
    {
      "label": "Baggage",
      "value": "1 checked + 1 carry-on"
    },
    {
      "label": "Refundability",
      "value": "Changes allowed with fee"
    }
  ],
  "segments": [
    {
      "id": "seg-1",
      "image": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
      "route": "SFO → NRT",
      "stopsLabel": "Nonstop",
      "flightNumber": "United 837",
      "aircraft": "Boeing 787-9",
      "departTime": "11:30 AM",
      "departNote": "Wed, Mar 12 · SFO",
      "arriveTime": "3:05 PM",
      "arriveNote": "Thu, Mar 13 · NRT"
    },
    {
      "id": "seg-2",
      "image": "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80",
      "route": "NRT → SFO",
      "stopsLabel": "Nonstop",
      "flightNumber": "United 838",
      "aircraft": "Boeing 787-9",
      "departTime": "5:15 PM",
      "departNote": "Thu, Mar 20 · NRT",
      "arriveTime": "10:40 AM",
      "arriveNote": "Thu, Mar 20 · SFO"
    }
  ],
  "totalPrice": "$3,184.20",
  "priceNote": "Includes taxes and fees · 2 guests"
}
```

### Order tracking

Steps, a live timeline, and order details for a shipment. (id: `order-tracking`)

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Your order is on its way" size="sm" />
      <Caption value={`Order ${orderId}`} />
    </Col>
    <Spacer />
    <Badge label={eta} color="accent" icon="truck" />
  </Row>

  <Steps items={steps} current={currentStep} />

  <Callout
    color="info"
    icon="map-pin"
    title="Out for delivery"
    description="Your courier is 4 stops away. Someone should be available to receive the package."
  />

  <Timeline items={events} />

  <Divider />

  <KeyValue rows={details} />

  <Button
    label="View live map"
    iconStart="navigation"
    variant="soft"
    color="primary"
    block
    onClickAction={{ type: "order.track.map", payload: { orderId } }}
  />
</Card>
```

WIDGET DATA:

```json
{
  "orderId": "#84213",
  "eta": "Today, 2–4 PM",
  "currentStep": 2,
  "steps": [
    {
      "label": "Ordered"
    },
    {
      "label": "Shipped"
    },
    {
      "label": "Out for delivery"
    },
    {
      "label": "Delivered"
    }
  ],
  "events": [
    {
      "title": "Out for delivery",
      "description": "With courier · San Francisco, CA",
      "time": "11:42 AM",
      "icon": "truck",
      "state": "active"
    },
    {
      "title": "Arrived at local facility",
      "description": "San Francisco, CA",
      "time": "6:18 AM",
      "state": "done"
    },
    {
      "title": "Shipped",
      "description": "Left fulfillment center · Reno, NV",
      "time": "Yesterday",
      "state": "done"
    },
    {
      "title": "Order confirmed",
      "time": "Mon",
      "state": "done"
    }
  ],
  "details": [
    {
      "label": "Carrier",
      "value": "FastShip Express"
    },
    {
      "label": "Tracking",
      "value": "FS-4821-9932"
    },
    {
      "label": "Items",
      "value": "2 items"
    }
  ]
}
```

### Smart home

A dark-theme control center with scenes, stats, and device toggles. (id: `smart-home` · theme: `dark`)

WIDGET TEMPLATE:

```
<Card size="md" theme="dark" gap={4}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Good evening" size="sm" />
      <Caption value="3 devices on · Home" />
    </Col>
    <Spacer />
    <Badge label="Away mode off" variant="outline" color="secondary" />
  </Row>

  <Row gap={5}>
    <Stat label="Inside" value={temperature} icon="thermometer" size="sm" />
    <Stat label="Humidity" value={humidity} icon="droplet" size="sm" />
    <Col flex={1} gap={1}>
      <Stat label="Energy today" value={energyToday} size="sm" />
      <Sparkline data={energyTrend} height={26} color="#34d399" />
    </Col>
  </Row>

  <Divider />

  <Col gap={2}>
    <Caption value="SCENES" size="sm" />
    <ChipGroup name="scene" defaultValue="relax" options={scenes}
      onChangeAction={{ type: "home.scene.set" }} />
  </Col>

  <Col gap={0}>
    <Each $of="devices" item="device">
      <Row align="center" gap={3} padding={{ y: 2 }}>
        <Box size={34} radius="lg" background="surface-tertiary" align="center" justify="center">
          <Icon name={device.icon} size="md" color={device.on ? "primary" : "tertiary"} />
        </Box>
        <Col flex="auto" gap={0}>
          <Text value={device.name} size="sm" weight="semibold" />
          <Caption value={device.room} />
        </Col>
        <Toggle
          name={device.id}
          label={device.on ? "On" : "Off"}
          defaultPressed={device.on}
          onChangeAction={{ type: "home.device.toggle", payload: { id: device.id } }}
        />
      </Row>
    </Each>
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "temperature": "72°",
  "humidity": "44%",
  "energyToday": "12.4 kWh",
  "energyTrend": [
    4,
    5,
    4,
    6,
    8,
    7,
    9,
    8,
    10,
    9,
    12
  ],
  "scenes": [
    {
      "label": "Relax",
      "value": "relax",
      "icon": "sunset"
    },
    {
      "label": "Focus",
      "value": "focus",
      "icon": "target"
    },
    {
      "label": "Movie",
      "value": "movie",
      "icon": "film"
    },
    {
      "label": "Sleep",
      "value": "sleep",
      "icon": "moon"
    }
  ],
  "devices": [
    {
      "id": "living-lights",
      "name": "Living room lights",
      "room": "Living room",
      "icon": "lightbulb",
      "on": true
    },
    {
      "id": "thermostat",
      "name": "Thermostat",
      "room": "Hallway",
      "icon": "thermometer",
      "on": true
    },
    {
      "id": "speaker",
      "name": "Speaker",
      "room": "Kitchen",
      "icon": "music",
      "on": false
    }
  ]
}
```

### Player profile

Dark gradient profile card with a season stat row and form sparkline. (id: `player-profile` · theme: `dark`)

WIDGET TEMPLATE:

```
<Card size="sm" theme="dark" background="linear-gradient(165deg, #1c2540 0%, #0d1120 100%)" gap={3}>
  <Row gap={3} align="center">
    <Avatar src={photo} name={name} size={56} />
    <Col flex="auto" gap={0}>
      <Title value={name} size="sm" />
      <Caption value={`${team} · ${position}`} />
    </Col>
    <Badge label={number} color="accent" variant="soft" size="lg" />
  </Row>

  <Divider />

  <Row justify="between" gap={4}>
    <Each $of="stats" item="stat">
      <Stat label={stat.label} value={stat.value} size="sm" />
    </Each>
  </Row>

  <Col gap={1}>
    <Caption value="LAST 10 GAMES" size="sm" />
    <Sparkline data={form} height={32} color="#818cf8" />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "name": "Jordan Vale",
  "team": "SF Breakers",
  "position": "Point guard",
  "number": "#11",
  "photo": "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=300&q=80",
  "stats": [
    {
      "label": "PPG",
      "value": "24.8"
    },
    {
      "label": "AST",
      "value": "7.2"
    },
    {
      "label": "REB",
      "value": "4.6"
    },
    {
      "label": "FG%",
      "value": "48.1"
    }
  ],
  "form": [
    18,
    22,
    27,
    21,
    30,
    24,
    26,
    31,
    25,
    29
  ]
}
```

## Agent UI

### Thinking & reasoning

A finished reasoning trace that expands into steps, then a cited answer. (id: `agent-thinking`)

WIDGET TEMPLATE:

```
<Card size="md" gap={3}>
  <Thinking summary={summary} steps={steps} defaultOpen />
  <Divider />
  <TextResponse value={response} />
  <InlineCitations text={citationText} sources={citationSources} />
</Card>
```

WIDGET DATA:

```json
{
  "summary": "Thought for 9s",
  "steps": [
    {
      "label": "Reading the auth middleware",
      "detail": "src/middleware/auth.ts · 120 lines",
      "status": "completed"
    },
    {
      "label": "Tracing where the session secret is loaded",
      "detail": "Confirmed it never reaches the client",
      "status": "completed"
    },
    {
      "label": "Checking existing coverage",
      "detail": "auth.test.ts covers expiry but not tampering",
      "status": "completed"
    }
  ],
  "response": "The middleware accepts any signing algorithm, so a forged token could pass verification. Pinning the algorithm and validating the issuer closes the gap without touching call sites.",
  "citationText": "Algorithm confusion is a known JWT pitfall [1], and the fix matches the library's own hardening guide [2].",
  "citationSources": [
    {
      "id": 1,
      "label": "JWT algorithm confusion",
      "host": "owasp.org",
      "url": "https://owasp.org"
    },
    {
      "id": 2,
      "label": "jsonwebtoken hardening notes",
      "host": "github.com",
      "url": "https://github.com"
    }
  ]
}
```

### Working states

Shimmering thinking line, a staged loading surface, and all 25 orb variants. (id: `agent-working`)

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
  <ThinkingState label={thinkingLabel} elapsed={thinkingElapsed} active />
  <LoadingState label={loadingLabel} elapsed={loadingElapsed} variant="drive" />
  <Grid columns="repeat(5, minmax(0, 1fr))" gap={3}>
    <Each $of="orbs" item="orb">
      <Col key={orb.variant} align="center" gap={2} padding={{ y: 1 }}>
        <Orbs variant={orb.variant} size={22} />
        <Caption $value="orb.variant" size="sm" />
      </Col>
    </Each>
  </Grid>
</Card>
```

WIDGET DATA:

```json
{
  "thinkingLabel": "Reading the migration plan",
  "thinkingElapsed": "6s",
  "loadingLabel": "Summarizing 28 pull requests",
  "loadingElapsed": "0:41",
  "orbs": [
    {
      "variant": "S1"
    },
    {
      "variant": "S2"
    },
    {
      "variant": "S3"
    },
    {
      "variant": "S4"
    },
    {
      "variant": "S5"
    },
    {
      "variant": "G1"
    },
    {
      "variant": "G2"
    },
    {
      "variant": "G3"
    },
    {
      "variant": "G4"
    },
    {
      "variant": "G5"
    },
    {
      "variant": "C1"
    },
    {
      "variant": "C2"
    },
    {
      "variant": "C3"
    },
    {
      "variant": "C4"
    },
    {
      "variant": "C5"
    },
    {
      "variant": "B1"
    },
    {
      "variant": "B2"
    },
    {
      "variant": "B3"
    },
    {
      "variant": "B4"
    },
    {
      "variant": "B5"
    },
    {
      "variant": "M1"
    },
    {
      "variant": "M2"
    },
    {
      "variant": "M3"
    },
    {
      "variant": "M4"
    },
    {
      "variant": "M5"
    }
  ]
}
```

### Streaming answer

Progressive text with a blinking caret, collapsible sources, and follow-ups. (id: `agent-response`)

WIDGET TEMPLATE:

```
<Card size="md" gap={3}>
  <StreamingText text={text} speed={14} loop loopDelay={1800} sources={sources} followUps={followUps} />
</Card>
```

WIDGET DATA:

```json
{
  "text": "Your release notes for v2.4 are ready. The 28 merged pull requests group into three areas: checkout performance, the new webhook retry policy, and a long tail of dependency bumps. Nothing in the batch changes a public API, so this can ship as a minor version.",
  "sources": [
    {
      "id": 1,
      "label": "Merged pull requests · v2.4 milestone",
      "host": "github.com",
      "url": "https://github.com"
    },
    {
      "id": 2,
      "label": "Webhook retry design note",
      "host": "docs.example.com",
      "url": "https://docs.example.com"
    }
  ],
  "followUps": [
    {
      "label": "Draft the announcement post",
      "icon": "write",
      "action": {
        "type": "agent.followup.announce"
      }
    },
    {
      "label": "Show the dependency bumps only",
      "icon": "filter",
      "action": {
        "type": "agent.followup.deps"
      }
    }
  ]
}
```

### Tasks & tool calls

Live task rows with child steps beside collapsible tool activity. (id: `agent-tasks`)

WIDGET TEMPLATE:

```
<Card size="md" gap={3}>
  <TaskRows items={tasks} variant="list" onItemClickAction={{ type: "agent.task.open" }} />
  <ToolChips summary={toolSummary} items={tools} defaultOpen onItemClickAction={{ type: "agent.tool.open" }} />
</Card>
```

WIDGET DATA:

```json
{
  "tasks": [
    {
      "id": "audit",
      "label": "Verified vendor records",
      "detail": "12 suppliers",
      "status": "completed"
    },
    {
      "id": "reorder",
      "label": "Build reorder task list",
      "detail": "7 SKUs",
      "status": "running",
      "progress": 64,
      "children": [
        {
          "label": "Reading POS export",
          "detail": "3 files",
          "status": "completed"
        },
        {
          "label": "Scoring stockout risk",
          "detail": "s60",
          "status": "running"
        }
      ]
    },
    {
      "id": "emails",
      "label": "Draft supplier emails",
      "detail": "2 messages",
      "status": "pending"
    }
  ],
  "toolSummary": "4 tool calls, 2 messages",
  "tools": [
    {
      "id": "read",
      "type": "read",
      "label": "Read POS export",
      "detail": "pos-march.csv",
      "status": "completed"
    },
    {
      "id": "search",
      "type": "search",
      "label": "Search supplier catalog",
      "detail": "7 matches",
      "status": "completed"
    },
    {
      "id": "write",
      "type": "write",
      "label": "Write reorder schedule",
      "detail": "ReorderSchedule.tsx",
      "status": "running",
      "additions": 204,
      "deletions": 12
    },
    {
      "id": "send",
      "type": "message",
      "label": "Draft supplier emails",
      "detail": "2 drafts",
      "status": "pending"
    }
  ]
}
```

### Agent workbench

A dark work log with reasoning and plan, plus streamed code and a diff. (id: `agent-workbench` · theme: `dark`)

WIDGET TEMPLATE:

```
<Card size="lg" gap={3}>
  <Tabs tabs={[
    { id: "work", label: "Work log", icon: "clipboard" },
    { id: "artifacts", label: "Artifacts", icon: "square-code" }
  ]}>
    <Tabs.Panel id="work">
      <Col gap={3}>
        <ThinkingReasoning summary={traceSummary} steps={traceSteps} defaultOpen />
        <TaskList title={planTitle} items={tasks} defaultOpen onItemClickAction={{ type: "agent.task.open" }} />
      </Col>
    </Tabs.Panel>
    <Tabs.Panel id="artifacts">
      <Col gap={3}>
        <CodeBlock code={code} language="tsx" file={codeFile} streaming highlightLines={highlightLines} />
        <FileDiff file={diffFile} language="tsx" rows={diffRows} />
      </Col>
    </Tabs.Panel>
  </Tabs>
</Card>
```

WIDGET DATA:

```json
{
  "traceSummary": "Verification trace",
  "traceSteps": [
    {
      "label": "Audited component exports",
      "detail": "32 public names resolve",
      "status": "completed"
    },
    {
      "label": "Rendering the gallery corpus",
      "detail": "Focused render suite",
      "status": "running"
    }
  ],
  "planTitle": "Implementation plan",
  "tasks": [
    {
      "id": "audit",
      "label": "Audit component APIs",
      "detail": "32 exports checked",
      "status": "completed"
    },
    {
      "id": "gallery",
      "label": "Build gallery coverage",
      "detail": "13 focused demos",
      "status": "running",
      "progress": 72
    },
    {
      "id": "docs",
      "label": "Regenerate the corpus doc",
      "detail": "WIDGET_EXAMPLES.md",
      "status": "pending"
    }
  ],
  "codeFile": "src/agent-card.tsx",
  "code": "export function AgentCard() {\n  const status = useAgentStatus();\n  return (\n    <Response>\n      <StatusRow value={status} />\n    </Response>\n  );\n}",
  "highlightLines": [
    2,
    5
  ],
  "diffFile": "src/agent-card.tsx",
  "diffRows": [
    {
      "oldLine": 1,
      "newLine": 1,
      "type": "context",
      "text": "export function AgentCard() {"
    },
    {
      "oldLine": 2,
      "type": "remove",
      "text": "  return null;"
    },
    {
      "newLine": 2,
      "type": "add",
      "text": "  const status = useAgentStatus();"
    },
    {
      "newLine": 3,
      "type": "add",
      "text": "  return <StatusRow value={status} />;"
    },
    {
      "oldLine": 3,
      "newLine": 4,
      "type": "context",
      "text": "}"
    }
  ]
}
```

### Image generation

A generating canvas with live progress above a finished render. (id: `agent-media`)

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
  <ImageGeneration prompt={prompt} progress={progress} status={status} resolution={resolution} aspectRatio="landscape" />
  <ImageGeneration prompt={finishedPrompt} status={finishedStatus} image={finishedImage} alt={finishedPrompt} resolution={resolution} aspectRatio="landscape" />
</Card>
```

WIDGET DATA:

```json
{
  "prompt": "A calm command center for an AI agent, dawn light",
  "progress": 68,
  "status": "Generating image",
  "resolution": "1536 × 1024",
  "finishedPrompt": "A calm mountain lake at dawn",
  "finishedStatus": "Finished in 12s",
  "finishedImage": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80"
}
```

### Agent decisions

Approval questions with keyed options beside a confidence-aware recommendation. (id: `agent-decisions`)

WIDGET TEMPLATE:

```
<Response gap={3}>
  <Grid columns="repeat(auto-fit, minmax(260px, 1fr))" gap={3}>
    <ApprovalCard
      title={approvalTitle}
      description={approvalDescription}
      questions={approvalQuestions}
      autoAdvance
      approveLabel="Continue"
      rejectLabel="Pause"
      countdown={18}
      approveAction={{ type: "agent.approval.accept" }}
      rejectAction={{ type: "agent.approval.reject" }}
    />
    <RecommendationCard
      title={recommendationTitle}
      description={recommendationDescription}
      confidence={confidence}
      alternatives={alternatives}
      acceptLabel="Use split layout"
      acceptAction={{ type: "agent.recommendation.accept" }}
      alternativesAction={{ type: "agent.recommendation.alternatives" }}
    />
  </Grid>
</Response>
```

WIDGET DATA:

```json
{
  "approvalTitle": "How should the agent proceed?",
  "approvalDescription": "Two quick questions before the workspace changes apply.",
  "approvalQuestions": [
    {
      "id": "review-mode",
      "title": "How should the agent proceed?",
      "description": "Choose a review mode for the proposed changes.",
      "allowOther": false,
      "options": [
        {
          "label": "Review the diff first",
          "value": "review",
          "description": "Walk through every change"
        },
        {
          "label": "Apply and summarize",
          "value": "apply",
          "description": "Continue with current defaults"
        },
        {
          "label": "Stage behind a flag",
          "value": "flag",
          "description": "Ship dark, enable gradually"
        }
      ]
    },
    {
      "id": "checks",
      "title": "Which checks should run?",
      "description": "Pick one or more validation gates.",
      "multiple": true,
      "otherPlaceholder": "Name another check…",
      "options": [
        {
          "label": "Renderer tests",
          "value": "render",
          "description": "Render every example"
        },
        {
          "label": "Production build",
          "value": "build",
          "description": "Compile package and docs"
        }
      ]
    }
  ],
  "recommendationTitle": "Use a split workspace",
  "recommendationDescription": "Navigation stays visible while the workflow remains scannable — the layout most teams keep after trying all three.",
  "confidence": 0.91,
  "alternatives": [
    {
      "label": "Single column",
      "description": "Best for narrow hosts",
      "status": "Compact"
    },
    {
      "label": "Tabbed view",
      "description": "Best for dense artifacts",
      "status": "Flexible"
    }
  ]
}
```

### Agent conversation

A tabbed transcript with user, reasoning, tool, and assistant turns plus a composer. (id: `agent-conversation`)

WIDGET TEMPLATE:

```
<Response>
  <Chat tabs={tabs} defaultTab="build" messages={messages} placeholder="Reply to the agent…" sendAction={{ type: "agent.chat.send" }} onTabChangeAction={{ type: "agent.chat.tab" }} />
</Response>
```

WIDGET DATA:

```json
{
  "tabs": [
    {
      "id": "build",
      "label": "Build"
    },
    {
      "id": "review",
      "label": "Review"
    }
  ],
  "messages": [
    {
      "id": "m1",
      "role": "user",
      "content": "Add every new agent primitive to the gallery."
    },
    {
      "id": "m2",
      "role": "reasoning",
      "label": "Planned",
      "detail": "13 demos",
      "duration": "6s",
      "content": "Group related states so each demo stays focused on one surface."
    },
    {
      "id": "m3",
      "role": "tool",
      "label": "Write",
      "detail": "widgetExamples.ts",
      "content": "Added 13 examples and regenerated the corpus doc."
    },
    {
      "id": "m4",
      "role": "assistant",
      "content": "Done — the gallery now covers every canonical export, and both aliases render."
    }
  ]
}
```

### Prompt composers

The full composer, a source-aware pill bar, and the minimal prompt input. (id: `agent-composer`)

WIDGET TEMPLATE:

```
<Response gap={4}>
  <Col gap={2}>
    <Caption value="FULL COMPOSER" size="sm" />
    <AgentInput
      defaultValue={prompt}
      models={models}
      defaultModel="fable-5"
      attachments={attachments}
      commands={commands}
      skills={skills}
      selectedSkills={selectedSkills}
      rows={2}
      submitAction={{ type: "agent.prompt.send" }}
      attachAction={{ type: "agent.attachment.add" }}
      removeAttachmentAction={{ type: "agent.attachment.remove" }}
      commandAction={{ type: "agent.command.select" }}
      skillAction={{ type: "agent.skill.select" }}
      enhanceAction={{ type: "agent.prompt.enhance" }}
    />
  </Col>
  <Col gap={2}>
    <Caption value="SOURCE-AWARE BAR" size="sm" />
    <PromptBar
      placeholder="Ask across your sources…"
      variant="pill"
      sources={sources}
      selectedSources={selectedSources}
      rows={1}
      submitAction={{ type: "agent.prompt.send" }}
      sourceAction={{ type: "agent.source.toggle" }}
    />
  </Col>
  <Col gap={2}>
    <Caption value="MINIMAL PROMPT" size="sm" />
    <PromptInput placeholder="Ask a follow-up…" rows={1} submitAction={{ type: "agent.prompt.send" }} />
  </Col>
</Response>
```

WIDGET DATA:

```json
{
  "prompt": "Summarize the implementation and list open risks",
  "models": [
    {
      "value": "fable-5",
      "label": "Fable 5"
    },
    {
      "value": "swift-4",
      "label": "Swift 4 mini"
    }
  ],
  "attachments": [
    {
      "id": "brief",
      "name": "ui-brief.md",
      "type": "text/markdown",
      "size": "12 KB"
    }
  ],
  "commands": [
    {
      "value": "review",
      "label": "Review changes",
      "description": "Inspect the current widget diff",
      "icon": "search"
    },
    {
      "value": "test",
      "label": "Run tests",
      "description": "Validate the gallery and package",
      "icon": "terminal"
    }
  ],
  "skills": [
    {
      "value": "frontend",
      "label": "Frontend review",
      "description": "Check polish and accessibility",
      "icon": "palette"
    }
  ],
  "selectedSkills": [
    "frontend"
  ],
  "sources": [
    {
      "id": "components",
      "label": "Component registry",
      "description": "Canonical renderer names",
      "icon": "cube",
      "connected": true
    },
    {
      "id": "guide",
      "label": "Authoring guide",
      "description": "Template and action rules",
      "icon": "document",
      "connected": true
    }
  ],
  "selectedSources": [
    "components",
    "guide"
  ]
}
```

### Knowledge workspace

Context chunks, plan comparison, and selectable proposed changes. (id: `knowledge-workspace`)

WIDGET TEMPLATE:

```
<Card size="lg" gap={3}>
  <Tabs tabs={[
    { id: "context", label: "Context", icon: "document" },
    { id: "compare", label: "Compare", icon: "layers" },
    { id: "changes", label: "Changes", icon: "shuffle" }
  ]}>
    <Tabs.Panel id="context">
      <ContextCards title="Retrieved context" items={contextItems} onItemClickAction={{ type: "workspace.context.open" }} />
    </Tabs.Panel>
    <Tabs.Panel id="compare">
      <ComparisonTable label="Implementation options" plans={plans} features={features} highlightPlan={1} />
    </Tabs.Panel>
    <Tabs.Panel id="changes">
      <DiffTable title="Proposed registry changes" description="Tap a changed row to include or exclude it" columns={columns} rows={diffRows} applyAction={{ type: "workspace.diff.apply" }} />
    </Tabs.Panel>
  </Tabs>
</Card>
```

WIDGET DATA:

```json
{
  "contextItems": [
    {
      "id": "c1",
      "title": "Renderer registry",
      "excerpt": "All public component names resolve through one canonical map, so templates never import anything.",
      "characters": 118,
      "source": {
        "label": "registry.ts",
        "type": "TS"
      }
    },
    {
      "id": "c2",
      "title": "Authoring contract",
      "excerpt": "Templates use a supported root and data validated by a strict schema before anything renders.",
      "characters": 104,
      "source": {
        "label": "AGENTS.md",
        "type": "MD"
      }
    },
    {
      "id": "c3",
      "title": "Design tokens",
      "excerpt": "Every surface, border, and text color comes from widget tokens, so dark mode needs zero extra work.",
      "characters": 112,
      "source": {
        "label": "widget.css",
        "type": "CSS"
      }
    }
  ],
  "plans": [
    "Separate pages",
    "Composite demos",
    "One mega page"
  ],
  "features": [
    {
      "label": "Compact corpus",
      "values": [
        false,
        true,
        true
      ]
    },
    {
      "label": "Focused screenshots",
      "values": [
        true,
        true,
        false
      ]
    },
    {
      "label": "Interactive coverage",
      "values": [
        "Partial",
        "Complete",
        "Complete"
      ]
    },
    {
      "label": "Maintenance cost",
      "values": [
        "High",
        "Low",
        "Low"
      ]
    }
  ],
  "columns": [
    {
      "key": "name",
      "label": "Component"
    },
    {
      "key": "kind",
      "label": "Kind"
    },
    {
      "key": "status",
      "label": "Status",
      "type": "status"
    }
  ],
  "diffRows": [
    {
      "id": "d1",
      "type": "context",
      "values": {
        "name": "ThinkingState",
        "kind": "Status",
        "status": "Kept"
      }
    },
    {
      "id": "d2",
      "type": "remove",
      "values": {
        "name": "LegacyPrompt",
        "kind": "Composer",
        "status": "Removed"
      }
    },
    {
      "id": "d3",
      "type": "add",
      "values": {
        "name": "PromptBar",
        "kind": "Composer",
        "status": "Added"
      }
    },
    {
      "id": "d4",
      "type": "add",
      "values": {
        "name": "TaskRows",
        "kind": "Tasks",
        "status": "Added"
      }
    }
  ]
}
```

### Data workspace

Sortable, selectable records and status-filtered views of one dataset. (id: `data-workspace`)

WIDGET TEMPLATE:

```
<Card size="lg" gap={3}>
  <Tabs tabs={[
    { id: "records", label: "Records", icon: "database" },
    { id: "filtered", label: "Filtered", icon: "filter" }
  ]}>
    <Tabs.Panel id="records">
      <RecordsTable columns={columns} rows={rows} caption="Click a row to select it" selectable defaultSortKey="owner" onRowClickAction={{ type: "workspace.record.open" }} onSelectionChangeAction={{ type: "workspace.records.select" }} />
    </Tabs.Panel>
    <Tabs.Panel id="filtered">
      <FilterTable filters={filters} defaultFilter="all" statusKey="status" columns={columns} rows={rows} onFilterAction={{ type: "workspace.filter.change" }} onRowClickAction={{ type: "workspace.record.open" }} />
    </Tabs.Panel>
  </Tabs>
</Card>
```

WIDGET DATA:

```json
{
  "columns": [
    {
      "key": "owner",
      "label": "Owner"
    },
    {
      "key": "surface",
      "label": "Surface"
    },
    {
      "key": "tags",
      "label": "Tags",
      "type": "tags"
    },
    {
      "key": "coverage",
      "label": "Coverage",
      "type": "number",
      "align": "end"
    },
    {
      "key": "status",
      "label": "Status",
      "type": "status"
    }
  ],
  "rows": [
    {
      "id": "r1",
      "owner": "Mira",
      "surface": "Task rows",
      "tags": [
        "Agent",
        "UI"
      ],
      "coverage": 12,
      "status": "Active"
    },
    {
      "id": "r2",
      "owner": "Theo",
      "surface": "Corpus doc",
      "tags": [
        "Docs"
      ],
      "coverage": 8,
      "status": "Blocked"
    },
    {
      "id": "r3",
      "owner": "Ari",
      "surface": "Gallery",
      "tags": [
        "Demos"
      ],
      "coverage": 13,
      "status": "Active"
    },
    {
      "id": "r4",
      "owner": "Noor",
      "surface": "Composer",
      "tags": [
        "Input",
        "A11y"
      ],
      "coverage": 6,
      "status": "Review"
    },
    {
      "id": "r5",
      "owner": "Sam",
      "surface": "Workbench",
      "tags": [
        "Dark"
      ],
      "coverage": 9,
      "status": "Active"
    }
  ],
  "filters": [
    {
      "label": "All",
      "value": "all",
      "count": 5
    },
    {
      "label": "Active",
      "value": "active",
      "count": 3,
      "tone": "success"
    },
    {
      "label": "Review",
      "value": "review",
      "count": 1,
      "tone": "warning"
    },
    {
      "label": "Blocked",
      "value": "blocked",
      "count": 1,
      "tone": "danger"
    }
  ]
}
```

### Navigation workflow

Workspace sidebar, live search, and a connected agent flowchart. (id: `navigation-workflow`)

WIDGET TEMPLATE:

```
<Response gap={3}>
  <Grid columns="minmax(180px, 0.65fr) minmax(250px, 1.35fr)" gap={4}>
    <SidebarNav workspace={workspace} workspaceIcon="cube" sections={sections} onNavigateAction={{ type: "workspace.navigate" }} footerAction={{ label: "New workflow", action: { type: "workspace.workflow.new" } }} />
    <Col gap={3}>
      <Search placeholder="Search workspace…" items={searchItems} onSelectAction={{ type: "workspace.search.open" }} onChangeAction={{ type: "workspace.search.change" }} />
      <Flowchart nodes={nodes} edges={edges} onNodeClickAction={{ type: "workspace.flow.node" }} />
    </Col>
  </Grid>
</Response>
```

WIDGET DATA:

```json
{
  "workspace": "Agent Studio",
  "sections": [
    {
      "label": "Workspace",
      "items": [
        {
          "id": "overview",
          "label": "Overview",
          "icon": "home",
          "active": true
        },
        {
          "id": "runs",
          "label": "Runs",
          "icon": "activity",
          "badge": 4
        },
        {
          "id": "sources",
          "label": "Sources",
          "icon": "database"
        }
      ]
    },
    {
      "label": "Library",
      "items": [
        {
          "id": "prompts",
          "label": "Prompts",
          "icon": "sparkle"
        },
        {
          "id": "evals",
          "label": "Evals",
          "icon": "target",
          "badge": 2
        }
      ]
    }
  ],
  "searchItems": [
    {
      "id": "run-42",
      "label": "Gallery coverage run",
      "description": "13 demos · active",
      "keywords": "agent components",
      "icon": "sparkle"
    },
    {
      "id": "doc",
      "label": "Authoring guide",
      "description": "Template root and schema rules",
      "keywords": "documentation",
      "icon": "document"
    },
    {
      "id": "eval-7",
      "label": "Composer eval",
      "description": "Prompt quality · 92%",
      "keywords": "evals",
      "icon": "target"
    }
  ],
  "nodes": [
    {
      "id": "request",
      "label": "Request received",
      "description": "Read component sources",
      "kind": "trigger",
      "icon": "message"
    },
    {
      "id": "validate",
      "label": "Validate APIs",
      "description": "Check props and registry",
      "kind": "condition",
      "icon": "search"
    },
    {
      "id": "publish",
      "label": "Publish examples",
      "description": "Generate the gallery corpus",
      "kind": "result",
      "icon": "check"
    }
  ],
  "edges": [
    {
      "from": "request",
      "to": "validate",
      "label": "inspect",
      "tone": "info"
    },
    {
      "from": "validate",
      "to": "publish",
      "label": "verified",
      "tone": "success"
    }
  ]
}
```

### Insight editor

Swipeable insights, fine-tuning controls, and selection-aware editing actions. (id: `insight-editor`)

WIDGET TEMPLATE:

```
<Response gap={3}>
  <Grid columns="repeat(auto-fit, minmax(260px, 1fr))" gap={4}>
    <InsightCards title="Run insights" items={insights} onChangeAction={{ type: "workspace.insight.change" }} />
    <Col gap={3}>
      <FineTuneCard title={fineTuneTitle} fields={fields} applyLabel="Apply tuning" applyAction={{ type: "workspace.tuning.apply" }} onChangeAction={{ type: "workspace.tuning.change" }} />
      <SelectionActions text={selectionText} selection={selection} actions={selectionActions} submitAction={{ type: "workspace.selection.edit" }} />
    </Col>
  </Grid>
</Response>
```

WIDGET DATA:

```json
{
  "insights": [
    {
      "id": "coverage",
      "title": "Coverage is complete",
      "description": "Every new agent and workspace export appears in the gallery.",
      "metrics": [
        {
          "label": "Components",
          "value": "32",
          "delta": "+32 this week",
          "color": "#6366f1",
          "data": [
            4,
            8,
            13,
            21,
            32
          ]
        },
        {
          "label": "Focused demos",
          "value": "13",
          "delta": "was 8",
          "data": [
            1,
            2,
            3,
            5,
            8,
            13
          ]
        }
      ]
    },
    {
      "id": "validation",
      "title": "Schemas stay strict",
      "description": "Gallery data remains deterministic and renderer-safe.",
      "metrics": [
        {
          "label": "Schema failures",
          "value": "0",
          "delta": "30 days clean",
          "data": [
            3,
            2,
            1,
            0,
            0
          ]
        },
        {
          "label": "Render time",
          "value": "41ms",
          "delta": "-8ms",
          "data": [
            62,
            55,
            49,
            44,
            41
          ]
        }
      ]
    }
  ],
  "fineTuneTitle": "Response style",
  "fields": [
    {
      "name": "detail",
      "label": "Detail",
      "type": "range",
      "value": 62,
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "%"
    },
    {
      "name": "tone",
      "label": "Tone",
      "type": "select",
      "value": "concise",
      "options": [
        {
          "label": "Concise",
          "value": "concise"
        },
        {
          "label": "Exploratory",
          "value": "exploratory"
        }
      ]
    }
  ],
  "selectionText": "The agent response is clear, complete, and intentionally compact.",
  "selection": "clear, complete",
  "selectionActions": [
    {
      "label": "Shorter",
      "value": "shorter",
      "icon": "minimize"
    },
    {
      "label": "Explain",
      "value": "explain",
      "icon": "sparkle"
    }
  ]
}
```

## Commerce

### Product detail

Rating, size selector chips, pricing, and purchase actions. (id: `product-detail`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0}>
  <Image src={image} alt={name} height={210} fit="cover" flush />
  <Col padding={4} gap={3}>
    <Col gap={1}>
      <Caption value={brand} />
      <Title value={name} size="sm" />
      <Rating value={rating} showValue count={reviews} />
    </Col>

    <Row align="baseline" gap={2}>
      <Title value={price} size="md" />
      <Text value={compareAt} size="sm" color="tertiary" lineThrough />
      <Badge label="Sale" color="danger" />
    </Row>

    <Col gap={2}>
      <Caption value="SIZE" size="sm" />
      <ChipGroup name="size" defaultValue="m" options={sizes} />
    </Col>

    <Callout color="success" icon="truck" description={shippingNote} />

    <Row gap={2}>
      <Button
        label="Add to cart"
        color="primary"
        block
        onClickAction={{ type: "cart.add", payload: { product: name } }}
      />
      <Button
        iconStart="heart"
        variant="outline"
        uniform
        onClickAction={{ type: "wishlist.add", payload: { product: name } }}
      />
    </Row>
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  "brand": "Northwind",
  "name": "Trail Runner 2",
  "rating": 4.5,
  "reviews": "1,284",
  "price": "$129",
  "compareAt": "$159",
  "sizes": [
    {
      "label": "S",
      "value": "s"
    },
    {
      "label": "M",
      "value": "m"
    },
    {
      "label": "L",
      "value": "l"
    },
    {
      "label": "XL",
      "value": "xl"
    }
  ],
  "shippingNote": "Free 2-day shipping · Free returns until Feb 28"
}
```

### Pricing plans

Three plan cards with a highlighted popular tier. (id: `pricing-plans`)

WIDGET TEMPLATE:

```
<Basic>
  <Grid columns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
    <Each $of="plans" item="plan">
      <Grid.Item>
        <Box
          padding={4}
          radius="xl"
          gap={3}
          border={plan.popular ? { size: 2, color: "#4f46e5" } : { size: 1, color: "default" }}
          background={plan.popular ? "surface-elevated" : "surface"}
        >
          <Col gap={1}>
            <Row align="center" gap={2}>
              <Text value={plan.name} weight="semibold" />
              <Show $when="plan.popular">
                <Badge label="Popular" color="accent" />
              </Show>
            </Row>
            <Row align="baseline" gap={1}>
              <Title value={plan.price} size="lg" />
              <Caption value={plan.cadence} />
            </Row>
            <Caption value={plan.description} />
          </Col>

          <List marker="check" gap={1}>
            <Each $of="plan.features" item="feature">
              <List.Item>
                <Text value={feature} size="sm" color="secondary" />
              </List.Item>
            </Each>
          </List>

          <Spacer />
          <Button
            label={plan.cta}
            color={plan.popular ? "accent" : "secondary"}
            block
            onClickAction={{ type: "plan.select", payload: { plan: plan.id } }}
          />
        </Box>
      </Grid.Item>
    </Each>
  </Grid>
</Basic>
```

WIDGET DATA:

```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "price": "$0",
      "cadence": "/month",
      "description": "For personal projects",
      "features": [
        "1 project",
        "Community support",
        "1K renders/mo"
      ],
      "cta": "Get started"
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": "$24",
      "cadence": "/month",
      "description": "For growing teams",
      "popular": true,
      "features": [
        "Unlimited projects",
        "Priority support",
        "100K renders/mo",
        "Custom themes"
      ],
      "cta": "Start free trial"
    },
    {
      "id": "scale",
      "name": "Scale",
      "price": "$96",
      "cadence": "/month",
      "description": "For production workloads",
      "features": [
        "Everything in Pro",
        "SSO & audit logs",
        "Dedicated support"
      ],
      "cta": "Contact sales"
    }
  ]
}
```

### Checkout

Itemized cart with computed totals and purchase actions. (id: `checkout-summary`)

WIDGET TEMPLATE:

```
<Scope values={{ itemCountLabel: String(size(items)) + " items" }}>
<Card size="sm">
  <Row align="center">
    <Title value="Checkout" size="sm" />
    <Spacer />
    <Caption $value="itemCountLabel" />
  </Row>

  <Col>
    <Show $when="size(items) > 0">
      <Each $of="items" item="item">
        <Row align="center" gap={3} padding={{ y: 1 }}>
          <Image src={item.image} size={48} radius="lg" />
          <Col gap={0}>
            <Text value={item.title} size="sm" weight="semibold" color="emphasis" />
            <Caption value={item.subtitle} />
          </Col>
        </Row>
      </Each>
      <Show.Else>
        <EmptyState icon="shopping-cart" title="Your cart is empty"
          description="Items you add will show up here." />
      </Show.Else>
    </Show>
  </Col>

  <Divider flush />
  <KeyValue rows={totals} />
  <Divider flush />

  <Col gap={2}>
    <Button label="Purchase" color="primary" block onClickAction={{ type: "purchase" }} />
    <Button label="Save for later" variant="ghost" color="primary" block onClickAction={{ type: "cart.save" }} />
  </Col>
</Card>
</Scope>
```

WIDGET DATA:

```json
{
  "items": [
    {
      "id": "black-sugar-latte",
      "image": "https://cdn.openai.com/API/storybook/blacksugar.png",
      "title": "Black Sugar Hojicha Latte",
      "subtitle": "16oz iced · boba · $6.50"
    },
    {
      "id": "classic-milk-tea",
      "image": "https://cdn.openai.com/API/storybook/classic.png",
      "title": "Classic Milk Tea",
      "subtitle": "16oz iced · double boba · $6.75"
    },
    {
      "id": "matcha-latte",
      "image": "https://cdn.openai.com/API/storybook/matcha.png",
      "title": "Matcha Latte",
      "subtitle": "16oz iced · boba · $6.50"
    }
  ],
  "totals": [
    {
      "label": "Subtotal",
      "value": "$19.75"
    },
    {
      "label": "Sales tax (8.75%)",
      "value": "$1.72"
    },
    {
      "label": "Total",
      "value": "$21.47",
      "emphasis": true
    }
  ]
}
```

### Purchase receipt

Order confirmation with item, totals, and delivery note. (id: `receipt`)

WIDGET TEMPLATE:

```
<Card size="sm" status={{ text: merchant, icon: "store" }} gap={3}>
  <Callout color="success" icon="check-circle" title={status}
    description={deliveryNote} />

  <Row gap={3} align="center">
    <Image src={item.image} size={56} radius="lg" frame />
    <Col flex="auto" gap={0}>
      <Text value={item.name} weight="semibold" />
      <Caption value={item.variant} />
    </Col>
    <Text value={item.price} weight="semibold" />
  </Row>

  <Divider />
  <KeyValue rows={rows} />

  <Row gap={2}>
    <Button label="View order" variant="soft" color="primary" block
      onClickAction={{ type: "order.view" }} />
    <Button iconStart="download" variant="outline" uniform
      onClickAction={{ type: "receipt.download" }} />
  </Row>
</Card>
```

WIDGET DATA:

```json
{
  "merchant": "Northwind Supply",
  "status": "Order confirmed",
  "item": {
    "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    "name": "Mechanical keyboard",
    "variant": "Brown switches · US layout",
    "price": "$139.00"
  },
  "rows": [
    {
      "label": "Order",
      "value": "#10482"
    },
    {
      "label": "Payment",
      "value": "Card ending 4242"
    },
    {
      "label": "Shipping",
      "value": "Free"
    },
    {
      "label": "Total",
      "value": "$151.16",
      "emphasis": true
    }
  ],
  "deliveryNote": "Arrives Thursday, Oct 8 · 14-day returns"
}
```

### Delivery map

Schematic map with courier route, progress steps, and drop-off details. (id: `delivery-map`)

WIDGET TEMPLATE:

```
<Card size="md" padding={0}>
  <Map markers={markers} routes={routes} height={180} radius="none" frame={false} />
  <Col padding={4} gap={3}>
    <Row align="center">
      <Col gap={0}>
        <Title value="Courier en route" size="sm" />
        <Caption value={courier} />
      </Col>
      <Spacer />
      <Badge label={eta} color="accent" icon="clock" />
    </Row>

    <Steps items={steps} current={currentStep} />
    <KeyValue rows={details} />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "eta": "12 min",
  "courier": "Marco · blue e-bike",
  "currentStep": 1,
  "steps": [
    {
      "label": "Picked up"
    },
    {
      "label": "On the way"
    },
    {
      "label": "Delivered"
    }
  ],
  "markers": [
    {
      "latitude": 37.792,
      "longitude": -122.41,
      "label": "Restaurant",
      "style": "dot",
      "color": "var(--widget-accent)"
    },
    {
      "latitude": 37.746,
      "longitude": -122.394,
      "label": "You",
      "style": "pin",
      "color": "var(--widget-danger)"
    }
  ],
  "routes": [
    {
      "coordinates": [
        [
          -122.41,
          37.792
        ],
        [
          -122.402,
          37.775
        ],
        [
          -122.396,
          37.758
        ],
        [
          -122.394,
          37.746
        ]
      ],
      "color": "var(--widget-accent)"
    }
  ],
  "details": [
    {
      "label": "Order",
      "value": "Poke bowl × 2"
    },
    {
      "label": "Drop-off",
      "value": "Leave at door"
    }
  ]
}
```

## Travel

### Trip itinerary

Cover image, weather strip, and a day-by-day timeline. (id: `trip-itinerary`)

WIDGET TEMPLATE:

```
<Card size="md" padding={0}>
  <Image src={coverImage} alt={destination} height={150} fit="cover" flush />
  <Col padding={4} gap={4}>
    <Row align="center">
      <Col gap={0}>
        <Title value={destination} size="sm" />
        <Caption value={dates} />
      </Col>
      <Spacer />
      <Button label="Edit trip" size="sm" variant="outline"
        onClickAction={{ type: "trip.edit" }} />
    </Row>

    <Row gap={2} wrap="wrap">
      <Each $of="weather" item="day">
        <Box padding={{ x: 3, y: 2 }} radius="lg" background="surface-secondary" align="center" gap={1}>
          <Caption value={day.day} />
          <Icon name={day.icon} size="md" color="secondary" />
          <Text value={day.temp} size="sm" weight="semibold" />
        </Box>
      </Each>
    </Row>

    <Timeline items={days} />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "destination": "Kyoto, Japan",
  "dates": "Apr 3 – Apr 9 · 2 travelers",
  "coverImage": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "weather": [
    {
      "day": "Thu",
      "icon": "sun",
      "temp": "68°"
    },
    {
      "day": "Fri",
      "icon": "cloud-sun",
      "temp": "64°"
    },
    {
      "day": "Sat",
      "icon": "cloud-rain",
      "temp": "59°"
    },
    {
      "day": "Sun",
      "icon": "sun",
      "temp": "70°"
    }
  ],
  "days": [
    {
      "title": "Arrive & Gion evening walk",
      "description": "Check in at the ryokan, then explore the historic geisha district.",
      "time": "Day 1",
      "icon": "landmark"
    },
    {
      "title": "Fushimi Inari & Nishiki Market",
      "description": "Early hike through the torii gates, then street food for lunch.",
      "time": "Day 2",
      "icon": "mountain"
    },
    {
      "title": "Arashiyama bamboo grove",
      "description": "Morning in the grove, afternoon river boat, onsen at night.",
      "time": "Day 3",
      "icon": "leaf"
    }
  ]
}
```

### Hotel listing

Rating, amenity chips, and nightly pricing. (id: `hotel-card`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0} onClickAction={{ type: "hotel.open", payload: { name } }}>
  <Image src={image} alt={name} height={180} fit="cover" flush />
  <Col padding={4} gap={2}>
    <Col gap={1}>
      <Row align="center">
        <Title value={name} size="sm" />
        <Spacer />
        <Rating value={rating} showValue />
      </Row>
      <Row gap={1} align="center">
        <Icon name="map-pin" size="xs" color="tertiary" />
        <Caption value={location} />
        <Caption value={`· ${reviews} reviews`} />
      </Row>
    </Col>

    <OverflowRow rows={1} gap={2}>
      <Each $of="amenities" item="amenity">
        <Badge $label="amenity" variant="outline" color="secondary" />
      </Each>
    </OverflowRow>

    <Divider />

    <Row align="baseline">
      <Title value={price} size="sm" />
      <Caption value={cadence} />
      <Spacer />
      <Button label="Book" color="accent" size="md"
        onClickAction={{ type: "hotel.book", payload: { name } }} />
    </Row>
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "name": "Sea Cliff Resort",
  "location": "Big Sur, California",
  "rating": 4.7,
  "reviews": "862",
  "amenities": [
    "Ocean view",
    "Spa",
    "Free breakfast",
    "Pool",
    "Pet friendly"
  ],
  "price": "$342",
  "cadence": "/night · 2 nights"
}
```

### Ride status

Pickup progress with driver details and live ETA. (id: `rider-status`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row align="center">
    <Col gap={0}>
      <Title value={eta} size="md" />
      <Caption value={status} />
    </Col>
    <Spacer />
    <PulseIndicator label="Live" />
  </Row>

  <Steps items={steps} current={currentStep} />

  <Callout color="neutral" icon="map-pin" description={pickup} />

  <Divider />

  <Row align="center" gap={3}>
    <Avatar src={driver.photo} name={driver.name} size={44} status="online" />
    <Col flex="auto" gap={0}>
      <Text value={driver.name} weight="semibold" size="sm" />
      <Caption value={`${driver.vehicle} · ${driver.plate}`} />
    </Col>
    <Rating value={driver.rating} showValue size="sm" />
  </Row>

  <Row gap={2}>
    <Button label="Contact" iconStart="message" variant="soft" color="primary" block
      onClickAction={{ type: "ride.contact" }} />
    <Button label="Cancel ride" variant="ghost" color="danger"
      onClickAction={{ type: "ride.cancel" }} />
  </Row>
</Card>
```

WIDGET DATA:

```json
{
  "eta": "Arriving in 4 min",
  "status": "Silver Prius · heading to pickup",
  "currentStep": 1,
  "steps": [
    {
      "label": "Requested"
    },
    {
      "label": "Pickup"
    },
    {
      "label": "En route"
    },
    {
      "label": "Arrived"
    }
  ],
  "pickup": "Pickup at 500 Howard St — meet at the corner of 1st.",
  "driver": {
    "name": "Maya R.",
    "vehicle": "Toyota Prius",
    "plate": "8XKJ421",
    "rating": 4.9,
    "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
  }
}
```

### Weather

Dark gradient conditions card with an hourly strip and detail stats. (id: `weather-now` · theme: `dark`)

WIDGET TEMPLATE:

```
<Card size="sm" theme="dark" background="linear-gradient(170deg, #24437a 0%, #0e1c33 70%)" gap={3}>
  <Row align="start">
    <Col gap={0} flex="auto">
      <Title value={city} size="sm" />
      <Caption value={condition} />
    </Col>
    <Icon name={conditionIcon} size="2xl" color="#93c5fd" />
  </Row>

  <Row align="baseline" gap={3}>
    <Title value={temperature} size="4xl" />
    <Col gap={0}>
      <Caption value={`H ${high}`} />
      <Caption value={`L ${low}`} />
    </Col>
  </Row>

  <Row gap={2}>
    <Each $of="hourly" item="hour">
      <Box flex={1} padding={{ y: 2 }} radius="lg" background="alpha-10" align="center" gap={1}>
        <Caption value={hour.time} size="sm" />
        <Icon name={hour.icon} size="sm" color="#bfdbfe" />
        <Text value={hour.temp} size="sm" weight="semibold" />
      </Box>
    </Each>
  </Row>

  <Divider />

  <Row justify="between">
    <Stat label="Wind" value={wind} size="sm" icon="wind" />
    <Stat label="Humidity" value={humidity} size="sm" icon="droplet" />
    <Stat label="UV index" value={uv} size="sm" icon="sun" />
  </Row>
</Card>
```

WIDGET DATA:

```json
{
  "city": "Seattle",
  "condition": "Light rain, clearing tonight",
  "temperature": "54°",
  "high": "58°",
  "low": "47°",
  "conditionIcon": "cloud-rain",
  "hourly": [
    {
      "time": "Now",
      "icon": "cloud-rain",
      "temp": "54°"
    },
    {
      "time": "3PM",
      "icon": "cloud-rain",
      "temp": "55°"
    },
    {
      "time": "6PM",
      "icon": "cloud",
      "temp": "53°"
    },
    {
      "time": "9PM",
      "icon": "moon",
      "temp": "50°"
    }
  ],
  "wind": "12 mph",
  "humidity": "78%",
  "uv": "2"
}
```

## Productivity

### Create task

Inline-editable text, priority chips, date picker, and submit. (id: `task-create`)

WIDGET TEMPLATE:

```
<Card size="md">
  <Form onSubmitAction={{ type: "task.create" }}>
    <Col gap={3}>
      <Text
        value={initialTitle}
        size="lg"
        weight="semibold"
        editable={{ name: "task.title", required: true, placeholder: "Task title" }}
      />
      <Text
        value={initialDescription}
        minLines={4}
        editable={{ name: "task.body", placeholder: "Describe the task..." }}
      />

      <Col gap={2}>
        <Caption value="PRIORITY" size="sm" />
        <ChipGroup name="task.priority" defaultValue="medium" options={priorities} />
      </Col>

      <Divider flush />
      <Row align="center" gap={2} wrap="wrap">
        <DatePicker name="task.due" placeholder="Due date" defaultValue={initialDueDate} clearable pill />
        <Spacer />
        <Button submit label="Create task" color="primary" />
      </Row>
    </Col>
  </Form>
</Card>
```

WIDGET DATA:

```json
{
  "initialTitle": "Investigate flaky CI",
  "initialDescription": "Track down the intermittent failure in the integration suite and propose a fix.",
  "initialDueDate": "2026-08-14",
  "priorities": [
    {
      "label": "Low",
      "value": "low"
    },
    {
      "label": "Medium",
      "value": "medium"
    },
    {
      "label": "High",
      "value": "high"
    },
    {
      "label": "Urgent",
      "value": "urgent"
    }
  ]
}
```

### Sprint progress

Progress bar with per-member status and completion stats. (id: `team-progress`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Sprint 24" size="sm" />
      <Caption value={sprint} />
    </Col>
    <Spacer />
    <Stat label="Done" value={`${completed}/${total}`} size="sm" align="end" />
  </Row>

  <Progress value={percent} label="Completion" />

  <Divider />

  <Col gap={0}>
    <Each $of="members" item="member">
      <Row align="center" gap={3} padding={{ y: 2 }}>
        <Avatar src={member.photo} name={member.name} size={36} status={member.status} />
        <Col flex="auto" gap={0}>
          <Text value={member.name} size="sm" weight="semibold" />
          <Caption value={member.done} />
        </Col>
        <Icon name="chevron-right" size="sm" color="tertiary" />
      </Row>
    </Each>
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "sprint": "Jul 21 – Aug 1 · Platform team",
  "completed": 18,
  "total": 24,
  "percent": 75,
  "members": [
    {
      "id": "m1",
      "name": "Alex Kim",
      "photo": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=300&q=80",
      "status": "online",
      "done": "6 tasks done · 1 in review"
    },
    {
      "id": "m2",
      "name": "Priya Patel",
      "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
      "status": "busy",
      "done": "7 tasks done · 2 in progress"
    },
    {
      "id": "m3",
      "name": "Sam Ortiz",
      "status": "away",
      "done": "5 tasks done"
    }
  ]
}
```

### Onboarding checklist

Interactive checklist — clicking items updates local widget state. (id: `onboarding-checklist`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Get started" size="sm" />
      <Caption $value="String(completedCount) + ' of ' + String(size(items)) + ' complete'" />
    </Col>
    <Spacer />
    <Show $when="completedCount == size(items)">
      <Badge label="All done!" color="success" icon="party-popper" />
    </Show>
  </Row>

  <Each $of="items" item="item" index="i">
    <Pressable
      padding={3}
      radius="lg"
      background={item.done ? "surface-secondary" : "surface"}
      $onClickAction='{ "patchState": set("items." + String(i) + ".done", !item.done) }'
    >
      <Row gap={3} align="center">
        <Icon
          name={item.done ? "check-circle-filled" : "empty-circle"}
          color={item.done ? "success" : "tertiary"}
          size="lg"
        />
        <Col flex="auto" gap={0}>
          <Text value={item.title} size="sm" weight="semibold"
            color={item.done ? "secondary" : "primary"} lineThrough={item.done} />
          <Caption value={item.description} />
        </Col>
      </Row>
    </Pressable>
  </Each>

  <Callout color="accent" icon="lightbulb"
    description="Tip: this checklist updates its own state locally — no server round-trip." />
</Card>
```

WIDGET DATA:

```json
{
  "completedCount": 1,
  "items": [
    {
      "id": "profile",
      "title": "Complete your profile",
      "description": "Add a photo and display name",
      "done": true
    },
    {
      "id": "invite",
      "title": "Invite a teammate",
      "description": "Collaboration works better together",
      "done": false
    },
    {
      "id": "widget",
      "title": "Create your first widget",
      "description": "Try the playground",
      "done": false
    }
  ]
}
```

### Confirm calendar event

Day column with highlighted new events and confirm actions. (id: `calendar-confirm`)

WIDGET TEMPLATE:

```
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
      <Show $when="size(events) > 0">
        <Each $of="events" item="item">
          <Row
            padding={{ x: 3, y: 2 }}
            gap={3}
            radius="xl"
            background={item.isNew ? "none" : "surface-secondary"}
            border={item.isNew ? { size: 1, color: item.color, style: "dashed" } : undefined}
          >
            <Box width={4} height="40px" radius="full" background={item.color} />
            <Col>
              <Text value={item.title} />
              <Text value={item.time} size="sm" color="tertiary" />
            </Col>
          </Row>
        </Each>
        <Show.Else>
          <EmptyState icon="calendar" title="No events" description="Nothing scheduled for this day." />
        </Show.Else>
      </Show>
    </Col>
  </Row>
</Card>
```

WIDGET DATA:

```json
{
  "date": {
    "name": "Tue",
    "number": "14"
  },
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

## Analytics

### Finance dashboard

Composed chart, balance stat with sparkline, and budget progress. (id: `finance-dashboard`)

WIDGET TEMPLATE:

```
<Card size="lg" gap={4}>
  <Row align="start">
    <Col gap={1}>
      <Stat label="Total balance" value={balance} delta={balanceDelta} deltaLabel="vs last month" size="lg" />
      <Sparkline data={spendTrend} height={36} width={180} />
    </Col>
    <Spacer />
    <SegmentedControl
      name="range"
      defaultValue="6m"
      options={[
        { label: "3M", value: "3m" },
        { label: "6M", value: "6m" },
        { label: "1Y", value: "1y" }
      ]}
      onChangeAction={{ type: "finance.range" }}
    />
  </Row>

  <Chart
    data={months}
    xAxis={{ dataKey: "month" }}
    series={[
      { type: "bar", dataKey: "income", label: "Income", color: "#6366f1" },
      { type: "bar", dataKey: "spending", label: "Spending", color: "#f43f5e" },
      { type: "line", dataKey: "savings", label: "Savings", color: "#10b981", strokeWidth: 2 }
    ]}
    height={200}
  />

  <Divider />

  <Grid columns="repeat(auto-fit, minmax(150px, 1fr))" gap={3}>
    <Each $of="budgets" item="budget">
      <Grid.Item>
        <Col gap={1}>
          <Progress value={budget.used} label={budget.label} size="sm" />
          <Caption value={budget.amount} />
        </Col>
      </Grid.Item>
    </Each>
  </Grid>
</Card>
```

WIDGET DATA:

```json
{
  "balance": "$24,860",
  "balanceDelta": "+4.2%",
  "spendTrend": [
    12,
    14,
    13,
    15,
    14,
    17,
    16,
    19,
    18,
    21
  ],
  "months": [
    {
      "month": "Feb",
      "income": 8200,
      "spending": 5100,
      "savings": 3100
    },
    {
      "month": "Mar",
      "income": 8400,
      "spending": 5600,
      "savings": 2800
    },
    {
      "month": "Apr",
      "income": 8100,
      "spending": 4900,
      "savings": 3200
    },
    {
      "month": "May",
      "income": 8900,
      "spending": 5400,
      "savings": 3500
    },
    {
      "month": "Jun",
      "income": 9200,
      "spending": 5800,
      "savings": 3400
    },
    {
      "month": "Jul",
      "income": 9600,
      "spending": 5500,
      "savings": 4100
    }
  ],
  "budgets": [
    {
      "label": "Groceries",
      "used": 72,
      "amount": "$864 of $1,200"
    },
    {
      "label": "Dining",
      "used": 45,
      "amount": "$270 of $600"
    },
    {
      "label": "Transport",
      "used": 88,
      "amount": "$352 of $400"
    }
  ]
}
```

### Traffic breakdown

Donut chart with per-slice colors and a key-value legend. (id: `traffic-donut`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Traffic sources" size="sm" />
      <Caption value="Last 7 days" />
    </Col>
    <Spacer />
    <Stat label="Total" value={total} delta={delta} size="sm" align="end" />
  </Row>

  <PieChart
    data={slices}
    series={[{ dataKey: "value", nameKey: "name", innerRadius: "62%", outerRadius: "88%" }]}
    height={180}
    showLegend={false}
  />

  <KeyValue rows={legend} />
</Card>
```

WIDGET DATA:

```json
{
  "total": "86.4K",
  "delta": "+9.6%",
  "slices": [
    {
      "name": "Organic",
      "value": 42,
      "fill": "#6366f1"
    },
    {
      "name": "Direct",
      "value": 26,
      "fill": "#0ea5e9"
    },
    {
      "name": "Referral",
      "value": 18,
      "fill": "#10b981"
    },
    {
      "name": "Social",
      "value": 14,
      "fill": "#f59e0b"
    }
  ],
  "legend": [
    {
      "label": "Organic",
      "value": "42%"
    },
    {
      "label": "Direct",
      "value": "26%"
    },
    {
      "label": "Referral",
      "value": "18%"
    },
    {
      "label": "Social",
      "value": "14%"
    }
  ]
}
```

### Usage & billing

Plan usage meters and an invoice table. (id: `usage-billing`)

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Usage" size="sm" />
      <Caption value={`${plan} · renews ${renewal}`} />
    </Col>
    <Spacer />
    <Button label="Manage plan" size="md" variant="outline" onClickAction={{ type: "billing.manage" }} />
  </Row>

  <Col gap={3}>
    <Each $of="usage" item="meter">
      <Col gap={1}>
        <Progress value={meter.used} label={meter.label} size="sm" />
        <Caption value={meter.limit} />
      </Col>
    </Each>
  </Col>

  <Divider />

  <Col gap={2}>
    <Caption value="RECENT INVOICES" size="sm" />
    <DataTable
      columns={[
        { key: "date", label: "Date" },
        { key: "amount", label: "Amount", align: "end" },
        { key: "status", label: "Status", align: "end" }
      ]}
      rows={invoices}
    />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "plan": "Pro plan",
  "renewal": "Aug 14",
  "usage": [
    {
      "label": "API requests",
      "used": 68,
      "limit": "680K of 1M requests"
    },
    {
      "label": "Storage",
      "used": 41,
      "limit": "20.5 GB of 50 GB"
    },
    {
      "label": "Seats",
      "used": 80,
      "limit": "8 of 10 seats"
    }
  ],
  "invoices": [
    {
      "date": "Jul 1, 2026",
      "amount": "$24.00",
      "status": "Paid"
    },
    {
      "date": "Jun 1, 2026",
      "amount": "$24.00",
      "status": "Paid"
    },
    {
      "date": "May 1, 2026",
      "amount": "$24.00",
      "status": "Paid"
    }
  ]
}
```

### Poll results

Grouped bar chart comparing this year's survey against last year's. (id: `poll-results`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Col gap={0}>
    <Title value={question} size="sm" />
    <Caption value={`${totalVotes} responses`} />
  </Col>

  <BarChart
    data={results}
    xAxis={{ dataKey: "option" }}
    series={[
      { dataKey: "thisYear", label: "2026", color: "#6366f1" },
      { dataKey: "lastYear", label: "2025", color: "#c7d2fe" }
    ]}
    height={190}
  />

  <Callout color="accent" icon="lightbulb"
    description="Remote-first grew 9 points year over year — the biggest shift in this survey." />
</Card>
```

WIDGET DATA:

```json
{
  "question": "Where do engineers want to work?",
  "totalVotes": "2,847",
  "results": [
    {
      "option": "Remote",
      "thisYear": 46,
      "lastYear": 37
    },
    {
      "option": "Hybrid",
      "thisYear": 38,
      "lastYear": 41
    },
    {
      "option": "Office",
      "thisYear": 16,
      "lastYear": 22
    }
  ]
}
```

## Forms

### Project setup

A multi-field form with select, chips, and a submit action. (id: `project-setup`)

WIDGET TEMPLATE:

```
<Card size="md">
  <Form onSubmitAction={{ type: "project.create" }}>
    <Col gap={4}>
      <Col gap={0}>
        <Title value="New project" size="sm" />
        <Caption value="Configure the basics — you can change these later." />
      </Col>

      <Col gap={2}>
        <Label value="Project name" fieldName="project.name" />
        <Input name="project.name" placeholder="acme-storefront" required />
      </Col>

      <Row gap={3} wrap="wrap">
        <Col flex={1} gap={2} minWidth={160}>
          <Label value="Framework" fieldName="project.framework" />
          <Select name="project.framework" options={frameworks} placeholder="Choose..." block />
        </Col>
        <Col flex={1} gap={2} minWidth={160}>
          <Label value="Region" fieldName="project.region" />
          <Select name="project.region" options={regions} placeholder="Choose..." block />
        </Col>
      </Row>

      <Col gap={2}>
        <Label value="Add-ons" fieldName="project.addons" />
        <ChipGroup name="project.addons" type="multiple" options={addons} />
      </Col>

      <Checkbox name="project.notify" label="Email me when the deployment finishes" defaultChecked />

      <Divider flush />
      <Row>
        <Spacer />
        <Button submit label="Create project" color="accent" />
      </Row>
    </Col>
  </Form>
</Card>
```

WIDGET DATA:

```json
{
  "frameworks": [
    {
      "label": "Next.js",
      "value": "nextjs"
    },
    {
      "label": "Vite + React",
      "value": "vite"
    },
    {
      "label": "Remix",
      "value": "remix"
    },
    {
      "label": "Astro",
      "value": "astro"
    }
  ],
  "regions": [
    {
      "label": "US West (Oregon)",
      "value": "us-west-2"
    },
    {
      "label": "US East (Virginia)",
      "value": "us-east-1"
    },
    {
      "label": "Europe (Frankfurt)",
      "value": "eu-central-1"
    }
  ],
  "addons": [
    {
      "label": "Analytics",
      "value": "analytics",
      "icon": "line-chart"
    },
    {
      "label": "Auth",
      "value": "auth",
      "icon": "lock"
    },
    {
      "label": "Database",
      "value": "db",
      "icon": "database"
    },
    {
      "label": "Cron jobs",
      "value": "cron",
      "icon": "clock"
    }
  ]
}
```

### Campaign composer

Steps, combobox, date picker, and textarea in a guided flow. (id: `campaign-composer`)

WIDGET TEMPLATE:

```
<Card size="md">
  <Form onSubmitAction={{ type: "campaign.schedule" }}>
    <Col gap={4}>
      <Col gap={2}>
        <Row align="center">
          <Title value="Launch campaign" size="sm" />
          <Spacer />
          <Caption $value="String(progressPercent) + '% ready'" />
        </Row>
        <Steps items={steps} current={currentStep} />
      </Col>

      <Col gap={2}>
        <Label value="Campaign name" fieldName="campaign.name" />
        <Input name="campaign.name" placeholder="Summer launch" required />
      </Col>

      <Row gap={3} wrap="wrap">
        <Col flex={1} gap={2} minWidth={170}>
          <Label value="Audience" fieldName="campaign.audience" />
          <Combobox name="campaign.audience" options={audiences} placeholder="Pick audience" />
        </Col>
        <Col flex={1} gap={2} minWidth={170}>
          <Label value="Send date" fieldName="campaign.date" />
          <DatePicker name="campaign.date" placeholder="Pick date" block />
        </Col>
      </Row>

      <Col gap={2}>
        <Label value="Channels" fieldName="campaign.channels" />
        <ToggleGroup name="campaign.channels" type="multiple" options={channels} />
      </Col>

      <Col gap={2}>
        <Label value="Message" fieldName="campaign.message" />
        <Textarea name="campaign.message" placeholder="Write the campaign message..." rows={4} />
      </Col>

      <Divider flush />
      <Row gap={2}>
        <Button label="Save draft" variant="ghost" color="primary" onClickAction={{ type: "campaign.draft" }} />
        <Spacer />
        <Button submit label="Schedule" color="accent" iconEnd="send" />
      </Row>
    </Col>
  </Form>
</Card>
```

WIDGET DATA:

```json
{
  "progressPercent": 60,
  "currentStep": 1,
  "steps": [
    {
      "label": "Audience"
    },
    {
      "label": "Content"
    },
    {
      "label": "Review"
    }
  ],
  "audiences": [
    {
      "label": "All subscribers",
      "value": "all"
    },
    {
      "label": "Active last 30 days",
      "value": "active-30"
    },
    {
      "label": "Trial users",
      "value": "trial"
    },
    {
      "label": "Churned",
      "value": "churned"
    }
  ],
  "channels": [
    {
      "label": "Email",
      "value": "email"
    },
    {
      "label": "Push",
      "value": "push"
    },
    {
      "label": "In-app",
      "value": "in-app"
    }
  ]
}
```

### Feedback survey

Radio scores, aspect chips, and a comment box. (id: `feedback-survey`)

WIDGET TEMPLATE:

```
<Card size="sm">
  <Form onSubmitAction={{ type: "feedback.submit" }}>
    <Col gap={4}>
      <Col gap={0}>
        <Title value="How was your experience?" size="sm" />
        <Caption value="Takes less than a minute." />
      </Col>

      <Col gap={2}>
        <Label value="Overall" fieldName="feedback.score" />
        <RadioGroup name="feedback.score" options={scores} direction="row" />
      </Col>

      <Col gap={2}>
        <Label value="What stood out?" fieldName="feedback.aspects" />
        <ChipGroup name="feedback.aspects" type="multiple" options={aspects} size="sm" />
      </Col>

      <Col gap={2}>
        <Label value="Anything else?" fieldName="feedback.comment" />
        <Textarea name="feedback.comment" placeholder="Optional comment..." rows={3} />
      </Col>

      <Button submit label="Send feedback" color="primary" block />
    </Col>
  </Form>
</Card>
```

WIDGET DATA:

```json
{
  "scores": [
    {
      "label": "😞",
      "value": "1"
    },
    {
      "label": "😐",
      "value": "2"
    },
    {
      "label": "🙂",
      "value": "3"
    },
    {
      "label": "🤩",
      "value": "4"
    }
  ],
  "aspects": [
    {
      "label": "Speed",
      "value": "speed",
      "icon": "bolt"
    },
    {
      "label": "Design",
      "value": "design",
      "icon": "palette"
    },
    {
      "label": "Support",
      "value": "support",
      "icon": "heart"
    },
    {
      "label": "Docs",
      "value": "docs",
      "icon": "book-open"
    }
  ]
}
```

### Verification code

OTP input with tooltip help and a submit action. (id: `verify-code`)

WIDGET TEMPLATE:

```
<Card size="sm">
  <Form onSubmitAction={{ type: "auth.verify" }}>
    <Col gap={4} align="center">
      <Box size={44} radius="full" background="surface-tertiary" align="center" justify="center">
        <Icon name="shield-check" size="lg" color="var(--widget-accent)" />
      </Box>

      <Col gap={1} align="center">
        <Title value="Enter verification code" size="sm" textAlign="center" />
        <Text value={`We sent a ${String(codeLength)}-digit code to ${phoneHint}`}
          size="sm" color="secondary" textAlign="center" />
      </Col>

      <InputOTP name="code" length={codeLength} />

      <Button submit label="Verify" color="accent" block />

      <Row gap={1} align="center">
        <Tooltip label="Didn't get a code?"
          content="Codes can take up to a minute to arrive. Check spam, or resend." />
        <Button label="Resend" size="sm" variant="ghost" color="primary"
          onClickAction={{ type: "auth.resend" }} />
      </Row>
    </Col>
  </Form>
</Card>
```

WIDGET DATA:

```json
{
  "phoneHint": "(555) 01••-••42",
  "codeLength": 6
}
```

## Media

### Playlist

Cover art, numbered tracks, and play actions. (id: `playlist`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0}>
  <Image src={bannerImage} alt="Playlist cover" height={170} fit="cover" flush />
  <Col padding={{ y: 2, x: 3 }}>
    <Show $when="size(tracks) > 0">
      <Each $of="tracks" item="item" index="index">
        <Row align="center" gap={3} padding={{ y: 1 }}>
          <Caption $value="String(index + 1)" />
          <Image src={item.cover} size={44} radius="md" />
          <Col flex="auto" gap={0}>
            <Text value={item.title} weight="semibold" size="sm" />
            <Caption value={item.artist} />
          </Col>
          <Button
            iconStart="play"
            variant="ghost"
            color="primary"
            uniform
            size="lg"
            onClickAction={{ type: "music.play", payload: { id: item.id } }}
          />
        </Row>
      </Each>
      <Show.Else>
        <EmptyState icon="music" title="Empty playlist" description="Add tracks to get started." />
      </Show.Else>
    </Show>
  </Col>
  <Col padding={{ x: 3, bottom: 3 }}>
    <Button label="Play all" iconStart="play" color="accent" pill block
      onClickAction={{ type: "music.play.all" }} />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "bannerImage": "https://widgets.chatkit.studio/kpop.png",
  "tracks": [
    {
      "id": "retrovinyl",
      "title": "retrovinyl",
      "artist": "Erik Mclean",
      "cover": "https://widgets.chatkit.studio/album01.png"
    },
    {
      "id": "neon-polaroid",
      "title": "Neon Polaroid",
      "artist": "Efe Kurnaz",
      "cover": "https://widgets.chatkit.studio/album03.png"
    },
    {
      "id": "morning-grain",
      "title": "Morning Grain",
      "artist": "Reinhart Julian",
      "cover": "https://widgets.chatkit.studio/album02.png"
    }
  ]
}
```

### Media carousel

Carousel with media items, audio player, and video embed. (id: `media-carousel`)

WIDGET TEMPLATE:

```
<Card size="md" padding={0}>
  <BaseCarousel visibleItems={1.15} gap={3} snap="mandatory" flush>
    <Each $of="photos" item="photo">
      <BaseCarousel.MediaItem
        minWidth={260}
        *media={<Image src={photo.src} alt={photo.title} height={180} fit="cover" frame />}
      >
        <Row gap={2}>
          <Favicon url={photo.favicon} />
          <Col gap={0}>
            <Text value={photo.title} weight="semibold" size="sm" />
            <Caption value={photo.source} />
          </Col>
        </Row>
      </BaseCarousel.MediaItem>
    </Each>
  </BaseCarousel>

  <Col padding={{ x: 4, y: 4 }} gap={3}>
    <AudioPlayer src={audio.src} title={audio.title} subtitle={audio.subtitle} compact />
    <YouTubeEmbed videoId={videoId} height={190} title="Video preview" />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "photos": [
    {
      "id": "p1",
      "title": "Field robotics lab",
      "src": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      "source": "Unsplash",
      "favicon": "https://www.google.com/s2/favicons?domain=unsplash.com"
    },
    {
      "id": "p2",
      "title": "Transit control wall",
      "src": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      "source": "Unsplash",
      "favicon": "https://www.google.com/s2/favicons?domain=unsplash.com"
    }
  ],
  "audio": {
    "title": "Dispatch briefing",
    "subtitle": "3 min listen",
    "src": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  "videoId": "M7lc1UVf-VE"
}
```

### Podcast episode

Audio player with chapter timeline. (id: `podcast-episode`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row gap={3} align="center">
    <Image src={cover} size={64} radius="lg" frame />
    <Col flex="auto" gap={0}>
      <Title value={title} size="sm" maxLines={2} />
      <Caption value={show} />
    </Col>
  </Row>

  <AudioPlayer src={audioSrc} title={title} subtitle={show} compact />

  <Divider />

  <Col gap={2}>
    <Caption value="CHAPTERS" size="sm" />
    <Timeline items={chapters} />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "cover": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80",
  "title": "Designing for generative UIs",
  "show": "The Interface Show · Ep. 42",
  "audioSrc": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "chapters": [
    {
      "title": "Why templates beat raw HTML",
      "time": "00:00",
      "state": "done"
    },
    {
      "title": "Design tokens for LLMs",
      "time": "12:30",
      "state": "active"
    },
    {
      "title": "Actions & state patterns",
      "time": "28:45",
      "state": "upcoming"
    },
    {
      "title": "Q&A",
      "time": "41:10",
      "state": "upcoming"
    }
  ]
}
```

### Recipe card

Photo header, rating, meta badges, and numbered steps. (id: `recipe-card`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0}>
  <Image src={image} alt={name} height={180} fit="cover" flush />
  <Col padding={4} gap={3}>
    <Col gap={1}>
      <Title value={name} size="sm" />
      <Rating value={rating} showValue count={reviews} />
    </Col>

    <Row gap={2} wrap="wrap">
      <Badge label={time} icon="clock" color="secondary" variant="outline" />
      <Badge label={calories} icon="flame" color="secondary" variant="outline" />
      <Badge label={servings} icon="utensils" color="secondary" variant="outline" />
    </Row>

    <Divider />

    <List marker="decimal" gap={2}>
      <Each $of="steps" item="step">
        <List.Item>
          <Text $value="step" size="sm" />
        </List.Item>
      </Each>
    </List>

    <Button label="Open full recipe" iconEnd="arrow-up-right" variant="soft" color="primary" block
      onClickAction={{ type: "recipe.open" }} />
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "image": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  "name": "Crispy chili tofu bowls",
  "rating": 4.7,
  "reviews": "923",
  "time": "35 min",
  "calories": "420 kcal",
  "servings": "Serves 2",
  "steps": [
    "Press and cube the tofu, then toss with cornstarch and salt.",
    "Pan-fry until golden; whisk chili-soy glaze and coat.",
    "Serve over rice with quick-pickled cucumber and scallions."
  ]
}
```

## Communication

### Notifications

Dismissible list that collapses into an empty state — all local state. (id: `notifications-inbox`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={2}>
  <Row align="center">
    <Title value="Notifications" size="sm" />
    <Spacer />
    <Show $when="size(notifications) > 0">
      <Button label="Clear all" size="sm" variant="ghost" color="primary"
        onClickAction={{ updateState: { notifications: [] } }} />
    </Show>
  </Row>

  <Show $when="size(notifications) > 0">
    <AnimateGroup $of="notifications" item="note" index="i">
      <Row key={note.id} gap={3} padding={2} radius="lg" align="start">
        <Box size={34} radius="full" background="surface-tertiary" align="center" justify="center">
          <Icon name={note.icon} size="sm" color={note.color} />
        </Box>
        <Col flex="auto" gap={0}>
          <Text value={note.title} size="sm" weight="semibold" />
          <Caption value={note.body} maxLines={2} />
          <Caption value={note.time} size="sm" />
        </Col>
        <Button iconStart="x" variant="ghost" color="primary" uniform size="sm"
          $onClickAction='{ "patchState": remove("notifications." + String(i)) }' />
      </Row>
    </AnimateGroup>
    <Show.Else>
      <EmptyState icon="bell" title="You're all caught up"
        description="New notifications will appear here." />
    </Show.Else>
  </Show>
</Card>
```

WIDGET DATA:

```json
{
  "notifications": [
    {
      "id": "n1",
      "icon": "user-plus",
      "color": "info",
      "title": "New team member",
      "body": "Priya joined the Platform team.",
      "time": "2m ago"
    },
    {
      "id": "n2",
      "icon": "check-circle",
      "color": "success",
      "title": "Deploy finished",
      "body": "storefront@1.24.0 is live in production.",
      "time": "18m ago"
    },
    {
      "id": "n3",
      "icon": "alert-triangle",
      "color": "warning",
      "title": "Usage warning",
      "body": "API requests at 82% of your monthly limit.",
      "time": "1h ago"
    }
  ]
}
```

### Contact card

Copy, email, and open-url client actions from one profile. (id: `contact-card`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row gap={3} align="center">
    <Avatar src={photo} name={name} size={52} status="online" />
    <Col flex="auto" gap={0}>
      <Title value={name} size="sm" />
      <Caption value={`${role} · ${company}`} />
    </Col>
  </Row>

  <Divider />

  <KeyValue rows={[
    { label: "Email", value: email, icon: "mail" },
    { label: "Phone", value: phone, icon: "phone" },
    { label: "Website", value: website, icon: "globe" }
  ]} />

  <Row gap={2}>
    <Button label="Copy email" iconStart="copy" variant="soft" color="primary" block
      onClickAction={{ type: "copy", handler: "client", payload: { value: email } }} />
    <Button label="Email" iconStart="send" variant="outline" color="primary"
      onClickAction={{ type: "email.mailto", handler: "client", payload: { to: email, subject: "Hello" } }} />
    <Button iconStart="external-link" variant="outline" uniform
      onClickAction={{ type: "open_url", handler: "client", payload: { url: website } }} />
  </Row>
</Card>
```

WIDGET DATA:

```json
{
  "name": "Jordan Lee",
  "role": "Solutions Architect",
  "company": "Northwind",
  "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "email": "jordan@example.com",
  "phone": "(555) 014-2830",
  "website": "https://example.com"
}
```

### Event invite

RSVP with local state plus an add-to-calendar client action. (id: `event-invite`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row align="center" gap={2}>
    <Box size={44} radius="lg" background="surface-tertiary" align="center" justify="center">
      <Icon name="calendar-days" size="lg" color="secondary" />
    </Box>
    <Col flex="auto" gap={0}>
      <Title value={title} size="sm" />
      <Caption value={`Hosted by ${host}`} />
    </Col>
  </Row>

  <KeyValue rows={[
    { label: "When", value: dateLabel, icon: "clock" },
    { label: "Where", value: location, icon: "map-pin" },
    { label: "Going", value: String(going), icon: "users" }
  ]} />

  <Text value={description} size="sm" color="secondary" />

  <Show $when="response == 'none'">
    <Row gap={2}>
      <Button label="Accept" color="success" block
        onClickAction={{ updateState: { response: "accepted" } }} />
      <Button label="Decline" variant="outline" color="danger" block
        onClickAction={{ updateState: { response: "declined" } }} />
    </Row>
    <Show.Else>
      <Col gap={2}>
        <Callout
          color={response == "accepted" ? "success" : "neutral"}
          icon={response == "accepted" ? "check-circle" : "x-circle"}
          title={response == "accepted" ? "You're going!" : "You declined"}
          action={{ label: "Undo", action: { updateState: { response: "none" } } }}
        />
        <Show $when="response == 'accepted'">
          <Button label="Add to calendar" iconStart="calendar" variant="soft" color="primary" block
            onClickAction={{ type: "add_to_calendar", handler: "client", payload: { item: { title, date_str, end_date_str, location, description } } }} />
        </Show>
      </Col>
    </Show.Else>
  </Show>
</Card>
```

WIDGET DATA:

```json
{
  "title": "Q3 platform review",
  "host": "Dana M.",
  "dateLabel": "Fri, Aug 14 · 2:00–3:00 PM",
  "date_str": "2026-08-14",
  "end_date_str": "2026-08-14",
  "location": "Golden Gate Room + Zoom",
  "description": "Quarterly review of platform metrics, roadmap checkpoints, and open questions.",
  "going": 18,
  "response": "none"
}
```

### FAQ

Accordion answers with a support callout and contact action. (id: `faq-accordion`)

WIDGET TEMPLATE:

```
<Card size="md" gap={3}>
  <Col gap={0}>
    <Title value="Frequently asked" size="sm" />
    <Caption value="Answers about plans, billing, and data." />
  </Col>

  <Accordion items={items} type="single" />

  <Callout
    color="neutral"
    icon="message"
    description="Still stuck? Our support team replies within a few hours."
    action={{ label: "Contact us", action: { type: "support.contact" } }}
  />
</Card>
```

WIDGET DATA:

```json
{
  "items": [
    {
      "id": "q1",
      "title": "Can I change plans later?",
      "content": "Yes — upgrades apply immediately and downgrades take effect at the next billing cycle."
    },
    {
      "id": "q2",
      "title": "Do unused credits roll over?",
      "content": "Credits roll over for one month on Pro and Scale plans."
    },
    {
      "id": "q3",
      "title": "How do I export my data?",
      "content": "Settings → Workspace → Export. You'll get a full JSON archive by email within minutes."
    }
  ]
}
```

## Engine

### Live status board

RunInterval ticks patch local state; Animate and Show branch the UI. (id: `live-status`)

WIDGET TEMPLATE:

```
<Card size="md" cardId="launch-control" gap={3}>
  <Scope values={{ launch: launchName }}>
    <Row align="center" gap={2}>
      <PulseIndicator label="Live" />
      <Col gap={0} flex="auto">
        <Title $value="launch" size="sm" />
        <Caption value="Control-flow primitives with local state ticks." />
      </Col>
      <RunInterval interval={5000} $onTickAction='{ "patchState": set("lastTick", tick.count) }' />
    </Row>
    <Caption $value="'Local heartbeat ticks: ' + String(state.lastTick)" />

    <Animate>
      <Animate.Item $when="healthy">
        <Callout color="success" icon="check-circle" title="All systems green"
          description="Telemetry, comms, and safety are reporting nominal." />
      </Animate.Item>
      <Animate.Item $when="!healthy">
        <Callout color="danger" icon="alert-triangle" title="Attention required"
          description="One or more systems need review before launch." />
      </Animate.Item>
    </Animate>

    <Show $when="size(agents) > 0">
      <AnimateGroup $of="agents" item="agent">
        <Row key={agent.id} gap={3} padding={2} radius="lg" background="surface-secondary" align="center">
          <Col gap={0} flex="auto">
            <Text $value="agent.name" weight="semibold" size="sm" />
            <Caption $value="agent.role" />
          </Col>
          <Badge $label="agent.status" color={agent.status == "Blocked" ? "danger" : "success"} />
        </Row>
      </AnimateGroup>
      <Show.Else>
        <LoadingIndicator label="Waiting for agents" />
      </Show.Else>
    </Show>
  </Scope>
</Card>
```

WIDGET DATA:

```json
{
  "launchName": "Orbital launch checklist",
  "healthy": true,
  "lastTick": 0,
  "agents": [
    {
      "id": "a1",
      "name": "Atlas",
      "role": "Telemetry",
      "status": "Ready"
    },
    {
      "id": "a2",
      "name": "Beacon",
      "role": "Comms",
      "status": "Watching"
    },
    {
      "id": "a3",
      "name": "Cinder",
      "role": "Safety",
      "status": "Ready"
    }
  ]
}
```

### Local state 101

The smallest stateful widget: patchState increments and appends. (id: `state-counter`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Col gap={0}>
    <Title value="Reps counter" size="sm" />
    <Caption value="Every tap patches widget state locally." />
  </Col>

  <Row align="center" justify="center" gap={4} padding={{ y: 2 }}>
    <Button iconStart="minus" variant="outline" uniform size="xl"
      $onClickAction='{ "patchState": set("count", max(count - 1, 0)) }' />
    <Title $value="String(count)" size="3xl" />
    <Button iconStart="plus" color="accent" uniform size="xl"
      $onClickAction='{ "patchState": [set("count", count + 1), append("history", "Set of " + String(count + 1))] }' />
  </Row>

  <Show $when="size(history) > 0">
    <Col gap={1}>
      <Caption value="HISTORY" size="sm" />
      <Each $of="history" item="entry">
        <Caption $value="entry" />
      </Each>
    </Col>
    <Show.Else>
      <EmptyState icon="dumbbell" title="No sets yet" description="Tap + to log your first set." padding={4} />
    </Show.Else>
  </Show>
</Card>
```

WIDGET DATA:

```json
{
  "count": 0,
  "history": []
}
```

### Route operations

Structured Table, SegmentedControl, Popover, and Pressable surfaces. (id: `route-operations`)

WIDGET TEMPLATE:

```
<Card size="md" gap={3}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Night route monitor" size="sm" />
      <Caption value="Dispatch table with mode controls and action surfaces." />
    </Col>
    <Spacer />
    <Popover>
      <Popover.Trigger onClickAction={{ type: "route.help" }}>
        <Badge label="SLA" color="info" />
      </Popover.Trigger>
      <Popover.Content side="bottom" align="end" width={240}>
        <Text value="Late stops dispatch a server action to the host app." size="sm" />
      </Popover.Content>
    </Popover>
  </Row>

  <SegmentedControl
    name="route.mode"
    defaultValue="live"
    options={[
      { label: "Live", value: "live" },
      { label: "Forecast", value: "forecast" },
      { label: "Archive", value: "archive" }
    ]}
    onChangeAction={{ type: "route.mode.change" }}
    block
  />

  <Table columnSizing="equal">
    <Table.Row header>
      <Table.Cell><Text value="Stop" size="sm" weight="semibold" /></Table.Cell>
      <Table.Cell align="center"><Text value="ETA" size="sm" weight="semibold" /></Table.Cell>
      <Table.Cell align="end"><Text value="Load" size="sm" weight="semibold" /></Table.Cell>
    </Table.Row>
    <Each $of="rows" item="row">
      <Table.Row>
        <Table.Cell><Text value={row.stop} size="sm" /></Table.Cell>
        <Table.Cell align="center"><Badge label={row.eta} color="secondary" /></Table.Cell>
        <Table.Cell align="end"><Text value={row.load} size="sm" /></Table.Cell>
      </Table.Row>
    </Each>
  </Table>

  <Pressable
    padding={3}
    radius="lg"
    background="surface-secondary"
    onClickAction={{ type: "open_url", handler: "client", payload: { url: "https://example.com/routes" } }}
  >
    <Row gap={2}>
      <Icon name="external-link" />
      <Text value="Open external route board" size="sm" weight="semibold" />
    </Row>
  </Pressable>
</Card>
```

WIDGET DATA:

```json
{
  "rows": [
    {
      "stop": "Depot",
      "eta": "Now",
      "load": "84%"
    },
    {
      "stop": "Market",
      "eta": "+8m",
      "load": "61%"
    },
    {
      "stop": "Pier",
      "eta": "+21m",
      "load": "39%"
    }
  ]
}
```

### Rich text & loading

Inline marks, icon list markers, tag overflow, and loading states. (id: `rich-text`)

WIDGET TEMPLATE:

```
<Card size="md" gap={3}>
  <Row gap={3}>
    <Box size={48} radius="xl" background="surface-secondary" align="center" justify="center">
      <Svg
        size={28}
        viewBox="0 0 24 24"
        paths={[
          { d: "M12 3l7 4v6c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z", stroke: "var(--widget-accent)" },
          { d: "M9 12l2 2 4-5", stroke: "var(--widget-accent)" }
        ]}
      />
    </Box>
    <Col gap={1}>
      <Title value="Typography toolkit" size="sm" />
      <Text value="Inline marks, semantic lists, and graceful loading placeholders." size="sm" color="secondary" />
    </Col>
  </Row>

  <Flow gap={2}>
    <Bold value="Bold" />
    <Italic value="Italic" />
    <Underline value="Underline" />
    <Code value="code()" />
    <Math value="E=mc²" />
    <Highlight value="Highlight" />
  </Flow>

  <List marker="check" gap={2}>
    <Each $of="checks" item="check">
      <List.Item>
        <Text $value="check" size="sm" />
      </List.Item>
    </Each>
  </List>

  <OverflowRow rows={1} gap={2}>
    <Each $of="tags" item="tag">
      <Badge $label="tag" variant="outline" />
    </Each>
  </OverflowRow>

  <LoadingBlock height={36} />
  <ShimmerText value="Preparing next response..." />
</Card>
```

WIDGET DATA:

```json
{
  "checks": [
    "Registry aliases include dotted child components.",
    "Client actions run locally before host callbacks.",
    "Markdown and charts load lazily."
  ],
  "tags": [
    "Animate",
    "Table",
    "Sparkline",
    "Popover",
    "Svg",
    "List",
    "Timeline"
  ]
}
```

### Tip calculator

Slider writes local state; every total recomputes from expressions. (id: `tip-calculator`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Row align="center">
    <Col gap={0}>
      <Title value="Split the bill" size="sm" />
      <Caption value={billLabel} />
    </Col>
    <Spacer />
    <Badge $label="String(read(state, 'tipValue.0', 18)) + '% tip'" color="accent" />
  </Row>

  <Slider name="tip" defaultValue={tipValue} min={0} max={30} step={1}
    $onChangeAction='{ "patchState": set("tipValue", value) }' />

  <Divider />

  <Row justify="between">
    <Stat label="Tip" $value="'$' + String(round(bill * read(state, 'tipValue.0', 18)) / 100)" size="sm" />
    <Stat label="Total" $value="'$' + String(round(bill * 100 + bill * read(state, 'tipValue.0', 18)) / 100)" size="sm" />
    <Stat label="Each (of 2)" $value="'$' + String(round((bill * 100 + bill * read(state, 'tipValue.0', 18)) / 2) / 100)" size="sm" />
  </Row>

  <Caption value="Drag the slider — totals recompute from local widget state, no server round-trip." />
</Card>
```

WIDGET DATA:

```json
{
  "bill": 84.5,
  "billLabel": "Dinner at Nari · $84.50",
  "tipValue": [
    18
  ]
}
```
