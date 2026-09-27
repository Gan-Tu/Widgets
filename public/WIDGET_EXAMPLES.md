# Widget examples

The complete gallery corpus — every demo widget from the gallery as a `template` + `data` pair. This is the optional companion to [AGENTS.md](AGENTS.md): the guide defines the authoring contract and a curated example set; this file provides the full corpus for richer LLM context windows, retrieval, or fine-tuning.

> Generated from `src/examples/widgetExamples.ts` by `scripts/build-widget-examples-doc.mjs` — do not edit by hand.

73 widgets across 11 categories.

## Using these examples

Read the [authoring contract and design guidelines](AGENTS.md#design-guidelines) alongside these templates. Start with the closest pattern and adapt its content, data bindings, and actions to the task. Preserve the built-in control states, subtle borders, consistent gutters, and responsive sizing.

Omit explicit chart colors to use the automatic combinations: blue for one series, yellow + green for two, and blue + green + pinkish red for three. Larger sets add purple and orange without pairing yellow with orange. For pie charts, use the slice count. Keep tooltip text neutral. Check the result at compact widths, in both themes, and with keyboard interaction; examples are starting points, not a reason to add more panels or actions than the task needs.

Use the [complete component design playbook](AGENTS.md#choose-from-the-full-component-library) to match components to their jobs. Tabs, navigation, media, and agent activity are welcome when they clarify a richer workflow. The Editorial collection deliberately varies information shape, and interaction. Scripted replays are local demonstrations, not live model or tool calls.

Examples using `/design-bible/assets/` require those supplied assets on the host. When adapting a template elsewhere, serve the assets or replace them with verified URLs; copying a root-relative URL alone does not copy the asset.

## Editorial

### Research workspace

A research desk pairs a stable synthesis with a bounded scripted replay, public workflow summaries, tool activity, and inspectable sample sources. (id: `bible-research-replay`)

Components in context: `Card`, `Col`, `Row`, `Icon`, `Caption`, `Title`, `Text`, `Button`, `Show`, `RunInterval`, `Tabs`, `Tabs.Panel`, `Orb`, `ThinkingState`, `StreamingText`, `InlineCitations`, `ThinkingReasoning`, `ToolChips`, `Progress`, `ContextCards`.

WIDGET TEMPLATE:

```
<Card size="md" padding={0} gap={0}>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Scripted demo · public workflow",
  "title": "A morning worth testing",
  "takeaway": "Start with one morning workshop. The sample suggests a scheduling preference, not proof of stronger demand.",
  "replayLabel": "Replay research",
  "replayingLabel": "Replaying…",
  "completeLabel": "Show complete",
  "playing": false,
  "frame": 3,
  "run": 0,
  "answer": "In this fictional 12-person survey, eight people prefer mornings and four prefer evenings. A one-session pilot would test whether that preference translates into attendance. Keep an evening option in the next survey.",
  "evidence": "The sample preference is 8 of 12 [1]; the room note leaves both periods possible [2].",
  "traceTitle": "Public workflow summary",
  "toolTitle": "2 sample tool records",
  "inspected": "",
  "frameLabel": "Replay frames",
  "sourceTitle": "The two sample excerpts",
  "tabs": [
    {
      "id": "answer",
      "label": "Answer",
      "icon": "message"
    },
    {
      "id": "activity",
      "label": "Activity",
      "icon": "activity"
    },
    {
      "id": "sources",
      "label": "Sources",
      "icon": "document"
    }
  ],
  "sources": [
    {
      "id": 1,
      "label": "Sample survey",
      "host": "local fixture"
    },
    {
      "id": 2,
      "label": "Sample room note",
      "host": "local fixture"
    }
  ],
  "contexts": [
    {
      "id": "survey",
      "title": "Preference is not attendance",
      "excerpt": "Twelve sample responses: 8 morning, 4 evening. Respondents selected a preferred time; no tickets were offered.",
      "source": {
        "label": "Fictional survey",
        "type": "NOTE"
      }
    },
    {
      "id": "room",
      "title": "Both windows remain possible",
      "excerpt": "The sample room plan leaves one morning and one evening window open for discussion. This is not venue availability.",
      "source": {
        "label": "Fictional room note",
        "type": "NOTE"
      }
    }
  ],
  "toolNotes": {
    "survey": "The replay reads a fixed 12-response survey fixture. It does not contact a survey service.",
    "room": "The replay reads the supplied fictional room note. It makes no calendar query."
  },
  "frames": [
    {
      "label": "Replaying: read the survey",
      "steps": [
        {
          "label": "Read the sample",
          "detail": "Locate the preference count",
          "status": "running"
        },
        {
          "label": "Check the scope",
          "detail": "Separate preference from attendance",
          "status": "pending"
        }
      ],
      "tools": [
        {
          "id": "survey",
          "type": "read",
          "label": "Read sample survey",
          "detail": "12 responses",
          "status": "running"
        },
        {
          "id": "room",
          "type": "read",
          "label": "Read room note",
          "detail": "2 possible windows",
          "status": "pending"
        }
      ]
    },
    {
      "label": "Replaying: inspect the room note",
      "steps": [
        {
          "label": "Read the sample",
          "detail": "8 morning, 4 evening",
          "status": "completed"
        },
        {
          "label": "Check the scope",
          "detail": "No reservation or attendance data",
          "status": "running"
        }
      ],
      "tools": [
        {
          "id": "survey",
          "type": "read",
          "label": "Read sample survey",
          "detail": "12 responses",
          "status": "completed"
        },
        {
          "id": "room",
          "type": "read",
          "label": "Read room note",
          "detail": "2 possible windows",
          "status": "running"
        }
      ]
    },
    {
      "label": "Replaying: assemble the summary",
      "steps": [
        {
          "label": "Read the sample",
          "detail": "8 morning, 4 evening",
          "status": "completed"
        },
        {
          "label": "Check the scope",
          "detail": "One small pilot is the next test",
          "status": "completed"
        }
      ],
      "tools": [
        {
          "id": "survey",
          "type": "read",
          "label": "Read sample survey",
          "detail": "12 responses",
          "status": "completed"
        },
        {
          "id": "room",
          "type": "read",
          "label": "Read room note",
          "detail": "2 possible windows",
          "status": "completed"
        }
      ]
    },
    {
      "label": "Replay complete",
      "steps": [
        {
          "label": "Read the sample",
          "detail": "8 morning, 4 evening",
          "status": "completed"
        },
        {
          "label": "Check the scope",
          "detail": "Preference does not establish demand",
          "status": "completed"
        }
      ],
      "tools": [
        {
          "id": "survey",
          "type": "read",
          "label": "Read sample survey",
          "detail": "12 responses",
          "status": "completed"
        },
        {
          "id": "room",
          "type": "read",
          "label": "Read room note",
          "detail": "2 possible windows",
          "status": "completed"
        }
      ]
    }
  ]
}
```

### Code review

A release-review surface separates changed lines, the resulting configuration, and a local review decision without implying deployment. (id: `bible-release-review`)

Components in context: `Card`, `Box`, `Row`, `Icon`, `Caption`, `Title`, `Text`, `Tabs`, `Tabs.Panel`, `FileDiff`, `CodeBlock`, `TaskList`, `Show`, `ApprovalCard`, `Show.Else`, `Col`, `Callout`, `Button`.

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample patch · local review",
  "title": "Say what the button does",
  "takeaway": "Replace “Submit” with “Copy summary” so the label describes the existing clipboard action.",
  "tabs": [
    {
      "id": "changes",
      "label": "Changes"
    },
    {
      "id": "result",
      "label": "Result"
    },
    {
      "id": "checks",
      "label": "Checks"
    }
  ],
  "file": "sample-action.json",
  "diffRows": [
    {
      "oldLine": 1,
      "newLine": 1,
      "type": "context",
      "text": "{"
    },
    {
      "oldLine": 2,
      "type": "remove",
      "text": "  \"label\": \"Submit\","
    },
    {
      "newLine": 2,
      "type": "add",
      "text": "  \"label\": \"Copy summary\","
    },
    {
      "oldLine": 3,
      "newLine": 3,
      "type": "context",
      "text": "  \"type\": \"copy\""
    },
    {
      "oldLine": 4,
      "newLine": 4,
      "type": "context",
      "text": "}"
    }
  ],
  "code": "{\n  \"label\": \"Copy summary\",\n  \"type\": \"copy\"\n}",
  "checksTitle": "Sample review notes",
  "checks": [
    {
      "id": "verb",
      "label": "Specific verb",
      "detail": "Copy names the local operation",
      "status": "completed"
    },
    {
      "id": "scope",
      "label": "No execution claim",
      "detail": "The wording does not imply a send",
      "status": "completed"
    }
  ],
  "approvalTitle": "Record your review",
  "approvalNote": "This changes only the decision shown here.",
  "choices": [
    {
      "label": "Wording is clear",
      "value": "approve",
      "description": "Keep the proposed label"
    },
    {
      "label": "Needs another pass",
      "value": "revise",
      "description": "Leave the sample under review"
    }
  ],
  "recordLabel": "Record choice",
  "decision": "",
  "approvedTitle": "Wording accepted locally",
  "reviseTitle": "Another pass requested",
  "decisionNote": "The sample file has not been written, committed, or deployed.",
  "resetLabel": "Revisit decision"
}
```

### Bookbinding guide

A knowledge workspace combines working breadcrumb navigation, a responsive sidebar, a selected guide, and optional process detail. (id: `bible-field-guide`)

Components in context: `Basic`, `Box`, `Caption`, `Row`, `Show`, `Button`, `Icon`, `Text`, `Show.Else`, `Grid`, `SidebarNav`, `Col`, `Title`, `Markdown`, `Timeline`, `CodeBlock`, `Sheet`.

WIDGET TEMPLATE:

```
<Basic gap={4}>
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
</Basic>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample studio library",
  "workspace": "Paper field guide",
  "page": "fold",
  "navLabel": "Guides",
  "navItems": [
    {
      "id": "home",
      "label": "Start here",
      "icon": "home"
    },
    {
      "id": "fold",
      "label": "Make a dummy",
      "icon": "layers"
    },
    {
      "id": "bind",
      "label": "Record a binding",
      "icon": "book-open"
    }
  ],
  "pages": {
    "home": {
      "title": "Small books start on paper",
      "summary": "Use a blank folded copy to decide page order before styling a finished layout.",
      "body": "Choose **Make a dummy** for the sequence, or **Record a binding** for a copyable studio note."
    },
    "fold": {
      "title": "Make a paper dummy",
      "summary": "A rough folded copy reveals page order and the center spread before the artwork goes in.",
      "body": "Keep it intentionally plain. Number the pages in reading order, then unfold the sheet to inspect the arrangement."
    },
    "bind": {
      "title": "Record the construction",
      "summary": "A short note makes the next sample reproducible.",
      "body": "Record what you actually used. The example below is a **fictional studio sample**, not a print specification for a real job."
    }
  },
  "foldSteps": [
    {
      "title": "Fold a blank sheet",
      "description": "Match the intended reading format.",
      "time": "1",
      "icon": "layers"
    },
    {
      "title": "Number in reading order",
      "description": "Include the front and back covers.",
      "time": "2",
      "icon": "write"
    },
    {
      "title": "Unfold and inspect",
      "description": "Compare the two sides before laying out pages.",
      "time": "3",
      "icon": "eye"
    }
  ],
  "bindingNote": "Sample A\n8 pages · folded sheet\nCover: warm white\nCheck: page order before artwork",
  "bindingFile": "studio-note.txt",
  "helpLabel": "About this guide",
  "helpTitle": "A guide that stays small",
  "helpDescription": "Three local pages, one useful sequence.",
  "helpBody": "The sidebar changes the selected page. The breadcrumb returns to the start. Notes remain available to copy, and this panel contains optional context rather than the main instruction."
}
```

### Brief composer

A drafting desk uses a real source picker and composer to assemble a deterministic local brief preview, with removable sample context and a copy action. (id: `bible-draft-desk`)

Components in context: `Card`, `Col`, `Row`, `Avatar`, `Caption`, `Title`, `Text`, `PromptBar`, `Box`, `Show`, `Badge`, `TextResponse`, `Button`, `Show.Else`, `EmptyState`.

WIDGET TEMPLATE:

```
<Card size="md" padding={0} gap={0}>
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
        <Row><Button label={copyLabel} iconStart="copy" color="accent" onClickAction={{ type: "copy", handler: "client", payload: { value: preview + "\n\nContext: " + sourceNotes[previewSource] } }} /></Row>
      </Col>
      <Show.Else><EmptyState icon="write" title={emptyTitle} description={emptyDescription} padding={3} /></Show.Else>
    </Show>
  </Col>
