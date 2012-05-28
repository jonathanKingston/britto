//create post callback
function madePost(error, response) {
  if(!error) {
    Stellar.redirect('/');
  } else {
    return standardHandler(error, response);
  }
}

function loginCallback(error, returnVal) {
  if(!error) {
    Stellar.session.updateKey(returnVal.auth);
    Session.set('user', returnVal);
    Stellar.redirect('user_area');
  } else {
    return standardHandler(error, returnVal);
  }
}

/* TODO - Goodbye for now, add back later
function renderNewSlide(content) {
  Stellar.log('Render new slide');
  newSlide = $('<div class="slide">' + content + '</div>');
  newSlide.css('left', '0%');
  newSlide.css('top', '2em');
  newSlide.css('display', 'none');
  $('#slides').append(newSlide);
  if($('#slides .slide').length > 1) {
    counter = $('#slides .slide').length;
    $('#slides .slide').each(function(index) {
      if(index+1 !== counter) {
        $(this).fadeOut('slow').promise().done(function() {$(this).remove();});
      } else {
        $('#slides .slide:last').fadeIn('slow');
      }
    });
  } else {
    $('#slides .slide:last').css('display','block');
  }
}
*/

//This is the callback for sessionUser, this adds in the helper method which all the menus check for on the client side
function sessionLogin(error, returnVal) {
  if(!error) {
    Session.set('user', returnVal)
  } else {
    Stellar.redirect('home/login');
  }
}

Template.search.events = {
  'click #search-button, submit #search-button': function(e) {
    e.preventDefault();
    var search_string = $('#search-input').attr('value');
  
    if(search_string != '') {
      Stellar.redirect('search/results?find='+search_string);
    }
  }
};

Template.postView.events = {
  'click #comment-button, submit #comment-button': makeComment
};

Template.login.events = {
  'click #login-button, submit #login-button': doLogin
};

Template.user_area.events = {
  'click #post-button, submit #post-button': makePost,
  'change #post-title': changeTitle,
  'change #date-control-group select': checkDate,
  'click .tag-remove-button, submit .tag-remove-form': removePostTag,
  'click .tag-add-button, submit .tag-add-form': addPostTag
};

Template.settings.events = {
  'click #change-setting-button, submit #change-setting-button': changeSetting,
  'click #add-blog-roll-button, submit #add-blog-roll-button': addBlogRoll,
  'click .delete-blog-roll': deleteBlogRoll
};

Template.options.events = {
  'click': function() {console.log('slut');},
  'click #change-password-button, submit #change-password-button': changePassword,
  'click #change-user-button, submit #change-user-button': changeUser
};

Template.comment.events = {
  'click .delete-comment, submit .delete-comment': deleteComment
};

Template.post.events = {
  'click .delete-post, submit .delete-post': deletePost,
  'click .edit-post, submit .edit-post': editPost
};

Template.users.events = {
  'click #new-user-button, submit #new-user-button': addUser,
  'click .delete-user, submit .delete-user': deleteUser
};

Template.post_list.events = {
  'click .post-edit-button': editPost,
  'click .post-delete-button': deletePost,
  'click .post-publish-button': publishPost,
  'click .post-unpublish-button': unpublishPost,
  'change .orderby': changeOrderBy,
  'click .tag-remove-button, submit .tag-remove-form': removePostTag
};

Template.post_tags.events = {
  'click .tag-delete-button': deleteTag,
  'click #add-tag-submit, submit #add-tag': makeTag,
  'change #tag-name, keyup #tag-name': changeTagName
};

Meteor.startup(function() {
  //This is a helper function for the page to keep state between refresh
  if(!Session.get('user') && Stellar.session.getKey()) {
    Meteor.call('sessionUser', Stellar.session.getKey(), sessionLogin);
  }

  Meteor.call('blog_page_count', function(error, result) {if(!error && result) {Session.set('blog_page_count', result);}});
});

function changeSetting(e) {
  e.preventDefault();
  if(Session.get('user')) {
    settings = [];
    $('#change-setting-form input').each(
      function(input) { 
        val = $(this).val();
        //checkbox select to bool mapping
        if ( $(this).attr('type') == 'checkbox' ) {
          if ( $(this).attr('checked') ) {
            val = true;
          } else {
            val = false;
          }
        }
        
        settings.push([$(this).attr('data-key'), val]);
      }
    );
    
    Meteor.call('changeSetting', {settings: settings, auth: Stellar.session.getKey()}, standardHandler);
  }
}

