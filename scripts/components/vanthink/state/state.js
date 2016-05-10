/**
 * State service
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

  angular.module('vanthink.state', [])

    .factory('vanState', ['$interval', function($interval){
        return {
            createStateMachine: function(key, scope, excepts){
                var stateHandle;

                var prefix = 'van-state-';

                var update = function(){
                    var locals = {};

                    for(var property in scope){
                        if(property.startsWith('$') || property === 'this' || typeof scope[property] === 'function' || (excepts && excepts.indexOf(property) >= 0)){
                            continue;
                        }
                        locals[property] = scope[property];
                    }

                    localStorage.setItem(prefix + key, JSON.stringify(locals));
                };

                scope.$on('$destroy', function(){
                    $interval.cancel(stateHandle);
                });

                return {
                    start: function(delay){
                        delay = delay || 60;

                        stateHandle = $interval(function(){
                            update();
                        }, delay * 1000);
                    },
                    existState: function(){
                        return !!localStorage.getItem(prefix + key);
                    },
                    restore: function(){
                        if(this.existState()){
                            var locals = {};

                            locals = JSON.parse(localStorage.getItem(prefix + key));

                            for(var property in locals){
                                scope[property] = locals[property];
                            }

                            this.reset();
                        }
                    },
                    reset: function(){
                        localStorage.removeItem(prefix + key);
                    },
                    stop: function(){
                        $interval.cancel(stateHandle);

                        this.reset();
                    }
                };
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
