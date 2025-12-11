import { supabase } from '@/lib/supabase';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Register User
export const registerUser = async (data: RegisterData) => {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${data.username},email.eq.${data.email}`)
      .single();

    if (existingUser) {
      if (existingUser.username === data.username) {
        throw new Error('Username sudah digunakan');
      }
      if (existingUser.email === data.email) {
        throw new Error('Email sudah digunakan');
      }
    }

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username: data.username,
        email: data.email,
        password: data.password
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, user: newUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Login User
export const loginUser = async (data: LoginData) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', data.username)
      .eq('password', data.password)
      .single();

    if (error || !user) {
      throw new Error('Username atau password salah');
    }

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Request Reset Password (Kirim Token)
export const requestPasswordReset = async (email: string) => {
  try {
    // Cek apakah email ada di database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Email tidak ditemukan');
    }

    // Generate reset token (6 digit random)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Token expire dalam 1 jam
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Simpan token ke database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // NOTE: Di production, kirim token via email
    // Untuk demo, return token langsung
    return { 
      success: true, 
      token: resetToken, // Di production, jangan return token!
      message: 'Token reset password telah dikirim ke email Anda',
      email: user.email
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Verify Reset Token
export const verifyResetToken = async (email: string, token: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('reset_token', token)
      .single();

    if (error || !user) {
      throw new Error('Token tidak valid');
    }

    // Cek apakah token sudah expired
    const now = new Date();
    const expiresAt = new Date(user.reset_token_expires);

    if (now > expiresAt) {
      throw new Error('Token sudah kadaluarsa. Silakan request ulang.');
    }

    return { success: true, userId: user.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Reset Password
export const resetPassword = async (email: string, token: string, newPassword: string) => {
  try {
    // Verify token dulu
    const verifyResult = await verifyResetToken(email, token);
    
    if (!verifyResult.success) {
      throw new Error(verifyResult.error);
    }

    // Update password dan hapus token
    const { error } = await supabase
      .from('users')
      .update({
        password: newPassword, // NOTE: Di production, hash password dulu!
        reset_token: null,
        reset_token_expires: null
      })
      .eq('email', email)
      .eq('reset_token', token);

    if (error) throw error;

    return { success: true, message: 'Password berhasil direset' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  localStorage.removeItem('userId');
};