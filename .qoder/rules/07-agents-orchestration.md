# Rule: Agent Orchestration

**Apply: Specific Files —
`packages/agents/**`, `**/agents/**`, `_\_agent.py`, `_\_agent.ts`\*\*

Sentra's AI agents are constrained, observable, and recoverable. They are not
autonomous decision-makers; they are scoped task executors with explicit
boundaries.

## Agent shape

Every agent is defined by:

```python
class AgentSpec(BaseModel):
    name: str                          # e.g. "ocr_triage_agent"
    purpose: str                       # one sentence
    allowed_tools: list[str]           # explicit allowlist
    forbidden_paths: list[str]         # filesystem/network denylist
    max_steps: int = 20                # hard ceiling on iterations
    max_tokens: int = 50_000           # hard ceiling on context
    timeout_seconds: int = 120
    requires_human_confirmation: list[str]  # tool names needing approval
    model_version: str
```

Agents without an `AgentSpec` are not allowed in production.

## Tool design

- Each tool has a typed input schema (Pydantic) and a typed output schema.
- Tools fail loudly. They return `ToolError` with a reason; they do not return
  empty strings.
- Tools that mutate state (write a file, send a message, update a record)
  require explicit `confirmation_required=True`.
- Tools never access PHI sources unless the agent's `AgentSpec` explicitly
  authorizes the path.

```python
class OcrToolInput(BaseModel):
    document_path: Path
    page_range: tuple[int, int] | None = None
    language: Literal["id", "en"] = "id"

class OcrToolOutput(BaseModel):
    pages: list[OcrPage]
    confidence: float
    warnings: list[str]
```

## Loop control

- Hard ceiling: `max_steps` (default 20). When reached, agent stops and reports.
- Soft ceiling: detect repeated tool calls with similar inputs → stop and ask
  the user.
- Cost monitor: track tokens per step. When cumulative cost exceeds
  `max_tokens`, stop.
- Heartbeat: every step writes a log entry to `agent_run` table. A run that has
  not emitted in `timeout_seconds` is killed.

## Error recovery pattern

Use the **Reflect → Retry → Refuse** pattern:

1. **Reflect:** on tool error, the agent gets the error message and chooses the
   next step.
2. **Retry:** at most 2 retries per tool call, with exponential backoff.
3. **Refuse:** if the third attempt fails, the agent returns an `AgentRefusal`
   with the error history and stops.

```python
async def safe_tool_call(tool: Tool, input: BaseModel, *, max_retries: int = 2) -> ToolResult:
    for attempt in range(max_retries + 1):
        try:
            return await tool.invoke(input)
        except TransientToolError as e:
            if attempt == max_retries:
                raise AgentRefusal(reason="tool_persistently_failing", error=str(e))
            await asyncio.sleep(2 ** attempt)
        except PermanentToolError:
            raise  # do not retry permanent errors
```

## Memory and context

- Short-term memory (within a run): structured todo list + tool call history.
- Long-term memory (across runs): only for explicitly opted-in projects, and
  never includes PHI.
- The agent's working context is rebuilt each run from authoritative sources
  (DB, repo). Do not trust prior summaries as source of truth.

## Forbidden patterns

- Open-ended agents with no `max_steps`.
- Agents that can call themselves recursively without depth limit.
- Agents that can write to `packages/clinical-core/` without human approval.
- Agents that can read from `patient-data/` unless explicitly authorized in the
  spec.
- "Just one more retry" loops without a documented backoff and ceiling.
- Tool descriptions that lie about side effects.

## Observability requirements

Every agent run emits:

- `agent_run_started` with the spec name, version, and input hash.
- `agent_step` per iteration with the tool, input hash, output hash, latency.
- `agent_run_completed` with the outcome (`success`, `refusal`, `error`,
  `timeout`) and total cost.

Logs go to the `agent_runs` table. A run without logs is not a valid run.

## When to build an agent vs a script

- **Script:** the workflow is deterministic, the steps are known, the failure
  modes are predictable.
- **Agent:** the workflow requires branching based on dynamic content, and a
  deterministic script would be fragile.

Prefer scripts. Agents add capability and cost in equal measure. The bar for
"let's make this an agent" is: "we tried writing it as a script and the
branching exploded."
