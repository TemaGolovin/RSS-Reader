const printText = (text) => {
  if (text.childNodes[0].textContent.startsWith('<')) {
    const tmp = text.childNodes[0].textContent.split('[')[2];
    return tmp.split(']')[0];
  }
  if (text.textContent) {
    return text.textContent;
  }
  if (text.childNodes[0].nodeName === '#comment') {
    const tmp = text.childNodes[0].textContent.split('[')[2];
    return tmp.split(']')[0];
  }
  return text;
};

const renderPostsAndFeeds = (elements, state, i18next) => {
  const frame = `<div class ='card border-0'>
    <div class='card-body'>
      <h2 class='card-title h4'></h2>
    </div>
    <ul class='list-group border-0 rounded-0'></ul>
  </div>`;
  if (elements.feeds.innerHTML === '') {
    elements.feeds.innerHTML = frame;
    const h2Feeds = elements.feeds.querySelector('h2');
    h2Feeds.textContent = i18next.t('feeds');
    elements.posts.innerHTML = frame;
    const h2Posts = elements.posts.querySelector('h2');
    h2Posts.textContent = i18next.t('posts');
  }

  const ul = elements.feeds.querySelector('ul');
  ul.innerHTML = '';
  state.resultContentLoding.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `<h3 class='h6 m-0'>${printText(feed.feedTitel)}</h3>
       <p class='m-0 small text-black-50'>${printText(
    feed.feedDescription,
  )}</p>`;
    ul.prepend(li);
  });

  const ulPosts = elements.posts.querySelector('ul');
  ulPosts.innerHTML = '';
  state.resultContentLoding.posts.forEach((post) => {
    const liPost = document.createElement('li');
    liPost.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    liPost.innerHTML = `<a href=${
      post.link.textContent
    } class="fw-bold" target="_blank">${printText(post.title)}</a>
       <button type="button" class="btn btn-outline-primary btn-sm">${i18next.t(
    'view',
  )}</button>`;
    ulPosts.prepend(liPost);
  });
};

export default (elements, state, i18next) => (path, value) => {
  if (path === 'process.processState') {
    switch (value) {
      case 'sucsess':
        elements.feedBack.textContent = i18next.t('sucsess');
        elements.feedBack.classList.add('text-success');
        elements.feedBack.classList.remove('text-danger');
        elements.button.removeAttribute('disabled');
        elements.inputForm.removeAttribute('readonly');
        renderPostsAndFeeds(elements, state, i18next);
        elements.form.reset();
        break;
      case 'sending':
        elements.button.getAttribute('disabled');
        elements.inputForm.getAttribute('readonly');
        elements.feedBack.textContent = '';
        break;
      case 'feiled':
        elements.button.removeAttribute('disabled');
        elements.inputForm.removeAttribute('readonly');
        elements.feedBack.textContent = i18next.t(`errors.${state.error}`);
        console.log(state.formValidity);
        if (state.formValidity === false) {
          elements.inputForm.classList.add('is-invalid');
        } else if (state.formValidity === true) {
          elements.inputForm.classList.remove('is-invalid');
        }
        elements.feedBack.textContent = i18next.t(`errors.${state.error}`);
        elements.feedBack.classList.add('text-danger');
        elements.feedBack.classList.remove('text-success');
        break;
      default:
        break;
    }
  }
};
