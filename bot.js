// Our Tter library
var T = require('twit');

// We need to include our configuration file
var T = new T(require('./config.js'));

var rateLimitCheckCounter = 0,
		sinceID = 689636929256714240, // from my test account
		who = '\\bwho\\b';


function checkThrottled(callback) {
	responseData = {};

	T.get('application/rate_limit_status', {resources: 'statuses'}, function (err, data, response) {
		responseData.mentions = data.resources.statuses['/statuses/mentions_timeline'].remaining;
		console.log(responseData);

		rateLimitCheckCounter += 1;
		return callback(responseData);
	})


}

//////////////////////////////////////////////

//twitter data
var latestMentions = [];
var idStrings = {};

var getMentions = function() {  
  T.get('statuses/mentions_timeline', { count: 10, include_rts: 1, since_id: sinceID }, function(err, data, response) {
    if (data.length) {
      for (var i = 0; i < data.length; i++) {

        var currentTweet = data[i];
        if (!idStrings[currentTweet.id_str] ) {
        	console.log(currentTweet.text);

        	if ((new RegExp(who, 'i')).exec(currentTweet.text)) {
	        	idStrings[currentTweet.id_str] = true;

	          var tweetObj = {};
	          tweetObj.user = currentTweet.user.screen_name;
	          tweetObj.text = currentTweet.text;
	          tweetObj.id = currentTweet.id;
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
    var responseTweet = 'MIKE JONES ' + '                      @' + currentMention.user;

    console.log('attempting to tweet');
    debugger;
    //Twit will now post this responseTweet to Twitter. This function takes a string and a callback
    T.post('statuses/update', { status: responseTweet, in_reply_to_status_id: currentMention.id }, function(err, data, response) {
      console.log(err)
      if (err) {}
    })
  }
};


checkThrottled(function(requestsRemaining) {
	if (requestsRemaining.mentions > 1) {
		getMentions();
	}
})
