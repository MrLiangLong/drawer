## 编译器
通常将把一种语言(语法)转换成另一种语言(语法)的程序成为“编译器”，高级语言都离不开编译器，比如C++、Java、JavaScript。  

不同语言的编译器的工作流程有些差异，但大体可以分成三个步骤：  
1. 解析(Parsing)  
2. 转换(Transformation)  
3. 代码生成(Code Generation)  

#### 解析
解析一般分为两个阶段：词法分析和语法分析。  

##### 词法分析：  
将接到到的源代码转换成令牌(Token),完成这个过程的函数或工具被称之为词法分析器。  
令牌由一些代码语句的碎片生成，可以是数字、标签、标点符号、运算符，或其他。   
```
//Token
{
	type:"element",
	attribute:{
		{
			name:"",
			value:""
		}
	}
}
```

##### 语法分析：  
代码令牌化之后会进入语法分析，这个过程会将之前生成的令牌转换成一种带有令牌关系描述的抽象对象表示，这种抽象的表示称为抽象语法树(Abstract Syntax Tree,AST)。完成这个过程的函数或工具被称为语法分析器(Parser)。  

抽象语法树通常是一个深度嵌套的对象，这种结构更贴合代码逻辑，在后面的操作效率相对于令牌数组也更有优势。
```
//AST
{   
    type:'document',
    children:[
      {
	    type:"element",
	    attribute:[
	      {
			name:"",
			value:""
		  }
        ],
        children:[

        ]
	  },
    ]
}

```

#### 转换
将解析完成之后的AST进行修改，完成这个过程的函数或工具称之为转换器。此过程，AST中的节点可以被修改和删除，或者新增。目的是为了代码生成的时候更加方便。

### 代码生成
编译器的最后一步就是根据转换后的AST来生成目标代码，这个阶段做的事情有时候会和转换重叠。但是代码生成最主要的部分还是根据转换后的AST来输出代码。完成这个过程的函数或工具被称为生成器。  

代码生成器必须知道如何“打印”转换后的AST中所有类型的节点，然后递归地调用自身，直到所有代码都被打印到一个很长的字符串中。  






