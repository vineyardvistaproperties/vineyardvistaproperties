export default function handler(req,res){
  const area=req.query?.area||'site';
  const cookies=[];
  if(area==='management') cookies.push('vvp_management=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  else {cookies.push('vvp_site=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');cookies.push('vvp_management=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0')}
  res.setHeader('Set-Cookie',cookies);
  res.redirect(302,'/login.html');
}
