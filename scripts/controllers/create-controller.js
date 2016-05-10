define(['app','squire','libs/squire.ui','juicer','hmpopbox','libs/core.upload', 'bootstrap', 'scripts/services/data-service', 'scripts/filters/van-html-filter'], function(app){
    app.controller('createController', ['$scope', '$routeParams', '$location', 'dataService', 'vanState', 'vanLoading', 'vanDialog','$sce', function($scope, $routeParams, $location, dataService, vanState, vanLoading, vanDialog,$sce){
        var stateMachine = vanState.createStateMachine('ss', $scope, ['shortcut', 'primission','recode']);
        
        $scope.isModify = false;

        $scope.step=1;
        $scope.tips=0;
        $scope.backShow=1;

        $scope.config = {
            min_exercise: 3,
            max_exercise: 25
        };

        $scope.testbank = {
            testbank_no:'',
            testbank_name: '',
            introduce: '',
            cost: 0,
            range: 0,
            password: '',
            article: '',
            option_num: 4
        };
        $scope.exercises = [];

        (function(isHide){
            if(isHide){
                $('.sidebar').addClass('hide');
            }
        }(!!$routeParams.is_hide));
        $scope.choiceHomework = function(homework){
            if(homework){
                window.parent.postMessage([{tbno: homework.testbank_no, tbname: homework.testbank_name}], '*');
            }
        };

        $scope.$watch($scope.testbank.cost, function(newValue, oldValue){
            if(/^((([1-9]\d{0,9})|0)(\.\d{0,2})?)?$/.test(newValue)){
                $scope.testbank.cost = newValue || 0;
            }
            else{
                $scope.testbank.cost = oldValue;
            }
        });
        (function(){
            $('.exp1').hover(function() {
                $(this).find('.exp1-inner').show();
            }, function() {
                $(this).find('.exp1-inner').hide();
            });
            $('.exp2').hover(function() {
                $(this).find('.exp2-inner').show();
            }, function() {
                $(this).find('.exp2-inner').hide();
            });
        })();
        $scope.blurCheck=function(){
            if ($scope.testbank.testbank_name=='') {
                $('.repeat-name').html('题目名称不能为空').css('color','red');;
                return;
            };
            $.ajax({
                url: 'Api/existTestbank',
                type: 'GET',
                dataType:'JSON',
                data: {
                    token:'token',
                    testbank_name:$scope.testbank.testbank_name,
                    testbank_no:$routeParams.testbank_no
                }
            })
            .done(function(data) {
                if (data.errcode==0) {
                    $('.right-ico').show();
                }else if(data.errcode==1){
                    $('.right-ico').hide();
                    $('.repeat-name').html(data.errstr).css('color','red');
                }
                else{
                    $('.right-ico').hide();
                   $('.repeat-name').html(data.errmsg).css('color','red');
                }
            });
        };
        $scope.change=function(){
            $('.repeat-name').html('');
        }
        $scope.createA=function(){
            $('.pop-a').show();
            if($routeParams.testbank_no){
                // SQUI.setHTML(testbank.oldHtml); 
            };
        }
        var SQUI;
        var selection;
        var bind=function(){
            SQUI= new SquireUI({replace: 'textarea#js-rich-text', height: 360});
            $('body').delegate('.result-article','mouseup',function(e){
                selection = window.getSelection();
                var range;
                if(selection.rangeCount > 0){
                    range = selection.getRangeAt(0);
                    selectText = range.toString();
                }
                if (selectText=='') {
                    $('.option-confirm').remove();
                    return;
                };
                if(selectText && !/^_+$/.test(selectText)){
                    // var text1 = $('.step-2 .text1');
                    if(range.startContainer != range.endContainer || range.startContainer.nodeType != 3){
                        return;
                    }
                    // if($scope.isModify){
                    //     $scope.notify.error('编辑模式下不允许添加新题！');
                    //     return;
                    // }
                    $('.result-article').unbind('click');
                    $('.option-confirm').remove();
                    var confirm = $('<button class="option-confirm btn btn-warning btn-sm">设为题目</button>');
                    confirm
                    .css({
                        position: 'absolute',
                        zIndex: 1,
                        left: e.clientX + 5,
                        top: e.clientY
                    })
                    .on('click', function(e){
                        $('.option-confirm').remove();
                        range.startContainer.textContent = range.startContainer.textContent.substr(0, range.startOffset) + '_____' + range.startContainer.textContent.substr(range.endOffset);
                        var htmlstr = $('.result-article').html();
                        var Rh = /_[_0-9]+/g;
                        htmlstr = htmlstr.replace(/_____/,'<a> <\/a><span><strong><\/strong>____<\/span>');
                        $('.result-article').html(htmlstr);
                        var kl = $('strong').length;
                        for(var i = 0; i < kl; i++){
                            $('.result-article strong').eq(i).text(i+1);
                        }                    
                    })
                    .appendTo('body');
                }
            });
        }
        bind();
        var init = function(testbank_no, password){
            vanLoading.start('global');

            dataService.getTestbankDetail(testbank_no, password).then(function(data){
                $scope.testbank = data.testbank;

                $scope.exercises = data.exercises;

                $scope.antherPwd=data.testbank.password;

                $scope.preRange=data.testbank.range;

                if($scope.testbank.range == 1 && !$scope.testbank.is_pass && !$scope.testbank.is_owner){
                    $scope.showCheckPasswordDialog();
                }

                $scope.isModify = true;
                if ($scope.testbank.password.length) {
                    $scope.showQun='密码可见';
                    $scope.testbank.password=$scope.testbank.password;
                };
                if($routeParams.testbank_no){
                    var str=JSON.parse($scope.testbank.degree);    
                    SQUI.setHTML(str.oldHtml);
                    $scope.testbank.setAnswer=str.oldAns;
                }

                setTimeout(function(){
                    $(window).trigger('resize');
                }, 10);

                vanLoading.finish('global');

            }, function(error){
                vanLoading.finish('global');
                window.history.back();
            });
        };
        $scope.saveContent=function(){
            var tostring = SQUI.getHTML(),str1,str2,str3;
            $scope.savePreContent=tostring;
            if (tostring.length<15) {
                $scope.notify.error('内容不能为空');
                return;
            };
            tostring = tostring.replace(/style="[^"]*"/g,'');
            tostring = tostring.replace(/&nbsp;/g,' ');
            tostring = tostring.replace(/class="[^"]*"/g,'');
            tostring = tostring.replace(/lang="[^"]*"/g,'');
            tostring = tostring.replace(/_hover\-ignore="[^"]*"/g,'');
            //去除span标签，便于进行分组;
            tostring = tostring.replace(/<span\s*>/g,'');
            tostring = tostring.replace(/<\/span>/g,'');
            tostring = tostring.replace(/<u\s*>[\s\w\.]*<\/u>/g,"____");
            tostring = tostring.replace(/<strong\s*>[\s\w\.]*<\/strong>/g,"____");
            tostring = tostring.replace(/<b>[0-9]+<\/b>/g,"");
            var re=/<br\s*>[<>\w\s=\"\/\-]*>[A-Za-z]\.|<br\s*>[<>\w\s=\"\/\-]*>[A-Za-z]\s+|<br\s*>[<>\w\s=\"\/\-]*>[A-Za-z]、/g;
            var Rh = /\s[\s\(_（]+\d+[\s\)_）]*|_[_0-9\(\)]+|\d+[\.\s]*_+/g;
            var aaa=Rh.exec(tostring);
            if (!aaa) {
                $scope.notify.error('无法识别文章');
                return;
            };
            str1=re.exec(tostring);
            if (!str1) {
                $scope.notify.error('无法识别选项');
                return;
            };
            str2=tostring.substring(0,str1.index);
            str3=tostring.substring(str1.index);

            // str3=str3.replace(re,'<br><mark><\/mark>');
            str3=str3.replace(re,'<mark><\/mark>');
            str3=str3.replace(/<br>/g,'');
            str3 = str3.replace(/<div\s*>/g,'');
            str3 = str3.replace(/<\/div>/g,'');
            str3=str3.replace(/<mark><\/mark>/g,'<br><mark><\/mark>');

            str2 = str2.replace(Rh,"<a>  <\/a><span ><strong><\/strong>____<\/span>");
            $scope.step=3;
            // $scope.testbank.article=str2;
            $('.result-article').html(str2);
            // $scope.testbank.question=str3;
            $('.result-answer').html(str3);
            //去掉广告标签
            $('.result-article img').remove();

            if($routeParams.testbank_no){
               var kl =$scope.exercises.length; 
            }else{
                var kl =$('.result-article strong').length;
                if (kl==0||!kl) {
                    $scope.notify.error('无法识别文章');
                    return;
                };
            }
            for(var i = 0; i < kl; i++){
                $('.result-article strong').eq(i).text(i+1);
            }
            for (var i = 0; i < $('.result-answer mark').length; i++) {
                 $('.result-answer mark').eq(i).html(String.fromCharCode(65+i).toUpperCase()+'.');
            }; 
            if ($('.result-answer mark').length==0) {
                $scope.notify.error('无法识别选项');
                return;
            };
            $('.setAnswer').show();
            // $scope.testbank.article=$('.result-article').html();
            // $scope.tips=1;     
        };
        $scope.preStep=function(){
            $scope.step=0;
        };
        Array.prototype.unqieArr=function(){
            var res=[],json={};
            for (var i = 0; i < this.length; i++) {
                if (!json[this[i]]) {
                    res.push(this[i]);
                    json[this[i]]=1;
                }else{
                    return false;
                }
            };
            return true;
        };
        $scope.passAns=true;    
        $scope.showAnswer=function(){
            if (!$scope.testbank.setAnswer) {
                var str='';
            }else
            var str=$scope.testbank.setAnswer.replace(/^\s+/,'').replace(/\s+$/,'').replace(/,/g,'').replace(/\s+/g,'').replace(/\./g,'');
            var str2=str.split(''),str3='';
            var articleNum=$('.result-article').find('strong').length;
            var mkl=$('mark').length;
            for (var i = 0; i < str2.length; i++) {
                str3+=(i+1)+'.'+str2[i].toUpperCase()+' ';
            };
            $('.show-answer').html('答案：'+str3);
            $scope.rightA=str2;
            var upperArr=[];
            for (var i = 0; i < str2.length; i++) {
                upperArr.push(str2[i].toUpperCase());
            };
            for (var i = 0; i <upperArr.length; i++) {
                for (var j = 0; j < mkl ; j++) {
                    if (upperArr[i]==String.fromCharCode(j+65)) {
                        break;
                    }else if(j==mkl-1){
                        $scope.notify.error('没有'+upperArr[i]+'选项');
                        return;
                    }
                };
            };
            if (!$scope.rightA) {
                $scope.rightA=[];
            }else
            var answerNum=$scope.rightA.length;
            if (str.length==0) {
                $scope.notify.error('答案不能为空');
                return false;
            };
            if (answerNum<articleNum) {
                $scope.notify.error('答案选项数量不能小于题目数量');
                return false;
            };
            if (answerNum>articleNum) {
                $scope.notify.error('答案选项数量不能大于题目数量');
                return false;
            };
            if (!str2.unqieArr()) {
                $scope.notify.error('答案不能重复');
                return false;
            };
            $scope.passAns=false;
            return true;
        };
        $scope.confirmInput=function(){
            $('.pop-a').hide();
            var tostring = SQUI.getHTML();
            // return;
            tostring = tostring.replace(/style="[^"]*"/g,'');
            tostring = tostring.replace(/class="[^"]*"/g,'');
            tostring = tostring.replace(/_hover\-ignore="[^"]*"/g,'');
            //去除span标签，便于进行分组;
            tostring = tostring.replace(/<span\s*>/g,'');
            tostring = tostring.replace(/<\/span>/g,'');
            var Rh = /\s[\s\(_]+\d+[\s\)_]*|_[0-9_\(\)]+/g;
            tostring = tostring.replace(Rh,"<a>  <\/a><span ><i><\/i>____<\/span>");
            $('.text1').html(tostring);
            $scope.testbank.article=tostring;
            if($routeParams.testbank_no){
               var kl =$scope.exercises.length; 
            }else{
                var kl =$('.text1 i').length; 
            }
            for(var i = 0; i < kl; i++){
                $('.text1 i').eq(i).text(i+1);
            } 
            $scope.testbank.article=$('.text1').html();
            $scope.tips=1; 
        };
        $scope.createB=function(){
            $('.pop-b').show();
            if($routeParams.testbank_no){
                var arr=[];
                for (var i = 0; i < $scope.exercises.length; i++) {
                    arr.push($scope.exercises[i].answer);
                };
                var arr2=[];
                for (var i = 0; i < JSON.parse($scope.testbank.degree).tips.length; i++) {
                    arr2.push(JSON.parse($scope.testbank.degree).tips[i].answer);
                };
                var arr3=arr.concat(arr2);
                var str=arr3.join('\n');
                $scope.optionsInput.text=str;
            };   
        }
        $scope.optionsInput={};
        $scope.confirmAnswer=function(){
            $('.follow').html();
            var string=$scope.optionsInput.text;
            if (!string) {
                $('.pop-b').hide();
                return;
            };
            var result=string.replace(/\n/g,'^,,');
            var arr=result.split('^,,');
            $scope.optionAnswer=[];
            for (var i=0;i<arr.length;i++) {
                if(arr[i].length){
                    $scope.optionAnswer.push(arr[i]);
                }
            };


            Array.prototype.unqieArr=function(){
                var res=[],json={};
                for (var i = 0; i < this.length; i++) {
                    if (!json[this[i]]) {
                        res.push(this[i]);
                        json[this[i]]=1;
                    }else{
                        return false;
                    }
                };
                return true;
            }
            if (!checkArr.unqieArr()) {
                hm.confirm({
                    title:'提示',
                    text:'选项不能重复',
                    width:200,
                    confirm:'确定',
                    cancel:'取消',
                    callBack:function(){
                        return;
                    }
                });
                return;
            };
            $('.pop-b').hide();
            var kl =$('.text1 i').length;
            $scope.answerObj=[];
            for (var i = 0; i < kl; i++) {
                $scope.answerObj.push({answer:i+1});
            };
            $scope.answerObj.push({answer:'干扰项'});
           
        };

        // auto running
        if($routeParams.testbank_no){
            init($routeParams.testbank_no);
        }
        else{
            if(stateMachine.existState()){
                // $scope.confirm('发现未完成的创建记录，是否继续？', function(){
                //     stateMachine.restore();
                // }, function(){
                //     stateMachine.reset();
                //     for (var i = 0; i < 5; i++) {
                //         // $scope.addOne();
                //     }
                // });
                vanDialog.open('recode');
            }
            else{
                stateMachine.reset();

                for (var i = 0; i < 5; i++) {
                    // $scope.addOne();
                }
            }
            stateMachine.start(60);

            setTimeout(function(){
                $(window).trigger('resize');
            }, 10);
        }
        var isPass=false;
        var password='';
        //创建权限
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
        $scope.setQun=function(){
            vanDialog.open('primission');
            if($routeParams.testbank_no){    
                if (parseInt($scope.testbank.range)) {
                    $scope.$watch(function(){
                        $scope.isChecked=true;
                    });
                    $scope.showPwd=$scope.testbank.password;
                }else{
                    $scope.isChecked=true;
                }     
            };
            $scope.preRange=$scope.testbank.range;

            $('.passNum').on('keyup',function(){
                var tmptxt=$(this).val();     
                $(this).val(tmptxt.replace(/\D|^0/g,''));
            });
            
        }
        $scope.nextP=function(){
            $scope.step=1;           
        };

        //创建下一步
        $scope.nextS=function(){
            if(!$scope.testbank.testbank_name || $scope.testbank.testbank_name.length <= 0 || $scope.testbank.testbank_name.length > 50){
                $scope.notify.error('题目名称不可为空，并最多五十个字符！');
                return false;
            }
            if($routeParams.testbank_no){              
                $scope.step=0;
                //SQUI= new SquireUI({replace: 'textarea#js-rich-text', height: 360});
                $scope.testbank.article=JSON.parse($scope.testbank.degree).article;
                $scope.testbank.question=JSON.parse($scope.testbank.degree).article;


                var arr=[];
                for (var i = 0; i < $scope.exercises.length; i++) {
                    arr.push($scope.exercises[i].answer);
                };
                var arr2=[];
                for (var i = 0; i < JSON.parse($scope.testbank.degree).tips.length; i++) {
                    arr2.push(JSON.parse($scope.testbank.degree).tips[i].answer);
                };
                $scope.optionAnswer=arr.concat(arr2);
                $scope.answerObj=[];
                $scope.answerCheck=[];
                var kl =$scope.exercises.length;
                for (var i = 0; i < kl; i++) {
                    $scope.answerObj.push({answer:i+1});
                    $scope.answerCheck.push(parseInt($scope.exercises[i].check));
                };
                $scope.answerObj.push({answer:'干扰项'});
                setTimeout(function(){
                    for (var i = 0; i <= $scope.answerObj.length; i++) {
                        if ($scope.answerCheck[i]) {
                           //$('select').eq(i).val(2);
                             $('select').eq(i).find('option').eq($scope.answerCheck[i]).attr('selected',true);   
                            //$('select').eq(i).val($scope.answerCheck[i]-1);
                        }else{
                            $('select').eq(i).find('option').eq(i).attr('selected',true);
                            //$('select').eq(i).val(i);
                        }
                    };
                },30);  
            }
            $.ajax({
                url: 'Api/existTestbank',
                type: 'GET',
                dataType:'JSON',
                data: {
                    token:'token',
                    testbank_name:$scope.testbank.testbank_name,
                    testbank_no:$routeParams.testbank_no
                }
            })
            .done(function(data) {
                if (data.errcode==0) {
                    $scope.$apply(function(){
                        $scope.step=0;
                    });
                    //SQUI= new SquireUI({replace: 'textarea#js-rich-text', height: 360});
                }else if(data.errcode==1){
                    $('.repeat-name').html(data.errstr).css('color','red');
                }
                else{
                   $('.repeat-name').html(data.errmsg).css('color','red');
                }
            }); 
        }
        function getHost(){
            var host=window.location.hash.substring(2,10);
            return host;
        }
        $scope.changeWatch=function(){
            $scope.$watch('testbank.setAnswer', function(newValue, oldValue){
                if (newValue!=oldValue) {
                    $scope.passAns=true;
                };
            });
        }
        //保存文章和选项
        $scope.saveCreate=function(){
            Array.prototype.unqieArr=function(){
                var res=[],json={};
                for (var i = 0; i < this.length; i++) {
                    if (!json[this[i]]) {
                        res.push(this[i]);
                        json[this[i]]=1;
                    }else{
                        return false;
                    }
                };
                return true;
            };
            var articleNum=$('.result-article').find('strong').length;
            var options=$('mark').length;
            if (articleNum<1) {
                $scope.notify.error('还没有题目呢，请设置小题');
                return false;
            };
            if(articleNum>100){
                $scope.notify.error('题目太多了，不能设置了！');
                return false;
            };
            if (parseInt(articleNum)>parseInt(options)) {
                $scope.notify.error('选项数量不能小于题目数量！');
                return false;
            };
            var resultA=[],resultB=[];
            var str=$('.result-answer').html();
            var arr=str.split('<br>');
            var newArr=[];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i]==''||typeof(arr[i]) == "undefined") {
                    arr.splice(i,1);
                    i-=1;
                };
            };
            /*add by 4.15*/
            var checkArr=[],reExp=/<mark\s*>[\s\w\.]*<\/mark>/g;
            for (var i = 0; i < arr.length; i++) {
                checkArr.push(arr[i].replace(reExp,'').replace(/^\s+|\s+$/g,''));
            };
            if (!checkArr.unqieArr()) {
                $scope.notify.error('小题不能重复');
                return false;
            };
            /*add by 4.15*/
            
            var reg=/<mark>[A-Z]\.<\/mark>/g;   
            for (var i = 0; i < $('.result-answer mark').length; i++) {
                newArr.push(arr[i].replace(reg,'').replace(/^\s+|\s+$/g,''));
            };
            if (!$scope.rightA) {
                $scope.rightA=[];
            }
            for (var i = 0; i < $scope.rightA.length; i++) {
                $scope.rightA[i]= $scope.rightA[i].toUpperCase();
            };
            for (var i = 0; i < newArr.length; i++) {
                for (var j = 0; j < $scope.rightA.length; j++) {
                    if(String.fromCharCode(65+i)==$scope.rightA[j]){
                        resultA.push({
                            answer:newArr[i],
                            check:j+1
                        });
                        break;
                    }else if(j==$scope.rightA.length-1){
                        resultB.push({
                            answer:newArr[i],
                            check:'干扰项'
                        });
                    }else if(j==$scope.rightA.length-1){
                        $scope.notify.error('第'+(j+1)+'题还没有答案，请设置答案');
                        return;
                    }        
                };
            };

            /*2016.4.11*/
            function cloneArr(obj){
                var obj2={};
                if (typeof obj !== 'object'||obj=='') {
                    return obj;
                }else if (Object.prototype.toString.call(obj)=='[object Array]') {
                    obj2=[];
                    for(var i in obj){
                        obj2[i]=arguments.callee(obj[i]);
                    }
                }else{
                    for(var i in obj){
                        obj2[i]=arguments.callee(obj[i]);
                    }
                }
                return obj2;
            }
            var temArr=[];
            temArr=cloneArr(resultA);
            function sortJson(json,key){
                return json.sort(function(a,b){
                    var x=a[key],y=b[key];
                    return x-y;
                });
            }
            sortJson(temArr,'check');
            // console.log(temArr);
            for (var i = 0; i < resultA.length; i++) {
                resultA[i].exercise_order=i+1;
                resultA[i].originWords=temArr[i].answer;
                if($routeParams.testbank_no){
                    resultA[i].exercise_no=$scope.exercises[i].exercise_no;
                }
            };
            // console.log(resultA);
            /*2016.4.11*/

            $scope.savePreAns=$scope.testbank.setAnswer;
            var testbank={
                testbank_name:$scope.testbank.testbank_name,
                range:$scope.testbank.range,
                password:$scope.testbank.password,
                degree:{
                    tips:resultB,
                    article:$('.result-article').html(),
                    oldHtml:$scope.savePreContent,
                    oldAns:$('input[nt="inputAns"]').val()
                },
                testbank_no:$routeParams.testbank_no

            } 
            if (!$scope.showAnswer()) {
                console.log('no');
            }else{
                var url='';
                if($routeParams.testbank_no){
                    url='Api/modifyTestBank';
                }else{
                    url='Api/addTestbank';
                }
                $.ajax({
                url: url,
                type: 'POST',
                data:{testbank:JSON.stringify(testbank),exercises:JSON.stringify(resultA)}
                })
                .done(function(data) {
                    if (data.errcode==0) {
                        stateMachine.reset();
                        if($routeParams.testbank_no){
                            $scope.textNum=$routeParams.testbank_no;
                            $scope.testbank.testbank_no=$routeParams.testbank_no;
                        }else{
                            $scope.textNum=data.data.testbank_no; 
                            $scope.testbank.testbank_no=data.data.testbank_no;
                        }

                        $scope.$apply(function(){
                            $scope.step=2;
                        });

                        var h=getHost();
                        if (h=='homework') {
                            $scope.backShow=2;
                        };
                        
                    }else{
                        hm.alert({text:data.errstr});
                    }
                });
            };   
        }

        $scope.recode = {
            open: function(){
                vanDialog.open('recode');
            },
            checkPrimission: function(){
                stateMachine.restore();      
            },
            cancer:function(){
                stateMachine.reset();
            }
        };
    }]);
});
