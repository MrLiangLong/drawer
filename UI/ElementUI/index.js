var fs = require("fs");
var path = require('path');
//配置远程路径
var remotePath = "./theme";  // 相对路径
//读取文件目录
fs.readdir(remotePath,function(err,files){
    if(err){
        console.log(err);
        return;
    }
    files.forEach(function(filename){
        var filedir = path.join(remotePath,filename);
        fs.stat(filedir,function(err, stats){
            if (err) throw err;
            if(stats.isFile()){
                if(/.css/.test(filename)) {                 
                     let content = fs.readFileSync(path.join(remotePath,filename), 'utf-8')      
                     fs.appendFile('./element.scss', content,()=>{})
                }
            } else if(stats.isDirectory()){
                return false
            }
        });
    });
});