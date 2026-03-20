import{u as Wt,a as te,r as m,j as e,c,b as pt,d as $i,L as un,e as W,f as G,g as Il,Q as Op,h as Wp,i as we,k as N,l as J,v as V,m as Ci,n as Rl,o as _p,p as _t,q as Al,s as A,t as B,w as K,x as X,O as mt,y as ki,R as Xe,z as Hp,C as Dl,X as Pl,Y as Si,T as Li,A as Up,B as ne,D as O,E as Bl,_ as gs,F as qp,G as me,H as Fi,I as re,J as Ti,S as Ht,K as L,M as Qp,N as Kp,P as Vp,U as Gp,V as Yp,W as Jp,Z as Zp,$ as Xp,a0 as e1,a1 as t1,a2 as n1,a3 as s1,a4 as o1,a5 as i1,a6 as r1,a7 as a1,a8 as l1,a9 as c1,aa as d1,ab as gt,ac as ft,ad as u1,ae as et,af as Ol,ag as Es,ah as Wl,ai as ze,aj as p1,ak as _l,al as Hl,am as h1,an as Ei,ao as Gn,ap as qs,aq as pe,ar as x1,as as m1,at as Ul,au as U,av as zi,aw as g1,ax as f1,ay as b1,az as y1,aA as j1,aB as v1,aC as lt,aD as Ho,aE as ql,aF as w1,aG as $1,aH as C1,aI as k1,aJ as S1}from"./vendor-C21SoWVJ.js";import{a5 as Ql,a6 as Kr,p as zs,a7 as L1,a8 as F1,C as T1}from"./date-fns-BTAAV4UA.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function s(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(i){if(i.ep)return;i.ep=!0;const r=s(i);fetch(i.href,r)}})();const E1=(t,n)=>!t||typeof t!="object"||!Array.isArray(n)?!1:n.some(s=>Object.hasOwn(t,s)),zn=(t,n)=>{const s=t.split(".").map(r=>Number.parseInt(r,10)),o=n.split(".").map(r=>Number.parseInt(r,10)),i=Math.max(s.length,o.length);for(let r=0;r<i;r+=1){const a=(s[r]??0)-(o[r]??0);if(a!==0)return a>0?1:-1}return 0},z1=t=>{const n=s=>zn(t,s)===0;return n.atLeast=s=>zn(t,s)>=0,n.atMost=s=>zn(t,s)<=0,n.below=s=>zn(t,s)<0,n.above=s=>zn(t,s)>0,n};var le=(t=>(t.Pro="pro",t.Lite="lite",t.Express="express",t))(le||{}),Yn=(t=>(t.Global="global",t.Form="form",t.All="all",t))(Yn||{});const N1=document.getElementById("freeform-config"),nn=JSON.parse(N1?.innerHTML||"[]"),I={...nn,metadata:{...nn.metadata,craft:{...nn.metadata?.craft,is:z1(nn?.metadata?.craft?.version||"0.0.0")}},editions:{...nn.editions,is:t=>I.editions.edition===t,isAtLeast:t=>{const n=I.editions.tiers,s=n.indexOf(t);if(s===-1)throw new Error(`Unknown edition: ${t}`);return n.indexOf(I.editions.edition)>=s},isAtMost:t=>{const n=I.editions.tiers,s=n.indexOf(t);if(s===-1)throw new Error(`Unknown edition: ${t}`);return n.indexOf(I.editions.edition)<=s}},limitations:{...nn.limitations,can:t=>{const n=I.limitations?.items;if(!n)return!0;const s=t.split(".");for(let o=0;o<s.length;o++){const i=s.slice(0,o+1).join(".");if(n[i]===!1)return!1}return n[t]!==void 0?!!n[t]:!0},get:t=>{const n=I.limitations?.items;if(n)return n[t]}}},M1="default",Kl=m.createContext({isPrimary:!1,change:()=>{},getCurrentHandleWithFallback:()=>""}),Fe=()=>m.useContext(Kl),I1=({children:t})=>{const n=Wt(),s=te(),[o,i]=m.useState(()=>I.sites.list.find(h=>h.id===I.sites.current)||I.sites.list.find(h=>h.primary)||I.sites.list[0]),[r,a]=m.useState(o.primary);m.useEffect(()=>{document.querySelectorAll('#nav a[href*="site="]').forEach(h=>{const x=h.getAttribute("href");x&&h.setAttribute("href",x.replace(/([?&])site=[^&]+/,`$1site=${o?.handle||""}`))})},[o]);const l=m.useCallback(d=>{const h=I.sites.list.find(x=>x.handle===d);if(h){i(h),a(h.primary);const x=new URLSearchParams(n.search);x.set("site",h.handle),s(`${n.pathname}?${x.toString()}`)}},[n,s]);return e.jsx(Kl.Provider,{value:{current:o,isPrimary:r,list:I.sites.list,change:l,getCurrentHandleWithFallback:()=>o?o.handle:M1},children:t})},R1=(t,n)=>{if(n===void 0||(typeof n=="string"&&(n=n.split(" ")),!t||!t.classList))return!1;for(;t;){for(const s of n)if(t.classList.contains(s))return!0;t=t.parentElement}return!1},T=(...t)=>t.map(n=>(typeof n=="string"&&(n=n.trim()),n)).filter(n=>!!n).join(" "),Vl=c.button`
  z-index: 3 !important;

  &:after {
    margin-left: 0 !important;
  }
`,Gl=c.div`
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
`,A1=c.li`
  &.craft-4 {
    gap: var(--xs);

    #site-crumb {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: nowrap;
      gap: var(--xs);
    }

    ${Gl} {
      padding: 0 14px;

      border-radius: 4px;
      box-shadow:
        0 0 0 1px rgba(31, 41, 51, 0.1),
        0 5px 20px rgba(31, 41, 51, 0.25);

      user-select: none;
      overflow: auto;
      z-index: 100;
    }

    ${Vl} {
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
`,D1=()=>{const[t,n]=m.useState(!1),{current:s,list:o,change:i}=Fe(),{metadata:{craft:r},sites:{enabled:a}}=I;if(!a)return null;const l=!r.is5,d=r.is5;return o.length<=1?null:e.jsxs(A1,{className:T("crumb",l&&"craft-4",d&&"craft-5"),children:[e.jsxs("a",{id:"site-crumb",className:"crumb-link",children:[e.jsx("span",{className:"cp-icon puny",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512","aria-hidden":"true",children:e.jsx("path",{d:"M57.7 193l9.4 16.4c8.3 14.5 21.9 25.2 38 29.8L163 255.7c17.2 4.9 29 20.6 29 38.5v39.9c0 11 6.2 21 16 25.9s16 14.9 16 25.9v39c0 15.6 14.9 26.9 29.9 22.6c16.1-4.6 28.6-17.5 32.7-33.8l2.8-11.2c4.2-16.9 15.2-31.4 30.3-40l8.1-4.6c15-8.5 24.2-24.5 24.2-41.7v-8.3c0-12.7-5.1-24.9-14.1-33.9l-3.9-3.9c-9-9-21.2-14.1-33.9-14.1H257c-11.1 0-22.1-2.9-31.8-8.4l-34.5-19.7c-4.3-2.5-7.6-6.5-9.2-11.2c-3.2-9.6 1.1-20 10.2-24.5l5.9-3c6.6-3.3 14.3-3.9 21.3-1.5l23.2 7.7c8.2 2.7 17.2-.4 21.9-7.5c4.7-7 4.2-16.3-1.2-22.8l-13.6-16.3c-10-12-9.9-29.5 .3-41.3l15.7-18.3c8.8-10.3 10.2-25 3.5-36.7l-2.4-4.2c-3.5-.2-6.9-.3-10.4-.3C163.1 48 84.4 108.9 57.7 193zM464 256c0-36.8-9.6-71.4-26.4-101.5L412 164.8c-15.7 6.3-23.8 23.8-18.5 39.8l16.9 50.7c3.5 10.4 12 18.3 22.6 20.9l29.1 7.3c1.2-9 1.8-18.2 1.8-27.5zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"})})}),e.jsx("span",{children:s.name})]}),e.jsx(Vl,{className:"btn menubtn",type:"button","aria-label":"Select site","aria-controls":"site-crumb-menu","aria-expanded":t,"data-discloseure-trigger":"true",onClick:()=>n(!t),children:e.jsx(Gl,{className:"menu",style:{display:t?"block":"none"},children:e.jsx("ul",{className:"padded",children:o.map(h=>e.jsx("li",{onClick:()=>{i(h.handle),n(!1)},children:e.jsx("a",{className:T("menu-item",s.handle===h.handle&&"sel"),children:e.jsx("span",{className:"menu-item-label",children:h.name})})},h.id))})})})]})},Yl=m.createContext({stack:[],push:()=>{},pop:()=>{},update:()=>{}}),P1=t=>{const{push:n,pop:s,update:o}=m.useContext(Yl);m.useEffect(()=>{o(t)},[t,o]),m.useEffect(()=>(n(t),()=>{s()}),[t,n,s])},B1=({children:t})=>{const[n,s]=m.useState([]),o=m.useCallback(a=>{s(l=>[...l,a])},[]),i=m.useCallback(()=>{s(a=>a.slice(0,-1))},[]),r=m.useCallback(a=>{s(l=>{const d=l?.findIndex(x=>x.id===a.id);if(d===void 0||d===-1||!a||l[d].label===a.label||l[d].url===a.url)return l;const h=pt(l);return h[d].url=a.url,h[d].label=a.label,h})},[]);return m.useEffect(()=>{const a=document.getElementById("crumbs");a.style.display="block",a.style.overflow="initial",a.classList.remove("empty")},[]),e.jsxs(Yl.Provider,{value:{stack:n,push:o,pop:i,update:r},children:[t,$i.createPortal(e.jsx("nav",{"aria-label":"Breadcrumbs",className:"breadcrumbs",children:e.jsxs("ul",{id:"crumb-list",className:"breadcrumb-list",children:[e.jsx(D1,{}),n.map(({label:a,url:l,external:d},h)=>e.jsxs("li",{className:"crumb",children:[d&&e.jsx("a",{href:l,children:a}),!d&&e.jsx(un,{to:l,children:a})]},h))]})}),document.getElementById("crumbs"))]})},Q=t=>(P1(t),null),O1=()=>null,Jl=m.createContext({register:()=>1e3,unregister:()=>{}}),W1=({children:t})=>{const n=m.useRef(1e3),s=()=>(n.current-=1,n.current),o=()=>{n.current+=1};return e.jsx(Jl.Provider,{value:{register:s,unregister:o},children:t})},_1=()=>{const{register:t,unregister:n}=m.useContext(Jl),[s,o]=m.useState(1e3);return m.useEffect(()=>{const i=t();return o(i),()=>{n()}},[t,n]),s},Zl=typeof window<"u"?m.useLayoutEffect:m.useEffect;function Uo(t){const n=m.useRef(()=>{throw new Error("Cannot call an event handler while rendering.")});return Zl(()=>{n.current=t},[t]),m.useCallback((...s)=>n.current?.(...s),[n])}const Xl=m.createContext({stack:[],push:()=>{},pop:()=>{}}),Jn=(t,n=!0)=>{const{push:s,pop:o}=m.useContext(Xl),i=Uo(t);m.useEffect(()=>{if(n)return s(i),()=>{o(i)}},[i,n,o,s])},H1=({children:t})=>{const n=m.useRef([]),s=m.useCallback(r=>{const a=n.current;a.at(-1)!==r&&a.push(r)},[]),o=m.useCallback(r=>{const a=n.current;if(!r)return a.pop();const l=a.indexOf(r);if(l!==-1)return a.splice(l,1)[0]},[]);m.useEffect(()=>{const r=a=>{if(a.key==="Escape"){const l=n.current.at(-1);l&&l()}};return document.addEventListener("keydown",r),()=>{document.removeEventListener("keydown",r)}},[]);const i=m.useMemo(()=>({stack:n.current,push:s,pop:o}),[o,s]);return e.jsx(Xl.Provider,{value:i,children:t})};c.div`
  box-shadow:
    0 0 0 1px #cdd8e4,
    0 2px 12px rgb(205 216 228 / 50%);
`;const f={xs:"var(--xs)",sm:"var(--s)",md:"var(--m)",lg:"var(--l)",xl:"var(--xl)"},k={sm:"var(--small-border-radius)",md:"var(--medium-border-radius)",lg:"var(--large-border-radius)"},oe={panel:"0 0 20px 10px rgb(205 216 228 / 50%)",box:"0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%)",boxSubtle:"0 2px 8px rgba(0, 0, 0, 0.1)",bottom:"inset 0 -1px 0 0 rgb(154 165 177 / 25%)",right:"inset -1px 0 0 0 rgb(154 165 177 / 25%)",autosuggest:"0 1px 5px -1px rgba(31,41,51,.2)",container:"0 0 0 1px rgba(31, 41, 51, 0.1), 0 5px 20px rgba(31, 41, 51, 0.25)"},Ni={easeOut:"cubic-bezier(0.25, 0.1, 0.25, 1)",bounce:{easeOut:"cubic-bezier(0.175, 0.885, 0.32, 1.275)"}},p={hairline:"rgba(51,64,77,.1)",hr:"rgb(from var(--gray-800) r g b/10%)",inputBorder:"rgba(96,125,159,0.25)",barelyVisible:"rgb(154 165 177 / 75%)",link:"#1f5fea",elements:{dropdown:"#dfe5ec"},error:"#cf1124",warning:"var(--warning-color)",notice:"var(--notice-color)",white:"var(--white)",black:"var(--black)",gray050:"var(--gray-050)",gray100:"var(--gray-100)",gray200:"var(--gray-200)",gray250:"#b4c3d3",gray300:"var(--gray-300)",gray400:"var(--gray-400)",gray500:"var(--gray-500)",gray550:"var(--gray-550)",gray600:"var(--gray-600)",gray700:"var(--gray-700)",gray800:"var(--gray-800)",gray900:"var(--gray-900)",blue100:"var(--blue-100)",blue200:"var(--blue-200)",blue300:"var(--blue-300)",blue400:"var(--blue-400)",blue500:"var(--blue-500)",blue600:"var(--blue-600)",red050:"var(--red-050)",red100:"var(--red-100)",red200:"var(--red-200)",red300:"var(--red-300)",red500:"var(--red-500)",red600:"var(--red-600)",red700:"var(--red-700)",yellow050:"var(--yellow-050)",yellow500:"var(--yellow-500)",yellow600:"var(--yellow-600)",yellow700:"var(--yellow-700)",teal050:"var(--teal-050)",teal300:"var(--teal-300)",teal500:"var(--teal-500)",teal550:"var(--teal-550)",teal600:"var(--teal-600)",teal700:"var(--teal-700)",green600:"var(--green-600)"},U1=c.div``,q1=c(W.div)`
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
`,Q1=c(W.div)`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;

  display: flex;
  justify-content: center;
  align-items: center;
`,$e=c.div`
  width: 100%;
  max-width: 500px;

  background-color: #fff;
  border-radius: ${k.lg};
  box-shadow: 0 25px 100px rgba(31, 41, 51, 0.5);
`,Ce=c.header`
  padding: ${f.lg} ${f.xl};

  background-color: ${p.gray100};
  box-shadow: inset 0 -1px 0 ${p.hairline};

  border-radius: ${k.lg} ${k.lg} 0 0;
`,ke=c.footer`
  display: flex;
  justify-content: end;
  align-items: center;
  gap: ${f.sm};

  padding: ${f.sm} ${f.xl};

  background-color: ${p.gray100};
  box-shadow: inset 0 1px 0 ${p.hairline};

  border-radius: 0 0 ${k.lg} ${k.lg};
`,bt=({children:t,closeModal:n,style:s,config:o})=>(Jn(n,o?.allowEscape??!0),e.jsx(Q1,{style:s,children:t})),K1=t=>G({to:{opacity:t?1:0,backgroundColor:t?"rgba(123, 135, 147, 0.35)":"rgba(123, 135, 147, 0)"}}),V1=t=>Il(t,{from:{y:100,opacity:0},enter:{y:0,opacity:1},leave:{y:-100,opacity:0},config:{tension:500,friction:20}}),ec=m.createContext({openModal:()=>{},closeModal:()=>{}}),it=()=>m.useContext(ec),tc=({children:t})=>{const[n,s]=m.useState([]),[o,i]=m.useState([]),[r,a]=m.useState([]),l=(g,b,y)=>{s([...n,b]),i([...o,g]),a([...r,y])},d=()=>{s(n.slice(0,-1)),i(o.slice(0,-1)),a(r.slice(0,-1))};m.useEffect(()=>{o.length>0?document.body.style.overflow="hidden":document.body.style.overflow="auto"},[o]);const h=K1(o.length>0),x=V1(o);return e.jsxs(ec.Provider,{value:{openModal:l,closeModal:d},children:[t,$i.createPortal(e.jsx(U1,{children:e.jsx(q1,{style:h,className:T(!o.length&&"inactive"),children:x((g,b,y,j)=>e.jsx(bt,{closeModal:d,style:g,config:pt(r[j]),children:e.jsx(b,{closeModal:d,data:pt(n[j])})},j))})}),document.body)]})},G1=new Op({defaultOptions:{queries:{gcTime:1e3*60*10,retry:!1,refetchOnWindowFocus:!1}}}),nc=m.createContext({}),sc=()=>m.useContext(nc),Y1=c.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1005;
`,J1=({children:t})=>{const[n,s]=m.useState(),o=m.useRef(null);return m.useEffect(()=>{o.current&&s(o.current.getBoundingClientRect())},[o.current]),e.jsxs(nc.Provider,{value:{element:o.current,dimensions:n},children:[e.jsx(Y1,{id:"pop-up-portal",ref:o}),t]})},oc=Wp("form/save");var _n=(t=>(t.Page="page",t.Field="field",t.Row="row",t))(_n||{}),Tt=(t=>(t[t.Idle=0]="Idle",t[t.Processing=1]="Processing",t))(Tt||{});const Z1={state:0,page:null,focus:{active:!1,type:null,uid:null}},ic=we({name:"context",initialState:Z1,reducers:{setPage:(t,{payload:n})=>{t.page=n},setFocusedItem:(t,{payload:n})=>{t.focus.active===!0&&t.focus.uid===n.uid&&t.focus.type===n.type||(t.focus={active:!0,...n})},setState:(t,{payload:n})=>{t.state=n},focus:t=>{t.focus.active=!0},unfocus:t=>{t.focus.active=!1}}}),{actions:be}=ic,X1=ic.reducer,On=new Map,ie={subscribe(t,n){const s=e0(t),o=n;return s.add(o),()=>{s.delete(o),s.size===0&&On.delete(t)}},publish(t,n){const s=On.get(t);s&&s.forEach(o=>{o(t,n)})},clearAllSubscriptions(){On.clear()}},e0=t=>{let n=On.get(t);return n||(n=new Set,On.set(t,n)),n},Ut=Symbol("form.save"),Zn=Symbol("form.save.errors"),rc=Symbol("form.save.crated"),t0=Symbol("form.save.updated"),qt=Symbol("form.save.upserted");ie.clearAllSubscriptions();const Vr=(t,n,s)=>{ie.publish(Zn,{getState:t,dispatch:n,response:s}),n(be.setState(Tt.Idle))},n0=(t,n,s)=>{ie.publish(rc,{getState:t,dispatch:n,response:s}),ie.publish(qt,{getState:t,dispatch:n,response:s}),n(be.setState(Tt.Idle))},s0=(t,n,s)=>{ie.publish(t0,{getState:t,dispatch:n,response:s}),ie.publish(qt,{getState:t,dispatch:n,response:s}),n(be.setState(Tt.Idle))},o0=t=>n=>s=>{if(!s||(n(s),typeof s!="object"||!("type"in s)||s.type!==String(oc)))return;const o=t.dispatch,i=t.getState;o(be.setState(Tt.Processing));const r={getState:i,dispatch:o,persist:{}};ie.publish(Ut,r);const a=i().form.id;a?N.post(`/api/forms/${a}`,r.persist).then(l=>s0(i,o,l)).catch(l=>Vr(i,o,l)):N.post("/api/forms",r.persist).then(l=>n0(i,o,l)).catch(l=>Vr(i,o,l))},Ye={success:t=>{Craft.cp.displaySuccess(t)},notice:t=>{Craft.cp.displayNotice(t)},error:t=>{Craft.cp.displayError(t)}},i0=(t,n={})=>{for(const[s,o]of Object.entries(n)){const i=new RegExp(`\\{${s}\\}`,"g");t=t.replace(i,o.toString())}return t},u=(t,n={})=>t?typeof Craft<"u"?Craft.t("freeform",t,n):i0(t,n):"",r0=(t,n)=>{const{persist:s,getState:o}=n,{id:i,uid:r,type:a,settings:l}=o().form;s.form={id:i,uid:r,type:a,settings:l}},a0=(t,{dispatch:n,response:s})=>{n(ht.clearErrors()),n(ht.setErrors(s.errors?.form)),Ye.error(u("There were problems saving the form."))},l0=(t,{dispatch:n})=>{n(ht.clearErrors()),Ye.success(u("Form saved successfully."))},c0=(t,{dispatch:n,response:s})=>{n(ht.update({id:s.data.form.id}))};ie.subscribe(Ut,r0);ie.subscribe(Zn,a0);ie.subscribe(rc,c0);ie.subscribe(qt,l0);const Xn={oneByShortName:t=>n=>n.integrations.find(s=>s.shortName===t),one:t=>n=>n.integrations.find(s=>s.id===t),isFieldInIntegrations:t=>J(n=>n.integrations,n=>!!n.filter(s=>s.enabled).find(s=>s.properties.some(o=>{if(o.type==="field")return s.values[o.handle]===t;if(o.type==="fieldMapping"){const i=s.values[o.handle];return Object.values(i).some(r=>r.value===t)}return!1}))),errors:{any:t=>t.integrations.some(n=>n.errors?Object.values(n.errors).some(s=>s.length>0):!1)}},d0=(t,{getState:n,dispatch:s})=>{const o=n(),i=Xn.oneByShortName("FormMonitor")(o);i&&s(ht.update({formMonitor:{enabled:i.enabled}}))};ie.subscribe(qt,d0);const u0={id:null,uid:V(),type:"Solspace\\Freeform\\Form\\Types\\Regular",name:"Create a new Form",handle:"newForm",isNew:!0,settings:{},errors:{},dateArchived:null,formMonitor:{enabled:!1}},ac=we({name:"form",initialState:u0,reducers:{update:(t,{payload:n})=>{Object.assign(t,n)},setInitialSettings:(t,n)=>{if(!(Object.entries(t.settings).length>0)){for(const s of n.payload){t.settings[s.handle]={namespaceType:"settings",namespace:s.handle};for(const o of s.properties)t.settings[s.handle][o.handle]=o.value}t.settings.general.name=t.name,t.settings.general.handle=t.handle}},modifySettings:(t,{payload:n})=>{const{namespace:s,key:o,value:i}=n;t.settings[s]||(t.settings[s]={namespaceType:"settings",namespace:s}),t.settings[s][o]=i},removeError:(t,{payload:n})=>{delete t.errors[n]},setErrors:(t,{payload:n})=>{t.errors=n},clearErrors:t=>{t.errors=void 0}}}),{actions:ht}=ac,p0=ac.reducer,h0=(t,n)=>{const{getState:s,persist:o}=n;o.integrations=s().integrations.map(i=>({id:i.id,instanceUid:i.instanceUid,enabled:!!i.enabled,values:i.dirtyValues}))},x0=(t,{dispatch:n,response:s})=>{n(Et.clearErrors()),n(Et.setErrors(s.errors?.integrations))},m0=(t,{dispatch:n})=>{n(Et.cleanDirtyValues()),n(Et.clearErrors())};ie.subscribe(Ut,h0);ie.subscribe(Zn,x0);ie.subscribe(qt,m0);const g0=[],Gr=(t,n)=>t.find(s=>s.id===n),lc=we({name:"integrations",initialState:g0,reducers:{set:(t,n)=>{t.length=0,n.payload.forEach(s=>{const o={};s.properties.forEach(i=>{o[i.handle]=i.value}),t.push({dirtyValues:{},values:o,...s})})},add:(t,n)=>{n.payload.forEach(s=>{const o={};s.properties.forEach(i=>{o[i.handle]=i.value}),t.push({dirtyValues:{},values:o,...s})})},toggle:(t,n)=>{const s=Gr(t,n.payload);s.enabled=!s.enabled},modify:(t,n)=>{const{id:s,key:o,value:i}=n.payload,r=Gr(t,s);r.values[o]=i,r.dirtyValues={...r.dirtyValues,[o]:i}},cleanDirtyValues:t=>{t.forEach(n=>{n.dirtyValues={}})},emptyIntegrations:t=>{t.length=0},clearErrors:t=>{t.forEach(n=>{n.errors=void 0})},setErrors:(t,n)=>{t.forEach(s=>{const o=n.payload?.[s.id];o&&(s.errors=o)})}}}),{actions:Et}=lc,f0=lc.reducer,b0=(t,{dispatch:n,response:s})=>{n(fe.clearErrors()),n(fe.setErrors(s.errors?.fields))},y0=(t,{dispatch:n})=>{n(fe.clearErrors())};ie.subscribe(Zn,b0);ie.subscribe(qt,y0);const j0=[],cc=we({name:"layout/fields",initialState:j0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const{uid:s,rowUid:o,fieldType:i,order:r}=n.payload,a=Math.max(-1,...t.filter(d=>d.rowUid===n.payload.rowUid).map(d=>d.order)),l={};if(i.properties.forEach(d=>{l[d.handle]=d.value}),!l.label){const d=t.filter(x=>x.typeClass===i.typeClass).length;let h=u(i.name);d>0&&(h+=` ${d}`),l.label=h,l.handle=Ci(h)}t.push({uid:s,rowUid:o,typeClass:i.typeClass,properties:l,order:r!==void 0?r:a+1}),r!==void 0&&t.filter(d=>d.rowUid===o).filter(d=>d.uid!==s).forEach(d=>{d.order>=r&&(d.order+=1)})},duplicate:(t,n)=>{const{uid:s,rowUid:o,field:i}=n.payload,r=Math.max(-1,...t.filter(g=>g.rowUid===o).map(g=>g.order??-1)),a={...i.properties},l=a.handle.replace(/_\d+$/,"");let d=a.handle,h=!0,x=1;do d=`${l}_${x}`,h=t.some(g=>g.properties.handle===d);while(h&&x++<500);a.handle=d,t.push({uid:s,rowUid:o,typeClass:i.typeClass,properties:a,order:r+1})},remove:(t,{payload:n})=>{t.splice(t.findIndex(s=>s.uid===n),1)},removeBatch:(t,{payload:n})=>{n.forEach(s=>{t.splice(t.findIndex(o=>o.uid===s),1)})},edit:(t,n)=>{const{uid:s,handle:o,value:i}=n.payload;t.find(r=>r.uid===s).properties[o]=i},batchEdit:(t,n)=>{const{uid:s,typeClass:o,properties:i}=n.payload,r=t.find(a=>a.uid===s);r.typeClass=o,r.properties=i},clearErrors:t=>{for(const n of t)n.errors=void 0},setErrors:(t,n)=>{const{payload:s}=n;for(const o of t)o.errors=s?.[o.uid]},moveTo:(t,n)=>{const{uid:s,rowUid:o,position:i}=n.payload,r=t.find(h=>h.uid===s),a=r.rowUid,l=r.order,d=a===o;l!==void 0&&(r.rowUid=o,r.order=i,d||(t.filter(h=>h.rowUid===a).forEach(h=>{const x=h.order>=l;h.order-=x?1:0}),t.filter(h=>h.rowUid===o).filter(h=>h.uid!==r.uid).forEach(h=>{const x=h.order>=r.order;h.order+=x?1:0})),d&&t.filter(h=>h.rowUid===o).filter(h=>h.uid!==r.uid).forEach(h=>{h.order>l&&h.order<=i&&(h.order-=1),h.order<l&&h.order>=i&&(h.order+=1)}))}}}),{actions:fe}=cc,v0=cc.reducer,w0=(t,n)=>{const{getState:s,persist:o}=n,{layouts:i,fields:r,rows:a,pages:l}=s().layout;o.layout={pages:l,layouts:i,rows:a,fields:r}};ie.subscribe(Ut,w0);const $0=[],dc=we({name:"layout/layouts",initialState:$0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{t.push(n.payload)},remove:(t,n)=>{t.splice(t.findIndex(s=>s.uid===n.payload),1)}}}),{actions:vn}=dc,C0=dc.reducer,k0=/^-?\d*\.?\d*$/,Yr=(t,n={})=>{const{min:s,max:o,unsigned:i}=n;if(typeof t=="string"){if(t==="-")return 0;if(k0.test(t)||(t=t.replaceAll(/[^0-9.-]/g,"")),t==="")return;t=Number(t)}if(!Number.isNaN(t))return typeof i=="boolean"&&i&&t<0&&(t=Math.abs(t)),s!=null&&t<s?s:o!=null&&t>o?o:t},S0=(t,n,s,o=!0)=>{const i=Math.min(n,s),r=Math.max(n,s);return o?t>=i&&t<=r:t>i&&t<r},L0=[],uc=we({name:"layout/pages",initialState:L0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const s=Math.max(-1,...t.map(o=>o.order));t.push({...n.payload,order:s+1})},remove:(t,n)=>{let s=0;t.splice(t.findIndex(o=>o.uid===n.payload),1),t.forEach(o=>{o.order=s++})},moveTo:(t,n)=>{const{uid:s,order:o}=n.payload,i=t.find(a=>a.uid===s),r=i.order;i.order=o,t.filter(a=>a.uid!==s).filter(a=>S0(a.order,o,r)).forEach(a=>{o>r&&(a.order-=1),o<r&&(a.order+=1)})},updateLabel:(t,n)=>{const{uid:s,label:o}=n.payload;t.find(i=>i.uid===s).label=o},editButtons:(t,n)=>{const{uid:s,key:o,value:i}=n.payload,r=t.find(a=>a.uid===s).buttons;r&&Object.assign(r,{[o]:i})}}}),{actions:wn}=uc,F0=uc.reducer,T0=[],pc=we({name:"layout/rows",initialState:T0,reducers:{set:(t,n)=>{t.splice(0,t.length,...n.payload)},add:(t,n)=>{const{layoutUid:s,uid:o,order:i}=n.payload;let r;i!==void 0?r=t.findIndex(a=>a.layoutUid===s&&a.order===i):(r=t.reduce((a,l,d)=>l.layoutUid===s&&l.order>t[a]?.order?d:a,-1),r=r===-1?t.length:r),t.splice(r,0,{uid:o,order:r,layoutUid:s}),t.filter(a=>a.layoutUid===s).forEach((a,l)=>{a.order=l})},remove:(t,n)=>{const s=t.findIndex(i=>i.uid===n.payload),o=t.find(i=>i.uid===n.payload).layoutUid;t.splice(s,1),t.filter(i=>i.layoutUid===o).forEach((i,r)=>{i.order=r})},swap:(t,n)=>{const s=t.find(r=>r.uid===n.payload.currentUid),o=t.find(r=>r.uid===n.payload.targetUid),i=s.order;s.order=o.order,o.order=i}}}),{actions:Ge}=pc,E0=pc.reducer,z0=Rl({fields:v0,pages:F0,rows:E0,layouts:C0}),N0=(t,n)=>{const{getState:s,persist:o}=n,i=s();let r=null;i.notifications.initialized&&(r=i.notifications.items),o.notifications=r},M0=(t,{dispatch:n,response:s})=>{n(zt.clearErrors()),n(zt.setErrors(s.errors?.notifications))},I0=(t,{dispatch:n})=>{n(zt.clearErrors())};ie.subscribe(Ut,N0);ie.subscribe(Zn,M0);ie.subscribe(qt,I0);const R0={initialized:!1,items:[]},Jr=(t,n)=>t.items.find(s=>s.uid===n),hc=we({name:"notifications",initialState:R0,reducers:{clear:t=>{t.initialized=!1,t.items.length=0},set:(t,n)=>{t.initialized=!0,t.items.length=0,n.payload.forEach(s=>{t.items.push(s)})},toggle:(t,n)=>{const s=Jr(t,n.payload);s&&(s.enabled=!s.enabled)},modify:(t,n)=>{const{uid:s,key:o,value:i}=n.payload,r=Jr(t,s);r&&(r[o]=i)},add:(t,n)=>{t.items.push(n.payload)},clearErrors:t=>{for(const n of t.items)n.errors=void 0},setErrors:(t,n)=>{const{payload:s}=n;for(const o of t.items)o.errors=s?.[o.uid]},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:zt}=hc,A0=hc.reducer,D0=(t,n)=>{const{getState:s,persist:o}=n,{fields:i,pages:r,notifications:a,integrations:l,submitForm:d,buttons:h}=s().rules;o.rules={fields:i.initialized?i.items:null,pages:r.initialized?r.items:null,notifications:a.initialized?a.items:null,integrations:l.initialized?l.items:null,submitForm:d.item,buttons:h.initialized?h.items:null}};ie.subscribe(Ut,D0);var se=(t=>(t.Equals="equals",t.NotEquals="notEquals",t.GreaterThan="greaterThan",t.GreaterThanOrEquals="greaterThanOrEquals",t.LessThan="lessThan",t.LessThanOrEquals="lessThanOrEquals",t.Contains="contains",t.NotContains="notContains",t.StartsWith="startsWith",t.EndsWith="endsWith",t.IsEmpty="isEmpty",t.IsNotEmpty="isNotEmpty",t.IsOneOf="isOneOf",t.IsNotOneOf="isNotOneOf",t))(se||{});const Nn={boolean:["equals","notEquals"],noValue:["isEmpty","isNotEmpty"],multiple:["isOneOf","isNotOneOf"],negative:["notEquals","notContains"]};var pn=(t=>(t.Show="show",t.Hide="hide",t))(pn||{}),Be=(t=>(t.And="and",t.Or="or",t))(Be||{});const P0={initialized:!1,items:[]},xc=we({name:"rules/buttons",initialState:P0,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{pageUid:s,button:o}=n.payload;t.items.push({uid:V(),enabled:!0,display:pn.Show,combinator:Be.Or,conditions:[{uid:V(),field:"",operator:se.Equals,value:""}],button:o,page:s})},modifyDisplay:(t,n)=>{const{ruleUid:s,display:o}=n.payload,i=t.items.find(r=>r.uid===s);i.display=o},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:o}=n.payload,i=t.items.find(r=>r.uid===s);i.combinator=o},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:o}=n.payload,i=t.items.find(r=>r.uid===s);i.conditions=o},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:on}=xc,B0=xc.reducer,O0={initialized:!1,items:[]},mc=we({name:"rules/fields",initialState:O0,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const s=n.payload;t.items.push({uid:V(),enabled:!0,display:pn.Show,combinator:Be.Or,conditions:[{uid:V(),field:"",operator:se.Equals,value:""}],field:s})},modifyDisplay:(t,n)=>{const{ruleUid:s,display:o}=n.payload,i=t.items.find(r=>r.uid===s);i.display=o},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:o}=n.payload,i=t.items.find(r=>r.uid===s);i.combinator=o},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:o}=n.payload,i=t.items.find(r=>r.uid===s);i.conditions=o},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:rn}=mc,W0=mc.reducer,_0={initialized:!1,items:[]},gc=we({name:"rules/integrations",initialState:_0,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{ruleUid:s,integrationUid:o}=n.payload;t.items.push({uid:s,enabled:!0,push:!0,combinator:Be.Or,integration:o,conditions:[{uid:V(),field:"",operator:se.Equals,value:""}]})},modifyPush:(t,n)=>{const{ruleUid:s,push:o}=n.payload,i=t.items.find(r=>r.uid===s);i.push=o},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:o}=n.payload,i=t.items.find(r=>r.uid===s);i.combinator=o},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:o}=n.payload,i=t.items.find(r=>r.uid===s);i.conditions=o},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Mn}=gc,H0=gc.reducer,U0={initialized:!1,items:[]},fc=we({name:"rules/notifications",initialState:U0,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const{ruleUid:s,notificationUid:o}=n.payload;t.items.push({uid:s,enabled:!0,send:!0,combinator:Be.Or,notification:o,conditions:[{uid:V(),field:"",operator:se.Equals,value:""}]})},modifySend:(t,n)=>{const{ruleUid:s,send:o}=n.payload,i=t.items.find(r=>r.uid===s);i.send=o},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:o}=n.payload,i=t.items.find(r=>r.uid===s);i.combinator=o},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:o}=n.payload,i=t.items.find(r=>r.uid===s);i.conditions=o},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:In}=fc,q0=fc.reducer,Q0={initialized:!1,items:[]},bc=we({name:"rules/pages",initialState:Q0,reducers:{set:(t,n)=>{t.initialized=!0,t.items=n.payload},add:(t,n)=>{const s=n.payload;t.items.push({uid:V(),enabled:!0,page:s,combinator:Be.Or,conditions:[{uid:V(),field:"",operator:se.Equals,value:""}]})},modifyCombinator:(t,n)=>{const{ruleUid:s,combinator:o}=n.payload,i=t.items.find(r=>r.uid===s);i.combinator=o},modifyConditions:(t,n)=>{const{ruleUid:s,conditions:o}=n.payload,i=t.items.find(r=>r.uid===s);i.conditions=o},remove:(t,n)=>{t.items.splice(t.items.findIndex(s=>s.uid===n.payload),1)}}}),{actions:Rn}=bc,K0=bc.reducer,V0={},yc=we({name:"rules/submit-form",initialState:V0,reducers:{set:(t,n)=>{t.item=n.payload},add:t=>{t.item={uid:V(),enabled:!0,combinator:Be.Or,conditions:[{uid:V(),field:"",operator:se.Equals,value:""}]}},modifyCombinator:(t,n)=>{t.item.combinator=n.payload},modifyConditions:(t,n)=>{t.item.conditions=n.payload},remove:t=>{t.item=void 0}}}),{actions:An}=yc,G0=yc.reducer,Y0=Rl({fields:W0,pages:K0,notifications:q0,integrations:H0,submitForm:G0,buttons:B0});var $n=(t=>(t.Fields="fields",t))($n||{});const J0={fields:""},jc=we({name:"search",initialState:J0,reducers:{update:(t,n)=>{t[n.payload.type]=n.payload.query},clear:(t,n)=>{t[n.payload]=""}}}),{actions:Z0}=jc,X0=jc.reducer,eh=(t,n)=>{const{getState:s,persist:o}=n;o.translations=s().translations};ie.subscribe(Ut,eh);const th={},vc=we({name:"translations",initialState:th,reducers:{update:(t,{payload:n})=>{const{siteId:s,type:o,namespace:i,handle:r,value:a}=n;if(!t)return{[s]:{[o]:{[i]:{[r]:a}}}};t[s]===void 0&&(t[s]={fields:{},form:{},pages:{}}),(!t[s][o]||typeof t[s][o]!="object")&&(t[s][o]={}),t[s][o]===void 0&&(t[s][o]={}),t[s][o][i]||(t[s][o][i]={}),t[s][o][i][r]=a},remove:(t,{payload:n})=>{const{siteId:s,type:o,namespace:i,handle:r}=n;t[s]!==void 0&&t[s][o]!==void 0&&t[s][o][i]!==void 0&&delete t[s][o][i][r]},init:(t,n)=>n.payload}}),{actions:qo}=vc,nh=vc.reducer,sh=_p({middleware:t=>t().concat(o0),reducer:{form:p0,layout:z0,integrations:f0,notifications:A0,rules:Y0,context:X1,search:X0,translations:nh}}),H=_t.withTypes(),Nt=A,Mi=Al.withTypes(),oh="api_error";class ih extends Error{constructor(n){super(n.message),this.errors={},this.name=oh,this.status=n.response.status,this.errors=n.response.data.errors}getFlatErrors(){return Object.values(this.errors).flatMap(n=>Object.values(n)).join(", ")}}const rh=window.location.href.replace(/(.*\/freeform).*/i,"$1"),ve=(t,n=!0)=>{const s=(t??"").replace(/\/+/g,"/").replace(/^\/(.*)/,"$1").replace(/\/$/,""),o=s.length?`/${s}`:"",i=new URL(`${rh}${o}`);return n?i.href:i.pathname},ah=()=>{if(typeof globalThis<"u"&&globalThis.Craft)return globalThis.Craft;if(typeof window<"u"&&window.Craft)return window.Craft};N.defaults.baseURL=ve("/");N.defaults.headers.get&&(N.defaults.headers.get.Accept="application/json");N.defaults.headers.post&&(N.defaults.headers.post.Accept="application/json");N.interceptors.request.use(t=>{const n=t.method?.toLowerCase();if(n&&["post","put","patch","delete"].includes(n)){t.data===void 0&&(t.data={});const s=ah();s&&t.headers.set("X-CSRF-Token",s.csrfTokenValue)}return t});N.interceptors.response.use(null,t=>(t.response?.data?.error&&(t.message=t.response.data.error),t.response?.data?.errors?Promise.reject(new ih(t)):Promise.reject(t)));const lh=c.div`
  padding: 0 var(--xl);
`,ge={base:["forms"],all:t=>[...ge.base,t],single:t=>[...ge.base,t],settings:()=>[...ge.base,"settings"],usage:(t,n)=>[...ge.base,t,"usage",n]},Qs=()=>{const{current:t,getCurrentHandleWithFallback:n}=Fe();return B({queryKey:ge.all(n()),queryFn:()=>N.get("/api/forms",{params:{site:t?.handle}}).then(s=>s.data),staleTime:1/0,gcTime:1/0})},ch=t=>B({queryKey:ge.single(t),queryFn:()=>N.get(`/api/forms/${t}`).then(n=>n.data),staleTime:1/0,enabled:!!t}),Qt=()=>{const t=H();return B({queryKey:ge.settings(),queryFn:()=>N.get("/api/forms/settings").then(n=>n.data).then(n=>n.sort((s,o)=>s.order-o.order)).then(n=>(t(ht.setInitialSettings(n)),n)),staleTime:1/0,gcTime:1/0})},dh=()=>{const{formId:t}=K(),{current:n}=Fe();return B({queryKey:ge.usage(Number(t),n.id),queryFn:()=>N.get(`/api/forms/${t}/elements?site=${n.id}`).then(s=>s.data)})},uh=()=>{const{data:t}=Qs();return t?.reduce((s,o)=>(s[o.id]=o.settings?.general?.color||null,s),{})||{}},Ie={all:["integrations"],form:t=>[...Ie.all,"forms",t],navigation:["integrations","navigation"],properties:(t,n,s)=>[...Ie.all,"properties",t,n,s],authCheck:t=>[...Ie.all,t,"auth-check"]},ph=t=>{const n=X();return m.useCallback(()=>{t&&n.removeQueries({queryKey:Ie.form(t)})},[t,n])},Ii=t=>{const n=_t();return B({queryKey:Ie.form(t),queryFn:()=>t?N.get(`/api/forms/${t}/integrations`).then(s=>s.data).then(s=>(n(Et.set(s)),s)):Promise.resolve([]),staleTime:1/0,gcTime:1/0})},je={all:["notifications"],types:()=>[...je.all,"types"],templates:()=>[...je.all,"templates"],suggestions:()=>[...je.templates(),"suggestions"],formTemplates:t=>[...je.all,"forms",t,"templates"],single:t=>[...je.all,"forms",t]},hh=t=>{const n=X();return m.useCallback(()=>{t&&(n.removeQueries({queryKey:je.single(t)}),n.removeQueries({queryKey:je.formTemplates(t)}))},[t,n])},wc=()=>B({queryKey:je.types(),queryFn:()=>N.get("/api/notifications/types").then(t=>t.data).then(t=>t.sort((n,s)=>n.order-s.order)),staleTime:1/0,gcTime:1/0}),Ri=t=>{const n=_t();return B({queryKey:je.single(t),queryFn:()=>t?N.get(`/api/forms/${t}/notifications`).then(s=>s.data).then(s=>(n(zt.set(s)),s)):Promise.resolve([]),staleTime:1/0,gcTime:1/0})},xh=()=>B({queryKey:je.templates(),queryFn:()=>N.get("/api/notifications/templates").then(t=>t.data),staleTime:1/0,gcTime:1/0}),mh=t=>{const{templates:{method:n}}=I;return B({queryKey:je.formTemplates(t),queryFn:()=>N.get(`/api/forms/${t}/notifications/templates`).then(s=>s.data),staleTime:1/0,gcTime:1/0,enabled:n!==Yn.Global})},gh=()=>{const{formId:t}=K(),n=te(),s=X();m.useEffect(()=>{const o=xo("/freeform/forms"),i=r=>(r.preventDefault(),t&&(s.invalidateQueries({queryKey:ge.single(Number(t))}),s.invalidateQueries({queryKey:je.single(Number(t))}),s.invalidateQueries({queryKey:Ie.form(Number(t))})),n("/forms"),!1);return o&&o.addEventListener("click",i),()=>{o&&o.removeEventListener("click",i)}},[t,n,s]),m.useEffect(()=>{const o=xo("/freeform/integrations"),i=r=>(r.preventDefault(),n("/integrations"),!1);return o&&o.addEventListener("click",i),()=>{o&&o.removeEventListener("click",i)}},[n]),m.useEffect(()=>{const o=xo("/freeform/ab-tests"),i=r=>(r.preventDefault(),n("/ab-tests"),!1);return o&&o.addEventListener("click",i),()=>{o&&o.removeEventListener("click",i)}},[n])},xo=t=>{let n=document.querySelector(`ul.nav-item__subnav li a[href*="${t}"]`);return n||(n=document.querySelector(`ul.subnav li a[href*="${t}"]`)),n},fh=()=>(gh(),e.jsx(lh,{id:"freeform-client-app",children:e.jsx(mt,{})})),bh=c.header`
  width: auto !important;
`,es=({children:t,extra:n,...s})=>(s.style||(s.style={paddingLeft:0,paddingRight:0}),e.jsx("div",{id:"header-container",children:e.jsxs(bh,{id:"header",...s,children:[e.jsx("div",{id:"page-title",className:"flex",children:e.jsx("h1",{className:"screen-title",children:t})}),n]})})),mo=(t,n)=>{const s=t.children[0],o=t.querySelector(".sidebar-action--sub");n?(s.classList.add("sel"),o?.classList.add("sel"),o?.setAttribute("aria-current","page")):(s.classList.remove("sel"),o?.classList.remove("sel"),o?.removeAttribute("aria-current"))},ts=t=>{const n=document.querySelectorAll("#nav-freeform > ul > li");m.useEffect(()=>(n.forEach(s=>{const o=s.querySelector("a.sidebar-action")?.getAttribute("href");mo(s,o?.includes(t))}),()=>{n.forEach(s=>{mo(s,!1)}),mo(n[0],!0)}),[t,n])},yt=({callback:t,isEnabled:n,refObject:s,excludeClassNames:o})=>{const i=m.useRef(null),r=s||i;return m.useEffect(()=>{const a=l=>{n&&(document.activeElement instanceof HTMLInputElement||document.activeElement instanceof HTMLTextAreaElement||n&&r.current&&!r.current.contains(l.target)&&!R1(l.target,o)&&typeof t=="function"&&t())};return document.addEventListener("click",a,!0),()=>{document.removeEventListener("click",a,!0)}},[r,n,o]),r},Mt=({meetsCondition:t,callback:n,type:s="keyup",ref:o},i=[])=>{const r=o?.current??document;m.useEffect(()=>((t===void 0||t)&&r.addEventListener(s,n),t===!1&&r.removeEventListener(s,n),()=>{r.removeEventListener(s,n)}),[t,n,r,s,...i])},R=t=>{const{title:n,children:s,...o}=t;return e.jsxs("svg",{role:n?"img":void 0,"aria-hidden":n?void 0:!0,xmlns:"http://www.w3.org/2000/svg",...o,children:[yh(n),s]})},yh=t=>t?.trim()?e.jsx("title",{children:t}):null,$c=t=>e.jsxs(R,{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",...t,children:[e.jsx("path",{d:"M5 8C5 8.55228 4.55228 9 4 9C3.44772 9 3 8.55228 3 8C3 7.44772 3.44772 7 4 7C4.55228 7 5 7.44772 5 8Z",fill:"currentColor"}),e.jsx("path",{d:"M10 8C10 8.55228 9.55228 9 9 9C8.44772 9 8 8.55228 8 8C8 7.44772 8.44772 7 9 7C9.55228 7 10 7.44772 10 8Z",fill:"currentColor"}),e.jsx("path",{d:"M15 8C15 8.55228 14.5523 9 14 9C13.4477 9 13 8.55228 13 8C13 7.44772 13.4477 7 14 7C14.5523 7 15 7.44772 15 8Z",fill:"currentColor"})]}),jh=c.div`
  position: relative;
`,vh=c.button`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  width: var(--ui-control-height);
  height: var(--ui-control-height);
  padding: 0;

  border: 1px solid ${p.gray250};
  border-radius: ${k.md};
  background: ${p.white};
  color: ${p.gray700};

  svg {
    width: 18px;
    height: 18px;
    stroke: ${p.gray500};
  }

  &:hover,
  &.open {
    background: rgba(96, 125, 159, 0.3);
  }
`,wh=c.div`
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 100;

  min-width: 120px;

  background: ${p.white};
  box-shadow: ${oe.boxSubtle};

  border: 1px solid ${p.gray200};
  border-radius: ${k.md};
`,$h=c.button`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${f.sm};

  width: 100%;
  padding: ${f.sm} ${f.md};

  background: transparent;
  color: ${({$destructive:t})=>t?p.red600:p.gray700};

  border: 0;
  border-top: 1px solid ${p.gray200};

  font-size: 12px;
  text-align: left;

  &:first-child {
    border-top: 0;
  }

  &:hover {
    background: ${p.gray050};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,Ch=({choices:t,ariaLabel:n=u("Actions")})=>{const[s,o]=m.useState(!1);Mt({callback:r=>{r.key==="Escape"&&o(!1)},meetsCondition:s,type:"keyup"});const i=yt({isEnabled:s,callback:()=>o(!1)});return e.jsxs(jh,{ref:i,children:[e.jsx(vh,{type:"button",className:T(s&&"open"),onClick:()=>o(r=>!r),"aria-label":n,"aria-expanded":s,title:n,children:e.jsx($c,{})}),s&&e.jsx(wh,{children:t.map(r=>e.jsxs($h,{type:"button",className:r.className,$destructive:r.destructive,onClick:()=>{o(!1),r.onClick()},children:[r.icon,e.jsx("span",{children:r.label})]},r.label))})]})},kh=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M100.4 417.2C104.5 402.6 112.2 389.3 123 378.5L304.2 197.3L338.1 163.4C354.7 180 389.4 214.7 442.1 267.4L476 301.3L442.1 335.2L260.9 516.4C250.2 527.1 236.8 534.9 222.2 539L94.4 574.6C86.1 576.9 77.1 574.6 71 568.4C64.9 562.2 62.6 553.3 64.9 545L100.4 417.2zM156 413.5C151.6 418.2 148.4 423.9 146.7 430.1L122.6 517L209.5 492.9C215.9 491.1 221.7 487.8 226.5 483.2L155.9 413.5zM510 267.4C493.4 250.8 458.7 216.1 406 163.4L372 129.5C398.5 103 413.4 88.1 416.9 84.6C430.4 71 448.8 63.4 468 63.4C487.2 63.4 505.6 71 519.1 84.6L554.8 120.3C568.4 133.9 576 152.3 576 171.4C576 190.5 568.4 209 554.8 222.5C551.3 226 536.4 240.9 509.9 267.4z"})}),Cc=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),Sh=({onDelete:t,onEdit:n})=>e.jsx(Ch,{choices:[{icon:e.jsx(kh,{}),label:u("Edit"),onClick:n},{destructive:!0,icon:e.jsx(Cc,{}),label:u("Delete"),onClick:t}]}),kc=t=>e.jsx(R,{width:"14",height:"14",viewBox:"0 0 14 14",...t,children:e.jsx("path",{d:"M2.5 7L5.5 10L11.5 4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"})}),Ai=(t,n={})=>{const{transliterate:s,camelize:o}=n;let i=t;return s&&(i=ki(i)),o&&(i=Ci(i)),i=i.replace(/^[^a-z]+/gi,""),i},Zr=["#1660c7","#d92d20","#7a3ec8","#f58c00","#008f8f","#c200fb","#2d6a4f"],Sc=(t,n)=>t.formColor||Zr[n%Zr.length],Lh=[{id:"conversionRate",label:"Conversion Rate"},{id:"impressions",label:"Impressions"},{id:"interactions",label:"Interactions"},{id:"failures",label:"Failures"}],Lc=t=>`${t.toFixed(1)}%`,Fh=t=>({id:t.id,name:t.name,handle:t.handle,description:t.description,startDate:t.startDate,endDate:t.endDate,variants:t.variants.map(n=>({id:n.id,formId:n.formId,weight:n.weight}))}),Th=(t,n)=>{const s=t[0];return s?s.series.map((o,i)=>{const r={date:o.date};return t.forEach(a=>{const l=a.series[i];r[`variant-${a.id}`]=l?.[n]??0}),r}):[]},go=t=>Ai(t,{transliterate:!0,camelize:!0}),Eh=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};
  margin-bottom: 50px;
`,zh=c.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,Nh=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};
`,Mh=c.section`
  padding: 2px 3px;

  background: ${p.white};
  border: 1px solid ${p.gray200};
  border-radius: ${k.lg};
  box-shadow: ${oe.box};
`,Ih=c.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${f.md};

  padding: ${f.lg} ${f.xl};

  background: ${p.gray050};
  border-radius: ${k.lg};

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
  }

  p {
    margin: 0 0;
    color: ${p.gray700};
  }
`,Rh=c.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${f.sm};

  margin-top: 8px;

  color: ${p.gray700};

  > span {
    &:nth-child(n + 3) {
      &::before {
        content: '•';
        display: inline-block;
        margin-right: ${f.sm};
        color: ${p.gray400};
      }
    }
  }
`,Ah=c.span`
  display: inline-block;
  width: 10px;
  height: 10px;

  border-radius: 50%;
  background: ${({$status:t})=>{switch(t){case"active":return p.green600;case"scheduled":return p.yellow500;default:return p.gray400}}};
`,Dh=c.div`
  padding: ${f.lg} ${f.xl} 0;
`,Ph=c.div`
  display: inline-flex;
  margin-bottom: ${f.lg};

  background: ${p.gray100};
  border-radius: ${k.md};

  overflow: hidden;
`,Bh=c.button`
  cursor: pointer;
  padding: ${f.sm} ${f.md};

  background: ${({$active:t})=>t?p.gray500:p.gray100};
  border: 0;
  color: ${({$active:t})=>t?p.white:p.gray800};
`,Oh=c.div`
  display: grid;
  justify-content: start;
  align-items: end;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${f.md};

  padding: ${f.lg} ${f.xl} ${f.xl};
`,Wh=c.div``,_h=c.article`
  padding: 2px;

  background: ${p.white};
  border: 1px solid ${p.gray200};
  border-radius: ${k.md};

  overflow: hidden;

  &.winner {
    border-color: ${p.green600};
  }
`,Hh=c.div`
  padding: 6px 6px 10px;
  margin: 0 0 -4px;

  border-radius: ${k.lg} ${k.lg} 0 0;
  background: ${p.green600};

  color: ${p.white};
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
`,Uh=c.header`
  display: flex;
  align-items: center;
  gap: ${f.md};

  padding: ${f.md};

  border-radius: ${k.md};
  background: ${p.gray050};

  font-size: 20px;
  font-weight: 600;
`,qh=c.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: 35px;
  height: 35px;

  border-radius: 100%;
  background: ${p.gray300};

  color: ${p.white};

  font-size: 20px;
  font-weight: 700;
  text-align: center;
`,Qh=c.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;

  padding: ${f.md};

  color: ${p.gray700};
`,Kh=c.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: ${f.sm} ${f.md};

  border-radius: ${k.md};
  background: ${p.gray050};

  font-weight: 700;

  .thick {
    font-size: 24px;
    line-height: 24px;
    color: ${p.gray500};
  }
`,Vh=c.div`
  padding: ${f.xl};

  background: ${p.white};
  border: 1px dashed ${p.gray300};
  border-radius: ${k.lg};
  color: ${p.gray700};
`,Fc=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};

  max-height: 70vh;
  min-height: 40vh;
  padding: ${f.lg} ${f.xl};

  overflow: auto;

  td.weight {
    vertical-align: middle;
  }
`,Gh=c.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${f.md};

  .react-datepicker-wrapper {
    width: 100%;
  }
`;c.div`
  display: grid;
  grid-template-columns: 1fr 120px auto;
  align-items: center;
  gap: ${f.sm};

  padding: ${f.md};

  border: 1px solid ${p.gray200};
  border-radius: ${k.md};

  select,
  input {
    width: 100%;
  }
`;c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};
`;const Yh=({variant:t,test:n})=>{const s=t.id===n.winnerVariantId,o=n.endDate&&Ql(n.endDate),i=n.variants.indexOf(t);return e.jsxs(Wh,{children:[s&&e.jsx(Hh,{children:e.jsxs("div",{children:[e.jsx(kc,{})," ",u(o?"Winner":"Winning")]})}),e.jsxs(_h,{className:T(s&&"winner"),children:[e.jsxs(Uh,{children:[e.jsx(qh,{style:{backgroundColor:Sc(t,i)},children:String.fromCharCode(65+i)}),t.formName]}),e.jsxs(Qh,{children:[e.jsx("span",{children:u("Weight")}),e.jsxs("strong",{children:[t.weight,"%"]}),e.jsx("span",{children:u("Impressions")}),e.jsx("strong",{children:t.stats.served.toLocaleString()}),e.jsx("span",{children:u("Interactions")}),e.jsx("strong",{children:t.stats.interacted.toLocaleString()}),e.jsx("span",{children:u("Failures")}),e.jsx("strong",{children:t.stats.failed.toLocaleString()}),e.jsx("span",{children:u("Conversions")}),e.jsx("strong",{children:t.stats.completed.toLocaleString()})]}),e.jsxs(Kh,{children:[e.jsx("span",{children:u("Conversion Rate")}),e.jsx("span",{className:"thick",children:Lc(t.stats.conversionRate)})]})]})]},t.id)},Jh=({test:t,activeTab:n,setTab:s})=>{const o=Th(t.variants,n),i=n==="conversionRate";return e.jsxs(Dh,{children:[e.jsx(Ph,{children:Lh.map(r=>e.jsx(Bh,{$active:n===r.id,onClick:()=>s(t,r.id),children:u(r.label)},r.id))}),e.jsx(Xe,{width:"100%",height:280,children:e.jsxs(Hp,{data:o,margin:{top:12,right:12,left:0,bottom:0},children:[e.jsx(Dl,{stroke:"#e5e7eb99",vertical:!1}),e.jsx(Pl,{dataKey:"date",axisLine:!1,tickLine:!1,interval:2,tickFormatter:r=>new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),e.jsx(Si,{axisLine:!1,tickLine:!1,tickFormatter:r=>`${r}${i?"%":""}`}),e.jsx(Li,{formatter:r=>i?Lc(Number(r)):Number(r),labelFormatter:r=>new Date(r).toLocaleDateString("en-US",{month:"short",day:"numeric"})}),t.variants.map((r,a)=>e.jsx(Up,{type:"linear",dataKey:`variant-${r.id}`,stroke:Sc(r,a),strokeWidth:2,dot:!1,name:r.formName||`Variant ${a+1}`},r.id))]})})]})},Zh=p.gray100,Xr=p.gray300,q=ne`
  scrollbar-width: thin;
  scrollbar-color: ${Xr} ${Zh};
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${Xr};
  }
`,We=ne`
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
`,Di=ne`
  span:after {
    content: 'alert';

    position: relative;
    top: 1px;

    padding-left: 5px;

    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'liga', 'dlig';
    font-family: Craft;
  }
`,Xh=c.div`
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;

  overflow: hidden;
  border-right: 1px solid rgb(154 165 177 / 25%);

  pointer-events: ${({$active:t})=>t?"auto":"none"};
  background: ${({$active:t})=>t?p.gray050:"transparent"};

  transition: background-color 0.2s ease-in-out;
`,e2=c(W.div)`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  z-index: 2;
`,Qo=c.a`
  position: absolute;
  right: 10px;
  top: 17px;

  z-index: 5;

  display: block;
  width: 20px;
  height: 20px;
`,hn=c.h3`
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: end;
  gap: ${f.sm};

  margin: 0;
  padding: ${f.lg};

  font-size: 16px;
  box-shadow: ${oe.bottom};

  > span {
    display: block;
  }
`,Hn=c.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 20px;
  height: 20px;

  svg {
    max-width: 20px;
    max-height: 20px;
  }
`,Un=c.div`
  display: flex;
  flex-direction: column;

  padding: 0 ${f.lg} ${f.lg};

  overflow-y: auto;
  overflow-x: hidden;
  ${q};
`,As=c(Hn)`
  position: absolute;
  left: 2px;
  top: 12px;
  z-index: 1;

  width: 14px;
  height: 14px;

  fill: rgb(154 165 177 / 75%);
`,Pi=c.section`
  position: relative;

  display: flex;
  flex-direction: column;
  gap: ${f.md};

  margin-top: ${f.lg};
  padding-top: ${f.lg};
  padding-bottom: ${f.lg};

  &:empty {
    display: none;

    & + ${As} {
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

    box-shadow: ${oe.bottom};
  }

  &:after {
    content: attr(data-label);

    position: absolute;
    left: -5px;
    top: -9px;

    display: block;
    padding: 0 5px 0 26px;

    background-color: ${p.gray050};

    ${We};
    font-size: 11px;
  }
`,t2=c.div`
  position: relative;

  &:first-child {
    ${Pi} {
      margin-top: 0;

      &:before,
      &:after {
        display: none;
      }
    }

    ${As} {
      display: none;
    }
  }
`,ea=20,n2=(t,n)=>{const s=t?.getBoundingClientRect().top,o=window.innerHeight,i=n?.offsetHeight;return i===void 0?s:s&&i&&o?s+i>o-ea?s-(s+i-o+ea):s:0},s2=(t,n,s)=>{const{dimensions:o}=sc(),[i,r]=m.useState(0),[a,l]=m.useState(0);let d=null;const h=m.useCallback(()=>{d===null&&(d=requestAnimationFrame(()=>{d=null,r(n2(t,n));const x=t?.getBoundingClientRect()?.left;x!=null&&o&&l(x-o.left)}))},[t,n,o,d]);return m.useEffect(()=>{h()},[s]),m.useEffect(()=>{const x=()=>{h()};if(n){const g=document.querySelector(Un.toString()),b=new ResizeObserver(x);return b.observe(n),window.addEventListener("resize",x),window.addEventListener("scroll",x),g?.addEventListener("scroll",x),()=>{b.disconnect(),window.removeEventListener("resize",x),window.removeEventListener("scroll",x),g?.removeEventListener("scroll",x),d!==null&&cancelAnimationFrame(d)}}},[n,d,h]),{top:i,left:a}},Tc=({wrapper:t,editor:n,isEditing:s})=>{const{top:o,left:i}=s2(t,n,s),r=t?.offsetWidth,[a,l]=m.useState(!1);return{editorAnimation:G({immediate:h=>["top","left","width","pointerEvents","transformOrigin"].includes(h),to:{top:o,left:i,width:r,opacity:s?1:0,transformOrigin:"top left",transform:s?"scaleY(1)":"scaleY(0.5)",pointerEvents:s?"initial":"none"},config:{tension:700,friction:40}}),isVisible:a,setVisible:l}},Bi=t=>e.jsxs(R,{viewBox:"0 0 512 512",...t,children:[e.jsx("style",{children:`.spinner-path {
      transform-origin: center;
      animation: spinner-animation 1s linear infinite reverse
    }

    @keyframes spinner-animation{
      100% {
        transform:rotate(360deg)
      }
    }`}),e.jsx("path",{className:"spinner-path",d:"M224 32c0-17.7 14.3-32 32-32C397.4 0 512 114.6 512 256c0 46.6-12.5 90.4-34.3 128c-8.8 15.3-28.4 20.5-43.7 11.7s-20.5-28.4-11.7-43.7c16.3-28.2 25.7-61 25.7-96c0-106-86-192-192-192c-17.7 0-32-14.3-32-32z"})]}),Ec=({children:t})=>{const{element:n}=sc();return n?$i.createPortal(t,n):null},o2=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M326.6 166.6L349.3 144 304 98.7l-22.6 22.6L192 210.7l-89.4-89.4L80 98.7 34.7 144l22.6 22.6L146.7 256 57.4 345.4 34.7 368 80 413.3l22.6-22.6L192 301.3l89.4 89.4L304 413.3 349.3 368l-22.6-22.6L237.3 256l89.4-89.4z"})}),zc=(t,n)=>{if(!t)return!1;for(const s of t)if("value"in s&&String(s.value)===String(n)||"children"in s&&zc(s.children,n))return!0;return!1},Nc=t=>{if(t)for(const n of t){if("value"in n)return n.value;if("children"in n){const s=Nc(n.children);if(s!==void 0)return s}}},Mc=(t,n)=>{if(t)for(const s of t){if("value"in s&&String(s.value)===String(n))return s;if("children"in s){const o=Mc(s.children,n);if(o!==void 0)return o}}},Ic=(t,n)=>{if(t)for(const s of t){if("value"in s&&String(s.value)===String(n))return s.shadowIndex;if("children"in s)return Ic(s.children,n)}},Rc=(t,n)=>{if(t)for(const s of t){if("shadowIndex"in s&&s.shadowIndex===n)return s.value;if("children"in s){const o=Rc(s.children,n);if(o!==void 0)return o}}},Ac=(t,n,s=0,o)=>{let i=s,r;o!=null&&!n&&(r={label:u(o),value:"",shadowIndex:i++});const a=t?.map(l=>{if("value"in l&&(!n||l.label.toLowerCase().includes(n.toLowerCase())))return{...l,shadowIndex:i++};if("children"in l){const[d,h]=Ac(l.children,n,i);if(d.length)return i=h,{...l,children:d}}return null}).filter(Boolean)||[];return r&&a.unshift(r),[a,i]},i2=(t,n,s)=>{const[o,i]=m.useState(0),[r,a]=m.useState(t);return m.useEffect(()=>{const[l,d]=Ac(t,n,void 0,s);a(l),i(d)},[t,n,s]),[r,o]},r2=t=>e.jsx(R,{viewBox:"0 0 100 100",version:"1.1",...t,children:e.jsx("g",{stroke:"none",strokeWidth:"1",children:e.jsx("g",{children:e.jsx("path",{d:"M100.006315,26.9686872 C100.006315,28.5816922 99.3611131,30.1946973 98.1997494,31.356061 L42.7123746,86.8434358 C41.5510109,88.0047995 39.9380058,88.6500015 38.3250008,88.6500015 C36.7119957,88.6500015 35.0989906,88.0047995 33.9376269,86.8434358 L1.80656569,54.7123746 C0.645202033,53.5510109 0,51.9380058 0,50.3250008 C0,48.7119957 0.645202033,47.0989906 1.80656569,45.9376269 L10.5813133,37.1628793 C11.742677,36.0015156 13.3556821,35.3563136 14.9686872,35.3563136 C16.5816922,35.3563136 18.1946973,36.0015156 19.356061,37.1628793 L38.3250008,56.1963393 L80.6502541,13.8065657 C81.8116178,12.645202 83.4246229,12 85.037628,12 C86.650633,12 88.2636381,12.645202 89.4250018,13.8065657 L98.1997494,22.5813133 C99.3611131,23.742677 100.006315,25.3556821 100.006315,26.9686872 Z",id:"raiarzrpcn-Shape"})})})}),Dc=(t=1)=>t>10?"":`& > li {
    > label {
      padding-left: ${t*10+20}px;

      &.has-children {
        padding-left: ${(t+1)*12}px;
      }
    }

    > ul {
      ${Dc(t+1)}
    }
  }`,a2=c.ul`
  margin: 0;
  padding: 0;

  ul {
    ${Dc()}
  }
`,Ds=c.div`
  position: absolute;
  left: 8px;
  top: 7px;

  width: 16px;
  font-size: 18px;
  font-weight: bold;

  fill: ${p.gray500};
`;c.div``;const Pc=c.div`
  display: inline-flex;
  justify-content: start;
  align-items: center;
  gap: ${f.sm};

  > svg {
    width: 16px;
    height: 16px;
  }
`,ta=c.div`
  color: ${p.gray300};
  font-size: 11px;
  font-style: italic;
  line-height: 11px;
  height: 11px;
`,Dn=c.label`
  display: block;
  padding: 5px 14px 5px 30px;

  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: ${p.gray500};
    color: ${p.white};

    ${Ds} {
      fill: ${p.white};
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

    > ${Pc} {
      position: relative;

      padding: 0 10px;
      background-color: ${p.gray050};

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
      background-color: ${p.gray200};
    }
  }
`,l2=c.li`
  position: relative;

  &.focused {
    > ${Dn} {
      background-color: #cfd8e3;
      color: ${p.gray700};

      > ${Ds} {
        fill: ${p.gray700};
      }
    }
  }

  &.has-children {
    > ${Dn} {
    }
  }

  &.empty {
    > ${Dn} {
      color: ${p.gray300};
      font-style: italic;

      &:hover {
        color: ${p.white};
      }
    }

    &.focused {
      > ${Dn} {
        background-color: transparent;

        &:hover {
          background-color: ${p.gray500};
          color: ${p.white};
        }

        > ${Ds} {
          fill: transparent;
        }
      }
    }
  }
`,c2=c.input`
  width: 100%;
  padding: 7px 30px 7px 10px;

  border-bottom: 1px solid ${p.hairline};

  &:focus,
  &:active,
  &:hover {
    box-shadow: none;
    outline: none;
  }
`,d2=c.div`
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;

  ${q};
`,Bc=c.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: start;
  gap: ${f.sm};

  background-color: #dfe5ec;
  border-radius: ${k.lg};

  padding: 7px 22px 7px 10px;

  &.empty > span {
    color: ${p.gray300};
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
`,u2=c.div`
  > svg {
    fill: currentColor;
    width: 20px;
    height: 20px;
  }
`,Oc=c(W.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;

  background-color: ${p.gray050};
  border-radius: ${k.lg};
  box-shadow: ${oe.container};

  overflow: hidden;
  z-index: 1000;
`,p2=c.button`
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
    background-color: ${p.gray050};
  }
`,h2=c.div`
  position: relative;

  &.open {
    ${Oc} {
      display: block;
    }

    ${Bc} {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;

      &:hover {
        box-shadow: none;
        outline-color: transparent;
      }
    }
  }
`,Wc=c.span`
  display: flex;
  align-items: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`,x2=c.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  svg {
    width: 16px !important;
    height: 16px !important;
  }
`,_c=({value:t,options:n,query:s,focusIndex:o,showValues:i,showHints:r,onChange:a})=>{const l=m.useRef([]);return m.useEffect(()=>{l.current[o]&&l.current[o].scrollIntoView({behavior:"smooth",block:"nearest"})},[o]),e.jsx(a2,{children:n?.map((d,h)=>{let x,g,b;"value"in d&&(x=d.value,b=d.shadowIndex),"hint"in d&&(g=d.hint);let y;return"children"in d&&(y=d.children),e.jsxs(l2,{ref:j=>{b!==void 0&&(l.current[b]=j)},onClick:j=>{j.stopPropagation(),x!==void 0&&a&&a(x)},className:T(y!==void 0&&"has-children",x===t&&"selected",x===""&&"empty",b===o&&"focused"),children:[e.jsxs(Dn,{className:T(y!==void 0&&"has-children"),"data-value":x,children:[!y&&t===x&&e.jsx(Ds,{children:e.jsx(r2,{})}),e.jsxs(Pc,{children:[d.icon&&e.jsx(x2,{children:d.icon}),e.jsx("div",{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(d.label)}})})]}),!i&&r&&g&&e.jsx(ta,{children:g}),i&&x!==""&&x!==void 0&&x!==null&&x!==d.label&&e.jsx(ta,{children:x})]}),y&&e.jsx(_c,{options:y,value:t,query:s,focusIndex:o,onChange:a,showHints:r,showValues:i})]},h)})})},ce=({emptyOption:t,value:n,options:s,showValues:o,showHints:i,showSelectedIcon:r,onChange:a,className:l,loading:d=!1})=>{const[h,x]=m.useState(!1),[g,b]=m.useState(""),[y,j]=m.useState(0),w=m.useRef(null),v=m.useRef(null),$=yt({callback:()=>x(!1),isEnabled:h,excludeClassNames:["dropdown-rollout"]}),{editorAnimation:C}=Tc({wrapper:$.current,editor:v.current,isEditing:h}),E=m.useCallback(()=>{d||x(!h)},[d,h]),[F,z]=i2(s,g,t),M=m.useMemo(()=>Mc(s,n),[s,n]),S=m.useMemo(()=>Ic(F,n),[F,n]);Jn(()=>x(!1),h),Mt({meetsCondition:h,type:"keydown",callback:P=>{P.key==="ArrowDown"&&y<z-1&&j(ae=>ae+1),P.key==="ArrowUp"&&y>0&&j(ae=>ae-1)}},[y,z]),Mt({meetsCondition:h,type:"keyup",callback:P=>{if(P.key==="Enter"){const ae=Rc(F,y);a?.(ae),x(!1)}}},[F,y]),m.useEffect(()=>{d&&h&&x(!1)},[d,h]),m.useEffect(()=>{h?(w.current?.focus(),j(S||0)):b("")},[h,S]);const D=m.useCallback(P=>{a?.(P),x(!1)},[a]);return e.jsxs(h2,{ref:$,className:T(h&&"open",l),onClick:E,children:[e.jsxs(Bc,{className:T(d&&"disabled",(n===""||n===null)&&"empty"),children:[r&&e.jsx(Wc,{children:M?.icon}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(M?.label||u(t))}}),d&&e.jsx(u2,{children:e.jsx(Bi,{})})]}),e.jsx(Ec,{children:h&&e.jsxs(Oc,{className:"dropdown-rollout",ref:v,style:C,children:[e.jsx(p2,{children:e.jsx(o2,{})}),e.jsx(c2,{placeholder:u("Search..."),ref:w,value:g,onClick:P=>P.stopPropagation(),onKeyDown:P=>{["ArrowUp","ArrowDown"].includes(P.key)&&P.preventDefault()},onChange:P=>b(P.target.value)}),e.jsx(d2,{children:e.jsx(_c,{options:F,value:n,focusIndex:y,showValues:o,showHints:i,onChange:D})})]})})]})},qn={all:["field-types"],propertySections:()=>[...qn.all,"property-sections"]},Hc=()=>N.get("/api/fields/types").then(t=>t.data),Oi=({select:t}={})=>B({queryKey:qn.all,queryFn:Hc,staleTime:1/0,select:t}),Uc=()=>N.get("/api/fields/types/sections").then(t=>t.data).then(t=>t.sort((n,s)=>n.order-s.order)),Wi=()=>B({queryKey:qn.propertySections(),queryFn:Uc,staleTime:1/0}),Ne=t=>{const{data:n}=Oi();if(n)return n.find(s=>s.typeClass===t)},Kt=()=>{const{data:t}=Oi();return n=>{if(t)return t.find(s=>s.typeClass===n)}},m2={all:["page-type"]},qc=()=>B({queryKey:m2.all,queryFn:()=>N.get("/api/types/page-buttons").then(t=>t.data),staleTime:1/0});var Y=(t=>(t.Ai="ai",t.AppStateSelect="appStateSelect",t.AssetPicker="assetPicker",t.Attributes="attributes",t.Boolean="bool",t.BooleanEnv="boolEnv",t.FormMonitorTools="formMonitorTools",t.Calculation="calculation",t.Cards="cards",t.Checkboxes="checkboxes",t.CodeEditor="codeEditor",t.Color="color",t.ConditionalRules="conditionalRules",t.DateTime="dateTime",t.DynamicCheckboxes="dynamicCheckboxes",t.DynamicSelect="dynamicSelect",t.Field="field",t.FieldMapping="fieldMapping",t.FieldSelection="fieldSelection",t.FieldType="fieldType",t.Hidden="hidden",t.Integer="int",t.Label="label",t.MinMax="minMax",t.NotificationTemplate="notificationTemplate",t.OptionPicker="optionPicker",t.Options="options",t.PageButton="pageButton",t.PageButtonsLayout="pageButtonsLayout",t.RecipientMapping="recipientMapping",t.Recipients="recipients",t.SaveButton="saveButton",t.Select="select",t.String="string",t.Table="table",t.TabularData="tabularData",t.Textarea="textarea",t.WYSIWYG="wysiwyg",t))(Y||{});const De={current:t=>t.form,settings:{all:()=>t=>t.form.settings||{},one:t=>n=>n.form.settings?.[t],namespaces:{all:t=>n=>n.form.settings?.[t],one:(t,n)=>s=>s.form.settings?.[t]?.[n]}},errors:t=>t.form.errors},g2={namespace:(t,n)=>J(s=>s.translations?.[t],s=>{if(!n)return;let o,i=n?.uid;return"properties"in n?o="fields":"namespaceType"in n&&n.namespaceType==="settings"?(o="form",i=n.namespace):o="pages",s?.[o]?.[i]})},f2=[Y.Options];function ye(t){const n=H(),{current:s,isPrimary:o}=Fe(),i=Kt(),a=A(De.settings.one("general"))?.translations,{data:l}=qc(),{data:d}=Qt(),h=t&&"typeClass"in t,x=t&&"namespaceType"in t&&t.namespaceType==="settings",g=s.id,b=x?t.namespace:t?.uid,y=h?"fields":x?"form":"pages",j=Nt(g2.namespace(s.id,t)),w=m.useCallback(S=>{if(h){const D=i(t.typeClass);return D?D.properties.find(P=>P.handle===S):void 0}if(x){const D=d?.find(P=>P.handle===b);return D?D.properties.find(P=>P.handle===S):void 0}return l?.properties?.find(D=>D.handle===S)},[h,x,i,l,b]),v=m.useCallback(S=>t&&j?.[S]!==void 0,[t,j]),$=m.useCallback(S=>{if(!a||!t||o)return!1;const D=w(S);return D===void 0?S==="label":D.translatable},[o,t,a,w]),C=m.useCallback((S,D)=>!$(S)||!v(S)?D:j[S],[j,$,v]),E=m.useCallback((S,D)=>{if(!$(S)||!v(S))return D;const P=pt(D),ae=j[S];return P.source==="custom"&&ae.options&&(P.options=P.options.map(ue=>{const wt=ae.options.find(tn=>tn.value===ue.value);return wt?{...ue,label:wt.label}:ue})),P},[j,$,v]);return{hasTranslation:v,willTranslate:$,getTranslation:C,getOptionTranslations:E,updateTranslation:(S,D)=>$(S)?(n(qo.update({siteId:g,type:y,namespace:b,handle:S,value:D})),!0):!1,removeTranslation:S=>{$(S)&&n(qo.remove({siteId:g,type:y,namespace:b,handle:S}))},canUseTranslationValue:S=>S.translatable&&f2.includes(S.type)===!1,isTranslationsEnabled:a}}const Cn=c.label`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 6px;

  color: ${p.gray550};
  font-weight: ${({$regular:t})=>t?"normal":"bold"} !important;
`,b2=c.span``,y2=c.span`
  &:after {
    content: 'asterisk';

    color: ${p.red500};
    font-family: Craft;
    font-size: 10px;
  }
`,na=18,Qc=c.span`
  fill: ${p.gray500};

  &.active {
    cursor: pointer;
    fill: ${p.blue500};
  }

  svg {
    width: ${na}px;
    height: ${na}px;
  }
`,Kc=c.span`
  display: block;

  color: ${p.gray300};
  padding-top: 0;
  line-height: 16px;
  font-size: 12px;
  font-style: italic;
  margin: ${f.xs} 0;

  &:not(:last-child) {
    padding-bottom: 6px;
  }

  code {
    padding: 1px 4px;
    border-radius: 3px;
    background-color: #dfe5ec;

    font-family: monospace;
    font-style: normal;
    color: ${p.gray600};
  }
`,_i=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};

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
`,ns=c.div`
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
    ${Cn} {
      color: ${p.error};
    }

    ${_i} {
      input,
      textarea,
      select {
        border: 1px solid ${p.error};
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

      padding: ${f.md} ${f.xl};

      border: 2px solid ${p.blue400};
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2);

      font-size: 14px;
      text-align: center;
      color: ${p.gray700};
    }

    &.size-small:before {
      font-size: 12px;
      left: auto;
      right: 0;
      transform: translate(0, -50%);

      padding: ${f.xs} ${f.xs};
      width: 120px;
  }

  &.spacing-small {
    padding-top: 6px;
  }

  ::placeholder {
    color: ${p.gray200};
    font-style: italic;
  }

  .btn {
    background-color: var(--ui-control-bg-color);

    &:hover {
      background-color: var(--ui-control-hover-bg-color);
    }
  }
`,j2=c.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${f.sm};

  width: 100%;
`,v2=c.div`
  flex: 1;
`,sa=c.div``,Vc=t=>m.useMemo(()=>t?t.split(/`([^`]+)`/g).map((o,i)=>i%2!==0?e.jsx("code",{children:o},i):o):null,[t]),ss=m.memo(({instructions:t})=>{const n=m.useMemo(()=>t?u(t):null,[t]),s=Vc(n);return s?e.jsx(Kc,{children:s}):null});ss.displayName="FormInstructions";const Gc=t=>e.jsx(R,{viewBox:"0 0 640 512",...t,children:e.jsx("path",{d:"M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l208 0 32 0 16 0 256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L320 64l-16 0-32 0L64 64zm512 48c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16l-256 0 0-288 256 0zM178.3 175.9l64 144c4.5 10.1-.1 21.9-10.2 26.4s-21.9-.1-26.4-10.2L196.8 316l-73.6 0-8.9 20.1c-4.5 10.1-16.3 14.6-26.4 10.2s-14.6-16.3-10.2-26.4l64-144c3.2-7.2 10.4-11.9 18.3-11.9s15.1 4.7 18.3 11.9zM179 276l-19-42.8L141 276l38 0zM456 164c-11 0-20 9-20 20l0 4-52 0c-11 0-20 9-20 20s9 20 20 20l72 0 35.1 0c-7.3 16.7-17.4 31.9-29.8 45l-.5-.5-14.6-14.6c-7.8-7.8-20.5-7.8-28.3 0s-7.8 20.5 0 28.3L430 298.3c-5.9 3.6-12.1 6.9-18.5 9.8l-3.6 1.6c-10.1 4.5-14.6 16.3-10.2 26.4s16.3 14.6 26.4 10.2l3.6-1.6c12-5.3 23.4-11.8 34-19.4c4.3 3 8.6 5.8 13.1 8.5l18.9 11.3c9.5 5.7 21.8 2.6 27.4-6.9s2.6-21.8-6.9-27.4l-18.9-11.3c-.9-.5-1.8-1.1-2.7-1.6c17.2-18.8 30.7-40.9 39.6-65.4L534 228l2 0c11 0 20-9 20-20s-9-20-20-20l-16 0-44 0 0-4c0-11-9-20-20-20z"})}),Yc=({label:t,handle:n,required:s,translatable:o,hasTranslation:i,isEncrypted:r,removeTranslation:a})=>t?e.jsxs(Cn,{className:T(s&&"is-required"),htmlFor:n,children:[e.jsx(b2,{children:u(t)}),s&&e.jsx(y2,{}),r&&e.jsx("i",{className:"fa-solid fa-shield-alt",style:{color:p.blue500},title:u("This field is encrypted.")}),o&&e.jsx(Qc,{className:T(i&&"active"),title:i?u("Remove translation"):void 0,onClick:()=>{i&&confirm(u("Are you sure you want to remove the translation?"))&&a?.()},children:e.jsx(Gc,{})})]}):null,Jc=m.createContext({size:"normal"}),Zc=({size:t,children:n})=>e.jsx(Jc.Provider,{value:{size:t??"normal"},children:n}),Hi=()=>m.useContext(Jc),w2=c.ul`
  list-style: square;

  margin-top: 5px;
  padding-left: 20px;

  color: ${p.error};
`,Ks=({errors:t,...n})=>!t||!t.length?null:e.jsx(w2,{...n,children:t.map((s,o)=>e.jsx("li",{children:s},o))}),$2=c.ul`
  list-style: none;

  margin-top: 5px;

  display: flex;
  flex-direction: column;
  gap: 2px;

  > li {
    &.message-type-warning {
      color: ${p.warning};
    }

    &.message-type-notice {
      color: ${p.notice};
    }
  }
`,C2=({messages:t,...n})=>!t||!t.length?null:e.jsx($2,{...n,children:t.map(({message:s,type:o},i)=>e.jsxs("li",{className:T(`message-type-${o}`,o,"has-icon"),children:[e.jsx("span",{className:"icon"}),u(s)]},i))}),Ee=({edition:t,label:n,handle:s,required:o,instructions:i,translatable:r,hasTranslation:a,removeTranslation:l,width:d,disabled:h,children:x,errors:g,messages:b,isEncrypted:y,preContent:j,extraContent:w,align:v,justify:$})=>{const{size:C}=Hi(),{editions:{isAtLeast:E}}=I,F=t!==le.Express&&!E(t||le.Express);return e.jsxs(ns,{className:T(!!g&&"errors",h&&"disabled",C&&`size-${C}`,F&&"upsell"),"data-upsell":u("Upgrade to {edition} to unlock this setting.",{edition:Bl(t)}),$width:d,children:[e.jsxs(j2,{children:[j!==void 0&&e.jsx(sa,{children:j}),e.jsxs(v2,{children:[e.jsx(Yc,{label:n,handle:s,required:o,translatable:r,hasTranslation:a,isEncrypted:y,removeTranslation:l}),e.jsx(ss,{instructions:i})]}),w!==void 0&&e.jsx(sa,{children:w})]}),e.jsx(_i,{className:T(v&&`align-${v}`,$&&`justify-${$}`),children:x}),e.jsx(Ks,{errors:g}),e.jsx(C2,{messages:b})]})},_=({children:t,property:n,label:s,handle:o,required:i,instructions:r,width:a,disabled:l,errors:d,context:h,preContent:x,align:g,justify:b})=>{const{hasTranslation:y,removeTranslation:j,isTranslationsEnabled:w}=ye(h),{edition:v,translatable:$,messages:C}=n||{};return e.jsx(Ee,{edition:v,label:n?.label||s,handle:n?.handle||o,required:n?.required||i,instructions:n?.instructions||r,width:n?.width||a,disabled:n?.disabled||l,errors:d,messages:C,translatable:w&&$,hasTranslation:y(o),isEncrypted:n?.flags?.includes("encrypted"),removeTranslation:()=>j(o),preContent:x,align:g,justify:b,children:t})},fo=new Map([["en",Kr],["en-US",Kr]]),oa={nl:async()=>(await gs(async()=>{const{nl:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.a9);return{nl:t}},[],import.meta.url)).nl,de:async()=>(await gs(async()=>{const{de:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.aa);return{de:t}},[],import.meta.url)).de,fr:async()=>(await gs(async()=>{const{fr:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.ab);return{fr:t}},[],import.meta.url)).fr,it:async()=>(await gs(async()=>{const{it:t}=await import("./date-fns-BTAAV4UA.js").then(n=>n.ac);return{it:t}},[],import.meta.url)).it},k2=t=>{const n=String(t??"").trim().replace("_","-");if(!n)return"en-US";const[s,o]=n.split("-");return o?`${s.toLowerCase()}-${o.toUpperCase()}`:s.toLowerCase()};async function S2(t){const n=k2(t),s=n.includes("-")?[n,n.split("-")[0]]:[n],o=r=>r==="en"?["en-US"]:[r];for(const r of s.flatMap(o)){const a=fo.get(r);if(a)return a;const l=oa[r];if(!l)continue;const d=await l();return fo.set(r,d),d}const i=await oa["en-US"]();return fo.set("en-US",i),i}const L2=c.div`
  position: relative;

  .react-datepicker__navigation-icon {
    top: 4px;
  }
`;c.div`
  position: absolute;
  left: 150px;
  top: 5px;

  z-index: 2;

  font-size: 16px;
  color: ${p.gray400};

  user-select: none;
  pointer-events: none;
`;const F2="yyyy-MM-dd",{metadata:{craft:{locale:T2}}}=I,Ko=({value:t,property:n,errors:s,updateValue:o})=>{const{dateFormat:i,minDate:r,maxDate:a}=n,l=i||F2,d=r?zs(r):void 0,h=a?zs(a):void 0,x=t?zs(t):void 0,[g,b]=m.useState(void 0);return m.useEffect(()=>{S2(T2).then(b).catch(()=>b(void 0))},[]),e.jsx(_,{property:n,errors:s,children:e.jsx(L2,{children:e.jsx(qp,{locale:g,id:n.handle,minDate:d,maxDate:h,selected:x,dateFormat:l,className:T("text","fullwidth"),onChange:y=>o(y?L1(y):null)})})})},E2=()=>e.jsxs(z2,{className:"notice has-icon",children:[e.jsx("span",{className:"icon","aria-hidden":"true"}),e.jsx("span",{className:"visually-hidden",children:"Tip: "}),e.jsxs("span",{children:[u("This can begin with an environment variable.")," ",e.jsx("a",{href:"https://craftcms.com/docs/5.x/configure.html#control-panel-settings",className:"go",target:"_blank",rel:"noopener noreferrer",children:u("Learn more")})]})]}),z2=c.p`
  margin-top: 5px;
`,N2=(t,n)=>m.useMemo(()=>!t||t.length===0?[]:n?t.map(o=>{const i=o.data.filter(r=>n?r.name.toLowerCase().includes(n.toLowerCase()):!0);return{...o,data:i}}).filter(o=>o.data.length>0):t,[t,n]),M2=t=>{const[n,s]=m.useState(!1);return m.useEffect(()=>{const o=t?.current;if(!o)return;const i=()=>s(!0),r=()=>{setTimeout(()=>{s(!1)},200)};return o.addEventListener("focus",i),o.addEventListener("blur",r),()=>{o.removeEventListener("focus",i),o.removeEventListener("blur",r)}},[t?.current]),n},I2=c.ul`
  position: absolute;
  z-index: 2;

  width: 100%;
  max-height: 300px;
  overflow-y: auto;

  padding: 0;
  margin: 0;

  background-color: ${p.white};
  border-radius: ${k.lg};
  box-shadow: ${oe.autosuggest};

  ${q};
`,R2=c.li`
  padding-top: 8px;
`,A2=c.div`
  margin: 14px 0 3px;
  padding: 0 14px;

  color: ${p.gray400};
  font-size: 11px;
  line-height: 1.2;
  text-transform: uppercase;
`,D2=c.ul``,Xc=c.span`
  display: inline-block;
  width: 8px;
  height: 1px;
  background-color: ${p.gray400};
`,ed=c.span`
  flex: 0 0 auto;
  color: ${p.gray700};
`,td=c.span`
  flex: 0 1 auto;
  color: ${p.gray400};
`,P2=c.li`
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
    background-color: ${p.gray500};

    ${ed}, ${td} {
      color: ${p.white};
    }

    ${Xc} {
      background-color: ${p.white};
    }
  }
`,B2=({inputRef:t,filter:n,suggestions:s,update:o})=>{const i=M2(t),r=N2(s,n);return!r.length||!i?null:e.jsx(I2,{children:r.map(a=>e.jsxs(R2,{children:[e.jsx(A2,{children:a.label}),e.jsx(D2,{children:a.data.map(({name:l,hint:d})=>e.jsxs(P2,{onClick:()=>o(l),children:[e.jsx(ed,{children:l}),!!d&&e.jsxs(e.Fragment,{children:[e.jsx(Xc,{}),e.jsx(td,{children:d})]})]},l))})]},a.label))})},It=({value:t,property:n,errors:s,updateValue:o,autoFocus:i,context:r})=>{const{handle:a}=n,l=m.useRef(null);m.useEffect(()=>{i&&l.current?.focus({preventScroll:!0})},[i]);const d=n.flags?.includes("code"),h=n.flags?.includes("readonly"),x=n.flags?.includes("env-suggest"),{data:g}=B({queryKey:["autosuggest","env"],queryFn:()=>N.get("/api/autosuggest/env").then(b=>b.data),enabled:x,staleTime:1/0,gcTime:1/0});return e.jsxs(_,{property:n,errors:s,context:r,children:[e.jsx("input",{id:a,ref:l,type:"text",autoComplete:"off","data-1p-ignore":!0,readOnly:h,className:T("text","fullwidth",d&&"code",h&&"readonly"),value:t??"",placeholder:n.placeholder,onChange:b=>o(b.target.value)}),x&&!!g&&e.jsxs(e.Fragment,{children:[e.jsx(B2,{inputRef:l,filter:t,suggestions:g,update:b=>o(b)}),e.jsx(E2,{})]})]})},O2=c.textarea`
  &.read-only {
    border: 1px solid rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);

    user-select: none;
  }
`,os=me.forwardRef(({value:t,property:n,errors:s,updateValue:o,autoFocus:i,focus:r,context:a},l)=>{const{handle:d,rows:h}=n,x=m.useRef(null);return m.useImperativeHandle(l,()=>x.current),m.useEffect(()=>{r&&x.current?.focus()},[r]),e.jsx(_,{property:n,errors:s,context:a,children:e.jsx(O2,{id:d,ref:x,className:T("text","fullwidth",n.flags?.includes("as-readonly-in-instance")&&"read-only",n.flags?.includes("code")&&"code"),readOnly:n.flags?.includes("as-readonly-in-instance"),rows:h,value:t??"",placeholder:n.placeholder,autoFocus:i,onChange:g=>o(g.target.value)})})});os.displayName="Textarea";const is={tension:300},W2=(t,n)=>G({width:t?20:0,opacity:t?1:0,immediate:n,config:is}),_2=(t,n,s)=>G({width:t?s?30:15:0,opacity:t?1:0,immediate:n,config:is}),H2=(t,n,s,o)=>G({width:t&&n?s.loading.width:s.original.width,height:s.original.height,immediate:o,config:is}),U2=(t,n,s)=>G({opacity:t&&n?0:1,transform:t&&n?"translateY(-30px)":"translateY(0px)",immediate:s,cancel:!n,config:is}),q2=(t,n)=>G({opacity:t?1:0,transform:t?"translateY(0px)":"translateY(30px)",immediate:n,config:is}),Q2=c.span`
  display: flex;

  svg {
    fill: currentColor;
  }
`,K2=c(W.span)`
  position: relative;

  overflow: hidden;
  transform-origin: center center;
`,nd=c(W.span)`
  position: absolute;
  left: 0;
  top: 0;

  opacity: 0;
  white-space: nowrap;
`,V2=c(nd)`
  transform: translateY(0px);
  opacity: 1;
`,G2=c(nd)``,Y2=c(W.span)`
  overflow: hidden;
  transform-origin: center right;

  align-self: center;
  width: 20px;
  height: 16px;

  svg {
    width: 16px;
    height: 16px;
  }
`,J2=c(W.span)`
  white-space: nowrap;
  overflow: hidden;
  transform-origin: center left;
`,Z2=Fi`
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`,bo=c.span`
  animation-name: ${Z2};
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
`,Z=({children:t,loadingText:n,loading:s,spinner:o,instant:i,xl:r,...a})=>{const l=me.useRef(null),d=me.useRef(null),[h,x]=m.useState({original:{width:void 0,height:void 0},loading:{width:void 0}});m.useEffect(()=>{if(!l.current)return;const v=l.current.offsetWidth,$=l.current.offsetHeight,C=d.current?.offsetWidth||v;x({original:{width:v,height:$},loading:{width:C}})},[l.current,t,n]);const g=W2(s,i),b=_2(s,i,r),y=U2(s,n,i),j=q2(s,i),w=H2(s,n,h,i);return e.jsxs(Q2,{...a,children:[o&&e.jsx(Y2,{style:g,children:e.jsx(Bi,{})}),e.jsxs(K2,{style:w,children:[!!n&&e.jsx(G2,{ref:d,style:j,children:n}),e.jsx(V2,{ref:l,style:y,children:t})]}),e.jsxs(J2,{style:b,children:[e.jsx(bo,{}),e.jsx(bo,{}),e.jsx(bo,{})]})]})},Vs={base:["ab-tests"],dashboard:()=>[...Vs.base,"dashboard"]},X2=()=>{const t=uh(),{data:n}=B({queryKey:Vs.dashboard(),queryFn:()=>N.get("/api/ab-tests/dashboard").then(o=>o.data)});return m.useMemo(()=>n?.map(o=>({...o,variants:o.variants.map(i=>({...i,formColor:i.formColor||t[i.formId]||null}))}))||[],[n,t])},ex=t=>{const n=X();return re({mutationFn:s=>{const o={...s};return t?N.post(`/api/ab-tests/${t}`,o).then(i=>i.data):N.post("/api/ab-tests",o).then(i=>i.data)},onSuccess:()=>{n.invalidateQueries({queryKey:Vs.base})}})},tx=()=>{const t=X();return re({mutationFn:n=>N.post(`/api/ab-tests/${n}/delete`).then(s=>s.data),onSuccess:()=>{t.invalidateQueries({queryKey:Vs.base})}})},nx=t=>({id:t?.id,name:t?.name||"",handle:t?.handle||"",description:t?.description||"",startDate:t?.startDate||null,endDate:t?.endDate||null,variants:t?.variants||[]}),sx=({closeModal:t,data:n})=>{const s=n?.test,[o,i]=m.useState(nx(s)),[r,a]=m.useState(!!s?.handle&&s.handle!==go(s.name)),{data:l}=Qs(),d=ex(s?.id),h=m.useMemo(()=>(l||[]).map(g=>({id:g.id,name:g.name})),[l]),x=o.name.trim().length>0&&o.handle?.trim().length>0&&o.variants.length>0&&o.variants.every(g=>!!g.formId);return e.jsxs($e,{style:{maxWidth:"860px"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:s?.id?u("Edit A/B Test"):u("Create A/B Test")})}),e.jsxs(Fc,{children:[e.jsx(It,{value:o.name,updateValue:g=>{i(b=>({...b,name:g,handle:r?b.handle:go(g)}))},property:{type:Y.String,handle:"name",label:u("Name")}}),e.jsx(It,{value:o.handle||"",updateValue:g=>{a(!0),i(b=>({...b,handle:go(g)}))},property:{type:Y.String,handle:"handle",label:u("Handle")}}),e.jsx(os,{value:o.description||"",updateValue:g=>i(b=>({...b,description:g})),property:{type:Y.Textarea,handle:"description",label:u("Description"),rows:3}}),e.jsxs(Gh,{children:[e.jsx(Ko,{value:o.startDate||null,updateValue:g=>i(b=>({...b,startDate:g})),property:{type:Y.DateTime,handle:"startDate",label:u("Start Date"),dateFormat:"yyyy-MM-dd"}}),e.jsx(Ko,{value:o.endDate||null,updateValue:g=>i(b=>({...b,endDate:g})),property:{type:Y.DateTime,handle:"endDate",label:u("End Date"),dateFormat:"yyyy-MM-dd"}})]}),e.jsx(_,{label:"Variants",children:e.jsxs("div",{children:[e.jsxs("table",{className:"table editable fullwidth",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Form")}),e.jsx("th",{children:u("Weight")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:o.variants.map((g,b)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(ce,{emptyOption:"Select form...",value:g.formId?.toString()||"",onChange:y=>{const j=Number(y);i(w=>({...w,variants:w.variants.map((v,$)=>$===b?{...v,formId:j}:v)}))},options:h.map(y=>({label:y.name,value:y.id.toString()}))})}),e.jsx("td",{className:"singleline-cell textual thin weight",children:e.jsx("input",{className:"text fullwidth",type:"number",min:0,value:g.weight,onChange:y=>{const j=Number(y.target.value);i(w=>({...w,variants:w.variants.map((v,$)=>$===b?{...v,weight:j}:v)}))}})}),e.jsx("td",{className:"thin action",children:e.jsx("button",{type:"button",title:u("Delete"),className:"delete icon",onClick:()=>i(y=>({...y,variants:y.variants.filter((j,w)=>w!==b)}))})})]},g.id||b))})]}),e.jsx("button",{type:"button",className:"btn dashed add icon",onClick:()=>i(g=>({...g,variants:[...g.variants,{id:V(),formId:void 0,weight:50}]})),children:u("Add Variant")})]})})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",disabled:!x,children:e.jsx(Z,{loading:d.isPending,loadingText:u("Saving..."),spinner:!0,onClick:()=>d.mutate(o,{onSuccess:()=>{Ye.success(u("A/B Test Group saved successfully.")),t()}}),children:u("Save")})})]})]})},ox=({data:t,closeModal:n})=>{const s=tx();return e.jsxs($e,{style:{maxWidth:"560px"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Delete A/B Test")})}),e.jsx(Fc,{style:{minHeight:0},children:e.jsx("p",{children:u('Are you sure you want to delete "{name}"? This action cannot be undone.',{name:t?.name||""})})}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(Z,{loading:s.isPending,loadingText:u("Deleting..."),spinner:!0,onClick:()=>s.mutate(t?.id,{onSuccess:()=>{Ye.success(u("A/B Test Group deleted successfully.")),n()}}),children:u("Delete")})})]})]})},ix=()=>{ts("ab-tests");const{openModal:t}=it(),[n]=Ti(),s=X2(),[o,i]=m.useState({}),r=m.useRef(null),a=m.useCallback(l=>{t(sx,l?{test:Fh(l)}:{})},[t]);return m.useEffect(()=>{const l=n.get("edit");if(!l||!s||r.current===l)return;const d=s.find(h=>h.id===Number(l));d&&(r.current=l,a(d))},[n,s,a]),e.jsxs(e.Fragment,{children:[e.jsx(Q,{id:"ab-tests-list",label:"A/B Tests",url:"/ab-tests"}),e.jsxs(zh,{children:[e.jsx(es,{children:u("A/B Tests")}),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:()=>a(),children:u("Add Test")})]}),e.jsxs(Eh,{children:[!s?.length&&e.jsx(Vh,{children:u("No A/B Tests found. Create your first test.")}),e.jsx(Nh,{children:s?.map(l=>{const d=o[l.id]||"conversionRate",h=l.startDate&&F1(l.startDate),x=l.endDate&&Ql(l.endDate);let g="active";h?g="scheduled":x&&(g="ended");const b=u(g.at(0)?.toUpperCase()+g.slice(1)||""),{totalImpressions:y,totalInteractions:j,totalFailures:w,totalConversions:v}=l,$=[e.jsx(Ah,{$status:g},"status"),u(b),!h&&u("{days} days",{days:l.days}),u("{count} variants",{count:l.variantCount}),u("{count} impressions",{count:y}),u("{count} interactions",{count:j}),u("{failures} failures",{failures:w}),u("{conversions} conversions",{conversions:v})].filter(Boolean);return e.jsxs(Mh,{children:[e.jsxs(Ih,{children:[e.jsxs("div",{children:[e.jsx("h2",{children:l.name}),!!l.description&&e.jsx("p",{children:l.description}),e.jsx(Rh,{children:$.map((C,E)=>e.jsx("span",{children:C},E))})]}),e.jsx(Sh,{onDelete:()=>t(ox,{id:l.id,name:l.name}),onEdit:()=>a(l)})]}),e.jsx(Jh,{test:l,activeTab:d,setTab:(C,E)=>{i(F=>({...F,[C.id]:E}))}}),e.jsx(Oh,{children:l.variants.map(C=>e.jsx(Yh,{variant:C,test:l},C.id))})]},l.id)})})]})]})},Ft={all:["rules"],form:t=>[...Ft.all,"forms",t],notifications:t=>[...Ft.form(t),"notifications"],integrations:t=>[...Ft.form(t),"integrations"]},rx=t=>{const n=X();return m.useCallback(()=>{t&&n.removeQueries({queryKey:Ft.form(t)})},[t,n])},kn=t=>{const n=_t();return B({queryKey:Ft.form(t),queryFn:()=>N.get(`/api/forms/${t}/rules`).then(s=>s.data).then(s=>(n(rn.set(s.fields)),n(Rn.set(s.pages)),n(An.set(s.submitForm)),n(on.set(s.buttons)),s)),staleTime:1/0,gcTime:1/0})},sd=t=>{const n=_t();return B({queryKey:Ft.notifications(t),queryFn:()=>N.get(`/api/forms/${t||0}/rules/notifications`).then(s=>s.data).then(s=>(n(In.set(s)),s)),staleTime:1/0,gcTime:1/0})},ax=t=>{const n=_t();return B({queryKey:Ft.integrations(t),queryFn:()=>N.get(`/api/forms/${t||0}/rules/integrations`).then(s=>s.data).then(s=>(n(Mn.set(s)),s)),staleTime:1/0,gcTime:1/0})},od=c.div`
  position: relative;

  display: flex;
  flex-direction: column;
  height: 100%;
`,id=c.div`
  flex-grow: 1;
  overflow: hidden;

  box-shadow:
    0 0 0 1px ${p.gray200},
    0 2px 12px rgb(205 216 228 / 50%);
  border-radius: ${k.lg};
`,He={base:["form-monitor"],tests:(t,n)=>[...He.base,"tests",t,n],stats:t=>[...He.base,"stats",t],testEmailHistory:t=>[...He.base,"test-email-history",t],testEmailStatus:t=>[...He.base,"test-email-status",t],mailerInfo:()=>[...He.base,"mailer-info"]},lx=(t,n={})=>{const{limit:s=100,offset:o=0}=n;return B({queryKey:He.tests(t,{limit:s,offset:o}),queryFn:()=>N.get(`/api/form-monitor/forms/${t}/tests`,{params:{limit:s,offset:o}}).then(i=>i.data),staleTime:0,refetchOnWindowFocus:!1,enabled:!!t})},rd=(t,n)=>B({queryKey:He.stats(t),queryFn:()=>N.get(`/api/form-monitor/forms/${t}/stats`).then(s=>s.data),enabled:n?.enabled??!!t}),cx=(t,n={})=>{const{limit:s=50,offset:o=0}=n;return B({queryKey:He.testEmailHistory({limit:s,offset:o}),queryFn:()=>N.get("/api/form-monitor/test-email/history",{params:{limit:s,offset:o}}).then(i=>i.data),staleTime:0,refetchOnWindowFocus:!1,enabled:!!t})},dx=(t,n)=>B({queryKey:He.testEmailStatus(t||""),queryFn:()=>N.get("/api/form-monitor/test-email/status",{params:{token:t}}).then(s=>s.data),enabled:(n?.enabled??!0)&&!!t,refetchInterval:n?.refetchInterval??!1}),ux=(t,n)=>re({mutationFn:()=>N.post("/api/form-monitor/test-email",{formId:t}).then(s=>s.data),onSuccess:s=>{n?.onSuccess?.(s)},onError:n?.onError}),ad=()=>B({queryKey:He.mailerInfo(),queryFn:()=>N.get("/api/form-monitor/mailer-info").then(t=>t.data),staleTime:300*1e3});c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};
  padding: ${f.xl};
  background: ${p.white};
  height: 100%;
  flex: 1;
`;const px=c.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
`,hx={sm:ne`
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
  `},xx={sm:ne`
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
  `},dt=c.div`
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 999px;
  ${({$size:t="sm"})=>hx[t]}
  background-color: ${({$status:t})=>{switch(t){case"success":case"active":return"rgba(34, 197, 94, 0.2)";case"failed":return"rgba(239, 68, 68, 0.2)";case"pending":return"rgba(55, 65, 81, 0.2)";case"inactive":return"rgba(107, 114, 128, 0.2)";default:return"rgba(156, 163, 175, 0.2)"}}};
  color: ${({$status:t})=>{switch(t){case"success":case"active":return p.green600;case"failed":return p.red600;case"pending":return p.gray700;case"inactive":return p.gray600;default:return p.gray600}}};
`,xn=c.span`
  display: inline-block;
  border-radius: 50%;
  background-color: currentColor;
  position: relative;
  ${({$size:t="sm"})=>xx[t]}

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
`,mx=c.div`
  color: ${p.red600};
  font-size: 14px;
  line-height: 1.5;
  padding: ${f.xl};
  background: ${p.white};
  width: 100%;
  height: 100%;
`,Pe=c.div`
  position: relative;

  flex-basis: 300px;
  flex-shrink: 0;
  width: 300px;
  padding: ${({$lean:t,$noPadding:n})=>t?f.sm:n?"0":f.lg};
  box-sizing: border-box;

  border-bottom-left-radius: ${k.lg};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
  background: ${p.gray050};

  overflow-y: auto;

  --background-color: ${p.gray050};
  --margins: -18px;
`,gx=(t,n)=>re({mutationFn:()=>N.put(`/api/form-monitor/forms/${t}/enable`),onMutate:()=>{n?.onLoading?.()},onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),fx=(t,n,s)=>re({mutationFn:()=>N.delete(`/api/form-monitor/forms/${t}/tests/${n}`),onSuccess:()=>{s?.onSuccess?.()},onError:()=>{s?.onError?.()}}),bx=(t,n)=>re({mutationFn:()=>N.delete(`/api/form-monitor/forms/${t}/tests/all`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),yx=(t,n)=>re({mutationFn:()=>N.put(`/api/form-monitor/forms/${t}/disable`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),jx=(t,n)=>re({mutationFn:()=>N.put(`/api/form-monitor/forms/${t}/disable-and-clear`),onSuccess:()=>{n?.onSuccess?.()},onError:()=>{n?.onError?.()}}),vx=t=>e.jsx(R,{height:"800",viewBox:"0 0 50 50",width:"800",...t,children:e.jsx("path",{d:"m46.4375-.03125c-.167969-.0078125-.339844.0078125-.5.03125-.671875.09375-1.25.421875-1.65625 1.03125l-.03125.0625-.03125.03125-8.5625 16.09375c-.964844-.359375-1.921875-.570312-2.8125-.59375-.960937-.023437-1.867187.125-2.6875.46875-1.582031.660156-2.777344 1.953125-3.5625 3.59375-.035156.050781-.066406.101563-.09375.15625-.003906.007813.003906.023438 0 .03125-.011719.019531-.023437.042969-.03125.0625-.011719.039063-.023437.082031-.03125.125-.542969 1.355469-1.167969 2.574219-1.875 3.65625-.007812.011719-.023437.019531-.03125.03125-.089844.078125-.164062.175781-.21875.28125-.003906.007813.003906.023438 0 .03125-.035156.050781-.066406.101563-.09375.15625-2.386719 3.417969-5.496094 5.476563-8.4375 6.75-4.007812 1.734375-7.84375 1.917969-8.6875 1.84375-.402344-.039062-.789062.164063-.980469.519531-.1875.355469-.148437.792969.105469 1.105469 11.394531 14.0625 28.15625 14.5625 28.15625 14.5625.199219.003906.394531-.050781.5625-.15625 0 0 2.070313-1.3125 4.5625-4.4375 1.871094-2.347656 4.003906-5.742187 5.84375-10.4375l.03125-.03125c.230469-.214844.347656-.527344.3125-.84375 0-.011719 0-.019531 0-.03125.484375-1.308594.953125-2.683594 1.375-4.1875.015625-.0625.027344-.125.03125-.1875 0-.011719 0-.019531 0-.03125 1.332031-3.4375-.152344-7.222656-3.34375-8.875l6.1875-17.15625v-.03125l.03125-.03125c.203125-.710937-.03125-1.394531-.40625-1.9375-.355469-.511719-.875-.914062-1.5-1.1875v-.03125c-.019531-.007812-.042969.007813-.0625 0-.011719-.003906-.019531-.027344-.03125-.03125-.488281-.230469-1.023437-.3867188-1.53125-.40625zm-.125 2.09375c.226563-.035156.523438-.035156.84375.125l.03125.03125h.03125c.324219.128906.59375.347656.71875.53125s.089844.292969.09375.28125l-6.09375 16.90625c-.734375-.332031-1.242187-.566406-2.28125-1.03125-.773437-.347656-1.507812-.683594-2.15625-.96875l8.4375-15.78125c-.007812.007813.148438-.058594.375-.09375zm-42.3125 5.9375c-2.199219 0-4 1.800781-4 4s1.800781 4 4 4 4-1.800781 4-4-1.800781-4-4-4zm0 2c1.117188 0 2 .882813 2 2 0 1.117188-.882812 2-2 2-1.117187 0-2-.882812-2-2 0-1.117187.882813-2 2-2zm9 1c-1.105469 0-2 .894531-2 2s.894531 2 2 2 2-.894531 2-2-.894531-2-2-2zm-1.5 7c-3.027344 0-5.5 2.472656-5.5 5.5s2.472656 5.5 5.5 5.5 5.5-2.472656 5.5-5.5-2.472656-5.5-5.5-5.5zm21.3125.625c.695313.019531 1.457031.160156 2.3125.5.019531.011719.042969.023438.0625.03125.226563.355469.652344.53125 1.0625.4375.113281.046875.101563.042969.21875.09375.675781.292969 1.527344.652344 2.375 1.03125 1.242188.554688 2.027344.894531 2.75 1.21875.019531.023438.039063.042969.0625.0625.214844.296875.574219.453125.9375.40625h.03125c2.390625 1.09375 3.445313 3.699219 2.625 6.21875-.394531-.011719-.695312.007813-1.4375-.15625-.554687-.121094-1.09375-.316406-1.5-.5625s-.640625-.488281-.75-.8125c-.085937-.28125-.292969-.507812-.566406-.621094-.269531-.117187-.578125-.105468-.839844.027344-.335937.167969-1.183594.105469-1.9375-.28125-.375-.191406-.710937-.460937-.9375-.6875-.226562-.226562-.289062-.441406-.28125-.40625-.054687-.292969-.234375-.546875-.496094-.691406-.257812-.144531-.570312-.164063-.847656-.058594-.027344.011719-.359375.042969-.75-.03125s-.84375-.234375-1.28125-.4375-.839844-.449219-1.09375-.65625-.277344-.421875-.25-.15625c-.066406-.527344-.53125-.914062-1.0625-.875-1.003906.09375-1.945312-.644531-2.5-1.125.585938-.988281 1.3125-1.777344 2.21875-2.15625.554688-.230469 1.179688-.332031 1.875-.3125zm-21.3125 1.375c1.945313 0 3.5 1.554688 3.5 3.5 0 1.945313-1.554687 3.5-3.5 3.5-1.945312 0-3.5-1.554687-3.5-3.5 0-1.945312 1.554688-3.5 3.5-3.5zm16.3125 2.96875c.695313.5 1.660156 1.019531 2.8125 1.125.183594.269531.382813.488281.625.6875.433594.359375.96875.675781 1.53125.9375s1.152344.480469 1.75.59375c.308594.058594.625-.058594.9375-.0625.148438.226563.214844.527344.40625.71875.40625.40625.890625.75 1.4375 1.03125.8125.417969 1.789063.5625 2.75.4375.328125.492188.722656.90625 1.1875 1.1875.683594.410156 1.429688.660156 2.125.8125.488281.105469.933594.152344 1.34375.1875-.277344.898438-.578125 1.742188-.875 2.5625-.359375-.011719-.800781-.03125-1.28125-.125-1.09375-.210937-2.128906-.695312-2.5625-1.53125-.234375-.4375-.753906-.636719-1.21875-.46875-.496094.175781-1.394531.101563-2.15625-.25-.761719-.351562-1.339844-.960937-1.46875-1.40625-.082031-.269531-.277344-.492187-.535156-.609375-.253906-.121094-.546875-.125-.808594-.015625-.242187.101563-1.1875.074219-1.96875-.28125s-1.285156-.953125-1.34375-1.28125c-.050781-.277344-.214844-.515625-.453125-.664062-.238281-.148438-.527344-.191407-.796875-.117188-.945312.253906-1.683594-.082031-2.28125-.53125-.207031-.152344-.359375-.320312-.5-.46875.484375-.769531.933594-1.585937 1.34375-2.46875zm-2.5 4.125c.148438.136719.289063.269531.46875.40625.738281.554688 1.875.949219 3.15625.875.464844.871094 1.21875 1.539063 2.09375 1.9375.863281.394531 1.785156.519531 2.6875.40625.5.816406 1.195313 1.507813 2.0625 1.90625.925781.425781 1.964844.535156 2.96875.375.933594 1.167969 2.261719 1.804688 3.4375 2.03125.3125.058594.621094.097656.90625.125-1.664062 4.019531-3.527344 6.960938-5.15625 9-2.085937 2.613281-3.496094 3.601563-3.8125 3.8125-.355469-.015625-2.960937-.199219-6.625-1.21875.300781-.195312.625-.398437.96875-.65625 1.667969-1.25 3.851563-3.289062 5.96875-6.4375.222656-.324219.238281-.746094.035156-1.082031-.203125-.339844-.582031-.527344-.972656-.480469-.292969.03125-.554687.191406-.71875.4375-1.984375 2.953125-4.027344 4.84375-5.53125 5.96875-1.429687 1.070313-2.257812 1.402344-2.34375 1.4375-2.25-.792969-4.742187-1.878906-7.28125-3.40625.367188-.121094.757813-.28125 1.1875-.46875 1.898438-.828125 4.4375-2.375 7.03125-5.28125.3125-.3125.382813-.792969.175781-1.179687-.210937-.390625-.648437-.597657-1.082031-.507813-.230469.039063-.441406.164063-.59375.34375-2.40625 2.691406-4.660156 4.058594-6.3125 4.78125s-2.59375.78125-2.59375.78125c-.042969.007813-.085937.019531-.125.03125-2.074219-1.460937-4.144531-3.238281-6.09375-5.375 1.902344-.148437 4.351563-.535156 7.375-1.84375 2.984375-1.292969 6.167969-3.402344 8.71875-6.71875z"})}),wx=t=>e.jsx(R,{width:"48",height:"48",viewBox:"0 0 24 24",...t,children:e.jsxs("g",{children:[e.jsx("circle",{cx:"12",cy:"2.5",r:"1.5",fill:"gray",opacity:".14"}),e.jsx("circle",{cx:"16.75",cy:"3.77",r:"1.5",fill:"gray",opacity:".29"}),e.jsx("circle",{cx:"20.23",cy:"7.25",r:"1.5",fill:"gray",opacity:".43"}),e.jsx("circle",{cx:"21.5",cy:"12",r:"1.5",fill:"gray",opacity:".57"}),e.jsx("circle",{cx:"20.23",cy:"16.75",r:"1.5",fill:"gray",opacity:".71"}),e.jsx("circle",{cx:"16.75",cy:"20.23",r:"1.5",fill:"gray",opacity:".86"}),e.jsx("circle",{cx:"12",cy:"21.5",r:"1.5",fill:"gray"}),e.jsx("animateTransform",{attributeName:"transform",calcMode:"discrete",dur:"0.75s",repeatCount:"indefinite",type:"rotate",values:"0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"})]})}),$x=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{fill:"#0f0f0f",children:[e.jsx("path",{d:"m6 12c0 .5523.44772 1 1 1h10c.5523 0 1-.4477 1-1s-.4477-1-1-1h-10c-.55228 0-1 .4477-1 1z"}),e.jsx("path",{clipRule:"evenodd",d:"m12 23c6.0751 0 11-4.9249 11-11 0-6.07513-4.9249-11-11-11-6.07513 0-11 4.92487-11 11 0 6.0751 4.92487 11 11 11zm0-2.0068c-4.96679 0-8.99317-4.0264-8.99317-8.9932 0-4.96679 4.02638-8.99317 8.99317-8.99317 4.9668 0 8.9932 4.02638 8.9932 8.99317 0 4.9668-4.0264 8.9932-8.9932 8.9932z",fillRule:"evenodd"})]})}),Cx=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{fill:"#1c274c",children:[e.jsx("path",{d:"m9.87787 4.24993c.30923-.8749 1.14363-1.49993 2.12213-1.49993s1.813.62503 2.1222 1.49993c.138.39054.5665.59524.9571.4572.3905-.13804.5952-.56653.4572-.95706-.5145-1.45548-1.9025-2.50007-3.5365-2.50007-1.6339 0-3.02196 1.04459-3.53639 2.50007-.13804.39053.06665.81902.45719.95706s.81903-.06666.95707-.4572z"}),e.jsx("path",{d:"m2.75 6c0-.41421.33579-.75.75-.75h17.0001c.4142 0 .75.33579.75.75s-.3358.75-.75.75h-17.0001c-.41421 0-.75-.33579-.75-.75z"}),e.jsx("path",{d:"m5.11686 7.75166c.41329-.02755.77067.28515.79822.69845l.45995 6.89909c.08985 1.3479.15388 2.2857.29445 2.9913.13635.6845.32668 1.0468.60009 1.3026.27342.2557.64758.4216 1.33958.5121.7134.0933 1.65345.0948 3.00425.0948h.7734c1.3508 0 2.2908-.0015 3.0042-.0948.692-.0905 1.0662-.2564 1.3396-.5121.2734-.2558.4637-.6181.6001-1.3026.1405-.7056.2046-1.6434.2944-2.9913l.46-6.89909c.0275-.4133.3849-.726.7982-.69845s.726.38493.6985.79823l-.4635 6.95171c-.0855 1.2828-.1546 2.3189-.3165 3.132-.1684.8453-.4548 1.5514-1.0464 2.1048-.5916.5535-1.3152.7923-2.1698.9041-.8221.1075-1.8605.1075-3.1461.1075h-.8788c-1.2856 0-2.32407 0-3.14611-.1075-.85465-.1118-1.5782-.3506-2.16979-.9041-.5916-.5534-.87802-1.2595-1.04642-2.1048-.16197-.8131-.23103-1.8492-.31652-3.132l-.46345-6.95171c-.02756-.4133.28515-.77068.69845-.79823z"})]})}),rs=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};

  padding: ${f.md} ${f.xl};
`,kx=({formId:t,onClose:n,onSuccess:s})=>{const o=yx(t,{onSuccess:()=>{s(),n()}}),i=()=>{o.mutate()};return e.jsx(bt,{closeModal:n,children:e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Disable Monitoring")})}),e.jsx(rs,{children:e.jsx("div",{children:u("Are you sure you want to disable monitoring for this form?")})}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",onClick:i,disabled:o.isPending,children:u("Disable")})]})]})})},Sx=({formId:t,onClose:n,onSuccess:s})=>{const o=te(),i=X(),[r,a]=m.useState(!1),[l,d]=m.useState(""),h=jx(t,{onSuccess:()=>{i.invalidateQueries({queryKey:He.base}),i.invalidateQueries({queryKey:ge.single(t)}),s(),n(),o(`/forms/${t}`,{replace:!0})}}),x=()=>{r&&h.mutate()},g=b=>{d(b.target.value)};return m.useEffect(()=>{a(l.toUpperCase()==="CONFIRM")},[l]),e.jsx(bt,{closeModal:n,children:e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Disable & Delete Monitoring Data")})}),e.jsxs(rs,{children:[e.jsx("div",{children:u("Are you sure you want to disable monitoring and delete all monitoring data for this form?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:l,autoComplete:"off",onChange:g,className:"text fullwidth"})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:`btn submit ${r?"":"disabled"}`,onClick:x,disabled:h.isPending||!r,children:u("Disable & Delete")})]})]})})},ld=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
  padding: ${f.md};
  width: 100%;
`,Lx=c.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`,Fx=c.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`,Tx=c(ld)`
  padding: ${f.xl};
  background: ${p.white};
`,Ex=c.div`
  margin-bottom: ${f.xl};
`,ia=c.div`
  display: grid;
  grid-template-columns: 100px 150px 120px 1fr 120px;
  gap: ${f.md};
`,zx=()=>e.jsx(Ht,{baseColor:p.gray100,highlightColor:p.gray200,children:e.jsxs(ld,{children:[e.jsx(L,{width:100,height:20}),e.jsx(L,{width:120,height:16}),[...Array(3)].map((t,n)=>e.jsxs(Lx,{children:[e.jsxs(Fx,{children:[e.jsx(L,{width:80,height:14}),e.jsx(L,{width:60,height:14})]}),e.jsx(L,{width:"100%",height:8})]},n))]})}),Nx=()=>e.jsx(Ht,{baseColor:p.gray100,highlightColor:p.gray200,children:e.jsxs(Tx,{children:[e.jsxs(Ex,{children:[e.jsx(L,{height:24,width:300}),e.jsx(L,{height:100})]}),e.jsxs(ia,{children:[e.jsx(L,{height:24}),e.jsx(L,{height:24}),e.jsx(L,{height:24}),e.jsx(L,{height:24}),e.jsx(L,{height:24})]}),[...Array(10)].map((t,n)=>e.jsxs(ia,{children:[e.jsx(L,{height:40}),e.jsx(L,{height:40}),e.jsx(L,{height:40}),e.jsx(L,{height:40}),e.jsx(L,{height:40,width:100})]},n))]})}),cd=({formId:t,testId:n,onClose:s,onSuccess:o})=>{const[i,r]=m.useState(!1),[a,l]=m.useState(""),d=n===0,h=fx(t,n,{onSuccess:()=>{o?.(),s()}}),x=bx(t,{onSuccess:()=>{o?.(),s()}}),g=j=>{l(j.target.value)},b=()=>{d&&!i||(d?x.mutate():h.mutate())};m.useEffect(()=>{r(d?a.toUpperCase()==="DELETE":!0)},[a,d]);const y=h.isPending||x.isPending;return e.jsx(bt,{closeModal:s,children:e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u(d?"Clear All Test History":"Delete Test")})}),e.jsxs(rs,{children:[e.jsx("div",{children:u(d?"Are you sure you want to clear all test history? This action cannot be undone.":"Are you sure you want to permanently delete this test? This action cannot be undone.")}),d&&e.jsxs(e.Fragment,{children:[e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To clear all test history, please type <strong>DELETE</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:a,autoComplete:"off",onChange:g,className:"text fullwidth"})]})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:s,children:u("Cancel")}),e.jsx("button",{type:"button",className:T("btn submit",!i&&"disabled"),onClick:b,disabled:y||!i,children:e.jsx(Z,{loadingText:u(d?"Clearing...":"Deleting..."),loading:y,spinner:!0,children:u(d?"Clear All":"Delete")})})]})]})})},Mx=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xl};

  h3 {
    font-size: 1.1em;
    margin-bottom: 0.3em;
  }
`;c.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${f.md};
`;const Ix=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
`,Rx=c.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${f.md};
  padding-bottom: ${f.md};
  border-bottom: 1px solid ${p.gray200};

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
      gap: ${f.sm};
      margin-bottom: 12px;
    }

    &.status-success {
      color: ${p.green600};
    }

    &.status-failed {
      color: ${p.red600};
    }

    &.status-pending {
      color: ${p.gray700};
    }

    small {
      display: flex;
      align-items: center;
      gap: 4px;
      color: ${p.gray500};
      font-size: 12px;
      font-weight: 300;
      margin-top: 4px;

      .status-text {
        font-weight: 600;
        font-size: 12px;

        &.status-success {
          color: ${p.green600};
        }

        &.status-failed {
          color: ${p.red600};
        }

        &.status-pending {
          color: ${p.gray700};
        }
      }
    }
  }
`,Ax=c.div`
  padding: 0 ${f.md};
  h3 {
    margin: 0 0 ${f.md};
  }
`,Dx=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
`,yo=c.div`
  display: flex;
  flex-direction: ${({$isColumn:t})=>t?"column":"row"};
  justify-content: ${({$isColumn:t})=>t?"flex-start":"space-between"};
  gap: ${({$isColumn:t})=>t?f.xs:"0"};
  margin-bottom: ${f.sm};

  &:last-child {
    margin-bottom: 0;
  }
`,Px=c.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${f.xs};
`,Bx=c.button`
  padding: 3px 8px;
  background-color: ${p.gray700};
  margin-top: ${f.xs};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`,Ox=c.div`
  color: ${({$error:t})=>t?p.red600:"inherit"};
  font-style: italic;
  font-size: 0.9em;
  text-align: right;
`,jo=c.div`
  color: ${p.gray600};
  font-size: 13px;
  font-weight: 500;
`;c.div`
  display: flex;
  align-items: center;
  gap: ${f.xs};
  font-size: 13px;
`;const Wx=c.code`
  display: block;
  padding: ${f.xs};
  background: ${p.gray100};
  border-radius: 3px;
  font-size: 12px;
  word-break: break-all;
  color: ${p.gray700};
`,_x=c.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${f.md};
  padding-bottom: ${f.xl};
  border-bottom: 1px solid ${p.gray200};

  h3 {
    margin-bottom: ${f.sm};
    font-size: 1.1em;
    font-weight: 600;
    color: ${p.gray700};
  }

  .next-test-time {
    font-size: 14px;
    color: ${p.gray600};
  }
`,Hx=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
  margin-top: ${f.lg};
  position: relative;
`,Ux=c.button`
  height: var(--ui-control-height);
  width: var(--ui-control-height);
  border: 1px solid ${p.gray250};
  border-radius: ${k.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p.gray700};
  padding: 0;

  svg {
    width: 16px;
    height: 16px;
    stroke: ${p.gray500};
  }

  &:hover {
    background: rgba(96, 125, 159, 0.3);
  }
`,qx=c.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid ${p.gray200};
  border-radius: ${k.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  z-index: 100;
  margin-top: ${f.sm};
`,Vo=c.button`
  display: flex;
  align-items: center;
  gap: ${f.sm};
  width: 100%;
  padding: ${f.sm} ${f.md};
  border: none;
  background: none;
  cursor: pointer;
  color: ${p.gray700};
  font-size: 12px;
  text-align: left;

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }

  &:hover {
    background: ${p.gray050};
  }
`,Qx=c(Vo)`
  border-top: 1px solid ${p.gray200};
  color: ${p.red600};

  svg {
    stroke: ${p.red600};
  }

  &:hover {
    background: ${p.red050};
  }
`,Kx=t=>t==="pending"?"Processing":t.charAt(0).toUpperCase()+t.slice(1),Vx=({configuration:t,refetchData:n,hasTests:s,isError:o})=>{const[i,r]=me.useState(null),[a,l]=me.useState(!1),[d,h]=me.useState(!1),[x,g]=me.useState(!1),[b,y]=me.useState(!1),j=me.useRef(null);me.useEffect(()=>{const C=E=>{j.current&&!j.current.contains(E.target)&&y(!1)};return document.addEventListener("mousedown",C),()=>{document.removeEventListener("mousedown",C)}},[]);const w=gx(t.formId,{onLoading:()=>{r("loading")},onSuccess:()=>{r("success"),setTimeout(()=>{r(null),n()},2e3)},onError:()=>{r("error"),setTimeout(()=>{r(null)},2e3)}}),v=()=>{w.mutate()},$=()=>i==="loading"?u("Reactivating service..."):i==="error"?u("Reactivation unsuccessful."):i==="success"?u("Service reactivated!"):null;return e.jsxs(Ax,{children:[e.jsx("h3",{children:u("Configuration")}),e.jsxs(Dx,{children:[!o&&e.jsxs(yo,{children:[e.jsx(jo,{children:u("Integration Status")}),e.jsxs(dt,{$size:"sm",$status:t.integrationStatus==="enabled"?"success":"disabled",children:[e.jsx(xn,{$size:"md"}),u(t.integrationStatus==="enabled"?"ENABLED":"DISABLED")]})]}),e.jsxs(yo,{children:[e.jsx(jo,{children:u("Service Status")}),e.jsxs(Px,{children:[e.jsxs(dt,{$size:"sm",$status:t.serviceStatus==="active"?"active":t.serviceStatus==="inactive"?"inactive":"disabled",children:[e.jsx(xn,{$size:"md"}),u(o?"Error":t.serviceStatus==="active"?"ACTIVE":t.serviceStatus==="inactive"?"INACTIVE":"DISABLED")]}),t.serviceStatus==="inactive"&&t.integrationStatus==="enabled"&&(i?e.jsx(Ox,{$error:i==="error",children:$()}):e.jsx(Bx,{onClick:v,disabled:w.isPending,children:u("Reactivate")}))]})]}),t?.monitoredUrl&&e.jsxs(yo,{$isColumn:!0,children:[e.jsx(jo,{children:u("Monitored URL")}),e.jsx(Wx,{children:t.monitoredUrl})]}),e.jsxs(Hx,{ref:j,children:[!o&&e.jsx(Ux,{onClick:()=>y(!b),"aria-expanded":b,"aria-controls":"action-menu",title:u("Actions"),children:e.jsx($c,{})}),b&&e.jsxs(qx,{id:"action-menu",children:[s&&e.jsxs(Vo,{onClick:()=>{y(!1),l(!0)},children:[e.jsx(vx,{}),u("Clear All Test History")]}),t.serviceStatus!=="inactive"&&e.jsxs(Vo,{onClick:()=>{y(!1),h(!0)},children:[e.jsx($x,{}),u("Disable Monitoring")]}),e.jsxs(Qx,{onClick:()=>{y(!1),g(!0)},children:[e.jsx(Cx,{}),u("Disable & Delete Monitoring Data")]})]})]})]}),a&&e.jsx(cd,{formId:t.formId,testId:0,onClose:()=>l(!1),onSuccess:()=>{l(!1),n()}}),d&&e.jsx(kx,{formId:t.formId,onClose:()=>h(!1),onSuccess:()=>{h(!1),n()}}),x&&e.jsx(Sx,{formId:t.formId,onClose:()=>g(!1),onSuccess:()=>{g(!1),n()}})]})},ra=({lastTest:t})=>{const n=t?.totalStatus;return n?e.jsxs(Rx,{children:[e.jsx("h3",{children:u("Most Recent Test")}),e.jsxs(Ix,{children:[t?.dateAttempted,e.jsx("div",{className:`status-${n}`,children:e.jsx("div",{className:"status-main",children:e.jsxs(dt,{$status:n,$size:"xl",children:[e.jsx(xn,{$size:"xl",$status:n,children:n==="pending"&&e.jsx(wx,{})}),u(Kx(n))]})})})]})]}):null},Gx=({nextMonitoringTime:t,nextMonitoringTimeIn:n})=>n?e.jsxs(_x,{children:[e.jsx("h3",{children:u("Next Scheduled Test")}),e.jsxs("div",{className:"next-test-time",children:[t," ",e.jsx("br",{})," (in ",n?.humanReadable,")"]})]}):null,Yx=({formTestsQuery:t})=>{const{data:n,isLoading:s,refetch:o}=t;if(s)return e.jsx(Pe,{children:e.jsx(zx,{})});const i={integrationStatus:n?.enabled?"enabled":"disabled",serviceStatus:n?.fmFormStats?.enabled?"active":"inactive",monitoredUrl:n?.url||"",formId:n?.formId},r=n?.stats?.total>0,a=!!t.data?.error?.message;return e.jsx(Pe,{children:e.jsxs(Mx,{children:[r?e.jsxs(e.Fragment,{children:[e.jsx(ra,{lastTest:n?.lastSubmission}),n?.lastSubmission?.status!=="pending"&&e.jsx(Gx,{nextMonitoringTime:n?.fmFormStats?.nextMonitoringTime,nextMonitoringTimeIn:n?.fmFormStats?.nextMonitoringTimeIn})]}):e.jsx(ra,{}),e.jsx(Vx,{configuration:i,refetchData:o,hasTests:r,isError:a})]})})},Jx=()=>{const{formId:t}=K(),[n]=Ti(),s=100,o=Number(n.get("page"))||1,i=o>0?(o-1)*s:0,r=lx(Number(t),{limit:s,offset:i});return e.jsxs(px,{children:[e.jsx(Yx,{formTestsQuery:r}),e.jsx(mt,{context:{formTestsQuery:r}})]})};function jt(t){const[n,s]=m.useState(!1),o=()=>s(!0),i=()=>s(!1);return m.useEffect(()=>{const r=t.current;if(r)return r.addEventListener("mouseenter",o),r.addEventListener("mouseleave",i),()=>{r.removeEventListener("mouseenter",o),r.removeEventListener("mouseleave",i)}},[t]),n}const Zx=({active:t,hovering:n})=>G({opacity:t?1:0,background:n?p.error:"transparent",fill:n?"#fff":p.gray300,color:n?"#fff":p.gray300,scale:n?1.2:1,rotate:t?0:30,config:s=>{switch(s){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),dd=c(W.button)`
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
`,Sn=({active:t,onClick:n,...s})=>{const o=m.useRef(null),i=jt(o),a={...Zx({active:t,hovering:i}),...s?.style};return delete s.style,e.jsx(dd,{type:"button",ref:o,style:a,onClick:n,...s,children:e.jsx(Cc,{})})},Xx={dark:ne`
    background: ${p.gray800};
    border: 1px solid ${p.gray800};
    box-shadow: 0 10px 24px rgb(8 15 24 / 18%);
    color: ${p.white};
  `,light:ne`
    background: ${p.white};
    border: 1px solid ${p.gray100};
    box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
    color: ${p.gray800};
  `},em=c.span`
  display: inline-flex;
`,tm=c.div`
  max-width: min(320px, calc(100vw - ${f.xl}));
  padding: ${f.xs} ${f.sm};

  border-radius: ${k.sm};

  font-size: 12px;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;

  ${({$theme:t})=>Xx[t]}
`,nm=t=>typeof t=="number"?{open:t,close:t}:Array.isArray(t)?{open:t[0],close:t[1]}:{},sm=({arrowEnabled:t,arrowRef:n,context:s,content:o,floatingStyles:i,getFloatingProps:r,refs:a,theme:l})=>e.jsx(r1,{children:e.jsxs(tm,{ref:a.setFloating,...r(),$theme:l,style:i,children:[o,t&&e.jsx(a1,{ref:n,context:s,fill:l==="light"?"#ffffff":"#2f3c4c",stroke:l==="light"?"#d3dae2":"#2f3c4c",strokeWidth:1})]})}),om=({arrow:t=!1,children:n,delay:s,distance:o=8,followCursor:i=!1,hideOnClick:r=!0,html:a,interactive:l=!1,position:d="top",style:h,theme:x="dark",title:g,trigger:b})=>{const[y,j]=m.useState(!1),w=m.useRef(null),v=a??g,$=m.useMemo(()=>{const En=[n1(o),s1(),o1({padding:8})];return t&&En.push(Qp({element:w})),En},[t,o]),C=Kp({middleware:$,onOpenChange:j,open:y,placement:d,whileElementsMounted:i1}),{refs:E,floatingStyles:F,context:z}=C,M=Vp(z,{delay:nm(s),enabled:b==="mouseenter",handleClose:l?Gp():void 0,move:!i}),S=Yp(z,{enabled:b==="mouseenter"}),D=Jp(z,{enabled:b==="click",event:"mousedown",toggle:!0}),P=Zp(z,{outsidePressEvent:"mousedown",referencePress:b==="click"&&r}),ae=Xp(z,{role:b==="click"?"dialog":"tooltip"}),ue=e1(z,{enabled:i}),{getFloatingProps:wt,getReferenceProps:tn}=t1([M,S,D,P,ae,ue]);return v?e.jsxs(e.Fragment,{children:[e.jsx(em,{ref:E.setReference,...tn(),style:h,children:n}),y&&e.jsx(sm,{arrowEnabled:t,arrowRef:w,context:z,content:v,floatingStyles:F,getFloatingProps:wt,refs:E,theme:x})]}):e.jsx(e.Fragment,{children:n})},he=t=>e.jsx(om,{...t,trigger:t.trigger??"mouseenter"}),rt=t=>e.jsx(R,{width:"14",height:"14",viewBox:"0 0 14 14",...t,children:e.jsx("path",{d:"M3 3L11 11M11 3L3 11",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round"})}),Qn=t=>e.jsx(R,{viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M24 0C10.7 0 0 10.7 0 24S10.7 48 24 48l8 0 0 19c0 40.3 16 79 44.5 107.5L158.1 256 76.5 337.5C48 366 32 404.7 32 445l0 19-8 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-19c0-40.3-16-79-44.5-107.5L225.9 256l81.5-81.5C336 146 352 107.3 352 67l0-19 8 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 0zM192 289.9l81.5 81.5C293 391 304 417.4 304 445l0 19L80 464l0-19c0-27.6 11-54 30.5-73.5L192 289.9zm0-67.9l-81.5-81.5C91 121 80 94.6 80 67l0-19 224 0 0 19c0 27.6-11 54-30.5 73.5L192 222.1z"})}),im=t=>e.jsx(R,{fill:"none",height:"800",viewBox:"0 0 24 24",width:"800",...t,children:e.jsxs("g",{stroke:"currentColor",strokeWidth:"1.5",children:[e.jsx("circle",{cx:"12",cy:"13",r:"3"}),e.jsx("path",{d:"m9.77778 21h4.44442c3.1211 0 4.6816 0 5.8026-.7354.4852-.3184.9019-.7275 1.2262-1.2039.749-1.1006.749-2.6328.749-5.6971 0-3.0642 0-4.59639-.749-5.697-.3243-.47646-.741-.88556-1.2262-1.20392-.7204-.47255-1.6221-.64145-3.0028-.70182-.6589 0-1.2261-.49018-1.3553-1.1245-.1939-.95147-1.0448-1.63636-2.033-1.63636h-3.2674c-.98825 0-1.83915.68489-2.03297 1.63636-.12921.63432-.69648 1.1245-1.35533 1.1245-1.38067.06037-2.28245.22927-3.00276.70182-.48529.31836-.90196.72746-1.22622 1.20392-.74902 1.10061-.74902 2.6328-.74902 5.697 0 3.0643 0 4.5965.74902 5.6971.32426.4764.74093.8855 1.22622 1.2039 1.121.7354 2.68151.7354 5.80254.7354z"}),e.jsx("path",{d:"m19 10h-1",strokeLinecap:"round"})]})}),rm=c.div`
  display: flex;
  gap: ${f.lg};
  margin-bottom: ${f.lg};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`,aa=c.div`
  flex: 1;
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`,la=c.h3`
  margin: 0 0 ${f.md} 0;
  color: ${p.gray700};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`,ca=c.div`
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: ${p.gray050};
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-grow: 1;
  min-height: 300px;
  max-height: 60vh;
  width: 100%;
  border: 1px solid ${p.gray200};
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`,am=c.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
`,lm=c.div`
  position: absolute;
  top: ${f.sm};
  right: ${f.sm};
  display: flex;
  flex-direction: column;
  gap: ${f.sm};
  background: rgba(255, 255, 255, 0.95);
  padding: ${f.xs};
  border-radius: 6px;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .rzpp-mini-map {
    border-radius: 4px;
  }
`,cm=c.div`
  display: flex;
  gap: ${f.xs};
`,vo=c.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${p.gray300};
  background: ${p.white};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: ${p.gray100};
    border-color: ${p.gray400};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;c.div`
  position: absolute;
  bottom: ${f.sm};
  left: ${f.sm};
  background: rgba(0, 0, 0, 0.7);
  color: ${p.white};
  padding: ${f.xs} ${f.sm};
  border-radius: 4px;
  font-size: 12px;
  backdrop-filter: blur(4px);
  z-index: 10;
`;const dm=c.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${p.gray500};
  font-style: italic;
`,wo=c.div`
  display: flex;
  gap: ${f.lg};
  margin-bottom: ${f.lg};
  width: 100%;
`,um=({data:t,closeModal:n})=>{if(!t)return null;const{screenshot:s,beforeSubmitScreenshot:o,testId:i}=t,r=!!s,a=!!o,l=r&&a,d=(x,g)=>e.jsxs(aa,{children:[l&&e.jsx(la,{children:g}),e.jsx(ca,{children:e.jsx(l1,{initialScale:1,minScale:.5,maxScale:3,wheel:{step:.1},pinch:{step:5},doubleClick:{step:.5},children:({zoomIn:b,zoomOut:y,resetTransform:j,instance:w})=>e.jsxs(e.Fragment,{children:[e.jsx(c1,{wrapperStyle:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},contentStyle:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"},children:e.jsx(am,{src:x,alt:g,loading:"lazy",draggable:!1})}),e.jsxs(lm,{children:[e.jsxs(cm,{children:[e.jsx(vo,{onClick:()=>y(),disabled:w.transformState.scale<=.5,title:u("Zoom Out"),children:"−"}),e.jsx(vo,{onClick:()=>j(),title:u("Reset Zoom"),children:"↺"}),e.jsx(vo,{onClick:()=>b(),disabled:w.transformState.scale>=3,title:u("Zoom In"),children:"+"})]}),e.jsx(d1,{width:104,height:108,borderColor:"rgba(255, 255, 255, 0.8)",children:e.jsx("img",{src:x,alt:"Minimap"})})]})]})})})]}),h=x=>e.jsxs(aa,{children:[e.jsx(la,{children:x}),e.jsx(ca,{children:e.jsx(dm,{children:u("No screenshot available")})})]});return e.jsxs($e,{style:{maxWidth:"90vw",width:"1200px"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Screenshots for Test",{testId:i})})}),e.jsx("div",{style:{padding:`${f.lg} ${f.xl}`},children:l?e.jsxs(rm,{children:[d(o,u("Before Submit")),d(s,u("After Submit"))]}):a?e.jsx(wo,{children:d(o,"")}):r?e.jsx(wo,{children:d(s,"")}):e.jsx(wo,{children:h(u("Screenshots"))})}),e.jsx(ke,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Close")})})]})},pm=t=>{const{openModal:n}=it();return()=>{n(um,t)}},$o=c.div`
  flex: 1;
  background: ${p.white};
  padding: ${f.xl};
  overflow-y: auto;
  width: calc(100% - 300px);
  ${q};

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
`,da=c.div`
  color: ${p.gray700};

  p {
    color: ${p.gray600};
    font-size: 0.9em;
  }
`,hm=c.div`
  padding: ${f.sm};
`,xm=c.div`
  background: ${p.white};
  border-radius: 4px;
`,ua=c.p`
  color: ${p.gray600};
  font-size: 0.9em;
  margin-bottom: ${f.md};
  margin-top: 0;
`,mm=c.div`
  display: flex;
  flex-direction: column;
  padding: ${f.sm};
`,gm=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};
  margin-bottom: ${f.lg};
`,fm=c.div`
  display: flex;
  align-items: center;
  gap: ${f.md};
  margin-top: ${f.xl};
  padding-top: ${f.lg};
  border-top: 1px solid ${p.gray200};
`,bm=c.nav`
  display: flex;
  gap: ${f.xs};
`,pa=c.button`
  width: 32px;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${k.sm};
  background: ${p.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${p.blue500};
    &::after {
      border-color: ${p.blue500};
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
    border: solid ${p.gray700};
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
    border-color: ${p.gray300};
  }
`,ym=c.div`
  color: ${p.gray600};
  font-size: 13px;
`,jm=c.div`
  max-width: 380px;
`,vm=c.div`
  position: relative;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  border-radius: ${k.md};
  white-space: normal;
`,wm=c.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${p.white};
  border: 1px solid ${p.gray200};
  border-radius: ${k.lg};
  overflow: hidden;
  margin-top: -1px;

  thead {
    background: ${p.gray050};

    th {
      padding: ${f.md} ${f.lg};
      font-weight: 600;
      color: ${p.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${p.gray200};
    }
  }

  tbody {
    td {
      padding: ${f.md} ${f.lg};
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
        color: ${p.blue500};
        border: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover {
          color: ${p.blue600};
          text-decoration: underline;
        }
      }
    }

    tr {
      transition: background-color 0.2s ease;

      &:hover {
        background: ${p.gray050};
      }
    }
  }
`,Go=c.div`
  overflow: hidden;
  min-width: 160px;
`,$m=c.div`
  padding: ${f.xs} ${f.md};
  display: flex;
  align-items: center;
  justify-content: center;
`,Yo=c.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${p.gray800};
  padding: ${f.xs} ${f.md};

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${p.gray900};
    }

    &.test-date {
      color: ${p.gray600};
      font-size: 11px;
      padding-bottom: ${f.xs};
    }

    &.test-response {
      padding-top: ${f.xs};
      border-top: 1px solid ${p.gray200};
      color: ${p.gray700};
      font-size: 11px;
    }
  }
`,Cm=c.div`
  display: grid;
  grid-template-columns: repeat(30, 1fr);
  gap: 8px;
  height: 80px;
  margin: ${f.md} 0 ${f.xl} 0;
  width: 100%;

  @media (max-width: 768px) {
    gap: 2px;
  }
`,ha=c.div`
  position: relative;
  height: 100%;
  min-width: 4px;
  background: ${p.gray100};
  border-radius: ${k.lg};
  overflow: hidden;
`,Co=c.div`
  position: absolute;
  bottom: ${({$offset:t})=>t}%;
  left: 0;
  width: 100%;
  height: ${({$height:t})=>t}%;
  background-color: ${({$status:t})=>t==="success"?p.green600:t==="failed"?p.red600:t==="pending"?p.gray700:p.gray100};
  box-sizing: border-box;
  border-top: ${({$isLast:t})=>t?"none":`1px solid ${p.white}`};
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`,km=c.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${p.gray500};
  font-style: italic;
`,Sm=c.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`,Lm=c.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`,xa=c.div`
  flex: 1;

  .label {
    font-size: 12px;
    color: ${p.gray600};
    margin-bottom: 2px;
  }

  .value {
    font-size: 14px;
    font-weight: bold;
    color: ${p.gray900};
  }
`,Fm=c.div`
  background: ${p.gray100};
  padding: 2px 6px;
  border-radius: ${k.sm};
  font-size: 11px;
  color: ${p.gray700};
  text-transform: capitalize;
  height: 20px;
  display: flex;
  align-items: center;
  line-height: 1;
`,Tm=c.div`
  display: flex;
  align-items: center;
`,Em=c.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({$status:t})=>t==="success"?"rgba(34, 197, 94, 0.2)":t==="failed"?"rgba(239, 68, 68, 0.2)":"rgba(55, 65, 81, 0.2)"};
  color: ${({$status:t})=>t==="success"?p.green600:t==="failed"?p.red600:p.gray700};
  margin-right: ${f.sm};
`,zm=c.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: ${k.sm};
  background-color: ${p.gray100};
  color: ${p.gray700};
  font-size: 9px;
  font-weight: 500;
  cursor: pointer;
  margin-right: ${f.sm};
  height: 16px;
  line-height: 1;
  position: relative;
  top: -1px;
`,Nm=c.button`
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
  margin-right: ${f.sm};

  &:hover {
    opacity: 1;
    background: #4a5a6a;
  }

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
  }
`,Mm=c.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(55, 65, 81, 0.2);
  color: ${p.gray700};
`,ma=c.div`
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
`;c.span`
  font-size: 13px;
  font-weight: 500;
`;const Im=c.div`
  padding: ${f.lg} ${f.lg} 0 ${f.lg};
  background: ${p.white};
  border-radius: ${k.lg};
  overflow-x: auto;
  ${q};

  h4 {
    font-size: 1.1em;
    margin-bottom: ${f.md};
    color: ${p.gray800};
  }
`;c.div`
  background: ${p.white};
  border: 1px solid ${p.gray200};
  border-radius: ${k.md};
  padding: ${f.sm};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;

  p {
    margin: 0 0 4px 0;

    &:first-child {
      font-weight: 600;
      color: ${p.gray900};
    }
  }

  .test-list {
    max-height: 100px;
    overflow-y: auto;
    margin-top: ${f.xs};

    .test-item {
      font-size: 11px;
      margin: 2px 0;
      color: ${p.gray700};
    }
  }
`;const Rm=c.div`
  width: 100%;
  min-width: 100%;
`,ga=c.div`
  overflow: hidden;
  min-width: 160px;
  background: ${p.white};
  border-radius: ${k.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`,Am=c.div`
  padding: ${f.xs} ${f.md};
  display: flex;
  align-items: center;
  justify-content: center;
`,fa=c.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${p.gray800};
  padding: ${f.xs} ${f.md};
  text-align: center;

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${p.gray900};
    }

    &.test-date {
      color: ${p.gray600};
      font-size: 11px;
      padding-bottom: ${f.xs};
    }

    &.test-duration {
      padding-top: ${f.xs};
      border-top: 1px solid ${p.gray200};
      color: ${p.gray700};
      font-size: 11px;
    }
  }
`,Dm=({groups:t})=>{const s=(()=>{const d=new Date,h=[];for(let x=0;x<30;x++){const g=new Date(d);g.setDate(g.getDate()-x);const b=g.toISOString().split("T")[0],j=t.find(w=>w.date===b)?.tests||[];j.forEach(w=>{w.submissionDuration!==void 0&&w.submissionDuration!==null&&h.push({date:b,duration:w.submissionDuration,testId:w.id||0,status:w.status?.toLowerCase()||"pending",dateAttempted:w.dateAttempted||""})}),j.length===0&&h.push({date:b,duration:0,testId:null,status:"no-tests",dateAttempted:""})}return h})(),i=Array.from(new Set(s.map(d=>d.date))).sort().reverse().filter((d,h)=>h===0||h%5===0),r=({active:d,payload:h,label:x})=>{if(d&&h&&h.length){const g=h[0].payload;return g.status==="no-tests"?e.jsx(ga,{children:e.jsxs(fa,{children:[e.jsx("div",{children:x}),e.jsx("div",{children:"No tests on this day"})]})}):e.jsxs(ga,{children:[e.jsx(Am,{children:e.jsxs(dt,{$status:g.status,$size:"sm",children:[e.jsx(xn,{$size:"md"}),u(g.status?.toUpperCase())]})}),e.jsxs(fa,{children:[e.jsxs("div",{className:"test-id",children:["Test: ",g.testId]}),e.jsx("div",{className:"test-date",children:g.dateAttempted}),e.jsxs("div",{className:"test-duration",children:["Submit time: ",e.jsxs("strong",{children:[g.duration,"s"]})]})]})]})}return null},a=10;return s.some(d=>d.duration>=0)?e.jsx(Im,{children:e.jsx(Rm,{children:e.jsx(Xe,{width:"100%",height:250,children:e.jsxs(gt,{data:s,margin:{top:10,right:30,left:0,bottom:20},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"durationGradient",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"5%",stopColor:"#3b82f6",stopOpacity:.3}),e.jsx("stop",{offset:"95%",stopColor:"#3b82f6",stopOpacity:.1})]})}),e.jsx(Dl,{strokeDasharray:"3 3",stroke:"#f0f0f0"}),e.jsx(Pl,{dataKey:"date",tick:{fontSize:11},angle:-45,textAnchor:"end",height:60,interval:0,tickFormatter:(d,h)=>{const x=s.findIndex(g=>g.date===d);return h===x&&i.includes(d)?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}):""}}),e.jsx(Si,{tick:{fontSize:12},domain:[0,a],ticks:[2,4,6,8,10],tickFormatter:d=>`${d}s`,label:{value:u("Submit Time"),angle:-90,position:"insideLeft",style:{textAnchor:"middle"}}}),e.jsx(Li,{content:e.jsx(r,{})}),e.jsx(ft,{type:"monotone",dataKey:"duration",stroke:"#3b82f6",strokeWidth:2,fill:"url(#durationGradient)",isAnimationActive:!1,connectNulls:!0})]})})})}):null},Pm=c.div``,Bm=c.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
`,Om=c.div`
  padding: 0 7px;
`,Wm=c.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${f.sm};
  background: none;
  border: none;
  color: ${p.gray600};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border-bottom: 2px solid ${p.gray100};

  &:hover {
    color: ${p.gray800};
  }

  &.active {
    color: ${p.blue600};
    border-bottom-color: ${p.blue600};
  }

  &:focus {
    outline: none;
  }
`,_m=c.div`
  padding-top: ${f.md};
`,Hm=({tabs:t,activeTab:n,onTabChange:s})=>e.jsxs(Pm,{children:[e.jsx(Bm,{children:t.map(o=>e.jsx(Om,{children:e.jsx(Wm,{className:T(n===o.id&&"active"),onClick:()=>s(o.id),children:u(o.label)})},o.id))}),e.jsx(_m,{children:t.find(o=>o.id===n)?.content})]}),ko={position:"top",animation:"fade",delay:[100,0]},Um=t=>{switch(t){case"success":return e.jsx(kc,{});case"failed":return e.jsx(rt,{});case"pending":return e.jsx(Qn,{});default:return e.jsx(Qn,{})}},qm=({test:t,formId:n,onDelete:s,showNotifications:o})=>{const i=pm({screenshot:t.screenshot,beforeSubmitScreenshot:t.beforeSubmitScreenshot,testId:t.id}),r=m.useRef(null),a=jt(r),l=t.dateAttempted;return e.jsxs("tr",{ref:r,children:[e.jsx("td",{className:"no-break",children:t.id}),e.jsx("td",{className:"no-break",title:l,children:l}),e.jsx("td",{className:"no-break",children:e.jsxs(dt,{$status:t.totalStatus,$size:"sm",children:[e.jsx(xn,{$size:"lg"}),u(t.totalStatus?.toUpperCase())]})}),e.jsx("td",{className:"no-break",children:e.jsxs(Tm,{children:[e.jsx(Em,{$status:t.status,children:e.jsx(ma,{children:Um(t.status)})}),t.screenshot&&e.jsx(he,{title:u("View Screenshot"),...ko,children:e.jsx(Nm,{onClick:i,children:e.jsx(im,{})})}),t.submissionDuration!==0&&e.jsx(he,{title:u(`Submit time is ${t.submissionDuration} seconds`,{duration:t.submissionDuration.toFixed(2)}),...ko,children:e.jsxs(zm,{children:[t.submissionDuration.toFixed(1),"s"]})})]})}),o&&e.jsx("td",{children:t?.totalNotifications?t.dateCompleted?e.jsx(he,{html:e.jsx(Go,{children:e.jsxs(Yo,{children:[e.jsxs(Lm,{children:[e.jsxs(xa,{children:[e.jsx("div",{className:"label",children:u("Enabled")}),e.jsx("div",{className:"value",children:t.totalNotifications})]}),e.jsxs(xa,{children:[e.jsx("div",{className:"label",children:u("Received")}),e.jsx("div",{className:"value",children:t.notifications?.length||0})]})]}),e.jsx(Sm,{children:t.notifications?.map((d,h)=>e.jsx(Fm,{children:d.type},h))})]})}),position:"top",theme:"light",animation:"fade",arrow:!0,duration:100,distance:10,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsxs(dt,{$status:t.notifications?.length>=t.totalNotifications?"success":"failed",$size:"sm",style:{cursor:"pointer"},children:[t.notifications?.length||0,"/",t.totalNotifications]})}):e.jsx(Mm,{children:e.jsx(ma,{children:e.jsx(Qn,{})})}):e.jsx(dt,{$status:"inactive",$size:"sm",children:"N/A"})}),e.jsx("td",{className:"no-break",children:t?.totalResponse&&e.jsx(jm,{children:e.jsx(vm,{children:t.totalResponse})})}),e.jsx("td",{children:e.jsx(he,{title:u("Delete Test"),...ko,children:e.jsx(Sn,{active:a,onClick:()=>s({formId:n,testId:t.id})})})})]})},Qm=({groups:t})=>{const n=t.slice(0,30);if(n.length===0)return e.jsx(km,{children:u("No test results available for the last 30 days.")});const s=Math.max(...n.map(o=>o.tests.length),1);return e.jsx(Cm,{children:n.map((o,i)=>e.jsx(Km,{group:o,maxTests:s,isCurrentDay:i===0},o.date))})},Km=({group:t,maxTests:n,isCurrentDay:s})=>{const o=m.useRef(null),i=jt(o),r=x=>e.jsxs(Go,{children:[e.jsx($m,{children:e.jsxs(dt,{$status:x.totalStatus,$size:"sm",children:[e.jsx(xn,{$size:"md"}),u(x.totalStatus?.toUpperCase())]})}),e.jsxs(Yo,{children:[e.jsxs("div",{className:"test-id",children:["Test: ",x.id]}),e.jsx("div",{className:"test-date",children:x.dateAttempted}),x.totalResponse&&e.jsx("div",{className:"test-response",children:x.totalResponse})]})]}),a=100/n,l=t.tests||[],d=s?n-l.length:0;if(t.isInactive)return e.jsx(ha,{ref:o,children:e.jsx(he,{html:e.jsx(Go,{children:e.jsxs(Yo,{children:[e.jsx("div",{children:u("No tests on this day")}),e.jsx("div",{className:"test-date",children:t.date})]})}),position:"top",theme:"light",animation:"fade",arrow:!0,duration:100,distance:10,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsx(Co,{$status:"inactive",$height:100,$offset:0,$isLast:!0,$isHovering:i,$isPending:!1})})});const h=[...l].reverse();return e.jsxs(ha,{ref:o,children:[h.map((x,g)=>e.jsx(he,{html:r(x),position:"bottom",theme:"light",animation:"fade",duration:100,distance:-15,size:"small",hideOnClick:!1,followCursor:!0,children:e.jsx(Co,{$status:x.totalStatus,$height:a,$offset:g*a,$isLast:g===h.length-1&&d===0,$isHovering:i,$isPending:!1},x.id)},x.id)),d>0&&Array.from({length:d}).map((x,g)=>e.jsx(Co,{$status:"inactive",$height:a,$offset:(h.length+g)*a,$isLast:g===d-1,$isHovering:i,$isPending:!0},`pending-${g}`))]})},Vm=()=>{const{formTestsQuery:t}=u1(),[n,s]=Ti(),o=Number(n.get("page"))||1,[i,r]=me.useState(null),[a,l]=me.useState("testResults"),{data:d,isLoading:h,isFetching:x,refetch:g}=t,b=100;if(h||x)return e.jsx(Nx,{});if(d?.error)return e.jsx(mx,{children:d.error?.message});if(!d||!d.tests)return e.jsx($o,{children:e.jsx(da,{children:e.jsx("p",{children:u("Form Monitor is not enabled for this form.")})})});if(d?.stats?.total===0&&d?.fmFormStats?.enabled)return e.jsx($o,{children:e.jsx(da,{children:e.jsx("p",{children:u("This form is awaiting its first scan. This could take a few minutes.")})})});const y=S=>{s({page:String(S)}),window.scrollTo({top:0,behavior:"smooth"})},j=d.tests.flatMap(S=>S.tests),w=j.length,v=Math.ceil(w/b),$=(o-1)*b,C=$+b,E=j.slice($,C),F=e.jsx(hm,{children:e.jsxs(xm,{children:[e.jsx(ua,{children:u(`Of the ${d.stats?.total||0} tests that have occurred in the last 30 days, ${d.stats?.failed||0} ${d.stats?.failed===1?"test has":"tests have"} failed for this form.`)}),e.jsx(Qm,{groups:d.tests})]})}),z=e.jsx(Dm,{groups:d.tests}),M=[{id:"testResults",label:"Test Results",content:F},{id:"submitTimes",label:"Form Submit Times",content:z}];return e.jsxs($o,{children:[e.jsx(Hm,{tabs:M,activeTab:a,onTabChange:l}),e.jsxs(mm,{children:[e.jsxs(gm,{children:[e.jsx("h3",{children:u("Detailed Results")}),e.jsx(ua,{children:u(`A total of ${d.stats?.total||0} tests have been conducted for this form.`)})]}),e.jsxs(wm,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Test ID")}),e.jsx("th",{children:u("Date")}),e.jsx("th",{children:u("Status")}),e.jsx("th",{children:u("Form Submit")}),d.notifications?.enabled&&e.jsx("th",{children:u("Notifications")}),e.jsx("th",{children:u("Response")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:E.map(S=>e.jsx(qm,{test:S,formId:d.formId,onDelete:r,showNotifications:d.notifications?.enabled},S.id))})]})]}),w>b&&e.jsxs(fm,{children:[e.jsxs(bm,{"aria-label":"test results pagination",children:[e.jsx(pa,{className:"prev-page",onClick:()=>y(o-1),disabled:o===1,title:u("Previous Page")}),e.jsx(pa,{className:"next-page",onClick:()=>y(o+1),disabled:o===v,title:u("Next Page")})]}),e.jsxs(ym,{children:[u("Showing")," ",$+1,"-",Math.min(C,w)," ",u("of")," ",w," ",u("tests")]})]}),i&&e.jsx(cd,{formId:i.formId,testId:i.testId,onClose:()=>r(null),onSuccess:()=>{g()}})]})},Jo="freeform-builder-tabs",Zo=new Set,ud=t=>t?JSON.parse(sessionStorage.getItem(Jo)||"{}")[t]||{}:{},Gm=(t,n)=>{const s=JSON.parse(sessionStorage.getItem(Jo)||"{}");sessionStorage.setItem(Jo,JSON.stringify({...s,[t]:n}))},Ym=(t,n)=>ud(t)[n]??null,Jm=()=>{Zo.forEach(t=>{t()})},Zm=t=>(Zo.add(t),()=>{Zo.delete(t)}),_e=t=>{const{formId:n}=K(),s=m.useSyncExternalStore(Zm,()=>Ym(n,t)),o=m.useCallback(i=>{n&&(Gm(n,{...ud(n),[t]:i??null}),Jm())},[n,t]);return{lastTab:s,setLastTab:o}},Kn=(t,n)=>{n===void 0&&(t>1?(n=t,t=1):(n=t,t=0));const s=[];for(let o=t;o<=n;o++)s.push(o);return s},Xm=(t,n,s)=>{const o={};return t.forEach(i=>{const r=i[n];let a;a=i[s],o[r]=a}),o},ba=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Ui=c.div`
  flex: 1;

  background: ${p.white};
  padding: ${f.xl};
  overflow-y: auto;
  width: calc(100% - 300px);

  ${q};

  div[class^='ControlWrapper-'] {
    div[class^='CheckboxWrapper-'] {
      align-items: start;

      div[class^='CheckboxItem-'] {
        padding-top: 4px;
      }
    }
  }
`,qi=c.h1`
  display: flex;

  width: 100%;
  padding: 0 0 ${f.md};
  margin: 0;
`,eg=c.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: ${f.md};

  width: 100%;

  &:empty {
    height: 50px;

    &:before {
      content: 'No settings available for this section.';
      font-style: italic;
      color: ${p.gray200};
    }
  }
`,Qi=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
`,Xo=c.button`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${f.sm};

  padding: ${f.sm} ${f.md};
  border-radius: ${k.lg};

  color: ${p.gray700};
  fill: currentColor;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${p.white};
    background-color: ${p.gray500};
  }

  &.errors {
    color: ${p.error};
  }

  &.active.errors {
    color: ${p.white};
    background-color: ${p.error};
  }

  &:hover:not(.active) {
    background-color: ${p.gray100};
  }
`,ya=c.div`
  width: 18px;
  height: 18px;
`,tg=c.div`
  border-bottom: solid 1px ${p.gray200};
  margin: ${f.lg} 0;
`,ja=c.p`
  font-size: 0.75rem;
  color: ${p.gray400};
  padding: 0 ${f.md};
  margin: 0 0 ${f.xs};
`,va=c.a`
  color: ${p.gray400};
  text-decoration: ${t=>t.href?"underline":"none"};
  font-weight: ${t=>t.href?600:400};

  ${({href:t})=>t&&ne`
      &:hover {
        color: ${p.gray500};
        text-decoration: none;
      }
    `}

  ${({href:t})=>!t&&ne`
      &:hover {
        text-decoration: none;
        cursor: text;
      }
    `}
`,pd=c.div`
  display: flex;
  height: 100%;
  background: ${p.white};
`,ng=()=>e.jsxs(pd,{children:[e.jsx(Pe,{children:e.jsx(Ht,{baseColor:p.gray200,highlightColor:p.gray300,children:Kn(5).map(t=>e.jsx(Xo,{children:e.jsx(L,{width:200},t)},t))})}),e.jsxs(Ui,{children:[e.jsx(qi,{children:e.jsx(L,{width:100})}),Kn(7).map(t=>e.jsxs("div",{style:{width:"100%"},children:[e.jsx(L,{width:ba(120,300)}),e.jsx(L,{width:`${ba(70,90)}%`,height:8}),e.jsx(L,{height:30})]},t))]})]}),sg=()=>{const{ownership:t}=A(De.current);return t?e.jsxs(e.Fragment,{children:[e.jsx(tg,{}),e.jsxs(Qi,{children:[e.jsxs(ja,{children:[t.created.user?e.jsxs(e.Fragment,{children:[u("Created by")," ",e.jsx(va,{href:t.created.user.url,target:"_blank",children:t.created.user.name})]}):u("Created")," ",u("at"),":",e.jsx("br",{})," ",t.created.datetime]}),e.jsxs(ja,{children:[t.updated.user?e.jsxs(e.Fragment,{children:[u("Last Updated by")," ",e.jsx(va,{href:t.updated.user.url,target:"_blank",children:t.updated.user.name})]}):u("Last Updated")," ",u("at"),":",e.jsx("br",{})," ",t.updated.datetime]})]})]}):null},mn=t=>t?!!Object.entries(t).length:!1,og=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M160 64c-17.7 0-32 14.3-32 32l0 320c0 11.7-3.1 22.6-8.6 32L432 448c26.5 0 48-21.5 48-48l0-304c0-17.7-14.3-32-32-32L160 64zM64 480c-35.3 0-64-28.7-64-64L0 160c0-35.3 28.7-64 64-64l0 32c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32s32-14.3 32-32L96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 304c0 44.2-35.8 80-80 80L64 480zM384 112c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16zM160 304c0-8.8 7.2-16 16-16l256 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16zm0 64c0-8.8 7.2-16 16-16l256 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16zm32-144l128 0 0-96-128 0 0 96zM160 120c0-13.3 10.7-24 24-24l144 0c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24l0-112z"})}),ig=()=>{const t=I.limitations,n=te(),{setLastTab:s}=_e("settings"),{sectionHandle:o}=K(),i=I.metadata.craft.is5,r=A(De.errors),{data:a}=Qt();if(!a)return null;const l=[];return a.forEach(d=>{d.properties.forEach(h=>{mn(r?.[d.handle]?.[h.handle])&&(l.includes(h.section)||l.push(h.section))})}),e.jsxs(Pe,{$lean:!0,children:[e.jsxs(Qi,{children:[a.map(d=>d.sections.filter(h=>t.can(`settings.tab.${h.handle}`)).map(h=>e.jsxs(Xo,{onClick:()=>{s(h.handle),n(`${h.handle}`)},className:T(o===h.handle&&"active",l.includes(h.handle)&&"errors"),children:[e.jsx(ya,{dangerouslySetInnerHTML:{__html:O.sanitize(h.icon)}}),u(h.label)]},h.handle))),i&&e.jsxs(Xo,{onClick:()=>{s(Ns),n(Ns)},className:T(o===Ns&&"active"),children:[e.jsx(ya,{children:e.jsx(og,{})}),u("Usage in Elements")]})]}),e.jsx(sg,{})]})},Ns="usage",rg=()=>{const t=I.limitations,{sectionHandle:n}=K(),s=te(),{lastTab:o,setLastTab:i}=_e("settings"),r=et(""),{data:a,isFetching:l}=Qt();return m.useEffect(()=>{o&&s(o)},[s,o]),m.useEffect(()=>{if(!n&&!o){const d=a?.[0]?.sections.filter(h=>t.can(`settings.tab.${h.handle}`))?.[0];d&&(i(d.handle),s(`${d.handle}`))}},[a,n,o,s,i]),!a&&l?e.jsx(ng,{}):e.jsxs(pd,{children:[e.jsx(Q,{id:"settings",label:u("Settings"),url:r.pathname}),e.jsx(ig,{}),e.jsx(mt,{})]})},hd=c.div`
  position: relative;
  width: 100%;
`,ag=c(W.div)`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;

  box-shadow: ${oe.panel};

  pointer-events: none;

  &.active {
    pointer-events: all;
  }
`,Ki=c.div`
  cursor: pointer;

  input,
  select,
  textarea {
    pointer-events: none;
  }
`,tt=c.div`
  width: 100%;
  min-width: 800px;

  display: flex;
  flex-direction: column;
  gap: ${f.lg};

  padding: ${f.lg};

  box-shadow: ${oe.box};
  border-radius: ${k.lg};
  background: ${p.gray050};
`,Vi=c.div`
  max-height: 600px;
  overflow-x: hidden;
  overflow-y: auto;

  ${q};
`,qe=({preview:t,onEdit:n,onAfterEdit:s,excludeClassNames:o=[],children:i})=>{const[r,a]=m.useState(void 0),l=m.useRef(null),d=m.useRef(null),h=m.useRef(r),{editorAnimation:x}=Tc({wrapper:l.current,editor:d.current,isEditing:r});yt({callback:()=>{a(!1)},isEnabled:r,refObject:d,excludeClassNames:["tagify__dropdown","dropdown-rollout","elementselectormodal",...o]});const g=()=>{a(!1)},b=_1();return Jn(()=>a(!1),!!r),m.useEffect(()=>{h.current&&r===!1&&s?.(),h.current=r},[r,s]),e.jsxs(hd,{ref:l,children:[e.jsx(Ec,{children:e.jsx(ag,{style:{zIndex:b,pointerEvents:r?"initial":"none",...x},className:T(r&&"active","editable-content"),ref:d,children:typeof i=="function"?i(r,g):i})}),e.jsx(Ki,{onClick:()=>{a(!0),n?.()},children:t})]})},Re={all:J(t=>t.layout.fields,t=>t),count:J(t=>t.layout.fields,t=>t.length),one:t=>J(n=>n.layout.fields,n=>n.find(s=>s.uid===t)),hasErrors:J(t=>t.layout.fields,t=>t.some(n=>n.errors!==void 0)),inRow:t=>J(n=>n.layout.fields,n=>n.filter(s=>s.rowUid===t.uid).sort((s,o)=>(s.order??0)-(o.order??0)))},lg=t=>A(Re.all).filter(o=>t.availableFieldTypes.includes("*")?!0:t.availableFieldTypes.includes(o.typeClass)).map(o=>o.properties.handle),cg=c.div`
  display: flex;
  align-items: center;
  gap: ${f.md};

  mark {
    padding: 0 ${f.xs};
    border-radius: ${k.lg};
    background: ${p.gray200};
  }
`,dg=c.div`
  .tagify__input {
    min-height: 80px;
    background-color: #fff;
    line-height: 2.2;
  }

  .tagify {
    --tag-bg: ${p.gray500};
    --tag-hover: ${p.gray600};
    --tag-text-color: ${p.white};
    --tags-border-color: ${p.gray500};
    --tag-remove-bg: ${p.red500};
    --tag-remove-btn-color: ${p.white};
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
`,ug=c.ul`
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
`;const xd=(t,n)=>{const s=t.match(/field:([a-zA-Z0-9_]+)/g);if(!s||s.length===0)return t;const o=s.map(i=>i.replace("field:",""));return n==="<mark>...</mark>"?o.map(i=>`<mark>${i}</mark>`).join(", "):o.map(i=>`[[${i}]]`).join(", ")},pg=({value:t,property:n,updateValue:s})=>{const[o,i]=m.useState(""),r=lg(n),a=m.useRef(null),l=m.useCallback(h=>{s(h.detail.tagify.DOM.input.textContent.replace(/\u200B/g,"").replace(/\s+/g," ").trim())},[s]),d=h=>{if(!h)return;const x=a.current.createTagElem({value:h});a.current.injectAtCaret(x);const g=a.current.insertAfterTag(x,"");a.current.placeCaretAfterNode(g)};return m.useEffect(()=>{i(xd(t))},[t]),e.jsxs(tt,{children:[e.jsxs(cg,{children:[e.jsx(ug,{children:e.jsx(ce,{emptyOption:u("Insert Field"),options:r.map(h=>({value:h,label:h})),onChange:d,value:""})}),e.jsxs("span",{children:["or type ",e.jsx("mark",{children:"@"})," to search on field handles"]})]}),e.jsx(dg,{children:e.jsx(Ol,{autoFocus:!1,tagifyRef:a,settings:{pattern:/@/,enforceWhitelist:!0,editTags:!1,pasteAsTags:!0,duplicates:!0,dropdown:{enabled:0,includeSelectedTags:!0},templates:{tag:function(h){return`
                <tag
                  title="${h.value}"
                  contenteditable="false"
                  spellcheck="false"
                  class="tagify__tag"
                  ${this.getAttributes(h)}
                >
                <x title="remove tag" class="tagify__tag__removeBtn"></x>
                  <div>
                    <p class="tagify__tag-text">
                      <span class="sr-only-value">field:</span>${h.value}</p>
                  </div>
                </tag>`}},whitelist:r},onChange:l,value:o})})]})},vt=c.div`
  position: absolute;
  top: calc(50% - 10px);
  left: 0;
  right: 0;

  opacity: 1;
  transition: opacity 0.2s ease-out;

  color: ${p.gray200};
  font-size: 16px;
  font-weight: bold;
  font-style: italic;
  text-align: center;
`,Vt=c.div`
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

    ${We};
    color: ${p.gray300};
    font-size: 11px;
    text-align: center;
  }

  &:hover {
    &:after {
      opacity: 0.5;
    }

    ${vt} {
      opacity: 0;
    }
  }
`;c.div`
  display: grid;
  grid-template-columns: 60% 40%;

  margin-bottom: ${f.md};

  ${We};
  font-size: 11px;
`;const Gt=c.div`
  height: 170px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: 0 ${f.md};

  background: ${p.white};
  box-shadow: ${oe.box};
  border-radius: ${k.lg};

  ${q};
`,Gi=c.div`
  position: relative;

  display: grid;
  grid-template-columns: auto 100px;
  gap: 10px;

  justify-items: stretch;
  align-items: center;

  border-bottom: 1px solid ${p.gray100};

  &:after {
    content: attr(data-title);

    position: absolute;
    left: calc(100% - 105px);
    bottom: -4px;

    padding: 0 5px;
    background: ${p.white};

    ${We};
    font-size: 8px;
    line-height: 8px;
  }

  > div {
    white-space: nowrap;
    overflow: hidden;

    padding: 7px ${f.xs} 7px 0;

    &:last-child {
      padding-right: 0;
    }
  }
`,gn=c.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${p.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`,hg=c(Gt)`
  padding: ${f.sm};

  mark {
    padding: ${f.xs} ${f.sm};
    border-radius: ${k.lg};
    background: ${p.gray100};
  }
`,xg=({value:t})=>e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(hg,{children:[!t&&e.jsx(vt,{children:u("Not configured yet")}),e.jsx("div",{style:{lineHeight:"2.0"},dangerouslySetInnerHTML:{__html:O.sanitize(xd(t,"<mark>...</mark>"))}})]})}),mg=({value:t,property:n,errors:s,updateValue:o})=>e.jsx(_,{property:n,errors:s,children:e.jsx(qe,{preview:e.jsx(xg,{value:t}),children:e.jsx(pg,{value:t,property:n,updateValue:o})})}),md=(t,n,s)=>{let o=!0;return t.forEach(i=>{new Function(...Object.keys(n),"context",`return ${i}`)(...Object.values(n),s)||(o=!1)}),o},an=(t,n)=>{const s=n.split(".");let o=t;for(const i of s){if(o===void 0)return;o=o[i]}return o},gg=({value:t,property:n,errors:s,updateValue:o})=>{const{source:i,optionValue:r,optionLabel:a,filters:l,emptyOption:d}=n,x=Al().getState(),g=an(x,i),b=[];return g.forEach((y,j)=>{md(l,y)&&b.push({label:a?an(y,a):y,value:r?an(y,r):j})}),e.jsx(_,{property:n,errors:s,children:e.jsx(ce,{value:t,onChange:o,emptyOption:d,options:b})})},gd={all:["craft-asset-previews"],byIds:t=>[...gd.all,{ids:t}]},fg=t=>B({queryKey:gd.byIds(t),queryFn:()=>N.get(`api/assets?ids=${t.join(",")}`).then(n=>n.data),staleTime:1/0,gcTime:1/0,enabled:t?.length>0}),Yi=({actionLabel:t,multiSelect:n,sources:s="*",criteria:o,limit:i,value:r,onUpdate:a})=>{const{data:l,isFetching:d}=fg(r),h=m.useCallback(()=>{Craft.createElementSelectorModal("craft\\elements\\Asset",{multiSelect:i!==1||n,sources:s,criteria:o,storageKey:"freeform-asset-selection",onSelect:y=>{const w=y.map($=>$.id).slice(0,i).filter($=>!r?.includes($)),v=[...r||[],...w];a(v)}})},[a,n,o,i,s,r]),x=m.useCallback(y=>{a(r.filter(j=>j!==y))},[a,r]),g=i===void 0||r?.length===void 0||r?.length<i,b=l===void 0&&d&&r?.length>0;return e.jsxs("div",{className:"elementselect",children:[e.jsxs("ul",{className:"elements chips chips-small",children:[b&&r.map((y,j)=>e.jsx("li",{className:"element small",children:e.jsxs("div",{className:"chip small element",children:[e.jsx("div",{className:"thumb",children:e.jsx(L,{width:30,height:20})}),e.jsx("div",{className:"chip-content",children:e.jsx(L,{width:yg(j)})})]})},`skeleton-${y}`)),l?.map(y=>e.jsx("li",{className:"element small removable",children:e.jsxs("div",{className:"chip small element removable",children:[e.jsx("div",{className:"thumb",children:e.jsx("img",{src:y.thumbUrl,alt:y.title,width:30,height:20})}),e.jsxs("div",{className:"chip-content",children:[e.jsx("div",{className:"element-label",children:e.jsx("a",{className:"label-link",href:y.editUrl,target:"_blank",rel:"noreferrer",children:y.title})}),e.jsx("div",{className:"chip-actions",children:e.jsx(jg,{type:"button",title:"Remove",onClick:()=>x(y.id)})})]})]})},y.id))]}),g&&e.jsx("div",{className:"flex",children:e.jsx("button",{type:"button",className:"btn add icon",onClick:h,children:u(t||"Add an asset")})})]})},bg=[80,100,90,70,120],yg=t=>bg[t]||100,jg=c.button`
  font-family: 'Craft';
  font-size: 14px;

  &:before {
    content: 'remove';
  }
`,vg=({value:t,property:n,errors:s,updateValue:o})=>{const{criteria:i,multiSelect:r,actionLabel:a,limit:l}=n;return e.jsx(_,{property:n,errors:s,children:e.jsx(Yi,{actionLabel:a,criteria:i,limit:l,multiSelect:r,value:t,onUpdate:o})})},as=(t,n=500)=>{const[s,o]=m.useState(t);return m.useEffect(()=>{const i=setTimeout(()=>o(t),n);return()=>clearTimeout(i)},[t,n]),s},ls=({label:t,onClick:n,disabled:s=!1,className:o})=>e.jsx(wg,{className:o,children:e.jsx($g,{type:"button",className:"btn add icon",onClick:n,disabled:s,children:u(t)})}),wg=c.div`
  width: 100%;
  display: flex;
  justify-content: center;

  background: transparent;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-top: none;
  border-bottom-left-radius: ${k.lg};
  border-bottom-right-radius: ${k.lg};
`,$g=c.button`
  width: 100%;
  padding: 6px 9px;

  background: ${p.white};
  border-radius: 4px;

  text-align: center;
  cursor: pointer;

  &:before {
    margin-right: 6px;
  }

  &:hover {
    background: ${p.gray050};
  }

  &:focus {
    outline: none;
    box-shadow: var(--inner-focus-ring);
  }

  &:disabled {
    background: #00000004;
    color: ${p.gray300};
    cursor: not-allowed;
  }
`,Cg=c.div`
  font-style: italic;
  font-size: 12px;
  line-height: 18px;
  padding-top: 6px;
  color: ${p.gray300};
`,Yt=({children:t})=>e.jsx(Cg,{children:t}),cs=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"})}),Ln=(t,n)=>{const s=m.useRef([]),[o,i]=m.useState(0),[r,a]=m.useState(0),l=m.useCallback(x=>g=>{if(g.key==="Enter"&&x?.onEnter){g.preventDefault(),x.onEnter(g);return}if(g.key==="Backspace"&&x?.onDelete&&g.target.value.length===0){g.preventDefault(),x.onDelete(g);return}let b=o,y=r;const j=s.current?.[o]?.[r],w=j instanceof HTMLInputElement||j instanceof HTMLTextAreaElement,v={start:!0,end:!0,position:0};if(w){const E=j.selectionStart;v.start=E===0,v.end=E===j.value.length,v.position=E}let $;if(g.key==="ArrowUp"&&o>0&&b--,g.key==="ArrowDown"&&o<t-1&&b++,g.key==="ArrowLeft"&&r>0&&v.start&&($=!0,y--),g.key==="ArrowRight"&&r<n-1&&v.end&&($=!1,y++),b===o&&y===r)return;b!==o&&i(b),y!==r&&a(y);const C=s.current?.[b]?.[y];C?.focus(),(C instanceof HTMLInputElement||C instanceof HTMLTextAreaElement)&&(g.preventDefault(),$!==void 0?C.setSelectionRange($?C.value.length:0,$?C.value.length:0):C.setSelectionRange(v.position,v.position))},[t,n,o,r]),d=(x,g)=>{i(x),a(g),s.current?.[x]?.[g]?.focus()},h=(x,g,b)=>{s.current[g]||(s.current[g]=[]),s.current[g][b]=x};return{activeCell:`${o}:${r}`,setActiveCell:d,setCellRef:h,keyPressHandler:l}},fd=c.nav`
  position: relative;

  display: grid;
  grid-template-columns: 300px max-content 1fr max-content;
  align-items: center;

  height: 50px;
  flex: 0 0 50px;

  box-sizing: border-box;
  overflow-x: hidden;
`,bd=c.h1`
  position: relative;
  margin: 0;
`,yd=c.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: ${p.gray700};
`,ds=c.div`
  display: flex;
  align-self: flex-end;

  background-color: ${p.gray050};
  border-radius: ${k.lg} ${k.lg} 0 0;
  box-shadow:
    inset 0 -1px 0 0 rgba(154, 165, 177, 0.25),
    0 0 0 1px rgba(154, 165, 177, 0.25);

  a {
    display: flex;
    align-items: center;

    height: 49px;
    padding: 0 ${f.xl};

    white-space: nowrap;

    color: var(--light-text-color);
    border-radius: ${k.md} ${k.md} 0 0;

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
      background: ${p.white};
      color: ${p.gray700};
      box-shadow:
        inset 0 2px 0 ${p.gray500},
        0 0 0 1px rgba(51, 64, 77, 0.1),
        0 2px 12px rgba(205, 216, 228, 0.5) !important;
    }

    &.errors {
      position: relative;
      color: ${p.error};

      ${Di};
    }

    > span[data-icon] {
      position: relative;
      left: 5px;
    }
  }
`,jd=c.div`
  display: flex;
  align-items: center;
  justify-self: end;
  gap: ${f.md};
`,kg=c.button``,Sg=c.a`
  display: inline-flex;
  align-items: center;
  justify-self: start;
  width: max-content;
  font-size: 13px;
  white-space: nowrap;
  text-decoration: none;

  margin-block: 0;
  margin-inline: 2px;
  margin-left: ${f.sm};
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
`,Lg=c.span`
  color: ${p.gray700};
  font-size: 9px;
  margin-left: ${f.xs};
  font-weight: bold;
  transform: translateY(-4px);
  display: inline-block;
  line-height: 1;
`;c.div`
  display: flex;
  align-items: center;
  gap: 4px;

  padding: 0 8px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
`;c.div`
  display: flex;
  align-items: center;

  input:first-child {
    border-right: 1px solid rgba(0, 0, 0, 0.1);
  }
`;const vd=c.button`
  width: 20px;
  height: 20px;

  padding: 2px;
  margin: 0;
  border: 0;

  &:before {
    content: 'plus';

    color: ${p.gray500};

    font-family: Craft;
    font-size: 15px;
    font-weight: 100;
    line-height: 15px;
  }
`;c(vd)`
  right: 20px;

  &:before {
    content: 'plus';
  }
`;c(vd)`
  &:before {
    content: 'minus';
  }
`;c.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 5px;

  padding: 0 8px;

  label {
    display: block;
  }
`;const Fg=c(ds)`
  flex: 1;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${f.md} 1px 0;
  box-shadow: ${oe.bottom};

  ${q};

  a {
    cursor: pointer;

    display: flex;
    gap: 5px;

    user-select: none;
  }
`,Tg=c.span`
  display: block;

  max-width: 100px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Eg=c.div`
  display: flex;
  align-items: flex-end;
  gap: ${f.sm};
  width: 100%;
  padding-inline: ${f.md};
`,zg=c.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: 34px;
  height: 34px;
  margin-bottom: 8px;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${k.md};

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`,Ng=c.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: 2px;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${k.sm};
  background: rgba(51, 64, 77, 0.08);
  color: ${p.gray500};

  &:hover {
    color: ${p.gray700};
    background: rgba(51, 64, 77, 0.2);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`,Mg=c.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;
  padding: 0;
  margin-left: auto;

  border: 1px solid rgba(51, 64, 77, 0.1);
  border-radius: ${k.sm};
  background: rgba(51, 64, 77, 0.08);
  color: ${p.gray500};
  cursor: move;

  &:hover {
    color: ${p.gray700};
    background: rgba(51, 64, 77, 0.2);
  }

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`,Ig=c.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${f.sm};

  padding-top: ${f.sm};
`,wd=c(tt)`
  gap: 0;
  padding: 0;
`,us=c(Vi)`
  border-radius: ${k.lg};
  background-color: white;
`,Rg=c(Eg)`
  padding: 0 ${f.lg};

  background: ${p.gray050};
  box-shadow: ${oe.bottom};
`,Ag=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};

  padding: ${f.lg};
`,ps=c.table`
  width: 100%;

  thead {
    background-color: ${p.gray050};
    border: 1px solid red;
    border-radius: 5px 5px 0 0;

    th {
      padding: 6px;
      padding-inline: 10px !important;
      margin: 0;

      background-color: ${p.gray050};
      border: 1px solid ${p.hairline};
    }
  }
`,Ps=c.tr``,de=c.td`
  width: ${({$tiny:t,$width:n})=>t?"32px":n?`${n}px`:"auto"};

  padding: ${({$tiny:t})=>t?"6px 9px !important":"0 !important"};

  border: 1px solid rgba(0, 0, 0, 0.1);

  label {
    display: none;
  }
`,nt=c.input`
  width: 100%;
  height: 34px;

  padding: 6px 9px;

  background: ${p.white};

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }

  &::placeholder {
    color: ${p.gray200};
  }

  &:disabled {
    background: #00000004;
    color: ${p.gray300};
  }
`;c.select`
  height: 34px;

  padding: 6px 9px;

  &:focus {
    box-shadow: var(--inner-focus-ring);
  }
`;const Rt=c.button`
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
`,kt=c.div`
  display: flex;
  align-items: center;
  justify-content: center;
`,Dg=c(tt)`
  gap: 0;
  padding: 0;
`,Pg=c(ds)`
  width: 100%;
  overflow: hidden;
  overflow-x: auto;
  align-self: flex-start;

  padding: ${f.md} ${f.md} 0;
  box-shadow: ${oe.bottom};

  ${q};

  a {
    cursor: pointer;
    user-select: none;
  }
`,Bg=c.div`
  padding: ${f.md};

  background: ${p.white};
`,Og=c(Vi)``,Wg=c.div`
  position: relative;

  padding: ${f.sm} ${f.md};

  font-family: monospace;

  background: ${p.gray050};
  border: 1px solid ${p.hairline};
  border-bottom: none;
  border-radius: ${k.lg} ${k.lg} 0 0;
`,$d=c.span`
  color: ${p.teal700};
`,Cd=c.span`
  color: ${p.gray300};
`,Bs=c.span`
  &:before {
    content: '"';
    color: ${p.gray300};
  }
`,kd=c.span`
  color: ${p.red300};
`,Sd=t=>{const n=[];return t.forEach(([s,o])=>{if(s=s===null?"":s,o=o===null?"":o,!s&&o&&(s=o,o=""),!(!s&&!o)){if(o===""||o===null){n.push([String(s),void 0]);return}Array.isArray(o)&&(o=o.join(" ")),n.push([String(s),String(o)])}}),n},_g=(t,n,s)=>{const o=n?.[t]||[];return{...n,[t]:[...o.slice(0,s+1),["",""],...o.slice(s+1)]}},wa=(t,n,s,o)=>{const i={...o,[n]:[...o[n]]};return i[n][t]=s,i},Hg=(t,n,s)=>({...s,[n]:[...s[n].filter((o,i)=>i!==t)]}),Ug=t=>{const n={};return Object.entries(t).forEach(([s,o])=>{n[s]=o.filter(([i,r])=>!!i||!!r)}),n},qg=({tab:t,attributes:n})=>{const s=n.find(([o])=>o.toLowerCase()==="tag")?.[1]||t.previewTag;return e.jsxs(Wg,{children:["<",s,Sd(n).filter(([o])=>o!=="tag").map(([o,i],r)=>e.jsxs("span",{children:[e.jsxs($d,{children:[" ",o]}),!!i&&e.jsxs(e.Fragment,{children:[e.jsx(Cd,{children:"="}),e.jsx(Bs,{}),e.jsx(kd,{children:i}),e.jsx(Bs,{})]})]},r))," />"]})},Qg=({property:t,attributes:n,updateValue:s})=>{const o=t.tabs||[],[i,r]=m.useState(o.at(0)),a=Object.entries(n),[l,d]=a.find(([j])=>j===i.handle)||[i.handle,[]],{activeCell:h,setActiveCell:x,setCellRef:g,keyPressHandler:b}=Ln(d.length,2);if(m.useEffect(()=>{x(0,0)},[i?.handle]),!l||!d)return null;const y=(j,w,v)=>{x(v!==void 0?v+1:j,w),s(_g(l,n,v!==void 0?v:d.length-1))};return e.jsxs(Dg,{children:[e.jsx(Pg,{children:t.tabs?.map(j=>e.jsx("a",{className:T(j===i&&"active"),onClick:()=>r(j),children:u(j.label)},j.handle))}),e.jsxs(Bg,{children:[e.jsx(qg,{tab:i,attributes:d}),e.jsx(Og,{children:e.jsx(ps,{children:e.jsxs("tbody",{children:[!d.length&&e.jsxs(Ps,{children:[e.jsx(de,{children:e.jsx(nt,{type:"text",placeholder:u("Attribute"),onFocus:()=>{y(0,0)}})}),e.jsx(de,{children:e.jsx(nt,{type:"text",placeholder:u("Value"),onFocus:()=>{y(0,1)}})})]}),d.map(([j,w],v)=>e.jsxs(Ps,{children:[e.jsx(de,{children:e.jsx(nt,{type:"text",value:String(j),placeholder:u("Attribute"),autoFocus:h===`${v}:0`,ref:$=>g($,v,0),onFocus:()=>x(v,0),onKeyDown:b({onEnter:$=>{y($.shiftKey?v:d.length,0,$.shiftKey?v:void 0)}}),onChange:$=>{s(wa(v,l,[$.target.value,w],n))}})}),e.jsx(de,{children:e.jsx(nt,{type:"text",value:String(w),placeholder:u("Value"),autoFocus:h===`${v}:1`,ref:$=>g($,v,1),onFocus:()=>x(v,1),onKeyDown:b({onEnter:$=>{y($.shiftKey?v:d.length,1,$.shiftKey?v:void 0)}}),onChange:$=>{s(wa(v,l,[j,$.target.value],n))}})}),e.jsx(de,{$tiny:!0,children:e.jsx(Rt,{tabIndex:-1,onClick:()=>{s(Hg(v,l,n)),x(Math.max(v-1,0),0)},children:e.jsx(cs,{})})})]},v))]})})}),d.length>0&&e.jsx(ls,{label:"Add an attribute",onClick:()=>y(d.length,0,d.length-1)}),e.jsx("br",{}),e.jsx(Yt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})]})},Kg=c.div`
  min-height: 160px;
  max-height: 260px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: ${f.sm} ${f.md};

  background: ${p.white};
  box-shadow: ${oe.box};
  border-radius: ${k.lg};

  ${q};
`,Ld=c.div`
  ${We};
  font-size: 10px;
`,Vg=c.ul`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: ${f.xs};

  margin-top: ${f.xs};
`,Gg=c.li`
  padding: 1px 6px;

  font-family: monospace;
  font-size: 12px;

  background: ${p.gray100};
  color: ${p.gray800};
  border-radius: ${k.lg};
`,Yg=c.div`
  &:not(:last-child) {
    padding-bottom: 10px;
    margin-bottom: 10px;
    box-shadow: ${oe.bottom};
  }

  &.empty {
    ${Ld} {
      &:after {
        content: 'empty';

        padding: 2px 8px;
        margin-left: 10px;

        font-style: italic;

        background-color: ${p.gray050};
        border-radius: ${k.lg};
      }
    }
  }
`,Jg=({tab:t,attributes:n})=>{const s=Sd(n);return e.jsxs(Yg,{className:T(!s.length&&"empty"),children:[e.jsx(Ld,{children:u(t.label)}),!!s.length&&e.jsx(Vg,{children:s.map(([o,i],r)=>e.jsxs(Gg,{children:[e.jsx($d,{children:o}),!!i&&e.jsxs(e.Fragment,{children:[e.jsx(Cd,{children:"="}),e.jsx(Bs,{}),e.jsx(kd,{children:i}),e.jsx(Bs,{})]})]},r))})]})},Zg=({property:t,attributes:n})=>e.jsx(Kg,{children:t.tabs?.map(s=>e.jsx(Jg,{tab:s,attributes:n[s.handle]||[]},s.handle))}),$a=t=>{const n={};for(const s in t)n[s]=Object.entries(t[s]);return n},Ca=t=>{const n={};for(const s in t){n[s]={};for(const[o,i]of t[s])n[s][o]=i}return n},Xg=({value:t,property:n,updateValue:s})=>{const{size:o}=Hi(),[i,r]=m.useState($a(t)),a=as(i,1e3);m.useEffect(()=>{const d=Ca(a);Es(d,t)||s(d)},[a,s,t]),m.useEffect(()=>{const d=$a(t);r(h=>Es(d,h)?h:d)},[t]);const l=e.jsx(qe,{preview:e.jsx(Zg,{property:n,attributes:i}),onAfterEdit:()=>{const d=Ca(Ug(i));Es(d,t)||s(d)},children:e.jsx(Qg,{property:n,attributes:i,updateValue:r})});return o==="small"?l:e.jsx(_,{property:n,children:l})},ei=c.div`
  display: block;

  width: 18px;
  height: 18px;

  inset-inline-start: calc(50% - 9px);
  inset-block-start: 2px;

  border: 0 solid #e5e7eb;
  border-radius: 9px;

  background-color: ${p.white};
  box-shadow: inset 0 0 0 1px var(--_lightswitch-border-color);

  transition: transform 0.2s ${Ni.bounce.easeOut};

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
`,ef=c.div`
  position: relative;
  cursor: pointer;

  width: 34px;
  padding: 2px;

  border-radius: 11px;
  border: none;
  background-image: linear-gradient(to right, var(--gray-400), var(--gray-400));
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);

  transition: background-color 0.2s ${Ni.easeOut};

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

    ${ei} {
      transform: translateX(12px);
    }

    &.craft-5_8 {
      ${ei} {
        &:before {
          background-color: var(--enabled-color);
          mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3C!--! Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2024 Fonticons, Inc.--%3E%3Cpath d='M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7l233.4-233.3c12.5-12.5 32.8-12.5 45.3 0z'/%3E%3C/svg%3E");
          mask-repeat: none;
        }
      }
    }
  }

  &.error {
    background-image: linear-gradient(
      to right,
      var(--error-color),
      var(--error-color)
    );
  }
`,Jt=({enabled:t,errors:n,onClick:s})=>{const{is:o}=I.metadata.craft;return e.jsx(ef,{className:T(t&&"on",n&&"error",o.atLeast("5.8.0")&&"craft-5_8"),onClick:()=>s?.(!t),children:e.jsx(ei,{})})},Gs=c.div`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: ${f.sm};

  label {
    color: ${p.gray550};
    font-weight: bold;
  }
`,Fd=c.div`
  padding: 0 !important;
`,tf=c.div``,fn=({value:t,property:n,errors:s,context:o,updateValue:i})=>e.jsx(_,{property:n,errors:s,context:o,preContent:e.jsx(Gs,{children:e.jsx(Fd,{children:e.jsx(Jt,{enabled:t,onClick:r=>i(r),errors:s})})})}),Td=(t=!0)=>B({queryKey:["autosuggest","env"],queryFn:()=>N.get("/api/autosuggest/env").then(n=>n.data),enabled:t,staleTime:1/0,gcTime:1/0}),nf=t=>!!t,sf=()=>{const{data:t}=Td();return m.useMemo(()=>{const n=[{label:u("Yes"),value:"true",icon:e.jsx("span",{className:"status enabled","aria-hidden":"true"})},{label:u("No"),value:"false",icon:e.jsx("span",{className:"status white","aria-hidden":"true"})}],s=t?.map(i=>({label:i.label,children:i.data.map(r=>({label:r.name,value:r.name,hint:r.hint,icon:e.jsx("span",{className:T("status",nf(r.hint)?"enabled":"white"),"aria-hidden":"true"})}))}))??[];return[...n,...s]},[t])},of=({children:t})=>e.jsxs(rf,{className:"notice has-icon",children:[e.jsx("span",{className:"icon","aria-hidden":"true"}),e.jsx("span",{className:"visually-hidden",children:"Tip: "}),e.jsx("span",{children:t})]}),rf=c.p`
  margin-top: 5px;
`,af="This can be set to an environment variable with a boolean value (`yes`/`no`/`true`/`false`/`on`/`off`/`0`/`1`).",lf=({value:t,updateValue:n,property:s,errors:o,context:i})=>{const r=u(af),a=Vc(r),{data:l,isFetching:d}=Td(),h=sf();return["","0","no","off"].includes(String(t).toLowerCase())?t="false":["1","yes","on"].includes(String(t).toLowerCase())&&(t="true"),e.jsxs(_,{property:s,errors:o,context:i,children:[e.jsx(ce,{value:t,options:h,onChange:x=>n(x),loading:d&&!l,showSelectedIcon:!0,showHints:!0}),e.jsx(of,{children:a})]})},cf=c.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: stretch;

  width: 100%;
  padding-top: ${f.sm};
`,df=c.button`
  display: block;
  flex: 1;

  padding: ${f.xs} ${f.md};

  background-color: ${p.gray100};
  box-shadow: ${oe.right};
  box-sizing: border-box;

  &.active {
    color: ${p.white};
    background-color: ${p.gray500};
  }

  &:first-child {
    border-top-left-radius: ${k.lg};
    border-bottom-left-radius: ${k.lg};
  }

  &:last-child {
    border-top-right-radius: ${k.lg};
    border-bottom-right-radius: ${k.lg};

    box-shadow: none;
  }
`,Ji=({value:t,options:n,onClick:s})=>{const o=[];return n.forEach((i,r)=>{"value"in i&&o.push(e.jsx(df,{className:T(i.value===t&&"active"),onClick:()=>s(i.value),children:i.label},r))}),e.jsx(cf,{children:o})},uf=({value:t,property:n,errors:s,updateValue:o})=>{const{options:i}=n;return e.jsx(_,{property:n,errors:s,children:e.jsx(Ji,{value:t,options:i,onClick:r=>o(r)})})},pf=c.div`
  display: flex;
  align-items: center;
  gap: ${f.md};

  mark {
    padding: 0 ${f.xs};
    border-radius: ${k.lg};
    background: ${p.gray200};
  }
`,hf=c.div`
  .tagify__input {
    min-height: 80px;
    background-color: #fff;
    line-height: 2.2;
  }

  .tagify {
    --tag-bg: ${p.gray500};
    --tag-hover: ${p.gray600};
    --tag-text-color: ${p.white};
    --tags-border-color: ${p.gray500};
    --tag-remove-bg: ${p.red500};
    --tag-remove-btn-color: ${p.white};
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
`,xf=c.ul`
  min-width: 25%;
`,mf="Supported Operators Reference Guide",gf=[{title:"Arithmetic",items:[{name:"Addition",operator:"+"},{name:"Subtraction",operator:"-"},{name:"Multiplication",operator:"*"},{name:"Division",operator:"/"},{name:"Square Root",operator:"sqrt()"}]},{title:"Numeric",items:[{name:"Range",operator:".."}]},{title:"Bitwise",items:[{name:"AND",operator:"&"},{name:"OR",operator:"|"},{name:"XOR",operator:"^"}]},{title:"Ternary",items:[{name:"(a ? b : c)",operator:"?"}]},{title:"String",items:[{name:"Concatenation",operator:"~"}]},{title:"Logical",items:[{name:"Not",operator:"!, not"},{name:"And",operator:"&&, and"},{name:"Or",operator:"||, or"}]},{title:"Array",items:[{name:"Contains",operator:".."},{name:"Does not contain",operator:"not in"}]},{title:"Comparison",items:[{name:"Equal",operator:"=="},{name:"Identical",operator:"==="},{name:"Not equal",operator:"!="},{name:"Not identical",operator:"!=="},{name:"Less than",operator:"<"},{name:"Greater than",operator:">"},{name:"Less than or equal to",operator:"<="},{name:"Greater than or equal to",operator:">="}]}],ff={title:mf,operators:gf},bf=c.div`
  font-style: italic;
  font-weight: 500;
  font-size: 14px;
  color: ${p.gray400};
  break-inside: avoid;
`,yf=c.div`
  column-count: 4;
`,jf=c.div`
  font-size: 12px;
  break-inside: avoid;
  color: ${p.gray300};
  margin: 0 0 0.8rem;
  display: flex;
  flex-direction: column;
  gap: ${f.xs};

  > span {
    font-size: 14px;
    font-weight: 500;
  }
`,vf=c.div`
  display: flex;

  > mark {
    font-size: 12px;
    font-family: 'Courier New', Courier, monospace;
    padding: 0 ${f.xs};
    border-radius: ${k.md};
    background: ${p.gray100};
    color: ${p.gray500};
    margin-right: ${f.md};
    max-height: 20px;
  }
`,wf=()=>{const t=ff;return e.jsxs(e.Fragment,{children:[e.jsx(bf,{children:u(t.title)}),e.jsx(yf,{children:t.operators.map(n=>e.jsxs(jf,{children:[e.jsx("span",{children:u(n.title)}),n.items.map(s=>e.jsxs(vf,{children:[e.jsx("mark",{children:s.operator}),s.name&&e.jsx("span",{children:u(s.name)})]},s.operator))]},n.title))})]})},Ed=(t,n)=>t.replace(/field:([a-zA-Z0-9_]+)/g,(s,o)=>n==="<mark>...</mark>"?`<mark>${o}</mark>`:`[[${o}]]`),$f=t=>A(Re.all).filter(o=>t.availableFieldTypes.includes(o.typeClass)).map(o=>o.properties.handle),Cf=({value:t,property:n,updateValue:s})=>{const[o,i]=m.useState(""),r=$f(n),a=m.useRef(null),l=m.useCallback(h=>{s(h.detail.tagify.DOM.input.textContent.replace(/\u200B/g,"").replace(/\s+/g," ").trim())},[s]),d=h=>{if(!h)return;const x=a.current.createTagElem({value:h});a.current.injectAtCaret(x);const g=a.current.insertAfterTag(x,"");a.current.placeCaretAfterNode(g)};return m.useEffect(()=>{i(Ed(t))},[t]),e.jsxs(tt,{children:[e.jsxs(pf,{children:[e.jsx(xf,{children:e.jsx(ce,{emptyOption:u("Insert Field"),options:r.map(h=>({value:h,label:h})),onChange:d,value:""})}),e.jsxs("span",{children:["or type ",e.jsx("mark",{children:"@"})," to search on field handles"]})]}),e.jsx(hf,{children:e.jsx(Ol,{autoFocus:!1,tagifyRef:a,settings:{pattern:/@/,enforceWhitelist:!0,editTags:!1,pasteAsTags:!0,duplicates:!0,dropdown:{enabled:0,includeSelectedTags:!0},templates:{tag:function(h){return`
                <tag
                  title="${h.value}"
                  contenteditable="false"
                  spellcheck="false"
                  class="tagify__tag"
                  ${this.getAttributes(h)}
                >
                <x title="remove tag" class="tagify__tag__removeBtn"></x>
                  <div>
                    <p class="tagify__tag-text">
                      <span class="sr-only-value">field:</span>${h.value}</p>
                  </div>
                </tag>`}},whitelist:r},onChange:l,value:o})}),e.jsx(wf,{})]})},kf=c(Gt)`
  padding: ${f.sm};

  mark {
    padding: ${f.xs} ${f.sm};
    border-radius: ${k.lg};
    background: ${p.gray100};
  }
`,Sf=({value:t})=>e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(kf,{children:[!t&&e.jsx(vt,{children:u("Not configured yet")}),e.jsx("div",{style:{lineHeight:"2.0"},dangerouslySetInnerHTML:{__html:O.sanitize(Ed(t,"<mark>...</mark>"))}})]})}),Lf=({value:t,property:n,errors:s,updateValue:o})=>e.jsx(_,{property:n,errors:s,children:e.jsx(qe,{preview:e.jsx(Sf,{value:t}),children:e.jsx(Cf,{value:t,property:n,updateValue:o})})}),ka="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",zd=(t=8)=>{let n="";const s=ka.length;let o=0;for(;o<t;)n+=ka.charAt(Math.floor(Math.random()*s)),o+=1;return n},Nd=c.div`
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

    box-shadow: ${oe.bottom};
  }
`,Ff=c.div`
  columns: ${({$columns:t})=>t||1};

  label {
    display: block;
    max-width: 100%;
    padding: 0 10px;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`,Sa=[100,150,170,130],Zi=({value:t,options:n,selectAll:s,loading:o,uniqueId:i,columns:r,emptyMessage:a,onUpdate:l})=>{const d=t.length===n?.length;return i||(i=zd(6)),e.jsxs(e.Fragment,{children:[s&&e.jsxs(Nd,{children:[e.jsx("input",{id:`${i}-all`,type:"checkbox",className:"checkbox",checked:d,onChange:()=>{l(d?[]:n.filter(h=>!("children"in h)).map(h=>h.value))}}),e.jsx("label",{htmlFor:`${i}-all`,children:u("Select All")})]}),!o&&!n?.length&&a&&e.jsx(ss,{instructions:a}),e.jsxs(Ff,{$columns:r,children:[o&&Array.from({length:n?.length||4}).map((h,x)=>e.jsx(L,{width:Sa[x%Sa.length],height:15},x)),!o&&n?.map(h=>{if("children"in h)return null;const x=`${i}-${h?.label}`;return e.jsxs("div",{title:h.label,children:[e.jsx("input",{id:x,type:"checkbox",className:"checkbox",checked:t.includes(h.value),onChange:()=>{t.includes(h.value)?l(t.filter(g=>g!==h.value)):l([...t,h.value])}}),e.jsx("label",{htmlFor:x,children:h.label})]},h.value)})]})]})},Tf=({value:t,property:n,errors:s,updateValue:o})=>{const{handle:i,options:r,selectAll:a,columns:l}=n;return e.jsx(_,{property:n,errors:s,children:e.jsx(Zi,{value:t,selectAll:a,options:r,emptyMessage:u("No options available"),uniqueId:i,columns:l,onUpdate:o})})},Ef=({value:t,language:n,updateValue:s})=>e.jsx(tt,{children:e.jsx(Ki,{children:e.jsx(Wl,{height:500,value:t,defaultLanguage:n,onChange:s,onMount:()=>{document.body.classList.remove("underline-links")},options:{scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5}}})})}),zf=c.pre`
  font-size: 10px;
`,Nf=c(Gt)`
  padding: ${f.sm};
`,Mf=({value:t})=>e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(Nf,{children:[!t&&e.jsx(vt,{children:u("Not configured yet")}),e.jsx(zf,{children:t})]})}),If=({value:t,property:n,errors:s,updateValue:o})=>{const{language:i}=n;return e.jsx(_,{property:n,errors:s,children:e.jsx(qe,{preview:e.jsx(Mf,{value:t}),children:e.jsx(Ef,{value:t,language:i,updateValue:o})})})},Rf=c.div`
  display: flex;
  align-items: center;
  gap: ${f.sm};
`,Af=c.input`
  width: 40px;
  min-width: 40px;
  height: 32px;
  padding: 0;
  border: 1px solid ${p.gray200};
  border-radius: ${k.sm};
  background: ${p.white};
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 3px;
  }

  &::-webkit-color-swatch {
    border: 0;
    border-radius: ${k.sm};
  }

  &::-moz-color-swatch {
    border: 0;
    border-radius: ${k.sm};
  }
`,Df=c.input`
  width: 110px;
  min-width: 0;
  padding: 7px 10px;
  border: 1px solid ${p.gray200};
  border-radius: ${k.sm};
  background: ${p.white};
  color: ${p.gray800};
  font: inherit;

  &:focus {
    outline: 0;
    border-color: ${p.blue500};
    box-shadow: 0 0 0 1px ${p.blue500};
  }
`,Pf="#000000",Md=({value:t,onChange:n})=>{const[s,o]=m.useState(()=>fs(t));m.useEffect(()=>{o(fs(t))},[t]);const i=l=>{const d=l.currentTarget.value.toLowerCase();o(d),n(d)},r=l=>{const d=l.currentTarget.value,h=Id(d);if(h){o(h),n(h);return}o(d)},a=()=>{o(fs(t))};return e.jsxs(Rf,{children:[e.jsx(Af,{type:"color",value:fs(t),onChange:i}),e.jsx(Df,{type:"text",value:s,maxLength:7,placeholder:"#RRGGBB",spellCheck:!1,onBlur:a,onChange:r})]})},Bf=t=>`#${t.slice(1).split("").map(n=>n.repeat(2)).join("")}`,Id=t=>{if(!t)return null;const n=t.trim(),s=n.startsWith("#")?n:`#${n}`;return/^#[0-9a-f]{3}$/i.test(s)?Bf(s).toLowerCase():/^#[0-9a-f]{6}$/i.test(s)?s.toLowerCase():null},fs=t=>Id(t)||Pf,Of=({value:t,property:n,errors:s,updateValue:o,context:i})=>e.jsx(_,{property:n,errors:s,context:i,children:e.jsx(Md,{value:t,onChange:o})}),Rd=t=>e.jsx(R,{viewBox:"0 0 24 24",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h24v24h-24z"}),e.jsx("path",{d:"m8.547 19.767c2.399 1.065 5.256 1.007 7.703-.406 4.066-2.347 5.459-7.546 3.111-11.611l-.25-.433m-14.473 8.933c-2.347-4.065-.954-9.264 3.112-11.611 2.447-1.413 5.304-1.471 7.703-.406m-12.96 12.101 2.732.732.732-2.732m12.086-4.668.732-2.732 2.732.732",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2"})]})}),Ad={spinner:Fi`
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
  `},Wf=c.div`
  display: grid;
  grid-template-columns: auto 40px;
  gap: 5px;
`,Dd=c.button`
  padding: 0;

  background-color: #dfe5ec !important;

  svg {
    width: 20px;
    height: 20px;
  }

  &[disabled] {
    background-color: #eef2f8 !important;

    svg {
      fill: ${p.gray300};

      animation: ${Ad.spinner} 2s infinite;
      transform-origin: 50% 50%;
    }
  }
`,_f=c.div`
  position: relative;
`,Hf=c(Dd)`
  position: absolute;
  top: -20px;
  right: 0;

  width: 40px;
`,Uf=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const{formId:r}=K(),{handle:a,source:l,parameterFields:d}=n,h={formId:r};d&&Object.entries(d).forEach(([j,w])=>{h[w]=an(i,j)});const{data:x,isFetching:g,isFetched:b,refetch:y}=B({queryKey:["dynamic-select",l,h],queryFn:()=>N.get(l,{params:h}).then(j=>j.data),staleTime:1/0,gcTime:1/0});return m.useEffect(()=>{g||!b||x!==void 0&&(t.length>0||o([]))},[x,b,g,o,t.length]),e.jsx(_,{property:n,errors:s,children:e.jsxs(_f,{children:[e.jsx(Hf,{className:"btn",disabled:g,onClick:()=>{h.refresh="true",y(),delete h.refresh},children:e.jsx(Rd,{})}),e.jsx(Zi,{value:t,options:x,loading:g,emptyMessage:u("No options available"),uniqueId:a,onUpdate:o})]})})},qf=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const{formId:r}=K(),{source:a,parameterFields:l,emptyOption:d}=n,h={formId:r};l&&Object.entries(l).forEach(([j,w])=>{h[w]=an(i,j)});const{data:x,isFetching:g,isFetched:b,refetch:y}=B({queryKey:["dynamic-select",a,h],queryFn:()=>N.get(a,{params:h}).then(j=>j.data),staleTime:1/0,gcTime:1/0});return m.useEffect(()=>{if(!(g||!b)&&x!==void 0&&!zc(x,t))if(d)o("");else{const j=Nc(x);o(j)}},[x,b,g,o,t,d]),e.jsx(_,{property:n,errors:s,context:i,children:e.jsxs(Wf,{children:[e.jsx(ce,{loading:g,value:t,onChange:o,emptyOption:d,options:x}),e.jsx(Dd,{className:"btn",disabled:g,onClick:()=>{h.refresh="true",y(),delete h.refresh},children:e.jsx(Rd,{})})]})})},Qf=({value:t,property:n,errors:s,updateValue:o})=>{const i=A(Re.all),r=Kt(),a=i.filter(l=>{if(!n.implements)return!0;const d=r(l.typeClass);return d?n.implements.some(h=>d.implements?.includes(h)):!1}).map(l=>({value:l.uid,label:l.properties.label}));return e.jsx(_,{property:n,errors:s,children:e.jsx(ce,{onChange:o,value:t,options:a,emptyOption:n.emptyOption})})},Kf=(t,n)=>s=>{const{uid:o}=t,i={};n.properties.forEach(r=>{const a=t.properties[r.handle];a?i[r.handle]=a:i[r.handle]=r.value}),s(fe.batchEdit({uid:o,typeClass:n.typeClass,properties:i}))},Vf={type:Kf};var Xi=(t=>(t.Checkboxes="Solspace\\Freeform\\Fields\\Implementations\\CheckboxesField",t.Checkbox="Solspace\\Freeform\\Fields\\Implementations\\CheckboxField",t.Dropdown="Solspace\\Freeform\\Fields\\Implementations\\DropdownField",t.Email="Solspace\\Freeform\\Fields\\Implementations\\EmailField",t.FileUpload="Solspace\\Freeform\\Fields\\Implementations\\FileUploadField",t.Hidden="Solspace\\Freeform\\Fields\\Implementations\\HiddenField",t.Html="Solspace\\Freeform\\Fields\\Implementations\\HtmlField",t.MultipleSelect="Solspace\\Freeform\\Fields\\Implementations\\MultipleSelectField",t.Number="Solspace\\Freeform\\Fields\\Implementations\\NumberField",t.Radios="Solspace\\Freeform\\Fields\\Implementations\\RadiosField",t.Textarea="Solspace\\Freeform\\Fields\\Implementations\\TextareaField",t.Text="Solspace\\Freeform\\Fields\\Implementations\\TextField",t.Calculation="Solspace\\Freeform\\Fields\\Implementations\\Pro\\CalculationField",t.Confirmation="Solspace\\Freeform\\Fields\\Implementations\\Pro\\ConfirmationField",t.Datetime="Solspace\\Freeform\\Fields\\Implementations\\DatetimeField",t.FileDragAndDrop="Solspace\\Freeform\\Fields\\Implementations\\Pro\\FileDragAndDropField",t.Image="Solspace\\Freeform\\Fields\\Implementations\\Pro\\ImageField",t.Cards="Solspace\\Freeform\\Fields\\Implementations\\Pro\\CardsField",t.Group="Solspace\\Freeform\\Fields\\Implementations\\Pro\\GroupField",t.Invisible="Solspace\\Freeform\\Fields\\Implementations\\Pro\\InvisibleField",t.OpinionScale="Solspace\\Freeform\\Fields\\Implementations\\Pro\\OpinionScaleField",t.Password="Solspace\\Freeform\\Fields\\Implementations\\Pro\\PasswordField",t.Phone="Solspace\\Freeform\\Fields\\Implementations\\Pro\\PhoneField",t.Rating="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RatingField",t.Regex="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RegexField",t.RichText="Solspace\\Freeform\\Fields\\Implementations\\Pro\\RichTextField",t.Signature="Solspace\\Freeform\\Fields\\Implementations\\Pro\\SignatureField",t.Table="Solspace\\Freeform\\Fields\\Implementations\\Pro\\TableField",t.Website="Solspace\\Freeform\\Fields\\Implementations\\Pro\\WebsiteField",t))(Xi||{});const Gf=(t,n)=>(s,o)=>{Yf(o(),s,t,n)},Yf=(t,n,s,o)=>{const i=o.layoutUid,r=V();if(s.typeClass===Xi.Group){const a=s.properties.layout,l=V(),d=t.layout.layouts.find(x=>x.uid===a);d&&n(vn.add({...d,uid:l}));const h=t.layout.rows.filter(x=>x.layoutUid===a).sort((x,g)=>x.order-g.order);for(const x of h){const g=V();n(Ge.add({layoutUid:l,uid:g})),t.layout.fields.filter(b=>b.rowUid===x.uid).forEach(b=>{n(fe.duplicate({uid:V(),rowUid:g,field:b}))})}n(Ge.add({layoutUid:i,uid:r,order:o?.order+1})),n(fe.duplicate({uid:V(),rowUid:r,field:{...s,properties:{...s.properties,layout:l}}}));return}n(Ge.add({layoutUid:i,uid:r,order:o?.order+1})),n(fe.duplicate({uid:V(),rowUid:r,field:s}))},Jf=(t,n)=>t.order-n.order,Je={current:t=>t.layout.pages.find(n=>n.uid===t.context.page),count:t=>t.layout.pages.length,all:J(t=>t.layout.pages,t=>[...t].sort(Jf)),one:t=>n=>n.layout.pages.find(s=>s.uid===t),pageIndex:t=>n=>n.layout.pages.findIndex(s=>s.uid===t)},Vn={inLayout:J(t=>t.layout.rows,(t,n)=>n,(t,n)=>[...t].filter(s=>s.layoutUid===n).sort((s,o)=>s.order-o.order))},xt={one:J(t=>t.layout.layouts,(t,n)=>n,(t,n)=>t.find(s=>s.uid===n)),currentPageLayout:J(t=>Je.current(t),t=>t.layout.layouts,(t,n)=>n.find(s=>s.uid===t?.layoutUid)),pageLayout:J(t=>t.layout.layouts,(t,n)=>n,(t,n)=>t.find(s=>s.uid===n)),cartographed:{layoutFieldList:J(t=>t.layout.fields,(t,n)=>t.layout.layouts.find(s=>s.uid===n),t=>t,(t,n,s)=>{const o=Vn.inLayout(s,n?.uid),i=[];return o.forEach(r=>{i.push(...t.filter(a=>a.rowUid===r.uid))}),i}),pageFieldList:J(t=>t.layout.pages,t=>t.layout.layouts,t=>t.layout.rows,t=>t.layout.fields,(t,n,s,o)=>{const i=[];return t.forEach(r=>{const a=n.find(h=>h.uid===r.layoutUid),l=s.filter(h=>h.layoutUid===a?.uid).sort((h,x)=>h.order-x.order),d=[];l.forEach(h=>{d.push(...o.filter(x=>x.rowUid===h.uid))}),i.push({page:r.uid,fields:d})}),i}),fullLayoutList:J(t=>t.layout.pages,t=>t.layout.layouts,t=>t.layout.rows,t=>t.layout.fields,(t,n,s,o)=>{const i=[];return t.forEach(r=>{const a=n.find(h=>h.uid===r.layoutUid),l=s.filter(h=>h.layoutUid===a?.uid).sort((h,x)=>h.order-x.order),d=[];l.forEach(h=>{const x=[];x.push(...o.filter(g=>g.rowUid===h.uid)),d.push(x)}),i.push(d)}),i}),fullLayoutList_:t=>{const n=Je.all(t),s=[];return n.forEach(o=>{const i=t.layout.layouts.find(l=>l.uid===o.layoutUid),r=Vn.inLayout(t,i?.uid),a=[];r.forEach(l=>{const d=[];t.layout.fields.filter(h=>h.rowUid===l.uid).forEach(h=>{d.push(h)}),a.push(d)}),s.push(a)}),s}}},Ys=(t,n)=>{const s=[];t.layout.rows.forEach(o=>{t.layout.fields.filter(r=>r.rowUid===o.uid).length===0&&s.push(o.uid)}),s.forEach(o=>{n(Ge.remove(o))})},Zf=t=>(n,s)=>{const{field:o,order:i}=t;let{layoutUid:r}=t;const a=V();r||(r=xt.currentPageLayout(s())?.uid),n(Ge.add({layoutUid:r,uid:a,order:i})),n(fe.moveTo({uid:o.uid,rowUid:a,position:0})),Ys(s(),n)},Xf=(t,n,s)=>(o,i)=>{o(fe.moveTo({uid:t.uid,rowUid:n.uid,position:s})),Ys(i(),o)},e4={newRow:Zf,existingRow:Xf},t4=t=>(n,s)=>{if(I.editions.is(le.Express)&&s().layout.fields.length>=I.limits.fields)return;const{fieldType:o,row:i}=t;let{layoutUid:r}=t;if(!r){const d=s();i?r=i.layoutUid:r=xt.currentPageLayout(d)?.uid}const a=V(),l=V();n(Ge.add({layoutUid:r,uid:l,order:i?.order})),n(fe.add({fieldType:o,uid:a,rowUid:l}))},n4=t=>n=>{const{fieldType:s,row:o,order:i}=t,r=V();n(fe.add({fieldType:s,uid:r,rowUid:o.uid,order:i}))},s4={newRow:t4,existingRow:n4},o4=t=>(n,s)=>{Pd(s(),n,t),Ys(s(),n)},Pd=(t,n,s)=>{if(s.typeClass===Xi.Group){const o=t.layout.layouts.find(r=>r.uid===s.properties.layout);if(!o)return;t.layout.rows.filter(r=>r.layoutUid===o.uid).forEach(r=>{t.layout.fields.filter(l=>l.rowUid===r.uid).forEach(l=>{Pd(t,n,l)}),n(Ge.remove(r.uid))}),n(vn.remove(o.uid))}n(fe.remove(s.uid))},Oe={move:{newField:s4,existingField:e4},remove:o4,duplicate:Gf,change:Vf},i4=({property:t,context:n})=>{const s=H(),o=Kt(),{data:i}=Oi(),r=n;return r?.typeClass?e.jsx(Le,{value:r.typeClass,property:{type:Y.Select,handle:"typeClass",label:u(t.label),instructions:u(t.instructions),options:i.filter(a=>a.visible!==!1).map(a=>({label:u(a.name),value:a.typeClass}))},updateValue:a=>{confirm(u("Are you sure? You might potentially lose important data."))&&s(Oe.change.type(r,o(a)))}}):null},r4=()=>null,a4=({value:t,property:n,errors:s,updateValue:o,autoFocus:i,context:r})=>{const{handle:a,min:l,max:d,unsigned:h,step:x=1}=n,g=y=>{o(Yr(y.target.value,{min:l,max:d,unsigned:h}))},b=y=>{o(Yr(y.target.value))};return e.jsx(_,{property:n,errors:s,context:r,children:e.jsx("input",{id:a,type:"number",className:"text fullwidth",value:t??"",autoFocus:i,step:x,onChange:b,onBlur:g})})},l4=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"})}),c4=t=>G({opacity:t?1:0,transform:t?"rotate(0deg)":"rotate(-30deg)",config:{tension:500}}),d4=t=>G({backgroundColor:t?p.gray050:p.white,config:{tension:500}}),u4=c.div`
  margin-top: -9px;
  margin-bottom: -9px;

  &.errors {
    span {
      color: ${p.red500};
    }
  }

  input {
    padding: 7.75px ${f.sm};
    font-size: 18px;
    font-weight: bold;

    margin-left: -9px;
  }
`,p4=c(W.button)`
  position: absolute;
  top: 0;
  right: -25px;

  opacity: 0;

  width: 20px;
  height: 20px;

  > svg {
    width: 100%;
    height: 100%;

    color: ${p.gray400};
  }
`;c(W.button)`
  position: absolute;
  top: 0;
  right: -50px;

  opacity: 0;

  width: 20px;
  height: 20px;

  > svg {
    width: 100%;
    height: 100%;

    color: ${p.gray400};
  }
`;const h4=c(W.h1)`
  cursor: pointer;

  min-height: 10px;

  margin: 0 0 0 -8px;
  padding: ${f.sm} 40px ${f.sm} ${f.sm};

  border: 0;
  border-radius: ${k.lg};

  > span {
    position: relative;
    display: inline-block;

    > span:empty:after {
      content: 'No Title';

      color: ${p.gray300};
      font-style: italic;
    }
  }
`,x4=({value:t,property:n,errors:s,updateValue:o})=>{const[i,r]=m.useState(!1),[a,l]=m.useState(!1),{handle:d}=n,h=m.useRef(null),x=d4(i),g=c4(i);return e.jsxs(u4,{className:T(s?.length>0&&"errors"),children:[a&&e.jsx("input",{id:d,ref:h,type:"text",className:"text fullwidth",value:t||"",onChange:b=>o(b.target.value),onBlur:()=>l(!1),onKeyDown:b=>{b.key==="Enter"&&l(!1)}}),!a&&e.jsx(h4,{style:x,onClick:()=>{l(!0),r(!1),setTimeout(()=>{h.current?.focus()},3)},onMouseEnter:()=>r(!0),onMouseLeave:()=>r(!1),children:e.jsxs("span",{children:[e.jsx("span",{children:t}),e.jsx(p4,{style:g,children:e.jsx(l4,{})})]})}),e.jsx(Ks,{errors:s})]})},m4=c.div`
  display: flex;
`,Bd=c.input`
  width: 100%;
  --focus-ring: 0;
`,g4=c(Bd)`
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
`,f4=c(Bd)`
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`,b4=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const[r,a]=t||[null,null],l=i.properties?.allowNegative?null:0;return e.jsx(_,{property:n,errors:s,children:e.jsxs(m4,{children:[e.jsx("div",{children:e.jsx(g4,{id:"min",value:r===null?"":r,type:"number",min:l,className:"text",placeholder:"Min",onChange:({target:d})=>{const h=d.value!==""?Number(d.value):null;o([h,a])}})}),e.jsx("div",{children:e.jsx(f4,{id:"max",value:a===null?"":a,type:"number",min:l,className:"text",placeholder:"Max",onChange:({target:d})=>{const h=d.value!==""?Number(d.value):null;o([r,h])}})})]})})},y4=(t,n)=>[...t.slice(0,n+1),{id:zd(6),label:""},...t.slice(n+1)],j4=c.li`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  padding: 12px 16px;

  background-color: ${p.white};
  border: 1px solid #eee;
  border-radius: 8px;

  &:hover {
    border-color: ${p.gray300};
  }
`,v4=c.textarea`
  // prevent resize of text area
  resize: none;
`,La=c.button`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 2px;

  fill: ${p.gray400};
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.2);
  }

  &.active {
    fill: ${p.blue500};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,w4=c.div`
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

    border: 1px solid ${p.gray300};
    border-radius: 100%;

    font-size: 10px;

    &.filled {
      background-color: ${p.teal600};
      border: 1px solid ${p.teal600};
      color: ${p.white};
    }
  }
`,$4=c.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 8px;
`,C4=c.div`
  width: 100%;
  padding: 0;

  text-align: left;

  &.error {
    color: ${p.red500};
    fill: ${p.red700};
  }

  &.success {
    color: ${p.teal500};
    fill: ${p.teal500};
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

    background-color: ${p.red050};
    border: 1px solid ${p.red500};
    border-radius: 5px;
  }
`,k4=c.div`
  border: 1px solid ${p.inputBorder};
  border-radius: 3px;
`,S4=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M448 96L416 96C398.3 96 384 110.3 384 128C384 145.7 398.3 160 416 160L448 160C465.7 160 480 174.3 480 192L480 229.5C480 255 490.1 279.4 508.1 297.4L530.7 320L508.1 342.6C490.1 360.6 480 385 480 410.5L480 448C480 465.7 465.7 480 448 480L416 480C398.3 480 384 494.3 384 512C384 529.7 398.3 544 416 544L448 544C501 544 544 501 544 448L544 410.5C544 402 547.4 393.9 553.4 387.9L598.7 342.6C611.2 330.1 611.2 309.8 598.7 297.3L553.4 252C547.4 246 544 237.9 544 229.4L544 191.9C544 138.9 501 95.9 448 95.9zM192 96C139 96 96 139 96 192L96 229.5C96 238 92.6 246.1 86.6 252.1L41.4 297.4C28.9 309.9 28.9 330.2 41.4 342.7L86.7 388C92.7 394 96.1 402.1 96.1 410.6L96 448C96 501 139 544 192 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L192 480C174.3 480 160 465.7 160 448L160 410.5C160 385 149.9 360.6 131.9 342.6L109.3 320L131.9 297.4C149.9 279.4 160 255 160 229.5L160 192C160 174.3 174.3 160 192 160L224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L192 96z"})}),L4=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"})}),F4=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M152 160C174.1 160 192 177.9 192 200L192 248C192 270.1 174.1 288 152 288L104 288C81.9 288 64 270.1 64 248L64 200C64 177.9 81.9 160 104 160L152 160zM344 288L296 288C273.9 288 256 270.1 256 248L256 200C256 177.9 273.9 160 296 160L344 160C366.1 160 384 177.9 384 200L384 248C384 270.1 366.1 288 344 288zM536 288L488 288C465.9 288 448 270.1 448 248L448 200C448 177.9 465.9 160 488 160L536 160C558.1 160 576 177.9 576 200L576 248C576 270.1 558.1 288 536 288zM536 480L488 480C465.9 480 448 462.1 448 440L448 392C448 369.9 465.9 352 488 352L536 352C558.1 352 576 369.9 576 392L576 440C576 462.1 558.1 480 536 480zM344 352C366.1 352 384 369.9 384 392L384 440C384 462.1 366.1 480 344 480L296 480C273.9 480 256 462.1 256 440L256 392C256 369.9 273.9 352 296 352L344 352zM152 480L104 480C81.9 480 64 462.1 64 440L64 392C64 369.9 81.9 352 104 352L152 352C174.1 352 192 369.9 192 392L192 440C192 462.1 174.1 480 152 480z"})}),T4=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM404.4 276.7L324.4 404.7C320.2 411.4 313 415.6 305.1 416C297.2 416.4 289.6 412.8 284.9 406.4L236.9 342.4C228.9 331.8 231.1 316.8 241.7 308.8C252.3 300.8 267.3 303 275.3 313.6L302.3 349.6L363.7 251.3C370.7 240.1 385.5 236.6 396.8 243.7C408.1 250.8 411.5 265.5 404.4 276.8z"})}),E4=t=>{const[n,s]=m.useState(!1),{removeCard:o}=t,i=M4(t.card.metadata);return e.jsxs(j4,{children:[e.jsxs($4,{children:[e.jsx(La,{onClick:()=>s(!n),className:T(n&&"active"),children:e.jsx(he,{title:u("Custom Metadata"),delay:[500,0],children:e.jsxs(w4,{children:[e.jsx("span",{className:T(i>0&&"filled"),children:i}),e.jsx(S4,{})]})})}),e.jsx(La,{className:"drag-handle",title:u("Reorder Card"),children:e.jsx(F4,{})}),e.jsx(Sn,{active:!0,onClick:o,title:u("Remove Card")})]}),n&&e.jsx(N4,{...t}),!n&&e.jsx(z4,{...t})]})},z4=({card:t,updateCard:n})=>{const{label:s,value:o,assetId:i,description:r}=t;return e.jsxs(e.Fragment,{children:[e.jsx(Ee,{label:"Image",children:e.jsx(Yi,{criteria:{kind:["image"]},value:i?[i]:[],limit:1,onUpdate:a=>n({...t,assetId:a[0]??void 0})})}),e.jsx(Ee,{label:"Title",children:e.jsx("input",{type:"text",className:"text fullwidth",value:s,onChange:a=>n({...t,label:a.target.value})})}),e.jsx(Ee,{label:"Value",instructions:"Enter a value to use when this card is selected.",children:e.jsx("input",{type:"text",className:"text fullwidth",value:o,onChange:a=>n({...t,value:a.target.value})})}),e.jsx(Ee,{label:"Description",children:e.jsx(v4,{rows:4,className:"text fullwidth",value:r,onChange:a=>n({...t,description:a.target.value})})})]})},N4=({card:t,updateCard:n})=>{const s=JSON.stringify(t.metadata,null,2),[o,i]=m.useState("pending"),[r,a]=m.useState(),[l,d]=m.useState(s),h=as(l,1e3);return m.useEffect(()=>{d(x=>x===s?x:s)},[s]),m.useEffect(()=>{if(h){a(void 0),i("pending");try{const x=JSON.parse(h),g=JSON.stringify(x,null,2);if(i("success"),g===s)return;n({...t,metadata:x})}catch(x){i("error"),a(x instanceof Error?x.message:"Invalid JSON")}}},[h,s,n,t]),e.jsxs(e.Fragment,{children:[e.jsx(Ee,{label:"Metadata",instructions:"Enter metadata in JSON format. Access it in your template with `card.metadata.yourProperty`",children:e.jsx(k4,{children:e.jsx(Wl,{height:200,value:l,defaultLanguage:"json",onChange:x=>d(x),onMount:()=>{document.body.classList.remove("underline-links")},options:{folding:!1,glyphMargin:!1,renderLineHighlight:"none",minimap:{enabled:!1},lineNumbers:"on",lineNumbersMinChars:1,scrollbar:{verticalScrollbarSize:5,horizontalScrollbarSize:5}}})})}),o!=="pending"&&e.jsxs(C4,{className:o,children:[e.jsxs("span",{children:[o==="error"&&e.jsx(L4,{}),o==="error"&&"Invalid JSON",o==="success"&&e.jsx(T4,{}),o==="success"&&"JSON Valid"]}),!!r&&e.jsx("div",{className:"code",children:r})]})]})},M4=t=>Array.isArray(t)?t.length:t&&typeof t=="object"?Object.keys(t).length:typeof t=="boolean"||typeof t=="string"?1:0,I4=({onClick:t})=>e.jsx(R4,{onClick:t,children:u("Add Card")}),R4=c.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 10px;

  border: 2px dashed ${p.gray200};
  border-radius: 10px;

  text-align: center;
  font-size: 18px;
  color: ${p.gray400};

  user-select: none;

  &:hover {
    background-color: ${p.gray100};
  }
`,A4=c(tt)`
  width: 60vw;
  min-width: 800px;
`,D4=c(Vi)``,P4=c.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
`,B4=({value:t,property:n,updateValue:s,context:o})=>{const i=m.useRef(null),{updateTranslation:r,getTranslation:a,willTranslate:l}=ye(o),d=l(n.handle),h=a(n.handle,t);return m.useEffect(()=>{if(!i.current)return;const x=ze.create(i.current,{animation:150,ghostClass:"sortable-ghost",handle:".drag-handle",onEnd:g=>{const b=[...t],[y]=b.splice(g.oldIndex,1);b.splice(g.newIndex,0,y),s(b)}});return()=>{x.destroy()}},[t,s]),e.jsxs(A4,{children:[e.jsx(D4,{children:e.jsxs(P4,{ref:i,children:[t.map((x,g)=>e.jsx(E4,{card:x,removeCard:()=>{const b=[...t];b.splice(g,1),s(b)},updateCard:b=>{if(d){const y=[...h];y[g]=b,r(n.handle,y)}else{const y=[...t];y[g]=b,s(y)}}},x.id)),e.jsx(I4,{onClick:()=>s(y4(t,t.length))})]})}),e.jsx(Yt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},er=c.div`
  position: absolute;
  top: calc(50% - 15px);
  left: 0;
  right: 0;

  opacity: 1;
  transition: opacity 0.2s ease-out;

  color: ${p.gray200};
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  text-align: center;
`,O4=c.div`
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

    ${We};
    color: ${p.gray300};
    font-size: 11px;
    text-align: center;
  }

  &:hover {
    &:after {
      opacity: 0.5;
    }

    ${er} {
      opacity: 0;
    }
  }
`;c.div`
  display: grid;
  grid-template-columns: 60% 40%;

  margin-bottom: ${f.md};

  ${We};
  font-size: 11px;
`;const W4=c.div`
  height: 200px;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;

  padding: 0 ${f.md};

  background: ${p.white};
  box-shadow: ${oe.box};
  border-radius: ${k.lg};

  ${q};
`,_4=c.div`
  position: relative;

  display: grid;
  grid-template-columns: auto 100px;
  gap: 10px;

  justify-items: stretch;
  align-items: center;

  border-bottom: 1px solid ${p.gray100};

  &:after {
    content: attr(data-title);

    position: absolute;
    left: calc(100% - 105px);
    bottom: -7px;

    padding: 0 5px;
    background: ${p.white};

    ${We};
    font-size: 8px;
  }

  > div {
    white-space: nowrap;
    overflow: hidden;

    padding: 7px ${f.xs} 7px 0;

    &:last-child {
      padding-right: 0;
    }
  }
`,H4=c.div`
  &:empty {
    &:after {
      content: attr(data-empty);
      color: ${p.gray200};
      font-size: 12px;
      font-style: italic;
    }
  }
`,tr=(t=[],n)=>B({queryKey:["assets","urls",t?.sort(),n],queryFn:()=>N.get(`/api/assets/urls?ids=${t.join(",")}&transform=${n||""}`).then(s=>s.data),staleTime:1/0,gcTime:1/0,enabled:t.length>0}),U4=c.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  min-height: 60px;
`,q4=c.li`
  display: grid;
  column-gap: 5px;
  row-gap: 0;
  grid-template-columns: 50px auto;
  grid-template-areas:
    'icon label'
    'icon description';

  padding: 5px;

  background: ${p.white};
  border: 1px solid ${p.gray200};
  border-radius: 5px;
`,Q4=c.div`
  grid-area: icon;
  align-self: start;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid ${p.gray200};
  border-radius: 5px;
  overflow: hidden;
`,K4=c.div`
  grid-area: label;

  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
`,V4=c.div`
  grid-area: description;

  color: ${p.gray300};
  font-size: 12px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
`,G4=c.div`
  width: 20px;
  height: 20px;
  margin: 8px 0;

  svg {
    animation: spin 1s linear infinite;
    fill: ${p.gray400};
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`,Y4=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 160C496 151.2 488.8 144 480 144L160 144zM96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256C206.3 256 192 241.7 192 224C192 206.3 206.3 192 224 192zM360 264C368.5 264 376.4 268.5 380.7 275.8L460.7 411.8C465.1 419.2 465.1 428.4 460.8 435.9C456.5 443.4 448.6 448 440 448L200 448C191.1 448 182.8 443 178.7 435.1C174.6 427.2 175.2 417.6 180.3 410.3L236.3 330.3C240.8 323.9 248.1 320.1 256 320.1C263.9 320.1 271.2 323.9 275.7 330.3L292.9 354.9L339.4 275.9C343.7 268.6 351.6 264.1 360.1 264.1z"})}),J4=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})}),Z4=({cards:t,transform:n})=>{const s=t.map(r=>r.assetId).filter(Boolean),{data:o,isFetching:i}=tr(s,n);return e.jsxs(hd,{"data-edit":u("Click to edit data"),children:[!t.length&&e.jsx(er,{children:u("No cards yet. Click Add Card to create one.")}),e.jsx(U4,{children:t.map((r,a)=>e.jsxs(q4,{"data-title":"card",children:[e.jsx(Q4,{children:e.jsx(X4,{assetUrl:o?.[r.assetId],loading:i})}),e.jsx(K4,{children:r.label||u("No title")}),e.jsx(V4,{children:r.description||u("No description")})]},a))})]})},X4=({assetUrl:t,loading:n})=>n?e.jsx(G4,{children:e.jsx(J4,{})}):t===void 0?e.jsx(Y4,{}):e.jsx("img",{src:t.src,alt:t.title||u("No title")}),e5=({value:t,property:n,errors:s,updateValue:o,context:i})=>e.jsx(_,{property:n,errors:s,context:i,children:e.jsx(qe,{preview:e.jsx(Z4,{cards:t,transform:i?.properties?.transform}),children:e.jsx(B4,{value:t,updateValue:o,property:n,context:i})})}),t5=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"})});var ti=(t=>(t.EmailMarketing="email-marketing",t.Crm="crm",t.Elements="elements",t.Captchas="captchas",t.PaymentGateways="payment-gateways",t.Webhooks="webhooks",t.Singles="single",t.Other="other",t.Ai="ai",t))(ti||{}),Te=(t=>(t.Relation="relation",t.Custom="custom",t.Preset="preset",t))(Te||{});const n5=t=>e.jsx(R,{viewBox:"0 0 576 512",...t,children:e.jsx("path",{d:"M266.2 4.7C273 1.6 280.5 0 288 0s15 1.6 21.8 4.7l217.4 97.5c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 251.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 153.9C38.6 149.3 32 139.2 32 128s6.6-21.3 16.8-25.9L266.2 4.7zM288 32c-3 0-6 .6-8.8 1.9L69.3 128l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-210-94.1C294 32.6 291 32 288 32zM48.8 358.1l45.9-20.6 39.1 17.5L69.3 384l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-64.5-28.9 39.1-17.5 45.9 20.6c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 507.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 409.9C38.6 405.3 32 395.2 32 384s6.6-21.3 16.8-25.9zM94.7 209.5l39.1 17.5L69.3 256l210 94.1c2.8 1.2 5.7 1.9 8.8 1.9s6-.6 8.8-1.9l210-94.1-64.5-28.9 39.1-17.5 45.9 20.6c10.2 4.6 16.8 14.7 16.8 25.9s-6.6 21.3-16.8 25.9L309.8 379.3c-6.9 3.1-14.3 4.7-21.8 4.7s-15-1.6-21.8-4.7L48.8 281.9C38.6 277.3 32 267.2 32 256s6.6-21.3 16.8-25.9l45.9-20.6z"})}),s5=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M64 496c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48H204.1c1.3 0 2.6 .1 3.9 .2V136c0 22.1 17.9 40 40 40H367.8c.2 1.3 .2 2.6 .2 3.9V448c0 26.5-21.5 48-48 48H64zM358.6 157.3c.9 .9 1.7 1.8 2.4 2.7H248c-13.3 0-24-10.7-24-24V22.9c1 .8 1.9 1.6 2.7 2.4L358.6 157.3zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V179.9c0-12.7-5.1-24.9-14.1-33.9L238.1 14.1c-9-9-21.2-14.1-33.9-14.1H64zm40 256c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104z"})}),Od=(t,n)=>{const{getState:s}=Mi(),o=Kt(),i=A(xt.cartographed.pageFieldList),r=A(Je.all);return m.useMemo(()=>i.map(a=>({label:r.find(l=>l.uid===a.page)?.label,icon:e.jsx(s5,{}),children:a.fields.map(l=>{if(t?.includes(l.uid))return null;const d=o(l.typeClass);if(n?.includes(d?.type))return null;if(d?.type==="group"){const h=xt.cartographed.layoutFieldList(s(),l.properties.layout);return{label:l.properties.label,icon:e.jsx(n5,{}),children:h.map(x=>({label:x.properties.label,value:x.uid}))}}return{value:l.uid,label:l.properties.label}}).filter(Boolean)})),[i,r,t,n,o,s])},o5=({value:t,onChange:n})=>{const s=Od();return e.jsx(ce,{options:s,emptyOption:u("Do not map this field"),value:t,onChange:n})},i5=t=>e.jsx(R,{viewBox:"0 0 640 512",...t,children:e.jsx("path",{d:"M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"})}),r5=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM184 72c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L184 72zm0 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-304 0zm0 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l304 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-304 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"})}),a5=t=>e.jsx(R,{viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"})}),l5=c.button`
  position: absolute;
  top: 0;
  right: 0;

  font-size: 16px;

  &[disabled] > svg {
    fill: ${p.gray300};

    animation: ${Ad.spinner} 2s infinite;
    transform-origin: 50% 50%;
  }
`,c5=c.div`
  display: grid;
  align-items: center;
  gap: ${f.sm};

  grid-template-columns: auto min-content 400px;

  padding: 2px 0;

  > div:first-child {
    flex-grow: 1;
  }

  > div:last-child {
    flex-basis: 300px;
  }
`,d5=c.div`
  max-width: 1000px;
  max-height: 454px;

  overflow-y: auto;
  overflow-x: hidden;

  border: 1px solid rgb(205 216 228 / 50%);
  border-radius: 5px;

  padding: ${f.sm} ${f.lg};

  ${q};
`,u5=c.div`
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

    background-color: ${p.gray100};
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

      color: ${p.error};
    }
  }
`,p5=c.div`
  display: flex;
`,bs="8px",So=c.button`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 34px;
  height: 28px;

  fill: ${p.gray550};
  background-color: ${p.elements.dropdown};

  &.active {
    fill: ${p.gray050};
    background-color: ${p.gray550};
  }

  &:first-child {
    border-top-left-radius: ${bs};
    border-bottom-left-radius: ${bs};
  }

  &:last-child {
    border-top-right-radius: ${bs};
    border-bottom-right-radius: ${bs};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,h5=c.input`
  &::placeholder {
    color: ${p.gray250};
  }
`,x5=({sources:t,mapping:n,updateValue:s})=>{if(!n)return null;const o=(i,r,a)=>{s({...n,[i]:{type:r,value:a}})};return e.jsxs(d5,{children:[t.length===0&&e.jsx(Yt,{children:u("No data present")}),t.map(i=>{const r=n[i.id]??{type:Te.Relation,value:""};return e.jsxs(c5,{children:[e.jsx(u5,{className:T(i.required&&"required"),children:e.jsx("span",{children:i.label})}),e.jsxs(p5,{children:[i.options?.length>0&&e.jsx(So,{title:u("Pre-defined options"),className:T(r.type===Te.Preset&&"active"),onClick:()=>o(i.id,Te.Preset),children:e.jsx(r5,{})}),e.jsx(So,{title:u("Twig code"),className:T(r.type===Te.Custom&&"active"),onClick:()=>o(i.id,Te.Custom),children:e.jsx(i5,{})}),e.jsx(So,{title:u("Freeform field"),className:T(r.type===Te.Relation&&"active"),onClick:()=>o(i.id,Te.Relation),children:e.jsx(a5,{})})]}),e.jsxs("div",{children:[r.type===Te.Preset&&e.jsx(ce,{value:r?.value,showValues:!0,emptyOption:u("Select an option"),onChange:a=>{o(i.id,Te.Preset,a)},options:i.options.map(a=>({value:a.key,label:a.label}))}),r.type===Te.Relation&&e.jsx(o5,{value:r?.value,onChange:a=>{o(i.id,Te.Relation,a)}}),r.type===Te.Custom&&e.jsx(h5,{type:"text",className:"text fullwidth code",placeholder:"e.g. {{ yourField }} {{ otherField }}",value:r?.value||"",onChange:a=>{o(i.id,Te.Custom,a.target.value)}})]})]},i.id)})]})},m5=({value:t={},property:n,errors:s,updateValue:o,context:i})=>{const{formId:r}=K(),a={formId:r};n.parameterFields&&Object.entries(n.parameterFields).forEach(([x,g])=>{a[g]=an(i,x)});const{data:l,isFetching:d,refetch:h}=B({queryKey:["field-mapping",n.source,a],queryFn:async()=>await N.get(n.source,{params:a}).then(g=>g.data),staleTime:1/0,gcTime:1/0});return m.useEffect(()=>{if(d||l===void 0)return;const x=l.map(y=>String(y.id)),g=pt(t);let b=!1;Object.keys(t).forEach(y=>{x.includes(y)||(delete g[y],b=!0)}),b&&o(g)},[d,l,t,o]),e.jsxs(_,{property:n,errors:s,children:[e.jsx(l5,{className:"btn",disabled:d,onClick:()=>{a.refresh="true",h(),delete a.refresh},children:e.jsx(t5,{})}),l&&e.jsx(x5,{sources:l,mapping:t,updateValue:o}),!l&&d&&e.jsxs("div",{children:[e.jsx(L,{width:"40%"}),e.jsx(L,{width:"35%"}),e.jsx(L,{width:"42%"})]})]})},Zt=({value:t,onChange:n})=>e.jsx("div",{className:"select",children:e.jsxs("select",{value:t,onChange:s=>n?.(s.target.value),children:[e.jsx("option",{value:Be.Or,children:u("any")}),e.jsx("option",{value:Be.And,children:u("all")})]})}),g5=c.table`
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
        border-bottom: 1px solid ${p.inputBorder};
        background-color: ${p.gray050};
      }

      td:first-child {
        padding-left: 7px !important;
        border-left: 1px solid ${p.inputBorder};
      }

      td:last-child {
        border-right: 1px solid ${p.inputBorder};
      }
    }

    tr:first-child {
      td {
        border-top: 1px solid ${p.inputBorder};
      }

      td:first-child {
        border-top-left-radius: ${k.lg};
        border-top: 1px solid ${p.inputBorder};
      }

      td:last-child {
        border-top: 1px solid ${p.inputBorder};
        border-top-right-radius: ${k.lg};
      }
    }

    tr:last-child {
      td {
        padding: 0 !important;
        background-color: ${p.white};

        .btn {
          border: 0 !important;
          border-radius: 0 !important;
          background-color: transparent !important;
        }
      }

      td:last-child {
        border-left: 1px dashed ${p.inputBorder};
        border-right: 1px dashed ${p.inputBorder};
        border-bottom: 1px dashed ${p.inputBorder};
        border-bottom-left-radius: ${k.lg};
        border-bottom-right-radius: ${k.lg};
      }
    }

    tr:first-child:last-child {
      td {
        border-top: 1px dashed ${p.inputBorder};
      }
    }
  }
`,Wd=c.button`
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
`,ln={one:t=>J(n=>n.rules.fields.items,n=>n.find(s=>s.field===t)),isInCondition:t=>J(n=>n.rules.fields.items,n=>n.rules.pages.items,n=>n.rules.submitForm.item,n=>n.rules.buttons.items,(n,s,o,i)=>n.some(r=>r.conditions.some(a=>a.field===t))||s.some(r=>r.conditions.some(a=>a.field===t))||o?.conditions.some(r=>r.field===t)||i.some(r=>r.conditions.some(a=>a.field===t))),usedByFields:t=>J(n=>n.rules.fields.items,n=>n.filter(o=>o.conditions.some(i=>i.field===t)).map(o=>o.field)),hasRule:t=>J(n=>n.rules.fields.items,n=>!!n.find(s=>s.field===t))},f5=({condition:t,onChange:n})=>{const{uid:s}=K(),o=A(ln.usedByFields(s)),i=Od([...o,s],["html","rich-text","file","file-dnd","signature"]);return e.jsx(ce,{options:i,emptyOption:"Choose field",value:t.field,onChange:n})},b5={[se.Equals]:u("is equal to"),[se.NotEquals]:u("does not equal"),[se.GreaterThan]:u("greater than"),[se.GreaterThanOrEquals]:u("greater than or equal to"),[se.LessThan]:u("less than"),[se.LessThanOrEquals]:u("less than or equal to"),[se.Contains]:u("contains"),[se.NotContains]:u("does not contain"),[se.StartsWith]:u("starts with"),[se.EndsWith]:u("ends with"),[se.IsEmpty]:u("is empty"),[se.IsNotEmpty]:u("is not empty"),[se.IsOneOf]:u("is one of"),[se.IsNotOneOf]:u("is not one of")},y5=({condition:t,onChange:n})=>{const{operator:s}=t;return e.jsx("div",{className:"select fullwidth",children:e.jsx(ce,{value:s,onChange:o=>n?.(o),options:Object.entries(b5).map(([o,i])=>({value:o,label:i}))})})},j5=c.div`
  .tagify {
    --tag-bg: ${p.gray100};
    --tag-pad: 4px 7px;

    width: 100%;
    min-height: 2.125rem;
    padding: 5px 5px;

    box-sizing: border-box;
    background-color: ${p.white};

    border: 1px solid rgba(96, 125, 159, 0.25);
    border-radius: ${k.md};

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
`,_d=({value:t,options:n=[],onChange:s,allowCustom:o,placeholder:i})=>{const r=m.useRef(null);return e.jsx(j5,{children:e.jsx(p1,{tagifyRef:r,placeholder:i,settings:{tagTextProp:"name",enforceWhitelist:!o,whitelist:n,dropdown:{mapValueTo:"name",enabled:0}},value:t,onChange:a=>s(a.detail.tagify.getCleanValue().map(l=>l.value))})})};var Hd=(t=>(t.Options="options",t.GeneratedOptions="generatedOptions",t))(Hd||{}),ut=(t=>(t.Group="group",t.Rating="rating",t.OpinionScale="opinion-scale",t))(ut||{});const v5=({fieldUid:t,onChange:n,value:s})=>e.jsxs("div",{className:"checkbox-wrapper",children:[e.jsx("input",{id:`${t}-rule-checkbox`,type:"checkbox",className:"checkbox",onChange:o=>n?.(o.target.checked?"1":""),checked:!!s}),e.jsx("label",{htmlFor:`${t}-rule-checkbox`,children:u(s?"Checked":"Unchecked")})]});var Ae=(t=>(t.Custom="custom",t.Elements="elements",t.Predefined="predefined",t))(Ae||{});const w5=[I.limitations.can("layout.options.custom")&&{value:"custom",label:u("Custom")},I.limitations.can("layout.options.elements")&&{value:"elements",label:u("Elements")},I.limitations.can("layout.options.predefined")&&{value:"predefined",label:u("Predefined")}].filter(Boolean),Js=(t,n)=>{const{getOptionTranslations:s}=ye(t);let o,i;if(n?.type===ut.OpinionScale)o={source:Ae.Custom,options:t.properties.scales.map(x=>({label:x[1]||x[0],value:x[0]})),useCustomValues:!0};else if(n?.type===ut.Rating)o={source:Ae.Custom,options:Array.from({length:t.properties.maxValue},(x,g)=>({label:String(g+1),value:String(g+1)})),useCustomValues:!0};else if(n?.implements.includes(Hd.GeneratedOptions)){const x=n?.properties.find(g=>g.type===Y.Options);if(x){const g=t?.properties[x.handle];o=s(x.handle,g),i=g?.emptyOption}}const r=o?.source===Ae.Custom,{data:a,isFetching:l}=B({queryKey:["field-options",o],queryFn:async()=>{if(!o||r)return[];if(o?.source!==Ae.Custom&&!o.typeClass)return[];try{const x=await N.post("api/options",o),{data:g}=x;return g}catch(x){return console.error(x),[]}},staleTime:1/0,gcTime:1/0,enabled:!r}),d=!!o&&!r&&l;let h=r?o.options:a||[];return i&&(h=[{label:u(i),value:""},...h]),[h,d]},$5=({field:t,fieldType:n,value:s,multiple:o,onChange:i})=>{const[r,a]=Js(t,n);if(o){let l;if(s)try{l=JSON.parse(s)}catch{l=s}else l="";return e.jsx(e.Fragment,{children:!a&&e.jsx(_d,{value:l,options:r.map(d=>"value"in d?{value:d.value,name:d.label,editable:!1}:null).filter(Boolean),allowCustom:!1,onChange:d=>i(JSON.stringify(d))})})}return e.jsx(ce,{emptyOption:"Select an option",value:s,options:r,loading:a,onChange:l=>i?.(l)})},C5=({field:t,value:n,onChange:s})=>{const i=(t.properties?.scales||[]).map(([r,a])=>({label:`${a||r}`,value:r}));return e.jsx(ce,{emptyOption:"Select a scale value",value:n,options:i,onChange:r=>s?.(r)})},k5=({field:t,value:n,onChange:s})=>{const o=t.properties?.maxValue||1,i=Kn(1,o).map(r=>({label:`${r}`,value:`${r}`}));return e.jsx(ce,{emptyOption:"Select a rating",value:n,options:i,onChange:r=>s?.(r)})},S5=({condition:t,onChange:n})=>{const{field:s,value:o,operator:i}=t,r=A(Re.one(s)),a=Ne(r?.typeClass);if(!a||Nn.noValue.includes(i))return null;if(a.implements.includes("boolean")&&Nn.boolean.includes(i))return e.jsx(v5,{fieldUid:s,onChange:n,value:o});if(a.implements.includes("generatedOptions"))return e.jsx($5,{field:r,fieldType:a,value:o,multiple:Nn.multiple.includes(i),onChange:x=>n?.(x)});if(Nn.multiple.includes(i))return e.jsx(_d,{value:o,allowCustom:!0,onChange:x=>n(JSON.stringify(x)),placeholder:u("Add values")});const h=a.type;return h===ut.Rating?e.jsx(k5,{field:r,value:o,onChange:n}):h===ut.OpinionScale?e.jsx(C5,{field:r,value:o,onChange:n}):e.jsx("input",{className:"text fullwidth",type:"text",value:o,onChange:x=>n?.(x.target.value)})},Xt=({conditions:t,buttonLabel:n,loading:s,onChange:o})=>e.jsx(g5,{children:e.jsxs("tbody",{children:[s&&e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(L,{height:34})}),e.jsx("td",{children:e.jsx(L,{height:34})}),e.jsx("td",{children:e.jsx(L,{height:34})}),e.jsx("td",{})]}),t.map((i,r)=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(f5,{condition:i,onChange:a=>o?.([...t.slice(0,r),{...i,field:a},...t.slice(r+1)])})}),e.jsx("td",{children:e.jsx(y5,{condition:i,onChange:a=>o?.([...t.slice(0,r),{...i,operator:a},...t.slice(r+1)])})}),e.jsx("td",{children:e.jsx(S5,{condition:i,onChange:a=>{o?.([...t.slice(0,r),{...i,value:a},...t.slice(r+1)])}})}),e.jsx("td",{children:e.jsx(Wd,{children:e.jsx(rt,{onClick:()=>{o?.([...t.slice(0,r),...t.slice(r+1)])}})})})]},r)),!s&&e.jsx("tr",{children:e.jsx("td",{colSpan:4,children:e.jsx("button",{type:"button",className:"btn add icon fullwidth",onClick:()=>{o?.([...t,{uid:V(),field:"",operator:se.Equals,value:""}])},children:u(n||"Add a condition")})})})]})}),Ud=({value:t,onChange:n,options:s})=>{const{on:o,off:i}=s;return e.jsx("div",{className:"select",children:e.jsxs("select",{value:t?o:i,onChange:r=>n?.(r.target.value===o),children:[e.jsx("option",{value:o,children:u(o)}),e.jsx("option",{value:i,children:u(i)})]})})},st=c.h1`
  padding: 0;
`,en=c.div`
  margin-bottom: ${f.xl};

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
`,Fa={isInitialized:t=>t.rules.integrations.initialized,one:t=>J(n=>n.rules.integrations.items,n=>n.find(s=>s.uid===t)),hasRule:t=>J(n=>n.rules.integrations.items,n=>!!n.find(s=>s.uid===t))},L5=({property:t,updateValue:n,value:s,context:o})=>{const i=H(),r=m.useRef([]),{id:a}=A(De.current),{data:l,isFetched:d}=ax(a),h=A(Fa.isInitialized),x=A(Fa.one(s)),{instanceUid:g}=o;return m.useEffect(()=>{if(!r.current.includes(s)&&d&&h){if(s&&l.find(y=>y.uid===s))return;const b=V();r.current.push(b),i(Mn.add({ruleUid:b,integrationUid:g})),n(b)}},[h,l,d,s,i,g,n]),e.jsxs(_,{property:t,children:[e.jsxs(en,{children:[e.jsx(Ud,{value:x?.push??!0,options:{on:"Push",off:"Don't push"},onChange:b=>i(Mn.modifyPush({ruleUid:x.uid,push:b}))}),u("data to integration when"),e.jsx(Zt,{value:x?.combinator??Be.Or,onChange:b=>i(Mn.modifyCombinator({ruleUid:x.uid,combinator:b}))}),u("of the following rules match:")]}),e.jsx(Xt,{loading:!x,conditions:x?x.conditions:[],onChange:b=>{i(Mn.modifyConditions({ruleUid:x.uid,conditions:b}))}})]})},Fn=({children:t})=>e.jsx(Ht,{baseColor:"#e6eaee",highlightColor:"#ced1d4",children:t}),F5=c.div`
  padding: ${f.xl};
  border-bottom: 1px solid ${p.gray200};
`,T5=c.div`
  margin-bottom: ${f.lg};
  color: ${p.gray600};
  font-size: 0.9em;
`,E5=c.button`
  width: 100%;
  margin-top: ${f.lg};
`,z5=c.div`
  color: ${p.gray600};
  padding: ${f.lg};
  text-align: center;
`,N5=c.div`
  padding: ${f.xl};
  height: 300px;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 ${f.lg} 0;
    font-size: 1.1em;
    font-weight: 600;
  }
`,Ta=c.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${p.white};
  border: 1px solid ${p.gray200};
  border-radius: ${k.lg};
  overflow: hidden;
  margin-top: -1px;

  thead {
    background: ${p.gray050};
    display: table;
    width: 100%;
    table-layout: fixed;

    th {
      padding: ${f.md} ${f.lg};
      font-weight: 600;
      color: ${p.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${p.gray200};
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
        background: ${p.gray050};
      }
    }

    td {
      padding: ${f.md} ${f.lg};
      vertical-align: middle;

      &.no-break {
        white-space: nowrap;
      }
    }
  }
`,M5=c.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${k.md};
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;

  &.success {
    background-color: ${p.teal050};
    color: ${p.teal700};
  }

  &.error {
    background-color: ${p.red050};
    color: ${p.red700};
  }

  &.pending {
    background-color: ${p.yellow050};
    color: ${p.yellow700};
  }
`,I5=c.div`
  margin-top: ${f.lg};
  padding: ${f.md};
  background-color: ${p.teal050};
  color: ${p.teal700};
  border-radius: ${k.md};
`,R5=c.div`
  margin-top: ${f.lg};
  padding: ${f.md};
  background-color: ${p.red050};
  color: ${p.red700};
  border-radius: ${k.md};
`,ni=c.div`
  margin-top: ${f.lg};
  padding: ${f.md};
  background-color: ${p.yellow050};
  color: ${p.yellow700};
  border-radius: ${k.md};
`,A5=({formId:t,onClose:n})=>{const[s,o]=m.useState(null),[i,r]=m.useState(null),[a,l]=m.useState(null),[d,h]=m.useState(null),{data:x,isFetching:g,refetch:b}=cx(t),{data:y}=ad(),[j,w]=m.useState(!1),{data:v}=dx(s,{enabled:!!s,refetchInterval:j?3e3:void 0});m.useEffect(()=>{s&&v?.status==="pending"?w(!0):w(!1)},[s,v?.status]);const $=ux(t,{onSuccess:S=>{o(S.testToken),r(Date.now())},onError:()=>{o(null)}});m.useEffect(()=>{i&&v?.status==="pending"&&Date.now()-i>24e4&&(o(null),r(null))},[i,v?.status]),m.useEffect(()=>{(v?.status==="success"||v?.status==="failed")&&(o(null),r(null),l(v.status),h(v.errorMessage||null),b())},[v?.status,v?.errorMessage,b]);const C=()=>{l(null),h(null),$.mutate()},E=S=>{switch(S){case"success":return"success";case"failed":return"error";case"pending":return"pending";default:return""}},F=S=>{try{return new Date(S).toLocaleString()}catch{return S}},z=$.isPending||s!==null,M=a==="success";return e.jsx(bt,{closeModal:n,children:e.jsxs($e,{style:{maxWidth:"600px"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Test Email Notifications")})}),e.jsxs("div",{style:{padding:f.xl},children:[e.jsxs(F5,{children:[e.jsx(T5,{children:u("A test email will be sent to 'inbound@test.formmonitor.com' to confirm that your email delivery and inbound processing are functioning correctly.")}),y?.isSendmail&&e.jsx(ni,{children:u(`Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor's inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.`)}),a!=="success"&&e.jsx(E5,{className:T("btn","submit",(z||M)&&"disabled"),onClick:C,disabled:z||M,children:u(z?"Testing...":M?"Test complete":"Test it now")}),a==="success"&&e.jsx(I5,{children:u("Test email received successfully!")}),a==="failed"&&e.jsxs(R5,{children:[u("Test email failed:")," ",d||u("Unknown error")]}),i&&Date.now()-i>=24e4&&e.jsx(ni,{children:u("Test email is taking longer than expected. Please check again in 10 minutes—the final status will appear in the Test Email History once delivery completes.")})]}),e.jsxs(N5,{children:[e.jsx("h3",{children:u("Test Email History")}),g?e.jsx(Fn,{children:e.jsxs(Ta,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("ID")}),e.jsx("th",{children:u("Status")}),e.jsx("th",{children:u("Date & Time")})]})}),e.jsx("tbody",{children:[1,2,3].map(S=>e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(L,{width:40})}),e.jsx("td",{children:e.jsx(L,{width:80})}),e.jsx("td",{children:e.jsx(L,{width:150})})]},S))})]})}):!x||!x.testEmails||x.testEmails.length===0?e.jsx(z5,{children:u("No test emails sent yet.")}):e.jsxs(Ta,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("ID")}),e.jsx("th",{children:u("Status")}),e.jsx("th",{children:u("Date & Time")})]})}),e.jsx("tbody",{children:x.testEmails.map(S=>e.jsxs("tr",{children:[e.jsx("td",{className:"no-break",children:S.id}),e.jsx("td",{children:e.jsx(M5,{className:E(S.status),children:S.status==="success"?u("Success"):S.status==="failed"?u("Failed"):u("Pending")})}),e.jsx("td",{className:"no-break",title:S.createdAt,children:F(S.createdAt)})]},S.id))})]})]})]}),e.jsx(ke,{children:e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Close")})})]})})},D5=({property:t,errors:n})=>{const{formId:s}=K(),[o,i]=m.useState(!1),{data:r}=ad(),a=s?Number(s):null,l=!!a,d=r?.isSendmail??!1;return e.jsxs(e.Fragment,{children:[e.jsxs(_,{property:t,errors:n,children:[e.jsx("button",{className:"btn small submit",type:"button",disabled:!l,onClick:()=>{l&&i(!0)},children:u("Test Email Notifications")}),d&&e.jsx(ni,{children:u(`Warning: You are currently using Sendmail for email delivery. Sendmail is often unreliable, and many email providers block messages sent from unknown servers as a spam-prevention measure. This may prevent messages from reaching Form Monitor's inbound address (inbound@test.formmonitor.com), which can trigger false "Email Issues Detected" alerts.`)})]}),o&&a&&e.jsx(A5,{formId:a,onClose:()=>i(!1)})]})},Ea={isInitialized:t=>t.rules.notifications.initialized,one:t=>J(n=>n.rules.notifications.items,n=>n.find(s=>s.uid===t)),hasRule:t=>J(n=>n.rules.notifications.items,n=>!!n.find(s=>s.uid===t))},P5=({property:t,updateValue:n,value:s,context:o})=>{const i=H(),r=m.useRef([]),{id:a}=A(De.current),{data:l,isFetched:d}=sd(a),h=A(Ea.isInitialized),x=A(Ea.one(s)),{uid:g}=o;return m.useEffect(()=>{if(!r.current.includes(s)&&d&&h){if(s&&l.find(y=>y.uid===s))return;const b=V();r.current.push(b),i(In.add({ruleUid:b,notificationUid:g})),n(b)}},[h,l,d,s,i,g,n]),e.jsxs(_,{property:t,children:[e.jsxs(en,{children:[e.jsx(Ud,{value:x?.send??!0,options:{on:"Send",off:"Don't send"},onChange:b=>i(In.modifySend({ruleUid:x.uid,send:b}))}),u("a notification when"),e.jsx(Zt,{value:x?.combinator??Be.Or,onChange:b=>i(In.modifyCombinator({ruleUid:x.uid,combinator:b}))}),u("of the following rules match:")]}),e.jsx(Xt,{loading:!x,conditions:x?x.conditions:[],onChange:b=>{i(In.modifyConditions({ruleUid:x.uid,conditions:b}))}})]})},za={desktop:{sm:1024,md:1440}},Na={desktop:{sm:`@media only screen and (min-width: ${za.desktop.sm}px)`,md:`@media only screen and (min-width: ${za.desktop.md}px)`}},B5=c.div``,O5=c.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${f.sm};

  padding: 0;
  margin: 0 0 ${f.sm};

  user-select: none;

  > span {
    padding: 0;

    color: ${p.gray300};
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &:after {
    content: '';

    width: 100%;
    height: 1px;

    background-color: ${p.gray200};
  }
`,W5=c.ul`
  position: relative;

  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${f.sm};

  max-height: 130px;
  overflow-y: auto;

  ${q};

  &.has-scroll {
    padding-right: 10px;
  }

  ${Na.desktop.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${Na.desktop.md} {
    grid-template-columns: repeat(4, 1fr);
  }
`,qd=c.div`
  padding: ${f.sm} ${f.md};

  font-size: 14px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`,Qd=c.div`
  display: flex;
  height: 100%;

  white-space: nowrap;

  background-color: #e5ecf6;
  border-top-right-radius: ${k.lg};
  border-bottom-right-radius: ${k.lg};
`,si=c.button`
  padding: ${f.sm} 10px;

  &:hover {
    background-color: ${p.gray200};
  }

  &:last-child {
    border-top-right-radius: ${k.lg};
    border-bottom-right-radius: ${k.lg};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`,Kd=c.li`
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  min-width: 0;

  padding: 0;

  background-color: ${p.gray050};
  border: 1px solid ${p.gray200};
  border-radius: ${k.lg};

  &.dashed {
    background-color: transparent;
    border: 1px dashed ${p.gray300};

    &:hover {
      background-color: ${p.gray100};
    }
  }

  &.active {
    color: ${p.white};
    background-color: ${p.gray500};

    button svg {
      fill: ${p.white};
    }

    ${Qd} {
      background-color: #51606c;
    }

    ${si} {
      &:hover {
        background-color: ${p.gray800};
      }
    }
  }
`,_5=({onCreate:t})=>e.jsx(Kd,{className:"dashed",onClick:t,children:e.jsx(qd,{children:e.jsxs(H5,{children:[e.jsx("i",{className:"fa-solid fa-plus"}),u("Create New Template")]})})}),H5=c.div`
  display: flex;
  align-items: center;
  gap: 8px;
`,Lo=({address:t})=>(Array.isArray(t)||(t=[t]),e.jsx("div",{children:t.map((n,s)=>e.jsxs("span",{children:[e.jsx(U5,{...n}),s<t.length-1&&e.jsx("span",{children:", "})]},s))})),U5=({address:t,name:n})=>n?e.jsxs("span",{children:[n," <",t,">"]}):e.jsx("span",{children:t}),q5=({attachments:t})=>e.jsx("div",{children:t.map((n,s)=>e.jsxs(Q5,{children:[e.jsx("i",{className:`fa-regular fa-file-${V5(n.filename)}`}),e.jsx("span",{children:n.filename}),e.jsx(K5,{children:n.size})]},s))}),Q5=c.div`
  display: flex;
  align-items: center;
  gap: 4px;
`,K5=c.span`
  font-weight: 700;
  font-size: 0.8em;
  color: ${p.gray250};
`,V5=t=>{const n=t.split(".").pop()?.toLowerCase();let s;switch(n){case"pdf":s="pdf";break;case"jpg":case"jpeg":case"png":case"gif":case"webp":s="image";break;case"xlsx":s="spreadsheet";break;case"doc":s="doc";break;case"ppt":s="ppt";break;default:s="file";break}return s},G5=({body:t})=>{const n=m.useRef(null);return m.useEffect(()=>{const s=n.current;if(s){const o=s.contentDocument||s.contentWindow?.document;if(o){o.open(),o.write(t),o.close();const i=()=>{if(s?.contentWindow?.document){const r=s.contentWindow.document.body.scrollHeight;s.style.height=`${r}px`,s.contentWindow.document.body.style.overflow="hidden"}};s.onload=i,setTimeout(i,50)}}},[t]),e.jsx(Y5,{ref:n,width:"100%",sandbox:"allow-same-origin allow-scripts",title:"Email Preview"})},Y5=c.iframe`
  display: block;
  width: 100%;

  overflow: hidden;
  border: none;
`;c.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  background-color: ${p.white};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  overflow: auto;
`;const oi=c.div`
  border: 1px solid ${p.gray200};
  border-radius: 5px;
  box-shadow: 0 1px 12px #31315d26;
`,ii=c.div`
  height: 16px;

  background: ${p.gray050};
  border-radius: 5px 5px 0 0;

  font-size: 1px;
  line-height: 1px;
`,Me=c.div`
  display: flex;
  gap: 5px;

  padding: 4px 0;

  border-bottom: 1px solid ${p.hairline};

  &:last-child {
    border-bottom: none;
    border-radius: 0 0 5px 5px;
  }
`,Qe=c.label`
  display: block;

  flex-basis: 120px;

  font-size: 13px;
  font-weight: 700;
  text-align: right;
  color: ${p.gray250};
`,Ke=c.div`
  flex: 1;
  padding: 0 5px 0 15px;

  font-size: 13px;
  color: ${p.gray900};
`,ri=c.div`
  width: 100%;
  padding: ${f.md} ${f.xl};
`,J5=c.input`
  padding: 0 ${f.xs};

  border: 1px solid rgba(96, 125, 159, 0.25);
  border-radius: 3px;

  font-size: 12px;
`,Z5=()=>e.jsxs(oi,{children:[e.jsx(ii,{}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("To"),":"]}),e.jsx(Ke,{children:e.jsx(L,{width:200})})]}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("Subject"),":"]}),e.jsx(Ke,{children:e.jsx(L,{width:200})})]}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("From"),":"]}),e.jsx(Ke,{children:e.jsx(L,{width:200})})]}),e.jsx(Me,{children:e.jsxs(ri,{children:[e.jsx(L,{width:200}),e.jsx(L,{width:300}),e.jsx(L,{width:550}),e.jsx("br",{}),e.jsx(L,{width:500}),e.jsx(L,{width:430}),e.jsx(L,{width:520}),e.jsx("br",{}),e.jsx(L,{width:200}),e.jsx(L,{width:230}),e.jsx(L,{width:220})]})})]}),Vd={preview:["notifications","templates","preview"]},X5=t=>B({enabled:!1,queryKey:Vd.preview,queryFn:async()=>(await N.post("/api/templates/preview",t)).data}),e3=()=>re({mutationFn:async t=>await N.post("/api/templates/send-test",t)}),Gd=t=>{const{inView:n}=t,{data:s,isFetching:o,refetch:i,error:r}=X5(t.context),a=e3(),[l,d]=m.useState();return m.useEffect(()=>{n&&i()},[n,i]),m.useEffect(()=>{if(l===void 0&&s?.from){const h=Array.isArray(s.from)?s.from[0]:s.from;d(h.address)}},[s,l]),e.jsxs(Ee,{...t,extraContent:e.jsxs("div",{style:{display:"flex",gap:f.sm},children:[e.jsx("button",{className:T("btn","small","submit",o&&"disabled"),disabled:o,type:"button",onClick:()=>i(),children:u("Refresh")}),e.jsx(J5,{className:"small",type:"text",placeholder:u("john@doe.com"),value:l||"",onChange:h=>d(h.target.value),autoComplete:"off",autoCorrect:"off",spellCheck:!1,inputMode:"email","data-lpignore":"true","data-1p-ignore":!0}),e.jsx("button",{className:T("btn","small",a.isPending&&"disabled",!l&&"disabled"),disabled:a.isPending||!l,type:"button",onClick:()=>a.mutate({...t.context,targetEmail:l||""}),children:u("Send Test Email")})]}),children:[o&&e.jsx(Z5,{}),!!r&&e.jsxs(oi,{children:[e.jsx(ii,{}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("Error"),":"]}),e.jsx(Ke,{children:e.jsx("b",{children:r.message})})]}),e.jsx(Me,{children:e.jsx(ri,{children:r.errors.template.preview})})]}),s!==void 0&&!r&&!o&&e.jsxs(oi,{children:[e.jsx(ii,{}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("From"),":"]}),e.jsx(Ke,{children:e.jsx(Lo,{address:s.from})})]}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("Subject"),":"]}),e.jsx(Ke,{children:s.subject})]}),e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("To"),":"]}),e.jsx(Ke,{children:s.to})]}),!!s.cc.length&&e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("CC"),":"]}),e.jsx(Ke,{children:e.jsx(Lo,{address:s.cc})})]}),!!s.bcc.length&&e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("BCC"),":"]}),e.jsx(Ke,{children:e.jsx(Lo,{address:s.bcc})})]}),!!s.attachments.length&&e.jsxs(Me,{children:[e.jsxs(Qe,{children:[u("Attachments"),":"]}),e.jsx(Ke,{children:e.jsx(q5,{attachments:s.attachments})})]}),e.jsx(Me,{children:e.jsx(ri,{children:e.jsx(G5,{body:s.htmlBody})})})]})]})},nr={all:["notification-templates"],one:t=>[...nr.all,t]},t3=t=>B({queryKey:nr.one(t),queryFn:()=>N.get(`/api/notifications/templates/${t||"get-default-metadata"}`).then(n=>n.data),staleTime:1/0,gcTime:1/0}),n3=t=>re({mutationFn:n=>N.post("/api/notifications/templates",{formId:t,...n}).then(s=>s.data)}),s3=c($e)`
  display: grid;
  grid-template-rows: min-content min-content 70vh min-content;

  max-width: 70vw;
  min-width: 600px;
`,o3=c.div`
  padding: 1rem 2rem;

  overflow-y: auto;
  ${q};
`,i3=c.ul`
  display: flex;

  padding: 0 9px;

  border-bottom: 1px solid ${p.hairline};
  box-shadow: 0 1px 5px #cdd8e440;

  list-style: none;
`,r3=c.li`
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
    color: ${p.error};
  }
`,a3=c.div`
  display: none;

  &.active {
    display: block;
  }
`,l3=c.div`
  display: flex;
  gap: 1rem;

  > div {
    flex: 1 0;
    padding: 0.5rem 0;
  }
`,Os=t=>(t=ki(t),t.replace(/[^a-zA-Z0-9\-_]/g,"")),Yd=(t,{target:n,camelize:s=!1,transliterate:o=!1,bypassConditions:i},r,a)=>{if(i!==void 0){for(const d of i)if(!!r?.[d.name]===d.isTrue)return t}const l=Ai(t,{transliterate:o,camelize:s});return a?.(n,l),t},c3=(t,{pattern:n,replacement:s="",modifier:o="g"})=>{const i=new RegExp(n,o);return t.replace(i,s)},d3=Object.freeze(Object.defineProperty({__proto__:null,handle:Os,injectInto:Yd,regex:c3},Symbol.toStringTag,{value:"Module"})),u3=t=>{const{value:n,onChange:s}=t;return e.jsx(Ee,{...t,children:e.jsx(Yi,{criteria:{kind:[]},multiSelect:!0,onUpdate:s,value:n})})},p3=t=>{const{value:n,label:s,handle:o,instructions:i,onChange:r}=t;return e.jsx(Ee,{...t,label:void 0,instructions:void 0,children:e.jsxs(Gs,{children:[e.jsx(Fd,{children:e.jsx(Jt,{enabled:n,onClick:a=>r(a)})}),e.jsxs(tf,{onClick:()=>r(!n),children:[e.jsx("label",{htmlFor:o,children:u(s)}),e.jsx(ss,{instructions:i})]})]})})},h3=t=>{const{optionDefinition:n,handle:s,value:o,onChange:i}=t,[r,a]=m.useState(!1),[l,d]=m.useState([]);return m.useEffect(()=>{typeof n=="function"?(a(!0),n().then(h=>{d(h)}).finally(()=>a(!1))):d(n||[])},[n]),e.jsxs(Ee,{...t,children:[e.jsx(Zi,{value:o,options:l,selectAll:l.length>0,onUpdate:i,uniqueId:s,emptyMessage:u("No PDF templates were found")}),!r&&l.length===0&&e.jsxs(e.Fragment,{children:[e.jsx(Nd,{}),e.jsx(ss,{instructions:u("No PDF templates were found")})]})]})},x3=t=>{const{optionDefinition:n,emptyOption:s,value:o,onChange:i}=t,[r,a]=m.useState(!1),[l,d]=m.useState([]);return m.useEffect(()=>{typeof n=="function"?(a(!0),n().then(h=>{d(h)}).finally(()=>a(!1))):d(n||[])},[n]),e.jsx(Ee,{...t,children:e.jsx(ce,{options:l,emptyOption:s,value:o,onChange:h=>i(h),loading:r})})},m3=c.div`
  //
`,g3=c.label`
  display: block;

  padding: 0 ${f.md};

  ${We};
  font-size: 11px;
`,f3=c.a`
  cursor: pointer;

  display: block;

  padding: 0 ${f.xl} 3px;
  font-size: 14px;

  text-decoration: none;

  &:hover {
    cursor: pointer;
    background-color: ${p.gray050};
  }

  &.active {
    background-color: ${p.gray100};

    &:hover {
      background-color: ${p.gray200};
    }
  }
`,b3=({item:t,onClick:n})=>{const s=m.useRef(null);return m.useEffect(()=>{t.active&&s.current&&s.current.scrollIntoView({behavior:"smooth",block:"nearest"})},[t]),e.jsx(f3,{ref:s,className:T(t?.active&&"active"),onClick:()=>n?.(t),dangerouslySetInnerHTML:{__html:O.sanitize(t.shortName)}})},y3=({category:t,onClick:n})=>e.jsxs(m3,{children:[e.jsx(g3,{children:t.name}),e.jsx("div",{children:t.items.map(s=>e.jsx(b3,{item:s,onClick:n},s.token))})]}),j3=({backend:t,index:n,filter:s,setIndex:o,setFilter:i,itemCountRef:r,suggestions:a,close:l})=>{m.useEffect(()=>{const d=h=>{switch(h.key){case"Escape":h.preventDefault(),l();break;case"ArrowRight":case"ArrowLeft":h.preventDefault(),l();break;case"ArrowDown":h.preventDefault(),o(x=>x>=(r.current??0)-1?(r.current??0)-1:x<(r.current??0)?x+1:r.current-1);break;case"ArrowUp":h.preventDefault(),n>0&&o(x=>x>r.current-1?r.current-1:x>0?x-1:0);break;case"Enter":if(h.preventDefault(),h.stopPropagation(),h.stopImmediatePropagation(),n>-1){const x=a.flatMap(g=>g.items).find(g=>g.active);x&&t.insert(x,s)}return i(""),l(),!1;default:h.key.length===1&&i(x=>x+h.key);break}};return t.handlers.on.down(d,!0),()=>{t.handlers.off.down(d)}},[n,l,t,a,s,i,o,r])},v3=({backend:t,setFilter:n,close:s})=>{m.useEffect(()=>{if(t.extrnalTrigger)return;const o=i=>{const r=t.getRange(),a=r.startContainer,l=r.startOffset;if(a.nodeType===3){const d=a.textContent;let h="",x=!1;for(let g=l-1;g>=0;g--)if(d[g]==="@"){x=!0,h=d.substring(g+1,l);break}!x||i.key==="Escape"?(s(),n("")):n(h)}else s()};return t.handlers.on.up(o,!0),()=>{t.handlers.off.up(o)}},[s,t,n])};let ys;const w3=t=>{const n=[];return t.getState().layout.fields.forEach(s=>{n.push({shortName:s.properties.label,name:s.properties.label,token:`fieldUids['${s.uid}']`})}),n},$3=t=>{const{store:n}=t,[s,o]=m.useState([]);return m.useEffect(()=>{ys?o([...ys,{name:"Fields",items:w3(n)}]):N.get("/api/templates/notifications/suggestions").then(i=>{ys=i.data,o(ys)})},[n]),s},C3=(t,n)=>{const s=$3(t),[o,i]=m.useState([]),[r,a]=m.useState("");return m.useEffect(()=>{let l=0;const d=s.map(h=>({...h,items:h.items.filter(x=>x.name.toLowerCase().includes(r.toLowerCase())).map(x=>({...x,active:n===l++}))})).filter(h=>h.items.length>0);i(d)},[s,r,n]),{suggestions:o,filter:r,setFilter:a}},k3=(t,n)=>{const s=t.getRect(),{getRange:o}=t,i=o();let r;i.startContainer.nodeType===Node.ELEMENT_NODE?r=i.startContainer:r=i;const a=r.getBoundingClientRect();let l=window.scrollX,d=window.scrollY;s&&(l+=s.left,d+=s.top);const h=l+a.left+15,x=d+a.top+20;return n.current&&(n.current.style.left=`${h}px`,n.current.style.top=`${x}px`),{left:h,top:x}},S3=c.div`
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

  background-color: ${p.white};
  color: black;

  border: 1px solid ${p.hairline};
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`,L3=c.h3`
  background: ${p.gray100};

  padding: 8px 8px;
  margin: 0;

  ${We};
  color: ${p.gray600};
  font-size: 11px;
`,F3=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};

  padding: ${f.xs} 0;

  overflow-y: auto;
  ${q};
`,T3=({backend:t,close:n})=>{const s=m.useRef(null),o=m.useRef(0),[i,r]=m.useState(0),{suggestions:a,filter:l,setFilter:d}=C3(t,i);k3(t,s),m.useEffect(()=>{o.current=a.reduce((x,g)=>x+g.items.length,0)},[a]),yt({isEnabled:!0,callback:n,refObject:s}),v3({backend:t,setFilter:d,close:n}),j3({backend:t,index:i,filter:l,setIndex:r,setFilter:d,itemCountRef:o,suggestions:a,close:n});const h=m.useCallback(x=>{t.insert(x,l),d(""),n()},[l,t.insert,n,d]);return e.jsxs(S3,{ref:s,children:[e.jsx(L3,{children:u("Freeform Template Tokens")}),e.jsx(F3,{children:a.map(x=>e.jsx(y3,{category:x,onClick:h},x.name))})]})},E3=t=>{const n=document.createElement("div");n.className="freeform-tokens-dropdown",document.body.appendChild(n);const s=_l.createRoot(n),o=()=>{s.unmount(),document.body.contains(n)&&document.body.removeChild(n)};return s.render(e.jsx(T3,{backend:t,close:o})),{close:o}};let Ms;const ai=t=>{sr(),Ms=E3(t)},sr=()=>{Ms&&(Ms.close(),Ms=void 0)},z3=t=>{t.PluginManager.add("freeform-tokens",n=>{const s={store:n.getParam("store"),getRect:()=>n.getContentAreaContainer().getBoundingClientRect(),getRange:()=>n.selection.getRng(),insert:(o,i)=>{const r=n.selection.getRng(),a=Math.max(0,r.startOffset-(i.length+1));r.setStart(r.startContainer,a),n.selection.setRng(r),n.execCommand("Delete"),n.insertContent(`<span contenteditable="false" data-freeform-token="${o.token}">${o.name}</span>`)},handlers:{on:{down:(o,i=!1)=>{n.on("keydown",o,i)},up:(o,i=!1)=>{n.on("keyup",o,i)}},off:{down:o=>{n.off("keydown",o)},up:o=>{n.off("keyup",o)}}}};n.on("keydown",o=>{o.key==="@"&&setTimeout(()=>{ai(s)},0)}),n.on("remove",()=>{sr()})})};z3(h1);const N3=t=>{const{value:n,onChange:s}=t,o=Mi(),i=X(),{templates:{toolbar:r},metadata:{tinymce:{stylesPath:a}}}=I;return e.jsx(Ee,{...t,children:e.jsx(Hl,{init:{branding:!1,menubar:!1,statusbar:!0,promotion:!1,content_css:a,store:o,queryClient:i},value:n,onEditorChange:s,plugins:M3,toolbar:r,licenseKey:"gpl"})})},M3=["autolink","code","codesample","image","link","lists","media","searchreplace","table","freeform-tokens"],Fo=t=>{const{value:n,multiline:s,onChange:o}=t;return e.jsx(Ee,{...t,children:s?e.jsx("textarea",{rows:2,className:"text fullwidth",value:n,onChange:i=>o(i.target.value)}):e.jsx("input",{type:"text",className:"text fullwidth",value:n,onChange:i=>o(i.target.value)})})},I3=c.div`
  position: relative;
`,R3=c.div`
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
`,A3=c.button`
  position: absolute;
  top: 0;
  right: 0;

  margin: 4px;
  padding: 0 8px;

  height: 26px;
  min-height: 26px;
`,$t=t=>{const n=Mi(),s=m.useRef(null),o=m.useRef(null),i=m.useRef(null),{value:r,onChange:a}=t,l=m.useCallback(y=>O.sanitize(y,{ADD_ATTR:["contenteditable","data-freeform-token"]}),[]),d=m.useMemo(()=>({getRange:()=>window.getSelection()?.getRangeAt(0)||document.createRange(),getRect:()=>null,insert:y=>{const j=window.getSelection();if(!j||j.rangeCount===0)return;const w=i.current||j.getRangeAt(0);if(w.startContainer.nodeType!==Node.TEXT_NODE)return;const v=w.startContainer,$=w.startOffset,C=v.textContent??"";let E=-1;for(let S=$-1;S>=0;S--)if(C[S]==="@"){E=S;break}if(E===-1)return;const F=document.createRange();F.setStart(v,E),F.setEnd(v,$);const z=document.createElement("span");z.contentEditable="false",z.dataset.freeformToken=y.token,z.innerHTML=l(y.name),F.deleteContents(),F.insertNode(z);const M=document.createRange();M.setStartAfter(z),M.collapse(!0),j.removeAllRanges(),j.addRange(M),a(l(s.current?.innerHTML??""))},store:n,handlers:{on:{down:y=>{s.current?.addEventListener("keydown",y)},up:y=>{s.current?.addEventListener("keyup",y)}},off:{down:y=>{s.current?.removeEventListener("keydown",y)},up:y=>{s.current?.removeEventListener("keyup",y)}}}}),[n,a,l]),h={extrnalTrigger:!0,getRange:()=>{if(!i.current){const y=document.createRange();return y.selectNode(o.current),y}return i.current},getRect:()=>null,insert:y=>{const j=document.createElement("span");j.contentEditable="false",j.dataset.freeformToken=y.token,j.innerHTML=l(y.name);const w=i.current;if(!w){s.current?.appendChild(j),a(l(s.current.innerHTML));return}if(w.startContainer.nodeType!==Node.TEXT_NODE&&w.startContainer.nodeType!==Node.ELEMENT_NODE)return;const v=w.startContainer,$=w.startOffset,C=document.createRange();C.setStart(v,$),C.setEnd(v,$),C.deleteContents(),C.insertNode(j);const E=document.createRange();E.setStartAfter(j),E.collapse(!0);const F=window.getSelection();F.removeAllRanges(),F.addRange(E),a(l(s.current?.innerHTML??""))},store:n,handlers:{on:{down:y=>{document?.addEventListener("keydown",y)},up:y=>{document.addEventListener("keyup",y)}},off:{down:y=>{document.removeEventListener("keydown",y)},up:y=>{document.removeEventListener("keyup",y)}}}},x=m.useCallback(()=>{const y=window.getSelection();y&&y.rangeCount>0&&(i.current=y.getRangeAt(0).cloneRange())},[]),g=m.useCallback(()=>{const y=window.getSelection();y&&i.current&&(y.removeAllRanges(),y.addRange(i.current))},[]);m.useEffect(()=>()=>{sr()},[]),m.useEffect(()=>{s.current&&s.current.innerHTML!==r&&(s.current.innerHTML=l(r))},[r,l]);const b=m.useCallback(y=>{(y.nativeEvent.data||"")==="@"&&ai(d),s.current&&a(l(s.current.innerHTML))},[d,a,l]);return e.jsx(Ee,{...t,children:e.jsxs(I3,{children:[e.jsx(R3,{className:"text fullwidth",ref:s,contentEditable:!0,onInput:b,onBlur:x,onKeyUp:x,onMouseUp:x,suppressContentEditableWarning:!0}),e.jsx(A3,{ref:o,className:"btn",onClick:()=>{g(),ai(h)},children:e.jsx("i",{className:"fa-solid fa-plus"})})]})})},li=[{name:u("Content"),rows:[[{type:Fo,label:"Template Name",handle:"name",required:!0,instructions:"What this notification template will be called in the CP.",updateState:(t,n)=>({...n,handle:Os(Ci(ki(t)))})}],[{type:$t,label:"Subject",handle:"subject",required:!0,instructions:"The subject line for the email notification."}],[{type:N3,label:"Message Body",handle:"body",instructions:"The content of the email notification. Use the `@` symbol to generate a list of tokens you can use. Twig is also allowed."}]]},{name:u("Configuration"),rows:[[{type:$t,label:"From Name",handle:"fromName",required:!0,instructions:"The name that the email will appear from in your email notification."},{type:$t,label:"Reply-To Name",handle:"replyToName",instructions:"The reply-to name that the email will appear from in your email notification."}],[{type:$t,label:"From Email",handle:"fromEmail",required:!0,instructions:"The email address that the email will appear from in your email notification."},{type:$t,label:"Reply-To Email",handle:"replyToEmail",instructions:"The reply-to email address for your email notification. Leave blank to use 'From Email' address."}],[{type:$t,label:"CC",handle:"cc",instructions:"The email address(es) you would like to be CC'd in the email notification. Separate multiples with commas. Leave blank to not use."},{type:$t,label:"BCC",handle:"bcc",instructions:"The email address(es) you would like to be BCC'd in the email notification. Separate multiples with commas. Leave blank to not use."}]]},{name:u("Advanced"),rows:[[{type:Fo,label:"Handle",handle:"handle",instructions:"Unique identifier for this template.",required:!0,onChange:t=>Os(t)}],[{type:Fo,label:"Description",handle:"description",instructions:"Description of this notification.",multiline:!0}],[{type:p3,label:"Include Attachments",handle:"includeAttachments",instructions:"Include uploaded files as attachments in email notification."}],[{type:u3,label:"Predefined Assets",handle:"presetAssets",minEdition:le.Pro,instructions:"Select any Assets you wish to include as attachments on all email notifications using this template."}]]},{name:u("Templates"),rows:[[{type:x3,label:"Template Wrapper",handle:"wrapperId",instructions:"The template wrapper for the email notification. This is the HTML that wraps around the body of the email.",emptyOption:"No Wrapper",optionDefinition:async()=>(await N.get("/api/templates/wrappers")).data.map(n=>({label:n.name,value:String(n.id)}))}],[{type:h3,label:"PDF Templates",handle:"pdfTemplateIds",minEdition:le.Pro,instructions:"Select any PDF templates to use for this notification.",optionDefinition:async()=>(await N.get("/api/templates/pdf")).data.map(n=>({label:n.name,value:n.id}))}]]},{name:u("Preview"),rows:[[{type:Gd,label:"Preview",handle:"preview",instructions:"This will give you a rough idea of how your notification will look to the recipient."}]]}],D3=li[0].name,P3=({data:t,closeModal:n})=>{const{formId:s}=K(),o=t?.id,i=X(),{data:r,isLoading:a}=t3(o),l=n3(s&&Number(s)),[d,h]=m.useState(D3),[x,g]=m.useState(),[b,y]=m.useState({});m.useEffect(()=>()=>{g(void 0),y({}),i.removeQueries({queryKey:Vd.preview})},[i.removeQueries]);const j=async()=>{await l.mutate(x,{onSuccess:w=>{g(v=>({...v,id:w.id})),i.invalidateQueries({queryKey:nr.one(o)}),i.invalidateQueries({queryKey:je.templates()}),i.invalidateQueries({queryKey:je.formTemplates(Number(s))}),n(),typeof t?.onSuccess=="function"&&t.onSuccess(w.id)},onError:w=>{y(w.errors.notification)}})};return m.useEffect(()=>{r&&g(r)},[r]),e.jsxs(s3,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:e.jsx(Z,{loadingText:u("Loading..."),loading:a,spinner:!0,children:r?.name||"New Template"})})}),e.jsx(i3,{children:li.map(w=>e.jsx(r3,{className:T(w.name===d&&"active",E1(b,w.rows.flatMap(v=>v.map($=>$.handle)))&&"errors"),onClick:()=>h(w.name),children:e.jsx("span",{children:w.name})},w.name))}),e.jsx(o3,{children:!a&&r!==void 0&&li.map(w=>e.jsx(a3,{className:T(w.name===d&&"active"),children:w.rows.map((v,$)=>e.jsx(l3,{children:v.map(C=>{if("minEdition"in C&&C.minEdition&&!I.editions.isAtLeast(C.minEdition))return null;let E;return C.type===Gd&&(E={...x,formId:s?Number(s):void 0}),e.jsx(C.type,{...C,context:E,inView:w.name===d,value:x?.[C.handle]||"",errors:b?.[C.handle],onChange:F=>{"onChange"in C&&C.onChange&&(F=C.onChange(F)),g(z=>({...z,[C.handle]:F})),"updateState"in C&&C.updateState&&g(z=>C.updateState(F,z))}},C.handle)})},$))},w.name))}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:j,children:e.jsx(Z,{loadingText:u("Saving..."),loading:l.isPending,spinner:!0,children:u("Save")})})]})]})},or=()=>{const{openModal:t}=it();return(n={})=>{t(P3,{...n},{allowEscape:!1,requireConfirmation:!0,confirmationMessage:"Are you sure you want to close? Any unsaved changes will be lost."})}},B3=({active:t,openEditOnClick:n,template:s,onClick:o})=>{const{id:i,name:r}=s,a=X(),l=or();return e.jsxs(Kd,{className:T(t?"active":""),onClick:()=>{n?l({id:i}):o(s)},children:[e.jsx(qd,{title:r,children:r}),!!s.formId&&e.jsxs(Qd,{children:[e.jsx(si,{title:u("Edit"),onClick:d=>(d.preventDefault(),d.stopPropagation(),l({id:i}),!1),children:e.jsx("i",{className:"fa-solid fa-pencil"})}),e.jsx(si,{title:u("Delete"),onClick:d=>(d.preventDefault(),d.stopPropagation(),confirm(u("Are you sure you want to delete this template?"))&&N.post("/api/templates/notifications/delete",{id:i}).then(()=>{a.invalidateQueries({queryKey:je.templates()}),a.invalidateQueries({queryKey:je.formTemplates(s.formId)})}).catch(h=>{const x=Object.values(h.errors).join(", ");Ye.error(x)}),!1),children:e.jsx("i",{className:"fa-solid fa-xmark"})})]})]})},ci=({value:t,title:n,templates:s,canCreate:o,openEditOnClick:i,onClick:r,onCreate:a})=>{const l=m.useRef(null),[d,h]=m.useState(!1);return m.useEffect(()=>{const x=l.current;x&&h(x.scrollHeight>x.clientHeight)},[]),s===void 0||!s?.length&&!o?null:e.jsxs(B5,{children:[e.jsx(O5,{children:e.jsx("span",{children:n})}),e.jsxs(W5,{ref:l,className:T(d&&"has-scroll"),children:[s.map(x=>e.jsx(B3,{openEditOnClick:i,active:t===x.id,template:x,onClick:r},x.id)),o&&e.jsx(_5,{onCreate:a})]})]})},ir=t=>{const{formId:n}=K(),{data:s,isFetching:o}=xh(),{data:i,isFetching:r}=mh(Number(n)),[a,l]=m.useState([]),[d,h]=m.useState(),[x,g]=m.useState({global:[]});return m.useEffect(()=>{s&&!o&&g(b=>({...b,global:s.templates}))},[s,o]),m.useEffect(()=>{i&&!r&&g(b=>({...b,form:i}))},[i,r]),m.useEffect(()=>{let b=x?.global?.find(y=>y.id===t);b||(b=x?.form?.find(y=>y.id===t)),h(b)},[t,x]),m.useEffect(()=>{const b=[];x.form&&b.push({label:"Form",icon:e.jsx("i",{className:"fa-solid fa-file"}),children:x.form.map(y=>({label:y.name,value:String(y.id)}))}),x.global&&b.push({label:"Global",icon:e.jsx("i",{className:"fa-solid fa-earth-americas"}),children:x.global.map(y=>({label:y.name,value:String(y.id)}))}),l(b)},[x]),{templates:x,options:a,isFetching:o,selectedTemplate:d}},Jd=c(W.div)`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};

  padding: 0;
`,O3=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const{size:r}=Hi(),{templates:a,options:l,isFetching:d}=ir(t),h=or(),{templates:{canCreate:x,method:g}}=I;if(d&&!a)return e.jsx(_,{property:n,errors:s,children:"loading"});const b=j=>{o(j.id)},y=()=>{h({type:"form",onSuccess:j=>{o(j)}})};return e.jsxs(_,{property:n,errors:s,context:i,children:[r==="small"&&e.jsx(ce,{emptyOption:"Select a template",loading:d,options:l,onChange:j=>o(j),value:String(t||"")}),r==="normal"&&e.jsxs(Jd,{children:[e.jsx(ci,{value:t,title:u("Form Templates"),templates:a.form,onClick:b,canCreate:x&&g!==Yn.Global,onCreate:y}),e.jsx(ci,{value:t,title:u("Global Templates"),templates:a.global,onClick:b})]})]})},W3=c.div`
  display: grid;
  align-items: center;
  gap: ${f.md};

  grid-template-columns: 1.5fr 1fr 1.5fr 20px;
`,_3=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75"}),e.jsx("path",{d:"m11.875 3.125-8.75 8.75m0-8.75 8.75 8.75",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2"})]}),Ma=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"})}),Ia=(t,n)=>n!==void 0?[...t.slice(0,n+1),{email:"",name:""},...t.slice(n+1)]:[...t||[],{email:"",name:""}],Ra=(t,n)=>t.filter((s,o)=>o!==n),H3=(t,n,s)=>{const o=[...s];return o[t]=n,o},U3=c.ul``,Aa=c.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 40px;

  border-right: 1px solid rgba(96, 125, 159, 0.25);
  background-color: ${p.gray050};

  ${We};
  font-weight: normal;

  svg {
    width: 16px;
    height: 16px;
  }
`,Da=c.input`
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
    color: ${p.gray200};
  }
`,Zd=c.button`
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
`,Pa=c.li`
  display: flex;
  justify-content: space-between;
  gap: 0;

  overflow: hidden;
  border: 1px solid rgba(96, 125, 159, 0.25);

  &:hover {
    ${Zd} {
      transform: rotate(0deg);
      opacity: 1;
    }
  }

  &:not(:last-child) {
    border-bottom: none;
  }

  &:first-child {
    border-top-left-radius: ${k.lg};
    border-top-right-radius: ${k.lg};
  }

  &:last-child {
    border-bottom-left-radius: ${k.lg};
    border-bottom-right-radius: ${k.lg};
  }
`,rr=me.memo(({value:t,onChange:n})=>{const{activeCell:s,setActiveCell:o,setCellRef:i,keyPressHandler:r}=Ln(t.length,1),a=()=>{o(t.length,0),n(Ia(t))};return e.jsxs(e.Fragment,{children:[e.jsxs(U3,{children:[!t.length&&e.jsxs(Pa,{children:[e.jsx(Aa,{children:e.jsx(Ma,{})}),e.jsx(Da,{type:"text",className:T("text","fullwidth","code"),placeholder:"john.doe@example.com",onClick:()=>a(),onFocus:()=>a()})]}),t?.map((l,d)=>e.jsxs(Pa,{children:[e.jsx(Aa,{children:e.jsx(Ma,{})}),e.jsx(Da,{type:"text","data-1p-ignore":!0,className:T("text","fullwidth","code"),autoFocus:s===`${d}:0`,ref:h=>i(h,d,0),onFocus:()=>o(d,0),placeholder:"john.doe@example.com",value:l.email,onKeyDown:r({onEnter:({shiftKey:h})=>{const x=h?d+1:t.length;o(x,0),n(Ia(t,h?d:void 0))},onDelete:()=>{n(Ra(t,d)),o(d-1,0)}}),onChange:h=>n(H3(d,{...l,email:h.target.value},t))}),e.jsx(Zd,{tabIndex:-1,onClick:()=>{n(Ra(t,d)),o(Math.max(d-1,0),0)},children:e.jsx(_3,{})})]},d))]}),t.length>0&&e.jsx(ls,{label:"Add a recipient",onClick:a})]})});rr.displayName="RecipientsController";const q3=c.div`
  flex: 2;

  &.multiple {
    grid-column: span 2;
  }
`,Q3=({recipients:t,spanMultiple:n,onChange:s})=>e.jsx(q3,{className:T(n&&"multiple"),children:e.jsx(rr,{value:t,onChange:s})}),Ba=c.div`
  flex: 1 1 0;
`,K3=({id:t,onChange:n})=>{const{templates:s,isFetching:o,selectedTemplate:i}=ir(t);if(o)return e.jsx(Ba,{children:"loading..."});const r=[];return s?.form&&r.push({label:"Form",icon:e.jsx("i",{className:"fa-regular fa-clipboard-list-check"}),children:s.form.map(a=>({label:a.name,value:a.id}))}),s?.global&&r.push({label:"Global",icon:e.jsx("i",{className:"fa-solid fa-earth-americas"}),children:s.global.map(a=>({label:a.name,value:a.id}))}),e.jsx(Ba,{children:e.jsx(ce,{value:i?.id,options:r,emptyOption:"Use default template",onChange:a=>{/^[0-9]+$/.test(a)&&n(Number(a)),n(a)}})})},V3=c.div`
  flex-basis: 20%;
`,G3=c.input`
  &.disabled {
    background: #dfe5ec;
    color: ${p.black};
    opacity: 0.55;
  }
`,Y3=({predefined:t,value:n,onChange:s})=>e.jsx(V3,{children:e.jsx(G3,{className:T("text","fullwidth",t&&"disabled"),readOnly:t,disabled:t,type:"text",value:n,onChange:o=>s(o.target.value)})}),Xd=({predefined:t,mapping:n,removable:s,onChange:o,onRemove:i})=>{const{value:r,template:a,recipients:l}=n;return e.jsxs(W3,{children:[e.jsx(Y3,{predefined:t,value:r,onChange:d=>o({...n,value:d})}),e.jsx(K3,{id:a,onChange:d=>o({...n,template:d})}),e.jsx(Q3,{recipients:l,spanMultiple:!s,onChange:d=>{o({...n,recipients:d})}}),s&&e.jsx(Wd,{children:e.jsx(rt,{onClick:i})})]})},J3=({option:t,mapping:n,allMappings:s,updateValue:o})=>{const i=!!n,r=n||{value:t.value,recipients:[],template:""},a=l=>{let d;i&&(d=s.findIndex(h=>h.value===l.value)),o(d!==void 0?[...s.slice(0,d),l,...s.slice(d+1)]:[...s||[],l])};return e.jsx(Xd,{predefined:!0,mapping:r,onChange:a})},Z3=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};
`,X3=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const r=i.field,a=A(Re.one(r)),l=Ne(a?.typeClass),[d]=Js(a,l),h=x=>t?.find(g=>g.value===x);return e.jsx(_,{property:n,errors:s,context:i,children:e.jsxs(Z3,{children:[!!d&&d.filter(x=>"value"in x).map((x,g)=>e.jsx(J3,{option:x,mapping:h(x.value),allMappings:t,updateValue:o},g)),!!t&&t.map((x,g)=>d.find(b=>b?.value===x.value)?null:e.jsx(Xd,{mapping:x,removable:!0,onRemove:()=>{o([...t.slice(0,g),...t.slice(g+1)])},onChange:b=>{o([...t.slice(0,g),b,...t.slice(g+1)])}},g))]})})},e6=({value:t=[],property:n,errors:s,updateValue:o,context:i})=>e.jsxs(_,{property:n,errors:s,context:i,children:[e.jsx(rr,{value:t,onChange:o}),e.jsx(Yt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while focusing an input to add a new set of inputs."))}})})]}),t6=c.label`
  display: flex;
  justify-content: start;

  ${Gs} {
    margin-bottom: 2px;
  }
`,n6=({value:t,property:n,updateValue:s})=>e.jsxs(ns,{$width:n.width,children:[e.jsx(t6,{children:e.jsxs(Gs,{children:[n.togglable&&e.jsx(Jt,{enabled:t.enabled,onClick:o=>s({...t,enabled:o})}),e.jsx(Cn,{children:u(n.label)})]})}),(!n.togglable||t.enabled)&&e.jsx(_i,{children:e.jsx("input",{type:"text",className:T("text","fullwidth"),placeholder:u("Label"),value:t.label??"",onChange:o=>s({...t,label:o.target.value})})})]}),s6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"})}),o6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M48 96V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V170.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H309.5c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8V184c0 13.3-10.7 24-24 24H104c-13.3 0-24-10.7-24-24V80H64c-8.8 0-16 7.2-16 16zm80-16v80H272V80H128zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"})}),i6=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"})}),r6=c.ul`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${f.sm};

  margin-top: ${f.sm};
`,a6=c.div`
  display: flex;
  gap: 2px;
`,di=c.button`
  display: block;
  padding: 3px 5px;

  border-radius: ${k.md};
  font-size: 16px;

  &:not(.enabled) {
    opacity: 0.2;
  }

  &.submit {
    background-color: ${p.gray600} !important;
    fill: ${p.white} !important;
  }
`,l6=c.li`
  cursor: pointer;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 3px;

  border: 1px solid ${p.gray100};
  border-radius: ${k.md};
  background-color: ${p.gray100};

  transition: background-color 0.2s ease-in-out;

  ${di} {
    fill: ${p.white};
    background: ${p.gray300};
  }

  &.active {
    border-color: ${p.gray500};
    background-color: ${p.gray500};

    ${di} {
      background: ${p.white};
      fill: ${p.gray500};

      &.submit {
        background-color: ${p.gray200} !important;
        fill: ${p.gray600} !important;
      }
    }
  }

  &:not(.active):hover {
    background-color: ${p.gray200};
  }
`,c6={save:e.jsx(o6,{}),back:e.jsx(s6,{}),submit:e.jsx(i6,{})},d6=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const{layouts:r}=n,a=i.order,l={save:i?.buttons?.save,back:i?.buttons?.back,submit:!0},d=[],h=r.map(x=>{const g=x.split(" ").map(b=>b.split("|").filter(y=>l.back||y!=="back").filter(y=>l.save||y!=="save").filter(y=>a!==0||y!=="back").filter(Boolean));return d.some(b=>Es(b,g))?null:(d.push(g),{layout:x,groups:g})}).filter(Boolean);return e.jsx(_,{property:n,errors:s,children:e.jsx(r6,{children:h.map((x,g)=>e.jsx(l6,{onClick:()=>o(x.layout),className:T(t===x.layout&&"active"),children:x.groups.map((b,y)=>e.jsx(a6,{children:b.map((j,w)=>e.jsx(di,{className:T(j,l?.[j]&&"enabled"),children:c6[j]},w))},y))},g))})})},u6=t=>{switch(t){case Ae.Elements:return{source:Ae.Elements,typeClass:"",properties:{}};case Ae.Predefined:return{source:Ae.Predefined,typeClass:"",properties:{}};default:return{source:Ae.Custom,useCustomValues:!1,options:[]}}};class ar extends me.Component{constructor(n){super(n),this.state={hasError:!1}}static getDerivedStateFromError(){return{hasError:!0}}componentDidCatch(n,s){console.error(n,s)}render(){return this.state.hasError?e.jsx("div",{children:this.props.message}):this.props.children}}c.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  width: 100%;
`;const p6=c.button`
  display: block;
  flex: 1;

  padding: ${f.xs} ${f.md};

  background-color: ${p.gray100};
  box-shadow: ${oe.right};
  box-sizing: border-box;

  &.active {
    color: ${p.white};
    background-color: ${p.gray500};
  }

  &:first-child {
    border-top-left-radius: ${k.lg};
    border-bottom-left-radius: ${k.lg};
  }

  &:last-child {
    border-top-right-radius: ${k.lg};
    border-bottom-right-radius: ${k.lg};

    box-shadow: none;
  }
`,hs=c.div`
  display: flex;
  flex-direction: column;
  justify-content: ${t=>t.$justifyContent||"flex-start"};
  align-items: ${t=>t.$alignItems||"stretch"};
  gap: ${t=>t.$gap||f.sm};
`,cn=c.div`
  display: flex;
  justify-content: ${t=>t.$justifyContent||"flex-start"};
  align-items: ${t=>t.$alignItems||"stretch"};
  gap: ${t=>t.$gap||f.sm};
`,eu=({value:t,updateValue:n,property:s,typeProviderQuery:o,convertToCustomValues:i})=>{const[r,a]=m.useState(t.typeClass),{data:l,isFetching:d}=o(),h=l?.find(x=>x.typeClass===r);return e.jsxs(hs,{children:[s.showEmptyOption&&e.jsx(Le,{property:{type:Y.String,label:"Empty Option Label (optional)",handle:"emptyOption"},context:t,value:t.emptyOption,updateValue:x=>{n({...t,emptyOption:x})}}),e.jsx(_,{property:{type:Y.Select,label:"Type",handle:"predefinedOptionTypeClass",options:[]},children:e.jsx(ce,{emptyOption:"Choose type",loading:d,value:t.typeClass,onChange:x=>{const g={},b=l?.find(y=>y.typeClass===x);b&&b.properties.forEach(y=>{g[y.handle]=y.value}),a(x),n({...t,typeClass:x,properties:g})},options:l?.map(x=>({label:x.name,value:x.typeClass}))})}),h?.properties.map(x=>{let g="";return t?.properties?.[x.handle]!==void 0?g=t.properties[x.handle]:x.value!==void 0&&(g=x.value),e.jsx(Le,{property:x,context:t,value:g,updateValue:b=>{n({...t,properties:{...t.properties,[x.handle]:b}})}},x.handle)}),r&&I.limitations.can("layout.options.convert")&&e.jsx(ns,{className:"spacing-small",children:e.jsx(p6,{className:"btn small",onClick:()=>{confirm(u("Are you sure? This will allow you to customize and reorder the options, but they will become out of sync with the Element or Predefined options currently configured."))&&i()},children:u("Convert to Custom Values")})})]})},tu=()=>B({queryKey:["option-types","elements"],queryFn:()=>N.get("/api/types/options/elements").then(t=>t.data),staleTime:1/0}),h6=({value:t,updateValue:n,property:s,convertToCustomValues:o})=>e.jsx(eu,{value:t,updateValue:n,property:s,defaultValue:"",updateDefaultValue:()=>{},typeProviderQuery:tu,convertToCustomValues:o}),x6=()=>B({queryKey:["option-types","predefined"],queryFn:()=>N.get("/api/types/options/predefined").then(t=>t.data),staleTime:1/0}),m6=({value:t,updateValue:n,property:s,convertToCustomValues:o})=>e.jsx(eu,{value:t,updateValue:n,property:s,defaultValue:"",updateDefaultValue:()=>{},typeProviderQuery:x6,convertToCustomValues:o});var ee=(t=>(t.FieldType="field-type",t.FavoriteField="favorite-field",t.Field="field",t.Row="row",t.OptionRow="option-row",t.Page="page",t))(ee||{});const g6=t=>{const[{isDragging:n},s,o]=Ei(()=>({type:ee.OptionRow,item:()=>({index:t}),collect:i=>({isDragging:i.isDragging()})}),[t]);return{isDragging:n,drag:s,preview:o}},f6=(t,n,s)=>{const[{handlerId:o},i]=Gn(()=>({accept:ee.OptionRow,collect:r=>({handlerId:r.getHandlerId()}),hover:(r,a)=>{if(!n.current)return;const l=t,d=r.index;if(d===l)return;const h=n.current?.getBoundingClientRect(),x=(h.bottom-h.top)/2,b=a.getClientOffset().y-h.top;d<l&&b<x||d>l&&b>x||(s(d,l),r.index=l)}}),[n,s]);return{handlerId:o,drop:i}},lr=({index:t,dragRef:n,onDrop:s,children:o})=>{const i=m.useRef(null),{handlerId:r,drop:a}=f6(t,i,s),{isDragging:l,drag:d,preview:h}=g6(t);return m.useEffect(()=>{d(n)},[d,n]),m.useEffect(()=>{a(h(i))},[a,h]),e.jsx(Ps,{ref:i,className:T(l&&"dragging"),"data-handler-id":r,children:o})},Zs=t=>e.jsx(R,{height:"1em",viewBox:"0 0 448 512",...t,children:e.jsx("path",{d:"M336 176a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm-160 0a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM64 224a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM336 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM224 384a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM16 336a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z"})}),nu=({value:t,property:n,context:s,errors:o,updateValue:i})=>{const{options:r,emptyOption:a}=n;return e.jsx(_,{property:n,errors:o,context:s,children:e.jsx(ce,{value:t??"",emptyOption:a,options:r,onChange:i})})},b6=c(tt)`
  min-width: 400px;
`,y6=({open:t,close:n,bulkImport:s})=>{const[o,i]=m.useState("|"),[r,a]=m.useState(!0),[l,d]=m.useState(""),h=m.useRef(null),x=()=>{s(l,o,r),d(""),n()};return Mt({callback:g=>{g.key==="Enter"&&g.metaKey&&x()},meetsCondition:t,type:"keydown",ref:h},[l,o,r]),e.jsxs(b6,{className:"bulk-editor",children:[e.jsx(nu,{value:o,updateValue:g=>i(g),property:{label:u("Separator"),instructions:u("Select the separator used to separate the option label and value when using custom values for option labels."),handle:"separator",type:Y.Select,value:"|",options:[{value:"|",label:"|"},{value:",",label:","},{value:";",label:";"},{value:"=>",label:"=>"},{value:" ",label:"Space"}]}}),e.jsx(fn,{updateValue:g=>a(g),value:r,property:{label:u("Append Values"),handle:"append",type:Y.Boolean}}),e.jsx(os,{value:l,updateValue:g=>d(g),focus:t,ref:h,property:{label:u("Bulk Editor"),instructions:u("Enter bulk values separated by new lines. If using custom values for option labels, you can provide a label and a value separated by a separator. For example, if you used `{separator}` you would write: `Label{separator}value`.",{separator:o}),handle:"bulkEditor",type:Y.Textarea,rows:10}}),e.jsx("button",{type:"button",className:"btn submit",onClick:x,children:u(r?"Append Options with Bulk Import":"Replace Options with Bulk Import")})]})},j6=c.div`
  display: flex;
  justify-content: space-between;
`,v6=c.div`
  flex: 0 1 auto;
`,su=c.button`
  display: flex;
  align-items: center;
  gap: ${f.sm};

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
`;c.div`
  position: relative;
`;const ou=c.div`
  display: flex;
  flex-direction: column;
`,w6=({options:t,copyValues:n})=>{const[s,o]=m.useState(0),i=m.useCallback(()=>t.map(({label:r,value:a,optgroup:l})=>{const d=[];return l&&d.push("@@"),d.push(r),n&&d.push(`|${a}`),d.join("")}).join(`
`),[t,n]);return e.jsxs(su,{onClick:()=>{navigator.clipboard.writeText(i()),o(1),setTimeout(()=>o(0),2e3)},children:[e.jsx("i",{className:T(s===0&&"fa-classic fa-copy",s===1&&"fa-classic fa-check")}),e.jsx("span",{children:u(s===0?"Copy to clipboard":"Copied")})]})},Oa=(t,n)=>({...t,options:[...t.options.slice(0,n),{label:"",value:""},...t.options.slice(n)]}),$6=(t,n)=>({...t,options:n}),To=(t,n,s)=>{const o=[...s.options];return o[t]=n,{...s,options:o}},C6=(t,n)=>{const s=n.options.filter((o,i)=>i!==t);return{...n,options:s}},k6=t=>({...t,options:t.options.filter(n=>!!n.label||!!n.value)}),S6=(t,n)=>n?{...t,useCustomValues:n}:{...t,useCustomValues:n,options:t.options.map(s=>({...s,value:s.label}))},L6=(t,n,s)=>{const o=[...t.options];return{...t,options:qs(o,{$splice:[[n,1],[s,0,o[n]]]})}},F6=({value:t,updateValue:n,defaultValue:s,updateDefaultValue:o,isMultiple:i,allowOptgroup:r,autoUpdateHandle:a})=>{const[l,d]=m.useState(t),h=as(l,500);m.useEffect(()=>{n(h)},[h,n]),m.useEffect(()=>{l.options.length||d(Oa(l,0))},[l]);const{options:x=[],useCustomValues:g=!1}=l,b=m.useRef([]);b.current=x.map((E,F)=>b.current[F]||me.createRef());const{activeCell:y,setActiveCell:j,setCellRef:w,keyPressHandler:v}=Ln(x.length,g?2:1),$=(E,F)=>{j(F!==void 0?F+1:x.length,E),d(Oa(l,F===void 0?x.length:F+1))},C=(E,F,z)=>{let M=[];z&&(x[0]&&x[0].label===""&&x[0].value===""?M=[]:M=[...x]),E.split(`
`).forEach(S=>{let[D,P]=S.split(F);D=D.trim(),P=P?.trim();let ae=!1;D.startsWith("@@")&&(ae=!0,D=D.replace(/^@@/,"").trim()),!(!D&&!P)&&M.push({label:D,value:g&&P?P:D,optgroup:ae})}),d($6(l,M))};return e.jsxs(tt,{children:[e.jsxs(j6,{children:[e.jsx(fn,{property:{label:u("Use custom values"),handle:"useCustomValues",type:Y.Boolean},value:g,updateValue:()=>d(S6(l,!g))}),e.jsxs(v6,{children:[e.jsx(qe,{preview:e.jsxs(su,{children:[e.jsx("i",{className:"fa-duotone fa-list"}),e.jsx("span",{children:u("Add options in bulk")})]}),children:(E,F)=>e.jsx(y6,{open:E,close:F,bulkImport:C})}),e.jsx(w6,{options:l.options,copyValues:g})]})]}),!!x.length&&e.jsxs(ou,{children:[e.jsx(us,{children:e.jsxs(ps,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[r&&e.jsx("th",{children:u("Optgroup")}),e.jsx("th",{children:u("Label")}),g&&e.jsx("th",{children:u("Value")}),x.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("th",{children:u("Selected")}),e.jsx("th",{colSpan:2,children:u("Actions")})]})]})}),e.jsx("tbody",{children:x.map((E,F)=>e.jsxs(lr,{index:F,dragRef:b.current[F],onDrop:(z,M)=>d(L6(l,z,M)),children:[r&&e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(Jt,{enabled:E.optgroup,onClick:z=>d(To(F,{...E,optgroup:z},l))})})}),e.jsx(de,{children:e.jsx(nt,{type:"text",value:E.label,placeholder:u("Label"),autoFocus:y===`${F}:0`,ref:z=>w(z,F,0),onFocus:()=>j(F,0),onKeyDown:v({onEnter:({shiftKey:z})=>{$(0,z?F:void 0)}}),onChange:z=>d(To(F,{...E,label:z.target.value,value:a||!g?z.target.value:E.value},l))})}),g&&e.jsx(de,{children:e.jsx(nt,{type:"text",className:"code",value:E.value,placeholder:u("Value"),autoFocus:y===`${F}:1`,ref:z=>w(z,F,1),onFocus:()=>j(F,1),onKeyDown:v({onEnter:({shiftKey:z})=>{$(1,z?F:void 0)}}),onChange:z=>d(To(F,{...E,value:z.target.value},l))})}),x.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(fn,{property:{label:"",handle:`${F}-check`,type:Y.Boolean,width:50},value:i?s.includes(E.value):E.value===s,updateValue:()=>{if(i){const z=s;o(z.includes(E.value)?z.filter(M=>M!==E.value):[...z,E.value])}else o(E.value===s?"":E.value)}})})}),e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(Rt,{ref:b.current[F],className:"handle",children:e.jsx(Zs,{})})})}),e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(Rt,{onClick:()=>{d(C6(F,l)),j(Math.max(F-1,0),0)},children:e.jsx(cs,{})})})})]})]},F))})]})}),e.jsx(ls,{label:"Add an option",onClick:()=>$(0)})]}),e.jsx(Yt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},T6=c(Gi)`
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
`,E6=({value:t})=>{const{options:n=[],useCustomValues:s}=t;return e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(Gt,{children:[!n.length&&e.jsx(vt,{children:u("Not configured yet")}),n.map((o,i)=>e.jsxs(T6,{children:[e.jsx(gn,{"data-empty":u("empty"),children:o.label}),s&&e.jsx(gn,{"data-empty":u("empty"),children:o.value})]},i))]})})},z6=({value:t,updateValue:n,property:s,defaultValue:o,updateDefaultValue:i,isMultiple:r,autoUpdateHandle:a})=>e.jsxs(e.Fragment,{children:[e.jsx(Cn,{children:u("Options")}),e.jsx(qe,{preview:e.jsx(E6,{value:t,defaultValue:o,isMultiple:r}),excludeClassNames:["bulk-editor"],onAfterEdit:()=>n(k6(t)),children:e.jsx(F6,{value:t,updateValue:n,property:s,defaultValue:o,updateDefaultValue:i,isMultiple:r,allowOptgroup:s.allowOptgroup,autoUpdateHandle:a})})]}),N6=Object.freeze(Object.defineProperty({__proto__:null,custom:z6,elements:h6,predefined:m6},Symbol.toStringTag,{value:"Module"})),M6=N6,I6=({value:t,updateValue:n,property:s,defaultValue:o,updateDefaultValue:i,convertToCustomValues:r,isMultiple:a,autoUpdateHandle:l})=>{const{source:d=Ae.Custom}=t,h=M6[d];return h===void 0?e.jsxs("div",{children:[d," not implemented..."]}):(h.displayName=`Source <${d}>`,e.jsx(ar,{message:`...${d} not implemented`,children:e.jsx(m.Suspense,{children:e.jsx(h,{value:t,updateValue:n,property:s,defaultValue:o,updateDefaultValue:i,convertToCustomValues:r,isMultiple:a,autoUpdateHandle:l})})}))};c.div`
  display: flex;
  align-items: center;
  gap: 0px;

  margin-left: 5px;

  svg {
    width: 20px;
    height: 20px;
  }
`;const R6=c.span`
  width: 200px;
  display: block;
  padding: 0 5px;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  background: #00000005;
  color: ${p.gray300};
`,A6=({value:t,defaultValue:n,isMultiple:s,property:o,field:i})=>{const{getTranslation:r,updateTranslation:a}=ye(i),l=t.source==="custom"&&t.options||[],d=r(o.handle,{}),h=d.options||[],x=d.defaultValue||n,g=m.useRef([]);g.current=l.map((v,$)=>g.current[$]||me.createRef());const{activeCell:b,setActiveCell:y,setCellRef:j,keyPressHandler:w}=Ln(l.length,1);return e.jsx(tt,{children:e.jsx(us,{children:e.jsx(ps,{children:e.jsx("tbody",{children:l.map((v,$)=>{const C=h.find(z=>z.value===v.value);let E=!1;x===void 0?s?E=n.includes(v.value):E=n===v.value:s?E=x.includes(v.value):E=x===v.value;const F=C!==void 0?C.label:v.label;return e.jsxs(Ps,{children:[e.jsx(de,{style:{width:200},children:e.jsx(R6,{className:"code",title:v.value,children:v.value||u("Empty")})}),e.jsx(de,{children:e.jsx(nt,{type:"text",value:F,placeholder:u("Label"),autoFocus:b===`${$}:0`,ref:z=>j(z,$,0),onFocus:()=>y($,0),onKeyDown:w(),onChange:z=>{const M=pt(h),S=M.findIndex(D=>D.value===v.value);S===-1?M.push({value:v.value,label:z.target.value}):M[S].label=z.target.value,a(o.handle,{...d,options:M})}})}),e.jsx(de,{$tiny:!0,children:e.jsx(Jt,{enabled:E,onClick:z=>{if(!s){a(o.handle,{...d,defaultValue:z?v.value:""});return}let M;typeof x=="object"?M=[...x]:M=[],z&&!M.includes(v.value)?M.push(v.value):!z&&M.includes(v.value)&&M.splice(M.indexOf(v.value),1),a(o.handle,{...d,defaultValue:M})}})})]},$)})})})})})},D6=({value:t,defaultValue:n,isMultiple:s,field:o,property:i})=>{const{hasTranslation:r,getTranslation:a,removeTranslation:l}=ye(o);if(t.source!=="custom")return null;const{options:d}=t,{handle:h}=i,g=a(h,{}).options||[];return e.jsxs(e.Fragment,{children:[e.jsx(Yc,{label:"Options",handle:h,translatable:!0,hasTranslation:r(h),removeTranslation:()=>l(h)}),e.jsx(qe,{preview:e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(Gt,{children:[!d.length&&e.jsx(vt,{children:u("Not configured yet")}),d.map((b,y)=>e.jsxs(Gi,{children:[e.jsx(gn,{"data-empty":u("empty"),children:g.find(j=>j.value===b.value)?.label||b.label}),e.jsx(gn,{className:"code","data-empty":u("empty"),children:b.value})]},y))]})}),excludeClassNames:["bulk-editor"],children:e.jsx(A6,{value:t,defaultValue:n,isMultiple:s,field:o,property:i})})]})},P6=({value:t,field:n,property:s,context:o})=>{const{getTranslation:i,updateTranslation:r}=ye(n),{data:a,isFetching:l}=tu();if(t.source!=="elements")return null;const{handle:d}=s,h=t.typeClass,x=a?.find(j=>j.typeClass===h),g=i(d,{}),b=g.emptyOption||"",y=g.properties||{};return e.jsx(_,{property:s,context:o,children:e.jsxs(hs,{children:[s.showEmptyOption&&e.jsx(Le,{property:{type:Y.String,label:"Empty Option Label (optional)",handle:"emptyOption"},context:t,value:b,updateValue:j=>{r(d,{...g,emptyOption:j})}}),e.jsx(_,{property:{type:Y.Select,label:"Type",handle:"predefinedOptionTypeClass",options:[]},children:e.jsx(ce,{emptyOption:"Choose type",loading:l,value:t.typeClass,options:[{label:x?.name||"",value:x?.typeClass||""}]})}),x?.properties.map(j=>{let w="";return y?.[j.handle]!==void 0?w=y[j.handle]:t.properties[j.handle]!==void 0&&(w=t.properties[j.handle]),e.jsx(Le,{property:j,context:t,value:w,updateValue:v=>{r(d,{...g,properties:{...g.properties,[j.handle]:v}})}},j.handle)})]})})},B6=t=>{const{value:n}=t;switch(n.source){case"custom":return e.jsx(D6,{...t});case"elements":return e.jsx(P6,{...t});default:return null}},O6=({value:t,errors:n,property:s,updateValue:o,context:i})=>{const{source:r}=t,a=i.properties.defaultValue,l=Ne(i.typeClass),d=l?.implements.includes("multiValue"),h=i?.id===void 0,{willTranslate:x}=ye(i),[g]=Js(i,l),b=H(),y=w=>{b(fe.edit({uid:i.uid,handle:"defaultValue",value:w}))},j=()=>o({source:Ae.Custom,useCustomValues:!0,options:[...g]});return x(s.handle)?e.jsx(B6,{property:s,value:t,field:i,defaultValue:a,isMultiple:d,context:i}):e.jsxs(e.Fragment,{children:[I.editions.isAtLeast(le.Lite)&&e.jsxs(ns,{$width:s.width,children:[e.jsx(Cn,{children:u("Source")}),e.jsx(Ji,{options:w5,value:r,onClick:w=>{w!==r&&o(u6(w))}})]}),e.jsx(I6,{value:t,updateValue:o,property:s,defaultValue:a,updateDefaultValue:y,convertToCustomValues:j,isMultiple:d,allowOptgroup:s.allowOptgroup,autoUpdateHandle:h}),e.jsx(Ks,{errors:n})]})},W6=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m120.714 94.857c-14.302 0-25.857 11.555-25.857 25.857v258.572c0 14.302 11.555 25.857 25.857 25.857h258.572c14.302 0 25.857-11.555 25.857-25.857v-258.572c0-14.302-11.555-25.857-25.857-25.857zm-51.714 25.857c0-28.523 23.191-51.714 51.714-51.714h258.572c28.523 0 51.714 23.191 51.714 51.714v258.572c0 28.523-23.191 51.714-51.714 51.714h-258.572c-28.523 0-51.714-23.191-51.714-51.714zm267.702 86.703-103.428 103.428c-5.01 5.01-13.252 5.01-18.262 0l-51.714-51.714c-5.01-5.01-5.01-13.252 0-18.262s13.252-5.01 18.261 0l42.584 42.584 94.298-94.298c5.009-5.01 13.251-5.01 18.261 0s5.01 13.252 0 18.262z"})]}),_6=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m107.143 421.429c-15.804 0-28.572-12.768-28.572-28.572v-285.714c0-15.804 12.768-28.572 28.572-28.572h285.714c15.804 0 28.572 12.768 28.572 28.572v285.714c0 15.804-12.768 28.572-28.572 28.572zm-57.143-28.572c0 31.518 25.625 57.143 57.143 57.143h285.714c31.518 0 57.143-25.625 57.143-57.143v-285.714c0-31.518-25.625-57.143-57.143-57.143h-285.714c-31.518 0-57.143 25.625-57.143 57.143zm200-57.143c8.571 0 16.696-3.571 22.5-9.821l85.268-91.786c4.196-4.553 6.518-10.536 6.518-16.696 0-13.572-10.982-24.554-24.554-24.554h-179.464c-13.572 0-24.554 10.982-24.554 24.554 0 6.16 2.322 12.143 6.518 16.696l85.268 91.786c5.804 6.25 13.929 9.821 22.5 9.821zm-1.518-29.196-79.018-85.089h161.072l-78.929 85.089c-.357.446-.982.625-1.518.625-.535 0-1.16-.268-1.518-.625z"})]}),H6=t=>e.jsxs(R,{height:"500",viewBox:"0 0 500 500",width:"500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m380.843 92.184c-24.515-24.514-64.277-24.514-88.791 0l-161.743 161.744c-39.425 39.425-39.425 103.28 0 142.705s103.28 39.425 142.705 0l128.047-128.047c5.223-5.223 13.815-5.223 19.038 0s5.223 13.815 0 19.038l-128.047 128.047c-49.955 49.955-130.911 49.955-180.782 0s-49.955-130.827 0-180.782l161.744-161.743c35.044-35.045 91.823-35.045 126.867 0 35.045 35.044 35.045 91.823 0 126.867l-154.835 154.836c-23.757 23.756-62.844 21.566-83.905-4.633-17.943-22.409-16.174-54.757 4.128-75.059l127.963-127.879c5.223-5.223 13.815-5.223 19.038 0s5.223 13.816 0 19.039l-127.878 127.878c-10.615 10.615-11.541 27.463-2.19 39.172 10.951 13.647 31.337 14.827 43.721 2.443l154.92-154.835c24.514-24.514 24.514-64.276 0-88.791z"})]}),U6=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M352 128L352 96L288 96L288 288L96 288L96 352L288 352L288 544L352 544L352 352L544 352L544 288L352 288L352 128z"})}),q6=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m52 108.571c0-15.621 12.664-28.285 28.286-28.285 15.621 0 28.285 12.664 28.285 28.285 0 15.622-12.664 28.286-28.285 28.286-15.622 0-28.286-12.664-28.286-28.286zm84.857 0c0-31.243-25.328-56.571-56.571-56.571-31.244 0-56.572 25.328-56.572 56.571 0 31.244 25.328 56.572 56.572 56.572 31.243 0 56.571-25.328 56.571-56.572zm56.572 0c0 7.779 6.364 14.143 14.142 14.143h254.572c7.778 0 14.143-6.364 14.143-14.143 0-7.778-6.365-14.142-14.143-14.142h-254.572c-7.778 0-14.142 6.364-14.142 14.142zm0 141.429c0 7.779 6.364 14.143 14.142 14.143h254.572c7.778 0 14.143-6.364 14.143-14.143s-6.365-14.143-14.143-14.143h-254.572c-7.778 0-14.142 6.364-14.142 14.143zm0 141.429c0 7.778 6.364 14.142 14.142 14.142h254.572c7.778 0 14.143-6.364 14.143-14.142 0-7.779-6.365-14.143-14.143-14.143h-254.572c-7.778 0-14.142 6.364-14.142 14.143zm-113.143-113.143c-15.622 0-28.286-12.664-28.286-28.286s12.664-28.286 28.286-28.286c15.621 0 28.285 12.664 28.285 28.286s-12.664 28.286-28.285 28.286zm0-84.857c-31.244 0-56.572 25.327-56.572 56.571s25.328 56.571 56.572 56.571c31.243 0 56.571-25.327 56.571-56.571s-25.328-56.571-56.571-56.571zm14.143-84.858c0-7.81-6.332-14.142-14.143-14.142s-14.143 6.332-14.143 14.142c0 7.811 6.332 14.143 14.143 14.143s14.143-6.332 14.143-14.143zm-42.429 282.858c0-15.622 12.664-28.286 28.286-28.286 15.621 0 28.285 12.664 28.285 28.286 0 15.621-12.664 28.285-28.285 28.285-15.622 0-28.286-12.664-28.286-28.285zm84.857 0c0-31.244-25.328-56.572-56.571-56.572-31.244 0-56.572 25.328-56.572 56.572 0 31.243 25.328 56.571 56.572 56.571 31.243 0 56.571-25.328 56.571-56.571z"})]}),Q6=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m62 132.5c-12.998 0-23.5 10.502-23.5 23.5v188c0 12.998 10.502 23.5 23.5 23.5h376c12.998 0 23.5-10.502 23.5-23.5v-188c0-12.998-10.502-23.5-23.5-23.5zm-47 23.5c0-25.923 21.077-47 47-47h376c25.923 0 47 21.077 47 47v188c0 25.923-21.077 47-47 47h-376c-25.923 0-47-21.077-47-47zm94 35.25v117.5c0 6.462-5.287 11.75-11.75 11.75s-11.75-5.288-11.75-11.75v-117.5c0-6.463 5.287-11.75 11.75-11.75s11.75 5.287 11.75 11.75z"})]}),K6=t=>e.jsxs(R,{viewBox:"0 0 500 500",...t,children:[e.jsx("path",{d:"m0 0h500v500h-500z",fill:"none"}),e.jsx("path",{d:"m439.507 97.861 8.519 8.519c8.948 8.948 8.948 23.48 0 32.357l-19.114 19.185-40.804-40.804 18.899-19.185c8.948-9.02 23.48-9.092 32.5-.072zm-169.373 138.663 101.867-103.156 40.732 40.733-102.439 102.511c-3.15 3.15-7.159 5.298-11.526 6.228l-44.025 9.235 9.234-44.169c.931-4.295 3.007-8.232 6.157-11.382zm120.623-154.698-136.945 138.591c-6.156 6.228-10.452 14.174-12.241 22.764l-12.886 61.35c-.787 3.794.358 7.731 3.078 10.451 2.721 2.721 6.658 3.938 10.452 3.079l61.206-12.814c8.734-1.862 16.68-6.157 22.979-12.456l137.876-137.804c17.896-17.896 17.896-46.889 0-64.785l-8.519-8.591c-17.968-17.968-47.104-17.896-65 .215zm-322.64 75.094c-25.27 0-45.815 20.545-45.815 45.815v183.261c0 25.27 20.545 45.815 45.815 45.815h320.707c25.27 0 45.815-20.545 45.815-45.815v-125.992c0-6.299-5.154-11.454-11.454-11.454s-11.454 5.155-11.454 11.454v125.992c0 12.671-10.237 22.908-22.907 22.908h-320.707c-12.671 0-22.907-10.237-22.907-22.908v-183.261c0-12.671 10.236-22.907 22.907-22.907h171.807c6.3 0 11.454-5.155 11.454-11.454 0-6.3-5.154-11.454-11.454-11.454zm45.815 154.626c9.489 0 17.181-7.692 17.181-17.18 0-9.489-7.692-17.181-17.181-17.181-9.488 0-17.18 7.692-17.18 17.181 0 9.488 7.692 17.18 17.18 17.18zm85.904-17.18c0-9.489-7.692-17.181-17.181-17.181-9.488 0-17.18 7.692-17.18 17.181 0 9.488 7.692 17.18 17.18 17.18 9.489 0 17.181-7.692 17.181-17.18z"})]}),V6=c.input`
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
`,ot=t=>e.jsx(V6,{type:"checkbox",...t}),G6=({column:t,onUpdate:n})=>{const s=m.useId(),o=t.checked??!1;return e.jsx(hs,{$gap:f.lg,children:e.jsxs(cn,{$alignItems:"center",children:[e.jsx(ot,{id:s,checked:o,onChange:()=>n({...t,checked:!t.checked})}),e.jsx("label",{htmlFor:s,children:u(o?"checked by default":"unchecked by default")})]})})},Y6=(t,n)=>[...t.slice(0,n),"",...t.slice(n)],J6=(t,n,s)=>{const o=[...s];return o[t]=n,o},Wa=(t,n)=>n.filter((s,o)=>o!==t),Z6=(t,n,s)=>qs(t,{$splice:[[n,1],[s,0,t[n]]]}),_a=(t=[],n=[])=>t.length===n.length&&t.every((s,o)=>s===n[o]),X6=({column:t,onUpdate:n})=>{const[s,o]=m.useState(t.options?.length?t.options:[""]),i=as(s,500),r=m.useRef(t);m.useEffect(()=>{r.current=t},[t]);const a=m.useRef(n);m.useEffect(()=>{a.current=n},[n]),m.useEffect(()=>{const j=t.options?.length?t.options:[""];o(w=>_a(w,j)?w:j)},[t.options]),m.useEffect(()=>{const j=r.current,w=j.value,v=i.includes(w)?w:"";_a(j.options??[],i)&&j.value===v||a.current({...j,options:i,value:v})},[i]);const l=m.useRef([]);l.current=s.map((j,w)=>l.current[w]||me.createRef());const{activeCell:d,setActiveCell:h,setCellRef:x,keyPressHandler:g}=Ln(s.length,1),b=(j,w)=>{h(w!==void 0?w+1:s.length,j),o(Y6(s,w===void 0?s.length:w+1))},y=j=>{const w=r.current,v=w.value===j?"":j,$={...w,options:s,value:v};r.current=$,a.current($)};return e.jsxs(e.Fragment,{children:[e.jsxs(ou,{children:[e.jsx(us,{children:e.jsxs(ps,{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Label")}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("th",{children:u("Selected")}),e.jsx("th",{colSpan:2,children:u("Actions")})]})]})}),e.jsx("tbody",{children:s.map((j,w)=>e.jsxs(lr,{index:w,dragRef:l.current[w],onDrop:(v,$)=>o(Z6(s,v,$)),children:[e.jsx(de,{children:e.jsx(nt,{type:"text",value:j,placeholder:u("Label"),autoFocus:d===`${w}:0`,ref:v=>x(v,w,0),onFocus:()=>h(w,0),onKeyDown:g({onEnter:({shiftKey:v})=>{b(0,v?w:void 0)},onDelete:()=>{if(s.length>1){const v=Wa(w,s),$=r.current,C={...$,options:v,value:$.value===j?"":$.value};r.current=C,a.current(C),o(v),h(Math.max(w-1,0),0)}}}),onChange:v=>{const $=J6(w,v.target.value,s),C=r.current;if(C.value===j){const E={...C,value:v.target.value,options:$};r.current=E,a.current(E)}o($)}})}),s.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(fn,{property:{label:"",handle:`${w}-check`,type:Y.Boolean,width:50},value:t.value===j,updateValue:()=>y(j)})})}),e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(Rt,{ref:l.current[w],className:"handle",children:e.jsx(Zs,{})})})}),e.jsx(de,{$tiny:!0,children:e.jsx(kt,{children:e.jsx(Rt,{onClick:()=>{const v=Wa(w,s),$=r.current,C={...$,options:v,value:$.value===j?"":$.value};r.current=C,a.current(C),o(v),h(Math.max(w-1,0),0)},children:e.jsx(cs,{})})})})]})]},w))})]})}),e.jsx(ls,{label:u("Add an option"),onClick:()=>b(0)})]}),e.jsx(Yt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},eb={fileCount:1,maxFileSizeKB:2048,fileKinds:["image"],assetSourceId:null,uploadLocation:null},tb=[{value:"image",label:"Image"},{value:"video",label:"Video"},{value:"audio",label:"Audio"},{value:"text",label:"Text"},{value:"pdf",label:"PDF"},{value:"json",label:"JSON"}],nb=({column:t,onUpdate:n,property:s})=>{const o={...eb,...t.metadata||{}},i=(x=[])=>x.flatMap(g=>"children"in g?i(g.children):g),r=i(s?.fileKindsOptions),a=r.length?r:tb,l=i(s?.assetSourceOptions),d=x=>{n({...t,metadata:{...o,...x}})},h=x=>{const g=new Set(o.fileKinds);g.has(x)?g.delete(x):g.add(x),d({fileKinds:Array.from(g)})};return e.jsxs(hs,{$gap:f.lg,children:[e.jsxs(cn,{$gap:f.md,children:[e.jsx(_,{width:40,label:u("Max Files"),handle:"fileCount",children:e.jsx("input",{type:"number",min:1,className:"text fullwidth",value:o.fileCount,onChange:x=>d({fileCount:Math.max(1,Number(x.target.value)||1)})})}),e.jsx(_,{width:60,label:u("Maximum File Size (KB)"),handle:"maxFileSizeKB",children:e.jsx("input",{type:"number",min:1,className:"text fullwidth",value:o.maxFileSizeKB,onChange:x=>d({maxFileSizeKB:Math.max(1,Number(x.target.value)||1)})})})]}),e.jsxs(cn,{children:[e.jsx(_,{width:40,label:u("Asset Source"),handle:"assetSourceId",instructions:u("Select an asset source to be able to store user uploaded files."),children:e.jsx(ce,{emptyOption:u("Select source"),value:o.assetSourceId?String(o.assetSourceId):"",options:l,onChange:x=>d({assetSourceId:x?Number(x):null})})}),e.jsx(_,{width:60,label:u("Upload Location"),handle:"uploadLocation",instructions:u("The subfolder path that files should be uploaded to. May contain `{{ form.handle }}` or `{{ form.id }}` variables as well."),children:e.jsx("input",{type:"text",className:"text fullwidth",value:o.uploadLocation||"",onChange:x=>d({uploadLocation:x.target.value||null})})})]}),e.jsx(_,{label:u("File Kinds"),handle:"fileKinds",children:e.jsx(Ig,{children:a.map(x=>e.jsx("label",{children:e.jsxs(cn,{$alignItems:"center",$gap:f.sm,children:[e.jsx(ot,{checked:o.fileKinds.includes(x.value),onChange:()=>h(x.value)}),e.jsx("span",{children:x.label})]})},x.value))})})]})},sb=({column:t,onUpdate:n})=>e.jsxs(hs,{$gap:f.lg,children:[e.jsx(_,{label:u("Default value"),handle:"value",children:t.type==="textarea"?e.jsx("textarea",{className:"text fullwidth",rows:4,value:t.value,onChange:s=>n({...t,value:s.target.value})}):e.jsx("input",{type:"text",className:"text fullwidth",value:t.value,onChange:s=>n({...t,value:s.target.value})})}),e.jsx(_,{label:u("Placeholder"),handle:"placeholder",children:e.jsx("input",{type:"text",className:"text fullwidth",value:t.placeholder||"",onChange:s=>n({...t,placeholder:s.target.value})})})]}),ob=(t,n)=>[...t.slice(0,n+1),{label:"",type:"text",value:""},...t.slice(n+1)],js=(t,n,s)=>{const o=[...s];return o[t]=n,o},ib=(t,n)=>n.filter((s,o)=>o!==t),rb=(t,n,s)=>{const o=[...s];return qs(o,{$splice:[[t,1],[n,0,o[t]]]})},ab=t=>t.filter(n=>!!n.label||!!n.value),lb={fileCount:1,maxFileSizeKB:2048,fileKinds:["image"],assetSourceId:null,uploadLocation:null},cb=(t,n)=>n==="file"?{...t,type:n,metadata:{...lb,...t.metadata||{}}}:{...t,type:n,metadata:{}},Eo={text:e.jsx(Q6,{}),textarea:e.jsx(K6,{}),select:e.jsx(_6,{}),radio:e.jsx(q6,{}),checkbox:e.jsx(W6,{}),file:e.jsx(H6,{})},db=({columnTypes:t,columns:n,updateValue:s,property:o,context:i})=>{const[r,a]=m.useState(0),{getTranslation:l,willTranslate:d}=ye(i),h=m.useRef(null),x=m.useRef(null),g=m.useRef([]),b=m.useRef(!1),y=m.useRef(new WeakMap),j=m.useRef(0),w=d(o.handle),v=l(o.handle,n),$=w?v:n,C=m.useMemo(()=>$[r],[r,$]),E=S=>{const D=y.current.get(S);if(D)return D;const P=`table-column-${j.current++}`;return y.current.set(S,P),P},F=m.useMemo(()=>t.reduce((S,D)=>(D.value in Eo&&S.push({...D,icon:Eo[D.value]}),S),[]),[t]);m.useEffect(()=>{h.current?.focus()},[r,$.length]),m.useEffect(()=>{g.current[r]?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"nearest"}),b.current&&(b.current=!1,h.current?.scrollIntoView({behavior:"smooth",block:"nearest"}))},[r,$.length]),m.useEffect(()=>{if(!x.current||$.length<2)return;const S=ze.create(x.current,{animation:150,draggable:".table-column-tab",handle:".column-drag-handle",onEnd:D=>{const P=D.oldIndex,ae=D.newIndex;P===void 0||ae===void 0||P===ae||(s(rb(P,ae,$)),a(ue=>ue===P?ae:P<ue&&ue<=ae?ue-1:ae<=ue&&ue<P?ue+1:ue))}});return()=>{S.destroy()}},[$,s]);const z=()=>{const S=$.length;s([...$,{label:"New column",type:"text",value:""}]),b.current=!0,a(S)},M=S=>{if($.length<=1)return;const D=ib(S,$);let P=r;r>S?P=r-1:r===S&&(P=Math.max(0,S-1)),s(D),a(P)};return e.jsx(wd,{children:e.jsxs(us,{children:[e.jsxs(Rg,{children:[e.jsx(Fg,{ref:x,children:$.length>0&&$.map((S,D)=>e.jsxs("a",{className:T("table-column-tab",S.required&&"required",D===r&&"active"),ref:P=>{g.current[D]=P},onClick:()=>a(D),children:[e.jsx(Wc,{children:Eo[S.type]}),e.jsx(Tg,{children:u(S.label)}),$.length>1&&e.jsx(Mg,{type:"button",className:"column-drag-handle",title:u("Reorder column"),onClick:P=>{P.preventDefault(),P.stopPropagation()},children:e.jsx(Zs,{})}),D===r&&$.length>1&&e.jsx(Ng,{type:"button",title:u("Remove column"),onClick:P=>{P.preventDefault(),P.stopPropagation(),M(D)},children:e.jsx(cs,{})})]},E(S)))}),e.jsx(zg,{type:"button",className:"btn",title:u("Add column"),onClick:z,children:e.jsx(U6,{})})]}),e.jsxs(Ag,{children:[e.jsxs(cn,{children:[e.jsx(_,{width:60,label:u("Label"),handle:"label",children:e.jsx("input",{type:"text",className:"text fullwidth",ref:h,value:C?.label,onChange:S=>s(js(r,{...C,label:S.target.value},$))})}),e.jsx(_,{width:30,label:u("Column Type"),handle:"type",children:e.jsx(ce,{showSelectedIcon:!0,emptyOption:"Select Type",value:C?.type,options:F,onChange:S=>{s(js(r,cb(C,S),$))}})}),e.jsx(_,{width:10,label:u("Required"),handle:"required",justify:"center",children:e.jsx(Jt,{enabled:!!C?.required,onClick:S=>{s(js(r,{...C,required:S},$))}})})]}),ub(C,S=>s(js(r,S,$)),o)]})]})})},ub=(t,n,s)=>t?["text","textarea"].includes(t.type)?e.jsx(sb,{column:t,onUpdate:n}):["select","radio"].includes(t.type)?e.jsx(X6,{column:t,onUpdate:n}):t.type==="checkbox"?e.jsx(G6,{column:t,onUpdate:n}):t.type==="file"?e.jsx(nb,{column:t,onUpdate:n,property:s}):null:null,pb=(t,n)=>t.find(s=>s.value===n)?.label||n,hb=({columnTypes:t,columns:n})=>e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(Gt,{children:[!n.length&&e.jsx(vt,{children:u("Not configured yet")}),n.map((s,o)=>e.jsxs(Gi,{"data-title":pb(t,s.type),children:[e.jsx(gn,{"data-empty":u("empty"),className:T(s.required&&"required"),children:s.label}),e.jsx(gn,{"data-empty":u("empty"),children:xb(s)})]},o))]})}),xb=t=>t.type==="checkbox"?e.jsx(ot,{readOnly:!0,checked:!!t.checked}):t.type==="select"?e.jsx("div",{className:T("small select"),children:e.jsx("select",{disabled:!0,children:e.jsx("option",{children:t.value})})}):e.jsx(e.Fragment,{children:t.value}),mb=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const{options:r}=n;return e.jsx(_,{property:n,errors:s,context:i,children:e.jsx(qe,{preview:e.jsx(hb,{columnTypes:r,columns:t}),onAfterEdit:()=>o(ab(t)),onEdit:()=>{t.length||o(ob(t,0))},children:e.jsx(db,{columnTypes:r,columns:t,updateValue:o,property:n,context:i})})})},iu=(t,n,s)=>[...t.slice(0,s+1),[...n.map(()=>"")],...t.slice(s+1)],Ha=(t,n,s)=>{const o=[...s];return o[t]=n,o},gb=(t,n)=>n.filter((s,o)=>o!==t),fb=(t,n,s)=>{const o=[...s];return qs(o,{$splice:[[t,1],[n,0,o[t]]]})},bb=t=>t.filter(n=>n.filter(Boolean).length!==0),yb=({configuration:t,values:n,updateValue:s,property:o,context:i})=>{const{getTranslation:r,updateTranslation:a,willTranslate:l}=ye(i),{handle:d}=o,h=l(d),x=r(d,n),g=m.useRef([]);g.current=n.map(($,C)=>g.current[C]||me.createRef());const{activeCell:b,setActiveCell:y,setCellRef:j,keyPressHandler:w}=Ln(n.length,t.length),v=($,C)=>{h||(y(C!==void 0?C+1:n.length,$),s(iu(n,t,C!==void 0?C:n.length)))};return e.jsxs(wd,{children:[e.jsx(us,{children:e.jsx(ps,{children:e.jsx("tbody",{children:n.map(($,C)=>e.jsxs(lr,{index:C,dragRef:g.current[C],onDrop:(E,F)=>s(fb(E,F,n)),children:[t.map((E,F)=>e.jsx(de,{children:e.jsx(nt,{type:"text",value:$[F],placeholder:u(E.label),autoFocus:b===`${C}:${F}`,disabled:h&&!E.translatable,ref:z=>j(z,C,F),onFocus:()=>y(C,F),onKeyDown:w({onEnter:z=>{v(0,z.shiftKey?C:void 0)}}),onChange:z=>{if(h){if(!E.translatable)return;a(o.handle,Ha(C,[...x[C].slice(0,F),z.target.value,...x[C].slice(F+1)],x));return}s(Ha(C,[...n[C].slice(0,F),z.target.value,...n[C].slice(F+1)],n))}})},F)),n.length>1&&e.jsxs(e.Fragment,{children:[e.jsx(de,{$tiny:!0,children:e.jsx(Rt,{ref:g.current[C],className:"handle",children:e.jsx(Zs,{})})}),e.jsx(de,{$tiny:!0,children:e.jsx(Rt,{onClick:()=>{s(gb(C,n)),y(Math.max(C-1,0),0)},children:e.jsx(cs,{})})})]})]},C))})})}),e.jsx(ls,{label:"Add a row",onClick:()=>v(0),disabled:h}),e.jsx(Yt,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Press <b>enter</b> while editing a cell to add a new row."))}})})]})},jb=({configuration:t,values:n})=>e.jsx(O4,{"data-edit":u("Click to edit data"),children:e.jsxs(W4,{children:[!n.length&&e.jsx(er,{children:u("Not configured yet")}),n.map((s,o)=>e.jsx(_4,{children:t.map((i,r)=>e.jsx(H4,{"data-empty":u("empty"),"data-title":i.label,children:s[r]},r))},o))]})}),vb=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const{configuration:r}=n;return e.jsx(_,{property:n,errors:s,context:i,children:e.jsx(qe,{preview:e.jsx(jb,{configuration:r,values:t}),onAfterEdit:()=>o(bb(t)),onEdit:()=>{t.length||o(iu(t,r,0))},children:e.jsx(yb,{configuration:r,values:t,updateValue:o,property:n,context:i})})})},wb=({value:t,updateValue:n})=>e.jsx("input",{className:"input text fullwidth",type:"text",value:t,onChange:s=>n(s.target.value)}),$b=c.div`
  .tox {
    border: 1px solid #d1d1d1;
    border-radius: 0;
    padding: 0;
  }
`,Cb=({value:t,menu:n,statusbar:s,toolbar:o,updateValue:i})=>{const{metadata:{tinymce:{stylesPath:r}}}=I;return e.jsx(tt,{children:e.jsx(Ki,{children:e.jsx($b,{children:e.jsx(Hl,{init:{menubar:n,statusbar:s,promotion:!1,content_css:r,relative_urls:!1,remove_script_host:!1},value:t,onEditorChange:i,plugins:kb,toolbar:o,licenseKey:"gpl"})})})})},kb=["autolink","code","codesample","image","link","lists","media","searchreplace","table"];c.pre`
  font-size: 10px;
`;const Sb=c(Gt)`
  height: auto;
  min-height: 30px;
  padding: ${f.sm};

  a {
    pointer-events: none;
  }
`,Lb=({value:t})=>e.jsx(Vt,{"data-edit":u("Click to edit data"),children:e.jsxs(Sb,{children:[!t&&e.jsx(vt,{children:u("Not configured yet")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(t)}})]})}),Fb=({value:t,property:n,updateValue:s})=>e.jsx(qe,{preview:e.jsx(Lb,{value:t}),excludeClassNames:["tox"],children:e.jsx(Cb,{menu:n.menu,statusbar:n.statusbar,toolbar:n.toolbar,value:t,updateValue:s})}),Tb=c.div`
  margin-bottom: ${f.sm};
`,Eb=/<[^>]*>/,zb=t=>t?Eb.test(t):!1,Nb=({value:t,property:n,errors:s,updateValue:o,context:i})=>{const r=x=>Craft.t("freeform",x),a=m.useMemo(()=>n.toggleEditor?zb(t)?"rich":"plain":"rich",[n.toggleEditor,t]),[l,d]=m.useState(a),h=x=>{if(d(x),x==="plain"&&t){const g=document.createElement("div");g.innerHTML=O.sanitize(t),o(g.textContent||"")}};return e.jsxs(_,{property:n,errors:s,context:i,children:[n.toggleEditor&&e.jsx(Tb,{children:e.jsx(Ji,{value:l,options:[{value:"plain",label:r("Plain Text")},{value:"rich",label:r("Rich Text")}],onClick:h})}),l==="rich"?e.jsx(Fb,{value:t,property:n,updateValue:o}):e.jsx(wb,{value:t,updateValue:o})]})},Mb=Object.freeze(Object.defineProperty({__proto__:null,aiBox:mg,appStateSelect:gg,assetPicker:vg,attributes:Xg,bool:fn,boolEnv:lf,buttonGroup:uf,calculationBox:Lf,cards:e5,checkboxes:Tf,codeEditor:If,colorPicker:Of,conditionalIntegrationRule:L5,conditionalNotificationRule:P5,datePicker:Ko,dynamicCheckboxes:Uf,dynamicSelect:qf,field:Qf,fieldMapping:m5,fieldType:i4,formMonitorTools:D5,hidden:r4,int:a4,label:x4,minMax:b4,notificationTemplate:O3,options:O6,pageButton:n6,pageButtonLayout:d6,recipientMapping:X3,recipients:e6,select:nu,string:It,table:mb,tabularData:vb,textarea:os,wysiwyg:Nb},Symbol.toStringTag,{value:"Module"})),Ib=c.div`
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

    box-shadow: ${oe.bottom};
  }

  div {
    position: absolute;
    left: -5px;
    top: 0;
    z-index: 2;

    background: var(--background-color);
    padding: 0 5px;

    ${We};
    font-size: 11px;

    &:empty {
      display: none;
    }
  }
`,Rb=({delimiter:t})=>t?e.jsx(Ib,{children:e.jsx("div",{children:t.name})}):null,Ab=(t,n)=>{const s=A(Je.current);return m.useMemo(()=>{if(t.length===0)return!0;const o={config:I,page:s};try{return md(t,n,o)}catch(i){return console.error(`Failed to evaluate visibility expression: ${t.join(" && ")}`,i),!1}},[t,n,s])},Db=Mb,Le=({value:t,updateValue:n,property:s,errors:o,context:i,autoFocus:r=!1})=>{const{handle:a,type:l,visibilityFilters:d}=s,h=Db[l],x=Ab(d||[],i);return h===void 0?e.jsx("div",{children:`[${a}]: <${l}>`}):(h.displayName=`FormComponent: <${l}>`,x?e.jsx(ar,{message:`...${a} <${l}>`,children:e.jsxs(m.Suspense,{children:[e.jsx(Rb,{delimiter:s.delimiter}),e.jsx(h,{value:t,property:s,updateValue:n,errors:o,context:i,autoFocus:r})]})}):null)},Ua=d3,qa=(t,n,s,o)=>{let i=t;return n?.forEach(r=>{const[a,l]=r;Ua[a]&&(i=Ua[a](t,l,s,o))}),i},xs=(t,n,s)=>{const{isPrimary:o}=Fe(),r=A(De.settings.one("general"))?.translations;return m.useCallback(a=>{if(!a.disabled)return r&&!o?l=>{s(a.handle,l)}:l=>{const d=(h,x)=>{const g=t.find(b=>b.handle===h);!g||g.disabled||s(g.handle,qa(x,g.middleware,n))};s(a.handle,qa(l,a.middleware,n,d))}},[t,n,s,o,r])},Pb=({namespace:t,property:n})=>{const s=H(),{data:o}=Qt(),i=o.find(j=>j.handle===t).properties,r=A(De.errors),a=A(De.current),d={...A(De.settings.one(t)),isNew:a.isNew,namespaceType:"settings",namespace:t},{getTranslation:h,updateTranslation:x}=ye(d),g=h(n.handle,d[n.handle]),b=xs(i,d,(j,w)=>{x(j,w)||s(ht.modifySettings({namespace:t,key:j,value:w}))}),y=r?.[t]?.[n.handle];return e.jsx(Le,{value:g,property:n,updateValue:b(n),errors:y,context:d})},Bb=c.div`
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
`,Ob=c.h2`
  margin: 0;
  padding: 0;

  font-size: 1.5rem;
  color: ${p.gray500};
`,Wb=c.h2`
  margin: 0;
  padding: 0;

  font-size: 1.2rem;
  font-weight: normal;
  color: ${p.gray500};
`,_b=c.p`
  margin: 0;
  padding: 0;

  font-size: 1rem;
  color: ${p.gray300};

  &:not(:last-child) {
    padding-bottom: 1.5rem;
  }
`,Qa=c.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;

  height: 100%;

  &.padded {
    padding: 3rem 1rem;
  }
`,At=({title:t,subtitle:n,icon:s,iconFade:o,lite:i,children:r})=>i?e.jsx(Qa,{className:"padded",children:e.jsx(Wb,{children:t})}):e.jsxs(Qa,{children:[s&&e.jsx(Bb,{className:T(o&&"fade"),children:s}),t&&e.jsx(Ob,{children:t}),n&&e.jsx(_b,{children:n}),r]}),Hb=t=>e.jsxs(R,{viewBox:"0 0 512 512",...t,children:[e.jsx("path",{className:"fa-secondary",opacity:".4",d:"M48 480c26.5 0 48-21.5 48-48L96 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L96 480l-48 0zM160 120l0 80c0 13.3 10.7 24 24 24l112 0c13.3 0 24-10.7 24-24l0-80c0-13.3-10.7-24-24-24L184 96c-13.3 0-24 10.7-24 24zm0 184c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0c-8.8 0-16 7.2-16 16zM368 112c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16zm0 96c0 8.8 7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16z"}),e.jsx("path",{className:"fa-primary",d:"M0 160L0 432c0 26.5 21.5 48 48 48s48-21.5 48-48L96 96 64 96C28.7 96 0 124.7 0 160zM384 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0zm0 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-48 0zM176 288c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0zm0 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-256 0z"})]}),Ub=()=>{const{data:t,isFetching:n}=dh(),s=et("");return I.metadata.craft.is5?e.jsxs(Ui,{children:[e.jsx(Q,{id:"settings-usage",label:u("Usage in Elements"),url:s.pathname}),!t&&n&&e.jsx("div",{children:"Loading..."}),!n&&t?.length===0&&e.jsx(At,{title:u("No results found"),subtitle:u("This form is currently not attached to any elements."),icon:e.jsx(Hb,{}),iconFade:!0}),t?.length>0&&e.jsxs(e.Fragment,{children:[e.jsx(qi,{children:u("Usage in Elements")}),e.jsxs("table",{className:"data fullwidth collapsible",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Element")}),e.jsx("th",{children:u("Type")}),e.jsx("th",{children:u("Status")})]})}),e.jsx("tbody",{children:t.map(i=>e.jsxs("tr",{className:"element-row",children:[e.jsx("th",{children:e.jsx("div",{className:"chip small element","data-id":i.id,children:e.jsxs("div",{className:"chip-content",children:[e.jsx("span",{className:T("status",i.status.toLowerCase()),role:"img"}),e.jsx("a",{href:i.url,className:"label-link",children:e.jsx("span",{children:i.title})})]})})}),e.jsx("td",{children:i.type}),e.jsx("td",{children:i.status})]},i.id))})]})]})]}):null},Ka=()=>{const{sectionHandle:t}=K(),n=et(""),{data:s}=Qt();if(!s)return null;let o,i;if(s.forEach(a=>{a.sections.forEach(l=>{l.handle===t&&(o=a,i=l)})}),!o||!i)return t===Ns?e.jsx(Ub,{}):null;const{properties:r}=o;return e.jsxs(Ui,{children:[e.jsx(Q,{id:"sub-settings",label:i.label,url:n.pathname}),e.jsx(qi,{children:u(i?.label)}),e.jsx(eg,{children:r.filter(a=>a.section===i?.handle).filter(a=>a.visible).map(a=>e.jsx(Pb,{namespace:o.handle,property:a},a.handle))})]})},ru=c.div`
  display: flex;
  max-height: calc(100vh - 150px);
  height: 100%;

  margin-bottom: 30px;

  border-radius: ${k.lg};
  box-shadow: ${oe.box};
`,qb=()=>{const[,t]=m.useReducer(n=>n+1,0);m.useEffect(()=>{setTimeout(()=>{t()},0)},[])},au=c.div``,Qb=c.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`,lu=c.span`
  padding-left: ${f.md};

  font-weight: 700;
  font-size: 11px;
  color: ${p.gray550};

  text-transform: uppercase;
`,cu=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};

  padding: ${f.xs} 0;
`,Kb=cu,Vb=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"})}),Gb=c.div`
  > a {
    display: flex;
    align-items: center;
    gap: ${f.sm};

    padding: ${f.sm} ${f.md};
    border-radius: ${k.lg};

    color: ${p.gray700};
    font-size: 12px;
    line-height: 12px;

    transition: background-color 0.2s ease-out;
    text-decoration: none;

    &.active {
      color: ${p.white};
      background-color: ${p.gray500};
    }

    &.active.inactive {
      .status-dot {
        border-color: ${p.white};
      }
    }

    &.errors {
      color: ${p.white};
      background-color: ${p.error};
    }

    &:hover:not(.active) {
      background-color: ${p.gray200};
    }
  }
`,Va=c.div`
  display: block;
  width: 20px;
  height: 20px;

  svg {
    width: 100%;
    height: 100%;
  }
`,Yb=c.div`
  flex-grow: 1;
  max-width: 90%;

  padding: 1px 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Jb=c.div`
  content: '';

  flex-shrink: 0;
  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({$enabled:t})=>t?"transparent":p.gray550};
  border-radius: 100%;

  background-color: ${({$enabled:t})=>t?p.teal550:"transparent"};

  transition: all 0.3s ease-out;
`,Zb=({id:t,name:n,handle:s,icon:o})=>{const{setLastTab:i}=_e("integrations"),r=A(Xn.one(t));if(!r)return null;const a=r.errors&&Object.values(r.errors).some(l=>l.length>0);return e.jsx(Gb,{children:e.jsxs(pe,{onClick:()=>i(`${t}/${s}`),to:`${t}/${s}`,className:T(!r.enabled&&"inactive",a&&"errors"),children:[!o&&e.jsx(Va,{children:e.jsx(Vb,{})}),!!o&&e.jsx(Va,{dangerouslySetInnerHTML:{__html:O.sanitize(o)}}),e.jsx(Yb,{children:n}),e.jsx(Jb,{$enabled:r.enabled,className:T("status-dot")})]})})},Xb=({label:t,children:n})=>e.jsxs(au,{children:[e.jsx(Qb,{children:e.jsx(lu,{children:t})}),e.jsx(Kb,{children:n.map(s=>e.jsx(Zb,{...s},s.id))})]}),e8=()=>e.jsx(Fn,{children:e.jsxs(au,{children:[e.jsx(lu,{children:e.jsx(L,{width:50})}),e.jsx(cu,{style:{padding:14},children:[0,1,2].map(t=>e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[e.jsx(L,{width:20,height:20,circle:!0}),e.jsx("div",{style:{flexGrow:2},children:e.jsx(L,{width:100,style:{top:2}})}),e.jsx(L,{width:10,height:10,circle:!0,style:{top:6}})]},t))})]})}),zo=c.ul`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};

  list-style: none;
`,t8=()=>{const{formId:t,id:n}=K(),s=te(),{data:o,isFetching:i}=Ii(t&&Number(t));qb();const{lastTab:r,setLastTab:a}=_e("integrations");if(m.useEffect(()=>{r&&s(r)},[s,r]),m.useEffect(()=>{if(!n&&!r&&o){const d=o.find(Boolean);d&&(a(`${d.id}/${d.handle}`),s(`${d.id}/${d.handle}`))}},[n,o,r,s,a]),!o&&i)return e.jsx(Pe,{children:e.jsx(zo,{children:e.jsx(e8,{})})});if(!o&&!i)return e.jsx(Pe,{children:e.jsx(zo,{})});const l={};return o.forEach(d=>{const{type:h}=d;l[h]||(l[h]={type:h,label:u(h.replace("-"," ")),children:[]}),l[h].children.push(d)}),e.jsx(Pe,{$lean:!0,children:e.jsx(zo,{children:Object.values(l).map(d=>e.jsx(Xb,{...d},d.type))})})},n8=()=>{const t=et("");return e.jsxs(ru,{children:[e.jsx(Q,{id:"integrations",label:u("Integrations"),url:t.pathname}),e.jsx(t8,{}),e.jsx(mt,{})]})},s8=({integration:t,property:n})=>{const s=H(),o=xs(t.properties,t.values,(r,a)=>{s(Et.modify({id:t.id,key:r,value:a}))}),i=t.values[n.handle];return n.type===Y.Hidden?null:e.jsx(Le,{value:i,property:n,updateValue:o(n),errors:t?.errors?.[n.handle],context:t})},cr=t=>e.jsxs(R,{height:"1em",viewBox:"0 0 512 512",...t,children:[e.jsx("defs",{children:e.jsx("style",{children:".fa-secondary{opacity:0.2;fill:#a1a5aa;}.fa-primary{fill:#a6a8ab;}"})}),e.jsx("path",{className:"fa-primary",d:"M274.6 144.2c8.7 1.5 14.6 9.7 13.2 18.4l-32 192c-1.5 8.7-9.7 14.6-18.4 13.2s-14.6-9.7-13.2-18.4l32-192c1.5-8.7 9.7-14.6 18.4-13.2zm-87.3 60.5c6.2 6.2 6.2 16.4 0 22.6L158.6 256l28.7 28.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6l40-40c6.2-6.2 16.4-6.2 22.6 0zm137.4 0c6.2-6.2 16.4-6.2 22.6 0l40 40c6.2 6.2 6.2 16.4 0 22.6l-40 40c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L353.4 256l-28.7-28.7c-6.2-6.2-6.2-16.4 0-22.6z"}),e.jsx("path",{className:"fa-secondary",d:"M305.4 21.8c-1.3-10.4-9.1-18.8-19.5-20C276.1 .6 266.1 0 256 0c-11.1 0-22.1 .7-32.8 2.1c-10.3 1.3-18 9.7-19.3 20l-2.9 23.1c-.8 6.4-5.4 11.6-11.5 13.7c-9.6 3.2-19 7.2-27.9 11.7c-5.8 3-12.8 2.5-18-1.5l-18-14c-8.2-6.4-19.7-6.8-27.9-.4c-16.6 13-31.5 28-44.4 44.7c-6.3 8.2-5.9 19.6 .5 27.8l14.2 18.3c4 5.1 4.4 12 1.5 17.8c-4.4 8.8-8.2 17.9-11.3 27.4c-2 6.2-7.3 10.8-13.7 11.6l-22.8 2.9c-10.3 1.3-18.7 9.1-20 19.4C.7 234.8 0 245.3 0 256c0 10.6 .6 21.1 1.9 31.4c1.3 10.3 9.7 18.1 20 19.4l22.8 2.9c6.4 .8 11.7 5.4 13.7 11.6c3.1 9.5 6.9 18.7 11.3 27.5c2.9 5.8 2.4 12.7-1.5 17.8L54 384.8c-6.4 8.2-6.8 19.6-.5 27.8c12.9 16.7 27.8 31.7 44.4 44.7c8.2 6.4 19.7 6 27.9-.4l18-14c5.1-4 12.2-4.4 18-1.5c9 4.6 18.3 8.5 27.9 11.7c6.1 2.1 10.7 7.3 11.5 13.7l2.9 23.1c1.3 10.3 9 18.7 19.3 20c10.7 1.4 21.7 2.1 32.8 2.1c10.1 0 20.1-.6 29.9-1.7c10.4-1.2 18.2-9.7 19.5-20l2.8-22.5c.8-6.5 5.5-11.8 11.7-13.8c10-3.2 19.7-7.2 29-11.8c5.8-2.9 12.7-2.4 17.8 1.5L385 457.9c8.2 6.4 19.6 6.8 27.8 .5c2.8-2.2 5.5-4.4 8.2-6.7L451.7 421c1.8-2.2 3.6-4.4 5.4-6.6c6.5-8.2 6-19.7-.4-27.9l-14-17.9c-4-5.1-4.4-12.2-1.5-18c4.8-9.4 9-19.3 12.3-29.5c2-6.2 7.3-10.8 13.7-11.6l22.8-2.8c10.3-1.3 18.8-9.1 20-19.4c.2-1.7 .4-3.5 .6-5.2V230.1c-.2-1.7-.4-3.5-.6-5.2c-1.3-10.3-9.7-18.1-20-19.4l-22.8-2.8c-6.4-.8-11.7-5.4-13.7-11.6c-3.4-10.2-7.5-20.1-12.3-29.5c-3-5.8-2.5-12.8 1.5-18l14-17.9c6.4-8.2 6.8-19.7 .4-27.9c-1.8-2.2-3.6-4.4-5.4-6.6L421 60.3c-2.7-2.3-5.4-4.5-8.2-6.7c-8.2-6.4-19.6-5.9-27.8 .5L366.7 68.3c-5.1 4-12.1 4.4-17.8 1.5c-9.3-4.6-19-8.6-29-11.8c-6.2-2-10.9-7.3-11.7-13.7l-2.8-22.5zM287.8 162.6l-32 192c-1.5 8.7-9.7 14.6-18.4 13.2s-14.6-9.7-13.2-18.4l32-192c1.5-8.7 9.7-14.6 18.4-13.2s14.6 9.7 13.2 18.4zM187.3 227.3L158.6 256l28.7 28.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6l40-40c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6zm160-22.6l40 40c6.2 6.2 6.2 16.4 0 22.6l-40 40c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L353.4 256l-28.7-28.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0z"})]}),dr=c.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${f.xl};

  padding: ${f.xl};

  background: ${p.white};
  overflow-y: auto;

  ${q};

  --background-color: ${p.white};
  --margins: -24px;

  h1 {
    padding: 0;
    margin-top: -11px;
    margin-bottom: -5px;
  }
`,o8=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
`,i8=()=>e.jsx(dr,{children:e.jsx(At,{title:u("No integrations found"),subtitle:u("To add an integration, click the button below"),icon:e.jsx(cr,{}),children:e.jsx(un,{className:T("btn add icon"),to:"/integrations",children:u("Add integration")})})}),r8=()=>e.jsx(dr,{children:e.jsxs(Fn,{children:[e.jsx(L,{width:120,height:20}),e.jsx("br",{}),e.jsx(L,{width:100,height:10}),e.jsx(L,{width:50,height:20}),e.jsx("br",{}),e.jsx(L,{width:200,height:10}),e.jsx(L,{width:500,height:10}),e.jsx(L,{height:30}),e.jsx("br",{}),e.jsx(L,{width:150,height:10}),e.jsx(L,{width:300,height:10}),e.jsx(L,{height:30})]})}),a8=()=>{const{id:t}=K(),n=et(""),s=H(),{formId:o}=K(),{data:i,isFetching:r}=Ii(o&&Number(o)),a=A(Xn.one(Number(t)));if(!i&&r)return e.jsx(r8,{});if(!a)return e.jsx(i8,{});const{id:l,handle:d,enabled:h,name:x,description:g,properties:b}=a;return e.jsxs(dr,{children:[e.jsx(Q,{id:"integration-editor",label:x,url:n.pathname}),e.jsx("h1",{title:d,children:x}),!!g&&e.jsx("p",{children:g}),e.jsxs(o8,{children:[e.jsx(fn,{property:{label:"Enabled",handle:"enabled",type:Y.Boolean},value:h,errors:a?.errors?.enabled,updateValue:()=>s(Et.toggle(l))}),b.map(y=>e.jsx(s8,{integration:a,property:y},y.handle))]})]})},du=m.createContext({isDragging:!1,dragType:void 0,position:void 0,dragOn:()=>{},dragOff:()=>{}}),l8=({children:t})=>{const[n,s]=m.useState(!1),[o,i]=m.useState(),[r,a]=m.useState();return e.jsx(du.Provider,{value:{isDragging:n,dragType:o,position:r,dragOn:(l,d)=>{s(!0),a(d),i(l)},dragOff:()=>{s(!1),a(void 0),i(void 0)}},children:t})},Xs=()=>m.useContext(du),Dt={currentPage:t=>{const n=t.context.page;return n?t.layout.pages.find(s=>s.uid===n):t.layout.pages.find(Boolean)},hasErrors:t=>n=>{const o=n.layout.pages.find(i=>i.uid===t).layoutUid;return n.layout.rows.filter(i=>i.layoutUid===o).some(i=>n.layout.fields.filter(r=>r.rowUid===i.uid).some(r=>mn(r.errors))),!1},focus:t=>t.context.focus,state:t=>t.context.state},uu=c.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  flex: 1;
  overflow: hidden;
`,c8=()=>{const t=m.useRef(null),[n,s]=m.useState({height:0,width:0,x:0,y:0}),[o]=m.useState(()=>new ResizeObserver(([i])=>{const{width:r,height:a,x:l,y:d}=i.target.getBoundingClientRect();s({width:r,height:a,x:l,y:d})}));return m.useEffect(()=>(t.current&&o.observe(t.current),()=>o.disconnect()),[o]),{ref:t,dimensions:n}},d8=({active:t,hovering:n})=>G({opacity:t?1:0,background:n?p.green600:"transparent",fill:n?"#fff":p.gray300,color:n?"#fff":p.gray300,scale:n?1.2:1,rotate:t?0:30,config:s=>{switch(s){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),u8=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z"})}),pu=c(W.button)`
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
`,p8=({active:t,onClick:n,...s})=>{const o=m.useRef(null),i=jt(o),a={...d8({active:t,hovering:i}),...s?.style};return delete s.style,e.jsx(pu,{type:"button",ref:o,style:a,onClick:n,...s,children:e.jsx(u8,{})})},hu=t=>{const n=H(),[{isOver:s},o]=Gn(()=>({accept:[ee.FieldType,ee.Field],collect:r=>({isOver:r.isOver({shallow:!0})}),canDrop:(r,a)=>a.isOver({shallow:!0}),drop:r=>{r.type===ee.FieldType&&n(Oe.move.newField.newRow({fieldType:r.data,layoutUid:t.uid})),r.type===ee.Field&&n(Oe.move.existingField.newRow({field:r.data,layoutUid:t.uid}))}}),[t]),i=G({to:{opacity:s?1:0,transform:s?"scaleY(1)":"scaleY(0)"},config:{tension:300}});return{dropRef:o,placeholderAnimation:i}},h8=c.div`
  position: relative;
  flex-grow: 1;

  height: 100%;
  padding: 8px;

  border: 1px solid #f2f4f7;
  border-radius: ${k.lg};
  background-color: #fcfdfe;
`,x8=c(W.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: ${p.gray050};
  border: 1px solid transparent;
  border-radius: ${k.sm};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`,m8=c.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 40px;
  height: 100%;

  color: ${p.gray200};
  font-size: 18px;
  text-align: center;
`,g8=({field:t,layoutUid:n})=>{const s=H(),o=Nt(l=>xt.one(l,n)),i=Nt(l=>Vn.inLayout(l,o?.uid)),{dropRef:r,placeholderAnimation:a}=hu(o);return m.useEffect(()=>{if(!n){const l=V();s(vn.add({uid:l})),s(fe.edit({uid:t.uid,handle:"layout",value:l}))}},[s,t.uid,n]),e.jsxs(h8,{ref:l=>{r(l)},children:[!i.length&&e.jsx(m8,{children:u("Add fields")}),i.map(l=>e.jsx(ur,{row:l},l.uid)),e.jsx(x8,{style:a,children:u("Drop a field here")})]})},f8=t=>{const n=G({scale:t?1:.3,opacity:t?1:0}),s=G({scale:t?.3:1,opacity:t?0:1});return[n,s]},b8=ne`
  .options-one-line {
    display: inline-block;
    margin-right: 10px;
  }
`,y8=ne`
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
`,j8=ne`
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
`,v8=ne`
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
`,w8=ne`
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
`,xu=c.label`
  display: flex;
  align-items: flex-start;
  gap: ${f.xs};

  min-height: 18px;
  margin-bottom: 4px;
  font-weight: bold;
  color: ${p.gray550};

  overflow: hidden;

  .required {
    position: relative;
    top: -5px;
    left: -5px;
  }
`,$8=c.div``,St=16,C8=c.div`
  flex: 0 0 ${St}px;
  position: relative;
  top: 2px;

  width: ${St}px;
  height: ${St}px;
  font-size: ${St}px;
`,Ga=c(W.div)`
  position: absolute;
  left: 0;
  top: 0;

  &,
  svg {
    width: ${St}px;
    height: ${St}px;
    font-size: ${St}px;
  }
`,mu=c.div`
  margin-top: -4px;
  margin-bottom: 4px;

  color: ${p.gray300};
  font-style: italic;
  font-size: 12px;
`,gu=c.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  padding: ${f.sm} ${f.md};
  margin: 0;

  border: 1px solid transparent;
  border-radius: ${k.md};

  transition:
    border-color 0.2s ease-out,
    background-color 0.2s ease-out;

  &.input-only {
    flex-direction: row !important;
    gap: ${f.sm};
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
      color: ${p.error};
    }

    input,
    textarea,
    div.select,
    select {
      border-color: ${p.error} !important;
    }

    div.select {
      border: 1px solid;
    }

    input.checkbox ~ label:before {
      border-color: ${p.error};
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
      gap: ${f.sm};

      &__empty {
        grid-column: 1 / -1;
        padding-top: 10px;

        color: ${p.gray500};
        text-align: left;
        font-style: italic;
      }

      &__card {
        display: grid;
        grid-template-rows: min-content 20px auto;
        gap: 5px;

        background: ${p.white};
        border: 1px solid ${p.gray200};
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

            fill: ${p.gray200};
          }
        }

        &__label {
          height: 20px;
          padding: 0 ${f.sm};

          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-weight: bold;
        }

        &__description {
          padding: 0 ${f.sm} ${f.sm};

          color: ${p.gray500};
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

  ${v8}
  ${j8}
  ${b8}
  ${y8}
  ${w8}
`,k8=c.div`
  display: flex;
  flex-direction: row;
`,S8=c.div`
  a {
    pointer-events: none;
  }
`,Tn={all:t=>t.notifications.items,one:t=>n=>n.notifications.items.find(s=>s.uid===t),isFieldInEmailNotification:t=>n=>n.notifications.items.some(s=>{if(s?.rule){const o=n.rules.notifications.items.find(i=>i.uid===s.rule);return o?.enabled&&o.conditions.some(i=>i.field===t)||!1}return s.field===t&&s.enabled}),count:{all:t=>t.notifications.items.length,ofType:t=>n=>n.notifications.items.filter(s=>s.className===t).length},errors:{any:t=>!!t.notifications.items.find(n=>n.errors!==void 0)}},L8=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"13",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m46.195 63.066c-1.46 0-2.64-1.377-2.64-3.066 0-1.699 1.18-3.066 2.64-3.066h34.89c1.46 0 2.64 1.377 2.64 3.066 0 1.699-1.18 3.066-2.64 3.066zm7.15 50.782c1.74 0 3.15 1.377 3.15 3.076s-1.41 3.076-3.15 3.076h-39.44c-2.02 0-3.85-.801-5.18-2.1-1.378-1.339-2.152-3.16-2.15-5.058v-105.684c0-1.972.82-3.76 2.15-5.058 1.371-1.346 3.236-2.102 5.18-2.1h90.02c2.02 0 3.85.811 5.18 2.1 1.378 1.339 2.151 3.16 2.15 5.058v48.965c0 1.699-1.41 3.076-3.15 3.076s-3.15-1.377-3.15-3.076v-48.965c0-.273-.12-.527-.31-.703-.19-.185-.44-.303-.72-.303h-90.02c-.28 0-.54.118-.73.293-.18.196-.3.44-.3.713v105.674c0 .273.12.527.3.703.19.186.45.303.73.303h39.44zm51.93-41.25c-.51-.479-1.1-.703-1.78-.694-.68.01-1.26.264-1.74.762l-3.91 3.975 10.97 10.341 3.95-4.013c.47-.469.67-1.074.66-1.739-.01-.654-.25-1.25-.73-1.699zm-20.49 38.74c-1.45.449-2.89.918-4.33 1.377-1.45.469-2.89.947-4.33 1.416-3.41 1.094-5.32 1.699-5.72 1.807-.39.117-.16-1.446.7-4.698l2.71-10.205 20.55-20.879 10.96 10.303zm-38.59-26.426c-1.46 0-2.65-1.396-2.65-3.115s1.19-3.115 2.65-3.115h17.19c1.46 0 2.65 1.396 2.65 3.115s-1.19 3.115-2.65 3.115zm0-43.642c-1.46 0-2.64-1.377-2.64-3.067 0-1.699 1.18-3.066 2.64-3.066h34.89c1.46 0 2.64 1.377 2.64 3.066 0 1.699-1.18 3.067-2.64 3.067zm-15.14 36.328c2.054 0 3.72 1.626 3.72 3.632 0 2.007-1.666 3.633-3.72 3.633-2.055 0-3.72-1.626-3.72-3.633 0-2.006 1.665-3.632 3.72-3.632zm0-21.504c2.054 0 3.72 1.626 3.72 3.633 0 2.006-1.666 3.632-3.72 3.632-2.055 0-3.72-1.626-3.72-3.632 0-2.007 1.665-3.633 3.72-3.633zm0-21.504c2.054 0 3.72 1.626 3.72 3.633 0 2.006-1.666 3.632-3.72 3.632-2.055 0-3.72-1.626-3.72-3.632 0-2.007 1.665-3.633 3.72-3.633z",fill:"#89bb67"})]}),F8=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"12",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m109.892 10.077-96.909 37.179 29.366 14.034 44.97-28.878-28.162 46.242 13.704 28.38 37.012-96.957zm-107.53 33.38 112.317-43.088c.919-.447 1.985-.49 2.937-.117 1.907.725 2.866 2.852 2.144 4.756l-43.022 112.632c-.531 1.368-1.822 2.293-3.291 2.357-1.469.063-2.836-.747-3.483-2.064l-22.192-45.901-45.684-21.836c-1.325-.635-2.145-1.995-2.085-3.46s.987-2.754 2.359-3.279z",fill:"#67a9e6"})]}),T8=t=>e.jsxs(R,{viewBox:"0 0 120 120",width:"13",...t,children:[e.jsx("path",{d:"m0 0h120v120h-120z",fill:"none"}),e.jsx("path",{d:"m57.255 83.701 3.438-17.9 3.486 5.39c7.509-3.09 11.728-8.18 12.353-16.01 6.172 11.04 2.432 20.95-5.4 26.74l3.554 5.48zm12.773-52.87c-5.078-2.49-10.761-3.45-16.298-2.9-5.498.54-10.84 2.59-15.254 6.1-5.107 4.05-8.984 10.11-10.478 18.14l-.469 2.51-2.441.44c-2.393.43-4.531 1.02-6.406 1.77-1.817.72-3.438 1.61-4.854 2.66-1.132.84-2.109 1.78-2.939 2.8-2.568 3.15-3.76 7.1-3.73 11.1.042 4.142 1.335 8.17 3.701 11.53.888 1.25 1.914 2.4 3.086 3.4 1.213 1.032 2.573 1.868 4.033 2.48 1.494.63 3.144 1.08 4.97 1.34h70.848c3.448-.85 6.494-2 9.082-3.48 2.568-1.47 4.668-3.26 6.24-5.41 2.442-3.33 3.643-8.04 3.692-12.87.058-5.07-1.153-10.16-3.506-13.86-.674-1.07-1.416-2.03-2.197-2.89-3.526-3.89-7.998-5.59-12.647-5.62-2.431-.02-4.941.41-7.392 1.22-5.068-7.23-8.73-14.37-17.041-18.46zm19.805 10.26c1.562-.25 3.125-.38 4.677-.36 6.563.05 12.891 2.45 17.871 7.95 1.045 1.15 2.031 2.45 2.959 3.9 3.125 4.92 4.726 11.49 4.658 17.92-.068 6.31-1.729 12.59-5.127 17.21-2.217 3.01-5.058 5.47-8.467 7.42-3.281 1.88-7.109 3.31-11.406 4.33l-.8.1h-71.366l-.449-.04c-2.607-.34-4.971-.97-7.119-1.88-2.217-.94-4.18-2.15-5.908-3.63-1.641-1.4-3.076-2.99-4.297-4.72-3.262-4.6-5.019-10.22-5.058-15.82-.039-5.66 1.679-11.29 5.39-15.85 1.201-1.48 2.617-2.84 4.238-4.04 1.885-1.4 4.043-2.58 6.485-3.55 1.679-.67 3.476-1.23 5.371-1.68 2.148-8.74 6.728-15.47 12.616-20.14 5.508-4.37 12.139-6.92 18.965-7.59 6.797-.67 13.789.51 20.068 3.6 6.845 3.37 12.822 8.98 16.699 16.87zm-27.265 3.61-3.438 17.9-3.486-5.39c-7.51 3.09-11.728 8.18-12.353 16.01-6.172-11.04-2.432-20.95 5.4-26.74l-3.555-5.48z",fill:"#f3b898"})]}),E8=c.div`
  display: flex;
  flex-direction: row;

  gap: ${f.sm};
  margin-left: ${f.sm};
`,Ya=({uid:t})=>{const n=A(ln.hasRule(t)),s=A(Tn.isFieldInEmailNotification(t)),o=A(Xn.isFieldInIntegrations(t));return e.jsxs(E8,{children:[n&&e.jsx(he,{title:u("Conditional rules are applied to this field"),children:e.jsx(L8,{})}),s&&e.jsx(he,{title:u("Email notifications are applied to this field"),children:e.jsx(F8,{})}),o&&e.jsx(he,{title:u("Integrations are applied to this field"),children:e.jsx(T8,{})})]})},z8=(t,n)=>{const[s,o]=Js(t,n),{getTranslation:i}=ye(t),r=N8(t,n),a=m.useMemo(()=>{const d={};return Object.entries(t.properties).forEach(([h,x])=>{n?.properties.find(b=>b.handle===h)?.translatable?d[h]=i(h,x):d[h]=x}),d.generatedOptions=s,d.fetchedAssets=r,d},[t,n,s,r,i]);return[m.useMemo(()=>{if(t?.properties===void 0||n?.previewTemplate===void 0)return"No preview available";try{return x1(n.previewTemplate)(a)}catch(d){return`Preview template error: "${d.message}"`}},[t?.properties,n?.previewTemplate,a]),o]},N8=(t,n)=>{const s=M8(t,n),o=I8(t,n),{data:i}=tr(s,o);return i||{}},M8=(t,n)=>{const s=m.useMemo(()=>n?.properties.filter(i=>i.type===Y.AssetPicker).flatMap(i=>{const r=t.properties[i.handle];return typeof r=="number"?[r]:Array.isArray(r)?r.filter(a=>typeof a=="number"):[]}),[t,n]),o=m.useMemo(()=>n?.properties.filter(i=>i.type===Y.Cards).map(i=>t.properties[i.handle].map(a=>a.assetId).filter(Boolean)),[t,n]);return[...s||[],...o||[]].flat()},I8=(t,n)=>m.useMemo(()=>{const s=n?.properties.find(o=>o.handle==="transform")?.handle;return t.properties[s]},[t,n]),R8=({field:t})=>{const n=H(),s=Ne(t?.typeClass),{uid:o}=t,{active:i,type:r,uid:a}=A(Dt.focus),l=m.useMemo(()=>s?.implements?.includes("noLabel")||!1,[s]),d=m.useMemo(()=>i&&r===_n.Field&&a===o,[i,r,a,o]),[h,x]=z8(t,s),[g,b]=f8(x),{getTranslation:y}=ye(t);if(t?.properties===void 0||!s)return null;const j=y("label",t.properties.label||s?.name),w=y("instructions",t.properties.instructions);return e.jsxs(gu,{"data-field-type":s.type,className:T(mn(t.errors)&&"errors",s.type===ut.Group&&"group",d&&"active","field"),onClick:v=>{v.stopPropagation(),n(be.setFocusedItem({type:_n.Field,uid:o}))},children:[!l&&e.jsxs(xu,{className:"label",children:[e.jsxs(C8,{children:[e.jsx(Ga,{style:g,children:e.jsx(Bi,{})}),e.jsx(Ga,{style:b,dangerouslySetInnerHTML:{__html:O.sanitize(s.icon)}})]}),e.jsx($8,{children:j}),t.properties.required&&e.jsx("span",{className:"required"}),e.jsx(Ya,{uid:o})]}),w&&e.jsx(mu,{children:w}),s.type===ut.Group&&e.jsx(g8,{field:t,layoutUid:t.properties?.layout}),s.type!==ut.Group&&(l?e.jsxs(k8,{children:[e.jsx(S8,{dangerouslySetInnerHTML:{__html:O.sanitize(h)}}),e.jsx(Ya,{uid:o})]}):e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(h)}}))]})},A8=(t,n,s,o,i,r,a)=>!n||a===void 0?0:s&&o&&r!==void 0?i===r?t*(a-i):r>i?i<a?0:t:r<i&&i<=a?-t:0:a<=i?t:(a>i,0),D8=({width:t,isDragging:n,isOver:s,isCurrentRow:o,isDraggingField:i,dragFieldIndex:r,index:a,hoverPosition:l})=>{const{isDragging:d}=Xs(),h=A8(t,s,o,i,a,r,l);return G({immediate:x=>{switch(x){case"x":return!d;case"width":return!d}},to:{width:t,x:h,opacity:n?.3:1},config:{tension:700,mass:.5}})},P8=(t,n)=>{const[{isDragging:s},o,i]=Ei(()=>({type:ee.Field,collect:l=>({isDragging:l.isDragging()}),item:{type:ee.Field,data:t,index:n}}),[t]),{dragOn:r,dragOff:a}=Xs();return m.useEffect(()=>{s?r(ee.Field):a()},[s,r,a]),{isDragging:s,drag:o,preview:i}},B8=t=>{let[n,s]=[200,40];const o=document.createElement("canvas");if(!o.getContext)return null;const i=o.getContext("2d"),l=(window.devicePixelRatio||1)/1;n=n*l,s=s*l,o.width=n,o.height=s,i.fillStyle="#FFFFFF",i.fillRect(0,0,n,s);const d=Math.ceil(4*l),h=Math.ceil(2*l);i.setLineDash([d,h]),i.strokeStyle="#c9c9c9",i.lineDashOffset=0,i.lineWidth=4*l,i.strokeRect(0,0,n,s);const x=Math.ceil(14*l);return i.font=`normal ${x}px system-ui,BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif`,i.fillStyle="#3f4d5a",i.fillText(t,Math.ceil(10*l),Math.ceil(25*l)),o.toDataURL()},fu=c(W.div)`
  position: relative;

  &,
  * {
    cursor: pointer;
  }

  ${dd} {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 2;
  }

  ${pu} {
    position: absolute;
    top: 4px;
    right: 28px;
    z-index: 2;
  }
`,bu=m.memo(({field:t,row:n,index:s,width:o,isOver:i,isCurrentRow:r,isDraggingField:a,dragFieldIndex:l,hoverPosition:d})=>{const h=H(),[x,g]=m.useState(!1),{isDragging:b,drag:y,preview:j}=P8(t,s),w=D8({width:o,isDragging:b,isOver:i,isCurrentRow:r,isDraggingField:a,dragFieldIndex:l,index:s,hoverPosition:d}),v=I.limitations.can("layout.fields.clone");return e.jsxs(e.Fragment,{children:[e.jsx(m1,{connect:j,src:B8(t.properties?.label)}),e.jsxs(fu,{onMouseEnter:()=>g(!0),onMouseLeave:()=>g(!1),ref:$=>{y($)},style:w,children:[v&&e.jsx(p8,{active:x,onClick:()=>{h(be.unfocus()),h(Oe.duplicate(t,n))}}),e.jsx(Sn,{active:x,onClick:()=>{h(be.unfocus()),h(Oe.remove(t))}}),e.jsx(R8,{field:t})]})]})});bu.displayName="Field";const O8=c(W.div)`
  position: absolute;
  top: 0;
  bottom: 0;

  pointer-events: none;
  user-select: none;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${k.md};
`,W8=({isActive:t,hoverPosition:n=0,fieldWidth:s=1e3})=>{const o=G({opacity:t?1:0,x:n*s,scale:t?1:0,width:s,config:{tension:700,mass:.5}});return e.jsx(O8,{style:o})},_8=t=>G({to:{height:t?30:20,opacity:t?1:0,transform:t?"scaleY(1)":"scaleY(0)"},delay:t?200:0,config:{tension:500}}),H8=t=>G({to:{y:t?20:0},delay:t?200:0,config:{tension:300}}),U8=t=>{const n=H(),[{isOver:s,canDrop:o},i]=Gn(()=>({accept:[ee.FieldType,ee.Field],collect:r=>({isOver:r.isOver({shallow:!0}),canDrop:r.canDrop()}),canDrop:(r,a)=>a.isOver({shallow:!0}),drop:r=>{r.type===ee.Field&&n(Oe.move.existingField.newRow({layoutUid:t.layoutUid,field:r.data,order:t.order})),r.type===ee.FieldType&&n(Oe.move.newField.newRow({fieldType:r.data,row:t}))}}),[t]);return{ref:i,isOver:s,canDrop:o}},q8=(t,n,s,o,i)=>{const r=H(),[a,l]=m.useState(),[d,h]=m.useState(),[{isOver:x,isCurrentRow:g,dragFieldIndex:b,isDraggingField:y,canDrop:j},w]=Gn({accept:[ee.Field,ee.FieldType],collect:v=>{const $=v.getItem(),C=$?.type===ee.Field,E=$?.type===ee.Field&&$.data.rowUid===n.uid;return{isOver:v.isOver({shallow:!0}),canDrop:v.canDrop(),dragFieldIndex:$?.type===ee.Field?$.index:void 0,isCurrentRow:E,isDraggingField:C}},canDrop:(v,$)=>$.isOver({shallow:!0}),hover:(v,$)=>{if(o===void 0||i===void 0)return;const C=v.type===ee.Field&&v.data.rowUid===n.uid,E=s+(C?0:1);if(E<=1)return;const z=$.getClientOffset().x-i,M=Math.floor(z/(o/E));d!==M&&h(M)},drop:v=>{v.type===ee.Field?r(Oe.move.existingField.existingRow(v.data,n,d)):v.type===ee.FieldType&&r(Oe.move.newField.existingRow({fieldType:v.data,row:n,order:d})),h(void 0)}},[t,n,s,d,o]);return m.useEffect(()=>{let v=s;x&&!g&&(v+=1),l(o/Math.max(1,v))},[x,s,o,g]),{ref:w,isOver:x,isCurrentRow:g,isDraggingField:y,canDrop:j,hoverPosition:d,fieldWidth:a,dragFieldIndex:b}},Q8="72px",yu=c(W.div)`
  position: relative;

  min-height: 1px;
  margin: 0 -${f.lg};

  background-color: #f3f7fc00;
  border: 1px solid transparent;

  transition: all 0.2s ease-out;
  transform-origin: 50% 0%;
`,ju=c(W.div)`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: row;
  align-items: stretch;
`,K8=c.div`
  position: absolute;
  left: ${f.sm};
  right: ${f.sm};
  top: -10px;

  z-index: 4;

  height: 20px;
`,V8=c(W.div)`
  position: relative;
  top: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 100%;

  background-color: #e9effd;
  border: 1px dashed #c3c3c3;
  border-radius: ${k.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;c(W.div)`
  border: 2px dashed grey;

  min-height: ${Q8};
  flex-grow: 1;
  flex-shrink: 0;
`;const ur=m.memo(({row:t})=>{const n=A(Re.inRow(t)),{ref:s,dimensions:o}=c8(),i=o.width,r=o.x,{ref:a,isOver:l}=U8(t),d=_8(l),h=H8(l),{ref:x,isOver:g,isCurrentRow:b,isDraggingField:y,dragFieldIndex:j,hoverPosition:w,fieldWidth:v}=q8(s,t,n.length,i,r),$=x(s);return e.jsxs(yu,{ref:$,children:[e.jsx(K8,{ref:C=>{a(C)},children:e.jsx(V8,{style:d})}),e.jsxs(ju,{style:h,children:[e.jsx(W8,{isActive:g,hoverPosition:w,fieldWidth:v}),n.map((C,E)=>e.jsx(bu,{field:C,row:t,isOver:g,hoverPosition:w,isCurrentRow:b,isDraggingField:y,dragFieldIndex:j,index:E,width:v||i},C.uid))]})]})});ur.displayName="Row";const pr=c.div`
  position: relative;

  display: flex;
  flex-direction: column;

  margin: 0 -18px;
`,G8=c(W.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 28px;
  margin: 0 ${f.lg};

  background-color: ${p.gray050};
  border: 1px solid ${p.hairline};
  border-radius: ${k.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`,Y8=c.div`
  padding: ${f.sm} ${f.lg};

  color: ${p.gray300};
  font-size: 18px;
  text-align: left;
`,J8=({layout:t})=>{const n=Nt(i=>Vn.inLayout(i,t?.uid)),{dropRef:s,placeholderAnimation:o}=hu(t);return e.jsxs(pr,{ref:i=>{s(i)},className:"field-layout",children:[!n.length&&e.jsx(Y8,{children:u("Drag or click fields to add them to the layout")}),n.map(i=>e.jsx(ur,{row:i},i.uid)),e.jsx(G8,{style:o,children:u("+ insert row")})]})},Z8=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})}),vu=t=>{const s=(t.buttons?.layout||"save back|submit").split(" "),o=[];return s.forEach(i=>{const r=i.split("|"),a=[];r.forEach(l=>{if(!(l==="back"&&t.order===0))switch(l){case"submit":a.push({handle:"submit",label:t.buttons.submitLabel,enabled:!0,assetId:t.buttons.submitIcon?.[0]||void 0,iconPosition:t.buttons.submitIconPosition||"left"});break;case"back":t.buttons.back&&a.push({handle:"back",label:t.buttons.backLabel,enabled:t.buttons.back,assetId:t.buttons.backIcon?.[0]||void 0,iconPosition:t.buttons.backIconPosition||"left"});break;case"save":t.buttons.save&&a.push({handle:"save",label:t.buttons.saveLabel,enabled:t.buttons.save,assetId:t.buttons.saveIcon?.[0]||void 0,iconPosition:t.buttons.saveIconPosition||"left"});break;default:return}}),o.push(a)}),o},wu=c.div`
  display: flex;
  justify-content: space-between;

  padding: ${f.sm} ${f.md};

  border: 1px solid transparent;
  border-radius: ${k.md};

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
`,ui=c.div`
  display: flex;
  gap: ${f.md};
`,$u=c.button`
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
    background-color: ${p.gray600};
    color: white;

    svg {
      fill: white;
    }

    &:hover {
      background-color: ${p.gray700};
    }
  }
`,X8={back:"btn",save:"btn",submit:"btn btn-submit"},ey=({page:t})=>{const n=H(),{getTranslation:s}=ye(t),{active:o,type:i,uid:r}=A(Dt.focus),a=m.useMemo(()=>o&&i===_n.Page&&r===t.uid,[o,i,r,t.uid]),l=vu(t),d=l.flat().map(b=>b.assetId).filter(Boolean),{data:h,isFetching:x}=tr(d,""),g=m.useCallback(b=>{const y=h?.[b]?.src;return x?e.jsx(Z8,{}):e.jsx("img",{src:y,alt:`${b}Alt`})},[h,x]);return e.jsx(pr,{children:e.jsx(wu,{className:T(a&&"active"),onClick:()=>{n(be.setFocusedItem({type:_n.Page,uid:t.uid}))},children:l.map((b,y)=>e.jsx(ui,{className:"page-buttons",children:b.map(({handle:j,label:w,iconPosition:v,assetId:$},C)=>e.jsxs($u,{className:X8[j],type:"button",children:[$&&v==="left"&&g($),s(`${j}Label`,w),$&&v==="right"&&g($)]},C))},y))})})},Cu=c.div`
  display: flex;
  flex: 1 0;
  flex-direction: column;
  gap: ${f.md};

  padding: ${f.sm} ${f.xl} ${f.xl};

  overflow-y: auto;
  overflow-x: hidden;
  ${q};
`,ty=({page:t})=>{const n=Nt(s=>xt.pageLayout(s,t?.layoutUid));return e.jsxs(Cu,{children:[n&&e.jsx(J8,{layout:n}),e.jsx(ey,{page:t})]})},ku=c.div`
  margin: 10px 15px;
`,Su=c.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
  overflow-y: hidden;
  overflow-x: auto;
  ${q};

  &::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover {
    background-color: white;

    &::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  }
`,Lu=()=>(t,n)=>{const s=V(),o=V(),i=n(),r=i.layout.pages.length,a=r+1,l=i.layout.pages?.[r-1];t(vn.add({uid:o})),t(wn.add({uid:s,label:u("Page {number}",{number:a}),layoutUid:o,buttons:l?.buttons??{layout:"save back|submit",attributes:{container:{},column:{},submit:{},back:{},save:{}},submitLabel:u("Submit"),submitIcon:[],submitIconPosition:"left",back:!0,backLabel:u("Back"),backIcon:[],backIconPosition:"left",save:!1,saveLabel:u("Save"),saveIcon:[],saveIconPosition:"left"}})),t(be.setPage(s))},ny=(t,n)=>(s,o)=>{const{layoutUid:i}=n,r=V();s(Ge.add({layoutUid:i,uid:r})),s(fe.moveTo({uid:t.uid,rowUid:r,position:0})),Ys(o(),s)},sy=t=>(n,s)=>{const{uid:o,layoutUid:i}=t,r=s();if(!r.layout.layouts.find(d=>d.uid===i))return;const l=r.layout.pages.find(d=>d.uid!==o);n(be.unfocus()),n(be.setPage(l.uid)),r.layout.rows.filter(d=>d.layoutUid===i).forEach(d=>{const h=[];r.layout.fields.filter(x=>x.rowUid===d.uid).forEach(x=>{h.push(x.uid)}),n(fe.removeBatch(h)),n(Ge.remove(d.uid))}),n(vn.remove(i)),n(wn.remove(o))},oy=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 4.5v15m7.5-7.5h-15"})}),iy=c.button`
  display: flex;
  align-items: center;

  padding: 0 10px;

  transition: all 0.2s ease-in-out;

  &:focus {
    outline: none;
  }

  &:hover {
    transform: scale(1.2);
    color: ${p.black};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`,ry=()=>{const t=H();return e.jsx(iy,{className:"new-page-tab",onClick:()=>{t(Lu())},children:e.jsx(oy,{})})},ay=(t,n)=>{const s=H(),{dragOff:o}=Xs(),[{canDrop:i},r]=Gn({accept:[ee.Field],canDrop:(a,l)=>l.isOver({shallow:!0}),collect:a=>({canDrop:a.canDrop()&&t!==n.uid}),drop:a=>{a.type===ee.Field&&(s(ny(a.data,n)),o())}});return{ref:r,canDrop:i}},pi=c(W.div)`
  position: relative;
`,ly=c.button`
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
`,cy=c.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`,hi=c(W.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  max-width: 160px;
  height: 100%;
  padding: 7px 10px;
  margin: 0 5px;

  color: ${p.gray400};
  border-bottom: 2px solid ${p.gray100};

  overflow: hidden;

  &.active {
    color: ${p.gray800};
    border-bottom-color: ${p.blue600};
  }

  &.errors {
    color: ${p.error};

    ${Di};
  }

  &.can-drop {
    box-shadow: 0 2px 12px ${p.gray500};
    transform: scale(1.1);
    z-index: 2;
  }

  &.is-dragging {
    z-index: 1;
  }

  &:hover {
    cursor: pointer;

    ${ly} {
      opacity: 1;
    }
  }
`;c.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;

  width: 100%;
`;const dy=c.input`
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
`,uy=c.div`
  position: absolute;
  top: 0px;
  right: -7px;

  transform: scale(0.8);
`,py=({page:t,index:n})=>{const s=A(Dt.currentPage),o=A(Je.count),i=H(),{willTranslate:r,updateTranslation:a,getTranslation:l,hasTranslation:d,removeTranslation:h}=ye(t),x=A(Dt.hasErrors(t.uid)),g=m.useRef(null),b=m.useRef(null),[y,j]=m.useState(!1),w=jt(g),{canDrop:v,ref:$}=ay(s?.uid,t);m.useEffect(()=>{y&&(b.current?.focus(),b.current?.select())},[y]);const C=()=>{const M=b.current.value||t.label;a("label",M)||i(wn.updateLabel({uid:t.uid,label:M}))},E=M=>{M.key==="Enter"&&(C(),j(!1)),M.key==="Escape"&&j(!1)},F=yt({callback:()=>{C(),j(!1)},isEnabled:y}),z=$(g);return e.jsx(pi,{ref:z,className:"page-tab sortable-page-tab","data-page-index":n,children:e.jsxs(hi,{ref:F,className:T(s?.uid===t.uid&&"active",x&&"errors",v&&"can-drop",y&&"is-editing"),onClick:()=>{i(be.setPage(t.uid))},onDoubleClick:()=>j(!0),children:[y?e.jsx(dy,{type:"text",ref:b,className:"text small",placeholder:t.label,defaultValue:l("label",t.label),onKeyUp:E}):e.jsxs(cy,{children:[e.jsx("span",{children:l("label",t.label)}),r("label")&&e.jsx(Qc,{className:T(d("label")&&"active"),onClick:()=>{d("label")&&confirm("Are you sure you want to remove the translation?")&&h("label")},children:e.jsx(Gc,{})})]}),o>1&&e.jsx(uy,{children:e.jsx(Sn,{active:w&&!y,onClick:()=>{confirm(u("Are you sure?"))&&i(sy(t))}})})]})})},hy=()=>{const t=H(),n=A(Je.all),s=m.useRef(null),o=I.editions.isAtLeast(le.Lite)&&I.limitations.can("layout.multiPageForms");return m.useEffect(()=>{if(!s.current)return;const i=ze.create(s.current,{animation:150,ghostClass:"sortable-ghost",draggable:".sortable-page-tab",onEnd:r=>{if(r.oldDraggableIndex===void 0||r.newDraggableIndex===void 0||r.oldDraggableIndex===r.newDraggableIndex)return;const a=n[r.oldDraggableIndex];a&&t(wn.moveTo({uid:a.uid,order:r.newDraggableIndex}))}});return()=>{i.destroy()}},[t,n]),e.jsx(ku,{children:e.jsxs(Su,{ref:s,children:[n.map((i,r)=>e.jsx(py,{index:r,page:i},i.uid)),o&&e.jsx(ry,{})]})})},xy=()=>{const t=A(Dt.currentPage);return e.jsxs(uu,{children:[e.jsx(hy,{}),t&&e.jsx(ty,{page:t})]})},hr=c.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: ${p.white};
  border: 1px solid ${p.gray100};
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    border-color: ${p.gray200};
    background-color: ${p.gray050};
  }
`,my=c.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  overflow-y: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`,gy=c.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 18px;

  svg {
    max-width: 18px;
    max-height: 18px;
  }

  color: ${p.gray500};
`,fy=c(W.div)`
  position: relative;
  padding: ${f.lg};

  overflow-y: auto;
  overflow-x: hidden;

  height: 100%;
  ${q};

  &.fields-disabled {
    ${hr} {
      opacity: 0.5;
      user-select: none;
      pointer-events: none;
    }
  }
`,by=c.div`
  color: white;
  background: red;
  border: 1px solid darkred;
`,xr=({children:t})=>e.jsx(by,{children:t}),Fu={all:["groups"]},Tu=({select:t}={})=>B({queryKey:Fu.all,queryFn:()=>N.get("/api/fields/types/groups").then(n=>n.data),staleTime:1/0,select:t}),mr=t=>e.jsx(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h15v15h-15z"}),e.jsx("path",{d:"m6.875 2.5h-2.625c-1.05 0-1.575 0-1.976.205-.353.179-.64.466-.82.819-.204.401-.204.926-.204 1.976v5.25c0 1.05 0 1.575.204 1.976.18.353.467.64.82.82.401.204.926.204 1.976.204h5.25c1.05 0 1.575 0 1.976-.204.353-.18.64-.467.82-.82.204-.401.204-.926.204-1.976v-2.625m-7.5 1.875h1.047c.305 0 .458 0 .602-.034.128-.031.249-.082.361-.15.126-.077.235-.185.451-.402l5.977-5.976c.517-.518.517-1.358 0-1.875-.518-.518-1.358-.518-1.876 0l-5.976 5.976c-.216.217-.325.325-.402.451-.068.112-.119.234-.149.361-.035.144-.035.297-.035.603z",stroke:"#000",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]})}),Eu=c.div`
  margin-bottom: ${f.xl};

  &.disabled {
    opacity: 0.5;
    user-select: none;
    pointer-events: none;
  }
`,gr=c.h2`
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
`,eo=c.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

  margin: 0;
  padding: 0;
`,zu=({title:t,disabled:n,button:s,minEdition:o,children:i})=>{const{editions:r}=I,a=o!==void 0?r.isAtLeast(o):!0;return e.jsxs(Eu,{className:T(n&&"disabled"),children:[e.jsxs(gr,{children:[t,s&&a&&e.jsx("button",{type:"button",title:s.title,onClick:s.onClick,children:s.icon})]}),i]})},yy=()=>e.jsx(hr,{children:e.jsxs(Ht,{children:[e.jsx(L,{width:18,height:18,borderRadius:"50%",style:{position:"relative",top:-2}}),e.jsx(L,{width:50,style:{position:"relative",top:-1}})]})}),fr=({words:t,items:n})=>e.jsxs(Eu,{children:[e.jsx(gr,{children:t.map((s,o)=>e.jsx(L,{width:s,height:16,inline:!0,style:{marginRight:8}},o))}),e.jsx(eo,{children:Kn(n).map(s=>e.jsx(yy,{},s))})]}),to={query:t=>n=>n.search[t]},jy=()=>{const t=A(to.query($n.Fields));return m.useCallback(n=>{if(!t)return n;const s=n.types?.filter(i=>i.toLowerCase().includes(t.toLowerCase())),o=n.groups.grouped.map(i=>({...i,types:i.types.filter(r=>r.toLowerCase().includes(t.toLowerCase()))})).filter(i=>i.types.length>0);return{types:s||[],groups:{...n.groups,grouped:o||[]}}},[t])},vy=()=>{const t=A(to.query($n.Fields));return m.useCallback(n=>t?n.filter(s=>s.label.toLowerCase().includes(t.toLowerCase())):n,[t])},wy=()=>{const t=A(to.query($n.Fields));return m.useCallback(n=>t?n.map(s=>({...s,fields:s.fields.filter(o=>o.label.toLowerCase().includes(t.toLowerCase()))})).filter(s=>s.fields.length>0):n,[t])},$y=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
  margin-bottom: ${f.md};

  svg {
    fill: ${({color:t})=>t||p.black};
  }
`,Cy=c.div`
  text-transform: uppercase;
  font-size: 10px;
`,br=({icon:t,label:n,dragRef:s,onClick:o})=>e.jsxs(hr,{ref:i=>{s&&s(i)},onClick:o,title:n,children:[e.jsx(gy,{dangerouslySetInnerHTML:{__html:t}}),e.jsx(my,{dangerouslySetInnerHTML:{__html:n}})]}),yr=t=>{const{dragOn:n,dragOff:s}=Xs(),[{isDragging:o},i]=Ei(()=>({type:ee.FieldType,collect:r=>({isDragging:r.isDragging()}),item:{type:ee.FieldType,data:t}}));return m.useEffect(()=>{o?n(ee.FieldType):s()},[o,n,s]),{ref:i}},ky=({fieldType:t})=>{const{icon:n,name:s}=t,o=H(),{ref:i}=yr(t),r=()=>{o(Oe.move.newField.newRow({fieldType:t}))};return e.jsx(br,{icon:n,label:u(s),onClick:r,dragRef:i})},Sy=(t={})=>{const n=X(),s=t?.onSuccess;return t.onSuccess=(o,i,r,a)=>{s?.(o,i,r,a),n.invalidateQueries({queryKey:Fu.all})},re({...t,mutationFn:o=>N.post("/api/fields/types/groups",o)})},jr=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m7.5 9.61c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m3.57 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m11.43 5.68c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"}),e.jsx("path",{d:"m7.5 1.75c1.005 0 1.82.815 1.82 1.82s-.815 1.82-1.82 1.82-1.82-.815-1.82-1.82.815-1.82 1.82-1.82z"})]}),Ly=c.div`
  cursor: pointer;

  display: flex;
  gap: 6px;
  align-items: center;

  height: 28px;

  padding: 0 4px;
  overflow: hidden;

  background: ${p.white};
  border: 1px solid ${p.gray100};
  border-radius: 3px;

  font-size: 12px;

  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    border-color: ${p.gray200};
    background-color: ${p.gray050};
  }
`,Fy=c.span`
  flex: 1;
  line-height: 14px;

  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`,Ty=c.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex-shrink: 0;
  flex-basis: 18px;

  svg {
    max-width: 18px;
    max-height: 18px;
  }

  color: ${p.gray500};
`,Ey=c.div`
  color: ${p.gray500};
  margin-right: ${f.xs};
`,No=({typeClass:t})=>{const n=Ne(t),s=m.useRef(null),o=jt(s);if(!n)return null;const{name:i,icon:r}=n;return e.jsxs(Ly,{"data-id":t,ref:s,title:i,children:[e.jsx(Ty,{dangerouslySetInnerHTML:{__html:O.sanitize(r)}}),e.jsx(Fy,{children:i}),o&&e.jsx(Ey,{className:"remove field-item-remove",children:e.jsx(rt,{})})]})},zy=()=>`#${(Math.floor(Math.random()*16777215)+16777216).toString(16).slice(1)}`,Ny=(t,n,s)=>{const o=m.useCallback(()=>{n(a=>({...a,groups:{...a.groups,grouped:[...a.groups.grouped,{uid:V(),label:"",color:zy(),types:[]}]}}))},[n]),i=m.useCallback((a,l,d)=>{n(h=>({...h,groups:{...h.groups,grouped:h.groups.grouped.map(x=>x.uid===d?{...x,[a]:l}:x)}}))},[n]),r=m.useCallback(()=>{const a=ze.get(s.current.hidden).toArray(),d=ze.get(s.current.groupWrapper).toArray().map(h=>({...t.groups.grouped.find(g=>g.uid===h),types:ze.get(s.current[h]).toArray()}));return{hidden:a,grouped:d}},[s,t]);return{addGroup:o,updateGroupInfo:i,syncFromRefs:r}},My=c.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--gray-050);
  height: 600px;
`,Iy=c.div`
  position: relative;
  background-color: ${p.white};
  padding: ${f.md};
  border-radius: ${k.md};
  border: 1px solid ${p.hairline};
  display: flex;
  gap: ${f.md};
`,Nu=c.div`
  padding: 25px ${f.lg};
  display: flex;
  flex-direction: column;
  gap: ${f.md};
  overflow-x: hidden;
  overflow-y: auto;
  ${q};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;Nu.defaultProps={$empty:"Click the 'Add Group' button on the right to begin."};const Ry=c.div`
  flex: 1;
`,Ay=c.div`
  display: flex;
  align-items: flex-start;
  padding-bottom: ${f.lg};
  gap: ${f.lg};
`,Mu=c.div`
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 1fr;
  border-radius: ${k.md};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }

  svg {
    fill: ${({color:t})=>t||p.black};
  }

  .remove {
    svg {
      fill: ${p.black} !important;
    }
  }
`;Mu.defaultProps={$empty:"Drag and drop any field here",color:p.black};const Dy=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
`,Py=c.div`
  padding: 25px ${f.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${q};
`,xi=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;xi.defaultProps={$empty:"Drag and drop any field here"};const By=c.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${f.xl};

  padding-top: ${f.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`,Ja=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
  padding: ${f.xs} ${f.xs} ${f.xs} ${f.md};
`,Oy=c.button`
  appearance: none;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${p.gray100};
  cursor: pointer;
  background-color: ${({color:t})=>t||p.black};
  position: relative;
`,Wy=c.div`
  position: relative;
  flex: 0 0 auto;
`,_y=c.div`
  position: absolute;
  top: -6px;
  left: calc(100% + ${f.sm});
  z-index: 10;
  padding: ${f.sm};
  border: 1px solid ${p.gray100};
  border-radius: ${k.md};
  background: ${p.white};
  box-shadow: 0 10px 24px rgb(32 51 72 / 14%);
`,Hy=c.div`
  color: ${p.warning};
`,Za=(t,n)=>n.options.handle!==".handle",Uy=t=>{const n=(o,i)=>{const r=t.current[o];r&&ze.create(r,i)};Object.entries({unassigned:{group:{name:"shared",put:Za},animation:150,sort:!1},hidden:{group:{name:"shared",put:Za},animation:150,sort:!0,filter:".field-item-remove",onFilter:i=>t.current.unassigned.appendChild(i.item)},groupWrapper:{handle:".handle",filter:".group-remove",sort:!0,animation:150,onFilter:i=>{const r=Array.from(t.current[i.item.dataset.id].children);t.current.unassigned.append(...r),i.item.remove()}}}).forEach(([i,r])=>{n(i,r)})},qy=(t,n,s)=>{t&&(ze.create(t,{animation:150,group:{name:`group-${n}`,put:(o,i)=>i.options.handle!==".handle"},sort:!0,filter:".field-item-remove",onFilter:o=>s.current.unassigned.appendChild(o.item)}),s.current[n]=t)},Qy=({color:t,onChange:n})=>{const[s,o]=m.useState(!1),i=yt({callback:()=>o(!1),isEnabled:s});return e.jsxs(Wy,{ref:i,children:[e.jsx(Oy,{type:"button",color:t,"aria-expanded":s,"aria-label":u("Select Color"),onClick:()=>o(r=>!r)}),s&&e.jsx(_y,{children:e.jsx(Md,{value:t,onChange:n})})]})},Ky=({closeModal:t})=>{const[n,s]=m.useState({}),[o,i]=m.useState(),[r,a]=m.useState(!1),l=m.useRef({}),{addGroup:d,updateGroupInfo:h,syncFromRefs:x}=Ny(n,s,l),{data:g}=Tu();m.useEffect(()=>{g&&!r&&(s(g),a(!0))},[g,r]),m.useEffect(()=>{Uy(l)},[]);const b=Sy({onSuccess:()=>{t()},onError:j=>{i(j.errors)}}),y=b.isPending;return e.jsxs($e,{style:{maxWidth:"70%"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Field Type Manager")})}),e.jsxs(My,{children:[e.jsxs(Nu,{ref:j=>{l.current.groupWrapper=j},$empty:u("Click the 'Add Group' button on the right to begin."),children:[o?.length&&e.jsx(Hy,{children:u("Something went wrong!")}),n.groups?.grouped?.map(j=>e.jsxs(Iy,{"data-id":j.uid,children:[e.jsxs(Ry,{children:[e.jsxs(Ay,{children:[e.jsx(Qy,{color:j.color,onChange:w=>h("color",w,j.uid)}),e.jsx(Le,{value:j.label,property:{type:Y.Label,handle:j.uid},updateValue:w=>h("label",w,j.uid)})]}),e.jsx(Mu,{$empty:u("Drag and drop any field here"),ref:w=>{qy(w,j.uid,l)},color:j.color,children:j.types?.map(w=>e.jsx(No,{typeClass:w},w))})]}),e.jsxs(Dy,{children:[e.jsx("button",{type:"button",className:"group-remove",children:e.jsx(rt,{})}),e.jsx("button",{type:"button",className:"handle",children:e.jsx(jr,{})})]})]},j.uid))]}),e.jsxs(Py,{children:[e.jsx("button",{onClick:d,type:"button",className:"btn add icon dashed",children:u("Add Group")}),e.jsxs(By,{children:[e.jsxs(Ja,{className:"unassigned",children:[e.jsx("h3",{children:u("Unassigned")}),e.jsx(xi,{$empty:u("Drag and drop any fields here. Unassigned fields will display at the bottom of the list of field types."),ref:j=>{l.current.unassigned=j},children:n.types?.map(j=>e.jsx(No,{typeClass:j},j))})]}),e.jsxs(Ja,{children:[e.jsx("h3",{children:u("Hidden")}),e.jsx(xi,{$empty:u("Drag and drop any fields here to hide them."),ref:j=>{l.current.hidden=j},children:n.groups?.hidden?.map(j=>e.jsx(No,{typeClass:j},j))})]})]})]})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn",onClick:t,disabled:y,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(Z,{loadingText:u("Saving..."),loading:y,onClick:()=>b.mutate(x()),spinner:!0,children:u("Save")})})]})]})},Vy=()=>{const{openModal:t}=it();return()=>{t(Ky)}},Gy=u("Field Types"),Xa=({group:t})=>{const n=Kt(),s=t.types.map(o=>{const i=n(o);return i?.visible?i&&e.jsx(ky,{fieldType:i},o):null}).filter(Boolean);return s.length?e.jsxs($y,{color:t.color,children:[t.label&&e.jsx(Cy,{children:u(t.label)}),e.jsx(eo,{children:s})]},t.uid):null},Yy=()=>{const t=jy(),{data:n,isFetching:s,isError:o,error:i}=Tu({select:t}),r=Vy();return!n&&s?e.jsx(fr,{words:[50,70],items:16}):o?e.jsx(xr,{children:i.message}):e.jsxs(zu,{button:I.limitations.can("layout.fieldManager")&&{icon:e.jsx(mr,{}),title:u("Edit Manager"),onClick:r},minEdition:le.Lite,title:u(Gy),children:[n.groups.grouped?.map(a=>e.jsx(Xa,{group:a},a.uid)),n?.types&&e.jsx(Xa,{group:{uid:"external",types:n.types}})]})},no={all:["field-favorites"]},Iu=({select:t}={})=>B({queryKey:no.all,queryFn:()=>N.get("/api/fields/favorites").then(n=>n.data),staleTime:1/0,select:t}),Jy=(t,n)=>{const s=pt(n);return Object.entries(t.properties).forEach(([o,i])=>{const r=s?.properties?.find(a=>a.handle===o);r&&(r.value=i)}),s},Zy=({favorite:t})=>{const{typeClass:n,label:s}=t,o=Ne(n),i=Jy(t,o),r=H(),{ref:a}=yr(i);if(!o||!i)return null;const{icon:l}=o,d=()=>{r(Oe.move.newField.newRow({fieldType:i}))};return e.jsx(br,{icon:l,label:s,onClick:d,dragRef:a})},Xy=({label:t,field:n,type:s})=>{const o={label:t,properties:n.properties,typeClass:s.typeClass};return N.post("/api/fields/favorites",o)},ej=()=>{const t=X();return re({mutationFn:Xy,onSuccess:()=>{t.invalidateQueries({queryKey:no.all})}})},tj=(t={})=>{const n=X(),s=t?.onSuccess;return t.onSuccess=(o,i,r,a)=>{s?.(o,i,r,a),n.invalidateQueries({queryKey:no.all})},re({...t,mutationFn:o=>N.post("/api/fields/favorites/update",o)})},nj=(t={})=>{const n=X(),s=t?.onSuccess;return t.onSuccess=(o,i,r,a)=>{s?.(o,i,r,a);const l=i;n.setQueryData(no.all,d=>d.filter(h=>h.id!==l))},re({...t,mutationFn:o=>N.post("/api/fields/favorites/delete",{id:o})})},sj=t=>t?typeof t=="string"?e.jsx(As,{dangerouslySetInnerHTML:{__html:O.sanitize(t)}}):e.jsx(As,{children:t}):null,vr=({label:t,icon:n,children:s})=>e.jsxs(t2,{children:[e.jsx(Pi,{"data-label":t,children:s}),sj(n)]}),oj=({property:t,siblingProperties:n,state:s,errors:o,updateValueCallback:i})=>{const r=xs(n,s,i);return e.jsx(Le,{value:s?.[t.handle]||"",property:t,updateValue:r(t),errors:o,context:{properties:s}})},ij=t=>n=>n.section===t,rj=({field:t,errors:n,values:s,updateValueCallback:o})=>{const{data:i}=Wi(),r=Ne(t?.typeClass);if(!t||!r||!i)return null;const a=[],l=s?.label||u(r.name);return i.sort((d,h)=>d.order-h.order).forEach(({handle:d,label:h,icon:x})=>{const g=r.properties.filter(ij(d));g.length&&a.push(e.jsx(vr,{label:u(h),icon:x,children:g.map(b=>e.jsx(oj,{errors:n?.[b.handle],state:s,siblingProperties:r.properties,property:b,updateValueCallback:o},b.handle))},d))}),e.jsxs(e.Fragment,{children:[e.jsxs(hn,{children:[e.jsx(Hn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(l)}})]}),e.jsx(Zc,{size:"small",children:e.jsx(Qi,{children:a})})]})},aj=c.div`
  display: flex;
  justify-content: space-between;

  height: 600px;
`,vs=22,lj=c.div`
  flex: 1;

  height: 100%;
  padding: 0 ${f.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${q};

  ${hn} {
    padding-left: 0;
    font-size: 18px;

    ${Hn} {
      width: ${vs}px;
      height: ${vs}px;

      svg {
        max-width: ${vs}px;
        max-height: ${vs}px;
      }
    }
  }

  ${Pi} {
    &:after {
      background-color: white;
    }
  }
`,cj=c.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;

  padding: ${f.sm};

  overflow-y: auto;
  overflow-x: hidden;

  background: ${p.gray050};
  box-shadow: ${oe.right};

  ${q};
`,dj=c.li`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;

  width: 250px;
  padding: ${f.xs} ${f.xs} ${f.xs} ${f.md};

  border: 1px solid transparent;
  border-radius: ${k.lg};
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
    background-color: ${p.gray200};
  }

  &.active {
    background: ${p.gray500};
    color: ${p.white};
    fill: currentColor;

    a {
      color: ${p.blue300};
    }
  }

  &.errors {
    color: ${p.error};
    fill: currentColor;

    ${Di};
  }
`,uj=c.div`
  font-size: 10px;

  &,
  svg {
    height: 20px;
    width: 20px;
  }
`;c.button`
  position: absolute;
  top: 0;
  right: 0;
`;const pj=({favorite:t,label:n,errors:s,isActive:o,onClick:i,onDelete:r})=>{const a=m.useRef(null),l=jt(a),d=Ne(t.typeClass);if(!d)return null;const h=s?.length;return e.jsxs(dj,{ref:a,onClick:i,className:T(o&&"active",h&&"errors"),children:[e.jsx(uj,{dangerouslySetInnerHTML:{__html:O.sanitize(d.icon)}}),e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(n)}}),e.jsx(Sn,{active:l,onClick:r})]},t.id)},hj=({closeModal:t})=>{const{data:n}=Iu(),[s,o]=m.useState(),[i,r]=m.useState({}),[a,l]=m.useState(),[d,h]=m.useState(!1),x=tj({onSuccess:()=>{t()},onError:y=>{l(y.errors)}}),g=nj({onSuccess:(y,j)=>{const w=n.filter(v=>v.id!==j)?.at(0);w?o(w):t()}});m.useEffect(()=>{if(!n||d)return;h(!0),o(n?.[0]);const y={};n.forEach(j=>{y[j.id]=j.properties}),r(y)},[n,d]);const b=x.isPending||g.isPending;return e.jsxs($e,{style:{maxWidth:"70%"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Favorite Fields")})}),e.jsxs(aj,{children:[e.jsx(cj,{children:n.map(y=>e.jsx(pj,{favorite:y,label:i?.[y.id]?.label||y.label,errors:a?.[y.id],isActive:s?.id===y.id,onClick:()=>o(y),onDelete:()=>{confirm(`Are you sure you wish to delete the "${y.label}" field?`)&&g.mutate(y.id)}},y.id))}),e.jsx(lj,{children:s&&e.jsx(rj,{field:s,values:i?.[s.id],errors:a?.[s.id],updateValueCallback:(y,j)=>{r(w=>({...w,[s.id]:{...w[s.id],[y]:j}}))}})})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn",onClick:t,disabled:b,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",disabled:b,onClick:()=>x.mutate(i),children:e.jsx(Z,{loadingText:u("Saving..."),loading:b,spinner:!0,children:u("Save")})})]})]})},xj=()=>{const{openModal:t}=it();return()=>{t(hj)}},mj=u("Favorites"),gj=()=>{const t=vy(),{data:n,isFetching:s,isError:o,error:i}=Iu({select:t}),r=xj(),a=Kt();return!n&&s?e.jsx(fr,{words:[60],items:2}):o?e.jsx(xr,{children:i.message}):n.length?e.jsx(zu,{title:u(mj),button:I.limitations.can("layout.favoritesManager")&&{icon:e.jsx(mr,{}),title:u("Edit Favorites"),onClick:r},children:e.jsx(eo,{children:n.map(l=>{const d=a(l.typeClass);return!d||!d?.visible?null:e.jsx(Zy,{favorite:l},l.id)})})}):null},fj={all:["field-forms"]},bj=({select:t})=>B({queryKey:fj.all,queryFn:()=>N.get("/api/fields/forms").then(n=>n.data),staleTime:1/0,select:t}),yj=t=>e.jsx(R,{height:"1em",viewBox:"0 0 320 512",...t,children:e.jsx("path",{d:"M305 239c9.4 9.4 9.4 24.6 0 33.9L113 465c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l175-175L79 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L305 239z"})}),jj=(t,n)=>{const s=pt(n);return Object.entries(t.properties).forEach(([o,i])=>{const r=s?.properties?.find(a=>a.handle===o);r&&(r.value=i)}),s},vj=({field:t})=>{const{typeClass:n,label:s}=t,o=Ne(n),i=jj(t,o),r=H(),{ref:a}=yr(i);if(!o)return null;const{icon:l}=o,d=()=>{r(Oe.move.newField.newRow({fieldType:i}))};return e.jsx(br,{icon:l,label:s,onClick:d,dragRef:a})},wj=t=>G({maxHeight:t?200:0,paddingTop:t?8:0,paddingBottom:t?8:0,config:{tension:500,friction:t?26:40}}),$j=c.div`
  cursor: pointer;
  position: relative;

  padding: ${f.sm} ${f.xl} ${f.sm} ${f.sm};
  background: ${p.elements.dropdown};

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  user-select: none;
`,Cj=c(W.div)`
  max-height: 0px;
  padding: ${f.sm};

  overflow-x: hidden;
  overflow-y: auto;
  ${q};
`,ws=12,Ru=c.div`
  position: absolute;
  right: 10px;
  top: calc(50% - ${ws/2}px);

  height: ${ws}px;
  width: ${ws}px;
  font-size: ${ws}px;

  transform: rotate(90deg);
  transform-origin: center;
  transition: transform 0.2s ${Ni.easeOut};
`,kj=c.div`
  border: 1px solid ${p.elements.dropdown};
  border-radius: ${k.md};

  margin: 0 -8px;

  &.open {
    ${Ru} {
      transform: rotate(180deg);
    }
  }
`,Sj=({form:t})=>{const[n,s]=m.useState(!1),o=A(to.query($n.Fields)),i=Kt(),r=n||o.length>0,a=wj(r);return t.fields.length?e.jsxs(kj,{className:T(r&&"open"),children:[e.jsxs($j,{onClick:()=>s(!n),children:[t.name,e.jsx(Ru,{children:e.jsx(yj,{})})]}),e.jsx(Cj,{style:a,children:e.jsx(eo,{children:t.fields.map(l=>{const d=i(l.typeClass);return!d||!d?.visible?null:e.jsx(vj,{field:l},l.id)})})})]}):null},Lj=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};
`,Fj=()=>{const{uid:t}=A(De.current),n=wy(),{data:s,isFetching:o,isError:i,error:r}=bj({select:n});if(!s&&o)return null;if(i)return e.jsx(xr,{children:r.message});if(!s||!s.length)return null;const a=s.filter(d=>d.uid!==t).sort((d,h)=>d.name.localeCompare(h.name)),l=a.some(d=>d.fields.length>0);return!a.length||!l?null:e.jsxs(Lj,{children:[e.jsx(gr,{children:u("Fields from other Forms")}),a.map(d=>e.jsx(Sj,{form:d},d.uid))]})},Tj=()=>{const t=_t(),[n,s]=m.useState(""),o=as(n,1e3);return m.useEffect(()=>{t(Z0.update({type:$n.Fields,query:o}))},[o,t]),[n,s]},Au=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{fill:"currentColor",d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"})}),Du=c.div`
  position: relative;
  z-index: 1;

  margin-bottom: ${f.lg};
`,Pu=c.div`
  display: flex;
`,Bu=c.input`
  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${p.gray200};
  }
`,el="14px",Ej=ne`
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
    width: ${el};
    height: ${el};
  }
`,Ou=c.div`
  left: 1px;

  ${Ej}

  color: ${p.gray400};
`,zj=()=>{const[t,n]=Tj();return e.jsx(Du,{children:e.jsxs(Pu,{children:[e.jsx(Ou,{children:e.jsx(Au,{})}),e.jsx(Bu,{type:"text",placeholder:u("Search"),className:"fullwidth text",value:t,onChange:s=>{n(s.target.value)}})]})})},Nj=()=>{Wi();const t=A(Re.count),n=I.editions.is(le.Express)&&t>=I.limits.fields;return e.jsxs(fy,{className:T(n&&"fields-disabled"),children:[e.jsx(zj,{}),e.jsx(gj,{}),e.jsx(Yy,{}),I.limitations.can("layout.formsFields")&&e.jsx(Fj,{})]})},Wu=c.div`
  position: relative;
  display: flex;
  gap: 0;

  height: 100%;
  overflow: hidden;

  background: #fff;
`,mi=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"})}),Mj=t=>e.jsx(R,{viewBox:"0 0 576 512",...t,children:e.jsx("path",{d:"M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9l2.6-2.4C267.2 438.6 256 404.6 256 368c0-97.2 78.8-176 176-176c28.3 0 55 6.7 78.7 18.5c.9-6.5 1.3-13 1.3-19.6v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5zM576 368c0-79.5-64.5-144-144-144s-144 64.5-144 144s64.5 144 144 144s144-64.5 144-144zm-76.7-43.3c6.2 6.2 6.2 16.4 0 22.6l-72 72c-6.2 6.2-16.4 6.2-22.6 0l-40-40c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L416 385.4l60.7-60.7c6.2-6.2 16.4-6.2 22.6 0z"})}),Ij=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M244 84L255.1 96L267.1 84.02C300.6 51.37 347 36.51 392.6 44.1C461.5 55.58 512 115.2 512 185.1V190.9C512 232.4 494.8 272.1 464.4 300.4L283.7 469.1C276.2 476.1 266.3 480 256 480C245.7 480 235.8 476.1 228.3 469.1L47.59 300.4C17.23 272.1 0 232.4 0 190.9V185.1C0 115.2 50.52 55.58 119.4 44.1C164.1 36.51 211.4 51.37 244 84C243.1 84 244 84.01 244 84L244 84zM255.1 163.9L210.1 117.1C188.4 96.28 157.6 86.4 127.3 91.44C81.55 99.07 48 138.7 48 185.1V190.9C48 219.1 59.71 246.1 80.34 265.3L256 429.3L431.7 265.3C452.3 246.1 464 219.1 464 190.9V185.1C464 138.7 430.4 99.07 384.7 91.44C354.4 86.4 323.6 96.28 301.9 117.1L255.1 163.9z"})}),Rj=({category:t,handle:n,error:s})=>{const o=s.errors?.[t]?.[n];return o?e.jsx("ul",{className:"errors",children:o.map((i,r)=>e.jsxs("li",{children:[e.jsx("span",{className:"visually-hidden",children:"Error:"}),i]},r))}):null},Aj=c.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: ${f.lg};
`,Dj=c.div`
  display: flex;
  justify-content: center;
`,Pj=({field:t,type:n,mutation:s})=>{const[o,i]=m.useState("");return m.useEffect(()=>{i(t.properties.label||n?.name),s.reset()},[t.uid,n?.name]),e.jsxs(Aj,{children:[e.jsx(ns,{children:e.jsx(It,{property:{label:u("Create a favorite"),handle:t.properties?.handle,flags:[],placeholder:t.properties?.label,type:Y.String},value:o,updateValue:r=>i(r)})}),e.jsx(Dj,{children:e.jsx("button",{type:"button",disabled:s.isPending,className:T("btn fullwidth",!s.isSuccess&&"submit",s.isPending&&"disabled"),onClick:()=>{s.mutate({label:o,field:t,type:n})},children:e.jsx(Z,{spinner:!0,loading:s.isPending,loadingText:"Saving...",children:u(s.isSuccess?"Saved!":"Favorite")})})}),s.isError&&e.jsx(Rj,{category:"favorites",handle:"name",error:s.error})]})},_u=c(W.div)`
  position: absolute;
  top: 24px;
  right: -16px;

  transform-origin: 90% -20%;
`,Bj=c.div`
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

  background: ${p.gray050};

  border-style: solid;
  border-width: 1px;
  border-color: ${p.barelyVisible};
  border-bottom-color: transparent;
  border-radius: ${k.md} ${k.md} 0 0;

  transform-origin: center bottom;
`,Oj=c.div`
  position: relative;
  z-index: 1;

  width: 240px;
  padding: ${f.lg};

  background: ${p.gray050};
  border: 1px solid ${p.barelyVisible};
  border-radius: ${k.md};

  box-shadow: 4px 12px 8px rgb(205 216 228 / 80%);
`,Wj=c(W.button)`
  position: relative;
  z-index: 5;

  width: 20px;
  height: 20px;

  svg {
    fill: ${p.barelyVisible};
  }
`,_j=c.div`
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
    ${_u} {
      pointer-events: none;
    }
  }
`,Hj=({field:t})=>{const n=Ne(t?.typeClass),s=ej(),[o,i]=m.useState(!1),[r,a]=m.useState(!1);m.useEffect(()=>{i(!1),a(!1),s.reset()},[t?.uid,s.reset]);const l=G({to:{opacity:o?1:0,scale:o?1:1.1,rotate:o?0:-10},config:{tension:700}}),d=G({to:{scale:r?1.2:1},config:{tension:600,mass:3}}),h=yt({callback:()=>{i(!1),a(!1)},isEnabled:o});return Jn(()=>{i(!1),a(!1)},o),!t?.uid||n.type==="group"?null:e.jsxs(_j,{className:T(o&&"active"),ref:h,children:[e.jsxs(Wj,{style:d,onClick:()=>i(!o),onMouseOver:()=>a(!0),onMouseOut:()=>a(!1),children:[s.isSuccess&&e.jsx(Mj,{}),!s.isSuccess&&e.jsx(Ij,{})]}),e.jsxs(_u,{style:l,children:[e.jsx(Bj,{}),e.jsx(Oj,{children:e.jsx(Pj,{field:t,type:n,mutation:s})})]})]})},Uj=({property:t,field:n,autoFocus:s})=>{const o=H(),i=Ne(n.typeClass),{getTranslation:r,updateTranslation:a,canUseTranslationValue:l}=ye(n),d=A(Re.one(n.uid)),h={id:d.id,...d?.properties||{}},x=xs(i.properties,h,(y,j)=>{a(y,j)||o(fe.edit({uid:n.uid,handle:y,value:j}))}),g=n.properties?.[t.handle],b=r(t.handle,g);return e.jsx(Le,{autoFocus:s,value:l(t)?b:g,property:t,updateValue:x(t),errors:n.errors?.[t.handle],context:n})},Mo=c.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  background: ${p.gray050};
`,qj=t=>n=>n.section===t,Qj=({uid:t})=>{const n=H(),{data:s,isFetching:o}=Wi(),i=A(Re.one(t)),r=Ne(i?.typeClass),a=m.useMemo(()=>{const l=[];return s?.sort((d,h)=>d.order-h.order)?.forEach(({handle:d,label:h,icon:x},g)=>{const b=r?.properties.filter(qj(d)).filter(y=>y.visible);b?.length&&l.push(e.jsx(vr,{label:u(h),icon:x,children:b.map((y,j)=>e.jsx(Uj,{autoFocus:g===0&&j===0,field:i,property:y},y.handle))},d))}),l},[s,r,i]);return!i||!r?e.jsx(Mo,{}):!s&&o?e.jsxs(Mo,{children:[e.jsxs(hn,{children:[e.jsx(Hn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{children:u(r.name)})]}),e.jsx(Un,{children:e.jsx(L,{})})]}):e.jsxs(Mo,{children:[e.jsx(Qo,{onClick:()=>n(be.unfocus()),children:e.jsx(mi,{})}),I.limitations.can("layout.favorite")&&e.jsx(Hj,{field:i}),e.jsxs(hn,{children:[e.jsx(Hn,{dangerouslySetInnerHTML:{__html:O.sanitize(r.icon)}}),e.jsx("span",{children:u(r.name)})]}),e.jsx(Un,{children:a})]})},Kj=({property:t,page:n})=>{const s=H(),{getTranslation:o,updateTranslation:i}=ye(n),r=t.handle,a=h=>{i(r,h)||s(wn.editButtons({uid:n.uid,key:r,value:h}))},l=n.buttons?.[r],d=typeof l=="string"?o(r,l):l;return e.jsx(Le,{value:d,property:t,updateValue:a,context:n})},tl=c.div`
  display: flex;
  flex-direction: column;

  height: 100%;
  background: ${p.gray050};
`,Vj=t=>n=>n.section===t,Gj=({uid:t})=>{const n=H(),s=A(Je.one(t)),{data:o,isFetching:i}=qc();if(!o&&i)return e.jsxs(tl,{children:[e.jsx(Qo,{onClick:()=>n(be.unfocus()),children:e.jsx(mi,{})}),e.jsx(hn,{children:e.jsx("span",{children:s.label})}),e.jsxs(Un,{style:{paddingTop:20},children:[e.jsx(L,{height:30}),e.jsx(L,{height:30}),e.jsx(L,{height:30})]})]});if(!s)return null;const r=[];return o.sections.forEach(({handle:a,label:l,icon:d})=>{const h=o.properties.filter(Vj(a)).filter(x=>x.visible);h.length&&r.push(e.jsx(vr,{label:l,icon:d,children:h.map(x=>e.jsx(Kj,{page:s,property:x},x.handle))},a))}),e.jsxs(tl,{children:[e.jsx(Qo,{onClick:()=>n(be.unfocus()),children:e.jsx(mi,{})}),e.jsx(hn,{children:e.jsx("span",{children:s.label})}),e.jsx(Un,{children:r})]})},Yj=()=>{const t=H(),n=A(Dt.focus),{active:s,type:o}=n;Jn(()=>t(be.unfocus()),s);const i=yt({callback:()=>{t(be.unfocus())},isEnabled:s,excludeClassNames:["field-layout","page-buttons","page-tab","save-button","main-tabs","editable-content","dropdown-rollout","breadcrumbs","tagify__dropdown","tox","elementselectormodal"]}),r=Il(s?[n]:null,{from:{transform:"translate3d(100%, 0, 0)",opacity:1},enter:{transform:"translate3d(0%, 0, 0)",opacity:1,zIndex:2},leave:{transform:"translate3d(-100%, 0, 0)"},config:{tension:500,friction:50}});return e.jsx(Zc,{size:"small",children:e.jsx(Xh,{$active:s,ref:i,children:e.jsx(ar,{message:`Could not load property editor for "${o}" type`,children:r((a,l)=>e.jsxs(e2,{style:a,children:[!!l&&l.type==="field"&&e.jsx(Qj,{uid:l.uid}),!!l&&l.type==="page"&&e.jsx(Gj,{uid:l.uid})]}))})})})},Jj=()=>{const t=et("");return e.jsxs(l8,{children:[e.jsx(Q,{id:"layout",label:u("Layout"),url:t.pathname}),e.jsxs(Wu,{children:[e.jsxs(Pe,{$noPadding:!0,children:[e.jsx(Yj,{}),e.jsx(Nj,{})]}),e.jsx(xy,{})]})]})},so=c.div`
  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: ${f.xl};

  background: ${p.white};
  padding: ${f.xl};

  overflow-y: auto;

  ${q};
`,Hu=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
`,Zj=()=>{const t=et(""),n=or(),{templates:s}=ir(""),{templates:{canCreate:o,method:i}}=I,r=()=>{n({type:"form"})};return e.jsxs(so,{children:[e.jsx(Q,{id:"notification-manager",label:u("Manager"),url:t.pathname}),e.jsxs(Hu,{children:[e.jsx("h1",{children:u("Notification Manager")}),e.jsx(Jd,{children:e.jsx(ci,{value:"",title:u("Form Templates"),templates:s.form,openEditOnClick:!0,onClick:()=>{},canCreate:o&&i!==Yn.Global,onCreate:r})})]})]})},Xj=c.div`
  display: flex;
  height: 100%;
`,e7=(t,n)=>(s,o)=>{const{className:i,properties:r,newInstanceName:a}=t,l={};r.forEach(x=>{l[x.handle]=x.value});const d=Tn.count.ofType(i)(o()),h=`${a} notification ${d+1}`;s(zt.add({uid:n,className:i,enabled:!0,...l,name:h}))},t7=t=>n=>{n(zt.remove(t.uid))},Io=20,oo=c.div`
  display: block;
  width: ${Io}px;
  height: ${Io}px;
  font-size: ${Io}px;
  fill: ${p.gray550};
`,wr=c(pe)`
  display: flex;
  align-items: center;
  gap: ${f.sm};

  padding: ${f.sm} ${f.md};
  border-radius: ${k.lg};

  color: ${p.gray700};
  font-size: 12px;
  line-height: 12px;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${p.white};
    background-color: ${p.gray500};

    ${oo} {
      fill: ${p.white};
    }
  }

  &.active.inactive {
    .status-dot {
      border-color: ${p.white};
    }
  }

  &:hover {
    text-decoration: none;
  }

  &:hover:not(.active) {
    background-color: ${p.gray200};
  }

  &.errors {
    color: ${p.error};
  }
`,Uu=c.div`
  flex-grow: 1;
  max-width: 90%;
  overflow: hidden;

  &:empty:after {
    content: 'No Title';
    color: ${p.gray400};
    font-style: italic;
  }
`,n7=c.div`
  content: '';

  flex-shrink: 0;
  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({$enabled:t})=>t?"transparent":p.gray550};
  border-radius: 100%;

  background-color: ${({$enabled:t})=>t?p.teal550:"transparent"};

  transition: all 0.3s ease-out;
`,gi=c.div``,fi=c.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 5px;
  line-height: 22px;
`,nl=c.span`
  padding-left: ${f.md};
  font-weight: 700;
  font-size: 11px;
  color: ${p.gray550};
  text-transform: uppercase;
`,s7=c.button`
  align-self: end;

  &:hover {
    background-color: ${p.gray200};
  }
`,bi=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
  padding: ${f.xs} 0;
`,o7=c.div`
  padding: 2px;
  margin-left: 12px;

  font-style: italic;
  font-size: 12px;

  color: ${p.gray300};
`,i7=({type:t,children:n})=>{const s=te(),o=H(),{setLastTab:i}=_e("notifications"),{name:r,edition:a}=t,{isAtLeast:l}=I.editions;return l(t.edition)?e.jsxs(gi,{children:[e.jsxs(fi,{children:[e.jsx(nl,{children:u(r)}),e.jsx(s7,{type:"button",className:T("btn","add","icon","small","dashed"),onClick:()=>{const d=V();o(e7(t,d)),i(d),s(d)},children:u("New")})]}),e.jsx(bi,{children:n})]}):e.jsxs(gi,{children:[e.jsx(fi,{children:e.jsx(nl,{children:u(r)})}),e.jsx(bi,{style:{opacity:.7},children:e.jsxs(wr,{className:"flex",to:Craft.getCpUrl("plugin-store/freeform"),target:"_blank",children:[e.jsx(oo,{className:T("disabled-icon"),children:e.jsx("i",{className:"fa-thin fa-star-exclamation"})}),e.jsx("span",{className:T("edition-label"),children:u("Upgrade to {edition} to enable.",{edition:Bl(a)})})]})})]})},r7=()=>e.jsx(Fn,{children:e.jsxs(gi,{children:[e.jsx(fi,{children:e.jsx(L,{width:50})}),e.jsx(bi,{style:{padding:14},children:[0,1,2].map(t=>e.jsxs("div",{style:{display:"flex",gap:10,alignItems:"center"},children:[e.jsx(L,{width:20,height:20,circle:!0}),e.jsx("div",{style:{flexGrow:2},children:e.jsx(L,{width:100,style:{top:2}})}),e.jsx(L,{width:10,height:10,circle:!0,style:{top:6}})]},t))})]})}),a7=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M535.6 85.7C513.7 63.8 478.3 63.8 456.4 85.7L432 110.1L529.9 208L554.3 183.6C576.2 161.7 576.2 126.3 554.3 104.4L535.6 85.7zM236.4 305.7C230.3 311.8 225.6 319.3 222.9 327.6L193.3 416.4C190.4 425 192.7 434.5 199.1 441C205.5 447.5 215 449.7 223.7 446.8L312.5 417.2C320.7 414.5 328.2 409.8 334.4 403.7L496 241.9L398.1 144L236.4 305.7zM160 128C107 128 64 171 64 224L64 480C64 533 107 576 160 576L416 576C469 576 512 533 512 480L512 384C512 366.3 497.7 352 480 352C462.3 352 448 366.3 448 384L448 480C448 497.7 433.7 512 416 512L160 512C142.3 512 128 497.7 128 480L128 224C128 206.3 142.3 192 160 192L256 192C273.7 192 288 177.7 288 160C288 142.3 273.7 128 256 128L160 128z"})}),l7=({icon:t,notification:{uid:n}})=>{const{setLastTab:s}=_e("notifications"),{name:o,enabled:i,errors:r}=A(Tn.one(n));return e.jsxs(wr,{onClick:()=>s(n),to:`${n}`,className:T(mn(r)&&"errors",!i&&"inactive"),children:[t&&e.jsx(oo,{dangerouslySetInnerHTML:{__html:O.sanitize(t)}}),e.jsx(Uu,{children:o}),e.jsx(n7,{$enabled:i,className:T("status-dot")})]})},c7=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.sm};
  height: 100%;

  overflow-x: hidden;
  overflow-y: auto;
  ${q};
`,d7=I.templates.method,u7=()=>{const t=I.limitations,{formId:n,uid:s}=K(),{pathname:o}=Wt(),i=te(),{lastTab:r,setLastTab:a}=_e("notifications"),{data:l,isFetching:d}=wc();Ri(n?Number(n):void 0);const h=A(Tn.all);return m.useEffect(()=>{!s&&!o.endsWith("/manager")&&r&&i(r)},[s,r,i,o]),m.useEffect(()=>{if(!o.endsWith("/manager")&&!s&&!r&&l&&h){const x=h.find(Boolean);x&&(a(x.uid),i(x.uid))}},[s,l,h,r,i,o,a]),!l&&d?e.jsx(Pe,{children:e.jsx(r7,{})}):!l&&!d?e.jsx(e.Fragment,{children:"Empty"}):e.jsx(Pe,{$lean:!0,children:e.jsxs(c7,{children:[l.filter(x=>t.can(`notifications.tab.${x.className}`)).map(x=>e.jsxs(i7,{type:x,children:[h?.filter(g=>g.className===x.className).map(g=>e.jsx(l7,{icon:x.icon,notification:g},g.uid)),!h?.filter(g=>g.className===x.className)?.length&&e.jsx(o7,{children:u("None configured")})]},x.className)),d7!==Yn.Global&&e.jsxs(wr,{onClick:()=>a(s),to:"manager",children:[e.jsx(oo,{children:e.jsx(a7,{})}),e.jsx(Uu,{children:u("Template Manager")})]})]})})},p7=()=>{const t=et("");return e.jsxs(Xj,{children:[e.jsx(Q,{id:"notifications",label:u("Notifications"),url:t.pathname}),e.jsx(u7,{}),e.jsx(mt,{})]})},h7=({notification:t,property:n})=>{const s=H(),{uid:o}=t,{handle:i}=n,r=l=>{s(zt.modify({uid:o,key:i,value:l}))},a=t?.[n.handle];return e.jsx(Le,{value:a,property:n,updateValue:r,errors:t.errors?.[n.handle],context:t})},x7=t=>e.jsxs(R,{height:"1em",viewBox:"0 0 512 512",...t,children:[e.jsx("defs",{children:e.jsx("style",{children:".fa-secondary{opacity:0.2;fill:#a1a5aa;}.fa-primary{fill:#a6a8ab;}"})}),e.jsx("path",{className:"fa-primary",d:"M380.7 185.8c5.1-6.7 4.2-16.2-2.1-21.8s-15.9-5.3-21.9 .7l-179 179-13 13c-3 3-4.7 7.1-4.7 11.3v8 56 48c0 13.2 8.1 25 20.3 29.8s26.2 1.6 35.2-8.1L284 427.7l-60-25V389.4L380.7 185.8z"}),e.jsx("path",{className:"fa-secondary",d:"M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L224 402.7V389.4L380.7 185.8c5.2-6.7 4.2-16.4-2.3-21.9s-16.1-5.1-22 1.1L178.8 350.6l-14.1 14.1c-3 3-4.7 7.1-4.7 11.3l-28.3-11.8-112-46.7C8.4 312.8 .8 302.2 .1 290s5.5-23.7 16.1-29.8l448-256c10.7-6.1 23.9-5.5 34 1.4z"})]}),m7=()=>e.jsx(so,{children:e.jsx(At,{title:u("No notifications found"),subtitle:u("To add a notification, use the sidebar on the left"),icon:e.jsx(x7,{})})});c.div`
  display: flex;
  gap: ${f.md};
`;const g7=()=>e.jsx(so,{children:e.jsxs(Fn,{children:[e.jsx(L,{width:120,height:20}),e.jsx("br",{}),e.jsx(L,{width:100,height:10}),e.jsx(L,{width:50,height:20}),e.jsx("br",{}),e.jsx(L,{width:200,height:10}),e.jsx(L,{width:500,height:10}),e.jsx(L,{height:30}),e.jsx("br",{}),e.jsx(L,{width:150,height:10}),e.jsx(L,{width:300,height:10}),e.jsx(L,{height:30})]})}),f7=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),b7=({hovering:t})=>G({opacity:1,background:t?p.error:"transparent",color:t?"#fff":p.gray300,scale:t?1.2:1,config:n=>{switch(n){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),y7=c(W.button)`
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
`,j7=({notification:t})=>{const n=te(),s=H(),[o,i]=m.useState(!1),r=b7({hovering:o});return e.jsx(y7,{type:"button",style:r,onMouseEnter:()=>i(!0),onMouseLeave:()=>i(!1),onClick:()=>{s(t7(t)),n("..")},children:e.jsx(f7,{})})},v7=()=>{const{formId:t,uid:n}=K(),s=et(""),{data:o}=wc(),{data:i,isFetching:r}=Ri(t?Number(t):void 0),a=A(Tn.one(n));if(!i&&r)return e.jsx(g7,{});if(!a)return e.jsx(m7,{});const l=o?.find(d=>d.className===a.className)?.properties||[];return e.jsxs(so,{children:[e.jsx(Q,{id:"notification",label:a.name,url:s.pathname}),e.jsx(j7,{notification:a}),e.jsx(Hu,{children:l.map(d=>e.jsx(h7,{notification:a,property:d},d.handle))})]})},$r={one:(t,n)=>s=>s.rules.buttons?.items?.find(o=>o.page===t&&o.button===n),hasRule:(t,n)=>J(s=>s.rules.buttons.items,s=>!!s.find(o=>o.page===t&&o.button===n)),hasFieldInRule:t=>J(n=>n.rules.buttons.items,n=>!!n.find(s=>s.conditions.some(o=>o.field===t)))},Cr=({value:t,onChange:n})=>e.jsx("div",{className:"select",children:e.jsxs("select",{value:t,onChange:s=>n?.(s.target.value),children:[e.jsx("option",{value:pn.Show,children:u("show")}),e.jsx("option",{value:pn.Hide,children:u("hide")})]})}),Ze=c.div`
  position: relative;

  flex: 1;

  background: ${p.white};
  padding: ${f.xl};

  overflow-x: hidden;
  overflow-y: auto;
  ${q};
`,w7=t=>e.jsx(R,{fill:"none",viewBox:"0 0 24 24",strokeWidth:"1.5",stroke:"currentColor",className:"w-6 h-6",...t,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"})}),$7=({hovering:t})=>G({opacity:1,background:t?p.error:"transparent",color:t?"#fff":p.gray300,scale:t?1.2:1,config:n=>{switch(n){case"background":case"color":return{tension:330,friction:20};default:return{tension:330,friction:15}}}}),C7=c(W.button)`
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
`,io=({onClick:t})=>{const[n,s]=m.useState(!1),o=$7({hovering:n});return e.jsx(C7,{type:"button",style:o,onMouseEnter:()=>s(!0),onMouseLeave:()=>s(!1),onClick:t,children:e.jsx(w7,{})})},ro=({label:t})=>{const n=A(Re.all),s=n.length>0?n[0].uid:"",o=n.length>1?n[1].uid:"",i={combinator:Be.Or,conditions:[{field:s,operator:se.Contains,value:"John Doe",uid:"test-1"},{field:o,operator:se.EndsWith,value:"@gmail.com",uid:"test-2"}],display:pn.Show};return e.jsxs(Ze,{children:[e.jsx(st,{children:e.jsx(Z,{children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(t)}})})}),e.jsxs(k7,{children:[e.jsx(L7,{dangerouslySetInnerHTML:{__html:O.sanitize(u('<a href="{link}" target="_blank">Upgrade to Freeform Pro</a> to create conditional rules.',{link:Craft.getCpUrl("plugin-store/freeform")}))}}),e.jsxs(S7,{children:[e.jsxs(en,{children:[e.jsx(Cr,{value:i.display}),u("this field when"),e.jsx(Zt,{value:i.combinator}),u("of the following rules match:")]}),e.jsx(Xt,{conditions:i.conditions,buttonLabel:"Upgrade to Freeform Pro to create conditional rules."})]})]})]})},k7=c.div`
  position: relative;
`,S7=c.div`
  user-select: none;
  pointer-events: none;
  filter: blur(1.3px);
`,L7=c.div`
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

  padding: ${f.md} ${f.xl};

  border: 2px solid ${p.blue400};
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 6px rgba(31, 41, 51, 0.2);

  font-size: 14px;
  text-align: center;
  color: ${p.gray700};

  a {
    color: ${p.blue500};
    font-weight: bold;
    text-decoration: underline;
  }

  a:hover {
    color: ${p.blue600};
  }
`,F7=()=>{const{formId:t,button:n,uid:s}=K(),{isFetching:o}=kn(Number(t||0)),i=te(),r=H(),a=A(Je.one(s)),l=A($r.one(s,n));if(!a)return null;const{buttons:d}=a;let h;switch(n){case"save":h=d.saveLabel;break;case"submit":h=d.submitLabel;break;case"back":h=d.backLabel;break;default:h=u("Button Group");break}return I.editions.is(le.Pro)?l?e.jsxs(Ze,{children:[e.jsx(io,{onClick:()=>{r(on.remove(l.uid)),i("..")}}),e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:o,children:h})}),!o&&e.jsxs(e.Fragment,{children:[e.jsxs(en,{className:"short",children:[e.jsx(Cr,{value:l.display,onChange:g=>r(on.modifyDisplay({ruleUid:l.uid,display:g}))}),u("this button when"),e.jsx(Zt,{value:l.combinator,onChange:g=>r(on.modifyCombinator({ruleUid:l.uid,combinator:g}))}),u("of the following rules match:")]}),e.jsx(Xt,{conditions:l.conditions,onChange:g=>{r(on.modifyConditions({ruleUid:l.uid,conditions:g}))}})]})]}):e.jsxs(Ze,{children:[e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:o,children:h})}),!o&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>r(on.add({pageUid:s,button:n})),children:u("Add rules")})]}):e.jsx(ro,{label:h})},T7=()=>e.jsx(Ze,{children:u("Please choose a field in the left panel")}),E7=()=>{const{formId:t,uid:n}=K(),{isFetching:s}=kn(Number(t||0)),o=te(),i=H(),r=A(Re.one(n)),a=A(ln.one(n));if(!r)return null;const{label:l}=r.properties,d=I.editions.is(le.Pro);return d?a?d?e.jsxs(Ze,{children:[e.jsx(io,{onClick:()=>{i(rn.remove(a.uid)),o("..")}}),e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(l)}})})}),!s&&e.jsxs(e.Fragment,{children:[e.jsxs(en,{children:[e.jsx(Cr,{value:a.display,onChange:h=>i(rn.modifyDisplay({ruleUid:a.uid,display:h}))}),u("this field when"),e.jsx(Zt,{value:a.combinator,onChange:h=>i(rn.modifyCombinator({ruleUid:a.uid,combinator:h}))}),u("of the following rules match:")]}),e.jsx(Xt,{conditions:a.conditions,onChange:h=>{i(rn.modifyConditions({ruleUid:a.uid,conditions:h}))}})]})]}):null:e.jsxs(Ze,{children:[e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(l)}})})}),!s&&e.jsx("button",{type:"button",className:T("btn add icon dashed"),disabled:!d,onClick:()=>i(rn.add(n)),children:u("Add rules")})]}):e.jsx(ro,{label:l})},kr={one:t=>J(n=>n.rules.pages.items,n=>n.find(s=>s.page===t)),hasRule:t=>J(n=>n.rules.pages.items,n=>!!n.find(s=>s.page===t)),hasFieldInRule:t=>J(n=>n.rules.pages.items,n=>!!n.find(s=>s.conditions.some(o=>o.field===t)))},z7=()=>{const{formId:t,uid:n}=K(),{isFetching:s}=kn(Number(t||0)),o=te(),i=H(),r=A(Je.one(n)),a=A(kr.one(n));if(!r)return null;const{label:l}=r;return I.editions.is(le.Pro)?a?e.jsxs(Ze,{children:[e.jsx(io,{onClick:()=>{i(Rn.remove(n)),o("..")}}),e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(l)}})})}),!s&&e.jsxs(e.Fragment,{children:[e.jsxs(en,{className:"short",children:[u("Go to this page when"),e.jsx(Zt,{value:a.combinator,onChange:h=>i(Rn.modifyCombinator({ruleUid:a.uid,combinator:h}))}),u("of the following rules match:")]}),e.jsx(Xt,{conditions:a.conditions,onChange:h=>{i(Rn.modifyConditions({ruleUid:a.uid,conditions:h}))}})]})]}):e.jsxs(Ze,{children:[e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:s,children:e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(l)}})})}),!s&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>i(Rn.add(n)),children:u("Add rules")})]}):e.jsx(ro,{label:l})},Sr={one:t=>t.rules.submitForm.item,hasRule:t=>!!t.rules.submitForm.item},N7=()=>{const{formId:t}=K(),{isFetching:n}=kn(Number(t||0)),s=te(),o=H(),i=A(Sr.one);return I.editions.is(le.Pro)?i?e.jsxs(Ze,{children:[e.jsx(io,{onClick:()=>{o(An.remove()),s("..")}}),e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:n,children:u("Submit Form Early")})}),!n&&e.jsxs(e.Fragment,{children:[e.jsxs(en,{children:[u("Submit this form when "),e.jsx(Zt,{value:i.combinator,onChange:a=>o(An.modifyCombinator(a))}),u("of the following rules match:")]}),e.jsx(Xt,{conditions:i.conditions,onChange:a=>{o(An.modifyConditions(a))}})]})]}):e.jsxs(Ze,{children:[e.jsx(st,{children:e.jsx(Z,{loadingText:u("Loading data"),loading:n,children:u("Submit Form Early")})}),!n&&e.jsx("button",{type:"button",className:"btn add icon dashed",onClick:()=>o(An.add()),children:u("Add rules")})]}):e.jsx(ro,{label:u("Submit Form Early")})},M7=c.div`
  display: flex;
  height: 100%;
`,qu=c.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  gap: ${f.xs};
`,I7=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xl};
`,R7=c(qu)`
  > span {
    width: 100%;
  }
`,A7=()=>{const t=A(xt.cartographed.fullLayoutList);return e.jsx(Fn,{children:t.map((n,s)=>e.jsxs("div",{children:[e.jsx("div",{style:{marginBottom:14},children:e.jsx(L,{width:"100%",height:30})}),n.map((o,i)=>e.jsx(R7,{style:{display:"flex"},children:o.map((r,a)=>e.jsx(L,{width:"100%",height:28},a))},i))]},s))})},Qu=c.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${f.sm};

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`,D7=c.label`
  flex: 1;
  display: block;

  padding: 1px 0;
  line-height: 12px;
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Ku=c.div`
  flex: 0 0 auto;

  width: 16px;
  height: 16px;
`,Vu=c.div``,P7=c(W.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${f.sm};

  flex: 1;

  overflow: hidden;
  padding: 5px 7px;

  width: 100%;
  height: 100%;

  background: ${p.gray100};
  border: 1px solid ${p.gray100};
  border-radius: ${k.md};

  transition: all 0.2s ease-out;

  &,
  * {
    cursor: pointer;
  }

  &.has-rule:not(.active) {
    border-color: ${p.teal550};
    background-color: ${p.teal050};
  }

  &.group {
    background-color: ${p.white};
    border-color: ${p.gray100};

    > ${Qu} ${Ku} {
      display: none;
    }

    ${Vu} {
      color: ${p.gray800};
    }
  }

  &:hover {
    background-color: ${p.gray200};
    border-color: ${p.gray200};
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
      border-left: 10px solid ${p.gray200};
    }

    &-active:after {
      border-left-color: ${p.teal550};
    }
  }

  &.read-only {
    &,
    * {
      cursor: default;
    }

    &:hover {
      background-color: ${p.gray100};
      border-color: ${p.gray100};
    }
  }
`,B7=({field:t})=>{const n=I.limitations.can("rules.tab.fields"),{uid:s,button:o}=K(),i=te(),r=Wt(),{setLastTab:a}=_e("rules"),l=Ne(t?.typeClass),d=s===t.uid,h=A(ln.one(s)),x=A(kr.one(s)),g=A(Sr.one),b=A($r.one(s,o)),y=A(ln.hasRule(t.uid)),j=r.pathname.endsWith("/rules/submit"),w=A(ln.isInCondition(t.uid)),v=h?.conditions.find($=>$.field===t.uid)||x?.conditions.find($=>$.field===t.uid)||j&&g?.conditions.find($=>$.field===t.uid)||o&&b?.conditions.find($=>$.field===t.uid);return t?.properties===void 0?null:e.jsxs(P7,{onClick:$=>{if($.stopPropagation(),n){const C=s===t.uid?"":`field/${t.uid}`;a(C),i(C)}},className:T(l?.type==="group"&&"group",d&&"active",y&&"has-rule",w&&"is-in-condition",v&&"is-in-condition-active",!n&&"read-only",Nn.negative.includes(v?.operator)&&"not-equals"),children:[e.jsxs(Qu,{children:[e.jsx(Ku,{dangerouslySetInnerHTML:{__html:O.sanitize(l?.icon)}}),e.jsx(D7,{dangerouslySetInnerHTML:{__html:O.sanitize(t.properties.label||l?.name)}})]}),l?.type==="group"&&e.jsx(Vu,{children:e.jsx(Gu,{layoutUid:t.properties.layout})})]})},O7=({row:t})=>{const n=A(Re.inRow(t));return e.jsx(qu,{children:n.map(s=>e.jsx(B7,{field:s},s.uid))})},W7=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
`,Gu=({layoutUid:t})=>{const n=Nt(o=>xt.one(o,t)),s=Nt(o=>Vn.inLayout(o,n?.uid));return!n||!s.length?null:e.jsx(W7,{children:s.map(o=>e.jsx(O7,{row:o},o.uid))})},_7=c.div`
  display: flex;
  justify-content: space-between;

  margin-top: ${f.md};
`,H7=c.div`
  display: flex;
  gap: ${f.xs};
`,Yu=c.button`
  flex: 1 1;

  height: 22px;
  max-width: 60px;
  padding: 0 ${f.sm};

  border: 2px solid transparent;
  border-radius: ${k.lg};
  background-color: rgba(96, 125, 159, 0.25);

  font-size: 12px;
  line-height: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  transition: background-color 0.2s ease-out;

  &.active {
    background-color: ${p.gray600};
    color: white;
  }

  &:hover:not(.active) {
    background-color: rgba(96, 125, 159, 0.3);
  }

  &.submit {
    background-color: ${p.gray600};
    color: ${p.white};

    &.active {
      background-color: ${p.gray900};
    }

    &:hover:not(.active) {
      background-color: ${p.gray900};
    }
  }

  &.has-rule {
    border-color: ${p.teal550};
  }
`,U7=({page:t,button:{handle:n,label:s}})=>{const o=I.limitations.can("rules.tab.buttons"),{uid:i,button:r}=K(),a=te(),{setLastTab:l}=_e("rules"),d=i===t.uid&&n===r,h=A($r.hasRule(t.uid,n));return o?e.jsx(Yu,{type:"button",className:T(n,d&&"active",h&&"has-rule"),onClick:()=>{const x=d?"":`page/${t.uid}/buttons/${n}`;l(x),a(x)},children:u(s)}):null},q7=({page:t})=>{const n=vu(t);return e.jsx(_7,{children:n.map((s,o)=>e.jsx(H7,{className:"page-buttons",children:s.map((i,r)=>e.jsx(U7,{button:i,page:t},r))},o))})},Q7=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M64 496c-26.5 0-48-21.5-48-48V64c0-26.5 21.5-48 48-48H204.1c1.3 0 2.6 .1 3.9 .2V136c0 22.1 17.9 40 40 40H367.8c.2 1.3 .2 2.6 .2 3.9V448c0 26.5-21.5 48-48 48H64zM358.6 157.3c.9 .9 1.7 1.8 2.4 2.7H248c-13.3 0-24-10.7-24-24V22.9c1 .8 1.9 1.6 2.7 2.4L358.6 157.3zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V179.9c0-12.7-5.1-24.9-14.1-33.9L238.1 14.1c-9-9-21.2-14.1-33.9-14.1H64zm40 256c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104zm0 64c-4.4 0-8 3.6-8 8s3.6 8 8 8H280c4.4 0 8-3.6 8-8s-3.6-8-8-8H104z"})}),K7=c.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`,V7=c.button`
  position: relative;
  bottom: -1px;

  display: inline-flex;
  justify-content: start;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${f.sm};

  max-width: 150px;
  padding: ${f.xs} ${f.sm};

  background-color: ${p.white};

  border: 1px solid #cdd8e4;
  border-bottom: none;
  border-radius: ${k.md} ${k.md} 0 0;

  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${p.teal550};
    background-color: ${p.teal050};

    &.active {
      border-right-color: ${p.teal700};
    }
  }

  &.active {
    background-color: ${p.gray500};
    border-color: ${p.gray700};
    color: ${p.white};
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
`,G7=c.div`
  padding: ${f.sm};
  border: 1px solid #cdd8e4;
  background-color: ${p.white};

  border-radius: 0 ${k.md} ${k.md} ${k.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${p.teal550};
    background-color: ${p.teal050};
  }

  &.active {
    background-color: ${p.gray500};
    border-color: ${p.gray700};

    ${Yu} {
      background-color: ${p.gray100};

      &.submit {
        background-color: ${p.red600};
      }
    }
  }
`,Y7=c.div``,J7=c.label`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Z7=({page:t})=>{const n=I.limitations.can("rules.tab.pages"),{uid:s,button:o}=K(),i=te(),{setLastTab:r}=_e("rules"),a=A(kr.hasRule(t.uid)),{label:l,uid:d}=t,h=s===d&&!o;return e.jsxs(K7,{children:[e.jsxs(V7,{onClick:()=>{if(n){const x=h?"":`page/${d}`;r(x),i(x)}},className:T(h&&"active",a&&"has-rule",!n&&"read-only"),children:[e.jsx(Y7,{children:e.jsx(Q7,{})}),e.jsx(J7,{children:l})]}),e.jsxs(G7,{className:T(h&&"active",a&&"has-rule"),children:[e.jsx(Gu,{layoutUid:t.layoutUid}),e.jsx(q7,{page:t})]})]})},X7=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})}),ev=c.div`
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: ${f.xs};

  padding: ${f.xs} ${f.sm};
  border: 1px solid #cdd8e4;
  background-color: ${p.white};

  border-radius: ${k.md};

  transition: all 0.2s ease-out;

  &.has-rule {
    border-color: ${p.teal550};
    background-color: ${p.teal050};
  }

  &.active {
    background-color: ${p.gray500};
    border-color: ${p.gray700};

    color: white;
    fill: currentColor;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`,tv=c.label`
  cursor: pointer;

  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,nv=()=>{const t=I.limitations.can("rules.tab.submit"),n=te(),s=Wt(),{setLastTab:o}=_e("rules"),i=A(Sr.hasRule),r=s.pathname.endsWith("/rules/submit");return t?e.jsxs(ev,{onClick:()=>{o("submit"),n("submit")},className:T(r&&"active",i&&"has-rule"),children:[e.jsx("div",{children:e.jsx(X7,{})}),e.jsx(tv,{children:u("Submit Form Early")})]}):null},sv=()=>{const{formId:t}=K(),{isFetching:n}=kn(Number(t||0)),s=A(Je.all),{lastTab:o}=_e("rules"),i=te();return m.useEffect(()=>{o&&i(o)},[o,i]),e.jsx(Pe,{children:e.jsxs(I7,{children:[n&&e.jsx(A7,{}),!n&&s.map(r=>e.jsx(Z7,{page:r},r.uid)),s.length>1&&e.jsx(nv,{})]})})},ov=()=>{const t=et("");return e.jsxs(M7,{children:[e.jsx(Q,{id:"rules",label:u("Rules"),url:t.pathname}),e.jsx(sv,{}),e.jsx(mt,{})]})},Lr=t=>{const n=m.useCallback(s=>{if(s.key==="s"){const o=window.navigator.platform.match(/Mac/);return o&&!s.metaKey||!o&&!s.ctrlKey?void 0:(s.preventDefault(),t(),!1)}},[t]);Mt({callback:n,type:"keydown"},[t])},iv=({closeModal:t,data:n})=>{const s=()=>{t(),window.location.href=n?.url};return e.jsx(bt,{closeModal:t,children:e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Leave the form builder?")})}),e.jsx("div",{style:{padding:20},children:u("You are about to leave the form builder. Any unsaved changes may be lost if you continue.")}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",className:"btn submit",onClick:s,children:u("Continue")})]})]})})},rv=()=>{const t=I.limitations,n=H(),s=A(De.current),o=A(Dt.state),{openModal:i}=it(),r=A(De.errors),a=A(Re.hasErrors),l=A(Tn.errors.any),d=A(Xn.errors.any),{getTranslation:h}=ye({...s.settings.general,namespaceType:"settings",namespace:"general"}),x=h("name",s.settings.general?.name),{data:g}=Qt(),b=()=>{n(oc())};Lr(b);const y=s.settings?.general?.storeData!==!1,j=!!s.canManageSubmissions,w=!!s.id&&y&&j,v=s.submissionCount??0,C=new URLSearchParams(window.location.search).get("site"),E=`submissions?${C?`site=${C}&`:""}source=form:${s.id}`,F=z=>{z.preventDefault(),s?.id&&i(iv,{url:ve(E)})};return e.jsxs(fd,{children:[e.jsx(Q,{id:"form-name",label:s.name||"Create a new Form",url:`/forms/${s.id}`}),e.jsx(bd,{children:e.jsx(yd,{children:x||u("Create a new Form")})}),e.jsxs(ds,{className:"main-tabs",children:[e.jsx(pe,{to:`/forms/${s.id}`,end:!0,className:T(a&&"errors"),children:e.jsx("span",{children:u("Layout")})}),t.can("notifications.tab")&&e.jsx(pe,{to:`/forms/${s.id}/notifications`,className:T(l&&"errors"),children:e.jsx("span",{children:u("Notifications")})}),t.can("rules.tab")&&e.jsx(pe,{to:`/forms/${s.id}/rules`,children:e.jsx("span",{children:u("Rules")})}),I.limitations.can("integrations.tab")&&e.jsx(pe,{to:`/forms/${s.id}/integrations`,className:T(d&&"errors"),children:e.jsx("span",{children:u("Integrations")})}),I.editions.is(le.Pro)&&s.formMonitor.enabled&&e.jsx(pe,{to:`/forms/${s.id}/form-monitor`,children:e.jsxs("span",{children:[u("Monitoring"),e.jsx(Lg,{children:"BETA"})]})}),g&&I.limitations.can("settings.tab")&&e.jsx(pe,{to:`/forms/${s.id}/settings`,className:T((mn(r?.general)||mn(r?.behavior))&&"errors"),children:e.jsx("span",{children:u("Settings")})})]}),w&&e.jsxs(Sg,{href:ve(E),onClick:F,title:u("View submissions"),className:"go",children:[v," ",u("submissions")]}),e.jsx(jd,{children:e.jsx(kg,{type:"button",onClick:b,disabled:o===Tt.Processing,className:T("btn","submit","save-button"),children:e.jsx(Z,{loadingText:u("Saving..."),loading:o===Tt.Processing,spinner:!0,children:u("Save")})})})]})},av=()=>e.jsxs(od,{children:[e.jsx(rv,{}),e.jsx(id,{children:e.jsxs(Ul,{children:[e.jsx(U,{index:!0,element:e.jsx(Jj,{})}),e.jsxs(U,{path:"notifications",element:e.jsx(p7,{}),children:[e.jsx(U,{path:"manager",element:e.jsx(Zj,{})}),e.jsx(U,{path:":uid?",element:e.jsx(v7,{})})]}),e.jsx(U,{path:"integrations",element:e.jsx(n8,{}),children:e.jsx(U,{path:":id?/:handle?",element:e.jsx(a8,{})})}),e.jsxs(U,{path:"rules",element:e.jsx(ov,{}),children:[e.jsx(U,{index:!0,element:e.jsx(T7,{})}),e.jsx(U,{path:"field/:uid",element:e.jsx(E7,{})}),e.jsx(U,{path:"page/:uid",element:e.jsx(z7,{})}),e.jsx(U,{path:"page/:uid/buttons/:button",element:e.jsx(F7,{})}),e.jsx(U,{path:"submit",element:e.jsx(N7,{})})]}),e.jsxs(U,{path:"settings",element:e.jsx(rg,{}),children:[e.jsx(U,{index:!0,element:e.jsx(Ka,{})}),e.jsx(U,{path:":sectionHandle",element:e.jsx(Ka,{})})]}),e.jsx(U,{path:"form-monitor",element:e.jsx(Jx,{}),children:e.jsx(U,{index:!0,element:e.jsx(Vm,{})})})]})})]}),lv=()=>e.jsx(fu,{style:{flex:1},children:e.jsxs(gu,{children:[e.jsx(xu,{children:e.jsx(L,{height:10,width:60,baseColor:p.gray300,highlightColor:p.gray200})}),e.jsx(mu,{children:e.jsx(L,{height:8,width:300})}),e.jsx(L,{height:30,width:"100%"})]})}),$s=()=>e.jsx(yu,{children:e.jsx(ju,{children:e.jsx(lv,{})})}),cv=()=>e.jsxs(pr,{children:[e.jsx($s,{}),e.jsx($s,{}),e.jsx($s,{}),e.jsx($s,{})]}),dv=()=>e.jsxs(wu,{children:[e.jsx(ui,{}),e.jsx(ui,{children:e.jsx($u,{className:"btn btn-submit",children:e.jsx(L,{width:50,baseColor:p.gray400})})})]}),uv=()=>e.jsxs(Cu,{children:[e.jsx(cv,{}),e.jsx(dv,{})]}),pv=()=>e.jsx(Ht,{children:e.jsx(ku,{children:e.jsxs(Su,{children:[e.jsx(pi,{children:e.jsx(hi,{className:"active",children:e.jsx("span",{children:e.jsx(L,{width:42})})})}),e.jsx(pi,{children:e.jsx(hi,{children:e.jsx("span",{children:e.jsx(L,{width:42})})})})]})})}),hv=()=>e.jsxs(uu,{children:[e.jsx(pv,{}),e.jsx(uv,{})]}),xv=()=>e.jsx(Du,{children:e.jsxs(Pu,{children:[e.jsx(Ou,{children:e.jsx(Au,{})}),e.jsx(Bu,{disabled:!0,className:"fullwidth text",placeholder:u("Search")})]})}),mv=()=>e.jsxs(Pe,{children:[e.jsx(xv,{}),e.jsx(fr,{words:[50,70],items:16})]}),gv=()=>e.jsxs(e.Fragment,{children:[e.jsx(mv,{}),e.jsx(hv,{})]}),fv=()=>e.jsx(Ht,{baseColor:p.gray300,highlightColor:p.gray200,height:10,children:e.jsxs(fd,{children:[e.jsx(bd,{children:e.jsx(yd,{children:e.jsx(L,{width:"50%",height:20})})}),e.jsxs(ds,{children:[e.jsx("a",{className:"active",children:e.jsx("span",{children:e.jsx(L,{width:43})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(L,{width:82})})}),I.editions.is(le.Pro)&&e.jsx("a",{children:e.jsx("span",{children:e.jsx(L,{width:36})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(L,{width:77})})}),e.jsx("a",{children:e.jsx("span",{children:e.jsx(L,{width:54})})})]}),e.jsx(jd,{children:e.jsx(L,{})})]})}),bv=()=>e.jsxs(od,{children:[e.jsx(fv,{}),e.jsx(id,{children:e.jsx(Wu,{children:e.jsx(gv,{})})})]}),yv=()=>{const{formId:t}=K(),n=t?Number(t):void 0,s=H(),o=hh(n),i=ph(n),r=rx(n);Qt(),kn(n),sd(n),Ri(n),Ii(n);const{data:a,isFetching:l,isError:d,error:h}=ch(n);return m.useEffect(()=>{if(t===void 0||!a)return;const{translations:x,layout:{fields:g,pages:b,layouts:y,rows:j}}=a;s(ht.update(a)),s(fe.set(g)),s(wn.set(b)),s(vn.set(y)),s(Ge.set(j)),s(qo.init(x)),document.title=a.name,o(),i(),r(),b.length===0?s(Lu()):s(be.setPage(b.find(Boolean)?.uid))},[a,t,s,i,o,r]),l?e.jsx(bv,{}):d?e.jsxs("div",{children:["ERROR: ",h.message]}):e.jsx(av,{})},jv=zi`
  #freeform-client-app {
    height: calc(100vh - 100px);
  }
`,vv=()=>e.jsxs(e.Fragment,{children:[e.jsx(Q,{id:"form-editor",label:"Forms",url:"/forms"}),e.jsx(jv,{}),e.jsx(tc,{children:e.jsx(yv,{})})]});function sl(t,n,s,o){const i=m.useRef(n);Zl(()=>{i.current=n},[n]),m.useEffect(()=>{const r=window;if(!r?.addEventListener)return;const a=l=>{i.current(l)};return r.addEventListener(t,a,o),()=>{r.removeEventListener(t,a,o)}},[t,s,o])}const Ro=typeof window>"u";function Ju(t,n,s={}){const{deserializer:o,initializeWithValue:i=!0,serializer:r}=s,a=m.useRef(n),l=m.useCallback(()=>{const v=a.current;return v instanceof Function?v():v},[]),d=m.useCallback(v=>r?r(v):JSON.stringify(v),[r]),h=m.useCallback(v=>{if(o)return o(v);if(v==="undefined")return;const $=l();let C;try{C=JSON.parse(v)}catch(E){return console.error("Error parsing JSON:",E),$}return C},[o,l]),x=m.useCallback(()=>{const v=l();if(Ro)return v;try{const $=window.localStorage.getItem(t);return $?h($):v}catch($){return console.warn(`Error reading localStorage key “${t}”:`,$),v}},[h,l,t]),[g,b]=m.useState(()=>i?x():l()),y=Uo(v=>{Ro&&console.warn(`Tried setting localStorage key “${t}” even though environment is not a client`);try{const $=v instanceof Function?v(x()):v;window.localStorage.setItem(t,d($)),b($),window.dispatchEvent(new StorageEvent("local-storage",{key:t}))}catch($){console.warn(`Error setting localStorage key “${t}”:`,$)}}),j=Uo(()=>{Ro&&console.warn(`Tried removing localStorage key “${t}” even though environment is not a client`);const v=l();window.localStorage.removeItem(t),b(v),window.dispatchEvent(new StorageEvent("local-storage",{key:t}))});m.useEffect(()=>{b(v=>{const $=x();return Object.is(v,$)?v:$})},[x]);const w=m.useCallback(v=>{v.key&&v.key!==t||b(x())},[t,x]);return sl("storage",w),sl("local-storage",w),[g,y,j]}const wv=c.header`
  display: grid;
  grid-template-areas: 'title sites views button';
  grid-template-columns: min-content 1fr min-content auto;
  justify-content: space-between;
  align-items: center;
  gap: ${f.md};
`,$v=c.h1`
  grid-area: title;

  padding: ${f.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`,Cv=c.button`
  grid-area: button;
`,kv=c.section`
  grid-area: views;
`,Sv=()=>e.jsxs(e.Fragment,{children:[e.jsxs("div",{children:[e.jsx(L,{height:10,width:50}),e.jsx(L,{height:24})]}),e.jsxs("div",{children:[e.jsx(L,{height:10,width:150}),e.jsx(L,{height:24})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx(L,{height:24,width:38,borderRadius:12}),e.jsxs("div",{style:{flex:1},children:[e.jsx(L,{height:10,width:80}),e.jsx(L,{height:8,width:"60%"})]})]})]}),Lv={all:["form","modal"]},Fv=()=>B({queryKey:Lv.all,queryFn:()=>N.get("/api/forms/modal").then(t=>t.data),staleTime:1/0}),Zu=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};

  padding: ${f.md} ${f.xl};
`,Tv=({closeModal:t})=>{const{current:n}=Fe(),[s,o]=m.useState(!1),[i,r]=m.useState({}),[a,l]=m.useState({sites:n?[n.id]:null}),[d,h]=m.useState(),{data:x,isFetching:g}=Fv();m.useEffect(()=>{if(x){const j=x?.reduce((w,v)=>({...w,[v.handle]:v.value}),{});n&&(j.sites=[n.id]),l(j),r(j)}},[x,n]),m.useEffect(()=>{l(j=>({...j,sites:n?[n.id]:null}))},[n]);const b=te();Mt({callback:j=>{if(j.key==="Enter"){y();return}}},[a]);const y=async()=>{o(!0);try{Yd(a.name,{camelize:!0,transliterate:!0,target:""},void 0,(w,v)=>{a.handle=v}),a.handle=Os(a.handle);const{data:j}=await N.post("/api/forms/modal",a);l({...i}),h(void 0),b(`/forms/${j.id}`),t()}catch(j){h(j.errors?.form)}finally{o(!1)}};return e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Create a new Form")})}),e.jsxs(Zu,{children:[!x&&g&&e.jsx(Sv,{}),x?.map((j,w)=>e.jsx(Le,{updateValue:v=>{l({...a,[j.handle]:v})},autoFocus:w===0,value:a?.[j.handle],property:j,errors:d?.[j.handle]},j.handle))]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",onClick:y,children:e.jsx(Z,{loadingText:u("Saving..."),loading:s,spinner:!0,children:u("Save")})})]})]})},Fr=()=>{const{openModal:t}=it();return()=>{t(Tv)}},at={base:["groups"],all:t=>[...at.base,t]},Xu=()=>{const{current:t,getCurrentHandleWithFallback:n}=Fe();return B({queryKey:at.all(n()),queryFn:()=>N.get("/api/forms/groups",{params:{siteHandle:t?.handle,siteId:t?.id}}).then(s=>s.data)})},Ev=c.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  background: var(--gray-050);
  height: 600px;
`,zv=c.div`
  position: relative;
  background-color: ${p.white};
  padding: ${f.md};
  border-radius: ${k.md};
  border: 1px solid ${p.hairline};
  gap: ${f.md};
`,ep=c.div`
  padding: 25px ${f.lg};
  display: flex;
  flex-direction: column;
  gap: ${f.md};
  overflow-x: hidden;
  overflow-y: auto;
  ${q};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;ep.defaultProps={$empty:"Click the 'Add Group' button on the right to begin."};const Nv=c.div`
  display: flex;
  padding-bottom: ${f.lg};
  gap: ${f.lg};
`,tp=c.div`
  display: grid;
  gap: 6px;
  grid-template-columns: 1fr 1fr;
  border-radius: ${k.md};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }

  svg {
    fill: ${({color:t})=>t||p.black};
  }

  .remove {
    svg {
      fill: ${p.black} !important;
    }
  }
`;tp.defaultProps={$empty:"Drag and drop any field here",color:p.black};const Mv=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};
  position: absolute;
  top: 10px;
  right: 10px;
`,Iv=c.div`
  padding: 25px ${f.lg};

  overflow-x: hidden;
  overflow-y: auto;
  ${q};
`,np=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.xs};

  &:empty::before {
    content: ${({$empty:t})=>`"${t}"`};
    display: block;
  }
`;np.defaultProps={$empty:"Drag and drop any field here"};const Rv=c.div`
  padding-top: ${f.lg};

  > .unassigned {
    .remove {
      display: none;
    }
  }
`,Av=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
  padding: ${f.xs} ${f.xs} ${f.xs} ${f.md};
`,Dv=c.div`
  color: ${p.warning};
`,Pv=c.div`
  cursor: pointer;
  gap: 30px;
  width: 100%;
  overflow: hidden;
  background: ${p.white};
  border: 1px solid ${p.gray100};
  border-radius: 3px;
  font-size: 12px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.02);
    border: 1px solid ${p.gray200};
    background-color: ${p.gray050};
  }
`,Bv=c.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`,Ov=c.h2`
  flex: 1;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 0;
`,Wv=c.div`
  color: ${p.gray500};
  margin-right: ${f.xs};
  position: absolute;
  right: 8px;
  top: 7px;
`,_v=c.div`
  margin-top: 0;
  background-color: ${({$color:t})=>t};
  opacity: 1;
  height: 2px;
  font-size: 1px;
  line-height: 1px;
  overflow: hidden;
`,ol=({form:t})=>{const n=m.useRef(null),s=jt(n),{id:o,name:i,settings:r}=t,{color:a}=r.general;return e.jsxs(Pv,{"data-id":o,ref:n,children:[e.jsx(Bv,{children:e.jsx(Ov,{children:i})}),s&&e.jsx(Wv,{className:"remove form-item-remove",children:e.jsx(rt,{})}),e.jsx(_v,{$color:a})]})},Hv=(t,n,s)=>{const{getCurrentHandleWithFallback:o,current:i}=Fe(),r=m.useCallback(()=>{n(d=>({...d,formGroups:{...d.formGroups,site:d.formGroups?.site?d.formGroups.site:o(),groups:[...d.formGroups?.groups||[],{uid:V(),label:"",formIds:[]}]}}))},[n,o]),a=m.useCallback((d,h,x)=>{n(g=>({...g,formGroups:{...g.formGroups,groups:g.formGroups.groups.map(b=>b.uid===x?{...b,[d]:h}:b)}}))},[n]),l=m.useCallback(()=>{const h=ze.get(s.current.groupWrapper).toArray().map(j=>{const w=t.formGroups?.groups.find(v=>v.uid===j);if(w){const v={...w};return delete v.forms,{...v,formIds:ze.get(s.current[j]).toArray().map(Number)}}return null}).filter(Boolean),x=s.current?.unassigned,g=x?ze.get(x):null,b=g?g.toArray().map(Number):[],y=[...h.flatMap(j=>j.formIds),...b];return{siteId:t.formGroups?.siteId||i?.id,site:t.formGroups?.site||o(),groups:h,orderedFormIds:y}},[s,t,o,i?.id]);return{addGroup:r,updateGroupInfo:a,syncFormGroupsRefs:l}},Uv=(t={})=>{const n=X(),{getCurrentHandleWithFallback:s}=Fe(),o=t?.onSuccess;return t.onSuccess=(i,r,a,l)=>{o?.(i,r,a,l),n.invalidateQueries({queryKey:at.all(s())})},re({...t,mutationFn:async i=>{const{orderedFormIds:r,...a}=i;await N.post("/api/forms/groups",a),r&&r.length>0&&await N.post("/api/forms/sort",{orderedFormIds:r})}})},qv=(t,n)=>n.options.handle!==".handle",Qv=t=>{const n=(o,i)=>{const r=t.current[o];r&&ze.create(r,i)};Object.entries({unassigned:{group:{name:"shared",put:qv},animation:150,sort:!0},groupWrapper:{handle:".handle",filter:".group-remove",sort:!0,animation:150,onFilter:i=>{const r=Array.from(t.current[i.item.dataset.id].children);t.current.unassigned.append(...r),i.item.remove()}}}).forEach(([i,r])=>{n(i,r)})},Kv=(t,n,s)=>{t&&(ze.create(t,{animation:150,group:{name:`group-${n}`,put:(o,i)=>i.options.handle!==".handle"},sort:!0,filter:".form-item-remove",onFilter:o=>s.current.unassigned.appendChild(o.item)}),s.current[n]=t)},Vv=({closeModal:t})=>{const[n,s]=m.useState({}),[o,i]=m.useState(!1),[r,a]=m.useState(),{data:l}=Xu(),d=m.useRef({}),{addGroup:h,updateGroupInfo:x,syncFormGroupsRefs:g}=Hv(n,s,d);m.useEffect(()=>{l&&!o&&(s(l),i(!0))},[l,o]),m.useEffect(()=>{Qv(d)},[]);const b=Uv({onSuccess:()=>{t()},onError:j=>{a(j.errors)}}),y=b.isPending;return e.jsxs($e,{style:{maxWidth:"60%"},children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Form Group Manager")})}),e.jsxs(Ev,{children:[e.jsxs(ep,{ref:j=>{d.current.groupWrapper=j},$empty:u("Click the 'Add Group' button on the right to begin."),children:[r?.length&&e.jsx(Dv,{children:u("Something went wrong!")}),n.formGroups?.groups?.map(j=>e.jsxs(zv,{"data-id":j.uid,children:[e.jsx(Nv,{children:e.jsx(Le,{value:j.label,property:{type:Y.Label,handle:j.uid},updateValue:w=>x("label",w,j.uid)})}),e.jsx(tp,{$empty:u("Drag and drop any field here"),ref:w=>{Kv(w,j.uid,d)},children:j.forms?.map(w=>e.jsx(ol,{form:w},w.id))}),e.jsxs(Mv,{children:[e.jsx("button",{type:"button",className:"group-remove",children:e.jsx(rt,{})}),e.jsx("button",{type:"button",className:"handle",children:e.jsx(jr,{})})]})]},j.uid))]}),e.jsxs(Iv,{children:[e.jsx("button",{onClick:h,type:"button",className:"btn add icon dashed",children:u("Add Group")}),e.jsx(Rv,{children:e.jsxs(Av,{className:"unassigned",children:[e.jsx("h3",{children:u("Unassigned")}),e.jsx(np,{$empty:u("Drag and drop any form here. Unassigned form will display at the bottom of the list of Groups."),ref:j=>{d.current.unassigned=j},children:n?.forms?.filter(j=>j.dateArchived===null).map(j=>e.jsx(ol,{form:j},j.id))})]})})]})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:t,children:u("Close")}),e.jsx("button",{type:"button",className:"btn submit",children:e.jsx(Z,{loadingText:u("Saving..."),loading:y,onClick:()=>b.mutate(g()),spinner:!0,children:u("Save")})})]})]})},Gv=()=>{const{openModal:t}=it();return()=>{t(Vv)}},sp=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c-13.3 0-24 10.7-24 24V264c0 13.3 10.7 24 24 24s24-10.7 24-24V152c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})}),Yv=t=>e.jsx(R,{height:"1em",viewBox:"0 0 384 512",...t,children:e.jsx("path",{d:"M345 137l17-17L328 86.1l-17 17-119 119L73 103l-17-17L22.1 120l17 17 119 119L39 375l-17 17L56 425.9l17-17 119-119L311 409l17 17L361.9 392l-17-17-119-119L345 137z"})}),Jv=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-8V248c0-13.3-10.7-24-24-24H216c-13.3 0-24 10.7-24 24s10.7 24 24 24h24v64H216zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"})}),Zv=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M231.9 44.4C215.7 16.9 186.1 0 154.2 0H152C103.4 0 64 39.4 64 88c0 14.4 3.5 28 9.6 40H48c-26.5 0-48 21.5-48 48v64c0 20.9 13.4 38.7 32 45.3V288 448c0 35.3 28.7 64 64 64H416c35.3 0 64-28.7 64-64V288v-2.7c18.6-6.6 32-24.4 32-45.3V176c0-26.5-21.5-48-48-48H438.4c6.1-12 9.6-25.6 9.6-40c0-48.6-39.4-88-88-88h-2.2c-31.9 0-61.5 16.9-77.7 44.4L256 85.5l-24.1-41zM464 176v64H432 288V176h72H464zm-240 0v64H80 48V176H152h72zm0 112V464H96c-8.8 0-16-7.2-16-16V288H224zm64 176V288H432V448c0 8.8-7.2 16-16 16H288zm72-336H288h-1.3l34.8-59.2C329.1 55.9 342.9 48 357.8 48H360c22.1 0 40 17.9 40 40s-17.9 40-40 40zm-136 0H152c-22.1 0-40-17.9-40-40s17.9-40 40-40h2.2c14.9 0 28.8 7.9 36.3 20.8L225.3 128H224z"})}),il=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M248.4 84.3c1.6-2.7 4.5-4.3 7.6-4.3s6 1.6 7.6 4.3L461.9 410c1.4 2.3 2.1 4.9 2.1 7.5c0 8-6.5 14.5-14.5 14.5H62.5c-8 0-14.5-6.5-14.5-14.5c0-2.7 .7-5.3 2.1-7.5L248.4 84.3zm-41-25L9.1 385c-6 9.8-9.1 21-9.1 32.5C0 452 28 480 62.5 480h387c34.5 0 62.5-28 62.5-62.5c0-11.5-3.2-22.7-9.1-32.5L304.6 59.3C294.3 42.4 275.9 32 256 32s-38.3 10.4-48.6 27.3zM288 368a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-8-184c0-13.3-10.7-24-24-24s-24 10.7-24 24v96c0 13.3 10.7 24 24 24s24-10.7 24-24V184z"})}),op={all:["notices"]},Xv=()=>B({queryKey:op.all,queryFn:()=>N.get("/api/notices").then(t=>t.data),enabled:I.feed}),e9=()=>{const t=X();return re({mutationFn:n=>N.delete(`/api/notices/${n}`),onMutate:n=>{t.setQueryData(op.all,s=>({...s,notices:s.notices.filter(o=>o.id!==n)}))}})},t9=c.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;

  margin-bottom: ${f.lg};
`,rl=c.div`
  font-size: 22px;
`,al=c.p`
  flex: 1;

  margin: 0;
  padding: 1px 0 0;
`,n9=c.button`
  align-self: center;
`,s9=[{type:"new",accent:"#038052",bg:"transparent"},{type:"info",accent:"#007bff",bg:"transparent"},{type:"warning",accent:"#e87b00",bg:"transparent"},{type:"critical",accent:"#cf1324",bg:"#fbe4e4"},{type:"error",accent:"#cf1324",bg:"transparent"},{type:"log-list",accent:"#cf1324",bg:"transparent"}];let ip="";s9.forEach(({type:t,accent:n,bg:s})=>{ip+=`
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
  `});const o9=ne`
  ${ip}
`,ll=c.li`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;

  padding: ${f.sm} ${f.md};

  border: 1px solid #ccc;
  border-radius: ${k.lg};

  ${o9};

  &[data-type='error'] {
    background-color: #ffe3e4;
  }
`,i9={info:e.jsx(Jv,{}),warning:e.jsx(il,{}),critical:e.jsx(il,{}),error:e.jsx(sp,{}),new:e.jsx(Zv,{})},rp=()=>{const{data:t,isFetching:n}=Xv(),s=e9();return!I.feed||!t&&n||!t.notices.length&&!t.errors?null:e.jsxs(t9,{children:[t.notices.map(o=>e.jsxs(ll,{"data-type":o.type,children:[e.jsx(rl,{children:i9[o.type]}),e.jsx(al,{children:o.message}),e.jsx(n9,{onClick:()=>s.mutate(o.id),children:e.jsx(Yv,{})})]},o.id)),!!t.errors&&e.jsxs(ll,{"data-type":"log-list",children:[e.jsx(rl,{children:e.jsx(sp,{})}),e.jsx(al,{dangerouslySetInnerHTML:{__html:O.sanitize(u('There are currently <a href="{link}">{errors} logged errors</a> in the Freeform error log files.',{link:ve("settings/error-log"),errors:t.errors}))}})]})]})},r9=({data:t,closeModal:n})=>{const[s,o]=m.useState(!1),[i,r]=m.useState(""),[a,l]=m.useState(!1),d=X(),{getCurrentHandleWithFallback:h}=Fe();Mt({callback:b=>{if(b.key==="Enter"){g();return}}},[s]);const x=b=>{r(b.target.value)},g=async()=>{if(s){l(!0);try{await N.post("/api/forms/delete",{id:t?.form.id}),await d.invalidateQueries({queryKey:at.all(h())}),await d.invalidateQueries({queryKey:ge.all(h())}),r(""),o(!1),n()}finally{l(!1)}}};return m.useEffect(()=>{o(i.toUpperCase()==="DELETE")},[i]),e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:t?.form.name})}),e.jsxs(Zu,{children:[e.jsx("div",{children:u("Are you sure you want to permanently delete this form? This action cannot be undone.")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To delete this form, please type <strong>DELETE</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:i,autoComplete:"off",onChange:x,className:"text fullwidth"})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",className:"btn cancel",onClick:n,children:u("Cancel")}),e.jsx("button",{type:"button",className:T("btn submit",!s&&"disabled"),onClick:g,children:e.jsx(Z,{loadingText:u("Deleting..."),loading:a,spinner:!0,children:u("Delete")})})]})]})},Tr=t=>{const{openModal:n}=it();return()=>{n(r9,t)}},Er=()=>{const t=X(),{getCurrentHandleWithFallback:n}=Fe();return re({mutationFn:s=>N.post(`/api/forms/${s}/archive`,{site:n()}),onMutate:s=>s,onSuccess:()=>{t.invalidateQueries({queryKey:at.all(n())}),t.invalidateQueries({queryKey:ge.all(n())})}})},ap=()=>{const t=X(),{getCurrentHandleWithFallback:n}=Fe();return re({mutationFn:s=>N.post(`/api/forms/${s}/clone`),onMutate:s=>s,onSuccess:()=>{t.invalidateQueries({queryKey:at.all(n())}),t.invalidateQueries({queryKey:ge.all(n())})}})},a9=c.li`
  line-height: 1.4;
  list-style-type: disc;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.restored {
    opacity: 0;
  }
`,lp=c.span`
  color: ${p.blue600};
  font-weight: bold;
`,l9=c(lp)`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`,c9=c.span`
  color: #868f96;
  margin-left: 5px;
`,Cs=c.span`
  margin-left: 5px;
  color: ${p.gray200};

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
`,d9=({form:t})=>{const n=te(),{getCurrentHandleWithFallback:s}=Fe(),o=X(),{id:i,name:r,links:a,dateArchived:l}=t,d=Er(),h=d.isPending&&d.context===i,x=d.isSuccess&&d.context===i,{canDelete:g}=I.metadata.freeform,b=Tr({form:t}),y=()=>{o.invalidateQueries({queryKey:ge.single(Number(i))}),n(`${i}`)},j=a.filter(({type:$})=>$==="title").length,w=t.links.filter(({type:$})=>$==="linkList"),v=$=>T1(zs($),"yyyy-MM-dd");return e.jsxs(a9,{className:T(h&&"disabled",x&&"restored"),children:[j?e.jsx(l9,{onClick:y,children:r}):e.jsx(lp,{children:r}),l&&e.jsxs(c9,{children:["(",u("archived")," ",v(l),")"]}),w.length>0&&w.filter(({count:$})=>$).map(($,C)=>$.internal?e.jsx(Cs,{children:e.jsx(pe,{to:$.url,children:$.label})},C):e.jsx(Cs,{children:e.jsx("a",{href:$.url,children:$.label})},C)),e.jsx(Cs,{children:e.jsx("button",{type:"button",onClick:()=>{d.mutate(i)},children:u("Restore this Form")})}),g&&e.jsx(Cs,{children:e.jsx("button",{type:"button",onClick:async $=>{$.metaKey&&$.shiftKey?(await N.post("/api/forms/delete",{id:i}),o.invalidateQueries({queryKey:at.all(s())}),o.invalidateQueries({queryKey:ge.all(s())})):b()},children:u("Delete this Form and its Submissions")})})]})},u9=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.md};
`,p9=c.button`
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
`,h9=c.ul`
  margin-left: 25px;
`,cp=({data:t})=>{const[n,s]=m.useState(!1);return t?.length?e.jsxs(u9,{children:[e.jsx(p9,{onClick:()=>s(!n),children:u(n?"Hide archived forms":"Show archived forms")}),n&&e.jsx(h9,{children:t.map(o=>e.jsx(d9,{form:o},o.id))})]}):null},yi=()=>{const t=m.useRef(null),[n,s]=m.useState(!1);return m.useEffect(()=>{const o=()=>{const i=t.current;i&&s(i.scrollWidth>i.clientWidth)};return window.addEventListener("resize",o),o(),()=>window.removeEventListener("resize",o)},[]),[t,n]},dp=t=>e.jsxs(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:[e.jsx("path",{d:"m0 0h15v15h-15z",fill:"none"}),e.jsx("path",{d:"m2.583 5.039c-.101-.002-.174-.008-.24-.021-.488-.097-.869-.478-.966-.965-.022-.119-.022-.262-.022-.547 0-.286 0-.429.022-.548.097-.487.478-.868.966-.966.119-.023.263-.023.547-.023h9.22c.284 0 .428 0 .547.023.488.098.869.479.966.966.022.119.022.262.022.548 0 .285 0 .428-.022.547-.097.487-.478.868-.966.965-.066.013-.139.019-.24.021m-6.146 3.075h2.458m-6.146-3.073h9.834v5.041c0 1.031 0 1.548-.202 1.942-.176.348-.458.63-.805.807-.395.2-.911.2-1.944.2h-3.932c-1.033 0-1.549 0-1.944-.2-.347-.177-.629-.459-.805-.807-.202-.394-.202-.911-.202-1.942z",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]}),up=t=>e.jsx(R,{height:"15",viewBox:"0 0 15 15",width:"15",...t,children:e.jsxs("g",{fill:"none",children:[e.jsx("path",{d:"m0 0h15v15h-15z"}),e.jsx("path",{d:"m6.562 1.252c-.421.006-.675.03-.88.134-.234.12-.426.311-.546.547-.104.205-.128.458-.134.879m7.186-1.56c.421.006.675.03.88.134.234.12.426.311.546.547.104.205.129.458.134.879m0 5.626c-.005.421-.03.675-.134.88-.12.234-.312.426-.546.546-.205.104-.459.129-.88.134m1.562-4.998v1.25m-5-5h1.25m-6.75 12.5h4.75c.7 0 1.05 0 1.318-.136.234-.12.426-.312.546-.546.136-.268.136-.618.136-1.318v-4.75c0-.7 0-1.05-.136-1.318-.12-.234-.312-.426-.546-.546-.268-.136-.618-.136-1.318-.136h-4.75c-.7 0-1.05 0-1.317.136-.236.12-.427.312-.547.546-.136.268-.136.618-.136 1.318v4.75c0 .7 0 1.05.136 1.318.12.234.311.426.547.546.267.136.617.136 1.317.136z",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"1.25"})]})}),zr=c.div`
  display: flex;
  justify-content: space-between;
  padding: ${f.xl} ${f.xl} 0;
`,Nr=c.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: ${f.md};
  width: 100%;
`,Mr=c.div`
  flex: 1;
  min-width: 0;
  max-width: 70%;
`,Ir=c.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 30%;
  text-align: right;
  margin-top: 6px;
`,Ws=c.h2`
  cursor: default;
  margin: 0 0 ${f.xs} 0;
  color: #3d464e;
  font-size: 20px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: all 0.2s ease-out;
`,_s=c(Ws)`
  cursor: pointer;
`,ji=c.span`
  display: block;
  color: #868f96;
  font-size: 14px;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: ${f.sm};
  cursor: default;

  &:hover {
    color: #6f7a82;
  }
`,pp=c.div`
  position: absolute;
  right: ${f.sm};
  top: ${f.sm};
  z-index: 2;

  display: flex;
  justify-content: end;
  align-items: stretch;
  gap: ${f.sm};

  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.2s ease-out;
`,Lt=c.button`
  font-size: 14px;
  color: #868f96;

  > svg {
    fill: currentColor;
  }
`,ao=c.ul`
  margin: ${f.sm} 0 0;
  padding: 0;
`,lo=c.li`
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

    ${_s} {
      color: var(--link-color);
    }

    ${pp} {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,hp=c.div``,Rr=c.div`
  margin-top: -3px;

  background-color: ${({$color:t})=>t};
  opacity: 0.3;

  height: 5px;

  font-size: 0px;
  line-height: 0px;

  overflow: hidden;
`,x9=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,m9=()=>e.jsxs(Ir,{children:[e.jsx(L,{height:8,width:60}),e.jsx(L,{height:8,width:40})]}),Ao=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:x9(0,Math.random()>.9?8:4)}));return e.jsxs(lo,{children:[e.jsxs(zr,{children:[e.jsx(Nr,{children:e.jsxs(Mr,{children:[e.jsx(L,{height:15,width:"90%"}),e.jsx(L,{height:8,width:"60%"}),e.jsx(L,{height:8,width:"30%"})]})}),e.jsxs(ao,{children:[e.jsx("li",{children:e.jsx(L,{height:8,width:90})}),e.jsx("li",{children:e.jsx(L,{height:8,width:50})})]})]}),e.jsx(Xe,{width:"100%",height:40,children:e.jsxs(gt,{data:n,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(ft,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:"url(#colorGradient)",isAnimationActive:!1})]})}),e.jsx(Rr,{$color:t})]})},g9=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"})}),f9=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M248.4 84.3c1.6-2.7 4.5-4.3 7.6-4.3s6 1.6 7.6 4.3L461.9 410c1.4 2.3 2.1 4.9 2.1 7.5c0 8-6.5 14.5-14.5 14.5l-387 0c-8 0-14.5-6.5-14.5-14.5c0-2.7 .7-5.3 2.1-7.5L248.4 84.3zm-41-25L9.1 385c-6 9.8-9.1 21-9.1 32.5C0 452 28 480 62.5 480l387 0c34.5 0 62.5-28 62.5-62.5c0-11.5-3.2-22.7-9.1-32.5L304.6 59.3C294.3 42.4 275.9 32 256 32s-38.3 10.4-48.6 27.3zM288 368a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-8-184c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 96c0 13.3 10.7 24 24 24s24-10.7 24-24l0-96z"})}),b9=c.span`
  display: inline-block;
  white-space: nowrap;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  color: #424d59;
`,y9=c.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 3px;
  font-size: 11px;
  color: #424d59;
  margin-bottom: 7px;
`,j9=c.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({$align:t="left"})=>t==="right"?"flex-end":"flex-start"};
  text-align: ${({$align:t="left"})=>t};
`,v9=c.div`
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
    ${p.gray300} var(--pending),
    ${p.gray300} 100%
  );
`,ks=c.div`
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
`,vi=c.div`
  color: ${p.red600};
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  margin-top: ${({$withMargin:t})=>t?"15px":"0px"};
`,Pn={align:"left",width:"70%",showLastTest:!1,size:"lg"},xp=(t,n=Pn.size)=>{if(!t?.lastTest)return e.jsx(ks,{$status:"pending",$size:n,children:e.jsx(Qn,{})});const s={success:e.jsx(ks,{$status:"success",$size:n,children:e.jsx(g9,{})}),failed:e.jsx(ks,{$status:"failed",$size:n,children:e.jsx(f9,{})}),pending:e.jsx(ks,{$status:"pending",$size:n,children:e.jsx(Qn,{})})};return s[t.lastTest.status]||s.pending},Ar=({formMonitor:t,align:n=Pn.align,width:s=Pn.width,showLastTest:o=Pn.showLastTest,size:i=Pn.size})=>{if(!t?.enabled)return null;const r=!t||!t.percentage||t.total===0;if(t?.error)return e.jsx(vi,{$withMargin:!0,children:t.error?.message});const l=r?0:t.percentage?.success||0,d=r?0:t.percentage?.failed||0,h=r?100:t.percentage?.pending||0,x={"--success":`${l}%`,"--failed":`${l+d}%`,"--pending":`${l+d+h}%`};return e.jsxs(j9,{$align:n,style:r?{marginTop:"10px"}:void 0,children:[o&&t.lastTest&&e.jsxs(y9,{children:["Last Test ",xp(t,i)]}),e.jsx(v9,{$width:s,style:x}),e.jsx(b9,{children:r?u("Uptime: Pending"):`${u("Uptime")}: ${l}%`})]})},w9=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,sn={position:"top",animation:"fade",delay:[100,0]},Wn=({form:t,isDraggingInProgress:n,isExpressEdition:s})=>{const o=I.editions.is(le.Pro),i=Er(),r=ap(),a=te(),{getCurrentHandleWithFallback:l}=Fe(),d=X(),{canDelete:h}=I.metadata.freeform,[x,g]=yi(),[b,y]=yi(),j=Array.from({length:31},()=>({uv:w9(0,Math.random()>.9?50:20)})),{id:w,name:v,description:$,dateArchived:C,settings:E,formMonitor:F}=t,{color:z}=E.general,M=i.isPending&&i.context===w,S=i.isSuccess&&i.context===w,P=r.isPending&&r.context===w||M,ae=Tr({form:t}),ue=xe=>{xe.metaKey||xe.ctrlKey||xe.button===1?window.open(ve(`forms/${w}`),"_blank"):(d.invalidateQueries({queryKey:ge.single(Number(w))}),a(`${w}`))},wt=t.links.filter(({type:xe})=>xe==="title").length,tn=t.links.filter(({type:xe})=>xe==="linkList"),En=t.links.find(({type:xe})=>xe==="formMonitor"),{data:Pp,isLoading:Bp}=rd(t.id,{enabled:F?.enabled===!0});return e.jsxs(lo,{"data-id":t.id,className:T(P&&"disabled",S&&"archived",n&&"dragging"),children:[e.jsxs(pp,{children:[!s&&!o&&e.jsx(he,{title:u("Move this Form Card"),...sn,children:e.jsx(Lt,{className:"handle",children:e.jsx(jr,{})})}),!s&&e.jsx(he,{title:u("Duplicate this Form"),...sn,children:e.jsx(Lt,{onClick:()=>{r.mutate(w)},children:e.jsx(up,{})})}),!s&&!C&&e.jsx(he,{title:u("Archive this Form"),...sn,children:e.jsx(Lt,{onClick:()=>{i.mutate(w)},children:e.jsx(dp,{})})}),h&&e.jsx(he,{title:u("Delete this Form"),...sn,children:e.jsx(Lt,{onClick:async xe=>{xe.metaKey&&xe.shiftKey?(await N.post("/api/forms/delete",{id:w}),d.invalidateQueries({queryKey:at.all(l())}),d.invalidateQueries({queryKey:ge.all(l())})):ae()},children:e.jsx(rt,{})})})]}),e.jsx(zr,{children:e.jsxs(Nr,{children:[e.jsxs(Mr,{children:[g?e.jsx(he,{title:v,...sn,children:wt?e.jsx(_s,{ref:x,onClick:ue,onAuxClick:ue,children:v}):e.jsx(Ws,{ref:x,children:v})}):wt?e.jsx(_s,{ref:x,onClick:ue,onAuxClick:ue,children:v}):e.jsx(Ws,{ref:x,children:v}),!!$&&(y?e.jsx(he,{title:$,...sn,position:"bottom",distance:10,style:{display:"block"},children:e.jsx(ji,{ref:b,children:$})}):e.jsx(ji,{ref:b,children:$})),tn.length>0&&e.jsx(ao,{children:tn.map((xe,Qr)=>xe.internal?e.jsx(pe,{to:xe.url,children:xe.label},Qr):e.jsx("li",{children:e.jsx("a",{href:xe.url,children:xe.label})},Qr))})]}),e.jsx(Ir,{children:F?.enabled&&En&&e.jsx(pe,{to:En.url,children:Bp?e.jsx(m9,{}):e.jsx(Ar,{formMonitor:{...Pp,enabled:F?.enabled},align:"right",width:"100%",showLastTest:!0,size:"sm"})})})]})}),e.jsxs(hp,{children:[e.jsx(Xe,{width:"100%",height:40,children:e.jsxs(gt,{data:t.chartData||j,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${t.id}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:z,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:z,stopOpacity:.3})]})}),e.jsx(ft,{type:"monotone",dataKey:"uv",stroke:z,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:`url(#color${t.id})`,isAnimationActive:!1})]})}),e.jsx(Rr,{$color:z})]})]})},$9=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,cl=["Contact Us","Feedback","Survey","Registration","Application","Subscription"],dl=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:$9(0,Math.random()>.9?8:4)})),s=Math.round(Math.random()*10)+1,o=Math.round(s*(Math.random()*.8+.6)),i=Math.round(s*(Math.random()*.1)),r=cl[Math.floor(Math.random()*cl.length)],a={success:o,pending:0,percentage:{success:Math.round(o/s*100),pending:0,failed:Math.round(i/s*100)},failed:i,total:s};return e.jsxs(lo,{className:"blurred",children:[e.jsx(zr,{children:e.jsxs(Nr,{children:[e.jsxs(Mr,{children:[e.jsx(_s,{children:r}),e.jsxs(ao,{children:[e.jsx("li",{children:e.jsxs("a",{href:"#",children:["3 ",u("Submissions")]})}),e.jsx("li",{children:e.jsxs("a",{href:"#",children:["0 ",u("Spam")]})})]})]}),e.jsx(Ir,{children:e.jsx(pe,{to:"#",children:e.jsx(Ar,{formMonitor:{...a,enabled:!0},align:"right",width:"100%",showLastTest:!0,size:"sm"})})})]})}),e.jsxs(hp,{children:[e.jsx(Xe,{width:"100%",height:40,children:e.jsxs(gt,{data:n,margin:{top:10,bottom:3,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(ft,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,fill:"url(#colorGradient)",isAnimationActive:!1})]})}),e.jsx(Rr,{$color:t})]})]})},Do=[[{uv:0},{uv:2},{uv:0},{uv:6},{uv:0},{uv:0},{uv:1},{uv:0},{uv:0},{uv:4},{uv:0},{uv:3}],[{uv:9},{uv:6},{uv:3},{uv:4},{uv:0},{uv:6},{uv:1}],[{uv:0},{uv:25},{uv:0},{uv:32},{uv:0},{uv:0}]],C9=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};
`,k9=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};
`,Is=c.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${f.lg};
`,ul=c.div`
  hr {
    margin: 10px -25px;
  }
`,pl=c.h2`
  margin-bottom: 10px;
`,mp=c.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .edit-groups {
    justify-content: flex-end;
    margin-left: auto;
  }
`,S9=c.button`
  display: flex;
  align-items: center;
  gap: ${f.xs};

  &:hover {
    color: var(--link-color);

    svg {
      path:last-of-type {
        stroke: var(--link-color);
      }
    }
  }
`,gp=c.div`
  width: 100%;
  max-width: 100%;
`;c.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${f.lg};
`;const L9=c(Is)`
  position: relative;
  margin-top: ${f.xl};

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

  ${lo} {
    border-color: #fbfcfd;
    background: #fefeff;
  }

  ${Ws}, ${ao} a {
    color: #cfd1d2;
  }

  ${ji} {
    color: #e2e4e5;
  }
`,F9="#e0e0e0",Po=(t,n,s,o,i)=>({uid:"",type:"",name:t,handle:"",description:n,isNew:!0,chartData:s,links:[{count:o,label:u("{count} Submissions",{count:o}),handle:"submissions",type:"linkList",url:"",internal:!1},{count:i,label:u("{count} Spam",{count:i}),handle:"spam",type:"linkList",url:"",internal:!0}],counters:{submissions:o,spam:i},formMonitor:{enabled:!1},settings:{general:{namespaceType:"settings",namespace:"general",color:F9}},dateArchived:null}),T9=()=>{const t=Fr(),{canCreate:n}=I.metadata.freeform;return e.jsxs("div",{children:[n&&e.jsxs(e.Fragment,{children:[e.jsx("p",{children:u("You don't have any forms yet. Create your first form now...")}),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:t,children:u("Create a new Form")})]}),!n&&e.jsx("p",{children:u("You don't have any forms.")}),e.jsxs(L9,{children:[e.jsx(Wn,{form:Po("Contact Form","Main contact form.",Do[0],14,5)}),e.jsx(Wn,{form:Po("Customer Survey","Customer satisfaction survey.",Do[1],72,18)}),e.jsx(Wn,{form:Po("Newsletter","Newsletter signup form.",Do[2],138,7)})]})]})},E9=()=>{const{data:t,isFetching:n}=Xu(),s=Gv(),o=t?.forms.length>0,i=t?.formGroups?.groups.some(y=>y.forms.length>0),r=!n&&!o&&!i,a=I.editions.is(le.Express),l=I.editions.isAtLeast(le.Pro),d=m.useRef(null),h=m.useRef(null),[x,g]=m.useState(!1),b=m.useCallback(()=>{const y=h.current.toArray();N.post("/api/forms/sort",{orderedFormIds:y}),g(!1)},[]);return m.useEffect(()=>{document.title=u("Forms")},[]),m.useEffect(()=>{d.current&&(h.current=new ze(d.current,{animation:150,onEnd:b,handle:".handle",onStart:()=>{g(!0)}}))},[b]),e.jsx(gp,{children:e.jsxs("div",{id:"content",className:"content-pane",children:[e.jsx(rp,{}),e.jsxs(C9,{children:[r&&e.jsx(T9,{}),!r&&e.jsxs(k9,{children:[l&&t?.formGroups&&t.formGroups.groups.map((y,j)=>y.forms.length?e.jsxs(ul,{children:[j!==0&&e.jsx("hr",{}),e.jsx(pl,{children:y.label}),e.jsx(Is,{children:y.forms.map(w=>e.jsx(Wn,{isExpressEdition:a,form:w},w.id))})]},y.uid):null),!r&&o&&e.jsxs(ul,{children:[i&&e.jsx("hr",{}),i&&e.jsx(pl,{children:u("Other")}),e.jsxs(Is,{ref:d,className:T(x&&"dragging"),children:[t?.forms?.map(y=>e.jsx(Wn,{isDraggingInProgress:x,isExpressEdition:a,form:y},y.id)),a&&e.jsxs(e.Fragment,{children:[e.jsx(dl,{}),e.jsx(dl,{})]})]})]}),!t?.forms&&n&&e.jsxs(Is,{children:[e.jsx(Ao,{}),e.jsx(Ao,{}),e.jsx(Ao,{})]})]}),a&&e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u('Need more forms? <a href="{link}" target="_blank">Upgrade to Lite or Pro</a>.',{link:Craft.getCpUrl("plugin-store/freeform")}))}}),e.jsxs(mp,{children:[!a&&t?.archivedForms&&e.jsx(cp,{data:t.archivedForms}),!r&&l&&e.jsxs(S9,{className:"edit-groups",onClick:s,children:[e.jsx(mr,{}),u("Manage Form Groups")]})]})]})]})})},z9=c.div`
  display: flex;
  flex-direction: column;
  gap: ${f.lg};
`;c.header`
  display: grid;
  grid-template-areas: 'title sites button';
  grid-template-columns: min-content 1fr auto;
  justify-content: space-between;
  align-items: center;
  gap: ${f.md};
`;c.h1`
  grid-area: title;

  padding: ${f.sm} 0;
  margin: 0;

  font-size: 18px;
  font-weight: 700;
  line-height: 34px;
`;const N9=c.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`,Ss=({children:t,size:n})=>{const[s]=yi();return e.jsx(N9,{ref:s,style:{maxWidth:n},title:String(t),children:t})},M9=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,Hs=()=>e.jsx(e.Fragment,{children:e.jsx(L,{height:20,width:40,highlightColor:"#5372b64f"})}),Ls=()=>{const t="#dfdfdf",n=Array.from({length:10},()=>({value:M9(0,Math.random()>.9?8:4)}));return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx(L,{height:20,width:150})}),e.jsx("td",{children:e.jsx(L,{height:20,width:80})}),e.jsx("td",{children:e.jsx(L,{height:20,width:300})}),e.jsx("td",{children:e.jsx(Xe,{width:200,height:20,children:e.jsxs(gt,{data:n,margin:{top:0,bottom:0,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"colorGradient",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.3})]})}),e.jsx(ft,{type:"monotone",dataKey:"value",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:.7,fill:"url(#colorGradient)",isAnimationActive:!1})]})})}),e.jsx("td",{children:e.jsx(Hs,{})}),e.jsx("td",{children:e.jsx(Hs,{})}),e.jsx("td",{children:e.jsx(L,{height:20,width:61})})]})},Bo={position:"top",animation:"fade",delay:[100,0]},I9=({form:t,hasFormMonitor:n})=>{const s=I.editions.isAtLeast(le.Lite),o=Er(),i=ap(),r=X(),{getCurrentHandleWithFallback:a}=Fe(),l=Tr({form:t}),{canDelete:d}=I.metadata.freeform,{id:h,name:x,handle:g,description:b,settings:y,dateArchived:j,formMonitor:w}=t,v=y.general.color,$=t.links.some(({type:S})=>S==="title"),C=t.links.find(S=>S.handle==="submissions"),E=t.links.find(S=>S.handle==="spam"),F=t.links.find(({type:S})=>S==="formMonitor"),{data:z,isLoading:M}=rd(t.id,{enabled:w?.enabled===!0});return e.jsxs("tr",{children:[e.jsxs("td",{children:[$&&e.jsx(un,{to:`${h}`,children:e.jsx(Ss,{size:250,children:x})}),!$&&e.jsx(Ss,{size:250,children:x})]}),e.jsx("td",{children:e.jsx("code",{children:e.jsx(Ss,{size:150,children:g})})}),e.jsx("td",{children:e.jsx(Ss,{size:400,children:b})}),e.jsx("td",{children:e.jsx(Xe,{width:200,height:20,children:e.jsxs(gt,{data:t.chartData,margin:{top:0,bottom:0,left:0,right:0},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${t.id}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:v,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:v,stopOpacity:.3})]})}),e.jsx(ft,{type:"monotone",dataKey:"uv",stroke:v,strokeWidth:1,strokeOpacity:1,fillOpacity:.7,fill:`url(#color${t.id})`,isAnimationActive:!1})]})})}),n&&e.jsxs(e.Fragment,{children:[e.jsx("td",{children:w?.enabled&&F&&e.jsx(pe,{to:F.url,children:M?e.jsx(Hs,{}):z?.error?e.jsx(vi,{children:z.error.message}):z?e.jsx(Ar,{formMonitor:{...z,enabled:w?.enabled},align:"left",width:"100%",size:"sm"}):null})}),e.jsx("td",{children:w?.enabled&&F&&e.jsx(pe,{to:F.url,children:M?e.jsx(Hs,{}):z?.error?e.jsx(vi,{children:z.error.message}):z?xp({...z,enabled:w?.enabled},"lg"):null})})]}),e.jsx("td",{children:!!C&&e.jsx("a",{href:C.url,children:C.count})}),e.jsx("td",{children:!!E&&e.jsx("a",{href:E.url,children:E.count})}),e.jsx("td",{children:e.jsxs(cn,{children:[s&&e.jsx(he,{title:u("Duplicate this Form"),...Bo,children:e.jsx(Lt,{onClick:()=>i.mutate(h),children:e.jsx(up,{})})}),s&&!j&&e.jsx(he,{title:u("Archive this Form"),...Bo,children:e.jsx(Lt,{onClick:()=>o.mutate(h),children:e.jsx(dp,{})})}),d&&e.jsx(he,{title:u("Delete this Form"),...Bo,children:e.jsx(Lt,{onClick:async S=>{S.metaKey&&S.shiftKey?(await N.post("/api/forms/delete",{id:h}),r.invalidateQueries({queryKey:at.all(a())}),r.invalidateQueries({queryKey:ge.all(a())})):l()},children:e.jsx(rt,{})})})]})})]})},R9=c.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;

  @media (max-width: 1023px) {
    ${q};
  }
`,A9=c.table`
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
`,D9=({forms:t,isFetching:n})=>{const s=Fr(),{canCreate:o}=I.metadata.freeform,i=t?.some(r=>r.formMonitor?.enabled);return e.jsx(R9,{children:e.jsxs(A9,{className:"table data",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Name")}),e.jsx("th",{children:u("Handle")}),e.jsx("th",{children:u("Description")}),e.jsx("th",{children:u("Chart")}),i&&e.jsx("th",{children:u("Monitoring")}),i&&e.jsx("th",{children:u("Last Test")}),e.jsx("th",{children:u("Submissions")}),e.jsx("th",{children:u("Spam")}),e.jsx("th",{children:u("Manage")})]})}),e.jsxs("tbody",{children:[n&&t===void 0&&e.jsxs(e.Fragment,{children:[e.jsx(Ls,{}),e.jsx(Ls,{}),e.jsx(Ls,{}),e.jsx(Ls,{})]}),!n&&!t?.length&&o&&e.jsx("tr",{children:e.jsxs("td",{colSpan:i?9:7,children:[e.jsx("p",{children:u("You don't have any forms yet. Create your first form now...")}),e.jsx("button",{type:"button",className:"btn submit add icon",onClick:s,children:u("Create a new Form")})]})}),!n&&!t?.length&&!o&&e.jsx("tr",{children:e.jsx("td",{colSpan:i?9:7,children:e.jsx("p",{children:u("You don't have any forms yet.")})})}),t?.sort((r,a)=>r.name.localeCompare(a.name))?.map(r=>e.jsx(I9,{form:r,hasFormMonitor:i},r.id))]})]})})},P9=()=>{const{data:t,isFetching:n}=Qs(),s=I.editions.isAtLeast(le.Lite),o=t?.filter(({dateArchived:r})=>r===null),i=t?.filter(({dateArchived:r})=>r!==null);return m.useEffect(()=>{document.title=u("Forms")},[]),e.jsx(gp,{children:e.jsxs("div",{id:"content",className:"content-pane",children:[e.jsx(rp,{}),e.jsxs(z9,{children:[e.jsx(D9,{forms:o,isFetching:n}),s&&e.jsx(mp,{children:e.jsx(cp,{data:i})})]})]})})},B9=()=>{const t=X(),n=Fr(),[s,o]=Ju("forms-list-view",1),i=I.metadata.craft.is5,{canCreate:r}=I.metadata.freeform;return t.prefetchQuery({queryKey:qn.all,queryFn:Hc}),t.prefetchQuery({queryKey:qn.propertySections(),queryFn:Uc}),e.jsxs(e.Fragment,{children:[e.jsx(Q,{id:"form-list",label:"Forms",url:"/forms"}),e.jsxs(wv,{children:[e.jsx($v,{children:u("Forms")}),e.jsxs(kv,{className:"btngroup btngroup--exclusive",children:[e.jsx("button",{type:"button",className:T("btn",s===0&&"active"),"data-icon":"list","aria-label":"Display in a table",title:u("Display as list"),onClick:()=>o(0)}),e.jsx("button",{type:"button",className:T("btn",s===1&&"active"),"data-icon":T(i?"element-cards":"grid"),title:u("Display as cards"),onClick:()=>o(1)})]}),r&&e.jsx(Cv,{className:"btn submit add icon",onClick:n,children:u("Add new Form")})]}),s===0&&e.jsx(P9,{}),s===1&&e.jsx(E9,{})]})},hl=({children:t,...n})=>e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",...n,children:t})}),O9=["forms","express-forms","formie"],W9=()=>{const{pathname:t}=Wt(),{data:n,isFetching:s}=B({queryKey:["import-export","navigation"],queryFn:()=>N.get("/api/import-export/navigation").then(o=>o.data)});return s&&!n?e.jsx(hl,{children:e.jsx("nav",{})}):e.jsx(hl,{children:e.jsx("nav",{children:e.jsx("ul",{children:n.map((o,i)=>{if(o?.heading)return e.jsx("li",{className:"heading",children:e.jsx("span",{children:u(o.heading)})},i);const r=o.url.replace(/^freeform/,""),a=O9.some(d=>r.includes(d)),l=u(o.title);return e.jsxs("li",{children:[a&&e.jsx(pe,{to:r,className:T(r===t&&"sel"),children:l}),!a&&e.jsx("a",{href:ve(r),children:l})]},i)})})})})},_9=c.div`
  display: flex;
  margin-bottom: 50px;
`,xl=()=>{const{pathname:t}=Wt();ts("export/profiles"),Qs();let n;switch(t){case"/import/express-forms":n="Import from Express Forms";break;case"/import/formie/v3":n="Import from Formie (v3)";break;case"/import/forms":n="Import Freeform Data";break;case"/export/forms":n="Export Freeform Data";break}return e.jsxs("div",{children:[e.jsx(es,{children:u(n)}),e.jsxs(_9,{children:[e.jsx(W9,{}),e.jsx(mt,{})]})]})},Ue=({children:t,...n})=>e.jsx("div",{id:"content-container",children:e.jsx("div",{id:"content",className:"content-pane",...n,children:t})}),Pt=({children:t,label:n,instructions:s,...o})=>e.jsxs("div",{...o,className:T("field",o.className),children:[n&&e.jsx("div",{className:"heading",children:e.jsx("label",{htmlFor:"",children:n})}),s&&e.jsx("div",{className:"instructions",children:s}),e.jsx("div",{className:"input",children:t})]}),Dr=t=>{let n=!0;return Object.keys(t).forEach(s=>{const o=t[s];typeof o=="object"&&o!==null&&!Array.isArray(o)?Object.keys(o).forEach(i=>{const r=o[i];Array.isArray(r)&&r.length>0&&(n=!1)}):Array.isArray(o)?o.length>0&&(n=!1):typeof o=="boolean"&&o&&(n=!1)}),n},H9=(t,n)=>{let s=!0;return Object.keys(t).forEach(o=>{const i=t[o];typeof i=="object"&&i!==null&&!Array.isArray(i)?Object.keys(i).forEach(r=>{const a=i[r];Array.isArray(a)&&a.length!==n[o][r]?.length&&(s=!1)}):Array.isArray(i)?i.length!==n[o]?.length&&(s=!1):typeof i=="boolean"&&(i||(s=!1))}),s},fp=()=>({forms:[],favorites:[],formGroups:[],limitedUsers:[],formSubmissions:[],templates:{pdf:[],wrapper:[],notification:[],formatting:[],success:[]},integrations:[],settings:!1,password:""}),U9=t=>({forms:t.forms.map(n=>n.uid),formGroups:t?.formGroups?.map(n=>n.uid)||[],favorites:t?.favorites?.map(n=>n.uid)||[],limitedUsers:t?.limitedUsers?.map(n=>n.uid)||[],templates:{pdf:t.templates.pdf.map(n=>n.uid),wrapper:t.templates.wrapper.map(n=>n.uid),notification:t.templates.notification.map(n=>n.uid),formatting:t.templates.formatting.map(n=>n.fileName),success:t.templates.success.map(n=>n.fileName)},integrations:t.integrations.map(n=>n.uid),formSubmissions:t.formSubmissions.map(n=>n.form.uid),settings:!0}),q9=t=>t.replace(/<\/?[^>]+(>|$)/g,""),Pr=22,Q9=c.div`
  &.disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.3;

    transition: opacity 0.2s ease-out;
  }
`,K9=c.a`
  cursor: pointer;
  display: block;

  color: ${p.link} !important;
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }
`,V9=c.div`
  padding: 10px;

  background: #f4f7fd;
  border: 1px solid #e1e5ea;
  border-radius: 3px;
`,Bt=c.label`
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
`,bn=c.div`
  display: flex;
  justify-content: start;
  align-items: center;
`,Us=c.div`
  position: relative;
  flex-basis: ${({$width:t=1})=>t*Pr}px;

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
`,yn=c.div`
  display: flex;
  justify-content: center;
  align-items: center;

  flex: 0 0 ${Pr}px;
  height: 24px;
`,Se=c.i`
  flex: 0 0 ${Pr}px;
  font-size: 18px;

  text-align: center;

  width: 18px;
  height: 18px;

  svg {
    width: 100%;
    height: 100%;
  }
`,Br=()=>e.jsx(Se,{className:"fa-solid fa-folder"}),G9=()=>e.jsx(Se,{className:"fa-duotone fa-clipboard-list"}),Y9=()=>e.jsx(Se,{className:"fa-light fa-folder-bookmark"}),J9=()=>e.jsx(Se,{className:"fa-light fa-file-heart"}),Z9=()=>e.jsx(Se,{className:"fa-duotone fa-inbox-in"}),X9=()=>e.jsx(Se,{className:"fa-light fa-envelope"}),ew=()=>e.jsx(Se,{className:"fa-light fa-file-pdf"}),tw=()=>e.jsx(Se,{className:"fa-light fa-file-half-dashed"}),nw=()=>e.jsx(Se,{className:"fa-light fa-file-code"}),sw=()=>e.jsx(Se,{className:"fa-light fa-file-check"}),ow=()=>e.jsx(Se,{className:"fa-duotone fa-gear"}),Ot=c.li`
  &.selectable:not(.selected) {
    ${Bt}, ${Se}, ${Us} {
      opacity: 0.4;
      transition: opacity 0.2s ease-out;
    }
  }
`,Ve=t=>{const{label:n,icon:s,itemIcon:o,labelExtras:i}=t,{items:r,selection:a,onUpdate:l}=t,{labelKey:d,selectionKey:h,nested:x}=t,g=t.id||g1(n);return!Array.isArray(r)||!r.length?null:e.jsxs(Ot,{children:[e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(ot,{id:`${g}-all`,checked:a.length===r.length,onChange:()=>a.length===r.length?l([]):l(r.map(b=>b[h]))})}),x&&e.jsx(Us,{$dash:!0}),e.jsx(Br,{}),e.jsx(Bt,{htmlFor:`${g}-all`,children:n})]}),e.jsx("ul",{children:r.map(b=>e.jsx(Ot,{className:T("selectable",a.includes(b[h])&&"selected"),children:e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(ot,{id:`${g}-${b[h]}`,checked:a.includes(b[h]),onChange:()=>l(a.includes(b[h])?a.filter(y=>y!==b[h]):[...a,b[h]])})}),e.jsx(Us,{$dash:!0,$width:x?2:void 0}),s,o?.(b),e.jsxs(Bt,{htmlFor:`${g}-${b[h]}`,children:[q9(b[d]),i?.(b)]})]})},b[h]))})]})},iw=({value:t,onUpdate:n})=>e.jsx(Ot,{children:e.jsx("ul",{children:e.jsx(Ot,{className:T("selectable",t&&"selected"),children:e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(ot,{id:"export-settings",checked:t,onChange:()=>n(!t)})}),e.jsx(ow,{}),e.jsx(Bt,{htmlFor:"export-settings",children:u("Settings")})]})})})}),rw=({submissions:t,options:n,onUpdate:s})=>!Array.isArray(t)||!t.length?null:e.jsxs(Ot,{children:[e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(ot,{id:"submissions-all",checked:n.length===t.length,onChange:()=>n.length===t.length?s([]):s(t.map(o=>o.form.uid))})}),e.jsx(Br,{}),e.jsx(Bt,{htmlFor:"submissions-all",children:u("Submissions")})]}),e.jsx("ul",{children:t.map(o=>e.jsx(Ot,{className:T("selectable",n.includes(o.form.uid)&&"selected"),children:e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(ot,{id:`submissions-${o.form.uid}`,checked:n.includes(o.form.uid),onChange:()=>s(n.includes(o.form.uid)?n.filter(i=>i!==o.form.uid):[...n,o.form.uid])})}),e.jsx(Us,{$dash:!0}),e.jsx(Z9,{}),e.jsxs(Bt,{$light:!0,htmlFor:`submissions-${o.form.uid}`,children:[o.form.name," (",o.count,")"]})]})},o.form.uid))})]}),ml=(t,n)=>n.pdf.length===t.pdf.length&&n.wrapper.length===t.wrapper.length&&n.notification.length===t.notification.length&&n.formatting.length===t.formatting.length&&n.success.length===t.success.length,aw=({templates:t,options:n,onUpdate:s})=>!t.pdf.length&&!t.wrapper.length&&!t.notification.length&&!t.formatting.length&&!t.success.length?null:e.jsxs(Ot,{children:[e.jsxs(bn,{children:[e.jsx(yn,{children:e.jsx(ot,{id:"templates-all",checked:ml(t,n),onChange:()=>ml(t,n)?s({pdf:[],wrapper:[],notification:[],formatting:[],success:[]}):s({pdf:t.pdf.map(o=>o.uid),wrapper:t.wrapper.map(o=>o.uid),notification:t.notification.map(o=>o.uid),formatting:t.formatting.map(o=>o.fileName),success:t.success.map(o=>o.fileName)})})}),e.jsx(Br,{}),e.jsx(Bt,{htmlFor:"templates-all",children:u("Templates")})]}),e.jsxs("ul",{children:[e.jsx(Ve,{nested:!0,label:u("PDF"),labelKey:"name",icon:e.jsx(ew,{}),items:t.pdf,selection:n.pdf,selectionKey:"uid",onUpdate:o=>s({...n,pdf:o})}),e.jsx(Ve,{nested:!0,label:u("Wrapper"),labelKey:"name",icon:e.jsx(tw,{}),items:t.wrapper,selection:n.wrapper,selectionKey:"uid",onUpdate:o=>s({...n,wrapper:o})}),e.jsx(Ve,{nested:!0,label:u("Notification"),labelKey:"name",icon:e.jsx(X9,{}),items:t.notification,selection:n.notification,selectionKey:"uid",onUpdate:o=>s({...n,notification:o})}),e.jsx(Ve,{nested:!0,label:u("Formatting"),labelKey:"name",icon:e.jsx(nw,{}),items:t.formatting,selection:n.formatting,selectionKey:"fileName",onUpdate:o=>s({...n,formatting:o})}),e.jsx(Ve,{nested:!0,label:u("Success"),labelKey:"name",icon:e.jsx(sw,{}),items:t.success,selection:n.success,selectionKey:"fileName",onUpdate:o=>s({...n,success:o})})]})]}),co=({data:t,options:n,disabled:s,onUpdate:o})=>{const i=H9(n,t),r=fp(),a=U9(t);return e.jsx(Q9,{className:T(s&&"disabled"),children:e.jsxs(V9,{children:[e.jsx(K9,{onClick:()=>{o(i?r:a)},children:u(i?"Deselect All":"Select All")}),e.jsxs("ul",{children:[e.jsx(Ve,{label:u("Forms"),icon:e.jsx(G9,{}),labelKey:"name",selectionKey:"uid",items:t.forms,selection:n.forms,onUpdate:l=>o({...n,forms:l}),labelExtras:l=>l.pages.length>1&&e.jsxs("small",{children:["(",u("{count} pages",{count:l.pages.length}),")"]})}),e.jsx(Ve,{label:u("Form Groups"),icon:e.jsx(Y9,{}),labelKey:"label",selectionKey:"uid",items:t.formGroups,selection:n.formGroups,onUpdate:l=>o({...n,formGroups:l})}),e.jsx(Ve,{label:u("Favorite Fields"),icon:e.jsx(J9,{}),labelKey:"label",selectionKey:"uid",items:t.favorites,selection:n.favorites,onUpdate:l=>o({...n,favorites:l})}),e.jsx(aw,{templates:t.templates,options:n.templates,onUpdate:l=>o({...n,templates:l}),formNames:Xm(t.forms,"uid","name")}),e.jsx(Ve,{label:u("Integrations"),labelKey:"name",selectionKey:"uid",items:t.integrations,selection:n.integrations,onUpdate:l=>o({...n,integrations:l}),itemIcon:l=>l.icon?e.jsx(Se,{dangerouslySetInnerHTML:{__html:O.sanitize(l.icon)}}):e.jsx(Se,{className:"fa-duotone fa-gear"})}),e.jsx(rw,{submissions:t.formSubmissions,options:n.formSubmissions,onUpdate:l=>o({...n,formSubmissions:l})}),e.jsx(Ve,{label:u("Limited Users"),icon:e.jsx(Se,{className:"fa-regular fa-user-shield"}),labelKey:"name",selectionKey:"uid",items:t.limitedUsers,selection:n.limitedUsers,onUpdate:l=>o({...n,limitedUsers:l})}),t.settings&&e.jsx(iw,{value:n.settings,onUpdate:l=>o({...n,settings:l})})]})]})})},lw=t=>G({opacity:t?1:0,scaleY:t?1:0,height:t?100:0,config:{tension:400}}),cw=t=>G({opacity:t?1:0,scaleY:t?1:0,height:t?40:0,config:{tension:400}}),dw=c(W.div)`
  transform-origin: center top;
`,uw=c(W.div)`
  transform-origin: left center;
`,pw=c.div`
  display: flex;
  align-items: center;
  justify-content: start;
  gap: ${f.sm};

  width: 100%;
  padding: ${f.sm} ${f.md};

  border: 1px solid #1fa07a;
  border-radius: 5px;

  color: #1fa07a;
  font-size: 16px;
  font-weight: bold;

  i {
    font-size: 18px;
  }
`,hw=c.div`
  margin-top: ${f.lg};
  label {
    font-size: 14px;
  }

  &.primary {
    label {
      font-weight: bold;
    }
  }
`,Oo="rgba(255,255,255,.15)",xw=Fi`
  from { background-position: 30px 0; }
  to { background-position: 0 0; }
`,mw=c.div`
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
      ${Oo} 25%,
      transparent 25%,
      transparent 50%,
      ${Oo} 50%,
      ${Oo} 75%,
      transparent 75%,
      transparent
    );

    transition: width 0.3s ease;
  }

  &.active {
    &:before {
      animation: ${xw} 2s linear infinite;
    }
  }
`,gw={primary:"#e12d39",secondary:"#B0BEC5"},gl=({show:t,active:n,variant:s="primary",value:o,max:i,width:r,children:a})=>t?e.jsxs(hw,{className:T(s),children:[a&&e.jsx("label",{children:a}),e.jsx(mw,{style:{width:r},$color:gw[s],$value:o,$max:i,className:T(n&&"active")})]}):null,uo=({label:t,finishLabel:n,event:s})=>{const{progress:{displayProgress:o,showDone:i,progress:r,total:a,info:l,errors:d}}=s,h=lw(o),x=cw(i);return e.jsxs("div",{children:[e.jsxs(dw,{style:h,children:[e.jsx(gl,{width:"60%",show:!0,value:r[0],max:a[0],active:!0,children:t}),e.jsx(gl,{width:"60%",show:!0,variant:"secondary",value:r[1],max:a[1],active:!0,children:l})]}),d?.length>0&&e.jsx("ul",{className:"errors",children:d.map((g,b)=>e.jsx("li",{children:g},b))}),!d?.length&&e.jsx(uw,{style:x,children:e.jsxs(pw,{children:[e.jsx("i",{className:"fa-sharp fa-solid fa-check"}),e.jsx("span",{children:n})]})})]})},po=()=>{const t=m.useRef(null),n=m.useRef([]),[s,o]=m.useState(),[i,r]=m.useState(!1),[a,l]=m.useState(!1),[d,h]=m.useState(!1),[x,g]=m.useState([0,0]),[b,y]=m.useState([0,0]),[j,w]=m.useState(),[v,$]=m.useState(),C=m.useCallback(M=>{o(M)},[]),E=m.useCallback(()=>{o(void 0),$(void 0),g([0,0]),y([0,0]),r(!0),w(void 0)},[]),F=m.useCallback((M,S)=>{n.current=[...n.current.filter(([D])=>D!==M),[M,S]]},[]),z=m.useCallback(M=>{M.onopen=()=>{l(!0)},M.onerror=()=>{console.error("An error occurred during import"),M.close(),r(!1),l(!1)},M.addEventListener("progress",S=>{const D=parseInt(S.data,10);g(P=>[P[0]+D,P[1]+D])}),M.addEventListener("total",S=>{y([parseInt(S.data,10),0]),$([])}),M.addEventListener("info",S=>{w(S.data)}),M.addEventListener("err",S=>{const D=S.data;$(P=>P===void 0?[D]:[...P,D])}),M.addEventListener("reset",S=>{y(D=>[D[0],parseInt(S.data,10)]),g(D=>[D[0],0])}),M.addEventListener("exit",()=>{M.close(),l(!1),r(!1),h(!0),setTimeout(()=>{h(!1)},5e3)}),n.current.forEach(([S,D])=>{M.addEventListener(S,D)})},[]);return m.useEffect(()=>{t.current&&t.current.close(),s&&(t.current=new EventSource(s),z(t.current))},[s,z]),{progress:{active:i,displayProgress:a,showDone:d,progress:x,total:b,info:j,errors:v},triggerProgress:C,clearProgress:E,attachListener:F}},fw=(t,n)=>{const s=window.URL.createObjectURL(new Blob([t])),o=document.createElement("a");o.href=s,o.setAttribute("download",n),document.body.appendChild(o),o.click(),o.parentNode.removeChild(o)},bw={data:["export","freeform","data"]},yw=()=>N.get("/export/forms/data").then(t=>t.data),jw=()=>B({queryKey:bw.data,queryFn:yw}),vw=t=>re({mutationFn:n=>N.post("/export/forms/init",n),...t}),ww=()=>{const t=po(),{attachListener:n,triggerProgress:s,clearProgress:o,progress:{active:i}}=t,{data:r,isFetching:a}=jw(),{mutate:l,isPending:d}=vw({onSuccess:j=>{const w=j.data.token;s(ve(`/api/export?server-token=${w}`))}}),[h]=m.useState(!1),[x,g]=m.useState(fp());m.useEffect(()=>{n("file-token",async j=>{const w=j.data,v=ve(`/api/export/download?server-token=${w}`),$=await N.get(v,{responseType:"blob"}),E=`freeform-export-${new Date().toISOString().replace(/[-:]/g,"").replace("T","-").slice(0,-5)}.zip`;fw($.data,E)})},[n]);const b=()=>{o(),l(x)},y=a||h||i||d;return a?e.jsx(Ue,{children:u("Loading...")}):e.jsxs(Ue,{children:[e.jsx(Q,{id:"export",label:"Export",url:"export/forms"}),e.jsx(Q,{id:"export-forms",label:"Freeform Data",url:"export/forms"}),r&&e.jsx(Pt,{label:u("Select Data to Export"),instructions:u("Choose which Freeform data to include in the export. If you export submissions without the corresponding form, the submissions will not be included."),children:e.jsx(co,{disabled:!1,data:r,options:x,onUpdate:j=>g(j)})}),e.jsx(It,{value:x.password||"",updateValue:j=>g({...x,password:j}),property:{handle:"password",label:"Password-protect the Export File (optional)",instructions:"Enter a password if you want to protect your zip file with a password.",type:Y.String,placeholder:"Enter a password"}}),e.jsx("div",{className:"field",children:e.jsx("button",{type:"button",disabled:y,onClick:b,className:T("btn","submit",y&&"disabled",Dr(x)&&"disabled"),children:e.jsx(Z,{loadingText:u("Exporting..."),loading:y,spinner:!0,children:u("Begin Export")})})}),e.jsx(uo,{label:u("Export Progress"),finishLabel:u("Export completed successfully!"),event:t})]})},Or=({data:t,strategy:n,disabled:s,onUpdate:o})=>e.jsxs("div",{children:[e.jsx(Pt,{label:u("Existing Form Behavior"),instructions:u("Choose the behavior Freeform should use if this site contains any forms that match the data in this import."),className:T(s&&"disabled",!t.forms.length&&"hidden"),children:e.jsx("div",{className:"select",children:e.jsxs("select",{value:n.forms,onChange:i=>o({...n,forms:i.target.value}),children:[e.jsx("option",{value:"skip",children:u("Skip")}),e.jsx("option",{value:"replace",children:u("Replace")})]})})}),e.jsx(Pt,{label:u("Existing Template Behavior"),instructions:u("Choose the behavior Freeform should use if this site contains any email notification, formatting or success templates that match the data in this import."),className:T(s&&"disabled",!t.templates.notification.length&&"hidden"),children:e.jsx("div",{className:"select",children:e.jsxs("select",{value:n.templates,onChange:i=>o({...n,templates:i.target.value}),children:[e.jsx("option",{value:"skip",children:u("Skip")}),e.jsx("option",{value:"replace",children:u("Replace")})]})})})]}),Wr=()=>({forms:[],favorites:[],formGroups:[],limitedUsers:[],formSubmissions:[],templates:{pdf:[],wrapper:[],notification:[],formatting:[],success:[]},integrations:[],strategy:{forms:"skip",templates:"skip"},settings:!1}),$w={data:["expressForms","data"]},Cw=()=>N.get("/import/express-forms/data").then(t=>t.data),kw=()=>B({queryKey:$w.data,queryFn:Cw}),Sw=()=>{const[t,n]=m.useState(Wr()),s=po(),o=s.progress.active,{data:i,isFetching:r}=kw(),a=async()=>{s.clearProgress();const{data:l}=await N.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\ExpressFormsExporter",options:t}),d=ve(`/api/import?server-token=${l.token}`);s.triggerProgress(d)};return r?e.jsx(Ue,{children:u("Loading...")}):!i.forms.length&&!i.templates.pdf.length&&!i.templates.notification.length&&!i.templates.formatting.length&&!i.templates.success.length&&!i.formSubmissions.length?e.jsx(Ue,{children:u("No data found")}):e.jsxs(Ue,{children:[e.jsx(Q,{id:"import",label:"Import",url:"import/express-forms"}),e.jsx(Q,{id:"import-express",label:"Express Forms",url:"import/express-forms"}),i&&e.jsx(Pt,{label:u("Select Data"),children:e.jsx(co,{disabled:o,data:i,options:t,onUpdate:l=>n({...t,...l})})}),e.jsx(Or,{data:i,strategy:t.strategy,disabled:o,onUpdate:l=>n(d=>({...d,strategy:l}))}),e.jsx("button",{type:"button",disabled:o,onClick:a,className:T("field btn","submit",o&&"disabled",Dr(t)&&"disabled"),children:e.jsx(Z,{loadingText:u("Processing"),loading:o,spinner:!0,children:u("Begin Import")})}),e.jsx(uo,{label:u("Import"),finishLabel:u("Import completed successfully!"),event:s})]})},Lw=()=>B({queryKey:["formie","import-data"],queryFn:async()=>{const{data:t}=await N.get("/import/formie/v3/data");return t}}),Fw=()=>{const[t,n]=m.useState(Wr()),s=po(),o=s.progress.active,{data:i,isFetching:r}=Lw(),a=async()=>{s.clearProgress();const{data:l}=await N.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FormieV3Exporter",options:t}),d=ve(`/api/import?server-token=${l.token}`);s.triggerProgress(d)};return r?e.jsx(Ue,{children:u("Loading...")}):i?!i.forms.length&&!i.templates.pdf.length&&!i.templates.notification.length&&!i.templates.formatting.length&&!i.templates.success.length&&!i.formSubmissions.length?e.jsx(Ue,{children:u("No data found")}):e.jsxs(Ue,{children:[e.jsx(Q,{id:"import",label:"Import",url:"import/formie3"}),e.jsx(Q,{id:"import-formie3",label:"Formie (v3)",url:"import/formie3"}),i&&e.jsx(Pt,{label:u("Select Data"),children:e.jsx(co,{disabled:o,data:i,options:t,onUpdate:l=>n({...t,...l})})}),e.jsx(Or,{data:i,strategy:t.strategy,disabled:o,onUpdate:l=>n(d=>({...d,strategy:l}))}),e.jsx("button",{type:"button",disabled:o,onClick:a,className:T("field btn","submit",o&&"disabled",Dr(t)&&"disabled"),children:e.jsx(Z,{loadingText:u("Processing"),loading:o,spinner:!0,children:u("Begin Import")})}),e.jsx(uo,{label:u("Import"),finishLabel:u("Import completed successfully!"),event:s})]}):e.jsx(Ue,{children:u("No data found")})},Tw=c.div`
  //
`,Ew=c.input`
  cursor: pointer;

  width: 100%;
  padding: 0;
  margin: 5px 0 3px;

  border: 1px solid ${p.inputBorder};
  border-radius: ${k.lg};

  color: rgb(156 163 175);
  background: rgb(55 65 81 / 5%);

  appearance: none;

  &::file-selector-button {
    cursor: pointer;

    padding: 5px 20px;

    border: none;
    border-right: 1px solid ${p.inputBorder};
    border-radius: ${k.lg};
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    color: ${p.gray700};
    font-weight: bold;
    background: ${p.gray100};

    &:hover {
      text-decoration: underline;
    }
  }
`;c.ul`
  //
`;const zw=()=>{const[t,n]=m.useState(),[s,o]=m.useState(),[i,r]=m.useState(),a=m.useRef(void 0),[l,d]=m.useState(Wr()),h=po(),x=async b=>{r(void 0),n(void 0);const y=b.target.files?.[0];if(!y)return;const j=new FormData;j.append("file",y),a.current&&j.append("password",a.current);try{const{data:w}=await N.post("/api/import/file",j,{headers:{"Content-Type":"multipart/form-data"}});o(w.options),n(w.token)}catch(w){if(r(w?.errors?.import?.file),w.status===403){a.current=void 0;const v=prompt(u("Enter password"));if(!v)return;a.current=v,x(b)}}},g=async()=>{if(!t)return;h.clearProgress();const{data:b}=await N.post("/api/import/prepare",{exporter:"\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FileExportReader",options:{...l,fileToken:t}}),y=ve(`/api/import?server-token=${b.token}`);h.triggerProgress(y)};return e.jsxs(Ue,{children:[e.jsx(Q,{id:"import",label:"Import",url:"import/forms"}),e.jsx(Q,{id:"import-forms",label:"Freeform Data",url:"import/forms"}),e.jsxs(Tw,{children:[e.jsx(Cn,{children:u("Upload a Freeform Export zip file")}),e.jsx(Ew,{type:"file",onChange:x,accept:".zip"}),e.jsx(Kc,{children:u("Accepts `.zip` files. Only upload files that you trust.")}),e.jsx(Ks,{errors:i})]}),s&&e.jsxs(e.Fragment,{children:[e.jsx(Pt,{label:u("Select Data"),instructions:u("Please select the data you want to import."),children:e.jsx(co,{disabled:!1,data:s,options:l,onUpdate:b=>d({...l,...b})})}),e.jsx(Or,{data:s,strategy:l.strategy,disabled:!1,onUpdate:b=>d(y=>({...y,strategy:b}))}),e.jsx(Pt,{children:e.jsx("button",{className:"btn submit",type:"button",onClick:g,children:e.jsx(Z,{loadingText:u("Processing..."),loading:!1,spinner:!0,children:u("Begin Import")})})}),e.jsx(uo,{label:u("Import"),finishLabel:u("Import completed successfully!"),event:h})]})]})};c.div`
  display: flex;
  margin-bottom: 50px;
`;const Nw=c.div`
  flex: 1;
  background-color: ${p.white};
  border-radius: 0 ${k.lg} ${k.lg} 0;
`,Mw=()=>{const t=m.useRef(null);return m.useEffect(()=>{const n=s=>{if(s.isComposing||s.altKey||s.ctrlKey||s.metaKey)return;const o=s.target;if(!(o&&(o.tagName==="INPUT"||o.tagName==="TEXTAREA"||o.isContentEditable))&&s.key==="/"){s.preventDefault();const i=t.current;i?.focus(),i?.select?.()}};return window.addEventListener("keydown",n),()=>{window.removeEventListener("keydown",n)}},[]),t},Iw=t=>e.jsx(R,{viewBox:"0 0 512 512",...t,children:e.jsx("path",{fill:"currentColor",d:"M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"})}),Rw=c.div`
  position: relative;
  z-index: 1;
`,Aw=c.div`
  position: relative;

  display: flex;
`,Dw=c.input`
  position: relative;

  padding: 6px 38px 6px 30px !important;

  border-radius: 5px;

  &::placeholder {
    font-style: italic;
    color: ${p.gray200};
  }
`,Pw=c.div`
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 3px 6px;

  //background-color: ${p.gray100};
  border: 1px solid ${p.gray200};
  border-radius: 5px;

  color: ${p.gray300};
  font-size: 12px;
  line-height: 16px;
`,fl="14px",Bw=ne`
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
    width: ${fl};
    height: ${fl};
  }
`,Ow=c.div`
  left: 1px;

  ${Bw}

  color: ${p.gray400};
`,Ww=({placeholder:t,query:n,setQuery:s})=>{const o=Mw();return e.jsx(Rw,{children:e.jsxs(Aw,{children:[e.jsx(Ow,{children:e.jsx(Iw,{})}),e.jsx(Pw,{children:"/"}),e.jsx(Dw,{ref:o,type:"text",placeholder:u(t||"Search"),className:"fullwidth text",value:n,onChange:i=>{s?.(i.target.value)}})]})})},_w="integrations-favorites",bp=()=>{const[t,n]=Ju(_w,[]),s=m.useCallback(i=>{const r=yl(i);n(a=>{const l=bl(a);return l.has(r)?l.delete(r):l.add(r),Array.from(l)})},[n]),o=m.useCallback(i=>{const r=yl(i);return bl(t).has(r)},[t]);return{toggleFavorite:s,hasFavorite:o}},bl=t=>new Set(t.map(n=>n.trim()).filter(Boolean)),yl=({type:t,shortName:n})=>`${t}:${n}`,jl=c.nav`
  display: flex;
  flex-direction: column;
  gap: 0;

  flex-basis: 250px;
  flex-shrink: 0;
  width: 300px;
  padding: 0;
  box-sizing: border-box;

  border-radius: ${k.lg} 0 0 ${k.lg};
  background: ${p.gray050};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
`,Hw=c.div`
  padding: 22px ${f.md};
  border-bottom: 1px solid ${p.hairline};
`,Uw=c.ul`
  list-style: none;
  padding: ${f.lg} ${f.sm} 0;
  margin: 0;

  overflow-y: auto;
  ${q};
`,vl=c.li`
  margin: 0 0 ${f.xl};
`,wl=c.h3`
  font-weight: bold;
  padding: 0 ${f.lg} 0;
  margin: 0 0 ${f.sm};
`,$l=c.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  list-style: none;
  padding: 0 8px;
  margin: 0;
`,Rs=c.span`
  display: block;

  width: 12px;
  height: 12px;

  border-radius: 50%;
  border: 2px solid ${p.gray300};

  color: ${p.gray300};
  font-size: 10px;
  font-weight: bold;
  line-height: 8px;
  text-align: center;

  &.active {
    border-color: transparent;
    background-color: ${p.teal500};
    color: ${p.white};
  }

  &.unsupported {
    border-style: dashed;
    border-width: 2px;
    border-color: ${p.gray200};
    color: ${p.gray300};
  }
`,qw=c.li`
  > a {
    display: flex;
    gap: 5px;
    align-items: center;

    padding: 3px 10px;
    margin: 0;

    color: ${p.gray700};
    text-decoration: none;
    border-radius: 4px;

    &.unsupported {
      opacity: 0.5;
    }

    &:hover,
    &.active {
      cursor: pointer;
      color: ${p.white};

      svg,
      i {
        path:not([fill='none']) {
          fill: ${p.gray100} !important;
          color: ${p.gray100};

          &.inverted {
            fill: ${p.gray700} !important;
            color: ${p.gray700};
          }
        }
      }
    }

    &:hover {
      background: ${p.gray300};

      ${Rs} {
        &:not(.active) {
          border-color: ${p.gray500};
        }

        &.active {
          background-color: ${p.teal600};
        }
      }
    }

    &.active {
      background: ${p.gray500};

      &:hover {
        ${Rs} {
          &:not(.active) {
            border-color: ${p.gray100};
          }

          &.active {
            background-color: ${p.teal300};
          }
        }
      }

      ${Rs} {
        &.active {
          background-color: ${p.teal500};
          color: ${p.gray700};
        }
      }
    }
  }
`,Qw=c.span``,Cl=c.span`
  svg,
  i {
    width: 16px;
    height: 16px;
    font-size: 16px;
    line-height: 16px;

    vertical-align: middle;
  }
`,Kw=c.span`
  font-size: 10px;
  color: ${p.gray300};
  margin-left: auto;
`,kl=({entry:t})=>{const n=I.editions.edition,{pathname:s}=Wt(),o=t.type,i=t.type.name,r=t.instances.length>0,a=t.type.editions.length>0&&!t.type.editions.includes(n),l=t.instances.length,d=l>1?l:"";let h=`${o.type}/${o.shortName}`;const x=s.includes(h);return l>0&&(h+=`/${t.instances[0].id}`),e.jsx(qw,{children:e.jsxs(pe,{to:h,className:T(x&&"active",a&&"unsupported"),children:[e.jsx(Rs,{className:T(r&&!a&&"active",a&&"unsupported"),children:d}),t.type.iconSvg&&e.jsx(Cl,{dangerouslySetInnerHTML:{__html:O.sanitize(t.type.iconSvg)}}),!t.type.iconSvg&&e.jsx(Cl,{children:e.jsx("i",{className:"fa-solid fa-cog"})}),e.jsx(Qw,{children:i}),o.version&&e.jsx(Kw,{children:o.version})]})})},yp=()=>B({queryKey:Ie.navigation,queryFn:()=>N.get("/api/integrations/navigation").then(t=>t.data),gcTime:1/0,staleTime:1/0}),Vw=()=>{const{data:t,isFetching:n}=yp(),{hasFavorite:s}=bp(),[o,i]=m.useState("");if(n&&!t)return e.jsx(jl,{});const r=t.map(d=>({...d,entries:d.entries.filter(h=>h.type.name.toLowerCase().includes(o.toLowerCase())||h.instances.some(x=>x.name.toLowerCase().includes(o.toLowerCase())))})).filter(d=>d.entries.length>0),a=r.flatMap(d=>d.entries.filter(h=>s(h.type))),l=r.map(d=>({...d,entries:d.entries.filter(h=>!s(h.type))})).filter(d=>d.entries.length>0);return e.jsxs(jl,{children:[e.jsx(Hw,{children:e.jsx(Ww,{query:o,setQuery:i})}),e.jsxs(Uw,{children:[a.length>0&&e.jsxs(vl,{children:[e.jsx(wl,{children:u("Favorites")}),e.jsx($l,{children:a.map(d=>e.jsx(kl,{entry:d},d.type.shortName))})]},"favorites"),l.map(d=>e.jsxs(vl,{children:[e.jsx(wl,{children:d.title}),e.jsx($l,{children:d.entries.map(h=>e.jsx(kl,{entry:h},h.type.shortName))})]},d.handle))]})]})},Gw=()=>(ts("integrations"),e.jsxs("div",{children:[e.jsx(Q,{id:"integrations",label:"Integrations",url:"integrations"}),e.jsx(es,{children:u("Integrations")}),e.jsxs(ru,{children:[e.jsx(Vw,{}),e.jsx(Nw,{children:e.jsx(mt,{})})]})]})),Yw=({property:t,integration:n,autoFocus:s,values:o,errors:i,onUpdate:r})=>{const a=xs(n.properties,{},(g,b)=>{r?.(g,b)}),l=t.handle,d=o.metadata[l]??t.value,h={...t,flags:(t.flags||[])?.filter(g=>g!=="as-readonly-in-instance")},x={...n,values:{name:o.name,handle:o.handle,enabled:o.enabled,...o.metadata}};return e.jsx(Le,{autoFocus:s,value:d,property:h,updateValue:a(h),errors:i?.metadata?.[l],context:x})},wi=c.div`
  position: relative;
  height: 100%;
`,_r=c.div`
  position: relative;
  z-index: 2;

  display: flex;
  flex-direction: column;
  gap: 24px;

  padding: ${f.xl};

  height: 100%;
  overflow-y: auto;

  background: white;

  border-top-right-radius: ${k.lg};
  border-bottom-right-radius: ${k.lg};

  ${q};

  hr {
    margin: 0;
    margin-inline: calc(var(--xl) * -1);
  }
`,Sl=c.div`
  position: absolute;
  right: 0;
  top: -44px;
  z-index: 2;
`,Ll=c(ds)`
  position: absolute;
  left: 0;
  top: -49px;
  z-index: 1;
`,jp=c.div`
  display: flex;
  align-items: center;
  gap: 10px;

  > span {
    font-size: 20px;
    font-weight: bold;
    color: #414141;
  }
`,Jw=c.small`
  margin-top: 6px;

  font-size: 12px;
  font-weight: normal;
  font-family: monospace;
  color: ${p.gray300};
`,Zw=c.button`
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
      fill: ${p.yellow600};
    }
  }

  &.active {
    svg .star-filler {
      fill: ${p.yellow500};
    }
  }
`,vp=c.div`
  svg {
    width: 30px;
    height: 30px;
  }

  &.spinning {
    animation: spin 2s linear infinite;
    fill: ${p.gray300};
  }
`,Xw=c.div`
  display: grid;
  grid-template-columns: min-content auto;
  grid-template-rows: auto;

  align-items: center;
  gap: 10px;
`,Bn=c.div`
  flex: 0 0 10px;

  display: block;
  width: 10px;
  height: 10px;

  border-radius: 10px;
`,e$=c.div`
  flex: 1;
  white-space: nowrap;
`,t$=c.div`
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

    ${Bn} {
      background: #27ae60;
      border: 1px solid #27ae60;
    }
  }

  &.unauthorized {
    background-color: rgba(51, 197, 255, 0.2);

    ${Bn} {
      background: rgba(51, 197, 255, 1);
      border: 1px solid rgba(51, 197, 255, 1);
    }
  }

  &.pending {
    background-color: rgba(55, 65, 81, 0.05);

    ${Bn} {
      background: #ccd1d6;
      border: 1px solid #ccd1d6;
    }
  }

  &.error {
    background-color: rgba(239, 68, 68, 0.2);

    ${Bn} {
      background: #d0021b;
      border: 1px solid #d0021b;
    }
  }
`,n$=c.div`
  margin-left: auto;

  > button,
  svg {
    width: 30px;
    height: 30px;
  }
`,Wo=c.div`
  display: flex;
  gap: 5px;
`,_o=c.a`
  align-items: center;
  gap: 5px;

  font-size: 12px;

  &.info-button {
    background-color: ${p.blue100};

    &:hover {
      background-color: ${p.blue200};
    }
  }

  i,
  svg {
    font-size: 14px;
    width: 16px;
    height: 16px;
  }
`,s$=c.ul`
  padding: 10px;

  border: 1px solid ${p.red200};
  border-radius: 5px;

  background-color: ${p.red100};

  color: ${p.red600};
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
`,o$=()=>e.jsxs(_r,{children:[e.jsxs(jp,{children:[e.jsx(vp,{className:"spinning",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 640 640",children:[e.jsx("title",{children:"Loading"}),e.jsx("path",{d:"M320 180C291.3 180 268 156.7 268 128C268 99.3 291.3 76 320 76C348.7 76 372 99.3 372 128C372 156.7 348.7 180 320 180zM320 480C337.7 480 352 494.3 352 512C352 529.7 337.7 544 320 544C302.3 544 288 529.7 288 512C288 494.3 302.3 480 320 480zM512 352C494.3 352 480 337.7 480 320C480 302.3 494.3 288 512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352zM96 320C96 302.3 110.3 288 128 288C145.7 288 160 302.3 160 320C160 337.7 145.7 352 128 352C110.3 352 96 337.7 96 320zM495.4 223.8C473.5 245.7 438.1 245.7 416.2 223.8C394.3 201.9 394.3 166.5 416.2 144.6C438.1 122.7 473.5 122.7 495.4 144.6C517.3 166.5 517.3 201.9 495.4 223.8zM161.6 478.4C149.1 465.9 149.1 445.6 161.6 433.1C174.1 420.6 194.4 420.6 206.9 433.1C219.4 445.6 219.4 465.9 206.9 478.4C194.4 490.9 174.1 490.9 161.6 478.4zM433.1 478.4C420.6 465.9 420.6 445.6 433.1 433.1C445.6 420.6 465.9 420.6 478.4 433.1C490.9 445.6 490.9 465.9 478.4 478.4C465.9 490.9 445.6 490.9 433.1 478.4zM150.3 150.3C169.1 131.5 199.4 131.5 218.2 150.3C237 169.1 237 199.4 218.2 218.2C199.4 237 169.1 237 150.3 218.2C131.5 199.4 131.5 169.1 150.3 150.3z"})]})}),e.jsx(L,{width:200})]}),e.jsx("hr",{}),e.jsxs("div",{children:[e.jsx(L,{width:80}),e.jsx(L,{width:270,height:10}),e.jsx(L,{width:"100%",height:30})]}),e.jsx("hr",{}),e.jsxs("div",{children:[e.jsx(L,{width:180}),e.jsx(L,{width:200,height:10}),e.jsx(L,{width:"100%",height:30})]}),e.jsxs("div",{children:[e.jsx(L,{width:70}),e.jsx(L,{width:340,height:10}),e.jsx(L,{width:"100%",height:30})]})]}),i$=({integration:t})=>{if(t.supported)return null;let n=I.editions.edition;return n=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase(),e.jsx(r$,{children:e.jsx(At,{title:u("Not available for {edition} edition",{edition:n}),subtitle:u("Upgrade to Pro to get access to this integration."),icon:e.jsx(cr,{}),children:e.jsx("a",{href:Craft.getCpUrl("plugin-store/freeform"),target:"_blank",rel:"noreferrer",children:u("Plugin Store")})})})},r$=c.div`
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
`,a$=(t,n,s)=>{const o=I.editions.edition;let i="/api/integrations/properties/";return s&&s!=="new"?i+=s:i+=`${t}/${n}`,B({queryKey:Ie.properties(t,n,s),queryFn:()=>N.get(i).then(r=>r.data).then(r=>({...r,supported:r.type.editions.length===0||r.type.editions.includes(o)}))})},l$=(t,n,s)=>{const o=X(),i=te();return re({mutationFn:r=>{const a={class:t,values:r};return N.post(`/api/integrations${n&&n!=="new"?`/${n}`:""}`,a).then(l=>l.data)},onSuccess:r=>{const{id:a,type:l,integration:d}=r;Ye.success(u("Integration saved successfully")),o.invalidateQueries({queryKey:Ie.all}),a&&i(`/integrations/${l}/${d}/${a}`)},onError:s})},Fl=c.div`
  margin: 0 -24px;
  padding: 0 24px;

  background-color: #f3f7fc;

  border-top: 1px solid ${p.hr};
`,c$=c.div`
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

  ${q};

  &.active {
    max-height: 500px;

    border-bottom: 1px solid ${p.hr};

    opacity: 1;
    overflow-y: auto;

    .markdown-collapse {
      opacity: 1;
    }
  }
`,d$=c.div`
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
`,u$=({active:t,content:n})=>{const s=f1.parse(n,{gfm:!0,async:!1});return n?e.jsx(Fl,{children:e.jsx(c$,{className:T("markdown-body",t&&"active"),children:e.jsx(d$,{dangerouslySetInnerHTML:{__html:O.sanitize(s)}})})}):e.jsx(Fl,{})},wp=t=>{const n=window.Craft;return n?.sendActionRequest?n.sendActionRequest("POST",t):fetch(`/actions/${t}`,{method:"POST",credentials:"same-origin"})},p$=()=>wp("freeform/form-monitor/disable-me").then(()=>{}),h$=()=>wp("freeform/form-monitor/delete-me").then(()=>{}),x$=({onClose:t,onConfirm:n})=>{const[s,o]=m.useState(!1),[i,r]=m.useState(!1),[a,l]=m.useState(""),d=async()=>{if(i)try{o(!0),await n(),t()}finally{o(!1)}};return m.useEffect(()=>{r(a.toUpperCase()==="CONFIRM")},[a]),e.jsx(bt,{closeModal:t,children:e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Disable Monitoring")})}),e.jsxs(rs,{children:[e.jsx("div",{children:u("Are you sure you want to disable monitoring for this site?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To disable monitoring, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:a,autoComplete:"off",onChange:h=>l(h.target.value),className:"text fullwidth"})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",disabled:s,className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",disabled:!i||s,className:T("btn submit",!i&&"disabled"),onClick:d,children:u("Disable")})]})]})})},m$=({onClose:t,onConfirm:n})=>{const[s,o]=m.useState(!1),[i,r]=m.useState(""),[a,l]=m.useState(!1),d=async()=>{if(s)try{l(!0),await n(),t()}finally{l(!1)}};return m.useEffect(()=>{o(i.toUpperCase()==="CONFIRM")},[i]),e.jsx(bt,{closeModal:t,children:e.jsxs($e,{children:[e.jsx(Ce,{children:e.jsx("h1",{children:u("Disable & Delete Monitoring Data")})}),e.jsxs(rs,{children:[e.jsx("div",{children:u("Are you sure you want to disable monitoring and delete all monitoring data for this site?")}),e.jsx("div",{dangerouslySetInnerHTML:{__html:O.sanitize(u("To disable monitoring and delete all data, please type <strong>CONFIRM</strong> in the box below:"))}}),e.jsx("input",{type:"text",autoFocus:!0,value:i,autoComplete:"off",onChange:h=>r(h.target.value),className:"text fullwidth"})]}),e.jsxs(ke,{children:[e.jsx("button",{type:"button",disabled:a,className:"btn cancel",onClick:t,children:u("Cancel")}),e.jsx("button",{type:"button",disabled:!s||a,className:T("btn submit",!s&&"disabled"),onClick:d,children:u("Disable & Delete")})]})]})})},g$=()=>{const t=X(),n=te(),[s,o]=m.useState(!1),[i,r]=m.useState(!1),a=()=>o(!0),l=()=>r(!0);return e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"btn small",onClick:a,children:e.jsx("span",{children:u("Disable Monitoring")})}),e.jsx("button",{type:"button",className:"btn small",onClick:l,children:e.jsx("span",{children:u("Disable & Delete Monitoring Data")})}),s&&e.jsx(x$,{onClose:()=>o(!1),onConfirm:async()=>{await p$(),t.invalidateQueries({queryKey:Ie.all}),Ye.success(u("Monitoring disabled."))}}),i&&e.jsx(m$,{onClose:()=>r(!1),onConfirm:async()=>{await h$(),t.invalidateQueries({queryKey:Ie.all}),Ye.success(u("Monitoring disabled and data deleted.")),n("/integrations",{replace:!0})}})]})},f$=t=>t.type.class==="Solspace\\Freeform\\Integrations\\Single\\FormMonitor\\FormMonitor",b$=t=>e.jsxs(R,{viewBox:"0 0 640 640",...t,children:[e.jsx("path",{className:"star-filler",d:"M119.2 254.7L209 344.6C214.4 350 216.9 357.7 215.7 365.3L195.9 490.8L309.2 433.2C316 429.7 324.1 429.7 331 433.2L444.3 490.8L424.5 365.3C423.3 357.7 425.8 350 431.2 344.6L521 254.7L395.5 234.7C387.9 233.5 381.4 228.7 377.9 221.9L320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8z"}),e.jsx("path",{d:"M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"})]}),y$=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z"})}),j$=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z"})}),v$=t=>e.jsx(R,{viewBox:"0 0 640 640",...t,children:e.jsx("path",{d:"M320 64C324.6 64 329.2 65 333.4 66.9L521.8 146.8C543.8 156.1 560.2 177.8 560.1 204C559.6 303.2 518.8 484.7 346.5 567.2C329.8 575.2 310.4 575.2 293.7 567.2C121.3 484.7 80.6 303.2 80.1 204C80 177.8 96.4 156.1 118.4 146.8L306.7 66.9C310.9 65 315.4 64 320 64zM320 130.8L320 508.9C458 442.1 495.1 294.1 496 205.5L320 130.9L320 130.9z"})}),w$=(t,n)=>{const s=Craft.getCpUrl(`freeform/integrations/${t}/authorize`),o=600,i=700,r=window.screenX+(window.outerWidth-o)/2,a=window.screenY+(window.outerHeight-i)/2,d=Object.entries({width:o,height:i,top:a,left:r,toolbar:0,menubar:0}).map(([g,b])=>`${g}=${b}`).join(","),h=window.open(s,"OAuthFlow",d),x=g=>{g.origin===window.location.origin&&g.data.type==="oauth2"&&(h?.close(),n(),window.removeEventListener("message",x))};window.addEventListener("message",x)},$$=t=>{const{id:n}=t;return B({queryKey:Ie.authCheck(n),enabled:!!n&&t.implements.includes("apiIntegration"),queryFn:async()=>N.get(`/api/integrations/${n}/status`).then(s=>s.data)})},C$=["authorized","unauthorized","error"],k$=["authorized","error"],S$=({integration:t})=>{const n=X(),s=te(),[o,i]=m.useState("pending"),[r,a]=m.useState([]),[l,d]=m.useState(!1),{toggleFavorite:h,hasFavorite:x}=bp(),{data:g,isFetching:b,refetch:y}=$$(t);m.useEffect(()=>{b?(i("pending"),a([])):g&&(i(g.status),a(g.errors||[]))},[g,b]);const j=()=>{confirm(u("Are you sure you want to remove this integration?"))&&N.post(`/api/integrations/${t.id}/delete`).then(()=>{n.invalidateQueries({queryKey:Ie.all}),s("/integrations"),Ye.success(u("Integration deleted successfully."))})},w=f$({...t,id:String(t.id)}),v=I.permissions.integrations==="manage",$=v&&t.id&&t.supported,C=x(t.type),E=!!t.type.readmeContent,F=v&&t.id&&t.supported&&t.implements.includes("apiIntegration");return e.jsxs(e.Fragment,{children:[e.jsxs(jp,{children:[e.jsx(vp,{dangerouslySetInnerHTML:{__html:O.sanitize(t.type.iconSvg)}}),e.jsx("span",{children:t.name||t.type.name}),t.type.version&&e.jsx(Jw,{children:t.type.version}),e.jsx(Zw,{type:"button",className:T(C&&"active"),onClick:()=>h(t.type),title:u("Favorite"),children:e.jsx(b$,{})}),F&&e.jsxs(Xw,{children:[e.jsxs(t$,{className:o,children:[e.jsx(Bn,{}),e.jsx(e$,{children:L$[o]})]}),e.jsxs(Wo,{children:[k$.includes(o)&&e.jsx(_o,{className:"btn small",onClick:()=>y(),children:e.jsx(j$,{})}),C$.includes(o)&&e.jsxs(_o,{className:"btn small",onClick:()=>w$(t.id,y),children:[e.jsx(v$,{}),e.jsx("span",{children:u("Authorize")})]})]})]}),E&&e.jsx(Wo,{children:e.jsxs(_o,{className:"btn small info-button",onClick:()=>d(!l),children:[e.jsx(y$,{}),e.jsx("span",{children:u("Show Instructions")})]})}),v&&t.enabled&&w&&o==="authorized"&&e.jsx(Wo,{children:e.jsx(g$,{})}),$&&e.jsx(n$,{children:e.jsx(Sn,{active:!0,onClick:j})})]}),r.length>0&&e.jsx(s$,{children:r.map((z,M)=>{try{const S=JSON.parse(z);if(S)return e.jsx("li",{children:e.jsx("pre",{children:JSON.stringify(S,null,2)})},M)}catch{}return e.jsx("li",{children:z},M)})}),e.jsx(u$,{active:l,content:t.type.readmeContent})]})},L$={authorized:"Authorized",unauthorized:"Unauthorized",pending:"Checking...",error:"Error"},F$=()=>{const t=te(),{type:n,integration:s,id:o}=K(),{data:i,isFetching:r}=a$(n,s,o),{data:a}=yp();m.useEffect(()=>{if(a&&s&&!o){const F=a.find(M=>M.handle===n);if(!F)return;const z=F.entries.find(M=>M.type.shortName===s);if(z){const M=z.instances?.[0];if(M){t(`/integrations/${n}/${s}/${M.id}`);return}}}},[a,s,o,t,n]);const[l,d]=m.useState({name:"",handle:"",enabled:!0,metadata:{}}),[h,x]=m.useState({}),{mutate:g,isPending:b}=l$(i?.type.class,o,F=>{if(!F.errors){x({});return}const z={metadata:{}};Object.entries(F.errors).forEach(([M,S])=>{/^metadata\./.test(M)?z.metadata[M.replace(/^metadata\./,"")]=S:z[M]=S}),x(z)});m.useEffect(()=>{b&&x({})},[b]),m.useEffect(()=>{if(i){const F=i.properties.reduce((z,M)=>(z[M.handle]=M.value,z),{});d({name:i.name,handle:i.handle,enabled:i.enabled,metadata:F})}},[i]);const y=I.permissions.integrations==="manage",j=o==="new",w=r||!i,v=()=>{i?.supported&&g(l)};Lr(v);const $=a?.find(F=>F.handle===n)?.entries?.find(F=>F.type.shortName===s)?.instances,C=$?.length||0,E=C>1||j;return!n||!s?null:w?e.jsxs(wi,{children:[E&&e.jsx(Ll,{children:$?.map(F=>e.jsx(pe,{to:`../${n}/${s}/${F.id}`,children:e.jsx("span",{children:F.name})},F.id))}),y&&e.jsx(Sl,{children:e.jsxs("div",{className:"btngroup",children:[C>0&&n!==ti.Singles&&e.jsx("button",{type:"button",title:u("Add new integration of the same type"),className:T("btn","add","icon","disabled")}),e.jsx("button",{type:"button",className:T("btn",i?.supported&&"submit","disabled"),children:u("Save")})]})}),e.jsx(o$,{})]}):e.jsxs(wi,{children:[e.jsx(Q,{id:"integration-edit",label:i.name,url:`integrations/${n}/${s}${o?`/${o}`:""}`}),e.jsx(i$,{integration:i}),E&&e.jsxs(Ll,{children:[$.map(F=>e.jsx(pe,{to:`../${n}/${s}/${F.id}`,children:e.jsx("span",{children:F.name})},F.id)),j&&e.jsx("a",{className:"active",children:e.jsx("span",{children:u("Create a new instance")})})]}),y&&e.jsx(Sl,{children:e.jsxs("div",{className:"btngroup",children:[C>0&&n!==ti.Singles&&e.jsx("button",{type:"button",title:u("Add new integration of the same type"),className:T("btn","add","icon",!i.supported&&"disabled"),onClick:()=>t(`/integrations/${n}/${s}/new`)}),e.jsx("button",{type:"button",className:T("btn",i.supported?"submit":"disabled"),onClick:v,children:e.jsx(Z,{loading:b,loadingText:u("Saving..."),spinner:!0,children:u("Save")})})]})}),e.jsxs(_r,{children:[e.jsx(S$,{integration:i}),e.jsx(It,{property:{handle:"name",label:"Name",required:!0,instructions:u("What this integration will be called in the CP."),type:Y.String},updateValue:F=>{d(z=>({...z,name:F,handle:Ai(F,{transliterate:!0,camelize:!0})}))},value:l.name,errors:h?.handle,autoFocus:i.supported}),e.jsx("hr",{}),i.properties.map(F=>e.jsx(Yw,{integration:i,property:F,values:l,errors:h,onUpdate:(z,M)=>{d(S=>({...S,metadata:{...S.metadata,[z]:M}}))}},F.handle))]})]})},T$=()=>e.jsx(wi,{children:e.jsx(_r,{children:e.jsx(At,{title:u("Please select an integration"),subtitle:u("To add a new integration, select its type in the sidebar."),icon:e.jsx(cr,{})})})}),ms={all:["limited-users"],one:t=>[...ms.all,t]},E$=()=>B({queryKey:ms.all,queryFn:()=>N.get("/api/limited-users").then(t=>t.data),staleTime:1/0}),z$=t=>B({queryKey:ms.one(t),queryFn:()=>N.get(`/api/limited-users/${t}`).then(n=>n.data),staleTime:1/0}),N$=t=>{const n=X();return re({mutationFn:s=>N.post(`/api/limited-users/${t}`,{name:s.name,description:s.description,items:s.items}),onSuccess:()=>{n.invalidateQueries({queryKey:ms.all})}})},M$=()=>{const t=X();return re({mutationFn:n=>N.delete(`/api/limited-users/${n}/delete`),onSuccess:()=>{t.invalidateQueries({queryKey:ms.all})}})},$p=()=>{const{data:t,isFetching:n}=B({queryKey:["settings","navigation"],queryFn:()=>N.get("/api/settings/navigation").then(s=>s.data)});return!t&&n?null:e.jsx("div",{id:"sidebar-container",children:e.jsx("div",{id:"sidebar",className:"sidebar",children:e.jsx("nav",{children:e.jsx("ul",{children:Object.entries(t).map(([s,o])=>o.title?e.jsxs("li",{children:[s==="limited-users"&&e.jsx(un,{className:"sel",to:"/settings/limited-users",children:o.title}),s!=="limited-users"&&e.jsx("a",{href:ve(`settings/${s}`),dangerouslySetInnerHTML:{__html:O.sanitize(o.title)}})]},s):o.heading?e.jsx("li",{className:"heading",children:e.jsx("span",{children:o.heading})},s):null)})})})})},Cp=c.div`
  &.craft-4 {
    max-width: calc(100% - 250px) !important;
    width: calc(100% - 250px) !important;
  }
`,I$=c.div`
  background-color: white;
  padding: ${f.xl};
  border-radius: 5px;
`,jn=c.div`
  display: flex;
  gap: 30px;

  align-self: center;
`,ho=c.div`
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
`,Hr=c.label`
  grid-area: label;
`,R$=c.h2`
  margin: 0;
  padding: 0;
`,Ur=c.div`
  grid-area: control;
`,A$=c.div`
  grid-area: control-area;
`,D$=c.ul`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`,P$=c.li`
  cursor: pointer;
  position: relative;

  padding: 3px 10px 3px 30px;
  background-color: ${p.gray100};

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
    background-color: ${p.gray200};
  }

  &.selected {
    background-color: #1fa07a;
    color: white;

    &:hover {
      background-color: #1a8665;
    }
  }
`,kp=c.div`
  display: flex;

  a {
    cursor: pointer;

    position: relative;
    padding: 0 10px;

    color: ${p.blue600};

    &.disabled {
      color: ${p.gray400};
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

      background-color: ${p.gray200};
      font-size: 0;
      line-height: 0;
      overflow: hidden;
    }
  }
`,Sp=c.ul`
  transition: opacity 0.2s ease-out;
`,B$=c.li`
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
        background-color: ${p.gray100};
      }
    }
  }

  &[data-nesting='1'] h2 {
    margin-top: 10px !important;
    margin-left: 70px;
  }

  &[data-nesting='2'] {
    ${jn} {
      gap: 10px;

      &:before {
        content: '—';
      }
    }
  }

  &[data-nesting='3'] {
    ${jn} {
      gap: 10px;

      &:before {
        content: '———';
      }
    }
  }
`,O$=()=>{const{data:t,isFetching:n}=E$(),s=M$(),o=I.editions.isAtLeast(le.Pro),i=I.metadata.craft.is5;return ts("freeform/settings"),!t&&n?e.jsx("div",{children:"Loading..."}):e.jsxs("div",{children:[e.jsx(Q,{id:"settings",label:u("Settings"),url:".",external:!0}),e.jsx(Q,{id:"limited-users",label:u("Limited Users"),url:"settings/limited-users"}),e.jsx(es,{extra:o&&e.jsx(un,{to:"new",className:"btn submit add icon",children:u("New Group")}),children:u("Limited Users")}),e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx($p,{}),e.jsx(Cp,{id:"content-container",className:T(!i&&"craft-4"),children:e.jsxs("div",{id:"content",className:"content-pane",children:[o&&e.jsxs("div",{className:"tablepane",children:[t.length>0&&e.jsxs("table",{className:"data fullwidth",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:u("Name")}),e.jsx("th",{children:u("Description")}),e.jsx("th",{})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{children:[e.jsx("th",{children:e.jsx(un,{to:`${r.id}`,children:r.name})}),e.jsx("td",{children:r.description}),e.jsx("td",{className:"thin",children:e.jsx("a",{className:"delete icon",title:u("Delete"),onClick:()=>{confirm(u("Are you sure you want to delete this?"))&&s.mutate(r.id)}})})]},r.id))})]}),t.length===0&&e.jsx("div",{style:{padding:"100px 0 100px"},children:e.jsx(At,{title:u("No groups exist yet"),subtitle:u('Click on the "New Group" button to set up your first Limited User permission group.')})})]}),!o&&e.jsx(At,{lite:!0,title:u("Upgrade to the Freeform Pro edition to get access to the Limited Users feature.")})]})})]})]})},W$=({item:t,updateValue:n})=>e.jsxs(ho,{children:[e.jsx(Ur,{children:e.jsx(Jt,{enabled:t.enabled,onClick:s=>n(s)})}),e.jsx(jn,{children:e.jsx(Hr,{onClick:()=>n(!t.enabled),children:u(t.name)})})]}),_$=({item:t,updateValue:n})=>e.jsxs(ho,{children:[e.jsx(Ur,{children:e.jsx("div",{className:"select",children:e.jsx("select",{value:t.value,onChange:s=>n(s.target.value),children:t.options.map(s=>e.jsx("option",{label:u(s.label),value:s.value},s.value))})})}),e.jsx(jn,{children:e.jsx(Hr,{children:t.name})})]}),H$=({item:t,updateValue:n})=>{const s=o=>()=>{n(t.values.includes(o)?t.values.filter(i=>i!==o):[...t.values,o])};return e.jsxs(ho,{className:"triage",children:[e.jsx(Ur,{}),e.jsxs(jn,{children:[e.jsx(Hr,{children:u(t.name)}),e.jsxs(kp,{children:[e.jsx("a",{className:T(t.values.length===t.options.length&&"disabled"),onClick:()=>n(t.options.map(o=>o.value)),children:u("Enable All")}),e.jsx("a",{className:T(t.values.length===0&&"disabled"),onClick:()=>n([]),children:u("Disable All")})]})]}),e.jsx(A$,{children:e.jsx(D$,{children:t.options.map(o=>e.jsxs(P$,{onClick:s(o.value),className:T(t.values.includes(o.value)&&"selected"),children:[t.values.includes(o.value)&&e.jsx("i",{className:"fa-sharp fa-solid fa-check"}),u(o.label)]},o.value))})})]})},U$=({item:t,nesting:n,updateValue:s})=>{const o=i=>()=>{const r=(a,l)=>{const d=l?`${l}.${a.id}`:a.id,h=[];if(a.type==="boolean"&&h.push([d,i]),a.children){const x=a.children.map(g=>r(g,d));h.push(...x.flat())}return h};s(r(t))};return e.jsx(ho,{className:"solo",children:e.jsxs(jn,{children:[e.jsx(R$,{children:u(t.name)}),n===0&&e.jsxs(kp,{children:[e.jsx("a",{onClick:o(!0),children:u("Enable All")}),e.jsx("a",{onClick:o(!1),children:u("Disable All")})]})]})})},Lp=({item:t,parentId:n,nesting:s=0,updateValue:o})=>{const i=n?`${n}.${t.id}`:t.id;let r;switch(t.type){case"boolean":r=e.jsx(W$,{item:t,updateValue:a=>o(i,{enabled:a})});break;case"select":r=e.jsx(_$,{item:t,updateValue:a=>o(i,{value:a})});break;case"toggles":r=e.jsx(H$,{item:t,updateValue:a=>o(i,{values:a})});break;case"group":r=e.jsx(U$,{item:t,nesting:s,updateValue:a=>{a.forEach(([l,d])=>{o(l,{enabled:d})})}});break}return e.jsxs(B$,{"data-type":t.type,"data-nesting":s,children:[r,t.children&&e.jsx(Sp,{className:T(t.type==="boolean"&&!t.enabled&&"disabled"),children:t.children.map(a=>e.jsx(Lp,{item:a,parentId:i,nesting:s+1,updateValue:o},a.id))})]})},q$=()=>{const{id:t}=K(),{data:n,isFetching:s}=z$(t),o=te(),[i,r]=m.useState(""),[a,l]=m.useState(""),[d,h]=m.useState([]),x=N$(t),g=I.metadata.craft.is5;ts("freeform/settings"),m.useEffect(()=>{n&&(r(n.name),l(n.description),h(n.items))},[n]);const b=(j,w)=>{const v=($,C)=>$.map(E=>{const F=C?`${C}.${E.id}`:E.id;return F===j?{...E,...w}:E.children?{...E,children:v(E.children,F)}:E});h($=>v($))},y=(j=!0)=>()=>{x.mutate({name:i,description:a,items:d},{onSuccess:()=>{j&&o("/settings/limited-users"),Ye.success(u("Permission saved successfully."))}})};return Lr(y(!1)),!n&&s?e.jsx("div",{children:u("Loading...")}):e.jsxs("div",{children:[e.jsx(Q,{id:"settings",label:u("Settings"),url:"..",external:!0}),e.jsx(Q,{id:"limited-users",label:u("Limited Users"),url:"settings/limited-users"}),e.jsx(Q,{id:"limited-users-id",label:n?.name,url:`settings/limited-users/${t}`}),e.jsx(es,{extra:e.jsx("button",{type:"button",className:"btn submit",onClick:y(),children:e.jsx(Z,{loading:x.isPending,loadingText:u("Saving..."),spinner:!0,children:u("Save")})}),children:u("Limited Users")}),e.jsxs("div",{id:"main-content",className:"has-sidebar",children:[e.jsx($p,{}),e.jsx(Cp,{id:"content-container",className:T(!g&&"craft-4"),children:e.jsx("div",{id:"content",className:"content-pane",style:{padding:0},children:e.jsxs(I$,{children:[e.jsx(It,{property:{handle:"name",label:u("Name"),instructions:u("Enter the name of the limited user permission."),type:Y.String},value:i,updateValue:j=>r(j)}),e.jsx("br",{}),e.jsx(os,{property:{handle:"description",label:u("Description"),instructions:u("Enter a description for this permission."),type:Y.Textarea,rows:4,flags:[]},value:a,updateValue:j=>l(j)}),e.jsx("hr",{}),e.jsx(Sp,{children:d.map(j=>e.jsx(Lp,{item:j,updateValue:b},j.id))})]})})})]})]})},dn={all:["surveys","results"],single:t=>[...dn.all,t],preferences:t=>[...dn.single(t),"preferences"],chart:t=>[...dn.single(t),"chart"]},qr=()=>{const{handle:t}=K();return B({queryKey:dn.single(t),queryFn:()=>N.get(`/api/surveys/form/${t}`).then(n=>n.data),staleTime:1/0,enabled:!!t})},Fp=()=>{const{handle:t}=K();return B({queryKey:dn.preferences(t),queryFn:()=>N.get(`/api/surveys/preferences/${t}`).then(n=>n.data),staleTime:1/0})},Tp=()=>{const{handle:t}=K();return B({queryKey:dn.chart(t),queryFn:()=>N.get(`/api/surveys/chart/${t}`).then(n=>n.data),staleTime:1/0})},Ep=c.div`
  position: relative;
`,zp=c.h1`
  position: absolute;
  top: ${f.md};
  left: ${f.xl};

  font-size: 40px;
  user-select: none;
  pointer-events: none;
`,Np=c.div`
  margin-top: -3px;
  height: 20px;
  background: linear-gradient(
    to bottom,
    ${({$color:t})=>`${t}1A 30%, transparent 100%`}
  );
`,Q$=c.div`
  padding: ${f.sm} ${f.md};
  background-color: white;
  border: 2px solid ${({$color:t})=>t};
`,K$=()=>{const{data:t,isFetching:n}=qr(),{data:s,isFetching:o}=Tp();if(o||n)return null;const{form:{id:i,name:r,color:a}}=t,l=({active:h,payload:x})=>{if(h&&x&&x.length){const{payload:{name:g,y:b}}=x[0];return e.jsxs(Q$,{$color:a,children:[g,": ",e.jsx("b",{children:b})," submissions"]})}},d=Math.max(...s.map(h=>h.y))*2;return e.jsxs(Ep,{$color:a,children:[e.jsx(zp,{children:r}),e.jsx(Xe,{width:"100%",height:80,children:e.jsxs(gt,{data:s,margin:{top:0,left:0,right:0,bottom:3},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:`color${i}`,x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:a,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:a,stopOpacity:.1})]})}),e.jsx(ft,{type:"monotone",dataKey:"y",stroke:a,strokeWidth:1,strokeOpacity:1,fillOpacity:1,isAnimationActive:!1,fill:`url(#color${i})`}),d>0&&e.jsx(Si,{domain:[0,d],hide:!0}),e.jsx(Li,{content:e.jsx(l,{})})]})}),e.jsx(Np,{$color:a})]})};var ct=(t=>(t.Horizontal="Horizontal",t.Vertical="Vertical",t.Pie="Pie",t.Donut="Donut",t.Hidden="Hidden",t.Text="Text",t))(ct||{});const V$=t=>e.jsx(R,{height:"16",width:"16",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"})}),G$=({fieldId:t,chartType:n})=>{const s={fieldId:t,chartType:n};return N.post("/api/surveys/preferences",s)},Y$=()=>re({mutationFn:G$}),J$=c.div`
  grid-area: settings;

  position: relative;
`,Mp=c.button`
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
`,Z$=c.div`
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
`,X$=c.a`
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
`,eC=Object.keys(ct),Tl=({fieldId:t,selectedChartType:n,isShown:s,toggle:o,changeType:i})=>{const{mutate:r,isPending:a}=Y$();return e.jsxs(Mp,{className:T(a&&"loading",s&&"open"),onClick:o,children:[e.jsx(V$,{}),s&&e.jsx(Z$,{children:eC.map(l=>e.jsx(X$,{className:n===l&&"selected",onClick:()=>{i(l),r({fieldId:t,chartType:l})},children:l},l))})]})},tC=c.li`
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
`,nC=c.div`
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
`,sC=c.div`
  grid-area: label;
`,oC=c.div`
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
`,iC=c.div`
  position: relative;

  font-size: 12px;
  color: #ccc;
`,rC=c.div`
  position: absolute;
  right: 0;
  top: 0;
`,aC=c.div`
  grid-area: numbers;
`,lC=c.li`
  position: relative;

  padding: 3px 0;
  margin-bottom: 42px;

  background: #f3f7fd;
  text-align: center;
  font-size: 12px;

  ${Mp} {
    position: absolute;
    left: 0;
    top: 0;

    width: 40px;
  }
`,cC=(t,n,s=1)=>n(t).replace(/rgb\((\d+, \d+, \d+)\)/i,`rgba($1, ${s})`),dC=t=>{const n=Math.max(0,Math.min(1,t)),s=Math.max(0,Math.min(255,Math.round(34.61+n*(1172.33-n*(10793.56-n*(33300.12-n*(38394.49-n*14825.05))))))),o=Math.max(0,Math.min(255,Math.round(23.31+n*(557.33+n*(1225.33-n*(3574.96-n*(1073.77+n*707.56))))))),i=Math.max(0,Math.min(255,Math.round(27.2+n*(3211.1-n*(15327.97-n*(27814-n*(22569.18-n*6838.66)))))));return`rgb(${s}, ${o}, ${i})`},El=Math.PI/180,Ip=({breakdown:t,pie:n})=>{const s=t.filter(({votes:r})=>r>0),o=t.map(({ranking:r})=>cC(r/t.length,dC)),i=({cx:r,cy:a,midAngle:l,outerRadius:d,percent:h,index:x})=>{const g=d+30,b=r+g*Math.cos(-l*El),y=a+g*Math.sin(-l*El);return e.jsxs("text",{x:b,y,fill:"black",textAnchor:b>r?"start":"end",dominantBaseline:"central",children:[e.jsx("tspan",{style:{fontWeight:"bold"},children:s[x].label}),e.jsxs("tspan",{style:{fontSize:"12px",fill:"#999"},children:[" ","(",`${(h*100).toFixed(0)}%`,")"]})]},x)};return e.jsx("div",{style:{width:800},children:e.jsx(Xe,{width:"100%",height:400,children:e.jsx(b1,{children:e.jsx(y1,{data:s,dataKey:"votes",nameKey:"label",cx:"50%",cy:"50%",outerRadius:180,innerRadius:n?0:100,fill:"#82ca9d",labelLine:!0,label:i,children:s.map((r,a)=>e.jsx(j1,{fill:o[a]},`cell-${a}`))})})})})},uC=()=>e.jsx("div",{children:"hidden"}),pC=c.div`
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
`,hC=c.div`
  grid-area: label;

  font-weight: bold;
`,xC=c.div`
  grid-area: percentage;

  font-size: 14px;
  font-weight: bold;
  text-align: right;
`,mC=c.div`
  grid-area: votes;

  color: #c2c5c7;
  font-size: 12px;
  text-align: right;
`,gC=c.div`
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
`,fC=({breakdown:t})=>e.jsx(e.Fragment,{children:t.map(({label:n,value:s,votes:o,percentage:i,ranking:r})=>e.jsxs(pC,{children:[e.jsx(hC,{children:n}),e.jsxs(mC,{children:[o," ",u("resp.")]}),e.jsxs(xC,{children:[Math.round(i),"%"]}),e.jsx(gC,{percentage:i,ranking:r})]},s.toString()))}),bC=({breakdown:t})=>e.jsx(Ip,{breakdown:t,pie:!0}),yC=c.div``,jC=c.div`
  padding: 10px 15px;

  &:not(:last-child) {
    border-bottom: 1px solid #eff3f6;
  }
`,vC=({breakdown:t})=>e.jsx(yC,{children:t.map(n=>e.jsxs(jC,{children:[n.label,n.votes>1&&` (${n.votes})`]},n.value.toString()))}),wC=c.div`
  width: 900px;
  overflow-x: auto;

  ${q};
`,$C=c.div`
  display: grid;
  gap: 10px;
  grid-auto-columns: minmax(80px, 1fr);
  grid-auto-flow: column;
`,CC=c.div`
  display: flex;
  flex-direction: column;

  text-align: center;
`,kC=c.div`
  padding: 10px;

  font-size: 16px;
  font-weight: bold;
`,SC=c.div`
  flex-basis: 40px;
  padding: 10px;

  font-weight: bold;
  font-size: 16px;

  box-sizing: border-box;
`,LC=c.div`
  flex-basis: 30px;

  color: #c2c5c7;

  font-size: 12px;
  line-height: 12px;

  span {
    display: block;
  }
`,FC=c.div`
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
`,TC=({breakdown:t})=>e.jsx(wC,{children:e.jsx($C,{count:t.length,children:t.map(({label:n,value:s,votes:o,percentage:i,ranking:r})=>e.jsxs(CC,{children:[e.jsxs(SC,{children:[Math.round(i),"%"]}),e.jsxs(LC,{children:[o," ",u("resp.")]}),e.jsx(FC,{percentage:i,ranking:r}),e.jsx(kC,{children:n})]},s.toString()))})}),EC=Object.freeze(Object.defineProperty({__proto__:null,Donut:Ip,Hidden:uC,Horizontal:fC,Pie:bC,Text:vC,Vertical:TC},Symbol.toStringTag,{value:"Module"})),zC=c.div`
  margin-top: 10px;

  color: #cf4041;
  font-size: 16px;
`,NC=c.span`
  font-weight: bold;
`,MC=c.span`
  color: #a4a6aa;
`,IC=({average:t,max:n})=>t===null||n===null?null:e.jsxs(zC,{children:[u("Average"),": ",e.jsx(NC,{children:t})," ",e.jsxs(MC,{children:["/ ",n]})]}),RC=[ct.Hidden,ct.Text],AC=({field:t,responses:n,breakdown:s,skipped:o,bulletin:i,average:r,max:a})=>{const l=Ne(t.class),[d,h]=m.useState(ct.Horizontal),[x,g]=m.useState(!1),{data:b}=Fp(),y=m.useRef(null);if(m.useEffect(()=>{if(b){let v=b.fieldSettings.find($=>$.id===t.id)?.chartType;v===void 0&&(v=b.chartDefaults?.[t.class]||ct.Horizontal),h(v)}else h(ct.Horizontal)},[b,t]),m.useEffect(()=>{RC.includes(d)},[d]),!b)return null;const{permissions:j}=b,w=EC[d];return d===ct.Hidden?e.jsxs(lC,{children:[j.reports&&e.jsx(Tl,{fieldId:t.id,selectedChartType:d,isShown:x,toggle:()=>g(!x),changeType:v=>h(v)}),"--"," ",e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(u("Question <b>{index}</b> Hidden",{index:i}))}})," ","--"]}):e.jsxs(tC,{ref:y,"data-chart-id":t.id,children:[e.jsx(nC,{children:e.jsx("span",{children:i})}),e.jsxs(sC,{children:[e.jsxs(oC,{children:[l&&e.jsx("span",{dangerouslySetInnerHTML:{__html:O.sanitize(l.icon)}}),t.label]}),e.jsxs(iC,{children:[u("{answered} answered, {skipped} skipped",{answered:n-o,skipped:o}),t.multiChoice&&e.jsx(rC,{children:u("multiple choice")})]}),e.jsx(IC,{average:r,max:a})]}),e.jsx(J$,{children:j.reports&&e.jsx(Tl,{fieldId:t.id,selectedChartType:d,isShown:x,toggle:()=>g(!x),changeType:v=>h(v)})}),e.jsx(aC,{children:e.jsx(w,{breakdown:s})})]})},Rp=c.ul`
  display: block;

  padding: ${f.xl};
`,DC=c.div`
  display: flex;
  justify-content: space-between;
`,Ap=c.div`
  position: relative;

  display: block;
  padding: 0 0 30px;

  color: #3f4d5a;
  font-size: 1.5rem;
  font-weight: normal;

  small {
    color: #bbbdbe;
    padding-left: ${f.md};
  }
`,PC=()=>{const t=m.useRef(null),{data:n,isFetching:s}=qr();if(s)return"Loading...";const o=async()=>{if(!n||!t.current)return;const i=await v1(t.current,{cacheBust:!0,fontEmbedCSS:""}),r=ve("/export/surveys/pdf"),a=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({[Craft.csrfTokenName]:Craft.csrfTokenValue,image:i})});if(!a.ok){const j=await a.text();throw new Error(j)}const l=await a.blob(),d=window.URL||window.webkitURL,h=d.createObjectURL(l),x=document.createElement("a");x.href=h;const g=a.headers.get("Content-Disposition")||"",b=/filename\*?=(?:UTF-8'')?["']?([^"';\s]+)["']?/i.exec(g),y=b?.[1]?decodeURIComponent(b[1]):"survey-results.pdf";x.download=y,document.body.appendChild(x),x.click(),x.remove(),setTimeout(()=>d.revokeObjectURL(h),1e3)};return e.jsxs(e.Fragment,{children:[e.jsx(Q,{id:"survey-list",label:n.form.name,url:`/surveys/${n.form.handle}`}),e.jsxs(Rp,{ref:t,children:[e.jsxs(DC,{children:[e.jsxs(Ap,{children:[u("{count} Responses",{count:n.form.submissions}),e.jsxs("small",{children:["(",u("{count} questions",{count:n.results.length}),")"]})]}),e.jsx("button",{type:"button",className:"btn",onClick:o,children:u("Export as PDF")})]}),n.results.map((i,r)=>e.jsx(AC,{...i,responses:n.form.submissions,bulletin:r+1},i.field.id))]})]})},BC=(t,n)=>Math.floor(Math.random()*(n-t+1))+t,OC=Kn(0,60).map(t=>({name:"",y:t>30?BC(0,Math.random()>.5?4:1):0})),WC=()=>{const t="#cccccc";return e.jsxs(Ep,{$color:t,children:[e.jsx(zp,{children:e.jsx(Z,{loading:!0,instant:!0,xl:!0,children:u("Loading")})}),e.jsx(Xe,{width:"100%",height:80,children:e.jsxs(gt,{data:OC,margin:{top:30,left:0,right:0,bottom:3},children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"color",x1:0,y1:0,x2:0,y2:1,children:[e.jsx("stop",{offset:"5%",stopColor:t,stopOpacity:.4}),e.jsx("stop",{offset:"95%",stopColor:t,stopOpacity:.1})]})}),e.jsx(ft,{type:"monotone",dataKey:"y",stroke:t,strokeWidth:1,strokeOpacity:1,fillOpacity:1,isAnimationActive:!1,fill:"url(#color)"})]})}),e.jsx(Np,{$color:t})]})},Dp=c.div`
  --highlight: ${({$highlightHighest:t})=>t?"#e02e39":"#33414d"};

  padding-bottom: 50px;
  margin-bottom: 30px;
`,_C=()=>e.jsxs(Ue,{style:{padding:0},children:[e.jsx(WC,{}),e.jsx(Dp,{children:e.jsx(Rp,{children:e.jsxs(Ap,{children:[e.jsx(L,{width:300,inline:!0}),e.jsx("small",{children:e.jsx(L,{width:100})})]})})})]}),HC=()=>{const{data:t,isFetching:n}=Tp(),{data:s,isFetching:o}=Fp(),{data:i,isFetching:r}=qr(),a=(n||o||r)&&(!t||!s||!i);return e.jsxs(e.Fragment,{children:[e.jsx(Q,{id:"survey-results",label:u("Surveys & Polls"),url:"/forms"}),a&&e.jsx(_C,{}),!a&&e.jsx("div",{id:"content",className:"content-pane",style:{padding:0},children:e.jsxs(Dp,{$highlightHighest:!0,children:[e.jsx(K$,{}),e.jsx(PC,{})]})})]})},UC=t=>e.jsx(R,{height:"1em",viewBox:"0 0 512 512",...t,children:e.jsx("path",{d:"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"})}),qC=()=>{const t=G({from:{opacity:0,scale:0},to:{opacity:1,scale:1}}),n=lt(),s=G({ref:n,from:{opacity:0,scale:0},to:{opacity:1,scale:1},config:{tension:300}}),o=lt(),i=Ho(5,{ref:o,from:{opacity:0,x:-30,y:10},to:{opacity:1,x:0,y:0},config:{tension:300}}),r=lt(),a=G({ref:r,from:{opacity:0,scale:0,x:-30,y:10},to:{opacity:1,scale:1,x:0,y:0},config:{tension:200}}),l=lt(),d=G({ref:l,from:{opacity:0,scale:.6,x:30,y:-40},to:{opacity:1,scale:1,x:0,y:0},config:{tension:130}}),h=lt(),x=Ho(8,{ref:h,from:{opacity:0,scale:1.05},to:{opacity:1,scale:1}});return ql([n,o,r,l,h],[0,.8,.6,1,.8]),{background:t,border:s,lines:i,check:a,pencil:d,letters:x}},Ct=c(W.path)`
  transform-origin: 54px;
`,QC=()=>{const{border:t,lines:n,check:s,pencil:o,letters:i}=qC();return e.jsxs("svg",{version:"1.1",xmlns:"http://www.w3.org/2000/svg",x:"0",y:"0",width:"581",height:"121",viewBox:"0, 0, 581, 121",children:[e.jsx("title",{children:"Logo"}),e.jsxs("g",{children:[e.jsx(W.path,{style:i[0],d:"M137.033,21 L137.033,97.284 L153.807,97.284 L153.807,65.766 L185.752,65.766 L185.752,52.732 L153.807,52.732 L153.807,35.103 L190.667,35.103 L190.667,21 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[1],d:"M196.65,42.047 L196.65,97.284 L211.821,97.284 L211.821,72.39 Q211.821,68.651 212.569,65.445 Q213.317,62.24 215.08,59.836 Q216.842,57.432 219.727,56.044 Q222.612,54.655 226.779,54.655 Q228.167,54.655 229.663,54.815 Q231.159,54.975 232.227,55.189 L232.227,41.086 Q230.411,40.552 228.915,40.552 Q226.031,40.552 223.36,41.406 Q220.689,42.261 218.338,43.81 Q215.988,45.36 214.171,47.55 Q212.355,49.74 211.287,52.304 L211.073,52.304 L211.073,42.047 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[2],d:"M273.468,63.736 L248.788,63.736 Q248.894,62.133 249.482,60.103 Q250.07,58.074 251.512,56.257 Q252.954,54.441 255.358,53.212 Q257.762,51.984 261.395,51.984 Q266.95,51.984 269.675,54.975 Q272.399,57.967 273.468,63.736 z M248.788,73.352 L288.639,73.352 Q289.066,66.941 287.571,61.065 Q286.075,55.189 282.709,50.595 Q279.344,46.001 274.109,43.276 Q268.874,40.552 261.822,40.552 Q255.518,40.552 250.337,42.795 Q245.155,45.039 241.416,48.939 Q237.676,52.838 235.646,58.18 Q233.616,63.522 233.616,69.719 Q233.616,76.129 235.593,81.471 Q237.569,86.813 241.202,90.66 Q244.834,94.506 250.07,96.589 Q255.305,98.673 261.822,98.673 Q271.224,98.673 277.848,94.399 Q284.472,90.126 287.677,80.189 L274.322,80.189 Q273.574,82.754 270.262,85.051 Q266.95,87.348 262.356,87.348 Q255.946,87.348 252.527,84.036 Q249.108,80.724 248.788,73.352 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[3],d:"M334.794,63.736 L310.114,63.736 Q310.221,62.133 310.808,60.103 Q311.396,58.074 312.838,56.257 Q314.281,54.441 316.684,53.212 Q319.088,51.984 322.721,51.984 Q328.277,51.984 331.001,54.975 Q333.725,57.967 334.794,63.736 z M310.114,73.352 L349.965,73.352 Q350.392,66.941 348.897,61.065 Q347.401,55.189 344.035,50.595 Q340.67,46.001 335.435,43.276 Q330.2,40.552 323.148,40.552 Q316.845,40.552 311.663,42.795 Q306.481,45.039 302.742,48.939 Q299.002,52.838 296.972,58.18 Q294.942,63.522 294.942,69.719 Q294.942,76.129 296.919,81.471 Q298.896,86.813 302.528,90.66 Q306.161,94.506 311.396,96.589 Q316.631,98.673 323.148,98.673 Q332.55,98.673 339.174,94.399 Q345.798,90.126 349.004,80.189 L335.649,80.189 Q334.901,82.754 331.589,85.051 Q328.277,87.348 323.682,87.348 Q317.272,87.348 313.853,84.036 Q310.434,80.724 310.114,73.352 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[4],d:"M362.252,52.197 L362.252,97.284 L377.423,97.284 L377.423,52.197 L387.893,52.197 L387.893,42.047 L377.423,42.047 L377.423,38.735 Q377.423,35.317 378.759,33.874 Q380.094,32.432 383.192,32.432 Q386.077,32.432 388.748,32.752 L388.748,21.427 Q386.825,21.321 384.795,21.16 Q382.765,21 380.735,21 Q371.44,21 366.846,25.701 Q362.252,30.402 362.252,37.774 L362.252,42.047 L353.17,42.047 L353.17,52.197 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[5],d:"M405.842,69.719 Q405.842,66.407 406.484,63.202 Q407.125,59.997 408.674,57.539 Q410.223,55.082 412.787,53.533 Q415.351,51.984 419.197,51.984 Q423.044,51.984 425.661,53.533 Q428.279,55.082 429.828,57.539 Q431.377,59.997 432.018,63.202 Q432.659,66.407 432.659,69.719 Q432.659,73.031 432.018,76.183 Q431.377,79.335 429.828,81.845 Q428.279,84.356 425.661,85.852 Q423.044,87.348 419.197,87.348 Q415.351,87.348 412.787,85.852 Q410.223,84.356 408.674,81.845 Q407.125,79.335 406.484,76.183 Q405.842,73.031 405.842,69.719 z M390.671,69.719 Q390.671,76.343 392.701,81.685 Q394.731,87.027 398.471,90.82 Q402.21,94.613 407.445,96.643 Q412.68,98.673 419.197,98.673 Q425.715,98.673 431.003,96.643 Q436.292,94.613 440.031,90.82 Q443.771,87.027 445.801,81.685 Q447.831,76.343 447.831,69.719 Q447.831,63.095 445.801,57.7 Q443.771,52.304 440.031,48.511 Q436.292,44.719 431.003,42.635 Q425.715,40.552 419.197,40.552 Q412.68,40.552 407.445,42.635 Q402.21,44.719 398.471,48.511 Q394.731,52.304 392.701,57.7 Q390.671,63.095 390.671,69.719 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[6],d:"M454.455,42.048 L454.455,97.284 L469.626,97.284 L469.626,72.39 Q469.626,68.651 470.374,65.445 Q471.122,62.24 472.885,59.836 Q474.647,57.432 477.532,56.044 Q480.417,54.655 484.584,54.655 Q485.973,54.655 487.468,54.815 Q488.964,54.975 490.032,55.189 L490.032,41.086 Q488.216,40.552 486.72,40.552 Q483.836,40.552 481.165,41.406 Q478.494,42.261 476.143,43.81 Q473.793,45.36 471.976,47.55 Q470.16,49.74 469.092,52.304 L468.878,52.304 L468.878,42.048 z",fill:"#058FFE"}),e.jsx(W.path,{style:i[7],d:"M495.374,42.048 L495.374,97.284 L510.546,97.284 L510.546,65.232 Q510.546,61.172 511.721,58.661 Q512.896,56.15 514.552,54.815 Q516.208,53.479 517.971,52.999 Q519.734,52.518 520.802,52.518 Q524.435,52.518 526.305,53.746 Q528.174,54.975 528.976,57.005 Q529.777,59.035 529.884,61.439 Q529.991,63.843 529.991,66.3 L529.991,97.284 L545.162,97.284 L545.162,66.514 Q545.162,63.95 545.536,61.439 Q545.91,58.928 547.032,56.952 Q548.153,54.975 550.13,53.746 Q552.107,52.518 555.312,52.518 Q558.517,52.518 560.387,53.586 Q562.256,54.655 563.218,56.471 Q564.179,58.287 564.393,60.745 Q564.607,63.202 564.607,65.98 L564.607,97.284 L579.778,97.284 L579.778,60.317 Q579.778,54.975 578.282,51.182 Q576.787,47.39 574.116,45.039 Q571.445,42.689 567.705,41.62 Q563.966,40.552 559.585,40.552 Q553.816,40.552 549.596,43.33 Q545.376,46.107 542.918,49.74 Q540.675,44.612 536.348,42.582 Q532.021,40.552 526.785,40.552 Q521.337,40.552 517.116,42.902 Q512.896,45.253 509.905,49.526 L509.691,49.526 L509.691,42.048 z",fill:"#058FFE"})]}),e.jsxs("g",{id:"Icon",children:[e.jsx(Ct,{d:"M37.733,7.573 C55.513,2.825 47.779,4.886 60.934,1.383 C80.646,-3.783 84.832,11.631 86.256,16.656 C87.101,19.715 87.92,22.783 88.745,25.849 L85.369,38.445 C83.528,31.673 81.754,24.879 79.792,18.139 C76.822,8.231 72.783,5.365 62.066,7.864 C51.792,10.635 21.478,18.709 17.585,19.799 C11.439,21.553 4.764,24.906 7.901,37.117 C11.018,48.771 19.883,81.843 25.077,101.227 C28.75,115.347 36.616,113.524 42.797,112.213 C48.227,110.805 80.511,102.152 87.394,100.239 C97.952,97.304 99.482,91.737 96.984,82.088 L96.172,79.022 L99.583,66.297 C100.842,71.007 102.101,75.718 103.362,80.43 C108.373,99.17 97.473,104.01 88.881,106.717 C84.227,107.978 61.961,113.94 44.895,118.509 C24.877,123.994 20.294,108.418 18.819,103.009 C17.345,97.601 5.001,51.486 1.65,38.898 C-3.671,19.308 11.334,14.782 15.79,13.503 C23.093,11.484 30.416,9.537 37.733,7.573 z",fill:"#058FFE",id:"border",style:t}),e.jsx(Ct,{d:"M104.977,7.117 C108.112,7.879 110.08,10.598 109.31,13.474 C108.542,16.35 91.847,77.975 91.847,77.975 L91.847,77.975 C89.16,81.646 86.473,85.314 83.803,88.997 C83.337,89.641 82.479,89.421 82.424,88.571 L80.556,74.918 C80.556,74.918 97.237,13.309 98.025,10.419 C98.816,7.528 101.842,6.355 104.977,7.117 z",fill:"#FF6624",id:"Pencil",style:o}),e.jsx(Ct,{d:"M38.47,86.147 L49.9,83.086 C52.694,82.336 55.566,83.996 56.316,86.791 L56.662,88.087 C57.412,90.881 55.754,93.755 52.959,94.503 L41.53,97.567 C38.735,98.314 35.863,96.656 35.113,93.861 L34.767,92.564 C34.017,89.769 35.675,86.897 38.47,86.147 z",fill:"#058FFE",style:n[4],id:"line-5"}),e.jsx(Ct,{d:"M47.091,29.664 L67.805,24.115 C69.255,23.726 70.748,24.588 71.137,26.038 L71.137,26.038 C71.526,27.491 70.665,28.982 69.212,29.371 L48.5,34.919 C47.048,35.309 45.557,34.449 45.168,32.997 L45.168,32.997 C44.779,31.546 45.64,30.053 47.091,29.664 z",fill:"#058FFE",style:n[0],id:"line-1"}),e.jsx(Ct,{d:"M50.488,42.34 L71.2,36.789 C72.653,36.4 74.144,37.262 74.533,38.714 L74.533,38.714 C74.922,40.165 74.06,41.656 72.61,42.045 L51.896,47.596 C50.445,47.985 48.952,47.123 48.563,45.673 L48.563,45.673 C48.176,44.22 49.036,42.729 50.488,42.34 z",fill:"#058FFE",style:n[1],id:"line-2"}),e.jsx(Ct,{d:"M29.263,61.61 L74.5,49.49 C75.975,49.095 77.484,49.95 77.873,51.403 L77.873,51.403 C78.262,52.853 77.382,54.35 75.908,54.745 L30.673,66.865 C29.198,67.261 27.686,66.405 27.297,64.955 L27.297,64.955 C26.908,63.502 27.79,62.005 29.263,61.61 z",fill:"#058FFE",style:n[2],id:"line-3"}),e.jsx(Ct,{d:"M78.949,61.938 L79.149,62.052 L77.635,67.703 L34.027,79.387 C32.553,79.782 31.041,78.926 30.652,77.474 C30.263,76.024 31.143,74.526 32.618,74.131 L77.855,62.009 L78.949,61.938 z",fill:"#058FFE",style:n[3],id:"line-4"}),e.jsx(W.path,{d:"M34.899,32.962 C36.525,32.528 38.197,33.492 38.633,35.119 L41.886,47.264 C42.322,48.889 41.357,50.561 39.731,50.997 L27.587,54.25 C25.959,54.686 24.289,53.721 23.853,52.095 L20.598,39.951 C20.162,38.323 21.127,36.653 22.753,36.217 L34.899,32.962 z M33.61,37.352 L26.065,39.372 C25.252,39.59 24.769,40.427 24.987,41.24 L27.008,48.785 C27.226,49.598 28.063,50.081 28.876,49.863 L36.419,47.84 C37.234,47.622 37.716,46.787 37.498,45.974 L35.476,38.429 C35.258,37.616 34.423,37.134 33.61,37.352 z",fill:"#058FFE",id:"check",style:s})]})]})},KC=()=>{const t=G({from:{opacity:0,scale:.5},to:{opacity:1,scale:1},delay:1e3}),n=lt(),s=G({ref:n,from:{opacity:0,y:10},to:{opacity:1,y:0},delay:1e3}),o=lt(),i=G({ref:o,from:{opacity:0,y:10},to:{opacity:1,y:0}}),r=lt(),a=Ho(4,{ref:r,from:{opacity:0,y:20},to:{opacity:1,y:0}});return ql([n,o,r],[0,2,2.2]),{installed:{icon:t,text:s},extra:i,buttons:a}},VC=c.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  height: 80vh;
  padding: 40px;

  background-color: ${p.white};
  border-radius: ${k.lg};
  box-shadow: ${oe.panel}, ${oe.box};
`,GC=c.div``,YC=c.div`
  display: flex;
  align-items: center;
  gap: ${f.sm};

  margin-top: 20px;

  font-size: 22px;
  fill: ${p.teal500};
`,JC=c(W.div)`
  font-size: 30px;
`,ZC=c(W.div)``,XC=c(W.div)`
  max-width: 60%;
  margin-top: 20px;

  color: ${p.gray400};
  font-style: italic;
  text-align: center;
`,ek=c.div`
  display: flex;
  justify-content: center;
  gap: ${f.sm};

  margin-top: 40px;
`,Fs=c(W.div)`
  a {
    color: inherit;
    text-decoration: none;
  }
`,tk=()=>{const{installed:t,extra:n,buttons:s}=KC();return e.jsxs(VC,{children:[e.jsx(Q,{id:"welcome",label:"Welcome",url:"/forms"}),e.jsx(GC,{children:e.jsx(QC,{})}),e.jsxs(YC,{children:[e.jsx(JC,{style:t.icon,children:e.jsx(UC,{})}),e.jsx(ZC,{style:t.text,children:e.jsx("span",{children:u("Awesome! Freeform is successfully installed!")})})]}),e.jsx(XC,{style:n,children:u("Thanks for choosing Freeform! Craft will automatically set you up with the free Express edition. If you're excited to explore even more features, consider switching to the Lite or Pro edition! We've included some helpful links below to get you started. Enjoy!")}),e.jsxs(ek,{children:[e.jsx(Fs,{style:s[0],className:"btn",children:e.jsx(pe,{to:"/forms",children:u("Create Forms")})}),e.jsx(Fs,{style:s[2],className:"btn",children:e.jsx("a",{href:ve("/settings/demo-templates"),children:u("Install Demo")})}),e.jsx(Fs,{style:s[1],className:"btn",children:e.jsx("a",{href:"https://docs.solspace.com/craft/freeform/v5/guides/getting-started/",children:u("Getting Started")})}),e.jsx(Fs,{style:s[1],className:"btn submit",children:e.jsx("a",{href:ve("/settings"),children:u("Configure Freeform")})})]})]})},nk=zi`
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
`,zl="#cccccc",Ts="3px",sk=zi`
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

        border: 1px solid ${zl};
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
          border-left: 1px solid ${zl};

          border-top-left-radius: ${Ts};
          border-bottom-left-radius: ${Ts};
        }

        &:last-child {
          border-top-right-radius: ${Ts};
          border-bottom-right-radius: ${Ts};
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
`,ok=()=>e.jsxs(e.Fragment,{children:[e.jsx(nk,{}),e.jsx(sk,{})]}),ik=new URLSearchParams(window.location.search),Nl=ik.get("mode")==="debug",rk={blue:"color: #068FFE",reset:""},Ml=new Proxy(console,{get:(t,n)=>n==="colors"?rk:n==="dbg"?Nl?(...s)=>{t.log("🀄️🔆🔆🔆🀄️",...s)}:()=>{}:typeof t[n]=="function"&&!Nl?()=>{}:t[n]}),ak=document.getElementById("freeform-client"),lk=_l.createRoot(ak);Ml.log(`%c
  ███████╗██████╗ ███████╗███████╗███████╗ ██████╗ ██████╗ ███╗   ███╗
  ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║
  █████╗  ██████╔╝█████╗  █████╗  █████╗  ██║   ██║██████╔╝██╔████╔██║
  ██╔══╝  ██╔══██╗██╔══╝  ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║
  ██║     ██║  ██║███████╗███████╗██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
`,Ml.colors.blue);lk.render(e.jsx(w1,{backend:$1,children:e.jsx(C1,{basename:ve("/",!1),children:e.jsx(k1,{client:G1,children:e.jsx(I1,{children:e.jsx(W1,{children:e.jsx(H1,{children:e.jsx(B1,{children:e.jsx(S1,{store:sh,children:e.jsx(J1,{children:e.jsxs(tc,{children:[e.jsx(Q,{id:"root",label:"Freeform",url:"/forms"}),e.jsx(ok,{}),null,e.jsx(O1,{}),e.jsx(Ul,{children:e.jsxs(U,{path:"/",element:e.jsx(fh,{}),children:[e.jsxs(U,{path:"forms",children:[e.jsx(U,{path:":formId/*",element:e.jsx(vv,{})}),e.jsx(U,{index:!0,element:e.jsx(B9,{})})]}),e.jsx(U,{path:"/surveys/:handle",element:e.jsx(HC,{})}),e.jsx(U,{path:"welcome",element:e.jsx(tk,{})}),e.jsxs(U,{path:"integrations",element:e.jsx(Gw,{}),children:[e.jsx(U,{index:!0,element:e.jsx(T$,{})}),e.jsx(U,{path:":type/:integration/:id?",element:e.jsx(F$,{})})]}),e.jsxs(U,{path:"import",element:e.jsx(xl,{}),children:[e.jsx(U,{path:"forms",element:e.jsx(zw,{})}),e.jsx(U,{path:"express-forms",element:e.jsx(Sw,{})}),e.jsx(U,{path:"formie/v3",element:e.jsx(Fw,{})})]}),e.jsx(U,{path:"export",element:e.jsx(xl,{}),children:e.jsx(U,{path:"forms",element:e.jsx(ww,{})})}),e.jsxs(U,{path:"settings/limited-users",children:[e.jsx(U,{path:":id",element:e.jsx(q$,{})}),e.jsx(U,{index:!0,element:e.jsx(O$,{})})]}),e.jsx(U,{path:"ab-tests",element:e.jsx(ix,{})})]})})]})})})})})})})})})}));