</Card>
```

WIDGET DATA:

```json
{
  "editorName": "Mara Lin",
  "sampleLabel": "Sample studio · local draft",
  "title": "Give the brief some context",
  "intro": "Choose a source note, write the brief, then preview the exact text before copying it.",
  "initialDraft": "Invite six people to a small print swap. Ask each person to bring one print and a short note about how it was made.",
  "placeholder": "Write a brief to preview locally",
  "selectedSource": "Print swap",
  "sources": [
    {
      "id": "Print swap",
      "label": "Print swap",
      "description": "Six guests · one print each",
      "icon": "images"
    },
    {
      "id": "Open studio",
      "label": "Open studio",
      "description": "A casual visit · work in progress",
      "icon": "palette"
    }
  ],
  "sourceNotes": {
    "Print swap": "Sample plan: six guests, one print each, a short introduction, then an informal exchange.",
    "Open studio": "Sample plan: show three works in progress and leave time for questions. No date or venue is booked."
  },
  "attachments": [
    {
      "id": "sample-note",
      "name": "sample-note.txt",
      "type": "Text",
      "size": "Local excerpt"
    }
  ],
  "submitNote": "The Send arrow previews your text here; nothing is sent or generated.",
  "contextLabel": "Selected source note",
  "preview": "Invite six people to a small print swap. Ask each person to bring one print and a short note about how it was made.",
  "previewSource": "Print swap",
  "draftLabel": "Draft",
  "copyLabel": "Copy brief + context",
  "emptyTitle": "Your preview goes here",
  "emptyDescription": "The original wording is preserved; the selected source is attached as context."
}
```

### Workflow handoff

A training replay makes task stages, bounded playback, and the final handoff visible through Steps, TaskRows, Flowchart, and measured replay progress. (id: `bible-handoff-replay`)

Components in context: `Response`, `Box`, `Caption`, `Title`, `Text`, `Steps`, `Tabs`, `Tabs.Panel`, `Col`, `Show`, `LoadingState`, `RunInterval`, `Show.Else`, `TaskRows`, `Progress`, `Row`, `Button`, `Flowchart`.

WIDGET TEMPLATE:

```
<Response gap={4}>
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
</Response>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Scripted training demo",
  "title": "Make the next step obvious",
  "takeaway": "A useful handoff names the owner, the next action, and the evidence they need.",
  "stageLabels": [
    {
      "label": "Inspect"
    },
    {
      "label": "Arrange"
    },
    {
      "label": "Hand off"
    }
  ],
  "tabs": [
    {
      "id": "replay",
      "label": "Replay"
    },
    {
      "id": "method",
      "label": "Method"
    }
  ],
  "playing": false,
  "frame": 3,
  "progressLabel": "Replay frames",
  "playLabel": "Play stages",
  "finishLabel": "Show final frame",
  "selectedNode": "inspect",
  "resultLabel": "Sample handoff",
  "result": "Mara owns the next proof. Check the center spread against the folded dummy, then return the marked copy to Jules.",
  "frames": [
    {
      "label": "Replaying: inspect the inputs",
      "tasks": [
        {
          "id": "inspect",
          "label": "Inspect",
          "detail": "Read the supplied proof note",
          "status": "running"
        },
        {
          "id": "arrange",
          "label": "Arrange",
          "detail": "Name owner and next action",
          "status": "pending"
        },
        {
          "id": "handoff",
          "label": "Hand off",
          "detail": "Package the reference",
          "status": "pending"
        }
      ]
    },
    {
      "label": "Replaying: arrange the work",
      "tasks": [
        {
          "id": "inspect",
          "label": "Inspect",
          "detail": "Scope is one center spread",
          "status": "completed"
        },
        {
          "id": "arrange",
          "label": "Arrange",
          "detail": "Mara checks; Jules receives",
          "status": "running"
        },
        {
          "id": "handoff",
          "label": "Hand off",
          "detail": "Package the reference",
          "status": "pending"
        }
      ]
    },
    {
      "label": "Replaying: package the handoff",
      "tasks": [
        {
          "id": "inspect",
          "label": "Inspect",
          "detail": "Scope is one center spread",
          "status": "completed"
        },
        {
          "id": "arrange",
          "label": "Arrange",
          "detail": "Mara checks; Jules receives",
          "status": "completed"
        },
        {
          "id": "handoff",
          "label": "Hand off",
          "detail": "Attach the marked proof",
          "status": "running"
        }
      ]
    },
    {
      "label": "Replay complete",
      "tasks": [
        {
          "id": "inspect",
          "label": "Inspect",
          "detail": "Scope is one center spread",
          "status": "completed"
        },
        {
          "id": "arrange",
          "label": "Arrange",
          "detail": "Mara checks; Jules receives",
          "status": "completed"
        },
        {
          "id": "handoff",
          "label": "Hand off",
          "detail": "Reference named in sample",
          "status": "completed"
        }
      ]
    }
  ],
  "nodes": [
    {
      "id": "inspect",
      "label": "Inspect the input",
      "description": "What changed?",
      "kind": "trigger",
      "icon": "eye"
    },
    {
      "id": "arrange",
      "label": "Name the action",
      "description": "Who needs to do what?",
      "kind": "action",
      "icon": "users"
    },
    {
      "id": "handoff",
      "label": "Include the evidence",
      "description": "What will they inspect?",
      "kind": "result",
      "icon": "paperclip"
    }
  ],
  "edges": [
    {
      "from": "inspect",
      "to": "arrange",
      "label": "define",
      "tone": "info"
    },
    {
      "from": "arrange",
      "to": "handoff",
      "label": "support",
      "tone": "info"
    }
  ],
  "nodeNotes": {
    "inspect": "Read the original note before deciding what changed.",
    "arrange": "One named owner and one concrete action reduce ambiguity.",
    "handoff": "Name the exact reference, such as the marked proof, rather than saying “see above”."
  }
}
```

### Workshop analytics

An analytics study uses distinct, same-unit trend, capacity, mix, and exact-record views to explain four sample sessions without chart duplication. (id: `bible-workshop-analytics`)

Components in context: `Card`, `Box`, `Caption`, `Title`, `Row`, `Stat`, `Text`, `Tabs`, `Tabs.Panel`, `Col`, `AreaChart`, `Chart`, `PieChart`, `KeyValue`, `RecordsTable`.

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample register · W1–W4",
  "title": "More of the room is filling",
  "totalLabel": "Attendance entries",
  "totalValue": "112",
  "fillLabel": "Seats filled",
  "fillValue": "70%",
  "takeaway": "Attendance rose in each session. Across four equally sized sessions, 112 of 160 seats were filled.",
  "tabs": [
    {
      "id": "trend",
      "label": "Trend"
    },
    {
      "id": "capacity",
      "label": "Capacity"
    },
    {
      "id": "mix",
      "label": "Mix"
    },
    {
      "id": "data",
      "label": "Data"
    }
  ],
  "sessions": [
    {
      "week": "W1",
      "attended": 22,
      "seats": 40
    },
    {
      "week": "W2",
      "attended": 26,
      "seats": 40
    },
    {
      "week": "W3",
      "attended": 30,
      "seats": 40
    },
    {
      "week": "W4",
      "attended": 34,
      "seats": 40
    }
  ],
  "trendLabel": "Attendance entries per weekly session",
  "capacityLabel": "Available seats and attendance · same count scale",
  "mixLabel": "Where the 112 entries came from",
  "mix": [
    {
      "name": "Members",
      "count": 56
    },
    {
      "name": "Guests",
      "count": 34
    },
    {
      "name": "Walk-ins",
      "count": 22
    }
  ],
  "mixValues": [
    {
      "label": "Members",
      "value": "56"
    },
    {
      "label": "Guests",
      "value": "34"
    },
    {
      "label": "Walk-ins",
      "value": "22"
    }
  ],
  "columns": [
    {
      "key": "week",
      "label": "Week"
    },
    {
      "key": "attended",
      "label": "Attended",
      "align": "end"
    },
    {
      "key": "seats",
      "label": "Seats",
      "align": "end"
    }
  ],
  "recordNote": "Four complete sample sessions. Select a column heading to sort.",
  "scopeNote": "Synthetic attendance entries, not unique people. This pattern does not establish why attendance increased."
}
```

