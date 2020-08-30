import {createAppContainer,createSwitchNavigator} from 'react-navigation'
import Login from '../screens/Login'
import appNavigation from './appNavigation'

const AppNavigator = createSwitchNavigator({
    login: Login,
    app: appNavigation

},
{
    initialRouteName: 'login',
})

export default createAppContainer(AppNavigator)

