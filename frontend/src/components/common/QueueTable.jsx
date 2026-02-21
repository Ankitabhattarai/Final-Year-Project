function statusBadge(status) {
    const map = {
        waiting: 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        skipped: 'bg-red-100 text-red-800',
        delayed: 'bg-orange-100 text-orange-800',
        cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
}

function statusLabel(status) {
    const map = {
        waiting: 'Waiting',
        'in-progress': 'In Progress',
        completed: 'Completed',
        skipped: 'Skipped',
        delayed: 'Delayed',
        cancelled: 'Cancelled',
    };
    return map[status];
}

export default function QueueTable({ tokens, showDoctor = false, showActions = false, onMarkAttended, onSkip }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Token</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Patient</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Department</th>
                        {showDoctor && <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Doctor</th>}
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Wait</th>
                        {showActions && <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 uppercase tracking-wide">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {tokens.map((token, index) => (
                        <tr key={token.id} className={`hover:bg-gray-50 transition-colors ${index !== tokens.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <td className="font-mono font-semibold text-blue-600 py-4 px-6 text-sm">{token.tokenNumber}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{token.patientName}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{token.departmentName}</td>
                            {showDoctor && <td className="py-4 px-6 text-sm text-gray-900">{token.doctorName}</td>}
                            <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(token.status)}`}>
                                    {statusLabel(token.status)}
                                </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">{token.estimatedWait} min</td>
                            {showActions && (
                                <td className="py-4 px-6">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onMarkAttended?.(token.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
                                        >
                                            Attend
                                        </button>
                                        <button
                                            onClick={() => onSkip?.(token.id)}
                                            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg px-4 py-2 text-sm border border-gray-300 transition-colors"
                                        >
                                            Skip
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}