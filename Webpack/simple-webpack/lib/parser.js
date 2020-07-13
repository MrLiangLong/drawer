
const fs = require('fs');
//生成AST树
const babylon = require('babylon'); 
//通过traverse的ImportDeclaration方法获取依赖属性
const traverse = require('babel-traverse').default; 
//将AST重新生成源码
const { transformFromAst } = require('babel-core');

module.exports = {
    getAST: (path) => {
        const content = fs.readFileSync(path, 'utf-8')
    
        return babylon.parse(content, {
            sourceType: 'module',
        });
    },
    getDependencis: (ast) => {
        const dependencies = []
        traverse(ast, {
          ImportDeclaration: ({ node }) => {
            dependencies.push(node.source.value);
          }
        });
        return dependencies;
    },
    transform: (ast) => {
        const { code } = transformFromAst(ast, null, {
            presets: ['env']
        });
      
        return code;
    }
};