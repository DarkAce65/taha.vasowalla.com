export const staticVertexShader = [
  'varying vec2 vUv;',

  'void main() {',
  '  vUv = uv;',
  '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
  '  gl_Position = projectionMatrix * mvPosition;',
  '}',
].join('\n');

export const noiseVertexShader = [
  'uniform float u_time;',

  'varying vec2 vUv;',
  'varying vec3 noise;',

  '// Credit for Perlin noise function goes to https://github.com/ashima/webgl-noise',

  'vec3 mod289(vec3 x) {',
  '  return x - floor(x * (1.0 / 289.0)) * 289.0;',
  '}',

  'vec4 mod289(vec4 x) {',
  '  return x - floor(x * (1.0 / 289.0)) * 289.0;',
  '}',

  'vec4 permute(vec4 x) {',
  '  return mod289(((x * 34.0) + 1.0) * x);',
  '}',

  'vec4 taylorInvSqrt(vec4 r) {',
  '  return 1.79284291400159 - 0.85373472095314 * r;',
  '}',

  'float snoise(vec3 v) {',
  '  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);',
  '  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);',

  '  // First corner',
  '  vec3 i  = floor(v + dot(v, C.yyy));',
  '  vec3 x0 =   v - i + dot(i, C.xxx);',

  '  // Other corners',
  '  vec3 g = step(x0.yzx, x0.xyz);',
  '  vec3 l = 1.0 - g;',
  '  vec3 i1 = min(g.xyz, l.zxy);',
  '  vec3 i2 = max(g.xyz, l.zxy);',

  '  //   x0 = x0 - 0.0 + 0.0 * C.xxx;',
  '  //   x1 = x0 - i1  + 1.0 * C.xxx;',
  '  //   x2 = x0 - i2  + 2.0 * C.xxx;',
  '  //   x3 = x0 - 1.0 + 3.0 * C.xxx;',
  '  vec3 x1 = x0 - i1 + C.xxx;',
  '  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y',
  '  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y',

  '  // Permutations',
  '  i = mod289(i);',
  '  vec4 p = permute(permute(permute(',
  '      i.z + vec4(0.0, i1.z, i2.z, 1.0))',
  '    + i.y + vec4(0.0, i1.y, i2.y, 1.0))',
  '    + i.x + vec4(0.0, i1.x, i2.x, 1.0));',

  '  // Gradients: 7x7 points over a square, mapped onto an octahedron.',
  '  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)',
  '  float n_ = 0.142857142857; // 1.0/7.0',
  '  vec3  ns = n_ * D.wyz - D.xzx;',

  '  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)',

  '  vec4 x_ = floor(j * ns.z);',
  '  vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)',

  '  vec4 x = x_ * ns.x + ns.yyyy;',
  '  vec4 y = y_ * ns.x + ns.yyyy;',
  '  vec4 h = 1.0 - abs(x) - abs(y);',

  '  vec4 b0 = vec4(x.xy, y.xy);',
  '  vec4 b1 = vec4(x.zw, y.zw);',

  '  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;',
  '  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;',
  '  vec4 s0 = floor(b0) * 2.0 + 1.0;',
  '  vec4 s1 = floor(b1) * 2.0 + 1.0;',
  '  vec4 sh = -step(h, vec4(0.0));',

  '  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy ;',
  '  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww ;',

  '  vec3 p0 = vec3(a0.xy, h.x);',
  '  vec3 p1 = vec3(a0.zw, h.y);',
  '  vec3 p2 = vec3(a1.xy, h.z);',
  '  vec3 p3 = vec3(a1.zw, h.w);',

  '  //Normalise gradients',
  '  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));',
  '  p0 *= norm.x;',
  '  p1 *= norm.y;',
  '  p2 *= norm.z;',
  '  p3 *= norm.w;',

  '  // Mix final noise value',
  '  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
  '  m = m * m;',
  '  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));',
  '}',

  'void main() {',
  '  vUv = uv;',
  '  noise.r = snoise(vec3(uv * 5.0, u_time / 8.0));',
  '  noise.g = snoise(vec3(uv * 2.5, u_time / 6.0));',
  '  noise.b = snoise(vec3(uv * 1.25, u_time / 4.0));',

  '  vec2 bl = smoothstep(vec2(0.0), vec2(0.1), uv);',
  '  vec2 tr = smoothstep(vec2(0.0), vec2(0.1), 1.0 - uv);',
  '  noise *= bl.x * bl.y * tr.x * tr.y;',

  '  vec4 mvPosition = modelViewMatrix * vec4(position + normal * length(noise) * 3.0, 1.0);',
  '  gl_Position = projectionMatrix * mvPosition;',
  '}',
].join('\n');

