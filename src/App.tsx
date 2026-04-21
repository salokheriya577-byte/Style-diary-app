import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, Shirt } from 'lucide-react';

const IMAGES = {
  kurta: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=400",
  denim: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
  trench: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
  sneakers: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
  wowGirl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png"
};

const STARTUP_ITEMS = [
  { id: '1', name: 'Design Kurta', category: 'Top', image: IMAGES.kurta },
  { id: '2', name: 'Denim Jeans', category: 'Bottom', image: IMAGES.denim },
  { id: '3', name: 'Trench Coat', category: 'Outerwear', image: IMAGES.trench },
  { id: '4', name: 'Classic Sneakers', category: 'Shoes', image: IMAGES.sneakers }
];

export default function App() {
  const [items] = useState(STARTUP_ITEMS);
  const [showWow, setShowWow] = useState(false);

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="p-4 border-b flex items-center gap-2 bg-white sticky top-0 z-50">
        <BookOpen className="text-blue-600" />
        <h1 className="font-bold text-xl">Style Diary</h1>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6 text-center shadow-lg">
          <h2 className="font-bold mb-2">Ready to style?</h2>
          <button onClick={() => { setShowWow(true); setTimeout(() => setShowWow(false), 3000); }} 
                  className="bg-white text-blue-600 px-8 py-2 rounded-full font-bold">
            Log New Outfit
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-xl overflow-hidden shadow-sm">
              <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
              <div className="p-2 text-center text-sm font-bold uppercase">{item.name}</div>
            </div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {showWow && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                      className="fixed bottom-24 right-6 z-50 flex flex-col items-center">
            <div className="bg-white border-2 border-pink-200 px-3 py-1 rounded-lg mb-2 shadow-md">
              <span className="text-pink-500 font-bold text-xs">Wow! ✨</span>
            </div>
            <img src={IMAGES.wowGirl} className="w-24 h-24" alt="wow" />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around z-50">
        <div className="flex flex-col items-center text-blue-600"><Calendar size={24} /><span className="text-[10px] font-bold">JOURNAL</span></div>
        <div className="flex flex-col items-center text-gray-400"><Shirt size={24} /><span className="text-[10px] font-bold">CLOSET</span></div>
      </nav>
    </div>
  );
}
