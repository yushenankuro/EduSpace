import { supabase } from './supabase'

export const getUserRole = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  return data?.role || null
}

export const isAdmin = async () => {
  const role = await getUserRole()
  return role === 'admin'
}

export const isGuru = async () => {
  const role = await getUserRole()
  return role === 'guru'
}

export const isSiswa = async () => {
  const role = await getUserRole()
  return role === 'siswa'
}