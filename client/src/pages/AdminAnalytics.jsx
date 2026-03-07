import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    RefreshCw,
    Download,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    MapPin,
    Users,
    Activity,
    AlertTriangle,
    Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageLoader from "../components/PageLoader";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30");

    // State for different panels
    const [overview, setOverview] = useState(null);
    const [hotspots, setHotspots] = useState([]);
    const [workerStats, setWorkerStats] = useState([]);
    const [categoryTrends, setCategoryTrends] = useState({ trends: [], distribution: {} });
    const [engagement, setEngagement] = useState(null);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        const startTime = Date.now();
        try {
            const results = await Promise.allSettled([
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/overview", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/hotspots", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/worker-performance", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/categories", config),
                axios.get("https://sevalink-zygf.vercel.app/api/admin/analytics/engagement", config)
            ]);

            const [overviewRes, hotspotsRes, workerRes, categoryRes, engagementRes] = results;

            if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data);
            if (hotspotsRes.status === "fulfilled") setHotspots(hotspotsRes.value.data);
            if (workerRes.status === "fulfilled") setWorkerStats(workerRes.value.data);
            if (categoryRes.status === "fulfilled") setCategoryTrends(categoryRes.value.data);
            if (engagementRes.status === "fulfilled") setEngagement(engagementRes.value.data);

        } catch (error) {
            console.error("Failed to fetch analytics", error);
            toast.error("Failed to load analytics data");
        } finally {
            // Ensure loading animation stays for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);
            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        }
    };

    const handleExport = () => {
        if (!overview || !categoryTrends || !engagement) {
            toast.error("Data not fully loaded yet");
            return;
        }

        try {
            // Build CSV rows
            const rows = [];
            rows.push(["SevaLink Analytics Report", `Generated: ${new Date().toLocaleString()}`]);
            rows.push([]);

            rows.push(["--- OVERVIEW ---"]);
            rows.push(["Metric", "Value"]);
            rows.push(["Total Complaints", overview.totalComplaints]);
            rows.push(["New This Week", overview.newThisWeek]);
            rows.push(["Resolution Rate (%)", overview.resolutionRate]);
            rows.push(["Average Resolution Time (h)", overview.avgResolutionTime.toFixed(1)]);
            rows.push([]);

            rows.push(["--- CATEGORY DISTRIBUTION ---"]);
            rows.push(["Category", "Count"]);
            Object.entries(categoryTrends.distribution).forEach(([cat, count]) => {
                rows.push([cat, count]);
            });
            rows.push([]);

            rows.push(["--- PRIORITY DISTRIBUTION ---"]);
            rows.push(["Priority", "Count", "Avg Response Time (h)"]);
            ['Critical', 'High', 'Medium', 'Low'].forEach(level => {
                const count = overview.priorityDistribution?.[level] || 0;
                const time = overview.responseTimeByPriority?.[level] ? overview.responseTimeByPriority[level].toFixed(1) : 'N/A';
                rows.push([level, count, time]);
            });
            rows.push([]);

            rows.push(["--- ENGAGEMENT ---"]);
            rows.push(["Metric", "Value"]);
            rows.push(["Active Reporters", engagement.activeCitizens]);
            rows.push(["Repeat Reporters", engagement.repeatReporters]);
            rows.push(["Photo Uploads", engagement.photoUploads]);
            rows.push(["Reviews Submitted", engagement.reviewsSubmitted]);

            // Convert array to CSV string
            const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

            // Create Blob & trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `SevaLink_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report downloaded successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to generate report");
        }
    };

    useEffect(() => {
        if (user && user.role === "admin") {
            fetchAnalytics();
        }
    }, [user]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. Page Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in text-left">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-1 text-sm font-medium">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                            <p className="text-sm text-gray-500">Comprehensive insights and reporting trends</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition">
                            <Download size={16} /> Export Report
                        </button>
                    </div>
                </header>

                {/* 2. Overview Metrics Cards */}
                {overview && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col pt-4 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Total Issues</h3>
                                <FileText size={18} className="text-gray-400" />
                            </div>
                            <div className="mt-auto">
                                <p className="text-3xl font-bold text-gray-900">{overview.totalComplaints}</p>
                                <p className="text-xs text-gray-500 mt-1">All time reports</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col pt-4 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">New This Week</h3>
                                <TrendingUp size={18} className="text-blue-500" />
                            </div>
                            <div className="mt-auto">
                                <p className="text-3xl font-bold text-gray-900">{overview.newThisWeek}</p>
                                <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                    <TrendingUp size={12} /> +15% vs last week
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col pt-4 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Resolution Rate</h3>
                                <CheckCircle size={18} className="text-gray-400" />
                            </div>
                            <div className="mt-auto">
                                <p className="text-3xl font-bold text-gray-900">{overview.resolutionRate}%</p>
                                <p className="text-xs text-gray-500 mt-1">Issues resolved</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col pt-4 pb-4">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-500 text-sm font-medium">Avg Resolution Time</h3>
                                <Clock size={18} className="text-gray-400" />
                            </div>
                            <div className="mt-auto">
                                <p className="text-3xl font-bold text-gray-900">{overview.avgResolutionTime.toFixed(0)}h</p>
                                <p className="text-xs text-gray-500 mt-1">Average response time</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>

                    {/* 6. Complaint Category Trends */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Activity size={18} className="text-blue-600" /> Issues by Category
                        </h3>
                        <p className="text-xs text-gray-500 mb-6 text-left">Distribution of current issue types</p>

                        <div className="flex-1 text-left flex flex-col justify-center">
                            {Object.entries(categoryTrends.distribution).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(categoryTrends.distribution)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([cat, count], idx) => {
                                            const total = overview?.totalComplaints || 1;
                                            const pct = Math.round((count / total) * 100);
                                            return (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                                                        <span className="font-medium text-gray-700">{cat}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-400 w-8 text-right">{pct}%</span>
                                                        <span className="font-bold text-gray-900 w-6 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-center text-sm">No data available</p>
                            )}
                        </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full text-left">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-gray-700" /> Priority Distribution
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Issues grouped by urgency level</p>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="space-y-4">
                                {['Critical', 'High', 'Medium', 'Low'].map((level) => {
                                    const colors = {
                                        'Critical': 'bg-red-600',
                                        'High': 'bg-orange-500',
                                        'Medium': 'bg-yellow-500',
                                        'Low': 'bg-blue-500'
                                    };

                                    const total = overview?.totalComplaints || 0;
                                    const count = overview?.priorityDistribution?.[level] || 0;
                                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                                    return (
                                        <div key={level} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${colors[level]}`}></div>
                                                <span className="font-medium text-gray-700">{level}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">{overview ? `${pct}%` : '--'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2 text-left">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Activity size={18} className="text-gray-700" /> Monthly Trends
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Submitted vs resolved over time</p>

                        <div className="h-[250px] w-full">
                            {categoryTrends.trends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryTrends.trends}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                                        <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        {Object.keys(categoryTrends.distribution).slice(0, 4).map((cat, idx) => {
                                            const colors = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'];
                                            return <Bar key={cat} dataKey={cat} stackId="a" fill={colors[idx % colors.length]} radius={idx === 3 ? [4, 4, 0, 0] : [0, 0, 0, 0]} barSize={32} />
                                        })}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">No trend data available</div>
                            )}
                        </div>
                    </div>

                    {/* 3. Infrastructure Problem Hotspots */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-700" /> Location Hotspots
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Areas with the most repeated issues</p>

                        <div className="space-y-4">
                            {hotspots.length > 0 ? (
                                hotspots.map((spot, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{spot.area === 'Unknown' ? 'General Location' : spot.area}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{spot.category}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-gray-900">{spot.count}</span>
                                            <span className="text-[10px] text-gray-400">issues</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No hotspots detected</p>
                            )}
                        </div>
                    </div>

                    {/* 5. Worker Efficiency */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Zap size={18} className="text-gray-700" /> Department Workload
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Resolution times by worker</p>

                        <div className="space-y-4">
                            {workerStats.length > 0 ? (
                                workerStats.map((worker, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                {worker.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                    {worker.name}
                                                    {idx === 0 && <span className="text-[10px] uppercase bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">Top</span>}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">Assigned: {worker.tasksAssigned} • Completed: {worker.completedTasks}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-900">{worker.avgResolutionTime > 0 ? `${worker.avgResolutionTime.toFixed(1)}h` : '--'}</span>
                                            <p className="text-[10px] text-gray-400">avg time</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No worker stats available</p>
                            )}
                        </div>
                    </div>

                    {/* 7. Citizen Participation */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left lg:col-span-2">
                        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Users size={18} className="text-gray-700" /> Citizen Engagement
                        </h3>
                        <p className="text-xs text-gray-500 mb-6">Platform usage metrics</p>

                        {engagement && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Active Reporters</p>
                                    <p className="text-2xl font-bold text-gray-900">{engagement.activeCitizens}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Repeat Reporters</p>
                                    <p className="text-2xl font-bold text-gray-900">{engagement.repeatReporters}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Photo Uploads</p>
                                    <p className="text-2xl font-bold text-gray-900">{engagement.photoUploads}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Reviews Submitted</p>
                                    <p className="text-2xl font-bold text-gray-900">{engagement.reviewsSubmitted}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 8. Response Time by Priority */}
                    {overview && overview.responseTimeByPriority && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left lg:col-span-2">
                            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Clock size={18} className="text-gray-700" /> Response Time by Priority
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">Average response times for different priority levels</p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                                    <p className="text-xs font-semibold text-red-600 uppercase mb-2">Critical</p>
                                    <p className="text-2xl font-bold text-red-900">{overview.responseTimeByPriority['Critical'] ? `${overview.responseTimeByPriority['Critical'].toFixed(1)}h` : '--'}</p>
                                    <p className="text-[10px] text-red-500 mt-1">avg response</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                                    <p className="text-xs font-semibold text-orange-600 uppercase mb-2">High</p>
                                    <p className="text-2xl font-bold text-orange-900">{overview.responseTimeByPriority['High'] ? `${overview.responseTimeByPriority['High'].toFixed(1)}h` : '--'}</p>
                                    <p className="text-[10px] text-orange-500 mt-1">avg response</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                    <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Medium</p>
                                    <p className="text-2xl font-bold text-blue-900">{overview.responseTimeByPriority['Medium'] ? `${overview.responseTimeByPriority['Medium'].toFixed(1)}h` : '--'}</p>
                                    <p className="text-[10px] text-blue-500 mt-1">avg response</p>
                                </div>
                                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center">
                                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Low</p>
                                    <p className="text-2xl font-bold text-gray-900">{overview.responseTimeByPriority['Low'] ? `${overview.responseTimeByPriority['Low'].toFixed(1)}h` : '--'}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">avg response</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
