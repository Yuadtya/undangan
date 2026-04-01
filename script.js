if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
window.scrollTo(0, 0);

AOS.init({ once: false, mirror: true, offset: 50 });

const cover = document.getElementById('cover-page');
const music = document.getElementById('bg-music');
const btnMusic = document.getElementById('btn-music');
const btnKembali = document.getElementById('btn-kembali');
const iconPlay = document.getElementById('icon-music-play');
const iconPause = document.getElementById('icon-music-pause');

let slideshowInterval;
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

// Path gambar sudah diubah (tanpa images/)
const galleryImages = [
    './galeri1.png', './galeri2.png', './galeri3.png', './galeri4.png',
    './galeri5.png', './galeri6.png', './galeri7.png', './galeri8.png',
    './galeri9.png', './galeri10.png', './galeri11.png', './galeri12.png',
];

let currentGalleryIndex = 0;
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(index) {
    if (galleryImages[index]) {
        currentGalleryIndex = index;
        lightboxImg.src = galleryImages[currentGalleryIndex];
        lightbox.classList.remove('hidden');
        setTimeout(() => { lightbox.classList.remove('opacity-0'); lightbox.classList.add('opacity-100'); }, 10);
        document.body.classList.add('overflow-hidden');
        document.body.classList.remove('overflow-auto-custom');
    }
}

function closeLightbox() {
    lightbox.classList.add('opacity-0');
    lightbox.classList.remove('opacity-100');
    setTimeout(() => { lightbox.classList.add('hidden'); }, 300);
    document.body.classList.remove('overflow-hidden');
    document.body.classList.add('overflow-auto-custom');
}

function changeImageGaleri(step) {
    currentGalleryIndex = (currentGalleryIndex + step + galleryImages.length) % galleryImages.length;
    lightboxImg.style.opacity = '0.5';
    setTimeout(() => { lightboxImg.src = galleryImages[currentGalleryIndex]; lightboxImg.style.opacity = '1'; }, 150);
}

function closeLightboxOutside(event) { if (event.target === lightbox) closeLightbox(); }

function bukaUndangan() {
    // 1. Geser cover ke atas
    cover.classList.add('slide-up'); 
    
    // 2. Izinkan halaman di-scroll (karena sebelumnya di-lock)
    document.body.classList.remove('overflow-hidden'); 
    document.body.classList.add('overflow-auto-custom'); 
    
    // Tampilkan tombol interaksi
    btnMusic.classList.remove('hidden'); 
    btnKembali.classList.remove('hidden'); 
    setTimeout(() => { AOS.refresh(); }, 500);
    
    // 3. Mainkan musik latar
    music.play().catch(e => console.log("Browser memblokir autoplay musik sebelum ada interaksi pengguna."));
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
    btnMusic.classList.add('spin-slow');
    if(!slideshowInterval) slideshowInterval = setInterval(nextSlide, 8000); 
}

function tutupUndangan() {
    cover.classList.remove('slide-up'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.classList.add('overflow-hidden');
    document.body.classList.remove('overflow-auto-custom'); 
    btnMusic.classList.add('hidden'); 
    btnKembali.classList.add('hidden'); 
    music.pause();
    btnMusic.classList.remove('spin-slow');
    if(slideshowInterval){ clearInterval(slideshowInterval); slideshowInterval = null; }
}

function nextSlide() {
    if (slides.length < 2) return; 
    slides[currentSlide].classList.remove('opacity-100');
    slides[currentSlide].classList.add('opacity-0');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.remove('opacity-0');
    slides[currentSlide].classList.add('opacity-100');
}

function toggleMusic() {
    if (music.paused) {
        music.play(); iconPlay.classList.remove('hidden'); iconPause.classList.add('hidden'); btnMusic.classList.add('spin-slow');
    } else {
        music.pause(); iconPlay.classList.add('hidden'); iconPause.classList.remove('hidden'); btnMusic.classList.remove('spin-slow');
    }
}

const countDownDate = new Date("Aug 31, 2026 19:00:00").getTime();
const countdownInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;
    if(document.getElementById("hari")) {
        document.getElementById("hari").innerHTML = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        document.getElementById("jam").innerHTML = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        document.getElementById("menit").innerHTML = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        document.getElementById("detik").innerHTML = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
    }
    if (distance < 0 && document.getElementById("countdown")) {
        clearInterval(countdownInterval);
        document.getElementById("countdown").innerHTML = "<p class='text-xl md:text-2xl font-serif text-[#d4af37]'>Acara Sedang Berlangsung / Selesai</p>";
    }
}, 1000);