### Workshop planning form

A planning form collects a coherent workshop brief with labeled native controls and a validated local summary that preserves edits. (id: `bible-workshop-brief`)

Components in context: `Card`, `Box`, `Caption`, `Title`, `Text`, `Form`, `Col`, `Label`, `Input`, `RadioGroup`, `Grid`, `DatePicker`, `Select`, `Combobox`, `Checkbox`, `Show`, `Row`, `Button`, `Icon`, `KeyValue`.

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
  <Box gap={2}><Caption value={sampleLabel} /><Title value={title} size="sm" /><Text value={intro} size="sm" /></Box>
  <Form gap={3} $onSubmitAction='{ updateState: { attempted: true, formError: has(workshopDate) ? "" : dateError, summary: { title: workshopTitle, date: workshopDate || "", format: workshopFormat, topic: workshopTopic, room: workshopRoom, materials: workshopMaterials } } }'>
    <Col gap={1}><Label value={titleLabel} fieldName="workshopTitle" /><Input name="workshopTitle" defaultValue={initialTitle} required size="2xl" /></Col>
    <Col gap={2}><Text value={formatLabel} size="sm" weight="medium" /><RadioGroup name="workshopFormat" ariaLabel={formatLabel} options={formats} defaultValue="hands-on" /></Col>
    <Grid columns="repeat(auto-fit, minmax(min(100%, 180px), 1fr))" gap={3}>
      <Col gap={1}><Label value={dateLabel} fieldName="workshopDate" /><DatePicker name="workshopDate" defaultValue={initialDate} block clearable size="2xl" /></Col>
      <Col gap={1}><Label value={topicLabel} fieldName="workshopTopic" /><Select name="workshopTopic" options={topics} defaultValue="print" block size="2xl" /></Col>
    </Grid>
    <Col gap={1}><Label value={roomLabel} fieldName="workshopRoom" /><Combobox name="workshopRoom" options={rooms} defaultValue="north" placeholder={roomPlaceholder} searchPlaceholder={roomSearch} emptyLabel={roomEmpty} block size="2xl" /></Col>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample workshop · planning preview",
  "title": "Make the workshop tangible",
  "intro": "Set the essentials together, then review a brief you can discuss with the team.",
  "titleLabel": "Workshop title",
  "initialTitle": "Small prints, bold shapes",
  "formatLabel": "Format",
  "dateLabel": "Date",
  "initialDate": "2026-11-07",
  "topicLabel": "Topic",
  "roomLabel": "Sample room",
  "roomPlaceholder": "Choose a sample room",
  "roomSearch": "Search rooms…",
  "roomEmpty": "No matching sample room",
  "formats": [
    {
      "label": "Hands-on",
      "value": "hands-on"
    },
    {
      "label": "Demonstration",
      "value": "demo"
    }
  ],
  "topics": [
    {
      "label": "Printmaking",
      "value": "print"
    },
    {
      "label": "Paper folding",
      "value": "fold"
    },
    {
      "label": "Drawing",
      "value": "draw"
    },
    {
      "label": "Typography",
      "value": "type"
    }
  ],
  "rooms": [
    {
      "label": "North studio",
      "value": "north"
    },
    {
      "label": "South studio",
      "value": "south"
    },
    {
      "label": "Courtyard",
      "value": "courtyard"
    },
    {
      "label": "Library room",
      "value": "library"
    },
    {
      "label": "Project room",
      "value": "project"
    }
  ],
  "labels": {
    "hands-on": "Hands-on",
    "demo": "Demonstration",
    "print": "Printmaking",
    "fold": "Paper folding",
    "draw": "Drawing",
    "type": "Typography",
    "north": "North studio",
    "south": "South studio",
    "courtyard": "Courtyard",
    "library": "Library room",
    "project": "Project room"
  },
  "materialsLabel": "Include a materials list",
  "materialsShort": "Materials list",
  "yesLabel": "Included",
  "noLabel": "Not included",
  "previewLabel": "Preview brief",
  "summaryLabel": "Your brief preview",
  "dateError": "Choose a date before creating the preview.",
  "formError": "",
  "attempted": true,
  "summary": {
    "title": "Small prints, bold shapes",
    "date": "2026-11-07",
    "format": "hands-on",
    "topic": "print",
    "room": "north",
    "materials": true
  }
}
```

### Print design carousel

An image-led editorial carousel lets three original local artworks carry distinct palettes, with a persistent local reference choice and concise production context. (id: `bible-print-directions`)

Components in context: `Card`, `Col`, `Caption`, `Title`, `Text`, `BaseCarousel`, `Each`, `BaseCarousel.MediaItem`, `Row`, `Show`, `Badge`, `Flow`, `Flow.Item`, `Box`, `Button`, `Drawer`.

WIDGET TEMPLATE:

```
<Card size="sm" padding={0} gap={0}>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Original demo artwork · three studies",
  "title": "Let the image lead",
  "intro": "Browse three distinct directions and keep one as the reference for this session.",
  "carouselLabel": "Original print directions",
  "selected": "orbit",
  "selectedLabel": "Reference",
  "chosenLabel": "Current reference",
  "chooseLabel": "Use as reference",
  "referenceLabel": "Selected: ",
  "names": {
    "orbit": "Orbit study",
    "field": "Field study",
    "tide": "Tide study"
  },
  "prints": [
    {
      "id": "orbit",
      "title": "Orbit study",
      "src": "/design-bible/assets/orbit-study.svg",
      "alt": "Original plum and coral geometric artwork built from overlapping circles.",
      "description": "Plum and coral circles give the composition an energetic center of gravity.",
      "palette": [
        "#492346",
        "#fa8068",
        "#f6d1c6"
      ]
    },
    {
      "id": "field",
      "title": "Field study",
      "src": "/design-bible/assets/field-study.svg",
      "alt": "Original sage and cream botanical geometry with repeating leaf-like forms.",
      "description": "Sage and cream botanical shapes create a quieter, more organic rhythm.",
      "palette": [
        "#456353",
        "#c9d8ae",
        "#f4edda"
      ]
    },
    {
      "id": "tide",
      "title": "Tide study",
      "src": "/design-bible/assets/tide-study.svg",
      "alt": "Original teal and coral artwork with layered wave forms.",
      "description": "Teal waves and a coral counterpoint make a fluid, expansive direction.",
      "palette": [
        "#196973",
        "#f18c75",
        "#bee0da"
      ]
    }
  ],
  "detailLabel": "Artwork details",
  "detailTitle": "Three original vector studies",
  "detailDescription": "Each local asset uses a 720 × 900 viewBox.",
  "detailBody": "These are authored demonstration assets. Choosing a reference changes the selection in this widget; it does not place an order or write a file. The full artwork remains visible without cropping."
}
```

### Music listening lesson

A sound lesson pairs a playable original tone fixture with notation, a precise transcript, and a working local listening question. (id: `bible-listening-lesson`)

Components in context: `Card`, `Box`, `Row`, `Icon`, `Caption`, `Title`, `Text`, `AudioPlayer`, `Tabs`, `Tabs.Panel`, `Col`, `Grid`, `Each`, `Grid.Item`, `Math`, `Timeline`, `RadioGroup`, `Show`, `Callout`.

WIDGET TEMPLATE:

```
<Card size="sm" gap={4}>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Original tone fixture · 2.8 seconds",
  "title": "Three notes, moving upward",
  "intro": "Listen for three separate pitches. Replay as often as you like, then describe their direction.",
  "audioSrc": "/design-bible/assets/ascending-triad.wav",
  "audioTitle": "C4 · E4 · G4",
  "audioSubtitle": "Three sine tones · no speech",
  "tabs": [
    {
      "id": "notes",
      "label": "Notes",
      "icon": "music"
    },
    {
      "id": "transcript",
      "label": "Transcript",
      "icon": "document"
    }
  ],
  "notes": [
    {
      "name": "C4",
      "frequency": "261.6 Hz"
    },
    {
      "name": "E4",
      "frequency": "329.6 Hz"
    },
    {
      "name": "G4",
      "frequency": "392.0 Hz"
    }
  ],
  "relationship": "C → E → G",
  "noteDescription": "The three tones outline a C-major triad. Higher frequency corresponds to the higher pitch in this sample.",
  "transcript": [
    {
      "title": "C4",
      "description": "A 261.6256 Hz tone, then a short pause.",
      "time": "0.00–0.75 s",
      "icon": "music"
    },
    {
      "title": "E4",
      "description": "A 329.6276 Hz tone, then a short pause.",
      "time": "0.90–1.65 s",
      "icon": "music"
    },
    {
      "title": "G4",
      "description": "A 391.9954 Hz tone, followed by silence.",
      "time": "1.80–2.55 s",
      "icon": "music"
    }
  ],
  "question": "Which way do the pitches move?",
  "choices": [
    {
      "label": "Up",
      "value": "up"
    },
    {
      "label": "Down",
      "value": "down"
    },
    {
      "label": "Same",
      "value": "same"
    }
  ],
  "answer": "",
  "correctTitle": "Yes — upward",
  "correctText": "Each note has a higher frequency than the one before it.",
  "retryTitle": "Try one more listen",
  "retryText": "Compare the first and last tones, then choose again."
}
```

### Reading preferences

A settings editor connects FineTuneCard, a real note toggle, and paper-tone controls to a visible local reading preview. (id: `bible-reading-settings`)

Components in context: `Basic`, `Col`, `Row`, `Icon`, `Caption`, `Title`, `Text`, `FineTuneCard`, `Toggle`, `ToggleGroup`, `Box`, `Show`, `Divider`, `Tooltip`.

WIDGET TEMPLATE:

```
<Basic gap={4}>
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
</Basic>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample reader · session settings",
  "title": "Make a little room to read",
  "intro": "Try a heading, text size, and paper tone while the same passage stays in view.",
  "editorTitle": "Reading preferences",
  "draftLabel": "Draft",
  "applyLabel": "Apply to preview",
  "fallbackHeading": "A slower page",
  "notesLabel": "Show the reading note",
  "paletteLabel": "Paper tone",
  "palette": "mint",
  "showNotes": true,
  "fields": [
    {
      "name": "heading",
      "label": "Heading",
      "type": "text",
      "value": "A slower page"
    },
    {
      "name": "size",
      "label": "Body size",
      "type": "select",
      "value": "md",
      "options": [
        {
          "label": "Compact",
          "value": "sm"
        },
        {
          "label": "Comfortable",
          "value": "md"
        },
        {
          "label": "Large",
          "value": "lg"
        }
      ]
    }
  ],
  "palettes": [
    {
      "label": "White",
      "value": "mint"
    },
    {
      "label": "Warm",
      "value": "cream"
    },
    {
      "label": "Soft gray",
      "value": "paper"
    }
  ],
  "surfaces": {
    "mint": {
      "light": "#ffffff",
      "dark": "#181818"
    },
    "cream": {
      "light": "#faf7f2",
      "dark": "#24211d"
    },
    "paper": {
      "light": "#f5f5f5",
      "dark": "#242424"
    }
  },
  "applied": {
    "heading": "A slower page",
    "size": "md"
  },
  "previewLabel": "Reading preview",
  "sampleText": "A quiet page does not have to be an empty page. Give the main idea enough space, let the supporting detail stay close, and make the next paragraph easy to find.",
  "noteLabel": "Reading note",
  "noteText": "Try the large setting with each paper tone. The words stay the same; only this local preview changes.",
  "helpLabel": "About this preview",
  "helpText": "Apply updates the heading and body size. The note switch and paper tone change immediately. These settings last only in this widget."
}
```

### Draft review

An editing workbench turns prewritten proposals or an exact replacement into a reviewable local draft, with explicit accept and discard controls. (id: `bible-editing-workbench`)

Components in context: `Response`, `Col`, `Caption`, `Title`, `Text`, `SelectionActions`, `Show`, `Box`, `Row`, `Icon`, `Button`, `Label`, `Textarea`.

WIDGET TEMPLATE:

```
<Response gap={4}>
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
</Response>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample editing desk · local draft",
  "title": "A proposal is not the final word",
  "intro": "Review a shorter sample or enter your exact replacement, then decide what belongs in the draft.",
  "draft": "We would like to invite you to join us for an informal gathering where we will share a few recent prints and talk about the ideas behind them.",
  "proposed": "Join us for a small print swap and the stories behind the work.",
  "replacementPlaceholder": "Type exact replacement",
  "shortLabel": "Shorter sample",
  "shortVersion": "Join us for a small print swap and the stories behind the work.",
  "instruction": "The sample button uses prewritten wording. Submitting the field proposes your exact replacement.",
  "proposalLabel": "Proposed wording",
  "acceptLabel": "Use in draft",
  "discardLabel": "Discard",
  "draftLabel": "Your editable draft",
  "copyLabel": "Copy draft",
  "revision": 0,
  "revisionLabel": "Accepted revisions: "
}
```

### Idea board

A local idea collection uses working add/remove controls, optional animated identity, a useful popover, and real collection commands. (id: `bible-idea-wall`)

Components in context: `Card`, `Box`, `Caption`, `Title`, `Text`, `Row`, `Menubar`, `Popover`, `Popover.Trigger`, `Icon`, `Popover.Content`, `Form`, `Col`, `Label`, `Input`, `Select`, `Button`, `Toggle`, `Show`, `AnimateGroup`, `Show.Else`, `Each`, `EmptyState`.

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
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
</Card>
```

