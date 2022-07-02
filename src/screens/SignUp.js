import React, {PureComponent} from 'react';
import {View, StyleSheet, Image, Keyboard} from 'react-native';
import Constants, {
  Colors,
  Fonts,
  LocalKeys,
  Message,
  Models,
} from '../utils/Constants';
import {
  HeaderBg,
  Body,
  Wrap,
  InputField,
  Background,
  TouchableIcon,
  FullWidthButton,
  DefaultText,
  LinkText,
  WhiteText,
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
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import {withTranslation} from 'react-i18next';
import {i18n} from 'i18next';

class SignUp extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();
    this.Offline = new Offline();

    this.textInputs = {
      email: null,
      name: null,
      phone: null,
      password: null,
      confirmPassword: null,
    };

    this.state = {
      fromCart: this.props.route.params
        ? this.props.route.params.cart ?? false
        : false,
      email: '',
      name: '',
      phone: '',
      password: '',
      showPassword: true,
      confirmPassword: '',
      buttonEnabled: true,
      showInternetPopup: false,
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

  facebookSignup = () => {
    InitiateFbLogin(async user => {
      if (!user) {
        return;
      }

      let signup = await this.Online.facebookSignup(
        user.name,
        user.email,
        user.userID,
        user.accessToken,
      );

      if (signup.error) {
        if (Constants.DEBUG) {
          console.log(signup);
        }
        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }

      global.loginType = Constants.LOGIN_TYPES.FACEBOOK;

      let userDetails = {
        type: Constants.LOGIN_TYPES.FACEBOOK,
        uid: signup.result.uid,
        partner_id: signup.result.partner_id,
        ...user,
      };

      this.afterSignup(userDetails);
    });
  };

  googleSignup = () => {
    InitiateGoogleLogin(async user => {
      console.log('signup', user);
      if (!user) {
        return;
      }

      let signup = await this.Online.googleSignup(
        user.name,
        user.email,
        user.id,
        user.accessToken,
        user.photo,
      );

      if (signup.error) {
        if (Constants.DEBUG) {
          console.log(signup);
        }
        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }

      global.loginType = Constants.LOGIN_TYPES.GOOGLE;

      let userDetails = {
        type: Constants.LOGIN_TYPES.GOOGLE,
        uid: signup.result.uid,
        partner_id: signup.result.partner_id,
        email: user.email,
        name: user.name,
        accessToken: user.accessToken,
      };

      this.afterSignup(userDetails);
    });
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
    if (this.state.name.length < 1) {
      ShowToast('Enter your name');
      return false;
    }
    if (this.state.password.length < 1) {
      ShowToast('Enter password');
      return false;
    }
    if (this.state.confirmPassword.length < 1) {
      ShowToast('Enter confirm password');
      return false;
    }
    if (this.state.password !== this.state.confirmPassword) {
      ShowToast('Passwords do not match');
      return false;
    }

    return true;
  };

  emailExists = async () => {
    let response = await this.Online.customSearch(
      Models.PARTNER,
      [],
      [['email', '=', this.state.email]],
    );

    if (response.error) {
      if (Constants.DEBUG) {
        console.log(response.error.data.arguments[0]);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    return response.result.length > 0;
  };

  validateAndRegister = async () => {
    if (this._is_mounted) {
      this.setState({
        buttonEnabled: false,
      });
    }

    let canRegister = await this.validateForm();

    if (!canRegister) {
      if (this._is_mounted) {
        this.setState({
          buttonEnabled: true,
        });
      }
      return;
    }

    let emailExists = await this.emailExists();

    if (emailExists) {
      if (this._is_mounted) {
        this.setState({
          buttonEnabled: true,
        });
      }
      ShowToast('This email is already registered with us');
      return;
    }

    let result = await this.Online.register(
      this.state.email,
      this.state.name,
      this.state.password,
    );

    if (!result) {
      if (this._is_mounted) {
        this.setState({
          buttonEnabled: true,
        });
      }
      ShowToast('Registration failed, Try again later');
      return;
    }

    this.saveLocalUser(result.result);
  };

  saveLocalUser = async result => {
    let userDetails = {
      type: Constants.LOGIN_TYPES.EMAIL,
      uid: result.uid,
      partner_id: result.partner_id,
      email: this.state.email,
      name: this.state.name,
      password: this.state.password,
    };

    this.afterSignup(userDetails);
  };

  afterSignup = async userDetails => {
    await this.Offline.set(LocalKeys.USER_DETAILS, userDetails);

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

          ShowToast('Registration successful');
          this.navigateOnSignup();
        });
      });
    });
  };

  navigateOnSignup = () => {
    if (this.state.fromCart) {
      this.props.navigation.dispatch(
        StackActions.replace({
          routeName: 'BillingAndShipping',
        }),
      );
      return;
    }

    this.props.navigation.navigate('Home', {
      // routeName: 'Home',
    });
  };

  navigateToLogin = () => {
    if (this.state.fromCart) {
      this.props.navigation.navigate('Login', {
        // routeName: 'Login',
        // params: {
        cart: true,
        // },
      });
      return;
    }

    // this.props.navigation.dispatch(StackActions.pop(2));
    this.props.navigation.navigate('Login');
  };

  render() {
    return (
      <Background>
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
        <HeaderBg style={styles.HeaderBg}>
          <Wrap>
            <View style={styles.Header}>
              <TouchableIcon
                onPress={() => {
                  this.props.navigation.goBack();
                }}
                name={'chevron-left'}
                style={styles.HeaderRightIcon}
              />
              <WhiteText
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  fontSize: 20,
                  fontFamily: Fonts.REGULAR,
                }}>
                {this.props.i18n.t('Sign Up')}
              </WhiteText>
            </View>
          </Wrap>
        </HeaderBg>
        <Body style={styles.Body}>
          <Wrap style={styles.BodyWrap}>
            <View style={styles.WelcomeWrap}>
              <DefaultText style={styles.SignupText}>
                {this.props.i18n.t('Sign up to')}
              </DefaultText>
              <View style={styles.LogoWrap}>
                <Image
                  source={require('../assets/icon.png')}
                  style={styles.LogoIcon}
                />
                <DefaultText style={styles.Logo}>
                  {this.props.i18n.t('Odoo')}
                  <DefaultText style={styles.LogoBoldPart}>
                    {this.props.i18n.t('Shoppe')}
                  </DefaultText>
                </DefaultText>
              </View>
              <DefaultText style={styles.WelcomeText}>
                {this.props.i18n.t(
                  'Enter your informations below or Sign up with a social account',
                )}
              </DefaultText>
            </View>
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
                this.textInputs.name.focus();
              }}
            />
            <InputField
              placeholder={this.props.i18n.t('Name')}
              value={this.state.name}
              onInput={name => this.setState({name})}
              autoCompleteType={'name'}
              style={styles.loginInputWrap}
              inputStyle={styles.loginInput}
              refKey={ref => (this.textInputs.name = ref)}
              onSubmitEditing={() => {
                this.textInputs.password.focus();
              }}
            />
            {/* <InputField
                placeholder={'Phone'}
                value={this.state.phone}
                onInput={phone => this.setState({phone})}
                keyboardType="phone-pad"
                autoCompleteType="tel"
                autoCorrect={false}
                maxLength={10}
                style={styles.loginInputWrap}
                inputStyle={styles.loginInput}
                refKey={ref => (this.textInputs.phone = ref)}
                onSubmitEditing={() => {
                  this.textInputs.email.focus();
                }}
              /> */}
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
              onSubmitEditing={() => {
                this.textInputs.confirmPassword.focus();
              }}
            />
            <InputField
              placeholder={this.props.i18n.t('Confirm Password')}
              value={this.state.confirmPassword}
              onInput={confirmPassword => this.setState({confirmPassword})}
              autoCapitalize={'none'}
              autoCorrect={false}
              style={styles.loginInputWrap}
              inputStyle={styles.loginInput}
              isPassword={true}
              maxLength={15}
              refKey={ref => (this.textInputs.confirmPassword = ref)}
              onSubmitEditing={this.validateAndRegister}
              returnKeyType={'done'}
              returnKeyLabel={'Sign Up'}
            />
            <FullWidthButton
              enabled={this.state.buttonEnabled}
              title={this.props.i18n.t('SIGN UP')}
              wrapStyle={styles.LoginButtonWrap}
              style={styles.LoginButton}
              onPress={this.validateAndRegister}
            />
            <View style={styles.SignupLinkWrap}>
              <DefaultText style={styles.SignUp}>
                {this.props.i18n.t('Already have an account?')}
              </DefaultText>
              <LinkText
                style={styles.SignUp}
                onPress={() => this.navigateToLogin()}>
                {this.props.i18n.t('Sign In')}
              </LinkText>
            </View>
            <View style={styles.SocialLoginWrap}>
              <TouchableIcon
                onPress={this.facebookSignup}
                name={'facebook-f'}
                color={Colors.ACCENT}
                wrapStyle={styles.SocialIconWrap}
                style={styles.SocialIcon}
              />
              <TouchableIcon
                onPress={this.googleSignup}
                name={'google'}
                color={Colors.ACCENT}
                wrapStyle={styles.SocialIconWrap}
                style={styles.SocialIcon}
              />
            </View>
          </Wrap>
        </Body>
      </Background>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

