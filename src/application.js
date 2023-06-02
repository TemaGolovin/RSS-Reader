import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import validate from './validator.js';
import render from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';
import updatePosts from './updater.js';

const defaultLanguage = 'ru';
const getUniqId = () => _.uniqueId();

const getResponseRRS = (url) => {
  const proxyUrl = new URL(
    `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(
      url,
    )}`,
  );
  return axios.get(proxyUrl);
};

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
          readedPostsId: new Set(),
        },
      };

      const elements = {
        inputForm: document.querySelector('#url-input'),
        form: document.querySelector('.rss-form'),
        feedBack: document.querySelector('.feedback'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        button: document.querySelector('#add'),
        modal: {
          modalWindow: document.querySelector('#modal'),
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          button: document.querySelector('.btn-modal-link'),
        },
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
        validate(watchedState, url)
          .then(() => getResponseRRS(url))
          .then((response) => {
            const content = parser(response.data.contents, getUniqId, url);
            watchedState.urlFeeds.push(url);
            const { parsedFeeds, posts } = content;
            watchedState.resultContentLoding.feeds.push(parsedFeeds);
            watchedState.resultContentLoding.posts = [
              ...watchedState.resultContentLoding.posts,
              ...posts,
            ];
            watchedState.process.processState = 'sucsess';
            return setTimeout(() => updatePosts(watchedState, getResponseRRS, getUniqId));
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

      elements.modal.modalWindow.addEventListener('show.bs.modal', (e) => {
        const currentPostId = e.relatedTarget.getAttribute('data-id');
        watchedState.uiState.readedPostsId.add(currentPostId);
        watchedState.uiState.modalId = currentPostId;
        console.log(watchedState.uiState.readedPostsId);
      });

      elements.posts.addEventListener('click', (e) => {
        const currentPostId = e.target.dataset.id;
        if (currentPostId) {
          watchedState.uiState.readedPostsId.add(currentPostId);
        }
      });
    });
};
