UserAreaController = new Stellar.Controller('user_area');

//TODO Logic for this is a bit convoluted so will add this to Stellar filters soon
UserAreaController.loginHelper = function() {
  var auth = Session.get('user');
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
      if( blogRoll ) {
        Stellar.render('settings', {blogRoll: blogRoll});
      }
    });
  }
};

//TODO determine if this is needed if it was moved to the post pages - pretty sure we don't need to be able to specify description and slug of a tag
//That being said the code could be replicated for a category feature where slug and description would seem more fitting
UserAreaController.post_tags = function() {
  if(UserAreaController.loginHelper()) {
    Meteor.subscribe("alltags", function(){
      tags = Tags.find({}, { fields: {} });
      if ( tags ) {
        Stellar.render('post_tags', {tags: tags} );
      }
    });
  }
};

UserAreaController.posts = function () {
  if(UserAreaController.loginHelper()) {
    //saving the sorting in the session to allow other functions to access it    
    //set orderby to session value or to default
    orderby = Session.get('post_list_orderby') || 'asc';
    
    //set sort to session value or to default
    sort = Session.get('post_list_sort' ) || 'created';
    
    if (Stellar.page.params['sort']) {
      sort = Stellar.page.params['sort'];
      Session.set('post_list_sort', Stellar.page.params['sort']);
    }
    
    if (Stellar.page.params['orderby']) {
      orderby = Stellar.page.params['orderby'];
      Session.set('post_list_sort_orderby', Stellar.page.params['orderby']);
    }

    Meteor.subscribe("allposts", function() {
      Meteor.subscribe("alltags", function() {
        posts = Posts.find({}, {fields: {title: 1, date: 1, published: 1, slug: 1, _id: 1, tags: 1}}, {sort: ["created", "asc"]});
        if(posts) {
          Stellar.render('post_list', {posts: posts, sort: sort, orderby: orderby, orderby_asc: (orderby == 'asc'), orderby_desc: (orderby == 'desc')});
        }
      });
    });
  }
};
