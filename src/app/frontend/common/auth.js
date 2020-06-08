import { atom } from 'recoil';

export const isLogin = atom({
  key: 'personiumIsLogin',
  default: false,
});

export const isError = atom({
  key: 'personiumIsError',
  default: null,
});

export const tokens = atom({
  key: 'personiumTokens',
  default: null,
});
