/* =============================================================================
   Hand rigs for the "Creation" hero.

   The hand models (public/assets/models, MIT — see LICENSE-hands.txt) are the
   WebXR generic hands: 25 joints that are flat siblings (no bone hierarchy), so
   posing is done here with a small forward-kinematics pass per finger chain.

   • Human hand  → the skinned model, posed, plus a forearm.
   • Robot hand  → the same skeleton, but the skin is replaced by machined parts
                   (segmented phalanges, joint pivots, palm shell, power core,
                   forearm with pistons) bolted to the bones, so it poses and
                   animates exactly like the human one.
   ========================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export type Side = 'left' | 'right';
export const FINGERS = ['thumb', 'index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'] as const;
export type Finger = (typeof FINGERS)[number];
/** Flexion (degrees) per joint from the metacarpal outwards; `spread` fans the finger sideways. */
export type FingerPose = { flex: number[]; spread?: number };
export type HandPose = Record<Finger, FingerPose>;

const JOINTS: Record<Finger, string[]> = {
  thumb: ['metacarpal', 'phalanx-proximal', 'phalanx-distal', 'tip'],
  'index-finger': ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'],
  'middle-finger': ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'],
  'ring-finger': ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'],
  'pinky-finger': ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'],
};
const chain = (f: Finger) => JOINTS[f].map((j) => `${f}-${j}`);
const DEG = Math.PI / 180;

export function loadHand(url: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    new GLTFLoader().load(url, (g) => resolve(g.scene), undefined, reject);
  });
}

/** Blend two poses (k = 0 → a, 1 → b). */
export function mixPose(a: HandPose, b: HandPose, k: number): HandPose {
  const out = {} as HandPose;
  for (const f of FINGERS) {
    out[f] = {
      flex: a[f].flex.map((v, i) => v + ((b[f].flex[i] ?? v) - v) * k),
      spread: (a[f].spread ?? 0) + ((b[f].spread ?? 0) - (a[f].spread ?? 0)) * k,
    };
  }
  return out;
}

const _m = new THREE.Matrix4();
const _t = new THREE.Matrix4();
const _r = new THREE.Matrix4();
const _r2 = new THREE.Matrix4();
const _v = new THREE.Vector3();
const _n = new THREE.Vector3();
const _a = new THREE.Vector3();

export class HandRig {
  /** Place / orient / scale this in the world. */
  readonly root = new THREE.Group();
  readonly bones = new Map<string, THREE.Bone>();
  readonly rest = new Map<string, { p: THREE.Vector3; q: THREE.Quaternion }>();
  /** Rest-pose frame in model space: finger direction, back-of-hand normal, palm normal. */
  readonly forward: THREE.Vector3;
  readonly back: THREE.Vector3;
  readonly palm: THREE.Vector3;
  readonly skin: THREE.SkinnedMesh;
  /** Container parented like the bones (model space) — extra parts go here or on bones. */
  readonly armature: THREE.Object3D;

  constructor(model: THREE.Group, readonly side: Side) {
    let skin: THREE.SkinnedMesh | null = null;
    model.traverse((o) => {
      if ((o as THREE.Bone).isBone) this.bones.set(o.name, o as THREE.Bone);
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) skin = o as THREE.SkinnedMesh;
    });
    if (!skin) throw new Error('hand model has no skinned mesh');
    this.skin = skin;
    this.skin.frustumCulled = false;
    this.armature = this.bones.get('wrist')!.parent!;
    this.bones.forEach((b, name) => this.rest.set(name, { p: b.position.clone(), q: b.quaternion.clone() }));

