/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  Text,
} from 'react-native';
import {
  HeaderBg,
  DefaultText,
  TouchableIcon,
  OnlyTouch,
  WhiteText,
} from './Common';
import Constants, {Colors, Fonts, Models, Message} from '../utils/Constants';
import LinearGradient from 'react-native-linear-gradient';
import {DecodeImage, ShowToast} from './Functions';
import Online from '../utils/Online';
import {OtherMenu} from '../data';
import {Translation, useTranslation, withTranslation} from 'react-i18next';
import {i18n} from 'i18next';

class Drawer extends React.Component {
  constructor(props) {
    super(props);

    this._is_mounted = false;

    this.Online = null;

    this.state = {
      level1: {
        visible: false,
        title: null,
        data: [],
      },
      level2: {
        visible: false,
        title: null,
        data: [],
      },
    };
  }

  componentDidMount() {
    this._is_mounted = true;
  }

  MenuList = ({data}) => (
    // console.log('data', data),
    <View
      style={{
        paddingBottom: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderStyle: 'solid',
        borderBottomColor: Colors.ACCENT_SECONDARY,
      }}>
      {/* <View style={styles.MenuListItem}> */}
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('Categories')}
        style={styles.MenuListItem}>
        <View style={styles.MenuListItemLeft}>
          <Image
            source={require('../assets/images/menu.png')}
            style={{
              ...styles.MenuListItemLeftIcon,
              resizeMode: 'contain',
            }}
          />
          <Text style={styles.MenuListItemLeftText}>
            Shop by Categories
          </Text>
        </View>
        <TouchableIcon
          name={'chevron-right'}
          color={Colors.ACCENT_SECONDARY}
          size={14}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => this.props.navigation.navigate('ShopByBrand')}
        style={styles.MenuListItem}>
        <View style={styles.MenuListItemLeft}>
          <Image
            source={require('../assets/images/brand-image.png')}
            style={{
              ...styles.MenuListItemLeftIcon,
              resizeMode: 'contain',
            }}
          />
          <Text style={styles.MenuListItemLeftText}>
            Shop by Brand
          </Text>
        </View>
        <TouchableIcon
          name={'chevron-right'}
          color={Colors.ACCENT_SECONDARY}
          size={14}
        />
      </TouchableOpacity>
      {/* </View> */}
      {/* {data.map(item => (
        <OnlyTouch key={item.id} onPress={() => this.MainMenuItemAction(item)}>
          <View style={styles.MenuListItem}>
            <View style={styles.MenuListItemLeft}>
              {item.icon ? (
                <Image
                  source={{uri: DecodeImage(item.icon)}}
                  style={{
                    ...styles.MenuListItemLeftIcon,
                    resizeMode: 'contain',
                  }}
                />
              ) : (
                <TouchableIcon
                  name={Constants.DEFAULT_CATEGORY_ICON}
                  size={18}
                  color={Colors.OVERLAY}
                  style={{marginRight: 15}}
                  onPress={() => this.MainMenuItemAction(item)}
                />
              )}
              <DefaultText style={styles.MenuListItemLeftText}>
                {item.name}
                {this.props.i18n.t(item.name)}
              </DefaultText>
            </View>
            <TouchableIcon
              name={'chevron-right'}
              color={Colors.ACCENT_SECONDARY}
              size={14}
            />
          </View>
        </OnlyTouch>
      ))} */}
    </View>
  );

  OtherMenuList = () => (
    <View>
      {OtherMenu.map(item => (
        // console.log('yes item', item),
        <OnlyTouch key={item.title} onPress={() => this.OtherMenuAction(item)}>
          <View style={styles.MenuListItem}>
            <View style={styles.MenuListItemLeft}>
              <TouchableIcon
                name={item.icon}
                size={18}
                color={Colors.OVERLAY}
                style={{marginRight: 15}}
                onPress={() => this.OtherMenuAction(item)}
              />
              <DefaultText style={styles.MenuListItemLeftText}>
                {/* {item.title} */}
                {this.props.i18n.t(item.title)}
              </DefaultText>
            </View>
            <TouchableIcon
              name={'chevron-right'}
              color={Colors.ACCENT_SECONDARY}
              size={14}
            />
          </View>
        </OnlyTouch>
      ))}
    </View>
  );

  OtherMenuAction = item => {
    this.props.navigation.navigate(global.isGuest ? 'SignUp' : item.screen);
  };

  MainMenuItemAction = item => {
    // console.log("Menu Main", item)
    if (item.child_id.length > 0) {
      this.GetMenuData(item).then(data => {
        if (!data) {
          return;
        }

        if (this._is_mounted) {
          this.setState({
            level1: {
              visible: true,
              title: item.name,
              data: data,
            },
          });
        }
      });
      return;
    }

    if (this.state.level1.visible) {
      this.CloseLevel1();
    }

    this.props.navigation.navigate('CategoryProducts', {
      // routeName: 'CategoryProducts',
      // params: {
      id: item.id,
      title: item.name,
      // },
    });
  };

  SubMenuItemAction = item => {
    if (item.child_id.length > 0) {
      this.GetMenuData(item).then(data => {
        if (!data) {
          return;
        }

        if (this._is_mounted) {
          this.setState({
            level1: {
              ...this.state.level1,
              visible: false,
            },
            level2: {
              visible: true,
              title: item.name,
              data: data,
            },
          });
        }
      });
      return;
    }

    if (this.state.level1.visible || this.state.level2.visible) {
      if (this._is_mounted) {
        this.setState({
          level1: {
            visible: false,
            title: null,
            data: [],
          },
          level2: {
            visible: false,
            title: null,
            data: [],
          },
        });
      }
    }

    this.props.navigation.navigate('CategoryProducts', {
      // routeName: 'CategoryProducts',
      // params: {
      id: item.id,
      title: item.name,
      // },
    });
  };

  GetMenuData = async item => {
    if (this.Online === null) {
      this.Online = new Online();
    }

    let response = await this.Online.search(
      Models.CATEGORY,
      [],
      [['id', 'in', item.child_id]],
    );
    console.log('GetMenu data response', response);
    if (response.error) {
      if (Constants.DEBUG) {
        console.log(response);
      }

      ShowToast(Message.ERROR_TRY_AGAIN);
      return false;
    }

    if (response.result.records.length > 0) {
      return response.result.records;
    } else {
      return false;
    }
  };

  CloseLevel1 = () => {
    if (this._is_mounted) {
      this.setState({
        level1: {
          visible: false,
          title: null,
          data: [],
        },
      });
    }
  };

  Level1Menu = ({visible, title, data = []}) => (
    // console.log('data', data),
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={this.CloseLevel1}>
      <View
        style={{
          flex: 1,
          width: Dimensions.get('window').width * 0.8,
          backgroundColor: Colors.WHITE,
        }}>
        <View
          style={{
            ...styles.MenuListItem,
            borderStyle: 'solid',
            borderBottomColor: Colors.ACCENT_SECONDARY,
            borderBottomWidth: 1,
            paddingVertical: 17,
          }}>
          <View style={styles.MenuListItemLeft}>
            <TouchableIcon
              color={Colors.ACCENT}
              onPress={this.CloseLevel1}
              name={'chevron-left'}
              size={18}
              style={styles.MenuListItemLeftIcon}
            />
            <DefaultText style={{fontSize: 18, fontFamily: Fonts.BOLD}}>
              {title}
            </DefaultText>
          </View>
        </View>
        <ScrollView contentContainerStyle={{paddingTop: 5}}>
          {data.map(item => (
            <OnlyTouch
              key={item.id}
              onPress={() => this.SubMenuItemAction(item)}>
              <View style={styles.MenuListItem}>
                <View style={styles.MenuListItemLeft}>
                  {item.icon ? (
                    <Image
                      source={{uri: DecodeImage(item.icon)}}
                      style={{
                        ...styles.MenuListItemLeftIcon,
                        resizeMode: 'contain',
                      }}
                    />
                  ) : (
                    <TouchableIcon
                      name={Constants.DEFAULT_CATEGORY_ICON}
                      size={18}
                      color={Colors.OVERLAY}
                      style={{marginRight: 15}}
                      onPress={() => this.SubMenuItemAction(item)}
                    />
                  )}
                  <DefaultText style={styles.MenuListItemLeftText}>
                    {item.name}
                  </DefaultText>
                </View>
                <TouchableIcon
                  name={'chevron-right'}
                  color={Colors.ACCENT_SECONDARY}
                  size={14}
                />
              </View>
            </OnlyTouch>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  CloseLevel2 = () => {
    if (this._is_mounted) {
      this.setState({
        level1: {
          ...this.state.level1,
          visible: true,
        },
        level2: {
          visible: false,
          title: null,
          data: [],
        },
      });
    }
  };

  Level2Menu = ({visible, title, data = []}) => (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={this.CloseLevel2}>
      <View
        style={{
          flex: 1,
          width: Dimensions.get('window').width * 0.8,
          backgroundColor: Colors.WHITE,
          paddingTop: 30,
        }}>
        <View
          style={{
            ...styles.MenuListItem,
            borderStyle: 'solid',
            borderBottomColor: Colors.ACCENT_SECONDARY,
            borderBottomWidth: 1,
          }}>
          <View style={styles.MenuListItemLeft}>
            <TouchableIcon
              color={Colors.ACCENT}
              onPress={this.CloseLevel2}
              name={'chevron-left'}
              size={18}
              style={styles.MenuListItemLeftIcon}
            />
            <DefaultText style={{fontSize: 18, fontFamily: Fonts.BOLD}}>
              {`${this.state.level1.title} / ${title}`}
            </DefaultText>
          </View>
        </View>
        <ScrollView contentContainerStyle={{paddingTop: 5}}>
          {data.map(item => (
            <OnlyTouch
              key={item.id}
              onPress={() => this.SubMenuItemAction(item)}>
              <View style={styles.MenuListItem}>
                <View style={styles.MenuListItemLeft}>
                  {item.icon ? (
                    <Image
                      source={{uri: DecodeImage(item.icon)}}
                      style={{
                        ...styles.MenuListItemLeftIcon,
                        resizeMode: 'contain',
                      }}
                    />
                  ) : (
                    <TouchableIcon
                      name={Constants.DEFAULT_CATEGORY_ICON}
                      size={18}
                      color={Colors.OVERLAY}
                      style={{marginRight: 15}}
                      onPress={() => this.SubMenuItemAction(item)}
                    />
                  )}
                  <DefaultText style={styles.MenuListItemLeftText}>
                    {item.name}
                  </DefaultText>
                </View>
                <TouchableIcon
                  name={'chevron-right'}
                  color={Colors.ACCENT_SECONDARY}
                  size={14}
                />
              </View>
            </OnlyTouch>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  navigateToMyAccount = () => {
    this.props.navigation.navigate(global.isGuest ? 'Login' : 'MyAccount');
  };

  render() {
    return (
      <LinearGradient
        locations={[0, 0.65]}
        colors={[Colors.PRIMARY, Colors.WHITE]}
        style={styles.Drawer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.Flex1}
          keyboardShouldPersistTaps={'always'}>
          <View style={styles.Flex1}>
            <TouchableOpacity
              activeOpacity={Constants.ACTIVE_OPACITY}
              onPress={this.navigateToMyAccount}>
              <HeaderBg>
                <View style={styles.DrawerTop}>
                  <View style={styles.DrawerTopLeft}>
                    <View style={styles.DrawerTopAvataar}>
                      {global.profilePic ? (
                        <Image
                          source={{uri: global.profilePic}}
                          style={styles.AvataarImage}
                        />
                      ) : (
                        <TouchableIcon
                          name={'user'}
                          color={Colors.PRIMARY}
                          onPress={this.navigateToMyAccount}
                        />
                      )}
                    </View>
                    <WhiteText style={{fontFamily: Fonts.REGULAR}}>
                      {global.isGuest
                        ? this.props.i18n.t('LOGIN / SIGN UP')
                        : this.props.i18n.t('Hey') +
                          ' ' +
                          global.userDetails.name}
                      <WhiteText>
                        {global.isGuest
                          ? '\n' +
                            this.props.i18n.t('Click here to Login / Register')
                          : '\n' + this.props.i18n.t('Manage Your Account')}
                      </WhiteText>
                    </WhiteText>
                  </View>
                  <TouchableIcon
                    name={'chevron-right'}
                    color={Colors.WHITE}
                    size={14}
                  />
                </View>
              </HeaderBg>
            </TouchableOpacity>
            <View style={styles.Body}>
              {global.categories.length > 0 ? (
                <this.MenuList data={global.categories} />
              ) : null}
              <this.OtherMenuList />
            </View>
          </View>
        </ScrollView>
        {this.state.level1.visible ? (
          <this.Level1Menu
            visible={this.state.level1.visible}
            title={this.state.level1.title}
            data={this.state.level1.data}
          />
        ) : null}
        {this.state.level2.visible ? (
          <this.Level2Menu
            visible={this.state.level2.visible}
            title={this.state.level2.title}
            data={this.state.level2.data}
          />
        ) : null}
      </LinearGradient>
    );
  }

  componentWillUnmount() {
    this._is_mounted = false;
  }
}

export default withTranslation()(Drawer);

const styles = StyleSheet.create({
  Drawer: {
    flex: 1,
  },
  Flex1: {
    // flex: 1,
    // backgroundColor: 'red',
  },
  DrawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    alignItems: 'center',
    paddingVertical: 15,
    // backgroundColor: 'red',
  },
  DrawerTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  DrawerTopAvataar: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.WHITE,
  },
  AvataarImage: {
    width: '100%',
    height: 70,
  },
  MenuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: '5%',
  },
  MenuListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  MenuListItemLeftIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
  },
  MenuListItemLeftText: {
    fontSize: 16,
    fontFamily: Fonts.BOLD,
  },
  Body: {
    paddingTop: 10,
    minHeight: Dimensions.get('window').height - Constants.HEADER_HEIGHT,
    backgroundColor: Colors.WHITE,
  },
});