function standardHandler(error, response) {
  if(!error && response) {
    //TODO move this to other places where needed
    //Stellar.redirect('');
  } else {
    if(error && error.error && error.error == 401) {
      Stellar.redirect('home/login');
      Britto.alert('error', error.reason);
      return false;
    }
    Britto.alert('error', 'There was an error updating that');
    //return false;
  }    
}

function changePassword(e) {
  e.preventDefault();
  if(Session.get('user')) {
    if($('#change-new-password').val() === '') {
      Britto.alert('warning', 'Your passwords were blank, what sort of parents would we be letting you do that?');
      return;
    }
    if($('#change-new-password').val() == $('#change-repeat-password').val()) {
      Meteor.call('changePassword', {current_password: $('#change-current-password').val(), password: $('#change-new-password').val(), auth: Stellar.session.getKey()}, standardHandler);
    } else {
      Britto.alert('warning', 'Your passwords were not the same');
    }
  }
}

function changeUser(e) {
  e.preventDefault();
  if(Session.get('user')) {
    details = {auth: Stellar.session.getKey(), name: $('#change-user-name').val()};
    Meteor.call('changeUser', details, standardHandler);
  }
}

function addUser(e) {
  e.preventDefault();
  if(Session.get('user')) {
    details = {auth: Stellar.session.getKey(), name: $('#add-user-name').val(), username: $('#add-user-username').val(), password: $('#add-user-password').val()};
    Meteor.call('addUser', details, standardHandler);
  }
}

function addBlogRoll(e) {
  e.preventDefault();
  if(Session.get('user')) {
    details = {auth: Stellar.session.getKey(), name: $('#add-blog-roll-name').val(), link: $('#add-blog-roll-link').val()};
    Meteor.call('insertBlogRoll', details, standardHandler);
  }
}

function deleteComment(e) {
  e.preventDefault();
  if(Session.get('user')) {
    target = e.target;
    commentId = $(target).attr('data-id');
    Meteor.call('deleteComment', {commentId: commentId, auth: Stellar.session.getKey()});
  }
}

function deleteUser(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Are you sure you want to delete this user?')) {
    target = e.target;
    userId = $(target).attr('data-user-id');
    Meteor.call('removeUser', {id: userId, auth: Stellar.session.getKey()}, standardHandler);
  }
}

function deleteBlogRoll(e) {
  e.preventDefault();
  if(Session.get('user')) {
    target = e.target;
    id = $(target).attr('data-id');
    Meteor.call('deleteBlogRoll', {id: id, auth: Stellar.session.getKey()}, standardHandler);
  }
}

function deletePost(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Are you sure you want to delete this post?')) {
    target = e.target;
    postId = $(target).attr('data-id');
    Meteor.call('deletePost', {commentId: postId, auth: Stellar.session.getKey()}, deletedPost);
  }
}

function editPost(e) {
  e.preventDefault();
  target = e.target;
  postId = $(target).attr('data-slug');
  Stellar.redirect('/user_area/edit?id='+postId);
}

function deletedPost(error, response) {
  if(!error && response) {
    Stellar.redirect('/');
  } else {
    return standardHandler(error, response);
  }
}

function changeTitle() {
  slug = $('#post-title').val();
  slug = slug.replace(/\s/g, '_').toLowerCase();
  slug = replaceUmlaute(slug);
  $('#post-slug').val(slug);
}

function replaceUmlaute(s) {
  //TODO add greater support for all chars
  //replace äüö with ae ue and oe for german titles
  //later add support for more special chars defined in the admin interface
  //removing the need of adding them all here and always test against those that we need to test against ;)
  tr = {"\u00e4":"ae", "\u00fc":"ue", "\u00f6":"oe", "\u00df":"ss" }
  return s.replace(/[\u00e4|\u00fc|\u00f6|\u00df]/g, function($0) { return tr[$0] });
}

