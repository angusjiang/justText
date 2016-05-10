define([
    'angularAMD',
    'scripts/components/vanthink/loading/loading',
    'scripts/components/vanthink/dialog/dialog',
    'scripts/components/vanthink/pagination/pagination',
    'scripts/components/vanthink/state/state'
], function(angularAMD){
    var vanthink = angular.module('vanthink', [
        'vanthink.loading',
        'vanthink.dialog',
        'vanthink.pagination',
        'vanthink.state'
    ]);
});
