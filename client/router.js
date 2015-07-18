Router.configure({
  layoutTemplate: 'Layout'
});

Router.route('/', function() {
  this.render('Home');
}, { name: 'home'} );

Router.route('/results/:inp/page/:pageNo', function() {
  var that = this;
  Meteor.call('getFairs', this.params.inp, this.params.pageNo,
    this.params.query.type, this.params.query.filter,
    function (err, res) {
      if (err) {
        alert(err);
        return;
      } 
      that.render('SearchResults', { data : res });
  });
  this.render( 'WaitingforResult' );
});

Router.route('/details/:_id', function () {
  var that = this;
  Meteor.call('getFairContext', this.params._id, function (err, result) {
    if (err) {
      alert(err);
    } else {
      that.render('FairDetails', { data : result });
    }
  });
  this.render('WaitingforResult');
}, { name: 'fairDetails' });
