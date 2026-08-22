# Featured widget examples

The curated gallery showcase — every demo shown by the gallery's `Featured` filter as a `template` + `data` pair. Use this focused companion to `AGENTS.md` when a compact set of representative widget patterns is more useful than the complete gallery corpus.

> Generated from `src/examples/widgetExamples.ts` by `scripts/build-widget-examples-doc.mjs` — do not edit by hand.

16 featured widgets.

## Featured

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
