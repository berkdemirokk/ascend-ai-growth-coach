// streakShare — captures the StreakShareCard ref to a PNG and opens
// the native share sheet. Uses react-native-view-shot + expo-sharing,
// with a graceful fallback to React Native's Share API.

import { Share, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';

let SharingModulePromise = null;
async function loadSharing() {
  if (!SharingModulePromise) {
    SharingModulePromise = import('expo-sharing').catch(() => null);
  }
  return SharingModulePromise;
}

/**
 * Capture a viewRef to a tmp PNG and trigger the native share sheet.
 * @param {Object} params
 * @param {React.RefObject} params.viewRef  ref returned by useRef on StreakShareCard
 * @param {string} params.message  caption to share alongside the image
 * @returns {Promise<boolean>} true if share UI was opened
 */
export async function captureAndShare({ viewRef, message }) {
  if (!viewRef?.current) return false;

  let uri;
  try {
    uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  } catch {
    return false;
  }
  if (!uri) return false;

  // Try expo-sharing first (works for both iOS & Android with file URIs)
  try {
    const SharingMod = await loadSharing();
    const Sharing = SharingMod?.default ?? SharingMod;
    if (Sharing && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: message,
        UTI: 'public.png',
      });
      return true;
    }
  } catch {
    // fallthrough to RN Share
  }

  // Fallback: React Native Share API
  try {
    const url = Platform.OS === 'ios' ? uri : `file://${uri.replace(/^file:\/\//, '')}`;
    await Share.share({
      url,
      message: message || '',
    });
    return true;
  } catch {
    return false;
  }
}
