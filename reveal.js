document.addEventListener('dynamicContentLoaded', () => { // Wait for dynamic content to load before executing the script (Listening to custom "dynamicContentLoaded" event from other script)

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const revealCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    };
    
    const observer = new IntersectionObserver(revealCallback, observerOptions);
    
    // Select all elements with reveal class
    document.querySelectorAll('.reveal').forEach(element => {
        observer.observe(element);
    });

});
