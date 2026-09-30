import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TONES } from './photos.js';

// Objetos 3D da história, todos feitos de primitivas (sem arquivos de modelo).
// Tudo em "unidades U" — a escala final é aplicada em gl.js.

const M = (o) => new THREE.MeshStandardMaterial(o);

function cyl(rTop, rBot, h, mat, z, seg = 48) {
  const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
  g.rotateX(Math.PI / 2); // eixo do cilindro aponta para +z (frente da câmera)
  const m = new THREE.Mesh(g, mat);
  m.position.z = z;
  m.castShadow = true;
  return m;
}

// ─────────────────────────────────────────────────────────────
// Câmera (a "bolinha" da história). Frente = +z. Largura do corpo = 2.4, altura total ≈ 2.1.
// ─────────────────────────────────────────────────────────────
export function buildCamera() {
  const g = new THREE.Group();
  const leather = M({ color: '#d0654b', roughness: 0.62 });
  const grip = M({ color: '#3b2c27', roughness: 0.75 });
  const cream = M({ color: '#f6ebdd', roughness: 0.42 });
  const metal = M({ color: '#ead9b8', roughness: 0.26, metalness: 0.85 });
  const dark = M({ color: '#2b2320', roughness: 0.5 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#111421',
    roughness: 0.05,
    metalness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.4,
  });

  const box = (w, h, d, r, mat, x, y, z) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };

  box(2.4, 1.3, 0.95, 0.14, leather, 0, -0.12, 0); // corpo
  box(2.44, 0.42, 0.98, 0.12, cream, 0, 0.74, 0); // placa superior
  box(0.72, 0.28, 0.6, 0.1, cream, 0.05, 1.02, 0); // prisma
  box(0.46, 0.2, 0.05, 0.05, dark, -0.78, 0.74, 0.49); // janelinha do visor
  box(0.5, 1.15, 0.14, 0.06, grip, 0.86, -0.12, 0.5); // empunhadura

  const dial = cyl(0.26, 0.26, 0.13, metal, 0, 32);
  dial.rotation.x = -Math.PI / 2; // eixo vertical
  dial.position.set(-0.78, 1.0, 0);
  g.add(dial);
  const btn = cyl(0.12, 0.12, 0.16, metal, 0, 24);
  btn.rotation.x = -Math.PI / 2;
  btn.position.set(0.86, 1.0, 0.08);
  g.add(btn);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), M({ color: '#f2c26b', roughness: 0.3, metalness: 0.6 }));
  dot.position.set(-0.98, 0.15, 0.48);
  g.add(dot);

  // conjunto da lente
  const lens = new THREE.Group();
  lens.position.set(-0.05, -0.1, 0.475);
  lens.add(cyl(0.74, 0.74, 0.1, metal, 0.02, 56));
  lens.add(cyl(0.62, 0.66, 0.5, dark, 0.3, 56));
  lens.add(cyl(0.67, 0.67, 0.14, metal, 0.34, 56));
  lens.add(cyl(0.65, 0.6, 0.1, metal, 0.57, 56));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  cap.rotation.x = Math.PI / 2;
  cap.scale.set(1, 0.36, 1); // (após a rotação: y vira profundidade)
  cap.position.z = 0.56;
  cap.castShadow = true;
  lens.add(cap);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.025, 12, 56), metal);
  ring.position.z = 0.6;
  lens.add(ring);
  const spec = new THREE.Mesh(new THREE.CircleGeometry(0.075, 20), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9 }));
  spec.position.set(-0.17, 0.2, 0.73);
  lens.add(spec);
  g.add(lens);

  g.rotation.order = 'ZXY'; // roll → pitch → yaw
  return g;
}

// ─────────────────────────────────────────────────────────────
// Cena 01 · rebatedor (o disco branco que fotógrafo de luz natural usa)
// eixo do disco = y local (a face de cima é o "chão" onde a câmera desliza)
// ─────────────────────────────────────────────────────────────
export function buildReflector(R, T) {
  const g = new THREE.Group();
  const fabric = M({ color: '#fbf6ee', roughness: 0.78 });
  const gold = M({ color: '#e6cd96', roughness: 0.42, metalness: 0.35 });
  const rim = M({ color: '#6f4d3e', roughness: 0.55 });

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.01, R - 0.01, T, 72), fabric);
  disc.castShadow = disc.receiveShadow = true;
  g.add(disc);

  // "fatia" dourada, como nos rebatedores 5 em 1
  const sector = new THREE.Mesh(new THREE.CircleGeometry(R * 0.93, 48, Math.PI * 0.05, Math.PI * 0.62), gold);
  sector.rotation.x = -Math.PI / 2;
  sector.position.y = T / 2 + 0.001;
  sector.receiveShadow = true;
  g.add(sector);

  const border = new THREE.Mesh(new THREE.TorusGeometry(R, 0.016, 16, 112), rim);
  border.rotation.x = Math.PI / 2;
  border.castShadow = border.receiveShadow = true;
  g.add(border);

  const stitch = new THREE.Mesh(new THREE.TorusGeometry(R * 0.9, 0.003, 6, 96), M({ color: '#d9c9b3', roughness: 0.9 }));
  stitch.rotation.x = Math.PI / 2;
  stitch.position.y = T / 2 + 0.002;
  g.add(stitch);
  return g;
}

