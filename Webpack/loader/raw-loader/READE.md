##### 使用方式一：webpack.config.js
```
module.exports = {
    module: {
      rules: [
        {
          test: /\.txt$/i,
          use: [
            {
              loader: 'raw-loader',
              options: {
                esModule: false,
              },
            },
          ],
        },
      ],
    },
  };
```

##### 使用方式二：inline
```
import txt from 'raw-loader!./file.txt';

//HTML文件中直接引入资源:
<script>${require('raw-loader!babel-loader!../node_modules/lib-flexible.js')}</script>
<script>${require('raw-loader!babel-loader!./meta.html')}</script>
```

##### 使用方式三
```
import css from '!!raw-loader!./file.txt'; 
// Adding `!!` to a request will disable all loaders specified in the configuration
```

