import { useState, useEffect, useCallback } from 'react';
import resumeService from '../services/resumeService';

export default function useResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchResumes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await resumeService.getAll(params);
      setResumes(res.data.resumes);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const uploadResume = async (file) => {
    const res = await resumeService.upload(file);
    await fetchResumes();
    return res;
  };

  const deleteResume = async (id) => {
    await resumeService.delete(id);
    await fetchResumes();
  };

  return { resumes, loading, pagination, fetchResumes, uploadResume, deleteResume };
}