// ─────────────────────────────────────────────────────────────
// Cena 02 · lente (instanciada). Geometria única com cor por vértice:
// tambor branco (tingido pela cor da instância) + anéis champagne + vidro escuro.
// Eixo apontando para +z.
// ─────────────────────────────────────────────────────────────
export const LENS_R = 0.038;
export const LENS_LEN = 0.078;

function paint(geo, hex) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

export function buildLensGeometry() {
  const R = LENS_R;
  const L = LENS_LEN;
  const zc = (geo, z) => geo.rotateX(Math.PI / 2).translate(0, 0, z);
  const parts = [
    paint(zc(new THREE.CylinderGeometry(R * 0.96, R, L, 40), L / 2), '#ffffff'), // tambor
    paint(zc(new THREE.CylinderGeometry(R * 1.03, R * 1.03, 0.014, 40), 0.03), '#a89684'), // anel de zoom
    paint(zc(new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.012, 40), L), '#efdcb6'), // anel frontal
    paint(zc(new THREE.TorusGeometry(R * 0.78, 0.0024, 8, 40).rotateX(-Math.PI / 2), L + 0.003), '#efdcb6'), // aro interno
  ];
  const cap = new THREE.SphereGeometry(R * 0.72, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  cap.scale(1, 0.4, 1);
  cap.rotateX(Math.PI / 2);
  cap.translate(0, 0, L - 0.002);
  parts.push(paint(cap, '#161827')); // vidro
  return mergeGeometries(parts, false);
}

