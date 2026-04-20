import { Camera, Plus, X, Sun, CloudRain, Thermometer, Leaf, Flower2, Search, RotateCcw } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Shirt, 
  Palette, 
  Plus, 
  Trash2, 
  CloudSun, 
  CloudRain, 
  Snowflake, 
  Leaf, 
  Sun,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BarChart2,
  Edit2,
  X,
  Upload,
  Check,
  BookHeart,
  Camera
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO,
  subDays,
  differenceInDays
} from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

import { Category, Weather, ClothingItem, Outfit, LogEntry, UserData, INITIAL_DATA } from './types';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Config ---
const STORAGE_KEY = 'style_diary_data';
const CATEGORIES: Category[] = ['Top', 'Bottom', 'Shoes', 'Outerwear', 'Accessory'];
const CATEGORY_COVERS: Record<string, string> = {
  'All': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=400', // Represents a collection/flatlay of clothes
  'Top': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400',
  'Bottom': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400', // Blue denim cover (FIXED)
  'Shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400',
  'Outerwear': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400', // Black jacket
  'Accessory': 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=400'
};
const WEATHER_COVERS: Record<string, string> = {
  'All': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=400',
  'Sunny': 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&q=80&w=400',
  'Rainy': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=400',
  'Cold': 'https://images.unsplash.com/photo-1445543949571-ffc3e0e2f55e?auto=format&fit=crop&q=80&w=400',
  'Autumn': 'https://images.unsplash.com/photo-1507371341162-763b5e419408?auto=format&fit=crop&q=80&w=400',
  'Spring': 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=400',
};
const WEATHERS: { type: Weather; icon: any; label: string }[] = [
  { type: 'Sunny', icon: Sun, label: 'Sunny' },
  { type: 'Rainy', icon: CloudRain, label: 'Rainy' },
  { type: 'Cold', icon: Snowflake, label: 'Cold' },
  { type: 'Autumn', icon: Leaf, label: 'Autumn' },
  { type: 'Spring', icon: CloudSun, label: 'Spring' },
];

