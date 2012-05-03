UserAreaController = new Stellar.Controller('user_area');

//Logic for this is a bit convoluted so will add this to Stellar filters soon
UserAreaController.loginHelper = function() {
  var auth = Session.get('auth');
  if(!auth) {
    Stellar.redirect('home/login');
    return false;
  }
  return true;
};

UserAreaController.index = function() {
  if(UserAreaController.loginHelper()) {
    Stellar.render('user_area', {post: {title: '', body: '', slug: ''}});
  }
};

UserAreaController.users = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allusers", function() {
      users = Users.find();
      if(users) {
        Stellar.render('users', {users: users});
      }
    });
  }
};

UserAreaController.edit = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allposts", function() {
      post = Posts.findOne({slug: Stellar.page.params['id']});
      if(post) {
        Stellar.render('user_area', {post: post});
      }
    });
  }
};

UserAreaController.options = function() {
  if(UserAreaController.loginHelper()) {
    Stellar.render('options');
  }
};

UserAreaController.settings = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("allblogroll", function() {
      blogRoll = BlogRoll.find();
      if(blogRoll) {
        Stellar.render('settings', {blogRoll: blogRoll});
      }
    });
  }
};
