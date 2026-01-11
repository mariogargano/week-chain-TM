export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-lg" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-48 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-200 rounded-lg" />
        <div className="h-48 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-64 bg-slate-200 rounded-lg" />
    </div>
  )
}
