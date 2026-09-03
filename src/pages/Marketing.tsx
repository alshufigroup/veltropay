import React, { useState } from 'react';

const Marketing: React.FC = () => {
  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const loginUrl = isSubdomainSetup ? 'https://login.veltrobridge.xyz' : '/login';
  const signupUrl = isSubdomainSetup ? 'https://signup.veltrobridge.xyz' : '/signup';

  // State for live currency converter
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
  const feeSaved = (calcAmount * 0.035).toFixed(2);

  const faqs = [
    {
      q: 'How fast are VeltroPay peer-to-peer transfers?',
      a: 'Transfers between VeltroPay accounts using the 8-digit internal Account Number settle instantly with zero network delay and zero transaction fees.'
    },
    {
      q: 'Do I get a dedicated European SEPA IBAN?',
      a: 'Yes. Every verified account is issued a dedicated SEPA IBAN, enabling seamless Euro wire deposits and payouts across 36 European countries.'
    },
    {
      q: 'How do virtual debit cards work for online spending?',
      a: 'You can generate virtual cards on demand, view card credentials with 1-click CVV revelation, set custom spending limits, and freeze cards instantly.'
    },
    {
      q: 'How does the daily compounding savings vault work?',
      a: 'Idle funds in your Savings Vault earn 2.29% AER interest compounded daily, with no minimum balance requirements and instant liquid withdrawals.'
    },
    {
      q: 'How are my funds and personal data secured?',
      a: 'We enforce 256-bit AES database encryption, mandatory 6-digit cryptographic Transaction PINs for all outbound transfers, and automated idempotency protection.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#ffffff', fontFamily: "'Poppins', -apple-system, sans-serif", overflowX: 'hidden' }}>
      
      {/* =========================================================================
          NAVIGATION BAR
          ========================================================================= */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(8, 12, 20, 0.9)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.4rem' }}>bolt</span>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>VeltroPay</span>
          </div>

          {/* Links */}
          <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className='desktop-nav-links'>
            <a href='#features' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Features</a>
            <a href='#converter' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>FX Rates</a>
            <a href='#cards' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Cards</a>
            <a href='#comparison' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>Comparison</a>
            <a href='#faq' style={{ color: '#cbd5e1', fontSize: '0.92rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}>FAQ</a>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a 
              href={loginUrl} 
              style={{ padding: '8px 18px', color: '#e2e8f0', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease' }}
            >
              Log In
            </a>
            <a 
              href={signupUrl} 
              style={{ padding: '8px 22px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', borderRadius: '10px', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
            >
              Get Started
              <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>arrow_forward</span>
            </a>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          HERO SECTION: PHOTOGRAPHY-DRIVEN FINTECH DESIGN
          ========================================================================= */}
      <header style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 1.5rem 5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Left: Value Proposition */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.4rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#38bdf8' }}>verified</span>
              Next-Gen Global Banking Infrastructure
            </div>

            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 1.25rem 0' }}>
              Borderless banking built for speed and global scale.
            </h1>

            <p style={{ fontSize: '1.12rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 2rem 0', maxWidth: '520px' }}>
              Instant multi-currency accounts, dedicated European SEPA IBANs, virtual payment cards, and real-time internal transfers without borders or hidden bank fees.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <a 
                href={signupUrl} 
                style={{ padding: '15px 30px', background: 'linear-gradient(135deg, #ff8057 0%, #ff5722 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', borderRadius: '12px', boxShadow: '0 6px 22px rgba(255, 107, 61, 0.45)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s ease' }}
              >
                Open Free Account
                <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>arrow_forward</span>
              </a>

              <a 
                href={loginUrl} 
                style={{ padding: '15px 26px', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.14)', color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
              >
                Sign In to Portal
              </a>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>€ 48M+</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Volume Processed</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>Instant</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>P2P Settlement</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>36</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>SEPA Countries</div>
              </div>
            </div>
          </div>

          {/* Right: Rich Fitted Photography with Floating Glass Pill Overlays */}
          <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <img 
              src='https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=1200&q=80' 
              alt='Contactless mobile banking and global payments' 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            
            {/* Dark gradient scrim over photo */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8, 12, 20, 0.2) 0%, rgba(8, 12, 20, 0.75) 100%)' }} />

            {/* Top Floating Glass Badge */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '10px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>bolt</span>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>P2P Transfer Settled</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>€ 1,450.00 • Instant</div>
              </div>
            </div>

            {/* Bottom Floating Glass Card */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.16)', padding: '16px 20px', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Multi-Currency Vaults</span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0' }}>EUR • USD • GBP</h4>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>Direct IBAN</span>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600 }}>+2.29% AER</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          PARTNERS & CLEARING NETWORKS
          ========================================================================= */}
      <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(12, 18, 30, 0.6)', padding: '1.8rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#64748b', fontWeight: 600, marginBottom: '1rem' }}>
            Integrated with Global Payment Rails & European Clearing
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', color: '#cbd5e1', fontWeight: 700, fontSize: '1.05rem' }}>
            <span>🏛️ SEPA Instant</span>
            <span>🌐 SWIFT Direct</span>
            <span>💳 Mastercard Virtual</span>
            <span>⚡ Visa Direct</span>
            <span>🛡️ 256-Bit AES Vault</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE SECTION 1: GLOBAL FOUNDERS & INSTANT TRANSFERS (WITH IMAGE)
          ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Image */}
          <div style={{ height: '400px', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', position: 'relative' }}>
            <img 
              src='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80' 
              alt='International entrepreneur managing global accounts' 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', background: 'rgba(8, 12, 20, 0.85)', backdropFilter: 'blur(12px)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <span style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>&ldquo;We pay international contractors across Europe in seconds with zero hidden conversion markups.&rdquo;</span>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ff8057', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>bolt</span>
              High-Velocity P2P Transfers
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: '0 0 1.2rem 0' }}>
              Send money across the world in milliseconds.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
              Every VeltroPay user receives an 8-digit internal Account Number. Simply share your account ID to receive instant payments with synchronized ledger credit and zero network fees.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1.2rem' }}>check_circle</span>
                Instant 1-click clipboard account copying
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1.2rem' }}>check_circle</span>
                Real-time WebSocket notifications on receipt
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1.2rem' }}>check_circle</span>
                Mandatory 6-digit 2FA Transaction PIN authorization
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE SECTION 2: VIRTUAL CARDS & SMART SPENDING (WITH IMAGE)
          ========================================================================= */}
      <section id='cards' style={{ maxWidth: '1240px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Text */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>credit_card</span>
              Virtual Debit Cards
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: '0 0 1.2rem 0' }}>
              Generate secure virtual debit cards on demand.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
              Keep your primary vault isolated from online checkout risks. Create dedicated virtual payment cards with on-demand CVV revelation and instant 1-click freeze controls.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1.2rem' }}>check_circle</span>
                Accepted worldwide at all Mastercard & Visa merchants
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1.2rem' }}>check_circle</span>
                Instant card details toggle and masked PAN protection
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', fontSize: '0.95rem' }}>
                <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1.2rem' }}>check_circle</span>
                Zero monthly maintenance fees
              </div>
            </div>
          </div>

          {/* Image */}
          <div style={{ height: '400px', borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <img 
              src='https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80' 
              alt='Digital card management and spend analytics' 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE CURRENCY CONVERTER & SEPA WIRE EXPLAINER
          ========================================================================= */}
      <section id='converter' style={{ maxWidth: '1240px', margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          
          {/* Left: Dedicated SEPA IBAN with Image */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.1rem' }}>language</span>
              Dedicated European SEPA IBAN
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, margin: '0 0 1.2rem 0' }}>
              Direct European banking in your name.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
              Receive wire transfers directly from European employers, clients, and marketplaces. Each account includes a unique IBAN and BIC code with automated ledger settlement.
            </p>

            <div style={{ height: '220px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <img 
                src='https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80' 
                alt='International remote team collaborating' 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>

          {/* Right: Live Converter Widget */}
          <div style={{ background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '24px', padding: '2.2rem', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className='material-symbols-outlined' style={{ color: '#38bdf8' }}>calculate</span>
              Live Mid-Market Rate Estimator
            </h3>

            {/* Send */}
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>You Send</label>
              <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.12)', overflow: 'hidden' }}>
                <input 
                  type='number' 
                  value={calcAmount} 
                  onChange={(e) => setCalcAmount(Math.max(1, Number(e.target.value)))} 
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '14px 16px', color: '#ffffff', fontSize: '1.25rem', fontWeight: 700, outline: 'none' }} 
                />
                <select 
                  value={fromCurrency} 
                  onChange={(e) => setFromCurrency(e.target.value as any)} 
                  style={{ background: 'rgba(30, 41, 59, 0.95)', border: 'none', color: '#ffffff', fontWeight: 700, padding: '0 16px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value='EUR'>EUR (€)</option>
                  <option value='USD'>USD ($)</option>
                  <option value='GBP'>GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Rate Pill */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.6rem 0' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600 }}>
                1 {fromCurrency} = {rates[fromCurrency][toCurrency]} {toCurrency}
              </div>
            </div>

            {/* Receive */}
            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>Recipient Receives</label>
              <div style={{ display: 'flex', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '14px 16px', color: '#34d399', fontSize: '1.25rem', fontWeight: 800 }}>
                  {convertedAmount}
                </div>
                <select 
                  value={toCurrency} 
                  onChange={(e) => setToCurrency(e.target.value as any)} 
                  style={{ background: 'rgba(30, 41, 59, 0.95)', border: 'none', color: '#ffffff', fontWeight: 700, padding: '0 16px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value='USD'>USD ($)</option>
                  <option value='EUR'>EUR (€)</option>
                  <option value='GBP'>GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Savings Callout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 107, 61, 0.12)', border: '1px solid rgba(255, 107, 61, 0.25)', padding: '10px 14px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#fed7aa', fontWeight: 500 }}>Estimated Bank FX Markup Saved:</span>
              <span style={{ fontSize: '0.95rem', color: '#ff8057', fontWeight: 800 }}>+€{feeSaved}</span>
            </div>

            <a 
              href={signupUrl} 
              style={{ display: 'block', width: '100%', textAlign: 'center', padding: '14px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', borderRadius: '12px', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)' }}
            >
              Lock in Rate & Send Funds
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6-PILLAR CORE CAPABILITIES GRID
          ========================================================================= */}
      <section id='features' style={{ maxWidth: '1240px', margin: '0 auto', padding: '4rem 1.5rem 6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Engineered for Modern Global Velocity
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', margin: 0 }}>
            Everything you need to store, exchange, and transfer assets across borders with zero friction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.8rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 107, 61, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8057', marginBottom: '1.2rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>bolt</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Instant Internal P2P</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Zero-latency settlement between users using 8-digit internal Account Numbers with WebSocket state sync and zero network fees.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.8rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.2rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>language</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Dedicated European SEPA IBAN</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Direct European wire deposits and withdrawals assigned to your wallet for international banking.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.8rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '1.2rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>credit_card</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Virtual Debit Cards</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Generate secure virtual payment cards with on-demand CVV revelation and real-time spending controls.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.8rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.2rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>savings</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>2.29% AER Daily Yield Vaults</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Earn daily compounding interest with zero lock-in periods and instant liquid withdrawals.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.8rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.2rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>verified_user</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Instant Automated KYC</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Rapid automated identity verification connected straight to encrypted compliance storage.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.8rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.2rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>shield</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>2FA PIN & Idempotency</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              6-digit cryptographic PIN authorization and UUID idempotency protecting your assets 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMPARISON TABLE (VELTROPAY VS LEGACY BANKS)
          ========================================================================= */}
      <section id='comparison' style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Why Leading Businesses Choose VeltroPay
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            Compare modern velocity against traditional legacy banking friction.
          </p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '22px', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
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
          VERIFIED CUSTOMER TESTIMONIALS (WITH REAL PORTRAITS)
          ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Trusted by Global Operators & Remote Teams
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            Discover how founders, remote teams, and nomads manage money with VeltroPay.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '22px', padding: '2rem', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.7, margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>
              &ldquo;The 8-digit internal account transfers are literally instantaneous. We pay our distributed engineering team across 4 countries every Friday with zero friction.&rdquo;
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
          FAQ ACCORDION
          ========================================================================= */}
      <section id='faq' style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem 6rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0 }}>
            Everything you need to know about accounts, SEPA wire transfers, and security.
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
          HIGH-CONVERSION BOTTOM CTA BANNER
          ========================================================================= */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 6rem 1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '28px', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1.25rem 0', lineHeight: 1.15 }}>
              Ready for the next era of borderless banking?
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 2.2rem 0' }}>
              Open your free account in under 3 minutes. Zero setup fees, instant virtual cards, and dedicated European SEPA IBANs.
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
          FINTECH FOOTER
          ========================================================================= */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#05070d', padding: '4rem 1.5rem 2.5rem 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
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

          <div>
            <h5 style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Security & Trust</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><span style={{ color: '#94a3b8' }}>256-Bit AES Encryption</span></li>
              <li><span style={{ color: '#94a3b8' }}>6-Digit 2FA Transaction PIN</span></li>
              <li><span style={{ color: '#94a3b8' }}>Idempotency Protection</span></li>
              <li><span style={{ color: '#94a3b8' }}>Automated Identity KYC</span></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Portal Access</h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href={signupUrl} style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Create Free Account</a></li>
              <li><a href={loginUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Client Sign In</a></li>
              <li><a href={loginUrl} style={{ color: '#94a3b8', textDecoration: 'none' }}>Account Recovery</a></li>
            </ul>
          </div>
        </div>

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
