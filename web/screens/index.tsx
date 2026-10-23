import type { WebScreenConfig } from '$wabi-web-components';
import { HomeScreen } from './HomeScreen';

export const SCREENS: WebScreenConfig[] = [
  { name: 'HomeScreen', component: HomeScreen, path: '/' },
];

export { HomeScreen } from './HomeScreen';
export const APP_MANIFEST = undefined;
