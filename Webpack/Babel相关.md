babel 的转译过程分为三个阶段：parsing(解析)、transforming(转换)、generating(输出)，以 ES6 代码转译为 ES5 代码为例，babel 转译的具体过程如下：   

1. ES6 代码输入  
2. babylon 进行解析得到 AST  
3. plugin 用 babel-traverse 对 AST 树进行遍历转译,得到新的 AST 树  
4. 用 babel-generator 通过 AST 树生成 ES5 代码  


