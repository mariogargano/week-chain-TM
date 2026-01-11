export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-green-600 mb-4">✅ Sistema Funcionando</h1>
        <p className="text-xl text-gray-700 mb-6">
          Si ves esta página, el routing de Next.js está funcionando correctamente.
        </p>
        <div className="space-y-3 bg-gray-50 p-6 rounded-xl">
          <p className="font-mono text-sm">
            <strong>Versión:</strong> 182
          </p>
          <p className="font-mono text-sm">
            <strong>Fecha:</strong> {new Date().toLocaleString()}
          </p>
          <p className="font-mono text-sm">
            <strong>Ruta:</strong> /debug
          </p>
        </div>
        <div className="mt-6">
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            Ir a Home
          </a>
        </div>
      </div>
    </div>
  )
}
