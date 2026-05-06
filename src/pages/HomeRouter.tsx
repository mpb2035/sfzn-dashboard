import Index from './Index';
import PersonalDashboard from './PersonalDashboard';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

export default function HomeRouter() {
  const { isAdmin, loading } = useUserRole();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return isAdmin ? <Index /> : <PersonalDashboard />;
}