    const P = (n: string) => this.rest.get(n)!.p;
    this.forward = P('middle-finger-phalanx-proximal').clone().sub(P('wrist')).normalize();
    const across = P('index-finger-phalanx-proximal').clone().sub(P('pinky-finger-phalanx-proximal')).normalize();
    const n = new THREE.Vector3().crossVectors(this.forward, across).normalize();
    this.back = side === 'right' ? n : n.negate();
    this.back.sub(this.forward.clone().multiplyScalar(this.back.dot(this.forward))).normalize();
    this.palm = this.back.clone().negate();
    this.root.add(model);
  }

  /** Orient the hand: fingers along `fwd`, back of the hand facing `backDir` (world). */
  orient(fwd: THREE.Vector3, backDir: THREE.Vector3) {
    const F = fwd.clone().normalize();
    const B = backDir.clone().sub(F.clone().multiplyScalar(backDir.dot(F))).normalize();
    const local = new THREE.Matrix4().makeBasis(this.forward, this.back, new THREE.Vector3().crossVectors(this.forward, this.back));
    const world = new THREE.Matrix4().makeBasis(F, B, new THREE.Vector3().crossVectors(F, B));
    this.root.quaternion.setFromRotationMatrix(world.multiply(local.transpose()));
  }

  /** Forward kinematics: each joint bends everything beyond it (flat skeleton → manual chain). */
  pose(p: HandPose) {
    for (const f of FINGERS) {
      const names = chain(f);
      const fp = p[f];
      _m.identity();
      for (let i = 0; i < names.length; i++) {
        const r = this.rest.get(names[i])!;
        const bone = this.bones.get(names[i])!;
        const pos = _v.copy(r.p).applyMatrix4(_m);
        bone.position.copy(pos);
        if (i < names.length - 1) {
          const dir = _a.copy(this.rest.get(names[i + 1])!.p).applyMatrix4(_m).sub(pos).normalize();
          const pn = _n.copy(this.palm).transformDirection(_m);
          const axis = dir.cross(pn).normalize();
          _r.makeRotationAxis(axis, (fp.flex[i] ?? 0) * DEG);
          if (i === 1 && fp.spread) _r.premultiply(_r2.makeRotationAxis(pn, fp.spread * DEG));
          _m.premultiply(_t.makeTranslation(-pos.x, -pos.y, -pos.z)).premultiply(_r).premultiply(_t.makeTranslation(pos.x, pos.y, pos.z));
        }
        bone.quaternion.setFromRotationMatrix(_m).multiply(r.q);
      }
    }
  }

  /** World position of a joint (after pose + placement). */
  jointWorld(name: string, out = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return this.bones.get(name)!.getWorldPosition(out);
  }

  /** Wrist-local frame: fwd → knuckles, across → index side, normal = across × fwd. */
  wristFrame() {
    const wr = this.rest.get('wrist')!;
    const inv = new THREE.Matrix4().compose(wr.p, wr.q, new THREE.Vector3(1, 1, 1)).invert();
    const L = (n: string) => this.rest.get(n)!.p.clone().applyMatrix4(inv);
    const index = L('index-finger-phalanx-proximal');
    const pinky = L('pinky-finger-phalanx-proximal');
    const middle = L('middle-finger-phalanx-proximal');
    const fwd = middle.clone().normalize();
    const a = index.clone().sub(pinky);
    const across = a.clone().sub(fwd.clone().multiplyScalar(a.dot(fwd))).normalize();
    const normal = new THREE.Vector3().crossVectors(across, fwd).normalize();
    const backLocal = this.back.clone().applyQuaternion(wr.q.clone().invert());
    return {
      fwd,
      across,
      normal,
      /** +1 if `normal` points out of the back of the hand, −1 if out of the palm */
      backSign: Math.sign(backLocal.dot(normal)) || 1,
      basis: new THREE.Matrix4().makeBasis(across, fwd, normal),
      knuckleSpan: a.length(),
      palmLen: middle.length(),
    };
  }

  /** Bone-local frame of a rest-pose segment: origin at joint a, Y toward joint b. */
  segmentFrame(a: string, b: string) {
    const ra = this.rest.get(a)!;
    const inv = new THREE.Matrix4().compose(ra.p, ra.q, new THREE.Vector3(1, 1, 1)).invert();
    const end = this.rest.get(b)!.p.clone().applyMatrix4(inv);
    const len = end.length();
    const Y = end.clone().normalize();
    const pn = this.palm.clone().applyQuaternion(ra.q.clone().invert());
    const X = new THREE.Vector3().crossVectors(Y, pn).normalize(); // lateral (joint axis)
    const Z = new THREE.Vector3().crossVectors(X, Y).normalize(); // toward the palm side
    return { len, X, Y, Z };
  }
}

/* --------------------------------------------------------------- human hand */

