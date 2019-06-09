var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { page: 'Home', menuId: 'home' });
});

/* GET Userlist page. */
router.get('/userlist', function (req, res) {
  var db = req.db;                            // extract db object passed to http request
  var collection = db.get('usercollection');  // use the collectioin 'usercollection'

  collection.count({}, function (error, count) {
    console.log(error, count);
  });

  collection.find({}, {}, function (e, docs) {     // do a find, return results as variable docs
    res.render('userlist', {                // render userlist (an ejs template) with data passed in docs
      "userlist": docs,
      page: 'Dealer List',
      menuId: 'userList'
    });
  });
});

/* GET New User page. */
router.get('/newuser', function (req, res) {
  res.render('newuser', { page: 'Add New Dealer', menuId: 'adduser' });
});

/* POST to Add User Service */
router.post('/adduser', function (req, res) {

  // Set our internal DB variable
  var db = req.db;

  // Get our form values. These rely on the "name" attributes
  var userName = req.body.username;
  var userEmail = req.body.useremail;
  var userPhoto = req.body.userphoto;
  var userLoc = req.body.userloc;
  var userDesc = req.body.userdesc;
  var userReviews = [];

  // Set our collection
  var collection = db.get('usercollection');

  collection.count({}, function (error, count) {
    // Submit to the DB
    collection.insert({
      "userid": count,
      "username": userName,
      "email": userEmail,
      "photourl": userPhoto,
      "userloc": userLoc,
      "userdesc": userDesc,
      "userreviews": userReviews
    }, function (err, doc) {
      if (err) {
        // If it failed, return error
        res.send("There was a problem adding the information to the database.");
      }
      else {
        // And forward to success page
        res.redirect("userlist");
      }
    });
  });

});

router.get('/:n', function (req, res, next) {
  console.log("==url params for req:", req.params);
  var n = req.params.n;

  var db = req.db;
  var collection = db.get('usercollection');

  collection.count({}, function (error, count) {
    if (n <= count) {
      console.log(n);
      collection.find({}, {}, function (e, docs) {
        console.log(docs[n]);
        res.render('user', {                // render userlist (an ejs template) with data passed in docs
          "user": docs[n],
          page: 'Dealer Page',
          menuId: 'dealerPage'
        });
      });
    }
    else {
      res.status(404).render('404', { page: '404 error not found', menuId: '404' });
    }
  });


});

/* POST to Add Review Service */
router.post('/:n/addreview', function (req, res) {

  // Set our internal DB variable
  var db = req.db;

  console.log(req.params.n);

  // Get our form values. These rely on the "name" attributes
  var reviewerName = req.body.reviewerName;
  var reviewRating = req.body.numRat;
  var reviewText = req.body.reviewText;

  var review = [reviewerName, reviewRating, reviewText];

  console.log(review);

  // Set our collection
  var collection = db.get('usercollection');

  var query = {};
  query['userid'] = parseInt(req.params.n);
  console.log(query);

  collection.findOneAndUpdate(
    query,
    {$push: {userreviews: review} }).then((updatedDoc) => {
      console.log(updatedDoc.userreviews);
    });

});

router.get('*', function (req, res) {
  res.status(404).render('404', { page: '404 error not found', menuId: '404' });
  //res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

module.exports = router;
