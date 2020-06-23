import { atom } from 'recoil';

export const isLogin = atom({
  key: 'personiumIsLogin',
  default: false,
});

export const tokens = atom({
  key: 'personiumTokens',
  default: null,
});

export const $authInfo = atom({
  key: 'personiumAuthInfo',
  default: null,
});

export const $barInstalled = atom({
  key: 'personiumBarInstalled',
  default: null,
});
