# API contracts for the 30-Question enrichment comparison

Verified against primary provider documentation on 2026-10-30. This note covers the authorized evaluation only: Haiku 5.5 for Title/Topics and full Clef for Topics. Examples below are constructed from the documented schemas; their values are illustrative, not observed model responses. No credentials or paid inference calls were used for this verification.

## Anthropic Haiku 5.5

Use `POST https://api.anthropic.com/v1/messages` with `Authorization: Bearer <ANTHROPIC_API_KEY>`, `content-type: application/json`, and `anthropic-version: 2026-10-21`. Current documentation recommends Bearer authentication; `x-api-key` remains a supported fallback, and keys that can act on multiple workspaces can require `anthropic-workspace-id`. [1]

The model ID is `claude-haiku-5-5`. [2] A suitable request shape is:

```json
{
  "model": "claude-haiku-5-5",
  "max_tokens": 512,
  "thinking": { "type": "disabled" },
  "output_config": {
    "effort": "low",
    "format": {
      "type": "json_schema",
      "schema": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "description": "A short specific title, at most 60 characters."
          },
          "topics": {
            "type": "array",
            "minItems": 1,
            "items": { "type": "string", "enum": ["strings", "recursion"] },
            "description": "One to three distinct relevant topics."
          }
        },
        "required": ["title", "topics"],
        "additionalProperties": false
      }
    }
  },
  "messages": [
    { "role": "user", "content": "<shared topic definitions and instructions>\n\n<question Markdown>" }
  ]
}
```

The example enum is shortened; the evaluation must supply the complete, identical 26-Topic vocabulary and definitions to both candidates. The output-token cap is an evaluation choice, not a provider requirement.

`thinking: {"type":"disabled"}` is supported on Haiku 5.5, and `output_config.effort` controls overall effort independently. [3] Omit `temperature`, `top_p`, and `top_k`; Haiku 5.5 rejects them. [4] The supported structured-output request field is `output_config.format`, with `type: "json_schema"`; no structured-output beta header is needed. [5]

Do not send `maxItems`, `uniqueItems`, or `maxLength` in the Anthropic schema: array constraints beyond `minItems` 0/1 and string length constraints are unsupported. [6] Validate a nonempty Title of at most 60 characters and one to three unique in-vocabulary Topics locally; record invalid output rather than silently rewriting it during the comparison.

Read the response's text content blocks by `type`, parse their JSON, and retain the original response and usage for the report. [5] The following is the relevant response subset:

```json
{
  "id": "msg_example",
  "model": "claude-haiku-5-5",
  "content": [
    { "type": "text", "text": "{\"title\":\"Count nested brackets\",\"topics\":[\"strings\",\"recursion\"]}" }
  ],
  "stop_reason": "end_turn",
  "stop_details": null,
  "usage": {
    "input_tokens": 800,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0,
    "output_tokens": 35,
    "output_tokens_details": { "thinking_tokens": 0 }
  }
}
```

Important version detail: the current Create Message reference documents `stop_details` as a refusal object or null, and its example combines `stop_reason: "end_turn"` with `stop_details.type: "refusal"`. [7] The structured-output guide still describes the older `stop_reason: "refusal"` shape; reject either refusal form and truncated output, rather than relying on HTTP 200 or `end_turn` alone. [8]

The total input-token count is `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`; retain each component because their prices differ when caching is used. [9] Structured output adds a billed system prompt, so body length and serialized user text alone underestimate input. [10] Use returned `usage`, including output and thinking-token details where present, as the measured comparison record.

## Full Cloudflare Clef

Use `POST https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/run/@cf/cloudflare/clef` with `Authorization: Bearer <CLOUDFLARE_API_TOKEN>` and `content-type: application/json`. Send the model inputs directly; do not wrap them in `input` or `options`. [11]

```json
{
  "model": "clef",
  "state": "<question Markdown>",
  "questions": {
    "strings": {
      "type": "noul",
      "instructions": "Does this question centrally concern strings? <shared strings definition>",
      "criteria": {
        "true": "Strings are a central subject of the requested task.",
        "false": "Strings are incidental, absent, or only an optional implementation detail."
      }
    },
    "recursion": {
      "type": "noul",
      "instructions": "Does this question centrally concern recursion? <shared recursion definition>"
    }
  }
}
```

