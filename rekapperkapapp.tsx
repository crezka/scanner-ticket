import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Package, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ClipboardList,
  AlertCircle,
  Moon,
  Sun,
  User,
  Download
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function RekapPerkapApp() {
  // State Management
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  // Theme & Navigation State
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'profile'

  // Form States
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [itemErrorMsg, setItemErrorMsg] = useState('');

  // Profile State
  const [profile, setProfile] = useState({
    name: 'Admin Event',
    organization: 'Organisasi Pemuda',
    email: 'admin@event.com'
  });

  // Load from Local Storage on mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('rekapPerkapEvents');
    const savedTheme = localStorage.getItem('rekapPerkapTheme');
    const savedProfile = localStorage.getItem('rekapPerkapProfile');
    
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch (e) {}
    }
    if (savedTheme) setTheme(savedTheme);
    if (savedProfile) {
      try { setProfile(JSON.parse(savedProfile)); } catch (e) {}
    }
  }, []);

  // Save to Local Storage on change
  useEffect(() => {
    localStorage.setItem('rekapPerkapEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('rekapPerkapProfile', JSON.stringify(profile));
  }, [profile]);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rekapPerkapTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Event Handlers
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventName.trim()) {
      setErrorMsg('Nama event tidak boleh kosong!');
      return;
    }
    
    const newEvent = {
      id: generateId(),
      name: newEventName,
      date: newEventDate || new Date().toISOString().split('T')[0],
      items: []
    };

    setEvents([...events, newEvent]);
    setNewEventName('');
    setNewEventDate('');
    setErrorMsg('');
  };

  const handleDeleteEvent = (id, e) => {
    e.stopPropagation();
    setEvents(events.filter(ev => ev.id !== id));
    if (selectedEventId === id) setSelectedEventId(null);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemQty) {
      setItemErrorMsg('Nama barang dan jumlah harus diisi!');
      return;
    }

    const newItem = {
      id: generateId(),
      name: newItemName,
      quantity: newItemQty,
      notes: newItemNotes,
      status: 'Belum'
    };

    setEvents(events.map(ev => {
      if (ev.id === selectedEventId) {
        return { ...ev, items: [...ev.items, newItem] };
      }
      return ev;
    }));

    setNewItemName('');
    setNewItemQty('');
    setNewItemNotes('');
    setItemErrorMsg('');
  };

  const handleToggleItemStatus = (eventId, itemId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) {
        const updatedItems = ev.items.map(item => {
          if (item.id === itemId) return { ...item, status: item.status === 'Belum' ? 'Sudah' : 'Belum' };
          return item;
        });
        return { ...ev, items: updatedItems };
      }
      return ev;
    }));
  };

  const handleDeleteItem = (eventId, itemId) => {
    setEvents(events.map(ev => {
      if (ev.id === eventId) return { ...ev, items: ev.items.filter(item => item.id !== itemId) };
      return ev;
    }));
  };

  // Export to CSV for Excel/Google Sheets
  const exportToCSV = (eventData) => {
    const headers = ['Status', 'Nama Barang', 'Jumlah/Satuan', 'Keterangan'];
    const rows = eventData.items.map(item => [
      item.status,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.quantity.replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_${eventData.name.replace(/\s+/g, '_')}_${eventData.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Profile Form Handler
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const selectedEvent = events.find(ev => ev.id === selectedEventId);

  // NAVIGATION BAR
  const Navigation = () => (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm transition-colors">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white hidden sm:block">PerkapKu</span>
        </div>
        
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={() => { setActiveTab('events'); setSelectedEventId(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'events' && !selectedEventId ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Inventaris</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Profil</span>
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
            title="Ubah Tema"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <Navigation />

      <main className="p-4 md:p-8">
        
        {/* VIEW: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto mt-4">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Profil Pengguna</h1>
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold dark:text-white">{profile.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{profile.organization}</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" name="name" value={profile.name} onChange={handleProfileChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Organisasi / Kepanitiaan</label>
                  <input 
                    type="text" name="organization" value={profile.organization} onChange={handleProfileChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input 
                    type="email" name="email" value={profile.email} onChange={handleProfileChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-6 flex gap-1 items-center">
                <AlertCircle className="w-3 h-3" /> Data profil disimpan secara lokal di perangkat Anda.
              </p>
            </div>
          </div>
        )}

        {/* VIEW: EVENT LIST */}
        {activeTab === 'events' && !selectedEventId && (
          <div className="max-w-5xl mx-auto space-y-8 mt-4">
            <header className="mb-6">
              <h1 className="text-3xl font-bold dark:text-white">Daftar Event</h1>
              <p className="text-slate-500 dark:text-slate-400">Kelola kebutuhan inventaris semua event Anda.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Tambah Event */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white">
                  <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Buat Event Baru
                </h2>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Event</label>
                    <input 
                      type="text" value={newEventName} onChange={(e) => setNewEventName(e.target.value)}
                      placeholder="Misal: Makrab 2026"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tanggal Event</label>
                    <input 
                      type="date" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  {errorMsg && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </div>
                  )}
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
                    Simpan Event
                  </button>
                </form>
              </div>

              {/* List Event */}
              <div className="lg:col-span-2 space-y-4">
                {events.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada event yang dibuat.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {events.map(event => (
                      <div 
                        key={event.id} onClick={() => setSelectedEventId(event.id)}
                        className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform"></div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">{event.name}</h3>
                          <button 
                            onClick={(e) => handleDeleteEvent(event.id, e)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                          <Calendar className="w-4 h-4" /> {event.date}
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span>Progres Kesiapan</span>
                            <span>{event.items.length > 0 ? Math.round((event.items.filter(i => i.status === 'Sudah').length / event.items.length) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${event.items.length > 0 ? (event.items.filter(i => i.status === 'Sudah').length / event.items.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: EVENT DETAIL (ITEMS) */}
        {activeTab === 'events' && selectedEventId && (
          <div className="max-w-5xl mx-auto space-y-6 mt-4">
            <button 
              onClick={() => setSelectedEventId(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Kembali
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedEvent.name}</h1>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Calendar className="w-5 h-5" /> {selectedEvent.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportToCSV(selectedEvent)}
                  className="bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 px-4 py-2.5 rounded-lg font-semibold border border-green-200 dark:border-green-800 flex items-center gap-2 transition-colors"
                  title="Download sebagai file Excel/CSV"
                >
                  <Download className="w-5 h-5" /> Export Data
                </button>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2.5 rounded-lg font-semibold border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                  <Package className="w-5 h-5" /> Total: {selectedEvent.items.length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Tambah Barang */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Tambah Barang</h2>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Barang</label>
                    <input 
                      type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Misal: Tenda, Sound System"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jumlah / Satuan</label>
                    <input 
                      type="text" value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)}
                      placeholder="Misal: 5 Buah, 1 Set"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Keterangan (Opsional)</label>
                    <textarea 
                      value={newItemNotes} onChange={(e) => setNewItemNotes(e.target.value)}
                      placeholder="Catatan tambahan..." rows="3"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>
                  {itemErrorMsg && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" /> {itemErrorMsg}
                    </div>
                  )}
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm">
                    Masukkan ke List
                  </button>
                </form>
              </div>

              {/* List Barang */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-white">List Kebutuhan Perkap</h2>
                </div>
                
                {selectedEvent.items.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada barang yang ditambahkan.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm uppercase tracking-wider">
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Nama Barang</th>
                          <th className="p-4 font-medium">Jumlah</th>
                          <th className="p-4 font-medium">Keterangan</th>
                          <th className="p-4 font-medium text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {selectedEvent.items.map(item => (
                          <tr 
                            key={item.id} 
                            className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${item.status === 'Sudah' ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                          >
                            <td className="p-4 w-24">
                              <button 
                                onClick={() => handleToggleItemStatus(selectedEvent.id, item.id)}
                                className="flex items-center gap-2 text-sm font-medium transition-colors"
                              >
                                {item.status === 'Sudah' ? (
                                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 className="w-4 h-4" /> Sudah
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                                    <Circle className="w-4 h-4" /> Belum
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="p-4">
                              <p className={`font-semibold ${item.status === 'Sudah' ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                {item.name}
                              </p>
                            </td>
                            <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.quantity}</td>
                            <td className="p-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs truncate" title={item.notes}>
                              {item.notes || '-'}
                            </td>
                            <td className="p-4 text-center w-20">
                              <button 
                                onClick={() => handleDeleteItem(selectedEvent.id, item.id)}
                                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}