const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./ai.usage-chart-D9Y8f6Xf.js","./vendor-D8V7Vhm6.js","./date-fns-BTAAV4UA.js","./vendor-BOeeMEG-.css"])))=>i.map(i=>d[i]);
import{u as Ht,a as ne,r as g,j as e,c as l,b as Do,L as rt,d as _,e as Y,f as oc,g as Mt,Q as f1,h as b1,i as Se,k as T,l as X,v as G,m as Bo,n as rc,o as j1,p as qt,q as ac,s as P,t as B,w as V,x as ee,O as jt,y as Oo,R as nt,z as y1,C as lc,X as cc,Y as _o,T as Wo,A as v1,B as se,D as O,E as dc,_ as Pn,F as w1,G as oe,H as Uo,I as ce,J as Ho,S as k,K as Qt,M as $1,N as C1,P as k1,U as S1,V as L1,W as F1,Z as E1,$ as T1,a0 as N1,a1 as z1,a2 as M1,a3 as I1,a4 as A1,a5 as R1,a6 as P1,a7 as D1,a8 as B1,a9 as O1,aa as _1,ab as yt,ac as vt,ad as W1,ae as st,af as uc,ag as Ds,ah as pc,ai as Ne,aj as U1,ak as hc,al as xc,am as H1,an as qo,ao as ss,ap as Xs,aq as he,ar as q1,as as Q1,at as mc,au as U,av as Qo,aw as K1,ax as V1,ay as G1,az as Y1,aA as J1,aB as Z1,aC as pt,aD as Xi,aE as gc,aF as X1,aG as e0,aH as t0,aI as n0,aJ as s0}from"./vendor-D8V7Vhm6.js";import{a5 as fc,a6 as ua,p as dn,a7 as i0,a8 as o0,C as r0}from"./date-fns-BTAAV4UA.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function s(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerPolicy&&(r.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?r.credentials="include":o.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(o){if(o.ep)return;o.ep=!0;const r=s(o);fetch(o.href,r)}})();const a0=(t,n)=>!t||typeof t!="object"||!Array.isArray(n)?!1:n.some(s=>Object.hasOwn(t,s)),Rn=(t,n)=>{const s=t.split(".").map(r=>Number.parseInt(r,10)),i=n.split(".").map(r=>Number.parseInt(r,10)),o=Math.max(s.length,i.length);for(let r=0;r<o;r+=1){const a=(s[r]??0)-(i[r]??0);if(a!==0)return a>0?1:-1}return 0},l0=t=>{const n=s=>Rn(t,s)===0;return n.atLeast=s=>Rn(t,s)>=0,n.atMost=s=>Rn(t,s)<=0,n.below=s=>Rn(t,s)<0,n.above=s=>Rn(t,s)>0,n};var re=(t=>(t.Pro="pro",t.Lite="lite",t.Express="express",t))(re||{}),is=(t=>(t.Global="global",t.Form="form",t.All="all",t))(is||{});const c0=document.getElementById("freeform-config"),rn=JSON.parse(c0?.innerHTML||"[]"),I={...rn,metadata:{...rn.metadata,craft:{...rn.metadata?.craft,is:l0(rn?.metadata?.craft?.version||"0.0.0")}},editions:{...rn.editions,is:t=>I.editions.edition===t,isAtLeast:t=>{const n=I.editions.tiers,s=n.indexOf(t);if(s===-1)throw new Error(`Unknown edition: ${t}`);return n.indexOf(I.editions.edition)>=s},isAtMost:t=>{const n=I.editions.tiers,s=n.indexOf(t);if(s===-1)throw new Error(`Unknown edition: ${t}`);return n.indexOf(I.editions.edition)<=s}},limitations:{...rn.limitations,can:t=>{const n=I.limitations?.items;if(!n)return!0;const s=t.split(".");for(let i=0;i<s.length;i++){const o=s.slice(0,i+1).join(".");if(n[o]===!1)return!1}return n[t]!==void 0?!!n[t]:!0},get:t=>{const n=I.limitations?.items;if(n)return n[t]}}},d0="default",bc=g.createContext({isPrimary:!1,change:()=>{},getCurrentHandleWithFallback:()=>""}),Fe=()=>g.useContext(bc),u0=({children:t})=>{const n=Ht(),s=ne(),[i,o]=g.useState(()=>I.sites.list.find(p=>p.id===I.sites.current)||I.sites.list.find(p=>p.primary)||I.sites.list[0]),[r,a]=g.useState(i.primary);g.useEffect(()=>{document.querySelectorAll('#nav a[href*="site="]').forEach(p=>{const x=p.getAttribute("href");x&&p.setAttribute("href",x.replace(/([?&])site=[^&]+/,`$1site=${i?.handle||""}`))})},[i]);const c=g.useCallback(u=>{const p=I.sites.list.find(x=>x.handle===u);if(p){o(p),a(p.primary);const x=new URLSearchParams(n.search);x.set("site",p.handle),s(`${n.pathname}?${x.toString()}`)}},[n,s]);return e.jsx(bc.Provider,{value:{current:i,isPrimary:r,list:I.sites.list,change:c,getCurrentHandleWithFallback:()=>i?i.handle:d0},children:t})},p0=(t,n)=>{if(n===void 0||(typeof n=="string"&&(n=n.split(" ")),!t||!t.classList))return!1;for(;t;){for(const s of n)if(t.classList.contains(s))return!0;t=t.parentElement}return!1},E=(...t)=>t.map(n=>(typeof n=="string"&&(n=n.trim()),Array.isArray(n)&&(n=E(...n)),n)).filter(n=>!!n).join(" "),jc=l.button`
  z-index: 3 !important;

  &:after {
    margin-left: 0 !important;
  }
`,yc=l.div`
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
`,h0=l.li`
  &.craft-4 {
    gap: var(--xs);

    #site-crumb {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: nowrap;
      gap: var(--xs);
    }

    ${yc} {
      padding: 0 14px;

      border-radius: 4px;
      box-shadow:
        0 0 0 1px rgba(31, 41, 51, 0.1),
        0 5px 20px rgba(31, 41, 51, 0.25);

      user-select: none;
      overflow: auto;
      z-index: 100;
    }

    ${jc} {
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
`,x0=()=>{const[t,n]=g.useState(!1),{current:s,list:i,change:o}=Fe(),{metadata:{craft:r},sites:{enabled:a}}=I;if(!a)return null;const c=!r.is5,u=r.is5;return i.length<=1?null:e.jsxs(h0,{className:E("crumb",c&&"craft-4",u&&"craft-5"),children:[e.jsxs("a",{id:"site-crumb",className:"crumb-link",children:[e.jsx("span",{className:"cp-icon puny",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512","aria-hidden":"true",children:e.jsx("path",{d:"M57.7 193l9.4 16.4c8.3 14.5 21.9 25.2 38 29.8L163 255.7c17.2 4.9 29 20.6 29 38.5v39.9c0 11 6.2 21 16 25.9s16 14.9 16 25.9v39c0 15.6 14.9 26.9 29.9 22.6c16.1-4.6 28.6-17.5 32.7-33.8l2.8-11.2c4.2-16.9 15.2-31.4 30.3-40l8.1-4.6c15-8.5 24.2-24.5 24.2-41.7v-8.3c0-12.7-5.1-24.9-14.1-33.9l-3.9-3.9c-9-9-21.2-14.1-33.9-14.1H257c-11.1 0-22.1-2.9-31.8-8.4l-34.5-19.7c-4.3-2.5-7.6-6.5-9.2-11.2c-3.2-9.6 1.1-20 10.2-24.5l5.9-3c6.6-3.3 14.3-3.9 21.3-1.5l23.2 7.7c8.2 2.7 17.2-.4 21.9-7.5c4.7-7 4.2-16.3-1.2-22.8l-13.6-16.3c-10-12-9.9-29.5 .3-41.3l15.7-18.3c8.8-10.3 10.2-25 3.5-36.7l-2.4-4.2c-3.5-.2-6.9-.3-10.4-.3C163.1 48 84.4 108.9 57.7 193zM464 256c0-36.8-9.6-71.4-26.4-101.5L412 164.8c-15.7 6.3-23.8 23.8-18.5 39.8l16.9 50.7c3.5 10.4 12 18.3 22.6 20.9l29.1 7.3c1.2-9 1.8-18.2 1.8-27.5zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"})})}),e.jsx("span",{children:s.name})]}),e.jsx(jc,{className:"btn menubtn",type:"button","aria-label":"Select site","aria-controls":"site-crumb-menu","aria-expanded":t,"data-discloseure-trigger":"true",onClick:()=>n(!t),children:e.jsx(yc,{className:"menu",style:{display:t?"block":"none"},children:e.jsx("ul",{className:"padded",children:i.map(p=>e.jsx("li",{onClick:()=>{o(p.handle),n(!1)},children:e.jsx("a",{className:E("menu-item",s.handle===p.handle&&"sel"),children:e.jsx("span",{className:"menu-item-label",children:p.name})})},p.id))})})})]})},vc=g.createContext({stack:[],push:()=>{},pop:()=>{},update:()=>{}}),m0=t=>{const{push:n,pop:s,update:i}=g.useContext(vc),{id:o,label:r,url:a,external:c}=t,u=g.useRef(t);u.current={id:o,label:r,url:a,external:c},g.useEffect(()=>{i({id:o,label:r,url:a,external:c})},[c,o,r,i,a]),g.useEffect(()=>(n(u.current),()=>{s(o)}),[o,s,n])},g0=({children:t})=>{const[n,s]=g.useState([]),i=g.useCallback(a=>{s(c=>{const u=c.findIndex(f=>f.id===a.id);if(u===-1)return[...c,a];const p=c[u];if(p.label===a.label&&p.url===a.url&&p.external===a.external)return c;const x=[...c];return x[u]=a,x})},[]),o=g.useCallback(a=>{s(c=>c.filter(u=>u.id!==a))},[]),r=g.useCallback(a=>{s(c=>{const u=c.findIndex(f=>f.id===a.id);if(u===-1)return c;const p=c[u];if(p.label===a.label&&p.url===a.url&&p.external===a.external)return c;const x=[...c];return x[u]={...p,...a},x})},[]);return g.useEffect(()=>{const a=document.getElementById("crumbs");a.style.display="block",a.style.overflow="initial",a.classList.remove("empty")},[]),e.jsxs(vc.Provider,{value:{stack:n,push:i,pop:o,update:r},children:[t,Do.createPortal(e.jsx("nav",{"aria-label":"Breadcrumbs",className:"breadcrumbs",children:e.jsxs("ul",{id:"crumb-list",className:"breadcrumb-list",children:[e.jsx(x0,{}),n.map(({label:a,url:c,external:u},p)=>e.jsxs("li",{className:"crumb",children:[u&&e.jsx("a",{href:c,children:a}),!u&&e.jsx(rt,{to:c,children:a})]},p))]})}),document.getElementById("crumbs"))]})},q=t=>(m0(t),null),f0=()=>null,wc=g.createContext({register:()=>1e3,unregister:()=>{}}),b0=({children:t})=>{const n=g.useRef(1e3),s=()=>(n.current-=1,n.current),i=()=>{n.current+=1};return e.jsx(wc.Provider,{value:{register:s,unregister:i},children:t})},j0=()=>{const{register:t,unregister:n}=g.useContext(wc),[s,i]=g.useState(1e3);return g.useEffect(()=>{const o=t();return i(o),()=>{n()}},[t,n]),s},$c=typeof window<"u"?g.useLayoutEffect:g.useEffect;function eo(t){const n=g.useRef(()=>{throw new Error("Cannot call an event handler while rendering.")});return $c(()=>{n.current=t},[t]),g.useCallback((...s)=>n.current?.(...s),[n])}const Cc=g.createContext({stack:[],push:()=>{},pop:()=>{}}),os=(t,n=!0)=>{const{push:s,pop:i}=g.useContext(Cc),o=eo(t);g.useEffect(()=>{if(n)return s(o),()=>{i(o)}},[o,n,i,s])},y0=({children:t})=>{const n=g.useRef([]),s=g.useCallback(r=>{const a=n.current;a.at(-1)!==r&&a.push(r)},[]),i=g.useCallback(r=>{const a=n.current;if(!r)return a.pop();const c=a.indexOf(r);if(c!==-1)return a.splice(c,1)[0]},[]);g.useEffect(()=>{const r=a=>{if(a.key==="Escape"){const c=n.current.at(-1);c&&c()}};return document.addEventListener("keydown",r),()=>{document.removeEventListener("keydown",r)}},[]);const o=g.useMemo(()=>({stack:n.current,push:s,pop:i}),[i,s]);return e.jsx(Cc.Provider,{value:o,children:t})};l.div`
  box-shadow:
    0 0 0 1px #cdd8e4,
    0 2px 12px rgb(205 216 228 / 50%);
`;const m={xs:"var(--xs)",sm:"var(--s)",md:"var(--m)",lg:"var(--l)",xl:"var(--xl)"},S={sm:"var(--small-border-radius)",md:"var(--medium-border-radius)",lg:"var(--large-border-radius)"},ae={panel:"0 0 20px 10px rgb(205 216 228 / 50%)",box:"0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%)",boxSubtle:"0 2px 8px rgba(0, 0, 0, 0.1)",bottom:"inset 0 -1px 0 0 rgb(154 165 177 / 25%)",right:"inset -1px 0 0 0 rgb(154 165 177 / 25%)",autosuggest:"0 1px 5px -1px rgba(31,41,51,.2)",container:"0 0 0 1px rgba(31, 41, 51, 0.1), 0 5px 20px rgba(31, 41, 51, 0.25)"},Ko={easeOut:"cubic-bezier(0.25, 0.1, 0.25, 1)",bounce:{easeOut:"cubic-bezier(0.175, 0.885, 0.32, 1.275)"}},h={hairline:"rgba(51,64,77,.1)",hr:"rgb(from var(--gray-800) r g b/10%)",inputBorder:"rgba(96,125,159,0.25)",barelyVisible:"rgb(154 165 177 / 75%)",link:"#1f5fea",elements:{dropdown:"#dfe5ec"},error:"#cf1124",warning:"var(--warning-color)",notice:"var(--notice-color)",white:"var(--white)",black:"var(--black)",gray050:"var(--gray-050)",gray100:"var(--gray-100)",gray200:"var(--gray-200)",gray250:"#b4c3d3",gray300:"var(--gray-300)",gray400:"var(--gray-400)",gray500:"var(--gray-500)",gray550:"var(--gray-550)",gray600:"var(--gray-600)",gray700:"var(--gray-700)",gray800:"var(--gray-800)",gray900:"var(--gray-900)",blue100:"var(--blue-100)",blue200:"var(--blue-200)",blue300:"var(--blue-300)",blue400:"var(--blue-400)",blue500:"var(--blue-500)",blue600:"var(--blue-600)",pink500:"var(--pink-500)",red050:"var(--red-050)",red100:"var(--red-100)",red200:"var(--red-200)",red300:"var(--red-300)",red500:"var(--red-500)",red600:"var(--red-600)",red700:"var(--red-700)",yellow050:"var(--yellow-050)",yellow500:"var(--yellow-500)",yellow600:"var(--yellow-600)",yellow700:"var(--yellow-700)",teal050:"var(--teal-050)",teal300:"var(--teal-300)",teal500:"var(--teal-500)",teal550:"var(--teal-550)",teal600:"var(--teal-600)",teal700:"var(--teal-700)",green600:"var(--green-600)"},v0=l.div``,w0=l(_.div)`
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
`,$0=l(_.div)`
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
`,wt=({children:t,closeModal:n,style:s,config:i})=>(os(n,i?.allowEscape??!0),e.jsx($0,{style:s,children:t})),C0=t=>Y({to:{opacity:t?1:0,backgroundColor:t?"rgba(123, 135, 147, 0.35)":"rgba(123, 135, 147, 0)"}}),k0=t=>oc(t,{from:{y:100,opacity:0},enter:{y:0,opacity:1},leave:{y:-100,opacity:0},config:{tension:500,friction:20}}),kc=g.createContext({openModal:()=>{},closeModal:()=>{}}),Ke=()=>g.useContext(kc),Sc=({children:t})=>{const[n,s]=g.useState([]),[i,o]=g.useState([]),[r,a]=g.useState([]),c=(f,b,j)=>{s([...n,b]),o([...i,f]),a([...r,j])},u=()=>{s(n.slice(0,-1)),o(i.slice(0,-1)),a(r.slice(0,-1))};g.useEffect(()=>{i.length>0?document.body.style.overflow="hidden":document.body.style.overflow="auto"},[i]);const p=C0(i.length>0),x=k0(i);return e.jsxs(kc.Provider,{value:{openModal:c,closeModal:u},children:[t,Do.createPortal(e.jsx(v0,{children:e.jsx(w0,{style:p,className:E(!i.length&&"inactive"),children:x((f,b,j,y)=>e.jsx(wt,{closeModal:u,style:f,config:Mt(r[y]),children:e.jsx(b,{closeModal:u,data:Mt(n[y])})},y))})}),document.body)]})},S0=new f1({defaultOptions:{queries:{gcTime:1e3*60*10,retry:!1,refetchOnWindowFocus:!1}}}),Lc=g.createContext({}),Fc=()=>g.useContext(Lc),L0=l.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1005;
`,F0=({children:t})=>{const[n,s]=g.useState(),i=g.useRef(null);return g.useEffect(()=>{i.current&&s(i.current.getBoundingClientRect())},[i.current]),e.jsxs(Lc.Provider,{value:{element:i.current,dimensions:n},children:[e.jsx(L0,{id:"pop-up-portal",ref:i}),t]})},Ec=b1("form/save");var Yn=(t=>(t.Page="page",t.Field="field",t.Row="row",t))(Yn||{}),It=(t=>(t[t.Idle=0]="Idle",t[t.Processing=1]="Processing",t))(It||{});const E0={state:0,page:null,focus:{active:!1,type:null,uid:null}},Tc=Se({name:"context",initialState:E0,reducers:{setPage:(t,{payload:n})=>{t.page=n},setFocusedItem:(t,{payload:n})=>{t.focus.active===!0&&t.focus.uid===n.uid&&t.focus.type===n.type||(t.focus={active:!0,...n})},setState:(t,{payload:n})=>{t.state=n},focus:t=>{t.focus.active=!0},unfocus:t=>{t.focus.active=!1}}}),{actions:ye}=Tc,T0=Tc.reducer,Kn=new Map,le={subscribe(t,n){const s=N0(t),i=n;return s.add(i),()=>{s.delete(i),s.size===0&&Kn.delete(t)}},publish(t,n){const s=Kn.get(t);s&&s.forEach(i=>{i(t,n)})},clearAllSubscriptions(){Kn.clear()}},N0=t=>{let n=Kn.get(t);return n||(n=new Set,Kn.set(t,n)),n},Kt=Symbol("form.save"),rs=Symbol("form.save.errors"),Nc=Symbol("form.save.crated"),z0=Symbol("form.save.updated"),Vt=Symbol("form.save.upserted");le.clearAllSubscriptions();const pa=(t,n,s)=>{le.publish(rs,{getState:t,dispatch:n,response:s}),n(ye.setState(It.Idle))},M0=(t,n,s)=>{le.publish(Nc,{getState:t,dispatch:n,response:s}),le.publish(Vt,{getState:t,dispatch:n,response:s}),n(ye.setState(It.Idle))},I0=(t,n,s)=>{le.publish(z0,{getState:t,dispatch:n,response:s}),le.publish(Vt,{getState:t,dispatch:n,response:s}),n(ye.setState(It.Idle))},A0=t=>n=>s=>{if(!s||(n(s),typeof s!="object"||!("type"in s)||s.type!==String(Ec)))return;const i=t.dispatch,o=t.getState;i(ye.setState(It.Processing));const r={getState:o,dispatch:i,persist:{}};le.publish(Kt,r);const a=o().form.id;a?T.post(`/api/forms/${a}`,r.persist).then(c=>I0(o,i,c)).catch(c=>pa(o,i,c)):T.post("/api/forms",r.persist).then(c=>M0(o,i,c)).catch(c=>pa(o,i,c))},Xe={success:t=>{Craft.cp.displaySuccess(t)},notice:t=>{Craft.cp.displayNotice(t)},error:t=>{Craft.cp.displayError(t)}},R0=(t,n={})=>{for(const[s,i]of Object.entries(n)){const o=new RegExp(`\\{${s}\\}`,"g");t=t.replace(o,i.toString())}return t},d=(t,n={})=>t?typeof Craft<"u"?Craft.t("freeform",t,n):R0(t,n):"",P0=(t,n)=>{const{persist:s,getState:i}=n,{id:o,uid:r,type:a,settings:c}=i().form;s.form={id:o,uid:r,type:a,settings:c}},D0=(t,{dispatch:n,response:s})=>{n(gt.clearErrors()),n(gt.setErrors(s.errors?.form)),Xe.error(d("There were problems saving the form."))},B0=(t,{dispatch:n})=>{n(gt.clearErrors()),Xe.success(d("Form saved successfully."))},O0=(t,{dispatch:n,response:s})=>{n(gt.update({id:s.data.form.id}))};le.subscribe(Kt,P0);le.subscribe(rs,D0);le.subscribe(Nc,O0);le.subscribe(Vt,B0);const as={oneByShortName:t=>n=>n.integrations.find(s=>s.shortName===t),one:t=>n=>n.integrations.find(s=>s.id===t),isFieldInIntegrations:t=>X(n=>n.integrations,n=>!!n.filter(s=>s.enabled).find(s=>s.properties.some(i=>{if(i.type==="field")return s.values[i.handle]===t;if(i.type==="fieldMapping"){const o=s.values[i.handle];return Object.values(o).some(r=>r.value===t)}return!1}))),errors:{any:t=>t.integrations.some(n=>n.errors?Object.values(n.errors).some(s=>s.length>0):!1)}},_0=(t,{getState:n,dispatch:s})=>{const i=n(),o=as.oneByShortName("FormMonitor")(i);o&&s(gt.update({formMonitor:{enabled:o.enabled}}))};le.subscribe(Vt,_0);const W0={id:null,uid:G(),type:"Solspace\\Freeform\\Form\\Types\\Regular",name:"Create a new Form",handle:"newForm",isNew:!0,settings:{},errors:{},dateArchived:null,formMonitor:{enabled:!1}},zc=Se({name:"form",initialState:W0,reducers:{update:(t,{payload:n})=>{Object.assign(t,n)},setInitialSettings:(t,n)=>{if(!(Object.entries(t.settings).length>0)){for(const s of n.payload){t.settings[s.handle]={namespaceType:"settings",namespace:s.handle};for(const i of s.properties)t.settings[s.handle][i.handle]=i.value}t.settings.general.name=t.name,t.settings.general.handle=t.handle}},modifySettings:(t,{payload:n})=>{const{namespace:s,key:i,value:o}=n;t.settings[s]||(t.settings[s]={namespaceType:"settings",namespace:s}),t.settings[s][i]=o},removeError:(t,{payload:n})=>{delete t.errors[n]},setErrors:(t,{payload:n})=>{t.errors=n},clearErrors:t=>{t.errors=void 0}}}),{actions:gt}=zc,U0=zc.reducer,H0=(t,n)=>{const{getState:s,persist:i}=n;i.integrations=s().integrations.map(o=>({id:o.id,instanceUid:o.instanceUid,enabled:!!o.enabled,values:o.dirtyValues}))},q0=(t,{dispatch:n,response:s})=>{n(At.clearErrors()),n(At.setErrors(s.errors?.integrations))},Q0=(t,{dispatch:n})=>{n(At.cleanDirtyValues()),n(At.clearErrors())};le.subscribe(Kt,H0);le.subscribe(rs,q0);le.subscribe(Vt,Q0);const K0=[],ha=(t,n)=>t.find(s=>s.id===n),Mc=Se({name:"integrations",initialState:K0,reducers:{set:(t,n)=>{t.length=0,n.payload.forEach(s=>{const i={};s.properties.forEach(o=>{i[o.handle]=o.value}),t.push({dirtyValues:{},values:i,...s})})},add:(t,n)=>{n.payload.forEach(s=>{const i={};s.properties.forEach(o=>{i[o.handle]=o.value}),t.push({dirtyValues:{},values:i,...s})})},toggle:(t,n)=>{const s=ha(t,n.payload);s.enabled=!s.enabled},modify:(t,n)=>{const{id:s,key:i,value:o}=n.payload,r=ha(t,s);r.values[i]=o,r.dirtyValues={...r.dirtyValues,[i]:o}},cleanDirtyValues:t=>{t.forEach(n=>{n.dirtyValues={}})},emptyIntegrations:t=>{t.length=0},clearErrors:t=>{t.forEach(n=>{n.errors=void 0})},setErrors:(t,n)=>{t.forEach(s=>{const i=n.payload?.[s.id];i&&(s.errors=i)})}}}),{actions:At}=Mc,V0=Mc.reducer,G0=(t,{dispatch:n,response:s})=>{n(be.clearErrors()),n(be.setErrors(s.errors?.fields))},Y0=(t,{dispatch:n})=>{n(be.clearErrors())};le.subscribe(rs,G0);le.subscribe(Vt,Y0);const J0=[],Ic=Se({name:"layout/fields",initialState:J0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const{uid:s,rowUid:i,fieldType:o,order:r}=n.payload,a=Math.max(-1,...t.filter(u=>u.rowUid===n.payload.rowUid).map(u=>u.order)),c={};if(o.properties.forEach(u=>{c[u.handle]=u.value}),!c.label){const u=t.filter(x=>x.typeClass===o.typeClass).length;let p=d(o.name);u>0&&(p+=` ${u}`),c.label=p,c.handle=Bo(p)}t.push({uid:s,rowUid:i,typeClass:o.typeClass,properties:c,order:r!==void 0?r:a+1}),r!==void 0&&t.filter(u=>u.rowUid===i).filter(u=>u.uid!==s).forEach(u=>{u.order>=r&&(u.order+=1)})},duplicate:(t,n)=>{const{uid:s,rowUid:i,field:o}=n.payload,r=Math.max(-1,...t.filter(f=>f.rowUid===i).map(f=>f.order??-1)),a={...o.properties},c=a.handle.replace(/_\d+$/,"");let u=a.handle,p=!0,x=1;do u=`${c}_${x}`,p=t.some(f=>f.properties.handle===u);while(p&&x++<500);a.handle=u,t.push({uid:s,rowUid:i,typeClass:o.typeClass,properties:a,order:r+1})},remove:(t,{payload:n})=>{t.splice(t.findIndex(s=>s.uid===n),1)},removeBatch:(t,{payload:n})=>{n.forEach(s=>{t.splice(t.findIndex(i=>i.uid===s),1)})},edit:(t,n)=>{const{uid:s,handle:i,value:o}=n.payload;t.find(r=>r.uid===s).properties[i]=o},batchEdit:(t,n)=>{const{uid:s,typeClass:i,properties:o}=n.payload,r=t.find(a=>a.uid===s);r.typeClass=i,r.properties=o},clearErrors:t=>{for(const n of t)n.errors=void 0},setErrors:(t,n)=>{const{payload:s}=n;for(const i of t)i.errors=s?.[i.uid]},moveTo:(t,n)=>{const{uid:s,rowUid:i,position:o}=n.payload,r=t.find(p=>p.uid===s),a=r.rowUid,c=r.order,u=a===i;c!==void 0&&(r.rowUid=i,r.order=o,u||(t.filter(p=>p.rowUid===a).forEach(p=>{const x=p.order>=c;p.order-=x?1:0}),t.filter(p=>p.rowUid===i).filter(p=>p.uid!==r.uid).forEach(p=>{const x=p.order>=r.order;p.order+=x?1:0})),u&&t.filter(p=>p.rowUid===i).filter(p=>p.uid!==r.uid).forEach(p=>{p.order>c&&p.order<=o&&(p.order-=1),p.order<c&&p.order>=o&&(p.order+=1)}))}}}),{actions:be}=Ic,Z0=Ic.reducer,X0=(t,n)=>{const{getState:s,persist:i}=n,{layouts:o,fields:r,rows:a,pages:c}=s().layout;i.layout={pages:c,layouts:o,rows:a,fields:r}};le.subscribe(Kt,X0);const eh=[],Ac=Se({name:"layout/layouts",initialState:eh,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{t.push(n.payload)},remove:(t,n)=>{t.splice(t.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Cn}=Ac,th=Ac.reducer,nh=/^-?\d*\.?\d*$/,xa=(t,n={})=>{const{min:s,max:i,unsigned:o}=n;if(typeof t=="string"){if(t==="-")return 0;if(nh.test(t)||(t=t.replaceAll(/[^0-9.-]/g,"")),t==="")return;t=Number(t)}if(!Number.isNaN(t))return typeof o=="boolean"&&o&&t<0&&(t=Math.abs(t)),s!=null&&t<s?s:i!=null&&t>i?i:t},sh=(t,n,s,i=!0)=>{const o=Math.min(n,s),r=Math.max(n,s);return i?t>=o&&t<=r:t>o&&t<r},ih=[],Rc=Se({name:"layout/pages",initialState:ih,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const s=Math.max(-1,...t.map(i=>i.order));t.push({...n.payload,order:s+1})},remove:(t,n)=>{let s=0;t.splice(t.findIndex(i=>i.uid===n.payload),1),t.forEach(i=>{i.order=s++})},moveTo:(t,n)=>{const{uid:s,order:i}=n.payload,o=t.find(a=>a.uid===s),r=o.order;o.order=i,t.filter(a=>a.uid!==s).filter(a=>sh(a.order,i,r)).forEach(a=>{i>r&&(a.order-=1),i<r&&(a.order+=1)})},updateLabel:(t,n)=>{const{uid:s,label:i}=n.payload;t.find(o=>o.uid===s).label=i},editButtons:(t,n)=>{const{uid:s,key:i,value:o}=n.payload,r=t.find(a=>a.uid===s).buttons;r&&Object.assign(r,{[i]:o})}}}),{actions:kn}=Rc,oh=Rc.reducer,rh=[],Pc=Se({name:"layout/rows",initialState:rh,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const{layoutUid:s,uid:i,order:o}=n.payload;let r;o!==void 0?r=t.findIndex(a=>a.layoutUid===s&&a.order===o):(r=t.reduce((a,c,u)=>c.layoutUid===s&&c.order>t[a]?.order?u:a,-1),r=r===-1?t.length:r),t.splice(r,0,{uid:i,order:r,layoutUid:s}),t.filter(a=>a.layoutUid===s).forEach((a,c)=>{a.order=c})},remove:(t,n)=>{const s=t.findIndex(o=>o.uid===n.payload),i=t.find(o=>o.uid===n.payload).layoutUid;t.splice(s,1),t.filter(o=>o.layoutUid===i).forEach((o,r)=>{o.order=r})},swap:(t,n)=>{const s=t.find(r=>r.uid===n.payload.currentUid),i=t.find(r=>r.uid===n.payload.targetUid),o=s.order;s.order=i.order,i.order=o}}}),{actions:Ze}=Pc,ah=Pc.reducer,lh=rc({fields:Z0,pages:oh,rows:ah,layouts:th}),ch=(t,n)=>{const{getState:s,persist:i}=n,o=s();let r=null;o.notifications.initialized&&(r=o.notifications.items),i.notifications=r},dh=(t,{dispatch:n,response:s})=>{n(Rt.clearErrors()),n(Rt.setErrors(s.errors?.notifications))},uh=(t,{dispatch:n})=>{n(Rt.clearErrors())};le.subscribe(Kt,ch);le.subscribe(rs,dh);le.subscribe(Vt,uh);const ph={initialized:!1,items:[]},ma=(t,n)=>t.items.find(s=>s.uid===n),Dc=Se({name:"notifications",initialState:ph,reducers:{clear:t=>{t.initialized=!1,t.items.length=0},set:(t,n)=>{t.initialized=!0,t.items.length=0,n.payload.forEach(s=>{t.items.push(s)})},toggle:(t,n)=>{const s=ma(t,n.payload);s&&(s.enabled=!s.enabled)},modify:(t,n)=>{const{uid:s,key:i,value:o}=n.payload,r=ma(t,s);r&&(r[i]=o)},add:(t,n)=>{t.items.push(n.payload)},clearErrors:t=>{for(const n of t.items)n.errors=void 0},setErrors:(t,n)=>{const{payload:s}=n;for(const i of t.items)i.errors=s?.[i.uid]},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Rt}=Dc,hh=Dc.reducer,xh=(t,n)=>{const{getState:s,persist:i}=n,{fields:o,pages:r,notifications:a,integrations:c,submitForm:u,buttons:p}=s().rules;i.rules={fields:o.initialized?o.items:null,pages:r.initialized?r.items:null,notifications:a.initialized?a.items:null,integrations:c.initialized?c.items:null,submitForm:u.item,buttons:p.initialized?p.items:null}};le.subscribe(Kt,xh);var ie=(t=>(t.Equals="equals",t.NotEquals="notEquals",t.GreaterThan="greaterThan",t.GreaterThanOrEquals="greaterThanOrEquals",t.LessThan="lessThan",t.LessThanOrEquals="lessThanOrEquals",t.Contains="contains",t.NotContains="notContains",t.StartsWith="startsWith",t.EndsWith="endsWith",t.IsEmpty="isEmpty",t.IsNotEmpty="isNotEmpty",t.IsOneOf="isOneOf",t.IsNotOneOf="isNotOneOf",t))(ie||{});const Dn={boolean:["equals","notEquals"],noValue:["isEmpty","isNotEmpty"],multiple:["isOneOf","isNotOneOf"],negative:["notEquals","notContains"]};var mn=(t=>(t.Show="show",t.Hide="hide",t))(mn||{}),Be=(t=>(t.And="and",t.Or="or",t))(Be||{});const mh={initialized:!1,items:[]},Bc=Se({name:"rules/buttons",initialState:mh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{pageUid:s,button:i}=n.payload;t.items.push({uid:G(),enabled:!0,display:mn.Show,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:ie.Equals,value:""}],button:i,page:s})},modifyDisplay:(t,n)=>{const{ruleUid:s,display:i}=n.payload,o=t.items.find(r=>r.uid===s);o.display=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:ln}=Bc,gh=Bc.reducer,fh={initialized:!1,items:[]},Oc=Se({name:"rules/fields",initialState:fh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const s=n.payload;t.items.push({uid:G(),enabled:!0,display:mn.Show,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:ie.Equals,value:""}],field:s})},modifyDisplay:(t,n)=>{const{ruleUid:s,display:i}=n.payload,o=t.items.find(r=>r.uid===s);o.display=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:cn}=Oc,bh=Oc.reducer,jh={initialized:!1,items:[]},_c=Se({name:"rules/integrations",initialState:jh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{ruleUid:s,integrationUid:i}=n.payload;t.items.push({uid:s,enabled:!0,push:!0,combinator:Be.Or,integration:i,conditions:[{uid:G(),field:"",operator:ie.Equals,value:""}]})},modifyPush:(t,n)=>{const{ruleUid:s,push:i}=n.payload,o=t.items.find(r=>r.uid===s);o.push=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Bn}=_c,yh=_c.reducer,vh={initialized:!1,items:[]},Wc=Se({name:"rules/notifications",initialState:vh,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{ruleUid:s,notificationUid:i}=n.payload;t.items.push({uid:s,enabled:!0,send:!0,combinator:Be.Or,notification:i,conditions:[{uid:G(),field:"",operator:ie.Equals,value:""}]})},modifySend:(t,n)=>{const{ruleUid:s,send:i}=n.payload,o=t.items.find(r=>r.uid===s);o.send=i},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:On}=Wc,wh=Wc.reducer,$h={initialized:!1,items:[]},Uc=Se({name:"rules/pages",initialState:$h,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const s=n.payload;t.items.push({uid:G(),enabled:!0,page:s,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:ie.Equals,value:""}]})},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:i}=n.payload,o=t.items.find(r=>r.uid===s);o.combinator=i},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:i}=n.payload,o=t.items.find(r=>r.uid===s);o.conditions=i},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:_n}=Uc,Ch=Uc.reducer,kh={},Hc=Se({name:"rules/submit-form",initialState:kh,reducers:{set:(t,n)=>{t.item=n.payload},add:t=>{t.item={uid:G(),enabled:!0,combinator:Be.Or,conditions:[{uid:G(),field:"",operator:ie.Equals,value:""}]}},modifyCombinator:(t,n)=>{t.item.combinator=n.payload},modifyConditions:(t,n)=>{t.item.conditions=n.payload},remove:t=>{t.item=void 0}}}),{actions:Wn}=Hc,Sh=Hc.reducer,Lh=rc({fields:bh,pages:Ch,notifications:wh,integrations:yh,submitForm:Sh,buttons:gh});var Sn=(t=>(t.Fields="fields",t))(Sn||{});const Fh={fields:""},qc=Se({name:"search",initialState:Fh,reducers:{update:(t,n)=>{t[n.payload.type]=n.payload.query},clear:(t,n)=>{t[n.payload]=""}}}),{actions:Eh}=qc,Th=qc.reducer,Nh=(t,n)=>{const{getState:s,persist:i}=n;i.translations=s().translations};le.subscribe(Kt,Nh);const zh={},Qc=Se({name:"translations",initialState:zh,reducers:{update:(t,{payload:n})=>{const{siteId:s,type:i,namespace:o,handle:r,value:a}=n;if(!t)return{[s]:{[i]:{[o]:{[r]:a}}}};t[s]===void 0&&(t[s]={fields:{},form:{},pages:{}}),(!t[s][i]||typeof t[s][i]!="object")&&(t[s][i]={}),t[s][i]===void 0&&(t[s][i]={}),t[s][i][o]||(t[s][i][o]={}),t[s][i][o][r]=a},remove:(t,{payload:n})=>{const{siteId:s,type:i,namespace:o,handle:r}=n;t[s]!==void 0&&t[s][i]!==void 0&&t[s][i][o]!==void 0&&delete t[s][i][o][r]},init:(t,n)=>n.payload}}),{actions:to}=Qc,Mh=Qc.reducer,Ih=j1({middleware:t=>t().concat(A0),reducer:{form:U0,layout:lh,integrations:V0,notifications:hh,rules:Lh,context:T0,search:Th,translations:Mh}}),H=qt.withTypes(),Pt=P,Vo=ac.withTypes(),Ah="api_error";class Rh extends Error{constructor(n){super(n.message),this.errors={},this.name=Ah,this.status=n.response.status,this.errors=n.response.data.errors}getFlatErrors(){return Object.values(this.errors).flatMap(n=>Object.values(n)).join(", ")}}const Ph=window.location.href.replace(/(.*\/freeform).*/i,"$1"),me=(t,n=!0)=>{const s=(t??"").replace(/\/+/g,"/").replace(/^\/(.*)/,"$1").replace(/\/$/,""),i=s.length?`/${s}`:"",o=new URL(`${Ph}${i}`);return n?o.href:o.pathname},Dh=()=>{if(typeof globalThis<"u"&&globalThis.Craft)return globalThis.Craft;if(typeof window<"u"&&window.Craft)return window.Craft};T.defaults.baseURL=me("/");T.defaults.headers.get&&(T.defaults.headers.get.Accept="application/json");T.defaults.headers.post&&(T.defaults.headers.post.Accept="application/json");T.interceptors.request.use(t=>{const n=t.method?.toLowerCase();if(n&&["post","put","patch","delete"].includes(n)){t.data===void 0&&(t.data={});const s=Dh();s&&t.headers.set("X-CSRF-Token",s.csrfTokenValue)}return t});T.interceptors.response.use(null,t=>(t.response?.data?.error&&(t.message=t.response.data.error),t.response?.data?.errors?Promise.reject(new Rh(t)):Promise.reject(t)));const Bh=l.div`
  padding: 0 var(--xl);
`,fe={base:["forms"],all:t=>[...fe.base,t],single:t=>[...fe.base,t],settings:()=>[...fe.base,"settings"],usage:(t,n)=>[...fe.base,t,"usage",n]},ei=()=>{const{current:t,getCurrentHandleWithFallback:n}=Fe();return B({queryKey:fe.all(n()),queryFn:()=>T.get("/api/forms",{params:{site:t?.handle}}).then(s=>s.data),staleTime:1/0,gcTime:1/0})},Oh=t=>B({queryKey:fe.single(t),queryFn:()=>T.get(`/api/forms/${t}`).then(n=>n.data),staleTime:1/0,enabled:!!t}),Gt=()=>{const t=H();return B({queryKey:fe.settings(),queryFn:()=>T.get("/api/forms/settings").then(n=>n.data).then(n=>n.sort((s,i)=>s.order-i.order)).then(n=>(t(gt.setInitialSettings(n)),n)),staleTime:1/0,gcTime:1/0})},_h=()=>{const{formId:t}=V(),{current:n}=Fe();return B({queryKey:fe.usage(Number(t),n.id),queryFn:()=>T.get(`/api/forms/${t}/elements?site=${n.id}`).then(s=>s.data)})},Wh=()=>{const{data:t}=ei();return t?.reduce((s,i)=>(s[i.id]=i.settings?.general?.color||null,s),{})||{}},ze={all:["integrations"],form:t=>[...ze.all,"forms",t],navigation:["integrations","navigation"],properties:(t,n,s)=>[...ze.all,"properties",t,n,s],authCheck:t=>[...ze.all,t,"auth-check"]},Uh=t=>{const n=ee();return g.useCallback(()=>{t&&n.removeQueries({queryKey:ze.form(t)})},[t,n])},Go=t=>{const n=qt();return B({queryKey:ze.form(t),queryFn:()=>t?T.get(`/api/forms/${t}/integrations`).then(s=>s.data).then(s=>(n(At.set(s)),s)):Promise.resolve([]),staleTime:1/0,gcTime:1/0})},ke={all:["notifications"],types:()=>[...ke.all,"types"],templates:()=>[...ke.all,"templates"],suggestions:()=>[...ke.templates(),"suggestions"],formTemplates:t=>[...ke.all,"forms",t,"templates"],single:t=>[...ke.all,"forms",t]},Hh=t=>{const n=ee();return g.useCallback(()=>{t&&(n.removeQueries({queryKey:ke.single(t)}),n.removeQueries({queryKey:ke.formTemplates(t)}))},[t,n])},Kc=()=>B({queryKey:ke.types(),queryFn:()=>T.get("/api/notifications/types").then(t=>t.data).then(t=>t.sort((n,s)=>n.order-s.order)),staleTime:1/0,gcTime:1/0}),Yo=t=>{const n=qt();return B({queryKey:ke.single(t),queryFn:()=>t?T.get(`/api/forms/${t}/notifications`).then(s=>s.data).then(s=>(n(Rt.set(s)),s)):Promise.resolve([]),staleTime:1/0,gcTime:1/0})},qh=()=>B({queryKey:ke.templates(),queryFn:()=>T.get("/api/notifications/templates").then(t=>t.data),staleTime:1/0,gcTime:1/0}),Qh=t=>{const{templates:{method:n}}=I;return B({queryKey:ke.formTemplates(t),queryFn:()=>T.get(`/api/forms/${t}/notifications/templates`).then(s=>s.data),staleTime:1/0,gcTime:1/0,enabled:n!==is.Global})},Kh=()=>{const{formId:t}=V(),n=ne(),s=ee();g.useEffect(()=>{const i=$i("/freeform/forms"),o=r=>(r.preventDefault(),t&&(s.invalidateQueries({queryKey:fe.single(Number(t))}),s.invalidateQueries({queryKey:ke.single(Number(t))}),s.invalidateQueries({queryKey:ze.form(Number(t))})),n("/forms"),!1);return i&&i.addEventListener("click",o),()=>{i&&i.removeEventListener("click",o)}},[t,n,s]),g.useEffect(()=>{const i=$i("/freeform/integrations"),o=r=>(r.preventDefault(),n("/integrations"),!1);return i&&i.addEventListener("click",o),()=>{i&&i.removeEventListener("click",o)}},[n]),g.useEffect(()=>{const i=$i("/freeform/ab-tests"),o=r=>(r.preventDefault(),n("/ab-tests"),!1);return i&&i.addEventListener("click",o),()=>{i&&i.removeEventListener("click",o)}},[n])},$i=t=>{let n=document.querySelector(`ul.nav-item__subnav li a[href*="${t}"]`);return n||(n=document.querySelector(`ul.subnav li a[href*="${t}"]`)),n},Vh=()=>(Kh(),e.jsx(Bh,{id:"freeform-client-app",children:e.jsx(jt,{})})),Gh=l.header`
  width: auto !important;
`,Ln=({children:t,extra:n,...s})=>(s.style||(s.style={paddingLeft:0,paddingRight:0}),e.jsx("div",{id:"header-container",children:e.jsxs(Gh,{id:"header",...s,children:[e.jsx("div",{id:"page-title",className:"flex",children:e.jsx("h1",{className:"screen-title",children:t})}),n]})})),Ci=(t,n)=>{const s=t.children[0],i=t.querySelector(".sidebar-action--sub");n?(s.classList.add("sel"),i?.classList.add("sel"),i?.setAttribute("aria-current","page")):(s.classList.remove("sel"),i?.classList.remove("sel"),i?.removeAttribute("aria-current"))},Fn=t=>{const n=document.querySelectorAll("#nav-freeform > ul > li");g.useEffect(()=>(n.forEach(s=>{const i=s.querySelector("a.sidebar-action")?.getAttribute("href");Ci(s,i?.includes(t))}),()=>{n.forEach(s=>{Ci(s,!1)}),Ci(n[0],!0)}),[t,n])},$t=({callback:t,isEnabled:n,refObject:s,excludeClassNames:i})=>{const o=g.useRef(null),r=s||o;return g.useEffect(()=>{const a=c=>{n&&(document.activeElement instanceof HTMLInputElement||document.activeElement instanceof HTMLTextAreaElement||n&&r.current&&!r.current.contains(c.target)&&!p0(c.target,i)&&typeof t=="function"&&t())};return document.addEventListener("click",a,!0),()=>{document.removeEventListener("click",a,!0)}},[r,n,i]),r},ft=({meetsCondition:t,callback:n,type:s="keyup",ref:i},o=[])=>{const r=i?.current??document;g.useEffect(()=>((t===void 0||t)&&r.addEventListener(s,n),t===!1&&r.removeEventListener(s,n),()=>{r.removeEventListener(s,n)}),[t,n,r,s,...o])},R=t=>{const{title:n,children:s,...i}=t;return e.jsxs("svg",{role:n?"img":void 0,"aria-hidden":n?void 0:!0,xmlns:"http://www.w3.org/2000/svg",...i,children:[Yh(n),s]})},Yh=t=>t?.trim()?e.jsx("title",{children:t}):null,Vc=t=>e.jsxs(R,{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",...t,children:[e.jsx("path",{d:"M5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8Z",fill:"currentColor"}),e.jsx("path",{d:"M10 8C10 8.55228 9.55228 9 9 9C8.44772 9 8 8.55228 8 8C8 7.44772 8.44772 7 9 7C9.55228 7 10 7.44772 10 8Z",fill:"currentColor"}),e.jsx("path",{d:"M15 8C15 8.55228 14.5523 9 14 9C13.4477 9 13 8.55228 13 8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8Z",fill:"currentColor"})]}),Jh=l.div`
  position: relative;
`,Zh=l.button`
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
`,Xh=l.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;

  min-width: 120px;

  background: ${h.white};
  box-shadow: ${ae.boxSubtle};

  border: 1px solid ${h.gray200};
  border-radius: ${S.md};
`,ex=l.button`
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
`,tx=({choices:t,ariaLabel:n=d("Actions")})=>{const[s,i]=g.useState(!1);ft({callback:r=>{r.key==="Escape"&&i(!1)},meetsCondition:s,type:"keyup"});const o=$t({isEnabled:s,callback:()=>i(!1)});return e.jsxs(Jh,{ref:o,children:[e.jsx(Zh,{type:"button",className:E(s&&"open"),onClick:()=>i(r=>!r),"aria-label":n,"aria-expanded":s,title:n,children:e.jsx(Vc,{})}),s&&e.jsx(Xh,{children:t.map(r=>e.jsxs(ex,{type:"button",className:r.className,$destructive:r.destructive,onClick:()=>{i(!1),r.onClick()},children:[r.icon,e.jsx("span",{children:r.label})]},r.label))})]})},nx=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"})}),Gc=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),sx=({onDelete:t,onEdit:n})=>e.jsx(tx,{choices:[{icon:e.jsx(nx,{}),label:d("Edit"),onClick:n},{destructive:!0,icon:e.jsx(Gc,{}),label:d("Delete"),onClick:t}]}),Yc=t=>e.jsx(R,{width:"14",height:"14",viewBox:"0 0 14 14",...t,children:e.jsx("path",{d:"M2.5 7L5.5 10L11.5 4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})}),Jo=(t,n={})=>{const{transliterate:s,camelize:i}=n;let o=t;return s&&(o=Oo(o)),i&&(o=Bo(o)),o=o.replace(/^[^a-z]+/gi,""),o},ga=["#1660c7","#d92d20","#7a3ec8","#f58c00","#008f8f","#c200fb","#2d6a4f"],Jc=(t,n)=>t.formColor||ga[n%ga.length],ix=[{id:"conversionRate",label:"Conversion Rate"},{id:"impressions",label:"Impressions"},{id:"interactions",label:"Interactions"},{id:"failures",label:"Failures"}],Zc=t=>`${t.toFixed(1)}%`,ox=t=>({id:t.id,name:t.name,handle:t.handle,description:t.description,startDate:t.startDate,endDate:t.endDate,variants:t.variants.map(n=>({id:n.id,formId:n.formId,weight:n.weight}))}),rx=(t,n)=>{const s=t[0];return s?s.series.map((i,o)=>{const r={date:i.date};return t.forEach(a=>{const c=a.series[o];r[`variant-${a.id}`]=c?.[n]??0}),r}):[]},ki=t=>Jo(t,{transliterate:!0,camelize:!0}),ax=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
  margin-bottom: 50px;
`,lx=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,cx=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
`,dx=l.section`
  padding: 2px 3px;

  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.lg};
  box-shadow: ${ae.box};
`,ux=l.header`
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
`,px=l.div`
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
`,hx=l.span`
  display: inline-block;
  width: 10px;
  height: 10px;

  border-radius: 50%;
  background: ${({$status:t})=>{switch(t){case"active":return h.green600;case"scheduled":return h.yellow500;default:return h.gray400}}};
`,xx=l.div`
  padding: ${m.lg} ${m.xl} 0;
`,mx=l.div`
  display: inline-flex;
  margin-bottom: ${m.lg};

  background: ${h.gray100};
  border-radius: ${S.md};

  overflow: hidden;
`,gx=l.button`
  cursor: pointer;
  padding: ${m.sm} ${m.md};

  background: ${({$active:t})=>t?h.gray500:h.gray100};
  border: 0;
  color: ${({$active:t})=>t?h.white:h.gray800};
`,fx=l.div`
  display: grid;
  justify-content: start;
  align-items: end;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${m.md};

  padding: ${m.lg} ${m.xl} ${m.xl};
`,bx=l.div``,jx=l.article`
  padding: 2px;

  background: ${h.white};
  border: 1px solid ${h.gray200};
  border-radius: ${S.md};

  overflow: hidden;

  &.winner {
    border-color: ${h.green600};
  }
`,yx=l.div`
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
`,vx=l.header`
  display: flex;
  align-items: center;
  gap: ${m.md};

  padding: ${m.md};

  border-radius: ${S.md};
  background: ${h.gray050};

  font-size: 20px;
  font-weight: 600;
`,wx=l.span`
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
`,$x=l.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;

  padding: ${m.md};

  color: ${h.gray700};
`,Cx=l.footer`
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
`,kx=l.div`
  padding: ${m.xl};

  background: ${h.white};
  border: 1px dashed ${h.gray300};
  border-radius: ${S.lg};
  color: ${h.gray700};
`,Xc=l.div`
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
`,Sx=l.div`
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
`;const Lx=({variant:t,test:n})=>{const s=t.id===n.winnerVariantId,i=n.endDate&&fc(n.endDate),o=n.variants.indexOf(t);return e.jsxs(bx,{children:[s&&e.jsx(yx,{children:e.jsxs("div",{children:[e.jsx(Yc,{})," ",d(i?"Winner":"Winning")]})}),e.jsxs(jx,{className:E(s&&"winner"),children:[e.jsxs(vx,{children:[e.jsx(wx,{style:{backgroundColor:Jc(t,o)},children:String.fromCharCode(65+o)}),t.formName]}),e.jsxs($x,{children:[e.jsx("span",{children:d("Weight")}),e.jsxs("strong",{children:[t.weight,"%"]}),e.jsx("span",{children:d("Impressions")}),e.jsx("strong",{children:t.stats.served.toLocaleString()}),e.jsx("span",{children:d("Interactions")}),e.jsx("strong",{children:t.stats.interacted.toLocaleString()}),e.jsx("span",{children:d("Failures")}),e.jsx("strong",{children:t.stats.failed.toLocaleString()}),e.jsx("span",{children:d("Conversions")}),e.jsx("strong",{children:t.stats.completed.toLocaleString()})]}),e.jsxs(Cx,{children:[e.jsx("span",{children:d("Conversion Rate")}),e.jsx("span",{className:"thick",children:Zc(t.stats.conversionRate)})]})]})]},t.id)},Fx=({test:t,activeTab:n,setTab:s})=>{const i=rx(t.variants,n),o=n==="conversionRate";return e.jsxs(xx,{children:[e.jsx(mx,{children:ix.map(r=>e.jsx(gx,{$active:n===r.id,onClick:()=>s(t,r.id),children:d(r.label)},r.id))}),e.jsx(nt,{width:"100%",height:280,children:e.jsxs(y1,{data:i,margin:{top:12,right:12,left:0,bottom:0},children:[e.jsx(lc,{stroke:"#e5e7eb99",vertical:!1}),e.jsx(cc,{dataKey:"date",axisLine:!1,tickLine:!1,interval:2,tickFormatter:r=>new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),e.jsx(_o,{axisLine:!1,tickLine:!1,tickFormatter:r=>`${r}${o?"%":""}`}),e.jsx(Wo,{formatter:r=>o?Zc(Number(r)):Number(r),labelFormatter:r=>new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),t.variants.map((r,a)=>e.jsx(v1,{type:"linear",dataKey:`variant-${r.id}`,stroke:Jc(r,a),strokeWidth:2,dot:!1,name:r.formName||`Variant ${a+1}`},r.id))]})})]})},Ex=h.gray100,fa=h.gray300,Q=se`
  scrollbar-width: thin;
  scrollbar-color: ${fa} ${Ex};
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
`,_e=se`
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
`,Zo=se`
  span:after {
    content: 'alert';

    position: relative;
    top: 1px;

    padding-left: 5px;

    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'liga', 'dlig';
    font-family: Craft;
  }
`,Tx=l.div`
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
`,Nx=l(_.div)`
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
`,gn=l.h3`
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: end;
  gap: ${m.sm};

  margin: 0;
  padding: ${m.lg};

  font-size: 16px;
  box-shadow: ${ae.bottom};

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

    box-shadow: ${ae.bottom};
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
`,zx=l.div`
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
`,ba=20,Mx=(t,n)=>{const s=t?.getBoundingClientRect().top,i=window.innerHeight,o=n?.offsetHeight;return o===void 0?s:s&&o&&i?s+o>i-ba?s-(s+o-i+ba):s:0},Ix=(t,n,s)=>{const{dimensions:i}=Fc(),[o,r]=g.useState(0),[a,c]=g.useState(0);let u=null;const p=g.useCallback(()=>{u===null&&(u=requestAnimationFrame(()=>{u=null,r(Mx(t,n));const x=t?.getBoundingClientRect()?.left;x!=null&&i&&c(x-i.left)}))},[t,n,i,u]);return g.useEffect(()=>{p()},[s]),g.useEffect(()=>{const x=()=>{p()};if(n){const f=document.querySelector(Zn.toString()),b=new ResizeObserver(x);return b.observe(n),window.addEventListener("resize",x),window.addEventListener("scroll",x),f?.addEventListener("scroll",x),()=>{b.disconnect(),window.removeEventListener("resize",x),window.removeEventListener("scroll",x),f?.removeEventListener("scroll",x),u!==null&&cancelAnimationFrame(u)}}},[n,u,p]),{top:o,left:a}},ed=({wrapper:t,editor:n,isEditing:s})=>{const{top:i,left:o}=Ix(t,n,s),r=t?.offsetWidth,[a,c]=g.useState(!1);return{editorAnimation:Y({immediate:p=>["top","left","width","pointerEvents","transformOrigin"].includes(p),to:{top:i,left:o,width:r,opacity:s?1:0,transformOrigin:"top left",transform:s?"scaleY(1)":"scaleY(0.5)",pointerEvents:s?"initial":"none"},config:{tension:700,friction:40}}),isVisible:a,setVisible:c}},er=t=>e.jsxs(R,{viewBox:"0 0 512 512",...t,children:[e.jsx("style",{children:`.spinner-path {
      transform-origin: center;
      animation: spinner-animation 1s linear infinite reverse
    }

    @keyframes spinner-animation{
      100% {
        transform:rotate(360deg)
      }
    }`}),e.jsx("path",{className:"spinner-path",d:"M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"})]}),td=({children:t})=>{const{element:n}=Fc();return n?Do.createPortal(t,n):null},Ax=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M326.6 166.6L349.3 144 304 98.7l-22.6 22.6L192 210.7l-89.4-89.4L80 98.7 34.7 144l22.6 22.6L146.7 256 57.4 345.4 34.7 368 80 413.3l22.6-22.6L192 301.3l89.4 89.4L304 413.3 349.3 368l-22.6-22.6L237.3 256l89.4-89.4z"})}),nd=(t,n)=>{if(!t)return!1;for(const s of t)if("value"in s&&String(s.value)===String(n)||"children"in s&&nd(s.children,n))return!0;return!1},sd=t=>{if(t)for(const n of t){if("value"in n)return n.value;if("children"in n){const s=sd(n.children);if(s!==void 0)return s}}},id=(t,n)=>{if(t)for(const s of t){if("value"in s&&String(s.value)===String(n))return s;if("children"in s){const i=id(s.children,n);if(i!==void 0)return i}}},od=(t,n)=>{if(t)for(const s of t){if("value"in s&&String(s.value)===String(n))return s.shadowIndex;if("children"in s)return od(s.children,n)}},rd=(t,n)=>{if(t)for(const s of t){if("shadowIndex"in s&&s.shadowIndex===n)return s.value;if("children"in s){const i=rd(s.children,n);if(i!==void 0)return i}}},ad=(t,n,s=0,i)=>{let o=s,r;i!=null&&!n&&(r={label:d(i),value:"",shadowIndex:o++});const a=t?.map(c=>{if("value"in c&&(!n||c.label.toLowerCase().includes(n.toLowerCase())))return{...c,shadowIndex:o++};if("children"in c){const[u,p]=ad(c.children,n,o);if(u.length)return o=p,{...c,children:u}}return null}).filter(Boolean)||[];return r&&a.unshift(r),[a,o]},Rx=(t,n,s)=>g.useMemo(()=>ad(t,n,void 0,s),[t,n,s]),Px=t=>e.jsx(R,{viewBox:"0 0 100 100",version:"1.1",...t,children:e.jsx("g",{stroke:"none",strokeWidth:"1",children:e.jsx("g",{children:e.jsx("path",{d:"M100.006315,26.9686872 C100.006315,28.5816922 99.3611131,30.1946973 98.1997494,31.356061 L42.7123746,86.8434358 C41.5510109,88.0047995 39.9380058,88.6500015 38.3250008,88.6500015 C36.7119957,88.6500015 35.0989906,88.0047995 33.9376269,86.8434358 L1.80656569,54.7123746 C0.645202033,53.5510109 0,51.9380058 0,50.3250008 C0,48.7119957 0.645202033,47.0989906 1.80656569,45.9376269 L10.5813133,37.1628793 C11.742677,36.0015156 13.3556821,35.3563136 14.9686872,35.3563136 C16.5816922,35.3563136 18.1946973,36.0015156 19.356061,37.1628793 L38.3250008,56.1963393 L80.6502541,13.8065657 C81.8116178,12.645202 83.4246229,12 85.037628,12 C86.650633,12 88.2636381,12.645202 89.4250018,13.8065657 L98.1997494,22.5813133 C99.3611131,23.742677 100.006315,25.3556821 100.006315,26.9686872 Z",id:"raiarzrpcn-Shape"})})})}),ld=(t=1)=>t>10?"":`& > li {
    > label {
      padding-left: ${t*10+20}px;

      &.has-children {
        padding-left: ${(t+1)*12}px;
      }
    }

    > ul {
      ${ld(t+1)}
    }
  }`,Dx=l.ul`
  margin: 0;
  padding: 0;

  ul {
    ${ld()}
  }
`,Hs=l.div`
  position: absolute;
  left: 8px;
  top: 7px;

  width: 16px;
  font-size: 18px;
  font-weight: bold;

  fill: ${h.gray500};
`;l.div``;const cd=l.div`
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
`,Un=l.label`
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

    > ${cd} {
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
`,Bx=l.li`
  position: relative;

  &.focused {
    > ${Un} {
      background-color: #cfd8e3;
      color: ${h.gray700};

      > ${Hs} {
        fill: ${h.gray700};
      }
    }
  }

  &.has-children {
    > ${Un} {
    }
  }

  &.empty {
    > ${Un} {
      color: ${h.gray300};
      font-style: italic;

      &:hover {
        color: ${h.white};
      }
    }

    &.focused {
      > ${Un} {
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
`,Ox=l.input`
  width: 100%;
  padding: 7px 30px 7px 10px;

  border-bottom: 1px solid ${h.hairline};

  &:focus,
  &:active,
  &:hover {
    box-shadow: none;
    outline: none;
  }
`,_x=l.div`
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  ${Q};
`,dd=l.div`
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
`,Wx=l.div`
  > svg {
    fill: currentColor;
    width: 20px;
    height: 20px;
  }
`,ud=l(_.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;

  background-color: ${h.gray050};
  border-radius: ${S.lg};
  box-shadow: ${ae.container};

  overflow: hidden;
  z-index: 1000;
`,Ux=l.button`
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
`,Hx=l.div`
  position: relative;

  &.open {
    ${ud} {
      display: block;
    }

    ${dd} {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      &:hover {
        box-shadow: none;
        outline-color: transparent;
      }
    }
  }
`,pd=l.span`
  display: flex;
  align-items: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`,qx=l.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`,hd=({value:t,options:n,query:s,focusIndex:i,showValues:o,showHints:r,onChange:a})=>{const c=g.useRef([]);return g.useEffect(()=>{c.current[i]&&c.current[i].scrollIntoView({behavior:"smooth",block:"nearest"})},[i]),e.jsx(Dx,{children:n?.map((u,p)=>{let x,f,b;"value"in u&&(x=u.value,b=u.shadowIndex),"hint"in u&&(f=u.hint);let j;return"children"in u&&(j=u.children),e.jsxs(Bx,{ref:y=>{b!==void 0&&(c.current[b]=y)},onClick:y=>{y.stopPropagation(),x!==void 0&&a&&a(x)},className:E(j!==void 0&&"has-children",x===t&&"selected",x===""&&"empty",b===i&&"focused"),children:[e.jsxs(Un,{className:E(j!==void 0&&"has-children"),"data-value":x,children:[!j&&t===x&&e.jsx(Hs,{children:e.jsx(Px,{})}),e.jsxs(cd,{children:[u.icon&&e.jsx(qx,{children:u.icon}),e.jsx("div",{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u.label)}})})]}),!o&&r&&f&&e.jsx(ja,{children:f}),o&&x!==""&&x!==void 0&&x!==null&&x!==u.label&&e.jsx(ja,{children:x})]}),j&&e.jsx(hd,{options:j,value:t,query:s,focusIndex:i,onChange:a,showHints:r,showValues:o})]},p)})})},de=({emptyOption:t,value:n,options:s,showValues:i,showHints:o,showSelectedIcon:r,onChange:a,className:c,loading:u=!1})=>{const[p,x]=g.useState(!1),[f,b]=g.useState(""),[j,y]=g.useState(0),w=g.useRef(null),v=g.useRef(null),$=$t({callback:()=>x(!1),isEnabled:p,excludeClassNames:["dropdown-rollout"]}),{editorAnimation:C}=ed({wrapper:$.current,editor:v.current,isEditing:p}),F=g.useCallback(()=>{u||x(!p)},[u,p]),[N,M]=Rx(s,f,t),z=g.useMemo(()=>id(s,n),[s,n]),L=g.useMemo(()=>od(N,n),[N,n]);os(()=>x(!1),p),ft({meetsCondition:p,type:"keydown",callback:D=>{D.key==="ArrowDown"&&j<M-1&&y(J=>J+1),D.key==="ArrowUp"&&j>0&&y(J=>J-1)}},[j,M]),ft({meetsCondition:p,type:"keyup",callback:D=>{if(D.key==="Enter"){const J=rd(N,j);a?.(J),x(!1)}}},[N,j]),g.useEffect(()=>{u&&p&&x(!1)},[u,p]),g.useEffect(()=>{p?(w.current?.focus(),y(L||0)):b("")},[p,L]);const A=g.useCallback(D=>{a?.(D),x(!1)},[a]);return e.jsxs(Hx,{ref:$,className:E(p&&"open",c),onClick:F,children:[e.jsxs(dd,{className:E(u&&"disabled",(n===""||n===null)&&"empty"),children:[r&&e.jsx(pd,{children:z?.icon}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(z?.label||d(t))}}),u&&e.jsx(Wx,{children:e.jsx(er,{})})]}),e.jsx(td,{children:p&&e.jsxs(ud,{className:"dropdown-rollout",ref:v,style:C,children:[e.jsx(Ux,{children:e.jsx(Ax,{})}),e.jsx(Ox,{placeholder:d("Search..."),ref:w,value:f,onClick:D=>D.stopPropagation(),onKeyDown:D=>{["ArrowUp","ArrowDown"].includes(D.key)&&D.preventDefault()},onChange:D=>b(D.target.value)}),e.jsx(_x,{children:e.jsx(hd,{options:N,value:n,focusIndex:j,showValues:i,showHints:o,onChange:A})})]})})]})},Xn={all:["field-types"],propertySections:()=>[...Xn.all,"property-sections"]},xd=()=>T.get("/api/fields/types").then(t=>t.data),tr=({select:t}={})=>B({queryKey:Xn.all,queryFn:xd,staleTime:1/0,select:t}),md=()=>T.get("/api/fields/types/sections").then(t=>t.data).then(t=>t.sort((n,s)=>n.order-s.order)),nr=()=>B({queryKey:Xn.propertySections(),queryFn:md,staleTime:1/0}),Me=t=>{const{data:n}=tr();if(n)return n.find(s=>s.typeClass===t)},Yt=()=>{const{data:t}=tr();return n=>{if(t)return t.find(s=>s.typeClass===n)}},Qx={all:["page-type"]},gd=()=>B({queryKey:Qx.all,queryFn:()=>T.get("/api/types/page-buttons").then(t=>t.data),staleTime:1/0});var K=(t=>(t.Ai="ai",t.AppStateSelect="appStateSelect",t.AssetPicker="assetPicker",t.Attributes="attributes",t.Boolean="bool",t.BooleanEnv="boolEnv",t.FormMonitorTools="formMonitorTools",t.Calculation="calculation",t.Cards="cards",t.Checkboxes="checkboxes",t.CodeEditor="codeEditor",t.Color="color",t.ConditionalRules="conditionalRules",t.DateTime="dateTime",t.DynamicCheckboxes="dynamicCheckboxes",t.DynamicSelect="dynamicSelect",t.Field="field",t.FieldMapping="fieldMapping",t.FieldSelection="fieldSelection",t.FieldType="fieldType",t.Hidden="hidden",t.Integer="int",t.Label="label",t.MinMax="minMax",t.NotificationTemplate="notificationTemplate",t.OptionPicker="optionPicker",t.Options="options",t.PageButton="pageButton",t.PageButtonsLayout="pageButtonsLayout",t.RecipientMapping="recipientMapping",t.Recipients="recipients",t.SaveButton="saveButton",t.Select="select",t.String="string",t.Table="table",t.TabularData="tabularData",t.Textarea="textarea",t.WYSIWYG="wysiwyg",t))(K||{});const Pe={current:t=>t.form,settings:{all:()=>t=>t.form.settings||{},one:t=>n=>n.form.settings?.[t],namespaces:{all:t=>n=>n.form.settings?.[t],one:(t,n)=>s=>s.form.settings?.[t]?.[n]}},errors:t=>t.form.errors},Kx={namespace:(t,n)=>X(s=>s.translations?.[t],s=>{if(!n)return;let i,o=n?.uid;return"properties"in n?i="fields":"namespaceType"in n&&n.namespaceType==="settings"?(i="form",o=n.namespace):i="pages",s?.[i]?.[o]})},Vx=[K.Options];function Ce(t){const n=H(),{current:s,isPrimary:i}=Fe(),o=Yt(),a=P(Pe.settings.one("general"))?.translations,{data:c}=gd(),{data:u}=Gt(),p=t&&"typeClass"in t,x=t&&"namespaceType"in t&&t.namespaceType==="settings",f=s.id,b=x?t.namespace:t?.uid,j=p?"fields":x?"form":"pages",y=Pt(Kx.namespace(s.id,t)),w=g.useCallback(L=>{if(p){const A=o(t.typeClass);return A?A.properties.find(D=>D.handle===L):void 0}if(x){const A=u?.find(D=>D.handle===b);return A?A.properties.find(D=>D.handle===L):void 0}return c?.properties?.find(A=>A.handle===L)},[p,x,o,c,b]),v=g.useCallback(L=>t&&y?.[L]!==void 0,[t,y]),$=g.useCallback(L=>{if(!a||!t||i)return!1;const A=w(L);return A===void 0?L==="label":A.translatable},[i,t,a,w]),C=g.useCallback((L,A)=>!$(L)||!v(L)?A:y[L],[y,$,v]),F=g.useCallback((L,A)=>{if(!$(L)||!v(L))return A;const D=Mt(A),J=y[L];return D.source==="custom"&&J.options&&(D.options=D.options.map(pe=>{const St=J.options.find(on=>on.value===pe.value);return St?{...pe,label:St.label}:pe})),D},[y,$,v]);return{hasTranslation:v,willTranslate:$,getTranslation:C,getOptionTranslations:F,updateTranslation:(L,A)=>$(L)?(n(to.update({siteId:f,type:j,namespace:b,handle:L,value:A})),!0):!1,removeTranslation:L=>{$(L)&&n(to.remove({siteId:f,type:j,namespace:b,handle:L}))},canUseTranslationValue:L=>L.translatable&&Vx.includes(L.type)===!1,isTranslationsEnabled:a}}const En=l.label`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 6px;

  color: ${h.gray550};
  font-weight: ${({$regular:t})=>t?"normal":"bold"} !important;
`,Gx=l.span``,Yx=l.span`
  &:after {
    content: 'asterisk';

    color: ${h.red500};
    font-family: Craft;
    font-size: 10px;
  }
`,ya=18,fd=l.span`
  fill: ${h.gray500};

  &.active {
    cursor: pointer;
    fill: ${h.blue500};
  }

  svg {
    width: ${ya}px;
    height: ${ya}px;
  }
`,bd=l.span`
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
    ${En} {
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
`,Jx=l.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${m.sm};

  width: 100%;
`,Zx=l.div`
  flex: 1;
`,va=l.div``,jd=t=>g.useMemo(()=>t?t.split(/`([^`]+)`/g).map((i,o)=>o%2!==0?e.jsx("code",{children:i},o):i):null,[t]),cs=g.memo(({instructions:t})=>{const n=g.useMemo(()=>t?d(t):null,[t]),s=jd(n);return s?e.jsx(bd,{children:s}):null});cs.displayName="FormInstructions";const yd=t=>e.jsx(R,{viewBox:"0 0 640 512",...t,children:e.jsx("path",{d:"M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l208 0 32 0 16 0 256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L320 64l-16 0-32 0L64 64zm512 48c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16l-256 0 0-288 256 0zM178.3 175.9l64 144c4.5 10.1-.1 21.9-10.2 26.4s-21.9-.1-26.4-10.2L196.8 316l-73.6 0-8.9 20.1c-4.5 10.1-16.3 14.6-26.4 10.2s-14.6-16.3-10.2-26.4l64-144c3.2-7.2 10.4-11.9 18.3-11.9s15.1 4.7 18.3 11.9zM179 276l-19-42.8L141 276l38 0zM456 164c-11 0-20 9-20 20l0 4-52 0c-11 0-20 9-20 20s9 20 20 20l72 0 35.1 0c-7.3 16.7-17.4 31.9-29.8 45l-.5-.5-14.6-14.6c-7.8-7.8-20.5-7.8-28.3 0s-7.8 20.5 0 28.3L430 298.3c-5.9 3.6-12.1 6.9-18.5 9.8l-3.6 1.6c-10.1 4.5-14.6 16.3-10.2 26.4s16.3 14.6 26.4 10.2l3.6-1.6c12-5.3 23.4-11.8 34-19.4c4.3 3 8.6 5.8 13.1 8.5l18.9 11.3c9.5 5.7 21.8 2.6 27.4-6.9s2.6-21.8-6.9-27.4l-18.9-11.3c-.9-.5-1.8-1.1-2.7-1.6c17.2-18.8 30.7-40.9 39.6-65.4L534 228l2 0c11 0 20-9 20-20s-9-20-20-20l-16 0-44 0 0-4c0-11-9-20-20-20z"})}),vd=({label:t,handle:n,required:s,translatable:i,hasTranslation:o,isEncrypted:r,removeTranslation:a})=>t?e.jsxs(En,{className:E(s&&"is-required"),htmlFor:n,children:[e.jsx(Gx,{children:d(t)}),s&&e.jsx(Yx,{}),r&&e.jsx("i",{className:"fa-solid fa-shield-alt",style:{color:h.blue500},title:d("This field is encrypted.")}),i&&e.jsx(fd,{className:E(o&&"active"),title:o?d("Remove translation"):void 0,onClick:()=>{o&&confirm(d("Are you sure you want to remove the translation?"))&&a?.()},children:e.jsx(yd,{})})]}):null,wd=g.createContext({size:"normal"}),$d=({size:t,children:n})=>e.jsx(wd.Provider,{value:{size:t??"normal"},children:n}),ir=()=>g.useContext(wd),Xx=l.ul`
  list-style: square;

  margin-top: 5px;
  padding-left: 20px;

  color: ${h.error};
`,ti=({errors:t,...n})=>!t||!t.length?null:e.jsx(Xx,{...n,children:t.map((s,i)=>e.jsx("li",{children:s},i))}),e2=l.ul`
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
`,t2=({messages:t,...n})=>!t||!t.length?null:e.jsx(e2,{...n,children:t.map(({message:s,type:i},o)=>e.jsxs("li",{className:E(`message-type-${i}`,i,"has-icon"),children:[e.jsx("span",{className:"icon"}),d(s)]},o))}),Te=({edition:t,label:n,handle:s,required:i,instructions:o,translatable:r,hasTranslation:a,removeTranslation:c,width:u,disabled:p,children:x,errors:f,messages:b,isEncrypted:j,preContent:y,extraContent:w,align:v,justify:$})=>{const{size:C}=ir(),{editions:{isAtLeast:F}}=I,N=t!==re.Express&&!F(t||re.Express);return e.jsxs(ls,{className:E(!!f&&"errors",p&&"disabled",C&&`size-${C}`,N&&"upsell"),"data-upsell":d("Upgrade to {edition} to unlock this setting.",{edition:dc(t)}),$width:u,children:[e.jsxs(Jx,{children:[y!==void 0&&e.jsx(va,{children:y}),e.jsxs(Zx,{children:[e.jsx(vd,{label:n,handle:s,required:i,translatable:r,hasTranslation:a,isEncrypted:j,removeTranslation:c}),e.jsx(cs,{instructions:o})]}),w!==void 0&&e.jsx(va,{children:w})]}),e.jsx(sr,{className:E(v&&`align-${v}`,$&&`justify-${$}`),children:x}),e.jsx(ti,{errors:f}),e.jsx(t2,{messages:b})]})},W=({children:t,property:n,label:s,handle:i,required:o,instructions:r,width:a,disabled:c,errors:u,context:p,preContent:x,align:f,justify:b})=>{const{hasTranslation:j,removeTranslation:y,isTranslationsEnabled:w}=Ce(p),{edition:v,translatable:$,messages:C}=n||{};return e.jsx(Te,{edition:v,label:n?.label||s,handle:n?.handle||i,required:n?.required||o,instructions:n?.instructions||r,width:n?.width||a,disabled:n?.disabled||c,errors:u,messages:C,translatable:w&&$,hasTranslation:j(i),isEncrypted:n?.flags?.includes("encrypted"),removeTranslation:()=>y(i),preContent:x,align:f,justify:b,children:t})},Si=new Map([["en",ua],["en-US",ua]]),wa={nl:async()=>(await Pn(async()=>{const{nl:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.a9);return{nl:t}},[],import.meta.url)).nl,de:async()=>(await Pn(async()=>{const{de:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.aa);return{de:t}},[],import.meta.url)).de,fr:async()=>(await Pn(async()=>{const{fr:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.ab);return{fr:t}},[],import.meta.url)).fr,it:async()=>(await Pn(async()=>{const{it:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.ac);return{it:t}},[],import.meta.url)).it},n2=t=>{const n=String(t??"").trim().replace("_","-");if(!n)return"en-US";const[s,i]=n.split("-");return i?`${s.toLowerCase()}-${i.toUpperCase()}`:s.toLowerCase()};async function s2(t){const n=n2(t),s=n.includes("-")?[n,n.split("-")[0]]:[n],i=r=>r==="en"?["en-US"]:[r];for(const r of s.flatMap(i)){const a=Si.get(r);if(a)return a;const c=wa[r];if(!c)continue;const u=await c();return Si.set(r,u),u}const o=await wa["en-US"]();return Si.set("en-US",o),o}const i2=l.div`
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
`;const o2="yyyy-MM-dd",{metadata:{craft:{locale:r2}}}=I,so=({value:t,property:n,errors:s,updateValue:i})=>{const{dateFormat:o,minDate:r,maxDate:a}=n,c=o||o2,u=r?dn(r):void 0,p=a?dn(a):void 0,x=t?dn(t):void 0,[f,b]=g.useState(void 0);return g.useEffect(()=>{s2(r2).then(b).catch(()=>b(void 0))},[]),e.jsx(W,{property:n,errors:s,children:e.jsx(i2,{children:e.jsx(w1,{locale:f,id:n.handle,minDate:u,maxDate:p,selected:x,dateFormat:c,className:E("text","fullwidth"),onChange:j=>i(j?i0(j):null)})})})},a2=()=>e.jsxs(l2,{className:"notice has-icon",children:[e.jsx("span",{className:"icon","aria-hidden":"true"}),e.jsx("span",{className:"visually-hidden",children:"Tip: "}),e.jsxs("span",{children:[d("This can begin with an environment variable.")," ",e.jsx("a",{href:"https://craftcms.com/docs/5.x/configure.html#control-panel-settings",className:"go",target:"_blank",rel:"noopener noreferrer",children:d("Learn more")})]})]}),l2=l.p`
  margin-top: 5px;
`,c2=(t,n)=>g.useMemo(()=>!t||t.length===0?[]:n?t.map(i=>{const o=i.data.filter(r=>n?r.name.toLowerCase().includes(n.toLowerCase()):!0);return{...i,data:o}}).filter(i=>i.data.length>0):t,[t,n]),d2=t=>{const[n,s]=g.useState(!1);return g.useEffect(()=>{const i=t?.current;if(!i)return;const o=()=>s(!0),r=()=>{setTimeout(()=>{s(!1)},200)};return i.addEventListener("focus",o),i.addEventListener("blur",r),()=>{i.removeEventListener("focus",o),i.removeEventListener("blur",r)}},[t?.current]),n},u2=l.ul`
  position: absolute;
  z-index: 2;

  width: 100%;
  max-height: 300px;
  overflow-y: auto;

  padding: 0;
  margin: 0;

  background-color: ${h.white};
  border-radius: ${S.lg};
  box-shadow: ${ae.autosuggest};

  ${Q};
`,p2=l.li`
  padding-top: 8px;
`,h2=l.div`
  margin: 14px 0 3px;
  padding: 0 14px;

  color: ${h.gray400};
  font-size: 11px;
  line-height: 1.2;
  text-transform: uppercase;
`,x2=l.ul``,Cd=l.span`
  display: inline-block;
  width: 8px;
  height: 1px;
  background-color: ${h.gray400};
`,kd=l.span`
  flex: 0 0 auto;
  color: ${h.gray700};
`,Sd=l.span`
  flex: 0 1 auto;
  color: ${h.gray400};
`,m2=l.li`
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

    ${kd}, ${Sd} {
      color: ${h.white};
    }

    ${Cd} {
      background-color: ${h.white};
    }
  }
`,g2=({inputRef:t,filter:n,suggestions:s,update:i})=>{const o=d2(t),r=c2(s,n);return!r.length||!o?null:e.jsx(u2,{children:r.map(a=>e.jsxs(p2,{children:[e.jsx(h2,{children:a.label}),e.jsx(x2,{children:a.data.map(({name:c,hint:u})=>e.jsxs(m2,{onClick:()=>i(c),children:[e.jsx(kd,{children:c}),!!u&&e.jsxs(e.Fragment,{children:[e.jsx(Cd,{}),e.jsx(Sd,{children:u})]})]},c))})]},a.label))})},Dt=({value:t,property:n,errors:s,updateValue:i,autoFocus:o,context:r})=>{const{handle:a}=n,c=g.useRef(null);g.useEffect(()=>{o&&c.current?.focus({preventScroll:!0})},[o]);const u=n.flags?.includes("code"),p=n.flags?.includes("readonly")||n.flags?.includes("as-readonly-in-instance"),x=n.flags?.includes("env-suggest"),{data:f}=B({queryKey:["autosuggest","env"],queryFn:()=>T.get("/api/autosuggest/env").then(b=>b.data),enabled:x,staleTime:1/0,gcTime:1/0});return e.jsxs(W,{property:n,errors:s,context:r,children:[e.jsx("input",{id:a,ref:c,type:"text",autoComplete:"off","data-1p-ignore":!0,readOnly:p,className:E("text","fullwidth",u&&"code",p&&"readonly"),value:t??"",placeholder:n.placeholder,onChange:b=>i(b.target.value)}),x&&!!f&&e.jsxs(e.Fragment,{children:[e.jsx(g2,{inputRef:c,filter:t,suggestions:f,update:b=>i(b)}),e.jsx(a2,{})]})]})},f2=l.textarea`
  &.read-only {
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);

    user-select: none;
  }
`,ds=oe.forwardRef(({value:t,property:n,errors:s,updateValue:i,autoFocus:o,focus:r,context:a},c)=>{const{handle:u,rows:p}=n,x=g.useRef(null);return g.useImperativeHandle(c,()=>x.current),g.useEffect(()=>{r&&x.current?.focus()},[r]),e.jsx(W,{property:n,errors:s,context:a,children:e.jsx(f2,{id:u,ref:x,className:E("text","fullwidth",n.flags?.includes("as-readonly-in-instance")&&"read-only",n.flags?.includes("code")&&"code"),readOnly:n.flags?.includes("as-readonly-in-instance"),rows:p,value:t??"",placeholder:n.placeholder,autoFocus:o,onChange:f=>i(f.target.value)})})});ds.displayName="Textarea";const us={tension:300},b2=(t,n)=>Y({width:t?20:0,opacity:t?1:0,immediate:n,config:us}),j2=(t,n,s)=>Y({width:t?s?30:15:0,opacity:t?1:0,immediate:n,config:us}),y2=(t,n,s,i)=>Y({width:t&&n?s.loading.width:s.original.width,height:s.original.height,immediate:i,config:us}),v2=(t,n,s)=>Y({opacity:t&&n?0:1,transform:t&&n?"translateY(-30px)":"translateY(0px)",immediate:s,cancel:!n,config:us}),w2=(t,n)=>Y({opacity:t?1:0,transform:t?"translateY(0px)":"translateY(30px)",immediate:n,config:us}),$2=l.span`
  display: flex;

  svg {
    fill: currentColor;
  }
`,C2=l(_.span)`
  position: relative;

  overflow: hidden;
  transform-origin: center center;
`,Ld=l(_.span)`
  position: absolute;
  left: 0;
  top: 0;

  opacity: 0;
  white-space: nowrap;
`,k2=l(Ld)`
  transform: translateY(0px);
  opacity: 1;
`,S2=l(Ld)``,L2=l(_.span)`
  overflow: hidden;
  transform-origin: center right;

  align-self: center;
  width: 20px;
  height: 16px;

  svg {
    width: 16px;
    height: 16px;
  }
`,F2=l(_.span)`
  white-space: nowrap;
  overflow: hidden;
  transform-origin: center left;
`,E2=Uo`
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
  animation-name: ${E2};
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
`,Z=({children:t,loadingText:n,loading:s,spinner:i,instant:o,xl:r,...a})=>{const c=oe.useRef(null),u=oe.useRef(null),[p,x]=g.useState({original:{width:void 0,height:void 0},loading:{width:void 0}});g.useEffect(()=>{if(!c.current)return;const v=c.current.offsetWidth,$=c.current.offsetHeight,C=u.current?.offsetWidth||v;x({original:{width:v,height:$},loading:{width:C}})},[c.current,t,n]);const f=b2(s,o),b=j2(s,o,r),j=v2(s,n,o),y=w2(s,o),w=y2(s,n,p,o);return e.jsxs($2,{...a,children:[i&&e.jsx(L2,{style:f,children:e.jsx(er,{})}),e.jsxs(C2,{style:w,children:[!!n&&e.jsx(S2,{ref:u,style:y,children:n}),e.jsx(k2,{ref:c,style:j,children:t})]}),e.jsxs(F2,{style:b,children:[e.jsx(Li,{}),e.jsx(Li,{}),e.jsx(Li,{})]})]})},ni={base:["ab-tests"],dashboard:()=>[...ni.base,"dashboard"]},T2=()=>{const t=Wh(),{data:n}=B({queryKey:ni.dashboard(),queryFn:()=>T.get("/api/ab-tests/dashboard").then(i=>i.data)});return g.useMemo(()=>n?.map(i=>({...i,variants:i.variants.map(o=>({...o,formColor:o.formColor||t[o.formId]||null}))}))||[],[n,t])},N2=t=>{const n=ee();return ce({mutationFn:s=>{const i={...s};return t?T.post(`/api/ab-tests/${t}`,i).then(o=>o.data):T.post("/api/ab-tests",i).then(o=>o.data)},onSuccess:()=>{n.invalidateQueries({queryKey:ni.base})}})},z2=()=>{const t=ee();return ce({mutationFn:n=>T.post(`/api/ab-tests/${n}/delete`).then(s=>s.data),onSuccess:()=>{t.invalidateQueries({queryKey:ni.base})}})},M2=t=>({id:t?.id,name:t?.name||"",handle:t?.handle||"",description:t?.description||"",startDate:t?.startDate||null,endDate:t?.endDate||null,variants:t?.variants||[]}),I2=({closeModal:t,data:n})=>{const s=n?.test,[i,o]=g.useState(M2(s)),[r,a]=g.useState(!!s?.handle&&s.handle!==ki(s.name)),{data:c}=ei(),u=N2(s?.id),p=g.useMemo(()=>(c||[]).map(f=>({id:f.id,name:f.name})),[c]),x=i.name.trim().length>0&&i.handle?.trim().length>0&&i.variants.length>0&&i.variants.every(f=>!!f.formId);return e.jsxs(ve,{style:{maxWidth:"860px"},children:[e.jsx(we,{children:e.jsx("h1",{children:s?.id?d("Edit A/B Test"):d("Create A/B Test")})}),e.jsxs(Xc,{children:[e.jsx(Dt,{value:i.name,updateValue:f=>{o(b=>({...b,name:f,handle:r?b.handle:ki(f)}))},property:{type:K.String,handle:"name",label:d("Name")}}),e.jsx(Dt,{value:i.handle||"",updateValue:f=>{a(!0),o(b=>({...b,handle:ki(f)}))},property:{type:K.String,handle:"handle",label:d("Handle")}}),e.jsx(ds,{value:i.description||"",updateValue:f=>o(b=>({...b,description:f})),property:{type:K.Textarea,handle:"description",label:d("Description"),rows:3}}),e.jsxs(Sx,{children:[e.jsx(so,{value:i.startDate||null,updateValue:f=>o(b=>({...b,startDate:f})),property:{type:K.DateTime,handle:"startDate",label:d("Start Date"),dateFormat:"yyyy-MM-dd"}}),e.jsx(so,{value:i.endDate||null,updateValue:f=>o(b=>({...b,endDate:f})),property:{type:K.DateTime,handle:"endDate",label:d("End Date"),dateFormat:"yyyy-MM-dd"}})]}),e.jsx(W,{label:"Variants",children:e.jsxs("div",{children:[e.jsxs("table",{className:"table editable fullwidth",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("Form")}),e.jsx("th",{children:d("Weight")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:i.variants.map((f,b)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(de,{emptyOption:"Select form...",value:f.formId?.toString()||"",onChange:j=>{const y=Number(j);o(w=>({...w,variants:w.variants.map((v,$)=>$===b?{...v,formId:y}:v)}))},options:p.map(j=>({label:j.name,value:j.id.toString()}))})}),e.jsx("td",{className:"singleline-cell textual thin weight",children:e.jsx("input",{className:"text fullwidth",type:"number",min:0,value:f.weight,onChange:j=>{const y=Number(j.target.value);o(w=>({...w,variants:w.variants.map((v,$)=>$===b?{...v,weight:y}:v)}))}})}),e.jsx("td",{className:"thin action",children:e.jsx("button",{type:"button",title:d("Delete"),className:"delete icon",onClick:()=>o(j=>({...j,variants:j.variants.filter((y,w)=>w!==b)}))})})]},f.id||b))})]}),e.jsx("button",{type:"button",className:"btn dashed add icon",onClick:()=>o(f=>({...f,variants:[...f.variants,{id:G(),formId:void 0,weight:50}]})),children:d("Add Variant")})]})})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:d("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",disabled:!x,children:e.jsx(Z,{loading:u.isPending,loadingText:d("Saving"),spinner:!0,onClick:()=>u.mutate(i,{onSuccess:()=>{Xe.success(d("A/B Test Group saved successfully.")),t()}}),children:d("Save")})})]})]})},A2=({data:t,closeModal:n})=>{const s=z2();return e.jsxs(ve,{style:{maxWidth:"560px"},children:[e.jsx(we,{children:e.jsx("h1",{children:d("Delete A/B Test")})}),e.jsx(Xc,{style:{minHeight:0},children:e.jsx("p",{children:d('Are you sure you want to delete "{name}"? This action cannot be undone.',{name:t?.name||""})})}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(Z,{loading:s.isPending,loadingText:d("Deleting"),spinner:!0,onClick:()=>s.mutate(t?.id,{onSuccess:()=>{Xe.success(d("A/B Test Group deleted successfully.")),n()}}),children:d("Delete")})})]})]})},R2=()=>{Fn("ab-tests");const{openModal:t}=Ke(),[n]=Ho(),s=T2(),[i,o]=g.useState({}),r=g.useRef(null),a=g.useCallback(c=>{t(I2,c?{test:ox(c)}:{})},[t]);return g.useEffect(()=>{const c=n.get("edit");if(!c||!s||r.current===c)return;const u=s.find(p=>p.id===Number(c));u&&(r.current=c,a(u))},[n,s,a]),e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"ab-tests-list",label:"A/B Tests",url:"/ab-tests"}),e.jsxs(lx,{children:[e.jsx(Ln,{children:d("A/B Tests")}),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:()=>a(),children:d("Add Test")})]}),e.jsxs(ax,{children:[!s?.length&&e.jsx(kx,{children:d("No A/B Tests found. Create your first test.")}),e.jsx(cx,{children:s?.map(c=>{const u=i[c.id]||"conversionRate",p=c.startDate&&o0(c.startDate),x=c.endDate&&fc(c.endDate);let f="active";p?f="scheduled":x&&(f="ended");const b=d(f.at(0)?.toUpperCase()+f.slice(1)||""),{totalImpressions:j,totalInteractions:y,totalFailures:w,totalConversions:v}=c,$=[e.jsx(hx,{$status:f},"status"),d(b),!p&&d("{days} days",{days:c.days}),d("{count} variants",{count:c.variantCount}),d("{count} impressions",{count:j}),d("{count} interactions",{count:y}),d("{failures} failures",{failures:w}),d("{conversions} conversions",{conversions:v})].filter(Boolean);return e.jsxs(dx,{children:[e.jsxs(ux,{children:[e.jsxs("div",{children:[e.jsx("h2",{children:c.name}),!!c.description&&e.jsx("p",{children:c.description}),e.jsx(px,{children:$.map((C,F)=>e.jsx("span",{children:C},F))})]}),e.jsx(sx,{onDelete:()=>t(A2,{id:c.id,name:c.name}),onEdit:()=>a(c)})]}),e.jsx(Fx,{test:c,activeTab:u,setTab:(C,F)=>{o(N=>({...N,[C.id]:F}))}}),e.jsx(fx,{children:c.variants.map(C=>e.jsx(Lx,{variant:C,test:c},C.id))})]},c.id)})})]})]})},P2=l.div`
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
`,D2=l.h2`
  margin: 0;
  padding: 0;

  font-size: 1.5rem;
  color: ${h.gray500};
`,B2=l.h2`
  margin: 0;
  padding: 0;

  font-size: 1.2rem;
  font-weight: normal;
  color: ${h.gray500};
`,O2=l.p`
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
`,at=({title:t,subtitle:n,icon:s,iconFade:i,lite:o,children:r})=>o?e.jsx($a,{className:"padded",children:e.jsx(B2,{children:t})}):e.jsxs($a,{children:[s&&e.jsx(P2,{className:E(i&&"fade"),children:s}),t&&e.jsx(D2,{children:t}),n&&e.jsx(O2,{children:n}),r]}),ps=t=>e.jsxs(R,{height:"1em",viewBox:"0 0 512 512",...t,children:[e.jsx("defs",{children:e.jsx("style",{children:".fa-secondary{opacity:0.2;fill:#a1a5aa;}.fa-primary{fill:#a6a8ab;}"})}),e.jsx("path",{className:"fa-primary",d:"M274.6 144.2c8.7 1.5 14.6 9.7 13.2 18.4l-32 192c-1.5 8.7-9.7 14.6-18.4 13.2s-14.6-9.7-13.2-18.4l32-192c1.5-8.7 9.7-14.6 18.4-13.2zm-87.3 60.5c6.2 6.2 6.2 16.4 0 22.6L158.6 256l28.7 28.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6l40-40c6.2-6.2 16.4-6.2 22.6 0zm137.4 0c6.2-6.2 16.4-6.2 22.6 0l40 40c6.2 6.2 6.2 16.4 0 22.6l-40 40c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L353.4 256l-28.7-28.7c-6.2-6.2-6.2-16.4 0-22.6z"}),e.jsx("path",{className:"fa-secondary",d:"M305.4 21.8c-1.3-10.4-9.1-18.8-19.5-20C276.1 .6 266.1 0 256 0c-11.1 0-22.1 .7-32.8 2.1c-10.3 1.3-18 9.7-19.3 20l-2.9 23.1c-.8 6.4-5.4 11.6-11.5 13.7c-9.6 3.2-19 7.2-27.9 11.7c-5.8 3-12.8 2.5-18-1.5l-18-14c-8.2-6.4-19.7-6.8-27.9-.4c-16.6 13-31.5 28-44.4 44.7c-6.3 8.2-5.9 19.6 .5 27.8l14.2 18.3c4 5.1 4.4 12 1.5 17.8c-4.4 8.8-8.2 17.9-11.3 27.4c-2 6.2-7.3 10.8-13.7 11.6l-22.8 2.9c-10.3 1.3-18.7 9.1-20 19.4C.7 234.8 0 245.3 0 256c0 10.6 .6 21.1 1.9 31.4c1.3 10.3 9.7 18.1 20 19.4l22.8 2.9c6.4 .8 11.7 5.4 13.7 11.6c3.1 9.5 6.9 18.7 11.3 27.5c2.9 5.8 2.4 12.7-1.5 17.8L54 384.8c-6.4 8.2-6.8 19.6-.5 27.8c12.9 16.7 27.8 31.7 44.4 44.7c8.2 6.4 19.7 6 27.9-.4l18-14c5.1-4 12.2-4.4 18-1.5c9 4.6 18.3 8.5 27.9 11.7c6.1 2.1 10.7 7.3 11.5 13.7l2.9 23.1c1.3 10.3 9 18.7 19.3 20c10.7 1.4 21.7 2.1 32.8 2.1c10.1 0 20.1-.6 29.9-1.7c10.4-1.2 18.2-9.7 19.5-20l2.8-22.5c.8-6.5 5.5-11.8 11.7-13.8c10-3.2 19.7-7.2 29-11.8c5.8-2.9 12.7-2.4 17.8 1.5L385 457.9c8.2 6.4 19.6 6.8 27.8 .5c2.8-2.2 5.5-4.4 8.2-6.7L451.7 421c1.8-2.2 3.6-4.4 5.4-6.6c6.5-8.2 6-19.7-.4-27.9l-14-17.9c-4-5.1-4.4-12.2-1.5-18c4.8-9.4 9-19.3 12.3-29.5c2-6.2 7.3-10.8 13.7-11.6l22.8-2.8c10.3-1.3 18.8-9.1 20-19.4c.2-1.7 .4-3.5 .6-5.2V230.1c-.2-1.7-.4-3.5-.6-5.2c-1.3-10.3-9.7-18.1-20-19.4l-22.8-2.8c-6.4-.8-11.7-5.4-13.7-11.6c-3.4-10.2-7.5-20.1-12.3-29.5c-3-5.8-2.5-12.8 1.5-18l14-17.9c6.4-8.2 6.8-19.7 .4-27.9c-1.8-2.2-3.6-4.4-5.4-6.6L421 60.3c-2.7-2.3-5.4-4.5-8.2-6.7c-8.2-6.4-19.6-5.9-27.8 .5L366.7 68.3c-5.1 4-12.1 4.4-17.8 1.5c-9.3-4.6-19-8.6-29-11.8c-6.2-2-10.9-7.3-11.7-13.7l-2.8-22.5zM287.8 162.6l-32 192c-1.5 8.7-9.7 14.6-18.4 13.2s-14.6-9.7-13.2-18.4l32-192c1.5-8.7 9.7-14.6 18.4-13.2s14.6 9.7 13.2 18.4zM187.3 227.3L158.6 256l28.7 28.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6l40-40c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6zm160-22.6l40 40c6.2 6.2 6.2 16.4 0 22.6l-40 40c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L353.4 256l-28.7-28.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0z"})]}),_2=new Set(["limited-users","ai"]),or=({activeKey:t})=>{const{data:n,isFetching:s}=B({queryKey:["settings","navigation"],queryFn:()=>T.get("/api/settings/navigation").then(i=>i.data)});return!n&&s?e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",children:e.jsx("nav",{children:e.jsx("ul",{children:Array.from({length:10}).map((i,o)=>e.jsx("li",{children:e.jsx(k,{width:140,height:10})},o))})})})}):e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",children:e.jsx("nav",{children:e.jsx("ul",{children:Object.entries(n).map(([i,o])=>{if(o.title){const r=i===t,a=_2.has(i);return e.jsx("li",{children:a?e.jsx(rt,{className:r?"sel":void 0,to:`/settings/${i}`,dangerouslySetInnerHTML:{__html:O.sanitize(o.title)}}):e.jsx("a",{className:r?"sel":void 0,href:me(`settings/${i}`),dangerouslySetInnerHTML:{__html:O.sanitize(o.title)}})},i)}return o.heading?e.jsx("li",{className:"heading",children:e.jsx("span",{children:o.heading})},i):null})})})})})},W2=({activeKey:t,children:n})=>e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx(or,{activeKey:t}),e.jsx("div",{id:"content-container",className:E(!I.metadata.craft.is5&&"craft-4"),children:e.jsx("div",{id:"content",className:"content-pane",children:n})})]}),Ca=l.div`
  padding: 0;
`,U2=l.div.attrs(()=>({className:"tablepane"}))``,Fd=l.div`
  padding: 80px ${m.lg} 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`,ka=l.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${m.md};
  margin-bottom: ${m.xl};
`,Hn=l.div`
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
`,H2=l(Vn)`
  font-size: 14px;
`,q2=l(H2)`
  font-size: 15px;
  color: ${({$color:t})=>t||"inherit"};
  font-weight: 600;
`,Q2=l.div`
  display: inline-flex;
  align-items: center;
  gap: ${m.xs};
`,K2=l.span`
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: ${({$color:t})=>t||h.gray400};
  flex: 0 0 12px;
`,V2=l.div`
  margin-top: ${m.xs};
  font-size: 14px;
  color: ${h.gray500};
  font-style: italic;
`,G2=l(Hn)`
  text-align: center;
  grid-column: span 2;
  padding: ${m.xl};
  border: 1px solid ${h.gray100};
  border-radius: ${S.lg};
  background: ${h.gray050};
`,Y2=l(Vn)`
  font-size: 40px;
  line-height: 1.05;
  margin: 0 0 ${m.xs};
`,J2=l.div`
  margin-top: ${m.sm};
`,Sa=l.section`
  margin-bottom: ${m.xl};

  &:last-child {
    margin-bottom: 0;
  }
`,Ed=l.p`
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
`,Z2=l.div`
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
`,Ue=l.th`
  text-align: left;
  padding: ${m.sm};
  font-weight: 600;
  border-bottom: 0;
`,ao=l.tr`
  &:nth-child(even) {
    background: #f4f7fc;
  }
`,He=l.td`
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
`;const qs={all:["ai"],usage:()=>[...qs.all,"usage"],plans:t=>[...qs.all,"plans",t??""]};function X2(){return T.get(me("api/ai/usage")).then(t=>t.data)}function em(t){return T.get(me("api/ai/plans"),{params:void 0}).then(s=>s.data)}function tm(t,n,s,i){return T.post(me("api/ai/create-checkout-session"),{success_url:t,cancel_url:n,...s&&{bundle_key:s},...i&&{currency:i}}).then(o=>o.data)}function Td(t){return B({queryKey:qs.usage(),queryFn:X2,enabled:t?.enabled??!0,retry:(n,s)=>T.isAxiosError(s)&&(s.response?.status===404||s.response?.status===403)?!1:n<2})}function nm(t){return B({queryKey:qs.plans(t),queryFn:()=>em(),retry:(n,s)=>T.isAxiosError(s)&&(s.response?.status===404||s.response?.status===403)?!1:n<2})}function Nd(){const t=I.metadata?.craft?.locale;return typeof t=="string"&&t.trim()?t.trim():void 0}const lo=t=>{if(!t)return"—";try{const n=dn(t);if(Number.isNaN(n.getTime()))return t;const s=Nd();return n.toLocaleDateString(s,{dateStyle:"medium"})}catch{return t}},sm=t=>{if(!t)return"—";try{const n=dn(t);if(Number.isNaN(n.getTime()))return t;const s=Nd();return n.toLocaleString(s,{dateStyle:"medium",timeStyle:"short"})}catch{return t}},La=l.div`
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
`,im=l(ve)`
  width: min(1320px, calc(100vw - ${m.xl}));
  max-width: min(1320px, calc(100vw - ${m.xl}));
`,om=l.div`
  padding: ${m.lg} ${m.xl};
`,rm=l.strong`
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
`,am=l.p`
  margin: ${m.xs} 0 ${m.sm};
  min-height: 40px;
  color: ${h.gray500};
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  max-width: 160px;
`,lm=l.div`
  margin-top: auto;
  display: grid;
  gap: ${m.md};
  justify-items: center;
  padding-top: ${m.xs};
`,cm=l.div`
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
`,dm=l.div`
  font-size: 17px;
  color: ${h.gray500};
  text-align: center;
`,um=l.span`
  font-size: 19px;
  font-weight: 700;
`,pm=l.div`
  display: flex;
  justify-content: stretch;
  width: 100%;
  margin-top: ${m.md};
`,hm=l.button`
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
`,xm=l.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${m.md};

  h1 {
    margin: 0;
    line-height: 1.2;
  }
`,mm=l.div`
  margin-top: ${m.xl};
  padding-top: ${m.lg};
  border-top: 1px solid ${h.gray100};
`,Ea=l.p`
  margin: ${m.sm} 0 0;
  color: ${h.gray500};
  font-size: 14px;
`;function zd(t,n,s){const i=I.metadata?.craft?.locale,o=(s||n||"usd").toLowerCase(),r=i?t.toLocaleString(i,{maximumFractionDigits:0,minimumFractionDigits:0}):t.toLocaleString();return o==="eur"?`€${r}`:o==="usd"?`$${r}`:`${r} ${o.toUpperCase()}`}const gm=5,fm=2;function bm(t){return[...t??[]].sort((s,i)=>{const o=s.paid_at?Date.parse(s.paid_at):0;return(i.paid_at?Date.parse(i.paid_at):0)-o})}function jm(t,n){const s=t.package_price,i=typeof s=="number"?s:typeof s=="string"?parseFloat(s):NaN;return s==null||Number.isNaN(i)?"—":zd(Math.round(i),n,n)}function ym(t){const n=t.credits;if(n==null)return"—";const s=typeof n=="number"?n:Number(n);return Number.isNaN(s)?"—":Number.isInteger(s)?String(s):s.toLocaleString()}const vm=({closeModal:t})=>{const{data:n,isFetching:s}=nm(),{data:i,isPending:o,isFetching:r,isError:a}=Td(),c=s&&!n,u=c||!a&&(o||r&&i===void 0),p=oe.useMemo(()=>bm(i?.payment_history).slice(0,gm),[i?.payment_history]),[x,f]=oe.useState(null),b=n?.currency??"usd";return e.jsxs(im,{children:[e.jsx(we,{children:e.jsx(xm,{children:e.jsx("h1",{children:d("Purchase SolspaceAI Credits")})})}),e.jsxs(om,{children:[c?e.jsx(Fi,{children:e.jsx(La,{children:Array.from({length:5}).map((j,y)=>e.jsxs(Fa,{children:[e.jsx("strong",{children:e.jsx(k,{width:110,height:14})}),e.jsx("p",{children:e.jsx(k,{count:2})}),e.jsx("div",{children:e.jsx(k,{width:90,height:12})}),e.jsx("div",{children:e.jsx(k,{width:120,height:12})}),e.jsx("div",{children:e.jsx(k,{width:110,height:32})})]},y))})}):e.jsx(Fi,{children:e.jsx(La,{children:(n?.bundles??[]).map(j=>e.jsxs(Fa,{children:[e.jsx(rm,{children:(j.name||"").trim()||d("Credit plan")}),e.jsx(am,{children:(j.description||"").trim()||d("Credit package for SolspaceAI usage.")}),e.jsxs(lm,{children:[e.jsx(cm,{children:zd(j.price,j.currency,n?.currency)}),e.jsxs(dm,{children:[e.jsx(um,{children:j.credits.toLocaleString()})," ",d("credits")]})]}),e.jsx(pm,{children:e.jsx(hm,{type:"button",disabled:x===j.key,onClick:async()=>{try{f(j.key);const y=window.location.href,w=await tm(y,y,j.key,n?.currency);w?.url&&(window.location.href=w.url)}finally{f(null)}},children:x===j.key?d("Loading..."):d("Buy now")})})]},j.key))})}),e.jsx(Fi,{children:e.jsxs(mm,{children:[e.jsx(io,{children:d("Recent Payments")}),e.jsx(Ed,{children:d("Your recent SolspaceAI credit purchase history.")}),u?e.jsxs(oo,{children:[e.jsx(ro,{children:e.jsxs("tr",{children:[e.jsx(Ue,{children:d("Date")}),e.jsx(Ue,{children:d("Amount")}),e.jsx(Ue,{children:d("Credits")})]})}),e.jsx("tbody",{children:Array.from({length:fm}).map((j,y)=>e.jsxs(ao,{children:[e.jsx(He,{children:e.jsx(k,{width:100,height:12})}),e.jsx(He,{children:e.jsx(k,{width:72,height:12})}),e.jsx(He,{children:e.jsx(k,{width:56,height:12})})]},`pay-skel-${y}`))})]}):a?e.jsx(Ea,{children:d("Unable to load payment history.")}):p.length===0?e.jsx(Ea,{children:d("No purchases yet.")}):e.jsxs(oo,{children:[e.jsx(ro,{children:e.jsxs("tr",{children:[e.jsx(Ue,{children:d("Date")}),e.jsx(Ue,{children:d("Amount")}),e.jsx(Ue,{children:d("Credits")})]})}),e.jsx("tbody",{children:p.map((j,y)=>e.jsxs(ao,{children:[e.jsx(He,{children:lo(j.paid_at)}),e.jsx(He,{children:jm(j,b)}),e.jsx(He,{children:ym(j)})]},j.paid_at?`${j.paid_at}-${y}`:`payment-${y}`))})]})]})})]}),e.jsx($e,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:d("Close")})})]})},wm=oe.lazy(()=>Pn(()=>import("./ai.usage-chart-D9Y8f6Xf.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)),Ta="/integrations/ai/SolspaceAIV1",Cs=({title:t,subtitle:n,iconFade:s,children:i})=>e.jsx(U2,{children:e.jsx(Fd,{children:e.jsx(at,{title:t,subtitle:n,icon:e.jsx(ps,{}),iconFade:s,children:i})})}),$m=()=>{const{openModal:t}=Ke();Fn("freeform/settings");const n=I.editions.is(re.Pro),{data:s,isFetching:i,error:o,isError:r}=Td({enabled:n}),a=r&&T.isAxiosError(o)&&o.response?.status===404,c=r&&T.isAxiosError(o)&&o.response?.status===403,u=a||c,p=s??void 0,x=p!=null,f=oe.useMemo(()=>{const C=(p?.payment_history??[]).map(F=>F?.paid_at).filter(F=>typeof F=="string"&&!!F);return C.length?C.sort((F,N)=>N.localeCompare(F))[0]:null},[p?.payment_history]),b=oe.useMemo(()=>{const $=p?.credit_status;if(!$)return d("Unknown");switch($){case"Free trial":case"Active":case"Low credits":case"Out of credits":return d($);default:return $}},[p]),j=!a&&!c&&i&&!p,y=!a&&!c&&!j&&!r,w=r&&T.isAxiosError(o)&&o.response?.data?.message?o.response.data.message:r&&o instanceof Error?o.message:null,v=$=>e.jsxs("div",{children:[e.jsx(q,{id:"settings",label:d("Settings"),url:".",external:!0}),e.jsx(q,{id:"solspace-ai",label:d("SolspaceAI"),url:"settings/ai"}),e.jsx(Ln,{children:d("SolspaceAI")}),e.jsx(W2,{activeKey:"ai",children:$})]});return v(n?e.jsxs(e.Fragment,{children:[r&&!u&&e.jsx(Cs,{title:d("Error loading usage"),subtitle:w??d("Failed to load usage data"),iconFade:!0}),a&&e.jsx(Cs,{title:d("SolspaceAI is not enabled"),subtitle:d("Enable SolspaceAI in the Integrations area to view usage."),iconFade:!0,children:e.jsx(rt,{to:Ta,className:"btn submit",children:d("Enable SolspaceAI")})}),c&&e.jsx(Cs,{title:d("Authorize SolspaceAI to view usage"),subtitle:d("Authorize SolspaceAI in the Integrations area (click Authorize on the SolspaceAI integration) to view usage."),iconFade:!0,children:e.jsx(rt,{to:Ta,className:"btn submit",children:d("Go to Integrations")})}),j&&e.jsxs(Ca,{children:[e.jsxs(ka,{children:[e.jsxs(Hn,{children:[e.jsx($s,{children:e.jsx(k,{width:80,height:10})}),e.jsx(Vn,{children:e.jsx(k,{width:100,height:24})})]}),e.jsxs(Hn,{children:[e.jsx($s,{children:e.jsx(k,{width:80,height:10})}),e.jsx(Vn,{children:e.jsx(k,{width:140,height:18})})]}),e.jsxs(Hn,{children:[e.jsx($s,{children:e.jsx(k,{width:80,height:10})}),e.jsx(Vn,{children:e.jsx(k,{width:120,height:18})})]})]}),e.jsxs(Sa,{children:[e.jsx(io,{children:e.jsx(k,{width:140,height:12})}),e.jsx(Z2,{children:e.jsx("div",{style:{height:220}})})]})]}),y&&e.jsxs(Ca,{children:[e.jsx(ka,{children:p&&e.jsxs(e.Fragment,{children:[(p.credits_remaining!=null||p.credits_total!=null)&&e.jsxs(G2,{children:[e.jsx(Y2,{children:p.credits_remaining!=null?p.credits_remaining.toLocaleString():"—"}),e.jsx($s,{children:d("Credits remaining")})]}),e.jsxs(Hn,{children:[e.jsxs(Q2,{children:[e.jsx(K2,{$color:p.credit_status_color??null}),e.jsx(q2,{$color:p.credit_status_color??null,children:b})]}),p.credit_status==="Active"&&f&&e.jsxs(V2,{children:[d("Since")," ",lo(f)]}),e.jsx(J2,{children:e.jsx("button",{type:"button",className:"btn submit",onClick:()=>t(vm),children:d("Add credits")})})]})]})}),p?.daily_metrics&&p.daily_metrics.length>0&&e.jsx(oe.Suspense,{fallback:null,children:e.jsx(wm,{metrics:p.daily_metrics})}),p?.request_logs&&p.request_logs.length>0&&e.jsxs(Sa,{children:[e.jsx(io,{children:d("Request Log")}),e.jsx(Ed,{children:d("A list of recent AI requests and their credit usage.")}),e.jsxs(oo,{children:[e.jsx(ro,{children:e.jsxs("tr",{children:[e.jsx(Ue,{children:d("Date & time")}),e.jsx(Ue,{children:d("Status")}),e.jsx(Ue,{children:d("Credits")}),e.jsx(Ue,{children:d("Duration")}),e.jsx(Ue,{children:d("Request ID")})]})}),e.jsx("tbody",{children:p.request_logs.map(($,C)=>e.jsxs(ao,{children:[e.jsx(He,{children:$.requested_at?sm($.requested_at):$.date?lo($.date):d("Unknown")}),e.jsx(He,{children:$.status==="success"?d("Success"):$.status==="failure"?d("Failed"):$.status||"—"}),e.jsx(He,{children:$.credits!=null?`${$.credits} ${d("credits")}`:"—"}),e.jsx(He,{children:$.duration_s??"—"}),e.jsx(He,{children:e.jsx("code",{children:$.request_id??"—"})})]},$.request_id??C))})]})]}),!x&&e.jsx(Fd,{children:e.jsx(at,{title:d("No usage data yet"),subtitle:d("Usage will appear here once you start using SolspaceAI."),icon:e.jsx(ps,{}),iconFade:!0})})]})]}):e.jsx(Cs,{title:d("SolspaceAI requires Freeform Pro"),subtitle:d("Upgrade to the Freeform Pro edition to get access to SolspaceAI."),children:e.jsx("a",{href:Craft.getCpUrl("plugin-store/freeform"),className:"btn submit",target:"_blank",rel:"noreferrer",children:d("Plugin Store")})}))},zt={all:["rules"],form:t=>[...zt.all,"forms",t],notifications:t=>[...zt.form(t),"notifications"],integrations:t=>[...zt.form(t),"integrations"]},Cm=t=>{const n=ee();return g.useCallback(()=>{t&&n.removeQueries({queryKey:zt.form(t)})},[t,n])},Tn=t=>{const n=qt();return B({queryKey:zt.form(t),queryFn:()=>T.get(`/api/forms/${t}/rules`).then(s=>s.data).then(s=>(n(cn.set(s.fields)),n(_n.set(s.pages)),n(Wn.set(s.submitForm)),n(ln.set(s.buttons)),s)),staleTime:1/0,gcTime:1/0})},Md=t=>{const n=qt();return B({queryKey:zt.notifications(t),queryFn:()=>T.get(`/api/forms/${t||0}/rules/notifications`).then(s=>s.data).then(s=>(n(On.set(s)),s)),staleTime:1/0,gcTime:1/0})},km=t=>{const n=qt();return B({queryKey:zt.integrations(t),queryFn:()=>T.get(`/api/forms/${t||0}/rules/integrations`).then(s=>s.data).then(s=>(n(Bn.set(s)),s)),staleTime:1/0,gcTime:1/0})},Id=l.div`
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
`,qe={base:["form-monitor"],tests:(t,n)=>[...qe.base,"tests",t,n],stats:t=>[...qe.base,"stats",t],testEmailHistory:t=>[...qe.base,"test-email-history",t],testEmailStatus:t=>[...qe.base,"test-email-status",t],mailerInfo:()=>[...qe.base,"mailer-info"]},Sm=(t,n={})=>{const{limit:s=100,offset:i=0}=n;return B({queryKey:qe.tests(t,{limit:s,offset:i}),queryFn:()=>T.get(`/api/form-monitor/forms/${t}/tests`,{params:{limit:s,offset:i}}).then(o=>o.data),staleTime:0,refetchOnWindowFocus:!1,enabled:!!t})},Rd=(t,n)=>B({queryKey:qe.stats(t),queryFn:()=>T.get(`/api/form-monitor/forms/${t}/stats`).then(s=>s.data),enabled:n?.enabled??!!t}),Lm=(t,n={})=>{const{limit:s=50,offset:i=0}=n;return B({queryKey:qe.testEmailHistory({limit:s,offset:i}),queryFn:()=>T.get("/api/form-monitor/test-email/history",{params:{limit:s,offset:i}}).then(o=>o.data),staleTime:0,refetchOnWindowFocus:!1,enabled:!!t})},Fm=(t,n)=>B({queryKey:qe.testEmailStatus(t||""),queryFn:()=>T.get("/api/form-monitor/test-email/status",{params:{token:t}}).then(s=>s.data),enabled:(n?.enabled??!0)&&!!t,refetchInterval:n?.refetchInterval??!1}),Em=(t,n)=>ce({mutationFn:()=>T.post("/api/form-monitor/test-email",{formId:t}).then(s=>s.data),onSuccess:s=>{n?.onSuccess?.(s)},onError:n?.onError}),Pd=()=>B({queryKey:qe.mailerInfo(),queryFn:()=>T.get("/api/form-monitor/mailer-info").then(t=>t.data),staleTime:300*1e3});l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
  padding: ${m.xl};
  background: ${h.white};
  height: 100%;
  flex: 1;
`;const Tm=l.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
`,Nm={sm:se`
    font-size: 10px;
    padding: 2px 6px;
    gap: 4px;
  `,md:se`
    font-size: 12px;
    padding: 2px 6px;
    gap: 6px;
  `,lg:se`
    font-size: 14px;
    padding: 2px 6px;
    gap: 8px;
  `,xl:se`
    font-size: 16px;
    padding: 6px 10px 6px 6px;
    gap: 6px;
    width: fit-content;
  `},zm={sm:se`
    width: 8px;
    height: 8px;
  `,md:se`
    width: 10px;
    height: 10px;
  `,lg:se`
    width: 12px;
    height: 12px;
  `,xl:se`
    width: 20px;
    height: 20px;
  `},xt=l.div`
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 999px;
  ${({$size:t="sm"})=>Nm[t]}
  background-color: ${({$status:t})=>{switch(t){case"success":case"active":return"rgba(34, 197, 94, 0.2)";case"failed":return"rgba(239, 68, 68, 0.2)";case"pending":return"rgba(55, 65, 81, 0.2)";case"inactive":return"rgba(107, 114, 128, 0.2)";default:return"rgba(156, 163, 175, 0.2)"}}};
  color: ${({$status:t})=>{switch(t){case"success":case"active":return h.green600;case"failed":return h.red600;case"pending":return h.gray700;case"inactive":return h.gray600;default:return h.gray600}}};
`,fn=l.span`
  display: inline-block;
  border-radius: 50%;
  background-color: currentColor;
  position: relative;
  ${({$size:t="sm"})=>zm[t]}

  ${({$status:t})=>t==="pending"&&se`
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
`,Mm=l.div`
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
`,Im=(t,n)=>ce({mutationFn:()=>T.put(`/api/form-monitor/forms/${t}/enable`),onMutate:()=>{n?.onLoading?.()},onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Am=(t,n,s)=>ce({mutationFn:()=>T.delete(`/api/form-monitor/forms/${t}/tests/${n}`),onSuccess:()=>{s?.onSuccess?.()},onError:()=>{s?.onError?.()}}),Rm=(t,n)=>ce({mutationFn:()=>T.delete(`/api/form-monitor/forms/${t}/tests/all`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Pm=(t,n)=>ce({mutationFn:()=>T.put(`/api/form-monitor/forms/${t}/disable`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Dm=(t,n)=>ce({mutationFn:()=>T.put(`/api/form-monitor/forms/${t}/disable-and-clear`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),Bm=t=>e.jsx(R,{height:"800",viewBox:"0 0 50 50",width:"800",...t,children:e.jsx("path",{d:"m46.4375-.03125c-.167969-.0078125-.339844.0078125-.5.03125-.671875.09375-1.25.421875-1.65625 1.03125l-.03125.0625-.03125.03125-8.5625 16.09375c-.964844-.359375-1.921875-.570312-2.8125-.59375-.960937-.023437-1.867187.125-2.6875.46875-1.582031.660156-2.777344 1.953125-3.5625 3.59375-.035156.050781-.066406.101563-.09375.15625-.003906.007813.003906.023438 0 .03125-.011719.019531-.023437.042969-.03125.0625-.011719.039063-.023437.082031-.03125.125-.542969 1.355469-1.167969 2.574219-1.875 3.65625-.007812.011719-.023437.019531-.03125.03125-.089844.078125-.164062.175781-.21875.28125-.003906.007813.003906.023438 0 .03125-.035156.050781-.066406.101563-.09375.15625-2.386719 3.417969-5.496094 5.476563-8.4375 6.75-4.007812 1.734375-7.84375 1.917969-8.6875 1.84375-.402344-.039062-.789062.164063-.980469.519531-.1875.355469-.148437.792969.105469 1.105469 11.394531 14.0625 28.15625 14.5625 28.15625 14.5625.199219.003906.394531-.050781.5625-.15625 0 0 2.070313-1.3125 4.5625-4.4375 1.871094-2.347656 4.003906-5.742187 5.84375-10.4375l.03125-.03125c.230469-.214844.347656-.527344.3125-.84375 0-.011719 0-.019531 0-.03125.484375-1.308594.953125-2.683594 1.375-4.1875.015625-.0625.027344-.125.03125-.1875 0-.011719 0-.019531 0-.03125 1.332031-3.4375-.152344-7.222656-3.34375-8.875l6.1875-17.15625v-.03125l.03125-.03125c.203125-.710937-.03125-1.394531-.40625-1.9375-.355469-.511719-.875-.914062-1.5-1.1875v-.03125c-.019531-.007812-.042969.007813-.0625 0-.011719-.003906-.019531-.027344-.03125-.03125-.488281-.230469-1.023437-.3867188-1.53125-.40625zm-.125 2.09375c.226563-.035156.523438-.035156.84375.125l.03125.03125h.03125c.324219.128906.59375.347656.71875.53125s.089844.292969.09375.28125l-6.09375 16.90625c-.734375-.332031-1.242187-.566406-2.28125-1.03125-.773437-.347656-1.507812-.683594-2.15625-.96875l8.4375-15.78125c-.007812.007813.148438-.058594.375-.09375zm-42.3125 5.9375c-2.199219 0-4 1.800781-4 4s1.800781 4 4 4 4-1.800781 4-4-1.800781-4-4-4zm0 2c1.117188 0 2 .882813 2 2 0 1.117188-.882812 2-2 2-1.117187 0-2-.882812-2-2 0-1.117187.882813-2 2-2zm9 1c-1.105469 0-2 .894531-2 2s.894531 2 2 2 2-.894531 2-2-.894531-2-2-2zm-1.5 7c-3.027344 0-5.5 2.472656-5.5 5.5s2.472656 5.5 5.5 5.5 5.5-2.472656 5.5-5.5-2.472656-5.5-5.5-5.5zm21.3125.625c.695313.019531 1.457031.160156 2.3125.5.019531.011719.042969.023438.0625.03125.226563.355469.652344.53125 1.0625.4375.113281.046875.101563.042969.21875.09375.675781.292969 1.527344.652344 2.375 1.03125 1.242188.554688 2.027344.894531 2.75 1.21875.019531.023438.039063.042969.0625.0625.214844.296875.574219.453125.9375.40625h.03125c2.390625 1.09375 3.445313 3.699219 2.625 6.21875-.394531-.011719-.695312.007813-1.4375-.15625-.554687-.121094-1.09375-.316406-1.5-.5625s-.640625-.488281-.75-.8125c-.085937-.28125-.292969-.507812-.566406-.621094-.269531-.117187-.578125-.105468-.839844.027344-.335937.167969-1.183594.105469-1.9375-.28125-.375-.191406-.710937-.460937-.9375-.6875-.226562-.226562-.289062-.441406-.28125-.40625-.054687-.292969-.234375-.546875-.496094-.691406-.257812-.144531-.570312-.164063-.847656-.058594-.027344.011719-.359375.042969-.75-.03125s-.84375-.234375-1.28125-.4375-.839844-.449219-1.09375-.65625-.277344-.421875-.25-.15625c-.066406-.527344-.53125-.914062-1.0625-.875-1.003906.09375-1.945312-.644531-2.5-1.125.585938-.988281 1.3125-1.777344 2.21875-2.15625.554688-.230469 1.179688-.332031 1.875-.3125zm-21.3125 1.375c1.945313 0 3.5 1.554688 3.5 3.5 0 1.945313-1.554687 3.5-3.5 3.5-1.945312 0-3.5-1.554687-3.5-3.5 0-1.945312 1.554688-3.5 3.5-3.5zm16.3125 2.96875c.695313.5 1.660156 1.019531 2.8125 1.125.183594.269531.382813.488281.625.6875.433594.359375.96875.675781 1.53125.9375s1.152344.480469 1.75.59375c.308594.058594.625-.058594.9375-.0625.148438.226563.214844.527344.40625.71875.40625.40625.890625.75 1.4375 1.03125.8125.417969 1.789063.5625 2.75.4375.328125.492188.722656.90625 1.1875 1.1875.683594.410156 1.429688.660156 2.125.8125.488281.105469.933594.152344 1.34375.1875-.277344.898438-.578125 1.742188-.875 2.5625-.359375-.011719-.800781-.03125-1.28125-.125-1.09375-.210937-2.128906-.695312-2.5625-1.53125-.234375-.4375-.753906-.636719-1.21875-.46875-.496094.175781-1.394531.101563-2.15625-.25-.761719-.351562-1.339844-.960937-1.46875-1.40625-.082031-.269531-.277344-.492187-.535156-.609375-.253906-.121094-.546875-.125-.808594-.015625-.242187.101563-1.1875.074219-1.96875-.28125s-1.285156-.953125-1.34375-1.28125c-.050781-.277344-.214844-.515625-.453125-.664062-.238281-.148438-.527344-.191407-.796875-.117188-.945312.253906-1.683594-.082031-2.28125-.53125-.207031-.152344-.359375-.320312-.5-.46875.484375-.769531.933594-1.585937 1.34375-2.46875zm-2.5 4.125c.148438.136719.289063.269531.46875.40625.738281.554688 1.875.949219 3.15625.875.464844.871094 1.21875 1.539063 2.09375 1.9375.863281.394531 1.785156.519531 2.6875.40625.5.816406 1.195313 1.507813 2.0625 1.90625.925781.425781 1.964844.535156 2.96875.375.933594 1.167969 2.261719 1.804688 3.4375 2.03125.3125.058594.621094.097656.90625.125-1.664062 4.019531-3.527344 6.960938-5.15625 9-2.085937 2.613281-3.496094 3.601563-3.8125 3.8125-.355469-.015625-2.960937-.199219-6.625-1.21875.300781-.195312.625-.398437.96875-.65625 1.667969-1.25 3.851563-3.289062 5.96875-6.4375.222656-.324219.238281-.746094.035156-1.082031-.203125-.339844-.582031-.527344-.972656-.480469-.292969.03125-.554687.191406-.71875.4375-1.984375 2.953125-4.027344 4.84375-5.53125 5.96875-1.429687 1.070313-2.257812 1.402344-2.34375 1.4375-2.25-.792969-4.742187-1.878906-7.28125-3.40625.367188-.121094.757813-.28125 1.1875-.46875 1.898438-.828125 4.4375-2.375 7.03125-5.28125.3125-.3125.382813-.792969.175781-1.179687-.210937-.390625-.648437-.597657-1.082031-.507813-.230469.039063-.441406.164063-.59375.34375-2.40625 2.691406-4.660156 4.058594-6.3125 4.78125s-2.59375.78125-2.59375.78125c-.042969.007813-.085937.019531-.125.03125-2.074219-1.460937-4.144531-3.238281-6.09375-5.375 1.902344-.148437 4.351563-.535156 7.375-1.84375 2.984375-1.292969 6.167969-3.402344 8.71875-6.71875z"})}),Om=t=>e.jsx(R,{width:"48",height:"48",viewBox:"0 0 24 24",...t,children:e.jsxs("g",{children:[e.jsx("circle",{cx:"12",cy:"2.5",r:"1.5",fill:"gray",opacity:".14"}),e.jsx("circle",{cx:"16.75",cy:"3.77",r:"1.5",fill:"gray",opacity:".29"}),e.jsx("circle",{cx:"20.23",cy:"7.25",r:"1.5",fill:"gray",opacity:".43"}),e.jsx("circle",{cx:"21.5",cy:"12",r:"1.5",fill:"gray",opacity:".57"}),e.jsx("circle",{cx:"20.23",cy:"16.75",r:"1.5",fill:"gray",opacity:".71"}),e.jsx("circle",{cx:"16.75",cy:"20.23",r:"1.5",fill:"gray",opacity:".86"}),e.jsx("circle",{cx:"12",cy:"21.5",r:"1.5",fill:"gray"}),e.jsx("animateTransform",{attributeName:"transform",calcMode:"discrete",dur:"0.75s",repeatCount:"indefinite",type:"rotate",values:"0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"})]})}),_m=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{fill:"#0f0f0f",children:[e.jsx("path",{d:"m6 12c0 .5523.44772 1 1 1h10c.5523 0 1-.4477 1-1s-.4477-1-1-1h-10c-.55228 0-1 .4477-1 1z"}),e.jsx("path",{clipRule:"evenodd",d:"m12 23c6.0751 0 11-4.9249 11-11 0-6.07513-4.9249-11-11-11-6.07513 0-11 4.92487-11 11 0 6.0751 4.92487 11 11 11zm0-2.0068c-4.96679 0-8.99317-4.0264-8.99317-8.9932 0-4.96679 4.02638-8.99317 8.99317-8.99317 4.9668 0 8.9932 4.02638 8.9932 8.99317 0 4.9668-4.0264 8.9932-8.9932 8.9932z",fillRule:"evenodd"})]})}),Wm=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{fill:"#1c274c",children:[e.jsx("path",{d:"m9.87787 4.24993c.30923-.8749 1.14363-1.49993 2.12213-1.49993s1.813.62503 2.1222 1.49993c.138.39054.5665.59524.9571.4572.3905-.13804.5952-.56653.4572-.95706-.5145-1.45548-1.9025-2.50007-3.5365-2.50007-1.6339 0-3.02196 1.04459-3.53639 2.50007-.13804.39053.06665.81902.45719.95706s.81903-.06666.95707-.4572z"}),e.jsx("path",{d:"m2.75 6c0-.41421.33579-.75.75-.75h17.0001c.4142 0 .75.33579.75.75s-.3358.75-.75.75h-17.0001c-.41421 0-.75-.33579-.75-.75z"}),e.jsx("path",{d:"m5.11686 7.75166c.41329-.02755.77067.28515.79822.69845l.45995 6.89909c.08985 1.3479.15388 2.2857.29445 2.9913.13635.6845.32668 1.0468.60009 1.3026.27342.2557.64758.4216 1.33958.5121.7134.0933 1.65345.0948 3.00425.0948h.7734c1.3508 0 2.2908-.0015 3.0042-.0948.692-.0905 1.0662-.2564 1.3396-.5121.2734-.2558.4637-.6181.6001-1.3026.1405-.7056.2046-1.6434.2944-2.9913l.46-6.89909c.0275-.4133.3849-.726.7982-.69845s.726.38493.6985.79823l-.4635 6.95171c-.0855 1.2828-.1546 2.3189-.3165 3.132-.1684.8453-.4548 1.5514-1.0464 2.1048-.5916.5535-1.3152.7923-2.1698.9041-.8221.1075-1.8605.1075-3.1461.1075h-.8788c-1.2856 0-2.32407 0-3.14611-.1075-.85465-.1118-1.5782-.3506-2.16979-.9041-.5916-.5534-.87802-1.2595-1.04642-2.1048-.16197-.8131-.23103-1.8492-.31652-3.132l-.46345-6.95171c-.02756-.4133.28515-.77068.69845-.79823z"})]})}),hs=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: ${m.md} ${m.xl};
`,Um=({formId:t,onClose:n,onSuccess:s})=>{const i=Pm(t,{onSuccess:()=>{s(),n()}}),o=()=>{i.mutate()};return e.jsx(wt,{closeModal:n,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Disable Monitoring")})}),e.jsx(hs,{children:e.jsx("div",{children:d("Are you sure you want to disable monitoring for this form?")})}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",onClick:o,disabled:i.isPending,children:d("Disable")})]})]})})},Hm=({formId:t,onClose:n,onSuccess:s})=>{const i=ne(),o=ee(),[r,a]=g.useState(!1),[c,u]=g.useState(""),p=Dm(t,{onSuccess:()=>{o.invalidateQueries({queryKey:qe.base}),o.invalidateQueries({queryKey:fe.single(t)}),s(),n(),i(`/forms/${t}`,{replace:!0})}}),x=()=>{r&&p.mutate()},f=b=>{u(b.target.value)};return g.useEffect(()=>{a(c.toUpperCase()==="CONFIRM")},[c]),e.jsx(wt,{closeModal:n,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Disable & Delete Monitoring Data")})}),e.jsxs(hs,{children:[e.jsx("div",{children:d("Are you sure you want to disable monitoring and delete all monitoring data for this form?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(d("To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:c,autoComplete:"off",onChange:f,className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Cancel")}),e.jsx("button",{type:"button",className:`btn submit ${r?"":"disabled"}`,onClick:x,disabled:p.isPending||!r,children:d("Disable & Delete")})]})]})})},Dd=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  padding: ${m.md};
  width: 100%;
`,qm=l.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Qm=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,Km=l(Dd)`
  padding: ${m.xl};
  background: ${h.white};
`,Vm=l.div`
  margin-bottom: ${m.xl};
`,Na=l.div`
  display: grid;
  grid-template-columns: 100px 150px 120px 1fr 120px;
  gap: ${m.md};
`,Gm=()=>e.jsx(Qt,{baseColor:h.gray100,highlightColor:h.gray200,children:e.jsxs(Dd,{children:[e.jsx(k,{width:100,height:20}),e.jsx(k,{width:120,height:16}),[...Array(3)].map((t,n)=>e.jsxs(qm,{children:[e.jsxs(Qm,{children:[e.jsx(k,{width:80,height:14}),e.jsx(k,{width:60,height:14})]}),e.jsx(k,{width:"100%",height:8})]},n))]})}),Ym=()=>e.jsx(Qt,{baseColor:h.gray100,highlightColor:h.gray200,children:e.jsxs(Km,{children:[e.jsxs(Vm,{children:[e.jsx(k,{height:24,width:300}),e.jsx(k,{height:100})]}),e.jsxs(Na,{children:[e.jsx(k,{height:24}),e.jsx(k,{height:24}),e.jsx(k,{height:24}),e.jsx(k,{height:24}),e.jsx(k,{height:24})]}),[...Array(10)].map((t,n)=>e.jsxs(Na,{children:[e.jsx(k,{height:40}),e.jsx(k,{height:40}),e.jsx(k,{height:40}),e.jsx(k,{height:40}),e.jsx(k,{height:40,width:100})]},n))]})}),Bd=({formId:t,testId:n,onClose:s,onSuccess:i})=>{const[o,r]=g.useState(!1),[a,c]=g.useState(""),u=n===0,p=Am(t,n,{onSuccess:()=>{i?.(),s()}}),x=Rm(t,{onSuccess:()=>{i?.(),s()}}),f=y=>{c(y.target.value)},b=()=>{u&&!o||(u?x.mutate():p.mutate())};g.useEffect(()=>{r(u?a.toUpperCase()==="DELETE":!0)},[a,u]);const j=p.isPending||x.isPending;return e.jsx(wt,{closeModal:s,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d(u?"Clear All Test History":"Delete Test")})}),e.jsxs(hs,{children:[e.jsx("div",{children:d(u?"Are you sure you want to clear all test history? This action cannot be undone.":"Are you sure you want to permanently delete this test? This action cannot be undone.")}),u&&e.jsxs(e.Fragment,{children:[e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(d("To clear all test history, please type <strong>DELETE</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:a,autoComplete:"off",onChange:f,className:"text fullwidth"})]})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:s,children:d("Cancel")}),e.jsx("button",{type:"button",className:E("btn submit",!o&&"disabled"),onClick:b,disabled:j||!o,children:e.jsx(Z,{loadingText:d(u?"Clearing":"Deleting"),loading:j,spinner:!0,children:d(u?"Clear All":"Delete")})})]})]})})},Jm=l.div`
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
`;const Zm=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,Xm=l.div`
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
`,eg=l.div`
  padding: 0 ${m.md};
  h3 {
    margin: 0 0 ${m.md};
  }
`,tg=l.div`
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
`,ng=l.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${m.xs};
`,sg=l.button`
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
`,ig=l.div`
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
`;const og=l.code`
  display: block;
  padding: ${m.xs};
  background: ${h.gray100};
  border-radius: 3px;
  font-size: 12px;
  word-break: break-all;
  color: ${h.gray700};
`,rg=l.div`
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
`,ag=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  margin-top: ${m.lg};
  position: relative;
`,lg=l.button`
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
`,cg=l.div`
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
`,dg=l(co)`
  border-top: 1px solid ${h.gray200};
  color: ${h.red600};

  svg {
    stroke: ${h.red600};
  }

  &:hover {
    background: ${h.red050};
  }
`,ug=t=>t==="pending"?"Processing":t.charAt(0).toUpperCase()+t.slice(1),pg=({configuration:t,refetchData:n,hasTests:s,isError:i})=>{const[o,r]=oe.useState(null),[a,c]=oe.useState(!1),[u,p]=oe.useState(!1),[x,f]=oe.useState(!1),[b,j]=oe.useState(!1),y=oe.useRef(null);oe.useEffect(()=>{const C=F=>{y.current&&!y.current.contains(F.target)&&j(!1)};return document.addEventListener("mousedown",C),()=>{document.removeEventListener("mousedown",C)}},[]);const w=Im(t.formId,{onLoading:()=>{r("loading")},onSuccess:()=>{r("success"),setTimeout(()=>{r(null),n()},2e3)},onError:()=>{r("error"),setTimeout(()=>{r(null)},2e3)}}),v=()=>{w.mutate()},$=()=>o==="loading"?d("Reactivating service..."):o==="error"?d("Reactivation unsuccessful."):o==="success"?d("Service reactivated!"):null;return e.jsxs(eg,{children:[e.jsx("h3",{children:d("Configuration")}),e.jsxs(tg,{children:[!i&&e.jsxs(Ei,{children:[e.jsx(Ti,{children:d("Integration Status")}),e.jsxs(xt,{$size:"sm",$status:t.integrationStatus==="enabled"?"success":"disabled",children:[e.jsx(fn,{$size:"md"}),d(t.integrationStatus==="enabled"?"ENABLED":"DISABLED")]})]}),e.jsxs(Ei,{children:[e.jsx(Ti,{children:d("Service Status")}),e.jsxs(ng,{children:[e.jsxs(xt,{$size:"sm",$status:t.serviceStatus==="active"?"active":t.serviceStatus==="inactive"?"inactive":"disabled",children:[e.jsx(fn,{$size:"md"}),d(i?"Error":t.serviceStatus==="active"?"ACTIVE":t.serviceStatus==="inactive"?"INACTIVE":"DISABLED")]}),t.serviceStatus==="inactive"&&t.integrationStatus==="enabled"&&(o?e.jsx(ig,{$error:o==="error",children:$()}):e.jsx(sg,{onClick:v,disabled:w.isPending,children:d("Reactivate")}))]})]}),t?.monitoredUrl&&e.jsxs(Ei,{$isColumn:!0,children:[e.jsx(Ti,{children:d("Monitored URL")}),e.jsx(og,{children:t.monitoredUrl})]}),e.jsxs(ag,{ref:y,children:[!i&&e.jsx(lg,{onClick:()=>j(!b),"aria-expanded":b,"aria-controls":"action-menu",title:d("Actions"),children:e.jsx(Vc,{})}),b&&e.jsxs(cg,{id:"action-menu",children:[s&&e.jsxs(co,{onClick:()=>{j(!1),c(!0)},children:[e.jsx(Bm,{}),d("Clear All Test History")]}),t.serviceStatus!=="inactive"&&e.jsxs(co,{onClick:()=>{j(!1),p(!0)},children:[e.jsx(_m,{}),d("Disable Monitoring")]}),e.jsxs(dg,{onClick:()=>{j(!1),f(!0)},children:[e.jsx(Wm,{}),d("Disable & Delete Monitoring Data")]})]})]})]}),a&&e.jsx(Bd,{formId:t.formId,testId:0,onClose:()=>c(!1),onSuccess:()=>{c(!1),n()}}),u&&e.jsx(Um,{formId:t.formId,onClose:()=>p(!1),onSuccess:()=>{p(!1),n()}}),x&&e.jsx(Hm,{formId:t.formId,onClose:()=>f(!1),onSuccess:()=>{f(!1),n()}})]})},za=({lastTest:t})=>{const n=t?.totalStatus;return n?e.jsxs(Xm,{children:[e.jsx("h3",{children:d("Most Recent Test")}),e.jsxs(Zm,{children:[t?.dateAttempted,e.jsx("div",{className:`status-${n}`,children:e.jsx("div",{className:"status-main",children:e.jsxs(xt,{$status:n,$size:"xl",children:[e.jsx(fn,{$size:"xl",$status:n,children:n==="pending"&&e.jsx(Om,{})}),d(ug(n))]})})})]})]}):null},hg=({nextMonitoringTime:t,nextMonitoringTimeIn:n})=>n?e.jsxs(rg,{children:[e.jsx("h3",{children:d("Next Scheduled Test")}),e.jsxs("div",{className:"next-test-time",children:[t," ",e.jsx("br",{})," (",d("in")," ",n?.humanReadable,")"]})]}):null,xg=({formTestsQuery:t})=>{const{data:n,isLoading:s,refetch:i}=t;if(s)return e.jsx(De,{children:e.jsx(Gm,{})});const o={integrationStatus:n?.enabled?"enabled":"disabled",serviceStatus:n?.fmFormStats?.enabled?"active":"inactive",monitoredUrl:n?.url||"",formId:n?.formId},r=n?.stats?.total>0,a=!!t.data?.error?.message;return e.jsx(De,{children:e.jsxs(Jm,{children:[r?e.jsxs(e.Fragment,{children:[e.jsx(za,{lastTest:n?.lastSubmission}),n?.lastSubmission?.status!=="pending"&&e.jsx(hg,{nextMonitoringTime:n?.fmFormStats?.nextMonitoringTime,nextMonitoringTimeIn:n?.fmFormStats?.nextMonitoringTimeIn})]}):e.jsx(za,{}),e.jsx(pg,{configuration:o,refetchData:i,hasTests:r,isError:a})]})})},mg=()=>{const{formId:t}=V(),[n]=Ho(),s=100,i=Number(n.get("page"))||1,o=i>0?(i-1)*s:0,r=Sm(Number(t),{limit:s,offset:o});return e.jsxs(Tm,{children:[e.jsx(xg,{formTestsQuery:r}),e.jsx(jt,{context:{formTestsQuery:r}})]})};function Ct(t){const[n,s]=g.useState(!1),i=()=>s(!0),o=()=>s(!1);return g.useEffect(()=>{const r=t.current;if(r)return r.addEventListener("mouseenter",i),r.addEventListener("mouseleave",o),()=>{r.removeEventListener("mouseenter",i),r.removeEventListener("mouseleave",o)}},[t]),n}const gg=({active:t,hovering:n})=>Y({opacity:t?1:0,background:n?h.error:"transparent",fill:n?"#fff":h.gray300,color:n?"#fff":h.gray300,scale:n?1.2:1,rotate:t?0:30,config:s=>{switch(s){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Od=l(_.button)`
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
`,Nn=({active:t,onClick:n,...s})=>{const i=g.useRef(null),o=Ct(i),a={...gg({active:t,hovering:o}),...s?.style};return delete s.style,e.jsx(Od,{type:"button",ref:i,style:a,onClick:n,...s,children:e.jsx(Gc,{})})},fg={dark:se`
    background: ${h.gray800};
    border: 1px solid ${h.gray800};
    box-shadow: 0 10px 24px rgb(8 15 24 / 18%);
    color: ${h.white};
  `,light:se`
    background: ${h.white};
    border: 1px solid ${h.gray100};
    box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
    color: ${h.gray800};
  `},bg=l.span`
  display: inline-flex;
`,jg=l.div`
  max-width: min(320px, calc(100vw - ${m.xl}));
  padding: ${m.xs} ${m.sm};

  border-radius: ${S.sm};

  font-size: 12px;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;

  ${({$theme:t})=>fg[t]}
`,yg=t=>typeof t=="number"?{open:t,close:t}:Array.isArray(t)?{open:t[0],close:t[1]}:{},vg=({arrowEnabled:t,arrowRef:n,context:s,content:i,floatingStyles:o,getFloatingProps:r,refs:a,theme:c})=>e.jsx(P1,{children:e.jsxs(jg,{ref:a.setFloating,...r(),$theme:c,style:o,children:[i,t&&e.jsx(D1,{ref:n,context:s,fill:c==="light"?"#ffffff":"#2f3c4c",stroke:c==="light"?"#d3dae2":"#2f3c4c",strokeWidth:1})]})}),wg=({arrow:t=!1,children:n,delay:s,distance:i=8,followCursor:o=!1,hideOnClick:r=!0,html:a,interactive:c=!1,position:u="top",style:p,theme:x="dark",title:f,trigger:b})=>{const[j,y]=g.useState(!1),w=g.useRef(null),v=a??f,$=g.useMemo(()=>{const An=[M1(i),I1(),A1({padding:8})];return t&&An.push($1({element:w})),An},[t,i]),C=C1({middleware:$,onOpenChange:y,open:j,placement:u,whileElementsMounted:R1}),{refs:F,floatingStyles:N,context:M}=C,z=k1(M,{delay:yg(s),enabled:b==="mouseenter",handleClose:c?S1():void 0,move:!o}),L=L1(M,{enabled:b==="mouseenter"}),A=F1(M,{enabled:b==="click",event:"mousedown",toggle:!0}),D=E1(M,{outsidePressEvent:"mousedown",referencePress:b==="click"&&r}),J=T1(M,{role:b==="click"?"dialog":"tooltip"}),pe=N1(M,{enabled:o}),{getFloatingProps:St,getReferenceProps:on}=z1([z,L,A,D,J,pe]);return v?e.jsxs(e.Fragment,{children:[e.jsx(bg,{ref:F.setReference,...on(),style:p,children:n}),j&&e.jsx(vg,{arrowEnabled:t,arrowRef:w,context:M,content:v,floatingStyles:N,getFloatingProps:St,refs:F,theme:x})]}):e.jsx(e.Fragment,{children:n})},xe=t=>e.jsx(wg,{...t,trigger:t.trigger??"mouseenter"}),dt=t=>e.jsx(R,{width:"14",height:"14",viewBox:"0 0 14 14",...t,children:e.jsx("path",{d:"M3 3L11 11M11 3L3 11",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),es=t=>e.jsx(R,{viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M24 0C10.7 0 0 10.7 0 24S10.7 48 24 48l8 0 0 19c0 40.3 16 79 44.5 107.5L158.1 256 76.5 337.5C48 366 32 404.7 32 445l0 19-8 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-19c0-40.3-16-79-44.5-107.5L225.9 256l81.5-81.5C336 146 352 107.3 352 67l0-19 8 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 0zM192 289.9l81.5 81.5C293 391 304 417.4 304 445l0 19L80 464l0-19c0-27.6 11-54 30.5-73.5L192 289.9zm0-67.9l-81.5-81.5C91 121 80 94.6 80 67l0-19 224 0 0 19c0 27.6-11 54-30.5 73.5L192 222.1z"})}),$g=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"13",r:"3"}),e.jsx("path",{d:"m9.77778 21h4.44442c3.1211 0 4.6816 0 5.8026-.7354.4852-.3184.9019-.7275 1.2262-1.2039.749-1.1006.749-2.6328.749-5.6971 0-3.0642 0-4.59639-.749-5.697-.3243-.47646-.741-.88556-1.2262-1.20392-.7204-.47255-1.6221-.64145-3.0028-.70182-.6589 0-1.2261-.49018-1.3553-1.1245-.1939-.95147-1.0448-1.63636-2.033-1.63636h-3.2674c-.98825 0-1.83915.68489-2.03297 1.63636-.12921.63432-.69648 1.1245-1.35533 1.1245-1.38067.06037-2.28245.22927-3.00276.70182-.48529.31836-.90196.72746-1.22622 1.20392-.74902 1.10061-.74902 2.6328-.74902 5.697 0 3.0643 0 4.5965.74902 5.6971.32426.4764.74093.8855 1.22622 1.2039 1.121.7354 2.68151.7354 5.80254.7354z"}),e.jsx("path",{d:"m19 10h-1",strokeLinecap:"round"})]})}),Cg=l.div`
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
`,kg=l.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`,Sg=l.div`
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
`,Lg=l.div`
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
`;const Fg=l.div`
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
`,Eg=({data:t,closeModal:n})=>{if(!t)return null;const{screenshot:s,beforeSubmitScreenshot:i,testId:o}=t,r=!!s,a=!!i,c=r&&a,u=(x,f)=>e.jsxs(Ma,{children:[c&&e.jsx(Ia,{children:f}),e.jsx(Aa,{children:e.jsx(B1,{initialScale:1,minScale:.5,maxScale:3,wheel:{step:.1},pinch:{step:5},doubleClick:{step:.5},children:({zoomIn:b,zoomOut:j,resetTransform:y,instance:w})=>e.jsxs(e.Fragment,{children:[e.jsx(O1,{wrapperStyle:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},contentStyle:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},children:e.jsx(kg,{src:x,alt:f,loading:"lazy",draggable:!1})}),e.jsxs(Sg,{children:[e.jsxs(Lg,{children:[e.jsx(Ni,{onClick:()=>j(),disabled:w.transformState.scale<=.5,title:d("Zoom Out"),children:"−"}),e.jsx(Ni,{onClick:()=>y(),title:d("Reset Zoom"),children:"↺"}),e.jsx(Ni,{onClick:()=>b(),disabled:w.transformState.scale>=3,title:d("Zoom In"),children:"+"})]}),e.jsx(_1,{width:104,height:108,borderColor:"rgba(255, 255, 255, 0.8)",children:e.jsx("img",{src:x,alt:"Minimap"})})]})]})})})]}),p=x=>e.jsxs(Ma,{children:[e.jsx(Ia,{children:x}),e.jsx(Aa,{children:e.jsx(Fg,{children:d("No screenshot available")})})]});return e.jsxs(ve,{style:{maxWidth:"90vw",width:"1200px"},children:[e.jsx(we,{children:e.jsx("h1",{children:d("Screenshots for Test",{testId:o})})}),e.jsx("div",{style:{padding:`${m.lg} ${m.xl}`},children:c?e.jsxs(Cg,{children:[u(i,d("Before Submit")),u(s,d("After Submit"))]}):a?e.jsx(zi,{children:u(i,"")}):r?e.jsx(zi,{children:u(s,"")}):e.jsx(zi,{children:p(d("Screenshots"))})}),e.jsx($e,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Close")})})]})},Tg=t=>{const{openModal:n}=Ke();return()=>{n(Eg,t)}},Mi=l.div`
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
`,Ng=l.div`
  padding: ${m.sm};
`,zg=l.div`
  background: ${h.white};
  border-radius: 4px;
`,Pa=l.p`
  color: ${h.gray600};
  font-size: 0.9em;
  margin-bottom: ${m.md};
  margin-top: 0;
`,Mg=l.div`
  display: flex;
  flex-direction: column;
  padding: ${m.sm};
`,Ig=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
  margin-bottom: ${m.lg};
`,Ag=l.div`
  display: flex;
  align-items: center;
  gap: ${m.md};
  margin-top: ${m.xl};
  padding-top: ${m.lg};
  border-top: 1px solid ${h.gray200};
`,Rg=l.nav`
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
`,Pg=l.div`
  color: ${h.gray600};
  font-size: 13px;
`,Dg=l.div`
  max-width: 380px;
`,Bg=l.div`
  position: relative;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  border-radius: ${S.md};
  white-space: normal;
`,Og=l.table`
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
`,_g=l.div`
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
`,Wg=l.div`
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
`,Ug=l.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${h.gray500};
  font-style: italic;
`,Hg=l.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`,qg=l.div`
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
`,Qg=l.div`
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
`,Kg=l.div`
  display: flex;
  align-items: center;
`,Vg=l.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({$status:t})=>t==="success"?"rgba(34, 197, 94, 0.2)":t==="failed"?"rgba(239, 68, 68, 0.2)":"rgba(55, 65, 81, 0.2)"};
  color: ${({$status:t})=>t==="success"?h.green600:t==="failed"?h.red600:h.gray700};
  margin-right: ${m.sm};
`,Gg=l.div`
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
`,Yg=l.button`
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
`,Jg=l.div`
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
`;const Zg=l.div`
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
`;const Xg=l.div`
  width: 100%;
  min-width: 100%;
`,Wa=l.div`
  overflow: hidden;
  min-width: 160px;
  background: ${h.white};
  border-radius: ${S.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`,ef=l.div`
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
`,tf=({groups:t})=>{const s=(()=>{const u=new Date,p=[];for(let x=0;x<30;x++){const f=new Date(u);f.setDate(f.getDate()-x);const b=f.toISOString().split("T")[0],y=t.find(w=>w.date===b)?.tests||[];y.forEach(w=>{w.submissionDuration!==void 0&&w.submissionDuration!==null&&p.push({date:b,duration:w.submissionDuration,testId:w.id||0,status:w.status?.toLowerCase()||"pending",dateAttempted:w.dateAttempted||""})}),y.length===0&&p.push({date:b,duration:0,testId:null,status:"no-tests",dateAttempted:""})}return p})(),o=Array.from(new Set(s.map(u=>u.date))).sort().reverse().filter((u,p)=>p===0||p%5===0),r=({active:u,payload:p,label:x})=>{if(u&&p&&p.length){const f=p[0].payload;return f.status==="no-tests"?e.jsx(Wa,{children:e.jsxs(Ua,{children:[e.jsx("div",{children:x}),e.jsx("div",{children:d("No tests on this day")})]})}):e.jsxs(Wa,{children:[e.jsx(ef,{children:e.jsxs(xt,{$status:f.status,$size:"sm",children:[e.jsx(fn,{$size:"md"}),d(f.status?.toUpperCase())]})}),e.jsxs(Ua,{children:[e.jsxs("div",{className:"test-id",children:["Test: ",f.testId]}),e.jsx("div",{className:"test-date",children:f.dateAttempted}),e.jsxs("div",{className:"test-duration",children:["Submit time: ",e.jsxs("strong",{children:[f.duration,"s"]})]})]})]})}return null},a=10;return s.some(u=>u.duration>=0)?e.jsx(Zg,{children:e.jsx(Xg,{children:e.jsx(nt,{width:"100%",height:250,children:e.jsxs(yt,{data:s,margin:{top:10,right:30,left:0,bottom:20},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"durationGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"5%",stopColor:"#3b82f6",stopOpacity:.3}),e.jsx("stop",{offset:"95%",stopColor:"#3b82f6",stopOpacity:.1})]})}),e.jsx(lc,{strokeDasharray:"3 3",stroke:"#f0f0f0"}),e.jsx(cc,{dataKey:"date",tick:{fontSize:11},angle:-45,textAnchor:"end",height:60,interval:0,tickFormatter:(u,p)=>{const x=s.findIndex(f=>f.date===u);return p===x&&o.includes(u)?new Date(u).toLocaleDateString("en-US",{month:"short",day:"numeric"}):""}}),e.jsx(_o,{tick:{fontSize:12},domain:[0,a],ticks:[2,4,6,8,10],tickFormatter:u=>`${u}s`,label:{value:d("Submit Time"),angle:-90,position:"insideLeft",style:{textAnchor:"middle"}}}),e.jsx(Wo,{content:e.jsx(r,{})}),e.jsx(vt,{type:"monotone",dataKey:"duration",stroke:"#3b82f6",strokeWidth:2,fill:"url(#durationGradient)",isAnimationActive:!1,connectNulls:!0})]})})})}):null},nf=l.div``,sf=l.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
`,of=l.div`
  padding: 0 7px;
`,rf=l.button`
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
`,af=l.div`
  padding-top: ${m.md};
`,lf=({tabs:t,activeTab:n,onTabChange:s})=>e.jsxs(nf,{children:[e.jsx(sf,{children:t.map(i=>e.jsx(of,{children:e.jsx(rf,{className:E(n===i.id&&"active"),onClick:()=>s(i.id),children:d(i.label)})},i.id))}),e.jsx(af,{children:t.find(i=>i.id===n)?.content})]}),Ai={position:"top",animation:"fade",delay:[100,0]},cf=t=>{switch(t){case"success":return e.jsx(Yc,{});case"failed":return e.jsx(dt,{});case"pending":return e.jsx(es,{});default:return e.jsx(es,{})}},df=({test:t,formId:n,onDelete:s,showNotifications:i})=>{const o=Tg({screenshot:t.screenshot,beforeSubmitScreenshot:t.beforeSubmitScreenshot,testId:t.id}),r=g.useRef(null),a=Ct(r),c=t.dateAttempted;return e.jsxs("tr",{ref:r,children:[e.jsx("td",{className:"no-break",children:t.id}),e.jsx("td",{className:"no-break",title:c,children:c}),e.jsx("td",{className:"no-break",children:e.jsxs(xt,{$status:t.totalStatus,$size:"sm",children:[e.jsx(fn,{$size:"lg"}),d(t.totalStatus?.toUpperCase())]})}),e.jsx("td",{className:"no-break",children:e.jsxs(Kg,{children:[e.jsx(Vg,{$status:t.status,children:e.jsx(_a,{children:cf(t.status)})}),t.screenshot&&e.jsx(xe,{title:d("View Screenshot"),...Ai,children:e.jsx(Yg,{onClick:o,children:e.jsx($g,{})})}),t.submissionDuration!==0&&e.jsx(xe,{title:d(`Submit time is ${t.submissionDuration} seconds`,{duration:t.submissionDuration.toFixed(2)}),...Ai,children:e.jsxs(Gg,{children:[t.submissionDuration.toFixed(1),"s"]})})]})}),i&&e.jsx("td",{children:t?.totalNotifications?t.dateCompleted?e.jsx(xe,{html:e.jsx(uo,{children:e.jsxs(po,{children:[e.jsxs(qg,{children:[e.jsxs(Oa,{children:[e.jsx("div",{className:"label",children:d("Enabled")}),e.jsx("div",{className:"value",children:t.totalNotifications})]}),e.jsxs(Oa,{children:[e.jsx("div",{className:"label",children:d("Received")}),e.jsx("div",{className:"value",children:t.notifications?.length||0})]})]}),e.jsx(Hg,{children:t.notifications?.map((u,p)=>e.jsx(Qg,{children:u.type},p))})]})}),position:"top",theme:"light",animation:"fade",arrow:!0,duration:100,distance:10,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsxs(xt,{$status:t.notifications?.length>=t.totalNotifications?"success":"failed",$size:"sm",style:{cursor:"pointer"},children:[t.notifications?.length||0,"/",t.totalNotifications]})}):e.jsx(Jg,{children:e.jsx(_a,{children:e.jsx(es,{})})}):e.jsx(xt,{$status:"inactive",$size:"sm",children:"N/A"})}),e.jsx("td",{className:"no-break",children:t?.totalResponse&&e.jsx(Dg,{children:e.jsx(Bg,{children:t.totalResponse})})}),e.jsx("td",{children:e.jsx(xe,{title:d("Delete Test"),...Ai,children:e.jsx(Nn,{active:a,onClick:()=>s({formId:n,testId:t.id})})})})]})},uf=({groups:t})=>{const n=t.slice(0,30);if(n.length===0)return e.jsx(Ug,{children:d("No test results available for the last 30 days.")});const s=Math.max(...n.map(i=>i.tests.length),1);return e.jsx(Wg,{children:n.map((i,o)=>e.jsx(pf,{group:i,maxTests:s,isCurrentDay:o===0},i.date))})},pf=({group:t,maxTests:n,isCurrentDay:s})=>{const i=g.useRef(null),o=Ct(i),r=x=>e.jsxs(uo,{children:[e.jsx(_g,{children:e.jsxs(xt,{$status:x.totalStatus,$size:"sm",children:[e.jsx(fn,{$size:"md"}),d(x.totalStatus?.toUpperCase())]})}),e.jsxs(po,{children:[e.jsxs("div",{className:"test-id",children:["Test: ",x.id]}),e.jsx("div",{className:"test-date",children:x.dateAttempted}),x.totalResponse&&e.jsx("div",{className:"test-response",children:x.totalResponse})]})]}),a=100/n,c=t.tests||[],u=s?n-c.length:0;if(t.isInactive)return e.jsx(Ba,{ref:i,children:e.jsx(xe,{html:e.jsx(uo,{children:e.jsxs(po,{children:[e.jsx("div",{children:d("No tests on this day")}),e.jsx("div",{className:"test-date",children:t.date})]})}),position:"top",theme:"light",animation:"fade",arrow:!0,duration:100,distance:10,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsx(Ii,{$status:"inactive",$height:100,$offset:0,$isLast:!0,$isHovering:o,$isPending:!1})})});const p=[...c].reverse();return e.jsxs(Ba,{ref:i,children:[p.map((x,f)=>e.jsx(xe,{html:r(x),position:"bottom",theme:"light",animation:"fade",duration:100,distance:-15,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsx(Ii,{$status:x.totalStatus,$height:a,$offset:f*a,$isLast:f===p.length-1&&u===0,$isHovering:o,$isPending:!1},x.id)},x.id)),u>0&&Array.from({length:u}).map((x,f)=>e.jsx(Ii,{$status:"inactive",$height:a,$offset:(p.length+f)*a,$isLast:f===u-1,$isHovering:o,$isPending:!0},`pending-${f}`))]})},hf=()=>{const{formTestsQuery:t}=W1(),[n,s]=Ho(),i=Number(n.get("page"))||1,[o,r]=oe.useState(null),[a,c]=oe.useState("testResults"),{data:u,isLoading:p,isFetching:x,refetch:f}=t,b=100;if(p||x)return e.jsx(Ym,{});if(u?.error)return e.jsx(Mm,{children:u.error?.message});if(!u||!u.tests)return e.jsx(Mi,{children:e.jsx(Ra,{children:e.jsx("p",{children:d("Form Monitor is not enabled for this form.")})})});if(u?.stats?.total===0&&u?.fmFormStats?.enabled)return e.jsx(Mi,{children:e.jsx(Ra,{children:e.jsx("p",{children:d("This form is awaiting its first scan. This could take a few minutes.")})})});const j=J=>{s({page:String(J)}),window.scrollTo({top:0,behavior:"smooth"})},y=u.tests.flatMap(J=>J.tests),w=y.length,v=Math.ceil(w/b),$=(i-1)*b,C=$+b,F=y.slice($,C),N=u.stats?.total||0,M=u.stats?.failed||0,z=e.jsx(Ng,{children:e.jsxs(zg,{children:[e.jsx(Pa,{children:d("Of the {total30} tests that have occurred in the last 30 days, {failed} tests have failed for this form.",{total30:N,failed:M})}),e.jsx(uf,{groups:u.tests})]})}),L=e.jsx(tf,{groups:u.tests}),A=[{id:"testResults",label:"Test Results",content:z},{id:"submitTimes",label:"Form Submit Times",content:L}],D=u.stats?.total||0;return e.jsxs(Mi,{children:[e.jsx(lf,{tabs:A,activeTab:a,onTabChange:c}),e.jsxs(Mg,{children:[e.jsxs(Ig,{children:[e.jsx("h3",{children:d("Detailed Results")}),e.jsx(Pa,{children:d("A total of {total} tests have been conducted for this form.",{total:D})})]}),e.jsxs(Og,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("Test ID")}),e.jsx("th",{children:d("Date")}),e.jsx("th",{children:d("Status")}),e.jsx("th",{children:d("Form Submit")}),u.notifications?.enabled&&e.jsx("th",{children:d("Notifications")}),e.jsx("th",{children:d("Response")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:F.map(J=>e.jsx(df,{test:J,formId:u.formId,onDelete:r,showNotifications:u.notifications?.enabled},J.id))})]})]}),w>b&&e.jsxs(Ag,{children:[e.jsxs(Rg,{"aria-label":"test results pagination",children:[e.jsx(Da,{className:"prev-page",onClick:()=>j(i-1),disabled:i===1,title:d("Previous Page")}),e.jsx(Da,{className:"next-page",onClick:()=>j(i+1),disabled:i===v,title:d("Next Page")})]}),e.jsxs(Pg,{children:[d("Showing")," ",$+1,"-",Math.min(C,w)," ",d("of")," ",w," ",d("tests")]})]}),o&&e.jsx(Bd,{formId:o.formId,testId:o.testId,onClose:()=>r(null),onSuccess:()=>{f()}})]})},ho="freeform-builder-tabs",xo=new Set,_d=t=>t?JSON.parse(sessionStorage.getItem(ho)||"{}")[t]||{}:{},xf=(t,n)=>{const s=JSON.parse(sessionStorage.getItem(ho)||"{}");sessionStorage.setItem(ho,JSON.stringify({...s,[t]:n}))},mf=(t,n)=>_d(t)[n]??null,gf=()=>{xo.forEach(t=>{t()})},ff=t=>(xo.add(t),()=>{xo.delete(t)}),We=t=>{const{formId:n}=V(),s=g.useSyncExternalStore(ff,()=>mf(n,t)),i=g.useCallback(o=>{n&&(xf(n,{..._d(n),[t]:o??null}),gf())},[n,t]);return{lastTab:s,setLastTab:i}},ts=(t,n)=>{n===void 0&&(t>1?(n=t,t=1):(n=t,t=0));const s=[];for(let i=t;i<=n;i++)s.push(i);return s},bf=(t,n,s)=>{const i={};return t.forEach(o=>{const r=o[n];let a;a=o[s],i[r]=a}),i},Ha=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,rr=l.div`
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
`,jf=l.div`
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
`,yf=l.div`
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

  ${({href:t})=>t&&se`
      &:hover {
        color: ${h.gray500};
        text-decoration: none;
      }
    `}

  ${({href:t})=>!t&&se`
      &:hover {
        text-decoration: none;
        cursor: text;
      }
    `}
`,Wd=l.div`
  display: flex;
  height: 100%;
  background: ${h.white};
`,vf=()=>e.jsxs(Wd,{children:[e.jsx(De,{children:e.jsx(Qt,{baseColor:h.gray200,highlightColor:h.gray300,children:ts(5).map(t=>e.jsx(mo,{children:e.jsx(k,{width:200},t)},t))})}),e.jsxs(rr,{children:[e.jsx(ar,{children:e.jsx(k,{width:100})}),ts(7).map(t=>e.jsxs("div",{style:{width:"100%"},children:[e.jsx(k,{width:Ha(120,300)}),e.jsx(k,{width:`${Ha(70,90)}%`,height:8}),e.jsx(k,{height:30})]},t))]})]}),wf=()=>{const{ownership:t}=P(Pe.current);return t?e.jsxs(e.Fragment,{children:[e.jsx(yf,{}),e.jsxs(lr,{children:[e.jsxs(Qa,{children:[t.created.user?e.jsxs(e.Fragment,{children:[d("Created by")," ",e.jsx(Ka,{href:t.created.user.url,target:"_blank",children:t.created.user.name})]}):d("Created")," ",d("at"),":",e.jsx("br",{})," ",t.created.datetime]}),e.jsxs(Qa,{children:[t.updated.user?e.jsxs(e.Fragment,{children:[d("Last Updated by")," ",e.jsx(Ka,{href:t.updated.user.url,target:"_blank",children:t.updated.user.name})]}):d("Last Updated")," ",d("at"),":",e.jsx("br",{})," ",t.updated.datetime]})]})]}):null},bn=t=>t?!!Object.entries(t).length:!1,$f=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M160 64c-17.7 0-32 14.3-32 32l0 320c0 11.7-3.1 22.6-8.6 32L432 448c26.5 0 48-21.5 48-48l0-304c0-17.7-14.3-32-32-32L160 64zM64 480c-35.3 0-64-28.7-64-64L0 160c0-35.3 28.7-64 64-64l0 32c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32L96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 304c0 44.2-35.8 80-80 80L64 480zM384 112c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zM160 304c0-8.8 7.2-16 16-16l256 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l256 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16zm32-144l128 0 0-96-128 0 0 96zM160 120c0-13.3 10.7-24 24-24l144 0c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24l0-112z"})}),Cf=()=>{const t=I.limitations,n=ne(),{setLastTab:s}=We("settings"),{sectionHandle:i}=V(),o=I.metadata.craft.is5,r=P(Pe.errors),{data:a}=Gt();if(!a)return null;const c=[];return a.forEach(u=>{u.properties.forEach(p=>{bn(r?.[u.handle]?.[p.handle])&&(c.includes(p.section)||c.push(p.section))})}),e.jsxs(De,{$lean:!0,children:[e.jsxs(lr,{children:[a.map(u=>u.sections.filter(p=>t.can(`settings.tab.${p.handle}`)).map(p=>e.jsxs(mo,{onClick:()=>{s(p.handle),n(`${p.handle}`)},className:E(i===p.handle&&"active",c.includes(p.handle)&&"errors"),children:[e.jsx(qa,{dangerouslySetInnerHTML:{__html:O.sanitize(p.icon)}}),d(p.label)]},p.handle))),o&&e.jsxs(mo,{onClick:()=>{s(Bs),n(Bs)},className:E(i===Bs&&"active"),children:[e.jsx(qa,{children:e.jsx($f,{})}),d("Usage in Elements")]})]}),e.jsx(wf,{})]})},Bs="usage",kf=()=>{const t=I.limitations,{sectionHandle:n}=V(),s=ne(),{lastTab:i,setLastTab:o}=We("settings"),r=st(""),{data:a,isFetching:c}=Gt();return g.useEffect(()=>{i&&s(i)},[s,i]),g.useEffect(()=>{if(!n&&!i){const u=a?.[0]?.sections.filter(p=>t.can(`settings.tab.${p.handle}`))?.[0];u&&(o(u.handle),s(`${u.handle}`))}},[a,n,i,s,o]),!a&&c?e.jsx(vf,{}):e.jsxs(Wd,{children:[e.jsx(q,{id:"settings",label:d("Settings"),url:r.pathname}),e.jsx(Cf,{}),e.jsx(jt,{})]})},Ud=l.div`
  position: relative;
  width: 100%;
`,Sf=l(_.div)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;

  box-shadow: ${ae.panel};

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

  box-shadow: ${ae.box};
  border-radius: ${S.lg};
  background: ${h.gray050};
`,dr=l.div`
  max-height: 600px;
  overflow-x: hidden;
  overflow-y: auto;

  ${Q};
`,Ve=({preview:t,onEdit:n,onAfterEdit:s,excludeClassNames:i=[],children:o})=>{const[r,a]=g.useState(void 0),c=g.useRef(null),u=g.useRef(null),p=g.useRef(r),{editorAnimation:x}=ed({wrapper:c.current,editor:u.current,isEditing:r});$t({callback:()=>{a(!1)},isEnabled:r,refObject:u,excludeClassNames:["tagify__dropdown","dropdown-rollout","elementselectormodal",...i]});const f=()=>{a(!1)},b=j0();return os(()=>a(!1),!!r),g.useEffect(()=>{p.current&&r===!1&&s?.(),p.current=r},[r,s]),e.jsxs(Ud,{ref:c,children:[e.jsx(td,{children:e.jsx(Sf,{style:{zIndex:b,pointerEvents:r?"initial":"none",...x},className:E(r&&"active","editable-content"),ref:u,children:typeof o=="function"?o(r,f):o})}),e.jsx(cr,{onClick:()=>{a(!0),n?.()},children:t})]})},Ae={all:X(t=>t.layout.fields,t=>t),count:X(t=>t.layout.fields,t=>t.length),one:t=>X(n=>n.layout.fields,n=>n.find(s=>s.uid===t)),hasErrors:X(t=>t.layout.fields,t=>t.some(n=>n.errors!==void 0)),inRow:t=>X(n=>n.layout.fields,n=>n.filter(s=>s.rowUid===t.uid).sort((s,i)=>(s.order??0)-(i.order??0)))},Lf=t=>P(Ae.all).filter(i=>t.availableFieldTypes.includes("*")?!0:t.availableFieldTypes.includes(i.typeClass)).map(i=>i.properties.handle),Ff=l.div`
  display: flex;
  align-items: center;
  gap: ${m.md};

  mark {
    padding: 0 ${m.xs};
    border-radius: ${S.lg};
    background: ${h.gray200};
  }
`,Ef=l.div`
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
`,Tf=l.ul`
  min-width: 25%;
`;se`
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
`;const Hd=(t,n)=>{const s=t.match(/field:([a-zA-Z0-9_]+)/g);if(!s||s.length===0)return t;const i=s.map(o=>o.replace("field:",""));return n==="<mark>...</mark>"?i.map(o=>`<mark>${o}</mark>`).join(", "):i.map(o=>`[[${o}]]`).join(", ")},Nf=({value:t,property:n,updateValue:s})=>{const[i,o]=g.useState(""),r=Lf(n),a=g.useRef(null),c=g.useCallback(p=>{s(p.detail.tagify.DOM.input.textContent.replace(/\u200B/g,"").replace(/\s+/g," ").trim())},[s]),u=p=>{if(!p)return;const x=a.current.createTagElem({value:p});a.current.injectAtCaret(x);const f=a.current.insertAfterTag(x,"");a.current.placeCaretAfterNode(f)};return g.useEffect(()=>{o(Hd(t))},[t]),e.jsxs(it,{children:[e.jsxs(Ff,{children:[e.jsx(Tf,{children:e.jsx(de,{emptyOption:d("Insert Field"),options:r.map(p=>({value:p,label:p})),onChange:u,value:""})}),e.jsxs("span",{children:["or type ",e.jsx("mark",{children:"@"})," to search on field handles"]})]}),e.jsx(Ef,{children:e.jsx(uc,{autoFocus:!1,tagifyRef:a,settings:{pattern:/@/,enforceWhitelist:!0,editTags:!1,pasteAsTags:!0,duplicates:!0,dropdown:{enabled:0,includeSelectedTags:!0},templates:{tag:function(p){return`
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
  box-shadow: ${ae.box};
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
`,jn=l.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${h.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`,zf=l(Zt)`
  padding: ${m.sm};

  mark {
    padding: ${m.xs} ${m.sm};
    border-radius: ${S.lg};
    background: ${h.gray100};
  }
`,Mf=({value:t})=>e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(zf,{children:[!t&&e.jsx(kt,{children:d("Not configured yet")}),e.jsx("div",{style:{lineHeight:"2.0"},dangerouslySetInnerHTML:{__html:O.sanitize(Hd(t,"<mark>...</mark>"))}})]})}),If=({value:t,property:n,errors:s,updateValue:i})=>e.jsx(W,{property:n,errors:s,children:e.jsx(Ve,{preview:e.jsx(Mf,{value:t}),children:e.jsx(Nf,{value:t,property:n,updateValue:i})})}),qd=(t,n,s)=>{let i=!0;return t.forEach(o=>{new Function(...Object.keys(n),"context",`return ${o}`)(...Object.values(n),s)||(i=!1)}),i},un=(t,n)=>{const s=n.split(".");let i=t;for(const o of s){if(i===void 0)return;i=i[o]}return i},Af=({value:t,property:n,errors:s,updateValue:i})=>{const{source:o,optionValue:r,optionLabel:a,filters:c,emptyOption:u}=n,x=ac().getState(),f=un(x,o),b=[];return f.forEach((j,y)=>{qd(c,j)&&b.push({label:a?un(j,a):j,value:r?un(j,r):y})}),e.jsx(W,{property:n,errors:s,children:e.jsx(de,{value:t,onChange:i,emptyOption:u,options:b})})},Qd={all:["craft-asset-previews"],byIds:t=>[...Qd.all,{ids:t}]},Rf=t=>B({queryKey:Qd.byIds(t),queryFn:()=>T.get(`api/assets?ids=${t.join(",")}`).then(n=>n.data),staleTime:1/0,gcTime:1/0,enabled:t?.length>0}),pr=({actionLabel:t,multiSelect:n,sources:s="*",criteria:i,limit:o,value:r,onUpdate:a})=>{const{data:c,isFetching:u}=Rf(r),p=g.useCallback(()=>{Craft.createElementSelectorModal("craft\\elements\\Asset",{multiSelect:o!==1||n,sources:s,criteria:i,storageKey:"freeform-asset-selection",onSelect:j=>{const w=j.map($=>$.id).slice(0,o).filter($=>!r?.includes($)),v=[...r||[],...w];a(v)}})},[a,n,i,o,s,r]),x=g.useCallback(j=>{a(r.filter(y=>y!==j))},[a,r]),f=o===void 0||r?.length===void 0||r?.length<o,b=c===void 0&&u&&r?.length>0;return e.jsxs("div",{className:"elementselect",children:[e.jsxs("ul",{className:"elements chips chips-small",children:[b&&r.map((j,y)=>e.jsx("li",{className:"element small",children:e.jsxs("div",{className:"chip small element",children:[e.jsx("div",{className:"thumb",children:e.jsx(k,{width:30,height:20})}),e.jsx("div",{className:"chip-content",children:e.jsx(k,{width:Df(y)})})]})},`skeleton-${j}`)),c?.map(j=>e.jsx("li",{className:"element small removable",children:e.jsxs("div",{className:"chip small element removable",children:[e.jsx("div",{className:"thumb",children:e.jsx("img",{src:j.thumbUrl,alt:j.title,width:30,height:20})}),e.jsxs("div",{className:"chip-content",children:[e.jsx("div",{className:"element-label",children:e.jsx("a",{className:"label-link",href:j.editUrl,target:"_blank",rel:"noreferrer",children:j.title})}),e.jsx("div",{className:"chip-actions",children:e.jsx(Bf,{type:"button",title:d("Remove"),onClick:()=>x(j.id)})})]})]})},j.id))]}),f&&e.jsx("div",{className:"flex",children:e.jsx("button",{type:"button",className:"btn add icon",onClick:p,children:d(t||"Add an asset")})})]})},Pf=[80,100,90,70,120],Df=t=>Pf[t]||100,Bf=l.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`,Of=({value:t,property:n,errors:s,updateValue:i})=>{const{criteria:o,multiSelect:r,actionLabel:a,limit:c}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(pr,{actionLabel:a,criteria:o,limit:c,multiSelect:r,value:t,onUpdate:i})})},xs=(t,n=500)=>{const[s,i]=g.useState(t);return g.useEffect(()=>{const o=setTimeout(()=>i(t),n);return()=>clearTimeout(o)},[t,n]),s},ms=({label:t,onClick:n,disabled:s=!1,className:i})=>e.jsx(_f,{className:i,children:e.jsx(Wf,{type:"button",className:"btn add icon",onClick:n,disabled:s,children:d(t)})}),_f=l.div`
  width: 100%;
  display: flex;
  justify-content: center;

  background: transparent;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-top: none;
  border-bottom-left-radius: ${S.lg};
  border-bottom-right-radius: ${S.lg};
`,Wf=l.button`
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
`,Uf=l.div`
  font-style: italic;
  font-size: 12px;
  line-height: 18px;
  padding-top: 6px;
  color: ${h.gray300};
`,Xt=({children:t})=>e.jsx(Uf,{children:t}),gs=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"})}),zn=(t,n)=>{const s=g.useRef([]),[i,o]=g.useState(0),[r,a]=g.useState(0),c=g.useCallback(x=>f=>{if(f.key==="Enter"&&x?.onEnter){f.preventDefault(),x.onEnter(f);return}if(f.key==="Backspace"&&x?.onDelete&&f.target.value.length===0){f.preventDefault(),x.onDelete(f);return}let b=i,j=r;const y=s.current?.[i]?.[r],w=y instanceof HTMLInputElement||y instanceof HTMLTextAreaElement,v={start:!0,end:!0,position:0};if(w){const F=y.selectionStart;v.start=F===0,v.end=F===y.value.length,v.position=F}let $;if(f.key==="ArrowUp"&&i>0&&b--,f.key==="ArrowDown"&&i<t-1&&b++,f.key==="ArrowLeft"&&r>0&&v.start&&($=!0,j--),f.key==="ArrowRight"&&r<n-1&&v.end&&($=!1,j++),b===i&&j===r)return;b!==i&&o(b),j!==r&&a(j);const C=s.current?.[b]?.[j];C?.focus(),(C instanceof HTMLInputElement||C instanceof HTMLTextAreaElement)&&(f.preventDefault(),$!==void 0?C.setSelectionRange($?C.value.length:0,$?C.value.length:0):C.setSelectionRange(v.position,v.position))},[t,n,i,r]),u=(x,f)=>{o(x),a(f),s.current?.[x]?.[f]?.focus()},p=(x,f,b)=>{s.current[f]||(s.current[f]=[]),s.current[f][b]=x};return{activeCell:`${i}:${r}`,setActiveCell:u,setCellRef:p,keyPressHandler:c}},Kd=l.nav`
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
`,Hf=l.button``,qf=l.a`
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
`,Qf=l.span`
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
`;const Kf=l(fs)`
  flex: 1;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${m.md} 1px 0;
  box-shadow: ${ae.bottom};

  ${Q};

  a {
    cursor: pointer;

    display: flex;
    gap: 5px;

    user-select: none;
  }
`,Vf=l.span`
  display: block;

  max-width: 100px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Gf=l.div`
  display: flex;
  align-items: flex-end;
  gap: ${m.sm};
  width: 100%;
  padding-inline: ${m.md};
`,Yf=l.button`
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
`,Jf=l.button`
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
`,Zf=l.button`
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
`,Xf=l.div`
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
`,e4=l(Gf)`
  padding: 0 ${m.lg};

  background: ${h.gray050};
  box-shadow: ${ae.bottom};
`,t4=l.div`
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
`,n4=l(it)`
  gap: 0;
  padding: 0;
`,s4=l(fs)`
  width: 100%;
  overflow: hidden;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${m.md} ${m.md} 0;
  box-shadow: ${ae.bottom};

  ${Q};

  a {
    cursor: pointer;
    user-select: none;
  }
`,i4=l.div`
  padding: ${m.md};

  background: ${h.white};
`,o4=l(dr)``,r4=l.div`
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
`,nu=t=>{const n=[];return t.forEach(([s,i])=>{if(s=s===null?"":s,i=i===null?"":i,!s&&i&&(s=i,i=""),!(!s&&!i)){if(i===""){n.push([String(s),void 0]);return}Array.isArray(i)&&(i=i.join(" ")),n.push([String(s),String(i)])}}),n},a4=(t,n,s)=>{const i=n?.[t]||[];return{...n,[t]:[...i.slice(0,s+1),["",""],...i.slice(s+1)]}},Va=(t,n,s,i)=>{const o={...i,[n]:[...i[n]]};return o[n][t]=s,o},l4=(t,n,s)=>({...s,[n]:[...s[n].filter((i,o)=>o!==t)]}),c4=t=>{const n={};return Object.entries(t).forEach(([s,i])=>{n[s]=i.filter(([o,r])=>!!o||!!r)}),n},d4=({tab:t,attributes:n})=>{const s=n.find(([i])=>i.toLowerCase()==="tag")?.[1]||t.previewTag;return e.jsxs(r4,{children:["<",s,nu(n).filter(([i])=>i!=="tag").map(([i,o],r)=>e.jsxs("span",{children:[e.jsxs(Xd,{children:[" ",i]}),!!o&&e.jsxs(e.Fragment,{children:[e.jsx(eu,{children:"="}),e.jsx(Ks,{}),e.jsx(tu,{children:o}),e.jsx(Ks,{})]})]},r))," />"]})},u4=({property:t,attributes:n,updateValue:s})=>{const i=t.tabs||[],[o,r]=g.useState(i.at(0)),a=Object.entries(n),[c,u]=a.find(([y])=>y===o.handle)||[o.handle,[]],{activeCell:p,setActiveCell:x,setCellRef:f,keyPressHandler:b}=zn(u.length,2);if(g.useEffect(()=>{x(0,0)},[o?.handle]),!c||!u)return null;const j=(y,w,v)=>{x(v!==void 0?v+1:y,w),s(a4(c,n,v!==void 0?v:u.length-1))};return e.jsxs(n4,{children:[e.jsx(s4,{children:t.tabs?.map(y=>e.jsx("a",{className:E(y===o&&"active"),onClick:()=>r(y),children:d(y.label)},y.handle))}),e.jsxs(i4,{children:[e.jsx(d4,{tab:o,attributes:u}),e.jsx(o4,{children:e.jsx(js,{children:e.jsxs("tbody",{children:[!u.length&&e.jsxs(Qs,{children:[e.jsx(ue,{children:e.jsx(ot,{type:"text",placeholder:d("Attribute"),onFocus:()=>{j(0,0)}})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",placeholder:d("Value"),onFocus:()=>{j(0,1)}})})]}),u.map(([y,w],v)=>e.jsxs(Qs,{children:[e.jsx(ue,{children:e.jsx(ot,{type:"text",value:String(y),placeholder:d("Attribute"),autoFocus:p===`${v}:0`,ref:$=>f($,v,0),onFocus:()=>x(v,0),onKeyDown:b({onEnter:$=>{j($.shiftKey?v:u.length,0,$.shiftKey?v:void 0)}}),onChange:$=>{s(Va(v,c,[$.target.value,w],n))}})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",value:String(w),placeholder:d("Value"),autoFocus:p===`${v}:1`,ref:$=>f($,v,1),onFocus:()=>x(v,1),onKeyDown:b({onEnter:$=>{j($.shiftKey?v:u.length,1,$.shiftKey?v:void 0)}}),onChange:$=>{s(Va(v,c,[y,$.target.value],n))}})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Bt,{tabIndex:-1,onClick:()=>{s(l4(v,c,n)),x(Math.max(v-1,0),0)},children:e.jsx(gs,{})})})]},v))]})})}),u.length>0&&e.jsx(ms,{label:"Add an attribute",onClick:()=>j(u.length,0,u.length-1)}),e.jsx("br",{}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Press <b>enter</b> while editing a cell to add a new row."))}})})]})]})},p4=l.div`
  min-height: 160px;
  max-height: 260px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: ${m.sm} ${m.md};

  background: ${h.white};
  box-shadow: ${ae.box};
  border-radius: ${S.lg};

  ${Q};
`,su=l.div`
  ${_e};
  font-size: 10px;
`,h4=l.ul`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: ${m.xs};

  margin-top: ${m.xs};
`,x4=l.li`
  padding: 1px 6px;

  font-family: monospace;
  font-size: 12px;

  background: ${h.gray100};
  color: ${h.gray800};
  border-radius: ${S.lg};
`,m4=l.div`
  &:not(:last-child) {
    padding-bottom: 10px;
    margin-bottom: 10px;
    box-shadow: ${ae.bottom};
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
`,g4=({tab:t,attributes:n})=>{const s=nu(n);return e.jsxs(m4,{className:E(!s.length&&"empty"),children:[e.jsx(su,{children:d(t.label)}),!!s.length&&e.jsx(h4,{children:s.map(([i,o],r)=>e.jsxs(x4,{children:[e.jsx(Xd,{children:i}),!!o&&e.jsxs(e.Fragment,{children:[e.jsx(eu,{children:"="}),e.jsx(Ks,{}),e.jsx(tu,{children:o}),e.jsx(Ks,{})]})]},r))})]})},f4=({property:t,attributes:n})=>e.jsx(p4,{children:t.tabs?.map(s=>e.jsx(g4,{tab:s,attributes:n[s.handle]||[]},s.handle))}),Ga=t=>{const n={};for(const s in t)n[s]=Object.entries(t[s]);return n},Ya=t=>{const n={};for(const s in t){n[s]={};for(const[i,o]of t[s])n[s][i]=o}return n},b4=({value:t,property:n,updateValue:s})=>{const{size:i}=ir(),[o,r]=g.useState(Ga(t)),a=xs(o,1e3);g.useEffect(()=>{const u=Ya(a);Ds(u,t)||s(u)},[a,s,t]),g.useEffect(()=>{const u=Ga(t);r(p=>Ds(u,p)?p:u)},[t]);const c=e.jsx(Ve,{preview:e.jsx(f4,{property:n,attributes:o}),onAfterEdit:()=>{const u=Ya(c4(o));Ds(u,t)||s(u)},children:e.jsx(u4,{property:n,attributes:o,updateValue:r})});return i==="small"?c:e.jsx(W,{property:n,children:c})},go=l.div`
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
`,j4=l.div`
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
`,en=({enabled:t,readOnly:n,errors:s,onClick:i})=>{const{is:o}=I.metadata.craft;return e.jsx(j4,{className:E(t&&"on",s&&"error",n&&"readonly",o.atLeast("5.8.0")&&"craft-5_8"),onClick:()=>{n||i?.(!t)},children:e.jsx(go,{})})},si=l.div`
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
`,y4=l.div``,yn=({value:t,property:n,errors:s,context:i,updateValue:o})=>{const r=n.flags?.includes("readonly")||n.flags?.includes("as-readonly-in-instance");return e.jsx(W,{property:n,errors:s,context:i,preContent:e.jsx(si,{children:e.jsx(iu,{children:e.jsx(en,{enabled:t,readOnly:r,onClick:a=>o(a),errors:s})})})})},ou=(t=!0)=>B({queryKey:["autosuggest","env"],queryFn:()=>T.get("/api/autosuggest/env").then(n=>n.data),enabled:t,staleTime:1/0,gcTime:1/0}),v4=t=>!!t,w4=()=>{const{data:t}=ou();return g.useMemo(()=>{const n=[{label:d("Yes"),value:"true",icon:e.jsx("span",{className:"status enabled","aria-hidden":"true"})},{label:d("No"),value:"false",icon:e.jsx("span",{className:"status white","aria-hidden":"true"})}],s=t?.map(o=>({label:o.label,children:o.data.map(r=>({label:r.name,value:r.name,hint:r.hint,icon:e.jsx("span",{className:E("status",v4(r.hint)?"enabled":"white"),"aria-hidden":"true"})}))}))??[];return[...n,...s]},[t])},$4=({children:t})=>e.jsxs(C4,{className:"notice has-icon",children:[e.jsx("span",{className:"icon","aria-hidden":"true"}),e.jsx("span",{className:"visually-hidden",children:"Tip: "}),e.jsx("span",{children:t})]}),C4=l.p`
  margin-top: 5px;
`,k4="This can be set to an environment variable with a boolean value (`yes`/`no`/`true`/`false`/`on`/`off`/`0`/`1`).",S4=({value:t,updateValue:n,property:s,errors:i,context:o})=>{const r=d(k4),a=jd(r),{data:c,isFetching:u}=ou(),p=w4();return["","0","no","off"].includes(String(t).toLowerCase())?t="false":["1","yes","on"].includes(String(t).toLowerCase())&&(t="true"),e.jsxs(W,{property:s,errors:i,context:o,children:[e.jsx(de,{value:t,options:p,onChange:x=>n(x),loading:u&&!c,showSelectedIcon:!0,showHints:!0}),e.jsx($4,{children:a})]})},L4=l.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;

  width: 100%;
  padding-top: ${m.sm};
`,F4=l.button`
  display: block;
  flex: 1;

  padding: ${m.xs} ${m.md};

  background-color: ${h.gray100};
  box-shadow: ${ae.right};
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
`,hr=({value:t,options:n,onClick:s})=>{const i=[];return n.forEach((o,r)=>{"value"in o&&i.push(e.jsx(F4,{className:E(o.value===t&&"active"),onClick:()=>s(o.value),children:o.label},r))}),e.jsx(L4,{children:i})},E4=({value:t,property:n,errors:s,updateValue:i})=>{const{options:o}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(hr,{value:t,options:o,onClick:r=>i(r)})})},T4=l.div`
  display: flex;
  align-items: center;
  gap: ${m.md};

  mark {
    padding: 0 ${m.xs};
    border-radius: ${S.lg};
    background: ${h.gray200};
  }
`,N4=l.div`
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
`,z4=l.ul`
  min-width: 25%;
`,M4="Supported Operators Reference Guide",I4=[{title:"Arithmetic",items:[{name:"Addition",operator:"+"},{name:"Subtraction",operator:"-"},{name:"Multiplication",operator:"*"},{name:"Division",operator:"/"},{name:"Square Root",operator:"sqrt()"}]},{title:"Numeric",items:[{name:"Range",operator:".."}]},{title:"Bitwise",items:[{name:"AND",operator:"&"},{name:"OR",operator:"|"},{name:"XOR",operator:"^"}]},{title:"Ternary",items:[{name:"(a ? b : c)",operator:"?"}]},{title:"String",items:[{name:"Concatenation",operator:"~"}]},{title:"Logical",items:[{name:"Not",operator:"!, not"},{name:"And",operator:"&&, and"},{name:"Or",operator:"||, or"}]},{title:"Array",items:[{name:"Contains",operator:".."},{name:"Does not contain",operator:"not in"}]},{title:"Comparison",items:[{name:"Equal",operator:"=="},{name:"Identical",operator:"==="},{name:"Not equal",operator:"!="},{name:"Not identical",operator:"!=="},{name:"Less than",operator:"<"},{name:"Greater than",operator:">"},{name:"Less than or equal to",operator:"<="},{name:"Greater than or equal to",operator:">="}]}],A4={title:M4,operators:I4},R4=l.div`
  font-style: italic;
  font-weight: 500;
  font-size: 14px;
  color: ${h.gray400};
  break-inside: avoid;
`,P4=l.div`
  column-count: 4;
`,D4=l.div`
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
`,B4=l.div`
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
`,O4=()=>{const t=A4;return e.jsxs(e.Fragment,{children:[e.jsx(R4,{children:d(t.title)}),e.jsx(P4,{children:t.operators.map(n=>e.jsxs(D4,{children:[e.jsx("span",{children:d(n.title)}),n.items.map(s=>e.jsxs(B4,{children:[e.jsx("mark",{children:s.operator}),s.name&&e.jsx("span",{children:d(s.name)})]},s.operator))]},n.title))})]})},ru=(t,n)=>t.replace(/field:([a-zA-Z0-9_]+)/g,(s,i)=>n==="<mark>...</mark>"?`<mark>${i}</mark>`:`[[${i}]]`),_4=t=>P(Ae.all).filter(i=>t.availableFieldTypes.includes(i.typeClass)).map(i=>i.properties.handle),W4=({value:t,property:n,updateValue:s})=>{const[i,o]=g.useState(""),r=_4(n),a=g.useRef(null),c=g.useCallback(p=>{s(p.detail.tagify.DOM.input.textContent.replace(/\u200B/g,"").replace(/\s+/g," ").trim())},[s]),u=p=>{if(!p)return;const x=a.current.createTagElem({value:p});a.current.injectAtCaret(x);const f=a.current.insertAfterTag(x,"");a.current.placeCaretAfterNode(f)};return g.useEffect(()=>{o(ru(t))},[t]),e.jsxs(it,{children:[e.jsxs(T4,{children:[e.jsx(z4,{children:e.jsx(de,{emptyOption:d("Insert Field"),options:r.map(p=>({value:p,label:p})),onChange:u,value:""})}),e.jsxs("span",{children:["or type ",e.jsx("mark",{children:"@"})," to search on field handles"]})]}),e.jsx(N4,{children:e.jsx(uc,{autoFocus:!1,tagifyRef:a,settings:{pattern:/@/,enforceWhitelist:!0,editTags:!1,pasteAsTags:!0,duplicates:!0,dropdown:{enabled:0,includeSelectedTags:!0},templates:{tag:function(p){return`
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
                </tag>`}},whitelist:r},onChange:c,value:i})}),e.jsx(O4,{})]})},U4=l(Zt)`
  padding: ${m.sm};

  mark {
    padding: ${m.xs} ${m.sm};
    border-radius: ${S.lg};
    background: ${h.gray100};
  }
`,H4=({value:t})=>e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(U4,{children:[!t&&e.jsx(kt,{children:d("Not configured yet")}),e.jsx("div",{style:{lineHeight:"2.0"},dangerouslySetInnerHTML:{__html:O.sanitize(ru(t,"<mark>...</mark>"))}})]})}),q4=({value:t,property:n,errors:s,updateValue:i})=>e.jsx(W,{property:n,errors:s,children:e.jsx(Ve,{preview:e.jsx(H4,{value:t}),children:e.jsx(W4,{value:t,property:n,updateValue:i})})}),Ja="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",au=(t=8)=>{let n="";const s=Ja.length;let i=0;for(;i<t;)n+=Ja.charAt(Math.floor(Math.random()*s)),i+=1;return n},lu=l.div`
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

    box-shadow: ${ae.bottom};
  }
`,Q4=l.div`
  columns: ${({$columns:t})=>t||1};

  label {
    display: block;
    max-width: 100%;
    padding: 0 10px;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`,Za=[100,150,170,130],xr=({value:t,options:n,selectAll:s,loading:i,uniqueId:o,columns:r,emptyMessage:a,onUpdate:c})=>{const u=t.length===n?.length;return o||(o=au(6)),e.jsxs(e.Fragment,{children:[s&&e.jsxs(lu,{children:[e.jsx("input",{id:`${o}-all`,type:"checkbox",className:"checkbox",checked:u,onChange:()=>{c(u?[]:n.filter(p=>!("children"in p)).map(p=>p.value))}}),e.jsx("label",{htmlFor:`${o}-all`,children:d("Select All")})]}),!i&&!n?.length&&a&&e.jsx(cs,{instructions:a}),e.jsxs(Q4,{$columns:r,children:[i&&Array.from({length:n?.length||4}).map((p,x)=>e.jsx(k,{width:Za[x%Za.length],height:15},x)),!i&&n?.map(p=>{if("children"in p)return null;const x=`${o}-${p?.label}`;return e.jsxs("div",{title:p.label,children:[e.jsx("input",{id:x,type:"checkbox",className:"checkbox",checked:t.includes(p.value),onChange:()=>{t.includes(p.value)?c(t.filter(f=>f!==p.value)):c([...t,p.value])}}),e.jsx("label",{htmlFor:x,children:p.label})]},p.value)})]})]})},K4=({value:t,property:n,errors:s,updateValue:i})=>{const{handle:o,options:r,selectAll:a,columns:c}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(xr,{value:t,selectAll:a,options:r,emptyMessage:d("No options available"),uniqueId:o,columns:c,onUpdate:i})})},V4=({value:t,language:n,updateValue:s})=>e.jsx(it,{children:e.jsx(cr,{children:e.jsx(pc,{height:500,value:t,defaultLanguage:n,onChange:s,onMount:()=>{document.body.classList.remove("underline-links")},options:{scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5}}})})}),G4=l.pre`
  font-size: 10px;
`,Y4=l(Zt)`
  padding: ${m.sm};
`,J4=({value:t})=>e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(Y4,{children:[!t&&e.jsx(kt,{children:d("Not configured yet")}),e.jsx(G4,{children:t})]})}),Z4=({value:t,property:n,errors:s,updateValue:i})=>{const{language:o}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(Ve,{preview:e.jsx(J4,{value:t}),children:e.jsx(V4,{value:t,language:o,updateValue:i})})})},X4=l.div`
  display: flex;
  align-items: center;
  gap: ${m.sm};
`,e5=l.input`
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
`,t5=l.input`
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
`,n5="#000000",cu=({value:t,onChange:n})=>{const[s,i]=g.useState(()=>ks(t));g.useEffect(()=>{i(ks(t))},[t]);const o=c=>{const u=c.currentTarget.value.toLowerCase();i(u),n(u)},r=c=>{const u=c.currentTarget.value,p=du(u);if(p){i(p),n(p);return}i(u)},a=()=>{i(ks(t))};return e.jsxs(X4,{children:[e.jsx(e5,{type:"color",value:ks(t),onChange:o}),e.jsx(t5,{type:"text",value:s,maxLength:7,placeholder:"#RRGGBB",spellCheck:!1,onBlur:a,onChange:r})]})},s5=t=>`#${t.slice(1).split("").map(n=>n.repeat(2)).join("")}`,du=t=>{if(!t)return null;const n=t.trim(),s=n.startsWith("#")?n:`#${n}`;return/^#[0-9a-f]{3}$/i.test(s)?s5(s).toLowerCase():/^#[0-9a-f]{6}$/i.test(s)?s.toLowerCase():null},ks=t=>du(t)||n5,i5=({value:t,property:n,errors:s,updateValue:i,context:o})=>e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(cu,{value:t,onChange:i})}),uu=t=>e.jsx(R,{viewBox:"0 0 24 24",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h24v24h-24z"}),e.jsx("path",{d:"m8.547 19.767c2.399 1.065 5.256 1.007 7.703-.406 4.066-2.347 5.459-7.546 3.111-11.611l-.25-.433m-14.473 8.933c-2.347-4.065-.954-9.264 3.112-11.611 2.447-1.413 5.304-1.471 7.703-.406m-12.96 12.101 2.732.732.732-2.732m12.086-4.668.732-2.732 2.732.732",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2"})]})}),pu={spinner:Uo`
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
  `},o5=l.div`
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
`,r5=l.div`
  position: relative;
`,a5=l(hu)`
  position: absolute;
  top: -20px;
  right: 0;

  width: 40px;
`,l5=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{formId:r}=V(),{handle:a,source:c,parameterFields:u}=n,p={formId:r};u&&Object.entries(u).forEach(([y,w])=>{p[w]=un(o,y)});const{data:x,isFetching:f,isFetched:b,refetch:j}=B({queryKey:["dynamic-select",c,p],queryFn:()=>T.get(c,{params:p}).then(y=>y.data),staleTime:1/0,gcTime:1/0});return g.useEffect(()=>{f||!b||x!==void 0&&(Array.isArray(t)&&t.length>=0||i([]))},[x,b,f,i,t]),e.jsx(W,{property:n,errors:s,children:e.jsxs(r5,{children:[e.jsx(a5,{className:"btn",disabled:f,onClick:()=>{p.refresh="true",j(),delete p.refresh},children:e.jsx(uu,{})}),e.jsx(xr,{value:t,options:x,loading:f,emptyMessage:d("No options available"),uniqueId:a,onUpdate:i})]})})},c5=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{formId:r}=V(),{source:a,parameterFields:c,emptyOption:u}=n,p={formId:r};c&&Object.entries(c).forEach(([y,w])=>{p[w]=un(o,y)});const{data:x,isFetching:f,isFetched:b,refetch:j}=B({queryKey:["dynamic-select",a,p],queryFn:()=>T.get(a,{params:p}).then(y=>y.data),staleTime:1/0,gcTime:1/0});return g.useEffect(()=>{if(!(f||!b)&&x!==void 0&&!nd(x,t))if(u){if(t==="")return;i("")}else{const y=sd(x);if(y===t||y===void 0)return;i(y)}},[x,b,f,i,t,u]),e.jsx(W,{property:n,errors:s,context:o,children:e.jsxs(o5,{children:[e.jsx(de,{loading:f,value:t,onChange:i,emptyOption:u,options:x}),e.jsx(hu,{className:"btn",disabled:f,onClick:()=>{p.refresh="true",j(),delete p.refresh},children:e.jsx(uu,{})})]})})},xu={all:["craft-asset-previews"],byIds:t=>[...xu.all,{ids:t}]},d5=t=>B({queryKey:xu.byIds(t),queryFn:()=>T.get(`api/entries?ids=${t.join(",")}`).then(n=>n.data),staleTime:1/0,gcTime:1/0,enabled:t?.length>0}),u5=({actionLabel:t,multiSelect:n,sources:s="*",criteria:i,limit:o,value:r,onUpdate:a})=>{const{data:c,isFetching:u}=d5(r),p=g.useCallback(()=>{Craft.createElementSelectorModal("craft\\elements\\Entry",{multiSelect:o!==1||n,sources:s,criteria:i,storageKey:"freeform-entry-selection",onSelect:j=>{const w=j.map($=>$.id).slice(0,o).filter($=>!r?.includes($)),v=[...r||[],...w];a(v)}})},[a,n,i,o,s,r]),x=g.useCallback(j=>{a(r.filter(y=>y!==j))},[a,r]),f=o===void 0||r?.length===void 0||r?.length<o,b=c===void 0&&u&&r?.length>0;return e.jsxs("div",{className:"elementselect",children:[e.jsxs("ul",{className:"elements chips chips-small",children:[b&&r.map((j,y)=>e.jsx("li",{className:"element small",children:e.jsxs("div",{className:"chip small element",children:[e.jsx("div",{className:"thumb",children:e.jsx(k,{width:30,height:20})}),e.jsx("div",{className:"chip-content",children:e.jsx(k,{width:h5(y)})})]})},`skeleton-${j}`)),c?.map(j=>e.jsx("li",{className:"element small removable",children:e.jsx("div",{className:"chip small element removable",children:e.jsxs("div",{className:"chip-content",children:[e.jsx("span",{className:E("status",j.status==="live"?"open teal":"disabled"),role:"img","aria-label":d("Status: {status}",{status:j.status})}),e.jsx("div",{className:"element-label",children:e.jsx("a",{className:"label-link",href:j.editUrl,target:"_blank",rel:"noreferrer",children:j.title})}),e.jsx("div",{className:"chip-actions",children:e.jsx(x5,{type:"button",title:d("Remove"),onClick:()=>x(j.id)})})]})})},j.id))]}),f&&e.jsx("div",{className:"flex",children:e.jsx("button",{type:"button",className:"btn add icon",onClick:p,children:d(t||"Add an entry")})})]})},p5=[80,100,90,70,120],h5=t=>p5[t]||100,x5=l.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`,m5=({value:t,property:n,errors:s,updateValue:i})=>{const{criteria:o,multiSelect:r,actionLabel:a,limit:c}=n;return e.jsx(W,{property:n,errors:s,children:e.jsx(u5,{actionLabel:a,criteria:o,limit:c,multiSelect:r,value:t,onUpdate:i})})},g5=({value:t,property:n,errors:s,updateValue:i})=>{const o=P(Ae.all),r=Yt(),a=o.filter(c=>{if(!n.implements)return!0;const u=r(c.typeClass);return u?n.implements.some(p=>u.implements?.includes(p)):!1}).map(c=>({value:c.uid,label:c.properties.label}));return e.jsx(W,{property:n,errors:s,children:e.jsx(de,{onChange:i,value:t,options:a,emptyOption:n.emptyOption})})},f5=(t,n)=>s=>{const{uid:i}=t,o={};n.properties.forEach(r=>{const a=t.properties[r.handle];a?o[r.handle]=a:o[r.handle]=r.value}),s(be.batchEdit({uid:i,typeClass:n.typeClass,properties:o}))},b5={type:f5};var mr=(t=>(t.Checkboxes="Solspace\\Freeform\\Fields\\Implementations\\CheckboxesField",t.Checkbox="Solspace\\Freeform\\Fields\\Implementations\\CheckboxField",t.Dropdown="Solspace\\Freeform\\Fields\\Implementations\\DropdownField",t.Email="Solspace\\Freeform\\Fields\\Implementations\\EmailField",t.FileUpload="Solspace\\Freeform\\Fields\\Implementations\\FileUploadField",t.Hidden="Solspace\\Freeform\\Fields\\Implementations\\HiddenField",t.Html="Solspace\\Freeform\\Fields\\Implementations\\HtmlField",t.MultipleSelect="Solspace\\Freeform\\Fields\\Implementations\\MultipleSelectField",t.Number="Solspace\\Freeform\\Fields\\Implementations\\NumberField",t.Radios="Solspace\\Freeform\\Fields\\Implementations\\RadiosField",t.Textarea="Solspace\\Freeform\\Fields\\Implementations\\TextareaField",t.Text="Solspace\\Freeform\\Fields\\Implementations\\TextField",t.Calculation="Solspace\\Freeform\\Fields\\Implementations\\Pro\\CalculationField",t.Confirmation="Solspace\\Freeform\\Fields\\Implementations\\Pro\\ConfirmationField",t.Datetime="Solspace\\Freeform\\Fields\\Implementations\\DatetimeField",t.FileDragAndDrop="Solspace\\Freeform\\Fields\\Implementations\\Pro\\FileDragAndDropField",t.Image="Solspace\\Freeform\\Fields\\Implementations\\Pro\\ImageField",t.Cards="Solspace\\Freeform\\Fields\\Implementations\\Pro\\CardsField",t.Group="Solspace\\Freeform\\Fields\\Implementations\\Pro\\GroupField",t.Invisible="Solspace\\Freeform\\Fields\\Implementations\\Pro\\InvisibleField",t.OpinionScale="Solspace\\Freeform\\Fields\\Implementations\\Pro\\OpinionScaleField",t.Password="Solspace\\Freeform\\Fields\\Implementations\\Pro\\PasswordField",t.Phone="Solspace\\Freeform\\Fields\\Implementations\\Pro\\PhoneField",t.Rating="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RatingField",t.Regex="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RegexField",t.RichText="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RichTextField",t.Signature="Solspace\\Freeform\\Fields\\Implementations\\Pro\\SignatureField",t.Table="Solspace\\Freeform\\Fields\\Implementations\\Pro\\TableField",t.Website="Solspace\\Freeform\\Fields\\Implementations\\Pro\\WebsiteField",t))(mr||{});const j5=(t,n)=>(s,i)=>{y5(i(),s,t,n)},y5=(t,n,s,i)=>{const o=i.layoutUid,r=G();if(s.typeClass===mr.Group){const a=s.properties.layout,c=G(),u=t.layout.layouts.find(x=>x.uid===a);u&&n(Cn.add({...u,uid:c}));const p=t.layout.rows.filter(x=>x.layoutUid===a).sort((x,f)=>x.order-f.order);for(const x of p){const f=G();n(Ze.add({layoutUid:c,uid:f})),t.layout.fields.filter(b=>b.rowUid===x.uid).forEach(b=>{n(be.duplicate({uid:G(),rowUid:f,field:b}))})}n(Ze.add({layoutUid:o,uid:r,order:i?.order+1})),n(be.duplicate({uid:G(),rowUid:r,field:{...s,properties:{...s.properties,layout:c}}}));return}n(Ze.add({layoutUid:o,uid:r,order:i?.order+1})),n(be.duplicate({uid:G(),rowUid:r,field:s}))},v5=(t,n)=>t.order-n.order,et={current:t=>t.layout.pages.find(n=>n.uid===t.context.page),count:t=>t.layout.pages.length,all:X(t=>t.layout.pages,t=>[...t].sort(v5)),one:t=>n=>n.layout.pages.find(s=>s.uid===t),pageIndex:t=>n=>n.layout.pages.findIndex(s=>s.uid===t)},ns={inLayout:X(t=>t.layout.rows,(t,n)=>n,(t,n)=>[...t].filter(s=>s.layoutUid===n).sort((s,i)=>s.order-i.order))},bt={one:X(t=>t.layout.layouts,(t,n)=>n,(t,n)=>t.find(s=>s.uid===n)),currentPageLayout:X(t=>et.current(t),t=>t.layout.layouts,(t,n)=>n.find(s=>s.uid===t?.layoutUid)),pageLayout:X(t=>t.layout.layouts,(t,n)=>n,(t,n)=>t.find(s=>s.uid===n)),cartographed:{layoutFieldList:X(t=>t.layout.fields,(t,n)=>t.layout.layouts.find(s=>s.uid===n),t=>t,(t,n,s)=>{const i=ns.inLayout(s,n?.uid),o=[];return i.forEach(r=>{o.push(...t.filter(a=>a.rowUid===r.uid))}),o}),pageFieldList:X(t=>t.layout.pages,t=>t.layout.layouts,t=>t.layout.rows,t=>t.layout.fields,(t,n,s,i)=>{const o=[];return t.forEach(r=>{const a=n.find(p=>p.uid===r.layoutUid),c=s.filter(p=>p.layoutUid===a?.uid).sort((p,x)=>p.order-x.order),u=[];c.forEach(p=>{u.push(...i.filter(x=>x.rowUid===p.uid))}),o.push({page:r.uid,fields:u})}),o}),fullLayoutList:X(t=>t.layout.pages,t=>t.layout.layouts,t=>t.layout.rows,t=>t.layout.fields,(t,n,s,i)=>{const o=[];return t.forEach(r=>{const a=n.find(p=>p.uid===r.layoutUid),c=s.filter(p=>p.layoutUid===a?.uid).sort((p,x)=>p.order-x.order),u=[];c.forEach(p=>{const x=[];x.push(...i.filter(f=>f.rowUid===p.uid)),u.push(x)}),o.push(u)}),o}),fullLayoutList_:t=>{const n=et.all(t),s=[];return n.forEach(i=>{const o=t.layout.layouts.find(c=>c.uid===i.layoutUid),r=ns.inLayout(t,o?.uid),a=[];r.forEach(c=>{const u=[];t.layout.fields.filter(p=>p.rowUid===c.uid).forEach(p=>{u.push(p)}),a.push(u)}),s.push(a)}),s}}},ii=(t,n)=>{const s=[];t.layout.rows.forEach(i=>{t.layout.fields.filter(r=>r.rowUid===i.uid).length===0&&s.push(i.uid)}),s.forEach(i=>{n(Ze.remove(i))})},w5=t=>(n,s)=>{const{field:i,order:o}=t;let{layoutUid:r}=t;const a=G();r||(r=bt.currentPageLayout(s())?.uid),n(Ze.add({layoutUid:r,uid:a,order:o})),n(be.moveTo({uid:i.uid,rowUid:a,position:0})),ii(s(),n)},$5=(t,n,s)=>(i,o)=>{i(be.moveTo({uid:t.uid,rowUid:n.uid,position:s})),ii(o(),i)},C5={newRow:w5,existingRow:$5},k5=t=>(n,s)=>{if(I.editions.is(re.Express)&&s().layout.fields.length>=I.limits.fields)return;const{fieldType:i,row:o}=t;let{layoutUid:r}=t;if(!r){const u=s();o?r=o.layoutUid:r=bt.currentPageLayout(u)?.uid}const a=G(),c=G();n(Ze.add({layoutUid:r,uid:c,order:o?.order})),n(be.add({fieldType:i,uid:a,rowUid:c}))},S5=t=>n=>{const{fieldType:s,row:i,order:o}=t,r=G();n(be.add({fieldType:s,uid:r,rowUid:i.uid,order:o}))},L5={newRow:k5,existingRow:S5},F5=t=>(n,s)=>{mu(s(),n,t),ii(s(),n)},mu=(t,n,s)=>{if(s.typeClass===mr.Group){const i=t.layout.layouts.find(r=>r.uid===s.properties.layout);if(!i)return;t.layout.rows.filter(r=>r.layoutUid===i.uid).forEach(r=>{t.layout.fields.filter(c=>c.rowUid===r.uid).forEach(c=>{mu(t,n,c)}),n(Ze.remove(r.uid))}),n(Cn.remove(i.uid))}n(be.remove(s.uid))},Oe={move:{newField:L5,existingField:C5},remove:F5,duplicate:j5,change:b5},E5=({property:t,context:n})=>{const s=H(),i=Yt(),{data:o}=tr(),r=n;return r?.typeClass?e.jsx(je,{value:r.typeClass,property:{type:K.Select,handle:"typeClass",label:d(t.label),instructions:d(t.instructions),options:o.filter(a=>a.visible!==!1).map(a=>({label:d(a.name),value:a.typeClass}))},updateValue:a=>{confirm(d("Are you sure? You might potentially lose important data."))&&s(Oe.change.type(r,i(a)))}}):null},T5=()=>null,N5=({value:t,property:n,errors:s,updateValue:i,autoFocus:o,context:r})=>{const{handle:a,min:c,max:u,unsigned:p,step:x=1}=n,f=n.flags?.includes("readonly")||n.flags?.includes("as-readonly-in-instance"),b=y=>{i(xa(y.target.value,{min:c,max:u,unsigned:p}))},j=y=>{i(xa(y.target.value))};return e.jsx(W,{property:n,errors:s,context:r,children:e.jsx("input",{id:a,type:"number",className:E("text","fullwidth",f&&["readonly","disabled"]),value:t??"",autoFocus:o,step:x,onChange:j,onBlur:b,readOnly:f})})},z5=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"})}),M5=t=>Y({opacity:t?1:0,transform:t?"rotate(0deg)":"rotate(-30deg)",config:{tension:500}}),I5=t=>Y({backgroundColor:t?h.gray050:h.white,config:{tension:500}}),A5=l.div`
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
`,R5=l(_.button)`
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
`;const P5=l(_.h1)`
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
`,D5=({value:t,property:n,errors:s,updateValue:i})=>{const[o,r]=g.useState(!1),[a,c]=g.useState(!1),{handle:u}=n,p=g.useRef(null),x=I5(o),f=M5(o);return e.jsxs(A5,{className:E(s?.length>0&&"errors"),children:[a&&e.jsx("input",{id:u,ref:p,type:"text",className:"text fullwidth",value:t||"",onChange:b=>i(b.target.value),onBlur:()=>c(!1),onKeyDown:b=>{b.key==="Enter"&&c(!1)}}),!a&&e.jsx(P5,{style:x,onClick:()=>{c(!0),r(!1),setTimeout(()=>{p.current?.focus()},3)},onMouseEnter:()=>r(!0),onMouseLeave:()=>r(!1),children:e.jsxs("span",{children:[e.jsx("span",{children:t}),e.jsx(R5,{style:f,children:e.jsx(z5,{})})]})}),e.jsx(ti,{errors:s})]})},B5=l.div`
  display: flex;
`,gu=l.input`
  width: 100%;
  --focus-ring: 0;
`,O5=l(gu)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
`,_5=l(gu)`
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`,W5=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const[r,a]=t||[null,null],c=o.properties?.allowNegative?null:0;return e.jsx(W,{property:n,errors:s,children:e.jsxs(B5,{children:[e.jsx("div",{children:e.jsx(O5,{id:"min",value:r===null?"":r,type:"number",min:c,className:"text",placeholder:"Min",onChange:({target:u})=>{const p=u.value!==""?Number(u.value):null;i([p,a])}})}),e.jsx("div",{children:e.jsx(_5,{id:"max",value:a===null?"":a,type:"number",min:c,className:"text",placeholder:"Max",onChange:({target:u})=>{const p=u.value!==""?Number(u.value):null;i([r,p])}})})]})})},U5=(t,n)=>[...t.slice(0,n+1),{id:au(6),label:""},...t.slice(n+1)],H5=l.li`
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
`,q5=l.textarea`
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
`,Q5=l.div`
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
`,K5=l.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 8px;
`,V5=l.div`
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
`,G5=l.div`
  border: 1px solid ${h.inputBorder};
  border-radius: 3px;
`,Y5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M448 96L416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L448 160C465.7 160 480 174.3 480 192L480 229.5C480 255 490.1 279.4 508.1 297.4L530.7 320L508.1 342.6C490.1 360.6 480 385 480 410.5L480 448C480 465.7 465.7 480 448 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L448 544C501 544 544 501 544 448L544 410.5C544 402 547.4 393.9 553.4 387.9L598.7 342.6C611.2 330.1 611.2 309.8 598.7 297.3L553.4 252C547.4 246 544 237.9 544 229.4L544 191.9C544 138.9 501 95.9 448 95.9zM192 96C139 96 96 139 96 192L96 229.5C96 238 92.6 246.1 86.6 252.1L41.4 297.4C28.9 309.9 28.9 330.2 41.4 342.7L86.7 388C92.7 394 96.1 402.1 96.1 410.6L96 448C96 501 139 544 192 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L192 480C174.3 480 160 465.7 160 448L160 410.5C160 385 149.9 360.6 131.9 342.6L109.3 320L131.9 297.4C149.9 279.4 160 255 160 229.5L160 192C160 174.3 174.3 160 192 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L192 96z"})}),J5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"})}),Z5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M152 160C174.1 160 192 177.9 192 200L192 248C192 270.1 174.1 288 152 288L104 288C81.9 288 64 270.1 64 248L64 200C64 177.9 81.9 160 104 160L152 160zM344 288L296 288C273.9 288 256 270.1 256 248L256 200C256 177.9 273.9 160 296 160L344 160C366.1 160 384 177.9 384 200L384 248C384 270.1 366.1 288 344 288zM536 288L488 288C465.9 288 448 270.1 448 248L448 200C448 177.9 465.9 160 488 160L536 160C558.1 160 576 177.9 576 200L576 248C576 270.1 558.1 288 536 288zM536 480L488 480C465.9 480 448 462.1 448 440L448 392C448 369.9 465.9 352 488 352L536 352C558.1 352 576 369.9 576 392L576 440C576 462.1 558.1 480 536 480zM344 352C366.1 352 384 369.9 384 392L384 440C384 462.1 366.1 480 344 480L296 480C273.9 480 256 462.1 256 440L256 392C256 369.9 273.9 352 296 352L344 352zM152 480L104 480C81.9 480 64 462.1 64 440L64 392C64 369.9 81.9 352 104 352L152 352C174.1 352 192 369.9 192 392L192 440C192 462.1 174.1 480 152 480z"})}),X5=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM404.4 276.7L324.4 404.7C320.2 411.4 313 415.6 305.1 416C297.2 416.4 289.6 412.8 284.9 406.4L236.9 342.4C228.9 331.8 231.1 316.8 241.7 308.8C252.3 300.8 267.3 303 275.3 313.6L302.3 349.6L363.7 251.3C370.7 240.1 385.5 236.6 396.8 243.7C408.1 250.8 411.5 265.5 404.4 276.8z"})}),e3=t=>{const[n,s]=g.useState(!1),{removeCard:i}=t,o=s3(t.card.metadata);return e.jsxs(H5,{children:[e.jsxs(K5,{children:[e.jsx(Xa,{onClick:()=>s(!n),className:E(n&&"active"),children:e.jsx(xe,{title:d("Custom Metadata"),delay:[500,0],children:e.jsxs(Q5,{children:[e.jsx("span",{className:E(o>0&&"filled"),children:o}),e.jsx(Y5,{})]})})}),e.jsx(Xa,{className:"drag-handle",title:d("Reorder Card"),children:e.jsx(Z5,{})}),e.jsx(Nn,{active:!0,onClick:i,title:d("Remove Card")})]}),n&&e.jsx(n3,{...t}),!n&&e.jsx(t3,{...t})]})},t3=({card:t,updateCard:n})=>{const{label:s,value:i,assetId:o,description:r}=t;return e.jsxs(e.Fragment,{children:[e.jsx(Te,{label:"Image",children:e.jsx(pr,{criteria:{kind:["image"]},value:o?[o]:[],limit:1,onUpdate:a=>n({...t,assetId:a[0]??void 0})})}),e.jsx(Te,{label:"Title",children:e.jsx("input",{type:"text",className:"text fullwidth",value:s,onChange:a=>n({...t,label:a.target.value})})}),e.jsx(Te,{label:"Value",instructions:"Enter a value to use when this card is selected.",children:e.jsx("input",{type:"text",className:"text fullwidth",value:i,onChange:a=>n({...t,value:a.target.value})})}),e.jsx(Te,{label:"Description",children:e.jsx(q5,{rows:4,className:"text fullwidth",value:r,onChange:a=>n({...t,description:a.target.value})})})]})},n3=({card:t,updateCard:n})=>{const s=JSON.stringify(t.metadata,null,2),[i,o]=g.useState("pending"),[r,a]=g.useState(),[c,u]=g.useState(s),p=xs(c,1e3);return g.useEffect(()=>{u(x=>x===s?x:s)},[s]),g.useEffect(()=>{if(p){a(void 0),o("pending");try{const x=JSON.parse(p),f=JSON.stringify(x,null,2);if(o("success"),f===s)return;n({...t,metadata:x})}catch(x){o("error"),a(x instanceof Error?x.message:"Invalid JSON")}}},[p,s,n,t]),e.jsxs(e.Fragment,{children:[e.jsx(Te,{label:"Metadata",instructions:"Enter metadata in JSON format. Access it in your template with `card.metadata.yourProperty`",children:e.jsx(G5,{children:e.jsx(pc,{height:200,value:c,defaultLanguage:"json",onChange:x=>u(x),onMount:()=>{document.body.classList.remove("underline-links")},options:{folding:!1,glyphMargin:!1,renderLineHighlight:"none",minimap:{enabled:!1},lineNumbers:"on",lineNumbersMinChars:1,scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5}}})})}),i!=="pending"&&e.jsxs(V5,{className:i,children:[e.jsxs("span",{children:[i==="error"&&e.jsx(J5,{}),i==="error"&&"Invalid JSON",i==="success"&&e.jsx(X5,{}),i==="success"&&"JSON Valid"]}),!!r&&e.jsx("div",{className:"code",children:r})]})]})},s3=t=>Array.isArray(t)?t.length:t&&typeof t=="object"?Object.keys(t).length:typeof t=="boolean"||typeof t=="string"?1:0,i3=({onClick:t})=>e.jsx(o3,{onClick:t,children:d("Add Card")}),o3=l.div`
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
`,r3=l(it)`
  width: 60vw;
  min-width: 800px;
`,a3=l(dr)``,l3=l.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`,c3=({value:t,property:n,updateValue:s,context:i})=>{const o=g.useRef(null),{updateTranslation:r,getTranslation:a,willTranslate:c}=Ce(i),u=c(n.handle),p=a(n.handle,t);return g.useEffect(()=>{if(!o.current)return;const x=Ne.create(o.current,{animation:150,ghostClass:"sortable-ghost",handle:".drag-handle",onEnd:f=>{const b=[...t],[j]=b.splice(f.oldIndex,1);b.splice(f.newIndex,0,j),s(b)}});return()=>{x.destroy()}},[t,s]),e.jsxs(r3,{children:[e.jsx(a3,{children:e.jsxs(l3,{ref:o,children:[t.map((x,f)=>e.jsx(e3,{card:x,removeCard:()=>{const b=[...t];b.splice(f,1),s(b)},updateCard:b=>{if(u){const j=[...p];j[f]=b,r(n.handle,j)}else{const j=[...t];j[f]=b,s(j)}}},x.id)),e.jsx(i3,{onClick:()=>s(U5(t,t.length))})]})}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},gr=l.div`
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
`,d3=l.div`
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
`;const u3=l.div`
  height: 200px;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: 0 ${m.md};

  background: ${h.white};
  box-shadow: ${ae.box};
  border-radius: ${S.lg};

  ${Q};
`,p3=l.div`
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
`,h3=l.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${h.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`,fr=(t=[],n)=>B({queryKey:["assets","urls",t?.sort(),n],queryFn:()=>T.get(`/api/assets/urls?ids=${t.join(",")}&transform=${n||""}`).then(s=>s.data),staleTime:1/0,gcTime:1/0,enabled:t.length>0}),x3=l.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  min-height: 60px;
`,m3=l.li`
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
`,g3=l.div`
  grid-area: icon;
  align-self: start;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${h.gray200};
  border-radius: 5px;
  overflow: hidden;
`,f3=l.div`
  grid-area: label;

  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
`,b3=l.div`
  grid-area: description;

  color: ${h.gray300};
  font-size: 12px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
`,j3=l.div`
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
`,y3=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 160C496 151.2 488.8 144 480 144L160 144zM96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256C206.3 256 192 241.7 192 224C192 206.3 206.3 192 224 192zM360 264C368.5 264 376.4 268.5 380.7 275.8L460.7 411.8C465.1 419.2 465.1 428.4 460.8 435.9C456.5 443.4 448.6 448 440 448L200 448C191.1 448 182.8 443 178.7 435.1C174.6 427.2 175.2 417.6 180.3 410.3L236.3 330.3C240.8 323.9 248.1 320.1 256 320.1C263.9 320.1 271.2 323.9 275.7 330.3L292.9 354.9L339.4 275.9C343.7 268.6 351.6 264.1 360.1 264.1z"})}),v3=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})}),w3=({cards:t,transform:n})=>{const s=t.map(r=>r.assetId).filter(Boolean),{data:i,isFetching:o}=fr(s,n);return e.jsxs(Ud,{"data-edit":d("Click to edit data"),children:[!t.length&&e.jsx(gr,{children:d("No cards yet. Click Add Card to create one.")}),e.jsx(x3,{children:t.map((r,a)=>e.jsxs(m3,{"data-title":"card",children:[e.jsx(g3,{children:e.jsx($3,{assetUrl:i?.[r.assetId],loading:o})}),e.jsx(f3,{children:r.label||d("No title")}),e.jsx(b3,{children:r.description||d("No description")})]},a))})]})},$3=({assetUrl:t,loading:n})=>n?e.jsx(j3,{children:e.jsx(v3,{})}):t===void 0?e.jsx(y3,{}):e.jsx("img",{src:t.src,alt:t.title||d("No title")}),C3=({value:t,property:n,errors:s,updateValue:i,context:o})=>e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(Ve,{preview:e.jsx(w3,{cards:t,transform:o?.properties?.transform}),children:e.jsx(c3,{value:t,updateValue:i,property:n,context:o})})}),k3=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"})});var fu=(t=>(t.EmailMarketing="email-marketing",t.Crm="crm",t.Elements="elements",t.Captchas="captchas",t.PaymentGateways="payment-gateways",t.Webhooks="webhooks",t.Singles="single",t.Other="other",t.Ai="ai",t))(fu||{}),Ee=(t=>(t.Relation="relation",t.Custom="custom",t.Preset="preset",t))(Ee||{});const S3=t=>e.jsx(R,{viewBox:"0 0 576 512",...t,children:e.jsx("path",{d:"M266.2 4.7C273 1.6 280.5 0 288 0s15 1.6 21.8 4.7l217.4 97.5c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 251.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 153.9C38.6 149.3 32 139.2 32 128s6.6-21.3 16.8-25.9L266.2 4.7zM288 32c-3 0-6 .6-8.8 1.9L69.3 128l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-210-94.1C294 32.6 291 32 288 32zM48.8 358.1l45.9-20.6 39.1 17.5L69.3 384l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-64.5-28.9 39.1-17.5 45.9 20.6c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 507.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 409.9C38.6 405.3 32 395.2 32 384s6.6-21.3 16.8-25.9zM94.7 209.5l39.1 17.5L69.3 256l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-64.5-28.9 39.1-17.5 45.9 20.6c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 379.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 281.9C38.6 277.3 32 267.2 32 256s6.6-21.3 16.8-25.9l45.9-20.6z"})}),L3=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M64 496c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48H204.1c1.3 0 2.6 .1 3.9 .2V136c0 22.1 17.9 40 40 40H367.8c.2 1.3 .2 2.6 .2 3.9V448c0 26.5-21.5 48-48 48H64zM358.6 157.3c.9 .9 1.7 1.8 2.4 2.7H248c-13.3 0-24-10.7-24-24V22.9c1 .8 1.9 1.6 2.7 2.4L358.6 157.3zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V179.9c0-12.7-5.1-24.9-14.1-33.9L238.1 14.1c-9-9-21.2-14.1-33.9-14.1H64zm40 256c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104z"})}),bu=(t,n)=>{const{getState:s}=Vo(),i=Yt(),o=P(bt.cartographed.pageFieldList),r=P(et.all);return g.useMemo(()=>o.map(a=>({label:r.find(c=>c.uid===a.page)?.label,icon:e.jsx(L3,{}),children:a.fields.map(c=>{if(t?.includes(c.uid))return null;const u=i(c.typeClass);if(n?.includes(u?.type))return null;if(u?.type==="group"){const p=bt.cartographed.layoutFieldList(s(),c.properties.layout);return{label:c.properties.label,icon:e.jsx(S3,{}),children:p.map(x=>({label:x.properties.label,value:x.uid}))}}return{value:c.uid,label:c.properties.label}}).filter(Boolean)})),[o,r,t,n,i,s])},F3=({value:t,onChange:n})=>{const s=bu();return e.jsx(de,{options:s,emptyOption:d("Do not map this field"),value:t,onChange:n})},E3=t=>e.jsx(R,{viewBox:"0 0 640 512",...t,children:e.jsx("path",{d:"M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"})}),T3=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM184 72c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L184 72zm0 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-304 0zm0 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-304 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"})}),N3=t=>e.jsx(R,{viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"})}),z3=l.button`
  position: absolute;
  top: 0;
  right: 0;

  font-size: 16px;

  &[disabled] > svg {
    fill: ${h.gray300};

    animation: ${pu.spinner} 2s infinite;
    transform-origin: 50% 50%;
  }
`,M3=l.div`
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
`,I3=l.div`
  max-width: 1000px;
  max-height: 454px;

  overflow-y: auto;
  overflow-x: hidden;

  border: 1px solid rgb(205 216 228 / 50%);
  border-radius: 5px;

  padding: ${m.sm} ${m.lg};

  ${Q};
`,A3=l.div`
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
`,R3=l.div`
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
`,P3=l.input`
  &::placeholder {
    color: ${h.gray250};
  }
`,D3=({sources:t,mapping:n,updateValue:s})=>{if(!n)return null;const i=(o,r,a)=>{s({...n,[o]:{type:r,value:a}})};return e.jsxs(I3,{children:[t.length===0&&e.jsx(Xt,{children:d("No data present")}),t.map(o=>{const r=n[o.id]??{type:Ee.Relation,value:""};return e.jsxs(M3,{children:[e.jsx(A3,{className:E(o.required&&"required"),children:e.jsx("span",{children:o.label})}),e.jsxs(R3,{children:[o.options?.length>0&&e.jsx(Ri,{title:d("Pre-defined options"),className:E(r.type===Ee.Preset&&"active"),onClick:()=>i(o.id,Ee.Preset),children:e.jsx(T3,{})}),e.jsx(Ri,{title:d("Twig code"),className:E(r.type===Ee.Custom&&"active"),onClick:()=>i(o.id,Ee.Custom),children:e.jsx(E3,{})}),e.jsx(Ri,{title:d("Freeform field"),className:E(r.type===Ee.Relation&&"active"),onClick:()=>i(o.id,Ee.Relation),children:e.jsx(N3,{})})]}),e.jsxs("div",{children:[r.type===Ee.Preset&&e.jsx(de,{value:r?.value,showValues:!0,emptyOption:d("Select an option"),onChange:a=>{i(o.id,Ee.Preset,a)},options:o.options.map(a=>({value:a.key,label:a.label}))}),r.type===Ee.Relation&&e.jsx(F3,{value:r?.value,onChange:a=>{i(o.id,Ee.Relation,a)}}),r.type===Ee.Custom&&e.jsx(P3,{type:"text",className:"text fullwidth code",placeholder:"e.g. {{ yourField }} {{ otherField }}",value:r?.value||"",onChange:a=>{i(o.id,Ee.Custom,a.target.value)}})]})]},o.id)})]})},B3=({value:t={},property:n,errors:s,updateValue:i,context:o})=>{const{formId:r}=V(),a={formId:r};n.parameterFields&&Object.entries(n.parameterFields).forEach(([x,f])=>{a[f]=un(o,x)});const{data:c,isFetching:u,refetch:p}=B({queryKey:["field-mapping",n.source,a],queryFn:async()=>await T.get(n.source,{params:a}).then(f=>f.data),staleTime:1/0,gcTime:1/0});return g.useEffect(()=>{if(u||c===void 0)return;const x=c.map(j=>String(j.id)),f=Mt(t);let b=!1;Object.keys(t).forEach(j=>{x.includes(j)||(delete f[j],b=!0)}),b&&i(f)},[u,c,t,i]),e.jsxs(W,{property:n,errors:s,children:[e.jsx(z3,{className:"btn",disabled:u,onClick:()=>{a.refresh="true",p(),delete a.refresh},children:e.jsx(k3,{})}),c&&e.jsx(D3,{sources:c,mapping:t,updateValue:i}),!c&&u&&e.jsxs("div",{children:[e.jsx(k,{width:"40%"}),e.jsx(k,{width:"35%"}),e.jsx(k,{width:"42%"})]})]})},tn=({value:t,onChange:n})=>e.jsx("div",{className:"select",children:e.jsxs("select",{value:t,onChange:s=>n?.(s.target.value),children:[e.jsx("option",{value:Be.Or,children:d("any")}),e.jsx("option",{value:Be.And,children:d("all")})]})}),O3=l.table`
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
`,ju=l.button`
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
`,pn={one:t=>X(n=>n.rules.fields.items,n=>n.find(s=>s.field===t)),isInCondition:t=>X(n=>n.rules.fields.items,n=>n.rules.pages.items,n=>n.rules.submitForm.item,n=>n.rules.buttons.items,(n,s,i,o)=>n.some(r=>r.conditions.some(a=>a.field===t))||s.some(r=>r.conditions.some(a=>a.field===t))||i?.conditions.some(r=>r.field===t)||o.some(r=>r.conditions.some(a=>a.field===t))),usedByFields:t=>X(n=>n.rules.fields.items,n=>n.filter(i=>i.conditions.some(o=>o.field===t)).map(i=>i.field)),hasRule:t=>X(n=>n.rules.fields.items,n=>!!n.find(s=>s.field===t))},_3=({condition:t,onChange:n})=>{const{uid:s}=V(),i=P(pn.usedByFields(s)),o=bu([...i,s],["html","rich-text","file","file-dnd","signature"]);return e.jsx(de,{options:o,emptyOption:"Choose field",value:t.field,onChange:n})},W3={[ie.Equals]:d("is equal to"),[ie.NotEquals]:d("does not equal"),[ie.GreaterThan]:d("greater than"),[ie.GreaterThanOrEquals]:d("greater than or equal to"),[ie.LessThan]:d("less than"),[ie.LessThanOrEquals]:d("less than or equal to"),[ie.Contains]:d("contains"),[ie.NotContains]:d("does not contain"),[ie.StartsWith]:d("starts with"),[ie.EndsWith]:d("ends with"),[ie.IsEmpty]:d("is empty"),[ie.IsNotEmpty]:d("is not empty"),[ie.IsOneOf]:d("is one of"),[ie.IsNotOneOf]:d("is not one of")},U3=({condition:t,onChange:n})=>{const{operator:s}=t;return e.jsx("div",{className:"select fullwidth",children:e.jsx(de,{value:s,onChange:i=>n?.(i),options:Object.entries(W3).map(([i,o])=>({value:i,label:o}))})})},H3=l.div`
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
`,yu=({value:t,options:n=[],onChange:s,allowCustom:i,placeholder:o})=>{const r=g.useRef(null);return e.jsx(H3,{children:e.jsx(U1,{tagifyRef:r,placeholder:o,settings:{tagTextProp:"name",enforceWhitelist:!i,whitelist:n,dropdown:{mapValueTo:"name",enabled:0}},value:t,onChange:a=>s(a.detail.tagify.getCleanValue().map(c=>c.value))})})};var vu=(t=>(t.Options="options",t.GeneratedOptions="generatedOptions",t))(vu||{}),mt=(t=>(t.Group="group",t.Rating="rating",t.OpinionScale="opinion-scale",t))(mt||{});const q3=({fieldUid:t,onChange:n,value:s})=>e.jsxs("div",{className:"checkbox-wrapper",children:[e.jsx("input",{id:`${t}-rule-checkbox`,type:"checkbox",className:"checkbox",onChange:i=>n?.(i.target.checked?"1":""),checked:!!s}),e.jsx("label",{htmlFor:`${t}-rule-checkbox`,children:d(s?"Checked":"Unchecked")})]});var Re=(t=>(t.Custom="custom",t.Elements="elements",t.Predefined="predefined",t))(Re||{});const Q3=[I.limitations.can("layout.options.custom")&&{value:"custom",label:d("Custom")},I.limitations.can("layout.options.elements")&&{value:"elements",label:d("Elements")},I.limitations.can("layout.options.predefined")&&{value:"predefined",label:d("Predefined")}].filter(Boolean),oi=(t,n)=>{const{getOptionTranslations:s}=Ce(t);let i,o;if(n?.type===mt.OpinionScale)i={source:Re.Custom,options:t.properties.scales.map(x=>({label:x[1]||x[0],value:x[0]})),useCustomValues:!0};else if(n?.type===mt.Rating)i={source:Re.Custom,options:Array.from({length:t.properties.maxValue},(x,f)=>({label:String(f+1),value:String(f+1)})),useCustomValues:!0};else if(n?.implements.includes(vu.GeneratedOptions)){const x=n?.properties.find(f=>f.type===K.Options);if(x){const f=t?.properties[x.handle];i=s(x.handle,f),o=f?.emptyOption}}const r=i?.source===Re.Custom,{data:a,isFetching:c}=B({queryKey:["field-options",i],queryFn:async()=>{if(!i||r)return[];if(i?.source!==Re.Custom&&!i.typeClass)return[];try{const x=await T.post("api/options",i),{data:f}=x;return f}catch(x){return console.error(x),[]}},staleTime:1/0,gcTime:1/0,enabled:!r}),u=!!i&&!r&&c;let p=r?i.options:a||[];return o&&(p=[{label:d(o),value:""},...p]),[p,u]},K3=({field:t,fieldType:n,value:s,multiple:i,onChange:o})=>{const[r,a]=oi(t,n);if(i){let c;if(s)try{c=JSON.parse(s)}catch{c=s}else c="";return e.jsx(e.Fragment,{children:!a&&e.jsx(yu,{value:c,options:r.map(u=>"value"in u?{value:u.value,name:u.label,editable:!1}:null).filter(Boolean),allowCustom:!1,onChange:u=>o(JSON.stringify(u))})})}return e.jsx(de,{emptyOption:"Select an option",value:s,options:r,loading:a,onChange:c=>o?.(c)})},V3=({field:t,value:n,onChange:s})=>{const o=(t.properties?.scales||[]).map(([r,a])=>({label:`${a||r}`,value:r}));return e.jsx(de,{emptyOption:"Select a scale value",value:n,options:o,onChange:r=>s?.(r)})},G3=({field:t,value:n,onChange:s})=>{const i=t.properties?.maxValue||1,o=ts(1,i).map(r=>({label:`${r}`,value:`${r}`}));return e.jsx(de,{emptyOption:"Select a rating",value:n,options:o,onChange:r=>s?.(r)})},Y3=({condition:t,onChange:n})=>{const{field:s,value:i,operator:o}=t,r=P(Ae.one(s)),a=Me(r?.typeClass);if(!a||Dn.noValue.includes(o))return null;if(a.implements.includes("boolean")&&Dn.boolean.includes(o))return e.jsx(q3,{fieldUid:s,onChange:n,value:i});if(a.implements.includes("generatedOptions"))return e.jsx(K3,{field:r,fieldType:a,value:i,multiple:Dn.multiple.includes(o),onChange:x=>n?.(x)});if(Dn.multiple.includes(o))return e.jsx(yu,{value:i,allowCustom:!0,onChange:x=>n(JSON.stringify(x)),placeholder:d("Add values")});const p=a.type;return p===mt.Rating?e.jsx(G3,{field:r,value:i,onChange:n}):p===mt.OpinionScale?e.jsx(V3,{field:r,value:i,onChange:n}):e.jsx("input",{className:"text fullwidth",type:"text",value:i,onChange:x=>n?.(x.target.value)})},nn=({conditions:t,buttonLabel:n,loading:s,onChange:i})=>e.jsx(O3,{children:e.jsxs("tbody",{children:[s&&e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(k,{height:34})}),e.jsx("td",{children:e.jsx(k,{height:34})}),e.jsx("td",{children:e.jsx(k,{height:34})}),e.jsx("td",{})]}),t.map((o,r)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(_3,{condition:o,onChange:a=>i?.([...t.slice(0,r),{...o,field:a},...t.slice(r+1)])})}),e.jsx("td",{children:e.jsx(U3,{condition:o,onChange:a=>i?.([...t.slice(0,r),{...o,operator:a},...t.slice(r+1)])})}),e.jsx("td",{children:e.jsx(Y3,{condition:o,onChange:a=>{i?.([...t.slice(0,r),{...o,value:a},...t.slice(r+1)])}})}),e.jsx("td",{children:e.jsx(ju,{children:e.jsx(dt,{onClick:()=>{i?.([...t.slice(0,r),...t.slice(r+1)])}})})})]},r)),!s&&e.jsx("tr",{children:e.jsx("td",{colSpan:4,children:e.jsx("button",{type:"button",className:"btn add icon fullwidth",onClick:()=>{i?.([...t,{uid:G(),field:"",operator:ie.Equals,value:""}])},children:d(n||"Add a condition")})})})]})}),wu=({value:t,onChange:n,options:s})=>{const{on:i,off:o}=s;return e.jsx("div",{className:"select",children:e.jsxs("select",{value:t?i:o,onChange:r=>n?.(r.target.value===i),children:[e.jsx("option",{value:i,children:d(i)}),e.jsx("option",{value:o,children:d(o)})]})})},lt=l.h1`
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
`,el={isInitialized:t=>t.rules.integrations.initialized,one:t=>X(n=>n.rules.integrations.items,n=>n.find(s=>s.uid===t)),hasRule:t=>X(n=>n.rules.integrations.items,n=>!!n.find(s=>s.uid===t))},J3=({property:t,updateValue:n,value:s,context:i})=>{const o=H(),r=g.useRef([]),{id:a}=P(Pe.current),{data:c,isFetched:u}=km(a),p=P(el.isInitialized),x=P(el.one(s)),{instanceUid:f}=i;return g.useEffect(()=>{if(!r.current.includes(s)&&u&&p){if(s&&c.find(j=>j.uid===s))return;const b=G();r.current.push(b),o(Bn.add({ruleUid:b,integrationUid:f})),n(b)}},[p,c,u,s,o,f,n]),e.jsxs(W,{property:t,children:[e.jsxs(sn,{children:[e.jsx(wu,{value:x?.push??!0,options:{on:"Push",off:"Don't push"},onChange:b=>o(Bn.modifyPush({ruleUid:x.uid,push:b}))}),d("data to integration when"),e.jsx(tn,{value:x?.combinator??Be.Or,onChange:b=>o(Bn.modifyCombinator({ruleUid:x.uid,combinator:b}))}),d("of the following rules match:")]}),e.jsx(nn,{loading:!x,conditions:x?x.conditions:[],onChange:b=>{o(Bn.modifyConditions({ruleUid:x.uid,conditions:b}))}})]})},Mn=({children:t})=>e.jsx(Qt,{baseColor:"#e6eaee",highlightColor:"#ced1d4",children:t}),Z3=l.div`
  padding: ${m.xl};
  border-bottom: 1px solid ${h.gray200};
`,X3=l.div`
  margin-bottom: ${m.lg};
  color: ${h.gray600};
  font-size: 0.9em;
`,eb=l.button`
  width: 100%;
  margin-top: ${m.lg};
`,tb=l.div`
  color: ${h.gray600};
  padding: ${m.lg};
  text-align: center;
`,nb=l.div`
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
`,sb=l.span`
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
`,ib=l.div`
  margin-top: ${m.lg};
  padding: ${m.md};
  background-color: ${h.teal050};
  color: ${h.teal700};
  border-radius: ${S.md};
`,ob=l.div`
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
`,rb=({formId:t,onClose:n})=>{const[s,i]=g.useState(null),[o,r]=g.useState(null),[a,c]=g.useState(null),[u,p]=g.useState(null),{data:x,isFetching:f,refetch:b}=Lm(t),{data:j}=Pd(),[y,w]=g.useState(!1),{data:v}=Fm(s,{enabled:!!s,refetchInterval:y?3e3:void 0});g.useEffect(()=>{s&&v?.status==="pending"?w(!0):w(!1)},[s,v?.status]);const $=Em(t,{onSuccess:L=>{i(L.testToken),r(Date.now())},onError:()=>{i(null)}});g.useEffect(()=>{o&&v?.status==="pending"&&Date.now()-o>24e4&&(i(null),r(null))},[o,v?.status]),g.useEffect(()=>{(v?.status==="success"||v?.status==="failed")&&(i(null),r(null),c(v.status),p(v.errorMessage||null),b())},[v?.status,v?.errorMessage,b]);const C=()=>{c(null),p(null),$.mutate()},F=L=>{switch(L){case"success":return"success";case"failed":return"error";case"pending":return"pending";default:return""}},N=L=>{try{return new Date(L).toLocaleString()}catch{return L}},M=$.isPending||s!==null,z=a==="success";return e.jsx(wt,{closeModal:n,children:e.jsxs(ve,{style:{maxWidth:"600px"},children:[e.jsx(we,{children:e.jsx("h1",{children:d("Test Email Notifications")})}),e.jsxs("div",{style:{padding:m.xl},children:[e.jsxs(Z3,{children:[e.jsx(X3,{children:d("A test email will be sent to 'inbound@test.formmonitor.com' to confirm that your email delivery and inbound processing are functioning correctly.")}),j?.isSendmail&&e.jsx(fo,{children:d(`Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor's inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.`)}),a!=="success"&&e.jsx(eb,{className:E("btn","submit",(M||z)&&"disabled"),onClick:C,disabled:M||z,children:d(M?"Testing...":z?"Test complete":"Test it now")}),a==="success"&&e.jsx(ib,{children:d("Test email received successfully!")}),a==="failed"&&e.jsxs(ob,{children:[d("Test email failed:")," ",u||d("Unknown error")]}),o&&Date.now()-o>=24e4&&e.jsx(fo,{children:d("Test email is taking longer than expected. Please check again in 10 minutes—the final status will appear in the Test Email History once delivery completes.")})]}),e.jsxs(nb,{children:[e.jsx("h3",{children:d("Test Email History")}),f?e.jsx(Mn,{children:e.jsxs(tl,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("ID")}),e.jsx("th",{children:d("Status")}),e.jsx("th",{children:d("Date & Time")})]})}),e.jsx("tbody",{children:[1,2,3].map(L=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(k,{width:40})}),e.jsx("td",{children:e.jsx(k,{width:80})}),e.jsx("td",{children:e.jsx(k,{width:150})})]},L))})]})}):!x||!x.testEmails||x.testEmails.length===0?e.jsx(tb,{children:d("No test emails sent yet.")}):e.jsxs(tl,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("ID")}),e.jsx("th",{children:d("Status")}),e.jsx("th",{children:d("Date & Time")})]})}),e.jsx("tbody",{children:x.testEmails.map(L=>e.jsxs("tr",{children:[e.jsx("td",{className:"no-break",children:L.id}),e.jsx("td",{children:e.jsx(sb,{className:F(L.status),children:L.status==="success"?d("Success"):L.status==="failed"?d("Failed"):d("Pending")})}),e.jsx("td",{className:"no-break",title:L.createdAt,children:N(L.createdAt)})]},L.id))})]})]})]}),e.jsx($e,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Close")})})]})})},ab=({property:t,errors:n})=>{const{formId:s}=V(),[i,o]=g.useState(!1),{data:r}=Pd(),a=s?Number(s):null,c=!!a,u=r?.isSendmail??!1;return e.jsxs(e.Fragment,{children:[e.jsxs(W,{property:t,errors:n,children:[e.jsx("button",{className:"btn small submit",type:"button",disabled:!c,onClick:()=>{c&&o(!0)},children:d("Test Email Notifications")}),u&&e.jsx(fo,{children:d(`Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor's inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.`)})]}),i&&a&&e.jsx(rb,{formId:a,onClose:()=>o(!1)})]})},nl={isInitialized:t=>t.rules.notifications.initialized,one:t=>X(n=>n.rules.notifications.items,n=>n.find(s=>s.uid===t)),hasRule:t=>X(n=>n.rules.notifications.items,n=>!!n.find(s=>s.uid===t))},lb=({property:t,updateValue:n,value:s,context:i})=>{const o=H(),r=g.useRef([]),{id:a}=P(Pe.current),{data:c,isFetched:u}=Md(a),p=P(nl.isInitialized),x=P(nl.one(s)),{uid:f}=i;return g.useEffect(()=>{if(!r.current.includes(s)&&u&&p){if(s&&c.find(j=>j.uid===s))return;const b=G();r.current.push(b),o(On.add({ruleUid:b,notificationUid:f})),n(b)}},[p,c,u,s,o,f,n]),e.jsxs(W,{property:t,children:[e.jsxs(sn,{children:[e.jsx(wu,{value:x?.send??!0,options:{on:"Send",off:"Don't send"},onChange:b=>o(On.modifySend({ruleUid:x.uid,send:b}))}),d("a notification when"),e.jsx(tn,{value:x?.combinator??Be.Or,onChange:b=>o(On.modifyCombinator({ruleUid:x.uid,combinator:b}))}),d("of the following rules match:")]}),e.jsx(nn,{loading:!x,conditions:x?x.conditions:[],onChange:b=>{o(On.modifyConditions({ruleUid:x.uid,conditions:b}))}})]})},sl={desktop:{sm:1024,md:1440}},il={desktop:{sm:`@media only screen and (min-width: ${sl.desktop.sm}px)`,md:`@media only screen and (min-width: ${sl.desktop.md}px)`}},cb=l.div``,db=l.div`
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
`,ub=l.ul`
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
`,$u=l.div`
  padding: ${m.sm} ${m.md};

  font-size: 14px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`,Cu=l.div`
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
`,ku=l.li`
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

    ${Cu} {
      background-color: #51606c;
    }

    ${bo} {
      &:hover {
        background-color: ${h.gray800};
      }
    }
  }
`,pb=({onCreate:t})=>e.jsx(ku,{className:"dashed",onClick:t,children:e.jsx($u,{children:e.jsxs(hb,{children:[e.jsx("i",{className:"fa-solid fa-plus"}),d("Create New Template")]})})}),hb=l.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,Pi=({address:t})=>(Array.isArray(t)||(t=[t]),e.jsx("div",{children:t.map((n,s)=>e.jsxs("span",{children:[e.jsx(xb,{...n}),s<t.length-1&&e.jsx("span",{children:", "})]},s))})),xb=({address:t,name:n})=>n?e.jsxs("span",{children:[n," <",t,">"]}):e.jsx("span",{children:t}),mb=({attachments:t})=>e.jsx("div",{children:t.map((n,s)=>e.jsxs(gb,{children:[e.jsx("i",{className:`fa-regular fa-file-${bb(n.filename)}`}),e.jsx("span",{children:n.filename}),e.jsx(fb,{children:n.size})]},s))}),gb=l.div`
  display: flex;
  align-items: center;
  gap: 4px;
`,fb=l.span`
  font-weight: 700;
  font-size: 0.8em;
  color: ${h.gray250};
`,bb=t=>{const n=t.split(".").pop()?.toLowerCase();let s;switch(n){case"pdf":s="pdf";break;case"jpg":case"jpeg":case"png":case"gif":case"webp":s="image";break;case"xlsx":s="spreadsheet";break;case"doc":s="doc";break;case"ppt":s="ppt";break;default:s="file";break}return s},jb=({body:t})=>{const n=g.useRef(null);return g.useEffect(()=>{const s=n.current;if(s){const i=s.contentDocument||s.contentWindow?.document;if(i){i.open(),i.write(t),i.close();const o=()=>{if(s?.contentWindow?.document){const r=s.contentWindow.document.body.scrollHeight;s.style.height=`${r}px`,s.contentWindow.document.body.style.overflow="hidden"}};s.onload=o,setTimeout(o,50)}}},[t]),e.jsx(yb,{ref:n,width:"100%",sandbox:"allow-same-origin allow-scripts",title:"Email Preview"})},yb=l.iframe`
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
`,Ge=l.label`
  display: block;

  flex-basis: 120px;

  font-size: 13px;
  font-weight: 700;
  text-align: right;
  color: ${h.gray250};
`,Ye=l.div`
  flex: 1;
  padding: 0 5px 0 15px;

  font-size: 13px;
  color: ${h.gray900};
`,vo=l.div`
  width: 100%;
  padding: ${m.md} ${m.xl};
`,vb=l.input`
  padding: 0 ${m.xs};

  border: 1px solid rgba(96, 125, 159, 0.25);
  border-radius: 3px;

  font-size: 12px;
`,wb=()=>e.jsxs(jo,{children:[e.jsx(yo,{}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("To"),":"]}),e.jsx(Ye,{children:e.jsx(k,{width:200})})]}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("Subject"),":"]}),e.jsx(Ye,{children:e.jsx(k,{width:200})})]}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("From"),":"]}),e.jsx(Ye,{children:e.jsx(k,{width:200})})]}),e.jsx(Ie,{children:e.jsxs(vo,{children:[e.jsx(k,{width:200}),e.jsx(k,{width:300}),e.jsx(k,{width:550}),e.jsx("br",{}),e.jsx(k,{width:500}),e.jsx(k,{width:430}),e.jsx(k,{width:520}),e.jsx("br",{}),e.jsx(k,{width:200}),e.jsx(k,{width:230}),e.jsx(k,{width:220})]})})]}),Su={preview:["notifications","templates","preview"]},$b=t=>B({enabled:!1,queryKey:Su.preview,queryFn:async()=>(await T.post("/api/templates/preview",t)).data}),Cb=()=>ce({mutationFn:async t=>await T.post("/api/templates/send-test",t)}),Lu=t=>{const{inView:n}=t,{data:s,isFetching:i,refetch:o,error:r}=$b(t.context),a=Cb(),[c,u]=g.useState();return g.useEffect(()=>{n&&o()},[n,o]),g.useEffect(()=>{if(c===void 0&&s?.from){const p=Array.isArray(s.from)?s.from[0]:s.from;u(p.address)}},[s,c]),e.jsxs(Te,{...t,extraContent:e.jsxs("div",{style:{display:"flex",gap:m.sm},children:[e.jsx("button",{className:E("btn","small","submit",i&&"disabled"),disabled:i,type:"button",onClick:()=>o(),children:d("Refresh")}),e.jsx(vb,{className:"small",type:"text",placeholder:d("john@doe.com"),value:c||"",onChange:p=>u(p.target.value),autoComplete:"off",autoCorrect:"off",spellCheck:!1,inputMode:"email","data-lpignore":"true","data-1p-ignore":!0}),e.jsx("button",{className:E("btn","small",a.isPending&&"disabled",!c&&"disabled"),disabled:a.isPending||!c,type:"button",onClick:()=>a.mutate({...t.context,targetEmail:c||""}),children:d("Send Test Email")})]}),children:[i&&e.jsx(wb,{}),!!r&&e.jsxs(jo,{children:[e.jsx(yo,{}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("Error"),":"]}),e.jsx(Ye,{children:e.jsx("b",{children:r.message})})]}),e.jsx(Ie,{children:e.jsx(vo,{children:r.errors.template.preview})})]}),s!==void 0&&!r&&!i&&e.jsxs(jo,{children:[e.jsx(yo,{}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("From"),":"]}),e.jsx(Ye,{children:e.jsx(Pi,{address:s.from})})]}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("Subject"),":"]}),e.jsx(Ye,{children:s.subject})]}),e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("To"),":"]}),e.jsx(Ye,{children:s.to})]}),!!s.cc.length&&e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("CC"),":"]}),e.jsx(Ye,{children:e.jsx(Pi,{address:s.cc})})]}),!!s.bcc.length&&e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("BCC"),":"]}),e.jsx(Ye,{children:e.jsx(Pi,{address:s.bcc})})]}),!!s.attachments.length&&e.jsxs(Ie,{children:[e.jsxs(Ge,{children:[d("Attachments"),":"]}),e.jsx(Ye,{children:e.jsx(mb,{attachments:s.attachments})})]}),e.jsx(Ie,{children:e.jsx(vo,{children:e.jsx(jb,{body:s.htmlBody})})})]})]})},br={all:["notification-templates"],one:t=>[...br.all,t]},kb=t=>B({queryKey:br.one(t),queryFn:()=>T.get(`/api/notifications/templates/${t||"get-default-metadata"}`).then(n=>n.data),staleTime:1/0,gcTime:1/0}),Sb=t=>ce({mutationFn:n=>T.post("/api/notifications/templates",{formId:t,...n}).then(s=>s.data)}),Lb=l(ve)`
  display: grid;
  grid-template-rows: min-content min-content 70vh min-content;

  max-width: 70vw;
  min-width: 600px;
`,Fb=l.div`
  padding: 1rem 2rem;

  overflow-y: auto;
  ${Q};
`,Eb=l.ul`
  display: flex;

  padding: 0 9px;

  border-bottom: 1px solid ${h.hairline};
  box-shadow: 0 1px 5px #cdd8e440;

  list-style: none;
`,Tb=l.li`
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
`,Nb=l.div`
  display: none;

  &.active {
    display: block;
  }
`,zb=l.div`
  display: flex;
  gap: 1rem;

  > div {
    flex: 1 0;
    padding: 0.5rem 0;
  }
`,Vs=t=>(t=Oo(t),t.replace(/[^a-zA-Z0-9\-_]/g,"")),Fu=(t,{target:n,camelize:s=!1,transliterate:i=!1,bypassConditions:o},r,a)=>{if(o!==void 0){for(const u of o)if(!!r?.[u.name]===u.isTrue)return t}const c=Jo(t,{transliterate:i,camelize:s});return a?.(n,c),t},Mb=(t,{pattern:n,replacement:s="",modifier:i="g"})=>{const o=new RegExp(n,i);return t.replace(o,s)},Ib=Object.freeze(Object.defineProperty({__proto__:null,handle:Vs,injectInto:Fu,regex:Mb},Symbol.toStringTag,{value:"Module"})),Ab=t=>{const{value:n,onChange:s}=t;return e.jsx(Te,{...t,children:e.jsx(pr,{criteria:{kind:[]},multiSelect:!0,onUpdate:s,value:n})})},Rb=t=>{const{value:n,label:s,handle:i,instructions:o,onChange:r}=t;return e.jsx(Te,{...t,label:void 0,instructions:void 0,children:e.jsxs(si,{children:[e.jsx(iu,{children:e.jsx(en,{enabled:n,onClick:a=>r(a)})}),e.jsxs(y4,{onClick:()=>r(!n),children:[e.jsx("label",{htmlFor:i,children:d(s)}),e.jsx(cs,{instructions:o})]})]})})},Pb=t=>{const{optionDefinition:n,handle:s,value:i,onChange:o}=t,[r,a]=g.useState(!1),[c,u]=g.useState([]);return g.useEffect(()=>{typeof n=="function"?(a(!0),n().then(p=>{u(p)}).finally(()=>a(!1))):u(n||[])},[n]),e.jsxs(Te,{...t,children:[e.jsx(xr,{value:i,options:c,selectAll:c.length>0,onUpdate:o,uniqueId:s,emptyMessage:d("No PDF templates were found")}),!r&&c.length===0&&e.jsxs(e.Fragment,{children:[e.jsx(lu,{}),e.jsx(cs,{instructions:d("No PDF templates were found")})]})]})},Db=t=>{const{optionDefinition:n,emptyOption:s,value:i,onChange:o}=t,[r,a]=g.useState(!1),[c,u]=g.useState([]);return g.useEffect(()=>{typeof n=="function"?(a(!0),n().then(p=>{u(p)}).finally(()=>a(!1))):u(n||[])},[n]),e.jsx(Te,{...t,children:e.jsx(de,{options:c,emptyOption:s,value:i,onChange:p=>o(p),loading:r})})},Bb=l.div`
  //
`,Ob=l.label`
  display: block;

  padding: 0 ${m.md};

  ${_e};
  font-size: 11px;
`,_b=l.a`
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
`,Wb=({item:t,onClick:n})=>{const s=g.useRef(null);return g.useEffect(()=>{t.active&&s.current&&s.current.scrollIntoView({behavior:"smooth",block:"nearest"})},[t]),e.jsx(_b,{ref:s,className:E(t?.active&&"active"),onClick:()=>n?.(t),dangerouslySetInnerHTML:{__html:O.sanitize(t.shortName)}})},Ub=({category:t,onClick:n})=>e.jsxs(Bb,{children:[e.jsx(Ob,{children:t.name}),e.jsx("div",{children:t.items.map(s=>e.jsx(Wb,{item:s,onClick:n},s.token))})]}),Hb=({backend:t,index:n,filter:s,setIndex:i,setFilter:o,itemCountRef:r,suggestions:a,close:c})=>{g.useEffect(()=>{const u=p=>{switch(p.key){case"Escape":p.preventDefault(),c();break;case"ArrowRight":case"ArrowLeft":p.preventDefault(),c();break;case"ArrowDown":p.preventDefault(),i(x=>x>=(r.current??0)-1?(r.current??0)-1:x<(r.current??0)?x+1:r.current-1);break;case"ArrowUp":p.preventDefault(),n>0&&i(x=>x>r.current-1?r.current-1:x>0?x-1:0);break;case"Enter":if(p.preventDefault(),p.stopPropagation(),p.stopImmediatePropagation(),n>-1){const x=a.flatMap(f=>f.items).find(f=>f.active);x&&t.insert(x,s)}return o(""),c(),!1;default:p.key.length===1&&o(x=>x+p.key);break}};return t.handlers.on.down(u,!0),()=>{t.handlers.off.down(u)}},[n,c,t,a,s,o,i,r])},qb=({backend:t,setFilter:n,close:s})=>{g.useEffect(()=>{if(t.extrnalTrigger)return;const i=o=>{const r=t.getRange(),a=r.startContainer,c=r.startOffset;if(a.nodeType===3){const u=a.textContent;let p="",x=!1;for(let f=c-1;f>=0;f--)if(u[f]==="@"){x=!0,p=u.substring(f+1,c);break}!x||o.key==="Escape"?(s(),n("")):n(p)}else s()};return t.handlers.on.up(i,!0),()=>{t.handlers.off.up(i)}},[s,t,n])};let Ls;const Qb=t=>{const n=[];return t.getState().layout.fields.forEach(s=>{n.push({shortName:s.properties.label,name:s.properties.label,token:`fieldUids['${s.uid}']`})}),n},Kb=t=>{const{store:n}=t,[s,i]=g.useState([]);return g.useEffect(()=>{Ls?i([...Ls,{name:"Fields",items:Qb(n)}]):T.get("/api/templates/notifications/suggestions").then(o=>{Ls=o.data,i(Ls)})},[n]),s},Vb=(t,n)=>{const s=Kb(t),[i,o]=g.useState([]),[r,a]=g.useState("");return g.useEffect(()=>{let c=0;const u=s.map(p=>({...p,items:p.items.filter(x=>x.name.toLowerCase().includes(r.toLowerCase())).map(x=>({...x,active:n===c++}))})).filter(p=>p.items.length>0);o(u)},[s,r,n]),{suggestions:i,filter:r,setFilter:a}},Gb=(t,n)=>{const s=t.getRect(),{getRange:i}=t,o=i();let r;o.startContainer.nodeType===Node.ELEMENT_NODE?r=o.startContainer:r=o;const a=r.getBoundingClientRect();let c=window.scrollX,u=window.scrollY;s&&(c+=s.left,u+=s.top);const p=c+a.left+15,x=u+a.top+20;return n.current&&(n.current.style.left=`${p}px`,n.current.style.top=`${x}px`),{left:p,top:x}},Yb=l.div`
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
`,Jb=l.h3`
  background: ${h.gray100};

  padding: 8px 8px;
  margin: 0;

  ${_e};
  color: ${h.gray600};
  font-size: 11px;
`,Zb=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  padding: ${m.xs} 0;

  overflow-y: auto;
  ${Q};
`,Xb=({backend:t,close:n})=>{const s=g.useRef(null),i=g.useRef(0),[o,r]=g.useState(0),{suggestions:a,filter:c,setFilter:u}=Vb(t,o);Gb(t,s),g.useEffect(()=>{i.current=a.reduce((x,f)=>x+f.items.length,0)},[a]),$t({isEnabled:!0,callback:n,refObject:s}),qb({backend:t,setFilter:u,close:n}),Hb({backend:t,index:o,filter:c,setIndex:r,setFilter:u,itemCountRef:i,suggestions:a,close:n});const p=g.useCallback(x=>{t.insert(x,c),u(""),n()},[c,t.insert,n,u]);return e.jsxs(Yb,{ref:s,children:[e.jsx(Jb,{children:d("Freeform Template Tokens")}),e.jsx(Zb,{children:a.map(x=>e.jsx(Ub,{category:x,onClick:p},x.name))})]})},e6=t=>{const n=document.createElement("div");n.className="freeform-tokens-dropdown",document.body.appendChild(n);const s=hc.createRoot(n),i=()=>{s.unmount(),document.body.contains(n)&&document.body.removeChild(n)};return s.render(e.jsx(Xb,{backend:t,close:i})),{close:i}};let Os;const wo=t=>{jr(),Os=e6(t)},jr=()=>{Os&&(Os.close(),Os=void 0)},t6=t=>{t.PluginManager.add("freeform-tokens",n=>{const s={store:n.getParam("store"),getRect:()=>n.getContentAreaContainer().getBoundingClientRect(),getRange:()=>n.selection.getRng(),insert:(i,o)=>{const r=n.selection.getRng(),a=Math.max(0,r.startOffset-(o.length+1));r.setStart(r.startContainer,a),n.selection.setRng(r),n.execCommand("Delete"),n.insertContent(`<span contenteditable="false" data-freeform-token="${i.token}">${i.name}</span>`)},handlers:{on:{down:(i,o=!1)=>{n.on("keydown",i,o)},up:(i,o=!1)=>{n.on("keyup",i,o)}},off:{down:i=>{n.off("keydown",i)},up:i=>{n.off("keyup",i)}}}};n.on("keydown",i=>{i.key==="@"&&setTimeout(()=>{wo(s)},0)}),n.on("remove",()=>{jr()})})};t6(H1);const n6=t=>{const{value:n,onChange:s}=t,i=Vo(),o=ee(),{templates:{toolbar:r},metadata:{tinymce:{stylesPath:a}}}=I;return e.jsx(Te,{...t,children:e.jsx(xc,{init:{branding:!1,menubar:!1,statusbar:!0,promotion:!1,content_css:a,store:i,queryClient:o},value:n,onEditorChange:s,plugins:s6,toolbar:r,licenseKey:"gpl"})})},s6=["autolink","code","codesample","image","link","lists","media","searchreplace","table","freeform-tokens"],Di=t=>{const{value:n,multiline:s,onChange:i}=t;return e.jsx(Te,{...t,children:s?e.jsx("textarea",{rows:2,className:"text fullwidth",value:n,onChange:o=>i(o.target.value)}):e.jsx("input",{type:"text",className:"text fullwidth",value:n,onChange:o=>i(o.target.value)})})},i6=l.div`
  position: relative;
`,o6=l.div`
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
`,r6=l.button`
  position: absolute;
  top: 0;
  right: 0;

  margin: 4px;
  padding: 0 8px;

  height: 26px;
  min-height: 26px;
`,Lt=t=>{const n=Vo(),s=g.useRef(null),i=g.useRef(null),o=g.useRef(null),{value:r,onChange:a}=t,c=g.useCallback(j=>O.sanitize(j,{ADD_ATTR:["contenteditable","data-freeform-token"]}),[]),u=g.useMemo(()=>({getRange:()=>window.getSelection()?.getRangeAt(0)||document.createRange(),getRect:()=>null,insert:j=>{const y=window.getSelection();if(!y||y.rangeCount===0)return;const w=o.current||y.getRangeAt(0);if(w.startContainer.nodeType!==Node.TEXT_NODE)return;const v=w.startContainer,$=w.startOffset,C=v.textContent??"";let F=-1;for(let L=$-1;L>=0;L--)if(C[L]==="@"){F=L;break}if(F===-1)return;const N=document.createRange();N.setStart(v,F),N.setEnd(v,$);const M=document.createElement("span");M.contentEditable="false",M.dataset.freeformToken=j.token,M.innerHTML=c(j.name),N.deleteContents(),N.insertNode(M);const z=document.createRange();z.setStartAfter(M),z.collapse(!0),y.removeAllRanges(),y.addRange(z),a(c(s.current?.innerHTML??""))},store:n,handlers:{on:{down:j=>{s.current?.addEventListener("keydown",j)},up:j=>{s.current?.addEventListener("keyup",j)}},off:{down:j=>{s.current?.removeEventListener("keydown",j)},up:j=>{s.current?.removeEventListener("keyup",j)}}}}),[n,a,c]),p={extrnalTrigger:!0,getRange:()=>{if(!o.current){const j=document.createRange();return j.selectNode(i.current),j}return o.current},getRect:()=>null,insert:j=>{const y=document.createElement("span");y.contentEditable="false",y.dataset.freeformToken=j.token,y.innerHTML=c(j.name);const w=o.current;if(!w){s.current?.appendChild(y),a(c(s.current.innerHTML));return}if(w.startContainer.nodeType!==Node.TEXT_NODE&&w.startContainer.nodeType!==Node.ELEMENT_NODE)return;const v=w.startContainer,$=w.startOffset,C=document.createRange();C.setStart(v,$),C.setEnd(v,$),C.deleteContents(),C.insertNode(y);const F=document.createRange();F.setStartAfter(y),F.collapse(!0);const N=window.getSelection();N.removeAllRanges(),N.addRange(F),a(c(s.current?.innerHTML??""))},store:n,handlers:{on:{down:j=>{document?.addEventListener("keydown",j)},up:j=>{document.addEventListener("keyup",j)}},off:{down:j=>{document.removeEventListener("keydown",j)},up:j=>{document.removeEventListener("keyup",j)}}}},x=g.useCallback(()=>{const j=window.getSelection();j&&j.rangeCount>0&&(o.current=j.getRangeAt(0).cloneRange())},[]),f=g.useCallback(()=>{const j=window.getSelection();j&&o.current&&(j.removeAllRanges(),j.addRange(o.current))},[]);g.useEffect(()=>()=>{jr()},[]),g.useEffect(()=>{s.current&&s.current.innerHTML!==r&&(s.current.innerHTML=c(r))},[r,c]);const b=g.useCallback(j=>{(j.nativeEvent.data||"")==="@"&&wo(u),s.current&&a(c(s.current.innerHTML))},[u,a,c]);return e.jsx(Te,{...t,children:e.jsxs(i6,{children:[e.jsx(o6,{className:"text fullwidth",ref:s,contentEditable:!0,onInput:b,onBlur:x,onKeyUp:x,onMouseUp:x,suppressContentEditableWarning:!0}),e.jsx(r6,{ref:i,className:"btn",onClick:()=>{f(),wo(p)},children:e.jsx("i",{className:"fa-solid fa-plus"})})]})})},$o=[{name:d("Content"),rows:[[{type:Di,label:"Template Name",handle:"name",required:!0,instructions:"What this notification template will be called in the CP.",updateState:(t,n)=>({...n,handle:Vs(Bo(Oo(t)))})}],[{type:Lt,label:"Subject",handle:"subject",required:!0,instructions:"The subject line for the email notification."}],[{type:n6,label:"Message Body",handle:"body",instructions:"The content of the email notification. Use the `@` symbol to generate a list of tokens you can use. Twig is also allowed."}]]},{name:d("Configuration"),rows:[[{type:Lt,label:"From Name",handle:"fromName",required:!0,instructions:"The name that the email will appear from in your email notification."},{type:Lt,label:"Reply-To Name",handle:"replyToName",instructions:"The reply-to name that the email will appear from in your email notification."}],[{type:Lt,label:"From Email",handle:"fromEmail",required:!0,instructions:"The email address that the email will appear from in your email notification."},{type:Lt,label:"Reply-To Email",handle:"replyToEmail",instructions:"The reply-to email address for your email notification. Leave blank to use 'From Email' address."}],[{type:Lt,label:"CC",handle:"cc",instructions:"The email address(es) you would like to be CC'd in the email notification. Separate multiples with commas. Leave blank to not use."},{type:Lt,label:"BCC",handle:"bcc",instructions:"The email address(es) you would like to be BCC'd in the email notification. Separate multiples with commas. Leave blank to not use."}]]},{name:d("Advanced"),rows:[[{type:Di,label:"Handle",handle:"handle",instructions:"Unique identifier for this template.",required:!0,onChange:t=>Vs(t)}],[{type:Di,label:"Description",handle:"description",instructions:"Description of this notification.",multiline:!0}],[{type:Rb,label:"Include Attachments",handle:"includeAttachments",instructions:"Include uploaded files as attachments in email notification."}],[{type:Ab,label:"Predefined Assets",handle:"presetAssets",minEdition:re.Pro,instructions:"Select any Assets you wish to include as attachments on all email notifications using this template."}]]},{name:d("Templates"),rows:[[{type:Db,label:"Template Wrapper",handle:"wrapperId",instructions:"The template wrapper for the email notification. This is the HTML that wraps around the body of the email.",emptyOption:"No Wrapper",optionDefinition:async()=>(await T.get("/api/templates/wrappers")).data.map(n=>({label:n.name,value:String(n.id)}))}],[{type:Pb,label:"PDF Templates",handle:"pdfTemplateIds",minEdition:re.Pro,instructions:"Select any PDF templates to use for this notification.",optionDefinition:async()=>(await T.get("/api/templates/pdf")).data.map(n=>({label:n.name,value:n.id}))}]]},{name:d("Preview"),rows:[[{type:Lu,label:"Preview",handle:"preview",instructions:"This will give you a rough idea of how your notification will look to the recipient."}]]}],a6=$o[0].name,l6=({data:t,closeModal:n})=>{const{formId:s}=V(),i=t?.id,o=ee(),{data:r,isLoading:a}=kb(i),c=Sb(s&&Number(s)),[u,p]=g.useState(a6),[x,f]=g.useState(),[b,j]=g.useState({});g.useEffect(()=>()=>{f(void 0),j({}),o.removeQueries({queryKey:Su.preview})},[o.removeQueries]);const y=async()=>{await c.mutate(x,{onSuccess:w=>{f(v=>({...v,id:w.id})),o.invalidateQueries({queryKey:br.one(i)}),o.invalidateQueries({queryKey:ke.templates()}),o.invalidateQueries({queryKey:ke.formTemplates(Number(s))}),n(),typeof t?.onSuccess=="function"&&t.onSuccess(w.id)},onError:w=>{j(w.errors.notification)}})};return g.useEffect(()=>{r&&f(r)},[r]),e.jsxs(Lb,{children:[e.jsx(we,{children:e.jsx("h1",{children:e.jsx(Z,{loadingText:d("Loading..."),loading:a,spinner:!0,children:r?.name||"New Template"})})}),e.jsx(Eb,{children:$o.map(w=>e.jsx(Tb,{className:E(w.name===u&&"active",a0(b,w.rows.flatMap(v=>v.map($=>$.handle)))&&"errors"),onClick:()=>p(w.name),children:e.jsx("span",{children:w.name})},w.name))}),e.jsx(Fb,{children:!a&&r!==void 0&&$o.map(w=>e.jsx(Nb,{className:E(w.name===u&&"active"),children:w.rows.map((v,$)=>e.jsx(zb,{children:v.map(C=>{if("minEdition"in C&&C.minEdition&&!I.editions.isAtLeast(C.minEdition))return null;let F;return C.type===Lu&&(F={...x,formId:s?Number(s):void 0}),e.jsx(C.type,{...C,context:F,inView:w.name===u,value:x?.[C.handle]||"",errors:b?.[C.handle],onChange:N=>{"onChange"in C&&C.onChange&&(N=C.onChange(N)),f(M=>({...M,[C.handle]:N})),"updateState"in C&&C.updateState&&f(M=>C.updateState(N,M))}},C.handle)})},$))},w.name))}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:y,children:e.jsx(Z,{loadingText:d("Saving"),loading:c.isPending,spinner:!0,children:d("Save")})})]})]})},yr=()=>{const{openModal:t}=Ke();return(n={})=>{t(l6,{...n},{allowEscape:!1,requireConfirmation:!0,confirmationMessage:"Are you sure you want to close? Any unsaved changes will be lost."})}},c6=({active:t,openEditOnClick:n,template:s,onClick:i})=>{const{id:o,name:r}=s,a=ee(),c=yr();return e.jsxs(ku,{className:E(t?"active":""),onClick:()=>{n?c({id:o}):i(s)},children:[e.jsx($u,{title:r,children:r}),!!s.formId&&e.jsxs(Cu,{children:[e.jsx(bo,{title:d("Edit"),onClick:u=>(u.preventDefault(),u.stopPropagation(),c({id:o}),!1),children:e.jsx("i",{className:"fa-solid fa-pencil"})}),e.jsx(bo,{title:d("Delete"),onClick:u=>(u.preventDefault(),u.stopPropagation(),confirm(d("Are you sure you want to delete this template?"))&&T.post("/api/templates/notifications/delete",{id:o}).then(()=>{a.invalidateQueries({queryKey:ke.templates()}),a.invalidateQueries({queryKey:ke.formTemplates(s.formId)})}).catch(p=>{const x=Object.values(p.errors).join(", ");Xe.error(x)}),!1),children:e.jsx("i",{className:"fa-solid fa-xmark"})})]})]})},Co=({value:t,title:n,templates:s,canCreate:i,openEditOnClick:o,onClick:r,onCreate:a})=>{const c=g.useRef(null),[u,p]=g.useState(!1);return g.useEffect(()=>{const x=c.current;x&&p(x.scrollHeight>x.clientHeight)},[]),s===void 0||!s?.length&&!i?null:e.jsxs(cb,{children:[e.jsx(db,{children:e.jsx("span",{children:n})}),e.jsxs(ub,{ref:c,className:E(u&&"has-scroll"),children:[s.map(x=>e.jsx(c6,{openEditOnClick:o,active:t===x.id,template:x,onClick:r},x.id)),i&&e.jsx(pb,{onCreate:a})]})]})},vr=t=>{const{formId:n}=V(),{data:s,isFetching:i}=qh(),{data:o,isFetching:r}=Qh(Number(n)),[a,c]=g.useState([]),[u,p]=g.useState(),[x,f]=g.useState({global:[]});return g.useEffect(()=>{s&&!i&&f(b=>({...b,global:s.templates}))},[s,i]),g.useEffect(()=>{o&&!r&&f(b=>({...b,form:o}))},[o,r]),g.useEffect(()=>{let b=x?.global?.find(j=>j.id===t);b||(b=x?.form?.find(j=>j.id===t)),p(b)},[t,x]),g.useEffect(()=>{const b=[];x.form&&b.push({label:"Form",icon:e.jsx("i",{className:"fa-solid fa-file"}),children:x.form.map(j=>({label:j.name,value:String(j.id)}))}),x.global&&b.push({label:"Global",icon:e.jsx("i",{className:"fa-solid fa-earth-americas"}),children:x.global.map(j=>({label:j.name,value:String(j.id)}))}),c(b)},[x]),{templates:x,options:a,isFetching:i,selectedTemplate:u}},Eu=l(_.div)`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: 0;
`,d6=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{size:r}=ir(),{templates:a,options:c,isFetching:u}=vr(t),p=yr(),{templates:{canCreate:x,method:f}}=I;if(u&&!a)return e.jsx(W,{property:n,errors:s,children:"loading"});const b=y=>{i(y.id)},j=()=>{p({type:"form",onSuccess:y=>{i(y)}})};return e.jsxs(W,{property:n,errors:s,context:o,children:[r==="small"&&e.jsx(de,{emptyOption:"Select a template",loading:u,options:c,onChange:y=>i(y),value:String(t||"")}),r==="normal"&&e.jsxs(Eu,{children:[e.jsx(Co,{value:t,title:d("Form Templates"),templates:a.form,onClick:b,canCreate:x&&f!==is.Global,onCreate:j}),e.jsx(Co,{value:t,title:d("Global Templates"),templates:a.global,onClick:b})]})]})},u6=l.div`
  display: grid;
  align-items: center;
  gap: ${m.md};

  grid-template-columns: 1.5fr 1fr 1.5fr 20px;
`,p6=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75"}),e.jsx("path",{d:"m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2"})]}),ol=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"})}),rl=(t,n)=>n!==void 0?[...t.slice(0,n+1),{email:"",name:""},...t.slice(n+1)]:[...t||[],{email:"",name:""}],al=(t,n)=>t.filter((s,i)=>i!==n),h6=(t,n,s)=>{const i=[...s];return i[t]=n,i},x6=l.ul``,ll=l.div`
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
`,Tu=l.button`
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
    ${Tu} {
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
`,wr=oe.memo(({value:t,onChange:n})=>{const{activeCell:s,setActiveCell:i,setCellRef:o,keyPressHandler:r}=zn(t.length,1),a=()=>{i(t.length,0),n(rl(t))};return e.jsxs(e.Fragment,{children:[e.jsxs(x6,{children:[!t.length&&e.jsxs(dl,{children:[e.jsx(ll,{children:e.jsx(ol,{})}),e.jsx(cl,{type:"text",className:E("text","fullwidth","code"),placeholder:"john.doe@example.com",onClick:()=>a(),onFocus:()=>a()})]}),t?.map((c,u)=>e.jsxs(dl,{children:[e.jsx(ll,{children:e.jsx(ol,{})}),e.jsx(cl,{type:"text","data-1p-ignore":!0,className:E("text","fullwidth","code"),autoFocus:s===`${u}:0`,ref:p=>o(p,u,0),onFocus:()=>i(u,0),placeholder:"john.doe@example.com",value:c.email,onKeyDown:r({onEnter:({shiftKey:p})=>{const x=p?u+1:t.length;i(x,0),n(rl(t,p?u:void 0))},onDelete:()=>{n(al(t,u)),i(u-1,0)}}),onChange:p=>n(h6(u,{...c,email:p.target.value},t))}),e.jsx(Tu,{tabIndex:-1,onClick:()=>{n(al(t,u)),i(Math.max(u-1,0),0)},children:e.jsx(p6,{})})]},u))]}),t.length>0&&e.jsx(ms,{label:"Add a recipient",onClick:a})]})});wr.displayName="RecipientsController";const m6=l.div`
  flex: 2;

  &.multiple {
    grid-column: span 2;
  }
`,g6=({recipients:t,spanMultiple:n,onChange:s})=>e.jsx(m6,{className:E(n&&"multiple"),children:e.jsx(wr,{value:t,onChange:s})}),ul=l.div`
  flex: 1 1 0;
`,f6=({id:t,onChange:n})=>{const{templates:s,isFetching:i,selectedTemplate:o}=vr(t);if(i)return e.jsx(ul,{children:"loading..."});const r=[];return s?.form&&r.push({label:"Form",icon:e.jsx("i",{className:"fa-regular fa-clipboard-list-check"}),children:s.form.map(a=>({label:a.name,value:a.id}))}),s?.global&&r.push({label:"Global",icon:e.jsx("i",{className:"fa-solid fa-earth-americas"}),children:s.global.map(a=>({label:a.name,value:a.id}))}),e.jsx(ul,{children:e.jsx(de,{value:o?.id,options:r,emptyOption:"Use default template",onChange:a=>{/^[0-9]+$/.test(a)&&n(Number(a)),n(a)}})})},b6=l.div`
  flex-basis: 20%;
`,j6=l.input`
  &.disabled {
    background: #dfe5ec;
    color: ${h.black};
    opacity: 0.55;
  }
`,y6=({predefined:t,value:n,onChange:s})=>e.jsx(b6,{children:e.jsx(j6,{className:E("text","fullwidth",t&&"disabled"),readOnly:t,disabled:t,type:"text",value:n,onChange:i=>s(i.target.value)})}),Nu=({predefined:t,mapping:n,removable:s,onChange:i,onRemove:o})=>{const{value:r,template:a,recipients:c}=n;return e.jsxs(u6,{children:[e.jsx(y6,{predefined:t,value:r,onChange:u=>i({...n,value:u})}),e.jsx(f6,{id:a,onChange:u=>i({...n,template:u})}),e.jsx(g6,{recipients:c,spanMultiple:!s,onChange:u=>{i({...n,recipients:u})}}),s&&e.jsx(ju,{children:e.jsx(dt,{onClick:o})})]})},v6=({option:t,mapping:n,allMappings:s,updateValue:i})=>{const o=!!n,r=n||{value:t.value,recipients:[],template:""},a=c=>{let u;o&&(u=s.findIndex(p=>p.value===c.value)),i(u!==void 0?[...s.slice(0,u),c,...s.slice(u+1)]:[...s||[],c])};return e.jsx(Nu,{predefined:!0,mapping:r,onChange:a})},w6=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
`,$6=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const r=o.field,a=P(Ae.one(r)),c=Me(a?.typeClass),[u]=oi(a,c),p=x=>t?.find(f=>f.value===x);return e.jsx(W,{property:n,errors:s,context:o,children:e.jsxs(w6,{children:[!!u&&u.filter(x=>"value"in x).map((x,f)=>e.jsx(v6,{option:x,mapping:p(x.value),allMappings:t,updateValue:i},f)),!!t&&t.map((x,f)=>u.find(b=>b?.value===x.value)?null:e.jsx(Nu,{mapping:x,removable:!0,onRemove:()=>{i([...t.slice(0,f),...t.slice(f+1)])},onChange:b=>{i([...t.slice(0,f),b,...t.slice(f+1)])}},f))]})})},C6=({value:t=[],property:n,errors:s,updateValue:i,context:o})=>e.jsxs(W,{property:n,errors:s,context:o,children:[e.jsx(wr,{value:t,onChange:i}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Press <b>enter</b> while focusing an input to add a new set of inputs."))}})})]}),k6=l.label`
  display: flex;
  justify-content: start;

  ${si} {
    margin-bottom: 2px;
  }
`,S6=({value:t,property:n,updateValue:s})=>e.jsxs(ls,{$width:n.width,children:[e.jsx(k6,{children:e.jsxs(si,{children:[n.togglable&&e.jsx(en,{enabled:t.enabled,onClick:i=>s({...t,enabled:i})}),e.jsx(En,{children:d(n.label)})]})}),(!n.togglable||t.enabled)&&e.jsx(sr,{children:e.jsx("input",{type:"text",className:E("text","fullwidth"),placeholder:d("Label"),value:t.label??"",onChange:i=>s({...t,label:i.target.value})})})]}),L6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"})}),F6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M48 96V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V170.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H309.5c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8V184c0 13.3-10.7 24-24 24H104c-13.3 0-24-10.7-24-24V80H64c-8.8 0-16 7.2-16 16zm80-16v80H272V80H128zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"})}),E6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"})}),T6=l.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${m.sm};

  margin-top: ${m.sm};
`,N6=l.div`
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
`,z6=l.li`
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
`,M6={save:e.jsx(F6,{}),back:e.jsx(L6,{}),submit:e.jsx(E6,{})},I6=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{layouts:r}=n,a=o.order,c={save:o?.buttons?.save,back:o?.buttons?.back,submit:!0},u=[],p=r.map(x=>{const f=x.split(" ").map(b=>b.split("|").filter(j=>c.back||j!=="back").filter(j=>c.save||j!=="save").filter(j=>a!==0||j!=="back").filter(Boolean));return u.some(b=>Ds(b,f))?null:(u.push(f),{layout:x,groups:f})}).filter(Boolean);return e.jsx(W,{property:n,errors:s,children:e.jsx(T6,{children:p.map((x,f)=>e.jsx(z6,{onClick:()=>i(x.layout),className:E(t===x.layout&&"active"),children:x.groups.map((b,j)=>e.jsx(N6,{children:b.map((y,w)=>e.jsx(ko,{className:E(y,c?.[y]&&"enabled"),children:M6[y]},w))},j))},f))})})},A6=t=>{switch(t){case Re.Elements:return{source:Re.Elements,typeClass:"",properties:{}};case Re.Predefined:return{source:Re.Predefined,typeClass:"",properties:{}};default:return{source:Re.Custom,useCustomValues:!1,options:[]}}};class $r extends oe.Component{constructor(n){super(n),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(n,s){console.error(n,s)}render(){return this.state.hasError?e.jsx("div",{children:this.props.message}):this.props.children}}l.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  width: 100%;
`;const R6=l.button`
  display: block;
  flex: 1;

  padding: ${m.xs} ${m.md};

  background-color: ${h.gray100};
  box-shadow: ${ae.right};
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
`,hn=l.div`
  display: flex;
  justify-content: ${t=>t.$justifyContent||"flex-start"};
  align-items: ${t=>t.$alignItems||"stretch"};
  gap: ${t=>t.$gap||m.sm};
`,zu=({value:t,updateValue:n,property:s,typeProviderQuery:i,convertToCustomValues:o})=>{const[r,a]=g.useState(t.typeClass),{data:c,isFetching:u}=i(),p=c?.find(x=>x.typeClass===r);return e.jsxs(ys,{children:[s.showEmptyOption&&e.jsx(je,{property:{type:K.String,label:"Empty Option Label (optional)",handle:"emptyOption"},context:t,value:t.emptyOption,updateValue:x=>{n({...t,emptyOption:x})}}),e.jsx(W,{property:{type:K.Select,label:"Type",handle:"predefinedOptionTypeClass",options:[]},children:e.jsx(de,{emptyOption:"Choose type",loading:u,value:t.typeClass,onChange:x=>{const f={},b=c?.find(j=>j.typeClass===x);b&&b.properties.forEach(j=>{f[j.handle]=j.value}),a(x),n({...t,typeClass:x,properties:f})},options:c?.map(x=>({label:x.name,value:x.typeClass}))})}),p?.properties.map(x=>{let f="";return t?.properties?.[x.handle]!==void 0?f=t.properties[x.handle]:x.value!==void 0&&(f=x.value),e.jsx(je,{property:x,context:t,value:f,updateValue:b=>{n({...t,properties:{...t.properties,[x.handle]:b}})}},x.handle)}),r&&I.limitations.can("layout.options.convert")&&e.jsx(ls,{className:"spacing-small",children:e.jsx(R6,{className:"btn small",onClick:()=>{confirm(d("Are you sure? This will allow you to customize and reorder the options, but they will become out of sync with the Element or Predefined options currently configured."))&&o()},children:d("Convert to Custom Values")})})]})},Mu=()=>B({queryKey:["option-types","elements"],queryFn:()=>T.get("/api/types/options/elements").then(t=>t.data),staleTime:1/0}),P6=({value:t,updateValue:n,property:s,convertToCustomValues:i})=>e.jsx(zu,{value:t,updateValue:n,property:s,defaultValue:"",updateDefaultValue:()=>{},typeProviderQuery:Mu,convertToCustomValues:i}),D6=()=>B({queryKey:["option-types","predefined"],queryFn:()=>T.get("/api/types/options/predefined").then(t=>t.data),staleTime:1/0}),B6=({value:t,updateValue:n,property:s,convertToCustomValues:i})=>e.jsx(zu,{value:t,updateValue:n,property:s,defaultValue:"",updateDefaultValue:()=>{},typeProviderQuery:D6,convertToCustomValues:i});var te=(t=>(t.FieldType="field-type",t.FavoriteField="favorite-field",t.Field="field",t.Row="row",t.OptionRow="option-row",t.Page="page",t))(te||{});const O6=t=>{const[{isDragging:n},s,i]=qo(()=>({type:te.OptionRow,item:()=>({index:t}),collect:o=>({isDragging:o.isDragging()})}),[t]);return{isDragging:n,drag:s,preview:i}},_6=(t,n,s)=>{const[{handlerId:i},o]=ss(()=>({accept:te.OptionRow,collect:r=>({handlerId:r.getHandlerId()}),hover:(r,a)=>{if(!n.current)return;const c=t,u=r.index;if(u===c)return;const p=n.current?.getBoundingClientRect(),x=(p.bottom-p.top)/2,b=a.getClientOffset().y-p.top;u<c&&b<x||u>c&&b>x||(s(u,c),r.index=c)}}),[n,s]);return{handlerId:i,drop:o}},Cr=({index:t,dragRef:n,onDrop:s,children:i})=>{const o=g.useRef(null),{handlerId:r,drop:a}=_6(t,o,s),{isDragging:c,drag:u,preview:p}=O6(t);return g.useEffect(()=>{u(n)},[u,n]),g.useEffect(()=>{a(p(o))},[a,p]),e.jsx(Qs,{ref:o,className:E(c&&"dragging"),"data-handler-id":r,children:i})},ri=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M336 176a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm-160 0a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM64 224a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM336 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM224 384a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM16 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z"})}),Iu=({value:t,property:n,context:s,errors:i,updateValue:o})=>{const{options:r,emptyOption:a}=n;return e.jsx(W,{property:n,errors:i,context:s,children:e.jsx(de,{value:t??"",emptyOption:a,options:r,onChange:o})})},W6=l(it)`
  min-width: 400px;
`,U6=({open:t,close:n,bulkImport:s})=>{const[i,o]=g.useState("|"),[r,a]=g.useState(!0),[c,u]=g.useState(""),p=g.useRef(null),x=()=>{s(c,i,r),u(""),n()};return ft({callback:f=>{f.key==="Enter"&&f.metaKey&&x()},meetsCondition:t,type:"keydown",ref:p},[c,i,r]),e.jsxs(W6,{className:"bulk-editor",children:[e.jsx(Iu,{value:i,updateValue:f=>o(f),property:{label:d("Separator"),instructions:d("Select the separator used to separate the option label and value when using custom values for option labels."),handle:"separator",type:K.Select,value:"|",options:[{value:"|",label:"|"},{value:",",label:","},{value:";",label:";"},{value:"=>",label:"=>"},{value:" ",label:"Space"}]}}),e.jsx(yn,{updateValue:f=>a(f),value:r,property:{label:d("Append Values"),handle:"append",type:K.Boolean}}),e.jsx(ds,{value:c,updateValue:f=>u(f),focus:t,ref:p,property:{label:d("Bulk Editor"),instructions:d("Enter bulk values separated by new lines. If using custom values for option labels, you can provide a label and a value separated by a separator. For example, if you used `{separator}` you would write: `Label{separator}value`.",{separator:i}),handle:"bulkEditor",type:K.Textarea,rows:10}}),e.jsx("button",{type:"button",className:"btn submit",onClick:x,children:d(r?"Append Options with Bulk Import":"Replace Options with Bulk Import")})]})},H6=l.div`
  display: flex;
  justify-content: space-between;
`,q6=l.div`
  flex: 0 1 auto;
`,Au=l.button`
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
`;const Ru=l.div`
  display: flex;
  flex-direction: column;
`,Q6=({options:t,copyValues:n})=>{const[s,i]=g.useState(0),o=g.useCallback(()=>t.map(({label:r,value:a,optgroup:c})=>{const u=[];return c&&u.push("@@"),u.push(r),n&&u.push(`|${a}`),u.join("")}).join(`
`),[t,n]);return e.jsxs(Au,{onClick:()=>{navigator.clipboard.writeText(o()),i(1),setTimeout(()=>i(0),2e3)},children:[e.jsx("i",{className:E(s===0&&"fa-classic fa-copy",s===1&&"fa-classic fa-check")}),e.jsx("span",{children:d(s===0?"Copy to clipboard":"Copied")})]})},pl=(t,n)=>({...t,options:[...t.options.slice(0,n),{label:"",value:""},...t.options.slice(n)]}),K6=(t,n)=>({...t,options:n}),Bi=(t,n,s)=>{const i=[...s.options];return i[t]=n,{...s,options:i}},V6=(t,n)=>{const s=n.options.filter((i,o)=>o!==t);return{...n,options:s}},G6=t=>({...t,options:t.options.filter(n=>!!n.label||!!n.value)}),Y6=(t,n)=>n?{...t,useCustomValues:n}:{...t,useCustomValues:n,options:t.options.map(s=>({...s,value:s.label}))},J6=(t,n,s)=>{const i=[...t.options];return{...t,options:Xs(i,{$splice:[[n,1],[s,0,i[n]]]})}},Z6=({value:t,updateValue:n,defaultValue:s,updateDefaultValue:i,isMultiple:o,allowOptgroup:r,autoUpdateHandle:a})=>{const[c,u]=g.useState(t),p=xs(c,500);g.useEffect(()=>{n(p)},[p,n]),g.useEffect(()=>{c.options.length||u(pl(c,0))},[c]);const{options:x=[],useCustomValues:f=!1}=c,b=g.useRef([]);b.current=x.map((F,N)=>b.current[N]||oe.createRef());const{activeCell:j,setActiveCell:y,setCellRef:w,keyPressHandler:v}=zn(x.length,f?2:1),$=(F,N)=>{y(N!==void 0?N+1:x.length,F),u(pl(c,N===void 0?x.length:N+1))},C=(F,N,M)=>{let z=[];M&&(x[0]&&x[0].label===""&&x[0].value===""?z=[]:z=[...x]),F.split(`
`).forEach(L=>{let[A,D]=L.split(N);A=A.trim(),D=D?.trim();let J=!1;A.startsWith("@@")&&(J=!0,A=A.replace(/^@@/,"").trim()),!(!A&&!D)&&z.push({label:A,value:f&&D?D:A,optgroup:J})}),u(K6(c,z))};return e.jsxs(it,{children:[e.jsxs(H6,{children:[e.jsx(yn,{property:{label:d("Use custom values"),handle:"useCustomValues",type:K.Boolean},value:f,updateValue:()=>u(Y6(c,!f))}),e.jsxs(q6,{children:[e.jsx(Ve,{preview:e.jsxs(Au,{children:[e.jsx("i",{className:"fa-duotone fa-list"}),e.jsx("span",{children:d("Add options in bulk")})]}),children:(F,N)=>e.jsx(U6,{open:F,close:N,bulkImport:C})}),e.jsx(Q6,{options:c.options,copyValues:f})]})]}),!!x.length&&e.jsxs(Ru,{children:[e.jsx(bs,{children:e.jsxs(js,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[r&&e.jsx("th",{children:d("Optgroup")}),e.jsx("th",{children:d("Label")}),f&&e.jsx("th",{children:d("Value")}),x.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("th",{children:d("Selected")}),e.jsx("th",{colSpan:2,children:d("Actions")})]})]})}),e.jsx("tbody",{children:x.map((F,N)=>e.jsxs(Cr,{index:N,dragRef:b.current[N],onDrop:(M,z)=>u(J6(c,M,z)),children:[r&&e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(en,{enabled:F.optgroup,onClick:M=>u(Bi(N,{...F,optgroup:M},c))})})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",value:F.label,placeholder:d("Label"),autoFocus:j===`${N}:0`,ref:M=>w(M,N,0),onFocus:()=>y(N,0),onKeyDown:v({onEnter:({shiftKey:M})=>{$(0,M?N:void 0)}}),onChange:M=>u(Bi(N,{...F,label:M.target.value,value:a||!f?M.target.value:F.value},c))})}),f&&e.jsx(ue,{children:e.jsx(ot,{type:"text",className:"code",value:F.value,placeholder:d("Value"),autoFocus:j===`${N}:1`,ref:M=>w(M,N,1),onFocus:()=>y(N,1),onKeyDown:v({onEnter:({shiftKey:M})=>{$(1,M?N:void 0)}}),onChange:M=>u(Bi(N,{...F,value:M.target.value},c))})}),x.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(yn,{property:{label:"",handle:`${N}-check`,type:K.Boolean,width:50},value:o?s.includes(F.value):F.value===s,updateValue:()=>{if(o){const M=s;i(M.includes(F.value)?M.filter(z=>z!==F.value):[...M,F.value])}else i(F.value===s?"":F.value)}})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{ref:b.current[N],className:"handle",children:e.jsx(ri,{})})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{onClick:()=>{u(V6(N,c)),y(Math.max(N-1,0),0)},children:e.jsx(gs,{})})})})]})]},N))})]})}),e.jsx(ms,{label:"Add an option",onClick:()=>$(0)})]}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},X6=l(ur)`
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
`,e8=({value:t})=>{const{options:n=[],useCustomValues:s}=t;return e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(Zt,{children:[!n.length&&e.jsx(kt,{children:d("Not configured yet")}),n.map((i,o)=>e.jsxs(X6,{children:[e.jsx(jn,{"data-empty":d("empty"),children:i.label}),s&&e.jsx(jn,{"data-empty":d("empty"),children:i.value})]},o))]})})},t8=({value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,isMultiple:r,autoUpdateHandle:a})=>e.jsxs(e.Fragment,{children:[e.jsx(En,{children:d("Options")}),e.jsx(Ve,{preview:e.jsx(e8,{value:t,defaultValue:i,isMultiple:r}),excludeClassNames:["bulk-editor"],onAfterEdit:()=>n(G6(t)),children:e.jsx(Z6,{value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,isMultiple:r,allowOptgroup:s.allowOptgroup,autoUpdateHandle:a})})]}),n8=Object.freeze(Object.defineProperty({__proto__:null,custom:t8,elements:P6,predefined:B6},Symbol.toStringTag,{value:"Module"})),s8=n8,i8=({value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,convertToCustomValues:r,isMultiple:a,autoUpdateHandle:c})=>{const{source:u=Re.Custom}=t,p=s8[u];return p===void 0?e.jsxs("div",{children:[u," not implemented..."]}):(p.displayName=`Source <${u}>`,e.jsx($r,{message:`...${u} not implemented`,children:e.jsx(g.Suspense,{children:e.jsx(p,{value:t,updateValue:n,property:s,defaultValue:i,updateDefaultValue:o,convertToCustomValues:r,isMultiple:a,autoUpdateHandle:c})})}))};l.div`
  display: flex;
  align-items: center;
  gap: 0px;

  margin-left: 5px;

  svg {
    width: 20px;
    height: 20px;
  }
`;const o8=l.span`
  width: 200px;
  display: block;
  padding: 0 5px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  background: #00000005;
  color: ${h.gray300};
`,r8=({value:t,defaultValue:n,isMultiple:s,property:i,field:o})=>{const{getTranslation:r,updateTranslation:a}=Ce(o),c=t.source==="custom"&&t.options||[],u=r(i.handle,{}),p=u.options||[],x=u.defaultValue||n,f=g.useRef([]);f.current=c.map((v,$)=>f.current[$]||oe.createRef());const{activeCell:b,setActiveCell:j,setCellRef:y,keyPressHandler:w}=zn(c.length,1);return e.jsx(it,{children:e.jsx(bs,{children:e.jsx(js,{children:e.jsx("tbody",{children:c.map((v,$)=>{const C=p.find(M=>M.value===v.value);let F=!1;x===void 0?s?F=n.includes(v.value):F=n===v.value:s?F=x.includes(v.value):F=x===v.value;const N=C!==void 0?C.label:v.label;return e.jsxs(Qs,{children:[e.jsx(ue,{style:{width:200},children:e.jsx(o8,{className:"code",title:v.value,children:v.value||d("Empty")})}),e.jsx(ue,{children:e.jsx(ot,{type:"text",value:N,placeholder:d("Label"),autoFocus:b===`${$}:0`,ref:M=>y(M,$,0),onFocus:()=>j($,0),onKeyDown:w(),onChange:M=>{const z=Mt(p),L=z.findIndex(A=>A.value===v.value);L===-1?z.push({value:v.value,label:M.target.value}):z[L].label=M.target.value,a(i.handle,{...u,options:z})}})}),e.jsx(ue,{$tiny:!0,children:e.jsx(en,{enabled:F,onClick:M=>{if(!s){a(i.handle,{...u,defaultValue:M?v.value:""});return}let z;typeof x=="object"?z=[...x]:z=[],M&&!z.includes(v.value)?z.push(v.value):!M&&z.includes(v.value)&&z.splice(z.indexOf(v.value),1),a(i.handle,{...u,defaultValue:z})}})})]},$)})})})})})},a8=({value:t,defaultValue:n,isMultiple:s,field:i,property:o})=>{const{hasTranslation:r,getTranslation:a,removeTranslation:c}=Ce(i);if(t.source!=="custom")return null;const{options:u}=t,{handle:p}=o,f=a(p,{}).options||[];return e.jsxs(e.Fragment,{children:[e.jsx(vd,{label:"Options",handle:p,translatable:!0,hasTranslation:r(p),removeTranslation:()=>c(p)}),e.jsx(Ve,{preview:e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(Zt,{children:[!u.length&&e.jsx(kt,{children:d("Not configured yet")}),u.map((b,j)=>e.jsxs(ur,{children:[e.jsx(jn,{"data-empty":d("empty"),children:f.find(y=>y.value===b.value)?.label||b.label}),e.jsx(jn,{className:"code","data-empty":d("empty"),children:b.value})]},j))]})}),excludeClassNames:["bulk-editor"],children:e.jsx(r8,{value:t,defaultValue:n,isMultiple:s,field:i,property:o})})]})},l8=({value:t,field:n,property:s,context:i})=>{const{getTranslation:o,updateTranslation:r}=Ce(n),{data:a,isFetching:c}=Mu();if(t.source!=="elements")return null;const{handle:u}=s,p=t.typeClass,x=a?.find(y=>y.typeClass===p),f=o(u,{}),b=f.emptyOption||"",j=f.properties||{};return e.jsx(W,{property:s,context:i,children:e.jsxs(ys,{children:[s.showEmptyOption&&e.jsx(je,{property:{type:K.String,label:"Empty Option Label (optional)",handle:"emptyOption"},context:t,value:b,updateValue:y=>{r(u,{...f,emptyOption:y})}}),e.jsx(W,{property:{type:K.Select,label:"Type",handle:"predefinedOptionTypeClass",options:[]},children:e.jsx(de,{emptyOption:"Choose type",loading:c,value:t.typeClass,options:[{label:x?.name||"",value:x?.typeClass||""}]})}),x?.properties.map(y=>{let w="";return j?.[y.handle]!==void 0?w=j[y.handle]:t.properties[y.handle]!==void 0&&(w=t.properties[y.handle]),e.jsx(je,{property:y,context:t,value:w,updateValue:v=>{r(u,{...f,properties:{...f.properties,[y.handle]:v}})}},y.handle)})]})})},c8=t=>{const{value:n}=t;switch(n.source){case"custom":return e.jsx(a8,{...t});case"elements":return e.jsx(l8,{...t});default:return null}},d8=({value:t,errors:n,property:s,updateValue:i,context:o})=>{const{source:r}=t,a=o.properties.defaultValue,c=Me(o.typeClass),u=c?.implements.includes("multiValue"),p=o?.id===void 0,{willTranslate:x}=Ce(o),[f]=oi(o,c),b=H(),j=w=>{b(be.edit({uid:o.uid,handle:"defaultValue",value:w}))},y=()=>i({source:Re.Custom,useCustomValues:!0,options:[...f]});return x(s.handle)?e.jsx(c8,{property:s,value:t,field:o,defaultValue:a,isMultiple:u,context:o}):e.jsxs(e.Fragment,{children:[I.editions.isAtLeast(re.Lite)&&e.jsxs(ls,{$width:s.width,children:[e.jsx(En,{children:d("Source")}),e.jsx(hr,{options:Q3,value:r,onClick:w=>{w!==r&&i(A6(w))}})]}),e.jsx(i8,{value:t,updateValue:i,property:s,defaultValue:a,updateDefaultValue:j,convertToCustomValues:y,isMultiple:u,allowOptgroup:s.allowOptgroup,autoUpdateHandle:p}),e.jsx(ti,{errors:n})]})},u8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m120.714 94.857c-14.302 0-25.857 11.555-25.857 25.857v258.572c0 14.302 11.555 25.857 25.857 25.857h258.572c14.302 0 25.857-11.555 25.857-25.857v-258.572c0-14.302-11.555-25.857-25.857-25.857zm-51.714 25.857c0-28.523 23.191-51.714 51.714-51.714h258.572c28.523 0 51.714 23.191 51.714 51.714v258.572c0 28.523-23.191 51.714-51.714 51.714h-258.572c-28.523 0-51.714-23.191-51.714-51.714zm267.702 86.703-103.428 103.428c-5.01 5.01-13.252 5.01-18.262 0l-51.714-51.714c-5.01-5.01-5.01-13.252 0-18.262s13.252-5.01 18.261 0l42.584 42.584 94.298-94.298c5.009-5.01 13.251-5.01 18.261 0s5.01 13.252 0 18.262z"})]}),p8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m107.143 421.429c-15.804 0-28.572-12.768-28.572-28.572v-285.714c0-15.804 12.768-28.572 28.572-28.572h285.714c15.804 0 28.572 12.768 28.572 28.572v285.714c0 15.804-12.768 28.572-28.572 28.572zm-57.143-28.572c0 31.518 25.625 57.143 57.143 57.143h285.714c31.518 0 57.143-25.625 57.143-57.143v-285.714c0-31.518-25.625-57.143-57.143-57.143h-285.714c-31.518 0-57.143 25.625-57.143 57.143zm200-57.143c8.571 0 16.696-3.571 22.5-9.821l85.268-91.786c4.196-4.553 6.518-10.536 6.518-16.696 0-13.572-10.982-24.554-24.554-24.554h-179.464c-13.572 0-24.554 10.982-24.554 24.554 0 6.16 2.322 12.143 6.518 16.696l85.268 91.786c5.804 6.25 13.929 9.821 22.5 9.821zm-1.518-29.196-79.018-85.089h161.072l-78.929 85.089c-.357.446-.982.625-1.518.625-.535 0-1.16-.268-1.518-.625z"})]}),h8=t=>e.jsxs(R,{height:"500",viewBox:"0 0 500 500",width:"500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m380.843 92.184c-24.515-24.514-64.277-24.514-88.791 0l-161.743 161.744c-39.425 39.425-39.425 103.28 0 142.705s103.28 39.425 142.705 0l128.047-128.047c5.223-5.223 13.815-5.223 19.038 0s5.223 13.815 0 19.038l-128.047 128.047c-49.955 49.955-130.911 49.955-180.782 0s-49.955-130.827 0-180.782l161.744-161.743c35.044-35.045 91.823-35.045 126.867 0 35.045 35.044 35.045 91.823 0 126.867l-154.835 154.836c-23.757 23.756-62.844 21.566-83.905-4.633-17.943-22.409-16.174-54.757 4.128-75.059l127.963-127.879c5.223-5.223 13.815-5.223 19.038 0s5.223 13.816 0 19.039l-127.878 127.878c-10.615 10.615-11.541 27.463-2.19 39.172 10.951 13.647 31.337 14.827 43.721 2.443l154.92-154.835c24.514-24.514 24.514-64.276 0-88.791z"})]}),x8=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M352 128L352 96L288 96L288 288L96 288L96 352L288 352L288 544L352 544L352 352L544 352L544 288L352 288L352 128z"})}),m8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m52 108.571c0-15.621 12.664-28.285 28.286-28.285 15.621 0 28.285 12.664 28.285 28.285 0 15.622-12.664 28.286-28.285 28.286-15.622 0-28.286-12.664-28.286-28.286zm84.857 0c0-31.243-25.328-56.571-56.571-56.571-31.244 0-56.572 25.328-56.572 56.571 0 31.244 25.328 56.572 56.572 56.572 31.243 0 56.571-25.328 56.571-56.572zm56.572 0c0 7.779 6.364 14.143 14.142 14.143h254.572c7.778 0 14.143-6.364 14.143-14.143 0-7.778-6.365-14.142-14.143-14.142h-254.572c-7.778 0-14.142 6.364-14.142 14.142zm0 141.429c0 7.779 6.364 14.143 14.142 14.143h254.572c7.778 0 14.143-6.364 14.143-14.143s-6.365-14.143-14.143-14.143h-254.572c-7.778 0-14.142 6.364-14.142 14.143zm0 141.429c0 7.778 6.364 14.142 14.142 14.142h254.572c7.778 0 14.143-6.364 14.143-14.142 0-7.779-6.365-14.143-14.143-14.143h-254.572c-7.778 0-14.142 6.364-14.142 14.143zm-113.143-113.143c-15.622 0-28.286-12.664-28.286-28.286s12.664-28.286 28.286-28.286c15.621 0 28.285 12.664 28.285 28.286s-12.664 28.286-28.285 28.286zm0-84.857c-31.244 0-56.572 25.327-56.572 56.571s25.328 56.571 56.572 56.571c31.243 0 56.571-25.327 56.571-56.571s-25.328-56.571-56.571-56.571zm14.143-84.858c0-7.81-6.332-14.142-14.143-14.142s-14.143 6.332-14.143 14.142c0 7.811 6.332 14.143 14.143 14.143s14.143-6.332 14.143-14.143zm-42.429 282.858c0-15.622 12.664-28.286 28.286-28.286 15.621 0 28.285 12.664 28.285 28.286 0 15.621-12.664 28.285-28.285 28.285-15.622 0-28.286-12.664-28.286-28.285zm84.857 0c0-31.244-25.328-56.572-56.571-56.572-31.244 0-56.572 25.328-56.572 56.572 0 31.243 25.328 56.571 56.572 56.571 31.243 0 56.571-25.328 56.571-56.571z"})]}),g8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m62 132.5c-12.998 0-23.5 10.502-23.5 23.5v188c0 12.998 10.502 23.5 23.5 23.5h376c12.998 0 23.5-10.502 23.5-23.5v-188c0-12.998-10.502-23.5-23.5-23.5zm-47 23.5c0-25.923 21.077-47 47-47h376c25.923 0 47 21.077 47 47v188c0 25.923-21.077 47-47 47h-376c-25.923 0-47-21.077-47-47zm94 35.25v117.5c0 6.462-5.287 11.75-11.75 11.75s-11.75-5.288-11.75-11.75v-117.5c0-6.463 5.287-11.75 11.75-11.75s11.75 5.287 11.75 11.75z"})]}),f8=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m439.507 97.861 8.519 8.519c8.948 8.948 8.948 23.48 0 32.357l-19.114 19.185-40.804-40.804 18.899-19.185c8.948-9.02 23.48-9.092 32.5-.072zm-169.373 138.663 101.867-103.156 40.732 40.733-102.439 102.511c-3.15 3.15-7.159 5.298-11.526 6.228l-44.025 9.235 9.234-44.169c.931-4.295 3.007-8.232 6.157-11.382zm120.623-154.698-136.945 138.591c-6.156 6.228-10.452 14.174-12.241 22.764l-12.886 61.35c-.787 3.794.358 7.731 3.078 10.451 2.721 2.721 6.658 3.938 10.452 3.079l61.206-12.814c8.734-1.862 16.68-6.157 22.979-12.456l137.876-137.804c17.896-17.896 17.896-46.889 0-64.785l-8.519-8.591c-17.968-17.968-47.104-17.896-65 .215zm-322.64 75.094c-25.27 0-45.815 20.545-45.815 45.815v183.261c0 25.27 20.545 45.815 45.815 45.815h320.707c25.27 0 45.815-20.545 45.815-45.815v-125.992c0-6.299-5.154-11.454-11.454-11.454s-11.454 5.155-11.454 11.454v125.992c0 12.671-10.237 22.908-22.907 22.908h-320.707c-12.671 0-22.907-10.237-22.907-22.908v-183.261c0-12.671 10.236-22.907 22.907-22.907h171.807c6.3 0 11.454-5.155 11.454-11.454 0-6.3-5.154-11.454-11.454-11.454zm45.815 154.626c9.489 0 17.181-7.692 17.181-17.18 0-9.489-7.692-17.181-17.181-17.181-9.488 0-17.18 7.692-17.18 17.181 0 9.488 7.692 17.18 17.18 17.18zm85.904-17.18c0-9.489-7.692-17.181-17.181-17.181-9.488 0-17.18 7.692-17.18 17.181 0 9.488 7.692 17.18 17.18 17.18 9.489 0 17.181-7.692 17.181-17.18z"})]}),b8=l.input`
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
`,ct=t=>e.jsx(b8,{type:"checkbox",...t}),j8=({column:t,onUpdate:n})=>{const s=g.useId(),i=t.checked??!1;return e.jsx(ys,{$gap:m.lg,children:e.jsxs(hn,{$alignItems:"center",children:[e.jsx(ct,{id:s,checked:i,onChange:()=>n({...t,checked:!t.checked})}),e.jsx("label",{htmlFor:s,children:d(i?"checked by default":"unchecked by default")})]})})},y8=(t,n)=>[...t.slice(0,n),"",...t.slice(n)],v8=(t,n,s)=>{const i=[...s];return i[t]=n,i},hl=(t,n)=>n.filter((s,i)=>i!==t),w8=(t,n,s)=>Xs(t,{$splice:[[n,1],[s,0,t[n]]]}),xl=(t=[],n=[])=>t.length===n.length&&t.every((s,i)=>s===n[i]),$8=({column:t,onUpdate:n})=>{const[s,i]=g.useState(t.options?.length?t.options:[""]),o=xs(s,500),r=g.useRef(t);g.useEffect(()=>{r.current=t},[t]);const a=g.useRef(n);g.useEffect(()=>{a.current=n},[n]),g.useEffect(()=>{const y=t.options?.length?t.options:[""];i(w=>xl(w,y)?w:y)},[t.options]),g.useEffect(()=>{const y=r.current,w=y.value,v=o.includes(w)?w:"";xl(y.options??[],o)&&y.value===v||a.current({...y,options:o,value:v})},[o]);const c=g.useRef([]);c.current=s.map((y,w)=>c.current[w]||oe.createRef());const{activeCell:u,setActiveCell:p,setCellRef:x,keyPressHandler:f}=zn(s.length,1),b=(y,w)=>{p(w!==void 0?w+1:s.length,y),i(y8(s,w===void 0?s.length:w+1))},j=y=>{const w=r.current,v=w.value===y?"":y,$={...w,options:s,value:v};r.current=$,a.current($)};return e.jsxs(e.Fragment,{children:[e.jsxs(Ru,{children:[e.jsx(bs,{children:e.jsxs(js,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("Label")}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("th",{children:d("Selected")}),e.jsx("th",{colSpan:2,children:d("Actions")})]})]})}),e.jsx("tbody",{children:s.map((y,w)=>e.jsxs(Cr,{index:w,dragRef:c.current[w],onDrop:(v,$)=>i(w8(s,v,$)),children:[e.jsx(ue,{children:e.jsx(ot,{type:"text",value:y,placeholder:d("Label"),autoFocus:u===`${w}:0`,ref:v=>x(v,w,0),onFocus:()=>p(w,0),onKeyDown:f({onEnter:({shiftKey:v})=>{b(0,v?w:void 0)},onDelete:()=>{if(s.length>1){const v=hl(w,s),$=r.current,C={...$,options:v,value:$.value===y?"":$.value};r.current=C,a.current(C),i(v),p(Math.max(w-1,0),0)}}}),onChange:v=>{const $=v8(w,v.target.value,s),C=r.current;if(C.value===y){const F={...C,value:v.target.value,options:$};r.current=F,a.current(F)}i($)}})}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(yn,{property:{label:"",handle:`${w}-check`,type:K.Boolean,width:50},value:t.value===y,updateValue:()=>j(y)})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{ref:c.current[w],className:"handle",children:e.jsx(ri,{})})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Et,{children:e.jsx(Bt,{onClick:()=>{const v=hl(w,s),$=r.current,C={...$,options:v,value:$.value===y?"":$.value};r.current=C,a.current(C),i(v),p(Math.max(w-1,0),0)},children:e.jsx(gs,{})})})})]})]},w))})]})}),e.jsx(ms,{label:d("Add an option"),onClick:()=>b(0)})]}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},C8={fileCount:1,maxFileSizeKB:2048,fileKinds:["image"],assetSourceId:null,uploadLocation:null},k8=[{value:"image",label:"Image"},{value:"video",label:"Video"},{value:"audio",label:"Audio"},{value:"text",label:"Text"},{value:"pdf",label:"PDF"},{value:"json",label:"JSON"}],S8=({column:t,onUpdate:n,property:s})=>{const i={...C8,...t.metadata||{}},o=(x=[])=>x.flatMap(f=>"children"in f?o(f.children):f),r=o(s?.fileKindsOptions),a=r.length?r:k8,c=o(s?.assetSourceOptions),u=x=>{n({...t,metadata:{...i,...x}})},p=x=>{const f=new Set(i.fileKinds);f.has(x)?f.delete(x):f.add(x),u({fileKinds:Array.from(f)})};return e.jsxs(ys,{$gap:m.lg,children:[e.jsxs(hn,{$gap:m.md,children:[e.jsx(W,{width:40,label:d("Max Files"),handle:"fileCount",children:e.jsx("input",{type:"number",min:1,className:"text fullwidth",value:i.fileCount,onChange:x=>u({fileCount:Math.max(1,Number(x.target.value)||1)})})}),e.jsx(W,{width:60,label:d("Maximum File Size (KB)"),handle:"maxFileSizeKB",children:e.jsx("input",{type:"number",min:1,className:"text fullwidth",value:i.maxFileSizeKB,onChange:x=>u({maxFileSizeKB:Math.max(1,Number(x.target.value)||1)})})})]}),e.jsxs(hn,{children:[e.jsx(W,{width:40,label:d("Asset Source"),handle:"assetSourceId",instructions:d("Select an asset source to be able to store user uploaded files."),children:e.jsx(de,{emptyOption:d("Select source"),value:i.assetSourceId?String(i.assetSourceId):"",options:c,onChange:x=>u({assetSourceId:x?Number(x):null})})}),e.jsx(W,{width:60,label:d("Upload Location"),handle:"uploadLocation",instructions:d("The subfolder path that files should be uploaded to. May contain `{{ form.handle }}` or `{{ form.id }}` variables as well."),children:e.jsx("input",{type:"text",className:"text fullwidth",value:i.uploadLocation||"",onChange:x=>u({uploadLocation:x.target.value||null})})})]}),e.jsx(W,{label:d("File Kinds"),handle:"fileKinds",children:e.jsx(Xf,{children:a.map(x=>e.jsx("label",{children:e.jsxs(hn,{$alignItems:"center",$gap:m.sm,children:[e.jsx(ct,{checked:i.fileKinds.includes(x.value),onChange:()=>p(x.value)}),e.jsx("span",{children:x.label})]})},x.value))})})]})},L8=({column:t,onUpdate:n})=>e.jsxs(ys,{$gap:m.lg,children:[e.jsx(W,{label:d("Default value"),handle:"value",children:t.type==="textarea"?e.jsx("textarea",{className:"text fullwidth",rows:4,value:t.value,onChange:s=>n({...t,value:s.target.value})}):e.jsx("input",{type:"text",className:"text fullwidth",value:t.value,onChange:s=>n({...t,value:s.target.value})})}),e.jsx(W,{label:d("Placeholder"),handle:"placeholder",children:e.jsx("input",{type:"text",className:"text fullwidth",value:t.placeholder||"",onChange:s=>n({...t,placeholder:s.target.value})})})]}),F8=(t,n)=>[...t.slice(0,n+1),{label:"",type:"text",value:""},...t.slice(n+1)],Fs=(t,n,s)=>{const i=[...s];return i[t]=n,i},E8=(t,n)=>n.filter((s,i)=>i!==t),T8=(t,n,s)=>{const i=[...s];return Xs(i,{$splice:[[t,1],[n,0,i[t]]]})},N8=t=>t.filter(n=>!!n.label||!!n.value),z8={fileCount:1,maxFileSizeKB:2048,fileKinds:["image"],assetSourceId:null,uploadLocation:null},M8=(t,n)=>n==="file"?{...t,type:n,metadata:{...z8,...t.metadata||{}}}:{...t,type:n,metadata:{}},Oi={text:e.jsx(g8,{}),textarea:e.jsx(f8,{}),select:e.jsx(p8,{}),radio:e.jsx(m8,{}),checkbox:e.jsx(u8,{}),file:e.jsx(h8,{})},I8=({columnTypes:t,columns:n,updateValue:s,property:i,context:o})=>{const[r,a]=g.useState(0),{getTranslation:c,willTranslate:u}=Ce(o),p=g.useRef(null),x=g.useRef(null),f=g.useRef([]),b=g.useRef(!1),j=g.useRef(new WeakMap),y=g.useRef(0),w=u(i.handle),v=c(i.handle,n),$=w?v:n,C=g.useMemo(()=>$[r],[r,$]),F=L=>{const A=j.current.get(L);if(A)return A;const D=`table-column-${y.current++}`;return j.current.set(L,D),D},N=g.useMemo(()=>t.reduce((L,A)=>(A.value in Oi&&L.push({...A,icon:Oi[A.value]}),L),[]),[t]);g.useEffect(()=>{p.current?.focus()},[r,$.length]),g.useEffect(()=>{f.current[r]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"}),b.current&&(b.current=!1,p.current?.scrollIntoView({behavior:"smooth",block:"nearest"}))},[r,$.length]),g.useEffect(()=>{if(!x.current||$.length<2)return;const L=Ne.create(x.current,{animation:150,draggable:".table-column-tab",handle:".column-drag-handle",onEnd:A=>{const D=A.oldIndex,J=A.newIndex;D===void 0||J===void 0||D===J||(s(T8(D,J,$)),a(pe=>pe===D?J:D<pe&&pe<=J?pe-1:J<=pe&&pe<D?pe+1:pe))}});return()=>{L.destroy()}},[$,s]);const M=()=>{const L=$.length;s([...$,{label:"New column",type:"text",value:""}]),b.current=!0,a(L)},z=L=>{if($.length<=1)return;const A=E8(L,$);let D=r;r>L?D=r-1:r===L&&(D=Math.max(0,L-1)),s(A),a(D)};return e.jsx(Zd,{children:e.jsxs(bs,{children:[e.jsxs(e4,{children:[e.jsx(Kf,{ref:x,children:$.length>0&&$.map((L,A)=>e.jsxs("a",{className:E("table-column-tab",L.required&&"required",A===r&&"active"),ref:D=>{f.current[A]=D},onClick:()=>a(A),children:[e.jsx(pd,{children:Oi[L.type]}),e.jsx(Vf,{children:d(L.label)}),$.length>1&&e.jsx(Zf,{type:"button",className:"column-drag-handle",title:d("Reorder column"),onClick:D=>{D.preventDefault(),D.stopPropagation()},children:e.jsx(ri,{})}),A===r&&$.length>1&&e.jsx(Jf,{type:"button",title:d("Remove column"),onClick:D=>{D.preventDefault(),D.stopPropagation(),z(A)},children:e.jsx(gs,{})})]},F(L)))}),e.jsx(Yf,{type:"button",className:"btn",title:d("Add column"),onClick:M,children:e.jsx(x8,{})})]}),e.jsxs(t4,{children:[e.jsxs(hn,{children:[e.jsx(W,{width:60,label:d("Label"),handle:"label",children:e.jsx("input",{type:"text",className:"text fullwidth",ref:p,value:C?.label,onChange:L=>s(Fs(r,{...C,label:L.target.value},$))})}),e.jsx(W,{width:30,label:d("Column Type"),handle:"type",children:e.jsx(de,{showSelectedIcon:!0,emptyOption:"Select Type",value:C?.type,options:N,onChange:L=>{s(Fs(r,M8(C,L),$))}})}),e.jsx(W,{width:10,label:d("Required"),handle:"required",justify:"center",children:e.jsx(en,{enabled:!!C?.required,onClick:L=>{s(Fs(r,{...C,required:L},$))}})})]}),A8(C,L=>s(Fs(r,L,$)),i)]})]})})},A8=(t,n,s)=>t?["text","textarea"].includes(t.type)?e.jsx(L8,{column:t,onUpdate:n}):["select","radio"].includes(t.type)?e.jsx($8,{column:t,onUpdate:n}):t.type==="checkbox"?e.jsx(j8,{column:t,onUpdate:n}):t.type==="file"?e.jsx(S8,{column:t,onUpdate:n,property:s}):null:null,R8=(t,n)=>t.find(s=>s.value===n)?.label||n,P8=({columnTypes:t,columns:n})=>e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(Zt,{children:[!n.length&&e.jsx(kt,{children:d("Not configured yet")}),n.map((s,i)=>e.jsxs(ur,{"data-title":R8(t,s.type),children:[e.jsx(jn,{"data-empty":d("empty"),className:E(s.required&&"required"),children:s.label}),e.jsx(jn,{"data-empty":d("empty"),children:D8(s)})]},i))]})}),D8=t=>t.type==="checkbox"?e.jsx(ct,{readOnly:!0,checked:!!t.checked}):t.type==="select"?e.jsx("div",{className:E("small select"),children:e.jsx("select",{disabled:!0,children:e.jsx("option",{children:t.value})})}):e.jsx(e.Fragment,{children:t.value}),B8=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{options:r}=n;return e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(Ve,{preview:e.jsx(P8,{columnTypes:r,columns:t}),onAfterEdit:()=>i(N8(t)),onEdit:()=>{t.length||i(F8(t,0))},children:e.jsx(I8,{columnTypes:r,columns:t,updateValue:i,property:n,context:o})})})},Pu=(t,n,s)=>[...t.slice(0,s+1),[...n.map(()=>"")],...t.slice(s+1)],ml=(t,n,s)=>{const i=[...s];return i[t]=n,i},O8=(t,n)=>n.filter((s,i)=>i!==t),_8=(t,n,s)=>{const i=[...s];return Xs(i,{$splice:[[t,1],[n,0,i[t]]]})},W8=t=>t.filter(n=>n.filter(Boolean).length!==0),U8=({configuration:t,values:n,updateValue:s,property:i,context:o})=>{const{getTranslation:r,updateTranslation:a,willTranslate:c}=Ce(o),{handle:u}=i,p=c(u),x=r(u,n),f=g.useRef([]);f.current=n.map(($,C)=>f.current[C]||oe.createRef());const{activeCell:b,setActiveCell:j,setCellRef:y,keyPressHandler:w}=zn(n.length,t.length),v=($,C)=>{p||(j(C!==void 0?C+1:n.length,$),s(Pu(n,t,C!==void 0?C:n.length)))};return e.jsxs(Zd,{children:[e.jsx(bs,{children:e.jsx(js,{children:e.jsx("tbody",{children:n.map(($,C)=>e.jsxs(Cr,{index:C,dragRef:f.current[C],onDrop:(F,N)=>s(_8(F,N,n)),children:[t.map((F,N)=>e.jsx(ue,{children:e.jsx(ot,{type:"text",value:$[N],placeholder:d(F.label),autoFocus:b===`${C}:${N}`,disabled:p&&!F.translatable,ref:M=>y(M,C,N),onFocus:()=>j(C,N),onKeyDown:w({onEnter:M=>{v(0,M.shiftKey?C:void 0)}}),onChange:M=>{if(p){if(!F.translatable)return;a(i.handle,ml(C,[...x[C].slice(0,N),M.target.value,...x[C].slice(N+1)],x));return}s(ml(C,[...n[C].slice(0,N),M.target.value,...n[C].slice(N+1)],n))}})},N)),n.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(ue,{$tiny:!0,children:e.jsx(Bt,{ref:f.current[C],className:"handle",children:e.jsx(ri,{})})}),e.jsx(ue,{$tiny:!0,children:e.jsx(Bt,{onClick:()=>{s(O8(C,n)),j(Math.max(C-1,0),0)},children:e.jsx(gs,{})})})]})]},C))})})}),e.jsx(ms,{label:"Add a row",onClick:()=>v(0),disabled:p}),e.jsx(Xt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},H8=({configuration:t,values:n})=>e.jsx(d3,{"data-edit":d("Click to edit data"),children:e.jsxs(u3,{children:[!n.length&&e.jsx(gr,{children:d("Not configured yet")}),n.map((s,i)=>e.jsx(p3,{children:t.map((o,r)=>e.jsx(h3,{"data-empty":d("empty"),"data-title":o.label,children:s[r]},r))},i))]})}),q8=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const{configuration:r}=n;return e.jsx(W,{property:n,errors:s,context:o,children:e.jsx(Ve,{preview:e.jsx(H8,{configuration:r,values:t}),onAfterEdit:()=>i(W8(t)),onEdit:()=>{t.length||i(Pu(t,r,0))},children:e.jsx(U8,{configuration:r,values:t,updateValue:i,property:n,context:o})})})},Q8=({value:t,updateValue:n})=>e.jsx("input",{className:"input text fullwidth",type:"text",value:t,onChange:s=>n(s.target.value)}),K8=l.div`
  .tox {
    border: 1px solid #d1d1d1;
    border-radius: 0;
    padding: 0;
  }
`,V8=({value:t,menu:n,statusbar:s,toolbar:i,updateValue:o})=>{const{metadata:{tinymce:{stylesPath:r}}}=I;return e.jsx(it,{children:e.jsx(cr,{children:e.jsx(K8,{children:e.jsx(xc,{init:{menubar:n,statusbar:s,promotion:!1,content_css:r,relative_urls:!1,remove_script_host:!1},value:t,onEditorChange:o,plugins:G8,toolbar:i,licenseKey:"gpl"})})})})},G8=["autolink","code","codesample","image","link","lists","media","searchreplace","table"];l.pre`
  font-size: 10px;
`;const Y8=l(Zt)`
  height: auto;
  min-height: 30px;
  padding: ${m.sm};

  a {
    pointer-events: none;
  }
`,J8=({value:t})=>e.jsx(Jt,{"data-edit":d("Click to edit data"),children:e.jsxs(Y8,{children:[!t&&e.jsx(kt,{children:d("Not configured yet")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(t)}})]})}),Z8=({value:t,property:n,updateValue:s})=>e.jsx(Ve,{preview:e.jsx(J8,{value:t}),excludeClassNames:["tox"],children:e.jsx(V8,{menu:n.menu,statusbar:n.statusbar,toolbar:n.toolbar,value:t,updateValue:s})}),X8=l.div`
  margin-bottom: ${m.sm};
`,ej=/<[^>]*>/,tj=t=>t?ej.test(t):!1,nj=({value:t,property:n,errors:s,updateValue:i,context:o})=>{const r=x=>Craft.t("freeform",x),a=g.useMemo(()=>n.toggleEditor?tj(t)?"rich":"plain":"rich",[n.toggleEditor,t]),[c,u]=g.useState(a),p=x=>{if(u(x),x==="plain"&&t){const f=document.createElement("div");f.innerHTML=O.sanitize(t),i(f.textContent||"")}};return e.jsxs(W,{property:n,errors:s,context:o,children:[n.toggleEditor&&e.jsx(X8,{children:e.jsx(hr,{value:c,options:[{value:"plain",label:r("Plain Text")},{value:"rich",label:r("Rich Text")}],onClick:p})}),c==="rich"?e.jsx(Z8,{value:t,property:n,updateValue:i}):e.jsx(Q8,{value:t,updateValue:i})]})},sj=Object.freeze(Object.defineProperty({__proto__:null,aiBox:If,appStateSelect:Af,assetPicker:Of,attributes:b4,bool:yn,boolEnv:S4,buttonGroup:E4,calculationBox:q4,cards:C3,checkboxes:K4,codeEditor:Z4,colorPicker:i5,conditionalIntegrationRule:J3,conditionalNotificationRule:lb,datePicker:so,dynamicCheckboxes:l5,dynamicSelect:c5,entryPicker:m5,field:g5,fieldMapping:B3,fieldType:E5,formMonitorTools:ab,hidden:T5,int:N5,label:D5,minMax:W5,notificationTemplate:d6,options:d8,pageButton:S6,pageButtonLayout:I6,recipientMapping:$6,recipients:C6,select:Iu,string:Dt,table:B8,tabularData:q8,textarea:ds,wysiwyg:nj},Symbol.toStringTag,{value:"Module"})),ij=l.div`
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

    box-shadow: ${ae.bottom};
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
`,oj=({delimiter:t})=>t?e.jsx(ij,{children:e.jsx("div",{children:t.name})}):null,rj=(t,n)=>{const s=P(et.current);return g.useMemo(()=>{if(t.length===0)return!0;const i={config:I,page:s};try{return qd(t,n,i)}catch(o){return console.error(`Failed to evaluate visibility expression: ${t.join(" && ")}`,o),!1}},[t,n,s])},aj=sj,je=({value:t,updateValue:n,property:s,errors:i,context:o,autoFocus:r=!1})=>{const{handle:a,type:c,visibilityFilters:u}=s,p=aj[c],x=rj(u||[],o);return p===void 0?e.jsx("div",{children:`[${a}]: <${c}>`}):(p.displayName=`FormComponent: <${c}>`,x?e.jsx($r,{message:`...${a} <${c}>`,children:e.jsxs(g.Suspense,{children:[e.jsx(oj,{delimiter:s.delimiter}),e.jsx(p,{value:t,property:s,updateValue:n,errors:i,context:o,autoFocus:r})]})}):null)},gl=Ib,fl=(t,n,s,i)=>{let o=t;return n?.forEach(r=>{const[a,c]=r;gl[a]&&(o=gl[a](t,c,s,i))}),o},vs=(t,n,s)=>{const{isPrimary:i}=Fe(),r=P(Pe.settings.one("general"))?.translations;return g.useCallback(a=>{if(!a.disabled)return r&&!i?c=>{s(a.handle,c)}:c=>{const u=(p,x)=>{const f=t.find(b=>b.handle===p);!f||f.disabled||s(f.handle,fl(x,f.middleware,n))};s(a.handle,fl(c,a.middleware,n,u))}},[t,n,s,i,r])},lj=({namespace:t,property:n})=>{const s=H(),{data:i}=Gt(),o=i.find(y=>y.handle===t).properties,r=P(Pe.errors),a=P(Pe.current),u={...P(Pe.settings.one(t)),isNew:a.isNew,namespaceType:"settings",namespace:t},{getTranslation:p,updateTranslation:x}=Ce(u),f=p(n.handle,u[n.handle]),b=vs(o,u,(y,w)=>{x(y,w)||s(gt.modifySettings({namespace:t,key:y,value:w}))}),j=r?.[t]?.[n.handle];return e.jsx(je,{value:f,property:n,updateValue:b(n),errors:j,context:u})},cj=t=>e.jsxs(R,{viewBox:"0 0 512 512",...t,children:[e.jsx("path",{className:"fa-secondary",opacity:".4",d:"M48 480c26.5 0 48-21.5 48-48L96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L96 480l-48 0zM160 120l0 80c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24l0-80c0-13.3-10.7-24-24-24L184 96c-13.3 0-24 10.7-24 24zm0 184c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zM368 112c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16z"}),e.jsx("path",{className:"fa-primary",d:"M0 160L0 432c0 26.5 21.5 48 48 48s48-21.5 48-48L96 96 64 96C28.7 96 0 124.7 0 160zM384 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0zm0 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0zM176 288c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0zm0 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0z"})]}),dj=()=>{const{data:t,isFetching:n}=_h(),s=st("");return I.metadata.craft.is5?e.jsxs(rr,{children:[e.jsx(q,{id:"settings-usage",label:d("Usage in Elements"),url:s.pathname}),!t&&n&&e.jsx("div",{children:"Loading..."}),!n&&t?.length===0&&e.jsx(at,{title:d("No results found"),subtitle:d("This form is currently not attached to any elements."),icon:e.jsx(cj,{}),iconFade:!0}),t?.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(ar,{children:d("Usage in Elements")}),e.jsxs("table",{className:"data fullwidth collapsible",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("Element")}),e.jsx("th",{children:d("Type")}),e.jsx("th",{children:d("Status")})]})}),e.jsx("tbody",{children:t.map(o=>e.jsxs("tr",{className:"element-row",children:[e.jsx("th",{children:e.jsx("div",{className:"chip small element","data-id":o.id,children:e.jsxs("div",{className:"chip-content",children:[e.jsx("span",{className:E("status",o.status.toLowerCase()),role:"img"}),e.jsx("a",{href:o.url,className:"label-link",children:e.jsx("span",{children:o.title})})]})})}),e.jsx("td",{children:o.type}),e.jsx("td",{children:o.status})]},o.id))})]})]})]}):null},bl=()=>{const{sectionHandle:t}=V(),n=st(""),{data:s}=Gt();if(!s)return null;let i,o;if(s.forEach(a=>{a.sections.forEach(c=>{c.handle===t&&(i=a,o=c)})}),!i||!o)return t===Bs?e.jsx(dj,{}):null;const{properties:r}=i;return e.jsxs(rr,{children:[e.jsx(q,{id:"sub-settings",label:o.label,url:n.pathname}),e.jsx(ar,{children:d(o?.label)}),e.jsx(jf,{children:r.filter(a=>a.section===o?.handle).filter(a=>a.visible).map(a=>e.jsx(lj,{namespace:i.handle,property:a},a.handle))})]})},Du=l.div`
  display: flex;
  max-height: calc(100vh - 150px);
  height: 100%;

  margin-bottom: 30px;

  border-radius: ${S.lg};
  box-shadow: ${ae.box};
`,uj=()=>{const[,t]=g.useReducer(n=>n+1,0);g.useEffect(()=>{setTimeout(()=>{t()},0)},[])},Bu=l.div``,pj=l.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`,Ou=l.span`
  padding-left: ${m.md};

  font-weight: 700;
  font-size: 11px;
  color: ${h.gray550};

  text-transform: uppercase;
`,_u=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  padding: ${m.xs} 0;
`,hj=_u,xj=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"})}),mj=l.div`
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
`,gj=l.div`
  flex-grow: 1;
  max-width: 90%;

  padding: 1px 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,fj=l.div`
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
`,bj=({id:t,name:n,handle:s,icon:i})=>{const{setLastTab:o}=We("integrations"),r=P(as.one(t));if(!r)return null;const a=r.errors&&Object.values(r.errors).some(c=>c.length>0);return e.jsx(mj,{children:e.jsxs(he,{onClick:()=>o(`${t}/${s}`),to:`${t}/${s}`,className:E(!r.enabled&&"inactive",a&&"errors"),children:[!i&&e.jsx(jl,{children:e.jsx(xj,{})}),!!i&&e.jsx(jl,{dangerouslySetInnerHTML:{__html:O.sanitize(i)}}),e.jsx(gj,{children:n}),e.jsx(fj,{$enabled:r.enabled,className:E("status-dot")})]})})},jj=({label:t,children:n})=>e.jsxs(Bu,{children:[e.jsx(pj,{children:e.jsx(Ou,{children:t})}),e.jsx(hj,{children:n.map(s=>e.jsx(bj,{...s},s.id))})]}),yj=()=>e.jsx(Mn,{children:e.jsxs(Bu,{children:[e.jsx(Ou,{children:e.jsx(k,{width:50})}),e.jsx(_u,{style:{padding:14},children:[0,1,2].map(t=>e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[e.jsx(k,{width:20,height:20,circle:!0}),e.jsx("div",{style:{flexGrow:2},children:e.jsx(k,{width:100,style:{top:2}})}),e.jsx(k,{width:10,height:10,circle:!0,style:{top:6}})]},t))})]})}),_i=l.ul`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};

  list-style: none;
`,vj=()=>{const{formId:t,id:n}=V(),s=ne(),{data:i,isFetching:o}=Go(t&&Number(t));uj();const{lastTab:r,setLastTab:a}=We("integrations");if(g.useEffect(()=>{r&&s(r)},[s,r]),g.useEffect(()=>{if(!n&&!r&&i){const u=i.find(Boolean);u&&(a(`${u.id}/${u.handle}`),s(`${u.id}/${u.handle}`))}},[n,i,r,s,a]),!i&&o)return e.jsx(De,{children:e.jsx(_i,{children:e.jsx(yj,{})})});if(!i&&!o)return e.jsx(De,{children:e.jsx(_i,{})});const c={};return i.forEach(u=>{const{type:p}=u;c[p]||(c[p]={type:p,label:d(p.replace("-"," ")),children:[]}),c[p].children.push(u)}),e.jsx(De,{$lean:!0,children:e.jsx(_i,{children:Object.values(c).map(u=>e.jsx(jj,{...u},u.type))})})},wj=()=>{const t=st("");return e.jsxs(Du,{children:[e.jsx(q,{id:"integrations",label:d("Integrations"),url:t.pathname}),e.jsx(vj,{}),e.jsx(jt,{})]})},$j=({integration:t,property:n})=>{const s=H(),i=vs(t.properties,t.values,(r,a)=>{s(At.modify({id:t.id,key:r,value:a}))}),o=t.values[n.handle];return n.type===K.Hidden?null:e.jsx(je,{value:o,property:n,updateValue:i(n),errors:t?.errors?.[n.handle],context:t})},kr=l.div`
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
`,Cj=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,kj=()=>e.jsx(kr,{children:e.jsx(at,{title:d("No integrations found"),subtitle:d("To add an integration, click the button below"),icon:e.jsx(ps,{}),children:e.jsx(rt,{className:E("btn add icon"),to:"/integrations",children:d("Add integration")})})}),Sj=()=>e.jsx(kr,{children:e.jsxs(Mn,{children:[e.jsx(k,{width:120,height:20}),e.jsx("br",{}),e.jsx(k,{width:100,height:10}),e.jsx(k,{width:50,height:20}),e.jsx("br",{}),e.jsx(k,{width:200,height:10}),e.jsx(k,{width:500,height:10}),e.jsx(k,{height:30}),e.jsx("br",{}),e.jsx(k,{width:150,height:10}),e.jsx(k,{width:300,height:10}),e.jsx(k,{height:30})]})}),Lj=()=>{const{id:t}=V(),n=st(""),s=H(),{formId:i}=V(),{data:o,isFetching:r}=Go(i&&Number(i)),a=P(as.one(Number(t)));if(!o&&r)return e.jsx(Sj,{});if(!a)return e.jsx(kj,{});const{id:c,handle:u,enabled:p,name:x,description:f,properties:b}=a;return e.jsxs(kr,{children:[e.jsx(q,{id:"integration-editor",label:x,url:n.pathname}),e.jsx("h1",{title:u,children:x}),!!f&&e.jsx("p",{children:f}),e.jsxs(Cj,{children:[e.jsx(yn,{property:{label:"Enabled",handle:"enabled",type:K.Boolean},value:p,errors:a?.errors?.enabled,updateValue:()=>s(At.toggle(c))}),b.map(j=>e.jsx($j,{integration:a,property:j},j.handle))]})]})},Wu=g.createContext({isDragging:!1,dragType:void 0,position:void 0,dragOn:()=>{},dragOff:()=>{}}),Fj=({children:t})=>{const[n,s]=g.useState(!1),[i,o]=g.useState(),[r,a]=g.useState();return e.jsx(Wu.Provider,{value:{isDragging:n,dragType:i,position:r,dragOn:(c,u)=>{s(!0),a(u),o(c)},dragOff:()=>{s(!1),a(void 0),o(void 0)}},children:t})},ai=()=>g.useContext(Wu),Ot={currentPage:t=>{const n=t.context.page;return n?t.layout.pages.find(s=>s.uid===n):t.layout.pages.find(Boolean)},hasErrors:t=>n=>{const i=n.layout.pages.find(o=>o.uid===t).layoutUid;return n.layout.rows.filter(o=>o.layoutUid===i).some(o=>n.layout.fields.filter(r=>r.rowUid===o.uid).some(r=>bn(r.errors))),!1},focus:t=>t.context.focus,state:t=>t.context.state},Uu=l.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  flex: 1;
  overflow: hidden;
`,Ej=()=>{const t=g.useRef(null),[n,s]=g.useState({height:0,width:0,x:0,y:0}),[i]=g.useState(()=>new ResizeObserver(([o])=>{const{width:r,height:a,x:c,y:u}=o.target.getBoundingClientRect();s({width:r,height:a,x:c,y:u})}));return g.useEffect(()=>(t.current&&i.observe(t.current),()=>i.disconnect()),[i]),{ref:t,dimensions:n}},Tj=({active:t,hovering:n})=>Y({opacity:t?1:0,background:n?h.green600:"transparent",fill:n?"#fff":h.gray300,color:n?"#fff":h.gray300,scale:n?1.2:1,rotate:t?0:30,config:s=>{switch(s){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Nj=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z"})}),Hu=l(_.button)`
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
`,zj=({active:t,onClick:n,...s})=>{const i=g.useRef(null),o=Ct(i),a={...Tj({active:t,hovering:o}),...s?.style};return delete s.style,e.jsx(Hu,{type:"button",ref:i,style:a,onClick:n,...s,children:e.jsx(Nj,{})})},qu=t=>{const n=H(),[{isOver:s},i]=ss(()=>({accept:[te.FieldType,te.Field],collect:r=>({isOver:r.isOver({shallow:!0})}),canDrop:(r,a)=>a.isOver({shallow:!0}),drop:r=>{r.type===te.FieldType&&n(Oe.move.newField.newRow({fieldType:r.data,layoutUid:t.uid})),r.type===te.Field&&n(Oe.move.existingField.newRow({field:r.data,layoutUid:t.uid}))}}),[t]),o=Y({to:{opacity:s?1:0,transform:s?"scaleY(1)":"scaleY(0)"},config:{tension:300}});return{dropRef:i,placeholderAnimation:o}},Mj=l.div`
  position: relative;
  flex-grow: 1;

  height: 100%;
  padding: 8px;

  border: 1px solid #f2f4f7;
  border-radius: ${S.lg};
  background-color: #fcfdfe;
`,Ij=l(_.div)`
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
`,Aj=l.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 40px;
  height: 100%;

  color: ${h.gray200};
  font-size: 18px;
  text-align: center;
`,Rj=({field:t,layoutUid:n})=>{const s=H(),i=Pt(c=>bt.one(c,n)),o=Pt(c=>ns.inLayout(c,i?.uid)),{dropRef:r,placeholderAnimation:a}=qu(i);return g.useEffect(()=>{if(!n){const c=G();s(Cn.add({uid:c})),s(be.edit({uid:t.uid,handle:"layout",value:c}))}},[s,t.uid,n]),e.jsxs(Mj,{ref:c=>{r(c)},children:[!o.length&&e.jsx(Aj,{children:d("Add fields")}),o.map(c=>e.jsx(Sr,{row:c},c.uid)),e.jsx(Ij,{style:a,children:d("Drop a field here")})]})},Pj=t=>{const n=Y({scale:t?1:.3,opacity:t?1:0}),s=Y({scale:t?.3:1,opacity:t?0:1});return[n,s]},Dj=se`
  .options-one-line {
    display: inline-block;
    margin-right: 10px;
  }
`,Bj=se`
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
`,Oj=se`
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
`,_j=se`
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
`,Wj=se`
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
`,Qu=l.label`
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
`,Uj=l.div``,Tt=16,Hj=l.div`
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
`,Ku=l.div`
  margin-top: -4px;
  margin-bottom: 4px;

  color: ${h.gray300};
  font-style: italic;
  font-size: 12px;
`,Vu=l.div`
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

  ${_j}
  ${Oj}
  ${Dj}
  ${Bj}
  ${Wj}
`,qj=l.div`
  display: flex;
  flex-direction: row;
`,Qj=l.div`
  a {
    pointer-events: none;
  }
`,In={all:t=>t.notifications.items,one:t=>n=>n.notifications.items.find(s=>s.uid===t),isFieldInEmailNotification:t=>n=>n.notifications.items.some(s=>{if(s?.rule){const i=n.rules.notifications.items.find(o=>o.uid===s.rule);return i?.enabled&&i.conditions.some(o=>o.field===t)||!1}return s.field===t&&s.enabled}),count:{all:t=>t.notifications.items.length,ofType:t=>n=>n.notifications.items.filter(s=>s.className===t).length},errors:{any:t=>!!t.notifications.items.find(n=>n.errors!==void 0)}},Kj=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"13",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m46.195 63.066c-1.46 0-2.64-1.377-2.64-3.066 0-1.699 1.18-3.066 2.64-3.066h34.89c1.46 0 2.64 1.377 2.64 3.066 0 1.699-1.18 3.066-2.64 3.066zm7.15 50.782c1.74 0 3.15 1.377 3.15 3.076s-1.41 3.076-3.15 3.076h-39.44c-2.02 0-3.85-.801-5.18-2.1-1.378-1.339-2.152-3.16-2.15-5.058v-105.684c0-1.972.82-3.76 2.15-5.058 1.371-1.346 3.236-2.102 5.18-2.1h90.02c2.02 0 3.85.811 5.18 2.1 1.378 1.339 2.151 3.16 2.15 5.058v48.965c0 1.699-1.41 3.076-3.15 3.076s-3.15-1.377-3.15-3.076v-48.965c0-.273-.12-.527-.31-.703-.19-.185-.44-.303-.72-.303h-90.02c-.28 0-.54.118-.73.293-.18.196-.3.44-.3.713v105.674c0 .273.12.527.3.703.19.186.45.303.73.303h39.44zm51.93-41.25c-.51-.479-1.1-.703-1.78-.694-.68.01-1.26.264-1.74.762l-3.91 3.975 10.97 10.341 3.95-4.013c.47-.469.67-1.074.66-1.739-.01-.654-.25-1.25-.73-1.699zm-20.49 38.74c-1.45.449-2.89.918-4.33 1.377-1.45.469-2.89.947-4.33 1.416-3.41 1.094-5.32 1.699-5.72 1.807-.39.117-.16-1.446.7-4.698l2.71-10.205 20.55-20.879 10.96 10.303zm-38.59-26.426c-1.46 0-2.65-1.396-2.65-3.115s1.19-3.115 2.65-3.115h17.19c1.46 0 2.65 1.396 2.65 3.115s-1.19 3.115-2.65 3.115zm0-43.642c-1.46 0-2.64-1.377-2.64-3.067 0-1.699 1.18-3.066 2.64-3.066h34.89c1.46 0 2.64 1.377 2.64 3.066 0 1.699-1.18 3.067-2.64 3.067zm-15.14 36.328c2.054 0 3.72 1.626 3.72 3.632 0 2.007-1.666 3.633-3.72 3.633-2.055 0-3.72-1.626-3.72-3.633 0-2.006 1.665-3.632 3.72-3.632zm0-21.504c2.054 0 3.72 1.626 3.72 3.633 0 2.006-1.666 3.632-3.72 3.632-2.055 0-3.72-1.626-3.72-3.632 0-2.007 1.665-3.633 3.72-3.633zm0-21.504c2.054 0 3.72 1.626 3.72 3.633 0 2.006-1.666 3.632-3.72 3.632-2.055 0-3.72-1.626-3.72-3.632 0-2.007 1.665-3.633 3.72-3.633z",fill:"#89bb67"})]}),Vj=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"12",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m109.892 10.077-96.909 37.179 29.366 14.034 44.97-28.878-28.162 46.242 13.704 28.38 37.012-96.957zm-107.53 33.38 112.317-43.088c.919-.447 1.985-.49 2.937-.117 1.907.725 2.866 2.852 2.144 4.756l-43.022 112.632c-.531 1.368-1.822 2.293-3.291 2.357-1.469.063-2.836-.747-3.483-2.064l-22.192-45.901-45.684-21.836c-1.325-.635-2.145-1.995-2.085-3.46s.987-2.754 2.359-3.279z",fill:"#67a9e6"})]}),Gj=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"13",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m57.255 83.701 3.438-17.9 3.486 5.39c7.509-3.09 11.728-8.18 12.353-16.01 6.172 11.04 2.432 20.95-5.4 26.74l3.554 5.48zm12.773-52.87c-5.078-2.49-10.761-3.45-16.298-2.9-5.498.54-10.84 2.59-15.254 6.1-5.107 4.05-8.984 10.11-10.478 18.14l-.469 2.51-2.441.44c-2.393.43-4.531 1.02-6.406 1.77-1.817.72-3.438 1.61-4.854 2.66-1.132.84-2.109 1.78-2.939 2.8-2.568 3.15-3.76 7.1-3.73 11.1.042 4.142 1.335 8.17 3.701 11.53.888 1.25 1.914 2.4 3.086 3.4 1.213 1.032 2.573 1.868 4.033 2.48 1.494.63 3.144 1.08 4.97 1.34h70.848c3.448-.85 6.494-2 9.082-3.48 2.568-1.47 4.668-3.26 6.24-5.41 2.442-3.33 3.643-8.04 3.692-12.87.058-5.07-1.153-10.16-3.506-13.86-.674-1.07-1.416-2.03-2.197-2.89-3.526-3.89-7.998-5.59-12.647-5.62-2.431-.02-4.941.41-7.392 1.22-5.068-7.23-8.73-14.37-17.041-18.46zm19.805 10.26c1.562-.25 3.125-.38 4.677-.36 6.563.05 12.891 2.45 17.871 7.95 1.045 1.15 2.031 2.45 2.959 3.9 3.125 4.92 4.726 11.49 4.658 17.92-.068 6.31-1.729 12.59-5.127 17.21-2.217 3.01-5.058 5.47-8.467 7.42-3.281 1.88-7.109 3.31-11.406 4.33l-.8.1h-71.366l-.449-.04c-2.607-.34-4.971-.97-7.119-1.88-2.217-.94-4.18-2.15-5.908-3.63-1.641-1.4-3.076-2.99-4.297-4.72-3.262-4.6-5.019-10.22-5.058-15.82-.039-5.66 1.679-11.29 5.39-15.85 1.201-1.48 2.617-2.84 4.238-4.04 1.885-1.4 4.043-2.58 6.485-3.55 1.679-.67 3.476-1.23 5.371-1.68 2.148-8.74 6.728-15.47 12.616-20.14 5.508-4.37 12.139-6.92 18.965-7.59 6.797-.67 13.789.51 20.068 3.6 6.845 3.37 12.822 8.98 16.699 16.87zm-27.265 3.61-3.438 17.9-3.486-5.39c-7.51 3.09-11.728 8.18-12.353 16.01-6.172-11.04-2.432-20.95 5.4-26.74l-3.555-5.48z",fill:"#f3b898"})]}),Yj=l.div`
  display: flex;
  flex-direction: row;

  gap: ${m.sm};
  margin-left: ${m.sm};
`,vl=({uid:t})=>{const n=P(pn.hasRule(t)),s=P(In.isFieldInEmailNotification(t)),i=P(as.isFieldInIntegrations(t));return e.jsxs(Yj,{children:[n&&e.jsx(xe,{title:d("Conditional rules are applied to this field"),children:e.jsx(Kj,{})}),s&&e.jsx(xe,{title:d("Email notifications are applied to this field"),children:e.jsx(Vj,{})}),i&&e.jsx(xe,{title:d("Integrations are applied to this field"),children:e.jsx(Gj,{})})]})},Jj=(t,n)=>{const[s,i]=oi(t,n),{getTranslation:o}=Ce(t),r=Zj(t,n),a=g.useMemo(()=>{const u={};return Object.entries(t.properties).forEach(([p,x])=>{n?.properties.find(b=>b.handle===p)?.translatable?u[p]=o(p,x):u[p]=x}),u.generatedOptions=s,u.fetchedAssets=r,u},[t,n,s,r,o]);return[g.useMemo(()=>{if(t?.properties===void 0||n?.previewTemplate===void 0)return"No preview available";try{return q1(n.previewTemplate)(a)}catch(u){return`Preview template error: "${u.message}"`}},[t?.properties,n?.previewTemplate,a]),i]},Zj=(t,n)=>{const s=Xj(t,n),i=ey(t,n),{data:o}=fr(s,i);return o||{}},Xj=(t,n)=>{const s=g.useMemo(()=>n?.properties.filter(o=>o.type===K.AssetPicker).flatMap(o=>{const r=t.properties[o.handle];return typeof r=="number"?[r]:Array.isArray(r)?r.filter(a=>typeof a=="number"):[]}),[t,n]),i=g.useMemo(()=>n?.properties.filter(o=>o.type===K.Cards).map(o=>t.properties[o.handle].map(a=>a.assetId).filter(Boolean)),[t,n]);return[...s||[],...i||[]].flat()},ey=(t,n)=>g.useMemo(()=>{const s=n?.properties.find(i=>i.handle==="transform")?.handle;return t.properties[s]},[t,n]),ty=({field:t})=>{const n=H(),s=Me(t?.typeClass),{uid:i}=t,{active:o,type:r,uid:a}=P(Ot.focus),c=g.useMemo(()=>s?.implements?.includes("noLabel")||!1,[s]),u=g.useMemo(()=>o&&r===Yn.Field&&a===i,[o,r,a,i]),[p,x]=Jj(t,s),[f,b]=Pj(x),{getTranslation:j}=Ce(t);if(t?.properties===void 0||!s)return null;const y=j("label",t.properties.label||s?.name),w=j("instructions",t.properties.instructions);return e.jsxs(Vu,{"data-field-type":s.type,className:E(bn(t.errors)&&"errors",s.type===mt.Group&&"group",u&&"active","field"),onClick:v=>{v.stopPropagation(),n(ye.setFocusedItem({type:Yn.Field,uid:i}))},children:[!c&&e.jsxs(Qu,{className:"label",children:[e.jsxs(Hj,{children:[e.jsx(yl,{style:f,children:e.jsx(er,{})}),e.jsx(yl,{style:b,dangerouslySetInnerHTML:{__html:O.sanitize(s.icon)}})]}),e.jsx(Uj,{children:y}),t.properties.required&&e.jsx("span",{className:"required"}),e.jsx(vl,{uid:i})]}),w&&e.jsx(Ku,{children:w}),s.type===mt.Group&&e.jsx(Rj,{field:t,layoutUid:t.properties?.layout}),s.type!==mt.Group&&(c?e.jsxs(qj,{children:[e.jsx(Qj,{dangerouslySetInnerHTML:{__html:O.sanitize(p)}}),e.jsx(vl,{uid:i})]}):e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(p)}}))]})},ny=(t,n,s,i,o,r,a)=>!n||a===void 0?0:s&&i&&r!==void 0?o===r?t*(a-o):r>o?o<a?0:t:r<o&&o<=a?-t:0:a<=o?t:(a>o,0),sy=({width:t,isDragging:n,isOver:s,isCurrentRow:i,isDraggingField:o,dragFieldIndex:r,index:a,hoverPosition:c})=>{const{isDragging:u}=ai(),p=ny(t,s,i,o,a,r,c);return Y({immediate:x=>{switch(x){case"x":return!u;case"width":return!u}},to:{width:t,x:p,opacity:n?.3:1},config:{tension:700,mass:.5}})},iy=(t,n)=>{const[{isDragging:s},i,o]=qo(()=>({type:te.Field,collect:c=>({isDragging:c.isDragging()}),item:{type:te.Field,data:t,index:n}}),[t]),{dragOn:r,dragOff:a}=ai();return g.useEffect(()=>{s?r(te.Field):a()},[s,r,a]),{isDragging:s,drag:i,preview:o}},oy=t=>{let[n,s]=[200,40];const i=document.createElement("canvas");if(!i.getContext)return null;const o=i.getContext("2d"),c=(window.devicePixelRatio||1)/1;n=n*c,s=s*c,i.width=n,i.height=s,o.fillStyle="#FFFFFF",o.fillRect(0,0,n,s);const u=Math.ceil(4*c),p=Math.ceil(2*c);o.setLineDash([u,p]),o.strokeStyle="#c9c9c9",o.lineDashOffset=0,o.lineWidth=4*c,o.strokeRect(0,0,n,s);const x=Math.ceil(14*c);return o.font=`normal ${x}px system-ui,BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif`,o.fillStyle="#3f4d5a",o.fillText(t,Math.ceil(10*c),Math.ceil(25*c)),i.toDataURL()},Gu=l(_.div)`
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

  ${Hu} {
    position: absolute;
    top: 4px;
    right: 28px;
    z-index: 2;
  }
`,Yu=g.memo(({field:t,row:n,index:s,width:i,isOver:o,isCurrentRow:r,isDraggingField:a,dragFieldIndex:c,hoverPosition:u})=>{const p=H(),[x,f]=g.useState(!1),{isDragging:b,drag:j,preview:y}=iy(t,s),w=sy({width:i,isDragging:b,isOver:o,isCurrentRow:r,isDraggingField:a,dragFieldIndex:c,index:s,hoverPosition:u}),v=I.limitations.can("layout.fields.clone");return e.jsxs(e.Fragment,{children:[e.jsx(Q1,{connect:y,src:oy(t.properties?.label)}),e.jsxs(Gu,{onMouseEnter:()=>f(!0),onMouseLeave:()=>f(!1),ref:$=>{j($)},style:w,children:[v&&e.jsx(zj,{active:x,onClick:()=>{p(ye.unfocus()),p(Oe.duplicate(t,n))}}),e.jsx(Nn,{active:x,onClick:()=>{p(ye.unfocus()),p(Oe.remove(t))}}),e.jsx(ty,{field:t})]})]})});Yu.displayName="Field";const ry=l(_.div)`
  position: absolute;
  top: 0;
  bottom: 0;

  pointer-events: none;
  user-select: none;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${S.md};
`,ay=({isActive:t,hoverPosition:n=0,fieldWidth:s=1e3})=>{const i=Y({opacity:t?1:0,x:n*s,scale:t?1:0,width:s,config:{tension:700,mass:.5}});return e.jsx(ry,{style:i})},ly=t=>Y({to:{height:t?30:20,opacity:t?1:0,transform:t?"scaleY(1)":"scaleY(0)"},delay:t?200:0,config:{tension:500}}),cy=t=>Y({to:{y:t?20:0},delay:t?200:0,config:{tension:300}}),dy=t=>{const n=H(),[{isOver:s,canDrop:i},o]=ss(()=>({accept:[te.FieldType,te.Field],collect:r=>({isOver:r.isOver({shallow:!0}),canDrop:r.canDrop()}),canDrop:(r,a)=>a.isOver({shallow:!0}),drop:r=>{r.type===te.Field&&n(Oe.move.existingField.newRow({layoutUid:t.layoutUid,field:r.data,order:t.order})),r.type===te.FieldType&&n(Oe.move.newField.newRow({fieldType:r.data,row:t}))}}),[t]);return{ref:o,isOver:s,canDrop:i}},uy=(t,n,s,i,o)=>{const r=H(),[a,c]=g.useState(),[u,p]=g.useState(),[{isOver:x,isCurrentRow:f,dragFieldIndex:b,isDraggingField:j,canDrop:y},w]=ss({accept:[te.Field,te.FieldType],collect:v=>{const $=v.getItem(),C=$?.type===te.Field,F=$?.type===te.Field&&$.data.rowUid===n.uid;return{isOver:v.isOver({shallow:!0}),canDrop:v.canDrop(),dragFieldIndex:$?.type===te.Field?$.index:void 0,isCurrentRow:F,isDraggingField:C}},canDrop:(v,$)=>$.isOver({shallow:!0}),hover:(v,$)=>{if(i===void 0||o===void 0)return;const C=v.type===te.Field&&v.data.rowUid===n.uid,F=s+(C?0:1);if(F<=1)return;const M=$.getClientOffset().x-o,z=Math.floor(M/(i/F));u!==z&&p(z)},drop:v=>{v.type===te.Field?r(Oe.move.existingField.existingRow(v.data,n,u)):v.type===te.FieldType&&r(Oe.move.newField.existingRow({fieldType:v.data,row:n,order:u})),p(void 0)}},[t,n,s,u,i]);return g.useEffect(()=>{let v=s;x&&!f&&(v+=1),c(i/Math.max(1,v))},[x,s,i,f]),{ref:w,isOver:x,isCurrentRow:f,isDraggingField:j,canDrop:y,hoverPosition:u,fieldWidth:a,dragFieldIndex:b}},py="72px",Ju=l(_.div)`
  position: relative;

  min-height: 1px;
  margin: 0 -${m.lg};

  background-color: #f3f7fc00;
  border: 1px solid transparent;

  transition: all 0.2s ease-out;
  transform-origin: 50% 0%;
`,Zu=l(_.div)`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: row;
  align-items: stretch;
`,hy=l.div`
  position: absolute;
  left: ${m.sm};
  right: ${m.sm};
  top: -10px;

  z-index: 4;

  height: 20px;
`,xy=l(_.div)`
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

  min-height: ${py};
  flex-grow: 1;
  flex-shrink: 0;
`;const Sr=g.memo(({row:t})=>{const n=P(Ae.inRow(t)),{ref:s,dimensions:i}=Ej(),o=i.width,r=i.x,{ref:a,isOver:c}=dy(t),u=ly(c),p=cy(c),{ref:x,isOver:f,isCurrentRow:b,isDraggingField:j,dragFieldIndex:y,hoverPosition:w,fieldWidth:v}=uy(s,t,n.length,o,r),$=x(s);return e.jsxs(Ju,{ref:$,children:[e.jsx(hy,{ref:C=>{a(C)},children:e.jsx(xy,{style:u})}),e.jsxs(Zu,{style:p,children:[e.jsx(ay,{isActive:f,hoverPosition:w,fieldWidth:v}),n.map((C,F)=>e.jsx(Yu,{field:C,row:t,isOver:f,hoverPosition:w,isCurrentRow:b,isDraggingField:j,dragFieldIndex:y,index:F,width:v||o},C.uid))]})]})});Sr.displayName="Row";const Lr=l.div`
  position: relative;

  display: flex;
  flex-direction: column;

  margin: 0 -18px;
`,my=l(_.div)`
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
`,gy=l.div`
  padding: ${m.sm} ${m.lg};

  color: ${h.gray300};
  font-size: 18px;
  text-align: left;
`,fy=({layout:t})=>{const n=Pt(o=>ns.inLayout(o,t?.uid)),{dropRef:s,placeholderAnimation:i}=qu(t);return e.jsxs(Lr,{ref:o=>{s(o)},className:"field-layout",children:[!n.length&&e.jsx(gy,{children:d("Drag or click fields to add them to the layout")}),n.map(o=>e.jsx(Sr,{row:o},o.uid)),e.jsx(my,{style:i,children:d("+ insert row")})]})},by=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})}),Xu=t=>{const s=(t.buttons?.layout||"save back|submit").split(" "),i=[];return s.forEach(o=>{const r=o.split("|"),a=[];r.forEach(c=>{if(!(c==="back"&&t.order===0))switch(c){case"submit":a.push({handle:"submit",label:t.buttons.submitLabel,enabled:!0,assetId:t.buttons.submitIcon?.[0]||void 0,iconPosition:t.buttons.submitIconPosition||"left"});break;case"back":t.buttons.back&&a.push({handle:"back",label:t.buttons.backLabel,enabled:t.buttons.back,assetId:t.buttons.backIcon?.[0]||void 0,iconPosition:t.buttons.backIconPosition||"left"});break;case"save":t.buttons.save&&a.push({handle:"save",label:t.buttons.saveLabel,enabled:t.buttons.save,assetId:t.buttons.saveIcon?.[0]||void 0,iconPosition:t.buttons.saveIconPosition||"left"});break;default:return}}),i.push(a)}),i},ep=l.div`
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
`,tp=l.button`
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
`,jy={back:"btn",save:"btn",submit:"btn btn-submit"},yy=({page:t})=>{const n=H(),{getTranslation:s}=Ce(t),{active:i,type:o,uid:r}=P(Ot.focus),a=g.useMemo(()=>i&&o===Yn.Page&&r===t.uid,[i,o,r,t.uid]),c=Xu(t),u=c.flat().map(b=>b.assetId).filter(Boolean),{data:p,isFetching:x}=fr(u,""),f=g.useCallback(b=>{const j=p?.[b]?.src;return x?e.jsx(by,{}):e.jsx("img",{src:j,alt:`${b}Alt`})},[p,x]);return e.jsx(Lr,{children:e.jsx(ep,{className:E(a&&"active"),onClick:()=>{n(ye.setFocusedItem({type:Yn.Page,uid:t.uid}))},children:c.map((b,j)=>e.jsx(So,{className:"page-buttons",children:b.map(({handle:y,label:w,iconPosition:v,assetId:$},C)=>e.jsxs(tp,{className:jy[y],type:"button",children:[$&&v==="left"&&f($),s(`${y}Label`,w),$&&v==="right"&&f($)]},C))},j))})})},np=l.div`
  display: flex;
  flex: 1 0;
  flex-direction: column;
  gap: ${m.md};

  padding: ${m.sm} ${m.xl} ${m.xl};

  overflow-y: auto;
  overflow-x: hidden;
  ${Q};
`,vy=({page:t})=>{const n=Pt(s=>bt.pageLayout(s,t?.layoutUid));return e.jsxs(np,{children:[n&&e.jsx(fy,{layout:n}),e.jsx(yy,{page:t})]})},sp=l.div`
  margin: 10px 15px;
`,ip=l.div`
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
`,op=()=>(t,n)=>{const s=G(),i=G(),o=n(),r=o.layout.pages.length,a=r+1,c=o.layout.pages?.[r-1];t(Cn.add({uid:i})),t(kn.add({uid:s,label:d("Page {number}",{number:a}),layoutUid:i,buttons:c?.buttons??{layout:"save back|submit",attributes:{container:{},column:{},submit:{},back:{},save:{}},submitLabel:d("Submit"),submitIcon:[],submitIconPosition:"left",back:!0,backLabel:d("Back"),backIcon:[],backIconPosition:"left",save:!1,saveLabel:d("Save"),saveIcon:[],saveIconPosition:"left"}})),t(ye.setPage(s))},wy=(t,n)=>(s,i)=>{const{layoutUid:o}=n,r=G();s(Ze.add({layoutUid:o,uid:r})),s(be.moveTo({uid:t.uid,rowUid:r,position:0})),ii(i(),s)},$y=t=>(n,s)=>{const{uid:i,layoutUid:o}=t,r=s();if(!r.layout.layouts.find(u=>u.uid===o))return;const c=r.layout.pages.find(u=>u.uid!==i);n(ye.unfocus()),n(ye.setPage(c.uid)),r.layout.rows.filter(u=>u.layoutUid===o).forEach(u=>{const p=[];r.layout.fields.filter(x=>x.rowUid===u.uid).forEach(x=>{p.push(x.uid)}),n(be.removeBatch(p)),n(Ze.remove(u.uid))}),n(Cn.remove(o)),n(kn.remove(i))},Cy=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 4.5v15m7.5-7.5h-15"})}),ky=l.button`
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
`,Sy=()=>{const t=H();return e.jsx(ky,{className:"new-page-tab",onClick:()=>{t(op())},children:e.jsx(Cy,{})})},Ly=(t,n)=>{const s=H(),{dragOff:i}=ai(),[{canDrop:o},r]=ss({accept:[te.Field],canDrop:(a,c)=>c.isOver({shallow:!0}),collect:a=>({canDrop:a.canDrop()&&t!==n.uid}),drop:a=>{a.type===te.Field&&(s(wy(a.data,n)),i())}});return{ref:r,canDrop:o}},Lo=l(_.div)`
  position: relative;
`,Fy=l.button`
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
`,Ey=l.div`
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

    ${Fy} {
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
`;const Ty=l.input`
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
`,Ny=l.div`
  position: absolute;
  top: 0px;
  right: -7px;

  transform: scale(0.8);
`,zy=({page:t,index:n})=>{const s=P(Ot.currentPage),i=P(et.count),o=H(),{willTranslate:r,updateTranslation:a,getTranslation:c,hasTranslation:u,removeTranslation:p}=Ce(t),x=P(Ot.hasErrors(t.uid)),f=g.useRef(null),b=g.useRef(null),[j,y]=g.useState(!1),w=Ct(f),{canDrop:v,ref:$}=Ly(s?.uid,t);g.useEffect(()=>{j&&(b.current?.focus(),b.current?.select())},[j]);const C=()=>{const z=b.current.value||t.label;a("label",z)||o(kn.updateLabel({uid:t.uid,label:z}))},F=z=>{z.key==="Enter"&&(C(),y(!1)),z.key==="Escape"&&y(!1)},N=$t({callback:()=>{C(),y(!1)},isEnabled:j}),M=$(f);return e.jsx(Lo,{ref:M,className:"page-tab sortable-page-tab","data-page-index":n,children:e.jsxs(Fo,{ref:N,className:E(s?.uid===t.uid&&"active",x&&"errors",v&&"can-drop",j&&"is-editing"),onClick:()=>{o(ye.setPage(t.uid))},onDoubleClick:()=>y(!0),children:[j?e.jsx(Ty,{type:"text",ref:b,className:"text small",placeholder:t.label,defaultValue:c("label",t.label),onKeyUp:F}):e.jsxs(Ey,{children:[e.jsx("span",{children:c("label",t.label)}),r("label")&&e.jsx(fd,{className:E(u("label")&&"active"),onClick:()=>{u("label")&&confirm("Are you sure you want to remove the translation?")&&p("label")},children:e.jsx(yd,{})})]}),i>1&&e.jsx(Ny,{children:e.jsx(Nn,{active:w&&!j,onClick:()=>{confirm(d("Are you sure?"))&&o($y(t))}})})]})})},My=()=>{const t=H(),n=P(et.all),s=g.useRef(null),i=I.editions.isAtLeast(re.Lite)&&I.limitations.can("layout.multiPageForms");return g.useEffect(()=>{if(!s.current)return;const o=Ne.create(s.current,{animation:150,ghostClass:"sortable-ghost",draggable:".sortable-page-tab",onEnd:r=>{if(r.oldDraggableIndex===void 0||r.newDraggableIndex===void 0||r.oldDraggableIndex===r.newDraggableIndex)return;const a=n[r.oldDraggableIndex];a&&t(kn.moveTo({uid:a.uid,order:r.newDraggableIndex}))}});return()=>{o.destroy()}},[t,n]),e.jsx(sp,{children:e.jsxs(ip,{ref:s,children:[n.map((o,r)=>e.jsx(zy,{index:r,page:o},o.uid)),i&&e.jsx(Sy,{})]})})},Iy=()=>{const t=P(Ot.currentPage);return e.jsxs(Uu,{children:[e.jsx(My,{}),t&&e.jsx(vy,{page:t})]})},Fr=l.div`
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
`,Ay=l.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`,Ry=l.div`
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
`,Py=l(_.div)`
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
`,Dy=l.div`
  color: white;
  background: red;
  border: 1px solid darkred;
`,li=({children:t})=>e.jsx(Dy,{children:t}),rp={all:["groups"]},ap=({select:t}={})=>B({queryKey:rp.all,queryFn:()=>T.get("/api/fields/types/groups").then(n=>n.data),staleTime:1/0,select:t}),Er=t=>e.jsx(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h15v15h-15z"}),e.jsx("path",{d:"m6.875 2.5h-2.625c-1.05 0-1.575 0-1.976.205-.353.179-.64.466-.82.819-.204.401-.204.926-.204 1.976v5.25c0 1.05 0 1.575.204 1.976.18.353.467.64.82.82.401.204.926.204 1.976.204h5.25c1.05 0 1.575 0 1.976-.204.353-.18.64-.467.82-.82.204-.401.204-.926.204-1.976v-2.625m-7.5 1.875h1.047c.305 0 .458 0 .602-.034.128-.031.249-.082.361-.15.126-.077.235-.185.451-.402l5.977-5.976c.517-.518.517-1.358 0-1.875-.518-.518-1.358-.518-1.876 0l-5.976 5.976c-.216.217-.325.325-.402.451-.068.112-.119.234-.149.361-.035.144-.035.297-.035.603z",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]})}),lp=l.div`
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
`,cp=({title:t,disabled:n,button:s,minEdition:i,children:o})=>{const{editions:r}=I,a=i!==void 0?r.isAtLeast(i):!0;return e.jsxs(lp,{className:E(n&&"disabled"),children:[e.jsxs(Tr,{children:[t,s&&a&&e.jsx("button",{type:"button",title:s.title,onClick:s.onClick,children:s.icon})]}),o]})},By=()=>e.jsx(Fr,{children:e.jsxs(Qt,{children:[e.jsx(k,{width:18,height:18,borderRadius:"50%",style:{position:"relative",top:-2}}),e.jsx(k,{width:50,style:{position:"relative",top:-1}})]})}),Nr=({words:t,items:n})=>e.jsxs(lp,{children:[e.jsx(Tr,{children:t.map((s,i)=>e.jsx(k,{width:s,height:16,inline:!0,style:{marginRight:8}},i))}),e.jsx(ci,{children:ts(n).map(s=>e.jsx(By,{},s))})]}),di={query:t=>n=>n.search[t]},Oy=()=>{const t=P(di.query(Sn.Fields));return g.useCallback(n=>{if(!t)return n;const s=n.types?.filter(o=>o.toLowerCase().includes(t.toLowerCase())),i=n.groups.grouped.map(o=>({...o,types:o.types.filter(r=>r.toLowerCase().includes(t.toLowerCase()))})).filter(o=>o.types.length>0);return{types:s||[],groups:{...n.groups,grouped:i||[]}}},[t])},_y=()=>{const t=P(di.query(Sn.Fields));return g.useCallback(n=>t?n.filter(s=>s.label.toLowerCase().includes(t.toLowerCase())):n,[t])},Wy=()=>{const t=P(di.query(Sn.Fields));return g.useCallback(n=>t?n.map(s=>({...s,fields:s.fields.filter(i=>i.label.toLowerCase().includes(t.toLowerCase()))})).filter(s=>s.fields.length>0):n,[t])},Uy=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  margin-bottom: ${m.md};

  svg {
    fill: ${({color:t})=>t||h.black};
  }
`,Hy=l.div`
  text-transform: uppercase;
  font-size: 10px;
`,zr=({icon:t,label:n,dragRef:s,onClick:i})=>e.jsxs(Fr,{ref:o=>{s&&s(o)},onClick:i,title:n,children:[e.jsx(Ry,{dangerouslySetInnerHTML:{__html:t}}),e.jsx(Ay,{dangerouslySetInnerHTML:{__html:n}})]}),Mr=t=>{const{dragOn:n,dragOff:s}=ai(),[{isDragging:i},o]=qo(()=>({type:te.FieldType,collect:r=>({isDragging:r.isDragging()}),item:{type:te.FieldType,data:t}}));return g.useEffect(()=>{i?n(te.FieldType):s()},[i,n,s]),{ref:o}},qy=({fieldType:t})=>{const{icon:n,name:s}=t,i=H(),{ref:o}=Mr(t),r=()=>{i(Oe.move.newField.newRow({fieldType:t}))};return e.jsx(zr,{icon:n,label:d(s),onClick:r,dragRef:o})},Qy=(t={})=>{const n=ee(),s=t?.onSuccess;return t.onSuccess=(i,o,r,a)=>{s?.(i,o,r,a),n.invalidateQueries({queryKey:rp.all})},ce({...t,mutationFn:i=>T.post("/api/fields/types/groups",i)})},Ir=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m7.5 9.61c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m3.57 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m11.43 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m7.5 1.75c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"})]}),Ky=l.div`
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
`,Vy=l.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`,Gy=l.div`
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
`,Yy=l.div`
  color: ${h.gray500};
  margin-right: ${m.xs};
`,Wi=({typeClass:t})=>{const n=Me(t),s=g.useRef(null),i=Ct(s);if(!n)return null;const{name:o,icon:r}=n;return e.jsxs(Ky,{"data-id":t,ref:s,title:o,children:[e.jsx(Gy,{dangerouslySetInnerHTML:{__html:O.sanitize(r)}}),e.jsx(Vy,{children:o}),i&&e.jsx(Yy,{className:"remove field-item-remove",children:e.jsx(dt,{})})]})},Jy=()=>`#${(Math.floor(Math.random()*16777215)+16777216).toString(16).slice(1)}`,Zy=(t,n,s)=>{const i=g.useCallback(()=>{n(a=>({...a,groups:{...a.groups,grouped:[...a.groups.grouped,{uid:G(),label:"",color:Jy(),types:[]}]}}))},[n]),o=g.useCallback((a,c,u)=>{n(p=>({...p,groups:{...p.groups,grouped:p.groups.grouped.map(x=>x.uid===u?{...x,[a]:c}:x)}}))},[n]),r=g.useCallback(()=>{const a=Ne.get(s.current.hidden).toArray(),u=Ne.get(s.current.groupWrapper).toArray().map(p=>({...t.groups.grouped.find(f=>f.uid===p),types:Ne.get(s.current[p]).toArray()}));return{hidden:a,grouped:u}},[s,t]);return{addGroup:i,updateGroupInfo:o,syncFromRefs:r}},Xy=l.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--gray-050);
  height: 600px;
`,e7=l.div`
  position: relative;
  background-color: ${h.white};
  padding: ${m.md};
  border-radius: ${S.md};
  border: 1px solid ${h.hairline};
  display: flex;
  gap: ${m.md};
`,dp=l.div`
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
`;dp.defaultProps={$empty:"Click the 'Add Group' button on the right to begin."};const t7=l.div`
  flex: 1;
`,n7=l.div`
  display: flex;
  align-items: flex-start;
  padding-bottom: ${m.lg};
  gap: ${m.lg};
`,up=l.div`
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
`;up.defaultProps={$empty:"Drag and drop any field here",color:h.black};const s7=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
`,i7=l.div`
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
`;Eo.defaultProps={$empty:"Drag and drop any field here"};const o7=l.div`
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
`,r7=l.button`
  appearance: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${h.gray100};
  cursor: pointer;
  background-color: ${({color:t})=>t||h.black};
  position: relative;
`,a7=l.div`
  position: relative;
  flex: 0 0 auto;
`,l7=l.div`
  position: absolute;
  top: -6px;
  left: calc(100% + ${m.sm});
  z-index: 10;
  padding: ${m.sm};
  border: 1px solid ${h.gray100};
  border-radius: ${S.md};
  background: ${h.white};
  box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
`,c7=l.div`
  color: ${h.warning};
`,$l=(t,n)=>n.options.handle!==".handle",d7=t=>{const n=(i,o)=>{const r=t.current[i];r&&Ne.create(r,o)};Object.entries({unassigned:{group:{name:"shared",put:$l},animation:150,sort:!1},hidden:{group:{name:"shared",put:$l},animation:150,sort:!0,filter:".field-item-remove",onFilter:o=>t.current.unassigned.appendChild(o.item)},groupWrapper:{handle:".handle",filter:".group-remove",sort:!0,animation:150,onFilter:o=>{const r=Array.from(t.current[o.item.dataset.id].children);t.current.unassigned.append(...r),o.item.remove()}}}).forEach(([o,r])=>{n(o,r)})},u7=(t,n,s)=>{t&&(Ne.create(t,{animation:150,group:{name:`group-${n}`,put:(i,o)=>o.options.handle!==".handle"},sort:!0,filter:".field-item-remove",onFilter:i=>s.current.unassigned.appendChild(i.item)}),s.current[n]=t)},p7=({color:t,onChange:n})=>{const[s,i]=g.useState(!1),o=$t({callback:()=>i(!1),isEnabled:s});return e.jsxs(a7,{ref:o,children:[e.jsx(r7,{type:"button",color:t,"aria-expanded":s,"aria-label":d("Select Color"),onClick:()=>i(r=>!r)}),s&&e.jsx(l7,{children:e.jsx(cu,{value:t,onChange:n})})]})},h7=({closeModal:t})=>{const[n,s]=g.useState({}),[i,o]=g.useState(),[r,a]=g.useState(!1),c=g.useRef({}),{addGroup:u,updateGroupInfo:p,syncFromRefs:x}=Zy(n,s,c),{data:f}=ap();g.useEffect(()=>{f&&!r&&(s(f),a(!0))},[f,r]),g.useEffect(()=>{d7(c)},[]);const b=Qy({onSuccess:()=>{t()},onError:y=>{o(y.errors)}}),j=b.isPending;return e.jsxs(ve,{style:{maxWidth:"70%"},children:[e.jsx(we,{children:e.jsx("h1",{children:d("Field Type Manager")})}),e.jsxs(Xy,{children:[e.jsxs(dp,{ref:y=>{c.current.groupWrapper=y},$empty:d("Click the 'Add Group' button on the right to begin."),children:[i?.length&&e.jsx(c7,{children:d("Something went wrong!")}),n.groups?.grouped?.map(y=>e.jsxs(e7,{"data-id":y.uid,children:[e.jsxs(t7,{children:[e.jsxs(n7,{children:[e.jsx(p7,{color:y.color,onChange:w=>p("color",w,y.uid)}),e.jsx(je,{value:y.label,property:{type:K.Label,handle:y.uid},updateValue:w=>p("label",w,y.uid)})]}),e.jsx(up,{$empty:d("Drag and drop any field here"),ref:w=>{u7(w,y.uid,c)},color:y.color,children:y.types?.map(w=>e.jsx(Wi,{typeClass:w},w))})]}),e.jsxs(s7,{children:[e.jsx("button",{type:"button",className:"group-remove",children:e.jsx(dt,{})}),e.jsx("button",{type:"button",className:"handle",children:e.jsx(Ir,{})})]})]},y.uid))]}),e.jsxs(i7,{children:[e.jsx("button",{onClick:u,type:"button",className:"btn add icon dashed",children:d("Add Group")}),e.jsxs(o7,{children:[e.jsxs(wl,{className:"unassigned",children:[e.jsx("h3",{children:d("Unassigned")}),e.jsx(Eo,{$empty:d("Drag and drop any fields here. Unassigned fields will display at the bottom of the list of field types."),ref:y=>{c.current.unassigned=y},children:n.types?.map(y=>e.jsx(Wi,{typeClass:y},y))})]}),e.jsxs(wl,{children:[e.jsx("h3",{children:d("Hidden")}),e.jsx(Eo,{$empty:d("Drag and drop any fields here to hide them."),ref:y=>{c.current.hidden=y},children:n.groups?.hidden?.map(y=>e.jsx(Wi,{typeClass:y},y))})]})]})]})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn",onClick:t,disabled:j,children:d("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(Z,{loadingText:d("Saving"),loading:j,onClick:()=>b.mutate(x()),spinner:!0,children:d("Save")})})]})]})},x7=()=>{const{openModal:t}=Ke();return()=>{t(h7)}},m7=d("Field Types"),Cl=({group:t})=>{const n=Yt(),s=t.types.map(i=>{const o=n(i);return o?.visible?o&&e.jsx(qy,{fieldType:o},i):null}).filter(Boolean);return s.length?e.jsxs(Uy,{color:t.color,children:[t.label&&e.jsx(Hy,{children:d(t.label)}),e.jsx(ci,{children:s})]},t.uid):null},g7=()=>{const t=Oy(),{data:n,isFetching:s,isError:i,error:o}=ap({select:t}),r=x7();return!n&&s?e.jsx(Nr,{words:[50,70],items:16}):i?e.jsx(li,{children:o.message}):e.jsxs(cp,{button:I.limitations.can("layout.fieldManager")&&{icon:e.jsx(Er,{}),title:d("Edit Manager"),onClick:r},minEdition:re.Lite,title:d(m7),children:[n.groups.grouped?.map(a=>e.jsx(Cl,{group:a},a.uid)),n?.types&&e.jsx(Cl,{group:{uid:"external",types:n.types}})]})},ui={all:["field-favorites"]},pp=({select:t}={})=>B({queryKey:ui.all,queryFn:()=>T.get("/api/fields/favorites").then(n=>n.data),staleTime:1/0,select:t}),f7=(t,n)=>{const s=Mt(n);return Object.entries(t.properties).forEach(([i,o])=>{const r=s?.properties?.find(a=>a.handle===i);r&&(r.value=o)}),s},b7=({favorite:t})=>{const{typeClass:n,label:s}=t,i=Me(n),o=f7(t,i),r=H(),{ref:a}=Mr(o);if(!i||!o)return null;const{icon:c}=i,u=()=>{r(Oe.move.newField.newRow({fieldType:o}))};return e.jsx(zr,{icon:c,label:s,onClick:u,dragRef:a})},j7=({label:t,field:n,type:s})=>{const i={label:t,properties:n.properties,typeClass:s.typeClass};return T.post("/api/fields/favorites",i)},y7=()=>{const t=ee();return ce({mutationFn:j7,onSuccess:()=>{t.invalidateQueries({queryKey:ui.all})}})},v7=(t={})=>{const n=ee(),s=t?.onSuccess;return t.onSuccess=(i,o,r,a)=>{s?.(i,o,r,a),n.invalidateQueries({queryKey:ui.all})},ce({...t,mutationFn:i=>T.post("/api/fields/favorites/update",i)})},w7=(t={})=>{const n=ee(),s=t?.onSuccess;return t.onSuccess=(i,o,r,a)=>{s?.(i,o,r,a);const c=o;n.setQueryData(ui.all,u=>u.filter(p=>p.id!==c))},ce({...t,mutationFn:i=>T.post("/api/fields/favorites/delete",{id:i})})},$7=t=>t?typeof t=="string"?e.jsx(Us,{dangerouslySetInnerHTML:{__html:O.sanitize(t)}}):e.jsx(Us,{children:t}):null,Ar=({label:t,icon:n,children:s})=>e.jsxs(zx,{children:[e.jsx(Xo,{"data-label":t,children:s}),$7(n)]}),C7=({property:t,siblingProperties:n,state:s,errors:i,updateValueCallback:o})=>{const r=vs(n,s,o);return e.jsx(je,{value:s?.[t.handle]||"",property:t,updateValue:r(t),errors:i,context:{properties:s}})},k7=t=>n=>n.section===t,S7=({field:t,errors:n,values:s,updateValueCallback:i})=>{const{data:o}=nr(),r=Me(t?.typeClass);if(!t||!r||!o)return null;const a=[],c=s?.label||d(r.name);return o.sort((u,p)=>u.order-p.order).forEach(({handle:u,label:p,icon:x})=>{const f=r.properties.filter(k7(u));f.length&&a.push(e.jsx(Ar,{label:d(p),icon:x,children:f.map(b=>e.jsx(C7,{errors:n?.[b.handle],state:s,siblingProperties:r.properties,property:b,updateValueCallback:i},b.handle))},u))}),e.jsxs(e.Fragment,{children:[e.jsxs(gn,{children:[e.jsx(Jn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})]}),e.jsx($d,{size:"small",children:e.jsx(lr,{children:a})})]})},L7=l.div`
  display: flex;
  justify-content: space-between;

  height: 600px;
`,Es=22,F7=l.div`
  flex: 1;

  height: 100%;
  padding: 0 ${m.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};

  ${gn} {
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
`,E7=l.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;

  padding: ${m.sm};

  overflow-y: auto;
  overflow-x: hidden;

  background: ${h.gray050};
  box-shadow: ${ae.right};

  ${Q};
`,T7=l.li`
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
`,N7=l.div`
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
`;const z7=({favorite:t,label:n,errors:s,isActive:i,onClick:o,onDelete:r})=>{const a=g.useRef(null),c=Ct(a),u=Me(t.typeClass);if(!u)return null;const p=s?.length;return e.jsxs(T7,{ref:a,onClick:o,className:E(i&&"active",p&&"errors"),children:[e.jsx(N7,{dangerouslySetInnerHTML:{__html:O.sanitize(u.icon)}}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(n)}}),e.jsx(Nn,{active:c,onClick:r})]},t.id)},M7=({closeModal:t})=>{const{data:n}=pp(),[s,i]=g.useState(),[o,r]=g.useState({}),[a,c]=g.useState(),[u,p]=g.useState(!1),x=v7({onSuccess:()=>{t()},onError:j=>{c(j.errors)}}),f=w7({onSuccess:(j,y)=>{const w=n.filter(v=>v.id!==y)?.at(0);w?i(w):t()}});g.useEffect(()=>{if(!n||u)return;p(!0),i(n?.[0]);const j={};n.forEach(y=>{j[y.id]=y.properties}),r(j)},[n,u]);const b=x.isPending||f.isPending;return e.jsxs(ve,{style:{maxWidth:"70%"},children:[e.jsx(we,{children:e.jsx("h1",{children:d("Favorite Fields")})}),e.jsxs(L7,{children:[e.jsx(E7,{children:n.map(j=>e.jsx(z7,{favorite:j,label:o?.[j.id]?.label||j.label,errors:a?.[j.id],isActive:s?.id===j.id,onClick:()=>i(j),onDelete:()=>{confirm(`Are you sure you wish to delete the "${j.label}" field?`)&&f.mutate(j.id)}},j.id))}),e.jsx(F7,{children:s&&e.jsx(S7,{field:s,values:o?.[s.id],errors:a?.[s.id],updateValueCallback:(j,y)=>{r(w=>({...w,[s.id]:{...w[s.id],[j]:y}}))}})})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn",onClick:t,disabled:b,children:d("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",disabled:b,onClick:()=>x.mutate(o),children:e.jsx(Z,{loadingText:d("Saving"),loading:b,spinner:!0,children:d("Save")})})]})]})},I7=()=>{const{openModal:t}=Ke();return()=>{t(M7)}},A7=d("Favorites"),R7=()=>{const t=_y(),{data:n,isFetching:s,isError:i,error:o}=pp({select:t}),r=I7(),a=Yt();return!n&&s?e.jsx(Nr,{words:[60],items:2}):i?e.jsx(li,{children:o.message}):n.length?e.jsx(cp,{title:d(A7),button:I.limitations.can("layout.favoritesManager")&&{icon:e.jsx(Er,{}),title:d("Edit Favorites"),onClick:r},children:e.jsx(ci,{children:n.map(c=>{const u=a(c.typeClass);return!u||!u?.visible?null:e.jsx(b7,{favorite:c},c.id)})})}):null},P7={all:["field-forms"]},D7=({select:t})=>B({queryKey:P7.all,queryFn:()=>T.get("/api/fields/forms").then(n=>n.data),staleTime:1/0,select:t}),B7=t=>e.jsx(R,{height:"1em",viewBox:"0 0 320 512",...t,children:e.jsx("path",{d:"M305 239c9.4 9.4 9.4 24.6 0 33.9L113 465c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l175-175L79 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L305 239z"})}),O7=(t,n)=>{const s=Mt(n);return Object.entries(t.properties).forEach(([i,o])=>{const r=s?.properties?.find(a=>a.handle===i);r&&(r.value=o)}),s},_7=({field:t})=>{const{typeClass:n,label:s}=t,i=Me(n),o=O7(t,i),r=H(),{ref:a}=Mr(o);if(!i)return null;const{icon:c}=i,u=()=>{r(Oe.move.newField.newRow({fieldType:o}))};return e.jsx(zr,{icon:c,label:s,onClick:u,dragRef:a})},W7=t=>Y({maxHeight:t?200:0,paddingTop:t?8:0,paddingBottom:t?8:0,config:{tension:500,friction:t?26:40}}),U7=l.div`
  cursor: pointer;
  position: relative;

  padding: ${m.sm} ${m.xl} ${m.sm} ${m.sm};
  background: ${h.elements.dropdown};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  user-select: none;
`,H7=l(_.div)`
  max-height: 0px;
  padding: ${m.sm};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Ts=12,hp=l.div`
  position: absolute;
  right: 10px;
  top: calc(50% - ${Ts/2}px);

  height: ${Ts}px;
  width: ${Ts}px;
  font-size: ${Ts}px;

  transform: rotate(90deg);
  transform-origin: center;
  transition: transform 0.2s ${Ko.easeOut};
`,q7=l.div`
  border: 1px solid ${h.elements.dropdown};
  border-radius: ${S.md};

  margin: 0 -8px;

  &.open {
    ${hp} {
      transform: rotate(180deg);
    }
  }
`,Q7=({form:t})=>{const[n,s]=g.useState(!1),i=P(di.query(Sn.Fields)),o=Yt(),r=n||i.length>0,a=W7(r);return t.fields.length?e.jsxs(q7,{className:E(r&&"open"),children:[e.jsxs(U7,{onClick:()=>s(!n),children:[t.name,e.jsx(hp,{children:e.jsx(B7,{})})]}),e.jsx(H7,{style:a,children:e.jsx(ci,{children:t.fields.map(c=>{const u=o(c.typeClass);return!u||!u?.visible?null:e.jsx(_7,{field:c},c.id)})})})]}):null},K7=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
`,V7=()=>{const{uid:t}=P(Pe.current),n=Wy(),{data:s,isFetching:i,isError:o,error:r}=D7({select:n});if(!s&&i)return null;if(o)return e.jsx(li,{children:r.message});if(!s||!s.length)return null;const a=s.filter(u=>u.uid!==t).sort((u,p)=>u.name.localeCompare(p.name)),c=a.some(u=>u.fields.length>0);return!a.length||!c?null:e.jsxs(K7,{children:[e.jsx(Tr,{children:d("Fields from other Forms")}),a.map(u=>e.jsx(Q7,{form:u},u.uid))]})},G7=()=>{const t=qt(),[n,s]=g.useState(""),i=xs(n,1e3);return g.useEffect(()=>{t(Eh.update({type:Sn.Fields,query:i}))},[i,t]),[n,s]},xp=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{fill:"currentColor",d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"})}),mp=l.div`
  position: relative;
  z-index: 1;

  margin-bottom: ${m.lg};
`,gp=l.div`
  display: flex;
`,fp=l.input`
  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${h.gray200};
  }
`,kl="14px",Y7=se`
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
`,bp=l.div`
  left: 1px;

  ${Y7}

  color: ${h.gray400};
`,J7=()=>{const[t,n]=G7();return e.jsx(mp,{children:e.jsxs(gp,{children:[e.jsx(bp,{children:e.jsx(xp,{})}),e.jsx(fp,{type:"text",placeholder:d("Search"),className:"fullwidth text",value:t,onChange:s=>{n(s.target.value)}})]})})},Z7=()=>{nr();const t=P(Ae.count),n=I.editions.is(re.Express)&&t>=I.limits.fields;return e.jsxs(Py,{className:E(n&&"fields-disabled"),children:[e.jsx(J7,{}),e.jsx(R7,{}),e.jsx(g7,{}),I.limitations.can("layout.formsFields")&&e.jsx(V7,{})]})},jp=l.div`
  position: relative;
  display: flex;
  gap: 0;

  height: 100%;
  overflow: hidden;

  background: #fff;
`,To=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"})}),X7=t=>e.jsx(R,{viewBox:"0 0 576 512",...t,children:e.jsx("path",{d:"M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9l2.6-2.4C267.2 438.6 256 404.6 256 368c0-97.2 78.8-176 176-176c28.3 0 55 6.7 78.7 18.5c.9-6.5 1.3-13 1.3-19.6v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5zM576 368c0-79.5-64.5-144-144-144s-144 64.5-144 144s64.5 144 144 144s144-64.5 144-144zm-76.7-43.3c6.2 6.2 6.2 16.4 0 22.6l-72 72c-6.2 6.2-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L416 385.4l60.7-60.7c6.2-6.2 16.4-6.2 22.6 0z"})}),ev=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"})}),tv=({category:t,handle:n,error:s})=>{const i=s.errors?.[t]?.[n];return i?e.jsx("ul",{className:"errors",children:i.map((o,r)=>e.jsxs("li",{children:[e.jsx("span",{className:"visually-hidden",children:"Error:"}),o]},r))}):null},nv=l.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: ${m.lg};
`,sv=l.div`
  display: flex;
  justify-content: center;
`,iv=({field:t,type:n,mutation:s})=>{const[i,o]=g.useState("");return g.useEffect(()=>{o(t.properties.label||n?.name),s.reset()},[t.uid,n?.name]),e.jsxs(nv,{children:[e.jsx(ls,{children:e.jsx(Dt,{property:{label:d("Create a favorite"),handle:t.properties?.handle,flags:[],placeholder:t.properties?.label,type:K.String},value:i,updateValue:r=>o(r)})}),e.jsx(sv,{children:e.jsx("button",{type:"button",disabled:s.isPending,className:E("btn fullwidth",!s.isSuccess&&"submit",s.isPending&&"disabled"),onClick:()=>{s.mutate({label:i,field:t,type:n})},children:e.jsx(Z,{spinner:!0,loading:s.isPending,loadingText:"Saving",children:d(s.isSuccess?"Saved!":"Favorite")})})}),s.isError&&e.jsx(tv,{category:"favorites",handle:"name",error:s.error})]})},yp=l(_.div)`
  position: absolute;
  top: 24px;
  right: -16px;

  transform-origin: 90% -20%;
`,ov=l.div`
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
`,rv=l.div`
  position: relative;
  z-index: 1;

  width: 240px;
  padding: ${m.lg};

  background: ${h.gray050};
  border: 1px solid ${h.barelyVisible};
  border-radius: ${S.md};

  box-shadow: 4px 12px 8px rgb(205 216 228 / 80%);
`,av=l(_.button)`
  position: relative;
  z-index: 5;

  width: 20px;
  height: 20px;

  svg {
    fill: ${h.barelyVisible};
  }
`,lv=l.div`
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
    ${yp} {
      pointer-events: none;
    }
  }
`,cv=({field:t})=>{const n=Me(t?.typeClass),s=y7(),[i,o]=g.useState(!1),[r,a]=g.useState(!1);g.useEffect(()=>{o(!1),a(!1),s.reset()},[t?.uid,s.reset]);const c=Y({to:{opacity:i?1:0,scale:i?1:1.1,rotate:i?0:-10},config:{tension:700}}),u=Y({to:{scale:r?1.2:1},config:{tension:600,mass:3}}),p=$t({callback:()=>{o(!1),a(!1)},isEnabled:i});return os(()=>{o(!1),a(!1)},i),!t?.uid||n.type==="group"?null:e.jsxs(lv,{className:E(i&&"active"),ref:p,children:[e.jsxs(av,{style:u,onClick:()=>o(!i),onMouseOver:()=>a(!0),onMouseOut:()=>a(!1),children:[s.isSuccess&&e.jsx(X7,{}),!s.isSuccess&&e.jsx(ev,{})]}),e.jsxs(yp,{style:c,children:[e.jsx(ov,{}),e.jsx(rv,{children:e.jsx(iv,{field:t,type:n,mutation:s})})]})]})},dv=({property:t,field:n,autoFocus:s})=>{const i=H(),o=Me(n.typeClass),{getTranslation:r,updateTranslation:a,canUseTranslationValue:c}=Ce(n),u=P(Ae.one(n.uid)),p={id:u.id,...u?.properties||{}},x=vs(o.properties,p,(j,y)=>{a(j,y)||i(be.edit({uid:n.uid,handle:j,value:y}))}),f=n.properties?.[t.handle],b=r(t.handle,f);return e.jsx(je,{autoFocus:s,value:c(t)?b:f,property:t,updateValue:x(t),errors:n.errors?.[t.handle],context:n})},Ui=l.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  background: ${h.gray050};
`,uv=t=>n=>n.section===t,pv=({uid:t})=>{const n=H(),{data:s,isFetching:i}=nr(),o=P(Ae.one(t)),r=Me(o?.typeClass),a=g.useMemo(()=>{const c=[];return s?.sort((u,p)=>u.order-p.order)?.forEach(({handle:u,label:p,icon:x},f)=>{const b=r?.properties.filter(uv(u)).filter(j=>j.visible);b?.length&&c.push(e.jsx(Ar,{label:d(p),icon:x,children:b.map((j,y)=>e.jsx(dv,{autoFocus:f===0&&y===0,field:o,property:j},j.handle))},u))}),c},[s,r,o]);return!o||!r?e.jsx(Ui,{}):!s&&i?e.jsxs(Ui,{children:[e.jsxs(gn,{children:[e.jsx(Jn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{children:d(r.name)})]}),e.jsx(Zn,{children:e.jsx(k,{})})]}):e.jsxs(Ui,{children:[e.jsx(no,{onClick:()=>n(ye.unfocus()),children:e.jsx(To,{})}),I.limitations.can("layout.favorite")&&e.jsx(cv,{field:o}),e.jsxs(gn,{children:[e.jsx(Jn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{children:d(r.name)})]}),e.jsx(Zn,{children:a})]})},hv=({property:t,page:n})=>{const s=H(),{getTranslation:i,updateTranslation:o}=Ce(n),r=t.handle,a=p=>{o(r,p)||s(kn.editButtons({uid:n.uid,key:r,value:p}))},c=n.buttons?.[r],u=typeof c=="string"?i(r,c):c;return e.jsx(je,{value:u,property:t,updateValue:a,context:n})},Sl=l.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  background: ${h.gray050};
`,xv=t=>n=>n.section===t,mv=({uid:t})=>{const n=H(),s=P(et.one(t)),{data:i,isFetching:o}=gd();if(!i&&o)return e.jsxs(Sl,{children:[e.jsx(no,{onClick:()=>n(ye.unfocus()),children:e.jsx(To,{})}),e.jsx(gn,{children:e.jsx("span",{children:s.label})}),e.jsxs(Zn,{style:{paddingTop:20},children:[e.jsx(k,{height:30}),e.jsx(k,{height:30}),e.jsx(k,{height:30})]})]});if(!s)return null;const r=[];return i.sections.forEach(({handle:a,label:c,icon:u})=>{const p=i.properties.filter(xv(a)).filter(x=>x.visible);p.length&&r.push(e.jsx(Ar,{label:c,icon:u,children:p.map(x=>e.jsx(hv,{page:s,property:x},x.handle))},a))}),e.jsxs(Sl,{children:[e.jsx(no,{onClick:()=>n(ye.unfocus()),children:e.jsx(To,{})}),e.jsx(gn,{children:e.jsx("span",{children:s.label})}),e.jsx(Zn,{children:r})]})},gv=()=>{const t=H(),n=P(Ot.focus),{active:s,type:i}=n;os(()=>t(ye.unfocus()),s);const o=$t({callback:()=>{t(ye.unfocus())},isEnabled:s,excludeClassNames:["field-layout","page-buttons","page-tab","save-button","main-tabs","editable-content","dropdown-rollout","breadcrumbs","tagify__dropdown","tox","elementselectormodal"]}),r=oc(s?[n]:null,{from:{transform:"translate3d(100%, 0, 0)",opacity:1},enter:{transform:"translate3d(0%, 0, 0)",opacity:1,zIndex:2},leave:{transform:"translate3d(-100%, 0, 0)"},config:{tension:500,friction:50}});return e.jsx($d,{size:"small",children:e.jsx(Tx,{$active:s,ref:o,children:e.jsx($r,{message:`Could not load property editor for "${i}" type`,children:r((a,c)=>e.jsxs(Nx,{style:a,children:[!!c&&c.type==="field"&&e.jsx(pv,{uid:c.uid}),!!c&&c.type==="page"&&e.jsx(mv,{uid:c.uid})]}))})})})},fv=()=>{const t=st("");return e.jsxs(Fj,{children:[e.jsx(q,{id:"layout",label:d("Layout"),url:t.pathname}),e.jsxs(jp,{children:[e.jsxs(De,{$noPadding:!0,children:[e.jsx(gv,{}),e.jsx(Z7,{})]}),e.jsx(Iy,{})]})]})},pi=l.div`
  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${m.xl};

  background: ${h.white};
  padding: ${m.xl};

  overflow-y: auto;

  ${Q};
`,vp=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,bv=()=>{const t=st(""),n=yr(),{templates:s}=vr(""),{templates:{canCreate:i,method:o}}=I,r=()=>{n({type:"form"})};return e.jsxs(pi,{children:[e.jsx(q,{id:"notification-manager",label:d("Manager"),url:t.pathname}),e.jsxs(vp,{children:[e.jsx("h1",{children:d("Notification Manager")}),e.jsx(Eu,{children:e.jsx(Co,{value:"",title:d("Form Templates"),templates:s.form,openEditOnClick:!0,onClick:()=>{},canCreate:i&&o!==is.Global,onCreate:r})})]})]})},jv=l.div`
  display: flex;
  height: 100%;
`,yv=(t,n)=>(s,i)=>{const{className:o,properties:r,newInstanceName:a}=t,c={};r.forEach(x=>{c[x.handle]=x.value});const u=In.count.ofType(o)(i()),p=`${a} notification ${u+1}`;s(Rt.add({uid:n,className:o,enabled:!0,...c,name:p}))},vv=t=>n=>{n(Rt.remove(t.uid))},Hi=20,hi=l.div`
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
`,wp=l.div`
  flex-grow: 1;
  max-width: 90%;
  overflow: hidden;

  &:empty:after {
    content: 'No Title';
    color: ${h.gray400};
    font-style: italic;
  }
`,wv=l.div`
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
`,$v=l.button`
  align-self: end;

  &:hover {
    background-color: ${h.gray200};
  }
`,Mo=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  padding: ${m.xs} 0;
`,Cv=l.div`
  padding: 2px;
  margin-left: 12px;

  font-style: italic;
  font-size: 12px;

  color: ${h.gray300};
`,kv=({type:t,children:n})=>{const s=ne(),i=H(),{setLastTab:o}=We("notifications"),{name:r,edition:a}=t,{isAtLeast:c}=I.editions;return c(t.edition)?e.jsxs(No,{children:[e.jsxs(zo,{children:[e.jsx(Ll,{children:d(r)}),e.jsx($v,{type:"button",className:E("btn","add","icon","small","dashed"),onClick:()=>{const u=G();i(yv(t,u)),o(u),s(u)},children:d("New")})]}),e.jsx(Mo,{children:n})]}):e.jsxs(No,{children:[e.jsx(zo,{children:e.jsx(Ll,{children:d(r)})}),e.jsx(Mo,{style:{opacity:.7},children:e.jsxs(Rr,{className:"flex",to:Craft.getCpUrl("plugin-store/freeform"),target:"_blank",children:[e.jsx(hi,{className:E("disabled-icon"),children:e.jsx("i",{className:"fa-thin fa-star-exclamation"})}),e.jsx("span",{className:E("edition-label"),children:d("Upgrade to {edition} to enable.",{edition:dc(a)})})]})})]})},Sv=()=>e.jsx(Mn,{children:e.jsxs(No,{children:[e.jsx(zo,{children:e.jsx(k,{width:50})}),e.jsx(Mo,{style:{padding:14},children:[0,1,2].map(t=>e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[e.jsx(k,{width:20,height:20,circle:!0}),e.jsx("div",{style:{flexGrow:2},children:e.jsx(k,{width:100,style:{top:2}})}),e.jsx(k,{width:10,height:10,circle:!0,style:{top:6}})]},t))})]})}),Lv=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"})}),Fv=({icon:t,notification:{uid:n}})=>{const{setLastTab:s}=We("notifications"),{name:i,enabled:o,errors:r}=P(In.one(n));return e.jsxs(Rr,{onClick:()=>s(n),to:`${n}`,className:E(bn(r)&&"errors",!o&&"inactive"),children:[t&&e.jsx(hi,{dangerouslySetInnerHTML:{__html:O.sanitize(t)}}),e.jsx(wp,{children:i}),e.jsx(wv,{$enabled:o,className:E("status-dot")})]})},Ev=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.sm};
  height: 100%;

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Tv=I.templates.method,Nv=()=>{const t=I.limitations,{formId:n,uid:s}=V(),{pathname:i}=Ht(),o=ne(),{lastTab:r,setLastTab:a}=We("notifications"),{data:c,isFetching:u}=Kc();Yo(n?Number(n):void 0);const p=P(In.all);return g.useEffect(()=>{!s&&!i.endsWith("/manager")&&r&&o(r)},[s,r,o,i]),g.useEffect(()=>{if(!i.endsWith("/manager")&&!s&&!r&&c&&p){const x=p.find(Boolean);x&&(a(x.uid),o(x.uid))}},[s,c,p,r,o,i,a]),!c&&u?e.jsx(De,{children:e.jsx(Sv,{})}):!c&&!u?e.jsx(e.Fragment,{children:"Empty"}):e.jsx(De,{$lean:!0,children:e.jsxs(Ev,{children:[c.filter(x=>t.can(`notifications.tab.${x.className}`)).map(x=>e.jsxs(kv,{type:x,children:[p?.filter(f=>f.className===x.className).map(f=>e.jsx(Fv,{icon:x.icon,notification:f},f.uid)),!p?.filter(f=>f.className===x.className)?.length&&e.jsx(Cv,{children:d("None configured")})]},x.className)),Tv!==is.Global&&e.jsxs(Rr,{onClick:()=>a(s),to:"manager",children:[e.jsx(hi,{children:e.jsx(Lv,{})}),e.jsx(wp,{children:d("Template Manager")})]})]})})},zv=()=>{const t=st("");return e.jsxs(jv,{children:[e.jsx(q,{id:"notifications",label:d("Notifications"),url:t.pathname}),e.jsx(Nv,{}),e.jsx(jt,{})]})},Mv=({notification:t,property:n})=>{const s=H(),{uid:i}=t,{handle:o}=n,r=c=>{s(Rt.modify({uid:i,key:o,value:c}))},a=t?.[n.handle];return e.jsx(je,{value:a,property:n,updateValue:r,errors:t.errors?.[n.handle],context:t})},Iv=t=>e.jsxs(R,{height:"1em",viewBox:"0 0 512 512",...t,children:[e.jsx("defs",{children:e.jsx("style",{children:".fa-secondary{opacity:0.2;fill:#a1a5aa;}.fa-primary{fill:#a6a8ab;}"})}),e.jsx("path",{className:"fa-primary",d:"M380.7 185.8c5.1-6.7 4.2-16.2-2.1-21.8s-15.9-5.3-21.9 .7l-179 179-13 13c-3 3-4.7 7.1-4.7 11.3v8 56 48c0 13.2 8.1 25 20.3 29.8s26.2 1.6 35.2-8.1L284 427.7l-60-25V389.4L380.7 185.8z"}),e.jsx("path",{className:"fa-secondary",d:"M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L224 402.7V389.4L380.7 185.8c5.2-6.7 4.2-16.4-2.3-21.9s-16.1-5.1-22 1.1L178.8 350.6l-14.1 14.1c-3 3-4.7 7.1-4.7 11.3l-28.3-11.8-112-46.7C8.4 312.8 .8 302.2 .1 290s5.5-23.7 16.1-29.8l448-256c10.7-6.1 23.9-5.5 34 1.4z"})]}),Av=()=>e.jsx(pi,{children:e.jsx(at,{title:d("No notifications found"),subtitle:d("To add a notification, use the sidebar on the left"),icon:e.jsx(Iv,{})})});l.div`
  display: flex;
  gap: ${m.md};
`;const Rv=()=>e.jsx(pi,{children:e.jsxs(Mn,{children:[e.jsx(k,{width:120,height:20}),e.jsx("br",{}),e.jsx(k,{width:100,height:10}),e.jsx(k,{width:50,height:20}),e.jsx("br",{}),e.jsx(k,{width:200,height:10}),e.jsx(k,{width:500,height:10}),e.jsx(k,{height:30}),e.jsx("br",{}),e.jsx(k,{width:150,height:10}),e.jsx(k,{width:300,height:10}),e.jsx(k,{height:30})]})}),Pv=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),Dv=({hovering:t})=>Y({opacity:1,background:t?h.error:"transparent",color:t?"#fff":h.gray300,scale:t?1.2:1,config:n=>{switch(n){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Bv=l(_.button)`
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
`,Ov=({notification:t})=>{const n=ne(),s=H(),[i,o]=g.useState(!1),r=Dv({hovering:i});return e.jsx(Bv,{type:"button",style:r,onMouseEnter:()=>o(!0),onMouseLeave:()=>o(!1),onClick:()=>{s(vv(t)),n("..")},children:e.jsx(Pv,{})})},_v=()=>{const{formId:t,uid:n}=V(),s=st(""),{data:i}=Kc(),{data:o,isFetching:r}=Yo(t?Number(t):void 0),a=P(In.one(n));if(!o&&r)return e.jsx(Rv,{});if(!a)return e.jsx(Av,{});const c=i?.find(u=>u.className===a.className)?.properties||[];return e.jsxs(pi,{children:[e.jsx(q,{id:"notification",label:a.name,url:s.pathname}),e.jsx(Ov,{notification:a}),e.jsx(vp,{children:c.map(u=>e.jsx(Mv,{notification:a,property:u},u.handle))})]})},Pr={one:(t,n)=>s=>s.rules.buttons?.items?.find(i=>i.page===t&&i.button===n),hasRule:(t,n)=>X(s=>s.rules.buttons.items,s=>!!s.find(i=>i.page===t&&i.button===n)),hasFieldInRule:t=>X(n=>n.rules.buttons.items,n=>!!n.find(s=>s.conditions.some(i=>i.field===t)))},Dr=({value:t,onChange:n})=>e.jsx("div",{className:"select",children:e.jsxs("select",{value:t,onChange:s=>n?.(s.target.value),children:[e.jsx("option",{value:mn.Show,children:d("show")}),e.jsx("option",{value:mn.Hide,children:d("hide")})]})}),tt=l.div`
  position: relative;

  flex: 1;

  background: ${h.white};
  padding: ${m.xl};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Wv=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),Uv=({hovering:t})=>Y({opacity:1,background:t?h.error:"transparent",color:t?"#fff":h.gray300,scale:t?1.2:1,config:n=>{switch(n){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),Hv=l(_.button)`
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
`,xi=({onClick:t})=>{const[n,s]=g.useState(!1),i=Uv({hovering:n});return e.jsx(Hv,{type:"button",style:i,onMouseEnter:()=>s(!0),onMouseLeave:()=>s(!1),onClick:t,children:e.jsx(Wv,{})})},mi=({label:t})=>{const n=P(Ae.all),s=n.length>0?n[0].uid:"",i=n.length>1?n[1].uid:"",o={combinator:Be.Or,conditions:[{field:s,operator:ie.Contains,value:"John Doe",uid:"test-1"},{field:i,operator:ie.EndsWith,value:"@gmail.com",uid:"test-2"}],display:mn.Show};return e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(Z,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(t)}})})}),e.jsxs(qv,{children:[e.jsx(Kv,{dangerouslySetInnerHTML:{__html:O.sanitize(d('<a href="{link}" target="_blank">Upgrade to Freeform Pro</a> to create conditional rules.',{link:Craft.getCpUrl("plugin-store/freeform")}))}}),e.jsxs(Qv,{children:[e.jsxs(sn,{children:[e.jsx(Dr,{value:o.display}),d("this field when"),e.jsx(tn,{value:o.combinator}),d("of the following rules match:")]}),e.jsx(nn,{conditions:o.conditions,buttonLabel:"Upgrade to Freeform Pro to create conditional rules."})]})]})]})},qv=l.div`
  position: relative;
`,Qv=l.div`
  user-select: none;
  pointer-events: none;
  filter: blur(1.3px);
`,Kv=l.div`
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
`,Vv=()=>{const{formId:t,button:n,uid:s}=V(),{isFetching:i}=Tn(Number(t||0)),o=ne(),r=H(),a=P(et.one(s)),c=P(Pr.one(s,n));if(!a)return null;const{buttons:u}=a;let p;switch(n){case"save":p=u.saveLabel;break;case"submit":p=u.submitLabel;break;case"back":p=u.backLabel;break;default:p=d("Button Group");break}return I.editions.is(re.Pro)?c?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{r(ln.remove(c.uid)),o("..")}}),e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:i,children:p})}),!i&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{className:"short",children:[e.jsx(Dr,{value:c.display,onChange:f=>r(ln.modifyDisplay({ruleUid:c.uid,display:f}))}),d("this button when"),e.jsx(tn,{value:c.combinator,onChange:f=>r(ln.modifyCombinator({ruleUid:c.uid,combinator:f}))}),d("of the following rules match:")]}),e.jsx(nn,{conditions:c.conditions,onChange:f=>{r(ln.modifyConditions({ruleUid:c.uid,conditions:f}))}})]})]}):e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:i,children:p})}),!i&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>r(ln.add({pageUid:s,button:n})),children:d("Add rules")})]}):e.jsx(mi,{label:p})},Gv=()=>e.jsx(tt,{children:d("Please choose a field in the left panel")}),Yv=()=>{const{formId:t,uid:n}=V(),{isFetching:s}=Tn(Number(t||0)),i=ne(),o=H(),r=P(Ae.one(n)),a=P(pn.one(n));if(!r)return null;const{label:c}=r.properties,u=I.editions.is(re.Pro);return u?a?u?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{o(cn.remove(a.uid)),i("..")}}),e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{children:[e.jsx(Dr,{value:a.display,onChange:p=>o(cn.modifyDisplay({ruleUid:a.uid,display:p}))}),d("this field when"),e.jsx(tn,{value:a.combinator,onChange:p=>o(cn.modifyCombinator({ruleUid:a.uid,combinator:p}))}),d("of the following rules match:")]}),e.jsx(nn,{conditions:a.conditions,onChange:p=>{o(cn.modifyConditions({ruleUid:a.uid,conditions:p}))}})]})]}):null:e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsx("button",{type:"button",className:E("btn add icon dashed"),disabled:!u,onClick:()=>o(cn.add(n)),children:d("Add rules")})]}):e.jsx(mi,{label:c})},Br={one:t=>X(n=>n.rules.pages.items,n=>n.find(s=>s.page===t)),hasRule:t=>X(n=>n.rules.pages.items,n=>!!n.find(s=>s.page===t)),hasFieldInRule:t=>X(n=>n.rules.pages.items,n=>!!n.find(s=>s.conditions.some(i=>i.field===t)))},Jv=()=>{const{formId:t,uid:n}=V(),{isFetching:s}=Tn(Number(t||0)),i=ne(),o=H(),r=P(et.one(n)),a=P(Br.one(n));if(!r)return null;const{label:c}=r;return I.editions.is(re.Pro)?a?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{o(_n.remove(n)),i("..")}}),e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{className:"short",children:[d("Go to this page when"),e.jsx(tn,{value:a.combinator,onChange:p=>o(_n.modifyCombinator({ruleUid:a.uid,combinator:p}))}),d("of the following rules match:")]}),e.jsx(nn,{conditions:a.conditions,onChange:p=>{o(_n.modifyConditions({ruleUid:a.uid,conditions:p}))}})]})]}):e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c)}})})}),!s&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>o(_n.add(n)),children:d("Add rules")})]}):e.jsx(mi,{label:c})},Or={one:t=>t.rules.submitForm.item,hasRule:t=>!!t.rules.submitForm.item},Zv=()=>{const{formId:t}=V(),{isFetching:n}=Tn(Number(t||0)),s=ne(),i=H(),o=P(Or.one);return I.editions.is(re.Pro)?o?e.jsxs(tt,{children:[e.jsx(xi,{onClick:()=>{i(Wn.remove()),s("..")}}),e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:n,children:d("Submit Form Early")})}),!n&&e.jsxs(e.Fragment,{children:[e.jsxs(sn,{children:[d("Submit this form when "),e.jsx(tn,{value:o.combinator,onChange:a=>i(Wn.modifyCombinator(a))}),d("of the following rules match:")]}),e.jsx(nn,{conditions:o.conditions,onChange:a=>{i(Wn.modifyConditions(a))}})]})]}):e.jsxs(tt,{children:[e.jsx(lt,{children:e.jsx(Z,{loadingText:d("Loading data"),loading:n,children:d("Submit Form Early")})}),!n&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>i(Wn.add()),children:d("Add rules")})]}):e.jsx(mi,{label:d("Submit Form Early")})},Xv=l.div`
  display: flex;
  height: 100%;
`,$p=l.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  gap: ${m.xs};
`,e9=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xl};
`,t9=l($p)`
  > span {
    width: 100%;
  }
`,n9=()=>{const t=P(bt.cartographed.fullLayoutList);return e.jsx(Mn,{children:t.map((n,s)=>e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:14},children:e.jsx(k,{width:"100%",height:30})}),n.map((i,o)=>e.jsx(t9,{style:{display:"flex"},children:i.map((r,a)=>e.jsx(k,{width:"100%",height:28},a))},o))]},s))})},Cp=l.div`
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
`,s9=l.label`
  flex: 1;
  display: block;

  padding: 1px 0;
  line-height: 12px;
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,kp=l.div`
  flex: 0 0 auto;

  width: 16px;
  height: 16px;
`,Sp=l.div``,i9=l(_.div)`
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

    > ${Cp} ${kp} {
      display: none;
    }

    ${Sp} {
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
`,o9=({field:t})=>{const n=I.limitations.can("rules.tab.fields"),{uid:s,button:i}=V(),o=ne(),r=Ht(),{setLastTab:a}=We("rules"),c=Me(t?.typeClass),u=s===t.uid,p=P(pn.one(s)),x=P(Br.one(s)),f=P(Or.one),b=P(Pr.one(s,i)),j=P(pn.hasRule(t.uid)),y=r.pathname.endsWith("/rules/submit"),w=P(pn.isInCondition(t.uid)),v=p?.conditions.find($=>$.field===t.uid)||x?.conditions.find($=>$.field===t.uid)||y&&f?.conditions.find($=>$.field===t.uid)||i&&b?.conditions.find($=>$.field===t.uid);return t?.properties===void 0?null:e.jsxs(i9,{onClick:$=>{if($.stopPropagation(),n){const C=s===t.uid?"":`field/${t.uid}`;a(C),o(C)}},className:E(c?.type==="group"&&"group",u&&"active",j&&"has-rule",w&&"is-in-condition",v&&"is-in-condition-active",!n&&"read-only",Dn.negative.includes(v?.operator)&&"not-equals"),children:[e.jsxs(Cp,{children:[e.jsx(kp,{dangerouslySetInnerHTML:{__html:O.sanitize(c?.icon)}}),e.jsx(s9,{dangerouslySetInnerHTML:{__html:O.sanitize(t.properties.label||c?.name)}})]}),c?.type==="group"&&e.jsx(Sp,{children:e.jsx(Lp,{layoutUid:t.properties.layout})})]})},r9=({row:t})=>{const n=P(Ae.inRow(t));return e.jsx($p,{children:n.map(s=>e.jsx(o9,{field:s},s.uid))})},a9=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
`,Lp=({layoutUid:t})=>{const n=Pt(i=>bt.one(i,t)),s=Pt(i=>ns.inLayout(i,n?.uid));return!n||!s.length?null:e.jsx(a9,{children:s.map(i=>e.jsx(r9,{row:i},i.uid))})},l9=l.div`
  display: flex;
  justify-content: space-between;

  margin-top: ${m.md};
`,c9=l.div`
  display: flex;
  gap: ${m.xs};
`,Fp=l.button`
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
`,d9=({page:t,button:{handle:n,label:s}})=>{const i=I.limitations.can("rules.tab.buttons"),{uid:o,button:r}=V(),a=ne(),{setLastTab:c}=We("rules"),u=o===t.uid&&n===r,p=P(Pr.hasRule(t.uid,n));return i?e.jsx(Fp,{type:"button",className:E(n,u&&"active",p&&"has-rule"),onClick:()=>{const x=u?"":`page/${t.uid}/buttons/${n}`;c(x),a(x)},children:d(s)}):null},u9=({page:t})=>{const n=Xu(t);return e.jsx(l9,{children:n.map((s,i)=>e.jsx(c9,{className:"page-buttons",children:s.map((o,r)=>e.jsx(d9,{button:o,page:t},r))},i))})},p9=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M64 496c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48H204.1c1.3 0 2.6 .1 3.9 .2V136c0 22.1 17.9 40 40 40H367.8c.2 1.3 .2 2.6 .2 3.9V448c0 26.5-21.5 48-48 48H64zM358.6 157.3c.9 .9 1.7 1.8 2.4 2.7H248c-13.3 0-24-10.7-24-24V22.9c1 .8 1.9 1.6 2.7 2.4L358.6 157.3zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V179.9c0-12.7-5.1-24.9-14.1-33.9L238.1 14.1c-9-9-21.2-14.1-33.9-14.1H64zm40 256c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104z"})}),h9=l.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`,x9=l.button`
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
`,m9=l.div`
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

    ${Fp} {
      background-color: ${h.gray100};

      &.submit {
        background-color: ${h.red600};
      }
    }
  }
`,g9=l.div``,f9=l.label`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,b9=({page:t})=>{const n=I.limitations.can("rules.tab.pages"),{uid:s,button:i}=V(),o=ne(),{setLastTab:r}=We("rules"),a=P(Br.hasRule(t.uid)),{label:c,uid:u}=t,p=s===u&&!i;return e.jsxs(h9,{children:[e.jsxs(x9,{onClick:()=>{if(n){const x=p?"":`page/${u}`;r(x),o(x)}},className:E(p&&"active",a&&"has-rule",!n&&"read-only"),children:[e.jsx(g9,{children:e.jsx(p9,{})}),e.jsx(f9,{children:c})]}),e.jsxs(m9,{className:E(p&&"active",a&&"has-rule"),children:[e.jsx(Lp,{layoutUid:t.layoutUid}),e.jsx(u9,{page:t})]})]})},j9=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})}),y9=l.div`
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
`,v9=l.label`
  cursor: pointer;

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,w9=()=>{const t=I.limitations.can("rules.tab.submit"),n=ne(),s=Ht(),{setLastTab:i}=We("rules"),o=P(Or.hasRule),r=s.pathname.endsWith("/rules/submit");return t?e.jsxs(y9,{onClick:()=>{i("submit"),n("submit")},className:E(r&&"active",o&&"has-rule"),children:[e.jsx("div",{children:e.jsx(j9,{})}),e.jsx(v9,{children:d("Submit Form Early")})]}):null},$9=()=>{const{formId:t}=V(),{isFetching:n}=Tn(Number(t||0)),s=P(et.all),{lastTab:i}=We("rules"),o=ne();return g.useEffect(()=>{i&&o(i)},[i,o]),e.jsx(De,{children:e.jsxs(e9,{children:[n&&e.jsx(n9,{}),!n&&s.map(r=>e.jsx(b9,{page:r},r.uid)),s.length>1&&e.jsx(w9,{})]})})},C9=()=>{const t=st("");return e.jsxs(Xv,{children:[e.jsx(q,{id:"rules",label:d("Rules"),url:t.pathname}),e.jsx($9,{}),e.jsx(jt,{})]})},_r=t=>{const n=g.useCallback(s=>{if(s.key==="s"){const i=window.navigator.platform.match(/Mac/);return i&&!s.metaKey||!i&&!s.ctrlKey?void 0:(s.preventDefault(),t(),!1)}},[t]);ft({callback:n,type:"keydown"},[t])},k9=({closeModal:t,data:n})=>{const s=()=>{t(),window.location.href=n?.url};return e.jsx(wt,{closeModal:t,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Leave the form builder?")})}),e.jsx("div",{style:{padding:20},children:d("You are about to leave the form builder. Any unsaved changes may be lost if you continue.")}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:d("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",onClick:s,children:d("Continue")})]})]})})},S9=()=>{const t=I.limitations,n=H(),s=P(Pe.current),i=P(Ot.state),{openModal:o}=Ke(),r=P(Pe.errors),a=P(Ae.hasErrors),c=P(In.errors.any),u=P(as.errors.any),{getTranslation:p}=Ce({...s.settings.general,namespaceType:"settings",namespace:"general"}),x=p("name",s.settings.general?.name),{data:f}=Gt(),b=()=>{n(Ec())};_r(b);const j=s.settings?.general?.storeData!==!1,y=!!s.canManageSubmissions,w=!!s.id&&j&&y,v=s.submissionCount??0,C=new URLSearchParams(window.location.search).get("site"),F=`submissions?${C?`site=${C}&`:""}source=form:${s.id}`,N=M=>{M.preventDefault(),s?.id&&o(k9,{url:me(F)})};return e.jsxs(Kd,{children:[e.jsx(q,{id:"form-name",label:s.name||"Create a new Form",url:`/forms/${s.id}`}),e.jsx(Vd,{children:e.jsx(Gd,{children:x||d("Create a new Form")})}),e.jsxs(fs,{className:"main-tabs",children:[e.jsx(he,{to:`/forms/${s.id}`,end:!0,className:E(a&&"errors"),children:e.jsx("span",{children:d("Layout")})}),t.can("notifications.tab")&&e.jsx(he,{to:`/forms/${s.id}/notifications`,className:E(c&&"errors"),children:e.jsx("span",{children:d("Notifications")})}),t.can("rules.tab")&&e.jsx(he,{to:`/forms/${s.id}/rules`,children:e.jsx("span",{children:d("Rules")})}),I.limitations.can("integrations.tab")&&e.jsx(he,{to:`/forms/${s.id}/integrations`,className:E(u&&"errors"),children:e.jsx("span",{children:d("Integrations")})}),I.editions.is(re.Pro)&&s.formMonitor.enabled&&e.jsx(he,{to:`/forms/${s.id}/form-monitor`,children:e.jsxs("span",{children:[d("Monitoring"),e.jsx(Qf,{children:d("BETA")})]})}),f&&I.limitations.can("settings.tab")&&e.jsx(he,{to:`/forms/${s.id}/settings`,className:E((bn(r?.general)||bn(r?.behavior))&&"errors"),children:e.jsx("span",{children:d("Settings")})})]}),w&&e.jsxs(qf,{href:me(F),onClick:N,title:d("View submissions"),className:"go",children:[v," ",d("submissions")]}),e.jsx(Yd,{children:e.jsx(Hf,{type:"button",onClick:b,disabled:i===It.Processing,className:E("btn","submit","save-button"),children:e.jsx(Z,{loadingText:d("Saving"),loading:i===It.Processing,spinner:!0,children:d("Save")})})})]})},L9=()=>e.jsxs(Id,{children:[e.jsx(S9,{}),e.jsx(Ad,{children:e.jsxs(mc,{children:[e.jsx(U,{index:!0,element:e.jsx(fv,{})}),e.jsxs(U,{path:"notifications",element:e.jsx(zv,{}),children:[e.jsx(U,{path:"manager",element:e.jsx(bv,{})}),e.jsx(U,{path:":uid?",element:e.jsx(_v,{})})]}),e.jsx(U,{path:"integrations",element:e.jsx(wj,{}),children:e.jsx(U,{path:":id?/:handle?",element:e.jsx(Lj,{})})}),e.jsxs(U,{path:"rules",element:e.jsx(C9,{}),children:[e.jsx(U,{index:!0,element:e.jsx(Gv,{})}),e.jsx(U,{path:"field/:uid",element:e.jsx(Yv,{})}),e.jsx(U,{path:"page/:uid",element:e.jsx(Jv,{})}),e.jsx(U,{path:"page/:uid/buttons/:button",element:e.jsx(Vv,{})}),e.jsx(U,{path:"submit",element:e.jsx(Zv,{})})]}),e.jsxs(U,{path:"settings",element:e.jsx(kf,{}),children:[e.jsx(U,{index:!0,element:e.jsx(bl,{})}),e.jsx(U,{path:":sectionHandle",element:e.jsx(bl,{})})]}),e.jsx(U,{path:"form-monitor",element:e.jsx(mg,{}),children:e.jsx(U,{index:!0,element:e.jsx(hf,{})})})]})})]}),F9=()=>e.jsx(Gu,{style:{flex:1},children:e.jsxs(Vu,{children:[e.jsx(Qu,{children:e.jsx(k,{height:10,width:60,baseColor:h.gray300,highlightColor:h.gray200})}),e.jsx(Ku,{children:e.jsx(k,{height:8,width:300})}),e.jsx(k,{height:30,width:"100%"})]})}),Ns=()=>e.jsx(Ju,{children:e.jsx(Zu,{children:e.jsx(F9,{})})}),E9=()=>e.jsxs(Lr,{children:[e.jsx(Ns,{}),e.jsx(Ns,{}),e.jsx(Ns,{}),e.jsx(Ns,{})]}),T9=()=>e.jsxs(ep,{children:[e.jsx(So,{}),e.jsx(So,{children:e.jsx(tp,{className:"btn btn-submit",children:e.jsx(k,{width:50,baseColor:h.gray400})})})]}),N9=()=>e.jsxs(np,{children:[e.jsx(E9,{}),e.jsx(T9,{})]}),z9=()=>e.jsx(Qt,{children:e.jsx(sp,{children:e.jsxs(ip,{children:[e.jsx(Lo,{children:e.jsx(Fo,{className:"active",children:e.jsx("span",{children:e.jsx(k,{width:42})})})}),e.jsx(Lo,{children:e.jsx(Fo,{children:e.jsx("span",{children:e.jsx(k,{width:42})})})})]})})}),M9=()=>e.jsxs(Uu,{children:[e.jsx(z9,{}),e.jsx(N9,{})]}),I9=()=>e.jsx(mp,{children:e.jsxs(gp,{children:[e.jsx(bp,{children:e.jsx(xp,{})}),e.jsx(fp,{disabled:!0,className:"fullwidth text",placeholder:d("Search")})]})}),A9=()=>e.jsxs(De,{children:[e.jsx(I9,{}),e.jsx(Nr,{words:[50,70],items:16})]}),R9=()=>e.jsxs(e.Fragment,{children:[e.jsx(A9,{}),e.jsx(M9,{})]}),P9=()=>e.jsx(Qt,{baseColor:h.gray300,highlightColor:h.gray200,height:10,children:e.jsxs(Kd,{children:[e.jsx(Vd,{children:e.jsx(Gd,{children:e.jsx(k,{width:"50%",height:20})})}),e.jsxs(fs,{children:[e.jsx("a",{className:"active",children:e.jsx("span",{children:e.jsx(k,{width:43})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:82})})}),I.editions.is(re.Pro)&&e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:36})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:77})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(k,{width:54})})})]}),e.jsx(Yd,{children:e.jsx(k,{})})]})}),D9=()=>e.jsxs(Id,{children:[e.jsx(P9,{}),e.jsx(Ad,{children:e.jsx(jp,{children:e.jsx(R9,{})})})]}),B9=()=>{const{formId:t}=V(),n=t?Number(t):void 0,s=H(),i=Hh(n),o=Uh(n),r=Cm(n);Gt(),Tn(n),Md(n),Yo(n),Go(n);const{data:a,isFetching:c,isError:u,error:p}=Oh(n);return g.useEffect(()=>{if(t===void 0||!a)return;const{translations:x,layout:{fields:f,pages:b,layouts:j,rows:y}}=a;s(gt.update(a)),s(be.set(f)),s(kn.set(b)),s(Cn.set(j)),s(Ze.set(y)),s(to.init(x)),document.title=a.name,i(),o(),r(),b.length===0?s(op()):s(ye.setPage(b.find(Boolean)?.uid))},[a,t,s,o,i,r]),c?e.jsx(D9,{}):u?e.jsxs("div",{children:["ERROR: ",p.message]}):e.jsx(L9,{})},O9=Qo`
  #freeform-client-app {
    height: calc(100vh - 100px);
  }
`,_9=()=>e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"form-editor",label:"Forms",url:"/forms"}),e.jsx(O9,{}),e.jsx(Sc,{children:e.jsx(B9,{})})]});function Fl(t,n,s,i){const o=g.useRef(n);$c(()=>{o.current=n},[n]),g.useEffect(()=>{const r=window;if(!r?.addEventListener)return;const a=c=>{o.current(c)};return r.addEventListener(t,a,i),()=>{r.removeEventListener(t,a,i)}},[t,s,i])}const qi=typeof window>"u";function Ep(t,n,s={}){const{deserializer:i,initializeWithValue:o=!0,serializer:r}=s,a=g.useRef(n),c=g.useCallback(()=>{const v=a.current;return v instanceof Function?v():v},[]),u=g.useCallback(v=>r?r(v):JSON.stringify(v),[r]),p=g.useCallback(v=>{if(i)return i(v);if(v==="undefined")return;const $=c();let C;try{C=JSON.parse(v)}catch(F){return console.error("Error parsing JSON:",F),$}return C},[i,c]),x=g.useCallback(()=>{const v=c();if(qi)return v;try{const $=window.localStorage.getItem(t);return $?p($):v}catch($){return console.warn(`Error reading localStorage key “${t}”:`,$),v}},[p,c,t]),[f,b]=g.useState(()=>o?x():c()),j=eo(v=>{qi&&console.warn(`Tried setting localStorage key “${t}” even though environment is not a client`);try{const $=v instanceof Function?v(x()):v;window.localStorage.setItem(t,u($)),b($),window.dispatchEvent(new StorageEvent("local-storage",{key:t}))}catch($){console.warn(`Error setting localStorage key “${t}”:`,$)}}),y=eo(()=>{qi&&console.warn(`Tried removing localStorage key “${t}” even though environment is not a client`);const v=c();window.localStorage.removeItem(t),b(v),window.dispatchEvent(new StorageEvent("local-storage",{key:t}))});g.useEffect(()=>{b(v=>{const $=x();return Object.is(v,$)?v:$})},[x]);const w=g.useCallback(v=>{v.key&&v.key!==t||b(x())},[t,x]);return Fl("storage",w),Fl("local-storage",w),[f,j,y]}const W9=l.header`
  display: grid;
  grid-template-areas: 'title sites views button';
  grid-template-columns: min-content 1fr min-content auto;
  justify-content: space-between;
  align-items: center;
  gap: ${m.md};
`,U9=l.h1`
  grid-area: title;

  padding: ${m.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`,H9=l.div`
  grid-area: button;
  display: flex;
  align-items: center;
  gap: ${m.sm};
`,Tp=l.button`
  flex-shrink: 0;
`,Wr=l(Tp)`
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
`,q9=l.section`
  grid-area: views;
`,Q9=()=>e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsx(k,{height:10,width:50}),e.jsx(k,{height:24})]}),e.jsxs("div",{children:[e.jsx(k,{height:10,width:150}),e.jsx(k,{height:24})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx(k,{height:24,width:38,borderRadius:12}),e.jsxs("div",{style:{flex:1},children:[e.jsx(k,{height:10,width:80}),e.jsx(k,{height:8,width:"60%"})]})]})]}),K9={all:["form","modal"]},V9=()=>B({queryKey:K9.all,queryFn:()=>T.get("/api/forms/modal").then(t=>t.data),staleTime:1/0}),Hr=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};

  padding: ${m.md} ${m.xl};
`,G9=({closeModal:t})=>{const{current:n}=Fe(),[s,i]=g.useState(!1),[o,r]=g.useState({}),[a,c]=g.useState({sites:n?[n.id]:null}),[u,p]=g.useState(),{data:x,isFetching:f}=V9();g.useEffect(()=>{if(x){const y=x?.reduce((w,v)=>({...w,[v.handle]:v.value}),{});n&&(y.sites=[n.id]),c(y),r(y)}},[x,n]),g.useEffect(()=>{c(y=>({...y,sites:n?[n.id]:null}))},[n]);const b=ne();ft({callback:y=>{if(y.key==="Enter"){j();return}}},[a]);const j=async()=>{i(!0);try{Fu(a.name,{camelize:!0,transliterate:!0,target:""},void 0,(w,v)=>{a.handle=v}),a.handle=Vs(a.handle);const{data:y}=await T.post("/api/forms/modal",a);c({...o}),p(void 0),b(`/forms/${y.id}`),t()}catch(y){p(y.errors?.form)}finally{i(!1)}};return e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Create a new Form")})}),e.jsxs(Hr,{children:[!x&&f&&e.jsx(Q9,{}),x?.map((y,w)=>e.jsx(je,{updateValue:v=>{c({...a,[y.handle]:v})},autoFocus:w===0,value:a?.[y.handle],property:y,errors:u?.[y.handle]},y.handle))]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:d("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:j,children:e.jsx(Z,{loadingText:d("Saving"),loading:s,spinner:!0,children:d("Save")})})]})]})},qr=()=>{const{openModal:t}=Ke();return()=>{t(G9)}},gi=()=>B({queryKey:[...ze.navigation,"ai-list"],queryFn:async()=>{const{data:t}=await T.get("/api/integrations/navigation"),n=t?.find(i=>i.handle==="ai");return n?n.entries.flatMap(i=>i.instances).map(i=>({id:Number(i.id),uid:i.uid,name:i.name,handle:i.handle})):[]},gcTime:1/0,staleTime:6e4}),Y9=({closeModal:t})=>{const n=ne(),[s,i]=g.useState(""),[o,r]=g.useState(""),[a,c]=g.useState(""),[u,p]=g.useState(!1),[x,f]=g.useState(null),{data:b=[],isLoading:j}=gi();g.useEffect(()=>{b.length>0&&!s&&i(b[0].uid)},[b,s]);const y=g.useMemo(()=>b.map(C=>({value:C.uid,label:C.name})),[b]),w=g.useMemo(()=>({type:K.Select,handle:"integrationUid",label:d("AI Integration"),instructions:d("Choose which AI integration to use. Model and API key are already configured in the integration."),required:!0,options:y,emptyOption:d("Select an AI integration...")}),[y]),v=`${d("Form name (optional)")}`;ft({callback:C=>{if(C.key!=="Enter")return;const F=document.activeElement;if(F?.id==="prompt"){C.preventDefault(),document.getElementById("name")?.focus({preventScroll:!0});return}F?.tagName!=="TEXTAREA"&&$()}},[s,o,a,u,j]);const $=async()=>{const C=o.trim();if(!C){f(d("Please describe the form you want to create."));return}if(!s){f(d("Please select an AI integration."));return}f(null),p(!0);try{const{data:F}=await T.post("/api/forms/generate-from-ai",{prompt:C,name:a.trim()||void 0,integrationUid:s});n(`/forms/${F.id}`),t()}catch(F){const N=T.isAxiosError(F)&&typeof F.response?.data?.message=="string"?F.response.data.message:null;f(N??d("Form generation failed. Please try again or rephrase."))}finally{p(!1)}};return e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Create a form using AI")})}),e.jsxs(Hr,{children:[e.jsx(je,{property:w,value:s,updateValue:C=>i(String(C??"")),autoFocus:!0}),e.jsx(je,{property:{type:K.Textarea,handle:"prompt",label:d("Describe your form"),instructions:d("Describe the fields and purpose of the form."),required:!0,rows:4,placeholder:d("e.g. Contact form with name, email, phone, and a message box")},value:o,updateValue:C=>r(String(C??""))}),e.jsx(je,{property:{type:K.String,handle:"name",label:v,placeholder:d("e.g. Contact Form")},value:a,updateValue:C=>c(String(C??""))}),x&&e.jsx(li,{children:x})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:d("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:$,disabled:u||!o.trim()||!s||j,children:e.jsx(Z,{loadingText:d("Generating..."),loading:u,spinner:!0,children:d("Generate form")})})]})]})},Qr=()=>{const{openModal:t}=Ke();return()=>{t(Y9)}},ut={base:["groups"],all:t=>[...ut.base,t]},Np=()=>{const{current:t,getCurrentHandleWithFallback:n}=Fe();return B({queryKey:ut.all(n()),queryFn:()=>T.get("/api/forms/groups",{params:{siteHandle:t?.handle,siteId:t?.id}}).then(s=>s.data)})},J9=l.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  background: var(--gray-050);
  height: 600px;
`,Z9=l.div`
  position: relative;
  background-color: ${h.white};
  padding: ${m.md};
  border-radius: ${S.md};
  border: 1px solid ${h.hairline};
  gap: ${m.md};
`,zp=l.div`
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
`;zp.defaultProps={$empty:"Click the 'Add Group' button on the right to begin."};const X9=l.div`
  display: flex;
  padding-bottom: ${m.lg};
  gap: ${m.lg};
`,Mp=l.div`
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
`;Mp.defaultProps={$empty:"Drag and drop any field here",color:h.black};const ew=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};
  position: absolute;
  top: 10px;
  right: 10px;
`,tw=l.div`
  padding: 25px ${m.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${Q};
`,Ip=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.xs};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;Ip.defaultProps={$empty:"Drag and drop any field here"};const nw=l.div`
  padding-top: ${m.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`,sw=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
  padding: ${m.xs} ${m.xs} ${m.xs} ${m.md};
`,iw=l.div`
  color: ${h.warning};
`,ow=l.div`
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
`,rw=l.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`,aw=l.h2`
  flex: 1;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 0;
`,lw=l.div`
  color: ${h.gray500};
  margin-right: ${m.xs};
  position: absolute;
  right: 8px;
  top: 7px;
`,cw=l.div`
  margin-top: 0;
  background-color: ${({$color:t})=>t};
  opacity: 1;
  height: 2px;
  font-size: 1px;
  line-height: 1px;
  overflow: hidden;
`,El=({form:t})=>{const n=g.useRef(null),s=Ct(n),{id:i,name:o,settings:r}=t,{color:a}=r.general;return e.jsxs(ow,{"data-id":i,ref:n,children:[e.jsx(rw,{children:e.jsx(aw,{children:o})}),s&&e.jsx(lw,{className:"remove form-item-remove",children:e.jsx(dt,{})}),e.jsx(cw,{$color:a})]})},dw=(t,n,s)=>{const{getCurrentHandleWithFallback:i,current:o}=Fe(),r=g.useCallback(()=>{n(u=>({...u,formGroups:{...u.formGroups,site:u.formGroups?.site?u.formGroups.site:i(),groups:[...u.formGroups?.groups||[],{uid:G(),label:"",formIds:[]}]}}))},[n,i]),a=g.useCallback((u,p,x)=>{n(f=>({...f,formGroups:{...f.formGroups,groups:f.formGroups.groups.map(b=>b.uid===x?{...b,[u]:p}:b)}}))},[n]),c=g.useCallback(()=>{const p=Ne.get(s.current.groupWrapper).toArray().map(y=>{const w=t.formGroups?.groups.find(v=>v.uid===y);if(w){const v={...w};return delete v.forms,{...v,formIds:Ne.get(s.current[y]).toArray().map(Number)}}return null}).filter(Boolean),x=s.current?.unassigned,f=x?Ne.get(x):null,b=f?f.toArray().map(Number):[],j=[...p.flatMap(y=>y.formIds),...b];return{siteId:t.formGroups?.siteId||o?.id,site:t.formGroups?.site||i(),groups:p,orderedFormIds:j}},[s,t,i,o?.id]);return{addGroup:r,updateGroupInfo:a,syncFormGroupsRefs:c}},uw=(t={})=>{const n=ee(),{getCurrentHandleWithFallback:s}=Fe(),i=t?.onSuccess;return t.onSuccess=(o,r,a,c)=>{i?.(o,r,a,c),n.invalidateQueries({queryKey:ut.all(s())})},ce({...t,mutationFn:async o=>{const{orderedFormIds:r,...a}=o;await T.post("/api/forms/groups",a),r&&r.length>0&&await T.post("/api/forms/sort",{orderedFormIds:r})}})},pw=(t,n)=>n.options.handle!==".handle",hw=t=>{const n=(i,o)=>{const r=t.current[i];r&&Ne.create(r,o)};Object.entries({unassigned:{group:{name:"shared",put:pw},animation:150,sort:!0},groupWrapper:{handle:".handle",filter:".group-remove",sort:!0,animation:150,onFilter:o=>{const r=Array.from(t.current[o.item.dataset.id].children);t.current.unassigned.append(...r),o.item.remove()}}}).forEach(([o,r])=>{n(o,r)})},xw=(t,n,s)=>{t&&(Ne.create(t,{animation:150,group:{name:`group-${n}`,put:(i,o)=>o.options.handle!==".handle"},sort:!0,filter:".form-item-remove",onFilter:i=>s.current.unassigned.appendChild(i.item)}),s.current[n]=t)},mw=({closeModal:t})=>{const[n,s]=g.useState({}),[i,o]=g.useState(!1),[r,a]=g.useState(),{data:c}=Np(),u=g.useRef({}),{addGroup:p,updateGroupInfo:x,syncFormGroupsRefs:f}=dw(n,s,u);g.useEffect(()=>{c&&!i&&(s(c),o(!0))},[c,i]),g.useEffect(()=>{hw(u)},[]);const b=uw({onSuccess:()=>{t()},onError:y=>{a(y.errors)}}),j=b.isPending;return e.jsxs(ve,{style:{maxWidth:"60%"},children:[e.jsx(we,{children:e.jsx("h1",{children:d("Form Group Manager")})}),e.jsxs(J9,{children:[e.jsxs(zp,{ref:y=>{u.current.groupWrapper=y},$empty:d("Click the 'Add Group' button on the right to begin."),children:[r?.length&&e.jsx(iw,{children:d("Something went wrong!")}),n.formGroups?.groups?.map(y=>e.jsxs(Z9,{"data-id":y.uid,children:[e.jsx(X9,{children:e.jsx(je,{value:y.label,property:{type:K.Label,handle:y.uid},updateValue:w=>x("label",w,y.uid)})}),e.jsx(Mp,{$empty:d("Drag and drop any field here"),ref:w=>{xw(w,y.uid,u)},children:y.forms?.map(w=>e.jsx(El,{form:w},w.id))}),e.jsxs(ew,{children:[e.jsx("button",{type:"button",className:"group-remove",children:e.jsx(dt,{})}),e.jsx("button",{type:"button",className:"handle",children:e.jsx(Ir,{})})]})]},y.uid))]}),e.jsxs(tw,{children:[e.jsx("button",{onClick:p,type:"button",className:"btn add icon dashed",children:d("Add Group")}),e.jsx(nw,{children:e.jsxs(sw,{className:"unassigned",children:[e.jsx("h3",{children:d("Unassigned")}),e.jsx(Ip,{$empty:d("Drag and drop any form here. Unassigned form will display at the bottom of the list of Groups."),ref:y=>{u.current.unassigned=y},children:n?.forms?.filter(y=>y.dateArchived===null).map(y=>e.jsx(El,{form:y},y.id))})]})})]})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:d("Close")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(Z,{loadingText:d("Saving"),loading:j,onClick:()=>b.mutate(f()),spinner:!0,children:d("Save")})})]})]})},gw=()=>{const{openModal:t}=Ke();return()=>{t(mw)}},Ap=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-13.3 0-24 10.7-24 24V264c0 13.3 10.7 24 24 24s24-10.7 24-24V152c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})}),fw=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M345 137l17-17L328 86.1l-17 17-119 119L73 103l-17-17L22.1 120l17 17 119 119L39 375l-17 17L56 425.9l17-17 119-119L311 409l17 17L361.9 392l-17-17-119-119L345 137z"})}),bw=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-8V248c0-13.3-10.7-24-24-24H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h24v64H216zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"})}),jw=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M231.9 44.4C215.7 16.9 186.1 0 154.2 0H152C103.4 0 64 39.4 64 88c0 14.4 3.5 28 9.6 40H48c-26.5 0-48 21.5-48 48v64c0 20.9 13.4 38.7 32 45.3V288 448c0 35.3 28.7 64 64 64H416c35.3 0 64-28.7 64-64V288v-2.7c18.6-6.6 32-24.4 32-45.3V176c0-26.5-21.5-48-48-48H438.4c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88h-2.2c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41zM464 176v64H432 288V176h72H464zm-240 0v64H80 48V176H152h72zm0 112V464H96c-8.8 0-16-7.2-16-16V288H224zm64 176V288H432V448c0 8.8-7.2 16-16 16H288zm72-336H288h-1.3l34.8-59.2C329.1 55.9 342.9 48 357.8 48H360c22.1 0 40 17.9 40 40s-17.9 40-40 40zm-136 0H152c-22.1 0-40-17.9-40-40s17.9-40 40-40h2.2c14.9 0 28.8 7.9 36.3 20.8L225.3 128H224z"})}),Tl=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M248.4 84.3c1.6-2.7 4.5-4.3 7.6-4.3s6 1.6 7.6 4.3L461.9 410c1.4 2.3 2.1 4.9 2.1 7.5c0 8-6.5 14.5-14.5 14.5H62.5c-8 0-14.5-6.5-14.5-14.5c0-2.7 .7-5.3 2.1-7.5L248.4 84.3zm-41-25L9.1 385c-6 9.8-9.1 21-9.1 32.5C0 452 28 480 62.5 480h387c34.5 0 62.5-28 62.5-62.5c0-11.5-3.2-22.7-9.1-32.5L304.6 59.3C294.3 42.4 275.9 32 256 32s-38.3 10.4-48.6 27.3zM288 368a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-8-184c0-13.3-10.7-24-24-24s-24 10.7-24 24v96c0 13.3 10.7 24 24 24s24-10.7 24-24V184z"})}),Rp={all:["notices"]},yw=()=>B({queryKey:Rp.all,queryFn:()=>T.get("/api/notices").then(t=>t.data),enabled:I.feed}),vw=()=>{const t=ee();return ce({mutationFn:n=>T.delete(`/api/notices/${n}`),onMutate:n=>{t.setQueryData(Rp.all,s=>({...s,notices:s.notices.filter(i=>i.id!==n)}))}})},ww=l.ul`
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
`,$w=l.button`
  align-self: center;
`,Cw=[{type:"new",accent:"#038052",bg:"transparent"},{type:"info",accent:"#007bff",bg:"transparent"},{type:"warning",accent:"#e87b00",bg:"transparent"},{type:"critical",accent:"#cf1324",bg:"#fbe4e4"},{type:"error",accent:"#cf1324",bg:"transparent"},{type:"log-list",accent:"#cf1324",bg:"transparent"}];let Pp="";Cw.forEach(({type:t,accent:n,bg:s})=>{Pp+=`
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
  `});const kw=se`
  ${Pp}
`,Ml=l.li`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;

  padding: ${m.sm} ${m.md};

  border: 1px solid #ccc;
  border-radius: ${S.lg};

  ${kw};

  &[data-type='error'] {
    background-color: #ffe3e4;
  }
`,Sw={info:e.jsx(bw,{}),warning:e.jsx(Tl,{}),critical:e.jsx(Tl,{}),error:e.jsx(Ap,{}),new:e.jsx(jw,{})},Dp=()=>{const{data:t,isFetching:n}=yw(),s=vw();return!I.feed||!t&&n||!t.notices.length&&!t.errors?null:e.jsxs(ww,{children:[t.notices.map(i=>e.jsxs(Ml,{"data-type":i.type,children:[e.jsx(Nl,{children:Sw[i.type]}),e.jsx(zl,{children:i.message}),e.jsx($w,{onClick:()=>s.mutate(i.id),children:e.jsx(fw,{})})]},i.id)),!!t.errors&&e.jsxs(Ml,{"data-type":"log-list",children:[e.jsx(Nl,{children:e.jsx(Ap,{})}),e.jsx(zl,{dangerouslySetInnerHTML:{__html:O.sanitize(d('There are currently <a href="{link}">{errors} logged errors</a> in the Freeform error log files.',{link:me("settings/error-log"),errors:t.errors}))}})]})]})},Lw=({data:t,closeModal:n})=>{const[s,i]=g.useState(!1),[o,r]=g.useState(""),[a,c]=g.useState(!1),u=ee(),{getCurrentHandleWithFallback:p}=Fe();ft({callback:b=>{if(b.key==="Enter"){f();return}}},[s]);const x=b=>{r(b.target.value)},f=async()=>{if(s){c(!0);try{await T.post("/api/forms/delete",{id:t?.form.id}),await u.invalidateQueries({queryKey:ut.all(p())}),await u.invalidateQueries({queryKey:fe.all(p())}),r(""),i(!1),n()}finally{c(!1)}}};return g.useEffect(()=>{i(o.toUpperCase()==="DELETE")},[o]),e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:t?.form.name})}),e.jsxs(Hr,{children:[e.jsx("div",{children:d("Are you sure you want to permanently delete this form? This action cannot be undone.")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(d("To delete this form, please type <strong>DELETE</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:o,autoComplete:"off",onChange:x,className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:d("Cancel")}),e.jsx("button",{type:"button",className:E("btn submit",!s&&"disabled"),onClick:f,children:e.jsx(Z,{loadingText:d("Deleting"),loading:a,spinner:!0,children:d("Delete")})})]})]})},Kr=t=>{const{openModal:n}=Ke();return()=>{n(Lw,t)}},Vr=()=>{const t=ee(),{getCurrentHandleWithFallback:n}=Fe();return ce({mutationFn:s=>T.post(`/api/forms/${s}/archive`,{site:n()}),onMutate:s=>s,onSuccess:()=>{t.invalidateQueries({queryKey:ut.all(n())}),t.invalidateQueries({queryKey:fe.all(n())})}})},Bp=()=>{const t=ee(),{getCurrentHandleWithFallback:n}=Fe();return ce({mutationFn:s=>T.post(`/api/forms/${s}/clone`),onMutate:s=>s,onSuccess:()=>{t.invalidateQueries({queryKey:ut.all(n())}),t.invalidateQueries({queryKey:fe.all(n())})}})},Fw=l.li`
  line-height: 1.4;
  list-style-type: disc;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.restored {
    opacity: 0;
  }
`,Op=l.span`
  color: ${h.blue600};
  font-weight: bold;
`,Ew=l(Op)`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`,Tw=l.span`
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
`,Nw=({form:t})=>{const n=ne(),{getCurrentHandleWithFallback:s}=Fe(),i=ee(),{id:o,name:r,links:a,dateArchived:c}=t,u=Vr(),p=u.isPending&&u.context===o,x=u.isSuccess&&u.context===o,{canDelete:f}=I.metadata.freeform,b=Kr({form:t}),j=()=>{i.invalidateQueries({queryKey:fe.single(Number(o))}),n(`${o}`)},y=a.filter(({type:$})=>$==="title").length,w=t.links.filter(({type:$})=>$==="linkList"),v=$=>r0(dn($),"yyyy-MM-dd");return e.jsxs(Fw,{className:E(p&&"disabled",x&&"restored"),children:[y?e.jsx(Ew,{onClick:j,children:r}):e.jsx(Op,{children:r}),c&&e.jsxs(Tw,{children:["(",d("archived")," ",v(c),")"]}),w.length>0&&w.filter(({count:$})=>$).map(($,C)=>$.internal?e.jsx(zs,{children:e.jsx(he,{to:$.url,children:$.label})},C):e.jsx(zs,{children:e.jsx("a",{href:$.url,children:$.label})},C)),e.jsx(zs,{children:e.jsx("button",{type:"button",onClick:()=>{u.mutate(o)},children:d("Restore this Form")})}),f&&e.jsx(zs,{children:e.jsx("button",{type:"button",onClick:async $=>{$.metaKey&&$.shiftKey?(await T.post("/api/forms/delete",{id:o}),i.invalidateQueries({queryKey:ut.all(s())}),i.invalidateQueries({queryKey:fe.all(s())})):b()},children:d("Delete this Form and its Submissions")})})]})},zw=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.md};
`,Mw=l.button`
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
`,Iw=l.ul`
  margin-left: 25px;
`,_p=({data:t})=>{const[n,s]=g.useState(!1);return t?.length?e.jsxs(zw,{children:[e.jsx(Mw,{onClick:()=>s(!n),children:d(n?"Hide archived forms":"Show archived forms")}),n&&e.jsx(Iw,{children:t.map(i=>e.jsx(Nw,{form:i},i.id))})]}):null},Io=()=>{const t=g.useRef(null),[n,s]=g.useState(!1);return g.useEffect(()=>{const i=()=>{const o=t.current;o&&s(o.scrollWidth>o.clientWidth)};return window.addEventListener("resize",i),i(),()=>window.removeEventListener("resize",i)},[]),[t,n]},Wp=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m2.583 5.039c-.101-.002-.174-.008-.24-.021-.488-.097-.869-.478-.966-.965-.022-.119-.022-.262-.022-.547 0-.286 0-.429.022-.548.097-.487.478-.868.966-.966.119-.023.263-.023.547-.023h9.22c.284 0 .428 0 .547.023.488.098.869.479.966.966.022.119.022.262.022.548 0 .285 0 .428-.022.547-.097.487-.478.868-.966.965-.066.013-.139.019-.24.021m-6.146 3.075h2.458m-6.146-3.073h9.834v5.041c0 1.031 0 1.548-.202 1.942-.176.348-.458.63-.805.807-.395.2-.911.2-1.944.2h-3.932c-1.033 0-1.549 0-1.944-.2-.347-.177-.629-.459-.805-.807-.202-.394-.202-.911-.202-1.942z",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]}),Up=t=>e.jsx(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h15v15h-15z"}),e.jsx("path",{d:"m6.562 1.252c-.421.006-.675.03-.88.134-.234.12-.426.311-.546.547-.104.205-.128.458-.134.879m7.186-1.56c.421.006.675.03.88.134.234.12.426.311.546.547.104.205.129.458.134.879m0 5.626c-.005.421-.03.675-.134.88-.12.234-.312.426-.546.546-.205.104-.459.129-.88.134m1.562-4.998v1.25m-5-5h1.25m-6.75 12.5h4.75c.7 0 1.05 0 1.318-.136.234-.12.426-.312.546-.546.136-.268.136-.618.136-1.318v-4.75c0-.7 0-1.05-.136-1.318-.12-.234-.312-.426-.546-.546-.268-.136-.618-.136-1.318-.136h-4.75c-.7 0-1.05 0-1.317.136-.236.12-.427.312-.547.546-.136.268-.136.618-.136 1.318v4.75c0 .7 0 1.05.136 1.318.12.234.311.426.547.546.267.136.617.136 1.317.136z",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]})}),Gr=l.div`
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
`,Hp=l.div`
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

    ${Hp} {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,qp=l.div``,Xr=l.div`
  margin-top: -3px;

  background-color: ${({$color:t})=>t};
  opacity: 0.3;

  height: 5px;

  font-size: 0px;
  line-height: 0px;

  overflow: hidden;
`,Aw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Rw=()=>e.jsxs(Zr,{children:[e.jsx(k,{height:8,width:60}),e.jsx(k,{height:8,width:40})]}),Qi=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:Aw(0,Math.random()>.9?8:4)}));return e.jsxs(bi,{children:[e.jsxs(Gr,{children:[e.jsx(Yr,{children:e.jsxs(Jr,{children:[e.jsx(k,{height:15,width:"90%"}),e.jsx(k,{height:8,width:"60%"}),e.jsx(k,{height:8,width:"30%"})]})}),e.jsxs(fi,{children:[e.jsx("li",{children:e.jsx(k,{height:8,width:90})}),e.jsx("li",{children:e.jsx(k,{height:8,width:50})})]})]}),e.jsx(nt,{width:"100%",height:40,children:e.jsxs(yt,{data:n,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:"url(#colorGradient)",isAnimationActive:!1})]})}),e.jsx(Xr,{$color:t})]})},Pw=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})}),Dw=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M248.4 84.3c1.6-2.7 4.5-4.3 7.6-4.3s6 1.6 7.6 4.3L461.9 410c1.4 2.3 2.1 4.9 2.1 7.5c0 8-6.5 14.5-14.5 14.5l-387 0c-8 0-14.5-6.5-14.5-14.5c0-2.7 .7-5.3 2.1-7.5L248.4 84.3zm-41-25L9.1 385c-6 9.8-9.1 21-9.1 32.5C0 452 28 480 62.5 480l387 0c34.5 0 62.5-28 62.5-62.5c0-11.5-3.2-22.7-9.1-32.5L304.6 59.3C294.3 42.4 275.9 32 256 32s-38.3 10.4-48.6 27.3zM288 368a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-8-184c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 96c0 13.3 10.7 24 24 24s24-10.7 24-24l0-96z"})}),Bw=l.span`
  display: inline-block;
  white-space: nowrap;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  color: #424d59;
`,Ow=l.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 3px;
  font-size: 11px;
  color: #424d59;
  margin-bottom: 7px;
`,_w=l.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({$align:t="left"})=>t==="right"?"flex-end":"flex-start"};
  text-align: ${({$align:t="left"})=>t};
`,Ww=l.div`
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
`,qn={align:"left",width:"70%",showLastTest:!1,size:"lg"},Qp=(t,n=qn.size)=>{if(!t?.lastTest)return e.jsx(Ms,{$status:"pending",$size:n,children:e.jsx(es,{})});const s={success:e.jsx(Ms,{$status:"success",$size:n,children:e.jsx(Pw,{})}),failed:e.jsx(Ms,{$status:"failed",$size:n,children:e.jsx(Dw,{})}),pending:e.jsx(Ms,{$status:"pending",$size:n,children:e.jsx(es,{})})};return s[t.lastTest.status]||s.pending},ea=({formMonitor:t,align:n=qn.align,width:s=qn.width,showLastTest:i=qn.showLastTest,size:o=qn.size})=>{if(!t?.enabled)return null;const r=!t||!t.percentage||t.total===0;if(t?.error)return e.jsx(Ro,{$withMargin:!0,children:t.error?.message});const c=r?0:t.percentage?.success||0,u=r?0:t.percentage?.failed||0,p=r?100:t.percentage?.pending||0,x={"--success":`${c}%`,"--failed":`${c+u}%`,"--pending":`${c+u+p}%`};return e.jsxs(_w,{$align:n,style:r?{marginTop:"10px"}:void 0,children:[i&&t.lastTest&&e.jsxs(Ow,{children:[d("Last Test")," ",Qp(t,o)]}),e.jsx(Ww,{$width:s,style:x}),e.jsx(Bw,{children:r?d("Uptime: Pending"):`${d("Uptime")}: ${c}%`})]})},Uw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,an={position:"top",animation:"fade",delay:[100,0]},Gn=({form:t,isDraggingInProgress:n,isExpressEdition:s})=>{const i=I.editions.is(re.Pro),o=Vr(),r=Bp(),a=ne(),{getCurrentHandleWithFallback:c}=Fe(),u=ee(),{canDelete:p}=I.metadata.freeform,[x,f]=Io(),[b,j]=Io(),y=Array.from({length:31},()=>({uv:Uw(0,Math.random()>.9?50:20)})),{id:w,name:v,description:$,dateArchived:C,settings:F,formMonitor:N}=t,{color:M}=F.general,z=o.isPending&&o.context===w,L=o.isSuccess&&o.context===w,D=r.isPending&&r.context===w||z,J=Kr({form:t}),pe=ge=>{ge.metaKey||ge.ctrlKey||ge.button===1?window.open(me(`forms/${w}`),"_blank"):(u.invalidateQueries({queryKey:fe.single(Number(w))}),a(`${w}`))},St=t.links.filter(({type:ge})=>ge==="title").length,on=t.links.filter(({type:ge})=>ge==="linkList"),An=t.links.find(({type:ge})=>ge==="formMonitor"),{data:m1,isLoading:g1}=Rd(t.id,{enabled:N?.enabled===!0});return e.jsxs(bi,{"data-id":t.id,className:E(D&&"disabled",L&&"archived",n&&"dragging"),children:[e.jsxs(Hp,{children:[!s&&!i&&e.jsx(xe,{title:d("Move this Form Card"),...an,children:e.jsx(Nt,{className:"handle",children:e.jsx(Ir,{})})}),!s&&e.jsx(xe,{title:d("Duplicate this Form"),...an,children:e.jsx(Nt,{onClick:()=>{r.mutate(w)},children:e.jsx(Up,{})})}),!s&&!C&&e.jsx(xe,{title:d("Archive this Form"),...an,children:e.jsx(Nt,{onClick:()=>{o.mutate(w)},children:e.jsx(Wp,{})})}),p&&e.jsx(xe,{title:d("Delete this Form"),...an,children:e.jsx(Nt,{onClick:async ge=>{ge.metaKey&&ge.shiftKey?(await T.post("/api/forms/delete",{id:w}),u.invalidateQueries({queryKey:ut.all(c())}),u.invalidateQueries({queryKey:fe.all(c())})):J()},children:e.jsx(dt,{})})})]}),e.jsx(Gr,{children:e.jsxs(Yr,{children:[e.jsxs(Jr,{children:[f?e.jsx(xe,{title:v,...an,children:St?e.jsx(Ys,{ref:x,onClick:pe,onAuxClick:pe,children:v}):e.jsx(Gs,{ref:x,children:v})}):St?e.jsx(Ys,{ref:x,onClick:pe,onAuxClick:pe,children:v}):e.jsx(Gs,{ref:x,children:v}),!!$&&(j?e.jsx(xe,{title:$,...an,position:"bottom",distance:10,style:{display:"block"},children:e.jsx(Ao,{ref:b,children:$})}):e.jsx(Ao,{ref:b,children:$})),on.length>0&&e.jsx(fi,{children:on.map((ge,da)=>ge.internal?e.jsx(he,{to:ge.url,children:ge.label},da):e.jsx("li",{children:e.jsx("a",{href:ge.url,children:ge.label})},da))})]}),e.jsx(Zr,{children:N?.enabled&&An&&e.jsx(he,{to:An.url,children:g1?e.jsx(Rw,{}):e.jsx(ea,{formMonitor:{...m1,enabled:N?.enabled},align:"right",width:"100%",showLastTest:!0,size:"sm"})})})]})}),e.jsxs(qp,{children:[e.jsx(nt,{width:"100%",height:40,children:e.jsxs(yt,{data:t.chartData||y,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${t.id}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:M,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:M,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"uv",stroke:M,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:`url(#color${t.id})`,isAnimationActive:!1})]})}),e.jsx(Xr,{$color:M})]})]})},Hw=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Il=["Contact Us","Feedback","Survey","Registration","Application","Subscription"],Al=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:Hw(0,Math.random()>.9?8:4)})),s=Math.round(Math.random()*10)+1,i=Math.round(s*(Math.random()*.8+.6)),o=Math.round(s*(Math.random()*.1)),r=Il[Math.floor(Math.random()*Il.length)],a={success:i,pending:0,percentage:{success:Math.round(i/s*100),pending:0,failed:Math.round(o/s*100)},failed:o,total:s};return e.jsxs(bi,{className:"blurred",children:[e.jsx(Gr,{children:e.jsxs(Yr,{children:[e.jsxs(Jr,{children:[e.jsx(Ys,{children:r}),e.jsxs(fi,{children:[e.jsx("li",{children:e.jsxs("a",{href:"#",children:["3 ",d("Submissions")]})}),e.jsx("li",{children:e.jsxs("a",{href:"#",children:["0 ",d("Spam")]})})]})]}),e.jsx(Zr,{children:e.jsx(he,{to:"#",children:e.jsx(ea,{formMonitor:{...a,enabled:!0},align:"right",width:"100%",showLastTest:!0,size:"sm"})})})]})}),e.jsxs(qp,{children:[e.jsx(nt,{width:"100%",height:40,children:e.jsxs(yt,{data:n,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:"url(#colorGradient)",isAnimationActive:!1})]})}),e.jsx(Xr,{$color:t})]})]})},Ki=[[{uv:0},{uv:2},{uv:0},{uv:6},{uv:0},{uv:0},{uv:1},{uv:0},{uv:0},{uv:4},{uv:0},{uv:3}],[{uv:9},{uv:6},{uv:3},{uv:4},{uv:0},{uv:6},{uv:1}],[{uv:0},{uv:25},{uv:0},{uv:32},{uv:0},{uv:0}]],qw=l.div`
  display: flex;
  flex-direction: column;
  gap: ${m.lg};
`,Qw=l.div`
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
`,Kp=l.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .edit-groups {
    justify-content: flex-end;
    margin-left: auto;
  }
`,Kw=l.button`
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
`,Vp=l.div`
  width: 100%;
  max-width: 100%;
`;l.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${m.lg};
`;const Vw=l.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`,Gw=l(_s)`
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
`,Yw="#e0e0e0",Vi=(t,n,s,i,o)=>({uid:"",type:"",name:t,handle:"",description:n,isNew:!0,chartData:s,links:[{count:i,label:d("{count} Submissions",{count:i}),handle:"submissions",type:"linkList",url:"",internal:!1},{count:o,label:d("{count} Spam",{count:o}),handle:"spam",type:"linkList",url:"",internal:!0}],counters:{submissions:i,spam:o},formMonitor:{enabled:!1},settings:{general:{namespaceType:"settings",namespace:"general",color:Yw}},dateArchived:null}),Jw=()=>{const t=qr(),n=Qr(),{data:s}=gi(),{canCreate:i}=I.metadata.freeform,o=s&&s.length===0;return e.jsxs("div",{children:[i&&e.jsxs(e.Fragment,{children:[e.jsx("p",{children:d("You don't have any forms yet. Create your first form now...")}),e.jsxs(Vw,{children:[e.jsx("button",{type:"button",className:"btn submit add icon",onClick:t,children:d("Create a new Form")}),o?e.jsx(Ur,{to:"/integrations/ai/SolspaceAIV1",className:"btn add icon","data-icon":"sparkles",children:d("Enable AI")}):e.jsx(Wr,{type:"button",className:"btn add icon","data-icon":"sparkles",onClick:n,children:d("Create with AI")})]})]}),!i&&e.jsx("p",{children:d("You don't have any forms.")}),e.jsxs(Gw,{children:[e.jsx(Gn,{form:Vi("Contact Form","Main contact form.",Ki[0],14,5)}),e.jsx(Gn,{form:Vi("Customer Survey","Customer satisfaction survey.",Ki[1],72,18)}),e.jsx(Gn,{form:Vi("Newsletter","Newsletter signup form.",Ki[2],138,7)})]})]})},Zw=()=>{const{data:t,isFetching:n}=Np(),s=gw(),i=t?.forms.length>0,o=t?.formGroups?.groups.some(j=>j.forms.length>0),r=!n&&!i&&!o,a=I.editions.is(re.Express),c=I.editions.isAtLeast(re.Pro),u=g.useRef(null),p=g.useRef(null),[x,f]=g.useState(!1),b=g.useCallback(()=>{const j=p.current.toArray();T.post("/api/forms/sort",{orderedFormIds:j}),f(!1)},[]);return g.useEffect(()=>{document.title=d("Forms")},[]),g.useEffect(()=>{u.current&&(p.current=new Ne(u.current,{animation:150,onEnd:b,handle:".handle",onStart:()=>{f(!0)}}))},[b]),e.jsx(Vp,{children:e.jsxs("div",{id:"content",className:"content-pane",children:[e.jsx(Dp,{}),e.jsxs(qw,{children:[r&&e.jsx(Jw,{}),!r&&e.jsxs(Qw,{children:[c&&t?.formGroups&&t.formGroups.groups.map((j,y)=>j.forms.length?e.jsxs(Rl,{children:[y!==0&&e.jsx("hr",{}),e.jsx(Pl,{children:j.label}),e.jsx(_s,{children:j.forms.map(w=>e.jsx(Gn,{isExpressEdition:a,form:w},w.id))})]},j.uid):null),!r&&i&&e.jsxs(Rl,{children:[o&&e.jsx("hr",{}),o&&e.jsx(Pl,{children:d("Other")}),e.jsxs(_s,{ref:u,className:E(x&&"dragging"),children:[t?.forms?.map(j=>e.jsx(Gn,{isDraggingInProgress:x,isExpressEdition:a,form:j},j.id)),a&&e.jsxs(e.Fragment,{children:[e.jsx(Al,{}),e.jsx(Al,{})]})]})]}),!t?.forms&&n&&e.jsxs(_s,{children:[e.jsx(Qi,{}),e.jsx(Qi,{}),e.jsx(Qi,{})]})]}),a&&e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(d('Need more forms? <a href="{link}" target="_blank">Upgrade to Lite or Pro</a>.',{link:Craft.getCpUrl("plugin-store/freeform")}))}}),e.jsxs(Kp,{children:[!a&&t?.archivedForms&&e.jsx(_p,{data:t.archivedForms}),!r&&c&&e.jsxs(Kw,{className:"edit-groups",onClick:s,children:[e.jsx(Er,{}),d("Manage Form Groups")]})]})]})]})})},Xw=l.div`
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
`;const e$=l.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Is=({children:t,size:n})=>{const[s]=Io();return e.jsx(e$,{ref:s,style:{maxWidth:n},title:String(t),children:t})},t$=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Js=()=>e.jsx(e.Fragment,{children:e.jsx(k,{height:20,width:40,highlightColor:"#5372b64f"})}),As=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:t$(0,Math.random()>.9?8:4)}));return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(k,{height:20,width:150})}),e.jsx("td",{children:e.jsx(k,{height:20,width:80})}),e.jsx("td",{children:e.jsx(k,{height:20,width:300})}),e.jsx("td",{children:e.jsx(nt,{width:200,height:20,children:e.jsxs(yt,{data:n,margin:{top:0,bottom:0,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:.7,fill:"url(#colorGradient)",isAnimationActive:!1})]})})}),e.jsx("td",{children:e.jsx(Js,{})}),e.jsx("td",{children:e.jsx(Js,{})}),e.jsx("td",{children:e.jsx(k,{height:20,width:61})})]})},Gi={position:"top",animation:"fade",delay:[100,0]},n$=({form:t,hasFormMonitor:n})=>{const s=I.editions.isAtLeast(re.Lite),i=Vr(),o=Bp(),r=ee(),{getCurrentHandleWithFallback:a}=Fe(),c=Kr({form:t}),{canDelete:u}=I.metadata.freeform,{id:p,name:x,handle:f,description:b,settings:j,dateArchived:y,formMonitor:w}=t,v=j.general.color,$=t.links.some(({type:L})=>L==="title"),C=t.links.find(L=>L.handle==="submissions"),F=t.links.find(L=>L.handle==="spam"),N=t.links.find(({type:L})=>L==="formMonitor"),{data:M,isLoading:z}=Rd(t.id,{enabled:w?.enabled===!0});return e.jsxs("tr",{children:[e.jsxs("td",{children:[$&&e.jsx(rt,{to:`${p}`,children:e.jsx(Is,{size:250,children:x})}),!$&&e.jsx(Is,{size:250,children:x})]}),e.jsx("td",{children:e.jsx("code",{children:e.jsx(Is,{size:150,children:f})})}),e.jsx("td",{children:e.jsx(Is,{size:400,children:b})}),e.jsx("td",{children:e.jsx(nt,{width:200,height:20,children:e.jsxs(yt,{data:t.chartData,margin:{top:0,bottom:0,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${t.id}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:v,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:v,stopOpacity:.3})]})}),e.jsx(vt,{type:"monotone",dataKey:"uv",stroke:v,strokeWidth:1,strokeOpacity:1,fillOpacity:.7,fill:`url(#color${t.id})`,isAnimationActive:!1})]})})}),n&&e.jsxs(e.Fragment,{children:[e.jsx("td",{children:w?.enabled&&N&&e.jsx(he,{to:N.url,children:z?e.jsx(Js,{}):M?.error?e.jsx(Ro,{children:M.error.message}):M?e.jsx(ea,{formMonitor:{...M,enabled:w?.enabled},align:"left",width:"100%",size:"sm"}):null})}),e.jsx("td",{children:w?.enabled&&N&&e.jsx(he,{to:N.url,children:z?e.jsx(Js,{}):M?.error?e.jsx(Ro,{children:M.error.message}):M?Qp({...M,enabled:w?.enabled},"lg"):null})})]}),e.jsx("td",{children:!!C&&e.jsx("a",{href:C.url,children:C.count})}),e.jsx("td",{children:!!F&&e.jsx("a",{href:F.url,children:F.count})}),e.jsx("td",{children:e.jsxs(hn,{children:[s&&e.jsx(xe,{title:d("Duplicate this Form"),...Gi,children:e.jsx(Nt,{onClick:()=>o.mutate(p),children:e.jsx(Up,{})})}),s&&!y&&e.jsx(xe,{title:d("Archive this Form"),...Gi,children:e.jsx(Nt,{onClick:()=>i.mutate(p),children:e.jsx(Wp,{})})}),u&&e.jsx(xe,{title:d("Delete this Form"),...Gi,children:e.jsx(Nt,{onClick:async L=>{L.metaKey&&L.shiftKey?(await T.post("/api/forms/delete",{id:p}),r.invalidateQueries({queryKey:ut.all(a())}),r.invalidateQueries({queryKey:fe.all(a())})):c()},children:e.jsx(dt,{})})})]})})]})},s$=l.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;

  @media (max-width: 1023px) {
    ${Q};
  }
`,i$=l.table`
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
`,o$=({forms:t,isFetching:n})=>{const s=qr(),i=Qr(),{data:o}=gi(),{canCreate:r}=I.metadata.freeform,c=I.permissions.integrations!=="none",u=c&&o&&o.length===0,p=t?.some(x=>x.formMonitor?.enabled);return e.jsx(s$,{children:e.jsxs(i$,{className:"table data",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("Name")}),e.jsx("th",{children:d("Handle")}),e.jsx("th",{children:d("Description")}),e.jsx("th",{children:d("Chart")}),p&&e.jsx("th",{children:d("Monitoring")}),p&&e.jsx("th",{children:d("Last Test")}),e.jsx("th",{children:d("Submissions")}),e.jsx("th",{children:d("Spam")}),e.jsx("th",{children:d("Manage")})]})}),e.jsxs("tbody",{children:[n&&t===void 0&&e.jsxs(e.Fragment,{children:[e.jsx(As,{}),e.jsx(As,{}),e.jsx(As,{}),e.jsx(As,{})]}),!n&&!t?.length&&r&&e.jsx("tr",{children:e.jsxs("td",{colSpan:p?9:7,children:[e.jsx("p",{children:d("You don't have any forms yet. Create your first form now...")}),c&&(u?e.jsx(Ur,{to:"/integrations/ai/SolspaceAIV1",className:"btn add icon","data-icon":"sparkles",children:d("Enable AI")}):e.jsx(Wr,{type:"button",className:"btn add icon","data-icon":"sparkles",onClick:i,children:d("Create with AI")})),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:s,children:d("Create a new Form")})]})}),!n&&!t?.length&&!r&&e.jsx("tr",{children:e.jsx("td",{colSpan:p?9:7,children:e.jsx("p",{children:d("You don't have any forms yet.")})})}),t?.sort((x,f)=>x.name.localeCompare(f.name))?.map(x=>e.jsx(n$,{form:x,hasFormMonitor:p},x.id))]})]})})},r$=()=>{const{data:t,isFetching:n}=ei(),s=I.editions.isAtLeast(re.Lite),i=t?.filter(({dateArchived:r})=>r===null),o=t?.filter(({dateArchived:r})=>r!==null);return g.useEffect(()=>{document.title=d("Forms")},[]),e.jsx(Vp,{children:e.jsxs("div",{id:"content",className:"content-pane",children:[e.jsx(Dp,{}),e.jsxs(Xw,{children:[e.jsx(o$,{forms:i,isFetching:n}),s&&e.jsx(Kp,{children:e.jsx(_p,{data:o})})]})]})})},a$=()=>{const t=ee(),n=qr(),s=Qr(),{data:i}=gi(),[o,r]=Ep("forms-list-view",1),a=I.metadata.craft.is5,{canCreate:c}=I.metadata.freeform,p=I.permissions.integrations!=="none",x=p&&i&&i.length===0;return t.prefetchQuery({queryKey:Xn.all,queryFn:xd}),t.prefetchQuery({queryKey:Xn.propertySections(),queryFn:md}),e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"form-list",label:"Forms",url:"/forms"}),e.jsxs(W9,{children:[e.jsx(U9,{children:d("Forms")}),e.jsxs(q9,{className:"btngroup btngroup--exclusive",children:[e.jsx("button",{type:"button",className:E("btn",o===0&&"active"),"data-icon":"list","aria-label":"Display in a table",title:d("Display as list"),onClick:()=>r(0)}),e.jsx("button",{type:"button",className:E("btn",o===1&&"active"),"data-icon":E(a?"element-cards":"grid"),title:d("Display as cards"),onClick:()=>r(1)})]}),c&&e.jsxs(H9,{children:[p&&(x?e.jsx(Ur,{to:"/integrations/ai/SolspaceAIV1",className:"btn add icon","data-icon":"sparkles",children:d("Enable AI")}):e.jsx(Wr,{type:"button",className:"btn add icon","data-icon":"sparkles",onClick:s,children:d("Create with AI")})),e.jsx(Tp,{className:"btn submit add icon",onClick:n,children:d("Add new Form")})]})]}),o===0&&e.jsx(r$,{}),o===1&&e.jsx(Zw,{})]})},Dl=({children:t,...n})=>e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",...n,children:t})}),l$=["forms","express-forms","formie"],c$=()=>{const{pathname:t}=Ht(),{data:n,isFetching:s}=B({queryKey:["import-export","navigation"],queryFn:()=>T.get("/api/import-export/navigation").then(i=>i.data)});return s&&!n?e.jsx(Dl,{children:e.jsx("nav",{})}):e.jsx(Dl,{children:e.jsx("nav",{children:e.jsx("ul",{children:n.map((i,o)=>{if(i?.heading)return e.jsx("li",{className:"heading",children:e.jsx("span",{children:d(i.heading)})},o);const r=i.url.replace(/^freeform/,""),a=l$.some(u=>r.includes(u)),c=d(i.title);return e.jsxs("li",{children:[a&&e.jsx(he,{to:r,className:E(r===t&&"sel"),children:c}),!a&&e.jsx("a",{href:me(r),children:c})]},o)})})})})},d$=l.div`
  display: flex;
  margin-bottom: 50px;
`,Bl=()=>{const{pathname:t}=Ht();Fn("export/profiles"),ei();let n;switch(t){case"/import/express-forms":n="Import from Express Forms";break;case"/import/formie/v3":n="Import from Formie (v3)";break;case"/import/forms":n="Import Freeform Data";break;case"/export/forms":n="Export Freeform Data";break}return e.jsxs("div",{children:[e.jsx(Ln,{children:d(n)}),e.jsxs(d$,{children:[e.jsx(c$,{}),e.jsx(jt,{})]})]})},Qe=({children:t,...n})=>e.jsx("div",{id:"content-container",children:e.jsx("div",{id:"content",className:"content-pane",...n,children:t})}),_t=({children:t,label:n,instructions:s,...i})=>e.jsxs("div",{...i,className:E("field",i.className),children:[n&&e.jsx("div",{className:"heading",children:e.jsx("label",{htmlFor:"",children:n})}),s&&e.jsx("div",{className:"instructions",children:s}),e.jsx("div",{className:"input",children:t})]}),ta=t=>{let n=!0;return Object.keys(t).forEach(s=>{const i=t[s];typeof i=="object"&&i!==null&&!Array.isArray(i)?Object.keys(i).forEach(o=>{const r=i[o];Array.isArray(r)&&r.length>0&&(n=!1)}):Array.isArray(i)?i.length>0&&(n=!1):typeof i=="boolean"&&i&&(n=!1)}),n},u$=(t,n)=>{let s=!0;return Object.keys(t).forEach(i=>{const o=t[i];typeof o=="object"&&o!==null&&!Array.isArray(o)?Object.keys(o).forEach(r=>{const a=o[r];Array.isArray(a)&&a.length!==n[i][r]?.length&&(s=!1)}):Array.isArray(o)?o.length!==n[i]?.length&&(s=!1):typeof o=="boolean"&&(o||(s=!1))}),s},Gp=()=>({forms:[],favorites:[],formGroups:[],limitedUsers:[],formSubmissions:[],templates:{pdf:[],wrapper:[],notification:[],formatting:[],success:[]},integrations:[],settings:!1,password:""}),p$=t=>({forms:t.forms.map(n=>n.uid),formGroups:t?.formGroups?.map(n=>n.uid)||[],favorites:t?.favorites?.map(n=>n.uid)||[],limitedUsers:t?.limitedUsers?.map(n=>n.uid)||[],templates:{pdf:t.templates.pdf.map(n=>n.uid),wrapper:t.templates.wrapper.map(n=>n.uid),notification:t.templates.notification.map(n=>n.uid),formatting:t.templates.formatting.map(n=>n.fileName),success:t.templates.success.map(n=>n.fileName)},integrations:t.integrations.map(n=>n.uid),formSubmissions:t.formSubmissions.map(n=>n.form.uid),settings:!0}),h$=t=>t.replace(/<\/?[^>]+(>|$)/g,""),na=22,x$=l.div`
  &.disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.3;

    transition: opacity 0.2s ease-out;
  }
`,m$=l.a`
  cursor: pointer;
  display: block;

  color: ${h.link} !important;
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }
`,g$=l.div`
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
`,vn=l.div`
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
`,wn=l.div`
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
`,sa=()=>e.jsx(Le,{className:"fa-solid fa-folder"}),f$=()=>e.jsx(Le,{className:"fa-duotone fa-clipboard-list"}),b$=()=>e.jsx(Le,{className:"fa-light fa-folder-bookmark"}),j$=()=>e.jsx(Le,{className:"fa-light fa-file-heart"}),y$=()=>e.jsx(Le,{className:"fa-duotone fa-inbox-in"}),v$=()=>e.jsx(Le,{className:"fa-light fa-envelope"}),w$=()=>e.jsx(Le,{className:"fa-light fa-file-pdf"}),$$=()=>e.jsx(Le,{className:"fa-light fa-file-half-dashed"}),C$=()=>e.jsx(Le,{className:"fa-light fa-file-code"}),k$=()=>e.jsx(Le,{className:"fa-light fa-file-check"}),S$=()=>e.jsx(Le,{className:"fa-duotone fa-gear"}),Ut=l.li`
  &.selectable:not(.selected) {
    ${Wt}, ${Le}, ${Zs} {
      opacity: 0.4;
      transition: opacity 0.2s ease-out;
    }
  }
`,Je=t=>{const{label:n,icon:s,itemIcon:i,labelExtras:o}=t,{items:r,selection:a,onUpdate:c}=t,{labelKey:u,selectionKey:p,nested:x}=t,f=t.id||K1(n);return!Array.isArray(r)||!r.length?null:e.jsxs(Ut,{children:[e.jsxs(vn,{children:[e.jsx(wn,{children:e.jsx(ct,{id:`${f}-all`,checked:a.length===r.length,onChange:()=>a.length===r.length?c([]):c(r.map(b=>b[p]))})}),x&&e.jsx(Zs,{$dash:!0}),e.jsx(sa,{}),e.jsx(Wt,{htmlFor:`${f}-all`,children:n})]}),e.jsx("ul",{children:r.map(b=>e.jsx(Ut,{className:E("selectable",a.includes(b[p])&&"selected"),children:e.jsxs(vn,{children:[e.jsx(wn,{children:e.jsx(ct,{id:`${f}-${b[p]}`,checked:a.includes(b[p]),onChange:()=>c(a.includes(b[p])?a.filter(j=>j!==b[p]):[...a,b[p]])})}),e.jsx(Zs,{$dash:!0,$width:x?2:void 0}),s,i?.(b),e.jsxs(Wt,{htmlFor:`${f}-${b[p]}`,children:[h$(b[u]),o?.(b)]})]})},b[p]))})]})},L$=({value:t,onUpdate:n})=>e.jsx(Ut,{children:e.jsx("ul",{children:e.jsx(Ut,{className:E("selectable",t&&"selected"),children:e.jsxs(vn,{children:[e.jsx(wn,{children:e.jsx(ct,{id:"export-settings",checked:t,onChange:()=>n(!t)})}),e.jsx(S$,{}),e.jsx(Wt,{htmlFor:"export-settings",children:d("Settings")})]})})})}),F$=({submissions:t,options:n,onUpdate:s})=>!Array.isArray(t)||!t.length?null:e.jsxs(Ut,{children:[e.jsxs(vn,{children:[e.jsx(wn,{children:e.jsx(ct,{id:"submissions-all",checked:n.length===t.length,onChange:()=>n.length===t.length?s([]):s(t.map(i=>i.form.uid))})}),e.jsx(sa,{}),e.jsx(Wt,{htmlFor:"submissions-all",children:d("Submissions")})]}),e.jsx("ul",{children:t.map(i=>e.jsx(Ut,{className:E("selectable",n.includes(i.form.uid)&&"selected"),children:e.jsxs(vn,{children:[e.jsx(wn,{children:e.jsx(ct,{id:`submissions-${i.form.uid}`,checked:n.includes(i.form.uid),onChange:()=>s(n.includes(i.form.uid)?n.filter(o=>o!==i.form.uid):[...n,i.form.uid])})}),e.jsx(Zs,{$dash:!0}),e.jsx(y$,{}),e.jsxs(Wt,{$light:!0,htmlFor:`submissions-${i.form.uid}`,children:[i.form.name," (",i.count,")"]})]})},i.form.uid))})]}),Ol=(t,n)=>n.pdf.length===t.pdf.length&&n.wrapper.length===t.wrapper.length&&n.notification.length===t.notification.length&&n.formatting.length===t.formatting.length&&n.success.length===t.success.length,E$=({templates:t,options:n,onUpdate:s})=>!t.pdf.length&&!t.wrapper.length&&!t.notification.length&&!t.formatting.length&&!t.success.length?null:e.jsxs(Ut,{children:[e.jsxs(vn,{children:[e.jsx(wn,{children:e.jsx(ct,{id:"templates-all",checked:Ol(t,n),onChange:()=>Ol(t,n)?s({pdf:[],wrapper:[],notification:[],formatting:[],success:[]}):s({pdf:t.pdf.map(i=>i.uid),wrapper:t.wrapper.map(i=>i.uid),notification:t.notification.map(i=>i.uid),formatting:t.formatting.map(i=>i.fileName),success:t.success.map(i=>i.fileName)})})}),e.jsx(sa,{}),e.jsx(Wt,{htmlFor:"templates-all",children:d("Templates")})]}),e.jsxs("ul",{children:[e.jsx(Je,{nested:!0,label:d("PDF"),labelKey:"name",icon:e.jsx(w$,{}),items:t.pdf,selection:n.pdf,selectionKey:"uid",onUpdate:i=>s({...n,pdf:i})}),e.jsx(Je,{nested:!0,label:d("Wrapper"),labelKey:"name",icon:e.jsx($$,{}),items:t.wrapper,selection:n.wrapper,selectionKey:"uid",onUpdate:i=>s({...n,wrapper:i})}),e.jsx(Je,{nested:!0,label:d("Notification"),labelKey:"name",icon:e.jsx(v$,{}),items:t.notification,selection:n.notification,selectionKey:"uid",onUpdate:i=>s({...n,notification:i})}),e.jsx(Je,{nested:!0,label:d("Formatting"),labelKey:"name",icon:e.jsx(C$,{}),items:t.formatting,selection:n.formatting,selectionKey:"fileName",onUpdate:i=>s({...n,formatting:i})}),e.jsx(Je,{nested:!0,label:d("Success"),labelKey:"name",icon:e.jsx(k$,{}),items:t.success,selection:n.success,selectionKey:"fileName",onUpdate:i=>s({...n,success:i})})]})]}),ji=({data:t,options:n,disabled:s,onUpdate:i})=>{const o=u$(n,t),r=Gp(),a=p$(t);return e.jsx(x$,{className:E(s&&"disabled"),children:e.jsxs(g$,{children:[e.jsx(m$,{onClick:()=>{i(o?r:a)},children:d(o?"Deselect All":"Select All")}),e.jsxs("ul",{children:[e.jsx(Je,{label:d("Forms"),icon:e.jsx(f$,{}),labelKey:"name",selectionKey:"uid",items:t.forms,selection:n.forms,onUpdate:c=>i({...n,forms:c}),labelExtras:c=>c.pages.length>1&&e.jsxs("small",{children:["(",d("{count} pages",{count:c.pages.length}),")"]})}),e.jsx(Je,{label:d("Form Groups"),icon:e.jsx(b$,{}),labelKey:"label",selectionKey:"uid",items:t.formGroups,selection:n.formGroups,onUpdate:c=>i({...n,formGroups:c})}),e.jsx(Je,{label:d("Favorite Fields"),icon:e.jsx(j$,{}),labelKey:"label",selectionKey:"uid",items:t.favorites,selection:n.favorites,onUpdate:c=>i({...n,favorites:c})}),e.jsx(E$,{templates:t.templates,options:n.templates,onUpdate:c=>i({...n,templates:c}),formNames:bf(t.forms,"uid","name")}),e.jsx(Je,{label:d("Integrations"),labelKey:"name",selectionKey:"uid",items:t.integrations,selection:n.integrations,onUpdate:c=>i({...n,integrations:c}),itemIcon:c=>c.icon?e.jsx(Le,{dangerouslySetInnerHTML:{__html:O.sanitize(c.icon)}}):e.jsx(Le,{className:"fa-duotone fa-gear"})}),e.jsx(F$,{submissions:t.formSubmissions,options:n.formSubmissions,onUpdate:c=>i({...n,formSubmissions:c})}),e.jsx(Je,{label:d("Limited Users"),icon:e.jsx(Le,{className:"fa-regular fa-user-shield"}),labelKey:"name",selectionKey:"uid",items:t.limitedUsers,selection:n.limitedUsers,onUpdate:c=>i({...n,limitedUsers:c})}),t.settings&&e.jsx(L$,{value:n.settings,onUpdate:c=>i({...n,settings:c})})]})]})})},T$=t=>Y({opacity:t?1:0,scaleY:t?1:0,height:t?100:0,config:{tension:400}}),N$=t=>Y({opacity:t?1:0,scaleY:t?1:0,height:t?40:0,config:{tension:400}}),z$=l(_.div)`
  transform-origin: center top;
`,M$=l(_.div)`
  transform-origin: left center;
`,I$=l.div`
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
`,A$=l.div`
  margin-top: ${m.lg};
  label {
    font-size: 14px;
  }

  &.primary {
    label {
      font-weight: bold;
    }
  }
`,Yi="rgba(255,255,255,.15)",R$=Uo`
  from { background-position: 30px 0; }
  to { background-position: 0 0; }
`,P$=l.div`
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
      animation: ${R$} 2s linear infinite;
    }
  }
`,D$={primary:"#e12d39",secondary:"#B0BEC5"},_l=({show:t,active:n,variant:s="primary",value:i,max:o,width:r,children:a})=>t?e.jsxs(A$,{className:E(s),children:[a&&e.jsx("label",{children:a}),e.jsx(P$,{style:{width:r},$color:D$[s],$value:i,$max:o,className:E(n&&"active")})]}):null,yi=({label:t,finishLabel:n,event:s})=>{const{progress:{displayProgress:i,showDone:o,progress:r,total:a,info:c,errors:u}}=s,p=T$(i),x=N$(o);return e.jsxs("div",{children:[e.jsxs(z$,{style:p,children:[e.jsx(_l,{width:"60%",show:!0,value:r[0],max:a[0],active:!0,children:t}),e.jsx(_l,{width:"60%",show:!0,variant:"secondary",value:r[1],max:a[1],active:!0,children:c})]}),u?.length>0&&e.jsx("ul",{className:"errors",children:u.map((f,b)=>e.jsx("li",{children:f},b))}),!u?.length&&e.jsx(M$,{style:x,children:e.jsxs(I$,{children:[e.jsx("i",{className:"fa-sharp fa-solid fa-check"}),e.jsx("span",{children:n})]})})]})},vi=()=>{const t=g.useRef(null),n=g.useRef([]),[s,i]=g.useState(),[o,r]=g.useState(!1),[a,c]=g.useState(!1),[u,p]=g.useState(!1),[x,f]=g.useState([0,0]),[b,j]=g.useState([0,0]),[y,w]=g.useState(),[v,$]=g.useState(),C=g.useCallback(z=>{i(z)},[]),F=g.useCallback(()=>{i(void 0),$(void 0),f([0,0]),j([0,0]),r(!0),w(void 0)},[]),N=g.useCallback((z,L)=>{n.current=[...n.current.filter(([A])=>A!==z),[z,L]]},[]),M=g.useCallback(z=>{z.onopen=()=>{c(!0)},z.onerror=()=>{console.error("An error occurred during import"),z.close(),r(!1),c(!1)},z.addEventListener("progress",L=>{const A=parseInt(L.data,10);f(D=>[D[0]+A,D[1]+A])}),z.addEventListener("total",L=>{j([parseInt(L.data,10),0]),$([])}),z.addEventListener("info",L=>{w(L.data)}),z.addEventListener("err",L=>{const A=L.data;$(D=>D===void 0?[A]:[...D,A])}),z.addEventListener("reset",L=>{j(A=>[A[0],parseInt(L.data,10)]),f(A=>[A[0],0])}),z.addEventListener("exit",()=>{z.close(),c(!1),r(!1),p(!0),setTimeout(()=>{p(!1)},5e3)}),n.current.forEach(([L,A])=>{z.addEventListener(L,A)})},[]);return g.useEffect(()=>{t.current&&t.current.close(),s&&(t.current=new EventSource(s),M(t.current))},[s,M]),{progress:{active:o,displayProgress:a,showDone:u,progress:x,total:b,info:y,errors:v},triggerProgress:C,clearProgress:F,attachListener:N}},B$=(t,n)=>{const s=window.URL.createObjectURL(new Blob([t])),i=document.createElement("a");i.href=s,i.setAttribute("download",n),document.body.appendChild(i),i.click(),i.parentNode.removeChild(i)},O$={data:["export","freeform","data"]},_$=()=>T.get("/export/forms/data").then(t=>t.data),W$=()=>B({queryKey:O$.data,queryFn:_$}),U$=t=>ce({mutationFn:n=>T.post("/export/forms/init",n),...t}),H$=()=>{const t=vi(),{attachListener:n,triggerProgress:s,clearProgress:i,progress:{active:o}}=t,{data:r,isFetching:a}=W$(),{mutate:c,isPending:u}=U$({onSuccess:y=>{const w=y.data.token;s(me(`/api/export?server-token=${w}`))}}),[p]=g.useState(!1),[x,f]=g.useState(Gp());g.useEffect(()=>{n("file-token",async y=>{const w=y.data,v=me(`/api/export/download?server-token=${w}`),$=await T.get(v,{responseType:"blob"}),F=`freeform-export-${new Date().toISOString().replace(/[-:]/g,"").replace("T","-").slice(0,-5)}.zip`;B$($.data,F)})},[n]);const b=()=>{i(),c(x)},j=a||p||o||u;return a?e.jsx(Qe,{children:d("Loading...")}):e.jsxs(Qe,{children:[e.jsx(q,{id:"export",label:"Export",url:"export/forms"}),e.jsx(q,{id:"export-forms",label:"Freeform Data",url:"export/forms"}),r&&e.jsx(_t,{label:d("Select Data to Export"),instructions:d("Choose which Freeform data to include in the export. If you export submissions without the corresponding form, the submissions will not be included."),children:e.jsx(ji,{disabled:!1,data:r,options:x,onUpdate:y=>f(y)})}),e.jsx(Dt,{value:x.password||"",updateValue:y=>f({...x,password:y}),property:{handle:"password",label:"Password-protect the Export File (optional)",instructions:"Enter a password if you want to protect your zip file with a password.",type:K.String,placeholder:"Enter a password"}}),e.jsx("div",{className:"field",children:e.jsx("button",{type:"button",disabled:j,onClick:b,className:E("btn","submit",j&&"disabled",ta(x)&&"disabled"),children:e.jsx(Z,{loadingText:d("Exporting..."),loading:j,spinner:!0,children:d("Begin Export")})})}),e.jsx(yi,{label:d("Export Progress"),finishLabel:d("Export completed successfully!"),event:t})]})},ia=({data:t,strategy:n,disabled:s,onUpdate:i})=>e.jsxs("div",{children:[e.jsx(_t,{label:d("Existing Form Behavior"),instructions:d("Choose the behavior Freeform should use if this site contains any forms that match the data in this import."),className:E(s&&"disabled",!t.forms.length&&"hidden"),children:e.jsx("div",{className:"select",children:e.jsxs("select",{value:n.forms,onChange:o=>i({...n,forms:o.target.value}),children:[e.jsx("option",{value:"skip",children:d("Skip")}),e.jsx("option",{value:"replace",children:d("Replace")})]})})}),e.jsx(_t,{label:d("Existing Template Behavior"),instructions:d("Choose the behavior Freeform should use if this site contains any email notification, formatting or success templates that match the data in this import."),className:E(s&&"disabled",!t.templates.notification.length&&"hidden"),children:e.jsx("div",{className:"select",children:e.jsxs("select",{value:n.templates,onChange:o=>i({...n,templates:o.target.value}),children:[e.jsx("option",{value:"skip",children:d("Skip")}),e.jsx("option",{value:"replace",children:d("Replace")})]})})})]}),oa=()=>({forms:[],favorites:[],formGroups:[],limitedUsers:[],formSubmissions:[],templates:{pdf:[],wrapper:[],notification:[],formatting:[],success:[]},integrations:[],strategy:{forms:"skip",templates:"skip"},settings:!1}),q$={data:["expressForms","data"]},Q$=()=>T.get("/import/express-forms/data").then(t=>t.data),K$=()=>B({queryKey:q$.data,queryFn:Q$}),V$=()=>{const[t,n]=g.useState(oa()),s=vi(),i=s.progress.active,{data:o,isFetching:r}=K$(),a=async()=>{s.clearProgress();const{data:c}=await T.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\ExpressFormsExporter",options:t}),u=me(`/api/import?server-token=${c.token}`);s.triggerProgress(u)};return r?e.jsx(Qe,{children:d("Loading...")}):!o.forms.length&&!o.templates.pdf.length&&!o.templates.notification.length&&!o.templates.formatting.length&&!o.templates.success.length&&!o.formSubmissions.length?e.jsx(Qe,{children:d("No data found")}):e.jsxs(Qe,{children:[e.jsx(q,{id:"import",label:"Import",url:"import/express-forms"}),e.jsx(q,{id:"import-express",label:"Express Forms",url:"import/express-forms"}),o&&e.jsx(_t,{label:d("Select Data"),children:e.jsx(ji,{disabled:i,data:o,options:t,onUpdate:c=>n({...t,...c})})}),e.jsx(ia,{data:o,strategy:t.strategy,disabled:i,onUpdate:c=>n(u=>({...u,strategy:c}))}),e.jsx("button",{type:"button",disabled:i,onClick:a,className:E("field btn","submit",i&&"disabled",ta(t)&&"disabled"),children:e.jsx(Z,{loadingText:d("Processing"),loading:i,spinner:!0,children:d("Begin Import")})}),e.jsx(yi,{label:d("Import"),finishLabel:d("Import completed successfully!"),event:s})]})},G$=()=>B({queryKey:["formie","import-data"],queryFn:async()=>{const{data:t}=await T.get("/import/formie/v3/data");return t}}),Y$=()=>{const[t,n]=g.useState(oa()),s=vi(),i=s.progress.active,{data:o,isFetching:r}=G$(),a=async()=>{s.clearProgress();const{data:c}=await T.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FormieV3Exporter",options:t}),u=me(`/api/import?server-token=${c.token}`);s.triggerProgress(u)};return r?e.jsx(Qe,{children:d("Loading...")}):o?!o.forms.length&&!o.templates.pdf.length&&!o.templates.notification.length&&!o.templates.formatting.length&&!o.templates.success.length&&!o.formSubmissions.length?e.jsx(Qe,{children:d("No data found")}):e.jsxs(Qe,{children:[e.jsx(q,{id:"import",label:"Import",url:"import/formie3"}),e.jsx(q,{id:"import-formie3",label:"Formie (v3)",url:"import/formie3"}),o&&e.jsx(_t,{label:d("Select Data"),children:e.jsx(ji,{disabled:i,data:o,options:t,onUpdate:c=>n({...t,...c})})}),e.jsx(ia,{data:o,strategy:t.strategy,disabled:i,onUpdate:c=>n(u=>({...u,strategy:c}))}),e.jsx("button",{type:"button",disabled:i,onClick:a,className:E("field btn","submit",i&&"disabled",ta(t)&&"disabled"),children:e.jsx(Z,{loadingText:d("Processing"),loading:i,spinner:!0,children:d("Begin Import")})}),e.jsx(yi,{label:d("Import"),finishLabel:d("Import completed successfully!"),event:s})]}):e.jsx(Qe,{children:d("No data found")})},J$=l.div`
  //
`,Z$=l.input`
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
`;const X$=()=>{const[t,n]=g.useState(),[s,i]=g.useState(),[o,r]=g.useState(),a=g.useRef(void 0),[c,u]=g.useState(oa()),p=vi(),x=async b=>{r(void 0),n(void 0);const j=b.target.files?.[0];if(!j)return;const y=new FormData;y.append("file",j),a.current&&y.append("password",a.current);try{const{data:w}=await T.post("/api/import/file",y,{headers:{"Content-Type":"multipart/form-data"}});i(w.options),n(w.token)}catch(w){if(r(w?.errors?.import?.file),w.status===403){a.current=void 0;const v=prompt(d("Enter password"));if(!v)return;a.current=v,x(b)}}},f=async()=>{if(!t)return;p.clearProgress();const{data:b}=await T.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FileExportReader",options:{...c,fileToken:t}}),j=me(`/api/import?server-token=${b.token}`);p.triggerProgress(j)};return e.jsxs(Qe,{children:[e.jsx(q,{id:"import",label:"Import",url:"import/forms"}),e.jsx(q,{id:"import-forms",label:"Freeform Data",url:"import/forms"}),e.jsxs(J$,{children:[e.jsx(En,{children:d("Upload a Freeform Export zip file")}),e.jsx(Z$,{type:"file",onChange:x,accept:".zip"}),e.jsx(bd,{children:d("Accepts `.zip` files. Only upload files that you trust.")}),e.jsx(ti,{errors:o})]}),s&&e.jsxs(e.Fragment,{children:[e.jsx(_t,{label:d("Select Data"),instructions:d("Please select the data you want to import."),children:e.jsx(ji,{disabled:!1,data:s,options:c,onUpdate:b=>u({...c,...b})})}),e.jsx(ia,{data:s,strategy:c.strategy,disabled:!1,onUpdate:b=>u(j=>({...j,strategy:b}))}),e.jsx(_t,{children:e.jsx("button",{className:"btn submit",type:"button",onClick:f,children:e.jsx(Z,{loadingText:d("Processing..."),loading:!1,spinner:!0,children:d("Begin Import")})})}),e.jsx(yi,{label:d("Import"),finishLabel:d("Import completed successfully!"),event:p})]})]})};l.div`
  display: flex;
  margin-bottom: 50px;
`;const eC=l.div`
  flex: 1;
  background-color: ${h.white};
  border-radius: 0 ${S.lg} ${S.lg} 0;
`,tC=()=>{const t=g.useRef(null);return g.useEffect(()=>{const n=s=>{if(s.isComposing||s.altKey||s.ctrlKey||s.metaKey)return;const i=s.target;if(!(i&&(i.tagName==="INPUT"||i.tagName==="TEXTAREA"||i.isContentEditable))&&s.key==="/"){s.preventDefault();const o=t.current;o?.focus(),o?.select?.()}};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),t},nC=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{fill:"currentColor",d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"})}),sC=l.div`
  position: relative;
  z-index: 1;
`,iC=l.div`
  position: relative;

  display: flex;
`,oC=l.input`
  position: relative;

  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${h.gray200};
  }
`,rC=l.div`
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
`,Wl="14px",aC=se`
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
`,lC=l.div`
  left: 1px;

  ${aC}

  color: ${h.gray400};
`,cC=({placeholder:t,query:n,setQuery:s})=>{const i=tC();return e.jsx(sC,{children:e.jsxs(iC,{children:[e.jsx(lC,{children:e.jsx(nC,{})}),e.jsx(rC,{children:"/"}),e.jsx(oC,{ref:i,type:"text",placeholder:d(t||"Search"),className:"fullwidth text",value:n,onChange:o=>{s?.(o.target.value)}})]})})},dC="integrations-favorites",Yp=()=>{const[t,n]=Ep(dC,[]),s=g.useCallback(o=>{const r=Hl(o);n(a=>{const c=Ul(a);return c.has(r)?c.delete(r):c.add(r),Array.from(c)})},[n]),i=g.useCallback(o=>{const r=Hl(o);return Ul(t).has(r)},[t]);return{toggleFavorite:s,hasFavorite:i}},Ul=t=>new Set(t.map(n=>n.trim()).filter(Boolean)),Hl=({type:t,shortName:n})=>`${t}:${n}`,ql=l.nav`
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
`,uC=l.div`
  padding: 22px ${m.md};
  border-bottom: 1px solid ${h.hairline};
`,pC=l.ul`
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
`,hC=l.li`
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
`,xC=l.span``,Gl=l.span`
  svg,
  i {
    width: 16px;
    height: 16px;
    font-size: 16px;
    line-height: 16px;

    vertical-align: middle;
  }
`,mC=l.span`
  font-size: 10px;
  color: ${h.gray300};
  margin-left: auto;
`,Yl=({entry:t})=>{const n=I.editions.edition,{pathname:s}=Ht(),i=t.type,o=t.type.name,r=t.instances.length>0,a=t.type.editions.length>0&&!t.type.editions.includes(n),c=t.instances.length,u=c>1?c:"";let p=`${i.type}/${i.shortName}`;const x=s.includes(p);return c>0&&(p+=`/${t.instances[0].id}`),e.jsx(hC,{children:e.jsxs(he,{to:p,className:E(x&&"active",a&&"unsupported"),children:[e.jsx(Ws,{className:E(r&&!a&&"active",a&&"unsupported"),children:u}),t.type.iconSvg&&e.jsx(Gl,{dangerouslySetInnerHTML:{__html:O.sanitize(t.type.iconSvg)}}),!t.type.iconSvg&&e.jsx(Gl,{children:e.jsx("i",{className:"fa-solid fa-cog"})}),e.jsx(xC,{children:o}),i.version&&e.jsx(mC,{children:i.version})]})})},Jp=()=>B({queryKey:ze.navigation,queryFn:()=>T.get("/api/integrations/navigation").then(t=>t.data),gcTime:1/0,staleTime:1/0}),gC=()=>{const{data:t,isFetching:n}=Jp(),{hasFavorite:s}=Yp(),[i,o]=g.useState("");if(n&&!t)return e.jsx(ql,{});const r=t.map(u=>({...u,entries:u.entries.filter(p=>p.type.name.toLowerCase().includes(i.toLowerCase())||p.instances.some(x=>x.name.toLowerCase().includes(i.toLowerCase())))})).filter(u=>u.entries.length>0),a=r.flatMap(u=>u.entries.filter(p=>s(p.type))),c=r.map(u=>({...u,entries:u.entries.filter(p=>!s(p.type))})).filter(u=>u.entries.length>0);return e.jsxs(ql,{children:[e.jsx(uC,{children:e.jsx(cC,{query:i,setQuery:o})}),e.jsxs(pC,{children:[a.length>0&&e.jsxs(Ql,{children:[e.jsx(Kl,{children:d("Favorites")}),e.jsx(Vl,{children:a.map(u=>e.jsx(Yl,{entry:u},u.type.shortName))})]},"favorites"),c.map(u=>e.jsxs(Ql,{children:[e.jsx(Kl,{children:u.title}),e.jsx(Vl,{children:u.entries.map(p=>e.jsx(Yl,{entry:p},p.type.shortName))})]},u.handle))]})]})},fC=()=>(Fn("integrations"),e.jsxs("div",{children:[e.jsx(q,{id:"integrations",label:"Integrations",url:"integrations"}),e.jsx(Ln,{children:d("Integrations")}),e.jsxs(Du,{children:[e.jsx(gC,{}),e.jsx(eC,{children:e.jsx(jt,{})})]})]})),bC=({property:t,integration:n,autoFocus:s,values:i,errors:o,onUpdate:r})=>{const a=vs(n.properties,{},(f,b)=>{r?.(f,b)}),c=t.handle,u=i.metadata[c]??t.value,p={...t,flags:(t.flags||[])?.filter(f=>f!=="as-readonly-in-instance")},x={...n,values:{name:i.name,handle:i.handle,enabled:i.enabled,...i.metadata}};return e.jsx(je,{autoFocus:s,value:u,property:p,updateValue:a(p),errors:o?.metadata?.[c],context:x})},Po=l.div`
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
`,Zp=l.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    font-size: 20px;
    font-weight: bold;
    color: #414141;
  }
`,jC=l.small`
  margin-top: 6px;

  font-size: 12px;
  font-weight: normal;
  font-family: monospace;
  color: ${h.gray300};
`,yC=l.button`
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
`,Xp=l.div`
  svg {
    width: 30px;
    height: 30px;
  }

  &.spinning {
    animation: spin 2s linear infinite;
    fill: ${h.gray300};
  }
`,vC=l.div`
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-rows: auto;

  align-items: center;
  gap: 10px;
`,Qn=l.div`
  flex: 0 0 10px;

  display: block;
  width: 10px;
  height: 10px;

  border-radius: 10px;
`,wC=l.div`
  flex: 1;
  white-space: nowrap;
`,$C=l.div`
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

    ${Qn} {
      background: #27ae60;
      border: 1px solid #27ae60;
    }
  }

  &.unauthorized {
    background-color: rgba(51, 197, 255, 0.2);

    ${Qn} {
      background: rgba(51, 197, 255, 1);
      border: 1px solid rgba(51, 197, 255, 1);
    }
  }

  &.pending {
    background-color: rgba(55, 65, 81, 0.05);

    ${Qn} {
      background: #ccd1d6;
      border: 1px solid #ccd1d6;
    }
  }

  &.error {
    background-color: rgba(239, 68, 68, 0.2);

    ${Qn} {
      background: #d0021b;
      border: 1px solid #d0021b;
    }
  }
`,CC=l.div`
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
`,kC=l.ul`
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
`,SC=()=>e.jsxs(ra,{children:[e.jsxs(Zp,{children:[e.jsx(Xp,{className:"spinning",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 640",children:[e.jsx("title",{children:"Loading"}),e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})]})}),e.jsx(k,{width:200})]}),e.jsx("hr",{}),e.jsxs("div",{children:[e.jsx(k,{width:80}),e.jsx(k,{width:270,height:10}),e.jsx(k,{width:"100%",height:30})]}),e.jsx("hr",{}),e.jsxs("div",{children:[e.jsx(k,{width:180}),e.jsx(k,{width:200,height:10}),e.jsx(k,{width:"100%",height:30})]}),e.jsxs("div",{children:[e.jsx(k,{width:70}),e.jsx(k,{width:340,height:10}),e.jsx(k,{width:"100%",height:30})]})]}),LC=({integration:t})=>{if(t.supported)return null;let n=I.editions.edition;return n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase(),e.jsx(FC,{children:e.jsx(at,{title:d("Not available for {edition} edition",{edition:n}),subtitle:d("Upgrade to Pro to get access to this integration."),icon:e.jsx(ps,{}),children:e.jsx("a",{href:Craft.getCpUrl("plugin-store/freeform"),target:"_blank",rel:"noreferrer",children:d("Plugin Store")})})})},FC=l.div`
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
`,EC=(t,n,s)=>{const i=I.editions.edition;let o="/api/integrations/properties/";return s&&s!=="new"?o+=s:o+=`${t}/${n}`,B({queryKey:ze.properties(t,n,s),queryFn:()=>T.get(o).then(r=>r.data).then(r=>({...r,supported:r.type.editions.length===0||r.type.editions.includes(i)}))})},TC=(t,n,s)=>{const i=ee(),o=ne();return ce({mutationFn:r=>{const a={class:t,values:r};return T.post(`/api/integrations${n&&n!=="new"?`/${n}`:""}`,a).then(c=>c.data)},onSuccess:r=>{const{id:a,type:c,integration:u}=r;Xe.success(d("Integration saved successfully")),i.invalidateQueries({queryKey:ze.all}),a&&o(`/integrations/${c}/${u}/${a}`)},onError:s})},Xl=l.div`
  margin: 0 -24px;
  padding: 0 24px;

  background-color: #f3f7fc;

  border-top: 1px solid ${h.hr};
`,NC=l.div`
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
`,zC=l.div`
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
`,MC=({active:t,content:n})=>{const s=V1.parse(n,{gfm:!0,async:!1});return n?e.jsx(Xl,{children:e.jsx(NC,{className:E("markdown-body",t&&"active"),children:e.jsx(zC,{dangerouslySetInnerHTML:{__html:O.sanitize(s)}})})}):e.jsx(Xl,{})},e1=t=>{const n=window.Craft;return n?.sendActionRequest?n.sendActionRequest("POST",t):fetch(`/actions/${t}`,{method:"POST",credentials:"same-origin"})},IC=()=>e1("freeform/form-monitor/disable-me").then(()=>{}),AC=()=>e1("freeform/form-monitor/delete-me").then(()=>{}),RC=({onClose:t,onConfirm:n})=>{const[s,i]=g.useState(!1),[o,r]=g.useState(!1),[a,c]=g.useState(""),u=async()=>{if(o)try{i(!0),await n(),t()}finally{i(!1)}};return g.useEffect(()=>{r(a.toUpperCase()==="CONFIRM")},[a]),e.jsx(wt,{closeModal:t,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Disable Monitoring")})}),e.jsxs(hs,{children:[e.jsx("div",{children:d("Are you sure you want to disable monitoring for this site?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(d("To disable monitoring, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:a,autoComplete:"off",onChange:p=>c(p.target.value),className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",disabled:s,className:"btn cancel",onClick:t,children:d("Cancel")}),e.jsx("button",{type:"button",disabled:!o||s,className:E("btn submit",!o&&"disabled"),onClick:u,children:d("Disable")})]})]})})},PC=({onClose:t,onConfirm:n})=>{const[s,i]=g.useState(!1),[o,r]=g.useState(""),[a,c]=g.useState(!1),u=async()=>{if(s)try{c(!0),await n(),t()}finally{c(!1)}};return g.useEffect(()=>{i(o.toUpperCase()==="CONFIRM")},[o]),e.jsx(wt,{closeModal:t,children:e.jsxs(ve,{children:[e.jsx(we,{children:e.jsx("h1",{children:d("Disable & Delete Monitoring Data")})}),e.jsxs(hs,{children:[e.jsx("div",{children:d("Are you sure you want to disable monitoring and delete all monitoring data for this site?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(d("To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:o,autoComplete:"off",onChange:p=>r(p.target.value),className:"text fullwidth"})]}),e.jsxs($e,{children:[e.jsx("button",{type:"button",disabled:a,className:"btn cancel",onClick:t,children:d("Cancel")}),e.jsx("button",{type:"button",disabled:!s||a,className:E("btn submit",!s&&"disabled"),onClick:u,children:d("Disable & Delete")})]})]})})},DC=()=>{const t=ee(),n=ne(),[s,i]=g.useState(!1),[o,r]=g.useState(!1),a=()=>i(!0),c=()=>r(!0);return e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"btn small",onClick:a,children:e.jsx("span",{children:d("Disable Monitoring")})}),e.jsx("button",{type:"button",className:"btn small",onClick:c,children:e.jsx("span",{children:d("Disable & Delete Monitoring Data")})}),s&&e.jsx(RC,{onClose:()=>i(!1),onConfirm:async()=>{await IC(),t.invalidateQueries({queryKey:ze.all}),Xe.success(d("Monitoring disabled."))}}),o&&e.jsx(PC,{onClose:()=>r(!1),onConfirm:async()=>{await AC(),t.invalidateQueries({queryKey:ze.all}),Xe.success(d("Monitoring disabled and data deleted.")),n("/integrations",{replace:!0})}})]})},BC=t=>t.type.class==="Solspace\\Freeform\\Integrations\\Single\\FormMonitor\\FormMonitor",OC=t=>e.jsxs(R,{viewBox:"0 0 640 640",...t,children:[e.jsx("path",{className:"star-filler",d:"M119.2 254.7L209 344.6C214.4 350 216.9 357.7 215.7 365.3L195.9 490.8L309.2 433.2C316 429.7 324.1 429.7 331 433.2L444.3 490.8L424.5 365.3C423.3 357.7 425.8 350 431.2 344.6L521 254.7L395.5 234.7C387.9 233.5 381.4 228.7 377.9 221.9L320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8z"}),e.jsx("path",{d:"M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"})]}),_C=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z"})}),WC=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z"})}),UC=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 64C324.6 64 329.2 65 333.4 66.9L521.8 146.8C543.8 156.1 560.2 177.8 560.1 204C559.6 303.2 518.8 484.7 346.5 567.2C329.8 575.2 310.4 575.2 293.7 567.2C121.3 484.7 80.6 303.2 80.1 204C80 177.8 96.4 156.1 118.4 146.8L306.7 66.9C310.9 65 315.4 64 320 64zM320 130.8L320 508.9C458 442.1 495.1 294.1 496 205.5L320 130.9L320 130.9z"})}),HC=(t,n)=>{const s=Craft.getCpUrl(`freeform/integrations/${t}/authorize`),i=600,o=700,r=window.screenX+(window.outerWidth-i)/2,a=window.screenY+(window.outerHeight-o)/2,u=Object.entries({width:i,height:o,top:a,left:r,toolbar:0,menubar:0}).map(([f,b])=>`${f}=${b}`).join(","),p=window.open(s,"OAuthFlow",u),x=f=>{f.origin===window.location.origin&&f.data.type==="oauth2"&&(p?.close(),n(),window.removeEventListener("message",x))};window.addEventListener("message",x)},qC=t=>{const{id:n}=t;return B({queryKey:ze.authCheck(n),enabled:!!n&&t.implements.includes("apiIntegration"),queryFn:async()=>T.get(`/api/integrations/${n}/status`).then(s=>s.data)})},QC=["authorized","unauthorized","error"],KC=["authorized","error"],VC=({integration:t})=>{const n=ee(),s=ne(),[i,o]=g.useState("pending"),[r,a]=g.useState([]),[c,u]=g.useState(!1),{toggleFavorite:p,hasFavorite:x}=Yp(),{data:f,isFetching:b,refetch:j}=qC(t);g.useEffect(()=>{b?(o("pending"),a([])):f&&(o(f.status),a(f.errors||[]))},[f,b]);const y=()=>{confirm(d("Are you sure you want to remove this integration?"))&&T.post(`/api/integrations/${t.id}/delete`).then(()=>{n.invalidateQueries({queryKey:ze.all}),s("/integrations"),Xe.success(d("Integration deleted successfully."))})},w=BC({...t,id:String(t.id)}),v=I.permissions.integrations==="manage",$=v&&t.id&&t.supported,C=x(t.type),F=!!t.type.readmeContent,N=v&&t.id&&t.supported&&t.implements.includes("apiIntegration");return e.jsxs(e.Fragment,{children:[e.jsxs(Zp,{children:[e.jsx(Xp,{dangerouslySetInnerHTML:{__html:O.sanitize(t.type.iconSvg)}}),e.jsx("span",{children:t.name||t.type.name}),t.type.version&&e.jsx(jC,{children:t.type.version}),e.jsx(yC,{type:"button",className:E(C&&"active"),onClick:()=>p(t.type),title:d("Favorite"),children:e.jsx(OC,{})}),N&&e.jsxs(vC,{children:[e.jsxs($C,{className:i,children:[e.jsx(Qn,{}),e.jsx(wC,{children:GC[i]})]}),e.jsxs(Ji,{children:[KC.includes(i)&&e.jsx(Zi,{className:"btn small",onClick:()=>j(),children:e.jsx(WC,{})}),QC.includes(i)&&e.jsxs(Zi,{className:"btn small",onClick:()=>HC(t.id,j),children:[e.jsx(UC,{}),e.jsx("span",{children:d("Authorize")})]})]})]}),F&&e.jsx(Ji,{children:e.jsxs(Zi,{className:"btn small info-button",onClick:()=>u(!c),children:[e.jsx(_C,{}),e.jsx("span",{children:d("Show Instructions")})]})}),v&&t.enabled&&w&&i==="authorized"&&e.jsx(Ji,{children:e.jsx(DC,{})}),$&&e.jsx(CC,{children:e.jsx(Nn,{active:!0,onClick:y})})]}),r.length>0&&e.jsx(kC,{children:r.map((M,z)=>{try{const L=JSON.parse(M);if(L)return e.jsx("li",{children:e.jsx("pre",{children:JSON.stringify(L,null,2)})},z)}catch{}return e.jsx("li",{children:M},z)})}),e.jsx(MC,{active:c,content:t.type.readmeContent})]})},GC={authorized:d("Authorized"),unauthorized:d("Unauthorized"),pending:d("Checking..."),error:d("Error")},YC=()=>{const t=ne(),{type:n,integration:s,id:i}=V(),{data:o,isFetching:r}=EC(n,s,i),{data:a}=Jp();g.useEffect(()=>{if(a&&s&&!i){const z=a.find(A=>A.handle===n);if(!z)return;const L=z.entries.find(A=>A.type.shortName===s);if(L){const A=L.instances?.[0];if(A){t(`/integrations/${n}/${s}/${A.id}`);return}}}},[a,s,i,t,n]);const[c,u]=g.useState({name:"",handle:"",enabled:!0,metadata:{}}),[p,x]=g.useState({}),{mutate:f,isPending:b}=TC(o?.type.class,i,z=>{if(!z.errors){x({});return}const L={metadata:{}};Object.entries(z.errors).forEach(([A,D])=>{/^metadata\./.test(A)?L.metadata[A.replace(/^metadata\./,"")]=D:L[A]=D}),x(L)});g.useEffect(()=>{b&&x({})},[b]),g.useEffect(()=>{if(o){const z=o.properties.reduce((L,A)=>(L[A.handle]=A.value,L),{});u({name:o.name,handle:o.handle,enabled:o.enabled,metadata:z})}},[o]);const j=I.permissions.integrations==="manage",y=i==="new",w=r||!o,v=()=>{o?.supported&&f(c)};_r(v);const $=a?.find(z=>z.handle===n)?.entries?.find(z=>z.type.shortName===s)?.instances,C=$?.length||0,F=C>1||y,N=!!o?.type?.singleton,M=C>0&&n!==fu.Singles&&!N;return!n||!s?null:w?e.jsxs(Po,{children:[F&&e.jsx(Zl,{children:$?.map(z=>e.jsx(he,{to:`../${n}/${s}/${z.id}`,children:e.jsx("span",{children:z.name})},z.id))}),j&&e.jsx(Jl,{children:e.jsxs("div",{className:"btngroup",children:[M&&e.jsx("button",{type:"button",title:d("Add new integration of the same type"),className:E("btn","add","icon","disabled")}),e.jsx("button",{type:"button",className:E("btn",o?.supported&&"submit","disabled"),children:d("Save")})]})}),e.jsx(SC,{})]}):e.jsxs(Po,{children:[e.jsx(q,{id:"integration-edit",label:o.name,url:`integrations/${n}/${s}${i?`/${i}`:""}`}),e.jsx(LC,{integration:o}),F&&e.jsxs(Zl,{children:[$.map(z=>e.jsx(he,{to:`../${n}/${s}/${z.id}`,children:e.jsx("span",{children:z.name})},z.id)),y&&e.jsx("a",{className:"active",children:e.jsx("span",{children:d("Create a new instance")})})]}),j&&e.jsx(Jl,{children:e.jsxs("div",{className:"btngroup",children:[M&&e.jsx("button",{type:"button",title:d("Add new integration of the same type"),className:E("btn","add","icon",!o.supported&&"disabled"),onClick:()=>t(`/integrations/${n}/${s}/new`)}),e.jsx("button",{type:"button",className:E("btn",o.supported?"submit":"disabled"),onClick:v,children:e.jsx(Z,{loading:b,loadingText:d("Saving"),spinner:!0,children:d("Save")})})]})}),e.jsxs(ra,{children:[e.jsx(VC,{integration:o}),e.jsx(Dt,{property:{handle:"name",label:"Name",required:!0,instructions:d("What this integration will be called in the CP."),type:K.String},updateValue:z=>{u(L=>({...L,name:z,handle:Jo(z,{transliterate:!0,camelize:!0})}))},value:c.name,errors:p?.handle,autoFocus:o.supported}),e.jsx("hr",{}),o.properties.map(z=>e.jsx(bC,{integration:o,property:z,values:c,errors:p,onUpdate:(L,A)=>{u(D=>({...D,metadata:{...D.metadata,[L]:A}}))}},z.handle))]})]})},JC=()=>e.jsx(Po,{children:e.jsx(ra,{children:e.jsx(at,{title:d("Please select an integration"),subtitle:d("To add a new integration, select its type in the sidebar."),icon:e.jsx(ps,{})})})}),ws={all:["limited-users"],one:t=>[...ws.all,t]},ZC=()=>B({queryKey:ws.all,queryFn:()=>T.get("/api/limited-users").then(t=>t.data),staleTime:1/0}),XC=t=>B({queryKey:ws.one(t),queryFn:()=>T.get(`/api/limited-users/${t}`).then(n=>n.data),staleTime:1/0}),ek=t=>{const n=ee();return ce({mutationFn:s=>T.post(`/api/limited-users/${t}`,{name:s.name,description:s.description,items:s.items}),onSuccess:()=>{n.invalidateQueries({queryKey:ws.all})}})},tk=()=>{const t=ee();return ce({mutationFn:n=>T.delete(`/api/limited-users/${n}/delete`),onSuccess:()=>{t.invalidateQueries({queryKey:ws.all})}})},t1=l.div`
  &.craft-4 {
    max-width: calc(100% - 250px) !important;
    width: calc(100% - 250px) !important;
  }
`,nk=l.div`
  background-color: white;
  padding: ${m.xl};
  border-radius: 5px;
`,$n=l.div`
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
`,sk=l.h2`
  margin: 0;
  padding: 0;
`,la=l.div`
  grid-area: control;
`,ik=l.div`
  grid-area: control-area;
`,ok=l.ul`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`,rk=l.li`
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
`,n1=l.div`
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
`,s1=l.ul`
  transition: opacity 0.2s ease-out;
`,ak=l.li`
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
    ${$n} {
      gap: 10px;

      &:before {
        content: '—';
      }
    }
  }

  &[data-nesting='3'] {
    ${$n} {
      gap: 10px;

      &:before {
        content: '———';
      }
    }
  }
`,lk=()=>{const{data:t,isFetching:n}=ZC(),s=tk(),i=I.editions.isAtLeast(re.Pro),o=I.metadata.craft.is5;return Fn("freeform/settings"),!t&&n?e.jsx("div",{children:"Loading..."}):e.jsxs("div",{children:[e.jsx(q,{id:"settings",label:d("Settings"),url:".",external:!0}),e.jsx(q,{id:"limited-users",label:d("Limited Users"),url:"settings/limited-users"}),e.jsx(Ln,{extra:i&&e.jsx(rt,{to:"new",className:"btn submit add icon",children:d("New Group")}),children:d("Limited Users")}),e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx(or,{activeKey:"limited-users"}),e.jsx(t1,{id:"content-container",className:E(!o&&"craft-4"),children:e.jsxs("div",{id:"content",className:"content-pane",children:[i&&e.jsxs("div",{className:"tablepane",children:[t.length>0&&e.jsxs("table",{className:"data fullwidth",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:d("Name")}),e.jsx("th",{children:d("Description")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{children:[e.jsx("th",{children:e.jsx(rt,{to:`${r.id}`,children:r.name})}),e.jsx("td",{children:r.description}),e.jsx("td",{className:"thin",children:e.jsx("a",{className:"delete icon",title:d("Delete"),onClick:()=>{confirm(d("Are you sure you want to delete this?"))&&s.mutate(r.id)}})})]},r.id))})]}),t.length===0&&e.jsx("div",{style:{padding:"100px 0 100px"},children:e.jsx(at,{title:d("No groups exist yet"),subtitle:d('Click on the "New Group" button to set up your first Limited User permission group.')})})]}),!i&&e.jsx(at,{lite:!0,title:d("Upgrade to the Freeform Pro edition to get access to the Limited Users feature.")})]})})]})]})},ck=({item:t,updateValue:n})=>e.jsxs(wi,{children:[e.jsx(la,{children:e.jsx(en,{enabled:t.enabled,onClick:s=>n(s)})}),e.jsx($n,{children:e.jsx(aa,{onClick:()=>n(!t.enabled),children:d(t.name)})})]}),dk=({item:t,updateValue:n})=>e.jsxs(wi,{children:[e.jsx(la,{children:e.jsx("div",{className:"select",children:e.jsx("select",{value:t.value,onChange:s=>n(s.target.value),children:t.options.map(s=>e.jsx("option",{label:d(s.label),value:s.value},s.value))})})}),e.jsx($n,{children:e.jsx(aa,{children:t.name})})]}),uk=({item:t,updateValue:n})=>{const s=i=>()=>{n(t.values.includes(i)?t.values.filter(o=>o!==i):[...t.values,i])};return e.jsxs(wi,{className:"triage",children:[e.jsx(la,{}),e.jsxs($n,{children:[e.jsx(aa,{children:d(t.name)}),e.jsxs(n1,{children:[e.jsx("a",{className:E(t.values.length===t.options.length&&"disabled"),onClick:()=>n(t.options.map(i=>i.value)),children:d("Enable All")}),e.jsx("a",{className:E(t.values.length===0&&"disabled"),onClick:()=>n([]),children:d("Disable All")})]})]}),e.jsx(ik,{children:e.jsx(ok,{children:t.options.map(i=>e.jsxs(rk,{onClick:s(i.value),className:E(t.values.includes(i.value)&&"selected"),children:[t.values.includes(i.value)&&e.jsx("i",{className:"fa-sharp fa-solid fa-check"}),d(i.label)]},i.value))})})]})},pk=({item:t,nesting:n,updateValue:s})=>{const i=o=>()=>{const r=(a,c)=>{const u=c?`${c}.${a.id}`:a.id,p=[];if(a.type==="boolean"&&p.push([u,o]),a.children){const x=a.children.map(f=>r(f,u));p.push(...x.flat())}return p};s(r(t))};return e.jsx(wi,{className:"solo",children:e.jsxs($n,{children:[e.jsx(sk,{children:d(t.name)}),n===0&&e.jsxs(n1,{children:[e.jsx("a",{onClick:i(!0),children:d("Enable All")}),e.jsx("a",{onClick:i(!1),children:d("Disable All")})]})]})})},i1=({item:t,parentId:n,nesting:s=0,updateValue:i})=>{const o=n?`${n}.${t.id}`:t.id;let r;switch(t.type){case"boolean":r=e.jsx(ck,{item:t,updateValue:a=>i(o,{enabled:a})});break;case"select":r=e.jsx(dk,{item:t,updateValue:a=>i(o,{value:a})});break;case"toggles":r=e.jsx(uk,{item:t,updateValue:a=>i(o,{values:a})});break;case"group":r=e.jsx(pk,{item:t,nesting:s,updateValue:a=>{a.forEach(([c,u])=>{i(c,{enabled:u})})}});break}return e.jsxs(ak,{"data-type":t.type,"data-nesting":s,children:[r,t.children&&e.jsx(s1,{className:E(t.type==="boolean"&&!t.enabled&&"disabled"),children:t.children.map(a=>e.jsx(i1,{item:a,parentId:o,nesting:s+1,updateValue:i},a.id))})]})},hk=()=>{const{id:t}=V(),{data:n,isFetching:s}=XC(t),i=ne(),[o,r]=g.useState(""),[a,c]=g.useState(""),[u,p]=g.useState([]),x=ek(t),f=I.metadata.craft.is5;Fn("freeform/settings"),g.useEffect(()=>{n&&(r(n.name),c(n.description),p(n.items))},[n]);const b=(y,w)=>{const v=($,C)=>$.map(F=>{const N=C?`${C}.${F.id}`:F.id;return N===y?{...F,...w}:F.children?{...F,children:v(F.children,N)}:F});p($=>v($))},j=(y=!0)=>()=>{x.mutate({name:o,description:a,items:u},{onSuccess:()=>{y&&i("/settings/limited-users"),Xe.success(d("Permission saved successfully."))}})};return _r(j(!1)),!n&&s?e.jsx("div",{children:d("Loading...")}):e.jsxs("div",{children:[e.jsx(q,{id:"settings",label:d("Settings"),url:"..",external:!0}),e.jsx(q,{id:"limited-users",label:d("Limited Users"),url:"settings/limited-users"}),e.jsx(q,{id:"limited-users-id",label:n?.name,url:`settings/limited-users/${t}`}),e.jsx(Ln,{extra:e.jsx("button",{type:"button",className:"btn submit",onClick:j(),children:e.jsx(Z,{loading:x.isPending,loadingText:d("Saving"),spinner:!0,children:d("Save")})}),children:d("Limited Users")}),e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx(or,{activeKey:"limited-users"}),e.jsx(t1,{id:"content-container",className:E(!f&&"craft-4"),children:e.jsx("div",{id:"content",className:"content-pane",style:{padding:0},children:e.jsxs(nk,{children:[e.jsx(Dt,{property:{handle:"name",label:d("Name"),instructions:d("Enter the name of the limited user permission."),type:K.String},value:o,updateValue:y=>r(y)}),e.jsx("br",{}),e.jsx(ds,{property:{handle:"description",label:d("Description"),instructions:d("Enter a description for this permission."),type:K.Textarea,rows:4,flags:[]},value:a,updateValue:y=>c(y)}),e.jsx("hr",{}),e.jsx(s1,{children:u.map(y=>e.jsx(i1,{item:y,updateValue:b},y.id))})]})})})]})]})},xn={all:["surveys","results"],single:t=>[...xn.all,t],preferences:t=>[...xn.single(t),"preferences"],chart:t=>[...xn.single(t),"chart"]},ca=()=>{const{handle:t}=V();return B({queryKey:xn.single(t),queryFn:()=>T.get(`/api/surveys/form/${t}`).then(n=>n.data),staleTime:1/0,enabled:!!t})},o1=()=>{const{handle:t}=V();return B({queryKey:xn.preferences(t),queryFn:()=>T.get(`/api/surveys/preferences/${t}`).then(n=>n.data),staleTime:1/0})},r1=()=>{const{handle:t}=V();return B({queryKey:xn.chart(t),queryFn:()=>T.get(`/api/surveys/chart/${t}`).then(n=>n.data),staleTime:1/0})},a1=l.div`
  position: relative;
`,l1=l.h1`
  position: absolute;
  top: ${m.md};
  left: ${m.xl};

  font-size: 40px;
  user-select: none;
  pointer-events: none;
`,c1=l.div`
  margin-top: -3px;
  height: 20px;
  background: linear-gradient(
    to bottom,
    ${({$color:t})=>`${t}1A 30%, transparent 100%`}
  );
`,xk=l.div`
  padding: ${m.sm} ${m.md};
  background-color: white;
  border: 2px solid ${({$color:t})=>t};
`,mk=()=>{const{data:t,isFetching:n}=ca(),{data:s,isFetching:i}=r1();if(i||n)return null;const{form:{id:o,name:r,color:a}}=t,c=({active:p,payload:x})=>{if(p&&x&&x.length){const{payload:{name:f,y:b}}=x[0];return e.jsxs(xk,{$color:a,children:[f,": ",e.jsx("b",{children:b})," submissions"]})}},u=Math.max(...s.map(p=>p.y))*2;return e.jsxs(a1,{$color:a,children:[e.jsx(l1,{children:r}),e.jsx(nt,{width:"100%",height:80,children:e.jsxs(yt,{data:s,margin:{top:0,left:0,right:0,bottom:3},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${o}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:a,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:a,stopOpacity:.1})]})}),e.jsx(vt,{type:"monotone",dataKey:"y",stroke:a,strokeWidth:1,strokeOpacity:1,fillOpacity:1,isAnimationActive:!1,fill:`url(#color${o})`}),u>0&&e.jsx(_o,{domain:[0,u],hide:!0}),e.jsx(Wo,{content:e.jsx(c,{})})]})}),e.jsx(c1,{$color:a})]})};var ht=(t=>(t.Horizontal="Horizontal",t.Vertical="Vertical",t.Pie="Pie",t.Donut="Donut",t.Hidden="Hidden",t.Text="Text",t))(ht||{});const gk=t=>e.jsx(R,{height:"16",width:"16",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"})}),fk=({fieldId:t,chartType:n})=>{const s={fieldId:t,chartType:n};return T.post("/api/surveys/preferences",s)},bk=()=>ce({mutationFn:fk}),jk=l.div`
  grid-area: settings;

  position: relative;
`,d1=l.button`
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
`,yk=l.div`
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
`,vk=l.a`
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
`,wk=Object.keys(ht),ec=({fieldId:t,selectedChartType:n,isShown:s,toggle:i,changeType:o})=>{const{mutate:r,isPending:a}=bk();return e.jsxs(d1,{className:E(a&&"loading",s&&"open"),onClick:i,children:[e.jsx(gk,{}),s&&e.jsx(yk,{children:wk.map(c=>e.jsx(vk,{className:n===c&&"selected",onClick:()=>{o(c),r({fieldId:t,chartType:c})},children:c},c))})]})},$k=l.li`
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
`,Ck=l.div`
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
`,kk=l.div`
  grid-area: label;
`,Sk=l.div`
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
`,Lk=l.div`
  position: relative;

  font-size: 12px;
  color: #ccc;
`,Fk=l.div`
  position: absolute;
  right: 0;
  top: 0;
`,Ek=l.div`
  grid-area: numbers;
`,Tk=l.li`
  position: relative;

  padding: 3px 0;
  margin-bottom: 42px;

  background: #f3f7fd;
  text-align: center;
  font-size: 12px;

  ${d1} {
    position: absolute;
    left: 0;
    top: 0;

    width: 40px;
  }
`,Nk=(t,n,s=1)=>n(t).replace(/rgb\((\d+, \d+, \d+)\)/i,`rgba($1, ${s})`),zk=t=>{const n=Math.max(0,Math.min(1,t)),s=Math.max(0,Math.min(255,Math.round(34.61+n*(1172.33-n*(10793.56-n*(33300.12-n*(38394.49-n*14825.05))))))),i=Math.max(0,Math.min(255,Math.round(23.31+n*(557.33+n*(1225.33-n*(3574.96-n*(1073.77+n*707.56))))))),o=Math.max(0,Math.min(255,Math.round(27.2+n*(3211.1-n*(15327.97-n*(27814-n*(22569.18-n*6838.66)))))));return`rgb(${s}, ${i}, ${o})`},tc=Math.PI/180,u1=({breakdown:t,pie:n})=>{const s=t.filter(({votes:r})=>r>0),i=t.map(({ranking:r})=>Nk(r/t.length,zk)),o=({cx:r,cy:a,midAngle:c,outerRadius:u,percent:p,index:x})=>{const f=u+30,b=r+f*Math.cos(-c*tc),j=a+f*Math.sin(-c*tc);return e.jsxs("text",{x:b,y:j,fill:"black",textAnchor:b>r?"start":"end",dominantBaseline:"central",children:[e.jsx("tspan",{style:{fontWeight:"bold"},children:s[x].label}),e.jsxs("tspan",{style:{fontSize:"12px",fill:"#999"},children:[" ","(",`${(p*100).toFixed(0)}%`,")"]})]},x)};return e.jsx("div",{style:{width:800},children:e.jsx(nt,{width:"100%",height:400,children:e.jsx(G1,{children:e.jsx(Y1,{data:s,dataKey:"votes",nameKey:"label",cx:"50%",cy:"50%",outerRadius:180,innerRadius:n?0:100,fill:"#82ca9d",labelLine:!0,label:o,children:s.map((r,a)=>e.jsx(J1,{fill:i[a]},`cell-${a}`))})})})})},Mk=()=>e.jsx("div",{children:"hidden"}),Ik=l.div`
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
`,Ak=l.div`
  grid-area: label;

  font-weight: bold;
`,Rk=l.div`
  grid-area: percentage;

  font-size: 14px;
  font-weight: bold;
  text-align: right;
`,Pk=l.div`
  grid-area: votes;

  color: #c2c5c7;
  font-size: 12px;
  text-align: right;
`,Dk=l.div`
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
`,Bk=({breakdown:t})=>e.jsx(e.Fragment,{children:t.map(({label:n,value:s,votes:i,percentage:o,ranking:r})=>e.jsxs(Ik,{children:[e.jsx(Ak,{children:n}),e.jsxs(Pk,{children:[i," ",d("resp.")]}),e.jsxs(Rk,{children:[Math.round(o),"%"]}),e.jsx(Dk,{percentage:o,ranking:r})]},s.toString()))}),Ok=({breakdown:t})=>e.jsx(u1,{breakdown:t,pie:!0}),_k=l.div``,Wk=l.div`
  padding: 10px 15px;

  &:not(:last-child) {
    border-bottom: 1px solid #eff3f6;
  }
`,Uk=({breakdown:t})=>e.jsx(_k,{children:t.map(n=>e.jsxs(Wk,{children:[n.label,n.votes>1&&` (${n.votes})`]},n.value.toString()))}),Hk=l.div`
  width: 900px;
  overflow-x: auto;

  ${Q};
`,qk=l.div`
  display: grid;
  gap: 10px;
  grid-auto-columns: minmax(80px, 1fr);
  grid-auto-flow: column;
`,Qk=l.div`
  display: flex;
  flex-direction: column;

  text-align: center;
`,Kk=l.div`
  padding: 10px;

  font-size: 16px;
  font-weight: bold;
`,Vk=l.div`
  flex-basis: 40px;
  padding: 10px;

  font-weight: bold;
  font-size: 16px;

  box-sizing: border-box;
`,Gk=l.div`
  flex-basis: 30px;

  color: #c2c5c7;

  font-size: 12px;
  line-height: 12px;

  span {
    display: block;
  }
`,Yk=l.div`
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
`,Jk=({breakdown:t})=>e.jsx(Hk,{children:e.jsx(qk,{count:t.length,children:t.map(({label:n,value:s,votes:i,percentage:o,ranking:r})=>e.jsxs(Qk,{children:[e.jsxs(Vk,{children:[Math.round(o),"%"]}),e.jsxs(Gk,{children:[i," ",d("resp.")]}),e.jsx(Yk,{percentage:o,ranking:r}),e.jsx(Kk,{children:n})]},s.toString()))})}),Zk=Object.freeze(Object.defineProperty({__proto__:null,Donut:u1,Hidden:Mk,Horizontal:Bk,Pie:Ok,Text:Uk,Vertical:Jk},Symbol.toStringTag,{value:"Module"})),Xk=l.div`
  margin-top: 10px;

  color: #cf4041;
  font-size: 16px;
`,eS=l.span`
  font-weight: bold;
`,tS=l.span`
  color: #a4a6aa;
`,nS=({average:t,max:n})=>t===null||n===null?null:e.jsxs(Xk,{children:[d("Average"),": ",e.jsx(eS,{children:t})," ",e.jsxs(tS,{children:["/ ",n]})]}),sS=[ht.Hidden,ht.Text],iS=({field:t,responses:n,breakdown:s,skipped:i,bulletin:o,average:r,max:a})=>{const c=Me(t.class),[u,p]=g.useState(ht.Horizontal),[x,f]=g.useState(!1),{data:b}=o1(),j=g.useRef(null);if(g.useEffect(()=>{if(b){let v=b.fieldSettings.find($=>$.id===t.id)?.chartType;v===void 0&&(v=b.chartDefaults?.[t.class]||ht.Horizontal),p(v)}else p(ht.Horizontal)},[b,t]),g.useEffect(()=>{sS.includes(u)},[u]),!b)return null;const{permissions:y}=b,w=Zk[u];return u===ht.Hidden?e.jsxs(Tk,{children:[y.reports&&e.jsx(ec,{fieldId:t.id,selectedChartType:u,isShown:x,toggle:()=>f(!x),changeType:v=>p(v)}),"--"," ",e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d("Question <b>{index}</b> Hidden",{index:o}))}})," ","--"]}):e.jsxs($k,{ref:j,"data-chart-id":t.id,children:[e.jsx(Ck,{children:e.jsx("span",{children:o})}),e.jsxs(kk,{children:[e.jsxs(Sk,{children:[c&&e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(c.icon)}}),t.label]}),e.jsxs(Lk,{children:[d("{answered} answered, {skipped} skipped",{answered:n-i,skipped:i}),t.multiChoice&&e.jsx(Fk,{children:d("multiple choice")})]}),e.jsx(nS,{average:r,max:a})]}),e.jsx(jk,{children:y.reports&&e.jsx(ec,{fieldId:t.id,selectedChartType:u,isShown:x,toggle:()=>f(!x),changeType:v=>p(v)})}),e.jsx(Ek,{children:e.jsx(w,{breakdown:s})})]})},p1=l.ul`
  display: block;

  padding: ${m.xl};
`,oS=l.div`
  display: flex;
  justify-content: space-between;
`,h1=l.div`
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
`,rS=()=>{const t=g.useRef(null),{data:n,isFetching:s}=ca();if(s)return"Loading...";const i=async()=>{if(!n||!t.current)return;const o=await Z1(t.current,{cacheBust:!0,fontEmbedCSS:""}),r=me("/export/surveys/pdf"),a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({[Craft.csrfTokenName]:Craft.csrfTokenValue,image:o})});if(!a.ok){const y=await a.text();throw new Error(y)}const c=await a.blob(),u=window.URL||window.webkitURL,p=u.createObjectURL(c),x=document.createElement("a");x.href=p;const f=a.headers.get("Content-Disposition")||"",b=/filename\*?=(?:UTF-8'')?["']?([^"';\s]+)["']?/i.exec(f),j=b?.[1]?decodeURIComponent(b[1]):"survey-results.pdf";x.download=j,document.body.appendChild(x),x.click(),x.remove(),setTimeout(()=>u.revokeObjectURL(p),1e3)};return e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"survey-list",label:n.form.name,url:`/surveys/${n.form.handle}`}),e.jsxs(p1,{ref:t,children:[e.jsxs(oS,{children:[e.jsxs(h1,{children:[d("{count} Responses",{count:n.form.submissions}),e.jsxs("small",{children:["(",d("{count} questions",{count:n.results.length}),")"]})]}),e.jsx("button",{type:"button",className:"btn",onClick:i,children:d("Export as PDF")})]}),n.results.map((o,r)=>e.jsx(iS,{...o,responses:n.form.submissions,bulletin:r+1},o.field.id))]})]})},aS=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,lS=ts(0,60).map(t=>({name:"",y:t>30?aS(0,Math.random()>.5?4:1):0})),cS=()=>{const t="#cccccc";return e.jsxs(a1,{$color:t,children:[e.jsx(l1,{children:e.jsx(Z,{loading:!0,instant:!0,xl:!0,children:d("Loading")})}),e.jsx(nt,{width:"100%",height:80,children:e.jsxs(yt,{data:lS,margin:{top:30,left:0,right:0,bottom:3},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"color",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.1})]})}),e.jsx(vt,{type:"monotone",dataKey:"y",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,isAnimationActive:!1,fill:"url(#color)"})]})}),e.jsx(c1,{$color:t})]})},x1=l.div`
  --highlight: ${({$highlightHighest:t})=>t?"#e02e39":"#33414d"};

  padding-bottom: 50px;
  margin-bottom: 30px;
`,dS=()=>e.jsxs(Qe,{style:{padding:0},children:[e.jsx(cS,{}),e.jsx(x1,{children:e.jsx(p1,{children:e.jsxs(h1,{children:[e.jsx(k,{width:300,inline:!0}),e.jsx("small",{children:e.jsx(k,{width:100})})]})})})]}),uS=()=>{const{data:t,isFetching:n}=r1(),{data:s,isFetching:i}=o1(),{data:o,isFetching:r}=ca(),a=(n||i||r)&&(!t||!s||!o);return e.jsxs(e.Fragment,{children:[e.jsx(q,{id:"survey-results",label:d("Surveys & Polls"),url:"/forms"}),a&&e.jsx(dS,{}),!a&&e.jsx("div",{id:"content",className:"content-pane",style:{padding:0},children:e.jsxs(x1,{$highlightHighest:!0,children:[e.jsx(mk,{}),e.jsx(rS,{})]})})]})},pS=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"})}),hS=()=>{const t=Y({from:{opacity:0,scale:0},to:{opacity:1,scale:1}}),n=pt(),s=Y({ref:n,from:{opacity:0,scale:0},to:{opacity:1,scale:1},config:{tension:300}}),i=pt(),o=Xi(5,{ref:i,from:{opacity:0,x:-30,y:10},to:{opacity:1,x:0,y:0},config:{tension:300}}),r=pt(),a=Y({ref:r,from:{opacity:0,scale:0,x:-30,y:10},to:{opacity:1,scale:1,x:0,y:0},config:{tension:200}}),c=pt(),u=Y({ref:c,from:{opacity:0,scale:.6,x:30,y:-40},to:{opacity:1,scale:1,x:0,y:0},config:{tension:130}}),p=pt(),x=Xi(8,{ref:p,from:{opacity:0,scale:1.05},to:{opacity:1,scale:1}});return gc([n,i,r,c,p],[0,.8,.6,1,.8]),{background:t,border:s,lines:o,check:a,pencil:u,letters:x}},Ft=l(_.path)`
  transform-origin: 54px;
`,xS=()=>{const{border:t,lines:n,check:s,pencil:i,letters:o}=hS();return e.jsxs("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",x:"0",y:"0",width:"581",height:"121",viewBox:"0, 0, 581, 121",children:[e.jsx("title",{children:"Logo"}),e.jsxs("g",{children:[e.jsx(_.path,{style:o[0],d:"M137.033,21 L137.033,97.284 L153.807,97.284 L153.807,65.766 L185.752,65.766 L185.752,52.732 L153.807,52.732 L153.807,35.103 L190.667,35.103 L190.667,21 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[1],d:"M196.65,42.047 L196.65,97.284 L211.821,97.284 L211.821,72.39 Q211.821,68.651 212.569,65.445 Q213.317,62.24 215.08,59.836 Q216.842,57.432 219.727,56.044 Q222.612,54.655 226.779,54.655 Q228.167,54.655 229.663,54.815 Q231.159,54.975 232.227,55.189 L232.227,41.086 Q230.411,40.552 228.915,40.552 Q226.031,40.552 223.36,41.406 Q220.689,42.261 218.338,43.81 Q215.988,45.36 214.171,47.55 Q212.355,49.74 211.287,52.304 L211.073,52.304 L211.073,42.047 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[2],d:"M273.468,63.736 L248.788,63.736 Q248.894,62.133 249.482,60.103 Q250.07,58.074 251.512,56.257 Q252.954,54.441 255.358,53.212 Q257.762,51.984 261.395,51.984 Q266.95,51.984 269.675,54.975 Q272.399,57.967 273.468,63.736 z M248.788,73.352 L288.639,73.352 Q289.066,66.941 287.571,61.065 Q286.075,55.189 282.709,50.595 Q279.344,46.001 274.109,43.276 Q268.874,40.552 261.822,40.552 Q255.518,40.552 250.337,42.795 Q245.155,45.039 241.416,48.939 Q237.676,52.838 235.646,58.18 Q233.616,63.522 233.616,69.719 Q233.616,76.129 235.593,81.471 Q237.569,86.813 241.202,90.66 Q244.834,94.506 250.07,96.589 Q255.305,98.673 261.822,98.673 Q271.224,98.673 277.848,94.399 Q284.472,90.126 287.677,80.189 L274.322,80.189 Q273.574,82.754 270.262,85.051 Q266.95,87.348 262.356,87.348 Q255.946,87.348 252.527,84.036 Q249.108,80.724 248.788,73.352 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[3],d:"M334.794,63.736 L310.114,63.736 Q310.221,62.133 310.808,60.103 Q311.396,58.074 312.838,56.257 Q314.281,54.441 316.684,53.212 Q319.088,51.984 322.721,51.984 Q328.277,51.984 331.001,54.975 Q333.725,57.967 334.794,63.736 z M310.114,73.352 L349.965,73.352 Q350.392,66.941 348.897,61.065 Q347.401,55.189 344.035,50.595 Q340.67,46.001 335.435,43.276 Q330.2,40.552 323.148,40.552 Q316.845,40.552 311.663,42.795 Q306.481,45.039 302.742,48.939 Q299.002,52.838 296.972,58.18 Q294.942,63.522 294.942,69.719 Q294.942,76.129 296.919,81.471 Q298.896,86.813 302.528,90.66 Q306.161,94.506 311.396,96.589 Q316.631,98.673 323.148,98.673 Q332.55,98.673 339.174,94.399 Q345.798,90.126 349.004,80.189 L335.649,80.189 Q334.901,82.754 331.589,85.051 Q328.277,87.348 323.682,87.348 Q317.272,87.348 313.853,84.036 Q310.434,80.724 310.114,73.352 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[4],d:"M362.252,52.197 L362.252,97.284 L377.423,97.284 L377.423,52.197 L387.893,52.197 L387.893,42.047 L377.423,42.047 L377.423,38.735 Q377.423,35.317 378.759,33.874 Q380.094,32.432 383.192,32.432 Q386.077,32.432 388.748,32.752 L388.748,21.427 Q386.825,21.321 384.795,21.16 Q382.765,21 380.735,21 Q371.44,21 366.846,25.701 Q362.252,30.402 362.252,37.774 L362.252,42.047 L353.17,42.047 L353.17,52.197 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[5],d:"M405.842,69.719 Q405.842,66.407 406.484,63.202 Q407.125,59.997 408.674,57.539 Q410.223,55.082 412.787,53.533 Q415.351,51.984 419.197,51.984 Q423.044,51.984 425.661,53.533 Q428.279,55.082 429.828,57.539 Q431.377,59.997 432.018,63.202 Q432.659,66.407 432.659,69.719 Q432.659,73.031 432.018,76.183 Q431.377,79.335 429.828,81.845 Q428.279,84.356 425.661,85.852 Q423.044,87.348 419.197,87.348 Q415.351,87.348 412.787,85.852 Q410.223,84.356 408.674,81.845 Q407.125,79.335 406.484,76.183 Q405.842,73.031 405.842,69.719 z M390.671,69.719 Q390.671,76.343 392.701,81.685 Q394.731,87.027 398.471,90.82 Q402.21,94.613 407.445,96.643 Q412.68,98.673 419.197,98.673 Q425.715,98.673 431.003,96.643 Q436.292,94.613 440.031,90.82 Q443.771,87.027 445.801,81.685 Q447.831,76.343 447.831,69.719 Q447.831,63.095 445.801,57.7 Q443.771,52.304 440.031,48.511 Q436.292,44.719 431.003,42.635 Q425.715,40.552 419.197,40.552 Q412.68,40.552 407.445,42.635 Q402.21,44.719 398.471,48.511 Q394.731,52.304 392.701,57.7 Q390.671,63.095 390.671,69.719 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[6],d:"M454.455,42.048 L454.455,97.284 L469.626,97.284 L469.626,72.39 Q469.626,68.651 470.374,65.445 Q471.122,62.24 472.885,59.836 Q474.647,57.432 477.532,56.044 Q480.417,54.655 484.584,54.655 Q485.973,54.655 487.468,54.815 Q488.964,54.975 490.032,55.189 L490.032,41.086 Q488.216,40.552 486.72,40.552 Q483.836,40.552 481.165,41.406 Q478.494,42.261 476.143,43.81 Q473.793,45.36 471.976,47.55 Q470.16,49.74 469.092,52.304 L468.878,52.304 L468.878,42.048 z",fill:"#058FFE"}),e.jsx(_.path,{style:o[7],d:"M495.374,42.048 L495.374,97.284 L510.546,97.284 L510.546,65.232 Q510.546,61.172 511.721,58.661 Q512.896,56.15 514.552,54.815 Q516.208,53.479 517.971,52.999 Q519.734,52.518 520.802,52.518 Q524.435,52.518 526.305,53.746 Q528.174,54.975 528.976,57.005 Q529.777,59.035 529.884,61.439 Q529.991,63.843 529.991,66.3 L529.991,97.284 L545.162,97.284 L545.162,66.514 Q545.162,63.95 545.536,61.439 Q545.91,58.928 547.032,56.952 Q548.153,54.975 550.13,53.746 Q552.107,52.518 555.312,52.518 Q558.517,52.518 560.387,53.586 Q562.256,54.655 563.218,56.471 Q564.179,58.287 564.393,60.745 Q564.607,63.202 564.607,65.98 L564.607,97.284 L579.778,97.284 L579.778,60.317 Q579.778,54.975 578.282,51.182 Q576.787,47.39 574.116,45.039 Q571.445,42.689 567.705,41.62 Q563.966,40.552 559.585,40.552 Q553.816,40.552 549.596,43.33 Q545.376,46.107 542.918,49.74 Q540.675,44.612 536.348,42.582 Q532.021,40.552 526.785,40.552 Q521.337,40.552 517.116,42.902 Q512.896,45.253 509.905,49.526 L509.691,49.526 L509.691,42.048 z",fill:"#058FFE"})]}),e.jsxs("g",{id:"Icon",children:[e.jsx(Ft,{d:"M37.733,7.573 C55.513,2.825 47.779,4.886 60.934,1.383 C80.646,-3.783 84.832,11.631 86.256,16.656 C87.101,19.715 87.92,22.783 88.745,25.849 L85.369,38.445 C83.528,31.673 81.754,24.879 79.792,18.139 C76.822,8.231 72.783,5.365 62.066,7.864 C51.792,10.635 21.478,18.709 17.585,19.799 C11.439,21.553 4.764,24.906 7.901,37.117 C11.018,48.771 19.883,81.843 25.077,101.227 C28.75,115.347 36.616,113.524 42.797,112.213 C48.227,110.805 80.511,102.152 87.394,100.239 C97.952,97.304 99.482,91.737 96.984,82.088 L96.172,79.022 L99.583,66.297 C100.842,71.007 102.101,75.718 103.362,80.43 C108.373,99.17 97.473,104.01 88.881,106.717 C84.227,107.978 61.961,113.94 44.895,118.509 C24.877,123.994 20.294,108.418 18.819,103.009 C17.345,97.601 5.001,51.486 1.65,38.898 C-3.671,19.308 11.334,14.782 15.79,13.503 C23.093,11.484 30.416,9.537 37.733,7.573 z",fill:"#058FFE",id:"border",style:t}),e.jsx(Ft,{d:"M104.977,7.117 C108.112,7.879 110.08,10.598 109.31,13.474 C108.542,16.35 91.847,77.975 91.847,77.975 L91.847,77.975 C89.16,81.646 86.473,85.314 83.803,88.997 C83.337,89.641 82.479,89.421 82.424,88.571 L80.556,74.918 C80.556,74.918 97.237,13.309 98.025,10.419 C98.816,7.528 101.842,6.355 104.977,7.117 z",fill:"#FF6624",id:"Pencil",style:i}),e.jsx(Ft,{d:"M38.47,86.147 L49.9,83.086 C52.694,82.336 55.566,83.996 56.316,86.791 L56.662,88.087 C57.412,90.881 55.754,93.755 52.959,94.503 L41.53,97.567 C38.735,98.314 35.863,96.656 35.113,93.861 L34.767,92.564 C34.017,89.769 35.675,86.897 38.47,86.147 z",fill:"#058FFE",style:n[4],id:"line-5"}),e.jsx(Ft,{d:"M47.091,29.664 L67.805,24.115 C69.255,23.726 70.748,24.588 71.137,26.038 L71.137,26.038 C71.526,27.491 70.665,28.982 69.212,29.371 L48.5,34.919 C47.048,35.309 45.557,34.449 45.168,32.997 L45.168,32.997 C44.779,31.546 45.64,30.053 47.091,29.664 z",fill:"#058FFE",style:n[0],id:"line-1"}),e.jsx(Ft,{d:"M50.488,42.34 L71.2,36.789 C72.653,36.4 74.144,37.262 74.533,38.714 L74.533,38.714 C74.922,40.165 74.06,41.656 72.61,42.045 L51.896,47.596 C50.445,47.985 48.952,47.123 48.563,45.673 L48.563,45.673 C48.176,44.22 49.036,42.729 50.488,42.34 z",fill:"#058FFE",style:n[1],id:"line-2"}),e.jsx(Ft,{d:"M29.263,61.61 L74.5,49.49 C75.975,49.095 77.484,49.95 77.873,51.403 L77.873,51.403 C78.262,52.853 77.382,54.35 75.908,54.745 L30.673,66.865 C29.198,67.261 27.686,66.405 27.297,64.955 L27.297,64.955 C26.908,63.502 27.79,62.005 29.263,61.61 z",fill:"#058FFE",style:n[2],id:"line-3"}),e.jsx(Ft,{d:"M78.949,61.938 L79.149,62.052 L77.635,67.703 L34.027,79.387 C32.553,79.782 31.041,78.926 30.652,77.474 C30.263,76.024 31.143,74.526 32.618,74.131 L77.855,62.009 L78.949,61.938 z",fill:"#058FFE",style:n[3],id:"line-4"}),e.jsx(_.path,{d:"M34.899,32.962 C36.525,32.528 38.197,33.492 38.633,35.119 L41.886,47.264 C42.322,48.889 41.357,50.561 39.731,50.997 L27.587,54.25 C25.959,54.686 24.289,53.721 23.853,52.095 L20.598,39.951 C20.162,38.323 21.127,36.653 22.753,36.217 L34.899,32.962 z M33.61,37.352 L26.065,39.372 C25.252,39.59 24.769,40.427 24.987,41.24 L27.008,48.785 C27.226,49.598 28.063,50.081 28.876,49.863 L36.419,47.84 C37.234,47.622 37.716,46.787 37.498,45.974 L35.476,38.429 C35.258,37.616 34.423,37.134 33.61,37.352 z",fill:"#058FFE",id:"check",style:s})]})]})},mS=()=>{const t=Y({from:{opacity:0,scale:.5},to:{opacity:1,scale:1},delay:1e3}),n=pt(),s=Y({ref:n,from:{opacity:0,y:10},to:{opacity:1,y:0},delay:1e3}),i=pt(),o=Y({ref:i,from:{opacity:0,y:10},to:{opacity:1,y:0}}),r=pt(),a=Xi(4,{ref:r,from:{opacity:0,y:20},to:{opacity:1,y:0}});return gc([n,i,r],[0,2,2.2]),{installed:{icon:t,text:s},extra:o,buttons:a}},gS=l.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  height: 80vh;
  padding: 40px;

  background-color: ${h.white};
  border-radius: ${S.lg};
  box-shadow: ${ae.panel}, ${ae.box};
`,fS=l.div``,bS=l.div`
  display: flex;
  align-items: center;
  gap: ${m.sm};

  margin-top: 20px;

  font-size: 22px;
  fill: ${h.teal500};
`,jS=l(_.div)`
  font-size: 30px;
`,yS=l(_.div)``,vS=l(_.div)`
  max-width: 60%;
  margin-top: 20px;

  color: ${h.gray400};
  font-style: italic;
  text-align: center;
`,wS=l.div`
  display: flex;
  justify-content: center;
  gap: ${m.sm};

  margin-top: 40px;
`,Rs=l(_.div)`
  a {
    color: inherit;
    text-decoration: none;
  }
`,$S=()=>{const{installed:t,extra:n,buttons:s}=mS();return e.jsxs(gS,{children:[e.jsx(q,{id:"welcome",label:"Welcome",url:"/forms"}),e.jsx(fS,{children:e.jsx(xS,{})}),e.jsxs(bS,{children:[e.jsx(jS,{style:t.icon,children:e.jsx(pS,{})}),e.jsx(yS,{style:t.text,children:e.jsx("span",{children:d("Awesome! Freeform is successfully installed!")})})]}),e.jsx(vS,{style:n,children:d("Thanks for choosing Freeform! Craft will automatically set you up with the free Express edition. If you're excited to explore even more features, consider switching to the Lite or Pro edition! We've included some helpful links below to get you started. Enjoy!")}),e.jsxs(wS,{children:[e.jsx(Rs,{style:s[0],className:"btn",children:e.jsx(he,{to:"/forms",children:d("Create Forms")})}),e.jsx(Rs,{style:s[2],className:"btn",children:e.jsx("a",{href:me("/settings/demo-templates"),children:d("Install Demo")})}),e.jsx(Rs,{style:s[1],className:"btn",children:e.jsx("a",{href:"https://docs.solspace.com/craft/freeform/v5/guides/getting-started/",children:d("Getting Started")})}),e.jsx(Rs,{style:s[1],className:"btn submit",children:e.jsx("a",{href:me("/settings"),children:d("Configure Freeform")})})]})]})},CS=Qo`
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
`,nc="#cccccc",Ps="3px",kS=Qo`
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
`,SS=()=>e.jsxs(e.Fragment,{children:[e.jsx(CS,{}),e.jsx(kS,{})]}),LS=new URLSearchParams(window.location.search),sc=LS.get("mode")==="debug",FS={blue:"color: #068FFE",reset:""},ic=new Proxy(console,{get:(t,n)=>n==="colors"?FS:n==="dbg"?sc?(...s)=>{t.log("🀄️🔆🔆🔆🀄️",...s)}:()=>{}:typeof t[n]=="function"&&!sc?()=>{}:t[n]}),ES=document.getElementById("freeform-client"),TS=hc.createRoot(ES);ic.log(`%c
  ███████╗██████╗ ███████╗███████╗███████╗ ██████╗ ██████╗ ███╗   ███╗
  ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║
  █████╗  ██████╔╝█████╗  █████╗  █████╗  ██║   ██║██████╔╝██╔████╔██║
  ██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║
  ██║     ██║  ██║███████╗███████╗██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
`,ic.colors.blue);TS.render(e.jsx(X1,{backend:e0,children:e.jsx(t0,{basename:me("/",!1),children:e.jsx(n0,{client:S0,children:e.jsx(u0,{children:e.jsx(b0,{children:e.jsx(y0,{children:e.jsx(g0,{children:e.jsx(s0,{store:Ih,children:e.jsx(F0,{children:e.jsxs(Sc,{children:[e.jsx(q,{id:"root",label:"Freeform",url:"/forms"}),e.jsx(SS,{}),null,e.jsx(f0,{}),e.jsx(mc,{children:e.jsxs(U,{path:"/",element:e.jsx(Vh,{}),children:[e.jsxs(U,{path:"forms",children:[e.jsx(U,{path:":formId/*",element:e.jsx(_9,{})}),e.jsx(U,{index:!0,element:e.jsx(a$,{})})]}),e.jsx(U,{path:"/surveys/:handle",element:e.jsx(uS,{})}),e.jsx(U,{path:"welcome",element:e.jsx($S,{})}),e.jsxs(U,{path:"integrations",element:e.jsx(fC,{}),children:[e.jsx(U,{index:!0,element:e.jsx(JC,{})}),e.jsx(U,{path:":type/:integration/:id?",element:e.jsx(YC,{})})]}),e.jsx(U,{path:"settings/ai",element:e.jsx($m,{})}),e.jsxs(U,{path:"import",element:e.jsx(Bl,{}),children:[e.jsx(U,{path:"forms",element:e.jsx(X$,{})}),e.jsx(U,{path:"express-forms",element:e.jsx(V$,{})}),e.jsx(U,{path:"formie/v3",element:e.jsx(Y$,{})})]}),e.jsx(U,{path:"export",element:e.jsx(Bl,{}),children:e.jsx(U,{path:"forms",element:e.jsx(H$,{})})}),e.jsxs(U,{path:"settings/limited-users",children:[e.jsx(U,{path:":id",element:e.jsx(hk,{})}),e.jsx(U,{index:!0,element:e.jsx(lk,{})})]}),e.jsx(U,{path:"ab-tests",element:e.jsx(R2,{})})]})})]})})})})})})})})})}));export{Sa as S,Z2 as U,io as a,Ed as b,h as c,d as t};
