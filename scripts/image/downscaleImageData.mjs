import {createImageData} from "./createImageData.mjs";
import {scan} from "./scan.mjs";
import {setPixel} from "./setPixel.mjs";

export function downscaleImageData(input, scaleFactor) {
  const output = createImageData(input.width / scaleFactor, input.height / scaleFactor);
  scan(input, 0, 0, input.width, input.height, (pixel, x, y) => {
    if (x % scaleFactor === 0 && y % scaleFactor === 0) {
      setPixel(output, pixel, x / scaleFactor, y / scaleFactor);
    }
  });
  return output
}
