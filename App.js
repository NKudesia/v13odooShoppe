import React from 'react';
// import {createAppContainer} from 'react-navigation';
import Navigator from './src/utils/Navigator';
import Constants from './src/utils/Constants';
import {NavigationContainer} from '@react-navigation/native';
import ThemeProvider from './src/context/ThemeProvider';
import ThemeWrapper from './src/helper/themeWrapper';
import {Alert, Linking} from 'react-native';
import {
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
  useStripe,
} from '@stripe/stripe-react-native';
global.lang = null;
global.tz = null;
global.uid = null;
global.isGuest = true;
global.partnerId = Constants.DEFAULT_PARTNER_ID;
global.loggedInId = null;
global.userDetails = [];
global.categories = [];
global.cartDetails = {};
global.priceListId = null;
global.currency = Constants.DEFAULT_CURRENCY;
global.ratingEnabled = false;
global.countStats = {
  total_wishlist_item: 0,
  total_cart_item: 0,
};
global.profilePic = null;
global.homePage = [];
global.searchPage = [];
global.loginType = Constants.LOGIN_TYPES.EMAIL;

// export default createAppContainer(Navigator);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localeLoaded: false,
      setData: null,
    };
    this.routeNameRef = '';
  }
  handleDeepLink = event => {
    // let data = Linking.(event);
    // console.log(event);
    // this.setState({
    //   setData: data,
    // });
  };
  componentDidMount() {
    const getUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      // console.log('initial url fffffff', initialUrl);

      if (initialUrl === null) {
        // console.log('initial url', initialUrl);
        return;
      }
      if (initialUrl.includes('Product')) {
        Alert.alert(initialUrl);
        // RootNavigation.navigation('Product');
      }
    };
    getUrl();
  }

  render() {
    const config = {
      screens: {
        // Chat: 'feed/:sort',
        MainStack: {
          screens: {
            Product: 'Product',
          },
        },
      },
    };

    const linking = {
      prefixes: ['https://kanak', 'odooShoppe://', 'deepLinking://odoo'],
      config:{
         screens : {
           Product:{
             path: 'v13.kanakinfosystems.com/shop/product'
           }
        }
      }
    };

    return (
      <ThemeProvider>
        <ThemeWrapper>
          <NavigationContainer linking={linking}>
            <StripeProvider
              publishableKey="pk_test_51KPhQRBDn7vIvr9p0bKXZBhcRDEXNdJhbsg9SpDau72DGWY1NlE1sN2KHR67Pu2MQRCv9M6o5lcwltCSTUNi1ATi000xpN2Jd8"
              // stripeAccountId="acct_1Kt4zuSHk1nXNmsQ"
            >
              <Navigator />
            </StripeProvider>
          </NavigationContainer>
        </ThemeWrapper>
      </ThemeProvider>
    );
  }
}
