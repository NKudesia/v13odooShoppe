import React, {PureComponent} from 'react';
import {Dimensions, StyleSheet, Platform, View, Image} from 'react-native';
import {
  Body,
  Background,
  HeaderBg,
  Wrap,
  TouchableIcon,
  WhiteText,
  OptionsMenu,
  GoToIcon,
  OnlyTouch,
} from '../components/Common';
import Constants, {Fonts, Colors, LocalKeys, Message} from '../utils/Constants';
import Online from '../utils/Online';
import {StackActions, NavigationEvents} from 'react-navigation';
import Offline from '../utils/Offline';
import {
  ShowToast,
  IsRatingEnabled,
  GetCartWishlistCount,
  DecodeImage,
} from '../components/Functions';
import * as ImagePicker from 'react-native-image-picker';
import InternetPopup from '../components/InternetPopup';
import NetInfo from '@react-native-community/netinfo';
import ImgToBase64 from 'react-native-image-base64';
import {Base64} from 'js-base64';
import {createIconSetFromFontello} from 'react-native-vector-icons';
import RNFetchBlob from 'rn-fetch-blob';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {i18n} from 'i18next';
import AsyncStorage from '@react-native-community/async-storage';

class MyAccount extends PureComponent {
  constructor(props) {
    super(props);

    this.Online = new Online();
    this.Offline = new Offline();

    this._is_mounted = false;
    this.internetListener = null;
    this.getUpdatedDetail();

    this.state = {
      isLoading: false,
      partnerId: global.partnerId,
      userDetails: global.userDetails,
      profilePic: global.profilePic,
      showInternetPopup: false,
      converted: '',
      updatedName: null,
      updatedMailId: null,
    };
    // console.log('global.userDetails from constructor', global.userDetails);
    // console.log(' userDetails', userDetails);

    console.log('global.profilePic', global.profilePic, profilePic);
    console.log('Platform', Platform);
  }

