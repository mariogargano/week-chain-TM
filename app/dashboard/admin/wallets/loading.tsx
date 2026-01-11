export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-lg" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-32 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-96 bg-slate-200 rounded-lg" />
    </div>
  )
}
