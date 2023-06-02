export default (data, id, feedLink) => {
  try {
    const parser = new DOMParser();
    const content = parser.parseFromString(data, 'text/html');
    const channel = content.querySelector('channel');
    const feedTitel = channel.querySelector('title').textContent;
    const feedDescription = channel.querySelector('description').childNodes[0].textContent;
    const parsedFeeds = {
      feedTitel, feedDescription, id: id(), feedLink,
    };
    const items = channel.querySelectorAll('item');
    const posts = Array.from(items).map((item) => {
      const link = item.querySelector('link').nextSibling.textContent.trim();
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').childNodes[0].textContent;
      const guid = item.querySelector('guid').textContent;
      return {
        title,
        description,
        link,
        id: id(),
        feedId: parsedFeeds.id,
        guid,
      };
    });
    return { parsedFeeds, posts };
  } catch {
    throw new Error('unvalidRssResourse');
  }
};
