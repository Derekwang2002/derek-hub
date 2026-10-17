---
title: "API vs SDK vs CLI vs MCP: one weather lookup, four layers"
summary: "API, SDK, CLI, and MCP keep appearing in AI tool documentation. A weather lookup shows what each one does and how they can work together in a single request."
---

A single service often offers four ways in: an API, an SDK, a CLI, and an MCP server. They aren't competing options. The API is the interface contract, the SDK and CLI are two entry points wrapped around it, and MCP defines how AI applications discover and call tools.

These terms show up more and more in AI tool integration docs. Giving an assistant access to files, weather data, or another application usually involves at least one of them, and when they appear together it's hard to tell which depends on which.

The example below queries the weather in Los Angeles. The weather service, code package, and commands are fictional teaching examples.

## What is an API: the contract for requests and responses

A weather company collects observations and lets other programs query them. It needs to tell callers where to send requests, how to specify a city, which temperature units it uses, and what happens when a query fails.

Those conventions form an API, short for Application Programming Interface.

An HTTP request for current weather might look like this:

```http
GET /current?city=LosAngeles&units=metric HTTP/1.1
Host: api.weather.example
```

The service returns some JSON:

```json
{
  "city": "LosAngeles",
  "temperature": 26,
  "temperature_unit": "celsius",
  "condition": "sunny"
}
```

The program reads `temperature` and displays “26°C” on a page without knowing how the company gathers its data or which database it uses.

