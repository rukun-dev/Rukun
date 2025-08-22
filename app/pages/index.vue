<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
    <!-- Header Navigation -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <div
                class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">RT Management</h1>
              <p class="text-xs text-gray-500">Sistem Digital RT</p>
            </div>
          </div>

          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 hover:text-orange-600 transition-colors">Fitur</a>
            <a href="#benefits" class="text-gray-600 hover:text-orange-600 transition-colors">Keunggulan</a>
            <a href="#pricing" class="text-gray-600 hover:text-orange-600 transition-colors">Harga</a>
            <a href="#contact" class="text-gray-600 hover:text-orange-600 transition-colors">Kontak</a>
          </div>

          <div class="flex items-center space-x-4">
            <NuxtLink to="/login">
              <Button variant="ghost" size="sm">Masuk</Button>
            </NuxtLink>
            <NuxtLink to="/login">
              <Button size="sm"
                      class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                Demo Gratis
              </Button>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <section class="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5"></div>
      <div class="max-w-7xl mx-auto relative">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="text-center lg:text-left">
            <Badge variant="secondary" class="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-200">
              🚀 Platform Digital RT Terdepan
            </Badge>
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Modernisasi
              <span
                  class="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> Administrasi RT</span>
              Anda
            </h1>
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              Solusi komprehensif untuk mengelola data warga, keuangan, dokumen, dan komunikasi RT dengan mudah dan
              efisien. Tinggalkan cara manual, beralih ke digital!
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <NuxtLink to="/login">
                <Button size="lg"
                        class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 px-8">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Coba Demo Sekarang
                </Button>
              </NuxtLink>
              <Button variant="outline" size="lg" class="h-12 px-8 border-2">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Lihat Video Demo
              </Button>
            </div>

            <!-- Stats -->
            <div class="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">500+</div>
                <div class="text-sm text-gray-600">RT Pengguna</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">50K+</div>
                <div class="text-sm text-gray-600">Data Warga</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">99.9%</div>
                <div class="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          <div class="relative">
            <div
                class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div class="bg-white rounded-lg p-6 space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">Data Warga Terverifikasi</h3>
                    <p class="text-sm text-gray-600">1,247 warga terdaftar</p>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">Progress Pendataan</span>
                    <span class="text-sm text-orange-600 font-semibold">85%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-center">
                  <div class="bg-orange-50 rounded-lg p-3">
                    <div class="text-lg font-bold text-orange-600">324</div>
                    <div class="text-xs text-gray-600">Dokumen Diproses</div>
                  </div>
                  <div class="bg-green-50 rounded-lg p-3">
                    <div class="text-lg font-bold text-green-600">98%</div>
                    <div class="text-xs text-gray-600">Kepuasan Warga</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <Badge variant="secondary" class="mb-4">✨ Fitur Unggulan</Badge>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Semua yang Anda Butuhkan untuk Mengelola RT
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Platform lengkap dengan fitur-fitur canggih yang dirancang khusus untuk kebutuhan administrasi RT modern
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature Cards -->
          <Card
              class="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent class="p-6">
              <div
                  class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Manajemen Warga</h3>
              <p class="text-gray-600 mb-4">Database lengkap warga dengan NIK, KK, hubungan keluarga, dan profil detail
                untuk pendataan yang akurat.</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>✓ Integrasi Kartu Keluarga (KK)</li>
                <li>✓ Pencarian berdasarkan NIK</li>
                <li>✓ Import/Export data Excel</li>
              </ul>
            </CardContent>
          </Card>

          <Card
              class="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent class="p-6">
              <div
                  class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Dokumen Digital</h3>
              <p class="text-gray-600 mb-4">Otomatisasi pembuatan surat pengantar, keterangan, dan dokumen RT lainnya
                dengan template yang dapat disesuaikan.</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>✓ Template dokumen lengkap</li>
                <li>✓ Workflow persetujuan</li>
                <li>✓ Arsip dokumen otomatis</li>
              </ul>
            </CardContent>
          </Card>

          <Card
              class="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent class="p-6">
              <div
                  class="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Keuangan RT</h3>
              <p class="text-gray-600 mb-4">Kelola keuangan RT dengan tracking transaksi, anggaran tahunan, dan laporan
                keuangan yang transparan.</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>✓ Tracking iuran bulanan</li>
                <li>✓ Laporan keuangan otomatis</li>
                <li>✓ Budget planning</li>
              </ul>
            </CardContent>
          </Card>

          <Card
              class="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent class="p-6">
              <div
                  class="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Pengumuman Digital</h3>
              <p class="text-gray-600 mb-4">Sistem komunikasi modern dengan pengumuman berprioritas dan kampanye email
                untuk jangkauan yang maksimal.</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>✓ Notifikasi real-time</li>
                <li>✓ Template email campaign</li>
                <li>✓ Tracking status baca</li>
              </ul>
            </CardContent>
          </Card>

          <Card
              class="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent class="p-6">
              <div
                  class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">File Management</h3>
              <p class="text-gray-600 mb-4">Penyimpanan cloud aman dengan Cloudinary untuk dokumen, gambar, dan file
                penting RT dengan organisasi yang rapi.</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>✓ Storage cloud unlimited</li>
                <li>✓ Auto backup & restore</li>
                <li>✓ Multi-format support</li>
              </ul>
            </CardContent>
          </Card>

          <Card
              class="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent class="p-6">
              <div
                  class="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Laporan & Analitik</h3>
              <p class="text-gray-600 mb-4">Dashboard komprehensif dengan laporan real-time untuk monitoring aktivitas
                RT dan pengambilan keputusan yang tepat.</p>
              <ul class="text-sm text-gray-500 space-y-1">
                <li>✓ Dashboard real-time</li>
                <li>✓ Export PDF/Excel</li>
                <li>✓ Grafik interaktif</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section id="benefits" class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-orange-50">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <Badge variant="secondary" class="mb-4">🎯 Keunggulan Sistem</Badge>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mengapa Memilih RT Management System?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Solusi terpadu yang menghadirkan efisiensi, transparansi, dan kemudahan dalam pengelolaan RT
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div class="space-y-8">
            <div class="flex items-start space-x-4">
              <div
                  class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Hemat Waktu 80%</h3>
                <p class="text-gray-600">Otomatisasi proses administratif mengurangi waktu pembuatan dokumen dari jam
                  menjadi menit.</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                  class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Keamanan Terjamin</h3>
                <p class="text-gray-600">Sistem keamanan berlapis dengan enkripsi data dan backup otomatis untuk
                  melindungi informasi warga.</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                  class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Transparansi Penuh</h3>
                <p class="text-gray-600">Laporan keuangan real-time dan tracking aktivitas memberikan transparansi penuh
                  kepada warga.</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                  class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">Akses Mobile</h3>
                <p class="text-gray-600">Interface responsive yang dapat diakses dari smartphone, tablet, atau komputer
                  kapan saja, dimana saja.</p>
              </div>
            </div>
          </div>

          <div class="relative">
            <div
                class="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
              <div class="text-center mb-6">
                <div
                    class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Implementasi Sukses</h3>
                <p class="text-gray-600">Tingkat kepuasan 98% dari RT yang sudah menggunakan sistem ini</p>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">Setup & Training</span>
                  <span class="text-sm text-green-600 font-semibold">✓ Selesai</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">Migrasi Data</span>
                  <span class="text-sm text-green-600 font-semibold">✓ Selesai</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span class="text-sm font-medium text-gray-700">Go Live</span>
                  <span class="text-sm text-orange-600 font-semibold">🚀 Aktif</span>
                </div>
              </div>

              <div class="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-green-800">ROI 300% dalam 6 bulan</div>
                    <div class="text-xs text-green-600">Penghematan biaya operasional signifikan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <Badge variant="secondary" class="mb-4">💰 Harga Terjangkau</Badge>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pilih Paket yang Sesuai untuk RT Anda
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Mulai dari gratis untuk uji coba, hingga paket enterprise untuk RT dengan kebutuhan khusus
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Starter Plan -->
          <Card class="relative border-2 border-gray-200 hover:border-orange-300 transition-colors">
            <CardContent class="p-8 text-center">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p class="text-gray-600 mb-6">Perfect untuk RT kecil dengan kebutuhan dasar</p>
              <div class="mb-8">
                <span class="text-4xl font-bold text-gray-900">Gratis</span>
                <span class="text-gray-600">/bulan</span>
              </div>
              <ul class="space-y-3 mb-8 text-left">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Hingga 100 data warga
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  3 template dokumen
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Laporan dasar
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Email support
                </li>
              </ul>
              <NuxtLink to="/login">
                <Button variant="outline" size="lg" class="w-full">
                  Mulai Gratis
                </Button>
              </NuxtLink>
            </CardContent>
          </Card>

          <!-- Professional Plan -->
          <Card class="relative border-2 border-orange-500 hover:border-orange-600 transition-colors transform scale-105">
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Badge class="bg-orange-500 text-white">Paling Populer</Badge>
            </div>
            <CardContent class="p-8 text-center">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <p class="text-gray-600 mb-6">Ideal untuk RT dengan kebutuhan lengkap</p>
              <div class="mb-8">
                <span class="text-4xl font-bold text-orange-600">299K</span>
                <span class="text-gray-600">/bulan</span>
              </div>
              <ul class="space-y-3 mb-8 text-left">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Unlimited data warga
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Semua template dokumen
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Manajemen keuangan lengkap
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Email campaigns unlimited
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Cloud storage 10GB
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Priority support
                </li>
              </ul>
              <NuxtLink to="/login">
                <Button size="lg"
                        class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Pilih Professional
                </Button>
              </NuxtLink>
            </CardContent>
          </Card>

          <!-- Enterprise Plan -->
          <Card class="relative border-2 border-gray-200 hover:border-purple-300 transition-colors">
            <CardContent class="p-8 text-center">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p class="text-gray-600 mb-6">Untuk RT dengan kebutuhan khusus dan kustomisasi</p>
              <div class="mb-8">
                <span class="text-4xl font-bold text-purple-600">Custom</span>
                <span class="text-gray-600">/bulan</span>
              </div>
              <ul class="space-y-3 mb-8 text-left">
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Semua fitur Professional
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Kustomisasi sesuai kebutuhan
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Integrasi API khusus
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Training & implementasi
                </li>
                <li class="flex items-center">
                  <svg class="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <NuxtLink to="/login">
                <Button variant="outline" size="lg" class="w-full border-purple-500 text-purple-600 hover:bg-purple-50">
                  Hubungi Sales
                </Button>
              </NuxtLink>
            </CardContent>
          </Card>
        </div>

        <div class="text-center mt-12">
          <p class="text-gray-600 mb-4">💳 Semua paket include trial 30 hari gratis • Tidak ada biaya setup • Cancel
            kapan saja</p>
          <div class="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <span>💰 Garansi uang kembali</span>
            <span>🔒 SSL Certificate</span>
            <span>☁️ Cloud hosting</span>
            <span>📞 24/7 Support</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-orange-100">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <Badge variant="secondary" class="mb-4">💬 Testimoni</Badge>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Apa Kata Pengguna Kami?
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Dengar langsung dari para Ketua RT yang sudah merasakan manfaat sistem ini
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <Card class="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p class="text-gray-700 mb-4 italic">
                "Luar biasa! Dulu butuh 2 jam untuk buat surat pengantar, sekarang cuma 5 menit. Warga juga senang
                karena proses lebih cepat dan transparan."
              </p>
              <div class="flex items-center">
                <div
                    class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                  BS
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">Budi Santoso</div>
                  <div class="text-sm text-gray-600">Ketua RT 05, Jakarta Selatan</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p class="text-gray-700 mb-4 italic">
                "Manajemen keuangan RT jadi sangat mudah. Semua transaksi tercatat otomatis, laporan bulanan tinggal
                print. Transparansi 100%!"
              </p>
              <div class="flex items-center">
                <div
                    class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                  SW
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">Siti Wulandari</div>
                  <div class="text-sm text-gray-600">Bendahara RT 12, Bandung</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="bg-white/80 backdrop-blur border-0 shadow-lg">
            <CardContent class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
              <p class="text-gray-700 mb-4 italic">
                "Setup mudah, training lengkap, support responsive. Dalam sebulan sudah bisa operasional penuh. ROI
                sangat terasa!"
              </p>
              <div class="flex items-center">
                <div
                    class="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                  AR
                </div>
                <div class="ml-3">
                  <div class="font-semibold text-gray-900">Ahmad Rizki</div>
                  <div class="text-sm text-gray-600">Ketua RT 08, Surabaya</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Siap Modernisasi RT Anda?
        </h2>
        <p class="text-xl text-orange-100 mb-8">
          Bergabung dengan 500+ RT yang sudah merasakan kemudahan sistem digital.
          Mulai gratis hari ini dan rasakan perbedaannya!
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <NuxtLink to="/login">
            <Button size="lg" class="bg-white text-orange-600 hover:bg-gray-100 h-12 px-8">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Mulai Trial Gratis 30 Hari
            </Button>
          </NuxtLink>
          <NuxtLink to="/login">
            <Button variant="outline" size="lg"
                    class="border-white text-white bg-orange-600 hover:bg-white hover:text-orange-600 h-12 px-8">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Konsultasi Gratis
            </Button>
          </NuxtLink>
        </div>

        <div class="flex flex-wrap justify-center items-center gap-8 mt-12 text-orange-100">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Setup dalam 24 jam</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Training lengkap included</span>
          </div>
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Support 24/7</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-4 gap-8">
          <div class="lg:col-span-2">
            <div class="flex items-center space-x-2 mb-4">
              <div
                  class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold">RT Management System</h3>
                <p class="text-gray-400 text-sm">Sistem Digital RT Indonesia</p>
              </div>
            </div>
            <p class="text-gray-400 mb-6 max-w-md">
              Solusi terdepan untuk modernisasi administrasi RT di seluruh Indonesia.
              Bergabung dengan revolusi digital RT untuk pelayanan yang lebih baik.
            </p>
            <div class="flex space-x-4">
              <a href="#"
                 class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                      d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#"
                 class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                      d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#"
                 class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                      d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-4">Produk</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Fitur Lengkap</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Harga & Paket</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Demo Online</a></li>
              <li><a href="#" class="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h4 class="text-lg font-semibold mb-4">Dukungan</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Tutorial Video</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Training Online</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Konsultasi Gratis</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Hubungi Support</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-12 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 RT Management System. All rights reserved. Made with ❤️ for Indonesian RT Community.
            </div>
            <div class="flex space-x-6 text-sm text-gray-400">
              <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" class="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <Button size="lg"
              class="rounded-full w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-2xl">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {Card, CardContent} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'

