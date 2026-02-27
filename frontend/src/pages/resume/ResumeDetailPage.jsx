import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import resumeService from '../../services/resumeService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';

const statusBadge = { uploaded: 'info', processing: 'warning', processed: 'success', failed: 'danger' };

export default function ResumeDetailPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await resumeService.getById(id);
        setResume(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };
    fetch();

    const interval = setInterval(async () => {
      try {
        const res = await resumeService.getById(id);
        setResume(res.data);
        if (res.data.status === 'processed' || res.data.status === 'failed') {
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading resume details..." />;
  if (error) return <Toast type="error" message={error} />;
  if (!resume) return null;

  const groupedSkills = (resume.extractedSkills || []).reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{resume.originalName}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={statusBadge[resume.status]}>{resume.status}</Badge>
            <span className="text-sm text-gray-500">{new Date(resume.createdAt).toLocaleString()}</span>
            <span className="text-sm text-gray-500">{(resume.fileSize / 1024).toFixed(0)} KB</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/analysis?resumeId=${resume._id}`}>
            <Button disabled={resume.status !== 'processed'}>Run Analysis</Button>
          </Link>
          <Link to="/resumes">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
      </div>

      {resume.status === 'processing' && (
        <Toast type="info" message="Resume is being processed. This page will update automatically." />
      )}

      {resume.status === 'failed' && (
        <Toast type="error" message={`Processing failed: ${resume.processingError || 'Unknown error'}`} />
      )}

      {resume.status === 'processed' && (
        <div className="grid gap-6">
          <Card title="Extracted Skills" subtitle={`${resume.extractedSkills?.length || 0} skills identified`}>
            {Object.keys(groupedSkills).length === 0 ? (
              <p className="text-gray-500 text-sm">No skills extracted</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedSkills).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, i) => (
                        <Badge key={i} variant="primary" size="md">{skill.name}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {resume.contactInfo && (resume.contactInfo.name || resume.contactInfo.email) && (
            <Card title="Contact Information">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {resume.contactInfo.name && (
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{resume.contactInfo.name}</span></div>
                )}
                {resume.contactInfo.email && (
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{resume.contactInfo.email}</span></div>
                )}
                {resume.contactInfo.phone && (
                  <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{resume.contactInfo.phone}</span></div>
                )}
              </div>
            </Card>
          )}

          <Card title="Extracted Text">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg">
              {resume.extractedText || 'No text extracted'}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
