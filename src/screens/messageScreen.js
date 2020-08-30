import React, { Component, createRef } from 'react';
import {
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Button,
  TouchableHighlightBase
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Box from './neumorphButton';
import CBox from './customizableNeuButton';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const screenWidth = Math.round(Dimensions.get('window').width);
import { withNavigation } from 'react-navigation'

import { connect } from 'react-redux'
import { GET_INITIAL_MESSAGES, GET_REALTIME_MESSAGES, GET_MORE_MESSAGES } from '../redux/userRedux'
import firestore from '@react-native-firebase/firestore'
import Clipboard from '@react-native-community/clipboard'

var unread

class messageScreen extends Component {
  dummy = () => {
    console.log('sjdj');
  };

  constructor(props) {
    super(props)
    this.initIndex = undefined
    this.typeStatus = false
    this.state = {
      listenStart: undefined,
      message: undefined,
      typing: undefined,
      loading: false,
      typeStatus: false,
      topDisplay: undefined
    }
    this.onlineCount = 0
  }

  typingStatus() {
    // console.log("CHATROOMS",this.props.user.chatrooms)
    var arr = JSON.parse(JSON.stringify(this.props.user.replica[this.props.navigation.getParam('id')]['typing']))
    var identifiers = Object.keys(arr)

    var active = identifiers.filter(function (id) {
      return arr[id]
    })

    active = active.filter((value) => {
      if (value !== this.props.user.userinfo.username) {
        return value
      }
    })

    if (active.length > 2) {
      this.setState({ typing: 'several are typing...' })
    }
    else if (active.length == 2) {
      this.setState({ typing: `${active[0]} and ${active[1]} are typing...` })
    }
    else if (active.length == 1) {
      this.setState({ typing: `${active[0]} is typing...` })
    }
    else {
      var ans = this.getOnline()
      this.setState({ typing: ans })
    }
  }

  getOnline() {
    this.onlineCount = 0
    var arr = []
    var onlineArr = []
    if (this.props.navigation.getParam('members').length > 2) {
      for (var i = 0; i < this.props.navigation.getParam('members').length; i += 1) {
        if (this.props.navigation.getParam('members')[i] !== this.props.user.userinfo.username) {
          arr.push(this.props.navigation.getParam('members')[i])
        }
      }

      for (var i = 0; i < arr.length; i += 1) {
        if (this.props.user.friends[arr[i]] !== undefined) {
          if (this.props.user.friends[arr[i]]['online'] === 'online') {
            onlineArr.push(arr[i])
          }
          if (onlineArr.length > 2) {
            break;
          }
        }
      }

      if (onlineArr.length === 0) {
        return 'no one is online'
      }
      else if (onlineArr.length === 1) {
        return `${onlineArr[0]} is online`
      }
      else if (onlineArr.length === 2) {
        return `${onlineArr[0]} and ${onlineArr[1]} are online`
      }
      else {
        return 'several are online'
      }

    }
    else {
      for (var i = 0; i < this.props.navigation.getParam('members').length; i += 1) {
        if (this.props.navigation.getParam('members')[i] !== this.props.user.userinfo.username) {
          return `${this.props.user.friends[this.props.navigation.getParam('members')[i]]['online']}`
        }
      }
    }
  }


  clearUnread() {
    firestore().collection('unread')
      .doc(`${this.props.user.userinfo.username}`)
      .update({
        [this.props.navigation.getParam('id')]: 0
      })
  }

  setUnread() {
    var xyz = [...this.props.navigation.getParam('members')]
    var arr = xyz.filter((value) => {
      if (value !== this.props.user.userinfo.username) {
        return value
      }
    })
    var batch = firestore().batch()
    for (var i = 0; i < arr.length; i += 1) {
      batch.update(firestore().collection('unread').doc(`${arr[i]}`), {
        [this.props.navigation.getParam('id')]: firestore.FieldValue.increment(1)
      })
    }
    batch.commit()
      .then(() => {
        console.log("SUCCESS COMMIT")
      })
      .catch(() => {
        console.log("FAILURE COMMIT")
      })
  }

  setLastMessage(msg, time) {
    console.log("SET LAST MESSAGE TIME",time)
    firestore().collection('chatrooms')
      .doc(`${this.props.navigation.getParam('id')}`)
      .update({
        last_message: msg,
        last_time: time
      })
  }

  sendMessage(data) {
    var date = new Date().toISOString()
    firestore().collection('chatrooms')
      .doc(`${this.props.navigation.getParam('id')}`)
      .collection('messages')
      .add({
        sender: this.props.user.userinfo.username,
        content: data,
        createdAt: date
      })
      console.log("SEND MESSAGE TIME",date)

    this.setLastMessage(data, date)
    this.setUnread()
  }

  getMoreMessages(id) {
    firestore().collection('chatrooms')
      .doc(`${id}`).collection('messages')
      .orderBy('createdAt', 'desc')
      .startAfter(this.props.user.messages[id][this.props.user.messages[id].length - 1]['createdAt'])
      .limit(10)
      .get()
      .then((query) => {
        var chats = []
        query.forEach((doc) => {
          chats.push(doc.data())
        })
        this.props.dispatch({
          type: GET_MORE_MESSAGES,
          payload: {
            data: chats,
            chatroom_id: id
          }
        })
      })
  }

  getInitialMessages(id, limit) {
    firestore().collection('chatrooms')
      .doc(`${id}`).collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
      .then((query) => {
        var chats = []
        var i = 0
        query.forEach((doc) => {
          var d = doc.data()
          d['id'] = doc.id
          i += 1
          chats.push(d)
        })
        this.props.dispatch({
          type: GET_INITIAL_MESSAGES,
          payload: {
            data: chats,
            chatroom_id: id
          }
        })
        this.setState({ listenStart: chats[0] })
        // console.log("DISPATCHED")
        this.setState({ loading: false })
      })
      .catch(err => console.log(err))
  }

  getRealtimeMessages(id, start) {
    unsubscribe = firestore().collection('chatrooms')
      .doc(`${id}`)
      .collection('messages')
      .orderBy('createdAt')
      .startAfter(start)
      .onSnapshot(snapshot => {
        var chats = []
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            chats.unshift(change.doc.data())
          }
        })
        this.props.dispatch({
          type: GET_REALTIME_MESSAGES,
          payload: {
            chatroom_id: id,
            data: chats
          }
        })
      }, err => console.log(err))
  }

  onChatLaunch() {
    // console.log("IN CHAT LAUNCH")
    this.typingStatus()
    unread = this.props.user.unread[this.props.navigation.getParam('id')]
    if (unread > 0) {
      this.clearUnread()
    }

    if (this.props.user.messages[this.props.navigation.getParam('id')] === undefined) {
      this.setState({ loading: true })
      var lim = 15
      var doc_id = this.props.navigation.getParam('id')
      lim = +lim + +unread
      this.getInitialMessages(doc_id, lim)
    }
  }

  getDisplay() {
    var arr = []
    var length = this.props.user.topDisplay.length
    for (var i = 0; i < 5; i += 1) {
      if (i < length) {
        if (this.props.user.topDisplay[i]['id'] !== this.props.navigation.getParam('id')) {
          var isgroup = this.props.user.topDisplay[i]['data']['isGroup']
          if (isgroup) {
            arr.push({
              id: this.props.user.topDisplay[i]['id'],
              isGroup: this.props.user.topDisplay[i]['data']['isGroup'],
              title: this.props.user.topDisplay[i]['data']['title'],
              last_message: this.props.user.topDisplay[i]['data']['last_message'],
              last_time: this.props.user.topDisplay[i]['data']['last_time'],
              members: this.props.user.topDisplay[i]['data']['members'],
              unread: this.props.user.unread[`${this.props.user.topDisplay[i]['id']}`],
              photoUrl: this.props.user.topDisplay[i]['data']['photoUrl']
            })
          }
          else {
            arr.push({
              id: this.props.user.topDisplay[i]['id'],
              isGroup: this.props.user.topDisplay[i]['data']['isGroup'],
              title: this.props.user.topDisplay[i]['data']['title'],
              last_message: this.props.user.topDisplay[i]['data']['last_message'],
              last_time: this.props.user.topDisplay[i]['data']['last_time'],
              members: this.props.user.topDisplay[i]['data']['members'],
              unread: this.props.user.unread[`${this.props.user.topDisplay[i]['id']}`],
              photoUrl: this.props.user.friends[this.props.user.topDisplay[i]['data']['title']]['photoUrl']
            })
          }
        }
      }
    }
    this.setState({ topDisplay: arr })
  }

  componentDidMount() {

    this.getDisplay()
    this.onChatLaunch()

  }

  componentDidUpdate(prevProps, prevState) {

    if (prevState.listenStart !== this.state.listenStart) {
      var startingPoint = this.state.listenStart
      delete startingPoint.id
      this.getRealtimeMessages(this.props.navigation.getParam('id'), startingPoint.createdAt)
    }

    if (this.props.navigation !== prevProps.navigation) {
      this.onChatLaunch()
      this.getDisplay()
      // console.log("IN UPDATE PARAMS",this.props.navigation.getParam('id'))
    }

    if (this.props.user.replica[this.props.navigation.getParam('id')]['typing'] !== prevProps.user.replica[this.props.navigation.getParam('id')]['typing']) {
      this.typingStatus()
    }

    if (this.props.user.friends !== prevProps.user.friends) {
      this.typingStatus()
    }

    if (this.props.user.topDisplay !== prevProps.user.topDisplay) {
      this.getDisplay()
    }

    if (prevState.typeStatus !== this.state.typeStatus) {
      // console.log("IN UPDATE")
      ////////////////////////////////////
      firestore().collection('chatrooms')
        .doc(`${this.props.navigation.getParam('id')}`)
        .update({
          [`typing.${this.props.user.userinfo.username}`]: this.state.typeStatus
        })
    }

  }


  componentWillUnmount() {
    if (this.props.user.unread[this.props.navigation.getParam('id')] > 0) {
      this.clearUnread()
    }
    if (this.state.typeStatus === true) {
      firestore().collection('chatrooms')
        .doc(`${this.props.navigation.getParam('id')}`)
        .update({
          [`typing.${this.props.user.userinfo.username}`]: false
        })
    }

    console.log("UNMOUNTING")
  }
  render() {
    // console.log("REPLICA",this.props.user.replica)
    if (this.state.loading === true) {
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#EA7A7F" />
        </View>
      )
    }
    else if (this.state.loading === false) {
      // console.log("STATE DISPLAY ",this.state.topDisplay)
      //console.log("LENGTH...",this.props.user.messages[this.props.navigation.getParam('id')].length)
      return (
        <View style={{ flex: 1, backgroundColor: 'rgba(234,235,243,1)' }}>
          <TopBar
            backButtonFunction={() => {
              this.props.navigation.goBack();
            }}
            profilePic={this.props.navigation.getParam('photoUrl')}
            username={this.props.navigation.getParam('title')}
            navigateToProfile={this.dummy}
            onlineOrNot={this.state.typing}
            recentChat={this.state.topDisplay}
            optionsButton={this.dummy}
          />
          {/* While using flatlist use the same styles as below. */}
          <FlatList
            style={{
              flex: 1,
              zIndex: -1,
              marginTop: 130,
              marginBottom: 65,
            }}
            initialNumToRender={10}
            inverted={true}
            keyExtractor={item => item.sender + item.createdAt}
            data={this.props.user.messages[this.props.navigation.getParam('id')]}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.25}
            onEndReached={(distance) => {
              // console.log("DISTANCE",distance)
              // if(distance < 30) {
              this.getMoreMessages(this.props.navigation.getParam('id'))
              // }
            }}
            renderItem={({ item, index }) => {
              var dt = new Date(item.createdAt)
              var hours = dt.getHours()
              var minutes = dt.getMinutes()
              if (hours > 11) {
                if (minutes < 10) {
                  dt = `${+hours - 12}:0${minutes} PM`
                }
                else {
                  dt = `${+hours - 12}:${minutes} PM`
                }
              }
              else {
                if (minutes < 10) {
                  dt = `${hours}:0${minutes} AM`
                }
                else {
                  dt = `${hours}:${minutes} AM`
                }
              }
              if (item.sender == this.props.user.userinfo.username && (item.createdAt !== this.props.navigation.getParam('last_time') || unread === 0)) {
                return (
                  <OutgoingMsg
                    isGroupChat={false}
                    username="You"
                    message={item.content}
                    time={dt}
                    index={index}
                  />
                )
              }
              else if (item.sender == this.props.user.userinfo.username && unread > 0 && item.createdAt === this.props.navigation.navigate('last_time')) {
                return (
                  <View>
                    <ChatDate chatDate={`${unread} Unread Messages`} />
                    <OutgoingMsg
                      isGroupChat={false}
                      username="You"
                      message={item.content}
                      time={dt}
                      index={index}
                    />
                  </View>
                )
              }
              else if (item.sender != this.props.user.userinfo.username && (item.createdAt !== this.props.navigation.getParam('last_time') || unread === 0)) {
                return (
                  <IncomingMsg
                    isGroupChat={this.props.navigation.getParam('isGroup')}
                    username={item.sender}
                    message={item.content}
                    navigateToProfile={() => {
                      console.log("TIME", item.createdAt);
                    }}
                    time={dt}
                    index={index}
                  />
                )
              }
              else if (item.sender != this.props.user.userinfo.username && unread > 0 && item.createdAt === this.props.navigation.navigate('last_time')) {
                return (
                  <View>
                    <ChatDate chatDate={`${unread} Unread Messages`} />
                    <IncomingMsg
                      isGroupChat={this.props.navigation.getParam('isGroup')}
                      username={item.sender}
                      message={item.content}
                      navigateToProfile={() => {
                        console.log("TIME", item.createdAt);
                      }}
                      time={dt}
                      index={index}
                    />
                  </View>
                )
              }

              //////////////////////////////////////////////////////////////////////////////////
              //////////////////////////////////////////////////////////////////////////////////

              if (item.sender == this.props.user.userinfo.username && (item.createdAt !== this.props.navigation.getParam('last_time') || unread === 0)) {
                return (
                  <OutgoingZap
                    zapMessage={`You zapped you a ${item.content}`}
                    openButton={() => {
                      console.log('opened@');
                    }}
                    seen={false}
                    profilePic={this.props.user.userinfo.photoUrl}
                  />
                )
              }
              else if (item.sender == this.props.user.userinfo.username && unread > 0 && item.createdAt === this.props.navigation.getParam('last_time')) {
                return (
                  <View>
                    <ChatDate chatDate={`${unread} Unread Messages`} />
                    <OutgoingZap
                      zapMessage={`You zapped you a ${item.content}`}
                      openButton={() => {
                        console.log('opened@');
                      }}
                      seen={false}
                      profilePic={this.props.user.userinfo.photoUrl}
                    />
                  </View>
                )
              }
              else if (item.sender != this.props.user.userinfo.username && (item.createdAt !== this.props.navigation.getParam('last_time') || unread === 0)) {
                return (
                  <IncomingZap
                    zapMessage={`${item.sender} zapped you a ${item.content}`}
                    openButton={() => {
                      console.log('opened');
                    }}
                    seen={false}
                    profilePic={this.props.user.friends[item.sender]['photoUrl']}
                  />
                )
              }
              else if (item.sender != this.props.user.userinfo.username && unread > 0 && item.createdAt === this.props.navigation.navigate('last_time')) {
                return (
                  <View>
                    <ChatDate chatDate={`${unread} Unread Messages`} />
                    <IncomingZap
                      zapMessage={`${item.sender} zapped you a ${item.content}`}
                      openButton={() => {
                        console.log('opened');
                      }}
                      seen={false}
                      profilePic={this.props.user.friends[item.sender]['photoUrl']}
                    />
                  </View>
                )
              }
            }

            }
          />
          {/* Pass all the message rending here only inside this KeyboardAwareScrollView component, it handles all the keyboard stuff properly. */}
          {/* <IncomingMsg
              isGroupChat={true}
              username="Hasir Mushtaq"
              message="Hey! How you doin'?"
              navigateToProfile={() => {
                console.log('joey');
              }}
              time="11:29AM"
            />
            <OutgoingMsg
              isGroupChat={false}
              username="You"
              message="Joey Tribbiani style,huh?  "
              time="12:09AM"
            />
            <ChatDate chatDate="Jul 23, 2020" />
            <IncomingZap
              zapMessage="Hasir zapped you & 13 other friends a challenge."
              openButton={() => {
                console.log('opened');
              }}
              seen={true}
              profilePic={require('../assets/user.jpg')}
            />
            <OutgoingZap
              zapMessage="Hasir accepted your challenge!"
              openButton={() => {
                console.log('opened@');
              }}
              seen={false}
              profilePic={require('../assets/user.jpg')}
            /> */}
          {/* This below contains the Message Text Input Field and the send button, use the text input to take in the message, and pass 
              the message sending logic at ....(1) below.*/}
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'center',
              position: 'absolute',
              bottom: 0,
              backgroundColor: 'rgba(234,235,243,1)',
            }}>
            <Box height={50} width={0.8 * screenWidth} borderRadius={25}>
              <View
                style={{
                  height: 50,
                  width: 0.8 * screenWidth,
                  borderWidth: 1,
                  borderColor: '#e5e5e5',
                  backgroundColor: '#eaebf3',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}>
                <TextInput
                  placeholder="Type to send a message..."
                  placeholderColor="#B5BFD0"
                  style={{
                    fontWeight: 'bold',
                    paddingHorizontal: 20,
                    width: '80%',
                  }}
                  onChangeText={(text) => {
                    this.setState({ message: text })
                    if (this.state.typeStatus === true) {
                      setTimeout(() => {
                        this.setState({ typeStatus: false })
                      }, 5000)
                    }
                    else if (this.state.typeStatus === false) {
                      this.setState({ typeStatus: true })
                      setTimeout(() => {
                        this.setState({ typeStatus: false })
                      }, 5000)
                    }
                  }}
                  value={this.state.message}
                />
                {/* Here on press this should navigate to create zap screen. */}
                <Icon
                  onPress={this.dummy}
                  name="zap"
                  size={18}
                  color="#999"
                  style={{ marginLeft: 30 }}
                />
                {/* Here on press it should open emojis to type in, like in WhatsApp */}
                {/* <Icon
                  onPress={() => {
                    console.log('emojis');
                  }}
                  name="smile"
                  size={18}
                  color="#999"
                  style={{marginLeft: 10}}
                /> */}
              </View>
            </Box>
            {/* SEND BUTTON */}
            <Box height={50} width={50} borderRadius={25}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={['#EA688A', '#EA7A7F']}
                style={{
                  height: 50,
                  borderRadius: 25,
                  width: 50,
                  borderWidth: 1,
                  borderColor: '#e5e5e5',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}>
                <Icon
                  onPress={() => {
                    if (this.state.message !== '') {
                      this.sendMessage(this.state.message)
                      this.setState({ message: '' })
                    }
                  }} // Use using send message logic here. ....(1)
                  name="feather"
                  color="#fff"
                  size={20}
                  style={{ alignSelf: 'center' }}
                />
              </LinearGradient>
            </Box>
          </View>
        </View>
      );
    }
  }
}
// This is the date renderer.
// 1. chatDate: A String, the date.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class ChatDate extends Component {
  render() {
    return (
      <View style={{ alignSelf: 'center', marginTop: 10 }}>
        <Text
          style={{
            paddingVertical: 2,
            paddingHorizontal: 8,
            alignSelf: 'flex-start',
            backgroundColor: '#bebebe',
            borderRadius: 20,
            fontWeight: 'bold',
            color: '#fff',
            fontSize: 10,
          }}>
          {this.props.chatDate}
        </Text>
      </View>
    );
  }
}
// This is the outgoing zap component, and has the following props:
// 1. profilePic: uri or require.
// 2. zapMessage: A string, the message.
// 3. openButton: A function, navigates to the zap screen.
// 4. seen: A bool, so when the user has opened the zap turn this to true, otherwise set false.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class OutgoingZap extends Component {
  render() {
    return (
      <View style={{ alignSelf: 'flex-end', marginTop: 3 }}>
        <CBox
          height={60}
          width={0.8 * screenWidth}
          borderRadius={10}
          borderBlack={10}
          radiusBlack={10}
          xBlack={8}
          yBlack={15}
          borderWhite={10}
          radiusWhite={10}
          xWhite={5}
          yWhite={5}
          style={{ marginRight: 10 }}>
          <View
            style={{
              height: 60,
              width: 0.8 * screenWidth,
              borderRadius: 10,
              backgroundColor: 'rgba(234,235,243,1)',
              borderWidth: 1,
              borderColor: '#e5e5e5',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              justifyContent: 'space-between',
            }}>
            <View style={{ flexDirection: 'row' }}>
              <Image
                style={{
                  height: 40,
                  width: 40,
                  borderWidth: 2,
                  borderRadius: 20,
                  borderColor: '#EA688A',
                }}
                source={{ uri: this.props.profilePic }}
              />
              <Text
                ellipsizeMode="tail"
                numberOfLines={2}
                style={{
                  marginLeft: 10,
                  fontWeight: 'bold',
                  color: '#A1AFC3',
                  width: 180,
                }}>
                {this.props.zapMessage}
              </Text>
            </View>
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={['#EA688A', '#EA7A7F']}
              style={{
                height: 30,
                borderRadius: 15,
                width: 50,
                borderWidth: 1,
                borderColor: '#e5e5e5',
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                onPress={this.props.openButton}
                style={{ fontWeight: 'bold', fontSize: 10, color: '#fff' }}>
                {this.props.seen ? 'SEEN' : 'OPEN'}
              </Text>
            </LinearGradient>
          </View>
        </CBox>
      </View>
    );
  }
}
// This is the incoming zap component, and has the following props:
// 1. profilePic: uri or require.
// 2. zapMessage: A string, the message.
// 3. openButton: A function, navigates to the zap screen.
// 4. seen: A bool, so when the user has opened the zap turn this to true, otherwise set false.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class IncomingZap extends Component {
  render() {
    return (
      <CBox
        height={60}
        width={0.8 * screenWidth}
        borderRadius={10}
        borderBlack={10}
        radiusBlack={10}
        xBlack={8}
        yBlack={15}
        borderWhite={10}
        radiusWhite={10}
        xWhite={5}
        yWhite={5}
        style={{ marginLeft: 20, marginTop: 3 }}>
        <View
          style={{
            height: 60,
            width: 0.8 * screenWidth,
            borderRadius: 10,
            backgroundColor: 'rgba(234,235,243,1)',
            borderWidth: 1,
            borderColor: '#e5e5e5',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            justifyContent: 'space-between',
          }}>
          <View style={{ flexDirection: 'row' }}>
            <Image
              style={{
                height: 40,
                width: 40,
                borderWidth: 2,
                borderRadius: 20,
                borderColor: '#EA688A',
              }}
              source={{ uri: this.props.profilePic }}
            />
            <Text
              ellipsizeMode="tail"
              numberOfLines={2}
              style={{
                marginLeft: 10,
                fontWeight: 'bold',
                color: '#A1AFC3',
                width: 180,
              }}>
              {this.props.zapMessage}
            </Text>
          </View>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['#EA688A', '#EA7A7F']}
            style={{
              height: 30,
              borderRadius: 15,
              width: 50,
              borderWidth: 1,
              borderColor: '#e5e5e5',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              onPress={this.props.openButton}
              style={{ fontWeight: 'bold', fontSize: 10, color: '#fff' }}>
              {this.props.seen ? 'SEEN' : 'OPEN'}
            </Text>
          </LinearGradient>
        </View>
      </CBox>
    );
  }
}
// This is the messgage incoming component, The Pink One, and has the following props:
// 1. username: A String, use 'You' for example.
// 2. message: A string, the message.
// 3. time: A string, the time.
// 4. navigateToProfile: A function, on pressing the username you need to navigate the user to the messagers profile.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class IncomingMsg extends Component {
  render() {
    return (
      // 
      <View style={{ marginTop: 10 }} >
        <TouchableOpacity
          style={{
            backgroundColor: '#ec7796',
            marginLeft: 15,
            maxWidth: 270,
            alignSelf: 'flex-start',
            paddingHorizontal: 15,
            paddingTop: 5,
            paddingBottom: 7,
            borderRadius: 20,
          }}

          activeOpacity={0.6}
          onLongPress={() => {
            Clipboard.setString(this.props.message)
          }}>
          {this.props.isGroupChat && (
            <Text
              style={{ color: 'white', fontWeight: 'bold' }}
              onPress={this.props.navigateToProfile}>
              {this.props.username}
            </Text>
          )}
          <Text style={{ color: '#f2f2f2' }}>{this.props.message}</Text>
          <Text
            style={{
              alignSelf: 'flex-end',
              fontSize: 10,
              opacity: 0.4,
              color: '#fff',
            }}>
            {this.props.time}
          </Text>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: [{ rotateX: '180deg' }],
              zIndex: -1,
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
            }}>
            <Svg
              style={{ left: -6 }}
              width={15.5}
              height={17.5}
              viewBox="32.484 17.5 15.515 17.5"
              enable-background="new 32.485 17.5 15.515 17.5">
              <Path
                d="M38.484,17.5c0,8.75,1,13.5-6,17.5C51.484,35,52.484,17.5,38.484,17.5z"
                fill="#ec7796"
                x="0"
                y="0"
              />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
// This is the messgage outgoing component, The Blue One, and has the following props:
// 1. username: A String, use 'You' for example.
// 2. message: A string, the message.
// 3. time: A string, the time.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class OutgoingMsg extends Component {
  render() {
    return (
      <TouchableOpacity style={{ alignSelf: 'flex-end', marginRight: 15, marginTop: 10 }}
        activeOpacity={0.6}
        onLongPress={() => {
          Clipboard.setString(this.props.message)
        }}>
        <View
          style={{
            backgroundColor: '#6088bc',
            maxWidth: 250,
            alignSelf: 'flex-start',
            paddingHorizontal: 15,
            paddingBottom: 10,
            paddingTop: 5,
            paddingBottom: 7,
            borderRadius: 20,
          }}>
          {this.props.isGroupChat && (
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {this.props.username}
            </Text>
          )}
          <Text style={{ color: 'white' }}>{this.props.message}</Text>
          <Text
            style={{
              alignSelf: 'flex-end',
              fontSize: 10,
              opacity: 0.4,
              color: '#fff',
            }}>
            {this.props.time}
          </Text>
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              transform: [{ rotateX: '180deg' }],
              zIndex: -1,
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
            <Svg
              style={{ right: -6 }}
              width={15.5}
              height={17.5}
              viewBox="32.485 17.5 15.515 17.5"
              enable-background="new 32.485 17.5 15.515 17.5">
              <Path
                d="M48,35c-7-4-6-8.75-6-17.5C28,17.5,29,35,48,35z"
                fill="#6088bc"
                x="0"
                y="0"
              />
            </Svg>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
// This is the top bar, containing back button, profile pic and all. The props are:
// 1. backButtonFunction: A function, on press use the navigation library to go to the previous screen.
// 2. profilePic: the link to profile pic. If url: send as "{uri: 'https://google.com/images/12474'}". If it is a local file
//    send as "require('../../Assets/abc.jpg')".
// 3. username: A string, the username.
// 4. navigateToProfile: A function, on pressing the username you need to navigate the user to the messagers profile.
// 5. onlineOrNot: A string, if user is online supply "Online" else supply "last seen at 10.42AM", for example.
// 6. recentChat: JSON, Should display 4 recent chats, if someone has no chat then show any **4** friends. It should have the following structure:
//              -> profilePic: uri or require
//              -> navigateToChat: function, on press it should navigate to that chat screen
//              -> noOfUnseenMsgs: number, if 0, nothing is shown.
// 7. optionsButton: Function, for the options button.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/// 135.42857360839844

class topBar extends Component {
  render() {
    if (this.props.recentChat === undefined) {
      return (
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: screenWidth,
            backgroundColor: 'rgba(234,235,243,1)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginRight: 15,
              marginLeft: 5,
              alignItems: 'center',
              marginTop: 10,
            }}>
            <TouchableOpacity onPress={this.props.backButtonFunction}>
              <Icon
                name="chevron-left"
                color="#bebebe"
                size={35}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, color: '#4e7bb4' }}
                onPress={this.props.navigateToProfile}>
                {this.props.username}
              </Text>
              <Text style={{ fontWeight: 'bold', color: '#bebebe', fontSize: 12 }}>
                {this.props.onlineOrNot}
              </Text>
            </View>
            <Icon
              onPress={this.props.optionsButton}
              name="more-vertical"
              size={25}
              color="#bebebe"
              style={{ alignSelf: 'center' }}
            />
          </View>
          <View
            style={{
              // alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}>

            <Box width={55} height={55} borderRadius={27.5} key={'$'} >
              <View
                style={{
                  height: 55,
                  width: 55,
                  borderRadius: 27.5,
                  borderColor: '#e5e5e5',
                  backgroundColor: '#eaebf3',
                  alignItems: 'center',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  style={{
                    height: 52,
                    width: 52,
                    borderWidth: 3,
                    borderRadius: 26,
                    borderColor: '#EA688A',
                  }}
                  source={{ uri: this.props.profilePic }}
                />
              </View>
            </Box>


          </View>
          <View
            style={{
              borderBottomColor: '#BFBFBF',
              borderBottomWidth: 2,
              width: '90%',
              opacity: 0.2,
              alignSelf: 'center',
              marginTop: 10,
            }}
          />
        </View>
      );
    }
    else if (this.props.recentChat !== undefined) {
      var arr = [...this.props.recentChat]
      arr.splice(arr.length / 2, 0, '$')
      return (
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: screenWidth,
            backgroundColor: 'rgba(234,235,243,1)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginRight: 15,
              marginLeft: 5,
              alignItems: 'center',
              marginTop: 10,
            }}>
            <TouchableOpacity onPress={this.props.backButtonFunction}>
              <Icon
                name="chevron-left"
                color="#bebebe"
                size={35}
                style={{ alignSelf: 'center' }}
              />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{ fontWeight: 'bold', fontSize: 16, color: '#4e7bb4' }}
                onPress={this.props.navigateToProfile}>
                {this.props.username}
              </Text>
              <Text style={{ fontWeight: 'bold', color: '#bebebe', fontSize: 12 }}>
                {this.props.onlineOrNot}
              </Text>
            </View>
            <Icon
              onPress={this.props.optionsButton}
              name="more-vertical"
              size={25}
              color="#bebebe"
              style={{ alignSelf: 'center' }}
            />
          </View>
          <View
            style={{
              // alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}>

            {arr.map((item) => {
              if (item !== '$') {
                // console.log("ITEM", item)
                return (
                  <QuickNavigationChat key={item.id}
                    profilePic={item.photoUrl}
                    navigateToChat={() => {
                      this.props.navigation.setParams({
                        id: item.id,
                        isGroup: item.isGroup,
                        members: item.members,
                        title: item.title,
                        last_message: item.last_message,
                        last_time: item.last_time,
                        photoUrl: item.photoUrl
                      })
                    }}
                    noOfUnseenMsgs={item.unread}
                  />
                )
              }
              else {
                return (
                  <Box width={55} height={55} borderRadius={27.5} key={'$'} >
                    <View
                      style={{
                        height: 55,
                        width: 55,
                        borderRadius: 27.5,
                        borderColor: '#e5e5e5',
                        backgroundColor: '#eaebf3',
                        alignItems: 'center',
                        alignSelf: 'center',
                        justifyContent: 'center',
                      }}>
                      <Image
                        style={{
                          height: 52,
                          width: 52,
                          borderWidth: 3,
                          borderRadius: 26,
                          borderColor: '#EA688A',
                        }}
                        source={{ uri: this.props.profilePic }}
                      />
                    </View>
                  </Box>
                )
              }
            })}


          </View>
          <View
            style={{
              borderBottomColor: '#BFBFBF',
              borderBottomWidth: 2,
              width: '90%',
              opacity: 0.2,
              alignSelf: 'center',
              marginTop: 10,
            }}
          />
        </View>
      );
    }
  }
}

export const TopBar = withNavigation(topBar)

class quickNavigationChat extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.navigateToChat}
      >
        <Box width={45} height={45} borderRadius={22.5}>
          <View
            style={{
              height: 45,
              width: 45,
              borderRadius: 22.5,
              borderColor: '#e5e5e5',
              backgroundColor: '#eaebf3',
              alignItems: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
            }}>
            <Image
              style={{ height: 45, width: 45, opacity: 0.5 }}
              source={{ uri: this.props.profilePic }}
            />
          </View>
        </Box>
        {this.props.noOfUnseenMsgs === 0 ? (
          <View />
        ) : (
            <Text
              style={{
                position: 'absolute',
                top: 5,
                right: 5,
                borderRadius: 20,
                fontSize: 12,
                backgroundColor: '#EA688A',
                paddingHorizontal: 5,
                color: '#fff',
                fontWeight: 'bold',
              }}>
              {this.props.noOfUnseenMsgs}
            </Text>
          )}
      </TouchableOpacity>
    );
  }
}

export const QuickNavigationChat = withNavigation(quickNavigationChat)

const mapStateToProps = (state) => {
  return (
    {
      user: state.user
    }
  )
}


export default connect(mapStateToProps)(messageScreen)
