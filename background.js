// Listen for navigation to explore page
chrome.webNavigation.onBeforeNavigate.addListener(
  function(details) {
    // Check if the URL is the explore page
    if (details.url === 'https://www.instagram.com/explore' || 
        details.url === 'https://www.instagram.com/explore/') {
      // Redirect to the search page
      chrome.tabs.update(details.tabId, {
        url: 'https://www.instagram.com/explore/search/'
      });
    }
  },
  {
    url: [{
      hostEquals: 'www.instagram.com',
      pathPrefix: '/explore'
    }]
  }
);
