
var config = {
  cid: "dafb27cb88db35267e75",
  yqluri: "store://gdDAnJkTXAuVgzAQ8wboA2"
};

var AuthProvider = require("auth-provider");

AuthProvider.init({
  github:{
    client_id: config.cid,
    access_retriever:yql_access(config.yqluri)
  }
});

window.user = new AuthProvider();
user.on("error",function(e){
  console.error(e);
});
user.on("login",function(token){
  jQuery(".four-zero-three .content").text("You've authenticated!");
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
