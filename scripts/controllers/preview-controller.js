define(['app', 'bootstrap', 'scripts/services/data-service', 'scripts/filters/van-html-filter'], function(app){
    app.controller('previewController', ['$scope', '$routeParams', '$location', 'dataService', 'vanLoading', 'vanDialog', function($scope, $routeParams, $location, dataService, vanLoading, vanDialog){
        $scope.testbank = null;
        $scope.exercises = [];

        $scope.showCheckPasswordDialog = showCheckPasswordDialog;

        $scope.addFavorite = addFavorite;
        $scope.removeFavorite = removeFavorite;

        $scope.showPrimissionDialog = showPrimissionDialog;

        $scope.removeTestbank = removeTestbank;

        init();

        function init(){
            if($scope.isHomework){
                $('.sidebar').addClass('hide');
            }

            if($routeParams.testbank_no){
                bindTestbankDetail($routeParams.testbank_no);

                bindScrollToOption();
            }
            else{
                $location.path('/choice');
            }
            
        }
        function sortJson(json,key){
            return json.sort(function(a,b){
                var x=a[key];
                var y=b[key];
                if (x>y) {
                    return 1;
                }
                else{
                    return -1;
                };
            });
        };
        function renderAns(exercises,testbank){
            var exercises=sortJson(exercises,'check');
            var newArr=exercises.concat(testbank);
            var str='<span>选项：</span><br>';
            for (var i = 0; i < newArr.length; i++) {
                str+=String.fromCharCode(i+65)+'.'+' '+newArr[i].answer+'<br>';
            };
            $('.showAns').html(str);
        };

        function showCheckPasswordDialog(){
            $scope.checkPassword('未输入密码不可查看的题目！', function(){
                if(!/^\S+$/.test($scope.checkPassword.password)){
                    $scope.checkPassword.error = '密码不可为空！';
                }
                else{
                    $scope.checkPassword.error = '';
                }

                dataService.checkPassword($scope.testbank.testbank_no, $scope.checkPassword.password).then(function(message){
                    $scope.checkPassword.error = '';

                    bindTestbankDetail($scope.testbank.testbank_no, $scope.checkPassword.password);

                    $scope.testbank.is_pass = true;
                    $scope.gameinfo.isPass = true;

                    $scope.checkPassword.close();
                }, function(error){
                    $scope.checkPassword.error = error;
                });

                return false;
            });
        }

        function addFavorite(testbank){
            vanLoading.start('global');

            dataService.addFavorite(testbank.testbank_no, testbank.testbank_name).then(function(message){
                vanLoading.finish('global');

                testbank.is_favorite = true;
                $scope.notify(message);
            }, function(error){
                vanLoading.finish('global');

                $scope.notify.error(error);
            });
        }

        function removeFavorite(testbank){
            vanLoading.start('global');

            dataService.removeFavorite(testbank.testbank_no).then(function(message){
                vanLoading.finish('global');

                testbank.is_favorite = false;

                $scope.notify(message);
            }, function(error){
                vanLoading.finish('global');

                $scope.notify.error(error);
            });
        }

        function showPrimissionDialog(){
            vanDialog.open('primission');
        }

        function bindTestbankDetail(testbank_no, password){
            vanLoading.start('global');

            dataService.getTestbankDetail(testbank_no, password).then(function(data){
                $scope.testbank = data.testbank;

                $scope.exercises = data.exercises;
                $scope.degree=JSON.parse(data.testbank.degree);

                renderAns($scope.exercises,$scope.degree.tips);
                if (parseInt($scope.testbank.is_owner)) {             
                };
                if($scope.testbank.range == 1 && !$scope.testbank.is_owner && !$scope.testbank.is_pass){
                    $scope.checkPassword('未输入密码仅预览10%的题目！', function(){
                        if(!/^\S+$/.test($scope.checkPassword.password)){
                            $scope.checkPassword.error = '密码不可为空！';
                        }
                        else{
                            $scope.checkPassword.error = '';
                        }

                        dataService.checkPassword($scope.testbank.testbank_no, $scope.checkPassword.password).then(function(message){
                            $scope.checkPassword.error = '';

                            bindTestbankDetail($scope.testbank.testbank_no, $scope.checkPassword.password);

                            $scope.testbank.is_pass = true;

                            $scope.checkPassword.close();
                        }, function(error){
                            $scope.checkPassword.error = error;
                        });

                        return false;
                    });
                }

                $scope.isEdit = true;

                vanLoading.finish('global');

            }, function(error){
                vanLoading.finish('global');

                $scope.alert(error, function(){
                    $location.path('/choice');
                });
            });
        }

        function removeTestbank(testbank){
            $scope.confirm('确定要进行删除操作吗？', function(){
                vanLoading.start('global');

                dataService.removeTestbank(testbank.testbank_no).then(function(message){
                    vanLoading.finish('global');

                    $scope.alert(message, function(){
                        $location.path('/choice');
                    });
                }, function(error){
                    vanLoading.finish('global');

                    $scope.notify.error(error);
                });
            });
        }

        function bindScrollToOption(){
            // set navigation to the option of article
            $('body').delegate('.article span', 'click', function(){
                var index = $(this).data('index');
                scrollToOption(index);
            });
        }

        function scrollToOption(index){
            var head = $('.sidebox .tit').height() + $('.sidebox .des').height() + 30;
            var option = $('.sidebox .exercises .item').height() + 10;
            $('.sidebox').animate({
                scrollTop: head + option * index
            });
        }
    }]);
});
