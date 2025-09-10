(function() {
    'use strict';

    // --- Configuration ---
    // The duration of inactivity in milliseconds before redirecting.
    // Default is 5 minutes (5 * 60 * 1000).
    const TIMEOUT_DURATION = 5 * 60 * 1000; 

    // The URL to redirect to after the timeout.
    const REDIRECT_URL = '/en-US/which-watch/start/index.html';
    // ---------------------

    let inactivityTimer;

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(redirectToHome, TIMEOUT_DURATION);
    }

    function redirectToHome() {
        window.location.href = REDIRECT_URL;
    }

    function setupInactivityDetection() {
        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

        activityEvents.forEach(eventName => {
            document.addEventListener(eventName, resetTimer, true);
        });

        resetTimer();
    }

    window.addEventListener('load', setupInactivityDetection);
})();