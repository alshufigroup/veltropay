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
  assigned_iban?: string | null;
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

interface PendingWithdrawal {
  id: number;
  sender_account: string;
  receiver_iban: string;
  amount: number;
  currency: string;
  description?: string | null;
  status: string;
  timestamp: string;
  user_id?: number | null;
  user_name: string;
  user_email: string;
}

interface IBANRequestItem {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  status: string;
  currency: string;
  assigned_iban?: string | null;
  assigned_bic?: string | null;
  assigned_name?: string | null;
  requested_at: string;
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

interface AuditLogItem {
  id: number;
  admin_email: string;
  action_type: string;
  target_user_id?: number | null;
  target_user_email?: string | null;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
}

interface NoticeItem {
  id: number;
  user_id?: number | null;
  target_name: string;
  title: string;
  message: string;
  notice_type: string;
  is_read: boolean;
  created_at: string;
}

interface OverviewData {
  metrics: {
    total_users: number;
    active_users: number;
    frozen_users: number;
    pending_kyc: number;
    pending_withdrawals: number;
    pending_iban_requests: number;
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
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'withdrawals' | 'iban' | 'transactions' | 'kyc' | 'savings' | 'notices' | 'wire' | 'audit' | 'exports'
  >('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [ibanRequests, setIbanRequests] = useState<IBANRequestItem[]>([]);
  const [kycRequests, setKycRequests] = useState<KYCItem[]>([]);
  const [savingsVaults, setSavingsVaults] = useState<SavingsVaultItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  // Search & Filters
  const [userSearch, setUserSearch] = useState<string>('');
  const [txSearch, setTxSearch] = useState<string>('');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('');
  const [auditSearch, setAuditSearch] = useState<string>('');

  // Selected entities for modals
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [dossierData, setDossierData] = useState<any>(null);

  // Modals state
  // 1. Fund Modal
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundCurrency, setFundCurrency] = useState('EUR');
  const [fundAmount, setFundAmount] = useState('');
  const [fundSenderLabel, setFundSenderLabel] = useState('Master Treasury Credit');
  const [fundNote, setFundNote] = useState('Administrative liquidity grant');
  const [fundLoading, setFundLoading] = useState(false);

  // 2. Debit Modal
  const [debitModalOpen, setDebitModalOpen] = useState(false);
  const [debitCurrency, setDebitCurrency] = useState('EUR');
  const [debitAmount, setDebitAmount] = useState('');
  const [debitReason, setDebitReason] = useState('');
  const [debitForce, setDebitForce] = useState(false);
  const [debitLoading, setDebitLoading] = useState(false);

  // 3. Freeze Modal
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [freezeTargetState, setFreezeTargetState] = useState(true);
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeLoading, setFreezeLoading] = useState(false);

  // 4. Transfer Toggle Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferTargetState, setTransferTargetState] = useState(true);
  const [transferReason, setTransferReason] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // 5. Reversal Modal
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<AdminTransaction | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);

  // 6. Settle Withdrawal Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<PendingWithdrawal | null>(null);
  const [settleAction, setSettleAction] = useState<'completed' | 'rejected'>('completed');
  const [settleUtr, setSettleUtr] = useState('');
  const [settleRejectReason, setSettleRejectReason] = useState('');
  const [settleLoading, setSettleLoading] = useState(false);

  // 7. Assign IBAN Modal
  const [ibanModalOpen, setIbanModalOpen] = useState(false);
  const [selectedIbanReq, setSelectedIbanReq] = useState<IBANRequestItem | null>(null);
  const [assignIbanVal, setAssignIbanVal] = useState('');
  const [assignBicVal, setAssignBicVal] = useState('VELTBEE1XXX');
  const [assignNameVal, setAssignNameVal] = useState('');
  const [ibanLoading, setIbanLoading] = useState(false);

