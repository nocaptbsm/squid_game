'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, UserCheck, Activity, XCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ROUND_ORDER, ROUND_LABELS } from '@/lib/constants'

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, colorClass, href }: any) {
  const content = (
    <div className="h-card p-6 h-full hover:border-primary/50 transition-colors cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`p-2 rounded-lg ${colorClass}`}><Icon className="w-5 h-5" /></div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">View players →</p>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

// ─── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border shadow-sm rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Donut label ──────────────────────────────────────────────────────────────
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

const DONUT_COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444']

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/players?limit=1000')
      .then(res => res.json())
      .then(data => {
        setPlayers(data.players || [])
        setLoading(false)
      })
  }, [])

  const handleAllocateQR = async (playerId: string) => {
    try {
      const res = await fetch('/api/admin/allocate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: [playerId] }),
      })
      const data = await res.json()
      if (data.success) {
        // Refresh player list
        const res = await fetch('/api/players?limit=1000')
        const data = await res.json()
        setPlayers(data.players || [])
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Failed to allocate QR')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading statistics...</span>
        </div>
      </div>
    )
  }

  // ── Derived stats ────────────────────────────────────────────────
  const total = players.length
  const registered = players.filter(p => p.isRegistered).length
  const eliminated = players.filter(p => p.rounds?.some((r: any) => r.status === 'ELIMINATED')).length
  const surviving = registered - eliminated
  const pending = total - registered

  // ── Donut data ───────────────────────────────────────────────────
  const statusDonut = [
    { name: 'Unregistered', value: pending },
    { name: 'Registered', value: registered > 0 ? surviving + eliminated : 0 },
    { name: 'Surviving', value: surviving },
    { name: 'Eliminated', value: eliminated },
  ].filter(d => d.value > 0)

  // ── Per-round bar data ───────────────────────────────────────────
  const roundBarData = ROUND_ORDER.map(roundName => {
    const allRounds = players.flatMap(p => p.rounds?.filter((r: any) => r.round === roundName) ?? [])
    const survived = allRounds.filter((r: any) => r.status === 'SURVIVED').length
    const elim = allRounds.filter((r: any) => r.status === 'ELIMINATED').length
    const pending = allRounds.filter((r: any) => r.status === 'PENDING').length
    return {
      name: ROUND_LABELS[roundName as keyof typeof ROUND_LABELS],
      Survived: survived,
      Eliminated: elim,
      Pending: pending,
    }
  })

  // ── Registration funnel ──────────────────────────────────────────
  const funnelData = [
    { name: 'Seeded', value: total, fill: '#94a3b8' },
    { name: 'Registered', value: registered, fill: '#3b82f6' },
    { name: 'Surviving', value: surviving, fill: '#22c55e' },
  ]

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Live overview of all participant data.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Seeded"  value={total}      icon={Users}     colorClass="bg-gray-100 text-gray-600"  href="/admin/players?filter=all" />
        <StatCard label="Registered"    value={registered} icon={UserCheck} colorClass="bg-blue-50 text-blue-600"   href="/admin/players?filter=registered" />
        <StatCard label="Surviving"     value={surviving}  icon={Activity}  colorClass="bg-green-50 text-green-600" href="/admin/players?filter=surviving" />
        <StatCard label="Eliminated"    value={eliminated} icon={XCircle}   colorClass="bg-red-50 text-red-600"     href="/admin/players?filter=eliminated" />
      </div>

      {/* Row 1: Funnel + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Funnel bar chart */}
        <div className="h-card p-6 lg:col-span-3">
          <h3 className="text-base font-semibold text-foreground mb-1">Participant Funnel</h3>
          <p className="text-xs text-muted-foreground mb-6">How many players progress through each stage</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData} barSize={52}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut */}
        <div className="h-card p-6 lg:col-span-2 flex flex-col">
          <h3 className="text-base font-semibold text-foreground mb-1">Status Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Current player status distribution</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {statusDonut.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
                />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Per-round breakdown */}
      <div className="h-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-1">Round-by-Round Results</h3>
        <p className="text-xs text-muted-foreground mb-6">Survived / Eliminated / Pending per round</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={roundBarData} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>}
            />
            <Bar dataKey="Survived"   fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Eliminated" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pending"    fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3: Registration progress metrics */}
      <div className="h-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-6">Progress Metrics</h3>
        <div className="space-y-5">
          {[
            { label: 'Registration rate', value: registered, total: 350, color: 'bg-blue-500' },
            { label: 'QR Pool Utilization', value: registered, total: 350, color: 'bg-red-500' },
            { label: 'Survival rate (of registered)', value: surviving, total: registered, color: 'bg-green-500' },
          ].map(({ label, value, total: denom, color }) => {
            const pct = denom > 0 ? Math.round((value / denom) * 100) : 0
            return (
              <div key={label}>
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground">{value} <span className="text-muted-foreground font-normal">/ {denom}</span> · {pct}%</span>
                </div>
                <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 4: QR Allocated Students (Capped 350) */}
      <div className="h-card overflow-hidden border-red-500/20 mb-8">
        <div className="p-6 border-b border-red-900/10 bg-red-950/10 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-white uppercase tracking-widest">QR Protocol Allocation</h3>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">Authorized Student Pool (Limit: 350)</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{registered}</span>
            <span className="text-red-900 text-sm font-bold"> / 350</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-900/5 text-[10px] font-black uppercase tracking-[0.3em] text-red-900/60 border-b border-red-900/10">
                <th className="px-6 py-4 font-black">Student ID</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/5">
              {players.filter(p => p.isRegistered).slice(0, 350).map((player) => (
                <tr key={player.id} className="hover:bg-red-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-white font-mono">STU-{player.playerNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Participant</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-red-500 rounded-none shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {registered === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                    No QR students registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Total Seeded Players List */}
      <div className="h-card overflow-hidden">
        <div className="p-6 border-b border-red-900/10 bg-black/5">
          <h3 className="text-base font-semibold text-foreground uppercase tracking-widest">Total Seeded Players</h3>
          <p className="text-xs text-muted-foreground mt-1">Verified list of all participants in the protocol</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-red-900/5 text-[10px] font-black uppercase tracking-[0.3em] text-red-900/60 border-b border-red-900/10">
                <th className="px-6 py-4 font-black">Roll No.</th>
                <th className="px-6 py-4 font-black">Name</th>
                <th className="px-6 py-4 font-black text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/5">
              {players.length > 0 ? (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-red-500/5 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-white font-mono tracking-tighter">#{player.playerNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{player.name || 'UNREGISTERED'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {player.qrToken ? (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20">
                          QR ALLOCATED
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleAllocateQR(player.id)}
                          className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)] transition-all"
                        >
                          ALLOCATE QR
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                    No players seeded in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
