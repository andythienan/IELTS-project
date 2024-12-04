fetch('/components/header/header.html')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(html => {
        // Inject the HTML content into the footer element
        document.querySelector('.header').innerHTML = html;

        // Dynamically load the footer CSS
        if (!document.querySelector('link[href="/components/header/header.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/components/header/header.css';
            document.head.appendChild(link);
        }
    })
    .catch(error => console.error('Error loading header:', error));
