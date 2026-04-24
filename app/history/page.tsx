"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Search, Calendar, Filter, Clock } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("kamthus_userId");
    if (userId) {
      fetch(`/api/user?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setMeals(data.meals || []);
        });
    }
  }, []);

  const filteredMeals = meals.filter(meal => 
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', paddingBottom: '120px', maxWidth: '600px', margin: '0 auto' }}>
      <header className="flex-between" style={{ marginBottom: '40px', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/">
            <div className="glass icon-box">
              <ChevronLeft size={20} />
            </div>
          </Link>
          <h1 className="h2">Intelligence History</h1>
        </div>
      </header>

      <div className="glass-lift" style={{ display: 'flex', alignItems: 'center', padding: '4px 16px', marginBottom: '32px', borderRadius: '18px' }}>
        <Search size={18} className="text-muted" />
        <input 
          type="text" 
          placeholder="Search nutrition logs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-minimal"
          style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
        />
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <AnimatePresence>
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal, index) => (
              <motion.div 
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-premium glass"
                style={{ padding: '20px' }}
              >
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Clock size={12} className="text-muted" />
                      <p className="text-muted text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {new Date(meal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {meal.time}
                      </p>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{meal.name}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>{meal.calories}</span>
                    <span className="text-muted text-small" style={{ marginLeft: '4px' }}>kcal</span>
                  </div>
                </div>

                <div className="grid-cols-4">
                  <MacroMini label="P" value={meal.protein} color="var(--protein)" />
                  <MacroMini label="C" value={meal.carbs} color="var(--carbs)" />
                  <MacroMini label="F" value={meal.fat} color="var(--fat)" />
                  <MacroMini label="S" value={meal.sugar || 0} color="var(--cals)" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="card-premium" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '48px 24px' }}>
              <p className="text-muted">No nutrition data matches your search.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MacroMini({ label, value, color }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '14px', border: '1px solid var(--border)' }}>
      <p className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '14px' }}>{value}<span style={{ fontWeight: 400, fontSize: '10px', marginLeft: '1px' }}>g</span></p>
    </div>
  );
}

