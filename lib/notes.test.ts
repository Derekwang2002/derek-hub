import assert from "node:assert/strict";
import test from "node:test";
import { getAllLocalizedPosts } from "./localized-posts";
import { getAllTagsWithCounts, getPostsByTag } from "./posts";
import { getAllProjects, getProject, getProjectUpdates } from "./projects";
import nextConfig from "../next.config";
import sitemap from "../src/app/sitemap";

test("notes have exclusive ownership in both languages", async () => {
  for (const locale of ["en", "zh"] as const) {
    const notes = await getAllLocalizedPosts(locale, "notes");
    assert.deepEqual(notes.map(note => note.slug), ["mysql-notes", "leetcode-notes"]);
    assert.ok(notes.every(note => note.content.length > 0));
    const blog = await getAllLocalizedPosts(locale);
    assert.ok(blog.length > 0);
    assert.ok(blog.every(post => !notes.some(note => note.slug === post.slug)));
    const collections = await getAllProjects(locale, "notes");
    assert.deepEqual(collections.map(collection => collection.slug), ["csci678"]);
    assert.ok((await getAllProjects(locale)).every(project => project.slug !== "csci678"));
  }
  assert.equal((await getPostsByTag("mysql")).length, 0);
  assert.ok((await getAllTagsWithCounts()).every(tag => tag.slug !== "mysql"));
});

test("course documents and updates keep readers in Notes", async () => {
  for (const locale of ["en", "zh"] as const) {
    const prefix = locale === "zh" ? "/zh" : "";
    const course = await getProject("csci678", locale);
    assert.ok(course);
    assert.equal(course.href, `${prefix}/notes/csci678`);
    for (const item of course.sections.flatMap(section => section.items)) {
      assert.equal(item.href, `${prefix}/notes/csci678/${item.slug}`);
      assert.doesNotMatch(item.content, /\]\(\/(?:zh\/)?projects\/csci678\/lecture-[a-z0-9-]+\)/);
    }
    for (const update of await getProjectUpdates("csci678", locale)) {
      assert.ok(update.href.startsWith(`${prefix}/notes/csci678/updates#`));
    }
  }
});

test("legacy note and course URLs redirect without capturing figure assets", async () => {
  const redirects = await nextConfig.redirects!();
  for (const prefix of ["", "/zh"]) {
    const course = await getProject("csci678", "en");
    assert.ok(course);
    const moved = [
      ["blog/mysql-notes", "notes/mysql-notes"],
      ["blog/leetcode-notes", "notes/leetcode-notes"],
      ["projects/csci678", "notes/csci678"],
      ["projects/csci678/updates", "notes/csci678/updates"],
      ...course.sections.flatMap(section => section.items.map(item => [
        `projects/csci678/${item.slug}`, `notes/csci678/${item.slug}`
      ]))
    ];
    for (const [from, to] of moved) {
      assert.ok(redirects.some(rule => rule.source === `${prefix}/${from}` && rule.destination === `${prefix}/${to}` && rule.permanent));
    }
    assert.ok(redirects.every(rule => !rule.source.includes(":path") && !rule.source.endsWith(".png")));
  }
});

test("sitemap advertises only canonical note URLs in both locales", async () => {
  const urls = (await sitemap()).map(entry => new URL(entry.url).pathname);
  assert.equal(new Set(urls).size, urls.length);
  for (const prefix of ["", "/zh"]) {
    assert.ok(urls.includes(`${prefix}/notes/mysql-notes`));
    assert.ok(urls.includes(`${prefix}/notes/leetcode-notes`));
    assert.ok(urls.includes(`${prefix}/notes/csci678/lecture-3-preview`));
    assert.ok(!urls.includes(`${prefix}/blog/mysql-notes`));
    assert.ok(!urls.some(url => url.startsWith(`${prefix}/projects/csci678`)));
  }
});
