// Aryaman TEST
import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import Box from './neumorphButton';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux'
import { GET_CHATROOMS, GET_TOP_DISPLAY, GET_FRIENDS , GET_REPLICA ,GET_FRIENDS_REPLICA} from '../redux/userRedux'
import firestore from '@react-native-firebase/firestore'

var unsubscribe = []

class openingScreen extends Component {

  hrsAgo(time) {
    var now = new Date()
    var date = new Date(time)
    var now_year = now.getFullYear()
    var now_month = now.getMonth()
    var now_days = now.getDate()
    var now_weekday = now.getDay()
    //////////////////////////////
    var year = date.getFullYear()
    var month = date.getMonth()
    var days = date.getDate()

    if (+now_year - year >= 1 || +now_month - month >= 1 || +now_days - days > 3) {
      return (`${days}/${month}/${year}`)
    }
    else if (+now_days - days == 3) {
      switch (now_weekday) {
        case 0:
          return ('Thursday')
        case 1:
          return ('Friday')
        case 2:
          return ('Saturday')
        case 3:
          return ('Sunday')
        case 4:
          return ('Monday')
        case 5:
          return ('Tuesday')
        case 6:
          return ('Wednesday')
      }
    }
    else if (+now_days - days == 2) {
      switch (now_weekday) {
        case 0:
          return ('Friday')
        case 1:
          return ('Saturday')
        case 2:
          return ('Sunday')
        case 3:
          return ('Monday')
        case 4:
          return ('Tuesday')
        case 5:
          return ('Wednesday')
        case 6:
          return ('Thursday')
      }
    }
    else if (+now_days - days == 1) {
      return ('Yesterday')
    }
    else if (+now_days - days == 0) {
      var now_hours = now.getHours()
      var now_minutes = now.getMinutes()
      ///////////////
      var hours = date.getHours()
      var minutes = date.getMinutes()

      var hours_diff = +now_hours - hours
      var minutes_diff = +now_minutes - minutes

      if (hours_diff == 1) {
        return ('an hour ago')
      }
      else if (hours_diff > 1) {
        return (`${hours_diff} hours ago`)
      }
      else if (minutes_diff <= 1) {
        return ('just now')
      }
      else if (minutes_diff > 1) {
        return (`${minutes_diff} minutes ago`)
      }
    }
  }

  getFriends(data) {
    var fire
    fire = firestore().collection('users').where('friends', 'array-contains', `${data}`)
      .onSnapshot(snapshot => {
        var friends = {}
        var replica = []
        snapshot.forEach(doc => {
          console.log("DOC>DATA",doc.data)
          var curr = {}
          curr['id'] = doc.id
          curr['data'] = doc.data()
          replica.push(curr)
          friends[doc.id] = doc.data()
        })
        // console.log("FRIENDS",friends)
        this.props.dispatch({
          type: GET_FRIENDS_REPLICA,
          payload: replica
        })
        this.props.dispatch({
          type: GET_FRIENDS,
          payload: friends
        })
      }, err => {
        console.log(err)
      })
  }

  getChatrooms(data) {

    var fire
     fire = firestore().collection('chatrooms').where('members', 'array-contains', `${data}`).orderBy('last_time', 'desc')
      .onSnapshot(snapshot => {
        var chat = []
        var top = []
        var replica = {}
        var i = 0
        snapshot.forEach((doc) => {
          var curr = {}
          curr['id'] = doc.id
          curr['data'] = doc.data()
          replica[doc.id] = doc.data()
          chat.push(curr)
          if (i < 5) {
            top.push(curr)
          }
          i += 1
        })
        this.props.dispatch({
          type: GET_CHATROOMS,
          payload: chat
        })
        this.props.dispatch({
          type: GET_TOP_DISPLAY,
          payload: top
        })
        this.props.dispatch({
          type: GET_REPLICA,
          payload: replica
        })
      }, err => {
        console.log(err)
      })

      unsubscribe.push(fire)

  }

  componentDidMount() {

    this.getFriends(this.props.user.userinfo.username)
    this.getChatrooms(this.props.user.userinfo.username)

  }

