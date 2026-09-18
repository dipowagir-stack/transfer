import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginWithGoogle, logout } from '../lib/firebase';

import { TenantPublicProfile } from '../domains/website/types';

export default function Login({ tenantProfile }: { tenantProfile?: TenantPublicProfile }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If user is logged in to global SaaS login but is not a platform admin, sign them out.
  useEffect(() => {
    if (user && !loading && !tenantProfile) {
      // If profile is loaded, check role. If profile is null, they definitely aren't a platform admin yet.
      // Wait, if profile is null, maybe they are a new platform admin? 
      // Typically platform admins are seeded in DB. If they don't have a profile, they can't access platform anyway.
      const isPlatformUser = profile ? ['platform_admin', 'platform_support', 'platform_engineer'].includes(profile.role || '') : false;
      
      if (!isPlatformUser) {
        logout().then(() => {
          setError('Akses Ditolak: Halaman ini khusus untuk Platform Administrator. Silakan akses URL khusus sekolah Anda (misal: /s/nama-sekolah/login) untuk masuk atau mendaftar.');
          setIsLoggingIn(false);
        }).catch(err => {
          console.error("Logout error", err);
          setIsLoggingIn(false);
        });
      }
    }
  }, [user, profile, loading, tenantProfile]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  }

  if (user && profile) {
    // If it's a global SaaS login (!tenantProfile)
    if (!tenantProfile) {
      if (['platform_admin', 'platform_support', 'platform_engineer'].includes(profile.role || '')) {
        return <Navigate to="/platform" replace />;
      }
      // If not platform admin, useEffect will log them out and we show the error message.
      // Do not redirect to /app so they can see the error.
    } else {
      // If it's a tenant login (tenantProfile exists)
      if (profile.role === 'applicant') {
        return <Navigate to="/ppdb/dashboard" replace />;
      }
      if (['platform_admin', 'platform_support', 'platform_engineer'].includes(profile.role || '')) {
        return <Navigate to="/platform" replace />;
      }
      return <Navigate to="/app" replace />;
    }
  }

  // Handle users who haven't set up profile yet
  if (user && !profile && !error) {
    if (!tenantProfile) {
      // It's a SaaS login. We don't redirect to setup-profile because they shouldn't be here.
      // The useEffect will log them out and show the error.
    } else {
      return <Navigate to={`/setup-profile${location.search}`} replace />;
    }
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      await loginWithGoogle();
      // On success, auth context will update and redirect
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {tenantProfile?.logoUrl ? (
            <img src={tenantProfile.logoUrl} alt={tenantProfile.shortName || tenantProfile.schoolName} className="h-20 w-auto object-contain" />
          ) : (
            <div className="h-20 w-20 rounded-2xl shadow-lg flex items-center justify-center" style={{ backgroundColor: tenantProfile?.primaryColor || '#2563eb' }}>
              <span className="text-white font-bold text-4xl">
                {tenantProfile ? (tenantProfile.shortName || tenantProfile.schoolName || 'S').substring(0, 1).toUpperCase() : 'S'}
              </span>
            </div>
          )}
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {tenantProfile ? (
            <>Login <span style={{ color: tenantProfile.primaryColor }}>{tenantProfile.shortName || tenantProfile.schoolName}</span></>
          ) : (
            <>School<span className="text-blue-600">SaaS</span> Login</>
          )}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {tenantProfile ? `Masuk ke akun ${tenantProfile.schoolName} Anda` : 'Masuk ke akun sekolah Anda'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 text-center mb-6">
                Silahkan login menggunakan akun Google Anda yang terdaftar pada sekolah Anda.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoggingIn ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-5 h-5" />
                    <span>Masuk dengan Google</span>
                  </div>
                )}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <Link to={location.pathname.startsWith('/s/') ? location.pathname.replace(/\/login.*$/, '') : '/'} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
