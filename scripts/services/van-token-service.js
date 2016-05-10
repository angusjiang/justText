define(['app'], function(app){
    app.factory('tokenService', ['$q', function($q){
        var token = 'token';

        return {
            getToken: function(){
                var deferred = $q.defer();

                if(token == ''){
                    $.ajax({
                        url: '/CL/Api/Game/getToken',
                        type: 'GET',
                        dataType: 'JSON',
                        success: function(data){
                            if(data.errcode == 0){
                                token = data.data.token;
                                deferred.resolve(token);
                            }
                            else{
                                deferred.reject('error!');
                            }
                        },
                        error: function(error){
                            deferred.reject(error);
                        }
                    });
                }
                else{
                    deferred.resolve(token);
                }

                return deferred.promise;
            }
        };
    }]);
});
