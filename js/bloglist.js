
var listHandler;

jQuery(function($){
  var Template = require("template");
  var cacheOrUriIterator = require("cache-or-load");
  listHandler = new Template(
    "script.template.bloglist",
    "div.container.bloglist"
  );
  listHandler._x = {
    uri: "https://api.github.com/repos/NodeOS/NodeOS/issues?labels=blog&sort=updated",
    last: void(0)
  };
  cacheOrUriIterator(
    "issue-list",
    {
      timestamp2URI: function(timestamp,next){
        var uri = listHandler._x.uri;
        if(timestamp) {
          var temp = new Date(timestamp+1000);
          uri += "&since="+(new Date(timestamp+1000)).toISOString();
        }
        user.asAuthority(uri,next);
      },
      prep: function(item, next){
        item.timestamp = (new Date(item.updated_at)).getTime();
        parseMarkdown(item,next);
      },
      ready: function(item,next){
        listHandler.add(item);
        setTimeout(next,1);
      },
      done: function(date){
        listHandler._x.last = date;
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
