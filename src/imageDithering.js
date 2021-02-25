import Jimp from 'jimp'
import path from 'path'
import fs from 'fs'

//dither + resize image using Jimp
const ditherImage = (filename) => Jimp.create(filename)
  .then(image => {
    let img = image.clone()
    img.dither565()
    img.greyscale()
    img.cover(400, 400)
    const basename = path.basename(filename)
    const outPath = path.join(path.resolve(), 'dist/public/assets/images/')
    img.writeAsync(outPath + basename)            // ordered dithering of the image and reduce color space to 16-bits (RGB565)
})
  .catch(err => {
    console.log(err)
  });

  function ditherAll(){
    const images = []
    const srcPath = './Images'
    fs.readdir(srcPath, (err, files)=>{

        if (err) console.log(err)
        if (files){

        
            for (let file of files){
                if (file.slice(0, -3) == 'png' || 'jpg'){
                    ditherImage(srcPath +'/'+ file)
                }
               
            }
        }
    })
  }
  ditherAll()
  

  export default {
    ditherAll
  }