WIDGET DATA:

```json
{
  "sampleLabel": "Sample studio wall · local collection",
  "title": "Catch an idea while it is small",
  "intro": "Keep shapes, words, and materials together. Add a thought, then remove anything that no longer helps.",
  "menuLabel": "Collection",
  "restoreLabel": "Restore sample ideas",
  "clearLabel": "Clear collection",
  "copyLabel": "Copy item count",
  "copyHeader": "Ideas on this sample wall: ",
  "aboutLabel": "How it works",
  "aboutText": "Ideas and edits stay in this widget. Turn on Animate changes if you want additions and removals to retain a sense of position.",
  "ideaLabel": "New idea",
  "ideaPlaceholder": "Try a folded cover…",
  "categoryLabel": "Category",
  "addLabel": "Add idea",
  "countLabel": " ideas on the wall",
  "motionLabel": "Animate changes",
  "removeLabel": "Remove ",
  "emptyTitle": "A little room for something new",
  "emptyText": "Add an idea above or bring back the sample set.",
  "motion": false,
  "nextId": 4,
  "formVersion": 0,
  "categories": [
    {
      "label": "Shape",
      "value": "shape"
    },
    {
      "label": "Words",
      "value": "words"
    },
    {
      "label": "Material",
      "value": "material"
    }
  ],
  "categoryNames": {
    "shape": "Shape",
    "words": "Words",
    "material": "Material"
  },
  "items": [
    {
      "id": "1",
      "title": "A circle that crosses the fold",
      "category": "shape"
    },
    {
      "id": "2",
      "title": "A title that reads like an invitation",
      "category": "words"
    },
    {
      "id": "3",
      "title": "Warm paper with a rough edge",
      "category": "material"
    }
  ],
  "starters": [
    {
      "id": "1",
      "title": "A circle that crosses the fold",
      "category": "shape"
    },
    {
      "id": "2",
      "title": "A title that reads like an invitation",
      "category": "words"
    },
    {
      "id": "3",
      "title": "Warm paper with a rough edge",
      "category": "material"
    }
  ]
}
```

