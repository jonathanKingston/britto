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
