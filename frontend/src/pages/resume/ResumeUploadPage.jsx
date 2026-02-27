import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileDropzone from '../../components/common/FileDropzone';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Toast from '../../components/common/Toast';
import resumeService from '../../services/resumeService';

export default function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    try {
      const res = await resumeService.upload(file);
      setMessage({ type: 'success', text: 'Resume uploaded successfully! Processing...' });
      setTimeout(() => navigate(`/resumes/${res.data._id}`), 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Resume</h1>

      {message && <Toast type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <Card>
        <FileDropzone onFileSelect={setFile} disabled={uploading} />

        {file && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Button onClick={handleUpload} loading={uploading} disabled={!file}>
            Upload & Process
          </Button>
          <Button variant="secondary" onClick={() => navigate('/resumes')}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
