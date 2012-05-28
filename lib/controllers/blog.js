BlogController = new Stellar.Controller('blog');

BlogController.index = function() {
  var page = 1;
  if(Stellar.page.params['page']) {
    page = Stellar.page.params['page'];
  }
  Session.set('page', page);

  Meteor.autosubscribe(function() {
    Meteor.subscribe("postpage", Session.get('page'), function() {
      Meteor.subscribe("alltags", function() {
        //redefining the published and created criteria in here to force them to show without reload
        postlist = Posts.find({
          published: true,
          created: {$lte: new Date() } }, 
          {sort: {created: -1}
        });
        
        Stellar.render('listView', {postlist: postlist, count: postlist.count()});
      });
    });
  });
};

BlogController.show = function() {
  Session.set('blogshow', Stellar.page.params['show']);
  //TODO  Meteor.subscribe("postcomments", post._id, init);
  Meteor.autosubscribe(function() {
    Meteor.subscribe("post", Session.get('blogshow'), function() {
      Meteor.subscribe("alltags", function() {
        Meteor.subscribe("alltagsinposts", function () {
          
          //get one post by slug that is published and created in the past
          post = Posts.findOne({
            slug: Session.get('blogshow'), 
            published: true, 
            created: { $lte: new Date() } 
          });
          
          if(post) {
            Stellar.render('postView', {post: post});
          }
        });
      });
    });
  });
};

BlogController.tag = function() {
  var page = 1;
  if(Stellar.page.params['page']) {
    page = Stellar.page.params['page'];
  }
  Session.set('page', page);

  Meteor.autosubscribe(function() {
    Meteor.subscribe("postpage", Session.get('page'), function() {
      Meteor.subscribe("alltags", function() {
        Meteor.subscribe("alltagsinposts", function() {
          //4 database calls? am i crazy? guess its not that bad in node/meteor though?
          
          //get the tagSlug or tagSlugs from the request by splitting
          //look for a nicer split symbol?
          //_and_ would be nice, but this means that a tag with named and would break.
          tagSlugs = Stellar.page.params['show'].split("$");
          
          //console.log("tagSlug = "+tagSlugs[0]+ " length = "+tagSlugs.length);
          
          //get the tagIds from the slugs
          tags = Tags.find ( { 
            slug: { $in: tagSlugs } }, 
            {fields: { postId : 1 } 
          });
          
          tagIds = [];
          tags.forEach ( function ( tag ) {
            tagIds.push( tag._id );
          });
          
          //console.log ( "tagIds = "+tagIds[0]+" length ="+tagIds.length );
          
          //get the postIds to load using the tagSlugs array
          postsWithTag = TagsInPosts.find({ 
            tagId: { $in: tagIds } }, 
            {fields: { postId: 1 }
          });
          
          postIds = [];
          postsWithTag.forEach ( function ( tag ) {
            postIds.push( tag.postId );
          });
          
          //console.log("postIds[0] = "+postIds[0]+" length = "+postIds.length );
          
          //get posts by _id that are published and created in the past
          postlist = Posts.find ({ 
            _id: { $in: postIds }, 
            published: true, 
            created: {$lte: new Date() } }, 
            { sort: { created: -1 } }
          );
          
          Stellar.render('listView', {postlist: postlist, count: postlist.count()});
        });
      });
    });
  });
};

