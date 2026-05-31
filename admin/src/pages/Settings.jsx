import { useState } from 'react';
import {
  Settings as SettingsIcon, Globe, Palette, Database, Mail, Shield,
  Key, Check, AlertCircle, Eye, EyeOff, Save, RefreshCw, Trash2,
  Upload, Moon, Sun, Monitor, Copy, ChevronRight, Lock, Bell,
  Zap, Server, Users, ToggleLeft, ToggleRight, CheckCircle, X,
  Sparkles, AlertTriangle
} from 'lucide-react';

// ── REUSABLE TOGGLE ──
const Toggle = ({ checked, onChange, size = 'default' }) => (
  <button
    onClick={onChange}
    className={`relative rounded-full transition-all duration-300 flex-shrink-0
      ${size === 'sm' ? 'w-10 h-6' : 'w-12 h-7'}
      ${checked
        ? 'bg-gradient-to-r from-[#E6761D] to-orange-600 shadow-[0_0_12px_rgba(230,118,29,0.4)]'
        : 'bg-gray-200 hover:bg-gray-300'}`}
    aria-checked={checked}
    role="switch"
  >
    <span className={`absolute top-0.5 bg-white rounded-full shadow-md transition-all duration-300
      ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}
      ${checked ? (size === 'sm' ? 'left-[18px]' : 'left-[22px]') : 'left-0.5'}`}
    />
  </button>
);

// ── STYLED INPUT ──
const Input = ({ label, hint, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
    <input
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none
        focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.12)] transition-all duration-250 bg-white
        placeholder-gray-400 hover:border-gray-300"
      {...props}
    />
    {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
  </div>
);

// ── STYLED SELECT ──
const Select = ({ label, children, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
    <select
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none
        focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.12)] transition-all duration-250 bg-white cursor-pointer"
      {...props}
    >
      {children}
    </select>
  </div>
);

