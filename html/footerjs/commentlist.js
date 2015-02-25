NodeOsBlog.controller('CommentListCtrl', function ($scope, $http) {
  $scope.uriPath = "/NodeOS/NodeOS/issues/"+hash+"/comments";
  $scope.blog = [];
  $scope.last = void(0);
  $scope.uriAsAuthority = uriAsAuthority;
  $scope.parseMarkdown = parseMarkdown;
  $scope.loadMore = function(page){
    if($scope.last && $scope.last < page) return;
    var i=0;
    var l=-1;
    $scope.uriAsAuthority(
      'https://api.github.com/repos'+$scope.uriPath+'?labels=blog&sort=created&page='+page,
      function(uri){
      $http.get(uri).success(function(data,status,headers) {
        if(!$scope.last) $scope.last =  headers.link?headers.link.split("=").pop():1;
        l = data.length;
        if(i === l) return; //No more
        var iterator = function(item){
          $scope.blog.push(item);
          $scope.$apply();
          i++;
          if(i === l) return;
          $scope.parseMarkdown(data[i],iterator);
        };
        $scope.parseMarkdown(data[0],iterator);
      }).error(function(data, status, headers, config) {
        if(status === 403){
          add403();
        }else{
          errors.push({name:"Bad issues list request: "+status, message: data.message});
        }
      });
    });
  };
  $scope.loadMore(1);
});
