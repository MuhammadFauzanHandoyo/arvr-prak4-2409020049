// Fungsi bantu bersama untuk kedua demo (status dan pemeriksaan kamera)
const LOAD_TIMEOUT_MS = 60000; // batas waktu memuat (ms)

// Menampilkan status di elemen #status. state: idle, searching, found, error
export function setStatus(text, state) {
  const el = document.getElementById('status');
  el.textContent = text;
  el.dataset.state = state;
}

// Memeriksa syarat dasar kamera. Mengembalikan null jika OK, atau pesan masalah.
export function checkCameraSupport() {
  if (!window.isSecureContext) {
    return 'Halaman bukan secure context. Buka lewat HTTPS (mis. GitHub Pages) atau http://localhost di laptop.';
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return 'Browser ini tidak menyediakan akses kamera (getUserMedia).';
  }
  return null;
}

// Menghubungkan tombol "Mulai" dengan fungsi start(). Kamera hanya diminta setelah tombol ditekan.
export function setupStartButton(startFn) {
  const btn = document.getElementById('startBtn');
  btn.addEventListener('click', async () => {
    const problem = checkCameraSupport();
    if (problem) {
      setStatus('Error: ' + problem, 'error');
      btn.disabled = true;
      return;
    }
    document.getElementById('consent').style.display = 'none';
    setStatus('Memuat... izinkan kamera jika diminta', 'idle');
    try {
      // MindAR tidak selalu menolak (reject) saat unduhan model/target gagal; beri batas waktu.
      const timeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('timeout')), LOAD_TIMEOUT_MS)
      );
      await Promise.race([startFn(), timeout]);
    } catch (err) {
      console.error('Gagal memulai:', err);
      document.getElementById('consent').style.display = 'flex';
      btn.disabled = false;
      const messages = {
        NotAllowedError: 'Izin kamera ditolak. Izinkan kamera untuk situs ini lalu coba lagi.',
        NotFoundError: 'Kamera tidak ditemukan pada perangkat ini.',
        NotReadableError: 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.',
      };
      const message = err?.message === 'timeout'
        ? 'Pemuatan terlalu lama. Periksa koneksi internet lalu coba lagi.'
        : messages[err?.name] || 'Kamera gagal dimulai. Periksa izin kamera, koneksi internet, dan sertifikat HTTPS.';
      setStatus('Error: ' + message, 'error');
    }
  });
}