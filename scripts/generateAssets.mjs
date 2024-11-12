import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'url';
import {downscaleImageData} from "./image/downscaleImageData.mjs";
import {getDecodedPng} from "./image/getDecodedPng.mjs";
import {getEncodedPng} from "./image/getEncodedPng.mjs";
import {normaliseTransparency} from "./image/normaliseTransparency.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const maxDexNumber = 501;

async function loadImageData(filepath) {
  const buffer = await fs.readFile(filepath);
  return getDecodedPng(buffer);
}

async function generateAssetForDexNumber(dexNumber) {
  let data;
  try {
    data = await loadImageData(path.join(projectRoot, 'raw', 'BaseSprites', `${dexNumber}.png`))
  } catch (err) {
    try {
      data = await loadImageData(path.join(projectRoot, 'raw', 'BaseSprites', `${dexNumber}a.png`))
    } catch (err) {
      console.error(`Failed to find sprite for dex number ${dexNumber}`);
      data = await loadImageData(path.join(projectRoot, 'raw', 'missing.png'));
    }
  }
  const downscaledImage = downscaleImageData(data.imageData, 3);
  const normalisedImage = normaliseTransparency(downscaledImage);
  const outputData = getEncodedPng(normalisedImage, {indexed: true});
  await fs.writeFile(path.join(projectRoot, 'assets', 'basePokemon', `${dexNumber}.png`), outputData, {encoding: null});
}

async function main() {
  const promises = [];
  for (let dexNumber = 1; dexNumber <= maxDexNumber; dexNumber++) {
    promises.push(generateAssetForDexNumber(dexNumber));
  }
  await Promise.all(promises);
}

main().catch(console.error);
