const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const autoIncrement = require('mongoose-auto-increment')
const http = require('http')
const socketServer =require('socket.io')

const app = express();

const todoModel = require('./models/todoModel')  //todo model

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// MONGOOSE CONNECT
// ===========================================================================
mongoose.connect('mongodb://localhost:27017/todoApp')

var db = mongoose.connection
db.on('error', ()=> {console.log( '---FAILED to connect to mongoose')})
db.once('open', () => {
	console.log( '+++ connected to mongoose')
})

var serve = http.createServer(app);
var io = socketServer(serve);
serve.listen(3000,()=> {console.log("+++Express Server with Socket Running!!!")})


/***************************************************************************************** */
/* Socket logic starts here																   */
/***************************************************************************************** */
const connections = [];
io.on('connection', function (socket) {
	console.log("Connected to Socket!!"+ socket.id)	
	connections.push(socket)
	socket.on('disconnect', function(){
		console.log('Disconnected - '+ socket.id);
	});

	var cursor = todoModel.find({},"-_id itemId item completed",(err,result)=>{
				if (err){
					console.log("---GET failed!!")
				}
				else {
					socket.emit('initialList',result)
					console.log("+++GET worked!!")
				}
			})
	socket.on('addItem',(addData)=>{
		var todoItem = new todoModel({
			itemId:addData.id,
			item:addData.item,
			completed: addData.completed
		})

		todoItem.save((err,result)=> {
			if (err) {console.log("--- ADD NEW ITEM failed!! " + err)}
			else {
				io.emit('itemAdded',addData)

				console.log({message:"+++ ADD NEW ITEM worked!!"})
			}
		})
	})

	socket.on('deleteAll',(addData)=>{

		todoModel.deleteMany({},(err,result)=> {
			if (err) {console.log("--- DELETE ALL ITEM failed!! " + err)}
			else {
				io.emit('allItemDeleted',addData)

				console.log({message:"+++ DELETE ALL ITEM worked!!"})
			}
		})
	})

	socket.on('markItem',(markedItem)=>{
		var condition   = {itemId:markedItem.id},
			updateValue = {completed:markedItem.completed}

		todoModel.update(condition,updateValue,(err,result)=>{
			if (err) {console.log("--- MARK COMPLETE failed!! " + err)}
			else {
				io.emit('itemMarked',markedItem)

				console.log({message:"+++MARK COMPLETE worked!!"})
			}
		})
	})
	
});