### Evidence memo

An answer-first evidence memo: observed results, limits, and a copyable conclusion. (id: `bible-evidence-memo`)

Components in context: `Response`, `Col`, `Caption`, `Title`, `Text`, `Divider`, `Row`, `Button`.

WIDGET TEMPLATE:

```
<Response gap={4} padding={1}>
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
</Response>
```

WIDGET DATA:

```json
{
  "eyebrow": "Illustrative library pilot · decision note",
  "title": "Keep one quiet hour",
  "answer": "Keep the Wednesday quiet hour for another four sessions, then review. The small pilot supports continuing the experiment, not a permanent schedule change.",
  "evidenceTitle": "What the sample actually says",
  "evidence": "18 of 24 respondents preferred the quiet session. Six wanted a separate space for conversation; the sample did not measure total attendance.",
  "source": "Source: fictional pilot feedback, 24 responses across four sessions.",
  "limitation": "This is a self-selected sample. We do not know whether visitors who skipped the session would agree.",
  "copyLabel": "Copy decision note",
  "copyText": "ILLUSTRATIVE PILOT — Keep the Wednesday quiet hour for four more sessions, then review. 18 of 24 sample respondents preferred it; six requested conversation space. Self-selected feedback does not establish overall demand."
}
```

### Audio recorder comparison

A compact, same-field equipment comparison with a locally adjustable priority. (id: `bible-recorder-comparison`)

Components in context: `Basic`, `Col`, `Caption`, `Title`, `SegmentedControl`, `Text`, `Table`, `Table.Row`, `Table.Cell`, `Each`.

WIDGET TEMPLATE:

```
<Basic gap={4} padding={1}>
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
</Basic>
```

