Template.Home.helpers({
  times: function () {
    return [1,2,3];
  }
});

Template.Home.events({
  'click button': function () {
    // increment the counter when button is clicked
    Session.set('counter', Session.get('counter') + 1);
  }
});
