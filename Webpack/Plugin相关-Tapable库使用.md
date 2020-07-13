### 插件

webpack的本质可以将其理解是一种基于事件流的编程范例，一系列的插件运行。

插件能够钩入(hook)到在每个编译(complilation)中触发的所有关键事件。在编译的每一步，插件都具备完全访问compiler对象的能力，情况合适下，还可以访问当前compilation对象。

#### Tapable

Tapable是类似于Node.js的EventEmitter的库，主要用于控制钩子函数的发布订阅，控制着webpack的插件系统。
compiler 和 compilation 均继承于Tapable。

```
class Compiler extends Tapable{}
class Compilation extends Tapable{}
```

Tapable库暴露了很多Hook(钩子)类，为插件提供挂载的钩子。  
```
const {
    SyncHook,     //同步钩子
    SyncBailHook, //同步熔断钩子
    SyncWaterfallHook, //同步流水钩子
    SyncLoopHook,  //同步循环钩子
    AsyncParallelHook,  //异步并发钩子
    AsyncParallelBailHook, //异步并发熔断钩子
    AsyncSeriesHook,   //异步串行钩子
    AsyncSeriesBailHook,  //异步串行熔断钩子
    AsyncSeriesWaterfallHook  //异步串行流水钩子
} = require("tapable);
```

##### Tapable hooks类型
| type | function |
| :-----:| :---- | 
| Hook | 所有钩子的后缀 |
| Waterfall | 同步方法，但是它会传值给下一个函数 |
| Bail | 熔断：当函数有任何返回值，就会在当前执行函数停止 |
| Loop | 监听函数返回true表示继续循环，返回undefined表示结束循环 |
| Sync | 同步方法
| AsyncSeries | 异步串行钩子
| AysncParallel | 异步并行执行钩子

##### Tapable的使用 ———new Hook新建钩子
Tapable暴露出来的都是类方法,new一个类方法获得我们需要的钩子。   
class接受数组参数options，非必传。类方法会根据传参，接受同样数量的参数。
```
const hook = new SyncHook(["arg1","arg2"])
```

##### Tapable的使用 —— 钩子的绑定与执行
Tapable提供了同步&异步绑定钩子的方法，并且他们都有绑定事件和执行事件对应的方法。

| Async* | Sync*|
| :----- | :-----|
| 绑定:tapAsync/tapPromise/tap | 绑定：tap
| 执行:callAsync/promise | 执行：call

##### Tapable的使用 —— hook基本用法示例
```
const hook = new AsyncHook(["arg1","arg2"])
//绑定事件到webpack事件流
hook.tap("hook",(arg1,arg2)=>{

})
//执行绑定的事件
hook.call(1,2)
```

##### Tapable例子--Car的加速/刹车/路径
```
const {
    SyncHook,
    AsyncSeriesHook
} = require('tapable');

class Car {
    constructor() {
        this.hooks = {
            accelerate: new SyncHook(['newspeed']),
            brake: new SyncHook(),
            calculateRoutes: new AsyncSeriesHook(["source", "target", "routesList"])
        }
    }
}
```

```

const myCar = new Car();
 
//绑定同步钩子
myCar.hooks.brake.tap("WarningLampPlugin", () => console.log('WarningLampPlugin'));
 
//绑定同步钩子 并传参
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));
 
//绑定一个异步Promise钩子
myCar.hooks.calculateRoutes.tapPromise("calculateRoutes tapPromise", (source, target, routesList, callback) => {
    // return a promise
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log(`tapPromise to ${source} ${target} ${routesList}`)
            resolve();
        },1000)
    })
});


myCar.hooks.brake.call();
myCar.hooks.accelerate.call(10);
 
console.time('cost');
 
//执行异步钩子
myCar.hooks.calculateRoutes.promise('Async', 'hook', 'demo').then(() => {
    console.timeEnd('cost');
}, err => {
    console.error(err);
    console.timeEnd('cost');
});

```




