'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purpose, setPurpose] = useState('');
  const [college, setCollege] = useState('');
  const [isEmployee, setIsEmployee] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [filter, setFilter] = useState({ reason: '', college: '', type: 'all' });
  
  const supabase = createClient();

  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);
        if (prof?.role === 'admin') fetchStats();
      }
      setLoading(false);
    }
    getData();
  }, []);

  const fetchStats = async () => {
    let query = supabase.from('visits').select('*, profiles(full_name)');
    if (filter.reason) query = query.ilike('purpose', `%${filter.reason}%`);
    if (filter.college) query = query.eq('college', filter.college);
    if (filter.type === 'employee') query = query.eq('is_employee', true);
    if (filter.type === 'student') query = query.eq('is_employee', false);

    const { data } = await query.order('check_in_time', { ascending: false });
    setStats(data || []);
  };

  const logVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('visits').insert([
      { user_id: user.id, purpose, college, is_employee: isEmployee }
    ]);
    if (!error) {
      alert('Visit logged!');
      setPurpose('');
      if (profile?.role === 'admin') fetchStats();
    }
  };

  if (loading) return <div className="p-10 text-center text-blue-900 font-bold">Verifying NEU Credentials...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
          <div>
            <h1 className="text-2xl font-black text-blue-900">NEU LIBRARY VISITOR LOG</h1>
            {user && <p className="text-green-600 font-bold">Welcome to NEU Library!</p>}
          </div>
          {user && (
            <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-red-500 text-sm font-bold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">Sign Out</button>
          )}
        </header>

        {!user ? (
          <div className="text-center bg-white p-20 rounded-3xl shadow-xl">
             <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-blue-200 shadow-lg hover:bg-blue-700 transition-all">Sign in with Google</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Log Your Visit</h2>
              <form onSubmit={logVisit} className="space-y-4">
                <input required placeholder="Reason for visit" className="w-full p-3 border rounded-xl" value={purpose} onChange={e => setPurpose(e.target.value)} />
                <select required className="w-full p-3 border rounded-xl bg-white" value={college} onChange={e => setCollege(e.target.value)}>
                  <option value="">Select College</option>
                  <option value="CICS">CICS</option>
                  <option value="CBA">CBA</option>
                  <option value="CAS">CAS</option>
                  <option value="COE">Engineering</option>
                </select>
                <label className="flex items-center gap-2 p-2 cursor-pointer">
                  <input type="checkbox" checked={isEmployee} onChange={e => setIsEmployee(e.target.checked)} />
                  <span className="text-sm text-gray-600">I am a Faculty / Staff member</span>
                </label>
                <button type="submit" className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800">Submit Log</button>
              </form>
            </section>

            {profile?.role === 'admin' ? (
              <section className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-100">
                    <p className="text-sm opacity-80 uppercase font-bold">Total Visitors</p>
                    <p className="text-4xl font-black">{stats.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <p className="text-sm text-gray-400 uppercase font-bold">Employees</p>
                    <p className="text-4xl font-black text-gray-800">{stats.filter(s => s.is_employee).length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-200">
                    <p className="text-sm text-gray-400 uppercase font-bold">Students</p>
                    <p className="text-4xl font-black text-gray-800">{stats.filter(s => !s.is_employee).length}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-bold mb-4">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input placeholder="Search Reason" className="p-2 border rounded-lg text-sm" onChange={e => setFilter({...filter, reason: e.target.value})} />
                    <select className="p-2 border rounded-lg text-sm bg-white" onChange={e => setFilter({...filter, college: e.target.value})}>
                      <option value="">All Colleges</option>
                      <option value="CICS">CICS</option>
                      <option value="CBA">CBA</option>
                    </select>
                    <select className="p-2 border rounded-lg text-sm bg-white" onChange={e => setFilter({...filter, type: e.target.value})}>
                      <option value="all">Everyone</option>
                      <option value="employee">Employees Only</option>
                      <option value="student">Students Only</option>
                    </select>
                    <button onClick={fetchStats} className="bg-gray-800 text-white rounded-lg text-sm font-bold">Apply Filters</button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                   <table className="w-full text-left">
                     <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                       <tr>
                         <th className="p-4">Visitor</th>
                         <th className="p-4">College</th>
                         <th className="p-4">Reason</th>
                         <th className="p-4">Type</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y">
                       {stats.map(s => (
                         <tr key={s.id} className="text-sm hover:bg-gray-50">
                           <td className="p-4 font-bold">{s.profiles?.full_name}</td>
                           <td className="p-4">{s.college}</td>
                           <td className="p-4 text-gray-600">{s.purpose}</td>
                           <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${s.is_employee ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{s.is_employee ? 'Staff' : 'Student'}</span></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </section>
            ) : (
              <div className="lg:col-span-2 bg-white p-10 rounded-2xl border border-gray-200 flex items-center justify-center">
                <p className="text-gray-400 italic text-center">Visitor history is only visible to NEU Library Admin.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}