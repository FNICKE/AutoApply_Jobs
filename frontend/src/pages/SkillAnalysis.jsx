// src/pages/SkillAnalysis.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, getJobMatches } from '../api/api'
import { ChartBarIcon, LightBulbIcon, CheckCircleIcon, ArrowUpCircleIcon } from '@heroicons/react/24/outline'

function SkillAnalysis() {
  const [analysis, setAnalysis] = useState({ current: [], missing: [], score: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const [profile, matches] = await Promise.all([getProfile(), getJobMatches({ user_id: user.id })])
        
        const userSkills = profile.skills || []
        // Extract all required skills from top 5 matches
        const marketSkills = [...new Set(matches.slice(0, 5).flatMap(j => j.required_skills || []))]
        const missing = marketSkills.filter(s => !userSkills.includes(s))
        const score = Math.round((userSkills.length / (userSkills.length + missing.length)) * 100)

        setAnalysis({ current: userSkills, missing: missing.slice(0, 8), score })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Analyzing...</div>

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Skill Analysis</h1>
        <p className="text-slate-500 mb-10 font-medium">AI-driven gap analysis between your profile and market demands.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Card */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center mb-6">
              <svg className="w-40 h-40">
                <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
                <circle className="text-indigo-600" strokeWidth="10" strokeDasharray={440} strokeDashoffset={440 - (440 * analysis.score) / 100} strokeLinecap="round" stroke="currentColor" fill="transparent" r="70" cx="80" cy="80" />
              </svg>
              <span className="absolute text-4xl font-black text-slate-800">{analysis.score}%</span>
            </div>
            <h3 className="font-bold text-xl">Market Readiness</h3>
            <p className="text-slate-400 text-sm mt-2">Your profile matches {analysis.score}% of skills in your target job market.</p>
          </div>

          {/* Detailed Lists */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-6">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> Your Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.current.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-wider">{skill}</span>
                ))}
              </div>
            </div>

            <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
              <h4 className="flex items-center gap-2 font-bold mb-6">
                <ArrowUpCircleIcon className="h-5 w-5 text-indigo-300" /> Market Gaps (Learning Path)
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.missing.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-white/10 text-indigo-100 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10">{skill}</span>
                ))}
              </div>
              <button 
                onClick={() => navigate('/profile')}
                className="mt-8 w-full py-4 bg-white text-indigo-900 rounded-2xl font-black hover:bg-indigo-50 transition-colors"
              >
                Update My Profile Skills
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkillAnalysis