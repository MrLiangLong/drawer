### 利用FP、FMP和FCP如何评估应用首屏性能？

1. load事件
页面内的所有资源加载完成触发load事件，如dom元素、文件、图片等。  
2. DOMContentLoadad
在DOM被解析完成后，立即触发，而不会被css文件、图片等资源的加载过程所阻塞，会在load事件前触发。 


这两个事件衡量的是加载行为，更适用于服务端渲染完成的。
现在，单页面应用更关心展示时间，或者说是渲染时间、绘制时间。
对用户来说就是，页面内的资源在多长时间内能够展示出来，所以需要更加准确的指标，来度量首屏展示时间。

##### FP (First Paint)
浏览器请求服务器到屏幕渲染第一个像素点的时间

##### FCP (First Content Paint)
浏览器渲染出第一个内容的时间，内容可以是文本、img标签、svg元素等，但不包括
iframe和白色背景的canvas元素

##### FMP (First Meaning Paint)
浏览器渲染出第一个关键内容的时间，和FCP不同的是，FMP计算的是第一个有意义的内容，或者说是Hero元素
呈现的时间。   

关键内容：博客网站--> 中间文章内容   视频网站-->视频   电商网站-->视频列表  


#### 查看性能指标 
Chrome Performance Timings   
LightHouse插件   
可以查看FCP和FMP

### 如何计算FP、FCP、FMP三项指标
PerformanceObserver API

1. 计算FP 和 FCP
```
const observerWithPromise = new Promise((resolve,reject)=>{
    //resolve作为构造函数参数，用来接收性能实体列表
    new PerformanceObserver(resolve).observe({ 
        entryTypes:["paint"]  //注册paint性能事件
    }).then(list=>{//获取实体列表
        list.getEntries().filter(entry=>{  //筛选FP
            return entry.name==="first-paint"
        })[0]；

         list.getEntries().filter(entry=>{  //筛选FP
            return entry.name==="first-contentful-paint"
        })[0]；
    }).then(entry=>{
        console.log(entry.startTime) //获得FP的具体事件
    })
})
```

2. 计算FCP
a. PerformanceObserve API   
b. 利用浏览器插件LightHouse的API获取应用的FCP  

```
//lightHouse的使用
1. npm install -g lighthouse
2. 执行命令
   lighthouse 网址 --output-path=输出文件路径  --output=json

```

3. 计算FMP（无法很准确获取）
a、 将页面中最大布局变化后的第一次渲染时间记成FMP。 
b、 会根据页面内容权重

### LCP 最大内容渲染（lighthouse 新版推荐）






