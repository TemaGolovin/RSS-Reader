import * as yup from 'yup';
import { setLocale } from 'yup';

export default (state, content) => {
  setLocale({
    mixed: {
      default: 'field_invalid',
      notOneOf: 'doubleRss',
    },
    string: {
      url: 'unvalidUrl',
      min: 'emptyField',
    },
  });

  const shema = yup.string().url().min(1).notOneOf(state.urlFeeds);

  return shema.validate(content);
};
