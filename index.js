#!/usr/bin/env node

var path 			= require('path'),
		git  			= require('gift'),
		fs  			= require('fs'),
		program  	= require('commander'),
		pkg 			= require( path.join(__dirname, '../package.json') );;

program
	.version(pkg.version)
	.option('-s, --start [projectname]', 'Project name (required)')
	.parse(process.argv);

if (!program.start) {
	console.log('You need a project name');
	return false;
}

if (fs.existsSync(program.start)) {
	console.log('Project name already exists; choose a new one');
	return false;
}

var projectName = program.start.toLowerCase().replace(/[^a-zA-Z0-9]/g,'_');

function getRepo(projectName){
	git.clone("git@github.com:juanbrujo/simple-grunt-workflow.git", projectName, function(){
		console.log('Ready to go! now `$ cd ' + projectName + '` and start installing your npm and bower libs');
	});
}

getRepo(projectName);