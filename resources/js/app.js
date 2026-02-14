import './bootstrap';
    $(function () {
        // --- SEARCH & FILTER LOGIC ---
        function applySearchAndCategory() {
            const search = ($('#global-search').val() || '').toLowerCase().trim();
            const activeCategory = $('.category-menu.active').data('category') || 'all';

            $('.product-card').each(function () {
                const name = ($(this).data('name') || '').toString();
                const category = ($(this).data('category') || '').toString();
                const matchSearch = !search || name.includes(search);
                const matchCategory = activeCategory === 'all' || category === activeCategory;
                
                if (matchSearch && matchCategory) {
                    $(this).show().css('opacity', '1');
                } else {
                    $(this).hide().css('opacity', '0');
                }
            });
        }

        $('#global-search').on('input', applySearchAndCategory);

        $('.category-menu').on('click', function () {
            $('.category-menu').removeClass('active bg-blue-600 text-white shadow-md shadow-blue-100').addClass('bg-white text-slate-600 border-slate-200');
            $(this).addClass('active bg-blue-600 text-white shadow-md shadow-blue-100').removeClass('bg-white text-slate-600 border-slate-200');
            applySearchAndCategory();
        });

        // --- SCROLL BUTTONS ---
        $('.scroll-left').on('click', function () {
            const target = $($(this).data('target'));
            target.animate({ scrollLeft: target.scrollLeft() - 300 }, 400);
        });

        $('.scroll-right').on('click', function () {
            const target = $($(this).data('target'));
            target.animate({ scrollLeft: target.scrollLeft() + 300 }, 400);
        });

        // --- COOKIES & MODALS ---
        if (!localStorage.getItem('cookie_consent')) {
            setTimeout(() => $('#cookie-banner').removeClass('hidden').addClass('animate-bounce-in'), 2000);
        }

        $('#cookie-accept, #cookie-reject').on('click', function () {
            localStorage.setItem('cookie_consent', 'done');
            $('#cookie-banner').fadeOut();
        });

        $('.policy-btn').on('click', function () {
            $('#policy-title').text($(this).data('policy-title'));
            $('#policy-content').html($(this).data('policy-content'));
            $('#policy-modal').removeClass('hidden').addClass('flex');
        });

        $('#policy-close, #policy-modal').on('click', function (e) {
            if (e.target === this || e.target.id === 'policy-close' || $(e.target).closest('#policy-close').length) {
                $('#policy-modal').addClass('hidden').removeClass('flex');
            }
        });

        // --- AUTH MODAL ---
        $('#open-auth-modal').on('click', function () {
            $('#auth-modal-backdrop').css('display', 'flex').hide().fadeIn(140);
        });

        $('#close-auth-modal').on('click', function () {
            $('#auth-modal-backdrop').fadeOut(140);
        });

        $('#auth-modal-backdrop').on('click', function (e) {
            if (e.target.id === 'auth-modal-backdrop') {
                $('#auth-modal-backdrop').fadeOut(140);
            }
        });

        if ($('#auth-modal-backdrop').data('open-on-load') === 1 || $('#auth-modal-backdrop').data('open-on-load') === '1') {
            $('#auth-modal-backdrop').css('display', 'flex');
        }
    });
