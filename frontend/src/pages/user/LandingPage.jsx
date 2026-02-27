import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const features = [
  { title: 'AI Resume Screening', desc: 'Upload resumes and extract skills automatically using NLP and machine learning.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { title: 'Skill Gap Analysis', desc: 'Compare candidate skills against job requirements with TF-IDF similarity scoring.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { title: 'Course Recommendations', desc: 'Get personalized learning roadmaps to bridge skill gaps with curated courses.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253' },
  { title: 'Visual Reports', desc: 'Interactive charts, radar graphs, and detailed breakdowns of analysis results.', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">SmartHire AI</h1>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard"><Button>Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="outline">Sign In</Button></Link>
                <Link to="/register"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            AI-Powered Resume Screening & Skill Gap Analysis
          </h2>
          <p className="text-xl text-primary-200 mb-8 max-w-2xl mx-auto">
            Transform your hiring process with intelligent resume parsing, skill matching, and personalized learning recommendations.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">SmartHire AI — Enterprise-Level Resume Screening & Skill Gap Analysis Platform</p>
        </div>
      </footer>
    </div>
  );
}
