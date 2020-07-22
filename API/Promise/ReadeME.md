## Promsie

Promise是一个对象或者函数，对外提供了一个then函数，内部拥有3个状态。

##### then函数
then函数接收两个函数作为可选参数:
```
promise.then(onFulfilled,onRejected)
```
同时遵循如下规则：  
1. 可选参数不为函数时应该被忽略；  
2. 两个函数都应该是异步执行的，即放入事件队列等待下一轮tick，而非立即执行；  
3. 当使用onFulfilled函数，会当前Promise的值作为参数传入； 
4. 当调用onRejected函数时，会将当前Promise的失败原因作为参数传入；  
5. then函数的返回值为Promise  

##### Promise的3个状态
1. pending:等待状态，可以转移到fulfilled或者rejected状态。  
2. fulfilled：执行状态，是Promise的最终态，表示执行成功，该状态不可再改变。  
3. rejected： 拒绝状态，是Promise的最终态，表示执行失败，该状态不可再改变。


