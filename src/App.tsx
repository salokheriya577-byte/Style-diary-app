import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Shirt } from 'lucide-react';

// Using direct links to ensure GitHub can find them
const IMAGES = {
  kurta: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=400",
  denim: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
  trench: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
  sneakers: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
  wowGirl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png"
};

const STARTUP = [
  { id: '1', name: 'Design Kurta', category: 'Top', img: IMAGES.kurta },
  { id: '2', name: 'Denim Jeans', category: 'Bottom', img: IMAGES.denim },
  { id: '3', name: 'Trench Coat', category: 'Outerwear', img: IMAGES.trench },
  { id: '4', name: 'Classic Sneakers', category: 'Shoes', img: IMAGES.sneakers }
];

export default function App() {
  const [showWow, setShowWow] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b p-4 sticky top-0 z-50 flex items-center gap-2 shadow-sm">
        <BookOpen className="text-indigo-600" />
        <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Style Diary</h1>
      </header>

      <main className="p-4 max-w-md mx-auto pb-24">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white mb-8 text-center shadow-xl">
          <h2 className="text-lg font-bold mb-3">Ready to style?</h2>
          <button 
            onClick={() => { setShowWow(true); setTimeout(() => setShowWow(false), 3000); }}
            className="bg-white text-indigo-600 px-10 py-3 rounded-full font-extrabold hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            LOG NEW OUTFIT
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {STARTUP.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
              <img src={item.img} alt={item.name} className="w-full h-36 object-cover" />
              <div className="p-3 text-center">
                <p className="font-bold text-slate-800 text-sm truncate uppercase">{item.name}</p>
                <p className="text-[10px] text-indigo-500 font-black tracking-widest mt-1">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showWow && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 100 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.5, y: 50 }} 
            className="fixed bottom-24 right-6 z-50 flex flex-col items-center pointer-events-none"
          >
            <div className="bg-white border-2 border-pink-200 px-4 py-2 rounded-2xl mb-2 shadow-2xl">
              <span className="text-pink-500 font-black text-xs whitespace-nowrap">OMG PERFECT! ✨</span>
            </div>
            <img src={IMAGES.wowGirl} className="w-28 h-28 drop-shadow-2xl" alt="wow" />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center text-indigo-600">
          <Calendar size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-black mt-1">JOURNAL</span>
        </div>
        <div className="flex flex-col items-center text-slate-300">
          <Shirt size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-black mt-1">CLOSET</span>
        </div>
      </nav>
    </div>
  );
}
