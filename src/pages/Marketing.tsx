import React from 'react';

const Marketing: React.FC = () => {
  const isSubdomainSetup = typeof window !== 'undefined' && window.location.hostname.endsWith('veltrobridge.xyz');
  const loginUrl = isSubdomainSetup ? 'https://login.veltrobridge.xyz' : '/login';
  const signupUrl = isSubdomainSetup ? 'https://signup.veltrobridge.xyz' : '/signup';

  return (
    <div className='marketing-page' style={{ minHeight: '100vh', background: '#090d16', color: '#ffffff', position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Background Glows */}
      <div style={{ position: 'fixed', top: '-15%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255, 107, 61, 0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Sticky Glass Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(9, 13, 22, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.4rem' }}>bolt</span>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>VeltroPay</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a 
              href={loginUrl} 
              style={{ padding: '8px 18px', color: '#cbd5e1', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s ease' }}
            >
              Sign In
            </a>
            <a 
              href={signupUrl} 
              style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none', borderRadius: '10px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Get Started
              <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>arrow_forward</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 1.5rem 4.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <span className='material-symbols-outlined' style={{ fontSize: '1.1rem', color: '#38bdf8' }}>auto_awesome</span>
            Next-Gen Borderless Banking
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.15, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 1.25rem 0' }}>
            The fastest way to send money globally.
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 2rem 0', maxWidth: '520px' }}>
            Instant multi-currency accounts, dedicated European SEPA IBANs, virtual debit cards, and frictionless automated KYC verification.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a 
              href={signupUrl} 
              style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #ff8057 0%, #ff5722 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none', borderRadius: '12px', boxShadow: '0 6px 20px rgba(255, 107, 61, 0.45)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s ease' }}
            >
              Open Free Account
              <span className='material-symbols-outlined' style={{ fontSize: '1.2rem' }}>arrow_forward</span>
            </a>

            <a 
              href={loginUrl} 
              style={{ padding: '14px 24px', background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', textDecoration: 'none', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}
            >
              Sign In to Portal
            </a>
          </div>

          {/* Trust Highlights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1rem' }}>check_circle</span>
              Zero Setup Fees
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1rem' }}>check_circle</span>
              Dedicated IBANs
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className='material-symbols-outlined' style={{ color: '#10b981', fontSize: '1rem' }}>check_circle</span>
              2FA PIN Protected
            </div>
          </div>
        </div>

        {/* Hero Visual Card Preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.14)', boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(59, 130, 246, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  Total Balance
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: '2px 0 0 0', color: '#ffffff' }}>
                  € 24,850<span style={{ fontSize: '1.2rem', color: '#93c5fd' }}>.00</span>
                </h3>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1rem' }}>trending_up</span>
                +12.4% Active
              </div>
            </div>

            {/* Virtual Card Visualization */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #090d16 100%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              color: '#ffffff',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', color: '#ffffff' }}>VeltroPay</span>
                <span className='material-symbols-outlined' style={{ color: '#93c5fd' }}>contactless</span>
              </div>
              <div style={{ fontSize: '1.15rem', letterSpacing: '3px', fontFamily: 'monospace', marginBottom: '1rem', color: '#ffffff', fontWeight: 600 }}>
                •••• •••• •••• 9075
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                <span>PLATINUM DEBIT</span>
                <span>09 / 29</span>
              </div>
            </div>

            {/* Quick Feature Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#ff8057' }}>bolt</span>
                Instant P2P
              </div>
              <div style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#60a5fa' }}>language</span>
                SEPA IBAN
              </div>
              <div style={{ padding: '10px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span className='material-symbols-outlined' style={{ fontSize: '1rem', color: '#34d399' }}>lock</span>
                Bank-Grade
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
            Engineered for Global Velocity
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            Everything you need to manage, exchange, and transfer your assets across borders with zero friction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 107, 61, 0.15)', border: '1px solid rgba(255, 107, 61, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8057', marginBottom: '1.25rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>bolt</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Real-Time Instant Transfers</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Direct peer-to-peer settlement powered by high-speed WebSocket architecture with instant 8-digit account routing.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.25rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>language</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Dedicated European SEPA IBANs</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Receive European and international wire transfers effortlessly with dedicated virtual account numbers assigned to your wallet.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '1.25rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>verified_user</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Instant KYC Verification</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Ultra-rapid automated identity verification connected straight to encrypted compliance storage for immediate activation.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', marginBottom: '1.25rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>credit_card</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Virtual Debit Cards</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Generate secure virtual payment cards with on-demand CVV revelation and real-time spending controls.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '1.25rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>savings</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Multi-Currency Vaults</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Hold, convert, and manage EUR, USD, and GBP with competitive market exchange rates and daily compounding AER interest.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(16px)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '1.25rem' }}>
              <span className='material-symbols-outlined' style={{ fontSize: '1.6rem' }}>shield</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Bank-Grade Security</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              6-digit 2FA Transaction PIN authorization, idempotency deduplication, and OAuth2 JWT authentication protecting your funds 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem 1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#ffffff' }}>VeltroPay</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div>
            Fast, secure borderless multi-currency banking.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;
