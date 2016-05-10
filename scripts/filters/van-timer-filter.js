define(['app'], function(app){
    app.filter('timerFilter', [function(){
        return function(seconds){
            var minutes = Math.floor(seconds / 60);
            var seconds = seconds % 60;

            return ('00' + minutes).substr(-2) + ':' + ('00' + seconds).substr(-2);
        };
    }]);
});
