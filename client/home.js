Template.Home.events({
  'click .btn-search': function (e, t) {
    var userInput = t.find('.user-input').value;
    Router.go('/results/' + userInput);
  }
});
