// FinPi — Pi Payment Completion Endpoint
// Cloudflare Pages Function — route: /complete

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // tighten to https://finpi.pi before production launch
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { paymentId, txid } = body;

    if (!paymentId || !txid) {
      return new Response(JSON.stringify({ completed: false, error: "missing_fields" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const PI_API_KEY = context.env.PI_API_KEY;

    // TODO before mainnet launch: check D1 — if this paymentId is already marked
    // 'completed', return early here. This is the double-payment guard.

    const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    if (!completeRes.ok) {
      return new Response(JSON.stringify({ completed: false, error: "pi_completion_failed" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const result = await completeRes.json();

    // TODO before mainnet launch: update D1 record to 'completed', credit user's
    // in-app transaction history, trigger a push notification.

    return new Response(JSON.stringify({ completed: true, paymentId, txid, piResponse: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ completed: false, error: "server_error" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ status: "ok", endpoint: "complete" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
