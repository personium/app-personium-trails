import { atom } from 'recoil';

export const $localMode = atom({
  key: 'app_launched_locally',
  default: false,
});
