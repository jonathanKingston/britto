UserAreaController = new Stellar.Controller('user_area');

UserAreaController.index = function() {
  Stellar.render('user_area', {post: {title: '', body: '', slug: ''}});
};

UserAreaController.edit = function() {
  Meteor.subscribe("allposts", function() {
    post = Posts.findOne({slug: Stellar.page.params['id']});
    if(post) {
      Stellar.render('user_area', {post: post});
    }
  });
};

UserAreaController.options = function() {
  Stellar.render('options');
};

UserAreaController.settings = function() {
  Stellar.render('settings');
};
