import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Shirt, BookOpen } from 'lucide-react';

// --- STABLE IMAGE DATABASE ---
const STABLE_IMAGES = {
  kurta: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400",
  denim: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400",
  trench: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400",
  sneakers: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400",
  wowGirl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png"
};

const INITIAL_CLOSET = [
  { id: '1', name: 'Design Kurta', category: 'Top', image: STABLE_IMAGES.kurta },
  { id: '2', name: 'Denim Jeans', category: 'Bottom', image: STABLE_IMAGES.denim },
  { id: '3', name: 'Trench Coat', category: 'Outerwear', image: STABLE_IMAGES.trench },
  { id: '4', name: 'Classic Sneakers', category: 'Shoes', image: STABLE_IMAGES.sneakers }
];

const AnimeWow = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.5 }}
        className="fixed bottom-6 right-6 z-[999] flex flex-col items-center pointer-events-none"
      >
        <div className="bg-white px-4 py-2 rounded-2xl shadow-xl mb-2 border-2 border-pink-300">
          <span className="text-pink-600 font-extrabold text-sm whitespace-nowrap">Perfect Style! ✨</span>
        </div>
        <img src={STABLE_IMAGES.wowGirl} alt="Wow" className="w-32 h-32 object-contain drop-shadow-2xl" />
      </motion.div>
    )}
  </AnimatePresence>
);

export default function App() {
  const [items] = useState(INITIAL_CLOSET);
  const [showWow, setShowWow] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  const triggerWow = () => {
    setShowWow(true);
    setTimeout(() => setShowWow(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b p-4 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="text-indigo-600" /> Style Diary
        </h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-6">
          <h2 className="text-xl font-bold mb-2">Ready to style?</h2>
          <button 
            onClick={triggerWow}
            className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition-colors"
          >
            Log New Outfit
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
              <div className="p-3">
                <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                <p className="text-xs text-slate-500">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('journal')} className={`flex flex-col items-center ${activeTab === 'journal' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Calendar size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Journal</span>
        </button>
        <button onClick={() => setActiveTab('closet')} className={`flex flex-col items-center ${activeTab === 'closet' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Shirt size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Closet</span>
        </button>
      </nav>

      <AnimeWow show={showWow} />
    </div>
  );
}
