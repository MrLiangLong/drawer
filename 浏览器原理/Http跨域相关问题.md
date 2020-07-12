### 跨域
请求协议、域名、端口三者存在不同则产生跨域

### Provisional headers are shown
显示了临时报文头”，浏览器第一次发送这个请求，请求被阻塞，未收到响应。当要求浏览器再次发送这个请求时，上个同样的请求都还没有收到响应，浏览器就会报这个警告。   

简而言之，请求并没有发出去。   

原因：   
1. 跨域请求被浏览器拦截
2. 服务器未及时响应(超时)
3. 请求被浏览器插件拦截(安装的扩展程序)
4. 该数据直接采用了缓存(from disk/memory cache)，并没有发送请求

### 自定义头导致的跨域
  前端请求带自定义头，后端接口需要设置允许该自定义头，否则会产生跨域。

1. 前端自定义请求头   
    ```
    const options = {
        type:"post",
        url:"***",
        headers:{
            custom-header:"test"
        }
    }
    ajax(options);
  ```
 
2. 后端设置允许自定义请求头的几种方式  
  1. 过滤器设置允许带请求头
  ```
    response.addHeader("Access-Control-Allow-Headers","Content-Type,custom-header")
  ```
  2. nginx中配置
  ```
  location / {
    add_header Access-Control-Allow-Origin:*;
    add_header Access-Control-Allow-Headers "Content-Type,custom-header";
  }
  ```

  补充：  
 Access-Control-Allow-Origin:*  表示支持的域名      
 Access-Control-Allow-Methods：*  表示支持的请求方法     
 Access-Control-Max-Age：60000 缓存时间      
 Access-Control-Allow-Credentials：true 允许带cookie请求跨域

 ### 预检请求（preflight request）

其实上面的配置涉及到了一个W3C标准：CORS,全称是跨域资源共享 (Cross-origin resource sharing)，它的提出就是为了解决跨域请求的。
跨域资源共享(CORS)标准新增了一组 HTTP 首部字段，允许服务器声明哪些源站有权限访问哪些资源。另外，规范要求，对那些可能对服务器数据产生副作用的HTTP 请求方法（特别是 GET 以外的 HTTP 请求，或者搭配某些 MIME 类型的 POST 请求），浏览器必须首先使用 OPTIONS 方法发起一个预检请求（preflight request），从而获知服务端是否允许该跨域请求。服务器确认允许之后，才发起实际的 HTTP 请求。在预检请求的返回中，服务器端也可以通知客户端，是否需要携带身份凭证（包括 Cookies 和 HTTP 认证相关数据）。
其实Content-Type字段的类型为application/json的请求就是上面所说的搭配某些 MIME 类型的 POST 请求,CORS规定，Content-Type不属于以下MIME类型的，都属于预检请求：   
      
``` 
application/x-www-form-urlencoded
multipart/form-data
text/plain
```
所以 application/json的请求 会在正式通信之前，增加一次"预检"请求，这次"预检"请求会带上头部信息 

```
Access-Control-Request-Headers: 
Content-Type：                         
OPTIONS /api/test HTTP/1.1
Origin: http://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
...
```
服务器回应时，返回的头部信息如果不包含Access-Control-Allow-Headers:  Content-Type则表示不接受非默认的的Content-Type。即出现以下错误：
Request header field Content-Type is not allowed by Access-Control-Allow-Headers in preflight response.
   

 