function makePost(e) {
  e.preventDefault();
  author = $('select#post-author option').filter(':selected').val();
  published = $('#post-published').attr('checked') == 'checked';
  created = new Date( $('#post-year').val(), $('#post-month').val(), $('#post-day').val(), $('#post-hour').val(), $('#post-minute').val() );
  date = new Date();
  
  if(Session.get('user')) {
    Meteor.call('post', {title: $('#post-title').val(), body: $('#post-body').val(), slug: $('#post-slug').val(), auth: Stellar.session.getKey(), author: author, published: published, created: created }, madePost);
  }
  return false;
}

function doLogin(e) {
  e.preventDefault();
  Meteor.call('login', $('#login-username').val(), $('#login-password').val(), loginCallback);
  return false;
}

function makeComment(e) {
  e.preventDefault();
  nameText = $('#comment-name').val();
  commentText = $('#comment-comment').val();
  //Stop blank messages
  if(commentText.length > 0 && nameText.length > 0) {
    Meteor.call('comment', {name: nameText, comment: commentText, postId: $('#comment-post').val()}, madeComment);
  }
  return false;
}

function madeComment(error, response) {
  if(!error) {
    $('#comment-comment').val('');
  } else {
    return standardHandler(error, response);
  }
}

//checks the day for the user_area
function checkDate() {
  //remove all shown errors if there are some
  $('.error').removeClass('error');

  error = false;
  
  day = $('#post-day').val();
  month = $('#post-month').val();
  year = $('#post-year').val();
  
  lastDayMonth = parseInt(month) + 1;
  
  // if monthnum is december or higher, reset to january
  if ( month >= 12 ) {
    lastDayMonth = 0;
  }
  
  lastDayInMonth = new Date( year, lastDayMonth, 0 ).getDate();
  
  if ( lastDayInMonth < day ) {
    //error
    $('#post-day').addClass('error');
    return false;
  }
  return true;
}

function publishPost(e) {
  e.preventDefault();
  target = e.target;
  slug = $(target).attr('data-slug');
  Meteor.call('publishPost', {slug: slug, published: true, auth: Stellar.session.getKey()}, standardHandler);
}

function unpublishPost(e) {
  e.preventDefault();
  target = e.target;
  slug = $(target).attr('data-slug');
  Meteor.call('unpublishPost', {slug: slug, published: false, auth: Stellar.session.getKey() }, standardHandler);
}

function changeOrderBy(e) {
  orderby = e.target;
  $('ul#post-list-sort li a').each(function(){
    href = $(this).attr('href').split('&');
    href[1] = orderby;
    for(var hr in href) { //TODO Change this to _.each
      href = href + hr;
    }
    $(this).attr('href', hr);
  });
}

function makeTag(e) {
  e.preventDefault();
  
  if (Session.get('user')) {
    name = $('#tag-name').val();
    slug = $('#tag-slug').val();
    description = $('#tag-description').html();
    Meteor.call( 'makeTag', { name: name, slug: slug, description: description, auth: Stellar.session.getKey() }, madeTag);
  }
  return false;
}

function madeTag(error, response) {
  if(error) {
    return standardHandler(error, response);
  }
  $('#tag-name').val('');
  $('#tag-slug').val('');
  $('#tag-description').html('');
}


function deleteTag(e) {
  e.preventDefault();
  if(Session.get('user') && confirm('Are you sure you want to delete this tag?')) {
    target = e.target;
    tagId = $(target).attr('data-id');
    Meteor.call('deleteTag', {tagId: tagId, auth: Stellar.session.getKey() }, standardHandler);
    return true;
  }
  return false;
}

function changeTagName() {
  slug = $('#tag-name').val();
  $('#tag-slug').val(slug.replace(/\s/g, '_').toLowerCase());
}

function addPostTag(e) {
  e.preventDefault();
  if (Session.get('user')) {
    target = e.target;
    tagId = $(e.target).attr('data-id');
    postId = $('.tags-list').attr('data-id');
    Meteor.call('addPostTag', { postId: postId, tagId: tagId, auth: Stellar.session.getKey()}, standardHandler);
    return true;
  }
  return false;
}

//removes a tag from a post
function removePostTag(e) {
  e.preventDefault();
  if (Session.get('user') && confirm('Do you really want to remove this Tag from this Post?')) {
    target = e.target;
    tagId = $(e.target).attr('data-id');
    postId = $('.tags-list').attr('data-id');
    
    Meteor.call('removePostTag', {postId: postId, tagId: tagId, auth: Stellar.session.getKey()}, standardHandler);
    return true;
  }
  return false;
}