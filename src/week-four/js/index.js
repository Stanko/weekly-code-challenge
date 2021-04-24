import P5 from 'p5';
import { isoBands } from 'marchingsquares';
import smoothLine from './smooth-line';

const PADDING = 40;
const BREAKPOINT = 700;
const MARGIN = 20;
const ui = document.querySelector('.ui');

const MAX_CELLS = 32;
const cellSize = 22;
const scale = 0.15;
const textSize = cellSize * 0.6;
const textVerticalMargin = ((cellSize - textSize) / 2 + textSize) * 0.9;
const black = '#112';
const gray = '#ecf0f1';
const white = '#fff';
const purple = '#9b59b6';
const green = '#1abc9c';
const red = '#e74c3c';
const yellow = '#f1c40f';
const blue = '#3498db';
const orange = '#e67e22';
const darkGray = '#2c3e50';

let rows;
let columns;

let movement = 0;

setDimensions();

function setDimensions() {
  let maxWidth;
  let maxHeight;
  if (window.innerWidth < BREAKPOINT) {
    maxWidth = window.innerWidth - PADDING;
    maxHeight = window.innerHeight - PADDING - MARGIN - ui.clientHeight;
  } else {
    maxWidth = window.innerWidth - PADDING - MARGIN - ui.clientWidth;
    maxHeight = window.innerHeight - PADDING;
  }

  rows = Math.floor(maxHeight / cellSize);
  if (rows > MAX_CELLS) {
    rows = MAX_CELLS;
  }

  columns = Math.floor(maxWidth / cellSize);
  if (columns > MAX_CELLS) {
    columns = MAX_CELLS;
  }
}

new P5((sketch) => {
  // Set sketch as global variable
  let p5 = sketch;

  p5.setup = () => {
    p5.createCanvas(columns * cellSize, rows * cellSize);
  };

  p5.draw = () => {
    p5.background(gray);

    p5.textSize(textSize);

    const mode = document.querySelector('[name=mode]:checked').value;

    const data = [];

    for (let y = 0; y <= rows; y++) {
      data[y] = [];
      for (let x = 0; x <= columns; x++) {
        const n = p5.noise(x * scale + movement, y * scale + movement);
        data[y][x] = n;

        if (mode === 'numbers') {
          p5.noStroke();
          p5.fill(black);

          const text = Math.round(n * 100).toString();
          const textHorizontalMargin = (cellSize - p5.textWidth(text)) / 2;

          p5.text(
            text,
            x * cellSize + textHorizontalMargin,
            y * cellSize + textVerticalMargin
          );

          p5.noFill();
          p5.rect(x * cellSize, y * cellSize, cellSize, cellSize);
        } else if (mode === 'terrain') {
          let l = Math.round(60 - 40 * n);
          let s = 90;
          if (n > 0.8) {
            l = 100 * n;
            s = 100 * n;
          }
          const color = `hsl(${Math.round(235 - 120 * n)}, ${s}%, ${l}%)`;

          p5.fill(color);
          p5.noStroke();
          p5.rect(x * cellSize, y * cellSize, cellSize, cellSize);
        } else if (mode === 'wind') {
          // const color = `hsl(202, 100%, 50%)`;
          const color = `hsl(202, 100%, ${Math.round(20 + 80 * n)}%)`;

          p5.noFill();
          p5.stroke(color);
          // p5.strokeWeight(cellSize * 0.3);
          p5.strokeWeight(cellSize * 0.3 * (1 - n));

          const r = cellSize * 0.3 + cellSize * 0.2 * (1 - n);
          // const r = cellSize * 0.45;
          const center = {
            x: x * cellSize + cellSize * 0.5,
            y: y * cellSize + cellSize * 0.5,
          };

          const angle = Math.PI * 2 * n;

          p5.line(
            center.x + Math.cos(angle) * r,
            center.y + Math.sin(angle) * r,
            center.x + Math.cos(angle - Math.PI) * r,
            center.y + Math.sin(angle - Math.PI) * r
          );
        }

        p5.fill(0);
      }
    }

    if (mode === 'isolines') {
      p5.strokeWeight(3);
      p5.noFill();
      const ISO_STEP = 0.075;
      const colors = [
        green,
        yellow,
        orange,
        red,
        blue,
        purple,
        darkGray,
        black,
      ];

      for (let i = 0; i < 6; i++) {
        const color = colors[i];
        p5.stroke(color);
        const lines = isoBands(data, (i + 1) * (ISO_STEP * 2), ISO_STEP, {
          noQuadTree: true,
          noFrame: true,
        });

        lines.forEach((line) => {
          const bezier = smoothLine(
            line
              .map((p) => ({ x: p[0] * cellSize, y: p[1] * cellSize }))
              .slice(1),
            0.5
          );
          bezier.forEach((segment) => {
            p5.bezier(
              segment.start.x,
              segment.start.y,
              segment.controlPointStart.x,
              segment.controlPointStart.y,
              segment.controlPointEnd.x,
              segment.controlPointEnd.y,
              segment.end.x,
              segment.end.y
            );
          });
          // line.forEach((point, index) => {
          //   const nextPoint = line[(index + 1) % line.length];
          //   p5.line(
          //     point[0] * cellSize,
          //     point[1] * cellSize,
          //     nextPoint[0] * cellSize,
          //     nextPoint[1] * cellSize
          //   );
          // });
        });
      }
    }

    const animationState = document.querySelector('[name=animation]:checked')
      .value;

    if (animationState === 'stop') {
      p5.noLoop();
    } else {
      p5.loop();

      if (animationState === 'slow') {
        movement += 0.1;
        p5.frameRate(2);
      } else {
        movement += 0.01;
        p5.frameRate(60);
      }
    }
  };

  document.querySelectorAll('input[type=radio]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      p5.draw();
    });
  });

  let resizeTimeout;
  const RESIZE_DEBOUNCE_TIME = 100;

  p5.windowResized = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setDimensions();
      p5.resizeCanvas(columns * cellSize, rows * cellSize);
    }, RESIZE_DEBOUNCE_TIME);
  };
}, document.querySelector('.sketch'));
