"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LibraryLogSystem() {
  const [user, setUser] = useState<any>(null);
  const [college, setCollege] = useState("");
  const [reason, setReason] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      if (data.session?.user) fetchLogs();
    };
    getSession();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase.from("visitor_logs").select("*").order("created_at", { ascending: false });
    if (data) setLogs(data);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college) return alert("Please select a college");
    
    const { error } = await supabase.from("visitor_logs").insert([
      { 
        full_name: user.user_metadata.full_name, 
        email: user.email, 
        college, 
        reason 
      }
    ]);
    
    if (!error) { 
      alert("Check-in Recorded!"); 
      setCollege("");
      setReason("");
      fetchLogs(); 
    }
  };

  const login = () => supabase.auth.signInWithOAuth({ 
    provider: "google", 
    options: { redirectTo: window.location.origin } 
  });

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="bg-white p-10 rounded-xl shadow-2xl text-center border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-6">NEU Library Log</h2>
        <button onClick={login} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Login with NEU Google Account
        </button>
      </div>
    </div>
  );

  const isAdmin = ["neocarl.opriasa@neu.edu.ph", "jcesperanza@neu.edu.ph"].includes(user?.email);

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans min-h-screen bg-gray-50">
      <div className="bg-blue-700 text-white p-6 rounded-t-xl flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold italic">NEU Library</h1>
          <p className="text-xs opacity-80 uppercase tracking-widest">Visitor Management System</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{user.user_metadata.full_name}</p>
          {isAdmin && <span className="bg-yellow-400 text-blue-900 px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm">Admin Access</span>}
        </div>
      </div>

      <div className="bg-white border-x border-b p-8 shadow-md rounded-b-xl mb-8">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Registration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={college} onChange={(e) => setCollege(e.target.value)} className="border-2 p-3 rounded-lg focus:border-blue-500 outline-none transition">
            <option value="">Select College/Unit</option>
            <option value="CCS">College of Computer Studies</option>
            <option value="COE">College of Engineering</option>
            <option value="COA">College of Accountancy</option>
            <option value="CAS">College of Arts and Sciences</option>
            <option value="CED">College of Education</option>
          </select>
          <input 
            placeholder="Purpose (e.g., Study, Research)" 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            className="border-2 p-3 rounded-lg focus:border-blue-500 outline-none transition" 
          />
          <button onClick={handleCheckIn} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold shadow-md transition transform active:scale-95">
            Check In Now
          </button>
        </div>
      </div>

      {isAdmin ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="text-lg font-bold text-gray-700">Real-time Visitor Logs</h3>
            <span className="text-sm bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium">Total: {logs.length}</span>
          </div>
          <div className="bg-white border rounded-xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-gray-800 text-white text-sm">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4 text-right">Time In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-semibold text-gray-800">{log.full_name}</td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{log.college}</span></td>
                    <td className="p-4 text-gray-600 italic">{log.reason || "General Study"}</td>
                    <td className="p-4 text-right text-gray-500 text-sm font-mono">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium italic">Login with an Admin account to view student records.</p>
        </div>
      )}
    </div>
  );
}