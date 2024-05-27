const Jimp = require("jimp");

async function bgrm(originalJimpImage, maskBuffer){
    let mask = await Jimp.read(maskBuffer);
    await originalJimpImage.mask(mask, 0, 0);
    return originalJimpImage.getBufferAsync(Jimp.MIME_PNG)
}

module.exports = bgrm;