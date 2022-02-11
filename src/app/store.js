import createStore from '@/infra/create-store';
import counterReducer from '../features/counter/counterSlice';

export const store = createStore({
  counter: counterReducer,
});
