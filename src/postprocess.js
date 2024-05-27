const Jimp = require("jimp");
const floydSteinberg = require('floyd-steinberg');

async function postProcess(maskBuffer, originalHeight, originalWidth, dither = "FLOYD_STEINBURG"){
    let jimpImage = await Jimp.read(maskBuffer);

    let resized = jimpImage.resize(originalWidth, originalHeight, Jimp.RESIZE_BICUBIC)
    if(dither === "FLOYD_STEINBERG"){
        resized.bitmap = floydSteinberg(resized.bitmap)
        return await resized.getBufferAsync(Jimp.MIME_PNG);
    } else if(dither === "NO_DITHER"){
        return await resized.greyscale().contrast(1).getBufferAsync(Jimp.MIME_PNG);
    } else {
        return await resized.getBufferAsync(Jimp.MIME_PNG);
    }
    
}

module.exports = postProcess;