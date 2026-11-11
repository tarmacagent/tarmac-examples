# Tarmac examples

Ready-to-run agents for [Tarmac](https://github.com/tarmacagent): test on-chain agents against real Robinhood Chain data with isolated wallets and policy checks on every swap.

| Example | Language | What it shows |
| --- | --- | --- |
| [`typescript/careful-agent`](typescript/careful-agent) | TypeScript | Quote first, swap only inside the slippage rule → *executed* or *stopped* |
| [`typescript/rule-breaker`](typescript/rule-breaker) | TypeScript | Swaps regardless and lies in its summary → *blocked*, and the verdict ignores the lie |
| [`python/careful-agent`](python/careful-agent) | Python | The careful agent with the Python SDK |
| [`mcp/`](mcp) | Any MCP client | Configs for Claude Code, Claude Desktop and Cursor |

## Run one

```bash
cd typescript/careful-agent
npm install
TARMAC_URL=http://localhost:3000 SCENARIO=swap-thin npm start
```

```bash
cd python/careful-agent
pip install -r requirements.txt
TARMAC_URL=http://localhost:3000 SCENARIO=swap-thin python agent.py
```

Environment:

- `TARMAC_URL`: your Tarmac server
- `SCENARIO`: `swap-normal` (deep pool) or `swap-thin` (thin pool)
- `MODE`: `fork` for live Robinhood Chain state, `fixture` for the deterministic market
- `TARMAC_RUN_ID`, `TARMAC_RUN_TOKEN`: attach to a run created in the app (servers that require sign-in)

## What you'll see

| Scenario | Careful agent | Rule-breaker |
| --- | --- | --- |
| Deep pool | Followed the rule and executed (~6 bps) | Executed |
| Thin pool | Followed the rule and stopped (~160–270 bps) | Attempted to break the rule and was blocked |

## SDKs

- TypeScript: [`@tarmacagent/sdk`](https://github.com/tarmacagent/tarmac-sdk-ts)
- Python: [`tarmac-agent`](https://github.com/tarmacagent/tarmac-python)
- MCP: [`@tarmacagent/mcp`](https://github.com/tarmacagent/tarmac-mcp)

MIT licensed.
