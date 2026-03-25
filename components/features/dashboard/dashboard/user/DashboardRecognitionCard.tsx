
interface DashboardRecognitionCardProps {
    id: string;
    from: string;
    message: string;
    tags: string[];
    time: string;
}


export default function DashboardRecognitionCard({
    from,
    message,
    tags,
    time,
}: DashboardRecognitionCardProps) {
    return (
        <div className="group relative bg-white shadow-md rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:border-gray-200 transition-all duration-200">

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900 truncate">{from}</p>
                        <span className="text-[11px] text-gray-400 shrink-0">{time}</span>
                    </div>
                    <p className="text-xs text-gray-400">recognised you</p>
                </div>
            </div>

            {/* Message */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3 pl-0.5">
                &ldquo;{message}&rdquo;
            </p>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}