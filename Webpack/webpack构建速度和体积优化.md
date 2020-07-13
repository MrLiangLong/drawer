## webpack构建速度和体积优化

### 1. 速度分析：speed-measure-webpack-plugin
1. 分析整个打包总耗时。   
2. 每个插件和loader的耗时情况。   
```
const webpack = require("webpack");
const config = require('./webpack.config.js')('production');

const smp = new SpeedMeasurePlugin();
module.exports = smp(config);
```

### 2. 体积分析：webpack-bundle-analyzer
//https://www.jianshu.com/p/dbc22947a66d
构建完成会在8888端口展示大小    
1. 依赖的第三方模块文件大小   
2. 业务里面的组件代码大小   

相关配置：  
```
const BundleAnalyzerWebpack = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
    plugins:[
        new BundleAnalyzerWebpack()
    ]
}

//package.json中的scripts新增命令行
{
    scripts:{
        "analyz": "NODE_ENV=production npm_config_report=true npm run build"
    }
}

```

### 缓存优化   
工程基础包：我们通常将node_modules底下的依赖单独抽离出来，配合ETag来实现缓存。   
业务基础包：一般在common中存放的一些基础组件，或者三方组件库。如果业务基础包不进行提取会导致单chunk包重复打包相同模块，也增加了单chunk包的体积。   


要做ETAG缓存，要保证打印出来的文件指纹(hash)不能改变，因此输出的文件要配置chunkhash,根据每个chunk的内容计算出来的hash。
```
{
    output:{
        path:path.join(__dirname,"./dist"),
        filename:'[name]-[chunkhash].js',
        chunkFilename:'[name]-[chunkhash].chunk.js'
    }
}
```

使用chunkhash就保险了吗?   
1. webpack运行文件   
2. module id   
3. chunk id   
```
{
    optimization:{
        moduleIds:'hashed',
        namedChunks:'hashed'
    }
}

Webpack 4 之前的做法
//将webpack运行文件抽离出来，否则每次打包运营的文件的hash都会变化
new webpack.optimize.CommonsChunkPlugin({
    name:'runtime'
})

//固定module id
new webpack.HashedModuleIdsPlugin({
    hashFunction:'md5',
    hashDigest:'hex',
    hashDigestLength:8
})

//固定chunk id
new webpack.NamedChunksPlugin(chunk=>{
    if(chunk.name){
        return chunk.name
    }
    return chunk.modules.map(m=>{
        path.relative(m.context,m.request).join('_')
    })
})

```



