BlogController = new Stellar.Controller('blog');

BlogController.index = function() {
  Stellar.render('listView');
};

BlogController.show = function() {
  //TODO  Meteor.subscribe("postcomments", post._id, init);
  Meteor.subscribe("allposts", function() {
    post = Posts.findOne({slug: Stellar.page.params['show']});
    if(post) {
      Stellar.render('postView', {post: post});
    }
  });
};

