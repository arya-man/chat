import {createStackNavigator} from 'react-navigation-stack'
import Unread from '../screens/Unread'
import openingScreen from '../screens/openingScreen'
import messageScreen from '../screens/messageScreen'
import addUser from '../screens/addUser'

const appNavigator = createStackNavigator({
    unread: {
        screen: Unread
    },
    openingScreen: {
        screen: openingScreen
    },
    messageScreen: {
        screen: messageScreen
    },
    addUser: {
        screen: addUser
    }
    },
    {
        initialRouteName: 'unread'
    })

export default appNavigator
