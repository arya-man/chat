import firestore from '@react-native-firebase/firestore'
import navigationService from '../navigation/navigationService'
import { PURGE } from "redux-persist"

const GET_USER = 'GET_USER'
const GET_UNREAD = 'GET_UNREAD'
export const GET_CHATROOMS = 'GET_CHATROOMS'
export const GET_INITIAL_MESSAGES = 'GET_INITIAL_MESSAGES'
export const GET_REALTIME_MESSAGES = 'GET_REALTIME_MESSAGES'
export const GET_MORE_MESSAGES = 'GET_MORE_MESSAGES'
export const GET_TOP_DISPLAY = 'GET_TOP_DISPLAY'
export const GET_FRIENDS_REPLICA = 'GET_FRIENDS_REPLICA'
export const GET_FRIENDS = 'GET_FRIENDS'
export const GET_REPLICA = 'GET_REPLICA'


export function getUser(data) {
    return function (dispatch) {
        firestore().collection('users')
            .where('uid', '==', `${data}`).get()
            .then(data => {
                data.forEach((doc) => {
                    dispatch({
                        type: GET_USER,
                        payload: doc.data()
                    })
                })
            })
            .then(() => {
                navigationService.navigate('unread')
            })
            .catch(err => console.log(err))
    }
}

export function getUnread(data) {
    return function (dispatch) {
        firestore().collection('unread').doc(`${data}`)
            .onSnapshot(snapshot => {
                dispatch({
                    type: GET_UNREAD,
                    payload: snapshot.data()
                })
            }, err => {
                console.log(err)
            })
    }
}

const INITIAL_STATE = {
    userinfo: {},
    unread: {},
    chatrooms: {},
    messages: {}
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case GET_USER:
            return ({ ...state, userinfo: action.payload })
        case GET_UNREAD:
            return ({ ...state, unread: action.payload })
        case GET_CHATROOMS:
            return ({ ...state, chatrooms: action.payload })
        case GET_INITIAL_MESSAGES:
            return ({
                ...state, messages: {
                    ...state.messages,
                    [action.payload.chatroom_id]: action.payload.data
                }
            })
        case GET_REALTIME_MESSAGES:
            return ({
                ...state, messages: {
                    ...state.messages,
                    [action.payload.chatroom_id]: [...action.payload.data, ...state.messages[action.payload.chatroom_id]]
                }
            })
        case GET_MORE_MESSAGES:
            return ({
                ...state, messages: {
                    ...state.messages,
                    [action.payload.chatroom_id]: [...state.messages[action.payload.chatroom_id], ...action.payload.data]
                }
            })
        case GET_TOP_DISPLAY:
            return ({ ...state, topDisplay: action.payload })

        case GET_FRIENDS:
            return ({ ...state, friends: action.payload })

        case GET_FRIENDS_REPLICA:
            return ({ ...state, friendsReplica: action.payload })

        case GET_REPLICA:
            return ({ ...state, replica: action.payload })

        case PURGE:
            return INITIAL_STATE
        default:
            return (state)
    }
}


