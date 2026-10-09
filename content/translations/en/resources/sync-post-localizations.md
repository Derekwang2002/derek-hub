# Sync Post Localizations Skill

`sync-post-localizations` synchronizes article copies in every supported language after a Markdown post changes. It also checks the routes, metadata, navigation, sitemap, and RSS/feed behavior coupled to those posts. Once installed in Codex's global Skills directory, it can work with any repository rather than being tied to one site.

Repository: <https://github.com/Derekwang2002/skills>

## When to use it

Use this Skill when `content/posts`, or an equivalent article directory, changes in any of these ways:

- A Markdown post is added.
- An existing post's content or frontmatter is edited.
- An article file or public slug is renamed.
- A post is deleted.
- Translation files are missing, outdated, or structurally inconsistent with the source.
- The user requests synchronization or publication of article changes.

Codex invokes the Skill while handling a related task; it is not a background file watcher. Writing a `.md` file to disk does not run it automatically. Requests such as “sync the new article,” “check article translations,” or “publish the article changes” in Codex can trigger it.

## Working across repositories

The Skill targets the repository in the current working directory. It first locates project instructions, the canonical article directory, translation directories, Markdown loaders, language routes, sitemap, RSS/feed, and deployment checks instead of hard-coding the `derek-hub` implementation.

It recognizes this conventional layout by default:

```text
content/
├── posts/
│   └── YYYY-MM-DD-slug.md
└── translations/
    ├── en/posts/
    └── zh/posts/
```

Other layouts can be inferred from repository configuration, or their directories can be passed explicitly to the audit script.

## What it handles

For each source article that changes, the Skill:

1. Determines the canonical article's primary language and corrects language mismatches in its title or summary.
2. Creates or updates a complete translation for every other supported language.
3. Preserves Markdown structure, code blocks, commands, URLs, formulas, anchors, and technical terminology.
4. Synchronizes filenames and slugs, and checks internal links and language routes.
5. Preserves permanent redirects when a published slug changes.
6. Verifies the sitemap, RSS/feed, metadata, navigation, sorting, and display behavior for fields such as `selected` and `draft`.
7. Runs the project's own lint, typecheck, tests, and production build.

## Audit script

The Skill includes a deterministic preflight script:

```bash
python3 sync-post-localizations/scripts/audit_posts.py --repo /path/to/repository
```

Custom directories:

```bash
python3 sync-post-localizations/scripts/audit_posts.py \
  --repo /path/to/repository \
  --posts-dir articles \
  --translations-dir locales
```

The script checks filenames, frontmatter, missing translations, and orphaned translations, reporting errors with a nonzero exit code. It is a workflow preflight check and does not replace verification of application routes and build output.

## Publication boundaries

The Skill preserves unrelated user changes and commits only files belonging to the article synchronization task. It commits and pushes only when the user requests the full publication workflow. It does not publish when translations are incomplete or validation fails.

## Source files

- Skill definition: `sync-post-localizations/SKILL.md`
- Codex UI metadata: `sync-post-localizations/agents/openai.yaml`
- Article audit script: `sync-post-localizations/scripts/audit_posts.py`
