global.localStorage = {
  getItem:function(){ return 1;},
  setItem:function(){ },
}

var assert = require("assert");
var orderer = require("../js/cacheOrLoad.js");
var util = require("util");

var createAscList, createDescList;


applyTests(
  "ASC",
  createAscList = function(){ //create Ascending List
    var list = [];
    for(var i=0;i<4;i++){
      list.push({timestamp:i});
    }
    return list;
  },
  function(number,next){ //generate the local and foreign arrays;
    var local = createAscList().slice(0,number);
    var foreign = createAscList().slice(number);
    next(void(0),[local,foreign]);
  }
)

applyTests(
  "DESC",
  createDescList = function (){ //create Descending List
    var list = [];
    for(var i=0;i<4;i++){
      list.unshift({timestamp:i});
    }
    return list;
  },
  function(number,next){ //generate the local and foreign arrays;
    var local = createDescList().slice(number);
    var foreign = createDescList().slice(0,number);
    next(void(0),[local,foreign]);
  }
);

function applyTests(type,listfn,fn){
  var list = listfn();
  var torun = runTest.bind(void(0),type,list);
  var originalLength = list.length;
  [
    {number:originalLength-1},
    {number:1},
    {number:Math.floor(originalLength/2)},
    {number:Math.floor(originalLength/2), local:function(local){
        return local.reverse();
    }}
  ].forEach(function(num){
    fn(num.number,function(error,lf){
      assert.ifError(error);
      if(num.local) lf[0] = num.local(lf[0]);
      torun(lf[0],lf[1]);
    });
  });
}


function checkTestType(local,foreign){
  if(local.length == 1)
    return "Unknown Local";
  if(foreign.length == 1)
    return "Unknown Foreign";
  if(orderer.checkArrayOrder(local) == orderer.checkArrayOrder(foreign))
    return "Same Order"
  return "Local with Wrong Order"
}

function runTest(type,original,local,foreign){
  console.log("ATTEMPT: "+constructMessage(type,local,foreign));
  var attempt = orderer.reOrderAndConsolidate(local,foreign);
  var msg = constructMessage(type,local,foreign,attempt,original);
  for(i=0;i<original.length;i++){
    assert(attempt[i].timestamp == original[i].timestamp, "FAIL: "+msg);
  }
  console.log("SUCCESS: "+msg);
}

function constructMessage(type,local,foreign,attempt,original){
  return "list["+type+"] "+
    checkTestType(local,foreign)+
    "\n"+util.inspect([attempt||local,original||foreign])
  ;
}
