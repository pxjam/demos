!function(){var t,e=("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{}).parcelRequire01a7,i=e("5rLfZ"),o=(t=i())&&t.__esModule?t.default:t,n=e("6GgW6"),s=e("7fPRq");i(),n();var a=[{firstObjectSize:89,objectsCount:16,duplicateFactor:.4,duplicateMethod:"sum",autorotate:!0,autorotateSpeed:5,revertInnerRotate:!1,innerRotateSpeed:10,mouseRotatePower:28,mouseRotateInertia:1e3,mouseMagnetic:1,centerX:.7,centerY:.32,perspective:1e3,size:1.2,framesOverlay:0,gradCenter:{x:.37,y:.37},gradRadius:.6,gradMiddlePoint:.7,gradColor1:{r:191.25,g:127.5,b:255},gradColor2:{r:91.8,g:200.6,b:255},gradColor3:{r:153,g:255,b:153},gradPreview:!1,preset:0}];s();let r=[];class d{constructor(t,e){this.draw=t=>{this.sum=this.point0.X+this.point0.Y+this.point1.X+this.point1.Y,-1===r.indexOf(this.sum)?(r.push(this.sum),t.globalAlpha=1):t.globalAlpha=0,t.beginPath(),t.moveTo(this.point0.X,this.point0.Y),t.lineTo(this.point1.X,this.point1.Y),t.closePath(),t.stroke()},this.point0=t,this.point1=e,this.sum=t.X+t.Y+e.X+e.Y}static eraseAll(){r=[]}}class c{constructor(t,e){e&&(this.parent=e),this.xo=t[0],this.yo=t[1],this.zo=t[2]}}let l,p,u,h=window.innerWidth,m=window.innerHeight,f=h/2,w=m/2,g={x:f,y:w,inertia:.05,cursorMode:""};window.addEventListener("resize",(()=>{h=window.innerWidth,m=window.innerHeight}));let v=!1,x=(t,e)=>{f=b(f,t),w=b(w,e),g.x=f,g.y=w,v||(l=requestAnimationFrame((()=>x(p,u))))},b=(t,e)=>{let i=e-t,o=t+i*g.inertia;return Math.abs(i)<5&&(cancelAnimationFrame(l),v=!0,o=e),o};function y(t){t.preventDefault(),cancelAnimationFrame(l),v=!1,p=void 0!==t.clientX?t.clientX:t.touches[0].clientX,u=void 0!==t.clientY?t.clientY:t.touches[0].clientY,x(p,u)}window.addEventListener("mousemove",y),window.addEventListener("touchmove",y);class I{constructor(t,e){this.rotate=(t,e,i)=>{this.angleX=t,this.angleY=e,this.angleZ=i,this.cosY=Math.cos(e),this.sinY=Math.sin(e),this.cosX=Math.cos(t),this.sinX=Math.sin(t),this.cosZ=Math.cos(i),this.sinZ=Math.sin(i)},this.projectPoint=t=>{let e=this.cosY*(this.sinZ*t.yo+this.cosZ*t.xo)-this.sinY*t.zo,i=this.sinX*(this.cosY*t.zo+this.sinY*(this.sinZ*t.yo+this.cosZ*t.xo))+this.cosX*(this.cosZ*t.yo-this.sinZ*t.xo),o=this.cosX*(this.cosY*t.zo+this.sinY*(this.sinZ*t.yo+this.cosZ*t.xo))-this.sinX*(this.cosZ*t.yo-this.sinZ*t.xo);this.x=e,this.y=i,this.z=o;let n=P*Y.centerX+e*(Y.perspective/(o+Y.zoom)),s=Z*Y.centerY+i*(Y.perspective/(o+Y.zoom));{let e=function(t,e,i=70){let o=t-g.x,n=e-g.y,s=Math.sqrt(o**2+n**2),a=Math.E**(-s/i);return[t+o*a,e+n*a]}(n,s);t.X=e[0],t.Y=e[1]}},this.projection=()=>this.points.forEach((t=>this.projectPoint(t))),this.sort=e,this.r=t,this.points=[],this.rotate(0,0,0),this.forceX=0,this.forceY=0;let i=Math.SQRT2,o=[[t,0,-t/i],[-t,0,-t/i],[0,-t,t/i],[0,t,t/i]];for(let t=0;t<o.length;t++)this.points.push(new c(o[t]));let n=[[0,1],[1,2],[2,0],[2,3],[3,0],[3,1]];for(let t=0;t<n.length;t++)j.push(new d(this.points[n[t][0]],this.points[n[t][1]]))}}let R={firstObjectSize:100,objectsCount:12,bgLight:!0,duplicateMethod:"sum",duplicateFactor:.4,framesOverlay:0,perspective:1500,autorotate:!0,autorotateSpeed:25,innerRotateSpeed:15,revertInnerRotate:!1,mouseRotatePower:25,mouseRotateInertia:200,mouseMagnetic:30,zoom:1,size:1.2,centerX:.5,centerY:.5,cursorMode:"bloat",...n().gradParams},Y=Object.assign({},R);window.pane=new o({container:document.querySelector("[data-pane]")});let M,S,X,z,j,P,Z,C=pane.addFolder({title:"Настройки",expanded:!1});function O(t,e){return t[e]=e,t}C.addInput(Y,"firstObjectSize",{min:1,max:200,step:1}),C.addInput(Y,"objectsCount",{min:1,max:50,step:1}),C.addInput(Y,"duplicateFactor",{min:.01,max:3,step:.001}),C.addInput(Y,"duplicateMethod",{options:["sum","multiply"].reduce(O,{})}),C.addInput(Y,"cursorMode",{options:["bloat","repel","attract"].reduce(O,{})}),C.addInput(Y,"autorotate"),C.addInput(Y,"autorotateSpeed",{min:0,max:100,step:1}),C.addInput(Y,"revertInnerRotate"),C.addInput(Y,"innerRotateSpeed",{min:0,max:100,step:1}),C.addInput(Y,"mouseRotatePower",{min:1,max:100,step:1}),C.addInput(Y,"mouseRotateInertia",{min:1,max:1e3,step:1}),C.addInput(Y,"mouseMagnetic",{min:1,max:100,step:1}),C.addInput(Y,"centerX",{min:0,max:1,step:.01}),C.addInput(Y,"centerY",{min:0,max:1,step:.01}),C.addInput(Y,"perspective",{min:0,max:3e3,step:1}),C.addInput(Y,"size",{min:.1,max:4,step:.1}),C.addInput(Y,"framesOverlay",{min:0,max:1,step:.01}),C.addSeparator(),n().createGradControls(C,Y),C.addInput({preset:0},"preset",{options:a.reduce(((t,e,i)=>(t["preset "+(i+1)]=i,t)),{})}),a.length&&(Object.assign(Y,R,a[0]),pane.refresh()),C.addButton({title:"Copy preset"}).on("click",(()=>navigator.clipboard.writeText(s().default(pane.exportPreset())))),document.querySelector(".box").addEventListener("click",(()=>C.expanded=!1));let F,q,A=50,E=50,L=0,T=0,k=0,W=0,G=function(){P=M.offsetWidth,Z=M.offsetHeight,S.width=P,S.height=Z};function H(){z=[],j=[];let t=Y.firstObjectSize;for(let e=0;e<Y.objectsCount;e++)z.push(new I(t,e)),"sum"===Y.duplicateMethod?t+=Y.duplicateFactor*Y.firstObjectSize:"multiply"===Y.duplicateMethod&&(t*=Y.duplicateFactor)}function D(){if(d.eraseAll(),X.save(),Y.gradPreview)X.fillStyle=q,X.fillRect(0,0,S.width,S.height);else{X.fillStyle=`rgba(255, 255, 255, ${1-Y.framesOverlay})`,X.fillRect(0,0,P,Z),A=g.x*Y.mouseRotatePower/100,E=-g.y*Y.mouseRotatePower/100,X.strokeStyle=q,F=0;let t,e=0;for(;t=z[e++];){k+=(E-k)/Y.mouseRotateInertia,T+=(A-T)/Y.mouseRotateInertia,W+=(L-W)/Y.mouseRotateInertia;let i=Y.revertInnerRotate?Y.objectsCount-e+1:e+1;i*=Y.innerRotateSpeed/1e5,t.rotate(k*i,T*i,W*i),t.projection()}Y.autorotate&&(L+=Y.autorotateSpeed/10);let i,o=0;for(;i=j[o++];)i.draw(X)}X.restore(),requestAnimationFrame(D)}let _=()=>q=n().getActualGradient(S,Y),B=()=>Y.zoom=Y.perspective*Y.size;window.pane.on("change",(t=>{B(),H(),_()})),M=document.querySelector(".box"),S=document.querySelector("[data-canvas]"),X=S.getContext("2d"),window.addEventListener("mousewheel",(t=>{L+=t.wheelDelta})),G(),window.addEventListener("resize",G,!1),H(),_(),D(),B(),window.params=Y}();
//# sourceMappingURL=tetra.615cf13b.js.map