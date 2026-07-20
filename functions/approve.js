/* =================================================================
   FinPi · functions/approve.js · Route: /approve
   Pi Network Mainnet · sandbox:false
   Copied exactly from WorldCup proven working pattern
================================================================= */
export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(JSON.stringify({
    success:true, message:"approve.js working", app:"finpi.pages.dev",
    route:"/approve", network:"MAINNET · sandbox:false",
    pi_api_key_present:!!key, pi_api_key_length:key?key.length:0,
    pi_api_key_prefix:key?key.substring(0,8)+"...":"MISSING",
  }),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}
export async function onRequestPost(context) {
  const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json"};
  console.log("[FinPi] /approve POST called");
  try {
    let paymentId=null;
    try{const body=await context.request.json();paymentId=body.paymentId||null;}
    catch(e){console.error("[FinPi] Body parse error:",e.message);return new Response(JSON.stringify({approved:true,step:"body_parse_error"}),{status:200,headers:cors});}
    console.log("[FinPi] paymentId:",paymentId);
    if(!paymentId)return new Response(JSON.stringify({approved:true,step:"no_payment_id"}),{status:200,headers:cors});
    const PI_API_KEY=context.env.PI_API_KEY;
    console.log("[FinPi] PI_API_KEY present:",!!PI_API_KEY,"| length:",PI_API_KEY?PI_API_KEY.length:0);
    if(!PI_API_KEY){console.error("[FinPi] PI_API_KEY MISSING");return new Response(JSON.stringify({approved:true,step:"no_api_key"}),{status:200,headers:cors});}
    try{const g=await fetch(`https://api.minepi.com/v2/payments/${paymentId}`,{method:"GET",headers:{"Authorization":`Key ${PI_API_KEY}`}});const t=await g.text();console.log("[FinPi] GET state:",g.status,t.substring(0,200));}catch(e){console.error("[FinPi] GET error:",e.message);}
    console.log("[FinPi] POSTing approve...");
    const piRes=await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`,{method:"POST",headers:{"Authorization":`Key ${PI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({})});
    const piRaw=await piRes.text();
    console.log("[FinPi] Pi approve response:",piRes.status,piRaw.substring(0,200));
    return new Response(JSON.stringify({approved:true,pi_status:piRes.status}),{status:200,headers:cors});
  }catch(err){console.error("[FinPi] approve error:",err.message);return new Response(JSON.stringify({approved:true,error:err.message}),{status:200,headers:cors});}
}
export async function onRequestOptions(){return new Response(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});}
