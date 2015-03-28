var async = require("async");
var version = 1;
var userversion = localStorage.getItem("cacheorUri-version");
if(!userversion || userversion === "undefined" || userversion < version){
  localStorage.clear();
}
localStorage.setItem("cacheorUri-version",version);

var checkArrayOrder, reOrderAndConsolidate;


module.exports = function(cachename, itemCBs){
  getCacheData(cachename,function(e,cacheData){
    var timestamp;
    if(e) cacheData = [];
    else if(checkArrayOrder(cacheData)=="desc"){
      timestamp = cacheData[0].timestamp
    }else{
      timestamp = cacheData[cacheData.length-1].timestamp;
    }
    UriIterator(timestamp, itemCBs,function(e,uriData){
      if(e) return itemCBs.error(e);
      var consolidated = reOrderAndConsolidate(cacheData,uriData);
      finalize(
        cachename,
        consolidated,
        itemCBs,
        function(err){
          if(err) return itemCBs.error(e);
          if(consolidated.length === 0){
            return itemCBs.done(timestamp);
          }
          if(checkArrayOrder(consolidated)=="desc"){
            return itemCBs.done(consolidated.shift().timestamp);
          }
          itemCBs.done(consolidated.pop().timestamp);
        }
      );
    });
  })
}

function getCacheData(cachename,next){
  try{
    var cached = localStorage.getItem(cachename);
  }catch(e){
    return setTimeout(next.bind(next,e),1);
  }
  if(!cached || /^\[?undefined(?:\]?)$|\[\]|\[?null(?:\]?)$/.test(cached)){
    return setTimeout(next.bind(next,"empty"),1);
  }
  try{
    cached = JSON.parse(cached);
  }catch(e){
    return setTimeout(next.bind(next,e),1);
  }
  if(!Array.isArray(cached)){
    cached = [cached];
  }
  setTimeout(next.bind(next,void(0),cached),1);
}


function UriIterator(timestamp, itemCBs, next){
  itemCBs.timestamp2URI(timestamp,function(uri){
    jQuery.get(uri).done(function(data){
      if(!Array.isArray(data)){
        data = [data];
      }
      async.eachSeries(data, function(item,next){
        itemCBs.prep(item,function(item){
          next();
        });
      },function(err){
        next(err,data);
      });
    }).fail(itemCBs.error.bind(itemCBs.error));
  });
}

checkArrayOrder = module.exports.checkArrayOrder = function(ari){
  return !ari || ari.length < 2?
    "unk":
    ari[0].timestamp < ari[1].timestamp?
      "asc":"desc";
}
reOrderAndConsolidate = module.exports.reOrderAndConsolidate = function(cacheData,uriData){
  var cacheOrder = checkArrayOrder(cacheData)
  var uriOrder = checkArrayOrder(uriData)
  var order;
  if(cacheOrder == "unk" && uriOrder == "unk"){
    order = "asc";
  }else if(cacheOrder == uriOrder){
    order = uriOrder;
  }if(cacheOrder == "unk" || uriOrder == "unk"){
    order = cacheOrder == "unk"?uriOrder:cacheOrder;
  }else if(cacheOrder != uriOrder){
    cacheData.sort(function(a,b){
      return uriOrder=="asc"?
        a.timestamp-b.timestamp:
        b.timestamp-a.timestamp;
    });
    order = uriOrder;
  }
  return order=="asc"?cacheData.concat(uriData):uriData.concat(cacheData);
}

function finalize(cachename,data,itemCBs,next){
  try{
    localStorage.setItem( cachename,JSON.stringify(data) );
  }catch(e){
    return; //some browsers don't have local storage
  }
  async.eachSeries(data, function(item,next){
    itemCBs.ready(item, next);
  },next);;
}
