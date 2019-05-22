
## 功能：将上传的图片file文件或者base64编码添加水印

#### params
* file ：文件或者base64编码
  * type : File | base64
  * required : true
  
* waterMark：水印文字配置
  * type : String | Array
  * required : false
  
* markTime ： 是否绘制水印时间
  * type ：Boolean
  * required : false
   
### useage

npm i createImgwatermark


``` javascript

   import createImageWaterMark from 'createImgwatermark';
   let file = null;//文件上传输入框中读取的文件
   
   let {
       blobWithWaterFile, //二进制文件
       fileWithWaterFile //文件类型的文件
   } = createImageWaterMark({file,['水印文字']});
   
```



