define(['app'],function(app){
	app.controller('ngR-ngM',['$scope',function($scope){
		//用ng-bind-html 必须使用$sce服务
    	$scope.dataR=[{name:'jxj',age:23},{name:'jxj2',age:24},{name:'jxj3',age:25}];
    	$scope.dataList=[
	    	{name:'jxj',age:23,list:[{shuxue:89,yuwen:90},{shuxue:45,yuwen:934}]},
	    	{name:'jxj2',age:24,list:[{shuxue:56,yuwen:5},{shuxue:77,yuwen:44}]},
	    	{name:'jxj3',age:25,list:[{shuxue:56,yuwen:55},{shuxue:25,yuwen:66}]}
    	];
    	$scope.selectValue='';
    	$scope.bb=function(age){
    		console.log(age);
    	}
    	$scope.aa=function(){
    		console.log($scope.selectValue);
    	}
	}]);
});