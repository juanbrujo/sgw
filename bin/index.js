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

var initQuestions = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Name for your project:',
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
  console.log('\r\n╔═╗╔═╗╦ ╦\r\n╚═╗║ ╦║║║ [ Simple Grunt Workflow CLI v.' + pkg.version + ' ]\r\n╚═╝╚═╝╚╩╝\r\n');
  inquirer.prompt( initQuestions, function( answers ) {
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
  transferProgress: function() {}
};

var errorAndAttemptOpen = function() {
  return git.Repository.open(local);
};

function getRepo(projectName){

  console.log("\r\nCloning files from GitHub repo...");

  var bar = new progress('downloading [:bar] :percent :etas', { total: 15 });
    var timer = setInterval(function () {
      bar.tick();
      if (bar.complete) {
        clearInterval(timer);
      }
    }, 100);
	git.Clone("https://github.com/juanbrujo/simple-grunt-workflow", projectName, cloneOptions)
	.catch(errorAndAttemptOpen)
  .done(function() {
    console.log('\r\nReady to go! Next steps:\r\n $ cd ' + projectName + '\r\n $ npm install\r\n $ bower install\r\n $ grunt init\r\n');
    process.exit();
  });

}