// Types for better type safety
interface MetaTag {
  name?: string
  property?: string
  content: string
}

interface HeadConfig {
  title: string
  meta: MetaTag[]
}

// Statistics data with types
interface Statistic {
  value: string
  label: string
  color: string
}

const statistics: Statistic[] = [
  {value: '500+', label: 'RT Pengguna', color: 'text-orange-600'},
      {value: '50K+', label: 'Data Warga', color: 'text-orange-600'},
  {value: '99.9%', label: 'Uptime', color: 'text-purple-600'}
]

// Features data with types
interface Feature {
  icon: string
  title: string
  description: string
  benefits: string[]
  gradient: string
  iconBg: string
}

const features: Feature[] = [
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'Manajemen Warga',
    description: 'Database lengkap warga dengan NIK, KK, hubungan keluarga, dan profil detail untuk pendataan yang akurat.',
    benefits: ['✓ Integrasi Kartu Keluarga (KK)', '✓ Pencarian berdasarkan NIK', '✓ Import/Export data Excel'],
    gradient: 'from-orange-50 to-orange-100',
        iconBg: 'from-orange-500 to-orange-600'
  },
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Dokumen Digital',
    description: 'Otomatisasi pembuatan surat pengantar, keterangan, dan dokumen RT lainnya dengan template yang dapat disesuaikan.',
    benefits: ['✓ Template dokumen lengkap', '✓ Workflow persetujuan', '✓ Arsip dokumen otomatis'],
    gradient: 'from-green-50 to-emerald-50',
    iconBg: 'from-green-500 to-emerald-500'
  },
  // Add more features as needed...
]

