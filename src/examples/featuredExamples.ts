export type FeaturedExample = {
  category: string;
  featured?: boolean;
  featuredRank?: number;
};

export function isFeaturedWidgetExample(example: FeaturedExample) {
  return example.category === "Featured" || example.featured === true;
}

export function compareFeaturedWidgetExamples(
  a: FeaturedExample,
  b: FeaturedExample
) {
  return (
    (a.featuredRank ?? Number.MAX_SAFE_INTEGER) -
    (b.featuredRank ?? Number.MAX_SAFE_INTEGER)
  );
}
