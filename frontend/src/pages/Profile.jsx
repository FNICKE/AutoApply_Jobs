// src/pages/Profile.jsx (Full updated code: Enhanced handleAddSkills with better validation/empty check; improved error display for 400; added trim to skillsInput on change; ensured no empty array sent; minor UX: disable button if empty input)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile, addSkills, uploadResume } from '../api/api'
import { 
  UserIcon, 
  DocumentPlusIcon, 
  TagIcon, 
  BriefcaseIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon, 
  CloudArrowUpIcon 
} from '@heroicons/react/24/outline'

function Profile() {
  const [profile, setProfile] = useState({
    full_name: '', 
    email: '', 
    role: 'seeker', 
    experience_years: 0, 
    education: '', 
    current_company: '', 
    parsed_skills: [], 
    ats_score: 0, 
    skills: []
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        // Ensure safe defaults if data is partial/null; parsed_skills as array
        setProfile({
          full_name: data?.full_name || '',
          email: data?.email || '',
          role: data?.role || 'seeker',
          experience_years: data?.experience_years || 0,
          education: data?.education || '',
          current_company: data?.current_company || '',
          parsed_skills: Array.isArray(data?.parsed_skills) ? data.parsed_skills : [],
          ats_score: data?.ats_score || 0,
          skills: Array.isArray(data?.skills) ? data.skills : []
        })
      } catch (err) {
        if (err.code === 'ECONNABORTED') {
          setError('Request timed out. Check backend or refresh.')
        } else {
          setError('Failed to load profile.')
        }
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await updateProfile(profile)
      setSuccess('Profile updated!')
    } catch (err) {
      setError('Failed to update.')
    }
  }

  const handleAddSkills = async () => {
    // Enhanced validation: Trim input first, then split/filter
    const trimmedInput = skillsInput.trim()
    if (!trimmedInput) { 
      setError('Enter at least one skill (e.g., React, Node).'); 
      return; 
    }
    const trimmedSkills = trimmedInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
    if (trimmedSkills.length === 0) { 
      setError('No valid skills found. Use commas to separate (e.g., React, Node).'); 
      return; 
    }
    setError(''); setSuccess('')
    try {
      const response = await addSkills({ skills: trimmedSkills })
      setSuccess(response.message || 'Skills added!')
      setSkillsInput('')  // Clear input
      const data = await getProfile()
      setProfile({
        ...profile,
        skills: Array.isArray(data?.skills) ? data.skills : []
      })
    } catch (err) {
      // Better error handling: Check for 400 specifically
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid skills format.')
      } else {
        setError('Failed to add skills.')
      }
      console.error(err)
    }
  }

  const handleUploadResume = async () => {
    if (!file) { 
      setError('Select a file.'); 
      return; 
    }
    // Basic file size check (5MB limit, matching backend)
    if (file.size > 5 * 1024 * 1024) { 
      setError('File too large (max 5MB).'); 
      return; 
    }
    setError(''); setSuccess('')
    const formData = new FormData()
    formData.append('resume', file)
    try {
      const data = await uploadResume(formData)
      setSuccess(data.message)
      const updatedProfile = await getProfile()
      setProfile(updatedProfile)
    } catch (err) {
      setError('Upload failed.')
    }
  }

  // Helper: Check if skills input is valid for button disable
  const isSkillsValid = skillsInput.trim().split(',').map(s => s.trim()).filter(s => s.length > 0).length > 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Loading Profile...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 flex-shrink-0">
              <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Profile Settings</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Update your info for better auto-applies</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <div className="space-y-4 mb-6">
          {error && (
            <div className="flex items-center p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
              <ExclamationCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-r-lg shadow-sm">
              <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Basic Information</h2>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                  <select value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm">
                    <option value="seeker">Software Developer</option>
                    <option value="fullstack">Fullstack Developer</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="web">Web Developer</option>
                    <option value="java">Java Developer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience (Years)</label>
                  <div className="relative">
                    <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input type="number" min="0" value={profile.experience_years} onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-center sm:justify-end">
                <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Update Account</button>
              </div>
            </form>

            {/* Parsed Data - Safe checks */}
            {(profile.education || profile.current_company || (profile.parsed_skills && profile.parsed_skills.length > 0) || profile.ats_score) && (
              <div className="p-6 border-t border-slate-100">
                <h3 className="text-base font-semibold text-slate-800 mb-4">Parsed from Resume (For Auto-Applies)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {profile.education && <div><label className="text-xs font-bold text-slate-500 uppercase">Education</label><p className="text-sm text-slate-700 mt-1">{profile.education}</p></div>}
                  {profile.current_company && <div><label className="text-xs font-bold text-slate-500 uppercase">Current Company</label><p className="text-sm text-slate-700 mt-1">{profile.current_company}</p></div>}
                  {profile.ats_score && <div><label className="text-xs font-bold text-slate-500 uppercase">ATS Score</label><p className="text-sm text-slate-700 mt-1 font-semibold text-green-600">{profile.ats_score}/100</p></div>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Detected Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(profile.parsed_skills || []).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-amber-50 rounded-lg"><TagIcon className="h-5 w-5 text-amber-600" /></div>
                <h3 className="font-bold text-slate-800">Skills</h3>
              </div>
              <textarea 
                placeholder="React, Node.js, Java..." 
                value={skillsInput} 
                onChange={(e) => setSkillsInput(e.target.value.trim())}  // Trim on change for cleaner input
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 min-h-24 text-sm mb-4" 
              />
              <button 
                onClick={handleAddSkills} 
                disabled={!isSkillsValid}  // Disable if no valid skills
                className="w-full py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-bold disabled:bg-amber-300 disabled:cursor-not-allowed transition"
              >
                Add Skills
              </button>
              {(profile.skills || []).length > 0 && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase">Your Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(profile.skills || []).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-blue-50 rounded-lg"><DocumentPlusIcon className="h-5 w-5 text-blue-600" /></div>
                <h3 className="font-bold text-slate-800">Resume Upload</h3>
              </div>
              <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 mb-4">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <CloudArrowUpIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">{file ? file.name : "Tap to upload PDF"}</p>
              </div>
              <button onClick={handleUploadResume} className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold">Upload & Parse</button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Profile