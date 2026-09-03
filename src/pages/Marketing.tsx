import React, { useState } from 'react';

const Marketing: React.FC = () => {
  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const loginUrl = isSubdomainSetup ? 'https://login.veltrobridge.xyz' : '/login';
  const signupUrl = isSubdomainSetup ? 'https://signup.veltrobridge.xyz' : '/signup';

  // State for interactive live exchange rate calculator on landing page
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<'EUR' | 'USD' | 'GBP'>('EUR');
  const [toCurrency, setToCurrency] = useState<'USD' | 'GBP' | 'EUR'>('USD');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const rates: Record<string, Record<string, number>> = {
    EUR: { USD: 1.085, GBP: 0.855, EUR: 1.0 },
    USD: { EUR: 0.921, GBP: 0.788, USD: 1.0 },
    GBP: { EUR: 1.169, USD: 1.269, GBP: 1.0 },
  };

  const convertedAmount = (calcAmount * (rates[fromCurrency][toCurrency] || 1)).toFixed(2);
  const feeSaved = (calcAmount * 0.035).toFixed(2); // estimated 3.5% traditional bank markup saved

  const faqs = [
    {
      q: 'How fast are VeltroPay peer-to-peer transfers?',
      a: 'Instantaneous. When sending between VeltroPay accounts using the 8-digit Account Number, funds settle in real-time within milliseconds using our synchronized WebSocket ledger architecture.'
    },
    {
      q: 'Do I get a dedicated European SEPA IBAN?',
      a: 'Yes. Every verified VeltroPay account is instantly assigned a unique European SEPA IBAN and BIC, allowing you to send and receive standard and SEPA Instant wire transfers across all 36 SEPA member states.'
    },
    {
      q: 'How do virtual debit cards work?',
      a: 'You can generate virtual Mastercard & Visa cards with on-demand CVV revelation, configurable spending limits, and instant 1-click freezing directly from your dashboard for safe online checkouts.'
    },
    {
      q: 'How does the daily compounding savings vault work?',
      a: 'Funds in your VeltroPay Savings Vault earn an industry-leading 2.29% AER, calculated and compounded daily with zero lock-in periods and instant transfers back to your main spending balance.'
    },
    {
      q: 'Is my account secure?',
      a: 'We implement bank-grade 256-bit AES encryption, mandatory 6-digit cryptographic Transaction PIN authorization for all transfers, idempotency deduplication, and automated fraud monitoring.'
    }
  ];

  return (
    <div className='marketing-page' style={{ minHeight: '100vh', background: '#070a12', color: '#ffffff', position: 'relative', overflowX: 'hidden', fontFamily: "'Poppins', -apple-system, sans-serif" }}>
      
      {/* Dynamic Ambient Background Glows */}
      <div style={{ position: 'fixed', top: '-15%', left: '15%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '35%', right: '-15%', width: '650px', height: '650px', background: 'radial-gradient(circle, rgba(255, 107, 61, 0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* =========================================================================
          STICKY TOP NAVIGATION
          ========================================================================= */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(7, 10, 18, 0.88)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.45)' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.5rem' }}>bolt</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>VeltroPay</span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Global Banking</span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className='desktop-nav-links'>
            <a href='#features' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
            <a href='#converter' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>FX Converter</a>
            <a href='#cards' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Virtual Cards</a>
            <a href='#comparison' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Why Veltro</a>
            <a href='#faq' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</a>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a 
              href={loginUrl} 
              style={{ padding: '9px 18px', color: '#e2e8f0', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease' }}
            >
              Log In
            </a>
            <a 
              href={signupUrl} 
              style={{ padding: '9px 22px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', borderRadius: '10px', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.45)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
            >
              Get Started
              <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>arrow_forward</span>
            </a>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION (BEHANCE AESTHETIC WITH RICH PHOTOGRAPHY & LIVE UI)
          ========================================================================= */}
      <header style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 1.5rem 5rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Left Column: Value Prop */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.1rem', color: '#38bdf8' }}>auto_awesome</span>
              Next-Gen Borderless Banking • Powered by SEPA & SWIFT
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.12, color: '#ffffff', letterSpacing: '-0.035em', margin: '0 0 1.5rem 0' }}>
              The modern standard for global money movement.
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.68, margin: '0 0 2.2rem 0', maxWidth: '540px' }}>
              Instant multi-currency vaults (EUR, USD, GBP), dedicated European SEPA IBANs, high-velocity peer-to-peer transfers, and virtual debit cards built for modern businesses & digital citizens.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <a 
                href={signupUrl} 
                style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #ff8057 0%, #ff5722 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', borderRadius: '14px', boxShadow: '0 8px 24px rgba(255, 107, 61, 0.45)', display: 'inline-flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s ease' }}
              >
                Open Free Account
                <span className='material-symbols-outlined' style={{ fontSize: '1.25rem' }}>arrow_forward</span>
              </a>

              <a 
                href={loginUrl} 
                style={{ padding: '16px 28px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', borderRadius: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}
              >
                <span className='material-symbols-outlined' style={{ fontSize: '1.2rem', color: '#94a3b8' }}>login</span>
                Sign In to Portal
              </a>
            </div>

            {/* Social Trust Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.8rem' }}>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>€ 48M+</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Volume Processed</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', margin: 0 }}>0.00s</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>Internal Transfer</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>36+</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>SEPA Countries</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Stack with Photography & Card */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            
            {/* Background Lifestyle Photo Layer */}
            <div style={{ position: 'absolute', top: '-20px', right: '-10px', width: '260px', height: '260px', borderRadius: '24px', overflow: 'hidden', opacity: 0.35, filter: 'grayscale(20%)', zIndex: 0 }}>
              <img 
                src='https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80' 
                alt='Financial Analytics' 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* Primary Glass Card Stack */}
            <div style={{ width: '100%', maxWidth: '440px', padding: '2rem', borderRadius: '28px', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.16)', boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 50px rgba(59, 130, 246, 0.2)', position: 'relative', zIndex: 2 }}>
              
              {/* Card Header & Balance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 600 }}>
                    Primary Vault Balance
                  </span>
                  <h3 style={{ fontSize: '2.3rem', fontWeight: 800, margin: '4px 0 0 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
                    € 24,850<span style={{ fontSize: '1.3rem', color: '#93c5fd' }}>.00</span>
                  </h3>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '5px 12px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700 }}>
                  <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>trending_up</span>
                  +12.4% AER
                </div>
              </div>

              {/* Internal Account Chip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', padding: '8px 14px', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#38bdf8' }}>badge</span>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 500 }}>Internal Acc:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>8492 0193</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: '6px' }}>Active</span>
              </div>

              {/* Titanium Virtual Card Visualization */}
              <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0a0f1d 100%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                padding: '1.4rem 1.6rem',
                color: '#ffffff',
                boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px', color: '#ffffff' }}>VeltroPay</span>
                    <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>PLATINUM</span>
                  </div>
                  <span className='material-symbols-outlined' style={{ color: '#93c5fd', fontSize: '1.5rem' }}>contactless</span>
                </div>

                <div style={{ fontSize: '1.25rem', letterSpacing: '4px', fontFamily: 'monospace', marginBottom: '1.2rem', color: '#ffffff', fontWeight: 700 }}>
                  •••• •••• •••• 9075
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                  <span>VIRTUAL MASTERCARD</span>
                  <span>EXP: 09/29</span>
                </div>
              </div>

              {/* Feature Micro-Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#ff8057' }}>bolt</span>
                  Instant P2P
                </div>
                <div style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#60a5fa' }}>language</span>
                  SEPA IBAN
                </div>
                <div style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#34d399' }}>lock</span>
                  2FA PIN
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          PARTNERS & NETWORKS MARQUEE (TRUST)
          ========================================================================= */}
      <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(11, 17, 32, 0.6)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', fontWeight: 600, marginBottom: '1.2rem' }}>
            Integrated with Global Payment Rails & Clearing Systems
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.75 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '1px' }}>🏛️ SEPA Instant</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '1px' }}>🌐 SWIFT Rail</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '1px' }}>💳 Mastercard</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '1px' }}>⚡ Visa Direct</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#cbd5e1', letterSpacing: '1px' }}>🛡️ AES-256 Vault</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE LIVE CURRENCY CALCULATOR (BEHANCE FEATURE SHOWCASE)
          ========================================================================= */}
      <section id='converter' style={{ maxWidth: '1240px', margin: '0 auto', padding: '5rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Left: Explainer with Photo */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600, fontSize: '0.88rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>currency_exchange</span>
              Real-Time Mid-Market Rates
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: '0 0 1.25rem 0' }}>
              Convert and hold currencies with zero hidden spreads.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1.8rem 0' }}>
              Traditional banks hide up to 4% markups in their exchange rates. With VeltroPay, you exchange EUR, USD, and GBP at transparent interbank rates with immediate vault settlement.
            </p>

            {/* Lifestyle Image Showcase */}
            <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', height: '220px', position: 'relative' }}>
              <img 
                src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80' 
                alt='Global entrepreneur using VeltroPay' 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(7, 10, 18, 0.85)', backdropFilter: 'blur(12px)', padding: '10px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>&ldquo;Saved our agency over €4,200 in international wire fees last quarter.&rdquo;</span>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Converter Widget */}
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '24px', padding: '2.2rem', backdropFilter: 'blur(24px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className='material-symbols-outlined' style={{ color: '#38bdf8' }}>calculate</span>
              Live Rate Estimator
            </h3>

            {/* You Send Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>You Send</label>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden' }}>
                <input 
                  type='number' 
                  value={calcAmount} 
                  onChange={(e) => setCalcAmount(Math.max(1, Number(e.target.value)))} 
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 16px', color: '#ffffff', fontSize: '1.3rem', fontWeight: 700, outline: 'none' }} 
                />
                <select 
                  value={fromCurrency} 
                  onChange={(e) => setFromCurrency(e.target.value as any)} 
                  style={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#ffffff', fontWeight: 700, padding: '0 16px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value='EUR'>EUR (€)</option>
                  <option value='USD'>USD ($)</option>
                  <option value='GBP'>GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Rate Indicator Pill */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600 }}>
                <span className='material-symbols-outlined' style={{ fontSize: '0.95rem' }}>swap_vert</span>
                1 {fromCurrency} = {rates[fromCurrency][toCurrency]} {toCurrency}
              </div>
            </div>

            {/* Recipient Gets Output */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>Recipient Receives</label>
              <div style={{ display: 'flex', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '14px 16px', color: '#34d399', fontSize: '1.3rem', fontWeight: 800 }}>
                  {convertedAmount}
                </div>
                <select 
                  value={toCurrency} 
                  onChange={(e) => setToCurrency(e.target.value as any)} 
                  style={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', color: '#ffffff', fontWeight: 700, padding: '0 16px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value='USD'>USD ($)</option>
                  <option value='EUR'>EUR (€)</option>
                  <option value='GBP'>GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Savings Callout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 107, 61, 0.12)', border: '1px solid rgba(255, 107, 61, 0.25)', padding: '10px 14px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#fed7aa', fontWeight: 500 }}>Estimated Bank Hidden Markup Saved:</span>
              <span style={{ fontSize: '0.95rem', color: '#ff8057', fontWeight: 800 }}>+€{feeSaved}</span>
            </div>

            <a 
              href={signupUrl} 
              style={{ display: 'block', width: '100%', textAlign: 'center', padding: '14px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', borderRadius: '12px', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)' }}
            >
              Lock in Rate & Send Now
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6-PILLAR FEATURES GRID (WITH ICONS & CASE STUDY ASSETS)
          ========================================================================= */}
      <section id='features' style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 1.5rem 6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 4rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>view_quilt</span>
            Comprehensive Banking Suite
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Built for Global Commerce & Velocity
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
            Every tool required to store, exchange, transfer, and safeguard multi-currency assets across international borders.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          
          {/* Card 1: P2P */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)', transition: 'transform 0.2s ease', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(255, 107, 61, 0.16)', border: '1px solid rgba(255, 107, 61, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8057', marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.8rem' }}>bolt</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>Instant Internal P2P</h3>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Zero-latency settlement between users using 8-digit internal Account Numbers with WebSocket state sync and zero network fees.
            </p>
          </div>

          {/* Card 2: SEPA IBAN */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)', transition: 'transform 0.2s ease' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.16)', border: '1px solid rgba(59, 130, 246, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.8rem' }}>language</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>Dedicated European SEPA IBANs</h3>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Accept SEPA and SEPA Instant euro wire transfers directly into your personal virtual IBAN with automated ledger credit.
            </p>
          </div>

          {/* Card 3: Virtual Debit Cards */}
          <div id='cards' style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.16)', border: '1px solid rgba(139, 92, 246, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.8rem' }}>credit_card</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>Virtual Debit Cards</h3>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Create instant cards for online subscriptions with on-demand CVV revelation, 1-click freezing, and daily spending controls.
            </p>
          </div>

          {/* Card 4: Daily Compounding Savings */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.16)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.8rem' }}>savings</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>2.29% AER Daily Yield Vaults</h3>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Earn daily interest on idle balances with no lockup periods and instant liquid withdrawals back to your primary spending wallet.
            </p>
          </div>

          {/* Card 5: Instant KYC Verification */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.8rem' }}>verified_user</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>Rapid Automated KYC</h3>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              Seamless identity verification pipeline enabling fast account activation while maintaining stringent compliance standards.
            </p>
          </div>

          {/* Card 6: 2FA PIN & Bank Security */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.16)', border: '1px solid rgba(59, 130, 246, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.8rem' }}>shield</span>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 10px 0' }}>2FA PIN & Idempotency</h3>
            <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: 0 }}>
              6-digit cryptographic PIN for transfer authorization and UUID v4 idempotency preventing double-spending on any network glitch.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPARISON TABLE (VELTROPAY VS TRADITIONAL BANKS)
          ========================================================================= */}
      <section id='comparison' style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Why Leading Businesses Choose VeltroPay
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            Compare modern velocity against legacy banking friction.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', padding: '1.4rem 1.8rem', background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontWeight: 700, fontSize: '0.95rem' }}>
            <span style={{ color: '#94a3b8' }}>Feature Capability</span>
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>⚡ VeltroPay</span>
            <span style={{ color: '#64748b' }}>🏛️ Legacy Banks</span>
          </div>

          {[
            { feature: 'Internal P2P Transfer Speed', veltro: 'Instant (< 1 second)', legacy: '1 to 3 Business Days' },
            { feature: 'Dedicated European SEPA IBAN', veltro: 'Included Free', legacy: 'High Monthly Fee / In-Person' },
            { feature: 'FX Markups & Hidden Margins', veltro: '0% Transparent Mid-Market', legacy: '3.5% to 5.0% Hidden Markup' },
            { feature: 'Virtual Debit Cards', veltro: 'Instant On-Demand Creation', legacy: '7 to 14 Days Postal Mail' },
            { feature: 'Savings Yield Compounding', veltro: '2.29% AER Daily Compounded', legacy: '0.1% Monthly / Quarterly' },
            { feature: 'Security & 2FA PIN Layer', veltro: 'Hardware + PIN + Idempotent', legacy: 'SMS OTP (SIM-Swap Vulnerable)' },
          ].map((row, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', padding: '1.2rem 1.8rem', borderBottom: idx === 5 ? 'none' : '1px solid rgba(255, 255, 255, 0.06)', alignItems: 'center', fontSize: '0.92rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>{row.feature}</span>
              <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>check_circle</span>
                {row.veltro}
              </span>
              <span style={{ color: '#94a3b8' }}>{row.legacy}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          VERIFIED CUSTOMER TESTIMONIALS & CASE STUDIES (REAL AVATARS)
          ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Trusted by Global Founders & Operators
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            Discover how remote teams, freelancers, and businesses move money with VeltroPay.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          
          {/* Testimonial 1 */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>
              &ldquo;The 8-digit internal account transfers are literally instant. We pay our distributed engineering team across 4 countries every Friday with zero friction.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80' 
                alt='Elena Rostova' 
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} 
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Elena Rostova</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>COO at CloudSync Global</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>
              &ldquo;Having a dedicated SEPA IBAN in my name made receiving European client retainers effortless. The virtual cards also make online software spend completely isolated.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80' 
                alt='Marcus Vance' 
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff8057' }} 
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Marcus Vance</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>FinTech Consultant & Nomad</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>
              &ldquo;The 2.29% daily compounding savings vault is fantastic for holding our operating buffer. Transparent rates and instant liquidity whenever we need it.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src='https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80' 
                alt='Sophia Chen' 
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} 
              />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>Sophia Chen</h4>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Founder at Horizon Labs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION
          ========================================================================= */}
      <section id='faq' style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            Everything you need to know about VeltroPay accounts and security.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.4rem 1.8rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>{faq.q}</h4>
                <span className='material-symbols-outlined' style={{ color: '#38bdf8', transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  expand_more
                </span>
              </div>
              {activeFaq === idx && (
                <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.65, margin: '12px 0 0 0', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          HIGH-CONVERSION CTA BANNER
          ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '32px', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 50px rgba(59, 130, 246, 0.25)' }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', lineHeight: 1.15 }}>
              Ready for the next era of borderless banking?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 2.2rem 0' }}>
              Open your free multi-currency account in under 3 minutes. Zero setup fees, instant virtual cards, and direct European SEPA IBANs.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <a 
                href={signupUrl} 
                style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #ff8057 0%, #ff5722 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1.1rem', textDecoration: 'none', borderRadius: '14px', boxShadow: '0 8px 25px rgba(255, 107, 61, 0.5)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Create Free Account
                <span className='material-symbols-outlined' style={{ fontSize: '1.25rem' }}>arrow_forward</span>
              </a>
              <a 
                href={loginUrl} 
                style={{ padding: '16px 30px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 600, fontSize: '1.1rem', textDecoration: 'none', borderRadius: '14px' }}
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINTECH FOOTER (REGULATORY, COPYRIGHT & SITEMAP)
          ========================================================================= */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#05070d', padding: '4rem 1.5rem 2.5rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>bolt</span>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>VeltroPay</span>
            </div>
            <p style={{ lineHeight: 1.6, color: '#94a3b8', margin: '0 0 1rem 0' }}>
              High-velocity borderless financial infrastructure. Dedicated European SEPA IBANs, multi-currency vaults, and virtual debit cards.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h5 style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Product</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href='#features' style={{ color: '#94a3b8', textDecoration: 'none' }}>Instant P2P Transfers</a></li>
              <li><a href='#features' style={{ color: '#94a3b8', textDecoration: 'none' }}>European SEPA IBAN</a></li>
              <li><a href='#cards' style={{ color: '#94a3b8', textDecoration: 'none' }}>Virtual Debit Cards</a></li>
              <li><a href='#converter' style={{ color: '#94a3b8', textDecoration: 'none' }}>Multi-Currency Vaults</a></li>
              <li><a href='#features' style={{ color: '#94a3b8', textDecoration: 'none' }}>2.29% AER Savings</a></li>
            </ul>
          </div>

          {/* Security & Compliance */}
          <div>
            <h5 style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Security & Trust</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><span style={{ color: '#94a3b8' }}>256-Bit AES Encryption</span></li>
              <li><span style={{ color: '#94a3b8' }}>6-Digit 2FA Transaction PIN</span></li>
              <li><span style={{ color: '#94a3b8' }}>Idempotency Protection</span></li>
              <li><span style={{ color: '#94a3b8' }}>Automated Identity KYC</span></li>
            </ul>
          </div>

          {/* Account Access */}
          <div>
            <h5 style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Portal Access</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href={signupUrl} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Create Free Account</a></li>
              <li><a href={loginUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Client Sign In</a></li>
              <li><a href={loginUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Account Recovery</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Disclaimer */}
        <div style={{ maxWidth: '1240px', margin: '0 auto', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            &copy; {new Date().getFullYear()} VeltroPay. All rights reserved. Next-generation financial technology platform.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;
