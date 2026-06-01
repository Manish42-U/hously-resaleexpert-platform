import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, Lock, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      const user = response.data?.user;

      if (!['admin', 'manager', 'agent'].includes(user?.role)) {
        setError('Admin, manager or agent access required. Please use an authorized account.');
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#eef2f6] md:flex-row">
      {/* Left side – image carousel (takes half on desktop, full on mobile) */}
      <AuthVisual />

      {/* Right side – login form */}
      <div className="relative flex flex-1 items-center justify-center p-5 md:min-h-screen">
        <div className="pointer-events-none absolute -right-24 -top-24 hidden h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(193,163,120,0.13)_0%,transparent_70%)] md:block" />
        <div className="relative z-10 w-full max-w-[415px] rounded-[36px] bg-white px-6 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.07),0_20px_56px_rgba(0,0,0,0.08)] sm:px-8 sm:py-10">
          <div className="absolute left-6 right-6 top-0 h-1 rounded-b-md bg-gradient-to-r from-transparent via-[#E8720C] to-transparent sm:left-9 sm:right-9" />
          <h1 className="text-2xl font-extrabold tracking-[-0.025em] text-[#111] sm:text-[26px]">
            Welcome back!
          </h1>
          <p className="mb-6 mt-1 text-sm text-[#9a9a9a] sm:mb-8">
            Sign in to continue to your account
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              icon={Mail}
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@resaleexpert.in"
              type="email"
            />
            <Field
              icon={Lock}
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              action={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[#c1a378]"
                >
                  <Eye size={17} />
                </button>
              }
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-[#666]">
                <input type="checkbox" className="accent-[#c1a378]" />
                Remember me
              </label>
              <button type="button" className="text-sm font-medium text-[#E8720C]">
                Forgot password?
              </button>
            </div>
            <button
              disabled={loading}
              className="w-full rounded-[14px] bg-gradient-to-br from-[#16162a] to-[#2a2a4a] py-3.5 font-bold tracking-wide text-white transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#ece8e0]" />
            <span className="text-xs tracking-wide text-[#c0bab0]">secure login</span>
            <div className="h-px flex-1 bg-[#ece8e0]" />
          </div>
          <div className="flex items-center justify-center text-sm">
            <Link className="text-[#1B4B72] hover:text-[#E8720C]" to="/login">
              Admin access only
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, label, value, onChange, action, type = 'text', placeholder }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#1B4B72]">
      {label}
    </span>
    <div className="flex items-center rounded-[14px] border border-[#ece8e0] bg-[#faf8f5] px-4 transition-all focus-within:border-[#c1a378] focus-within:bg-white focus-within:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)]">
      <Icon size={17} className="mr-2 text-[#c0bab0]" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={placeholder}
        className="h-12 flex-1 bg-transparent text-sm text-[#111] outline-none placeholder:text-[#c0bab0]"
      />
      {action}
    </div>
  </label>
);

const AuthVisual = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      badge: 'Premium Estates',
      stat: '350+ luxury listings',
      description: 'Curated selection of high-value properties',
    },
    {
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      badge: 'Smart Investment',
      stat: '24% avg. ROI',
      description: 'Data-driven insights for profitable deals',
    },
    {
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      badge: 'Expert Guidance',
      stat: '5000+ clients served',
      description: 'End-to-end documentation & legal support',
    },
    {
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      badge: 'Prime Locations',
      stat: 'Metro & suburbs',
      description: 'Properties in most sought-after areas',
    },
    {
      image: 'https://images.unsplash.com/photo-1449844908441-8822252f58a5?auto=format&fit=crop&w=1200&q=80',
      badge: 'Instant Valuation',
      stat: 'AI-powered pricing',
      description: 'Real-time market analysis & trends',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const goToPrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const goToSlide = (index) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full overflow-hidden md:w-[46%] md:min-h-screen">
      <div className="relative h-[320px] w-full md:h-screen">
        {/* Background image with smooth transition */}
        <div className="absolute inset-0 transition-all duration-700 ease-out">
          <img
            key={currentSlide.image}
            src={currentSlide.image}
            alt="Property showcase"
            className={`h-full w-full object-cover transition-all duration-700 ${
              isTransitioning ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            }`}
          />
        </div>

        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
          {/* Top bar */}
          <div className="flex items-start justify-between">
            <img
              src="https://resaleexpert.in/uploads/system/footer_logo-1759471021661-685054072-Resale_Expert_White.png"
              alt="ResaleExpert"
              className="h-10 drop-shadow-xl md:h-12"
            />
            <div className="rounded-full border border-white/30 bg-white/20 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-white/30">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                {currentSlide.badge}
              </span>
            </div>
          </div>

          {/* Bottom content */}
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-extrabold leading-tight text-white drop-shadow-xl md:text-4xl lg:text-5xl">
                Resale Made Simple
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/80 drop-shadow md:text-base">
                {currentSlide.description}
              </p>
            </div>

            {/* Stat card */}
            <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-md">
              <div className="h-8 w-0.5 bg-[#E8720C]" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                  Featured insight
                </p>
                <p className="text-sm font-bold text-white md:text-base">
                  {currentSlide.stat}
                </p>
              </div>
            </div>

            {/* Carousel controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={goToPrev}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} className="text-white" />
                </button>
                <button
                  onClick={goToNext}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110"
                  aria-label="Next"
                >
                  <ChevronRight size={18} className="text-white" />
                </button>
              </div>
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`transition-all duration-300 ${
                      idx === currentIndex
                        ? 'h-1.5 w-8 bg-white shadow-lg'
                        : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/80'
                    } rounded-full`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
