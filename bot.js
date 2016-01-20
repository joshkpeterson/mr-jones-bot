// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

var rateLimitCheckCounter = 0,
		sinceID = 689636929256714240, // from my test account
		who = '\\bbrooklyn\\b';


function checkThrottled() {
	var responseData;

	T.get('application/rate_limit_status', {resources: 'statuses'}, function (err, data, response) {
		responseData = data.resources.statuses['/statuses/mentions_timeline'].remaining;
		console.log(responseData);
	})

	rateLimitCheckCounter += 1;
	return responseData;
}

checkThrottled();

//////////////////////////////////////////////

//twitter data
var latestMentions = [];
var idStrings = {};

var getMentions = function() {  
  Twit.get('/statuses/mentions_timeline.json', { count: 200, include_rts: 1, : since_id: sinceID }, function(data) {
    if (data.length) {
      for (var i = 0; i < data.length; i++) {
        var currentTweet = data[i];
        if (!idStrings[currentTweet.id_str] ) {

        	if ((new RegExp(locationString, 'i')).exec(currentTweet.text)) {
	        	idStrings[currentTweet.id_str] = true;

	          var tweetObj = {};
	          tweetObj.user = currentTweet.user.screen_name;
	          tweetObj.text = currentTweet.text;
	          latestMentions.push(tweetObj);
	        }
        }
      }
      //response to new mentions
      replyToMentions();
    } 
    else {
      console.log(data);
    }
  });
};

//This function takes all of the mentions stored in our latestMentions array and responds to them
//with a simple message. We want to invoke it at the end of our getMentions function, so it is called
//when we have all our new mentions. 
var replyToMentions = function(){  
  for(var i = 0; i < latestMentions.length; i++){
    var currentMention = latestMentions[i];
    //responseTweet is the string we will send to Twitter to tweet for us
    var responseTweet = 'Hello @';
    responseTweet += currentMention.user;
    responseTweet += '\nI hope you are having a wonderful day! \n-Your Favorite Node Server';

    //Twit will now post this responseTweet to Twitter. This function takes a string and a callback
    Twit.updateStatus(responseTweet, function(){
      console.log(responseTweet);
    });
  }
};

getMentions();