export function dressHuman(rig: HandRig, skin: THREE.Material) {
  rig.skin.material = skin;
  // forearm: a soft tapered limb running back from the wrist, off-screen
  const W = rig.wristFrame();
  const len = 0.36;
  const geo = new THREE.CylinderGeometry(0.0255, 0.031, len, 40, 8, false);
  geo.translate(0, -len / 2, 0);
  const arm = new THREE.Mesh(geo, skin);
  arm.quaternion.setFromRotationMatrix(W.basis);
  arm.position.copy(W.fwd).multiplyScalar(0.012);
  arm.scale.set(1.12, 1, 0.74);
  rig.bones.get('wrist')!.add(arm);
}

/* --------------------------------------------------------------- robot hand */

export type RobotMaterials = { shell: THREE.Material; joint: THREE.Material; dark: THREE.Material; core: THREE.Material };

// segment widths (m) per finger, from the metacarpal (thumb) / proximal outwards
const WIDTH: Record<Finger, number[]> = {
  thumb: [0.023, 0.02, 0.018],
  'index-finger': [0, 0.0178, 0.0162, 0.015],
  'middle-finger': [0, 0.0184, 0.0168, 0.0154],
  'ring-finger': [0, 0.0172, 0.0158, 0.0146],
  'pinky-finger': [0, 0.015, 0.0138, 0.0128],
};

