import * as yup from 'yup';
import { setLocale } from 'yup';

export default (i18next, content) => {
  setLocale({
    mixed: {
      default: 'field_invalid',
    },
    string: {
      url: i18next.t('errors.unvalidUrl'),
      min: i18next.t('validation.errors.emptyField'),
    },
  });

  const shema = yup.string().url().min(1);

  return shema.validate(content);
};
