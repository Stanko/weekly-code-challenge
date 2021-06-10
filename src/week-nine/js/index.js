// minified:
// 'javascript:var scale=.1,borderWidth=45,maxBorderOffset=.3*borderWidth,body=document.querySelector("body");function getMaxScroll(){return window.scrollMaxY||document.documentElement.scrollHeight-document.documentElement.clientHeight}function update(){body.style.height=content.offsetHeight+"px";var e=window.scrollY/getMaxScroll()*2-1,t=maxBorderOffset*e,o=borderWidth-t,e=borderWidth+t,t=t*document.documentElement.clientHeight/100;frame.style.borderTopWidth=o+"vh",frame.style.borderBottomWidth=e+"vh",content.style.top=window.scrollY*-scale-t+"px"}var htmlPre=\'<div class="deep-content" style="box-sizing: border-box; left: 0; transform: translateY(45vh) scale(0.1); transform-origin: center top; position: fixed; width: 100vw;">\',htmlPost=\'</div><div class="deep-frame" style="box-sizing: border-box; pointer-events: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border-left: 45vw solid #ccc; border-right: 45vw solid #eee; border-top: 45vh solid #ddd; border-bottom: 45vh solid #bbb;"></div>\';body.innerHTML=htmlPre+body.innerHTML+htmlPost;var content=document.querySelector(".deep-content"),frame=document.querySelector(".deep-frame");update(),window.addEventListener("scroll",()=>{update()}),window.addEventListener("resize",()=>{update()});';

var scale = 0.1;
var borderWidth = ((1 - 0.1) / 2) * 100;
var maxBorderOffset = borderWidth * 0.3;

var body = document.querySelector('body');

function getMaxScroll() {
  return (
    window.scrollMaxY ||
    document.documentElement.scrollHeight -
      document.documentElement.clientHeight
  );
}

function update() {
  body.style.height = content.offsetHeight + 'px';
  var percentageScroll = (window.scrollY / getMaxScroll()) * 2 - 1;
  var borderOffset = maxBorderOffset * percentageScroll;
  var borderTop = borderWidth - borderOffset;
  var borderBottom = borderWidth + borderOffset;
  var topOffset = (borderOffset * document.documentElement.clientHeight) / 100;
  frame.style.borderTopWidth = borderTop + 'vh';
  frame.style.borderBottomWidth = borderBottom + 'vh';
  content.style.top = window.scrollY * -scale - topOffset + 'px';
}

var htmlPre =
  '<div class="deep-content" style="box-sizing: border-box; left: 0; transform: translateY(45vh) scale(0.1); transform-origin: center top; position: fixed; width: 100vw;">';
var htmlPost =
  '</div><div class="deep-frame" style="box-sizing: border-box; pointer-events: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border-left: 45vw solid #ccc; border-right: 45vw solid #eee; border-top: 45vh solid #ddd; border-bottom: 45vh solid #bbb;"></div>';

body.innerHTML = htmlPre + body.innerHTML + htmlPost;

var content = document.querySelector('.deep-content');
var frame = document.querySelector('.deep-frame');

update();

window.addEventListener('scroll', () => {
  update();
});
window.addEventListener('resize', () => {
  update();
});
