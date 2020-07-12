/*
*Mock-Server
* */
const chokidar = require('chokidar')
const bodyParser = require('body-parser')
const chalk = require('chalk')
const path = require('path')

const mockDir = path.join(process.cwd(),'mock');

function registerRoutes(app){
	let mockLastIndex;
	const {default:mocks} = require('./index')
	for(const mock of mocks){
		app[mock.type](mock.url,mock.response)
		// app.get('/some/path',function(req,res){})
		mockLastIndex = app._router.stack.length
	}
	const mockRoutesLength = Object.keys(mocks).length
	return {
		mockRoutesLength,
		mockStartIndex:mockLastIndex - mockRoutesLength
	}
}

function unregisterRoutes(){
	Object.keys(require.cache).forEach(i=>{
		if(i.includes(mockDir)){
			delete require.cache[require.resolve(i)]
		}
	})
}

module.exports = app=>{ 
	//app-> devServer传入的实例
	//es6 polyfill
	require('@babel/register')
	
	//parser app.body
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended:true
	}))
	
	const mockRoutes = registerRoutes(app)
	let mockRoutesLength = mockRoutes.mockRoutesLength
	let mockStartIndex = mockRoutes.mockStartIndex
	
	chokidar.watch(mockDir,{
		ignored:/mock-server/,
		ignoreInitial:true
	}).on('all',(event,path)=>{
		if(event==='change' || event==='add'){
			try{
				//remoce mock routes stack
				app._router.stack.splice(mockStartIndex,mockRoutesLength)
				//clear routes cache
				unregisterRoutes();
				
				mockRoutes = registerRoutes(app);
				mockRoutesLength = mockRoutes.mockRoutesLength
				mockStartIndex = mockRoutes.mockStartIndex
				console.log(chalk.magentaBright(`\n > Mock Server hot reload success! changed  ${path}`))
			}.catch(err=>{
				console.log(chalk.redBright(err))
			})
		}
	})
}