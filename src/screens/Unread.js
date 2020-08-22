import React, { Component } from 'react'
import { View, Text, Button, TouchableOpacityBase } from 'react-native'
import { connect } from 'react-redux'
import { getUnread } from '../redux/userRedux'
import database from '@react-native-firebase/database'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'

class Unread extends Component {

    constructor(props) {
        super(props)
        this.state = {
            unreadCount: 0
        }
    }

    onlineORoffline = () => {

        console.log("HERE")

        var uid = auth().currentUser.uid;

        // Create a reference to this user's specific status node.
        // This is where we will store data about being online/offline.
        var userStatusDatabaseRef = database().ref('/status/user1')
        // We'll create two constants which we will write to 
        // the Realtime database when this device is offline
        // or online.
        var isOfflineForDatabase = {
            state: 'offline',
            last_changed: database.ServerValue.TIMESTAMP,
        };

        var isOnlineForDatabase = {
            state: 'online',
            last_changed: database.ServerValue.TIMESTAMP,
        };

        // Create a reference to the special '.info/connected' path in 
        // Realtime Database. This path returns `true` when connected
        // and `false` when disconnected.
        database().ref('.info/connected').on('value', function (snapshot) {
            // If we're not currently connected, don't do anything.
            if (snapshot.val() == false) {
                return;
            };

            // If we are currently connected, then use the 'onDisconnect()' 
            // method to add a set which will only trigger once this 
            // client has disconnected by closing the app, 
            // losing internet, or any other means.
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
                // The promise returned from .onDisconnect().set() will
                // resolve as soon as the server acknowledges the onDisconnect() 
                // request, NOT once we've actually disconnected:
                // https://google.com/docs/reference/js/database.OnDisconnect

                // We can now safely set ourselves as 'online' knowing that the
                // server will mark us as offline once we lose connection.
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });

        ////////////////////////////////

        // var isOfflineForDatabase = {
        //     state: 'offline',
        //     last_changed: database.ServerValue.TIMESTAMP,
        // };

        // var userStatusFirestoreRef = firestore().collection('users').doc(`${this.props.user.userinfo.username}`)

        // // Firestore uses a different server timestamp value, so we'll 
        // // create two more constants for Firestore state.
        // var isOfflineForFirestore = {
        //     state: 'offline',
        //     last_changed: firestore.FieldValue.serverTimestamp(),
        // };

        // var isOnlineForFirestore = {
        //     state: 'online',
        //     last_changed: firestore.FieldValue.serverTimestamp(),
        // };

        // database().ref('.info/connected').on('value', function (snapshot) {
        //     if (snapshot.val() == false) {
        //         // Instead of simply returning, we'll also set Firestore's state
        //         // to 'offline'. This ensures that our Firestore cache is aware
        //         // of the switch to 'offline.'
        //         userStatusFirestoreRef.update({
        //             online: 'offline'
        //         });
        //         return;
        //     };

        //     userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function () {
        //         userStatusDatabaseRef.set(isOnlineForDatabase);

        //         // We'll also add Firestore set here for when we come online.
        //         userStatusFirestoreRef.update({
        //             online: 'online'
        //         });
        //     });
        // });
    }

    componentDidMount() {
        // this.onlineORoffline()
        this.props.getUnread(this.props.user.userinfo.username)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.user.unread !== prevProps.user.unread) {
            var count = 0
            var obj = this.props.user.unread
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (obj[key] > 0) {
                        count = count + 1
                    }
                }
            }
            this.setState({ unreadCount: count })
        }
    }

    render() {
        return (
            <View>
                <Text style={{ fontSize: 50 }}>Unread Count {this.state.unreadCount}</Text>
                <Button title="TO CONVOS"
                    onPress={() => { this.props.navigation.navigate('openingScreen') }}
                />

            </View>
        )
    }
}




const mapStateToProps = (state) => {
    return (
        {
            user: state.user
        }
    )
}

export default connect(mapStateToProps, { getUnread })(Unread)