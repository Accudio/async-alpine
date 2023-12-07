var d=Object.defineProperty;var y=e=>d(e,"__esModule",{value:!0});var v=(e,t)=>{y(e);for(var i in t)d(e,i,{get:t[i],enumerable:!0})};var a={};v(a,{eager:()=>h,event:()=>f,idle:()=>c,media:()=>_,visible:()=>m});var A=()=>!0,h=A;var b=({component:e,argument:t})=>new Promise(i=>{if(t)window.addEventListener(t,()=>i(),{once:!0});else{let s=n=>{n.detail.id===e.id&&(window.removeEventListener("async-alpine:load",s),i())};window.addEventListener("async-alpine:load",s)}}),f=b;var $=()=>new Promise(e=>{"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)}),c=$;var E=({argument:e})=>new Promise(t=>{if(!e)return console.log("Async Alpine: media strategy requires a media query. Treating as 'eager'"),t();let i=window.matchMedia(`(${e})`);i.matches?t():i.addEventListener("change",t,{once:!0})}),_=E;var q=({component:e,argument:t})=>new Promise(i=>{let s=t||"0px 0px 0px 0px",n=new IntersectionObserver(o=>{o[0].isIntersecting&&(n.disconnect(),i())},{rootMargin:s});n.observe(e.el)}),m=q;function u(e){let t=P(e),i=x(t);return i.type==="method"?{type:"expression",operator:"&&",parameters:[i]}:i}function P(e){let t=/\s*([()])\s*|\s*(\|\||&&|\|)\s*|\s*((?:[^()&|]+\([^()]+\))|[^()&|]+)\s*/g,i=[],s;for(;(s=t.exec(e))!==null;){let[,n,o,r]=s;if(n!==void 0)i.push({type:"parenthesis",value:n});else if(o!==void 0)i.push({type:"operator",value:o==="|"?"&&":o});else{let p={type:"method",method:r.trim()};r.includes("(")&&(p.method=r.substring(0,r.indexOf("(")).trim(),p.argument=r.substring(r.indexOf("(")+1,r.indexOf(")"))),r.method==="immediate"&&(r.method="eager"),i.push(p)}}return i}function x(e){let t=g(e);for(;e.length>0&&(e[0].value==="&&"||e[0].value==="|"||e[0].value==="||");){let i=e.shift().value,s=g(e);t.type==="expression"&&t.operator===i?t.parameters.push(s):t={type:"expression",operator:i,parameters:[t,s]}}return t}function g(e){if(e[0].value==="("){e.shift();let t=x(e);return e[0].value===")"&&e.shift(),t}else return e.shift()}var w="__internal_",l={Alpine:null,_options:{prefix:"ax-",alpinePrefix:"x-",root:"load",inline:"load-src",defaultStrategy:"eager"},_alias:!1,_data:{},_realIndex:0,get _index(){return this._realIndex++},init(e,t={}){return this.Alpine=e,this._options={...this._options,...t},this},start(){return this._processInline(),this._setupComponents(),this._mutations(),this},data(e,t=!1){return this._data[e]={loaded:!1,download:t},this},url(e,t){!e||!t||(this._data[e]||this.data(e),this._data[e].download=()=>import(this._parseUrl(t)))},alias(e){this._alias=e},_processInline(){let e=document.querySelectorAll(`[${this._options.prefix}${this._options.inline}]`);for(let t of e)this._inlineElement(t)},_inlineElement(e){let t=e.getAttribute(`${this._options.alpinePrefix}data`),i=e.getAttribute(`${this._options.prefix}${this._options.inline}`);if(!t||!i)return;let s=this._parseName(t);this.url(s,i)},_setupComponents(){let e=document.querySelectorAll(`[${this._options.prefix}${this._options.root}]`);for(let t of e)this._setupComponent(t)},_setupComponent(e){let t=e.getAttribute(`${this._options.alpinePrefix}data`);e.setAttribute(`${this._options.alpinePrefix}ignore`,"");let i=this._parseName(t),s=e.getAttribute(`${this._options.prefix}${this._options.root}`)||this._options.defaultStrategy;this._componentStrategy({name:i,strategy:s,el:e,id:e.id||this._index})},async _componentStrategy(e){let t=u(e.strategy);await this._generateRequirements(e,t),await this._download(e.name),this._activate(e)},_generateRequirements(e,t){if(t.type==="expression"){if(t.operator==="&&")return Promise.all(t.parameters.map(i=>this._generateRequirements(e,i)));if(t.operator==="||")return Promise.any(t.parameters.map(i=>this._generateRequirements(e,i)))}return a[t.method]?a[t.method]({component:e,argument:t.argument}):!1},async _download(e){if(e.startsWith(w)||(this._handleAlias(e),!this._data[e]||this._data[e].loaded))return;let t=await this._getModule(e);this.Alpine.data(e,t),this._data[e].loaded=!0},async _getModule(e){if(!this._data[e])return;let t=await this._data[e].download(e);return typeof t=="function"?t:t[e]||t.default||Object.values(t)[0]||!1},_activate(e){e.el.removeAttribute(`${this._options.alpinePrefix}ignore`),e.el._x_ignore=!1,this.Alpine.initTree(e.el)},_mutations(){new MutationObserver(t=>{for(let i of t)if(!!i.addedNodes)for(let s of i.addedNodes){if(s.nodeType!==1)continue;s.hasAttribute(`${this._options.prefix}${this._options.root}`)&&this._mutationEl(s),s.querySelectorAll(`[${this._options.prefix}${this._options.root}]`).forEach(o=>this._mutationEl(o))}}).observe(document,{attributes:!0,childList:!0,subtree:!0})},_mutationEl(e){e.hasAttribute(`${this._options.prefix}${this._options.inline}`)&&this._inlineElement(e),this._setupComponent(e)},_handleAlias(e){if(!(!this._alias||this._data[e])){if(typeof this._alias=="function"){this.data(e,this._alias);return}this.url(e,this._alias.replace("[name]",e))}},_parseName(e){return(e||"").split(/[({]/g)[0]||`${w}${this._index}`},_parseUrl(e){return new RegExp("^(?:[a-z+]+:)?//","i").test(e)?e:new URL(e,document.baseURI).href}};document.addEventListener("alpine:init",()=>{window.AsyncAlpine=l,l.init(Alpine,window.AsyncAlpineOptions||{}),document.dispatchEvent(new CustomEvent("async-alpine:init")),l.start()});