  componentDidMount() {
    this._is_mounted = true;
    // console.log('profilePic from state', profilePic);
    this.getUpdatedDetail();

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // do something
      this.createListeners();
      this.stopLoading();
      // this.updateImage();
      this.setState({
        userDetails: global.userDetails,
        profilePic: this.state.profilePic,
      });
    });
  }
  getUpdatedDetail = async () => {
    // console.log('yes');
    //  const p =  await AsyncStorage.getItem('pic');

    //  this.setState({profilePic: p});

    let response = await this.Online.viewPartnerDetails(this.state.partnerId);

    // console.log('response getUpdatedDetail', response.result);
    this.setState({
      userDetails: response.result,
      updatedMailId: response.result.email,
    });
    global.userDetails = response.result;

    // console.log('after update', global.userDetails);
  };

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

  showPicker = () => {
    ImagePicker.launchImageLibrary(
      {
        title: 'Select Profile Picture',
        allowsEditing: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
        maxHeight: 256,
        height: 256,
        base64: true,
        customButtons: [
          {
            name: 'remove',
            title: 'Remove profile picture',
          },
        ],
      },
      async res => {
        // console.log('from res', res.assets);
        // console.log('fffff', res.Base64);

        let u = 0;
        let converted = 0;
        // console.log(
        //   'res check',
        res.assets.map(uri => {
          // console.log('uri', uri.uri);
          u = uri.uri;
          // console.log('uuuuu', u);
          // ImgToBase64.getBase64String(`${uri.uri}`)
          //   .then(base64String => {
          //     // Send the base64String to server
          //     console.log('from imgToBase64', base64String);
          //     this.setState({converted: base64String})
          //   })
          //   .catch(err => console.log(err));
          if (Platform.OS === 'ios') {
            let arr = u.split('/');
            const dirs = RNFetchBlob.fs.dirs;
            filePath = `${dirs.DocumentDir}/${arr[arr.length - 1]}`;
            console.log(' filePath', filePath);
            u = filePath;
            // this.setState({converted: filePath});
          }
          else {
            filePath = u;
          }
        }),
          // );

          console.log('u', u);

        RNFetchBlob.fs.readFile(filePath, 'base64').then(data => {
          // handle the data ..
          // console.log('data', data);
          // this.state.converted = data;

          this.setState({
            // profilePic: data.path,
            converted: data,
          });

          this.updateImage(data);

          // console.log('u from base64', u);
        });
        // {
        //   ImgToBase64.getBase64String(u) //is is where you put image url from the ImagePicker
        //     .then(base64String => doSomethingWith(base64String))
        //     .catch(err => doSomethingWith(err));
        // }

        if (res.error) {
          if (Constants.DEBUG) {
            console.log(res.error);
          }
          ShowToast(
            res.error.indexOf('Permissions') < 0
              ? Message.ERROR_TRY_AGAIN
              : 'Allow permissions to update avatar',
          );
          return;
        }

        if (res.customButton) {
          console.log('customButton');
          if (res.customButton === 'remove') {
            let response = await this.Online.removeProfilePic(global.partnerId);

            if (response.error) {
              if (Constants.DEBUG) {
                console.log(response.error.data.arguments[0]);
              }
              ShowToast(Message.ERROR_TRY_AGAIN);
              return;
            }

            if (response.result.success) {
              global.profilePic = null;

              if (this._is_mounted) {
                this.setState({
                  profilePic: global.profilePic,
                });
              }

              ShowToast('Avataar Updated');
            }
            return;
          }
        }

        // if (res) {
        //   let response = await this.Online.updateProfilePic(
        //     global.partnerId,
        //     this.state.converted,
        //   );
        //   console.log('image response', global.partnerId, this.state.converted);
        //   console.log('response', response);
        //   if (response.error) {
        //     if (Constants.DEBUG) {
        //       console.log(response.error.data.arguments[0]);
        //     }
        //     ShowToast(Message.ERROR_TRY_AGAIN);
        //     return;
        //   }

        //   if (response.result.success) {
        //     global.profilePic = DecodeImage(response.result.image);

        //     console.log(' if global.profile', global.profilePic);

        //     this.setState({
        //       profilePic: global.profilePic,
        //     });
        //     await AsyncStorage.setItem('pic', global.profilePic);
        //     // if (this._is_mounted) {
        //     //   this.setState({
        //     //     profilePic: response.result.image,
        //     //   });
        //     // }

        //     ShowToast('Avataar Updated');
        //   }
        //   return;
        // }
      },
    );
  };

  updateImage = async item => {
    if (this._is_mounted) {
      let response = await this.Online.updateProfilePic(global.partnerId, item);
      console.log('image response', global.partnerId, this.state.converted);
      console.log('response', response);
      if (response.error) {
        if (Constants.DEBUG) {
          console.log(response.error.data.arguments[0]);
        }
        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }

      if (response.result.success) {
        global.profilePic = response.result.image;

        console.log(' if global.profile', global.profilePic);

        // this.setState({
        //   profilePic: global.profilePic,
        // });
        // await AsyncStorage.setItem('pic', global.profilePic);
        if (this._is_mounted) {
          this.setState({
            profilePic: response.result.image,
          });
        }

        ShowToast('Avataar Updated');
      }
      return;
    }
  };

  logout = async () => {
    await this.Online.logout();

    let response = await this.Offline.set(LocalKeys.USER_DETAILS, '');

    if (!response) {
      if (Constants.DEBUG) {
        console.log(response);
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
      return;
    }

    global.isGuest = true;
    global.partnerId = global.publicUserId;
    global.profilePic = null;

    IsRatingEnabled().then(async ratingEnabled => {
      global.ratingEnabled = ratingEnabled;

      let res = await this.Offline.set(LocalKeys.CART_DETAILS, '');

      if (!res) {
        if (Constants.DEBUG) {
          console.log(res);
        }

        ShowToast(Message.ERROR_TRY_AGAIN);
        return;
      }

      global.userDetails = {};
      global.cartDetails = {};

      GetCartWishlistCount().finally(() => {
        ShowToast('Logout Successful');
        // this.props.navigation.navigate.dispatch(StackActions.popToTop());
      });

      GetCartWishlistCount(
        global.loggedInId || null,
        this.props.cartDetails?.cart_id || null,
      ).finally(() => {
        ShowToast('Logout Successful');
        // NavService.replace('Login', {screen: 'Login'});
        this.props.navigation.navigate('Login');
      });
    });
  };

  menu = [
    {
      title: this.props.i18n.t('Order History'),
      action: () => {
        this.props.navigation.navigate('OrderHistory', {
          // routeName: 'OrderHistory',
        });
      },
    },
    {
      title: this.props.i18n.t('Manage Address'),
      action: () => {
        this.props.navigation.navigate('AllAddress', {
          // routeName: 'AllAddress',
        });
      },
    },
    {
      title: this.props.i18n.t('Logout'),
      action: this.logout,
    },
  ];

  stopLoading = () => {
    if (this._is_mounted) {
      this.setState({isLoading: false});
    }
  };

  render() {
    const {t, i18n} = this.props;
    // let userName = this.state.userDetails.name;

    return (
      <View style={styles.RenderWrap}>
        {/* <NavigationEvents
          onDidFocus={() => {
            this.createListeners();
            this.stopLoading();
          }}
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
        <Background>
          <HeaderBg>
            <Wrap>
              <View style={styles.HeaderOne}>
                <TouchableIcon
                  onPress={() => {
                    this.props.navigation.navigate('Home');
                  }}
                  name={'chevron-left'}
                  style={styles.HeaderOneBack}
                />
                <WhiteText style={styles.HeaderOneTitle}>
                  {'My Account'}
                </WhiteText>
                <View style={styles.HeaderLeftContent}>
                  {global.loginType ? (
                    // <GoToIcon
                    //   props={this.props}
                    //   icon={'edit'}
                    //   route={'YourInfo'}
                    //   style={styles.HeaderRightIcon}
                    // />
                    <TouchableIcon
                      name={'edit'}
                      color={Colors.ACCENT}
                      onPress={() => {
                        this.props.navigation.navigate('YourInfo', {
                          onBack: () => this.getUpdatedDetail(),
                        });
                      }}
                    />
                  ) : null}
                </View>
              </View>
              <View style={styles.HeaderTwo}>
                <OnlyTouch
                  onPress={this.showPicker}
                  style={styles.ChangeAvataar}>
                  <View style={styles.HeaderTwoAvataar}>
                    {this.state.profilePic !== null ? (
                      (console.log('return', this.state.profilePic),
                      (
                        <Image
                          source={{uri: this.state.profilePic}}
                          style={styles.AvataarImage}
                        />
                      ))
                    ) : (
                      <>
                        <TouchableIcon
                          name={'user'}
                          color={Colors.PRIMARY}
                          // color="red"
                        />
                      </>
                    )}
                  </View>
                  <WhiteText
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      textAlign: 'center',
                      fontFamily: Fonts.REGULAR,
                      color: Colors.LIGHT_GREY,
                    }}>
                    {this.props.i18n.t('Change Avataar')}
                  </WhiteText>
                </OnlyTouch>
                <WhiteText style={styles.HeaderTwoName}>
                  {/* {console.log('from return', userName)} */}
                  {this.state.userDetails.name}
                  {/* {this.state.updatedName == null ? this.state.userDetails.name : this.state.updatedName }   */}
                  {/* {global.userDetails.name} */}
                </WhiteText>
                <WhiteText style={styles.HeaderTwoEmail}>
                  {this.state.userDetails.email}
                  {/* {this.state.updatedMailId == null ? this.state.userDetails.email : this.state.updatedMailId} */}
                  {/* {global.userDetails.email} */}
                </WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <Body
            showLoader={this.state.isLoading}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              minHeight:
                Dimensions.get('window').height - Constants.HEADER_HEIGHT,
              paddingTop: 0,
            }}>
            <OptionsMenu data={this.menu} />
          </Body>
        </Background>
      </View>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;

    this.removeListeners();
  }
}
export default withTranslation()(MyAccount);

