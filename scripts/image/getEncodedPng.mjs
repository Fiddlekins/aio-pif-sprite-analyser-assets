import {ChannelOrder, encodePng, Format, MemoryImage, PaletteUint8} from "image-in-browser";
import {getColourKeyFromPixel} from "./getColourKeyFromPixel.mjs";
import {getPixelFromColourKey} from "./getPixelFromColourKey.mjs";
import {scan} from "./scan.mjs";

// In theory lower bit depth would reduce filesize but in practise this seems to be the opposite
// function getReducedBitFormat(indexedData8bit: Uint8Array, colourCount: number) {
//   let indexedData = indexedData8bit;
//   let format = Format.uint8;
//   const reducedBitFormats = [
//     {bits: 1, format: Format.uint1},
//     {bits: 2, format: Format.uint2},
//     {bits: 4, format: Format.uint4},
//   ]
//   for (const reducedBitFormat of reducedBitFormats) {
//     const {bits} = reducedBitFormat;
//     if (2 ** bits >= colourCount) {
//       format = reducedBitFormat.format;
//
//       const subValueCount = 8 / bits;
//       const subValueSize = 2 ** bits;
//       indexedData = new Uint8Array(indexedData8bit.length / subValueCount);
//       for (let byteIndex = 0; byteIndex < indexedData.length; byteIndex++) {
//         let byte = 0;
//         const targetOffset = byteIndex * subValueCount;
//         for (let subValueIndex = 0; subValueIndex < subValueCount; subValueIndex++) {
//           byte *= subValueSize;
//           byte += indexedData8bit[targetOffset + subValueIndex];
//         }
//         indexedData[byteIndex] = byte;
//       }
//     }
//   }
//   return {
//     bytes: indexedData,
//     format
//   };
// }

export function getEncodedPng(imageData, options) {
  let memoryImage = null;
  if (options?.indexed) {
    const colours = new Set();
    scan(imageData, 0, 0, imageData.width, imageData.height, (pixel) => {
      const colourKey = getColourKeyFromPixel(pixel);
      colours.add(colourKey);
    });
    // PNG palettes can't exceed 256 colours, fall back to non-indexed if colour count too high
    if (colours.size <= 256) {
      const sortedColours = Array.from(colours.values()).sort((a, b) => {
        const [ar, ag, ab, aa] = getPixelFromColourKey(a);
        const [br, bg, bb, ba] = getPixelFromColourKey(b);
        // Store non-opaque colours at the start of the palette so that the transparency chunk can omit trailing opaque colour entries
        // (although current PNG encode library does not perform this optimisation)
        if (aa !== ba) {
          return aa - ba;
        }
        // The sort by rgb cus why not
        if (ar !== br) {
          return ar - br;
        }
        if (ag !== bg) {
          return ag - bg;
        }
        return ab - bb;
      });
      const colourMap = new Map();
      for (let paletteIndex = 0; paletteIndex < sortedColours.length; paletteIndex++) {
        const colourKey = sortedColours[paletteIndex];
        colourMap.set(colourKey, paletteIndex);
      }
      const indexedData = new Uint8Array(imageData.width * imageData.height);
      scan(imageData, 0, 0, imageData.width, imageData.height, (pixel, x, y) => {
        const colourKey = getColourKeyFromPixel(pixel);
        const paletteIndex = colourMap.get(colourKey) || 0;
        const pixelIndex = (y * imageData.width) + x;
        indexedData[pixelIndex] = paletteIndex;
      });
      const palette = new PaletteUint8(colourMap.size, 4);
      for (const [colourKey, paletteIndex] of colourMap.entries()) {
        const [r, g, b, a] = getPixelFromColourKey(colourKey);
        palette.setRgba(paletteIndex, r, g, b, a);
      }
      memoryImage = MemoryImage.fromBytes({
        bytes: indexedData,
        width: imageData.width,
        height: imageData.height,
        format: Format.uint8,
        numChannels: 1,
        palette,
      });
    }
  }
  if (!memoryImage) {
    memoryImage = MemoryImage.fromBytes({
      bytes: imageData.data,
      width: imageData.width,
      height: imageData.height,
      format: Format.uint8,
      numChannels: 4,
    });
  }
  return encodePng({
    image: memoryImage,
    level: 9
  });
}
