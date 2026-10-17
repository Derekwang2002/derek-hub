# URL-to-page article figures

Four diagrams from the accompanying explanation are preserved in both Chinese
and English: the introductory handshake, the example handshake, the rendering
flow, and the complete sequence with IP, port, and MAC changes. Text diagrams
remain directly in both Markdown articles.

The `.mmd` sources are editable. Their checked-in SVG exports allow the existing
Markdown renderer to display every figure without a client-side Mermaid dependency.
Each article includes localized alt text, captions, full-size image links, and
source links. Each diagram has an accessible title and description.

The export configuration uses explicit SVG dimensions so standalone figures
remain readable, and mirrors sequence actors so lifelines extend to the end.
The URL fragment uses Mermaid's `#35;` escape for a literal hash character.

Regenerate an SVG from the repository root with Mermaid CLI 11.12.0:

```sh
PUPPETEER_SKIP_DOWNLOAD=1 \
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
npm exec --yes --package @mermaid-js/mermaid-cli@11.12.0 -- mmdc \
  -i public/blog/from-url-to-webpage/full-sequence-zh.mmd \
  -o public/blog/from-url-to-webpage/full-sequence-zh.svg \
  -c public/blog/from-url-to-webpage/mermaid.config.json -b white
```

Repeat for all four stems in both locales. The browser path is a local authoring
setting; it is not needed for site builds. Addresses and port mappings are
illustrative. The Internet lifeline folds multiple router hops together; the
later end-to-end arrows still traverse those hops and the same NAT mapping.
