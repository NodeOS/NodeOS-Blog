var browserify = require("browserify");
var UglifyJS = require("uglify-js");
var fs = require("fs");

var b = browserify();
b.require("markdown");
b.require(__dirname+"/node_modules/highlight.js/lib/index.js", {expose:"highlight"});
b.require("querystring");
b.require("url");
b.bundle(function(e,buff){
  if(e) throw e;
  var min = UglifyJS.parse(buff.toString("utf-8"));
  min.figure_out_scope();
  fs.writeFile(
    __dirname+"/dist/api.min.js",
    min.print_to_string(),
    function(e){
      if(e) throw e;
      console.log("wrote the js");
    }
  );
});

var ejs = require('ejs');



ejs.renderFile(
  __dirname+"/html/blog.ejs",
  {
    cur_page:{},
    htmlpath:__dirname+"/html"
  },
  function(e,file){
    if(e) throw e;
    fs.writeFile(
      __dirname+"/dist/index.html",
      file,
      function(e){
        if(e) throw e;
        console.log("wrote index.html");
      }
    );
  }
);
ejs.renderFile(
  __dirname+"/html/article.ejs",
  {
    cur_page:{},
    htmlpath:__dirname+"/html"
  },
  function(e,file){
    if(e) throw e;
    fs.writeFile(
      __dirname+"/dist/article.html",
      file,
      function(e){
        if(e) throw e;
        console.log("wrote article.html");
      }
    );
  }
);
