const ora = require('ora');
const chalk = require('chalk');
const download = require('download-git-repo');
const fs = require('fs');
const {execSync} = require('child_process');


function generator({name,description,author},projectPath=''){
	const gitPlace = require('../templates').init.path;
	const projectName = name;
	const spinner = ora('Downloading please wait...');
	
	spinner.start();
	download(`${gitPlace}`,projectPath,(err)=>{
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
			
			let packageJson = Object.assign(JSON.parse(data),{
				name,
				description,
				author
			})
			
			fs.writeFile(`./${projectName}/package.json`,JSON.stringify(packageJson,null,2),'utf8',function(err){
				spinner.stop();
				if(err){					
					console.error(err)
				}else{
					try{
						console.log("cd projectPath ",projectPath)
						execSync(`cd ${projectPath} && npm install`, { stdio: 'inherit' })
						console.log(chalk.green('project init successfully!'))
					}catch(e){
						//TODO handle the exception
						process.exit(1);
					}
					
				/* 	console.log(`
						${chalk.yellow(`cd ${name}`)}
						${chalk.yellow('npm install')}
						${chalk.yellow('npm run dev')}
					`); */
				}
			});
			
		});
	});
	
}

module.exports = generator;