WIDGET DATA:

```json
{
  "demoNote": "Fictional recorders · illustrative specifications",
  "title": "Choose for how you record",
  "priorityLabel": "Recording priority",
  "priorities": [
    {
      "label": "Travel light",
      "value": "carry"
    },
    {
      "label": "Desk setup",
      "value": "desk"
    }
  ],
  "priority": "carry",
  "carryTakeaway": "Pocket weighs 270 g less and includes microphones. It fits a minimal travel kit.",
  "deskTakeaway": "Desk provides four inputs and USB power. It fits a fixed setup with external microphones.",
  "fieldLabel": "Feature",
  "pocketName": "Pocket",
  "deskName": "Desk",
  "rows": [
    {
      "label": "Mass",
      "pocket": "240 g",
      "desk": "510 g"
    },
    {
      "label": "Inputs",
      "pocket": "2",
      "desk": "4"
    },
    {
      "label": "Built-in mic",
      "pocket": "Yes",
      "desk": "No"
    },
    {
      "label": "Power",
      "pocket": "2 × AA",
      "desk": "USB-C"
    }
  ],
  "limitation": "These invented specifications demonstrate a comparison. Sound quality and real product availability are not evaluated."
}
```

### Attendance trend

A six-point attendance trend with a visible takeaway and an exact-count alternative. (id: `bible-attendance-trend`)

Components in context: `Card`, `Col`, `Caption`, `Title`, `Text`, `SegmentedControl`, `Show`, `LineChart`, `Show.Else`, `DataTable`.

WIDGET TEMPLATE:

```
<Card size="md" gap={4}>
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
</Card>
```

WIDGET DATA:

```json
{
  "demoNote": "Illustrative museum attendance · six equal Saturday sessions",
  "title": "Visits rose from 120 to 180",
  "takeaway": "The last session had 60 more visits than the first (+50%), with a small dip in week 3.",
  "viewLabel": "Attendance display",
  "views": [
    {
      "label": "Trend",
      "value": "chart"
    },
    {
      "label": "Exact counts",
      "value": "values"
    }
  ],
  "view": "chart",
  "axisNote": "Visits per session · sessions W1–W6",
  "seriesLabel": "Visits",
  "sessions": [
    {
      "week": "W1",
      "visits": 120
    },
    {
      "week": "W2",
      "visits": 144
    },
    {
      "week": "W3",
      "visits": 138
    },
    {
      "week": "W4",
      "visits": 165
    },
    {
      "week": "W5",
      "visits": 174
    },
    {
      "week": "W6",
      "visits": 180
    }
  ],
  "columns": [
    {
      "key": "week",
      "label": "Session"
    },
    {
      "key": "visits",
      "label": "Visits",
      "align": "end"
    }
  ],
  "tableCaption": "All six sample counts; no sessions omitted.",
  "limitation": "The pattern alone cannot explain the rise. Opening hours are equal, but programming and weather are not controlled.",
  "source": "Source: synthetic gate-counter fixture; visits are entries, not unique people."
}
```

### Reading plan calculator

One honest local scenario: adjust pages per day and see the remaining reading days. (id: `bible-reading-scenario`)

Components in context: `Card`, `Col`, `Caption`, `Title`, `Scope`, `Show`, `Stat`, `Show.Else`, `Text`, `Label`, `Input`, `Divider`, `KeyValue`.

WIDGET TEMPLATE:

```
<Card size="sm" gap={5}>
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
</Card>
```

WIDGET DATA:

```json
{
  "demoNote": "Illustrative reading plan · calculated locally",
  "title": "A little, every day",
  "resultLabel": "Reading days remaining",
  "dayUnit": " days",
  "resultNote": "Rounded up to finish the last page.",
  "paceLabel": "Daily pace (pages per day)",
  "paceText": "20",
  "pagesRemaining": 240,
  "pendingLabel": "Reading-day estimate not calculated.",
  "rangeNote": "Whole pages only · 1–200 pages per day",
  "paceError": "Enter a whole number from 1 to 200 to calculate reading days.",
  "details": [
    {
      "label": "Pages remaining",
      "value": "240"
    },
    {
      "label": "Starting point",
      "value": "Page 61 of 300"
    }
  ],
  "assumption": "Assumes the same pace each reading day. Breaks add calendar days; this is a scenario, not a scheduled finish date."
}
```

### Print checklist

A practical four-step checklist that tracks only what the reader marks locally. (id: `bible-zine-checklist`)

Components in context: `ListView`, `ListViewItem`, `Col`, `Title`, `Text`, `Caption`, `Each`, `Checkbox`, `Box`, `Row`.

WIDGET TEMPLATE:

```
<ListView limit={8}>
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
</ListView>
```

WIDGET DATA:

```json
{
  "title": "First-print checklist",
  "intro": "Inspect one proof copy before committing to the full zine run.",
  "demoNote": "Illustrative studio procedure",
  "progressLabel": "Review progress",
  "countSuffix": " of 4 checked",
  "localNote": "Your checks stay in this widget.",
  "items": [
    {
      "id": "order",
      "title": "Read in folded order",
      "detail": "Confirm the cover, center spread, and last page land where intended.",
      "done": false
    },
    {
      "id": "edges",
      "title": "Inspect the edges",
      "detail": "Look for clipped page numbers, captions, and artwork on the proof.",
      "done": false
    },
    {
      "id": "type",
      "title": "Read the smallest text",
      "detail": "Check credits and captions at the actual printed size.",
      "done": false
    },
    {
      "id": "proof",
      "title": "Keep the marked proof",
      "detail": "Record any corrections before making the next version.",
      "done": false
    }
  ]
}
```

### Knowledge search

A bilingual local search with a useful no-results state and a working clear action. (id: `bible-shelf-search`)

Components in context: `Response`, `Col`, `Caption`, `Title`, `Text`, `Search`, `Show`, `Row`, `Button`, `Box`.

WIDGET TEMPLATE:

```
<Response gap={3} padding={1}>
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
</Response>
```

WIDGET DATA:

```json
{
  "demoNote": "Fictional studio shelf · three local sample records",
  "title": "Find a small idea",
  "intro": "Search titles or topics, then open a short reading note. Try “maps” or “装订”.",
  "placeholder": "Search this sample shelf",
  "emptyText": "No sample titles match. Try maps, type, or 装订, or clear the search.",
  "clearLabel": "Clear search",
  "query": "",
  "searchVersion": 0,
  "selected": "",
  "selectionNote": "Local reading note · no external file opened",
  "items": [
    {
      "id": "maps",
      "label": "Drawing a place",
      "description": "Maps · 地图",
      "keywords": "cartography maps 地图 空间",
      "icon": "maps",
      "action": {
        "updateState": {
          "selected": "maps"
        }
      }
    },
    {
      "id": "binding",
      "label": "The folded book",
      "description": "Binding · 装订",
      "keywords": "paper zine binding 装订 折页",
      "icon": "book-open",
      "action": {
        "updateState": {
          "selected": "binding"
        }
      }
    },
    {
      "id": "type",
      "label": "Space between letters",
      "description": "Typography · 字体",
      "keywords": "type typography spacing 字体 排版",
      "icon": "square-text",
      "action": {
        "updateState": {
          "selected": "type"
        }
      }
    }
  ],
  "details": {
    "maps": {
      "title": "Drawing a place",
      "body": "A sample note about choosing landmarks that help a reader orient themselves. Omit detail that does not help the route."
    },
    "binding": {
      "title": "The folded book",
      "body": "A sample note about using a folded paper dummy to check page order before laying out a small publication."
    },
    "type": {
      "title": "Space between letters",
      "body": "A sample note about comparing text at its intended size, with attention to word spacing and line length."
    }
  }
}
```

