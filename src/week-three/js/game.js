import random from '../../utils/random';

// ----------- CONSTANTS ----------- //

const BIRD_X = 10;

const FRAME_DURATION = 1000 / 60;

const BIRD_DEFAULT_VELOCITY = -0.15;
const BIRD_JUMP_VELOCITY = 0.15;
const BIRD_JUMP_DECAY = 0.015;
const BIRD_START_SPEED = 0.4;
const BIRD_MAX_SPEED = 1;
const BIRD_JUMP_DURATION = 12;

const WALL_MIN_HEIGHT = 0.2;
const WALL_MAX_HEIGHT = 0.6;
const WALL_FIRST_X = 60;
const WALL_DISTANCE = 40;
const WALL_COUNT = 100;

const BIRD_IMAGE_DOWN = [
  '../\\..',
  '>BIRD>',
  '......',
];
const BIRD_IMAGE_UP = [
  '......',
  '>BIRD>',
  '..\\/..',
];
const BIRD_IMAGE_COLOR = [
  '  yy  ',
  'yyyyyr',
  '  yy  ',
];

const GAME_OVER_IMAGE = [
  '--------------------',
  '|     GAME OVER    |',
  '|                  |',
  '|  TO RESTART TAP  |',
  '|   OR PRESS "R"   |',
  '--------------------',
];
const GAME_OVER_IMAGE_COLOR = [
  'bbbbbbbbbbbbbbbbbbbb',
  'b     xxxx xxxx    b',
  'b                  b',
  'b  gg ggggggg ggg  b',
  'b   gg ggggg ggg   b',
  'bbbbbbbbbbbbbbbbbbbb',
];

const YOU_WON_IMAGE = [
  '--------------------',
  '|     YOU WON!     |',
  '|                  |',
  '|  THANK YOU FOR   |',
  '|     PLAYING      |',
  '--------------------',
];
const YOU_WON_IMAGE_COLOR = [
  'gggggggggggggggggggg',
  'g     www wwww     g',
  'g                  g',
  'g  ggggg ggg ggg   g',
  'g     ggggggg      g',
  'gggggggggggggggggggg',
];

const CLOUD_COUNT = WALL_COUNT;
const CLOUD_DISTANCE = WALL_DISTANCE * 2;

const CLOUD_IMAGE_1 = [
  '...CLOUD....',
  'CLOUD.CLOUD.',
  '.CLOUD.CLOUD',
];

const CLOUD_IMAGE_2 = [
  '.CLOUD.CLOUD.......',
  'CLOUD..............',
  '.......CLOUD.CLOUD',
];

const CLOUD_IMAGE_3 = [
  '.......CLOUD.....',
  'CLOUD.CLOUD.CLOUD',
  '.......CLOUD.....',
  '.........CLOUD...'
];

const LS_HIGH_SCORE_KEY = 'high-score';

const getTime = typeof performance === 'function' ? performance.now : Date.now;

export default class Game {
  constructor({
    width = 30,
    height = 20,
  }) {
    this.width = width;
    this.height = height;
    this.maxHeight = this.height - 1;

    this.fieldElement = document.querySelector('.field'),

    this.bindEvents();
    this.restart();
  }

  // ----------- START / STOP ----------- //

  restart() {
    this.running = true;
    this.keys = {};
    this.canJump = true;
    this.distance = 0;
    this.birdSpeed = BIRD_START_SPEED;

    this.bird = {
      y: 10,
      velocity: BIRD_DEFAULT_VELOCITY,
    };

    this.walls = this.generateWalls();
    this.clouds = this.generateClouds();

    this.render();
    this.lastUpdate = getTime();
    this.animate();
  }

  stop() {
    this.running = false;
    const score = this.getScore();
    const highScore = parseInt(localStorage.getItem(LS_HIGH_SCORE_KEY), 10) || 0;

    if (score > highScore) {
      localStorage.setItem(LS_HIGH_SCORE_KEY, score);
    }
  }

  // ----------- EVENTS ----------- //

  handleKeyDown = (e) => {
    if (e.code.toLowerCase() === 'space') {
      this.keys.space = true;
    }
  }

  handleKeyUp = (e) => {
    this.canJump = true;
    this.keys = {};

    if (e.code.toLowerCase() === 'keyr') {
      this.restart();
    }
  }

