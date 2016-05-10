define(['app', 'bootstrap', 'scripts/services/data-service'], function(app){
    app.controller('choiceController', ['$rootScope', '$scope', '$routeParams', '$location', 'dataService', 'vanLoading', 'vanDialog', function($rootScope, $scope, $routeParams, $location, dataService, vanLoading, vanDialog){
        $rootScope.isHomework = $rootScope.isHomework ? true : $routeParams.hw == 1 ? true : false;

        $scope.searchTypes = ['题目', '作者', '我的'];

        $scope.allCheck=[];
        $scope.setSearchType = function(index){
            $scope.searchParams.type = index + 1;
            $scope.searchType = $scope.searchTypes[index];
        };

        $scope.searchParams = {};

        $scope.testbanks = [];

        $scope.isCheckedAll = false;

        var getHomework = [];

        $scope.homework = {
            checkedList: [],
            addChecked: function(testbank){
                var self = $scope.homework;

                self.checkedList.push(testbank);
            },
            removeChecked: function(testbank){
                var self = $scope.homework;

                for (var i = 0; i < self.checkedList.length; i++) {
                    if(self.checkedList[i].testbank_no == testbank.testbank_no){
                        self.checkedList.splice(i, 1);
                        break;
                    }
                }
            },
            initTestbanks: function(){
                var self = $scope.homework;

                for (var i = 0; i < $scope.testbanks.length; i++) {
                    if(self.checkedList.filter(function(checked){
                        return checked.testbank_no == $scope.testbanks[i].testbank_no;
                    }).length > 0){
                        $scope.testbanks[i].isChecked = true;
                    }
                }
            },
            toggleTestbank: function($event, testbank){
                var self = $scope.homework;

                if(!$rootScope.isHomework){
                    return;
                }

                // jump the button event
                if($event.originalEvent.target.tagName.toUpperCase() == 'A'){
                    $event.stopPropagation();
                    return;
                }

                if(testbank.range == 1 && !testbank.is_owner && !testbank.is_pass){
                    $scope.currentTestbank = testbank;
                    testbank.isChecked = false;

                    $scope.showCheckPasswordDialog(testbank, null, function(){
                        testbank.isChecked = true;

                        self.addChecked(testbank);
                    });
                }
                else{
                    testbank.isChecked = !testbank.isChecked;
                }

                if(testbank.isChecked){
                    self.addChecked(testbank);
                }
                else{
                    self.removeChecked(testbank);
                }
            },
            choiceHomeworks: function(){
                var self = $scope.homework;

                var homeworks = [];

                for (var i = 0; i < self.checkedList.length; i++) {
                    homeworks.push({
                        tbno: self.checkedList[i].testbank_no,
                        tbname: self.checkedList[i].testbank_name
                    });
                }
                window.parent.postMessage(homeworks, '*');
            }
        };
        $rootScope.homeworkCheckedList = $scope.homework.checkedList = $rootScope.homeworkCheckedList || $scope.homework.checkedList;

        $scope.checkAllChange = function(){
            $scope.isCheckAll = !$scope.isCheckAll;
            for (var i = 0; i < $scope.testbanks.length; i++) {
                if($scope.isCheckAll && $scope.testbanks[i].range == 1 && !$scope.testbanks[i].is_pass && !$scope.testbanks[i].is_owner){
                    continue;
                }
                $scope.testbanks[i].isChecked = $scope.isCheckAll;
            }
        };

        $scope.currentTestbank = null;
        /*$scope.toggleTestbank = function($event, testbank, isInputCheck){
            if(!$rootScope.isHomework){
                return;
            }
            if(testbank.range == 1 && !testbank.is_owner && !testbank.is_pass){
                $scope.currentTestbank = testbank;
                testbank.isChecked = false;

                $scope.showCheckPasswordDialog(testbank);
            }
            else{
                if(isInputCheck){
                    $event.stopPropagation();
                    return;
                }
                testbank.isChecked = !testbank.isChecked;
                $scope.allCheck.push(testbank);
                console.log($scope.allCheck);
            }
        };*/
        $scope.isWrong=1;
        $scope.checkPassword = {
            open: function(){
                vanDialog.open('checkPassword');
            },
            check: function(){
                if(!$scope.checkPassword.password || !/^\d{6}$/.test($scope.checkPassword.password)){
                    $scope.checkPassword.error = '密码错误';
                    $scope.isWrong=0;
                    return false;
                }

                dataService.checkPassword($scope.currentTestbank.testbank_no, $scope.checkPassword.password).then(function(message){
                    $scope.checkPassword.error = '';
                    $scope.isWrong=1;
                    $scope.currentTestbank.is_pass = true;
                    $scope.currentTestbank.isChecked = true;
                    $scope.checkPassword.cancer();
                    // $scope.checkPassword.close();
                    if($scope.goPath){
                        $location.path($scope.goPath);
                    }
                }, function(error){
                    $scope.checkPassword.error = '密码错误';
                    $scope.isWrong=0;
                });

                return false;      
            },
            cancer:function(){
                
            }
        };
        $scope.showCheckPasswordDialog = function(testbank, goPath){
            $scope.currentTestbank = testbank;
            $scope.goPath = goPath;
            $scope.isWrong=1;
            $scope.checkPassword.error = '';
            $scope.checkPassword.password='';
            $scope.checkPassword.open();
            // $scope.checkPassword('未输入密码不可进行操作！', function(){
                
            // });
        };

        /*var getHomeworks = function(){
            var homeworks = [];
            for (var i = 0; i < $scope.testbanks.length; i++) {
                if($scope.testbanks[i].isChecked){
                    homeworks.push({tbno: $scope.testbanks[i].testbank_no, tbname: $scope.testbanks[i].testbank_name});
                }
            }
            return homeworks;
        };

        $scope.choiceHomeworks = function(){
            var homeworks = getHomeworks();
            if(homeworks && homeworks.length > 0){
                window.parent.postMessage(homeworks, '*');
            }
        };*/
        $scope.myKeyup=function(e){
            if (e.keyCode==13) {
                $scope.search(1);
            };
        }
        $scope.search = function(page){
            vanLoading.start('global');

            if(page == 1){
                $scope.searchParams.keywords = $scope.searchKeywords;
            }
            else{
                $scope.searchKeywords = $scope.searchParams.keywords;
            }

            $scope.searchParams.page = page || $scope.searchParams.page;

            dataService.searchTestbankList($scope.searchParams).then(function(data){
                vanLoading.finish('global');

                $scope.testbanks = data.testbanks;
                $scope.searchParams.total = data.total;

                $scope.homework.initTestbanks();

            }, function(error){
                vanLoading.finish('global');

                $scope.notify.error(error);
            });
        };

        var init = function(){
            $scope.searchParams = dataService.getSearchParams();

            $scope.search();
        };

        init();
    }]);
});
