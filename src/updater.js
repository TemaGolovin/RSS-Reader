import parser from './parser.js';

const updatePosts = (state, getResponseRRS, generateIdFunc) => {
  // eslint-disable-next-line max-len
  const promises = state.resultContentLoding.feeds.map((feed) => getResponseRRS(feed.feedLink).then((response) => {
    const content = parser(
      response.data.contents,
      generateIdFunc,
      feed.feedLink,
    );
    const { posts } = content;
    if (!posts) {
      return;
    }
    let newPosts = [];
    const loadedPosts = state.resultContentLoding.posts.filter(
      (post) => post.feedId === feed.id,
    );
    const loadedPostsGuids = loadedPosts.map((post) => post.guid);
    const coll = new Set(loadedPostsGuids);
    newPosts = posts.filter(({ guid }) => !coll.has(guid));
    if (newPosts.length === 0) {
      return;
    }
    newPosts.forEach((post) => {
      post.feedId = feed.id;
      post.id = generateIdFunc();
    });
    state.resultContentLoding.posts.push(...newPosts);
    return newPosts; // eslint-disable-line consistent-return
  }));
  Promise.all(promises)
    .catch((e) => console.error(e.message))
    .finally(() => setTimeout(() => updatePosts(state, getResponseRRS, generateIdFunc), 5000));
};

export default updatePosts;
