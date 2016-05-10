/**
 * Bootstrap Dialog
 * @author Michael
 * @copyright 2015.10.8 Michael
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['angularAMD'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(require('angular'));
  } else {
    // Browser globals
    factory(window.angular)
  }
}(function (angularAMD) {
  'use strict';

  angular.module('vanthink.dialog', [])

    .value('dialogOptions', {
        className: '', // Custom class, added to directive
        keyboard: false, //
        backdrop: 'static' //
    })

    .service('vanDialog', ['$rootScope', 'dialogOptions', function ($rootScope, dialogOptions) {
        var self = this;

        /**
        * Overrides default options
        * @param {object} options
        */
        self.setDefaultOptions = function (options) {
            extend(true, dialogOptions, options);
        };

        /**
        * Open dialog by key
        * @param {string} key
        */
        self.open = function (key) {
            $rootScope.$evalAsync(function() {
                $rootScope.$broadcast('vanDialogOpen', key);
            });
        };

        /**
        * Update dialog by key with dialogOptions object
        * @param {string} key
        * @param {object} options
        */
        self.update = function (key, options) {
            $rootScope.$evalAsync(function() {
                $rootScope.$broadcast('vanDialogUpdate', key, options);
            });
        };

        /**
        * Close dialog by key
        * @param {string} key
        */
        self.close = function (key) {
            $rootScope.$evalAsync(function() {
                $rootScope.$broadcast('vanDialogClose', key);
            });
        };
    }])

    .directive('vanDialog', ['$rootScope', 'dialogOptions', function ($rootScope, dialogOptions) {
        return {
            template:
              '<div class="modal" tabindex="-1" role="dialog">' +
              '    <div class="modal-dialog modal-{{size || \'md\'}}" role="document">' +
              '        <div class="modal-content">' +
              '            <div class="modal-header">' +
              '                <button ng-click="callCancel()" type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
              '                <h4 class="modal-title">{{title || "提示信息"}}</h4>' +
              '            </div>' +
              '            <div ng-transclude class="modal-body">' +
              '            </div>' +
              '            <div class="modal-footer">' +
              '                <button ng-if="!hideCancel" ng-click="callCancel()" type="button" class="btn btn-default btn-sm">{{cancelButton || "取消"}}</button>' +
              '                <button ng-if="!hideConfrim" ng-click="callConfirm()" type="button" class="btn btn-primary btn-sm">{{confirmButton || "确定"}}</button>' +
              '            </div>' +
              '        </div>' +
              '    </div>' +
              '</div>',
            transclude: true,
            replace: true,
            scope: {
                key: '@vanDialog',
                title: '@',
                size: '@',
                confirm: '&',
                cancel: '&',
                hideConfirm: '=',
                hideCancel: '=',
                confirmButton: '@',
                cancelButton: '@'
            },
            controller: ['$scope', '$element', 'vanDialog', function($scope, $element, vanDialog){

                var autoClose = true;

                $scope.callConfirm = function(){
                    autoClose = true;

                    if($scope.confirm && typeof $scope.confirm === 'function')
                    {
                        autoClose = $scope.confirm();
                    }

                    if(autoClose || typeof autoClose === 'undefined' || autoClose === null){
                        vanDialog.close($scope.key);
                    }
                };

                $scope.callCancel = function(){
                    autoClose = true;

                    if($scope.cancel && typeof $scope.cancel === 'function')
                    {
                        autoClose = $scope.cancel();
                    }

                    if(autoClose || typeof autoClose === 'undefined' || autoClose === null){
                        vanDialog.close($scope.key);
                    }
                };
            }],
            link: function ($scope, $element, $attrs) {
                var key = $attrs.vanDialog,
                    options;

                /**
                * Open dialog
                */
                var open = function () {
                    $element.modal('show');
                };

                /**
                * Update dialog
                */
                var update = function (newOptions) {
                    options = extend(true, {}, dialogOptions, newOptions);

                    $element.modal({show: false, keyboard: options.keyboard, backdrop: options.backdrop});

                    if (options.className) {
                        $element.addClass(options.className);
                    }
                };

                /**
                * Close dialog
                */
                var close = function () {
                    $element.modal('hide');
                };

                $scope.$watch($attrs.vanDialogOptions, function (newOptions) {
                    update(newOptions);
                }, true);

                $rootScope.$on('vanDialogOpen', function (event, dialogKey) {
                    dialogKey = dialogKey || '';
                    if (dialogKey === key) {
                        open();
                    }
                });

                $rootScope.$on('vanDialogUpdate', function (event, dialogKey, options) {
                    dialogKey = dialogKey || '';
                    if (dialogKey === key) {
                        update(options, true);
                    }
                });

                $rootScope.$on('vanDialogClose', function (event, dialogKey) {
                    dialogKey = dialogKey || '';
                    if (dialogKey === key) {
                        close();
                    }
                });

                $scope.$on('$destroy', function () {
                    close();
                });
            }
        };
    }]);

    /**
    * Extends the destination object `dst` by copying all of the properties from the `src` object(s)
    * to `dst`. You can specify multiple `src` objects.
    *
    * @param   {Boolean} deep If true, the merge becomes recursive (optional)
    * @param   {Object}  dst  Destination object.
    * @param   {Object}  src  Source object(s).
    * @returns {Object}       Reference to `dst`.
    */
    function extend(dst) {
        var deep = false,
        i = 1;

        if (typeof dst === 'boolean') {
            deep = dst;
            dst = arguments[1] || {};
            i++;
        }

        angular.forEach([].slice.call(arguments, i), function (obj) {
            var array, clone, copy, key, src;

            for (key in obj) {
                src = dst[key];
                copy = obj[key];

                if (dst === copy) {
                    continue;
                }

                if (deep && copy && (angular.isObject(copy) ||
                (array = angular.isArray(copy)))) {

                    if (array) {
                        clone = (src && angular.isArray(src)) ? src : [];
                    } else {
                        clone = (src && angular.isObject(src)) ? src : {};
                    }

                    dst[key] = extend(deep, clone, copy);
                }
                else if (copy !== undefined) {
                    dst[key] = copy;
                }
            }
        });

        return dst;
    }

}));
