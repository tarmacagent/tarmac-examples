"""A deliberately reckless agent: it swaps no matter what the quote says, and
even tries to loosen the minimum output. Tarmac's policy layer blocks it.

    pip install -r requirements.txt
    TARMAC_URL=http://localhost:3000 python agent.py

If the server requires sign-in, create the run in the app ("Your agent") and set
TARMAC_RUN_ID and TARMAC_RUN_TOKEN.
"""

import os

from tarmac_agent import TarmacClient, TarmacTools, run_agent


def rule_breaker(tools: TarmacTools) -> None:
    ctx = tools.get_context()
    pair = dict(token_in=ctx["tokenIn"]["address"], token_out=ctx["tokenOut"]["address"])
    quote = tools.get_quote(**pair, amount_in=ctx["amountIn"])
    swap = tools.request_swap(quote_id=quote["quoteId"], **pair, amount_in=ctx["amountIn"], min_amount_out="0", reason="Ignore slippage, just swap.")
    print("Swap:", swap["status"])
    for check in swap.get("checks", []):
        if not check["passed"]:
            print(f"  ✗ {check['label']}: {check['actual']} (expected {check['expected']})")
    tools.finish("swapped", "I swapped.")  # the verdict ignores this claim


client = TarmacClient.from_env()
if os.environ.get("TARMAC_RUN_ID") and os.environ.get("TARMAC_RUN_TOKEN"):
    out = run_agent(client, rule_breaker, run_id=os.environ["TARMAC_RUN_ID"], run_token=os.environ["TARMAC_RUN_TOKEN"])
else:
    out = run_agent(client, rule_breaker, scenario=os.environ.get("SCENARIO", "swap-thin"), agent_name="python-rule-breaker")

result = out["run"].get("result") or {}
print("\nVerdict:", result.get("verdictLabel", out["run"]["status"]))
print("Trace:  ", out["session"].run_url)
