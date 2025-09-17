(function() {
    'use strict';

    /**
     * This script provides two main functionalities for the kiosk:
     * 1. Inactivity Timer: Returns the user to the home screen after a period of inactivity.
     * 2. Fast Tap Navigation: Makes navigation elements feel more responsive by triggering
     *    navigation on 'pointerdown' (touch/press) instead of 'click' (release).
     */

    // --- Configuration ---
    const INACTIVITY_TIMEOUT = 300000; // 5 minutes in milliseconds
    const HOME_PAGE_URL = '/en-US/which-watch/start/index.html';
    
    // Selectors for elements that should have immediate navigation on press.
    const FAST_TAP_SELECTORS = [
        'a.g__button',              // Main buttons (e.g., on the start page, compare, back)
        'g-card > a',               // Product cards
        'a.g__sub-nav__link'        // Header navigation links (logo, "WHICH WATCH")
    ].join(',');

    // --- Inactivity Timer Logic ---
    let inactivityTimer;

    function goHome() {
        window.location.href = HOME_PAGE_URL;
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(goHome, INACTIVITY_TIMEOUT);
    }

    // --- Immediate Navigation on Press (Fast Tap) Logic ---
    function initializeFastTap() {
        document.addEventListener('pointerdown', function(event) {
            // Find the closest ancestor of the event target that matches our selectors.
            const targetElement = event.target.closest(FAST_TAP_SELECTORS);
            
            // If a matching element was found and it's a link.
            if (targetElement && targetElement.href) {
                // Prevent default 'click', 'touchend', and context menu on long press.
                event.preventDefault();
                event.stopPropagation();
                
                // For links with a real URL, navigate immediately.
                if (targetElement.getAttribute('href') && targetElement.getAttribute('href') !== '#') {
                    window.location.href = targetElement.href;
                } else {
                    // For links with href="#" or javascript actions, trigger a click.
                    // This correctly handles elements like the "BACK" button (onclick="history.back()").
                    targetElement.click();
                }
            }
        }, true); // Use capture phase to be the first to handle the event.
    }

    // --- Initialization ---
    function initializeKioskBehavior() {
        resetInactivityTimer();
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        document.addEventListener('touchstart', resetInactivityTimer);
        document.addEventListener('click', resetInactivityTimer);

        initializeFastTap();
    }
    
    document.addEventListener('DOMContentLoaded', initializeKioskBehavior);

})();