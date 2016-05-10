define(['app', 'scripts/services/van-token-service'], function(app){
    app.factory('gameService', ['$q', 'tokenService', function($q, tokenService){
        var getRandomNumber = function(max){
            return Math.floor(Math.random() * max);
        };

        return {
            shuffle: function(testbank, exercises){

                var tmp = null;
                var fromOption = 0, toOption = 0;
                var num = testbank.option_num;
                var options = ['A', 'B', 'C', 'D'];

                for (var i = 0; i < exercises.length; i++) {
                    delete exercises[i].answer;
                    delete exercises[i].isWrong
                }
                for (var i = 0; i < exercises.length; i++) {
                    for (var j = 0; j < 10; j++) {
                        fromOption = options[getRandomNumber(num)];
                        toOption = options[getRandomNumber(num)];

                        tmp = exercises[i]['exerciseAnswer_' + fromOption];
                        exercises[i]['exerciseAnswer_' + fromOption] = exercises[i]['exerciseAnswer_' + toOption];
                        exercises[i]['exerciseAnswer_' + toOption] = tmp;

                        if(exercises[i].exercise_rightAnswer == fromOption){
                            exercises[i].exercise_rightAnswer = toOption;
                        }
                        else if(exercises[i].exercise_rightAnswer == toOption){
                            exercises[i].exercise_rightAnswer = fromOption;
                        }
                    }
                }
            },
            saveScore: function(score){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    if(!score.homework_no){
                        delete score.homework_no;
                    }
                    score.token = token;
                    $.ajax({
                        url: 'api/saveScore',
                        type: 'POST',
                        data: score,
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve(result.data);
                            }
                            else{
                                deferred.reject('游戏数据提交错误！');
                            }
                        },
                        error: function(error){
                            deferred.reject('游戏数据提交错误！');
                        }
                    });
                }, function(error){
                    deferred.reject('游戏数据提交错误！');
                });

                return deferred.promise;
            },
            getRankingList: function(testbank_no){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/getRankingList',
                        type: 'GET',
                        data: {token: token, testbank_no: testbank_no},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve(result.data);
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject(error);
                        }
                    });
                });

                return deferred.promise;
            }
        };
    }]);
});
