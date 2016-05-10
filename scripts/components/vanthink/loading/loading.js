/**
 * Angular Loading
 * @homepage https://github.com/darthwade/angular-loading
 * @author Vadym Petrychenko https://github.com/darthwade
 * @license The MIT License (http://www.opensource.org/licenses/mit-license.php)
 * @copyright 2014 Vadym Petrychenko
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['angularAMD', 'spinjs'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(require('angular'), require('spinjs'));
  } else {
    // Browser globals
    factory(window.angular, window.Spinner)
  }
}(function (angularAMD, Spinner) {
  'use strict';

  angular.module('vanthink.loading', [])

    .value('loadingOptions', {
      active: false, // Defines current loading state
      text: '加载中...', // Display text
      className: '', // Custom class, added to directive
      overlay: true, // Display overlay
      spinner: true, // Display spinner
      spinnerOptions: {
        lines: 12, // The number of lines to draw
        length: 7, // The length of each line
        width: 4, // The line thickness
        radius: 10, // The radius of the inner circle
        rotate: 0, // Rotation offset
        corners: 1, // Roundness (0..1)
        color: '#000', // #rgb or #rrggbb
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 2, // Rounds per second
        trail: 100, // Afterglow percentage
        opacity: 1 / 4, // Opacity of the lines
        fps: 20, // Frames per second when using setTimeout()
        zIndex: 2e9, // Use a high z-index by default
        className: 'van-spinner', // CSS class to assign to the element
        top: 'auto', // Center vertically
        left: 'auto', // Center horizontally
        position: 'relative' // Element position
      }
    })

    .service('vanLoading', ['$rootScope', 'loadingOptions', function ($rootScope, loadingOptions) {
      var self = this;

      /**
       * Overrides default options
       * @param {object} options
       */
      self.setDefaultOptions = function (options) {
        extend(true, loadingOptions, options);
      };

      /**
       * Activates loading state by key
       * @param {string} key
       */
      self.start = function (key) {
        $rootScope.$evalAsync(function() {
          $rootScope.$broadcast('vanLoadingStart', key);
        });
      };

      /**
       * Update loading state by key with loadingOptions object
       * @param {string} key
       * @param {object} options
       */
      self.update = function (key, options) {
        $rootScope.$evalAsync(function() {
          $rootScope.$broadcast('vanLoadingUpdate', key, options);
        });
      };

      /**
       * Deactivates loading state by key
       * @param {string} key
       */
      self.finish = function (key) {
        $rootScope.$evalAsync(function() {
          $rootScope.$broadcast('vanLoadingFinish', key);
        });
      };
    }])

    .directive('vanLoading', ['$rootScope', 'loadingOptions', function ($rootScope, loadingOptions) {
      return {
        link: function (scope, element, attrs) {
          var spinner = null,
            key = attrs.vanLoading || false,
            options,
            container,
            body,
            spinnerContainer,
            text;

          // append stylesheet to head
          var stylesheet = angular.element('link[href="public/scripts/components/vanthink/loading/loading.css"]');
          if(stylesheet.length == 0){
              angular.element('head').append('<link href="public/scripts/components/vanthink/loading/loading.css" rel="stylesheet">');
          }

          /**
           * Starts spinner
           */
          var start = function () {
            if (container) {
              container.addClass('van-loading-active');
            }
            if (spinner) {
              spinner.spin(spinnerContainer[0]);
            }
          };

          /**
           * Update spinner, use force to update when loader is already started
           */
          var update = function (newOptions, force) {
                finish();

                options = extend(true, {}, loadingOptions, newOptions);

                // Build template
                body = angular.element('<div></div>')
                  .addClass('van-loading-body');
                container = angular.element('<div></div>')
                  .addClass('van-loading')
                  .append(body);

                if (options.overlay) {
                  container.addClass('van-loading-overlay');
                }
                if (options.className) {
                  container.addClass(options.className);
                }
                if (options.spinner) {
                    spinnerContainer = angular.element('<svg width="38px" height="38px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-ring"><rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect><circle cx="50" cy="50" r="45" stroke-dasharray="183.7831702350029 98.96016858807849" stroke="#75a3d1" fill="none" stroke-width="10"><animateTransform attributeName="transform" type="rotate" values="0 50 50;180 50 50;360 50 50;" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite" begin="0s"></animateTransform></circle></svg>');
                //   spinnerContainer = angular.element('<img src="public/vendor/svg/rolling-spin.svg" alt="">');
                //   spinnerContainer = angular.element('<div></div>')
                    // .addClass('van-loading-spinner');
                  body.append(spinnerContainer);
                  spinner = new Spinner(options.spinnerOptions);
                }
                if (options.text) {
                  text = angular.element('<div></div>')
                    .addClass('van-loading-text')
                    .text(options.text);
                  body.append(text);
                }

                element.append(container);

                if ( options.active || !key || force) {
                    start();
                }
          };

          /**
           * Stops spinner
           */
          var finish = function () {
            if (container) {
              container.removeClass('van-loading-active');
            }
            if (spinner) {
              spinner.stop();
            }
          };

          scope.$watch(attrs.vanLoadingOptions, function (newOptions) {
            update(newOptions);
          }, true);

          $rootScope.$on('vanLoadingStart', function (event, loadKey) {
            if (loadKey === key) {
              start();
            }
          });

          $rootScope.$on('vanLoadingUpdate', function (event, loadKey, options) {
            if (loadKey === key) {
              update(options, true);
            }
          });

          $rootScope.$on('vanLoadingFinish', function (event, loadKey) {
            if (loadKey === key) {
              finish();
            }
          });

          scope.$on('$destroy', function () {
            finish();
            spinner = null;
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
