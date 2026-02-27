export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">SmartHire AI</h1>
          <p className="text-primary-200 mt-2">AI-Powered Resume Screening & Skill Gap Analysis</p>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
}
