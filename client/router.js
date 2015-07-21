Router.configure({
  layoutTemplate: 'Layout'
});

Router.route('/', function() {
  this.render('Home');
}, { name: 'home'} );

Router.route('/results/:inp', function() {
  var that = this;
  Meteor.call('getFairs', this.params.inp,
    function (err, res) {
      if (err) {
        alert(err);
        return;
      } 
      that.render('SearchResults', { data : res });
  });
  this.render( 'WaitingforResult' );
});

Router.route('/details/:_id', function() {
  var that = this;
  Meteor.call('getFairDetails', this.params._id,
    function (err, res) {
      if (err) {
        alert(err);
        return;
      } 
      that.render('FairDetails', { data : res });
  });
  this.render( 'WaitingforResult' );
}, { name: 'fairDetails' });
