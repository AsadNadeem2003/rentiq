export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">My Listings</h2>
          <p className="text-gray-500">You haven't listed any properties yet.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">My Conversations</h2>
          <p className="text-gray-500">No active messages.</p>
        </div>
      </div>
    </div>
  );
}
