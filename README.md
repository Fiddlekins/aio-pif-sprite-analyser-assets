# aio-pif-sprite-analyser-assets
Bulk asset store for APSA

Sprites taken from the [game repo](https://github.com/infinitefusion/infinitefusion-e18) which the scripts expect to be cloned locally as a neighbour of this repo.

Execute by running `yarn start`.

Sprites are downscaled to 96x96, have their transparency normalised, and are encoded in indexed mode to minimise filesize.

## Fun facts
- with the versions of these files as I write this, there are 500 sprites that sum to 446,501 bytes for a mean size of 893 bytes
- in contrast, the custom battlers in the latest sprite pack consist of 165,447 sprites that sum to 794,826,154 bytes for a mean size of 4804 bytes
