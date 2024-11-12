export function setPixel(imageData, pixel, x, y) {
  const pixelIndex = (y * imageData.width) + x;
  // Hardcoded to 4 channels
  const dataIndex = pixelIndex * 4;
  const [r, g, b, a] = pixel;
  imageData.data[dataIndex] = r;
  imageData.data[dataIndex + 1] = g;
  imageData.data[dataIndex + 2] = b;
  imageData.data[dataIndex + 3] = a;
}
