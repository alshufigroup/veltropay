import React, { useState, useEffect, useContext, useMemo } from 'react';
import { api } from '../api';
import { AuthContext } from '../context/AuthContext';

interface UserWallet {
  id: number;
  account_number: string;
  currency: string;
  balance: number;
  is_frozen: boolean;
}

interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  kyc_status: string;
  email_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  transfer_disabled: boolean;
  transfer_disabled_reason?: string | null;
  is_frozen: boolean;
  freeze_reason?: string | null;
  avatar_url?: string | null;
  has_pin: boolean;
  created_at: string;
  wallets: UserWallet[];
  total_vaults: number;
}

interface AdminTransaction {
  id: number;
  sender_account: string;
  receiver_account: string;
  amount: number;
  currency: string;
  tx_type: string;
  description?: string | null;
  timestamp: string;
  status: string;
  is_reversed: boolean;
  reversal_reason?: string | null;
  reversal_tx_id?: number | null;
}

interface KYCItem {
  kyc_id: number;
  user_id: number;
  full_name: string;
  email: string;
  document_url: string;
  submitted_at: string;
  user_kyc_status: string;
}

interface SavingsVaultItem {
  vault_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  currency: string;
  balance: number;
  aer_rate: number;
  total_interest_earned: number;
  created_at: string;
  last_interest_at?: string | null;
}

interface OverviewData {
  metrics: {
    total_users: number;
    active_users: number;
    frozen_users: number;
    pending_kyc: number;
    total_transactions: number;
    total_vaults: number;
  };
  liquidity: {
    wallets: { EUR: number; USD: number; GBP: number };
    savings: { EUR: number; USD: number; GBP: number };
    total_custody_eur_equivalent: number;
  };
  recent_activity: AdminTransaction[];
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'kyc' | 'savings'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCItem[]>([]);
  const [savingsVaults, setSavingsVaults] = useState<SavingsVaultItem[]>([]);

  // Search & Filters
  const [userSearch, setUserSearch] = useState<string>('');
  const [txSearch, setTxSearch] = useState<string>('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dossierData, setDossierData] = useState<any>(null);
  const [dossierLoading, setDossierLoading] = useState<boolean>(false);

  // Fund Modal
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundCurrency, setFundCurrency] = useState('EUR');
  const [fundAmount, setFundAmount] = useState('');
  const [fundSenderLabel, setFundSenderLabel] = useState('Master Treasury Credit');
  const [fundNote, setFundNote] = useState('Administrative liquidity grant');
  const [fundLoading, setFundLoading] = useState(false);

  // Debit Modal
  const [debitModalOpen, setDebitModalOpen] = useState(false);
  const [debitCurrency, setDebitCurrency] = useState('EUR');
  const [debitAmount, setDebitAmount] = useState('');
  const [debitReason, setDebitReason] = useState('');
  const [debitForce, setDebitForce] = useState(false);
  const [debitLoading, setDebitLoading] = useState(false);

