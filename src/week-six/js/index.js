import P5 from 'p5';
import { getVector, multiplyVector, getDistance } from './vectors';

const offset = 4;
const padding = 50;

function keysIntersect(r1, r2) {
  return !(
    r2.left - offset > r1.right + offset ||
    r2.right + offset < r1.left - offset ||
    r2.top - offset > r1.bottom + offset ||
    r2.bottom + offset < r1.top - offset
  );
}

function compare(a, b, epsilon = offset * 2) {
  return Math.abs(a - b) <= epsilon;
}

const maxKeysInRow = 14.2;
const keyRows = 5.5;

const keySize = 60;

const map = `
tttttttttttttt
ooooooooooooo1
1ooooooooooooo
2ooooooooooo3
4oooooooooo4
ooo1sootot
`
  .trim()
  .split('\n')
  .map((row) => row.split(''));

const keySettings = {
  t: {
    rateY: 0.5,
    rateX: 1,
  },
  1: {
    rateX: 1.2,
  },
  2: {
    rateX: 1.3,
  },
  3: {
    rateX: 1.4,
  },
  4: {
    rateX: 1.5,
  },
  s: {
    rateX: 5,
  },
};

const defaultKey = {
  rateX: 1,
  rateY: 1,
};

const width = maxKeysInRow * keySize + padding * 2;
const height = keyRows * keySize + padding * 2;

let space = null;

let keys = [];

map.forEach((row, rowIndex) => {
  let x = 0;

  row.forEach((cell, cellIndex) => {
    const customSettings = keySettings[cell] || { rateX: 1 };

    let y = keySize * rowIndex;

    if (rowIndex === 0) {
      y = keySize * 0.25;
    }

    const key = {
      ...defaultKey,
      ...customSettings,
      x: x + (keySize * customSettings.rateX) / 2,
      y: y,
    };

    if (cell === 's') {
      key.space = true;
      space = key;
    }

    keys.push(key);

    x += keySize * customSettings.rateX;
  });
});

keys.forEach((key) => {
  key.top = key.y;
  key.bottom = key.y;
  key.left = key.x;
  key.right = key.x;
  key.w = 0;
  key.h = 0;
});

const spaceDiv = document.querySelector('.space');
const spaceImgDiv = document.querySelector('.space-img');

const input = document.querySelector('input');
input.value = 0;

let spaceOffset = parseFloat(input.value);

let imageOffset = { x: 0, y: 0 };

function moveHandler(event) {
  const e = event.touches ? event.touches[0] : event;
  const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
  const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

  imageOffset = {
    x,
    y,
  };

  spaceImgDiv.style.transform = `translate(${imageOffset.x * 10}%, ${
    imageOffset.y * 10
  }%) rotateX(${imageOffset.x * 20}deg) rotateY(${imageOffset.y * 20}deg)`;
}
window.addEventListener('touchmove', moveHandler);
window.addEventListener('mousemove', moveHandler);

new P5((sketch) => {
  // Set sketch as global variable
  let p5 = sketch;

  input.addEventListener('input', () => {
    spaceOffset = parseFloat(input.value);
    p5.draw();
  });

  p5.setup = () => {
    p5.createCanvas(width, height);
  };

  p5.draw = () => {
    // p5.background('#ddd');
    p5.clear();
    // p5.noFill();

    const speed = 1;

    for (let i = 0; i < keys.length; i++) {
      let k1 = keys[i];

      if (k1.left <= 0) {
        k1.stopLeft = true;
      }
      if (k1.right >= width - 2 * padding) {
        k1.stopRight = true;
      }

      if (k1.top <= 0) {
        k1.stopTop = true;
      }
      if (k1.bottom >= height - 2 * padding) {
        k1.stopBottom = true;
      }

      for (let j = 0; j < keys.length; j++) {
        if (i === j) {
          continue;
        }

        let k2 = keys[j];

        if (keysIntersect(k1, k2)) {
          if (compare(k1.bottom, k2.top)) {
            k1.stopBottom = true;
          }
          if (compare(k1.top, k2.bottom)) {
            k1.stopTop = true;
          }

          if (compare(k1.left, k2.right)) {
            k1.stopLeft = true;
          }
          if (compare(k1.right, k2.left)) {
            k1.stopRight = true;
          }
        }
      }
    }

    keys.forEach((key) => {
      if (key.stopRight && key.stopLeft && key.stopBottom && key.stopTop) {
        return;
      }

      if (!key.stopRight) {
        key.right += key.rateX * speed;
        key.w += key.rateX * speed;
      }
      if (!key.stopLeft) {
        key.left -= key.rateX * speed;
        key.w += key.rateX * speed;
      }
      if (!key.stopBottom) {
        key.bottom += key.rateY * speed;
        key.h += key.rateY * speed;
      }
      if (!key.stopTop) {
        key.top -= key.rateY * speed;
        key.h += key.rateY * speed;
      }
    });

    keys.forEach((key) => {
      const w = space.w * spaceOffset;
      const h = space.h * spaceOffset;
      const leftOffset = (w - space.w) / 2;
      const topOffset = (h - space.h) / 2 + 35 * (spaceOffset - 1);

      if (key.space) {
        const left = padding + key.left - leftOffset;
        const top = padding + key.top - topOffset;

        spaceDiv.style.left = `${left}px`;
        spaceDiv.style.top = `${top}px`;
        spaceDiv.style.width = `${w}px`;
        spaceDiv.style.height = `${h}px`;

        const size = 120 + 100 * (6 - spaceOffset);
        const margin = (20 + 100 * (6 - spaceOffset)) / -2;
        spaceImgDiv.style.width = `${size}%`;
        spaceImgDiv.style.height = `${size}%`;
        spaceImgDiv.style.left = `${margin}%`;
        spaceImgDiv.style.top = `${margin}%`;

        p5.rect(
          padding + key.left - leftOffset,
          padding + key.top - topOffset,
          w,
          h,
          10
        );
      } else {
        const vectorSpaceKey = getVector(key, space);
        const distance = getDistance(key, space);
        const newDistance = distance + 100 * (spaceOffset - 1);

        const vectorSpaceKeyMultiplied = multiplyVector(
          vectorSpaceKey,
          newDistance / distance
        );
        const vector = getVector(vectorSpaceKeyMultiplied, vectorSpaceKey);

        p5.rect(
          padding + key.left + vector.x,
          padding + key.top + vector.y,
          key.w,
          key.h,
          10
        );
      }
      // p5.circle(padding + key.x, padding + key.y, 3);
    });

    let shouldStop = true;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (!key.stopBottom || !key.stopTop || !key.stopLeft || !key.stopRight) {
        shouldStop = false;
        break;
      }
    }

    if (shouldStop) {
      spaceDiv.style.opacity = 1;
      p5.noLoop();
    }
  };

  // p5.windowResized = () => {
  //   clearTimeout(resizeTimeout);
  //   resizeTimeout = setTimeout(() => {
  //     setDimensions();
  //     p5.resizeCanvas(columns * cellSize, rows * cellSize);
  //   }, RESIZE_DEBOUNCE_TIME);
  // };
}, document.querySelector('.sketch'));
