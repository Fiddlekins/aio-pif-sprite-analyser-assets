# aio-pif-sprite-analyser-assets
Bulk asset store for APSA

Sprites taken from latest sprite pack, copying the `BaseSprites` folder to `<project>/raw/BaseSprites` before running `yarn start`.

Sprites are downscaled to 96x96, have their transparency normalised, and are encoded in indexed mode to minimise filesize.

## Fun facts
- with the versions of these files as I write this, there are 500 sprites that sum to 446,501 bytes for a mean size of 893 bytes
- in contrast, the custom battlers in the latest sprite pack consist of 165,447 sprites that sum to 794,826,154 bytes for a mean size of 4804 bytes
