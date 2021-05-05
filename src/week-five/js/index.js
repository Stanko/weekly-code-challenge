import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Euler,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry';

import PointerLockControls from './fps-controls';
import enablePointerLock from './pointerlock';
import { getMapFromUrl } from './editor';

import defaultMap from './map';

let levelMap = getMapFromUrl() || defaultMap;

import decalDiffuseImg from '../img/decal-diffuse.png';

const DEBUG = window.location.hash === '#debug';

const MIN_SCALE = 30;
const MAX_SCALE = 50;
const BLOCK_SIZE = 25;

const Game = (function () {
  // Instance stores a reference to the Singleton
  let instance;

  function startGame() {
    let camera, scene, renderer;
    let controls;
    let mesh;
    let raycaster = new Raycaster();
    let line;
    const exitBlocks = [];

    const intersection = {
      intersects: false,
      point: new Vector3(),
      normal: new Vector3(),
    };

    const mouse = new Vector2();
    const intersects = [];

    const textureLoader = new TextureLoader();
    const decalDiffuse = textureLoader.load(decalDiffuseImg);

    const decalMaterial = new MeshPhongMaterial({
      specular: 0xffffff,
      map: decalDiffuse,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    });

    const decals = [];
    let mouseHelper;
    const position = new Vector3();
    const orientation = new Euler();
    const size = new Vector3(10, 10, 10);

    init();
    animate();

    function init() {
      eventHandlers();
      scene = new Scene();

      scene.add(new AmbientLight(0xffffff));

      const lineGeometry = new BufferGeometry();
      lineGeometry.setFromPoints([new Vector3(), new Vector3()]);

      line = new Line(lineGeometry, new LineBasicMaterial());
      line.visible = false;
      scene.add(line);

      loadMap();

      camera = new PerspectiveCamera(
        80,
        window.innerWidth / window.innerHeight,
        1,
        9000
      );
      controls = new PointerLockControls(camera, 100, 20, [mesh]);
      scene.add(controls.getPlayer());

      mouseHelper = new Mesh(
        new SphereGeometry(1),
        new MeshBasicMaterial({ color: 0x5097d5 })
      );
      // mouseHelper.visible = false;
      scene.add(mouseHelper);

      window.addEventListener('pointerup', (event) => {
        if (controls.enabled) {
          checkIntersection(event.clientX, event.clientY);

          if (intersection.intersects) {
            shoot();
          }
        }
      });

      window.addEventListener('pointermove', (event) => {
        if (event.isPrimary && controls.enabled) {
          checkIntersection(event.clientX, event.clientY);
        }
      });

      function checkIntersection(x, y) {
        if (mesh === undefined) {
          return;
        }

        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        raycaster.intersectObject(mesh, false, intersects);

        if (intersects.length > 0) {
          const p = intersects[0].point;
          mouseHelper.position.copy(p);
          intersection.point.copy(p);

          const n = intersects[0].face.normal.clone();
          n.transformDirection(mesh.matrixWorld);
          n.multiplyScalar(10);
          n.add(intersects[0].point);

          intersection.normal.copy(intersects[0].face.normal);
          mouseHelper.lookAt(n);

          const positions = line.geometry.attributes.position;
          positions.setXYZ(0, p.x, p.y, p.z);
          positions.setXYZ(1, n.x, n.y, n.z);
          positions.needsUpdate = true;

          intersection.intersects = true;

          intersects.length = 0;
        } else {
          intersection.intersects = false;
        }
      }

      function shoot() {
        position.copy(intersection.point);
        orientation.copy(mouseHelper.rotation);

        orientation.z = Math.random() * 2 * Math.PI;

        const scale = MIN_SCALE + Math.random() * (MAX_SCALE - MIN_SCALE);
        size.set(scale, scale, scale);

        const material = decalMaterial.clone();
        const RANDOM_COLOR = window.location.hash === '#color';

        if (RANDOM_COLOR) {
          material.color = new Color(0xffffff * Math.random());
        }

        const m = new Mesh(
          new DecalGeometry(mesh, position, orientation, size),
          material
        );

        decals.push(m);
        scene.add(m);
      }

      renderer = new WebGLRenderer({ antialias: true }); //new WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      enablePointerLock(controls);
      document.body.appendChild(renderer.domElement);
    }

    function animate() {
      if (controls.enabled) {
        controls.updateControls();
        const playerPosition = controls.getPlayer().position;

        for (let i = 0; i < exitBlocks.length; i++) {
          const exitBlock = exitBlocks[i];

          const x = exitBlock.x - playerPosition.x;
          const z = exitBlock.z - playerPosition.z;

          const d = Math.sqrt(x * x + z * z);

          if (d < BLOCK_SIZE * 0.7) {
            document.querySelector('.content--win').style.display = 'block';
            document.querySelector('.content--info').style.display = 'none';
            controls.done = true;
            controls.enabled = false;

            if (document.exitPointerLock) {
              document.exitPointerLock();
            } else if (document.mozExitPointerLock) {
              document.mozExitPointerLock();
            } else if (document.webkitExitPointerLock) {
              document.webkitExitPointerLock();
            }

            break;
          }
        }
        renderer.render(scene, camera);
      }

      requestAnimationFrame(animate);
    }

    function loadMap() {
      if (mesh) {
        scene.remove(mesh);
      }
      const blockSize = BLOCK_SIZE;
      const floorThickness = 5;

      const r = blockSize * 0.5;
      const height = 50;

      const floorX = blockSize * levelMap[0].length;
      const floorZ = blockSize * levelMap.length;

      const offsetX = blockSize * 2;
      const offsetZ = blockSize * 2;

      const floor = new BoxGeometry(floorX, floorThickness, floorZ);
      floor.applyMatrix4(
        new Matrix4().makeTranslation(
          (floorX - blockSize) / 2 - offsetX,
          floorThickness / -2,
          (floorZ - blockSize) / 2 - offsetZ
        )
      );
      const ceiling = new BoxGeometry(floorX, floorThickness, floorZ);
      ceiling.applyMatrix4(
        new Matrix4().makeTranslation(
          (floorX - blockSize) / 2 - offsetX,
          height + floorThickness / 2,
          (floorZ - blockSize) / 2 - offsetZ
        )
      );
      const geometries = [floor, ceiling];

      levelMap.forEach((row, z) => {
        row.forEach((cell, x) => {
          let g = null;

          if (cell === 'x' || cell === 'X') {
            g = new BoxGeometry(blockSize, height, blockSize);
          } else if (cell === 'o') {
            g = new CylinderGeometry(r, r * 0.9, height, 32);
          } else if (cell === 't') {
            g = new SphereGeometry(r, 32, 32);
          }

          if (g) {
            g.applyMatrix4(
              new Matrix4().makeTranslation(
                x * blockSize - offsetX,
                height / 2,
                z * blockSize - offsetZ
              )
            );
            if (cell === 'X') {
              exitBlocks.push({
                x: x * blockSize - offsetX,
                z: z * blockSize - offsetZ,
              });

              const exitMesh = new Mesh(
                g,
                DEBUG
                  ? new MeshBasicMaterial({ color: 0xff0000 })
                  : new MeshNormalMaterial()
              );
              scene.add(exitMesh);
            } else {
              geometries.push(g);
            }
          }
        });
      });
      mesh = new Mesh(
        BufferGeometryUtils.mergeBufferGeometries(geometries),
        DEBUG
          ? new MeshNormalMaterial()
          : new MeshBasicMaterial({ color: 0x00000 })
      );

      scene.add(mesh);
    }

    function eventHandlers() {
      // Keyboard press handlers
      let onKeyDown = function (event) {
        // event.preventDefault();
        // event.stopPropagation();
        handleKeyInteraction(event.keyCode, true);
      };
      let onKeyUp = function (event) {
        // event.preventDefault();
        // event.stopPropagation();
        handleKeyInteraction(event.keyCode, false);
      };
      document.addEventListener('keydown', onKeyDown, false);
      document.addEventListener('keyup', onKeyUp, false);

      // Resize Event
      window.addEventListener('resize', onWindowResize, false);
    }

    // HANDLE KEY INTERACTION
    function handleKeyInteraction(keyCode, boolean) {
      switch (keyCode) {
        case 38: // up
        case 87: // w
          controls.movements.forward = boolean;
          break;

        case 40: // down
        case 83: // s
          controls.movements.backward = boolean;
          break;

        case 37: // left
        case 65: // a
          controls.movements.left = boolean;
          break;

        case 39: // right
        case 68: // d
          controls.movements.right = boolean;
          break;

        case 67: // c
          if (boolean) {
            window.location.hash === '#color'
              ? (window.location.hash = '')
              : (window.location.hash = '#color');
          }
          break;

        case 16: // shift
          controls.walk(boolean);
          break;
      }
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    return {
      setJumpFactor: function (setJumpFactor) {
        jumpFactor = setJumpFactor;
      },
    };
  }

  return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
      if (!instance) {
        instance = startGame();
      }

      return instance;
    },
  };
})();

const game = Game.getInstance();
