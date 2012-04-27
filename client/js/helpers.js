Handlebars.registerHelper('date', function(date) {
  if(date) {
    dateObj = new Date(date);
    return $.timeago(dateObj);
  }
  return 'N/A';
});

Handlebars.registerHelper('short_content', function(slug, options) {
  renderedContent = options.fn(this);
  content = renderedContent.substring(0, 200);
  if(content != renderedContent) {
    content += " <a href=\"/blog/"+slug+"\" rel=\"internal\" >...</a>";
  }
  var converter = new Showdown.converter();
  return converter.makeHtml(content);
});

Handlebars.registerHelper('disqus_link', function(slug, options) {
  return '<a href="/blog/'+slug+'#disqus_thread" rel="internal" data-disqus-identifier="/blog/'+slug+'" ></a>';
});

Handlebars.registerHelper('labelify', function(options) {
  label = options.fn(this).replace(/\_/g, ' ');
  return label.charAt(0).toUpperCase() + label.substr(1);
});

//TODO Need to move to a better MVC style setup soon
Handlebars.registerHelper('content', function() {
  console.log('Content helper');
  if(Session.equals('loaded', true)) {
    //Stupid issue of home page not rendering, will refactor below to use this instead of equals
    console.log(Session.get('new_page'));

    if(Session.equals('page_type', 'post')) {
      post = Posts.findOne({slug: Session.get('new_page')});
      if(post) {
        //TODO  Meteor.subscribe("postcomments", post._id, init);
        renderNewSlide(Template.postView({post: post}));
      }
    } else {
      //Check template exists, if not use list view
      if(Template[Session.get('new_page')]) {
        renderNewSlide(Template[Session.get('new_page')]());
      } else {
        renderNewSlide(Template.listView());
      }
    }
    return '';
  }
  console.log('Show nowt');
  return '';
});
