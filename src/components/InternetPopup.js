import React, {Component} from 'react';
import {Modal, View, StyleSheet} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {FeatherIcon, DefaultText, Button} from './Common';
import {Colors, Fonts} from '../utils/Constants';
import {ShowToast} from './Functions';

export default class InternetPopup extends Component {
  onRetry = (callback = null) => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        if (callback !== null) {
          callback();
        }
      } else {
        ShowToast('No Connection');
      }
    });
  };

  render() {
    const showModal = this.props.showModal ? this.props.showModal : false;
    const retryAction = this.props.retryAction ? this.props.retryAction : null;

    return (
      <Modal visible={showModal} transparent>
        <View style={styles.Background}>
          <View style={styles.Wrap}>
            <FeatherIcon
              name={'wifi-off'}
              color={Colors.ACCENT_SECONDARY}
              size={50}
            />
            <DefaultText style={styles.Title}>{'No Connection'}</DefaultText>
            <DefaultText style={styles.Description}>
              {'Please check your internet\nconnectivity and try again'}
            </DefaultText>
            <Button
              wrapStyle={styles.ButtonWrap}
              style={styles.ButtonText}
              title={'Retry'}
              onPress={() => {
                this.onRetry(retryAction);
              }}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  Background: {
    height: '100%',
    paddingHorizontal: '3%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.OVERLAY,
  },
  Wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: Colors.WHITE,
  },
  Title: {
    fontSize: 16,
    fontFamily: Fonts.REGULAR,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 5,
  },
  Description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  ButtonWrap: {
    width: 130,
  },
  ButtonText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
