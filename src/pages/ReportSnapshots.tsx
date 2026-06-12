import * as React from 'react';
import {
  format,
  parseISO,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Camera,
  Eye,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ListOrdered,
  Clock,
  Star,
  Moon,
  Calendar,
} from 'lucide-react';
import { useSnapshotStore } from '@/store/useSnapshotStore';
import { useRecordsStore } from '@/store/useRecordsStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import SnapshotDetailModal from '@/components/snapshot/SnapshotDetailModal';
import type { ReportSnapshot } from '@/types';
import { getDurationText } from '@/utils/dateUtils';

const rangeLabelMap: Record<string, string> = {
  day: '今日',
  week: '本周',
  month: '本月',
  custom: '自定义',
};

const ReportSnapshots: React.FC = () => {
  const { snapshots, renameSnapshot, deleteSnapshot } = useSnapshotStore();
  const { records } = useRecordsStore();

  const [detailSnapshot, setDetailSnapshot] = React.useState<ReportSnapshot | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const checkStale = (snapshot: ReportSnapshot): boolean => {
    const currentRecords = records.filter((r) => {
      const d = r.date;
      return d >= snapshot.reportData.startDate && d <= snapshot.reportData.endDate;
    });
    const currentIds = new Set(currentRecords.map((r) => r.id));
    const snapshotIds = new Set(snapshot.recordIds);
    if (currentIds.size !== snapshotIds.size) return true;
    for (const id of currentIds) {
      if (!snapshotIds.has(id)) return true;
    }
    for (const id of snapshotIds) {
      if (!currentIds.has(id)) return true;
    }
    if (snapshot.recordUpdatedAts) {
      for (const r of currentRecords) {
        if (snapshot.recordUpdatedAts[r.id] !== r.updatedAt) return true;
      }
    }
    return false;
  };

  const handleStartRename = (snapshot: ReportSnapshot) => {
    setEditingId(snapshot.id);
    setEditName(snapshot.name);
    setDeleteConfirmId(null);
  };

  const handleConfirmRename = () => {
    if (editingId && editName.trim()) {
      renameSnapshot(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    deleteSnapshot(id);
    setDeleteConfirmId(null);
    if (detailSnapshot?.id === id) {
      setDetailSnapshot(null);
    }
  };

  const isStale = detailSnapshot ? checkStale(detailSnapshot) : false;

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: '50ms' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Camera className="w-7 h-7 text-primary" />
          报告快照
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          查看已保存的报告快照，回顾历史统计结果
        </p>
      </div>

      {snapshots.length === 0 ? (
        <Card>
          <CardContent className="py-20">
            <div className="text-center">
              <Camera className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm mb-1">暂无报告快照</p>
              <p className="text-slate-300 text-xs">
                在「汇总导出」页面预览报告后，点击「保存快照」即可保存
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snapshot) => {
            const stale = checkStale(snapshot);
            const isEditing = editingId === snapshot.id;
            const isDeleting = deleteConfirmId === snapshot.id;

            return (
              <Card key={snapshot.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            className="flex-1 px-3 py-1.5 text-sm border border-primary/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                            autoFocus
                          />
                          <Button variant="primary" size="sm" onClick={handleConfirmRename}>
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleCancelRename}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <h3 className="font-semibold text-slate-800 truncate">
                          {snapshot.name}
                        </h3>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(snapshot.createdAt), 'yyyy-MM-dd HH:mm')}
                        </span>
                        <span>
                          {snapshot.reportData.startDate === snapshot.reportData.endDate
                            ? format(parseISO(snapshot.reportData.startDate), 'yyyy年MM月dd日', { locale: zhCN })
                            : `${snapshot.reportData.startDate} ~ ${snapshot.reportData.endDate}`}
                        </span>
                        <Badge variant="gray" size="sm">
                          {rangeLabelMap[snapshot.rangeType] || snapshot.rangeType}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <ListOrdered className="w-3 h-3" />
                          {snapshot.reportData.totalCount} 次
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getDurationText(snapshot.reportData.totalMinutes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          强度 {snapshot.reportData.avgIntensity.toFixed(1)}
                        </span>
                        {snapshot.reportData.nightCount > 0 && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Moon className="w-3 h-3" />
                            夜间 {snapshot.reportData.nightCount}
                          </span>
                        )}
                      </div>

                      {stale && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>原始数据已变更，快照数据可能已过期</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDetailSnapshot(snapshot);
                          setDeleteConfirmId(null);
                          setEditingId(null);
                        }}
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartRename(snapshot)}
                        title="重命名"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {isDeleting ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(snapshot.id)}
                          >
                            确认删除
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(null)}
                          >
                            取消
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteConfirmId(snapshot.id);
                            setEditingId(null);
                          }}
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SnapshotDetailModal
        open={!!detailSnapshot}
        onClose={() => setDetailSnapshot(null)}
        snapshot={detailSnapshot}
        isStale={isStale}
      />
    </div>
  );
};

ReportSnapshots.displayName = 'ReportSnapshots';

export default ReportSnapshots;
