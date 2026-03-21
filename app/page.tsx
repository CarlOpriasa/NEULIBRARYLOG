"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Search, Users, Calendar, ShieldCheck, LogOut, CheckCircle, LogIn } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LibraryLogSystem() {
  const [user, setUser] = useState<any>(null);
  const [college, setCollege] = useState("");
  const [reason, setReason] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
      }
      fetchLogs();
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("visitor_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLogs(data);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleCheckIn = async () => {
    if (!college || !reason) {
      alert("Please select your College and Purpose.");
      return;
    }

    setIsCheckingIn(true);
    const { error } = await supabase
      .from("visitor_logs")
      .insert([
        { 
          full_name: user.user_metadata?.full_name || user.email, 
          college: college, 
          reason: reason 
        }
      ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Check-in successful!");
      setCollege("");
      setReason("");
      fetchLogs();
    }
    setIsCheckingIn(false);
  };

  const filteredLogs = logs.filter(log => 
    log.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVisits = logs.length;
  const todayCount = logs.filter(log => 
    new Date(log.created_at).toDateString() === new Date().toDateString()
  ).length;

  const isAdmin = user && (
    user.email === "neocarl.opriasa@neu.edu.ph" || 
    user.email === "jcesperanza@neu.edu.ph"
  );

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-black font-sans">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">NEU Library Admin</h1>
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <ShieldCheck size={16} className="text-green-500" /> Admin Access: {user.email}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Lifetime Visits</p>
                <p className="text-2xl font-bold">{totalVisits}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-xl text-green-600"><Calendar /></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Visits Today</p>
                <p className="text-2xl font-bold">{todayCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Real-time Visitor Logs</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search name, college, or purpose..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">Visitor Name</th>
                    <th className="px-6 py-4">College/Unit</th>
                    <th className="px-6 py-4">Purpose</th>
                    <th className="px-6 py-4">Time Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-700">{log.full_name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">
                            {log.college}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 italic">{log.reason}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                        No matches found in the logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
               <CheckCircle className="text-blue-600" size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-800">Welcome!</h2>
            <p className="text-gray-400 mt-1 font-medium">{user.user_metadata?.full_name || user.email}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-wide">Your College</label>
              <select 
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-black font-semibold appearance-none shadow-sm"
              >
                <option value="">Select College</option>
                <option value="CCS">College of Computer Studies</option>
                <option value="CAS">College of Arts & Sciences</option>
                <option value="COE">College of Engineering</option>
                <option value="CBA">College of Business Administration</option>
                <option value="COA">College of Accountancy</option>
                <option value="COM">College of Communication</option>
                <option value="CCJ">College of Criminology</option>
                <option value="CED">College of Education</option>
                <option value="CMT">College of Medical Technology</option>
                <option value="MUS">College of Music</option>
                <option value="MID">College of Midwifery</option>
                <option value="NUR">College of Nursing</option>
                <option value="CPT">College of Physical Therapy</option>
                <option value="CRT">College of Respiratory Therapy</option>
                <option value="SIR">School of International Relations</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-wide">Purpose of Visit</label>
              <input 
                type="text" 
                placeholder="e.g. Individual Study, Research" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition text-black font-semibold shadow-sm"
              />
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all transform active:scale-95 mt-4 uppercase tracking-widest"
            >
              {isCheckingIn ? "Recording Entry..." : "Confirm Library Entry"}
            </button>
            
            <button onClick={handleLogout} className="w-full text-gray-300 text-xs hover:text-red-400 transition font-bold uppercase tracking-tighter">
              Switch Account / Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 w-full max-w-sm text-center">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
          <Users className="text-white" size={32} />
        </div>
        <h1 className="text-gray-800 text-2xl font-black mb-2 tracking-tight uppercase">NEU Library</h1>
        <p className="text-gray-400 text-sm mb-8 font-medium">Log in with your institutional account to continue.</p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-700 font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          <LogIn size={20} className="text-blue-600" />
          Sign in with Google
        </button>
        
        <p className="mt-8 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Authorized Access Only</p>
      </div>
    </div>
  );
}