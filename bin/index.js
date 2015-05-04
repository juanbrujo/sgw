#!/usr/bin/env node

var path      = require('path'),
    git       = require('nodegit'),
    fs        = require('fs'),
    program   = require('commander'),
    inquirer  = require('inquirer'),
    pkg       = require(path.join(__dirname, '../package.json')),
    progress  = require('progress');

program
  .version(pkg.version)
  .parse(process.argv);

// prompt initial questions
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
  ,
  {
    type: "list",
    name: "projectCss",
    message: "Choose your CSS Preprocessor:",
    choices: [ "None", "SASS", "LESS", "Stylus", "PostCSS" ]
  }
  ,
  {
    type: "list",
    name: "projectHtml",
    message: "Choose your HTML Preprocessor:",
    choices: [ "None", "Jade", "HAML", "Slim", "Liquid", "Handlebars" ]
  }
  ,
  {
    type: "list",
    name: "projectJquery",
    message: "Needing jQuery?",
    choices: [ "No", "Yes" ]
  }
  ,
  {
    type: "list",
    name: "projectIE8",
    message: "Need support IE8 and below?",
    choices: [ "No", "Yes" ]
  }
  ,
  {
    type: "list",
    name: "projectGrid",
    message: "Select a grid system?",
    choices: [ "None", "Bootstrap", "Foundation", "YUI3" ]
  }
]

// prompt for initial config
function ask() {
  // hello
  console.log('\r\n╔═╗╔═╗╦ ╦\r\n╚═╗║ ╦║║║ [ Simple Grunt Workflow CLI v.' + pkg.version + ' ]\r\n╚═╝╚═╝╚╩╝\r\n');

  // prompt initial questions
  inquirer.prompt( initQuestions, function( answers ) {

    var projectName   = answers.projectName.toLowerCase().replace(/[^a-zA-Z0-9]/g,'_'),
        projectCss    = answers.projectCss.toLowerCase(),
        projectHtml   = answers.projectHtml.toLowerCase(),
        projectJquery = answers.projectJquery.toLowerCase(),
        projectIE8    = answers.projectIE8.toLowerCase(),
        projectGrid   = answers.projectGrid.toLowerCase();

    if (fs.existsSync(projectName)) {
      console.log('Project name already exists; choose a new one');
      ask();
    } else {
      getRepo(projectName,projectCss,projectHtml,projectJquery,projectIE8,projectGrid);
    }
  });
}
ask();

// Git clone options
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

// Clone from GitHub
var repo = "https://github.com/juanbrujo/simple-grunt-workflow";

function getRepo(projectName,projectCss,projectHtml,projectJquery,projectIE8,projectGrid){

  console.log("\r\nCloning files from GitHub");

  // git clone progress bar
  var bar = new progress('downloading [:bar] :percent :etas', { total: 15 });
  var timer = setInterval(function () {
    bar.tick();
    if (bar.complete) {
      clearInterval(timer);
    }
  }, 100);

  // clone from git using node-git
  git.Clone(repo, projectName, cloneOptions)
  .catch(errorAndAttemptOpen)
  .done(function() {

    // success msg
    console.log('\r\nReady to go! Next steps:\r\n $ cd ' + projectName + '\r\n $ npm install\r\n $ bower install\r\n $ grunt init\r\n');
    
    // quit proccess, give shell back
    process.exit();
  });

  // generate custom package.json
  customPackage(projectName,projectCss,projectHtml);

  // generate custom bower.json
  customBower(projectName,projectJquery,projectIE8,projectGrid);

}

// generate a custom package.json
function customPackage(dest,css,html){
  var code = '{\n';
  code+= ' "name": "' + dest + '",\n';
  code+= '  "dependencies": {\n';
  // init custom config

  // CSS
  if( css === "sass" ) {
  code+= '    "grunt-contrib-sass": "latest",\n';
  } 
  else if ( css === "less" ) {
  code+= '    "grunt-contrib-less": "latest",\n';
  }
  else if ( css === "stylus" ) {
  code+= '    "grunt-contrib-stylus": "latest",\n';
  }
  else if ( css === "postcss" ) {
  code+= '    "grunt-postcss": "latest",\n';
  }

  // HTML
  if( html === "jade" ) {
  code+= '    "grunt-contrib-jade": "latest",\n';
  } 
  else if ( html === "haml" ) {
  code+= '    "grunt-contrib-haml": "latest",\n';
  }
  else if ( html === "slim" ) {
  code+= '    "grunt-slim": "latest",\n';
  }
  else if ( html === "liquid" ) {
  code+= '    "grunt-liquid": "latest",\n';
  }
  else if ( html === "handlebars" ) {
  code+= '    "grunt-contrib-handlebars": "latest",\n';
  }
  // end custom config

  // the rest
  code+= '    "grunt": "latest",\n';
  code+= '    "grunt-autoprefixer": "latest",\n';
  code+= '    "grunt-bowercopy": "latest",\n';
  code+= '    "grunt-contrib-concat": "latest",\n';
  code+= '    "grunt-contrib-imagemin": "latest",\n';
  code+= '    "grunt-contrib-jshint": "latest",\n';
  code+= '    "grunt-contrib-nodeunit": "latest",\n';
  code+= '    "grunt-contrib-uglify": "latest",\n';
  code+= '    "grunt-contrib-watch": "latest",\n';
  code+= '    "grunt-newer": "latest",\n';
  code+= '    "grunt-spritesmith": "latest"\n';
  code+= '  },\n';
  code+= '  "scripts": {\n';
  code+= '    "test": "grunt testjs --verbose"\n';
  code+= '  }\n';
  code+= '}';

  fs.writeFile(dest + '/package.json', code, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Custom package.json generated.");
  }); 
}

// generate a custom bower.json
function customBower(dest,jquery,ie8,grid){
  var code = '{\n';
  code+= ' "name": "' + dest + '",\n';
  code+= ' "ignore": [\n';
  code+= '  "**/.*",\n';
  code+= '  "node_modules",\n';
  code+= '  "bower_components",\n';
  code+= '  "test",\n';
  code+= '  "tests"\n';
  code+= ' ],\n';
  code+= ' "dependencies": {\n';
  // init custom config

  // jquery
  if ( jquery === "yes" ) {
  code+= '    "jquery": "1.11.3",\n';
  }
  // IE8
  if ( ie8 === "yes" ) {
  code+= '    "html5shiv": "latest",\n';
  code+= '    "respond": "latest",\n';
  code+= '    "selectivizr": "latest",\n';
  code+= '    "css3pie": "latest",\n';
  }
  // grid
  if ( grid === "yui3" ) {
  code+= '    "yui3": "latest",\n';
  }
  else if ( grid === "bootstrap" ) {
  code+= '    "bootstrap": "latest",\n';
  }
  else if ( grid === "foundation" ) {
  code+= '    "foundation": "latest",\n';
  }
  // end custom config

  // the rest
  code+= '    "detectizr": "latest",\n';
  code+= '    "modernizr": "latest"\n';
  code+= ' }';
  code+= '}';

  fs.writeFile(dest + '/bower.json', code, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Custom bower.json generated.");
  }); 
}



