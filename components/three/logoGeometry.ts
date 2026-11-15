import * as THREE from 'three';

/* =============================================================================
   Solid 3D CodeVyasa mark — built from dimensions measured off the real artwork
   (public/assets/brand/logo-mark.png, 1440×1148), expressed in the SAME
   normalised space the particle logo uses (overall bbox centre, height = 1), so
   the glass logo lands exactly where the particles assemble.

     hexagon  front face 895×(51→1028) px, rounded corners, 75 px stroke
     chevron  tips (494,436)/(494,716), apex (664,580), 80 px stroke, round caps
     bar      pill x 695→991, y 663→756
   ========================================================================== */

const IMG = { cx: 709.5, cy: 548, h: 972 }; // overall opaque bbox (matches sampleLogo)
const N = (px: number, py: number) => new THREE.Vector2((px - IMG.cx) / IMG.h, -(py - IMG.cy) / IMG.h);
const U = (px: number) => px / IMG.h;

/** Polygon with rounded corners (quadratic fillets of tangent length `d`). */
function roundedPath(path: THREE.Path, pts: THREE.Vector2[], d: number) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[(i - 1 + n) % n];
    const v = pts[i];
    const q = pts[(i + 1) % n];
    const a = v.clone().add(p.clone().sub(v).setLength(Math.min(d, p.distanceTo(v) / 2)));
    const b = v.clone().add(q.clone().sub(v).setLength(Math.min(d, q.distanceTo(v) / 2)));
    if (i === 0) path.moveTo(a.x, a.y);
    else path.lineTo(a.x, a.y);
    path.quadraticCurveTo(v.x, v.y, b.x, b.y);
  }
  path.closePath();
}

const cross = (a: THREE.Vector2, b: THREE.Vector2) => a.x * b.y - a.y * b.x;

/** Intersection of lines p + s·r and q + u·v. */
function intersect(p: THREE.Vector2, r: THREE.Vector2, q: THREE.Vector2, v: THREE.Vector2) {
  const s = cross(q.clone().sub(p), v) / cross(r, v);
  return p.clone().add(r.clone().multiplyScalar(s));
}

/** Inset a counter-clockwise polygon by `t` (offset edges inward, re-intersect). */
function inset(pts: THREE.Vector2[], t: number) {
  const n = pts.length;
  const lines = pts.map((v, i) => {
    const d = pts[(i + 1) % n].clone().sub(v).normalize();
    const nrm = new THREE.Vector2(-d.y, d.x); // left normal = inward for CCW
    return { o: v.clone().add(nrm.multiplyScalar(t)), d };
  });
  return pts.map((_, i) => {
    const a = lines[(i - 1 + n) % n];
    const b = lines[i];
    return intersect(a.o, a.d, b.o, b.d);
  });
}

function hexagonShape() {
  // CCW (y-up): top → upper-left → lower-left → bottom → lower-right → upper-right
  const outer = [N(683.5, 51), N(236, 320), N(236, 759), N(683.5, 1028), N(1131, 759), N(1131, 320)];
  const inner = inset(outer, U(75));
  const shape = new THREE.Shape();
  roundedPath(shape, outer, U(40));
  const hole = new THREE.Path();
  roundedPath(hole, inner, U(15));
  shape.holes.push(hole);
  return shape;
}

function chevronShape() {
  const P0 = N(494, 436);
  const P1 = N(664, 580);
  const P2 = N(494, 716);
  const hw = U(40);
  const d1 = P1.clone().sub(P0).normalize();
  const d2 = P2.clone().sub(P1).normalize();
  const n1 = new THREE.Vector2(-d1.y, d1.x);
  const n2 = new THREE.Vector2(-d2.y, d2.x);
  const off = (p: THREE.Vector2, n: THREE.Vector2, k: number) => p.clone().add(n.clone().multiplyScalar(k * hw));
  const mA = intersect(off(P0, n1, 1), d1, off(P1, n2, 1), d2);
  const mB = intersect(off(P0, n1, -1), d1, off(P1, n2, -1), d2);
  const outerIsA = mA.x > mB.x; // the convex side of the bend points right

  const shape = new THREE.Shape();
  const cap = (c: THREE.Vector2, n: THREE.Vector2, d: THREE.Vector2, steps = 12) => {
    for (let k = 1; k <= steps; k++) {
      const f = (Math.PI * k) / steps;
      const p = c.clone().add(n.clone().multiplyScalar(Math.cos(f) * hw)).add(d.clone().multiplyScalar(Math.sin(f) * hw));
      shape.lineTo(p.x, p.y);
    }
  };
  const corner = (m: THREE.Vector2, from: THREE.Vector2, to: THREE.Vector2, round: boolean) => {
    if (!round) {
      shape.lineTo(m.x, m.y);
      return;
    }
    const r = U(26);
    const a = m.clone().add(from.clone().sub(m).setLength(r));
    const b = m.clone().add(to.clone().sub(m).setLength(r));
    shape.lineTo(a.x, a.y);
    shape.quadraticCurveTo(m.x, m.y, b.x, b.y);
  };

  const s0 = off(P0, n1, 1);
  shape.moveTo(s0.x, s0.y);
  corner(mA, s0, off(P2, n2, 1), outerIsA);
  const e2 = off(P2, n2, 1);
  shape.lineTo(e2.x, e2.y);
  cap(P2, n2, d2); // round cap at the bottom tip, ends on the −n2 side
  corner(mB, off(P2, n2, -1), off(P0, n1, -1), !outerIsA);
  const s1 = off(P0, n1, -1);
  shape.lineTo(s1.x, s1.y);
  cap(P0, n1.clone().negate(), d1.clone().negate()); // round cap at the top tip, back to start
  return shape;
}

function barShape() {
  const a = N(695, 663);
  const b = N(991, 756);
  const r = (a.y - b.y) / 2; // y-up: a.y is the top
  const cy = (a.y + b.y) / 2;
  const shape = new THREE.Shape();
  shape.moveTo(a.x + r, a.y);
  shape.lineTo(b.x - r, a.y);
  shape.absarc(b.x - r, cy, r, Math.PI / 2, -Math.PI / 2, true);
  shape.lineTo(a.x + r, b.y);
  shape.absarc(a.x + r, cy, r, -Math.PI / 2, Math.PI / 2, true);
  return shape;
}

/** Extruded, bevelled logo. Front face sits at z ≈ +0.025 (matches the particles). */
export function buildLogoGeometry() {
  const depth = 0.05;
  const bevelThickness = 0.026;
  const bevelSize = 0.02;
  // generous rounded edges catch studio light like cut glass; the negative offset
  // keeps the silhouette exactly on the logo outline
  const geo = new THREE.ExtrudeGeometry([hexagonShape(), chevronShape(), barShape()], {
    depth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelOffset: -bevelSize,
    bevelSegments: 7,
    curveSegments: 28,
  });
  geo.translate(0, 0, -(depth + bevelThickness - 0.025));
  geo.computeVertexNormals();
  return geo;
}
