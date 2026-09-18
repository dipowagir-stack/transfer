import React, { useState, useEffect } from 'react';
import { Building, Shield, Activity, RefreshCw, AlertTriangle, AlertCircle, Database, Server, Box, GitBranch } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useVirtualMode } from '../../contexts/VirtualModeContext';

export default function PlatformOverviewPanel() {
  const { isVirtualMode, vTenants } = useVirtualMode();
  const [metrics, setMetrics] = useState({
    totalTenants: 0,
    activeTenants: 0,
    expiringTenants: 0,
    expiredTenants: 0,
    suspendedTenants: 0,
    activeModules: 0,
    criticalIssues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [isVirtualMode]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      if (isVirtualMode) {
        // use vTenants
        const total = vTenants.length;
        const active = vTenants.filter(t => t.status === 'ACTIVE').length;
        const suspended = vTenants.filter(t => t.status === 'SUSPENDED').length;
        setMetrics({
          totalTenants: total,
          activeTenants: active,
          expiringTenants: 0, // mock
          expiredTenants: 0,
          suspendedTenants: suspended,
          activeModules: 12,
          criticalIssues: 2
        });
      } else {
        const tenantsRef = collection(db, 'tenants');
        const snap = await getDocs(tenantsRef);
        let total = 0, active = 0, suspended = 0;
        snap.forEach(doc => {
          total++;
          if (doc.data().status === 'ACTIVE') active++;
          if (doc.data().status === 'SUSPENDED') suspended++;
        });
        setMetrics({
          totalTenants: total,
          activeTenants: active,
          expiringTenants: 0,
          expiredTenants: 0,
          suspendedTenants: suspended,
          activeModules: 12,
          criticalIssues: 0
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tenants</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalTenants}</h3>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Building className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{metrics.activeTenants} Active</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-orange-600 font-medium">{metrics.suspendedTenants} Suspended</span>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Expiring/Expired</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics.expiringTenants + metrics.expiredTenants}</h3>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
             <span className="text-orange-600 font-medium">{metrics.expiringTenants} Expiring</span>
             <span className="mx-2 text-gray-300">|</span>
             <span className="text-red-600 font-medium">{metrics.expiredTenants} Expired</span>
          </div>
        </div>

        {/* Active Modules */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Modules</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics.activeModules}</h3>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Box className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">Across all active tenants</span>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Critical Issues</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics.criticalIssues}</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {metrics.criticalIssues > 0 ? (
               <span className="text-red-600 font-medium">Requires immediate action</span>
            ) : (
               <span className="text-green-600 font-medium flex items-center"><Activity className="w-4 h-4 mr-1"/> Platform Healthy</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><GitBranch className="w-5 h-5 mr-2 text-indigo-600"/> Platform Version Info</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Release Channel</span>
                  <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">STABLE</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Platform Version</span>
                  <span className="font-mono text-gray-900 font-medium">v2.4.0</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Last Release Date</span>
                  <span className="text-gray-900">12 Aug 2024</span>
               </div>
               <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Tenants Pending Update</span>
                  <span className="font-bold text-orange-600">3 Tenants</span>
               </div>
            </div>
         </div>
         
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-green-600"/> Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
               <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex flex-col justify-center">
                  <span className="font-medium text-gray-900 block">Trigger Health Check</span>
                  <span className="text-xs text-gray-500 mt-1">Run on all active tenants</span>
               </button>
               <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex flex-col justify-center">
                  <span className="font-medium text-gray-900 block">Publish New Release</span>
                  <span className="text-xs text-gray-500 mt-1">Stage to specific channel</span>
               </button>
               <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex flex-col justify-center">
                  <span className="font-medium text-gray-900 block">Manage Modules</span>
                  <span className="text-xs text-gray-500 mt-1">Configure global modules</span>
               </button>
               <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors flex flex-col justify-center">
                  <span className="font-medium text-gray-900 block">Audit Logs</span>
                  <span className="text-xs text-gray-500 mt-1">View platform activities</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
