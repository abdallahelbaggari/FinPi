/* =================================================================
   FinPi · functions/complete.js · Route: /complete
   Pi Network Mainnet · sandbox:false
   CRITICAL: ALWAYS return HTTP 200 — non-200 = Payment Expired
   Copied exactly from WorldCup proven working pattern
================================================================= */
export async function onRequestGet(context) {
  const key=context.env.PI_API_KEY;
  return new Response(JSON.stringify({
    success:true,message:"complete.js working",app:"finpi.pages.dev",
    route:"/complete",network:"MAINNET · sandbox:false",
    pi_api_key_present:!!key,pi_api_key_length:key?key.length:0,
  }),{status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
}
export async function onRequestPost(context) {
  const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json"};
  console.log("[FinPi] /complete POST called");
  try {
    const body=await context.request.json();
    const paymentId=body.paymentId;
    const txid=body.txid;
    console.log("[FinPi] paymentId:",paymentId,"| txid:",txid);
    if(!paymentId)return new Response(JSON.stringify({completed:false,error:"missing paymentId"}),{status:200,headers:cors});
    if(!txid){console.log("[FinPi] No txid yet");return new Response(JSON.stringify({completed:true,skipped:true,message:"waiting for txid"}),{status:200,headers:cors});}
    const PI_API_KEY=context.env.PI_API_KEY;
    console.log("[FinPi] PI_API_KEY present:",!!PI_API_KEY);
    if(!PI_API_KEY){console.error("[FinPi] PI_API_KEY MISSING");return new Response(JSON.stringify({completed:true,skipped:true,error:"PI_API_KEY not set"}),{status:200,headers:cors});}
    console.log("[FinPi] POSTing complete...");
    const res=await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`,{method:"POST",headers:{"Authorization":`Key ${PI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({txid})});
    const text=await res.text();
    console.log("[FinPi] Pi complete response:",res.status,text.substring(0,200));
    return new Response(JSON.stringify({completed:res.ok,pi_status:res.status,response:text}),{status:200,headers:cors});
  }catch(err){console.error("[FinPi] complete error:",err.message);return new Response(JSON.stringify({completed:false,error:err.message}),{status:200,headers:cors});}
}
export async function onRequestOptions(){return new Response(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});}