### Site map

An explicitly fictional schematic paired with named positions and honest spatial limits. (id: `bible-fictional-site-map`)

Components in context: `Card`, `Col`, `Caption`, `Title`, `Text`, `Map`, `List`, `Each`, `List.Item`.

WIDGET TEMPLATE:

```
<Card size="sm" gap={3}>
  <Col gap={1}><Caption value={demoNote} /><Title value={title} size="sm" /><Text value={takeaway} size="sm" /></Col>
  <Map markers={markers} routes={routes} height={180} frame={false} />
  <List marker="none" gap={3}>
    <Each $of="places" item="place"><List.Item><Col gap={1}>
      <Text value={place.name} size="sm" weight="semibold" />
      <Text value={place.position} size="sm" color="secondary" />
    </Col></List.Item></Each>
  </List>
  <Text value={limitation} size="sm" color="secondary" />
</Card>
```

WIDGET DATA:

```json
{
  "demoNote": "Fictional site · invented coordinates",
  "title": "Dock → studio → garden",
  "takeaway": "The studio lies between the dock in the west and the garden to the northeast.",
  "markers": [
    {
      "latitude": 37.724,
      "longitude": -122.495,
      "label": "Dock — west",
      "color": "var(--widget-text-primary)",
      "style": "pin"
    },
    {
      "latitude": 37.752,
      "longitude": -122.438,
      "label": "Studio — center",
      "color": "var(--widget-text-primary)",
      "style": "pin"
    },
    {
      "latitude": 37.795,
      "longitude": -122.385,
      "label": "Garden — northeast",
      "color": "var(--widget-text-primary)",
      "style": "pin"
    }
  ],
  "routes": [
    {
      "coordinates": [
        [
          -122.495,
          37.724
        ],
        [
          -122.438,
          37.752
        ],
        [
          -122.385,
          37.795
        ]
      ],
      "color": "var(--widget-text-secondary)"
    }
  ],
  "places": [
    {
      "name": "Dock",
      "position": "Western marker · imagined arrival point."
    },
    {
      "name": "Studio",
      "position": "Middle marker · imagined exhibition space."
    },
    {
      "name": "Garden",
      "position": "Northeastern marker · imagined outdoor room."
    }
  ],
  "limitation": "The line connects fictional places; it is not a walkable route. No street accuracy, distances, travel times, or accessibility claims are implied."
}
```

### Vector artwork

An original vector print, with the artwork first and a working two-palette switch. (id: `bible-tidal-print`)

Components in context: `Basic`, `Box`, `Svg`, `Col`, `Caption`, `Title`, `Text`, `SegmentedControl`.

WIDGET TEMPLATE:

```
<Basic gap={3}>
  <Box background={paperColor} radius="lg" padding={5} align="center">
    <Svg title={description} viewBox="0 0 240 240" size={230} paths={palette === "clay" ? clayPaths : inkPaths} />
  </Box>
  <Col gap={1}><Caption value={demoNote} /><Title value={title} size="sm" /><Text value={description} size="sm" color="secondary" /></Col>
  <SegmentedControl name="palette" ariaLabel={paletteLabel} value={palette} options={palettes} size="lg"
    $onChangeAction='{ updateState: { palette: value } }' />
  <Caption value={palette === "clay" ? clayDescription : inkDescription} />
</Basic>
```

WIDGET DATA:

```json
{
  "paperColor": "#f4efe5",
  "demoNote": "Original demo artwork · vector study 01",
  "title": "Tidal forms",
  "description": "Two offset circles meet a broad wave on warm paper. The visual is the deliverable; there is no hidden meaning or measured data.",
  "paletteLabel": "Artwork palette",
  "palette": "clay",
  "palettes": [
    {
      "label": "Clay",
      "value": "clay"
    },
    {
      "label": "Ink",
      "value": "ink"
    }
  ],
  "clayDescription": "Clay palette: terracotta sun, cream crescent, deep blue wave.",
  "inkDescription": "Ink palette: charcoal sun, paper crescent, muted gray wave.",
  "clayPaths": [
    {
      "d": "M160 79a57 57 0 1 1-114 0a57 57 0 1 1 114 0",
      "fill": "#b95137",
      "stroke": "none"
    },
    {
      "d": "M193 62a51 51 0 1 1-102 0a51 51 0 1 1 102 0",
      "fill": "#f4efe5",
      "stroke": "none"
    },
    {
      "d": "M20 147C64 114 91 125 128 151C160 174 193 158 220 132L220 220L20 220Z",
      "fill": "#263d4d",
      "stroke": "none"
    },
    {
      "d": "M20 184C58 158 88 162 128 184C161 203 197 186 220 167L220 188C193 208 160 220 125 202C84 181 58 181 20 204Z",
      "fill": "#f4efe5",
      "stroke": "none"
    }
  ],
  "inkPaths": [
    {
      "d": "M160 79a57 57 0 1 1-114 0a57 57 0 1 1 114 0",
      "fill": "#30312e",
      "stroke": "none"
    },
    {
      "d": "M193 62a51 51 0 1 1-102 0a51 51 0 1 1 102 0",
      "fill": "#f4efe5",
      "stroke": "none"
    },
    {
      "d": "M20 147C64 114 91 125 128 151C160 174 193 158 220 132L220 220L20 220Z",
      "fill": "#74776e",
      "stroke": "none"
    },
    {
      "d": "M20 184C58 158 88 162 128 184C161 203 197 186 220 167L220 188C193 208 160 220 125 202C84 181 58 181 20 204Z",
      "fill": "#f4efe5",
      "stroke": "none"
    }
  ]
}
```

## Agent UI

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

### Agent workbench

A focused workspace for work in progress. (id: `agent-workbench`)

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

From an idea to its first image. (id: `agent-media`)

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

### Agent conversation

A conversation with room for the work. (id: `agent-conversation`)

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

A starting point for your next idea. (id: `agent-composer`)

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

### Data workspace

Explore the records behind the work. (id: `data-workspace`)

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

Move from context to the next action. (id: `navigation-workflow`)

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

Review an insight. Refine its direction. (id: `insight-editor`)

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
          "color": "var(--widget-chart-5)",
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

### Purchase receipt

Everything you need, after the purchase. (id: `receipt`)

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

Your order, a little closer. (id: `delivery-map`)

WIDGET TEMPLATE:

```
<Card size="md" padding={0}>
  <Map markers={markers} routes={routes} height={180} radius="none" frame={false} />
  <Col padding={5} gap={4}>
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

### Trip itinerary

A few days away, thoughtfully planned. (id: `trip-itinerary`)

WIDGET TEMPLATE:

```
<Card size="md" padding={0}>
  <Image src={coverImage} alt={destination} height={150} fit="cover" flush />
  <Col padding={5} gap={4}>
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

Somewhere worth staying. (id: `hotel-card`)

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

Your pickup, down to the minute. (id: `rider-status`)

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

A small window into the day ahead. (id: `weather-now`)

WIDGET TEMPLATE:

