import appLogo from '../assets/nokia_blueonwhite.jpg';
import { appConfig } from '../config/application.config';

/**
 * Per-application auth settings for application "${appConfig.applicationName}" on the shared IIS userservice.
 */
export const authConfig = {
  appId: appConfig.applicationId,
  requiredRoles: appConfig.applicationRoles.split(','),
  roleMatch: 'any',
  defaultRoute: '/',
  storageKeys: {
    userId: `${appConfig.applicationId}.userId`,
    formAuth: `${appConfig.applicationId}.formAuth`
  },
  messages: {
    accessDenied:
      'You do not have access to this application. Please request access or log in with a different ID',
    checkingAuth: 'Checking Windows authentication...',
    windowsAuthUnavailable:
      'Windows authentication is unavailable. Sign in with your user id and password.'
  },
  login: {
    appTitle: appConfig.applicationTitle,
    logo: appLogo,
    logoAlt: 'Logo'
  },
  api: {
    authStatusPath: '/api/userservice/auth-status',
    loginPath: '/api/userservice/login'
  }
};

export default authConfig;
