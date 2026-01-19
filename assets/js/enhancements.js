/* Modern Enhancements */
(function (window, document, $) {
    'use strict';

    $(function () {
        // Progress Bar
        function initProgressBar() {
            if ($('body').hasClass('post-template')) {
                const progressContainer = $('<div class="progress-container"><div class="progress-bar" id="progress-bar"></div></div>');
                $('body').prepend(progressContainer);

                $(window).on('scroll', function() {
                    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                    const scrolled = (winScroll / height) * 100;
                    $('#progress-bar').css('width', scrolled + '%');
                });
            }
        }

        // Table of Contents Generator - DISABLED per user feedback
        function generateTOC() {
            // Feature disabled - not working properly
            return;
        }

        // Lazy Loading Images
        function initLazyLoading() {
            const images = document.querySelectorAll('img[data-src]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // External Links - Open in New Tab
        function initExternalLinks() {
            $('a').filter(function() {
                return this.hostname && this.hostname !== location.hostname;
            }).attr('target', '_blank').attr('rel', 'noopener noreferrer');
        }

        // Copy Code Button
        function initCopyCodeButton() {
            $('pre').each(function() {
                const pre = $(this);
                const button = $('<button class="copy-code-btn" aria-label="코드 복사">📋</button>');
                
                button.on('click', function() {
                    const code = pre.find('code').text() || pre.text();
                    
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(code).then(() => {
                            button.text('✅');
                            setTimeout(() => button.text('📋'), 2000);
                        });
                    } else {
                        // Fallback for older browsers
                        const textarea = document.createElement('textarea');
                        textarea.value = code;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        button.text('✅');
                        setTimeout(() => button.text('📋'), 2000);
                    }
                });
                
                pre.css('position', 'relative');
                button.css({
                    'position': 'absolute',
                    'top': '8px',
                    'right': '8px',
                    'padding': '6px 10px',
                    'background': 'transparent',
                    'border': 'none',
                    'border-radius': '4px',
                    'cursor': 'pointer',
                    'font-size': '16px',
                    'opacity': '0.5',
                    'transition': 'all 0.3s ease',
                    'backdrop-filter': 'blur(4px)'
                });
                
                button.hover(
                    function() { 
                        $(this).css({
                            'opacity': '1',
                            'background': 'rgba(255, 255, 255, 0.1)',
                            'transform': 'scale(1.1)'
                        }); 
                    },
                    function() { 
                        $(this).css({
                            'opacity': '0.5',
                            'background': 'transparent',
                            'transform': 'scale(1)'
                        }); 
                    }
                );
                
                pre.append(button);
            });
        }

        // Back to Top - Smooth Scroll
        $('#back-to-top').on('click', function(e) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: 0 }, 600);
        });

        // Initialize all enhancements
        initProgressBar();
        generateTOC();
        initLazyLoading();
        initExternalLinks();
        initCopyCodeButton();

        // Add skip to main content link
        $('body').prepend('<a href="#content" class="skip-to-main">본문으로 건너뛰기</a>');
    });

}(window, window.document, window.jQuery));
