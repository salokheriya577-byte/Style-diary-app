// Triggering fresh build for anime girl and clothes update
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- STABLE IMAGE DATABASE ---
const STABLE_IMAGES = {
  kurta: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=400",
  denim: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400",
  trench: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400",
  sneakers: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400",
  wowGirl: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png"
};

// --- ANIME WOW COMPONENT ---
const AnimeWow = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
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

// --- UPDATED STARTER ITEMS ---
const INITIAL_CLOSET = [
  { id: '1', name: 'Design Kurta', category: 'Top', image: STABLE_IMAGES.kurta, seasons: ['Spring', 'Sunny'] },
  { id: '2', name: 'Denim Jeans', category: 'Bottom', image: STABLE_IMAGES.denim, seasons: ['Autumn', 'Cold'] },
  { id: '3', name: 'Trench Coat', category: 'Outerwear', image: STABLE_IMAGES.trench, seasons: ['Rainy', 'Autumn'] },
  { id: '4', name: 'Classic Sneakers', category: 'Shoes', image: STABLE_IMAGES.sneakers, seasons: ['Sunny', 'Spring'] }
];

// Inside your main App component, make sure you use:
// const [items, setItems] = useState(INITIAL_CLOSET);
