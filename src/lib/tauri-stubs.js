/**
 * Server-side stub for @tauri-apps/* packages.
 * These packages contain browser/native APIs that cannot run in Node.js SSR.
 * This stub is aliased in next.config.mjs so all server-side imports resolve here
 * and return no-ops, preventing build/runtime errors.
 */

export const isPermissionGranted = async () => false;
export const requestPermission = async () => 'denied';
export const sendNotification = () => {};

// Push notifications (@choochmeque/tauri-plugin-notifications-api)
export const registerForPushNotifications = async () => { throw new Error('Push notifications unavailable outside Tauri'); };
export const unregisterForPushNotifications = async () => {};
export const onNotificationReceived = async () => () => {};
export const onAction = async () => () => {};

// Haptics
export const vibrate = async () => {};
export const ImpactStyle = { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' };

// Geolocation / OS / Opener no-ops
export const getCurrentPosition = async () => null;
export const watchPosition = async () => null;
export const requestPermissions = async () => ({ location: 'denied' });
export const platform = () => null;

export default {};
