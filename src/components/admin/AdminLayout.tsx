import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 ml-0 lg:ml-64 overflow-x-hidden overflow-y-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 