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

    angular.module('commons.alert', [])

    .run(['$rootScope', 'vanDialog', function($rootScope, vanDialog){

        $rootScope.alert = function(message, confirm){
            $rootScope.alert.open(message, confirm);
        };

        $rootScope.alert.message = '';
        $rootScope.alert.confirm = null;
        $rootScope.alert.open = function(message, confirm){
            var self = this;

            self.message = message || '';

            self.confirm = confirm || null;

            vanDialog.open('commons.alert');
        };
        $rootScope.alert.close = function(){
            vanDialog.close('commons.alert');
        };
    }])

    .directive('vanAlert', [function(){
        return {
            restrict: 'EA',
            template:
                '<div van-dialog="commons.alert" title="提示信息" confirm="alert.confirm()" hide-cancel="true" size="sm">' +
                '    <p>{{alert.message}}</p>' +
                '</div>'
        };
    }])

    .factory('vanAlert', ['$rootScope', 'vanDialog', function ($rootScope, vanDialog) {
        // return {
        //     open: function(message, confirm){
        //         $rootScope.alert.message = message || '';
        //
        //         $rootScope.alert.confirm = confirm || null;
        //
        //         vanDialog.open('commons.alert');
        //     },
        //     close: function(){
        //         vanDialog.close('commons.alert');
        //     }
        //     open: $rootScope.alert.open,
        //     close: $rootScope.alert.close
        // };

        return $rootScope.alert;
    }]);

}));
