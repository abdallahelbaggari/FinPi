// FinPi — Pi Payment Approval Endpoint
// Cloudflare Pages Function — route: /approve (the /functions/ prefix is stripped automatically)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // tighten to https://finpi.pi before production launch
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { paymentId, amount, memo } = body;

    if (!paymentId) {
      // Always return 200 — a non-200 response reads as "Payment Expired" on the Pi client.
      return new Response(JSON.stringify({ approved: false, error: "missing_payment_id" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const PI_API_KEY = context.env.PI_API_KEY;

    // Step 1: ask Pi's servers for the authoritative payment record —
    // never trust amount/memo as sent by the client.
    const piRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
      headers: { Authorization: `Key ${PI_API_KEY}` },
    });
    const piPayment = await piRes.json();

    if (!piPayment || piPayment.identifier !== paymentId) {
      return new Response(JSON.stringify({ approved: false, error: "payment_not_found" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Step 2: tell Pi's servers we approve it server-side.
    const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${PI_API_KEY}` },
    });

    if (!approveRes.ok) {
      return new Response(JSON.stringify({ approved: false, error: "pi_approval_failed" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // TODO before mainnet launch: persist { paymentId, amount, memo, userUid, status:'approved' } to Cloudflare D1

    return new Response(JSON.stringify({ approved: true, paymentId }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    return new Response(JSON.stringify({ approved: false, error: "server_error" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}

// Health check — visit /approve in a browser to confirm the function is routed correctly
export async function onRequestGet() {
  return new Response(JSON.stringify({ status: "ok", endpoint: "approve" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
