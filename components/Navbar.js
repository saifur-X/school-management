import { School, LayoutDashboard, Users, CreditCard, FileSpreadsheet, UserCheck, Key, LogOut } from 'lucide-react';

export default function Navbar({ school, activeTab, setActiveTab, router, handleLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড ও স্টুডেন্ট অ্যাড', icon: LayoutDashboard },
    { id: 'students', label: 'স্টুডেন্ট লিস্ট ও ক্লাস আপগ্রেড', icon: Users },
    { id: 'idcard', label: 'আইডি কার্ড জেনারেটর', icon: CreditCard },
    { id: 'marksheet', label: 'মার্কস এনট্রি ও মার্কশিট প্যানেল', icon: FileSpreadsheet },
    { id: 'profile', label: 'স্কুল প্রোফাইল', icon: UserCheck },
  ];

  return (
    <aside className="w-full md:w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 p-6 flex flex-col justify-between print:hidden">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <School className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {school.school_name || 'EduAdmin'}
            </h1>
            <p className="text-xs text-slate-400">Smart School Portal</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-102'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800/80 space-y-2">
        <button onClick={() => router.push('/change-password')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition">
          <Key size={16} /> পাসওয়ার্ড পরিবর্তন
        </button>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition">
          <LogOut size={16} /> লগ আউট
        </button>
      </div>
    </aside>
  );
            }
