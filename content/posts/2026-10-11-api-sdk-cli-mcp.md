---
title: "API、SDK、CLI、MCP 有什么区别：用一次天气查询讲清四者分工"
date: 2026-10-11
summary: "AI 工具的文档里总能碰到 API、SDK、CLI 和 MCP。借一个查天气的例子，看看它们各自负责什么，又怎样在同一次调用里配合。"
tags: [ai, software-engineering, developer-tools]
selected: false
draft: false
---

同一个服务，常常同时提供 API、SDK、CLI 和 MCP 四种接入方式。它们不是四选一的竞争关系：API 是接口约定，SDK 和 CLI 是包在它外面的两种使用入口，MCP 则规定 AI 应用怎样发现和调用工具。

这几个词在 AI 工具的接入文档里出现得越来越频繁。让助手读文件、查天气、操作软件，往往都要碰到它们，混在一起时很难看出谁依赖谁。

下面用查询洛杉矶天气来说明。天气服务、代码包和命令均为教学示例。

## API 是什么：定义请求和返回的约定

天气公司收集了气象数据，并允许其他程序来查询。它需要先告诉调用者：请求发到哪里，城市怎么传，温度用什么单位，查询失败会得到什么结果。

这些约定构成了 API，也就是 Application Programming Interface，应用程序编程接口。

例如，查询当前天气的 HTTP 请求可以是：

```http
GET /current?city=LosAngeles&units=metric HTTP/1.1
Host: api.weather.example
```

服务返回一段 JSON：

```json
{
  "city": "LosAngeles",
  "temperature": 26,
  "temperature_unit": "celsius",
  "condition": "sunny"
}
```

程序读出 `temperature`，就能在页面上显示“26°C”，无须了解天气公司怎样收集数据、用了什么数据库。

