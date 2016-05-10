/**
 * Bootstrap Dialog
 * @author Michael
 * @copyright 2015.10.27 Michael
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['angularAMD', 'bootstrap', 'vanthink'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('angular'), require('bootstrap'), require('vanthink'));
    } else {
        // Browser globals
        factory(window.angular, window.bootstrap, window.vanthink)
    }
}(function (angularAMD) {
    'use strict';

    angular.module('commons.check-password', [])

    .run(['$rootScope', 'vanDialog', function($rootScope, vanDialog){

        $rootScope.checkPassword = function(message, check, cancel){
            $rootScope.checkPassword.open(message, check, cancel);
        };

        $rootScope.checkPassword.message = '';
        $rootScope.checkPassword.check = null;
        $rootScope.checkPassword.cancel = null;
        $rootScope.checkPassword.open = function(message, check, cancel){
            var self = this;

            self.message = message || '';

            self.password = '';

            self.error = '';

            self.check = check || null;

            self.cancel = cancel || null;

            vanDialog.open('commons.check-password');
        };
        $rootScope.checkPassword.close = function(){
            vanDialog.close('commons.check-password');
        };
    }])

    .directive('vanCheckPassword', [function(){
        return {
            restrict: 'EA',
            template:
                '<div van-dialog="commons.check-password" title="输入密码" confirm="checkPassword.check()" cancel="checkPassword.cancel()" size="sm">' +
                '    <div class="alert alert-danger">{{checkPassword.error || checkPassword.message}}</div>' +
                '    <div clss="form">' +
                '        <div class="form-group">' +
                '            <input ng-model="checkPassword.password" class="form-control" type="password">' +
                '        </div>' +
                '    </div>' +
                '</div>'
        };
    }])

    .factory('vanCheckPassword', ['$rootScope', 'vanDialog', function ($rootScope, vanDialog) {
        return $rootScope.checkPassword;
    }]);

}));