const scriptURL = 'https://script.google.com/macros/s/AKfycbzHzu4MxscWhsP-R80kmo9HuQvQ-pw63ljkYwUeJH8kJGCPw7prRzVbTcUtXPRkrxnNTg/exec'; 

const form = document.getElementById('rsvp-form');
const btnSubmit = document.getElementById('btn-submit');
const btnText = document.getElementById('btn-text');
const btnLoading = document.getElementById('btn-loading');
const wishesContainer = document.getElementById('wishes-container');
const totalUcapan = document.getElementById('total-ucapan');
const filterUcapan = document.getElementById('filter-ucapan');

let allWishes = [];

function formatWaktu(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + " menit yang lalu";
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + " jam yang lalu";
    if (diffInSeconds < 604800) return Math.floor(diffInSeconds / 86400) + " hari yang lalu";
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function renderWishes(wishesArray) {
    if(!wishesContainer) return; // Mencegah error jika id tidak ditemukan
    wishesContainer.innerHTML = ''; 
    if(totalUcapan) totalUcapan.textContent = wishesArray.length + ' ucapan';
    
    if (wishesArray.length === 0) {
        wishesContainer.innerHTML = '<p class="text-center text-gray-400 italic">Belum ada ucapan.</p>';
        return;
    }
    
    wishesArray.forEach(wish => {
        const div = document.createElement('div');
        div.className = 'border-b border-gray-100 pb-6';
        div.innerHTML = `
            <h4 class="font-bold text-gray-800 mb-1">${wish.Nama}</h4>
            <p class="text-xs text-gray-400 mb-3">${formatWaktu(wish.Waktu)}</p>
            <p class="text-gray-600 italic text-sm md:text-base">${wish.Ucapan}</p>
        `;
        wishesContainer.appendChild(div);
    });
}

function loadWishes() {
    if(!wishesContainer) return;
    fetch(scriptURL)
        .then(response => {
            if (!response.ok) throw new Error("Jaringan error");
            return response.json();
        })
        .then(data => {
            allWishes = data;
            renderWishes(allWishes);
        })
        .catch(error => {
            console.error('Error load ucapan:', error);
            wishesContainer.innerHTML = '<p class="text-center text-gray-400 italic">Belum ada ucapan.</p>';
        });
}

if(filterUcapan) {
    filterUcapan.addEventListener('change', function() {
        let sortedWishes = [...allWishes];
        if (this.value === 'terlama') { sortedWishes.reverse(); }
        renderWishes(sortedWishes);
    });
}

if(form) {
    form.addEventListener('submit', e => {
        e.preventDefault();
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        btnSubmit.disabled = true;
        btnSubmit.classList.add('opacity-75', 'cursor-not-allowed');

        fetch(scriptURL, { method: 'POST', body: new FormData(form), mode: 'no-cors' })
            .then(() => {
                alert('Terima kasih! RSVP dan Ucapan Anda berhasil dikirim.');
                form.reset();
                setTimeout(loadWishes, 1500); 
            })
            .catch(error => {
                alert('Maaf, terjadi kesalahan saat mengirim data. Silakan coba lagi.');
            })
            .finally(() => {
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
                btnSubmit.disabled = false;
                btnSubmit.classList.remove('opacity-75', 'cursor-not-allowed');
            });
    });
}

loadWishes();