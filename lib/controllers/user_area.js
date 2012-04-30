UserAreaController = new Stellar.Controller('user_area');

UserAreaController.index = function() {
  Stellar.render('user_area');
};

UserAreaController.edit = function() {
  Meteor.subscribe("allposts", function() {
    post = Posts.findOne({slug: Stellar.page.params['slug']});
    if(post) {
      Stellar.render('user_edit', {post: post});
    }
  });
};

UserAreaController.options = function() {
  Stellar.render('options');
};

UserAreaController.settings = function() {
  Stellar.render('settings');
};
