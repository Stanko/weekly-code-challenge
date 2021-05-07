export function addVectors(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
  };
}

export function multiplyVector(v, scalar) {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  };
}

export function getVector(v1, v2) {
  return {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
  };
}

export function rotateVector(v, angle) {
  return {
    x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
    y: v.x * Math.sin(angle) + v.y * Math.cos(angle),
  };
}

export function compareVectors(v1, v2) {
  return v1.x === v2.x && v1.y === v2.y;
}

export function getVectorVelocity(v) {
  const x = v.x;
  const y = v.y;

  return Math.sqrt(x * x + y * y);
}

export function getVectorAngle(v) {
  return Math.atan2(v.y, v.x);
}

export function getDistance(v1, v2) {
  const x = v1.x - v2.x;
  const y = v1.y - v2.y;

  return Math.sqrt(x * x + y * y);
}
