var num = (function(){
  var temp = document.location.href.split("#!")[1];
  console.log(temp);
  if(/[0-9]+/.test(temp)) return temp;
  temp = document.location.href.split("?");
  if(temp.length == 1){
    return add404();
  }
  temp = require("querystring").parse(temp[1]);
  if(!temp._escaped_fragment_){
    return add404();
  }
  return temp._escaped_fragment_;
})();

var singleHandler;

jQuery(function($){
  if(!num) return;
  singleHandler = new Template(
    "script.template.blogsingle",
    "div.container.blogsingle"
  );
  singleHandler._x = {
    uri: "https://api.github.com/repos/NodeOS/NodeOS/issues/"+num,
    last: void(0)
  };
  cacheOrUriIterator(
    "issue-"+num,
    {
      timestamp2URI: function(timestamp,next){
        if(Date.now() - timestamp < 1000*60*60*24) return;
        user.asAuthority(singleHandler._x.uri,next);
      },
      prep: function(item, next){
        item.timestamp = Date.now();
        var l = item.labels.length;
        while(l--){
          if(item.labels[l].name === "blog"){
            break;
          }
        }
        if(l < 0){
          return addError({
            name:"Trying to load a non-blog?",
            message: "I technically can't stop you since this is clientside."+
              " Hopefully my code feels clean enough to hack"
          });
        }
        parseMarkdown(item,next);
      },
      ready: function(item,next){
        singleHandler.add(item);
        next();
      },
      done: function(date){
        singleHandler._x.last = date;
      },
      error: function(error){
        if(error.status && error.status === 403){
          add403();
        }else{
          addError(error);
        }
      }
    }
  );
});