// --- Mock Data Initialization (if storage empty) ---
const setupInitialWardrobe = (data: UserData): UserData => {
  if (data.items.length > 0) return data;
  return {
    ...data,
    items: [
      { id: '2', name: 'Blue Denim', category: 'Bottom', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=400', weatherTags: ['Autumn', 'Spring', 'Cold'] }
    ]
  };
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<'journal' | 'wardrobe' | 'studio' | 'stats'>('journal');
  const [showSplash, setShowSplash] = useState(true);
  
  // App initialization
  useEffect(() => {
    document.title = "Her Style Diary";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      let parsed = JSON.parse(saved);
      
      // Migration: Update picsum.photos URLs in local storage to new unsplash URLs for better realism
      const needsImageMigration = parsed.items.some((i: any) => i.imageUrl.includes('picsum.photos') || i.imageUrl.includes('1542272604-780c4050d243'));
      if (needsImageMigration) {
        parsed.items = parsed.items.map((i: any) => {
          if (i.id === '1') return { ...i, imageUrl: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=400&q=80' };
          if (i.id === '2' || i.imageUrl.includes('1542272604-780c4050d243')) return { ...i, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80' };
          if (i.id === '3') return { ...i, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80' };
          if (i.id === '4') return { ...i, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80' };
          return i;
        });
      }
      
      setData(parsed);
    } else {
      setData(setupInitialWardrobe(INITIAL_DATA));
    }
    
    // Splash screen timeout
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (data !== INITIAL_DATA) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const varietyScore = useMemo(() => {
    if (data.logs.length === 0) return 0;
    
    // 40% = unique items worn in last 14 days
    const recentLogs = data.logs.filter(log => {
      try {
        return differenceInDays(new Date(), parseISO(log.date)) <= 14;
      } catch {
        return false;
      }
    });
    const itemIds = new Set<string>();
    recentLogs.forEach(log => {
      const outfit = data.outfits.find(o => o.id === log.outfitId);
      outfit?.itemIds.forEach(id => itemIds.add(id));
    });
    const uniqueItemsScore = Math.min(100, (itemIds.size / Math.max(1, data.items.length)) * 100) * 0.4;

    // 30% = category variety
    const usedCategories = new Set<string>();
    itemIds.forEach(id => {
      const item = data.items.find(i => i.id === id);
      if (item) usedCategories.add(item.category);
    });
    const categoryScore = (usedCategories.size / CATEGORIES.length) * 100 * 0.3;

    // 30% = days without repeating (last 7 days)
    const last7Days = data.logs.filter(log => {
      try {
        return differenceInDays(new Date(), parseISO(log.date)) <= 7;
      } catch {
        return false;
      }
    });
    const uniqueOutfits = new Set(last7Days.map(l => l.outfitId));
    const repeatScore = (uniqueOutfits.size / Math.max(1, last7Days.length)) * 100 * 0.3;

    return Math.round(uniqueItemsScore + categoryScore + repeatScore);
  }, [data]);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-[#0f0c29] shadow-2xl relative pb-20 overflow-hidden font-sans text-slate-100">
      <Header data={data} setData={setData} score={varietyScore} />
      
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' && <JournalView key="journal" data={data} setData={setData} />}
          {activeTab === 'wardrobe' && <WardrobeView key="wardrobe" data={data} setData={setData} />}
          {activeTab === 'studio' && <StudioView key="studio" data={data} setData={setData} />}
          {activeTab === 'stats' && <StatsView key="stats" data={data} score={varietyScore} />}
        </AnimatePresence>
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// --- Components ---

function SplashScreen() {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center lavender-mesh"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center"
      >
        <div className="w-48 h-48 mb-6 mx-auto bg-white/60 glass-card rounded-[2.5rem] flex items-center justify-center shadow-2xl p-6 relative overflow-hidden">
          <BookHeart className="absolute w-32 h-32 text-lavender-200/50" />
          <img 
            src="input_file_0.png" 
            alt="Her Style Diary" 
            className="relative z-10 w-full h-full object-contain" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />
        </div>
        <h1 className="text-4xl font-serif font-black text-white tracking-tighter mb-2 italic drop-shadow-xl">
          Her Style Diary
        </h1>
        <p className="text-lavender-500 font-bold tracking-[0.3em] uppercase text-[10px]">
          Beauty • Grace • Identity
        </p>
      </motion.div>
      
      <motion.div 
        className="absolute bottom-12 flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce delay-100" />
        <div className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce delay-200" />
      </motion.div>
    </motion.div>
  );
}

function Header({ data, setData, score }: { data: UserData; setData: React.Dispatch<React.SetStateAction<UserData>>; score: number }) {
  return (
    <header className="px-6 py-6 flex items-center justify-between bg-lavender-50/10 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm p-1 relative overflow-hidden">
          <BookHeart className="absolute w-6 h-6 text-lavender-100" />
          <img 
            src="input_file_0.png" 
            alt="Logo" 
            className="relative z-10 w-full h-full object-contain" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />
        </div>
        <h2 className="text-lg font-serif font-bold text-white italic">Style Diary</h2>
      </div>
      
      <div className="flex bg-lavender-200/20 p-1 rounded-full items-center gap-1">
        <select 
          className="appearance-none bg-lavender-100/30 shadow-inner rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-lavender-200 cursor-pointer outline-none border-none"
          value={data.currentWeather}
          onChange={(e) => setData(prev => ({ ...prev, currentWeather: e.target.value as Weather }))}
        >
          {WEATHERS.map(w => (
            <option key={w.type} value={w.type} className="bg-[#1a1625]">{w.label}</option>
          ))}
        </select>
        <div className="hidden sm:flex items-center gap-2 bg-lavender-500/20 px-3 py-1 rounded-full border border-lavender-500/30">
           <span className="text-[8px] font-black text-lavender-400 uppercase tracking-widest leading-none">Score</span>
           <span className="text-sm font-black text-white leading-none">{score}</span>
        </div>
      </div>
    </header>
  );
}

function Navigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: any) => void }) {
  const tabs = [
    { id: 'journal', icon: CalendarIcon, label: 'Journal' },
    { id: 'wardrobe', icon: Shirt, label: 'Closet' },
    { id: 'studio', icon: Palette, label: 'Studio' },
    { id: 'stats', icon: BarChart2, label: 'Stats' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-lavender-100/20 backdrop-blur-2xl px-3 py-2 rounded-full border border-white/10 shadow-2xl z-40 flex items-center gap-1">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300",
            activeTab === tab.id ? "bg-lavender-500 text-white shadow-lg shadow-lavender-500/20" : "text-white/40 hover:text-white/70"
          )}
        >
          <tab.icon size={18} />
          {activeTab === tab.id && <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>}
        </button>
      ))}
    </nav>
  );
}

// --- Tab Views ---