// ─────────────────────────────────────────────────────────────
// Cena 03 · tira de filme em espiral
// ─────────────────────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function filmTexture() {
  const W = 256;
  const P = 282; // passo entre fotogramas
  const N = 6;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = P * N;
  const g = c.getContext('2d');
  g.fillStyle = '#3d2e27';
  g.fillRect(0, 0, W, c.height);

  for (let f = 0; f < N; f++) {
    const y0 = f * P;
    const [lite, mid, deep] = TONES[(f * 5 + 1) % TONES.length];
    const fx = 40;
    const fw = 176;
    const fh = 118;
    const fy = y0 + (P - fh) / 2;
    g.save();
    rr(g, fx, fy, fw, fh, 6);
    g.clip();
    const gr = g.createLinearGradient(fx, fy, fx + fw, fy + fh);
    gr.addColorStop(0, lite);
    gr.addColorStop(0.55, mid);
    gr.addColorStop(1, deep);
    g.fillStyle = gr;
    g.fillRect(fx, fy, fw, fh);
    // manta + cabecinha (abstrato)
    const blob = (cx, cy, rx, ry, c1, c2, a) => {
      g.save();
      g.translate(cx, cy);
      g.scale(rx, ry);
      const rg = g.createRadialGradient(-0.3, -0.4, 0.05, 0, 0, 1);
      rg.addColorStop(0, c1);
      rg.addColorStop(1, c2);
      g.globalAlpha = a;
      g.fillStyle = rg;
      g.beginPath();
      g.arc(0, 0, 1, 0, Math.PI * 2);
      g.fill();
      g.restore();
    };
    blob(fx + fw * 0.5, fy + fh * 0.78, fw * 0.62, fh * 0.3, lite, deep, 0.95);
    blob(fx + fw * 0.44, fy + fh * 0.66, fw * 0.4, fh * 0.2, '#ffffff', mid, 0.85);
    blob(fx + fw * (0.34 + (f % 3) * 0.06), fy + fh * 0.5, fh * 0.17, fh * 0.17, '#fff4e8', deep, 0.95);
    const bg = g.createLinearGradient(fx + fw * 0.2, fy, fx + fw * 0.55, fy);
    bg.addColorStop(0, 'rgba(255,255,255,0)');
    bg.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    bg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = bg;
    g.fillRect(fx, fy, fw, fh);
    g.restore();

    // impressão de borda (laranja, como em filme de verdade)
    g.save();
    g.fillStyle = '#e9a25f';
    g.font = '600 9px sans-serif';
    g.textAlign = 'center';
    g.translate(33, y0 + P / 2);
    g.rotate(-Math.PI / 2);
    g.fillText('AMOR EM FOTO  ▸  ' + (f * 2 + 1), 0, 0);
    g.restore();
    g.save();
    g.fillStyle = '#e9a25f';
    g.font = '600 10px sans-serif';
    g.textAlign = 'center';
    g.translate(224, y0 + P / 2);
    g.rotate(-Math.PI / 2);
    g.fillText(f + 1 + 'A', 0, 0);
    g.restore();
  }

  // perfurações: recortadas (transparentes)
  g.globalCompositeOperation = 'destination-out';
  for (let y = 18; y < c.height; y += P / 4) {
    for (const x of [11, 227]) {
      rr(g, x, y, 18, 30, 6);
      g.fill();
    }
  }
  g.globalCompositeOperation = 'source-over';

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// fita ao longo da curva, com a face sempre voltada para a câmera (+z)
export function buildFilmStrip(curve, segs, width, frames) {
  const tex = filmTexture();
  const pos = [];
  const nor = [];
  const uv = [];
  const idx = [];
  const T = new THREE.Vector3();
  const d = new THREE.Vector3();
  const e = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const P = curve.getPointAt(t);
    curve.getTangentAt(t, T);
    d.set(P.x * 3.2, 0, 1).normalize();
    d.addScaledVector(T, -d.dot(T)).normalize();
    e.crossVectors(T, d).normalize();
    for (const s of [-1, 1]) {
      pos.push(P.x + e.x * width * 0.5 * s, P.y + e.y * width * 0.5 * s, P.z + e.z * width * 0.5 * s);
      nor.push(d.x, d.y, d.z);
      uv.push(s < 0 ? 0 : 1, t * (frames / 6));
    }
  }
  for (let i = 0; i < segs; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.42,
    metalness: 0,
    emissive: new THREE.Color('#ffffff'),
    emissiveMap: tex,
    emissiveIntensity: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ─────────────────────────────────────────────────────────────
// Cartão de memória (SD) – final da história
// ─────────────────────────────────────────────────────────────
function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 260;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    const g = c.getContext('2d');
    g.fillStyle = '#c4633f';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = 'rgba(255,248,240,0.92)';
    g.textAlign = 'center';
    g.font = '700 22px "Manrope Variable", system-ui, sans-serif';
    g.letterSpacing = '6px';
    g.fillText('MEMÓRIA', c.width / 2, 74);
    g.letterSpacing = '0px';
    g.font = 'italic 300 58px "Fraunces Variable", Georgia, serif';
    g.fillText('amor em foto', c.width / 2, 150);
    g.fillStyle = 'rgba(255,248,240,0.55)';
    for (let i = 0; i < 4; i++) g.fillRect(56 + i * 56, 200, 34, 6);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('italic 300 58px "Fraunces Variable"').then(draw).catch(() => {});
  document.fonts?.load('700 22px "Manrope Variable"').then(draw).catch(() => {});
  return tex;
}

export function buildMemoryCard() {
  const W = 0.36;
  const H = 0.47;
  const C = 0.08; // canto cortado
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, -H / 2);
  shape.lineTo(W / 2, -H / 2);
  shape.lineTo(W / 2, H / 2 - C);
  shape.lineTo(W / 2 - C, H / 2);
  shape.lineTo(-W / 2, H / 2);
  shape.closePath();
  const depth = 0.03;
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.008, bevelSegments: 3, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2);
  const body = new THREE.Mesh(geo, M({ color: '#f5ece0', roughness: 0.5 }));
  body.castShadow = body.receiveShadow = true;

  const g = new THREE.Group();
  g.add(body);

  const label = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.78, H * 0.5), new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: 0.6 }));
  label.position.set(0, 0.045, depth / 2 + 0.0095);
  g.add(label);

  const goldMat = M({ color: '#e4c47f', roughness: 0.28, metalness: 0.95 });
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.004), goldMat);
    p.position.set(-W / 2 + 0.05 + i * ((W - 0.1) / 7), -H / 2 + 0.06, depth / 2 + 0.0095);
    g.add(p);
  }
  // chavinha de proteção contra gravação
  const sw = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.05, 0.02), M({ color: '#d7c5ae', roughness: 0.6 }));
  sw.position.set(-W / 2 - 0.006, 0.12, 0);
  g.add(sw);
  return g;
}
