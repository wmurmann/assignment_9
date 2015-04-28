var express = require('express');
var app = express();
var server = app.listen(1337,function(){
	console.log('ready on port 1337');
});
var mongoose = require("mongoose");
var io = require('socket.io')(server);
server.listen(3000);


app.set('view engine','ejs');
app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());


// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

app.get('/',function (req,res) {
	res.render('index');
});

app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
		res.json(toDos);
    });
});
io.sockets.on('connection', function(socket){ 
	socket.on('post_todo', function(req) {
	    var newToDo = new ToDo({description:req.description, tags:req.tags});
	    newToDo.save(function (err, result) {
			if (err !== null) 
			{
			    // the element did not get saved!
			    console.log(err);
			} 
			else 
			{
			    ToDo.find({}, function (err, result) {
					if (err !== null) 
					{
					    // the element did not get saved!
					}

					io.sockets.emit('update_todo', result);
			    });
			}
	    });
	});
});

