import { AlertTriangle } from 'lucide-react'

export default function NotConfigured() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Supabase Belum Dikonfigurasi</h2>
        <p className="text-gray-400 mb-4">
          Untuk menggunakan dashboard, tambahkan credentials Supabase ke file{' '}
          <code className="bg-gray-700 px-2 py-1 rounded text-sm">.env.local</code>
        </p>
        <div className="bg-gray-900 rounded-lg p-4 text-left text-sm">
          <p className="text-gray-400 mb-2">Tambahkan di .env.local:</p>
          <code className="text-green-400">
            NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
            <br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
          </code>
        </div>
      </div>
    </div>
  )
}
