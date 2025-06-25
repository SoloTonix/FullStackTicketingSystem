import { useState, useEffect } from 'react';
import authApi from '../api/auth'
import { useAuth } from '../context/AuthContext';
import { BellIcon, CalendarIcon, ChartBarIcon, CogIcon, HomeIcon, ArrowLeftOnRectangleIcon as LogoutIcon, Bars3Icon as MenuIcon, MagnifyingGlassIcon as SearchIcon, UserCircleIcon, PlusIcon} from '@heroicons/react/24/outline';
import ReportButton from '../components/ReportButton';
import DrTechLogo from '../assets/DrTechLogo.png'
const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const { getProfile, user } = useAuth();
  const [profile, setProfile] = useState(null)
  const token = localStorage.getItem('user')
  

  // Simulate fetching tasks from Django backend
  useEffect(() => {
    // In a real app, you would fetch this from your Django API
    const mockTasks = [
      {
        id: 1,
        title: 'Server Maintenance - Data Center A',
        client: 'Acme Corp',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2023-06-15',
        location: '123 Tech Park, Building 4',
        description: 'Perform routine maintenance on server racks 5-8'
      },
      {
        id: 2,
        title: 'Network Switch Replacement',
        client: 'Global Finance',
        status: 'pending',
        priority: 'medium',
        dueDate: '2023-06-18',
        location: '456 Business Ave, Floor 3',
        description: 'Replace faulty switches in network closet B'
      },
      {
        id: 3,
        title: 'Workstation Setup - New Employees',
        client: 'Innovatech',
        status: 'completed',
        priority: 'low',
        dueDate: '2023-06-10',
        location: '789 Innovation Drive',
        description: 'Set up 15 workstations for new hires'
      },
    ];

    const mockStats = {
      totalTasks: 12,
      completed: 5,
      inProgress: 4,
      overdue: 2,
      highPriority: 3
    };

    setTasks(mockTasks);
    setStats(mockStats);
  }, []);


  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  useEffect(() => {
    const fetchProfile = async() => {
      const token = user?.access;
      if (token) {
        try{
          const profileData = await getProfile(token);
          console.log('User Profile', profileData);
          setProfile(profileData);
        }
        catch(error){
          console.log('Fetch user data error:', error)
        }
      }
    };
    fetchProfile();
  }, [getProfile, user?.access]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="relative flex flex-col w-64 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-blue-600">FieldEngineer</h1>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-gray-500 hover:text-gray-700">
              
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink Icon={HomeIcon} text="Dashboard" active />
            <SidebarLink Icon={CalendarIcon} text="Schedule" />
            <SidebarLink Icon={ChartBarIcon} text="Reports" />
            <SidebarLink Icon={CogIcon} text="Settings" />
            <SidebarLink Icon={UserCircleIcon} text="Profile" />
            <SidebarLink Icon={LogoutIcon} text="Logout" />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 px-4 border-b">
            <img src={DrTechLogo} className='w-16 mx-auto'/>
            
            
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarLink Icon={HomeIcon} text="Dashboard" active />
            <SidebarLink Icon={CalendarIcon} text="Schedule" />
            <SidebarLink Icon={ChartBarIcon} text="Reports" />
            <SidebarLink Icon={CogIcon} text="Settings" />
            <SidebarLink Icon={UserCircleIcon} text="Profile" />
            <SidebarLink Icon={LogoutIcon} text="Logout" />
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button 
                className="p-1 mr-2 text-gray-500 rounded-md lg:hidden hover:text-gray-700 hover:bg-gray-100"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full py-2 pl-10 pr-3 text-sm bg-gray-100 border-none rounded-md focus:ring-2 focus:ring-blue-800 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <ReportButton/>
              <button className="p-1 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100">
                <BellIcon className="w-6 h-6" />
                <span className="sr-only">Notifications</span>
              </button>
              <div className="flex items-center">
                <img
                  className="w-8 h-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">John Doe</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="mb-6">
            {/* <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.username}</h2>
            <p className="text-gray-600">Here's what's happening with your tasks today</p> */}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Tasks" value={stats.totalTasks} icon={<CalendarIcon className="w-6 h-6 text-blue-800" />} />
            <StatCard title="Completed" value={stats.completed} icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} />
            <StatCard title="In Progress" value={stats.inProgress} icon={<RefreshIcon className="w-6 h-6 text-yellow-500" />} />
            <StatCard title="High Priority" value={stats.highPriority} icon={<ExclamationIcon className="w-6 h-6 text-red-500" />} />
          </div>

          {/* Tasks section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                <h3 className="text-lg font-medium">Your Tasks</h3>
                <div className="flex space-x-2 overflow-x-auto">
                  <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                    All Tasks
                  </TabButton>
                  <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')}>
                    Pending
                  </TabButton>
                  <TabButton active={activeTab === 'in-progress'} onClick={() => setActiveTab('in-progress')}>
                    In Progress
                  </TabButton>
                  <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
                    Completed
                  </TabButton>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No tasks found. Enjoy your day!
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Reusable components
const SidebarLink = ({ Icon, text, active = false }) => {
  return (
    <a
      href="#"
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-blue-50 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      <Icon className={`flex-shrink-0 w-5 h-5 mr-3 ${active ? 'text-blue-800' : 'text-gray-400'}`} />
      {text}
    </a>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-blue-50">{icon}</div>
      </div>
    </div>
  );
};

const TabButton = ({ children, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${active ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
};

const TaskItem = ({ task }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-medium text-gray-900 truncate">{task.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
               
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{task.client} • {task.location}</p>
          <p className="mt-1 text-sm text-gray-600">{task.description}</p>
        </div>
        <div className="flex items-end mt-4 space-x-4 md:mt-0">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[task.status]}`}>
            {task.status.replace('-', ' ')}
          </span>
          <span className="text-sm text-gray-500">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
          
        </div>
      </div>
    </div>
  );
};

// Additional icons needed
function CheckCircleIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function ExclamationIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default Dashboard;
