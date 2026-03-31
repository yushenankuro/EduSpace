import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

type RoleGuardProps = {
  allow: ('guru' | 'siswa' | 'admin')[];
  children: ReactNode;
};

export default function RoleGuard({ allow, children }: RoleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!data || !allow.includes(data.role)) {
        router.replace('/403'); // atau '/'
      }
    };

    checkRole();
  }, [allow, router]);

  return children;
}
