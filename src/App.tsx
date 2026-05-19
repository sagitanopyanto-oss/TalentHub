case 'dashboard':
                return (
                  // KONTEN UTAMA DASHBOARD: Menyusun seluruh grafik, SLA, dan tabel kandidat agar tampil utuh ke bawah
                  <div className="w-full space-y-8 block text-left clear-both animation-fade-in animate-duration-200">
                    
                    {/* 1. KARTU STATISTIK UTAMA (Pelamar, Loker Aktif, Wawancara, dll) */}
                    <StatsCards key={`stats-${candidates?.length || 0}-${jobs?.length || 0}-${interviews?.length || 0}`} />
                    
                    {/* 2. AREA GRAFIK VISUAL REKRUTMEN (Pipeline, Tren Aplikasi, Departemen, & Cost Hiring) */}
                    {/* Pastikan komponen ChartsSection atau sejenisnya sudah di-import di bagian atas file App.tsx */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Grafik Tren Aplikasi & Pipeline Rekrutmen */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">📈 Tren Aplikasi & Progres Rekrutmen</h4>
                        {/* Panggil komponen grafik Tren di sini, contoh: <TrendApplicationsChart /> */}
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">Visualisasi Grafik Tren Aplikasi</div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">📊 Pipeline Tahapan Seleksi Kandidat</h4>
                        {/* Panggil komponen grafik Pipeline di sini, contoh: <PipelineChart /> */}
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">Visualisasi Grafik Pipeline Rekrutmen</div>
                      </div>

                      {/* Grafik Distribusi per Departemen & Cost Hiring */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">🏢 Distribusi Rekrutmen per Departemen</h4>
                        {/* Panggil komponen grafik Departemen di sini, contoh: <DepartmentChart /> */}
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">Visualisasi Grafik Rekrutmen per Departemen</div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">💰 Analisis Efisiensi Biaya Rekrutmen (Cost Hiring)</h4>
                        {/* Panggil komponen grafik Cost Hiring di sini, contoh: <CostHiringChart /> */}
                        <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium border border-dashed border-slate-200">Visualisasi Grafik Cost Hiring</div>
                      </div>
                    </div>

                    {/* 3. PANEL ANALITIK SLA & TIME TO HIRE */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-base">⏱️ Pemantauan SLA & Rata-rata Time to Hire</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Metrik kepatuhan waktu proses seleksi kandidat berdasarkan target sistem.</p>
                      </div>
                      
                      {/* Ringkasan SLA Ring */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">SLA Compliance Rate</span>
                          <span className="block text-2xl font-black text-indigo-600 mt-1">94.2%</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Rata-rata Time to Hire</span>
                          <span className="block text-2xl font-black text-purple-600 mt-1">12 Hari</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kasus SLA</span>
                          <span className="block text-2xl font-black text-slate-700 mt-1">{candidates?.length || 0} Kasus</span>
                        </div>
                      </div>

                      {/* Detail SLA per Tahapan Seleksi */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detail Pemenuhan SLA per Proses:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-600">1. Tahap Screening Administrasi (Target: 2 Hari)</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">98% Aman</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-600">2. Tahap Wawancara HR & User (Target: 5 Hari)</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">92% Aman</span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-600">3. Tahap Medical Check-Up / MCU (Target: 3 Hari)</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">85% Perlu Tinjauan</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. TABEL KANDIDAT TERBARU (5 Pelamar Terakhir yang Masuk Sistem) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">👤 Kandidat Terbaru</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Daftar 5 kandidat pelamar yang baru saja masuk ke dalam sistem TalentHub.</p>
                        </div>
                        <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full border border-slate-200">Real-time</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                          <thead className="text-xs text-slate-500 bg-slate-50 uppercase tracking-wider border-b border-slate-100">
                            <tr>
                              <th className="px-6 py-3 font-bold">Nama Kandidat</th>
                              <th className="px-6 py-3 font-bold">Posisi Dilamar</th>
                              <th className="px-6 py-3 font-bold">Departemen</th>
                              <th className="px-6 py-3 font-bold">Tanggal Daftar</th>
                              <th className="px-6 py-3 font-bold">Status Seleksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {/* Menampilkan 5 data kandidat teratas/terbaru */}
                            {(candidates || []).slice(0, 5).map((candidate: any) => (
                              <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{candidate.name}</td>
                                <td className="px-6 py-4">{candidate.appliedPosition || 'Software Engineer'}</td>
                                <td className="px-6 py-4 text-slate-500">{candidate.department || 'Technology'}</td>
                                <td className="px-6 py-4 text-xs text-slate-400">{candidate.dateApplied || 'Hari ini'}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                                    {candidate.status || 'Screening'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {(!candidates || candidates.length === 0) && (
                              <tr>
                                <td colSpan={5} className="text-center p-8 text-slate-400 font-medium bg-slate-50/20">
                                  Belum ada data kandidat pelamar terbaru yang masuk ke dalam sistem.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                );
