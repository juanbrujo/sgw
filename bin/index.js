#!/usr/bin/env node

var path 			= require('path'),
		git 			= require("nodegit"),
		fs  			= require('fs'),
		program  	= require('commander'),
		pkg 			= require(path.join(__dirname, '../package.json'));

program
	.version(pkg.version)
	.option('-s, --start [projectname]', 'Project name (required)')
	.option('-v, --verbose', '')
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

var cloneOptions = {};
cloneOptions.remoteCallbacks = {
  certificateCheck: function() { 
  	return 1; 
  }
  ,
  credentials: function(url, userName) {
    return git.Cred.sshKeyFromAgent(userName);
  }
  // ,
  // transferProgress: function(info) {
  //   return console.log(info);
  // }
};

var errorAndAttemptOpen = function() {
  return git.Repository.open(local);
};

function getRepo(projectName){
	git.Clone("https://github.com/juanbrujo/simple-grunt-workflow", projectName, cloneOptions)
	.catch(errorAndAttemptOpen)
  .done(function() {
      console.log('Ready to go! now `$ cd ' + projectName + '` and start installing your npm and bower libs');
      process.exit();
  })
}

getRepo(projectName);