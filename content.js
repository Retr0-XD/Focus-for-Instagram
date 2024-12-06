// Constants for selectors and text
const SELECTORS = {
    REELS: 'a[href*="/reels/"]',
    MAIN_FEED: 'main[role="main"]',
    ARTICLES_CONTAINER: 'div[style*="flex-grow"]',
    TABLIST: 'div[role="tablist"]',
    FEED_CONTAINER: 'div._aam1, div[style*="flex-grow"]',
    BODY: 'body'
};

const TEXTS = {
    SUGGESTED_POSTS: ['Suggested posts', 'Suggested for you']
};

// Function to disable scrolling on specific elements
function disableScrolling() {
    try {
        if (window.location.pathname === '/') {
            // Disable scrolling on feed container
            document.querySelectorAll(SELECTORS.FEED_CONTAINER).forEach(container => {
                if (container) {
                    container.style.overflow = 'hidden';
                    container.style.maxHeight = '100vh';
                }
            });

            // Disable scrolling on main feed
            const mainFeed = document.querySelector(SELECTORS.MAIN_FEED);
            if (mainFeed) {
                mainFeed.style.overflow = 'hidden';
                mainFeed.style.maxHeight = '100vh';
            }

            // Add class to body for homepage
            document.body.classList.add('focus-homepage');
        } else {
            // Remove class when not on homepage
            document.body.classList.remove('focus-homepage');
        }
    } catch (error) {
        console.error('Error in disableScrolling:', error);
    }
}

// Function to remove Reels and suggested posts
function cleanInstagram() {
    try {
        // Hide Reels in navigation
        document.querySelectorAll(SELECTORS.REELS).forEach(link => {
            const parent = link.closest(SELECTORS.TABLIST);
            if (parent) {
                parent.style.display = 'none';
            }
        });

        // Hide suggested posts
        document.querySelectorAll('div').forEach(div => {
            const text = div.textContent || '';
            if (TEXTS.SUGGESTED_POSTS.some(suggestedText => text.includes(suggestedText))) {
                const article = div.closest('article');
                if (article) {
                    article.style.display = 'none';
                }
            }
        });

        // Add overlay message on homepage
        if (window.location.pathname === '/') {
            const mainFeed = document.querySelector(SELECTORS.MAIN_FEED);
            if (mainFeed && !document.getElementById('focus-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'focus-overlay';
                overlay.innerHTML = `
                    <div class="focus-message">
                        <img src="${chrome.runtime.getURL('assets/image.png')}" alt="Focus Mode" class="focus-image">
                        <h2>Posts Hidden</h2>
                        <p class="focus-description">Feed posts are hidden to help you stay focused.</p>
                        <p class="focus-suggestion">Try using the search feature or visiting specific profiles instead.</p>
                        <div class="focus-footer">
                            <p class="version-info">v1.0.0</p>
                            <p class="developer-info">Developed by Retr0XD</p>
                        </div>
                    </div>
                `;
                mainFeed.appendChild(overlay);
            }
        }

        // Ensure scrolling is disabled
        disableScrolling();
    } catch (error) {
        console.error('Error in cleanInstagram:', error);
    }
}

// Function to handle explore page redirect
function handleExploreRedirect() {
    try {
        if (window.location.pathname === '/explore/' || window.location.pathname === '/explore') {
            window.location.replace('https://www.instagram.com/explore/search/');
        }
    } catch (error) {
        console.error('Error in handleExploreRedirect:', error);
    }
}

// Prevent scroll function with debounce
const preventScroll = (() => {
    let timeout;
    return (e) => {
        if (window.location.pathname !== '/') return;
        
        if (timeout) return;
        timeout = setTimeout(() => {
            timeout = null;
        }, 100);

        // Prevent scrolling on homepage
        e.preventDefault();
        return false;
    };
})();

// Initialize the extension
function init() {
    try {
        // Run initial cleanup
        cleanInstagram();
        handleExploreRedirect();

        // Add scroll prevention
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('scroll', preventScroll, { passive: false });

        // Watch for URL changes
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                handleExploreRedirect();
                cleanInstagram();
            }
        }).observe(document.documentElement || document.body, {
            subtree: true,
            childList: true
        });

        // Watch for content changes
        const contentObserver = new MutationObserver(() => {
            cleanInstagram();
        });

        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Run cleanup periodically for dynamic content
        setInterval(cleanInstagram, 2000);
    } catch (error) {
        console.error('Error initializing Focus for Instagram:', error);
    }
}

// Start the extension
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
