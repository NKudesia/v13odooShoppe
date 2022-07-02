import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  I18nManager,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Touch,
} from 'react-native';
import {color} from 'react-native-reanimated';
import {
  HeaderBg,
  Body,
  Wrap,
  TouchableIcon,
  WhiteText,
  NoScrollBackground,
  HWishListProductCard,
  DefaultText,
  Button,
  GoToIcon,
} from '../components/Common';
import Constants, {
  Message,
  Fonts,
  Models,
  LocalKeys,
  Colors,
} from '../utils/Constants';
import {ShowToast} from '../components/Functions';
import SwitchSelector from 'react-native-switch-selector';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-community/async-storage';
import RNRestart from 'react-native-restart';
import * as RNLocalize from 'react-native-localize';
import BouncyCheckbox from 'react-native-bouncy-checkbox';
import {useTheme} from '../context/ThemeProvider';
import {DefaultTheme} from '@react-navigation/native';
// import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';

const options = [
  {label: 'English', value: 'en'},
  {label: 'French', value: 'fr'},
  {label: 'Italian', value: 'it'},
  {label: 'Arabic', value: 'ar'},
];

class Setting extends React.Component {
  static contextType = useTheme();
  constructor(props) {
    super(props);

    this._is_mounted = false;
    this.internetListener = null;
    // this.getCurrency();
    // this.Online = new Online();
    // this.Offline = new Offline();
    // this.getCurrency();
    this.detectTheme();
    this.getTheme();
    this.state = {
      isLoading: true,
      wishlistDetails: [],
      wishlistIds: [],
      productsList: [],
      showNothingFound: false,
      cartDetails: global.cartDetails,
      countStats: global.countStats,
      showInternetPopup: false,
      checkBoxSelected: false,
      checkBoxSelected2: false,
      isActive: false,
      currency: [],
      currencyActiveId: '',
      code: '',
      themes: '',
      checkedBox: '',
      checkedBoxId: '',
      getId: '',
    };
  }

  componentDidMount() {
    this._is_mounted = true;
    this.detectTheme();
    // this.setLanguage();
    // alert(JSON.stringify(RNLocalize.getLocales()[0].languageCode));
    // console.log("location",this.props)
  }

  options2 = [{label: `${this.check}`, value: '1'}, {label: 'EUR', value: '4'}];

  detectTheme = async () => {
    const collected = await AsyncStorage.getItem('themeMode');
    console.log('collected', collected);
    this.setState({
      checkBox: collected,
      checkBoxSelected: true,
    });
    const getId = await AsyncStorage.getItem('checkboxId');
    console.log('theme items', getId);
    this.setState({
      getId: getId,
    });
  };

