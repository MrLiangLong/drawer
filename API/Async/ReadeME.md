## Async
async处理异步操作的关键字，本质上是Generator的语法糖。  

##### Generator函数
promise之外的另一种异步解决方案。  
当调用Generator函数后，函数并不会立即执行，而是返回一个迭代器对象。  
1. 函数体内使用yield表示式，定义不同的内部状态。  
2. 当函数体外部调用迭代器的next()函数时，函数会执行到下一个yield表达式的位置，
并返回一个对象，该对象包含属性value和done，value是调用next()函数时传入的参数，done为布尔值
表示是否执行完成。  

```
//Generator示例代码
function asyncFn(cb){
    setTimeout(cb,1000,1)
}

function* fn(){
    var result = yield asyncFn(function(data){
        it.next(data)
    })
}

var it = fn();
it.next();

```

##### async/await原理
使用generator函数,函数外部无法捕获异常，多个yield会导致调试困难。   
async/await做的事情就是将Generator转换成Promise.   
```
//async的实现逻辑
function generator2Promise(generatorFn){
    return function(){
        var gen = generatorFn.apply(this,arguments);
        return new Promise(function(resolve,reject){
            function step(key,arg){
                try{
                    var info = gen[key](arg);
                    var value = info.value;
                }catch(e){
                    reject(e)
                    return
                }
                if(info.done){
                    resolve(value);
                }else{
                    return Promise.resolve(value).then(function(value){
                        step('next',value);
                    },function(err){
                        step('throw',err);
                    })
                }
            }
            step('next')
        })
    }
}
```