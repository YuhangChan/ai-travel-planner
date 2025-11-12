import { getSupabase } from './supabase';
import { TravelPlan, Expense } from '@/types';

export const planService = {
  // 获取所有旅行计划
  getPlans: async (userId: string): Promise<TravelPlan[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 获取单个计划
  getPlan: async (id: string): Promise<TravelPlan | null> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // 创建计划
  createPlan: async (plan: Omit<TravelPlan, 'id' | 'created_at' | 'updated_at'>): Promise<TravelPlan> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('travel_plans')
      .insert([plan])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新计划
  updatePlan: async (id: string, plan: Partial<TravelPlan>): Promise<TravelPlan> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('travel_plans')
      .update({ ...plan, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除计划
  deletePlan: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('travel_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 获取计划的费用记录
  getExpenses: async (planId: string): Promise<Expense[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('plan_id', planId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 添加费用记录
  addExpense: async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 更新费用记录
  updateExpense: async (id: string, expense: Partial<Expense>): Promise<Expense> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除费用记录
  deleteExpense: async (id: string): Promise<void> => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
