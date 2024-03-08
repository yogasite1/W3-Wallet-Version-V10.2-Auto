import { getMessage } from '../../ui/helpers/utils/i18n-helper';
import * as en from '../../app/_locales/en/messages.json';

// For testing only //

export function tEn(key) {
  return getMessage('en', en, key);
}
