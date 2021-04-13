window.normid = {
  podcastPlayer: document.getElementById('podcast-player'),
  playButton: document.querySelector('.play-button'),
  episodeList: document.querySelector('.episode-list'),
  episodeListItems: [],
  podcastEpisodes: [],
  lastClickedEpisodeIndex: 0,
  init() {
    this.getRSSFeed();
    this.addEventListeners();
  },
  addEventListeners() {
    this.playButton.addEventListener('click', () => {
      this.podcastPlayer.play();
      this.playButton.classList.add('hidden');
    })  
  },
  getRSSFeed() {
    console.log('Getting Normið RSS feed');
    const rssUrl = 'https://normid-rss.webpengu.in';

    fetch(rssUrl)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => this.parseRSSFeed(data));
  },
  parseRSSFeed(data) {
    const items = data.querySelectorAll("item");
    const logo = 'https://normidpodcast.files.wordpress.com/2020/09/cropped-cropped-normic3b0-logo-1-4.png';

    items.forEach(item => {
      const enclosure = item.querySelector('enclosure');
      const publishedAt = item.querySelector('pubDate').innerHTML;
      const startOfTimezoneIndex = publishedAt.indexOf('+');

      this.podcastEpisodes.push({
        title: item.querySelector('title').innerHTML,
        description: item.querySelector('description').firstChild.wholeText.trim(),
        url: enclosure.getAttribute('url'),
        mimeType: enclosure.getAttribute('type'),
        publishedAt: publishedAt.substring(0, startOfTimezoneIndex - 10)
      });
    });

    this.loadDataToUI();
  },
  loadDataToUI() {
    this.podcastEpisodes.forEach((item, index) => {
      const episodeDiv = document.createElement('div');
      const title = document.createElement('p');
      const publishedAt = document.createElement('span');

      episodeDiv.classList.add('episode-list-item');
      episodeDiv.dataset.episode = JSON.stringify(item);
      episodeDiv.dataset.index = index;
      episodeDiv.addEventListener('click', event => {
        const data = event.target.classList.contains('episode-list-item')
          ? JSON.parse(event.target.dataset.episode)
          : JSON.parse(event.target.parentElement.dataset.episode);
        const index = event.target.classList.contains('episode-list-item')
          ? event.target.dataset.index
          : event.target.parentElement.dataset.index;
        
        this.switchEpisode(data, index);
      })
      
      title.textContent = item.title;
      publishedAt.textContent = item.publishedAt;

      episodeDiv.append(title);
      episodeDiv.append(publishedAt);
      this.episodeListItems.push(episodeDiv);
      this.episodeList.append(episodeDiv);
    });

    this.switchEpisode(this.podcastEpisodes[0], this.lastClickedEpisodeIndex);
  },
  switchEpisode(data, index) {
    const lastClickedEpisode = this.episodeListItems[this.lastClickedEpisodeIndex];
    lastClickedEpisode.classList.remove('selected');

    const clickedEpisode = this.episodeListItems[index];
    clickedEpisode.classList.add('selected');

    this.podcastPlayer.src = data.url;
    this.podcastPlayer.setAttribute('type', data.mimeType);
    this.podcastPlayer.load();
    this.playButton.classList.remove('hidden');

    this.lastClickedEpisodeIndex = index;
  }
};

document.addEventListener('DOMContentLoaded', () => window.normid.init());