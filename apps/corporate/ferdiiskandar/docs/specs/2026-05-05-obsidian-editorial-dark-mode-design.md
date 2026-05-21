# Obsidian Editorial Dark Mode

Tanggal: 2026-05-05
Status: approved for implementation
Direction: A. Obsidian Editorial

## Intent

Dark mode harus terasa seperti versi malam dari dossier editorial yang sudah ada, bukan reskin dashboard gelap generik. Struktur, hierarchy, dan narasi halaman tetap sama; yang berubah adalah atmosfer, palet, dan treatment permukaan.

## Visual Rules

1. Dasar warna menggunakan warm black dan charcoal, bukan biru-hitam.
2. Teks utama memakai ivory lembut, bukan putih murni.
3. Aksen memakai amber-tembaga tipis untuk section markers, rules, hover, dan focal details.
4. Background grid tetap ada, tetapi lebih halus dan lebih seperti printed paper at night.
5. Panel penting memakai lapisan gelap bertingkat agar halaman terasa konsisten lintas section.

## Scope

- `app/globals.css`
- Verifikasi visual live pada homepage
- Regression test untuk token dark theme utama

## Non-Goals

- Tidak mengubah struktur section
- Tidak mengubah copy
- Tidak mengubah mode terang
- Tidak mengubah perilaku toggle theme
