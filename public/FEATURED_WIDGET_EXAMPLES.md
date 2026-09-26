# Featured widget examples

The curated gallery showcase — every demo shown by the gallery's `Featured` filter as a `template` + `data` pair. Use this focused companion to [AGENTS.md](AGENTS.md) when a compact set of representative widget patterns is more useful than the complete gallery corpus.

> Generated from `src/examples/widgetExamples.ts` by `scripts/build-widget-examples-doc.mjs` — do not edit by hand.

17 featured widgets.

## Using these examples

Read the [authoring contract and design guidelines](AGENTS.md#design-guidelines) alongside these templates. Start with the closest pattern and adapt its content, data bindings, and actions to the task. Preserve the built-in control states, subtle borders, consistent gutters, and responsive sizing.

Omit explicit chart colors to use the automatic combinations: blue for one series, yellow + green for two, and blue + green + pinkish red for three. Larger sets add purple and orange without pairing yellow with orange. For pie charts, use the slice count. Keep tooltip text neutral. Check the result at compact widths, in both themes, and with keyboard interaction; examples are starting points, not a reason to add more panels or actions than the task needs.

## Featured

### Checkout

One last look at something good. (id: `checkout-summary`)

WIDGET TEMPLATE:

```
<Scope values={{ itemCountLabel: String(size(items)) + " items" }}>
<Card size="sm" gap={4}>
  <Row align="center">
    <Title value="Checkout" size="sm" />
    <Spacer />
    <Caption $value="itemCountLabel" />
  </Row>

  <Col>
    <Show $when="size(items) > 0">
      <Each $of="items" item="item">
        <Row align="center" gap={3} padding={{ y: 2 }}>
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
    <Button label="Save for later" variant="outline" color="primary" block onClickAction={{ type: "cart.save" }} />
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

### Resort guide

Rooms, dining, experiences, and arrival for a private-motu stay. (id: `resort-guide-bora-bora`)

WIDGET TEMPLATE:

```
<Scope values={{ room: rooms.find(item => item.id === roomChoice) || rooms[0], saved: rooms.find(item => item.id === savedRoom) || null }}>
  <Card size="md" padding={0} gap={0}>
    <Col padding={4} gap={2}>
      <Caption value={location} />
      <Title value={title} size="md" />
      <Text value={intro} size="sm" color="secondary" />
    </Col>
    <Col padding={{ x: 4, bottom: 3 }}>
      <BaseCarousel bind="galleryIndex" visibleItems={1} ariaLabel={labels.gallery}>
        <Each of={availableImages} item="photo">
          <BaseCarousel.MediaItem key={photo.url} src={photo.url} alt={photo.alt} height={185} fit="cover" itemPadding={0}>
            <Caption value={photo.caption} size="sm" />
          </BaseCarousel.MediaItem>
        </Each>
      </BaseCarousel>
    </Col>
    <Col padding={{ x: 4, bottom: 4 }} gap={4}>
      <Tabs bind="activeTab" tabs={tabs}>
        <Tabs.Panel id="stay">
          <Col gap={4}>
            <Col gap={2}>
              <Label value={labels.accommodation} fieldName="roomChoice" />
              <Select name="roomChoice" bind="roomChoice" options={rooms.map(item => ({ value: item.id, label: item.optionLabel }))} block size="2xl" />
            </Col>
            <Col gap={3}>
              <Text value={room.name} weight="semibold" color="emphasis" />
              <KeyValue rows={room.specs} gap={2} />
              <List marker="disc" gap={1}>
                <Each of={room.features} item="feature"><List.Item><Text value={feature} size="sm" /></List.Item></Each>
              </List>
              <Col gap={1}>
                <Caption value={labels.occupancy} />
                <Text value={room.occupancy} size="sm" />
              </Col>
              <Row wrap="wrap" gap={2}>
                <Button label={savedRoom === roomChoice ? labels.removeRoom : labels.shortlistRoom} iconStart={savedRoom === roomChoice ? 'x' : 'bookmark'} variant="outline" size="2xl" $onClickAction='{ updateState: { savedRoom: savedRoom === roomChoice ? "" : roomChoice } }' />
                <Button label={labels.roomDetails} iconEnd="arrow-up-right" variant="ghost" size="2xl" onClickAction={{ type: 'open_url', handler: 'client', payload: { url: room.url } }} />
              </Row>
              <Show when={saved !== null}>
                <Text value={labels.shortlistedPrefix + saved.name} size="sm" weight="medium" />
              </Show>
              <Caption value={labels.localOnly} />
            </Col>
            <Accordion items={amenities} type="multiple" />
          </Col>
        </Tabs.Panel>
        <Tabs.Panel id="dining">
          <Col gap={3}>
            <Text value={diningIntro} size="sm" />
            <Accordion items={restaurants} type="multiple" />
            <Text value={diningNote} size="sm" color="secondary" />
            <Button label={labels.diningDetails} iconEnd="arrow-up-right" variant="outline" size="2xl" onClickAction={{ type: 'open_url', handler: 'client', payload: { url: diningUrl } }} />
          </Col>
        </Tabs.Panel>
        <Tabs.Panel id="explore">
          <Col gap={3}>
            <Col gap={2}>
              <Label value={labels.interests} fieldName="interest" />
              <ChipGroup name="interest" bind="interest" options={interests} />
            </Col>
            <Scope values={{ filtered: experiences.filter(item => interest === 'all' || item.tags.includes(interest)) }}>
              <Caption value={pluralize(size(filtered), 'experience')} />
              <Show when={size(filtered) > 0}>
                <Accordion items={filtered} type="multiple" />
                <Show.Else>
                  <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} action={{ label: labels.resetInterests, action: { updateState: { interest: 'all' } } }} />
                </Show.Else>
              </Show>
            </Scope>
            <Text value={experienceNote} size="sm" color="secondary" />
            <InlineCitations text={experienceSourceText} sources={experienceSources} />
          </Col>
        </Tabs.Panel>
        <Tabs.Panel id="plan">
          <Col gap={4}>
            <Timeline items={arrivalSteps} gap={3} />
            <KeyValue rows={stayTimes} />
            <Accordion items={planningDetails} type="multiple" />
            <Col gap={2}>
              <Text value={labels.tripNotes} size="sm" weight="semibold" />
              <Text value={saved ? saved.name : labels.noRoom} size="sm" />
              <Row wrap="wrap" gap={2}>
                <Button label={labels.copyNotes} iconStart="copy" variant="outline" size="2xl" onClickAction={{ type: 'copy', handler: 'client', payload: { value: title + '\n' + location + '\n\n' + labels.shortlistedPrefix + (saved ? saved.name + '\n' + saved.specs.map(spec => spec.label + ': ' + spec.value).join('\n') + '\n' + saved.occupancy : labels.noRoom) + '\n\n' + copyArrival + '\n\n' + rateNote + '\n\n' + officialUrl } }} />
                <Button label={labels.emailReservations} iconStart="mail" variant="ghost" size="2xl" onClickAction={{ type: 'email.mailto', handler: 'client', payload: { to: reservationsEmail, subject: emailSubject, body: emailIntro + (saved ? '\n\nPreferred accommodation: ' + saved.name : '') + '\n\n' + emailQuestions } }} />
              </Row>
              <Caption value={labels.emailNote} />
            </Col>
            <Button label={labels.arrivalDetails} iconEnd="arrow-up-right" variant="ghost" size="2xl" onClickAction={{ type: 'open_url', handler: 'client', payload: { url: arrivalUrl } }} />
          </Col>
        </Tabs.Panel>
      </Tabs>
      <Divider />
      <Col gap={2}>
        <Row align="start" gap={2}>
          <Icon name="info" size="sm" color="secondary" />
          <Text value={rateNote} size="sm" color="secondary" />
        </Row>
        <Button label={labels.officialSite} iconEnd="arrow-up-right" color="primary" size="2xl" block onClickAction={{ type: 'open_url', handler: 'client', payload: { url: officialUrl } }} />
        <Caption value={sourceNote} size="sm" />
      </Col>
    </Col>
  </Card>
