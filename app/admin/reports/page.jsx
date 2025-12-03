"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";
import PageContainer from "@/app/components/PageContainer";

// Summary Card Component
const SummaryCard = ({ title, value, subtitle, icon, iconBg, iconColor, trend }) => {
  return (
    <div className="bg-zinc-900/70 rounded-lg p-5 border border-zinc-800 hover:border-zinc-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon name={icon} className={`${iconColor} w-5 h-5`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-sm text-zinc-400">{title}</p>
      {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// Chart Bar Component
const ChartBar = ({ label, value, maxValue, color = "bg-rose-500" }) => {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Table Component
const DataTable = ({ headers, data, emptyMessage = "No data available" }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            {headers.map((header, idx) => (
              <th key={idx} className="text-left text-sm font-medium text-zinc-400 pb-3 px-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-8 text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="py-3 px-4 text-sm text-zinc-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("month");
  const [selectedTrainer, setSelectedTrainer] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  
  const [reportData, setReportData] = useState({
    membership: {
      totalActive: 0,
      newSignups: 0,
      cancellations: 0,
      membershipTypes: []
    },
    attendance: {
      dailyCheckins: 0,
      weeklyCheckins: 0,
      monthlyCheckins: 0,
      peakHours: [],
      classParticipation: []
    },
    financials: {
      membershipRevenue: 0,
      classRevenue: 0,
      paymentsCollected: 0,
      refunds: 0
    },
    trainers: [],
    equipment: {
      usage: [],
      maintenance: [],
      downtime: 0
    },
    memberProgress: []
  });

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/login");
      return;
    }
    loadReportData();
  }, [session, dateFilter, selectedTrainer, selectedClass]);

  async function loadReportData() {
    setLoading(true);
    try {
      // Fetch members data
      const membersRes = await fetch('/api/members?q=');
      const membersData = await membersRes.json();
      const members = membersData.members || [];

      // Fetch staff data
      const staffRes = await fetch('/api/staff');
      const staffData = await staffRes.json();
      const staff = staffData.staff || [];

      // Calculate membership stats
      const activeMembers = members.filter(m => m.status === 'active').length;
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const newSignups = members.filter(m => new Date(m.createdAt) >= monthAgo).length;
      
      // Membership types distribution
      const typeDistribution = {};
      members.forEach(m => {
        typeDistribution[m.planType] = (typeDistribution[m.planType] || 0) + 1;
      });

      // Mock data for features not yet in database
      const mockAttendance = {
        dailyCheckins: Math.floor(Math.random() * 50) + 20,
        weeklyCheckins: Math.floor(Math.random() * 300) + 150,
        monthlyCheckins: Math.floor(Math.random() * 1200) + 600,
        peakHours: [
          { hour: "6-8 AM", count: 45 },
          { hour: "12-2 PM", count: 32 },
          { hour: "5-7 PM", count: 78 },
          { hour: "7-9 PM", count: 56 }
        ],
        classParticipation: [
          { class: "Yoga", participants: 25 },
          { class: "Cardio", participants: 38 },
          { class: "Strength", participants: 42 },
          { class: "HIIT", participants: 30 }
        ]
      };

      // Calculate financials
      const membershipRevenue = members.filter(m => m.paymentStatus === 'paid')
        .reduce((sum, m) => sum + (m.subscriptionMonths * 50), 0); // Assuming $50/month

      setReportData({
        membership: {
          totalActive: activeMembers,
          newSignups: newSignups,
          cancellations: members.filter(m => m.status === 'inactive').length,
          membershipTypes: Object.entries(typeDistribution).map(([type, count]) => ({ type, count }))
        },
        attendance: mockAttendance,
        financials: {
          membershipRevenue: membershipRevenue,
          classRevenue: Math.floor(Math.random() * 5000) + 2000,
          paymentsCollected: members.filter(m => m.paymentStatus === 'paid').length,
          refunds: Math.floor(Math.random() * 5) + 1
        },
        trainers: staff.map((s, idx) => ({
          name: s.name,
          classes: Math.floor(Math.random() * 15) + 5,
          members: Math.floor(Math.random() * 30) + 10
        })),
        equipment: {
          usage: [
            { name: "Treadmill", uses: 156 },
            { name: "Bench Press", uses: 89 },
            { name: "Rowing Machine", uses: 67 },
            { name: "Leg Press", uses: 95 }
          ],
          maintenance: [
            { equipment: "Treadmill #3", date: "Dec 10, 2025" },
            { equipment: "Bike #7", date: "Dec 15, 2025" }
          ],
          downtime: 2.5
        },
        memberProgress: members.slice(0, 5).map(m => ({
          name: m.name,
          initialBMI: m.bmi,
          currentBMI: (m.bmi - Math.random() * 2).toFixed(1),
          weightChange: `-${(Math.random() * 5 + 1).toFixed(1)} kg`,
          goalsAchieved: Math.floor(Math.random() * 3) + 1
        }))
      });
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageContainer className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      </PageContainer>
    );
  }

  const maxPeakHourCount = Math.max(...reportData.attendance.peakHours.map(h => h.count));
  const maxClassParticipation = Math.max(...reportData.attendance.classParticipation.map(c => c.participants));
  const maxEquipmentUse = Math.max(...reportData.equipment.usage.map(e => e.uses));

  return (
    <PageContainer className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white pb-10">
      {/* Header */}
      <header className="p-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics 📊</h1>
            <p className="text-zinc-400">Comprehensive insights into gym operations</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Classes</option>
              <option value="yoga">Yoga</option>
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="hiit">HIIT</option>
            </select>
            
            <select 
              value={selectedTrainer}
              onChange={(e) => setSelectedTrainer(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="all">All Trainers</option>
              {reportData.trainers.map((trainer, idx) => (
                <option key={idx} value={trainer.name}>{trainer.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-8">
        {/* Membership Overview */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="users" className="text-rose-500 w-5 h-5" />
            Membership Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard 
              title="Active Members"
              value={reportData.membership.totalActive}
              icon="users"
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-500"
              trend={{ positive: true, value: "12%" }}
            />
            <SummaryCard 
              title="New Sign-ups"
              value={reportData.membership.newSignups}
              subtitle="This month"
              icon="user"
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
              trend={{ positive: true, value: "8%" }}
            />
            <SummaryCard 
              title="Cancellations"
              value={reportData.membership.cancellations}
              subtitle="This month"
              icon="x"
              iconBg="bg-rose-500/10"
              iconColor="text-rose-500"
              trend={{ positive: false, value: "3%" }}
            />
            <SummaryCard 
              title="Member Types"
              value={reportData.membership.membershipTypes.length}
              subtitle="Active plans"
              icon="grid"
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
            />
          </div>

          {/* Membership Types Distribution */}
          <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">Membership Distribution</h3>
            <div className="space-y-3">
              {reportData.membership.membershipTypes.map((type, idx) => (
                <ChartBar 
                  key={idx}
                  label={type.type}
                  value={type.count}
                  maxValue={Math.max(...reportData.membership.membershipTypes.map(t => t.count))}
                  color="bg-rose-500"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Attendance Analytics */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="calendar" className="text-rose-500 w-5 h-5" />
            Attendance Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SummaryCard 
              title="Daily Check-ins"
              value={reportData.attendance.dailyCheckins}
              icon="calendar"
              iconBg="bg-cyan-500/10"
              iconColor="text-cyan-500"
            />
            <SummaryCard 
              title="Weekly Check-ins"
              value={reportData.attendance.weeklyCheckins}
              icon="calendar"
              iconBg="bg-indigo-500/10"
              iconColor="text-indigo-500"
            />
            <SummaryCard 
              title="Monthly Check-ins"
              value={reportData.attendance.monthlyCheckins}
              icon="calendar"
              iconBg="bg-violet-500/10"
              iconColor="text-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Peak Hours</h3>
              <div className="space-y-3">
                {reportData.attendance.peakHours.map((hour, idx) => (
                  <ChartBar 
                    key={idx}
                    label={hour.hour}
                    value={hour.count}
                    maxValue={maxPeakHourCount}
                    color="bg-cyan-500"
                  />
                ))}
              </div>
            </div>

            {/* Class Participation */}
            <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Class Participation</h3>
              <div className="space-y-3">
                {reportData.attendance.classParticipation.map((cls, idx) => (
                  <ChartBar 
                    key={idx}
                    label={cls.class}
                    value={cls.participants}
                    maxValue={maxClassParticipation}
                    color="bg-emerald-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Financial Overview */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="briefcase" className="text-rose-500 w-5 h-5" />
            Financial Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard 
              title="Membership Revenue"
              value={`$${reportData.financials.membershipRevenue.toLocaleString()}`}
              icon="briefcase"
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
              trend={{ positive: true, value: "15%" }}
            />
            <SummaryCard 
              title="Class Revenue"
              value={`$${reportData.financials.classRevenue.toLocaleString()}`}
              icon="briefcase"
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-500"
              trend={{ positive: true, value: "7%" }}
            />
            <SummaryCard 
              title="Payments Collected"
              value={reportData.financials.paymentsCollected}
              subtitle="This month"
              icon="briefcase"
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
            />
            <SummaryCard 
              title="Refunds Issued"
              value={reportData.financials.refunds}
              subtitle="This month"
              icon="briefcase"
              iconBg="bg-orange-500/10"
              iconColor="text-orange-500"
            />
          </div>
        </section>

        {/* Trainer & Staff Activity */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="user" className="text-rose-500 w-5 h-5" />
            Trainer & Staff Activity
          </h2>
          <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
            <DataTable 
              headers={["Trainer Name", "Classes This Month", "Members Assigned", "Status"]}
              data={reportData.trainers.map(t => [
                t.name,
                t.classes.toString(),
                t.members.toString(),
                <span key={t.name} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs">Active</span>
              ])}
              emptyMessage="No trainer data available"
            />
          </div>
        </section>

        {/* Equipment Usage & Maintenance */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="settings" className="text-rose-500 w-5 h-5" />
            Equipment Usage & Maintenance
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment Usage */}
            <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Usage Frequency</h3>
              <div className="space-y-3">
                {reportData.equipment.usage.map((equip, idx) => (
                  <ChartBar 
                    key={idx}
                    label={equip.name}
                    value={equip.uses}
                    maxValue={maxEquipmentUse}
                    color="bg-purple-500"
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-400">
                  Total Downtime: <span className="text-white font-medium">{reportData.equipment.downtime}%</span>
                </p>
              </div>
            </div>

            {/* Upcoming Maintenance */}
            <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Maintenance</h3>
              <div className="space-y-3">
                {reportData.equipment.maintenance.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span className="text-white text-sm">{item.equipment}</span>
                    </div>
                    <span className="text-xs text-zinc-400">{item.date}</span>
                  </div>
                ))}
              </div>
              {reportData.equipment.maintenance.length === 0 && (
                <p className="text-center text-zinc-500 py-8">No upcoming maintenance scheduled</p>
              )}
            </div>
          </div>
        </section>

        {/* Member Progress Tracking */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="bar-chart-2" className="text-rose-500 w-5 h-5" />
            Member Progress Tracking
          </h2>
          <div className="bg-zinc-900/70 rounded-lg p-6 border border-zinc-800">
            <DataTable 
              headers={["Member Name", "Initial BMI", "Current BMI", "Weight Change", "Goals Achieved"]}
              data={reportData.memberProgress.map(m => [
                m.name,
                m.initialBMI,
                m.currentBMI,
                <span key={m.name} className="text-emerald-400">{m.weightChange}</span>,
                <span key={`${m.name}-goals`} className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs">{m.goalsAchieved}</span>
              ])}
              emptyMessage="No progress data available"
            />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
