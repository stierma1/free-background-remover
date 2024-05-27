const path = require("path");
const glob = require("glob");
const preprocess = require("./src/preprocess");
const predictor = require("./src/predictor");
const postProcess = require("./src/postprocess");
const fileWriter = require("./src/file-writer");
const bgRm = require("./src/bg-rm");

class BGRMPipeline{
    constructor({onnxModel = "./u2netp.onnx", dither = BGRMPipeline.NO_DITHER}){
        this.onnxModel = onnxModel === "./u2netp.onnx" ? path.join(__dirname,onnxModel) : onnxModel;
        this.dither = dither;
    }

    async run(inputPath, outputPath, outputMasksPath = null){
       let filePaths = await glob.glob(inputPath);
        
       for(let filePath of filePaths){
        let {imageData, originalJimpImage, originalHeight, originalWidth} = await preprocess(filePath);
        let maskBuffer = await predictor(imageData, this.onnxModel);
        let outputMaskBuffer = await postProcess(maskBuffer, originalHeight, originalWidth, this.dither);
        if(outputMasksPath){
            let maskPath = path.join(outputMasksPath, filePath.split("/")[filePath.split("/").length - 1])
            await fileWriter(maskPath, outputMaskBuffer);
        }
        let noBackgroundImage = await bgRm(originalJimpImage, outputMaskBuffer, originalHeight, originalWidth);
        let outputImagePath = path.join(outputPath, filePath.split("/")[filePath.split("/").length - 1]);
        await fileWriter(outputImagePath, noBackgroundImage);
       }
    }

}

BGRMPipeline.FLOYD_STEINBERG_DITHER = "FLOYD_STEINBERG";
BGRMPipeline.NO_DITHER = "NO_DITHER";
BGRMPipeline.NATIVE_DITHER = "NATIVE_DITHER";

module.exports = BGRMPipeline;

new BGRMPipeline({}).run(path.join(__dirname, "./*.png"), path.join(__dirname,"./output"), path.join(__dirname,"./output"))