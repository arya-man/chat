import React from 'react'
import AppNavigator from './src/navigation'
import {Provider} from 'react-redux'
import navigationService from './src/navigation/navigationService'
import {PersistGate} from 'redux-persist/lib/integration/react'
import {store,persistor} from './src/redux'

export default function App() {
  return(
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <AppNavigator
          ref={navigatorRef => {
            navigationService.setTopLevelNavigator(navigatorRef);
          }}/>
        </PersistGate>
      </Provider>
  )
}