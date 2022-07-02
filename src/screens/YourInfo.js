import React, {PureComponent} from 'react';
import {
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  BottomBar,
  FullWidthButton,
  InputField,
  NoScrollBackground,
  ScrollableBody,
} from '../components/Common';
import {View, StyleSheet} from 'react-native';
import {Fonts, Message} from '../utils/Constants';
import Online from '../utils/Online';
import {BackWithError, ShowToast} from '../components/Functions';
import {NavigationEvents} from 'react-navigation';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';

export default class YourInfo extends PureComponent {
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    this.Online = new Online();

    this.state = {
      isLoading: true,
      partnerId: global.partnerId,
      userDetails: global.userDetails,
      id: null,
      name: null,
      email: null,
      phone: null,
      showInternetPopup: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.getUserInfo();
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

  getUserInfo = async () => {
    let response = await this.Online.viewPartnerDetails(this.state.partnerId);

    if (!response.result) {
      BackWithError(this.props, Message.ERROR_TRY_AGAIN);
      return;
    }

    let user = response.result;

    if (this._is_mounted) {
      this.setState({id: user.partner_id, name: user.name, email: user.email});
    }

    this.stopLoading();
  };

  validateForm = async () => {
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
      ShowToast('Enter your full name');
      return false;
    }

    return true;
  };

  validateAndUpdate = async () => {
    let canUpdate = await this.validateForm();

    if (!canUpdate) {
      return;
    }

    let response = await this.Online.updatePartnerDetails(
      this.state.id,
      this.state.name,
      this.state.email,
    );
    console.log('your info', response);
    if (!response.result) {
      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    ShowToast('Your info updated successfully');
    this.props.route.params.onBack();
    this.props.navigation.goBack();
  };

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  render() {
    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.getUserInfo();
          }}
          onDidBlur={this.removeListeners}
        /> */}
        <InternetPopup
          showModal={this.state.showInternetPopup}
          retryAction={() => {
            this.setState({
              showInternetPopup: false,
            });

            this.getUserInfo();
          }}
        />
        <NoScrollBackground>
          <HeaderBg>
            <Wrap>
              <View style={styles.Header}>
                <TouchableIcon
                  onPress={() => {
                    this.props.navigation.goBack();
                  }}
                  name={'chevron-left'}
                  style={styles.HeaderRightIcon}
                />
                <WhiteText style={styles.Logo}>{'Your Info'}</WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <ScrollableBody showLoader={this.state.isLoading}>
            <Wrap>
              <InputField
                label={'Email'}
                value={this.state.email}
                onInput={email => this.setState({email})}
                keyboardType={'email-address'}
                autoCapitalize={'none'}
                autoCompleteType={'email'}
                autoCorrect={false}
                style={styles.MarginBottom15}
              />
              <InputField
                label={'Name'}
                value={this.state.name}
                onInput={name => this.setState({name})}
                autoCompleteType={'name'}
                style={styles.MarginBottom15}
              />
              {/* <InputField
                label={'Phone'}
                value={this.state.phone}
                onInput={phone => this.setState({phone})}
                keyboardType="phone-pad"
                autoCompleteType="tel"
                autoCorrect={false}
                maxLength={10}
                style={styles.MarginBottom15}
              /> */}
            </Wrap>
          </ScrollableBody>
        </NoScrollBackground>
        {this.state.isLoading !== true ? (
          <BottomBar>
            <FullWidthButton
              title={'Save'}
              style={styles.SaveButton}
              onPress={() => this.validateAndUpdate()}
            />
          </BottomBar>
        ) : null}
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
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
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  MarginBottom15: {
    marginBottom: 15,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
  paddingTop15: {
    paddingTop: 15,
  },
});
