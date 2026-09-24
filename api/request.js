export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const ref='VVP-'+Date.now().toString(36).toUpperCase();
  res.status(200).json({ok:true,reference:ref,message:'Demo request received. No email or payment has been sent.'});
}
