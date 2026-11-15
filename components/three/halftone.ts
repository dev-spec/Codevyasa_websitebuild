/* =============================================================================
   Screen-space effects for the "Creation" hero.

   HALFTONE — the 3D hands are rendered (lit, in colour) into a small offscreen
   buffer; this pass redraws them as a fixed grid of round dots. Dark theme: LED
   dots that grow with brightness. Light theme: ink dots that grow with shade.
   Because the hands are real 3D, the dots ripple as they move and the camera
   drifts. A boot-in sweeps the dots on from the screen edges toward the centre.

   BURST — the light behind the glass mark: core glow, slow-turning rays with an
   iridescent tint, and a fine filament reaching out toward both fingertips.
   ========================================================================== */

/** Full-screen quad at the far plane (depth-tested so glass occludes it). The
 *  grid is laid out from the quad's own UVs, not gl_FragCoord, so it stays put in
 *  any render target (the glass renders the scene at its own resolution). */
export const SCREEN_VERT = /* glsl */ `
varying vec2 vScreen;
void main() {
  vScreen = position.xy + 0.5;
  gl_Position = vec4(position.xy * 2.0, 0.9999, 1.0);
}
`;

export const HALFTONE_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform vec2 uRes;      // drawing-buffer size (px)
uniform float uCell;    // dot pitch (px)
uniform float uLight;   // 0 dark … 1 light theme
uniform float uReveal;  // 0 → 1 boot-in
varying vec2 vScreen;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec2 frag = vScreen * uRes;
  vec2 cell = floor(frag / uCell);
  vec2 cc = (cell + 0.5) * uCell;
  vec4 s = texture2D(uTex, cc / uRes);
  float cov = s.a;
  if (cov < 0.03) discard;
  vec3 col = s.rgb / max(cov, 0.001);
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));

  // boot-in: dots switch on from the screen edges toward the centre, hot at the front
  float h = hash(cell);
  float edge = abs(cc.x / uRes.x - 0.5) * 2.0;
  float thr = (1.0 - edge) * 0.8 + h * 0.2;
  float k = uReveal * 1.12 - thr;
  float on = smoothstep(0.0, 0.05, k);
  if (on <= 0.0) discard;
  float hot = 1.0 - smoothstep(0.0, 0.14, k);

  float b = clamp(lum * 1.3, 0.0, 1.0);
  float rDark = mix(0.17, 0.5, sqrt(b));    // LED: brighter → bigger
  float rLight = mix(0.44, 0.33, b);        // print: even dots, a touch fuller in shade
  // the forearms dissolve toward the screen edges so the eye travels to the centre
  float dissolve = mix(0.2, 1.0, smoothstep(0.99, 0.6, edge));
  float r = mix(rDark, rLight, uLight) * smoothstep(0.03, 0.55, cov) * (0.93 + 0.14 * h) * on * dissolve * uCell;
  float d = length(frag - cc);
  float a = 1.0 - smoothstep(r - 0.85, r + 0.35, d);
  if (a <= 0.004) discard;

  // keep the hue, cap the level: highlights glow (bloom) instead of clipping to white bars
  vec3 hue = col / max(1.0, max(col.r, max(col.g, col.b)));
  vec3 led = hue * (0.36 + 0.78 * b) + hot * vec3(0.3, 1.1, 1.3);
  // print: the hue, toned from deep shade to a mid tone — slate robot, warm sepia skin
  vec3 ink = hue * mix(0.05, 0.3, b) + hot * vec3(0.0, 0.35, 0.42);
  gl_FragColor = vec4(mix(led, ink, uLight), a);
  #include <colorspace_fragment>
}
`;

export const BURST_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const BURST_FRAG = /* glsl */ `
uniform float uIntensity;
uniform float uSpin;
uniform float uReach;    // fingertip distance from the centre, in quad half-widths
uniform float uHole;     // the mark's radius, in quad half-widths — rays start around it
uniform float uLight;
varying vec2 vUv;

void main() {
  vec2 p = (vUv - 0.5) * 2.0;   // square quad: −1 … 1
  float d = length(p);
  float a = atan(p.y, p.x);
  float edge = 1.0 - smoothstep(0.62, 0.98, d); // nothing reaches the quad's sides
  float ring = smoothstep(uHole * 0.55, uHole * 1.15, d); // keep the particle mark itself clear

  float core = (exp(-d * 9.0) * 0.16 + exp(-d * 3.6) * 0.2) * edge;
  float r1 = pow(abs(cos(a * 3.0 + uSpin)), 90.0);
  float r2 = pow(abs(cos(a * 4.0 + 0.7 - uSpin * 0.6)), 180.0) * 0.7;
  float r3 = pow(abs(cos(a * 9.0 + 1.9 + uSpin * 0.3)), 320.0) * 0.45;
  float rays = (r1 + r2 + r3) * exp(-d * 2.3) * edge * ring;
  // the filament: a hair-thin horizontal line out toward both fingertips
  float fil = exp(-abs(p.y) * 120.0) * (0.35 + 0.65 * exp(-abs(p.x) * 1.4)) * (1.0 - smoothstep(uReach * 0.85, uReach * 1.02, abs(p.x))) * ring;

  vec3 cyan = vec3(0.1, 0.8, 0.95);
  vec3 irid = mix(vec3(0.5, 0.42, 1.0), vec3(1.0, 0.45, 0.72), 0.5 + 0.5 * sin(a * 2.0 + uSpin));
  vec3 tint = mix(cyan, irid, 0.2 + 0.16 * sin(a * 3.0 - uSpin));
  vec3 glow = tint * (rays * 1.3 + fil * 1.1) + vec3(0.62, 0.95, 1.0) * core;

  if (uLight > 0.5) {
    // light theme: a soft teal glow laid over the white studio
    float m = clamp((rays * 0.9 + fil * 0.9 + core * 0.55) * uIntensity, 0.0, 0.8);
    gl_FragColor = vec4(mix(vec3(0.03, 0.58, 0.68), tint * 0.8, 0.35), m);
  } else {
    gl_FragColor = vec4(glow * uIntensity, 1.0);
  }
  #include <colorspace_fragment>
}
`;
