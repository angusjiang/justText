define(['app'], function(app){
    app.filter('htmlFilter', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }]);
});
