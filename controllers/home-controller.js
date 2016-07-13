define(['app','scripts/filters/van-html-filter'], function(app){
    app.controller('homeController', ['$scope','$sce' ,function($scope,$sce){
    	$scope.test='这里是首页';
    	
    }]);
});
