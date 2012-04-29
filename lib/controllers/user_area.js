UserAreaController = new Stellar.Controller('user_area');

UserAreaController.index = function() {
  Stellar.render('user_area');
};

UserAreaController.options = function() {
  Stellar.render('options');
};

UserAreaController.settings = function() {
  Stellar.render('settings');
};
