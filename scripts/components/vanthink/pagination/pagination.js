/**
 * Bootstrap Pagination
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

  angular.module('vanthink.pagination', [])

    .directive('vanPagination', [function () {
        return {
            template:
            '<nav>' +
            '   <ul class="pagination pagination-{{size || \'md\'}}">' +
            '       <li><a ng-click="onpagging(1)" href="javascript:;" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>' +
            '       <li ng-class="{\'active\': index == page}" ng-repeat="index in pages"><a ng-click="onpagging(index)" href="javascript:;">{{index}}</a></li>' +
            '       <li><a ng-click="onpagging(total)" href="javascript:;" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>' +
            '   </ul>' +
            '</nav>',
            transclude: true,
            replace: true,
            scope: {
                total: '=', // total pages
                page: '=',  // current page number
                pagging: '&',
                size: '@'   // pagination style size {'lg' || 'md', || 'sm'}
            },
            controller: ['$scope', function($scope){

                var renderPagination = function(){
                    $scope.pages = [];

                    var begin = $scope.page - 5;
                    begin = begin > 0 ? begin : 1

                    var end = $scope.page + 5;
                    end = end <= $scope.total ? end : $scope.total;

                    for (var i = begin; i <= end; i++) {
                        $scope.pages.push(i);
                    }

                    if($scope.pages.length == 0){
                        $scope.pages.push($scope.page);
                    }
                };

                $scope.onpagging = function(page){
                    if(page == $scope.page || page == 0){
                        return;
                    }
                    $scope.pagging()(page);
                };

                $scope.$watch('page', function(page){
                    renderPagination();
                });

                $scope.$watch('total', function(newValue){
                    renderPagination();
                });
            }]
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
