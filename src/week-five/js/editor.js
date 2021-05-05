import LZString from './lz-string';
import { textMap, emptyMap } from './map';

const mapElement = document.querySelector('.map');
const resetButton = document.querySelector('.reset-map');
const saveButton = document.querySelector('.save-map');
const clearButton = document.querySelector('.clear-map');
const toggleButton = document.querySelector('.toggle-editor');
const editorElement = document.querySelector('.map-editor');

function resetToDefault() {
  mapElement.innerHTML = textMap.trim();
}

function clear() {
  mapElement.innerHTML = emptyMap;
}

function save() {
  const map = mapElement.innerHTML;

  if (map.length < 50) {
    alert('Your map is too short');
    return;
  }

  if (map.search('X') === -1) {
    alert(
      'Your map contains no exit, please use "X" to mark at least one exit'
    );
    return;
  }
  if (map.search(/[^xX to\n]/g) > -1) {
    alert(
      'Illegal characters will be ignored, allowed characters are "x", "X", " ", "o", "t"'
    );
  }

  const compressed = LZString.compressToEncodedURIComponent(map);

  window.location.search = `map=${compressed}`;
}

export function getMapFromUrl() {
  const parts = window.location.search.replace('?', '').split('&');

  for (let i = 0; i < parts.length; i++) {
    const split = parts[i].split('=');

    if (split[0] === 'map') {
      const userMap = LZString.decompressFromEncodedURIComponent(split[1]);

      if (userMap) {
        mapElement.innerHTML = userMap;
        const rowSeparator = userMap.search('<br>') > -1 ? '<br>' : '\n';
        return userMap.split(rowSeparator).map((row) => row.split(''));
      }
    }
  }

  return null;
}

getMapFromUrl() || resetToDefault();

resetButton.addEventListener('click', resetToDefault);
saveButton.addEventListener('click', save);
clearButton.addEventListener('click', clear);

let editorVisible = false;

toggleButton.addEventListener('click', () => {
  if (editorVisible) {
    editorElement.style.display = 'none';
    toggleButton.innerHTML = 'Show map editor';
  } else {
    editorElement.style.display = 'block';
    toggleButton.innerHTML = 'Hide map editor';
  }

  editorVisible = !editorVisible;
});
