import LocalStorage from '@react-native-community/async-storage';
import Constants, {Message} from './Constants';
import {ShowToast} from '../components/Functions';

const KeyPrefix = Constants.LOCAL_DATA_KEY_PREFIX;

export default class Offline {
  get = async (key, defaultValue = null) => {
    try {
      const response = await LocalStorage.getItem(KeyPrefix + key);
      return response !== null || response !== undefined
        ? response
        : defaultValue;
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Error while fetching local data', error.message);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return false;
    }
  };

  set = async (key, value) => {
    try {
      const response = await LocalStorage.setItem(
        KeyPrefix + key,
        typeof value === 'object' ? JSON.stringify(value).toString() : value,
      );
      return response === null;
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Error while fetching local data', error.message);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return false;
    }
  };

  getAll = async () => {
    try {
      let res = await LocalStorage.getAllKeys();
      // console.log("offline", res);
      return res;
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Error while fetching local data', error.message);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return false;
    }
  };

  removeAll = async (keys, callback) => {
    try {
      keys.map((key, index) => {
        LocalStorage.removeItem(key);
        if (index + 1 === keys.length) {
          callback();
        }
      });
    } catch (error) {
      if (Constants.DEBUG) {
        console.log('Error while removing local data', error.message);
      }
      ShowToast(Message.ERROR_TRY_AGAIN);
      return false;
    }
  };
}
