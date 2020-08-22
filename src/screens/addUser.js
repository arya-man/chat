import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  FlatList,
  SafeAreaView,
  Button
} from 'react-native';
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Feather';
import Box from './neumorphButton'
import firestore from '@react-native-firebase/firestore'

var select = {}

class addPeople extends Component {

  constructor(props) {
    super(props)
    this.state = {
      select: {},
      display: undefined,
      started : undefined,
      displayReplica : undefined,
      enteredText: ''
    }
  }

  dummy = () => {
    console.log('selcted');
  };
  dummy2 = () => {
    console.log('unselcted');
  };

  // onSubmit() {

  //   var batch = firestore().batch()
  //   for (var i = 0; i < this.state.selected.length; i += 1) {
  //     batch.update(firestore().collection('users').doc(`${this.state.selected[i]}`), {
  //       'chatrooms': firestore.FieldValue.arrayUnion('')
  //     })

  //   }

  //   if (this.state.selected.length > 2) {
  //     var final
  //     var typing = {}
  //     for (var i = 0; i < this.state.selected.length; i += 1) {
  //       typing[this.state.selected[i]] = false
  //     }
  //     console.log("TYPING",typing)
  //     final = {
  //       createdBy: this.props.user.userinfo.username,
  //       createdAt: new Date().toISOString(),
  //       members: this.state.selected,
  //       photoUrl: 'https://i.picsum.photos/id/637/200/200.jpg?hmac=5gHTwbVytbdI9UEOz3_YW6GES2HCcph0DN7ylAvsN0Y',
  //       isGroup: true,
  //       last_message: "",
  //       last_date: "",
  //       title: 'group',
  //       typing: typing
  //     }
  //   }
  //   else {
  //     var final
  //     var typing = {}
  //     for (var i = 0; i < this.state.selected.length; i += 1) {
  //       typing[this.state.selected[i]] = false
  //     }
  //     final = {
  //       createdBy: this.props.user.userinfo.username,
  //       createdAt: new Date().toISOString(),
  //       members: this.state.selected,
  //       photoUrl: 'https://i.picsum.photos/id/637/200/200.jpg?hmac=5gHTwbVytbdI9UEOz3_YW6GES2HCcph0DN7ylAvsN0Y',
  //       isGroup: false,
  //       last_message: "",
  //       last_date: "",
  //       title: 'group',
  //       typing: typing
  //     }
  //   }
  // }

  searchFunction = (text) => {
    console.log("TEXT",text)
    if(text === '') {
      this.setState({display : this.state.displayReplica})
    }
    else {
      var arr = []
      for(var i =0;i<this.state.displayReplica.length ; i+=1 ) {
        if(this.state.displayReplica[i]['data']['username'].includes(text)) {
          // console.log("IN MATCH",this.state.displayReplica[i]['data']['username'])
          arr.push(this.state.displayReplica[i])
        }
      }
      this.setState({display: arr})
    }
  }

  componentDidMount() {
    if(this.props.user.friendsReplica !== undefined) {
      this.setState({started: true})
      this.setState({display: this.props.user.friendsReplica})
      this.setState({displayReplica: this.props.user.friendsReplica})
    }
  }

  componentDidUpdate(prevProps , prevState) {
    if(prevProps.friendsReplica === undefined) {
      if(this.state.started === false) {
        console.log("IN DID UPDATE CHANGE")
        this.setState({display: this.props.user.friendsReplica})
        this.setState({displayReplica: this.props.user.friendsReplica})
      }
    }
  }

