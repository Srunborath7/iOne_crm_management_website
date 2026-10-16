'use client';

import { useSyncExternalStore } from 'react';
import type { AuthUser } from '@/src/services/auth/type';

export interface NavTab {
  href: string;
  label: string;
}

interface AppState {
  sidebarCollapsed: boolean;
  accessToken: string | null;
  currentUser: AuthUser | null;
  tabs: NavTab[];
  tabsHydrated: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setAccessToken: (token: string | null) => void;
  setCurrentUser: (user: AuthUser | null) => void;
  setSession: (token: string, user: AuthUser | null) => void;
  clearSession: () => void;
  openTab: (tab: NavTab) => void;
  closeTab: (href: string) => void;
  moveTab: (sourceHref: string, targetHref: string) => void;
  restoreTabs: (tabs: NavTab[]) => void;
}

type StateListener = () => void;

let state: AppState;
const listeners = new Set<StateListener>();

function updateState(update: Partial<AppState> | ((current: AppState) => Partial<AppState>)) {
  state = { ...state, ...(typeof update === 'function' ? update(state) : update) };
  listeners.forEach((listener) => listener());
}

state = {
  sidebarCollapsed: false,
  accessToken: null,
  currentUser: null,
  tabs: [],
  tabsHydrated: false,
  setSidebarCollapsed: (sidebarCollapsed) => updateState({ sidebarCollapsed }),
  setAccessToken: (accessToken) => updateState({ accessToken }),
  setCurrentUser: (currentUser) => updateState({ currentUser }),
  setSession: (accessToken, currentUser) => updateState({ accessToken, currentUser }),
  clearSession: () => {
    updateState({ accessToken: null, currentUser: null, tabs: [], tabsHydrated: false });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('ione-crm-open-tabs');
      } catch {
        // Session cleanup must still complete when browser storage is unavailable.
      }
    }
  },
  openTab: (tab) =>
    updateState((current) => ({
      tabs: current.tabs.some((item) => item.href === tab.href) ? current.tabs : [...current.tabs, tab],
    })),
  closeTab: (href) =>
    updateState((current) => ({ tabs: current.tabs.filter((tab) => tab.href !== href) })),
  moveTab: (sourceHref, targetHref) =>
    updateState((current) => {
      const fromIndex = current.tabs.findIndex((tab) => tab.href === sourceHref);
      const toIndex = current.tabs.findIndex((tab) => tab.href === targetHref);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return {};
      const tabs = [...current.tabs];
      const [movedTab] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, movedTab);
      return { tabs };
    }),
  restoreTabs: (tabs) => updateState({ tabs, tabsHydrated: true }),
};

// Must come AFTER `state` is assigned. updateState always creates a new object,
// so this snapshot is never mutated. It is what the server and the first
// hydration render see, so they always match.
const initialState = state;

function subscribe(listener: StateListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

type AppStoreHook = {
  <Selection>(selector: (current: AppState) => Selection): Selection;
  getState: () => AppState;
};

export const useAppStore: AppStoreHook = Object.assign(
  <Selection,>(selector: (current: AppState) => Selection) =>
    useSyncExternalStore(
      subscribe,
      () => selector(state), // client: live state
      () => selector(initialState) // server + hydration: always the empty state
    ),
  { getState: () => state },
);