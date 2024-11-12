import {ChannelOrder, PngDecoder} from "image-in-browser";
import {createImageData} from "./createImageData.mjs";

export function getDecodedPng(data) {
  const dataUint8 = new Uint8Array(data);
  const decoder = new PngDecoder();
  const image = decoder.decode({
    bytes: dataUint8,
  });
  if (!image) {
    throw new Error('File is invalid');
  }
  const imageData = createImageData(image.width, image.height);
  const rawBytes = image.getBytes({
    order: ChannelOrder.rgba,
  });
  if (image.palette) {
    // The PNG library is unreliable in terms of whether it fully decodes palette based PNGs or not
    // As such, we check the raw byte length to determine if it has already applied the palette
    if (rawBytes.length === image.width * image.height * 4) {
      imageData.data = rawBytes;
    } else if (rawBytes.length === image.width * image.height * decoder.info.bits / 8) {
      let indexes = new Uint8Array(image.width * image.height);
      switch (decoder.info.bits) {
        case 1:
        case 2:
        case 4: {
          const subValueCount = 8 / decoder.info.bits;
          const subValueSize = 2 ** decoder.info.bits;
          for (let byteIndex = 0; byteIndex < rawBytes.length; byteIndex++) {
            let value = rawBytes[byteIndex];
            const targetOffset = byteIndex * subValueCount;
            for (let subValueIndex = 0; subValueIndex < subValueCount; subValueIndex++) {
              indexes[targetOffset + (subValueCount - 1 - subValueIndex)] = value % subValueSize;
              value = Math.floor(value / subValueSize);
            }
          }
          break;
        }
        case 8:
          indexes = rawBytes;
          break;
        default:
          throw new Error(`Unexpected bit depth during PNG decoding`);
      }
      for (let pixelIndex = 0; pixelIndex < indexes.length; pixelIndex++) {
        const paletteIndex = indexes[pixelIndex];
        const offset = pixelIndex * 4;
        imageData.data[offset] = image.palette.get(paletteIndex, 0);
        imageData.data[offset + 1] = image.palette.get(paletteIndex, 1);
        imageData.data[offset + 2] = image.palette.get(paletteIndex, 2);
        if (image.numChannels === 4) {
          imageData.data[offset + 3] = image.palette.get(paletteIndex, 3);
        } else {
          imageData.data[offset + 3] = 255;
        }
      }
    } else {
      throw new Error(`Unexpected rawBytes length during PNG decoding: ${rawBytes.length}bytes for ${image.width}x${image.height} image`);
    }
  } else {
    imageData.data = rawBytes;
  }
  const info = {
    colourType: decoder.info.colorType || 0,
    bitsPerChannel: decoder.info.bits,
    channelCount: image.numChannels,
    fileSize: data.length,
    width: imageData.width,
    height: imageData.height,
  };
  return {
    imageData,
    info,
  };
}
