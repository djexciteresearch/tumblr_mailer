var tumblr = require('tumblr.js');

var client = tumblr.createClient({
  consumer_key: 'eIf9sNIziyMQrvDCFrmYZ3bYgrwKf3RGUqDm2x1kzb5ujJ2ahb',
  consumer_secret: '6Ihrbzpk1nd3HlbFoCtGqUdoAtIkTdi7J9Glv1Yz6XIKuWsoDX',
  token: 'F0Duu9D4l5IXGWPTuDCmlNcE20YdT3uNhueVic5WG6i7d5fdI1',
  token_secret: 'h4IsX34K4w5vJbwMWAwKrZGW6lILMO2H4TemDDGJVCUby7rQRd'
});

var postObj={};
var latestPosts=[];
client.posts('exciteresearch.tumblr.com', function(err, blog){
	// array of objects - posts and blog
	var postsArr = [];
	var d = new Date();
	var todayMsec = d.getTime(); 
	
	postsArr=blog.posts.filter(function(postObj){
		var postMsec = Date.parse(postObj.date);
		if(604800000 > (todayMsec-postMsec)){ //604800000 msec = 7 days
			return true;
		}
		return false;
	}).slice();
	
	for(var i=0;i<postsArr.length;i++){
		postObj={};
		postObj.title = postsArr[i].title;
		postObj.href = postsArr[i].short_url;
		latestPosts.push(postObj);
	}
	console.log("inside latestPosts=");
	console.log(latestPosts);
});
console.log("outside latestPosts=");
console.log(latestPosts);
