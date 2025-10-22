'use client';

import LoginForm from './components/LoginForm';
import { FaSeedling, FaLeaf, FaTractor, FaChartLine } from 'react-icons/fa';
import { PiFarmBold } from 'react-icons/pi';


export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-800 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-[url('/cabras-na-terra-comendo-grama.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-700/80 via-green-600/70 to-green-800/80" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
              <PiFarmBold className="text-3xl text-green-600" />
            </div>
            <h1 className="text-4xl font-bold">CAPRINOVAÇÃO</h1>
          </div>
          
          <h2 className="text-3xl font-semibold mb-4">
            Sistema de Gestão Agropecuária
          </h2>
          
          <p className="text-lg text-white/90 max-w-md leading-relaxed">
            Gerencie sua fazenda de caprinos com eficiência. 
            Controle rebanhos, monitore saúde animal e otimize sua produção.
          </p>

          {/* Features list */}
          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaLeaf className="text-sm" />
              </div>
              <span className="text-white/90">Controle completo de animais e rebanhos</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaTractor className="text-sm" />
              </div>
              <span className="text-white/90">Manejo reprodutivo e sanitário</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaChartLine className="text-sm" />
              </div>
              <span className="text-white/90">Relatórios e análises detalhadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FaSeedling className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-green-600">CAPRINOVAÇÃO</h1>
          </div>
          
          {/* Login Form Component */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