  // Freeze Modal
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeTargetState, setFreezeTargetState] = useState(true);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeLoading, setFreezeLoading] = useState(false);

  // Transfer Toggle Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetState, setTransferTargetState] = useState(true); // true = disabled
  const [transferReason, setTransferReason] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Reversal Modal
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<AdminTransaction | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [overviewRes, usersRes, txRes, kycRes, savingsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/transactions?limit=100'),
        api.get('/admin/kyc/pending'),
        api.get('/admin/savings')
      ]);

      setOverview(overviewRes.data);
      setUsers(usersRes.data || []);
      setTransactions(txRes.data?.transactions || []);
      setKycRequests(kycRes.data || []);
      setSavingsVaults(savingsRes.data || []);
      setActionError('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to connect to Master Admin Command API.';
      setActionError(msg);
      if (err.response?.status === 403 || err.response?.status === 401) {
        // Not authorized as admin
        setTimeout(() => {
          window.location.href = '/portal-admin-gate';
        }, 2000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 6000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 6000);
    }
  };

  // --- Handlers ---

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const num = parseFloat(fundAmount);
    if (isNaN(num) || num <= 0) {
      showNotification('Enter a valid funding amount greater than 0', true);
      return;
    }

    setFundLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/fund`, {
        currency: fundCurrency,
        amount: num,
        sender_label: fundSenderLabel.trim() || 'Master Treasury Credit',
        note: fundNote.trim() || 'Direct Liquidity Injection'
      });
      showNotification(res.data.message || 'Funding executed successfully.');
      setFundModalOpen(false);
      setFundAmount('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Funding failed', true);
    } finally {
      setFundLoading(false);
    }
  };

  const handleDebitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const num = parseFloat(debitAmount);
    if (isNaN(num) || num <= 0) {
      showNotification('Enter a valid debit amount', true);
      return;
    }
    if (!debitReason.trim()) {
      showNotification('A mandatory audit reason is required for administrative debiting.', true);
      return;
    }

    setDebitLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/debit`, {
        currency: debitCurrency,
        amount: num,
        reason: debitReason.trim(),
        force: debitForce
      });
      showNotification(res.data.message || 'Debit executed successfully.');
      setDebitModalOpen(false);
      setDebitAmount('');
      setDebitReason('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Debit failed', true);
    } finally {
      setDebitLoading(false);
    }
  };

  const handleFreezeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (freezeTargetState && !freezeReason.trim()) {
      showNotification('Please state the freeze reason (e.g. Compliance Audit, Suspicious Inflow).', true);
      return;
    }

    setFreezeLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/freeze`, {
        is_frozen: freezeTargetState,
        reason: freezeTargetState ? freezeReason.trim() : null
      });
      showNotification(res.data.message || 'Account freeze status updated.');
      setFreezeModalOpen(false);
      setFreezeReason('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Freeze operation failed', true);
    } finally {
      setFreezeLoading(false);
    }
  };

  const handleTransferToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (transferTargetState && !transferReason.trim()) {
      showNotification('Please state why transfer capability is being disabled for this user.', true);
      return;
    }

    setTransferLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/toggle-transfer`, {
        transfer_disabled: transferTargetState,
        reason: transferTargetState ? transferReason.trim() : null
      });
      showNotification(res.data.message || 'Transfer restriction updated.');
      setTransferModalOpen(false);
      setTransferReason('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Transfer restriction failed', true);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleStatusToggle = async (targetUser: AdminUser) => {
    const nextStatus = !targetUser.is_active;
    const confirmPrompt = nextStatus
      ? `Reinstate active account access for ${targetUser.full_name}?`
      : `Suspend all account access for ${targetUser.full_name}?`;

    if (!window.confirm(confirmPrompt)) return;

    try {
      const res = await api.post(`/admin/users/${targetUser.id}/status`, {
        is_active: nextStatus
      });
      showNotification(res.data.message || 'User status updated.');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Status update failed', true);
    }
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    if (!reversalReason.trim()) {
      showNotification('Please provide a stated reason for this transaction reversal.', true);
      return;
    }

    setReverseLoading(true);
    try {
      const res = await api.post(`/admin/transactions/${selectedTx.id}/reverse`, {
        reversal_reason: reversalReason.trim(),
        force: true
      });
      showNotification(res.data.message || 'Transaction reversed successfully.');
      setReverseModalOpen(false);
      setReversalReason('');
      setSelectedTx(null);
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Reversal failed', true);
    } finally {
      setReverseLoading(false);
    }
  };

  const handleKycReview = async (kycId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await api.post(`/admin/kyc/${kycId}/review`, {
        status: status
      });
      showNotification(res.data.message || `KYC ${status.toUpperCase()} successfully.`);
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'KYC review failed', true);
    }
  };

  const openDossier = async (userObj: AdminUser) => {
    setSelectedUser(userObj);
    setDossierLoading(true);
    try {
      const res = await api.get(`/admin/users/${userObj.id}`);
      setDossierData(res.data);
    } catch (err: any) {
      showNotification('Failed to load user dossier', true);
    } finally {
      setDossierLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const term = userSearch.toLowerCase();
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.wallets?.some(w => w.account_number.includes(term))
    );
  }, [users, userSearch]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = txTypeFilter ? t.tx_type === txTypeFilter : true;
      const term = txSearch.toLowerCase();
      const matchesSearch = term
        ? t.sender_account?.toLowerCase().includes(term) ||
          t.receiver_account?.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          t.id.toString().includes(term)
        : true;
      return matchesType && matchesSearch;
    });
  }, [transactions, txSearch, txTypeFilter]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f3f4f6',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(239, 68, 68, 0.2)',
          borderTop: '3px solid #ef4444',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Loading Master Command Center...</h2>
        <p style={{ fontSize: '13px', color: '#9ca3af' }}>Validating cryptographic authority & syncing Neon DB</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070a11',
      color: '#f3f4f6',
      fontFamily: "'Poppins', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* --- MASTER ADMIN TOP BAR --- */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                VeltroPay Master Admin
              </span>
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.05em'
              }}>
                ROOT AUTHORITY
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              Logged in: <strong style={{ color: '#e5e7eb' }}>groupalshufi@gmail.com</strong>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchData}
            disabled={refreshing}
            style={{
              background: 'rgba(31, 41, 55, 0.8)',
              border: '1px solid rgba(75, 85, 99, 0.4)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#d1d5db',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
              sync
            </span>
            <span>{refreshing ? 'Syncing...' : 'Refresh Data'}</span>
          </button>

          <a
            href="/home"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#93c5fd',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              account_balance_wallet
            </span>
            <span>Client Banking View</span>
          </a>

          <button
            onClick={logout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              logout
            </span>
            <span>Exit Portal</span>
          </button>
        </div>
      </header>

      {/* --- GLOBAL NOTIFICATIONS --- */}
      {actionSuccess && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#6ee7b7',
          padding: '12px 28px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 500
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          padding: '12px 28px',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 500
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          <span>{actionError}</span>
        </div>
      )}

      {/* --- DASHBOARD CONTENT WRAPPER --- */}
      <div style={{ padding: '28px', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* --- METRIC CARDS ROW --- */}
        {overview && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>TOTAL USERS</span>
                <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: '20px' }}>group</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff' }}>
                {overview.metrics.total_users}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {overview.metrics.active_users} Active • {overview.metrics.frozen_users} Frozen
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>GLOBAL CUSTODY</span>
                <span className="material-symbols-outlined" style={{ color: '#34d399', fontSize: '20px' }}>account_balance</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#34d399' }}>
                €{overview.liquidity.total_custody_eur_equivalent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                EUR, USD, GBP Liquidity + Vaults
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>PENDING KYC</span>
                <span className="material-symbols-outlined" style={{ color: '#fbbf24', fontSize: '20px' }}>verified_user</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: overview.metrics.pending_kyc > 0 ? '#fbbf24' : '#ffffff' }}>
                {overview.metrics.pending_kyc}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {overview.metrics.pending_kyc > 0 ? 'Action required in KYC Hub' : 'All submissions processed'}
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>LEDGER TRANSACTIONS</span>
                <span className="material-symbols-outlined" style={{ color: '#a78bfa', fontSize: '20px' }}>receipt_long</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff' }}>
                {overview.metrics.total_transactions}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                Total platform transfer volume
              </div>
            </div>
          </div>
        )}

        {/* --- NAVIGATION TABS --- */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
          marginBottom: '24px',
          paddingBottom: '2px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Overview & Liquidity', icon: 'dashboard' },
            { id: 'users', label: `Users Management (${users.length})`, icon: 'people' },
            { id: 'transactions', label: `Ledger & Reversals (${transactions.length})`, icon: 'currency_exchange' },
            { id: 'kyc', label: `KYC Approvals (${kycRequests.length})`, icon: 'badge' },
            { id: 'savings', label: `Savings Vaults (${savingsVaults.length})`, icon: 'savings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #ef4444' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                padding: '12px 18px',
                color: activeTab === tab.id ? '#fca5a5' : '#9ca3af',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB 1: OVERVIEW & LIQUIDITY BREAKDOWN --- */}
        {activeTab === 'overview' && overview && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '28px'
            }}>
              {/* Wallet Balances Box */}
              <div style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '20px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>wallet</span>
                  Custody in Primary Wallets
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(31, 41, 55, 0.5)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#d1d5db' }}>EUR (€) Pool</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>€{overview.liquidity.wallets.EUR.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(31, 41, 55, 0.5)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#d1d5db' }}>USD ($) Pool</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>${overview.liquidity.wallets.USD.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(31, 41, 55, 0.5)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#d1d5db' }}>GBP (£) Pool</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>£{overview.liquidity.wallets.GBP.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Savings Vaults Box */}
              <div style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '20px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#34d399' }}>savings</span>
                  Custody in High-Yield Savings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(31, 41, 55, 0.5)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#d1d5db' }}>EUR Savings (1.19% AER)</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>€{overview.liquidity.savings.EUR.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(31, 41, 55, 0.5)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#d1d5db' }}>USD Savings (1.49% AER)</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>${overview.liquidity.savings.USD.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(31, 41, 55, 0.5)', borderRadius: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#d1d5db' }}>GBP Savings (2.29% AER)</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>£{overview.liquidity.savings.GBP.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Global Activity */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>Recent System Ledger Activity</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.4)', color: '#9ca3af' }}>
                      <th style={{ padding: '10px 12px' }}>TX ID</th>
                      <th style={{ padding: '10px 12px' }}>TYPE</th>
                      <th style={{ padding: '10px 12px' }}>SENDER / FROM</th>
                      <th style={{ padding: '10px 12px' }}>RECIPIENT / TO</th>
                      <th style={{ padding: '10px 12px' }}>AMOUNT</th>
                      <th style={{ padding: '10px 12px' }}>STATUS</th>
                      <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recent_activity.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>#{tx.id}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: tx.tx_type === 'transfer' ? 'rgba(59, 130, 246, 0.15)' :
                                        tx.tx_type === 'deposit' ? 'rgba(16, 185, 129, 0.15)' :
                                        tx.tx_type === 'withdrawal' ? 'rgba(245, 158, 11, 0.15)' :
                                        tx.tx_type === 'reversal' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                            color: tx.tx_type === 'transfer' ? '#60a5fa' :
                                   tx.tx_type === 'deposit' ? '#34d399' :
                                   tx.tx_type === 'withdrawal' ? '#fbbf24' :
                                   tx.tx_type === 'reversal' ? '#fca5a5' : '#a78bfa',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {tx.tx_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#d1d5db' }}>{tx.sender_account}</td>
                        <td style={{ padding: '12px', color: '#d1d5db' }}>{tx.receiver_account}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: tx.is_reversed ? '#9ca3af' : '#fff' }}>
                          {tx.currency} {tx.amount.toFixed(2)}
                          {tx.is_reversed && <span style={{ color: '#ef4444', fontSize: '10px', marginLeft: '6px' }}>(REVERSED)</span>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            color: tx.status === 'completed' ? '#34d399' : tx.status === 'reversed' ? '#ef4444' : '#fbbf24',
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#9ca3af' }}>
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: USERS MANAGEMENT (CORE HUB) --- */}
        {activeTab === 'users' && (
          <div>
            {/* Search Bar & Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search by full name, email, or account number..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(75, 85, 99, 0.4)',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 42px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '20px'
                }}>
                  search
                </span>
              </div>
            </div>

            {/* Users Table */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                      <th style={{ padding: '14px 16px' }}>USER / IDENTIFIER</th>
                      <th style={{ padding: '14px 16px' }}>PRIMARY WALLET & BALANCES</th>
                      <th style={{ padding: '14px 16px' }}>KYC STATUS</th>
                      <th style={{ padding: '14px 16px' }}>TRANSFER STATUS</th>
                      <th style={{ padding: '14px 16px' }}>ACCOUNT STATE</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>MASTER ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>
                          No users found matching "{userSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: u.is_admin ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '14px',
                                color: '#fff',
                                flexShrink: 0
                              }}>
                                {u.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{u.full_name}</span>
                                  {u.is_admin && (
                                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '9px', padding: '1px 5px', borderRadius: '4px' }}>
                                      ADMIN
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px' }}>
                            {u.wallets && u.wallets.length > 0 ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#60a5fa', fontFamily: 'monospace' }}>
                                  ACC: {u.wallets[0].account_number}
                                </div>
                                <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                                  {u.wallets.map(w => `${w.currency} ${w.balance.toFixed(2)}`).join(' | ')}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>No wallet</span>
                            )}
                          </td>

                          <td style={{ padding: '16px' }}>
                            <span style={{
                              background: u.kyc_status === 'verified' || u.kyc_status === 'approved' ? 'rgba(16, 185, 129, 0.15)' :
                                          u.kyc_status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: u.kyc_status === 'verified' || u.kyc_status === 'approved' ? '#34d399' :
                                     u.kyc_status === 'pending' ? '#fbbf24' : '#fca5a5',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {u.kyc_status}
                            </span>
                          </td>

                          <td style={{ padding: '16px' }}>
                            {u.transfer_disabled ? (
                              <div>
                                <span style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#f87171',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600
                                }}>
                                  RESTRICTED
                                </span>
                                {u.transfer_disabled_reason && (
                                  <div style={{ fontSize: '10px', color: '#fca5a5', marginTop: '4px', maxWidth: '180px' }}>
                                    {u.transfer_disabled_reason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                ENABLED
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '16px' }}>
                            {u.is_frozen ? (
                              <div>
                                <span style={{
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#ef4444',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}>
                                  FROZEN
                                </span>
                                {u.freeze_reason && (
                                  <div style={{ fontSize: '10px', color: '#fca5a5', marginTop: '4px', maxWidth: '180px' }}>
                                    {u.freeze_reason}
                                  </div>
                                )}
                              </div>
                            ) : u.is_active ? (
                              <span style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                ACTIVE
                              </span>
                            ) : (
                              <span style={{
                                background: 'rgba(156, 163, 175, 0.2)',
                                color: '#9ca3af',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600
                              }}>
                                SUSPENDED
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {/* Fund Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setFundModalOpen(true);
                                }}
                                title="Fund User with Currency"
                                style={{
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  color: '#34d399',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add_circle</span>
                                <span>Fund</span>
                              </button>

                              {/* Debit Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setDebitModalOpen(true);
                                }}
                                title="Debit User"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#f87171',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove_circle</span>
                                <span>Debit</span>
                              </button>

                              {/* Freeze Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setFreezeTargetState(!u.is_frozen);
                                  setFreezeModalOpen(true);
                                }}
                                title={u.is_frozen ? 'Unfreeze Account' : 'Freeze Account & Funds'}
                                style={{
                                  background: u.is_frozen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                                  border: u.is_frozen ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)',
                                  color: u.is_frozen ? '#60a5fa' : '#fbbf24',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  {u.is_frozen ? 'lock_open' : 'lock'}
                                </span>
                                <span>{u.is_frozen ? 'Unfreeze' : 'Freeze'}</span>
                              </button>

                              {/* Transfer Restriction Toggle */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setTransferTargetState(!u.transfer_disabled);
                                  setTransferModalOpen(true);
                                }}
                                title={u.transfer_disabled ? 'Enable Transfers' : 'Disable Transfers (State Reason)'}
                                style={{
                                  background: u.transfer_disabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  border: u.transfer_disabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                                  color: u.transfer_disabled ? '#34d399' : '#fca5a5',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  {u.transfer_disabled ? 'check_circle' : 'block'}
                                </span>
                                <span>{u.transfer_disabled ? 'Allow Transfer' : 'Block Transfer'}</span>
                              </button>

                              {/* Suspend / Reinstate Toggle */}
                              <button
                                onClick={() => handleStatusToggle(u)}
                                title={u.is_active ? 'Suspend Account' : 'Reinstate Account'}
                                style={{
                                  background: 'rgba(31, 41, 55, 0.8)',
                                  border: '1px solid rgba(75, 85, 99, 0.4)',
                                  color: '#d1d5db',
                                  borderRadius: '8px',
                                  padding: '6px 8px',
                                  cursor: 'pointer'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                  {u.is_active ? 'pause_circle' : 'play_circle'}
                                </span>
                              </button>

                              {/* Dossier */}
                              <button
                                onClick={() => openDossier(u)}
                                title="View Complete Dossier"
                                style={{
                                  background: 'rgba(59, 130, 246, 0.15)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  color: '#93c5fd',
                                  borderRadius: '8px',
                                  padding: '6px 8px',
                                  cursor: 'pointer'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: LEDGER & REVERSALS --- */}
        {activeTab === 'transactions' && (
          <div>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search ledger by sender, recipient, description, or TX ID..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(75, 85, 99, 0.4)',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 42px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  fontSize: '20px'
                }}>
                  search
                </span>
              </div>

              {/* Type Filter */}
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                style={{
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Transaction Types</option>
                <option value="transfer">P2P Transfers</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="exchange">Currency Exchanges</option>
                <option value="admin_credit">Admin Credits</option>
                <option value="admin_debit">Admin Debits</option>
                <option value="reversal">Reversals</option>
              </select>
            </div>

            {/* Transactions Table */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                      <th style={{ padding: '14px 16px' }}>TX ID</th>
                      <th style={{ padding: '14px 16px' }}>TYPE</th>
                      <th style={{ padding: '14px 16px' }}>SENDER / FROM</th>
                      <th style={{ padding: '14px 16px' }}>RECIPIENT / TO</th>
                      <th style={{ padding: '14px 16px' }}>AMOUNT</th>
                      <th style={{ padding: '14px 16px' }}>DESCRIPTION</th>
                      <th style={{ padding: '14px 16px' }}>DATE</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>REVERSAL ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>
                          No transactions found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>#{tx.id}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: tx.tx_type === 'transfer' ? 'rgba(59, 130, 246, 0.15)' :
                                          tx.tx_type === 'deposit' ? 'rgba(16, 185, 129, 0.15)' :
                                          tx.tx_type === 'withdrawal' ? 'rgba(245, 158, 11, 0.15)' :
                                          tx.tx_type === 'reversal' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                              color: tx.tx_type === 'transfer' ? '#60a5fa' :
                                     tx.tx_type === 'deposit' ? '#34d399' :
                                     tx.tx_type === 'withdrawal' ? '#fbbf24' :
                                     tx.tx_type === 'reversal' ? '#fca5a5' : '#a78bfa',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}>
                              {tx.tx_type}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#d1d5db', fontFamily: 'monospace' }}>{tx.sender_account}</td>
                          <td style={{ padding: '14px 16px', color: '#d1d5db', fontFamily: 'monospace' }}>{tx.receiver_account}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: tx.is_reversed ? '#9ca3af' : '#fff' }}>
                            {tx.currency} {tx.amount.toFixed(2)}
                            {tx.is_reversed && (
                              <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>
                                REVERSED: {tx.reversal_reason}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: '12px' }}>{tx.description || '—'}</td>
                          <td style={{ padding: '14px 16px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {tx.is_reversed ? (
                              <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>Already Reversed</span>
                            ) : tx.tx_type === 'reversal' ? (
                              <span style={{ color: '#9ca3af', fontSize: '11px' }}>Reversal Entry</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedTx(tx);
                                  setReverseModalOpen(true);
                                }}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  color: '#fca5a5',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>undo</span>
                                <span>Reverse Tx</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: KYC VERIFICATION HUB --- */}
        {activeTab === 'kyc' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>
                Pending KYC Submissions Queue ({kycRequests.length})
              </h3>
              {kycRequests.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#34d399', marginBottom: '12px' }}>
                    check_circle
                  </span>
                  <div>All KYC verification requests have been processed! No pending items.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                  {kycRequests.map((k) => (
                    <div key={k.kyc_id} style={{
                      background: 'rgba(31, 41, 55, 0.6)',
                      border: '1px solid rgba(75, 85, 99, 0.4)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{k.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{k.email}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            Submitted: {new Date(k.submitted_at).toLocaleString()}
                          </div>
                        </div>
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          PENDING
                        </span>
                      </div>

                      {/* Document Viewer */}
                      <div style={{
                        background: 'rgba(17, 24, 39, 0.8)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#d1d5db' }}>
                          <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>file_present</span>
                          <span>Government ID Document</span>
                        </div>
                        <a
                          href={k.document_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#93c5fd',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Open Document</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
                        </a>
                      </div>

                      {/* Decision Buttons */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleKycReview(k.kyc_id, 'approved')}
                          style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                          <span>Approve KYC</span>
                        </button>

                        <button
                          onClick={() => handleKycReview(k.kyc_id, 'rejected')}
                          style={{
                            flex: 1,
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '10px',
                            padding: '10px',
                            color: '#fca5a5',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          <span>Reject KYC</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 5: SAVINGS VAULTS --- */}
        {activeTab === 'savings' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px 0' }}>
                Active User Savings Vaults & Daily Yield Compounding
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                      <th style={{ padding: '14px 16px' }}>VAULT ID</th>
                      <th style={{ padding: '14px 16px' }}>OWNER</th>
                      <th style={{ padding: '14px 16px' }}>CURRENCY</th>
                      <th style={{ padding: '14px 16px' }}>VAULT BALANCE</th>
                      <th style={{ padding: '14px 16px' }}>AER RATE</th>
                      <th style={{ padding: '14px 16px' }}>TOTAL INTEREST EARNED</th>
                      <th style={{ padding: '14px 16px' }}>LAST INTEREST PAYOUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsVaults.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>
                          No savings vaults created yet.
                        </td>
                      </tr>
                    ) : (
                      savingsVaults.map((v) => (
                        <tr key={v.vault_id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>Vault #{v.vault_id}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{v.user_name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{v.user_email}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>{v.currency}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#34d399' }}>
                            {v.currency} {v.balance.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#fbbf24', fontWeight: 600 }}>
                            {v.aer_rate}% AER
                          </td>
                          <td style={{ padding: '14px 16px', color: '#a78bfa', fontWeight: 600 }}>
                            +{v.currency} {v.total_interest_earned.toFixed(4)}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#9ca3af' }}>
                            {v.last_interest_at ? new Date(v.last_interest_at).toLocaleString() : 'Pending daily cycle'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* --- MODAL 1: FUND USER MODAL --- */}
      {/* ========================================================================= */}
      {fundModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399'
                }}>
                  <span className="material-symbols-outlined">add_card</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Direct Treasury Funding</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Credit {selectedUser.full_name} ({selectedUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setFundModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFundSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Select Currency</label>
                <select
                  value={fundCurrency}
                  onChange={(e) => setFundCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Amount to Credit</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5000.00"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Sender Label / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. VeltroPay Master Treasury"
                  value={fundSenderLabel}
                  onChange={(e) => setFundSenderLabel(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Approved wire clearance reference #8812"
                  value={fundNote}
                  onChange={(e) => setFundNote(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={fundLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: fundLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {fundLoading ? 'Executing Liquidity Grant...' : `Credit ${fundCurrency} ${parseFloat(fundAmount || '0').toFixed(2)} to User`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 2: DEBIT USER MODAL --- */}
      {/* ========================================================================= */}
      {debitModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171'
                }}>
                  <span className="material-symbols-outlined">remove_circle</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Direct Debit / Clawback</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Deduct from {selectedUser.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setDebitModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleDebitSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Select Currency</label>
                <select
                  value={debitCurrency}
                  onChange={(e) => setDebitCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Amount to Debit</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1000.00"
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>
                  Mandatory Audit Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Compliance dispute correction / chargeback settlement"
                  value={debitReason}
                  onChange={(e) => setDebitReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="debitForce"
                  checked={debitForce}
                  onChange={(e) => setDebitForce(e.target.checked)}
                />
                <label htmlFor="debitForce" style={{ fontSize: '12px', color: '#9ca3af', cursor: 'pointer' }}>
                  Force debit (allow balance to adjust regardless of threshold)
                </label>
              </div>

              <button
                type="submit"
                disabled={debitLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: debitLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {debitLoading ? 'Executing Debit...' : 'Execute Direct Debit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 3: FREEZE / UNFREEZE MODAL --- */}
      {/* ========================================================================= */}
      {freezeModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24'
                }}>
                  <span className="material-symbols-outlined">{freezeTargetState ? 'lock' : 'lock_open'}</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                    {freezeTargetState ? 'Freeze User Funds & Account' : 'Unfreeze Account'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Target: {selectedUser.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setFreezeModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleFreezeSubmit}>
              {freezeTargetState && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>
                    Reason for Freezing Funds <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unusual high-velocity transactions under compliance audit"
                    value={freezeReason}
                    onChange={(e) => setFreezeReason(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    This reason will be visible on the user's dashboard and whenever they attempt an action.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={freezeLoading}
                style={{
                  width: '100%',
                  background: freezeTargetState
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: freezeLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {freezeLoading ? 'Processing...' : freezeTargetState ? 'Confirm Account Freeze' : 'Lift Account Freeze'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 4: TRANSFER FEATURE TOGGLE MODAL --- */}
      {/* ========================================================================= */}
      {transferModalOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171'
                }}>
                  <span className="material-symbols-outlined">
                    {transferTargetState ? 'block' : 'check_circle'}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                    {transferTargetState ? 'Disable Transfer Feature' : 'Enable Transfer Feature'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>User: {selectedUser.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleTransferToggleSubmit}>
              {transferTargetState && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>
                    Mandatory Reason for Disabling Transfers <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Account under compliance review. KYC document update required."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    If the user tries to send money or withdraw, they will receive this exact explanation message.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={transferLoading}
                style={{
                  width: '100%',
                  background: transferTargetState
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: transferLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {transferLoading ? 'Updating...' : transferTargetState ? 'Disable Outbound Transfers' : 'Re-Enable Outbound Transfers'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 5: REVERSE TRANSACTION MODAL --- */}
      {/* ========================================================================= */}
      {reverseModalOpen && selectedTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f87171'
                }}>
                  <span className="material-symbols-outlined">undo</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Reverse Transaction #{selectedTx.id}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Atomic ledger rollback & refund</p>
                </div>
              </div>
              <button
                onClick={() => setReverseModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{
              background: 'rgba(31, 41, 55, 0.6)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Transaction Amount:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{selectedTx.currency} {selectedTx.amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Sender:</span>
                <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{selectedTx.sender_account}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Receiver:</span>
                <span style={{ fontFamily: 'monospace', color: '#34d399' }}>{selectedTx.receiver_account}</span>
              </div>
            </div>

            <form onSubmit={handleReverseSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>
                  Stated Reversal Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Erroneous payment / Fraudulent transfer recall"
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={reverseLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: reverseLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {reverseLoading ? 'Executing Atomic Reversal...' : 'Confirm Atomic Transaction Reversal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL 6: USER DOSSIER MODAL --- */}
      {/* ========================================================================= */}
      {selectedUser && dossierData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid rgba(75, 85, 99, 0.4)',
            borderRadius: '24px',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '16px'
                }}>
                  {dossierData.user.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{dossierData.user.full_name}</h3>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{dossierData.user.email} • ID #{dossierData.user.id}</div>
                </div>
              </div>
              <button
                onClick={() => setDossierData(null)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Wallets */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>Wallets</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {dossierData.wallets.map((w: any) => (
                  <div key={w.id} style={{ background: '#1f2937', padding: '12px', borderRadius: '12px', border: '1px solid #374151' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Account: {w.account_number}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                      {w.currency} {w.balance.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Dossier Transactions */}
            <div>
              <h4 style={{ fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>
                Recent User Transactions ({dossierData.transactions.length})
              </h4>
              <div style={{ maxHeight: '240px', overflowY: 'auto', background: '#1f2937', borderRadius: '12px', border: '1px solid #374151' }}>
                {dossierData.transactions.map((tx: any) => (
                  <div key={tx.id} style={{ padding: '10px 14px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>#{tx.id} • {tx.tx_type}</span>
                      <div style={{ color: '#9ca3af', fontSize: '11px' }}>{tx.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: tx.is_reversed ? '#ef4444' : '#34d399' }}>
                        {tx.currency} {tx.amount.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(tx.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
