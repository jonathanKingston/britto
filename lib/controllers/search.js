SearchController = new Stellar.Controller('search');

SearchController.results = function() {
  Meteor.autosubscribe(function () {    
    Meteor.subscribe("allposts", function() {
      //set the searchinput, replacing the placeholders for whitespaces
      var searchinput = params['find'].replace(/%20/g, ' ');
      //create the regex
      var searchregex = new RegExp(searchinput, 'i');

      var postlist = Posts.find({
        $or: [
          {title: searchregex },
          {body: searchregex },
          {slug: searchregex }
        ]
      });
      
      Stellar.render('listView', {postlist: postlist, count: postlist.count()});
    });
  });
};