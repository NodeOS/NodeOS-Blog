var NodeOsBlog = angular.module('NodeOsBlog', []);
var errors = [];

NodeOsBlog.filter('to_trusted', ['$sce', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);

NodeOsBlog.controller('ErrorListCtrl', function($scope){
  $scope.errors = errors;
  var oldwinerr = window.onerror;
  window.onerror = function ( message, filename, lineno, colno, error ){
    if ( error !== undefined && error.hasOwnProperty( "name" ) && error.name == "Magic"){
      errors.push({name:"Uncaught Error: "+error.name, message: message+"<pre>"+error.stack+"</pre>"});
    }
  };
});

NodeOsBlog.controller('BlogListCtrl', function ($scope, $http) {
  $scope.uriPath = "/NodeOS/NodeOS/issues";
  $scope.labels = "blog";
  $scope.blog = [];
  $scope.parseMarkdown = function(item,next){
    $http.post("https://api.github.com/markdown",{text:item.body})
    .success(function(data){
      item.bodyHTML = data;
      next(item);
    }).error(function(data, status, headers, config) {
      errors.push({name:"Bad markdown call: "+status, message: data.message});
      item.bodyHTML = "<pre>"+item.body+"</pre>";
      next(item);
    });
  };
  $scope.last = void(0);
  $scope.loadMore = function(page){
    if($scope.last && $scope.last < page) return;
    var i=0;
    var l=-1;
    $http.get('https://api.github.com/repos'+$scope.uriPath+'?labels='+$scope.labels+'&sort=created&page='+page)
    .success(function(data,status,headers) {
      console.log(headers);
      console.log(headers.link);
      if(!$scope.last) $scope.last =  headers.link?headers.link:1;
      l = data.length;
      if(i === l) return; //No more
      var iterator = function(item){
        $scope.blog.push(item);
        i++;
        if(i === l) return;
        $scope.parseMarkdown(data[i],iterator);
      };
      $scope.parseMarkdown(data[0],iterator);
    }).error(function(data, status, headers, config) {
      errors.push({name:"Bad issues list request: "+status, message: data.message});
    });
  };
  $scope.loadMore(1);
});
