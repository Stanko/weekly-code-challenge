import Game from './game';


const isHandHeld = Boolean(navigator.userAgent.match(/Android|iPhone|iPad|iPod/i));

function startGame() {
  const MAX_WIDTH = 100;
  const MAX_HEIGHT = 30;

  const singleCharElement = document.querySelector('.single-char');

  const documentComputedStyle = getComputedStyle(document.documentElement);
  
  const safeArea = {
    bottom: parseInt(documentComputedStyle.getPropertyValue('--safe-area-bottom'), 10),
    left: parseInt(documentComputedStyle.getPropertyValue('--safe-area-left'), 10),
    right: parseInt(documentComputedStyle.getPropertyValue('--safe-area-right'), 10),
    top: parseInt(documentComputedStyle.getPropertyValue('--safe-area-top'), 10),
  };

  const ratio = window.innerWidth / window.innerHeight;
  const handHeldHorizontalPadding = ratio > 1 ? 200 : 100;

  const horizontalPadding = isHandHeld ? handHeldHorizontalPadding : 150;
  const verticalPadding = isHandHeld ? 150 : 50;
  const windowWidth = window.innerWidth - horizontalPadding - safeArea.left - safeArea.right;

  const windowHeight = window.innerHeight - verticalPadding - safeArea.top - safeArea.bottom;

  let width = Math.floor(windowWidth / singleCharElement.clientWidth);
  let height = Math.floor(windowHeight / singleCharElement.clientHeight);

  console.log(width, height)

  if (width > MAX_WIDTH) {
    width = MAX_WIDTH;
  }
  if (height > MAX_HEIGHT) {
    height = MAX_HEIGHT; 
  }

  return new Game({
    width,
    height,
  });
}

let game = startGame();

let timeout = null;

window.addEventListener('resize', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (game) {
      game.destroy();
      document.querySelector('.field').remove();

      const pre = document.createElement('pre');
      pre.setAttribute('class', 'field');
      document.querySelector('.wrapper').prepend(pre)
    }
    game = startGame()
  }, 200);
});
