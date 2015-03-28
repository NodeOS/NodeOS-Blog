var errorHandler;
jQuery(function($){
  var Template = require("template");
  errorHandler = new Template(
    "script.template.error",
    "div.container.error",
    ["four-zero-three"]
  );
  var oldwinerr = window.onerror;
  window.onerror = function ( message, filename, lineno, colno, error ){
    console.log(arguments);
    if(!error){
      errorHandler.add({
        name:"Uncaught Error: "+message,
        message: filename+": "+lineno+", "+colno
      });
    }else if ( error !== undefined && error.hasOwnProperty( "name" ) && error.name == "Magic"){
      errorHandler.add({
        name:"Uncaught Error: "+error.name,
        message: message+"<pre>"+error.stack+"</pre>"
      });
    }
    if(oldwinerr){
      oldwinerr(message, filename, lineno, colno, error );
    }
  };
});

window.addError = function(error){
  if(error.status){
    errorHandler.add({name:"Ajax: "+error.status, message:error.responseText});
  }else{
    errorHandler.add({name:error.name, message:error.stack});
  }
}

window.add403 = function(){
  var topush = {
    class:"four-zero-three",
    name:"You've hit max data"
  };
  if(user.isLoggedIn){
    topush.message = "Apparently, people have been using our app too much...";
  }else{
    topush.message = "If you'd like to continue, please ";
  }
  topush.message += "<button class=\"btn btn-primary\" onclick='user.login()'>Log in</button>";
  errorHandler.add(topush);
}

window.add404 = function(){
  errorHandler.add({
    name: "Your in the wrong place my friend.",
    message: "<a href='/'>Heres a hand, we'll get you back on the right track</a>"
  });
}