  // getCurrency = () => {
  //   axios
  //     .post('https://v13.kanakinfosystems.com/api/get/pricelist/list', {})
  //     .then(response => {
  //       // console.log('get currency', response.data.result);
  //       // this.setState({currency: response.data.result});
  //       const op = response.data.result;
  //       const r = op.map(lable => {
  //         // console.log(lable);
  //         return lable;
  //       });
  //       console.log('r', r);
  //       this.setState({currency: r.slice(0)});
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  // updateCurrency = async id => {
  //   const orderId = await AsyncStorage.getItem('orderID');
  //   console.log('orderId from stroage', orderId);
  //   axios
  //     .post('https://v13.kanakinfosystems.com/api/update/order/pricelist', {
  //       jsonrpc: '2.0',
  //       method: 'call',
  //       params: {
  //         order_id: orderId,
  //         pricelist_id: id,
  //       },
  //       id: 505136376,
  //     })
  //     .then(response => {
  //       console.log('update Currency', response.data);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  getTheme = () => {
    axios
      .post('https://v13.kanakinfosystems.com/api/get/theme/color', {
        jsonrpc: '2.0',
        method: 'call',
        params: {},
        id: 505136376,
      })
      .then(response => {
        // console.log('themes', response.data);
        // this.setDefaultTheme();
        this.setState({
          themes: response.data.result.theme_color,
        });
        // this.setDefaultTheme();
      });
  };

  setDefaultTheme = () => {
    this.state.themes.map(index => {
      console.log('theme setDefaultTheme', index);
    });
  };

  render() {
    const {t, i18n} = this.props;
    // console.log('currency from state', this.state.currency);
    const detectLanguage = () => {
      if (i18n.language == 'en') {
        setLanguage();

        return 0;
      } else if (i18n.language == 'fr') {
        setLanguage();

        return 1;
      } else if (i18n.language == 'it') {
        setLanguage();

        return 2;
      } else if (i18n.language == 'ar') {
        console.log('arabic', i18n.language);
        setLanguage();
        // I18nManager.forceRTL(true);
        return 3;
        // RNRestart.Restart();
      } else {
        return 0;
      }
    };

    const setLanguage = async value => {
      // console.log('sorted', value);
      // this.getLanguage();
      if (i18n.language == 'ar' || value == 'ar') {
        // await AsyncStorage.setItem('selectedLanguage', value);
        // await I18nManager.allowRTL(true);
        await I18nManager.forceRTL(true);
        // // alert('Restart Required');
        RNRestart.Restart();
      } else if (value == 'en') {
        await I18nManager.allowRTL(false);
        await I18nManager.forceRTL(false);
      } else if (value == 'fr') {
        await I18nManager.allowRTL(false);
        await I18nManager.forceRTL(false);
      } else if (value == 'it') {
        await I18nManager.allowRTL(false);
        await I18nManager.forceRTL(false);
      }
    };

    const changeTheme = defaultTheme => {
      if (this.state.checkBoxSelected == true) {
        this.setState({isActive: true});
        // console.log('theme change funcation', this.context.theme.themeMode);
        console.log('theme change funcation', defaultTheme);

        const dddd = this.context.func(defaultTheme);
        console.log('theme from cccc', dddd);
      }
    };

    const showTheme = item => {
      // console.log("theme items", item.item)

      console.log("this.context.theme",this.context.theme);

      return (
        <View
          style={[
            styles.themeTypeContainer,
            {
              backgroundColor:
                this.state.checkedBoxId == item.item.id
                  ? this.context.theme
                  : '#f9f9f9',
            }
          ]}>
          {/* <Text style={{color: 'black'}}>{item.item.id}</Text> */}

          <BouncyCheckbox
            isChecked={this.state.checkedBoxId == item.item.id ? true : false}
            // this.state.getId == item.item.id
            disableBuiltInState
            size={25}
            fillColor={
              this.state.checkBoxSelected ? item.item.theme_color : null
            }
            unfillColor="#FFFFFF"
            text={this.props.i18n.t(item.item.name)}
            iconStyle={{borderColor: 'transparent'}}
            textStyle={{
              fontFamily: 'Lato-Regular',
              textDecorationLine: 'none',
              color: this.context.theme === item.item.theme_color ? 'white' : 'black',
            }}
            onPress={async () => {
              this.setState({
                checkBoxSelected: true,
                checkedBoxId: item.item.id,
              });
              changeTheme(item.item.theme_color);
              await AsyncStorage.setItem('checkboxId', item.item.id.toString());
            }}
          />

          <View
            style={{
              backgroundColor: item.item.theme_color,
              // backgroundColor: 'black',
              padding: 10,
              width: 10,
              height: 10,
              borderRadius: 10,
            }}
          />
        </View>
      );
    };

    const handleBackground = id => {
      this.setState({currencyActiveId: id});
      console.log('item id', id);
    };

    return (
      <View
        style={{
          backgroundColor: this.context.theme.backgroundColor,
          // backgroundColor: 'red',
          flex: 1,
        }}>
        <HeaderBg>
          <Wrap>
            <View style={styles.Header}>
              <TouchableIcon
                onPress={() => {
                  // this.props.navigation.goBack();
                  this.props.navigation.navigate('Home');
                }}
                name={'chevron-left'}
                style={styles.HeaderRightIcon}
              />
              <WhiteText style={styles.Logo}>
                {this.props.i18n.t('Setting')}
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}>
          {/* ------Language----- */}

          <View
            style={[
              styles.sectionHeader,
              {backgroundColor: this.context.theme},
            ]}>
            <Text
              style={{
                color: Colors.WHITE,
                fontSize: 18,
                fontFamily: Fonts.BOLD,
              }}>
              {this.props.i18n.t('Language')}
            </Text>
          </View>

          <View style={{padding: 10, marginTop: 20}}>
            <SwitchSelector
              options={options}
              initial={detectLanguage()}
              // onPress={value => console.log(`Call onPress with value: ${value}`)}
              onPress={value => {
                i18n.changeLanguage(value);
                setLanguage(value);
                // .then(() => {
                //   I18nManager.forceRTL(this.props.i18.language === 'ar');
                //   RNRestart.Restart();
                // });
              }}
              // onPress={value => this.setLanguage(value)}
              selectedColor="white"
              buttonColor={this.context.theme}
              hasPadding
            />
          </View>

          {/* ------Theme------ */}

          <View
            style={[
              styles.sectionHeader,
              {backgroundColor: this.context.theme},
            ]}>
            <Text
              style={{
                color: Colors.WHITE,
                fontSize: 18,
                fontFamily: Fonts.BOLD,
              }}>
              {this.props.i18n.t('Theme')}
            </Text>
          </View>

          <View style={{padding: 20}}>
            <View>
              <FlatList
                data={this.state.themes}
                renderItem={item =>
                  // console.log("theme items", item)
                  showTheme(item)
                }
              />
            </View>
          </View>

          {/* ------ Theme End ------- */}
        </ScrollView>
      </View>
    );
  }
}