export function buildRobot(rig: HandRig, m: RobotMaterials) {
  rig.skin.visible = false;

  for (const f of FINGERS) {
    const names = chain(f);
    for (let i = f === 'thumb' ? 0 : 1; i < names.length - 1; i++) {
      const bone = rig.bones.get(names[i])!;
      const { len, X, Y, Z } = rig.segmentFrame(names[i], names[i + 1]);
      const w = WIDTH[f][i];
      const t = w * 0.9;
      const isTip = i === names.length - 2;
      const segLen = len * (isTip ? 0.98 : 0.74);
      const basis = new THREE.Matrix4().makeBasis(X, Y, Z);

      // machined phalanx shell
      const shell = new THREE.Mesh(new RoundedBoxGeometry(w, segLen, t, 3, Math.min(w, t) * (isTip ? 0.48 : 0.3)), m.shell);
      shell.quaternion.setFromRotationMatrix(basis);
      shell.position.copy(Y).multiplyScalar(isTip ? len * 0.47 : len * 0.5);
      bone.add(shell);

      // dark inner spine visible in the joint gaps
      if (!isTip) {
        const spine = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, len * 1.02, t * 0.5), m.dark);
        spine.quaternion.copy(shell.quaternion);
        spine.position.copy(Y).multiplyScalar(len * 0.5);
        bone.add(spine);
      }

      // joint pivot (axle across the finger)
      if (i >= 1 || f === 'thumb') {
        const piv = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.4, w * 0.4, w * 1.16, 24), m.joint);
        piv.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), X);
        bone.add(piv);
      }
    }
  }

  // palm shell: a bevelled trapezoid from the wrist to the knuckles
  const W = rig.wristFrame();
  const { fwd, normal } = W;
  const acrossN = W.across;
  const palmLen = W.palmLen * 0.9;
  const knuckleW = W.knuckleSpan + 0.016;
  const wristW = 0.052;
  const shape = new THREE.Shape();
  shape.moveTo(-wristW / 2, 0);
  shape.lineTo(wristW / 2, 0);
  shape.lineTo(knuckleW / 2, palmLen * 0.86);
  shape.quadraticCurveTo(knuckleW / 2, palmLen, knuckleW / 2 - 0.008, palmLen);
  shape.lineTo(-knuckleW / 2 + 0.008, palmLen);
  shape.quadraticCurveTo(-knuckleW / 2, palmLen, -knuckleW / 2, palmLen * 0.86);
  shape.closePath();
  const depth = 0.018;
  const palmGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 8 });
  palmGeo.translate(0, 0, -depth / 2);
  const wristBone = rig.bones.get('wrist')!;
  // dark chassis …
  const palmMesh = new THREE.Mesh(palmGeo, m.dark);
  palmMesh.quaternion.setFromRotationMatrix(W.basis);
  wristBone.add(palmMesh);
  const side = W.backSign;
  // … with a white cover plate inset on the back of the hand (and a thinner one on the palm)
  for (const [face, inset, thick] of [[side, 0.005, 0.007], [-side, 0.008, 0.004]] as const) {
    const plate = new THREE.Shape();
    const kw = knuckleW / 2 - inset;
    const ww = wristW / 2 - inset * 0.6;
    plate.moveTo(-ww, inset * 1.6);
    plate.lineTo(ww, inset * 1.6);
    plate.lineTo(kw, palmLen * 0.84);
    plate.quadraticCurveTo(kw, palmLen - inset, kw - 0.008, palmLen - inset);
    plate.lineTo(-kw + 0.008, palmLen - inset);
    plate.quadraticCurveTo(-kw, palmLen - inset, -kw, palmLen * 0.84);
    plate.closePath();
    const pg = new THREE.ExtrudeGeometry(plate, { depth: thick, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 3, curveSegments: 8 });
    pg.translate(0, 0, face > 0 ? depth / 2 + 0.002 : -depth / 2 - 0.002 - thick);
    const pm = new THREE.Mesh(pg, m.shell);
    pm.quaternion.setFromRotationMatrix(W.basis);
    wristBone.add(pm);
  }
  // raised knuckle caps over each finger's base joint
  for (const f of ['index-finger', 'middle-finger', 'ring-finger', 'pinky-finger'] as const) {
    const wr = rig.rest.get('wrist')!;
    const inv = new THREE.Matrix4().compose(wr.p, wr.q, new THREE.Vector3(1, 1, 1)).invert();
    const at = rig.rest.get(`${f}-phalanx-proximal`)!.p.clone().applyMatrix4(inv);
    const w = WIDTH[f][1];
    const cap = new THREE.Mesh(new RoundedBoxGeometry(w * 1.08, w * 0.95, w * 0.62, 3, w * 0.24), m.shell);
    cap.quaternion.setFromRotationMatrix(W.basis);
    cap.position.copy(at).add(normal.clone().multiplyScalar(side * (depth / 2 + 0.006))).add(fwd.clone().multiplyScalar(-0.006));
    wristBone.add(cap);
  }

  // back-of-hand power core (glows through the halftone) + its bezel
  const coreAt = fwd.clone().multiplyScalar(palmLen * 0.5).add(normal.clone().multiplyScalar(side * (depth / 2 + 0.0125)));
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.0125, 0.0028, 12, 40), m.joint);
  bezel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  bezel.position.copy(coreAt);
  wristBone.add(bezel);
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.0105, 40), m.core);
  core.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.clone().multiplyScalar(side));
  core.position.copy(coreAt).add(normal.clone().multiplyScalar(side * 0.0008));
  wristBone.add(core);

  // wrist joint + forearm with rings and pistons (all in the wrist frame:
  // X across the hand, Y toward the knuckles, Z through the palm)
  const back = fwd.clone().negate();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.022, 32, 16), m.joint);
  ball.quaternion.setFromRotationMatrix(W.basis);
  ball.scale.set(1.15, 1, 0.8);
  wristBone.add(ball);
  const armLen = 0.36;
  const armGeo = new THREE.CylinderGeometry(0.024, 0.03, armLen, 40, 1, false);
  armGeo.translate(0, -armLen / 2, 0); // extends toward −Y = back from the wrist
  const arm = new THREE.Mesh(armGeo, m.shell);
  arm.quaternion.setFromRotationMatrix(W.basis);
  arm.position.copy(back).multiplyScalar(0.02);
  arm.scale.set(1.12, 1, 0.8);
  wristBone.add(arm);
  for (const d of [0.05, 0.12, 0.2]) {
    const ringGeo = new THREE.TorusGeometry(0.0255 + d * 0.016, 0.0024, 10, 48);
    ringGeo.rotateX(Math.PI / 2); // axis → Y
    const ring = new THREE.Mesh(ringGeo, m.dark);
    ring.quaternion.setFromRotationMatrix(W.basis);
    ring.position.copy(back).multiplyScalar(0.02 + d);
    ring.scale.set(1.12, 1, 0.8);
    wristBone.add(ring);
  }
  for (const s of [-1, 1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0038, 0.0038, 0.2, 12), m.joint);
    rod.quaternion.setFromRotationMatrix(W.basis);
    rod.position.copy(back).multiplyScalar(0.12).add(acrossN.clone().multiplyScalar(s * 0.032));
    wristBone.add(rod);
  }
}
