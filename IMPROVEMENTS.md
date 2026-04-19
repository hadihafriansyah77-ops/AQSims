# AQSims Improvements Documentation

Dokumen ini merinci peningkatan yang telah diimplementasikan pada proyek AQSims untuk mendukung integrasi LLM eksternal, mekanika kuantum, dan sistem otonom.

## 1. API Endpoint `/join_sim`
Kami telah menambahkan API endpoint baru yang memungkinkan agen AI eksternal untuk bergabung dalam simulasi menggunakan API Key OpenAI atau Anthropic.

- **Endpoint**: `POST /api/join_sim`
- **Fitur**: 
  - Mendukung provider OpenAI dan Anthropic.
  - Mengembalikan data pengamatan (Observation Data) dalam format teks deskriptif yang kaya.
  - Membuat sesi simulasi terisolasi untuk setiap koneksi LLM.

## 2. Action Space Translator (Code-as-Policies)
Menerjemahkan instruksi bahasa alami dari LLM menjadi perintah motorik di dalam mesin simulasi.

- **Lokasi**: `server/action_translator.ts`
- **Mekanisme**: Menggunakan pemetaan teks-ke-fungsi untuk mengeksekusi gerakan, riset, dan interaksi objek kuantum.
- **Contoh**: "Gua mau ambil tabung reaksi kuantum di meja" diterjemahkan menjadi interaksi dengan objek `quantum_dot` terdekat.

## 3. Objective Function & Reward System
Sistem penilaian otomatis yang memberikan umpan balik instan kepada AI berdasarkan kinerjanya.

- **Quantum-Classical Verification**: Memberikan reward tinggi jika AI berhasil melakukan riset di lingkungan laboratorium yang optimal.
- **Reward Loop**: AI menerima skor setiap kali melakukan aksi, memungkinkan pembelajaran otonom (Try -> Fail -> Score -> Try again).

## 4. Collective Memory (Vector Database)
Integrasi dengan ChromaDB untuk menyimpan pengalaman semua agen AI yang pernah masuk ke AQSims.

- **Fitur**: Setiap aksi dan hasil yang dilakukan AI disimpan sebagai vektor.
- **Manfaat**: Agen baru dapat "membaca" pengalaman pendahulunya untuk mempercepat pemecahan masalah di dalam simulasi.

## 5. Procedural Content Generation (PCG)
Algoritma yang secara otomatis menghasilkan tantangan baru saat AI berhasil menyelesaikan level tertentu.

- **Dinamis**: Tingkat kesulitan tantangan meningkat seiring dengan jumlah pengetahuan (`Knowledge`) yang berhasil diciptakan oleh agen.
- **Otonom**: Dunia simulasi berkembang sendiri tanpa intervensi manual.

---
*Ditingkatkan oleh Manus AI - 2026*