// Pricing plans with types
interface PricingPlan {
  name: string
  description: string
  price: string
  period: string
  features: string[]
  popular?: boolean
  buttonText: string
  buttonVariant: 'default' | 'outline'
  priceColor: string
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect untuk RT kecil dengan kebutuhan dasar',
    price: 'Gratis',
    period: '/bulan',
    features: [
      'Hingga 100 data warga',
      '3 template dokumen',
      'Laporan dasar',
      'Email support'
    ],
    buttonText: 'Mulai Gratis',
    buttonVariant: 'outline',
    priceColor: 'text-gray-900'
  },
  {
    name: 'Professional',
    description: 'Ideal untuk RT dengan kebutuhan lengkap',
    price: '299K',
    period: '/bulan',
    features: [
      'Unlimited data warga',
      'Semua template dokumen',
      'Manajemen keuangan lengkap',
      'Email campaigns unlimited',
      'Cloud storage 10GB',
      'Priority support'
    ],
    popular: true,
    buttonText: 'Pilih Professional',
    buttonVariant: 'default',
    priceColor: 'text-orange-600'
  },
  {
    name: 'Enterprise',
    description: 'Untuk RT dengan kebutuhan khusus dan kustomisasi',
    price: 'Custom',
    period: '/bulan',
    features: [
      'Semua fitur Professional',
      'Kustomisasi sesuai kebutuhan',
      'Integrasi API khusus',
      'Training & implementasi',
      'Dedicated support'
    ],
    buttonText: 'Hubungi Sales',
    buttonVariant: 'outline',
    priceColor: 'text-purple-600'
  }
]

