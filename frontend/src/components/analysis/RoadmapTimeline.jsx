import Card from '../common/Card';

export default function RoadmapTimeline({ recommendations }) {
  if (!recommendations?.length) {
    return (
      <Card title="Learning Roadmap">
        <p className="text-gray-500 text-sm">No course recommendations available.</p>
      </Card>
    );
  }

  return (
    <Card title="Learning Roadmap" subtitle="Recommended courses to close skill gaps">
      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              {i < recommendations.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {rec.course?.title || rec.courseTitle || 'Course'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {rec.course?.provider || rec.provider} {rec.course?.duration || rec.duration ? `• ${rec.course?.duration || rec.duration}` : ''}
                  </p>
                  <p className="text-xs text-primary-600 mt-1">{rec.reason}</p>
                </div>
                {(rec.course?.url || rec.url) && (
                  <a
                    href={rec.course?.url || rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0 ml-4"
                  >
                    View Course
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