export default withTranslation()(Setting);

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
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  Body: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  BodyScroll: {
    display: 'flex',
    flex: 1,
  },
  BodyScrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  EmptyCartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  EmptyCartTitle: {
    textAlign: 'center',
    color: Colors.ACCENT,
    fontFamily: Fonts.REGULAR,
    fontSize: 18,
    marginVertical: 20,
  },
  EmptyCartButton: {paddingVertical: 10, fontSize: 14},
  MarginRight7: {
    marginRight: 7,
  },
  sectionHeader: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  themeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 25,
    marginTop: 12,
    alignItems: 'center',
    elevation: 2,
  },
});

{
  /* --------currency-------- */
}

{
  /* <View
            style={{
              // backgroundColor: [Colors.PRIMARY, this.context.backgroundColor],
              backgroundColor: this.context.theme,
              padding: 15,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}>
            <Text
              style={{
                color: Colors.WHITE,
                fontSize: 18,
                fontFamily: Fonts.BOLD,
              }}>
              {this.props.i18n.t('Currency')}
            </Text>
          </View> */
}

{
  /* <View style={{marginTop: 20}}>
            <FlatList
              // contentContainerStyle={{backgroundColor: 'yellow'}}
              data={this.state.currency}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              bounces={false}
              renderItem={item => {
                // console.log('render item', item.item.name);
                return (
                  <View
                    style={{
                      // backgroundColor: 'yellow',
                      padding: 10,
                    }}>
                    <View style={{backgroundColor: 'transparent'}}>
                      <TouchableOpacity
                        onPress={async () => {
                          this.updateCurrency(item.item.id),
                            await AsyncStorage.setItem(
                              'currencyCode',
                              item.item.id.toString(),
                            ),
                            handleBackground(item.item.id.toString()),
                            ShowToast(`Selected ${item.item.name}`);
                        }}
                        style={{
                          backgroundColor:
                            this.state.currencyActiveId == item.item.id
                              ? this.context.theme
                              : 'white',
                          // backgroundColor: this.state.currencyActive
                          //   ? 'red'
                          //   : this.context.theme.back.backgroundColor,
                          padding: 10,
                          borderRadius: 10,
                          elevation: 2,
                          // width: 180,
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontFamily: 'Lato-Regular',
                            fontSize: 15,
                            color:
                              this.state.currencyActiveId == item.item.id
                                ? 'white'
                                : 'black',
                          }}>
                          {item.item.name}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
           {/* <SwitchSelector
            options={this.options2}
            initial={0}
            // onPress={id => console.log(`Call onPresssss with value: ${id}`)}
            onPress={async value => {
              await AsyncStorage.setItem('selectedCurrency', value),
                console.log('value', value);
            }}
            selectedColor="white"
            buttonColor={this.context.theme.back.backgroundColor}
            hasPadding
          /> */
}
{
  /* </View> */
}

{
  /* <View
                style={{
                  backgroundColor:
                    this.context.theme.themeMode === 'defaultTheme'
                      ? this.context.theme.back.backgroundColor
                      : '#f9f9f9',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 25,
                  marginTop: 12,
                  alignItems: 'center',
                  elevation: 2,
                }}>
                <BouncyCheckbox
                  isChecked={this.state.checkBoxSelected}
                  size={25}
                  fillColor="#35BDD0"
                  unfillColor="#FFFFFF"
                  text={this.props.i18n.t('Default Theme')}
                  iconStyle={{borderColor: 'transparent'}}
                  textStyle={{
                    fontFamily: 'Lato-Regular',
                    textDecorationLine: 'none',
                    color:
                      this.context.theme.themeMode === 'defaultTheme'
                        ? 'white'
                        : 'black',
                  }}
                  onPress={() => {
                    this.setState({checkBoxSelected: true});
                    changeTheme('defaultTheme');
                  }}
                />

                <View
                  style={{
                    backgroundColor: '#35BDD0',
                    padding: 10,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </View> */
}

{
  /* <View
                style={{
                  // backgroundColor: 'transparent',
                  backgroundColor:
                    this.context.theme.themeMode === 'darkMode'
                      ? this.context.theme.back.backgroundColor
                      : '#f9f9f9',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 25,
                  marginTop: 12,
                  alignItems: 'center',
                  elevation: 2,
                }}>
                <BouncyCheckbox
                  isChecked={this.state.checkBoxSelected}
                  size={25}
                  fillColor="black"
                  unfillColor="#FFFFFF"
                  text={this.props.i18n.t('DarkMode')}
                  iconStyle={{borderColor: 'transparent'}}
                  textStyle={{
                    fontFamily: 'Lato-Regular',
                    textDecorationLine: 'none',
                    color:
                      this.context.theme.themeMode === 'darkMode'
                        ? 'white'
                        : 'black',
                  }}
                  onPress={() => {
                    this.setState({checkBoxSelected: true});
                    changeTheme('darkMode');
                  }}
                />

                <View
                  style={{
                    backgroundColor: 'black',
                    padding: 10,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </View> */
}