  // 8. Security Overrides Modal (PIN / Email / Password)
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // 9. In-App Notice Create Modal
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeTargetUserId, setNoticeTargetUserId] = useState<string>(''); // empty = all
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeType, setNoticeType] = useState('info');
  const [noticeLoading, setNoticeLoading] = useState(false);

  // 10. Institutional Wire Simulator Modal
  const [wireModalOpen, setWireModalOpen] = useState(false);
  const [wireUserId, setWireUserId] = useState<number>(0);
  const [wireAmount, setWireAmount] = useState('');
  const [wireCurrency, setWireCurrency] = useState('EUR');
  const [wireBankPreset, setWireBankPreset] = useState('JPMorgan Chase Bank, N.A.');
  const [wireSenderName, setWireSenderName] = useState('JPMorgan Institutional Wire Settlement');
  const [wireRef, setWireRef] = useState('');
  const [wireNote, setWireNote] = useState('Commercial Inward Wire Clearance');
  const [wireLoading, setWireLoading] = useState(false);

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [overviewRes, usersRes, txRes, withRes, ibanRes, kycRes, savingsRes, auditRes, noticesRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/transactions?limit=100'),
        api.get('/admin/withdrawals/pending'),
        api.get('/admin/iban-requests'),
        api.get('/admin/kyc/pending'),
        api.get('/admin/savings'),
        api.get('/admin/audit-logs?limit=100'),
        api.get('/admin/notices')
      ]);

      setOverview(overviewRes.data);
      setUsers(usersRes.data || []);
      setTransactions(txRes.data?.transactions || []);
      setPendingWithdrawals(withRes.data || []);
      setIbanRequests(ibanRes.data || []);
      setKycRequests(kycRes.data || []);
      setSavingsVaults(savingsRes.data || []);
      setAuditLogs(auditRes.data || []);
      setNotices(noticesRes.data || []);
      setActionError('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to connect to Master Admin Command API.';
      setActionError(msg);
      if (err.response?.status === 403 || err.response?.status === 401) {
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

  // Settle / Reject Withdrawal
  const handleWithdrawalSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    if (settleAction === 'rejected' && !settleRejectReason.trim()) {
      showNotification('Please state the rejection and auto-refund reason.', true);
      return;
    }

    setSettleLoading(true);
    try {
      const res = await api.post(`/admin/withdrawals/${selectedWithdrawal.id}/settle`, {
        status: settleAction,
        utr_reference: settleUtr.trim() || undefined,
        rejection_reason: settleRejectReason.trim() || undefined
      });
      showNotification(res.data.message || 'Withdrawal action completed.');
      setSettleModalOpen(false);
      setSelectedWithdrawal(null);
      setSettleUtr('');
      setSettleRejectReason('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to settle withdrawal', true);
    } finally {
      setSettleLoading(false);
    }
  };

  // Assign IBAN
  const handleAssignIbanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIban = assignIbanVal.trim().replace(/\s/g, '').toUpperCase();
    if (cleanIban.length < 15) {
      showNotification('Please enter a valid IBAN number (at least 15 characters).', true);
      return;
    }

    setIbanLoading(true);
    try {
      let res;
      if (selectedIbanReq) {
        res = await api.post(`/admin/iban-requests/${selectedIbanReq.id}/assign`, {
          assigned_iban: cleanIban,
          assigned_bic: assignBicVal.trim() || 'VELTBEE1XXX',
          assigned_name: assignNameVal.trim() || undefined
        });
      } else if (selectedUser) {
        res = await api.post(`/admin/users/${selectedUser.id}/assign-iban`, {
          assigned_iban: cleanIban,
          assigned_bic: assignBicVal.trim() || 'VELTBEE1XXX',
          assigned_name: assignNameVal.trim() || selectedUser.full_name
        });
      }

      showNotification(res?.data?.message || 'IBAN assigned successfully.');
      setIbanModalOpen(false);
      setSelectedIbanReq(null);
      setAssignIbanVal('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to assign IBAN', true);
    } finally {
      setIbanLoading(false);
    }
  };

  // Security Overrides (PIN reset, Email verify, Password reset)
  const handleResetPin = async (userObj: AdminUser, clear = true) => {
    setSecurityLoading(true);
    try {
      const res = await api.post(`/admin/users/${userObj.id}/reset-pin`, {
        new_pin: clear ? null : newPinInput.trim()
      });
      showNotification(res.data.message || 'PIN updated.');
      setNewPinInput('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'PIN reset failed', true);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleVerifyEmailOverride = async (userObj: AdminUser) => {
    try {
      const res = await api.post(`/admin/users/${userObj.id}/verify-email-override`);
      showNotification(res.data.message || 'Email verified.');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Verification override failed', true);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPasswordInput.length < 6) {
      showNotification('Password must be at least 6 characters.', true);
      return;
    }

    setSecurityLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedUser.id}/set-password`, {
        new_password: newPasswordInput
      });
      showNotification(res.data.message || 'Password updated.');
      setNewPasswordInput('');
      setSecurityModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to update password', true);
    } finally {
      setSecurityLoading(false);
    }
  };

  // In-App Notice Create
  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      showNotification('Title and message are required for in-app notice.', true);
      return;
    }

    setNoticeLoading(true);
    try {
      const res = await api.post('/admin/notices', {
        user_id: noticeTargetUserId ? parseInt(noticeTargetUserId) : null,
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        notice_type: noticeType
      });
      showNotification(res.data.message || 'Notice created.');
      setNoticeModalOpen(false);
      setNoticeTitle('');
      setNoticeMessage('');
      setNoticeTargetUserId('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Failed to dispatch notice', true);
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleDeleteNotice = async (id: number) => {
    try {
      await api.delete(`/admin/notices/${id}`);
      showNotification('Notice removed.');
      fetchData();
    } catch (err: any) {
      showNotification('Failed to delete notice', true);
    }
  };

  // Institutional Wire Simulation
  const handleWireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(wireAmount);
    if (isNaN(num) || num <= 0) {
      showNotification('Enter a valid wire amount.', true);
      return;
    }
    if (!wireUserId) {
      showNotification('Select a target user for the incoming wire.', true);
      return;
    }

    setWireLoading(true);
    try {
      const res = await api.post('/admin/simulate-wire', {
        user_id: wireUserId,
        amount: num,
        currency: wireCurrency,
        sender_bank: wireBankPreset,
        sender_name: wireSenderName,
        reference: wireRef.trim() || undefined,
        note: wireNote.trim() || 'Institutional Wire Settlement'
      });
      showNotification(res.data.message || 'Wire simulation executed.');
      setWireModalOpen(false);
      setWireAmount('');
      setWireRef('');
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.detail || 'Wire injection failed', true);
    } finally {
      setWireLoading(false);
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
    try {
      const res = await api.get(`/admin/users/${userObj.id}`);
      setDossierData(res.data);
    } catch (err: any) {
      showNotification('Failed to load user dossier', true);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const term = userSearch.toLowerCase();
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.wallets?.some(w => w.account_number.includes(term)) ||
      (u.assigned_iban && u.assigned_iban.toLowerCase().includes(term))
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

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    if (!auditSearch.trim()) return auditLogs;
    const term = auditSearch.toLowerCase();
    return auditLogs.filter(a =>
      a.action_type.toLowerCase().includes(term) ||
      a.admin_email.toLowerCase().includes(term) ||
      (a.target_user_email && a.target_user_email.toLowerCase().includes(term)) ||
      (a.details && a.details.toLowerCase().includes(term))
    );
  }, [auditLogs, auditSearch]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setWireModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.3))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#93c5fd',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>account_balance</span>
            <span>Simulate Wire</span>
          </button>

          <button
            onClick={() => setNoticeModalOpen(true)}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: '#fde68a',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>campaign</span>
            <span>Broadcast Notice</span>
          </button>

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
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
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
              wallet
            </span>
            <span>Banking View</span>
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
            <span>Exit</span>
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
      <div style={{ padding: '28px', maxWidth: '1480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* --- METRIC CARDS ROW --- */}
        {overview && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '16px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>TOTAL USERS</span>
                <span className="material-symbols-outlined" style={{ color: '#60a5fa', fontSize: '18px' }}>group</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
                {overview.metrics.total_users}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                {overview.metrics.active_users} Active • {overview.metrics.frozen_users} Frozen
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '16px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>TOTAL CUSTODY (EUR EQ)</span>
                <span className="material-symbols-outlined" style={{ color: '#34d399', fontSize: '18px' }}>account_balance</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>
                €{overview.liquidity.total_custody_eur_equivalent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                Wallets + Savings Vaults Pool
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '16px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>PENDING WITHDRAWALS</span>
                <span className="material-symbols-outlined" style={{ color: '#f87171', fontSize: '18px' }}>output</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: overview.metrics.pending_withdrawals > 0 ? '#f87171' : '#ffffff' }}>
                {overview.metrics.pending_withdrawals}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                {overview.metrics.pending_withdrawals > 0 ? 'Requires wire settlement/refund' : 'All wires settled'}
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '16px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>PENDING KYC</span>
                <span className="material-symbols-outlined" style={{ color: '#fbbf24', fontSize: '18px' }}>verified_user</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: overview.metrics.pending_kyc > 0 ? '#fbbf24' : '#ffffff' }}>
                {overview.metrics.pending_kyc}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                {overview.metrics.pending_kyc > 0 ? 'Action in KYC Queue' : 'Queue clear'}
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '16px',
              padding: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>IBAN REQUESTS</span>
                <span className="material-symbols-outlined" style={{ color: '#a78bfa', fontSize: '18px' }}>badge</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>
                {overview.metrics.pending_iban_requests}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                Pending virtual IBAN assignments
              </div>
            </div>
          </div>
        )}

        {/* --- NAVIGATION TABS --- */}
        <div style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid rgba(75, 85, 99, 0.3)',
          marginBottom: '24px',
          paddingBottom: '2px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'users', label: `Users (${users.length})`, icon: 'people' },
            { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})`, icon: 'output' },
            { id: 'iban', label: `IBAN Allocator (${ibanRequests.length})`, icon: 'credit_card' },
            { id: 'transactions', label: `Ledger (${transactions.length})`, icon: 'currency_exchange' },
            { id: 'kyc', label: `KYC (${kycRequests.length})`, icon: 'badge' },
            { id: 'savings', label: `Savings (${savingsVaults.length})`, icon: 'savings' },
            { id: 'notices', label: `Notices (${notices.length})`, icon: 'campaign' },
            { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: 'history' },
            { id: 'exports', label: 'Export Data (CSV)', icon: 'download' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                background: activeTab === tab.id ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #ef4444' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                padding: '10px 14px',
                color: activeTab === tab.id ? '#fca5a5' : '#9ca3af',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* --- TAB 1: OVERVIEW & LIQUIDITY --- */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && overview && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginBottom: '28px'
            }}>
              <div style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '20px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#60a5fa' }}>wallet</span>
                  Primary Wallets Custody Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

              <div style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '20px',
                padding: '24px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#34d399' }}>savings</span>
                  High-Yield Savings Vaults Custody
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

            {/* Recent Activity Table */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>Latest Global Activity</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.4)', color: '#9ca3af' }}>
                      <th style={{ padding: '10px 12px' }}>TX ID</th>
                      <th style={{ padding: '10px 12px' }}>TYPE</th>
                      <th style={{ padding: '10px 12px' }}>SENDER</th>
                      <th style={{ padding: '10px 12px' }}>RECIPIENT</th>
                      <th style={{ padding: '10px 12px' }}>AMOUNT</th>
                      <th style={{ padding: '10px 12px' }}>STATUS</th>
                      <th style={{ padding: '10px 12px' }}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recent_activity.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>#{tx.id}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            padding: '2px 8px',
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
                        <td style={{ padding: '12px', fontWeight: 700, color: tx.is_reversed ? '#ef4444' : '#fff' }}>
                          {tx.currency} {tx.amount.toFixed(2)}
                          {tx.is_reversed && <span style={{ fontSize: '10px', color: '#ef4444', marginLeft: '4px' }}>(REV)</span>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: tx.status === 'completed' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#9ca3af' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- TAB 2: USERS MANAGEMENT & SECURITY OVERRIDES --- */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search users by name, email, account, or IBAN..."
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
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>
                  search
                </span>
              </div>
            </div>

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
                      <th style={{ padding: '14px 16px' }}>USER / ID</th>
                      <th style={{ padding: '14px 16px' }}>ACCOUNTS & IBAN</th>
                      <th style={{ padding: '14px 16px' }}>KYC / EMAIL</th>
                      <th style={{ padding: '14px 16px' }}>TRANSFER / FREEZE</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>MASTER ACTIONS & OVERRIDES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>No users found matching query.</td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: u.is_admin ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: '#fff'
                              }}>
                                {u.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{u.full_name}</span>
                                  {u.is_admin && <span style={{ background: '#ef4444', color: '#fff', fontSize: '9px', padding: '1px 5px', borderRadius: '4px' }}>ADMIN</span>}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{u.email} • ID #{u.id}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px' }}>
                            {u.wallets && u.wallets.length > 0 ? (
                              <div>
                                <div style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600, fontSize: '12px' }}>
                                  ACC: {u.wallets[0].account_number}
                                </div>
                                <div style={{ color: '#34d399', fontWeight: 600, fontSize: '12px', marginTop: '2px' }}>
                                  {u.wallets.map(w => `${w.currency} ${w.balance.toFixed(2)}`).join(' | ')}
                                </div>
                                {u.assigned_iban ? (
                                  <div style={{ fontSize: '10px', color: '#a78bfa', fontFamily: 'monospace', marginTop: '2px' }}>
                                    IBAN: {u.assigned_iban}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '10px', color: '#6b7280' }}>No virtual IBAN</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>No wallet</span>
                            )}
                          </td>

                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{
                                background: u.kyc_status === 'verified' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: u.kyc_status === 'verified' ? '#34d399' : '#fbbf24',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                width: 'fit-content'
                              }}>
                                KYC: {u.kyc_status}
                              </span>

                              <span style={{
                                background: u.email_verified ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: u.email_verified ? '#60a5fa' : '#f87171',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 600,
                                width: 'fit-content'
                              }}>
                                {u.email_verified ? 'Email Verified' : 'Email Unverified'}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {u.transfer_disabled ? (
                                <span style={{ color: '#f87171', fontSize: '11px', fontWeight: 600 }}>🚫 Transfer Restricted</span>
                              ) : (
                                <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 600 }}>✅ Transfer Allowed</span>
                              )}

                              {u.is_frozen ? (
                                <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700 }}>🔒 ACCOUNT FROZEN</span>
                              ) : u.is_active ? (
                                <span style={{ color: '#9ca3af', fontSize: '11px' }}>Status: Active</span>
                              ) : (
                                <span style={{ color: '#ef4444', fontSize: '11px' }}>Status: Suspended</span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {/* Fund */}
                              <button
                                onClick={() => { setSelectedUser(u); setFundModalOpen(true); }}
                                title="Credit Funds"
                                style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>add_circle</span>
                                <span>Fund</span>
                              </button>

                              {/* Debit */}
                              <button
                                onClick={() => { setSelectedUser(u); setDebitModalOpen(true); }}
                                title="Clawback / Debit"
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>remove_circle</span>
                                <span>Debit</span>
                              </button>

                              {/* Freeze */}
                              <button
                                onClick={() => { setSelectedUser(u); setFreezeTargetState(!u.is_frozen); setFreezeModalOpen(true); }}
                                title={u.is_frozen ? 'Unfreeze Account' : 'Freeze Account & Funds'}
                                style={{ background: u.is_frozen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.15)', border: u.is_frozen ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)', color: u.is_frozen ? '#60a5fa' : '#fbbf24', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{u.is_frozen ? 'lock_open' : 'lock'}</span>
                                <span>{u.is_frozen ? 'Unfreeze' : 'Freeze'}</span>
                              </button>

                              {/* Toggle Transfer */}
                              <button
                                onClick={() => { setSelectedUser(u); setTransferTargetState(!u.transfer_disabled); setTransferModalOpen(true); }}
                                title={u.transfer_disabled ? 'Enable Outbound Transfers' : 'Disable Outbound Transfers'}
                                style={{ background: u.transfer_disabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: u.transfer_disabled ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)', color: u.transfer_disabled ? '#34d399' : '#fca5a5', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>{u.transfer_disabled ? 'check_circle' : 'block'}</span>
                                <span>{u.transfer_disabled ? 'Allow Transfer' : 'Block Transfer'}</span>
                              </button>

                              {/* Assign IBAN */}
                              <button
                                onClick={() => { setSelectedUser(u); setSelectedIbanReq(null); setAssignNameVal(u.full_name); setIbanModalOpen(true); }}
                                title="Assign Custom Virtual IBAN"
                                style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#c4b5fd', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>badge</span>
                                <span>IBAN</span>
                              </button>

                              {/* Security Overrides Button */}
                              <button
                                onClick={() => { setSelectedUser(u); setSecurityModalOpen(true); }}
                                title="Security Overrides (PIN, Password, Email)"
                                style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', borderRadius: '8px', padding: '5px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>key</span>
                                <span>Security</span>
                              </button>

                              {/* Dossier */}
                              <button
                                onClick={() => openDossier(u)}
                                title="Full User Dossier"
                                style={{ background: 'rgba(75, 85, 99, 0.4)', border: '1px solid rgba(75, 85, 99, 0.6)', color: '#d1d5db', borderRadius: '8px', padding: '5px 7px', cursor: 'pointer' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>visibility</span>
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

        {/* ========================================================================= */}
        {/* --- TAB 3: WITHDRAWALS & WIRE SETTLEMENT HUB --- */}
        {/* ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#f87171' }}>output</span>
                Outbound SEPA Wire Settlements Queue ({pendingWithdrawals.length})
              </h3>
              {pendingWithdrawals.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#34d399', marginBottom: '10px' }}>
                    check_circle
                  </span>
                  <div>No pending withdrawal requests. All outward wires have been settled or refunded!</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                        <th style={{ padding: '12px 14px' }}>TX ID</th>
                        <th style={{ padding: '12px 14px' }}>USER</th>
                        <th style={{ padding: '12px 14px' }}>DESTINATION IBAN</th>
                        <th style={{ padding: '12px 14px' }}>AMOUNT</th>
                        <th style={{ padding: '12px 14px' }}>DETAILS</th>
                        <th style={{ padding: '12px 14px' }}>SUBMITTED</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>SETTLEMENT ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingWithdrawals.map((w) => (
                        <tr key={w.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '14px', fontWeight: 600 }}>#{w.id}</td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{w.user_name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{w.user_email}</div>
                          </td>
                          <td style={{ padding: '14px', fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600 }}>
                            {w.receiver_iban}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 700, color: '#f87171' }}>
                            {w.currency} {w.amount.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px', color: '#9ca3af', fontSize: '12px' }}>{w.description}</td>
                          <td style={{ padding: '14px', color: '#9ca3af' }}>{new Date(w.timestamp).toLocaleString()}</td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setSettleAction('completed');
                                  setSettleModalOpen(true);
                                }}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  color: '#fff',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                                <span>Settle & Complete</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setSettleAction('rejected');
                                  setSettleModalOpen(true);
                                }}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  color: '#fca5a5',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>undo</span>
                                <span>Reject & Refund</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- TAB 4: VIRTUAL IBAN ALLOCATION HUB --- */}
        {/* ========================================================================= */}
        {activeTab === 'iban' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#a78bfa' }}>credit_card</span>
                  Virtual European IBAN & UK Account Allocator
                </h3>
              </div>

              {ibanRequests.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>
                  No active IBAN assignment requests recorded. You can directly assign IBANs from the Users tab.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                        <th style={{ padding: '12px 14px' }}>REQ ID</th>
                        <th style={{ padding: '12px 14px' }}>USER</th>
                        <th style={{ padding: '12px 14px' }}>CURRENCY</th>
                        <th style={{ padding: '12px 14px' }}>ASSIGNED IBAN</th>
                        <th style={{ padding: '12px 14px' }}>ASSIGNED BIC</th>
                        <th style={{ padding: '12px 14px' }}>STATUS</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ibanRequests.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '14px', fontWeight: 600 }}>#{r.id}</td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{r.user_name}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.user_email}</div>
                          </td>
                          <td style={{ padding: '14px', fontWeight: 600 }}>{r.currency}</td>
                          <td style={{ padding: '14px', fontFamily: 'monospace', color: '#a78bfa', fontWeight: 600 }}>
                            {r.assigned_iban || 'Pending Assignment'}
                          </td>
                          <td style={{ padding: '14px', fontFamily: 'monospace', color: '#d1d5db' }}>{r.assigned_bic || '—'}</td>
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              background: r.status === 'assigned' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: r.status === 'assigned' ? '#34d399' : '#fbbf24',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                setSelectedIbanReq(r);
                                setSelectedUser(null);
                                setAssignIbanVal(r.assigned_iban || '');
                                setAssignBicVal(r.assigned_bic || 'VELTBEE1XXX');
                                setAssignNameVal(r.assigned_name || r.user_name);
                                setIbanModalOpen(true);
                              }}
                              style={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '1px solid rgba(139, 92, 246, 0.4)',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                color: '#c4b5fd',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {r.status === 'assigned' ? 'Edit IBAN' : 'Assign IBAN'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- TAB 5: LEDGER & REVERSALS --- */}
        {/* ========================================================================= */}
        {activeTab === 'transactions' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
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
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>
                  search
                </span>
              </div>

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
                <option value="deposit">Deposits / Wires</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="exchange">Currency Exchanges</option>
                <option value="admin_credit">Admin Grants</option>
                <option value="admin_debit">Admin Debits</option>
                <option value="reversal">Reversals</option>
              </select>
            </div>

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
                        <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>No transactions found matching query.</td>
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

        {/* ========================================================================= */}
        {/* --- TAB 6: IN-APP NOTICES & BROADCASTS --- */}
        {/* ========================================================================= */}
        {activeTab === 'notices' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: '#fbbf24' }}>campaign</span>
                  In-App Directive Notices & Platform Broadcasts
                </h3>
                <button
                  onClick={() => setNoticeModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                  <span>Create Notice</span>
                </button>
              </div>

              {notices.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>No active notices dispatched.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                        <th style={{ padding: '12px 14px' }}>ID</th>
                        <th style={{ padding: '12px 14px' }}>TARGET</th>
                        <th style={{ padding: '12px 14px' }}>TYPE</th>
                        <th style={{ padding: '12px 14px' }}>TITLE</th>
                        <th style={{ padding: '12px 14px' }}>MESSAGE</th>
                        <th style={{ padding: '12px 14px' }}>DATE</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map((n) => (
                        <tr key={n.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '14px', fontWeight: 600 }}>#{n.id}</td>
                          <td style={{ padding: '14px', fontWeight: 600, color: n.user_id ? '#93c5fd' : '#fbbf24' }}>
                            {n.target_name}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <span style={{
                              background: n.notice_type === 'urgent' ? 'rgba(239, 68, 68, 0.2)' :
                                          n.notice_type === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: n.notice_type === 'urgent' ? '#f87171' :
                                     n.notice_type === 'warning' ? '#fbbf24' : '#60a5fa',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}>
                              {n.notice_type}
                            </span>
                          </td>
                          <td style={{ padding: '14px', fontWeight: 600, color: '#fff' }}>{n.title}</td>
                          <td style={{ padding: '14px', color: '#d1d5db' }}>{n.message}</td>
                          <td style={{ padding: '14px', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleString()}</td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteNotice(n.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- TAB 7: KYC APPROVALS --- */}
        {/* ========================================================================= */}
        {activeTab === 'kyc' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>
                Pending KYC Submissions Queue ({kycRequests.length})
              </h3>
              {kycRequests.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '42px', color: '#34d399', marginBottom: '10px' }}>check_circle</span>
                  <div>All KYC verification requests processed!</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                  {kycRequests.map((k) => (
                    <div key={k.kyc_id} style={{ background: 'rgba(31, 41, 55, 0.6)', border: '1px solid rgba(75, 85, 99, 0.4)', borderRadius: '16px', padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>{k.full_name}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{k.email}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Submitted: {new Date(k.submitted_at).toLocaleString()}</div>
                        </div>
                        <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>PENDING</span>
                      </div>

                      <div style={{ background: 'rgba(17, 24, 39, 0.8)', borderRadius: '12px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#d1d5db' }}>Government ID Document</span>
                        <a href={k.document_url} target="_blank" rel="noreferrer" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span>Open File</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>open_in_new</span>
                        </a>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleKycReview(k.kyc_id, 'approved')}
                          style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleKycReview(k.kyc_id, 'rejected')}
                          style={{ flex: 1, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '10px', color: '#fca5a5', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- TAB 8: SAVINGS VAULTS --- */}
        {/* ========================================================================= */}
        {activeTab === 'savings' && (
          <div>
            <div style={{
              background: 'rgba(17, 24, 39, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>User Savings Vaults & Daily Yield Compounding</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(31, 41, 55, 0.6)', color: '#9ca3af', borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                      <th style={{ padding: '12px 14px' }}>VAULT ID</th>
                      <th style={{ padding: '12px 14px' }}>OWNER</th>
                      <th style={{ padding: '12px 14px' }}>CURRENCY</th>
                      <th style={{ padding: '12px 14px' }}>BALANCE</th>
                      <th style={{ padding: '12px 14px' }}>AER RATE</th>
                      <th style={{ padding: '12px 14px' }}>TOTAL INTEREST</th>
                      <th style={{ padding: '12px 14px' }}>LAST PAYOUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsVaults.map((v) => (
                      <tr key={v.vault_id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                        <td style={{ padding: '14px', fontWeight: 600 }}>Vault #{v.vault_id}</td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{v.user_name}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{v.user_email}</div>
                        </td>
                        <td style={{ padding: '14px', fontWeight: 600 }}>{v.currency}</td>
                        <td style={{ padding: '14px', fontWeight: 700, color: '#34d399' }}>{v.currency} {v.balance.toFixed(2)}</td>
                        <td style={{ padding: '14px', color: '#fbbf24', fontWeight: 600 }}>{v.aer_rate}% AER</td>
                        <td style={{ padding: '14px', color: '#a78bfa', fontWeight: 600 }}>+{v.currency} {v.total_interest_earned.toFixed(4)}</td>
                        <td style={{ padding: '14px', color: '#9ca3af' }}>{v.last_interest_at ? new Date(v.last_interest_at).toLocaleString() : 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* --- TAB 9: COMPLIANCE AUDIT TRAIL --- */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search audit trail by action type, admin, target user, or details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
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
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '20px' }}>
                  search
                </span>
              </div>
            </div>

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
                      <th style={{ padding: '14px 16px' }}>LOG ID</th>
                      <th style={{ padding: '14px 16px' }}>TIMESTAMP (UTC)</th>
                      <th style={{ padding: '14px 16px' }}>ADMIN IDENTITY</th>
                      <th style={{ padding: '14px 16px' }}>ACTION TYPE</th>
                      <th style={{ padding: '14px 16px' }}>TARGET USER</th>
                      <th style={{ padding: '14px 16px' }}>OPERATION DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#9ca3af' }}>No audit records found.</td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>#{log.id}</td>
                          <td style={{ padding: '14px 16px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#fca5a5' }}>
                            {log.admin_email}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              {log.action_type}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#93c5fd' }}>
                            {log.target_user_email || `User #${log.target_user_id || 'System'}`}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#d1d5db', fontSize: '12px' }}>
                            {log.details || '—'}
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

        {/* ========================================================================= */}
        {/* --- TAB 10: DATA EXPORTS (CSV) --- */}
        {/* ========================================================================= */}
        {activeTab === 'exports' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '20px',
                padding: '28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#60a5fa' }}>people</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Complete Users Register CSV</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>User profiles, balances, KYC & restrictions</p>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.5', marginBottom: '20px' }}>
                  Exports full list of registered platform accounts with current wallet balances in EUR/USD/GBP, email verification states, KYC verification statuses, and freeze/transfer flags.
                </p>
                <a
                  href={`${process.env.REACT_APP_API_URL || 'https://api.veltrobridge.xyz'}/admin/export/users.csv`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                  <span>Download Users CSV</span>
                </a>
              </div>

              <div style={{
                background: 'rgba(17, 24, 39, 0.7)',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                borderRadius: '20px',
                padding: '28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#34d399' }}>receipt_long</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Global Transaction Ledger CSV</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Complete historical ledger & reversals</p>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.5', marginBottom: '20px' }}>
                  Exports the immutable transaction history of all P2P transfers, SEPA wire deposits, withdrawals, currency conversions, and admin liquidity adjustments.
                </p>
                <a
                  href={`${process.env.REACT_APP_API_URL || 'https://api.veltrobridge.xyz'}/admin/export/ledger.csv`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                  <span>Download Ledger CSV</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* --- ALL MODALS --- */}
      {/* ========================================================================= */}

      {/* 1. FUND MODAL */}
      {fundModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Direct Treasury Funding</h3>
              <button onClick={() => setFundModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleFundSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Currency</label>
                <select value={fundCurrency} onChange={(e) => setFundCurrency(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Amount to Credit</label>
                <input type="number" step="0.01" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} required placeholder="e.g. 5000.00" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Sender Label</label>
                <input type="text" value={fundSenderLabel} onChange={(e) => setFundSenderLabel(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Audit Note</label>
                <input type="text" value={fundNote} onChange={(e) => setFundNote(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <button type="submit" disabled={fundLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: fundLoading ? 'not-allowed' : 'pointer' }}>
                {fundLoading ? 'Executing...' : 'Confirm Treasury Credit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. DEBIT MODAL */}
      {debitModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Direct Debit / Clawback</h3>
              <button onClick={() => setDebitModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleDebitSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Currency</label>
                <select value={debitCurrency} onChange={(e) => setDebitCurrency(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Amount</label>
                <input type="number" step="0.01" value={debitAmount} onChange={(e) => setDebitAmount(e.target.value)} required placeholder="e.g. 1000.00" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Mandatory Reason *</label>
                <input type="text" value={debitReason} onChange={(e) => setDebitReason(e.target.value)} required placeholder="e.g. Chargeback settlement" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="debitForce" checked={debitForce} onChange={(e) => setDebitForce(e.target.checked)} />
                <label htmlFor="debitForce" style={{ fontSize: '12px', color: '#9ca3af' }}>Force balance adjustment</label>
              </div>
              <button type="submit" disabled={debitLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: debitLoading ? 'not-allowed' : 'pointer' }}>
                {debitLoading ? 'Executing...' : 'Execute Direct Debit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. FREEZE MODAL */}
      {freezeModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{freezeTargetState ? 'Freeze Account & Funds' : 'Unfreeze Account'}</h3>
              <button onClick={() => setFreezeModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleFreezeSubmit}>
              {freezeTargetState && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Stated Freeze Reason *</label>
                  <input type="text" value={freezeReason} onChange={(e) => setFreezeReason(e.target.value)} required placeholder="e.g. Compliance velocity audit" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
                </div>
              )}
              <button type="submit" disabled={freezeLoading} style={{ width: '100%', background: freezeTargetState ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: freezeLoading ? 'not-allowed' : 'pointer' }}>
                {freezeLoading ? 'Processing...' : freezeTargetState ? 'Confirm Account Freeze' : 'Lift Account Freeze'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. TRANSFER TOGGLE MODAL */}
      {transferModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{transferTargetState ? 'Disable Outbound Transfers' : 'Enable Outbound Transfers'}</h3>
              <button onClick={() => setTransferModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleTransferToggleSubmit}>
              {transferTargetState && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Mandatory Restriction Reason *</label>
                  <input type="text" value={transferReason} onChange={(e) => setTransferReason(e.target.value)} required placeholder="e.g. Account under compliance review" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>User will receive this explanation whenever attempting a transfer.</div>
                </div>
              )}
              <button type="submit" disabled={transferLoading} style={{ width: '100%', background: transferTargetState ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: transferLoading ? 'not-allowed' : 'pointer' }}>
                {transferLoading ? 'Updating...' : transferTargetState ? 'Disable Transfers' : 'Re-Enable Transfers'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. REVERSAL MODAL */}
      {reverseModalOpen && selectedTx && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Reverse Transaction #{selectedTx.id}</h3>
              <button onClick={() => setReverseModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{ background: 'rgba(31, 41, 55, 0.6)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Amount:</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{selectedTx.currency} {selectedTx.amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Sender / Receiver:</span>
                <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>{selectedTx.sender_account} ➔ {selectedTx.receiver_account}</span>
              </div>
            </div>
            <form onSubmit={handleReverseSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Stated Reversal Reason *</label>
                <input type="text" value={reversalReason} onChange={(e) => setReversalReason(e.target.value)} required placeholder="e.g. Erroneous transfer / recall request" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <button type="submit" disabled={reverseLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: reverseLoading ? 'not-allowed' : 'pointer' }}>
                {reverseLoading ? 'Executing Reversal...' : 'Confirm Atomic Reversal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. SETTLE WITHDRAWAL MODAL */}
      {settleModalOpen && selectedWithdrawal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {settleAction === 'completed' ? 'Confirm & Settle Wire Out' : 'Reject & Auto-Refund Wire'}
              </h3>
              <button onClick={() => setSettleModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{ background: 'rgba(31, 41, 55, 0.6)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Beneficiary & IBAN:</span>
                <span style={{ fontWeight: 600, color: '#60a5fa', fontFamily: 'monospace' }}>{selectedWithdrawal.receiver_iban}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Amount:</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>{selectedWithdrawal.currency} {selectedWithdrawal.amount.toFixed(2)}</span>
              </div>
            </div>
            <form onSubmit={handleWithdrawalSettleSubmit}>
              {settleAction === 'completed' ? (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>External UTR / Wire Reference (Optional)</label>
                  <input type="text" value={settleUtr} onChange={(e) => setSettleUtr(e.target.value)} placeholder="e.g. SEPA-UTR-9918239120" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Rejection & Refund Reason *</label>
                  <input type="text" value={settleRejectReason} onChange={(e) => setSettleRejectReason(e.target.value)} required placeholder="e.g. Beneficiary name mismatch / invalid external IBAN" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
                  <div style={{ fontSize: '11px', color: '#34d399', marginTop: '6px' }}>The funds will be automatically refunded back to user's wallet!</div>
                </div>
              )}
              <button type="submit" disabled={settleLoading} style={{ width: '100%', background: settleAction === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: settleLoading ? 'not-allowed' : 'pointer' }}>
                {settleLoading ? 'Executing...' : settleAction === 'completed' ? 'Confirm Wire Settlement' : 'Execute Rejection & Refund'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. ASSIGN IBAN MODAL */}
      {ibanModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Assign Virtual European IBAN</h3>
              <button onClick={() => setIbanModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAssignIbanSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>European SEPA IBAN *</label>
                <input type="text" value={assignIbanVal} onChange={(e) => setAssignIbanVal(e.target.value)} required placeholder="e.g. FR76 3000 6000 0112 3456 7890 123" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff', fontFamily: 'monospace' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>BIC / SWIFT Code</label>
                <input type="text" value={assignBicVal} onChange={(e) => setAssignBicVal(e.target.value)} placeholder="VELTBEE1XXX" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff', fontFamily: 'monospace' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Beneficiary Account Name</label>
                <input type="text" value={assignNameVal} onChange={(e) => setAssignNameVal(e.target.value)} placeholder="e.g. John Doe" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <button type="submit" disabled={ibanLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: ibanLoading ? 'not-allowed' : 'pointer' }}>
                {ibanLoading ? 'Assigning...' : 'Save & Assign Virtual IBAN'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. SECURITY OVERRIDES MODAL */}
      {securityModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Security Overrides</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Target: {selectedUser.full_name} ({selectedUser.email})</p>
              </div>
              <button onClick={() => setSecurityModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Email Verification Override */}
            <div style={{ background: '#1f2937', padding: '14px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>Email Verification State</div>
                <div style={{ fontSize: '11px', color: selectedUser.email_verified ? '#34d399' : '#f87171' }}>
                  {selectedUser.email_verified ? 'Verified' : 'Unverified / Blocked'}
                </div>
              </div>
              {!selectedUser.email_verified && (
                <button
                  onClick={() => handleVerifyEmailOverride(selectedUser)}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Force Verify Email
                </button>
              )}
            </div>

            {/* PIN Reset */}
            <div style={{ background: '#1f2937', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '4px' }}>Transaction Security PIN</div>
              <div style={{ fontSize: '11px', color: selectedUser.has_pin ? '#60a5fa' : '#9ca3af', marginBottom: '10px' }}>
                Status: {selectedUser.has_pin ? 'Configured' : 'Not Set'}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleResetPin(selectedUser, true)}
                  disabled={securityLoading}
                  style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '8px', color: '#fca5a5', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Clear / Reset PIN
                </button>
              </div>
            </div>

            {/* Password Reset */}
            <form onSubmit={handleSetPassword} style={{ background: '#1f2937', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', marginBottom: '8px' }}>Direct Password Reset</div>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Enter new temporary password..."
                style={{ width: '100%', boxSizing: 'border-box', background: '#111827', border: '1px solid #374151', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', marginBottom: '8px' }}
              />
              <button
                type="submit"
                disabled={securityLoading || newPasswordInput.length < 6}
                style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Set New Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. NOTICE CREATE MODAL */}
      {noticeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Dispatch In-App Notice</h3>
              <button onClick={() => setNoticeModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleNoticeSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Target Recipient</label>
                <select value={noticeTargetUserId} onChange={(e) => setNoticeTargetUserId(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}>
                  <option value="">📢 Global Broadcast (All Users)</option>
                  {users.map(u => <option key={u.id} value={u.id.toString()}>{u.full_name} ({u.email})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Notice Type</label>
                <select value={noticeType} onChange={(e) => setNoticeType(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}>
                  <option value="info">Information (Blue)</option>
                  <option value="warning">Warning / Compliance (Yellow)</option>
                  <option value="urgent">Urgent Action Required (Red)</option>
                  <option value="success">Success / Verified (Green)</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Notice Headline *</label>
                <input type="text" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} required placeholder="e.g. Scheduled Network Maintenance" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Notice Content *</label>
                <textarea rows={3} value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value)} required placeholder="Enter message to display on the user dashboard..." style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff', fontFamily: 'inherit' }} />
              </div>
              <button type="submit" disabled={noticeLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: noticeLoading ? 'not-allowed' : 'pointer' }}>
                {noticeLoading ? 'Dispatching...' : 'Dispatch Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. SIMULATE WIRE MODAL */}
      {wireModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Simulate Inbound Institutional Wire</h3>
              <button onClick={() => setWireModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleWireSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Target User *</label>
                <select value={wireUserId} onChange={(e) => setWireUserId(parseInt(e.target.value))} required style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}>
                  <option value="">Select User...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Currency</label>
                  <select value={wireCurrency} onChange={(e) => setWireCurrency(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Amount *</label>
                  <input type="number" step="0.01" value={wireAmount} onChange={(e) => setWireAmount(e.target.value)} required placeholder="50000.00" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Sender Institution</label>
                <select
                  value={wireBankPreset}
                  onChange={(e) => {
                    setWireBankPreset(e.target.value);
                    setWireSenderName(`${e.target.value.split(' ')[0]} Commercial Wire Clearing`);
                  }}
                  style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }}
                >
                  <option value="JPMorgan Chase Bank, N.A.">JPMorgan Chase Bank, N.A.</option>
                  <option value="Barclays Bank PLC">Barclays Bank PLC</option>
                  <option value="Deutsche Bank AG">Deutsche Bank AG</option>
                  <option value="HSBC Bank USA">HSBC Bank USA</option>
                  <option value="BNP Paribas SA">BNP Paribas SA</option>
                  <option value="Citibank, N.A.">Citibank, N.A.</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#d1d5db', marginBottom: '6px' }}>Reference / UTR</label>
                <input type="text" value={wireRef} onChange={(e) => setWireRef(e.target.value)} placeholder="e.g. FEDWIRE-NY-991823" style={{ width: '100%', boxSizing: 'border-box', background: '#1f2937', border: '1px solid #374151', borderRadius: '10px', padding: '10px', color: '#fff' }} />
              </div>
              <button type="submit" disabled={wireLoading} style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 600, cursor: wireLoading ? 'not-allowed' : 'pointer' }}>
                {wireLoading ? 'Injecting Wire...' : 'Inject & Credit Institutional Wire'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 11. USER DOSSIER MODAL */}
      {selectedUser && dossierData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(75, 85, 99, 0.4)', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{dossierData.user.full_name} — Dossier</h3>
              <button onClick={() => setDossierData(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>Wallets</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                {dossierData.wallets.map((w: any) => (
                  <div key={w.id} style={{ background: '#1f2937', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Account: {w.account_number}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>{w.currency} {w.balance.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>Transactions ({dossierData.transactions.length})</h4>
              <div style={{ maxHeight: '240px', overflowY: 'auto', background: '#1f2937', borderRadius: '12px' }}>
                {dossierData.transactions.map((tx: any) => (
                  <div key={tx.id} style={{ padding: '10px 14px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#fff' }}>#{tx.id} • {tx.tx_type}</span>
                      <div style={{ color: '#9ca3af', fontSize: '11px' }}>{tx.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: tx.is_reversed ? '#ef4444' : '#34d399' }}>{tx.currency} {tx.amount.toFixed(2)}</div>
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
