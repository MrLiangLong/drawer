#!/usr/bin/env node

const program = require('commander');
const version = require("../package.json").version;
//process.env.NODE_PATH = __dirname+'/../node_modules/';

program.version(version)
	.usage('<command> [options]')
	.option('-v, --version')
	.command('init [project]','generate project by template')
	.command('*')
	.action((cmd)=>{
		if(['init'].indexOf(cmd) === -1){
		    console.log('unsupported crx-cli command',cmd)
		    process.exit(1)
		}
	})

program.parse(process.argv);



