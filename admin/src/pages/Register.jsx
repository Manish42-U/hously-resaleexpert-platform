import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Lock, Mail, User } from 'lucide-react'
import { authService, getErrorMessage } from '../services/api'

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.register({ name, email, password, role: 'admin' })
      navigate('/login')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#eef2f6]">
      <AuthVisual />
      <div className="relative flex flex-1 items-center justify-center p-5">
        <div className="relative z-10 w-full max-w-[415px] rounded-[36px] bg-white px-8 py-10 shadow-[0_20px_56px_rgba(0,0,0,0.08)]">
          <div className="absolute left-9 right-9 top-0 h-1 rounded-b-md bg-gradient-to-r from-transparent via-[#E8720C] to-transparent" />
          <h1 className="text-[26px] font-extrabold tracking-[-0.025em] text-[#111]">Create admin</h1>
          <p className="mb-8 mt-1 text-sm text-[#9a9a9a]">Temporary admin registration for setup</p>
          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field icon={User} label="Full Name" value={name} onChange={setName} placeholder="Admin User" />
            <Field icon={Mail} label="Email" value={email} onChange={setEmail} placeholder="you@resaleexpert.in" type="email" />
            <Field
              icon={Lock}
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              action={<button type="button" onClick={() => setShowPassword((value) => !value)} className="text-[#c1a378]"><Eye size={17} /></button>}
            />
            <button disabled={loading} className="w-full rounded-[14px] bg-gradient-to-br from-[#16162a] to-[#2a2a4a] py-3.5 font-bold text-white disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            <Link className="font-semibold text-[#E8720C]" to="/login">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const Field = ({ icon: Icon, label, value, onChange, action, type = 'text', placeholder }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#1B4B72]">{label}</span>
    <div className="flex items-center rounded-[14px] border border-[#ece8e0] bg-[#faf8f5] px-4 focus-within:border-[#c1a378] focus-within:bg-white">
      <Icon size={17} className="mr-2 text-[#c0bab0]" />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        placeholder={placeholder}
        className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-[#c0bab0]"
      />
      {action}
    </div>
  </label>
)

const AuthVisual = () => (
  <div className="relative hidden min-h-screen flex-[0_0_46%] flex-col justify-between overflow-hidden rounded-r-[56px] shadow-[12px_0_48px_rgba(0,0,0,0.22)] md:flex">
    <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80" alt="Property" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/5 to-black/75" />
    <div className="relative z-10 px-10 py-8">
      <img src="https://resaleexpert.in/uploads/system/footer_logo-1759471021661-685054072-Resale_Expert_White.png" alt="ResaleExpert" className="h-12" />
    </div>
    <div className="relative z-10 p-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        Live listings
      </div>
      <h2 className="text-4xl font-extrabold leading-tight text-white">Resale Made Simple</h2>
      <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">Expert guidance from search to final documentation</p>
    </div>
  </div>
)

export default Register
