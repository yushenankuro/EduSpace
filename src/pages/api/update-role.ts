import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const { user_id, role } = req.body
  
  // Service role key (hanya di server, aman)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    // Update role (bypass RLS)
    const { error } = await supabaseAdmin
      .from('user_roles')
      .update({ role: role || 'guru' })
      .eq('user_id', user_id)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.json({ 
      success: true, 
      message: `Role updated to ${role || 'guru'}` 
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}