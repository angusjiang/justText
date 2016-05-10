define(['app', 'scripts/services/van-token-service'], function(app){
    app.factory('dataService', ['$q', 'tokenService', function($q, tokenService){
        var searchParams = {
            type: 1,
            keywords: '',
            no_password: 0,
            page: 1,
            size: 10,
            total: 0
        };

        var getNewOptionIndexOfArticle = function(testbank){
            var rOption = /(_{5}|<span[\S\s]*?><button[\S\s]*?>\d+<\/button>____<\/span>)/igm;
            var hits;
            var newOptions = [];
            var index = 0;
            while (hits = rOption.exec(testbank.article)){
                if(hits[0].length == 5){
                    newOptions.push(index);
                }
                index++;
            }
            return newOptions;
        };

        return {
            // cleanWithout:function(testbank,exercises,without){
            //     var self=this;
            //     var newArr=[];
            //     for (var i = 0; i < exercises.length; i++) {
            //         if (without.indexOf(exercises[i].exercise_no)>=0) {

            //         }else{
            //             newArr.push(exercises[i]);
            //         }
            //     } ;
            //     return newArr;
            // },
            cleanWithout: function(testbank,exercises,without){
                var self = this;
                var degree = JSON.parse(testbank.degree);
                var article = degree.article;
                // <a href="javascript:;" class="preColor preColor2"></a>
                //article=article.replace(/<strong>\d+<\/strong>____/g,'<a href="javascript:;" class="preColor preColor2"></a>');
                console.log(article);
                for(var i = exercises.length - 1; i >= 0; i--){
                    if(without.indexOf(exercises[i].exercise_no) >= 0){
                        article = article.replace(new RegExp('<span><strong>' + (exercises[i].check) + '<\/strong>____<\/span>','im'),'<strong>'+exercises[i].check+'</strong><a> </a>'+exercises[i].answer+'<a> </a>');
                        exercises.splice(i,1);
                    }
                }

                degree.article = article;
                testbank.degree = JSON.stringify(degree);

                for(var i = 0; i < exercises.length; i++){
                    exercises[i].exercise_order = i + 1;
                }
            },

            cleanHtml: function(html){
                var rBlockBeginElement =  /<(div|p|h\d)[^>]*?>/img;
                var rBlockEndElement =  /<\/(div|p|h\d)[^>]*?>/img;

                var rInlineElement = /<\/?(font|strong|em|i|img|a|b|input|label|select|button|small|sub|textarea|u|sup|strike|s|q|kbd|dfn|code|cite|bdo|acronym|abbr|big|wbr|u)[^>]*?>/img

                html = html.replace(rBlockBeginElement, '<div>');
                html = html.replace(rBlockEndElement, '</div>');
                html = html.replace(rInlineElement, '');

                return html;
            },
            addArticleAnswer: function(testbank, exercise){
                var rOption = new RegExp('<span data-index="' + (exercise.exercise_order - 1) + '"[\\S\\s]*?><button[\\S\\s]*?>' + (exercise.exercise_order) + '<\/button>[_]+<\/span>', 'im');
                testbank.article = testbank.article.replace(rOption, '<span data-index="' + (exercise.exercise_order - 1) + '" contenteditable="false"><button class="btn btn-default btn-xs">' + (exercise.exercise_order) + '<\/button><u>&nbsp;&nbsp;' + exercise['exerciseAnswer_' + exercise.answer] + '&nbsp;&nbsp;<\/u><\/span>');
            },
            removeArticleAnswer: function(testbank, exercise){
                if(!exercise.answer){
                    return;
                }
                var rOption = new RegExp('<span data-index="' + (exercise.exercise_order - 1) + '"[\\S\\s]*?><button[\\S\\s]*?>' + (exercise.exercise_order) + '<\/button><u>[\\S\\s]*?<\/u><\/span>', 'im');
                testbank.article = testbank.article.replace(rOption, '<span data-index="' + (exercise.exercise_order - 1) + '" contenteditable="false"><button class="btn btn-default btn-xs">' + (exercise.exercise_order) + '<\/button>____<\/span>');
            },
            standardizingOptionOfArticle: function(testbank){
                var rSuffixOption = /____<\/span>/igm;
                testbank.article = testbank.article.replace(rSuffixOption, '<\/span>');

                var rStandardizing = /(_+|(\s|&nbsp;){2,})\(?\[?\d+\]?\)?(_+|(\s|&nbsp;){2,})/igm;
                // 将识别数字两边空格改为至少一个，识别度更高，同时增加错误匹配文章中数字的几率
                // 实验可知：对格式标准的文章出现匹配错误的情况，对格式不标准的文章匹配度好
                // var rStandardizing = /(_+|(\s|&nbsp;){1,})\(?\[?\d+\]?\)?(_+|(\s|&nbsp;){1,})/igm;
                testbank.article = testbank.article.replace(rStandardizing, '_____');

                var rSuffixOption2 = /<\/span>/igm;
                testbank.article = testbank.article.replace(rSuffixOption2, '____<\/span>');
                var num = getNewOptionIndexOfArticle(testbank);

                return num;
            },
            correctOptionOfArticle: function(testbank, exercises){
                for (var i = exercises.length - 1; i >= 0; i--) {
                    if(!new RegExp('<span data-index="' + i + '"[\\S\\s]*?><button[\\S\\s]*?>' + (i + 1) + '<\/button>____<\/span>', 'im').test(testbank.article)){
                        this.removeOptionOfArticle(testbank, exercises, i);
                    }
                }
            },
            refreshOptionOfArticle: function(testbank){
                var rOption = /(_{5}|<span[\S\s]*?><button[\S\s]*?>\d+<\/button>____<\/span>)/igm;
                var optionLength;
                var hits;
                var num = 0;
                var index;
                while (hits = rOption.exec(testbank.article)){

                    if(hits[0].length == 5){
                        index = num;
                    }

                    optionLength = hits[0].length;

                    testbank.article = testbank.article.substr(0, rOption.lastIndex - optionLength) + '<span data-index="' + num + '" contenteditable="false"><button class="btn btn-default btn-xs">' + (++num) + '</button>____</span>' + testbank.article.substr(rOption.lastIndex);
                }
                return index;
            },
            removeOptionOfArticle: function(testbank, exercises, index){

                testbank.article = testbank.article.replace(new RegExp('<span data-index="' + (index) + '"[\\S\\s]*?><button[\\S\\s]*?>' + (index + 1) + '<\/button>____<\/span>', 'im'), exercises[index].char64_exercise_rightAnswer ? exercises[index]['vchar512_exerciseAnswer_' + exercises[index].char64_exercise_rightAnswer] : exercises[index].originWords || '');

                exercises.splice(index, 1);
            },
            cloneExercises: function(exercises){
                var _exercises = [];

                for (var i = 0; i < exercises.length; i++) {
                    _exercises.push($.extend({}, exercises[i]));
                }

                return _exercises;
            },
            existTestbank: function(testbank_name, testbank_no){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/existTestbank',
                        type: 'GET',
                        data: {token: token, testbank_name: testbank_name, testbank_no: testbank_no},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve(false);
                            }
                            else{
                                deferred.reject('该题目已存在！');
                            }
                        },
                        error: function(error){
                            deferred.reject('检测题目唯一性失败！');
                        }
                    });
                });

                return deferred.promise;
            },
            addTestbank: function(testbank, exercises){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/addTestbank',
                        type: 'POST',
                        data: {token: token, testbank: JSON.stringify(testbank), exercises: JSON.stringify(exercises)},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve(result.data.testbank_no);
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('创建失败！');
                        }
                    });
                });

                return deferred.promise;
            },
            modifyTestbank: function(testbank, exercises){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/modifyTestbank',
                        type: 'POST',
                        data: {token: token, testbank: JSON.stringify(testbank), exercises: JSON.stringify(exercises)},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve('修改成功！');
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('修改失败！');
                        }
                    });
                });

                return deferred.promise;
            },
            getTestbankDetail: function(testbank_no, password, homework_no){
                var deferred = $q.defer();
                var self=this;
                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/getTestbankDetail',
                        type: 'POST',
                        data: {token: token, testbank_no: testbank_no, password: password, homework_no: homework_no},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                if (result.data.without && result.data.without.length>0) {
                                    self.cleanWithout(result.data.testbank,result.data.exercises,result.data.without);
                                    //result.data.testbank.degree=result.data.testbank.degree.replace(/____/g,"<a href='javascript:;' class='preColor preColor2'></a>");
                                };
                                deferred.resolve({
                                    testbank: result.data.testbank,
                                    exercises: result.data.exercises,
                                    without: result.data.without
                                });
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('查询出错！');
                        }
                    });
                });

                return deferred.promise;
            },
            removeTestbank: function(testbank_no){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/removeTestbank',
                        type: 'GET',
                        data: {token: token, testbank_no: testbank_no},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve('删除成功！');
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('删除失败！');
                        }
                    });
                });

                return deferred.promise;
            },
            getSearchParams: function(){
                return searchParams;
            },
            searchTestbankList: function(params){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    params.token = token;

                    // cache the params
                    searchParams = params;
                    var data = {};
                    data.pageno = params.page;
                    data.pagesize = params.size;
                    data.type = params.type;
                    data.keyword = params.keywords;
                    data.no_password = params.no_password;

                    $.ajax({
                        url: 'api/searchTestbankList',
                        type: 'GET',
                        data: data,
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve({
                                    testbanks: result.data.list,
                                    total: Math.ceil(result.data.count / params.size)
                                });
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
            },
            checkPassword: function(testbank_no, password){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/checkPassword',
                        type: 'POST',
                        data: {token: token, testbank_no: testbank_no, password: password},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve('验证成功！');
                            }
                            else{
                                deferred.reject('密码错误！');
                            }
                        },
                        error: function(error){
                            deferred.reject('验证失败，请重试！');
                        }
                    });
                });

                return deferred.promise;
            },
            searchFavoriteList: function(params){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){

                    var data = {};
                    data.token = token;
                    data.keyword = params.keywords;
                    data.pageno = params.page;
                    data.pagesize = params.size;

                    $.ajax({
                        url: 'api/searchFavoriteList',
                        type: 'GET',
                        data: data,
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve({
                                    testbanks: result.data.list,
                                    total: Math.ceil(result.data.count / params.size)
                                });
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('查询出错！');
                        }
                    });
                });

                return deferred.promise;
            },
            addFavorite: function(testbank_no, testbank_name){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/addFavorite',
                        type: 'GET',
                        data: {token: token, testbank_no: testbank_no, testbank_name: testbank_name},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve('收藏成功！');
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('收藏失败！');
                        }
                    });
                });

                return deferred.promise;
            },
            removeFavorite: function(testbank_no){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){
                    $.ajax({
                        url: 'api/removeFavorite',
                        type: 'GET',
                        data: {token: token, testbank_no: testbank_no},
                        dataType: 'JSON',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve('取消收藏成功！');
                            }
                            else{
                                deferred.reject('取消收藏失败！');
                            }
                        },
                        error: function(error){
                            deferred.reject('取消收藏失败！');
                        }
                    });
                });

                return deferred.promise;
            },
            searchVocabularyBook: function(params){
                var deferred = $q.defer();

                tokenService.getToken().then(function(token){

                    var data = {};
                    data.token = token;
                    data.keyword = params.keywords;
                    data.pageno = params.page;
                    data.pagesize = params.size;

                    $.ajax({
                        url: 'index/searchVocabularyBookProxy',
                        type: 'GET',
                        data: data,
                        dataType: 'JSONP',
                        success: function(result){
                            if(result.errcode == 0){
                                deferred.resolve({
                                    vocabularies: result.data.list,
                                    total: Math.ceil(result.data.count / params.size)
                                });
                            }
                            else{
                                deferred.reject(result.errstr);
                            }
                        },
                        error: function(error){
                            deferred.reject('查询出错！');
                        }
                    });
                });

                return deferred.promise;
            }
        };
    }]);
});
