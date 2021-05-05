import { Object3D, Euler, Raycaster, Matrix4, Vector3 } from 'three';

const PointerLockControls = function (
  camera,
  mass,
  playerHeight,
  worldObjects
) {
  var scope = this;

  scope.worldObjects = worldObjects;

  camera.rotation.set(0, 0, 0);

  var pitchObject = new Object3D();
  pitchObject.add(camera);

  var yawObject = new Object3D();
  yawObject.position.y = playerHeight;
  yawObject.add(pitchObject);

  var PI_2 = Math.PI / 2;

  var onMouseMove = function (event) {
    if (scope.enabled === false) return;

    var movementX =
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY =
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;

    pitchObject.rotation.x = Math.max(
      -PI_2,
      Math.min(PI_2, pitchObject.rotation.x)
    );
  };

  scope.dispose = function () {
    document.removeEventListener('mousemove', onMouseMove, false);
  };

  document.addEventListener('mousemove', onMouseMove, false);

  scope.enabled = false;

  scope.getPlayer = function () {
    return yawObject;
  };

  scope.getDirection = (function () {
    // assumes the camera itself is not rotated

    var direction = new Vector3(0, 0, -1);
    var rotation = new Euler(0, 0, 0, 'YXZ');

    return function (v) {
      rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

      v.copy(direction).applyEuler(rotation);

      return v;
    };
  })();

  // FPS Controls Additions

  scope.updatePlayerHeight = function (height) {
    yawObject.position.y = height;
  };

  scope.raycasters = {
    down: new Raycaster(new Vector3(), new Vector3(0, -1, 0), 0, 20),
    up: new Raycaster(new Vector3(), new Vector3(0, 1, 0), 0, 20),
    forward: new Raycaster(new Vector3(), new Vector3(0, 0, -1), 0, 15),
    backward: new Raycaster(new Vector3(), new Vector3(), 0, 15),
    left: new Raycaster(new Vector3(), new Vector3(), 0, 15),
    right: new Raycaster(new Vector3(), new Vector3(), 0, 15),
    rightStrafe: new Raycaster(new Vector3(), new Vector3(), 0, 30),
    leftStrafe: new Raycaster(new Vector3(), new Vector3(), 0, 30),

    updateRaycasters: function () {
      this.up.ray.origin.copy(scope.playersPosition);
      this.down.ray.origin.copy(scope.playersPosition);
      this.forward.ray.set(scope.playersPosition, scope.camDir);
      this.backward.ray.set(scope.playersPosition, scope.camDir.negate());
      this.left.ray.set(
        scope.playersPosition,
        scope.camDir.applyMatrix4(new Matrix4().makeRotationY(-(Math.PI / 2)))
      );
      this.right.ray.set(
        scope.playersPosition,
        scope.camDir.applyMatrix4(new Matrix4().makeRotationY(Math.PI))
      );
      this.rightStrafe.ray.set(
        scope.playersPosition,
        scope.camDir.applyMatrix4(new Matrix4().makeRotationY(Math.PI / 4))
      ); // Working
      this.leftStrafe.ray.set(
        scope.playersPosition,
        scope.camDir.applyMatrix4(new Matrix4().makeRotationY(Math.PI / 4))
      );
    },
  };

  scope.intersections = {
    down: scope.raycasters.down.intersectObjects(worldObjects),
    up: scope.raycasters.up.intersectObjects(worldObjects),
    forward: scope.raycasters.forward.intersectObjects(worldObjects),
    backward: scope.raycasters.backward.intersectObjects(worldObjects),
    left: scope.raycasters.left.intersectObjects(worldObjects),
    right: scope.raycasters.right.intersectObjects(worldObjects),
    rightStrafe: scope.raycasters.rightStrafe.intersectObjects(worldObjects),
    leftStrafe: scope.raycasters.leftStrafe.intersectObjects(worldObjects),

    checkIntersections: function () {
      this.down = scope.raycasters.down.intersectObjects(worldObjects);
      this.up = scope.raycasters.up.intersectObjects(worldObjects);
      this.forward = scope.raycasters.forward.intersectObjects(worldObjects);
      this.backward = scope.raycasters.backward.intersectObjects(worldObjects);
      this.left = scope.raycasters.left.intersectObjects(worldObjects);
      this.right = scope.raycasters.right.intersectObjects(worldObjects);
      this.rightStrafe = scope.raycasters.rightStrafe.intersectObjects(
        worldObjects
      );
      this.leftStrafe = scope.raycasters.leftStrafe.intersectObjects(
        worldObjects
      );
    },
  };

  scope.movements = {
    forward: false,
    backward: false,
    left: false,
    right: false,

    locks: {
      forward: true,
      backward: true,
      left: true,
      right: true,
    },

    lock: function () {
      var intersections = scope.intersections;
      for (var direction in intersections) {
        if (intersections[direction].length > 0) {
          //console.log(direction, "lock");
          this.locks[direction] = true;
        }
      }
    },

    unlock: function () {
      this.locks.forward = false;
      this.locks.backward = false;
      this.locks.left = false;
      this.locks.right = false;
    },
  };

  scope.baseHeight = 0; // The minimum plane height
  scope.mass = mass || 100;
  scope.originalMass = mass;
  scope.walkingSpeed = 3000; // Higher = slower
  scope.speed = 900; // Movement speed
  scope.velocity = new Vector3(1, 1, 1);

  scope.walking = false;

  scope.walk = function (boolean) {
    scope.walking = boolean;
  };

  // So you can update the world objects when they change
  scope.updateWorldObjects = function (worldObjects) {
    scope.worldObjects = worldObjects;
  };

  scope.updateControls = function () {
    scope.time = performance.now();

    scope.movements.unlock();

    // Check change and if Walking?
    scope.delta = scope.walking
      ? (scope.time - scope.prevTime) / scope.walkingSpeed
      : (scope.time - scope.prevTime) / scope.speed;
    var validDelta = isNaN(scope.delta) === false;
    if (validDelta) {
      // Velocities
      scope.velocity.x -= scope.velocity.x * 8.0 * scope.delta; // Left and right
      scope.velocity.z -= scope.velocity.z * 8.0 * scope.delta; // Forward and back
      scope.velocity.y -= scope.walking
        ? 9.8 * scope.mass * scope.delta
        : 5.5 * scope.mass * scope.delta; // Up and Down

      scope.camDir = new Vector3();
      scope.getPlayer().getWorldDirection(scope.camDir);
      scope.camDir.negate();
      scope.playersPosition = scope.getPlayer().position.clone();

      scope.raycasters.updateRaycasters();
      scope.intersections.checkIntersections();
      scope.movements.lock();

      // If your head hits an object, turn your mass up to make you fall back to earth
      scope.isBelowObject = scope.intersections.up.length > 0;
      scope.mass = scope.isBelowObject === true ? 500 : scope.originalMass;

      scope.isOnObject = scope.intersections.down.length > 0;
      if (scope.isOnObject === true) {
        scope.velocity.y = Math.max(0, scope.velocity.y);
      } else {
        this.walking = false;
      }

      // Movements

      if (
        scope.movements.forward &&
        !scope.walking &&
        !scope.movements.locks.forward
      )
        scope.velocity.z -= 400.0 * scope.delta;
      if (
        scope.movements.forward &&
        scope.walking &&
        !scope.movements.locks.forward
      )
        scope.velocity.z -= 1000.0 * scope.delta;
      if (scope.movements.backward && !scope.movements.locks.backward)
        scope.velocity.z += 400.0 * scope.delta;
      if (scope.movements.left && !scope.movements.locks.left)
        scope.velocity.x -= 400.0 * scope.delta;
      if (scope.movements.right && !scope.movements.locks.right)
        scope.velocity.x += 400.0 * scope.delta;

      // Velocity translations
      scope.getPlayer().translateX(scope.velocity.x * scope.delta);
      scope.getPlayer().translateY(scope.velocity.y * scope.delta);
      scope.getPlayer().translateZ(scope.velocity.z * scope.delta);
    }

    scope.prevTime = scope.time; // Set the previous time to the time we set at the begining
  };
};

export default PointerLockControls;
