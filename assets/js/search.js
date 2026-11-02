/* Lazy Search
 * search.json(전체 포스트 본문)은 수 MB 크기라 페이지 로드시 받지 않고,
 * 사용자가 검색창에 처음 포커스/입력할 때만 검색 라이브러리와 인덱스를 불러온다.
 */
(function (window, document) {
    'use strict';

    var input = document.getElementById('search-input');
    var results = document.getElementById('results-container');
    if (!input || !results) {
        return;
    }

    var loaded = false;

    function init() {
        if (loaded) {
            return;
        }
        loaded = true;

        var script = document.createElement('script');
        script.src = '/assets/lib/jekyll-search.min.js';
        script.onload = function () {
            window.SimpleJekyllSearch({
                searchInput: input,
                resultsContainer: results,
                json: input.getAttribute('data-search-json'),
                searchResultTemplate: '<li><a href="{url}" title="{desc}">{title}</a></li>',
                noResultsText: '<li>No results found</li>',
                limit: 15,
                fuzzy: false
            });
        };
        document.head.appendChild(script);
    }

    input.addEventListener('focus', init, { once: true });
    input.addEventListener('input', init, { once: true });
}(window, window.document));
