webpack构建程序，有三种代码类型：   
1. 业务源码   
2. 三方依赖库   
3. webpack的runtime和manifest，管理所有模块的交互    

##### runtime
在模块交互时，连接所需的加载和解析。包括浏览器中的已加载模块的连接，以及懒加载模块的执行逻辑。

##### manifest
编译器compiler执行、解析和映射应用程序，所保留的所有模块详细信息，这个数据集合成为"manifest"。
当完成打包并发送到浏览器时，runtime通过manifest中的数据，来解析和加载模块。不管是import和require，最终都被转换成__webpack__require__方法。

#### 注意
runtime和manifest的注入在每次构建都会发生变化，若使用文件缓存，需要将这2模块单独抽离出来，否则每次都将产生新的文件指纹，使缓存失效。