// Testimonials with types
interface Testimonial {
  name: string
  position: string
  location: string
  avatar: string
  rating: number
  comment: string
  avatarBg: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Budi Santoso',
    position: 'Ketua RT 05',
    location: 'Jakarta Selatan',
    avatar: 'BS',
    rating: 5,
    comment: 'Luar biasa! Dulu butuh 2 jam untuk buat surat pengantar, sekarang cuma 5 menit. Warga juga senang karena proses lebih cepat dan transparan.',
    avatarBg: 'from-orange-500 to-orange-600'
  },
  {
    name: 'Siti Wulandari',
    position: 'Bendahara RT 12',
    location: 'Bandung',
    avatar: 'SW',
    rating: 5,
    comment: 'Manajemen keuangan RT jadi sangat mudah. Semua transaksi tercatat otomatis, laporan bulanan tinggal print. Transparansi 100%!',
    avatarBg: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Ahmad Rizki',
    position: 'Ketua RT 08',
    location: 'Surabaya',
    avatar: 'AR',
    rating: 5,
    comment: 'Setup mudah, training lengkap, support responsive. Dalam sebulan sudah bisa operasional penuh. ROI sangat terasa!',
    avatarBg: 'from-purple-500 to-violet-500'
  }
]

// Navigation items with types
interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  {href: '#features', label: 'Fitur'},
  {href: '#benefits', label: 'Keunggulan'},
  {href: '#pricing', label: 'Harga'},
  {href: '#contact', label: 'Kontak'}
]