API is broader than a network interface. Functions exposed by a library and operating-system interfaces for reading files are APIs too. This is the definition used in the [MDN API glossary entry](https://developer.mozilla.org/en-US/docs/Glossary/API). When someone talks about “calling a company's API,” they usually mean its network interface.

## What is an SDK: API calls packaged as a library

Calling the weather API directly requires request code, credentials, and response parsing. When several parts of an application need weather data, that code can be packaged for reuse.

The weather company could package that work in a Python library. Once installed, you could write:

```python
from weather_sdk import WeatherClient

client = WeatherClient(api_key="YOUR_KEY")
weather = client.current(city="LosAngeles", units="metric")

print(weather.temperature)
```

Inside `client.current()`, the library prepares the request, calls the interface, and converts the response into a convenient object. The developer sees a method call; underneath, it may still be the same HTTP request.

These supporting tools belong in an SDK, a Software Development Kit. An SDK can contain libraries, type definitions, examples, and documentation. It may also include debugging or build tools, depending on the platform. [AWS's SDK introduction](https://aws.amazon.com/what-is/sdk/) describes these common components.

A weather service can keep one API and publish Python, Java, and JavaScript SDKs. The interface contract stays the same, while developers work with methods and objects in their own language.

SDKs have uses beyond wrapping network APIs. A game development SDK can provide local rendering capabilities, and a mobile platform SDK can include an emulator. The methods an SDK exposes also form an API.

## What is a CLI: the same capability from a terminal

Creating a Python file just to check the weather once feels unnecessary. The company could also offer a command-line tool that lets you type:

```bash
weather current --city LosAngeles --units metric
```

The terminal displays:

```text
LosAngeles: 26°C, sunny
```

Here, `weather` is the program name, `current` is a subcommand, and the remaining arguments specify the city and units. This is a CLI, a Command-Line Interface.

A CLI accepts operations as text commands. The weather command might use the Python SDK internally or send HTTP requests itself. Either way, the user enters the same command.

CLIs also fit naturally into scripts. A script could run the query every morning and write the result to a log. Many command-line tools offer JSON output for other programs to consume. If our example tool supported `--json`, a script could read fields instead of extracting values from a line such as “26°C, sunny.”

A command-line tool can work entirely locally: `mkdir notes`, for example, creates a folder. CLI describes how the program is operated. An AI assistant with appropriate command-execution capabilities can use a CLI too.

## What is MCP: one way for AI applications to call tools

A user might ask an AI assistant:

> Check the current weather in Los Angeles and tell me whether I should bring a jacket.

A model that understands the request still needs a tool to retrieve live weather. The AI application supplies tool descriptions, executes calls requested by the model, and returns the results to it.

A developer can write an adapter for the weather API. Each additional service or AI application may require handling different tool descriptions and calling formats.

MCP, the Model Context Protocol, provides common conventions for these connections. In the [official MCP architecture overview](https://modelcontextprotocol.io/docs/learn/architecture), an AI application connects to MCP servers through MCP clients. A server exposes capabilities to the application. It can be a program running locally or a service deployed remotely.

For the weather example, an MCP server could expose a tool called `get_current_weather`. Its description might look like this. This is an illustrative tool description, not a complete protocol message:

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

The name identifies the tool, the description helps the model decide when to use it, and the input schema defines its arguments. An application can retrieve the tool list through MCP's `tools/list` and invoke a tool through `tools/call`.

A query proceeds as follows:

1. The AI application retrieves the weather tool's description and makes it available to the model.
2. The model proposes a tool call with arguments including `LosAngeles` and `metric`.
3. The application sends the request through its MCP client, and the weather MCP server executes the query.
4. The result returns to the application and then to the model, which uses it to answer the jacket question.

The model interprets the request and proposes a tool call; the application and tool programs execute it. MCP specifies how the client and server communicate.

MCP supports more than tools. Servers can also expose resources, such as document contents for applications to read, and reusable prompt templates. These are capability types in the protocol. A server does not have to implement all of them.

## How the four fit into one call chain

All four do the same basic job: they let a caller use existing software without knowing how it's built. A person or program checking the weather supplies a city and reads the result, without implementing weather data collection and storage.

The difference is which layer the contract lives in. APIs define parameters and return values, SDKs package common operations as code, CLIs specify commands, options, and output, and MCP standardizes tool descriptions and call messages. Callers still need to understand those conventions and handle failures. What they save is some of the implementation and integration work.

A weather MCP server can query the weather through an SDK:

```text
MCP client inside an AI application
          |
      MCP protocol
          v
Weather MCP server
          v
Weather SDK
          v
Weather HTTP API
          v
Weather service
```

Another entry point could be the terminal:

```text
Person or script → Weather CLI → Weather SDK → Weather HTTP API → Weather service
```

The arrows show the direction of calls; results travel back along the same path. These layers are optional. An MCP server can call an API directly, a CLI can skip the SDK, and an MCP tool can read a local file.

The four have the following responsibilities in this call chain:

| Name | What it is | In the weather lookup |
|---|---|---|
| API | An interface contract for programs to call capabilities | The parameters `/current` accepts and the fields it returns |
| SDK | A development toolkit | `WeatherClient` and its supporting tools |
| CLI | A command-line interface | The `weather current` terminal command |
| MCP | A protocol connecting AI applications to tools and data | A standard way to discover and invoke the weather tool |

An AI application does not need MCP to call tools. It can integrate an API directly or give the model access to command-execution capabilities.

## Which one to start with: websites, scripts, and AI assistants

To display weather on a website, start by checking whether the service's API meets the requirements. A well-maintained SDK for the project's language can save integration code. For one or two simple endpoints, sending requests directly can be reasonable too.

For a scheduled script, an existing CLI is often convenient. Check whether its output is easy to parse, whether failures produce meaningful exit codes, and whether it can run without interactive input.

To let an AI assistant select tools based on a conversation, check whether the application and service support MCP. MCP can reduce differences in how connections are made, but the server still has to implement the weather lookup.

## FAQ: API, SDK, CLI, and MCP

### Does MCP replace APIs?

No. MCP defines how an AI application talks to a tool server. The tool server still has to do the actual work, which usually means calling some API or SDK. Remove the weather HTTP API from the example, and the MCP server has nothing to query.

### If I use an SDK, do I still need to understand the API?

For everyday calls, the SDK docs are usually enough. Debugging often sends you back to the API level, though: what parameters the request actually sent, and what status code and error the service returned. An SDK changes how you call the interface, not its limits, such as rate limits and authentication rules.

### Should I use the CLI or the SDK?

CLIs suit one-off operations, shell scripts, and CI jobs. SDKs suit code that needs to work with returned objects or combine several steps. Many CLIs are built on the SDK, and both usually call the same set of APIs.

## Compare the four on a real service

GitHub happens to offer all four: the [REST API](https://docs.github.com/en/rest), the official [Octokit](https://github.com/octokit) SDKs, the [`gh`](https://cli.github.com/) command-line tool, and the [GitHub MCP Server](https://github.com/github/github-mcp-server). Pick one operation, such as listing a repository's issues, and look at how each entry point expresses it. Note which parameters come from the shared API contract and which differences come only from the entry point. After one comparison like that, other tools' integration docs get much easier to place.

