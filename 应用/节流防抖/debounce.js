/*
*防抖：避免事件在时间间隔内频繁触发
*/

const debounce = (fun,wait=10)=>{
    let timer = null;
    let args;

    function debounced(...arg){
        args = arg;
        
        if(timer){
            clearTimeout(timer);
            timer = null
        }

        return new Promise((resolve,reject)=>{
            timer = setTimeout(async ()=>{
                try{
                    const result = await fun.apply(this,args)
                }catch(e){
                    reject(e)
                }
            },wait)
        })
    }

    //取消
    function cancel(){
        clearTimeout(timer);
        timer = null;
    }

    //立即执行
    function flush(){
        cancel();
        return fun.apply(this,args)
    }

    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;

}