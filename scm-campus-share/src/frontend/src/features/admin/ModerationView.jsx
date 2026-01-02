import { Check, X, AlertTriangle } from "lucide-react";

const ModerationView = ({ reports, onAction }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800 text-lg">Moderation Queue</h3>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center text-slate-400">
          All caught up! No pending reports.
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Reason</th>
              <th className="p-4">Resource</th>
              <th className="p-4">Reported By</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="p-4">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <AlertTriangle size={16} className="text-orange-500" />
                    {report.type}
                  </span>
                  <p className="text-slate-500 mt-1">{report.reason}</p>
                </td>
                <td className="p-4 text-slate-600">{report.resource?.title}</td>
                <td className="p-4 text-slate-600">{report.reporter}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onAction(report.id, "approve")}
                      className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Check size={14} /> Keep
                    </button>
                    <button
                      onClick={() => onAction(report.id, "reject")}
                      className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModerationView;
