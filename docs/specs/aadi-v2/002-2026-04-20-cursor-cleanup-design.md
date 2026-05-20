# Spec: Cursor IDE Cleanup Script (.bat)

## 1. Goal
Membuat script batch (.bat) otomatis yang bisa dijalankan dari Desktop untuk membersihkan file sampah, cache, dan data sementara dari Cursor IDE guna menjaga performa dan menghemat ruang disk.

## 2. Target Pembersihan
Script akan menghapus folder-folder berikut di dalam `%APPDATA%\Cursor\User\`:
- `workspaceStorage` (State internal project, bukan file code)
- `Cache` & `Code Cache`
- `GPUCache`
- `logs`
- `GlobalStorage` (Internal apps cache)

## 3. Alur Kerja Script
1.  **Process Check:** Cek apakah `Cursor.exe` sedang berjalan. Jika iya, minta user menutup aplikasi atau tutup otomatis (opsional).
2.  **Execution:** Menjalankan perintah `rmdir /s /q` dan `del /s /q /f` pada target folder.
3.  **Validation:** Memberikan feedback folder mana saja yang berhasil dibersihkan.
4.  **Completion:** Menunggu input user sebelum menutup window (pause).

## 4. Keamanan & Risiko
- **Risiko:** User akan kehilangan state UI (file yang terbuka terakhir kali, posisi sidebar).
- **Keamanan:** Tidak akan menyentuh folder `.cursor/rules` atau file codingan di folder project.

## 5. Lokasi File
- **Path:** `C:\Users\%USERNAME%\Desktop\CleanCursor.bat`
