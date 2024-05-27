const ort = require("onnxruntime-node");
const {
    createCanvas
  } = require('canvas');


async function predictor(input_imageData, onnxModel){
    const session = await ort.InferenceSession.create(onnxModel);
                    // input_name = getInputs();
                    const inputNames = session.inputNames;

                    const canvas = await createCanvas(input_imageData.width, input_imageData.height);
                    const ctx = canvas.getContext("2d");

                    var floatArr =  new Float32Array(320 * 320 * 3)
                    var floatArr1 =  new Float32Array(320 * 320 * 3)
                    var floatArr2 =  new Float32Array(320 * 320 * 3)
                    
                    var j = 0
                    for (let i = 1; i < input_imageData.data.length+1; i ++) {
                        if(i % 4 != 0){
                            floatArr[j] = (input_imageData.data[i-1].toFixed(2))/255;  // red   color
                            j = j + 1;
                        } 
                    } 

                    for (let i = 1; i < floatArr.length+1; i += 3) {
                        floatArr1[i-1] = (floatArr[i-1] - 0.485)/0.229  // red   color
                        floatArr1[i] = (floatArr[i] - 0.456)/0.224  // green color
                        floatArr1[i+1] = (floatArr[i+1] - 0.406)/0.225  // blue  color
                    } 
                    var k = 0
                    for (let i = 0; i < floatArr.length; i += 3) {
                        floatArr2[k] = floatArr[i]  // red   color
                        k = k + 1
                    } 

                    var l = 102400 
                    for (let i = 1; i < floatArr.length; i += 3) {
                        floatArr2[l] = floatArr[i]  // red   color
                        l = l + 1
                    } 

                    var m = 204800
                    for (let i = 2; i < floatArr.length; i += 3) {
                        floatArr2[m] = floatArr[i]  // red   color
                        m = m + 1
                    } 
                    const input = new ort.Tensor('float32', floatArr2,  [1, 3, 320, 320])
                    a = inputNames[0]
                    const feeds = {"input.1": input};
                    const results = await session.run(feeds).then();
                    const pred = Object.values(results)[0]
                    var myImageData = ctx.createImageData(320, 320);
                    for (let i = 0; i < pred.data.length*4; i += 4) {
                        var pixelIndex = i;
                        if(i != 0){
                            t = i/4;
                        }
                        else{
                            t = 0;
                        }
                        myImageData.data[pixelIndex    ] = Math.round(pred.data[t]*255);  // red   color
                        myImageData.data[pixelIndex + 1] = Math.round(pred.data[t]*255);  // green color
                        myImageData.data[pixelIndex + 2] = Math.round(pred.data[t]*255);  // blue  color
                        myImageData.data[pixelIndex + 3] = 255;
                    } 
                    
                    

                    ctx.putImageData(myImageData, 0, 0);

    return canvas.toBuffer('image/png');
}

module.exports = predictor;