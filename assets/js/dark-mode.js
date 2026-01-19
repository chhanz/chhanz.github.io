/* Dark Mode Toggle */
(function (window, document) {
    'use strict';

    // Check for saved dark mode preference
    function initDarkMode() {
        const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
        
        if (!darkModeCheckbox) {
            return;
        }
        
        const savedMode = localStorage.getItem('darkMode');
        
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
            darkModeCheckbox.checked = true;
        }

        // Toggle dark mode
        darkModeCheckbox.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        initDarkMode();
    }

}(window, window.document));
