const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ai.usage-chart-BpGFh6jz.js","./vendor-D98N-du2.js","./date-fns-BTAAV4UA.js","./vendor-BOeeMEG-.css"])))=>i.map(i=>d[i]);
import{u as Ht,a as te,r as g,j as e,c as l,b as Do,L as rt,d as _,e as Y,f as oc,g as Mt,Q as g1,h as f1,i as Se,k as T,l as Z,v as G,m as Bo,n as rc,o as b1,p as qt,q as ac,s as P,t as B,w as V,x as X,O as jt,y as Oo,R as nt,z as j1,C as lc,X as cc,Y as _o,T as Wo,A as y1,B as ne,D as O,E as dc,_ as Rn,F as v1,G as ie,H as Uo,I as le,J as Ho,S as k,K as Qt,M as w1,N as $1,P as C1,U as k1,V as S1,W as L1,Z as F1,$ as E1,a0 as T1,a1 as N1,a2 as z1,a3 as M1,a4 as I1,a5 as A1,a6 as R1,a7 as P1,a8 as D1,a9 as B1,aa as O1,ab as yt,ac as vt,ad as _1,ae as st,af as uc,ag as Ds,ah as pc,ai as Ne,aj as W1,ak as hc,al as xc,am as U1,an as qo,ao as ss,ap as Xs,aq as he,ar as H1,as as q1,at as mc,au as U,av as Qo,aw as Q1,ax as K1,ay as V1,az as G1,aA as Y1,aB as J1,aC as pt,aD as Xi,aE as gc,aF as Z1,aG as X1,aH as e0,aI as t0,aJ as n0}from"./vendor-D98N-du2.js";import{a5 as fc,a6 as ua,p as Qn,a7 as s0,a8 as i0,C as bc}from"./date-fns-BTAAV4UA.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function s(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=s(o);fetch(o.href,r)}})();const o0=(t,n)=>!t||typeof t!="object"||!Array.isArray(n)?!1:n.some(s=>Object.hasOwn(t,s)),An=(t,n)=>{const s=t.split(".").map(r=>Number.parseInt(r,10)),i=n.split(".").map(r=>Number.parseInt(r,10)),o=Math.max(s.length,i.length);for(let r=0;r<o;r+=1){const a=(s[r]??0)-(i[r]??0);if(a!==0)return a>0?1:-1}return 0},r0=t=>{const n=s=>An(t,s)===0;return n.atLeast=s=>An(t,s)>=0,n.atMost=s=>An(t,s)<=0,n.below=s=>An(t,s)<0,n.above=s=>An(t,s)>0,n};var oe=(t=>(t.Pro="pro",t.Lite="lite",t.Express="express",t))(oe||{}),is=(t=>(t.Global="global",t.Form="form",t.All="all",t))(is||{});const a0=document.getElementById("freeform-config"),rn=JSON.parse(a0?.innerHTML||"[]"),I={...rn,metadata:{...rn.metadata,craft:{...rn.metadata?.craft,is:r0(rn?.metadata?.craft?.version||"0.0.0")}},editions:{...rn.editions,is:t=>I.editions.edition===t,isAtLeast:t=>{const n=I.editions.tiers,s=n.indexOf(t);if(s===-1)throw new Error(`Unknown edition: ${t}`);return n.indexOf(I.editions.edition)>=s},isAtMost:t=>{const n=I.editions.tiers,s=n.indexOf(t);if(s===-1)throw new Error(`Unknown edition: ${t}`);return n.indexOf(I.editions.edition)<=s}},limitations:{...rn.limitations,can:t=>{const n=I.limitations?.items;if(!n)return!0;const s=t.split(".");for(let i=0;i<s.length;i++){const o=s.slice(0,i+1).join(".");if(n[o]===!1)return!1}return n[t]!==void 0?!!n[t]:!0},get:t=>{const n=I.limitations?.items;if(n)return n[t]}}},l0="default",jc=g.createContext({isPrimary:!1,change:()=>{},getCurrentHandleWithFallback:()=>""}),Fe=()=>g.useContext(jc),c0=({children:t})=>{const n=Ht(),s=te(),[i,o]=g.useState(()=>I.sites.list.find(p=>p.id===I.sites.current)||I.sites.list.find(p=>p.primary)||I.sites.list[0]),[r,a]=g.useState(i.primary);g.useEffect(()=>{document.querySelectorAll('#nav a[href*="site="]').forEach(p=>{const x=p.getAttribute("href");x&&p.setAttribute("href",x.replace(/([?&])site=[^&]+/,`$1site=${i?.handle||""}`))})},[i]);const c=g.useCallback(d=>{const p=I.sites.list.find(x=>x.handle===d);if(p){o(p),a(p.primary);const x=new URLSearchParams(n.search);x.set("site",p.handle),s(`${n.pathname}?${x.toString()}`)}},[n,s]);return e.jsx(jc.Provider,{value:{current:i,isPrimary:r,list:I.sites.list,change:c,getCurrentHandleWithFallback:()=>i?i.handle:l0},children:t})},d0=(t,n)=>{if(n===void 0||(typeof n=="string"&&(n=n.split(" ")),!t||!t.classList))return!1;for(;t;){for(const s of n)if(t.classList.contains(s))return!0;t=t.parentElement}return!1},E=(...t)=>t.map(n=>(typeof n=="string"&&(n=n.trim()),Array.isArray(n)&&(n=E(...n)),n)).filter(n=>!!n).join(" "),yc=l.button`
  z-index: 3 !important;

  &:after {
    margin-left: 0 !important;
  }
`,vc=l.div`
  position: absolute;
  left: 0;
  top: 24px;
  z-index: 10;

  background: white;

  ul {
    li {
      margin: 0 !important;
    }
  }
`,u0=l.li`
  &.craft-4 {
    gap: var(--xs);

    #site-crumb {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: nowrap;
      gap: var(--xs);
    }

    ${vc} {
      padding: 0 14px;

      border-radius: 4px;
      box-shadow:
        0 0 0 1px rgba(31, 41, 51, 0.1),
        0 5px 20px rgba(31, 41, 51, 0.25);

      user-select: none;
      overflow: auto;
      z-index: 100;
    }

    ${yc} {
      width: 22px;
      height: 22px;

      padding: 0 !important;

      min-height: auto !important;
      z-index: 3 !important;

      ul {
        display: flex;
        flex-direction: column;

        li {
          &::after {
            display: none;
          }

          a:hover {
            color: var(--light-text-color) !important;
          }
        }
      }
    }

    .cp-icon,
    .cp-icon svg {
      height: 0.75em;
      width: 0.75em;
    }
  }
`,p0=()=>{const[t,n]=g.useState(!1),{current:s,list:i,change:o}=Fe(),{metadata:{craft:r},sites:{enabled:a}}=I;if(!a)return null;const c=!r.is5,d=r.is5;return i.length<=1?null:e.jsxs(u0,{className:E("crumb",c&&"craft-4",d&&"craft-5"),children:[e.jsxs("a",{id:"site-crumb",className:"crumb-link",children:[e.jsx("span",{className:"cp-icon puny",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512","aria-hidden":"true",children:e.jsx("path",{d:"M57.7 193l9.4 16.4c8.3 14.5 21.9 25.2 38 29.8L163 255.7c17.2 4.9 29 20.6 29 38.5v39.9c0 11 6.2 21 16 25.9s16 14.9 16 25.9v39c0 15.6 14.9 26.9 29.9 22.6c16.1-4.6 28.6-17.5 32.7-33.8l2.8-11.2c4.2-16.9 15.2-31.4 30.3-40l8.1-4.6c15-8.5 24.2-24.5 24.2-41.7v-8.3c0-12.7-5.1-24.9-14.1-33.9l-3.9-3.9c-9-9-21.2-14.1-33.9-14.1H257c-11.1 0-22.1-2.9-31.8-8.4l-34.5-19.7c-4.3-2.5-7.6-6.5-9.2-11.2c-3.2-9.6 1.1-20 10.2-24.5l5.9-3c6.6-3.3 14.3-3.9 21.3-1.5l23.2 7.7c8.2 2.7 17.2-.4 21.9-7.5c4.7-7 4.2-16.3-1.2-22.8l-13.6-16.3c-10-12-9.9-29.5 .3-41.3l15.7-18.3c8.8-10.3 10.2-25 3.5-36.7l-2.4-4.2c-3.5-.2-6.9-.3-10.4-.3C163.1 48 84.4 108.9 57.7 193zM464 256c0-36.8-9.6-71.4-26.4-101.5L412 164.8c-15.7 6.3-23.8 23.8-18.5 39.8l16.9 50.7c3.5 10.4 12 18.3 22.6 20.9l29.1 7.3c1.2-9 1.8-18.2 1.8-27.5zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"})})}),e.jsx("span",{children:s.name})]}),e.jsx(yc,{className:"btn menubtn",type:"button","aria-label":"Select site","aria-controls":"site-crumb-menu","aria-expanded":t,"data-discloseure-trigger":"true",onClick:()=>n(!t),children:e.jsx(vc,{className:"menu",style:{display:t?"block":"none"},children:e.jsx("ul",{className:"padded",children:i.map(p=>e.jsx("li",{onClick:()=>{o(p.handle),n(!1)},children:e.jsx("a",{className:E("menu-item",s.handle===p.handle&&"sel"),children:e.jsx("span",{className:"menu-item-label",children:p.name})})},p.id))})})})]})},wc=g.createContext({stack:[],push:()=>{},pop:()=>{},update:()=>{}}),h0=t=>{const{push:n,pop:s,update:i}=g.useContext(wc),{id:o,label:r,url:a,external:c}=t,d=g.useRef(t);d.current={id:o,label:r,url:a,external:c},g.useEffect(()=>{i({id:o,label:r,url:a,external:c})},[c,o,r,i,a]),g.useEffect(()=>(n(d.current),()=>{s(o)}),[o,s,n])},x0=({children:t})=>{const[n,s]=g.useState([]),i=g.useCallback(a=>{s(c=>{const d=c.findIndex(f=>f.id===a.id);if(d===-1)return[...c,a];const p=c[d];if(p.label===a.label&&p.url===a.url&&p.external===a.external)return c;const x=[...c];return x[d]=a,x})},[]),o=g.useCallback(a=>{s(c=>c.filter(d=>d.id!==a))},[]),r=g.useCallback(a=>{s(c=>{const d=c.findIndex(f=>f.id===a.id);if(d===-1)return c;const p=c[d];if(p.label===a.label&&p.url===a.url&&p.external===a.external)return c;const x=[...c];return x[d]={...p,...a},x})},[]);return g.useEffect(()=>{const a=document.getElementById("crumbs");a.style.display="block",a.style.overflow="initial",a.classList.remove("empty")},[]),e.jsxs(wc.Provider,{value:{stack:n,push:i,pop:o,update:r},children:[t,Do.createPortal(e.jsx("nav",{"aria-label":"Breadcrumbs",className:"breadcrumbs",children:e.jsxs("ul",{id:"crumb-list",className:"breadcrumb-list",children:[e.jsx(p0,{}),n.map(({label:a,url:c,external:d},p)=>e.jsxs("li",{className:"crumb",children:[d&&e.jsx("a",{href:c,children:a}),!d&&e.jsx(rt,{to:c,children:a})]},p))]})}),document.getElementById("crumbs"))]})},q=t=>(h0(t),null),m0=()=>null,$c=g.createContext({register:()=>1e3,unregister:()=>{}}),g0=({children:t})=>{const n=g.useRef(1e3),s=()=>(n.current-=1,n.current),i=()=>{n.current+=1};return e.jsx($c.Provider,{value:{register:s,unregister:i},children:t})},f0=()=>{const{register:t,unregister:n}=g.useContext($c),[s,i]=g.useState(1e3);return g.useEffect(()=>{const o=t();return i(o),()=>{n()}},[t,n]),s},Cc=typeof window<"u"?g.useLayoutEffect:g.useEffect;function eo(t){const n=g.useRef(()=>{throw new Error("Cannot call an event handler while rendering.")});return Cc(()=>{n.current=t},[t]),g.useCallback((...s)=>n.current?.(...s),[n])}const kc=g.createContext({stack:[],push:()=>{},pop:()=>{}}),os=(t,n=!0)=>{const{push:s,pop:i}=g.useContext(kc),o=eo(t);g.useEffect(()=>{if(n)return s(o),()=>{i(o)}},[o,n,i,s])},b0=({children:t})=>{const n=g.useRef([]),s=g.useCallback(r=>{const a=n.current;a.at(-1)!==r&&a.push(r)},[]),i=g.useCallback(r=>{const a=n.current;if(!r)return a.pop();const c=a.indexOf(r);if(c!==-1)return a.splice(c,1)[0]},[]);g.useEffect(()=>{const r=a=>{if(a.key==="Escape"){const c=n.current.at(-1);c&&c()}};return document.addEventListener("keydown",r),()=>{document.removeEventListener("keydown",r)}},[]);const o=g.useMemo(()=>({stack:n.current,push:s,pop:i}),[i,s]);return e.jsx(kc.Provider,{value:o,children:t})};l.div`
  box-shadow:
    0 0 0 1px #cdd8e4,
    0 2px 12px rgb(205 216 228 / 50%);
`;const m={xs:"var(--xs)",sm:"var(--s)",md:"var(--m)",lg:"var(--l)",xl:"var(--xl)"},S={sm:"var(--small-border-radius)",md:"var(--medium-border-radius)",lg:"var(--large-border-radius)"},re={panel:"0 0 20px 10px rgb(205 216 228 / 50%)",box:"0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%)",boxSubtle:"0 2px 8px rgba(0, 0, 0, 0.1)",bottom:"inset 0 -1px 0 0 rgb(154 165 177 / 25%)",right:"inset -1px 0 0 0 rgb(154 165 177 / 25%)",autosuggest:"0 1px 5px -1px rgba(31,41,51,.2)",container:"0 0 0 1px rgba(31, 41, 51, 0.1), 0 5px 20px rgba(31, 41, 51, 0.25)"},Ko={easeOut:"cubic-bezier(0.25, 0.1, 0.25, 1)",bounce:{easeOut:"cubic-bezier(0.175, 0.885, 0.32, 1.275)"}},h={hairline:"rgba(51,64,77,.1)",hr:"rgb(from var(--gray-800) r g b/10%)",inputBorder:"rgba(96,125,159,0.25)",barelyVisible:"rgb(154 165 177 / 75%)",link:"#1f5fea",elements:{dropdown:"#dfe5ec"},error:"#cf1124",warning:"var(--warning-color)",notice:"var(--notice-color)",white:"var(--white)",black:"var(--black)",gray050:"var(--gray-050)",gray100:"var(--gray-100)",gray200:"var(--gray-200)",gray250:"#b4c3d3",gray300:"var(--gray-300)",gray400:"var(--gray-400)",gray500:"var(--gray-500)",gray550:"var(--gray-550)",gray600:"var(--gray-600)",gray700:"var(--gray-700)",gray800:"var(--gray-800)",gray900:"var(--gray-900)",blue100:"var(--blue-100)",blue200:"var(--blue-200)",blue300:"var(--blue-300)",blue400:"var(--blue-400)",blue500:"var(--blue-500)",blue600:"var(--blue-600)",red050:"var(--red-050)",red100:"var(--red-100)",red200:"var(--red-200)",red300:"var(--red-300)",red500:"var(--red-500)",red600:"var(--red-600)",red700:"var(--red-700)",yellow050:"var(--yellow-050)",yellow500:"var(--yellow-500)",yellow600:"var(--yellow-600)",yellow700:"var(--yellow-700)",teal050:"var(--teal-050)",teal300:"var(--teal-300)",teal500:"var(--teal-500)",teal550:"var(--teal-550)",teal600:"var(--teal-600)",teal700:"var(--teal-700)",green600:"var(--green-600)"},j0=l.div``,y0=l(_.div)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;

  background-color: rgba(123, 135, 147, 0);

  &.inactive {
    pointer-events: none;
  }
`,v0=l(_.div)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;

  display: flex;
  justify-content: center;
  align-items: center;
`,ve=l.div`
  width: 100%;
  max-width: 500px;

  background-color: #fff;
  border-radius: ${S.lg};
  box-shadow: 0 25px 100px rgba(31, 41, 51, 0.5);
`,we=l.header`
  padding: ${m.lg} ${m.xl};

  background-color: ${h.gray100};
  box-shadow: inset 0 -1px 0 ${h.hairline};

  border-radius: ${S.lg} ${S.lg} 0 0;
`,$e=l.footer`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: ${m.sm};

  padding: ${m.sm} ${m.xl};

  background-color: ${h.gray100};
  box-shadow: inset 0 1px 0 ${h.hairline};

  border-radius: 0 0 ${S.lg} ${S.lg};
`,wt=({children:t,closeModal:n,style:s,config:i})=>(os(n,i?.allowEscape??!0),e.jsx(v0,{style:s,children:t})),w0=t=>Y({to:{opacity:t?1:0,backgroundColor:t?"rgba(123, 135, 147, 0.35)":"rgba(123, 135, 147, 0)"}}),$0=t=>oc(t,{from:{y:100,opacity:0},enter:{y:0,opacity:1},leave:{y:-100,opacity:0},config:{tension:500,friction:20}}),Sc=g.createContext({openModal:()=>{},closeModal:()=>{}}),qe=()=>g.useContext(Sc),Lc=({children:t})=>{const[n,s]=g.useState([]),[i,o]=g.useState([]),[r,a]=g.useState([]),c=(f,b,j)=>{s([...n,b]),o([...i,f]),a([...r,j])},d=()=>{s(n.slice(0,-1)),o(i.slice(0,-1)),a(r.slice(0,-1))};g.useEffect(()=>{i.length>0?document.body.style.overflow="hidden":document.body.style.overflow="auto"},[i]);const p=w0(i.length>0),x=$0(i);return e.jsxs(Sc.Provider,{value:{openModal:c,closeModal:d},children:[t,Do.createPortal(e.jsx(j0,{children:e.jsx(y0,{style:p,className:E(!i.length&&"inactive"),children:x((f,b,j,y)=>e.jsx(wt,{closeModal:d,style:f,config:Mt(r[y]),children:e.jsx(b,{closeModal:d,data:Mt(n[y])})},y))})}),document.body)]})},C0=new g1({defaultOptions:{queries:{gcTime:1e3*60*10,retry:!1,refetchOnWindowFocus:!1}}}),Fc=g.createContext({}),Ec=()=>g.useContext(Fc),k0=l.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1005;
`,S0=({children:t})=>{const[n,s]=g.useState(),i=g.useRef(null);return g.useEffect(()=>{i.current&&s(i.current.getBoundingClientRect())},[i.current]),e.jsxs(Fc.Provider,{value:{element:i.current,dimensions:n},children:[e.jsx(k0,{id:"pop-up-portal",ref:i}),t]})},Tc=f1("form/save");var Yn=(t=>(t.Page="page",t.Field="field",t.Row="row",t))(Yn||{}),It=(t=>(t[t.Idle=0]="Idle",t[t.Processing=1]="Processing",t))(It||{});const L0={state:0,page:null,focus:{active:!1,type:null,uid:null}},Nc=Se({name:"context",initialState:L0,reducers:{setPage:(t,{payload:n})=>{t.page=n},setFocusedItem:(t,{payload:n})=>{t.focus.active===!0&&t.focus.uid===n.uid&&t.focus.type===n.type||(t.focus={active:!0,...n})},setState:(t,{payload:n})=>{t.state=n},focus:t=>{t.focus.active=!0},unfocus:t=>{t.focus.active=!1}}}),{actions:ye}=Nc,F0=Nc.reducer,Kn=new Map,ae={subscribe(t,n){const s=E0(t),i=n;return s.add(i),()=>{s.delete(i),s.size===0&&Kn.delete(t)}},publish(t,n){const s=Kn.get(t);s&&s.forEach(i=>{i(t,n)})},clearAllSubscriptions(){Kn.clear()}},E0=t=>{let n=Kn.get(t);return n||(n=new Set,Kn.set(t,n)),n},Kt=Symbol("form.save"),rs=Symbol("form.save.errors"),zc=Symbol("form.save.crated"),T0=Symbol("form.save.updated"),Vt=Symbol("form.save.upserted");ae.clearAllSubscriptions();const pa=(t,n,s)=>{ae.publish(rs,{getState:t,dispatch:n,response:s}),n(ye.setState(It.Idle))},N0=(t,n,s)=>{ae.publish(zc,{getState:t,dispatch:n,response:s}),ae.publish(Vt,{getState:t,dispatch:n,response:s}),n(ye.setState(It.Idle))},z0=(t,n,s)=>{ae.publish(T0,{getState:t,dispatch:n,response:s}),ae.publish(Vt,{getState:t,dispatch:n,response:s}),n(ye.setState(It.Idle))},M0=t=>n=>s=>{if(!s||(n(s),typeof s!="object"||!("type"in s)||s.type!==String(Tc)))return;const i=t.dispatch,o=t.getState;i(ye.setState(It.Processing));const r={getState:o,dispatch:i,persist:{}};ae.publish(Kt,r);const a=o().form.id;a?T.post(`/api/forms/${a}`,r.persist).then(c=>z0(o,i,c)).catch(c=>pa(o,i,c)):T.post("/api/forms",r.persist).then(c=>N0(o,i,c)).catch(c=>pa(o,i,c))},Xe={success:t=>{Craft.cp.displaySuccess(t)},notice:t=>{Craft.cp.displayNotice(t)},error:t=>{Craft.cp.displayError(t)}},I0=(t,n={})=>{for(const[s,i]of Object.entries(n)){const o=new RegExp(`\\{${s}\\}`,"g");t=t.replace(o,i.toString())}return t},u=(t,n={})=>t?typeof Craft<"u"?Craft.t("freeform",t,n):I0(t,n):"",A0=(t,n)=>{const{persist:s,getState:i}=n,{id:o,uid:r,type:a,settings:c}=i().form;s.form={id:o,uid:r,type:a,settings:c}},R0=(t,{dispatch:n,response:s})=>{n(gt.clearErrors()),n(gt.setErrors(s.errors?.form)),Xe.error(u("There were problems saving the form."))},P0=(t,{dispatch:n})=>{n(gt.clearErrors()),Xe.success(u("Form saved successfully."))},D0=(t,{dispatch:n,response:s})=>{n(gt.update({id:s.data.form.id}))};ae.subscribe(Kt,A0);ae.subscribe(rs,R0);ae.subscribe(zc,D0);ae.subscribe(Vt,P0);const as={oneByShortName:t=>n=>n.integrations.find(s=>s.shortName===t),one:t=>n=>n.integrations.find(s=>s.id===t),isFieldInIntegrations:t=>Z(n=>n.integrations,n=>!!n.filter(s=>s.enabled).find(s=>s.properties.some(i=>{if(i.type==="field")return s.values[i.handle]===t;if(i.type==="fieldMapping"){const o=s.values[i.handle];return Object.values(o).some(r=>r.value===t)}return!1}))),errors:{any:t=>t.integrations.some(n=>n.errors?Object.values(n.errors).some(s=>s.length>0):!1)}},B0=(t,{getState:n,dispatch:s})=>{const i=n(),o=as.oneByShortName("FormMonitor")(i);o&&s(gt.update({formMonitor:{enabled:o.enabled}}))};ae.subscribe(Vt,B0);const O0={id:null,uid:G(),type:"Solspace\\Freeform\\Form\\Types\\Regular",name:"Create a new Form",handle:"newForm",isNew:!0,settings:{},errors:{},dateArchived:null,formMonitor:{enabled:!1}},Mc=Se({name:"form",initialState:O0,reducers:{update:(t,{payload:n})=>{Object.assign(t,n)},setInitialSettings:(t,n)=>{if(!(Object.entries(t.settings).length>0)){for(const s of n.payload){t.settings[s.handle]={namespaceType:"settings",namespace:s.handle};for(const i of s.properties)t.settings[s.handle][i.handle]=i.value}t.settings.general.name=t.name,t.settings.general.handle=t.handle}},modifySettings:(t,{payload:n})=>{const{namespace:s,key:i,value:o}=n;t.settings[s]||(t.settings[s]={namespaceType:"settings",namespace:s}),t.settings[s][i]=o},removeError:(t,{payload:n})=>{delete t.errors[n]},setErrors:(t,{payload:n})=>{t.errors=n},clearErrors:t=>{t.errors=void 0}}}),{actions:gt}=Mc,_0=Mc.reducer,W0=(t,n)=>{const{getState:s,persist:i}=n;i.integrations=s().integrations.map(o=>({id:o.id,instanceUid:o.instanceUid,enabled:!!o.enabled,values:o.dirtyValues}))},U0=(t,{dispatch:n,response:s})=>{n(At.clearErrors()),n(At.setErrors(s.errors?.integrations))},H0=(t,{dispatch:n})=>{n(At.cleanDirtyValues()),n(At.clearErrors())};ae.subscribe(Kt,W0);ae.subscribe(rs,U0);ae.subscribe(Vt,H0);const q0=[],ha=(t,n)=>t.find(s=>s.id===n),Ic=Se({name:"integrations",initialState:q0,reducers:{set:(t,n)=>{t.length=0,n.payload.forEach(s=>{const i={};s.properties.forEach(o=>{i[o.handle]=o.value}),t.push({dirtyValues:{},values:i,...s})})},add:(t,n)=>{n.payload.forEach(s=>{const i={};s.properties.forEach(o=>{i[o.handle]=o.value}),t.push({dirtyValues:{},values:i,...s})})},toggle:(t,n)=>{const s=ha(t,n.payload);s.enabled=!s.enabled},modify:(t,n)=>{const{id:s,key:i,value:o}=n.payload,r=ha(t,s);r.values[i]=o,r.dirtyValues={...r.dirtyValues,[i]:o}},cleanDirtyValues:t=>{t.forEach(n=>{n.dirtyValues={}})},emptyIntegrations:t=>{t.length=0},clearErrors:t=>{t.forEach(n=>{n.errors=void 0})},setErrors:(t,n)=>{t.forEach(s=>{const i=n.payload?.[s.id];i&&(s.errors=i)})}}}),{actions:At}=Ic,Q0=Ic.reducer,K0=(t,{dispatch:n,response:s})=>{n(be.clearErrors()),n(be.setErrors(s.errors?.fields))},V0=(t,{dispatch:n})=>{n(be.clearErrors())};ae.subscribe(rs,K0);ae.subscribe(Vt,V0);const G0=[],Ac=Se({name:"layout/fields",initialState:G0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const{uid:s,rowUid:i,fieldType:o,order:r}=n.payload,a=Math.max(-1,...t.filter(d=>d.rowUid===n.payload.rowUid).map(d=>d.order)),c={};if(o.properties.forEach(d=>{c[d.handle]=d.value}),!c.label){const d=t.filter(x=>x.typeClass===o.typeClass).length;let p=u(o.name);d>0&&(p+=` ${d}`),c.label=p,c.handle=Bo(p)}t.push({uid:s,rowUid:i,typeClass:o.typeClass,properties:c,order:r!==void 0?r:a+1}),r!==void 0&&t.filter(d=>d.rowUid===i).filter(d=>d.uid!==s).forEach(d=>{d.order>=r&&(d.order+=1)})},duplicate:(t,n)=>{const{uid:s,rowUid:i,field:o}=n.payload,r=Math.max(-1,...t.filter(f=>f.rowUid===i).map(f=>f.order??-1)),a={...o.properties},c=a.handle.replace(/_\d+$/,"");let d=a.handle,p=!0,x=1;do d=`${c}_${x}`,p=t.some(f=>f.properties.handle===d);while(p&&x++<500);a.handle=d,t.push({uid:s,rowUid:i,typeClass:o.typeClass,properties:a,order:r+1})},remove:(t,{payload:n})=>{t.splice(t.findIndex(s=>s.uid===n),1)},removeBatch:(t,{payload:n})=>{n.forEach(s=>{t.splice(t.findIndex(i=>i.uid===s),1)})},edit:(t,n)=>{const{uid:s,handle:i,value:o}=n.payload;t.find(r=>r.uid===s).properties[i]=o},batchEdit:(t,n)=>{const{uid:s,typeClass:i,properties:o}=n.payload,r=t.find(a=>a.uid===s);r.typeClass=i,r.properties=o},clearErrors:t=>{for(const n of t)n.errors=void 0},setErrors:(t,n)=>{const{payload:s}=n;for(const i of t)i.errors=s?.[i.uid]},moveTo:(t,n)=>{const{uid:s,rowUid:i,position:o}=n.payload,r=t.find(p=>p.uid===s),a=r.rowUid,c=r.order,d=a===i;c!==void 0&&(r.rowUid=i,r.order=o,d||(t.filter(p=>p.rowUid===a).forEach(p=>{const x=p.order>=c;p.order-=x?1:0}),t.filter(p=>p.rowUid===i).filter(p=>p.uid!==r.uid).forEach(p=>{const x=p.order>=r.order;p.order+=x?1:0})),d&&t.filter(p=>p.rowUid===i).filter(p=>p.uid!==r.uid).forEach(p=>{p.order>c&&p.order<=o&&(p.order-=1),p.order<c&&p.order>=o&&(p.order+=1)}))}}}),{actions:be}=Ac,Y0=Ac.reducer,J0=(t,n)=>{const{getState:s,persist:i}=n,{layouts:o,fields:r,rows:a,pages:c}=s().layout;i.layout={pages:c,layouts:o,rows:a,fields:r}};ae.subscribe(Kt,J0);const Z0=[],Rc=Se({name:"layout/layouts",initialState:Z0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{t.push(n.payload)},remove:(t,n)=>{t.splice(t.findIndex(s=>s.uid===n.payload),1)}}}),{actions:$n}=Rc,X0=Rc.reducer,eh=/^-?\d*\.?\d*$/,xa=(t,n={})=>{const{min:s,max:i,unsigned:o}=n;if(typeof t=="string"){if(t==="-")return 0;if(eh.test(t)||(t=t.replaceAll(/[^0-9.-]/g,"")),t==="")return;t=Number(t)}if(!Number.isNaN(t))return typeof o=="boolean"&&o&&t<0&&(t=Math.abs(t)),s!=null&&t<s?s:i!=null&&t>i?i:t},th=(t,n,s,i=!0)=>{const o=Math.min(n,s),r=Math.max(n,s);return i?t>=o&&t<=r:t>o&&t<r},nh=[],Pc=Se({name:"layout/pages",initialState:nh,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const s=Math.max(-1,...t.map(i=>i.order));t.push({...n.payload,order:s+1})},remove:(t,n)=>{let s=0;t.splice(t.findIndex(i=>i.uid===n.payload),1),t.forEach(i=>{i.order=s++})},moveTo:(t,n)=>{const{uid:s,order:i}=n.payload,o=t.find(a=>a.uid===s),r=o.order;o.order=i,t.filter(a=>a.uid!==s).filter(a=>th(a.order,i,r)).forEach(a=>{i>r&&(a.order-=1),i<r&&(a.order+=1)})},updateLabel:(t,n)=>{const{uid:s,label:i}=n.payload;t.find(o=>o.uid===s).label=i},editButtons:(t,n)=>{const{uid:s,key:i,value:o}=n.payload,r=t.find(a=>a.uid===s).buttons;r&&Object.assign(r,{[i]:o})}}}),{actions:Cn}=Pc,sh=Pc.reducer,ih=[],Dc=Se({name:"layout/rows",initialState:ih,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const{layoutUid:s,uid:i,order:o}=n.payload;let r;o!==void 0?r=t.findIndex(a=>a.layoutUid===s&&a.order===o):(r=t.reduce((a,c,d)=>c.layoutUid===s&&c.order>t[a]?.order?d:a,-1),r=r===-1?t.length:r),t.splice(r,0,{uid:i,order:r,layoutUid:s}),t.filter(a=>a.layoutUid===s).forEach((a,c)=>{a.order=c})},remove:(t,n)=>{const s=t.findIndex(o=>o.uid===n.payload),i=t.find(o=>o.uid===n.payload).layoutUid;t.splice(s,1),t.filter(o=>o.layoutUid===i).forEach((o,r)=>{o.order=r})},swap:(t,n)=>{const s=t.find(r=>r.uid===n.payload.currentUid),i=t.find(r=>r.uid===n.payload.targetUid),o=s.order;s.order=i.order,i.order=o}}}),{actions:Ze}=Dc,oh=Dc.reducer,rh=rc({fields:Y0,pages:sh,rows:oh,layouts:X0}),ah=(t,n)=>{const{getState:s,persist:i}=n,o=s();let r=null;o.notifications.initialized&&(r=o.notifications.items),i.notifications=r},lh=(t,{dispatch:n,response:s})=>{n(Rt.clearErrors()),n(Rt.setErrors(s.errors?.notifications))},ch=(t,{dispatch:n})=>{n(Rt.clearErrors())};ae.subscribe(Kt,ah);ae.subscribe(rs,lh);ae.subscribe(Vt,ch);const dh={initialized:!1,items:[]},ma=(t,n)=>t.items.find(s=>s.uid===n),Bc=Se({name:"notifications",initialState:dh,reducers:{clear:t=>{t.initialized=!1,t.items.length=0},set:(t,n)=>{t.initialized=!0,t.items.length=0,n.payload.forEach(s=>{t.items.push(s)})},toggle:(t,n)=>{const s=ma(t,n.payload);s&&(s.enabled=!s.enabled)},modify:(t,n)=>{const{uid:s,key:i,value:o}=n.payload,r=ma(t,s);r&&(r[i]=o)},add:(t,n)=>{t.items.push(n.payload)},clearErrors:t=>{for(const n of t.items)n.errors=void 0},setErrors:(t,n)=>{const{payload:s}=n;for(const i of t.items)i.errors=s?.[i.uid]},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Rt}=Bc,uh=Bc.reducer,ph=(t,n)=>{const{getState:s,persist:i}=n,{fields:o,pages:r,notifications:a,integrations:c,submitForm:d,buttons:p}=s().rules;i.rules={fields:o.initialized?o.items:null,pages:r.initialized?r.items:null,notifications:a.initialized?a.items:null,integrations:c.initialized?c.items:null,submitForm:d.item,buttons:p.initialized?p.items:null}};ae.subscribe(Kt,ph);var se=(t=>(t.Equals="equals",t.NotEquals="notEquals",t.GreaterThan="greaterThan",t.GreaterThanOrEquals="greaterThanOrEquals",t.LessThan="lessThan",t.LessThanOrEquals="lessThanOrEquals",t.Contains="contains",t.NotContains="notContains",t.StartsWith="startsWith",t.EndsWith="endsWith",t.IsEmpty="isEmpty",t.IsNotEmpty="isNotEmpty",t.IsOneOf="isOneOf",t.IsNotOneOf="isNotOneOf",t))(se||{});const Pn={boolean:["equals","notEquals"],noValue:["isEmpty","isNotEmpty"],multiple:["isOneOf","isNotOneOf"],negative:["notEquals","notContains"]};var xn=(t=>(t.Show="show",t.Hide="hide",t))(xn||{}),Be=(t=>(t.And="and",t.Or="or",t))(Be||{});const hh={initialized:!1,items:[]},Oc=Se({name:"rules/buttons",initialState:hh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{pageUid:s,button:i}=n.payload;t.items.push({uid:G(),enabled:!0,display:xn.Show,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:se.Equals,value:""}],button:i,page:s})},modifyDisplay:(t,n)=>{const{ruleUid:s,display:i}=n.payload,o=t.items.find(r=>r.uid===s);o.display=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:ln}=Oc,xh=Oc.reducer,mh={initialized:!1,items:[]},_c=Se({name:"rules/fields",initialState:mh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const s=n.payload;t.items.push({uid:G(),enabled:!0,display:xn.Show,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:se.Equals,value:""}],field:s})},modifyDisplay:(t,n)=>{const{ruleUid:s,display:i}=n.payload,o=t.items.find(r=>r.uid===s);o.display=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:cn}=_c,gh=_c.reducer,fh={initialized:!1,items:[]},Wc=Se({name:"rules/integrations",initialState:fh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{ruleUid:s,integrationUid:i}=n.payload;t.items.push({uid:s,enabled:!0,push:!0,combinator:Be.Or,integration:i,conditions:[{uid:G(),field:"",operator:se.Equals,value:""}]})},modifyPush:(t,n)=>{const{ruleUid:s,push:i}=n.payload,o=t.items.find(r=>r.uid===s);o.push=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Dn}=Wc,bh=Wc.reducer,jh={initialized:!1,items:[]},Uc=Se({name:"rules/notifications",initialState:jh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{ruleUid:s,notificationUid:i}=n.payload;t.items.push({uid:s,enabled:!0,send:!0,combinator:Be.Or,notification:i,conditions:[{uid:G(),field:"",operator:se.Equals,value:""}]})},modifySend:(t,n)=>{const{ruleUid:s,send:i}=n.payload,o=t.items.find(r=>r.uid===s);o.send=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Bn}=Uc,yh=Uc.reducer,vh={initialized:!1,items:[]},Hc=Se({name:"rules/pages",initialState:vh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const s=n.payload;t.items.push({uid:G(),enabled:!0,page:s,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:se.Equals,value:""}]})},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:On}=Hc,wh=Hc.reducer,$h={},qc=Se({name:"rules/submit-form",initialState:$h,reducers:{set:(t,n)=>{t.item=n.payload},add:t=>{t.item={uid:G(),enabled:!0,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:se.Equals,value:""}]}},modifyCombinator:(t,n)=>{t.item.combinator=n.payload},modifyConditions:(t,n)=>{t.item.conditions=n.payload},remove:t=>{t.item=void 0}}}),{actions:_n}=qc,Ch=qc.reducer,kh=rc({fields:gh,pages:wh,notifications:yh,integrations:bh,submitForm:Ch,buttons:xh});var kn=(t=>(t.Fields="fields",t))(kn||{});const Sh={fields:""},Qc=Se({name:"search",initialState:Sh,reducers:{update:(t,n)=>{t[n.payload.type]=n.payload.query},clear:(t,n)=>{t[n.payload]=""}}}),{actions:Lh}=Qc,Fh=Qc.reducer,Eh=(t,n)=>{const{getState:s,persist:i}=n;i.translations=s().translations};ae.subscribe(Kt,Eh);const Th={},Kc=Se({name:"translations",initialState:Th,reducers:{update:(t,{payload:n})=>{const{siteId:s,type:i,namespace:o,handle:r,value:a}=n;if(!t)return{[s]:{[i]:{[o]:{[r]:a}}}};t[s]===void 0&&(t[s]={fields:{},form:{},pages:{}}),(!t[s][i]||typeof t[s][i]!="object")&&(t[s][i]={}),t[s][i]===void 0&&(t[s][i]={}),t[s][i][o]||(t[s][i][o]={}),t[s][i][o][r]=a},remove:(t,{payload:n})=>{const{siteId:s,type:i,namespace:o,handle:r}=n;t[s]!==void 0&&t[s][i]!==void 0&&t[s][i][o]!==void 0&&delete t[s][i][o][r]},init:(t,n)=>n.payload}}),{actions:to}=Kc,Nh=Kc.reducer,zh=b1({middleware:t=>t().concat(M0),reducer:{form:_0,layout:rh,integrations:Q0,notifications:uh,rules:kh,context:F0,search:Fh,translations:Nh}}),H=qt.withTypes(),Pt=P,Vo=ac.withTypes(),Mh="api_error";class Ih extends Error{constructor(n){super(n.message),this.errors={},this.name=Mh,this.status=n.response.status,this.errors=n.response.data.errors}getFlatErrors(){return Object.values(this.errors).flatMap(n=>Object.values(n)).join(", ")}}const Ah=window.location.href.replace(/(.*\/freeform).*/i,"$1"),me=(t,n=!0)=>{const s=(t??"").replace(/\/+/g,"/").replace(/^\/(.*)/,"$1").replace(/\/$/,""),i=s.length?`/${s}`:"",o=new URL(`${Ah}${i}`);return n?o.href:o.pathname},Rh=()=>{if(typeof globalThis<"u"&&globalThis.Craft)return globalThis.Craft;if(typeof window<"u"&&window.Craft)return window.Craft};T.defaults.baseURL=me("/");T.defaults.headers.get&&(T.defaults.headers.get.Accept="application/json");T.defaults.headers.post&&(T.defaults.headers.post.Accept="application/json");T.interceptors.request.use(t=>{const n=t.method?.toLowerCase();if(n&&["post","put","patch","delete"].includes(n)){t.data===void 0&&(t.data={});const s=Rh();s&&t.headers.set("X-CSRF-Token",s.csrfTokenValue)}return t});T.interceptors.response.use(null,t=>(t.response?.data?.error&&(t.message=t.response.data.error),t.response?.data?.errors?Promise.reject(new Ih(t)):Promise.reject(t)));const Ph=l.div`
  padding: 0 var(--xl);
`,fe={base:["forms"],all:t=>[...fe.base,t],single:t=>[...fe.base,t],settings:()=>[...fe.base,"settings"],usage:(t,n)=>[...fe.base,t,"usage",n]},ei=()=>{const{current:t,getCurrentHandleWithFallback:n}=Fe();return B({queryKey:fe.all(n()),queryFn:()=>T.get("/api/forms",{params:{site:t?.handle}}).then(s=>s.data),staleTime:1/0,gcTime:1/0})},Dh=t=>B({queryKey:fe.single(t),queryFn:()=>T.get(`/api/forms/${t}`).then(n=>n.data),staleTime:1/0,enabled:!!t}),Gt=()=>{const t=H();return B({queryKey:fe.settings(),queryFn:()=>T.get("/api/forms/settings").then(n=>n.data).then(n=>n.sort((s,i)=>s.order-i.order)).then(n=>(t(gt.setInitialSettings(n)),n)),staleTime:1/0,gcTime:1/0})},Bh=()=>{const{formId:t}=V(),{current:n}=Fe();return B({queryKey:fe.usage(Number(t),n.id),queryFn:()=>T.get(`/api/forms/${t}/elements?site=${n.id}`).then(s=>s.data)})},Oh=()=>{const{data:t}=ei();return t?.reduce((s,i)=>(s[i.id]=i.settings?.general?.color||null,s),{})||{}},ze={all:["integrations"],form:t=>[...ze.all,"forms",t],navigation:["integrations","navigation"],properties:(t,n,s)=>[...ze.all,"properties",t,n,s],authCheck:t=>[...ze.all,t,"auth-check"]},_h=t=>{const n=X();return g.useCallback(()=>{t&&n.removeQueries({queryKey:ze.form(t)})},[t,n])},Go=t=>{const n=qt();return B({queryKey:ze.form(t),queryFn:()=>t?T.get(`/api/forms/${t}/integrations`).then(s=>s.data).then(s=>(n(At.set(s)),s)):Promise.resolve([]),staleTime:1/0,gcTime:1/0})},ke={all:["notifications"],types:()=>[...ke.all,"types"],templates:()=>[...ke.all,"templates"],suggestions:()=>[...ke.templates(),"suggestions"],formTemplates:t=>[...ke.all,"forms",t,"templates"],single:t=>[...ke.all,"forms",t]},Wh=t=>{const n=X();return g.useCallback(()=>{t&&(n.removeQueries({queryKey:ke.single(t)}),n.removeQueries({queryKey:ke.formTemplates(t)}))},[t,n])},Vc=()=>B({queryKey:ke.types(),queryFn:()=>T.get("/api/notifications/types").then(t=>t.data).then(t=>t.sort((n,s)=>n.order-s.order)),staleTime:1/0,gcTime:1/0}),Yo=t=>{const n=qt();return B({queryKey:ke.single(t),queryFn:()=>t?T.get(`/api/forms/${t}/notifications`).then(s=>s.data).then(s=>(n(Rt.set(s)),s)):Promise.resolve([]),staleTime:1/0,gcTime:1/0})},Uh=()=>B({queryKey:ke.templates(),queryFn:()=>T.get("/api/notifications/templates").then(t=>t.data),staleTime:1/0,gcTime:1/0}),Hh=t=>{const{templates:{method:n}}=I;return B({queryKey:ke.formTemplates(t),queryFn:()=>T.get(`/api/forms/${t}/notifications/templates`).then(s=>s.data),staleTime:1/0,gcTime:1/0,enabled:n!==is.Global})},qh=()=>{const{formId:t}=V(),n=te(),s=X();g.useEffect(()=>{const i=$i("/freeform/forms"),o=r=>(r.preventDefault(),t&&(s.invalidateQueries({queryKey:fe.single(Number(t))}),s.invalidateQueries({queryKey:ke.single(Number(t))}),s.invalidateQueries({queryKey:ze.form(Number(t))})),n("/forms"),!1);return i&&i.addEventListener("click",o),()=>{i&&i.removeEventListener("click",o)}},[t,n,s]),g.useEffect(()=>{const i=$i("/freeform/integrations"),o=r=>(r.preventDefault(),n("/integrations"),!1);return i&&i.addEventListener("click",o),()=>{i&&i.removeEventListener("click",o)}},[n]),g.useEffect(()=>{const i=$i("/freeform/ab-tests"),o=r=>(r.preventDefault(),n("/ab-tests"),!1);return i&&i.addEventListener("click",o),()=>{i&&i.removeEventListener("click",o)}},[n])},$i=t=>{let n=document.querySelector(`ul.nav-item__subnav li a[href*="${t}"]`);return n||(n=document.querySelector(`ul.subnav li a[href*="${t}"]`)),n},Qh=()=>(qh(),e.jsx(Ph,{id:"freeform-client-app",children:e.jsx(jt,{})})),Kh=l.header`
  width: auto !important;
`,Sn=({children:t,extra:n,...s})=>(s.style||(s.style={paddingLeft:0,paddingRight:0}),e.jsx("div",{id:"header-container",children:e.jsxs(Kh,{id:"header",...s,children:[e.jsx("div",{id:"page-title",className:"flex",children:e.jsx("h1",{className:"screen-title",children:t})}),n]})})),Ci=(t,n)=>{const s=t.children[0],i=t.querySelector(".sidebar-action--sub");n?(s.classList.add("sel"),i?.classList.add("sel"),i?.setAttribute("aria-current","page")):(s.classList.remove("sel"),i?.classList.remove("sel"),i?.removeAttribute("aria-current"))},Ln=t=>{const n=document.querySelectorAll("#nav-freeform > ul > li");g.useEffect(()=>(n.forEach(s=>{const i=s.querySelector("a.sidebar-action")?.getAttribute("href");Ci(s,i?.includes(t))}),()=>{n.forEach(s=>{Ci(s,!1)}),Ci(n[0],!0)}),[t,n])},$t=({callback:t,isEnabled:n,refObject:s,excludeClassNames:i})=>{const o=g.useRef(null),r=s||o;return g.useEffect(()=>{const a=c=>{n&&(document.activeElement instanceof HTMLInputElement||document.activeElement instanceof HTMLTextAreaElement||n&&r.current&&!r.current.contains(c.target)&&!d0(c.target,i)&&typeof t=="function"&&t())};return document.addEventListener("click",a,!0),()=>{document.removeEventListener("click",a,!0)}},[r,n,i]),r},ft=({meetsCondition:t,callback:n,type:s="keyup",ref:i},o=[])=>{const r=i?.current??document;g.useEffect(()=>((t===void 0||t)&&r.addEventListener(s,n),t===!1&&r.removeEventListener(s,n),()=>{r.removeEventListener(s,n)}),[t,n,r,s,...o])},R=t=>{const{title:n,children:s,...i}=t;return e.jsxs("svg",{role:n?"img":void 0,"aria-hidden":n?void 0:!0,xmlns:"http://www.w3.org/2000/svg",...i,children:[Vh(n),s]})},Vh=t=>t?.trim()?e.jsx("title",{children:t}):null,Gc=t=>e.jsxs(R,{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",...t,children:[e.jsx("path",{d:"M5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8Z",fill:"currentColor"}),e.jsx("path",{d:"M10 8C10 8.55228 9.55228 9 9 9C8.44772 9 8 8.55228 8 8C8 7.44772 8.44772 7 9 7C9.55228 7 10 7.44772 10 8Z",fill:"currentColor"}),e.jsx("path",{d:"M15 8C15 8.55228 14.5523 9 14 9C13.4477 9 13 8.55228 13 8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8Z",fill:"currentColor"})]}),Gh=l.div`
  position: relative;
`,Yh=l.button`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  width: var(--ui-control-height);
  height: var(--ui-control-height);
  padding: 0;

  border: 1px solid ${h.gray250};
  border-radius: ${S.md};
  background: ${h.white};
  color: ${h.gray700};

  svg {
    width: 18px;
    height: 18px;
    stroke: ${h.gray500};
  }

  &:hover,
  &.open {
    background: rgba(96, 125, 159, 0.3);
  }
`,Jh=l.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;

  min-width: 120px;

  background: ${h.white};
  box-shadow: ${re.boxSubtle};

  border: 1px solid ${h.gray200};
  border-radius: ${S.md};
`,Zh=l.button`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${m.sm};

  width: 100%;
  padding: ${m.sm} ${m.md};

  background: transparent;
  color: ${({$destructive:t})=>t?h.red600:h.gray700};

  border: 0;
  border-top: 1px solid ${h.gray200};

  font-size: 12px;
  text-align: left;

  &:first-child {
    border-top: 0;
  }

  &:hover {
    background: ${h.gray050};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,Xh=({choices:t,ariaLabel:n=u("Actions")})=>{const[s,i]=g.useState(!1);ft({callback:r=>{r.key==="Escape"&&i(!1)},meetsCondition:s,type:"keyup"});const o=$t({isEnabled:s,callback:()=>i(!1)});return e.jsxs(Gh,{ref:o,children:[e.jsx(Yh,{type:"button",className:E(s&&"open"),onClick:()=>i(r=>!r),"aria-label":n,"aria-expanded":s,title:n,children:e.jsx(Gc,{})}),s&&e.jsx(Jh,{children:t.map(r=>e.jsxs(Zh,{type:"button",className:r.className,$destructive:r.destructive,onClick:()=>{i(!1),r.onClick()},children:[r.icon,e.jsx("span",{children:r.label})]},r.label))})]})},ex=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"})}),Yc=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),tx=({onDelete:t,onEdit:n})=>e.jsx(Xh,{choices:[{icon:e.jsx(ex,{}),label:u("Edit"),onClick:n},{destructive:!0,icon:e.jsx(Yc,{}),label:u("Delete"),onClick:t}]}),Jc=t=>e.jsx(R,{width:"14",height:"14",viewBox:"0 0 14 14",...t,children:e.jsx("path",{d:"M2.5 7L5.5 10L11.5 4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})}),Jo=(t,n={})=>{const{transliterate:s,camelize:i}=n;let o=t;return s&&(o=Oo(o)),i&&(o=Bo(o)),o=o.replace(/^[^a-z]+/gi,""),o},ga=["#1660c7","#d92d20","#7a3ec8","#f58c00","#008f8f","#c200fb","#2d6a4f"],Zc=(t,n)=>t.formColor||ga[n%ga.length],nx=[{id:"conversionRate",label:"Conversion Rate"},{id:"impressions",label:"Impressions"},{id:"interactions",label:"Interactions"},{id:"failures",label:"Failures"}],Xc=t=>`${t.toFixed(1)}%`,sx=t=>({id:t.id,name:t.name,handle:t.handle,description:t.description,startDate:t.startDate,endDate:t.endDate,variants:t.variants.map(n=>({id:n.id,formId:n.formId,weight:n.weight}))}),ix=(t,n)=>{const s=t[0];return s?s.series.map((i,o)=>{const r={date:i.date};return t.forEach(a=>{const c=a.series[o];r[`variant-${a.id}`]=c?.[n]??0}),r}):[]},ki=t=>Jo(t,{transliterate:!0,camelize:!0}),ox=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
  margin-bottom: 50px;
`,rx=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,ax=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
`,lx=l.section`
  padding: 2px 3px;

  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.lg};
  box-shadow: ${re.box};
`,cx=l.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${m.md};

  padding: ${m.lg} ${m.xl};

  background: ${h.gray050};
  border-radius: ${S.lg};

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
  }

  p {
    margin: 0 0;
    color: ${h.gray700};
  }
`,dx=l.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${m.sm};

  margin-top: 8px;

  color: ${h.gray700};

  > span {
    &:nth-child(n + 3) {
      &::before {
        content: '•';
        display: inline-block;
        margin-right: ${m.sm};
        color: ${h.gray400};
      }
    }
  }
`,ux=l.span`
  display: inline-block;
  width: 10px;
  height: 10px;

  border-radius: 50%;
  background: ${({$status:t})=>{switch(t){case"active":return h.green600;case"scheduled":return h.yellow500;default:return h.gray400}}};
`,px=l.div`
  padding: ${m.lg} ${m.xl} 0;
`,hx=l.div`
  display: inline-flex;
  margin-bottom: ${m.lg};

  background: ${h.gray100};
  border-radius: ${S.md};

  overflow: hidden;
`,xx=l.button`
  cursor: pointer;
  padding: ${m.sm} ${m.md};

  background: ${({$active:t})=>t?h.gray500:h.gray100};
  border: 0;
  color: ${({$active:t})=>t?h.white:h.gray800};
`,mx=l.div`
  display: grid;
  justify-content: start;
  align-items: end;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${m.md};

  padding: ${m.lg} ${m.xl} ${m.xl};
`,gx=l.div``,fx=l.article`
  padding: 2px;

  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.md};

  overflow: hidden;

  &.winner {
    border-color: ${h.green600};
  }
`,bx=l.div`
  padding: 6px 6px 10px;
  margin: 0 0 -4px;

  border-radius: ${S.lg} ${S.lg} 0 0;
  background: ${h.green600};

  color: ${h.white};
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;

  > div {
    display: inline-block;
    position: relative;

    svg {
      position: absolute;
      left: -33px;
      top: -3px;

      width: 26px;
      height: 26px;
    }
  }
`,jx=l.header`
  display: flex;
  align-items: center;
  gap: ${m.md};

  padding: ${m.md};

  border-radius: ${S.md};
  background: ${h.gray050};

  font-size: 20px;
  font-weight: 600;
`,yx=l.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 35px;
  height: 35px;

  border-radius: 100%;
  background: ${h.gray300};

  color: ${h.white};

  font-size: 20px;
  font-weight: 700;
  text-align: center;
`,vx=l.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;

  padding: ${m.md};

  color: ${h.gray700};
`,wx=l.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: ${m.sm} ${m.md};

  border-radius: ${S.md};
  background: ${h.gray050};

  font-weight: 700;

  .thick {
    font-size: 24px;
    line-height: 24px;
    color: ${h.gray500};
  }
`,$x=l.div`
  padding: ${m.xl};

  background: ${h.white};
  border: 1px dashed ${h.gray300};
  border-radius: ${S.lg};
  color: ${h.gray700};
`,ed=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};

  max-height: 70vh;
  min-height: 40vh;
  padding: ${m.lg} ${m.xl};

  overflow: auto;

  td.weight {
    vertical-align: middle;
  }
`,Cx=l.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${m.md};

  .react-datepicker-wrapper {
    width: 100%;
  }
`;l.div`
  display: grid;
  grid-template-columns: 1fr 120px auto;
  align-items: center;
  gap: ${m.sm};

  padding: ${m.md};

  border: 1px solid ${h.gray200};
  border-radius: ${S.md};

  select,
  input {
    width: 100%;
  }
`;l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
`;const kx=({variant:t,test:n})=>{const s=t.id===n.winnerVariantId,i=n.endDate&&fc(n.endDate),o=n.variants.indexOf(t);return e.jsxs(gx,{children:[s&&e.jsx(bx,{children:e.jsxs("div",{children:[e.jsx(Jc,{})," ",u(i?"Winner":"Winning")]})}),e.jsxs(fx,{className:E(s&&"winner"),children:[e.jsxs(jx,{children:[e.jsx(yx,{style:{backgroundColor:Zc(t,o)},children:String.fromCharCode(65+o)}),t.formName]}),e.jsxs(vx,{children:[e.jsx("span",{children:u("Weight")}),e.jsxs("strong",{children:[t.weight,"%"]}),e.jsx("span",{children:u("Impressions")}),e.jsx("strong",{children:t.stats.served.toLocaleString()}),e.jsx("span",{children:u("Interactions")}),e.jsx("strong",{children:t.stats.interacted.toLocaleString()}),e.jsx("span",{children:u("Failures")}),e.jsx("strong",{children:t.stats.failed.toLocaleString()}),e.jsx("span",{children:u("Conversions")}),e.jsx("strong",{children:t.stats.completed.toLocaleString()})]}),e.jsxs(wx,{children:[e.jsx("span",{children:u("Conversion Rate")}),e.jsx("span",{className:"thick",children:Xc(t.stats.conversionRate)})]})]})]},t.id)},Sx=({test:t,activeTab:n,setTab:s})=>{const i=ix(t.variants,n),o=n==="conversionRate";return e.jsxs(px,{children:[e.jsx(hx,{children:nx.map(r=>e.jsx(xx,{$active:n===r.id,onClick:()=>s(t,r.id),children:u(r.label)},r.id))}),e.jsx(nt,{width:"100%",height:280,children:e.jsxs(j1,{data:i,margin:{top:12,right:12,left:0,bottom:0},children:[e.jsx(lc,{stroke:"#e5e7eb99",vertical:!1}),e.jsx(cc,{dataKey:"date",axisLine:!1,tickLine:!1,interval:2,tickFormatter:r=>new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),e.jsx(_o,{axisLine:!1,tickLine:!1,tickFormatter:r=>`${r}${o?"%":""}`}),e.jsx(Wo,{formatter:r=>o?Xc(Number(r)):Number(r),labelFormatter:r=>new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),t.variants.map((r,a)=>e.jsx(y1,{type:"linear",dataKey:`variant-${r.id}`,stroke:Zc(r,a),strokeWidth:2,dot:!1,name:r.formName||`Variant ${a+1}`},r.id))]})})]})},Lx=h.gray100,fa=h.gray300,Q=ne`
  scrollbar-width: thin;
  scrollbar-color: ${fa} ${Lx};
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${fa};
  }
`,_e=ne`
  font-family:
    system-ui,
    BlinkMacSystemFont,
    -apple-system,
    Segoe UI,
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    Fira Sans,
    Droid Sans,
    Helvetica Neue,
    sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  color: rgb(154 165 177 / 75%);
`,Zo=ne`
  span:after {
    content: 'alert';

    position: relative;
    top: 1px;

    padding-left: 5px;

    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'liga', 'dlig';
    font-family: Craft;
  }
`,Fx=l.div`
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;

  overflow: hidden;
  border-right: 1px solid rgb(154 165 177 / 25%);

  pointer-events: ${({$active:t})=>t?"auto":"none"};
  background: ${({$active:t})=>t?h.gray050:"transparent"};

  transition: background-color 0.2s ease-in-out;
`,Ex=l(_.div)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;
`,no=l.a`
  position: absolute;
  right: 10px;
  top: 17px;

  z-index: 5;

  display: block;
  width: 20px;
  height: 20px;
`,mn=l.h3`
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: end;
  gap: ${m.sm};

  margin: 0;
  padding: ${m.lg};

  font-size: 16px;
  box-shadow: ${re.bottom};

  > span {
    display: block;
  }
`,Jn=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  svg {
    max-width: 20px;
    max-height: 20px;
  }
`,Zn=l.div`
  display: flex;
  flex-direction: column;

  padding: 0 ${m.lg} ${m.lg};

  overflow-y: auto;
  overflow-x: hidden;
  ${Q};
`,Us=l(Jn)`
  position: absolute;
  left: 2px;
  top: 12px;
  z-index: 1;

  width: 14px;
  height: 14px;

  fill: rgb(154 165 177 / 75%);
`,Xo=l.section`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: ${m.md};

  margin-top: ${m.lg};
  padding-top: ${m.lg};
  padding-bottom: ${m.lg};

  &:empty {
    display: none;

    & + ${Us} {
      display: none;
    }
  }

  &:before {
    content: '';

    position: absolute;
    left: 0;
    top: 0;
    right: 0;

    display: block;
    height: 1px;

    margin: 0 -18px;

    box-shadow: ${re.bottom};
  }

  &:after {
    content: attr(data-label);

    position: absolute;
    left: -5px;
    top: -9px;

    display: block;
    padding: 0 5px 0 26px;

    background-color: ${h.gray050};

    ${_e};
    font-size: 11px;
  }
`,Tx=l.div`
  position: relative;

  &:first-child {
    ${Xo} {
      margin-top: 0;

      &:before,
      &:after {
        display: none;
      }
    }

    ${Us} {
      display: none;
    }
  }
`,ba=20,Nx=(t,n)=>{const s=t?.getBoundingClientRect().top,i=window.innerHeight,o=n?.offsetHeight;return o===void 0?s:s&&o&&i?s+o>i-ba?s-(s+o-i+ba):s:0},zx=(t,n,s)=>{const{dimensions:i}=Ec(),[o,r]=g.useState(0),[a,c]=g.useState(0);let d=null;const p=g.useCallback(()=>{d===null&&(d=requestAnimationFrame(()=>{d=null,r(Nx(t,n));const x=t?.getBoundingClientRect()?.left;x!=null&&i&&c(x-i.left)}))},[t,n,i,d]);return g.useEffect(()=>{p()},[s]),g.useEffect(()=>{const x=()=>{p()};if(n){const f=document.querySelector(Zn.toString()),b=new ResizeObserver(x);return b.observe(n),window.addEventListener("resize",x),window.addEventListener("scroll",x),f?.addEventListener("scroll",x),()=>{b.disconnect(),window.removeEventListener("resize",x),window.removeEventListener("scroll",x),f?.removeEventListener("scroll",x),d!==null&&cancelAnimationFrame(d)}}},[n,d,p]),{top:o,left:a}},td=({wrapper:t,editor:n,isEditing:s})=>{const{top:i,left:o}=zx(t,n,s),r=t?.offsetWidth,[a,c]=g.useState(!1);return{editorAnimation:Y({immediate:p=>["top","left","width","pointerEvents","transformOrigin"].includes(p),to:{top:i,left:o,width:r,opacity:s?1:0,transformOrigin:"top left",transform:s?"scaleY(1)":"scaleY(0.5)",pointerEvents:s?"initial":"none"},config:{tension:700,friction:40}}),isVisible:a,setVisible:c}},er=t=>e.jsxs(R,{viewBox:"0 0 512 512",...t,children:[e.jsx("style",{children:`.spinner-path {
      transform-origin: center;
      animation: spinner-animation 1s linear infinite reverse
    }

    @keyframes spinner-animation{
      100% {
        transform:rotate(360deg)
      }
    }`}),e.jsx("path",{className:"spinner-path",d:"M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"})]}),nd=({children:t})=>{const{element:n}=Ec();return n?Do.createPortal(t,n):null},Mx=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M326.6 166.6L349.3 144 304 98.7l-22.6 22.6L192 210.7l-89.4-89.4L80 98.7 34.7 144l22.6 22.6L146.7 256 57.4 345.4 34.7 368 80 413.3l22.6-22.6L192 301.3l89.4 89.4L304 413.3 349.3 368l-22.6-22.6L237.3 256l89.4-89.4z"})}),sd=(t,n)=>{if(!t)return!1;for(const s of t)if("value"in s&&String(s.value)===String(n)||"children"in s&&sd(s.children,n))return!0;return!1},id=t=>{if(t)for(const n of t){if("value"in n)return n.value;if("children"in n){const s=id(n.children);if(s!==void 0)return s}}},od=(t,n)=>{if(t)for(const s of t){if("value"in s&&String(s.value)===String(n))return s;if("children"in s){const i=od(s.children,n);if(i!==void 0)return i}}},rd=(t,n)=>{if(t)for(const s of t){if("value"in s&&String(s.value)===String(n))return s.shadowIndex;if("children"in s)return rd(s.children,n)}},ad=(t,n)=>{if(t)for(const s of t){if("shadowIndex"in s&&s.shadowIndex===n)return s.value;if("children"in s){const i=ad(s.children,n);if(i!==void 0)return i}}},ld=(t,n,s=0,i)=>{let o=s,r;i!=null&&!n&&(r={label:u(i),value:"",shadowIndex:o++});const a=t?.map(c=>{if("value"in c&&(!n||c.label.toLowerCase().includes(n.toLowerCase())))return{...c,shadowIndex:o++};if("children"in c){const[d,p]=ld(c.children,n,o);if(d.length)return o=p,{...c,children:d}}return null}).filter(Boolean)||[];return r&&a.unshift(r),[a,o]},Ix=(t,n,s)=>g.useMemo(()=>ld(t,n,void 0,s),[t,n,s]),Ax=t=>e.jsx(R,{viewBox:"0 0 100 100",version:"1.1",...t,children:e.jsx("g",{stroke:"none",strokeWidth:"1",children:e.jsx("g",{children:e.jsx("path",{d:"M100.006315,26.9686872 C100.006315,28.5816922 99.3611131,30.1946973 98.1997494,31.356061 L42.7123746,86.8434358 C41.5510109,88.0047995 39.9380058,88.6500015 38.3250008,88.6500015 C36.7119957,88.6500015 35.0989906,88.0047995 33.9376269,86.8434358 L1.80656569,54.7123746 C0.645202033,53.5510109 0,51.9380058 0,50.3250008 C0,48.7119957 0.645202033,47.0989906 1.80656569,45.9376269 L10.5813133,37.1628793 C11.742677,36.0015156 13.3556821,35.3563136 14.9686872,35.3563136 C16.5816922,35.3563136 18.1946973,36.0015156 19.356061,37.1628793 L38.3250008,56.1963393 L80.6502541,13.8065657 C81.8116178,12.645202 83.4246229,12 85.037628,12 C86.650633,12 88.2636381,12.645202 89.4250018,13.8065657 L98.1997494,22.5813133 C99.3611131,23.742677 100.006315,25.3556821 100.006315,26.9686872 Z",id:"raiarzrpcn-Shape"})})})}),cd=(t=1)=>t>10?"":`& > li {
    > label {
      padding-left: ${t*10+20}px;

      &.has-children {
        padding-left: ${(t+1)*12}px;
      }
    }

    > ul {
      ${cd(t+1)}
    }
  }`,Rx=l.ul`
  margin: 0;
  padding: 0;

  ul {
    ${cd()}
  }
`,Hs=l.div`
  position: absolute;
  left: 8px;
  top: 7px;

  width: 16px;
  font-size: 18px;
  font-weight: bold;

  fill: ${h.gray500};
`;l.div``;const dd=l.div`
  display: inline-flex;
  justify-content: start;
  align-items: center;
  gap: ${m.sm};

  > svg {
    width: 16px;
    height: 16px;
  }
`,ja=l.div`
  color: ${h.gray300};
  font-size: 11px;
  font-style: italic;
  line-height: 11px;
  height: 11px;
`,Wn=l.label`
  display: block;
  padding: 5px 14px 5px 30px;

  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: ${h.gray500};
    color: ${h.white};

    ${Hs} {
      fill: ${h.white};
    }
  }

  &.has-children {
    position: relative;

    padding-left: 12px;

    text-transform: uppercase;
    font-weight: bold;

    font-size: 12px;

    color: #7d8c9d;
    fill: currentColor;

    > ${dd} {
      position: relative;

      padding: 0 10px;
      background-color: ${h.gray050};

      z-index: 1;
    }

    &:hover {
      cursor: default;
      background-color: transparent;
    }

    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 13px;

      height: 1px;
      background-color: ${h.gray200};
    }
  }
`,Px=l.li`
  position: relative;

  &.focused {
    > ${Wn} {
      background-color: #cfd8e3;
      color: ${h.gray700};

      > ${Hs} {
        fill: ${h.gray700};
      }
    }
  }

  &.has-children {
    > ${Wn} {
    }
  }

  &.empty {
    > ${Wn} {
      color: ${h.gray300};
      font-style: italic;

      &:hover {
        color: ${h.white};
      }
    }

    &.focused {
      > ${Wn} {
        background-color: transparent;

        &:hover {
          background-color: ${h.gray500};
          color: ${h.white};
        }

        > ${Hs} {
          fill: transparent;
        }
      }
    }
  }
`,Dx=l.input`
  width: 100%;
  padding: 7px 30px 7px 10px;

  border-bottom: 1px solid ${h.hairline};

  &:focus,
  &:active,
  &:hover {
    box-shadow: none;
    outline: none;
  }
`,Bx=l.div`
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  ${Q};
`,ud=l.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: start;
  gap: ${m.sm};

  background-color: #dfe5ec;
  border-radius: ${S.lg};

  padding: 7px 22px 7px 10px;

  &.empty > span {
    color: ${h.gray300};
    font-style: italic;
  }

  > span {
    min-height: 20px;
  }

  &:hover {
    box-shadow: var(--focus-ring);
    outline-color: transparent;
  }

  &:after {
    content: '';
    position: absolute;
    top: calc(50% - 5px);
    right: 9px;

    display: block;
    width: 7px;
    height: 7px;

    opacity: 0.8;
    border: solid;
    border-width: 0 2px 2px 0;

    font-size: 0;

    transform: rotate(45deg);

    user-select: none;
    pointer-events: none;
  }
`,Ox=l.div`
  > svg {
    fill: currentColor;
    width: 20px;
    height: 20px;
  }
`,pd=l(_.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;

  background-color: ${h.gray050};
  border-radius: ${S.lg};
  box-shadow: ${re.container};

  overflow: hidden;
  z-index: 1000;
`,_x=l.button`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 30px;
  height: 34px;

  cursor: pointer;

  &:hover {
    background-color: ${h.gray050};
  }
`,Wx=l.div`
  position: relative;

  &.open {
    ${pd} {
      display: block;
    }

    ${ud} {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      &:hover {
        box-shadow: none;
        outline-color: transparent;
      }
    }
  }
`,hd=l.span`
  display: flex;
  align-items: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`,Ux=l.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`,xd=({value:t,options:n,query:s,focusIndex:i,showValues:o,showHints:r,onChange:a})=>{const c=g.useRef([]);return g.useEffect(()=>{c.current[i]&&c.current[i].scrollIntoView({behavior:"smooth",block:"nearest"})},[i]),e.jsx(Rx,{children:n?.map((d,p)=>{let x,f,b;"value"in d&&(x=d.value,b=d.shadowIndex),"hint"in d&&(f=d.hint);let j;return"children"in d&&(j=d.children),e.jsxs(Px,{ref:y=>{b!==void 0&&(c.current[b]=y)},onClick:y=>{y.stopPropagation(),x!==void 0&&a&&a(x)},className:E(j!==void 0&&"has-children",x===t&&"selected",x===""&&"empty",b===i&&"focused"),children:[e.jsxs(Wn,{className:E(j!==void 0&&"has-children"),"data-value":x,children:[!j&&t===x&&e.jsx(Hs,{children:e.jsx(Ax,{})}),e.jsxs(dd,{children:[d.icon&&e.jsx(Ux,{children:d.icon}),e.jsx("div",{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d.label)}})})]}),!o&&r&&f&&e.jsx(ja,{children:f}),o&&x!==""&&x!==void 0&&x!==null&&x!==d.label&&e.jsx(ja,{children:x})]}),j&&e.jsx(xd,{options:j,value:t,query:s,focusIndex:i,onChange:a,showHints:r,showValues:o})]},p)})})},de=({emptyOption:t,value:n,options:s,showValues:i,showHints:o,showSelectedIcon:r,onChange:a,className:c,loading:d=!1})=>{const[p,x]=g.useState(!1),[f,b]=g.useState(""),[j,y]=g.useState(0),w=g.useRef(null),v=g.useRef(null),$=$t({callback:()=>x(!1),isEnabled:p,excludeClassNames:["dropdown-rollout"]}),{editorAnimation:C}=td({wrapper:$.current,editor:v.current,isEditing:p}),F=g.useCallback(()=>{d||x(!p)},[d,p]),[N,M]=Ix(s,f,t),z=g.useMemo(()=>od(s,n),[s,n]),L=g.useMemo(()=>rd(N,n),[N,n]);os(()=>x(!1),p),ft({meetsCondition:p,type:"keydown",callback:D=>{D.key==="ArrowDown"&&j<M-1&&y(ce=>ce+1),D.key==="ArrowUp"&&j>0&&y(ce=>ce-1)}},[j,M]),ft({meetsCondition:p,type:"keyup",callback:D=>{if(D.key==="Enter"){const ce=ad(N,j);a?.(ce),x(!1)}}},[N,j]),g.useEffect(()=>{d&&p&&x(!1)},[d,p]),g.useEffect(()=>{p?(w.current?.focus(),y(L||0)):b("")},[p,L]);const A=g.useCallback(D=>{a?.(D),x(!1)},[a]);return e.jsxs(Wx,{ref:$,className:E(p&&"open",c),onClick:F,children:[e.jsxs(ud,{className:E(d&&"disabled",(n===""||n===null)&&"empty"),children:[r&&e.jsx(hd,{children:z?.icon}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(z?.label||u(t))}}),d&&e.jsx(Ox,{children:e.jsx(er,{})})]}),e.jsx(nd,{children:p&&e.jsxs(pd,{className:"dropdown-rollout",ref:v,style:C,children:[e.jsx(_x,{children:e.jsx(Mx,{})}),e.jsx(Dx,{placeholder:u("Search..."),ref:w,value:f,onClick:D=>D.stopPropagation(),onKeyDown:D=>{["ArrowUp","ArrowDown"].includes(D.key)&&D.preventDefault()},onChange:D=>b(D.target.value)}),e.jsx(Bx,{children:e.jsx(xd,{options:N,value:n,focusIndex:j,showValues:i,showHints:o,onChange:A})})]})})]})},Xn={all:["field-types"],propertySections:()=>[...Xn.all,"property-sections"]},md=()=>T.get("/api/fields/types").then(t=>t.data),tr=({select:t}={})=>B({queryKey:Xn.all,queryFn:md,staleTime:1/0,select:t}),gd=()=>T.get("/api/fields/types/sections").then(t=>t.data).then(t=>t.sort((n,s)=>n.order-s.order)),nr=()=>B({queryKey:Xn.propertySections(),queryFn:gd,staleTime:1/0}),Me=t=>{const{data:n}=tr();if(n)return n.find(s=>s.typeClass===t)},Yt=()=>{const{data:t}=tr();return n=>{if(t)return t.find(s=>s.typeClass===n)}},Hx={all:["page-type"]},fd=()=>B({queryKey:Hx.all,queryFn:()=>T.get("/api/types/page-buttons").then(t=>t.data),staleTime:1/0});var K=(t=>(t.Ai="ai",t.AppStateSelect="appStateSelect",t.AssetPicker="assetPicker",t.Attributes="attributes",t.Boolean="bool",t.BooleanEnv="boolEnv",t.FormMonitorTools="formMonitorTools",t.Calculation="calculation",t.Cards="cards",t.Checkboxes="checkboxes",t.CodeEditor="codeEditor",t.Color="color",t.ConditionalRules="conditionalRules",t.DateTime="dateTime",t.DynamicCheckboxes="dynamicCheckboxes",t.DynamicSelect="dynamicSelect",t.Field="field",t.FieldMapping="fieldMapping",t.FieldSelection="fieldSelection",t.FieldType="fieldType",t.Hidden="hidden",t.Integer="int",t.Label="label",t.MinMax="minMax",t.NotificationTemplate="notificationTemplate",t.OptionPicker="optionPicker",t.Options="options",t.PageButton="pageButton",t.PageButtonsLayout="pageButtonsLayout",t.RecipientMapping="recipientMapping",t.Recipients="recipients",t.SaveButton="saveButton",t.Select="select",t.String="string",t.Table="table",t.TabularData="tabularData",t.Textarea="textarea",t.WYSIWYG="wysiwyg",t))(K||{});const Pe={current:t=>t.form,settings:{all:()=>t=>t.form.settings||{},one:t=>n=>n.form.settings?.[t],namespaces:{all:t=>n=>n.form.settings?.[t],one:(t,n)=>s=>s.form.settings?.[t]?.[n]}},errors:t=>t.form.errors},qx={namespace:(t,n)=>Z(s=>s.translations?.[t],s=>{if(!n)return;let i,o=n?.uid;return"properties"in n?i="fields":"namespaceType"in n&&n.namespaceType==="settings"?(i="form",o=n.namespace):i="pages",s?.[i]?.[o]})},Qx=[K.Options];function Ce(t){const n=H(),{current:s,isPrimary:i}=Fe(),o=Yt(),a=P(Pe.settings.one("general"))?.translations,{data:c}=fd(),{data:d}=Gt(),p=t&&"typeClass"in t,x=t&&"namespaceType"in t&&t.namespaceType==="settings",f=s.id,b=x?t.namespace:t?.uid,j=p?"fields":x?"form":"pages",y=Pt(qx.namespace(s.id,t)),w=g.useCallback(L=>{if(p){const A=o(t.typeClass);return A?A.properties.find(D=>D.handle===L):void 0}if(x){const A=d?.find(D=>D.handle===b);return A?A.properties.find(D=>D.handle===L):void 0}return c?.properties?.find(A=>A.handle===L)},[p,x,o,c,b]),v=g.useCallback(L=>t&&y?.[L]!==void 0,[t,y]),$=g.useCallback(L=>{if(!a||!t||i)return!1;const A=w(L);return A===void 0?L==="label":A.translatable},[i,t,a,w]),C=g.useCallback((L,A)=>!$(L)||!v(L)?A:y[L],[y,$,v]),F=g.useCallback((L,A)=>{if(!$(L)||!v(L))return A;const D=Mt(A),ce=y[L];return D.source==="custom"&&ce.options&&(D.options=D.options.map(pe=>{const St=ce.options.find(on=>on.value===pe.value);return St?{...pe,label:St.label}:pe})),D},[y,$,v]);return{hasTranslation:v,willTranslate:$,getTranslation:C,getOptionTranslations:F,updateTranslation:(L,A)=>$(L)?(n(to.update({siteId:f,type:j,namespace:b,handle:L,value:A})),!0):!1,removeTranslation:L=>{$(L)&&n(to.remove({siteId:f,type:j,namespace:b,handle:L}))},canUseTranslationValue:L=>L.translatable&&Qx.includes(L.type)===!1,isTranslationsEnabled:a}}const Fn=l.label`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 6px;

  color: ${h.gray550};
  font-weight: ${({$regular:t})=>t?"normal":"bold"} !important;
`,Kx=l.span``,Vx=l.span`
  &:after {
    content: 'asterisk';

    color: ${h.red500};
    font-family: Craft;
    font-size: 10px;
  }
`,ya=18,bd=l.span`
  fill: ${h.gray500};

  &.active {
    cursor: pointer;
    fill: ${h.blue500};
  }

  svg {
    width: ${ya}px;
    height: ${ya}px;
  }
`,jd=l.span`
  display: block;

  color: ${h.gray300};
  padding-top: 0;
  line-height: 16px;
  font-size: 12px;
  font-style: italic;
  margin: ${m.xs} 0;

  &:not(:last-child) {
    padding-bottom: 6px;
  }

  code {
    padding: 1px 4px;
    border-radius: 3px;
    background-color: #dfe5ec;

    font-family: monospace;
    font-style: normal;
    color: ${h.gray600};
  }
`,sr=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};

  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

  &.disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.5;
  }

  &.align {
    &-start {
      align-items: flex-start;
    }
    &-center {
      align-items: center;
    }
    &-end {
      align-items: flex-end;
    }
  }

  &.justify {
    &-start {
      justify-content: flex-start;
    }
    &-center {
      justify-content: center;
    }
    &-end {
      justify-content: flex-end;
    }
  }
`,ls=l.div`
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  width: ${({$width:t})=>t?`${t}%`:"100%"};

  &.disabled {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }

  &.errors {
    ${Fn} {
      color: ${h.error};
    }

    ${sr} {
      input,
      textarea,
      select {
        border: 1px solid ${h.error};
      }

      select {
        background-color: var(--ui-control-bg-color);

        &:hover {
          background-color: var(--ui-control-hover-bg-color);
        }
      }
    }
  }

  &.upsell {
    > * {
      user-select: none;
      pointer-events: none;
      filter: blur(1.3px);
    }

    &:before {
      content: attr(data-upsell);

      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1;
      transform: translate(-50%, -50%);

      padding: ${m.md} ${m.xl};

      border: 2px solid ${h.blue400};
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2);

      font-size: 14px;
      text-align: center;
      color: ${h.gray700};
    }

    &.size-small:before {
      font-size: 12px;
      left: auto;
      right: 0;
      transform: translate(0, -50%);

      padding: ${m.xs} ${m.xs};
      width: 120px;
  }

  &.spacing-small {
    padding-top: 6px;
  }

  ::placeholder {
    color: ${h.gray200};
    font-style: italic;
  }

  .btn {
    background-color: var(--ui-control-bg-color);

    &:hover {
      background-color: var(--ui-control-hover-bg-color);
    }
  }
`,Gx=l.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${m.sm};

  width: 100%;
`,Yx=l.div`
  flex: 1;
`,va=l.div``,yd=t=>g.useMemo(()=>t?t.split(/`([^`]+)`/g).map((i,o)=>o%2!==0?e.jsx("code",{children:i},o):i):null,[t]),cs=g.memo(({instructions:t})=>{const n=g.useMemo(()=>t?u(t):null,[t]),s=yd(n);return s?e.jsx(jd,{children:s}):null});cs.displayName="FormInstructions";const vd=t=>e.jsx(R,{viewBox:"0 0 640 512",...t,children:e.jsx("path",{d:"M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l208 0 32 0 16 0 256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L320 64l-16 0-32 0L64 64zm512 48c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16l-256 0 0-288 256 0zM178.3 175.9l64 144c4.5 10.1-.1 21.9-10.2 26.4s-21.9-.1-26.4-10.2L196.8 316l-73.6 0-8.9 20.1c-4.5 10.1-16.3 14.6-26.4 10.2s-14.6-16.3-10.2-26.4l64-144c3.2-7.2 10.4-11.9 18.3-11.9s15.1 4.7 18.3 11.9zM179 276l-19-42.8L141 276l38 0zM456 164c-11 0-20 9-20 20l0 4-52 0c-11 0-20 9-20 20s9 20 20 20l72 0 35.1 0c-7.3 16.7-17.4 31.9-29.8 45l-.5-.5-14.6-14.6c-7.8-7.8-20.5-7.8-28.3 0s-7.8 20.5 0 28.3L430 298.3c-5.9 3.6-12.1 6.9-18.5 9.8l-3.6 1.6c-10.1 4.5-14.6 16.3-10.2 26.4s16.3 14.6 26.4 10.2l3.6-1.6c12-5.3 23.4-11.8 34-19.4c4.3 3 8.6 5.8 13.1 8.5l18.9 11.3c9.5 5.7 21.8 2.6 27.4-6.9s2.6-21.8-6.9-27.4l-18.9-11.3c-.9-.5-1.8-1.1-2.7-1.6c17.2-18.8 30.7-40.9 39.6-65.4L534 228l2 0c11 0 20-9 20-20s-9-20-20-20l-16 0-44 0 0-4c0-11-9-20-20-20z"})}),wd=({label:t,handle:n,required:s,translatable:i,hasTranslation:o,isEncrypted:r,removeTranslation:a})=>t?e.jsxs(Fn,{className:E(s&&"is-required"),htmlFor:n,children:[e.jsx(Kx,{children:u(t)}),s&&e.jsx(Vx,{}),r&&e.jsx("i",{className:"fa-solid fa-shield-alt",style:{color:h.blue500},title:u("This field is encrypted.")}),i&&e.jsx(bd,{className:E(o&&"active"),title:o?u("Remove translation"):void 0,onClick:()=>{o&&confirm(u("Are you sure you want to remove the translation?"))&&a?.()},children:e.jsx(vd,{})})]}):null,$d=g.createContext({size:"normal"}),Cd=({size:t,children:n})=>e.jsx($d.Provider,{value:{size:t??"normal"},children:n}),ir=()=>g.useContext($d),Jx=l.ul`
  list-style: square;

  margin-top: 5px;
  padding-left: 20px;

  color: ${h.error};
`,ti=({errors:t,...n})=>!t||!t.length?null:e.jsx(Jx,{...n,children:t.map((s,i)=>e.jsx("li",{children:s},i))}),Zx=l.ul`
  list-style: none;

  margin-top: 5px;

  display: flex;
  flex-direction: column;
  gap: 2px;

  > li {
    &.message-type-warning {
      color: ${h.warning};
    }

    &.message-type-notice {
      color: ${h.notice};
    }
  }
`,Xx=({messages:t,...n})=>!t||!t.length?null:e.jsx(Zx,{...n,children:t.map(({message:s,type:i},o)=>e.jsxs("li",{className:E(`message-type-${i}`,i,"has-icon"),children:[e.jsx("span",{className:"icon"}),u(s)]},o))}),Te=({edition:t,label:n,handle:s,required:i,instructions:o,translatable:r,hasTranslation:a,removeTranslation:c,width:d,disabled:p,children:x,errors:f,messages:b,isEncrypted:j,preContent:y,extraContent:w,align:v,justify:$})=>{const{size:C}=ir(),{editions:{isAtLeast:F}}=I,N=t!==oe.Express&&!F(t||oe.Express);return e.jsxs(ls,{className:E(!!f&&"errors",p&&"disabled",C&&`size-${C}`,N&&"upsell"),"data-upsell":u("Upgrade to {edition} to unlock this setting.",{edition:dc(t)}),$width:d,children:[e.jsxs(Gx,{children:[y!==void 0&&e.jsx(va,{children:y}),e.jsxs(Yx,{children:[e.jsx(wd,{label:n,handle:s,required:i,translatable:r,hasTranslation:a,isEncrypted:j,removeTranslation:c}),e.jsx(cs,{instructions:o})]}),w!==void 0&&e.jsx(va,{children:w})]}),e.jsx(sr,{className:E(v&&`align-${v}`,$&&`justify-${$}`),children:x}),e.jsx(ti,{errors:f}),e.jsx(Xx,{messages:b})]})},W=({children:t,property:n,label:s,handle:i,required:o,instructions:r,width:a,disabled:c,errors:d,context:p,preContent:x,align:f,justify:b})=>{const{hasTranslation:j,removeTranslation:y,isTranslationsEnabled:w}=Ce(p),{edition:v,translatable:$,messages:C}=n||{};return e.jsx(Te,{edition:v,label:n?.label||s,handle:n?.handle||i,required:n?.required||o,instructions:n?.instructions||r,width:n?.width||a,disabled:n?.disabled||c,errors:d,messages:C,translatable:w&&$,hasTranslation:j(i),isEncrypted:n?.flags?.includes("encrypted"),removeTranslation:()=>y(i),preContent:x,align:f,justify:b,children:t})},Si=new Map([["en",ua],["en-US",ua]]),wa={nl:async()=>(await Rn(async()=>{const{nl:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.a9);return{nl:t}},[],import.meta.url)).nl,de:async()=>(await Rn(async()=>{const{de:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.aa);return{de:t}},[],import.meta.url)).de,fr:async()=>(await Rn(async()=>{const{fr:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.ab);return{fr:t}},[],import.meta.url)).fr,it:async()=>(await Rn(async()=>{const{it:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.ac);return{it:t}},[],import.meta.url)).it},e2=t=>{const n=String(t??"").trim().replace("_","-");if(!n)return"en-US";const[s,i]=n.split("-");return i?`${s.toLowerCase()}-${i.toUpperCase()}`:s.toLowerCase()};async function t2(t){const n=e2(t),s=n.includes("-")?[n,n.split("-")[0]]:[n],i=r=>r==="en"?["en-US"]:[r];for(const r of s.flatMap(i)){const a=Si.get(r);if(a)return a;const c=wa[r];if(!c)continue;const d=await c();return Si.set(r,d),d}const o=await wa["en-US"]();return Si.set("en-US",o),o}const n2=l.div`
  position: relative;

  .react-datepicker__navigation-icon {
    top: 4px;
  }
`;l.div`
  position: absolute;
  left: 150px;
  top: 5px;

  z-index: 2;

  font-size: 16px;
  color: ${h.gray400};

  user-select: none;
  pointer-events: none;
`;const s2="yyyy-MM-dd",{metadata:{craft:{locale:i2}}}=I,so=({value:t,property:n,errors:s,updateValue:i})=>{const{dateFormat:o,minDate:r,maxDate:a}=n,c=o||s2,d=r?Qn(r):void 0,p=a?Qn(a):void 0,x=t?Qn(t):void 0,[f,b]=g.useState(void 0);return g.useEffect(()=>{t2(i2).then(b).catch(()=>b(void 0))},[]),e.jsx(W,{property:n,errors:s,children:e.jsx(n2,{children:e.jsx(v1,{locale:f,id:n.handle,minDate:d,maxDate:p,selected:x,dateFormat:c,className:E("text","fullwidth"),onChange:j=>i(j?s0(j):null)})})})},o2=()=>e.jsxs(r2,{className:"notice has-icon",children:[e.jsx("span",{className:"icon","aria-hidden":"true"}),e.jsx("span",{className:"visually-hidden",children:"Tip: "}),e.jsxs("span",{children:[u("This can begin with an environment variable.")," ",e.jsx("a",{href:"https://craftcms.com/docs/5.x/configure.html#control-panel-settings",className:"go",target:"_blank",rel:"noopener noreferrer",children:u("Learn more")})]})]}),r2=l.p`
  margin-top: 5px;
`,a2=(t,n)=>g.useMemo(()=>!t||t.length===0?[]:n?t.map(i=>{const o=i.data.filter(r=>n?r.name.toLowerCase().includes(n.toLowerCase()):!0);return{...i,data:o}}).filter(i=>i.data.length>0):t,[t,n]),l2=t=>{const[n,s]=g.useState(!1);return g.useEffect(()=>{const i=t?.current;if(!i)return;const o=()=>s(!0),r=()=>{setTimeout(()=>{s(!1)},200)};return i.addEventListener("focus",o),i.addEventListener("blur",r),()=>{i.removeEventListener("focus",o),i.removeEventListener("blur",r)}},[t?.current]),n},c2=l.ul`
  position: absolute;
  z-index: 2;

  width: 100%;
  max-height: 300px;
  overflow-y: auto;

  padding: 0;
  margin: 0;

  background-color: ${h.white};
  border-radius: ${S.lg};
  box-shadow: ${re.autosuggest};

  ${Q};
`,d2=l.li`
  padding-top: 8px;
`,u2=l.div`
  margin: 14px 0 3px;
  padding: 0 14px;

  color: ${h.gray400};
  font-size: 11px;
  line-height: 1.2;
  text-transform: uppercase;
`,p2=l.ul``,kd=l.span`
  display: inline-block;
  width: 8px;
  height: 1px;
  background-color: ${h.gray400};
`,Sd=l.span`
  flex: 0 0 auto;
  color: ${h.gray700};
`,Ld=l.span`
  flex: 0 1 auto;
  color: ${h.gray400};
`,h2=l.li`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 14px;

  overflow-x: hidden;

  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: ${h.gray500};

    ${Sd}, ${Ld} {
      color: ${h.white};
    }

    ${kd} {
      background-color: ${h.white};
    }
  }
`,x2=({inputRef:t,filter:n,suggestions:s,update:i})=>{const o=l2(t),r=a2(s,n);return!r.length||!o?null:e.jsx(c2,{children:r.map(a=>e.jsxs(d2,{children:[e.jsx(u2,{children:a.label}),e.jsx(p2,{children:a.data.map(({name:c,hint:d})=>e.jsxs(h2,{onClick:()=>i(c),children:[e.jsx(Sd,{children:c}),!!d&&e.jsxs(e.Fragment,{children:[e.jsx(kd,{}),e.jsx(Ld,{children:d})]})]},c))})]},a.label))})},Dt=({value:t,property:n,errors:s,updateValue:i,autoFocus:o,context:r})=>{const{handle:a}=n,c=g.useRef(null);g.useEffect(()=>{o&&c.current?.focus({preventScroll:!0})},[o]);const d=n.flags?.includes("code"),p=n.flags?.includes("readonly")||n.flags?.includes("as-readonly-in-instance"),x=n.flags?.includes("env-suggest"),{data:f}=B({queryKey:["autosuggest","env"],queryFn:()=>T.get("/api/autosuggest/env").then(b=>b.data),enabled:x,staleTime:1/0,gcTime:1/0});return e.jsxs(W,{property:n,errors:s,context:r,children:[e.jsx("input",{id:a,ref:c,type:"text",autoComplete:"off","data-1p-ignore":!0,readOnly:p,className:E("text","fullwidth",d&&"code",p&&"readonly"),value:t??"",placeholder:n.placeholder,onChange:b=>i(b.target.value)}),x&&!!f&&e.jsxs(e.Fragment,{children:[e.jsx(x2,{inputRef:c,filter:t,suggestions:f,update:b=>i(b)}),e.jsx(o2,{})]})]})},m2=l.textarea`
  &.read-only {
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);

    user-select: none;
  }
`,ds=ie.forwardRef(({value:t,property:n,errors:s,updateValue:i,autoFocus:o,focus:r,context:a},c)=>{const{handle:d,rows:p}=n,x=g.useRef(null);return g.useImperativeHandle(c,()=>x.current),g.useEffect(()=>{r&&x.current?.focus()},[r]),e.jsx(W,{property:n,errors:s,context:a,children:e.jsx(m2,{id:d,ref:x,className:E("text","fullwidth",n.flags?.includes("as-readonly-in-instance")&&"read-only",n.flags?.includes("code")&&"code"),readOnly:n.flags?.includes("as-readonly-in-instance"),rows:p,value:t??"",placeholder:n.placeholder,autoFocus:o,onChange:f=>i(f.target.value)})})});ds.displayName="Textarea";const us={tension:300},g2=(t,n)=>Y({width:t?20:0,opacity:t?1:0,immediate:n,config:us}),f2=(t,n,s)=>Y({width:t?s?30:15:0,opacity:t?1:0,immediate:n,config:us}),b2=(t,n,s,i)=>Y({width:t&&n?s.loading.width:s.original.width,height:s.original.height,immediate:i,config:us}),j2=(t,n,s)=>Y({opacity:t&&n?0:1,transform:t&&n?"translateY(-30px)":"translateY(0px)",immediate:s,cancel:!n,config:us}),y2=(t,n)=>Y({opacity:t?1:0,transform:t?"translateY(0px)":"translateY(30px)",immediate:n,config:us}),v2=l.span`
  display: flex;

  svg {
    fill: currentColor;
  }
`,w2=l(_.span)`
  position: relative;

  overflow: hidden;
  transform-origin: center center;
`,Fd=l(_.span)`
  position: absolute;
  left: 0;
  top: 0;

  opacity: 0;
  white-space: nowrap;
`,$2=l(Fd)`
  transform: translateY(0px);
  opacity: 1;
`,C2=l(Fd)``,k2=l(_.span)`
  overflow: hidden;
  transform-origin: center right;

  align-self: center;
  width: 20px;
  height: 16px;

  svg {
    width: 16px;
    height: 16px;
  }
`,S2=l(_.span)`
  white-space: nowrap;
  overflow: hidden;
  transform-origin: center left;
`,L2=Uo`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`,Li=l.span`
  animation-name: ${L2};
  animation-duration: 1.5s;
  animation-iteration-count: infinite;

  &:nth-child(2) {
    animation-delay: 0.3s;
  }

  &:nth-child(3) {
    animation-delay: 0.6s;
  }

  &:nth-child(4) {
    animation-delay: 0.9s;
  }

  &:after {
    content: '.';
  }
`,J=({children:t,loadingText:n,loading:s,spinner:i,instant:o,xl:r,...a})=>{const c=ie.useRef(null),d=ie.useRef(null),[p,x]=g.useState({original:{width:void 0,height:void 0},loading:{width:void 0}});g.useEffect(()=>{if(!c.current)return;const v=c.current.offsetWidth,$=c.current.offsetHeight,C=d.current?.offsetWidth||v;x({original:{width:v,height:$},loading:{width:C}})},[c.current,t,n]);const f=g2(s,o),b=f2(s,o,r),j=j2(s,n,o),y=y2(s,o),w=b2(s,n,p,o);return e.jsxs(v2,{...a,children:[i&&e.jsx(k2,{style:f,children:e.jsx(er,{})}),e.jsxs(w2,{style:w,children:[!!n&&e.jsx(C2,{ref:d,style:y,children:n}),e.jsx($2,{ref:c,style:j,children:t})]}),e.jsxs(S2,{style:b,children:[e.jsx(Li,{}),e.jsx(Li,{}),e.jsx(Li,{})]})]})},ni={base:["ab-tests"],dashboard:()=>[...ni.base,"dashboard"]},F2=()=>{const t=Oh(),{data:n}=B({queryKey:ni.dashboard(),queryFn:()=>T.get("/api/ab-tests/dashboard").then(i=>i.data)});return g.useMemo(()=>n?.map(i=>({...i,variants:i.variants.map(o=>({...o,formColor:o.formColor||t[o.formId]||null}))}))||[],[n,t])},E2=t=>{const n=X();return le({mutationFn:s=>{const i={...s};return t?T.post(`/api/ab-tests/${t}`,i).then(o=>o.data):T.post("/api/ab-tests",i).then(o=>o.data)},onSuccess:()=>{n.invalidateQueries({queryKey:ni.base})}})},T2=()=>{const t=X();return le({mutationFn:n=>T.post(`/api/ab-tests/${n}/delete`).then(s=>s.data),onSuccess:()=>{t.invalidateQueries({queryKey:ni.base})}})},N2=t=>({id:t?.id,name:t?.name||"",handle:t?.handle||"",description:t?.description||"",startDate:t?.startDate||null,endDate:t?.endDate||null,variants:t?.variants||[]}),z2=({closeModal:t,data:n})=>{const s=n?.test,[i,o]=g.useState(N2(s)),[r,a]=g.useState(!!s?.handle&&s.handle!==ki(s.name)),{data:c}=ei(),d=E2(s?.id),p=g.useMemo(()=>(c||[]).map(f=>({id:f.id,name:f.name})),[c]),x=i.name.trim().length>0&&i.handle?.trim().length>0&&i.variants.length>0&&i.variants.every(f=>!!f.formId);return e.jsxs(ve,{style:{maxWidth:"860px"},children:[e.jsx(we,{children:e.jsx("h1",{children:s?.id?u("Edit A/B Test"):u("Create A/B Test")})}),e.jsxs(ed,{children:[e.jsx(Dt,{value:i.name,updateValue:f=>{o(b=>({...b,name:f,handle:r?b.handle:ki(f)}))},property:{type:K.String,handle:"name",label:u("Name")}}),e.jsx(Dt,{value:i.handle||"",updateValue:f=>{a(!0),o(b=>({...b,handle:ki(f)}))},property:{type:K.String,handle:"handle",label:u("Handle")}}),e.jsx(ds,{value:i.description||"",updateValue:f=>o(b=>({...b,description:f})),property:{type:K.Textarea,handle:"description",label:u("Description"),rows:3}}),e.jsxs(Cx,{children:[e.jsx(so,{value:i.startDate||null,updateValue:f=>o(b=>({...b,startDate:f})),property:{type:K.DateTime,handle:"startDate",label:u("Start Date"),dateFormat:"yyyy-MM-dd"}}),e.jsx(so,{value:i.endDate||null,updateValue:f=>o(b=>({...b,endDate:f})),property:{type:K.DateTime,handle:"endDate",label:u("End Date"),dateFormat:"yyyy-MM-dd"}})]}),e.jsx(W,{label:"Variants",children:e.jsxs("div",{children:[e.jsxs("table",{className:"table editable fullwidth",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Form")}),e.jsx("th",{children:u("Weight")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:i.variants.map((f,b)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(de,{emptyOption:"Select form...",value:f.formId?.toString()||"",onChange:j=>{const y=Number(j);o(w=>({...w,variants:w.variants.map((v,$)=>$===b?{...v,formId:y}:v)}))},options:p.map(j=>({label:j.name,value:j.id.toString()}))})}),e.jsx("td",{className:"singleline-cell textual thin weight",children:e.jsx("input",{className:"text fullwidth",type:"number",min:0,value:f.weight,onChange:j=>{const y=Number(j.target.value);o(w=>({...w,variants:w.variants.map((v,$)=>$===b?{...v,weight:y}:v)}))}})}),e.jsx("td",{className:"thin action",children:e.jsx("button",{type:"button",title:u("Delete"),className:"delete icon",onClick:()=>o(j=>({...j,variants:j.variants.filter((y,w)=>w!==b)}))})})]},f.id||b))})]}),e.jsx("button",{type:"button",className:"btn dashed add icon",onClick:()=>o(f=>({...f,variants:[...f.variants,{id:G(),formId:void 0,weight:50}]})),children:u("Add Variant")})]})})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",disabled:!x,children:e.jsx(J,{loading:d.isPending,loadingText:u("Saving..."),spinner:!0,onClick:()=>d.mutate(i,{onSuccess:()=>{Xe.success(u("A/B Test Group saved successfully.")),t()}}),children:u("Save")})})]})]})},M2=({data:t,closeModal:n})=>{const s=T2();return e.jsxs(ve,{style:{maxWidth:"560px"},children:[e.jsx(we,{children:e.jsx("h1",{children:u("Delete A/B Test")})}),e.jsx(ed,{style:{minHeight:0},children:e.jsx("p",{children:u('Are you sure you want to delete "{name}"? This action cannot be undone.',{name:t?.name||""})})}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(J,{loading:s.isPending,loadingText:u("Deleting..."),spinner:!0,onClick:()=>s.mutate(t?.id,{onSuccess:()=>{Xe.success(u("A/B Test Group deleted successfully.")),n()}}),children:u("Delete")})})]})]})},I2=()=>{Ln("ab-tests");const{openModal:t}=qe(),[n]=Ho(),s=F2(),[i,o]=g.useState({}),r=g.useRef(null),a=g.useCallback(c=>{t(z2,c?{test:sx(c)}:{})},[t]);return g.useEffect(()=>{const c=n.get("edit");if(!c||!s||r.current===c)return;const d=s.find(p=>p.id===Number(c));d&&(r.current=c,a(d))},[n,s,a]),e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"ab-tests-list",label:"A/B Tests",url:"/ab-tests"}),e.jsxs(rx,{children:[e.jsx(Sn,{children:u("A/B Tests")}),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:()=>a(),children:u("Add Test")})]}),e.jsxs(ox,{children:[!s?.length&&e.jsx($x,{children:u("No A/B Tests found. Create your first test.")}),e.jsx(ax,{children:s?.map(c=>{const d=i[c.id]||"conversionRate",p=c.startDate&&i0(c.startDate),x=c.endDate&&fc(c.endDate);let f="active";p?f="scheduled":x&&(f="ended");const b=u(f.at(0)?.toUpperCase()+f.slice(1)||""),{totalImpressions:j,totalInteractions:y,totalFailures:w,totalConversions:v}=c,$=[e.jsx(ux,{$status:f},"status"),u(b),!p&&u("{days} days",{days:c.days}),u("{count} variants",{count:c.variantCount}),u("{count} impressions",{count:j}),u("{count} interactions",{count:y}),u("{failures} failures",{failures:w}),u("{conversions} conversions",{conversions:v})].filter(Boolean);return e.jsxs(lx,{children:[e.jsxs(cx,{children:[e.jsxs("div",{children:[e.jsx("h2",{children:c.name}),!!c.description&&e.jsx("p",{children:c.description}),e.jsx(dx,{children:$.map((C,F)=>e.jsx("span",{children:C},F))})]}),e.jsx(tx,{onDelete:()=>t(M2,{id:c.id,name:c.name}),onEdit:()=>a(c)})]}),e.jsx(Sx,{test:c,activeTab:d,setTab:(C,F)=>{o(N=>({...N,[C.id]:F}))}}),e.jsx(mx,{children:c.variants.map(C=>e.jsx(kx,{variant:C,test:c},C.id))})]},c.id)})})]})]})},A2=l.div`
  font-size: 10rem;
  margin: 0 0 1.5rem;

  svg {
    min-width: 160px;
    min-height: 160px;
  }

  &.fade {
    svg {
      fill: #a1a5aa;
      opacity: 0.5;
    }
  }
`,R2=l.h2`
  margin: 0;
  padding: 0;

  font-size: 1.5rem;
  color: ${h.gray500};
`,P2=l.h2`
  margin: 0;
  padding: 0;

  font-size: 1.2rem;
  font-weight: normal;
  color: ${h.gray500};
`,D2=l.p`
  margin: 0;
  padding: 0;

  font-size: 1rem;
  color: ${h.gray300};

  &:not(:last-child) {
    padding-bottom: 1.5rem;
  }
`,$a=l.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;

  height: 100%;

  &.padded {
    padding: 3rem 1rem;
  }
`,at=({title:t,subtitle:n,icon:s,iconFade:i,lite:o,children:r})=>o?e.jsx($a,{className:"padded",children:e.jsx(P2,{children:t})}):e.jsxs($a,{children:[s&&e.jsx(A2,{className:E(i&&"fade"),children:s}),t&&e.jsx(R2,{children:t}),n&&e.jsx(D2,{children:n}),r]}),ps=t=>e.jsxs(R,{height:"1em",viewBox:"0 0 512 512",...t,children:[e.jsx("defs",{children:e.jsx("style",{children:".fa-secondary{opacity:0.2;fill:#a1a5aa;}.fa-primary{fill:#a6a8ab;}"})}),e.jsx("path",{className:"fa-primary",d:"M274.6 144.2c8.7 1.5 14.6 9.7 13.2 18.4l-32 192c-1.5 8.7-9.7 14.6-18.4 13.2s-14.6-9.7-13.2-18.4l32-192c1.5-8.7 9.7-14.6 18.4-13.2zm-87.3 60.5c6.2 6.2 6.2 16.4 0 22.6L158.6 256l28.7 28.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6l40-40c6.2-6.2 16.4-6.2 22.6 0zm137.4 0c6.2-6.2 16.4-6.2 22.6 0l40 40c6.2 6.2 6.2 16.4 0 22.6l-40 40c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L353.4 256l-28.7-28.7c-6.2-6.2-6.2-16.4 0-22.6z"}),e.jsx("path",{className:"fa-secondary",d:"M305.4 21.8c-1.3-10.4-9.1-18.8-19.5-20C276.1 .6 266.1 0 256 0c-11.1 0-22.1 .7-32.8 2.1c-10.3 1.3-18 9.7-19.3 20l-2.9 23.1c-.8 6.4-5.4 11.6-11.5 13.7c-9.6 3.2-19 7.2-27.9 11.7c-5.8 3-12.8 2.5-18-1.5l-18-14c-8.2-6.4-19.7-6.8-27.9-.4c-16.6 13-31.5 28-44.4 44.7c-6.3 8.2-5.9 19.6 .5 27.8l14.2 18.3c4 5.1 4.4 12 1.5 17.8c-4.4 8.8-8.2 17.9-11.3 27.4c-2 6.2-7.3 10.8-13.7 11.6l-22.8 2.9c-10.3 1.3-18.7 9.1-20 19.4C.7 234.8 0 245.3 0 256c0 10.6 .6 21.1 1.9 31.4c1.3 10.3 9.7 18.1 20 19.4l22.8 2.9c6.4 .8 11.7 5.4 13.7 11.6c3.1 9.5 6.9 18.7 11.3 27.5c2.9 5.8 2.4 12.7-1.5 17.8L54 384.8c-6.4 8.2-6.8 19.6-.5 27.8c12.9 16.7 27.8 31.7 44.4 44.7c8.2 6.4 19.7 6 27.9-.4l18-14c5.1-4 12.2-4.4 18-1.5c9 4.6 18.3 8.5 27.9 11.7c6.1 2.1 10.7 7.3 11.5 13.7l2.9 23.1c1.3 10.3 9 18.7 19.3 20c10.7 1.4 21.7 2.1 32.8 2.1c10.1 0 20.1-.6 29.9-1.7c10.4-1.2 18.2-9.7 19.5-20l2.8-22.5c.8-6.5 5.5-11.8 11.7-13.8c10-3.2 19.7-7.2 29-11.8c5.8-2.9 12.7-2.4 17.8 1.5L385 457.9c8.2 6.4 19.6 6.8 27.8 .5c2.8-2.2 5.5-4.4 8.2-6.7L451.7 421c1.8-2.2 3.6-4.4 5.4-6.6c6.5-8.2 6-19.7-.4-27.9l-14-17.9c-4-5.1-4.4-12.2-1.5-18c4.8-9.4 9-19.3 12.3-29.5c2-6.2 7.3-10.8 13.7-11.6l22.8-2.8c10.3-1.3 18.8-9.1 20-19.4c.2-1.7 .4-3.5 .6-5.2V230.1c-.2-1.7-.4-3.5-.6-5.2c-1.3-10.3-9.7-18.1-20-19.4l-22.8-2.8c-6.4-.8-11.7-5.4-13.7-11.6c-3.4-10.2-7.5-20.1-12.3-29.5c-3-5.8-2.5-12.8 1.5-18l14-17.9c6.4-8.2 6.8-19.7 .4-27.9c-1.8-2.2-3.6-4.4-5.4-6.6L421 60.3c-2.7-2.3-5.4-4.5-8.2-6.7c-8.2-6.4-19.6-5.9-27.8 .5L366.7 68.3c-5.1 4-12.1 4.4-17.8 1.5c-9.3-4.6-19-8.6-29-11.8c-6.2-2-10.9-7.3-11.7-13.7l-2.8-22.5zM287.8 162.6l-32 192c-1.5 8.7-9.7 14.6-18.4 13.2s-14.6-9.7-13.2-18.4l32-192c1.5-8.7 9.7-14.6 18.4-13.2s14.6 9.7 13.2 18.4zM187.3 227.3L158.6 256l28.7 28.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6l40-40c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6zm160-22.6l40 40c6.2 6.2 6.2 16.4 0 22.6l-40 40c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L353.4 256l-28.7-28.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0z"})]}),B2=new Set(["limited-users","ai"]),or=({activeKey:t})=>{const{data:n,isFetching:s}=B({queryKey:["settings","navigation"],queryFn:()=>T.get("/api/settings/navigation").then(i=>i.data)});return!n&&s?e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",children:e.jsx("nav",{children:e.jsx("ul",{children:Array.from({length:10}).map((i,o)=>e.jsx("li",{children:e.jsx(k,{width:140,height:10})},o))})})})}):e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",children:e.jsx("nav",{children:e.jsx("ul",{children:Object.entries(n).map(([i,o])=>{if(o.title){const r=i===t,a=B2.has(i);return e.jsx("li",{children:a?e.jsx(rt,{className:r?"sel":void 0,to:`/settings/${i}`,dangerouslySetInnerHTML:{__html:O.sanitize(o.title)}}):e.jsx("a",{className:r?"sel":void 0,href:me(`settings/${i}`),dangerouslySetInnerHTML:{__html:O.sanitize(o.title)}})},i)}return o.heading?e.jsx("li",{className:"heading",children:e.jsx("span",{children:o.heading})},i):null})})})})})},O2=({activeKey:t,children:n})=>e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx(or,{activeKey:t}),e.jsx("div",{id:"content-container",className:E(!I.metadata.craft.is5&&"craft-4"),children:e.jsx("div",{id:"content",className:"content-pane",children:n})})]}),Ca=l.div`
  padding: 0;
`,_2=l.div.attrs(()=>({className:"tablepane"}))``,Ed=l.div`
  padding: 80px ${m.lg} 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`,ka=l.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${m.md};
  margin-bottom: ${m.xl};
`,Un=l.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: ${m.xl} ${m.lg};
`,$s=l.div`
  font-size: 14px;
  margin-bottom: ${m.xs};
`,Vn=l.div`
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
`,W2=l(Vn)`
  font-size: 14px;
`,U2=l(W2)`
  font-size: 15px;
  color: ${({$color:t})=>t||"inherit"};
  font-weight: 600;
`,H2=l.div`
  display: inline-flex;
  align-items: center;
  gap: ${m.xs};
`,q2=l.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${({$color:t})=>t||h.gray400};
  flex: 0 0 12px;
`,Q2=l.div`
  margin-top: ${m.xs};
  font-size: 14px;
  color: ${h.gray500};
  font-style: italic;
`,K2=l(Un)`
  text-align: center;
  grid-column: span 2;
  padding: ${m.xl};
  border: 1px solid ${h.gray100};
  border-radius: ${S.lg};
  background: ${h.gray050};
`,V2=l(Vn)`
  font-size: 40px;
  line-height: 1.05;
  margin: 0 0 ${m.xs};
`,G2=l.div`
  margin-top: ${m.sm};
`,Sa=l.section`
  margin-bottom: ${m.xl};

  &:last-child {
    margin-bottom: 0;
  }
`,Td=l.p`
  font-size: 14px;
  font-weight: 400;
  color: #5c6672;
  margin: 0 0 ${m.md};
  padding: 0;
`,io=l.h2`
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 ${m.xs};
  padding: 0;
`,Y2=l.div`
  background: ${h.white};
  border: none;
  border-radius: ${S.md};
  padding: ${m.md};
  box-shadow: none;
  overflow-x: auto;
`,oo=l.table`
  width: 100%;
  border-collapse: collapse;
  background: ${h.white};
  border-radius: ${S.md};
  overflow: hidden;
  font-size: 12px;
`,ro=l.thead`
  background: #cfd8e3;
`,Ge=l.th`
  text-align: left;
  padding: ${m.sm};
  font-weight: 600;
  border-bottom: 0;
`,ao=l.tr`
  &:nth-child(even) {
    background: #f4f7fc;
  }
`,Ye=l.td`
  padding: ${m.sm};
  border-bottom: 0;
  white-space: nowrap;
`;l.div`
  text-align: center;
  padding: ${m.xl} ${m.lg};
  background: ${h.white};
  border: 0;
  border-radius: ${S.md};
  color: rgba(0, 0, 0, 0.6);
`;l.p`
  font-weight: 600;
  margin: 0 0 ${m.sm};
  color: rgba(0, 0, 0, 0.8);
`;l.p`
  margin-top: ${m.md};
`;const qs={all:["ai"],usage:()=>[...qs.all,"usage"],plans:t=>[...qs.all,"plans",t??""]};function J2(){return T.get(me("api/ai/usage")).then(t=>t.data)}function Z2(t){return T.get(me("api/ai/plans"),{params:void 0}).then(s=>s.data)}function X2(t,n,s,i){return T.post(me("api/ai/create-checkout-session"),{success_url:t,cancel_url:n,...s&&{bundle_key:s},...i&&{currency:i}}).then(o=>o.data)}function Nd(t){return B({queryKey:qs.usage(),queryFn:J2,enabled:t?.enabled??!0,retry:(n,s)=>T.isAxiosError(s)&&(s.response?.status===404||s.response?.status===403)?!1:n<2})}function em(t){return B({queryKey:qs.plans(t),queryFn:()=>Z2(),retry:(n,s)=>T.isAxiosError(s)&&(s.response?.status===404||s.response?.status===403)?!1:n<2})}const lo=t=>{if(!t)return"—";try{const n=Qn(t);return Number.isNaN(n.getTime())?t:bc(n,"PP")}catch{return t}},La=l.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: ${m.lg};
`,Fa=l.div`
  border: 1px solid ${h.gray100};
  border-radius: ${S.md};
  padding: calc(${m.xl} + ${m.xs}) ${m.lg};
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  align-items: center;
`,Fi=l.div`
  margin-top: ${m.sm};
`,tm=l(ve)`
  width: min(1320px, calc(100vw - ${m.xl}));
  max-width: min(1320px, calc(100vw - ${m.xl}));
`,nm=l.div`
  padding: ${m.lg} ${m.xl};
`,sm=l.strong`
  display: inline-flex;
  align-self: center;
  justify-content: center;
  padding: ${m.xs} ${m.sm};
  border: 1px solid ${h.gray300};
  border-radius: ${S.md};
  background: ${h.white};
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 0.02em;
  text-align: center;
`,im=l.p`
  margin: ${m.xs} 0 ${m.sm};
  min-height: 40px;
  color: ${h.gray500};
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  max-width: 160px;
`,om=l.div`
  margin-top: auto;
  display: grid;
  gap: ${m.md};
  justify-items: center;
  padding-top: ${m.xs};
`,rm=l.div`
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
`,am=l.div`
  font-size: 17px;
  color: ${h.gray500};
  text-align: center;
`,lm=l.span`
  font-size: 19px;
  font-weight: 700;
`,cm=l.div`
  display: flex;
  justify-content: stretch;
  width: 100%;
  margin-top: ${m.md};
`,dm=l.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${m.sm} ${m.md};
  background: ${h.blue500};
  border: 1px solid ${h.blue600};
  color: ${h.white};
  border-radius: ${S.md};
  font-weight: 600;
  max-width: 160px;
  margin: 0 auto;

  &:hover:not(:disabled) {
    background: ${h.blue600};
  }
`,um=l.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${m.md};

  h1 {
    margin: 0;
    line-height: 1.2;
  }
`,pm=l.div`
  margin-top: ${m.xl};
  padding-top: ${m.lg};
  border-top: 1px solid ${h.gray100};
`,Ea=l.p`
  margin: ${m.sm} 0 0;
  color: ${h.gray500};
  font-size: 14px;
`;function zd(t,n,s){const i=I.metadata?.craft?.locale,o=(s||n||"usd").toLowerCase(),r=i?t.toLocaleString(i,{maximumFractionDigits:0,minimumFractionDigits:0}):t.toLocaleString();return o==="eur"?`€${r}`:o==="usd"?`$${r}`:`${r} ${o.toUpperCase()}`}const hm=5,xm=2;function mm(t){return[...t??[]].sort((s,i)=>{const o=s.paid_at?Date.parse(s.paid_at):0;return(i.paid_at?Date.parse(i.paid_at):0)-o})}function gm(t,n){const s=t.package_price,i=typeof s=="number"?s:typeof s=="string"?parseFloat(s):NaN;return s==null||Number.isNaN(i)?"—":zd(Math.round(i),n,n)}function fm(t){const n=t.credits;if(n==null)return"—";const s=typeof n=="number"?n:Number(n);return Number.isNaN(s)?"—":Number.isInteger(s)?String(s):s.toLocaleString()}const bm=({closeModal:t})=>{const{data:n,isFetching:s}=em(),{data:i,isPending:o,isFetching:r,isError:a}=Nd(),c=s&&!n,d=c||!a&&(o||r&&i===void 0),p=ie.useMemo(()=>mm(i?.payment_history).slice(0,hm),[i?.payment_history]),[x,f]=ie.useState(null),b=n?.currency??"usd";return e.jsxs(tm,{children:[e.jsx(we,{children:e.jsx(um,{children:e.jsx("h1",{children:u("Purchase SolspaceAI Credits")})})}),e.jsxs(nm,{children:[c?e.jsx(Fi,{children:e.jsx(La,{children:Array.from({length:5}).map((j,y)=>e.jsxs(Fa,{children:[e.jsx("strong",{children:e.jsx(k,{width:110,height:14})}),e.jsx("p",{children:e.jsx(k,{count:2})}),e.jsx("div",{children:e.jsx(k,{width:90,height:12})}),e.jsx("div",{children:e.jsx(k,{width:120,height:12})}),e.jsx("div",{children:e.jsx(k,{width:110,height:32})})]},y))})}):e.jsx(Fi,{children:e.jsx(La,{children:(n?.bundles??[]).map(j=>e.jsxs(Fa,{children:[e.jsx(sm,{children:(j.name||"").trim()||u("Credit plan")}),e.jsx(im,{children:(j.description||"").trim()||u("Credit package for SolspaceAI usage.")}),e.jsxs(om,{children:[e.jsx(rm,{children:zd(j.price,j.currency,n?.currency)}),e.jsxs(am,{children:[e.jsx(lm,{children:j.credits.toLocaleString()})," ",u("credits")]})]}),e.jsx(cm,{children:e.jsx(dm,{type:"button",disabled:x===j.key,onClick:async()=>{try{f(j.key);const y=window.location.href,w=await X2(y,y,j.key,n?.currency);w?.url&&(window.location.href=w.url)}finally{f(null)}},children:x===j.key?u("Loading..."):u("Buy now")})})]},j.key))})}),e.jsx(Fi,{children:e.jsxs(pm,{children:[e.jsx(io,{children:u("Recent Payments")}),e.jsx(Td,{children:u("Your recent SolspaceAI credit purchase history.")}),d?e.jsxs(oo,{children:[e.jsx(ro,{children:e.jsxs("tr",{children:[e.jsx(Ge,{children:u("Date")}),e.jsx(Ge,{children:u("Amount")}),e.jsx(Ge,{children:u("Credits")})]})}),e.jsx("tbody",{children:Array.from({length:xm}).map((j,y)=>e.jsxs(ao,{children:[e.jsx(Ye,{children:e.jsx(k,{width:100,height:12})}),e.jsx(Ye,{children:e.jsx(k,{width:72,height:12})}),e.jsx(Ye,{children:e.jsx(k,{width:56,height:12})})]},`pay-skel-${y}`))})]}):a?e.jsx(Ea,{children:u("Unable to load payment history.")}):p.length===0?e.jsx(Ea,{children:u("No purchases yet.")}):e.jsxs(oo,{children:[e.jsx(ro,{children:e.jsxs("tr",{children:[e.jsx(Ge,{children:u("Date")}),e.jsx(Ge,{children:u("Amount")}),e.jsx(Ge,{children:u("Credits")})]})}),e.jsx("tbody",{children:p.map((j,y)=>e.jsxs(ao,{children:[e.jsx(Ye,{children:lo(j.paid_at)}),e.jsx(Ye,{children:gm(j,b)}),e.jsx(Ye,{children:fm(j)})]},j.paid_at?`${j.paid_at}-${y}`:`payment-${y}`))})]})]})})]}),e.jsx($e,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Close")})})]})},jm=ie.lazy(()=>Rn(()=>import("./ai.usage-chart-BpGFh6jz.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)),Ta="/integrations/ai/SolspaceAIV1",Cs=({title:t,subtitle:n,iconFade:s,children:i})=>e.jsx(_2,{children:e.jsx(Ed,{children:e.jsx(at,{title:t,subtitle:n,icon:e.jsx(ps,{}),iconFade:s,children:i})})}),ym=()=>{const{openModal:t}=qe();Ln("freeform/settings");const n=I.editions.is(oe.Pro),{data:s,isFetching:i,error:o,isError:r}=Nd({enabled:n}),a=r&&T.isAxiosError(o)&&o.response?.status===404,c=r&&T.isAxiosError(o)&&o.response?.status===403,d=a||c,p=s??void 0,x=p!=null,f=ie.useMemo(()=>{const C=(p?.payment_history??[]).map(F=>F?.paid_at).filter(F=>typeof F=="string"&&!!F);return C.length?C.sort((F,N)=>N.localeCompare(F))[0]:null},[p?.payment_history]),b=ie.useMemo(()=>{const $=p?.credit_status;if(!$)return u("Unknown");switch($){case"Free trial":case"Active":case"Low credits":case"Out of credits":return u($);default:return $}},[p]),j=!a&&!c&&i&&!p,y=!a&&!c&&!j&&!r,w=r&&T.isAxiosError(o)&&o.response?.data?.message?o.response.data.message:r&&o instanceof Error?o.message:null,v=$=>e.jsxs("div",{children:[e.jsx(q,{id:"settings",label:u("Settings"),url:".",external:!0}),e.jsx(q,{id:"solspace-ai",label:u("SolspaceAI"),url:"settings/ai"}),e.jsx(Sn,{children:u("SolspaceAI")}),e.jsx(O2,{activeKey:"ai",children:$})]});return v(n?e.jsxs(e.Fragment,{children:[r&&!d&&e.jsx(Cs,{title:u("Error loading usage"),subtitle:w??u("Failed to load usage data"),iconFade:!0}),a&&e.jsx(Cs,{title:u("SolspaceAI is not enabled"),subtitle:u("Enable SolspaceAI in the Integrations area to view usage."),iconFade:!0,children:e.jsx(rt,{to:Ta,className:"btn submit",children:u("Enable SolspaceAI")})}),c&&e.jsx(Cs,{title:u("Authorize SolspaceAI to view usage"),subtitle:u("Authorize SolspaceAI in the Integrations area (click Authorize on the SolspaceAI integration) to view usage."),iconFade:!0,children:e.jsx(rt,{to:Ta,className:"btn submit",children:u("Go to Integrations")})}),j&&e.jsxs(Ca,{children:[e.jsxs(ka,{children:[e.jsxs(Un,{children:[e.jsx($s,{children:e.jsx(k,{width:80,height:10})}),e.jsx(Vn,{children:e.jsx(k,{width:100,height:24})})]}),e.jsxs(Un,{children:[e.jsx($s,{children:e.jsx(k,{width:80,height:10})}),e.jsx(Vn,{children:e.jsx(k,{width:140,height:18})})]}),e.jsxs(Un,{children:[e.jsx($s,{children:e.jsx(k,{width:80,height:10})}),e.jsx(Vn,{children:e.jsx(k,{width:120,height:18})})]})]}),e.jsxs(Sa,{children:[e.jsx(io,{children:e.jsx(k,{width:140,height:12})}),e.jsx(Y2,{children:e.jsx("div",{style:{height:220}})})]})]}),y&&e.jsxs(Ca,{children:[e.jsx(ka,{children:p&&e.jsxs(e.Fragment,{children:[(p.credits_remaining!=null||p.credits_total!=null)&&e.jsxs(K2,{children:[e.jsx(V2,{children:p.credits_remaining!=null?p.credits_remaining.toLocaleString():"—"}),e.jsx($s,{children:u("Credits remaining")})]}),e.jsxs(Un,{children:[e.jsxs(H2,{children:[e.jsx(q2,{$color:p.credit_status_color??null}),e.jsx(U2,{$color:p.credit_status_color??null,children:b})]}),p.credit_status==="Active"&&f&&e.jsxs(Q2,{children:[u("Since")," ",lo(f)]}),e.jsx(G2,{children:e.jsx("button",{type:"button",className:"btn submit",onClick:()=>t(bm),children:u("Add credits")})})]})]})}),p?.daily_metrics&&p.daily_metrics.length>0&&e.jsx(ie.Suspense,{fallback:null,children:e.jsx(jm,{metrics:p.daily_metrics})}),p?.request_logs&&p.request_logs.length>0&&e.jsxs(Sa,{children:[e.jsx(io,{children:u("Request Log")}),e.jsx(Td,{children:u("A list of recent AI requests and their credit usage.")}),e.jsxs(oo,{children:[e.jsx(ro,{children:e.jsxs("tr",{children:[e.jsx(Ge,{children:u("Date")}),e.jsx(Ge,{children:u("Status")}),e.jsx(Ge,{children:u("Credits")}),e.jsx(Ge,{children:u("Request ID")})]})}),e.jsx("tbody",{children:p.request_logs.map(($,C)=>e.jsxs(ao,{children:[e.jsx(Ye,{children:$.date?lo($.date):u("Unknown")}),e.jsx(Ye,{children:$.status==="success"?u("Success"):$.status==="failure"?u("Failed"):$.status||"—"}),e.jsx(Ye,{children:$.credits!=null?`${$.credits.toLocaleString()} ${u("credits")}`:"—"}),e.jsx(Ye,{children:e.jsx("code",{children:$.request_id})})]},$.request_id??C))})]})]}),!x&&e.jsx(Ed,{children:e.jsx(at,{title:u("No usage data yet"),subtitle:u("Usage will appear here once you start using SolspaceAI."),icon:e.jsx(ps,{}),iconFade:!0})})]})]}):e.jsx(Cs,{title:u("SolspaceAI requires Freeform Pro"),subtitle:u("Upgrade to the Freeform Pro edition to get access to SolspaceAI."),children:e.jsx("a",{href:Craft.getCpUrl("plugin-store/freeform"),className:"btn submit",target:"_blank",rel:"noreferrer",children:u("Plugin Store")})}))},zt={all:["rules"],form:t=>[...zt.all,"forms",t],notifications:t=>[...zt.form(t),"notifications"],integrations:t=>[...zt.form(t),"integrations"]},vm=t=>{const n=X();return g.useCallback(()=>{t&&n.removeQueries({queryKey:zt.form(t)})},[t,n])},En=t=>{const n=qt();return B({queryKey:zt.form(t),queryFn:()=>T.get(`/api/forms/${t}/rules`).then(s=>s.data).then(s=>(n(cn.set(s.fields)),n(On.set(s.pages)),n(_n.set(s.submitForm)),n(ln.set(s.buttons)),s)),staleTime:1/0,gcTime:1/0})},Md=t=>{const n=qt();return B({queryKey:zt.notifications(t),queryFn:()=>T.get(`/api/forms/${t||0}/rules/notifications`).then(s=>s.data).then(s=>(n(Bn.set(s)),s)),staleTime:1/0,gcTime:1/0})},wm=t=>{const n=qt();return B({queryKey:zt.integrations(t),queryFn:()=>T.get(`/api/forms/${t||0}/rules/integrations`).then(s=>s.data).then(s=>(n(Dn.set(s)),s)),staleTime:1/0,gcTime:1/0})},Id=l.div`
  position: relative;

  display: flex;
  flex-direction: column;
  height: 100%;
`,Ad=l.div`
  flex-grow: 1;
  overflow: hidden;

  box-shadow:
    0 0 0 1px ${h.gray200},
    0 2px 12px rgb(205 216 228 / 50%);
  border-radius: ${S.lg};
`,Ue={base:["form-monitor"],tests:(t,n)=>[...Ue.base,"tests",t,n],stats:t=>[...Ue.base,"stats",t],testEmailHistory:t=>[...Ue.base,"test-email-history",t],testEmailStatus:t=>[...Ue.base,"test-email-status",t],mailerInfo:()=>[...Ue.base,"mailer-info"]},$m=(t,n={})=>{const{limit:s=100,offset:i=0}=n;return B({queryKey:Ue.tests(t,{limit:s,offset:i}),queryFn:()=>T.get(`/api/form-monitor/forms/${t}/tests`,{params:{limit:s,offset:i}}).then(o=>o.data),staleTime:0,refetchOnWindowFocus:!1,enabled:!!t})},Rd=(t,n)=>B({queryKey:Ue.stats(t),queryFn:()=>T.get(`/api/form-monitor/forms/${t}/stats`).then(s=>s.data),enabled:n?.enabled??!!t}),Cm=(t,n={})=>{const{limit:s=50,offset:i=0}=n;return B({queryKey:Ue.testEmailHistory({limit:s,offset:i}),queryFn:()=>T.get("/api/form-monitor/test-email/history",{params:{limit:s,offset:i}}).then(o=>o.data),staleTime:0,refetchOnWindowFocus:!1,enabled:!!t})},km=(t,n)=>B({queryKey:Ue.testEmailStatus(t||""),queryFn:()=>T.get("/api/form-monitor/test-email/status",{params:{token:t}}).then(s=>s.data),enabled:(n?.enabled??!0)&&!!t,refetchInterval:n?.refetchInterval??!1}),Sm=(t,n)=>le({mutationFn:()=>T.post("/api/form-monitor/test-email",{formId:t}).then(s=>s.data),onSuccess:s=>{n?.onSuccess?.(s)},onError:n?.onError}),Pd=()=>B({queryKey:Ue.mailerInfo(),queryFn:()=>T.get("/api/form-monitor/mailer-info").then(t=>t.data),staleTime:300*1e3});l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
  padding: ${m.xl};
  background: ${h.white};
  height: 100%;
  flex: 1;
`;const Lm=l.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
`,Fm={sm:ne`
    font-size: 10px;
    padding: 2px 6px;
    gap: 4px;
  `,md:ne`
    font-size: 12px;
    padding: 2px 6px;
    gap: 6px;
  `,lg:ne`
    font-size: 14px;
    padding: 2px 6px;
    gap: 8px;
  `,xl:ne`
    font-size: 16px;
    padding: 6px 10px 6px 6px;
    gap: 6px;
    width: fit-content;
  `},Em={sm:ne`
    width: 8px;
    height: 8px;
  `,md:ne`
    width: 10px;
    height: 10px;
  `,lg:ne`
    width: 12px;
    height: 12px;
  `,xl:ne`
    width: 20px;
    height: 20px;
  `},xt=l.div`
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 999px;
  ${({$size:t="sm"})=>Fm[t]}
  background-color: ${({$status:t})=>{switch(t){case"success":case"active":return"rgba(34, 197, 94, 0.2)";case"failed":return"rgba(239, 68, 68, 0.2)";case"pending":return"rgba(55, 65, 81, 0.2)";case"inactive":return"rgba(107, 114, 128, 0.2)";default:return"rgba(156, 163, 175, 0.2)"}}};
  color: ${({$status:t})=>{switch(t){case"success":case"active":return h.green600;case"failed":return h.red600;case"pending":return h.gray700;case"inactive":return h.gray600;default:return h.gray600}}};
`,gn=l.span`
  display: inline-block;
  border-radius: 50%;
  background-color: currentColor;
  position: relative;
  ${({$size:t="sm"})=>Em[t]}

  ${({$status:t})=>t==="pending"&&ne`
      background-color: transparent;
      color: currentColor;

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    `}
`,Tm=l.div`
  color: ${h.red600};
  font-size: 14px;
  line-height: 1.5;
  padding: ${m.xl};
  background: ${h.white};
  width: 100%;
  height: 100%;
`,De=l.div`
  position: relative;

  flex-basis: 300px;
  flex-shrink: 0;
  width: 300px;
  padding: ${({$lean:t,$noPadding:n})=>t?m.sm:n?"0":m.lg};
  box-sizing: border-box;

  border-bottom-left-radius: ${S.lg};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
  background: ${h.gray050};

  overflow-y: auto;

  --background-color: ${h.gray050};
  --margins: -18px;
`,Nm=(t,n)=>le({mutationFn:()=>T.put(`/api/form-monitor/forms/${t}/enable`),onMutate:()=>{n?.onLoading?.()},onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),zm=(t,n,s)=>le({mutationFn:()=>T.delete(`/api/form-monitor/forms/${t}/tests/${n}`),onSuccess:()=>{s?.onSuccess?.()},onError:()=>{s?.onError?.()}}),Mm=(t,n)=>le({mutationFn:()=>T.delete(`/api/form-monitor/forms/${t}/tests/all`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Im=(t,n)=>le({mutationFn:()=>T.put(`/api/form-monitor/forms/${t}/disable`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Am=(t,n)=>le({mutationFn:()=>T.put(`/api/form-monitor/forms/${t}/disable-and-clear`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Rm=t=>e.jsx(R,{height:"800",viewBox:"0 0 50 50",width:"800",...t,children:e.jsx("path",{d:"m46.4375-.03125c-.167969-.0078125-.339844.0078125-.5.03125-.671875.09375-1.25.421875-1.65625 1.03125l-.03125.0625-.03125.03125-8.5625 16.09375c-.964844-.359375-1.921875-.570312-2.8125-.59375-.960937-.023437-1.867187.125-2.6875.46875-1.582031.660156-2.777344 1.953125-3.5625 3.59375-.035156.050781-.066406.101563-.09375.15625-.003906.007813.003906.023438 0 .03125-.011719.019531-.023437.042969-.03125.0625-.011719.039063-.023437.082031-.03125.125-.542969 1.355469-1.167969 2.574219-1.875 3.65625-.007812.011719-.023437.019531-.03125.03125-.089844.078125-.164062.175781-.21875.28125-.003906.007813.003906.023438 0 .03125-.035156.050781-.066406.101563-.09375.15625-2.386719 3.417969-5.496094 5.476563-8.4375 6.75-4.007812 1.734375-7.84375 1.917969-8.6875 1.84375-.402344-.039062-.789062.164063-.980469.519531-.1875.355469-.148437.792969.105469 1.105469 11.394531 14.0625 28.15625 14.5625 28.15625 14.5625.199219.003906.394531-.050781.5625-.15625 0 0 2.070313-1.3125 4.5625-4.4375 1.871094-2.347656 4.003906-5.742187 5.84375-10.4375l.03125-.03125c.230469-.214844.347656-.527344.3125-.84375 0-.011719 0-.019531 0-.03125.484375-1.308594.953125-2.683594 1.375-4.1875.015625-.0625.027344-.125.03125-.1875 0-.011719 0-.019531 0-.03125 1.332031-3.4375-.152344-7.222656-3.34375-8.875l6.1875-17.15625v-.03125l.03125-.03125c.203125-.710937-.03125-1.394531-.40625-1.9375-.355469-.511719-.875-.914062-1.5-1.1875v-.03125c-.019531-.007812-.042969.007813-.0625 0-.011719-.003906-.019531-.027344-.03125-.03125-.488281-.230469-1.023437-.3867188-1.53125-.40625zm-.125 2.09375c.226563-.035156.523438-.035156.84375.125l.03125.03125h.03125c.324219.128906.59375.347656.71875.53125s.089844.292969.09375.28125l-6.09375 16.90625c-.734375-.332031-1.242187-.566406-2.28125-1.03125-.773437-.347656-1.507812-.683594-2.15625-.96875l8.4375-15.78125c-.007812.007813.148438-.058594.375-.09375zm-42.3125 5.9375c-2.199219 0-4 1.800781-4 4s1.800781 4 4 4 4-1.800781 4-4-1.800781-4-4-4zm0 2c1.117188 0 2 .882813 2 2 0 1.117188-.882812 2-2 2-1.117187 0-2-.882812-2-2 0-1.117187.882813-2 2-2zm9 1c-1.105469 0-2 .894531-2 2s.894531 2 2 2 2-.894531 2-2-.894531-2-2-2zm-1.5 7c-3.027344 0-5.5 2.472656-5.5 5.5s2.472656 5.5 5.5 5.5 5.5-2.472656 5.5-5.5-2.472656-5.5-5.5-5.5zm21.3125.625c.695313.019531 1.457031.160156 2.3125.5.019531.011719.042969.023438.0625.03125.226563.355469.652344.53125 1.0625.4375.113281.046875.101563.042969.21875.09375.675781.292969 1.527344.652344 2.375 1.03125 1.242188.554688 2.027344.894531 2.75 1.21875.019531.023438.039063.042969.0625.0625.214844.296875.574219.453125.9375.40625h.03125c2.390625 1.09375 3.445313 3.699219 2.625 6.21875-.394531-.011719-.695312.007813-1.4375-.15625-.554687-.121094-1.09375-.316406-1.5-.5625s-.640625-.488281-.75-.8125c-.085937-.28125-.292969-.507812-.566406-.621094-.269531-.117187-.578125-.105468-.839844.027344-.335937.167969-1.183594.105469-1.9375-.28125-.375-.191406-.710937-.460937-.9375-.6875-.226562-.226562-.289062-.441406-.28125-.40625-.054687-.292969-.234375-.546875-.496094-.691406-.257812-.144531-.570312-.164063-.847656-.058594-.027344.011719-.359375.042969-.75-.03125s-.84375-.234375-1.28125-.4375-.839844-.449219-1.09375-.65625-.277344-.421875-.25-.15625c-.066406-.527344-.53125-.914062-1.0625-.875-1.003906.09375-1.945312-.644531-2.5-1.125.585938-.988281 1.3125-1.777344 2.21875-2.15625.554688-.230469 1.179688-.332031 1.875-.3125zm-21.3125 1.375c1.945313 0 3.5 1.554688 3.5 3.5 0 1.945313-1.554687 3.5-3.5 3.5-1.945312 0-3.5-1.554687-3.5-3.5 0-1.945312 1.554688-3.5 3.5-3.5zm16.3125 2.96875c.695313.5 1.660156 1.019531 2.8125 1.125.183594.269531.382813.488281.625.6875.433594.359375.96875.675781 1.53125.9375s1.152344.480469 1.75.59375c.308594.058594.625-.058594.9375-.0625.148438.226563.214844.527344.40625.71875.40625.40625.890625.75 1.4375 1.03125.8125.417969 1.789063.5625 2.75.4375.328125.492188.722656.90625 1.1875 1.1875.683594.410156 1.429688.660156 2.125.8125.488281.105469.933594.152344 1.34375.1875-.277344.898438-.578125 1.742188-.875 2.5625-.359375-.011719-.800781-.03125-1.28125-.125-1.09375-.210937-2.128906-.695312-2.5625-1.53125-.234375-.4375-.753906-.636719-1.21875-.46875-.496094.175781-1.394531.101563-2.15625-.25-.761719-.351562-1.339844-.960937-1.46875-1.40625-.082031-.269531-.277344-.492187-.535156-.609375-.253906-.121094-.546875-.125-.808594-.015625-.242187.101563-1.1875.074219-1.96875-.28125s-1.285156-.953125-1.34375-1.28125c-.050781-.277344-.214844-.515625-.453125-.664062-.238281-.148438-.527344-.191407-.796875-.117188-.945312.253906-1.683594-.082031-2.28125-.53125-.207031-.152344-.359375-.320312-.5-.46875.484375-.769531.933594-1.585937 1.34375-2.46875zm-2.5 4.125c.148438.136719.289063.269531.46875.40625.738281.554688 1.875.949219 3.15625.875.464844.871094 1.21875 1.539063 2.09375 1.9375.863281.394531 1.785156.519531 2.6875.40625.5.816406 1.195313 1.507813 2.0625 1.90625.925781.425781 1.964844.535156 2.96875.375.933594 1.167969 2.261719 1.804688 3.4375 2.03125.3125.058594.621094.097656.90625.125-1.664062 4.019531-3.527344 6.960938-5.15625 9-2.085937 2.613281-3.496094 3.601563-3.8125 3.8125-.355469-.015625-2.960937-.199219-6.625-1.21875.300781-.195312.625-.398437.96875-.65625 1.667969-1.25 3.851563-3.289062 5.96875-6.4375.222656-.324219.238281-.746094.035156-1.082031-.203125-.339844-.582031-.527344-.972656-.480469-.292969.03125-.554687.191406-.71875.4375-1.984375 2.953125-4.027344 4.84375-5.53125 5.96875-1.429687 1.070313-2.257812 1.402344-2.34375 1.4375-2.25-.792969-4.742187-1.878906-7.28125-3.40625.367188-.121094.757813-.28125 1.1875-.46875 1.898438-.828125 4.4375-2.375 7.03125-5.28125.3125-.3125.382813-.792969.175781-1.179687-.210937-.390625-.648437-.597657-1.082031-.507813-.230469.039063-.441406.164063-.59375.34375-2.40625 2.691406-4.660156 4.058594-6.3125 4.78125s-2.59375.78125-2.59375.78125c-.042969.007813-.085937.019531-.125.03125-2.074219-1.460937-4.144531-3.238281-6.09375-5.375 1.902344-.148437 4.351563-.535156 7.375-1.84375 2.984375-1.292969 6.167969-3.402344 8.71875-6.71875z"})}),Pm=t=>e.jsx(R,{width:"48",height:"48",viewBox:"0 0 24 24",...t,children:e.jsxs("g",{children:[e.jsx("circle",{cx:"12",cy:"2.5",r:"1.5",fill:"gray",opacity:".14"}),e.jsx("circle",{cx:"16.75",cy:"3.77",r:"1.5",fill:"gray",opacity:".29"}),e.jsx("circle",{cx:"20.23",cy:"7.25",r:"1.5",fill:"gray",opacity:".43"}),e.jsx("circle",{cx:"21.5",cy:"12",r:"1.5",fill:"gray",opacity:".57"}),e.jsx("circle",{cx:"20.23",cy:"16.75",r:"1.5",fill:"gray",opacity:".71"}),e.jsx("circle",{cx:"16.75",cy:"20.23",r:"1.5",fill:"gray",opacity:".86"}),e.jsx("circle",{cx:"12",cy:"21.5",r:"1.5",fill:"gray"}),e.jsx("animateTransform",{attributeName:"transform",calcMode:"discrete",dur:"0.75s",repeatCount:"indefinite",type:"rotate",values:"0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"})]})}),Dm=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{fill:"#0f0f0f",children:[e.jsx("path",{d:"m6 12c0 .5523.44772 1 1 1h10c.5523 0 1-.4477 1-1s-.4477-1-1-1h-10c-.55228 0-1 .4477-1 1z"}),e.jsx("path",{clipRule:"evenodd",d:"m12 23c6.0751 0 11-4.9249 11-11 0-6.07513-4.9249-11-11-11-6.07513 0-11 4.92487-11 11 0 6.0751 4.92487 11 11 11zm0-2.0068c-4.96679 0-8.99317-4.0264-8.99317-8.9932 0-4.96679 4.02638-8.99317 8.99317-8.99317 4.9668 0 8.9932 4.02638 8.9932 8.99317 0 4.9668-4.0264 8.9932-8.9932 8.9932z",fillRule:"evenodd"})]})}),Bm=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{fill:"#1c274c",children:[e.jsx("path",{d:"m9.87787 4.24993c.30923-.8749 1.14363-1.49993 2.12213-1.49993s1.813.62503 2.1222 1.49993c.138.39054.5665.59524.9571.4572.3905-.13804.5952-.56653.4572-.95706-.5145-1.45548-1.9025-2.50007-3.5365-2.50007-1.6339 0-3.02196 1.04459-3.53639 2.50007-.13804.39053.06665.81902.45719.95706s.81903-.06666.95707-.4572z"}),e.jsx("path",{d:"m2.75 6c0-.41421.33579-.75.75-.75h17.0001c.4142 0 .75.33579.75.75s-.3358.75-.75.75h-17.0001c-.41421 0-.75-.33579-.75-.75z"}),e.jsx("path",{d:"m5.11686 7.75166c.41329-.02755.77067.28515.79822.69845l.45995 6.89909c.08985 1.3479.15388 2.2857.29445 2.9913.13635.6845.32668 1.0468.60009 1.3026.27342.2557.64758.4216 1.33958.5121.7134.0933 1.65345.0948 3.00425.0948h.7734c1.3508 0 2.2908-.0015 3.0042-.0948.692-.0905 1.0662-.2564 1.3396-.5121.2734-.2558.4637-.6181.6001-1.3026.1405-.7056.2046-1.6434.2944-2.9913l.46-6.89909c.0275-.4133.3849-.726.7982-.69845s.726.38493.6985.79823l-.4635 6.95171c-.0855 1.2828-.1546 2.3189-.3165 3.132-.1684.8453-.4548 1.5514-1.0464 2.1048-.5916.5535-1.3152.7923-2.1698.9041-.8221.1075-1.8605.1075-3.1461.1075h-.8788c-1.2856 0-2.32407 0-3.14611-.1075-.85465-.1118-1.5782-.3506-2.16979-.9041-.5916-.5534-.87802-1.2595-1.04642-2.1048-.16197-.8131-.23103-1.8492-.31652-3.132l-.46345-6.95171c-.02756-.4133.28515-.77068.69845-.79823z"})]})}),hs=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: ${m.md} ${m.xl};
`,Om=({formId:t,onClose:n,onSuccess:s})=>{const i=Im(t,{onSuccess:()=>{s(),n()}}),o=()=>{i.mutate()};return e.jsx(wt,{closeModal:n,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Disable Monitoring")})}),e.jsx(hs,{children:e.jsx("div",{children:u("Are you sure you want to disable monitoring for this form?")})}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",onClick:o,disabled:i.isPending,children:u("Disable")})]})]})})},_m=({formId:t,onClose:n,onSuccess:s})=>{const i=te(),o=X(),[r,a]=g.useState(!1),[c,d]=g.useState(""),p=Am(t,{onSuccess:()=>{o.invalidateQueries({queryKey:Ue.base}),o.invalidateQueries({queryKey:fe.single(t)}),s(),n(),i(`/forms/${t}`,{replace:!0})}}),x=()=>{r&&p.mutate()},f=b=>{d(b.target.value)};return g.useEffect(()=>{a(c.toUpperCase()==="CONFIRM")},[c]),e.jsx(wt,{closeModal:n,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Disable & Delete Monitoring Data")})}),e.jsxs(hs,{children:[e.jsx("div",{children:u("Are you sure you want to disable monitoring and delete all monitoring data for this form?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:c,autoComplete:"off",onChange:f,className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:`btn submit ${r?"":"disabled"}`,onClick:x,disabled:p.isPending||!r,children:u("Disable & Delete")})]})]})})},Dd=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  padding: ${m.md};
  width: 100%;
`,Wm=l.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Um=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,Hm=l(Dd)`
  padding: ${m.xl};
  background: ${h.white};
`,qm=l.div`
  margin-bottom: ${m.xl};
`,Na=l.div`
  display: grid;
  grid-template-columns: 100px 150px 120px 1fr 120px;
  gap: ${m.md};
`,Qm=()=>e.jsx(Qt,{baseColor:h.gray100,highlightColor:h.gray200,children:e.jsxs(Dd,{children:[e.jsx(k,{width:100,height:20}),e.jsx(k,{width:120,height:16}),[...Array(3)].map((t,n)=>e.jsxs(Wm,{children:[e.jsxs(Um,{children:[e.jsx(k,{width:80,height:14}),e.jsx(k,{width:60,height:14})]}),e.jsx(k,{width:"100%",height:8})]},n))]})}),Km=()=>e.jsx(Qt,{baseColor:h.gray100,highlightColor:h.gray200,children:e.jsxs(Hm,{children:[e.jsxs(qm,{children:[e.jsx(k,{height:24,width:300}),e.jsx(k,{height:100})]}),e.jsxs(Na,{children:[e.jsx(k,{height:24}),e.jsx(k,{height:24}),e.jsx(k,{height:24}),e.jsx(k,{height:24}),e.jsx(k,{height:24})]}),[...Array(10)].map((t,n)=>e.jsxs(Na,{children:[e.jsx(k,{height:40}),e.jsx(k,{height:40}),e.jsx(k,{height:40}),e.jsx(k,{height:40}),e.jsx(k,{height:40,width:100})]},n))]})}),Bd=({formId:t,testId:n,onClose:s,onSuccess:i})=>{const[o,r]=g.useState(!1),[a,c]=g.useState(""),d=n===0,p=zm(t,n,{onSuccess:()=>{i?.(),s()}}),x=Mm(t,{onSuccess:()=>{i?.(),s()}}),f=y=>{c(y.target.value)},b=()=>{d&&!o||(d?x.mutate():p.mutate())};g.useEffect(()=>{r(d?a.toUpperCase()==="DELETE":!0)},[a,d]);const j=p.isPending||x.isPending;return e.jsx(wt,{closeModal:s,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u(d?"Clear All Test History":"Delete Test")})}),e.jsxs(hs,{children:[e.jsx("div",{children:u(d?"Are you sure you want to clear all test history? This action cannot be undone.":"Are you sure you want to permanently delete this test? This action cannot be undone.")}),d&&e.jsxs(e.Fragment,{children:[e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To clear all test history, please type <strong>DELETE</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:a,autoComplete:"off",onChange:f,className:"text fullwidth"})]})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:s,children:u("Cancel")}),e.jsx("button",{type:"button",className:E("btn submit",!o&&"disabled"),onClick:b,disabled:j||!o,children:e.jsx(J,{loadingText:u(d?"Clearing...":"Deleting..."),loading:j,spinner:!0,children:u(d?"Clear All":"Delete")})})]})]})})},Vm=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xl};

  h3 {
    font-size: 1.1em;
    margin-bottom: 0.3em;
  }
`;l.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${m.md};
`;const Gm=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,Ym=l.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${m.md};
  padding-bottom: ${m.md};
  border-bottom: 1px solid ${h.gray200};

  .status-success,
  .status-failed,
  .status-pending {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 24px;
    font-weight: 600;

    .status-main {
      display: flex;
      align-items: center;
      gap: ${m.sm};
      margin-bottom: 12px;
    }

    &.status-success {
      color: ${h.green600};
    }

    &.status-failed {
      color: ${h.red600};
    }

    &.status-pending {
      color: ${h.gray700};
    }

    small {
      display: flex;
      align-items: center;
      gap: 4px;
      color: ${h.gray500};
      font-size: 12px;
      font-weight: 300;
      margin-top: 4px;

      .status-text {
        font-weight: 600;
        font-size: 12px;

        &.status-success {
          color: ${h.green600};
        }

        &.status-failed {
          color: ${h.red600};
        }

        &.status-pending {
          color: ${h.gray700};
        }
      }
    }
  }
`,Jm=l.div`
  padding: 0 ${m.md};
  h3 {
    margin: 0 0 ${m.md};
  }
`,Zm=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
`,Ei=l.div`
  display: flex;
  flex-direction: ${({$isColumn:t})=>t?"column":"row"};
  justify-content: ${({$isColumn:t})=>t?"flex-start":"space-between"};
  gap: ${({$isColumn:t})=>t?m.xs:"0"};
  margin-bottom: ${m.sm};

  &:last-child {
    margin-bottom: 0;
  }
`,Xm=l.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${m.xs};
`,eg=l.button`
  padding: 3px 8px;
  background-color: ${h.gray700};
  margin-top: ${m.xs};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`,tg=l.div`
  color: ${({$error:t})=>t?h.red600:"inherit"};
  font-style: italic;
  font-size: 0.9em;
  text-align: right;
`,Ti=l.div`
  color: ${h.gray600};
  font-size: 13px;
  font-weight: 500;
`;l.div`
  display: flex;
  align-items: center;
  gap: ${m.xs};
  font-size: 13px;
`;const ng=l.code`
  display: block;
  padding: ${m.xs};
  background: ${h.gray100};
  border-radius: 3px;
  font-size: 12px;
  word-break: break-all;
  color: ${h.gray700};
`,sg=l.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${m.md};
  padding-bottom: ${m.xl};
  border-bottom: 1px solid ${h.gray200};

  h3 {
    margin-bottom: ${m.sm};
    font-size: 1.1em;
    font-weight: 600;
    color: ${h.gray700};
  }

  .next-test-time {
    font-size: 14px;
    color: ${h.gray600};
  }
`,ig=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  margin-top: ${m.lg};
  position: relative;
`,og=l.button`
  height: var(--ui-control-height);
  width: var(--ui-control-height);
  border: 1px solid ${h.gray250};
  border-radius: ${S.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${h.gray700};
  padding: 0;

  svg {
    width: 16px;
    height: 16px;
    stroke: ${h.gray500};
  }

  &:hover {
    background: rgba(96, 125, 159, 0.3);
  }
`,rg=l.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid ${h.gray200};
  border-radius: ${S.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  z-index: 100;
  margin-top: ${m.sm};
`,co=l.button`
  display: flex;
  align-items: center;
  gap: ${m.sm};
  width: 100%;
  padding: ${m.sm} ${m.md};
  border: none;
  background: none;
  cursor: pointer;
  color: ${h.gray700};
  font-size: 12px;
  text-align: left;

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }

  &:hover {
    background: ${h.gray050};
  }
`,ag=l(co)`
  border-top: 1px solid ${h.gray200};
  color: ${h.red600};

  svg {
    stroke: ${h.red600};
  }

  &:hover {
    background: ${h.red050};
  }
`,lg=t=>t==="pending"?"Processing":t.charAt(0).toUpperCase()+t.slice(1),cg=({configuration:t,refetchData:n,hasTests:s,isError:i})=>{const[o,r]=ie.useState(null),[a,c]=ie.useState(!1),[d,p]=ie.useState(!1),[x,f]=ie.useState(!1),[b,j]=ie.useState(!1),y=ie.useRef(null);ie.useEffect(()=>{const C=F=>{y.current&&!y.current.contains(F.target)&&j(!1)};return document.addEventListener("mousedown",C),()=>{document.removeEventListener("mousedown",C)}},[]);const w=Nm(t.formId,{onLoading:()=>{r("loading")},onSuccess:()=>{r("success"),setTimeout(()=>{r(null),n()},2e3)},onError:()=>{r("error"),setTimeout(()=>{r(null)},2e3)}}),v=()=>{w.mutate()},$=()=>o==="loading"?u("Reactivating service..."):o==="error"?u("Reactivation unsuccessful."):o==="success"?u("Service reactivated!"):null;return e.jsxs(Jm,{children:[e.jsx("h3",{children:u("Configuration")}),e.jsxs(Zm,{children:[!i&&e.jsxs(Ei,{children:[e.jsx(Ti,{children:u("Integration Status")}),e.jsxs(xt,{$size:"sm",$status:t.integrationStatus==="enabled"?"success":"disabled",children:[e.jsx(gn,{$size:"md"}),u(t.integrationStatus==="enabled"?"ENABLED":"DISABLED")]})]}),e.jsxs(Ei,{children:[e.jsx(Ti,{children:u("Service Status")}),e.jsxs(Xm,{children:[e.jsxs(xt,{$size:"sm",$status:t.serviceStatus==="active"?"active":t.serviceStatus==="inactive"?"inactive":"disabled",children:[e.jsx(gn,{$size:"md"}),u(i?"Error":t.serviceStatus==="active"?"ACTIVE":t.serviceStatus==="inactive"?"INACTIVE":"DISABLED")]}),t.serviceStatus==="inactive"&&t.integrationStatus==="enabled"&&(o?e.jsx(tg,{$error:o==="error",children:$()}):e.jsx(eg,{onClick:v,disabled:w.isPending,children:u("Reactivate")}))]})]}),t?.monitoredUrl&&e.jsxs(Ei,{$isColumn:!0,children:[e.jsx(Ti,{children:u("Monitored URL")}),e.jsx(ng,{children:t.monitoredUrl})]}),e.jsxs(ig,{ref:y,children:[!i&&e.jsx(og,{onClick:()=>j(!b),"aria-expanded":b,"aria-controls":"action-menu",title:u("Actions"),children:e.jsx(Gc,{})}),b&&e.jsxs(rg,{id:"action-menu",children:[s&&e.jsxs(co,{onClick:()=>{j(!1),c(!0)},children:[e.jsx(Rm,{}),u("Clear All Test History")]}),t.serviceStatus!=="inactive"&&e.jsxs(co,{onClick:()=>{j(!1),p(!0)},children:[e.jsx(Dm,{}),u("Disable Monitoring")]}),e.jsxs(ag,{onClick:()=>{j(!1),f(!0)},children:[e.jsx(Bm,{}),u("Disable & Delete Monitoring Data")]})]})]})]}),a&&e.jsx(Bd,{formId:t.formId,testId:0,onClose:()=>c(!1),onSuccess:()=>{c(!1),n()}}),d&&e.jsx(Om,{formId:t.formId,onClose:()=>p(!1),onSuccess:()=>{p(!1),n()}}),x&&e.jsx(_m,{formId:t.formId,onClose:()=>f(!1),onSuccess:()=>{f(!1),n()}})]})},za=({lastTest:t})=>{const n=t?.totalStatus;return n?e.jsxs(Ym,{children:[e.jsx("h3",{children:u("Most Recent Test")}),e.jsxs(Gm,{children:[t?.dateAttempted,e.jsx("div",{className:`status-${n}`,children:e.jsx("div",{className:"status-main",children:e.jsxs(xt,{$status:n,$size:"xl",children:[e.jsx(gn,{$size:"xl",$status:n,children:n==="pending"&&e.jsx(Pm,{})}),u(lg(n))]})})})]})]}):null},dg=({nextMonitoringTime:t,nextMonitoringTimeIn:n})=>n?e.jsxs(sg,{children:[e.jsx("h3",{children:u("Next Scheduled Test")}),e.jsxs("div",{className:"next-test-time",children:[t," ",e.jsx("br",{})," (in ",n?.humanReadable,")"]})]}):null,ug=({formTestsQuery:t})=>{const{data:n,isLoading:s,refetch:i}=t;if(s)return e.jsx(De,{children:e.jsx(Qm,{})});const o={integrationStatus:n?.enabled?"enabled":"disabled",serviceStatus:n?.fmFormStats?.enabled?"active":"inactive",monitoredUrl:n?.url||"",formId:n?.formId},r=n?.stats?.total>0,a=!!t.data?.error?.message;return e.jsx(De,{children:e.jsxs(Vm,{children:[r?e.jsxs(e.Fragment,{children:[e.jsx(za,{lastTest:n?.lastSubmission}),n?.lastSubmission?.status!=="pending"&&e.jsx(dg,{nextMonitoringTime:n?.fmFormStats?.nextMonitoringTime,nextMonitoringTimeIn:n?.fmFormStats?.nextMonitoringTimeIn})]}):e.jsx(za,{}),e.jsx(cg,{configuration:o,refetchData:i,hasTests:r,isError:a})]})})},pg=()=>{const{formId:t}=V(),[n]=Ho(),s=100,i=Number(n.get("page"))||1,o=i>0?(i-1)*s:0,r=$m(Number(t),{limit:s,offset:o});return e.jsxs(Lm,{children:[e.jsx(ug,{formTestsQuery:r}),e.jsx(jt,{context:{formTestsQuery:r}})]})};function Ct(t){const[n,s]=g.useState(!1),i=()=>s(!0),o=()=>s(!1);return g.useEffect(()=>{const r=t.current;if(r)return r.addEventListener("mouseenter",i),r.addEventListener("mouseleave",o),()=>{r.removeEventListener("mouseenter",i),r.removeEventListener("mouseleave",o)}},[t]),n}const hg=({active:t,hovering:n})=>Y({opacity:t?1:0,background:n?h.error:"transparent",fill:n?"#fff":h.gray300,color:n?"#fff":h.gray300,scale:n?1.2:1,rotate:t?0:30,config:s=>{switch(s){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Od=l(_.button)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  font-size: 16px;

  border-radius: 50%;
  padding: 3px;

  svg {
    color: currentColor;
  }
`,Tn=({active:t,onClick:n,...s})=>{const i=g.useRef(null),o=Ct(i),a={...hg({active:t,hovering:o}),...s?.style};return delete s.style,e.jsx(Od,{type:"button",ref:i,style:a,onClick:n,...s,children:e.jsx(Yc,{})})},xg={dark:ne`
    background: ${h.gray800};
    border: 1px solid ${h.gray800};
    box-shadow: 0 10px 24px rgb(8 15 24 / 18%);
    color: ${h.white};
  `,light:ne`
    background: ${h.white};
    border: 1px solid ${h.gray100};
    box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
    color: ${h.gray800};
  `},mg=l.span`
  display: inline-flex;
`,gg=l.div`
  max-width: min(320px, calc(100vw - ${m.xl}));
  padding: ${m.xs} ${m.sm};

  border-radius: ${S.sm};

  font-size: 12px;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;

  ${({$theme:t})=>xg[t]}
`,fg=t=>typeof t=="number"?{open:t,close:t}:Array.isArray(t)?{open:t[0],close:t[1]}:{},bg=({arrowEnabled:t,arrowRef:n,context:s,content:i,floatingStyles:o,getFloatingProps:r,refs:a,theme:c})=>e.jsx(R1,{children:e.jsxs(gg,{ref:a.setFloating,...r(),$theme:c,style:o,children:[i,t&&e.jsx(P1,{ref:n,context:s,fill:c==="light"?"#ffffff":"#2f3c4c",stroke:c==="light"?"#d3dae2":"#2f3c4c",strokeWidth:1})]})}),jg=({arrow:t=!1,children:n,delay:s,distance:i=8,followCursor:o=!1,hideOnClick:r=!0,html:a,interactive:c=!1,position:d="top",style:p,theme:x="dark",title:f,trigger:b})=>{const[j,y]=g.useState(!1),w=g.useRef(null),v=a??f,$=g.useMemo(()=>{const In=[z1(i),M1(),I1({padding:8})];return t&&In.push(w1({element:w})),In},[t,i]),C=$1({middleware:$,onOpenChange:y,open:j,placement:d,whileElementsMounted:A1}),{refs:F,floatingStyles:N,context:M}=C,z=C1(M,{delay:fg(s),enabled:b==="mouseenter",handleClose:c?k1():void 0,move:!o}),L=S1(M,{enabled:b==="mouseenter"}),A=L1(M,{enabled:b==="click",event:"mousedown",toggle:!0}),D=F1(M,{outsidePressEvent:"mousedown",referencePress:b==="click"&&r}),ce=E1(M,{role:b==="click"?"dialog":"tooltip"}),pe=T1(M,{enabled:o}),{getFloatingProps:St,getReferenceProps:on}=N1([z,L,A,D,ce,pe]);return v?e.jsxs(e.Fragment,{children:[e.jsx(mg,{ref:F.setReference,...on(),style:p,children:n}),j&&e.jsx(bg,{arrowEnabled:t,arrowRef:w,context:M,content:v,floatingStyles:N,getFloatingProps:St,refs:F,theme:x})]}):e.jsx(e.Fragment,{children:n})},xe=t=>e.jsx(jg,{...t,trigger:t.trigger??"mouseenter"}),dt=t=>e.jsx(R,{width:"14",height:"14",viewBox:"0 0 14 14",...t,children:e.jsx("path",{d:"M3 3L11 11M11 3L3 11",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),es=t=>e.jsx(R,{viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M24 0C10.7 0 0 10.7 0 24S10.7 48 24 48l8 0 0 19c0 40.3 16 79 44.5 107.5L158.1 256 76.5 337.5C48 366 32 404.7 32 445l0 19-8 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-19c0-40.3-16-79-44.5-107.5L225.9 256l81.5-81.5C336 146 352 107.3 352 67l0-19 8 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 0zM192 289.9l81.5 81.5C293 391 304 417.4 304 445l0 19L80 464l0-19c0-27.6 11-54 30.5-73.5L192 289.9zm0-67.9l-81.5-81.5C91 121 80 94.6 80 67l0-19 224 0 0 19c0 27.6-11 54-30.5 73.5L192 222.1z"})}),yg=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"13",r:"3"}),e.jsx("path",{d:"m9.77778 21h4.44442c3.1211 0 4.6816 0 5.8026-.7354.4852-.3184.9019-.7275 1.2262-1.2039.749-1.1006.749-2.6328.749-5.6971 0-3.0642 0-4.59639-.749-5.697-.3243-.47646-.741-.88556-1.2262-1.20392-.7204-.47255-1.6221-.64145-3.0028-.70182-.6589 0-1.2261-.49018-1.3553-1.1245-.1939-.95147-1.0448-1.63636-2.033-1.63636h-3.2674c-.98825 0-1.83915.68489-2.03297 1.63636-.12921.63432-.69648 1.1245-1.35533 1.1245-1.38067.06037-2.28245.22927-3.00276.70182-.48529.31836-.90196.72746-1.22622 1.20392-.74902 1.10061-.74902 2.6328-.74902 5.697 0 3.0643 0 4.5965.74902 5.6971.32426.4764.74093.8855 1.22622 1.2039 1.121.7354 2.68151.7354 5.80254.7354z"}),e.jsx("path",{d:"m19 10h-1",strokeLinecap:"round"})]})}),vg=l.div`
  display: flex;
  gap: ${m.lg};
  margin-bottom: ${m.lg};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`,Ma=l.div`
  flex: 1;
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`,Ia=l.h3`
  margin: 0 0 ${m.md} 0;
  color: ${h.gray700};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`,Aa=l.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${h.gray050};
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-grow: 1;
  min-height: 300px;
  max-height: 60vh;
  width: 100%;
  border: 1px solid ${h.gray200};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`,wg=l.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`,$g=l.div`
  position: absolute;
  top: ${m.sm};
  right: ${m.sm};
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
  background: rgba(255, 255, 255, 0.95);
  padding: ${m.xs};
  border-radius: 6px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .rzpp-mini-map {
    border-radius: 4px;
  }
`,Cg=l.div`
  display: flex;
  gap: ${m.xs};
`,Ni=l.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${h.gray300};
  background: ${h.white};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${h.gray100};
    border-color: ${h.gray400};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;l.div`
  position: absolute;
  bottom: ${m.sm};
  left: ${m.sm};
  background: rgba(0, 0, 0, 0.7);
  color: ${h.white};
  padding: ${m.xs} ${m.sm};
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(4px);
  z-index: 10;
`;const kg=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${h.gray500};
  font-style: italic;
`,zi=l.div`
  display: flex;
  gap: ${m.lg};
  margin-bottom: ${m.lg};
  width: 100%;
`,Sg=({data:t,closeModal:n})=>{if(!t)return null;const{screenshot:s,beforeSubmitScreenshot:i,testId:o}=t,r=!!s,a=!!i,c=r&&a,d=(x,f)=>e.jsxs(Ma,{children:[c&&e.jsx(Ia,{children:f}),e.jsx(Aa,{children:e.jsx(D1,{initialScale:1,minScale:.5,maxScale:3,wheel:{step:.1},pinch:{step:5},doubleClick:{step:.5},children:({zoomIn:b,zoomOut:j,resetTransform:y,instance:w})=>e.jsxs(e.Fragment,{children:[e.jsx(B1,{wrapperStyle:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},contentStyle:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},children:e.jsx(wg,{src:x,alt:f,loading:"lazy",draggable:!1})}),e.jsxs($g,{children:[e.jsxs(Cg,{children:[e.jsx(Ni,{onClick:()=>j(),disabled:w.transformState.scale<=.5,title:u("Zoom Out"),children:"−"}),e.jsx(Ni,{onClick:()=>y(),title:u("Reset Zoom"),children:"↺"}),e.jsx(Ni,{onClick:()=>b(),disabled:w.transformState.scale>=3,title:u("Zoom In"),children:"+"})]}),e.jsx(O1,{width:104,height:108,borderColor:"rgba(255, 255, 255, 0.8)",children:e.jsx("img",{src:x,alt:"Minimap"})})]})]})})})]}),p=x=>e.jsxs(Ma,{children:[e.jsx(Ia,{children:x}),e.jsx(Aa,{children:e.jsx(kg,{children:u("No screenshot available")})})]});return e.jsxs(ve,{style:{maxWidth:"90vw",width:"1200px"},children:[e.jsx(we,{children:e.jsx("h1",{children:u("Screenshots for Test",{testId:o})})}),e.jsx("div",{style:{padding:`${m.lg} ${m.xl}`},children:c?e.jsxs(vg,{children:[d(i,u("Before Submit")),d(s,u("After Submit"))]}):a?e.jsx(zi,{children:d(i,"")}):r?e.jsx(zi,{children:d(s,"")}):e.jsx(zi,{children:p(u("Screenshots"))})}),e.jsx($e,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Close")})})]})},Lg=t=>{const{openModal:n}=qe();return()=>{n(Sg,t)}},Mi=l.div`
  flex: 1;
  background: ${h.white};
  padding: ${m.xl};
  overflow-y: auto;
  width: calc(100% - 300px);
  ${Q};

  div[class^='ControlWrapper-'] {
    div[class^='CheckboxWrapper-'] {
      align-items: start;

      div[class^='CheckboxItem-'] {
        padding-top: 4px;
      }
    }
  }

  h3 {
    font-size: 1.3em;
    margin-bottom: 0;
  }
`,Ra=l.div`
  color: ${h.gray700};

  p {
    color: ${h.gray600};
    font-size: 0.9em;
  }
`,Fg=l.div`
  padding: ${m.sm};
`,Eg=l.div`
  background: ${h.white};
  border-radius: 4px;
`,Pa=l.p`
  color: ${h.gray600};
  font-size: 0.9em;
  margin-bottom: ${m.md};
  margin-top: 0;
`,Tg=l.div`
  display: flex;
  flex-direction: column;
  padding: ${m.sm};
`,Ng=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
  margin-bottom: ${m.lg};
`,zg=l.div`
  display: flex;
  align-items: center;
  gap: ${m.md};
  margin-top: ${m.xl};
  padding-top: ${m.lg};
  border-top: 1px solid ${h.gray200};
`,Mg=l.nav`
  display: flex;
  gap: ${m.xs};
`,Da=l.button`
  width: 32px;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${S.sm};
  background: ${h.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${h.blue500};
    &::after {
      border-color: ${h.blue500};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    border: solid ${h.gray700};
    border-width: 0 2px 2px 0;
    opacity: 0.8;
    position: relative;
  }

  &.prev-page::after {
    transform: rotate(135deg);
    right: -1px;
  }

  &.next-page::after {
    transform: rotate(-45deg);
    left: -1px;
  }

  &:disabled::after {
    border-color: ${h.gray300};
  }
`,Ig=l.div`
  color: ${h.gray600};
  font-size: 13px;
`,Ag=l.div`
  max-width: 380px;
`,Rg=l.div`
  position: relative;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  border-radius: ${S.md};
  white-space: normal;
`,Pg=l.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.lg};
  overflow: hidden;
  margin-top: -1px;

  thead {
    background: ${h.gray050};

    th {
      padding: ${m.md} ${m.lg};
      font-weight: 600;
      color: ${h.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${h.gray200};
    }
  }

  tbody {
    td {
      padding: ${m.md} ${m.lg};
      vertical-align: middle;

      &.no-break {
        white-space: nowrap;
      }

      &.code {
        font-family: monospace;
        font-size: 12px;
      }

      .view-screenshot-btn {
        padding: 0;
        background: none;
        color: ${h.blue500};
        border: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover {
          color: ${h.blue600};
          text-decoration: underline;
        }
      }
    }

    tr {
      transition: background-color 0.2s ease;

      &:hover {
        background: ${h.gray050};
      }
    }
  }
`,uo=l.div`
  overflow: hidden;
  min-width: 160px;
`,Dg=l.div`
  padding: ${m.xs} ${m.md};
  display: flex;
  align-items: center;
  justify-content: center;
`,po=l.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${h.gray800};
  padding: ${m.xs} ${m.md};

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${h.gray900};
    }

    &.test-date {
      color: ${h.gray600};
      font-size: 11px;
      padding-bottom: ${m.xs};
    }

    &.test-response {
      padding-top: ${m.xs};
      border-top: 1px solid ${h.gray200};
      color: ${h.gray700};
      font-size: 11px;
    }
  }
`,Bg=l.div`
  display: grid;
  grid-template-columns: repeat(30, 1fr);
  gap: 8px;
  height: 80px;
  margin: ${m.md} 0 ${m.xl} 0;
  width: 100%;

  @media (max-width: 768px) {
    gap: 2px;
  }
`,Ba=l.div`
  position: relative;
  height: 100%;
  min-width: 4px;
  background: ${h.gray100};
  border-radius: ${S.lg};
  overflow: hidden;
`,Ii=l.div`
  position: absolute;
  bottom: ${({$offset:t})=>t}%;
  left: 0;
  width: 100%;
  height: ${({$height:t})=>t}%;
  background-color: ${({$status:t})=>t==="success"?h.green600:t==="failed"?h.red600:t==="pending"?h.gray700:h.gray100};
  box-sizing: border-box;
  border-top: ${({$isLast:t})=>t?"none":`1px solid ${h.white}`};
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`,Og=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${h.gray500};
  font-style: italic;
`,_g=l.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`,Wg=l.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`,Oa=l.div`
  flex: 1;

  .label {
    font-size: 12px;
    color: ${h.gray600};
    margin-bottom: 2px;
  }

  .value {
    font-size: 14px;
    font-weight: bold;
    color: ${h.gray900};
  }
`,Ug=l.div`
  background: ${h.gray100};
  padding: 2px 6px;
  border-radius: ${S.sm};
  font-size: 11px;
  color: ${h.gray700};
  text-transform: capitalize;
  height: 20px;
  display: flex;
  align-items: center;
  line-height: 1;
`,Hg=l.div`
  display: flex;
  align-items: center;
`,qg=l.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({$status:t})=>t==="success"?"rgba(34, 197, 94, 0.2)":t==="failed"?"rgba(239, 68, 68, 0.2)":"rgba(55, 65, 81, 0.2)"};
  color: ${({$status:t})=>t==="success"?h.green600:t==="failed"?h.red600:h.gray700};
  margin-right: ${m.sm};
`,Qg=l.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: ${S.sm};
  background-color: ${h.gray100};
  color: ${h.gray700};
  font-size: 9px;
  font-weight: 500;
  cursor: pointer;
  margin-right: ${m.sm};
  height: 16px;
  line-height: 1;
  position: relative;
  top: -1px;
`,Kg=l.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: #3f4d5a;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  opacity: 0.9;
  transition: all 0.2s ease;
  margin-right: ${m.sm};

  &:hover {
    opacity: 1;
    background: #4a5a6a;
  }

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
  }
`,Vg=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(55, 65, 81, 0.2);
  color: ${h.gray700};
`,_a=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    display: block;
    margin: auto;
  }
`;l.span`
  font-size: 13px;
  font-weight: 500;
`;const Gg=l.div`
  padding: ${m.lg} ${m.lg} 0 ${m.lg};
  background: ${h.white};
  border-radius: ${S.lg};
  overflow-x: auto;
  ${Q};

  h4 {
    font-size: 1.1em;
    margin-bottom: ${m.md};
    color: ${h.gray800};
  }
`;l.div`
  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.md};
  padding: ${m.sm};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;

  p {
    margin: 0 0 4px 0;

    &:first-child {
      font-weight: 600;
      color: ${h.gray900};
    }
  }

  .test-list {
    max-height: 100px;
    overflow-y: auto;
    margin-top: ${m.xs};

    .test-item {
      font-size: 11px;
      margin: 2px 0;
      color: ${h.gray700};
    }
  }
`;const Yg=l.div`
  width: 100%;
  min-width: 100%;
`,Wa=l.div`
  overflow: hidden;
  min-width: 160px;
  background: ${h.white};
  border-radius: ${S.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`,Jg=l.div`
  padding: ${m.xs} ${m.md};
  display: flex;
  align-items: center;
  justify-content: center;
`,Ua=l.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${h.gray800};
  padding: ${m.xs} ${m.md};
  text-align: center;

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${h.gray900};
    }

    &.test-date {
      color: ${h.gray600};
      font-size: 11px;
      padding-bottom: ${m.xs};
    }

    &.test-duration {
      padding-top: ${m.xs};
      border-top: 1px solid ${h.gray200};
      color: ${h.gray700};
      font-size: 11px;
    }
  }
`,Zg=({groups:t})=>{const s=(()=>{const d=new Date,p=[];for(let x=0;x<30;x++){const f=new Date(d);f.setDate(f.getDate()-x);const b=f.toISOString().split("T")[0],y=t.find(w=>w.date===b)?.tests||[];y.forEach(w=>{w.submissionDuration!==void 0&&w.submissionDuration!==null&&p.push({date:b,duration:w.submissionDuration,testId:w.id||0,status:w.status?.toLowerCase()||"pending",dateAttempted:w.dateAttempted||""})}),y.length===0&&p.push({date:b,duration:0,testId:null,status:"no-tests",dateAttempted:""})}return p})(),o=Array.from(new Set(s.map(d=>d.date))).sort().reverse().filter((d,p)=>p===0||p%5===0),r=({active:d,payload:p,label:x})=>{if(d&&p&&p.length){const f=p[0].payload;return f.status==="no-tests"?e.jsx(Wa,{children:e.jsxs(Ua,{children:[e.jsx("div",{children:x}),e.jsx("div",{children:"No tests on this day"})]})}):e.jsxs(Wa,{children:[e.jsx(Jg,{children:e.jsxs(xt,{$status:f.status,$size:"sm",children:[e.jsx(gn,{$size:"md"}),u(f.status?.toUpperCase())]})}),e.jsxs(Ua,{children:[e.jsxs("div",{className:"test-id",children:["Test: ",f.testId]}),e.jsx("div",{className:"test-date",children:f.dateAttempted}),e.jsxs("div",{className:"test-duration",children:["Submit time: ",e.jsxs("strong",{children:[f.duration,"s"]})]})]})]})}return null},a=10;return s.some(d=>d.duration>=0)?e.jsx(Gg,{children:e.jsx(Yg,{children:e.jsx(nt,{width:"100%",height:250,children:e.jsxs(yt,{data:s,margin:{top:10,right:30,left:0,bottom:20},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"durationGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"5%",stopColor:"#3b82f6",stopOpacity:.3}),e.jsx("stop",{offset:"95%",stopColor:"#3b82f6",stopOpacity:.1})]})}),e.jsx(lc,{strokeDasharray:"3 3",stroke:"#f0f0f0"}),e.jsx(cc,{dataKey:"date",tick:{fontSize:11},angle:-45,textAnchor:"end",height:60,interval:0,tickFormatter:(d,p)=>{const x=s.findIndex(f=>f.date===d);return p===x&&o.includes(d)?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}):""}}),e.jsx(_o,{tick:{fontSize:12},domain:[0,a],ticks:[2,4,6,8,10],tickFormatter:d=>`${d}s`,label:{value:u("Submit Time"),angle:-90,position:"insideLeft",style:{textAnchor:"middle"}}}),e.jsx(Wo,{content:e.jsx(r,{})}),e.jsx(vt,{type:"monotone",dataKey:"duration",stroke:"#3b82f6",strokeWidth:2,fill:"url(#durationGradient)",isAnimationActive:!1,connectNulls:!0})]})})})}):null},Xg=l.div``,ef=l.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
`,tf=l.div`
  padding: 0 7px;
`,nf=l.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${m.sm};
  background: none;
  border: none;
  color: ${h.gray600};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-bottom: 2px solid ${h.gray100};

  &:hover {
    color: ${h.gray800};
  }

  &.active {
    color: ${h.blue600};
    border-bottom-color: ${h.blue600};
  }

  &:focus {
    outline: none;
  }
`,sf=l.div`
  padding-top: ${m.md};
`,of=({tabs:t,activeTab:n,onTabChange:s})=>e.jsxs(Xg,{children:[e.jsx(ef,{children:t.map(i=>e.jsx(tf,{children:e.jsx(nf,{className:E(n===i.id&&"active"),onClick:()=>s(i.id),children:u(i.label)})},i.id))}),e.jsx(sf,{children:t.find(i=>i.id===n)?.content})]}),Ai={position:"top",animation:"fade",delay:[100,0]},rf=t=>{switch(t){case"success":return e.jsx(Jc,{});case"failed":return e.jsx(dt,{});case"pending":return e.jsx(es,{});default:return e.jsx(es,{})}},af=({test:t,formId:n,onDelete:s,showNotifications:i})=>{const o=Lg({screenshot:t.screenshot,beforeSubmitScreenshot:t.beforeSubmitScreenshot,testId:t.id}),r=g.useRef(null),a=Ct(r),c=t.dateAttempted;return e.jsxs("tr",{ref:r,children:[e.jsx("td",{className:"no-break",children:t.id}),e.jsx("td",{className:"no-break",title:c,children:c}),e.jsx("td",{className:"no-break",children:e.jsxs(xt,{$status:t.totalStatus,$size:"sm",children:[e.jsx(gn,{$size:"lg"}),u(t.totalStatus?.toUpperCase())]})}),e.jsx("td",{className:"no-break",children:e.jsxs(Hg,{children:[e.jsx(qg,{$status:t.status,children:e.jsx(_a,{children:rf(t.status)})}),t.screenshot&&e.jsx(xe,{title:u("View Screenshot"),...Ai,children:e.jsx(Kg,{onClick:o,children:e.jsx(yg,{})})}),t.submissionDuration!==0&&e.jsx(xe,{title:u(`Submit time is ${t.submissionDuration} seconds`,{duration:t.submissionDuration.toFixed(2)}),...Ai,children:e.jsxs(Qg,{children:[t.submissionDuration.toFixed(1),"s"]})})]})}),i&&e.jsx("td",{children:t?.totalNotifications?t.dateCompleted?e.jsx(xe,{html:e.jsx(uo,{children:e.jsxs(po,{children:[e.jsxs(Wg,{children:[e.jsxs(Oa,{children:[e.jsx("div",{className:"label",children:u("Enabled")}),e.jsx("div",{className:"value",children:t.totalNotifications})]}),e.jsxs(Oa,{children:[e.jsx("div",{className:"label",children:u("Received")}),e.jsx("div",{className:"value",children:t.notifications?.length||0})]})]}),e.jsx(_g,{children:t.notifications?.map((d,p)=>e.jsx(Ug,{children:d.type},p))})]})}),position:"top",theme:"light",animation:"fade",arrow:!0,duration:100,distance:10,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsxs(xt,{$status:t.notifications?.length>=t.totalNotifications?"success":"failed",$size:"sm",style:{cursor:"pointer"},children:[t.notifications?.length||0,"/",t.totalNotifications]})}):e.jsx(Vg,{children:e.jsx(_a,{children:e.jsx(es,{})})}):e.jsx(xt,{$status:"inactive",$size:"sm",children:"N/A"})}),e.jsx("td",{className:"no-break",children:t?.totalResponse&&e.jsx(Ag,{children:e.jsx(Rg,{children:t.totalResponse})})}),e.jsx("td",{children:e.jsx(xe,{title:u("Delete Test"),...Ai,children:e.jsx(Tn,{active:a,onClick:()=>s({formId:n,testId:t.id})})})})]})},lf=({groups:t})=>{const n=t.slice(0,30);if(n.length===0)return e.jsx(Og,{children:u("No test results available for the last 30 days.")});const s=Math.max(...n.map(i=>i.tests.length),1);return e.jsx(Bg,{children:n.map((i,o)=>e.jsx(cf,{group:i,maxTests:s,isCurrentDay:o===0},i.date))})},cf=({group:t,maxTests:n,isCurrentDay:s})=>{const i=g.useRef(null),o=Ct(i),r=x=>e.jsxs(uo,{children:[e.jsx(Dg,{children:e.jsxs(xt,{$status:x.totalStatus,$size:"sm",children:[e.jsx(gn,{$size:"md"}),u(x.totalStatus?.toUpperCase())]})}),e.jsxs(po,{children:[e.jsxs("div",{className:"test-id",children:["Test: ",x.id]}),e.jsx("div",{className:"test-date",children:x.dateAttempted}),x.totalResponse&&e.jsx("div",{className:"test-response",children:x.totalResponse})]})]}),a=100/n,c=t.tests||[],d=s?n-c.length:0;if(t.isInactive)return e.jsx(Ba,{ref:i,children:e.jsx(xe,{html:e.jsx(uo,{children:e.jsxs(po,{children:[e.jsx("div",{children:u("No tests on this day")}),e.jsx("div",{className:"test-date",children:t.date})]})}),position:"top",theme:"light",animation:"fade",arrow:!0,duration:100,distance:10,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsx(Ii,{$status:"inactive",$height:100,$offset:0,$isLast:!0,$isHovering:o,$isPending:!1})})});const p=[...c].reverse();return e.jsxs(Ba,{ref:i,children:[p.map((x,f)=>e.jsx(xe,{html:r(x),position:"bottom",theme:"light",animation:"fade",duration:100,distance:-15,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsx(Ii,{$status:x.totalStatus,$height:a,$offset:f*a,$isLast:f===p.length-1&&d===0,$isHovering:o,$isPending:!1},x.id)},x.id)),d>0&&Array.from({length:d}).map((x,f)=>e.jsx(Ii,{$status:"inactive",$height:a,$offset:(p.length+f)*a,$isLast:f===d-1,$isHovering:o,$isPending:!0},`pending-${f}`))]})},df=()=>{const{formTestsQuery:t}=_1(),[n,s]=Ho(),i=Number(n.get("page"))||1,[o,r]=ie.useState(null),[a,c]=ie.useState("testResults"),{data:d,isLoading:p,isFetching:x,refetch:f}=t,b=100;if(p||x)return e.jsx(Km,{});if(d?.error)return e.jsx(Tm,{children:d.error?.message});if(!d||!d.tests)return e.jsx(Mi,{children:e.jsx(Ra,{children:e.jsx("p",{children:u("Form Monitor is not enabled for this form.")})})});if(d?.stats?.total===0&&d?.fmFormStats?.enabled)return e.jsx(Mi,{children:e.jsx(Ra,{children:e.jsx("p",{children:u("This form is awaiting its first scan. This could take a few minutes.")})})});const j=L=>{s({page:String(L)}),window.scrollTo({top:0,behavior:"smooth"})},y=d.tests.flatMap(L=>L.tests),w=y.length,v=Math.ceil(w/b),$=(i-1)*b,C=$+b,F=y.slice($,C),N=e.jsx(Fg,{children:e.jsxs(Eg,{children:[e.jsx(Pa,{children:u(`Of the ${d.stats?.total||0} tests that have occurred in the last 30 days, ${d.stats?.failed||0} ${d.stats?.failed===1?"test has":"tests have"} failed for this form.`)}),e.jsx(lf,{groups:d.tests})]})}),M=e.jsx(Zg,{groups:d.tests}),z=[{id:"testResults",label:"Test Results",content:N},{id:"submitTimes",label:"Form Submit Times",content:M}];return e.jsxs(Mi,{children:[e.jsx(of,{tabs:z,activeTab:a,onTabChange:c}),e.jsxs(Tg,{children:[e.jsxs(Ng,{children:[e.jsx("h3",{children:u("Detailed Results")}),e.jsx(Pa,{children:u(`A total of ${d.stats?.total||0} tests have been conducted for this form.`)})]}),e.jsxs(Pg,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Test ID")}),e.jsx("th",{children:u("Date")}),e.jsx("th",{children:u("Status")}),e.jsx("th",{children:u("Form Submit")}),d.notifications?.enabled&&e.jsx("th",{children:u("Notifications")}),e.jsx("th",{children:u("Response")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:F.map(L=>e.jsx(af,{test:L,formId:d.formId,onDelete:r,showNotifications:d.notifications?.enabled},L.id))})]})]}),w>b&&e.jsxs(zg,{children:[e.jsxs(Mg,{"aria-label":"test results pagination",children:[e.jsx(Da,{className:"prev-page",onClick:()=>j(i-1),disabled:i===1,title:u("Previous Page")}),e.jsx(Da,{className:"next-page",onClick:()=>j(i+1),disabled:i===v,title:u("Next Page")})]}),e.jsxs(Ig,{children:[u("Showing")," ",$+1,"-",Math.min(C,w)," ",u("of")," ",w," ",u("tests")]})]}),o&&e.jsx(Bd,{formId:o.formId,testId:o.testId,onClose:()=>r(null),onSuccess:()=>{f()}})]})},ho="freeform-builder-tabs",xo=new Set,_d=t=>t?JSON.parse(sessionStorage.getItem(ho)||"{}")[t]||{}:{},uf=(t,n)=>{const s=JSON.parse(sessionStorage.getItem(ho)||"{}");sessionStorage.setItem(ho,JSON.stringify({...s,[t]:n}))},pf=(t,n)=>_d(t)[n]??null,hf=()=>{xo.forEach(t=>{t()})},xf=t=>(xo.add(t),()=>{xo.delete(t)}),We=t=>{const{formId:n}=V(),s=g.useSyncExternalStore(xf,()=>pf(n,t)),i=g.useCallback(o=>{n&&(uf(n,{..._d(n),[t]:o??null}),hf())},[n,t]);return{lastTab:s,setLastTab:i}},ts=(t,n)=>{n===void 0&&(t>1?(n=t,t=1):(n=t,t=0));const s=[];for(let i=t;i<=n;i++)s.push(i);return s},mf=(t,n,s)=>{const i={};return t.forEach(o=>{const r=o[n];let a;a=o[s],i[r]=a}),i},Ha=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,rr=l.div`
  flex: 1;

  background: ${h.white};
  padding: ${m.xl};
  overflow-y: auto;
  width: calc(100% - 300px);

  ${Q};

  div[class^='ControlWrapper-'] {
    div[class^='CheckboxWrapper-'] {
      align-items: start;

      div[class^='CheckboxItem-'] {
        padding-top: 4px;
      }
    }
  }
`,ar=l.h1`
  display: flex;

  width: 100%;
  padding: 0 0 ${m.md};
  margin: 0;
`,gf=l.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: ${m.md};

  width: 100%;

  &:empty {
    height: 50px;

    &:before {
      content: 'No settings available for this section.';
      font-style: italic;
      color: ${h.gray200};
    }
  }
`,lr=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
`,mo=l.button`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${m.sm};

  padding: ${m.sm} ${m.md};
  border-radius: ${S.lg};

  color: ${h.gray700};
  fill: currentColor;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${h.white};
    background-color: ${h.gray500};
  }

  &.errors {
    color: ${h.error};
  }

  &.active.errors {
    color: ${h.white};
    background-color: ${h.error};
  }

  &:hover:not(.active) {
    background-color: ${h.gray100};
  }
`,qa=l.div`
  width: 18px;
  height: 18px;
`,ff=l.div`
  border-bottom: solid 1px ${h.gray200};
  margin: ${m.lg} 0;
`,Qa=l.p`
  font-size: 0.75rem;
  color: ${h.gray400};
  padding: 0 ${m.md};
  margin: 0 0 ${m.xs};
`,Ka=l.a`
  color: ${h.gray400};
  text-decoration: ${t=>t.href?"underline":"none"};
  font-weight: ${t=>t.href?600:400};

  ${({href:t})=>t&&ne`
      &:hover {
        color: ${h.gray500};
        text-decoration: none;
      }
    `}

  ${({href:t})=>!t&&ne`
      &:hover {
        text-decoration: none;
        cursor: text;
      }
    `}
`,Wd=l.div`
  display: flex;
  height: 100%;
  background: ${h.white};
`,bf=()=>e.jsxs(Wd,{children:[e.jsx(De,{children:e.jsx(Qt,{baseColor:h.gray200,highlightColor:h.gray300,children:ts(5).map(t=>e.jsx(mo,{children:e.jsx(k,{width:200},t)},t))})}),e.jsxs(rr,{children:[e.jsx(ar,{children:e.jsx(k,{width:100})}),ts(7).map(t=>e.jsxs("div",{style:{width:"100%"},children:[e.jsx(k,{width:Ha(120,300)}),e.jsx(k,{width:`${Ha(70,90)}%`,height:8}),e.jsx(k,{height:30})]},t))]})]}),jf=()=>{const{ownership:t}=P(Pe.current);return t?e.jsxs(e.Fragment,{children:[e.jsx(ff,{}),e.jsxs(lr,{children:[e.jsxs(Qa,{children:[t.created.user?e.jsxs(e.Fragment,{children:[u("Created by")," ",e.jsx(Ka,{href:t.created.user.url,target:"_blank",children:t.created.user.name})]}):u("Created")," ",u("at"),":",e.jsx("br",{})," ",t.created.datetime]}),e.jsxs(Qa,{children:[t.updated.user?e.jsxs(e.Fragment,{children:[u("Last Updated by")," ",e.jsx(Ka,{href:t.updated.user.url,target:"_blank",children:t.updated.user.name})]}):u("Last Updated")," ",u("at"),":",e.jsx("br",{})," ",t.updated.datetime]})]})]}):null},fn=t=>t?!!Object.entries(t).length:!1,yf=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M160 64c-17.7 0-32 14.3-32 32l0 320c0 11.7-3.1 22.6-8.6 32L432 448c26.5 0 48-21.5 48-48l0-304c0-17.7-14.3-32-32-32L160 64zM64 480c-35.3 0-64-28.7-64-64L0 160c0-35.3 28.7-64 64-64l0 32c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32L96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 304c0 44.2-35.8 80-80 80L64 480zM384 112c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zM160 304c0-8.8 7.2-16 16-16l256 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l256 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16zm32-144l128 0 0-96-128 0 0 96zM160 120c0-13.3 10.7-24 24-24l144 0c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24l0-112z"})}),vf=()=>{const t=I.limitations,n=te(),{setLastTab:s}=We("settings"),{sectionHandle:i}=V(),o=I.metadata.craft.is5,r=P(Pe.errors),{data:a}=Gt();if(!a)return null;const c=[];return a.forEach(d=>{d.properties.forEach(p=>{fn(r?.[d.handle]?.[p.handle])&&(c.includes(p.section)||c.push(p.section))})}),e.jsxs(De,{$lean:!0,children:[e.jsxs(lr,{children:[a.map(d=>d.sections.filter(p=>t.can(`settings.tab.${p.handle}`)).map(p=>e.jsxs(mo,{onClick:()=>{s(p.handle),n(`${p.handle}`)},className:E(i===p.handle&&"active",c.includes(p.handle)&&"errors"),children:[e.jsx(qa,{dangerouslySetInnerHTML:{__html:O.sanitize(p.icon)}}),u(p.label)]},p.handle))),o&&e.jsxs(mo,{onClick:()=>{s(Bs),n(Bs)},className:E(i===Bs&&"active"),children:[e.jsx(qa,{children:e.jsx(yf,{})}),u("Usage in Elements")]})]}),e.jsx(jf,{})]})},Bs="usage",wf=()=>{const t=I.limitations,{sectionHandle:n}=V(),s=te(),{lastTab:i,setLastTab:o}=We("settings"),r=st(""),{data:a,isFetching:c}=Gt();return g.useEffect(()=>{i&&s(i)},[s,i]),g.useEffect(()=>{if(!n&&!i){const d=a?.[0]?.sections.filter(p=>t.can(`settings.tab.${p.handle}`))?.[0];d&&(o(d.handle),s(`${d.handle}`))}},[a,n,i,s,o]),!a&&c?e.jsx(bf,{}):e.jsxs(Wd,{children:[e.jsx(q,{id:"settings",label:u("Settings"),url:r.pathname}),e.jsx(vf,{}),e.jsx(jt,{})]})},Ud=l.div`
  position: relative;
  width: 100%;
`,$f=l(_.div)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;

  box-shadow: ${re.panel};

  pointer-events: none;

  &.active {
    pointer-events: all;
  }
`,cr=l.div`
  cursor: pointer;

  input,
  select,
  textarea {
    pointer-events: none;
  }
`,it=l.div`
  width: 100%;
  min-width: 800px;

  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: ${m.lg};

  box-shadow: ${re.box};
  border-radius: ${S.lg};
  background: ${h.gray050};
`,dr=l.div`
  max-height: 600px;
  overflow-x: hidden;
  overflow-y: auto;

  ${Q};
`,Qe=({preview:t,onEdit:n,onAfterEdit:s,excludeClassNames:i=[],children:o})=>{const[r,a]=g.useState(void 0),c=g.useRef(null),d=g.useRef(null),p=g.useRef(r),{editorAnimation:x}=td({wrapper:c.current,editor:d.current,isEditing:r});$t({callback:()=>{a(!1)},isEnabled:r,refObject:d,excludeClassNames:["tagify__dropdown","dropdown-rollout","elementselectormodal",...i]});const f=()=>{a(!1)},b=f0();return os(()=>a(!1),!!r),g.useEffect(()=>{p.current&&r===!1&&s?.(),p.current=r},[r,s]),e.jsxs(Ud,{ref:c,children:[e.jsx(nd,{children:e.jsx($f,{style:{zIndex:b,pointerEvents:r?"initial":"none",...x},className:E(r&&"active","editable-content"),ref:d,children:typeof o=="function"?o(r,f):o})}),e.jsx(cr,{onClick:()=>{a(!0),n?.()},children:t})]})},Ae={all:Z(t=>t.layout.fields,t=>t),count:Z(t=>t.layout.fields,t=>t.length),one:t=>Z(n=>n.layout.fields,n=>n.find(s=>s.uid===t)),hasErrors:Z(t=>t.layout.fields,t=>t.some(n=>n.errors!==void 0)),inRow:t=>Z(n=>n.layout.fields,n=>n.filter(s=>s.rowUid===t.uid).sort((s,i)=>(s.order??0)-(i.order??0)))},Cf=t=>P(Ae.all).filter(i=>t.availableFieldTypes.includes("*")?!0:t.availableFieldTypes.includes(i.typeClass)).map(i=>i.properties.handle),kf=l.div`
  display: flex;
  align-items: center;
  gap: ${m.md};

  mark {
    padding: 0 ${m.xs};
    border-radius: ${S.lg};
    background: ${h.gray200};
  }
`,Sf=l.div`
  .tagify__input {
    min-height: 80px;
    background-color: #fff;
    line-height: 2.2;
  }

  .tagify {
    --tag-bg: ${h.gray500};
    --tag-hover: ${h.gray600};
    --tag-text-color: ${h.white};
    --tags-border-color: ${h.gray500};
    --tag-remove-bg: ${h.red500};
    --tag-remove-btn-color: ${h.white};
    --tag-pad: 0.2em 0.4em;
  }

  .sr-only-value {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`,Lf=l.ul`
  min-width: 25%;
`;ne`
  .field-selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-selection__input {
    position: relative;
  }

  .field-selection__input input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.4;
    background: var(--input-bg);
    color: var(--text-color);
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-color-alpha);
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }

  .field-selection__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .field-selection__suggestion {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--hover-bg);
    }

    &.field-selection__suggestion--selected {
      background: var(--primary-color);
      color: white;
    }
  }

  .field-selection__suggestion-label {
    font-weight: 500;
  }

  .field-selection__suggestion-type {
    font-size: 12px;
    color: var(--text-muted);
    margin-left: 8px;
  }

  .field-selection__selected-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .field-selection__tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: var(--primary-color-alpha);
    color: var(--primary-color);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .field-selection__tag-remove {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  }

  .field-selection__help-text {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .field-selection__error {
    color: var(--error-color);
    font-size: 12px;
    margin-top: 4px;
  }
`;const Hd=(t,n)=>{const s=t.match(/field:([a-zA-Z0-9_]+)/g);if(!s||s.length===0)return t;const i=s.map(o=>o.replace("field:",""));return n==="<mark>...</mark>"?i.map(o=>`<mark>${o}</mark>`).join(", "):i.map(o=>`[[${o}]]`).join(", ")},Ff=({value:t,property:n,updateValue:s})=>{const[i,o]=g.useState(""),r=Cf(n),a=g.useRef(null),c=g.useCallback(p=>{s(p.detail.tagify.DOM.input.textContent.replace(/\u200B/g,"").replace(/\s+/g," ").trim())},[s]),d=p=>{if(!p)return;const x=a.current.createTagElem({value:p});a.current.injectAtCaret(x);const f=a.current.insertAfterTag(x,"");a.current.placeCaretAfterNode(f)};return g.useEffect(()=>{o(Hd(t))},[t]),e.jsxs(it,{children:[e.jsxs(kf,{children:[e.jsx(Lf,{children:e.jsx(de,{emptyOption:u("Insert Field"),options:r.map(p=>({value:p,label:p})),onChange:d,value:""})}),e.jsxs("span",{children:["or type ",e.jsx("mark",{children:"@"})," to search on field handles"]})]}),e.jsx(Sf,{children:e.jsx(uc,{autoFocus:!1,tagifyRef:a,settings:{pattern:/@/,enforceWhitelist:!0,editTags:!1,pasteAsTags:!0,duplicates:!0,dropdown:{enabled:0,includeSelectedTags:!0},templates:{tag:function(p){return`
                <tag
                  title="${p.value}"
                  contenteditable="false"
                  spellcheck="false"
                  class="tagify__tag"
                  ${this.getAttributes(p)}
                >
                <x title="remove tag" class="tagify__tag__removeBtn"></x>
                  <div>
                    <p class="tagify__tag-text">
                      <span class="sr-only-value">field:</span>${p.value}</p>
                  </div>
                </tag>`}},whitelist:r},onChange:c,value:i})})]})},kt=l.div`
  position: absolute;
  top: calc(50% - 10px);
  left: 0;
  right: 0;

  opacity: 1;
  transition: opacity 0.2s ease-out;

  color: ${h.gray200};
  font-size: 16px;
  font-weight: bold;
  font-style: italic;
  text-align: center;
`,Jt=l.div`
  position: relative;

  &:after {
    content: attr(data-edit);
    pointer-events: none;

    position: absolute;
    left: 30px;
    top: calc(50% - 10px);

    width: 200px;

    opacity: 0;
    transition: opacity 0.2s ease-out;

    ${_e};
    color: ${h.gray300};
    font-size: 11px;
    text-align: center;
  }

  &:hover {
    &:after {
      opacity: 0.5;
    }

    ${kt} {
      opacity: 0;
    }
  }
`;l.div`
  display: grid;
  grid-template-columns: 60% 40%;

  margin-bottom: ${m.md};

  ${_e};
  font-size: 11px;
`;const Zt=l.div`
  height: 170px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: 0 ${m.md};

  background: ${h.white};
  box-shadow: ${re.box};
  border-radius: ${S.lg};

  ${Q};
`,ur=l.div`
  position: relative;

  display: grid;
  grid-template-columns: auto 100px;
  gap: 10px;

  justify-items: stretch;
  align-items: center;

  border-bottom: 1px solid ${h.gray100};

  &:after {
    content: attr(data-title);

    position: absolute;
    left: calc(100% - 105px);
    bottom: -4px;

    padding: 0 5px;
    background: ${h.white};

    ${_e};
    font-size: 8px;
    line-height: 8px;
  }

  > div {
    white-space: nowrap;
    overflow: hidden;

    padding: 7px ${m.xs} 7px 0;

    &:last-child {
      padding-right: 0;
    }
  }
`,bn=l.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${h.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`,Ef=l(Zt)`
  padding: ${m.sm};

  mark {
    padding: ${m.xs} ${m.sm};
    border-radius: ${S.lg};
    background: ${h.gray100};
  }
`,Tf=({value:t})=>e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(Ef,{children:[!t&&e.jsx(kt,{children:u("Not configured yet")}),e.jsx("div",{style:{lineHeight:"2.0"},dangerouslySetInnerHTML:{__html:O.sanitize(Hd(t,"<mark>...</mark>"))}})]})}),Nf=({value:t,property:n,errors:s,updateValue:i})=>e.jsx(W,{property:n,errors:s,children:e.jsx(Qe,{preview:e.jsx(Tf,{value:t}),children:e.jsx(Ff,{value:t,property:n,updateValue:i})})}),qd=(t,n,s)=>{let i=!0;return t.forEach(o=>{new Function(...Object.keys(n),"context",`return ${o}`)(...Object.values(n),s)||(i=!1)}),i},dn=(t,n)=>{const s=n.split(".");let i=t;for(const o of s){if(i===void 0)return;i=i[o]}return i},zf=({value:t,property:n,errors:s,updateValue:i})=>{const{source:o,optionValue:r,optionLabel:a,filters:c,emptyOption:d}=n,x=ac().getState(),f=dn(x,o),b=[];return f.forEach((j,y)=>{qd(c,j)&&b.push({label:a?dn(j,a):j,value:r?dn(j,r):y})}),e.jsx(W,{property:n,errors:s,children:e.jsx(de,{value:t,onChange:i,emptyOption:d,options:b})})},Qd={all:["craft-asset-previews"],byIds:t=>[...Qd.all,{ids:t}]},Mf=t=>B({queryKey:Qd.byIds(t),queryFn:()=>T.get(`api/assets?ids=${t.join(",")}`).then(n=>n.data),staleTime:1/0,gcTime:1/0,enabled:t?.length>0}),pr=({actionLabel:t,multiSelect:n,sources:s="*",criteria:i,limit:o,value:r,onUpdate:a})=>{const{data:c,isFetching:d}=Mf(r),p=g.useCallback(()=>{Craft.createElementSelectorModal("craft\\elements\\Asset",{multiSelect:o!==1||n,sources:s,criteria:i,storageKey:"freeform-asset-selection",onSelect:j=>{const w=j.map($=>$.id).slice(0,o).filter($=>!r?.includes($)),v=[...r||[],...w];a(v)}})},[a,n,i,o,s,r]),x=g.useCallback(j=>{a(r.filter(y=>y!==j))},[a,r]),f=o===void 0||r?.length===void 0||r?.length<o,b=c===void 0&&d&&r?.length>0;return e.jsxs("div",{className:"elementselect",children:[e.jsxs("ul",{className:"elements chips chips-small",children:[b&&r.map((j,y)=>e.jsx("li",{className:"element small",children:e.jsxs("div",{className:"chip small element",children:[e.jsx("div",{className:"thumb",children:e.jsx(k,{width:30,height:20})}),e.jsx("div",{className:"chip-content",children:e.jsx(k,{width:Af(y)})})]})},`skeleton-${j}`)),c?.map(j=>e.jsx("li",{className:"element small removable",children:e.jsxs("div",{className:"chip small element removable",children:[e.jsx("div",{className:"thumb",children:e.jsx("img",{src:j.thumbUrl,alt:j.title,width:30,height:20})}),e.jsxs("div",{className:"chip-content",children:[e.jsx("div",{className:"element-label",children:e.jsx("a",{className:"label-link",href:j.editUrl,target:"_blank",rel:"noreferrer",children:j.title})}),e.jsx("div",{className:"chip-actions",children:e.jsx(Rf,{type:"button",title:"Remove",onClick:()=>x(j.id)})})]})]})},j.id))]}),f&&e.jsx("div",{className:"flex",children:e.jsx("button",{type:"button",className:"btn add icon",onClick:p,children:u(t||"Add an asset")})})]})},If=[80,100,90,70,120],Af=t=>If[t]||100,Rf=l.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`,Pf=({value:t,property:n,errors:s,updateValue:i})=>{const{criteria:o,multiSelect:r,actionLabel:a,limit:c}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(pr,{actionLabel:a,criteria:o,limit:c,multiSelect:r,value:t,onUpdate:i})})},xs=(t,n=500)=>{const[s,i]=g.useState(t);return g.useEffect(()=>{const o=setTimeout(()=>i(t),n);return()=>clearTimeout(o)},[t,n]),s},ms=({label:t,onClick:n,disabled:s=!1,className:i})=>e.jsx(Df,{className:i,children:e.jsx(Bf,{type:"button",className:"btn add icon",onClick:n,disabled:s,children:u(t)})}),Df=l.div`
  width: 100%;
  display: flex;
  justify-content: center;

  background: transparent;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-top: none;
  border-bottom-left-radius: ${S.lg};
  border-bottom-right-radius: ${S.lg};
`,Bf=l.button`
  width: 100%;
  padding: 6px 9px;

  background: ${h.white};
  border-radius: 4px;

  text-align: center;
  cursor: pointer;

  &:before {
    margin-right: 6px;
  }

  &:hover {
    background: ${h.gray050};
  }

  &:focus {
    outline: none;
    box-shadow: var(--inner-focus-ring);
  }

  &:disabled {
    background: #00000004;
    color: ${h.gray300};
    cursor: not-allowed;
  }
`,Of=l.div`
  font-style: italic;
  font-size: 12px;
  line-height: 18px;
  padding-top: 6px;
  color: ${h.gray300};
`,Xt=({children:t})=>e.jsx(Of,{children:t}),gs=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"})}),Nn=(t,n)=>{const s=g.useRef([]),[i,o]=g.useState(0),[r,a]=g.useState(0),c=g.useCallback(x=>f=>{if(f.key==="Enter"&&x?.onEnter){f.preventDefault(),x.onEnter(f);return}if(f.key==="Backspace"&&x?.onDelete&&f.target.value.length===0){f.preventDefault(),x.onDelete(f);return}let b=i,j=r;const y=s.current?.[i]?.[r],w=y instanceof HTMLInputElement||y instanceof HTMLTextAreaElement,v={start:!0,end:!0,position:0};if(w){const F=y.selectionStart;v.start=F===0,v.end=F===y.value.length,v.position=F}let $;if(f.key==="ArrowUp"&&i>0&&b--,f.key==="ArrowDown"&&i<t-1&&b++,f.key==="ArrowLeft"&&r>0&&v.start&&($=!0,j--),f.key==="ArrowRight"&&r<n-1&&v.end&&($=!1,j++),b===i&&j===r)return;b!==i&&o(b),j!==r&&a(j);const C=s.current?.[b]?.[j];C?.focus(),(C instanceof HTMLInputElement||C instanceof HTMLTextAreaElement)&&(f.preventDefault(),$!==void 0?C.setSelectionRange($?C.value.length:0,$?C.value.length:0):C.setSelectionRange(v.position,v.position))},[t,n,i,r]),d=(x,f)=>{o(x),a(f),s.current?.[x]?.[f]?.focus()},p=(x,f,b)=>{s.current[f]||(s.current[f]=[]),s.current[f][b]=x};return{activeCell:`${i}:${r}`,setActiveCell:d,setCellRef:p,keyPressHandler:c}},Kd=l.nav`
  position: relative;

  display: grid;
  grid-template-columns: 300px max-content 1fr max-content;
  align-items: center;

  height: 50px;
  flex: 0 0 50px;

  box-sizing: border-box;
  overflow-x: hidden;
`,Vd=l.h1`
  position: relative;
  margin: 0;
`,Gd=l.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: ${h.gray700};
`,fs=l.div`
  display: flex;
  align-self: flex-end;

  background-color: ${h.gray050};
  border-radius: ${S.lg} ${S.lg} 0 0;
  box-shadow:
    inset 0 -1px 0 0 rgba(154, 165, 177, 0.25),
    0 0 0 1px rgba(154, 165, 177, 0.25);

  a {
    display: flex;
    align-items: center;

    height: 49px;
    padding: 0 ${m.xl};

    white-space: nowrap;

    color: var(--light-text-color);
    border-radius: ${S.md} ${S.md} 0 0;

    &:hover {
      text-decoration: none;
      background-color: rgba(154, 165, 177, 0.15);

      &:not(.active) {
        &:not(:first-child) {
          border-top-left-radius: 0;
        }

        &:not(:last-child) {
          border-top-right-radius: 0;
        }
      }
    }

    &.active {
      background: ${h.white};
      color: ${h.gray700};
      box-shadow:
        inset 0 2px 0 ${h.gray500},
        0 0 0 1px rgba(51, 64, 77, 0.1),
        0 2px 12px rgba(205, 216, 228, 0.5) !important;
    }

    &.errors {
      position: relative;
      color: ${h.error};

      ${Zo};
    }

    > span[data-icon] {
      position: relative;
      left: 5px;
    }
  }
`,Yd=l.div`
  display: flex;
  align-items: center;
  justify-self: end;
  gap: ${m.md};
`,_f=l.button``,Wf=l.a`
  display: inline-flex;
  align-items: center;
  justify-self: start;
  width: max-content;
  font-size: 13px;
  white-space: nowrap;
  text-decoration: none;

  margin-block: 0;
  margin-inline: 2px;
  margin-left: ${m.sm};
  min-height: var(--input-height);
  padding-block: 4px;
  padding: 5px 10px;

  border: 1px solid rgba(154, 165, 177, 0.35);
  border-radius: var(--radius-md);
  background: rgba(154, 165, 177, 0.08);
  color: var(--link-color);

  &:hover {
    text-decoration: none;
    border-color: rgba(154, 165, 177, 0.6);
    background: rgba(154, 165, 177, 0.14);
  }
`,Uf=l.span`
  color: ${h.gray700};
  font-size: 9px;
  margin-left: ${m.xs};
  font-weight: bold;
  transform: translateY(-4px);
  display: inline-block;
  line-height: 1;
`;l.div`
  display: flex;
  align-items: center;
  gap: 4px;

  padding: 0 8px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
`;l.div`
  display: flex;
  align-items: center;

  input:first-child {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
`;const Jd=l.button`
  width: 20px;
  height: 20px;

  padding: 2px;
  margin: 0;
  border: 0;

  &:before {
    content: 'plus';

    color: ${h.gray500};

    font-family: Craft;
    font-size: 15px;
    font-weight: 100;
    line-height: 15px;
  }
`;l(Jd)`
  right: 20px;

  &:before {
    content: 'plus';
  }
`;l(Jd)`
  &:before {
    content: 'minus';
  }
`;l.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 5px;

  padding: 0 8px;

  label {
    display: block;
  }
`;const Hf=l(fs)`
  flex: 1;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${m.md} 1px 0;
  box-shadow: ${re.bottom};

  ${Q};

  a {
    cursor: pointer;

    display: flex;
    gap: 5px;

    user-select: none;
  }
`,qf=l.span`
  display: block;

  max-width: 100px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Qf=l.div`
  display: flex;
  align-items: flex-end;
  gap: ${m.sm};
  width: 100%;
  padding-inline: ${m.md};
`,Kf=l.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: 34px;
  height: 34px;
  margin-bottom: 8px;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${S.md};

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`,Vf=l.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 2px;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${S.sm};
  background: rgba(51, 64, 77, 0.08);
  color: ${h.gray500};

  &:hover {
    color: ${h.gray700};
    background: rgba(51, 64, 77, 0.2);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`,Gf=l.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: auto;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${S.sm};
  background: rgba(51, 64, 77, 0.08);
  color: ${h.gray500};
  cursor: move;

  &:hover {
    color: ${h.gray700};
    background: rgba(51, 64, 77, 0.2);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`,Yf=l.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${m.sm};

  padding-top: ${m.sm};
`,Zd=l(it)`
  gap: 0;
  padding: 0;
`,bs=l(dr)`
  border-radius: ${S.lg};
  background-color: white;
`,Jf=l(Qf)`
  padding: 0 ${m.lg};

  background: ${h.gray050};
  box-shadow: ${re.bottom};
`,Zf=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: ${m.lg};
`,js=l.table`
  width: 100%;

  thead {
    background-color: ${h.gray050};
    border: 1px solid red;
    border-radius: 5px 5px 0 0;

    th {
      padding: 6px;
      padding-inline: 10px !important;
      margin: 0;

      background-color: ${h.gray050};
      border: 1px solid ${h.hairline};
    }
  }
`,Qs=l.tr``,ue=l.td`
  width: ${({$tiny:t,$width:n})=>t?"32px":n?`${n}px`:"auto"};

  padding: ${({$tiny:t})=>t?"6px 9px !important":"0 !important"};

  border: 1px solid rgba(0, 0, 0, 0.1);

  label {
    display: none;
  }
`,ot=l.input`
  width: 100%;
  height: 34px;

  padding: 6px 9px;

  background: ${h.white};

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }

  &::placeholder {
    color: ${h.gray200};
  }

  &:disabled {
    background: #00000004;
    color: ${h.gray300};
  }
`;l.select`
  height: 34px;

  padding: 6px 9px;

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }
`;const Bt=l.button`
  padding: 1px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &.handle {
    cursor: move;
  }

  &:disabled {
    cursor: not-allowed;
    color: lightgray;
  }

  > svg {
    fill: currentColor;
  }
`,Et=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
`,Xf=l(it)`
  gap: 0;
  padding: 0;
`,e4=l(fs)`
  width: 100%;
  overflow: hidden;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${m.md} ${m.md} 0;
  box-shadow: ${re.bottom};

  ${Q};

  a {
    cursor: pointer;
    user-select: none;
  }
`,t4=l.div`
  padding: ${m.md};

  background: ${h.white};
`,n4=l(dr)``,s4=l.div`
  position: relative;

  padding: ${m.sm} ${m.md};

  font-family: monospace;

  background: ${h.gray050};
  border: 1px solid ${h.hairline};
  border-bottom: none;
  border-radius: ${S.lg} ${S.lg} 0 0;
`,Xd=l.span`
  color: ${h.teal700};
`,eu=l.span`
  color: ${h.gray300};
`,Ks=l.span`
  &:before {
    content: '"';
    color: ${h.gray300};
  }
`,tu=l.span`
  color: ${h.red300};
`,nu=t=>{const n=[];return t.forEach(([s,i])=>{if(s=s===null?"":s,i=i===null?"":i,!s&&i&&(s=i,i=""),!(!s&&!i)){if(i===""||i===null){n.push([String(s),void 0]);return}Array.isArray(i)&&(i=i.join(" ")),n.push([String(s),String(i)])}}),n},i4=(t,n,s)=>{const i=n?.[t]||[];return{...n,[t]:[...i.slice(0,s+1),["",""],...i.slice(s+1)]}},Va=(t,n,s,i)=>{const o={...i,[n]:[...i[n]]};return o[n][t]=s,o},o4=(t,n,s)=>({...s,[n]:[...s[n].filter((i,o)=>o!==t)]}),r4=t=>{const n={};return Object.entries(t).forEach(([s,i])=>{n[s]=i.filter(([o,r])=>!!o||!!r)}),n},a4=({tab:t,attributes:n})=>{const s=n.find(([i])=>i.toLowerCase()==="tag")?.[1]||t.previewTag;return e.jsxs(s4,{children:["<",s,nu(n).filter(([i])=>i!=="tag").map(([i,o],r)=>e.jsxs("span",{children:[e.jsxs(Xd,{children:[" ",i]}),!!o&&e.jsxs(e.Fragment,{children:[e.jsx(eu,{children:"="}),e.jsx(Ks,{}),e.jsx(tu,{children:o}),e.jsx(Ks,{})]})]},r))," />"]})},l4=({property:t,attributes:n,updateValue:s})=>{const i=t.tabs||[],[o,r]=g.useState(i.at(0)),a=Object.entries(n),[c,d]=a.find(([y])=>y===o.handle)||[o.handle,[]],{activeCell:p,setActiveCell:x,setCellRef:f,keyPressHandler:b}=Nn(d.length,2);if(g.useEffect(()=>{x(0,0)},[o?.handle]),!c||!d)return null;const j=(y,w,v)=>{x(v!==void 0?v+1:y,w),s(i4(c,n,v!==void 0?v:d.length-1))};return e.jsxs(Xf,{children:[e.jsx(e4,{children:t.tabs?.map(y=>e.jsx("a",{className:E(y===o&&"active"),onClick:()=>r(y),children:u(y.label)},y.handle))}),e.jsxs(t4,{children:[e.jsx(a4,{tab:o,attributes:d}),e.jsx(n4,{children:e.jsx(js,{children:e.jsxs("tbody",{children:[!d.length&&e.jsxs(Qs,{children:[e.jsx(ue,{children:e.jsx(ot,{type:"text",placeholder:u("Attribute"),onFocus:()=>{j(0,0)}})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",placeholder:u("Value"),onFocus:()=>{j(0,1)}})})]}),d.map(([y,w],v)=>e.jsxs(Qs,{children:[e.jsx(ue,{children:e.jsx(ot,{type:"text",value:String(y),placeholder:u("Attribute"),autoFocus:p===`${v}:0`,ref:$=>f($,v,0),onFocus:()=>x(v,0),onKeyDown:b({onEnter:$=>{j($.shiftKey?v:d.length,0,$.shiftKey?v:void 0)}}),onChange:$=>{s(Va(v,c,[$.target.value,w],n))}})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",value:String(w),placeholder:u("Value"),autoFocus:p===`${v}:1`,ref:$=>f($,v,1),onFocus:()=>x(v,1),onKeyDown:b({onEnter:$=>{j($.shiftKey?v:d.length,1,$.shiftKey?v:void 0)}}),onChange:$=>{s(Va(v,c,[y,$.target.value],n))}})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Bt,{tabIndex:-1,onClick:()=>{s(o4(v,c,n)),x(Math.max(v-1,0),0)},children:e.jsx(gs,{})})})]},v))]})})}),d.length>0&&e.jsx(ms,{label:"Add an attribute",onClick:()=>j(d.length,0,d.length-1)}),e.jsx("br",{}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})]})},c4=l.div`
  min-height: 160px;
  max-height: 260px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: ${m.sm} ${m.md};

  background: ${h.white};
  box-shadow: ${re.box};
  border-radius: ${S.lg};

  ${Q};
`,su=l.div`
  ${_e};
  font-size: 10px;
`,d4=l.ul`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: ${m.xs};

  margin-top: ${m.xs};
`,u4=l.li`
  padding: 1px 6px;

  font-family: monospace;
  font-size: 12px;

  background: ${h.gray100};
  color: ${h.gray800};
  border-radius: ${S.lg};
`,p4=l.div`
  &:not(:last-child) {
    padding-bottom: 10px;
    margin-bottom: 10px;
    box-shadow: ${re.bottom};
  }

  &.empty {
    ${su} {
      &:after {
        content: 'empty';

        padding: 2px 8px;
        margin-left: 10px;

        font-style: italic;

        background-color: ${h.gray050};
        border-radius: ${S.lg};
      }
    }
  }
`,h4=({tab:t,attributes:n})=>{const s=nu(n);return e.jsxs(p4,{className:E(!s.length&&"empty"),children:[e.jsx(su,{children:u(t.label)}),!!s.length&&e.jsx(d4,{children:s.map(([i,o],r)=>e.jsxs(u4,{children:[e.jsx(Xd,{children:i}),!!o&&e.jsxs(e.Fragment,{children:[e.jsx(eu,{children:"="}),e.jsx(Ks,{}),e.jsx(tu,{children:o}),e.jsx(Ks,{})]})]},r))})]})},x4=({property:t,attributes:n})=>e.jsx(c4,{children:t.tabs?.map(s=>e.jsx(h4,{tab:s,attributes:n[s.handle]||[]},s.handle))}),Ga=t=>{const n={};for(const s in t)n[s]=Object.entries(t[s]);return n},Ya=t=>{const n={};for(const s in t){n[s]={};for(const[i,o]of t[s])n[s][i]=o}return n},m4=({value:t,property:n,updateValue:s})=>{const{size:i}=ir(),[o,r]=g.useState(Ga(t)),a=xs(o,1e3);g.useEffect(()=>{const d=Ya(a);Ds(d,t)||s(d)},[a,s,t]),g.useEffect(()=>{const d=Ga(t);r(p=>Ds(d,p)?p:d)},[t]);const c=e.jsx(Qe,{preview:e.jsx(x4,{property:n,attributes:o}),onAfterEdit:()=>{const d=Ya(r4(o));Ds(d,t)||s(d)},children:e.jsx(l4,{property:n,attributes:o,updateValue:r})});return i==="small"?c:e.jsx(W,{property:n,children:c})},go=l.div`
  display: block;

  width: 18px;
  height: 18px;

  inset-inline-start: calc(50% - 9px);
  inset-block-start: 2px;

  border: 0 solid #e5e7eb;
  border-radius: 9px;

  background-color: ${h.white};
  box-shadow: inset 0 0 0 1px var(--_lightswitch-border-color);

  transition: transform 0.2s ${Ko.bounce.easeOut};

  &:before {
    content: '';

    position: absolute;

    width: 10px;
    height: 12px;

    box-sizing: border-box;
    inset-block-start: 50%;
    inset-inline-start: 50%;

    transform: translateX(-50%) translateY(-50%);
  }
`,g4=l.div`
  position: relative;
  cursor: pointer;

  width: 34px;
  padding: 2px;

  border-radius: 11px;
  border: none;
  background-image: linear-gradient(to right, var(--gray-400), var(--gray-400));
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);

  transition: background-color 0.2s ${Ko.easeOut};

  &.craft-5_8 {
    --_lightswitch-border-color: var(
      --lightswitch-border-color,
      hsl(from var(--input-border-color) h s l/80%)
    );

    box-shadow: inset 0 0 0 1px var(--_lightswitch-border-color);
    background-image: linear-gradient(
      to right,
      var(--gray-200),
      var(--gray-200)
    );

    transition: background-image 0.1s linear;
  }

  &.on {
    background-image: linear-gradient(
      to right,
      var(--enabled-color),
      var(--enabled-color)
    );

    &.craft-5_8 {
      --_lightswitch-border-color: oklch(
        from var(--bg-enabled) calc(l - 0.1) c h
      );

      background-image: linear-gradient(
        to right,
        var(--bg-enabled),
        var(--bg-enabled)
      );
    }

    ${go} {
      transform: translateX(12px);
    }

    &.craft-5_8 {
      ${go} {
        &:before {
          background-color: var(--enabled-color);
          mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3C!--! Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2024 Fonticons, Inc.--%3E%3Cpath d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z'/%3E%3C/svg%3E");
          mask-repeat: none;
        }
      }
    }
  }

  &.readonly {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.error {
    background-image: linear-gradient(
      to right,
      var(--error-color),
      var(--error-color)
    );
  }
`,en=({enabled:t,readOnly:n,errors:s,onClick:i})=>{const{is:o}=I.metadata.craft;return e.jsx(g4,{className:E(t&&"on",s&&"error",n&&"readonly",o.atLeast("5.8.0")&&"craft-5_8"),onClick:()=>{n||i?.(!t)},children:e.jsx(go,{})})},si=l.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: ${m.sm};

  label {
    color: ${h.gray550};
    font-weight: bold;
  }
`,iu=l.div`
  padding: 0 !important;
`,f4=l.div``,jn=({value:t,property:n,errors:s,context:i,updateValue:o})=>{const r=n.flags?.includes("readonly")||n.flags?.includes("as-readonly-in-instance");return e.jsx(W,{property:n,errors:s,context:i,preContent:e.jsx(si,{children:e.jsx(iu,{children:e.jsx(en,{enabled:t,readOnly:r,onClick:a=>o(a),errors:s})})})})},ou=(t=!0)=>B({queryKey:["autosuggest","env"],queryFn:()=>T.get("/api/autosuggest/env").then(n=>n.data),enabled:t,staleTime:1/0,gcTime:1/0}),b4=t=>!!t,j4=()=>{const{data:t}=ou();return g.useMemo(()=>{const n=[{label:u("Yes"),value:"true",icon:e.jsx("span",{className:"status enabled","aria-hidden":"true"})},{label:u("No"),value:"false",icon:e.jsx("span",{className:"status white","aria-hidden":"true"})}],s=t?.map(o=>({label:o.label,children:o.data.map(r=>({label:r.name,value:r.name,hint:r.hint,icon:e.jsx("span",{className:E("status",b4(r.hint)?"enabled":"white"),"aria-hidden":"true"})}))}))??[];return[...n,...s]},[t])},y4=({children:t})=>e.jsxs(v4,{className:"notice has-icon",children:[e.jsx("span",{className:"icon","aria-hidden":"true"}),e.jsx("span",{className:"visually-hidden",children:"Tip: "}),e.jsx("span",{children:t})]}),v4=l.p`
  margin-top: 5px;
`,w4="This can be set to an environment variable with a boolean value (`yes`/`no`/`true`/`false`/`on`/`off`/`0`/`1`).",$4=({value:t,updateValue:n,property:s,errors:i,context:o})=>{const r=u(w4),a=yd(r),{data:c,isFetching:d}=ou(),p=j4();return["","0","no","off"].includes(String(t).toLowerCase())?t="false":["1","yes","on"].includes(String(t).toLowerCase())&&(t="true"),e.jsxs(W,{property:s,errors:i,context:o,children:[e.jsx(de,{value:t,options:p,onChange:x=>n(x),loading:d&&!c,showSelectedIcon:!0,showHints:!0}),e.jsx(y4,{children:a})]})},C4=l.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;

  width: 100%;
  padding-top: ${m.sm};
`,k4=l.button`
  display: block;
  flex: 1;

  padding: ${m.xs} ${m.md};

  background-color: ${h.gray100};
  box-shadow: ${re.right};
  box-sizing: border-box;

  &.active {
    color: ${h.white};
    background-color: ${h.gray500};
  }

  &:first-child {
    border-top-left-radius: ${S.lg};
    border-bottom-left-radius: ${S.lg};
  }

  &:last-child {
    border-top-right-radius: ${S.lg};
    border-bottom-right-radius: ${S.lg};

    box-shadow: none;
  }
`,hr=({value:t,options:n,onClick:s})=>{const i=[];return n.forEach((o,r)=>{"value"in o&&i.push(e.jsx(k4,{className:E(o.value===t&&"active"),onClick:()=>s(o.value),children:o.label},r))}),e.jsx(C4,{children:i})},S4=({value:t,property:n,errors:s,updateValue:i})=>{const{options:o}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(hr,{value:t,options:o,onClick:r=>i(r)})})},L4=l.div`
  display: flex;
  align-items: center;
  gap: ${m.md};

  mark {
    padding: 0 ${m.xs};
    border-radius: ${S.lg};
    background: ${h.gray200};
  }
`,F4=l.div`
  .tagify__input {
    min-height: 80px;
    background-color: #fff;
    line-height: 2.2;
  }

  .tagify {
    --tag-bg: ${h.gray500};
    --tag-hover: ${h.gray600};
    --tag-text-color: ${h.white};
    --tags-border-color: ${h.gray500};
    --tag-remove-bg: ${h.red500};
    --tag-remove-btn-color: ${h.white};
    --tag-pad: 0.2em 0.4em;
  }

  .sr-only-value {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`,E4=l.ul`
  min-width: 25%;
`,T4="Supported Operators Reference Guide",N4=[{title:"Arithmetic",items:[{name:"Addition",operator:"+"},{name:"Subtraction",operator:"-"},{name:"Multiplication",operator:"*"},{name:"Division",operator:"/"},{name:"Square Root",operator:"sqrt()"}]},{title:"Numeric",items:[{name:"Range",operator:".."}]},{title:"Bitwise",items:[{name:"AND",operator:"&"},{name:"OR",operator:"|"},{name:"XOR",operator:"^"}]},{title:"Ternary",items:[{name:"(a ? b : c)",operator:"?"}]},{title:"String",items:[{name:"Concatenation",operator:"~"}]},{title:"Logical",items:[{name:"Not",operator:"!, not"},{name:"And",operator:"&&, and"},{name:"Or",operator:"||, or"}]},{title:"Array",items:[{name:"Contains",operator:".."},{name:"Does not contain",operator:"not in"}]},{title:"Comparison",items:[{name:"Equal",operator:"=="},{name:"Identical",operator:"==="},{name:"Not equal",operator:"!="},{name:"Not identical",operator:"!=="},{name:"Less than",operator:"<"},{name:"Greater than",operator:">"},{name:"Less than or equal to",operator:"<="},{name:"Greater than or equal to",operator:">="}]}],z4={title:T4,operators:N4},M4=l.div`
  font-style: italic;
  font-weight: 500;
  font-size: 14px;
  color: ${h.gray400};
  break-inside: avoid;
`,I4=l.div`
  column-count: 4;
`,A4=l.div`
  font-size: 12px;
  break-inside: avoid;
  color: ${h.gray300};
  margin: 0 0 0.8rem;
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  > span {
    font-size: 14px;
    font-weight: 500;
  }
`,R4=l.div`
  display: flex;

  > mark {
    font-size: 12px;
    font-family: 'Courier New', Courier, monospace;
    padding: 0 ${m.xs};
    border-radius: ${S.md};
    background: ${h.gray100};
    color: ${h.gray500};
    margin-right: ${m.md};
    max-height: 20px;
  }
`,P4=()=>{const t=z4;return e.jsxs(e.Fragment,{children:[e.jsx(M4,{children:u(t.title)}),e.jsx(I4,{children:t.operators.map(n=>e.jsxs(A4,{children:[e.jsx("span",{children:u(n.title)}),n.items.map(s=>e.jsxs(R4,{children:[e.jsx("mark",{children:s.operator}),s.name&&e.jsx("span",{children:u(s.name)})]},s.operator))]},n.title))})]})},ru=(t,n)=>t.replace(/field:([a-zA-Z0-9_]+)/g,(s,i)=>n==="<mark>...</mark>"?`<mark>${i}</mark>`:`[[${i}]]`),D4=t=>P(Ae.all).filter(i=>t.availableFieldTypes.includes(i.typeClass)).map(i=>i.properties.handle),B4=({value:t,property:n,updateValue:s})=>{const[i,o]=g.useState(""),r=D4(n),a=g.useRef(null),c=g.useCallback(p=>{s(p.detail.tagify.DOM.input.textContent.replace(/\u200B/g,"").replace(/\s+/g," ").trim())},[s]),d=p=>{if(!p)return;const x=a.current.createTagElem({value:p});a.current.injectAtCaret(x);const f=a.current.insertAfterTag(x,"");a.current.placeCaretAfterNode(f)};return g.useEffect(()=>{o(ru(t))},[t]),e.jsxs(it,{children:[e.jsxs(L4,{children:[e.jsx(E4,{children:e.jsx(de,{emptyOption:u("Insert Field"),options:r.map(p=>({value:p,label:p})),onChange:d,value:""})}),e.jsxs("span",{children:["or type ",e.jsx("mark",{children:"@"})," to search on field handles"]})]}),e.jsx(F4,{children:e.jsx(uc,{autoFocus:!1,tagifyRef:a,settings:{pattern:/@/,enforceWhitelist:!0,editTags:!1,pasteAsTags:!0,duplicates:!0,dropdown:{enabled:0,includeSelectedTags:!0},templates:{tag:function(p){return`
                <tag
                  title="${p.value}"
                  contenteditable="false"
                  spellcheck="false"
                  class="tagify__tag"
                  ${this.getAttributes(p)}
                >
                <x title="remove tag" class="tagify__tag__removeBtn"></x>
                  <div>
                    <p class="tagify__tag-text">
                      <span class="sr-only-value">field:</span>${p.value}</p>
                  </div>
                </tag>`}},whitelist:r},onChange:c,value:i})}),e.jsx(P4,{})]})},O4=l(Zt)`
  padding: ${m.sm};

  mark {
    padding: ${m.xs} ${m.sm};
    border-radius: ${S.lg};
    background: ${h.gray100};
  }
`,_4=({value:t})=>e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(O4,{children:[!t&&e.jsx(kt,{children:u("Not configured yet")}),e.jsx("div",{style:{lineHeight:"2.0"},dangerouslySetInnerHTML:{__html:O.sanitize(ru(t,"<mark>...</mark>"))}})]})}),W4=({value:t,property:n,errors:s,updateValue:i})=>e.jsx(W,{property:n,errors:s,children:e.jsx(Qe,{preview:e.jsx(_4,{value:t}),children:e.jsx(B4,{value:t,property:n,updateValue:i})})}),Ja="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",au=(t=8)=>{let n="";const s=Ja.length;let i=0;for(;i<t;)n+=Ja.charAt(Math.floor(Math.random()*s)),i+=1;return n},lu=l.div`
  position: relative;

  padding-bottom: 5px;
  margin-bottom: 5px;
  font-style: italic;

  &:after {
    content: '';
    position: absolute;
    left: -5px;
    right: -5px;
    bottom: 0;

    display: block;
    height: 1px;

    box-shadow: ${re.bottom};
  }
`,U4=l.div`
  columns: ${({$columns:t})=>t||1};

  label {
    display: block;
    max-width: 100%;
    padding: 0 10px;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`,Za=[100,150,170,130],xr=({value:t,options:n,selectAll:s,loading:i,uniqueId:o,columns:r,emptyMessage:a,onUpdate:c})=>{const d=t.length===n?.length;return o||(o=au(6)),e.jsxs(e.Fragment,{children:[s&&e.jsxs(lu,{children:[e.jsx("input",{id:`${o}-all`,type:"checkbox",className:"checkbox",checked:d,onChange:()=>{c(d?[]:n.filter(p=>!("children"in p)).map(p=>p.value))}}),e.jsx("label",{htmlFor:`${o}-all`,children:u("Select All")})]}),!i&&!n?.length&&a&&e.jsx(cs,{instructions:a}),e.jsxs(U4,{$columns:r,children:[i&&Array.from({length:n?.length||4}).map((p,x)=>e.jsx(k,{width:Za[x%Za.length],height:15},x)),!i&&n?.map(p=>{if("children"in p)return null;const x=`${o}-${p?.label}`;return e.jsxs("div",{title:p.label,children:[e.jsx("input",{id:x,type:"checkbox",className:"checkbox",checked:t.includes(p.value),onChange:()=>{t.includes(p.value)?c(t.filter(f=>f!==p.value)):c([...t,p.value])}}),e.jsx("label",{htmlFor:x,children:p.label})]},p.value)})]})]})},H4=({value:t,property:n,errors:s,updateValue:i})=>{const{handle:o,options:r,selectAll:a,columns:c}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(xr,{value:t,selectAll:a,options:r,emptyMessage:u("No options available"),uniqueId:o,columns:c,onUpdate:i})})},q4=({value:t,language:n,updateValue:s})=>e.jsx(it,{children:e.jsx(cr,{children:e.jsx(pc,{height:500,value:t,defaultLanguage:n,onChange:s,onMount:()=>{document.body.classList.remove("underline-links")},options:{scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5}}})})}),Q4=l.pre`
  font-size: 10px;
`,K4=l(Zt)`
  padding: ${m.sm};
`,V4=({value:t})=>e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(K4,{children:[!t&&e.jsx(kt,{children:u("Not configured yet")}),e.jsx(Q4,{children:t})]})}),G4=({value:t,property:n,errors:s,updateValue:i})=>{const{language:o}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(Qe,{preview:e.jsx(V4,{value:t}),children:e.jsx(q4,{value:t,language:o,updateValue:i})})})},Y4=l.div`
  display: flex;
  align-items: center;
  gap: ${m.sm};
`,J4=l.input`
  width: 40px;
  min-width: 40px;
  height: 32px;
  padding: 0;
  border: 1px solid ${h.gray200};
  border-radius: ${S.sm};
  background: ${h.white};
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 3px;
  }

  &::-webkit-color-swatch {
    border: 0;
    border-radius: ${S.sm};
  }

  &::-moz-color-swatch {
    border: 0;
    border-radius: ${S.sm};
  }
`,Z4=l.input`
  width: 110px;
  min-width: 0;
  padding: 7px 10px;
  border: 1px solid ${h.gray200};
  border-radius: ${S.sm};
  background: ${h.white};
  color: ${h.gray800};
  font: inherit;

  &:focus {
    outline: 0;
    border-color: ${h.blue500};
    box-shadow: 0 0 0 1px ${h.blue500};
  }
`,X4="#000000",cu=({value:t,onChange:n})=>{const[s,i]=g.useState(()=>ks(t));g.useEffect(()=>{i(ks(t))},[t]);const o=c=>{const d=c.currentTarget.value.toLowerCase();i(d),n(d)},r=c=>{const d=c.currentTarget.value,p=du(d);if(p){i(p),n(p);return}i(d)},a=()=>{i(ks(t))};return e.jsxs(Y4,{children:[e.jsx(J4,{type:"color",value:ks(t),onChange:o}),e.jsx(Z4,{type:"text",value:s,maxLength:7,placeholder:"#RRGGBB",spellCheck:!1,onBlur:a,onChange:r})]})},e5=t=>`#${t.slice(1).split("").map(n=>n.repeat(2)).join("")}`,du=t=>{if(!t)return null;const n=t.trim(),s=n.startsWith("#")?n:`#${n}`;return/^#[0-9a-f]{3}$/i.test(s)?e5(s).toLowerCase():/^#[0-9a-f]{6}$/i.test(s)?s.toLowerCase():null},ks=t=>du(t)||X4,t5=({value:t,property:n,errors:s,updateValue:i,context:o})=>e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(cu,{value:t,onChange:i})}),uu=t=>e.jsx(R,{viewBox:"0 0 24 24",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h24v24h-24z"}),e.jsx("path",{d:"m8.547 19.767c2.399 1.065 5.256 1.007 7.703-.406 4.066-2.347 5.459-7.546 3.111-11.611l-.25-.433m-14.473 8.933c-2.347-4.065-.954-9.264 3.112-11.611 2.447-1.413 5.304-1.471 7.703-.406m-12.96 12.101 2.732.732.732-2.732m12.086-4.668.732-2.732 2.732.732",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2"})]})}),pu={spinner:Uo`
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
      animation-timing-function: cubic-bezier(.55, .055, .675, .19);
    }
    100% {
      transform: rotate(360deg);
    }
  `},n5=l.div`
  display: grid;
  grid-template-columns: auto 40px;
  gap: 5px;
`,hu=l.button`
  padding: 0;

  background-color: #dfe5ec !important;

  svg {
    width: 20px;
    height: 20px;
  }

  &[disabled] {
    background-color: #eef2f8 !important;

    svg {
      fill: ${h.gray300};

      animation: ${pu.spinner} 2s infinite;
      transform-origin: 50% 50%;
    }
  }
`,s5=l.div`
  position: relative;
`,i5=l(hu)`
  position: absolute;
  top: -20px;
  right: 0;

  width: 40px;
`,o5=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{formId:r}=V(),{handle:a,source:c,parameterFields:d}=n,p={formId:r};d&&Object.entries(d).forEach(([y,w])=>{p[w]=dn(o,y)});const{data:x,isFetching:f,isFetched:b,refetch:j}=B({queryKey:["dynamic-select",c,p],queryFn:()=>T.get(c,{params:p}).then(y=>y.data),staleTime:1/0,gcTime:1/0});return g.useEffect(()=>{f||!b||x!==void 0&&(Array.isArray(t)&&t.length>=0||i([]))},[x,b,f,i,t]),e.jsx(W,{property:n,errors:s,children:e.jsxs(s5,{children:[e.jsx(i5,{className:"btn",disabled:f,onClick:()=>{p.refresh="true",j(),delete p.refresh},children:e.jsx(uu,{})}),e.jsx(xr,{value:t,options:x,loading:f,emptyMessage:u("No options available"),uniqueId:a,onUpdate:i})]})})},r5=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{formId:r}=V(),{source:a,parameterFields:c,emptyOption:d}=n,p={formId:r};c&&Object.entries(c).forEach(([y,w])=>{p[w]=dn(o,y)});const{data:x,isFetching:f,isFetched:b,refetch:j}=B({queryKey:["dynamic-select",a,p],queryFn:()=>T.get(a,{params:p}).then(y=>y.data),staleTime:1/0,gcTime:1/0});return g.useEffect(()=>{if(!(f||!b)&&x!==void 0&&!sd(x,t))if(d){if(t==="")return;i("")}else{const y=id(x);if(y===t||y===void 0)return;i(y)}},[x,b,f,i,t,d]),e.jsx(W,{property:n,errors:s,context:o,children:e.jsxs(n5,{children:[e.jsx(de,{loading:f,value:t,onChange:i,emptyOption:d,options:x}),e.jsx(hu,{className:"btn",disabled:f,onClick:()=>{p.refresh="true",j(),delete p.refresh},children:e.jsx(uu,{})})]})})},a5=({value:t,property:n,errors:s,updateValue:i})=>{const o=P(Ae.all),r=Yt(),a=o.filter(c=>{if(!n.implements)return!0;const d=r(c.typeClass);return d?n.implements.some(p=>d.implements?.includes(p)):!1}).map(c=>({value:c.uid,label:c.properties.label}));return e.jsx(W,{property:n,errors:s,children:e.jsx(de,{onChange:i,value:t,options:a,emptyOption:n.emptyOption})})},l5=(t,n)=>s=>{const{uid:i}=t,o={};n.properties.forEach(r=>{const a=t.properties[r.handle];a?o[r.handle]=a:o[r.handle]=r.value}),s(be.batchEdit({uid:i,typeClass:n.typeClass,properties:o}))},c5={type:l5};var mr=(t=>(t.Checkboxes="Solspace\\Freeform\\Fields\\Implementations\\CheckboxesField",t.Checkbox="Solspace\\Freeform\\Fields\\Implementations\\CheckboxField",t.Dropdown="Solspace\\Freeform\\Fields\\Implementations\\DropdownField",t.Email="Solspace\\Freeform\\Fields\\Implementations\\EmailField",t.FileUpload="Solspace\\Freeform\\Fields\\Implementations\\FileUploadField",t.Hidden="Solspace\\Freeform\\Fields\\Implementations\\HiddenField",t.Html="Solspace\\Freeform\\Fields\\Implementations\\HtmlField",t.MultipleSelect="Solspace\\Freeform\\Fields\\Implementations\\MultipleSelectField",t.Number="Solspace\\Freeform\\Fields\\Implementations\\NumberField",t.Radios="Solspace\\Freeform\\Fields\\Implementations\\RadiosField",t.Textarea="Solspace\\Freeform\\Fields\\Implementations\\TextareaField",t.Text="Solspace\\Freeform\\Fields\\Implementations\\TextField",t.Calculation="Solspace\\Freeform\\Fields\\Implementations\\Pro\\CalculationField",t.Confirmation="Solspace\\Freeform\\Fields\\Implementations\\Pro\\ConfirmationField",t.Datetime="Solspace\\Freeform\\Fields\\Implementations\\DatetimeField",t.FileDragAndDrop="Solspace\\Freeform\\Fields\\Implementations\\Pro\\FileDragAndDropField",t.Image="Solspace\\Freeform\\Fields\\Implementations\\Pro\\ImageField",t.Cards="Solspace\\Freeform\\Fields\\Implementations\\Pro\\CardsField",t.Group="Solspace\\Freeform\\Fields\\Implementations\\Pro\\GroupField",t.Invisible="Solspace\\Freeform\\Fields\\Implementations\\Pro\\InvisibleField",t.OpinionScale="Solspace\\Freeform\\Fields\\Implementations\\Pro\\OpinionScaleField",t.Password="Solspace\\Freeform\\Fields\\Implementations\\Pro\\PasswordField",t.Phone="Solspace\\Freeform\\Fields\\Implementations\\Pro\\PhoneField",t.Rating="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RatingField",t.Regex="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RegexField",t.RichText="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RichTextField",t.Signature="Solspace\\Freeform\\Fields\\Implementations\\Pro\\SignatureField",t.Table="Solspace\\Freeform\\Fields\\Implementations\\Pro\\TableField",t.Website="Solspace\\Freeform\\Fields\\Implementations\\Pro\\WebsiteField",t))(mr||{});const d5=(t,n)=>(s,i)=>{u5(i(),s,t,n)},u5=(t,n,s,i)=>{const o=i.layoutUid,r=G();if(s.typeClass===mr.Group){const a=s.properties.layout,c=G(),d=t.layout.layouts.find(x=>x.uid===a);d&&n($n.add({...d,uid:c}));const p=t.layout.rows.filter(x=>x.layoutUid===a).sort((x,f)=>x.order-f.order);for(const x of p){const f=G();n(Ze.add({layoutUid:c,uid:f})),t.layout.fields.filter(b=>b.rowUid===x.uid).forEach(b=>{n(be.duplicate({uid:G(),rowUid:f,field:b}))})}n(Ze.add({layoutUid:o,uid:r,order:i?.order+1})),n(be.duplicate({uid:G(),rowUid:r,field:{...s,properties:{...s.properties,layout:c}}}));return}n(Ze.add({layoutUid:o,uid:r,order:i?.order+1})),n(be.duplicate({uid:G(),rowUid:r,field:s}))},p5=(t,n)=>t.order-n.order,et={current:t=>t.layout.pages.find(n=>n.uid===t.context.page),count:t=>t.layout.pages.length,all:Z(t=>t.layout.pages,t=>[...t].sort(p5)),one:t=>n=>n.layout.pages.find(s=>s.uid===t),pageIndex:t=>n=>n.layout.pages.findIndex(s=>s.uid===t)},ns={inLayout:Z(t=>t.layout.rows,(t,n)=>n,(t,n)=>[...t].filter(s=>s.layoutUid===n).sort((s,i)=>s.order-i.order))},bt={one:Z(t=>t.layout.layouts,(t,n)=>n,(t,n)=>t.find(s=>s.uid===n)),currentPageLayout:Z(t=>et.current(t),t=>t.layout.layouts,(t,n)=>n.find(s=>s.uid===t?.layoutUid)),pageLayout:Z(t=>t.layout.layouts,(t,n)=>n,(t,n)=>t.find(s=>s.uid===n)),cartographed:{layoutFieldList:Z(t=>t.layout.fields,(t,n)=>t.layout.layouts.find(s=>s.uid===n),t=>t,(t,n,s)=>{const i=ns.inLayout(s,n?.uid),o=[];return i.forEach(r=>{o.push(...t.filter(a=>a.rowUid===r.uid))}),o}),pageFieldList:Z(t=>t.layout.pages,t=>t.layout.layouts,t=>t.layout.rows,t=>t.layout.fields,(t,n,s,i)=>{const o=[];return t.forEach(r=>{const a=n.find(p=>p.uid===r.layoutUid),c=s.filter(p=>p.layoutUid===a?.uid).sort((p,x)=>p.order-x.order),d=[];c.forEach(p=>{d.push(...i.filter(x=>x.rowUid===p.uid))}),o.push({page:r.uid,fields:d})}),o}),fullLayoutList:Z(t=>t.layout.pages,t=>t.layout.layouts,t=>t.layout.rows,t=>t.layout.fields,(t,n,s,i)=>{const o=[];return t.forEach(r=>{const a=n.find(p=>p.uid===r.layoutUid),c=s.filter(p=>p.layoutUid===a?.uid).sort((p,x)=>p.order-x.order),d=[];c.forEach(p=>{const x=[];x.push(...i.filter(f=>f.rowUid===p.uid)),d.push(x)}),o.push(d)}),o}),fullLayoutList_:t=>{const n=et.all(t),s=[];return n.forEach(i=>{const o=t.layout.layouts.find(c=>c.uid===i.layoutUid),r=ns.inLayout(t,o?.uid),a=[];r.forEach(c=>{const d=[];t.layout.fields.filter(p=>p.rowUid===c.uid).forEach(p=>{d.push(p)}),a.push(d)}),s.push(a)}),s}}},ii=(t,n)=>{const s=[];t.layout.rows.forEach(i=>{t.layout.fields.filter(r=>r.rowUid===i.uid).length===0&&s.push(i.uid)}),s.forEach(i=>{n(Ze.remove(i))})},h5=t=>(n,s)=>{const{field:i,order:o}=t;let{layoutUid:r}=t;const a=G();r||(r=bt.currentPageLayout(s())?.uid),n(Ze.add({layoutUid:r,uid:a,order:o})),n(be.moveTo({uid:i.uid,rowUid:a,position:0})),ii(s(),n)},x5=(t,n,s)=>(i,o)=>{i(be.moveTo({uid:t.uid,rowUid:n.uid,position:s})),ii(o(),i)},m5={newRow:h5,existingRow:x5},g5=t=>(n,s)=>{if(I.editions.is(oe.Express)&&s().layout.fields.length>=I.limits.fields)return;const{fieldType:i,row:o}=t;let{layoutUid:r}=t;if(!r){const d=s();o?r=o.layoutUid:r=bt.currentPageLayout(d)?.uid}const a=G(),c=G();n(Ze.add({layoutUid:r,uid:c,order:o?.order})),n(be.add({fieldType:i,uid:a,rowUid:c}))},f5=t=>n=>{const{fieldType:s,row:i,order:o}=t,r=G();n(be.add({fieldType:s,uid:r,rowUid:i.uid,order:o}))},b5={newRow:g5,existingRow:f5},j5=t=>(n,s)=>{xu(s(),n,t),ii(s(),n)},xu=(t,n,s)=>{if(s.typeClass===mr.Group){const i=t.layout.layouts.find(r=>r.uid===s.properties.layout);if(!i)return;t.layout.rows.filter(r=>r.layoutUid===i.uid).forEach(r=>{t.layout.fields.filter(c=>c.rowUid===r.uid).forEach(c=>{xu(t,n,c)}),n(Ze.remove(r.uid))}),n($n.remove(i.uid))}n(be.remove(s.uid))},Oe={move:{newField:b5,existingField:m5},remove:j5,duplicate:d5,change:c5},y5=({property:t,context:n})=>{const s=H(),i=Yt(),{data:o}=tr(),r=n;return r?.typeClass?e.jsx(je,{value:r.typeClass,property:{type:K.Select,handle:"typeClass",label:u(t.label),instructions:u(t.instructions),options:o.filter(a=>a.visible!==!1).map(a=>({label:u(a.name),value:a.typeClass}))},updateValue:a=>{confirm(u("Are you sure? You might potentially lose important data."))&&s(Oe.change.type(r,i(a)))}}):null},v5=()=>null,w5=({value:t,property:n,errors:s,updateValue:i,autoFocus:o,context:r})=>{const{handle:a,min:c,max:d,unsigned:p,step:x=1}=n,f=n.flags?.includes("readonly")||n.flags?.includes("as-readonly-in-instance"),b=y=>{i(xa(y.target.value,{min:c,max:d,unsigned:p}))},j=y=>{i(xa(y.target.value))};return e.jsx(W,{property:n,errors:s,context:r,children:e.jsx("input",{id:a,type:"number",className:E("text","fullwidth",f&&["readonly","disabled"]),value:t??"",autoFocus:o,step:x,onChange:j,onBlur:b,readOnly:f})})},$5=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"})}),C5=t=>Y({opacity:t?1:0,transform:t?"rotate(0deg)":"rotate(-30deg)",config:{tension:500}}),k5=t=>Y({backgroundColor:t?h.gray050:h.white,config:{tension:500}}),S5=l.div`
  margin-top: -9px;
  margin-bottom: -9px;

  &.errors {
    span {
      color: ${h.red500};
    }
  }

  input {
    padding: 7.75px ${m.sm};
    font-size: 18px;
    font-weight: bold;

    margin-left: -9px;
  }
`,L5=l(_.button)`
  position: absolute;
  top: 0;
  right: -25px;

  opacity: 0;

  width: 20px;
  height: 20px;

  > svg {
    width: 100%;
    height: 100%;

    color: ${h.gray400};
  }
`;l(_.button)`
  position: absolute;
  top: 0;
  right: -50px;

  opacity: 0;

  width: 20px;
  height: 20px;

  > svg {
    width: 100%;
    height: 100%;

    color: ${h.gray400};
  }
`;const F5=l(_.h1)`
  cursor: pointer;

  min-height: 10px;

  margin: 0 0 0 -8px;
  padding: ${m.sm} 40px ${m.sm} ${m.sm};

  border: 0;
  border-radius: ${S.lg};

  > span {
    position: relative;
    display: inline-block;

    > span:empty:after {
      content: 'No Title';

      color: ${h.gray300};
      font-style: italic;
    }
  }
`,E5=({value:t,property:n,errors:s,updateValue:i})=>{const[o,r]=g.useState(!1),[a,c]=g.useState(!1),{handle:d}=n,p=g.useRef(null),x=k5(o),f=C5(o);return e.jsxs(S5,{className:E(s?.length>0&&"errors"),children:[a&&e.jsx("input",{id:d,ref:p,type:"text",className:"text fullwidth",value:t||"",onChange:b=>i(b.target.value),onBlur:()=>c(!1),onKeyDown:b=>{b.key==="Enter"&&c(!1)}}),!a&&e.jsx(F5,{style:x,onClick:()=>{c(!0),r(!1),setTimeout(()=>{p.current?.focus()},3)},onMouseEnter:()=>r(!0),onMouseLeave:()=>r(!1),children:e.jsxs("span",{children:[e.jsx("span",{children:t}),e.jsx(L5,{style:f,children:e.jsx($5,{})})]})}),e.jsx(ti,{errors:s})]})},T5=l.div`
  display: flex;
`,mu=l.input`
  width: 100%;
  --focus-ring: 0;
`,N5=l(mu)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
`,z5=l(mu)`
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`,M5=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const[r,a]=t||[null,null],c=o.properties?.allowNegative?null:0;return e.jsx(W,{property:n,errors:s,children:e.jsxs(T5,{children:[e.jsx("div",{children:e.jsx(N5,{id:"min",value:r===null?"":r,type:"number",min:c,className:"text",placeholder:"Min",onChange:({target:d})=>{const p=d.value!==""?Number(d.value):null;i([p,a])}})}),e.jsx("div",{children:e.jsx(z5,{id:"max",value:a===null?"":a,type:"number",min:c,className:"text",placeholder:"Max",onChange:({target:d})=>{const p=d.value!==""?Number(d.value):null;i([r,p])}})})]})})},I5=(t,n)=>[...t.slice(0,n+1),{id:au(6),label:""},...t.slice(n+1)],A5=l.li`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  padding: 12px 16px;

  background-color: ${h.white};
  border: 1px solid #eee;
  border-radius: 8px;

  &:hover {
    border-color: ${h.gray300};
  }
`,R5=l.textarea`
  // prevent resize of text area
  resize: none;
`,Xa=l.button`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 2px;

  fill: ${h.gray400};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    fill: ${h.blue500};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,P5=l.div`
  display: flex;
  align-items: center;
  gap: 4px;

  > span {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 18px;
    height: 18px;

    padding: 2px;

    border: 1px solid ${h.gray300};
    border-radius: 100%;

    font-size: 10px;

    &.filled {
      background-color: ${h.teal600};
      border: 1px solid ${h.teal600};
      color: ${h.white};
    }
  }
`,D5=l.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 8px;
`,B5=l.div`
  width: 100%;
  padding: 0;

  text-align: left;

  &.error {
    color: ${h.red500};
    fill: ${h.red700};
  }

  &.success {
    color: ${h.teal500};
    fill: ${h.teal500};
  }

  > span {
    display: flex;
    align-items: center;
    gap: 5px;

    font-size: 12px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  > div {
    padding: 3px 8px;

    font-size: 11px !important;

    background-color: ${h.red050};
    border: 1px solid ${h.red500};
    border-radius: 5px;
  }
`,O5=l.div`
  border: 1px solid ${h.inputBorder};
  border-radius: 3px;
`,_5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M448 96L416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L448 160C465.7 160 480 174.3 480 192L480 229.5C480 255 490.1 279.4 508.1 297.4L530.7 320L508.1 342.6C490.1 360.6 480 385 480 410.5L480 448C480 465.7 465.7 480 448 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L448 544C501 544 544 501 544 448L544 410.5C544 402 547.4 393.9 553.4 387.9L598.7 342.6C611.2 330.1 611.2 309.8 598.7 297.3L553.4 252C547.4 246 544 237.9 544 229.4L544 191.9C544 138.9 501 95.9 448 95.9zM192 96C139 96 96 139 96 192L96 229.5C96 238 92.6 246.1 86.6 252.1L41.4 297.4C28.9 309.9 28.9 330.2 41.4 342.7L86.7 388C92.7 394 96.1 402.1 96.1 410.6L96 448C96 501 139 544 192 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L192 480C174.3 480 160 465.7 160 448L160 410.5C160 385 149.9 360.6 131.9 342.6L109.3 320L131.9 297.4C149.9 279.4 160 255 160 229.5L160 192C160 174.3 174.3 160 192 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L192 96z"})}),W5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"})}),U5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M152 160C174.1 160 192 177.9 192 200L192 248C192 270.1 174.1 288 152 288L104 288C81.9 288 64 270.1 64 248L64 200C64 177.9 81.9 160 104 160L152 160zM344 288L296 288C273.9 288 256 270.1 256 248L256 200C256 177.9 273.9 160 296 160L344 160C366.1 160 384 177.9 384 200L384 248C384 270.1 366.1 288 344 288zM536 288L488 288C465.9 288 448 270.1 448 248L448 200C448 177.9 465.9 160 488 160L536 160C558.1 160 576 177.9 576 200L576 248C576 270.1 558.1 288 536 288zM536 480L488 480C465.9 480 448 462.1 448 440L448 392C448 369.9 465.9 352 488 352L536 352C558.1 352 576 369.9 576 392L576 440C576 462.1 558.1 480 536 480zM344 352C366.1 352 384 369.9 384 392L384 440C384 462.1 366.1 480 344 480L296 480C273.9 480 256 462.1 256 440L256 392C256 369.9 273.9 352 296 352L344 352zM152 480L104 480C81.9 480 64 462.1 64 440L64 392C64 369.9 81.9 352 104 352L152 352C174.1 352 192 369.9 192 392L192 440C192 462.1 174.1 480 152 480z"})}),H5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM404.4 276.7L324.4 404.7C320.2 411.4 313 415.6 305.1 416C297.2 416.4 289.6 412.8 284.9 406.4L236.9 342.4C228.9 331.8 231.1 316.8 241.7 308.8C252.3 300.8 267.3 303 275.3 313.6L302.3 349.6L363.7 251.3C370.7 240.1 385.5 236.6 396.8 243.7C408.1 250.8 411.5 265.5 404.4 276.8z"})}),q5=t=>{const[n,s]=g.useState(!1),{removeCard:i}=t,o=V5(t.card.metadata);return e.jsxs(A5,{children:[e.jsxs(D5,{children:[e.jsx(Xa,{onClick:()=>s(!n),className:E(n&&"active"),children:e.jsx(xe,{title:u("Custom Metadata"),delay:[500,0],children:e.jsxs(P5,{children:[e.jsx("span",{className:E(o>0&&"filled"),children:o}),e.jsx(_5,{})]})})}),e.jsx(Xa,{className:"drag-handle",title:u("Reorder Card"),children:e.jsx(U5,{})}),e.jsx(Tn,{active:!0,onClick:i,title:u("Remove Card")})]}),n&&e.jsx(K5,{...t}),!n&&e.jsx(Q5,{...t})]})},Q5=({card:t,updateCard:n})=>{const{label:s,value:i,assetId:o,description:r}=t;return e.jsxs(e.Fragment,{children:[e.jsx(Te,{label:"Image",children:e.jsx(pr,{criteria:{kind:["image"]},value:o?[o]:[],limit:1,onUpdate:a=>n({...t,assetId:a[0]??void 0})})}),e.jsx(Te,{label:"Title",children:e.jsx("input",{type:"text",className:"text fullwidth",value:s,onChange:a=>n({...t,label:a.target.value})})}),e.jsx(Te,{label:"Value",instructions:"Enter a value to use when this card is selected.",children:e.jsx("input",{type:"text",className:"text fullwidth",value:i,onChange:a=>n({...t,value:a.target.value})})}),e.jsx(Te,{label:"Description",children:e.jsx(R5,{rows:4,className:"text fullwidth",value:r,onChange:a=>n({...t,description:a.target.value})})})]})},K5=({card:t,updateCard:n})=>{const s=JSON.stringify(t.metadata,null,2),[i,o]=g.useState("pending"),[r,a]=g.useState(),[c,d]=g.useState(s),p=xs(c,1e3);return g.useEffect(()=>{d(x=>x===s?x:s)},[s]),g.useEffect(()=>{if(p){a(void 0),o("pending");try{const x=JSON.parse(p),f=JSON.stringify(x,null,2);if(o("success"),f===s)return;n({...t,metadata:x})}catch(x){o("error"),a(x instanceof Error?x.message:"Invalid JSON")}}},[p,s,n,t]),e.jsxs(e.Fragment,{children:[e.jsx(Te,{label:"Metadata",instructions:"Enter metadata in JSON format. Access it in your template with `card.metadata.yourProperty`",children:e.jsx(O5,{children:e.jsx(pc,{height:200,value:c,defaultLanguage:"json",onChange:x=>d(x),onMount:()=>{document.body.classList.remove("underline-links")},options:{folding:!1,glyphMargin:!1,renderLineHighlight:"none",minimap:{enabled:!1},lineNumbers:"on",lineNumbersMinChars:1,scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5}}})})}),i!=="pending"&&e.jsxs(B5,{className:i,children:[e.jsxs("span",{children:[i==="error"&&e.jsx(W5,{}),i==="error"&&"Invalid JSON",i==="success"&&e.jsx(H5,{}),i==="success"&&"JSON Valid"]}),!!r&&e.jsx("div",{className:"code",children:r})]})]})},V5=t=>Array.isArray(t)?t.length:t&&typeof t=="object"?Object.keys(t).length:typeof t=="boolean"||typeof t=="string"?1:0,G5=({onClick:t})=>e.jsx(Y5,{onClick:t,children:u("Add Card")}),Y5=l.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 10px;

  border: 2px dashed ${h.gray200};
  border-radius: 10px;

  text-align: center;
  font-size: 18px;
  color: ${h.gray400};

  user-select: none;

  &:hover {
    background-color: ${h.gray100};
  }
`,J5=l(it)`
  width: 60vw;
  min-width: 800px;
`,Z5=l(dr)``,X5=l.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`,e3=({value:t,property:n,updateValue:s,context:i})=>{const o=g.useRef(null),{updateTranslation:r,getTranslation:a,willTranslate:c}=Ce(i),d=c(n.handle),p=a(n.handle,t);return g.useEffect(()=>{if(!o.current)return;const x=Ne.create(o.current,{animation:150,ghostClass:"sortable-ghost",handle:".drag-handle",onEnd:f=>{const b=[...t],[j]=b.splice(f.oldIndex,1);b.splice(f.newIndex,0,j),s(b)}});return()=>{x.destroy()}},[t,s]),e.jsxs(J5,{children:[e.jsx(Z5,{children:e.jsxs(X5,{ref:o,children:[t.map((x,f)=>e.jsx(q5,{card:x,removeCard:()=>{const b=[...t];b.splice(f,1),s(b)},updateCard:b=>{if(d){const j=[...p];j[f]=b,r(n.handle,j)}else{const j=[...t];j[f]=b,s(j)}}},x.id)),e.jsx(G5,{onClick:()=>s(I5(t,t.length))})]})}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},gr=l.div`
  position: absolute;
  top: calc(50% - 15px);
  left: 0;
  right: 0;

  opacity: 1;
  transition: opacity 0.2s ease-out;

  color: ${h.gray200};
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  text-align: center;
`,t3=l.div`
  position: relative;

  &:after {
    content: attr(data-edit);
    pointer-events: none;

    position: absolute;
    left: 30px;
    top: calc(50% - 10px);

    width: 200px;

    opacity: 0;
    transition: opacity 0.2s ease-out;

    ${_e};
    color: ${h.gray300};
    font-size: 11px;
    text-align: center;
  }

  &:hover {
    &:after {
      opacity: 0.5;
    }

    ${gr} {
      opacity: 0;
    }
  }
`;l.div`
  display: grid;
  grid-template-columns: 60% 40%;

  margin-bottom: ${m.md};

  ${_e};
  font-size: 11px;
`;const n3=l.div`
  height: 200px;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: 0 ${m.md};

  background: ${h.white};
  box-shadow: ${re.box};
  border-radius: ${S.lg};

  ${Q};
`,s3=l.div`
  position: relative;

  display: grid;
  grid-template-columns: auto 100px;
  gap: 10px;

  justify-items: stretch;
  align-items: center;

  border-bottom: 1px solid ${h.gray100};

  &:after {
    content: attr(data-title);

    position: absolute;
    left: calc(100% - 105px);
    bottom: -7px;

    padding: 0 5px;
    background: ${h.white};

    ${_e};
    font-size: 8px;
  }

  > div {
    white-space: nowrap;
    overflow: hidden;

    padding: 7px ${m.xs} 7px 0;

    &:last-child {
      padding-right: 0;
    }
  }
`,i3=l.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${h.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`,fr=(t=[],n)=>B({queryKey:["assets","urls",t?.sort(),n],queryFn:()=>T.get(`/api/assets/urls?ids=${t.join(",")}&transform=${n||""}`).then(s=>s.data),staleTime:1/0,gcTime:1/0,enabled:t.length>0}),o3=l.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  min-height: 60px;
`,r3=l.li`
  display: grid;
  column-gap: 5px;
  row-gap: 0;
  grid-template-columns: 50px auto;
  grid-template-areas:
    'icon label'
    'icon description';

  padding: 5px;

  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: 5px;
`,a3=l.div`
  grid-area: icon;
  align-self: start;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${h.gray200};
  border-radius: 5px;
  overflow: hidden;
`,l3=l.div`
  grid-area: label;

  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
`,c3=l.div`
  grid-area: description;

  color: ${h.gray300};
  font-size: 12px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
`,d3=l.div`
  width: 20px;
  height: 20px;
  margin: 8px 0;

  svg {
    animation: spin 1s linear infinite;
    fill: ${h.gray400};
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`,u3=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 160C496 151.2 488.8 144 480 144L160 144zM96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256C206.3 256 192 241.7 192 224C192 206.3 206.3 192 224 192zM360 264C368.5 264 376.4 268.5 380.7 275.8L460.7 411.8C465.1 419.2 465.1 428.4 460.8 435.9C456.5 443.4 448.6 448 440 448L200 448C191.1 448 182.8 443 178.7 435.1C174.6 427.2 175.2 417.6 180.3 410.3L236.3 330.3C240.8 323.9 248.1 320.1 256 320.1C263.9 320.1 271.2 323.9 275.7 330.3L292.9 354.9L339.4 275.9C343.7 268.6 351.6 264.1 360.1 264.1z"})}),p3=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})}),h3=({cards:t,transform:n})=>{const s=t.map(r=>r.assetId).filter(Boolean),{data:i,isFetching:o}=fr(s,n);return e.jsxs(Ud,{"data-edit":u("Click to edit data"),children:[!t.length&&e.jsx(gr,{children:u("No cards yet. Click Add Card to create one.")}),e.jsx(o3,{children:t.map((r,a)=>e.jsxs(r3,{"data-title":"card",children:[e.jsx(a3,{children:e.jsx(x3,{assetUrl:i?.[r.assetId],loading:o})}),e.jsx(l3,{children:r.label||u("No title")}),e.jsx(c3,{children:r.description||u("No description")})]},a))})]})},x3=({assetUrl:t,loading:n})=>n?e.jsx(d3,{children:e.jsx(p3,{})}):t===void 0?e.jsx(u3,{}):e.jsx("img",{src:t.src,alt:t.title||u("No title")}),m3=({value:t,property:n,errors:s,updateValue:i,context:o})=>e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(Qe,{preview:e.jsx(h3,{cards:t,transform:o?.properties?.transform}),children:e.jsx(e3,{value:t,updateValue:i,property:n,context:o})})}),g3=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"})});var gu=(t=>(t.EmailMarketing="email-marketing",t.Crm="crm",t.Elements="elements",t.Captchas="captchas",t.PaymentGateways="payment-gateways",t.Webhooks="webhooks",t.Singles="single",t.Other="other",t.Ai="ai",t))(gu||{}),Ee=(t=>(t.Relation="relation",t.Custom="custom",t.Preset="preset",t))(Ee||{});const f3=t=>e.jsx(R,{viewBox:"0 0 576 512",...t,children:e.jsx("path",{d:"M266.2 4.7C273 1.6 280.5 0 288 0s15 1.6 21.8 4.7l217.4 97.5c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 251.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 153.9C38.6 149.3 32 139.2 32 128s6.6-21.3 16.8-25.9L266.2 4.7zM288 32c-3 0-6 .6-8.8 1.9L69.3 128l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-210-94.1C294 32.6 291 32 288 32zM48.8 358.1l45.9-20.6 39.1 17.5L69.3 384l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-64.5-28.9 39.1-17.5 45.9 20.6c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 507.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 409.9C38.6 405.3 32 395.2 32 384s6.6-21.3 16.8-25.9zM94.7 209.5l39.1 17.5L69.3 256l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-64.5-28.9 39.1-17.5 45.9 20.6c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 379.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 281.9C38.6 277.3 32 267.2 32 256s6.6-21.3 16.8-25.9l45.9-20.6z"})}),b3=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M64 496c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48H204.1c1.3 0 2.6 .1 3.9 .2V136c0 22.1 17.9 40 40 40H367.8c.2 1.3 .2 2.6 .2 3.9V448c0 26.5-21.5 48-48 48H64zM358.6 157.3c.9 .9 1.7 1.8 2.4 2.7H248c-13.3 0-24-10.7-24-24V22.9c1 .8 1.9 1.6 2.7 2.4L358.6 157.3zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V179.9c0-12.7-5.1-24.9-14.1-33.9L238.1 14.1c-9-9-21.2-14.1-33.9-14.1H64zm40 256c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104z"})}),fu=(t,n)=>{const{getState:s}=Vo(),i=Yt(),o=P(bt.cartographed.pageFieldList),r=P(et.all);return g.useMemo(()=>o.map(a=>({label:r.find(c=>c.uid===a.page)?.label,icon:e.jsx(b3,{}),children:a.fields.map(c=>{if(t?.includes(c.uid))return null;const d=i(c.typeClass);if(n?.includes(d?.type))return null;if(d?.type==="group"){const p=bt.cartographed.layoutFieldList(s(),c.properties.layout);return{label:c.properties.label,icon:e.jsx(f3,{}),children:p.map(x=>({label:x.properties.label,value:x.uid}))}}return{value:c.uid,label:c.properties.label}}).filter(Boolean)})),[o,r,t,n,i,s])},j3=({value:t,onChange:n})=>{const s=fu();return e.jsx(de,{options:s,emptyOption:u("Do not map this field"),value:t,onChange:n})},y3=t=>e.jsx(R,{viewBox:"0 0 640 512",...t,children:e.jsx("path",{d:"M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"})}),v3=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM184 72c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L184 72zm0 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-304 0zm0 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-304 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"})}),w3=t=>e.jsx(R,{viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"})}),$3=l.button`
  position: absolute;
  top: 0;
  right: 0;

  font-size: 16px;

  &[disabled] > svg {
    fill: ${h.gray300};

    animation: ${pu.spinner} 2s infinite;
    transform-origin: 50% 50%;
  }
`,C3=l.div`
  display: grid;
  align-items: center;
  gap: ${m.sm};

  grid-template-columns: auto min-content 400px;

  padding: 2px 0;

  > div:first-child {
    flex-grow: 1;
  }

  > div:last-child {
    flex-basis: 300px;
  }
`,k3=l.div`
  max-width: 1000px;
  max-height: 454px;

  overflow-y: auto;
  overflow-x: hidden;

  border: 1px solid rgb(205 216 228 / 50%);
  border-radius: 5px;

  padding: ${m.sm} ${m.lg};

  ${Q};
`,S3=l.div`
  position: relative;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;

    display: block;

    width: 100%;
    height: 1px;

    background-color: ${h.gray100};
  }

  > span {
    position: relative;
    z-index: 2;

    display: block;
    padding: 0 10px 0 0;
    width: fit-content;

    background-color: white;
  }

  &.required > span {
    &:after {
      content: '*';
      position: relative;
      right: -2px;

      color: ${h.error};
    }
  }
`,L3=l.div`
  display: flex;
`,Ss="8px",Ri=l.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 34px;
  height: 28px;

  fill: ${h.gray550};
  background-color: ${h.elements.dropdown};

  &.active {
    fill: ${h.gray050};
    background-color: ${h.gray550};
  }

  &:first-child {
    border-top-left-radius: ${Ss};
    border-bottom-left-radius: ${Ss};
  }

  &:last-child {
    border-top-right-radius: ${Ss};
    border-bottom-right-radius: ${Ss};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,F3=l.input`
  &::placeholder {
    color: ${h.gray250};
  }
`,E3=({sources:t,mapping:n,updateValue:s})=>{if(!n)return null;const i=(o,r,a)=>{s({...n,[o]:{type:r,value:a}})};return e.jsxs(k3,{children:[t.length===0&&e.jsx(Xt,{children:u("No data present")}),t.map(o=>{const r=n[o.id]??{type:Ee.Relation,value:""};return e.jsxs(C3,{children:[e.jsx(S3,{className:E(o.required&&"required"),children:e.jsx("span",{children:o.label})}),e.jsxs(L3,{children:[o.options?.length>0&&e.jsx(Ri,{title:u("Pre-defined options"),className:E(r.type===Ee.Preset&&"active"),onClick:()=>i(o.id,Ee.Preset),children:e.jsx(v3,{})}),e.jsx(Ri,{title:u("Twig code"),className:E(r.type===Ee.Custom&&"active"),onClick:()=>i(o.id,Ee.Custom),children:e.jsx(y3,{})}),e.jsx(Ri,{title:u("Freeform field"),className:E(r.type===Ee.Relation&&"active"),onClick:()=>i(o.id,Ee.Relation),children:e.jsx(w3,{})})]}),e.jsxs("div",{children:[r.type===Ee.Preset&&e.jsx(de,{value:r?.value,showValues:!0,emptyOption:u("Select an option"),onChange:a=>{i(o.id,Ee.Preset,a)},options:o.options.map(a=>({value:a.key,label:a.label}))}),r.type===Ee.Relation&&e.jsx(j3,{value:r?.value,onChange:a=>{i(o.id,Ee.Relation,a)}}),r.type===Ee.Custom&&e.jsx(F3,{type:"text",className:"text fullwidth code",placeholder:"e.g. {{ yourField }} {{ otherField }}",value:r?.value||"",onChange:a=>{i(o.id,Ee.Custom,a.target.value)}})]})]},o.id)})]})},T3=({value:t={},property:n,errors:s,updateValue:i,context:o})=>{const{formId:r}=V(),a={formId:r};n.parameterFields&&Object.entries(n.parameterFields).forEach(([x,f])=>{a[f]=dn(o,x)});const{data:c,isFetching:d,refetch:p}=B({queryKey:["field-mapping",n.source,a],queryFn:async()=>await T.get(n.source,{params:a}).then(f=>f.data),staleTime:1/0,gcTime:1/0});return g.useEffect(()=>{if(d||c===void 0)return;const x=c.map(j=>String(j.id)),f=Mt(t);let b=!1;Object.keys(t).forEach(j=>{x.includes(j)||(delete f[j],b=!0)}),b&&i(f)},[d,c,t,i]),e.jsxs(W,{property:n,errors:s,children:[e.jsx($3,{className:"btn",disabled:d,onClick:()=>{a.refresh="true",p(),delete a.refresh},children:e.jsx(g3,{})}),c&&e.jsx(E3,{sources:c,mapping:t,updateValue:i}),!c&&d&&e.jsxs("div",{children:[e.jsx(k,{width:"40%"}),e.jsx(k,{width:"35%"}),e.jsx(k,{width:"42%"})]})]})},tn=({value:t,onChange:n})=>e.jsx("div",{className:"select",children:e.jsxs("select",{value:t,onChange:s=>n?.(s.target.value),children:[e.jsx("option",{value:Be.Or,children:u("any")}),e.jsx("option",{value:Be.And,children:u("all")})]})}),N3=l.table`
  width: 100%;

  margin: 0;
  border-spacing: 0;
  border-collapse: separate;

  td {
    &:nth-child(1) {
      width: 25%;
    }

    &:nth-child(2) {
      width: 20%;
    }

    &:last-child {
      width: 20px;
    }
  }

  tbody {
    tr {
      td {
        padding: 0 !important;
        padding-top: 7px !important;
        padding-right: 7px !important;
        padding-bottom: 7px !important;
        border-bottom: 1px solid ${h.inputBorder};
        background-color: ${h.gray050};
      }

      td:first-child {
        padding-left: 7px !important;
        border-left: 1px solid ${h.inputBorder};
      }

      td:last-child {
        border-right: 1px solid ${h.inputBorder};
      }
    }

    tr:first-child {
      td {
        border-top: 1px solid ${h.inputBorder};
      }

      td:first-child {
        border-top-left-radius: ${S.lg};
        border-top: 1px solid ${h.inputBorder};
      }

      td:last-child {
        border-top: 1px solid ${h.inputBorder};
        border-top-right-radius: ${S.lg};
      }
    }

    tr:last-child {
      td {
        padding: 0 !important;
        background-color: ${h.white};

        .btn {
          border: 0 !important;
          border-radius: 0 !important;
          background-color: transparent !important;
        }
      }

      td:last-child {
        border-left: 1px dashed ${h.inputBorder};
        border-right: 1px dashed ${h.inputBorder};
        border-bottom: 1px dashed ${h.inputBorder};
        border-bottom-left-radius: ${S.lg};
        border-bottom-right-radius: ${S.lg};
      }
    }

    tr:first-child:last-child {
      td {
        border-top: 1px dashed ${h.inputBorder};
      }
    }
  }
`,bu=l.button`
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
    stroke-width: 3px;
    fill: #e5e7eb;
  }
`,un={one:t=>Z(n=>n.rules.fields.items,n=>n.find(s=>s.field===t)),isInCondition:t=>Z(n=>n.rules.fields.items,n=>n.rules.pages.items,n=>n.rules.submitForm.item,n=>n.rules.buttons.items,(n,s,i,o)=>n.some(r=>r.conditions.some(a=>a.field===t))||s.some(r=>r.conditions.some(a=>a.field===t))||i?.conditions.some(r=>r.field===t)||o.some(r=>r.conditions.some(a=>a.field===t))),usedByFields:t=>Z(n=>n.rules.fields.items,n=>n.filter(i=>i.conditions.some(o=>o.field===t)).map(i=>i.field)),hasRule:t=>Z(n=>n.rules.fields.items,n=>!!n.find(s=>s.field===t))},z3=({condition:t,onChange:n})=>{const{uid:s}=V(),i=P(un.usedByFields(s)),o=fu([...i,s],["html","rich-text","file","file-dnd","signature"]);return e.jsx(de,{options:o,emptyOption:"Choose field",value:t.field,onChange:n})},M3={[se.Equals]:u("is equal to"),[se.NotEquals]:u("does not equal"),[se.GreaterThan]:u("greater than"),[se.GreaterThanOrEquals]:u("greater than or equal to"),[se.LessThan]:u("less than"),[se.LessThanOrEquals]:u("less than or equal to"),[se.Contains]:u("contains"),[se.NotContains]:u("does not contain"),[se.StartsWith]:u("starts with"),[se.EndsWith]:u("ends with"),[se.IsEmpty]:u("is empty"),[se.IsNotEmpty]:u("is not empty"),[se.IsOneOf]:u("is one of"),[se.IsNotOneOf]:u("is not one of")},I3=({condition:t,onChange:n})=>{const{operator:s}=t;return e.jsx("div",{className:"select fullwidth",children:e.jsx(de,{value:s,onChange:i=>n?.(i),options:Object.entries(M3).map(([i,o])=>({value:i,label:o}))})})},A3=l.div`
  .tagify {
    --tag-bg: ${h.gray100};
    --tag-pad: 4px 7px;

    width: 100%;
    min-height: 2.125rem;
    padding: 5px 5px;

    box-sizing: border-box;
    background-color: ${h.white};

    border: 1px solid rgba(96, 125, 159, 0.25);
    border-radius: ${S.md};

    gap: 5px;

    &__tag {
      margin-inline: 0;
      margin-block: 0;
    }

    &__input {
      margin: 0;
      min-width: 1px !important;
    }
  }
`,ju=({value:t,options:n=[],onChange:s,allowCustom:i,placeholder:o})=>{const r=g.useRef(null);return e.jsx(A3,{children:e.jsx(W1,{tagifyRef:r,placeholder:o,settings:{tagTextProp:"name",enforceWhitelist:!i,whitelist:n,dropdown:{mapValueTo:"name",enabled:0}},value:t,onChange:a=>s(a.detail.tagify.getCleanValue().map(c=>c.value))})})};var yu=(t=>(t.Options="options",t.GeneratedOptions="generatedOptions",t))(yu||{}),mt=(t=>(t.Group="group",t.Rating="rating",t.OpinionScale="opinion-scale",t))(mt||{});const R3=({fieldUid:t,onChange:n,value:s})=>e.jsxs("div",{className:"checkbox-wrapper",children:[e.jsx("input",{id:`${t}-rule-checkbox`,type:"checkbox",className:"checkbox",onChange:i=>n?.(i.target.checked?"1":""),checked:!!s}),e.jsx("label",{htmlFor:`${t}-rule-checkbox`,children:u(s?"Checked":"Unchecked")})]});var Re=(t=>(t.Custom="custom",t.Elements="elements",t.Predefined="predefined",t))(Re||{});const P3=[I.limitations.can("layout.options.custom")&&{value:"custom",label:u("Custom")},I.limitations.can("layout.options.elements")&&{value:"elements",label:u("Elements")},I.limitations.can("layout.options.predefined")&&{value:"predefined",label:u("Predefined")}].filter(Boolean),oi=(t,n)=>{const{getOptionTranslations:s}=Ce(t);let i,o;if(n?.type===mt.OpinionScale)i={source:Re.Custom,options:t.properties.scales.map(x=>({label:x[1]||x[0],value:x[0]})),useCustomValues:!0};else if(n?.type===mt.Rating)i={source:Re.Custom,options:Array.from({length:t.properties.maxValue},(x,f)=>({label:String(f+1),value:String(f+1)})),useCustomValues:!0};else if(n?.implements.includes(yu.GeneratedOptions)){const x=n?.properties.find(f=>f.type===K.Options);if(x){const f=t?.properties[x.handle];i=s(x.handle,f),o=f?.emptyOption}}const r=i?.source===Re.Custom,{data:a,isFetching:c}=B({queryKey:["field-options",i],queryFn:async()=>{if(!i||r)return[];if(i?.source!==Re.Custom&&!i.typeClass)return[];try{const x=await T.post("api/options",i),{data:f}=x;return f}catch(x){return console.error(x),[]}},staleTime:1/0,gcTime:1/0,enabled:!r}),d=!!i&&!r&&c;let p=r?i.options:a||[];return o&&(p=[{label:u(o),value:""},...p]),[p,d]},D3=({field:t,fieldType:n,value:s,multiple:i,onChange:o})=>{const[r,a]=oi(t,n);if(i){let c;if(s)try{c=JSON.parse(s)}catch{c=s}else c="";return e.jsx(e.Fragment,{children:!a&&e.jsx(ju,{value:c,options:r.map(d=>"value"in d?{value:d.value,name:d.label,editable:!1}:null).filter(Boolean),allowCustom:!1,onChange:d=>o(JSON.stringify(d))})})}return e.jsx(de,{emptyOption:"Select an option",value:s,options:r,loading:a,onChange:c=>o?.(c)})},B3=({field:t,value:n,onChange:s})=>{const o=(t.properties?.scales||[]).map(([r,a])=>({label:`${a||r}`,value:r}));return e.jsx(de,{emptyOption:"Select a scale value",value:n,options:o,onChange:r=>s?.(r)})},O3=({field:t,value:n,onChange:s})=>{const i=t.properties?.maxValue||1,o=ts(1,i).map(r=>({label:`${r}`,value:`${r}`}));return e.jsx(de,{emptyOption:"Select a rating",value:n,options:o,onChange:r=>s?.(r)})},_3=({condition:t,onChange:n})=>{const{field:s,value:i,operator:o}=t,r=P(Ae.one(s)),a=Me(r?.typeClass);if(!a||Pn.noValue.includes(o))return null;if(a.implements.includes("boolean")&&Pn.boolean.includes(o))return e.jsx(R3,{fieldUid:s,onChange:n,value:i});if(a.implements.includes("generatedOptions"))return e.jsx(D3,{field:r,fieldType:a,value:i,multiple:Pn.multiple.includes(o),onChange:x=>n?.(x)});if(Pn.multiple.includes(o))return e.jsx(ju,{value:i,allowCustom:!0,onChange:x=>n(JSON.stringify(x)),placeholder:u("Add values")});const p=a.type;return p===mt.Rating?e.jsx(O3,{field:r,value:i,onChange:n}):p===mt.OpinionScale?e.jsx(B3,{field:r,value:i,onChange:n}):e.jsx("input",{className:"text fullwidth",type:"text",value:i,onChange:x=>n?.(x.target.value)})},nn=({conditions:t,buttonLabel:n,loading:s,onChange:i})=>e.jsx(N3,{children:e.jsxs("tbody",{children:[s&&e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(k,{height:34})}),e.jsx("td",{children:e.jsx(k,{height:34})}),e.jsx("td",{children:e.jsx(k,{height:34})}),e.jsx("td",{})]}),t.map((o,r)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(z3,{condition:o,onChange:a=>i?.([...t.slice(0,r),{...o,field:a},...t.slice(r+1)])})}),e.jsx("td",{children:e.jsx(I3,{condition:o,onChange:a=>i?.([...t.slice(0,r),{...o,operator:a},...t.slice(r+1)])})}),e.jsx("td",{children:e.jsx(_3,{condition:o,onChange:a=>{i?.([...t.slice(0,r),{...o,value:a},...t.slice(r+1)])}})}),e.jsx("td",{children:e.jsx(bu,{children:e.jsx(dt,{onClick:()=>{i?.([...t.slice(0,r),...t.slice(r+1)])}})})})]},r)),!s&&e.jsx("tr",{children:e.jsx("td",{colSpan:4,children:e.jsx("button",{type:"button",className:"btn add icon fullwidth",onClick:()=>{i?.([...t,{uid:G(),field:"",operator:se.Equals,value:""}])},children:u(n||"Add a condition")})})})]})}),vu=({value:t,onChange:n,options:s})=>{const{on:i,off:o}=s;return e.jsx("div",{className:"select",children:e.jsxs("select",{value:t?i:o,onChange:r=>n?.(r.target.value===i),children:[e.jsx("option",{value:i,children:u(i)}),e.jsx("option",{value:o,children:u(o)})]})})},lt=l.h1`
  padding: 0;
`,sn=l.div`
  margin-bottom: ${m.xl};

  .select {
    margin: 0 5px;

    &:first-child {
      margin-left: 0;
    }
  }

  &.short {
    .select:first-child {
      margin-left: 5px;
    }
  }
`,el={isInitialized:t=>t.rules.integrations.initialized,one:t=>Z(n=>n.rules.integrations.items,n=>n.find(s=>s.uid===t)),hasRule:t=>Z(n=>n.rules.integrations.items,n=>!!n.find(s=>s.uid===t))},W3=({property:t,updateValue:n,value:s,context:i})=>{const o=H(),r=g.useRef([]),{id:a}=P(Pe.current),{data:c,isFetched:d}=wm(a),p=P(el.isInitialized),x=P(el.one(s)),{instanceUid:f}=i;return g.useEffect(()=>{if(!r.current.includes(s)&&d&&p){if(s&&c.find(j=>j.uid===s))return;const b=G();r.current.push(b),o(Dn.add({ruleUid:b,integrationUid:f})),n(b)}},[p,c,d,s,o,f,n]),e.jsxs(W,{property:t,children:[e.jsxs(sn,{children:[e.jsx(vu,{value:x?.push??!0,options:{on:"Push",off:"Don't push"},onChange:b=>o(Dn.modifyPush({ruleUid:x.uid,push:b}))}),u("data to integration when"),e.jsx(tn,{value:x?.combinator??Be.Or,onChange:b=>o(Dn.modifyCombinator({ruleUid:x.uid,combinator:b}))}),u("of the following rules match:")]}),e.jsx(nn,{loading:!x,conditions:x?x.conditions:[],onChange:b=>{o(Dn.modifyConditions({ruleUid:x.uid,conditions:b}))}})]})},zn=({children:t})=>e.jsx(Qt,{baseColor:"#e6eaee",highlightColor:"#ced1d4",children:t}),U3=l.div`
  padding: ${m.xl};
  border-bottom: 1px solid ${h.gray200};
`,H3=l.div`
  margin-bottom: ${m.lg};
  color: ${h.gray600};
  font-size: 0.9em;
`,q3=l.button`
  width: 100%;
  margin-top: ${m.lg};
`,Q3=l.div`
  color: ${h.gray600};
  padding: ${m.lg};
  text-align: center;
`,K3=l.div`
  padding: ${m.xl};
  height: 300px;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 ${m.lg} 0;
    font-size: 1.1em;
    font-weight: 600;
  }
`,tl=l.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.lg};
  overflow: hidden;
  margin-top: -1px;

  thead {
    background: ${h.gray050};
    display: table;
    width: 100%;
    table-layout: fixed;

    th {
      padding: ${m.md} ${m.lg};
      font-weight: 600;
      color: ${h.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${h.gray200};
    }
  }

  tbody {
    display: block;
    max-height: 200px;
    overflow-y: auto;

    tr {
      display: table;
      width: 100%;
      table-layout: fixed;
      transition: background-color 0.2s ease;

      &:hover {
        background: ${h.gray050};
      }
    }

    td {
      padding: ${m.md} ${m.lg};
      vertical-align: middle;

      &.no-break {
        white-space: nowrap;
      }
    }
  }
`,V3=l.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${S.md};
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;

  &.success {
    background-color: ${h.teal050};
    color: ${h.teal700};
  }

  &.error {
    background-color: ${h.red050};
    color: ${h.red700};
  }

  &.pending {
    background-color: ${h.yellow050};
    color: ${h.yellow700};
  }
`,G3=l.div`
  margin-top: ${m.lg};
  padding: ${m.md};
  background-color: ${h.teal050};
  color: ${h.teal700};
  border-radius: ${S.md};
`,Y3=l.div`
  margin-top: ${m.lg};
  padding: ${m.md};
  background-color: ${h.red050};
  color: ${h.red700};
  border-radius: ${S.md};
`,fo=l.div`
  margin-top: ${m.lg};
  padding: ${m.md};
  background-color: ${h.yellow050};
  color: ${h.yellow700};
  border-radius: ${S.md};
`,J3=({formId:t,onClose:n})=>{const[s,i]=g.useState(null),[o,r]=g.useState(null),[a,c]=g.useState(null),[d,p]=g.useState(null),{data:x,isFetching:f,refetch:b}=Cm(t),{data:j}=Pd(),[y,w]=g.useState(!1),{data:v}=km(s,{enabled:!!s,refetchInterval:y?3e3:void 0});g.useEffect(()=>{s&&v?.status==="pending"?w(!0):w(!1)},[s,v?.status]);const $=Sm(t,{onSuccess:L=>{i(L.testToken),r(Date.now())},onError:()=>{i(null)}});g.useEffect(()=>{o&&v?.status==="pending"&&Date.now()-o>24e4&&(i(null),r(null))},[o,v?.status]),g.useEffect(()=>{(v?.status==="success"||v?.status==="failed")&&(i(null),r(null),c(v.status),p(v.errorMessage||null),b())},[v?.status,v?.errorMessage,b]);const C=()=>{c(null),p(null),$.mutate()},F=L=>{switch(L){case"success":return"success";case"failed":return"error";case"pending":return"pending";default:return""}},N=L=>{try{return new Date(L).toLocaleString()}catch{return L}},M=$.isPending||s!==null,z=a==="success";return e.jsx(wt,{closeModal:n,children:e.jsxs(ve,{style:{maxWidth:"600px"},children:[e.jsx(we,{children:e.jsx("h1",{children:u("Test Email Notifications")})}),e.jsxs("div",{style:{padding:m.xl},children:[e.jsxs(U3,{children:[e.jsx(H3,{children:u("A test email will be sent to 'inbound@test.formmonitor.com' to confirm that your email delivery and inbound processing are functioning correctly.")}),j?.isSendmail&&e.jsx(fo,{children:u(`Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor's inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.`)}),a!=="success"&&e.jsx(q3,{className:E("btn","submit",(M||z)&&"disabled"),onClick:C,disabled:M||z,children:u(M?"Testing...":z?"Test complete":"Test it now")}),a==="success"&&e.jsx(G3,{children:u("Test email received successfully!")}),a==="failed"&&e.jsxs(Y3,{children:[u("Test email failed:")," ",d||u("Unknown error")]}),o&&Date.now()-o>=24e4&&e.jsx(fo,{children:u("Test email is taking longer than expected. Please check again in 10 minutes—the final status will appear in the Test Email History once delivery completes.")})]}),e.jsxs(K3,{children:[e.jsx("h3",{children:u("Test Email History")}),f?e.jsx(zn,{children:e.jsxs(tl,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("ID")}),e.jsx("th",{children:u("Status")}),e.jsx("th",{children:u("Date & Time")})]})}),e.jsx("tbody",{children:[1,2,3].map(L=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(k,{width:40})}),e.jsx("td",{children:e.jsx(k,{width:80})}),e.jsx("td",{children:e.jsx(k,{width:150})})]},L))})]})}):!x||!x.testEmails||x.testEmails.length===0?e.jsx(Q3,{children:u("No test emails sent yet.")}):e.jsxs(tl,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("ID")}),e.jsx("th",{children:u("Status")}),e.jsx("th",{children:u("Date & Time")})]})}),e.jsx("tbody",{children:x.testEmails.map(L=>e.jsxs("tr",{children:[e.jsx("td",{className:"no-break",children:L.id}),e.jsx("td",{children:e.jsx(V3,{className:F(L.status),children:L.status==="success"?u("Success"):L.status==="failed"?u("Failed"):u("Pending")})}),e.jsx("td",{className:"no-break",title:L.createdAt,children:N(L.createdAt)})]},L.id))})]})]})]}),e.jsx($e,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Close")})})]})})},Z3=({property:t,errors:n})=>{const{formId:s}=V(),[i,o]=g.useState(!1),{data:r}=Pd(),a=s?Number(s):null,c=!!a,d=r?.isSendmail??!1;return e.jsxs(e.Fragment,{children:[e.jsxs(W,{property:t,errors:n,children:[e.jsx("button",{className:"btn small submit",type:"button",disabled:!c,onClick:()=>{c&&o(!0)},children:u("Test Email Notifications")}),d&&e.jsx(fo,{children:u(`Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor's inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.`)})]}),i&&a&&e.jsx(J3,{formId:a,onClose:()=>o(!1)})]})},nl={isInitialized:t=>t.rules.notifications.initialized,one:t=>Z(n=>n.rules.notifications.items,n=>n.find(s=>s.uid===t)),hasRule:t=>Z(n=>n.rules.notifications.items,n=>!!n.find(s=>s.uid===t))},X3=({property:t,updateValue:n,value:s,context:i})=>{const o=H(),r=g.useRef([]),{id:a}=P(Pe.current),{data:c,isFetched:d}=Md(a),p=P(nl.isInitialized),x=P(nl.one(s)),{uid:f}=i;return g.useEffect(()=>{if(!r.current.includes(s)&&d&&p){if(s&&c.find(j=>j.uid===s))return;const b=G();r.current.push(b),o(Bn.add({ruleUid:b,notificationUid:f})),n(b)}},[p,c,d,s,o,f,n]),e.jsxs(W,{property:t,children:[e.jsxs(sn,{children:[e.jsx(vu,{value:x?.send??!0,options:{on:"Send",off:"Don't send"},onChange:b=>o(Bn.modifySend({ruleUid:x.uid,send:b}))}),u("a notification when"),e.jsx(tn,{value:x?.combinator??Be.Or,onChange:b=>o(Bn.modifyCombinator({ruleUid:x.uid,combinator:b}))}),u("of the following rules match:")]}),e.jsx(nn,{loading:!x,conditions:x?x.conditions:[],onChange:b=>{o(Bn.modifyConditions({ruleUid:x.uid,conditions:b}))}})]})},sl={desktop:{sm:1024,md:1440}},il={desktop:{sm:`@media only screen and (min-width: ${sl.desktop.sm}px)`,md:`@media only screen and (min-width: ${sl.desktop.md}px)`}},eb=l.div``,tb=l.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${m.sm};

  padding: 0;
  margin: 0 0 ${m.sm};

  user-select: none;

  > span {
    padding: 0;

    color: ${h.gray300};
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &:after {
    content: '';

    width: 100%;
    height: 1px;

    background-color: ${h.gray200};
  }
`,nb=l.ul`
  position: relative;

  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${m.sm};

  max-height: 130px;
  overflow-y: auto;

  ${Q};

  &.has-scroll {
    padding-right: 10px;
  }

  ${il.desktop.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${il.desktop.md} {
    grid-template-columns: repeat(4, 1fr);
  }
`,wu=l.div`
  padding: ${m.sm} ${m.md};

  font-size: 14px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`,$u=l.div`
  display: flex;
  height: 100%;

  white-space: nowrap;

  background-color: #e5ecf6;
  border-top-right-radius: ${S.lg};
  border-bottom-right-radius: ${S.lg};
`,bo=l.button`
  padding: ${m.sm} 10px;

  &:hover {
    background-color: ${h.gray200};
  }

  &:last-child {
    border-top-right-radius: ${S.lg};
    border-bottom-right-radius: ${S.lg};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`,Cu=l.li`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  min-width: 0;

  padding: 0;

  background-color: ${h.gray050};
  border: 1px solid ${h.gray200};
  border-radius: ${S.lg};

  &.dashed {
    background-color: transparent;
    border: 1px dashed ${h.gray300};

    &:hover {
      background-color: ${h.gray100};
    }
  }

  &.active {
    color: ${h.white};
    background-color: ${h.gray500};

    button svg {
      fill: ${h.white};
    }

    ${$u} {
      background-color: #51606c;
    }

    ${bo} {
      &:hover {
        background-color: ${h.gray800};
      }
    }
  }
`,sb=({onCreate:t})=>e.jsx(Cu,{className:"dashed",onClick:t,children:e.jsx(wu,{children:e.jsxs(ib,{children:[e.jsx("i",{className:"fa-solid fa-plus"}),u("Create New Template")]})})}),ib=l.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,Pi=({address:t})=>(Array.isArray(t)||(t=[t]),e.jsx("div",{children:t.map((n,s)=>e.jsxs("span",{children:[e.jsx(ob,{...n}),s<t.length-1&&e.jsx("span",{children:", "})]},s))})),ob=({address:t,name:n})=>n?e.jsxs("span",{children:[n," <",t,">"]}):e.jsx("span",{children:t}),rb=({attachments:t})=>e.jsx("div",{children:t.map((n,s)=>e.jsxs(ab,{children:[e.jsx("i",{className:`fa-regular fa-file-${cb(n.filename)}`}),e.jsx("span",{children:n.filename}),e.jsx(lb,{children:n.size})]},s))}),ab=l.div`
  display: flex;
  align-items: center;
  gap: 4px;
`,lb=l.span`
  font-weight: 700;
  font-size: 0.8em;
  color: ${h.gray250};
`,cb=t=>{const n=t.split(".").pop()?.toLowerCase();let s;switch(n){case"pdf":s="pdf";break;case"jpg":case"jpeg":case"png":case"gif":case"webp":s="image";break;case"xlsx":s="spreadsheet";break;case"doc":s="doc";break;case"ppt":s="ppt";break;default:s="file";break}return s},db=({body:t})=>{const n=g.useRef(null);return g.useEffect(()=>{const s=n.current;if(s){const i=s.contentDocument||s.contentWindow?.document;if(i){i.open(),i.write(t),i.close();const o=()=>{if(s?.contentWindow?.document){const r=s.contentWindow.document.body.scrollHeight;s.style.height=`${r}px`,s.contentWindow.document.body.style.overflow="hidden"}};s.onload=o,setTimeout(o,50)}}},[t]),e.jsx(ub,{ref:n,width:"100%",sandbox:"allow-same-origin allow-scripts",title:"Email Preview"})},ub=l.iframe`
  display: block;
  width: 100%;

  overflow: hidden;
  border: none;
`;l.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  background-color: ${h.white};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  overflow: auto;
`;const jo=l.div`
  border: 1px solid ${h.gray200};
  border-radius: 5px;
  box-shadow: 0 1px 12px #31315d26;
`,yo=l.div`
  height: 16px;

  background: ${h.gray050};
  border-radius: 5px 5px 0 0;

  font-size: 1px;
  line-height: 1px;
`,Ie=l.div`
  display: flex;
  gap: 5px;

  padding: 4px 0;

  border-bottom: 1px solid ${h.hairline};

  &:last-child {
    border-bottom: none;
    border-radius: 0 0 5px 5px;
  }
`,Ke=l.label`
  display: block;

  flex-basis: 120px;

  font-size: 13px;
  font-weight: 700;
  text-align: right;
  color: ${h.gray250};
`,Ve=l.div`
  flex: 1;
  padding: 0 5px 0 15px;

  font-size: 13px;
  color: ${h.gray900};
`,vo=l.div`
  width: 100%;
  padding: ${m.md} ${m.xl};
`,pb=l.input`
  padding: 0 ${m.xs};

  border: 1px solid rgba(96, 125, 159, 0.25);
  border-radius: 3px;

  font-size: 12px;
`,hb=()=>e.jsxs(jo,{children:[e.jsx(yo,{}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("To"),":"]}),e.jsx(Ve,{children:e.jsx(k,{width:200})})]}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("Subject"),":"]}),e.jsx(Ve,{children:e.jsx(k,{width:200})})]}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("From"),":"]}),e.jsx(Ve,{children:e.jsx(k,{width:200})})]}),e.jsx(Ie,{children:e.jsxs(vo,{children:[e.jsx(k,{width:200}),e.jsx(k,{width:300}),e.jsx(k,{width:550}),e.jsx("br",{}),e.jsx(k,{width:500}),e.jsx(k,{width:430}),e.jsx(k,{width:520}),e.jsx("br",{}),e.jsx(k,{width:200}),e.jsx(k,{width:230}),e.jsx(k,{width:220})]})})]}),ku={preview:["notifications","templates","preview"]},xb=t=>B({enabled:!1,queryKey:ku.preview,queryFn:async()=>(await T.post("/api/templates/preview",t)).data}),mb=()=>le({mutationFn:async t=>await T.post("/api/templates/send-test",t)}),Su=t=>{const{inView:n}=t,{data:s,isFetching:i,refetch:o,error:r}=xb(t.context),a=mb(),[c,d]=g.useState();return g.useEffect(()=>{n&&o()},[n,o]),g.useEffect(()=>{if(c===void 0&&s?.from){const p=Array.isArray(s.from)?s.from[0]:s.from;d(p.address)}},[s,c]),e.jsxs(Te,{...t,extraContent:e.jsxs("div",{style:{display:"flex",gap:m.sm},children:[e.jsx("button",{className:E("btn","small","submit",i&&"disabled"),disabled:i,type:"button",onClick:()=>o(),children:u("Refresh")}),e.jsx(pb,{className:"small",type:"text",placeholder:u("john@doe.com"),value:c||"",onChange:p=>d(p.target.value),autoComplete:"off",autoCorrect:"off",spellCheck:!1,inputMode:"email","data-lpignore":"true","data-1p-ignore":!0}),e.jsx("button",{className:E("btn","small",a.isPending&&"disabled",!c&&"disabled"),disabled:a.isPending||!c,type:"button",onClick:()=>a.mutate({...t.context,targetEmail:c||""}),children:u("Send Test Email")})]}),children:[i&&e.jsx(hb,{}),!!r&&e.jsxs(jo,{children:[e.jsx(yo,{}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("Error"),":"]}),e.jsx(Ve,{children:e.jsx("b",{children:r.message})})]}),e.jsx(Ie,{children:e.jsx(vo,{children:r.errors.template.preview})})]}),s!==void 0&&!r&&!i&&e.jsxs(jo,{children:[e.jsx(yo,{}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("From"),":"]}),e.jsx(Ve,{children:e.jsx(Pi,{address:s.from})})]}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("Subject"),":"]}),e.jsx(Ve,{children:s.subject})]}),e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("To"),":"]}),e.jsx(Ve,{children:s.to})]}),!!s.cc.length&&e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("CC"),":"]}),e.jsx(Ve,{children:e.jsx(Pi,{address:s.cc})})]}),!!s.bcc.length&&e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("BCC"),":"]}),e.jsx(Ve,{children:e.jsx(Pi,{address:s.bcc})})]}),!!s.attachments.length&&e.jsxs(Ie,{children:[e.jsxs(Ke,{children:[u("Attachments"),":"]}),e.jsx(Ve,{children:e.jsx(rb,{attachments:s.attachments})})]}),e.jsx(Ie,{children:e.jsx(vo,{children:e.jsx(db,{body:s.htmlBody})})})]})]})},br={all:["notification-templates"],one:t=>[...br.all,t]},gb=t=>B({queryKey:br.one(t),queryFn:()=>T.get(`/api/notifications/templates/${t||"get-default-metadata"}`).then(n=>n.data),staleTime:1/0,gcTime:1/0}),fb=t=>le({mutationFn:n=>T.post("/api/notifications/templates",{formId:t,...n}).then(s=>s.data)}),bb=l(ve)`
  display: grid;
  grid-template-rows: min-content min-content 70vh min-content;

  max-width: 70vw;
  min-width: 600px;
`,jb=l.div`
  padding: 1rem 2rem;

  overflow-y: auto;
  ${Q};
`,yb=l.ul`
  display: flex;

  padding: 0 9px;

  border-bottom: 1px solid ${h.hairline};
  box-shadow: 0 1px 5px #cdd8e440;

  list-style: none;
`,vb=l.li`
  position: relative;
  cursor: pointer;

  display: inline-block;

  padding: 14px 15px 12px;

  color: #7e8fa0;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;

  outline: none;
  box-shadow: none;
  --focus-ring: inset 0 0 0 0px #fff, inset 0 0 0 2px #0d99f2;

  &.active {
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 15px;
      right: 0;

      width: calc(100% - 30px);
      height: 2px;

      background-color: #0d99f2;
    }
  }

  &.errors {
    color: ${h.error};
  }
`,wb=l.div`
  display: none;

  &.active {
    display: block;
  }
`,$b=l.div`
  display: flex;
  gap: 1rem;

  > div {
    flex: 1 0;
    padding: 0.5rem 0;
  }
`,Vs=t=>(t=Oo(t),t.replace(/[^a-zA-Z0-9\-_]/g,"")),Lu=(t,{target:n,camelize:s=!1,transliterate:i=!1,bypassConditions:o},r,a)=>{if(o!==void 0){for(const d of o)if(!!r?.[d.name]===d.isTrue)return t}const c=Jo(t,{transliterate:i,camelize:s});return a?.(n,c),t},Cb=(t,{pattern:n,replacement:s="",modifier:i="g"})=>{const o=new RegExp(n,i);return t.replace(o,s)},kb=Object.freeze(Object.defineProperty({__proto__:null,handle:Vs,injectInto:Lu,regex:Cb},Symbol.toStringTag,{value:"Module"})),Sb=t=>{const{value:n,onChange:s}=t;return e.jsx(Te,{...t,children:e.jsx(pr,{criteria:{kind:[]},multiSelect:!0,onUpdate:s,value:n})})},Lb=t=>{const{value:n,label:s,handle:i,instructions:o,onChange:r}=t;return e.jsx(Te,{...t,label:void 0,instructions:void 0,children:e.jsxs(si,{children:[e.jsx(iu,{children:e.jsx(en,{enabled:n,onClick:a=>r(a)})}),e.jsxs(f4,{onClick:()=>r(!n),children:[e.jsx("label",{htmlFor:i,children:u(s)}),e.jsx(cs,{instructions:o})]})]})})},Fb=t=>{const{optionDefinition:n,handle:s,value:i,onChange:o}=t,[r,a]=g.useState(!1),[c,d]=g.useState([]);return g.useEffect(()=>{typeof n=="function"?(a(!0),n().then(p=>{d(p)}).finally(()=>a(!1))):d(n||[])},[n]),e.jsxs(Te,{...t,children:[e.jsx(xr,{value:i,options:c,selectAll:c.length>0,onUpdate:o,uniqueId:s,emptyMessage:u("No PDF templates were found")}),!r&&c.length===0&&e.jsxs(e.Fragment,{children:[e.jsx(lu,{}),e.jsx(cs,{instructions:u("No PDF templates were found")})]})]})},Eb=t=>{const{optionDefinition:n,emptyOption:s,value:i,onChange:o}=t,[r,a]=g.useState(!1),[c,d]=g.useState([]);return g.useEffect(()=>{typeof n=="function"?(a(!0),n().then(p=>{d(p)}).finally(()=>a(!1))):d(n||[])},[n]),e.jsx(Te,{...t,children:e.jsx(de,{options:c,emptyOption:s,value:i,onChange:p=>o(p),loading:r})})},Tb=l.div`
  //
`,Nb=l.label`
  display: block;

  padding: 0 ${m.md};

  ${_e};
  font-size: 11px;
`,zb=l.a`
  cursor: pointer;

  display: block;

  padding: 0 ${m.xl} 3px;
  font-size: 14px;

  text-decoration: none;

  &:hover {
    cursor: pointer;
    background-color: ${h.gray050};
  }

  &.active {
    background-color: ${h.gray100};

    &:hover {
      background-color: ${h.gray200};
    }
  }
`,Mb=({item:t,onClick:n})=>{const s=g.useRef(null);return g.useEffect(()=>{t.active&&s.current&&s.current.scrollIntoView({behavior:"smooth",block:"nearest"})},[t]),e.jsx(zb,{ref:s,className:E(t?.active&&"active"),onClick:()=>n?.(t),dangerouslySetInnerHTML:{__html:O.sanitize(t.shortName)}})},Ib=({category:t,onClick:n})=>e.jsxs(Tb,{children:[e.jsx(Nb,{children:t.name}),e.jsx("div",{children:t.items.map(s=>e.jsx(Mb,{item:s,onClick:n},s.token))})]}),Ab=({backend:t,index:n,filter:s,setIndex:i,setFilter:o,itemCountRef:r,suggestions:a,close:c})=>{g.useEffect(()=>{const d=p=>{switch(p.key){case"Escape":p.preventDefault(),c();break;case"ArrowRight":case"ArrowLeft":p.preventDefault(),c();break;case"ArrowDown":p.preventDefault(),i(x=>x>=(r.current??0)-1?(r.current??0)-1:x<(r.current??0)?x+1:r.current-1);break;case"ArrowUp":p.preventDefault(),n>0&&i(x=>x>r.current-1?r.current-1:x>0?x-1:0);break;case"Enter":if(p.preventDefault(),p.stopPropagation(),p.stopImmediatePropagation(),n>-1){const x=a.flatMap(f=>f.items).find(f=>f.active);x&&t.insert(x,s)}return o(""),c(),!1;default:p.key.length===1&&o(x=>x+p.key);break}};return t.handlers.on.down(d,!0),()=>{t.handlers.off.down(d)}},[n,c,t,a,s,o,i,r])},Rb=({backend:t,setFilter:n,close:s})=>{g.useEffect(()=>{if(t.extrnalTrigger)return;const i=o=>{const r=t.getRange(),a=r.startContainer,c=r.startOffset;if(a.nodeType===3){const d=a.textContent;let p="",x=!1;for(let f=c-1;f>=0;f--)if(d[f]==="@"){x=!0,p=d.substring(f+1,c);break}!x||o.key==="Escape"?(s(),n("")):n(p)}else s()};return t.handlers.on.up(i,!0),()=>{t.handlers.off.up(i)}},[s,t,n])};let Ls;const Pb=t=>{const n=[];return t.getState().layout.fields.forEach(s=>{n.push({shortName:s.properties.label,name:s.properties.label,token:`fieldUids['${s.uid}']`})}),n},Db=t=>{const{store:n}=t,[s,i]=g.useState([]);return g.useEffect(()=>{Ls?i([...Ls,{name:"Fields",items:Pb(n)}]):T.get("/api/templates/notifications/suggestions").then(o=>{Ls=o.data,i(Ls)})},[n]),s},Bb=(t,n)=>{const s=Db(t),[i,o]=g.useState([]),[r,a]=g.useState("");return g.useEffect(()=>{let c=0;const d=s.map(p=>({...p,items:p.items.filter(x=>x.name.toLowerCase().includes(r.toLowerCase())).map(x=>({...x,active:n===c++}))})).filter(p=>p.items.length>0);o(d)},[s,r,n]),{suggestions:i,filter:r,setFilter:a}},Ob=(t,n)=>{const s=t.getRect(),{getRange:i}=t,o=i();let r;o.startContainer.nodeType===Node.ELEMENT_NODE?r=o.startContainer:r=o;const a=r.getBoundingClientRect();let c=window.scrollX,d=window.scrollY;s&&(c+=s.left,d+=s.top);const p=c+a.left+15,x=d+a.top+20;return n.current&&(n.current.style.left=`${p}px`,n.current.style.top=`${x}px`),{left:p,top:x}},_b=l.div`
  position: absolute;
  z-index: 1000;
  left: 200px;
  top: 200px;

  display: flex;
  flex-direction: column;
  gap: 0;

  width: 300px;
  max-height: 300px;
  overflow: hidden;

  background-color: ${h.white};
  color: black;

  border: 1px solid ${h.hairline};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`,Wb=l.h3`
  background: ${h.gray100};

  padding: 8px 8px;
  margin: 0;

  ${_e};
  color: ${h.gray600};
  font-size: 11px;
`,Ub=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  padding: ${m.xs} 0;

  overflow-y: auto;
  ${Q};
`,Hb=({backend:t,close:n})=>{const s=g.useRef(null),i=g.useRef(0),[o,r]=g.useState(0),{suggestions:a,filter:c,setFilter:d}=Bb(t,o);Ob(t,s),g.useEffect(()=>{i.current=a.reduce((x,f)=>x+f.items.length,0)},[a]),$t({isEnabled:!0,callback:n,refObject:s}),Rb({backend:t,setFilter:d,close:n}),Ab({backend:t,index:o,filter:c,setIndex:r,setFilter:d,itemCountRef:i,suggestions:a,close:n});const p=g.useCallback(x=>{t.insert(x,c),d(""),n()},[c,t.insert,n,d]);return e.jsxs(_b,{ref:s,children:[e.jsx(Wb,{children:u("Freeform Template Tokens")}),e.jsx(Ub,{children:a.map(x=>e.jsx(Ib,{category:x,onClick:p},x.name))})]})},qb=t=>{const n=document.createElement("div");n.className="freeform-tokens-dropdown",document.body.appendChild(n);const s=hc.createRoot(n),i=()=>{s.unmount(),document.body.contains(n)&&document.body.removeChild(n)};return s.render(e.jsx(Hb,{backend:t,close:i})),{close:i}};let Os;const wo=t=>{jr(),Os=qb(t)},jr=()=>{Os&&(Os.close(),Os=void 0)},Qb=t=>{t.PluginManager.add("freeform-tokens",n=>{const s={store:n.getParam("store"),getRect:()=>n.getContentAreaContainer().getBoundingClientRect(),getRange:()=>n.selection.getRng(),insert:(i,o)=>{const r=n.selection.getRng(),a=Math.max(0,r.startOffset-(o.length+1));r.setStart(r.startContainer,a),n.selection.setRng(r),n.execCommand("Delete"),n.insertContent(`<span contenteditable="false" data-freeform-token="${i.token}">${i.name}</span>`)},handlers:{on:{down:(i,o=!1)=>{n.on("keydown",i,o)},up:(i,o=!1)=>{n.on("keyup",i,o)}},off:{down:i=>{n.off("keydown",i)},up:i=>{n.off("keyup",i)}}}};n.on("keydown",i=>{i.key==="@"&&setTimeout(()=>{wo(s)},0)}),n.on("remove",()=>{jr()})})};Qb(U1);const Kb=t=>{const{value:n,onChange:s}=t,i=Vo(),o=X(),{templates:{toolbar:r},metadata:{tinymce:{stylesPath:a}}}=I;return e.jsx(Te,{...t,children:e.jsx(xc,{init:{branding:!1,menubar:!1,statusbar:!0,promotion:!1,content_css:a,store:i,queryClient:o},value:n,onEditorChange:s,plugins:Vb,toolbar:r,licenseKey:"gpl"})})},Vb=["autolink","code","codesample","image","link","lists","media","searchreplace","table","freeform-tokens"],Di=t=>{const{value:n,multiline:s,onChange:i}=t;return e.jsx(Te,{...t,children:s?e.jsx("textarea",{rows:2,className:"text fullwidth",value:n,onChange:o=>i(o.target.value)}):e.jsx("input",{type:"text",className:"text fullwidth",value:n,onChange:o=>i(o.target.value)})})},Gb=l.div`
  position: relative;
`,Yb=l.div`
  span[data-freeform-token] {
    display: inline-block;

    background-color: #e4edf6;
    border: 1px solid #33404d1a;
    border-radius: 3px;
    padding: 0.0625em 0.25em;

    &[data-selected] {
      outline: 3px solid #0078d4 !important;
    }
  }
`,Jb=l.button`
  position: absolute;
  top: 0;
  right: 0;

  margin: 4px;
  padding: 0 8px;

  height: 26px;
  min-height: 26px;
`,Lt=t=>{const n=Vo(),s=g.useRef(null),i=g.useRef(null),o=g.useRef(null),{value:r,onChange:a}=t,c=g.useCallback(j=>O.sanitize(j,{ADD_ATTR:["contenteditable","data-freeform-token"]}),[]),d=g.useMemo(()=>({getRange:()=>window.getSelection()?.getRangeAt(0)||document.createRange(),getRect:()=>null,insert:j=>{const y=window.getSelection();if(!y||y.rangeCount===0)return;const w=o.current||y.getRangeAt(0);if(w.startContainer.nodeType!==Node.TEXT_NODE)return;const v=w.startContainer,$=w.startOffset,C=v.textContent??"";let F=-1;for(let L=$-1;L>=0;L--)if(C[L]==="@"){F=L;break}if(F===-1)return;const N=document.createRange();N.setStart(v,F),N.setEnd(v,$);const M=document.createElement("span");M.contentEditable="false",M.dataset.freeformToken=j.token,M.innerHTML=c(j.name),N.deleteContents(),N.insertNode(M);const z=document.createRange();z.setStartAfter(M),z.collapse(!0),y.removeAllRanges(),y.addRange(z),a(c(s.current?.innerHTML??""))},store:n,handlers:{on:{down:j=>{s.current?.addEventListener("keydown",j)},up:j=>{s.current?.addEventListener("keyup",j)}},off:{down:j=>{s.current?.removeEventListener("keydown",j)},up:j=>{s.current?.removeEventListener("keyup",j)}}}}),[n,a,c]),p={extrnalTrigger:!0,getRange:()=>{if(!o.current){const j=document.createRange();return j.selectNode(i.current),j}return o.current},getRect:()=>null,insert:j=>{const y=document.createElement("span");y.contentEditable="false",y.dataset.freeformToken=j.token,y.innerHTML=c(j.name);const w=o.current;if(!w){s.current?.appendChild(y),a(c(s.current.innerHTML));return}if(w.startContainer.nodeType!==Node.TEXT_NODE&&w.startContainer.nodeType!==Node.ELEMENT_NODE)return;const v=w.startContainer,$=w.startOffset,C=document.createRange();C.setStart(v,$),C.setEnd(v,$),C.deleteContents(),C.insertNode(y);const F=document.createRange();F.setStartAfter(y),F.collapse(!0);const N=window.getSelection();N.removeAllRanges(),N.addRange(F),a(c(s.current?.innerHTML??""))},store:n,handlers:{on:{down:j=>{document?.addEventListener("keydown",j)},up:j=>{document.addEventListener("keyup",j)}},off:{down:j=>{document.removeEventListener("keydown",j)},up:j=>{document.removeEventListener("keyup",j)}}}},x=g.useCallback(()=>{const j=window.getSelection();j&&j.rangeCount>0&&(o.current=j.getRangeAt(0).cloneRange())},[]),f=g.useCallback(()=>{const j=window.getSelection();j&&o.current&&(j.removeAllRanges(),j.addRange(o.current))},[]);g.useEffect(()=>()=>{jr()},[]),g.useEffect(()=>{s.current&&s.current.innerHTML!==r&&(s.current.innerHTML=c(r))},[r,c]);const b=g.useCallback(j=>{(j.nativeEvent.data||"")==="@"&&wo(d),s.current&&a(c(s.current.innerHTML))},[d,a,c]);return e.jsx(Te,{...t,children:e.jsxs(Gb,{children:[e.jsx(Yb,{className:"text fullwidth",ref:s,contentEditable:!0,onInput:b,onBlur:x,onKeyUp:x,onMouseUp:x,suppressContentEditableWarning:!0}),e.jsx(Jb,{ref:i,className:"btn",onClick:()=>{f(),wo(p)},children:e.jsx("i",{className:"fa-solid fa-plus"})})]})})},$o=[{name:u("Content"),rows:[[{type:Di,label:"Template Name",handle:"name",required:!0,instructions:"What this notification template will be called in the CP.",updateState:(t,n)=>({...n,handle:Vs(Bo(Oo(t)))})}],[{type:Lt,label:"Subject",handle:"subject",required:!0,instructions:"The subject line for the email notification."}],[{type:Kb,label:"Message Body",handle:"body",instructions:"The content of the email notification. Use the `@` symbol to generate a list of tokens you can use. Twig is also allowed."}]]},{name:u("Configuration"),rows:[[{type:Lt,label:"From Name",handle:"fromName",required:!0,instructions:"The name that the email will appear from in your email notification."},{type:Lt,label:"Reply-To Name",handle:"replyToName",instructions:"The reply-to name that the email will appear from in your email notification."}],[{type:Lt,label:"From Email",handle:"fromEmail",required:!0,instructions:"The email address that the email will appear from in your email notification."},{type:Lt,label:"Reply-To Email",handle:"replyToEmail",instructions:"The reply-to email address for your email notification. Leave blank to use 'From Email' address."}],[{type:Lt,label:"CC",handle:"cc",instructions:"The email address(es) you would like to be CC'd in the email notification. Separate multiples with commas. Leave blank to not use."},{type:Lt,label:"BCC",handle:"bcc",instructions:"The email address(es) you would like to be BCC'd in the email notification. Separate multiples with commas. Leave blank to not use."}]]},{name:u("Advanced"),rows:[[{type:Di,label:"Handle",handle:"handle",instructions:"Unique identifier for this template.",required:!0,onChange:t=>Vs(t)}],[{type:Di,label:"Description",handle:"description",instructions:"Description of this notification.",multiline:!0}],[{type:Lb,label:"Include Attachments",handle:"includeAttachments",instructions:"Include uploaded files as attachments in email notification."}],[{type:Sb,label:"Predefined Assets",handle:"presetAssets",minEdition:oe.Pro,instructions:"Select any Assets you wish to include as attachments on all email notifications using this template."}]]},{name:u("Templates"),rows:[[{type:Eb,label:"Template Wrapper",handle:"wrapperId",instructions:"The template wrapper for the email notification. This is the HTML that wraps around the body of the email.",emptyOption:"No Wrapper",optionDefinition:async()=>(await T.get("/api/templates/wrappers")).data.map(n=>({label:n.name,value:String(n.id)}))}],[{type:Fb,label:"PDF Templates",handle:"pdfTemplateIds",minEdition:oe.Pro,instructions:"Select any PDF templates to use for this notification.",optionDefinition:async()=>(await T.get("/api/templates/pdf")).data.map(n=>({label:n.name,value:n.id}))}]]},{name:u("Preview"),rows:[[{type:Su,label:"Preview",handle:"preview",instructions:"This will give you a rough idea of how your notification will look to the recipient."}]]}],Zb=$o[0].name,Xb=({data:t,closeModal:n})=>{const{formId:s}=V(),i=t?.id,o=X(),{data:r,isLoading:a}=gb(i),c=fb(s&&Number(s)),[d,p]=g.useState(Zb),[x,f]=g.useState(),[b,j]=g.useState({});g.useEffect(()=>()=>{f(void 0),j({}),o.removeQueries({queryKey:ku.preview})},[o.removeQueries]);const y=async()=>{await c.mutate(x,{onSuccess:w=>{f(v=>({...v,id:w.id})),o.invalidateQueries({queryKey:br.one(i)}),o.invalidateQueries({queryKey:ke.templates()}),o.invalidateQueries({queryKey:ke.formTemplates(Number(s))}),n(),typeof t?.onSuccess=="function"&&t.onSuccess(w.id)},onError:w=>{j(w.errors.notification)}})};return g.useEffect(()=>{r&&f(r)},[r]),e.jsxs(bb,{children:[e.jsx(we,{children:e.jsx("h1",{children:e.jsx(J,{loadingText:u("Loading..."),loading:a,spinner:!0,children:r?.name||"New Template"})})}),e.jsx(yb,{children:$o.map(w=>e.jsx(vb,{className:E(w.name===d&&"active",o0(b,w.rows.flatMap(v=>v.map($=>$.handle)))&&"errors"),onClick:()=>p(w.name),children:e.jsx("span",{children:w.name})},w.name))}),e.jsx(jb,{children:!a&&r!==void 0&&$o.map(w=>e.jsx(wb,{className:E(w.name===d&&"active"),children:w.rows.map((v,$)=>e.jsx($b,{children:v.map(C=>{if("minEdition"in C&&C.minEdition&&!I.editions.isAtLeast(C.minEdition))return null;let F;return C.type===Su&&(F={...x,formId:s?Number(s):void 0}),e.jsx(C.type,{...C,context:F,inView:w.name===d,value:x?.[C.handle]||"",errors:b?.[C.handle],onChange:N=>{"onChange"in C&&C.onChange&&(N=C.onChange(N)),f(M=>({...M,[C.handle]:N})),"updateState"in C&&C.updateState&&f(M=>C.updateState(N,M))}},C.handle)})},$))},w.name))}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:y,children:e.jsx(J,{loadingText:u("Saving..."),loading:c.isPending,spinner:!0,children:u("Save")})})]})]})},yr=()=>{const{openModal:t}=qe();return(n={})=>{t(Xb,{...n},{allowEscape:!1,requireConfirmation:!0,confirmationMessage:"Are you sure you want to close? Any unsaved changes will be lost."})}},e6=({active:t,openEditOnClick:n,template:s,onClick:i})=>{const{id:o,name:r}=s,a=X(),c=yr();return e.jsxs(Cu,{className:E(t?"active":""),onClick:()=>{n?c({id:o}):i(s)},children:[e.jsx(wu,{title:r,children:r}),!!s.formId&&e.jsxs($u,{children:[e.jsx(bo,{title:u("Edit"),onClick:d=>(d.preventDefault(),d.stopPropagation(),c({id:o}),!1),children:e.jsx("i",{className:"fa-solid fa-pencil"})}),e.jsx(bo,{title:u("Delete"),onClick:d=>(d.preventDefault(),d.stopPropagation(),confirm(u("Are you sure you want to delete this template?"))&&T.post("/api/templates/notifications/delete",{id:o}).then(()=>{a.invalidateQueries({queryKey:ke.templates()}),a.invalidateQueries({queryKey:ke.formTemplates(s.formId)})}).catch(p=>{const x=Object.values(p.errors).join(", ");Xe.error(x)}),!1),children:e.jsx("i",{className:"fa-solid fa-xmark"})})]})]})},Co=({value:t,title:n,templates:s,canCreate:i,openEditOnClick:o,onClick:r,onCreate:a})=>{const c=g.useRef(null),[d,p]=g.useState(!1);return g.useEffect(()=>{const x=c.current;x&&p(x.scrollHeight>x.clientHeight)},[]),s===void 0||!s?.length&&!i?null:e.jsxs(eb,{children:[e.jsx(tb,{children:e.jsx("span",{children:n})}),e.jsxs(nb,{ref:c,className:E(d&&"has-scroll"),children:[s.map(x=>e.jsx(e6,{openEditOnClick:o,active:t===x.id,template:x,onClick:r},x.id)),i&&e.jsx(sb,{onCreate:a})]})]})},vr=t=>{const{formId:n}=V(),{data:s,isFetching:i}=Uh(),{data:o,isFetching:r}=Hh(Number(n)),[a,c]=g.useState([]),[d,p]=g.useState(),[x,f]=g.useState({global:[]});return g.useEffect(()=>{s&&!i&&f(b=>({...b,global:s.templates}))},[s,i]),g.useEffect(()=>{o&&!r&&f(b=>({...b,form:o}))},[o,r]),g.useEffect(()=>{let b=x?.global?.find(j=>j.id===t);b||(b=x?.form?.find(j=>j.id===t)),p(b)},[t,x]),g.useEffect(()=>{const b=[];x.form&&b.push({label:"Form",icon:e.jsx("i",{className:"fa-solid fa-file"}),children:x.form.map(j=>({label:j.name,value:String(j.id)}))}),x.global&&b.push({label:"Global",icon:e.jsx("i",{className:"fa-solid fa-earth-americas"}),children:x.global.map(j=>({label:j.name,value:String(j.id)}))}),c(b)},[x]),{templates:x,options:a,isFetching:i,selectedTemplate:d}},Fu=l(_.div)`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: 0;
`,t6=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{size:r}=ir(),{templates:a,options:c,isFetching:d}=vr(t),p=yr(),{templates:{canCreate:x,method:f}}=I;if(d&&!a)return e.jsx(W,{property:n,errors:s,children:"loading"});const b=y=>{i(y.id)},j=()=>{p({type:"form",onSuccess:y=>{i(y)}})};return e.jsxs(W,{property:n,errors:s,context:o,children:[r==="small"&&e.jsx(de,{emptyOption:"Select a template",loading:d,options:c,onChange:y=>i(y),value:String(t||"")}),r==="normal"&&e.jsxs(Fu,{children:[e.jsx(Co,{value:t,title:u("Form Templates"),templates:a.form,onClick:b,canCreate:x&&f!==is.Global,onCreate:j}),e.jsx(Co,{value:t,title:u("Global Templates"),templates:a.global,onClick:b})]})]})},n6=l.div`
  display: grid;
  align-items: center;
  gap: ${m.md};

  grid-template-columns: 1.5fr 1fr 1.5fr 20px;
`,s6=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75"}),e.jsx("path",{d:"m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2"})]}),ol=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"})}),rl=(t,n)=>n!==void 0?[...t.slice(0,n+1),{email:"",name:""},...t.slice(n+1)]:[...t||[],{email:"",name:""}],al=(t,n)=>t.filter((s,i)=>i!==n),i6=(t,n,s)=>{const i=[...s];return i[t]=n,i},o6=l.ul``,ll=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 40px;

  border-right: 1px solid rgba(96, 125, 159, 0.25);
  background-color: ${h.gray050};

  ${_e};
  font-weight: normal;

  svg {
    width: 16px;
    height: 16px;
  }
`,cl=l.input`
  flex-grow: 1;

  border: none;
  outline: none;
  min-height: 100% !important;

  background-color: transparent;

  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none !important;
  }

  &::placeholder {
    color: ${h.gray200};
  }
`,Eu=l.button`
  padding: 0 10px;
  opacity: 0;

  transform: rotate(-40deg);
  transition: all 0.2s ease-out;

  &:focus {
    outline: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`,dl=l.li`
  display: flex;
  justify-content: space-between;
  gap: 0;

  overflow: hidden;
  border: 1px solid rgba(96, 125, 159, 0.25);

  &:hover {
    ${Eu} {
      transform: rotate(0deg);
      opacity: 1;
    }
  }

  &:not(:last-child) {
    border-bottom: none;
  }

  &:first-child {
    border-top-left-radius: ${S.lg};
    border-top-right-radius: ${S.lg};
  }

  &:last-child {
    border-bottom-left-radius: ${S.lg};
    border-bottom-right-radius: ${S.lg};
  }
`,wr=ie.memo(({value:t,onChange:n})=>{const{activeCell:s,setActiveCell:i,setCellRef:o,keyPressHandler:r}=Nn(t.length,1),a=()=>{i(t.length,0),n(rl(t))};return e.jsxs(e.Fragment,{children:[e.jsxs(o6,{children:[!t.length&&e.jsxs(dl,{children:[e.jsx(ll,{children:e.jsx(ol,{})}),e.jsx(cl,{type:"text",className:E("text","fullwidth","code"),placeholder:"john.doe@example.com",onClick:()=>a(),onFocus:()=>a()})]}),t?.map((c,d)=>e.jsxs(dl,{children:[e.jsx(ll,{children:e.jsx(ol,{})}),e.jsx(cl,{type:"text","data-1p-ignore":!0,className:E("text","fullwidth","code"),autoFocus:s===`${d}:0`,ref:p=>o(p,d,0),onFocus:()=>i(d,0),placeholder:"john.doe@example.com",value:c.email,onKeyDown:r({onEnter:({shiftKey:p})=>{const x=p?d+1:t.length;i(x,0),n(rl(t,p?d:void 0))},onDelete:()=>{n(al(t,d)),i(d-1,0)}}),onChange:p=>n(i6(d,{...c,email:p.target.value},t))}),e.jsx(Eu,{tabIndex:-1,onClick:()=>{n(al(t,d)),i(Math.max(d-1,0),0)},children:e.jsx(s6,{})})]},d))]}),t.length>0&&e.jsx(ms,{label:"Add a recipient",onClick:a})]})});wr.displayName="RecipientsController";const r6=l.div`
  flex: 2;

  &.multiple {
    grid-column: span 2;
  }
`,a6=({recipients:t,spanMultiple:n,onChange:s})=>e.jsx(r6,{className:E(n&&"multiple"),children:e.jsx(wr,{value:t,onChange:s})}),ul=l.div`
  flex: 1 1 0;
`,l6=({id:t,onChange:n})=>{const{templates:s,isFetching:i,selectedTemplate:o}=vr(t);if(i)return e.jsx(ul,{children:"loading..."});const r=[];return s?.form&&r.push({label:"Form",icon:e.jsx("i",{className:"fa-regular fa-clipboard-list-check"}),children:s.form.map(a=>({label:a.name,value:a.id}))}),s?.global&&r.push({label:"Global",icon:e.jsx("i",{className:"fa-solid fa-earth-americas"}),children:s.global.map(a=>({label:a.name,value:a.id}))}),e.jsx(ul,{children:e.jsx(de,{value:o?.id,options:r,emptyOption:"Use default template",onChange:a=>{/^[0-9]+$/.test(a)&&n(Number(a)),n(a)}})})},c6=l.div`
  flex-basis: 20%;
`,d6=l.input`
  &.disabled {
    background: #dfe5ec;
    color: ${h.black};
    opacity: 0.55;
  }
`,u6=({predefined:t,value:n,onChange:s})=>e.jsx(c6,{children:e.jsx(d6,{className:E("text","fullwidth",t&&"disabled"),readOnly:t,disabled:t,type:"text",value:n,onChange:i=>s(i.target.value)})}),Tu=({predefined:t,mapping:n,removable:s,onChange:i,onRemove:o})=>{const{value:r,template:a,recipients:c}=n;return e.jsxs(n6,{children:[e.jsx(u6,{predefined:t,value:r,onChange:d=>i({...n,value:d})}),e.jsx(l6,{id:a,onChange:d=>i({...n,template:d})}),e.jsx(a6,{recipients:c,spanMultiple:!s,onChange:d=>{i({...n,recipients:d})}}),s&&e.jsx(bu,{children:e.jsx(dt,{onClick:o})})]})},p6=({option:t,mapping:n,allMappings:s,updateValue:i})=>{const o=!!n,r=n||{value:t.value,recipients:[],template:""},a=c=>{let d;o&&(d=s.findIndex(p=>p.value===c.value)),i(d!==void 0?[...s.slice(0,d),c,...s.slice(d+1)]:[...s||[],c])};return e.jsx(Tu,{predefined:!0,mapping:r,onChange:a})},h6=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
`,x6=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const r=o.field,a=P(Ae.one(r)),c=Me(a?.typeClass),[d]=oi(a,c),p=x=>t?.find(f=>f.value===x);return e.jsx(W,{property:n,errors:s,context:o,children:e.jsxs(h6,{children:[!!d&&d.filter(x=>"value"in x).map((x,f)=>e.jsx(p6,{option:x,mapping:p(x.value),allMappings:t,updateValue:i},f)),!!t&&t.map((x,f)=>d.find(b=>b?.value===x.value)?null:e.jsx(Tu,{mapping:x,removable:!0,onRemove:()=>{i([...t.slice(0,f),...t.slice(f+1)])},onChange:b=>{i([...t.slice(0,f),b,...t.slice(f+1)])}},f))]})})},m6=({value:t=[],property:n,errors:s,updateValue:i,context:o})=>e.jsxs(W,{property:n,errors:s,context:o,children:[e.jsx(wr,{value:t,onChange:i}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while focusing an input to add a new set of inputs."))}})})]}),g6=l.label`
  display: flex;
  justify-content: start;

  ${si} {
    margin-bottom: 2px;
  }
`,f6=({value:t,property:n,updateValue:s})=>e.jsxs(ls,{$width:n.width,children:[e.jsx(g6,{children:e.jsxs(si,{children:[n.togglable&&e.jsx(en,{enabled:t.enabled,onClick:i=>s({...t,enabled:i})}),e.jsx(Fn,{children:u(n.label)})]})}),(!n.togglable||t.enabled)&&e.jsx(sr,{children:e.jsx("input",{type:"text",className:E("text","fullwidth"),placeholder:u("Label"),value:t.label??"",onChange:i=>s({...t,label:i.target.value})})})]}),b6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"})}),j6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M48 96V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V170.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H309.5c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8V184c0 13.3-10.7 24-24 24H104c-13.3 0-24-10.7-24-24V80H64c-8.8 0-16 7.2-16 16zm80-16v80H272V80H128zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"})}),y6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"})}),v6=l.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${m.sm};

  margin-top: ${m.sm};
`,w6=l.div`
  display: flex;
  gap: 2px;
`,ko=l.button`
  display: block;
  padding: 3px 5px;

  border-radius: ${S.md};
  font-size: 16px;

  &:not(.enabled) {
    opacity: 0.2;
  }

  &.submit {
    background-color: ${h.gray600} !important;
    fill: ${h.white} !important;
  }
`,$6=l.li`
  cursor: pointer;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 3px;

  border: 1px solid ${h.gray100};
  border-radius: ${S.md};
  background-color: ${h.gray100};

  transition: background-color 0.2s ease-in-out;

  ${ko} {
    fill: ${h.white};
    background: ${h.gray300};
  }

  &.active {
    border-color: ${h.gray500};
    background-color: ${h.gray500};

    ${ko} {
      background: ${h.white};
      fill: ${h.gray500};

      &.submit {
        background-color: ${h.gray200} !important;
        fill: ${h.gray600} !important;
      }
    }
  }

  &:not(.active):hover {
    background-color: ${h.gray200};
  }
`,C6={save:e.jsx(j6,{}),back:e.jsx(b6,{}),submit:e.jsx(y6,{})},k6=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{layouts:r}=n,a=o.order,c={save:o?.buttons?.save,back:o?.buttons?.back,submit:!0},d=[],p=r.map(x=>{const f=x.split(" ").map(b=>b.split("|").filter(j=>c.back||j!=="back").filter(j=>c.save||j!=="save").filter(j=>a!==0||j!=="back").filter(Boolean));return d.some(b=>Ds(b,f))?null:(d.push(f),{layout:x,groups:f})}).filter(Boolean);return e.jsx(W,{property:n,errors:s,children:e.jsx(v6,{children:p.map((x,f)=>e.jsx($6,{onClick:()=>i(x.layout),className:E(t===x.layout&&"active"),children:x.groups.map((b,j)=>e.jsx(w6,{children:b.map((y,w)=>e.jsx(ko,{className:E(y,c?.[y]&&"enabled"),children:C6[y]},w))},j))},f))})})},S6=t=>{switch(t){case Re.Elements:return{source:Re.Elements,typeClass:"",properties:{}};case Re.Predefined:return{source:Re.Predefined,typeClass:"",properties:{}};default:return{source:Re.Custom,useCustomValues:!1,options:[]}}};class $r extends ie.Component{constructor(n){super(n),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(n,s){console.error(n,s)}render(){return this.state.hasError?e.jsx("div",{children:this.props.message}):this.props.children}}l.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  width: 100%;
`;const L6=l.button`
  display: block;
  flex: 1;

  padding: ${m.xs} ${m.md};

  background-color: ${h.gray100};
  box-shadow: ${re.right};
  box-sizing: border-box;

  &.active {
    color: ${h.white};
    background-color: ${h.gray500};
  }

  &:first-child {
    border-top-left-radius: ${S.lg};
    border-bottom-left-radius: ${S.lg};
  }

  &:last-child {
    border-top-right-radius: ${S.lg};
    border-bottom-right-radius: ${S.lg};

    box-shadow: none;
  }
`,ys=l.div`
  display: flex;
  flex-direction: column;
  justify-content: ${t=>t.$justifyContent||"flex-start"};
  align-items: ${t=>t.$alignItems||"stretch"};
  gap: ${t=>t.$gap||m.sm};
`,pn=l.div`
  display: flex;
  justify-content: ${t=>t.$justifyContent||"flex-start"};
  align-items: ${t=>t.$alignItems||"stretch"};
  gap: ${t=>t.$gap||m.sm};
`,Nu=({value:t,updateValue:n,property:s,typeProviderQuery:i,convertToCustomValues:o})=>{const[r,a]=g.useState(t.typeClass),{data:c,isFetching:d}=i(),p=c?.find(x=>x.typeClass===r);return e.jsxs(ys,{children:[s.showEmptyOption&&e.jsx(je,{property:{type:K.String,label:"Empty Option Label (optional)",handle:"emptyOption"},context:t,value:t.emptyOption,updateValue:x=>{n({...t,emptyOption:x})}}),e.jsx(W,{property:{type:K.Select,label:"Type",handle:"predefinedOptionTypeClass",options:[]},children:e.jsx(de,{emptyOption:"Choose type",loading:d,value:t.typeClass,onChange:x=>{const f={},b=c?.find(j=>j.typeClass===x);b&&b.properties.forEach(j=>{f[j.handle]=j.value}),a(x),n({...t,typeClass:x,properties:f})},options:c?.map(x=>({label:x.name,value:x.typeClass}))})}),p?.properties.map(x=>{let f="";return t?.properties?.[x.handle]!==void 0?f=t.properties[x.handle]:x.value!==void 0&&(f=x.value),e.jsx(je,{property:x,context:t,value:f,updateValue:b=>{n({...t,properties:{...t.properties,[x.handle]:b}})}},x.handle)}),r&&I.limitations.can("layout.options.convert")&&e.jsx(ls,{className:"spacing-small",children:e.jsx(L6,{className:"btn small",onClick:()=>{confirm(u("Are you sure? This will allow you to customize and reorder the options, but they will become out of sync with the Element or Predefined options currently configured."))&&o()},children:u("Convert to Custom Values")})})]})},zu=()=>B({queryKey:["option-types","elements"],queryFn:()=>T.get("/api/types/options/elements").then(t=>t.data),staleTime:1/0}),F6=({value:t,updateValue:n,property:s,convertToCustomValues:i})=>e.jsx(Nu,{value:t,updateValue:n,property:s,defaultValue:"",updateDefaultValue:()=>{},typeProviderQuery:zu,convertToCustomValues:i}),E6=()=>B({queryKey:["option-types","predefined"],queryFn:()=>T.get("/api/types/options/predefined").then(t=>t.data),staleTime:1/0}),T6=({value:t,updateValue:n,property:s,convertToCustomValues:i})=>e.jsx(Nu,{value:t,updateValue:n,property:s,defaultValue:"",updateDefaultValue:()=>{},typeProviderQuery:E6,convertToCustomValues:i});var ee=(t=>(t.FieldType="field-type",t.FavoriteField="favorite-field",t.Field="field",t.Row="row",t.OptionRow="option-row",t.Page="page",t))(ee||{});const N6=t=>{const[{isDragging:n},s,i]=qo(()=>({type:ee.OptionRow,item:()=>({index:t}),collect:o=>({isDragging:o.isDragging()})}),[t]);return{isDragging:n,drag:s,preview:i}},z6=(t,n,s)=>{const[{handlerId:i},o]=ss(()=>({accept:ee.OptionRow,collect:r=>({handlerId:r.getHandlerId()}),hover:(r,a)=>{if(!n.current)return;const c=t,d=r.index;if(d===c)return;const p=n.current?.getBoundingClientRect(),x=(p.bottom-p.top)/2,b=a.getClientOffset().y-p.top;d<c&&b<x||d>c&&b>x||(s(d,c),r.index=c)}}),[n,s]);return{handlerId:i,drop:o}},Cr=({index:t,dragRef:n,onDrop:s,children:i})=>{const o=g.useRef(null),{handlerId:r,drop:a}=z6(t,o,s),{isDragging:c,drag:d,preview:p}=N6(t);return g.useEffect(()=>{d(n)},[d,n]),g.useEffect(()=>{a(p(o))},[a,p]),e.jsx(Qs,{ref:o,className:E(c&&"dragging"),"data-handler-id":r,children:i})},ri=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M336 176a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm-160 0a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM64 224a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM336 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM224 384a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM16 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z"})}),Mu=({value:t,property:n,context:s,errors:i,updateValue:o})=>{const{options:r,emptyOption:a}=n;return e.jsx(W,{property:n,errors:i,context:s,children:e.jsx(de,{value:t??"",emptyOption:a,options:r,onChange:o})})},M6=l(it)`
  min-width: 400px;
`,I6=({open:t,close:n,bulkImport:s})=>{const[i,o]=g.useState("|"),[r,a]=g.useState(!0),[c,d]=g.useState(""),p=g.useRef(null),x=()=>{s(c,i,r),d(""),n()};return ft({callback:f=>{f.key==="Enter"&&f.metaKey&&x()},meetsCondition:t,type:"keydown",ref:p},[c,i,r]),e.jsxs(M6,{className:"bulk-editor",children:[e.jsx(Mu,{value:i,updateValue:f=>o(f),property:{label:u("Separator"),instructions:u("Select the separator used to separate the option label and value when using custom values for option labels."),handle:"separator",type:K.Select,value:"|",options:[{value:"|",label:"|"},{value:",",label:","},{value:";",label:";"},{value:"=>",label:"=>"},{value:" ",label:"Space"}]}}),e.jsx(jn,{updateValue:f=>a(f),value:r,property:{label:u("Append Values"),handle:"append",type:K.Boolean}}),e.jsx(ds,{value:c,updateValue:f=>d(f),focus:t,ref:p,property:{label:u("Bulk Editor"),instructions:u("Enter bulk values separated by new lines. If using custom values for option labels, you can provide a label and a value separated by a separator. For example, if you used `{separator}` you would write: `Label{separator}value`.",{separator:i}),handle:"bulkEditor",type:K.Textarea,rows:10}}),e.jsx("button",{type:"button",className:"btn submit",onClick:x,children:u(r?"Append Options with Bulk Import":"Replace Options with Bulk Import")})]})},A6=l.div`
  display: flex;
  justify-content: space-between;
`,R6=l.div`
  flex: 0 1 auto;
`,Iu=l.button`
  display: flex;
  align-items: center;
  gap: ${m.sm};

  &:focus {
    outline: none;
    box-shadow: none;
  }

  span {
    white-space: nowrap;
  }

  &:hover {
    span {
      text-decoration: underline;
    }
  }
`;l.div`
  position: relative;
`;const Au=l.div`
  display: flex;
  flex-direction: column;
`,P6=({options:t,copyValues:n})=>{const[s,i]=g.useState(0),o=g.useCallback(()=>t.map(({label:r,value:a,optgroup:c})=>{const d=[];return c&&d.push("@@"),d.push(r),n&&d.push(`|${a}`),d.join("")}).join(`
`),[t,n]);return e.jsxs(Iu,{onClick:()=>{navigator.clipboard.writeText(o()),i(1),setTimeout(()=>i(0),2e3)},children:[e.jsx("i",{className:E(s===0&&"fa-classic fa-copy",s===1&&"fa-classic fa-check")}),e.jsx("span",{children:u(s===0?"Copy to clipboard":"Copied")})]})},pl=(t,n)=>({...t,options:[...t.options.slice(0,n),{label:"",value:""},...t.options.slice(n)]}),D6=(t,n)=>({...t,options:n}),Bi=(t,n,s)=>{const i=[...s.options];return i[t]=n,{...s,options:i}},B6=(t,n)=>{const s=n.options.filter((i,o)=>o!==t);return{...n,options:s}},O6=t=>({...t,options:t.options.filter(n=>!!n.label||!!n.value)}),_6=(t,n)=>n?{...t,useCustomValues:n}:{...t,useCustomValues:n,options:t.options.map(s=>({...s,value:s.label}))},W6=(t,n,s)=>{const i=[...t.options];return{...t,options:Xs(i,{$splice:[[n,1],[s,0,i[n]]]})}},U6=({value:t,updateValue:n,defaultValue:s,updateDefaultValue:i,isMultiple:o,allowOptgroup:r,autoUpdateHandle:a})=>{const[c,d]=g.useState(t),p=xs(c,500);g.useEffect(()=>{n(p)},[p,n]),g.useEffect(()=>{c.options.length||d(pl(c,0))},[c]);const{options:x=[],useCustomValues:f=!1}=c,b=g.useRef([]);b.current=x.map((F,N)=>b.current[N]||ie.createRef());const{activeCell:j,setActiveCell:y,setCellRef:w,keyPressHandler:v}=Nn(x.length,f?2:1),$=(F,N)=>{y(N!==void 0?N+1:x.length,F),d(pl(c,N===void 0?x.length:N+1))},C=(F,N,M)=>{let z=[];M&&(x[0]&&x[0].label===""&&x[0].value===""?z=[]:z=[...x]),F.split(`
`).forEach(L=>{let[A,D]=L.split(N);A=A.trim(),D=D?.trim();let ce=!1;A.startsWith("@@")&&(ce=!0,A=A.replace(/^@@/,"").trim()),!(!A&&!D)&&z.push({label:A,value:f&&D?D:A,optgroup:ce})}),d(D6(c,z))};return e.jsxs(it,{children:[e.jsxs(A6,{children:[e.jsx(jn,{property:{label:u("Use custom values"),handle:"useCustomValues",type:K.Boolean},value:f,updateValue:()=>d(_6(c,!f))}),e.jsxs(R6,{children:[e.jsx(Qe,{preview:e.jsxs(Iu,{children:[e.jsx("i",{className:"fa-duotone fa-list"}),e.jsx("span",{children:u("Add options in bulk")})]}),children:(F,N)=>e.jsx(I6,{open:F,close:N,bulkImport:C})}),e.jsx(P6,{options:c.options,copyValues:f})]})]}),!!x.length&&e.jsxs(Au,{children:[e.jsx(bs,{children:e.jsxs(js,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[r&&e.jsx("th",{children:u("Optgroup")}),e.jsx("th",{children:u("Label")}),f&&e.jsx("th",{children:u("Value")}),x.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("th",{children:u("Selected")}),e.jsx("th",{colSpan:2,children:u("Actions")})]})]})}),e.jsx("tbody",{children:x.map((F,N)=>e.jsxs(Cr,{index:N,dragRef:b.current[N],onDrop:(M,z)=>d(W6(c,M,z)),children:[r&&e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(en,{enabled:F.optgroup,onClick:M=>d(Bi(N,{...F,optgroup:M},c))})})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",value:F.label,placeholder:u("Label"),autoFocus:j===`${N}:0`,ref:M=>w(M,N,0),onFocus:()=>y(N,0),onKeyDown:v({onEnter:({shiftKey:M})=>{$(0,M?N:void 0)}}),onChange:M=>d(Bi(N,{...F,label:M.target.value,value:a||!f?M.target.value:F.value},c))})}),f&&e.jsx(ue,{children:e.jsx(ot,{type:"text",className:"code",value:F.value,placeholder:u("Value"),autoFocus:j===`${N}:1`,ref:M=>w(M,N,1),onFocus:()=>y(N,1),onKeyDown:v({onEnter:({shiftKey:M})=>{$(1,M?N:void 0)}}),onChange:M=>d(Bi(N,{...F,value:M.target.value},c))})}),x.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(jn,{property:{label:"",handle:`${N}-check`,type:K.Boolean,width:50},value:o?s.includes(F.value):F.value===s,updateValue:()=>{if(o){const M=s;i(M.includes(F.value)?M.filter(z=>z!==F.value):[...M,F.value])}else i(F.value===s?"":F.value)}})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{ref:b.current[N],className:"handle",children:e.jsx(ri,{})})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{onClick:()=>{d(B6(N,c)),y(Math.max(N-1,0),0)},children:e.jsx(gs,{})})})})]})]},N))})]})}),e.jsx(ms,{label:"Add an option",onClick:()=>$(0)})]}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},H6=l(ur)`
  display: flex;

  > div {
    &:first-child {
      flex-grow: 1;
    }

    &:nth-child(2) {
      flex-shrink: 0;
      flex-basis: 100px;
    }
  }
`,q6=({value:t})=>{const{options:n=[],useCustomValues:s}=t;return e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(Zt,{children:[!n.length&&e.jsx(kt,{children:u("Not configured yet")}),n.map((i,o)=>e.jsxs(H6,{children:[e.jsx(bn,{"data-empty":u("empty"),children:i.label}),s&&e.jsx(bn,{"data-empty":u("empty"),children:i.value})]},o))]})})},Q6=({value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,isMultiple:r,autoUpdateHandle:a})=>e.jsxs(e.Fragment,{children:[e.jsx(Fn,{children:u("Options")}),e.jsx(Qe,{preview:e.jsx(q6,{value:t,defaultValue:i,isMultiple:r}),excludeClassNames:["bulk-editor"],onAfterEdit:()=>n(O6(t)),children:e.jsx(U6,{value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,isMultiple:r,allowOptgroup:s.allowOptgroup,autoUpdateHandle:a})})]}),K6=Object.freeze(Object.defineProperty({__proto__:null,custom:Q6,elements:F6,predefined:T6},Symbol.toStringTag,{value:"Module"})),V6=K6,G6=({value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,convertToCustomValues:r,isMultiple:a,autoUpdateHandle:c})=>{const{source:d=Re.Custom}=t,p=V6[d];return p===void 0?e.jsxs("div",{children:[d," not implemented..."]}):(p.displayName=`Source <${d}>`,e.jsx($r,{message:`...${d} not implemented`,children:e.jsx(g.Suspense,{children:e.jsx(p,{value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,convertToCustomValues:r,isMultiple:a,autoUpdateHandle:c})})}))};l.div`
  display: flex;
  align-items: center;
  gap: 0px;

  margin-left: 5px;

  svg {
    width: 20px;
    height: 20px;
  }
`;const Y6=l.span`
  width: 200px;
  display: block;
  padding: 0 5px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  background: #00000005;
  color: ${h.gray300};
`,J6=({value:t,defaultValue:n,isMultiple:s,property:i,field:o})=>{const{getTranslation:r,updateTranslation:a}=Ce(o),c=t.source==="custom"&&t.options||[],d=r(i.handle,{}),p=d.options||[],x=d.defaultValue||n,f=g.useRef([]);f.current=c.map((v,$)=>f.current[$]||ie.createRef());const{activeCell:b,setActiveCell:j,setCellRef:y,keyPressHandler:w}=Nn(c.length,1);return e.jsx(it,{children:e.jsx(bs,{children:e.jsx(js,{children:e.jsx("tbody",{children:c.map((v,$)=>{const C=p.find(M=>M.value===v.value);let F=!1;x===void 0?s?F=n.includes(v.value):F=n===v.value:s?F=x.includes(v.value):F=x===v.value;const N=C!==void 0?C.label:v.label;return e.jsxs(Qs,{children:[e.jsx(ue,{style:{width:200},children:e.jsx(Y6,{className:"code",title:v.value,children:v.value||u("Empty")})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",value:N,placeholder:u("Label"),autoFocus:b===`${$}:0`,ref:M=>y(M,$,0),onFocus:()=>j($,0),onKeyDown:w(),onChange:M=>{const z=Mt(p),L=z.findIndex(A=>A.value===v.value);L===-1?z.push({value:v.value,label:M.target.value}):z[L].label=M.target.value,a(i.handle,{...d,options:z})}})}),e.jsx(ue,{$tiny:!0,children:e.jsx(en,{enabled:F,onClick:M=>{if(!s){a(i.handle,{...d,defaultValue:M?v.value:""});return}let z;typeof x=="object"?z=[...x]:z=[],M&&!z.includes(v.value)?z.push(v.value):!M&&z.includes(v.value)&&z.splice(z.indexOf(v.value),1),a(i.handle,{...d,defaultValue:z})}})})]},$)})})})})})},Z6=({value:t,defaultValue:n,isMultiple:s,field:i,property:o})=>{const{hasTranslation:r,getTranslation:a,removeTranslation:c}=Ce(i);if(t.source!=="custom")return null;const{options:d}=t,{handle:p}=o,f=a(p,{}).options||[];return e.jsxs(e.Fragment,{children:[e.jsx(wd,{label:"Options",handle:p,translatable:!0,hasTranslation:r(p),removeTranslation:()=>c(p)}),e.jsx(Qe,{preview:e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(Zt,{children:[!d.length&&e.jsx(kt,{children:u("Not configured yet")}),d.map((b,j)=>e.jsxs(ur,{children:[e.jsx(bn,{"data-empty":u("empty"),children:f.find(y=>y.value===b.value)?.label||b.label}),e.jsx(bn,{className:"code","data-empty":u("empty"),children:b.value})]},j))]})}),excludeClassNames:["bulk-editor"],children:e.jsx(J6,{value:t,defaultValue:n,isMultiple:s,field:i,property:o})})]})},X6=({value:t,field:n,property:s,context:i})=>{const{getTranslation:o,updateTranslation:r}=Ce(n),{data:a,isFetching:c}=zu();if(t.source!=="elements")return null;const{handle:d}=s,p=t.typeClass,x=a?.find(y=>y.typeClass===p),f=o(d,{}),b=f.emptyOption||"",j=f.properties||{};return e.jsx(W,{property:s,context:i,children:e.jsxs(ys,{children:[s.showEmptyOption&&e.jsx(je,{property:{type:K.String,label:"Empty Option Label (optional)",handle:"emptyOption"},context:t,value:b,updateValue:y=>{r(d,{...f,emptyOption:y})}}),e.jsx(W,{property:{type:K.Select,label:"Type",handle:"predefinedOptionTypeClass",options:[]},children:e.jsx(de,{emptyOption:"Choose type",loading:c,value:t.typeClass,options:[{label:x?.name||"",value:x?.typeClass||""}]})}),x?.properties.map(y=>{let w="";return j?.[y.handle]!==void 0?w=j[y.handle]:t.properties[y.handle]!==void 0&&(w=t.properties[y.handle]),e.jsx(je,{property:y,context:t,value:w,updateValue:v=>{r(d,{...f,properties:{...f.properties,[y.handle]:v}})}},y.handle)})]})})},e8=t=>{const{value:n}=t;switch(n.source){case"custom":return e.jsx(Z6,{...t});case"elements":return e.jsx(X6,{...t});default:return null}},t8=({value:t,errors:n,property:s,updateValue:i,context:o})=>{const{source:r}=t,a=o.properties.defaultValue,c=Me(o.typeClass),d=c?.implements.includes("multiValue"),p=o?.id===void 0,{willTranslate:x}=Ce(o),[f]=oi(o,c),b=H(),j=w=>{b(be.edit({uid:o.uid,handle:"defaultValue",value:w}))},y=()=>i({source:Re.Custom,useCustomValues:!0,options:[...f]});return x(s.handle)?e.jsx(e8,{property:s,value:t,field:o,defaultValue:a,isMultiple:d,context:o}):e.jsxs(e.Fragment,{children:[I.editions.isAtLeast(oe.Lite)&&e.jsxs(ls,{$width:s.width,children:[e.jsx(Fn,{children:u("Source")}),e.jsx(hr,{options:P3,value:r,onClick:w=>{w!==r&&i(S6(w))}})]}),e.jsx(G6,{value:t,updateValue:i,property:s,defaultValue:a,updateDefaultValue:j,convertToCustomValues:y,isMultiple:d,allowOptgroup:s.allowOptgroup,autoUpdateHandle:p}),e.jsx(ti,{errors:n})]})},n8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m120.714 94.857c-14.302 0-25.857 11.555-25.857 25.857v258.572c0 14.302 11.555 25.857 25.857 25.857h258.572c14.302 0 25.857-11.555 25.857-25.857v-258.572c0-14.302-11.555-25.857-25.857-25.857zm-51.714 25.857c0-28.523 23.191-51.714 51.714-51.714h258.572c28.523 0 51.714 23.191 51.714 51.714v258.572c0 28.523-23.191 51.714-51.714 51.714h-258.572c-28.523 0-51.714-23.191-51.714-51.714zm267.702 86.703-103.428 103.428c-5.01 5.01-13.252 5.01-18.262 0l-51.714-51.714c-5.01-5.01-5.01-13.252 0-18.262s13.252-5.01 18.261 0l42.584 42.584 94.298-94.298c5.009-5.01 13.251-5.01 18.261 0s5.01 13.252 0 18.262z"})]}),s8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m107.143 421.429c-15.804 0-28.572-12.768-28.572-28.572v-285.714c0-15.804 12.768-28.572 28.572-28.572h285.714c15.804 0 28.572 12.768 28.572 28.572v285.714c0 15.804-12.768 28.572-28.572 28.572zm-57.143-28.572c0 31.518 25.625 57.143 57.143 57.143h285.714c31.518 0 57.143-25.625 57.143-57.143v-285.714c0-31.518-25.625-57.143-57.143-57.143h-285.714c-31.518 0-57.143 25.625-57.143 57.143zm200-57.143c8.571 0 16.696-3.571 22.5-9.821l85.268-91.786c4.196-4.553 6.518-10.536 6.518-16.696 0-13.572-10.982-24.554-24.554-24.554h-179.464c-13.572 0-24.554 10.982-24.554 24.554 0 6.16 2.322 12.143 6.518 16.696l85.268 91.786c5.804 6.25 13.929 9.821 22.5 9.821zm-1.518-29.196-79.018-85.089h161.072l-78.929 85.089c-.357.446-.982.625-1.518.625-.535 0-1.16-.268-1.518-.625z"})]}),i8=t=>e.jsxs(R,{height:"500",viewBox:"0 0 500 500",width:"500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m380.843 92.184c-24.515-24.514-64.277-24.514-88.791 0l-161.743 161.744c-39.425 39.425-39.425 103.28 0 142.705s103.28 39.425 142.705 0l128.047-128.047c5.223-5.223 13.815-5.223 19.038 0s5.223 13.815 0 19.038l-128.047 128.047c-49.955 49.955-130.911 49.955-180.782 0s-49.955-130.827 0-180.782l161.744-161.743c35.044-35.045 91.823-35.045 126.867 0 35.045 35.044 35.045 91.823 0 126.867l-154.835 154.836c-23.757 23.756-62.844 21.566-83.905-4.633-17.943-22.409-16.174-54.757 4.128-75.059l127.963-127.879c5.223-5.223 13.815-5.223 19.038 0s5.223 13.816 0 19.039l-127.878 127.878c-10.615 10.615-11.541 27.463-2.19 39.172 10.951 13.647 31.337 14.827 43.721 2.443l154.92-154.835c24.514-24.514 24.514-64.276 0-88.791z"})]}),o8=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M352 128L352 96L288 96L288 288L96 288L96 352L288 352L288 544L352 544L352 352L544 352L544 288L352 288L352 128z"})}),r8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m52 108.571c0-15.621 12.664-28.285 28.286-28.285 15.621 0 28.285 12.664 28.285 28.285 0 15.622-12.664 28.286-28.285 28.286-15.622 0-28.286-12.664-28.286-28.286zm84.857 0c0-31.243-25.328-56.571-56.571-56.571-31.244 0-56.572 25.328-56.572 56.571 0 31.244 25.328 56.572 56.572 56.572 31.243 0 56.571-25.328 56.571-56.572zm56.572 0c0 7.779 6.364 14.143 14.142 14.143h254.572c7.778 0 14.143-6.364 14.143-14.143 0-7.778-6.365-14.142-14.143-14.142h-254.572c-7.778 0-14.142 6.364-14.142 14.142zm0 141.429c0 7.779 6.364 14.143 14.142 14.143h254.572c7.778 0 14.143-6.364 14.143-14.143s-6.365-14.143-14.143-14.143h-254.572c-7.778 0-14.142 6.364-14.142 14.143zm0 141.429c0 7.778 6.364 14.142 14.142 14.142h254.572c7.778 0 14.143-6.364 14.143-14.142 0-7.779-6.365-14.143-14.143-14.143h-254.572c-7.778 0-14.142 6.364-14.142 14.143zm-113.143-113.143c-15.622 0-28.286-12.664-28.286-28.286s12.664-28.286 28.286-28.286c15.621 0 28.285 12.664 28.285 28.286s-12.664 28.286-28.285 28.286zm0-84.857c-31.244 0-56.572 25.327-56.572 56.571s25.328 56.571 56.572 56.571c31.243 0 56.571-25.327 56.571-56.571s-25.328-56.571-56.571-56.571zm14.143-84.858c0-7.81-6.332-14.142-14.143-14.142s-14.143 6.332-14.143 14.142c0 7.811 6.332 14.143 14.143 14.143s14.143-6.332 14.143-14.143zm-42.429 282.858c0-15.622 12.664-28.286 28.286-28.286 15.621 0 28.285 12.664 28.285 28.286 0 15.621-12.664 28.285-28.285 28.285-15.622 0-28.286-12.664-28.286-28.285zm84.857 0c0-31.244-25.328-56.572-56.571-56.572-31.244 0-56.572 25.328-56.572 56.572 0 31.243 25.328 56.571 56.572 56.571 31.243 0 56.571-25.328 56.571-56.571z"})]}),a8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m62 132.5c-12.998 0-23.5 10.502-23.5 23.5v188c0 12.998 10.502 23.5 23.5 23.5h376c12.998 0 23.5-10.502 23.5-23.5v-188c0-12.998-10.502-23.5-23.5-23.5zm-47 23.5c0-25.923 21.077-47 47-47h376c25.923 0 47 21.077 47 47v188c0 25.923-21.077 47-47 47h-376c-25.923 0-47-21.077-47-47zm94 35.25v117.5c0 6.462-5.287 11.75-11.75 11.75s-11.75-5.288-11.75-11.75v-117.5c0-6.463 5.287-11.75 11.75-11.75s11.75 5.287 11.75 11.75z"})]}),l8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m439.507 97.861 8.519 8.519c8.948 8.948 8.948 23.48 0 32.357l-19.114 19.185-40.804-40.804 18.899-19.185c8.948-9.02 23.48-9.092 32.5-.072zm-169.373 138.663 101.867-103.156 40.732 40.733-102.439 102.511c-3.15 3.15-7.159 5.298-11.526 6.228l-44.025 9.235 9.234-44.169c.931-4.295 3.007-8.232 6.157-11.382zm120.623-154.698-136.945 138.591c-6.156 6.228-10.452 14.174-12.241 22.764l-12.886 61.35c-.787 3.794.358 7.731 3.078 10.451 2.721 2.721 6.658 3.938 10.452 3.079l61.206-12.814c8.734-1.862 16.68-6.157 22.979-12.456l137.876-137.804c17.896-17.896 17.896-46.889 0-64.785l-8.519-8.591c-17.968-17.968-47.104-17.896-65 .215zm-322.64 75.094c-25.27 0-45.815 20.545-45.815 45.815v183.261c0 25.27 20.545 45.815 45.815 45.815h320.707c25.27 0 45.815-20.545 45.815-45.815v-125.992c0-6.299-5.154-11.454-11.454-11.454s-11.454 5.155-11.454 11.454v125.992c0 12.671-10.237 22.908-22.907 22.908h-320.707c-12.671 0-22.907-10.237-22.907-22.908v-183.261c0-12.671 10.236-22.907 22.907-22.907h171.807c6.3 0 11.454-5.155 11.454-11.454 0-6.3-5.154-11.454-11.454-11.454zm45.815 154.626c9.489 0 17.181-7.692 17.181-17.18 0-9.489-7.692-17.181-17.181-17.181-9.488 0-17.18 7.692-17.18 17.181 0 9.488 7.692 17.18 17.18 17.18zm85.904-17.18c0-9.489-7.692-17.181-17.181-17.181-9.488 0-17.18 7.692-17.18 17.181 0 9.488 7.692 17.18 17.18 17.18 9.489 0 17.181-7.692 17.181-17.18z"})]}),c8=l.input`
  position: relative;

  appearance: none;
  display: grid;
  place-content: center;

  width: 1.15em;
  height: 1.15em;
  margin: 0;

  background-color: #fbfcfe;
  border: 1px solid #b9c6d7;
  border-radius: 3px;

  font: inherit;
  color: currentColor;
  transform: translateY(-0.075em);

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
  }

  &:before {
    content: 'check';

    position: absolute;
    top: -1px;
    left: 1px;

    font-family: Craft;
    transform: scale(0);
    transition: 80ms transform ease-in-out;
  }

  &:checked {
    &:before {
      transform: scale(1);
    }
  }
`,ct=t=>e.jsx(c8,{type:"checkbox",...t}),d8=({column:t,onUpdate:n})=>{const s=g.useId(),i=t.checked??!1;return e.jsx(ys,{$gap:m.lg,children:e.jsxs(pn,{$alignItems:"center",children:[e.jsx(ct,{id:s,checked:i,onChange:()=>n({...t,checked:!t.checked})}),e.jsx("label",{htmlFor:s,children:u(i?"checked by default":"unchecked by default")})]})})},u8=(t,n)=>[...t.slice(0,n),"",...t.slice(n)],p8=(t,n,s)=>{const i=[...s];return i[t]=n,i},hl=(t,n)=>n.filter((s,i)=>i!==t),h8=(t,n,s)=>Xs(t,{$splice:[[n,1],[s,0,t[n]]]}),xl=(t=[],n=[])=>t.length===n.length&&t.every((s,i)=>s===n[i]),x8=({column:t,onUpdate:n})=>{const[s,i]=g.useState(t.options?.length?t.options:[""]),o=xs(s,500),r=g.useRef(t);g.useEffect(()=>{r.current=t},[t]);const a=g.useRef(n);g.useEffect(()=>{a.current=n},[n]),g.useEffect(()=>{const y=t.options?.length?t.options:[""];i(w=>xl(w,y)?w:y)},[t.options]),g.useEffect(()=>{const y=r.current,w=y.value,v=o.includes(w)?w:"";xl(y.options??[],o)&&y.value===v||a.current({...y,options:o,value:v})},[o]);const c=g.useRef([]);c.current=s.map((y,w)=>c.current[w]||ie.createRef());const{activeCell:d,setActiveCell:p,setCellRef:x,keyPressHandler:f}=Nn(s.length,1),b=(y,w)=>{p(w!==void 0?w+1:s.length,y),i(u8(s,w===void 0?s.length:w+1))},j=y=>{const w=r.current,v=w.value===y?"":y,$={...w,options:s,value:v};r.current=$,a.current($)};return e.jsxs(e.Fragment,{children:[e.jsxs(Au,{children:[e.jsx(bs,{children:e.jsxs(js,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Label")}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("th",{children:u("Selected")}),e.jsx("th",{colSpan:2,children:u("Actions")})]})]})}),e.jsx("tbody",{children:s.map((y,w)=>e.jsxs(Cr,{index:w,dragRef:c.current[w],onDrop:(v,$)=>i(h8(s,v,$)),children:[e.jsx(ue,{children:e.jsx(ot,{type:"text",value:y,placeholder:u("Label"),autoFocus:d===`${w}:0`,ref:v=>x(v,w,0),onFocus:()=>p(w,0),onKeyDown:f({onEnter:({shiftKey:v})=>{b(0,v?w:void 0)},onDelete:()=>{if(s.length>1){const v=hl(w,s),$=r.current,C={...$,options:v,value:$.value===y?"":$.value};r.current=C,a.current(C),i(v),p(Math.max(w-1,0),0)}}}),onChange:v=>{const $=p8(w,v.target.value,s),C=r.current;if(C.value===y){const F={...C,value:v.target.value,options:$};r.current=F,a.current(F)}i($)}})}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(jn,{property:{label:"",handle:`${w}-check`,type:K.Boolean,width:50},value:t.value===y,updateValue:()=>j(y)})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{ref:c.current[w],className:"handle",children:e.jsx(ri,{})})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{onClick:()=>{const v=hl(w,s),$=r.current,C={...$,options:v,value:$.value===y?"":$.value};r.current=C,a.current(C),i(v),p(Math.max(w-1,0),0)},children:e.jsx(gs,{})})})})]})]},w))})]})}),e.jsx(ms,{label:u("Add an option"),onClick:()=>b(0)})]}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},m8={fileCount:1,maxFileSizeKB:2048,fileKinds:["image"],assetSourceId:null,uploadLocation:null},g8=[{value:"image",label:"Image"},{value:"video",label:"Video"},{value:"audio",label:"Audio"},{value:"text",label:"Text"},{value:"pdf",label:"PDF"},{value:"json",label:"JSON"}],f8=({column:t,onUpdate:n,property:s})=>{const i={...m8,...t.metadata||{}},o=(x=[])=>x.flatMap(f=>"children"in f?o(f.children):f),r=o(s?.fileKindsOptions),a=r.length?r:g8,c=o(s?.assetSourceOptions),d=x=>{n({...t,metadata:{...i,...x}})},p=x=>{const f=new Set(i.fileKinds);f.has(x)?f.delete(x):f.add(x),d({fileKinds:Array.from(f)})};return e.jsxs(ys,{$gap:m.lg,children:[e.jsxs(pn,{$gap:m.md,children:[e.jsx(W,{width:40,label:u("Max Files"),handle:"fileCount",children:e.jsx("input",{type:"number",min:1,className:"text fullwidth",value:i.fileCount,onChange:x=>d({fileCount:Math.max(1,Number(x.target.value)||1)})})}),e.jsx(W,{width:60,label:u("Maximum File Size (KB)"),handle:"maxFileSizeKB",children:e.jsx("input",{type:"number",min:1,className:"text fullwidth",value:i.maxFileSizeKB,onChange:x=>d({maxFileSizeKB:Math.max(1,Number(x.target.value)||1)})})})]}),e.jsxs(pn,{children:[e.jsx(W,{width:40,label:u("Asset Source"),handle:"assetSourceId",instructions:u("Select an asset source to be able to store user uploaded files."),children:e.jsx(de,{emptyOption:u("Select source"),value:i.assetSourceId?String(i.assetSourceId):"",options:c,onChange:x=>d({assetSourceId:x?Number(x):null})})}),e.jsx(W,{width:60,label:u("Upload Location"),handle:"uploadLocation",instructions:u("The subfolder path that files should be uploaded to. May contain `{{ form.handle }}` or `{{ form.id }}` variables as well."),children:e.jsx("input",{type:"text",className:"text fullwidth",value:i.uploadLocation||"",onChange:x=>d({uploadLocation:x.target.value||null})})})]}),e.jsx(W,{label:u("File Kinds"),handle:"fileKinds",children:e.jsx(Yf,{children:a.map(x=>e.jsx("label",{children:e.jsxs(pn,{$alignItems:"center",$gap:m.sm,children:[e.jsx(ct,{checked:i.fileKinds.includes(x.value),onChange:()=>p(x.value)}),e.jsx("span",{children:x.label})]})},x.value))})})]})},b8=({column:t,onUpdate:n})=>e.jsxs(ys,{$gap:m.lg,children:[e.jsx(W,{label:u("Default value"),handle:"value",children:t.type==="textarea"?e.jsx("textarea",{className:"text fullwidth",rows:4,value:t.value,onChange:s=>n({...t,value:s.target.value})}):e.jsx("input",{type:"text",className:"text fullwidth",value:t.value,onChange:s=>n({...t,value:s.target.value})})}),e.jsx(W,{label:u("Placeholder"),handle:"placeholder",children:e.jsx("input",{type:"text",className:"text fullwidth",value:t.placeholder||"",onChange:s=>n({...t,placeholder:s.target.value})})})]}),j8=(t,n)=>[...t.slice(0,n+1),{label:"",type:"text",value:""},...t.slice(n+1)],Fs=(t,n,s)=>{const i=[...s];return i[t]=n,i},y8=(t,n)=>n.filter((s,i)=>i!==t),v8=(t,n,s)=>{const i=[...s];return Xs(i,{$splice:[[t,1],[n,0,i[t]]]})},w8=t=>t.filter(n=>!!n.label||!!n.value),$8={fileCount:1,maxFileSizeKB:2048,fileKinds:["image"],assetSourceId:null,uploadLocation:null},C8=(t,n)=>n==="file"?{...t,type:n,metadata:{...$8,...t.metadata||{}}}:{...t,type:n,metadata:{}},Oi={text:e.jsx(a8,{}),textarea:e.jsx(l8,{}),select:e.jsx(s8,{}),radio:e.jsx(r8,{}),checkbox:e.jsx(n8,{}),file:e.jsx(i8,{})},k8=({columnTypes:t,columns:n,updateValue:s,property:i,context:o})=>{const[r,a]=g.useState(0),{getTranslation:c,willTranslate:d}=Ce(o),p=g.useRef(null),x=g.useRef(null),f=g.useRef([]),b=g.useRef(!1),j=g.useRef(new WeakMap),y=g.useRef(0),w=d(i.handle),v=c(i.handle,n),$=w?v:n,C=g.useMemo(()=>$[r],[r,$]),F=L=>{const A=j.current.get(L);if(A)return A;const D=`table-column-${y.current++}`;return j.current.set(L,D),D},N=g.useMemo(()=>t.reduce((L,A)=>(A.value in Oi&&L.push({...A,icon:Oi[A.value]}),L),[]),[t]);g.useEffect(()=>{p.current?.focus()},[r,$.length]),g.useEffect(()=>{f.current[r]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"}),b.current&&(b.current=!1,p.current?.scrollIntoView({behavior:"smooth",block:"nearest"}))},[r,$.length]),g.useEffect(()=>{if(!x.current||$.length<2)return;const L=Ne.create(x.current,{animation:150,draggable:".table-column-tab",handle:".column-drag-handle",onEnd:A=>{const D=A.oldIndex,ce=A.newIndex;D===void 0||ce===void 0||D===ce||(s(v8(D,ce,$)),a(pe=>pe===D?ce:D<pe&&pe<=ce?pe-1:ce<=pe&&pe<D?pe+1:pe))}});return()=>{L.destroy()}},[$,s]);const M=()=>{const L=$.length;s([...$,{label:"New column",type:"text",value:""}]),b.current=!0,a(L)},z=L=>{if($.length<=1)return;const A=y8(L,$);let D=r;r>L?D=r-1:r===L&&(D=Math.max(0,L-1)),s(A),a(D)};return e.jsx(Zd,{children:e.jsxs(bs,{children:[e.jsxs(Jf,{children:[e.jsx(Hf,{ref:x,children:$.length>0&&$.map((L,A)=>e.jsxs("a",{className:E("table-column-tab",L.required&&"required",A===r&&"active"),ref:D=>{f.current[A]=D},onClick:()=>a(A),children:[e.jsx(hd,{children:Oi[L.type]}),e.jsx(qf,{children:u(L.label)}),$.length>1&&e.jsx(Gf,{type:"button",className:"column-drag-handle",title:u("Reorder column"),onClick:D=>{D.preventDefault(),D.stopPropagation()},children:e.jsx(ri,{})}),A===r&&$.length>1&&e.jsx(Vf,{type:"button",title:u("Remove column"),onClick:D=>{D.preventDefault(),D.stopPropagation(),z(A)},children:e.jsx(gs,{})})]},F(L)))}),e.jsx(Kf,{type:"button",className:"btn",title:u("Add column"),onClick:M,children:e.jsx(o8,{})})]}),e.jsxs(Zf,{children:[e.jsxs(pn,{children:[e.jsx(W,{width:60,label:u("Label"),handle:"label",children:e.jsx("input",{type:"text",className:"text fullwidth",ref:p,value:C?.label,onChange:L=>s(Fs(r,{...C,label:L.target.value},$))})}),e.jsx(W,{width:30,label:u("Column Type"),handle:"type",children:e.jsx(de,{showSelectedIcon:!0,emptyOption:"Select Type",value:C?.type,options:N,onChange:L=>{s(Fs(r,C8(C,L),$))}})}),e.jsx(W,{width:10,label:u("Required"),handle:"required",justify:"center",children:e.jsx(en,{enabled:!!C?.required,onClick:L=>{s(Fs(r,{...C,required:L},$))}})})]}),S8(C,L=>s(Fs(r,L,$)),i)]})]})})},S8=(t,n,s)=>t?["text","textarea"].includes(t.type)?e.jsx(b8,{column:t,onUpdate:n}):["select","radio"].includes(t.type)?e.jsx(x8,{column:t,onUpdate:n}):t.type==="checkbox"?e.jsx(d8,{column:t,onUpdate:n}):t.type==="file"?e.jsx(f8,{column:t,onUpdate:n,property:s}):null:null,L8=(t,n)=>t.find(s=>s.value===n)?.label||n,F8=({columnTypes:t,columns:n})=>e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(Zt,{children:[!n.length&&e.jsx(kt,{children:u("Not configured yet")}),n.map((s,i)=>e.jsxs(ur,{"data-title":L8(t,s.type),children:[e.jsx(bn,{"data-empty":u("empty"),className:E(s.required&&"required"),children:s.label}),e.jsx(bn,{"data-empty":u("empty"),children:E8(s)})]},i))]})}),E8=t=>t.type==="checkbox"?e.jsx(ct,{readOnly:!0,checked:!!t.checked}):t.type==="select"?e.jsx("div",{className:E("small select"),children:e.jsx("select",{disabled:!0,children:e.jsx("option",{children:t.value})})}):e.jsx(e.Fragment,{children:t.value}),T8=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{options:r}=n;return e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(Qe,{preview:e.jsx(F8,{columnTypes:r,columns:t}),onAfterEdit:()=>i(w8(t)),onEdit:()=>{t.length||i(j8(t,0))},children:e.jsx(k8,{columnTypes:r,columns:t,updateValue:i,property:n,context:o})})})},Ru=(t,n,s)=>[...t.slice(0,s+1),[...n.map(()=>"")],...t.slice(s+1)],ml=(t,n,s)=>{const i=[...s];return i[t]=n,i},N8=(t,n)=>n.filter((s,i)=>i!==t),z8=(t,n,s)=>{const i=[...s];return Xs(i,{$splice:[[t,1],[n,0,i[t]]]})},M8=t=>t.filter(n=>n.filter(Boolean).length!==0),I8=({configuration:t,values:n,updateValue:s,property:i,context:o})=>{const{getTranslation:r,updateTranslation:a,willTranslate:c}=Ce(o),{handle:d}=i,p=c(d),x=r(d,n),f=g.useRef([]);f.current=n.map(($,C)=>f.current[C]||ie.createRef());const{activeCell:b,setActiveCell:j,setCellRef:y,keyPressHandler:w}=Nn(n.length,t.length),v=($,C)=>{p||(j(C!==void 0?C+1:n.length,$),s(Ru(n,t,C!==void 0?C:n.length)))};return e.jsxs(Zd,{children:[e.jsx(bs,{children:e.jsx(js,{children:e.jsx("tbody",{children:n.map(($,C)=>e.jsxs(Cr,{index:C,dragRef:f.current[C],onDrop:(F,N)=>s(z8(F,N,n)),children:[t.map((F,N)=>e.jsx(ue,{children:e.jsx(ot,{type:"text",value:$[N],placeholder:u(F.label),autoFocus:b===`${C}:${N}`,disabled:p&&!F.translatable,ref:M=>y(M,C,N),onFocus:()=>j(C,N),onKeyDown:w({onEnter:M=>{v(0,M.shiftKey?C:void 0)}}),onChange:M=>{if(p){if(!F.translatable)return;a(i.handle,ml(C,[...x[C].slice(0,N),M.target.value,...x[C].slice(N+1)],x));return}s(ml(C,[...n[C].slice(0,N),M.target.value,...n[C].slice(N+1)],n))}})},N)),n.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(ue,{$tiny:!0,children:e.jsx(Bt,{ref:f.current[C],className:"handle",children:e.jsx(ri,{})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Bt,{onClick:()=>{s(N8(C,n)),j(Math.max(C-1,0),0)},children:e.jsx(gs,{})})})]})]},C))})})}),e.jsx(ms,{label:"Add a row",onClick:()=>v(0),disabled:p}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},A8=({configuration:t,values:n})=>e.jsx(t3,{"data-edit":u("Click to edit data"),children:e.jsxs(n3,{children:[!n.length&&e.jsx(gr,{children:u("Not configured yet")}),n.map((s,i)=>e.jsx(s3,{children:t.map((o,r)=>e.jsx(i3,{"data-empty":u("empty"),"data-title":o.label,children:s[r]},r))},i))]})}),R8=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{configuration:r}=n;return e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(Qe,{preview:e.jsx(A8,{configuration:r,values:t}),onAfterEdit:()=>i(M8(t)),onEdit:()=>{t.length||i(Ru(t,r,0))},children:e.jsx(I8,{configuration:r,values:t,updateValue:i,property:n,context:o})})})},P8=({value:t,updateValue:n})=>e.jsx("input",{className:"input text fullwidth",type:"text",value:t,onChange:s=>n(s.target.value)}),D8=l.div`
  .tox {
    border: 1px solid #d1d1d1;
    border-radius: 0;
    padding: 0;
  }
`,B8=({value:t,menu:n,statusbar:s,toolbar:i,updateValue:o})=>{const{metadata:{tinymce:{stylesPath:r}}}=I;return e.jsx(it,{children:e.jsx(cr,{children:e.jsx(D8,{children:e.jsx(xc,{init:{menubar:n,statusbar:s,promotion:!1,content_css:r,relative_urls:!1,remove_script_host:!1},value:t,onEditorChange:o,plugins:O8,toolbar:i,licenseKey:"gpl"})})})})},O8=["autolink","code","codesample","image","link","lists","media","searchreplace","table"];l.pre`
  font-size: 10px;
`;const _8=l(Zt)`
  height: auto;
  min-height: 30px;
  padding: ${m.sm};

  a {
    pointer-events: none;
  }
`,W8=({value:t})=>e.jsx(Jt,{"data-edit":u("Click to edit data"),children:e.jsxs(_8,{children:[!t&&e.jsx(kt,{children:u("Not configured yet")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(t)}})]})}),U8=({value:t,property:n,updateValue:s})=>e.jsx(Qe,{preview:e.jsx(W8,{value:t}),excludeClassNames:["tox"],children:e.jsx(B8,{menu:n.menu,statusbar:n.statusbar,toolbar:n.toolbar,value:t,updateValue:s})}),H8=l.div`
  margin-bottom: ${m.sm};
`,q8=/<[^>]*>/,Q8=t=>t?q8.test(t):!1,K8=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const r=x=>Craft.t("freeform",x),a=g.useMemo(()=>n.toggleEditor?Q8(t)?"rich":"plain":"rich",[n.toggleEditor,t]),[c,d]=g.useState(a),p=x=>{if(d(x),x==="plain"&&t){const f=document.createElement("div");f.innerHTML=O.sanitize(t),i(f.textContent||"")}};return e.jsxs(W,{property:n,errors:s,context:o,children:[n.toggleEditor&&e.jsx(H8,{children:e.jsx(hr,{value:c,options:[{value:"plain",label:r("Plain Text")},{value:"rich",label:r("Rich Text")}],onClick:p})}),c==="rich"?e.jsx(U8,{value:t,property:n,updateValue:i}):e.jsx(P8,{value:t,updateValue:i})]})},V8=Object.freeze(Object.defineProperty({__proto__:null,aiBox:Nf,appStateSelect:zf,assetPicker:Pf,attributes:m4,bool:jn,boolEnv:$4,buttonGroup:S4,calculationBox:W4,cards:m3,checkboxes:H4,codeEditor:G4,colorPicker:t5,conditionalIntegrationRule:W3,conditionalNotificationRule:X3,datePicker:so,dynamicCheckboxes:o5,dynamicSelect:r5,field:a5,fieldMapping:T3,fieldType:y5,formMonitorTools:Z3,hidden:v5,int:w5,label:E5,minMax:M5,notificationTemplate:t6,options:t8,pageButton:f6,pageButtonLayout:k6,recipientMapping:x6,recipients:m6,select:Mu,string:Dt,table:T8,tabularData:R8,textarea:ds,wysiwyg:K8},Symbol.toStringTag,{value:"Module"})),G8=l.div`
  position: relative;
  min-height: 10px;

  &:before {
    content: '';
    position: absolute;
    top: 9px;
    left: 0;
    right: 0;
    z-index: 1;

    height: 1px;
    margin: 0 var(--margins);

    box-shadow: ${re.bottom};
  }

  div {
    position: absolute;
    left: -5px;
    top: 0;
    z-index: 2;

    background: var(--background-color);
    padding: 0 5px;

    ${_e};
    font-size: 11px;

    &:empty {
      display: none;
    }
  }
`,Y8=({delimiter:t})=>t?e.jsx(G8,{children:e.jsx("div",{children:t.name})}):null,J8=(t,n)=>{const s=P(et.current);return g.useMemo(()=>{if(t.length===0)return!0;const i={config:I,page:s};try{return qd(t,n,i)}catch(o){return console.error(`Failed to evaluate visibility expression: ${t.join(" && ")}`,o),!1}},[t,n,s])},Z8=V8,je=({value:t,updateValue:n,property:s,errors:i,context:o,autoFocus:r=!1})=>{const{handle:a,type:c,visibilityFilters:d}=s,p=Z8[c],x=J8(d||[],o);return p===void 0?e.jsx("div",{children:`[${a}]: <${c}>`}):(p.displayName=`FormComponent: <${c}>`,x?e.jsx($r,{message:`...${a} <${c}>`,children:e.jsxs(g.Suspense,{children:[e.jsx(Y8,{delimiter:s.delimiter}),e.jsx(p,{value:t,property:s,updateValue:n,errors:i,context:o,autoFocus:r})]})}):null)},gl=kb,fl=(t,n,s,i)=>{let o=t;return n?.forEach(r=>{const[a,c]=r;gl[a]&&(o=gl[a](t,c,s,i))}),o},vs=(t,n,s)=>{const{isPrimary:i}=Fe(),r=P(Pe.settings.one("general"))?.translations;return g.useCallback(a=>{if(!a.disabled)return r&&!i?c=>{s(a.handle,c)}:c=>{const d=(p,x)=>{const f=t.find(b=>b.handle===p);!f||f.disabled||s(f.handle,fl(x,f.middleware,n))};s(a.handle,fl(c,a.middleware,n,d))}},[t,n,s,i,r])},X8=({namespace:t,property:n})=>{const s=H(),{data:i}=Gt(),o=i.find(y=>y.handle===t).properties,r=P(Pe.errors),a=P(Pe.current),d={...P(Pe.settings.one(t)),isNew:a.isNew,namespaceType:"settings",namespace:t},{getTranslation:p,updateTranslation:x}=Ce(d),f=p(n.handle,d[n.handle]),b=vs(o,d,(y,w)=>{x(y,w)||s(gt.modifySettings({namespace:t,key:y,value:w}))}),j=r?.[t]?.[n.handle];return e.jsx(je,{value:f,property:n,updateValue:b(n),errors:j,context:d})},ej=t=>e.jsxs(R,{viewBox:"0 0 512 512",...t,children:[e.jsx("path",{className:"fa-secondary",opacity:".4",d:"M48 480c26.5 0 48-21.5 48-48L96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L96 480l-48 0zM160 120l0 80c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24l0-80c0-13.3-10.7-24-24-24L184 96c-13.3 0-24 10.7-24 24zm0 184c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zM368 112c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16z"}),e.jsx("path",{className:"fa-primary",d:"M0 160L0 432c0 26.5 21.5 48 48 48s48-21.5 48-48L96 96 64 96C28.7 96 0 124.7 0 160zM384 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0zm0 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0zM176 288c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0zm0 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0z"})]}),tj=()=>{const{data:t,isFetching:n}=Bh(),s=st("");return I.metadata.craft.is5?e.jsxs(rr,{children:[e.jsx(q,{id:"settings-usage",label:u("Usage in Elements"),url:s.pathname}),!t&&n&&e.jsx("div",{children:"Loading..."}),!n&&t?.length===0&&e.jsx(at,{title:u("No results found"),subtitle:u("This form is currently not attached to any elements."),icon:e.jsx(ej,{}),iconFade:!0}),t?.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(ar,{children:u("Usage in Elements")}),e.jsxs("table",{className:"data fullwidth collapsible",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Element")}),e.jsx("th",{children:u("Type")}),e.jsx("th",{children:u("Status")})]})}),e.jsx("tbody",{children:t.map(o=>e.jsxs("tr",{className:"element-row",children:[e.jsx("th",{children:e.jsx("div",{className:"chip small element","data-id":o.id,children:e.jsxs("div",{className:"chip-content",children:[e.jsx("span",{className:E("status",o.status.toLowerCase()),role:"img"}),e.jsx("a",{href:o.url,className:"label-link",children:e.jsx("span",{children:o.title})})]})})}),e.jsx("td",{children:o.type}),e.jsx("td",{children:o.status})]},o.id))})]})]})]}):null},bl=()=>{const{sectionHandle:t}=V(),n=st(""),{data:s}=Gt();if(!s)return null;let i,o;if(s.forEach(a=>{a.sections.forEach(c=>{c.handle===t&&(i=a,o=c)})}),!i||!o)return t===Bs?e.jsx(tj,{}):null;const{properties:r}=i;return e.jsxs(rr,{children:[e.jsx(q,{id:"sub-settings",label:o.label,url:n.pathname}),e.jsx(ar,{children:u(o?.label)}),e.jsx(gf,{children:r.filter(a=>a.section===o?.handle).filter(a=>a.visible).map(a=>e.jsx(X8,{namespace:i.handle,property:a},a.handle))})]})},Pu=l.div`
  display: flex;
  max-height: calc(100vh - 150px);
  height: 100%;

  margin-bottom: 30px;

  border-radius: ${S.lg};
  box-shadow: ${re.box};
`,nj=()=>{const[,t]=g.useReducer(n=>n+1,0);g.useEffect(()=>{setTimeout(()=>{t()},0)},[])},Du=l.div``,sj=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`,Bu=l.span`
  padding-left: ${m.md};

  font-weight: 700;
  font-size: 11px;
  color: ${h.gray550};

  text-transform: uppercase;
`,Ou=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  padding: ${m.xs} 0;
`,ij=Ou,oj=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"})}),rj=l.div`
  > a {
    display: flex;
    align-items: center;
    gap: ${m.sm};

    padding: ${m.sm} ${m.md};
    border-radius: ${S.lg};

    color: ${h.gray700};
    font-size: 12px;
    line-height: 12px;

    transition: background-color 0.2s ease-out;
    text-decoration: none;

    &.active {
      color: ${h.white};
      background-color: ${h.gray500};
    }

    &.active.inactive {
      .status-dot {
        border-color: ${h.white};
      }
    }

    &.errors {
      color: ${h.white};
      background-color: ${h.error};
    }

    &:hover:not(.active) {
      background-color: ${h.gray200};
    }
  }
`,jl=l.div`
  display: block;
  width: 20px;
  height: 20px;

  svg {
    width: 100%;
    height: 100%;
  }
`,aj=l.div`
  flex-grow: 1;
  max-width: 90%;

  padding: 1px 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,lj=l.div`
  content: '';

  flex-shrink: 0;
  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({$enabled:t})=>t?"transparent":h.gray550};
  border-radius: 100%;

  background-color: ${({$enabled:t})=>t?h.teal550:"transparent"};

  transition: all 0.3s ease-out;
`,cj=({id:t,name:n,handle:s,icon:i})=>{const{setLastTab:o}=We("integrations"),r=P(as.one(t));if(!r)return null;const a=r.errors&&Object.values(r.errors).some(c=>c.length>0);return e.jsx(rj,{children:e.jsxs(he,{onClick:()=>o(`${t}/${s}`),to:`${t}/${s}`,className:E(!r.enabled&&"inactive",a&&"errors"),children:[!i&&e.jsx(jl,{children:e.jsx(oj,{})}),!!i&&e.jsx(jl,{dangerouslySetInnerHTML:{__html:O.sanitize(i)}}),e.jsx(aj,{children:n}),e.jsx(lj,{$enabled:r.enabled,className:E("status-dot")})]})})},dj=({label:t,children:n})=>e.jsxs(Du,{children:[e.jsx(sj,{children:e.jsx(Bu,{children:t})}),e.jsx(ij,{children:n.map(s=>e.jsx(cj,{...s},s.id))})]}),uj=()=>e.jsx(zn,{children:e.jsxs(Du,{children:[e.jsx(Bu,{children:e.jsx(k,{width:50})}),e.jsx(Ou,{style:{padding:14},children:[0,1,2].map(t=>e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[e.jsx(k,{width:20,height:20,circle:!0}),e.jsx("div",{style:{flexGrow:2},children:e.jsx(k,{width:100,style:{top:2}})}),e.jsx(k,{width:10,height:10,circle:!0,style:{top:6}})]},t))})]})}),_i=l.ul`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};

  list-style: none;
`,pj=()=>{const{formId:t,id:n}=V(),s=te(),{data:i,isFetching:o}=Go(t&&Number(t));nj();const{lastTab:r,setLastTab:a}=We("integrations");if(g.useEffect(()=>{r&&s(r)},[s,r]),g.useEffect(()=>{if(!n&&!r&&i){const d=i.find(Boolean);d&&(a(`${d.id}/${d.handle}`),s(`${d.id}/${d.handle}`))}},[n,i,r,s,a]),!i&&o)return e.jsx(De,{children:e.jsx(_i,{children:e.jsx(uj,{})})});if(!i&&!o)return e.jsx(De,{children:e.jsx(_i,{})});const c={};return i.forEach(d=>{const{type:p}=d;c[p]||(c[p]={type:p,label:u(p.replace("-"," ")),children:[]}),c[p].children.push(d)}),e.jsx(De,{$lean:!0,children:e.jsx(_i,{children:Object.values(c).map(d=>e.jsx(dj,{...d},d.type))})})},hj=()=>{const t=st("");return e.jsxs(Pu,{children:[e.jsx(q,{id:"integrations",label:u("Integrations"),url:t.pathname}),e.jsx(pj,{}),e.jsx(jt,{})]})},xj=({integration:t,property:n})=>{const s=H(),i=vs(t.properties,t.values,(r,a)=>{s(At.modify({id:t.id,key:r,value:a}))}),o=t.values[n.handle];return n.type===K.Hidden?null:e.jsx(je,{value:o,property:n,updateValue:i(n),errors:t?.errors?.[n.handle],context:t})},kr=l.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${m.xl};

  padding: ${m.xl};

  background: ${h.white};
  overflow-y: auto;

  ${Q};

  --background-color: ${h.white};
  --margins: -24px;

  h1 {
    padding: 0;
    margin-top: -11px;
    margin-bottom: -5px;
  }
`,mj=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,gj=()=>e.jsx(kr,{children:e.jsx(at,{title:u("No integrations found"),subtitle:u("To add an integration, click the button below"),icon:e.jsx(ps,{}),children:e.jsx(rt,{className:E("btn add icon"),to:"/integrations",children:u("Add integration")})})}),fj=()=>e.jsx(kr,{children:e.jsxs(zn,{children:[e.jsx(k,{width:120,height:20}),e.jsx("br",{}),e.jsx(k,{width:100,height:10}),e.jsx(k,{width:50,height:20}),e.jsx("br",{}),e.jsx(k,{width:200,height:10}),e.jsx(k,{width:500,height:10}),e.jsx(k,{height:30}),e.jsx("br",{}),e.jsx(k,{width:150,height:10}),e.jsx(k,{width:300,height:10}),e.jsx(k,{height:30})]})}),bj=()=>{const{id:t}=V(),n=st(""),s=H(),{formId:i}=V(),{data:o,isFetching:r}=Go(i&&Number(i)),a=P(as.one(Number(t)));if(!o&&r)return e.jsx(fj,{});if(!a)return e.jsx(gj,{});const{id:c,handle:d,enabled:p,name:x,description:f,properties:b}=a;return e.jsxs(kr,{children:[e.jsx(q,{id:"integration-editor",label:x,url:n.pathname}),e.jsx("h1",{title:d,children:x}),!!f&&e.jsx("p",{children:f}),e.jsxs(mj,{children:[e.jsx(jn,{property:{label:"Enabled",handle:"enabled",type:K.Boolean},value:p,errors:a?.errors?.enabled,updateValue:()=>s(At.toggle(c))}),b.map(j=>e.jsx(xj,{integration:a,property:j},j.handle))]})]})},_u=g.createContext({isDragging:!1,dragType:void 0,position:void 0,dragOn:()=>{},dragOff:()=>{}}),jj=({children:t})=>{const[n,s]=g.useState(!1),[i,o]=g.useState(),[r,a]=g.useState();return e.jsx(_u.Provider,{value:{isDragging:n,dragType:i,position:r,dragOn:(c,d)=>{s(!0),a(d),o(c)},dragOff:()=>{s(!1),a(void 0),o(void 0)}},children:t})},ai=()=>g.useContext(_u),Ot={currentPage:t=>{const n=t.context.page;return n?t.layout.pages.find(s=>s.uid===n):t.layout.pages.find(Boolean)},hasErrors:t=>n=>{const i=n.layout.pages.find(o=>o.uid===t).layoutUid;return n.layout.rows.filter(o=>o.layoutUid===i).some(o=>n.layout.fields.filter(r=>r.rowUid===o.uid).some(r=>fn(r.errors))),!1},focus:t=>t.context.focus,state:t=>t.context.state},Wu=l.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  flex: 1;
  overflow: hidden;
`,yj=()=>{const t=g.useRef(null),[n,s]=g.useState({height:0,width:0,x:0,y:0}),[i]=g.useState(()=>new ResizeObserver(([o])=>{const{width:r,height:a,x:c,y:d}=o.target.getBoundingClientRect();s({width:r,height:a,x:c,y:d})}));return g.useEffect(()=>(t.current&&i.observe(t.current),()=>i.disconnect()),[i]),{ref:t,dimensions:n}},vj=({active:t,hovering:n})=>Y({opacity:t?1:0,background:n?h.green600:"transparent",fill:n?"#fff":h.gray300,color:n?"#fff":h.gray300,scale:n?1.2:1,rotate:t?0:30,config:s=>{switch(s){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),wj=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z"})}),Uu=l(_.button)`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  font-size: 16px;

  border-radius: 50%;
  padding: 3px;

  svg {
    color: currentColor;
  }
`,$j=({active:t,onClick:n,...s})=>{const i=g.useRef(null),o=Ct(i),a={...vj({active:t,hovering:o}),...s?.style};return delete s.style,e.jsx(Uu,{type:"button",ref:i,style:a,onClick:n,...s,children:e.jsx(wj,{})})},Hu=t=>{const n=H(),[{isOver:s},i]=ss(()=>({accept:[ee.FieldType,ee.Field],collect:r=>({isOver:r.isOver({shallow:!0})}),canDrop:(r,a)=>a.isOver({shallow:!0}),drop:r=>{r.type===ee.FieldType&&n(Oe.move.newField.newRow({fieldType:r.data,layoutUid:t.uid})),r.type===ee.Field&&n(Oe.move.existingField.newRow({field:r.data,layoutUid:t.uid}))}}),[t]),o=Y({to:{opacity:s?1:0,transform:s?"scaleY(1)":"scaleY(0)"},config:{tension:300}});return{dropRef:i,placeholderAnimation:o}},Cj=l.div`
  position: relative;
  flex-grow: 1;

  height: 100%;
  padding: 8px;

  border: 1px solid #f2f4f7;
  border-radius: ${S.lg};
  background-color: #fcfdfe;
`,kj=l(_.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: ${h.gray050};
  border: 1px solid transparent;
  border-radius: ${S.sm};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`,Sj=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 40px;
  height: 100%;

  color: ${h.gray200};
  font-size: 18px;
  text-align: center;
`,Lj=({field:t,layoutUid:n})=>{const s=H(),i=Pt(c=>bt.one(c,n)),o=Pt(c=>ns.inLayout(c,i?.uid)),{dropRef:r,placeholderAnimation:a}=Hu(i);return g.useEffect(()=>{if(!n){const c=G();s($n.add({uid:c})),s(be.edit({uid:t.uid,handle:"layout",value:c}))}},[s,t.uid,n]),e.jsxs(Cj,{ref:c=>{r(c)},children:[!o.length&&e.jsx(Sj,{children:u("Add fields")}),o.map(c=>e.jsx(Sr,{row:c},c.uid)),e.jsx(kj,{style:a,children:u("Drop a field here")})]})},Fj=t=>{const n=Y({scale:t?1:.3,opacity:t?1:0}),s=Y({scale:t?.3:1,opacity:t?0:1});return[n,s]},Ej=ne`
  .options-one-line {
    display: inline-block;
    margin-right: 10px;
  }
`,Tj=ne`
  .ff-rating {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    > span {
      display: block;
      cursor: pointer;

      font-size: 200%;
      font-weight: 100;
      font-family: sans-serif;

      &:after {
        content: '★ ';
      }

      &:last-child {
        margin: 0 0 5px;
      }
    }
  }
`,Nj=ne`
  .square-demo {
    display: flex;
    flex-direction: column;
    gap: 10px;

    > div {
      display: grid;
      gap: 10px;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-areas: 'cc-number expiry cvc';

      .cc-number {
        grid-area: cc-number;
      }
      .expiry {
        grid-area: expiry;
      }
      .cvc {
        grid-area: cvc;
      }
    }
  }
`,zj=ne`
  .stripe-demo {
    display: flex;
    flex-direction: column;
    gap: 10px;

    > ul {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: stretch;

      > li {
        flex: 1;
        padding: 0.75rem;

        border: 1px solid #e6e6e6;
        border-radius: 5px;
        background-color: white;

        &.selected {
          border-color: #0570de;
          fill: #0570de;
          color: #0570de;

          box-shadow:
            0px 1px 1px rgba(0, 0, 0, 0.03),
            0px 3px 6px rgba(0, 0, 0, 0.02),
            0 0 0 1px #0570de;
        }

        &:not(.selected) {
          filter: blur(3px);
        }

        .icon-container {
          display: block;

          & svg,
          & img {
            height: 1.2em;
          }
        }
      }
    }

    > div {
      display: grid;
      gap: 10px;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-areas:
        'cc-number expiry cvc'
        'country country country';

      .cc-number {
        grid-area: cc-number;
      }

      .expiry {
        grid-area: expiry;
      }

      .cvc {
        grid-area: cvc;
      }

      .country {
        grid-area: country;
      }
    }
  }
`,Mj=ne`
  .table-cell-preview {
    width: 100%;

    margin: 0;
    border-spacing: 0;
    border-collapse: separate;

    & th,
    & td {
      width: auto;
    }

    & td {
      padding: 0 !important;

      &.string-cell,
      &.text-cell {
        padding: 6px 10px !important;
      }

      &.select-cell {
        padding: 4px 10px !important;
        text-align: center !important;

        & .select {
          width: 100% !important;
        }
      }

      &.checkbox-cell {
        padding: 6px 10px !important;
        text-align: center !important;

        & .checkbox-label {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1px 0 !important;

          & label {
            position: relative !important;
          }
        }
      }
    }

    &.columns-5 {
      & td,
      & th {
        width: 20% !important;
      }
    }

    &.columns-4 {
      & td,
      & th {
        width: 25% !important;
      }
    }

    &.columns-3 {
      & td,
      & th {
        width: 33.333333% !important;
      }
    }

    &.columns-2 {
      & td,
      & th {
        width: 50% !important;
      }
    }

    & thead {
      & tr {
        & th {
          border-left: 0 !important;
          border-right: 0 !important;
          color: #596673 !important;
          font-weight: 400 !important;
          padding: 6px 10px !important;
          background-color: #f3f7fc !important;
          border-top: 1px solid rgba(96, 125, 159, 0.25) !important;
          border-bottom: 1px solid rgba(51, 64, 77, 0.1) !important;
        }

        & th:first-child {
          border-top-left-radius: 5px !important;
          border-bottom-left-radius: 0 !important;
          border-left: 1px solid rgba(96, 125, 159, 0.25) !important;
        }

        & th:last-child {
          border-top-right-radius: 5px !important;
          border-bottom-right-radius: 0 !important;
          border-right: 1px solid rgba(96, 125, 159, 0.25) !important;
        }
      }
    }

    & tbody {
      & tr {
        & td {
          padding: 0 !important;
          border-top: 0 !important;
          border-left: 0 !important;
          border-radius: 0 !important;
          background-color: white !important;
          border-right: 1px solid rgba(51, 64, 77, 0.1) !important;
          border-bottom: 1px solid rgba(51, 64, 77, 0.1) !important;

          &:hover {
            background-color: white !important;
          }
        }

        & td:first-child {
          border-left: 1px solid rgba(96, 125, 159, 0.25) !important;
        }

        & td:last-child {
          border-right: 1px solid rgba(96, 125, 159, 0.25) !important;
        }
      }

      & tr:last-child {
        & td {
          border-bottom: 1px solid rgba(96, 125, 159, 0.25) !important;
        }

        & td:first-child {
          border-bottom-left-radius: 5px !important;
        }

        & td:last-child {
          border-bottom-right-radius: 5px !important;
        }
      }
    }
  }
`,qu=l.label`
  display: flex;
  align-items: flex-start;
  gap: ${m.xs};

  min-height: 18px;
  margin-bottom: 4px;
  font-weight: bold;
  color: ${h.gray550};

  overflow: hidden;

  .required {
    position: relative;
    top: -5px;
    left: -5px;
  }
`,Ij=l.div``,Tt=16,Aj=l.div`
  flex: 0 0 ${Tt}px;
  position: relative;
  top: 2px;

  width: ${Tt}px;
  height: ${Tt}px;
  font-size: ${Tt}px;
`,yl=l(_.div)`
  position: absolute;
  left: 0;
  top: 0;

  &,
  svg {
    width: ${Tt}px;
    height: ${Tt}px;
    font-size: ${Tt}px;
  }
`,Qu=l.div`
  margin-top: -4px;
  margin-bottom: 4px;

  color: ${h.gray300};
  font-style: italic;
  font-size: 12px;
`,Ku=l.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  padding: ${m.sm} ${m.md};
  margin: 0;

  border: 1px solid transparent;
  border-radius: ${S.md};

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.input-only {
    flex-direction: row !important;
    gap: ${m.sm};
  }

  &.active {
    border: 1px dashed #5782ef;
  }

  &:hover {
    background: #f3f7fd;

    &:not(.active) {
      border: 1px solid #cdd8e4;
    }
  }

  &.errors {
    &,
    label {
      color: ${h.error};
    }

    input,
    textarea,
    div.select,
    select {
      border-color: ${h.error} !important;
    }

    div.select {
      border: 1px solid;
    }

    input.checkbox ~ label:before {
      border-color: ${h.error};
    }
  }

  input:not([type='checkbox']):not([type='radio']),
  textarea,
  select {
    pointer-events: none;

    width: 100%;
    padding: 6px 9px;

    border: 1px solid rgba(96, 125, 159, 0.25);
    border-radius: 3px;
  }

  &[data-field-type='rich-text'] {
    blockquote {
      border-left: 2px solid #d9d9d9;
      margin-left: 0;
      padding-left: 10px;
    }

    pre {
      border: 1px solid #d9d9d9;
      padding: 10px;
      white-space: pre-wrap;
      background-color: rgb(247, 247, 247);
    }

    ul {
      list-style-type: disc;
      padding-inline-start: 40px;
    }

    table {
      border-collapse: collapse;
      width: 100%;

      border: 1px solid black;

      td {
        border: 1px solid black;
        padding: 5px;
      }
    }

    pre {
      margin: 1em 0;
    }
  }

  &[data-field-type='cards'] {
    .ff-cards {
      display: grid;
      grid-template-columns: repeat(var(--card-columns, 5), 1fr);
      gap: ${m.sm};

      &__empty {
        grid-column: 1 / -1;
        padding-top: 10px;

        color: ${h.gray500};
        text-align: left;
        font-style: italic;
      }

      &__card {
        display: grid;
        grid-template-rows: min-content 20px auto;
        gap: 5px;

        background: ${h.white};
        border: 1px solid ${h.gray200};
        border-radius: 8px;

        &__image {
          border: none;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;

          overflow: hidden;
          text-align: center;

          img {
            width: 100%;
          }

          svg {
            width: 100%;
            max-height: 80px;

            fill: ${h.gray200};
          }
        }

        &__label {
          height: 20px;
          padding: 0 ${m.sm};

          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: bold;
        }

        &__description {
          padding: 0 ${m.sm} ${m.sm};

          color: ${h.gray500};
          font-size: 12px;
          font-style: italic;
        }

        &__label,
        &__description {
          text-align: center;
        }
      }
    }
  }

  ${zj}
  ${Nj}
  ${Ej}
  ${Tj}
  ${Mj}
`,Rj=l.div`
  display: flex;
  flex-direction: row;
`,Pj=l.div`
  a {
    pointer-events: none;
  }
`,Mn={all:t=>t.notifications.items,one:t=>n=>n.notifications.items.find(s=>s.uid===t),isFieldInEmailNotification:t=>n=>n.notifications.items.some(s=>{if(s?.rule){const i=n.rules.notifications.items.find(o=>o.uid===s.rule);return i?.enabled&&i.conditions.some(o=>o.field===t)||!1}return s.field===t&&s.enabled}),count:{all:t=>t.notifications.items.length,ofType:t=>n=>n.notifications.items.filter(s=>s.className===t).length},errors:{any:t=>!!t.notifications.items.find(n=>n.errors!==void 0)}},Dj=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"13",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m46.195 63.066c-1.46 0-2.64-1.377-2.64-3.066 0-1.699 1.18-3.066 2.64-3.066h34.89c1.46 0 2.64 1.377 2.64 3.066 0 1.699-1.18 3.066-2.64 3.066zm7.15 50.782c1.74 0 3.15 1.377 3.15 3.076s-1.41 3.076-3.15 3.076h-39.44c-2.02 0-3.85-.801-5.18-2.1-1.378-1.339-2.152-3.16-2.15-5.058v-105.684c0-1.972.82-3.76 2.15-5.058 1.371-1.346 3.236-2.102 5.18-2.1h90.02c2.02 0 3.85.811 5.18 2.1 1.378 1.339 2.151 3.16 2.15 5.058v48.965c0 1.699-1.41 3.076-3.15 3.076s-3.15-1.377-3.15-3.076v-48.965c0-.273-.12-.527-.31-.703-.19-.185-.44-.303-.72-.303h-90.02c-.28 0-.54.118-.73.293-.18.196-.3.44-.3.713v105.674c0 .273.12.527.3.703.19.186.45.303.73.303h39.44zm51.93-41.25c-.51-.479-1.1-.703-1.78-.694-.68.01-1.26.264-1.74.762l-3.91 3.975 10.97 10.341 3.95-4.013c.47-.469.67-1.074.66-1.739-.01-.654-.25-1.25-.73-1.699zm-20.49 38.74c-1.45.449-2.89.918-4.33 1.377-1.45.469-2.89.947-4.33 1.416-3.41 1.094-5.32 1.699-5.72 1.807-.39.117-.16-1.446.7-4.698l2.71-10.205 20.55-20.879 10.96 10.303zm-38.59-26.426c-1.46 0-2.65-1.396-2.65-3.115s1.19-3.115 2.65-3.115h17.19c1.46 0 2.65 1.396 2.65 3.115s-1.19 3.115-2.65 3.115zm0-43.642c-1.46 0-2.64-1.377-2.64-3.067 0-1.699 1.18-3.066 2.64-3.066h34.89c1.46 0 2.64 1.377 2.64 3.066 0 1.699-1.18 3.067-2.64 3.067zm-15.14 36.328c2.054 0 3.72 1.626 3.72 3.632 0 2.007-1.666 3.633-3.72 3.633-2.055 0-3.72-1.626-3.72-3.633 0-2.006 1.665-3.632 3.72-3.632zm0-21.504c2.054 0 3.72 1.626 3.72 3.633 0 2.006-1.666 3.632-3.72 3.632-2.055 0-3.72-1.626-3.72-3.632 0-2.007 1.665-3.633 3.72-3.633zm0-21.504c2.054 0 3.72 1.626 3.72 3.633 0 2.006-1.666 3.632-3.72 3.632-2.055 0-3.72-1.626-3.72-3.632 0-2.007 1.665-3.633 3.72-3.633z",fill:"#89bb67"})]}),Bj=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"12",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m109.892 10.077-96.909 37.179 29.366 14.034 44.97-28.878-28.162 46.242 13.704 28.38 37.012-96.957zm-107.53 33.38 112.317-43.088c.919-.447 1.985-.49 2.937-.117 1.907.725 2.866 2.852 2.144 4.756l-43.022 112.632c-.531 1.368-1.822 2.293-3.291 2.357-1.469.063-2.836-.747-3.483-2.064l-22.192-45.901-45.684-21.836c-1.325-.635-2.145-1.995-2.085-3.46s.987-2.754 2.359-3.279z",fill:"#67a9e6"})]}),Oj=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"13",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m57.255 83.701 3.438-17.9 3.486 5.39c7.509-3.09 11.728-8.18 12.353-16.01 6.172 11.04 2.432 20.95-5.4 26.74l3.554 5.48zm12.773-52.87c-5.078-2.49-10.761-3.45-16.298-2.9-5.498.54-10.84 2.59-15.254 6.1-5.107 4.05-8.984 10.11-10.478 18.14l-.469 2.51-2.441.44c-2.393.43-4.531 1.02-6.406 1.77-1.817.72-3.438 1.61-4.854 2.66-1.132.84-2.109 1.78-2.939 2.8-2.568 3.15-3.76 7.1-3.73 11.1.042 4.142 1.335 8.17 3.701 11.53.888 1.25 1.914 2.4 3.086 3.4 1.213 1.032 2.573 1.868 4.033 2.48 1.494.63 3.144 1.08 4.97 1.34h70.848c3.448-.85 6.494-2 9.082-3.48 2.568-1.47 4.668-3.26 6.24-5.41 2.442-3.33 3.643-8.04 3.692-12.87.058-5.07-1.153-10.16-3.506-13.86-.674-1.07-1.416-2.03-2.197-2.89-3.526-3.89-7.998-5.59-12.647-5.62-2.431-.02-4.941.41-7.392 1.22-5.068-7.23-8.73-14.37-17.041-18.46zm19.805 10.26c1.562-.25 3.125-.38 4.677-.36 6.563.05 12.891 2.45 17.871 7.95 1.045 1.15 2.031 2.45 2.959 3.9 3.125 4.92 4.726 11.49 4.658 17.92-.068 6.31-1.729 12.59-5.127 17.21-2.217 3.01-5.058 5.47-8.467 7.42-3.281 1.88-7.109 3.31-11.406 4.33l-.8.1h-71.366l-.449-.04c-2.607-.34-4.971-.97-7.119-1.88-2.217-.94-4.18-2.15-5.908-3.63-1.641-1.4-3.076-2.99-4.297-4.72-3.262-4.6-5.019-10.22-5.058-15.82-.039-5.66 1.679-11.29 5.39-15.85 1.201-1.48 2.617-2.84 4.238-4.04 1.885-1.4 4.043-2.58 6.485-3.55 1.679-.67 3.476-1.23 5.371-1.68 2.148-8.74 6.728-15.47 12.616-20.14 5.508-4.37 12.139-6.92 18.965-7.59 6.797-.67 13.789.51 20.068 3.6 6.845 3.37 12.822 8.98 16.699 16.87zm-27.265 3.61-3.438 17.9-3.486-5.39c-7.51 3.09-11.728 8.18-12.353 16.01-6.172-11.04-2.432-20.95 5.4-26.74l-3.555-5.48z",fill:"#f3b898"})]}),_j=l.div`
  display: flex;
  flex-direction: row;

  gap: ${m.sm};
  margin-left: ${m.sm};
`,vl=({uid:t})=>{const n=P(un.hasRule(t)),s=P(Mn.isFieldInEmailNotification(t)),i=P(as.isFieldInIntegrations(t));return e.jsxs(_j,{children:[n&&e.jsx(xe,{title:u("Conditional rules are applied to this field"),children:e.jsx(Dj,{})}),s&&e.jsx(xe,{title:u("Email notifications are applied to this field"),children:e.jsx(Bj,{})}),i&&e.jsx(xe,{title:u("Integrations are applied to this field"),children:e.jsx(Oj,{})})]})},Wj=(t,n)=>{const[s,i]=oi(t,n),{getTranslation:o}=Ce(t),r=Uj(t,n),a=g.useMemo(()=>{const d={};return Object.entries(t.properties).forEach(([p,x])=>{n?.properties.find(b=>b.handle===p)?.translatable?d[p]=o(p,x):d[p]=x}),d.generatedOptions=s,d.fetchedAssets=r,d},[t,n,s,r,o]);return[g.useMemo(()=>{if(t?.properties===void 0||n?.previewTemplate===void 0)return"No preview available";try{return H1(n.previewTemplate)(a)}catch(d){return`Preview template error: "${d.message}"`}},[t?.properties,n?.previewTemplate,a]),i]},Uj=(t,n)=>{const s=Hj(t,n),i=qj(t,n),{data:o}=fr(s,i);return o||{}},Hj=(t,n)=>{const s=g.useMemo(()=>n?.properties.filter(o=>o.type===K.AssetPicker).flatMap(o=>{const r=t.properties[o.handle];return typeof r=="number"?[r]:Array.isArray(r)?r.filter(a=>typeof a=="number"):[]}),[t,n]),i=g.useMemo(()=>n?.properties.filter(o=>o.type===K.Cards).map(o=>t.properties[o.handle].map(a=>a.assetId).filter(Boolean)),[t,n]);return[...s||[],...i||[]].flat()},qj=(t,n)=>g.useMemo(()=>{const s=n?.properties.find(i=>i.handle==="transform")?.handle;return t.properties[s]},[t,n]),Qj=({field:t})=>{const n=H(),s=Me(t?.typeClass),{uid:i}=t,{active:o,type:r,uid:a}=P(Ot.focus),c=g.useMemo(()=>s?.implements?.includes("noLabel")||!1,[s]),d=g.useMemo(()=>o&&r===Yn.Field&&a===i,[o,r,a,i]),[p,x]=Wj(t,s),[f,b]=Fj(x),{getTranslation:j}=Ce(t);if(t?.properties===void 0||!s)return null;const y=j("label",t.properties.label||s?.name),w=j("instructions",t.properties.instructions);return e.jsxs(Ku,{"data-field-type":s.type,className:E(fn(t.errors)&&"errors",s.type===mt.Group&&"group",d&&"active","field"),onClick:v=>{v.stopPropagation(),n(ye.setFocusedItem({type:Yn.Field,uid:i}))},children:[!c&&e.jsxs(qu,{className:"label",children:[e.jsxs(Aj,{children:[e.jsx(yl,{style:f,children:e.jsx(er,{})}),e.jsx(yl,{style:b,dangerouslySetInnerHTML:{__html:O.sanitize(s.icon)}})]}),e.jsx(Ij,{children:y}),t.properties.required&&e.jsx("span",{className:"required"}),e.jsx(vl,{uid:i})]}),w&&e.jsx(Qu,{children:w}),s.type===mt.Group&&e.jsx(Lj,{field:t,layoutUid:t.properties?.layout}),s.type!==mt.Group&&(c?e.jsxs(Rj,{children:[e.jsx(Pj,{dangerouslySetInnerHTML:{__html:O.sanitize(p)}}),e.jsx(vl,{uid:i})]}):e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(p)}}))]})},Kj=(t,n,s,i,o,r,a)=>!n||a===void 0?0:s&&i&&r!==void 0?o===r?t*(a-o):r>o?o<a?0:t:r<o&&o<=a?-t:0:a<=o?t:(a>o,0),Vj=({width:t,isDragging:n,isOver:s,isCurrentRow:i,isDraggingField:o,dragFieldIndex:r,index:a,hoverPosition:c})=>{const{isDragging:d}=ai(),p=Kj(t,s,i,o,a,r,c);return Y({immediate:x=>{switch(x){case"x":return!d;case"width":return!d}},to:{width:t,x:p,opacity:n?.3:1},config:{tension:700,mass:.5}})},Gj=(t,n)=>{const[{isDragging:s},i,o]=qo(()=>({type:ee.Field,collect:c=>({isDragging:c.isDragging()}),item:{type:ee.Field,data:t,index:n}}),[t]),{dragOn:r,dragOff:a}=ai();return g.useEffect(()=>{s?r(ee.Field):a()},[s,r,a]),{isDragging:s,drag:i,preview:o}},Yj=t=>{let[n,s]=[200,40];const i=document.createElement("canvas");if(!i.getContext)return null;const o=i.getContext("2d"),c=(window.devicePixelRatio||1)/1;n=n*c,s=s*c,i.width=n,i.height=s,o.fillStyle="#FFFFFF",o.fillRect(0,0,n,s);const d=Math.ceil(4*c),p=Math.ceil(2*c);o.setLineDash([d,p]),o.strokeStyle="#c9c9c9",o.lineDashOffset=0,o.lineWidth=4*c,o.strokeRect(0,0,n,s);const x=Math.ceil(14*c);return o.font=`normal ${x}px system-ui,BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif`,o.fillStyle="#3f4d5a",o.fillText(t,Math.ceil(10*c),Math.ceil(25*c)),i.toDataURL()},Vu=l(_.div)`
  position: relative;

  &,
  * {
    cursor: pointer;
  }

  ${Od} {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
  }

  ${Uu} {
    position: absolute;
    top: 4px;
    right: 28px;
    z-index: 2;
  }
`,Gu=g.memo(({field:t,row:n,index:s,width:i,isOver:o,isCurrentRow:r,isDraggingField:a,dragFieldIndex:c,hoverPosition:d})=>{const p=H(),[x,f]=g.useState(!1),{isDragging:b,drag:j,preview:y}=Gj(t,s),w=Vj({width:i,isDragging:b,isOver:o,isCurrentRow:r,isDraggingField:a,dragFieldIndex:c,index:s,hoverPosition:d}),v=I.limitations.can("layout.fields.clone");return e.jsxs(e.Fragment,{children:[e.jsx(q1,{connect:y,src:Yj(t.properties?.label)}),e.jsxs(Vu,{onMouseEnter:()=>f(!0),onMouseLeave:()=>f(!1),ref:$=>{j($)},style:w,children:[v&&e.jsx($j,{active:x,onClick:()=>{p(ye.unfocus()),p(Oe.duplicate(t,n))}}),e.jsx(Tn,{active:x,onClick:()=>{p(ye.unfocus()),p(Oe.remove(t))}}),e.jsx(Qj,{field:t})]})]})});Gu.displayName="Field";const Jj=l(_.div)`
  position: absolute;
  top: 0;
  bottom: 0;

  pointer-events: none;
  user-select: none;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${S.md};
`,Zj=({isActive:t,hoverPosition:n=0,fieldWidth:s=1e3})=>{const i=Y({opacity:t?1:0,x:n*s,scale:t?1:0,width:s,config:{tension:700,mass:.5}});return e.jsx(Jj,{style:i})},Xj=t=>Y({to:{height:t?30:20,opacity:t?1:0,transform:t?"scaleY(1)":"scaleY(0)"},delay:t?200:0,config:{tension:500}}),ey=t=>Y({to:{y:t?20:0},delay:t?200:0,config:{tension:300}}),ty=t=>{const n=H(),[{isOver:s,canDrop:i},o]=ss(()=>({accept:[ee.FieldType,ee.Field],collect:r=>({isOver:r.isOver({shallow:!0}),canDrop:r.canDrop()}),canDrop:(r,a)=>a.isOver({shallow:!0}),drop:r=>{r.type===ee.Field&&n(Oe.move.existingField.newRow({layoutUid:t.layoutUid,field:r.data,order:t.order})),r.type===ee.FieldType&&n(Oe.move.newField.newRow({fieldType:r.data,row:t}))}}),[t]);return{ref:o,isOver:s,canDrop:i}},ny=(t,n,s,i,o)=>{const r=H(),[a,c]=g.useState(),[d,p]=g.useState(),[{isOver:x,isCurrentRow:f,dragFieldIndex:b,isDraggingField:j,canDrop:y},w]=ss({accept:[ee.Field,ee.FieldType],collect:v=>{const $=v.getItem(),C=$?.type===ee.Field,F=$?.type===ee.Field&&$.data.rowUid===n.uid;return{isOver:v.isOver({shallow:!0}),canDrop:v.canDrop(),dragFieldIndex:$?.type===ee.Field?$.index:void 0,isCurrentRow:F,isDraggingField:C}},canDrop:(v,$)=>$.isOver({shallow:!0}),hover:(v,$)=>{if(i===void 0||o===void 0)return;const C=v.type===ee.Field&&v.data.rowUid===n.uid,F=s+(C?0:1);if(F<=1)return;const M=$.getClientOffset().x-o,z=Math.floor(M/(i/F));d!==z&&p(z)},drop:v=>{v.type===ee.Field?r(Oe.move.existingField.existingRow(v.data,n,d)):v.type===ee.FieldType&&r(Oe.move.newField.existingRow({fieldType:v.data,row:n,order:d})),p(void 0)}},[t,n,s,d,i]);return g.useEffect(()=>{let v=s;x&&!f&&(v+=1),c(i/Math.max(1,v))},[x,s,i,f]),{ref:w,isOver:x,isCurrentRow:f,isDraggingField:j,canDrop:y,hoverPosition:d,fieldWidth:a,dragFieldIndex:b}},sy="72px",Yu=l(_.div)`
  position: relative;

  min-height: 1px;
  margin: 0 -${m.lg};

  background-color: #f3f7fc00;
  border: 1px solid transparent;

  transition: all 0.2s ease-out;
  transform-origin: 50% 0%;
`,Ju=l(_.div)`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: row;
  align-items: stretch;
`,iy=l.div`
  position: absolute;
  left: ${m.sm};
  right: ${m.sm};
  top: -10px;

  z-index: 4;

  height: 20px;
`,oy=l(_.div)`
  position: relative;
  top: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 100%;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${S.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;l(_.div)`
  border: 2px dashed grey;

  min-height: ${sy};
  flex-grow: 1;
  flex-shrink: 0;
`;const Sr=g.memo(({row:t})=>{const n=P(Ae.inRow(t)),{ref:s,dimensions:i}=yj(),o=i.width,r=i.x,{ref:a,isOver:c}=ty(t),d=Xj(c),p=ey(c),{ref:x,isOver:f,isCurrentRow:b,isDraggingField:j,dragFieldIndex:y,hoverPosition:w,fieldWidth:v}=ny(s,t,n.length,o,r),$=x(s);return e.jsxs(Yu,{ref:$,children:[e.jsx(iy,{ref:C=>{a(C)},children:e.jsx(oy,{style:d})}),e.jsxs(Ju,{style:p,children:[e.jsx(Zj,{isActive:f,hoverPosition:w,fieldWidth:v}),n.map((C,F)=>e.jsx(Gu,{field:C,row:t,isOver:f,hoverPosition:w,isCurrentRow:b,isDraggingField:j,dragFieldIndex:y,index:F,width:v||o},C.uid))]})]})});Sr.displayName="Row";const Lr=l.div`
  position: relative;

  display: flex;
  flex-direction: column;

  margin: 0 -18px;
`,ry=l(_.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 28px;
  margin: 0 ${m.lg};

  background-color: ${h.gray050};
  border: 1px solid ${h.hairline};
  border-radius: ${S.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`,ay=l.div`
  padding: ${m.sm} ${m.lg};

  color: ${h.gray300};
  font-size: 18px;
  text-align: left;
`,ly=({layout:t})=>{const n=Pt(o=>ns.inLayout(o,t?.uid)),{dropRef:s,placeholderAnimation:i}=Hu(t);return e.jsxs(Lr,{ref:o=>{s(o)},className:"field-layout",children:[!n.length&&e.jsx(ay,{children:u("Drag or click fields to add them to the layout")}),n.map(o=>e.jsx(Sr,{row:o},o.uid)),e.jsx(ry,{style:i,children:u("+ insert row")})]})},cy=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})}),Zu=t=>{const s=(t.buttons?.layout||"save back|submit").split(" "),i=[];return s.forEach(o=>{const r=o.split("|"),a=[];r.forEach(c=>{if(!(c==="back"&&t.order===0))switch(c){case"submit":a.push({handle:"submit",label:t.buttons.submitLabel,enabled:!0,assetId:t.buttons.submitIcon?.[0]||void 0,iconPosition:t.buttons.submitIconPosition||"left"});break;case"back":t.buttons.back&&a.push({handle:"back",label:t.buttons.backLabel,enabled:t.buttons.back,assetId:t.buttons.backIcon?.[0]||void 0,iconPosition:t.buttons.backIconPosition||"left"});break;case"save":t.buttons.save&&a.push({handle:"save",label:t.buttons.saveLabel,enabled:t.buttons.save,assetId:t.buttons.saveIcon?.[0]||void 0,iconPosition:t.buttons.saveIconPosition||"left"});break;default:return}}),i.push(a)}),i},Xu=l.div`
  display: flex;
  justify-content: space-between;

  padding: ${m.sm} ${m.md};

  border: 1px solid transparent;
  border-radius: ${S.md};

  cursor: pointer;

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.active {
    border: 1px dashed #5782ef;
  }

  &:hover {
    background: #f3f7fd;

    &:not(.active) {
      border: 1px solid #cdd8e4;
    }
  }
`,So=l.div`
  display: flex;
  gap: ${m.md};
`,ep=l.button`
  display: flex;
  align-items: center;
  gap: 5px;

  img,
  svg {
    width: 24px;
    height: 24px;
  }

  svg {
    animation: spin 1s linear infinite;
  }

  &.btn-submit {
    background-color: ${h.gray600};
    color: white;

    svg {
      fill: white;
    }

    &:hover {
      background-color: ${h.gray700};
    }
  }
`,dy={back:"btn",save:"btn",submit:"btn btn-submit"},uy=({page:t})=>{const n=H(),{getTranslation:s}=Ce(t),{active:i,type:o,uid:r}=P(Ot.focus),a=g.useMemo(()=>i&&o===Yn.Page&&r===t.uid,[i,o,r,t.uid]),c=Zu(t),d=c.flat().map(b=>b.assetId).filter(Boolean),{data:p,isFetching:x}=fr(d,""),f=g.useCallback(b=>{const j=p?.[b]?.src;return x?e.jsx(cy,{}):e.jsx("img",{src:j,alt:`${b}Alt`})},[p,x]);return e.jsx(Lr,{children:e.jsx(Xu,{className:E(a&&"active"),onClick:()=>{n(ye.setFocusedItem({type:Yn.Page,uid:t.uid}))},children:c.map((b,j)=>e.jsx(So,{className:"page-buttons",children:b.map(({handle:y,label:w,iconPosition:v,assetId:$},C)=>e.jsxs(ep,{className:dy[y],type:"button",children:[$&&v==="left"&&f($),s(`${y}Label`,w),$&&v==="right"&&f($)]},C))},j))})})},tp=l.div`
  display: flex;
  flex: 1 0;
  flex-direction: column;
  gap: ${m.md};

  padding: ${m.sm} ${m.xl} ${m.xl};

  overflow-y: auto;
  overflow-x: hidden;
  ${Q};
`,py=({page:t})=>{const n=Pt(s=>bt.pageLayout(s,t?.layoutUid));return e.jsxs(tp,{children:[n&&e.jsx(ly,{layout:n}),e.jsx(uy,{page:t})]})},np=l.div`
  margin: 10px 15px;
`,sp=l.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
  overflow-y: hidden;
  overflow-x: auto;
  ${Q};

  &::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover {
    background-color: white;

    &::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  }
`,ip=()=>(t,n)=>{const s=G(),i=G(),o=n(),r=o.layout.pages.length,a=r+1,c=o.layout.pages?.[r-1];t($n.add({uid:i})),t(Cn.add({uid:s,label:u("Page {number}",{number:a}),layoutUid:i,buttons:c?.buttons??{layout:"save back|submit",attributes:{container:{},column:{},submit:{},back:{},save:{}},submitLabel:u("Submit"),submitIcon:[],submitIconPosition:"left",back:!0,backLabel:u("Back"),backIcon:[],backIconPosition:"left",save:!1,saveLabel:u("Save"),saveIcon:[],saveIconPosition:"left"}})),t(ye.setPage(s))},hy=(t,n)=>(s,i)=>{const{layoutUid:o}=n,r=G();s(Ze.add({layoutUid:o,uid:r})),s(be.moveTo({uid:t.uid,rowUid:r,position:0})),ii(i(),s)},xy=t=>(n,s)=>{const{uid:i,layoutUid:o}=t,r=s();if(!r.layout.layouts.find(d=>d.uid===o))return;const c=r.layout.pages.find(d=>d.uid!==i);n(ye.unfocus()),n(ye.setPage(c.uid)),r.layout.rows.filter(d=>d.layoutUid===o).forEach(d=>{const p=[];r.layout.fields.filter(x=>x.rowUid===d.uid).forEach(x=>{p.push(x.uid)}),n(be.removeBatch(p)),n(Ze.remove(d.uid))}),n($n.remove(o)),n(Cn.remove(i))},my=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 4.5v15m7.5-7.5h-15"})}),gy=l.button`
  display: flex;
  align-items: center;

  padding: 0 10px;

  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    transform: scale(1.2);
    color: ${h.black};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`,fy=()=>{const t=H();return e.jsx(gy,{className:"new-page-tab",onClick:()=>{t(ip())},children:e.jsx(my,{})})},by=(t,n)=>{const s=H(),{dragOff:i}=ai(),[{canDrop:o},r]=ss({accept:[ee.Field],canDrop:(a,c)=>c.isOver({shallow:!0}),collect:a=>({canDrop:a.canDrop()&&t!==n.uid}),drop:a=>{a.type===ee.Field&&(s(hy(a.data,n)),i())}});return{ref:r,canDrop:o}},Lo=l(_.div)`
  position: relative;
`,jy=l.button`
  position: absolute;
  top: 3px;
  right: -8px;

  transition: all 0.2s ease-in-out;
  transform: scale(0.8);
  opacity: 0;

  &:active {
    outline: none;
  }

  &:hover {
    transform: scale(1);
  }

  svg {
    width: 20px;
  }
`,yy=l.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`,Fo=l(_.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  max-width: 160px;
  height: 100%;
  padding: 7px 10px;
  margin: 0 5px;

  color: ${h.gray400};
  border-bottom: 2px solid ${h.gray100};

  overflow: hidden;

  &.active {
    color: ${h.gray800};
    border-bottom-color: ${h.blue600};
  }

  &.errors {
    color: ${h.error};

    ${Zo};
  }

  &.can-drop {
    box-shadow: 0 2px 12px ${h.gray500};
    transform: scale(1.1);
    z-index: 2;
  }

  &.is-dragging {
    z-index: 1;
  }

  &:hover {
    cursor: pointer;

    ${jy} {
      opacity: 1;
    }
  }
`;l.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  width: 100%;
`;const vy=l.input`
  appearance: none;

  display: block;
  width: 100%;
  min-width: 100px;

  border: 0;
  padding: 0 !important;
  line-height: 1rem;
  font-size: 0.75rem;
  box-shadow: none !important;

  &:hover,
  &:active {
    box-shadow: none !important;
  }

  &::-webkit-contacts-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
`,wy=l.div`
  position: absolute;
  top: 0px;
  right: -7px;

  transform: scale(0.8);
`,$y=({page:t,index:n})=>{const s=P(Ot.currentPage),i=P(et.count),o=H(),{willTranslate:r,updateTranslation:a,getTranslation:c,hasTranslation:d,removeTranslation:p}=Ce(t),x=P(Ot.hasErrors(t.uid)),f=g.useRef(null),b=g.useRef(null),[j,y]=g.useState(!1),w=Ct(f),{canDrop:v,ref:$}=by(s?.uid,t);g.useEffect(()=>{j&&(b.current?.focus(),b.current?.select())},[j]);const C=()=>{const z=b.current.value||t.label;a("label",z)||o(Cn.updateLabel({uid:t.uid,label:z}))},F=z=>{z.key==="Enter"&&(C(),y(!1)),z.key==="Escape"&&y(!1)},N=$t({callback:()=>{C(),y(!1)},isEnabled:j}),M=$(f);return e.jsx(Lo,{ref:M,className:"page-tab sortable-page-tab","data-page-index":n,children:e.jsxs(Fo,{ref:N,className:E(s?.uid===t.uid&&"active",x&&"errors",v&&"can-drop",j&&"is-editing"),onClick:()=>{o(ye.setPage(t.uid))},onDoubleClick:()=>y(!0),children:[j?e.jsx(vy,{type:"text",ref:b,className:"text small",placeholder:t.label,defaultValue:c("label",t.label),onKeyUp:F}):e.jsxs(yy,{children:[e.jsx("span",{children:c("label",t.label)}),r("label")&&e.jsx(bd,{className:E(d("label")&&"active"),onClick:()=>{d("label")&&confirm("Are you sure you want to remove the translation?")&&p("label")},children:e.jsx(vd,{})})]}),i>1&&e.jsx(wy,{children:e.jsx(Tn,{active:w&&!j,onClick:()=>{confirm(u("Are you sure?"))&&o(xy(t))}})})]})})},Cy=()=>{const t=H(),n=P(et.all),s=g.useRef(null),i=I.editions.isAtLeast(oe.Lite)&&I.limitations.can("layout.multiPageForms");return g.useEffect(()=>{if(!s.current)return;const o=Ne.create(s.current,{animation:150,ghostClass:"sortable-ghost",draggable:".sortable-page-tab",onEnd:r=>{if(r.oldDraggableIndex===void 0||r.newDraggableIndex===void 0||r.oldDraggableIndex===r.newDraggableIndex)return;const a=n[r.oldDraggableIndex];a&&t(Cn.moveTo({uid:a.uid,order:r.newDraggableIndex}))}});return()=>{o.destroy()}},[t,n]),e.jsx(np,{children:e.jsxs(sp,{ref:s,children:[n.map((o,r)=>e.jsx($y,{index:r,page:o},o.uid)),i&&e.jsx(fy,{})]})})},ky=()=>{const t=P(Ot.currentPage);return e.jsxs(Wu,{children:[e.jsx(Cy,{}),t&&e.jsx(py,{page:t})]})},Fr=l.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: ${h.white};
  border: 1px solid ${h.gray100};
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    border-color: ${h.gray200};
    background-color: ${h.gray050};
  }
`,Sy=l.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`,Ly=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 18px;

  svg {
    max-width: 18px;
    max-height: 18px;
  }

  color: ${h.gray500};
`,Fy=l(_.div)`
  position: relative;
  padding: ${m.lg};

  overflow-y: auto;
  overflow-x: hidden;

  height: 100%;
  ${Q};

  &.fields-disabled {
    ${Fr} {
      opacity: 0.5;
      user-select: none;
      pointer-events: none;
    }
  }
`,Ey=l.div`
  color: white;
  background: red;
  border: 1px solid darkred;
`,li=({children:t})=>e.jsx(Ey,{children:t}),op={all:["groups"]},rp=({select:t}={})=>B({queryKey:op.all,queryFn:()=>T.get("/api/fields/types/groups").then(n=>n.data),staleTime:1/0,select:t}),Er=t=>e.jsx(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h15v15h-15z"}),e.jsx("path",{d:"m6.875 2.5h-2.625c-1.05 0-1.575 0-1.976.205-.353.179-.64.466-.82.819-.204.401-.204.926-.204 1.976v5.25c0 1.05 0 1.575.204 1.976.18.353.467.64.82.82.401.204.926.204 1.976.204h5.25c1.05 0 1.575 0 1.976-.204.353-.18.64-.467.82-.82.204-.401.204-.926.204-1.976v-2.625m-7.5 1.875h1.047c.305 0 .458 0 .602-.034.128-.031.249-.082.361-.15.126-.077.235-.185.451-.402l5.977-5.976c.517-.518.517-1.358 0-1.875-.518-.518-1.358-.518-1.876 0l-5.976 5.976c-.216.217-.325.325-.402.451-.068.112-.119.234-.149.361-.035.144-.035.297-.035.603z",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]})}),ap=l.div`
  margin-bottom: ${m.xl};

  &.disabled {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }
`,Tr=l.h2`
  position: relative;

  margin: 0;
  padding: 0 0 5px;

  button {
    position: absolute;
    top: 1px;
    right: 0;

    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
`,ci=l.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

  margin: 0;
  padding: 0;
`,lp=({title:t,disabled:n,button:s,minEdition:i,children:o})=>{const{editions:r}=I,a=i!==void 0?r.isAtLeast(i):!0;return e.jsxs(ap,{className:E(n&&"disabled"),children:[e.jsxs(Tr,{children:[t,s&&a&&e.jsx("button",{type:"button",title:s.title,onClick:s.onClick,children:s.icon})]}),o]})},Ty=()=>e.jsx(Fr,{children:e.jsxs(Qt,{children:[e.jsx(k,{width:18,height:18,borderRadius:"50%",style:{position:"relative",top:-2}}),e.jsx(k,{width:50,style:{position:"relative",top:-1}})]})}),Nr=({words:t,items:n})=>e.jsxs(ap,{children:[e.jsx(Tr,{children:t.map((s,i)=>e.jsx(k,{width:s,height:16,inline:!0,style:{marginRight:8}},i))}),e.jsx(ci,{children:ts(n).map(s=>e.jsx(Ty,{},s))})]}),di={query:t=>n=>n.search[t]},Ny=()=>{const t=P(di.query(kn.Fields));return g.useCallback(n=>{if(!t)return n;const s=n.types?.filter(o=>o.toLowerCase().includes(t.toLowerCase())),i=n.groups.grouped.map(o=>({...o,types:o.types.filter(r=>r.toLowerCase().includes(t.toLowerCase()))})).filter(o=>o.types.length>0);return{types:s||[],groups:{...n.groups,grouped:i||[]}}},[t])},zy=()=>{const t=P(di.query(kn.Fields));return g.useCallback(n=>t?n.filter(s=>s.label.toLowerCase().includes(t.toLowerCase())):n,[t])},My=()=>{const t=P(di.query(kn.Fields));return g.useCallback(n=>t?n.map(s=>({...s,fields:s.fields.filter(i=>i.label.toLowerCase().includes(t.toLowerCase()))})).filter(s=>s.fields.length>0):n,[t])},Iy=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  margin-bottom: ${m.md};

  svg {
    fill: ${({color:t})=>t||h.black};
  }
`,Ay=l.div`
  text-transform: uppercase;
  font-size: 10px;
`,zr=({icon:t,label:n,dragRef:s,onClick:i})=>e.jsxs(Fr,{ref:o=>{s&&s(o)},onClick:i,title:n,children:[e.jsx(Ly,{dangerouslySetInnerHTML:{__html:t}}),e.jsx(Sy,{dangerouslySetInnerHTML:{__html:n}})]}),Mr=t=>{const{dragOn:n,dragOff:s}=ai(),[{isDragging:i},o]=qo(()=>({type:ee.FieldType,collect:r=>({isDragging:r.isDragging()}),item:{type:ee.FieldType,data:t}}));return g.useEffect(()=>{i?n(ee.FieldType):s()},[i,n,s]),{ref:o}},Ry=({fieldType:t})=>{const{icon:n,name:s}=t,i=H(),{ref:o}=Mr(t),r=()=>{i(Oe.move.newField.newRow({fieldType:t}))};return e.jsx(zr,{icon:n,label:u(s),onClick:r,dragRef:o})},Py=(t={})=>{const n=X(),s=t?.onSuccess;return t.onSuccess=(i,o,r,a)=>{s?.(i,o,r,a),n.invalidateQueries({queryKey:op.all})},le({...t,mutationFn:i=>T.post("/api/fields/types/groups",i)})},Ir=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m7.5 9.61c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m3.57 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m11.43 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m7.5 1.75c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"})]}),Dy=l.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: ${h.white};
  border: 1px solid ${h.gray100};
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    border-color: ${h.gray200};
    background-color: ${h.gray050};
  }
`,By=l.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`,Oy=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 18px;

  svg {
    max-width: 18px;
    max-height: 18px;
  }

  color: ${h.gray500};
`,_y=l.div`
  color: ${h.gray500};
  margin-right: ${m.xs};
`,Wi=({typeClass:t})=>{const n=Me(t),s=g.useRef(null),i=Ct(s);if(!n)return null;const{name:o,icon:r}=n;return e.jsxs(Dy,{"data-id":t,ref:s,title:o,children:[e.jsx(Oy,{dangerouslySetInnerHTML:{__html:O.sanitize(r)}}),e.jsx(By,{children:o}),i&&e.jsx(_y,{className:"remove field-item-remove",children:e.jsx(dt,{})})]})},Wy=()=>`#${(Math.floor(Math.random()*16777215)+16777216).toString(16).slice(1)}`,Uy=(t,n,s)=>{const i=g.useCallback(()=>{n(a=>({...a,groups:{...a.groups,grouped:[...a.groups.grouped,{uid:G(),label:"",color:Wy(),types:[]}]}}))},[n]),o=g.useCallback((a,c,d)=>{n(p=>({...p,groups:{...p.groups,grouped:p.groups.grouped.map(x=>x.uid===d?{...x,[a]:c}:x)}}))},[n]),r=g.useCallback(()=>{const a=Ne.get(s.current.hidden).toArray(),d=Ne.get(s.current.groupWrapper).toArray().map(p=>({...t.groups.grouped.find(f=>f.uid===p),types:Ne.get(s.current[p]).toArray()}));return{hidden:a,grouped:d}},[s,t]);return{addGroup:i,updateGroupInfo:o,syncFromRefs:r}},Hy=l.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--gray-050);
  height: 600px;
`,qy=l.div`
  position: relative;
  background-color: ${h.white};
  padding: ${m.md};
  border-radius: ${S.md};
  border: 1px solid ${h.hairline};
  display: flex;
  gap: ${m.md};
`,cp=l.div`
  padding: 25px ${m.lg};
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  overflow-x: hidden;
  overflow-y: auto;
  ${Q};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;cp.defaultProps={$empty:"Click the 'Add Group' button on the right to begin."};const Qy=l.div`
  flex: 1;
`,Ky=l.div`
  display: flex;
  align-items: flex-start;
  padding-bottom: ${m.lg};
  gap: ${m.lg};
`,dp=l.div`
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 1fr;
  border-radius: ${S.md};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }

  svg {
    fill: ${({color:t})=>t||h.black};
  }

  .remove {
    svg {
      fill: ${h.black} !important;
    }
  }
`;dp.defaultProps={$empty:"Drag and drop any field here",color:h.black};const Vy=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
`,Gy=l.div`
  padding: 25px ${m.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Eo=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;Eo.defaultProps={$empty:"Drag and drop any field here"};const Yy=l.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${m.xl};

  padding-top: ${m.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`,wl=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  padding: ${m.xs} ${m.xs} ${m.xs} ${m.md};
`,Jy=l.button`
  appearance: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${h.gray100};
  cursor: pointer;
  background-color: ${({color:t})=>t||h.black};
  position: relative;
`,Zy=l.div`
  position: relative;
  flex: 0 0 auto;
`,Xy=l.div`
  position: absolute;
  top: -6px;
  left: calc(100% + ${m.sm});
  z-index: 10;
  padding: ${m.sm};
  border: 1px solid ${h.gray100};
  border-radius: ${S.md};
  background: ${h.white};
  box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
`,e7=l.div`
  color: ${h.warning};
`,$l=(t,n)=>n.options.handle!==".handle",t7=t=>{const n=(i,o)=>{const r=t.current[i];r&&Ne.create(r,o)};Object.entries({unassigned:{group:{name:"shared",put:$l},animation:150,sort:!1},hidden:{group:{name:"shared",put:$l},animation:150,sort:!0,filter:".field-item-remove",onFilter:o=>t.current.unassigned.appendChild(o.item)},groupWrapper:{handle:".handle",filter:".group-remove",sort:!0,animation:150,onFilter:o=>{const r=Array.from(t.current[o.item.dataset.id].children);t.current.unassigned.append(...r),o.item.remove()}}}).forEach(([o,r])=>{n(o,r)})},n7=(t,n,s)=>{t&&(Ne.create(t,{animation:150,group:{name:`group-${n}`,put:(i,o)=>o.options.handle!==".handle"},sort:!0,filter:".field-item-remove",onFilter:i=>s.current.unassigned.appendChild(i.item)}),s.current[n]=t)},s7=({color:t,onChange:n})=>{const[s,i]=g.useState(!1),o=$t({callback:()=>i(!1),isEnabled:s});return e.jsxs(Zy,{ref:o,children:[e.jsx(Jy,{type:"button",color:t,"aria-expanded":s,"aria-label":u("Select Color"),onClick:()=>i(r=>!r)}),s&&e.jsx(Xy,{children:e.jsx(cu,{value:t,onChange:n})})]})},i7=({closeModal:t})=>{const[n,s]=g.useState({}),[i,o]=g.useState(),[r,a]=g.useState(!1),c=g.useRef({}),{addGroup:d,updateGroupInfo:p,syncFromRefs:x}=Uy(n,s,c),{data:f}=rp();g.useEffect(()=>{f&&!r&&(s(f),a(!0))},[f,r]),g.useEffect(()=>{t7(c)},[]);const b=Py({onSuccess:()=>{t()},onError:y=>{o(y.errors)}}),j=b.isPending;return e.jsxs(ve,{style:{maxWidth:"70%"},children:[e.jsx(we,{children:e.jsx("h1",{children:u("Field Type Manager")})}),e.jsxs(Hy,{children:[e.jsxs(cp,{ref:y=>{c.current.groupWrapper=y},$empty:u("Click the 'Add Group' button on the right to begin."),children:[i?.length&&e.jsx(e7,{children:u("Something went wrong!")}),n.groups?.grouped?.map(y=>e.jsxs(qy,{"data-id":y.uid,children:[e.jsxs(Qy,{children:[e.jsxs(Ky,{children:[e.jsx(s7,{color:y.color,onChange:w=>p("color",w,y.uid)}),e.jsx(je,{value:y.label,property:{type:K.Label,handle:y.uid},updateValue:w=>p("label",w,y.uid)})]}),e.jsx(dp,{$empty:u("Drag and drop any field here"),ref:w=>{n7(w,y.uid,c)},color:y.color,children:y.types?.map(w=>e.jsx(Wi,{typeClass:w},w))})]}),e.jsxs(Vy,{children:[e.jsx("button",{type:"button",className:"group-remove",children:e.jsx(dt,{})}),e.jsx("button",{type:"button",className:"handle",children:e.jsx(Ir,{})})]})]},y.uid))]}),e.jsxs(Gy,{children:[e.jsx("button",{onClick:d,type:"button",className:"btn add icon dashed",children:u("Add Group")}),e.jsxs(Yy,{children:[e.jsxs(wl,{className:"unassigned",children:[e.jsx("h3",{children:u("Unassigned")}),e.jsx(Eo,{$empty:u("Drag and drop any fields here. Unassigned fields will display at the bottom of the list of field types."),ref:y=>{c.current.unassigned=y},children:n.types?.map(y=>e.jsx(Wi,{typeClass:y},y))})]}),e.jsxs(wl,{children:[e.jsx("h3",{children:u("Hidden")}),e.jsx(Eo,{$empty:u("Drag and drop any fields here to hide them."),ref:y=>{c.current.hidden=y},children:n.groups?.hidden?.map(y=>e.jsx(Wi,{typeClass:y},y))})]})]})]})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn",onClick:t,disabled:j,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(J,{loadingText:u("Saving..."),loading:j,onClick:()=>b.mutate(x()),spinner:!0,children:u("Save")})})]})]})},o7=()=>{const{openModal:t}=qe();return()=>{t(i7)}},r7=u("Field Types"),Cl=({group:t})=>{const n=Yt(),s=t.types.map(i=>{const o=n(i);return o?.visible?o&&e.jsx(Ry,{fieldType:o},i):null}).filter(Boolean);return s.length?e.jsxs(Iy,{color:t.color,children:[t.label&&e.jsx(Ay,{children:u(t.label)}),e.jsx(ci,{children:s})]},t.uid):null},a7=()=>{const t=Ny(),{data:n,isFetching:s,isError:i,error:o}=rp({select:t}),r=o7();return!n&&s?e.jsx(Nr,{words:[50,70],items:16}):i?e.jsx(li,{children:o.message}):e.jsxs(lp,{button:I.limitations.can("layout.fieldManager")&&{icon:e.jsx(Er,{}),title:u("Edit Manager"),onClick:r},minEdition:oe.Lite,title:u(r7),children:[n.groups.grouped?.map(a=>e.jsx(Cl,{group:a},a.uid)),n?.types&&e.jsx(Cl,{group:{uid:"external",types:n.types}})]})},ui={all:["field-favorites"]},up=({select:t}={})=>B({queryKey:ui.all,queryFn:()=>T.get("/api/fields/favorites").then(n=>n.data),staleTime:1/0,select:t}),l7=(t,n)=>{const s=Mt(n);return Object.entries(t.properties).forEach(([i,o])=>{const r=s?.properties?.find(a=>a.handle===i);r&&(r.value=o)}),s},c7=({favorite:t})=>{const{typeClass:n,label:s}=t,i=Me(n),o=l7(t,i),r=H(),{ref:a}=Mr(o);if(!i||!o)return null;const{icon:c}=i,d=()=>{r(Oe.move.newField.newRow({fieldType:o}))};return e.jsx(zr,{icon:c,label:s,onClick:d,dragRef:a})},d7=({label:t,field:n,type:s})=>{const i={label:t,properties:n.properties,typeClass:s.typeClass};return T.post("/api/fields/favorites",i)},u7=()=>{const t=X();return le({mutationFn:d7,onSuccess:()=>{t.invalidateQueries({queryKey:ui.all})}})},p7=(t={})=>{const n=X(),s=t?.onSuccess;return t.onSuccess=(i,o,r,a)=>{s?.(i,o,r,a),n.invalidateQueries({queryKey:ui.all})},le({...t,mutationFn:i=>T.post("/api/fields/favorites/update",i)})},h7=(t={})=>{const n=X(),s=t?.onSuccess;return t.onSuccess=(i,o,r,a)=>{s?.(i,o,r,a);const c=o;n.setQueryData(ui.all,d=>d.filter(p=>p.id!==c))},le({...t,mutationFn:i=>T.post("/api/fields/favorites/delete",{id:i})})},x7=t=>t?typeof t=="string"?e.jsx(Us,{dangerouslySetInnerHTML:{__html:O.sanitize(t)}}):e.jsx(Us,{children:t}):null,Ar=({label:t,icon:n,children:s})=>e.jsxs(Tx,{children:[e.jsx(Xo,{"data-label":t,children:s}),x7(n)]}),m7=({property:t,siblingProperties:n,state:s,errors:i,updateValueCallback:o})=>{const r=vs(n,s,o);return e.jsx(je,{value:s?.[t.handle]||"",property:t,updateValue:r(t),errors:i,context:{properties:s}})},g7=t=>n=>n.section===t,f7=({field:t,errors:n,values:s,updateValueCallback:i})=>{const{data:o}=nr(),r=Me(t?.typeClass);if(!t||!r||!o)return null;const a=[],c=s?.label||u(r.name);return o.sort((d,p)=>d.order-p.order).forEach(({handle:d,label:p,icon:x})=>{const f=r.properties.filter(g7(d));f.length&&a.push(e.jsx(Ar,{label:u(p),icon:x,children:f.map(b=>e.jsx(m7,{errors:n?.[b.handle],state:s,siblingProperties:r.properties,property:b,updateValueCallback:i},b.handle))},d))}),e.jsxs(e.Fragment,{children:[e.jsxs(mn,{children:[e.jsx(Jn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})]}),e.jsx(Cd,{size:"small",children:e.jsx(lr,{children:a})})]})},b7=l.div`
  display: flex;
  justify-content: space-between;

  height: 600px;
`,Es=22,j7=l.div`
  flex: 1;

  height: 100%;
  padding: 0 ${m.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};

  ${mn} {
    padding-left: 0;
    font-size: 18px;

    ${Jn} {
      width: ${Es}px;
      height: ${Es}px;

      svg {
        max-width: ${Es}px;
        max-height: ${Es}px;
      }
    }
  }

  ${Xo} {
    &:after {
      background-color: white;
    }
  }
`,y7=l.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;

  padding: ${m.sm};

  overflow-y: auto;
  overflow-x: hidden;

  background: ${h.gray050};
  box-shadow: ${re.right};

  ${Q};
`,v7=l.li`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  width: 250px;
  padding: ${m.xs} ${m.xs} ${m.xs} ${m.md};

  border: 1px solid transparent;
  border-radius: ${S.lg};
  font-size: 13px;

  user-select: none;
  transition: all 0.2s ease-in-out;

  > span {
    flex: 1;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    background-color: ${h.gray200};
  }

  &.active {
    background: ${h.gray500};
    color: ${h.white};
    fill: currentColor;

    a {
      color: ${h.blue300};
    }
  }

  &.errors {
    color: ${h.error};
    fill: currentColor;

    ${Zo};
  }
`,w7=l.div`
  font-size: 10px;

  &,
  svg {
    height: 20px;
    width: 20px;
  }
`;l.button`
  position: absolute;
  top: 0;
  right: 0;
`;const $7=({favorite:t,label:n,errors:s,isActive:i,onClick:o,onDelete:r})=>{const a=g.useRef(null),c=Ct(a),d=Me(t.typeClass);if(!d)return null;const p=s?.length;return e.jsxs(v7,{ref:a,onClick:o,className:E(i&&"active",p&&"errors"),children:[e.jsx(w7,{dangerouslySetInnerHTML:{__html:O.sanitize(d.icon)}}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(n)}}),e.jsx(Tn,{active:c,onClick:r})]},t.id)},C7=({closeModal:t})=>{const{data:n}=up(),[s,i]=g.useState(),[o,r]=g.useState({}),[a,c]=g.useState(),[d,p]=g.useState(!1),x=p7({onSuccess:()=>{t()},onError:j=>{c(j.errors)}}),f=h7({onSuccess:(j,y)=>{const w=n.filter(v=>v.id!==y)?.at(0);w?i(w):t()}});g.useEffect(()=>{if(!n||d)return;p(!0),i(n?.[0]);const j={};n.forEach(y=>{j[y.id]=y.properties}),r(j)},[n,d]);const b=x.isPending||f.isPending;return e.jsxs(ve,{style:{maxWidth:"70%"},children:[e.jsx(we,{children:e.jsx("h1",{children:u("Favorite Fields")})}),e.jsxs(b7,{children:[e.jsx(y7,{children:n.map(j=>e.jsx($7,{favorite:j,label:o?.[j.id]?.label||j.label,errors:a?.[j.id],isActive:s?.id===j.id,onClick:()=>i(j),onDelete:()=>{confirm(`Are you sure you wish to delete the "${j.label}" field?`)&&f.mutate(j.id)}},j.id))}),e.jsx(j7,{children:s&&e.jsx(f7,{field:s,values:o?.[s.id],errors:a?.[s.id],updateValueCallback:(j,y)=>{r(w=>({...w,[s.id]:{...w[s.id],[j]:y}}))}})})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn",onClick:t,disabled:b,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",disabled:b,onClick:()=>x.mutate(o),children:e.jsx(J,{loadingText:u("Saving..."),loading:b,spinner:!0,children:u("Save")})})]})]})},k7=()=>{const{openModal:t}=qe();return()=>{t(C7)}},S7=u("Favorites"),L7=()=>{const t=zy(),{data:n,isFetching:s,isError:i,error:o}=up({select:t}),r=k7(),a=Yt();return!n&&s?e.jsx(Nr,{words:[60],items:2}):i?e.jsx(li,{children:o.message}):n.length?e.jsx(lp,{title:u(S7),button:I.limitations.can("layout.favoritesManager")&&{icon:e.jsx(Er,{}),title:u("Edit Favorites"),onClick:r},children:e.jsx(ci,{children:n.map(c=>{const d=a(c.typeClass);return!d||!d?.visible?null:e.jsx(c7,{favorite:c},c.id)})})}):null},F7={all:["field-forms"]},E7=({select:t})=>B({queryKey:F7.all,queryFn:()=>T.get("/api/fields/forms").then(n=>n.data),staleTime:1/0,select:t}),T7=t=>e.jsx(R,{height:"1em",viewBox:"0 0 320 512",...t,children:e.jsx("path",{d:"M305 239c9.4 9.4 9.4 24.6 0 33.9L113 465c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l175-175L79 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L305 239z"})}),N7=(t,n)=>{const s=Mt(n);return Object.entries(t.properties).forEach(([i,o])=>{const r=s?.properties?.find(a=>a.handle===i);r&&(r.value=o)}),s},z7=({field:t})=>{const{typeClass:n,label:s}=t,i=Me(n),o=N7(t,i),r=H(),{ref:a}=Mr(o);if(!i)return null;const{icon:c}=i,d=()=>{r(Oe.move.newField.newRow({fieldType:o}))};return e.jsx(zr,{icon:c,label:s,onClick:d,dragRef:a})},M7=t=>Y({maxHeight:t?200:0,paddingTop:t?8:0,paddingBottom:t?8:0,config:{tension:500,friction:t?26:40}}),I7=l.div`
  cursor: pointer;
  position: relative;

  padding: ${m.sm} ${m.xl} ${m.sm} ${m.sm};
  background: ${h.elements.dropdown};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  user-select: none;
`,A7=l(_.div)`
  max-height: 0px;
  padding: ${m.sm};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Ts=12,pp=l.div`
  position: absolute;
  right: 10px;
  top: calc(50% - ${Ts/2}px);

  height: ${Ts}px;
  width: ${Ts}px;
  font-size: ${Ts}px;

  transform: rotate(90deg);
  transform-origin: center;
  transition: transform 0.2s ${Ko.easeOut};
`,R7=l.div`
  border: 1px solid ${h.elements.dropdown};
  border-radius: ${S.md};

  margin: 0 -8px;

  &.open {
    ${pp} {
      transform: rotate(180deg);
    }
  }
`,P7=({form:t})=>{const[n,s]=g.useState(!1),i=P(di.query(kn.Fields)),o=Yt(),r=n||i.length>0,a=M7(r);return t.fields.length?e.jsxs(R7,{className:E(r&&"open"),children:[e.jsxs(I7,{onClick:()=>s(!n),children:[t.name,e.jsx(pp,{children:e.jsx(T7,{})})]}),e.jsx(A7,{style:a,children:e.jsx(ci,{children:t.fields.map(c=>{const d=o(c.typeClass);return!d||!d?.visible?null:e.jsx(z7,{field:c},c.id)})})})]}):null},D7=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
`,B7=()=>{const{uid:t}=P(Pe.current),n=My(),{data:s,isFetching:i,isError:o,error:r}=E7({select:n});if(!s&&i)return null;if(o)return e.jsx(li,{children:r.message});if(!s||!s.length)return null;const a=s.filter(d=>d.uid!==t).sort((d,p)=>d.name.localeCompare(p.name)),c=a.some(d=>d.fields.length>0);return!a.length||!c?null:e.jsxs(D7,{children:[e.jsx(Tr,{children:u("Fields from other Forms")}),a.map(d=>e.jsx(P7,{form:d},d.uid))]})},O7=()=>{const t=qt(),[n,s]=g.useState(""),i=xs(n,1e3);return g.useEffect(()=>{t(Lh.update({type:kn.Fields,query:i}))},[i,t]),[n,s]},hp=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{fill:"currentColor",d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"})}),xp=l.div`
  position: relative;
  z-index: 1;

  margin-bottom: ${m.lg};
`,mp=l.div`
  display: flex;
`,gp=l.input`
  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${h.gray200};
  }
`,kl="14px",_7=ne`
  position: absolute;
  top: 1px;
  bottom: 1px;
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 0 8px;

  box-sizing: border-box;
  user-select: none;

  > svg {
    width: ${kl};
    height: ${kl};
  }
`,fp=l.div`
  left: 1px;

  ${_7}

  color: ${h.gray400};
`,W7=()=>{const[t,n]=O7();return e.jsx(xp,{children:e.jsxs(mp,{children:[e.jsx(fp,{children:e.jsx(hp,{})}),e.jsx(gp,{type:"text",placeholder:u("Search"),className:"fullwidth text",value:t,onChange:s=>{n(s.target.value)}})]})})},U7=()=>{nr();const t=P(Ae.count),n=I.editions.is(oe.Express)&&t>=I.limits.fields;return e.jsxs(Fy,{className:E(n&&"fields-disabled"),children:[e.jsx(W7,{}),e.jsx(L7,{}),e.jsx(a7,{}),I.limitations.can("layout.formsFields")&&e.jsx(B7,{})]})},bp=l.div`
  position: relative;
  display: flex;
  gap: 0;

  height: 100%;
  overflow: hidden;

  background: #fff;
`,To=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"})}),H7=t=>e.jsx(R,{viewBox:"0 0 576 512",...t,children:e.jsx("path",{d:"M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9l2.6-2.4C267.2 438.6 256 404.6 256 368c0-97.2 78.8-176 176-176c28.3 0 55 6.7 78.7 18.5c.9-6.5 1.3-13 1.3-19.6v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5zM576 368c0-79.5-64.5-144-144-144s-144 64.5-144 144s64.5 144 144 144s144-64.5 144-144zm-76.7-43.3c6.2 6.2 6.2 16.4 0 22.6l-72 72c-6.2 6.2-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L416 385.4l60.7-60.7c6.2-6.2 16.4-6.2 22.6 0z"})}),q7=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"})}),Q7=({category:t,handle:n,error:s})=>{const i=s.errors?.[t]?.[n];return i?e.jsx("ul",{className:"errors",children:i.map((o,r)=>e.jsxs("li",{children:[e.jsx("span",{className:"visually-hidden",children:"Error:"}),o]},r))}):null},K7=l.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: ${m.lg};
`,V7=l.div`
  display: flex;
  justify-content: center;
`,G7=({field:t,type:n,mutation:s})=>{const[i,o]=g.useState("");return g.useEffect(()=>{o(t.properties.label||n?.name),s.reset()},[t.uid,n?.name]),e.jsxs(K7,{children:[e.jsx(ls,{children:e.jsx(Dt,{property:{label:u("Create a favorite"),handle:t.properties?.handle,flags:[],placeholder:t.properties?.label,type:K.String},value:i,updateValue:r=>o(r)})}),e.jsx(V7,{children:e.jsx("button",{type:"button",disabled:s.isPending,className:E("btn fullwidth",!s.isSuccess&&"submit",s.isPending&&"disabled"),onClick:()=>{s.mutate({label:i,field:t,type:n})},children:e.jsx(J,{spinner:!0,loading:s.isPending,loadingText:"Saving...",children:u(s.isSuccess?"Saved!":"Favorite")})})}),s.isError&&e.jsx(Q7,{category:"favorites",handle:"name",error:s.error})]})},jp=l(_.div)`
  position: absolute;
  top: 24px;
  right: -16px;

  transform-origin: 90% -20%;
`,Y7=l.div`
  position: absolute;
  top: -30px;
  right: 10px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-content: center;

  width: 32px;
  height: 32px;

  padding: 5px;

  background: ${h.gray050};

  border-style: solid;
  border-width: 1px;
  border-color: ${h.barelyVisible};
  border-bottom-color: transparent;
  border-radius: ${S.md} ${S.md} 0 0;

  transform-origin: center bottom;
`,J7=l.div`
  position: relative;
  z-index: 1;

  width: 240px;
  padding: ${m.lg};

  background: ${h.gray050};
  border: 1px solid ${h.barelyVisible};
  border-radius: ${S.md};

  box-shadow: 4px 12px 8px rgb(205 216 228 / 80%);
`,Z7=l(_.button)`
  position: relative;
  z-index: 5;

  width: 20px;
  height: 20px;

  svg {
    fill: ${h.barelyVisible};
  }
`,X7=l.div`
  position: absolute;
  top: 17px;
  right: 40px;
  z-index: 3;

  background: none;
  border: none;

  display: flex;
  justify-content: center;
  align-content: center;

  &:not(.active) {
    ${jp} {
      pointer-events: none;
    }
  }
`,ev=({field:t})=>{const n=Me(t?.typeClass),s=u7(),[i,o]=g.useState(!1),[r,a]=g.useState(!1);g.useEffect(()=>{o(!1),a(!1),s.reset()},[t?.uid,s.reset]);const c=Y({to:{opacity:i?1:0,scale:i?1:1.1,rotate:i?0:-10},config:{tension:700}}),d=Y({to:{scale:r?1.2:1},config:{tension:600,mass:3}}),p=$t({callback:()=>{o(!1),a(!1)},isEnabled:i});return os(()=>{o(!1),a(!1)},i),!t?.uid||n.type==="group"?null:e.jsxs(X7,{className:E(i&&"active"),ref:p,children:[e.jsxs(Z7,{style:d,onClick:()=>o(!i),onMouseOver:()=>a(!0),onMouseOut:()=>a(!1),children:[s.isSuccess&&e.jsx(H7,{}),!s.isSuccess&&e.jsx(q7,{})]}),e.jsxs(jp,{style:c,children:[e.jsx(Y7,{}),e.jsx(J7,{children:e.jsx(G7,{field:t,type:n,mutation:s})})]})]})},tv=({property:t,field:n,autoFocus:s})=>{const i=H(),o=Me(n.typeClass),{getTranslation:r,updateTranslation:a,canUseTranslationValue:c}=Ce(n),d=P(Ae.one(n.uid)),p={id:d.id,...d?.properties||{}},x=vs(o.properties,p,(j,y)=>{a(j,y)||i(be.edit({uid:n.uid,handle:j,value:y}))}),f=n.properties?.[t.handle],b=r(t.handle,f);return e.jsx(je,{autoFocus:s,value:c(t)?b:f,property:t,updateValue:x(t),errors:n.errors?.[t.handle],context:n})},Ui=l.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  background: ${h.gray050};
`,nv=t=>n=>n.section===t,sv=({uid:t})=>{const n=H(),{data:s,isFetching:i}=nr(),o=P(Ae.one(t)),r=Me(o?.typeClass),a=g.useMemo(()=>{const c=[];return s?.sort((d,p)=>d.order-p.order)?.forEach(({handle:d,label:p,icon:x},f)=>{const b=r?.properties.filter(nv(d)).filter(j=>j.visible);b?.length&&c.push(e.jsx(Ar,{label:u(p),icon:x,children:b.map((j,y)=>e.jsx(tv,{autoFocus:f===0&&y===0,field:o,property:j},j.handle))},d))}),c},[s,r,o]);return!o||!r?e.jsx(Ui,{}):!s&&i?e.jsxs(Ui,{children:[e.jsxs(mn,{children:[e.jsx(Jn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{children:u(r.name)})]}),e.jsx(Zn,{children:e.jsx(k,{})})]}):e.jsxs(Ui,{children:[e.jsx(no,{onClick:()=>n(ye.unfocus()),children:e.jsx(To,{})}),I.limitations.can("layout.favorite")&&e.jsx(ev,{field:o}),e.jsxs(mn,{children:[e.jsx(Jn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{children:u(r.name)})]}),e.jsx(Zn,{children:a})]})},iv=({property:t,page:n})=>{const s=H(),{getTranslation:i,updateTranslation:o}=Ce(n),r=t.handle,a=p=>{o(r,p)||s(Cn.editButtons({uid:n.uid,key:r,value:p}))},c=n.buttons?.[r],d=typeof c=="string"?i(r,c):c;return e.jsx(je,{value:d,property:t,updateValue:a,context:n})},Sl=l.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  background: ${h.gray050};
`,ov=t=>n=>n.section===t,rv=({uid:t})=>{const n=H(),s=P(et.one(t)),{data:i,isFetching:o}=fd();if(!i&&o)return e.jsxs(Sl,{children:[e.jsx(no,{onClick:()=>n(ye.unfocus()),children:e.jsx(To,{})}),e.jsx(mn,{children:e.jsx("span",{children:s.label})}),e.jsxs(Zn,{style:{paddingTop:20},children:[e.jsx(k,{height:30}),e.jsx(k,{height:30}),e.jsx(k,{height:30})]})]});if(!s)return null;const r=[];return i.sections.forEach(({handle:a,label:c,icon:d})=>{const p=i.properties.filter(ov(a)).filter(x=>x.visible);p.length&&r.push(e.jsx(Ar,{label:c,icon:d,children:p.map(x=>e.jsx(iv,{page:s,property:x},x.handle))},a))}),e.jsxs(Sl,{children:[e.jsx(no,{onClick:()=>n(ye.unfocus()),children:e.jsx(To,{})}),e.jsx(mn,{children:e.jsx("span",{children:s.label})}),e.jsx(Zn,{children:r})]})},av=()=>{const t=H(),n=P(Ot.focus),{active:s,type:i}=n;os(()=>t(ye.unfocus()),s);const o=$t({callback:()=>{t(ye.unfocus())},isEnabled:s,excludeClassNames:["field-layout","page-buttons","page-tab","save-button","main-tabs","editable-content","dropdown-rollout","breadcrumbs","tagify__dropdown","tox","elementselectormodal"]}),r=oc(s?[n]:null,{from:{transform:"translate3d(100%, 0, 0)",opacity:1},enter:{transform:"translate3d(0%, 0, 0)",opacity:1,zIndex:2},leave:{transform:"translate3d(-100%, 0, 0)"},config:{tension:500,friction:50}});return e.jsx(Cd,{size:"small",children:e.jsx(Fx,{$active:s,ref:o,children:e.jsx($r,{message:`Could not load property editor for "${i}" type`,children:r((a,c)=>e.jsxs(Ex,{style:a,children:[!!c&&c.type==="field"&&e.jsx(sv,{uid:c.uid}),!!c&&c.type==="page"&&e.jsx(rv,{uid:c.uid})]}))})})})},lv=()=>{const t=st("");return e.jsxs(jj,{children:[e.jsx(q,{id:"layout",label:u("Layout"),url:t.pathname}),e.jsxs(bp,{children:[e.jsxs(De,{$noPadding:!0,children:[e.jsx(av,{}),e.jsx(U7,{})]}),e.jsx(ky,{})]})]})},pi=l.div`
  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${m.xl};

  background: ${h.white};
  padding: ${m.xl};

  overflow-y: auto;

  ${Q};
`,yp=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,cv=()=>{const t=st(""),n=yr(),{templates:s}=vr(""),{templates:{canCreate:i,method:o}}=I,r=()=>{n({type:"form"})};return e.jsxs(pi,{children:[e.jsx(q,{id:"notification-manager",label:u("Manager"),url:t.pathname}),e.jsxs(yp,{children:[e.jsx("h1",{children:u("Notification Manager")}),e.jsx(Fu,{children:e.jsx(Co,{value:"",title:u("Form Templates"),templates:s.form,openEditOnClick:!0,onClick:()=>{},canCreate:i&&o!==is.Global,onCreate:r})})]})]})},dv=l.div`
  display: flex;
  height: 100%;
`,uv=(t,n)=>(s,i)=>{const{className:o,properties:r,newInstanceName:a}=t,c={};r.forEach(x=>{c[x.handle]=x.value});const d=Mn.count.ofType(o)(i()),p=`${a} notification ${d+1}`;s(Rt.add({uid:n,className:o,enabled:!0,...c,name:p}))},pv=t=>n=>{n(Rt.remove(t.uid))},Hi=20,hi=l.div`
  display: block;
  width: ${Hi}px;
  height: ${Hi}px;
  font-size: ${Hi}px;
  fill: ${h.gray550};
`,Rr=l(he)`
  display: flex;
  align-items: center;
  gap: ${m.sm};

  padding: ${m.sm} ${m.md};
  border-radius: ${S.lg};

  color: ${h.gray700};
  font-size: 12px;
  line-height: 12px;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${h.white};
    background-color: ${h.gray500};

    ${hi} {
      fill: ${h.white};
    }
  }

  &.active.inactive {
    .status-dot {
      border-color: ${h.white};
    }
  }

  &:hover {
    text-decoration: none;
  }

  &:hover:not(.active) {
    background-color: ${h.gray200};
  }

  &.errors {
    color: ${h.error};
  }
`,vp=l.div`
  flex-grow: 1;
  max-width: 90%;
  overflow: hidden;

  &:empty:after {
    content: 'No Title';
    color: ${h.gray400};
    font-style: italic;
  }
`,hv=l.div`
  content: '';

  flex-shrink: 0;
  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({$enabled:t})=>t?"transparent":h.gray550};
  border-radius: 100%;

  background-color: ${({$enabled:t})=>t?h.teal550:"transparent"};

  transition: all 0.3s ease-out;
`,No=l.div``,zo=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`,Ll=l.span`
  padding-left: ${m.md};
  font-weight: 700;
  font-size: 11px;
  color: ${h.gray550};
  text-transform: uppercase;
`,xv=l.button`
  align-self: end;

  &:hover {
    background-color: ${h.gray200};
  }
`,Mo=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  padding: ${m.xs} 0;
`,mv=l.div`
  padding: 2px;
  margin-left: 12px;

  font-style: italic;
  font-size: 12px;

  color: ${h.gray300};
`,gv=({type:t,children:n})=>{const s=te(),i=H(),{setLastTab:o}=We("notifications"),{name:r,edition:a}=t,{isAtLeast:c}=I.editions;return c(t.edition)?e.jsxs(No,{children:[e.jsxs(zo,{children:[e.jsx(Ll,{children:u(r)}),e.jsx(xv,{type:"button",className:E("btn","add","icon","small","dashed"),onClick:()=>{const d=G();i(uv(t,d)),o(d),s(d)},children:u("New")})]}),e.jsx(Mo,{children:n})]}):e.jsxs(No,{children:[e.jsx(zo,{children:e.jsx(Ll,{children:u(r)})}),e.jsx(Mo,{style:{opacity:.7},children:e.jsxs(Rr,{className:"flex",to:Craft.getCpUrl("plugin-store/freeform"),target:"_blank",children:[e.jsx(hi,{className:E("disabled-icon"),children:e.jsx("i",{className:"fa-thin fa-star-exclamation"})}),e.jsx("span",{className:E("edition-label"),children:u("Upgrade to {edition} to enable.",{edition:dc(a)})})]})})]})},fv=()=>e.jsx(zn,{children:e.jsxs(No,{children:[e.jsx(zo,{children:e.jsx(k,{width:50})}),e.jsx(Mo,{style:{padding:14},children:[0,1,2].map(t=>e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[e.jsx(k,{width:20,height:20,circle:!0}),e.jsx("div",{style:{flexGrow:2},children:e.jsx(k,{width:100,style:{top:2}})}),e.jsx(k,{width:10,height:10,circle:!0,style:{top:6}})]},t))})]})}),bv=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"})}),jv=({icon:t,notification:{uid:n}})=>{const{setLastTab:s}=We("notifications"),{name:i,enabled:o,errors:r}=P(Mn.one(n));return e.jsxs(Rr,{onClick:()=>s(n),to:`${n}`,className:E(fn(r)&&"errors",!o&&"inactive"),children:[t&&e.jsx(hi,{dangerouslySetInnerHTML:{__html:O.sanitize(t)}}),e.jsx(vp,{children:i}),e.jsx(hv,{$enabled:o,className:E("status-dot")})]})},yv=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
  height: 100%;

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,vv=I.templates.method,wv=()=>{const t=I.limitations,{formId:n,uid:s}=V(),{pathname:i}=Ht(),o=te(),{lastTab:r,setLastTab:a}=We("notifications"),{data:c,isFetching:d}=Vc();Yo(n?Number(n):void 0);const p=P(Mn.all);return g.useEffect(()=>{!s&&!i.endsWith("/manager")&&r&&o(r)},[s,r,o,i]),g.useEffect(()=>{if(!i.endsWith("/manager")&&!s&&!r&&c&&p){const x=p.find(Boolean);x&&(a(x.uid),o(x.uid))}},[s,c,p,r,o,i,a]),!c&&d?e.jsx(De,{children:e.jsx(fv,{})}):!c&&!d?e.jsx(e.Fragment,{children:"Empty"}):e.jsx(De,{$lean:!0,children:e.jsxs(yv,{children:[c.filter(x=>t.can(`notifications.tab.${x.className}`)).map(x=>e.jsxs(gv,{type:x,children:[p?.filter(f=>f.className===x.className).map(f=>e.jsx(jv,{icon:x.icon,notification:f},f.uid)),!p?.filter(f=>f.className===x.className)?.length&&e.jsx(mv,{children:u("None configured")})]},x.className)),vv!==is.Global&&e.jsxs(Rr,{onClick:()=>a(s),to:"manager",children:[e.jsx(hi,{children:e.jsx(bv,{})}),e.jsx(vp,{children:u("Template Manager")})]})]})})},$v=()=>{const t=st("");return e.jsxs(dv,{children:[e.jsx(q,{id:"notifications",label:u("Notifications"),url:t.pathname}),e.jsx(wv,{}),e.jsx(jt,{})]})},Cv=({notification:t,property:n})=>{const s=H(),{uid:i}=t,{handle:o}=n,r=c=>{s(Rt.modify({uid:i,key:o,value:c}))},a=t?.[n.handle];return e.jsx(je,{value:a,property:n,updateValue:r,errors:t.errors?.[n.handle],context:t})},kv=t=>e.jsxs(R,{height:"1em",viewBox:"0 0 512 512",...t,children:[e.jsx("defs",{children:e.jsx("style",{children:".fa-secondary{opacity:0.2;fill:#a1a5aa;}.fa-primary{fill:#a6a8ab;}"})}),e.jsx("path",{className:"fa-primary",d:"M380.7 185.8c5.1-6.7 4.2-16.2-2.1-21.8s-15.9-5.3-21.9 .7l-179 179-13 13c-3 3-4.7 7.1-4.7 11.3v8 56 48c0 13.2 8.1 25 20.3 29.8s26.2 1.6 35.2-8.1L284 427.7l-60-25V389.4L380.7 185.8z"}),e.jsx("path",{className:"fa-secondary",d:"M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L224 402.7V389.4L380.7 185.8c5.2-6.7 4.2-16.4-2.3-21.9s-16.1-5.1-22 1.1L178.8 350.6l-14.1 14.1c-3 3-4.7 7.1-4.7 11.3l-28.3-11.8-112-46.7C8.4 312.8 .8 302.2 .1 290s5.5-23.7 16.1-29.8l448-256c10.7-6.1 23.9-5.5 34 1.4z"})]}),Sv=()=>e.jsx(pi,{children:e.jsx(at,{title:u("No notifications found"),subtitle:u("To add a notification, use the sidebar on the left"),icon:e.jsx(kv,{})})});l.div`
  display: flex;
  gap: ${m.md};
`;const Lv=()=>e.jsx(pi,{children:e.jsxs(zn,{children:[e.jsx(k,{width:120,height:20}),e.jsx("br",{}),e.jsx(k,{width:100,height:10}),e.jsx(k,{width:50,height:20}),e.jsx("br",{}),e.jsx(k,{width:200,height:10}),e.jsx(k,{width:500,height:10}),e.jsx(k,{height:30}),e.jsx("br",{}),e.jsx(k,{width:150,height:10}),e.jsx(k,{width:300,height:10}),e.jsx(k,{height:30})]})}),Fv=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),Ev=({hovering:t})=>Y({opacity:1,background:t?h.error:"transparent",color:t?"#fff":h.gray300,scale:t?1.2:1,config:n=>{switch(n){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Tv=l(_.button)`
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  padding: 3px;

  svg {
    width: 20px;
    height: 20px;

    color: currentColor;
  }
`,Nv=({notification:t})=>{const n=te(),s=H(),[i,o]=g.useState(!1),r=Ev({hovering:i});return e.jsx(Tv,{type:"button",style:r,onMouseEnter:()=>o(!0),onMouseLeave:()=>o(!1),onClick:()=>{s(pv(t)),n("..")},children:e.jsx(Fv,{})})},zv=()=>{const{formId:t,uid:n}=V(),s=st(""),{data:i}=Vc(),{data:o,isFetching:r}=Yo(t?Number(t):void 0),a=P(Mn.one(n));if(!o&&r)return e.jsx(Lv,{});if(!a)return e.jsx(Sv,{});const c=i?.find(d=>d.className===a.className)?.properties||[];return e.jsxs(pi,{children:[e.jsx(q,{id:"notification",label:a.name,url:s.pathname}),e.jsx(Nv,{notification:a}),e.jsx(yp,{children:c.map(d=>e.jsx(Cv,{notification:a,property:d},d.handle))})]})},Pr={one:(t,n)=>s=>s.rules.buttons?.items?.find(i=>i.page===t&&i.button===n),hasRule:(t,n)=>Z(s=>s.rules.buttons.items,s=>!!s.find(i=>i.page===t&&i.button===n)),hasFieldInRule:t=>Z(n=>n.rules.buttons.items,n=>!!n.find(s=>s.conditions.some(i=>i.field===t)))},Dr=({value:t,onChange:n})=>e.jsx("div",{className:"select",children:e.jsxs("select",{value:t,onChange:s=>n?.(s.target.value),children:[e.jsx("option",{value:xn.Show,children:u("show")}),e.jsx("option",{value:xn.Hide,children:u("hide")})]})}),tt=l.div`
  position: relative;

  flex: 1;

  background: ${h.white};
  padding: ${m.xl};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Mv=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),Iv=({hovering:t})=>Y({opacity:1,background:t?h.error:"transparent",color:t?"#fff":h.gray300,scale:t?1.2:1,config:n=>{switch(n){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Av=l(_.button)`
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 2;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 50%;
  padding: 3px;

  svg {
    width: 20px;
    height: 20px;

    color: currentColor;
  }
`,xi=({onClick:t})=>{const[n,s]=g.useState(!1),i=Iv({hovering:n});return e.jsx(Av,{type:"button",style:i,onMouseEnter:()=>s(!0),onMouseLeave:()=>s(!1),onClick:t,children:e.jsx(Mv,{})})},mi=({label:t})=>{const n=P(Ae.all),s=n.length>0?n[0].uid:"",i=n.length>1?n[1].uid:"",o={combinator:Be.Or,conditions:[{field:s,operator:se.Contains,value:"John Doe",uid:"test-1"},{field:i,operator:se.EndsWith,value:"@gmail.com",uid:"test-2"}],display:xn.Show};return e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(J,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(t)}})})}),e.jsxs(Rv,{children:[e.jsx(Dv,{dangerouslySetInnerHTML:{__html:O.sanitize(u('<a href="{link}" target="_blank">Upgrade to Freeform Pro</a> to create conditional rules.',{link:Craft.getCpUrl("plugin-store/freeform")}))}}),e.jsxs(Pv,{children:[e.jsxs(sn,{children:[e.jsx(Dr,{value:o.display}),u("this field when"),e.jsx(tn,{value:o.combinator}),u("of the following rules match:")]}),e.jsx(nn,{conditions:o.conditions,buttonLabel:"Upgrade to Freeform Pro to create conditional rules."})]})]})]})},Rv=l.div`
  position: relative;
`,Pv=l.div`
  user-select: none;
  pointer-events: none;
  filter: blur(1.3px);
`,Dv=l.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;

  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);

  padding: ${m.md} ${m.xl};

  border: 2px solid ${h.blue400};
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2);

  font-size: 14px;
  text-align: center;
  color: ${h.gray700};

  a {
    color: ${h.blue500};
    font-weight: bold;
    text-decoration: underline;
  }

  a:hover {
    color: ${h.blue600};
  }
`,Bv=()=>{const{formId:t,button:n,uid:s}=V(),{isFetching:i}=En(Number(t||0)),o=te(),r=H(),a=P(et.one(s)),c=P(Pr.one(s,n));if(!a)return null;const{buttons:d}=a;let p;switch(n){case"save":p=d.saveLabel;break;case"submit":p=d.submitLabel;break;case"back":p=d.backLabel;break;default:p=u("Button Group");break}return I.editions.is(oe.Pro)?c?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{r(ln.remove(c.uid)),o("..")}}),e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:i,children:p})}),!i&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{className:"short",children:[e.jsx(Dr,{value:c.display,onChange:f=>r(ln.modifyDisplay({ruleUid:c.uid,display:f}))}),u("this button when"),e.jsx(tn,{value:c.combinator,onChange:f=>r(ln.modifyCombinator({ruleUid:c.uid,combinator:f}))}),u("of the following rules match:")]}),e.jsx(nn,{conditions:c.conditions,onChange:f=>{r(ln.modifyConditions({ruleUid:c.uid,conditions:f}))}})]})]}):e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:i,children:p})}),!i&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>r(ln.add({pageUid:s,button:n})),children:u("Add rules")})]}):e.jsx(mi,{label:p})},Ov=()=>e.jsx(tt,{children:u("Please choose a field in the left panel")}),_v=()=>{const{formId:t,uid:n}=V(),{isFetching:s}=En(Number(t||0)),i=te(),o=H(),r=P(Ae.one(n)),a=P(un.one(n));if(!r)return null;const{label:c}=r.properties,d=I.editions.is(oe.Pro);return d?a?d?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{o(cn.remove(a.uid)),i("..")}}),e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{children:[e.jsx(Dr,{value:a.display,onChange:p=>o(cn.modifyDisplay({ruleUid:a.uid,display:p}))}),u("this field when"),e.jsx(tn,{value:a.combinator,onChange:p=>o(cn.modifyCombinator({ruleUid:a.uid,combinator:p}))}),u("of the following rules match:")]}),e.jsx(nn,{conditions:a.conditions,onChange:p=>{o(cn.modifyConditions({ruleUid:a.uid,conditions:p}))}})]})]}):null:e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsx("button",{type:"button",className:E("btn add icon dashed"),disabled:!d,onClick:()=>o(cn.add(n)),children:u("Add rules")})]}):e.jsx(mi,{label:c})},Br={one:t=>Z(n=>n.rules.pages.items,n=>n.find(s=>s.page===t)),hasRule:t=>Z(n=>n.rules.pages.items,n=>!!n.find(s=>s.page===t)),hasFieldInRule:t=>Z(n=>n.rules.pages.items,n=>!!n.find(s=>s.conditions.some(i=>i.field===t)))},Wv=()=>{const{formId:t,uid:n}=V(),{isFetching:s}=En(Number(t||0)),i=te(),o=H(),r=P(et.one(n)),a=P(Br.one(n));if(!r)return null;const{label:c}=r;return I.editions.is(oe.Pro)?a?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{o(On.remove(n)),i("..")}}),e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{className:"short",children:[u("Go to this page when"),e.jsx(tn,{value:a.combinator,onChange:p=>o(On.modifyCombinator({ruleUid:a.uid,combinator:p}))}),u("of the following rules match:")]}),e.jsx(nn,{conditions:a.conditions,onChange:p=>{o(On.modifyConditions({ruleUid:a.uid,conditions:p}))}})]})]}):e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>o(On.add(n)),children:u("Add rules")})]}):e.jsx(mi,{label:c})},Or={one:t=>t.rules.submitForm.item,hasRule:t=>!!t.rules.submitForm.item},Uv=()=>{const{formId:t}=V(),{isFetching:n}=En(Number(t||0)),s=te(),i=H(),o=P(Or.one);return I.editions.is(oe.Pro)?o?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{i(_n.remove()),s("..")}}),e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:n,children:u("Submit Form Early")})}),!n&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{children:[u("Submit this form when "),e.jsx(tn,{value:o.combinator,onChange:a=>i(_n.modifyCombinator(a))}),u("of the following rules match:")]}),e.jsx(nn,{conditions:o.conditions,onChange:a=>{i(_n.modifyConditions(a))}})]})]}):e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(J,{loadingText:u("Loading data"),loading:n,children:u("Submit Form Early")})}),!n&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>i(_n.add()),children:u("Add rules")})]}):e.jsx(mi,{label:u("Submit Form Early")})},Hv=l.div`
  display: flex;
  height: 100%;
`,wp=l.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  gap: ${m.xs};
`,qv=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xl};
`,Qv=l(wp)`
  > span {
    width: 100%;
  }
`,Kv=()=>{const t=P(bt.cartographed.fullLayoutList);return e.jsx(zn,{children:t.map((n,s)=>e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:14},children:e.jsx(k,{width:"100%",height:30})}),n.map((i,o)=>e.jsx(Qv,{style:{display:"flex"},children:i.map((r,a)=>e.jsx(k,{width:"100%",height:28},a))},o))]},s))})},$p=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${m.sm};

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`,Vv=l.label`
  flex: 1;
  display: block;

  padding: 1px 0;
  line-height: 12px;
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Cp=l.div`
  flex: 0 0 auto;

  width: 16px;
  height: 16px;
`,kp=l.div``,Gv=l(_.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${m.sm};

  flex: 1;

  overflow: hidden;
  padding: 5px 7px;

  width: 100%;
  height: 100%;

  background: ${h.gray100};
  border: 1px solid ${h.gray100};
  border-radius: ${S.md};

  transition: all 0.2s ease-out;

  &,
  * {
    cursor: pointer;
  }

  &.has-rule:not(.active) {
    border-color: ${h.teal550};
    background-color: ${h.teal050};
  }

  &.group {
    background-color: ${h.white};
    border-color: ${h.gray100};

    > ${$p} ${Cp} {
      display: none;
    }

    ${kp} {
      color: ${h.gray800};
    }
  }

  &:hover {
    background-color: ${h.gray200};
    border-color: ${h.gray200};
  }

  &.active {
    background-color: #5b6573;
    border-color: #5b6573;
    color: white;
  }

  &.is-in-condition {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;

      width: 0;
      border-left: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 10px solid ${h.gray200};
    }

    &-active:after {
      border-left-color: ${h.teal550};
    }
  }

  &.read-only {
    &,
    * {
      cursor: default;
    }

    &:hover {
      background-color: ${h.gray100};
      border-color: ${h.gray100};
    }
  }
`,Yv=({field:t})=>{const n=I.limitations.can("rules.tab.fields"),{uid:s,button:i}=V(),o=te(),r=Ht(),{setLastTab:a}=We("rules"),c=Me(t?.typeClass),d=s===t.uid,p=P(un.one(s)),x=P(Br.one(s)),f=P(Or.one),b=P(Pr.one(s,i)),j=P(un.hasRule(t.uid)),y=r.pathname.endsWith("/rules/submit"),w=P(un.isInCondition(t.uid)),v=p?.conditions.find($=>$.field===t.uid)||x?.conditions.find($=>$.field===t.uid)||y&&f?.conditions.find($=>$.field===t.uid)||i&&b?.conditions.find($=>$.field===t.uid);return t?.properties===void 0?null:e.jsxs(Gv,{onClick:$=>{if($.stopPropagation(),n){const C=s===t.uid?"":`field/${t.uid}`;a(C),o(C)}},className:E(c?.type==="group"&&"group",d&&"active",j&&"has-rule",w&&"is-in-condition",v&&"is-in-condition-active",!n&&"read-only",Pn.negative.includes(v?.operator)&&"not-equals"),children:[e.jsxs($p,{children:[e.jsx(Cp,{dangerouslySetInnerHTML:{__html:O.sanitize(c?.icon)}}),e.jsx(Vv,{dangerouslySetInnerHTML:{__html:O.sanitize(t.properties.label||c?.name)}})]}),c?.type==="group"&&e.jsx(kp,{children:e.jsx(Sp,{layoutUid:t.properties.layout})})]})},Jv=({row:t})=>{const n=P(Ae.inRow(t));return e.jsx(wp,{children:n.map(s=>e.jsx(Yv,{field:s},s.uid))})},Zv=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
`,Sp=({layoutUid:t})=>{const n=Pt(i=>bt.one(i,t)),s=Pt(i=>ns.inLayout(i,n?.uid));return!n||!s.length?null:e.jsx(Zv,{children:s.map(i=>e.jsx(Jv,{row:i},i.uid))})},Xv=l.div`
  display: flex;
  justify-content: space-between;

  margin-top: ${m.md};
`,e9=l.div`
  display: flex;
  gap: ${m.xs};
`,Lp=l.button`
  flex: 1 1;

  height: 22px;
  max-width: 60px;
  padding: 0 ${m.sm};

  border: 2px solid transparent;
  border-radius: ${S.lg};
  background-color: rgba(96, 125, 159, 0.25);

  font-size: 12px;
  line-height: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  transition: background-color 0.2s ease-out;

  &.active {
    background-color: ${h.gray600};
    color: white;
  }

  &:hover:not(.active) {
    background-color: rgba(96, 125, 159, 0.3);
  }

  &.submit {
    background-color: ${h.gray600};
    color: ${h.white};

    &.active {
      background-color: ${h.gray900};
    }

    &:hover:not(.active) {
      background-color: ${h.gray900};
    }
  }

  &.has-rule {
    border-color: ${h.teal550};
  }
`,t9=({page:t,button:{handle:n,label:s}})=>{const i=I.limitations.can("rules.tab.buttons"),{uid:o,button:r}=V(),a=te(),{setLastTab:c}=We("rules"),d=o===t.uid&&n===r,p=P(Pr.hasRule(t.uid,n));return i?e.jsx(Lp,{type:"button",className:E(n,d&&"active",p&&"has-rule"),onClick:()=>{const x=d?"":`page/${t.uid}/buttons/${n}`;c(x),a(x)},children:u(s)}):null},n9=({page:t})=>{const n=Zu(t);return e.jsx(Xv,{children:n.map((s,i)=>e.jsx(e9,{className:"page-buttons",children:s.map((o,r)=>e.jsx(t9,{button:o,page:t},r))},i))})},s9=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M64 496c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48H204.1c1.3 0 2.6 .1 3.9 .2V136c0 22.1 17.9 40 40 40H367.8c.2 1.3 .2 2.6 .2 3.9V448c0 26.5-21.5 48-48 48H64zM358.6 157.3c.9 .9 1.7 1.8 2.4 2.7H248c-13.3 0-24-10.7-24-24V22.9c1 .8 1.9 1.6 2.7 2.4L358.6 157.3zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V179.9c0-12.7-5.1-24.9-14.1-33.9L238.1 14.1c-9-9-21.2-14.1-33.9-14.1H64zm40 256c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104z"})}),i9=l.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`,o9=l.button`
  position: relative;
  bottom: -1px;

  display: inline-flex;
  justify-content: start;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${m.sm};

  max-width: 150px;
  padding: ${m.xs} ${m.sm};

  background-color: ${h.white};

  border: 1px solid #cdd8e4;
  border-bottom: none;
  border-radius: ${S.md} ${S.md} 0 0;

  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${h.teal550};
    background-color: ${h.teal050};

    &.active {
      border-right-color: ${h.teal700};
    }
  }

  &.active {
    background-color: ${h.gray500};
    border-color: ${h.gray700};
    color: ${h.white};
  }

  &,
  &:active,
  &:focus {
    outline: none;
  }

  &.read-only {
    cursor: default !important;
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`,r9=l.div`
  padding: ${m.sm};
  border: 1px solid #cdd8e4;
  background-color: ${h.white};

  border-radius: 0 ${S.md} ${S.md} ${S.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${h.teal550};
    background-color: ${h.teal050};
  }

  &.active {
    background-color: ${h.gray500};
    border-color: ${h.gray700};

    ${Lp} {
      background-color: ${h.gray100};

      &.submit {
        background-color: ${h.red600};
      }
    }
  }
`,a9=l.div``,l9=l.label`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,c9=({page:t})=>{const n=I.limitations.can("rules.tab.pages"),{uid:s,button:i}=V(),o=te(),{setLastTab:r}=We("rules"),a=P(Br.hasRule(t.uid)),{label:c,uid:d}=t,p=s===d&&!i;return e.jsxs(i9,{children:[e.jsxs(o9,{onClick:()=>{if(n){const x=p?"":`page/${d}`;r(x),o(x)}},className:E(p&&"active",a&&"has-rule",!n&&"read-only"),children:[e.jsx(a9,{children:e.jsx(s9,{})}),e.jsx(l9,{children:c})]}),e.jsxs(r9,{className:E(p&&"active",a&&"has-rule"),children:[e.jsx(Sp,{layoutUid:t.layoutUid}),e.jsx(n9,{page:t})]})]})},d9=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})}),u9=l.div`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${m.xs};

  padding: ${m.xs} ${m.sm};
  border: 1px solid #cdd8e4;
  background-color: ${h.white};

  border-radius: ${S.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${h.teal550};
    background-color: ${h.teal050};
  }

  &.active {
    background-color: ${h.gray500};
    border-color: ${h.gray700};

    color: white;
    fill: currentColor;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,p9=l.label`
  cursor: pointer;

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,h9=()=>{const t=I.limitations.can("rules.tab.submit"),n=te(),s=Ht(),{setLastTab:i}=We("rules"),o=P(Or.hasRule),r=s.pathname.endsWith("/rules/submit");return t?e.jsxs(u9,{onClick:()=>{i("submit"),n("submit")},className:E(r&&"active",o&&"has-rule"),children:[e.jsx("div",{children:e.jsx(d9,{})}),e.jsx(p9,{children:u("Submit Form Early")})]}):null},x9=()=>{const{formId:t}=V(),{isFetching:n}=En(Number(t||0)),s=P(et.all),{lastTab:i}=We("rules"),o=te();return g.useEffect(()=>{i&&o(i)},[i,o]),e.jsx(De,{children:e.jsxs(qv,{children:[n&&e.jsx(Kv,{}),!n&&s.map(r=>e.jsx(c9,{page:r},r.uid)),s.length>1&&e.jsx(h9,{})]})})},m9=()=>{const t=st("");return e.jsxs(Hv,{children:[e.jsx(q,{id:"rules",label:u("Rules"),url:t.pathname}),e.jsx(x9,{}),e.jsx(jt,{})]})},_r=t=>{const n=g.useCallback(s=>{if(s.key==="s"){const i=window.navigator.platform.match(/Mac/);return i&&!s.metaKey||!i&&!s.ctrlKey?void 0:(s.preventDefault(),t(),!1)}},[t]);ft({callback:n,type:"keydown"},[t])},g9=({closeModal:t,data:n})=>{const s=()=>{t(),window.location.href=n?.url};return e.jsx(wt,{closeModal:t,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Leave the form builder?")})}),e.jsx("div",{style:{padding:20},children:u("You are about to leave the form builder. Any unsaved changes may be lost if you continue.")}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",onClick:s,children:u("Continue")})]})]})})},f9=()=>{const t=I.limitations,n=H(),s=P(Pe.current),i=P(Ot.state),{openModal:o}=qe(),r=P(Pe.errors),a=P(Ae.hasErrors),c=P(Mn.errors.any),d=P(as.errors.any),{getTranslation:p}=Ce({...s.settings.general,namespaceType:"settings",namespace:"general"}),x=p("name",s.settings.general?.name),{data:f}=Gt(),b=()=>{n(Tc())};_r(b);const j=s.settings?.general?.storeData!==!1,y=!!s.canManageSubmissions,w=!!s.id&&j&&y,v=s.submissionCount??0,C=new URLSearchParams(window.location.search).get("site"),F=`submissions?${C?`site=${C}&`:""}source=form:${s.id}`,N=M=>{M.preventDefault(),s?.id&&o(g9,{url:me(F)})};return e.jsxs(Kd,{children:[e.jsx(q,{id:"form-name",label:s.name||"Create a new Form",url:`/forms/${s.id}`}),e.jsx(Vd,{children:e.jsx(Gd,{children:x||u("Create a new Form")})}),e.jsxs(fs,{className:"main-tabs",children:[e.jsx(he,{to:`/forms/${s.id}`,end:!0,className:E(a&&"errors"),children:e.jsx("span",{children:u("Layout")})}),t.can("notifications.tab")&&e.jsx(he,{to:`/forms/${s.id}/notifications`,className:E(c&&"errors"),children:e.jsx("span",{children:u("Notifications")})}),t.can("rules.tab")&&e.jsx(he,{to:`/forms/${s.id}/rules`,children:e.jsx("span",{children:u("Rules")})}),I.limitations.can("integrations.tab")&&e.jsx(he,{to:`/forms/${s.id}/integrations`,className:E(d&&"errors"),children:e.jsx("span",{children:u("Integrations")})}),I.editions.is(oe.Pro)&&s.formMonitor.enabled&&e.jsx(he,{to:`/forms/${s.id}/form-monitor`,children:e.jsxs("span",{children:[u("Monitoring"),e.jsx(Uf,{children:"BETA"})]})}),f&&I.limitations.can("settings.tab")&&e.jsx(he,{to:`/forms/${s.id}/settings`,className:E((fn(r?.general)||fn(r?.behavior))&&"errors"),children:e.jsx("span",{children:u("Settings")})})]}),w&&e.jsxs(Wf,{href:me(F),onClick:N,title:u("View submissions"),className:"go",children:[v," ",u("submissions")]}),e.jsx(Yd,{children:e.jsx(_f,{type:"button",onClick:b,disabled:i===It.Processing,className:E("btn","submit","save-button"),children:e.jsx(J,{loadingText:u("Saving..."),loading:i===It.Processing,spinner:!0,children:u("Save")})})})]})},b9=()=>e.jsxs(Id,{children:[e.jsx(f9,{}),e.jsx(Ad,{children:e.jsxs(mc,{children:[e.jsx(U,{index:!0,element:e.jsx(lv,{})}),e.jsxs(U,{path:"notifications",element:e.jsx($v,{}),children:[e.jsx(U,{path:"manager",element:e.jsx(cv,{})}),e.jsx(U,{path:":uid?",element:e.jsx(zv,{})})]}),e.jsx(U,{path:"integrations",element:e.jsx(hj,{}),children:e.jsx(U,{path:":id?/:handle?",element:e.jsx(bj,{})})}),e.jsxs(U,{path:"rules",element:e.jsx(m9,{}),children:[e.jsx(U,{index:!0,element:e.jsx(Ov,{})}),e.jsx(U,{path:"field/:uid",element:e.jsx(_v,{})}),e.jsx(U,{path:"page/:uid",element:e.jsx(Wv,{})}),e.jsx(U,{path:"page/:uid/buttons/:button",element:e.jsx(Bv,{})}),e.jsx(U,{path:"submit",element:e.jsx(Uv,{})})]}),e.jsxs(U,{path:"settings",element:e.jsx(wf,{}),children:[e.jsx(U,{index:!0,element:e.jsx(bl,{})}),e.jsx(U,{path:":sectionHandle",element:e.jsx(bl,{})})]}),e.jsx(U,{path:"form-monitor",element:e.jsx(pg,{}),children:e.jsx(U,{index:!0,element:e.jsx(df,{})})})]})})]}),j9=()=>e.jsx(Vu,{style:{flex:1},children:e.jsxs(Ku,{children:[e.jsx(qu,{children:e.jsx(k,{height:10,width:60,baseColor:h.gray300,highlightColor:h.gray200})}),e.jsx(Qu,{children:e.jsx(k,{height:8,width:300})}),e.jsx(k,{height:30,width:"100%"})]})}),Ns=()=>e.jsx(Yu,{children:e.jsx(Ju,{children:e.jsx(j9,{})})}),y9=()=>e.jsxs(Lr,{children:[e.jsx(Ns,{}),e.jsx(Ns,{}),e.jsx(Ns,{}),e.jsx(Ns,{})]}),v9=()=>e.jsxs(Xu,{children:[e.jsx(So,{}),e.jsx(So,{children:e.jsx(ep,{className:"btn btn-submit",children:e.jsx(k,{width:50,baseColor:h.gray400})})})]}),w9=()=>e.jsxs(tp,{children:[e.jsx(y9,{}),e.jsx(v9,{})]}),$9=()=>e.jsx(Qt,{children:e.jsx(np,{children:e.jsxs(sp,{children:[e.jsx(Lo,{children:e.jsx(Fo,{className:"active",children:e.jsx("span",{children:e.jsx(k,{width:42})})})}),e.jsx(Lo,{children:e.jsx(Fo,{children:e.jsx("span",{children:e.jsx(k,{width:42})})})})]})})}),C9=()=>e.jsxs(Wu,{children:[e.jsx($9,{}),e.jsx(w9,{})]}),k9=()=>e.jsx(xp,{children:e.jsxs(mp,{children:[e.jsx(fp,{children:e.jsx(hp,{})}),e.jsx(gp,{disabled:!0,className:"fullwidth text",placeholder:u("Search")})]})}),S9=()=>e.jsxs(De,{children:[e.jsx(k9,{}),e.jsx(Nr,{words:[50,70],items:16})]}),L9=()=>e.jsxs(e.Fragment,{children:[e.jsx(S9,{}),e.jsx(C9,{})]}),F9=()=>e.jsx(Qt,{baseColor:h.gray300,highlightColor:h.gray200,height:10,children:e.jsxs(Kd,{children:[e.jsx(Vd,{children:e.jsx(Gd,{children:e.jsx(k,{width:"50%",height:20})})}),e.jsxs(fs,{children:[e.jsx("a",{className:"active",children:e.jsx("span",{children:e.jsx(k,{width:43})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:82})})}),I.editions.is(oe.Pro)&&e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:36})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:77})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:54})})})]}),e.jsx(Yd,{children:e.jsx(k,{})})]})}),E9=()=>e.jsxs(Id,{children:[e.jsx(F9,{}),e.jsx(Ad,{children:e.jsx(bp,{children:e.jsx(L9,{})})})]}),T9=()=>{const{formId:t}=V(),n=t?Number(t):void 0,s=H(),i=Wh(n),o=_h(n),r=vm(n);Gt(),En(n),Md(n),Yo(n),Go(n);const{data:a,isFetching:c,isError:d,error:p}=Dh(n);return g.useEffect(()=>{if(t===void 0||!a)return;const{translations:x,layout:{fields:f,pages:b,layouts:j,rows:y}}=a;s(gt.update(a)),s(be.set(f)),s(Cn.set(b)),s($n.set(j)),s(Ze.set(y)),s(to.init(x)),document.title=a.name,i(),o(),r(),b.length===0?s(ip()):s(ye.setPage(b.find(Boolean)?.uid))},[a,t,s,o,i,r]),c?e.jsx(E9,{}):d?e.jsxs("div",{children:["ERROR: ",p.message]}):e.jsx(b9,{})},N9=Qo`
  #freeform-client-app {
    height: calc(100vh - 100px);
  }
`,z9=()=>e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"form-editor",label:"Forms",url:"/forms"}),e.jsx(N9,{}),e.jsx(Lc,{children:e.jsx(T9,{})})]});function Fl(t,n,s,i){const o=g.useRef(n);Cc(()=>{o.current=n},[n]),g.useEffect(()=>{const r=window;if(!r?.addEventListener)return;const a=c=>{o.current(c)};return r.addEventListener(t,a,i),()=>{r.removeEventListener(t,a,i)}},[t,s,i])}const qi=typeof window>"u";function Fp(t,n,s={}){const{deserializer:i,initializeWithValue:o=!0,serializer:r}=s,a=g.useRef(n),c=g.useCallback(()=>{const v=a.current;return v instanceof Function?v():v},[]),d=g.useCallback(v=>r?r(v):JSON.stringify(v),[r]),p=g.useCallback(v=>{if(i)return i(v);if(v==="undefined")return;const $=c();let C;try{C=JSON.parse(v)}catch(F){return console.error("Error parsing JSON:",F),$}return C},[i,c]),x=g.useCallback(()=>{const v=c();if(qi)return v;try{const $=window.localStorage.getItem(t);return $?p($):v}catch($){return console.warn(`Error reading localStorage key “${t}”:`,$),v}},[p,c,t]),[f,b]=g.useState(()=>o?x():c()),j=eo(v=>{qi&&console.warn(`Tried setting localStorage key “${t}” even though environment is not a client`);try{const $=v instanceof Function?v(x()):v;window.localStorage.setItem(t,d($)),b($),window.dispatchEvent(new StorageEvent("local-storage",{key:t}))}catch($){console.warn(`Error setting localStorage key “${t}”:`,$)}}),y=eo(()=>{qi&&console.warn(`Tried removing localStorage key “${t}” even though environment is not a client`);const v=c();window.localStorage.removeItem(t),b(v),window.dispatchEvent(new StorageEvent("local-storage",{key:t}))});g.useEffect(()=>{b(v=>{const $=x();return Object.is(v,$)?v:$})},[x]);const w=g.useCallback(v=>{v.key&&v.key!==t||b(x())},[t,x]);return Fl("storage",w),Fl("local-storage",w),[f,j,y]}const M9=l.header`
  display: grid;
  grid-template-areas: 'title sites views button';
  grid-template-columns: min-content 1fr min-content auto;
  justify-content: space-between;
  align-items: center;
  gap: ${m.md};
`,I9=l.h1`
  grid-area: title;

  padding: ${m.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`,A9=l.div`
  grid-area: button;
  display: flex;
  align-items: center;
  gap: ${m.sm};
`,Ep=l.button`
  flex-shrink: 0;
`,Wr=l(Ep)`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: #fff;
  border: none;

  &:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%);
    color: #fff;
  }
`,Ur=l(rt)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%);
    color: #fff;
  }
`,R9=l.section`
  grid-area: views;
`,P9=()=>e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsx(k,{height:10,width:50}),e.jsx(k,{height:24})]}),e.jsxs("div",{children:[e.jsx(k,{height:10,width:150}),e.jsx(k,{height:24})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx(k,{height:24,width:38,borderRadius:12}),e.jsxs("div",{style:{flex:1},children:[e.jsx(k,{height:10,width:80}),e.jsx(k,{height:8,width:"60%"})]})]})]}),D9={all:["form","modal"]},B9=()=>B({queryKey:D9.all,queryFn:()=>T.get("/api/forms/modal").then(t=>t.data),staleTime:1/0}),Hr=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: ${m.md} ${m.xl};
`,O9=({closeModal:t})=>{const{current:n}=Fe(),[s,i]=g.useState(!1),[o,r]=g.useState({}),[a,c]=g.useState({sites:n?[n.id]:null}),[d,p]=g.useState(),{data:x,isFetching:f}=B9();g.useEffect(()=>{if(x){const y=x?.reduce((w,v)=>({...w,[v.handle]:v.value}),{});n&&(y.sites=[n.id]),c(y),r(y)}},[x,n]),g.useEffect(()=>{c(y=>({...y,sites:n?[n.id]:null}))},[n]);const b=te();ft({callback:y=>{if(y.key==="Enter"){j();return}}},[a]);const j=async()=>{i(!0);try{Lu(a.name,{camelize:!0,transliterate:!0,target:""},void 0,(w,v)=>{a.handle=v}),a.handle=Vs(a.handle);const{data:y}=await T.post("/api/forms/modal",a);c({...o}),p(void 0),b(`/forms/${y.id}`),t()}catch(y){p(y.errors?.form)}finally{i(!1)}};return e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Create a new Form")})}),e.jsxs(Hr,{children:[!x&&f&&e.jsx(P9,{}),x?.map((y,w)=>e.jsx(je,{updateValue:v=>{c({...a,[y.handle]:v})},autoFocus:w===0,value:a?.[y.handle],property:y,errors:d?.[y.handle]},y.handle))]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:j,children:e.jsx(J,{loadingText:u("Saving..."),loading:s,spinner:!0,children:u("Save")})})]})]})},qr=()=>{const{openModal:t}=qe();return()=>{t(O9)}},gi=()=>B({queryKey:[...ze.navigation,"ai-list"],queryFn:async()=>{const{data:t}=await T.get("/api/integrations/navigation"),n=t?.find(i=>i.handle==="ai");return n?n.entries.flatMap(i=>i.instances).map(i=>({id:Number(i.id),uid:i.uid,name:i.name,handle:i.handle})):[]},gcTime:1/0,staleTime:6e4}),_9=({closeModal:t})=>{const n=te(),[s,i]=g.useState(""),[o,r]=g.useState(""),[a,c]=g.useState(""),[d,p]=g.useState(!1),[x,f]=g.useState(null),{data:b=[],isLoading:j}=gi();g.useEffect(()=>{b.length>0&&!s&&i(b[0].uid)},[b,s]);const y=g.useMemo(()=>b.map(C=>({value:C.uid,label:C.name})),[b]),w=g.useMemo(()=>({type:K.Select,handle:"integrationUid",label:u("AI Integration"),instructions:u("Choose which AI integration to use. Model and API key are already configured in the integration."),required:!0,options:y,emptyOption:u("Select an AI integration...")}),[y]),v=`${u("Form name (optional)")}`;ft({callback:C=>{if(C.key!=="Enter")return;const F=document.activeElement;if(F?.id==="prompt"){C.preventDefault(),document.getElementById("name")?.focus({preventScroll:!0});return}F?.tagName!=="TEXTAREA"&&$()}},[s,o,a,d,j]);const $=async()=>{const C=o.trim();if(!C){f(u("Please describe the form you want to create."));return}if(!s){f(u("Please select an AI integration."));return}f(null),p(!0);try{const{data:F}=await T.post("/api/forms/generate-from-ai",{prompt:C,name:a.trim()||void 0,integrationUid:s});n(`/forms/${F.id}`),t()}catch(F){const N=T.isAxiosError(F)&&typeof F.response?.data?.message=="string"?F.response.data.message:null;f(N??u("Form generation failed. Please try again or rephrase."))}finally{p(!1)}};return e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Create a form using AI")})}),e.jsxs(Hr,{children:[e.jsx(je,{property:w,value:s,updateValue:C=>i(String(C??"")),autoFocus:!0}),e.jsx(je,{property:{type:K.Textarea,handle:"prompt",label:u("Describe your form"),instructions:u("Describe the fields and purpose of the form."),required:!0,rows:4,placeholder:u("e.g. Contact form with name, email, phone, and a message box")},value:o,updateValue:C=>r(String(C??""))}),e.jsx(je,{property:{type:K.String,handle:"name",label:v,placeholder:u("e.g. Contact Form")},value:a,updateValue:C=>c(String(C??""))}),x&&e.jsx(li,{children:x})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:$,disabled:d||!o.trim()||!s||j,children:e.jsx(J,{loadingText:u("Generating..."),loading:d,spinner:!0,children:u("Generate form")})})]})]})},Qr=()=>{const{openModal:t}=qe();return()=>{t(_9)}},ut={base:["groups"],all:t=>[...ut.base,t]},Tp=()=>{const{current:t,getCurrentHandleWithFallback:n}=Fe();return B({queryKey:ut.all(n()),queryFn:()=>T.get("/api/forms/groups",{params:{siteHandle:t?.handle,siteId:t?.id}}).then(s=>s.data)})},W9=l.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  background: var(--gray-050);
  height: 600px;
`,U9=l.div`
  position: relative;
  background-color: ${h.white};
  padding: ${m.md};
  border-radius: ${S.md};
  border: 1px solid ${h.hairline};
  gap: ${m.md};
`,Np=l.div`
  padding: 25px ${m.lg};
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  overflow-x: hidden;
  overflow-y: auto;
  ${Q};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;Np.defaultProps={$empty:"Click the 'Add Group' button on the right to begin."};const H9=l.div`
  display: flex;
  padding-bottom: ${m.lg};
  gap: ${m.lg};
`,zp=l.div`
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 1fr;
  border-radius: ${S.md};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }

  svg {
    fill: ${({color:t})=>t||h.black};
  }

  .remove {
    svg {
      fill: ${h.black} !important;
    }
  }
`;zp.defaultProps={$empty:"Drag and drop any field here",color:h.black};const q9=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  position: absolute;
  top: 10px;
  right: 10px;
`,Q9=l.div`
  padding: 25px ${m.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Mp=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;Mp.defaultProps={$empty:"Drag and drop any field here"};const K9=l.div`
  padding-top: ${m.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`,V9=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  padding: ${m.xs} ${m.xs} ${m.xs} ${m.md};
`,G9=l.div`
  color: ${h.warning};
`,Y9=l.div`
  cursor: pointer;
  gap: 30px;
  width: 100%;
  overflow: hidden;
  background: ${h.white};
  border: 1px solid ${h.gray100};
  border-radius: 3px;
  font-size: 12px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
    border: 1px solid ${h.gray200};
    background-color: ${h.gray050};
  }
`,J9=l.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`,Z9=l.h2`
  flex: 1;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 0;
`,X9=l.div`
  color: ${h.gray500};
  margin-right: ${m.xs};
  position: absolute;
  right: 8px;
  top: 7px;
`,ew=l.div`
  margin-top: 0;
  background-color: ${({$color:t})=>t};
  opacity: 1;
  height: 2px;
  font-size: 1px;
  line-height: 1px;
  overflow: hidden;
`,El=({form:t})=>{const n=g.useRef(null),s=Ct(n),{id:i,name:o,settings:r}=t,{color:a}=r.general;return e.jsxs(Y9,{"data-id":i,ref:n,children:[e.jsx(J9,{children:e.jsx(Z9,{children:o})}),s&&e.jsx(X9,{className:"remove form-item-remove",children:e.jsx(dt,{})}),e.jsx(ew,{$color:a})]})},tw=(t,n,s)=>{const{getCurrentHandleWithFallback:i,current:o}=Fe(),r=g.useCallback(()=>{n(d=>({...d,formGroups:{...d.formGroups,site:d.formGroups?.site?d.formGroups.site:i(),groups:[...d.formGroups?.groups||[],{uid:G(),label:"",formIds:[]}]}}))},[n,i]),a=g.useCallback((d,p,x)=>{n(f=>({...f,formGroups:{...f.formGroups,groups:f.formGroups.groups.map(b=>b.uid===x?{...b,[d]:p}:b)}}))},[n]),c=g.useCallback(()=>{const p=Ne.get(s.current.groupWrapper).toArray().map(y=>{const w=t.formGroups?.groups.find(v=>v.uid===y);if(w){const v={...w};return delete v.forms,{...v,formIds:Ne.get(s.current[y]).toArray().map(Number)}}return null}).filter(Boolean),x=s.current?.unassigned,f=x?Ne.get(x):null,b=f?f.toArray().map(Number):[],j=[...p.flatMap(y=>y.formIds),...b];return{siteId:t.formGroups?.siteId||o?.id,site:t.formGroups?.site||i(),groups:p,orderedFormIds:j}},[s,t,i,o?.id]);return{addGroup:r,updateGroupInfo:a,syncFormGroupsRefs:c}},nw=(t={})=>{const n=X(),{getCurrentHandleWithFallback:s}=Fe(),i=t?.onSuccess;return t.onSuccess=(o,r,a,c)=>{i?.(o,r,a,c),n.invalidateQueries({queryKey:ut.all(s())})},le({...t,mutationFn:async o=>{const{orderedFormIds:r,...a}=o;await T.post("/api/forms/groups",a),r&&r.length>0&&await T.post("/api/forms/sort",{orderedFormIds:r})}})},sw=(t,n)=>n.options.handle!==".handle",iw=t=>{const n=(i,o)=>{const r=t.current[i];r&&Ne.create(r,o)};Object.entries({unassigned:{group:{name:"shared",put:sw},animation:150,sort:!0},groupWrapper:{handle:".handle",filter:".group-remove",sort:!0,animation:150,onFilter:o=>{const r=Array.from(t.current[o.item.dataset.id].children);t.current.unassigned.append(...r),o.item.remove()}}}).forEach(([o,r])=>{n(o,r)})},ow=(t,n,s)=>{t&&(Ne.create(t,{animation:150,group:{name:`group-${n}`,put:(i,o)=>o.options.handle!==".handle"},sort:!0,filter:".form-item-remove",onFilter:i=>s.current.unassigned.appendChild(i.item)}),s.current[n]=t)},rw=({closeModal:t})=>{const[n,s]=g.useState({}),[i,o]=g.useState(!1),[r,a]=g.useState(),{data:c}=Tp(),d=g.useRef({}),{addGroup:p,updateGroupInfo:x,syncFormGroupsRefs:f}=tw(n,s,d);g.useEffect(()=>{c&&!i&&(s(c),o(!0))},[c,i]),g.useEffect(()=>{iw(d)},[]);const b=nw({onSuccess:()=>{t()},onError:y=>{a(y.errors)}}),j=b.isPending;return e.jsxs(ve,{style:{maxWidth:"60%"},children:[e.jsx(we,{children:e.jsx("h1",{children:u("Form Group Manager")})}),e.jsxs(W9,{children:[e.jsxs(Np,{ref:y=>{d.current.groupWrapper=y},$empty:u("Click the 'Add Group' button on the right to begin."),children:[r?.length&&e.jsx(G9,{children:u("Something went wrong!")}),n.formGroups?.groups?.map(y=>e.jsxs(U9,{"data-id":y.uid,children:[e.jsx(H9,{children:e.jsx(je,{value:y.label,property:{type:K.Label,handle:y.uid},updateValue:w=>x("label",w,y.uid)})}),e.jsx(zp,{$empty:u("Drag and drop any field here"),ref:w=>{ow(w,y.uid,d)},children:y.forms?.map(w=>e.jsx(El,{form:w},w.id))}),e.jsxs(q9,{children:[e.jsx("button",{type:"button",className:"group-remove",children:e.jsx(dt,{})}),e.jsx("button",{type:"button",className:"handle",children:e.jsx(Ir,{})})]})]},y.uid))]}),e.jsxs(Q9,{children:[e.jsx("button",{onClick:p,type:"button",className:"btn add icon dashed",children:u("Add Group")}),e.jsx(K9,{children:e.jsxs(V9,{className:"unassigned",children:[e.jsx("h3",{children:u("Unassigned")}),e.jsx(Mp,{$empty:u("Drag and drop any form here. Unassigned form will display at the bottom of the list of Groups."),ref:y=>{d.current.unassigned=y},children:n?.forms?.filter(y=>y.dateArchived===null).map(y=>e.jsx(El,{form:y},y.id))})]})})]})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(J,{loadingText:u("Saving..."),loading:j,onClick:()=>b.mutate(f()),spinner:!0,children:u("Save")})})]})]})},aw=()=>{const{openModal:t}=qe();return()=>{t(rw)}},Ip=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-13.3 0-24 10.7-24 24V264c0 13.3 10.7 24 24 24s24-10.7 24-24V152c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})}),lw=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M345 137l17-17L328 86.1l-17 17-119 119L73 103l-17-17L22.1 120l17 17 119 119L39 375l-17 17L56 425.9l17-17 119-119L311 409l17 17L361.9 392l-17-17-119-119L345 137z"})}),cw=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-8V248c0-13.3-10.7-24-24-24H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h24v64H216zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"})}),dw=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M231.9 44.4C215.7 16.9 186.1 0 154.2 0H152C103.4 0 64 39.4 64 88c0 14.4 3.5 28 9.6 40H48c-26.5 0-48 21.5-48 48v64c0 20.9 13.4 38.7 32 45.3V288 448c0 35.3 28.7 64 64 64H416c35.3 0 64-28.7 64-64V288v-2.7c18.6-6.6 32-24.4 32-45.3V176c0-26.5-21.5-48-48-48H438.4c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88h-2.2c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41zM464 176v64H432 288V176h72H464zm-240 0v64H80 48V176H152h72zm0 112V464H96c-8.8 0-16-7.2-16-16V288H224zm64 176V288H432V448c0 8.8-7.2 16-16 16H288zm72-336H288h-1.3l34.8-59.2C329.1 55.9 342.9 48 357.8 48H360c22.1 0 40 17.9 40 40s-17.9 40-40 40zm-136 0H152c-22.1 0-40-17.9-40-40s17.9-40 40-40h2.2c14.9 0 28.8 7.9 36.3 20.8L225.3 128H224z"})}),Tl=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M248.4 84.3c1.6-2.7 4.5-4.3 7.6-4.3s6 1.6 7.6 4.3L461.9 410c1.4 2.3 2.1 4.9 2.1 7.5c0 8-6.5 14.5-14.5 14.5H62.5c-8 0-14.5-6.5-14.5-14.5c0-2.7 .7-5.3 2.1-7.5L248.4 84.3zm-41-25L9.1 385c-6 9.8-9.1 21-9.1 32.5C0 452 28 480 62.5 480h387c34.5 0 62.5-28 62.5-62.5c0-11.5-3.2-22.7-9.1-32.5L304.6 59.3C294.3 42.4 275.9 32 256 32s-38.3 10.4-48.6 27.3zM288 368a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-8-184c0-13.3-10.7-24-24-24s-24 10.7-24 24v96c0 13.3 10.7 24 24 24s24-10.7 24-24V184z"})}),Ap={all:["notices"]},uw=()=>B({queryKey:Ap.all,queryFn:()=>T.get("/api/notices").then(t=>t.data),enabled:I.feed}),pw=()=>{const t=X();return le({mutationFn:n=>T.delete(`/api/notices/${n}`),onMutate:n=>{t.setQueryData(Ap.all,s=>({...s,notices:s.notices.filter(i=>i.id!==n)}))}})},hw=l.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-bottom: ${m.lg};
`,Nl=l.div`
  font-size: 22px;
`,zl=l.p`
  flex: 1;

  margin: 0;
  padding: 1px 0 0;
`,xw=l.button`
  align-self: center;
`,mw=[{type:"new",accent:"#038052",bg:"transparent"},{type:"info",accent:"#007bff",bg:"transparent"},{type:"warning",accent:"#e87b00",bg:"transparent"},{type:"critical",accent:"#cf1324",bg:"#fbe4e4"},{type:"error",accent:"#cf1324",bg:"transparent"},{type:"log-list",accent:"#cf1324",bg:"transparent"}];let Rp="";mw.forEach(({type:t,accent:n,bg:s})=>{Rp+=`
    &[data-type='${t}'] {
      fill: ${n};
      color: ${n};
      border-color: ${n};
      background-color: ${s};

      a {
        color: ${n};
        text-decoration: underline;
        font-weight: bold;
      }
    }
  `});const gw=ne`
  ${Rp}
`,Ml=l.li`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;

  padding: ${m.sm} ${m.md};

  border: 1px solid #ccc;
  border-radius: ${S.lg};

  ${gw};

  &[data-type='error'] {
    background-color: #ffe3e4;
  }
`,fw={info:e.jsx(cw,{}),warning:e.jsx(Tl,{}),critical:e.jsx(Tl,{}),error:e.jsx(Ip,{}),new:e.jsx(dw,{})},Pp=()=>{const{data:t,isFetching:n}=uw(),s=pw();return!I.feed||!t&&n||!t.notices.length&&!t.errors?null:e.jsxs(hw,{children:[t.notices.map(i=>e.jsxs(Ml,{"data-type":i.type,children:[e.jsx(Nl,{children:fw[i.type]}),e.jsx(zl,{children:i.message}),e.jsx(xw,{onClick:()=>s.mutate(i.id),children:e.jsx(lw,{})})]},i.id)),!!t.errors&&e.jsxs(Ml,{"data-type":"log-list",children:[e.jsx(Nl,{children:e.jsx(Ip,{})}),e.jsx(zl,{dangerouslySetInnerHTML:{__html:O.sanitize(u('There are currently <a href="{link}">{errors} logged errors</a> in the Freeform error log files.',{link:me("settings/error-log"),errors:t.errors}))}})]})]})},bw=({data:t,closeModal:n})=>{const[s,i]=g.useState(!1),[o,r]=g.useState(""),[a,c]=g.useState(!1),d=X(),{getCurrentHandleWithFallback:p}=Fe();ft({callback:b=>{if(b.key==="Enter"){f();return}}},[s]);const x=b=>{r(b.target.value)},f=async()=>{if(s){c(!0);try{await T.post("/api/forms/delete",{id:t?.form.id}),await d.invalidateQueries({queryKey:ut.all(p())}),await d.invalidateQueries({queryKey:fe.all(p())}),r(""),i(!1),n()}finally{c(!1)}}};return g.useEffect(()=>{i(o.toUpperCase()==="DELETE")},[o]),e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:t?.form.name})}),e.jsxs(Hr,{children:[e.jsx("div",{children:u("Are you sure you want to permanently delete this form? This action cannot be undone.")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To delete this form, please type <strong>DELETE</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:o,autoComplete:"off",onChange:x,className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:E("btn submit",!s&&"disabled"),onClick:f,children:e.jsx(J,{loadingText:u("Deleting..."),loading:a,spinner:!0,children:u("Delete")})})]})]})},Kr=t=>{const{openModal:n}=qe();return()=>{n(bw,t)}},Vr=()=>{const t=X(),{getCurrentHandleWithFallback:n}=Fe();return le({mutationFn:s=>T.post(`/api/forms/${s}/archive`,{site:n()}),onMutate:s=>s,onSuccess:()=>{t.invalidateQueries({queryKey:ut.all(n())}),t.invalidateQueries({queryKey:fe.all(n())})}})},Dp=()=>{const t=X(),{getCurrentHandleWithFallback:n}=Fe();return le({mutationFn:s=>T.post(`/api/forms/${s}/clone`),onMutate:s=>s,onSuccess:()=>{t.invalidateQueries({queryKey:ut.all(n())}),t.invalidateQueries({queryKey:fe.all(n())})}})},jw=l.li`
  line-height: 1.4;
  list-style-type: disc;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.restored {
    opacity: 0;
  }
`,Bp=l.span`
  color: ${h.blue600};
  font-weight: bold;
`,yw=l(Bp)`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`,vw=l.span`
  color: #868f96;
  margin-left: 5px;
`,zs=l.span`
  margin-left: 5px;
  color: ${h.gray200};

  &::before {
    content: '|';
    padding-right: 5px;
  }

  a,
  button {
    cursor: pointer;
    color: var(--link-color);

    &:hover {
      text-decoration: underline;
    }
  }
`,ww=({form:t})=>{const n=te(),{getCurrentHandleWithFallback:s}=Fe(),i=X(),{id:o,name:r,links:a,dateArchived:c}=t,d=Vr(),p=d.isPending&&d.context===o,x=d.isSuccess&&d.context===o,{canDelete:f}=I.metadata.freeform,b=Kr({form:t}),j=()=>{i.invalidateQueries({queryKey:fe.single(Number(o))}),n(`${o}`)},y=a.filter(({type:$})=>$==="title").length,w=t.links.filter(({type:$})=>$==="linkList"),v=$=>bc(Qn($),"yyyy-MM-dd");return e.jsxs(jw,{className:E(p&&"disabled",x&&"restored"),children:[y?e.jsx(yw,{onClick:j,children:r}):e.jsx(Bp,{children:r}),c&&e.jsxs(vw,{children:["(",u("archived")," ",v(c),")"]}),w.length>0&&w.filter(({count:$})=>$).map(($,C)=>$.internal?e.jsx(zs,{children:e.jsx(he,{to:$.url,children:$.label})},C):e.jsx(zs,{children:e.jsx("a",{href:$.url,children:$.label})},C)),e.jsx(zs,{children:e.jsx("button",{type:"button",onClick:()=>{d.mutate(o)},children:u("Restore this Form")})}),f&&e.jsx(zs,{children:e.jsx("button",{type:"button",onClick:async $=>{$.metaKey&&$.shiftKey?(await T.post("/api/forms/delete",{id:o}),i.invalidateQueries({queryKey:ut.all(s())}),i.invalidateQueries({queryKey:fe.all(s())})):b()},children:u("Delete this Form and its Submissions")})})]})},$w=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,Cw=l.button`
  grid-area: button;

  outline: none;
  box-shadow: none;

  color: var(--link-color);

  font-size: 14px;
  text-align: left;

  transition: all 0.2s ease-out;

  &:focus {
    outline: none;
    box-shadow: none;
  }
`,kw=l.ul`
  margin-left: 25px;
`,Op=({data:t})=>{const[n,s]=g.useState(!1);return t?.length?e.jsxs($w,{children:[e.jsx(Cw,{onClick:()=>s(!n),children:u(n?"Hide archived forms":"Show archived forms")}),n&&e.jsx(kw,{children:t.map(i=>e.jsx(ww,{form:i},i.id))})]}):null},Io=()=>{const t=g.useRef(null),[n,s]=g.useState(!1);return g.useEffect(()=>{const i=()=>{const o=t.current;o&&s(o.scrollWidth>o.clientWidth)};return window.addEventListener("resize",i),i(),()=>window.removeEventListener("resize",i)},[]),[t,n]},_p=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m2.583 5.039c-.101-.002-.174-.008-.24-.021-.488-.097-.869-.478-.966-.965-.022-.119-.022-.262-.022-.547 0-.286 0-.429.022-.548.097-.487.478-.868.966-.966.119-.023.263-.023.547-.023h9.22c.284 0 .428 0 .547.023.488.098.869.479.966.966.022.119.022.262.022.548 0 .285 0 .428-.022.547-.097.487-.478.868-.966.965-.066.013-.139.019-.24.021m-6.146 3.075h2.458m-6.146-3.073h9.834v5.041c0 1.031 0 1.548-.202 1.942-.176.348-.458.63-.805.807-.395.2-.911.2-1.944.2h-3.932c-1.033 0-1.549 0-1.944-.2-.347-.177-.629-.459-.805-.807-.202-.394-.202-.911-.202-1.942z",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]}),Wp=t=>e.jsx(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h15v15h-15z"}),e.jsx("path",{d:"m6.562 1.252c-.421.006-.675.03-.88.134-.234.12-.426.311-.546.547-.104.205-.128.458-.134.879m7.186-1.56c.421.006.675.03.88.134.234.12.426.311.546.547.104.205.129.458.134.879m0 5.626c-.005.421-.03.675-.134.88-.12.234-.312.426-.546.546-.205.104-.459.129-.88.134m1.562-4.998v1.25m-5-5h1.25m-6.75 12.5h4.75c.7 0 1.05 0 1.318-.136.234-.12.426-.312.546-.546.136-.268.136-.618.136-1.318v-4.75c0-.7 0-1.05-.136-1.318-.12-.234-.312-.426-.546-.546-.268-.136-.618-.136-1.318-.136h-4.75c-.7 0-1.05 0-1.317.136-.236.12-.427.312-.547.546-.136.268-.136.618-.136 1.318v4.75c0 .7 0 1.05.136 1.318.12.234.311.426.547.546.267.136.617.136 1.317.136z",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]})}),Gr=l.div`
  display: flex;
  justify-content: space-between;
  padding: ${m.xl} ${m.xl} 0;
`,Yr=l.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${m.md};
  width: 100%;
`,Jr=l.div`
  flex: 1;
  min-width: 0;
  max-width: 70%;
`,Zr=l.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 30%;
  text-align: right;
  margin-top: 6px;
`,Gs=l.h2`
  cursor: default;
  margin: 0 0 ${m.xs} 0;
  color: #3d464e;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: all 0.2s ease-out;
`,Ys=l(Gs)`
  cursor: pointer;
`,Ao=l.span`
  display: block;
  color: #868f96;
  font-size: 14px;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: ${m.sm};
  cursor: default;

  &:hover {
    color: #6f7a82;
  }
`,Up=l.div`
  position: absolute;
  right: ${m.sm};
  top: ${m.sm};
  z-index: 2;

  display: flex;
  justify-content: end;
  align-items: stretch;
  gap: ${m.sm};

  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.2s ease-out;
`,Nt=l.button`
  font-size: 14px;
  color: #868f96;

  > svg {
    fill: currentColor;
  }
`,fi=l.ul`
  margin: ${m.sm} 0 0;
  padding: 0;
`,bi=l.li`
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  overflow: hidden;

  background-color: #fcfdff;
  border: 1px solid #e7eef7;
  border-radius: var(--large-border-radius);

  opacity: 1;
  pointer-events: auto;

  transition:
    background-color 0.2s ease-out,
    border-color 0.2s ease-out;

  &.blurred {
    filter: blur(3px);
    opacity: 0.35;
    pointer-events: none;
    user-select: none;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.archived {
    opacity: 0;
  }

  &:not(.dragging):hover {
    background-color: #f3f7fd;
    border-color: #9eb0c5;

    ${Ys} {
      color: var(--link-color);
    }

    ${Up} {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,Hp=l.div``,Xr=l.div`
  margin-top: -3px;

  background-color: ${({$color:t})=>t};
  opacity: 0.3;

  height: 5px;

  font-size: 0px;
  line-height: 0px;

  overflow: hidden;
`,Sw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Lw=()=>e.jsxs(Zr,{children:[e.jsx(k,{height:8,width:60}),e.jsx(k,{height:8,width:40})]}),Qi=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:Sw(0,Math.random()>.9?8:4)}));return e.jsxs(bi,{children:[e.jsxs(Gr,{children:[e.jsx(Yr,{children:e.jsxs(Jr,{children:[e.jsx(k,{height:15,width:"90%"}),e.jsx(k,{height:8,width:"60%"}),e.jsx(k,{height:8,width:"30%"})]})}),e.jsxs(fi,{children:[e.jsx("li",{children:e.jsx(k,{height:8,width:90})}),e.jsx("li",{children:e.jsx(k,{height:8,width:50})})]})]}),e.jsx(nt,{width:"100%",height:40,children:e.jsxs(yt,{data:n,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:"url(#colorGradient)",isAnimationActive:!1})]})}),e.jsx(Xr,{$color:t})]})},Fw=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})}),Ew=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M248.4 84.3c1.6-2.7 4.5-4.3 7.6-4.3s6 1.6 7.6 4.3L461.9 410c1.4 2.3 2.1 4.9 2.1 7.5c0 8-6.5 14.5-14.5 14.5l-387 0c-8 0-14.5-6.5-14.5-14.5c0-2.7 .7-5.3 2.1-7.5L248.4 84.3zm-41-25L9.1 385c-6 9.8-9.1 21-9.1 32.5C0 452 28 480 62.5 480l387 0c34.5 0 62.5-28 62.5-62.5c0-11.5-3.2-22.7-9.1-32.5L304.6 59.3C294.3 42.4 275.9 32 256 32s-38.3 10.4-48.6 27.3zM288 368a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-8-184c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 96c0 13.3 10.7 24 24 24s24-10.7 24-24l0-96z"})}),Tw=l.span`
  display: inline-block;
  white-space: nowrap;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  color: #424d59;
`,Nw=l.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 3px;
  font-size: 11px;
  color: #424d59;
  margin-bottom: 7px;
`,zw=l.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({$align:t="left"})=>t==="right"?"flex-end":"flex-start"};
  text-align: ${({$align:t="left"})=>t};
`,Mw=l.div`
  width: ${({$width:t="100%"})=>t};
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    #78db89 0%,
    #78db89 var(--success),
    #ec6d6b var(--success),
    #ec6d6b var(--failed),
    #bcc8d9 var(--failed),
    #bcc8d9 var(--pending),
    ${h.gray300} var(--pending),
    ${h.gray300} 100%
  );
`,Ms=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({$size:t="sm"})=>t==="sm"?"20px":"24px"};
  height: ${({$size:t="sm"})=>t==="sm"?"20px":"24px"};
  color: ${({$status:t})=>{switch(t){case"success":return"#78db89";case"failed":return"#ec6d6b";case"pending":return"#bcc8d9";default:return"#bcc8d9"}}};

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`,Ro=l.div`
  color: ${h.red600};
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  margin-top: ${({$withMargin:t})=>t?"15px":"0px"};
`,Hn={align:"left",width:"70%",showLastTest:!1,size:"lg"},qp=(t,n=Hn.size)=>{if(!t?.lastTest)return e.jsx(Ms,{$status:"pending",$size:n,children:e.jsx(es,{})});const s={success:e.jsx(Ms,{$status:"success",$size:n,children:e.jsx(Fw,{})}),failed:e.jsx(Ms,{$status:"failed",$size:n,children:e.jsx(Ew,{})}),pending:e.jsx(Ms,{$status:"pending",$size:n,children:e.jsx(es,{})})};return s[t.lastTest.status]||s.pending},ea=({formMonitor:t,align:n=Hn.align,width:s=Hn.width,showLastTest:i=Hn.showLastTest,size:o=Hn.size})=>{if(!t?.enabled)return null;const r=!t||!t.percentage||t.total===0;if(t?.error)return e.jsx(Ro,{$withMargin:!0,children:t.error?.message});const c=r?0:t.percentage?.success||0,d=r?0:t.percentage?.failed||0,p=r?100:t.percentage?.pending||0,x={"--success":`${c}%`,"--failed":`${c+d}%`,"--pending":`${c+d+p}%`};return e.jsxs(zw,{$align:n,style:r?{marginTop:"10px"}:void 0,children:[i&&t.lastTest&&e.jsxs(Nw,{children:["Last Test ",qp(t,o)]}),e.jsx(Mw,{$width:s,style:x}),e.jsx(Tw,{children:r?u("Uptime: Pending"):`${u("Uptime")}: ${c}%`})]})},Iw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,an={position:"top",animation:"fade",delay:[100,0]},Gn=({form:t,isDraggingInProgress:n,isExpressEdition:s})=>{const i=I.editions.is(oe.Pro),o=Vr(),r=Dp(),a=te(),{getCurrentHandleWithFallback:c}=Fe(),d=X(),{canDelete:p}=I.metadata.freeform,[x,f]=Io(),[b,j]=Io(),y=Array.from({length:31},()=>({uv:Iw(0,Math.random()>.9?50:20)})),{id:w,name:v,description:$,dateArchived:C,settings:F,formMonitor:N}=t,{color:M}=F.general,z=o.isPending&&o.context===w,L=o.isSuccess&&o.context===w,D=r.isPending&&r.context===w||z,ce=Kr({form:t}),pe=ge=>{ge.metaKey||ge.ctrlKey||ge.button===1?window.open(me(`forms/${w}`),"_blank"):(d.invalidateQueries({queryKey:fe.single(Number(w))}),a(`${w}`))},St=t.links.filter(({type:ge})=>ge==="title").length,on=t.links.filter(({type:ge})=>ge==="linkList"),In=t.links.find(({type:ge})=>ge==="formMonitor"),{data:x1,isLoading:m1}=Rd(t.id,{enabled:N?.enabled===!0});return e.jsxs(bi,{"data-id":t.id,className:E(D&&"disabled",L&&"archived",n&&"dragging"),children:[e.jsxs(Up,{children:[!s&&!i&&e.jsx(xe,{title:u("Move this Form Card"),...an,children:e.jsx(Nt,{className:"handle",children:e.jsx(Ir,{})})}),!s&&e.jsx(xe,{title:u("Duplicate this Form"),...an,children:e.jsx(Nt,{onClick:()=>{r.mutate(w)},children:e.jsx(Wp,{})})}),!s&&!C&&e.jsx(xe,{title:u("Archive this Form"),...an,children:e.jsx(Nt,{onClick:()=>{o.mutate(w)},children:e.jsx(_p,{})})}),p&&e.jsx(xe,{title:u("Delete this Form"),...an,children:e.jsx(Nt,{onClick:async ge=>{ge.metaKey&&ge.shiftKey?(await T.post("/api/forms/delete",{id:w}),d.invalidateQueries({queryKey:ut.all(c())}),d.invalidateQueries({queryKey:fe.all(c())})):ce()},children:e.jsx(dt,{})})})]}),e.jsx(Gr,{children:e.jsxs(Yr,{children:[e.jsxs(Jr,{children:[f?e.jsx(xe,{title:v,...an,children:St?e.jsx(Ys,{ref:x,onClick:pe,onAuxClick:pe,children:v}):e.jsx(Gs,{ref:x,children:v})}):St?e.jsx(Ys,{ref:x,onClick:pe,onAuxClick:pe,children:v}):e.jsx(Gs,{ref:x,children:v}),!!$&&(j?e.jsx(xe,{title:$,...an,position:"bottom",distance:10,style:{display:"block"},children:e.jsx(Ao,{ref:b,children:$})}):e.jsx(Ao,{ref:b,children:$})),on.length>0&&e.jsx(fi,{children:on.map((ge,da)=>ge.internal?e.jsx(he,{to:ge.url,children:ge.label},da):e.jsx("li",{children:e.jsx("a",{href:ge.url,children:ge.label})},da))})]}),e.jsx(Zr,{children:N?.enabled&&In&&e.jsx(he,{to:In.url,children:m1?e.jsx(Lw,{}):e.jsx(ea,{formMonitor:{...x1,enabled:N?.enabled},align:"right",width:"100%",showLastTest:!0,size:"sm"})})})]})}),e.jsxs(Hp,{children:[e.jsx(nt,{width:"100%",height:40,children:e.jsxs(yt,{data:t.chartData||y,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${t.id}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:M,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:M,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"uv",stroke:M,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:`url(#color${t.id})`,isAnimationActive:!1})]})}),e.jsx(Xr,{$color:M})]})]})},Aw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Il=["Contact Us","Feedback","Survey","Registration","Application","Subscription"],Al=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:Aw(0,Math.random()>.9?8:4)})),s=Math.round(Math.random()*10)+1,i=Math.round(s*(Math.random()*.8+.6)),o=Math.round(s*(Math.random()*.1)),r=Il[Math.floor(Math.random()*Il.length)],a={success:i,pending:0,percentage:{success:Math.round(i/s*100),pending:0,failed:Math.round(o/s*100)},failed:o,total:s};return e.jsxs(bi,{className:"blurred",children:[e.jsx(Gr,{children:e.jsxs(Yr,{children:[e.jsxs(Jr,{children:[e.jsx(Ys,{children:r}),e.jsxs(fi,{children:[e.jsx("li",{children:e.jsxs("a",{href:"#",children:["3 ",u("Submissions")]})}),e.jsx("li",{children:e.jsxs("a",{href:"#",children:["0 ",u("Spam")]})})]})]}),e.jsx(Zr,{children:e.jsx(he,{to:"#",children:e.jsx(ea,{formMonitor:{...a,enabled:!0},align:"right",width:"100%",showLastTest:!0,size:"sm"})})})]})}),e.jsxs(Hp,{children:[e.jsx(nt,{width:"100%",height:40,children:e.jsxs(yt,{data:n,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:"url(#colorGradient)",isAnimationActive:!1})]})}),e.jsx(Xr,{$color:t})]})]})},Ki=[[{uv:0},{uv:2},{uv:0},{uv:6},{uv:0},{uv:0},{uv:1},{uv:0},{uv:0},{uv:4},{uv:0},{uv:3}],[{uv:9},{uv:6},{uv:3},{uv:4},{uv:0},{uv:6},{uv:1}],[{uv:0},{uv:25},{uv:0},{uv:32},{uv:0},{uv:0}]],Rw=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
`,Pw=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
`,_s=l.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${m.lg};
`,Rl=l.div`
  hr {
    margin: 10px -25px;
  }
`,Pl=l.h2`
  margin-bottom: 10px;
`,Qp=l.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .edit-groups {
    justify-content: flex-end;
    margin-left: auto;
  }
`,Dw=l.button`
  display: flex;
  align-items: center;
  gap: ${m.xs};

  &:hover {
    color: var(--link-color);

    svg {
      path:last-of-type {
        stroke: var(--link-color);
      }
    }
  }
`,Kp=l.div`
  width: 100%;
  max-width: 100%;
`;l.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${m.lg};
`;const Bw=l.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`,Ow=l(_s)`
  position: relative;
  margin-top: ${m.xl};

  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;

    z-index: 2;

    background: linear-gradient(
      to right,
      transparent 0%,
      transparent 40%,
      white 65%,
      white 100%
    );
  }

  &,
  * {
    pointer-events: none;
    user-select: none;
  }

  ${bi} {
    border-color: #fbfcfd;
    background: #fefeff;
  }

  ${Gs}, ${fi} a {
    color: #cfd1d2;
  }

  ${Ao} {
    color: #e2e4e5;
  }
`,_w="#e0e0e0",Vi=(t,n,s,i,o)=>({uid:"",type:"",name:t,handle:"",description:n,isNew:!0,chartData:s,links:[{count:i,label:u("{count} Submissions",{count:i}),handle:"submissions",type:"linkList",url:"",internal:!1},{count:o,label:u("{count} Spam",{count:o}),handle:"spam",type:"linkList",url:"",internal:!0}],counters:{submissions:i,spam:o},formMonitor:{enabled:!1},settings:{general:{namespaceType:"settings",namespace:"general",color:_w}},dateArchived:null}),Ww=()=>{const t=qr(),n=Qr(),{data:s}=gi(),{canCreate:i}=I.metadata.freeform,o=s&&s.length===0;return e.jsxs("div",{children:[i&&e.jsxs(e.Fragment,{children:[e.jsx("p",{children:u("You don't have any forms yet. Create your first form now...")}),e.jsxs(Bw,{children:[e.jsx("button",{type:"button",className:"btn submit add icon",onClick:t,children:u("Create a new Form")}),o?e.jsx(Ur,{to:"/integrations/ai/SolspaceAIV1",className:"btn add icon","data-icon":"sparkles",children:u("Enable AI")}):e.jsx(Wr,{type:"button",className:"btn add icon","data-icon":"sparkles",onClick:n,children:u("Create with AI")})]})]}),!i&&e.jsx("p",{children:u("You don't have any forms.")}),e.jsxs(Ow,{children:[e.jsx(Gn,{form:Vi("Contact Form","Main contact form.",Ki[0],14,5)}),e.jsx(Gn,{form:Vi("Customer Survey","Customer satisfaction survey.",Ki[1],72,18)}),e.jsx(Gn,{form:Vi("Newsletter","Newsletter signup form.",Ki[2],138,7)})]})]})},Uw=()=>{const{data:t,isFetching:n}=Tp(),s=aw(),i=t?.forms.length>0,o=t?.formGroups?.groups.some(j=>j.forms.length>0),r=!n&&!i&&!o,a=I.editions.is(oe.Express),c=I.editions.isAtLeast(oe.Pro),d=g.useRef(null),p=g.useRef(null),[x,f]=g.useState(!1),b=g.useCallback(()=>{const j=p.current.toArray();T.post("/api/forms/sort",{orderedFormIds:j}),f(!1)},[]);return g.useEffect(()=>{document.title=u("Forms")},[]),g.useEffect(()=>{d.current&&(p.current=new Ne(d.current,{animation:150,onEnd:b,handle:".handle",onStart:()=>{f(!0)}}))},[b]),e.jsx(Kp,{children:e.jsxs("div",{id:"content",className:"content-pane",children:[e.jsx(Pp,{}),e.jsxs(Rw,{children:[r&&e.jsx(Ww,{}),!r&&e.jsxs(Pw,{children:[c&&t?.formGroups&&t.formGroups.groups.map((j,y)=>j.forms.length?e.jsxs(Rl,{children:[y!==0&&e.jsx("hr",{}),e.jsx(Pl,{children:j.label}),e.jsx(_s,{children:j.forms.map(w=>e.jsx(Gn,{isExpressEdition:a,form:w},w.id))})]},j.uid):null),!r&&i&&e.jsxs(Rl,{children:[o&&e.jsx("hr",{}),o&&e.jsx(Pl,{children:u("Other")}),e.jsxs(_s,{ref:d,className:E(x&&"dragging"),children:[t?.forms?.map(j=>e.jsx(Gn,{isDraggingInProgress:x,isExpressEdition:a,form:j},j.id)),a&&e.jsxs(e.Fragment,{children:[e.jsx(Al,{}),e.jsx(Al,{})]})]})]}),!t?.forms&&n&&e.jsxs(_s,{children:[e.jsx(Qi,{}),e.jsx(Qi,{}),e.jsx(Qi,{})]})]}),a&&e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u('Need more forms? <a href="{link}" target="_blank">Upgrade to Lite or Pro</a>.',{link:Craft.getCpUrl("plugin-store/freeform")}))}}),e.jsxs(Qp,{children:[!a&&t?.archivedForms&&e.jsx(Op,{data:t.archivedForms}),!r&&c&&e.jsxs(Dw,{className:"edit-groups",onClick:s,children:[e.jsx(Er,{}),u("Manage Form Groups")]})]})]})]})})},Hw=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
`;l.header`
  display: grid;
  grid-template-areas: 'title sites button';
  grid-template-columns: min-content 1fr auto;
  justify-content: space-between;
  align-items: center;
  gap: ${m.md};
`;l.h1`
  grid-area: title;

  padding: ${m.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;const qw=l.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Is=({children:t,size:n})=>{const[s]=Io();return e.jsx(qw,{ref:s,style:{maxWidth:n},title:String(t),children:t})},Qw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Js=()=>e.jsx(e.Fragment,{children:e.jsx(k,{height:20,width:40,highlightColor:"#5372b64f"})}),As=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:Qw(0,Math.random()>.9?8:4)}));return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(k,{height:20,width:150})}),e.jsx("td",{children:e.jsx(k,{height:20,width:80})}),e.jsx("td",{children:e.jsx(k,{height:20,width:300})}),e.jsx("td",{children:e.jsx(nt,{width:200,height:20,children:e.jsxs(yt,{data:n,margin:{top:0,bottom:0,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:.7,fill:"url(#colorGradient)",isAnimationActive:!1})]})})}),e.jsx("td",{children:e.jsx(Js,{})}),e.jsx("td",{children:e.jsx(Js,{})}),e.jsx("td",{children:e.jsx(k,{height:20,width:61})})]})},Gi={position:"top",animation:"fade",delay:[100,0]},Kw=({form:t,hasFormMonitor:n})=>{const s=I.editions.isAtLeast(oe.Lite),i=Vr(),o=Dp(),r=X(),{getCurrentHandleWithFallback:a}=Fe(),c=Kr({form:t}),{canDelete:d}=I.metadata.freeform,{id:p,name:x,handle:f,description:b,settings:j,dateArchived:y,formMonitor:w}=t,v=j.general.color,$=t.links.some(({type:L})=>L==="title"),C=t.links.find(L=>L.handle==="submissions"),F=t.links.find(L=>L.handle==="spam"),N=t.links.find(({type:L})=>L==="formMonitor"),{data:M,isLoading:z}=Rd(t.id,{enabled:w?.enabled===!0});return e.jsxs("tr",{children:[e.jsxs("td",{children:[$&&e.jsx(rt,{to:`${p}`,children:e.jsx(Is,{size:250,children:x})}),!$&&e.jsx(Is,{size:250,children:x})]}),e.jsx("td",{children:e.jsx("code",{children:e.jsx(Is,{size:150,children:f})})}),e.jsx("td",{children:e.jsx(Is,{size:400,children:b})}),e.jsx("td",{children:e.jsx(nt,{width:200,height:20,children:e.jsxs(yt,{data:t.chartData,margin:{top:0,bottom:0,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${t.id}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:v,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:v,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"uv",stroke:v,strokeWidth:1,strokeOpacity:1,fillOpacity:.7,fill:`url(#color${t.id})`,isAnimationActive:!1})]})})}),n&&e.jsxs(e.Fragment,{children:[e.jsx("td",{children:w?.enabled&&N&&e.jsx(he,{to:N.url,children:z?e.jsx(Js,{}):M?.error?e.jsx(Ro,{children:M.error.message}):M?e.jsx(ea,{formMonitor:{...M,enabled:w?.enabled},align:"left",width:"100%",size:"sm"}):null})}),e.jsx("td",{children:w?.enabled&&N&&e.jsx(he,{to:N.url,children:z?e.jsx(Js,{}):M?.error?e.jsx(Ro,{children:M.error.message}):M?qp({...M,enabled:w?.enabled},"lg"):null})})]}),e.jsx("td",{children:!!C&&e.jsx("a",{href:C.url,children:C.count})}),e.jsx("td",{children:!!F&&e.jsx("a",{href:F.url,children:F.count})}),e.jsx("td",{children:e.jsxs(pn,{children:[s&&e.jsx(xe,{title:u("Duplicate this Form"),...Gi,children:e.jsx(Nt,{onClick:()=>o.mutate(p),children:e.jsx(Wp,{})})}),s&&!y&&e.jsx(xe,{title:u("Archive this Form"),...Gi,children:e.jsx(Nt,{onClick:()=>i.mutate(p),children:e.jsx(_p,{})})}),d&&e.jsx(xe,{title:u("Delete this Form"),...Gi,children:e.jsx(Nt,{onClick:async L=>{L.metaKey&&L.shiftKey?(await T.post("/api/forms/delete",{id:p}),r.invalidateQueries({queryKey:ut.all(a())}),r.invalidateQueries({queryKey:fe.all(a())})):c()},children:e.jsx(dt,{})})})]})})]})},Vw=l.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;

  @media (max-width: 1023px) {
    ${Q};
  }
`,Gw=l.table`
  border-collapse: collapse;
  width: 100%;

  /* Make the Description column shorter on medium & small screens */
  tbody td:nth-child(3) span {
    max-width: 400px !important;
  }

  @media (max-width: 1280px) {
    tbody td:nth-child(3) span {
      max-width: 320px !important;
    }
  }

  @media (max-width: 1023px) {
    tbody td:nth-child(3) span {
      max-width: 220px !important;
    }
  }

  @media (max-width: 699px) {
    tbody td:nth-child(3) span {
      max-width: 120px !important;
    }
  }
`,Yw=({forms:t,isFetching:n})=>{const s=qr(),i=Qr(),{data:o}=gi(),{canCreate:r}=I.metadata.freeform,c=I.permissions.integrations!=="none",d=c&&o&&o.length===0,p=t?.some(x=>x.formMonitor?.enabled);return e.jsx(Vw,{children:e.jsxs(Gw,{className:"table data",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Name")}),e.jsx("th",{children:u("Handle")}),e.jsx("th",{children:u("Description")}),e.jsx("th",{children:u("Chart")}),p&&e.jsx("th",{children:u("Monitoring")}),p&&e.jsx("th",{children:u("Last Test")}),e.jsx("th",{children:u("Submissions")}),e.jsx("th",{children:u("Spam")}),e.jsx("th",{children:u("Manage")})]})}),e.jsxs("tbody",{children:[n&&t===void 0&&e.jsxs(e.Fragment,{children:[e.jsx(As,{}),e.jsx(As,{}),e.jsx(As,{}),e.jsx(As,{})]}),!n&&!t?.length&&r&&e.jsx("tr",{children:e.jsxs("td",{colSpan:p?9:7,children:[e.jsx("p",{children:u("You don't have any forms yet. Create your first form now...")}),c&&(d?e.jsx(Ur,{to:"/integrations/ai/SolspaceAIV1",className:"btn add icon","data-icon":"sparkles",children:u("Enable AI")}):e.jsx(Wr,{type:"button",className:"btn add icon","data-icon":"sparkles",onClick:i,children:u("Create with AI")})),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:s,children:u("Create a new Form")})]})}),!n&&!t?.length&&!r&&e.jsx("tr",{children:e.jsx("td",{colSpan:p?9:7,children:e.jsx("p",{children:u("You don't have any forms yet.")})})}),t?.sort((x,f)=>x.name.localeCompare(f.name))?.map(x=>e.jsx(Kw,{form:x,hasFormMonitor:p},x.id))]})]})})},Jw=()=>{const{data:t,isFetching:n}=ei(),s=I.editions.isAtLeast(oe.Lite),i=t?.filter(({dateArchived:r})=>r===null),o=t?.filter(({dateArchived:r})=>r!==null);return g.useEffect(()=>{document.title=u("Forms")},[]),e.jsx(Kp,{children:e.jsxs("div",{id:"content",className:"content-pane",children:[e.jsx(Pp,{}),e.jsxs(Hw,{children:[e.jsx(Yw,{forms:i,isFetching:n}),s&&e.jsx(Qp,{children:e.jsx(Op,{data:o})})]})]})})},Zw=()=>{const t=X(),n=qr(),s=Qr(),{data:i}=gi(),[o,r]=Fp("forms-list-view",1),a=I.metadata.craft.is5,{canCreate:c}=I.metadata.freeform,p=I.permissions.integrations!=="none",x=p&&i&&i.length===0;return t.prefetchQuery({queryKey:Xn.all,queryFn:md}),t.prefetchQuery({queryKey:Xn.propertySections(),queryFn:gd}),e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"form-list",label:"Forms",url:"/forms"}),e.jsxs(M9,{children:[e.jsx(I9,{children:u("Forms")}),e.jsxs(R9,{className:"btngroup btngroup--exclusive",children:[e.jsx("button",{type:"button",className:E("btn",o===0&&"active"),"data-icon":"list","aria-label":"Display in a table",title:u("Display as list"),onClick:()=>r(0)}),e.jsx("button",{type:"button",className:E("btn",o===1&&"active"),"data-icon":E(a?"element-cards":"grid"),title:u("Display as cards"),onClick:()=>r(1)})]}),c&&e.jsxs(A9,{children:[p&&(x?e.jsx(Ur,{to:"/integrations/ai/SolspaceAIV1",className:"btn add icon","data-icon":"sparkles",children:u("Enable AI")}):e.jsx(Wr,{type:"button",className:"btn add icon","data-icon":"sparkles",onClick:s,children:u("Create with AI")})),e.jsx(Ep,{className:"btn submit add icon",onClick:n,children:u("Add new Form")})]})]}),o===0&&e.jsx(Jw,{}),o===1&&e.jsx(Uw,{})]})},Dl=({children:t,...n})=>e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",...n,children:t})}),Xw=["forms","express-forms","formie"],e$=()=>{const{pathname:t}=Ht(),{data:n,isFetching:s}=B({queryKey:["import-export","navigation"],queryFn:()=>T.get("/api/import-export/navigation").then(i=>i.data)});return s&&!n?e.jsx(Dl,{children:e.jsx("nav",{})}):e.jsx(Dl,{children:e.jsx("nav",{children:e.jsx("ul",{children:n.map((i,o)=>{if(i?.heading)return e.jsx("li",{className:"heading",children:e.jsx("span",{children:u(i.heading)})},o);const r=i.url.replace(/^freeform/,""),a=Xw.some(d=>r.includes(d)),c=u(i.title);return e.jsxs("li",{children:[a&&e.jsx(he,{to:r,className:E(r===t&&"sel"),children:c}),!a&&e.jsx("a",{href:me(r),children:c})]},o)})})})})},t$=l.div`
  display: flex;
  margin-bottom: 50px;
`,Bl=()=>{const{pathname:t}=Ht();Ln("export/profiles"),ei();let n;switch(t){case"/import/express-forms":n="Import from Express Forms";break;case"/import/formie/v3":n="Import from Formie (v3)";break;case"/import/forms":n="Import Freeform Data";break;case"/export/forms":n="Export Freeform Data";break}return e.jsxs("div",{children:[e.jsx(Sn,{children:u(n)}),e.jsxs(t$,{children:[e.jsx(e$,{}),e.jsx(jt,{})]})]})},He=({children:t,...n})=>e.jsx("div",{id:"content-container",children:e.jsx("div",{id:"content",className:"content-pane",...n,children:t})}),_t=({children:t,label:n,instructions:s,...i})=>e.jsxs("div",{...i,className:E("field",i.className),children:[n&&e.jsx("div",{className:"heading",children:e.jsx("label",{htmlFor:"",children:n})}),s&&e.jsx("div",{className:"instructions",children:s}),e.jsx("div",{className:"input",children:t})]}),ta=t=>{let n=!0;return Object.keys(t).forEach(s=>{const i=t[s];typeof i=="object"&&i!==null&&!Array.isArray(i)?Object.keys(i).forEach(o=>{const r=i[o];Array.isArray(r)&&r.length>0&&(n=!1)}):Array.isArray(i)?i.length>0&&(n=!1):typeof i=="boolean"&&i&&(n=!1)}),n},n$=(t,n)=>{let s=!0;return Object.keys(t).forEach(i=>{const o=t[i];typeof o=="object"&&o!==null&&!Array.isArray(o)?Object.keys(o).forEach(r=>{const a=o[r];Array.isArray(a)&&a.length!==n[i][r]?.length&&(s=!1)}):Array.isArray(o)?o.length!==n[i]?.length&&(s=!1):typeof o=="boolean"&&(o||(s=!1))}),s},Vp=()=>({forms:[],favorites:[],formGroups:[],limitedUsers:[],formSubmissions:[],templates:{pdf:[],wrapper:[],notification:[],formatting:[],success:[]},integrations:[],settings:!1,password:""}),s$=t=>({forms:t.forms.map(n=>n.uid),formGroups:t?.formGroups?.map(n=>n.uid)||[],favorites:t?.favorites?.map(n=>n.uid)||[],limitedUsers:t?.limitedUsers?.map(n=>n.uid)||[],templates:{pdf:t.templates.pdf.map(n=>n.uid),wrapper:t.templates.wrapper.map(n=>n.uid),notification:t.templates.notification.map(n=>n.uid),formatting:t.templates.formatting.map(n=>n.fileName),success:t.templates.success.map(n=>n.fileName)},integrations:t.integrations.map(n=>n.uid),formSubmissions:t.formSubmissions.map(n=>n.form.uid),settings:!0}),i$=t=>t.replace(/<\/?[^>]+(>|$)/g,""),na=22,o$=l.div`
  &.disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.3;

    transition: opacity 0.2s ease-out;
  }
`,r$=l.a`
  cursor: pointer;
  display: block;

  color: ${h.link} !important;
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }
`,a$=l.div`
  padding: 10px;

  background: #f4f7fd;
  border: 1px solid #e1e5ea;
  border-radius: 3px;
`,Wt=l.label`
  cursor: pointer;
  user-select: none;

  flex: 1;
  padding: 0 4px;

  text-align: left;
  font-weight: ${({$light:t})=>t?"normal":"bold"};

  small {
    padding-left: 20px;
    font-size: 10px;
    opacity: 0.4;
  }
`,yn=l.div`
  display: flex;
  justify-content: start;
  align-items: center;
`,Zs=l.div`
  position: relative;
  flex-basis: ${({$width:t=1})=>t*na}px;

  &:before {
    content: '';

    position: absolute;
    left: 2px;
    right: 2px;
    top: -1px;

    display: ${({$dash:t})=>t?"block":"none"};
    height: 2px;

    background: #b9c6d7;
  }
`,vn=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 0 0 ${na}px;
  height: 24px;
`,Le=l.i`
  flex: 0 0 ${na}px;
  font-size: 18px;

  text-align: center;

  width: 18px;
  height: 18px;

  svg {
    width: 100%;
    height: 100%;
  }
`,sa=()=>e.jsx(Le,{className:"fa-solid fa-folder"}),l$=()=>e.jsx(Le,{className:"fa-duotone fa-clipboard-list"}),c$=()=>e.jsx(Le,{className:"fa-light fa-folder-bookmark"}),d$=()=>e.jsx(Le,{className:"fa-light fa-file-heart"}),u$=()=>e.jsx(Le,{className:"fa-duotone fa-inbox-in"}),p$=()=>e.jsx(Le,{className:"fa-light fa-envelope"}),h$=()=>e.jsx(Le,{className:"fa-light fa-file-pdf"}),x$=()=>e.jsx(Le,{className:"fa-light fa-file-half-dashed"}),m$=()=>e.jsx(Le,{className:"fa-light fa-file-code"}),g$=()=>e.jsx(Le,{className:"fa-light fa-file-check"}),f$=()=>e.jsx(Le,{className:"fa-duotone fa-gear"}),Ut=l.li`
  &.selectable:not(.selected) {
    ${Wt}, ${Le}, ${Zs} {
      opacity: 0.4;
      transition: opacity 0.2s ease-out;
    }
  }
`,Je=t=>{const{label:n,icon:s,itemIcon:i,labelExtras:o}=t,{items:r,selection:a,onUpdate:c}=t,{labelKey:d,selectionKey:p,nested:x}=t,f=t.id||Q1(n);return!Array.isArray(r)||!r.length?null:e.jsxs(Ut,{children:[e.jsxs(yn,{children:[e.jsx(vn,{children:e.jsx(ct,{id:`${f}-all`,checked:a.length===r.length,onChange:()=>a.length===r.length?c([]):c(r.map(b=>b[p]))})}),x&&e.jsx(Zs,{$dash:!0}),e.jsx(sa,{}),e.jsx(Wt,{htmlFor:`${f}-all`,children:n})]}),e.jsx("ul",{children:r.map(b=>e.jsx(Ut,{className:E("selectable",a.includes(b[p])&&"selected"),children:e.jsxs(yn,{children:[e.jsx(vn,{children:e.jsx(ct,{id:`${f}-${b[p]}`,checked:a.includes(b[p]),onChange:()=>c(a.includes(b[p])?a.filter(j=>j!==b[p]):[...a,b[p]])})}),e.jsx(Zs,{$dash:!0,$width:x?2:void 0}),s,i?.(b),e.jsxs(Wt,{htmlFor:`${f}-${b[p]}`,children:[i$(b[d]),o?.(b)]})]})},b[p]))})]})},b$=({value:t,onUpdate:n})=>e.jsx(Ut,{children:e.jsx("ul",{children:e.jsx(Ut,{className:E("selectable",t&&"selected"),children:e.jsxs(yn,{children:[e.jsx(vn,{children:e.jsx(ct,{id:"export-settings",checked:t,onChange:()=>n(!t)})}),e.jsx(f$,{}),e.jsx(Wt,{htmlFor:"export-settings",children:u("Settings")})]})})})}),j$=({submissions:t,options:n,onUpdate:s})=>!Array.isArray(t)||!t.length?null:e.jsxs(Ut,{children:[e.jsxs(yn,{children:[e.jsx(vn,{children:e.jsx(ct,{id:"submissions-all",checked:n.length===t.length,onChange:()=>n.length===t.length?s([]):s(t.map(i=>i.form.uid))})}),e.jsx(sa,{}),e.jsx(Wt,{htmlFor:"submissions-all",children:u("Submissions")})]}),e.jsx("ul",{children:t.map(i=>e.jsx(Ut,{className:E("selectable",n.includes(i.form.uid)&&"selected"),children:e.jsxs(yn,{children:[e.jsx(vn,{children:e.jsx(ct,{id:`submissions-${i.form.uid}`,checked:n.includes(i.form.uid),onChange:()=>s(n.includes(i.form.uid)?n.filter(o=>o!==i.form.uid):[...n,i.form.uid])})}),e.jsx(Zs,{$dash:!0}),e.jsx(u$,{}),e.jsxs(Wt,{$light:!0,htmlFor:`submissions-${i.form.uid}`,children:[i.form.name," (",i.count,")"]})]})},i.form.uid))})]}),Ol=(t,n)=>n.pdf.length===t.pdf.length&&n.wrapper.length===t.wrapper.length&&n.notification.length===t.notification.length&&n.formatting.length===t.formatting.length&&n.success.length===t.success.length,y$=({templates:t,options:n,onUpdate:s})=>!t.pdf.length&&!t.wrapper.length&&!t.notification.length&&!t.formatting.length&&!t.success.length?null:e.jsxs(Ut,{children:[e.jsxs(yn,{children:[e.jsx(vn,{children:e.jsx(ct,{id:"templates-all",checked:Ol(t,n),onChange:()=>Ol(t,n)?s({pdf:[],wrapper:[],notification:[],formatting:[],success:[]}):s({pdf:t.pdf.map(i=>i.uid),wrapper:t.wrapper.map(i=>i.uid),notification:t.notification.map(i=>i.uid),formatting:t.formatting.map(i=>i.fileName),success:t.success.map(i=>i.fileName)})})}),e.jsx(sa,{}),e.jsx(Wt,{htmlFor:"templates-all",children:u("Templates")})]}),e.jsxs("ul",{children:[e.jsx(Je,{nested:!0,label:u("PDF"),labelKey:"name",icon:e.jsx(h$,{}),items:t.pdf,selection:n.pdf,selectionKey:"uid",onUpdate:i=>s({...n,pdf:i})}),e.jsx(Je,{nested:!0,label:u("Wrapper"),labelKey:"name",icon:e.jsx(x$,{}),items:t.wrapper,selection:n.wrapper,selectionKey:"uid",onUpdate:i=>s({...n,wrapper:i})}),e.jsx(Je,{nested:!0,label:u("Notification"),labelKey:"name",icon:e.jsx(p$,{}),items:t.notification,selection:n.notification,selectionKey:"uid",onUpdate:i=>s({...n,notification:i})}),e.jsx(Je,{nested:!0,label:u("Formatting"),labelKey:"name",icon:e.jsx(m$,{}),items:t.formatting,selection:n.formatting,selectionKey:"fileName",onUpdate:i=>s({...n,formatting:i})}),e.jsx(Je,{nested:!0,label:u("Success"),labelKey:"name",icon:e.jsx(g$,{}),items:t.success,selection:n.success,selectionKey:"fileName",onUpdate:i=>s({...n,success:i})})]})]}),ji=({data:t,options:n,disabled:s,onUpdate:i})=>{const o=n$(n,t),r=Vp(),a=s$(t);return e.jsx(o$,{className:E(s&&"disabled"),children:e.jsxs(a$,{children:[e.jsx(r$,{onClick:()=>{i(o?r:a)},children:u(o?"Deselect All":"Select All")}),e.jsxs("ul",{children:[e.jsx(Je,{label:u("Forms"),icon:e.jsx(l$,{}),labelKey:"name",selectionKey:"uid",items:t.forms,selection:n.forms,onUpdate:c=>i({...n,forms:c}),labelExtras:c=>c.pages.length>1&&e.jsxs("small",{children:["(",u("{count} pages",{count:c.pages.length}),")"]})}),e.jsx(Je,{label:u("Form Groups"),icon:e.jsx(c$,{}),labelKey:"label",selectionKey:"uid",items:t.formGroups,selection:n.formGroups,onUpdate:c=>i({...n,formGroups:c})}),e.jsx(Je,{label:u("Favorite Fields"),icon:e.jsx(d$,{}),labelKey:"label",selectionKey:"uid",items:t.favorites,selection:n.favorites,onUpdate:c=>i({...n,favorites:c})}),e.jsx(y$,{templates:t.templates,options:n.templates,onUpdate:c=>i({...n,templates:c}),formNames:mf(t.forms,"uid","name")}),e.jsx(Je,{label:u("Integrations"),labelKey:"name",selectionKey:"uid",items:t.integrations,selection:n.integrations,onUpdate:c=>i({...n,integrations:c}),itemIcon:c=>c.icon?e.jsx(Le,{dangerouslySetInnerHTML:{__html:O.sanitize(c.icon)}}):e.jsx(Le,{className:"fa-duotone fa-gear"})}),e.jsx(j$,{submissions:t.formSubmissions,options:n.formSubmissions,onUpdate:c=>i({...n,formSubmissions:c})}),e.jsx(Je,{label:u("Limited Users"),icon:e.jsx(Le,{className:"fa-regular fa-user-shield"}),labelKey:"name",selectionKey:"uid",items:t.limitedUsers,selection:n.limitedUsers,onUpdate:c=>i({...n,limitedUsers:c})}),t.settings&&e.jsx(b$,{value:n.settings,onUpdate:c=>i({...n,settings:c})})]})]})})},v$=t=>Y({opacity:t?1:0,scaleY:t?1:0,height:t?100:0,config:{tension:400}}),w$=t=>Y({opacity:t?1:0,scaleY:t?1:0,height:t?40:0,config:{tension:400}}),$$=l(_.div)`
  transform-origin: center top;
`,C$=l(_.div)`
  transform-origin: left center;
`,k$=l.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: ${m.sm};

  width: 100%;
  padding: ${m.sm} ${m.md};

  border: 1px solid #1fa07a;
  border-radius: 5px;

  color: #1fa07a;
  font-size: 16px;
  font-weight: bold;

  i {
    font-size: 18px;
  }
`,S$=l.div`
  margin-top: ${m.lg};
  label {
    font-size: 14px;
  }

  &.primary {
    label {
      font-weight: bold;
    }
  }
`,Yi="rgba(255,255,255,.15)",L$=Uo`
  from { background-position: 30px 0; }
  to { background-position: 0 0; }
`,F$=l.div`
  position: relative;

  width: 100%;
  height: 12px;

  padding-bottom: 0px;

  border: none;
  border-radius: 3px;
  background: #e5ecf6;

  font-size: 12px;
  line-height: 12px;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    display: block;
    width: ${({$max:t,$value:n})=>`${n/t*100}%`};

    border-radius: 3px;
    background-color: ${({$color:t})=>t};
    background-size: 30px 30px;
    background-image: linear-gradient(
      45deg,
      ${Yi} 25%,
      transparent 25%,
      transparent 50%,
      ${Yi} 50%,
      ${Yi} 75%,
      transparent 75%,
      transparent
    );

    transition: width 0.3s ease;
  }

  &.active {
    &:before {
      animation: ${L$} 2s linear infinite;
    }
  }
`,E$={primary:"#e12d39",secondary:"#B0BEC5"},_l=({show:t,active:n,variant:s="primary",value:i,max:o,width:r,children:a})=>t?e.jsxs(S$,{className:E(s),children:[a&&e.jsx("label",{children:a}),e.jsx(F$,{style:{width:r},$color:E$[s],$value:i,$max:o,className:E(n&&"active")})]}):null,yi=({label:t,finishLabel:n,event:s})=>{const{progress:{displayProgress:i,showDone:o,progress:r,total:a,info:c,errors:d}}=s,p=v$(i),x=w$(o);return e.jsxs("div",{children:[e.jsxs($$,{style:p,children:[e.jsx(_l,{width:"60%",show:!0,value:r[0],max:a[0],active:!0,children:t}),e.jsx(_l,{width:"60%",show:!0,variant:"secondary",value:r[1],max:a[1],active:!0,children:c})]}),d?.length>0&&e.jsx("ul",{className:"errors",children:d.map((f,b)=>e.jsx("li",{children:f},b))}),!d?.length&&e.jsx(C$,{style:x,children:e.jsxs(k$,{children:[e.jsx("i",{className:"fa-sharp fa-solid fa-check"}),e.jsx("span",{children:n})]})})]})},vi=()=>{const t=g.useRef(null),n=g.useRef([]),[s,i]=g.useState(),[o,r]=g.useState(!1),[a,c]=g.useState(!1),[d,p]=g.useState(!1),[x,f]=g.useState([0,0]),[b,j]=g.useState([0,0]),[y,w]=g.useState(),[v,$]=g.useState(),C=g.useCallback(z=>{i(z)},[]),F=g.useCallback(()=>{i(void 0),$(void 0),f([0,0]),j([0,0]),r(!0),w(void 0)},[]),N=g.useCallback((z,L)=>{n.current=[...n.current.filter(([A])=>A!==z),[z,L]]},[]),M=g.useCallback(z=>{z.onopen=()=>{c(!0)},z.onerror=()=>{console.error("An error occurred during import"),z.close(),r(!1),c(!1)},z.addEventListener("progress",L=>{const A=parseInt(L.data,10);f(D=>[D[0]+A,D[1]+A])}),z.addEventListener("total",L=>{j([parseInt(L.data,10),0]),$([])}),z.addEventListener("info",L=>{w(L.data)}),z.addEventListener("err",L=>{const A=L.data;$(D=>D===void 0?[A]:[...D,A])}),z.addEventListener("reset",L=>{j(A=>[A[0],parseInt(L.data,10)]),f(A=>[A[0],0])}),z.addEventListener("exit",()=>{z.close(),c(!1),r(!1),p(!0),setTimeout(()=>{p(!1)},5e3)}),n.current.forEach(([L,A])=>{z.addEventListener(L,A)})},[]);return g.useEffect(()=>{t.current&&t.current.close(),s&&(t.current=new EventSource(s),M(t.current))},[s,M]),{progress:{active:o,displayProgress:a,showDone:d,progress:x,total:b,info:y,errors:v},triggerProgress:C,clearProgress:F,attachListener:N}},T$=(t,n)=>{const s=window.URL.createObjectURL(new Blob([t])),i=document.createElement("a");i.href=s,i.setAttribute("download",n),document.body.appendChild(i),i.click(),i.parentNode.removeChild(i)},N$={data:["export","freeform","data"]},z$=()=>T.get("/export/forms/data").then(t=>t.data),M$=()=>B({queryKey:N$.data,queryFn:z$}),I$=t=>le({mutationFn:n=>T.post("/export/forms/init",n),...t}),A$=()=>{const t=vi(),{attachListener:n,triggerProgress:s,clearProgress:i,progress:{active:o}}=t,{data:r,isFetching:a}=M$(),{mutate:c,isPending:d}=I$({onSuccess:y=>{const w=y.data.token;s(me(`/api/export?server-token=${w}`))}}),[p]=g.useState(!1),[x,f]=g.useState(Vp());g.useEffect(()=>{n("file-token",async y=>{const w=y.data,v=me(`/api/export/download?server-token=${w}`),$=await T.get(v,{responseType:"blob"}),F=`freeform-export-${new Date().toISOString().replace(/[-:]/g,"").replace("T","-").slice(0,-5)}.zip`;T$($.data,F)})},[n]);const b=()=>{i(),c(x)},j=a||p||o||d;return a?e.jsx(He,{children:u("Loading...")}):e.jsxs(He,{children:[e.jsx(q,{id:"export",label:"Export",url:"export/forms"}),e.jsx(q,{id:"export-forms",label:"Freeform Data",url:"export/forms"}),r&&e.jsx(_t,{label:u("Select Data to Export"),instructions:u("Choose which Freeform data to include in the export. If you export submissions without the corresponding form, the submissions will not be included."),children:e.jsx(ji,{disabled:!1,data:r,options:x,onUpdate:y=>f(y)})}),e.jsx(Dt,{value:x.password||"",updateValue:y=>f({...x,password:y}),property:{handle:"password",label:"Password-protect the Export File (optional)",instructions:"Enter a password if you want to protect your zip file with a password.",type:K.String,placeholder:"Enter a password"}}),e.jsx("div",{className:"field",children:e.jsx("button",{type:"button",disabled:j,onClick:b,className:E("btn","submit",j&&"disabled",ta(x)&&"disabled"),children:e.jsx(J,{loadingText:u("Exporting..."),loading:j,spinner:!0,children:u("Begin Export")})})}),e.jsx(yi,{label:u("Export Progress"),finishLabel:u("Export completed successfully!"),event:t})]})},ia=({data:t,strategy:n,disabled:s,onUpdate:i})=>e.jsxs("div",{children:[e.jsx(_t,{label:u("Existing Form Behavior"),instructions:u("Choose the behavior Freeform should use if this site contains any forms that match the data in this import."),className:E(s&&"disabled",!t.forms.length&&"hidden"),children:e.jsx("div",{className:"select",children:e.jsxs("select",{value:n.forms,onChange:o=>i({...n,forms:o.target.value}),children:[e.jsx("option",{value:"skip",children:u("Skip")}),e.jsx("option",{value:"replace",children:u("Replace")})]})})}),e.jsx(_t,{label:u("Existing Template Behavior"),instructions:u("Choose the behavior Freeform should use if this site contains any email notification, formatting or success templates that match the data in this import."),className:E(s&&"disabled",!t.templates.notification.length&&"hidden"),children:e.jsx("div",{className:"select",children:e.jsxs("select",{value:n.templates,onChange:o=>i({...n,templates:o.target.value}),children:[e.jsx("option",{value:"skip",children:u("Skip")}),e.jsx("option",{value:"replace",children:u("Replace")})]})})})]}),oa=()=>({forms:[],favorites:[],formGroups:[],limitedUsers:[],formSubmissions:[],templates:{pdf:[],wrapper:[],notification:[],formatting:[],success:[]},integrations:[],strategy:{forms:"skip",templates:"skip"},settings:!1}),R$={data:["expressForms","data"]},P$=()=>T.get("/import/express-forms/data").then(t=>t.data),D$=()=>B({queryKey:R$.data,queryFn:P$}),B$=()=>{const[t,n]=g.useState(oa()),s=vi(),i=s.progress.active,{data:o,isFetching:r}=D$(),a=async()=>{s.clearProgress();const{data:c}=await T.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\ExpressFormsExporter",options:t}),d=me(`/api/import?server-token=${c.token}`);s.triggerProgress(d)};return r?e.jsx(He,{children:u("Loading...")}):!o.forms.length&&!o.templates.pdf.length&&!o.templates.notification.length&&!o.templates.formatting.length&&!o.templates.success.length&&!o.formSubmissions.length?e.jsx(He,{children:u("No data found")}):e.jsxs(He,{children:[e.jsx(q,{id:"import",label:"Import",url:"import/express-forms"}),e.jsx(q,{id:"import-express",label:"Express Forms",url:"import/express-forms"}),o&&e.jsx(_t,{label:u("Select Data"),children:e.jsx(ji,{disabled:i,data:o,options:t,onUpdate:c=>n({...t,...c})})}),e.jsx(ia,{data:o,strategy:t.strategy,disabled:i,onUpdate:c=>n(d=>({...d,strategy:c}))}),e.jsx("button",{type:"button",disabled:i,onClick:a,className:E("field btn","submit",i&&"disabled",ta(t)&&"disabled"),children:e.jsx(J,{loadingText:u("Processing"),loading:i,spinner:!0,children:u("Begin Import")})}),e.jsx(yi,{label:u("Import"),finishLabel:u("Import completed successfully!"),event:s})]})},O$=()=>B({queryKey:["formie","import-data"],queryFn:async()=>{const{data:t}=await T.get("/import/formie/v3/data");return t}}),_$=()=>{const[t,n]=g.useState(oa()),s=vi(),i=s.progress.active,{data:o,isFetching:r}=O$(),a=async()=>{s.clearProgress();const{data:c}=await T.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FormieV3Exporter",options:t}),d=me(`/api/import?server-token=${c.token}`);s.triggerProgress(d)};return r?e.jsx(He,{children:u("Loading...")}):o?!o.forms.length&&!o.templates.pdf.length&&!o.templates.notification.length&&!o.templates.formatting.length&&!o.templates.success.length&&!o.formSubmissions.length?e.jsx(He,{children:u("No data found")}):e.jsxs(He,{children:[e.jsx(q,{id:"import",label:"Import",url:"import/formie3"}),e.jsx(q,{id:"import-formie3",label:"Formie (v3)",url:"import/formie3"}),o&&e.jsx(_t,{label:u("Select Data"),children:e.jsx(ji,{disabled:i,data:o,options:t,onUpdate:c=>n({...t,...c})})}),e.jsx(ia,{data:o,strategy:t.strategy,disabled:i,onUpdate:c=>n(d=>({...d,strategy:c}))}),e.jsx("button",{type:"button",disabled:i,onClick:a,className:E("field btn","submit",i&&"disabled",ta(t)&&"disabled"),children:e.jsx(J,{loadingText:u("Processing"),loading:i,spinner:!0,children:u("Begin Import")})}),e.jsx(yi,{label:u("Import"),finishLabel:u("Import completed successfully!"),event:s})]}):e.jsx(He,{children:u("No data found")})},W$=l.div`
  //
`,U$=l.input`
  cursor: pointer;

  width: 100%;
  padding: 0;
  margin: 5px 0 3px;

  border: 1px solid ${h.inputBorder};
  border-radius: ${S.lg};

  color: rgb(156 163 175);
  background: rgb(55 65 81 / 5%);

  appearance: none;

  &::file-selector-button {
    cursor: pointer;

    padding: 5px 20px;

    border: none;
    border-right: 1px solid ${h.inputBorder};
    border-radius: ${S.lg};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    color: ${h.gray700};
    font-weight: bold;
    background: ${h.gray100};

    &:hover {
      text-decoration: underline;
    }
  }
`;l.ul`
  //
`;const H$=()=>{const[t,n]=g.useState(),[s,i]=g.useState(),[o,r]=g.useState(),a=g.useRef(void 0),[c,d]=g.useState(oa()),p=vi(),x=async b=>{r(void 0),n(void 0);const j=b.target.files?.[0];if(!j)return;const y=new FormData;y.append("file",j),a.current&&y.append("password",a.current);try{const{data:w}=await T.post("/api/import/file",y,{headers:{"Content-Type":"multipart/form-data"}});i(w.options),n(w.token)}catch(w){if(r(w?.errors?.import?.file),w.status===403){a.current=void 0;const v=prompt(u("Enter password"));if(!v)return;a.current=v,x(b)}}},f=async()=>{if(!t)return;p.clearProgress();const{data:b}=await T.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FileExportReader",options:{...c,fileToken:t}}),j=me(`/api/import?server-token=${b.token}`);p.triggerProgress(j)};return e.jsxs(He,{children:[e.jsx(q,{id:"import",label:"Import",url:"import/forms"}),e.jsx(q,{id:"import-forms",label:"Freeform Data",url:"import/forms"}),e.jsxs(W$,{children:[e.jsx(Fn,{children:u("Upload a Freeform Export zip file")}),e.jsx(U$,{type:"file",onChange:x,accept:".zip"}),e.jsx(jd,{children:u("Accepts `.zip` files. Only upload files that you trust.")}),e.jsx(ti,{errors:o})]}),s&&e.jsxs(e.Fragment,{children:[e.jsx(_t,{label:u("Select Data"),instructions:u("Please select the data you want to import."),children:e.jsx(ji,{disabled:!1,data:s,options:c,onUpdate:b=>d({...c,...b})})}),e.jsx(ia,{data:s,strategy:c.strategy,disabled:!1,onUpdate:b=>d(j=>({...j,strategy:b}))}),e.jsx(_t,{children:e.jsx("button",{className:"btn submit",type:"button",onClick:f,children:e.jsx(J,{loadingText:u("Processing..."),loading:!1,spinner:!0,children:u("Begin Import")})})}),e.jsx(yi,{label:u("Import"),finishLabel:u("Import completed successfully!"),event:p})]})]})};l.div`
  display: flex;
  margin-bottom: 50px;
`;const q$=l.div`
  flex: 1;
  background-color: ${h.white};
  border-radius: 0 ${S.lg} ${S.lg} 0;
`,Q$=()=>{const t=g.useRef(null);return g.useEffect(()=>{const n=s=>{if(s.isComposing||s.altKey||s.ctrlKey||s.metaKey)return;const i=s.target;if(!(i&&(i.tagName==="INPUT"||i.tagName==="TEXTAREA"||i.isContentEditable))&&s.key==="/"){s.preventDefault();const o=t.current;o?.focus(),o?.select?.()}};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),t},K$=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{fill:"currentColor",d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"})}),V$=l.div`
  position: relative;
  z-index: 1;
`,G$=l.div`
  position: relative;

  display: flex;
`,Y$=l.input`
  position: relative;

  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${h.gray200};
  }
`,J$=l.div`
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 3px 6px;

  //background-color: ${h.gray100};
  border: 1px solid ${h.gray200};
  border-radius: 5px;

  color: ${h.gray300};
  font-size: 12px;
  line-height: 16px;
`,Wl="14px",Z$=ne`
  position: absolute;
  top: 1px;
  bottom: 1px;
  z-index: 2;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 0 8px;

  box-sizing: border-box;
  user-select: none;

  > svg {
    width: ${Wl};
    height: ${Wl};
  }
`,X$=l.div`
  left: 1px;

  ${Z$}

  color: ${h.gray400};
`,eC=({placeholder:t,query:n,setQuery:s})=>{const i=Q$();return e.jsx(V$,{children:e.jsxs(G$,{children:[e.jsx(X$,{children:e.jsx(K$,{})}),e.jsx(J$,{children:"/"}),e.jsx(Y$,{ref:i,type:"text",placeholder:u(t||"Search"),className:"fullwidth text",value:n,onChange:o=>{s?.(o.target.value)}})]})})},tC="integrations-favorites",Gp=()=>{const[t,n]=Fp(tC,[]),s=g.useCallback(o=>{const r=Hl(o);n(a=>{const c=Ul(a);return c.has(r)?c.delete(r):c.add(r),Array.from(c)})},[n]),i=g.useCallback(o=>{const r=Hl(o);return Ul(t).has(r)},[t]);return{toggleFavorite:s,hasFavorite:i}},Ul=t=>new Set(t.map(n=>n.trim()).filter(Boolean)),Hl=({type:t,shortName:n})=>`${t}:${n}`,ql=l.nav`
  display: flex;
  flex-direction: column;
  gap: 0;

  flex-basis: 250px;
  flex-shrink: 0;
  width: 300px;
  padding: 0;
  box-sizing: border-box;

  border-radius: ${S.lg} 0 0 ${S.lg};
  background: ${h.gray050};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
`,nC=l.div`
  padding: 22px ${m.md};
  border-bottom: 1px solid ${h.hairline};
`,sC=l.ul`
  list-style: none;
  padding: ${m.lg} ${m.sm} 0;
  margin: 0;

  overflow-y: auto;
  ${Q};
`,Ql=l.li`
  margin: 0 0 ${m.xl};
`,Kl=l.h3`
  font-weight: bold;
  padding: 0 ${m.lg} 0;
  margin: 0 0 ${m.sm};
`,Vl=l.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  list-style: none;
  padding: 0 8px;
  margin: 0;
`,Ws=l.span`
  display: block;

  width: 12px;
  height: 12px;

  border-radius: 50%;
  border: 2px solid ${h.gray300};

  color: ${h.gray300};
  font-size: 10px;
  font-weight: bold;
  line-height: 8px;
  text-align: center;

  &.active {
    border-color: transparent;
    background-color: ${h.teal500};
    color: ${h.white};
  }

  &.unsupported {
    border-style: dashed;
    border-width: 2px;
    border-color: ${h.gray200};
    color: ${h.gray300};
  }
`,iC=l.li`
  > a {
    display: flex;
    gap: 5px;
    align-items: center;

    padding: 3px 10px;
    margin: 0;

    color: ${h.gray700};
    text-decoration: none;
    border-radius: 4px;

    &.unsupported {
      opacity: 0.5;
    }

    &:hover,
    &.active {
      cursor: pointer;
      color: ${h.white};

      svg,
      i {
        path:not([fill='none']) {
          fill: ${h.gray100} !important;
          color: ${h.gray100};

          &.inverted {
            fill: ${h.gray700} !important;
            color: ${h.gray700};
          }
        }
      }
    }

    &:hover {
      background: ${h.gray300};

      ${Ws} {
        &:not(.active) {
          border-color: ${h.gray500};
        }

        &.active {
          background-color: ${h.teal600};
        }
      }
    }

    &.active {
      background: ${h.gray500};

      &:hover {
        ${Ws} {
          &:not(.active) {
            border-color: ${h.gray100};
          }

          &.active {
            background-color: ${h.teal300};
          }
        }
      }

      ${Ws} {
        &.active {
          background-color: ${h.teal500};
          color: ${h.gray700};
        }
      }
    }
  }
`,oC=l.span``,Gl=l.span`
  svg,
  i {
    width: 16px;
    height: 16px;
    font-size: 16px;
    line-height: 16px;

    vertical-align: middle;
  }
`,rC=l.span`
  font-size: 10px;
  color: ${h.gray300};
  margin-left: auto;
`,Yl=({entry:t})=>{const n=I.editions.edition,{pathname:s}=Ht(),i=t.type,o=t.type.name,r=t.instances.length>0,a=t.type.editions.length>0&&!t.type.editions.includes(n),c=t.instances.length,d=c>1?c:"";let p=`${i.type}/${i.shortName}`;const x=s.includes(p);return c>0&&(p+=`/${t.instances[0].id}`),e.jsx(iC,{children:e.jsxs(he,{to:p,className:E(x&&"active",a&&"unsupported"),children:[e.jsx(Ws,{className:E(r&&!a&&"active",a&&"unsupported"),children:d}),t.type.iconSvg&&e.jsx(Gl,{dangerouslySetInnerHTML:{__html:O.sanitize(t.type.iconSvg)}}),!t.type.iconSvg&&e.jsx(Gl,{children:e.jsx("i",{className:"fa-solid fa-cog"})}),e.jsx(oC,{children:o}),i.version&&e.jsx(rC,{children:i.version})]})})},Yp=()=>B({queryKey:ze.navigation,queryFn:()=>T.get("/api/integrations/navigation").then(t=>t.data),gcTime:1/0,staleTime:1/0}),aC=()=>{const{data:t,isFetching:n}=Yp(),{hasFavorite:s}=Gp(),[i,o]=g.useState("");if(n&&!t)return e.jsx(ql,{});const r=t.map(d=>({...d,entries:d.entries.filter(p=>p.type.name.toLowerCase().includes(i.toLowerCase())||p.instances.some(x=>x.name.toLowerCase().includes(i.toLowerCase())))})).filter(d=>d.entries.length>0),a=r.flatMap(d=>d.entries.filter(p=>s(p.type))),c=r.map(d=>({...d,entries:d.entries.filter(p=>!s(p.type))})).filter(d=>d.entries.length>0);return e.jsxs(ql,{children:[e.jsx(nC,{children:e.jsx(eC,{query:i,setQuery:o})}),e.jsxs(sC,{children:[a.length>0&&e.jsxs(Ql,{children:[e.jsx(Kl,{children:u("Favorites")}),e.jsx(Vl,{children:a.map(d=>e.jsx(Yl,{entry:d},d.type.shortName))})]},"favorites"),c.map(d=>e.jsxs(Ql,{children:[e.jsx(Kl,{children:d.title}),e.jsx(Vl,{children:d.entries.map(p=>e.jsx(Yl,{entry:p},p.type.shortName))})]},d.handle))]})]})},lC=()=>(Ln("integrations"),e.jsxs("div",{children:[e.jsx(q,{id:"integrations",label:"Integrations",url:"integrations"}),e.jsx(Sn,{children:u("Integrations")}),e.jsxs(Pu,{children:[e.jsx(aC,{}),e.jsx(q$,{children:e.jsx(jt,{})})]})]})),cC=({property:t,integration:n,autoFocus:s,values:i,errors:o,onUpdate:r})=>{const a=vs(n.properties,{},(f,b)=>{r?.(f,b)}),c=t.handle,d=i.metadata[c]??t.value,p={...t,flags:(t.flags||[])?.filter(f=>f!=="as-readonly-in-instance")},x={...n,values:{name:i.name,handle:i.handle,enabled:i.enabled,...i.metadata}};return e.jsx(je,{autoFocus:s,value:d,property:p,updateValue:a(p),errors:o?.metadata?.[c],context:x})},Po=l.div`
  position: relative;
  height: 100%;
`,ra=l.div`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: ${m.xl};

  height: 100%;
  overflow-y: auto;

  background: white;

  border-top-right-radius: ${S.lg};
  border-bottom-right-radius: ${S.lg};

  ${Q};

  hr {
    margin: 0;
    margin-inline: calc(var(--xl) * -1);
  }
`,Jl=l.div`
  position: absolute;
  right: 0;
  top: -44px;
  z-index: 2;
`,Zl=l(fs)`
  position: absolute;
  left: 0;
  top: -49px;
  z-index: 1;
`,Jp=l.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    font-size: 20px;
    font-weight: bold;
    color: #414141;
  }
`,dC=l.small`
  margin-top: 6px;

  font-size: 12px;
  font-weight: normal;
  font-family: monospace;
  color: ${h.gray300};
`,uC=l.button`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  svg {
    width: 20px;
    height: 20px;

    .star-filler {
      fill: transparent;
    }
  }

  &:hover {
    svg {
      fill: ${h.yellow600};
    }
  }

  &.active {
    svg .star-filler {
      fill: ${h.yellow500};
    }
  }
`,Zp=l.div`
  svg {
    width: 30px;
    height: 30px;
  }

  &.spinning {
    animation: spin 2s linear infinite;
    fill: ${h.gray300};
  }
`,pC=l.div`
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-rows: auto;

  align-items: center;
  gap: 10px;
`,qn=l.div`
  flex: 0 0 10px;

  display: block;
  width: 10px;
  height: 10px;

  border-radius: 10px;
`,hC=l.div`
  flex: 1;
  white-space: nowrap;
`,xC=l.div`
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 5px;

  width: fit-content;
  padding: 3px 8px;

  border-radius: 100px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;

  &.authorized {
    background-color: rgba(34, 197, 94, 0.2);

    ${qn} {
      background: #27ae60;
      border: 1px solid #27ae60;
    }
  }

  &.unauthorized {
    background-color: rgba(51, 197, 255, 0.2);

    ${qn} {
      background: rgba(51, 197, 255, 1);
      border: 1px solid rgba(51, 197, 255, 1);
    }
  }

  &.pending {
    background-color: rgba(55, 65, 81, 0.05);

    ${qn} {
      background: #ccd1d6;
      border: 1px solid #ccd1d6;
    }
  }

  &.error {
    background-color: rgba(239, 68, 68, 0.2);

    ${qn} {
      background: #d0021b;
      border: 1px solid #d0021b;
    }
  }
`,mC=l.div`
  margin-left: auto;

  > button,
  svg {
    width: 30px;
    height: 30px;
  }
`,Ji=l.div`
  display: flex;
  gap: 5px;
`,Zi=l.a`
  align-items: center;
  gap: 5px;

  font-size: 12px;

  &.info-button {
    background-color: ${h.blue100};

    &:hover {
      background-color: ${h.blue200};
    }
  }

  i,
  svg {
    font-size: 14px;
    width: 16px;
    height: 16px;
  }
`,gC=l.ul`
  padding: 10px;

  border: 1px solid ${h.red200};
  border-radius: 5px;

  background-color: ${h.red100};

  color: ${h.red600};
  font-size: 14px;

  width: 100%;
  max-width: 100%;

  pre {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;

    white-space: pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    overflow-wrap: break-word;

    overflow-x: auto;
  }
`,fC=()=>e.jsxs(ra,{children:[e.jsxs(Jp,{children:[e.jsx(Zp,{className:"spinning",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 640",children:[e.jsx("title",{children:"Loading"}),e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})]})}),e.jsx(k,{width:200})]}),e.jsx("hr",{}),e.jsxs("div",{children:[e.jsx(k,{width:80}),e.jsx(k,{width:270,height:10}),e.jsx(k,{width:"100%",height:30})]}),e.jsx("hr",{}),e.jsxs("div",{children:[e.jsx(k,{width:180}),e.jsx(k,{width:200,height:10}),e.jsx(k,{width:"100%",height:30})]}),e.jsxs("div",{children:[e.jsx(k,{width:70}),e.jsx(k,{width:340,height:10}),e.jsx(k,{width:"100%",height:30})]})]}),bC=({integration:t})=>{if(t.supported)return null;let n=I.editions.edition;return n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase(),e.jsx(jC,{children:e.jsx(at,{title:u("Not available for {edition} edition",{edition:n}),subtitle:u("Upgrade to Pro to get access to this integration."),icon:e.jsx(ps,{}),children:e.jsx("a",{href:Craft.getCpUrl("plugin-store/freeform"),target:"_blank",rel:"noreferrer",children:u("Plugin Store")})})})},jC=l.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;

  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;

  background-color: rgba(255, 255, 255, 0.3);
  // blur things in the background
  backdrop-filter: blur(1px);
`,yC=(t,n,s)=>{const i=I.editions.edition;let o="/api/integrations/properties/";return s&&s!=="new"?o+=s:o+=`${t}/${n}`,B({queryKey:ze.properties(t,n,s),queryFn:()=>T.get(o).then(r=>r.data).then(r=>({...r,supported:r.type.editions.length===0||r.type.editions.includes(i)}))})},vC=(t,n,s)=>{const i=X(),o=te();return le({mutationFn:r=>{const a={class:t,values:r};return T.post(`/api/integrations${n&&n!=="new"?`/${n}`:""}`,a).then(c=>c.data)},onSuccess:r=>{const{id:a,type:c,integration:d}=r;Xe.success(u("Integration saved successfully")),i.invalidateQueries({queryKey:ze.all}),a&&o(`/integrations/${c}/${d}/${a}`)},onError:s})},Xl=l.div`
  margin: 0 -24px;
  padding: 0 24px;

  background-color: #f3f7fc;

  border-top: 1px solid ${h.hr};
`,wC=l.div`
  position: relative;

  margin: 0 -24px;
  padding: 0;

  max-height: 0;
  margin-top: 0;

  background-color: #f3f7fc;

  overflow-y: hidden;
  overflow-x: hidden;
  opacity: 0;
  transition: all 0.3s ease-out;

  ${Q};

  &.active {
    max-height: 500px;

    border-bottom: 1px solid ${h.hr};

    opacity: 1;
    overflow-y: auto;

    .markdown-collapse {
      opacity: 1;
    }
  }
`,$C=l.div`
  padding: 12px 24px;

  font-size: 14px;

  pre {
    background: #d1ddea;
  }

  h3 {
    margin-bottom: 10px;
  }

  p {
    + ul,
    + ol {
      margin-top: -10px;
    }
  }

  ul,
  ol {
    padding-left: 20px;

    li {
      margin-top: 0.15em;

      > ul,
      > ol {
        margin-top: 0.15em;
      }
    }
  }

  ul {
    list-style: disc;
    ul {
      list-style: square;
      ul {
        list-style: circle;
        ul {
          list-style: disc;
          ul {
            list-style: square;
            ul {
              list-style: circle;
            }
          }
        }
      }
    }
  }

  ul li,
  ol li {
    .note {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }

  .note {
    display: block;
    padding: 7px 12px;
    border-radius: 5px;
  }

  .warning {
    border: 1px solid var(--warning-color);
  }

  .tip {
    color: #1f5fea;
    border: 1px solid #1f5fea;
  }

  .danger {
    color: var(--error-color);
    border: 1px solid var(--error-color);
  }

  hr {
    height: 1px;
  }
`,CC=({active:t,content:n})=>{const s=K1.parse(n,{gfm:!0,async:!1});return n?e.jsx(Xl,{children:e.jsx(wC,{className:E("markdown-body",t&&"active"),children:e.jsx($C,{dangerouslySetInnerHTML:{__html:O.sanitize(s)}})})}):e.jsx(Xl,{})},Xp=t=>{const n=window.Craft;return n?.sendActionRequest?n.sendActionRequest("POST",t):fetch(`/actions/${t}`,{method:"POST",credentials:"same-origin"})},kC=()=>Xp("freeform/form-monitor/disable-me").then(()=>{}),SC=()=>Xp("freeform/form-monitor/delete-me").then(()=>{}),LC=({onClose:t,onConfirm:n})=>{const[s,i]=g.useState(!1),[o,r]=g.useState(!1),[a,c]=g.useState(""),d=async()=>{if(o)try{i(!0),await n(),t()}finally{i(!1)}};return g.useEffect(()=>{r(a.toUpperCase()==="CONFIRM")},[a]),e.jsx(wt,{closeModal:t,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Disable Monitoring")})}),e.jsxs(hs,{children:[e.jsx("div",{children:u("Are you sure you want to disable monitoring for this site?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To disable monitoring, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:a,autoComplete:"off",onChange:p=>c(p.target.value),className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",disabled:s,className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",disabled:!o||s,className:E("btn submit",!o&&"disabled"),onClick:d,children:u("Disable")})]})]})})},FC=({onClose:t,onConfirm:n})=>{const[s,i]=g.useState(!1),[o,r]=g.useState(""),[a,c]=g.useState(!1),d=async()=>{if(s)try{c(!0),await n(),t()}finally{c(!1)}};return g.useEffect(()=>{i(o.toUpperCase()==="CONFIRM")},[o]),e.jsx(wt,{closeModal:t,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:u("Disable & Delete Monitoring Data")})}),e.jsxs(hs,{children:[e.jsx("div",{children:u("Are you sure you want to disable monitoring and delete all monitoring data for this site?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:o,autoComplete:"off",onChange:p=>r(p.target.value),className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",disabled:a,className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",disabled:!s||a,className:E("btn submit",!s&&"disabled"),onClick:d,children:u("Disable & Delete")})]})]})})},EC=()=>{const t=X(),n=te(),[s,i]=g.useState(!1),[o,r]=g.useState(!1),a=()=>i(!0),c=()=>r(!0);return e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"btn small",onClick:a,children:e.jsx("span",{children:u("Disable Monitoring")})}),e.jsx("button",{type:"button",className:"btn small",onClick:c,children:e.jsx("span",{children:u("Disable & Delete Monitoring Data")})}),s&&e.jsx(LC,{onClose:()=>i(!1),onConfirm:async()=>{await kC(),t.invalidateQueries({queryKey:ze.all}),Xe.success(u("Monitoring disabled."))}}),o&&e.jsx(FC,{onClose:()=>r(!1),onConfirm:async()=>{await SC(),t.invalidateQueries({queryKey:ze.all}),Xe.success(u("Monitoring disabled and data deleted.")),n("/integrations",{replace:!0})}})]})},TC=t=>t.type.class==="Solspace\\Freeform\\Integrations\\Single\\FormMonitor\\FormMonitor",NC=t=>e.jsxs(R,{viewBox:"0 0 640 640",...t,children:[e.jsx("path",{className:"star-filler",d:"M119.2 254.7L209 344.6C214.4 350 216.9 357.7 215.7 365.3L195.9 490.8L309.2 433.2C316 429.7 324.1 429.7 331 433.2L444.3 490.8L424.5 365.3C423.3 357.7 425.8 350 431.2 344.6L521 254.7L395.5 234.7C387.9 233.5 381.4 228.7 377.9 221.9L320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8z"}),e.jsx("path",{d:"M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"})]}),zC=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z"})}),MC=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z"})}),IC=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 64C324.6 64 329.2 65 333.4 66.9L521.8 146.8C543.8 156.1 560.2 177.8 560.1 204C559.6 303.2 518.8 484.7 346.5 567.2C329.8 575.2 310.4 575.2 293.7 567.2C121.3 484.7 80.6 303.2 80.1 204C80 177.8 96.4 156.1 118.4 146.8L306.7 66.9C310.9 65 315.4 64 320 64zM320 130.8L320 508.9C458 442.1 495.1 294.1 496 205.5L320 130.9L320 130.9z"})}),AC=(t,n)=>{const s=Craft.getCpUrl(`freeform/integrations/${t}/authorize`),i=600,o=700,r=window.screenX+(window.outerWidth-i)/2,a=window.screenY+(window.outerHeight-o)/2,d=Object.entries({width:i,height:o,top:a,left:r,toolbar:0,menubar:0}).map(([f,b])=>`${f}=${b}`).join(","),p=window.open(s,"OAuthFlow",d),x=f=>{f.origin===window.location.origin&&f.data.type==="oauth2"&&(p?.close(),n(),window.removeEventListener("message",x))};window.addEventListener("message",x)},RC=t=>{const{id:n}=t;return B({queryKey:ze.authCheck(n),enabled:!!n&&t.implements.includes("apiIntegration"),queryFn:async()=>T.get(`/api/integrations/${n}/status`).then(s=>s.data)})},PC=["authorized","unauthorized","error"],DC=["authorized","error"],BC=({integration:t})=>{const n=X(),s=te(),[i,o]=g.useState("pending"),[r,a]=g.useState([]),[c,d]=g.useState(!1),{toggleFavorite:p,hasFavorite:x}=Gp(),{data:f,isFetching:b,refetch:j}=RC(t);g.useEffect(()=>{b?(o("pending"),a([])):f&&(o(f.status),a(f.errors||[]))},[f,b]);const y=()=>{confirm(u("Are you sure you want to remove this integration?"))&&T.post(`/api/integrations/${t.id}/delete`).then(()=>{n.invalidateQueries({queryKey:ze.all}),s("/integrations"),Xe.success(u("Integration deleted successfully."))})},w=TC({...t,id:String(t.id)}),v=I.permissions.integrations==="manage",$=v&&t.id&&t.supported,C=x(t.type),F=!!t.type.readmeContent,N=v&&t.id&&t.supported&&t.implements.includes("apiIntegration");return e.jsxs(e.Fragment,{children:[e.jsxs(Jp,{children:[e.jsx(Zp,{dangerouslySetInnerHTML:{__html:O.sanitize(t.type.iconSvg)}}),e.jsx("span",{children:t.name||t.type.name}),t.type.version&&e.jsx(dC,{children:t.type.version}),e.jsx(uC,{type:"button",className:E(C&&"active"),onClick:()=>p(t.type),title:u("Favorite"),children:e.jsx(NC,{})}),N&&e.jsxs(pC,{children:[e.jsxs(xC,{className:i,children:[e.jsx(qn,{}),e.jsx(hC,{children:OC[i]})]}),e.jsxs(Ji,{children:[DC.includes(i)&&e.jsx(Zi,{className:"btn small",onClick:()=>j(),children:e.jsx(MC,{})}),PC.includes(i)&&e.jsxs(Zi,{className:"btn small",onClick:()=>AC(t.id,j),children:[e.jsx(IC,{}),e.jsx("span",{children:u("Authorize")})]})]})]}),F&&e.jsx(Ji,{children:e.jsxs(Zi,{className:"btn small info-button",onClick:()=>d(!c),children:[e.jsx(zC,{}),e.jsx("span",{children:u("Show Instructions")})]})}),v&&t.enabled&&w&&i==="authorized"&&e.jsx(Ji,{children:e.jsx(EC,{})}),$&&e.jsx(mC,{children:e.jsx(Tn,{active:!0,onClick:y})})]}),r.length>0&&e.jsx(gC,{children:r.map((M,z)=>{try{const L=JSON.parse(M);if(L)return e.jsx("li",{children:e.jsx("pre",{children:JSON.stringify(L,null,2)})},z)}catch{}return e.jsx("li",{children:M},z)})}),e.jsx(CC,{active:c,content:t.type.readmeContent})]})},OC={authorized:"Authorized",unauthorized:"Unauthorized",pending:"Checking...",error:"Error"},_C=()=>{const t=te(),{type:n,integration:s,id:i}=V(),{data:o,isFetching:r}=yC(n,s,i),{data:a}=Yp();g.useEffect(()=>{if(a&&s&&!i){const z=a.find(A=>A.handle===n);if(!z)return;const L=z.entries.find(A=>A.type.shortName===s);if(L){const A=L.instances?.[0];if(A){t(`/integrations/${n}/${s}/${A.id}`);return}}}},[a,s,i,t,n]);const[c,d]=g.useState({name:"",handle:"",enabled:!0,metadata:{}}),[p,x]=g.useState({}),{mutate:f,isPending:b}=vC(o?.type.class,i,z=>{if(!z.errors){x({});return}const L={metadata:{}};Object.entries(z.errors).forEach(([A,D])=>{/^metadata\./.test(A)?L.metadata[A.replace(/^metadata\./,"")]=D:L[A]=D}),x(L)});g.useEffect(()=>{b&&x({})},[b]),g.useEffect(()=>{if(o){const z=o.properties.reduce((L,A)=>(L[A.handle]=A.value,L),{});d({name:o.name,handle:o.handle,enabled:o.enabled,metadata:z})}},[o]);const j=I.permissions.integrations==="manage",y=i==="new",w=r||!o,v=()=>{o?.supported&&f(c)};_r(v);const $=a?.find(z=>z.handle===n)?.entries?.find(z=>z.type.shortName===s)?.instances,C=$?.length||0,F=C>1||y,N=!!o?.type?.singleton,M=C>0&&n!==gu.Singles&&!N;return!n||!s?null:w?e.jsxs(Po,{children:[F&&e.jsx(Zl,{children:$?.map(z=>e.jsx(he,{to:`../${n}/${s}/${z.id}`,children:e.jsx("span",{children:z.name})},z.id))}),j&&e.jsx(Jl,{children:e.jsxs("div",{className:"btngroup",children:[M&&e.jsx("button",{type:"button",title:u("Add new integration of the same type"),className:E("btn","add","icon","disabled")}),e.jsx("button",{type:"button",className:E("btn",o?.supported&&"submit","disabled"),children:u("Save")})]})}),e.jsx(fC,{})]}):e.jsxs(Po,{children:[e.jsx(q,{id:"integration-edit",label:o.name,url:`integrations/${n}/${s}${i?`/${i}`:""}`}),e.jsx(bC,{integration:o}),F&&e.jsxs(Zl,{children:[$.map(z=>e.jsx(he,{to:`../${n}/${s}/${z.id}`,children:e.jsx("span",{children:z.name})},z.id)),y&&e.jsx("a",{className:"active",children:e.jsx("span",{children:u("Create a new instance")})})]}),j&&e.jsx(Jl,{children:e.jsxs("div",{className:"btngroup",children:[M&&e.jsx("button",{type:"button",title:u("Add new integration of the same type"),className:E("btn","add","icon",!o.supported&&"disabled"),onClick:()=>t(`/integrations/${n}/${s}/new`)}),e.jsx("button",{type:"button",className:E("btn",o.supported?"submit":"disabled"),onClick:v,children:e.jsx(J,{loading:b,loadingText:u("Saving..."),spinner:!0,children:u("Save")})})]})}),e.jsxs(ra,{children:[e.jsx(BC,{integration:o}),e.jsx(Dt,{property:{handle:"name",label:"Name",required:!0,instructions:u("What this integration will be called in the CP."),type:K.String},updateValue:z=>{d(L=>({...L,name:z,handle:Jo(z,{transliterate:!0,camelize:!0})}))},value:c.name,errors:p?.handle,autoFocus:o.supported}),e.jsx("hr",{}),o.properties.map(z=>e.jsx(cC,{integration:o,property:z,values:c,errors:p,onUpdate:(L,A)=>{d(D=>({...D,metadata:{...D.metadata,[L]:A}}))}},z.handle))]})]})},WC=()=>e.jsx(Po,{children:e.jsx(ra,{children:e.jsx(at,{title:u("Please select an integration"),subtitle:u("To add a new integration, select its type in the sidebar."),icon:e.jsx(ps,{})})})}),ws={all:["limited-users"],one:t=>[...ws.all,t]},UC=()=>B({queryKey:ws.all,queryFn:()=>T.get("/api/limited-users").then(t=>t.data),staleTime:1/0}),HC=t=>B({queryKey:ws.one(t),queryFn:()=>T.get(`/api/limited-users/${t}`).then(n=>n.data),staleTime:1/0}),qC=t=>{const n=X();return le({mutationFn:s=>T.post(`/api/limited-users/${t}`,{name:s.name,description:s.description,items:s.items}),onSuccess:()=>{n.invalidateQueries({queryKey:ws.all})}})},QC=()=>{const t=X();return le({mutationFn:n=>T.delete(`/api/limited-users/${n}/delete`),onSuccess:()=>{t.invalidateQueries({queryKey:ws.all})}})},e1=l.div`
  &.craft-4 {
    max-width: calc(100% - 250px) !important;
    width: calc(100% - 250px) !important;
  }
`,KC=l.div`
  background-color: white;
  padding: ${m.xl};
  border-radius: 5px;
`,wn=l.div`
  display: flex;
  gap: 30px;

  align-self: center;
`,wi=l.div`
  display: grid;
  grid-template-columns: 41px auto;
  grid-template-areas: 'control label';

  gap: 5px 30px;

  padding: 0 0 14px;

  &.solo {
    display: flex;
  }

  &.triage {
    grid-template-areas:
      'control label'
      'control control-area';
  }
`,aa=l.label`
  grid-area: label;
`,VC=l.h2`
  margin: 0;
  padding: 0;
`,la=l.div`
  grid-area: control;
`,GC=l.div`
  grid-area: control-area;
`,YC=l.ul`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`,JC=l.li`
  cursor: pointer;
  position: relative;

  padding: 3px 10px 3px 30px;
  background-color: ${h.gray100};

  border-radius: 5px;

  user-select: none;
  transition: background-color 0.2s ease-in-out;

  i {
    position: absolute;
    left: 10px;
    top: 3px;
    font-size: 18px;
  }

  &:hover {
    background-color: ${h.gray200};
  }

  &.selected {
    background-color: #1fa07a;
    color: white;

    &:hover {
      background-color: #1a8665;
    }
  }
`,t1=l.div`
  display: flex;

  a {
    cursor: pointer;

    position: relative;
    padding: 0 10px;

    color: ${h.blue600};

    &.disabled {
      color: ${h.gray400};
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:last-child):after {
      position: absolute;
      right: -1px;
      top: 3px;

      content: '';

      display: block;
      width: 1px;
      height: 14px;

      background-color: ${h.gray200};
      font-size: 0;
      line-height: 0;
      overflow: hidden;
    }
  }
`,n1=l.ul`
  transition: opacity 0.2s ease-out;
`,ZC=l.li`
  position: relative;

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  &[data-type='group'] {
    &[data-nesting='0']:not(:last-child) {
      padding-bottom: 30px;

      &:after {
        content: '';
        position: absolute;
        bottom: 20px;
        left: -24px;
        right: -24px;

        display: block;
        height: 1px;
        background-color: ${h.gray100};
      }
    }
  }

  &[data-nesting='1'] h2 {
    margin-top: 10px !important;
    margin-left: 70px;
  }

  &[data-nesting='2'] {
    ${wn} {
      gap: 10px;

      &:before {
        content: '—';
      }
    }
  }

  &[data-nesting='3'] {
    ${wn} {
      gap: 10px;

      &:before {
        content: '———';
      }
    }
  }
`,XC=()=>{const{data:t,isFetching:n}=UC(),s=QC(),i=I.editions.isAtLeast(oe.Pro),o=I.metadata.craft.is5;return Ln("freeform/settings"),!t&&n?e.jsx("div",{children:"Loading..."}):e.jsxs("div",{children:[e.jsx(q,{id:"settings",label:u("Settings"),url:".",external:!0}),e.jsx(q,{id:"limited-users",label:u("Limited Users"),url:"settings/limited-users"}),e.jsx(Sn,{extra:i&&e.jsx(rt,{to:"new",className:"btn submit add icon",children:u("New Group")}),children:u("Limited Users")}),e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx(or,{activeKey:"limited-users"}),e.jsx(e1,{id:"content-container",className:E(!o&&"craft-4"),children:e.jsxs("div",{id:"content",className:"content-pane",children:[i&&e.jsxs("div",{className:"tablepane",children:[t.length>0&&e.jsxs("table",{className:"data fullwidth",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Name")}),e.jsx("th",{children:u("Description")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{children:[e.jsx("th",{children:e.jsx(rt,{to:`${r.id}`,children:r.name})}),e.jsx("td",{children:r.description}),e.jsx("td",{className:"thin",children:e.jsx("a",{className:"delete icon",title:u("Delete"),onClick:()=>{confirm(u("Are you sure you want to delete this?"))&&s.mutate(r.id)}})})]},r.id))})]}),t.length===0&&e.jsx("div",{style:{padding:"100px 0 100px"},children:e.jsx(at,{title:u("No groups exist yet"),subtitle:u('Click on the "New Group" button to set up your first Limited User permission group.')})})]}),!i&&e.jsx(at,{lite:!0,title:u("Upgrade to the Freeform Pro edition to get access to the Limited Users feature.")})]})})]})]})},ek=({item:t,updateValue:n})=>e.jsxs(wi,{children:[e.jsx(la,{children:e.jsx(en,{enabled:t.enabled,onClick:s=>n(s)})}),e.jsx(wn,{children:e.jsx(aa,{onClick:()=>n(!t.enabled),children:u(t.name)})})]}),tk=({item:t,updateValue:n})=>e.jsxs(wi,{children:[e.jsx(la,{children:e.jsx("div",{className:"select",children:e.jsx("select",{value:t.value,onChange:s=>n(s.target.value),children:t.options.map(s=>e.jsx("option",{label:u(s.label),value:s.value},s.value))})})}),e.jsx(wn,{children:e.jsx(aa,{children:t.name})})]}),nk=({item:t,updateValue:n})=>{const s=i=>()=>{n(t.values.includes(i)?t.values.filter(o=>o!==i):[...t.values,i])};return e.jsxs(wi,{className:"triage",children:[e.jsx(la,{}),e.jsxs(wn,{children:[e.jsx(aa,{children:u(t.name)}),e.jsxs(t1,{children:[e.jsx("a",{className:E(t.values.length===t.options.length&&"disabled"),onClick:()=>n(t.options.map(i=>i.value)),children:u("Enable All")}),e.jsx("a",{className:E(t.values.length===0&&"disabled"),onClick:()=>n([]),children:u("Disable All")})]})]}),e.jsx(GC,{children:e.jsx(YC,{children:t.options.map(i=>e.jsxs(JC,{onClick:s(i.value),className:E(t.values.includes(i.value)&&"selected"),children:[t.values.includes(i.value)&&e.jsx("i",{className:"fa-sharp fa-solid fa-check"}),u(i.label)]},i.value))})})]})},sk=({item:t,nesting:n,updateValue:s})=>{const i=o=>()=>{const r=(a,c)=>{const d=c?`${c}.${a.id}`:a.id,p=[];if(a.type==="boolean"&&p.push([d,o]),a.children){const x=a.children.map(f=>r(f,d));p.push(...x.flat())}return p};s(r(t))};return e.jsx(wi,{className:"solo",children:e.jsxs(wn,{children:[e.jsx(VC,{children:u(t.name)}),n===0&&e.jsxs(t1,{children:[e.jsx("a",{onClick:i(!0),children:u("Enable All")}),e.jsx("a",{onClick:i(!1),children:u("Disable All")})]})]})})},s1=({item:t,parentId:n,nesting:s=0,updateValue:i})=>{const o=n?`${n}.${t.id}`:t.id;let r;switch(t.type){case"boolean":r=e.jsx(ek,{item:t,updateValue:a=>i(o,{enabled:a})});break;case"select":r=e.jsx(tk,{item:t,updateValue:a=>i(o,{value:a})});break;case"toggles":r=e.jsx(nk,{item:t,updateValue:a=>i(o,{values:a})});break;case"group":r=e.jsx(sk,{item:t,nesting:s,updateValue:a=>{a.forEach(([c,d])=>{i(c,{enabled:d})})}});break}return e.jsxs(ZC,{"data-type":t.type,"data-nesting":s,children:[r,t.children&&e.jsx(n1,{className:E(t.type==="boolean"&&!t.enabled&&"disabled"),children:t.children.map(a=>e.jsx(s1,{item:a,parentId:o,nesting:s+1,updateValue:i},a.id))})]})},ik=()=>{const{id:t}=V(),{data:n,isFetching:s}=HC(t),i=te(),[o,r]=g.useState(""),[a,c]=g.useState(""),[d,p]=g.useState([]),x=qC(t),f=I.metadata.craft.is5;Ln("freeform/settings"),g.useEffect(()=>{n&&(r(n.name),c(n.description),p(n.items))},[n]);const b=(y,w)=>{const v=($,C)=>$.map(F=>{const N=C?`${C}.${F.id}`:F.id;return N===y?{...F,...w}:F.children?{...F,children:v(F.children,N)}:F});p($=>v($))},j=(y=!0)=>()=>{x.mutate({name:o,description:a,items:d},{onSuccess:()=>{y&&i("/settings/limited-users"),Xe.success(u("Permission saved successfully."))}})};return _r(j(!1)),!n&&s?e.jsx("div",{children:u("Loading...")}):e.jsxs("div",{children:[e.jsx(q,{id:"settings",label:u("Settings"),url:"..",external:!0}),e.jsx(q,{id:"limited-users",label:u("Limited Users"),url:"settings/limited-users"}),e.jsx(q,{id:"limited-users-id",label:n?.name,url:`settings/limited-users/${t}`}),e.jsx(Sn,{extra:e.jsx("button",{type:"button",className:"btn submit",onClick:j(),children:e.jsx(J,{loading:x.isPending,loadingText:u("Saving..."),spinner:!0,children:u("Save")})}),children:u("Limited Users")}),e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx(or,{activeKey:"limited-users"}),e.jsx(e1,{id:"content-container",className:E(!f&&"craft-4"),children:e.jsx("div",{id:"content",className:"content-pane",style:{padding:0},children:e.jsxs(KC,{children:[e.jsx(Dt,{property:{handle:"name",label:u("Name"),instructions:u("Enter the name of the limited user permission."),type:K.String},value:o,updateValue:y=>r(y)}),e.jsx("br",{}),e.jsx(ds,{property:{handle:"description",label:u("Description"),instructions:u("Enter a description for this permission."),type:K.Textarea,rows:4,flags:[]},value:a,updateValue:y=>c(y)}),e.jsx("hr",{}),e.jsx(n1,{children:d.map(y=>e.jsx(s1,{item:y,updateValue:b},y.id))})]})})})]})]})},hn={all:["surveys","results"],single:t=>[...hn.all,t],preferences:t=>[...hn.single(t),"preferences"],chart:t=>[...hn.single(t),"chart"]},ca=()=>{const{handle:t}=V();return B({queryKey:hn.single(t),queryFn:()=>T.get(`/api/surveys/form/${t}`).then(n=>n.data),staleTime:1/0,enabled:!!t})},i1=()=>{const{handle:t}=V();return B({queryKey:hn.preferences(t),queryFn:()=>T.get(`/api/surveys/preferences/${t}`).then(n=>n.data),staleTime:1/0})},o1=()=>{const{handle:t}=V();return B({queryKey:hn.chart(t),queryFn:()=>T.get(`/api/surveys/chart/${t}`).then(n=>n.data),staleTime:1/0})},r1=l.div`
  position: relative;
`,a1=l.h1`
  position: absolute;
  top: ${m.md};
  left: ${m.xl};

  font-size: 40px;
  user-select: none;
  pointer-events: none;
`,l1=l.div`
  margin-top: -3px;
  height: 20px;
  background: linear-gradient(
    to bottom,
    ${({$color:t})=>`${t}1A 30%, transparent 100%`}
  );
`,ok=l.div`
  padding: ${m.sm} ${m.md};
  background-color: white;
  border: 2px solid ${({$color:t})=>t};
`,rk=()=>{const{data:t,isFetching:n}=ca(),{data:s,isFetching:i}=o1();if(i||n)return null;const{form:{id:o,name:r,color:a}}=t,c=({active:p,payload:x})=>{if(p&&x&&x.length){const{payload:{name:f,y:b}}=x[0];return e.jsxs(ok,{$color:a,children:[f,": ",e.jsx("b",{children:b})," submissions"]})}},d=Math.max(...s.map(p=>p.y))*2;return e.jsxs(r1,{$color:a,children:[e.jsx(a1,{children:r}),e.jsx(nt,{width:"100%",height:80,children:e.jsxs(yt,{data:s,margin:{top:0,left:0,right:0,bottom:3},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${o}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:a,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:a,stopOpacity:.1})]})}),e.jsx(vt,{type:"monotone",dataKey:"y",stroke:a,strokeWidth:1,strokeOpacity:1,fillOpacity:1,isAnimationActive:!1,fill:`url(#color${o})`}),d>0&&e.jsx(_o,{domain:[0,d],hide:!0}),e.jsx(Wo,{content:e.jsx(c,{})})]})}),e.jsx(l1,{$color:a})]})};var ht=(t=>(t.Horizontal="Horizontal",t.Vertical="Vertical",t.Pie="Pie",t.Donut="Donut",t.Hidden="Hidden",t.Text="Text",t))(ht||{});const ak=t=>e.jsx(R,{height:"16",width:"16",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"})}),lk=({fieldId:t,chartType:n})=>{const s={fieldId:t,chartType:n};return T.post("/api/surveys/preferences",s)},ck=()=>le({mutationFn:lk}),dk=l.div`
  grid-area: settings;

  position: relative;
`,c1=l.button`
  display: block;

  width: 100%;
  padding: 5px 12px;

  border-radius: 4px;
  color: #ced6df;

  transition: all 0.2s ease-out;

  &:hover,
  &.open {
    background-color: #c8cfd5;
    color: #ffffff;
  }

  &.open {
    border-radius: 4px 4px 0 0;
  }

  @keyframes rotator {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  &.loading svg {
    animation-name: rotator;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
`,uk=l.div`
  position: absolute;
  left: 0;
  top: 26px;
  z-index: 2;

  width: 150px;
  overflow: hidden;

  border-radius: 0 5px 5px 5px;
  border: 1px solid #e0e2e6;
  background: #ffffff;

  box-shadow: rgba(17, 17, 26, 0.1) 5px 5px 8px;
`,pk=l.a`
  display: block;
  padding: 3px 10px;

  background-color: #ffffff;
  color: #000000 !important;
  font-size: 12px;

  transition: background-color 0.2s ease-out;

  &.selected {
    background-color: #f3f7fd;
  }

  &:hover {
    background-color: #d8dce1;
    text-decoration: none;
  }
`,hk=Object.keys(ht),ec=({fieldId:t,selectedChartType:n,isShown:s,toggle:i,changeType:o})=>{const{mutate:r,isPending:a}=ck();return e.jsxs(c1,{className:E(a&&"loading",s&&"open"),onClick:i,children:[e.jsx(ak,{}),s&&e.jsx(uk,{children:hk.map(c=>e.jsx(pk,{className:n===c&&"selected",onClick:()=>{o(c),r({fieldId:t,chartType:c})},children:c},c))})]})},xk=l.li`
  display: grid;
  grid-template-columns: 42px auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    'bulletin label'
    'settings numbers';
  gap: 10px;

  &:not(:last-child) {
    margin-bottom: 42px;
  }
`,mk=l.div`
  grid-area: bulletin;

  padding-top: 5px;

  background-color: #f3f7fd;
  border-radius: 4px;

  color: #df2733;
  text-align: center;
  font-size: 24px;
  font-weight: bold;

  &:hover {
    transition: background-color 0.2s ease-out;
    background-color: #e0e4e9;
  }

  span {
    white-space: nowrap;
  }

  svg {
    display: block;

    margin: 3px auto;

    width: 28px;
  }
`,gk=l.div`
  grid-area: label;
`,fk=l.div`
  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 24px;
  font-weight: bold;

  margin: 5px 0 8px;

  svg {
    width: 30px;
    height: 30px;
  }
`,bk=l.div`
  position: relative;

  font-size: 12px;
  color: #ccc;
`,jk=l.div`
  position: absolute;
  right: 0;
  top: 0;
`,yk=l.div`
  grid-area: numbers;
`,vk=l.li`
  position: relative;

  padding: 3px 0;
  margin-bottom: 42px;

  background: #f3f7fd;
  text-align: center;
  font-size: 12px;

  ${c1} {
    position: absolute;
    left: 0;
    top: 0;

    width: 40px;
  }
`,wk=(t,n,s=1)=>n(t).replace(/rgb\((\d+, \d+, \d+)\)/i,`rgba($1, ${s})`),$k=t=>{const n=Math.max(0,Math.min(1,t)),s=Math.max(0,Math.min(255,Math.round(34.61+n*(1172.33-n*(10793.56-n*(33300.12-n*(38394.49-n*14825.05))))))),i=Math.max(0,Math.min(255,Math.round(23.31+n*(557.33+n*(1225.33-n*(3574.96-n*(1073.77+n*707.56))))))),o=Math.max(0,Math.min(255,Math.round(27.2+n*(3211.1-n*(15327.97-n*(27814-n*(22569.18-n*6838.66)))))));return`rgb(${s}, ${i}, ${o})`},tc=Math.PI/180,d1=({breakdown:t,pie:n})=>{const s=t.filter(({votes:r})=>r>0),i=t.map(({ranking:r})=>wk(r/t.length,$k)),o=({cx:r,cy:a,midAngle:c,outerRadius:d,percent:p,index:x})=>{const f=d+30,b=r+f*Math.cos(-c*tc),j=a+f*Math.sin(-c*tc);return e.jsxs("text",{x:b,y:j,fill:"black",textAnchor:b>r?"start":"end",dominantBaseline:"central",children:[e.jsx("tspan",{style:{fontWeight:"bold"},children:s[x].label}),e.jsxs("tspan",{style:{fontSize:"12px",fill:"#999"},children:[" ","(",`${(p*100).toFixed(0)}%`,")"]})]},x)};return e.jsx("div",{style:{width:800},children:e.jsx(nt,{width:"100%",height:400,children:e.jsx(V1,{children:e.jsx(G1,{data:s,dataKey:"votes",nameKey:"label",cx:"50%",cy:"50%",outerRadius:180,innerRadius:n?0:100,fill:"#82ca9d",labelLine:!0,label:o,children:s.map((r,a)=>e.jsx(Y1,{fill:i[a]},`cell-${a}`))})})})})},Ck=()=>e.jsx("div",{children:"hidden"}),kk=l.div`
  display: grid;
  gap: 2px;
  grid-template-columns: auto 100px 50px;
  grid-template-rows: auto auto;
  grid-template-areas:
    'label votes percentage'
    'graph graph graph';

  &:not(:last-child) {
    margin-bottom: 10px;
  }
`,Sk=l.div`
  grid-area: label;

  font-weight: bold;
`,Lk=l.div`
  grid-area: percentage;

  font-size: 14px;
  font-weight: bold;
  text-align: right;
`,Fk=l.div`
  grid-area: votes;

  color: #c2c5c7;
  font-size: 12px;
  text-align: right;
`,Ek=l.div`
  grid-area: graph;

  position: relative;
  overflow: hidden;

  height: 20px;

  border-radius: 3px;
  background: #f3f7fd;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;

    display: block;

    width: ${({percentage:t})=>t}%;
    height: 100%;

    background: ${({ranking:t})=>t===1?"var(--highlight)":"#33414d"};
  }
`,Tk=({breakdown:t})=>e.jsx(e.Fragment,{children:t.map(({label:n,value:s,votes:i,percentage:o,ranking:r})=>e.jsxs(kk,{children:[e.jsx(Sk,{children:n}),e.jsxs(Fk,{children:[i," ",u("resp.")]}),e.jsxs(Lk,{children:[Math.round(o),"%"]}),e.jsx(Ek,{percentage:o,ranking:r})]},s.toString()))}),Nk=({breakdown:t})=>e.jsx(d1,{breakdown:t,pie:!0}),zk=l.div``,Mk=l.div`
  padding: 10px 15px;

  &:not(:last-child) {
    border-bottom: 1px solid #eff3f6;
  }
`,Ik=({breakdown:t})=>e.jsx(zk,{children:t.map(n=>e.jsxs(Mk,{children:[n.label,n.votes>1&&` (${n.votes})`]},n.value.toString()))}),Ak=l.div`
  width: 900px;
  overflow-x: auto;

  ${Q};
`,Rk=l.div`
  display: grid;
  gap: 10px;
  grid-auto-columns: minmax(80px, 1fr);
  grid-auto-flow: column;
`,Pk=l.div`
  display: flex;
  flex-direction: column;

  text-align: center;
`,Dk=l.div`
  padding: 10px;

  font-size: 16px;
  font-weight: bold;
`,Bk=l.div`
  flex-basis: 40px;
  padding: 10px;

  font-weight: bold;
  font-size: 16px;

  box-sizing: border-box;
`,Ok=l.div`
  flex-basis: 30px;

  color: #c2c5c7;

  font-size: 12px;
  line-height: 12px;

  span {
    display: block;
  }
`,_k=l.div`
  position: relative;
  overflow: hidden;

  flex-basis: 250px;

  border-radius: 3px;
  background: #f3f7fd;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    display: block;

    width: 100%;
    height: ${({percentage:t})=>t}%;

    background: ${({ranking:t})=>t===1?"var(--highlight)":"#33414d"};
  }
`,Wk=({breakdown:t})=>e.jsx(Ak,{children:e.jsx(Rk,{count:t.length,children:t.map(({label:n,value:s,votes:i,percentage:o,ranking:r})=>e.jsxs(Pk,{children:[e.jsxs(Bk,{children:[Math.round(o),"%"]}),e.jsxs(Ok,{children:[i," ",u("resp.")]}),e.jsx(_k,{percentage:o,ranking:r}),e.jsx(Dk,{children:n})]},s.toString()))})}),Uk=Object.freeze(Object.defineProperty({__proto__:null,Donut:d1,Hidden:Ck,Horizontal:Tk,Pie:Nk,Text:Ik,Vertical:Wk},Symbol.toStringTag,{value:"Module"})),Hk=l.div`
  margin-top: 10px;

  color: #cf4041;
  font-size: 16px;
`,qk=l.span`
  font-weight: bold;
`,Qk=l.span`
  color: #a4a6aa;
`,Kk=({average:t,max:n})=>t===null||n===null?null:e.jsxs(Hk,{children:[u("Average"),": ",e.jsx(qk,{children:t})," ",e.jsxs(Qk,{children:["/ ",n]})]}),Vk=[ht.Hidden,ht.Text],Gk=({field:t,responses:n,breakdown:s,skipped:i,bulletin:o,average:r,max:a})=>{const c=Me(t.class),[d,p]=g.useState(ht.Horizontal),[x,f]=g.useState(!1),{data:b}=i1(),j=g.useRef(null);if(g.useEffect(()=>{if(b){let v=b.fieldSettings.find($=>$.id===t.id)?.chartType;v===void 0&&(v=b.chartDefaults?.[t.class]||ht.Horizontal),p(v)}else p(ht.Horizontal)},[b,t]),g.useEffect(()=>{Vk.includes(d)},[d]),!b)return null;const{permissions:y}=b,w=Uk[d];return d===ht.Hidden?e.jsxs(vk,{children:[y.reports&&e.jsx(ec,{fieldId:t.id,selectedChartType:d,isShown:x,toggle:()=>f(!x),changeType:v=>p(v)}),"--"," ",e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Question <b>{index}</b> Hidden",{index:o}))}})," ","--"]}):e.jsxs(xk,{ref:j,"data-chart-id":t.id,children:[e.jsx(mk,{children:e.jsx("span",{children:o})}),e.jsxs(gk,{children:[e.jsxs(fk,{children:[c&&e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c.icon)}}),t.label]}),e.jsxs(bk,{children:[u("{answered} answered, {skipped} skipped",{answered:n-i,skipped:i}),t.multiChoice&&e.jsx(jk,{children:u("multiple choice")})]}),e.jsx(Kk,{average:r,max:a})]}),e.jsx(dk,{children:y.reports&&e.jsx(ec,{fieldId:t.id,selectedChartType:d,isShown:x,toggle:()=>f(!x),changeType:v=>p(v)})}),e.jsx(yk,{children:e.jsx(w,{breakdown:s})})]})},u1=l.ul`
  display: block;

  padding: ${m.xl};
`,Yk=l.div`
  display: flex;
  justify-content: space-between;
`,p1=l.div`
  position: relative;

  display: block;
  padding: 0 0 30px;

  color: #3f4d5a;
  font-size: 1.5rem;
  font-weight: normal;

  small {
    color: #bbbdbe;
    padding-left: ${m.md};
  }
`,Jk=()=>{const t=g.useRef(null),{data:n,isFetching:s}=ca();if(s)return"Loading...";const i=async()=>{if(!n||!t.current)return;const o=await J1(t.current,{cacheBust:!0,fontEmbedCSS:""}),r=me("/export/surveys/pdf"),a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({[Craft.csrfTokenName]:Craft.csrfTokenValue,image:o})});if(!a.ok){const y=await a.text();throw new Error(y)}const c=await a.blob(),d=window.URL||window.webkitURL,p=d.createObjectURL(c),x=document.createElement("a");x.href=p;const f=a.headers.get("Content-Disposition")||"",b=/filename\*?=(?:UTF-8'')?["']?([^"';\s]+)["']?/i.exec(f),j=b?.[1]?decodeURIComponent(b[1]):"survey-results.pdf";x.download=j,document.body.appendChild(x),x.click(),x.remove(),setTimeout(()=>d.revokeObjectURL(p),1e3)};return e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"survey-list",label:n.form.name,url:`/surveys/${n.form.handle}`}),e.jsxs(u1,{ref:t,children:[e.jsxs(Yk,{children:[e.jsxs(p1,{children:[u("{count} Responses",{count:n.form.submissions}),e.jsxs("small",{children:["(",u("{count} questions",{count:n.results.length}),")"]})]}),e.jsx("button",{type:"button",className:"btn",onClick:i,children:u("Export as PDF")})]}),n.results.map((o,r)=>e.jsx(Gk,{...o,responses:n.form.submissions,bulletin:r+1},o.field.id))]})]})},Zk=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Xk=ts(0,60).map(t=>({name:"",y:t>30?Zk(0,Math.random()>.5?4:1):0})),eS=()=>{const t="#cccccc";return e.jsxs(r1,{$color:t,children:[e.jsx(a1,{children:e.jsx(J,{loading:!0,instant:!0,xl:!0,children:u("Loading")})}),e.jsx(nt,{width:"100%",height:80,children:e.jsxs(yt,{data:Xk,margin:{top:30,left:0,right:0,bottom:3},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"color",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.1})]})}),e.jsx(vt,{type:"monotone",dataKey:"y",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,isAnimationActive:!1,fill:"url(#color)"})]})}),e.jsx(l1,{$color:t})]})},h1=l.div`
  --highlight: ${({$highlightHighest:t})=>t?"#e02e39":"#33414d"};

  padding-bottom: 50px;
  margin-bottom: 30px;
`,tS=()=>e.jsxs(He,{style:{padding:0},children:[e.jsx(eS,{}),e.jsx(h1,{children:e.jsx(u1,{children:e.jsxs(p1,{children:[e.jsx(k,{width:300,inline:!0}),e.jsx("small",{children:e.jsx(k,{width:100})})]})})})]}),nS=()=>{const{data:t,isFetching:n}=o1(),{data:s,isFetching:i}=i1(),{data:o,isFetching:r}=ca(),a=(n||i||r)&&(!t||!s||!o);return e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"survey-results",label:u("Surveys & Polls"),url:"/forms"}),a&&e.jsx(tS,{}),!a&&e.jsx("div",{id:"content",className:"content-pane",style:{padding:0},children:e.jsxs(h1,{$highlightHighest:!0,children:[e.jsx(rk,{}),e.jsx(Jk,{})]})})]})},sS=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"})}),iS=()=>{const t=Y({from:{opacity:0,scale:0},to:{opacity:1,scale:1}}),n=pt(),s=Y({ref:n,from:{opacity:0,scale:0},to:{opacity:1,scale:1},config:{tension:300}}),i=pt(),o=Xi(5,{ref:i,from:{opacity:0,x:-30,y:10},to:{opacity:1,x:0,y:0},config:{tension:300}}),r=pt(),a=Y({ref:r,from:{opacity:0,scale:0,x:-30,y:10},to:{opacity:1,scale:1,x:0,y:0},config:{tension:200}}),c=pt(),d=Y({ref:c,from:{opacity:0,scale:.6,x:30,y:-40},to:{opacity:1,scale:1,x:0,y:0},config:{tension:130}}),p=pt(),x=Xi(8,{ref:p,from:{opacity:0,scale:1.05},to:{opacity:1,scale:1}});return gc([n,i,r,c,p],[0,.8,.6,1,.8]),{background:t,border:s,lines:o,check:a,pencil:d,letters:x}},Ft=l(_.path)`
  transform-origin: 54px;
`,oS=()=>{const{border:t,lines:n,check:s,pencil:i,letters:o}=iS();return e.jsxs("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",x:"0",y:"0",width:"581",height:"121",viewBox:"0, 0, 581, 121",children:[e.jsx("title",{children:"Logo"}),e.jsxs("g",{children:[e.jsx(_.path,{style:o[0],d:"M137.033,21 L137.033,97.284 L153.807,97.284 L153.807,65.766 L185.752,65.766 L185.752,52.732 L153.807,52.732 L153.807,35.103 L190.667,35.103 L190.667,21 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[1],d:"M196.65,42.047 L196.65,97.284 L211.821,97.284 L211.821,72.39 Q211.821,68.651 212.569,65.445 Q213.317,62.24 215.08,59.836 Q216.842,57.432 219.727,56.044 Q222.612,54.655 226.779,54.655 Q228.167,54.655 229.663,54.815 Q231.159,54.975 232.227,55.189 L232.227,41.086 Q230.411,40.552 228.915,40.552 Q226.031,40.552 223.36,41.406 Q220.689,42.261 218.338,43.81 Q215.988,45.36 214.171,47.55 Q212.355,49.74 211.287,52.304 L211.073,52.304 L211.073,42.047 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[2],d:"M273.468,63.736 L248.788,63.736 Q248.894,62.133 249.482,60.103 Q250.07,58.074 251.512,56.257 Q252.954,54.441 255.358,53.212 Q257.762,51.984 261.395,51.984 Q266.95,51.984 269.675,54.975 Q272.399,57.967 273.468,63.736 z M248.788,73.352 L288.639,73.352 Q289.066,66.941 287.571,61.065 Q286.075,55.189 282.709,50.595 Q279.344,46.001 274.109,43.276 Q268.874,40.552 261.822,40.552 Q255.518,40.552 250.337,42.795 Q245.155,45.039 241.416,48.939 Q237.676,52.838 235.646,58.18 Q233.616,63.522 233.616,69.719 Q233.616,76.129 235.593,81.471 Q237.569,86.813 241.202,90.66 Q244.834,94.506 250.07,96.589 Q255.305,98.673 261.822,98.673 Q271.224,98.673 277.848,94.399 Q284.472,90.126 287.677,80.189 L274.322,80.189 Q273.574,82.754 270.262,85.051 Q266.95,87.348 262.356,87.348 Q255.946,87.348 252.527,84.036 Q249.108,80.724 248.788,73.352 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[3],d:"M334.794,63.736 L310.114,63.736 Q310.221,62.133 310.808,60.103 Q311.396,58.074 312.838,56.257 Q314.281,54.441 316.684,53.212 Q319.088,51.984 322.721,51.984 Q328.277,51.984 331.001,54.975 Q333.725,57.967 334.794,63.736 z M310.114,73.352 L349.965,73.352 Q350.392,66.941 348.897,61.065 Q347.401,55.189 344.035,50.595 Q340.67,46.001 335.435,43.276 Q330.2,40.552 323.148,40.552 Q316.845,40.552 311.663,42.795 Q306.481,45.039 302.742,48.939 Q299.002,52.838 296.972,58.18 Q294.942,63.522 294.942,69.719 Q294.942,76.129 296.919,81.471 Q298.896,86.813 302.528,90.66 Q306.161,94.506 311.396,96.589 Q316.631,98.673 323.148,98.673 Q332.55,98.673 339.174,94.399 Q345.798,90.126 349.004,80.189 L335.649,80.189 Q334.901,82.754 331.589,85.051 Q328.277,87.348 323.682,87.348 Q317.272,87.348 313.853,84.036 Q310.434,80.724 310.114,73.352 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[4],d:"M362.252,52.197 L362.252,97.284 L377.423,97.284 L377.423,52.197 L387.893,52.197 L387.893,42.047 L377.423,42.047 L377.423,38.735 Q377.423,35.317 378.759,33.874 Q380.094,32.432 383.192,32.432 Q386.077,32.432 388.748,32.752 L388.748,21.427 Q386.825,21.321 384.795,21.16 Q382.765,21 380.735,21 Q371.44,21 366.846,25.701 Q362.252,30.402 362.252,37.774 L362.252,42.047 L353.17,42.047 L353.17,52.197 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[5],d:"M405.842,69.719 Q405.842,66.407 406.484,63.202 Q407.125,59.997 408.674,57.539 Q410.223,55.082 412.787,53.533 Q415.351,51.984 419.197,51.984 Q423.044,51.984 425.661,53.533 Q428.279,55.082 429.828,57.539 Q431.377,59.997 432.018,63.202 Q432.659,66.407 432.659,69.719 Q432.659,73.031 432.018,76.183 Q431.377,79.335 429.828,81.845 Q428.279,84.356 425.661,85.852 Q423.044,87.348 419.197,87.348 Q415.351,87.348 412.787,85.852 Q410.223,84.356 408.674,81.845 Q407.125,79.335 406.484,76.183 Q405.842,73.031 405.842,69.719 z M390.671,69.719 Q390.671,76.343 392.701,81.685 Q394.731,87.027 398.471,90.82 Q402.21,94.613 407.445,96.643 Q412.68,98.673 419.197,98.673 Q425.715,98.673 431.003,96.643 Q436.292,94.613 440.031,90.82 Q443.771,87.027 445.801,81.685 Q447.831,76.343 447.831,69.719 Q447.831,63.095 445.801,57.7 Q443.771,52.304 440.031,48.511 Q436.292,44.719 431.003,42.635 Q425.715,40.552 419.197,40.552 Q412.68,40.552 407.445,42.635 Q402.21,44.719 398.471,48.511 Q394.731,52.304 392.701,57.7 Q390.671,63.095 390.671,69.719 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[6],d:"M454.455,42.048 L454.455,97.284 L469.626,97.284 L469.626,72.39 Q469.626,68.651 470.374,65.445 Q471.122,62.24 472.885,59.836 Q474.647,57.432 477.532,56.044 Q480.417,54.655 484.584,54.655 Q485.973,54.655 487.468,54.815 Q488.964,54.975 490.032,55.189 L490.032,41.086 Q488.216,40.552 486.72,40.552 Q483.836,40.552 481.165,41.406 Q478.494,42.261 476.143,43.81 Q473.793,45.36 471.976,47.55 Q470.16,49.74 469.092,52.304 L468.878,52.304 L468.878,42.048 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[7],d:"M495.374,42.048 L495.374,97.284 L510.546,97.284 L510.546,65.232 Q510.546,61.172 511.721,58.661 Q512.896,56.15 514.552,54.815 Q516.208,53.479 517.971,52.999 Q519.734,52.518 520.802,52.518 Q524.435,52.518 526.305,53.746 Q528.174,54.975 528.976,57.005 Q529.777,59.035 529.884,61.439 Q529.991,63.843 529.991,66.3 L529.991,97.284 L545.162,97.284 L545.162,66.514 Q545.162,63.95 545.536,61.439 Q545.91,58.928 547.032,56.952 Q548.153,54.975 550.13,53.746 Q552.107,52.518 555.312,52.518 Q558.517,52.518 560.387,53.586 Q562.256,54.655 563.218,56.471 Q564.179,58.287 564.393,60.745 Q564.607,63.202 564.607,65.98 L564.607,97.284 L579.778,97.284 L579.778,60.317 Q579.778,54.975 578.282,51.182 Q576.787,47.39 574.116,45.039 Q571.445,42.689 567.705,41.62 Q563.966,40.552 559.585,40.552 Q553.816,40.552 549.596,43.33 Q545.376,46.107 542.918,49.74 Q540.675,44.612 536.348,42.582 Q532.021,40.552 526.785,40.552 Q521.337,40.552 517.116,42.902 Q512.896,45.253 509.905,49.526 L509.691,49.526 L509.691,42.048 z",fill:"#058FFE"})]}),e.jsxs("g",{id:"Icon",children:[e.jsx(Ft,{d:"M37.733,7.573 C55.513,2.825 47.779,4.886 60.934,1.383 C80.646,-3.783 84.832,11.631 86.256,16.656 C87.101,19.715 87.92,22.783 88.745,25.849 L85.369,38.445 C83.528,31.673 81.754,24.879 79.792,18.139 C76.822,8.231 72.783,5.365 62.066,7.864 C51.792,10.635 21.478,18.709 17.585,19.799 C11.439,21.553 4.764,24.906 7.901,37.117 C11.018,48.771 19.883,81.843 25.077,101.227 C28.75,115.347 36.616,113.524 42.797,112.213 C48.227,110.805 80.511,102.152 87.394,100.239 C97.952,97.304 99.482,91.737 96.984,82.088 L96.172,79.022 L99.583,66.297 C100.842,71.007 102.101,75.718 103.362,80.43 C108.373,99.17 97.473,104.01 88.881,106.717 C84.227,107.978 61.961,113.94 44.895,118.509 C24.877,123.994 20.294,108.418 18.819,103.009 C17.345,97.601 5.001,51.486 1.65,38.898 C-3.671,19.308 11.334,14.782 15.79,13.503 C23.093,11.484 30.416,9.537 37.733,7.573 z",fill:"#058FFE",id:"border",style:t}),e.jsx(Ft,{d:"M104.977,7.117 C108.112,7.879 110.08,10.598 109.31,13.474 C108.542,16.35 91.847,77.975 91.847,77.975 L91.847,77.975 C89.16,81.646 86.473,85.314 83.803,88.997 C83.337,89.641 82.479,89.421 82.424,88.571 L80.556,74.918 C80.556,74.918 97.237,13.309 98.025,10.419 C98.816,7.528 101.842,6.355 104.977,7.117 z",fill:"#FF6624",id:"Pencil",style:i}),e.jsx(Ft,{d:"M38.47,86.147 L49.9,83.086 C52.694,82.336 55.566,83.996 56.316,86.791 L56.662,88.087 C57.412,90.881 55.754,93.755 52.959,94.503 L41.53,97.567 C38.735,98.314 35.863,96.656 35.113,93.861 L34.767,92.564 C34.017,89.769 35.675,86.897 38.47,86.147 z",fill:"#058FFE",style:n[4],id:"line-5"}),e.jsx(Ft,{d:"M47.091,29.664 L67.805,24.115 C69.255,23.726 70.748,24.588 71.137,26.038 L71.137,26.038 C71.526,27.491 70.665,28.982 69.212,29.371 L48.5,34.919 C47.048,35.309 45.557,34.449 45.168,32.997 L45.168,32.997 C44.779,31.546 45.64,30.053 47.091,29.664 z",fill:"#058FFE",style:n[0],id:"line-1"}),e.jsx(Ft,{d:"M50.488,42.34 L71.2,36.789 C72.653,36.4 74.144,37.262 74.533,38.714 L74.533,38.714 C74.922,40.165 74.06,41.656 72.61,42.045 L51.896,47.596 C50.445,47.985 48.952,47.123 48.563,45.673 L48.563,45.673 C48.176,44.22 49.036,42.729 50.488,42.34 z",fill:"#058FFE",style:n[1],id:"line-2"}),e.jsx(Ft,{d:"M29.263,61.61 L74.5,49.49 C75.975,49.095 77.484,49.95 77.873,51.403 L77.873,51.403 C78.262,52.853 77.382,54.35 75.908,54.745 L30.673,66.865 C29.198,67.261 27.686,66.405 27.297,64.955 L27.297,64.955 C26.908,63.502 27.79,62.005 29.263,61.61 z",fill:"#058FFE",style:n[2],id:"line-3"}),e.jsx(Ft,{d:"M78.949,61.938 L79.149,62.052 L77.635,67.703 L34.027,79.387 C32.553,79.782 31.041,78.926 30.652,77.474 C30.263,76.024 31.143,74.526 32.618,74.131 L77.855,62.009 L78.949,61.938 z",fill:"#058FFE",style:n[3],id:"line-4"}),e.jsx(_.path,{d:"M34.899,32.962 C36.525,32.528 38.197,33.492 38.633,35.119 L41.886,47.264 C42.322,48.889 41.357,50.561 39.731,50.997 L27.587,54.25 C25.959,54.686 24.289,53.721 23.853,52.095 L20.598,39.951 C20.162,38.323 21.127,36.653 22.753,36.217 L34.899,32.962 z M33.61,37.352 L26.065,39.372 C25.252,39.59 24.769,40.427 24.987,41.24 L27.008,48.785 C27.226,49.598 28.063,50.081 28.876,49.863 L36.419,47.84 C37.234,47.622 37.716,46.787 37.498,45.974 L35.476,38.429 C35.258,37.616 34.423,37.134 33.61,37.352 z",fill:"#058FFE",id:"check",style:s})]})]})},rS=()=>{const t=Y({from:{opacity:0,scale:.5},to:{opacity:1,scale:1},delay:1e3}),n=pt(),s=Y({ref:n,from:{opacity:0,y:10},to:{opacity:1,y:0},delay:1e3}),i=pt(),o=Y({ref:i,from:{opacity:0,y:10},to:{opacity:1,y:0}}),r=pt(),a=Xi(4,{ref:r,from:{opacity:0,y:20},to:{opacity:1,y:0}});return gc([n,i,r],[0,2,2.2]),{installed:{icon:t,text:s},extra:o,buttons:a}},aS=l.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  height: 80vh;
  padding: 40px;

  background-color: ${h.white};
  border-radius: ${S.lg};
  box-shadow: ${re.panel}, ${re.box};
`,lS=l.div``,cS=l.div`
  display: flex;
  align-items: center;
  gap: ${m.sm};

  margin-top: 20px;

  font-size: 22px;
  fill: ${h.teal500};
`,dS=l(_.div)`
  font-size: 30px;
`,uS=l(_.div)``,pS=l(_.div)`
  max-width: 60%;
  margin-top: 20px;

  color: ${h.gray400};
  font-style: italic;
  text-align: center;
`,hS=l.div`
  display: flex;
  justify-content: center;
  gap: ${m.sm};

  margin-top: 40px;
`,Rs=l(_.div)`
  a {
    color: inherit;
    text-decoration: none;
  }
`,xS=()=>{const{installed:t,extra:n,buttons:s}=rS();return e.jsxs(aS,{children:[e.jsx(q,{id:"welcome",label:"Welcome",url:"/forms"}),e.jsx(lS,{children:e.jsx(oS,{})}),e.jsxs(cS,{children:[e.jsx(dS,{style:t.icon,children:e.jsx(sS,{})}),e.jsx(uS,{style:t.text,children:e.jsx("span",{children:u("Awesome! Freeform is successfully installed!")})})]}),e.jsx(pS,{style:n,children:u("Thanks for choosing Freeform! Craft will automatically set you up with the free Express edition. If you're excited to explore even more features, consider switching to the Lite or Pro edition! We've included some helpful links below to get you started. Enjoy!")}),e.jsxs(hS,{children:[e.jsx(Rs,{style:s[0],className:"btn",children:e.jsx(he,{to:"/forms",children:u("Create Forms")})}),e.jsx(Rs,{style:s[2],className:"btn",children:e.jsx("a",{href:me("/settings/demo-templates"),children:u("Install Demo")})}),e.jsx(Rs,{style:s[1],className:"btn",children:e.jsx("a",{href:"https://docs.solspace.com/craft/freeform/v5/guides/getting-started/",children:u("Getting Started")})}),e.jsx(Rs,{style:s[1],className:"btn submit",children:e.jsx("a",{href:me("/settings"),children:u("Configure Freeform")})})]})]})},mS=Qo`
  #main-content {
    padding: 0;
  }

  footer#global-footer {
    display: none;
  }

  ul#crumb-list {
    li.crumb {
      > button {
        z-index: 2;
      }

      &:after {
        z-index: 1;
      }
    }
  }
`,nc="#cccccc",Ps="3px",gS=Qo`
  .opinion-scale {
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .opinion-scale-scales {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      grid-gap: 0;
      align-items: stretch;

      > li {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        border: 1px solid ${nc};
        border-left: none;

        > label {
          display: block;
          padding: 6px 12px;
          margin: 0;

          text-align: center;
          color: black !important;
          cursor: pointer;
        }

        input {
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          visibility: hidden;

          &:checked ~ label {
            background: #e6e6e6;
          }
        }

        &:first-child {
          border-left: 1px solid ${nc};

          border-top-left-radius: ${Ps};
          border-bottom-left-radius: ${Ps};
        }

        &:last-child {
          border-top-right-radius: ${Ps};
          border-bottom-right-radius: ${Ps};
        }
      }
    }

    ul.opinion-scale-legends {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      grid-gap: 0;

      li {
        text-align: center;
      }

      li:first-child {
        text-align: left;
      }

      li:last-child {
        text-align: right;
      }
    }
  }
`,fS=()=>e.jsxs(e.Fragment,{children:[e.jsx(mS,{}),e.jsx(gS,{})]}),bS=new URLSearchParams(window.location.search),sc=bS.get("mode")==="debug",jS={blue:"color: #068FFE",reset:""},ic=new Proxy(console,{get:(t,n)=>n==="colors"?jS:n==="dbg"?sc?(...s)=>{t.log("🀄️🔆🔆🔆🀄️",...s)}:()=>{}:typeof t[n]=="function"&&!sc?()=>{}:t[n]}),yS=document.getElementById("freeform-client"),vS=hc.createRoot(yS);ic.log(`%c
  ███████╗██████╗ ███████╗███████╗███████╗ ██████╗ ██████╗ ███╗   ███╗
  ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║
  █████╗  ██████╔╝█████╗  █████╗  █████╗  ██║   ██║██████╔╝██╔████╔██║
  ██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║
  ██║     ██║  ██║███████╗███████╗██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
`,ic.colors.blue);vS.render(e.jsx(Z1,{backend:X1,children:e.jsx(e0,{basename:me("/",!1),children:e.jsx(t0,{client:C0,children:e.jsx(c0,{children:e.jsx(g0,{children:e.jsx(b0,{children:e.jsx(x0,{children:e.jsx(n0,{store:zh,children:e.jsx(S0,{children:e.jsxs(Lc,{children:[e.jsx(q,{id:"root",label:"Freeform",url:"/forms"}),e.jsx(fS,{}),null,e.jsx(m0,{}),e.jsx(mc,{children:e.jsxs(U,{path:"/",element:e.jsx(Qh,{}),children:[e.jsxs(U,{path:"forms",children:[e.jsx(U,{path:":formId/*",element:e.jsx(z9,{})}),e.jsx(U,{index:!0,element:e.jsx(Zw,{})})]}),e.jsx(U,{path:"/surveys/:handle",element:e.jsx(nS,{})}),e.jsx(U,{path:"welcome",element:e.jsx(xS,{})}),e.jsxs(U,{path:"integrations",element:e.jsx(lC,{}),children:[e.jsx(U,{index:!0,element:e.jsx(WC,{})}),e.jsx(U,{path:":type/:integration/:id?",element:e.jsx(_C,{})})]}),e.jsx(U,{path:"settings/ai",element:e.jsx(ym,{})}),e.jsxs(U,{path:"import",element:e.jsx(Bl,{}),children:[e.jsx(U,{path:"forms",element:e.jsx(H$,{})}),e.jsx(U,{path:"express-forms",element:e.jsx(B$,{})}),e.jsx(U,{path:"formie/v3",element:e.jsx(_$,{})})]}),e.jsx(U,{path:"export",element:e.jsx(Bl,{}),children:e.jsx(U,{path:"forms",element:e.jsx(A$,{})})}),e.jsxs(U,{path:"settings/limited-users",children:[e.jsx(U,{path:":id",element:e.jsx(ik,{})}),e.jsx(U,{index:!0,element:e.jsx(XC,{})})]}),e.jsx(U,{path:"ab-tests",element:e.jsx(I2,{})})]})})]})})})})})})})})})}));export{Sa as S,Y2 as U,io as a,Td as b,h as c,u as t};
