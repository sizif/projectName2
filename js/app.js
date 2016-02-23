// Init UserApp with your App Id
// https://help.userapp.io/customer/portal/articles/1322336-how-do-i-find-my-app-id-

Vidpub = {};

Vidpub.start = function(next){
  UserApp.initialize({ appId: "5387988b7bdeb" });
  Vidpub.currentUser(function(user){
    console.log(user);
    Vidpub.personalize(user,next);
  });
};

Vidpub.currentUser = function(next){
  var token = localStorage.getItem("token");
  if(token){
    UserApp.global.token = token;
    UserApp.User.get("self", function(err, userData){
      if(userData){
        next(userData[0]);
      }else{
        next(null);
      }
    });
  }else{
    next(null);
  }
};

Vidpub.personalize = function(user, next){
  var ViewModel = {
    isLoggedIn: user ? true : false,
    name: ko.computed(function(){
      if(user){
        return user.first_name + ' ' + user.last_name
      }else{
        return "";
      }
    }),
    login_or_out : function(){
      if(user){
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        location.href="/";
      }else{
        location.href = "/account/login"
      }
    },
    login_or_out_button : ko.computed(function(){
      if(user){
        return "Logout";
      }else{
        return "Login";
      }
    })
  }
  ko.applyBindings(ViewModel);
  if(next) next(user);
};

Vidpub.signUp = function(creds, next){
  UserApp.User.save(creds, function(err,result){
    if(err){
      next(err,null);
    }else{
      //login
      Vidpub.login(creds, next);
    }
  });
};

Vidpub.login = function(creds, next){
  UserApp.User.login(creds, function(err,authData){
    if(err){
      next(err,null);
    }else{
      localStorage.setItem("user_id", authData.user_id);
      localStorage.setItem("token", authData.token);
      next(null,authData);
    }
  });
};

Vidpub.githubLogin = function(next){
  UserApp.OAuth.getAuthorizationUrl({
    provider_id: 'github',
    redirect_uri: 'http://localhost:4000/account/login'
  }, function(err, redirect){
    if(err){
      next(err,null);
    }else{
      location.href = redirect.authorization_url;
    }
  });
}

Vidpub.canSeeTutorials = function(user){
  if(!user) return false
  if(user.permissions.admin.value) return true;
  if(user.features.tutorials.value) return true;
};
