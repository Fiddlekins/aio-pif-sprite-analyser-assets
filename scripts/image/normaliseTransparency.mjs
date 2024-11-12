import {scan} from "./scan.mjs";

const normalisedTransparency = [0, 0, 0, 0];

export function normaliseTransparency(input) {
  const output = input;
  scan(output, 0, 0, output.width, output.height, (pixel) => {
    if (pixel[3] === 0) {
      return normalisedTransparency;
    }
    return pixel;
  });
  return output;
}
