import React from 'react';

const Marketing: React.FC = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 3rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a202c' }}>Veltrobridge</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="https://login.veltrobridge.xyz" style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: '#3182ce', fontWeight: 'bold' }}>Log In</a>
          <a href="https://signup.veltrobridge.xyz" style={{ padding: '0.5rem 1rem', textDecoration: 'none', color: '#fff', backgroundColor: '#3182ce', borderRadius: '4px', fontWeight: 'bold' }}>Sign Up</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '4rem 3rem',
          backgroundColor: '#ebf8ff'
        }}>
        <div style={{ flex: 1, paddingRight: '2rem' }}>
          <h1 style={{ fontSize: '3rem', color: '#1a202c', marginBottom: '1rem' }}>The fastest way to send money globally.</h1>
          <p style={{ fontSize: '1.25rem', color: '#4a5568', marginBottom: '2rem', lineHeight: '1.6' }}>
            Join Veltrobridge today. Get an instant multi-currency account, verify your identity in minutes, and send money to anyone, anywhere, instantly.
          </p>
          <a href="https://signup.veltrobridge.xyz" style={{ padding: '1rem 2rem', fontSize: '1.25rem', textDecoration: 'none', color: '#fff', backgroundColor: '#3182ce', borderRadius: '6px', fontWeight: 'bold' }}>Get Started Now</a>
        </div>
        <div style={{ flex: 1 }}>
          <img 
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Banking app on phone" 
            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} 
          />
        </div>
      </header>

      {/* Features */}
      <section style={{ padding: '4rem 3rem', display: 'flex', gap: '2rem', backgroundColor: '#fff' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Lightning Fast</h3>
          <p style={{ color: '#4a5568' }}>Real-time balance updates and instant P2P transfers using our advanced WebSocket architecture.</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Secure KYC</h3>
          <p style={{ color: '#4a5568' }}>Bank-grade security with real-time Telegram-integrated KYC verification for peace of mind.</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Global IBANs</h3>
          <p style={{ color: '#4a5568' }}>Request personalized SEPA IBANs to receive external transfers with ease.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 3rem', backgroundColor: '#1a202c', color: '#cbd5e0', textAlign: 'center' }}>
        <p>&copy; 2026 Veltrobridge. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Marketing;
