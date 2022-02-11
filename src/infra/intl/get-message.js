import intl from 'react-intl-universal';

export const getMessage = (...args) => intl.get.call(intl, ...args);
export const getHTMLMessage = (...args) => intl.getHTML.call(intl, ...args);
