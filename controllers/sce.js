define(['app','scripts/filters/van-html-filter'], function(app){
    app.controller('sce', ['$scope','$sce' ,function($scope,$sce){
    	$scope.test='my success';
    	//用ng-bind-html 必须使用$sce服务
    	$scope.thisHtml=$sce.trustAsHtml('<p class="setAnswer none-none">这里是用ng-bind-html插入的html</p>'); 
    	$scope.thisHtml2='<p class="setAnswer none-none">这里是用ng-bind-html插入的html2</p>';

    }]);
});
