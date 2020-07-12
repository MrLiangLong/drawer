const {prompt} = require('inquirer');//交互式命令行工具
const program = require('commander');//快速开发Nodejs命令行工具
const chalk = require('chalk'); //终端输出时颜色样式输出工具
const download = require('download-git-repo');
const ora = require('ora');//优雅的node.js终端加载动画效果
const fs = require('fs');
const {question} = require('../config/index.js')

const option = program.parse(process.argv).args[0];

module.exports = prompt(question).then(({name,description,author})=>{
	const gitPlace = require('../templates').init.path;
	const projectName = name;
	console.log(gitPlace,projectName)
	const spinner = ora('Downloading please wait...');
	
	spinner.start();
	download(`${gitPlace}`,`./${projectName}`,(err)=>{
		if(err){
			console.log(chalk.red(err));
			process.exit();
		}
		fs.readFile(`./${projectName}/package.json`,'utf8',function(err,data){
			if(err){
				spinner.stop();
				console.error(err);
				return;
			}
			
			const packageJson = JSON.parse(data);
			packageJson.name = name;
			packageJson.description = description;
			packageJson.author = author;
			
			fs.writeFile(`./${projectName}/package.json`,JSON.stringify(packageJson,null,2),'utf8',function(err){
				spinner.stop();
				if(err){					
					console.error(err)
				}else{
					console.log(chalk.green('project init successfully!'))
					console.log(`
						${chalk.yellow(`cd ${name}`)}
						${chalk.yellow('npm install')}
						${chalk.yellow('npm run dev')}
					`);
				}
			});
			
		});
	});
	
})