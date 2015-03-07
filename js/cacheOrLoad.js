var async = require("async");

var in_memory = {};

function cacheOrUriIterator(cachename, itemCBs){
  var cached = localStorage.getItem(cachename);
  if(!cached || cached === "undefined" || cached === "[]" ){
    in_memory[cachename] = [];
    return UriIterator(cachename, void(0), itemCBs);
  }
  console.log("cached");
  cached = JSON.parse(cached);
  if(!Array.isArray(cached)){
    cached = [cached];
  }
  async.eachSeries(cached,
    itemCBs.ready,
  function(e,results){
    in_memory[cachename] = cached;
    UriIterator(cachename, cached[cached.length - 1].timestamp, itemCBs);
  });
}

function UriIterator(cachename, timestamp, itemCBs){
  itemCBs.timestamp2URI(timestamp,function(uri){
    jQuery.get(uri).done(function(data){
      if(!Array.isArray(data)){
        data = [data];
      }
      async.eachSeries(data, function(item,next){
        itemCBs.prep(item,function(item){
          itemCBs.ready(item, next);
        });
      },function(err,results){
        if(err) return itemCBs.error(err);
        in_memory[cachename] = in_memory[cachename].concat(data);
        try{
          localStorage.setItem( cachename,JSON.stringify(in_memory[cachename]) );
        }catch(e){
          return itemCBs.error(e);
        }
        delete in_memory[cachename];
        if(data.length === 0){
          itemCBs.done(timestamp);
        }else{
          itemCBs.done(data[data.length -1].timestamp);
        }
      });
    }).fail(itemCBs.error);
  });
}
