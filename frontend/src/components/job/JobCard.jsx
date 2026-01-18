// src/components/job/JobCard.jsx
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'  // Correct v2 icon for external link

function JobCard({ job, onApply }) {  // job: {id, title, company_name, description, match_score, missing_skills, job_url}
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{job.job_title}</h3>
        <p className="text-gray-600 mb-2">{job.company_name}</p>
        <p className="text-sm text-gray-500 mb-4">{job.job_description?.substring(0, 100)}...</p>
        <p className="text-sm text-gray-500 mb-4">Location: {job.location || 'Remote'}</p>
        {job.match_score && <p className="text-green-600 font-semibold mb-2">Match Score: {job.match_score}%</p>}
        {job.missing_skills && <p className="text-red-600 text-sm mb-4">Missing: {job.missing_skills}</p>}
        {job.job_url && (
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 text-sm underline mb-4 hover:text-blue-800"
          >
            View Job Details <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
          </a>
        )}
        <button
          onClick={() => onApply(job.id)}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Apply Now
        </button>
      </div>
    </div>
  )
}

export default JobCard