  render() {
    console.log("SELECTED",this.state.select)
    const screenWidth = Math.round(Dimensions.get('window').width);
    return (
      <View style={{ flex: 1, backgroundColor: 'rgba(234,235,243,1)' }}>
        <Button title='done' onPress={() => {
          this.onSubmit()
        }}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginLeft: 15,
            marginRight: 25,
            marginTop: 5,
            marginBottom: 10,
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Box height={50} width={50} borderRadius={10}>
              <Icon
                name="chevron-left"
                color="#7f7f7f"
                size={40}
                style={{ alignSelf: 'center', marginTop: 5 }}
              />
            </Box>
          </TouchableOpacity>
          <Text
            style={{
              marginTop: 10,
              fontWeight: 'bold',
              fontSize: 30,
              color: '#36454f',
              opacity: 0.75,
            }}>
            Add people
          </Text>
        </View>
        <Box
          height={50}
          width={screenWidth * 0.9}
          borderRadius={25}
          style={{ alignSelf: 'center' }}>
          <View
            style={{
              height: 50,
              width: '100%',
              borderWidth: 1,
              borderColor: '#e5e5e5',
              backgroundColor: '#eaebf3',
              alignItems: 'center',
              flexDirection: 'row',
              paddingRight: 20,
            }}>
            {/* Here add you search function  */}
            <TextInput
              placeholder="Type to search..."
              placeholderColor="#B5BFD0"
              style={{
                fontWeight: 'bold',
                paddingLeft: 20,
                width: '95%',
              }}
              onChangeText={text => {
                // this.setState({enteredText: text})
                this.searchFunction(text)
              }}
            />
            {/* This is the search button "onPress" show searched queries in the below Flatlist. Add onPress to TouchableOpacity. */}
            <TouchableOpacity>
              <Icon name="search" size={20} color="#B5BFD0" />
            </TouchableOpacity>
          </View>
        </Box>
        <View
          style={{
            borderBottomColor: '#BFBFBF',
            borderBottomWidth: 2,
            borderRadius: 2,
            width: '90%',
            alignSelf: 'center',
            marginTop: 10,
            opacity: 0.2,
          }}
        />
        {/* This is an item in the flatlist */}
        <SafeAreaView>
          <FlatList
            data={this.state.display}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              var isOrno = false
              if(select[item.data.username] === true) {
                console.log("USERNAME",item.data.username)
                isOrno = true
              }
              return (
                <Item
                  username={item.data.username}
                  profilePic={item.data.photoUrl}
                  selectFunction={() => {
                    // this.setState({ select: [...this.state.select, item.data.username] })
                    select[item.data.username] = true
                    this.setState({select: select})
                  }}
                  unSelectFunction={() => {
                    // this.setState({
                    //   selected: this.state.select.filter((x) => {
                    //     if (x !== item.data.username) {
                    //       return x
                    //     }
                    //   })
                    // })
                    delete select[item.data.username]
                    this.setState({select: select})
                  }}
                  selectOrNot = {isOrno}
                />
              )
            }}
          />
        </SafeAreaView>
      </View>
    );
  }
}
// This is the item prop, takes the following props:
// username: the name.
// profilePic
// selectedFunction: this will run when the item is selected, in the UI it will show a pink button.
// unselectedFunction: this will run when the item is unselected, in the UI it will show the empty button.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// YOU DONT HAVE TO MEDDLE WITH THE BELOW WRITTEN CODE JUST FOLLOW ABOVE INSTRUCTIONS.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selectOrNot,
    };
  }
  selected = () => {
    if (this.state.selected) {
      this.setState({ selected: false });
      this.props.unSelectFunction();
    } else {
      this.setState({ selected: true });
      this.props.selectFunction();
    }
  };

  // selected = () => {
  //   if (this.props.selectOrNot) {
  //     this.setState({ selected: false });
  //     this.props.unSelectFunction();
  //   } else {
  //     this.setState({ selected: true });
  //     this.props.selectFunction();
  //   }
  // };

  render() {
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginHorizontal: 15,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Box width={40} height={40} borderRadius={20}>
              <Image
                source={{ uri: this.props.profilePic }}
                style={{ height: 40, width: 40, borderRadius: 20 }}
              />
            </Box>
            <Text
              style={{
                fontSize: 15,
                opacity: 0.5,
                marginLeft: 15,
                marginTop: 5,
              }}>
              {this.props.username}
            </Text>
          </View>
          <View>
            {this.state.selected ? (
              <TouchableOpacity onPress={this.selected}>
                <Box width={20} height={20} borderRadius={10}>
                  <View
                    style={{
                      backgroundColor: '#EA688A',
                      height: 15,
                      width: 15,
                      marginTop: 1.5,
                      borderRadius: 7.5,
                      alignSelf: 'center',
                    }}
                  />
                </Box>
              </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={this.selected}>
                  <Box width={20} height={20} borderRadius={10} />
                </TouchableOpacity>
              )}
          </View>
        </View>
        <View
          style={{
            borderBottomColor: '#BFBFBF',
            borderBottomWidth: 2,
            borderRadius: 2,
            width: '90%',
            alignSelf: 'center',
            marginTop: 10,
            opacity: 0.2,
          }}
        />
      </View>
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

export default connect(mapStateToProps)(addPeople)

