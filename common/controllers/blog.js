BlogController = new Stellar.Controller('blog');

BlogController.index = function() {
  Stellar.render('listView');
};

BlogController.show = function() {
  Stellar.log('Show post:');
  Stellar.log('------------');
  Stellar.log(Stellar.page.params);
  Stellar.log('------------');
  post = Posts.findOne({slug: Stellar.page.params['show']});
  if(post) {
    //TODO  Meteor.subscribe("postcomments", post._id, init);
    Stellar.render('postView', {post: post});
  }
};

