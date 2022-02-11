import { createContext } from 'react';
import { identity } from '@/infra/lodash';

export default createContext({
  changeLocale: identity,
});