export const pulseVertexShader = [
  'uniform float u_time;',

  'varying vec2 vUv;',
  'varying vec3 vColor;',
  'varying vec4 vWorldPosition;',

  'float random(vec2 st) {',
  '    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);',
  '}',

  'void main() {',
  '  vUv = uv;',

  '  vWorldPosition = modelMatrix * vec4(position, 1.0);',
  '  float d = fract(length(vWorldPosition.xyz - vec3(0.0, 100.0, 0.0)) / 50.0 - u_time / 10.0);',
  '  vec2 bl = smoothstep(vec2(0.0), vec2(0.1), uv);',
  '  vec2 tr = smoothstep(vec2(0.0), vec2(0.1), 1.0 - uv);',
  '  vColor = vec3(d);',
  '  d *= bl.x * bl.y * tr.x * tr.y;',

  '  vec4 mvPosition = modelViewMatrix * vec4(position - d * 10.0 * normal, 1.0);',
  '  gl_Position = projectionMatrix * mvPosition;',
  '}',
].join('\n');

export const noiseFragmentShader = [
  'uniform float u_time;',
  'uniform vec2 u_resolution;',

  'varying vec2 vUv;',
  'varying vec3 noise;',

  'void main() {',
  '  vec2 st = vUv * 5.0;',

  '  gl_FragColor = vec4(noise, 1.0);',
  '}',
].join('\n');

export const pulseFragmentShader = [
  'uniform float u_time;',
  'uniform vec2 u_resolution;',

  'varying vec2 vUv;',
  'varying vec3 vColor;',
  'varying vec4 vWorldPosition;',

  'void main() {',
  '  vec2 st = vUv;',

  '  vec3 color = vColor;',
  '  float opacity = 1.0;',
  '  gl_FragColor = vec4(color, opacity);',
  '}',
].join('\n');

export const matrixFragmentShader = [
  '// Author @patriciogv - 2015',
  '// http://patriciogonzalezvivo.com',

  'uniform float u_time;',
  'uniform float u_speed;',
  'uniform float u_rows;',

  'varying vec2 vUv;',

  'float random(in float x) {',
  '  return fract(sin(x) * 43758.5453);',
  '}',

  'float random(in vec2 st) {',
  '  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);',
  '}',

  'float randomChar(in vec2 outer, in vec2 inner) {',
  '  vec2 margin = vec2(0.2, 0.05);',
  '  float seed = 23.0;',
  '  vec2 borders = step(margin, inner) * step(margin, 1.0 - inner);',
  '  return step(0.5, random(outer * seed + floor(inner * 3.0))) * borders.x * borders.y;',
  '}',

  'vec3 matrix(in vec2 st) {',
  '  vec2 ipos = floor(st * u_rows) + vec2(1.0, 0);',

  '  ipos += vec2(0, floor(u_time * u_speed * random(ipos.x)));',

  '  vec2 fpos = fract(st * u_rows);',
  '  vec2 center = 0.5 - fpos;',

  '  float pct = random(ipos);',
  '  float glowamount = (1.0 - dot(center, center) * 3.0);',

  '  return vec3(randomChar(ipos, fpos) * pct * glowamount) * vec3(0, 1.0, 0);',
  '}',

  'void main() {',
  '  gl_FragColor = vec4(matrix(vUv), 1.0);',
  '}',
].join('\n');

export const transparentFragmentShader = [
  'uniform float u_time;',
  'uniform vec2 u_resolution;',

  'varying vec2 vUv;',

  'mat3 yuv2rgb = mat3(1.0, 0.0, 1.13983, 1.0, -0.39465, -0.58060, 1.0, 2.03211, 0.0);',

  'void main() {',
  '  vec2 st = vUv * 2.0 - 1.0;',
  '  vec3 color = vec3(0.0);',

  '  color = yuv2rgb * vec3(0.5, st.x, st.y);',

  '  gl_FragColor = vec4(color, smoothstep(0.2, 0.8, distance(vec2(st.x, st.y), vec2(0.0))));',
  '}',
].join('\n');
