define(['app', 'bootstrap','juicer','hmpopbox', 'scrollbar','scripts/services/data-service', 'scripts/services/game-service', 'scripts/filters/van-timer-filter', 'scripts/filters/van-html-filter'], function(app){
    app.controller('playController', ['$scope', '$routeParams', '$window', '$location', '$interval', '$timeout', '$filter', 'dataService', 'gameService', 'vanLoading', 'vanDialog', function($scope, $routeParams, $window, $location, $interval, $timeout, $filter, dataService, gameService, vanLoading, vanDialog){

        $scope.$on('$locationChangeStart', function(event, next, current) {
            if($scope.gameinfo.isGameStart && !window.confirm('确定要离开游戏吗？')){
                event.preventDefault();
                return;
            }
        });
       (function(isHide){
            if(isHide){
                $('.sidebar').addClass('hide');
            }
        }(!!$routeParams.is_hide));
        $scope.record=[];
        $scope.playStatus=1;
        $scope.isFinal = false;
        $scope.tpl=0;
        $scope.isDisabled=true; //提交游戏按钮的状态
        var _article = '';
        var _exercises = [];
        var _tips=[];
        var allRightAnswer=[],allWrongAnswer=[];
        var totalStart=0,totalIntergral=0;
        var getGameinfo = function(){
            return {
                total: 0,
                complete: 0,
                right: 0,
                mistake: 0,
                time: 0,
                isGameStart: false,
                isPause: true,
                isCompleted: false,
                isFinished: false,
                hasPassword: true,
                isPass: false
            };
        };

        var resetGameinfo = function(){
            $scope.gameinfo.total = 0;
            $scope.gameinfo.complete = 0;
            $scope.gameinfo.right = 0;
            $scope.gameinfo.mistake = 0;
            $scope.gameinfo.time = 0;
            $scope.gameinfo.isGameStart = false;
            $scope.gameinfo.isPause = false;
            $scope.gameinfo.isCompleted = false;
            $scope.gameinfo.isFinished = false;
        };
        $scope.gameinfo = getGameinfo();

        // $scope.testbank = {};
        // $scope.exercises = [];

        $scope.score = {
            birth_date: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),        // 进入游戏时间
            start_time: null,         // 开始游戏
            end_time: null,           // 结束时间
            activities_time: null,    // 活动持续时间
            activities_no:14,         // 活动编号
            testbank_no: $routeParams.testbank_no,       // 题目编号
            testbank_name: '',        // 题目名称
            testbank_num: 0,          // 题目数量，10，还能不等于10？
            integral: 0,              // 积分，做对题目的数量
            stars: 0,                 // 星星，做题数量
            wrong_num: 0,             // 错题，做错数量
            // wrong_words:[],          // 错题编号，
            homework_no: $routeParams.homework_no || 0,  // 作业编号
            repractice: 0             // 重练次数
        };

        $scope.showReport = false;

        var wrongs = [];

        var timer = null;

        // set navigation to the option of article
        $('body').delegate('.article span, .sidebox .item', 'click', function(){
            var index = $(this).data('index');
            var head = $('.sidebox .tit').height() + 20;
            var option = $('.sidebox .exercises .item').height() + 10;
            $('.sidebox').animate({
                scrollTop: head + option * index
            });
        });
        $scope.primission = {
            open: function(){
                vanDialog.open('primission');
            },
            correctPassword: function(){
                $scope.testbank.password = $scope.testbank.password.replace(/[^\d]/g, '');
            },
            checkPrimission: function(){
                if($scope.testbank.range == 1){
                    if($scope.testbank.password.length == 0){
                        //$scope.notify.error('您选择了密码可见，请设置6位数字密码。');
                        $scope.notify.error('密码不能为空');
                        return false;
                    }
                    if(!/^\d{6}$/.test($scope.testbank.password)){
                        //$scope.notify.error('密码格式错误：请设置6位数字密码');
                        $scope.notify.error('密码为六位数字');
                        return false;
                    }
                    $scope.savePwd = $scope.testbank.password;
                    $scope.showQun = '密码可见';
                }else{
                    $scope.showQun = '所有人可见';
                }
                    
            },
            cancer:function(){
                var nowRange=parseInt($scope.testbank.range);
                if (parseInt($scope.preRange)!=nowRange) {
                    $scope.testbank.range=$scope.preRange;
                    if (nowRange==1) {
                        $scope.showQun = '所有人可见';
                    };
                };
                if ($routeParams.testbank_no) {
                    $scope.testbank.password=$scope.antherPwd;
                }else{
                    $scope.testbank.password=$scope.savePwd;
                }
            }
        };

        $scope.$on('$destroy', function(){
            $('body').undelegate('.article span, .sidebox .item', 'click');
        });

        $scope.play = function(){
            // gameService.shuffle($scope.testbank, $scope.exercises);

            resetGameinfo();

            $scope.gameinfo.total = $scope.exercises.length;
            // $scope.gameinfo.total = $('.articleContent').find('i').length;

            $scope.gameinfo.isGameStart = true;

            $scope.continue();

            $scope.score.start_time = $filter('date')(new Date(), 'HH:mm:ss');
            for (var i = 0; i < $scope.exercises.length; i++) {
                $scope.exercises[i].isWrong=true;
            }
        };

        $scope.pause = function(){
            $scope.gameinfo.isPause = true;
            $interval.cancel(timer);
            $scope.reset=2;
        };

        $scope.continue = function(){
            $scope.gameinfo.isPause = false;
            timer = $interval(function(){
                $scope.gameinfo.time++;
            }, 1000);
            $scope.reset=1;
        };

        $scope.finish = function(){
            allWrongAnswer=[];
            $scope.gameinfo.isFinished = true;
            var wrongAnswers = [];
            var rightAnswers = [];
            var wrong_words= [];
        
            var obj=$('a[nt-type="getIndex"]');
            console.log(obj.length);
            for (var i = 0; i < obj.length; i++) {
                    if (parseInt(obj.eq(i).prev().html())==parseInt(obj.eq(i).attr('check'))) {
                        $scope.gameinfo.right++;
                        $scope.exercises[i].isWrong=false;
                        if (!$scope.score.repractice) {
                            allRightAnswer.push(obj.eq(i).html());//
                        };
                        allWrongAnswer.push(''); //
                        obj.eq(i).attr('isWrong','false');
                    }else{
                        obj.eq(i).attr('isWrong','right');
                        $scope.exercises[i].isWrong=true;
                        $scope.gameinfo.mistake++;
                        wrongAnswers.push(obj.eq(i).html());

                        allWrongAnswer.push(obj.eq(i).html());//

                        // var k=i+1;
                        // for (var j = 0; j < $scope.exercises.length; j++) {
                        //     if (k==parseInt($scope.exercises[j].check)) {
                        //         wrong_words.push($scope.exercises[j].exercise_no);
                        //         rightAnswers.push($scope.exercises[j].answer);
                        //         if (!$scope.score.repractice) {
                        //             allRightAnswer.push($scope.exercises[j].answer);//
                        //         }
                        //     };
                        // };

                        var selChk=[];
                        selChk.push(parseInt(obj.eq(i).prev().html()));
                        for (var x = 0; x < selChk.length; x++) {
                            for (var j = 0; j < $scope.exercises.length; j++) {
                                if (selChk[x]==$scope.exercises[j].check) {
                                    wrong_words.push($scope.exercises[j].exercise_no);
                                    rightAnswers.push($scope.exercises[j].answer);
                                    if (!$scope.score.repractice) {
                                        allRightAnswer.push($scope.exercises[j].answer);//
                                    }
                                };
                            }
                        };

                    }
                
            };  
        
            $scope.pause();
            $scope.score.end_time = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');           //结束时间
            $scope.score.activities_time = $filter('date')((new Date(1970, 1, 1)).setSeconds($scope.gameinfo.time), 'HH:mm:ss');   //活动持续时间
            $scope.score.wrong_num=$scope.gameinfo.mistake;
            $scope.score.integral = $scope.gameinfo.right;          //积分，做对题目的数量
            //$scope.score.stars += $scope.exercises.length;             //星星，做题数量
            if (!$scope.score.repractice) {
                $scope.score.stars = $scope.exercises.length;
            }else{
                for (var i = 0; i < $('.preColor').length; i++) {
                    if ($('.preColor').eq(i).css('display')=='inline-block') {
                        $scope.score.stars +=1;
                    };
                };
            }
            //$scope.score.wrong_num = $scope.gameinfo.mistake;         //错题，做错数量
            //$scope.score.wrong_words = wrongs.join(',');       //错题编号

            $scope.score.wrong_answer = JSON.stringify(wrongAnswers);
            $scope.score.right_answer = JSON.stringify(rightAnswers);
            $scope.score.wrong_words='';
            $scope.score.exercises_name = $scope.score.right_answer;
            for (var i = 0; i < wrong_words.length; i++) {
                $scope.score.wrong_words+=wrong_words[i]+',';
            };
            $scope.score.wrong_words=$scope.score.wrong_words.substring(0,$scope.score.wrong_words.length-1);
            $scope.reset=1;
            vanLoading.start('global');
            gameService.saveScore($scope.score).then(function(data){
                totalStart+=parseInt(data.stars);
                //$scope.score.integral += data.integral * 1;
                totalIntergral+=parseInt(data.integral);
                $scope.playStatus=2;
                if ($scope.score.wrong_num==0) {
                    $('a[nt="replayMis"]').hide();
                }else{
                    $('a[nt="replayMis"]').show();
                }
                $scope.rankingList = data.rankList;
                if(data.better){
                    $scope.rankingList.prevOne = data.better;
                }

                vanLoading.finish('global');
                if (!$scope.score.repractice) {
                    $scope.score.stars=data.stars;
                    $scope.score.integral=data.integral;
                }else{
                    $scope.score.stars=totalStart;
                    $scope.score.integral=totalIntergral;
                }

                $scope.score.score_no = data.score_no;

                if(data.quality == 0){
                    $scope.notify.error('该作业未达标！');
                }

                window.parent.postMessage({hwid: $scope.score.homework_no}, '*');
            }, function(error){
                vanLoading.finish('global');

                $scope.notify.error(error);
            });
        };
        $scope.existMistake = function(){
            var hasWrong = false;
            for (var i = $scope.exercises.length - 1; i >= 0; i--) {
                if($scope.exercises[i].isWrong){
                    hasWrong = true;
                    break;
                }
            }
            return hasWrong;
        };
        function convert(html){

        }
        function splitA(arr){
            for (var i = 0; i < arr.length; i++) {
                if (arr[i]==''||typeof (arr[i])=="undefined") {
                    arr.splice(i,1);
                    i=i-1;
                };
            };
            return arr;
        };
        function getAns(arr){
            var str='';
            for (var i = 0; i < arr.length; i++) {
                str+='<li class="clearfix">'+
                    '<div class="img-outer fl">'+
                       '<img src="http://img1.vued.vanthink.cn/vued283f06c0bfb35b450bc95d686368e417.jpg" width="100%"alt="">'+
                    '</div>'+
                    '<a class="clickA" href="javascript:;">'+arr[i]+'</a>'+
                '</li>'
            };
            return str;
        };
        $scope.replayMistake = function(){    
            $scope.isDisabled=true;
            if(!$scope.existMistake()){
                $scope.notify('没有错题可以进行练习！');
                return;
            } 
            $scope.score.stars=0;
            $scope.playStatus=1;
            $('.preColor').each(function(index, el) {
                $(el).css({
                    display: 'inline-block'
                });
            });
            var w=allWrongAnswer;
            var r=allRightAnswer;
            
            for (var i = 0; i < w.length; i++) {
                if (w[i]=='') {
                    $('.preColor').eq(i).hide();
                    $('.preColor').eq(i).parent().append('<span class="clone">'+"<a> </a>"+'<span style="color:blue;">'+r[i]+'</span>'+"<a> </a>"+'</span>');
                }
            };
            $('.clone').nextAll().remove();
            
            for (var i = 0; i < $('.preColor').length; i++) {
                $('.preColor').eq(i).removeClass('addColor');
                $('.preColor').eq(i).html('');
            }; 
            for (var i = 0; i < $('.clickA').length; i++) {
                $('.clickA').eq(i).removeClass('addColor2');
            };
            for (var i = 0; i < w.length; i++) {
                if (w[i]!='') {
                    $scope.selectIx=i+1;//清除之前保存的索引值
                    $('.preColor').eq(i).addClass('addColor');
                    $('.preColor').eq(i).removeClass('preColor2');
                    break;
                }
            };
            for (var i = 0; i < $('.preColor').length; i++) {
                $('.preColor').eq(i).removeAttr('indexnumb');
            };
            $scope.serachRst=false;
            // slectIndex();
            /*slectAnswer();*/
            wrongs = [];
            var time = $scope.gameinfo.time;
            resetGameinfo();
            $scope.gameinfo.time = time;
            $scope.gameinfo.total = $scope.exercises.length;
            $scope.gameinfo.isGameStart = true;

            // $scope.gameinfo.isFinished = false;
            
            // $scope.gameinfo.isCompleted = false;

            // $scope.gameinfo.total = $scope.exercises.length;
            // $scope.gameinfo.complete = 0;
            $scope.gameinfo.right = 0;
            // $scope.gameinfo.mistake = 0;
            // $scope.gameinfo.isGameStart = true;

            $scope.score.wrong_words = '';
            

            $scope.continue();

            $scope.score.repractice++; //错题重做计数累加
        };

        $scope.setFinal = function(){
            $scope.isFinal = true;

            //reset exercises
            var exercises = dataService.cloneExercises(_exercises);
            for (var i = 0; i < $scope.exercises.length; i++) {
                if($scope.exercises[i].isWrong){
                    for (var j = 0; j < exercises.length; j++) {
                        if($scope.exercises[i].exercise_no == exercises[j].exercise_no){
                            exercises[i].isWrong = true;
                        }
                    }
                }
            }
            $scope.exercises = exercises;

            //reset score
            //reset gameinfo
            $scope.gameinfo.total = _exercises.length;
            $scope.gameinfo.right = $scope.gameinfo.total - $scope.gameinfo.mistake;
        };

        $scope.replayAll = function(){
            $scope.testbank.article = _article;
            $scope.exercises = dataService.cloneExercises(_exercises);
            //reset exercises
            for (var i = 0; i < $scope.exercises.length; i++) {
                $scope.exercises[i].isWrong = false;
                $scope.exercises[i].isCompleted = false;
            }

            $scope.playStatus=1;
            var newArr=[];
            newArr=$scope.exercises.concat(JSON.parse($scope.testbank.degree).tips);
            var html=$scope.testbank.article;
            html=format(html);
            /*add by 16.4.12*/
            newArr.sort(function(){
                return 0.5-Math.random();
            });
            // return;
            /*add by 16.4.12*/
            $('.ansCount-ul').html(getAnswer(newArr));
            $('.articleContent').html(html);
            $scope.selectIx=1;//这是个全部变量，这里必须清除之前play保存的值,(全部重练索引值还是第一个默认的)
            $scope.serachRst=false;
            // slectIndex();
            // slectAnswer();


            $scope.score.wrong_num=0; //重练 错题是0
            totalStart=0;
            totalIntergral=0;
            $scope.isDisabled=true;

            //reset isFinal
            $scope.gameinfo.right=0;
            $scope.gameinfo.time=0;
            $scope.isFinal = false;

            // remove the score no
            // delete $scope.score.score_no;
            delete $scope.score.score_no;
            $scope.score.stars = 0;
            $scope.score.integral = 0;

            wrongs= [];

            $scope.score.repractice = 0;
            $scope.score.wrong_words = '';
            $scope.score.repractice = 0;
            
            //play
            $scope.play();
        };

        $scope.openRankingDialog = function(){
            vanDialog.open('ranking-list');

            vanLoading.start('ranking-list');

            gameService.getRankingList($routeParams.testbank_no).then(function(rankingList){
                $scope.rankingList = rankingList;

                vanLoading.finish('ranking-list');
            });
        };
        function format(html){
            var node='<a href="javascript:;" class="preColor preColor2"></a>';
            var result=html.replace(/____/g,node);
            return result;
        };
        function getRandomNum(min,max){
            var Range=max-min;
            var Rand = Math.random();   
            return(min + Math.round(Rand * Range)); 
        };
        function getAnswer(arr){
            var str='';
            for (var i = 0; i < arr.length; i++) {
                var random=getRandomNum(1,36);
                str+='<li class="clearfix">'+
                    '<div class="img-outer fl">'+
                       '<img src="/SS/public/images/junyong'+random+'.jpg" width="100%"alt="">'+
                    '</div>'+
                    '<div class="ans-outer fl">'+
                        '<a class="clickA" href="javascript:;">'+arr[i].answer+'</a>'+
                    '</div>'
                '</li>'
            };
            return str;
        };
        $scope.selectIx=1;

        //没有完成题目，按钮不可以点击
        function checkInf(){
            for (var i = 0; i < $('.preColor').length; i++) {
                if ($('.preColor').eq(i).css('display')=='inline-block') {
                  if ($('.preColor').eq(i).html()) {
                    }else{
                        return false;
                    }  
                };
            };
        }
        function slectIndex(){
            $('.preColor').eq(0).addClass('addColor');
            $('.preColor').eq(0).removeClass('preColor2');
            $('.articleContent').on('click','.preColor',function(event) {
                event.preventDefault();
                for (var i = 0; i < $('.preColor').length; i++) {
                    $('.preColor').eq(i).removeClass('addColor');
                    $('.preColor').eq(i).addClass('preColor2');
                }; 
                var Index2=$(this).index('.preColor');
                $(this).addClass('addColor');
                $(this).addClass('preColor2')
                $scope.selectIx=Index2+1;
            });
        };
        function slectAnswer(){
            $('.ansCount-ul').on('click','.clickA', function(event) {
                event.preventDefault();
                var Index=$(this).index('.clickA');
                var v=$(this).html();
                $(this).addClass('addColor2');
                var myIndex=$('.preColor').eq($scope.selectIx-1).attr('indexnumb');

                /*add by 4.12*/
                if ($scope.selectIx){
                    $('.preColor').eq($scope.selectIx-1).html($(this).html());
                    $('.preColor').eq($scope.selectIx-1).attr('indexNumb',Index);
                    for (var i = 0; i < $scope.exercises.length; i++) {
                        if ($scope.exercises[i].answer==v) {
                            $('.preColor').eq($scope.selectIx-1).attr('check',$scope.exercises[i].check);
                            break;
                        }else if(i==$scope.exercises.length-1){
                            $('.preColor').eq($scope.selectIx-1).attr('check','hehe');
                        }
                    };
                    
                    $('.preColor').eq($scope.selectIx-1).attr('nt-type','getIndex');
                    $('.preColor').eq($scope.selectIx-1).css('display','inline');
                    if ($scope.selectIx!=$('.preColor').length) {
                        $('.preColor').eq($scope.selectIx-1).removeClass('addColor');
                    }
                }
                /*add by 4.12*/

                // if ($scope.selectIx && $scope.exercises [Index]) {
                //    var aa=$scope.exercises[Index].check; 
                //    $('.preColor').eq($scope.selectIx-1).html($(this).html());
                //    $('.preColor').eq($scope.selectIx-1).attr('indexNumb',Index);
                //    $('.preColor').eq($scope.selectIx-1).attr('check',aa);
                //    $('.preColor').eq($scope.selectIx-1).attr('nt-type','getIndex');
                //    $('.preColor').eq($scope.selectIx-1).css('display','inline');
                //    if ($scope.selectIx!=$('.preColor').length) {
                //        $('.preColor').eq($scope.selectIx-1).removeClass('addColor');
                //    }
                // }else{
                //     if ($scope.selectIx){
                //        $('.preColor').eq($scope.selectIx-1).html($(this).html());
                //        $('.preColor').eq($scope.selectIx-1).attr('indexNumb',Index);
                //        $('.preColor').eq($scope.selectIx-1).attr('check','hehe');
                //        $('.preColor').eq($scope.selectIx-1).attr('nt-type','getIndex'); 
                //        $('.preColor').eq($scope.selectIx-1).css('display','inline');
                //        if ($scope.selectIx!=$('.preColor').length) {
                //            $('.preColor').eq($scope.selectIx-1).removeClass('addColor');
                //        }
                //     }   
                // }


                var myIndex2=$('.preColor').eq($scope.selectIx-1).attr('indexnumb');
                $scope.serachRst=false;
                if (myIndex) {
                    if (parseInt(myIndex)!=parseInt(myIndex2)) {
                        $scope.serachRst=false;
                        for (var i = 0; i < $('.preColor').length; i++) {
                            if (parseInt(myIndex)==parseInt($('.preColor').eq(i).attr('indexnumb'))) {
                                $scope.serachRst=true;
                            };
                        };
                        if (!$scope.serachRst) {
                           $('.clickA').eq(myIndex).removeClass('addColor2'); 
                        };
                    };
                };
                //完成上一题，下一题自动聚焦
                if ($scope.selectIx!=$('.preColor').length) {
                    for (var i = $scope.selectIx; i < $('.preColor').length; i++) {
                        if ($('.preColor').eq(i).css('display')=='inline-block') {
                            $('.preColor').eq(i).addClass('addColor');
                            $('.preColor').eq(i).removeClass('preColor2');
                            $scope.selectIx=i+1;//索引页聚焦到下一题
                            break;
                        };
                    };
                    
                };
                if (checkInf()!=false) {
                    $scope.isDisabled=false;
                };
            });
        };

        var init = function(testbank_no,password){
            vanLoading.start('global');
            dataService.getTestbankDetail(
                $routeParams.testbank_no, 
                password, 
                $routeParams.homework_no || 0)
            .then(function(data){
                $scope.testbank = data.testbank;
                $scope.exercises = data.exercises;
                var newArr=[];
                newArr=$scope.exercises.concat(JSON.parse($scope.testbank.degree).tips);
                var html=JSON.parse($scope.testbank.degree).article;
                $scope.html=html;
                html=format(html);
                /*add by 16.4.12*/
                newArr.sort(function(){
                    return 0.5-Math.random();
                });
                // return;
                /*add by 16.4.12*/

                $('.ansCount-ul').html(getAnswer(newArr));
                $('.articleContent').html(html);
                slectIndex();
                slectAnswer();
                $('.js-article').scrollbar();
                _article = JSON.parse($scope.testbank.degree).article;
                _exercises = dataService.cloneExercises($scope.exercises);
                _tips=JSON.parse($scope.testbank.degree).tips;

                $scope.gameinfo.total = $scope.exercises.length;
                $scope.score.testbank_name = $scope.testbank.testbank_name;
                $scope.score.testbank_num = $scope.gameinfo.total;
                // $scope.score.testbank_num =$('.articleContent').find('i').length;


                if($scope.testbank.is_owner){
                    $scope.testbank.is_pass = $scope.testbank.is_owner;
                }
                if(!$scope.gameinfo.isPass){
                    $scope.gameinfo.isPass = $scope.testbank.is_pass;

                    $scope.gameinfo.hasPassword = $scope.testbank.is_pass ? false : $scope.testbank.range == 0 ? false : true;

                    if($scope.gameinfo.hasPassword){
                        $scope.showCheckPasswordDialog();
                    }
                    else{
                        $scope.play();
                    }
                }

                // setTimeout(function(){
                //     $(window).trigger('resize');
                // }, 10);
                vanLoading.finish('global');
            }, function(error){
                vanLoading.finish('global');
            });
        };

        $scope.showCheckPasswordDialog = function(){
            $scope.checkPassword('未输入密码不可进行答题！', function(){
                if(!$scope.checkPassword.password || !/^\d{6}$/.test($scope.checkPassword.password)){
                    $scope.checkPassword.error = '密码必须为6位数字！';
                    return false;
                }

                dataService.checkPassword($scope.testbank.testbank_no, $scope.checkPassword.password).then(function(message){
                    $scope.checkPassword.error = '';

                    init($scope.testbank.testbank_no, $scope.checkPassword.password);

                    $scope.testbank.is_pass = true;
                    $scope.gameinfo.isPass = true;

                    $scope.checkPassword.close();
                }, function(error){
                    $scope.checkPassword.error = error;
                });

                return false;
            }, function(){
                if($window.history.length > 0){
                    $window.history.back();
                }
                else{
                    $location.path('/choice');
                }
            });
        };

        $scope.showReportDetails = showReportDetails;
        $scope.hideReportDetails = hideReportDetails;
        function transform(obj){
            var arr = [];
            for(var item in obj){
                arr.push(obj[item]);
            }
            return arr;
        }
        function showReportDetails(){
            vanDialog.open('primission');
            $('.detail-show').html($scope.html);
            $('.detail-show span').each(function(index, el) {
                $(this).html("<a> </a><strong>"+(parseInt(index)+1)+".</strong>"+'<span style="color:red;text-decoration:line-through;">'+allWrongAnswer[index]+'</span>'+'<span style="color:blue">'+allRightAnswer[index]+'</span><a> </a>');
            });
        }
        function hideReportDetails(){
            $scope.showReport = false;
        }

        if($routeParams.testbank_no){
            init($routeParams.testbank_no);

            $(window).on('resize', function(){
                resize();
            });
        }

        function resize(){
            $('.article').height($('.bodyer').height() - 30);
            $('.sidebox').height($('.bodyer').height() - 30);
        }

    }]);
});
