import { create } from 'zustand';
import type { ReportSnapshot, ReportData, RangeType } from '@/types';
import { generateId } from '@/utils/idUtils';

const STORAGE_KEY = 'noise_report_snapshots';

interface SnapshotState {
  snapshots: ReportSnapshot[];
  addSnapshot: (data: {
    name: string;
    rangeType: RangeType;
    reportData: ReportData;
    recordIds: string[];
    recordUpdatedAts: Record<string, string>;
  }) => void;
  renameSnapshot: (id: string, name: string) => void;
  deleteSnapshot: (id: string) => void;
  hydrateFromStorage: () => void;
}

const persistSnapshots = (snapshots: ReportSnapshot[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch (e) {
    console.error('保存快照失败:', e);
  }
};

const loadSnapshots = (): ReportSnapshot[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as ReportSnapshot[];
    }
  } catch (e) {
    console.error('加载快照失败:', e);
  }
  return null;
};

export const useSnapshotStore = create<SnapshotState>((set, get) => ({
  snapshots: [],

  addSnapshot: ({ name, rangeType, reportData, recordIds, recordUpdatedAts }) => {
    const now = new Date().toISOString();
    const snapshot: ReportSnapshot = {
      id: generateId(),
      name,
      createdAt: now,
      rangeType,
      reportData,
      recordIds,
      recordUpdatedAts,
    };
    const newSnapshots = [snapshot, ...get().snapshots];
    set({ snapshots: newSnapshots });
    persistSnapshots(newSnapshots);
  },

  renameSnapshot: (id, name) => {
    const newSnapshots = get().snapshots.map((s) =>
      s.id === id ? { ...s, name } : s
    );
    set({ snapshots: newSnapshots });
    persistSnapshots(newSnapshots);
  },

  deleteSnapshot: (id) => {
    const newSnapshots = get().snapshots.filter((s) => s.id !== id);
    set({ snapshots: newSnapshots });
    persistSnapshots(newSnapshots);
  },

  hydrateFromStorage: () => {
    const stored = loadSnapshots();
    if (stored && stored.length > 0) {
      set({ snapshots: stored });
    }
  },
}));
