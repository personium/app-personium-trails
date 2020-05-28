import { atom } from 'recoil';

export const atomLocalMode = atom({
  key: 'app_launched_locally',
  default: false,
});
