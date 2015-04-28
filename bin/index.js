#!/usr/bin/env node

var path        = require('path'),
		git 		    = require("nodegit"),
		fs  		    = require('fs'),
		program     = require('commander'),
    inquirer    = require('inquirer'),
    pkg 		    = require(path.join(__dirname, '../package.json')),
    progress    = require('progress');

program
	.version(pkg.version)
	.option('-s, --start [projectname]', 'Project name (required)')
	.parse(process.argv);

var questions = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    validate: function( value ) {
      if (value) {
        return true;
      } else {
        return "Please enter a name for your project";
      }
    }
  }
]

function ask() {
  inquirer.prompt( questions, function( answers ) {
    var projectName = answers.projectName.toLowerCase().replace(/[^a-zA-Z0-9]/g,'_');
    if (fs.existsSync(projectName)) {
      console.log('Project name already exists; choose a new one');
      ask();
    } else {
      getRepo(projectName);
    }
  });
}
ask();

var cloneOptions = {};
cloneOptions.remoteCallbacks = {
  certificateCheck: function() { 
  	return 1; 
  }
  ,
  credentials: function(url, userName) {
    return git.Cred.sshKeyFromAgent(userName);
  }
  ,
  transferProgress: function(info) {
    var bar = new progress(':bar', { total: 10 });
    var timer = setInterval(function () {
      bar.tick();
      if (bar.complete) {
        clearInterval(timer);
      }
    }, 100);
  }
};

var errorAndAttemptOpen = function() {
  return git.Repository.open(local);
};

function getRepo(projectName){
  console.log('╔═╗╔═╗╦ ╦\r\n╚═╗║ ╦║║║  ~~~ Simple Grunt Workflow\r\n╚═╝╚═╝╚╩╝');
	git.Clone("https://github.com/juanbrujo/simple-grunt-workflow", projectName, cloneOptions)
	.catch(errorAndAttemptOpen)
  .done(function() {
      console.log('\nReady to go! Now `$ cd ' + projectName + '` and start installing your npm and bower libs');
      process.exit();
  })
}