API 的范围比网络接口更大。库里可以调用的函数、操作系统提供的文件读取接口，也都是 API。MDN 的 [API 词条](https://developer.mozilla.org/en-US/docs/Glossary/API)采用的就是这种定义。平时说“调用某家公司的 API”，通常特指它的网络接口。

## SDK 是什么：把 API 调用封装成代码库

直接调用天气 API，需要编写请求代码、传入认证信息，再解析返回结果。多个地方都要查询天气时，这部分代码可以封装起来复用。

天气公司可以把它们做成一个 Python 包。安装后，你这样写：

```python
from weather_sdk import WeatherClient

client = WeatherClient(api_key="YOUR_KEY")
weather = client.current(city="LosAngeles", units="metric")

print(weather.temperature)
```

`client.current()` 内部负责组织请求、调用接口，把结果转换成方便使用的对象。开发者看到的是一个方法调用，背后仍然可能是刚才那次 HTTP 请求。

这类配套工具属于 SDK，即 Software Development Kit，软件开发工具包。一个 SDK 可能包含代码库、类型定义、示例、文档，也可能带有调试或构建工具。具体包含什么，取决于它服务的平台。[AWS 对 SDK 的介绍](https://aws.amazon.com/what-is/sdk/)列出了这些常见组成部分。

天气服务可以保持同一套 API，同时发布 Python、Java 和 JavaScript SDK。接口约定相同，开发者使用的是各自语言里的方法和对象。

SDK 的用途不限于封装网络 API。游戏开发 SDK 可以提供本地渲染能力，移动平台 SDK 可以包含模拟器。SDK 对外提供的方法也属于 API。

## CLI 是什么：在终端里使用同一份能力

如果只是临时查一次天气，专门新建一个 Python 文件有些麻烦。天气公司还可以做一个命令行工具，让你在终端输入：

```bash
weather current --city LosAngeles --units metric
```

终端随即显示：

```text
LosAngeles: 26°C, sunny
```

这里的 `weather` 是程序名，`current` 是子命令，后面的参数指定城市和单位。这就是 CLI，Command-Line Interface，命令行界面。

CLI 通过文字命令接收操作。这个天气命令内部可以使用 Python SDK，也可以自己发送 HTTP 请求，对使用者来说，输入方式是一样的。

CLI 也很适合放进脚本。比如每天早上执行一次查询，再把结果写进日志。为了方便其他程序读取，许多命令行工具还提供 JSON 输出；如果示例工具支持 `--json`，脚本就能解析字段，不用从一句“26°C, sunny”里拆字符串。

命令行工具也可以只在本地工作，例如 `mkdir notes` 用来创建文件夹。CLI 描述的是操作方式。AI 助手获得相应的命令执行能力后，同样能使用 CLI。

## MCP 是什么：让 AI 应用用统一方式调用工具

在 AI 助手里，用户可能直接提出这样的要求：

> 查一下洛杉矶现在的天气，告诉我出门要不要带外套。

模型理解了这句话，仍然需要工具来获取实时天气。AI 应用负责提供工具说明，在模型请求调用时执行工具，再把结果交回模型。

开发者可以为天气 API 编写适配代码。每接入一项服务、适配一个 AI 应用，都可能需要处理不同的工具描述和调用格式。

MCP，也就是 Model Context Protocol，模型上下文协议，为这些连接提供统一约定。按照 [MCP 官方架构说明](https://modelcontextprotocol.io/docs/learn/architecture)，AI 应用通过 MCP 客户端连接 MCP 服务端；服务端向应用暴露可用能力。这个服务端可以是本地运行的程序，也可以部署在远端。

在天气例子里，MCP 服务端可以提供一个 `get_current_weather` 工具。它的说明大致如下，这只是工具描述的示意，不是完整的协议报文：

```json
{
  "name": "get_current_weather",
  "description": "Get the current weather for a city",
  "inputSchema": {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "units": { "type": "string", "enum": ["metric", "imperial"] }
    },
    "required": ["city", "units"]
  }
}
```

工具名说明调用哪个功能，描述帮助模型判断什么时候需要它，输入结构规定参数怎么填写。应用可以通过 MCP 的 `tools/list` 获取工具列表，通过 `tools/call` 发起调用。

一次查询的执行过程如下：

1. AI 应用获取天气工具的说明，并把它提供给模型。
2. 模型根据问题提出工具调用，参数包含 `LosAngeles` 和 `metric`。
3. 应用通过 MCP 客户端发出请求，天气 MCP 服务端执行查询。
4. 查询结果返回应用，再交给模型，用来回答是否需要外套。

模型负责理解问题并提出工具调用，应用及工具程序负责执行。MCP 规定客户端与服务端怎样通信。

MCP 也不只有工具。服务端还可以提供供应用读取的资源（Resources），例如文档内容，以及可复用的提示模板（Prompts）。这些都是协议里的能力类型，并不要求每个服务端全部实现。

## 四者怎样串成一条调用链

四者做的是同一件事：让调用者使用已有的软件能力，而不必了解内部实现。查天气的人或程序提供城市、读取结果，无须重新实现气象数据的采集和存储。

区别在于约定落在哪一层。API 定义参数和返回值，SDK 把常用操作封装成代码，CLI 约定命令、选项和输出，MCP 统一工具描述与调用消息。调用者仍要了解这些约定，也要处理调用失败；省去的是一部分实现和接入工作。

天气 MCP 服务端可以通过 SDK 查询天气：

```text
AI 应用中的 MCP 客户端
          │
       MCP 协议
          ↓
天气 MCP 服务端
          ↓
天气 SDK
          ↓
天气 HTTP API
          ↓
天气服务
```

另一条入口可能是终端：

```text
人或脚本 → 天气 CLI → 天气 SDK → 天气 HTTP API → 天气服务
```

这里的箭头表示调用方向，结果沿原路返回。这些层也不是必选项：MCP 服务端可以直接请求 API，CLI 可以跳过 SDK，MCP 工具也可以直接读取本地文件。

在这条调用链中，四者的分工如下：

| 名称 | 它是什么 | 查天气时对应的东西 |
|---|---|---|
| API | 程序调用能力的接口约定 | `/current` 接收哪些参数、返回哪些字段 |
| SDK | 开发工具包 | 程序里使用的 `WeatherClient` 及配套工具 |
| CLI | 命令行界面 | 终端里的 `weather current` 命令 |
| MCP | AI 应用连接工具和数据的协议 | 获取天气工具说明并发起调用的统一方式 |

AI 调用工具也不一定经过 MCP。应用可以直接集成 API，或者向模型提供命令执行能力。

## 该从哪一个入手：网站、脚本和 AI 助手

如果要在网站上显示天气，先看天气服务的 API 是否满足需求。有维护良好、适合项目语言的 SDK，就可以省掉一部分接入代码；只调用一两个简单接口，直接发请求也很合理。

如果要写定时脚本，现成的 CLI 往往更省事。此时要看它的输出是否方便解析、出错时有没有明确的退出码，以及能否在不需要人工输入的情况下运行。

如果要让 AI 助手按对话内容选择工具，再看应用和服务是否支持 MCP。MCP 可以减少连接方式上的差异，但天气查询怎么实现，依然需要服务端处理。

## 关于 API、SDK、CLI、MCP 的几个常见问题

### MCP 会取代 API 吗？

不会。MCP 规定的是 AI 应用和工具服务端之间怎样通信，工具服务端要完成实际工作，通常还得调用某个 API 或 SDK。天气例子里，去掉天气 HTTP API，MCP 服务端也就查不到天气了。

### 用了 SDK，还需要了解 API 吗？

日常调用可以只看 SDK 文档。但排查问题时，常常要回到 API 层面：请求实际发了什么参数，服务返回了什么状态码和错误信息。SDK 封装了调用方式，没有改变底层接口的限制，比如频率限制和认证规则。

### CLI 和 SDK 该选哪个？

临时操作、Shell 脚本和 CI 任务适合 CLI；需要在程序里处理返回对象、组合多步逻辑时，SDK 更合适。很多 CLI 本身就是用 SDK 写的，两者调用的往往是同一组 API。

## 拿一个真实服务对照一遍

GitHub 正好四种入口都有：[REST API](https://docs.github.com/en/rest)、官方 SDK [Octokit](https://github.com/octokit)、命令行工具 [`gh`](https://cli.github.com/)，以及 [GitHub MCP Server](https://github.com/github/github-mcp-server)。挑一个操作，比如列出某个仓库的 Issue，分别看它在四处的写法：哪些参数是同一份 API 约定，哪些只是入口不同带来的差异。对照一遍之后，再读其他工具的接入文档，就容易分清自己面对的是哪一层。