</Scope>
```

WIDGET DATA:

```json
{
  "title": "Four Seasons Resort Bora Bora",
  "location": "Motu Tehotu · French Polynesia",
  "intro": "A private-motu retreat with overwater suites, beachfront villas and lagoon views toward Mount Otemanu.",
  "officialUrl": "https://www.fourseasons.com/borabora/",
  "activeTab": "stay",
  "galleryIndex": 0,
  "roomChoice": "overwater",
  "savedRoom": "",
  "interest": "all",
  "labels": {
    "gallery": "Resort setting and accommodation gallery",
    "accommodation": "Explore accommodation",
    "occupancy": "Maximum occupancy",
    "shortlistRoom": "Shortlist this room",
    "removeRoom": "Remove from shortlist",
    "roomDetails": "Official room details",
    "shortlistedPrefix": "Shortlisted locally: ",
    "localOnly": "Your shortlist stays in this widget. No reservation is made.",
    "diningDetails": "Open official dining guide",
    "interests": "Browse by interest",
    "emptyTitle": "No experiences in this view",
    "emptyDescription": "Show all interests to browse the resort guide.",
    "resetInterests": "Show all",
    "tripNotes": "Your trip notes",
    "noRoom": "No accommodation shortlisted. Choose an option in Stay.",
    "copyNotes": "Copy trip notes",
    "emailReservations": "Draft inquiry",
    "emailNote": "Draft inquiry opens your email app; nothing is sent automatically.",
    "arrivalDetails": "Official arrival information",
    "officialSite": "Open official resort website"
  },
  "availableImages": [
    {
      "url": "https://imageio.forbes.com/specials-images/imageserve/583f0ac44bbe6f1f20e808f2/0x0.jpg?format=jpg&width=1200",
      "alt": "Aerial view of Four Seasons Resort Bora Bora and its lagoon setting.",
      "caption": "The resort and lagoon from above · Forbes"
    },
    {
      "url": "https://www.fourseasons.com/alt/img-opt/~70.880.0%2C0000-47%2C3660-3000%2C0000-1687%2C5000/publish/content/dam/fourseasons/images/web/BOR/BOR_1424_original.jpg",
      "alt": "Two-bedroom overwater suite with plunge pool at Four Seasons Resort Bora Bora.",
      "caption": "Two-bedroom overwater suite · Four Seasons"
    },
    {
      "url": "https://www.fourseasons.com/alt/img-opt/~70.1530.0%2C0000-163%2C2500-3000%2C0000-1687%2C5000/publish/content/dam/fourseasons/images/web/BOR/BOR_1448_original.jpg",
      "alt": "One-bedroom beachfront villa with private pool at Four Seasons Resort Bora Bora.",
      "caption": "One-bedroom beachfront villa · Four Seasons"
    }
  ],
  "tabs": [
    {
      "id": "stay",
      "label": "Stay"
    },
    {
      "id": "dining",
      "label": "Dining"
    },
    {
      "id": "explore",
      "label": "Explore"
    },
    {
      "id": "plan",
      "label": "Plan"
    }
  ],
  "rooms": [
    {
      "id": "overwater",
      "optionLabel": "Overwater · 1 bedroom",
      "name": "One-Bedroom Overwater Bungalow Suite",
      "specs": [
        {
          "label": "Area",
          "value": "100 m² / 1,080 sq ft"
        },
        {
          "label": "Private pool",
          "value": "No"
        }
      ],
      "features": [
        "Beach, Lagoon, Mountain and Premier Mountain view categories.",
        "An overwater option without a private plunge pool."
      ],
      "occupancy": "3 adults, or 2 adults + 2 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/"
    },
    {
      "id": "plunge",
      "optionLabel": "Plunge pool · 1 bedroom",
      "name": "One-Bedroom Overwater Suite with Plunge Pool",
      "specs": [
        {
          "label": "Area",
          "value": "104 m² / 1,120 sq ft"
        },
        {
          "label": "Private pool",
          "value": "Plunge pool"
        }
      ],
      "features": [
        "Beach-, Lagoon- and Mountain-View options.",
        "Combines an overwater stay with a private plunge pool."
      ],
      "occupancy": "3 adults, or 2 adults + 2 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/"
    },
    {
      "id": "otemanu",
      "optionLabel": "Otemanu · 1 bedroom",
      "name": "Otemanu One-Bedroom Overwater Suite",
      "specs": [
        {
          "label": "Area",
          "value": "147 m² / 1,576 sq ft"
        },
        {
          "label": "Private pool",
          "value": "Plunge pool"
        }
      ],
      "features": [
        "Mount Otemanu views.",
        "Direct lagoon access."
      ],
      "occupancy": "3 adults, or 2 adults + 2 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/specialty_overwater_bungalows/otemanu_over_water_bungalow_suite_with_plunge_pool/"
    },
    {
      "id": "herenui",
      "optionLabel": "Herenui · 2 bedrooms",
      "name": "Herenui Two-Bedroom Overwater Suite",
      "specs": [
        {
          "label": "Area",
          "value": "207 m² / 2,228 sq ft"
        },
        {
          "label": "Beds",
          "value": "1 king + 2 queens"
        },
        {
          "label": "Private pool",
          "value": "Plunge pool"
        }
      ],
      "features": [
        "Two-bedroom overwater accommodation.",
        "The king-and-two-queen arrangement distinguishes it from Poerava."
      ],
      "occupancy": "6 adults, or 2 adults + 4 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/"
    },
    {
      "id": "poerava",
      "optionLabel": "Poerava · 2 bedrooms",
      "name": "Poerava Two-Bedroom Overwater Suite",
      "specs": [
        {
          "label": "Area",
          "value": "207 m² / 2,228 sq ft"
        },
        {
          "label": "Beds",
          "value": "2 kings"
        },
        {
          "label": "Private pool",
          "value": "Plunge pool"
        }
      ],
      "features": [
        "Two-bedroom overwater accommodation.",
        "Two king beds, rather than Herenui’s king-and-two-queen arrangement."
      ],
      "occupancy": "6 adults, or 2 adults + 4 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/"
    },
    {
      "id": "villa-one",
      "optionLabel": "Beachfront villa · 1 bedroom",
      "name": "One-Bedroom Beachfront Villa Estate",
      "specs": [
        {
          "label": "Area",
          "value": "253 m² / 2,722 sq ft"
        },
        {
          "label": "Private pool",
          "value": "Yes"
        }
      ],
      "features": [
        "An enclosed garden in a beachfront setting.",
        "Lagoon and Mount Otemanu views."
      ],
      "occupancy": "3 adults, or 2 adults + 2 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/villas/one_bedroom_deluxe_fenua_beachfront_villa_with_pool/"
    },
    {
      "id": "villa-two",
      "optionLabel": "Premier villa · 2 bedrooms",
      "name": "Two-Bedroom Premier Beachfront Villa Estate",
      "specs": [
        {
          "label": "Area",
          "value": "300 m² / 3,228 sq ft"
        },
        {
          "label": "Outdoor living",
          "value": "Additional 1,000 m²"
        },
        {
          "label": "Private pool",
          "value": "Yes"
        }
      ],
      "features": [
        "Two bedrooms in a beachfront villa setting.",
        "Extensive outdoor living space."
      ],
      "occupancy": "5 adults, or 2 adults + 3 children aged 12 or younger.",
      "url": "https://www.fourseasons.com/borabora/accommodations/villas/two_bedroom_premier_moana_beachfront_villa_with_pool/"
    }
  ],
  "amenities": [
    {
      "id": "shared",
      "title": "Shared resort amenities",
      "content": "Infinity pool, Te Mahana Spa, fitness centre, tennis courts, kayaks and stand-up paddleboards. Snorkeling equipment and premium Wi-Fi are listed as complimentary. Spa treatments and excursions should be checked separately for charges and availability."
    },
    {
      "id": "family-stays",
      "title": "Staying with children",
      "content": "Tamarii Club welcomes ages 5–12 with supervised arts, crafts and games, plus a playground and shallow splash pad. Published kids’ club availability is weekends and holidays; confirm your dates. Room occupancy limits vary, especially between two-bedroom suites and villas."
    }
  ],
  "diningIntro": "From a beachfront grill to overwater Asian dining, with breakfast, Polynesian performances and private-deck experiences.",
  "diningUrl": "https://www.fourseasons.com/borabora/dining/",
  "restaurants": [
    {
      "id": "arii-moana",
      "title": "Arii Moana · Mediterranean",
      "content": "Mediterranean cuisine in a casually elegant waterside setting. Published dinner hours: 5:30–9:30 pm."
    },
    {
      "id": "fare-hoa",
      "title": "Fare Hoa · Beach bar & grill",
      "content": "Fare Hoa Beach Bar & Restaurant serves grilled favourites, seafood and steak in an open-air lagoon-beachfront setting, with toes-in-the-sand dining."
    },
    {
      "id": "vaimiti",
      "title": "Vaimiti · Asian & sunset cocktails",
      "content": "Asian cuisine in an overwater setting. Published dinner hours: 5–9:30 pm; bar hours: 5–10:30 pm."
    },
    {
      "id": "tere-nui",
      "title": "Tere Nui · Breakfast",
      "content": "Open-air breakfast restaurant overlooking Mount Otemanu. Published breakfast hours: 7–10:30 am. Daily breakfast here is listed as included in published accommodation rates; confirm your offer."
    },
    {
      "id": "oroa",
      "title": "Oro’a · Polynesian dinner & show",
      "content": "Polynesian set-menu dining with traditional dances and a fire-dance performance. Published schedule: Tuesdays and Fridays, 5:30–8:30 pm. Reconfirm the schedule for your stay."
    },
    {
      "id": "in-bungalow",
      "title": "In-bungalow · Private dining",
      "content": "24-hour room service. Special experiences include breakfast delivered by Polynesian canoe and romantic dinners on your private deck. Ask the resort about arrangements, availability and pricing."
    }
  ],
  "diningNote": "All hours are published local times, not a live schedule. Confirm opening days, experience availability and any additional charges with the resort.",
  "interests": [
    {
      "label": "All",
      "value": "all"
    },
    {
      "label": "Water",
      "value": "water",
      "icon": "waves"
    },
    {
      "label": "Spa",
      "value": "spa",
      "icon": "leaf"
    },
    {
      "label": "Family",
      "value": "family",
      "icon": "users"
    }
  ],
  "experiences": [
    {
      "id": "spa",
      "title": "Te Mahana Spa",
      "tags": [
        "spa"
      ],
      "content": "Seven treatment rooms, including two open-air pavilions and an overwater couples’ suite. Facilities include a sauna, steam room and two outdoor whirlpools. Published facility hours: 9 am–6 pm; treatment hours: 10 am–6 pm. Confirm treatment availability and charges."
    },
    {
      "id": "lagoon",
      "title": "Lagoon Sanctuary & coral ecology",
      "tags": [
        "water",
        "family"
      ],
      "content": "The sanctuary is home to more than 100 marine species. Experiences include marine-biologist-led snorkeling, coral grafting and Polynesian ecology activities for all ages. Ask about the current programme and any experience charges."
    },
    {
      "id": "safari",
      "title": "Ray & Shark Safari",
      "tags": [
        "water"
      ],
      "content": "An outrigger-canoe snorkeling excursion, with a full-day option that includes lunch on an islet. Equipment is provided. Intermediate snorkeling skills are required; discuss suitability and current conditions with the operator."
    },
    {
      "id": "water-adventures",
      "title": "Paddling, sailing & water sports",
      "tags": [
        "water"
      ],
      "content": "Kayaking, stand-up paddleboarding, guided Jet Ski tours, private sailing and deep-sea fishing are offered. Ages 15 and under require parental supervision. Confirm activity-specific restrictions, conditions, availability and pricing."
    },
    {
      "id": "kids",
      "title": "Tamarii Club · Ages 5–12",
      "tags": [
        "family"
      ],
      "content": "Kids For All Seasons provides complimentary supervised arts, crafts and games, plus a playground and shallow splash pad. Published availability is weekends and holidays. Confirm operating dates before planning around the club."
    },
    {
      "id": "diving",
      "title": "DIVEASY Dive Centre",
      "tags": [
        "water",
        "family"
      ],
      "content": "The on-site Dive Centre is operated by DIVEASY and offers options for different experience levels. Introductory children’s dive lessons are listed from age 8 during high season only. Ask the dive team about eligibility, current programmes and pricing."
    }
  ],
  "experienceNote": "These are published offerings, not confirmed activity slots. Age, skill and seasonal restrictions apply; check details before arranging an experience.",
  "experienceSourceText": "Official information: spa [1], lagoon sanctuary [2], family programmes [3] and activities [4].",
  "experienceSources": [
    {
      "id": 1,
      "label": "Te Mahana Spa",
      "host": "fourseasons.com",
      "url": "https://www.fourseasons.com/borabora/spa/"
    },
    {
      "id": 2,
      "label": "Lagoon discovery",
      "host": "fourseasons.com",
      "url": "https://www.fourseasons.com/borabora/services-and-amenities/lagoon-discovery/"
    },
    {
      "id": 3,
      "label": "Family at Four Seasons",
      "host": "fourseasons.com",
      "url": "https://www.fourseasons.com/borabora/services-and-amenities/family/"
    },
    {
      "id": 4,
      "label": "Services & amenities",
      "host": "fourseasons.com",
      "url": "https://www.fourseasons.com/borabora/services-and-amenities/"
    }
  ],
  "arrivalSteps": [
    {
      "title": "Fly Tahiti → Bora Bora",
      "description": "Approximately 45 minutes from Papeete (PPT) to Bora Bora (BOB).",
      "icon": "plane"
    },
    {
      "title": "Continue by resort boat",
      "description": "Approximately 15 minutes. Resort representatives meet arriving guests at Bora Bora Airport.",
      "icon": "ship"
    }
  ],
  "stayTimes": [
    {
      "label": "Check-in",
      "value": "3:00 pm"
    },
    {
      "label": "Check-out",
      "value": "Noon"
    }
  ],
  "planningDetails": [
    {
      "id": "contacts",
      "title": "Official resort contacts",
      "content": "Resort: +689 40 603 130. Reservations: +689 40 603 170. Use Draft inquiry below to open an email addressed to the official reservations team."
    },
    {
      "id": "confirm",
      "title": "Before you travel",
      "content": "Confirm your selected rate’s inclusions, room occupancy, flight-to-boat arrangements and any special dining or activity requests directly with the resort. Check kids’ club operating dates if family programming is important to your stay."
    }
  ],
  "arrivalUrl": "https://www.fourseasons.com/borabora/getting-here/",
  "reservationsEmail": "reservations.borabora@fourseasons.com",
  "emailSubject": "Four Seasons Resort Bora Bora — stay inquiry",
  "emailIntro": "Hello, I would like information about planning a stay at Four Seasons Resort Bora Bora. I will provide my travel dates and party details.",
  "emailQuestions": "Please advise on availability, applicable rates, breakfast and airport-transfer inclusions, and any arrangements needed before arrival. Thank you.",
  "copyArrival": "Arrival: approximately 45 minutes by air from Papeete (PPT) to Bora Bora (BOB), then a 15-minute resort boat transfer. Check-in: 3:00 pm. Check-out: noon. Confirm arrangements with the resort.",
  "rateNote": "Published rates include daily breakfast at Tere Nui and round-trip airport transfers. Confirm your offer’s terms; live rates and availability have not been checked.",
  "sourceNote": "Based on Four Seasons’ official resort pages. Services and schedules may change."
}
```

### Thinking & reasoning

Follow the thinking behind an answer. (id: `agent-thinking`)

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

Something worth making tonight. (id: `recipe-card`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0}>
  <Image src={image} alt={name} height={180} fit="cover" flush />
  <Col padding={5} gap={4}>
    <Col gap={1}>
      <Title value={name} size="sm" />
      <Rating value={rating} showValue count={reviews} />
    </Col>

    <Row gap={2} wrap="wrap">
      <Caption value={time} />
      <Caption value={calories} />
      <Caption value={servings} />
    </Row>

    <Divider />

    <List marker="decimal" gap={2}>
      <Each $of="steps" item="step">
        <List.Item>
          <Text $value="step" size="sm" />
        </List.Item>
      </Each>
    </List>

    <Button label="Open full recipe" iconEnd="arrow-up-right" color="primary" block
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

Something for the rest of your afternoon. (id: `playlist`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0}>
  <Image src={bannerImage} alt="Playlist cover" height={170} fit="cover" flush />
  <Col padding={{ y: 2, x: 3 }}>
    <Show $when="size(tracks) > 0">
      <Each $of="tracks" item="item" index="index">
        <Row align="center" gap={3} padding={{ y: 2 }}>
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

A simple, focused verification step. (id: `verify-code`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={4}>
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

The plan, the progress, and what comes next. (id: `agent-tasks`)

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

A closer look before adding to your cart. (id: `product-detail`)

WIDGET TEMPLATE:

```
<Card size="sm" padding={0}>
  <Image src={image} alt={name} height={210} fit="cover" flush />
  <Col padding={5} gap={4}>
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

    <Row align="start" gap={2}><Icon name="truck" size="sm" color="secondary" /><Caption value={shippingNote} size="sm" /></Row>

    <Row gap={2}>
      <Button
        label="Add to cart"
        color="primary"
        block
        onClickAction={{ type: "cart.add", payload: { product: name } }}
      />
      <Button
        iconStart="heart"
        ariaLabel="Save to wishlist"
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

