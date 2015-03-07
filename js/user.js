
var config = {
  cid: "dafb27cb88db35267e75",
  yqluri: "store://gdDAnJkTXAuVgzAQ8wboA2"
};

var AuthProvider = require("auth-provider");

window.user = new AuthProvider(
  config.cid,
  yql_access(config.yqluri)
);
user.on("error",function(e){
  console.error(e);
});
user.on("login",function(token){
  jQuery(".four-zero-three .content").text("You've authenticated!");
});
