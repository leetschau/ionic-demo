SegDict = new Mongo.Collection('segdict').findOne();

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
        id : elem._id._str,
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
  }
});
