import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 let user=null; const actions=[];
 await page.route('**/api/index.php?**',async route=>{
  const req=route.request(),action=new URL(req.url()).searchParams.get('action'); actions.push(action);
  let data={};
  if(action==='bootstrap')data={csrf:'test',user,registration:true,plans:[{id:1,name:'پلن تست',price_toman:129000,volume_gb:50,days:30}]};
  if(action==='login'){assert.equal(req.headers()['x-csrf-token'],'test');user={id:1,name:'تست',role:'user'};data={ok:true};}
  if(action==='dashboard')data={services:[{id:1,status:'active',total_bytes:1073741824,expiry_ms:Date.now()+86400000,subscription_url:'https://sub.example.com/sub/test'}],orders:[{id:1,amount_rial:1290000,status:'fulfilled'}]};
  if(action==='tickets')data={tickets:[],messages:[]};
  if(action==='traffic')data={up:1024,down:2048};
  if(action==='logout'){user=null;data={ok:true};}
  await route.fulfill({json:data});
 });
 await page.goto('http://127.0.0.1:5174/#admin');
 await page.getByLabel('ایمیل',{exact:true}).fill('test@example.com');
 await page.getByLabel('رمز عبور (حداقل ۱۲ کاراکتر)').fill('a-long-password-123');
 await page.getByRole('button',{name:'ورود',exact:true}).click();
 await page.getByRole('heading',{name:'اشتراک‌های من'}).waitFor();
 assert.equal(await page.getByRole('button',{name:'مدیریت',exact:true}).count(),0);
 await page.getByRole('button',{name:'نمایش مصرف واقعی'}).click();
 await page.getByText('مصرف:',{exact:false}).waitFor();
 for(const width of [320,390,768,1440]) { await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width}`); }
 assert(!actions.includes('admin'),'ordinary user never requests admin data');
 await page.getByRole('button',{name:'خروج',exact:true}).click(); await page.getByRole('heading',{name:'ورود به حساب'}).waitFor();
 assert.deepEqual(errors,[]);console.log('Connected UI: login, role isolation, traffic, logout and responsive layout passed (mock API).');
}finally{await browser.close();}
