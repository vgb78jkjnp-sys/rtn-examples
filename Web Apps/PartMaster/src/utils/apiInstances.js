import invokeApi from './invokeApi';

export const invokeUserAuthStatusApi = () => invokeApi('GET', '/api/userservice/auth-status', { useWindowsAuth: true });

export const invokeUserLoginApi = () => invokeApi('POST', '/api/userservice/login', { useWindowsAuth: false });
