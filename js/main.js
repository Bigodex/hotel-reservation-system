/* Chalé Solaris — interações do site */
(function () {
    document.documentElement.classList.remove('no-js');

    /* ---------- Menu mobile ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open);
            toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    /* ---------- Header com sombra ao rolar ---------- */
    var header = document.querySelector('.site-header');
    if (header) {
        var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---------- Animação de entrada ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ---------- Ano no rodapé ---------- */
    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    /* ---------- Lightbox da galeria ---------- */
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
    if (items.length) {
        var icon = {
            close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
            prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
            next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>'
        };
        var box = document.createElement('div');
        box.className = 'lightbox';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-modal', 'true');
        box.setAttribute('aria-label', 'Visualizador de imagens');
        box.innerHTML =
            '<button class="lightbox-btn lightbox-close" aria-label="Fechar">' + icon.close + '</button>' +
            '<button class="lightbox-btn lightbox-prev" aria-label="Imagem anterior">' + icon.prev + '</button>' +
            '<img alt="">' +
            '<button class="lightbox-btn lightbox-next" aria-label="Próxima imagem">' + icon.next + '</button>' +
            '<span class="lightbox-count"></span>';
        document.body.appendChild(box);

        var img = box.querySelector('img');
        var count = box.querySelector('.lightbox-count');
        var current = 0;
        var lastFocus = null;

        var show = function (i) {
            current = (i + items.length) % items.length;
            var link = items[current];
            img.src = link.getAttribute('href');
            img.alt = (link.querySelector('img') || {}).alt || '';
            count.textContent = (current + 1) + ' / ' + items.length;
        };
        var open = function (i) {
            lastFocus = document.activeElement;
            show(i);
            box.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            box.querySelector('.lightbox-close').focus();
        };
        var close = function () {
            box.classList.remove('is-open');
            document.body.style.overflow = '';
            if (lastFocus) lastFocus.focus();
        };

        items.forEach(function (link, i) {
            link.addEventListener('click', function (e) { e.preventDefault(); open(i); });
        });
        box.querySelector('.lightbox-close').addEventListener('click', close);
        box.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1); });
        box.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1); });
        box.addEventListener('click', function (e) { if (e.target === box) close(); });
        document.addEventListener('keydown', function (e) {
            if (!box.classList.contains('is-open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(current - 1);
            if (e.key === 'ArrowRight') show(current + 1);
        });
    }

    /* ---------- Formulário de reserva ---------- */
    var booking = document.getElementById('booking-form');
    if (booking) {
        var checkin = booking.querySelector('#checkin');
        var checkout = booking.querySelector('#checkout');
        var guests = booking.querySelector('#hospedes');
        var dateError = document.getElementById('date-error');
        var out = {
            checkin: document.getElementById('sum-checkin'),
            checkout: document.getElementById('sum-checkout'),
            nights: document.getElementById('sum-nights'),
            guests: document.getElementById('sum-guests'),
            room: document.getElementById('sum-room')
        };

        var toISO = function (d) {
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        };
        var formatDate = function (value) {
            if (!value) return '—';
            var p = value.split('-');
            return p[2] + '/' + p[1] + '/' + p[0];
        };

        var today = new Date();
        checkin.min = toISO(today);

        var update = function () {
            if (checkin.value) {
                var next = new Date(checkin.value + 'T00:00:00');
                next.setDate(next.getDate() + 1);
                checkout.min = toISO(next);
            }

            var nights = 0;
            var invalid = false;
            if (checkin.value && checkout.value) {
                nights = Math.round((new Date(checkout.value) - new Date(checkin.value)) / 86400000);
                invalid = nights < 1;
            }
            checkout.setCustomValidity(invalid ? 'A data de check-out deve ser posterior ao check-in.' : '');
            dateError.hidden = !invalid;

            var room = booking.querySelector('input[name="quarto"]:checked');
            out.checkin.textContent = formatDate(checkin.value);
            out.checkout.textContent = formatDate(checkout.value);
            out.nights.textContent = nights > 0 ? nights + (nights === 1 ? ' noite' : ' noites') : '—';
            out.guests.textContent = guests.options[guests.selectedIndex].text;
            out.room.textContent = room ? room.dataset.label : '—';
        };

        booking.addEventListener('input', update);
        booking.addEventListener('change', update);
        update();
    }

    /* ---------- Página de confirmação ---------- */
    var confirmList = document.getElementById('confirm-details');
    if (confirmList) {
        var params = new URLSearchParams(window.location.search);
        var rooms = { standard: 'Standard', deluxe: 'Deluxe', suite: 'Suíte' };
        var fmt = function (v) { var p = v.split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : v; };
        var rows = [
            ['Hóspede', params.get('nome')],
            ['Check-in', params.get('checkin') && fmt(params.get('checkin'))],
            ['Check-out', params.get('checkout') && fmt(params.get('checkout'))],
            ['Hóspedes', params.get('hospedes') && (params.get('hospedes') === '4' ? '4+' : params.get('hospedes'))],
            ['Acomodação', rooms[params.get('quarto')]]
        ].filter(function (r) { return r[1]; });

        if (rows.length) {
            rows.forEach(function (r) {
                var li = document.createElement('li');
                var a = document.createElement('span');
                var b = document.createElement('span');
                a.textContent = r[0];
                b.textContent = r[1];
                li.appendChild(a);
                li.appendChild(b);
                confirmList.appendChild(li);
            });
            var name = params.get('nome');
            var greet = document.getElementById('confirm-name');
            if (name && greet) greet.textContent = ', ' + name.split(' ')[0];
        } else {
            confirmList.remove();
        }
    }
})();
