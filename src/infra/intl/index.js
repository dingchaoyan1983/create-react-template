import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import intl from 'react-intl-universal';

import LocaleContext from './context';

const localeKey = 'lang';

export default ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const changeLocale = useCallback((locale) => {
    setLoaded(false);
    if (locale) {
      global.localStorage.setItem(localeKey, locale);
    }
    const currentLocale = intl.determineLocale({
      urlLocaleKey: localeKey,
      cookieLocaleKey: localeKey,
      localStorageLocaleKey: localeKey,
    });
    Promise.all([
      import(`./${currentLocale}.json`),
    ]).then(([{ default: localeConfig }]) => intl.init({
      currentLocale,
      locales: {
        [currentLocale]: localeConfig,
      },
    })).then(() => {
      setLoaded(true);
    }, (error) => {
      setLoaded(true);
      throw error;
    });
  }, [setLoaded]);

  useEffect(() => {
    changeLocale('zh-CN');
  }, [changeLocale]);

  const localeContextValue = useMemo(() => ({
    changeLocale,
  }), [changeLocale]);

  return (
    <LocaleContext.Provider value={localeContextValue}>
      {
        loaded && children
      }
    </LocaleContext.Provider>
  );
};
