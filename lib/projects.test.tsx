import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProjectPagerMarkup } from "../src/components/project-pager-markup";
import {
  getAllProjects,
  getProject,
  getProjectItem,
  getProjectPager
} from "./projects";

const ITEM_SLUGS = [
  "technical-architecture",
  "agentic-goal-architecture",
  "commit-goal",
  "goal-iteration-runner",
  "voice-run-execution",
  "latency-optimization",
  "development-plan",
  "source-atlas"
];

test("loads the CALL-E tree with exact locale parity", async () => {
  const [english, chinese] = await Promise.all([
    getProject("call-e", "en"),
    getProject("call-e", "zh")
  ]);
  assert.ok(english);
  assert.ok(chinese);
  assert.equal(english.status, "active");
  assert.deepEqual(
    english.sections.flatMap((section) => section.items.map((item) => item.slug)),
    ITEM_SLUGS
  );
  assert.deepEqual(
    chinese.sections.flatMap((section) => section.items.map((item) => item.slug)),
    ITEM_SLUGS
  );
  assert.equal(english.lastUpdated, "2026-07-28");
  assert.equal(chinese.lastUpdated, "2026-07-28");
});

test("Project index exposes only public Projects", async () => {
  assert.deepEqual((await getAllProjects("en")).map((project) => project.slug), ["call-e"]);
});

test("renders the complete English and Chinese pager loop with actual href values", async () => {
  for (const locale of ["en", "zh"] as const) {
    const prefix = locale === "zh" ? "/zh" : "";
    const hrefs = [
      `${prefix}/projects/call-e`,
      ...ITEM_SLUGS.map((slug) => `${prefix}/projects/call-e/${slug}`)
    ];
    const slugs: Array<string | null> = [null, ...ITEM_SLUGS];

    for (let index = 0; index < slugs.length; index += 1) {
      const pager = await getProjectPager("call-e", slugs[index], locale);
      const html = renderToStaticMarkup(
        <ProjectPagerMarkup
          classes={{ pager: "pager", next: "next", previous: "previous" }}
          locale={locale}
          pager={pager}
        />
      );
      const previousHref = index > 0 ? hrefs[index - 1] : null;
      const nextHref = index < hrefs.length - 1 ? hrefs[index + 1] : null;

      if (previousHref) {
        assert.match(html, new RegExp(`href="${escapeRegExp(previousHref)}"`));
        assert.match(html, /rel="prev"/);
      } else {
        assert.doesNotMatch(html, /rel="prev"/);
      }

      if (nextHref) {
        assert.match(html, new RegExp(`href="${escapeRegExp(nextHref)}"`));
        assert.match(html, /rel="next"/);
      } else {
        assert.doesNotMatch(html, /rel="next"/);
      }
    }
  }
});

test("loads the localized interactive item and asset paths", async () => {
  const [english, chinese] = await Promise.all([
    getProjectItem("call-e", "source-atlas", "en"),
    getProjectItem("call-e", "source-atlas", "zh")
  ]);
  assert.equal(english?.kind, "interactive");
  assert.equal(chinese?.kind, "interactive");
  assert.equal(english?.assetPath?.en, "/projects/call-e/source-atlas/en/index.html");
  assert.equal(chinese?.assetPath?.zh, "/projects/call-e/source-atlas/zh/index.html");
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