```
<Card size="sm" background="#eef2f0" gap={3}>
  <Row align="start">
    <Col gap={0} flex="auto">
      <Title value={city} size="sm" />
      <Caption value={condition} />
    </Col>
    <Icon name={conditionIcon} size="2xl" color="#0066cc" />
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
      <Box flex={1} padding={{ y: 2 }} radius="md" background="surface" align="center" gap={1}>
        <Caption value={hour.time} size="sm" />
        <Icon name={hour.icon} size="sm" color="#007aff" />
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

### Smart home

A little control over your everyday. (id: `smart-home`)

WIDGET TEMPLATE:

```
<Card size="md" gap={5}>
  <Row align="center" justify="between">
    <Title value="At home" size="sm" />
    <Caption value="Living room" />
  </Row>
  <Row align="center" justify="between" gap={5}>
    <Stat label="Indoor temperature" value={temperature} size="lg" />
    <Col gap={3}>
      <Stat label="Humidity" value={humidity} size="sm" />
      <Caption value={energyToday + " today"} />
    </Col>
  </Row>
  <ChipGroup name="scene" defaultValue="relax" options={scenes} size="sm"
    onChangeAction={{ type: "home.scene.set" }} />
  <Divider />
  <Col gap={0}>
    <Each $of="devices" item="device">
      <Row align="center" gap={3} padding={{ y: 2 }}>
        <Icon name={device.icon} size="md" color="secondary" />
        <Col flex="auto" gap={0}>
          <Text value={device.name} size="sm" weight="medium" />
          <Caption value={device.room} size="sm" />
        </Col>
        <Toggle variant="switch" name={device.id} label={device.name} defaultPressed={device.on}
          onChangeAction={{ type: "home.device.toggle", payload: { id: device.id } }} />
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

### Create task

Turn a thought into the next thing to do. (id: `task-create`)

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

See how the sprint is coming together. (id: `team-progress`)

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

Small steps toward getting started. (id: `onboarding-checklist`)

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

Make room for the next conversation. (id: `calendar-confirm`)

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

### Analytics overview

Traffic, growth, and the sources behind them. (id: `analytics-overview`)

WIDGET TEMPLATE:

```
<Card size="md" gap={5}>
  <Row align="center">
    <Title value="Site analytics" size="sm" />
    <Spacer />
    <Caption value="Last 30 days" size="sm" />
  </Row>
  <Tabs tabs={[
    { id: "traffic", label: "Traffic" },
    { id: "channels", label: "Channels" }
  ]}>
    <Tabs.Panel id="traffic">
      <Col gap={4}>
        <Stat label={stats[0].label} value={stats[0].value} delta={stats[0].delta} size="lg" deltaLabel="vs. last month" />
        <AreaChart data={series} xAxis={{ dataKey: "week" }}
          series={[{ dataKey: "visitors", label: "Visitors" }]}
          height={150} showLegend={false} />
        <Divider />
        <Row gap={6}>
          <Stat label={stats[1].label} value={stats[1].value} delta={stats[1].delta} size="sm" />
          <Stat label={stats[2].label} value={stats[2].value} delta={stats[2].delta} upIsPositive={false} size="sm" />
        </Row>
      </Col>
    </Tabs.Panel>
    <Tabs.Panel id="channels">
      <DataTable columns={[
        { key: "channel", label: "Channel" },
        { key: "visitors", label: "Visitors", align: "end" },
        { key: "change", label: "Change", align: "end" }
      ]} rows={channels} />
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
      "delta": "+12.4%"
    },
    {
      "label": "Signups",
      "value": "1,284",
      "delta": "+8.1%"
    },
    {
      "label": "Bounce rate",
      "value": "31%",
      "delta": "-2.3%"
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

### Finance dashboard

A clearer picture of money in motion. (id: `finance-dashboard`)

WIDGET TEMPLATE:

```
<Card size="lg" gap={4}>
  <Row align="start" justify="between" wrap="wrap" gap={3}>
    <Col gap={1} flex="1 1 180px" minWidth={0}>
      <Stat label="Total balance" value={balance} delta={balanceDelta} deltaLabel="vs last month" size="lg" />
      <Sparkline data={spendTrend} height={36} width={180} />
    </Col>
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
      { type: "bar", dataKey: "income", label: "Income", color: "var(--widget-chart-5)" },
      { type: "bar", dataKey: "spending", label: "Spending", color: "var(--widget-chart-6)" },
      { type: "line", dataKey: "savings", label: "Savings", color: "var(--widget-chart-3)", strokeWidth: 2 }
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

See where your audience comes from. (id: `traffic-donut`)

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
      "fill": "var(--widget-chart-5)"
    },
    {
      "name": "Direct",
      "value": 26,
      "fill": "var(--widget-chart-6)"
    },
    {
      "name": "Referral",
      "value": 18,
      "fill": "var(--widget-chart-3)"
    },
    {
      "name": "Social",
      "value": 14,
      "fill": "var(--widget-chart-4)"
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

Your plan, usage, and invoices at a glance. (id: `usage-billing`)

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

What people think, side by side. (id: `poll-results`)

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
      { dataKey: "thisYear", label: "2026" },
      { dataKey: "lastYear", label: "2025" }
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

### Campaign composer

Bring your next campaign together. (id: `campaign-composer`)

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
          <Combobox name="campaign.audience" options={audiences} placeholder="Pick audience" block />
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

Make a little room for feedback. (id: `feedback-survey`)

WIDGET TEMPLATE:

```
<Card size="sm" gap={4}>
  <Form onSubmitAction={{ type: "feedback.submit" }}>
    <Col gap={4}>
      <Col gap={0}>
        <Title value="How was your experience?" size="sm" />
        <Caption value="Takes less than a minute." />
      </Col>

      <Col gap={2}>
        <Label value="Overall" fieldName="feedback.score" />
        <RadioGroup ariaLabel="Overall experience" name="feedback.score" options={scores} direction="row" />
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
      "label": "Poor",
      "value": "1"
    },
    {
      "label": "Fair",
      "value": "2"
    },
    {
      "label": "Good",
      "value": "3"
    },
    {
      "label": "Great",
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

## Media

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

### Media carousel

Browse photos, then switch between audio and video. (id: `media-carousel`)

WIDGET TEMPLATE:

```
<Card size="md" padding={4} gap={4}>
  <BaseCarousel ariaLabel="Field notes photos" visibleItems={1} gap={3} snap="mandatory">
    <Each $of="photos" item="photo">
      <BaseCarousel.MediaItem src={photo.src} alt={photo.title} aspectRatio={1.6} radius="md" border={0}>
        <Col gap={1}>
          <Text value={photo.title} weight="medium" size="sm" />
          <Caption value={photo.source} size="sm" />
        </Col>
      </BaseCarousel.MediaItem>
    </Each>
  </BaseCarousel>
  <Tabs tabs={[{ id: "audio", label: "Audio" }, { id: "video", label: "Video" }]}>
    <Tabs.Panel id="audio">
      <AudioPlayer src={audio.src} title={audio.title} subtitle={audio.subtitle} compact />
    </Tabs.Panel>
    <Tabs.Panel id="video">
      <YouTubeEmbed videoId={videoId} aspectRatio={1.7777778} title="Embedded video demo" />
    </Tabs.Panel>
  </Tabs>
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
      "source": "Unsplash"
    },
    {
      "id": "p2",
      "title": "Transit control wall",
      "src": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      "source": "Unsplash"
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

Listen in. Pick up where you left off. (id: `podcast-episode`)

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

## Communication

### Player profile

A season in numbers. A player in focus. (id: `player-profile`)

WIDGET TEMPLATE:

```
<Card size="sm" background="surface" gap={3}>
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
    <Sparkline data={form} height={32} />
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

### Notifications

The updates that deserve your attention. (id: `notifications-inbox`)

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

A familiar face, a conversation away. (id: `contact-card`)

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

An invitation with all the details. (id: `event-invite`)

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

## Engine

### Live status board

A live view of a changing system. (id: `live-status`)

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

Small interactions that remember their state. (id: `state-counter`)

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

The route, its status, and the next stop. (id: `route-operations`)

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

A small study in type and information. (id: `rich-text`)

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

Split the bill. Keep the math simple. (id: `tip-calculator`)

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
