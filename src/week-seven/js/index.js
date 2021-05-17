class Box extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `<div class="front"></div>
      <div class="back"></div>
      <div class="right"></div>
      <div class="left"></div>
      <div class="bottom"></div>
      <div class="top"></div>`;
  }
}

window.customElements.define('css-box', Box);

class Person extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `<div class="person-top">
      <div class="head-wrapper">
        <css-box class="head"></css-box>
      </div>
      <div class="arm">
        <css-box class="arm-top"></css-box>
        <css-box class="arm-bottom"></css-box>
      </div>
      <css-box class="torso"></css-box>
      <div class="arm arm-right">
        <css-box class="arm-top"></css-box>
        <css-box class="arm-bottom"></css-box>
      </div>
    </div>
    <div class="legs">
      <div class="leg leg-left">
        <css-box class="leg-top"></css-box>
        <css-box class="leg-bottom"></css-box>
        <css-box class="leg-shoe"></css-box>
      </div>
      <div class="leg leg-right">
        <css-box class="leg-top"></css-box>
        <css-box class="leg-bottom"></css-box>
        <css-box class="leg-shoe"></css-box>
      </div>
    </div>`;
  }
}

window.customElements.define('css-person', Person);

// const wrapper = document.querySelector('.wrapper');

// window.addEventListener('mousemove', (e) => {
//   wrapper.style.transform = `rotateY(${
//     (e.clientX / window.innerWidth) * 360
//   }deg) rotateX(5deg)`;
// });

const addMoreButton = document.querySelector('.add-more-button');
const row = document.querySelector('.row');

addMoreButton.addEventListener('click', () => {
  if (document.querySelectorAll('css-person').length >= 30) {
    return;
  }
  row.innerHTML += `<css-person></css-person>`;
});

// Add more people on safari
const ua = navigator.userAgent.toLowerCase();

if (ua.indexOf('safari') != -1) {
  if (ua.indexOf('chrome') > -1) {
    // Chrome
  } else {
    row.innerHTML += `<css-person></css-person>
    <css-person></css-person>
    <css-person></css-person>
    <css-person></css-person>
    <css-person></css-person>
    <css-person></css-person>`;
  }
}