// Meta tags for SEO
const headConfig: HeadConfig = {
  title: 'RT Management System - Solusi Digital untuk Administrasi RT Indonesia',
  meta: [
    {
      name: 'description',
      content: 'Platform komprehensif untuk mengelola data warga, keuangan, dokumen, dan komunikasi RT dengan mudah dan efisien. Modernisasi administrasi RT Anda sekarang!'
    },
    {
      name: 'keywords',
      content: 'RT, Rukun Tetangga, administrasi RT, sistem digital RT, manajemen warga, keuangan RT, dokumen RT, Indonesia'
    },
    {property: 'og:title', content: 'RT Management System - Modernisasi Administrasi RT Indonesia'},
    {
      property: 'og:description',
      content: 'Solusi terdepan untuk digitalisasi administrasi RT. Kelola data warga, keuangan, dan dokumen dengan mudah.'
    },
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'}
  ]
}

useHead(headConfig)

// Smooth scrolling handler with proper typing
const handleSmoothScroll = (event: Event): void => {
  event.preventDefault()
  const target = event.target as HTMLAnchorElement
  const targetId = target.getAttribute('href')

  if (targetId) {
    const targetElement = document.querySelector(targetId) as HTMLElement
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
}

// Setup smooth scrolling for navigation links
onMounted((): void => {
  const links = document.querySelectorAll('a[href^="#"]') as NodeListOf<HTMLAnchorElement>
  links.forEach((link: HTMLAnchorElement) => {
    link.addEventListener('click', handleSmoothScroll)
  })
})

// Cleanup event listeners
onUnmounted((): void => {
  const links = document.querySelectorAll('a[href^="#"]') as NodeListOf<HTMLAnchorElement>
  links.forEach((link: HTMLAnchorElement) => {
    link.removeEventListener('click', handleSmoothScroll)
  })
})

// Reactive data for dynamic content
const isMenuOpen = ref<boolean>(false)
const currentYear = new Date().getFullYear()

// Methods for user interactions
const openDemo = (): void => {
  // Navigate to demo page or open modal
  console.log('Opening demo...')
}

const openConsultation = (): void => {
  // Open WhatsApp or contact form
  console.log('Opening consultation...')
}

const selectPlan = (planName: string): void => {
  // Handle plan selection
  console.log(`Selected plan: ${planName}`)
}
</script>