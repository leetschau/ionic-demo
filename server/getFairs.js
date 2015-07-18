SegDict = new Mongo.Collection('segdict').findOne();

Meteor.methods({
  getFairs : function (userInput, pageNo, type, filterStr) {
    return { fairs: [1,2,3,4] };
  }
});
