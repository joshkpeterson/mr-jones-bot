var T = require('twit');
var T = new T(require('./config.js'));
var schedule = require('node-schedule');

var rateLimitCheckCounter = 0,
		sinceID = 689636929256714240, // from my test account
		mikeJonesCellNumber = '@28133og8004',
		who = '\\bwho\\b',
		latestMentions = [],
		idStrings = {};


var checkThrottled = function (callback) {
	responseData = {};

	T.get('application/rate_limit_status', {resources: 'statuses'}, function (err, data, response) {
		responseData.mentions = data.resources.statuses['/statuses/mentions_timeline'].remaining;
		// console.log(responseData);

		rateLimitCheckCounter += 1;
		return callback(responseData);
	})
}

var getMentions = function() {  
  T.get('statuses/mentions_timeline', { count: 10, include_rts: 1, since_id: sinceID }, function(err, data, response) {
    if (data.length) {
      for (var i = 0; i < data.length; i++) {

        var currentTweet = data[i];
        if (!idStrings[currentTweet.id_str] ) {
        	// console.log(currentTweet.text);

        	if ((new RegExp(who, 'i')).exec(currentTweet.text)) {
	        	idStrings[currentTweet.id_str] = true;

	          var tweetObj = {};
	          tweetObj.user = currentTweet.user.screen_name;
	          tweetObj.id = currentTweet.id;

	          var str = currentTweet.text;
	          var pattern = /\B@[a-z0-9_-]+/gi;
						var matches = str.match(pattern);
						var index = matches.indexOf(mikeJonesCellNumber);
						tweetObj.otherMentions = matches.splice(index, 1);

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
  for(var i = 0; i < latestMentions.length; i++) {
    var currentMention = latestMentions[i];
    //responseTweet is the string we will send to Twitter to tweet for us
    var responseTweet = 'MIKE JONES ' + '  @' + currentMention.user;

    for(var i = 0; i < currentMention.otherMentions.length; i++) {
    	responseTweet += ' ' + currentMention.otherMentions[i];
    }

    //Twit will now post this responseTweet to Twitter. This function takes a string and a callback
    T.post('statuses/update', { status: responseTweet, in_reply_to_status_id: currentMention.id }, function(err, data, response) {
      if (err) {
      	console.log(err + ' on tweet id: ' + currentMention.id);
      } else {
      	console.log('tweeted at ' + currentMention.user + ' / tweet id: ' + currentMention.id);
      }
    })
  }
};

checkThrottled(function(requestsRemaining) {
	if (requestsRemaining.mentions > 1) {
		getMentions();
	}
})

// Once a minute from 9am to 6pm EST. Giving an extra minute to make sure we sleep for 6 hours
// 0-58 9-23,0-3 * * * would be EST, but UTC is below b/c that's what heroku runs off
// var j = schedule.scheduleJob('0-58 14-23,0-8 * * *', function() {
// 	checkThrottled(function(requestsRemaining) {
// 		if (requestsRemaining.mentions > 1) {
// 			getMentions();
// 		}
// 	})
// });
