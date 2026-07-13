'use client';

import React from 'react';
import { 
  Users, DollarSign, FileText, CheckCircle, Clock, Truck, FileCheck, Target
} from 'lucide-react';

export default function AgencyDashboard({ deliveries = [], clients = [], tasks = [] }) {
  
  const activeClients = clients.filter(c => c.active).length || 76;
  const totalClients = clients.length || 79;
  
  // Calculate delivery stats from real data
  const deliveryCompleted = deliveries.filter(d => d.status === 'Delivered' || d.status === 'Completed').length;
  const deliveryPending = deliveries.length > 0 ? deliveries.filter(d => d.status === 'Pending').length : 605;

  // Calculate task stats
  const taskCompleted = tasks.filter(t => t.status === 'DONE').length || 5;
  const taskPending = tasks.length > 0 ? tasks.filter(t => t.status !== 'DONE').length : 1588;

  const topLevelMetrics = {
    activeClients,
    totalClients,
    paymentReceivedCount: 43,
    paymentPendingCount: 33,
    totalRevenue: '₹94,995',
    estimatedMonthlyRevenue: '₹178,290',
    taskCompleted,
    taskPending,
    employeeTaskDone: 4,
    employeeTaskPending: 131,
    deliveryCompleted,
    deliveryPending
  };

  // Dynamically calculate employee data from deliveries
  const empMap = {};
  deliveries.forEach(d => {
    if (!d.workingOn) return;
    const name = d.workingOn.trim();
    if (!name) return;
    
    if (!empMap[name]) {
      empMap[name] = { name, pending: 0, done: 0, total: 0 };
    }
    
    empMap[name].total += 1;
    if (d.status === 'Delivered' || d.status === 'Completed') {
      empMap[name].done += 1;
    } else {
      empMap[name].pending += 1;
    }
  });

  const dynamicEmployeeData = Object.values(empMap).sort((a, b) => b.total - a.total);
  
  // Fallback to mock if empty
  const employeeData = dynamicEmployeeData.length > 0 ? dynamicEmployeeData : [
    { name: 'Pujan', pending: 8, done: 1, total: 9 },
    { name: 'Danish', pending: 40, done: 1, total: 41 },
    { name: 'Harshit', pending: 38, done: 1, total: 39 },
    { name: 'Masoom', pending: 1, done: 0, total: 1 },
    { name: 'Sanmeet', pending: 43, done: 1, total: 44 }
  ].sort((a, b) => b.total - a.total);

  const revReceivedPercent = Math.round((94995 / 178290) * 100);
  const revPendingPercent = Math.round((83295 / 178290) * 100);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* 1. KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Active Clients</span>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{topLevelMetrics.activeClients}</h3>
              <span className="text-sm text-slate-500 font-semibold mb-1">/ {topLevelMetrics.totalClients} Total</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center relative z-10 shadow-inner border border-blue-100 dark:border-blue-900">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Total Revenue</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{topLevelMetrics.totalRevenue}</h3>
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800/30">Est: {topLevelMetrics.estimatedMonthlyRevenue}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center relative z-10 shadow-inner border border-emerald-100 dark:border-emerald-900">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Tasks Pipeline</span>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{topLevelMetrics.taskPending}</h3>
              <span className="text-sm text-slate-500 font-semibold mb-1">Pending</span>
            </div>
            <span className="text-[10px] text-purple-500 font-bold bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800/30">Completed: {topLevelMetrics.taskCompleted}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center relative z-10 shadow-inner border border-purple-100 dark:border-purple-900">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="space-y-2 relative z-10">
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold font-sans">Deliveries</span>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{topLevelMetrics.deliveryPending}</h3>
              <span className="text-sm text-slate-500 font-semibold mb-1">Pending</span>
            </div>
            <span className="text-[10px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-100 dark:border-orange-800/30">Completed: {topLevelMetrics.deliveryCompleted}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center relative z-10 shadow-inner border border-orange-100 dark:border-orange-900">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Charts Row (Custom CSS Based) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Progress Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Monthly Revenue Breakdown
          </h4>
          
          <div className="space-y-6 my-auto">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Received</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-500">₹94,995</div>
                </div>
                <div className="text-xl font-bold text-slate-300 dark:text-slate-600">{revReceivedPercent}%</div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${revReceivedPercent}%` }}
                >
                  <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] mix-blend-overlay"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Pending</div>
                  <div className="text-2xl font-black text-orange-500">₹83,295</div>
                </div>
                <div className="text-xl font-bold text-slate-300 dark:text-slate-600">{revPendingPercent}%</div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden shadow-inner relative">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out delay-300" 
                  style={{ width: `${revPendingPercent}%` }}
                >
                  <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] mix-blend-overlay"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
            <span className="text-slate-500 font-semibold">Total Billing: <strong className="text-slate-900 dark:text-white">₹178,290</strong></span>
          </div>
        </div>

        {/* Task Status CSS Pie / Stats */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Yearly Task Status Overview
          </h4>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 my-auto">
            {/* CSS Conic Gradient Donut Chart */}
            <div className="relative w-40 h-40 shrink-0">
              <div 
                className="w-full h-full rounded-full shadow-lg"
                style={{
                  background: `conic-gradient(#10b981 0% 1%, #f1f5f9 1% 100%)` // approx 5/1588 is tiny
                }}
              ></div>
              {/* Inner hole for donut */}
              <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-xs font-bold text-slate-400">Total</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">1593</span>
              </div>
            </div>
            
            <div className="flex-grow space-y-4 w-full">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Not Started</span>
                </div>
                <span className="text-lg font-black text-slate-900 dark:text-white">1588</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Completed</span>
                </div>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">5</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Employee Performance & Invoice Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Employee Tracker Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850/50">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Employee Task Tracker
            </h4>
            <div className="flex gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Done ({topLevelMetrics.employeeTaskDone})</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Pending ({topLevelMetrics.employeeTaskPending})</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-900 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider">
                  <th className="p-4 pl-6">Employee</th>
                  <th className="p-4 text-center">Pending Tasks</th>
                  <th className="p-4 text-center">Completed</th>
                  <th className="p-4 pr-6 text-right">Total Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {employeeData.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                    <td className="p-4 pl-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-800">
                        {emp.name.charAt(0)}
                      </div>
                      {emp.name}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 font-bold rounded-lg min-w-[3rem] ${emp.pending > 30 ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400'}`}>
                        {emp.pending}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg min-w-[3rem]">
                        {emp.done}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right font-extrabold text-slate-700 dark:text-slate-300">
                      {emp.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Status & Small summaries */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-500" />
              Invoice Status
            </h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Done ({topLevelMetrics.paymentReceivedCount})</span>
                  <span className="text-emerald-600">{Math.round((topLevelMetrics.paymentReceivedCount / (topLevelMetrics.paymentReceivedCount + topLevelMetrics.paymentPendingCount)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${(topLevelMetrics.paymentReceivedCount / (topLevelMetrics.paymentReceivedCount + topLevelMetrics.paymentPendingCount)) * 100}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>Pending ({topLevelMetrics.paymentPendingCount})</span>
                  <span className="text-orange-500">{Math.round((topLevelMetrics.paymentPendingCount / (topLevelMetrics.paymentReceivedCount + topLevelMetrics.paymentPendingCount)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full" style={{width: `${(topLevelMetrics.paymentPendingCount / (topLevelMetrics.paymentReceivedCount + topLevelMetrics.paymentPendingCount)) * 100}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl border border-indigo-800 p-6 shadow-lg text-white relative overflow-hidden flex-grow flex flex-col justify-center">
            <div className="absolute right-0 top-0 opacity-10">
              <Target className="w-48 h-48 -mt-12 -mr-12" />
            </div>
            <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1 relative z-10">
              Quick Summary
            </h4>
            <p className="text-2xl font-black mb-6 relative z-10">Monthly Total Tasks</p>
            
            <ul className="space-y-4 relative z-10 text-sm font-medium text-indigo-100">
              <li className="flex justify-between items-center border-b border-indigo-800/50 pb-3">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400"/> Tasks Completed</span>
                <span className="font-black text-white bg-indigo-800/50 px-2 py-0.5 rounded-lg">{topLevelMetrics.taskCompleted}</span>
              </li>
              <li className="flex justify-between items-center border-b border-indigo-800/50 pb-3">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-400"/> Tasks Pending</span>
                <span className="font-black text-white bg-indigo-800/50 px-2 py-0.5 rounded-lg">{topLevelMetrics.taskPending}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-300"/> Total Monthly Tasks</span>
                <span className="font-black text-white bg-indigo-800/50 px-2 py-0.5 rounded-lg">{topLevelMetrics.paymentReceivedCount}</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
