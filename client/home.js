Template.Home.helpers({
  times: function () {
    return [1,2,3];
  }
});

Template.Home.events({
  'click .btn-search': function (e, t) {
    var userInput = t.find('.user-input').value;
    Router.go('/results/' + userInput + '/page/1?type=basic');
  }
});
