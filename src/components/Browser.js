import React, {PureComponent} from 'react';
import {Modal, View, Dimensions, Platform} from 'react-native';
import WebView from 'react-native-webview';
import {StyleSheet} from 'react-native';
import {Colors, Fonts} from '../utils/Constants';
import {
  WhiteText,
  HeaderBg,
  Wrap,
  TouchableIcon,
  Background,
  Loader,
} from './Common';

const headerHeight = Platform.OS === 'ios' ? 90 : 60;
// const headerHeight = 60;

export default class Browser extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showLoader: false,
    };
  }

  render() {
    const visible = this.props.visible;
    const onBack = this.props.onBack;
    const source = this.props.source;
    const onNavigate = this.props.onNavigate;
    console.log('from browser source', source);
    return (
      <Modal visible={visible} onRequestClose={onBack}>
        <Background>
          <HeaderBg>
            <Wrap style={styles.HeaderWrap}>
              <View style={styles.Header}>
                <TouchableIcon
                  onPress={onBack}
                  name={'times'}
                  style={styles.HeaderRightIcon}
                />
                <WhiteText style={styles.Logo}>{'Complete Payment'}</WhiteText>
              </View>
            </Wrap>
          </HeaderBg>
          <View
            style={{
              minHeight: Dimensions.get('window').height - headerHeight,
            }}>
            <WebView
              // source={source}
              source={source}
              onNavigationStateChange={onNavigate}
              style={{backgroundColor: Colors.WHITE}}
              onLoadStart={() => this.setState({showLoader: true})}
              onLoadEnd={() => this.setState({showLoader: false})}
              cacheEnabled={false}
              cacheMode={'LOAD_NO_CACHE'}
              bounces={false}
              StatusBar={false}
            />
            {this.state.showLoader && (
              <View style={styles.Loader}>
                <Loader />
              </View>
            )}
          </View>
        </Background>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  HeaderBg: {height: headerHeight},
  HeaderWrap: {
    marginTop: Platform.OS === 'android' ? -25 : 0,
  },
  Header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  HeaderRightIcon: {
    marginRight: 15,
  },
  Logo: {
    fontSize: 20,
    fontFamily: Fonts.REGULAR,
  },
  Loader: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.OVERLAY,
  },
});
