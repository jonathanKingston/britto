BlogController = new Stellar.Controller('blog');

BlogController.index = function() {
  var page = 1;
  if(Stellar.page.params['page']) {
    page = Stellar.page.params['page'];
  }
  Session.set('page', page);

  Meteor.autosubscribe(function() {
    Meteor.subscribe("postpage", Session.get('page'), function() {
      postlist = Posts.find({}, {sort: {created: -1}});
      Stellar.render('listView', {postlist: postlist, count: postlist.count()});
    });
  });
};

BlogController.show = function() {
  Session.set('blogshow', Stellar.page.params['show']);
  //TODO  Meteor.subscribe("postcomments", post._id, init);
  Meteor.autosubscribe(function() {
    Meteor.subscribe("post", Session.get('blogshow'), function() {
      post = Posts.findOne({slug: Session.get('blogshow')});
      if(post) {
        Stellar.render('postView', {post: post});
      }
    });
  });
};

