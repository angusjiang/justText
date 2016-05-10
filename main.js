//main 主文件实现模块的加载
require.config({
	// baseUrl:'./',
	paths:{ //各个模块加载的路径 （相对于main.js 或者是baseUrl）
		'jquery':'./libs/jquery-1.11.0.min',
		'angular':'./libs/angular',
        'angularAMD': './libs/angularAMD.min',
        'angular-route': './libs/angular-route.min',
        'bootstrap': './assets/bootstrap/js/bootstrap.min',
        'vanthink': './scripts/components/vanthink/vanthink',
        'commons': './scripts/components/commons/commons',
        'zept0':'http://g.alicdn.com/sj/lib/zepto/zepto',
        'sm':'http://g.alicdn.com/msui/sm/0.6.2/js/sm',
        'extend':'http://g.alicdn.com/msui/sm/0.6.2/js/sm-extend'
	},
	shim:{  //配置不兼容AMD规范的模块
		'angular':{
            deps:['jquery'], //deps 表示模块的依赖性
			// exports:'angular'
		},
        'angular-route':['angular'],//依赖模块简写
        'angularAMD':{
            deps:['angular']
        },
		'jquery':{
			exports:'$' //exports表明输出的变量名供外部使用
		},
		'bootstrap':{
			deps:['jquery']
		}
	},
	deps:['app'] //该mian文件依赖加载app.js
});