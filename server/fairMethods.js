Meteor.methods({
  getFairs : function (userInput) {
    var MAX_RESULTS_NUMBER = 20;

    var constraints = {
      limit : MAX_RESULTS_NUMBER,
      chnName : 1,
      position : 1,
      time : 1,
      sort : { time : -1 }
    };

    var parts = {};

    // url example: /results/abc
    if (SegDict && Seg) {
      var words = Seg.parse(userInput, SegDict);

      // 为了解决’xxxx展‘无法搜出问题，将最后的’展‘字去掉
      // 这是临时解决方法，更好的方法是按照匹配度排序，
      // 对于'德国科隆亚太五金博览会'，’科隆五金展‘的匹配度是67%（科隆和五金匹配，’展‘不匹配）
      // 所以应该出现在搜索列表中
      parts =  _.filter(words, function(elem) {
        return elem !== '展';
      });
    } else {
      parts = userInput.trim().split(" ");
    }

    for (i = 0; i < parts.length; ++i) {
      parts[i] = "(?=.*" + parts[i] + ")";
    }

    var query = {
      "indexStr.simpleSearch" : new RegExp("(" + parts.join("") + ")", "i")
    };
    //console.log(query);

    var rawResults = Fairs.find(query, constraints).fetch();

    var searchRes = [];
    rawResults.forEach(function (elem) {
      var aRes = {
        _id : elem._id._str,
        chnName : elem.chnName,
        position : elem.position,
        logo: elem.logo
      };

      aRes['time'] = _.map(elem.time.split(" "), function (i) {
          var tp = new Date(i);
          if (i.split('-').length === 3) {
            return tp.getFullYear() + '年' + (1 + tp.getMonth()) + '月' + tp.getDate() + '日';
          } else if (i.split('-').length === 2) {
            return tp.getFullYear() + '年' + (1 + tp.getMonth()) + '月';
          }
          return "";
        }).join(' 至 ');
      searchRes.push(aRes);
    });

    return { fairs: searchRes };
  },

  getFairDetails: function(fairId) {

    var fairInfo = Fairs.findOne({ _id : new Meteor.Collection.ObjectID(fairId) });
    if (!fairInfo) {
      return null;
    }

    var abbrCats = [];
    if (fairInfo.category) {
      fairInfo.category.forEach(function (i) {
        var maxLen = 4;
        var dispLen = i.minor.length > maxLen ? maxLen : i.minor.lengt;
        abbrCats.push(i.minor.slice(0, dispLen).join('，') + '等');
      });
      fairInfo['category'] = abbrCats;
    } else {
      fairInfo['category'] = "";
    }

    // 这里的时间字符串转换函数与/results页中的时间字符串转换函数重复，且只能处理中文，需重构
    var chnTime = _.map(fairInfo.time.split(" "), function (i) {
        var tp = new Date(i);
        if (i.split('-').length === 3) {
          return tp.getFullYear() + '年' + (1 + tp.getMonth()) + '月' + tp.getDate() + '日';
        } else if (i.split('-').length === 2) {
          return tp.getFullYear() + '年' + (1 + tp.getMonth()) + '月';
        }
        return "";
      }).join(' 至 ');
    fairInfo['time'] = chnTime;
    var fairContext = {
      fairInfo : fairInfo
    };

    //console.log(fairInfo);
    // ------ 用户评论 ------
    if (Meteor.user()) {
      var curUserID = Meteor.user()._id;
    } else {
      var curUserID = null;
    }
    var curUserID = Meteor.user() ? Meteor.user()._id : null;
    var userEval = {};
    var allEvals = Evaluations.find({
        fairId : fairId
      });
    if (allEvals.count() > 0) {
      userEval['rankNum'] = allEvals.count();
      var total = 0;
      comments = [];
      allEvals.forEach(function (elem) {
        total = total + elem.rank;
        var nickname = Meteor.users.findOne({
            _id : elem.userId
          }).profile.nickname;
        comments.push({
          id : elem._id,
          created : elem.created,
          user : elem.userId,
          nickname : nickname,
          text : elem.comment,
          html : elem.comment.replace(/(?:\r\n|\r|\n)/g, "<br/>"),
          rank : elem.rank,
          isSelf : curUserID ? elem.userId === Meteor.user()._id : false
        });
      });
      var avg = total / userEval['rankNum'];
      userEval['rankAvg'] = Math.round(avg * 10) / 10;
      userEval['comments'] = comments;
    } else {
      userEval['rankNum'] = 0;
    }
    if (curUserID) {
      var myEval = Evaluations.findOne({
          userId : Meteor.user()._id,
          fairId : fairId
        });
      if (myEval) {
        userEval['myEval'] = {
          created : myEval.created,
          rank : myEval.rank,
          comment : myEval.comment,
          commentHtml : myEval.comment.replace(/(?:\r\n|\r|\n)/g, "<br/>"),
        };
      } else {
        userEval['addNew'] = true;
      }
    } else {
      userEval['needLogin'] = true;
    }
    fairContext['evaluations'] = userEval;
    return fairContext;
  }
});
