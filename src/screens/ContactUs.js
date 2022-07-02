import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import {
  HeaderBg,
  Body,
  Wrap,
  TouchableIcon,
  WhiteText,
} from '../components/Common';
import Constants, {
  Fonts,
  Colors,
  ApiCredentials as Credentials,
} from '../utils/Constants';

import axios from 'axios';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {useTheme} from '../context/ThemeProvider';
import ConfirmGoogleCaptcha from 'react-native-google-recaptcha-v2';
import Modal from 'react-native-modal';
import LottieView from 'lottie-react-native';

const width = Dimensions.get('screen').width;

const siteKey = '6LcxDU0fAAAAAFiiT1ZTkJr6SCpzUn1IjjTfuO9s';
const baseUrl = 'https://kanakinfosystems.com/';

class ContactUs extends React.Component {
  static contextType = useTheme();
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;

    // this.Online = new Online();
    // this.Offline = new Offline();

    this.state = {
      isLoading: true,
      wishlistDetails: [],
      wishlistIds: [],
      productsList: [],
      showNothingFound: false,
      cartDetails: global.cartDetails,
      countStats: global.countStats,
      showInternetPopup: false,
      userDetails: global.userDetails,
      query: '',
      description: '',
      setModalVisible: false,
      statuss: false,
    };
  }

  componentDidMount() {
    this._is_mounted = true;

    // console.log('details of user', this.state.userDetails);
  }

  toggleModal = res => {
    console.log('modal initiated');
    this.setState({
      setModalVisible: true,
    });
    // if (res === false) {
    //   console.log('if started');
    //   this.setState({setModalVisible: false});
    //   // return;
    // } else if (res === true) {
    //   this.setState({setModalVisible: true});
    //   console.log('true');
    //   // return;
    // }
  };

  formSubmit = async () => {
    if (!this.state.query) {
      Alert.alert('Field should be not empty before submit');
      return;
    } else if (!this.state.description) {
      Alert.alert('Field should be not empty before submit');
      return;
    }
    this.captchaForm.show();
  };

  /* --- Api Call --- */

  onMessage = async event => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        this.captchaForm.hide();
        return;
      } else {
        // this.captchaForm.hide();
        console.log('event.nativeEvent.data', event.nativeEvent.data);
        this.captchaForm.hide();
        // this.setState({
        //   setModalVisible: true
        // })
        this.submitForm();
      }
    }
    // this.submitForm();
  };

  submitForm = () => {
    try {
      axios
        .post('https://v13.kanakinfosystems.com/api/concat_us', {
          jsonrpc: '2.0',
          method: 'call',
          params: {
            name: "nitin",
            email: "mit@gmail.com",
            query: "query",
            description: "description",
          },
          id: Credentials.USER_ID,
        })
        .then(response => {
          console.log(
            'form submit response',
            response.data,
            this.state.userDetails.name,
            this.state.userDetails.email,
            this.state.query,
            this.state.description,
            Credentials.USER_ID,
            response.data.result,
          );
          // this.toggleModal();
          console.log('modal started');
          // this.captchaForm.hide();
          this.setState({
            setModalVisible: true,
          });
          // this.toggleModal(response.data.result);

          // setTimeout(() => {
          //   this.captchaForm.hide();
          //   // do what ever you want here
          // }, 1500);

          // if (response.data.result === true) {
          //   // this.toggleModal();
          //   // this.captchaForm.hide();
          //   console.log('sss');
          //   this.setState({
          //     setModalVisible: true,
          //   });
          // }
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  render() {
    const {t, i18n} = this.props;
    return (
      <View
        style={{
          // backgroundColor: this.context.theme.back.backgroundColor,
          backgroundColor: 'white',
          flex: 1,
        }}>
        <HeaderBg>
          <Wrap>
            <View style={styles.Header}>
              <TouchableIcon
                onPress={() => {
                  this.props.navigation.navigate('Home');
                }}
                name={'chevron-left'}
                style={styles.HeaderRightIcon}
              />
              <WhiteText style={styles.Logo}>
                {this.props.i18n.t('ContactUs')}
              </WhiteText>
              {/* <View style={styles.HeaderLeftContent}>
                <GoToIcon
                  props={this.props}
                  icon={'shopping-cart'}
                  route={'Cart'}
                  badge={this.state.countStats.total_cart_item}
                />

              </View> */}
            </View>
          </Wrap>
        </HeaderBg>
        <View
          style={{
            marginTop: 20,
            padding: 10,
            elevation: 2,
          }}>
          <TextInput
            placeholder={this.props.i18n.t('Query')}
            style={styles.TextInputStyle}
            onChangeText={value => this.setState({query: value})}
          />
          <TextInput
            placeholder={this.props.i18n.t('Description')}
            multiline={true}
            numberOfLines={5}
            style={[
              styles.TextInputStyle,
              {height: Platform.isPad ? 150 : 85, marginTop: 20},
            ]}
            onChangeText={value => this.setState({description: value})}
          />
        </View>
        <TouchableOpacity
          // onPress={() => {
            // this.captchaForm.show();
            // this.toggleModal()
            // this.formSubmit();
            // this.submitForm();
          // }}
          style={[styles.ButtonSubmit, {backgroundColor: this.context.theme}]}>
          <Text
            style={{
              fontSize: Platform.isPad ? 20 : 15,
              textAlign: 'center',
              color: 'white',
            }}>
            {this.props.i18n.t('SUBMIT')}
          </Text>
        </TouchableOpacity>

        <ConfirmGoogleCaptcha
          ref={_ref => (this.captchaForm = _ref)}
          siteKey={siteKey}
          baseUrl={baseUrl}
          languageCode="en"
          onMessage={this.onMessage}
        />

        {/* <View style={{justifyContent: 'center', alignSelf: 'center'}}> */}
        {this.state.setModalVisible ? (
          <Modal
            isVisible
            onBackdropPress={() => this.toggleModal()}
          >
            <View style={styles.modalView}>
              <View style={styles.LottieContainer}>
                <LottieView
                  source={require('../assets/images/successfully-done.json')}
                  style={{width: 150, height: 150, alignSelf: 'center'}}
                  autoPlay
                  loop
                />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 18,
                  marginTop: 15,
                  fontFamily: 'Lato-Bold',
                }}>
                Thank You, We will contact you soon!
              </Text>

              {/* <Button title="Hide modal" onPress={toggleModal} /> */}
            </View>
          </Modal>
        ) : null}

        {/* </View> */}

        <View style={styles.lowerContainer}>
          <Text
            style={{
              fontSize: 15,
              textAlign: 'center',
              color: 'black',
              fontFamily: 'Lato-Regular',
            }}>
            {this.props.i18n.t('INFO@KANAKINFOSYSTEMS.COM')}
          </Text>
          <View style={styles.socialMediaIconContainer}>
            <TouchableOpacity>
              <Image
                source={require('../assets/images/Facebook.png')}
                style={styles.socialMediaIcons}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={require('../assets/images/Linkedin.png')}
                style={styles.socialMediaIcons}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Image
                source={require('../assets/images/Instagram.png')}
                style={styles.socialMediaIcons}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={require('../assets/images/YouTube.png')}
                style={styles.socialMediaIcons}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

export default withTranslation()(ContactUs);

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
    // backgroundColor: 'green',
  },
  HeaderLeftContent: {
    flex: 1,
    alignItems: 'flex-end',
  },

  MarginRight7: {
    marginRight: 7,
  },
  socialMediaIcons: {
    width: width * 0.1,
    height: width * 0.1,
  },
  socialMediaIconContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
  },
  lowerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    // marginTop: 120,
    padding: 15,
    justifyContent: 'flex-end',
  },
  modalView: {
    width: 280,
    height: 180,
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 20,
    alignSelf: 'center',
    borderRadius: 20,
  },
  LottieContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  ButtonSubmit: {
    width: Platform.isPad ? width * 0.9 : 180,
    height: Platform.isPad ? 50 : 40,
    padding: 10,
    borderRadius: 7,

    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
  },
  TextInputStyle: {
    width: '95%',
    height: Platform.isPad ? 50 : 40,
    backgroundColor: 'white',
    alignSelf: 'center',
    borderRadius: 6,
    padding: Platform.isPad ? 10 : 5,
    borderWidth: 1,
  },
});

{
  /* <TouchableOpacity>
              <Image
                source={require('../assets/images/Twitter.png')}
                style={{width: width * 0.1, height: width * 0.1}}
              />
            </TouchableOpacity> */
}

{
  /* <TouchableOpacity>
              <Image
                source={require('../assets/images/Pinterest.png')}
                style={{width: width * 0.1, height: width * 0.1}}
              />
            </TouchableOpacity> */
}
