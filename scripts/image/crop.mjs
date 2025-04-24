import {createImageData} from "./createImageData.mjs";
import {scan} from "./scan.mjs";
import {setPixel} from "./setPixel.mjs";

export function crop(
  imageData,
  startX,
  startY,
  width,
  height,
) {
  const output = createImageData(width, height);
  scan(imageData, startX, startY, width, height, (pixel, x, y) => {
    setPixel(output, pixel, x - startX, y - startY);
  });
  return output;
}
