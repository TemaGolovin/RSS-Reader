import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import validate from './validator.js';
import render from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';
import { updatePosts } from './updater.js';

const defaultLanguage = 'ru';
const getUniqId = () => _.uniqueId();

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: defaultLanguage,
      debug: false,
      resources,
    })
    .then(() => {
      const state = {
        formValidity: true,
        error: '',
        urlFeeds: [],
        process: {
          processState: 'filling',
        },
        resultContentLoding: {
          feeds: [],
          posts: [],
        },
        uiState: {
          readedPostsId: [],
        },
      };

      const elements = {
        inputForm: document.querySelector('#url-input'),
        form: document.querySelector('.rss-form'),
        feedBack: document.querySelector('.feedback'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        button: document.querySelector('#add'),
      };

      const watchedState = onChange(
        state,
        render(elements, state, i18nInstance),
      );

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        watchedState.process.processState = 'sending';
        watchedState.formValidity = true;
        const data = new FormData(event.target);
        const url = data.get('url').trim();
        const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&';
        const proxyUrl = `${proxy}url=${encodeURIComponent(url)}`;
        validate(i18nInstance, url)
          .catch(() => {
            throw new Error('unvalidUrl');
          })
          .then(() => axios.get(proxyUrl))
          .then((response) => {
            const content = parser(response.data.contents, getUniqId);
            if (watchedState.urlFeeds.includes(url)) {
              throw new Error('doubleRss');
            } else {
              watchedState.urlFeeds.push(url);
            }
            const { parsedFeeds, posts } = content;
            watchedState.resultContentLoding.feeds.push(parsedFeeds);
            watchedState.resultContentLoding.posts = [
              ...watchedState.resultContentLoding.posts,
              ...posts,
            ];
            watchedState.process.processState = 'sucsess';
            return setTimeout(() => updatePosts(watchedState, proxyUrl, parsedFeeds.id, getUniqId));
          })
          .catch((e) => {
            // Ошибка выбрасывается как 'Error: name err', поэтому достаем name.
            const nameErr = String(e).split(' ')[1];
            watchedState.error = nameErr;
            if (nameErr === 'unvalidUrl') {
              watchedState.formValidity = false;
            }
            watchedState.process.processState = 'feiled';
          });
      });
    });
};
