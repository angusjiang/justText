define(['angularAMD'], function(angularAMD){
    var navMenuModule = angular.module('navMenuModule', []);
    navMenuModule.directive('navMenu', [function(){
        return {
            restrict: 'EA',
            replace: true,
            template: '<ul class="nav">' +
                      '    <li ng-class="{\'active\': isHome}"><a ng-click="go(\'/home\')" href="javascript:;">首页</a></li>' +
                      '    <li ng-class="{\'active\': isChoice}"><a ng-click="go(\'/choice\')" href="javascript:;">选择题目</a></li>' +
                      '    <li ng-class="{\'active\': isCreate}"><a ng-click="go(\'/create\')" href="javascript:;">创建题目</a></li>' +
                      '</ul>',
            controller: ['$scope', '$route', '$location', function($scope, $route, $location){
                $scope.go = function(path){
                    $location.path(path);
                    $scope.isHome = path == '/home';
                    $scope.isChoice = path == '/choice';
                    $scope.isCreate = path == '/create';
                };
                $(function(){
                    try{
                        $scope.isHome = $route.current.navTab == 'home';
                        $scope.isChoice = $route.current.navTab == 'choice';
                        $scope.isCreate = $route.current.navTab == 'create';
                    }
                    catch(e){

                    }
                });
            }]
        };
    }]);
});
