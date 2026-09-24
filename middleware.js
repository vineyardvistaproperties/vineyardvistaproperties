import { NextResponse } from 'next/server';

function decodeB64url(s){
  s=s.replace(/-/g,'+').replace(/_/g,'/');
  while(s.length%4)s+='=';
  return atob(s);
}
async function verify(token,area,secret){
  if(!token||!secret)return false;
  const [body,sig]=token.split('.');
  if(!body||!sig)return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const sigBytes=Uint8Array.from(decodeB64url(sig),c=>c.charCodeAt(0));
  const ok=await crypto.subtle.verify('HMAC',key,sigBytes,new TextEncoder().encode(body));
  if(!ok)return false;
  try{const data=JSON.parse(decodeB64url(body));return data.area===area&&data.exp>Date.now()}catch{return false}
}
export async function middleware(req){
  const p=req.nextUrl.pathname;
  if(p.startsWith('/api/')||p==='/login.html'||p.startsWith('/assets/')||p.endsWith('.css')||p.endsWith('.js')||p==='/favicon.ico')return NextResponse.next();
  const secret=process.env.AUTH_SECRET;
  const siteOk=await verify(req.cookies.get('vvp_site')?.value,'site',secret);
  if(!siteOk){const u=req.nextUrl.clone();u.pathname='/login.html';u.searchParams.set('next',p);u.searchParams.set('area','site');return NextResponse.redirect(u)}
  if(p.includes('management')){
    const mgmtOk=await verify(req.cookies.get('vvp_management')?.value,'management',secret);
    if(!mgmtOk){const u=req.nextUrl.clone();u.pathname='/login.html';u.searchParams.set('next',p);u.searchParams.set('area','management');return NextResponse.redirect(u)}
  }
  return NextResponse.next();
}
export const config={matcher:['/((?!_next/static|_next/image).*)']};
