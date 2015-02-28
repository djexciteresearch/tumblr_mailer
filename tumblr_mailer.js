var fs = require('fs');
var ejs = require('ejs');
var csvFile = fs.readFileSync("friend_list.csv","utf8");
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  consumer_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  token_secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
});
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
//var mandrill_client = new mandrill.Mandrill('jSURv4V9tE3YR2dicC3h7w');

// Make the request
client.userInfo(function (err, data) {
    // ...
});
var emailTemplate= fs.readFileSync("email_template.ejs","utf8");
//var emailTemplate= fs.readFileSync("email_template.html","utf8");

/* Start csvParse - Parse CSV Files Assignment */
var csvParse = function (csvFile) {
	/** Parse CSV Files
	 * csvParse that takes a CSV file(our csvFile variable) as an 
	 * argument and parses the lines of the CSV file into an Array of Objects. 
	 * The keys of each object should be: 
	 * firstName, lastName, numMonthsSinceContact and emailAddress.
	 * 
	 * returns 
[ 
  { firstName: 'Scott',
    lastName: 'D\'Alessandro',
    numMonthsSinceContact: '0',
    emailAddress: 'scott@fullstackacademy.com' 
  }
]
	 */
	//parse the header
	var record = "", data = {}, headerStr = "", dataArray=[];
	headerStr = csvFile.slice(0,csvFile.indexOf('\n')); //isolate header as string
	headerStr = headerStr.split(","); //make an array of all the header columns
	csvFile = csvFile.slice(csvFile.indexOf('\n')+1,csvFile.length);
	for(var i=0;i<csvFile.length;i++){
		//data.length will run to zero as data is parsed
		record = csvFile.slice(0,csvFile.indexOf('\n')).split(",");
		//for each line after the header, create an object in the array with the headers as keys
		for(var j=0;j<headerStr.length;j++){
			data[headerStr[j]]=record[j];
		}
		dataArray.push({});
		for(var key in data){
			dataArray[i][key]=data[key];
		}
		csvFile = csvFile.slice(csvFile.indexOf('\n')+1,csvFile.length);
	}
	return dataArray;
}
/* End csvParse - Parse CSV Files Assignment */
/* Start Tubmlr latestPosts API Assignment */
friendList = csvParse(csvFile);

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
	for(var i=0;i<friendList.length;i++){
		friendList.latestPosts=[];
		friendList.latestPosts.push(latestPosts);
	}
	/* Start EJS - Template Engine Assignment  */
	friendList.forEach(function(row){

	    var firstName = row["firstName"];
	    var numMonthsSinceContact = row["numMonthsSinceContact"];
	    var customizedTemplate = ejs.render(emailTemplate, 
	            { "firstName": firstName,  
	              "numMonthsSinceContact": numMonthsSinceContact,
	              "latestPosts": latestPosts
	            });
	    var to_name=firstName+row["lastName"];
	    var to_email=row["emailAddress"];
	    var from_name="DJ";
	    var from_email="dj@exciteresearch.com";
	    var subject="Excite Research Blog Update - Fullstack Academy";
	    var message_html=customizedTemplate;
	    sendEmail(to_name, to_email, from_name, from_email, subject, message_html);
	})
	/* End EJS - Template Engine Assignment */	
});

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
	var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result){
	        // console.log(message);
	        // console.log(result);   
    	}, function(e) {
	        // Mandrill returns the error as an object with name and message keys
	        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
	        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    	}
	);
}