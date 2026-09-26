import { z } from "zod";

const showcase = { category: "Editorial" as const, featured: true, theme: "light" as const };
const strings = (names: string) => Object.fromEntries(names.split(" ").map((name) => [name, z.string()]));
const colors = z.strictObject({ light: z.string(), dark: z.string() });
const option = z.strictObject({ label: z.string(), value: z.string() });
const tab = z.strictObject({ id: z.string(), label: z.string(), icon: z.string().optional() });
const detail = z.strictObject({ label: z.string(), value: z.string() });
const status = z.enum(["pending", "running", "completed", "failed", "cancelled"]);
const step = z.strictObject({ label: z.string(), detail: z.string(), status });
const task = z.strictObject({ id: z.string(), label: z.string(), detail: z.string(), status });
const source = z.strictObject({ id: z.number(), label: z.string(), host: z.string() });
const contextItem = z.strictObject({ id: z.string(), title: z.string(), excerpt: z.string(), source: z.strictObject({ label: z.string(), type: z.string() }) });
const tool = z.strictObject({ id: z.string(), type: z.enum(["read", "search", "write"]), label: z.string(), detail: z.string(), status });
const column = z.strictObject({ key: z.string(), label: z.string(), align: z.enum(["start", "end"]).optional() });

/** Rich, independently authored examples using only the existing Widgets registry. */
export const designBibleRichExamples = [
  {
    ...showcase, id: "bible-research-replay", title: "Research, in the open", featuredRank: 25, size: "md" as const,
    description: "A research desk pairs a stable synthesis with a bounded scripted replay, public workflow summaries, tool activity, and inspectable sample sources.",
    template: `<Card size="md" padding={0} gap={0}>
  <Col padding={4} gap={3}>
    <Row gap={2} wrap="wrap"><Icon name="compass" /><Caption value={sampleLabel} /></Row>
    <Title value={title} size="md" />
    <Text value={takeaway} size="sm" />
  </Col>
  <Col padding={4} gap={4}>
    <Row wrap="wrap" gap={2}>
      <Button label={playing ? replayingLabel : replayLabel} iconStart="play" color="accent" disabled={playing}
        onClickAction={{ updateState: { playing: true, frame: 0, run: run + 1 } }} />
      <Button label={completeLabel} variant="ghost" color="secondary" onClickAction={{ updateState: { playing: false, frame: 3 } }} />
    </Row>
    <Show $when="playing"><RunInterval interval={1400} $onTickAction='{ updateState: { frame: min(3, frame + 1), playing: frame < 2 } }' /></Show>
    <Tabs key="research-views" tabs={tabs} defaultTab="activity">
      <Tabs.Panel id="answer"><Col gap={3}>
        <Show $when="playing"><Row gap={2}><Orb variant="C2" color="accent" size={20} /><ThinkingState label={frames[frame].label} active /></Row></Show>
        <StreamingText key={run} text={answer} streaming={playing} speed={14} loop={false} sources={sources} />
        <InlineCitations text={evidence} sources={sources} />
      </Col></Tabs.Panel>
      <Tabs.Panel id="activity"><Col gap={3}>
        <ThinkingReasoning summary={traceTitle} steps={frames[frame].steps} active={false} defaultOpen />
        <ToolChips summary={toolTitle} items={frames[frame].tools} defaultOpen
          $onItemClickAction='{ updateState: { inspected: item.id } }' />
        <Show $when="has(inspected)"><Text value={read(toolNotes, inspected, '')} size="sm" /></Show>
        <Progress value={frame} max={3} label={frameLabel} color="accent" />
      </Col></Tabs.Panel>
      <Tabs.Panel id="sources"><ContextCards title={sourceTitle} items={contexts} /></Tabs.Panel>
    </Tabs>
  </Col>
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title takeaway replayingLabel replayLabel completeLabel answer evidence traceTitle toolTitle inspected frameLabel sourceTitle"), playing: z.boolean(), frame: z.number().int().min(0).max(3), run: z.number().int(), tabs: z.array(tab), sources: z.array(source), contexts: z.array(contextItem), toolNotes: z.record(z.string(), z.string()), frames: z.array(z.strictObject({ label: z.string(), steps: z.array(step), tools: z.array(tool) })) }),
    data: {
      sampleLabel: "Scripted demo · public workflow", title: "A morning worth testing",
      takeaway: "Start with one morning workshop. The sample suggests a scheduling preference, not proof of stronger demand.",

      replayLabel: "Replay research", replayingLabel: "Replaying…", completeLabel: "Show complete", playing: false, frame: 3, run: 0,
      answer: "In this fictional 12-person survey, eight people prefer mornings and four prefer evenings. A one-session pilot would test whether that preference translates into attendance. Keep an evening option in the next survey.",
      evidence: "The sample preference is 8 of 12 [1]; the room note leaves both periods possible [2].",
      traceTitle: "Public workflow summary", toolTitle: "2 sample tool records", inspected: "", frameLabel: "Replay frames", sourceTitle: "The two sample excerpts",
      tabs: [{ id: "answer", label: "Answer", icon: "message" }, { id: "activity", label: "Activity", icon: "activity" }, { id: "sources", label: "Sources", icon: "document" }],
      sources: [{ id: 1, label: "Sample survey", host: "local fixture" }, { id: 2, label: "Sample room note", host: "local fixture" }],
      contexts: [
        { id: "survey", title: "Preference is not attendance", excerpt: "Twelve sample responses: 8 morning, 4 evening. Respondents selected a preferred time; no tickets were offered.", source: { label: "Fictional survey", type: "NOTE" } },
        { id: "room", title: "Both windows remain possible", excerpt: "The sample room plan leaves one morning and one evening window open for discussion. This is not venue availability.", source: { label: "Fictional room note", type: "NOTE" } }
      ],
      toolNotes: { survey: "The replay reads a fixed 12-response survey fixture. It does not contact a survey service.", room: "The replay reads the supplied fictional room note. It makes no calendar query." },
      frames: [
        { label: "Replaying: read the survey", steps: [{ label: "Read the sample", detail: "Locate the preference count", status: "running" }, { label: "Check the scope", detail: "Separate preference from attendance", status: "pending" }], tools: [{ id: "survey", type: "read", label: "Read sample survey", detail: "12 responses", status: "running" }, { id: "room", type: "read", label: "Read room note", detail: "2 possible windows", status: "pending" }] },
        { label: "Replaying: inspect the room note", steps: [{ label: "Read the sample", detail: "8 morning, 4 evening", status: "completed" }, { label: "Check the scope", detail: "No reservation or attendance data", status: "running" }], tools: [{ id: "survey", type: "read", label: "Read sample survey", detail: "12 responses", status: "completed" }, { id: "room", type: "read", label: "Read room note", detail: "2 possible windows", status: "running" }] },
        { label: "Replaying: assemble the summary", steps: [{ label: "Read the sample", detail: "8 morning, 4 evening", status: "completed" }, { label: "Check the scope", detail: "One small pilot is the next test", status: "completed" }], tools: [{ id: "survey", type: "read", label: "Read sample survey", detail: "12 responses", status: "completed" }, { id: "room", type: "read", label: "Read room note", detail: "2 possible windows", status: "completed" }] },
        { label: "Replay complete", steps: [{ label: "Read the sample", detail: "8 morning, 4 evening", status: "completed" }, { label: "Check the scope", detail: "Preference does not establish demand", status: "completed" }], tools: [{ id: "survey", type: "read", label: "Read sample survey", detail: "12 responses", status: "completed" }, { id: "room", type: "read", label: "Read room note", detail: "2 possible windows", status: "completed" }] }
      ]
    }
  },
  {
    ...showcase, id: "bible-release-review", title: "A patch you can inspect", featuredRank: 26, size: "md" as const,
    description: "A release-review surface separates changed lines, the resulting configuration, and a local review decision without implying deployment.",
    template: `<Card size="md" gap={4}>
  <Box gap={2}>
    <Row gap={2}><Icon name="code" /><Caption value={sampleLabel} /></Row>
    <Title value={title} size="sm" /><Text value={takeaway} size="sm" />
  </Box>
  <Tabs tabs={tabs}>
    <Tabs.Panel id="changes"><FileDiff file={file} rows={diffRows} language="json" compact /></Tabs.Panel>
    <Tabs.Panel id="result"><CodeBlock file={file} code={code} language="json" /></Tabs.Panel>
    <Tabs.Panel id="checks"><TaskList title={checksTitle} items={checks} defaultOpen /></Tabs.Panel>
  </Tabs>
  <Show $when="decision === ''">
    <ApprovalCard title={approvalTitle} description={approvalNote} options={choices} allowOther={false} defaultValue="approve"
      approveLabel={recordLabel} $approveAction='{ updateState: { decision: value } }' />
    <Show.Else><Col gap={3}>
      <Callout color={decision === "approve" ? "info" : "warning"} title={decision === "approve" ? approvedTitle : reviseTitle} description={decisionNote} />
      <Row><Button label={resetLabel} variant="outline" onClickAction={{ updateState: { decision: "" } }} /></Row>
    </Col></Show.Else>
  </Show>
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title takeaway file code checksTitle approvalTitle approvalNote recordLabel decision approvedTitle reviseTitle decisionNote resetLabel"), tabs: z.array(tab), diffRows: z.array(z.strictObject({ oldLine: z.number().optional(), newLine: z.number().optional(), type: z.enum(["context", "add", "remove"]), text: z.string() })), checks: z.array(task), choices: z.array(z.strictObject({ label: z.string(), value: z.string(), description: z.string() })) }),
    data: {
      sampleLabel: "Sample patch · local review", title: "Say what the button does", takeaway: "Replace “Submit” with “Copy summary” so the label describes the existing clipboard action.",

      tabs: [{ id: "changes", label: "Changes" }, { id: "result", label: "Result" }, { id: "checks", label: "Checks" }], file: "sample-action.json",
      diffRows: [{ oldLine: 1, newLine: 1, type: "context", text: "{" }, { oldLine: 2, type: "remove", text: '  "label": "Submit",' }, { newLine: 2, type: "add", text: '  "label": "Copy summary",' }, { oldLine: 3, newLine: 3, type: "context", text: '  "type": "copy"' }, { oldLine: 4, newLine: 4, type: "context", text: "}" }],
      code: '{\n  "label": "Copy summary",\n  "type": "copy"\n}', checksTitle: "Sample review notes",
      checks: [{ id: "verb", label: "Specific verb", detail: "Copy names the local operation", status: "completed" }, { id: "scope", label: "No execution claim", detail: "The wording does not imply a send", status: "completed" }],
      approvalTitle: "Record your review", approvalNote: "This changes only the decision shown here.",
      choices: [{ label: "Wording is clear", value: "approve", description: "Keep the proposed label" }, { label: "Needs another pass", value: "revise", description: "Leave the sample under review" }],
      recordLabel: "Record choice", decision: "", approvedTitle: "Wording accepted locally", reviseTitle: "Another pass requested", decisionNote: "The sample file has not been written, committed, or deployed.", resetLabel: "Revisit decision"
    }
  },
  {
    ...showcase, id: "bible-field-guide", title: "A field guide with a path", featuredRank: 27, size: "lg" as const,
    description: "A knowledge workspace combines working breadcrumb navigation, a responsive sidebar, a selected guide, and optional process detail.",
    template: `<Basic gap={4}>
  <Box gap={2}>
    <Caption value={sampleLabel} />
    <Row wrap="wrap" gap={1}>
      <Show $when="page !== 'home'"><Button label={workspace} size="sm" variant="ghost" onClickAction={{ updateState: { page: "home" } }} /><Icon name="chevron-right" size="xs" /><Text value={pages[page].title} size="sm" weight="semibold" /><Show.Else><Text value={workspace} size="sm" weight="semibold" /></Show.Else></Show>
    </Row>
  </Box>
  <Grid columns="repeat(auto-fit, minmax(min(100%, 220px), 1fr))" gap={4}>
    <SidebarNav workspace={workspace} workspaceIcon="notebook" sections={[{ label: navLabel, items: navItems.map((item) => ({ id: item.id, label: item.label, icon: item.icon, active: page === item.id })) }]}
      $onNavigateAction='{ updateState: { page: id } }' />
    <Col gap={3} minWidth={0}>
      <Title value={pages[page].title} size="md" />
      <Text value={pages[page].summary} size="sm" />
      <Markdown value={pages[page].body} />
      <Show $when="page === 'fold'"><Timeline items={foldSteps} /></Show>
      <Show $when="page === 'bind'"><CodeBlock code={bindingNote} language="text" file={bindingFile} showLineNumbers={false} /></Show>
      <Sheet triggerLabel={helpLabel} title={helpTitle} description={helpDescription} content={helpBody} />
    </Col>
  </Grid>
</Basic>`,
    schema: z.strictObject({ ...strings("sampleLabel workspace page navLabel bindingNote bindingFile helpLabel helpTitle helpDescription helpBody"), navItems: z.array(z.strictObject({ id: z.string(), label: z.string(), icon: z.string() })), pages: z.record(z.string(), z.strictObject({ title: z.string(), summary: z.string(), body: z.string() })), foldSteps: z.array(z.strictObject({ title: z.string(), description: z.string(), time: z.string(), icon: z.string() })) }),
    data: {
      sampleLabel: "Sample studio library", workspace: "Paper field guide", page: "fold", navLabel: "Guides",

      navItems: [{ id: "home", label: "Start here", icon: "home" }, { id: "fold", label: "Make a dummy", icon: "layers" }, { id: "bind", label: "Record a binding", icon: "book-open" }],
      pages: {
        home: { title: "Small books start on paper", summary: "Use a blank folded copy to decide page order before styling a finished layout.", body: "Choose **Make a dummy** for the sequence, or **Record a binding** for a copyable studio note." },
        fold: { title: "Make a paper dummy", summary: "A rough folded copy reveals page order and the center spread before the artwork goes in.", body: "Keep it intentionally plain. Number the pages in reading order, then unfold the sheet to inspect the arrangement." },
        bind: { title: "Record the construction", summary: "A short note makes the next sample reproducible.", body: "Record what you actually used. The example below is a **fictional studio sample**, not a print specification for a real job." }
      },
      foldSteps: [{ title: "Fold a blank sheet", description: "Match the intended reading format.", time: "1", icon: "layers" }, { title: "Number in reading order", description: "Include the front and back covers.", time: "2", icon: "write" }, { title: "Unfold and inspect", description: "Compare the two sides before laying out pages.", time: "3", icon: "eye" }],
      bindingNote: "Sample A\n8 pages · folded sheet\nCover: warm white\nCheck: page order before artwork", bindingFile: "studio-note.txt",
      helpLabel: "About this guide", helpTitle: "A guide that stays small", helpDescription: "Three local pages, one useful sequence.", helpBody: "The sidebar changes the selected page. The breadcrumb returns to the start. Notes remain available to copy, and this panel contains optional context rather than the main instruction."
    }
  },
  {
    ...showcase, id: "bible-draft-desk", title: "A source-aware drafting desk", featuredRank: 28, size: "md" as const,
    description: "A drafting desk uses a real source picker and composer to assemble a deterministic local brief preview, with removable sample context and a copy action.",
    template: `<Card size="md" padding={0} gap={0}>
  <Col padding={4} gap={3}>
    <Row gap={3}><Avatar name={editorName} size={42} /><Col gap={0}><Caption value={sampleLabel} /><Title value={title} size="sm" /></Col></Row>
    <Text value={intro} size="sm" />
  </Col>
  <Col padding={4} gap={4}>
    <PromptBar name="draftPrompt" defaultValue={initialDraft} placeholder={placeholder} rows={3} sources={sources} selectedSources={[selectedSource]}
      attachments={attachments} removeAttachmentAction={{ updateState: { attachments: [] } }}
      $sourceAction='{ updateState: { selectedSource: value } }'
      $submitAction='{ updateState: { preview: value, previewSource: selectedSource } }' />
    <Text value={submitNote} size="sm" color="secondary" />
    <Box background="surface-secondary" padding={3} radius="md" gap={1}><Caption value={contextLabel} /><Text value={sourceNotes[selectedSource]} size="sm" /></Box>
    <Show $when="has(preview)">
      <Col gap={3}><Row gap={2}><Badge label={draftLabel} color="accent" /><Text value={previewSource} size="sm" color="secondary" /></Row>
        <TextResponse value={preview} />
        <Row><Button label={copyLabel} iconStart="copy" color="accent" onClickAction={{ type: "copy", handler: "client", payload: { value: preview + "\\n\\nContext: " + sourceNotes[previewSource] } }} /></Row>
      </Col>
      <Show.Else><EmptyState icon="write" title={emptyTitle} description={emptyDescription} padding={3} /></Show.Else>
    </Show>
  </Col>
</Card>`,
    schema: z.strictObject({ ...strings("editorName sampleLabel title intro initialDraft placeholder selectedSource submitNote contextLabel preview previewSource draftLabel copyLabel emptyTitle emptyDescription"), sources: z.array(z.strictObject({ id: z.string(), label: z.string(), description: z.string(), icon: z.string() })), attachments: z.array(z.strictObject({ id: z.string(), name: z.string(), type: z.string(), size: z.string() })), sourceNotes: z.record(z.string(), z.string()) }),
    data: {
      editorName: "Mara Lin", sampleLabel: "Sample studio · local draft", title: "Give the brief some context", intro: "Choose a source note, write the brief, then preview the exact text before copying it.",

      initialDraft: "Invite six people to a small print swap. Ask each person to bring one print and a short note about how it was made.", placeholder: "Write a brief to preview locally", selectedSource: "Print swap",
      sources: [{ id: "Print swap", label: "Print swap", description: "Six guests · one print each", icon: "images" }, { id: "Open studio", label: "Open studio", description: "A casual visit · work in progress", icon: "palette" }],
      sourceNotes: { "Print swap": "Sample plan: six guests, one print each, a short introduction, then an informal exchange.", "Open studio": "Sample plan: show three works in progress and leave time for questions. No date or venue is booked." },
      attachments: [{ id: "sample-note", name: "sample-note.txt", type: "Text", size: "Local excerpt" }],
      submitNote: "The Send arrow previews your text here; nothing is sent or generated.", contextLabel: "Selected source note", preview: "Invite six people to a small print swap. Ask each person to bring one print and a short note about how it was made.", previewSource: "Print swap", draftLabel: "Draft", copyLabel: "Copy brief + context", emptyTitle: "Your preview goes here", emptyDescription: "The original wording is preserved; the selected source is attached as context."
    }
  },
  {
    ...showcase, id: "bible-handoff-replay", title: "A handoff in three stages", featuredRank: 29, size: "md" as const,
    description: "A training replay makes task stages, bounded playback, and the final handoff visible through Steps, TaskRows, Flowchart, and measured replay progress.",
    template: `<Response gap={4}>
  <Box gap={2}>
    <Caption value={sampleLabel} /><Title value={title} size="sm" /><Text value={takeaway} size="sm" />
  </Box>
  <Steps items={stageLabels} current={min(frame, 2)} color="accent" />
  <Tabs tabs={tabs}>
    <Tabs.Panel id="replay"><Col gap={3}>
      <Show $when="playing"><LoadingState label={frames[frame].label} variant="orbit" /><RunInterval interval={1700} $onTickAction='{ updateState: { frame: min(3, frame + 1), playing: frame < 2 } }' /><Show.Else><Text value={frames[frame].label} size="sm" weight="semibold" /></Show.Else></Show>
      <TaskRows items={frames[frame].tasks} variant="list" />
      <Progress value={frame} max={3} label={progressLabel} color="accent" />
      <Row gap={2} wrap="wrap"><Button label={playLabel} color="accent" disabled={playing} onClickAction={{ updateState: { frame: 0, playing: true } }} /><Button label={finishLabel} variant="ghost" onClickAction={{ updateState: { frame: 3, playing: false } }} /></Row>
    </Col></Tabs.Panel>
    <Tabs.Panel id="method"><Col gap={3}><Flowchart nodes={nodes} edges={edges} $onNodeClickAction='{ updateState: { selectedNode: id } }' /><Box padding={{ x: 3 }}><Text value={nodeNotes[selectedNode]} size="sm" color="secondary" /></Box></Col></Tabs.Panel>
  </Tabs>
  <Box background="surface-secondary" padding={3} radius="md" gap={1}><Caption value={resultLabel} /><Text value={result} size="sm" /></Box>
</Response>`,
    schema: z.strictObject({ ...strings("sampleLabel title takeaway progressLabel playLabel finishLabel selectedNode resultLabel result"), playing: z.boolean(), frame: z.number().int().min(0).max(3), stageLabels: z.array(z.strictObject({ label: z.string() })), tabs: z.array(tab), frames: z.array(z.strictObject({ label: z.string(), tasks: z.array(task) })), nodes: z.array(z.strictObject({ id: z.string(), label: z.string(), description: z.string(), kind: z.enum(["trigger", "action", "result"]), icon: z.string() })), edges: z.array(z.strictObject({ from: z.string(), to: z.string(), label: z.string(), tone: z.string() })), nodeNotes: z.record(z.string(), z.string()) }),
    data: {
      sampleLabel: "Scripted training demo", title: "Make the next step obvious", takeaway: "A useful handoff names the owner, the next action, and the evidence they need.",

      stageLabels: [{ label: "Inspect" }, { label: "Arrange" }, { label: "Hand off" }], tabs: [{ id: "replay", label: "Replay" }, { id: "method", label: "Method" }], playing: false, frame: 3,
      progressLabel: "Replay frames", playLabel: "Play stages", finishLabel: "Show final frame", selectedNode: "inspect", resultLabel: "Sample handoff",
      result: "Mara owns the next proof. Check the center spread against the folded dummy, then return the marked copy to Jules.",
      frames: [
        { label: "Replaying: inspect the inputs", tasks: [{ id: "inspect", label: "Inspect", detail: "Read the supplied proof note", status: "running" }, { id: "arrange", label: "Arrange", detail: "Name owner and next action", status: "pending" }, { id: "handoff", label: "Hand off", detail: "Package the reference", status: "pending" }] },
        { label: "Replaying: arrange the work", tasks: [{ id: "inspect", label: "Inspect", detail: "Scope is one center spread", status: "completed" }, { id: "arrange", label: "Arrange", detail: "Mara checks; Jules receives", status: "running" }, { id: "handoff", label: "Hand off", detail: "Package the reference", status: "pending" }] },
        { label: "Replaying: package the handoff", tasks: [{ id: "inspect", label: "Inspect", detail: "Scope is one center spread", status: "completed" }, { id: "arrange", label: "Arrange", detail: "Mara checks; Jules receives", status: "completed" }, { id: "handoff", label: "Hand off", detail: "Attach the marked proof", status: "running" }] },
        { label: "Replay complete", tasks: [{ id: "inspect", label: "Inspect", detail: "Scope is one center spread", status: "completed" }, { id: "arrange", label: "Arrange", detail: "Mara checks; Jules receives", status: "completed" }, { id: "handoff", label: "Hand off", detail: "Reference named in sample", status: "completed" }] }
      ],
      nodes: [{ id: "inspect", label: "Inspect the input", description: "What changed?", kind: "trigger", icon: "eye" }, { id: "arrange", label: "Name the action", description: "Who needs to do what?", kind: "action", icon: "users" }, { id: "handoff", label: "Include the evidence", description: "What will they inspect?", kind: "result", icon: "paperclip" }],
      edges: [{ from: "inspect", to: "arrange", label: "define", tone: "info" }, { from: "arrange", to: "handoff", label: "support", tone: "info" }],
      nodeNotes: { inspect: "Read the original note before deciding what changed.", arrange: "One named owner and one concrete action reduce ambiguity.", handoff: "Name the exact reference, such as the marked proof, rather than saying “see above”." }
    }
  },
  {
    ...showcase, id: "bible-workshop-analytics", title: "The workshop attendance lab", featuredRank: 30, size: "md" as const,
    description: "An analytics study uses distinct, same-unit trend, capacity, mix, and exact-record views to explain four sample sessions without chart duplication.",
    template: `<Card size="md" gap={4}>
  <Box gap={3}>
    <Caption value={sampleLabel} /><Title value={title} size="sm" />
    <Row gap={5} wrap="wrap"><Stat label={totalLabel} value={totalValue} size="md" /><Stat label={fillLabel} value={fillValue} size="md" /></Row>
    <Text value={takeaway} size="sm" />
  </Box>
  <Tabs tabs={tabs}>
    <Tabs.Panel id="trend"><Col gap={2}><Caption value={trendLabel} /><AreaChart data={sessions} xAxis={{ dataKey: "week" }} series={[{ dataKey: "attended", label: "Attended", curveType: "linear" }]} height={185} showYAxis showLegend={false} /></Col></Tabs.Panel>
    <Tabs.Panel id="capacity"><Col gap={2}><Caption value={capacityLabel} /><Chart data={sessions} xAxis={{ dataKey: "week" }} series={[{ type: "bar", dataKey: "seats", label: "Seats" }, { type: "line", dataKey: "attended", label: "Attended", curveType: "linear" }]} height={185} showYAxis /></Col></Tabs.Panel>
    <Tabs.Panel id="mix"><Col gap={2}><Caption value={mixLabel} /><PieChart data={mix} series={[{ dataKey: "count", nameKey: "name", innerRadius: 42 }]} height={155} showLegend={false} /><KeyValue rows={mixValues} /></Col></Tabs.Panel>
    <Tabs.Panel id="data"><RecordsTable columns={columns} rows={sessions} defaultSortKey="week" caption={recordNote} /></Tabs.Panel>
  </Tabs>
  <Text value={scopeNote} size="sm" color="secondary" />
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title totalLabel totalValue fillLabel fillValue takeaway trendLabel capacityLabel mixLabel recordNote scopeNote"), tabs: z.array(tab), sessions: z.array(z.strictObject({ week: z.string(), attended: z.number(), seats: z.number() })), mix: z.array(z.strictObject({ name: z.string(), count: z.number() })), mixValues: z.array(detail), columns: z.array(column) }),
    data: {
      sampleLabel: "Sample register · W1–W4", title: "More of the room is filling", totalLabel: "Attendance entries", totalValue: "112", fillLabel: "Seats filled", fillValue: "70%",
      takeaway: "Attendance rose in each session. Across four equally sized sessions, 112 of 160 seats were filled.",

      tabs: [{ id: "trend", label: "Trend" }, { id: "capacity", label: "Capacity" }, { id: "mix", label: "Mix" }, { id: "data", label: "Data" }],
      sessions: [{ week: "W1", attended: 22, seats: 40 }, { week: "W2", attended: 26, seats: 40 }, { week: "W3", attended: 30, seats: 40 }, { week: "W4", attended: 34, seats: 40 }],
      trendLabel: "Attendance entries per weekly session", capacityLabel: "Available seats and attendance · same count scale", mixLabel: "Where the 112 entries came from",
      mix: [{ name: "Members", count: 56 }, { name: "Guests", count: 34 }, { name: "Walk-ins", count: 22 }],
      mixValues: [{ label: "Members", value: "56" }, { label: "Guests", value: "34" }, { label: "Walk-ins", value: "22" }],
      columns: [{ key: "week", label: "Week" }, { key: "attended", label: "Attended", align: "end" }, { key: "seats", label: "Seats", align: "end" }], recordNote: "Four complete sample sessions. Select a column heading to sort.",
      scopeNote: "Synthetic attendance entries, not unique people. This pattern does not establish why attendance increased."
    }
  },
  {
    ...showcase, id: "bible-workshop-brief", title: "A workshop, ready to describe", featuredRank: 31, size: "md" as const,
    description: "A planning form collects a coherent workshop brief with labeled native controls and a validated local summary that preserves edits.",
    template: `<Card size="md" gap={4}>
  <Box gap={2}><Caption value={sampleLabel} /><Title value={title} size="sm" /><Text value={intro} size="sm" /></Box>
  <Form gap={3} $onSubmitAction='{ updateState: { attempted: true, formError: has(workshopDate) ? "" : dateError, summary: { title: workshopTitle, date: workshopDate || "", format: workshopFormat, topic: workshopTopic, room: workshopRoom, materials: workshopMaterials } } }'>
    <Col gap={1}><Label value={titleLabel} fieldName="workshopTitle" /><Input name="workshopTitle" defaultValue={initialTitle} required size="2xl" /></Col>
    <Col gap={2}><Text value={formatLabel} size="sm" weight="medium" /><RadioGroup name="workshopFormat" ariaLabel={formatLabel} options={formats} defaultValue="hands-on" /></Col>
    <Grid columns="repeat(auto-fit, minmax(min(100%, 180px), 1fr))" gap={3}>
      <Col gap={1}><Label value={dateLabel} fieldName="workshopDate" /><DatePicker name="workshopDate" defaultValue={initialDate} block clearable size="2xl" /></Col>
      <Col gap={1}><Label value={topicLabel} fieldName="workshopTopic" /><Select name="workshopTopic" options={topics} defaultValue="print" block size="2xl" /></Col>
    </Grid>
    <Col gap={1}><Label value={roomLabel} fieldName="workshopRoom" /><Combobox name="workshopRoom" options={rooms} defaultValue="north" placeholder={roomPlaceholder} searchPlaceholder={roomSearch} emptyLabel={roomEmpty} block /></Col>
    <Checkbox name="workshopMaterials" label={materialsLabel} defaultChecked />
    <Show $when="has(formError)"><Text value={formError} size="sm" color="danger" /></Show>
    <Row><Button submit label={previewLabel} color="primary" size="2xl" /></Row>
  </Form>
  <Show $when="attempted && !has(formError)">
    <Box background="surface-secondary" padding={4} radius="lg" gap={3}>
      <Row gap={2}><Icon name="notebook-pencil" /><Text value={summaryLabel} weight="semibold" size="sm" /></Row>
      <Text value={summary.title} weight="semibold" />
      <KeyValue rows={[{ label: dateLabel, value: summary.date }, { label: formatLabel, value: labels[summary.format] }, { label: topicLabel, value: labels[summary.topic] }, { label: roomLabel, value: labels[summary.room] }, { label: materialsShort, value: summary.materials ? yesLabel : noLabel }]} />
    </Box>
  </Show>
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title intro titleLabel initialTitle formatLabel dateLabel initialDate topicLabel roomLabel roomPlaceholder roomSearch roomEmpty materialsLabel materialsShort yesLabel noLabel previewLabel summaryLabel dateError formError"), formats: z.array(option), topics: z.array(option), rooms: z.array(option), labels: z.record(z.string(), z.string()), attempted: z.boolean(), summary: z.strictObject({ title: z.string(), date: z.string(), format: z.string(), topic: z.string(), room: z.string(), materials: z.boolean() }) }),
    data: {
      sampleLabel: "Sample workshop · planning preview", title: "Make the workshop tangible", intro: "Set the essentials together, then review a brief you can discuss with the team.",

      titleLabel: "Workshop title", initialTitle: "Small prints, bold shapes", formatLabel: "Format", dateLabel: "Date", initialDate: "2026-11-07", topicLabel: "Topic", roomLabel: "Sample room", roomPlaceholder: "Choose a sample room", roomSearch: "Search rooms…", roomEmpty: "No matching sample room",
      formats: [{ label: "Hands-on", value: "hands-on" }, { label: "Demonstration", value: "demo" }], topics: [{ label: "Printmaking", value: "print" }, { label: "Paper folding", value: "fold" }, { label: "Drawing", value: "draw" }, { label: "Typography", value: "type" }],
      rooms: [{ label: "North studio", value: "north" }, { label: "South studio", value: "south" }, { label: "Courtyard", value: "courtyard" }, { label: "Library room", value: "library" }, { label: "Project room", value: "project" }],
      labels: { "hands-on": "Hands-on", demo: "Demonstration", print: "Printmaking", fold: "Paper folding", draw: "Drawing", type: "Typography", north: "North studio", south: "South studio", courtyard: "Courtyard", library: "Library room", project: "Project room" },
      materialsLabel: "Include a materials list", materialsShort: "Materials list", yesLabel: "Included", noLabel: "Not included", previewLabel: "Preview brief", summaryLabel: "Your brief preview", dateError: "Choose a date before creating the preview.", formError: "", attempted: true,
      summary: { title: "Small prints, bold shapes", date: "2026-11-07", format: "hands-on", topic: "print", room: "north", materials: true }
    }
  },
  {
    ...showcase, id: "bible-print-directions", title: "Three print directions", featuredRank: 32, size: "sm" as const,
    description: "An image-led editorial carousel lets three original local artworks carry distinct palettes, with a persistent local reference choice and concise production context.",
    template: `<Card size="sm" padding={0} gap={0}>
  <Col padding={4} gap={1}><Caption value={sampleLabel} /><Title value={title} size="sm" /><Text value={intro} size="sm" /></Col>
  <Col padding={{ x: 3, bottom: 4 }} gap={3}>
    <BaseCarousel visibleItems={1} ariaLabel={carouselLabel}>
      <Each $of="prints" item="print"><BaseCarousel.MediaItem src={print.src} alt={print.alt} aspectRatio={4 / 5} fit="contain" itemPadding={0}>
        <Col padding={{ x: 1, bottom: 1 }} gap={2}>
          <Row gap={2} wrap="wrap"><Text value={print.title} weight="semibold" /><Show $when="selected === print.id"><Badge label={selectedLabel} color="accent" variant="soft" /></Show></Row>
          <Text value={print.description} size="sm" color="secondary" />
          <Flow gap={1}><Each $of="print.palette" item="swatch"><Flow.Item><Box width={46} height={8} background={swatch} radius="full" /></Flow.Item></Each></Flow>
          <Row><Button label={selected === print.id ? chosenLabel : chooseLabel} color="accent" variant={selected === print.id ? "soft" : "outline"} disabled={selected === print.id} onClickAction={{ updateState: { selected: print.id } }} /></Row>
        </Col>
      </BaseCarousel.MediaItem></Each>
    </BaseCarousel>
    <Text value={referenceLabel + names[selected]} size="sm" weight="medium" />
    <Drawer triggerLabel={detailLabel} title={detailTitle} description={detailDescription} content={detailBody} />
  </Col>
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title intro carouselLabel selected selectedLabel chosenLabel chooseLabel referenceLabel detailLabel detailTitle detailDescription detailBody"), names: z.record(z.string(), z.string()), prints: z.array(z.strictObject({ id: z.string(), title: z.string(), src: z.string(), alt: z.string(), description: z.string(), palette: z.array(z.string()) })) }),
    data: {
      sampleLabel: "Original demo artwork · three studies", title: "Let the image lead", intro: "Browse three distinct directions and keep one as the reference for this session.", carouselLabel: "Original print directions", selected: "orbit", selectedLabel: "Reference", chosenLabel: "Current reference", chooseLabel: "Use as reference", referenceLabel: "Selected: ",
      names: { orbit: "Orbit study", field: "Field study", tide: "Tide study" },
      prints: [
        { id: "orbit", title: "Orbit study", src: "/design-bible/assets/orbit-study.svg", alt: "Original plum and coral geometric artwork built from overlapping circles.", description: "Plum and coral circles give the composition an energetic center of gravity.", palette: ["#492346", "#fa8068", "#f6d1c6"] },
        { id: "field", title: "Field study", src: "/design-bible/assets/field-study.svg", alt: "Original sage and cream botanical geometry with repeating leaf-like forms.", description: "Sage and cream botanical shapes create a quieter, more organic rhythm.", palette: ["#456353", "#c9d8ae", "#f4edda"] },
        { id: "tide", title: "Tide study", src: "/design-bible/assets/tide-study.svg", alt: "Original teal and coral artwork with layered wave forms.", description: "Teal waves and a coral counterpoint make a fluid, expansive direction.", palette: ["#196973", "#f18c75", "#bee0da"] }
      ],
      detailLabel: "Artwork details", detailTitle: "Three original vector studies", detailDescription: "Each local asset uses a 720 × 900 viewBox.", detailBody: "These are authored demonstration assets. Choosing a reference changes the selection in this widget; it does not place an order or write a file. The full artwork remains visible without cropping."
    }
  },
  {
    ...showcase, id: "bible-listening-lesson", title: "Hear the shape of a triad", featuredRank: 33, size: "sm" as const,
    description: "A sound lesson pairs a playable original tone fixture with notation, a precise transcript, and a working local listening question.",
    template: `<Card size="sm" gap={4}>
  <Box gap={2}>
    <Row gap={2}><Icon name="headphones" /><Caption value={sampleLabel} /></Row>
    <Title value={title} size="sm" /><Text value={intro} size="sm" />
  </Box>
  <AudioPlayer src={audioSrc} title={audioTitle} subtitle={audioSubtitle} autoPlay={false} loop={false} />
  <Tabs tabs={tabs}>
    <Tabs.Panel id="notes"><Col gap={3}>
      <Grid columns={3} gap={2}><Each $of="notes" item="note"><Grid.Item><Box background="surface-secondary" padding={3} radius="lg" gap={1} align="center"><Text value={note.name} size="lg" weight="semibold" /><Caption value={note.frequency} /></Box></Grid.Item></Each></Grid>
      <Math value={relationship} /><Text value={noteDescription} size="sm" />
    </Col></Tabs.Panel>
    <Tabs.Panel id="transcript"><Timeline items={transcript} /></Tabs.Panel>
  </Tabs>
  <Col gap={2}>
    <Text value={question} size="sm" weight="semibold" />
    <RadioGroup name="direction" ariaLabel={question} options={choices} $onChangeAction='{ updateState: { answer: value } }' />
    <Show $when="has(answer)"><Callout color={answer === 'up' ? 'info' : 'neutral'} title={answer === 'up' ? correctTitle : retryTitle} description={answer === 'up' ? correctText : retryText} /></Show>
  </Col>
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title intro audioSrc audioTitle audioSubtitle relationship noteDescription question answer correctTitle retryTitle correctText retryText"), tabs: z.array(tab), choices: z.array(option), notes: z.array(z.strictObject({ name: z.string(), frequency: z.string() })), transcript: z.array(z.strictObject({ title: z.string(), description: z.string(), time: z.string(), icon: z.string() })) }),
    data: {
      sampleLabel: "Original tone fixture · 2.8 seconds", title: "Three notes, moving upward", intro: "Listen for three separate pitches. Replay as often as you like, then describe their direction.",
      audioSrc: "/design-bible/assets/ascending-triad.wav", audioTitle: "C4 · E4 · G4", audioSubtitle: "Three sine tones · no speech",
      tabs: [{ id: "notes", label: "Notes", icon: "music" }, { id: "transcript", label: "Transcript", icon: "document" }],
      notes: [{ name: "C4", frequency: "261.6 Hz" }, { name: "E4", frequency: "329.6 Hz" }, { name: "G4", frequency: "392.0 Hz" }],
      relationship: "C → E → G", noteDescription: "The three tones outline a C-major triad. Higher frequency corresponds to the higher pitch in this sample.",
      transcript: [{ title: "C4", description: "A 261.6256 Hz tone, then a short pause.", time: "0.00–0.75 s", icon: "music" }, { title: "E4", description: "A 329.6276 Hz tone, then a short pause.", time: "0.90–1.65 s", icon: "music" }, { title: "G4", description: "A 391.9954 Hz tone, followed by silence.", time: "1.80–2.55 s", icon: "music" }],
      question: "Which way do the pitches move?", choices: [{ label: "Up", value: "up" }, { label: "Down", value: "down" }, { label: "Same", value: "same" }], answer: "", correctTitle: "Yes — upward", correctText: "Each note has a higher frequency than the one before it.", retryTitle: "Try one more listen", retryText: "Compare the first and last tones, then choose again."
    }
  },
  {
    ...showcase, id: "bible-reading-settings", title: "A reading room of your own", featuredRank: 34, size: "md" as const,
    description: "A settings editor connects FineTuneCard, a real note toggle, and paper-tone controls to a visible local reading preview.",
    template: `<Basic gap={4}>
  <Col gap={2}><Row gap={2}><Icon name="book-open" /><Caption value={sampleLabel} /></Row><Title value={title} size="sm" /><Text value={intro} size="sm" /></Col>
  <FineTuneCard title={editorTitle} badge={draftLabel} fields={fields} applyLabel={applyLabel}
    $applyAction='{ updateState: { applied: { heading: has(values.heading) ? values.heading : fallbackHeading, size: values.size } } }' />
  <Row justify="between" gap={3}><Text value={notesLabel} size="sm" /><Toggle name="readingNotes" label={notesLabel} variant="switch" defaultPressed={true} $onChangeAction='{ updateState: { showNotes: value } }' /></Row>
  <Col gap={1}><Text value={paletteLabel} size="sm" /><ToggleGroup name="readingPalette" options={palettes} defaultValue="mint" $onChangeAction='{ updateState: { palette: value || "mint" } }' /></Col>
  <Box background={surfaces[palette]} padding={4} radius="lg" gap={3}>
    <Caption value={previewLabel} /><Title value={applied.heading} size="sm" />
    <Text value={sampleText} size={applied.size} />
    <Show $when="showNotes"><Col gap={1}><Divider /><Caption value={noteLabel} /><Text value={noteText} size="sm" color="secondary" /></Col></Show>
  </Box>
  <Tooltip label={helpLabel} content={helpText} />
</Basic>`,
    schema: z.strictObject({ ...strings("sampleLabel title intro editorTitle draftLabel applyLabel fallbackHeading notesLabel paletteLabel palette previewLabel sampleText noteLabel noteText helpLabel helpText"), showNotes: z.boolean(), applied: z.strictObject({ heading: z.string(), size: z.string() }), palettes: z.array(option), surfaces: z.record(z.string(), colors), fields: z.array(z.strictObject({ name: z.string(), label: z.string(), type: z.enum(["text", "select"]), value: z.string(), options: z.array(option).optional() })) }),
    data: {
      sampleLabel: "Sample reader · session settings", title: "Make a little room to read", intro: "Try a heading, text size, and paper tone while the same passage stays in view.",
      editorTitle: "Reading preferences", draftLabel: "Draft", applyLabel: "Apply to preview", fallbackHeading: "A slower page", notesLabel: "Show the reading note", paletteLabel: "Paper tone", palette: "mint", showNotes: true,
      fields: [{ name: "heading", label: "Heading", type: "text", value: "A slower page" }, { name: "size", label: "Body size", type: "select", value: "md", options: [{ label: "Compact", value: "sm" }, { label: "Comfortable", value: "md" }, { label: "Large", value: "lg" }] }],
      palettes: [{ label: "White", value: "mint" }, { label: "Warm", value: "cream" }, { label: "Soft gray", value: "paper" }], surfaces: { mint: { light: "#ffffff", dark: "#181818" }, cream: { light: "#faf7f2", dark: "#24211d" }, paper: { light: "#f5f5f5", dark: "#242424" } },
      applied: { heading: "A slower page", size: "md" }, previewLabel: "Reading preview", sampleText: "A quiet page does not have to be an empty page. Give the main idea enough space, let the supporting detail stay close, and make the next paragraph easy to find.", noteLabel: "Reading note", noteText: "Try the large setting with each paper tone. The words stay the same; only this local preview changes.", helpLabel: "About this preview", helpText: "Apply updates the heading and body size. The note switch and paper tone change immediately. These settings last only in this widget."
    }
  },
  {
    ...showcase, id: "bible-editing-workbench", title: "Keep the author in the loop", featuredRank: 35, size: "md" as const,
    description: "An editing workbench turns prewritten proposals or an exact replacement into a reviewable local draft, with explicit accept and discard controls.",
    template: `<Response gap={4}>
  <Col gap={2}><Caption value={sampleLabel} /><Title value={title} size="sm" /><Text value={intro} size="sm" /></Col>
  <SelectionActions text={draft} selection={draft} placeholder={replacementPlaceholder}
    actions={[{ label: shortLabel, icon: "minimize", action: { updateState: { proposed: shortVersion } } }]}
    $submitAction='{ updateState: { proposed: prompt } }' />
  <Text value={instruction} size="sm" color="secondary" />
  <Show $when="has(proposed)">
    <Box background="surface-secondary" padding={4} radius="lg" gap={3}>
      <Row gap={2}><Icon name="write" /><Text value={proposalLabel} weight="semibold" size="sm" /></Row>
      <Text value={proposed} size="lg" />
      </Box>
    <Row gap={2} wrap="wrap"><Button label={acceptLabel} color="accent" onClickAction={{ updateState: { draft: proposed, proposed: "", revision: revision + 1 } }} /><Button label={discardLabel} variant="ghost" onClickAction={{ updateState: { proposed: "" } }} /></Row>
  </Show>
  <Col gap={2}><Label value={draftLabel} fieldName="editableDraft" /><Textarea key={revision} name="editableDraft" defaultValue={draft} rows={3} $onChangeAction='{ updateState: { draft: value, proposed: "" } }' /></Col>
  <Row gap={2} wrap="wrap"><Button label={copyLabel} iconStart="copy" variant="outline" disabled={!has(draft)} onClickAction={{ type: "copy", handler: "client", payload: { value: draft } }} /><Caption value={revisionLabel + String(revision)} /></Row>
</Response>`,
    schema: z.strictObject({ ...strings("sampleLabel title intro draft proposed replacementPlaceholder shortLabel shortVersion instruction proposalLabel acceptLabel discardLabel draftLabel copyLabel revisionLabel"), revision: z.number().int().nonnegative() }),
    data: {
      sampleLabel: "Sample editing desk · local draft", title: "A proposal is not the final word", intro: "Review a shorter sample or enter your exact replacement, then decide what belongs in the draft.",

      draft: "We would like to invite you to join us for an informal gathering where we will share a few recent prints and talk about the ideas behind them.", proposed: "Join us for a small print swap and the stories behind the work.",
      replacementPlaceholder: "Type exact replacement", shortLabel: "Shorter sample", shortVersion: "Join us for a small print swap and the stories behind the work.",
      instruction: "The sample button uses prewritten wording. Submitting the field proposes your exact replacement.", proposalLabel: "Proposed wording", acceptLabel: "Use in draft", discardLabel: "Discard", draftLabel: "Your editable draft", copyLabel: "Copy draft", revision: 0, revisionLabel: "Accepted revisions: "
    }
  },
  {
    ...showcase, id: "bible-idea-wall", title: "Make space for the next idea", featuredRank: 36, size: "md" as const,
    description: "A local idea collection uses working add/remove controls, optional animated identity, a useful popover, and real collection commands.",
    template: `<Card size="md" gap={4}>
  <Box gap={2}>
    <Caption value={sampleLabel} /><Title value={title} size="sm" /><Text value={intro} size="sm" />
  </Box>
  <Row gap={2} wrap="wrap">
    <Menubar menus={[{ id: "collection", label: menuLabel, items: [{ id: "restore", label: restoreLabel, action: { updateState: { items: starters } } }, { id: "clear", label: clearLabel, action: { updateState: { items: [] } } }, { id: "copy", label: copyLabel, action: { type: "copy", handler: "client", payload: { value: copyHeader + String(size(items)) } } }] }]} />
    <Popover><Popover.Trigger><Row padding={2} gap={1}><Icon name="info" size="sm" /><Text value={aboutLabel} size="sm" /></Row></Popover.Trigger><Popover.Content width={220}><Text value={aboutText} size="sm" /></Popover.Content></Popover>
  </Row>
  <Form key={formVersion} gap={2} $onSubmitAction='{ patchState: [append("items", { id: String(nextId), title: ideaTitle, category: ideaCategory }), set("nextId", nextId + 1), set("formVersion", formVersion + 1)] }'>
    <Col gap={1}><Label value={ideaLabel} fieldName="ideaTitle" /><Input name="ideaTitle" defaultValue="" placeholder={ideaPlaceholder} required size="2xl" /></Col>
    <Row gap={2} wrap="wrap" align="end"><Col flex={1} minWidth={120} gap={1}><Label value={categoryLabel} fieldName="ideaCategory" /><Select name="ideaCategory" defaultValue="shape" options={categories} block size="2xl" /></Col><Button submit label={addLabel} color="primary" size="2xl" /></Row>
  </Form>
  <Row justify="between" gap={2}><Text value={String(size(items)) + countLabel} size="sm" weight="medium" /><Toggle name="animateIdeas" label={motionLabel} defaultPressed={false} $onChangeAction='{ updateState: { motion: value } }' /></Row>
  <Show $when="size(items) > 0">
    <Show $when="motion">
      <AnimateGroup $of="items" item="item" index="i"><Box key={item.id} background="surface-secondary" padding={3} radius="lg"><Row gap={2}><Col flex={1} minWidth={0} gap={1}><Caption value={categoryNames[item.category]} /><Text value={item.title} size="sm" weight="medium" /></Col><Button iconStart="x" ariaLabel={removeLabel + item.title} uniform variant="ghost" size="2xl" $onClickAction='{ patchState: remove("items." + String(i)) }' /></Row></Box></AnimateGroup>
      <Show.Else><Col gap={2}><Each $of="items" item="item" index="i"><Box key={item.id} background="surface-secondary" padding={3} radius="lg"><Row gap={2}><Col flex={1} minWidth={0} gap={1}><Caption value={categoryNames[item.category]} /><Text value={item.title} size="sm" weight="medium" /></Col><Button iconStart="x" ariaLabel={removeLabel + item.title} uniform variant="ghost" size="2xl" $onClickAction='{ patchState: remove("items." + String(i)) }' /></Row></Box></Each></Col></Show.Else>
    </Show>
    <Show.Else><EmptyState icon="lightbulb" title={emptyTitle} description={emptyText} action={{ label: restoreLabel, action: { updateState: { items: starters } } }} /></Show.Else>
  </Show>
</Card>`,
    schema: z.strictObject({ ...strings("sampleLabel title intro menuLabel restoreLabel clearLabel copyLabel copyHeader aboutLabel aboutText ideaLabel ideaPlaceholder categoryLabel addLabel countLabel motionLabel removeLabel emptyTitle emptyText"), motion: z.boolean(), nextId: z.number().int().positive(), formVersion: z.number().int().nonnegative(), categories: z.array(option), categoryNames: z.record(z.string(), z.string()), items: z.array(z.strictObject({ id: z.string(), title: z.string(), category: z.string() })), starters: z.array(z.strictObject({ id: z.string(), title: z.string(), category: z.string() })) }),
    data: {
      sampleLabel: "Sample studio wall · local collection", title: "Catch an idea while it is small", intro: "Keep shapes, words, and materials together. Add a thought, then remove anything that no longer helps.",

      menuLabel: "Collection", restoreLabel: "Restore sample ideas", clearLabel: "Clear collection", copyLabel: "Copy item count", copyHeader: "Ideas on this sample wall: ", aboutLabel: "How it works", aboutText: "Ideas and edits stay in this widget. Turn on Animate changes if you want additions and removals to retain a sense of position.", ideaLabel: "New idea", ideaPlaceholder: "Try a folded cover…", categoryLabel: "Category", addLabel: "Add idea", countLabel: " ideas on the wall", motionLabel: "Animate changes", removeLabel: "Remove ", emptyTitle: "A little room for something new", emptyText: "Add an idea above or bring back the sample set.",
      motion: false, nextId: 4, formVersion: 0, categories: [{ label: "Shape", value: "shape" }, { label: "Words", value: "words" }, { label: "Material", value: "material" }], categoryNames: { shape: "Shape", words: "Words", material: "Material" },
      items: [{ id: "1", title: "A circle that crosses the fold", category: "shape" }, { id: "2", title: "A title that reads like an invitation", category: "words" }, { id: "3", title: "Warm paper with a rough edge", category: "material" }],
      starters: [{ id: "1", title: "A circle that crosses the fold", category: "shape" }, { id: "2", title: "A title that reads like an invitation", category: "words" }, { id: "3", title: "Warm paper with a rough edge", category: "material" }]
    }
  }
];
