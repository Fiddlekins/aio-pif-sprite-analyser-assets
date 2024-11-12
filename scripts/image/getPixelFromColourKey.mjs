export function getPixelFromColourKey(colourKey) {
  let value = colourKey;
  const a = value % 256;
  value = ~~(value / 256);
  const b = value % 256;
  value = ~~(value / 256);
  const g = value % 256;
  value = ~~(value / 256);
  const r = value % 256;
  return [r, g, b, a];
}
