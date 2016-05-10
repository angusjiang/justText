define(['angularAMD'], function(angularAMD){
    var musicSwitcherModule = angular.module('musicSwitcherModule', []);
    musicSwitcherModule.directive('musicSwitcher', [function(){
        return {
            restrict: 'EA',
            replace: true,
            template: '<div class="music">' +
                      '    <audio src="//7xjgcu.media1.z0.glb.clouddn.com/FuIO2jBv8mOsmOV2iXEkH3rNvcCo" loop="true" hidden="true"></audio>' +
                      '    <a ng-click="toggleMusic()" ng-class="{true: \'switch-on\',false: \'switch-off\'}[isMusicPlaying]" uib-tooltip="{{musicTip}}" tooltip-placement="left" class="switch" href="javascript:;"></a>' +
                      '</div>',
            controller: ['$scope', '$element', function($scope, $element){
                // if(typeof $scope.isMusicPlaying === 'undefined' || $scope.isMusicPlaying){
                //     $element.find('audio')[0].play();
                //     $scope.isMusicPlaying = true;
                //     $scope.musicTip = '点击关闭背景音乐';
                // }
                $scope.isMusicPlaying = false;
                $element.find('audio')[0].pause();
                $scope.musicTip = '点击开启背景音乐';

                $scope.toggleMusic = function(){
                    $scope.isMusicPlaying = !$scope.isMusicPlaying;
                    if($scope.isMusicPlaying){
                        $element.find('audio')[0].play();
                        $scope.musicTip = '点击关闭背景音乐';
                    }
                    else{
                        $element.find('audio')[0].pause();
                        $scope.musicTip = '点击开启背景音乐';
                    }
                };
            }]
        };
    }]);
});
