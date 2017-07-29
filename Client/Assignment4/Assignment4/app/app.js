var myStore = angular.module("myStore",['ngRoute','LocalStorageModule']);
//moving between tabs logic. we define the contoller for each tab.
myStore.config(['$routeProvider',function($routeProvider){
  $routeProvider
  .when('/',{
    templateUrl: 'views/homeAfterLogin.html',
      controller:'WellcomeController'
  })
  .when('/login',{
    templateUrl: 'views/login.html',
      controller:'LoginController'
  })
  .when('/directory',{
    templateUrl: 'views/directory.html',
    controller: 'StoreController'
  })
      .when('/cart',{
          templateUrl: 'views/cart.html',
          controller: 'CartController'
      })
      .when('/homeAfterLogin',{
          templateUrl: 'views/homeAfterLogin.html',
          controller: 'WellcomeController'
      })
      .when('/Register',{
          templateUrl: 'views/Register.html',
          controller: 'RegisterController'
      })
      .when('/Movies',{
          templateUrl: 'views/Movies.html',
          controller: 'MoviesController'
      })
      .when('/About',{
          templateUrl: 'views/about.html',
          controller: ''
      })
      .when('/passwordRetrieve',{
          templateUrl: 'views/passwordRetrieve.html',
          controller: 'PassController'
      })
      .otherwise({
    redirectTo: '/'
  });
}]);
myStore.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('myStore');
});


var cart ={};
var m_currentUserName='Guest';
var isLoggedIn=false;