  handleTouchStart = (e) => {
    if (this.running) {
      // e.preventDefault();
      // e.stopPropagation();
    } else {
      this.restart();
    }
    this.keys.space = true;
  }

  handleTouchMove = (e) => {
    if (this.running) {
      // e.preventDefault();
      // e.stopPropagation();
    }
  }

  handleTouchEnd = (e) => {
    this.canJump = true;
    this.keys = {};
  };

  bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchstart', this.handleTouchStart);
    window.addEventListener('touchend', this.handleTouchEnd);
    window.addEventListener('mousedown', this.handleTouchStart);
    window.addEventListener('mouseup', this.handleTouchEnd);
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchend', this.handleTouchEnd);
    window.removeEventListener('mousedown', this.handleTouchStart);
    window.removeEventListener('mouseup', this.handleTouchEnd);
  }

  // ----------- RENDER ----------- //

  render() {
    this.field = this.createEmptyField();

    this.drawClouds();
    this.drawWalls();
    this.drawBird();
    this.drawStats();

    const ground =  [
      '<span class="g">G</span>',
      '<span class="g">R</span>',
      '<span class="g">O</span>',
      '<span class="g">U</span>',
      '<span class="g">N</span>',
      '<span class="g">D</span>',
      ' ',
    ];
    const groundRow = [];
    for (let i = 0; i < this.width; i++) {
      groundRow.push(ground[(i + Math.round(this.distance)) % ground.length]);
    }

    this.field.unshift(groundRow);

    if (!this.running) {
      const bottom = Math.round(this.height / 2 - 3);
      const left = Math.round(this.width / 2 - 10);

      if (this.getScore() < WALL_COUNT) {
        this.draw(GAME_OVER_IMAGE, bottom, left, GAME_OVER_IMAGE_COLOR);
      } else {
        this.draw(YOU_WON_IMAGE, bottom, left, YOU_WON_IMAGE_COLOR);
      }      
    }

    this.fieldElement.innerHTML = this.field
      .reverse()
      .map((row) => {
        return row.join('');
      })
      .join('<br />');
  }

  createEmptyField() {
    const field = [];

    for (let row = 0; row < this.height; row++) {
      if (!field[row]) {
        field[row] = [];
      }

      for (let column = 0; column < this.width; column++) {
        field[row][column] = ' ';
      }
    }

    return field;
  }

  generateWalls() {
    const walls = [];
    const maxHeight = Math.round(WALL_MAX_HEIGHT * this.height);
    const minHeight = Math.round(WALL_MIN_HEIGHT * this.height);

    for (let i = 0; i < WALL_COUNT; i++) {
      walls.push({
        height: random(minHeight, maxHeight, null, 0),
        x: WALL_FIRST_X + i * WALL_DISTANCE,
        top: Math.random() > 0.5,
      });
    }

    return walls;
  }

  generateClouds() {
    const clouds = [];
    const cloudImages = [CLOUD_IMAGE_1, CLOUD_IMAGE_2, CLOUD_IMAGE_3];

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const cloudImage = cloudImages[random(0, 2, null, 0)];

      clouds.push({
        image: cloudImage,
        x: Math.round(i * (CLOUD_DISTANCE * random(0.5, 1.5))),
        bottom: Math.round(this.height * 0.5 + random(0, this.height * 0.3)),
      });
    }

    return clouds;
  }

  drawBird() {
    const y = Math.round(this.bird.y) - 1;
    const x = BIRD_X - 5; // minus bird's width

    const image = this.bird.velocity > 0 ? [...BIRD_IMAGE_UP] : [...BIRD_IMAGE_DOWN];

    if (!this.running) {
      if (this.getScore() < WALL_COUNT) {
        image[1] = image[1].replace('BIRD', 'NOES');
      } else {
        image[1] = image[1].replace('BIRD', 'EASY');
      }
    }

    this.draw(image, y, x, BIRD_IMAGE_COLOR)
  }

  drawClouds() {
    for (let i = 0; i < this.clouds.length; i++) {
      const cloud = this.clouds[i];
      const left = Math.round(cloud.x - this.distance * 0.5);
      const MIN_LEFT = -20;
      if (left < MIN_LEFT || left > this.width) {
        continue;
      }
      this.draw(cloud.image, cloud.bottom, left);
    }
  }

  drawWalls() {
    let start = Math.round((this.distance - WALL_FIRST_X) / WALL_DISTANCE);

    if (start < 0) {
      start = 0;
    }

    let end = Math.ceil(start + this.width / WALL_DISTANCE);

    if (end > this.walls.length - 1) {
      end = this.walls.length - 1;
    }

    for (let i = start; i <= end; i++) {
      const wall = this.walls[i];

      if (wall.x < this.distance + this.width) {
        this.drawWall(wall);
      }
    }
  }

  drawWall(wall) {
    const image = [];
    const colorMap = [];
    const x = Math.round(wall.x - this.distance);

    for (let i = 0; i < wall.height; i++) {
      image.push('WALL');
      colorMap.push('dddd');
    }

    let y = 0;
    if (wall.top) {
      y = this.height - wall.height;
    }

    this.draw(image, y, x, colorMap);
  }

  draw(image, bottom, left, colorMap = null) {
    const imageReversed = [...image].reverse();
    const colorMapReversed = colorMap ? [...colorMap].reverse() : null;

    imageReversed.forEach((row, y) => {
      row.split('').forEach((pixel, x) => {
        const fieldRow = this.field[bottom + y];
        
        if (fieldRow && fieldRow[left + x]) {
          if (pixel !== '.') {
            let content = pixel;
            if (colorMapReversed && colorMapReversed[y][x] !== ' ') {
              content = `<span class="${colorMapReversed[y][x]}">${pixel}</span>`
            }
            fieldRow[left + x] = content;
          }
        }
      });
    });
  }

  drawStats() {
    const highScore = parseInt(localStorage.getItem(LS_HIGH_SCORE_KEY), 10) || 0;

    const image = [
      `score: ${this.getScore()}`,
      ` best: ${highScore}`,
    ];
    const colorMap = [
      'bbbbbb xxx',
      ' bbbbb xxx',
    ];
    this.draw(image, this.height - 2, this.width - 10, colorMap);
  }

  // ----------- LOGIC ----------- //

  checkForCrash() {
    // Bird crashed into the  ground
    if (this.bird.y < 0) {
      this.stop();
    }

    // Bird crashed into a wall
    for (let i = 0; i < this.walls.length; i++) {
      const wall = this.walls[i];
      const wallX = Math.round(wall.x - this.distance);

      if (BIRD_X >= wallX - 1 && BIRD_X <= wallX + 2) {
        if (wall.top) {
          if (this.bird.y >= this.height - wall.height) {
            this.stop();
            return;
          }
        } else if (this.bird.y <= wall.height) {
          this.stop();
          return;
        }
      }
    }
  }

  checkJump() {
    if (this.keys.space && this.canJump) {
      this.jumpCount++;
      this.bird.velocity = (1 + 0.1 * this.jumpCount) * BIRD_JUMP_VELOCITY;

      if (this.jumpCount > BIRD_JUMP_DURATION) {
        this.jumpCount = 0;
        this.canJump = false;
      }
    } else {
      this.jumpCount = 0;
    }
  }

  update(delta) {
    this.distance += delta * this.birdSpeed;

    this.bird.y += delta * this.bird.velocity;

    if (this.bird.y > this.maxHeight) {
      this.bird.y = this.maxHeight;
    }

    if (this.bird.velocity > BIRD_DEFAULT_VELOCITY) {
      this.bird.velocity -= BIRD_JUMP_DECAY;
    }

    if (this.bird.velocity < BIRD_DEFAULT_VELOCITY) {
      this.bird.velocity = BIRD_DEFAULT_VELOCITY;
    }

    if (this.birdSpeed < BIRD_MAX_SPEED) {
      this.birdSpeed = BIRD_START_SPEED + this.distance / 1000;
    }
  }

  animate() {
    if (!this.running) {
      return;
    }

    const now = getTime();
    // We are checking how much time has passed since the last update
    // and translating that to frames
    const delta = (now - this.lastUpdate) / FRAME_DURATION;

    this.checkJump(now);
    this.update(delta);
    this.checkForCrash();
    this.render();

    this.lastUpdate = now;

    if (this.running) {
      requestAnimationFrame(() => this.animate());
    }
  }

  getScore() {
    let score = Math.ceil((this.distance - WALL_FIRST_X) / WALL_DISTANCE);
    if (score < 0) {
      score = 0;
    }

    return score;
  }
}
