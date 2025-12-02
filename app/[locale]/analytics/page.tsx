'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';

// Colors for the Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    chartData: [] as any[],
    tagData: [] as any[]
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Conversations for Activity Chart
        const { data: sessions } = await supabase
          .from('conversations')
          .select('id, created_at')
          .eq('user_id', user.id);

        // Process Sessions by Date
        const sessionMap: Record<string, number> = {};
        sessions?.forEach((s) => {
          const date = new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          sessionMap[date] = (sessionMap[date] || 0) + 1;
        });
        const chartData = Object.keys(sessionMap).map(date => ({ date, count: sessionMap[date] }));

        // 2. Fetch Tags for Pie Chart
        const { data: tagsData } = await supabase
          .from('conversation_tags')
          .select(`
            tag_id,
            tags ( name )
          `)
          .in('conversation_id', sessions?.map(s => s.id) || []);

        // Process Tags
        const tagCount: Record<string, number> = {};
        tagsData?.forEach((item: any) => {
          const tagName = item.tags?.name || 'Unknown';
          tagCount[tagName] = (tagCount[tagName] || 0) + 1;
        });
        const pieData = Object.keys(tagCount).map(name => ({ name, value: tagCount[name] }));

        setStats({
          totalSessions: sessions?.length || 0,
          chartData,
          tagData: pieData
        });

      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading your insights...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Insights</h1>
        <Link href="/chat" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          Back to Chat
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-gray-500 text-sm uppercase">Total Sessions</h3>
          <p className="text-4xl font-bold text-indigo-600">{stats.totalSessions}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="text-gray-500 text-sm uppercase">Top Theme</h3>
          <p className="text-2xl font-bold text-gray-800">
            {stats.tagData.length > 0 ? stats.tagData.sort((a,b) => b.value - a.value)[0].name : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bar Chart: Activity */}
        <div className="bg-white p-6 rounded-xl shadow border h-80">
          <h3 className="font-semibold mb-4">Sessions per Day</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Topics */}
        <div className="bg-white p-6 rounded-xl shadow border h-80">
          <h3 className="font-semibold mb-4">Topics You Reflect On</h3>
          {stats.tagData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.tagData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {stats.tagData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No tags used yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}