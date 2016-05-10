/**
 * Bootstrap Dialog
 * @author Michael
 * @copyright 2015.10.22 Michael
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

    angular.module('commons.confirm', [])

    .run(['$rootScope', 'vanDialog', function($rootScope, vanDialog){

        $rootScope.confirm = function(message, confirm, cancel){
            $rootScope.confirm.open(message, confirm, cancel);
        };

        $rootScope.confirm.message = '';
        $rootScope.confirm.confirm = null;
        $rootScope.confirm.cancel = null;
        $rootScope.confirm.open = function(message, confirm, cancel){
            var self = this;

            self.message = message || '';

            self.confirm = confirm || null;

            self.cancel = cancel || null;

            vanDialog.open('commons.confirm');
        };
        $rootScope.confirm.close = function(){
            vanDialog.close('commons.confirm');
        };
    }])

    .directive('vanConfirm', [function(){
        return {
            restrict: 'EA',
            template:
                '<div van-dialog="commons.confirm" title="创建记录" confirm="confirm.confirm()" cancel="confirm.cancel()" size="sm">' +
                '    <p>{{confirm.message}}</p>' +
                '</div>'
        };
    }])

    .factory('vanConfirm', ['$rootScope', 'vanDialog', function ($rootScope, vanDialog) {
        // return {
        //     open: function(message, confirm, cancel){
        //         $rootScope.confirm.message = message || '';
        //
        //         $rootScope.confirm.confirm = confirm || null;
        //
        //         $rootScope.confirm.cancel = cancel || null;
        //
        //         vanDialog.open('commons.confirm');
        //     },
        //     close: function(){
        //         vanDialog.close('commons.confirm');
        //     }
        //     open: $rootScope.alert.open,
        //     close: $rootScope.alert.close
        // };

        return $rootScope.confirm;
    }]);

}));
