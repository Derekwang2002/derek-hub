# derek-hub 接入格式与验证

## 数据契约

以仓库根目录的 `lib/benchmark.ts` 为准，本文说明创建 Skill 时的接口。不要使用不存在的字段，或仅修改示例而漏改类型、校验器和组件。

| 字段 | 当前规则 |
|---|---|
| `title` | 非空的图表标题 |
| `locale` | `zh` 或 `en`，与所在文章一致 |
| `basis` | `published`（已发表实验）或 `illustrative`（教学模型） |
| `note` | 非空、可见的方法和边界说明 |
| `scenarios` | 至少一个场景 |
| 场景 `id` | 小写字母、数字和连字符，同一图表内唯一 |
| `eyebrow` / `label` | 标签页的两行文案，分别概括指标与条件 |
| `description` | 当前指标含义、方向和必要计算 |
| `unit` | 可选但不能是空串；无量纲时省略 |
| `theme` | 可选：`ocean`、`sunset`、`aurora`、`violet` |
| `values` | 至少一项；`label` 在场景内唯一，`value` 为有限非负数 |
| 数值 `displayValue` | 可选，呈现近似值、格式或单复数；必须与计算值一致 |
| 数值 `emphasis` | 可选布尔值，强调读者应关注的方案 |

来源链接放在紧邻图表的普通 Markdown 段落中；`note` 是纯文本，不会解析 Markdown 链接。若新增本地实测这一证据类别，需要同时扩展 `basis`、解析器、双语 badge 和测试，不将本地实测误标为已发表实验，也不把教学数据改个标签就当实测。

## 最小示例

下面是用于解释并行计算的假设模型。仅在该假设能支撑当前文章时采用，不将数值当默认 benchmark。

````markdown
假设两个请求相互独立、资源充足，分别耗时 2 s 和 3 s，可以先算出串行与并行的等待差异：

```benchmark
{
  "title": "独立请求的等待预算",
  "locale": "zh",
  "basis": "illustrative",
  "note": "教学假设：两个独立请求分别耗时 2 s 和 3 s，忽略调度开销。不是实测结果。",
  "scenarios": [
    {
      "id": "parallel",
      "eyebrow": "等待时间",
      "label": "独立请求",
      "description": "越低越好。串行：2 + 3 = 5；并行：max(2, 3) = 3。",
      "unit": "s",
      "theme": "ocean",
      "values": [
        { "label": "串行请求", "value": 5 },
        { "label": "并行请求", "value": 3, "emphasis": true }
      ]
    }
  ]
}
```
````

只有一个指标时不必人为增加标签页；如果一个静态对比更清楚，也可以用表格。增加第二个场景时保留可比条件，并将其 ID 与已有场景区分。

## 现成的落点

以下路径相对仓库根目录；阅读最接近当前任务的一例即可，不必全部加载：

- `content/posts/2026-07-20-ponytail-review-skill.md`：引用实验、基线 100 的相对指数。
- `content/posts/2026-07-10-docker-introduction.md`：操作次数模型，区别于实际耗时。
- `content/posts/2026-05-01-mysql-notes.md`：两个指标及零值；站点路径为 `/notes/mysql-notes`，不是 `/blog/mysql-notes`。
- `content/projects/call-e/items/latency-optimization.md`：假设延迟预算，保留项目文档壳与 pager。

普通文章的英文稿在 `content/translations/en/posts/`；项目文档的英文稿在 `content/translations/en/projects/`。中文路由带 `/zh`，英文路由不带。遵循当前 loader 的实际归属，不从文件名推测 route。

## 运行检查

在仓库根目录，根据当前 `package.json` 选择适用的现有检查：

```bash
npm run test:benchmark
npm run typecheck
npm run test:toc
npm run test:notes
npm run test:projects
npm run lint
```

目前项目支持 Node 20–23；使用项目认可的 Node 版本（本次验证使用 Node 22），不要因本机默认版本不同就修改 engines。构建目录与现有开发服务分开，先查看当前配置；本项目已有的生产构建方式为：

```bash
NEXT_DIST_DIR=.next-prod npm run build
```

现有 `lib/benchmark.test.ts` 验证原来的四篇双语图表和数据边界。增加新图表时按需扩展相关覆盖，不为复制的每个字段写一套镜像断言。构建生成的 HTML 位于当前 distDir 的 `server/app/`；实际检查标题、证据标签、tab/panel 关联、隐藏状态和链接，不能只看源 Markdown。

浏览器检查需要在文章真实宽度下覆盖桌面和窄屏。可用 360–390 px 作为窄屏测试范围，但以实际 DOM viewport 为准；检查页面宽度未新增溢出、标签全部可达、单位没有断裂或裁切。检查完成后恢复临时 viewport 设置。

只在修改了相关代码、出现失败或仍有疑点时重复构建与测试。已有不相关警告如实说明，不把它们当作修改其他内容的授权。