An answer taking shape, word by word. (id: `agent-response`)

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

A quiet signal that work is underway. (id: `agent-working`)

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

Find the right plan for what comes next. (id: `pricing-plans`)

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
          border={plan.popular ? { size: 2, color: "emphasis" } : { size: 1, color: "default" }}
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

Useful answers, without the clutter. (id: `faq-accordion`)

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

Follow a delivery, from checkout to doorstep. (id: `order-tracking`)

WIDGET TEMPLATE:

```
<Card size="md" gap={5}>
  <Row align="center" justify="between" gap={3}>
    <Caption value={"Order " + orderId} />
    <Badge label="On the way" color="success" />
  </Row>
  <Col gap={1}>
    <Title value="Arriving today" size="lg" />
    <Caption value={eta + " · Your courier is 4 stops away."} />
  </Col>
  <Timeline items={events} />
  <Divider />
  <KeyValue rows={details} />
  <Button label="View live map" iconEnd="arrow-up-right" color="primary" block
    onClickAction={{ type: "order.track.map", payload: { orderId } }} />
</Card>
```

WIDGET DATA:

```json
{
  "orderId": "#84213",
  "eta": "Today, 2–4 PM",
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

Every detail of your next departure. (id: `flight-booking`)

WIDGET TEMPLATE:

```
<Card size="md" padding={0} gap={0}
  confirm={{ label: "Confirm booking", action: { type: "flight.booking.confirm", payload: { bookingId } } }}
  cancel={{ label: "Cancel", action: { type: "flight.booking.cancel", payload: { bookingId } } }}>
  <Image src={heroImage} alt="Japan destination" height={145} fit="cover" flush />
  <Col padding={5} gap={4}>
    <Col gap={1}>
      <Row align="center">
        <Title value={route} size="lg" />
        <Spacer />
        <Caption value={tripSummary} size="sm" />
      </Row>
      <Caption value={dates + " · " + guests + " guests"} />
    </Col>
    <Divider />
    <Each $of="segments" item="seg">
      <Col gap={2}>
        <Row justify="between" gap={2}>
          <Caption value={seg.flightNumber + " · " + seg.stopsLabel} size="sm" />
          <Caption value={seg.route} size="sm" />
        </Row>
        <Row justify="between" align="center" gap={3}>
          <Col gap={0}>
            <Text value={seg.departTime} weight="medium" />
            <Caption value={seg.departNote} size="sm" />
          </Col>
          <Icon name="arrow-right" size="sm" color="tertiary" />
          <Col gap={0} align="end">
            <Text value={seg.arriveTime} weight="medium" />
            <Caption value={seg.arriveNote} size="sm" />
          </Col>
        </Row>
      </Col>
    </Each>
    <Accordion items={[{ id: "fare", title: "Cabin & fare details", content: cabinClass + " · " + reviewRows[2].value + ". " + reviewRows[3].value + ". Aircraft: " + segments[0].aircraft + "." }]} />
    <Row align="center" justify="between" gap={3}>
      <Col gap={0}>
        <Text value="Total" size="sm" />
        <Caption value={priceNote} size="sm" />
      </Col>
      <Title value={totalPrice} size="sm" />
    </Row>
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "bookingId": "bk-ua-893421",
  "heroImage": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "tripSummary": "Round-trip · International",
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

A considered starting point for your project. (id: `project-setup`)

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

Clear choices when your input matters. (id: `agent-decisions`)

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

Sources, comparisons, and proposed changes. (id: `knowledge-workspace`)

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
