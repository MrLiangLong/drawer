# HTTP相关知识

## 一、Http响应头信息
* Allow：服务器支持的请求方法(Get/Post等)
* Content-Encoding：文档的编码方法。  
    只有在解码后才可以得知Content-Type头指定的内容类型。Gzip压缩文档能够减少HTML文档下载时间。服务端Server可以通过Accpt-Encoding检查浏览器是否支持gzip，支持返回压缩经gzip压缩的页面，否则返回普通页面。
* Content-Length: 表示内容长度。
* Content-Type: 表示文档属于什么MIME类型。
* Date： 当前的GMT时间。
* Expires：文档过期时间，秒。
* Last-Modified：文档最后改动时间。
* Location：客户端应当从哪里去提取文档，用于重定向，状态码为302.
* Refresh： 浏览器应该在多少时间内刷新文档，秒。
* Server： 服务器名称。
* Set-Cookie： 设置页面关联的Cookie。


## 一、HTTP Content-Type
    用于定义网络文件的类型和网页的编码，决定浏览器以什么形式、什么编码读取这个文件。Content-Type标头告诉客户端实际返回内容的内容类型。  

    常见的媒体格式类型：
* text/html: HTML格式
* text/plain: 纯文本格式
* text/xml: XML格式
* image/gif: gif图片格式
* image/jpeg: jpg图片格式
* image/png: png图片格式
    以application开头的媒体格式类型：
* application/json: JSON数据格式
* application/pdf: pdf格式
* application/msword: Word文档格式
* application/octet-stream: 二进制流数据(常见的文件下载)
* application/x-www-form-urlencoded: 表单默认的提交数据格式，被编码为key/value格式发送到服务器
    媒体格式上传文件使用的：
* multipart/form-data: 需要在表单中进行文件上传时，使用该格式

## 二、HTML缓存
    Http缓存分为强缓存和协商缓存，用于提升资源的加载，减少网络传输，缓解服务器压力。
### 强缓存
    无需发送请求到服务器，直接读取浏览器本地缓存。强缓存又分为Disk Cache(存在硬盘中)和Memory Cache(存在内存中),存放位置是由浏览器控制的。

    是否强缓存由Expires、Cache-Control和Pragma这3个Header属性控制。

    强缓存命中，Http状态码Status Code 显示200，并声明缓存来源（Disk/Memory）

##### 1、Expires
    值为Http日期，Http/1.0中的属性，请求时会与系统时间比较，若系统时间超过Expires的值，缓存失效。但系统时间与服务器时间不准，会有缓存不准的问题，因此优先级在3属性中最低。
##### 2、Cache-Control
    此为HTTP/1.1中新增的属性，请求头和响应头都可以使用，属性值有：

    max-age：距离发起的时间秒数，超过缓存失效，单位秒。
    no-cache：不使用强缓存，需要与服务器验证缓存是否新鲜
    no-store：禁止使用缓存，包括协商缓存，每次都向服务器发请求。
    private:用于个人的缓存，中间代理，DNS均不能使用。
    public：缓存可被用于中间代理、CDN等。
    must-revalidate:缓存过期前可以使用，过期后必须向服务器校验。

##### 3、Pragma
    属性值只有一个no-cache,与Cache-Control中的no-cache一致，三者中此优先级最高。

### 协商缓存
##### 1、ETag/If-None-Match
    ETag/If-None-Match 的值是一串 hash 码，代表的是一个资源的标识符，当服务端的文件变化的时候，它的 hash码会随之改变，   
	通过请求头中的 If-None-Match 和当前文件的 hash 值进行比较，如果相等则表示命中协商缓存。ETag 又有强弱校验之分，  
	如果 hash 码是以 "W/" 开头的一串字符串，说明此时协商缓存的校验是弱校验的，只有服务器上的文件差异（根据 ETag 计算方式来决定）  
	达到能够触发 hash 值后缀变化的时候，才会真正地请求资源，否则返回 304 并加载浏览器缓存。
##### 1、Last-Modified/If-Modified-Since
    Last-Modified/If-Modified-Since 的值代表的是文件的最后修改时间，第一次请求服务端会把资源的最后修改时间放到 Last-Modified 响应头中，第二次发起请求的时候，请求头会带上上一次响应头中的 Last-Modified 的时间，并放到 If-Modified-Since 请求头属性中，服务端根据文件最后一次修改时间和 If-Modified-Since 的值进行比较，如果相等，返回 304 ，并加载浏览器缓存


ETag/If-None-Match 的出现主要解决了 Last-Modified/If-Modified-Since 所解决不了的问题：  
1、如果文件的修改频率在秒级以下，Last-Modified/If-Modified-Since 会错误地返回 304。  
2、如果文件被修改了，但是内容没有任何变化的时候，Last-Modified/If-Modified-Since 会错误地返回 304。

Etag优先级高，因为相对于 last modified 收到时钟的影响以及不能标记毫秒级的改变，应该优先使用etag 来判断文件是否发生变化。


