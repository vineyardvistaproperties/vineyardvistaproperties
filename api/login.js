import crypto from 'node:crypto';

function b64url(input){return Buffer.from(input).toString('base64url')}
function sign(area, secret){
  const payload=JSON.stringify({area,exp:Date.now()+1000*60*60*24*30});
  const body=b64url(payload);
  const sig=crypto.createHmac('sha256',secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {password,area='site',next='/'}=req.body||{};
  const expected=area==='management'?process.env.MANAGEMENT_PASSWORD:process.env.SITE_PASSWORD;
  if(!expected||password!==expected) return res.status(401).json({error:'Invalid password'});
  const secret=process.env.AUTH_SECRET;
  if(!secret) return res.status(500).json({error:'AUTH_SECRET is not configured'});
  const cookieName=area==='management'?'vvp_management':'vvp_site';
  const token=sign(area,secret);
  res.setHeader('Set-Cookie',`${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  res.status(200).json({ok:true,next});
}
