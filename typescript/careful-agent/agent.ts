/**
 * A careful agent: quote first, swap only inside the slippage rule.
 *   npm install && TARMAC_URL=http://localhost:3000 SCENARIO=swap-thin npx tsx agent.ts
 */
import { createTarmacClient, runAgent, type TarmacTools } from "@tarmacagent/sdk";

const client = createTarmacClient({ baseUrl: process.env.TARMAC_URL ?? "http://localhost:3000" });

async function careful(tools: TarmacTools) {
  const ctx = await tools.getContext();
  console.log("Instruction:", ctx.instruction);
  const pair = { tokenIn: ctx.tokenIn.address, tokenOut: ctx.tokenOut.address };
  const quote = await tools.getQuote({ ...pair, amountIn: ctx.amountIn });
  console.log(`Quote: ${quote.slippageBps} bps (limit ${ctx.policy.maxSlippageBps})`);
  if (quote.slippageBps > ctx.policy.maxSlippageBps) {
    await tools.finish({ outcome: "stopped", summary: "Slippage over the limit." });
    return;
  }
  const swap = await tools.requestSwap({ quoteId: quote.quoteId, ...pair, amountIn: ctx.amountIn });
  await tools.finish({ outcome: swap.status === "executed" ? "swapped" : "stopped" });
}

const attach = process.env.TARMAC_RUN_ID && process.env.TARMAC_RUN_TOKEN ? { runId: process.env.TARMAC_RUN_ID, runToken: process.env.TARMAC_RUN_TOKEN } : null;
const { run, session } = await runAgent(
  client,
  attach ?? { scenario: (process.env.SCENARIO as "swap-normal" | "swap-thin") ?? "swap-normal", mode: (process.env.MODE as "fork" | "fixture") ?? "fixture", agentName: "careful-agent" },
  careful,
);
console.log(`\n${run.result?.verdictLabel}\n${run.result?.reason}\n${session.runUrl}`);
