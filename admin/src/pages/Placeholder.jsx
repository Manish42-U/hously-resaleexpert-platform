import { Construction } from 'lucide-react'

const Placeholder = ({ title }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center max-w-md">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#E6761D]/20 to-[#E6761D]/5 shadow-inner">
          <Construction size={48} className="text-[#E6761D]" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="mb-8 text-gray-500">
          This module is currently under development. It will be available in a future update.
        </p>
        <button
          onClick={() => window.history.back()}
          className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 transition-all hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

export default Placeholder
