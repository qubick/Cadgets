var express = require("express")
var app = express();
var fs = require("fs");
var http = require("http");
const PORT = process.env.PORT;

var reqIdx = 0;

//server main page1 - video stream based
app.get("/", (req, res) => {
	res.sendfile('index.html')
});

app.get("/test", (req, res) => {
	res.sendfile('test.html')
});

// app.listen(PORT, () => {
// 	console.log("Cadgets app listening on port: ", PORT)
// });

app.listen(7000, () => {
	console.log("Cadgets app listening on port: ", 7000)
});

app.post("/user/add", function(req, res){
	res.send("OR");
});

app.get(/^(.+)$/, function(req, res){
	console.log('static file requre: ' + req.params);
	res.sendFile(__dirname + req.params[0]);
});
