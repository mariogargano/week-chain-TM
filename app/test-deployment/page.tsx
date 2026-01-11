export default function TestDeploymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl text-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500 mb-6">
          DEPLOYMENT TEST
        </h1>
        <p className="text-3xl font-bold text-slate-900 mb-4">✅ Version 2.0.1 Loaded Successfully</p>
        <p className="text-xl text-slate-600 mb-8">If you can see this page, the deployment is working correctly.</p>
        <div className="space-y-4 text-left bg-slate-50 p-6 rounded-xl">
          <p className="text-lg font-semibold text-slate-900">Changes Applied:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-700">
            <li>WEEK Review added to footer (blue)</li>
            <li>WEEK Live In Style (name updated)</li>
            <li>Mundo-WEEK with Globe icon</li>
            <li>Wedding card luxury image</li>
            <li>WEEK Fundación (renamed from WEEK-CARE)</li>
          </ul>
        </div>
        <a
          href="/"
          className="mt-8 inline-block bg-gradient-to-r from-pink-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
        >
          Go to Home Page
        </a>
      </div>
    </div>
  )
}
