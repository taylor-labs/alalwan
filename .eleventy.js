module.exports = function (eleventyConfig) {
  eleventyConfig.ignores.add("CLAUDE.md");
  eleventyConfig.ignores.add(".claude/**");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("findBy", (arr, key, val) => (arr || []).find((x) => x[key] === val));
  eleventyConfig.addFilter("whereData", (arr, key, val) => (arr || []).filter((i) => i.data[key] === val));
  eleventyConfig.addFilter("readableDate", (date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );

  // Bilingual headings render as <span en>…</span><span ar>…</span> with no gap,
  // which the search indexer reads as one word. Separate them inside headings.
  eleventyConfig.addTransform("heading-lang-gap", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    return content.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/g, (h) =>
      h.replace(/<\/span><span data-lang-ar/g, "</span> <span data-lang-ar")
    );
  });

  // Scholars
  eleventyConfig.addCollection("scholars", (api) => {
  return api.getFilteredByTag("scholars");
  });


  // Works (everything under content/works except index pages)
  eleventyConfig.addCollection("works", (api) =>
  api.getFilteredByGlob("content/works/**/*.md")
  .filter(i => !i.inputPath.endsWith("/index.md"))
  );

  eleventyConfig.addCollection("fatawa", (api) =>
  api.getFilteredByGlob("content/fatawa/*.md")
  .filter(i => !i.inputPath.endsWith("/index.md"))
  .sort((a, b) => new Date(a.data.date_added) - new Date(b.data.date_added))
  );

  eleventyConfig.addCollection("sessions", (api) => {
    const nums = new Set(
      api.getFilteredByGlob("content/fatawa/*.md")
        .filter(i => !i.inputPath.endsWith("/index.md"))
        .map(i => i.data.session)
        .filter(Boolean)
    );
    return [...nums].sort((a, b) => a - b);
  });

  // Sciences (the science pages themselves)
  eleventyConfig.addCollection("sciences", (api) =>
  api.getFilteredByGlob("content/sciences/*.{md,njk}").filter(i => !i.inputPath.endsWith("/index.md"))
  );

  eleventyConfig.addCollection("poetry", (api) =>
  api.getFilteredByGlob("content/poetry/*.md")
  .filter(i => !i.inputPath.endsWith("/index.md"))
  );

  eleventyConfig.addCollection("books", (api) =>
  api.getFilteredByGlob("content/books/*.md")
  .filter(i => !i.inputPath.endsWith("/index.md"))
  );

  eleventyConfig.addCollection("poets", (api) =>
  api.getFilteredByGlob("content/poets/*.md")
  .filter(i => !i.inputPath.endsWith("/index.md"))
  );


  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
  };
};
