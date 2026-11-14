import React from 'react';
import { ShieldCheck, ArrowUpRight, Activity, LockKeyhole, Globe2 } from 'lucide-react';
export default function NetworkVisual(){
  return <div className="lp-network-visual" aria-label="تصویر نمادین شبکه جهانی ویرا؛ اطلاعات نمایشی">
    <div className="nv-grid"/><div className="nv-halo"/>
    <div className="nv-orbit orbit-a"/><div className="nv-orbit orbit-b"/>
    <svg className="nv-map" viewBox="0 0 600 440" fill="none" aria-hidden="true"><defs><pattern id="mapDots" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#5b8279"/></pattern><linearGradient id="connectionLine"><stop stopColor="#b5ef74" stopOpacity=".1"/><stop offset=".5" stopColor="#b5ef74"/><stop offset="1" stopColor="#43c9ae" stopOpacity=".2"/></linearGradient></defs><g fill="url(#mapDots)"><path d="M35 105 71 62 133 43 179 66 207 58 234 93 219 127 194 135 182 174 158 182 148 219 120 201 100 170 66 165 57 128Z"/><path d="M151 222 186 220 212 243 221 282 201 319 182 365 159 382 151 339 133 300 140 266 127 242Z"/><path d="M271 93 302 62 345 56 363 78 409 73 458 86 514 113 554 158 524 190 486 178 463 208 425 193 411 165 374 165 354 138 334 141 326 118 291 128Z"/><path d="M284 154 326 159 357 180 372 218 351 251 337 294 309 317 286 278 277 235 253 215 259 180Z"/><path d="M455 291 488 274 530 283 547 315 519 344 481 334 448 316Z"/><path d="M216 33 242 23 254 45 236 68 212 62Z"/></g><g stroke="url(#connectionLine)" strokeWidth="1.5"><path d="M144 126Q261 -4 345 135"/><path d="M345 135Q444 109 501 299"/><path d="M144 126Q191 336 310 233"/><path d="M310 233Q242 144 345 135"/><path d="M345 135Q379 260 501 299" strokeDasharray="4 6"/></g><g fill="#b5ef74"><circle cx="144" cy="126" r="4"/><circle cx="345" cy="135" r="5"/><circle cx="310" cy="233" r="4"/><circle cx="501" cy="299" r="4"/></g><g stroke="#b5ef74" opacity=".3"><circle cx="144" cy="126" r="11"/><circle cx="345" cy="135" r="14"/><circle cx="501" cy="299" r="11"/></g></svg>
    <div className="nv-coordinate">VIRA GLOBAL NETWORK <span>01 / 03</span></div>
    <div className="nv-location nv-frankfurt"><span>🇩🇪</span><div>Frankfurt<small>مسیر آلمان</small></div><Activity size={15}/></div>
    <div className="nv-location nv-amsterdam"><span>🇳🇱</span><div>Amsterdam<small>مسیر هلند</small></div></div>
    <div className="nv-connection"><div className="nv-card-head"><span><i/> CONNECTION PREVIEW</span><ArrowUpRight size={17}/></div><div className="nv-shield"><ShieldCheck size={40} strokeWidth={1.3}/></div><strong>یک دنیا، نزدیک‌تر.</strong><p>مسیر تازه تو از اینجا شروع می‌شود</p><div className="nv-card-bottom"><span><LockKeyhole size={12}/> V2Ray protocol</span><span>نسخه نمایشی</span></div></div>
    <div className="nv-status"><Globe2 size={17}/><span>برای کشف یک دنیای بزرگ‌تر</span><div><i/><i/><i/><i/><i/></div></div>
    <span className="nv-caption">DESIGNED FOR YOUR DIGITAL FREEDOM</span>
  </div>
}
