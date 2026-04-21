import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Shirt } from 'lucide-react';

const IMAGES = {
  kurta: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=400",
  denim: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
  trench: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
  sneakers: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
  wowGirl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png"
};

const ITEMS = [
  { id: '1', name: 'Design Kurta', category: 'Top', image: IMAGES.kurta },
  { id: '2', name: 'Denim Jeans', category: 'Bottom', image: IMAGES.denim },
  { id: '3', name: 'Trench Coat', category: 'Outerwear', image: IMAGES.trench },
  { id: '4', name: 'Classic Sneakers', category: 'Shoes', image: IMAGES.sneakers }
];

export default function App() {
  const [showWow, setShowWow] = useState(false);
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white border-b p-4 sticky top-0 flex items-center gap-2">
          <BookOpen className="text-indigo-600" /> <h1 className="text-xl font-bold">Style Diary</h1>
        </header>
        <main className="p-4 max-w-md mx-auto">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-6 text-center shadow-lg">
            <h2 className="font-bold text-lg mb-2">Ready to style?</h2>
            <button onClick={() => { setShowWow(true); setTimeout(() => setShowWow(false), 3000); }} 
                    className="bg-white text-indigo-600 px-8 py-2 rounded-full font-bold">Log Outfit</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ITEMS.map(item => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border">
                <img src={item.image} className="w-full h-32 object-cover" alt={item.name} />
                <div className="p-2 text-center text-xs font-bold uppercase">{item.name}</div>
              </div>
            ))}
          </div>
        </main>
        <AnimatePresence>
          {showWow && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                        className="fixed bottom-24 right-6 z-50 flex flex-col items-center">
              <div className="bg-white border-2 border-pink-200 px-3 py-1 rounded-lg mb-2 shadow-md font-bold text-pink-500">Wow! ✨</div>
              <img src={IMAGES.wowGirl} className="w-24 h-24" alt="wow" />
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around">
          <div className="flex flex-col items-center text-indigo-600"><Calendar size={24} /><span className="text-[10px] font-bold">JOURNAL</span></div>
          <div className="flex flex-col items-center text-slate-300"><Shirt size={24} /><span className="text-[10px] font-bold">CLOSET</span></div>
        </nav>
      </div>
    </HashRouter>
  );
}