myStore.factory('myService',['$http',function($http){
    var service={};
    service.currentUser='';
    service.isLoggedIn=false;

    return service;
}])
myStore.controller('StoreController',['$scope','$http',function($scope,$http){


 $http.get('http://localhost:5011/Users/Top5TrendMovies')
     .then(function(data) {
  $scope.movies=data;
  var i=0;
});

 $scope.removeGame = function(game){
    var removeGame = $scope.movies.indexOf(game);
    $scope.movies.splice(removeGame,1);
  }

  $scope.addGame = function(){
    $scope.movies.push({
      name: $scope.newgame.name,
      belt: $scope.newgame.belt,
      rate: parseInt($scope.newgame.rate),
      available:true
    });
    $scope.newgame.name = "";
    $scope.newgame.belt = "";
    $scope.newgame.rate = "";
   }

}]);
myStore.controller('WellcomeController', ['$http','$scope','$window','localStorageService',function ($http,$scope,$window,localStorageService) {
// top 5 movies:
    var cookie=localStorageService.cookie.get('currentUser');
    var data={Token:cookie};
    $scope.movies=[];
    $scope.m_currentUserName;
    $scope.m_currentDate;

    $http.post('http://localhost:5011/Users/SendCookie', data)
        .then(function (response) {
            if(response.data!='wrong cookie'){
                document.getElementById('login').style.display='none';
                document.getElementById('Register').style.display='none';
                document.getElementById('cartC').style.display='block';
                $window.isLoggedIn=true;
                $window.m_currentUserName=response.data[0].UserName;
                 $scope.isLoggedIn=$window.isLoggedIn;
                 $scope.m_currentUserName=$window.m_currentUserName;
                $scope.m_currentDate=localStorageService.cookie.get('currentDate');

                $http.get("http://localhost:5011/Users/Top5TrendMovies")
                 .then(function (response) {
                 $scope.movies=response.data;


                 })
                 .catch(function (err) {
                 window.alert(err);
                 })
                 $scope.addToCartHandler =function (movie) {
                 cart[movie.Name] = movie;
                 window.alert("The movie " + movie.Name + " was added to cart");
                 }

                 //movies from last month:
                 $scope.lastMonthMovies =[];
                 $http.get("http://localhost:5011/Users/TopNewestMovies")
                 .then(function (response) {
                 $scope.lastMonthMovies=response.data;


                 })
                 .catch(function (err) {
                 window.alert(err);
                 })
            }else{
                $scope.m_currentUserName=$window.m_currentUserName;
                $http.get("http://localhost:5011/Users/Top5TrendMovies")
                    .then(function (response) {
                        $scope.movies=response.data;


                    })
                    .catch(function (err) {
                        window.alert(err);
                    })
                $scope.addToCartHandler =function (movie) {
                    cart[movie.Name] = movie;
                    window.alert("The movie " + movie.Name + " was added to cart");
                }
            }
        });


    $scope.onExit = function() {

        $http.get('http://localhost:5011/Users/Logout')
            .then(function (response) {
            var i=0;
            });
    };

    window.onbeforeunload =  $scope.onExit;
}]);
myStore.controller('RegisterController', ['$http','$scope','$location','localStorageService',function ($http,$scope,$location,localStorageService) {

    $scope.checked = {};

    $http.get('http://localhost:5011/Users/Categories')
        .then(function (response) {
            $scope.categories = response.data;


        });


    var request = new XMLHttpRequest();
    request.open('GET', 'countries.xml', false);
    request.send();
    var xml = request.responseXML;
    $scope.countries = xml.getElementsByTagName("Name");


    $scope.addUser = function () {
        if ($scope.isValid()) {
            var categories = [];
            var data = {
                UserName: $scope.userName,
                FirstName: $scope.firstName,
                LastName: $scope.lastName,
                Address: $scope.adress,
                City: $scope.city,
                Phone_No: $scope.phoneNo,
                Cellular: $scope.cellular,
                CreditCard_No: $scope.ccn,
                Password: $scope.password,
                Country: $scope.countrySelected,
                Answer: $scope.answer
            };

            for (var key in $scope.checked) {
                if ($scope.checked[key] == true) {
                    categories.push(key);
                }
            }
            data['Categories']=categories;

            $http.post('http://localhost:5011/Users/Register', data)
                .then(function (response) {
                    if(response.data==='err'){

                        window.alert('userName is already taken , please pick another name')
                    }else{
                        var d=Date().toString();
                        localStorageService.cookie.set('currentUser',response.data);
                        localStorageService.cookie.set('currentDate',d);
                        $location.path('/login');
                    }
                })



        }
    }
    $scope.unChange=function(){
        if($scope.userName.length===0){
            $scope.UnComment='';
        }else
        if($scope.userName.length<3|| $scope.userName.length>8 ){
            $scope.UnComment='user name between 3 to 8 letters';
        }else{
            $scope.UnComment='';

        }
    }
    $scope.pdChange=function(){
        if($scope.password.length===0){
            $scope.pdComment='';
        }else
        if($scope.password.length<5|| $scope.password.length>10 ){
            $scope.pdComment='password between 5 to 10 letters';
        }else{
            $scope.pdComment='';

        }
    }
    $scope. isValid=function() {

        var a=/^[a-zA-Z]+$/.test($scope.userName);
        var abool=true;
        if( $scope.UnComment.length>0){
            abool=false;
        }
        a=a&&abool;
        var b=/^\w+$/.test($scope.password);
        var bbool=true;
        if($scope.pdComment.length>0){
            bbool=false;
        }
        b=b&&bbool;

        var i=0;
        if($scope.userName&&$scope.password&&$scope.firstName&&$scope.lastName&&$scope.adress&&$scope.city&&$scope.phoneNo&&$scope.cellular&&$scope.ccn&&
            $scope.answer&&$scope.countrySelected){
            if(a&&b&&$scope.userName.length>0&&$scope.password.length>0&&$scope.firstName.length>0&&$scope.lastName.length>0&&$scope.adress.length>0&&$scope.city.length>0
                &&$scope.phoneNo.length>0&&$scope.cellular.length>0&&$scope.ccn.length>0&&$scope.answer.length>0&&$scope.countrySelected.length>0){
                return true;
            }else{
                window.alert('one or more fields are wrong');
                return false;
            }
        }else{
            window.alert('one or more fields are wrong');
            return false;

        }
    }
    $scope.listChange=function(category){
        var status;
        if(!(category.CategoryName in $scope.checked))
            $scope.checked[category.CategoryName]=true;
        else {
            $scope.checked[category.CategoryName]=!$scope.checked[category.CategoryName];
        }

    }


}]);
myStore.controller('LoginController', ['$http','$scope','$location','$window','localStorageService',function ($http,$scope,$location,$window,localStorageService) {


    $scope.checkUser = function () {
        if ($scope.isValid()) {
            var data={UserName:$scope.userName,Password:$scope.password};

            $http.post('http://localhost:5011/Users/Login', data)
                .then(function (response) {
                    if(response.data=="login without cookie"){
                        document.getElementById('login').style.display='none';
                        document.getElementById('Register').style.display='none';
                        document.getElementById('cartC').style.display='inline-block';

                        $window.isLoggedIn=true;
                        $window.m_currentUserName=$scope.userName;
                        $location.path('/homeAfterLogin');
                    }
                    else if(response.data=='invalid username or password'){
                        window.alert('wrong credentials');
                    }else{
                        var d=Date().toString();
                        localStorageService.cookie.set('currentUser',response.data);
                        localStorageService.cookie.set('currentDate',d);
                        document.getElementById('login').style.display='none';
                        document.getElementById('Register').style.display='none';
                        document.getElementById('cartC').style.display='inline-block';

                        $window.isLoggedIn=true;
                        $window.m_currentUserName=$scope.userName;
                        $location.path('/homeAfterLogin');
                    }
                });
        }
    }
    $scope.unChange=function(){
        if($scope.userName=='a') return true;
        if($scope.userName.length===0){
            $scope.UnComment='';
        }else
        if($scope.userName.length<3|| $scope.userName.length>8 ){
            $scope.UnComment='user name between 3 to 8 letters and no spaces';
        }else{
            $scope.UnComment='';

        }
    }
    $scope.pdChange=function(){
        if($scope.password=='a') return true;

        if($scope.password.length===0){
            $scope.pdComment='';
        }else
        if($scope.password.length<5|| $scope.password.length>10 ){
            $scope.pdComment='password between 5 to 10 letters and no spaces';
        }else{
            $scope.pdComment='';

        }
    }
    $scope. isValid=function() {

        var a=/^[a-zA-Z]+$/.test($scope.userName);
        var b=/^\w+$/.test($scope.password);
        var i=0;
        if($scope.userName&&$scope.password){
            if(a&&b&&$scope.userName.length>0&&$scope.password.length>0){
                return true;
            }else{
                window.alert('one or more fields are wrong');
                return false;
            }
        }else{
            window.alert('one or more fields are wrong');
            return false;

        }
    }


}]);
myStore.controller('CartController', ['$scope','$http',function ($scope,$http) {

    $scope.moviesInCart=cart;
    $scope.movies=$scope.moviesInCart;
    $scope.categories = [];
    $scope.directors = [];

    $scope.purchaseHandler = function () {
        window.alert("Purchase Interface wasn't implemented :)")
    }

    $scope.removeFromCartHandler =function (movie) {
        delete $scope.movies[movie.Name];

    }
    $http.get("http://localhost:5011/Users/Categories")
        .then(function (response) {
            $scope.categories=response.data;
            $scope.categories.push({CategoryName: 'All'});
        })

        .catch(function (err) {
            window.alert(err);
        })


    $http.get("http://localhost:5011/Users/GetAllDirectors")
        .then(function (response) {
            $scope.directors=response.data;
            $scope.directors.push({director: 'All'});
        })
        .catch(function (err) {
            window.alert(err);
        })

    $scope.selectedHandlerD = function () {

        $scope.filteredDirectoes=[];

        for(var key in $scope.moviesInCart){
            if($scope.moviesInCart[key].Director === $scope.selected.director){
                $scope.filteredDirectoes.push($scope.moviesInCart[key])
            }
            else if($scope.selected.director === "All"){
                $scope.filteredDirectoes.push($scope.moviesInCart[key])
            }
        }
        $scope.movies = $scope.filteredDirectoes;
    }

    $scope.selectedHandlerC = function () {

        $scope.filtered=[];
        $scope.movies=$scope.moviesInCart;

        for(var key in $scope.moviesInCart){
            if($scope.moviesInCart[key].Category === $scope.selected.CategoryName){
                $scope.filtered.push($scope.moviesInCart[key])
            }
            else if($scope.selected.CategoryName === "All"){
                $scope.filtered.push($scope.moviesInCart[key])
            }
        }
        $scope.movies = $scope.filtered;
    }

$scope.totalCost = 0;
    for(key in $scope.movies){
        $scope.totalCost += $scope.movies[key].Price;
    }

}]);
myStore.controller('MoviesController',['$scope','$http',function($scope,$http){
    // top 5 movies:
    $scope.movies=[];
    $scope.allMovies=[];
    $scope.recommendedMovies = [];
    $scope.isLoggedIn=isLoggedIn;
    var data = {
        UserName:m_currentUserName
    }
    if(m_currentUserName!='Guest'){
        $http.post("http://localhost:5011/Users/SuggestedMovies",data)

        .then(function (response) {
            $scope.recommendedMovies=response.data;

        })
        .catch(function (err) {
            window.alert(err);
        })

    }
    $http.get("http://localhost:5011/Users/GetAllMovies")
        .then(function (response) {
            $scope.movies=response.data;
            $scope.allMovies = $scope.movies;

        })
        .catch(function (err) {
            window.alert(err);
        })

    $http.get("http://localhost:5011/Users/Categories")
        .then(function (response) {
            $scope.categories=response.data;
        })
        .catch(function (err) {
            window.alert(err);
        })
    $scope.selectedHandler = function () {

        $scope.filtered=[];
        $scope.movies=$scope.allMovies;
        for(var i = 0; i < $scope.movies.length ; i++){
            if($scope.movies[i].Category === $scope.selected.CategoryName){
                $scope.filtered.push($scope.movies[i])
            }
        }
        $scope.movies = $scope.filtered;
    }
    $scope.sortChoice;
    $scope.sortHandler = function () {
        $scope.sortChoice = $scope.sortSelected
    }

    $scope.addToCartHandler =function (movie) {
        cart[movie.Name] = movie;
        window.alert("The movie " + movie.Name + " was added to cart");
    }


}]);
myStore.controller('PassController',['$scope','$http',function($scope,$http){

    $scope.isShow=false;
    $scope.retrievePass=function() {
        var data={UserName:$scope.userName,Answer:$scope.answer};
        $http.post('http://localhost:5011/Users/RetrievePassword', data)
            .then(function (response) {
                if(response.data.length>0){
                    $scope.Pass=response.data[0].Password;
                    $scope.isShow=true;

                }else{
                    window.alert('wrong credentials')
                }

            });
    }

}]);



//-------------------------------------
