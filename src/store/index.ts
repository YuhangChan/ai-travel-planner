import { create } from 'zustand';
import { User, TravelPlan } from '@/types';

interface AppState {
  // 用户状态
  user: User | null;
  setUser: (user: User | null) => void;

  // 当前选中的旅行计划
  currentPlan: TravelPlan | null;
  setCurrentPlan: (plan: TravelPlan | null) => void;

  // 旅行计划列表
  plans: TravelPlan[];
  setPlans: (plans: TravelPlan[]) => void;
  addPlan: (plan: TravelPlan) => void;
  updatePlan: (id: string, plan: Partial<TravelPlan>) => void;
  deletePlan: (id: string) => void;

  // 清除所有数据
  clearAll: () => void;
}

export const useStore = create<AppState>((set) => ({
  // 初始状态
  user: null,
  currentPlan: null,
  plans: [],

  // 用户操作
  setUser: (user) => set({ user }),

  // 当前计划操作
  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  // 计划列表操作
  setPlans: (plans) => set({ plans }),
  addPlan: (plan) =>
    set((state) => ({
      plans: [plan, ...state.plans],
    })),
  updatePlan: (id, planUpdate) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, ...planUpdate } : p
      ),
      currentPlan:
        state.currentPlan?.id === id
          ? { ...state.currentPlan, ...planUpdate }
          : state.currentPlan,
    })),
  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
    })),

  // 清除所有数据
  clearAll: () =>
    set({
      user: null,
      currentPlan: null,
      plans: [],
    }),
}));
