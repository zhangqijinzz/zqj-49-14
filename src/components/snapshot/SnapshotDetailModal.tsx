import * as React from 'react';
import {
  format,
  parseISO,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  X,
  AlertTriangle,
  ListOrdered,
  Clock,
  Star,
  Moon,
  Sunrise,
  Sun,
  Sunset,
  Volume2,
  MapPin,
  Tag,
  Calendar,
  FileText,
  BarChart3,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { ReportSnapshot } from '@/types';
import { noiseTypes } from '@/constants/noiseTypes';
import { impactTags } from '@/constants/impactTags';
import { locations } from '@/constants/locations';
import { getDurationText } from '@/utils/dateUtils';
import { formatIntensity } from '@/utils/formatUtils';

interface SnapshotDetailModalProps {
  open: boolean;
  onClose: () => void;
  snapshot: ReportSnapshot | null;
  isStale: boolean;
}

const SnapshotDetailModal: React.FC<SnapshotDetailModalProps> = ({
  open,
  onClose,
  snapshot,
  isStale,
}) => {
  if (!snapshot) return null;

  const { reportData } = snapshot;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={snapshot.name}
      subtitle={`${format(parseISO(snapshot.createdAt), 'yyyy年MM月dd日 HH:mm 保存', { locale: zhCN })}`}
      size="xl"
    >
      {isStale && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">数据可能已过期</p>
            <p className="text-xs text-amber-600 mt-1">
              此快照保存后，原始噪音记录已发生变更（新增、修改或删除），快照中的统计数据可能与当前实际情况不一致。
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
              <ListOrdered className="w-3.5 h-3.5" />
              <span>干扰事件</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {reportData.totalCount}
              <span className="text-sm font-normal text-slate-500 ml-1">次</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>累计时长</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {getDurationText(reportData.totalMinutes)}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
              <Star className="w-3.5 h-3.5" />
              <span>平均强度</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              {reportData.avgIntensity.toFixed(1)}
              <span className="text-sm font-normal text-slate-500 ml-1">/ 5</span>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 text-orange-600 text-xs mb-2">
              <Moon className="w-3.5 h-3.5" />
              <span>夜间打扰</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {reportData.nightCount}
              <span className="text-sm font-normal text-orange-400 ml-1">次</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-primary mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
            <BarChart3 className="w-5 h-5" />
            时间段分布
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '上午', sub: '06:00-12:00', icon: Sunrise, value: reportData.timeRangeStats.morning, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: '下午', sub: '12:00-18:00', icon: Sun, value: reportData.timeRangeStats.afternoon, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: '傍晚', sub: '18:00-22:00', icon: Sunset, value: reportData.timeRangeStats.evening, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: '夜间 ⚠️', sub: '22:00-06:00', icon: Moon, value: reportData.timeRangeStats.night, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((t) => (
              <div key={t.label} className={`${t.bg} rounded-lg p-3 text-center`}>
                <t.icon className={`w-5 h-5 mx-auto mb-1 ${t.color}`} />
                <div className={`text-2xl font-bold ${t.color}`}>{t.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.label}</div>
                <div className="text-[10px] text-slate-400">{t.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="serif text-base font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              噪音类型
            </h3>
            <div className="space-y-2">
              {reportData.noiseTypeStats.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
              )}
              {reportData.noiseTypeStats.map((s) => {
                const max = Math.max(...reportData.noiseTypeStats.map((x) => x.count), 1);
                return (
                  <div key={s.type} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-16 shrink-0">{s.name}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(s.count / max) * 100}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="serif text-base font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              来源位置
            </h3>
            <div className="space-y-2">
              {reportData.locationStats.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
              )}
              {reportData.locationStats.map((s) => {
                const max = Math.max(...reportData.locationStats.map((x) => x.count), 1);
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-16 shrink-0">{s.name}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(s.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="serif text-base font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              受影响分类
            </h3>
            <div className="space-y-2">
              {reportData.tagStats.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-2">暂无数据</p>
              )}
              {reportData.tagStats.map((s) => {
                const max = Math.max(...reportData.tagStats.map((x) => x.count), 1);
                return (
                  <div key={s.tagId} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-16 shrink-0">{s.tagName}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(s.count / max) * 100}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-primary mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
            <Calendar className="w-5 h-5" />
            每日汇总
          </h3>
          {reportData.dailyStats.filter((d) => d.count > 0).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-lg">
              此时间段内暂无噪音记录
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="text-left px-4 py-2.5 font-medium">日期</th>
                    <th className="text-left px-4 py-2.5 font-medium">星期</th>
                    <th className="text-center px-4 py-2.5 font-medium">事件数</th>
                    <th className="text-center px-4 py-2.5 font-medium">累计时长</th>
                    <th className="text-center px-4 py-2.5 font-medium">平均强度</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.dailyStats
                    .filter((d) => d.count > 0)
                    .map((d, idx) => (
                      <tr key={d.date} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-2.5 text-slate-700">{d.date}</td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {format(parseISO(d.date), 'EEEE', { locale: zhCN })}
                        </td>
                        <td className="px-4 py-2.5 text-center font-medium">{d.count}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600">
                          {getDurationText(d.totalMinutes)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-amber-500">
                            {'★'.repeat(Math.round(d.avgIntensity))}
                            {'☆'.repeat(5 - Math.round(d.avgIntensity))}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">
                            ({d.avgIntensity.toFixed(1)})
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="serif text-lg font-semibold text-primary mb-3 flex items-center gap-2 pb-2 border-b border-slate-200">
            <FileText className="w-5 h-5" />
            详细记录清单
          </h3>
          {reportData.records.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-lg">
              <Volume2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">此时间段内暂无噪音记录</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reportData.records.map((r, idx) => {
                const typeInfo = noiseTypes.find((t) => t.key === r.noiseType);
                const locInfo = locations.find((l) => l.key === r.location);
                const isNight = (() => {
                  const [h] = r.startTime.split(':').map(Number);
                  return h >= 22 || h < 6;
                })();
                const tags = r.impactTagIds
                  .map((tid) => impactTags.find((t) => t.id === tid))
                  .filter(Boolean);
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-slate-200 p-4"
                    style={{ borderLeft: `4px solid ${typeInfo?.color || '#94a3b8'}` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs text-slate-400 mr-2">#{idx + 1}</span>
                        <span className="font-semibold text-slate-800">{r.title}</span>
                        {isNight && (
                          <Badge variant="warning" className="ml-2" size="sm">
                            <Moon className="w-3 h-3 mr-1" />
                            夜间
                          </Badge>
                        )}
                      </div>
                      <div className="text-amber-500 text-sm shrink-0 whitespace-nowrap">
                        {'★'.repeat(r.intensity)}
                        {'☆'.repeat(5 - r.intensity)}
                        <span className="text-xs text-slate-400 ml-1">
                          {formatIntensity(r.intensity)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>📅 {format(parseISO(r.date), 'yyyy.MM.dd EEEE', { locale: zhCN })}</span>
                      <span>⏰ {r.startTime} - {r.endTime}</span>
                      <span>⏱ {getDurationText(r.durationMinutes)}</span>
                      <span>🔊 {typeInfo?.name}</span>
                      <span>📍 {locInfo?.name}</span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tags.map((t) => (
                          <span
                            key={t!.id}
                            className="text-[11px] px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${t!.color}15`, color: t!.color }}
                          >
                            {t!.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {r.description && (
                      <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-100 leading-relaxed">
                        📝 {r.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

SnapshotDetailModal.displayName = 'SnapshotDetailModal';

export default SnapshotDetailModal;
