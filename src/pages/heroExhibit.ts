/**
 * The Home hero exhibit: the gallery's "Checkout" demo (checkout-summary),
 * plus the prefix balancer that lets the widget stream in while the template
 * types. Kept free of JSX so the Node test suite can import it directly —
 * tests/examples-render.test.mjs renders every balanced line-prefix.
 */

export const heroTemplate = `
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
`.trim();

export const heroData = {
  items: [
    {
      id: "black-sugar-latte",
      image: "https://cdn.openai.com/API/storybook/blacksugar.png",
      title: "Black Sugar Hojicha Latte",
      subtitle: "16oz iced · boba · $6.50"
    },
    {
      id: "classic-milk-tea",
      image: "https://cdn.openai.com/API/storybook/classic.png",
      title: "Classic Milk Tea",
      subtitle: "16oz iced · double boba · $6.75"
    },
    {
      id: "matcha-latte",
      image: "https://cdn.openai.com/API/storybook/matcha.png",
      title: "Matcha Latte",
      subtitle: "16oz iced · boba · $6.50"
    }
  ],
  totals: [
    { label: "Subtotal", value: "$19.75" },
    { label: "Sales tax (8.75%)", value: "$1.72" },
    { label: "Total", value: "$21.47", emphasis: true }
  ]
};

// Matches one whole tag; quoted strings and {expressions} in the attribute
// span are consumed atomically so ">" inside them can't end the tag early.
const TAG_RE = /<(\/?)([A-Za-z][\w.]*)((?:"[^"]*"|\{[^}]*\}|[^>"{])*?)(\/?)>/g;

/**
 * Turn the completed lines into a renderable template, the way a streaming
 * host renders a model's partial output: drop a dangling half-typed tag, then
 * close every still-open element.
 */
export function balanceTemplatePrefix(lines: string[]): string {
  let text = lines.join("\n");
  const lastOpen = text.lastIndexOf("<");
  const lastClose = text.lastIndexOf(">");
  if (lastOpen > lastClose) text = text.slice(0, lastOpen);
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(text)) !== null) {
    const [, closing, name, , selfClosing] = match;
    if (closing) {
      const at = stack.lastIndexOf(name);
      if (at !== -1) stack.length = at;
    } else if (!selfClosing) {
      stack.push(name);
    }
  }
  let closers = "";
  for (let i = stack.length - 1; i >= 0; i--) closers += `</${stack[i]}>`;
  return text + closers;
}
