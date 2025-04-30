export default function StatCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-lg ${color}`}>
      <div className="text-4xl">{icon}</div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}
