# Layered architecture article figures

`original-layered-architecture.png` is the unmodified image supplied for the
article. Its caption links to the Bilibili video discussed in the post.

The three explanatory diagrams are authored in Mermaid, with separate `-zh.mmd`
and `-en.mmd` sources. Their checked-in SVG exports keep the article readable
without adding Mermaid to the website's JavaScript bundle. Each diagram has a
localized accessible title and description, and each article supplies image alt
text, a caption, and links to the full-size SVG and source.

Regenerate an export from the repository root using Mermaid CLI 11.12.0:

```sh
npx --yes --package @mermaid-js/mermaid-cli@11.12.0 mmdc \
  -i public/blog/layered-architecture-and-change/dependencies-zh.mmd \
  -o public/blog/layered-architecture-and-change/dependencies-zh.svg \
  -c public/blog/layered-architecture-and-change/mermaid.config.json \
  -b white
```

Repeat for `dependencies`, `runtime`, and `change-scope` in both locales. The CLI
requires a Puppeteer-compatible browser. To use an existing Chrome installation,
set `PUPPETEER_SKIP_DOWNLOAD=1` and `PUPPETEER_EXECUTABLE_PATH` for the command.
These are authoring tools only; no package installation is required for the site
build or deployment.