function JournalView({ data, setData }: { data: UserData; setData: React.Dispatch<React.SetStateAction<UserData>>; key?: string }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showLogModal, setShowLogModal] = useState(false);
  const [repetitionAlert, setRepetitionAlert] = useState<{ date: string; outfit: string } | null>(null);
  const [showWowOverlay, setShowWowOverlay] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const scheduleStart = startOfWeek(monthStart);
  const scheduleEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: scheduleStart, end: scheduleEnd });

  const getLogForDay = (date: Date) => {
    return data.logs.find(log => log.date === format(date, 'yyyy-MM-dd'));
  };

  const handleLogOutfit = (outfitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Repetition Penalty Check (last 3 days)
    const recentLogs = data.logs.filter(log => {
      const logDate = parseISO(log.date);
      const diff = Math.abs(differenceInDays(selectedDate, logDate));
      return diff > 0 && diff <= 3 && log.outfitId === outfitId;
    });

    if (recentLogs.length > 0) {
      const outfitName = data.outfits.find(o => o.id === outfitId)?.name || 'this outfit';
      setRepetitionAlert({ date: recentLogs[0].date, outfit: outfitName });
      setTimeout(() => setRepetitionAlert(null), 3000);
    } else {
      setShowWowOverlay(true);
      setTimeout(() => setShowWowOverlay(false), 2500);
    }

    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      outfitId
    };

    setData(prev => ({
      ...prev,
      logs: [...prev.logs.filter(l => l.date !== dateStr), newLog]
    }));
    setShowLogModal(false);
  };

  const handleCreateAndLogOutfit = (newOutfitData: Omit<Outfit, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const outfit: Outfit = { id, ...newOutfitData };
    setData(prev => ({
      ...prev,
      outfits: [outfit, ...prev.outfits]
    }));
    handleLogOutfit(id);
  };

  const handleUnlogOutfit = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setData(prev => ({
      ...prev,
      logs: prev.logs.filter(l => l.date !== dateStr)
    }));
  };

  const selectedLog = getLogForDay(selectedDate);
  const selectedOutfit = selectedLog ? data.outfits.find(o => o.id === selectedLog.outfitId) : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl text-white">Journal</h3>
          <div className="flex items-center bg-white/5 rounded-full shadow-inner p-1 border border-white/5">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 text-white/30 hover:text-lavender-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-xs font-bold text-lavender-200 min-w-[100px] text-center uppercase tracking-widest">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 text-white/30 hover:text-lavender-400 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`${day}-${i}`} className="text-center text-[10px] font-black text-white/20 py-2">{day}</div>
          ))}
          {days.map((day, i) => {
            const log = getLogForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isMonth = isSameMonth(day, monthStart);
            
            return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square relative flex items-center justify-center rounded-xl text-xs font-bold transition-all",
                      !isMonth && "opacity-20",
                      isMonth && isToday && !isSelected && "text-lavender-400",
                      isMonth && !isToday && !isSelected && "text-white/60",
                      isSelected && "bg-lavender-500 text-white shadow-2xl scale-110 z-10 ring-4 ring-lavender-500/20",
                      !isSelected && log && "bg-lavender-500/10 text-lavender-300 border border-lavender-500/20",
                      !isSelected && !log && "hover:bg-white/5"
                    )}
                  >
                {format(day, 'd')}
                {log && !isSelected && (
                  <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-lavender-400" />
                )}
                {isToday && !isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-mint-500" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Preview */}
      <section className="bg-white/5 glass-card rounded-3xl p-6 shadow-2xl border border-white/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="font-serif font-bold text-white text-lg leading-tight">{format(selectedDate, 'EEEE')}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{format(selectedDate, 'do MMMM')}</p>
          </div>
          <button 
            onClick={() => setShowLogModal(true)}
            className="bg-lavender-500 text-white p-3 rounded-2xl shadow-xl shadow-lavender-500/20 hover:scale-105 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        {selectedOutfit ? (
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {selectedOutfit.itemIds.map(itemId => {
                const item = data.items.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div key={item.id} className="min-w-[80px] text-center">
                    <img src={item.imageUrl} className="w-20 h-24 object-cover rounded-xl shadow-sm mb-2" referrerPolicy="no-referrer" />
                    <p className="text-[10px] font-bold text-white/60 truncate px-1">{item.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-lavender-400 uppercase tracking-widest block mb-1">Logged Outfit</span>
                <p className="font-serif text-xl italic text-white">{selectedOutfit.name}</p>
              </div>
              <button 
                onClick={handleUnlogOutfit}
                className="p-3 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Remove log for today"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <Sparkles className="mx-auto mb-2 text-white/10" size={32} />
            <p className="text-sm text-white/20">No memories recorded yet.</p>
          </div>
        )}
      </section>

      {/* Gemini AI Trigger */}
      <AiSuggestionPanel data={data} onUseOutfit={handleLogOutfit} onCreateAndUseOutfit={handleCreateAndLogOutfit} />

      {/* Modals & Alerts */}
      <AnimatePresence>
        {showWowOverlay && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 100, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, y: 100, rotate: 10 }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
            className="fixed bottom-20 right-10 z-50 pointer-events-none"
          >
            <img src="https://media.tenor.com/h2y3jD5Gup0AAAAd/anime-wow.gif" alt="Wow" className="w-48 h-auto drop-shadow-[0_0_20px_rgba(255,105,180,0.8)]" />
          </motion.div>
        )}

        {repetitionAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              x: ['-50%', '-52%', '-48%', '-52%', '-48%', '-50%'], 
              boxShadow: [
                "0px 0px 0px rgba(244,63,94,0)", 
                "0px 0px 20px rgba(244,63,94,0.8), 0px 0px 40px rgba(236,72,153,0.6)", 
                "0px 0px 0px rgba(244,63,94,0)"
              ] 
            }}
            transition={{ duration: 0.5, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
            exit={{ opacity: 0, y: 50, x: '-50%', boxShadow: "0px 0px 0px rgba(244,63,94,0)" }}
            className="fixed bottom-24 left-1/2 z-50 bg-rose-500/20 text-rose-200 px-8 py-5 rounded-[2rem] border border-rose-500/30 flex items-center gap-4 backdrop-blur-xl"
          >
            <div className="bg-rose-500 p-2 rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.8)]">
              <AlertCircle className="shrink-0 text-white" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1 opacity-60 text-white">Repetition Penalty</p>
              <p className="text-sm font-bold tracking-tight text-rose-100">You wore <span className="italic">"{repetitionAlert.outfit}"</span> recently!</p>
            </div>
          </motion.div>
        )}

        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-sm bg-white/5 border border-white/5 rounded-[3rem] p-10 shadow-3xl relative backdrop-blur-2xl"
            >
              <button onClick={() => setShowLogModal(false)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <X size={28} />
              </button>
              <h3 className="font-serif text-3xl mb-6 italic text-lavender-400">Select Look</h3>
              
              <div className="max-h-[50vh] overflow-y-auto space-y-6 pr-2 scrollbar-none">
                <div>
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-white/50 mb-3">Studio Silhouettes</h4>
                  {data.outfits.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-3xl">
                      <p className="text-sm font-bold text-white/20 uppercase tracking-widest leading-relaxed px-6">Your studio is empty.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.outfits.map(outfit => (
                        <button
                          key={outfit.id}
                          onClick={() => handleLogOutfit(outfit.id)}
                          className="w-full text-left p-5 rounded-[2rem] bg-white/5 hover:bg-white/10 transition-all border border-white/5 group flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-white mb-0.5 tracking-tight">{outfit.name}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{outfit.itemIds.length} Pieces</p>
                          </div>
                          <div className="bg-lavender-500/10 p-2 rounded-xl group-hover:bg-lavender-500 transition-colors">
                            <ChevronRight size={16} className="text-lavender-400 group-hover:text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-black tracking-widest uppercase text-white/50 mb-3 mt-4">Or Quick Log Item</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {data.items.slice(0, 10).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleCreateAndLogOutfit({ name: `${item.name} Look`, itemIds: [item.id] })}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl p-3 flex items-center gap-3 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
                          <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] font-bold text-white truncate">{item.name}</p>
                          <p className="text-[8px] text-white/40 uppercase font-black">{item.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlidingFilter({ children, className }: { children: React.ReactNode; className?: string; speed?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDragging = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    if (!scrollRef.current) return;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const stopDragging = () => setIsMouseDown(false);

  const onDrag = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div 
        ref={scrollRef}
        onMouseDown={startDragging}
        onMouseLeave={stopDragging}
        onMouseUp={stopDragging}
        onMouseMove={onDrag}
        className={cn(
          "flex gap-3 py-2 px-4 overflow-x-auto scrollbar-none will-change-scroll overscroll-x-contain [-webkit-overflow-scrolling:touch]",
          isMouseDown ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"
        )}
      >
        {children}
      </div>
      
      {/* Edge Gradients for smooth fade */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0f0c29] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0f0c29] to-transparent pointer-events-none" />
    </div>
  );
}

function WardrobeView({ data, setData }: { data: UserData; setData: React.Dispatch<React.SetStateAction<UserData>>; key?: string }) {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [activeWeather, setActiveWeather] = useState<Weather | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ClothingItem>>({ category: 'Top', weatherTags: ['Sunny'] });
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem(n => ({ ...n, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredItems = data.items.filter(item => {
    const categoryMatch = activeCategory === 'All' || item.category === activeCategory;
    const weatherMatch = activeWeather === 'All' || item.weatherTags.includes(activeWeather);
    return categoryMatch && weatherMatch;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.imageUrl) return;

    const item: ClothingItem = {
      id: editingItem || Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      category: newItem.category as Category,
      imageUrl: newItem.imageUrl,
      weatherTags: (newItem.weatherTags as Weather[]) || ['Sunny']
    };

    if (editingItem) {
      setData(prev => ({
        ...prev,
        items: prev.items.map(i => i.id === editingItem ? item : i)
      }));
    } else {
      setData(prev => ({ ...prev, items: [item, ...prev.items] }));
    }
    
    setIsAdding(false);
    setEditingItem(null);
    setNewItem({ category: 'Top', weatherTags: ['Sunny'] });
  };

  const deleteItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
      outfits: prev.outfits.map(o => ({
        ...o,
        itemIds: o.itemIds.filter(itemId => itemId !== id)
      })).filter(o => o.itemIds.length > 0)
    }));
  };

  const startEdit = (item: ClothingItem) => {
    setNewItem(item);
    setEditingItem(item.id);
    setIsAdding(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-2xl text-white">Closet</h3>
        <button 
          onClick={() => { setIsAdding(true); setEditingItem(null); setNewItem({ category: 'Top', weatherTags: ['Sunny'] }); }}
          className="bg-lavender-500 text-white flex items-center gap-2 px-6 py-3 rounded-[1.5rem] shadow-2xl shadow-lavender-500/20 font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="space-y-4">
        <div className="px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 block">Categories</label>
          <SlidingFilter className="-mx-4">
            {['All', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as any)}
                className={cn(
                  "relative group/cat shrink-0 w-40 aspect-[4/5] rounded-[2rem] overflow-hidden transition-all duration-300 ease-out border-2 snap-center",
                  activeCategory === cat 
                    ? "border-lavender-500 scale-105 shadow-2xl shadow-lavender-500/30" 
                    : "border-white/5 hover:border-white/20 opacity-60 hover:opacity-100"
                )}
              >
                <img 
                  src={CATEGORY_COVERS[cat]} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/cat:scale-110" 
                  alt={cat}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (cat === 'All') {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1606086111818-4796342dc219?auto=format&fit=crop&q=80&w=400';
                    }
                  }}
                />
                <div className={cn(
                  "absolute inset-0 transition-colors duration-500",
                  activeCategory === cat ? "bg-lavender-500/20" : "bg-black/40 group-hover/cat:bg-black/20"
                )} />
                <div className="absolute bottom-4 left-4 right-4 z-10 text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white brightness-150 drop-shadow-lg">{cat}</p>
                </div>
              </button>
            ))}
          </SlidingFilter>
        </div>

        <div className="px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 mt-4 block">Mood & Climate</label>
          <SlidingFilter className="-mx-4 border-t border-white/5 pt-6">
            <button
              onClick={() => setActiveWeather('All')}
              className={cn(
                "relative group/weather shrink-0 w-32 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ease-out border-2 snap-center",
                activeWeather === 'All' 
                  ? "border-lavender-500 scale-105 shadow-2xl shadow-lavender-500/30" 
                  : "border-white/5 hover:border-white/20 opacity-60 hover:opacity-100"
              )}
            >
              <img 
                src={WEATHER_COVERS['All']} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/weather:scale-110" 
                alt="All Conditions"
                referrerPolicy="no-referrer"
              />
              <div className={cn(
                "absolute inset-0 transition-colors duration-500",
                activeWeather === 'All' ? "bg-lavender-500/30" : "bg-black/50 group-hover/weather:bg-black/30"
              )} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
                 <CloudSun size={18} className="text-white mb-2 drop-shadow-md opacity-70" />
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white brightness-150 drop-shadow-lg text-center leading-tight">All Conditions</p>
              </div>
            </button>
            {WEATHERS.map(w => {
              const Icon = w.icon;
              return (
                <button
                  key={w.type}
                  onClick={() => setActiveWeather(w.type as Weather)}
                  className={cn(
                    "relative group/weather shrink-0 w-32 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ease-out border-2 snap-center",
                    activeWeather === w.type 
                      ? "border-lavender-500 scale-105 shadow-2xl shadow-lavender-500/30" 
                      : "border-white/5 hover:border-white/20 opacity-60 hover:opacity-100"
                  )}
                >
                  <img 
                    src={WEATHER_COVERS[w.type]} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/weather:scale-110" 
                    alt={w.type}
                    referrerPolicy="no-referrer"
                  />
                  <div className={cn(
                    "absolute inset-0 transition-colors duration-500",
                    activeWeather === w.type ? "bg-lavender-500/30" : "bg-black/50 group-hover/weather:bg-black/30"
                  )} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 z-10">
                    <Icon size={18} className="text-white mb-2 drop-shadow-md opacity-90" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white brightness-150 drop-shadow-lg">{w.type}</p>
                  </div>
                </button>
              );
            })}
          </SlidingFilter>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              className="bg-white/5 rounded-2xl overflow-hidden shadow-2xl border border-white/5 group relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3 bg-white/5 backdrop-blur-md">
                <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex gap-1 items-center">
                    <span className="text-[8px] uppercase font-black tracking-[0.1em] text-lavender-400">{item.category}</span>
                    <div className="flex gap-0.5">
                      {item.weatherTags.slice(0, 2).map((wt, idx) => {
                        const WIcon = WEATHERS.find(w => w.type === wt)?.icon || Sun;
                        return <WIcon key={idx} size={8} className="text-white/30" />;
                      })}
                    </div>
                  </div>
                  <div className="flex gap-1.5 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button 
                      onClick={() => {
                        const outfitId = Math.random().toString(36).substr(2, 9);
                        setData(prev => {
                          const newOutfit = { id: outfitId, name: `${item.name} Look`, itemIds: [item.id] } as Outfit;
                          const newLog = { id: Math.random().toString(36).substr(2, 9), date: format(new Date(), 'yyyy-MM-dd'), outfitId };
                          return { ...prev, outfits: [newOutfit, ...prev.outfits], logs: [...prev.logs.filter(l => l.date !== newLog.date), newLog] };
                        });
                      }} 
                      className="p-1 text-white/30 hover:text-mint-400 transition-colors"
                      title="Quick Log for Today"
                    >
                      <Plus size={12} />
                    </button>
                    <button onClick={() => startEdit(item)} className="p-1 text-white/30 hover:text-lavender-500 transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => deleteItem(item.id)} className="p-1 text-white/30 hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg">
          <motion.form 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onSubmit={handleAddItem}
            className="w-full max-w-sm bg-lavender-100/10 rounded-[40px] p-8 shadow-2xl relative space-y-4 border border-white/5 backdrop-blur-2xl"
          >
            <button type="button" onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-white/20 hover:text-white-600 transition-colors">
              <X size={24} />
            </button>
            <h3 className="font-serif text-3xl mb-4 italic text-lavender-400">
              {editingItem ? 'Refine Item' : 'New Treasure'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Descriptor</label>
                <input 
                  type="text" 
                  value={newItem.name || ''} 
                  onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
                  placeholder="Vintage Silky Top"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-lavender-200 text-white placeholder:text-white/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Classification</label>
                  <select 
                    value={newItem.category} 
                    onChange={e => setNewItem(n => ({ ...n, category: e.target.value as Category }))}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:ring-2 ring-lavender-200 appearance-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">Ideal Conditions</label>
                  <div className="flex flex-wrap gap-2">
                    {WEATHERS.map(w => {
                      const isSelected = newItem.weatherTags?.includes(w.type);
                      return (
                        <button
                          key={w.type}
                          type="button"
                          onClick={() => {
                            setNewItem(n => {
                              const tags = n.weatherTags || [];
                              return {
                                ...n,
                                weatherTags: isSelected ? tags.filter(t => t !== w.type) : [...tags, w.type]
                              }
                            });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                            isSelected 
                              ? "bg-lavender-500 text-white border-lavender-500 shadow-lg shadow-lavender-500/20" 
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {w.type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 mb-2 block">Visual Identity</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <label className="flex-[2] bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-center text-white/60 hover:bg-white/10 cursor-pointer transition-colors focus-within:ring-2 ring-lavender-200">
                      <Upload size={16} className="inline mr-2" /> Gallery
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <label className="flex-1 bg-lavender-500/10 border border-lavender-500/20 text-lavender-300 rounded-2xl px-4 py-3 text-sm text-center hover:bg-lavender-500/20 cursor-pointer transition-colors focus-within:ring-2 ring-lavender-400">
                      <Camera size={16} className="inline mr-1" /> Camera
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">or link</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="text" 
                      value={newItem.imageUrl || ''} 
                      onChange={e => setNewItem(n => ({ ...n, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:ring-2 ring-lavender-200 text-white placeholder:text-white/20"
                    />
                  </div>
                  {newItem.imageUrl && (
                    <div className="mt-2 w-full h-40 rounded-2xl overflow-hidden border-2 border-lavender-500/30 relative bg-black/20">
                      <img src={newItem.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                      <button type="button" onClick={() => setNewItem(n => ({...n, imageUrl: ''}))} className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-red-500/80 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-lavender-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-lavender-500/20 hover:scale-[1.02] transition-transform mt-4"
            >
              {editingItem ? 'Store Changes' : 'Append to Closet'}
            </button>
          </motion.form>
        </div>
      )}
    </motion.div>
  );
}

function StudioView({ data, setData }: { data: UserData; setData: React.Dispatch<React.SetStateAction<UserData>>; key?: string }) {
  const [outfitName, setOutfitName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>(CATEGORIES[0]);

  const handleSaveOutfit = () => {
    if (!outfitName || selectedItemIds.length === 0) return;
    
    const newOutfit: Outfit = {
      id: Math.random().toString(36).substr(2, 9),
      name: outfitName,
      itemIds: selectedItemIds
    };

    setData(prev => ({
      ...prev,
      outfits: [newOutfit, ...prev.outfits]
    }));

    setOutfitName('');
    setSelectedItemIds([]);
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredItems = data.items.filter(i => i.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24"
    >
      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-white">Curation Studio</h3>
        
        <div className="bg-white/5 glass-card rounded-[40px] p-8 border border-white/5 shadow-2xl space-y-6">
          <input 
            type="text" 
            placeholder="Name your silhouette..."
            value={outfitName}
            onChange={e => setOutfitName(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-lavender-500 text-white placeholder:text-white/20 transition-all"
          />

          <div className="flex flex-wrap gap-2 min-h-[140px] p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-[32px] relative group overflow-hidden">
            {selectedItemIds.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center text-white/20 py-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                  <Palette size={32} className="text-lavender-400 opacity-50" />
                </div>
                <p className="text-xs font-bold italic opacity-60">Canvas Awaiting Muse...</p>
              </div>
            ) : (
              selectedItemIds.map(id => {
                const item = data.items.find(i => i.id === id);
                if (!item) return null;
                return (
                  <motion.div 
                    layoutId={id}
                    key={id} 
                    className="relative group transition-transform hover:scale-105"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <img src={item.imageUrl} className="w-20 h-24 object-cover rounded-xl shadow-xl border border-white/10" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => toggleItem(id)}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                );
              })
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-lavender-500/5 to-transparent pointer-events-none" />
          </div>

          <button 
            disabled={!outfitName || selectedItemIds.length === 0}
            onClick={handleSaveOutfit}
            className="w-full bg-lavender-500 disabled:opacity-20 disabled:grayscale text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-2xl shadow-lavender-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs"
          >
            Finalize Composition
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 block mb-2 px-1">Wardrobe Repository</label>
        <SlidingFilter className="-mx-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "relative group/cat shrink-0 w-28 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ease-out border-2 snap-center",
                activeCategory === cat 
                  ? "border-lavender-500 scale-105 shadow-xl shadow-lavender-500/20" 
                  : "border-white/5 opacity-60 hover:opacity-100"
              )}
            >
              <img 
                src={CATEGORY_COVERS[cat]} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/cat:scale-110" 
                alt={cat}
                referrerPolicy="no-referrer"
              />
              <div className={cn(
                "absolute inset-0 transition-colors",
                activeCategory === cat ? "bg-lavender-500/10" : "bg-black/40 group-hover/cat:bg-black/20"
              )} />
              <div className="absolute inset-0 flex items-center justify-center p-2">
                 <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md text-center">{cat}</p>
              </div>
            </button>
          ))}
        </SlidingFilter>

        <div className="grid grid-cols-3 gap-3">
          {filteredItems.map(item => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-300",
                  isSelected ? "border-lavender-500 ring-4 ring-lavender-500/20 scale-95" : "border-white/5 hover:border-white/20"
                )}
              >
                <img src={item.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all",
                  isSelected ? "bg-lavender-500/40 backdrop-blur-[2px]" : "bg-transparent group-hover:bg-black/20"
                )}>
                  {isSelected && <Check size={24} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="pb-12">
        <h4 className="font-serif text-xl mb-6 text-white italic">Archived Looks</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.outfits.map(outfit => (
            <div key={outfit.id} className="bg-white/5 p-6 rounded-[32px] border border-white/5 shadow-2xl group hover:border-lavender-500/30 transition-all">
              <div className="flex gap-2 mb-4 overflow-hidden rounded-2xl h-24">
                {outfit.itemIds.slice(0, 4).map(id => (
                  <img key={id} src={data.items.find(i => i.id === id)?.imageUrl} className="flex-1 object-cover hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{outfit.name}</p>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{outfit.itemIds.length} Pieces</p>
                </div>
                <button 
                  onClick={() => setData(prev => ({ ...prev, outfits: prev.outfits.filter(o => o.id !== outfit.id) }))}
                  className="bg-white/5 p-3 rounded-xl text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function AiSuggestionPanel({ data, onUseOutfit, onCreateAndUseOutfit }: { data: UserData; onUseOutfit: (id: string) => void; onCreateAndUseOutfit: (outfit: Omit<Outfit, 'id'>) => void }) {
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<{ outfitName: string; reason: string; itemIds: string[] } | null>(null);
  const [targetWeather, setTargetWeather] = useState<Weather>('Sunny');

  const handleSuggest = async () => {
    setSuggesting(true);
    setSuggestion(null);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Get last 3 days of outfits to avoid repetition
      const last3Days = data.logs
        .filter(log => differenceInDays(new Date(), parseISO(log.date)) <= 3)
        .map(log => data.outfits.find(o => o.id === log.outfitId)?.name)
        .filter(Boolean);

      const prompt = `
        As a personal stylist for a "Style Diary" app, suggest a brand new outfit for today.
        User's Wardrobe Items: ${data.items.map(i => `[ID: ${i.id}] ${i.name} (${i.category})`).join(', ')}
        Existing Named Outfits: ${data.outfits.map(o => o.name).join(', ')}
        Recent Outfits (last 3 days, DO NOT REPEAT): ${last3Days.join(', ')}
        Target Weather: ${targetWeather}

        Create a great silhouette using specifically the clothing items and accessories in their wardrobe! Provide the precise IDs of the pieces you chose.
        Return a JSON object only:
        {
          "outfitName": "A catchy, stylish name for this new look",
          "reason": "Explain why this fits the ${targetWeather} weather and why it looks great, whilst avoiding the recent outfits.",
          "itemIds": ["id1", "id2", "id3"]
        }
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      setSuggestion(result);
    } catch (err) {
      console.error(err);
      // Fallback
      if (data.outfits.length > 0) {
        setSuggestion({ 
          outfitName: data.outfits[0].name, 
          reason: "I couldn't reach the stars, but this classic look always works for " + targetWeather + " days!",
          itemIds: data.outfits[0].itemIds
        });
      }
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="bg-lavender-50 border border-black/60 rounded-[48px] p-3 shadow-2xl">
      <div className="bg-lavender-100/40 rounded-[40px] p-8 text-white relative overflow-hidden group border border-lavender-100">
        <div className="absolute top-0 right-0 w-48 h-48 bg-lavender-500/10 rounded-full -translate-y-20 translate-x-20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="bg-lavender-500/10 p-3 rounded-2xl border border-lavender-500/20">
            <Sparkles className="text-lavender-300" size={24} />
          </div>
          <div>
            <h4 className="font-serif italic text-2xl tracking-tight leading-none mb-1 text-lavender-100">
              <span className="text-white">Style Muse</span> AI
            </h4>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Celestial Curation</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!suggestion && !suggesting && (
            <motion.div 
              key="button"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="text-center relative z-10"
            >
              <p className="text-sm opacity-60 mb-6 px-6 leading-relaxed font-medium">Consult the digital oracle for a silhouette that mirrors the day's energy.</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
                {WEATHERS.map(w => (
                  <button
                    key={w.type}
                    onClick={() => setTargetWeather(w.type)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                      targetWeather === w.type 
                        ? "bg-lavender-500/20 text-lavender-300 border border-lavender-500/50" 
                        : "bg-white/5 text-white/40 border border-transparent hover:border-white/10"
                    )}
                  >
                    {w.type}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleSuggest}
                className="bg-lavender-500 hover:bg-lavender-400 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-lavender-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Consult Muse
              </button>
            </motion.div>
          )}

          {suggesting && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-8 relative z-10"
            >
              <div className="w-12 h-12 border-4 border-white/20 border-t-lavender-400 rounded-full animate-spin mb-4" />
              <p className="font-serif italic text-lg opacity-90 animate-pulse text-lavender-200">AI is thinking...</p>
            </motion.div>
          )}

          {suggestion && (
            <motion.div 
              key="suggestion"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 relative z-10"
            >
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-lavender-300 block mb-2">Recommended Look</span>
                <p className="font-serif text-3xl italic mb-4 leading-tight text-white">{suggestion.outfitName}</p>
                <div className="h-px bg-gradient-to-r from-lavender-500/50 to-transparent w-full mb-4" />
                <p className="text-sm opacity-90 leading-relaxed text-lavender-100 font-medium">"{suggestion.reason}"</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={handleSuggest}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-4 rounded-xl transition-colors border border-white/10 shadow-inner"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => {
                    const existing = data.outfits.find(o => o.name === suggestion.outfitName);
                    if (existing) {
                      onUseOutfit(existing.id);
                    } else if (suggestion.itemIds && suggestion.itemIds.length > 0) {
                      onCreateAndUseOutfit({
                        name: suggestion.outfitName,
                        itemIds: suggestion.itemIds
                      });
                    }
                    setSuggestion(null);
                  }}
                  className="flex-[2] bg-gradient-to-r from-lavender-500 to-lavender-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg border border-lavender-400/50"
                >
                  Journal This
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatsView({ data, score }: { data: UserData; key?: string; score: number }) {
  const varietyScore = score;

  const chartData = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStr = format(date, 'yyyy-MM-dd');
      const log = data.logs.find(l => l.date === dayStr);
      return {
        name: format(date, 'eee'),
        worn: log ? 1 : 0,
        fullDate: dayStr
      };
    });
    return last7;
  }, [data]);

  const getScoreColor = (score: number) => {
    if (score <= 40) return '#ef4444'; // red
    if (score <= 70) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24"
    >
      <h3 className="font-serif text-2xl text-white">Curation Analytics</h3>
      
      <section className="bg-white/5 glass-card rounded-[40px] p-10 shadow-3xl border border-white/5 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lavender-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="text-center relative">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Aesthetic Clarity Meter</p>
          <div className="relative inline-flex items-center justify-center">
             <motion.span 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="text-8xl font-serif font-black text-white tracking-tighter italic"
             >
               {varietyScore}
             </motion.span>
             <span className="text-2xl text-lavender-400 font-bold ml-2 self-start mt-4 tracking-widest">%</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${varietyScore}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-lavender-500 to-mint-400 shadow-[0_0_20px_rgba(167,139,250,0.3)]"
            />
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-white/20 px-1">
            <span>Essential Habit</span>
            <span className="text-lavender-400">Master Curation</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
          <div className="text-center p-5 rounded-[28px] bg-white/5 border border-white/5">
            <p className="text-2xl font-serif italic text-white mb-1">{data.items.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Treasures</p>
          </div>
          <div className="text-center p-5 rounded-[28px] bg-white/5 border border-white/5">
            <p className="text-2xl font-serif italic text-white mb-1">{data.outfits.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Looks</p>
          </div>
          <div className="text-center p-5 rounded-[28px] bg-white/5 border border-white/5">
            <p className="text-2xl font-serif italic text-white mb-1">{data.logs.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Logs</p>
          </div>
        </div>
      </section>

      <section className="bg-white/5 glass-card rounded-[40px] p-8 shadow-2xl border border-white/5">
        <h4 className="font-serif text-xl mb-8 flex items-center gap-3 text-white italic">
          <div className="p-2 bg-lavender-500/10 rounded-xl">
            <CalendarIcon size={18} className="text-lavender-400" />
          </div>
          Weekly Rhythm
        </h4>
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity={1} />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }} 
                dy={15}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)', radius: [10, 10, 10, 10] }}
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                        {payload[0].value === 1 ? 'Silhouette Logged' : 'Day Empty'}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="worn" radius={[12, 12, 12, 12]} barSize={28}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.worn === 1 ? 'url(#barGrad)' : 'rgba(255,255,255,0.03)'} 
                    stroke={entry.worn === 1 ? 'none' : 'rgba(255,255,255,0.05)'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </motion.div>
  );
}
