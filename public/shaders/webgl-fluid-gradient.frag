precision mediump float;

uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform float u_colorIntensity;
uniform vec2 u_mouse;
uniform float u_click;
uniform float u_scroll;
uniform float u_speed;
uniform float u_waveCount;
uniform float u_mouseInfluence;
uniform float u_distortion;

vec3 mod289v3(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289v4(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289v4(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289v3(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p, float octaves) {
  float val = 0.0;
  float amp = 0.5;
  for (float i = 0.0; i < 5.0; i++) {
    if (i >= octaves) break;
    val += amp * snoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return val;
}

vec3 getColor(vec2 uv, float t) {
  float n1 = fbm(vec3(uv * 0.8 + vec2(t * 0.05, t * 0.03), t * 0.1), u_waveCount);
  float n2 = fbm(vec3(uv * 1.2 + vec2(t * 0.02, t * 0.04), t * 0.1 + 100.0), u_waveCount);

  float mix1 = smoothstep(-0.3, 0.3, n1);
  float mix2 = smoothstep(-0.2, 0.4, n2);

  vec3 col = mix(u_color1, u_color2, mix1);
  col = mix(col, u_color3, mix2 * 0.5);
  col = mix(col, u_color4, (1.0 - mix1) * 0.3);

  return col;
}

float dist(vec2 a, vec2 b) {
  return dot(a - b, a - b);
}

float getInfluence(vec2 p, vec2 mPos, float mInf) {
  return exp(-dist(p, mPos) / mInf) * 0.5;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
  vec2 mUV = vec2(0.0);
  if (length(u_mouse) > 0.0) {
    mUV = (u_mouse - u_res * 0.5) / min(u_res.x, u_res.y);
  }

  float time = u_time * u_speed + u_scroll * 0.01;

  float influence = mix(1.0, getInfluence(uv, mUV, u_mouseInfluence), smoothstep(0.0, 1.0, length(u_mouse)));

  vec2 dUV = uv + vec2(
    fbm(vec3(uv * 2.0 + time * 0.2, time * 0.1), u_waveCount) * 0.1,
    fbm(vec3(uv * 2.0 + time * 0.2 + 100.0, time * 0.1), u_waveCount) * 0.1
  ) * u_distortion * influence;

  vec3 finalColor = getColor(dUV, time);

  float cursorEffect = 0.0;
  if (length(u_mouse) > 0.0) {
    cursorEffect = sin(dist(uv, mUV) * 20.0 - time * 2.0) * 0.5 + 0.5;
    finalColor += vec3(cursorEffect * 0.1 * smoothstep(0.0, 1.0, length(u_mouse)));
  }

  finalColor = mix(vec3(dot(finalColor, vec3(0.299, 0.587, 0.114))), finalColor, u_colorIntensity);

  float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv));
  finalColor *= mix(0.8, 1.0, vignette);

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
