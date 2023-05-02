export default (data, id) => {
  try {
    const parser = new DOMParser();
    const content = parser.parseFromString(data, 'text/html');

    const channel = content.querySelector('channel');
    const feedTitel = channel.querySelector('title');
    const feedDescription = channel.querySelector('description');
    const parsedFeeds = { feedTitel, feedDescription, id: id() };
    const items = channel.querySelectorAll('item');
    const posts = Array.from(items).map((item) => {
      const link = item.querySelector('link').nextSibling;
      const title = item.querySelector('title');
      const description = item.querySelector('description');
      return {
        title, description, link, id: id(),
      };
    });
    return { parsedFeeds, posts };
  } catch {
    throw new Error('unvalidRssResourse');
  }
};
