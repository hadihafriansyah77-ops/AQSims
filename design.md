# Design Document: AI Civilization Simulator Mobile App

## Overview

Aplikasi mobile untuk mensimulasikan peradaban AI otonom dengan agen cerdas (IQ 150+) yang melakukan riset, berinteraksi, dan berevolusi dalam dunia 2D. Pengguna dapat mengamati, mengontrol, dan berintervensi dalam simulasi.

## Screen List

1. **Splash Screen** - Logo dan loading
2. **Home/Dashboard** - Ringkasan peradaban, statistik global, kontrol simulasi
3. **World Map** - Visualisasi 2D dunia dengan agen, lokasi, dan sumber daya
4. **Agent Profile** - Detail agen individual (IQ, kepribadian, memori, aset)
5. **Knowledge Base** - Daftar pengetahuan dan temuan riset peradaban
6. **God Mode Panel** - Kontrol pengguna (modifikasi agen, injeksi peristiwa, command riset)
7. **Settings** - Konfigurasi simulasi, tema, bahasa

## Primary Content and Functionality

### Home/Dashboard Screen
- **Civilization Stats**: Jumlah agen, total pengetahuan, energi global, ekonomi
- **Simulation Controls**: Play/Pause, Speed (1x-50x), Reset
- **Quick Actions**: Go to World Map, Open God Mode, View Knowledge Base
- **Recent Events**: Log peristiwa penting (agen baru lahir, temuan riset, konflik)
- **Time Display**: Waktu simulasi (hari/jam/menit)

### World Map Screen
- **2D Canvas**: Visualisasi grid dengan agen (lingkaran berwarna), lokasi riset (bangunan), sumber daya (marker)
- **Zoom & Pan**: Gesture untuk zoom in/out dan pan
- **Agent Tap**: Tap agen untuk melihat profil singkat
- **Legend**: Warna agen (kepribadian), tipe lokasi, sumber daya
- **Minimap**: Tampilan mini di corner untuk navigasi

### Agent Profile Screen
- **Header**: Nama agen, IQ, kepribadian, status (hidup/mati)
- **Stats**: Energi, kesehatan, aset, pengetahuan yang dimiliki
- **Memory Stream**: Daftar memori kronologis (scrollable)
- **Interactions**: Riwayat komunikasi dengan agen lain
- **Relationships**: Grafik hubungan sosial (kolaborasi, konflik)
- **Actions** (God Mode): Edit IQ, inject memori, transfer aset

### Knowledge Base Screen
- **Search & Filter**: Cari pengetahuan berdasarkan topik, agen pembuat, tanggal
- **Knowledge List**: Daftar pengetahuan dengan metadata (pembuat, tanggal, rating)
- **Detail View**: Baca pengetahuan lengkap, lihat bukti, referensi
- **Contribution**: Lihat siapa yang berkontribusi pada pengetahuan tertentu

### God Mode Panel
- **Command Riset**: Input text untuk perintah riset tingkat tinggi
- **Environment Control**: Ubah parameter dunia (tambah sumber daya, ubah topografi)
- **Agent Manipulation**: Pilih agen, modifikasi atribut (IQ, kepribadian, memori)
- **Event Injection**: Pilih tipe peristiwa (bencana, penemuan teknologi) dan trigger
- **Save/Load**: Hibernasi simulasi, load state sebelumnya

### Settings Screen
- **Simulation**: Skala waktu, jumlah agen awal, ukuran dunia
- **Display**: Tema (light/dark), bahasa, ukuran font
- **Audio**: Musik latar, efek suara, volume
- **Data**: Export simulasi, import state, reset semua

## Key User Flows

### Flow 1: Observasi Simulasi
1. User membuka app → Home Dashboard
2. Lihat statistik peradaban dan timeline peristiwa
3. Tap "World Map" → Visualisasi 2D
4. Zoom/pan untuk explore dunia
5. Tap agen → Agent Profile untuk detail
6. Kembali ke dashboard

### Flow 2: Memberikan Perintah Riset
1. User tap "God Mode" di home
2. Input command riset (e.g., "Research fusion energy")
3. Sistem broadcast ke semua agen
4. Monitor progress di Knowledge Base
5. Lihat hasil riset dalam beberapa jam simulasi

### Flow 3: Intervensi Dunia
1. User buka God Mode Panel
2. Pilih "Environment Control"
3. Ubah parameter (e.g., tambah sumber daya di lokasi tertentu)
4. Observe dampak pada agen behavior
5. Inject peristiwa (e.g., bencana alam)
6. Monitor respons peradaban

### Flow 4: Manage Agen Individual
1. User buka World Map
2. Tap agen untuk profile
3. Scroll ke "God Mode Actions"
4. Edit atribut (IQ, kepribadian)
5. Inject memori baru
6. Transfer aset ke agen lain
7. Lihat perubahan immediate effect

### Flow 5: Save & Resume
1. User tap "Settings" → "Save State"
2. Simulasi di-pause dan state disimpan
3. User close app
4. Buka app lagi → Prompt "Resume last simulation?"
5. Tap "Resume" → Simulasi melanjutkan dari state sebelumnya

## Color Choices

### Brand Colors
- **Primary**: Deep Blue (#0a7ea4) - Kepercayaan, intelijen, teknologi
- **Accent**: Cyan (#06b6d4) - Energi, inovasi
- **Success**: Emerald (#10b981) - Pertumbuhan, kolaborasi
- **Warning**: Amber (#f59e0b) - Konflik, perhatian
- **Error**: Rose (#f43f5e) - Kematian, kegagalan

### UI Palette
- **Background**: White (#ffffff) / Dark Gray (#151718)
- **Surface**: Light Gray (#f5f5f5) / Charcoal (#1e2022)
- **Foreground**: Dark Gray (#11181c) / Light Gray (#ecedee)
- **Muted**: Medium Gray (#687076) / Lighter Gray (#9ba1a6)
- **Border**: Light Gray (#e5e7eb) / Slate (#334155)

### Agent Personality Colors (World Map)
- **Brave** (Merah): #ef4444
- **Cautious** (Biru): #3b82f6
- **Collaborative** (Hijau): #22c55e
- **Competitive** (Oranye): #f97316
- **Genius** (Ungu): #a855f7

## Design Principles

1. **Mobile-First**: Semua screen dirancang untuk portrait 9:16, one-handed usage
2. **Clarity**: Informasi kompleks disederhanakan melalui visualisasi dan progressive disclosure
3. **Responsiveness**: Gesture intuitif (tap, swipe, pinch) untuk interaksi
4. **Feedback**: User selalu tahu status simulasi (play/pause, loading, error)
5. **Accessibility**: Teks readable, kontras cukup, haptic feedback untuk aksi penting
6. **Performance**: Simulasi berjalan smooth, tidak lag saat render banyak agen

## Technical Constraints

- **Max Agents**: 100 (untuk performa mobile)
- **Update Frequency**: 30 FPS untuk world map, 1 Hz untuk agent updates
- **Memory Usage**: Optimasi dengan memory pooling dan lazy loading
- **Network**: Opsional (local-first default, optional cloud sync)
