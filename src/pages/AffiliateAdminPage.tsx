import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.ts';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Linkedin,
  Mail,
  Building2,
  Globe,
  Calendar,
  TrendingUp,
  PoundSterling,
  AlertCircle,
  Star,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  country: string;
  role: string;
  company: string | null;
  linkedin: string | null;
  experience: string;
  supplier_types: string[];
  network_size: string | null;
  methods: string[];
  notes: string | null;
  status: string;
  created_at: string;
}

interface Introduction {
  id: string;
  affiliate_id: string;
  supplier_company: string;
  contact_name: string;
  contact_email: string;
  supplier_type: string;
  status: string;
  subscription_type: string | null;
  subscription_value: number | null;
  signed_at: string | null;
  admin_notes: string | null;
  registered_at: string;
  affiliate_name?: string;
  affiliate_email?: string;
  affiliate_tier?: string;
  commission_rate?: number;
}

interface CommissionRow {
  id: string;
  affiliate_id: string;
  introduction_id: string;
  period_label: string;
  subscription_type: string;
  subscription_value: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  supplier_company?: string;
  affiliate_name?: string;
}

interface AffiliateProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  tracking_code: string;
  tier: string;
  commission_rate: number;
  status: string;
  accepted_at: string;
  total_introductions?: number;
  signed_count?: number;
  annual_count?: number;
  monthly_count?: number;
  total_commission_earned?: number;
  commission_pending?: number;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
const fmt = (v: number | null | undefined) =>
  v == null ? '—' : `£${Number(v).toFixed(2)}`;

const fmtDate = (s: string | null | undefined) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const generateTrackingCode = (firstName: string, lastName: string) => {
  const base = `${firstName.slice(0, 4).toUpperCase()}-TIQ`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${base}${rand}`;
};

const PIPELINE_STATUSES = [
  'registered', 'contacted', 'demo_scheduled', 'demo_done',
  'proposal_sent', 'signed', 'lost', 'duplicate',
];

const STATUS_COLOURS: Record<string, string> = {
  registered:      'bg-gray-700/40 text-gray-300',
  contacted:       'bg-blue-900/40 text-blue-300',
  demo_scheduled:  'bg-cyan-900/40 text-cyan-300',
  demo_done:       'bg-teal-900/40 text-teal-300',
  proposal_sent:   'bg-amber-900/40 text-amber-300',
  signed:          'bg-green-900/40 text-green-300',
  lost:            'bg-red-900/40 text-red-300',
  duplicate:       'bg-gray-900/40 text-gray-500',
};

/* ─── Shared UI ─────────────────────────────────────────────────────── */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
    {children}
  </div>
);

const Badge: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${className}`}>{children}</span>
);

const inputClass = 'px-3 py-2 text-sm text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-1 focus:ring-cyan-400 outline-none';

