import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://mock-data-api-nextjs.vercel.app',
  GoogleMapAPI: 'AIzaSyAChufWiMfwsmyX3Se1dRaN4t31z0xmIMo&v'
};
