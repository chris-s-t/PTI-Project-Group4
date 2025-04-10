# PTI UTS Project Group4
 Projek untuk Ujian Tengah Semester PTI (Teori & Lab) Kelompok 4

# Ketua Kelompok : 
- Adam Rifqy Hajat

# Anggota Kelompok :
- Christian Surya Themadja
- Kevin Mikael
- Muhammad Meccapareva

### GAMEPLAY INFORMATION & RULES

# 🏰 Petualangan Abad Pertengahan

Game 2D bertema kerajaan abad pertengahan di mana kamu memilih karakter dan bertahan hidup di dunia terbuka penuh tantangan. Kelola kebutuhan karaktermu seperti makanan, kebersihan, stamina, dan kebahagiaan untuk bertahan hidup!

## 🎮 Gameplay Overview

Kamu akan memilih satu dari enam karakter unik dan memulai petualangan di berbagai peta kerajaan. Setiap karakter memiliki status awal dan kekayaan yang berbeda, memengaruhi strategi bertahan hidup kamu!

## 🎯 Tujuan Utama
- Bertahan hidup selama mungkin.
- Menjaga 5 status utama dalam kondisi stabil: **Health**, **Food**, **Stamina**, **Happiness**, dan **Hygiene**.
- Menjelajahi peta, menemukan item, dan berinteraksi dengan dunia sekitar.

## 🧙‍♂️ Karakter

| Karakter       | Food | Stamina | Hygiene | Happiness | Money |
|----------------|-------|--------|---------|-----------|-------|
| Noble Man      | 70/90 | 70/80  | 60/100  | 50/100    | 45000 |
| Noble Woman    | 70/90 | 70/80  | 60/100  | 50/100    | 45000 |
| Old Man        | 70/100| 50/70  | 70/100  | 70/100    | 30000 |
| Peasant        | 50/100| 50/100 | 30/100  | 50/100    | 5000  |
| Princess       | 70/70 | 40/60  | 80/100  | 50/100    | 50000 |
| Queen          | 60/80 | 40/70  | 70/100  | 50/100    | 60000 |

## 🕹️ Controls

| Key             | Action                  |
|-----------------|-------------------------|
| Arrow Keys      | Gerakkan karakter       |
| z               | Interaksi               |

## 📊 Status HUD

Kamu akan melihat status bar di pojok kiri atas dengan avatar frame:

- ❤️ **Health** – Mempengaruhi kelangsungan hidup.
- 🍗 **Food** – Menurun seiring waktu, pengaruhi stamina.
- ⚡ **Stamina** – Diperlukan untuk bergerak dan bekerja.
- 😄 **Happiness** – Menaik jika melakukan aktivitas.
- 🧼 **Hygiene** – Pengaruhi kesehatan dan interaksi sosial.

Jika salah satu status mencapai **0**, akan langsung Game Over.

## 💰 Uang

- Uang digunakan untuk membeli makanan, peralatan, atau memperbaiki kondisi.
- Tampilkan di bawah nama karakter.

## 🔁 Sistem Simpan Otomatis

Data karakter, status, dan uang akan tersimpan otomatis setelah pemilihan karakter dan digunakan pada seluruh halaman map.

## Sistem Teknis

- Data status dikalkulasi berdasarkan perbandingan current / max dan dikonversi ke bentuk persen.
- Sistem status menggunakan file statusGUI.html, statusGUI.css, dan statusGUI.js yang dipanggil secara modular agar bisa digunakan di halaman lain tanpa duplikasi.
- Karakter digambar dan dianimasikan menggunakan HTML5 Canvas dan requestAnimationFrame.
