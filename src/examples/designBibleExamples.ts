import { z } from "zod";

const showcase = { category: "Editorial" as const, featured: true, theme: "light" as const };
const optionSchema = z.strictObject({ label: z.string(), value: z.string() });
const detailSchema = z.strictObject({ label: z.string(), value: z.string() });
const vectorPathSchema = z.strictObject({ d: z.string(), fill: z.string(), stroke: z.string() });

/** Independent compositions applying the authoring guide's design-bible principles. */
export const designBibleExamples = [
  {
    ...showcase,
    id: "bible-evidence-memo",
    title: "Evidence memo",
    description: "An answer-first evidence memo: observed results, limits, and a copyable conclusion.",
    featuredRank: 17,
    size: "sm" as const,
    template: `<Response gap={4} padding={1}>
  <Col gap={1}>
    <Caption value={eyebrow} />
    <Title value={title} size="md" />
  </Col>
  <Text value={answer} size="sm" />
  <Divider />
  <Col gap={2}>
    <Text value={evidenceTitle} size="sm" weight="semibold" />
    <Text value={evidence} size="sm" />
    <Caption value={source} />
  </Col>
  <Text value={limitation} size="sm" color="secondary" />
  <Row><Button label={copyLabel} iconStart="copy" variant="outline" size="2xl"
    onClickAction={{ type: "copy", handler: "client", payload: { value: copyText } }} /></Row>
</Response>`,
    schema: z.strictObject({
      eyebrow: z.string(), title: z.string(), answer: z.string(), evidenceTitle: z.string(),
      evidence: z.string(), source: z.string(), limitation: z.string(), copyLabel: z.string(), copyText: z.string()
    }),
    data: {
      eyebrow: "Illustrative library pilot · decision note",
      title: "Keep one quiet hour",
      answer: "Keep the Wednesday quiet hour for another four sessions, then review. The small pilot supports continuing the experiment, not a permanent schedule change.",
      evidenceTitle: "What the sample actually says",
      evidence: "18 of 24 respondents preferred the quiet session. Six wanted a separate space for conversation; the sample did not measure total attendance.",
      source: "Source: fictional pilot feedback, 24 responses across four sessions.",
      limitation: "This is a self-selected sample. We do not know whether visitors who skipped the session would agree.",
      copyLabel: "Copy decision note",
      copyText: "ILLUSTRATIVE PILOT — Keep the Wednesday quiet hour for four more sessions, then review. 18 of 24 sample respondents preferred it; six requested conversation space. Self-selected feedback does not establish overall demand."
    }
  },
  {
    ...showcase,
    id: "bible-recorder-comparison",
    title: "Audio recorder comparison",
    description: "A compact, same-field equipment comparison with a locally adjustable priority.",
    featuredRank: 18,
    size: "md" as const,
    template: `<Basic gap={4} padding={1}>
  <Col gap={1}>
    <Caption value={demoNote} />
    <Title value={title} size="sm" />
  </Col>
  <SegmentedControl name="priority" ariaLabel={priorityLabel} options={priorities} value={priority} block size="lg"
    $onChangeAction='{ updateState: { priority: value } }' />
  <Text value={priority === "carry" ? carryTakeaway : deskTakeaway} size="sm" weight="medium" />
  <Table columnSizing="equal">
    <Table.Row header><Table.Cell header><Text value={fieldLabel} size="sm" /></Table.Cell><Table.Cell header align="end"><Text value={pocketName} size="sm" /></Table.Cell><Table.Cell header align="end"><Text value={deskName} size="sm" /></Table.Cell></Table.Row>
    <Each $of="rows" item="row">
      <Table.Row><Table.Cell><Text value={row.label} size="sm" /></Table.Cell><Table.Cell align="end"><Text value={row.pocket} size="sm" /></Table.Cell><Table.Cell align="end"><Text value={row.desk} size="sm" /></Table.Cell></Table.Row>
    </Each>
  </Table>
  <Text value={limitation} size="sm" color="secondary" />
</Basic>`,
    schema: z.strictObject({
      demoNote: z.string(), title: z.string(), priorityLabel: z.string(), priorities: z.array(optionSchema),
      priority: z.enum(["carry", "desk"]), carryTakeaway: z.string(), deskTakeaway: z.string(),
      fieldLabel: z.string(), pocketName: z.string(), deskName: z.string(),
      rows: z.array(z.strictObject({ label: z.string(), pocket: z.string(), desk: z.string() })), limitation: z.string()
    }),
    data: {
      demoNote: "Fictional recorders · illustrative specifications",
      title: "Choose for how you record",
      priorityLabel: "Recording priority",
      priorities: [{ label: "Travel light", value: "carry" }, { label: "Desk setup", value: "desk" }],
      priority: "carry",
      carryTakeaway: "Pocket weighs 270 g less and includes microphones. It fits a minimal travel kit.",
      deskTakeaway: "Desk provides four inputs and USB power. It fits a fixed setup with external microphones.",
      fieldLabel: "Feature", pocketName: "Pocket", deskName: "Desk",
      rows: [
        { label: "Mass", pocket: "240 g", desk: "510 g" },
        { label: "Inputs", pocket: "2", desk: "4" },
        { label: "Built-in mic", pocket: "Yes", desk: "No" },
        { label: "Power", pocket: "2 × AA", desk: "USB-C" }
      ],
      limitation: "These invented specifications demonstrate a comparison. Sound quality and real product availability are not evaluated."
    }
  },
  {
    ...showcase,
    id: "bible-attendance-trend",
    title: "Attendance trend",
    description: "A six-point attendance trend with a visible takeaway and an exact-count alternative.",
    featuredRank: 19,
    size: "md" as const,
    template: `<Card size="md" gap={4}>
  <Col gap={1}>
    <Caption value={demoNote} />
    <Title value={title} size="sm" />
    <Text value={takeaway} size="sm" />
  </Col>
  <SegmentedControl name="view" ariaLabel={viewLabel} options={views} value={view} size="lg"
    $onChangeAction='{ updateState: { view: value } }' />
  <Show $when="view === 'chart'">
    <Col gap={1}>
      <Caption value={axisNote} />
      <LineChart data={sessions} xAxis={{ dataKey: "week" }} series={[{ dataKey: "visits", label: seriesLabel, curveType: "linear", dot: true }]} height={190} showYAxis showLegend={false} />
    </Col>
    <Show.Else><DataTable columns={columns} rows={sessions} caption={tableCaption} /></Show.Else>
  </Show>
  <Text value={limitation} size="sm" color="secondary" />
  <Caption value={source} />
</Card>`,
    schema: z.strictObject({
      demoNote: z.string(), title: z.string(), takeaway: z.string(), viewLabel: z.string(), views: z.array(optionSchema),
      view: z.enum(["chart", "values"]), axisNote: z.string(), seriesLabel: z.string(),
      sessions: z.array(z.strictObject({ week: z.string(), visits: z.number().int().nonnegative() })),
      columns: z.array(z.strictObject({ key: z.string(), label: z.string(), align: z.enum(["start", "end"]).optional() })),
      tableCaption: z.string(), limitation: z.string(), source: z.string()
    }),
    data: {
      demoNote: "Illustrative museum attendance · six equal Saturday sessions",
      title: "Visits rose from 120 to 180",
      takeaway: "The last session had 60 more visits than the first (+50%), with a small dip in week 3.",
      viewLabel: "Attendance display", views: [{ label: "Trend", value: "chart" }, { label: "Exact counts", value: "values" }],
      view: "chart", axisNote: "Visits per session · sessions W1–W6", seriesLabel: "Visits",
      sessions: [{ week: "W1", visits: 120 }, { week: "W2", visits: 144 }, { week: "W3", visits: 138 }, { week: "W4", visits: 165 }, { week: "W5", visits: 174 }, { week: "W6", visits: 180 }],
      columns: [{ key: "week", label: "Session" }, { key: "visits", label: "Visits", align: "end" }],
      tableCaption: "All six sample counts; no sessions omitted.",
      limitation: "The pattern alone cannot explain the rise. Opening hours are equal, but programming and weather are not controlled.",
      source: "Source: synthetic gate-counter fixture; visits are entries, not unique people."
    }
  },
  {
    ...showcase,
    id: "bible-reading-scenario",
    title: "Reading plan calculator",
    description: "One honest local scenario: adjust pages per day and see the remaining reading days.",
    featuredRank: 20,
    size: "sm" as const,
    template: `<Card size="sm" gap={5}>
  <Col gap={1}>
    <Caption value={demoNote} />
    <Title value={title} size="sm" />
  </Col>
  <Scope values={{ validPace: has(paceText) && Number(paceText) >= 1 && Number(paceText) <= 200 && floor(Number(paceText)) === Number(paceText) }}>
    <Show $when="validPace">
      <Stat label={resultLabel} value={String(ceil(pagesRemaining / Number(paceText))) + dayUnit} size="lg" helpText={resultNote} />
      <Show.Else><Text value={pendingLabel} size="sm" color="secondary" /></Show.Else>
    </Show>
    <Col gap={2}>
      <Label value={paceLabel} fieldName="pace" />
      <Input name="pace" inputType="number" defaultValue={paceText} size="2xl" required
        $onChangeAction='{ updateState: { paceText: value } }' />
      <Caption value={rangeNote} />
      <Show $when="!validPace"><Text value={paceError} size="sm" color="danger" /></Show>
    </Col>
  </Scope>
  <Divider />
  <KeyValue rows={details} />
  <Text value={assumption} size="sm" color="secondary" />
</Card>`,
    schema: z.strictObject({
      demoNote: z.string(), title: z.string(), resultLabel: z.string(), dayUnit: z.string(), resultNote: z.string(),
      paceLabel: z.string(), paceText: z.string(), pagesRemaining: z.number().int().positive(),
      pendingLabel: z.string(), rangeNote: z.string(), paceError: z.string(), details: z.array(detailSchema), assumption: z.string()
    }),
    data: {
      demoNote: "Illustrative reading plan · calculated locally",
      title: "A little, every day",
      resultLabel: "Reading days remaining", dayUnit: " days", resultNote: "Rounded up to finish the last page.",
      paceLabel: "Daily pace (pages per day)", paceText: "20", pagesRemaining: 240,
      pendingLabel: "Reading-day estimate not calculated.", rangeNote: "Whole pages only · 1–200 pages per day",
      paceError: "Enter a whole number from 1 to 200 to calculate reading days.",
      details: [{ label: "Pages remaining", value: "240" }, { label: "Starting point", value: "Page 61 of 300" }],
      assumption: "Assumes the same pace each reading day. Breaks add calendar days; this is a scenario, not a scheduled finish date."
    }
  },
  {
    ...showcase,
    id: "bible-zine-checklist",
    title: "Print checklist",
    description: "A practical four-step checklist that tracks only what the reader marks locally.",
    featuredRank: 21,
    size: "sm" as const,
    template: `<ListView limit={8}>
  <ListViewItem><Col gap={2}><Title value={title} size="sm" /><Text value={intro} size="sm" /><Caption value={demoNote} /></Col></ListViewItem>
  <Each $of="items" item="item" index="i">
    <ListViewItem>
      <Col flex={1} minWidth={0} gap={2} padding={{ y: 1 }}>
        <Checkbox name={item.id} label={item.title} defaultChecked={item.done}
          $onChangeAction='{ patchState: set("items." + String(i) + ".done", value) }' />
        <Box padding={{ left: 6 }}><Text value={item.detail} size="sm" color="secondary" /></Box>
      </Col>
    </ListViewItem>
  </Each>
  <ListViewItem><Col gap={2} flex={1}>
    <Row justify="between" gap={2}><Caption value={progressLabel} /><Text value={String(Number(items[0].done) + Number(items[1].done) + Number(items[2].done) + Number(items[3].done)) + countSuffix} size="sm" weight="medium" /></Row>
    <Caption value={localNote} />
  </Col></ListViewItem>
</ListView>`,
    schema: z.strictObject({
      title: z.string(), intro: z.string(), demoNote: z.string(), progressLabel: z.string(), countSuffix: z.string(), localNote: z.string(),
      items: z.tuple([
        z.strictObject({ id: z.string(), title: z.string(), detail: z.string(), done: z.boolean() }),
        z.strictObject({ id: z.string(), title: z.string(), detail: z.string(), done: z.boolean() }),
        z.strictObject({ id: z.string(), title: z.string(), detail: z.string(), done: z.boolean() }),
        z.strictObject({ id: z.string(), title: z.string(), detail: z.string(), done: z.boolean() })
      ])
    }),
    data: {
      title: "First-print checklist",
      intro: "Inspect one proof copy before committing to the full zine run.",
      demoNote: "Illustrative studio procedure",
      progressLabel: "Review progress", countSuffix: " of 4 checked", localNote: "Your checks stay in this widget.",
      items: [
        { id: "order", title: "Read in folded order", detail: "Confirm the cover, center spread, and last page land where intended.", done: false },
        { id: "edges", title: "Inspect the edges", detail: "Look for clipped page numbers, captions, and artwork on the proof.", done: false },
        { id: "type", title: "Read the smallest text", detail: "Check credits and captions at the actual printed size.", done: false },
        { id: "proof", title: "Keep the marked proof", detail: "Record any corrections before making the next version.", done: false }
      ]
    }
  },
  {
    ...showcase,
    id: "bible-shelf-search",
    title: "Knowledge search",
    description: "A bilingual local search with a useful no-results state and a working clear action.",
    featuredRank: 22,
    size: "sm" as const,
    template: `<Response gap={3} padding={1}>
  <Col gap={1}><Caption value={demoNote} /><Title value={title} size="sm" /><Text value={intro} size="sm" /></Col>
  <Search key={searchVersion} name="shelfSearch" placeholder={placeholder} defaultQuery={query} items={items} emptyText={emptyText}
    $onChangeAction='{ updateState: { query: value } }' />
  <Show $when="has(query)"><Row><Button label={clearLabel} variant="outline" size="2xl"
    $onClickAction='{ updateState: { query: "", searchVersion: searchVersion + 1 } }' /></Row></Show>
  <Show $when="has(selected)">
    <Box padding={4} background="surface-secondary" radius="md" gap={2}>
      <Text value={read(details, selected + '.title', '')} size="sm" weight="semibold" />
      <Text value={read(details, selected + '.body', '')} size="sm" />
      <Caption value={selectionNote} />
    </Box>
  </Show>
</Response>`,
    schema: z.strictObject({
      demoNote: z.string(), title: z.string(), intro: z.string(), placeholder: z.string(), emptyText: z.string(),
      clearLabel: z.string(), query: z.string(), searchVersion: z.number().int().nonnegative(), selected: z.string(), selectionNote: z.string(),
      items: z.array(z.strictObject({ id: z.string(), label: z.string(), description: z.string(), keywords: z.string(), icon: z.string(), action: z.strictObject({ updateState: z.strictObject({ selected: z.string() }) }) })),
      details: z.record(z.string(), z.strictObject({ title: z.string(), body: z.string() }))
    }),
    data: {
      demoNote: "Fictional studio shelf · three local sample records",
      title: "Find a small idea",
      intro: "Search titles or topics, then open a short reading note. Try “maps” or “装订”.",
      placeholder: "Search this sample shelf", emptyText: "No sample titles match. Try maps, type, or 装订, or clear the search.",
      clearLabel: "Clear search", query: "", searchVersion: 0, selected: "", selectionNote: "Local reading note · no external file opened",
      items: [
        { id: "maps", label: "Drawing a place", description: "Maps · 地图", keywords: "cartography maps 地图 空间", icon: "maps", action: { updateState: { selected: "maps" } } },
        { id: "binding", label: "The folded book", description: "Binding · 装订", keywords: "paper zine binding 装订 折页", icon: "book-open", action: { updateState: { selected: "binding" } } },
        { id: "type", label: "Space between letters", description: "Typography · 字体", keywords: "type typography spacing 字体 排版", icon: "square-text", action: { updateState: { selected: "type" } } }
      ],
      details: {
        maps: { title: "Drawing a place", body: "A sample note about choosing landmarks that help a reader orient themselves. Omit detail that does not help the route." },
        binding: { title: "The folded book", body: "A sample note about using a folded paper dummy to check page order before laying out a small publication." },
        type: { title: "Space between letters", body: "A sample note about comparing text at its intended size, with attention to word spacing and line length." }
      }
    }
  },
  {
    ...showcase,
    id: "bible-fictional-site-map",
    title: "Site map",
    description: "An explicitly fictional schematic paired with named positions and honest spatial limits.",
    featuredRank: 23,
    size: "sm" as const,
    template: `<Card size="sm" gap={3}>
  <Col gap={1}><Caption value={demoNote} /><Title value={title} size="sm" /><Text value={takeaway} size="sm" /></Col>
  <Map markers={markers} routes={routes} height={180} frame={false} />
  <List marker="none" gap={3}>
    <Each $of="places" item="place"><List.Item><Col gap={1}>
      <Text value={place.name} size="sm" weight="semibold" />
      <Text value={place.position} size="sm" color="secondary" />
    </Col></List.Item></Each>
  </List>
  <Text value={limitation} size="sm" color="secondary" />
</Card>`,
    schema: z.strictObject({
      demoNote: z.string(), title: z.string(), takeaway: z.string(), limitation: z.string(),
      markers: z.array(z.strictObject({ latitude: z.number(), longitude: z.number(), label: z.string(), color: z.string(), style: z.enum(["pin", "dot"]) })),
      routes: z.array(z.strictObject({ coordinates: z.array(z.tuple([z.number(), z.number()])), color: z.string() })),
      places: z.array(z.strictObject({ name: z.string(), position: z.string() }))
    }),
    data: {
      demoNote: "Fictional site · invented coordinates",
      title: "Dock → studio → garden",
      takeaway: "The studio lies between the dock in the west and the garden to the northeast.",
      markers: [
        { latitude: 37.724, longitude: -122.495, label: "Dock — west", color: "var(--widget-text-primary)", style: "pin" },
        { latitude: 37.752, longitude: -122.438, label: "Studio — center", color: "var(--widget-text-primary)", style: "pin" },
        { latitude: 37.795, longitude: -122.385, label: "Garden — northeast", color: "var(--widget-text-primary)", style: "pin" }
      ],
      routes: [{ coordinates: [[-122.495, 37.724], [-122.438, 37.752], [-122.385, 37.795]], color: "var(--widget-text-secondary)" }],
      places: [
        { name: "Dock", position: "Western marker · imagined arrival point." },
        { name: "Studio", position: "Middle marker · imagined exhibition space." },
        { name: "Garden", position: "Northeastern marker · imagined outdoor room." }
      ],
      limitation: "The line connects fictional places; it is not a walkable route. No street accuracy, distances, travel times, or accessibility claims are implied."
    }
  },
  {
    ...showcase,
    id: "bible-tidal-print",
    title: "Vector artwork",
    description: "An original vector print, with the artwork first and a working two-palette switch.",
    featuredRank: 24,
    size: "sm" as const,
    template: `<Basic gap={3}>
  <Box background={paperColor} radius="lg" padding={5} align="center">
    <Svg title={description} viewBox="0 0 240 240" size={230} paths={palette === "clay" ? clayPaths : inkPaths} />
  </Box>
  <Col gap={1}><Caption value={demoNote} /><Title value={title} size="sm" /><Text value={description} size="sm" color="secondary" /></Col>
  <SegmentedControl name="palette" ariaLabel={paletteLabel} value={palette} options={palettes} size="lg"
    $onChangeAction='{ updateState: { palette: value } }' />
  <Caption value={palette === "clay" ? clayDescription : inkDescription} />
</Basic>`,
    schema: z.strictObject({
      paperColor: z.string(), demoNote: z.string(), title: z.string(), description: z.string(), paletteLabel: z.string(),
      palette: z.enum(["clay", "ink"]), palettes: z.array(optionSchema), clayDescription: z.string(), inkDescription: z.string(),
      clayPaths: z.array(vectorPathSchema), inkPaths: z.array(vectorPathSchema)
    }),
    data: {
      paperColor: "#f4efe5", demoNote: "Original demo artwork · vector study 01", title: "Tidal forms",
      description: "Two offset circles meet a broad wave on warm paper. The visual is the deliverable; there is no hidden meaning or measured data.",
      paletteLabel: "Artwork palette", palette: "clay", palettes: [{ label: "Clay", value: "clay" }, { label: "Ink", value: "ink" }],
      clayDescription: "Clay palette: terracotta sun, cream crescent, deep blue wave.",
      inkDescription: "Ink palette: charcoal sun, paper crescent, muted gray wave.",
      clayPaths: [
        { d: "M160 79a57 57 0 1 1-114 0a57 57 0 1 1 114 0", fill: "#b95137", stroke: "none" },
        { d: "M193 62a51 51 0 1 1-102 0a51 51 0 1 1 102 0", fill: "#f4efe5", stroke: "none" },
        { d: "M20 147C64 114 91 125 128 151C160 174 193 158 220 132L220 220L20 220Z", fill: "#263d4d", stroke: "none" },
        { d: "M20 184C58 158 88 162 128 184C161 203 197 186 220 167L220 188C193 208 160 220 125 202C84 181 58 181 20 204Z", fill: "#f4efe5", stroke: "none" }
      ],
      inkPaths: [
        { d: "M160 79a57 57 0 1 1-114 0a57 57 0 1 1 114 0", fill: "#30312e", stroke: "none" },
        { d: "M193 62a51 51 0 1 1-102 0a51 51 0 1 1 102 0", fill: "#f4efe5", stroke: "none" },
        { d: "M20 147C64 114 91 125 128 151C160 174 193 158 220 132L220 220L20 220Z", fill: "#74776e", stroke: "none" },
        { d: "M20 184C58 158 88 162 128 184C161 203 197 186 220 167L220 188C193 208 160 220 125 202C84 181 58 181 20 204Z", fill: "#f4efe5", stroke: "none" }
      ]
    }
  }
];
