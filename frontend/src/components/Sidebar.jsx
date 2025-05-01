// components/Sidebar.jsx
export default function Sidebar() {
  return (
    <nav className="bg-white shadow-md p-4 fixed w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold">My Dashboard</h1>
        <ul className="flex space-x-4">
          <li><a href="#" className="text-blue-600 hover:underline">Home</a></li>
          <li><a href="#" className="text-blue-600 hover:underline">Reports</a></li>
          <li><a href="#" className="text-blue-600 hover:underline">Settings</a></li>
        </ul>
      </div>
    </nav>
  );
}