{
  /* <View
                style={{
                  // backgroundColor: 'transparent',
                  backgroundColor:
                    this.context.theme.themeMode === 'hotRed'
                      ? this.context.theme.back.backgroundColor
                      : '#f9f9f9',
                  marginTop: 12,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 25,
                  alignItems: 'center',
                  elevation: 2,
                }}>
                <BouncyCheckbox
                  isChecked={this.state.checkBoxSelected}
                  size={25}
                  fillColor="#B4161B"
                  unfillColor="#FFFFFF"
                  text={this.props.i18n.t('HotRed')}
                  iconStyle={{borderColor: 'transparent'}}
                  textStyle={{
                    fontFamily: 'Lato-Regular',
                    textDecorationLine: 'none',
                    color:
                      this.context.theme.themeMode === 'hotRed'
                        ? 'white'
                        : 'black',
                  }}
                  onPress={() => {
                    this.setState({checkBoxSelected: true});
                    changeTheme('hotRed');
                  }}
                />

                <View
                  style={{
                    backgroundColor: '#B4161B',
                    padding: 10,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </View> */
}

{
  /* <View
                style={{
                  // backgroundColor: 'transparent',
                  backgroundColor:
                    this.context.theme.themeMode === 'parrotGreen'
                      ? this.context.theme.back.backgroundColor
                      : '#f9f9f9',

                  marginTop: 12,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 25,
                  alignItems: 'center',
                  elevation: 2,
                }}>
                <BouncyCheckbox
                  isChecked={this.state.checkBoxSelected}
                  size={25}
                  fillColor="#6EC72D"
                  unfillColor="#FFFFFF"
                  text={this.props.i18n.t('ParrotGreen')}
                  iconStyle={{borderColor: 'transparent'}}
                  textStyle={{
                    fontFamily: 'Lato-Regular',
                    textDecorationLine: 'none',
                    color:
                      this.context.theme.themeMode === 'parrotGreen'
                        ? 'white'
                        : 'black',
                  }}
                  onPress={() => {
                    this.setState({checkBoxSelected: true});
                    changeTheme('parrotGreen');
                  }}
                />

                <View
                  style={{
                    backgroundColor: '#6EC72D',
                    padding: 10,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </View> */
}

{
  /* <View
                style={{
                  // backgroundColor: 'transparent',
                  backgroundColor:
                    this.context.theme.themeMode === 'organge'
                      ? this.context.theme.back.backgroundColor
                      : '#f9f9f9',
                  marginTop: 12,

                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 25,
                  alignItems: 'center',
                  elevation: 2,
                }}>
                <BouncyCheckbox
                  isChecked={this.state.checkBoxSelected}
                  size={25}
                  fillColor="#E07C24"
                  unfillColor="#FFFFFF"
                  text={this.props.i18n.t('Organge')}
                  iconStyle={{borderColor: 'transparent'}}
                  textStyle={{
                    fontFamily: 'Lato-Regular',
                    textDecorationLine: 'none',
                    color:
                      this.context.theme.themeMode === 'organge'
                        ? 'white'
                        : 'black',
                  }}
                  onPress={() => {
                    this.setState({checkBoxSelected: true});
                    changeTheme('organge');
                  }}
                />

                <View
                  style={{
                    backgroundColor: '#E07C24',
                    padding: 10,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </View> */
}

{
  /* <View
                style={{
                  // backgroundColor: 'transparent',
                  backgroundColor:
                    this.context.theme.themeMode === 'pinky'
                      ? this.context.theme.back.backgroundColor
                      : '#f9f9f9',
                  marginTop: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 10,
                  borderRadius: 25,
                  alignItems: 'center',
                  elevation: 2,
                }}>
                <BouncyCheckbox
                  size={25}
                  fillColor="#E03B8B"
                  unfillColor="#FFFFFF"
                  text={this.props.i18n.t('Pinky')}
                  iconStyle={{borderColor: 'transparent'}}
                  textStyle={{
                    fontFamily: 'Lato-Regular',
                    textDecorationLine: 'none',
                    color:
                      this.context.theme.themeMode === 'pinky'
                        ? 'white'
                        : 'black',
                  }}
                  onPress={() => {
                    changeTheme('pinky');
                  }}
                  isChecked={false}
                  // disableBuiltInState={true}
                />

                <View
                  style={{
                    backgroundColor: '#E03B8B',
                    padding: 10,
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                  }}
                />
              </View> */
}
