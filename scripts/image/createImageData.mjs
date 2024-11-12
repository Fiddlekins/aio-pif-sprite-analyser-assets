export function createImageData(width, height) {
  return {
    width,
    height,
    // Hardcoded to 4 channels
    data: new Uint8Array(width * height * 4),
  }
}
