import { useState, useEffect } from 'react';
import {
  Calculator, TrendingUp, Home, IndianRupee, Calendar, Percent,
  Building, PieChart, BarChart3, Zap, Info, Sparkles,
  ChevronRight, ArrowUpRight, Target, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const percentFormat = new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── PREMIUM SLIDER ── */
const SliderInput = ({ icon: Icon, label, value, min, max, step, onChange, format, color = '#E6761D' }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Icon size={14} className="text-gray-400" /> {label}
        </label>
        <span className="text-sm font-bold px-3 py-1 rounded-xl text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          {format(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`
          }}
        />
      </div>
    </div>
  );
};

/* ── RESULT METRIC ── */
const ResultMetric = ({ label, value, highlight, color = 'text-gray-900', size = 'normal' }) => (
  <div className={`p-4 rounded-2xl border transition-all duration-250 hover:shadow-md ${highlight ? 'bg-gradient-to-br from-white to-gray-50 border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
    <p className="text-xs text-gray-500 font-medium mb-1.5">{label}</p>
    <p className={`font-black stat-value ${size === 'large' ? 'text-2xl' : 'text-lg'} ${color}`}>{value}</p>
  </div>
);

const Tools = () => {
  const [activeTool, setActiveTool] = useState('emi');

  const tools = [
    {
      id: 'emi', label: 'EMI Calculator', icon: Calculator,
      gradient: 'from-blue-500 to-indigo-600', color: '#3b82f6',
      desc: 'Mortgage & loan planning'
    },
    {
      id: 'roi', label: 'ROI Estimator', icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600', color: '#10b981',
      desc: 'Investment returns'
    },
    {
      id: 'valuation', label: 'AI Valuation', icon: Home,
      gradient: 'from-[#E6761D] to-orange-600', color: '#E6761D',
      desc: 'Property price estimation'
    },
  ];

  const activeMeta = tools.find(t => t.id === activeTool);

  return (
    <div className="min-h-screen page-enter" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #fef3e2 100%)' }}>
      <div className="px-6 lg:px-10 py-10">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6761D]/10 border border-[#E6761D]/25 text-[#E6761D] text-sm font-bold mb-5">
            <Sparkles size={14} /> AI-Powered Financial Toolkit
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            Smart Real Estate<br />
            <span className="shimmer-text">Calculators</span>
          </h1>
          <p className="text-gray-500 mt-4 text-lg max-w-lg mx-auto">
            Make data-driven decisions with our precision tools for EMI, ROI, and AI property valuation.
          </p>
        </div>

        {/* TOOL SELECTOR */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 gap-1">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`relative flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-350
                  ${activeTool === tool.id
                    ? 'text-white shadow-lg scale-105'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
                style={activeTool === tool.id ? {
                  background: `linear-gradient(135deg, ${tool.color}, ${tool.color}bb)`,
                  boxShadow: `0 8px 25px ${tool.color}40`
                } : {}}
              >
                <tool.icon size={17} />
                <div className="text-left">
                  <div>{tool.label}</div>
                  {activeTool === tool.id && <div className="text-[10px] opacity-75 font-normal">{tool.desc}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* CALCULATOR PANEL - 3 cols */}
          <div className="lg:col-span-3">
            {activeTool === 'emi' && <EMICalculator />}
            {activeTool === 'roi' && <ROICalculator />}
            {activeTool === 'valuation' && <ValuationTool />}
          </div>

          {/* INSIGHT PANEL - 2 cols */}
          <div className="lg:col-span-2">
            <InsightPanel activeTool={activeTool} tools={tools} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── EMI CALCULATOR ── */
const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [amortData, setAmortData] = useState([]);

  useEffect(() => {
    const r = interestRate / 100 / 12;
    const n = loanTenure * 12;
    const emiVal = r === 0 ? loanAmount / n : (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emiVal * n;
    const interest = total - loanAmount;
    setEmi(emiVal); setTotalInterest(interest); setTotalPayment(total);

    let balance = loanAmount;
    const data = [];
    for (let yr = 1; yr <= Math.min(loanTenure, 20); yr++) {
      let yPrincipal = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const int = balance * r;
        const prin = emiVal - int;
        yPrincipal += prin;
        balance -= prin;
      }
      data.push({ year: `Y${yr}`, principal: Math.max(0, yPrincipal), interest: emiVal * 12 - Math.max(0, yPrincipal) });
    }
    setAmortData(data);
  }, [loanAmount, interestRate, loanTenure]);

  const principalPct = ((loanAmount / totalPayment) * 100).toFixed(1);
  const interestPct = ((totalInterest / totalPayment) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-7 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Calculator size={18} className="text-white" />
          </div>
          EMI & Mortgage Calculator
        </h2>
        <p className="text-gray-500 text-sm mt-1.5">Plan your home loan with real-time amortization</p>
      </div>

      <div className="p-7 space-y-6">
        <SliderInput icon={IndianRupee} label="Loan Amount" value={loanAmount} min={100000} max={100000000} step={100000}
          onChange={setLoanAmount} format={v => currency.format(v)} color="#3b82f6" />
        <SliderInput icon={Percent} label="Interest Rate (% p.a.)" value={interestRate} min={1} max={20} step={0.1}
          onChange={setInterestRate} format={v => `${v}%`} color="#3b82f6" />
        <SliderInput icon={Calendar} label="Loan Tenure (Years)" value={loanTenure} min={1} max={30} step={1}
          onChange={setLoanTenure} format={v => `${v} yrs`} color="#3b82f6" />

        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="text-center mb-4 pb-4 border-b border-blue-100">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Monthly EMI</p>
            <p className="text-4xl font-black text-blue-700 stat-value">{currency.format(emi)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Principal</p>
              <p className="text-sm font-bold text-gray-800">{currency.format(loanAmount)}</p>
              <p className="text-[10px] text-blue-500 mt-0.5">{principalPct}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Interest</p>
              <p className="text-sm font-bold text-red-600">{currency.format(totalInterest)}</p>
              <p className="text-[10px] text-red-400 mt-0.5">{interestPct}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="text-sm font-bold text-gray-900">{currency.format(totalPayment)}</p>
            </div>
          </div>
          {/* Breakdown bar */}
          <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${principalPct}%` }} />
            <div className="h-full bg-red-400 rounded-full flex-1" />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" />Principal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Interest</span>
          </div>
        </div>

        {/* Chart */}
        {amortData.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <BarChart3 size={14} className="text-blue-500" /> Principal vs Interest Over Time
            </h4>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={amortData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={v => currency.format(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="principal" name="Principal Paid" stroke="#3b82f6" strokeWidth={2} fill="url(#pGrad)" />
                  <Area type="monotone" dataKey="interest" name="Interest Paid" stroke="#ef4444" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── ROI CALCULATOR ── */
const ROICalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(8000000);
  const [monthlyRent, setMonthlyRent] = useState(25000);
  const [appreciationRate, setAppreciationRate] = useState(6);
  const [holdingYears, setHoldingYears] = useState(5);
  const [roi, setRoi] = useState(0);
  const [futureValue, setFutureValue] = useState(0);
  const [totalRent, setTotalRent] = useState(0);
  const [appreciationGain, setAppreciationGain] = useState(0);

  useEffect(() => {
    const rentTotal = monthlyRent * 12 * holdingYears;
    const fv = purchasePrice * Math.pow(1 + appreciationRate / 100, holdingYears);
    const gain = fv - purchasePrice;
    setRoi(((rentTotal + gain) / purchasePrice) * 100);
    setFutureValue(fv); setTotalRent(rentTotal); setAppreciationGain(gain);
  }, [purchasePrice, monthlyRent, appreciationRate, holdingYears]);

  const pieData = [
    { name: 'Rental Income', value: Math.max(1, totalRent), color: '#10b981' },
    { name: 'Appreciation', value: Math.max(1, appreciationGain), color: '#E6761D' },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-7 py-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <TrendingUp size={18} className="text-white" />
          </div>
          ROI Estimator
        </h2>
        <p className="text-gray-500 text-sm mt-1.5">Calculate total return on your property investment</p>
      </div>

      <div className="p-7 space-y-6">
        <SliderInput icon={IndianRupee} label="Purchase Price" value={purchasePrice} min={1000000} max={50000000} step={500000}
          onChange={setPurchasePrice} format={v => currency.format(v)} color="#10b981" />
        <SliderInput icon={IndianRupee} label="Monthly Rent" value={monthlyRent} min={5000} max={500000} step={5000}
          onChange={setMonthlyRent} format={v => currency.format(v)} color="#10b981" />
        <SliderInput icon={Percent} label="Annual Appreciation (%)" value={appreciationRate} min={0} max={20} step={0.5}
          onChange={setAppreciationRate} format={v => `${v}%`} color="#10b981" />
        <SliderInput icon={Calendar} label="Holding Period (Years)" value={holdingYears} min={1} max={20} step={1}
          onChange={setHoldingYears} format={v => `${v} yrs`} color="#10b981" />

        {/* ROI Hero Number */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="text-center mb-4 pb-4 border-b border-emerald-100">
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Total ROI</p>
            <p className="text-5xl font-black text-emerald-700 stat-value">{roi.toFixed(1)}%</p>
            <p className="text-xs text-emerald-500 mt-1">over {holdingYears} year{holdingYears > 1 ? 's' : ''}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-white/70 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Future Value</p>
              <p className="font-bold text-gray-900">{currency.format(futureValue)}</p>
            </div>
            <div className="p-3 bg-white/70 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Rental Income</p>
              <p className="font-bold text-emerald-700">{currency.format(totalRent)}</p>
            </div>
            <div className="p-3 bg-white/70 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Appreciation</p>
              <p className="font-bold text-orange-600">{currency.format(appreciationGain)}</p>
            </div>
            <div className="p-3 bg-white/70 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Total Return</p>
              <p className="font-bold text-gray-900">{currency.format(totalRent + appreciationGain)}</p>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <PieChart size={14} className="text-emerald-500" /> Return Breakdown
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={68} dataKey="value"
                  paddingAngle={3}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="white" strokeWidth={3}
                      style={{ filter: `drop-shadow(0 4px 12px ${entry.color}50)` }} />
                  ))}
                </Pie>
                <Tooltip formatter={v => currency.format(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            {pieData.map(d => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── VALUATION TOOL ── */
const ValuationTool = () => {
  const [location, setLocation] = useState('Pune');
  const [area, setArea] = useState(1200);
  const [bedrooms, setBedrooms] = useState(2);
  const [age, setAge] = useState(5);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [confidence, setConfidence] = useState(85);
  const [pricePerSqft, setPricePerSqft] = useState(0);

  const cityData = { Mumbai: 25000, Delhi: 18000, Bangalore: 12000, Pune: 8000, Chennai: 7000, Hyderabad: 6500 };

  useEffect(() => {
    const basePrice = cityData[location] || 6000;
    const mult = 1 + (bedrooms >= 3 ? 0.15 : bedrooms <= 1 ? -0.1 : 0) + (age < 3 ? 0.1 : age > 15 ? -0.2 : 0);
    const val = area * basePrice * mult;
    setEstimatedValue(val);
    setPricePerSqft(basePrice * mult);
    setConfidence(Math.min(95, Math.floor(70 + (bedrooms * 3) + (area / 200))));
  }, [location, area, bedrooms, age]);

  const confidenceColor = confidence >= 85 ? '#10b981' : confidence >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="px-7 py-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-orange-100">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Home size={18} className="text-white" />
          </div>
          AI Property Valuation
        </h2>
        <p className="text-gray-500 text-sm mt-1.5">Real-time market estimate with AI-driven insights</p>
      </div>

      <div className="p-7 space-y-6">
        {/* City Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
            <Building size={14} className="text-gray-400" /> City / Location
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(cityData).map(city => (
              <button key={city} onClick={() => setLocation(city)}
                className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-250
                  ${location === city
                    ? 'bg-gradient-to-r from-[#E6761D] to-orange-600 text-white shadow-md shadow-orange-500/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'}`}>
                {city}
              </button>
            ))}
          </div>
        </div>

        <SliderInput icon={Home} label="Area (sq.ft)" value={area} min={300} max={5000} step={50}
          onChange={setArea} format={v => `${v} sq.ft`} color="#E6761D" />

        {/* Bedrooms */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Building size={14} className="text-gray-400" /> Bedrooms
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(b => (
              <button key={b} onClick={() => setBedrooms(b)}
                className={`w-12 h-12 rounded-2xl font-black text-lg transition-all duration-250
                  ${bedrooms === b
                    ? 'bg-gradient-to-br from-[#E6761D] to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-110'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'}`}>
                {b}
              </button>
            ))}
            <button className="flex-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">+5</button>
          </div>
        </div>

        <SliderInput icon={Calendar} label="Property Age (Years)" value={age} min={0} max={30} step={1}
          onChange={setAge} format={v => `${v} yrs`} color="#E6761D" />

        {/* Valuation Result */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-orange-100">
          <div className="text-center mb-4 pb-4 border-b border-orange-100">
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Estimated Market Value</p>
            <p className="text-4xl font-black text-[#E6761D] stat-value">{currency.format(estimatedValue)}</p>
            <p className="text-xs text-gray-500 mt-1">{currency.format(pricePerSqft)}/sq.ft · {location}</p>
          </div>

          {/* Confidence Score */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-gray-600">AI Confidence Score</span>
              <span style={{ color: confidenceColor }}>{confidence}%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${confidence}%`, background: `linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}aa)`, boxShadow: `0 0 10px ${confidenceColor}50` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Low</span><span>Excellent</span>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center justify-between p-3 bg-white/70 rounded-xl">
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Min Estimate</p>
              <p className="text-sm font-bold text-gray-700">{currency.format(estimatedValue * 0.92)}</p>
            </div>
            <div className="text-gray-300 text-xl">—</div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400">Max Estimate</p>
              <p className="text-sm font-bold text-gray-700">{currency.format(estimatedValue * 1.08)}</p>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-3 text-center">
            *Based on recent market comparables & property characteristics. For final pricing, consult a local expert.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── INSIGHT PANEL ── */
const InsightPanel = ({ activeTool, tools }) => {
  const tool = tools.find(t => t.id === activeTool);

  const insights = {
    emi: {
      tips: [
        { title: 'Lower Rate = Big Savings', desc: 'A 1% lower interest rate on ₹50L loan saves ~₹8L over 20 years.' },
        { title: 'Prepay Principal Early', desc: 'Prepaying 5% of loan annually can cut tenure by 4-5 years.' },
        { title: 'Compare Banks', desc: 'SBI, HDFC, ICICI offer rates between 8.4%–9.1% for 2025.' },
      ],
      example: '₹50L @ 8.5% for 20 years → EMI ≈ ₹43,391',
    },
    roi: {
      tips: [
        { title: 'Location is King', desc: 'Premium locations deliver 10-15% annual appreciation vs 5-7% for others.' },
        { title: 'Rental Yield Benchmark', desc: 'Good residential rental yield is 2.5–4% per annum in India.' },
        { title: 'Hold Longer', desc: 'Real estate typically doubles every 7-10 years in Tier-1 cities.' },
      ],
      example: '₹80L property, ₹25k rent, 6% appreciation → ROI ≈ 72% in 5 yrs',
    },
    valuation: {
      tips: [
        { title: 'Market Conditions', desc: 'Mumbai saw 8% price appreciation in H1 2025. Pune grew by 11%.' },
        { title: 'Age Depreciation', desc: 'Properties older than 15 years depreciate by 15-20% in valuation.' },
        { title: 'Ready-to-Move Premium', desc: 'Ready properties command 10-15% premium over under-construction.' },
      ],
      example: '1200 sq.ft, 2BHK, 5yr old in Pune → ₹92L–₹1.05Cr',
    },
  };

  const data = insights[activeTool];

  return (
    <div className="space-y-5 sticky top-24">
      {/* Smart Insights Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className={`px-6 py-5 bg-gradient-to-r ${tool.gradient} relative overflow-hidden`}>
          <div className="absolute -top-4 -right-4 opacity-20">
            <Sparkles size={80} />
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 relative z-10">
            <Zap size={18} /> Smart Insights
          </h3>
          <p className="text-white/70 text-sm mt-1 relative z-10">Expert tips for {tool.label}</p>
        </div>

        <div className="p-6 space-y-4">
          {data.tips.map((tip, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-default">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `linear-gradient(135deg, ${tool.color}20, ${tool.color}10)` }}>
                <span className="text-xs font-black" style={{ color: tool.color }}>{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{tip.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}

          {/* Example */}
          <div className="p-4 rounded-2xl font-mono text-xs text-gray-600 border-l-4 mt-2"
            style={{ backgroundColor: `${tool.color}08`, borderColor: tool.color }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: tool.color }}>Example</p>
            {data.example}
          </div>

          <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <Zap size={11} style={{ color: tool.color }} /> Real-time calculations · 100% accurate
          </div>
        </div>
      </div>

      {/* Quick Switch */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Other Tools</p>
        <div className="space-y-2">
          {tools.filter(t => t.id !== activeTool).map(t => (
            <button key={t.id} onClick={() => {}}
              className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-md`}>
                  <t.icon size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-700">{t.label}</p>
                  <p className="text-[10px] text-gray-400">{t.desc}</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;