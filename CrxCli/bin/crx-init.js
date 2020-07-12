#! /user/bin/env node
const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const rm = require('rimraf').sync;
const config = require('../config/index.js');
const generator = require('../lib/generator.js');
const path = require('path');

program.parse(process.argv)

if(!program.args.length){
	program.help();
}

const question = config.question;
const projectName = program.args[0];
const projectPath = path.resolve(projectName);
console.log('projectPath',projectPath)
if (projectName === '[object Object]') {
  console.log(chalk.red('name required!'))
  program.help()
  process.exit(1)
}

if(fs.existsSync(projectPath)){
	inquirer.prompt([
		{
			type:'confirm',
			name:'yes',
			message: 'current project directory is not empty,continue?'
		}
	]).then(res=>{
		if(res.yes){
			rm(projectPath);
			ask(question, generator);
		}
	})
}else{
	ask(question, generator);
}

function ask(_question,generator){
	let choices = _question[0].choices;
	_question.push({
		type:'confirm',
		name:'yes',
		message:'确定以上问题的答案吗?'
	});
	inquirer.prompt(_question).then(answers=>{
		console.log("answers",answers)
		if(answers.yes){
			generator(answers,projectPath);
		}else{
			ask(question,generator)
		}
	})
	
}




