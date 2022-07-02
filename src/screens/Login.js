import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  Platform,
  ViewBase,
  Text,
  Alert,
} from 'react-native';
import Constants, {
  Colors,
  Fonts,
  LocalKeys,
  Message,
  ApiCredentials,
} from '../utils/Constants';
import {
  WhiteText,
  HeaderBg,
  Body,
  Wrap,
  FullWidthButton,
  InputField,
  DefaultText,
  LinkText,
  TouchableIcon,
} from '../components/Common';
import {
  ShowToast,
  IsRatingEnabled,
  GetCartWishlistCount,
  GetProfilePic,
  InitiateFbLogin,
  InitiateGoogleLogin,
} from '../components/Functions';
import Online from '../utils/Online';
import Offline from '../utils/Offline';
import {StackActions, NavigationEvents} from 'react-navigation';
import {Keyboard} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Dimensions} from 'react-native';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {withTranslation} from 'react-i18next';
import {i18n} from 'i18next';
// import {
//   GoogleSignin,
//   GoogleSigninButton,
// } from '@react-native-google-signin/google-signin';

// GoogleSignin.configure({
//   webClientId:
//     '1008987592271-k6tb4ac42ghr1tgi8gdjk1q996o79tac.apps.googleusercontent.com',
//   offlineAccess: true,
// });

