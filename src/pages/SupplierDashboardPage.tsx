import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.ts';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.tsx';
import { SupplierType } from '../types.ts';

interface SupplierRow {
  id: string;
  owner_id: string | null;
  name: string;
  type: string;
  logo_url: string | null;
  banner_url: string | null;
  video_url: string | null;
  short_description: string | null;
  long_description: string | null;
  website_url: string | null;
  knowledge_base_text: string | null;
  is_published: boolean;
  use_eleven_labs: boolean;
  eleven_labs_agent_id: string | null;
  gemini_voice_name: string;
}

interface LeadRow {
  id: string;
  type: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  email: string;
  agency: string | null;
  message: string | null;
  created_at: string;
}

const inputClass = "mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all placeholder-gray-500";
const labelClass = "block text-sm font-medium text-gray-300";

const SupplierDashboardPage: React.FC = () => {
  const { user, profile, signOut, isLoading: authLoading, isConfigured } = useSupabaseAuth();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierRow | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [tab, setTab] = useState<'profile' | 'leads'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/supplier-portal/login');
  }, [authLoading, user, navigate]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: supplierData } = await supabase
      .from('suppliers')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();
    setSupplier(supplierData as SupplierRow | null);

    if (supplierData) {
      const { data: leadData } = await supabase
        .from('leads')
        .select('*')
        .eq('supplier_id', supplierData.id)
        .order('created_at', { ascending: false });
      setLeads((leadData ?? []) as LeadRow[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        owner_id: user.id,
        name: profile?.company_name || 'My Travel Brand',
        type: SupplierType.Airline,
        is_published: false,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { setMessage(`Error: ${error.message}`); return; }
    setSupplier(data as SupplierRow);
    setMessage('Profile created. Fill in the details and publish when you\'re ready.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;
    setSaving(true);
    const { error } = await supabase
      .from('suppliers')
      .update({
        name: supplier.name,
        type: supplier.type,
        logo_url: supplier.logo_url,
        banner_url: supplier.banner_url,
        video_url: supplier.video_url,
        short_description: supplier.short_description,
        long_description: supplier.long_description,
        website_url: supplier.website_url,
        knowledge_base_text: supplier.knowledge_base_text,
        is_published: supplier.is_published,
        use_eleven_labs: supplier.use_eleven_labs,
        eleven_labs_agent_id: supplier.eleven_labs_agent_id,
        gemini_voice_name: supplier.gemini_voice_name,
      })
      .eq('id', supplier.id);
    setSaving(false);
    if (error) { setMessage(`Error: ${error.message}`); return; }
    setMessage('Saved.');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supplier) return;
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('supplier-logos')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('supplier-logos').getPublicUrl(path);
      setSupplier(prev => prev ? { ...prev, logo_url: publicUrl } : prev);
      setMessage('Logo uploaded. Remember to save your profile.');
    } catch (err: any) {
      setMessage(`Logo upload failed: ${err.message}`);
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md p-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200">
          The supplier portal is not yet configured. Please contact <a className="underline" href="mailto:hello@beeancy.com">hello@beeancy.com</a>.
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Subscription / approval gate — block access until admin approves the account
  if (profile && profile.is_approved === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
        <div className="max-w-md w-full p-10 bg-[#0f1c2e]/80 border border-cyan-400/10 rounded-xl text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Pending Approval</h2>
          <p className="mt-3 text-gray-300">
            Your supplier account is awaiting approval from the TravelIQ team.
            You'll receive an email once your account is activated and you can access your dashboard.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Questions? <a className="text-cyan-400 hover:underline" href="mailto:hello@beeancy.com">hello@beeancy.com</a>
          </p>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="mt-6 text-sm text-gray-300 hover:text-white border border-cyan-400/20 hover:border-cyan-400/50 px-6 py-2 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-heading text-white">Supplier Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.</p>
          </div>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="text-sm text-gray-300 hover:text-white border border-cyan-400/20 hover:border-cyan-400/50 px-4 py-2 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-200 text-sm">
            {message}
          </div>
        )}

        {!supplier ? (
          <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-white">Set up your supplier profile</h2>
            <p className="mt-3 text-gray-300 max-w-lg mx-auto">You don't have a supplier profile yet. Create one to start engaging travel agents with your AI Sales Assistant.</p>
            <button onClick={handleCreate} disabled={saving} className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 disabled:opacity-50">
              {saving ? 'Creating…' : 'Create profile'}
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-cyan-400/10">
              {(['profile', 'leads'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 font-semibold capitalize transition-colors ${tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {t === 'leads' ? `Leads (${leads.length})` : t}
                </button>
              ))}
            </div>

            {tab === 'profile' && (
              <form onSubmit={handleSave} className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 space-y-5">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-cyan-400/10">
                  <div>
                    <p className="text-white font-bold">Status: {supplier.is_published ? <span className="text-green-400">Published</span> : <span className="text-yellow-400">Draft</span>}</p>
                    <p className="text-gray-400 text-sm">{supplier.is_published ? 'Visible in the public directory.' : 'Only visible to you. Toggle when ready.'}</p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={supplier.is_published} onChange={e => setSupplier({ ...supplier, is_published: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
                    <span className="text-white text-sm">Published</span>
                  </label>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div><label className={labelClass}>Brand name</label><input value={supplier.name} onChange={e => setSupplier({ ...supplier, name: e.target.value })} required className={inputClass} /></div>
                  <div><label className={labelClass}>Type</label>
                    <select value={supplier.type} onChange={e => setSupplier({ ...supplier, type: e.target.value })} className={inputClass}>
                      {Object.values(SupplierType).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Logo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      value={supplier.logo_url ?? ''}
                      onChange={e => setSupplier({ ...supplier, logo_url: e.target.value })}
                      placeholder="Paste a URL or upload a file →"
                      className={inputClass + ' flex-grow'}
                    />
                    <label
                      htmlFor="logoUpload"
                      className={`cursor-pointer whitespace-nowrap px-4 py-3 rounded-lg border border-cyan-400/20 text-sm font-semibold transition-colors ${logoUploading ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:bg-cyan-400/10'}`}
                    >
                      {logoUploading ? 'Uploading…' : 'Upload file'}
                    </label>
                    <input
                      type="file"
                      id="logoUpload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="hidden"
                    />
                  </div>
                  {supplier.logo_url && (
                    <img src={supplier.logo_url} alt="Logo preview" className="mt-2 h-12 w-12 rounded-full object-cover border border-cyan-400/20" />
                  )}
                </div>
                <div><label className={labelClass}>Banner URL</label><input value={supplier.banner_url ?? ''} onChange={e => setSupplier({ ...supplier, banner_url: e.target.value })} placeholder="https://…" className={inputClass} /></div>
                <div><label className={labelClass}>Video Presentation URL</label><input value={supplier.video_url ?? ''} onChange={e => setSupplier({ ...supplier, video_url: e.target.value })} placeholder="YouTube / Vimeo / HeyGen / Synthesia URL" className={inputClass} /></div>
                <div><label className={labelClass}>Website URL</label><input value={supplier.website_url ?? ''} onChange={e => setSupplier({ ...supplier, website_url: e.target.value })} placeholder="https://yourbrand.com" className={inputClass} /></div>

                <div><label className={labelClass}>Short description (one-line tagline)</label><textarea value={supplier.short_description ?? ''} onChange={e => setSupplier({ ...supplier, short_description: e.target.value })} rows={2} className={inputClass} /></div>
                <div><label className={labelClass}>Long description</label><textarea value={supplier.long_description ?? ''} onChange={e => setSupplier({ ...supplier, long_description: e.target.value })} rows={5} className={inputClass} /></div>

                <div>
                  <label className={labelClass}>Knowledge base (your AI's memory)</label>
                  <p className="text-xs text-gray-500 mt-1">Paste FAQs, agent training material, fares, schedules, policies. The more you give, the smarter your AI becomes.</p>
                  <textarea value={supplier.knowledge_base_text ?? ''} onChange={e => setSupplier({ ...supplier, knowledge_base_text: e.target.value })} rows={10} className={inputClass} />
                </div>

                <div className="border border-cyan-400/20 rounded-lg p-4 bg-[#0a1628]/40 space-y-3">
                  <p className="text-white font-semibold">Voice settings</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Gemini voice (default)</label>
                      <select value={supplier.gemini_voice_name} onChange={e => setSupplier({ ...supplier, gemini_voice_name: e.target.value })} className={inputClass}>
                        {['Zephyr', 'Charon', 'Puck', 'Kore', 'Fenrir'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="inline-flex items-center gap-2 mt-7">
                        <input type="checkbox" checked={supplier.use_eleven_labs} onChange={e => setSupplier({ ...supplier, use_eleven_labs: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
                        <span className="text-white text-sm">Use ElevenLabs voice (premium)</span>
                      </label>
                    </div>
                  </div>
                  <div><label className={labelClass}>ElevenLabs voice ID</label><input value={supplier.eleven_labs_agent_id ?? ''} onChange={e => setSupplier({ ...supplier, eleven_labs_agent_id: e.target.value })} disabled={!supplier.use_eleven_labs} placeholder="Your ElevenLabs voice ID" className={inputClass + (supplier.use_eleven_labs ? '' : ' opacity-50')} /></div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-cyan-400/10">
                  <Link to={`/supplier/${supplier.id}`} className="text-cyan-400 hover:underline text-sm">Preview public profile →</Link>
                  <button type="submit" disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}

            {tab === 'leads' && (
              <div className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-6">
                {leads.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">No leads yet. They'll appear here when agents engage with your AI Sales Assistant.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-gray-400 border-b border-cyan-400/10">
                        <tr>
                          <th className="py-3 pr-4">Date</th>
                          <th className="py-3 pr-4">Type</th>
                          <th className="py-3 pr-4">Name</th>
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3 pr-4">Agency</th>
                          <th className="py-3 pr-4">Message</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cyan-400/10">
                        {leads.map(l => {
                          const fullName = l.name ?? [l.first_name, l.last_name].filter(Boolean).join(' ');
                          return (
                            <tr key={l.id} className="hover:bg-white/5">
                              <td className="py-3 pr-4 text-gray-300">{new Date(l.created_at).toLocaleDateString()}</td>
                              <td className="py-3 pr-4"><span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300">{l.type}</span></td>
                              <td className="py-3 pr-4 text-white">{fullName || '—'}</td>
                              <td className="py-3 pr-4 text-cyan-400"><a href={`mailto:${l.email}`} className="hover:underline">{l.email}</a></td>
                              <td className="py-3 pr-4 text-gray-300">{l.agency ?? '—'}</td>
                              <td className="py-3 pr-4 text-gray-300 max-w-xs truncate" title={l.message ?? ''}>{l.message ?? '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboardPage;
