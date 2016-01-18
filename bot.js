// Our Twitter library
var Twit = require('twit');

// We need to include our configuration file
var T = new Twit(require('./config.js'));

function checkThrottled() {
	T.get('application/rate_limit_status', {resources: 'statuses'}, function (err, data, response) {
		// console.log(JSON.stringify(data));
		console.log(data.resources.statuses['/statuses/mentions_timeline'].remaining);
		// console.log(data);
	})
}

checkThrottled();

//////////////////////////////////////////////

//twitter data
var latestMentions = [];  
var idStrings = {};


app.get('/*', function(req, res){  
  res.send('Hello World');
});

var server = app.listen(port, function(){  
  console.log('Basic server is listening on port ' + port);
});

var getMentions = function(){  
  twit.get('/statuses/mentions_timeline.json', {count: 10}, function(data){
    if(data.length){
      for(var i = 0; i < data.length; i++){
        var currentTweet = data[i];
        if(!idStrings[currentTweet.id_str]){
        	idStrings[currentTweet.id_str] = true;

        	//
        	// Do regex for "who" here, and if found, then add to latestmentions


          var tweetObj = {};
          tweetObj.user = currentTweet.user.screen_name;
          tweetObj.text = currentTweet.text;
          latestMentions.push(tweetObj);
        }
      }
      //response to new mentions
      replyToMentions();
    } 
    else{
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
    //responseTweet is the string we will send to twitter to tweet for us
    var responseTweet = 'Hello @';
    responseTweet += currentMention.user;
    responseTweet += '\nI hope you are having a wonderful day! \n-Your Favorite Node Server';

    //twit will now post this responseTweet to twitter. This function takes a string and a callback
    twit.updateStatus(responseTweet, function(){
      console.log(responseTweet);
    });
  }
};

getMentions();

