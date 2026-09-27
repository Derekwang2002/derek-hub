# Repository Instructions

## Parent/child navigation must form a complete loop

- When adding a document series, wizard, pager, or any other parent/child navigation, verify both directions. A child-to-parent or previous-page link does not replace the parent-to-first-child or next-page link.
- For a series with an overview at position 0, the overview must link to the first published document through the same bottom pager used by child documents.
- Verify every boundary state: overview → first document, first document → overview, each middle document → previous and next, and the final document → previous with no empty next control.
- Apply and verify the same navigation behavior in every supported locale.
- Check the rendered page or generated HTML for the actual `href`; do not consider navigation complete based only on loader data, an inline body link, or the child page implementation.

## CSCI 678 lecture additions

- For new lecture material, follow `/Users/derek/Documents/USC/26Fall/Courses/CSCI678/AGENTS.md`: complete translation and detailed explanation, matching English pages, figures, project registration, both overview pages, and bilingual Updates.
- Source documents live in that course directory. Its `scripts/sync_lecture.py` converts the reviewed source documents to site Markdown; catalog, overview, and Updates edits are separate required steps.
- Preserve the existing `lecture-3-preview` route. New lectures use `lecture-N-explanation` and `lecture-N-full-translation` in both locales.
- Verify math rendering, image paths, locale parity, and actual pager hrefs; run the existing Project tests, typecheck, and production build. State whether changes are local or deployed accurately.
