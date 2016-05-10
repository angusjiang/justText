define(['angularAMD', 'angular-route'], function(angularAMD){
    var app = angular.module('app', ['ngRoute']);
    app.config(['$routeProvider', function($routeProvider){
        $routeProvider
        .when('/home', angularAMD.route({
            templateUrl: 'view/home.html',
            controller: 'homeController',
            controllerUrl: 'controllers/home-controller',
            navTab: 'home'
        }))
        .when('/next', angularAMD.route({
            templateUrl: 'view/next.html',
            controller: 'nextController',
            controllerUrl: 'controllers/next-controller',
            navTab: 'next'
        }))
        .otherwise({
            redirectTo: '/index'
        });
    }]);
    //监听路由
    app.run(['$rootScope', '$location', function($rootScope, $location) {
        $rootScope.$on('$routeChangeStart',function(){
            //console.log('路由请求开始');
        });
        $rootScope.$on('$routeChangeSuccess', function() {
            //console.log('路由请求完成');
            $rootScope.isHome = $location.path() == '/home';
        });
        $rootScope.$on('$routeChangeError',function(){
            console.log('路由请求出错');
        });
    }]);

    return angularAMD.bootstrap(app);
});