class Login extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();
    this.Offline = new Offline();

    this.textInputs = {
      password: null,
    };

    this.state = {
      fromCart: this.props.route.params
        ? this.props.route.params.cart ?? false
        : false,
      email: '',
      password: '',
      showPassword: true,
      buttonEnabled: true,
      showInternetPopup: false,
      userGoogleInfo: {},
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
    });
  }

  createListeners = () => {
    this.internetListener = NetInfo.addEventListener(state => {
      if (this._is_mounted && !state.isConnected) {
        this.setState({
          showInternetPopup: true,
        });
      }
    });
  };

  removeListeners = () => {
    if (this.internetListener) {
      this.internetListener();
    }
  };

  togglePassword = () => {
    if (this.state.showPassword && this._is_mounted) {
      this.setState({
        showPassword: false,
      });
    } else if (this._is_mounted) {
      this.setState({
        showPassword: true,
      });
    }
  };

  validateForm = async () => {
    Keyboard.dismiss();

    if (this.state.email.length < 1) {
      ShowToast('Enter your email address');
      return false;
    }

    if (
      this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) === null
    ) {
      ShowToast('Enter a valid email address');
      return false;
    }

    if (this.state.password.length < 1) {
      ShowToast('Enter password');
      return false;
    }

    return true;
  };

  facebookLogin = () => {
    // console.log('initiated fb login');
    InitiateFbLogin(async user => {
      if (!user) {
        return;
      }
      console.log('fb user', user);
      let login = await this.Online.facebookLogin(
        user.dataAccessExpirationTime,
        user.expirationTime,
        user.accessToken,
      );
      console.log('fb login', login);
      if (login.error) {
        if (Constants.DEBUG) {
          console.log(login);
        }
        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }

      if (!login.result) {
        if (Constants.DEBUG) {
          console.log(login);
        }
        ShowToast(Message.INVALID_LOGIN);
        return;
      }

      global.loginType = Constants.LOGIN_TYPES.FACEBOOK;

      let userDetails = {
        type: Constants.LOGIN_TYPES.FACEBOOK,
        uid: login.result.uid,
        partner_id: login.result.partner_id,
        ...user,
      };

      this.afterLogin(userDetails);
    });
  };

  googleLogin = () => {
    // console.log('1');

    InitiateGoogleLogin(async user => {
      console.log('2', user);

      if (!user) {
        // console.log('3');
        return;
      }
      // console.log('login b', login, user.accessToken);

      let login = await this.Online.googleLogin(user.accessToken);
      console.log('login', login, user.accessToken);
      if (login.error) {
        if (Constants.DEBUG) {
          console.log(login);
        }
        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }

      if (!login.result) {
        if (Constants.DEBUG) {
          console.log(login);
        }
        ShowToast(Message.INVALID_LOGIN);
        return;
      }

      global.loginType = Constants.LOGIN_TYPES.GOOGLE;
      // console.log('global', global.loginType);
      let userDetails = {
        type: Constants.LOGIN_TYPES.GOOGLE,
        uid: login.result.uid,
        partner_id: login.result.partner_id,
        email: user.email,
        name: user.name,
        accessToken: user.accessToken,
      };

      this.afterLogin(userDetails);
    });
  };

  validateAndLogin = async () => {
    if (this._is_mounted) {
      this.setState({
        buttonEnabled: false,
      });
    }

    let canLogin = await this.validateForm();

    if (!canLogin) {
      if (this._is_mounted) {
        this.setState({
          buttonEnabled: true,
        });
      }
      return;
    }

    let API = new Online(this.state.email, this.state.password);

    let response = await API.login();
    console.log('login', response);

    if (!response.result) {
      if (this._is_mounted) {
        this.setState({
          buttonEnabled: true,
        });
      }
      if (response.error.data.message === 'Access denied') {
        ShowToast('Invalid email or password');
        return;
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    API = null;

    this.saveLocalUser(response.result);
  };

  saveLocalUser = async result => {
    let userDetails = {
      type: Constants.LOGIN_TYPES.EMAIL,
      uid: result.uid,
      partner_id: result.partner_id,
      email: this.state.email,
      name: result.name,
      password: this.state.password,
    };

    let API = new Online(ApiCredentials.USERNAME, ApiCredentials.PASSWORD);

    let login = await API.login();

    if (!login.result) {
      if (this._is_mounted) {
        this.setState({
          buttonEnabled: true,
        });
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    this.afterLogin(userDetails);
  };

  afterLogin = async userDetails => {
    await this.Offline.set(LocalKeys.USER_DETAILS, userDetails);

    ShowToast('Login successful');

    global.isGuest = false;
    global.partnerId = userDetails.partner_id;
    global.userDetails = userDetails;

    IsRatingEnabled().then(ratingEnabled => {
      global.ratingEnabled = ratingEnabled;
      GetCartWishlistCount().finally(() => {
        GetProfilePic().finally(() => {
          if (this._is_mounted) {
            this.setState({
              buttonEnabled: true,
            });
          }

          ShowToast('Login successful');
          this.navigateOnLogin();
        });
      });
    });
  };

  navigateOnLogin = () => {
    console.log('navigateOnLogin', this.state.fromCart);
    if (this.state.fromCart) {
      this.props.navigation.navigate('BillingAndShipping')
      // this.props.navigation.dispatch(
      //   StackActions.replace({
      //     routeName: 'BillingAndShipping',
      //   }),
      // );
      return;
    }

    // this.props.navigation.goBack();
    this.props.navigation.navigate('Home');
  };

  navigateToSignup = () => {
    if (this.state.fromCart) {
      this.props.navigation.navigate('SignUp')
      // this.props.navigation.dispatch(
      //   StackActions.replace({
      //     routeName: 'SignUp',
      //     params: {
      //       cart: true,
      //     },
      //   }),
      // );
      return;
    }

    this.props.navigation.navigate('SignUp', {
      // routeName: 'SignUp',
    });
  };

  forgotPassword = async () => {
    Keyboard.dismiss();

    if (this.state.email.length < 1) {
      ShowToast('Enter your email address');
      return false;
    }
    if (
      this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i) === null
    ) {
      ShowToast('Enter a valid email address');
      return false;
    }

    ShowToast(Message.PLEASE_WAIT);

    let response = await this.Online.resetPassword(this.state.email);

    if (!response.result) {
      ShowToast(Message.ERROR_TRY_AGAIN);
    }

    if (response.result.success) {
      ShowToast(
        'An email with instructions has been sent to you registered email id',
      );
    }
  };

  signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfoo = await GoogleSignin.signIn();
      this.setState({
        userGoogleInfo: userInfoo,
      });
      Alert('userInfoo', userInfoo);
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <ScrollView
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.Root}>
        {/* <NavigationEvents
          onDidFocus={this.createListeners}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });
          }}
        />
        <StatusBar translucent backgroundColor={Colors.OVERLAY} />
        <ImageBackground
          source={require('../assets/images/login-bg.png')}
          style={styles.LoginBg}>
          <View style={styles.Header}>
            <Wrap>
              <WhiteText style={styles.WelcomeText}>
                {this.props.i18n.t('Welcome to')}
              </WhiteText>
              <View style={styles.WelcomeWrap}>
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.LogoIcon}
                />
                <WhiteText style={styles.Logo}>
                  {this.props.i18n.t('Odoo')}
                  <WhiteText style={styles.LogoBoldPart}>
                    {this.props.i18n.t('Shoppe')}
                  </WhiteText>
                </WhiteText>
              </View>
              <Image
                source={require('../assets/images/shopping-girl.png')}
                style={styles.ShoppingGirl}
              />
            </Wrap>
          </View>
          <Body style={styles.Body}>
            <Wrap style={styles.BodyWrap}>
              <InputField
                placeholder={this.props.i18n.t('Email')}
                value={this.state.email}
                onInput={email => this.setState({email})}
                keyboardType={'email-address'}
                autoCapitalize={'none'}
                autoCompleteType={'email'}
                autoCorrect={false}
                style={styles.loginInputWrap}
                inputStyle={styles.loginInput}
                onSubmitEditing={() => {
                  this.textInputs.password.focus();
                }}
              />
              <InputField
                placeholder={this.props.i18n.t('Password')}
                value={this.state.password}
                onInput={password => this.setState({password})}
                autoCapitalize={'none'}
                autoCorrect={false}
                style={styles.loginInputWrap}
                inputStyle={styles.loginInput}
                isPassword={this.state.showPassword}
                onEyePress={this.togglePassword}
                maxLength={15}
                refKey={ref => (this.textInputs.password = ref)}
                onSubmitEditing={this.validateAndLogin}
                returnKeyType={'done'}
                returnKeyLabel={'Sign In'}
              />
              <LinkText
                style={styles.ForgotPassword}
                onPress={this.forgotPassword}>
                {this.props.i18n.t('Forgot Password?')}
              </LinkText>
              <FullWidthButton
                enabled={this.state.buttonEnabled}
                title={this.props.i18n.t('SIGN IN')}
                wrapStyle={styles.LoginButtonWrap}
                style={styles.LoginButton}
                onPress={this.validateAndLogin}
              />
              <View style={styles.SignupLinkWrap}>
                <DefaultText style={styles.SignUp}>
                  {this.props.i18n.t("Don't have an account?")}
                </DefaultText>
                <LinkText
                  style={styles.SignUp}
                  onPress={() => this.navigateToSignup()}>
                  {this.props.i18n.t(' Sign Up')}
                </LinkText>
              </View>
              {/* <GoogleSigninButton
                style={{width: 192, height: 48}}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={this.signIn}
                disabled={this.state.isSigninInProgress}
              />
              <Text>{this.userGoogleInfo}</Text> */}
              <View style={styles.SocialLoginWrap}>
                <TouchableIcon
                  name={'facebook-f'}
                  color={Colors.ACCENT}
                  wrapStyle={styles.SocialIconWrap}
                  style={styles.SocialIcon}
                  onPress={this.facebookLogin}
                />
                <TouchableIcon
                  name={'google'}
                  color={Colors.ACCENT}
                  wrapStyle={styles.SocialIconWrap}
                  style={styles.SocialIcon}
                  onPress={this.googleLogin}
                />
              </View>
            </Wrap>
          </Body>
        </ImageBackground>
      </ScrollView>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(Login);

const styles = StyleSheet.create({
  Root: {
    backgroundColor: Colors.PRIMARY,
  },
  LoginBg: {
    // height: Dimensions.get('screen').height,
    justifyContent: 'space-between',
    resizeMode: 'center',
  },
  Header: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    // backgroundColor: 'red',
    shadowColor: 'transparent',
    paddingHorizontal: Platform.isPad ? '7%' : '10%',
    zIndex: 99,
    // backgroundColor: Colors.PRIMARY,
    shadowColor: Colors.ACCENT,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 4,
  },
  WelcomeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  LogoIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.WHITE,
    marginRight: 7,
    marginLeft: 20,
  },
  WelcomeText: {
    fontSize: Platform.isPad ? 24 : 20,
    fontFamily: Fonts.LIGHT,
    marginBottom: 7,
  },
  Logo: {
    fontSize: Platform.isPad ? 34 : 24,
    fontFamily: Fonts.LIGHT,
  },
  LogoBoldPart: {
    fontSize: Platform.isPad ? 34 : 24,
    fontFamily: Fonts.BOLD,
  },
  ShoppingGirl: {
    width: 'auto',
    height: Platform.isPad ? 350 : 250,
    marginTop: 20,
    resizeMode: 'contain',
  },
  Body: {
    minHeight: 'auto',
    paddingTop: 10,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: 50,
    // backgroundColor: 'red',
  },
  BodyWrap: {
    paddingVertical: Platform.isPad ? '5%' : '5%',
    paddingHorizontal: '10%',
  },
  SignUp: {
    textAlign: 'center',
    fontSize: 16,
  },
  ForgotPassword: {
    textAlign: 'right',
    fontSize: 16,
    marginTop: 10,
  },
  loginInput: {
    paddingHorizontal: 0,
    fontSize: 16,
  },
  loginInputWrap: {
    marginBottom: 10,
    borderRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.OVERLAY,
    backgroundColor: 'transparent',
    // backgroundColor: 'red'
  },
  LoginButtonWrap: {
    marginTop: 30,
    marginBottom: 20,
  },
  LoginButton: {
    fontSize: 16,
    paddingVertical: 15,
  },
  SignupLinkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  SocialLoginWrap: {
    width: '70%',
    marginLeft: '15%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    marginTop: 20,
    borderTopColor: Colors.ACCENT_SECONDARY,
    borderTopWidth: 1,
    // backgroundColor: 'black'
  },
  SocialIconWrap: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.ACCENT,
    borderWidth: 2,
    borderRadius: 30,
    marginRight: 15,
  },
  SocialIcon: {
    textAlign: 'center',
  },
});
