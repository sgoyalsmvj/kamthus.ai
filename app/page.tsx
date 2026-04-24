"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Activity, History, User, Search, Trophy, X, Send, ChevronRight, ChevronLeft, Check, Target, Flame, Droplets, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [meals, setMeals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [input, setInput] = useState("");
  const [nickname, setNickname] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(new Date().getDate());
  const [mounted, setMounted] = useState(false);

  // Generate last 7 days dynamically
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      fullDate: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      isToday: i === 6,
      rawDate: date
    };
  });

  const selectedDayLabel = days.find(d => d.dayNumber === selectedDate)?.fullDate || days[6].fullDate;

  useEffect(() => {
    setMounted(true);
    const savedUserId = localStorage.getItem("kamthus_userId");
    if (savedUserId) {
      handleLogin(localStorage.getItem("kamthus_nickname") || "");
    }
  }, []);

  const handleLogin = async (name: string) => {
    if (!name) return;
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ nickname: name })
      });
      const userData = await res.json();
      if (userData.error) throw new Error(userData.error);

      setUser(userData);
      setMeals(userData.meals || []);
      localStorage.setItem("kamthus_userId", userData.id);
      localStorage.setItem("kamthus_nickname", userData.nickname);
      
      setShowLogin(false);
      if (!userData.targetCalories) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Filter meals for the selected date
  const filteredMeals = meals.filter(meal => {
    const mealDate = new Date(meal.createdAt);
    return mealDate.getDate() === selectedDate;
  });

  const totalCals = filteredMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const targetCals = user?.targetCalories || 2000;
  const remainingCals = Math.max(0, targetCals - totalCals);

  if (!mounted) return null;

  if (showLogin) {
    return (
      <div style={{ padding: '80px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '64px' }}
        >
          <div style={{ width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginBottom: '24px' }} />
          <h1 className="h1" style={{ marginBottom: '12px' }}>Kamthus</h1>
          <p className="text-muted" style={{ fontSize: '18px' }}>Your personal nutrition intelligence.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium glass"
        >
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 600 }}>Identity</label>
            <input 
              className="input-minimal" 
              value={nickname} 
              onChange={(e) => setNickname(e.target.value)} 
              placeholder="Enter your nickname" 
            />
          </div>
          <button className="btn-primary" style={{ width: '100%', height: '56px' }} onClick={() => handleLogin(nickname)}>
            Enter Experience
          </button>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding userId={user.id} onComplete={(u: any) => {
      setUser(u);
      setShowOnboarding(false);
    }} />;
  }

  const handleAddMeal = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ input, userId: user.id }),
      });
      const savedMeal = await res.json();
      if (savedMeal.error) throw new Error(savedMeal.error);

      setMeals([savedMeal, ...meals]);
      setInput("");
      setIsAdding(false);
    } catch (error: any) {
      alert("Analysis failed: " + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Premium Header */}
      <header style={{ padding: '24px 24px 16px', position: 'sticky', top: 0, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(16px)', zIndex: 100, borderBottom: '1px solid var(--border)' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <div>
            <p className="text-muted text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', fontWeight: 600 }}>{selectedDate === new Date().getDate() ? 'Today' : 'Intelligence Log'}</p>
            <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>{selectedDayLabel}</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/history">
              <div className="glass icon-box">
                <Search size={20} />
              </div>
            </Link>
            <Link href="/profile">
              <div className="glass icon-box">
                <User size={20} />
              </div>
            </Link>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
          {days.map((d) => (
            <div 
              key={d.dayNumber} 
              onClick={() => setSelectedDate(d.dayNumber)}
              className={`date-pill ${d.dayNumber === selectedDate ? 'today' : 'active'}`} 
              style={{ 
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'var(--transition)',
                transform: d.dayNumber === selectedDate ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <span className="text-small" style={{ fontWeight: 600, opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>{d.dayName}</span>
              <span style={{ fontSize: '22px', fontWeight: 800 }}>{d.dayNumber}</span>
            </div>
          ))}
        </div>
      </header>

      <main style={{ padding: '24px 24px 140px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Intelligence Summary */}
        <section style={{ marginBottom: '40px' }}>
          <div className="card-premium glass-lift" style={{ padding: '28px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05 }}>
              <Flame size={120} color="var(--accent)" />
            </div>
            
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={14} color="var(--accent)" /> Daily Energy
                </h3>
              </div>
              <div className="glass" style={{ padding: '4px 12px', borderRadius: '100px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>{Math.round((totalCals / targetCals) * 100)}%</span>
              </div>
            </div>

            <div className="flex-between" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>{totalCals}</p>
                <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>calories consumed</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>{remainingCals}</p>
                <p className="text-muted" style={{ fontSize: '14px' }}>remaining</p>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${Math.min(100, (totalCals / targetCals) * 100)}%`, background: 'var(--accent)' }} />
            </div>
          </div>

            <div className="grid-cols-2">
              <MacroCard 
                label="Protein" 
                value={filteredMeals.reduce((s,m) => s+(m.protein||0), 0)} 
                target={Math.round((targetCals * 0.3) / 4)} 
                color="var(--protein)" 
                icon={<Zap size={14} />}
              />
              <MacroCard 
                label="Carbs" 
                value={filteredMeals.reduce((s,m) => s+(m.carbs||0), 0)} 
                target={Math.round((targetCals * 0.4) / 4)} 
                color="var(--carbs)" 
                icon={<Activity size={14} />}
              />
              <MacroCard 
                label="Fat" 
                value={filteredMeals.reduce((s,m) => s+(m.fat||0), 0)} 
                target={Math.round((targetCals * 0.3) / 9)} 
                color="var(--fat)" 
                icon={<Droplets size={14} />}
              />
              <MacroCard 
                label="Burn" 
                value={0} 
                target={500} 
                color="var(--accent)" 
                icon={<Flame size={14} />}
              />
            </div>
          </section>

        {/* Log Section */}
        <section>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h2 className="h2">Timeline</h2>
            <div className="text-muted text-small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <History size={14} /> Latest first
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <AnimatePresence mode="popLayout">
              {filteredMeals.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '48px 24px' }}>
                  <p className="text-muted">No nutrition data logged for this day.</p>
                </motion.div>
              ) : (
                filteredMeals.map((meal, index) => (
                  <motion.div 
                    key={meal.id || index}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-premium glass"
                    style={{ padding: '20px' }}
                  >
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: 600 }}>{meal.name}</h3>
                        <p className="text-muted text-small">{meal.time || 'Logged'}</p>
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
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Floating Action Bar */}
      <div style={{ 
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', 
        width: 'calc(100% - 48px)', maxWidth: '440px', zIndex: 1000 
      }}>
        <div 
          className="glass-lift" 
          onClick={() => setIsAdding(true)} 
          style={{ 
            borderRadius: '20px', padding: '12px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '16px',
            border: '1px solid var(--border-bright)'
          }}
        >
          <div className="icon-box" style={{ background: 'var(--accent)', color: '#000', borderRadius: '14px', width: '40px', height: '40px' }}>
            <Plus size={22} strokeWidth={3} />
          </div>
          <span className="text-muted" style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>Log your next selection...</span>
        </div>
      </div>

      {/* Modern Overlay */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="card-premium"
              style={{ width: '100%', maxWidth: '500px', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, paddingBottom: '48px' }}
            >
              <div className="flex-between" style={{ marginBottom: '32px' }}>
                <h2 className="h2">Intelligence Input</h2>
                <div onClick={() => setIsAdding(false)} className="glass" style={{ padding: '8px', borderRadius: '12px', cursor: 'pointer' }}>
                  <X size={20} />
                </div>
              </div>
              
              <textarea 
                className="input-minimal"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. A double espresso and two sourdough toasts with avocado"
                autoFocus
                style={{ height: '160px', marginBottom: '24px', resize: 'none', background: 'transparent' }}
              />
              
              <button 
                onClick={handleAddMeal}
                disabled={isAnalyzing || !input.trim()}
                className="btn-primary"
                style={{ width: '100%', height: '64px', fontSize: '18px' }}
              >
                {isAnalyzing ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Activity size={20} />
                    </motion.div>
                    Analyzing Intelligence...
                  </>
                ) : (
                  <>Log Selection <Send size={18} /></>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MacroCard({ label, value, target, color, icon }: any) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div className="card-premium glass" style={{ padding: '20px' }}>
      <div className="flex-between" style={{ marginBottom: '12px' }}>
        <span style={{ color, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
          {icon} {label}
        </span>
        <span className="text-muted text-small">{Math.round(pct)}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px', fontWeight: 700 }}>{value}</span>
        <span className="text-muted text-small">/ {target}g</span>
      </div>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${pct}%`, background: color }} />
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

function Onboarding({ userId, onComplete }: { userId: string, onComplete: (u: any) => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age: 25,
    gender: 'male',
    weight: 70,
    height: 175,
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  const handleFinish = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        body: JSON.stringify({ userId, ...data })
      });
      const user = await res.json();
      onComplete(user);
    } catch (e) {
      alert("Failed to save profile");
    }
  };

  return (
    <div style={{ padding: '60px 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '440px', margin: '0 auto' }}>
      <header style={{ marginBottom: '64px' }}>
        <p className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>Onboarding • Step {step} of 3</p>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px' }}>Your physical profile</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              flex: 1, height: '3px', borderRadius: '2px',
              background: i <= step ? 'var(--fg)' : 'rgba(255,255,255,0.05)',
              transition: 'var(--transition)'
            }} />
          ))}
        </div>
      </header>

      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="s1">
              <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Fundamentals</h2>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label className="text-muted text-small" style={{ textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Age</label>
                  <input className="input-minimal" type="number" value={data.age} onChange={(e) => setData({...data, age: parseInt(e.target.value)})} />
                </div>
                <div>
                  <p className="text-muted text-small" style={{ textTransform: 'uppercase', marginBottom: '8px' }}>Gender</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Tab active={data.gender === 'male'} onClick={() => setData({...data, gender: 'male'})}>Male</Tab>
                    <Tab active={data.gender === 'female'} onClick={() => setData({...data, gender: 'female'})}>Female</Tab>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="s2">
              <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Body Metrics</h2>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label className="text-muted text-small" style={{ textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Weight (kg)</label>
                  <input className="input-minimal" type="number" value={data.weight} onChange={(e) => setData({...data, weight: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="text-muted text-small" style={{ textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Height (cm)</label>
                  <input className="input-minimal" type="number" value={data.height} onChange={(e) => setData({...data, height: parseFloat(e.target.value)})} />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="s3">
              <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>Lifestyle Goal</h2>
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <p className="text-muted text-small" style={{ textTransform: 'uppercase', marginBottom: '8px' }}>Activity Intensity</p>
                  <select 
                    value={data.activityLevel} 
                    onChange={(e) => setData({...data, activityLevel: e.target.value})}
                    className="input-minimal"
                  >
                    <option value="sedentary">Sedentary (Office job)</option>
                    <option value="light">Lightly Active</option>
                    <option value="moderate">Moderately Active</option>
                    <option value="active">Very Active</option>
                  </select>
                </div>
                <div>
                  <p className="text-muted text-small" style={{ textTransform: 'uppercase', marginBottom: '8px' }}>Primary Goal</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <Tab active={data.goal === 'lose'} onClick={() => setData({...data, goal: 'lose'})}>Lose</Tab>
                    <Tab active={data.goal === 'maintain'} onClick={() => setData({...data, goal: 'maintain'})}>Maintain</Tab>
                    <Tab active={data.goal === 'gain'} onClick={() => setData({...data, goal: 'gain'})}>Gain</Tab>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
        {step > 1 && (
          <button className="glass" style={{ flex: 1, padding: '16px', borderRadius: '16px', color: 'white' }} onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button className="btn-primary" style={{ flex: 2, padding: '16px', borderRadius: '16px' }} onClick={() => step === 3 ? handleFinish() : setStep(step + 1)}>
          {step === 3 ? 'Get Started' : 'Continue'}
        </button>
      </footer>
    </div>
  );
}

function Tab({ children, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      style={{
        flex: 1, padding: '14px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
        background: active ? 'var(--fg)' : 'var(--surface-lift)',
        border: '1px solid',
        borderColor: active ? 'transparent' : 'var(--border)',
        color: active ? '#000' : 'var(--fg)', 
        fontWeight: 600, transition: 'var(--transition)'
      }}
    >
      {children}
    </div>
  );
}

