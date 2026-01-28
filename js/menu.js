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