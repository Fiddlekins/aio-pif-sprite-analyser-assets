export function getColourKeyFromPixel([r, g, b, a]) {
  let value = r;
  value *= 256;
  value += g;
  value *= 256;
  value += b;
  value *= 256;
  value += a;
  return value;
}
