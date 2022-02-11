import { map, debounce as originDebounce } from 'lodash/fp';

export * from 'lodash/fp';
export const mapIndexed = map.convert({ cap: false });
export const debounce = originDebounce(200);