  componentWillUnmount() {
    for(var i=0;i<unsubscribe.length;i+=1) {
      unsubscribe[i]()
    }
  }

  render() {
    if (this.props.user.friends === undefined) {
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#EA7A7F" />
        </View>
      )
    }
    else if(this.props.user.friends !== undefined) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(234,235,243,1)',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginRight: 10,
              marginLeft: 15,
            }}>
            <TouchableOpacity onPress={() => {
              this.props.navigation.navigate('addUser')
            }}>
              <Box height={50} width={50} borderRadius={10}>
                <View
                  style={{
                    height: 50,
                    width: 50,
                    borderRadius: 10,
                    backgroundColor: '#eaebf3',
                    alignSelf: 'center',
                    borderWidth: 1,
                    borderColor: '#e5e5e5',
                  }}>
                  <Icon
                    name="user-plus"
                    color="#7f7f7f"
                    size={35}
                    style={{ alignSelf: 'center', marginTop: 5 }}
                  />
                </View>
              </Box>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 25,
                color: '#4e7bb4',
                alignSelf: 'center',
              }}>
              Messaging
            </Text>
            <Box height={50} width={50} borderRadius={10}>
              <View
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 10,
                  backgroundColor: '#eaebf3',
                  alignSelf: 'center',
                  borderWidth: 1,
                  borderColor: '#e5e5e5',
                }}>
                <Icon
                  name="search"
                  color="#7f7f7f"
                  size={30}
                  style={{ alignSelf: 'center', marginTop: 10 }}
                />
              </View>
            </Box>
          </View>
          <View
            style={{
              borderBottomColor: '#BFBFBF',
              borderBottomWidth: 2,
              width: '100%',
              marginTop: 10,
              opacity: 0.2,
            }}
          />
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 30,
              color: '#36454f',
              opacity: 0.75,
              marginTop: 10,
              marginLeft: 15,
            }}>
            Chat Section
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 15,
              color: '#36454f',
              opacity: 0.35,
              marginLeft: 15,
              width: '80%',
              marginBottom: 10,
            }}>
            A place to connect with your close ones.
          </Text>
          {/* Nothing for you to do in the above code, just UI stuff. Place yout logic below. */}
          {/* ~~~~~ USE FLATLIST HERE AND USE THIS CHATBUTTON AS A RENDER ITEM AND USE DATA TO PASS THE PROPS ~~~~~ */}
          <SafeAreaView>
            <FlatList
              keyExtractor={item => item.id}
              data={this.props.user.chatrooms}
              showsVerticalScrollIndicator={false}
              renderItem={({ item}) => {
                var time = item.data.last_time
                var last_msg = item.data.last_message
                var msg = last_msg.substring(0, 10)
                if (last_msg !== msg) {
                  last_msg = msg + '...'
                }
                time = this.hrsAgo(time)
                if (item.data.title === '') {
                  var name = item.id.split("_")
                  if (name[0] == this.props.user.userinfo.username) {
                    item.data.title = name[1]
                  }
                  else {
                    item.data.title = name[0]
                  }
                }
                var photo
                if (item.data.photoUrl === undefined) {
                  photo = this.props.user.friends[item.data.title]['photoUrl']
                }
                else {
                  photo = item.data.photoUrl
                }
  
                var onlineCount  = 0
  
                for(var i =0 ; i< item.data.members.length ; i+=1) {
                  if(item.data.members[i] !== this.props.user.userinfo.username) {
                    if(this.props.user.friends[item.data.members[i]] !== undefined) {
                      if(this.props.user.friends[item.data.members[i]]['online'] === 'online') {
                        onlineCount+=1
                      }
                      if(onlineCount > 0) {
                        break;
                      }
                    }
                    
                    // console.log("MEMBERS",this.props.user.friends[item.data.members[i]]['online'])
                  }
                }
  
                return (
                  <ChatButton
                    openMessage={() => this.props.navigation.navigate('messageScreen', {
                      id: item.id,
                      isGroup: item.data.isGroup,
                      members: item.data.members,
                      title: item.data.title,
                      last_message: item.data.last_message,
                      last_time: item.data.last_time,
                      photoUrl: photo
                    })} // Using react-navigation version 4.x i had define AMessageScreen in the navigation section you can change this accordingly.
                    navigateToStories={this.dummy}
                    profilePic={photo}
                    username={item.data.title}
                    lastMessage={last_msg}
                    time={time}
                    noOfNewMsg={this.props.user.unread[`${item.id}`]}
                    onlineCount = {onlineCount}
                  />
                )
              }}
            />
          </SafeAreaView>
        </View>
      );
    }
    
  }
}
// Chat Button opens chat takes props as follows:
// 1. openMessage: Function to navigate to individual Chat Screen, on clicking on the button.
// 2. navigateToStories: Function to navigate to Stories (if present), on clicking on the profile pic.
// 3. username: The Username
// 4. lastMessage: Last message keeps the number of characters under
// 5. msgSeen: Boolean if true, will show time and number of unseen message in color. Otherwise just time in grey.
// 6. time: Supply time this accordingly.
// 7. noOfNewMsg: Shows the number of unseen messages in color.
// 8. profilePic: the link to profile pic. If uri: send as "{uri: item.profilePic}", item.profilPic is a string as the link. If local
//    send as "require('../../Assets/abc.jpg')"
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class ChatButton extends Component {
  render() {
    const screenWidth = Math.round(Dimensions.get('window').width);
    return (
      <Box
        height={80}
        width={0.9 * screenWidth}
        borderRadius={15}
        style={[{ marginLeft: 10, alignSelf: 'center' }, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={this.props.openMessage}
          style={{
            height: 80,
            width: 0.9 * screenWidth,
            borderWidth: 1,
            borderColor: '#e5e5e5',
            justifyContent: 'center',
            backgroundColor: '#eaebf3',
          }}>
          <View
            style={{
              marginTop: 15,
              justifyContent: 'space-around',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={this.props.navigateToStories}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  colors={['#EA688A', '#EA7A7F']}
                  style={{
                    height: 50,
                    borderRadius: 25,
                    width: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {this.props.onlineCount > 0 && 
                    <Image
                    source={{ uri: this.props.profilePic }}
                    style={{
                      width: 47,
                      height: 47,
                      borderRadius: 28.5,
                      borderColor: 'rgb(0, 153, 153)',
                      borderWidth: 2,
                      overflow: 'hidden',
                    }}
                  />
                  }
                  {this.props.onlineCount === 0 && 
                    <Image
                    source={{ uri: this.props.profilePic }}
                    style={{
                      width: 47,
                      height: 47,
                      borderRadius: 28.5,
                      borderColor: 'rgba(234,235,243,1)',
                      borderWidth: 2,
                      overflow: 'hidden',
                    }}
                  />
                  }
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    textAlign: 'left',
                    fontWeight: 'bold',
                    opacity: 0.8,
                  }}>
                  {this.props.username}
                </Text>
                <Text
                  style={{
                    opacity: 0.4,
                    marginTop: 5,
                  }}>
                  {this.props.lastMessage}
                </Text>
              </View>
            </View>
            {this.props.noOfNewMsg ? (
              <View>
                <Text
                  style={{
                    color: '#EA7A7F',
                    fontWeight: 'bold',
                    marginTop: -10,
                  }}>
                  {this.props.time}
                </Text>
                <Text
                  style={{
                    width: 35,
                    backgroundColor: '#EA7A7F',
                    borderRadius: 10,
                    paddingHorizontal: 2,
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 12,
                    marginTop: 5,
                    alignSelf: 'center',
                  }}>
                  {this.props.noOfNewMsg
                    .toLocaleString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                </Text>
              </View>
            ) : (
                <View style={{ marginTop: -30 }}>
                  <Text style={{ color: '#7F7F7F' }}>{this.props.time}</Text>
                </View>
              )}
          </View>
        </TouchableWithoutFeedback>
      </Box>
    );
  }
}

const mapStateToProps = (state) => {
  return (
    {
      user: state.user
    }
  )
}

export default connect(mapStateToProps)(openingScreen)
