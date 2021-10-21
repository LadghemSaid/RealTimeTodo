

export const AddItem = (data) => ({
	type: "ADD_ITEM",
	title: data.title,
	description: data.description,
	itemId:data.id,
	completed:data.completed
})


export const DeleteAllItem = (data) => ({
	type: "DELETE_ALL_ITEMS",
})

export const MarkAllItem = (data) => ({
	type: "MARK_ALL_ITEMS",
	completed:data.completed
})

export const CompleteItem = (data) => ({
	type: "COMPLETED_ITEM",
	itemId: data.id,
	completed:data.completed
})

/* Used only by actions for sockets */
export const InitialItems = (res) => {
	console.log("initialItems ::",res)
	return({
		type: "INITIAL_ITEMS",
		items: res
	})
}

/***************************************************************************************** */
/* Async Action items using - Sockets													   */
/***************************************************************************************** */
export const loadInitialDataSocket = (socket) => {
	return (dispatch) => {
		// dispatch(clearAllItems())
		socket.on('initialList',(res)=>{
		   console.log('initialList ::',res)
		   dispatch(InitialItems(res))
	   })
	}	
}

export const addNewItemSocket = (socket,id,item) => {
	return (dispatch) => {
		let postData = {
				id:id+1,
				title:item.title,
				description:item.description,
				completed:false
		     }
	    socket.emit('addItem',postData)		
	}	
}

export const markItemCompleteSocket = (socket,id,completedFlag) => {
	return (dispatch) => {
		let postData = {
				id:id,
				completed:completedFlag
		     }
		socket.emit('markItem',postData)
	}	
}

export const markAllItemSocket = (socket,completedFlag) => {
	return (dispatch) => {
		let postData = {
			completed:completedFlag
		}
		socket.emit('markAll',postData)
	}
}

export const deleteAllItemSocket = (socket) => {
	return (dispatch) => {
		socket.emit('deleteAll',null)
	}
}



