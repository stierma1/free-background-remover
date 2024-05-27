const {
    Image,
    ImageData,
    loadImage,
    createCanvas,
    createImageData,
  } = require('canvas');
const Jimp = require("jimp");
const path = require("path");

async function getImageData(path) {
    const image = await loadImage(path);
    const { width, height } = image;
  
    const canvas = await createCanvas(width, height);
    const ctx = canvas.getContext('2d');
  
    ctx.drawImage(image, 0, 0);
  
    return ctx.getImageData(0, 0, width, height);
  }

function loadImageFromBuffer(buffer){
    return new Promise((res, rej) => {
        const image = new Image();

        image.onload = () => {res(image)};
        image.onerror = (e) => {console.log("Error loading")}
        image.src = buffer;
    })
}

async function preprocess(imagePath){
    let jimpImage = await Jimp.read(imagePath);
    let originalJimpImage = await jimpImage.clone();
    let originalHeight = jimpImage.getHeight();
    let originalWidth = jimpImage.getWidth();
    let resized = jimpImage.resize(320, 320,Jimp.RESIZE_BICUBIC)
    let resizedBuffer = await resized.getBufferAsync(Jimp.MIME_PNG)
    const image = await loadImageFromBuffer(resizedBuffer);

    const { width, height } = image;
    const canvas = await createCanvas(320, 320);
    const ctx = canvas.getContext('2d');
  
    ctx.drawImage(image, 0, 0);

    return {originalJimpImage,  imageData: ctx.getImageData(0, 0, width, height), originalHeight, originalWidth };
}

module.exports = preprocess;