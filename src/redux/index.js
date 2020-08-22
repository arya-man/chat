import {combineReducers, createStore,applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {persistStore,persistReducer} from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'

import userReducer from './userRedux'

const rootReducer = combineReducers({
    user: userReducer
})

const persistConfig = {
    key:'root',
    storage: AsyncStorage,
    blacklist:['']
}

const pReducer = persistReducer(persistConfig, rootReducer)

export const store =  createStore(pReducer,applyMiddleware(thunk))
export const persistor = persistStore(store)
