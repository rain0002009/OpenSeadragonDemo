var j=Object.defineProperty,X=Object.defineProperties;var Q=Object.getOwnPropertyDescriptors;var B=Object.getOwnPropertySymbols;var Z=Object.prototype.hasOwnProperty,_=Object.prototype.propertyIsEnumerable;var M=(o,e,t)=>e in o?j(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t,z=(o,e)=>{for(var t in e||(e={}))Z.call(e,t)&&M(o,t,e[t]);if(B)for(var t of B(e))_.call(e,t)&&M(o,t,e[t]);return o},H=(o,e)=>X(o,Q(e));var f=(o,e,t)=>(M(o,typeof e!="symbol"?e+"":e,t),t);import{r as U,j as w,F as T,a as c,B as v,o as h,_ as L,e as q,P as $,b as S,u as V,c as G,O as K,S as Y,C as J,E as ee,L as te,I as se,D as ie,d as re,f as O,g as oe,R as ne,h as ce,i as ae,z as he}from"./vendor.7108b486.js";const le=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}};le();const u=8,C=u/2,pe=34;class D{constructor(e){f(this,"viewer");f(this,"sk");f(this,"store");f(this,"cropInfo",{});f(this,"buttonWrapperDiv");f(this,"pg");f(this,"eventSource");f(this,"holder");this.store=[],this.viewer=e.viewer,this.sk=e.sk,this.eventSource=e.overlayEvent,this.buttonWrapperDiv=this.sk.createDiv(),this.buttonWrapperDiv.hide(),this.buttonWrapperDiv.addClass("w-120px");const t=this.viewer.viewport.getContainerSize();this.pg=this.sk.createGraphics(t.x,t.y),this.holder=U.exports.createPortal(w(T,{children:[c(v,{size:"small",type:"primary",onClick:()=>{this.finish()},children:"\u786E\u5B9A"}),c(v,{className:"ml-4",size:"small",danger:!0,type:"primary",onClick:()=>{this.cancelCrop()},children:"\u53D6\u6D88"})]}),this.buttonWrapperDiv.elt),this.viewer.container.append(this.buttonWrapperDiv.elt)}startCrop(){if(this.cropInfo.enable)return!1;this.cropInfo.prevCanvasImage=this.sk.get(),this.viewer.setMouseNavEnabled(!1),this.viewer.drawer.canvas.toBlob(e=>{if(e){const t=URL.createObjectURL(e);this.sk.loadImage(t,s=>{this.cropInfo.seaDragonImage=s,URL.revokeObjectURL(t)})}}),this.sk.loop(),this.cropInfo.enable=!0,this.sk.mousePressed=e=>(!this.cropInfo.enable||e.target.nodeName!=="CANVAS"||this.cropInfo.onWhere||(this.cropInfo.startPoint=new h.exports.Point(this.sk.mouseX,this.sk.mouseY),this.cropInfo.currentSelected=void 0),!1),this.sk.mouseReleased=e=>{if(!this.cropInfo.enable||e.target.nodeName!=="CANVAS")return!1;if(this.cropInfo.currentSelected){const t=this.cropInfo.currentSelected[0],s=this.cropInfo.currentSelected[1];this.cropInfo.currentSelected=[new h.exports.Point(Math.min(t.x,s.x),Math.min(t.y,s.y)),new h.exports.Point(Math.max(t.x,s.x),Math.max(t.y,s.y))]}else{this.cropInfo.currentSelected=[new h.exports.Point(Math.min(this.cropInfo.startPoint.x,this.sk.mouseX),Math.min(this.cropInfo.startPoint.y,this.sk.mouseY)),new h.exports.Point(Math.max(this.cropInfo.startPoint.x,this.sk.mouseX),Math.max(this.cropInfo.startPoint.y,this.sk.mouseY))];let t=this.cropInfo.currentSelected[0];this.cropInfo.currentSelected[0].x>this.cropInfo.currentSelected[1].x&&(this.cropInfo.currentSelected[0]=this.cropInfo.currentSelected[1],this.cropInfo.currentSelected[1]=t),this.buttonWrapperDiv.show()}this.cropInfo.startPoint=void 0}}cancelCrop(){this.buttonWrapperDiv.hide(),this.viewer.setMouseNavEnabled(!0);try{this.sk.cursor(this.sk.ARROW)}catch{}this.sk.noLoop(),this.cropInfo={}}doCrop(){if(this.cropInfo.enable){this.cropInfo.seaDragonImage&&this.sk.image(this.cropInfo.seaDragonImage,0,0,this.sk.width,this.sk.height),this.sk.image(this.cropInfo.prevCanvasImage,0,0,this.sk.width,this.sk.height);const e=this.cropInfo.startPoint,t=new h.exports.Point(this.sk.mouseX,this.sk.mouseY);this.cropInfo.onWhere||this.sk.cursor(this.sk.CROSS),e&&this.drawQuad(e,t),this.cropInfo.currentSelected&&(this.drawQuad(...this.cropInfo.currentSelected),this.transformQuad(...this.cropInfo.currentSelected))}}drawQuad(e,t){if(e&&"globalCompositeOperation"in this.pg.drawingContext){const s=[new h.exports.Point(e.x,e.y),new h.exports.Point(t.x,e.y),new h.exports.Point(t.x,t.y),new h.exports.Point(e.x,t.y)];this.pg.clear(),this.pg.background(0,0,0,120),this.pg.push(),this.pg.drawingContext.globalCompositeOperation="destination-out",this.pg.fill(255,255,255,255),this.pg.quad(s[0].x,s[0].y,s[1].x,s[1].y,s[2].x,s[2].y,s[3].x,s[3].y),this.pg.pop(),this.pg.push(),this.pg.noFill(),this.pg.stroke(0,0,255),this.pg.strokeWeight(2),this.pg.quad(s[0].x,s[0].y,s[1].x,s[1].y,s[2].x,s[2].y,s[3].x,s[3].y),s.forEach(r=>{this.pg.fill(0,0,255),this.pg.square(r.x-C,r.y-C,u)}),this.pg.pop(),this.sk.image(this.pg,0,0,this.sk.width,this.sk.height)}}transformQuad(e,t){if(!e)return!1;const s=new h.exports.Point(this.sk.mouseX,this.sk.mouseY),{mainRect:r,leftRect:i,rightRect:a,bottomRect:n,topRect:g,topLeftRect:l,topRightRect:b,bottomLeftRect:m,bottomRightRect:p,topLeftPoint:d}=D.getRectFromPoint(e,t),P=d.y-pe;if(this.buttonWrapperDiv.position(d.x,P<0?m.y+16:P),this.sk.mouseIsPressed||(this.cropInfo.onWhere=void 0,r.containsPoint(s)&&(this.sk.cursor(this.sk.MOVE),this.cropInfo.onWhere="inside"),[{cursor:"ns-resize",rect:g,onWhere:"top"},{cursor:"ew-resize",rect:a,onWhere:"right"},{cursor:"ns-resize",rect:n,onWhere:"bottom"},{cursor:"ew-resize",rect:i,onWhere:"left"},{cursor:"nwse-resize",rect:l,onWhere:"topLeft"},{cursor:"nesw-resize",rect:b,onWhere:"topRight"},{cursor:"nwse-resize",rect:p,onWhere:"bottomRight"},{cursor:"nesw-resize",rect:m,onWhere:"bottomLeft"}].forEach(({cursor:y,rect:I,onWhere:x})=>{I.containsPoint(s)&&(this.sk.cursor(y),this.cropInfo.onWhere=x)})),this.sk.mouseIsPressed){const y=s.x-this.sk.pmouseX,I=s.y-this.sk.pmouseY,x=this.cropInfo.currentSelected[0],k=this.cropInfo.currentSelected[1],R=k.x-x.x,E=k.y-x.y,N=this.sk.constrain(x.y+I,0,this.sk.height),W=this.sk.constrain(k.x+y,0,this.sk.width),A=this.sk.constrain(k.y+I,0,this.sk.height),F=this.sk.constrain(x.x+y,0,this.sk.width);switch(this.cropInfo.onWhere){case"inside":x.x=this.sk.constrain(x.x+y,0,this.sk.width-R),x.y=this.sk.constrain(x.y+I,0,this.sk.height-E),k.x=x.x+R,k.y=x.y+E;break;case"top":this.cropInfo.currentSelected[0].y=N;break;case"right":this.cropInfo.currentSelected[1].x=W;break;case"bottom":this.cropInfo.currentSelected[1].y=A;break;case"left":this.cropInfo.currentSelected[0].x=F;break;case"topLeft":this.cropInfo.currentSelected[0].y=N,this.cropInfo.currentSelected[0].x=F;break;case"topRight":this.cropInfo.currentSelected[0].y=N,this.cropInfo.currentSelected[1].x=W;break;case"bottomRight":this.cropInfo.currentSelected[1].y=A,this.cropInfo.currentSelected[1].x=W;break;case"bottomLeft":this.cropInfo.currentSelected[1].y=A,this.cropInfo.currentSelected[0].x=F;break}}}finish(){const[e,t]=this.cropInfo.currentSelected,{mainInsideRect:s}=D.getRectFromPoint(e,t);this.cropInfo.enable=!1,this.sk.noLoop(),this.sk.clear(),this.cropInfo.seaDragonImage&&this.sk.image(this.cropInfo.seaDragonImage,0,0,this.sk.width,this.sk.height),this.sk.image(this.cropInfo.prevCanvasImage,0,0,this.sk.width,this.sk.height),this.sk.get(s.x,s.y,s.width,s.height).canvas.toBlob(i=>{if(i){const a=URL.createObjectURL(i);this.store.push({blob:i,url:a,key:a}),this.eventSource.emit("cropStoreChange",this.store)}}),this.eventSource.emit("cropFinish",this),this.cancelCrop()}resize(){const e=this.viewer.viewport.getContainerSize();this.pg.resizeCanvas(e.x,e.y)}setStore(e){this.store=e,this.eventSource.emit("cropStoreChange",e)}deleteCropStore(e,t=1){this.store.splice(e,t).forEach(r=>{r.blob&&URL.revokeObjectURL(r.url)}),this.eventSource.emit("cropStoreChange",this.store)}static getRectFromPoint(e,t){const s=new h.exports.Point(Math.min(e.x,t.x),Math.min(e.y,t.y)),r=new h.exports.Point(Math.max(e.x,t.x),Math.max(e.y,t.y)),i=new h.exports.Point(s.x-C,s.y-C),a=new h.exports.Point(r.x+C,r.y+C),n=a.x-i.x,g=r.x-s.x,l=a.y-i.y,b=r.y-s.y,m=new h.exports.Rect(i.x,i.y,n,l),p=new h.exports.Rect(s.x,s.y,g,b),d=new h.exports.Rect(i.x,i.y,n,u),P=new h.exports.Rect(a.x-u,i.y,u,l),y=new h.exports.Rect(i.x,a.y-u,n,u),I=new h.exports.Rect(i.x,i.y,u,l),x=new h.exports.Rect(i.x,i.y,u,u),k=new h.exports.Rect(a.x-u,i.y,u,u),R=new h.exports.Rect(i.x,a.y-u,u,u),E=new h.exports.Rect(a.x-u,a.y-u,u,u);return{mainRect:m,topRect:d,topLeftPoint:i,rightRect:P,bottomRect:y,leftRect:I,topLeftRect:x,topRightRect:k,bottomLeftRect:R,bottomRightRect:E,mainInsideRect:p}}}class ue{constructor(e){f(this,"overlay");f(this,"drawOptions");f(this,"sk");f(this,"store");this.overlay=e,this.drawOptions={},this.sk=e.sk,this.store=[]}startDraw(e){this.overlay.crop.cancelCrop(),this.drawOptions.enable=!0,this.overlay.viewer.setMouseNavEnabled(!1),this.drawOptions.startPoint=null,this.drawOptions.endPoint=null,this.drawOptions.startPointTransformed=null,this.drawOptions.freePath=[],this.sk.loop(),this.sk.mousePressed=t=>{var s;if(t.target.nodeName!=="CANVAS")return!1;if(this.drawOptions.startPoint=new h.exports.Point(this.sk.mouseX,this.sk.mouseY),((s=this.drawOptions)==null?void 0:s.type)==="text"){const r=this.sk.select("#inputWrap");r?(r==null||r.position(this.drawOptions.startPoint.x,this.drawOptions.startPoint.y),e==null||e()):console.error("inputWrap is null")}},this.sk.mouseReleased=t=>{var r,i;if(t.target.nodeName!=="CANVAS")return!1;if(((r=this.drawOptions)==null?void 0:r.type)==="text")return this.sk.mousePressed=L.noop,!1;this.drawOptions.enable=!1,this.sk.noLoop(),this.overlay.viewer.setMouseNavEnabled(!0),this.sk.mousePressed=L.noop;const s=z({},this.drawOptions);switch((i=this.drawOptions)==null?void 0:i.type){case"circle":case"rect":case"line":s.path=[[this.drawOptions.startPointTransformed.x,this.drawOptions.startPointTransformed.y],[this.drawOptions.endPoint.x,this.drawOptions.endPoint.y]];break;case"free":s.path=this.drawOptions.freePath;break}this.store.push(s),this.drawOptions={},this.sk.mouseReleased=L.noop}}drawMarkStore(e){this.store.forEach(t=>{this.draw(this.sk,t,2,e)})}draw(e,t,s,r,i){var n,g,l,b;if(s===1?t.enable&&e.mouseIsPressed&&t&&t.startPoint&&e.mouseButton===e.LEFT:!0){e.push();const m=e.color(t.color);m.setAlpha(e.map(t.opacity,0,1,0,255)),t.startPointTransformed=i==null?void 0:i.viewerElementToImageCoordinates(t.startPoint),t.endPoint=i==null?void 0:i.viewerElementToImageCoordinates(new h.exports.Point(e.mouseX,e.mouseY));let p,d;const P=t.strokeWeight*this.overlay.viewer.viewport.getMinZoom()/this.overlay.viewer.viewport.getHomeZoom();switch(s===1?(p=t.startPointTransformed,d=t.endPoint):(p=new h.exports.Point(...t.path[0]),d=new h.exports.Point(...((n=t.path)==null?void 0:n[1])||[0,0])),["circle","rect","line","free"].includes(t.type)&&(e.noFill(),e.strokeWeight(P*2),e.stroke(m)),t==null?void 0:t.type){case"circle":e.circle(p.x,p.y,p.distanceTo(d)*2);break;case"rect":e.quad(p.x,p.y,d.x,p.y,d.x,d.y,p.x,d.y);break;case"line":e.line(p.x,p.y,d.x,d.y);break;case"free":s==1&&(((g=t.freePath)==null?void 0:g.length)===0&&t.freePath.push([p.x,p.y]),new h.exports.Point(...L.last(t.freePath)).distanceTo(d)>20&&((l=t.freePath)==null||l.push([d.x,d.y]))),(b=t[s===1?"freePath":"path"])==null||b.forEach((y,I)=>{var k;const x=(k=t.freePath)==null?void 0:k[I+1];x&&e.line(...y,...x)});break;case"text":if(s===1?t.isInputOk:!0){const y=P*20;e.textSize(y),e.fill(m),e.text(t.text,p.x,p.y+y/2)}break}e.pop()}}setDrawOptions(e){this.drawOptions=e}setStore(e){this.store=e,this.overlay.redraw()}}class de{constructor(e){f(this,"viewer");f(this,"wrapDiv");f(this,"sk");f(this,"crop");f(this,"overlayEvent");f(this,"drawMarker");this.overlayEvent=new q.exports.EventEmitter,this.viewer=e,this.wrapDiv=document.createElement("div"),this.wrapDiv.classList.add("p5-wrap"),this.viewer.canvas.append(this.wrapDiv),this.sk=new $(t=>{this.sk=t,this.drawMarker=new ue(this),t.setup=()=>{const s=this.viewer.viewport.getContainerSize();t.createCanvas(s.x,s.y),t.noLoop()},t.draw=()=>{let s=this.viewer.viewport.getZoom(!0);t.clear();for(let r=0,i=this.viewer.world.getItemCount();r<i;r++){let a=this.viewer.world.getItemAt(r);if(a){let n=a.viewportToImageZoom(s),g=a.imageToViewportCoordinates(0,0,!0),l=this.viewer.viewport.pixelFromPoint(g,!0);this.crop.cropInfo.enable||(t.push(),t.translate(l.x,l.y),t.scale(n,n),this.drawMarker.drawMarkStore(s),this.drawMarker.draw(t,this.drawMarker.drawOptions,1,s,a),t.pop()),this.crop.doCrop()}}}},this.wrapDiv),this.crop=new D(this),this.viewer.addHandler("open",this.redraw.bind(this)),this.viewer.addHandler("update-viewport",this.redraw.bind(this)),this.viewer.addHandler("resize",this.resizeCanvas.bind(this))}resizeCanvas(){var t,s;const e=this.viewer.viewport.getContainerSize();(t=this.sk)==null||t.resizeCanvas(e.x,e.y,!1),(s=this.crop)==null||s.resize()}redraw(){var e;(e=this.sk)==null||e.redraw()}}const fe=({options:o,controlPanel:e,onReady:t,beforeDeleteCrop:s})=>{const[r,i]=S.exports.useState(),a=e||(()=>null),n=V({controlPanelVisible:!1}),g=S.exports.useRef(null),l=S.exports.useRef(document.createElement("div")),b=G(m=>{m.container.append(l.current),n.controlPanelVisible=!0});return S.exports.useEffect(()=>{let m;if(g.current){m=K(z({element:g.current},o)),m.addHandler("full-screen",d=>{n.controlPanelVisible=!d.fullScreen});const p=new de(m);i(p),b(m),t==null||t({viewer:m,overlay:p})}return()=>{m.destroy()}},[]),w("div",{children:[c("div",{className:"h-100vh w-full z-1",ref:g}),n.controlPanelVisible&&r&&U.exports.createPortal(c(a,{overlay:r,beforeDeleteCrop:s}),l.current)]})},me=[{type:"circle",label:"\u5706\u5F62"},{type:"rect",label:"\u77E9\u5F62"},{type:"line",label:"\u76F4\u7EBF"},{type:"free",label:"\u81EA\u7531"},{type:"text",label:"\u6587\u5B57"}],xe=({onChange:o})=>{const e=V({strokeWeight:10,opacity:1,color:"#3f51b5",type:null});return w("div",{className:"w-230px space-y-4",children:[w("div",{children:[w("p",{children:["\u753B\u7B14\u7C97\u7EC6\uFF1A",e.strokeWeight]}),c(Y,{min:10,max:100,onChange:t=>{e.strokeWeight=t}})]}),w("div",{children:[w("p",{children:["\u900F\u660E\u5EA6\uFF1A",e.opacity]}),c(Y,{min:.1,max:1,step:.1,defaultValue:1,onChange:t=>{e.opacity=t}})]}),w("div",{children:[w("p",{children:["\u989C\u8272\uFF1A",c("span",{className:"inline-block w-15px h-15px rounded-100px",style:{backgroundColor:e.color,verticalAlign:-3}})]}),c(J,{onChange:t=>{e.color=t.hex}})]}),w("div",{children:[c("p",{children:"\u7C7B\u578B\uFF1A"}),c("div",{className:"grid grid-cols-3 gap-1",children:me.map(({type:t,label:s})=>c(v,{onClick:()=>{e.type=t,o==null||o(e)},children:s},t))})]})]})},we=({value:o,onDelete:e})=>(o==null?void 0:o.length)===0?c(ee,{className:"w-240px !m-0"}):c(te,{className:"w-240px",data:o||[],itemKey:"key",itemHeight:116,height:((o==null?void 0:o.length)||0)>3?3*116:void 0,children:(t,s)=>w("div",{className:"py-2 flex",children:[c(se,{width:200,height:100,src:t.url,preview:{maskStyle:{zIndex:1100},wrapStyle:{zIndex:1100}}}),c(v,{className:"ml-auto",danger:!0,type:"primary",shape:"circle",icon:c(ie,{}),onClick:()=>{e==null||e(s)}})]})}),ge=({overlay:o,beforeDeleteCrop:e})=>{var g;const t=re(()=>e||(()=>!0),[e]),{sk:s,viewer:r,drawMarker:i}=o,{drawOptions:a}=i,n=V({markVisibility:!1,inputVisibility:!1,cropVisibility:!1,cropList:[],inputText:""});return S.exports.useEffect(()=>{const l=b=>{n.cropList=b};return o.overlayEvent.on("cropStoreChange",l),()=>{o.overlayEvent.off("cropStoreChange",l)}},[o]),s?w(T,{children:[(g=o==null?void 0:o.crop)==null?void 0:g.holder,c(O,{zIndex:10,visible:n.inputVisibility,content:w("div",{className:"space-y-4 w-300px",children:[c(oe,{autoFocus:!0,value:n.inputText,onChange:l=>{n.inputText=l.target.value}}),w("div",{className:"flex",children:[c(v,{onClick:()=>{n.inputVisibility=!1,n.inputText="",s.noLoop(),r.setMouseNavEnabled(!0),a.enable=!1},children:"\u53D6\u6D88"}),c(v,{type:"primary",className:"ml-auto",onClick:()=>{n.inputVisibility=!1,a.isInputOk=!0,i.store.push(H(z({},a),{path:[[a.startPointTransformed.x,a.startPointTransformed.y]],text:n.inputText})),s.noLoop(),r.setMouseNavEnabled(!0),n.inputText="",a.enable=!1},children:"\u786E\u8BA4"})]})]}),children:c("div",{id:"inputWrap"})}),c("div",{className:"absolute right-0 w-100px h-200px",children:w("div",{className:"border border-color-hex-dedede shadow px-2 py-3 space-y-2 bg-white",children:[c(v,{block:!0,onClick:()=>{r.setFullScreen(!0)},children:"\u5168\u5C4F"}),c(v,{block:!0,onClick:()=>{r.viewport.goHome(!0)},children:"\u4E3B\u9875"}),c(O,{className:"",placement:"leftTop",title:c("p",{children:"\u6807\u6CE8"}),content:c(xe,{onChange:l=>{n.markVisibility=!1,i.setDrawOptions(l),i.startDraw(()=>{n.inputVisibility=!0})}}),trigger:"click",visible:n.markVisibility,children:c(v,{block:!0,onClick:()=>{n.markVisibility=!n.markVisibility,n.cropVisibility=!1},children:"\u6807\u6CE8"})}),c(O,{className:"",placement:"leftTop",style:{zIndex:1e3},title:w(T,{children:[c(v,{type:"primary",size:"small",onClick:()=>{o.crop.startCrop(),n.cropVisibility=!1},children:"\u5F00\u59CB"}),c(v,{type:"primary",size:"small",danger:!0,className:"ml-4",onClick:()=>{n.cropVisibility=!1,o.crop.cancelCrop()},children:"\u53D6\u6D88"})]}),content:c(we,{value:n.cropList,onDelete:async l=>{await t(n.cropList[l],l)&&o.crop.deleteCropStore(l)}}),visible:n.cropVisibility,children:c(v,{block:!0,onClick:()=>{n.markVisibility=!1,n.cropVisibility=!n.cropVisibility},children:"\u88C1\u526A"})})]})})]}):null};function ye(){const o=S.exports.useRef(new h.exports.TileSource({width:7026,height:9221,tileSize:256,tileOverlap:2,getTileUrl(e,t,s){return`//openseadragon.github.io//example-images/highsmith/highsmith_files/${e}/${t}_${s}.jpg`}}));return c(fe,{options:{crossOriginPolicy:"Anonymous",showNavigationControl:!1,showNavigator:!0,navigatorAutoFade:!1,navigatorAutoResize:!1,navigatorHeight:100,navigatorWidth:200,navigatorPosition:"TOP_LEFT",gestureSettingsMouse:{dblClickToZoom:!1,clickToZoom:!1}},controlPanel:ge,onReady:({viewer:e})=>{e.open(o.current)}})}ne.render(c(ce.StrictMode,{children:c(ae,{locale:he,children:c(ye,{})})}),document.getElementById("root"));