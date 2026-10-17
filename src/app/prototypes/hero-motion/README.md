# Hero motion studies

Local interaction prototypes for the existing Derek Hub hero. The current layout, typography, palette, navigation, profile, contact links, and terminal content are the baseline. Production components are imported but not edited.

- Chinese: `/zh/prototypes/hero-motion?v=1`
- English: `/prototypes/hero-motion?v=1`
- Picker: 1–4 or left/right arrows; R replays. Keyboard shortcuts yield to text inputs.
- “Compare original” renders the actual `HomeContent` component.

The new theme study is **Form**, available at `?v=4` in both locales. The default without a variant is Form. Earlier interaction studies remain available for comparison.

## Directions

1. **Sense:** the original terminal becomes a graphite surface in dark mode and a satin silver surface in light mode. A soft surrounding light, directional reflection, fine procedural grain, illuminated bevel and contact shadow create depth. Pointer movement smoothly changes the shared light direction and tilts the whole terminal by at most 2.4 degrees; leaving settles it back to rest. There is no decorative code field, icon strip, click effect or idle animation. The original name/contact interactions remain. Reduced-motion and coarse-pointer users get the complete static composition.
2. **Console:** the terminal accepts local commands (`help`, `about`, `stack`, `projects`, `clear`), offers clickable suggestions, history and completion, and returns real profile/project links. More active exploration; adds an input row and scrollable output.
3. **Connect:** hover, focus, or click the intro text to highlight related terminal content. Clicking pins a selection; clicking again or the × unpins it. Desktop has a quiet connecting line; mobile retains the selectable highlight. More conceptual linkage; requires discovery.

4. **Form:** changes the Hero visual theme itself. A large two-line name, a bespoke monochrome sculpture and a ruled technical profile replace the terminal-window composition. Preserves the site navigation, two-column grid, monochrome theme and profile facts. Contact links and name navigation work; the art shifts slightly with pointer movement. No click effects. See `ART-DIRECTION.md` for the asset provenance and generation prompt.

Each direction has its own component. The original grid, intro and terminal content are reused. The picker CSS comes unchanged from the prototype skill. Sense uses frame-rate-independent exponential smoothing and stops requesting frames when settled; only transforms change during pointer motion. Media-query changes and window blur reset the effect. No new npm dependency or runtime external service. The local font, license and original texture live in `public/prototypes/hero-motion/assets`.

See [REFERENCES.md](./REFERENCES.md) for the reference observations and their application. This is a local prototype, with no production integration or deployment.
