/** Posição do cursor normalizada (-1..1), atualizada fora do React para o 3D ler a cada frame. */
export const pointer = { x: 0, y: 0, px: 0, py: 0 };

export const trackPointer = () => {
  const onMove = (e: PointerEvent) => {
    pointer.px = e.clientX;
    pointer.py = e.clientY;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  return () => window.removeEventListener('pointermove', onMove);
};
