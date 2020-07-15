## 浏览器发起请求的典型场景
1. 浏览器根据域名解析IP地址  
    a. 浏览器缓存
    b. 系统缓存 
    c. 路由器缓存
    d. ISP DNS缓存
2. 浏览器与Web服务器建立一个TCP连接：3次握手  
    第一次握手：建立连接时，客户端发送syn包（syn=j）到服务器，并进入SYN_SENT状态，等待	服务器确认；SYN：同步序列编号（Synchronize Sequence Numbers）。   
    
    第二次握手：服务器收到syn包，必须确认客户的SYN（ack=j+1），同时自己也发送一个SYN包（syn=k），即SYN+ACK包，此时服务器进入SYN_RECV状态；  

    第三次握手：客户端收到服务器的SYN+ACK包，向服务器发送确认包ACK（ack=k+1），此包发送完毕，客户端和服务器进入ESTABLISHED状态，完成三次握手。  

    完成三次握手，客户端与服务器就可以开始传送数据了。

3. 浏览器给Web服务器发起一个HTTP请求  
    个HTTP请求报文由请求行（request line）、请求头部（headers）、空行（blank line）和请求数据（request body）4个部分组成。
4. 服务器响应HTTP请求，浏览器得到HTML代码  
5. 浏览器解析HTML，并请求代码中的资源  
    浏览器拿到HTML文件后，开始解析HTML代码，遇到静态资源时，就向服务器端去请求下载。
6. 关闭TCP连接，浏览器对页面进行渲染呈现


