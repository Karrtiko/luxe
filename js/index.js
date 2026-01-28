 document.addEventListener('DOMContentLoaded', function() {
        gsap.registerPlugin(ScrollTrigger, TextPlugin);

        // --- Custom Cursor ---
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        window.addEventListener('mousemove', e => {
            gsap.to(cursorDot, { duration: 0.2, x: e.clientX, y: e.clientY });
            gsap.to(cursorOutline, { duration: 0.6, x: e.clientX, y: e.clientY, ease: "power2.out" });
        });
        document.querySelectorAll('a, button, input, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hover');
                cursorOutline.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hover');
                cursorOutline.classList.remove('hover');
            });
        });

        // --- Smooth Scrolling ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // --- GSAP Animations ---
        gsap.to("#header", { backgroundColor: "rgba(31, 41, 55, 0.8)", backdropFilter: "blur(10px)", scrollTrigger: { trigger: "#home", start: "bottom top", end: "+=100", scrub: 1 } });
        gsap.to('.hero-bg', { backgroundPosition: 'center 80%', ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }});
        gsap.to(".hero-title", { duration: 4, text: "ENAMOUR PARFUME", ease: "none", delay: 0.5 });
        gsap.from(".hero-subtitle", { duration: 2, y: 50, opacity: 0, ease: "power3.out", delay: 1 });
        gsap.from(".hero-cta", { duration: 2, y: 50, opacity: 0, ease: "power3.out", delay: 1.2 });
        const animateFadeIn = (selector) => {
            gsap.utils.toArray(selector).forEach(el => {
                gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, y: 60, opacity: 0, duration: 0.8, ease: "power3.out" });
            });
        };
        animateFadeIn('.section-title');
        animateFadeIn('.about-image-container');
        animateFadeIn('.about-content');
        animateFadeIn('.menu-card');
        animateFadeIn('.feature-card');
        animateFadeIn('.testimonial-card');
        animateFadeIn("#contact form");

        // --- Cart Logic ---
        const cartButton = document.getElementById('cart-button');
        const cartSidebar = document.getElementById('cart-sidebar');
        const closeCartBtn = document.getElementById('close-cart-btn');
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMsg = document.getElementById('empty-cart-msg');
        const cartCount = document.getElementById('cart-count');
        const cartSubtotalEl = document.getElementById('cart-subtotal');
        const checkoutBtn = document.getElementById('checkout-btn');

        let cart = [];

        const openCart = () => cartSidebar.style.transform = 'translateX(0)';
        const closeCart = () => cartSidebar.style.transform = 'translateX(100%)';

        cartButton.addEventListener('click', openCart);
        closeCartBtn.addEventListener('click', closeCart);

        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const item = button.dataset.item;
                const price = parseInt(button.dataset.price);
                addToCart(item, price);
                // Automatically open cart on first add
                if (cart.reduce((sum, item) => sum + item.quantity, 0) === 1) {
                    openCart();
                }
            });
        });

        function addToCart(name, price) {
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            updateCart();
        }

        function updateCart() {
            // Hide gemini recommendation on cart update
            document.getElementById('gemini-recommendation-container').classList.add('hidden');
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '';
                emptyCartMsg.style.display = 'block';
            } else {
                emptyCartMsg.style.display = 'none';
                cartItemsContainer.innerHTML = cart.map(item => `
                    <div class="flex justify-between items-center mb-4 cart-item" data-name="${item.name}">
                        <div>
                            <p class="font-bold">${item.name}</p>
                            <p class="text-sm text-gray-600">Rp ${item.price.toLocaleString('id-ID')}</p>
                        </div>
                        <div class="flex items-center">
                            <button class="quantity-btn dec-btn px-2">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="quantity-btn inc-btn px-2">+</button>
                        </div>
                    </div>
                `).join('');
            }
            
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            cartCount.textContent = totalItems;
            gsap.fromTo(cartCount, {scale: 1.5}, {scale: 1, duration: 0.3, ease: 'bounce.out'});
            cartSubtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
            
            addCartItemListeners();
        }

        function addCartItemListeners() {
            document.querySelectorAll('.cart-item').forEach(el => {
                const name = el.dataset.name;
                el.querySelector('.inc-btn').addEventListener('click', () => changeQuantity(name, 1));
                el.querySelector('.dec-btn').addEventListener('click', () => changeQuantity(name, -1));
            });
        }

        function changeQuantity(name, amount) {
            const item = cart.find(item => item.name === name);
            if (item) {
                item.quantity += amount;
                if (item.quantity <= 0) {
                    cart = cart.filter(cartItem => cartItem.name !== name);
                }
            }
            updateCart();
        }

        // --- Gemini API Logic ---
        const recommendationBtn = document.getElementById('gemini-recommendation-btn');
        const recommendationContainer = document.getElementById('gemini-recommendation-container');

        recommendationBtn.addEventListener('click', getSnackRecommendation);
        
        async function getSnackRecommendation() {
            if (cart.length === 0) {
                recommendationContainer.innerHTML = 'Tambahkan kopi ke keranjang dulu!';
                recommendationContainer.classList.remove('hidden');
                return;
            }

            recommendationContainer.innerHTML = '<div class="loader mx-auto"></div>';
            recommendationContainer.classList.remove('hidden');

            const coffeeList = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
            const userQuery = `Anda adalah seorang barista yang ramah di Harmony Coffee. Pelanggan kami memesan: ${coffeeList}. Berikan satu atau dua rekomendasi camilan (contoh: Croissant Mentega, Brownie Cokelat, Kue Pisang) yang paling cocok dengan pesanan mereka. Jelaskan secara singkat mengapa camilan itu cocok, dengan gaya yang menarik dan bersahabat. Format jawaban dalam HTML paragraf.`;
            
            const apiKey = "AIzaSyAklDvYLTqerF4egZLBCR17EpxWr0CVQAU";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: userQuery }] }] };

            try {
                 let response = await fetchWithExponentialBackoff(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    recommendationContainer.innerHTML = text;
                } else {
                    throw new Error('No content received from API.');
                }
            } catch (error) {
                console.error("Error fetching Gemini recommendation:", error);
                recommendationContainer.innerHTML = "Maaf, sepertinya ada sedikit gangguan. Coba lagi nanti ya.";
            }
        }

        async function fetchWithExponentialBackoff(url, options, retries = 3, backoff = 1000) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    if (response.status === 429 && retries > 0) { // Too Many Requests
                        await new Promise(resolve => setTimeout(resolve, backoff));
                        return fetchWithExponentialBackoff(url, options, retries - 1, backoff * 2);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            } catch (error) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return fetchWithExponentialBackoff(url, options, retries - 1, backoff * 2);
                }
                throw error;
            }
        }

        
        // --- Payment Modal Logic ---
        const paymentModal = document.getElementById('payment-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const totalPriceEl = document.getElementById('total-price');
        const paymentForm = document.getElementById('payment-form');
        const paymentFormContainer = document.getElementById('payment-form-container');
        const paymentSuccess = document.getElementById('payment-success');
        const payNowBtn = document.getElementById('pay-now-btn');

        function openPaymentModal() {
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            if (subtotal === 0) {
                recommendationContainer.innerHTML = 'Keranjang Anda kosong!';
                recommendationContainer.classList.remove('hidden');
                return;
            }
            totalPriceEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
            paymentModal.classList.remove('hidden');
            paymentModal.classList.add('flex');
            gsap.from(paymentModal.firstElementChild, { scale: 0.8, opacity: 0, duration: 0.3, ease: 'power3.out' });
            closeCart();
        }
        
        function closePaymentModal() {
            gsap.to(paymentModal.firstElementChild, { 
                scale: 0.8, opacity: 0, duration: 0.3, ease: 'power3.in',
                onComplete: () => {
                     paymentModal.classList.add('hidden');
                     paymentModal.classList.remove('flex');
                     paymentForm.reset();
                     paymentFormContainer.style.display = 'block';
                     paymentSuccess.style.display = 'none';
                     payNowBtn.disabled = false;
                     payNowBtn.innerText = 'Bayar Sekarang';
                }
            });
        }

        checkoutBtn.addEventListener('click', openPaymentModal);

        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            payNowBtn.disabled = true;
            payNowBtn.innerText = 'Memproses...';
            setTimeout(() => {
                gsap.to(paymentFormContainer, { opacity: 0, duration: 0.5, onComplete: () => {
                     paymentFormContainer.style.display = 'none';
                     paymentSuccess.style.display = 'block';
                     gsap.from(paymentSuccess, {opacity: 0, y: 20, duration: 0.5});
                }});
                setTimeout(() => {
                    closePaymentModal();
                    cart = [];
                    updateCart();
                }, 3000);
            }, 1500);
        });

        closeModalBtn.addEventListener('click', closePaymentModal);
        paymentModal.addEventListener('click', (e) => { if (e.target === paymentModal) closePaymentModal(); });

        // --- Mobile Menu ---
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeMobileMenu = document.getElementById('close-mobile-menu');
        mobileMenuButton.addEventListener('click', () => { mobileMenu.classList.remove('hidden'); mobileMenu.classList.add('flex'); });
        closeMobileMenu.addEventListener('click', () => { mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('flex'); });
        document.querySelectorAll('.mobile-nav-link').forEach(link => { link.addEventListener('click', () => { mobileMenu.classList.add('hidden'); mobileMenu.classList.remove('flex'); }); });
    });

    // sambungan code baru lagi yaaa ini MAP
        document.addEventListener('DOMContentLoaded', () => {
        // Cek jika GSAP dan ScrollTrigger sudah ada
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            const locationSection = document.querySelector('#location');
            if (locationSection) {
                // Animasi untuk peta (meluncur dari kiri)
                gsap.from(locationSection.querySelector('.location-map'), {
                    scrollTrigger: {
                        trigger: locationSection,
                        start: 'top 80%', // Animasi dimulai saat 80% section terlihat
                        toggleActions: 'play none none none'
                    },
                    x: -100,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out'
                });

                // Animasi untuk info lokasi (meluncur dari kanan)
                gsap.from(locationSection.querySelector('.location-info'), {
                    scrollTrigger: {
                        trigger: locationSection,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    },
                    x: 100,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: 0.2 // Sedikit delay agar tidak bersamaan dengan peta
                });
            }
        } else {
            console.log("GSAP atau ScrollTrigger belum dimuat. Animasi scroll tidak akan berjalan.");
        }
    });

    // untuk bagian menu 
    document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Ganti style tombol aktif
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            // 2. Loop semua item menu untuk filter
            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');

                // Hapus class animasi sebelumnya agar bisa beranimasi lagi
                item.classList.remove('animate__animated', 'animate__fadeInUp');

                if (filter === 'all' || filter === category) {
                    item.classList.remove('hidden');
                    // Tambahkan delay kecil agar DOM update sebelum animasi
                    setTimeout(() => {
                        item.classList.add('animate__animated', 'animate__fadeInUp', 'animate__faster');
                    }, 10);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
});