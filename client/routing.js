BrittoRouter = Backbone.Router.extend({
  routes: {
    "logout/": "logoutPage",
    "logout": "logoutPage",
    "blog/:slug": "findPost",
    "blog/:slug/": "findPost",
    ":page": "basicPage",
    ":page/": "basicPage",
  },
  basicPage: function(page) {
    setPage(page, false, false);
  },
  findPost: function(slug) {
    setPage(slug, 'post', false);
  },
  logoutPage: function() {
    Session.set('user', false);
    Session.set('auth', false);
    setPage('/', false, true);
  }
});
Router = new BrittoRouter;