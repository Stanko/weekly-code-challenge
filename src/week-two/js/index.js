import { startVideo as htStartVideo, stopVideo as htStopVideo, load as htLoad } from 'handtrackjs';
import { PolySynth, Reverb, Synth } from 'tone';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
let toggleVideoButton = document.getElementById('toggle-video');
let statusElement = document.getElementById('status');

const synth = new PolySynth(Synth).toDestination();
const reverb = new Reverb(5, 1, 1).toDestination();
synth.connect(reverb);

let isVideo = false;
let model = null;

const modelParams = {
  flipHorizontal: true, // flip e.g for video
  maxNumBoxes: 5, // maximum number of boxes to detect
  imageScaleFactor: 0.5,
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.9, // confidence threshold for predictions.
};

function startVideo() {
  htStartVideo(video).then(function (status) {
    console.log('video started', status);
    if (status) {
      statusElement.innerText = 'Video started. Move your hands!';
      isVideo = true;
      runDetection();
    } else {
      statusElement.innerText = 'This demo needs access to camera, please enable video.';
    }
  });
}

function toggleVideo() {
  if (!isVideo) {
    statusElement.innerText = 'Starting video...';
    startVideo();
  } else {
    statusElement.innerText = 'Stopping video...';
    htStopVideo(video);
    isVideo = false;
    statusElement.innerText = 'Video stopped.';
  }
}

function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const history = [];
const MAX_HISTORY = 20;

let lastTime = null;

const notes = ['C4', 'D4', 'E4', 'G4', 'A4', 'C3', 'D3', 'E3', 'G3', 'A3']

function runDetection() {
  model.detect(video).then((predictions) => {
    // model.renderPredictions(predictions, canvas, context, video);
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = video.width;
    canvas.height = video.height;

    context.save();

    context.scale(-1, 1);
    context.translate(-video.width, 0);

    context.drawImage(video, 0, 0, video.width, video.height);

    context.fillStyle = `rgba(0, 0, 0, 0.5)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    history.push(predictions);

    predictions.forEach((prediction) => {
      prediction.center = {
        x: prediction.bbox[0] + prediction.bbox[2] / 2,
        y: prediction.bbox[1] + prediction.bbox[3] / 2,
      };
      prediction.radius =
        (prediction.bbox[2] > prediction.bbox[3]
          ? prediction.bbox[2]
          : prediction.bbox[3]) / 2;
    });

    if (history.length > MAX_HISTORY) {
      history.shift();
    }

    const now = performance.now();
    if (predictions.length && (!lastTime || now - lastTime > 250)) {
      synth.triggerAttackRelease(randomFromArray(notes), '8n');
      lastTime = now;
    }

    history.forEach((predictions, index) => {
      predictions.forEach((prediction) => {
        const factor = (index + 1) / MAX_HISTORY;
        const size = Math.round(prediction.bbox[3]);
        const MIN_SIZE = 0.5;
        const sizeFactor = MIN_SIZE + (1 - MIN_SIZE) * factor;

        const ratio = prediction.bbox[2] / prediction.bbox[3];

        let char;

        if (ratio < 0.6) { char = '✌️' }
        else if (ratio < 0.65) { char = '🤞' }
        else if (ratio < 0.7) { char = '👌' }
        else if (ratio < 0.75) { char = '✋' }
        else if (ratio < 0.8) { char = '🖖' }
        else if (ratio < 0.85) { char = '👍' }
        else if (ratio < 0.9) { char = '🖐' }
        else if (ratio < 0.95) { char = '✊' }
        else if (ratio < 1.1) { char = '🤟' }
        else if (ratio < 1.3) { char = '🤘' }
        else if (ratio < 1.5) { char = '🤙' }
        else if (ratio < 2) { char = '👈' }
        else { char = '👉' }

        context.font = `${size * sizeFactor}px serif`;
        context.fillStyle = `rgba(0, 0, 0, ${factor})`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        // draw the emoji
        context.fillText(char, prediction.center.x, prediction.center.y);
      });
    });

    if (isVideo) {
      requestAnimationFrame(runDetection);
    }
  });
}

// Load the model.
htLoad(modelParams).then((lmodel) => {
  // detect objects in the image.
  model = lmodel;
  statusElement.innerText = 'Loaded Model!';
  toggleVideoButton.disabled = false;

  toggleVideo();
});

toggleVideoButton.addEventListener('click', () => toggleVideo());
