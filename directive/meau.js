define(['app'],function(app){
	app.controller('navMeau',[])
	.directive('navMeauList',function(){
		return {
			restrict:'EA',
			replace:true,
			template:'<ul class="nav">' +
                      '    <li ng-class="{\'active\': isHome}"><a ng-click="go(\'/home\')" href="javascript:;">首页</a></li>' +
                      '    <li ng-class="{\'active\': isChoice}"><a ng-click="go(\'/choice\')" href="javascript:;">选择题目</a></li>' +
                      '    <li ng-class="{\'active\': isCreate}"><a ng-click="go(\'/create\')" href="javascript:;">创建题目</a></li>' +
                      '</ul>',
                      
		}
	})
});