// ── TOGGLE ROW ──
const ToggleRow = ({ label, desc, checked, onChange, icon: Icon, iconColor = 'text-[#E6761D]' }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/60
    hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-250 group cursor-pointer"
    onClick={onChange}
  >
    <div className="flex items-center gap-3">
      {Icon && <Icon size={18} className={`${iconColor} group-hover:scale-110 transition-transform`} />}
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#E6761D');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const sections = [
    { id: 'general', label: 'General Settings', icon: SettingsIcon, badge: null },
    { id: 'brand', label: 'Brand & Theming', icon: Palette, badge: null },
    { id: 'seo', label: 'SEO Configuration', icon: Globe, badge: null },
    { id: 'integrations', label: 'API & Integrations', icon: Database, badge: '3 Active' },
    { id: 'email', label: 'Email & Notifications', icon: Mail, badge: null },
    { id: 'security', label: 'Security', icon: Shield, badge: '1 Alert' },
  ];

  const badgeColors = {
    '3 Active': 'bg-emerald-100 text-emerald-700',
    '1 Alert': 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-enter">

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 glass-white border-b border-gray-200/60 px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <SettingsIcon size={18} className="text-white" />
              </div>
              System Settings
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 ml-12">Manage global platform configurations, branding, and integrations</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:rotate-180 transition-all duration-500 shadow-sm">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ripple
                ${saved
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : saving
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#E6761D] to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105'}`}
            >
              {saved ? <CheckCircle size={16} /> : saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[70vh]">

          {/* ── SIDEBAR NAV ── */}
          <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gradient-to-b from-gray-50/60 to-white p-5 shrink-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Configuration</p>
            <div className="space-y-1">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-250
                    ${activeTab === section.id
                      ? 'bg-gradient-to-r from-[#E6761D]/12 to-orange-500/8 text-[#E6761D] shadow-sm border border-[#E6761D]/20'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <section.icon
                      size={17}
                      className={`transition-all duration-250 ${activeTab === section.id ? 'text-[#E6761D]' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`}
                    />
                    <span>{section.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeColors[section.badge]}`}>
                        {section.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className={`transition-all duration-250 ${activeTab === section.id ? 'opacity-100 text-[#E6761D]' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Security badge */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="bg-gradient-to-br from-[#E6761D]/8 to-orange-500/5 rounded-2xl p-4 border border-[#E6761D]/15">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={15} className="text-[#E6761D]" />
                  <p className="text-xs font-bold text-gray-700">Security Status</p>
                  <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">All settings encrypted with 256-bit TLS.</p>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <CheckCircle size={11} /> All systems secure
                </div>
              </div>
            </div>
          </div>

          {/* ── CONTENT AREA ── */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-custom">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'brand' && <BrandTab theme={theme} setTheme={setTheme} primaryColor={primaryColor} setPrimaryColor={setPrimaryColor} />}
            {activeTab === 'seo' && <SeoTab />}
            {activeTab === 'integrations' && <IntegrationsTab showApiKey={showApiKey} setShowApiKey={setShowApiKey} />}
            {activeTab === 'email' && <EmailTab />}
            {activeTab === 'security' && <SecurityTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────── */
const SectionHeader = ({ title, desc }) => (
  <div className="mb-7 pb-5 border-b border-gray-100">
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500 mt-1">{desc}</p>
  </div>
);

/* ── GENERAL TAB ── */
const GeneralTab = () => (
  <div className="space-y-6 max-w-2xl page-enter">
    <SectionHeader title="General Configuration" desc="Basic platform settings and preferences" />
    <Input label="Platform Name" defaultValue="Hously Finntech Realty" type="text" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Input label="Support Email" defaultValue="support@hously.com" type="email" />
      <Select label="Default Currency">
        <option>Indian Rupee (INR) — ₹</option>
        <option>US Dollar (USD) — $</option>
        <option>Euro (EUR) — €</option>
      </Select>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Select label="Time Zone">
        <option>Asia/Kolkata (IST +5:30)</option>
        <option>America/New_York (EST)</option>
        <option>Europe/London (GMT)</option>
      </Select>
      <Select label="Date Format">
        <option>DD/MM/YYYY</option>
        <option>MM/DD/YYYY</option>
        <option>YYYY-MM-DD</option>
      </Select>
    </div>
    <Input label="Platform URL" defaultValue="https://hously.com" type="url" hint="Must include https://" />
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Platform Description</label>
      <textarea rows={3} defaultValue="India's premier real estate marketplace." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none
        focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.12)] transition-all resize-none hover:border-gray-300" />
    </div>
    <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100">
      <div className="flex items-center gap-2 mb-1">
        <Zap size={15} className="text-blue-600" />
        <p className="text-sm font-bold text-blue-800">Maintenance Mode</p>
      </div>
      <p className="text-xs text-blue-600 mb-3">When enabled, only admins can access the platform.</p>
      <Toggle checked={false} onChange={() => {}} />
    </div>
  </div>
);

/* ── BRAND TAB ── */
const BrandTab = ({ theme, setTheme, primaryColor, setPrimaryColor }) => {
  const colors = ['#E6761D', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4'];
  const themeOptions = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="space-y-7 max-w-2xl page-enter">
      <SectionHeader title="Brand & Theming" desc="Customize platform appearance and branding elements" />

      {/* Logo */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Platform Logo</label>
        <div className="flex items-center gap-5">
          <div className="h-18 w-18 rounded-2xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/30 w-16 h-16">H</div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700
              hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">
              <Upload size={14} /> Upload Logo
            </button>
            <p className="text-[11px] text-gray-400 mt-1.5">PNG, SVG · 200×50px recommended</p>
          </div>
          <button className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors">Remove</button>
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Theme Mode</label>
        <div className="flex gap-2.5">
          {themeOptions.map(t => (
            <button key={t.id} onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-250
                ${theme === t.id
                  ? 'border-[#E6761D] bg-[#E6761D]/10 text-[#E6761D] shadow-md shadow-orange-500/15'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
              <t.icon size={16} /> {t.label}
              {theme === t.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Color</label>
        <div className="flex items-center gap-3 flex-wrap">
          {colors.map(c => (
            <button key={c} onClick={() => setPrimaryColor(c)}
              className="relative w-10 h-10 rounded-full transition-all duration-250 hover:scale-110 hover:shadow-lg"
              style={{ backgroundColor: c, boxShadow: primaryColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined }}
            >
              {primaryColor === c && <Check size={14} className="text-white absolute inset-0 m-auto" />}
            </button>
          ))}
          <div className="relative">
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-full border border-gray-200 cursor-pointer" title="Custom color" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: primaryColor }} />
          <div>
            <p className="text-sm font-semibold text-gray-700">Current Color</p>
            <p className="text-xs text-gray-400 font-mono">{primaryColor}</p>
          </div>
        </div>
      </div>

      {/* Favicon */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Favicon</label>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all">
          <Upload size={14} /> Upload Favicon
        </button>
        <p className="text-[11px] text-gray-400 mt-1.5">32×32px or 64×64px ICO/PNG</p>
      </div>
    </div>
  );
};

/* ── SEO TAB ── */
const SeoTab = () => {
  const [titleLen, setTitleLen] = useState(42);
  const [descLen, setDescLen] = useState(152);

  return (
    <div className="space-y-6 max-w-2xl page-enter">
      <SectionHeader title="SEO Configuration" desc="Meta tags, sitemap, and search engine preferences" />

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-semibold text-gray-700">Meta Title</label>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${titleLen > 60 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {titleLen}/60 chars
          </span>
        </div>
        <input
          type="text"
          defaultValue="Hously - Premium Real Estate Platform"
          onChange={e => setTitleLen(e.target.value.length)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none
            focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.12)] transition-all hover:border-gray-300"
        />
        <p className="text-[11px] text-gray-400 mt-1">Recommended: 50–60 characters</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-semibold text-gray-700">Meta Description</label>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${descLen > 160 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {descLen}/160 chars
          </span>
        </div>
        <textarea rows={3}
          defaultValue="Discover luxury properties, commercial spaces, and investment opportunities with Hously Finntech Realty. Expert guidance for buyers and sellers."
          onChange={e => setDescLen(e.target.value.length)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none
            focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.12)] transition-all resize-none hover:border-gray-300"
        />
        <p className="text-[11px] text-gray-400 mt-1">Recommended: 150–160 characters</p>
      </div>

      <Input label="Focus Keywords" defaultValue="real estate, luxury homes, commercial property, investment" type="text"
        hint="Separate keywords with commas" />

      {/* SEO Actions */}
      <div className="space-y-3">
        {[
          { title: 'XML Sitemap', desc: 'Auto-generated daily • Last updated 2h ago', action: 'Regenerate', color: 'text-[#E6761D]', icon: Globe },
          { title: 'Robots.txt', desc: 'Allow all crawlers • Disallow /admin', action: 'Edit Rules', color: 'text-blue-600', icon: Shield },
          { title: 'Canonical URLs', desc: 'Prevent duplicate content issues', action: 'Configure', color: 'text-purple-600', icon: Globe },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50/60 rounded-2xl border border-gray-100
            hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-250">
            <div className="flex items-center gap-3">
              <item.icon size={16} className="text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
            <button className={`text-sm font-semibold ${item.color} hover:underline transition-colors`}>{item.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── INTEGRATIONS TAB ── */
const IntegrationsTab = ({ showApiKey, setShowApiKey }) => {
  const [copied, setCopied] = useState(false);
  const integrations = [
    { name: 'Google Maps API', desc: 'Property location mapping & nearby search', status: 'active', color: 'emerald' },
    { name: 'Razorpay Gateway', desc: 'Secure transaction processing', status: 'test', color: 'amber' },
    { name: 'SendGrid Email', desc: 'Transactional email delivery', status: 'active', color: 'emerald' },
    { name: 'WhatsApp Business', desc: 'Lead notifications via WhatsApp', status: 'inactive', color: 'gray' },
  ];

  const statusConfig = {
    active: { label: 'Active', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    test: { label: 'Test Mode', bg: 'bg-amber-100 text-amber-700 border-amber-200' },
    inactive: { label: 'Inactive', bg: 'bg-gray-100 text-gray-500 border-gray-200' },
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl page-enter">
      <SectionHeader title="API Keys & Integrations" desc="Manage third-party services and API credentials" />

      {/* Integrations Grid */}
      <div className="space-y-3">
        {integrations.map((int, i) => (
          <div key={i} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100
            hover:border-[#E6761D]/25 hover:shadow-md hover:shadow-orange-500/8 transition-all duration-300 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-200 group-hover:scale-105 transition-transform">
                <Database size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{int.name}</p>
                <p className="text-xs text-gray-400">{int.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusConfig[int.status].bg}`}>
                {statusConfig[int.status].label}
              </span>
              <button className="text-xs font-semibold text-[#E6761D] hover:text-orange-700 transition-colors">Configure</button>
            </div>
          </div>
        ))}
      </div>

      {/* API Key */}
      <div className="p-5 bg-gray-50/60 rounded-2xl border border-gray-100">
        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Key size={15} className="text-[#E6761D]" /> Admin API Key
        </label>
        <div className="flex items-center gap-2">
          <input
            type={showApiKey ? 'text' : 'password'}
            value="hously_live_sk_8x7k3m9n2p4q6r8t"
            readOnly
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono bg-white text-gray-700 outline-none"
          />
          <button onClick={() => setShowApiKey(!showApiKey)}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-all">
            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={handleCopy}
            className={`p-2.5 rounded-xl border transition-all duration-250
              ${copied ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2.5 flex items-center gap-1"><Lock size={10} /> Keep this key private. Never expose in client-side code.</p>
        <button className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
          <RefreshCw size={11} /> Regenerate API Key
        </button>
      </div>
    </div>
  );
};

/* ── EMAIL TAB ── */
const EmailTab = () => {
  const [notifs, setNotifs] = useState({
    newUser: true, newLead: true, dealClosed: true,
    systemAlerts: false, weeklyDigest: true, smsAlerts: false,
  });
  const toggle = key => setNotifs(p => ({ ...p, [key]: !p[key] }));

  const notifRows = [
    { key: 'newUser', label: 'New User Registration', desc: 'Alert when a new user signs up', icon: Users },
    { key: 'newLead', label: 'New Lead Assignment', desc: 'When a lead is assigned to an agent', icon: Bell },
    { key: 'dealClosed', label: 'Deal Closed', desc: 'Confirmation when a deal is marked complete', icon: CheckCircle },
    { key: 'systemAlerts', label: 'System Alerts', desc: 'Server errors and critical issues', icon: AlertTriangle },
    { key: 'weeklyDigest', label: 'Weekly Performance Digest', desc: 'Summarized KPIs every Monday morning', icon: Zap },
    { key: 'smsAlerts', label: 'SMS Notifications', desc: 'Receive alerts via SMS (extra charges apply)', icon: Bell },
  ];

  return (
    <div className="space-y-6 max-w-2xl page-enter">
      <SectionHeader title="Email & Notifications" desc="Configure email delivery and notification preferences" />

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <Server size={15} className="text-gray-400" /> SMTP Configuration
        </h3>
        <Input label="SMTP Host" defaultValue="smtp.gmail.com" type="text" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="SMTP Port" defaultValue="587" type="text" />
          <Select label="Encryption">
            <option>TLS (Recommended)</option>
            <option>SSL</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Username" defaultValue="noreply@hously.com" type="email" />
          <Input label="Password" type="password" defaultValue="••••••••••" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#E6761D] border border-[#E6761D]/30 bg-[#E6761D]/5
          hover:bg-[#E6761D]/10 hover:border-[#E6761D]/50 transition-all">
          <Zap size={14} /> Test Connection
        </button>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Bell size={15} className="text-gray-400" /> Notification Settings
        </h3>
        <div className="space-y-2">
          {notifRows.map(row => (
            <ToggleRow key={row.key} label={row.label} desc={row.desc} checked={notifs[row.key]} onChange={() => toggle(row.key)} icon={row.icon} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── SECURITY TAB ── */
const SecurityTab = () => {
  const [twoFA, setTwoFA] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [alerts, setAlerts] = useState({ unknownDevice: true, suspicious: false, weeklySummary: true });
  const toggleAlert = k => setAlerts(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-6 max-w-2xl page-enter">
      <SectionHeader title="Security" desc="Manage security policies, access controls, and login preferences" />

      {/* Active Alerts */}
      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-800">Security Recommendation</p>
          <p className="text-xs text-amber-700 mt-0.5">Enable IP whitelisting to restrict access to admin panel.</p>
        </div>
        <button className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 px-3 py-1 rounded-lg hover:bg-amber-100 transition-all flex-shrink-0">
          Enable
        </button>
      </div>

      {/* Security Toggles */}
      <div className="space-y-3">
        <ToggleRow label="Two-Factor Authentication (2FA)" desc="Require OTP for all admin logins" checked={twoFA} onChange={() => setTwoFA(!twoFA)} icon={Shield} />
        <ToggleRow label="IP Whitelist" desc="Restrict admin access to specific IP addresses" checked={ipWhitelist} onChange={() => setIpWhitelist(!ipWhitelist)} icon={Lock} />
      </div>

      {/* Session Timeout */}
      <div className="flex items-center justify-between p-4 bg-gray-50/60 rounded-2xl border border-gray-100
        hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-250">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Session Timeout</p>
            <p className="text-xs text-gray-400">Auto-logout after inactivity</p>
          </div>
        </div>
        <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.1)] transition-all bg-white">
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
          <option value="0">Never</option>
        </select>
      </div>

      {/* Login Alerts */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Bell size={15} className="text-gray-400" /> Login Alerts
        </h3>
        <div className="space-y-2">
          <ToggleRow label="Unknown Device Login" desc="Email alert on new device login" checked={alerts.unknownDevice} onChange={() => toggleAlert('unknownDevice')} icon={Shield} />
          <ToggleRow label="Suspicious Activity" desc="SMS alert for failed login attempts" checked={alerts.suspicious} onChange={() => toggleAlert('suspicious')} icon={AlertCircle} iconColor="text-red-500" />
          <ToggleRow label="Weekly Login Summary" desc="Summary of all admin login activity" checked={alerts.weeklySummary} onChange={() => toggleAlert('weeklySummary')} icon={Mail} />
        </div>
      </div>

      {/* Password Policy */}
      <div className="p-4 bg-gray-50/60 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-gray-500" />
            <p className="text-sm font-bold text-gray-800">Password Policy</p>
          </div>
          <button className="text-xs font-semibold text-[#E6761D] hover:text-orange-700 transition-colors">Configure</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['Min 8 characters', 'Uppercase required', 'Number required', 'Symbol required'].map(rule => (
            <div key={rule} className="flex items-center gap-1.5 text-xs text-gray-600">
              <CheckCircle size={12} className="text-emerald-500" /> {rule}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 bg-red-50/80 rounded-2xl border border-red-200">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-red-800 mb-1">Danger Zone</p>
            <p className="text-sm text-red-600 mb-4">These actions are irreversible. Proceed with extreme caution.</p>
            <div className="flex gap-3 flex-wrap">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-semibold border border-red-200
                hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg transition-all duration-250">
                <RefreshCw size={14} /> Reset API Keys
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold border border-red-600
                hover:bg-red-700 hover:shadow-lg transition-all duration-250">
                <Trash2 size={14} /> Delete Platform Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Missing import fix
const Clock = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default Settings;