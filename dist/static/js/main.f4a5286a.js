(()=>{"use strict";var e,t,i,o,r={5(e,t,i){let o,r,n,s,a,l,d;i(702),i(229);var c,p,u,h,g,f,w,m,b,x,y,v,E,S,_,I,C,N,O=i(988),k=i(376);let A={enabled:!0,minLevel:"debug",maxEntries:500,redactKeys:["password","token","secret","authorization","cookie"]},T={debug:10,info:20,warn:30,error:40,silent:99};c=(0,k.Injectable)({providedIn:"root"});class D{static #e={c:[o,p]}=(0,O._)(this,[],[c]);options=A;sequence=0;entries=[];sinks=new Set;configure(e){this.options={...this.options,...e,redactKeys:e.redactKeys??this.options.redactKeys}}shouldLog(e){return!!this.options.enabled&&T[e]>=T[this.options.minLevel]}emit(e){let t={...e,id:++this.sequence,timestamp:new Date().toISOString()};for(let e of(this.entries.push(t),this.entries.length>this.options.maxEntries&&this.entries.shift(),this.sinks))e(t)}sanitize(e){return function e(t,i){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(o>4)return"[Truncated]";if(null==t||"number"==typeof t||"boolean"==typeof t)return t;if("string"==typeof t)return t.length>2e3?`${t.slice(0,2e3)}…`:t;if(t instanceof Error)return{name:t.name,message:t.message,stack:t.stack};if(Array.isArray(t))return t.map(t=>e(t,i,o+1));if("object"==typeof t){let r={};for(let[n,s]of Object.entries(t))r[n]=i.has(n.toLowerCase())?"[REDACTED]":e(s,i,o+1);return r}return String(t)}(e,new Set(this.options.redactKeys.map(e=>e.toLowerCase())))}snapshot(){return[...this.entries]}clear(){this.entries=[]}addSink(e){this.sinks.add(e)}removeSink(e){this.sinks.delete(e)}consoleSink(e){let t="debug"===e.level?"debug":"info"===e.level?"info":e.level,i=`[${e.timestamp}] [${e.level.toUpperCase()}] [${e.namespace}]`;e.error?console[t](`${i} ${e.message}`,e.context,e.error):console[t](`${i} ${e.message}`,e.context)}backendSink(e){try{if("u">typeof window){let t=window;if("function"==typeof t.log_message){let i={message:e.message,level:e.level.toUpperCase(),meta:e.context,category:e.namespace,session_id:"frontend",frontend_timestamp:e.timestamp};t.log_message(JSON.stringify(i))}}}catch{}}enableConsoleSink(){this.addSink(this.consoleSink.bind(this))}enableBackendSink(){this.addSink(this.backendSink.bind(this))}static #t=p()}class B{backend;namespace;baseContext;constructor(e,t,i={}){this.backend=e,this.namespace=t,this.baseContext=i}child(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return new B(this.backend,`${this.namespace}.${e}`,{...this.baseContext,...t})}withContext(e){return new B(this.backend,this.namespace,{...this.baseContext,...e})}debug(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.log("debug",e,t)}info(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};this.log("info",e,t)}warn(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2?arguments[2]:void 0;this.log("warn",e,t,i)}error(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2?arguments[2]:void 0;this.log("error",e,t,i)}log(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o=arguments.length>3?arguments[3]:void 0;if(!this.backend.shouldLog(e))return;let r=function(e){if(null!=e)return e instanceof Error?{name:e.name,message:e.message,stack:e.stack}:{name:"UnknownError",message:"string"==typeof e?e:JSON.stringify(e)}}(o),n=this.backend.sanitize({...this.baseContext,...i});this.backend.emit({level:e,namespace:this.namespace,message:t,context:n,error:r})}}let R=new o,z=(R.enableConsoleSink(),new B(R,"frontend"));function W(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return e?z.child(e,t):z.withContext(t)}let L=W("winbox");"u">typeof window&&window.WinBox?L.debug("WinBox loaded and available on window.WinBox"):L.warn("WinBox was imported but not found on window object");var F=i(723);u=(0,k.Injectable)({providedIn:"root"});class U{static #e={c:[r,h]}=(0,O._)(this,[],[u]);subscriptions=new Map;anySubscriptions=new Map;history=[];nextId=1;enabled=(0,k.signal)(!0);namespace="app";maxHistory=300;isEnabled=this.enabled.asReadonly();init(e,t){this.namespace=e,this.maxHistory=t}setEnabled(e){this.enabled.set(e)}subscribe(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o=this.nextId++,r=this.subscriptions.get(e)??new Map;if(r.set(o,{id:o,once:!!i.once,handler:t}),this.subscriptions.set(e,r),i.replayLast){let i=this.getLast(e);if(i)try{t(i.payload,i)}catch{}}return()=>{let t=this.subscriptions.get(e);t?.delete(o),t&&0===t.size&&this.subscriptions.delete(e)}}once(e,t){return this.subscribe(e,t,{once:!0})}subscribeAny(e){let t=this.nextId++;return this.anySubscriptions.set(t,e),()=>{this.anySubscriptions.delete(t)}}publish(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!this.enabled())return;let o={id:this.nextId++,name:e,payload:t,timestamp:Date.now()};this.pushHistory(o);let r=()=>{let i=this.subscriptions.get(e);if(i){for(let[e,r]of i.entries()){try{r.handler(t,o)}catch{}r.once&&i.delete(e)}0===i.size&&this.subscriptions.delete(e)}for(let[,e]of this.anySubscriptions)try{e(o)}catch{}};i.async?queueMicrotask(r):r()}getHistory(e,t){let i=this.history;return e&&(i=i.filter(t=>t.name===e)),"number"==typeof t&&t>0&&(i=i.slice(-t)),i}getLast(e){for(let t=this.history.length-1;t>=0;t--){let i=this.history[t];if(i.name===e)return i}}clearHistory(){this.history=[]}clearAllSubscriptions(){this.subscriptions.clear(),this.anySubscriptions.clear()}stats(){let e=0;for(let t of this.subscriptions.values())e+=t.size;return{enabled:this.enabled(),listeners:e,anyListeners:this.anySubscriptions.size,historySize:this.history.length}}pushHistory(e){this.history.push(e),this.history.length>this.maxHistory&&this.history.shift()}static #t=h()}g=(0,k.Injectable)({providedIn:"root"});class ${static #e={c:[n,f]}=(0,O._)(this,[],[g]);constructor(){const e=window;this.eventBus=e.__FRONTEND_EVENT_BUS__??new r}logger=W("error.service");sequence=0;eventBus;activeError=(0,k.signal)(null);report(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=this.createErrorState(e,t);return this.activeError.set(i),this.publishErrorEvent(i),this.logError(i,e),i}handleResult(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return!0===e.ok?e.value:(this.report(e.error,t),null)}handleResultWith(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if(!0===e.ok)return{ok:!0,value:e.value};let o=t(e.error);return this.report(o,i),{ok:!1,error:o}}fromException(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"UNKNOWN";return e instanceof Error?{code:t,message:e.message,details:e.stack}:"string"==typeof e?{code:t,message:e}:{code:t,message:"An unknown error occurred",details:JSON.stringify(e)}}validationError(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return this.report({code:"VALIDATION_FAILED",message:t,field:e},i)}notFoundError(e,t){let i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o={code:"RESOURCE_NOT_FOUND",message:`${e} not found: ${t}`,context:{resource:e,id:String(t)}};return this.report(o,i)}dismiss(){let e=this.activeError();e&&this.logger.info("Root error dismissed",{id:e.id,source:e.source}),this.activeError.set(null)}hasError(){return null!==this.activeError()}getCurrentErrorCode(){let e=this.activeError();return e?.error.code??null}isErrorCode(e){return this.getCurrentErrorCode()===e}createErrorState(e,t){var i;let o=new Date().toISOString(),r=t.source??"unknown",n=t.title??this.getDefaultTitle(e.code),s=(i=e).field&&"VALIDATION_FAILED"===i.code?`${i.field}: ${i.message}`:"DB_ALREADY_EXISTS"===i.code?i.message||"This item already exists.":"RESOURCE_NOT_FOUND"===i.code||"DB_NOT_FOUND"===i.code||"USER_NOT_FOUND"===i.code||"ENTITY_NOT_FOUND"===i.code?i.message||"The requested item was not found.":"DB_CONNECTION_FAILED"===i.code?"Unable to connect to the database. Please check your connection and try again.":"DB_QUERY_FAILED"===i.code?i.message?.includes("duplicate")?"A record with this information already exists.":i.message?.includes("constraint")?"This operation would violate a database rule.":"A database operation failed. Please try again.":"DB_CONSTRAINT_VIOLATION"===i.code?"This action would violate a data rule. Please check your input.":"CONFIG_NOT_FOUND"===i.code?"Configuration not found. Please check your settings.":"CONFIG_INVALID"===i.code?"Invalid configuration. Please review your settings.":"CONFIG_MISSING_FIELD"===i.code?i.message||"Required configuration is missing.":"SERIALIZATION_FAILED"===i.code||"DESERIALIZATION_FAILED"===i.code?"Failed to process data. Please check your input and try again.":"INVALID_FORMAT"===i.code?i.message||"The data format is invalid.":"VALIDATION_FAILED"===i.code?i.message||"Validation failed. Please check your input.":"MISSING_REQUIRED_FIELD"===i.code?i.message||"A required field is missing.":"INVALID_FIELD_VALUE"===i.code?i.message||"A field contains an invalid value.":"INTERNAL_ERROR"===i.code||"LOCK_POISONED"===i.code?i.message&&!i.message.includes("stack")?i.message:i.context&&i.context.operation?`Failed to ${i.context.operation}. Please try again.`:"An unexpected error occurred. Please try again. If the problem persists, check the technical details below.":"UNKNOWN"===i.code?i.message&&i.message.length<200?i.message:"An unknown error occurred. Please check the technical details for more information.":i.message||"An error occurred. Please try again.";return{id:++this.sequence,error:e,title:n,userMessage:s,source:r,timestamp:o}}getDefaultTitle(e){switch(e){case"VALIDATION_FAILED":return"Validation Error";case"RESOURCE_NOT_FOUND":case"USER_NOT_FOUND":case"ENTITY_NOT_FOUND":return"Not Found";case"DB_ALREADY_EXISTS":return"Already Exists";case"INTERNAL_ERROR":case"LOCK_POISONED":return"System Error";default:return"Error"}}publishErrorEvent(e){this.eventBus.publish("error:captured",{id:e.id,source:e.source,title:e.title,code:e.error.code,message:e.error.message,field:e.error.field})}logError(e,t){this.logger.error("Root error captured",{id:e.id,source:e.source,title:e.title,timestamp:e.timestamp,code:t.code},t)}static #t=f()}class M{injector=(0,k.inject)(k.Injector);handleError(e){this.logToConsole("ERROR",e);let t=this.injector.get(n),i=this.extractErrorValue(e);t.report(i,{source:"angular",title:this.extractTitle(e)})}logToConsole(e,t){let i=new Date().toISOString(),o=`%c[${i}] [${e}]`;t instanceof Error?console.error(o,"color: #ff4444; font-weight: bold;",`
┌──────────────────────────────────────────────────────────────┐
│ Angular Error Handler                                             │
├──────────────────────────────────────────────────────────────┤
│ Type: ${t.name}
│ Message: ${t.message}
│ Stack: ${t.stack?.split("\n").slice(0,5).join("\n│ ")||"N/A"}
└──────────────────────────────────────────────────────────────┘`):"string"==typeof t?console.error(o,"color: #ff4444; font-weight: bold;",`
${t}`):console.error(o,"color: #ff4444; font-weight: bold;","\nUnknown error:",t)}extractErrorValue(e){if(e instanceof Error)return"HttpErrorResponse"===e.name?{code:this.mapHttpCodeToErrorCode(e.status),message:e.message||"Network request failed",details:e.error?.details||e.stack,context:{status:String(e.status),url:e.url||"unknown"}}:{code:"INTERNAL_ERROR",message:e.message,details:e.stack};if("string"==typeof e)return{code:this.inferErrorCode(e),message:e};if(e&&"object"==typeof e){if(e.error&&"object"==typeof e.error){let t=e.error;return{code:t.code||"UNKNOWN",message:t.message||"An error occurred",details:t.details,field:t.field,cause:t.cause,context:t.context}}if("string"==typeof e.message)return{code:this.inferErrorCode(e.message),message:e.message,details:e.stack||JSON.stringify(e,null,2)}}return{code:"UNKNOWN",message:"An unknown error occurred",details:"object"==typeof e?JSON.stringify(e):String(e)}}inferErrorCode(e){let t=e.toLowerCase();return t.includes("network")||t.includes("fetch")||t.includes("http")?"DB_CONNECTION_FAILED":t.includes("not found")||t.includes("404")?"RESOURCE_NOT_FOUND":t.includes("validation")||t.includes("invalid")?"VALIDATION_FAILED":t.includes("duplicate")||t.includes("already exists")?"DB_ALREADY_EXISTS":t.includes("permission")||t.includes("unauthorized")||t.includes("forbidden")||t.includes("timeout")?"INTERNAL_ERROR":"UNKNOWN"}mapHttpCodeToErrorCode(e){switch(e){case 400:return"VALIDATION_FAILED";case 401:case 403:case 500:case 502:case 503:return"INTERNAL_ERROR";case 404:return"RESOURCE_NOT_FOUND";case 409:return"DB_ALREADY_EXISTS";default:return"UNKNOWN"}}extractTitle(e){if(e instanceof Error&&"HttpErrorResponse"===e.name){let t=e.status;if(t>=500)return"Server Error";if(t>=400)return"Request Failed"}return"Error"}}var j=i(114);w=(0,k.Injectable)({providedIn:"root"});class H{static #e={c:[s,m]}=(0,O._)(this,[],[w]);constructor(){"u">typeof window&&window.WinBox?(this.winboxConstructor=window.WinBox,this.logger.debug("WinBox found on window object")):this.logger.warn("WinBox not found on window - it should be loaded from static/js/winbox.min.js")}logger=W("winbox.service");winboxConstructor=null;create(e){if(!this.winboxConstructor&&"u">typeof window&&(this.winboxConstructor=window.WinBox),!this.winboxConstructor)return this.logger.error("WinBox constructor not available. Make sure winbox.min.js is loaded."),null;try{let t=new this.winboxConstructor(e);return this.logger.debug("WinBox created",{id:e.id,title:e.title}),t}catch(t){return this.logger.error("Failed to create WinBox",{error:t,options:e}),null}}getConstructor(){return this.winboxConstructor}isAvailable(){return!this.winboxConstructor&&"u">typeof window&&(this.winboxConstructor=window.WinBox),!!this.winboxConstructor}static #t=m()}W("api-client");let V=[{id:1,title:"Angular",description:"A platform for building mobile and desktop web applications with TypeScript.",icon:"\uD83C\uDD70️",color:"#dd0031",content:"<h2>Angular</h2><p>Angular is a platform and framework for building single-page client applications using HTML and TypeScript.</p>"},{id:2,title:"Rsbuild",description:"A high-performance build tool based on Rspack, written in Rust.",icon:"\uD83D\uDE80",color:"#4776e6",content:"<h2>Rsbuild</h2><p>Rsbuild is a high-performance build tool powered by Rspack.</p>"},{id:3,title:"Bun",description:"All-in-one JavaScript runtime, package manager, and build tool.",icon:"\uD83D\uDFE1",color:"#fbf0df",content:"<h2>Bun</h2><p>Bun is an all-in-one JavaScript runtime designed to be fast.</p>"},{id:4,title:"TypeScript",description:"Typed superset of JavaScript that compiles to plain JavaScript.",icon:"\uD83D\uDD37",color:"#3178c6",content:"<h2>TypeScript</h2><p>TypeScript is a strongly typed programming language.</p>"},{id:5,title:"WebUI",description:"Build modern web-based desktop applications using web technologies.",icon:"\uD83D\uDDA5️",color:"#764ba2",content:"<h2>WebUI</h2><p>WebUI allows you to build desktop applications using web technologies.</p>"},{id:6,title:"esbuild",description:"An extremely fast JavaScript bundler written in Go.",icon:"\uD83D\uDCE6",color:"#ffcd00",content:"<h2>esbuild</h2><p>esbuild is an extremely fast JavaScript bundler written in Go.</p>"},{id:7,title:"Vite",description:"Next generation frontend tooling with instant server start.",icon:"⚡",color:"#646cff",content:"<h2>Vite</h2><p>Vite is a build tool that aims to provide a faster development experience.</p>"},{id:8,title:"React",description:"A JavaScript library for building user interfaces.",icon:"⚛️",color:"#61dafb",content:"<h2>React</h2><p>React is a JavaScript library for building user interfaces.</p>"},{id:9,title:"Vue",description:"Progressive JavaScript framework for building UIs.",icon:"\uD83D\uDC9A",color:"#42b883",content:"<h2>Vue</h2><p>Vue is a progressive JavaScript framework.</p>"},{id:10,title:"Svelte",description:"Cybernetically enhanced web apps with compiler approach.",icon:"\uD83D\uDD25",color:"#ff3e00",content:"<h2>Svelte</h2><p>Svelte represents a radical new approach to building user interfaces.</p>"},{id:11,title:"Rust",description:"Fast, reliable, and memory-safe systems programming language.",icon:"\uD83E\uDD80",color:"#dea584",content:"<h2>Rust</h2><p>Rust is a systems programming language focused on safety.</p>"},{id:12,title:"Tailwind CSS",description:"A utility-first CSS framework for rapid UI development.",icon:"\uD83D\uDCA8",color:"#06b6d4",content:"<h2>Tailwind CSS</h2><p>Tailwind CSS is a utility-first CSS framework.</p>"}];b=(0,k.Injectable)({providedIn:"root"});class P{static #e={c:[a,x]}=(0,O._)(this,[],[b]);windowEntries=(0,k.signal)([]);initialized=(0,k.signal)(!1);entries=this.windowEntries.asReadonly();isInitialized=this.initialized.asReadonly();init(){this.initialized()||this.initialized.set(!0)}getMinimizedCount(){return this.windowEntries().filter(e=>e.minimized).length}hasFocusedWindow(){return this.windowEntries().some(e=>e.focused)}addWindow(e,t){this.windowEntries.update(i=>[...i.map(e=>({...e,focused:!1})),{id:e,title:t,minimized:!1,focused:!0}])}removeWindow(e){this.windowEntries.update(t=>t.filter(t=>t.id!==e))}focusWindow(e){this.windowEntries.update(t=>t.map(t=>({...t,focused:t.id===e,minimized:t.id!==e&&t.minimized})))}minimizeWindow(e){this.windowEntries.update(t=>t.map(t=>t.id===e?{...t,minimized:!0,focused:!1}:t))}restoreWindow(e){this.windowEntries.update(t=>t.map(t=>t.id===e?{...t,minimized:!1}:t))}clearAllWindows(){this.windowEntries.set([])}minimizeAllWindows(){this.windowEntries.update(e=>e.map(e=>({...e,minimized:!0,focused:!1})))}sendStateChange(e,t,i){let o={window_id:e,state:t,title:i,timestamp:new Date().toISOString()};try{if("u">typeof window){let e=window;"function"==typeof e.window_state_change&&e.window_state_change(JSON.stringify(o))}}catch{}}static #t=x()}y=(0,k.Component)({selector:"app-error-modal",standalone:!0,imports:[j.MD],template:`
    @if (error) {
      <div class="error-backdrop" (click)="dismissed.emit()">
        <section class="error-modal" role="dialog" aria-modal="true" aria-label="Application error" (click)="$event.stopPropagation()">
          <header class="error-header">
            <div class="error-title-wrapper">
              <span class="error-icon">{{ getErrorIcon(error.error.code) }}</span>
              <h2 class="error-title">{{ error.title }}</h2>
            </div>
            <button type="button" class="error-close" (click)="dismissed.emit()" aria-label="Close error dialog" title="Close">✕</button>
          </header>

          <div class="error-body">
            <p class="error-message">{{ error.userMessage }}</p>

            @if (error.error.field) {
              <div class="error-field-badge">
                <span class="field-label">Field:</span>
                <strong>{{ error.error.field }}</strong>
              </div>
            }

            @if (getContextEntries(error.error.context).length > 0) {
              <div class="error-context">
                <h4>Context</h4>
                <div class="context-grid">
                  @for (entry of getContextEntries(error.error.context); track entry.key) {
                    <div class="context-item">
                      <span class="context-key">{{ entry.key }}:</span>
                      <span class="context-value">{{ entry.value }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (error.error.cause) {
              <div class="error-cause">
                <strong>⚠️ Cause:</strong>
                <span>{{ error.error.cause }}</span>
              </div>
            }
          </div>

          <footer class="error-footer">
            <div class="error-meta">
              <span class="error-code" [title]="error.error.code">
                <span class="code-label">Code:</span>
                {{ error.error.code }}
              </span>
              <span class="error-source" title="Error source">
                <span class="source-label">Source:</span>
                {{ error.source }}
              </span>
              <span class="error-timestamp" [title]="'Occurred at ' + error.timestamp">
                {{ formatTimestamp(error.timestamp) }}
              </span>
            </div>

            @if (error.error.details) {
              <details class="error-details-block">
                <summary>
                  <span class="summary-icon">📋</span>
                  <span>Technical Details</span>
                  <span class="summary-hint">(Click to expand)</span>
                </summary>
                <div class="error-details-wrapper">
                  <pre class="error-details">{{ formatDetails(error.error.details) }}</pre>
                  <button class="copy-details-btn" (click)="copyDetails(error.error.details)" title="Copy to clipboard">
                    📋 Copy
                  </button>
                </div>
              </details>
            }
          </footer>
        </section>
      </div>
    }
  `,styles:[`
    .error-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(5, 6, 12, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      box-sizing: border-box;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .error-modal {
      width: min(720px, 100%);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e6e8ef;
      box-shadow: 0 24px 64px rgba(12, 16, 35, 0.3);
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1d2433;
      overflow: hidden;
    }

    .error-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%);
      border-bottom: 1px solid #e6e8ef;
    }

    .error-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .error-icon {
      font-size: 28px;
      line-height: 1;
    }

    .error-title {
      margin: 0;
      font-size: 20px;
      line-height: 1.3;
      font-weight: 600;
      color: #1d2433;
    }

    .error-close {
      border: none;
      background: #f2f4fa;
      color: #394056;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .error-close:hover {
      background: #e4e7f0;
      transform: scale(1.05);
    }

    .error-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .error-message {
      margin: 0 0 16px;
      line-height: 1.6;
      color: #2a3246;
      font-size: 15px;
      font-weight: 400;
    }

    .error-field-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #fff4e6;
      border: 1px solid #ffd8a8;
      border-radius: 6px;
      font-size: 13px;
      color: #865b00;
      margin-bottom: 16px;
    }

    .field-label {
      opacity: 0.8;
    }

    .error-context {
      margin: 16px 0;
      padding: 16px;
      background: #f8f9fc;
      border-radius: 8px;
      border: 1px solid #e6e8ef;
    }

    .error-context h4 {
      margin: 0 0 12px;
      font-size: 13px;
      font-weight: 600;
      color: #667089;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .context-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
    }

    .context-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 8px;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #e6e8ef;
    }

    .context-key {
      font-size: 11px;
      color: #667089;
      font-weight: 500;
    }

    .context-value {
      font-size: 13px;
      color: #1d2433;
      font-family: 'SF Mono', 'Consolas', monospace;
    }

    .error-cause {
      padding: 14px 16px;
      background: #fff5f5;
      border-left: 4px solid #fc8181;
      border-radius: 6px;
      font-size: 14px;
      color: #c53030;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .error-cause strong {
      flex-shrink: 0;
    }

    .error-footer {
      padding: 20px 24px;
      background: #f8f9fc;
      border-top: 1px solid #e6e8ef;
    }

    .error-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      font-size: 12px;
      color: #667089;
      flex-wrap: wrap;
    }

    .error-code {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: #ffffff;
      border: 1px solid #e6e8ef;
      border-radius: 6px;
      font-family: 'SF Mono', 'Consolas', monospace;
      font-size: 11px;
    }

    .code-label, .source-label {
      opacity: 0.6;
      font-weight: 400;
    }

    .error-source {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .error-timestamp {
      color: #8892a8;
      margin-left: auto;
    }

    .error-details-block {
      border: 1px solid #e6e8ef;
      border-radius: 8px;
      background: #ffffff;
      overflow: hidden;
    }

    .error-details-block summary {
      padding: 12px 16px;
      cursor: pointer;
      font-size: 13px;
      color: #394056;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fc;
      transition: background 0.2s;
    }

    .error-details-block summary:hover {
      background: #f2f4fa;
    }

    .summary-icon {
      font-size: 14px;
    }

    .summary-hint {
      margin-left: auto;
      opacity: 0.6;
      font-size: 12px;
    }

    .error-details-wrapper {
      position: relative;
    }

    .error-details {
      margin: 0;
      background: #0f1322;
      color: #e3ecff;
      padding: 16px;
      font-size: 12px;
      line-height: 1.6;
      overflow: auto;
      font-family: 'SF Mono', 'Consolas', monospace;
      max-height: 300px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .copy-details-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #e3ecff;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .copy-details-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]}),E=(0,k.Input)(),S=(0,k.Output)();class J{static #e={e:[_,I],c:[l,v]}=(0,O._)(this,[[E,0,"error"],[S,0,"dismissed"]],[y]);error=_(this,null);dismissed=I(this,new k.EventEmitter);getErrorIcon(e){switch(e){case"VALIDATION_FAILED":return"⚠️";case"RESOURCE_NOT_FOUND":case"USER_NOT_FOUND":case"ENTITY_NOT_FOUND":return"\uD83D\uDD0D";case"DB_ALREADY_EXISTS":return"\uD83D\uDCCB";case"DB_CONNECTION_FAILED":case"DB_QUERY_FAILED":case"DB_CONSTRAINT_VIOLATION":return"\uD83D\uDDC4️";case"CONFIG_NOT_FOUND":case"CONFIG_INVALID":case"CONFIG_MISSING_FIELD":return"⚙️";case"SERIALIZATION_FAILED":case"DESERIALIZATION_FAILED":case"INVALID_FORMAT":return"\uD83D\uDCE6";case"INTERNAL_ERROR":case"LOCK_POISONED":return"\uD83D\uDD27";case"UNKNOWN":return"❓";default:return"❌"}}getContextEntries(e){if(!e)return[];try{return Object.entries(e).map(e=>{let[t,i]=e;return{key:t,value:i}})}catch{return[]}}formatTimestamp(e){try{return new Date(e).toLocaleString()}catch{return e}}formatDetails(e){try{let t=JSON.parse(e);return JSON.stringify(t,null,2)}catch{return e}}copyDetails(e){navigator.clipboard.writeText(e).then(()=>{console.log("Details copied to clipboard")}).catch(e=>{console.error("Failed to copy details:",e)})}static #t=v()}C=(0,k.Component)({selector:"app-root",standalone:!0,imports:[j.MD,l],templateUrl:"./app.component.html",styleUrls:["./app.component.css"]});class G{static #e={c:[d,N]}=(0,O._)(this,[],[C]);constructor(){const e=window;this.eventBus=e.__FRONTEND_EVENT_BUS__??new r,this.windowState=new a}globalErrorService=(0,k.inject)(n);winboxService=(0,k.inject)(s);logger=W("app.component");eventBus;windowState;searchQuery=(0,k.signal)("");topCollapsed=(0,k.signal)(!1);bottomCollapsed=(0,k.signal)(!0);activeBottomTab=(0,k.signal)("overview");windowEntries=(0,k.signal)([]);wsConnectionState=(0,k.signal)("connecting");wsDetailsExpanded=(0,k.signal)(!1);wsPort=(0,k.signal)(null);wsLatency=(0,k.signal)(0);wsUptime=(0,k.signal)(0);wsReconnects=(0,k.signal)(0);wsPingSuccess=(0,k.signal)(100);wsTotalCalls=(0,k.signal)(0);wsSuccessfulCalls=(0,k.signal)(0);wsLastError=(0,k.signal)(null);bottomPanelTabs=[{id:"overview",label:"Overview",icon:"\uD83D\uDCCA",content:"System overview"},{id:"metrics",label:"Metrics",icon:"\uD83D\uDCC8",content:"Performance metrics"},{id:"connection",label:"Connection",icon:"\uD83D\uDD17",content:"Connection stats"},{id:"events",label:"Events",icon:"\uD83D\uDD14",content:"Recent events"},{id:"info",label:"Info",icon:"ℹ️",content:"Application info"}];existingBoxes=[];appReadyUnsubscribe=null;windowIdByCardId=new Map;resizeHandler=null;cards=V;filteredCards=(0,k.computed)(()=>{let e=this.searchQuery().toLowerCase().trim();return e?this.cards.filter(t=>`${t.title} ${t.description}`.toLowerCase().includes(e)):this.cards});fuzzyMatch(e,t){let i=0;for(let o=0;o<e.length&&i<t.length;o++)e[o]===t[i]&&i++;return i===t.length}onSearch(e){let t=e.target.value;this.searchQuery.set(t),this.eventBus.publish("search:updated",{query:t,length:t.length})}clearSearch(){this.searchQuery.set(""),this.eventBus.publish("search:cleared",{timestamp:Date.now()})}toggleTop(){this.topCollapsed.set(!this.topCollapsed()),this.eventBus.publish("ui:top-panel:toggled",{collapsed:this.topCollapsed()}),setTimeout(()=>this.resizeAllWindows(),320)}toggleBottom(){this.bottomCollapsed.set(!this.bottomCollapsed()),this.eventBus.publish("ui:bottom-panel:toggled",{collapsed:this.bottomCollapsed()}),setTimeout(()=>this.resizeAllWindows(),320)}selectBottomTab(e,t){t.stopPropagation(),this.activeBottomTab.set(e),this.bottomCollapsed()&&this.bottomCollapsed.set(!1),this.eventBus.publish("ui:bottom-panel:tab-changed",{tabId:e}),setTimeout(()=>this.resizeAllWindows(),320)}getCurrentTabInfo(){let e=this.bottomPanelTabs.find(e=>e.id===this.activeBottomTab());return e?e.content:""}toggleWsDetails(){this.wsDetailsExpanded.set(!this.wsDetailsExpanded()),this.wsDetailsExpanded()?this.bottomCollapsed.set(!1):this.bottomCollapsed.set(!0)}formatUptime(e){let t=Math.floor(e/1e3),i=Math.floor(t/60),o=Math.floor(i/60),r=Math.floor(o/24);return r>0?`${r}d ${o%24}h ${i%60}m`:o>0?`${o}h ${i%60}m ${t%60}s`:i>0?`${i}m ${t%60}s`:`${t}s`}initWebSocketMonitor(){this.wsConnectionState.set("connected"),"u">typeof window&&window.addEventListener("webui:status",e=>{let t=e.detail;t?.state&&this.wsConnectionState.set(t.state),t?.detail?.port&&this.wsPort.set(String(t.detail.port)),t?.detail?.error&&this.wsLastError.set(t.detail.error)})}minimizedWindowCount(){return this.windowEntries().filter(e=>e.minimized).length}ngOnInit(){this.windowState.init(),this.initWebSocketMonitor(),this.appReadyUnsubscribe=this.eventBus.subscribe("app:ready",e=>{this.logger.info("Received app ready event",{timestamp:e.timestamp})},{replayLast:!0}),this.closeAllBoxes();let e=this.winboxService.isAvailable()||!!window.WinBox;if("u">typeof document)if(window.__WINBOX_DEBUG={serviceHasIt:this.winboxService.isAvailable(),windowHasIt:!!window.WinBox,winboxConstructor:window.WinBox||null,checked:new Date().toISOString()},e)this.logger.info("WinBox is available",{serviceHasIt:this.winboxService.isAvailable(),windowHasIt:!!window.WinBox});else{this.logger.error("WinBox is NOT available! window.WinBox =",window.WinBox);let e=document.createElement("div");e.style.cssText="position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:99999;font-family:monospace;",e.innerHTML=`⚠️ WinBox NOT loaded! window.WinBox = ${window.WinBox}`,document.body.appendChild(e)}"u">typeof window&&(this.resizeHandler=()=>this.resizeAllWindows(),window.addEventListener("resize",this.resizeHandler)),this.logger.info("App component initialized",{cardsCount:this.cards.length})}ngOnDestroy(){this.appReadyUnsubscribe?.(),"u">typeof window&&this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null)}closeAllBoxes(){this.existingBoxes.forEach(e=>{e&&e.close()}),this.existingBoxes=[],this.windowEntries.set([]),this.windowIdByCardId.clear()}openCard(e){this.logger.info("Card clicked",{id:e.id,title:e.title});let t=this.windowIdByCardId.get(e.id);if(t){let i=this.existingBoxes.find(e=>e?.__windowId===t);if(i){this.logger.info("Focusing existing window",{windowId:t}),i.min&&i.restore(),i.focus(),this.applyMaximizedState(i),this.markWindowFocused(t),this.eventBus.publish("window:refocused",{id:t,title:e.title});return}}let i=`card-${e.id}`;this.logger.info("Attempting to create WinBox window",{windowId:i,title:e.title,hasWinBoxOnWindow:!!window.WinBox,serviceAvailable:this.winboxService.isAvailable()}),this.createWinBoxWindow(i,e)}createWinBoxWindow(e,t){let i=window.WinBox;if(!i){this.logger.error("WinBox not found on window object!"),this.showWinBoxError("WinBox library not loaded");return}try{this.logger.info("Creating WinBox instance...",{windowId:e});let o=this.getAvailableViewport(),r=new i({id:e,title:`${t.icon} ${t.title}`,background:t.color,width:o.width+"px",height:o.height+"px",x:o.left+"px",y:o.top+"px",minwidth:300,minheight:200,html:`<div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: calc(100% - 40px); overflow: auto; box-sizing: border-box; background: #fafafa;">${t.content}</div>`});if(!r){this.logger.error("WinBox constructor returned null"),this.showWinBoxError("Failed to create window");return}this.logger.info("WinBox window created successfully",{windowId:e}),r.__windowId=e,r.__cardTitle=t.title,r.__cardId=t.id,this.existingBoxes.push(r),this.windowIdByCardId.set(t.id,e),r.onfocus=()=>this.markWindowFocused(e),r.onblur=()=>this.windowState.sendStateChange(e,"blurred",t.title),r.onminimize=()=>this.markWindowMinimized(e),r.onmaximize=()=>{r.__isMaximized=!0,this.applyMaximizedState(r),this.windowState.sendStateChange(e,"maximized",t.title)},r.onrestore=()=>{r.__isMaximized=!1,this.windowState.sendStateChange(e,"restored",t.title)},r.onclose=()=>{let i=this.existingBoxes.indexOf(r);return i>-1&&this.existingBoxes.splice(i,1),this.windowIdByCardId.delete(t.id),this.eventBus.publish("window:closed",{id:e,title:t.title}),this.windowState.sendStateChange(e,"closed",t.title),this.windowEntries.update(t=>t.filter(t=>t.id!==e)),!0},this.windowEntries.update(i=>[...i.map(e=>({...e,focused:!1})),{id:e,title:t.title,minimized:!1,focused:!0}]),this.eventBus.publish("window:opened",{id:e,title:t.title}),this.windowState.sendStateChange(e,"focused",t.title),setTimeout(()=>{this.applyMaximizedState(r)},50)}catch(t){this.logger.error("Error creating WinBox window",{error:t,windowId:e}),this.showWinBoxError(`Error: ${t instanceof Error?t.message:String(t)}`)}}showWinBoxError(e){if("u">typeof document){let t=document.createElement("div");t.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#dc3545;color:white;padding:20px;border-radius:8px;z-index:99999;font-family:sans-serif;max-width:400px;box-shadow:0 4px 12px rgba(0,0,0,0.3);",t.innerHTML=`
        <strong style="font-size:18px;display:block;margin-bottom:10px;">❌ Window Error</strong>
        <div style="margin-bottom:15px;line-height:1.5;">${e}</div>
        <div style="font-size:12px;opacity:0.8;">
          <strong>Debug info:</strong><br>
          window.WinBox = ${window.WinBox?"✓ Loaded":"✗ Not loaded"}<br>
          Check browser console for details
        </div>
      `,document.body.appendChild(t),setTimeout(()=>t.remove(),8e3)}}getAvailableViewport(){let e="u">typeof window?window.innerHeight:600,t="u">typeof window?window.innerWidth:800,i=0;i=this.topCollapsed()?40:80;let o=0,r=e-i-(o=this.bottomCollapsed()?40:130)-4-4;return{left:10,top:i+4,width:t-20,height:Math.max(200,r)}}applyMaximizedState(e){setTimeout(()=>{try{let t=this.getAvailableViewport();e.move(t.left+"px",t.top+"px"),e.resize(t.width+"px",t.height+"px")}catch{}},10)}activateWindow(e,t){t.stopPropagation();let i=this.existingBoxes.find(t=>t?.__windowId===e);i?(i.min&&i.restore(),i.focus(),i.__isMaximized&&this.applyMaximizedState(i),this.eventBus.publish("window:focused",{id:e})):this.windowEntries.update(t=>t.filter(t=>t.id!==e))}showMainMenu(e){e.stopPropagation(),this.existingBoxes.forEach(e=>{e&&!e.min&&e.minimize(!0)}),this.windowEntries.update(e=>e.map(e=>({...e,minimized:!0,focused:!1}))),this.eventBus.publish("window:home-selected",{count:this.existingBoxes.length})}hasFocusedWindow(){return this.windowEntries().some(e=>e.focused)}markWindowFocused(e){this.eventBus.publish("window:focused",{id:e}),this.windowEntries.update(t=>t.map(t=>({...t,focused:t.id===e,minimized:t.id!==e&&t.minimized}))),this.windowState.sendStateChange(e,"focused",this.getWindowTitle(e))}markWindowMinimized(e){this.eventBus.publish("window:minimized",{id:e}),this.windowEntries.update(t=>t.map(t=>t.id===e?{...t,minimized:!0,focused:!1}:t)),this.windowState.sendStateChange(e,"minimized",this.getWindowTitle(e))}markWindowRestored(e){this.eventBus.publish("window:restored",{id:e}),this.windowEntries.update(t=>t.map(t=>t.id===e?{...t,minimized:!1}:t)),this.windowState.sendStateChange(e,"restored",this.getWindowTitle(e))}getWindowTitle(e){let t=this.windowEntries().find(t=>t.id===e);return t?.title??"Unknown"}getAvailableWindowRect(){let e=this.getAvailableViewport();return{top:e.top,height:e.height,width:e.width,left:e.left}}resizeAllWindows(){let e=this.getAvailableWindowRect();this.existingBoxes.forEach(t=>{if(t&&!t.min)try{t.resize(e.width+"px",e.height+"px"),t.move(e.top+"px",e.left+"px")}catch{}})}static #t=N()}let K=new r;K.init("app",300),R.configure({enabled:!0,minLevel:"debug",maxEntries:800,redactKeys:["password","token","secret","authorization","cookie"]}),R.enableBackendSink();let q=W("bootstrap"),Y=window;Y.__FRONTEND_LOGS__={getHistory:function(){return R.snapshot()},clear:function(){R.clear()}},Y.__FRONTEND_EVENT_BUS__=K;let Q="__frontendGlobalErrorHooks",X=window;try{let e,t;window.addEventListener("error",e=>{let t=new Date().toISOString();console.error(`%c[${t}] [UNCAUGHT ERROR]`,"color: #ff0000; font-weight: bold; font-size: 14px;",`
┌────────────────────────────────────────────────────────────────┐
│ Uncaught Error                                                     │
├────────────────────────────────────────────────────────────────┤
│ Message: ${e.message}
│ Filename: ${e.filename}
│ Line: ${e.lineno}:${e.colno}
│ Error: ${e.error?.stack||e.error?.message||"N/A"}
└────────────────────────────────────────────────────────────────┘`)}),window.addEventListener("unhandledrejection",e=>{let t=new Date().toISOString();console.error(`%c[${t}] [UNHANDLED REJECTION]`,"color: #ff6600; font-weight: bold; font-size: 14px;",`
┌────────────────────────────────────────────────────────────────┐
│ Unhandled Promise Rejection                                       │
├────────────────────────────────────────────────────────────────┤
│ Reason: ${e.reason?.stack||e.reason?.message||e.reason}
└────────────────────────────────────────────────────────────────┘`)}),e=console.error,console.error=function(){for(var t=arguments.length,i=Array(t),o=0;o<t;o++)i[o]=arguments[o];let r=new Date().toISOString();e(`%c[${r}] [CONSOLE.ERROR]`,"color: #ff4444; font-weight: bold;",...i)},t=console.warn,console.warn=function(){for(var e=arguments.length,i=Array(e),o=0;o<e;o++)i[o]=arguments[o];let r=new Date().toISOString();t(`%c[${r}] [CONSOLE.WARN]`,"color: #ffaa00; font-weight: bold;",...i)},X[Q]=!0,q.info("Global error handlers installed"),q.info("Starting Angular bootstrap",{production:!1,zoneless:!0}),(0,F.B8)(d,{providers:[(0,k.provideZoneChangeDetection)({coalesce:!0,scheduleInMacroTask:!1}),{provide:k.ErrorHandler,useClass:M}]}).then(e=>{X[Q]||(window.addEventListener("error",t=>{t.preventDefault(),e.injector.get(n).report(t.error??t.message,{source:"window"})}),window.addEventListener("unhandledrejection",t=>{t.preventDefault(),e.injector.get(n).report(t.reason,{source:"promise",title:"Unhandled Promise Rejection"})}),X[Q]=!0),K.publish("app:ready",{timestamp:Date.now()}),q.info("Angular bootstrap completed",{componentCount:e.componentCount})}).catch(e=>{q.error("Angular bootstrap failed",{},e),document.body.innerHTML=`<h1 style="color:red;">Error: ${e.message}</h1>`})}catch(e){q.error("Bootstrap threw synchronously",{},e),document.body.innerHTML=`<h1 style="color:red;">Error: ${e.message}</h1>`}}},n={};function s(e){var t=n[e];if(void 0!==t)return t.exports;var i=n[e]={exports:{}};return r[e](i,i.exports,s),i.exports}s.m=r,s.d=(e,t)=>{for(var i in t)s.o(t,i)&&!s.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"u">typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},e=[],s.O=(t,i,o,r)=>{if(i){r=r||0;for(var n=e.length;n>0&&e[n-1][2]>r;n--)e[n]=e[n-1];e[n]=[i,o,r];return}for(var a=1/0,n=0;n<e.length;n++){for(var[i,o,r]=e[n],l=!0,d=0;d<i.length;d++)(!1&r||a>=r)&&Object.keys(s.O).every(e=>s.O[e](i[d]))?i.splice(d--,1):(l=!1,r<a&&(a=r));if(l){e.splice(n--,1);var c=o();void 0!==c&&(t=c)}}return t},t={889:0},s.O.j=e=>0===t[e],i=(e,i)=>{var o,r,[n,a,l]=i,d=0;if(n.some(e=>0!==t[e])){for(o in a)s.o(a,o)&&(s.m[o]=a[o]);if(l)var c=l(s)}for(e&&e(i);d<n.length;d++)r=n[d],s.o(t,r)&&t[r]&&t[r][0](),t[r]=0;return s.O(c)},(o=globalThis.webpackChunkangular_rsbuild_demo=globalThis.webpackChunkangular_rsbuild_demo||[]).forEach(i.bind(null,0)),o.push=i.bind(null,o.push.bind(o));var a=s.O(void 0,["904","549","545"],()=>s(5));a=s.O(a)})();