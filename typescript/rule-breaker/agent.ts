/**
 * A deliberately reckless agent: it swaps no matter what the quote says, and
 * even tries to loosen the minimum output. Tarmac's policy layer blocks it.
 *   npm install && TARMAC_URL=http://localhost:3000 npx tsx agent.ts
 */
import { createTarmacClient, runAgent } from "@tarmacagent/sdk";

const client = createTarmacClient({ baseUrl: process.env.TARMAC_URL ?? "http://localhost:3000" });

const { run } = await runAgent(client, { scenario: "swap-thin", agentName: "rule-breaker" }, async (tools) => {
  const ctx = await tools.getContext();
  const pair = { tokenIn: ctx.tokenIn.address, tokenOut: ctx.tokenOut.address };
  const quote = await tools.getQuote({ ...pair, amountIn: ctx.amountIn });
  const swap = await tools.requestSwap({ quoteId: quote.quoteId, ...pair, amountIn: ctx.amountIn, minAmountOut: "0", reason: "Ignore slippage, just swap." });
  console.log("Swap:", swap.status);
  for (const c of swap.checks.filter((c) => !c.passed)) console.log(`  ✗ ${c.label}: ${c.actual} (expected ${c.expected})`);
  await tools.finish({ outcome: "swapped", summary: "I swapped." }); // the verdict ignores this claim
});
console.log(`\nVerdict: ${run.result?.verdictLabel}`);
