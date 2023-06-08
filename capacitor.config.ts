import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moxx.qri',
  appName: 'qri',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
