import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Sparkles,
  Percent,
  DollarSign
} from 'lucide-react';
import { Coupon } from '../types';
import {
  fetchCouponsFromFirestore,
  saveCouponToFirestore,
  deleteCouponFromFirestore,
  validateCouponCode
} from '../lib/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

interface AdminCouponsProps {
  user: FirebaseUser | null;
  adminRole: string;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ user, adminRole }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testPlan, setTestPlan] = useState('MONTHLY');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCouponsFromFirestore();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon({
      id: `coupon_${Date.now()}`,
      coupon_code: '',
      discount_type: 'percentage',
      discount_value: 15,
      maximum_uses: 200,
      used_count: 0,
      per_user_limit: 1,
      start_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      applicable_plans: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon({ ...c });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.coupon_code || !editingCoupon?.discount_value) {
      alert('Coupon code and discount value are required.');
      return;
    }

    setSaving(true);
    try {
      const payload: Coupon = {
        id: editingCoupon.id || `coupon_${Date.now()}`,
        coupon_code: editingCoupon.coupon_code.toUpperCase().trim(),
        discount_type: editingCoupon.discount_type || 'percentage',
        discount_value: Number(editingCoupon.discount_value),
        maximum_uses: Number(editingCoupon.maximum_uses || 100),
        used_count: Number(editingCoupon.used_count || 0),
        per_user_limit: Number(editingCoupon.per_user_limit || 1),
        start_date: editingCoupon.start_date || new Date().toISOString().split('T')[0],
        expiry_date: editingCoupon.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicable_plans: editingCoupon.applicable_plans || ['MONTHLY', 'QUARTERLY', 'YEARLY'],
        active: Boolean(editingCoupon.active),
        createdAt: editingCoupon.createdAt || new Date().toISOString(),
        createdBy: user?.email || 'Admin'
      };

      const ok = await saveCouponToFirestore(
        payload,
        user?.uid || 'admin',
        user?.email || 'admin@sarkarisajha.gov.np'
      );

      if (ok) {
        setIsModalOpen(false);
        setEditingCoupon(null);
        setStatusMsg(`Coupon ${payload.coupon_code} saved.`);
        setTimeout(() => setStatusMsg(null), 3000);
        await loadCoupons();
      } else {
        alert('Failed to save coupon.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    const ok = await deleteCouponFromFirestore(
      id,
      user?.uid || 'admin',
      user?.email || 'admin@sarkarisajha.gov.np'
    );
    if (ok) {
      setStatusMsg(`Coupon ${code} removed.`);
      setTimeout(() => setStatusMsg(null), 3000);
      await loadCoupons();
    }
  };

  const handleTestCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCode.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await validateCouponCode(testCode, testPlan, user?.uid || 'test_user');
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ valid: false, message: err?.message || 'Validation failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Promotional Coupons & Vouchers</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create percentage or fixed NPR discounts, manage redemption quotas, and test checkout validation rules.
          </p>
        </div>
        <button
          id="btn-create-coupon"
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-sm rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No discount coupons configured.</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {coupons.map((c) => (
              <div
                key={c.id}
                id={`coupon-item-${c.id}`}
                className="p-4 sm:p-5 hover:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-mono font-black text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                      {c.coupon_code}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                      {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `NPR ${c.discount_value} OFF`}
                    </span>
                    {c.active ? (
                      <span className="text-xs text-emerald-400 font-bold">● Active</span>
                    ) : (
                      <span className="text-xs text-slate-500 font-bold">● Inactive</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Used: {c.used_count} / {c.maximum_uses}</span>
                    <span>Expires: {c.expiry_date}</span>
                    <span>Plans: {c.applicable_plans.join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.coupon_code)}
                    className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coupon Validator Sandbox */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Live Coupon Tester Sandbox</span>
        </h3>
        <p className="text-xs text-slate-400">
          Simulate candidate redemption to test discount calculation and plan eligibility before broadcasting.
        </p>

        <form onSubmit={handleTestCoupon} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter coupon code (e.g. LOKSEWA20)..."
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl focus:border-emerald-500 focus:outline-none uppercase font-mono"
          />
          <select
            value={testPlan}
            onChange={(e) => setTestPlan(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 rounded-xl"
          >
            <option value="MONTHLY">Monthly Pro Pass (NPR 299)</option>
            <option value="QUARTERLY">Quarterly Exam Sprint (NPR 699)</option>
            <option value="YEARLY">Annual Master Membership (NPR 1999)</option>
          </select>
          <button
            type="submit"
            disabled={testing}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shrink-0"
          >
            {testing ? 'Testing...' : 'Test Code'}
          </button>
        </form>

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs ${
            testResult.valid
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-red-950/40 border-red-700/60 text-red-200'
          }`}>
            <p className="font-bold text-sm">{testResult.message}</p>
            {testResult.valid && (
              <p className="mt-1">
                Discount: <span className="font-bold">NPR {testResult.discountAmount}</span> | Final Checkout Price: <span className="font-bold">NPR {testResult.finalPrice}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingCoupon.createdAt ? 'Edit Coupon' : 'Create New Coupon'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.coupon_code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, coupon_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LOKSEWA25"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type || 'percentage'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (NPR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingCoupon.discount_value || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Uses</label>
                  <input
                    type="number"
                    min={1}
                    value={editingCoupon.maximum_uses || 100}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maximum_uses: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editingCoupon.expiry_date || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, expiry_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-3.5 py-2 rounded-xl"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(editingCoupon.active)}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600"
                />
                <span>Active & Redeemable</span>
              </label>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
