/**
 * App audio facade — every page/game should import from here.
 * All helpers share the same speak-first + unlock contract.
 */
export {
  speakText,
  playAudio,
  stopAudio,
  playCelebrationSound,
  playEncouragementSound,
  SPEECH_RATE,
  SPEECH_RATE_MOBILE,
  SPEECH_RATE_ANDROID,
  SPEECH_PITCH,
  getSpeechRate,
  getSpeechPitch,
  prepareSpokenText,
  isMobileBrowser,
  isAndroidBrowser,
  isIosBrowser,
} from './audioPlayer'
export {
  unlockAudio,
  unlockAudio as prepareAudio,
  installAudioUnlockListeners,
} from './audioUnlock'
export {
  playLetterSound,
  playWordSound,
  buildLetterPhrase,
} from './letterSound'
export type { LetterSoundMode, LetterSoundOptions } from './letterSound'
export { speechLangForLocale, SPEECH_LANG_BY_LOCALE } from './speechLang'
