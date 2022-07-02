import Intl from 'intl';
import 'intl/locale-data/jsonp/en-IN';
import moment from 'moment';
import Toast from 'react-native-simple-toast';
// import Toast from 'react-native-toast-message';
import Constants, { Message } from '../utils/Constants';
import Online from '../utils/Online';
import  { Linking }  from 'react-native';
import { LoginManager, GraphRequest, GraphRequestManager, AccessToken } from 'react-native-fbsdk';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import { string } from 'i/lib/util';

const globalAny:any = global;

export const FormatNumber = (number: number, locale = 'en-IN') => {
  var formatted: string = Intl.NumberFormat(locale).format(number);

  return formatted;
};

/**
 * Format number to a specific currency
 * @param number 
 * @param format 
 * @param locale 
 */
export const FormatCurrency = (
  number: number,
  format?: string,
  locale?: string,
) => {
  locale = locale ?? (globalAny.lang ? globalAny.lang.replace('_','-') : Constants.DEFAULT_LANG);
// console.log("locale",locale, globalAny.lang, globalAny.currency);
  var formatted: string = Intl.NumberFormat(locale, {
    style: 'currency',
    currency: format ?? globalAny.currency[1],
  }).format(number);





  return formatted;
};

/**
 * Converts timesatmp to a formatted date
 * @param timestamp Valid timestamp
 * @param format Optional format
 */
export const TimestampToDate = (
  timestamp: number,
  format = 'MMM Do YYYY, h:mm:ss a',
) => {
  // Feb 20th 2020, 3:17:09 pm
  return moment(timestamp).format(format);
};

/**
 * Displays an Android like toast message in iOS / Android
 * @param message String message
 */
export const ShowToast = (message: string) => {
  Toast.show(message, Toast.LONG);
};

/**
 *
 */
export const DecodeImage = (base64image: string | boolean) => {
  // console.log("from decode", base64image);
  return base64image === false
    ? Constants.IMAGE_PREFIX + Constants.THUMBNAIL
    : Constants.IMAGE_PREFIX + base64image;
};

/**
 * Navigate back with toast message
 * @param props Component props
 * @param message String message
 */
export const BackWithError = (props: any, message?: string) => {
  if(message) {
    ShowToast(message);
  }
  props.navigation.goBack();
}

/**
 * Get order status to show in the app using current order state
 * @param state Order state
 */
export const DecodeOrderState = (state: string) => {
  switch(state){
    case 'draft':
      return 'Pending';
    case 'sent':
      return 'Pending';
    case 'sale':
      return 'Order Placed';
    case 'done':
      return 'Order Complete';
    case 'cancel':
      return 'Order Cancelled';
  }
};

/**
 * Check if rating and discussion enabled on website
 */
export const IsRatingEnabled = async () => {
  let response = await new Online().getRatingStatus();
  return response.result;
};

/**
 * Get random number between two integers
 * @param min 
 * @param max 
 */
export const RandomIntBetween = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if rating and discussion enabled on website
 */
export const GetCartWishlistCount = async () => {
  let partner_id = globalAny.isGuest ? null : globalAny.loggedInId;
  let quotation_id = globalAny.cartDetails.cart_id ?? null;

  let response = await new Online().getCountStats(partner_id, quotation_id);
  
  if(response.result) {
    globalAny.countStats = response.result;
  }
};

export const GetProfilePic = async () => {
  if (globalAny.isGuest === true) {
    return;
  }

  let response = await new Online().viewProfilePic(globalAny.partnerId);

  if (response.error) {
    if (Constants.DEBUG) {
      console.log(response.error.data.arguments[0]);
    }
    return;
  }

  if (response.result.image !== false) {
    globalAny.profilePic = DecodeImage(response.result.image);
  }
};

export const OpenUrl = (url) => {
  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log('Cannot open URL');
      ShowToast(Message.ERROR_TRY_AGAIN);
    }
  });
};

export const InitiateFbLogin = async (callback) => {
  console.log("InitiateFbLogint");
  let result = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ])
  console.log("result initfb login", result);
  if (result.isCancelled) {
    ShowToast("You've cancelled login. Try again");
    return;
  } else if (result.error) {
    ShowToast(Message.ERROR_TRY_AGAIN);
    return;
  } else if (result.declinedPermissions.length > 0) {
    ShowToast(
      "You've declined permissions - " +
        result.declinedPermissions.join(', ') +
        ', Try again',
    );
    return;
  }

  let accessToken = await AccessToken.getCurrentAccessToken();
  console.log("accessToken", accessToken);
  const request = new GraphRequest(
    '/me',
    {
      parameters: {
        fields: {string: 'id,name,email'},
      },
    },
    (error, data) => {
      if (error) {
        console.log(error);
        ShowToast(Message.ERROR_TRY_AGAIN);
        return callback(false);
      }
      
      return callback({...accessToken, ...data});
    },
  );

  return new GraphRequestManager()
    .addRequest(request)
    .start();
}

export const InitiateGoogleLogin = async (callback) => {
  try {
    console.log("try block", Constants.GOOGLE_ANDROID_CLIENT_ID);
    
    GoogleSignin.configure({
      // iosClientId: Constants.GOOGLE_IOS_CLIENT_ID,
      iosClientId: '1008987592271-c3fs7q6g793gp8eh2t5ifo0kmqgn6sn3.apps.googleusercontent.com',
      // and: Constants.GOOGLE_ANDROID_CLIENT_ID
      // webClientId: Constants.GOOGLE_ANDROID_CLIENT_ID
      
    });

    // GoogleSignin.configure({
    //   // webClientId: '1008987592271-c3fs7q6g793gp8eh2t5ifo0kmqgn6sn3.apps.googleusercontent.com',
    //   webClientId: '1008987592271-o84qg5vdjtp1tklp024m7ulii14untpc.apps.googleusercontent.com',

    //   offlineAccess: true,
    // });
    console.log("conf");


    await GoogleSignin.hasPlayServices();
    // console.log("checkk", checkk)
    const {user} = await GoogleSignin.signIn();
    console.log("user", user);
    const accessToken = await GoogleSignin.getTokens();
    console.log("accessToken", accessToken);
    return callback({
      ...accessToken, 
      ...user
    });

  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      
      ShowToast("You've cancelled login, Try again");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      ShowToast('Google sign in not supported on your device');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      ShowToast('Sign in is already in progress');
    } else {
      if (Constants.DEBUG) {
        // console.log("error comming from here");
        console.log(error);
        // console.log("error comming from here");
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
    }

    return callback(false);
  }
};