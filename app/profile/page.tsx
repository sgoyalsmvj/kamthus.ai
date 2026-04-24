"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, User, LogOut, Activity, Target, Weight, Ruler, Flame, Shield, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("kamthus_userId");
    if (userId) {
      fetch(`/api/user?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setUser(data);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kamthus_userId");
    localStorage.removeItem("kamthus_nickname");
    router.push("/");
    window.location.reload();
  };

  if (!mounted || !user) return null;

  return (
    <div style={{ padding: '32px 24px', minHeight: '100vh', maxWidth: '600px', margin: '0 auto' }}>
      <header className="flex-between" style={{ marginBottom: '48px', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/">
            <div className="glass" style={{ padding: '10px', borderRadius: '12px', color: 'var(--muted)' }}>
              <ChevronLeft size={20} />
            </div>
          </Link>
          <h1 className="h2">Identity</h1>
        </div>
      </header>

      <section style={{ textAlign: 'center', marginBottom: '48px' }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ 
            width: '88px', height: '88px', background: 'var(--surface-lift)', 
            border: '1px solid var(--border-bright)', borderRadius: '32px', 
            display: 'flex', justifyContent: 'center', 
            alignItems: 'center', margin: '0 auto 24px',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <User size={40} color="var(--accent)" />
        </motion.div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>{user.nickname}</h2>
        <p className="text-muted" style={{ fontSize: '15px' }}>Member since 2026</p>
      </section>

      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        <MetricCard label="Physique Goal" value={user.goal} icon={<Target size={14} />} />
        <MetricCard label="Activity Level" value={user.activityLevel} icon={<Activity size={14} />} />
        <MetricCard label="Current Weight" value={`${user.weight} kg`} icon={<Weight size={14} />} />
        <MetricCard label="Stature" value={`${user.height} cm`} icon={<Ruler size={14} />} />
      </div>

      <div className="card-premium glass-lift" style={{ padding: '32px', textAlign: 'center', marginBottom: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
          <Flame size={80} color="var(--accent)" />
        </div>
        <p className="text-muted text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', fontWeight: 600 }}>Calculated Daily Intelligence</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px' }}>
          <h3 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{user.targetCalories}</h3>
          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--muted)' }}>kcal</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <button className="glass" style={{ width: '100%', padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--fg)', fontWeight: 500, cursor: 'pointer' }}>
          <Shield size={18} className="text-muted" />
          Privacy & Data
        </button>
        <button className="glass" style={{ width: '100%', padding: '18px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--fg)', fontWeight: 500, cursor: 'pointer' }}>
          <Info size={18} className="text-muted" />
          About Kamthus Intelligence
        </button>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', padding: '18px', borderRadius: '18px', 
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px', cursor: 'pointer', marginTop: '12px'
          }}
        >
          <LogOut size={18} />
          Sign Out of Experience
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: any) {
  return (
    <div className="card-premium glass" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--muted)' }}>
        {icon}
        <p className="text-small" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
      </div>
      <p style={{ fontWeight: 700, fontSize: '17px', textTransform: 'capitalize' }}>{value?.split('_').join(' ')}</p>
    </div>
  );
}

