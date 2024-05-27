const Jimp = require("jimp");
const floydSteinberg = require('floyd-steinberg');
const sharp = require("sharp");

async function applyThreshold(inputBuffer, threshold){
    if(threshold > 0){
        return sharp(inputBuffer)
        .threshold(threshold)
        .toBuffer()
    }
    return inputBuffer;
  }
async function alphaToBlack(image) {
    const replaceColor = {r: 0, g: 0, b: 0, a: 255};  // transparent
    const colorDistance = (c1, c2) => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));  // Distance between two colors
    const threshold = 32;
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const thisColor = {
        r: image.bitmap.data[idx + 0],
        g: image.bitmap.data[idx + 1],
        b: image.bitmap.data[idx + 2],
        a: image.bitmap.data[idx + 3]
      };
      if(thisColor.a <= threshold) {
        image.bitmap.data[idx + 0] = replaceColor.r;
        image.bitmap.data[idx + 1] = replaceColor.g;
        image.bitmap.data[idx + 2] = replaceColor.b;
        image.bitmap.data[idx + 3] = replaceColor.a;
      }
    });
    return image;
}

async function postProcess(maskBuffer, originalHeight, originalWidth, dither = "NO_DITHER", {threshold = 32}){

    let jimpImage = await Jimp.read(maskBuffer);
    let thresholdMask = await Jimp.read(await applyThreshold(maskBuffer, threshold));
    if(dither === "NO_DITHER" || dither === "THRESHOLD_WITH_DITHER"){
        if(dither === "THRESHOLD_WITH_DITHER"){
            await thresholdMask.mask(thresholdMask, 0, 0).resize(originalWidth, originalHeight, Jimp.RESIZE_BICUBIC);
            thresholdMask.bitmap = floydSteinberg(thresholdMask.bitmap)
            alphaToBlack(thresholdMask)
            return await thresholdMask.getBufferAsync(Jimp.MIME_PNG);
        }
        await thresholdMask.resize(originalWidth, originalHeight, Jimp.RESIZE_BICUBIC);
        alphaToBlack(thresholdMask)
        return thresholdMask.getBufferAsync(Jimp.MIME_PNG);
    }
    await jimpImage.mask(thresholdMask, 0, 0);

    let resized = jimpImage.resize(originalWidth, originalHeight, Jimp.RESIZE_BICUBIC)
    if(dither === "FLOYD_STEINBERG"){
        resized.bitmap = floydSteinberg(resized.bitmap)
        alphaToBlack(resized)
        return await resized.getBufferAsync(Jimp.MIME_PNG);
    } else {
        alphaToBlack(resized)
        return await resized.getBufferAsync(Jimp.MIME_PNG);
    }
    
}

module.exports = postProcess;