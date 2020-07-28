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