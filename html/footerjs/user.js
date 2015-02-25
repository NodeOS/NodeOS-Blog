function CookieStore(id){
  this.id = id;
  var cook = document.cookie.split(";");
  var current;
  var i;
  for(i=0;i<cook.length;i++){
    if(cook[i].indexOf("=") != -1){
      current = cook[i].split("=");
      if(current[0].replace(/s/, "") == id){
        this.cookie = JSON.parse(decodeURIComponent(current[1]));
        return;
      }
    }
  }
  this.cookie = {};
  this.save();
}

CookieStore.prototype.get = function(key){
  return this.cookie[key];
};
CookieStore.prototype.set = function(key, value){
  this.cookie[key] = value;
  this.save();
  return this;
};
CookieStore.prototype.delete = function(key){
  delete this.cookie[key];
  this.save();
  return this;
};

CookieStore.prototype.save = function(){
  document.cookie = this.id+"="+encodeURIComponent(JSON.stringify(this.cookie))+";";
};

//==========Auth Start===================


var auth = new CookieStore("auth");
var is_authed = -1;
var auth_queue = [];
var url = require("url");
var querystring = require("querystring");
var docuri = url.parse(window.location.href);
docuri.query = querystring.parse(docuri.query);
var config = {
  cid: "dafb27cb88db35267e75",
  yqluri: "store://gdDAnJkTXAuVgzAQ8wboA2"
};
if(docuri.query && docuri.query.code){
  if(docuri.query.state != auth.get("state")){
    errors.push(new Error("Improper State"));
  }else{
    getAccess(docuri.query.code);
  }
}else if(auth.get("access_token")){
  console.log(auth.get("access_token"));
  is_authed = 1;
}

function login(){
  var state = Date.now()+"_"+Math.random();
  auth.set("state", state);
  window.location.href = "https://github.com/login/oauth/authorize" +
    "?client_id="+config.cid +
    "&state="+state;
}
function getAccess(code){
  is_authed = 0;
  auth.delete("state");
  jQuery.get(compileYQL([
    "env \""+config.yqluri+"\"",
    "select * from github where CODE=\""+code+"\""
  ])).done(function(results){
    console.log("auth success");
    console.log(arguments);
    auth.set("access_token",results.query.results.OAuth.access_token);
    is_authed = 1;
    jQuery(".four-zero-three .content").text("You've authenticated!");
  }).fail(function(e){
    console.error(arguments);
    is_authed = -1;
    errors.push({
      class:"four-zero-three",
      name:"You've failed authorization",
      message: "You can always try again"
    });
  }).always(function(){
    console.log("always");
    while(auth_queue.length){
      uriAsAuthority.apply(void(0),auth_queue.pop());
    }
  });
}

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

function uriAsAuthority(uri,next){
  if(is_authed === -1) return next(uri);
  if(is_authed === 0) return auth_queue.push([uri,next]);
  uri = url.parse(uri);
  uri.query = querystring.parse(uri.query);
  uri.query.access_token = auth.get("access_token");
  uri.search = "?"+querystring.stringify(uri.query);
  next(url.format(uri));
}

function logout(){
  auth.delete("access_token");
  is_authed = -1;
}
