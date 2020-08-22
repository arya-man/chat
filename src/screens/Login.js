import React,{Component} from 'react'
import {Text,View,TextInput,Button} from 'react-native'
import {connect} from 'react-redux'
import auth from '@react-native-firebase/auth'
import {persistor} from '../redux'

import {getUser} from '../redux/userRedux'

class Login extends Component {
    constructor(props) {
        super(props)
        this.state = {
            email:'',
            password:'',
            date: undefined
        }
    }

   async componentDidMount() {
        await persistor.purge()
        console.log("LOGIN MOUNTED PROPS",this.props.user)
    }

    render() {
        
        return(
            <View>
                <Text style={{fontSize:50}}>LOGIN</Text>
                <TextInput
                    style={{
                        borderColor:"black",
                        borderWidth:3,
                        borderRadius:10
                    }}
                    placeholder="E-MAIL"
                    onChangeText= {(text) => {this.setState({email:text})}}
                />

                    <TextInput
                    style={{
                        borderColor:"black",
                        borderWidth:3,
                        borderRadius:10
                    }}
                    placeholder="PASSWORD"
                    onChangeText= {(text) => {this.setState({password:text})}}
                />

                <Button title="LOGIN" onPress = {() => {
                    auth().signInWithEmailAndPassword(this.state.email,this.state.password)
                        .then(() => {
                            this.props.getUser(auth().currentUser.uid)
                        })
                        .catch(err => console.log(err))
                }}/>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return (
        {
            user:state.user
        }
    )
}

export default connect(mapStateToProps,{getUser})(Login)