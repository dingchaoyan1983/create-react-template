import {
  useRef, useMemo, useContext,
} from 'react';
import {
  useSize as originUseSize,
} from 'ahooks';
import { useLocation } from 'react-router-dom';
import { map } from '@/infra/lodash';
import LocaleContext from '../intl/context';

export * from 'ahooks';

let classId = 0;

export const getSelector = (clsName) => `.${clsName}`;

export const getClassName = () => {
  classId += 1;
  return `FakeClassName${classId}`;
};

// 获取一个容器的大小
export const useSize = (...selectors) => {
  const domRef = useRef();
  const size = originUseSize(domRef);
  return [domRef, size, ...map((selector) => originUseSize(domRef.current?.querySelector(selector)))(selectors)];
};

export const useQuery = () => {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
};

export const useLocale = () => useContext(LocaleContext);
