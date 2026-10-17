import assert from "node:assert/strict";
import test from "node:test";
import { plainSearchText, searchDocuments, type SearchDocument } from "./search";
import { buildSearchIndex } from "./search-index";
const doc = (title: string, overrides: Partial<SearchDocument> = {}): SearchDocument => ({ title, href:`/blog/${title}`, category:"blog", summary:"", text:"", tags:[], ...overrides });
test("title outranks tags and long body matches; English is case insensitive", () => {
  const results = searchDocuments([doc("Guide",{text:"redis ".repeat(100)}),doc("Storage",{tags:["Redis"]}),doc("Redis")],"REDIS");
  assert.deepEqual(results.map(r=>r.title),["Redis","Storage","Guide"]);
});
test("Chinese multi-keyword queries match across fields and require every term", () => {
  assert.equal(searchDocuments([doc("数据库索引",{text:"覆盖查询与事务"})],"数据库 事务").length,1);
  assert.equal(searchDocuments([doc("数据库索引")],"数据库 事务").length,0);
  assert.equal(searchDocuments([doc("数据库索引")],"  ").length,0);
});
test("body matches receive an excerpt around the match", () => {
  const results=searchDocuments([doc("Guide",{text:"prefix ".repeat(100)+"unique_term"})],"unique_term");
  assert.match(results[0].excerpt,/unique_term/);
  assert.ok(results[0].excerpt.startsWith("…"));
});
test("markdown cleanup keeps prose and link labels rather than syntax", () => {
  assert.equal(plainSearchText("# Title\n[Read more](/target)\n```js\nconst hidden=1;\n```\n**Text**"),"Title Read more Text");
});
test("both locale indexes use public route families, unique hrefs, and published project children", async () => {
  for(const locale of ["en","zh"] as const) {
    const index=await buildSearchIndex(locale);
    assert.ok(index.length>30);
    assert.equal(new Set(index.map(doc=>doc.href)).size,index.length);
    assert.ok(index.every(doc=>!/(?:^|\/)(?:private|share|prototypes)(?:\/|$)/.test(doc.href)));
    assert.ok(index.some(doc=>doc.href===`${locale==='zh'?'/zh':''}/notes/csci678/lecture-4-explanation`));
    const result=searchDocuments(index,"LRU");
    assert.ok(result.some(doc=>doc.category==='resources'));
    for(const doc of index.filter(doc=>/^\/(?:zh\/)?(?:notes|blog|projects|hub)\//.test(doc.href))) assert.equal(doc.href.startsWith('/zh/'),locale==='zh');
  }
});
