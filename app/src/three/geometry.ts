import {
  BufferGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  ShapeGeometry,
} from 'three';

/** Moldura em arco (janela): retângulo com topo semicircular, UV normalizado para a foto. */
export const archGeometry = (w: number, h: number): BufferGeometry => {
  const r = w / 2;
  const s = new Shape();
  s.moveTo(-r, -h / 2);
  s.lineTo(r, -h / 2);
  s.lineTo(r, h / 2 - r);
  s.absarc(0, h / 2 - r, r, 0, Math.PI, false);
  s.lineTo(-r, -h / 2);
  const g = new ShapeGeometry(s, 36);
  const pos = g.getAttribute('position');
  const uv: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    uv.push((pos.getX(i) + r) / w, (pos.getY(i) + h / 2) / h);
  }
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  return g;
};

/** Pétala: superfície paramétrica em forma de gota, convexa por fora, base estreita e ponta fina. */
export const petalGeometry = (length = 1.9, halfWidth = 0.7, nu = 22, nv = 12): BufferGeometry => {
  const pos: number[] = [];
  const uvs: number[] = [];
  const idx: number[] = [];

  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    const profile = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85);
    for (let j = 0; j <= nv; j++) {
      const v = (j / nv) * 2 - 1;
      const x = v * profile * halfWidth;
      const y = u * length;
      const z = -0.55 * (v * profile) ** 2 * halfWidth - 0.28 * u * u + 0.1 * Math.sin(Math.PI * u);
      pos.push(x, y, z);
      uvs.push(j / nv, u);
    }
  }
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j;
      const b = a + 1;
      const c = a + (nv + 1);
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** Coração volumétrico (curva paramétrica clássica), com bisel macio. */
export const heartGeometry = (): ExtrudeGeometry => {
  const shape = new Shape();
  const n = 96;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const px = x / 17;
    const py = y / 17;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  const g = new ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.12,
    bevelSegments: 10,
    curveSegments: 48,
  });
  g.center();
  return g;
};
