
jQuery(function($){
  $("#westoredata>p a").click(function(e){
    e.preventDefault();
    $("#westoredata>div .more").toggle();
  });
});


function compileYQL(query){
  if(Array.isArray(query)){
    query = query.join(";");
  }
  if(typeof query != "string"){
    throw new Error("A yql query must be a string");
  }
  return "https://query.yahooapis.com/v1/public/yql?q=" +
    encodeURIComponent(query) +
    "&diagnostics=true&format=json";
}
function yql_access(yql_uri){
  return function(code,next){
    var url;
    try{
      url = compileYQL([
        "env \""+yql_uri+"\"",
        "select * from github where CODE=\""+code+"\""
      ]);
    }catch(e){
      return setTimeout(next.bind(next,e),1);
    }

    jQuery.ajax(url).done(function(results){
      next(void(0),results.query.results.OAuth.access_token);
    }).fail(function(x,status,e){
      next(e);
    });
  };
}


/* */
function parseMarkdown(item,next){
  user.asAuthority("https://api.github.com/markdown/raw",function(uri){
    jQuery.ajax({
      url:uri,
      type:'POST',
      headers: {
          'Content-Type': 'text/plain'
      },
      data:item.body
    }).done(function(data){
      item.bodyHTML = data;
    }).fail(function(response, textStatus,data) {
      if(response.status === 403){
        add403();
      }else{
        addError({name:"Bad markdown call: "+response.status, message: data.message});
      }
      item.bodyHTML = "<pre>"+item.body+"</pre>";
    }).always(function(){
      next(item);
    });
  });
}