/* ─── Tab 1: Applications ────────────────────────────────────────────── */
const ApplicationsTab: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [acceptNotes, setAcceptNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const q = supabase
      .from('affiliate_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (filter !== 'all') q.eq('status', filter);
    const { data } = await q;
    setApps(data ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (app: Application) => {
    const code = trackingCode.trim() || generateTrackingCode(app.first_name, app.last_name);
    const { error } = await supabase.rpc('accept_affiliate_application', {
      p_application_id: app.id,
      p_tracking_code: code,
      p_notes: acceptNotes.trim() || null,
    });
    if (error) {
      setActionMessage({ id: app.id, msg: error.message, ok: false });
    } else {
      setActionMessage({ id: app.id, msg: `Accepted. Tracking code: ${code}`, ok: true });
      setAccepting(null);
      setTrackingCode('');
      setAcceptNotes('');
      load();
    }
  };

  const handleReject = async (appId: string) => {
    const { error } = await supabase
      .from('affiliate_applications')
      .update({ status: 'rejected' })
      .eq('id', appId);
    if (error) {
      setActionMessage({ id: appId, msg: error.message, ok: false });
    } else {
      setActionMessage({ id: appId, msg: 'Application rejected.', ok: true });
      load();
    }
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(['pending', 'accepted', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'text-gray-400 hover:text-white border border-transparent'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-gray-500 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : apps.length === 0 ? (
        <p className="text-gray-500 text-sm">No {filter === 'all' ? '' : filter} applications.</p>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id} className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl overflow-hidden">
              {/* Summary row */}
              <div className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{app.first_name} {app.last_name}</span>
                    <Badge className={
                      app.status === 'pending' ? 'bg-amber-900/40 text-amber-300' :
                      app.status === 'accepted' ? 'bg-green-900/40 text-green-300' :
                      'bg-red-900/40 text-red-300'
                    }>{app.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" strokeWidth={1.5} />{app.email}</span>
                    {app.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" strokeWidth={1.5} />{app.company}</span>}
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" strokeWidth={1.5} />{app.country}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" strokeWidth={1.5} />{fmtDate(app.created_at)}</span>
                  </div>
                </div>
                <button onClick={() => setExpanded(p => p === app.id ? null : app.id)}
                  className="text-gray-500 hover:text-white transition-colors shrink-0">
                  {expanded === app.id ? <ChevronUp className="w-5 h-5" strokeWidth={1.5} /> : <ChevronDown className="w-5 h-5" strokeWidth={1.5} />}
                </button>
              </div>

              {/* Expanded detail */}
              {expanded === app.id && (
                <div className="px-4 pb-4 border-t border-cyan-400/10 pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Role: </span><span className="text-gray-200">{app.role}</span></div>
                    <div><span className="text-gray-500">Experience: </span><span className="text-gray-200">{app.experience}</span></div>
                    {app.network_size && <div><span className="text-gray-500">Network size: </span><span className="text-gray-200">{app.network_size}</span></div>}
                    {app.phone && <div><span className="text-gray-500">Phone: </span><span className="text-gray-200">{app.phone}</span></div>}
                    {app.linkedin && (
                      <div className="flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
                        <a href={app.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs truncate">{app.linkedin}</a>
                      </div>
                    )}
                  </div>
                  {app.supplier_types?.length > 0 && (
                    <div><span className="text-xs text-gray-500">Target supplier types: </span>
                      <span className="text-xs text-gray-300">{app.supplier_types.join(', ')}</span>
                    </div>
                  )}
                  {app.methods?.length > 0 && (
                    <div><span className="text-xs text-gray-500">Methods: </span>
                      <span className="text-xs text-gray-300">{app.methods.join(', ')}</span>
                    </div>
                  )}
                  {app.notes && (
                    <div className="bg-[#0a1628]/60 rounded-lg p-3 text-sm text-gray-300 border border-cyan-400/10">
                      <p className="text-xs text-gray-500 mb-1">Additional notes:</p>
                      {app.notes}
                    </div>
                  )}

                  {/* Action message */}
                  {actionMessage?.id === app.id && (
                    <p className={`text-sm font-semibold ${actionMessage.ok ? 'text-cyan-400' : 'text-red-400'}`}>
                      {actionMessage.msg}
                    </p>
                  )}

                  {/* Accept / Reject */}
                  {app.status === 'pending' && (
                    <div className="space-y-3 pt-2">
                      {accepting === app.id ? (
                        <div className="space-y-3 bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
                          <p className="text-sm text-cyan-300 font-semibold">Confirm acceptance</p>
                          <div>
                            <label className="text-xs text-gray-400">Tracking code <span className="text-gray-600">(auto-generated if blank)</span></label>
                            <input type="text" value={trackingCode}
                              onChange={e => setTrackingCode(e.target.value.toUpperCase())}
                              placeholder={generateTrackingCode(app.first_name, app.last_name)}
                              className={`${inputClass} w-full mt-1`} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400">Internal notes (optional)</label>
                            <textarea rows={2} value={acceptNotes}
                              onChange={e => setAcceptNotes(e.target.value)}
                              className={`${inputClass} w-full mt-1`}
                              placeholder="e.g. Strong cruise industry background — fast-track to Growth tier" />
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleAccept(app)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> Confirm Accept
                            </button>
                            <button onClick={() => { setAccepting(null); setTrackingCode(''); setAcceptNotes(''); }}
                              className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-transparent rounded-lg transition-colors">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button onClick={() => setAccepting(app.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> Accept
                          </button>
                          <button onClick={() => handleReject(app.id)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                            <XCircle className="w-4 h-4" strokeWidth={1.5} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Tab 2: Introductions ───────────────────────────────────────────── */
const IntroductionsTab: React.FC = () => {
  const [intros, setIntros] = useState<Introduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Introduction>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    // Fetch introductions joined with affiliate name/email/tier
    const { data: introData } = await supabase
      .from('affiliate_introductions')
      .select('*, affiliate_profiles(first_name, last_name, email, tier, commission_rate)')
      .order('registered_at', { ascending: false });

    const rows: Introduction[] = (introData ?? []).map((r: any) => ({
      ...r,
      affiliate_name: r.affiliate_profiles
        ? `${r.affiliate_profiles.first_name} ${r.affiliate_profiles.last_name}` : '—',
      affiliate_email: r.affiliate_profiles?.email ?? '—',
      affiliate_tier: r.affiliate_profiles?.tier ?? '—',
      commission_rate: r.affiliate_profiles?.commission_rate ?? 10,
    }));

    setIntros(statusFilter === 'all' ? rows : rows.filter(r => r.status === statusFilter));
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (intro: Introduction) => {
    setSaving(true);
    const update: Record<string, any> = {
      status: editData.status ?? intro.status,
      subscription_type: editData.subscription_type ?? intro.subscription_type,
      subscription_value: editData.subscription_value ?? intro.subscription_value,
      admin_notes: editData.admin_notes ?? intro.admin_notes,
    };
    if (update.status === 'signed' && !intro.signed_at) {
      update.signed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('affiliate_introductions')
      .update(update)
      .eq('id', intro.id);

    setSaving(false);
    if (error) {
      setMessage({ id: intro.id, msg: error.message, ok: false });
    } else {
      // If signing, auto-create commission record
      if (update.status === 'signed' && update.subscription_value && update.subscription_type) {
        const periodLabel = update.subscription_type === 'annual'
          ? `Annual ${new Date().getFullYear()}`
          : `${new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' })}`;
        await supabase.rpc('record_affiliate_commission', {
          p_introduction_id: intro.id,
          p_period_label: periodLabel,
          p_sub_type: update.subscription_type,
          p_sub_value: update.subscription_value,
          p_due_date: null,
        });
      }
      setMessage({ id: intro.id, msg: 'Saved.', ok: true });
      setEditing(null);
      setEditData({});
      load();
    }
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['all', ...PIPELINE_STATUSES].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === f ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'text-gray-500 hover:text-white border border-transparent'
            }`}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-gray-500 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Annual-first nudge banner */}
      <div className="mb-5 flex items-start gap-3 bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-4">
        <Star className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-xs text-cyan-200">
          <strong>Encourage annual commitments</strong> — when updating a signed introduction, set the subscription type to <strong>Annual</strong> wherever possible. Annual subscriptions give the supplier a better price per month and you earn the full-year commission upfront. Mark monthly subscriptions only when the supplier has explicitly refused annual terms.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : intros.length === 0 ? (
        <p className="text-gray-500 text-sm">No introductions found.</p>
      ) : (
        <div className="space-y-3">
          {intros.map(intro => (
            <div key={intro.id} className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl overflow-hidden">
              <div className="p-4 space-y-2">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{intro.supplier_company}</span>
                      <Badge className={STATUS_COLOURS[intro.status] ?? 'bg-gray-800 text-gray-400'}>
                        {intro.status.replace('_', ' ')}
                      </Badge>
                      {intro.subscription_type === 'annual' && (
                        <Badge className="bg-cyan-900/40 text-cyan-300">Annual ★</Badge>
                      )}
                      {intro.subscription_type === 'monthly' && (
                        <Badge className="bg-amber-900/40 text-amber-300">Monthly</Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex gap-3 flex-wrap">
                      <span>{intro.contact_name} · {intro.contact_email}</span>
                      <span className="text-gray-600">|</span>
                      <span>Affiliate: <span className="text-gray-300">{intro.affiliate_name}</span> ({intro.affiliate_tier} · {intro.commission_rate}%)</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Registered {fmtDate(intro.registered_at)}
                      {intro.signed_at ? ` · Signed ${fmtDate(intro.signed_at)}` : ''}
                      {intro.subscription_value ? ` · ${fmt(intro.subscription_value)}/year` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (editing === intro.id) { setEditing(null); setEditData({}); }
                      else { setEditing(intro.id); setEditData({ status: intro.status, subscription_type: intro.subscription_type, subscription_value: intro.subscription_value, admin_notes: intro.admin_notes }); }
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors shrink-0"
                  >
                    {editing === intro.id ? 'Cancel' : 'Update'}
                  </button>
                </div>

                {/* Edit panel */}
                {editing === intro.id && (
                  <div className="mt-3 bg-[#0a1628]/60 border border-cyan-400/10 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Pipeline Status</label>
                        <select value={editData.status ?? intro.status}
                          onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                          className={`${inputClass} w-full`}>
                          {PIPELINE_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Subscription Type
                          <span className="ml-1 text-cyan-400">← prefer Annual</span>
                        </label>
                        <select
                          value={editData.subscription_type ?? ''}
                          onChange={e => setEditData(p => ({ ...p, subscription_type: e.target.value || null }))}
                          className={`${inputClass} w-full`}>
                          <option value="">Not set</option>
                          <option value="annual">Annual ★ (recommended)</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Annual Value (£)</label>
                        <input type="number" min="0" step="0.01"
                          value={editData.subscription_value ?? ''}
                          onChange={e => setEditData(p => ({ ...p, subscription_value: parseFloat(e.target.value) || null }))}
                          placeholder="e.g. 3600"
                          className={`${inputClass} w-full`} />
                        {editData.subscription_value && intro.commission_rate && (
                          <p className="text-xs text-cyan-400 mt-1">
                            Commission: {fmt((editData.subscription_value as number) * intro.commission_rate / 100)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Admin Notes</label>
                      <textarea rows={2} value={editData.admin_notes ?? ''}
                        onChange={e => setEditData(p => ({ ...p, admin_notes: e.target.value }))}
                        placeholder="Internal notes — not visible to affiliate"
                        className={`${inputClass} w-full`} />
                    </div>
                    {(editData.status === 'signed') && (
                      <div className="flex items-start gap-2 bg-green-900/20 border border-green-500/20 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <p className="text-xs text-green-300">
                          Marking as <strong>Signed</strong> will automatically create a commission record for this affiliate. Make sure the annual value and subscription type are correct before saving.
                        </p>
                      </div>
                    )}
                    {message?.id === intro.id && (
                      <p className={`text-sm font-semibold ${message.ok ? 'text-cyan-400' : 'text-red-400'}`}>{message.msg}</p>
                    )}
                    <button onClick={() => handleSave(intro)} disabled={saving}
                      className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Tab 3: Commissions ─────────────────────────────────────────────── */
const CommissionsTab: React.FC = () => {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [updating, setUpdating] = useState<string | null>(null);
  const [payRef, setPayRef] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('affiliate_commissions')
      .select('*, affiliate_introductions(supplier_company), affiliate_profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    const enriched: CommissionRow[] = (data ?? []).map((r: any) => ({
      ...r,
      supplier_company: r.affiliate_introductions?.supplier_company ?? '—',
      affiliate_name: r.affiliate_profiles
        ? `${r.affiliate_profiles.first_name} ${r.affiliate_profiles.last_name}` : '—',
    }));

    setRows(statusFilter === 'all' ? enriched : enriched.filter(r => r.status === statusFilter));
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (commId: string) => {
    setUpdating(commId);
    await supabase.from('affiliate_commissions').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      payment_reference: payRef.trim() || null,
    }).eq('id', commId);
    setUpdating(null);
    setPayRef('');
    load();
  };

  const approve = async (commId: string) => {
    setUpdating(commId);
    await supabase.from('affiliate_commissions').update({ status: 'approved' }).eq('id', commId);
    setUpdating(null);
    load();
  };

  const totalPending = rows
    .filter(r => r.status === 'pending' || r.status === 'approved')
    .reduce((s, r) => s + r.commission_amount, 0);

  const annualShare = rows.filter(r => r.subscription_type === 'annual').length;
  const totalCount = rows.length;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-white">{fmt(totalPending)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Pending / approved commission</p>
        </div>
        <div className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
            <p className="text-2xl font-extrabold text-cyan-400">
              {totalCount > 0 ? Math.round(annualShare / totalCount * 100) : 0}%
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Annual subscriptions (target: &gt;80%)</p>
        </div>
        <div className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl p-4">
          <p className="text-2xl font-extrabold text-white">{totalCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Commission records shown</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {['pending', 'approved', 'paid', 'all'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === f ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'text-gray-500 hover:text-white border border-transparent'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-gray-500 hover:text-white transition-colors">
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-sm">No {statusFilter === 'all' ? '' : statusFilter} commissions.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.id} className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-white">{row.affiliate_name}</span>
                    <Badge className={
                      row.status === 'paid' ? 'bg-green-900/40 text-green-300' :
                      row.status === 'approved' ? 'bg-cyan-900/40 text-cyan-300' :
                      'bg-amber-900/40 text-amber-300'
                    }>{row.status}</Badge>
                    {row.subscription_type === 'annual'
                      ? <Badge className="bg-cyan-900/30 text-cyan-400">Annual ★</Badge>
                      : <Badge className="bg-amber-900/30 text-amber-400">Monthly</Badge>}
                  </div>
                  <div className="text-xs text-gray-400 flex gap-3 flex-wrap">
                    <span>{row.supplier_company} · {row.period_label}</span>
                    <span className="text-gray-600">|</span>
                    <span>Sub value: {fmt(row.subscription_value)}</span>
                    <span>Rate: {row.commission_rate}%</span>
                    <span className="font-semibold text-white">Commission: {fmt(row.commission_amount)}</span>
                  </div>
                  {row.due_date && <p className="text-xs text-gray-500 mt-0.5">Due: {fmtDate(row.due_date)}</p>}
                  {row.paid_at && <p className="text-xs text-green-400 mt-0.5">Paid {fmtDate(row.paid_at)} · Ref: {row.payment_reference ?? 'n/a'}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {row.status === 'pending' && (
                    <button onClick={() => approve(row.id)} disabled={updating === row.id}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors disabled:opacity-50">
                      Approve
                    </button>
                  )}
                  {row.status === 'approved' && (
                    <div className="flex items-center gap-2">
                      <input type="text" value={payRef} onChange={e => setPayRef(e.target.value)}
                        placeholder="Payment ref" className={`${inputClass} w-32 text-xs`} />
                      <button onClick={() => markPaid(row.id)} disabled={updating === row.id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors disabled:opacity-50">
                        <PoundSterling className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                        Mark Paid
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Tab 4: Affiliates ──────────────────────────────────────────────── */
const AffiliatesTab: React.FC = () => {
  const [affiliates, setAffiliates] = useState<AffiliateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('affiliate_summary')
        .select('*')
        .order('accepted_at', { ascending: false });
      setAffiliates(data ?? []);
      setLoading(false);
    })();
  }, []);

  const updateTier = async (affiliateId: string, tier: string) => {
    const rateMap: Record<string, number> = { standard: 10, growth: 15, strategic: 20 };
    await supabase.from('affiliate_profiles').update({
      tier,
      commission_rate: rateMap[tier] ?? 10,
    }).eq('id', affiliateId);
    setAffiliates(prev => prev.map(a => a.id === affiliateId
      ? { ...a, tier, commission_rate: rateMap[tier] ?? 10 }
      : a
    ));
  };

  return (
    <div>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : affiliates.length === 0 ? (
        <p className="text-gray-500 text-sm">No affiliates yet. Accept applications in the Applications tab.</p>
      ) : (
        <div className="space-y-3">
          {affiliates.map(a => (
            <div key={a.id} className="bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-white">{a.first_name} {a.last_name}</span>
                    <Badge className={
                      a.tier === 'strategic' ? 'bg-blue-900/40 text-blue-300' :
                      a.tier === 'growth' ? 'bg-cyan-900/40 text-cyan-300' :
                      'bg-gray-700/40 text-gray-300'
                    }>{a.tier} · {a.commission_rate}%</Badge>
                    <Badge className={a.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}>
                      {a.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{a.email} · Accepted {fmtDate(a.accepted_at)}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-gray-400">Intros: <span className="text-white font-semibold">{a.total_introductions ?? 0}</span></span>
                    <span className="text-gray-400">Signed: <span className="text-green-400 font-semibold">{a.signed_count ?? 0}</span></span>
                    <span className="text-gray-400">Annual: <span className="text-cyan-400 font-semibold">{a.annual_count ?? 0}</span></span>
                    <span className="text-gray-400">Monthly: <span className="text-amber-400 font-semibold">{a.monthly_count ?? 0}</span></span>
                    <span className="text-gray-400">Earned: <span className="text-white font-semibold">{fmt(a.total_commission_earned)}</span></span>
                    <span className="text-gray-400">Pending: <span className="text-amber-300 font-semibold">{fmt(a.commission_pending)}</span></span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tier</label>
                  <select value={a.tier}
                    onChange={e => updateTier(a.id, e.target.value)}
                    className={`${inputClass} text-xs`}>
                    <option value="standard">Standard (10%)</option>
                    <option value="growth">Growth (15%)</option>
                    <option value="strategic">Strategic (20%)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────── */
type TabId = 'applications' | 'introductions' | 'commissions' | 'affiliates';

const TABS: { id: TabId; label: string }[] = [
  { id: 'applications', label: 'Applications' },
  { id: 'introductions', label: 'Introductions' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'affiliates', label: 'All Affiliates' },
];

const AffiliateAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('applications');

  return (
    <div className="min-h-screen bg-[#0a1628] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-heading text-white">Affiliate Programme Admin</h1>
          <p className="text-gray-400 mt-1 text-sm">Review applications, track introductions, manage commissions, and oversee all affiliate partners.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-[#0f1c2e]/60 border border-cyan-400/10 rounded-xl p-1.5 flex-wrap">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-400/15 text-white border border-cyan-400/20'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'applications' && <ApplicationsTab />}
        {activeTab === 'introductions' && <IntroductionsTab />}
        {activeTab === 'commissions' && <CommissionsTab />}
        {activeTab === 'affiliates' && <AffiliatesTab />}
      </div>
    </div>
  );
};

export default AffiliateAdminPage;