const styles = StyleSheet.create({
  RenderWrap: {
    flex: 1,
  },
  HeaderBg: {
    height: 'auto',
  },
  HeaderOne: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderOneBack: {
    marginRight: 15,
  },
  HeaderLeftContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  HeaderOneTitle: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  HeaderTwo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '5%',
    paddingVertical: Platform.OS === 'android' ? 27 : 27,
  },
  ChangeAvataar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  HeaderTwoAvataar: {
    width: 80,
    height: 80,
    marginBottom: 5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.WHITE,
    // backgroundColor: 'red',
  },
  AvataarImage: {
    width: '100%',
    height: 80,
  },
  HeaderTwoName: {
    fontFamily: Fonts.REGULAR,
    fontSize: 18,
    marginBottom: 5,
  },
  HeaderTwoEmail: {
    fontFamily: Fonts.REGULAR,
    fontSize: 14,
  },
  paddingBottom10: {
    paddingBottom: 10,
  },
  paddingBottom5: {
    paddingBottom: 5,
  },
  MarginBottom15: {
    marginBottom: 15,
  },
  CardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ACCENT_SECONDARY,
  },
  Title: {
    fontFamily: Fonts.REGULAR,
    fontSize: 16,
  },
  CardBody: {
    paddingVertical: 10,
  },
  CardTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  CardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.ACCENT_SECONDARY,
  },
  CardFooterTitle: {
    fontFamily: Fonts.REGULAR,
  },
  SaveButton: {
    textAlign: 'center',
    fontSize: 18,
    paddingVertical: 12,
  },
});
