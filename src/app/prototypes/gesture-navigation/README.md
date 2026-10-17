# Original Hero: scroll and gesture studies

The production Hero is unchanged. The previous visual-theme experiment is no longer the default preview; the old Hero route opens its original comparison. These studies import the real `HomeContent`, with no rewritten identity, new artwork, or changed site navigation.

## Routes

- Chinese: `/zh/prototypes/gesture-navigation?v=3`
- English: `/prototypes/gesture-navigation?v=3`
- `v=1` Flow; `v=2` Swipe; `v=3` Drop (default).
- Picker: 1/2/3 or arrow keys; R replays. Inside the focused Swipe area, arrow keys navigate sections instead. Editable inputs retain their keys.

## Interaction models

**Drop** preserves the original Hero and top navigation at rest. Native vertical scrolling lowers the same navigation anchors into an expanded section directory while the Hero recedes. The bar, expanding surface and five entries follow separate damped springs: travel leads, later entries follow with slightly more weight, and velocity adds a subtle stretch. Reversing scroll retargets the running springs without resetting their velocity. Animation frames stop once settled; resizing and returning to the page restore geometry immediately. Reverse scrolling restores the navbar. There are no repeated section previews; all five entries link to the real section indexes. The original shell header is hidden only while this isolated prototype is mounted. Expanded entries have equal areas, a shared title size and surface tone, and 14px corners, separated by space without borders. They fill the original centered card: three taller blocks above two wider blocks on desktop, and two paired rows plus a full-width final block on mobile. All five destinations retain equal area without leaving an empty grid cell. After scrolling pauses, a velocity-seeded spring guides the page to an endpoint (140ms near the ends, 300ms in the middle). Attraction ramps in gently and strengthens only in the final 20%; projected momentum helps choose the destination. Wheel, touch, pointer and keyboard input can interrupt the glide immediately. Clicking the blank backdrop outside the expanded card uses a firmer spring with no attraction ramp to return promptly to the Hero, while retaining the existing follower inertia. Scroll-triggered attraction ramps in over 200ms and remains gentler than explicit dismissal; links, controls and text selection are excluded. Titles are the original navbar anchors; captions and index numbers are omitted. Whole-block hit areas activate after expansion; hidden Hero content becomes inert. Reduced motion switches directly between the two layouts. Keyboard scrolling updates without spring lag.

**Flow** uses native document scrolling. On desktop, the original Hero briefly holds while its intro and terminal recede at different rates. Section previews enter with scroll-driven depth and opacity. A quiet right-side progress rail tracks the current chapter; native anchors jump directly to a chapter. Mobile removes the pinned Hero; reduced motion removes the transformations and extended scroll runway.

**Swipe** presents Home, Notes, Blog, Projects, Resources and About on a native horizontal scroll-snap rail. Horizontal wheel/trackpad or touch scrolling changes section; vertical movement reads within the current section. No wheel listener remaps vertical gestures. Boundary arrows, position controls and keyboard arrows/Home/End provide alternatives. Inactive pages are inert. Each page keeps its vertical position while mounted; `section` in the URL restores the selected page across refresh and returning from an article. Reduced motion disables smooth programmatic scrolling.

In Flow and Swipe, the section views are previews, not replacements for all features of each full index. They load real current repository data, show up to four entries, and link to the actual articles, projects, resources and full indexes. No made-up counts or content. A production promotion would still need full section routing and real touch-device acceptance testing.

## Verification

- TypeScript and development compilation.
- Spring simulations at 30/60/120 Hz: bounded overshoot, settling in both directions, interrupted reversal, rapid retargeting and long-frame stability.
- Drop: real wheel input with stationary scroll / continuing motion, settling, mid-flight reversal, whole-block hit areas and route navigation; 1200px, 390px and 320px layout; English long labels, light/dark themes; keyboard and reduced motion.
- Desktop native vertical and horizontal wheel input; horizontal snap; boundary buttons and Home/End; picker keys.
- 390px layout and vertical reading without a section change.
- Localized routes, actual hrefs, reduced-motion behavior and section restore.
- The in-app browser does not support synthetic touch dispatch. Touch uses browser-native scrolling but has not been verified on physical hardware.
- No production component edit, commit, push or deployment.
