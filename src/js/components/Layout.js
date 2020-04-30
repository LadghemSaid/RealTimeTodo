import React from "react";
import ReactDOM from "react-dom"
import {connect} from 'react-redux'
import {
    loadInitialDataSocket, addNewItemSocket, markItemCompleteSocket, markAllItemSocket, deleteAllItemSocket
    , AddItem, CompleteItem, DeleteAllItem, MarkAllItem
} from '../actions/action'
import io from "socket.io-client"

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import LinearProgress from '@material-ui/core/LinearProgress';
// import {List as List} from 'immutable';


let robotFontStyle = {
    fontFamily: "Roboto, sans-serif",
    color: "rgba(0, 0, 0, 0.870588)"
}
let markCompleteStyle = {
    textDecoration: "line-through"
}
let socket
const mapStateToProps = (state = {}) => {
    // console.dir(state)
    return {...state};

};

export class Layout extends React.Component {
    constructor(props) {
        super(props)
        const {dispatch} = this.props
        this.state = {progress: 0};

        socket = io.connect("http://localhost:3000")
        // console.log(socket)
        dispatch(loadInitialDataSocket(socket))

        socket.on('itemAdded', (res) => {
            console.log('Layouts.js itemAdded ::', res)
            dispatch(AddItem(res))
        })

        socket.on('allItemDeleted', (res) => {
            this.progress([])

            console.log('Layouts.js allItemDeleted ::', res)
            dispatch(DeleteAllItem(res))
        })

        socket.on('allItemMarked', (res) => {

            console.log('Layouts.js allItemMarked ::', res)
            dispatch(MarkAllItem(res))
        })

        socket.on('itemMarked', (res) => {

            console.log('Layouts.js itemMarked ::', res)
            dispatch(CompleteItem(res))
        })

    }

    progress(items) {
        const checked = items.filter(todo => todo.completed == true).size;
        const total = items.size;
        console.log('total:',total,'checked:',checked)
        if(total === 0){
           return this.setState({
               progress: 0
           })
        }else{
            let tmp = checked / total * 100;
            this.setState({
                progress: tmp
            })
        }


    };

    componentWillUnmount() {
        socket.disconnect()
        alert("Disconnecting Socket as component will unmount")
    }

    componentDidMount() {

    }
    componentWillReceiveProps(nextProps){
        console.log()
        const {items} = nextProps
        this.progress(items)
    }

    render() {

        const {dispatch, items} = this.props
        items.map((todo, key) => {
            //  console.log("Layout.js All todo::", todo)
        })
        return (
            <div>
                <h1 style={robotFontStyle}>React TO-DO </h1>

                <Divider/>
                <TextField
                    hintText="Titre du post it"
                    floatingLabelText="Ajouter un titre"
                    ref="newTodoTitle"
                />
                <TextField
                    hintText="Description du post it"
                    floatingLabelText="Ajouter une description"
                    ref="newTodoDescription"
                />
                <RaisedButton
                    label="Cliquer pour ajouter" primary={true}
                    onClick={() => {
                        const newTodoTitle = ReactDOM.findDOMNode(this.refs.newTodoTitle.input).value
                        const newTodoDescription = ReactDOM.findDOMNode(this.refs.newTodoDescription.input).value
                        const newItem = {
                            title: newTodoTitle,
                            description: newTodoDescription
                        }

                        newTodoTitle === "" || newTodoDescription === "" ? alert("Un champ n'est pas remplie")
                            : dispatch(addNewItemSocket(socket, items.size, newItem))

                        ReactDOM.findDOMNode(this.refs.newTodoTitle.input).value = ""
                        ReactDOM.findDOMNode(this.refs.newTodoDescription.input).value = ""
                    }
                    }
                />

                <RaisedButton
                    label="Supprimer tout les post it" secondary={true}
                    onClick={() => {
                        dispatch(deleteAllItemSocket(socket))

                    }
                    }
                />
                <RaisedButton
                    label="Cochez tout les post it" default={true}
                    onClick={() => {
                        dispatch(markAllItemSocket(socket, true))
                    }}
                />
                <LinearProgress variant="determinate" value={this.state.progress} color="secondary"/>

                <List>{items.map((todo, key) => {
                    return <ListItem key={key} style={todo.completed ? markCompleteStyle : {}}
                                     onClick={(event) => {
                                         dispatch(markItemCompleteSocket(socket, key + 1, !todo.completed))
                                     }}
                                     primaryText={todo.title}>
                        {todo.description}
                    </ListItem>
                })
                }</List>

            </div>
        );
    }
}

export default connect(mapStateToProps)(Layout)
