import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'url';
import {getDecodedPng} from "./image/getDecodedPng.mjs";
import {getEncodedPng} from "./image/getEncodedPng.mjs";
import {normaliseTransparency} from "./image/normaliseTransparency.mjs";
import {crop} from "./image/crop.mjs";
import {downscaleImageData} from "./image/downscaleImageData.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const expectedPIFRepoLocation = path.join(projectRoot, '..', 'infinitefusion-e18');
const baseSpriteSheets = path.join(expectedPIFRepoLocation, 'Graphics', 'CustomBattlers', 'spritesheets', 'spritesheets_base');
const autogenSpriteSheets = path.join(expectedPIFRepoLocation, 'Graphics', 'Battlers', 'spritesheets_autogen');

const maxDexNumber = 565;

async function loadImageData(filepath) {
  const buffer = await fs.readFile(filepath);
  return getDecodedPng(buffer);
}

async function generateAssetForDexNumber(dexNumber, missingImageData) {
  const baseSrc = path.join(baseSpriteSheets, `${dexNumber}.png`);
  const baseDest = path.join(projectRoot, 'assets', 'basePokemon', `${dexNumber}.png`);
  const autogenSrc = path.join(autogenSpriteSheets, `${dexNumber}.png`);
  const autogenDest = path.join(projectRoot, 'assets', 'spritesheets_autogen', `${dexNumber}.png`);

  let data;
  try {
    data = (await loadImageData(baseSrc)).imageData;
  } catch (err) {
    console.error(`Failed to find base sprite for dex number ${dexNumber}`);
    data = missingImageData;
  }
  const croppedBaseSprite = crop(data, 0, 0, 96, 96);
  const normalisedBaseSprite = normaliseTransparency(croppedBaseSprite);
  const outputBaseSprite = getEncodedPng(normalisedBaseSprite, {indexed: true});
  await fs.writeFile(baseDest, outputBaseSprite, {encoding: null});

  try {
    await fs.copyFile(autogenSrc, autogenDest);
  } catch (err) {
    console.error(`Failed to find autogen sprites for dex number ${dexNumber}`);
    const outputAutogenSprites = getEncodedPng(missingImageData, {indexed: false});
    await fs.writeFile(autogenDest, outputAutogenSprites, {encoding: null});
  }
}

async function main() {
  const missingImageData = normaliseTransparency(downscaleImageData((await loadImageData(path.join(projectRoot, 'raw', 'missing.png'))).imageData, 3));
  for (let dexNumber = 1; dexNumber <= maxDexNumber; dexNumber++) {
    console.log(`Processing pokemon ${dexNumber}...`);
    await generateAssetForDexNumber(dexNumber, missingImageData);
  }
}

main().catch(console.error);
