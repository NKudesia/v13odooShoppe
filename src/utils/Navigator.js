import React, {useEffect} from 'react';
import {Dimensions, I18nManager} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import Drawer from '../components/Drawer';
import {Colors} from './Constants';

// Importing screens
import Splash from '../screens/Splash';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Product from '../screens/Product';
import Cart from '../screens/Cart';
import YourInfo from '../screens/YourInfo';
import BillingAndShipping from '../screens/BillingAndShipping';
import PaymentMethod from '../screens/PaymentMethod';
import OrderPlaced from '../screens/OrderPlaced';
import UpdateAddress from '../screens/UpdateAddress';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import ViewAllComments from '../screens/ViewAllComments';
import AddComment from '../screens/AddComment';
import DeliveryMethod from '../screens/DeliveryMethod';
import MyAccount from '../screens/MyAccount';
import CategoryProducts from '../screens/CategoryProducts';
import OrderHistory from '../screens/OrderHistory';
import ViewOrder from '../screens/ViewOrder';
import Wishlist from '../screens/Wishlist';
import AllAddress from '../screens/AllAddress';
import Setting from '../screens/Setting';
import ContactUs from '../screens/ContactUs';
import Categories from '../screens/Categories';
import ShopByBrand from '../screens/shopByBrand';
import BrandScreen from '../screens/BrandScreen';
import OffersScreen from '../screens/OffersScreen';
import AdvertisementScreen from '../screens/AdvertisementScreen';

import AsyncStorage from '@react-native-community/async-storage';


const Stack = createStackNavigator();
const Drawerr = createDrawerNavigator();

const DrawerScreen = () => {
  return (
    <Drawerr.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerShown: false,
      }}
      drawerPosition={'left'}
      drawerType={'back'}
      drawerContent={props => <Drawer {...props} />}
      keyboardDismissMode={'on-drag'}
      overlayColor={Colors.OVERLAY}
      drawerStyle={{
        backgroundColor: Colors.WHITE,
        width: Dimensions.get('window').width * 0.8,
      }}>
      <Drawerr.Screen name="Login" component={Login} />
      <Drawerr.Screen name="SignUp" component={SignUp} />
      <Drawerr.Screen name="CategoryProducts" component={CategoryProducts} />
      <Drawerr.Screen name="Home" component={Home} />
      <Drawerr.Screen name="Search" component={Search} />
      {/* <Drawerr.Screen name="Product" component={Product} /> */}
      {/* <Drawerr.Screen name="AddComment" component={AddComment} /> */}
      <Drawerr.Screen name="ViewAllComments" component={ViewAllComments} />
      <Drawerr.Screen name="Cart" component={Cart} />
      {/* <Drawerr.Screen name="YourInfo" component={YourInfo} /> */}
      {/* <Drawerr.Screen
        name="BillingAndShipping"
        component={BillingAndShipping}
      /> */}
      {/* <Drawerr.Screen name="DeliveryMethod" component={DeliveryMethod} /> */}
      {/* <Drawerr.Screen name="UpdateAddress" component={UpdateAddress} /> */}
      {/* <Drawerr.Screen name="PaymentMethod" component={PaymentMethod} /> */}
      <Drawerr.Screen name="OrderHistory" component={OrderHistory} />
      <Drawerr.Screen name="AllAddress" component={AllAddress} />
      <Drawerr.Screen name="Setting" component={Setting} />
      <Drawerr.Screen name="OrderPlaced" component={OrderPlaced} />
      <Drawerr.Screen name="MyAccount" component={MyAccount} />
      <Drawerr.Screen name="ViewOrder" component={ViewOrder} />
      <Drawerr.Screen name="Wishlist" component={Wishlist} />
      <Drawerr.Screen name="ContactUs" component={ContactUs} />

    </Drawerr.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Splash'}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="DrawerScreen" component={DrawerScreen} />
      <Stack.Screen name="BillingAndShipping" component={BillingAndShipping} />
      <Stack.Screen name="YourInfo" component={YourInfo} />
      <Stack.Screen name="UpdateAddress" component={UpdateAddress} />
      <Stack.Screen name="DeliveryMethod" component={DeliveryMethod} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethod} />
      <Stack.Screen name="AddComment" component={AddComment} />
      <Stack.Screen name="ViewAllComments" component={ViewAllComments} />
      <Stack.Screen name="Product" component={Product} />
      <Stack.Screen name="Categories" component={Categories} />
      <Stack.Screen name="ShopByBrand" component={ShopByBrand} />
      <Stack.Screen name="BrandScreen" component={BrandScreen} />
      <Stack.Screen name="OffersScreen" component={OffersScreen} />
      <Stack.Screen name="AdvertisementScreen" component={AdvertisementScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;

// const HomeDrawer = createDrawerNavigator(
//   {
//     HomeStack: createStackNavigator(
//       {
//         Login: {
//           screen: Login,
//         },
//         SignUp: {
//           screen: SignUp,
//         },
//         CategoryProducts: {
//           screen: CategoryProducts,
//         },
//         Home: {
//           screen: Home,
//         },
//         Search: {
//           screen: Search,
//         },
//         Product: {
//           screen: Product,
//         },
//         AddComment: {
//           screen: AddComment,
//         },
//         ViewAllComments: {
//           screen: ViewAllComments,
//         },
//         Cart: {
//           screen: Cart,
//         },
//         YourInfo: {
//           screen: YourInfo,
//         },
//         BillingAndShipping: {
//           screen: BillingAndShipping,
//         },
//         DeliveryMethod: {
//           screen: DeliveryMethod,
//         },
//         UpdateAddress: {
//           screen: UpdateAddress,
//         },
//         PaymentMethod: {
//           screen: PaymentMethod,
//         },
//         OrderPlaced: {
//           screen: OrderPlaced,
//         },
//         MyAccount: {
//           screen: MyAccount,
//         },
//         Setting: {
//           screen: Setting,
//         },
//         AllAddress: {
//           screen: AllAddress,
//         },
//         OrderHistory: {
//           screen: OrderHistory,
//         },
//         ViewOrder: {
//           screen: ViewOrder,
//         },
//         Wishlist: {
//           screen: Wishlist,
//         },
//         ContactUs: {
//           screen: ContactUs,
//         },
//       },
//       {
//         headerMode: 'none',
//         initialRouteName: 'Home',
//       },
//     ),
//   },
//   {
//     drawerWidth: Dimensions.get('window').width * 0.8,
//     contentComponent: Drawer,
//     // drawerPosition: I18nManager.isRTL ? 'right' : 'left',

//     // drawerPosition: 'left',
//     drawerType: 'slide',
//     initialRouteName: 'HomeStack',
//     keyboardDismissMode: 'on-drag',
//     resetOnBlur: true,
//     drawerBackgroundColor: Colors.WHITE,
//     overlayColor: Colors.OVERLAY,
//   },
// );

// export default createSwitchNavigator({
//   Splash: {
//     screen: Splash,
//     navigationOptions: {
//       gestureEnabled: false,
//     },
//   },
//   HomeDrawer: {
//     screen: HomeDrawer,
//   },
// });