export default withTranslation()(SignUp);

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
  },
  HeaderBg: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderRightIcon: {
    marginRight: 15,
  },
  HeaderLeftContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  MarginBottom15: {
    marginBottom: 15,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
  root: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
  },
  WelcomeWrap: {
    marginBottom: '10%',
    width: '70%',
    marginLeft: '15%',
  },
  SignupText: {
    fontSize: 20,
    fontFamily: Fonts.LIGHT,
  },
  LogoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  LogoIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.PRIMARY,
    marginRight: 7,
    marginLeft: 20,
  },
  Logo: {
    fontSize: 24,
    fontFamily: Fonts.REGULAR,
    color: Colors.PRIMARY,
  },
  LogoBoldPart: {
    fontSize: 24,
    fontFamily: Fonts.BOLD,
    color: Colors.PRIMARY,
  },
  WelcomeText: {
    textAlign: 'center',
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
  ShoppingGirl: {
    width: 'auto',
    height: 250,
    marginTop: 30,
    resizeMode: 'contain',
  },
  Body: {
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // backgroundColor: 'red',
    marginTop: 10,
    minHeight: '100%',
  },
  BodyWrap: {
    paddingVertical: '5%',
    paddingHorizontal: '10%',
  },
  SignUp: {
    textAlign: 'center',
    fontSize: 16,
  },
  ForgotPassword: {
    textAlign: 'right',
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
});
