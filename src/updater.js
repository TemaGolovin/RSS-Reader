import axios from 'axios';
import parser from './parser.js';
import getUniqId from './uniqId.js';

const renderReadedPosts = (readedPostsId, ulPosts) => {
  if (readedPostsId.length === 0) {
    return;
  }
  readedPostsId.forEach((idPost) => {
    const readedPost = ulPosts.querySelector(`[data-id='${idPost}']`);
    if (!readedPost) {
      return;
    }
    readedPost.classList.remove('fw-bold');
    readedPost.classList.add('fw-normal', 'link-secondary');
  });
};

const updatePosts = (state, proxyUrl, id, generateIdFunc) => axios
  .get(proxyUrl)
  .then((response) => response.data.contents)
  .then((data) => {
    const content = parser(data, getUniqId);
    const { posts } = content;
    if (!posts) {
      throw new Error('Parser Error');
    }
    return posts;
  })
  .then((requestedPosts) => {
    const loadedPosts = state.resultContentLoding.posts.filter(
      (post) => post.feedId === id,
    );
    const loadedPostsGuids = loadedPosts.map((post) => post.guid);
    const coll = new Set(loadedPostsGuids);
    const newPosts = requestedPosts.filter(({ guid }) => !coll.has(guid));

    if (newPosts.length === 0) {
      return;
    }
    newPosts.forEach((post) => {
      post.feedId = id;
      post.id = generateIdFunc(); // eslint-disable-line no-param-reassign
    });
    state.resultContentLoding.posts.push(...newPosts);

    const ulPosts = document.querySelector('.posts ul');
    renderReadedPosts(state.uiState.readedPostsId, ulPosts);
    return newPosts; // eslint-disable-line consistent-return
  })
  .catch((e) => console.error(e.message))
  .finally(() => setTimeout(() => updatePosts(state, proxyUrl, id, generateIdFunc), 5000));

export { updatePosts, renderReadedPosts };
