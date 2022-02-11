import {
  createSlice,
} from '@reduxjs/toolkit';
import { getActionType } from '@/infra/utils';

const slice = createSlice({
  name: getActionType(__filename),
  initialState: {
    isLoading: 0,
  },
  reducers: {
    showLoading: (state) => {
      state.isLoading += 1;
    },
    hideLoading: (state) => {
      state.isLoading -= 1;
    },
  },
});

export const {
  showLoading,
  hideLoading,
} = slice.actions;
export default slice.reducer;
