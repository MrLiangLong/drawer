const cluster = require('cluster');



if(cluster.isMaster){ //主进程

    cluster.setupMaster({
        exec:'./worker.js',
        silent:true
    })

    const cpus = require('os').cpus().length/2;
    
    for(let i=0;i<cpus;i++){
        createWorker()
    }

    function createWorker(){
        var worker = cluster.fork();
    
        //防止僵尸进程-->心跳
        var missed = 0; //没有回应的ping次数

        var timer = setInterval(function(){
            //3次没有响应，杀死进程
            if(missed===3){
                clearInterval(timer)
                console.log(worker.process.pid + ' has become a zombie!');
                process.kill(worker.process.pid);
                return;
            }
            //开始心跳
            missed++;
            worker.send('ping#'+worker.process.pid)
        },10000)

        worker.on("message",function(msg){
            //确定心跳回应
            if(msg==="pong#"+worker.process.pid){
                missed--;
            }
        });

        //挂了没必要再进行心跳
        worker.on('exit',function(){
            clearInterval(timer);
        })

    }

}else{
console.log("执行工作进程")
    //进程出现会崩溃的错误
    process.on('uncaughtException',function(err){
        //这里可以做写日志的操作
        console.log(err);
        process.emit(1)
    })

    // 回应心跳信息
    process.on('message', function (msg) {
        if (msg == 'ping#' + process.pid) {
            process.send('pong#' + process.pid);
        }
    });
    
    // 内存使用过多，自杀
    if (process.memoryUsage().rss > 734003200) {
        process.exit(1);
    }
    require('./app.js')
}