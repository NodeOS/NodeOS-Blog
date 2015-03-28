
var commentHandler;

jQuery(function($){
  if(!num) return;
  var Template = require("template");
  var cacheOrUriIterator = require("cache-or-load");

  commentHandler = new Template(
    "script.template.comments",
    "div.container.comments"
  );
  commentHandler._x = {
    uri: "https://api.github.com/repos/NodeOS/NodeOS/issues/"+num+"/comments",
    last: void(0)
  };
  cacheOrUriIterator(
    "issue-comments-"+num,
    {
      timestamp2URI: function(timestamp,next){
        var uri = commentHandler._x.uri;
        if(timestamp) {
          uri += "?since="+(new Date(timestamp+1000)).toISOString();
        }
        user.asAuthority(uri,next);
      },
      prep: function(item, next){
        item.timestamp = (new Date(item.created_at)).getTime();
        parseMarkdown(item,next);
      },
      ready: function(item,next){
        commentHandler.add(item);
        setTimeout(next,1);
      },
      done: function(date){
        commentHandler._x.last = date;
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
