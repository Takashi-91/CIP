export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={p-4 rounded shadow ${color}}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
