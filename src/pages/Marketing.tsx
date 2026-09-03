import React from 'react';

const Marketing: React.FC = () => {
  return (
    <div className='marketing-page'>
      <div className='bg' />

      {/* Navigation */}
      <nav className='m-navbar'>
        <div className='m-logo'>
          <div className='m-logo-icon'>⚡</div>
          <span>VeltroPay</span>
        </div>
        <div className='m-nav-actions'>
          <a href='https://login.veltrobridge.xyz' className='m-btn-ghost'>
            Log In
          </a>
          <a href='https://signup.veltrobridge.xyz' className='m-btn-cta'>
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className='m-hero'>
        <div className='m-hero-content'>
          <div className='m-hero-badge'>
            <span>✨</span> Next-Gen Borderless Banking
          </div>
          <h1 className='m-hero-title'>
            The fastest way to send money globally.
          </h1>
          <p className='m-hero-desc'>
            Instant multi-currency accounts, real-time SEPA transfers, virtual debit cards, and frictionless Telegram-integrated KYC verification.
          </p>
          <div className='m-hero-buttons'>
            <a href='https://signup.veltrobridge.xyz' className='m-btn-hero-primary'>
              Open Free Account
              <span className='material-symbols-outlined'>arrow_forward</span>
            </a>
            <a href='https://login.veltrobridge.xyz' className='m-btn-hero-secondary'>
              Sign In to Portal
            </a>
          </div>
        </div>

        <div className='m-hero-visual'>
          <div className='m-hero-card-preview'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Total Balance
                </span>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, margin: '2px 0 0 0', color: '#fff' }}>
                  € 24,850<span style={{ fontSize: '1.2rem', color: '#93c5fd' }}>.00</span>
                </h3>
              </div>
              <div style={{ padding: '6px 14px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 600 }}>
                +12.4% Active
              </div>
            </div>

            {/* Mini Card Visualization */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #090d16 100%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              padding: '1.25rem 1.4rem',
              color: '#fff',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1px' }}>VeltroPay</span>
                <span className='material-symbols-outlined' style={{ color: '#93c5fd' }}>contactless</span>
              </div>
              <div style={{ fontSize: '1.1rem', letterSpacing: '3px', fontFamily: 'monospace', marginBottom: '1rem' }}>
                •••• •••• •••• 9075
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>PLATINUM DEBIT</span>
                <span>09 / 29</span>
              </div>
            </div>

            {/* Quick action pill row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 500, color: '#e2e8f0' }}>
                ⚡ Instant Transfer
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 500, color: '#e2e8f0' }}>
                🌍 SEPA IBAN
              </div>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 500, color: '#e2e8f0' }}>
                🔒 256-bit Secure
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className='m-features'>
        <div className='m-section-header'>
          <h2>Engineered for Global Velocity</h2>
          <p>Everything you need to manage, exchange, and transfer your assets across borders with zero hassle.</p>
        </div>

        <div className='m-features-grid'>
          <div className='m-feature-card'>
            <div className='m-feature-icon'>⚡</div>
            <h3>Real-Time Instant Transfers</h3>
            <p>Direct peer-to-peer settlement powered by high-speed WebSocket architecture with instant ledger synchronization.</p>
          </div>

          <div className='m-feature-card'>
            <div className='m-feature-icon'>🌍</div>
            <h3>Dedicated SEPA IBANs</h3>
            <p>Receive European and international wire transfers effortlessly with dedicated virtual account numbers assigned to your wallet.</p>
          </div>

          <div className='m-feature-card'>
            <div className='m-feature-icon'>🛡️</div>
            <h3>Telegram-Integrated KYC</h3>
            <p>Ultra-rapid automated identity verification connected straight to our secured review channels for near-instant account activation.</p>
          </div>

          <div className='m-feature-card'>
            <div className='m-feature-icon'>💳</div>
            <h3>Virtual Debit Cards</h3>
            <p>Generate secure virtual payment cards with on-demand CVV revelation and real-time spending controls.</p>
          </div>

          <div className='m-feature-card'>
            <div className='m-feature-icon'>💱</div>
            <h3>Multi-Currency Vaults</h3>
            <p>Hold, convert, and manage EUR, USD, and GBP seamlessly with competitive market exchange rates.</p>
          </div>

          <div className='m-feature-card'>
            <div className='m-feature-icon'>🔒</div>
            <h3>Bank-Grade Security</h3>
            <p>End-to-end encrypted sessions, OAuth2 JWT tokens, and strict access control protecting your wealth 24/7.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='m-footer'>
        <p>&copy; {new Date().getFullYear()} VeltroPay. All rights reserved. Fast, secure borderless multi-currency banking.</p>
      </footer>
    </div>
  );
};

export default Marketing;
