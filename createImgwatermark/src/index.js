

//时间获取所有的格式

export const parseTime = (date=new Date())=>{
    let fullNum=_=>_>=10?_:'0'+_;
    const d=new Date(date);
    return {
        year:d.getFullYear(),
        month:fullNum(d.getMonth()+1),
        date:fullNum(d.getDate()),
        hours : fullNum(date.getHours()),
        minutes : fullNum(date.getMinutes()),
        seconds : fullNum(date.getSeconds()),
    }
}


//filder onload之后的base64编码
export const readFileAsDataURL = (file)=>{
    return new Promise(function(resolve,reject){
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload=function(e) {
            let dataBase64 = e.target.result; // result是你读取到的文件内容，此属性读取完成才能使用
            // let fileBase64 = dataBase64.split(";base64,");//base64文件内容
            resolve(dataBase64);
        }
    })
}

//通过base64生成图片并且读取图片的真实尺寸
export const createImgAndGetWHByBase64  = (base64)=>{
    return new Promise(function(resolve,reject){
        let img = new Image();
        img.onload=function(){
            const {
                width,
                height
            } = img;
            resolve({
                img,
                width,
                height
            })
        }
        img.src=base64;
    })
}

//绘制图片和水印 并输出原图加水印的base64码
export const createBase64WithImgAndWater = function({img,height,width,mime='image/jpeg',waterMark=[],markTime=true}){

    let canvas = document.createElement('canvas');
    canvas.height = height;
    canvas.width = width;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);

    let minWH =Math.min(width,height);
    let fsDot =0.12;
    if(minWH>=0 && minWH<=600){
        fsDot =0.12;
    }else if(minWH>600 && minWH<=1000){
        fsDot =0.16;
    }else if(minWH>1000 && minWH<=2000){
        fsDot =0.24;
    }else if(minWH>2000 && minWH<=3000){
        fsDot =0.6;
    }else{
        fsDot =0.8;
    }

    let fs = (100)*fsDot;//字体大小
    let lh = fs * 1.2;//行高
    let offset =fs;
    ctx.font = `${fs}px 宋体,黑体,sans-serif`;
    ctx.fillStyle = "rgba(255,80,0,0.65)";
    ctx.textAlign="right";

    if(typeof waterMark==='string'){//单个
        ctx.strokeText(waterMark||'',offset,height - offset);
    }else if(waterMark instanceof Array){//多个水印
        for(let i=0;i < waterMark.length;i++){
            let txt = waterMark[i]||'';
            let txtWidth = ctx.measureText(txt).width;
            ctx.fillText(txt,width-offset,height - offset -lh*(waterMark.length-i));
        }
        if(markTime){
            let {
                year,
                month,
                date,
                hours,
                minutes,
                seconds
            } =parseTime();

            ctx.fillText(`${year}/${month}/${date} ${hours}:${minutes}:${seconds}`,width-offset,height - offset );
        }
    }
    let waterDataUrl = canvas.toDataURL(mime||'image/jpeg',1);//base64字符串 图片质量0-1  1为无损压缩
    return waterDataUrl;
}


//base64转file
export function convertBase64UrlToBlob(urlData){
    let bytes=window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte
    //处理异常,将ascii码小于0的转换为大于0
    let ab = new ArrayBuffer(bytes.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob( [ab] , {type : 'image/png'});
}


/**
 * @param
 * file:上传的文件或者转化的base64编码
 *
 *
 * **/

export default async function({file,waterMark=[],markTime=true}) {
    //1 将file文件转换为base64
    let fileBase64 = typeof file==='object' ? await readFileAsDataURL(file):file;
    let arr = fileBase64.split(',')
    let mime = arr[0].match(/:(.*?);/)[1];//文件格式


    //2 获取图片的原始尺寸 image对象
    let {
        img,
        width,
        height
    } = await createImgAndGetWHByBase64(fileBase64) || {};

    //3 canvas 在图片上添加水印  将canvas转换为base编码
    let Base64WithImgAndWater = createBase64WithImgAndWater({
        img,
        width,
        height,
        mime,
        waterMark,//[]
        markTime
    });
    let blobWithWaterFile = convertBase64UrlToBlob(Base64WithImgAndWater);//二进制文件
    let fileWithWaterFile = window.File ? new File([blobWithWaterFile],  file.name, {type:mime}):null;// file类型文件

    return {
        blobWithWaterFile,
        fileWithWaterFile
    }
}
