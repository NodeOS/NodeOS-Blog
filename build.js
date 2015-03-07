var fs = require("fs");
var path = require("path");

var async = require("async");
var browserify = require("browserify");
var ejs = require('ejs');
var UglifyJS = require("uglify-js");


var ob = module.exports = {};
//  git@github.com:NodeOS/GitBlog.git


ob.compileHTML = function compileHTML(inputdir, templatepath, outputdir, next)
{
  fs.readdir(inputdir,function(e,files)
  {
    if(e) return next(e);

    async.each(files,function(file,next)
    {
      var input = inputdir+"/"+file;

      fs.stat(input,function(e,s)
      {
        if(e) return next(e);

        if(s.isDirectory())
          return next("things to be compiled are not expecting a directory");

        var filename = file.split(".")[0];
        var output = outputdir+"/"+filename+".html";

        ejs.renderFile(input,
        {
          cur_page:{},
          templatepath:templatepath,
          htmlpath:path.resolve(templatepath, "../")
        },
        function(e,file)
        {
          if(e) return next(e);
          fs.writeFile(output, file, function(e)
          {
            if(e) return next(e);

            next(void(0),
            {
              input:input,
              output:output
            });
          });
        });
      });
    },
    next);
  });
};

ob.compileJS = function compileJS(inputrequire, outputdir,next)
{
  var b = browserify();
  var l = inputrequire.length;

  while(l--)
  {
    var item = inputrequire[l];

    if(typeof item === "string")
    {
      b.require(item);
      continue;
    }

    if(!item.path)
      return next("when specifying something to require, "+
        "\n\t you must provide a valid string or"+
        "\n\t you must provide an object with {path:\"valid path or name\"}");

    b.require(item.path, item.options);
    inputrequire[l] = item.path;
  }

  b.bundle(function(e,buff)
  {
    if(e) return next(e);

    async.parallel(
    [
      function(next)
      {
        fs.writeFile(outputdir+"/api.js", buff,
        function(e)
        {
          if(e) return next(e);
          next(void(0), {input:inputrequire,output:outputdir+"/api.js"});
        });
      },
      function(next)
      {
        var min = UglifyJS.parse(buff.toString("utf-8"));

        min.figure_out_scope();
        fs.writeFile(outputdir+"/api.min.js", min.print_to_string(),
        function(e)
        {
          if(e) return next(e);

          next(void(0), {input:inputrequire,output:outputdir+"/api.min.js"});
        });
      }
    ],
    next);
  });
};

ob.compileAll = function compileAll(inputs, templatepath, outputdir, next)
{
  console.log("compiling all");

  async.parallel(
  [
    ob.compileHTML.bind(void(0),inputs.dir, templatepath, outputdir),
    ob.compileJS.bind(void(0),inputs.require, outputdir)
  ],
  function(e,results)
  {
    if(e) return next(e);

    var net = [];
    console.log(results);

    var l = results.length;
    while(l--)
      net = net.concat(results[l]);

    next(void(0),net);
  });
};


if(!module.parent)
{
  var inputs =
  {
    require:
    [
      "auth-provider",
      {
        path: __dirname+"/node_modules/highlight.js/lib/index.js",
        options:
        {
          expose: "highlight"
        }
      },
      "querystring",
      "async",
//    "markdown"
    ],
    dir: __dirname+"/input"
  };

  ob.compileAll(inputs, __dirname+"/template.ejs", __dirname,
  function(e,results)
  {
    if(e) throw e;

    console.log(results);
  });
}
