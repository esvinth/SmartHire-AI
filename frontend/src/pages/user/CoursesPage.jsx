import { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState('');

  const fetchCourses = async (params = {}) => {
    setLoading(true);
    try {
      const res = await courseService.getAll({ ...params, level: level || undefined });
      setCourses(res.data.courses);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [level]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Learning Courses</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar onSearch={(q) => fetchCourses({ search: q })} placeholder="Search courses..." className="flex-1 max-w-md" />
        <select value={level} onChange={(e) => setLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course._id}>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                  {course.isFree && <Badge variant="success" size="sm">Free</Badge>}
                </div>
                <p className="text-xs text-gray-500 mb-3">{course.provider} {course.duration ? `• ${course.duration}` : ''}</p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.skills?.slice(0, 4).map((s, i) => (
                    <Badge key={i} variant="primary" size="sm">{s.name || s}</Badge>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">{course.level}</Badge>
                    <span className="text-xs text-yellow-500">{'★'.repeat(Math.round(course.rating || 0))}</span>
                  </div>
                  {course.url && (
                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">View</Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={(p) => fetchCourses({ page: p })} />
    </div>
  );
}
