define([
    'angularAMD',
    'scripts/components/commons/alert/alert',
    'scripts/components/commons/confirm/confirm',
    'scripts/components/commons/notify/notify',
    // 'scripts/components/commons/message/message',
    'scripts/components/commons/check-password/check-password'
], function(angularAMD){
    var commons = angular.module('commons', [
        'commons.alert',
        'commons.confirm',
        'commons.notify',
        // 'commons.message',
        'commons.check-password'
    ]);
});
