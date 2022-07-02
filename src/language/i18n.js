import React from 'react';
import i18next from 'i18next';
import english from './english.json';
import french from './french.json';
import italian from './italian.json';
import arabic from './arabic.json';
import {initReactI18next, i18n, withTranslation} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import {I18nManager} from 'react-native';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    return callback(RNLocalize.getLocales()[0].languageCode);
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    // lng: 'en',
    fallbackLng: I18nManager.isRTL ? 'ar' : 'en',
    // fallbackLng: 'en',
    resources: {
      en: english,
      fr: french,
      it: italian,
      ar: arabic,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;
