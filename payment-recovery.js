/* FinPi · functions/payment-recovery.js · Route: /payment-recovery */
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,GET,OPTIONS","Access-Control-Allow-Headers":"Content-Type","Content-Type":"application/json"};
async function recover(paymentId,key){
  const r={paymentId,cleared:false};
  try{const g=await fetch(`https://api.minepi.com/v2/payments/${paymentId}`,{headers:{"Authorization":`Key ${key}`}});const t=await g.text();r.get_status=g.status;try{const d=JSON.parse(t);r.pi_status=d.status;r.txid=d.transaction?.txid||null;}catch(e){}}catch(e){r.get_error=e.message;return r;}
  if(r.txid){try{const c=await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`,{method:"POST",headers:{"Authorization":`Key ${key}`,"Content-Type":"application/json"},body:JSON.stringify({txid:r.txid})});const ct=await c.text();r.action="complete";r.action_status=c.status;r.cleared=c.ok;console.log("[FinPi/recovery] complete:",c.status,ct.slice(0,100));}catch(e){r.complete_error=e.message;}}
  else{try{const a=await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`,{method:"POST",headers:{"Authorization":`Key ${key}`,"Content-Type":"application/json"},body:JSON.stringify({})});const at=await a.text();r.action="approve";r.action_status=a.status;r.cleared=(a.status===200||a.status===400);console.log("[FinPi/recovery] approve:",a.status,at.slice(0,100));}catch(e){r.approve_error=e.message;}}
  r.message=r.cleared?"✅ Recovered":"❌ Could not recover";return r;
}
export async function onRequestGet(context){
  const key=context.env.PI_API_KEY;
  if(!key)return new Response(JSON.stringify({error:"PI_API_KEY not set"}),{status:200,headers:CORS});
  const pid=new URL(context.request.url).searchParams.get("id");
  if(!pid)return new Response(JSON.stringify({status:"ready",route:"/payment-recovery",pi_api_key_present:true}),{status:200,headers:CORS});
  const r=await recover(pid,key);
  return new Response(JSON.stringify(r,null,2),{status:200,headers:CORS});
}
export async function onRequestPost(context){
  const key=context.env.PI_API_KEY;
  if(!key)return new Response(JSON.stringify({cleared:false,error:"no key"}),{status:200,headers:CORS});
  try{const body=await context.request.json();const r=await recover(body.paymentId,key);return new Response(JSON.stringify(r),{status:200,headers:CORS});}
  catch(e){return new Response(JSON.stringify({cleared:false,error:e.message}),{status:200,headers:CORS});}
}
export async function onRequestOptions(){return new Response(null,{status:200,headers:CORS});}