The `model`, `state`, and `questions` fields are required. Each `noul` question requires `type` and `instructions`; its `criteria.true` and `criteria.false` descriptions are optional. The official input schema permits 1–64 question IDs made from letters, digits, `_`, `.`, or `-`, so the 26 Topic IDs fit in one request. [Clef input JSON schema](https://developers.cloudflare.com/workers-ai/models/clef/schema-input.json)

Each answer is an object containing `type: "noul"` and `noul: <number between 0 and 1>`, not a bare number and not a `{true, false}` distribution. The model output requires `model`, `answers`, and `usage`, with integer `input_tokens` and `output_tokens`. [Clef output JSON schema](https://developers.cloudflare.com/workers-ai/models/clef/schema-output.json) The REST API adds the normal Cloudflare result envelope. [12]

```json
{
  "result": {
    "model": "clef",
    "answers": {
      "strings": { "type": "noul", "noul": 0.91 },
      "recursion": { "type": "noul", "noul": 0.23 }
    },
    "usage": { "input_tokens": 1000, "output_tokens": 0 }
  },
  "success": true,
  "errors": [],
  "messages": []
}
```

For each requested Topic, read `body.result.answers[topic].noul`, verify `type === "noul"`, and require a finite value in `[0, 1]`. Preserve all 26 scores in the report before applying a provisional threshold and maximum-of-three display rule; scores are not measured accuracy, and a threshold must not force a Topic when none qualifies.

The normal Cloudflare v4 failure shape has `success: false`, an `errors` array containing `code` and `message`, and commonly `result: null`; that standard envelope is documented explicitly in Cloudflare's error reference. [13] Also handle HTTP failure and non-JSON responses independently, without logging authorization headers or environment values.

Clef billing is input-only; output tokens are not charged. [14] Its context budget includes the questions as well as state, and long state may be truncated. [15] The input schema plus per-Topic instructions can therefore make a Clef request substantially larger than the Question body; use returned `result.usage.input_tokens` for measured cost, rather than applying a character estimate to the body alone. No exact formula for the serialized question-overhead token count was found in the inspected schemas and model documentation.

## Evaluation records

For every candidate/Question pair, record request model ID, API version where applicable, prompt/definitions hash, source Question ID, raw validated result, latency, usage, retry count, HTTP/provider error code, and whether local output validation passed. Avoid inferring a quality winner from agreement alone: the report still needs human review of titles and topic relevance. This note does not select or integrate a production provider.

**Sources**

[1] [Anthropic authentication and current API-version headers](https://expand.land/s/01a18e92-5d96-7032-9584-4611e151e099?id=2729)

[2] [Haiku 5.5 fixed API ID](https://expand.land/s/01a18dcd-2e42-77ac-a893-9c6af5101686?id=2013)

[3] [Haiku disabled thinking and effort](https://expand.land/s/01a18dcc-9442-700d-9baa-e0e9f6f866ee?id=3650)

[4] [Haiku 5.5 sampling parameters](https://expand.land/s/01a18dcb-f784-77a8-81ec-f7c25535ee72?id=1719)

[5] [Structured-output request and text response](https://expand.land/s/01a18dcb-d440-7189-838a-04145f5e8664?id=4753)

[6] [Anthropic schema limitations](https://expand.land/s/01a18dcb-d440-7189-838a-04145f5e8664?id=4875)

[7] [Current Message stop-details response](https://expand.land/s/01a18e92-74cf-75f1-813c-97aa27ca2d1d?id=12227)

[8] [Legacy refusal description in structured-output guide](https://expand.land/s/01a18dcb-d440-7189-838a-04145f5e8664?id=4938)

[9] [Anthropic total input-token accounting](https://expand.land/s/01a18e92-74cf-75f1-813c-97aa27ca2d1d?id=12217)

[10] [Additional billed schema prompt](https://expand.land/s/01a18dcb-d440-7189-838a-04145f5e8664?id=4845)

[11] [Clef REST request](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2149)

[12] [Workers AI REST response envelope](https://expand.land/s/01a18e92-c14a-7108-8c29-4df5c2302ea3?id=1448)

[13] [Standard Cloudflare v4 error envelope](https://expand.land/s/01a18e93-408b-77f7-a409-6f5e44ff73a1?id=1715)

[14] [Clef input-only billing](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2124)

[15] [Clef context and question overhead](https://expand.land/s/01a18dcc-4136-712a-8882-0239d2d4edfe?id=2141)
