import React from 'react';
import { Globe, HardDrive, Smartphone } from 'lucide-react';
import { DEVICE_LABELS, type Device } from '../../data/wallets.js';

const STYLES: Record<Device, { cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  IOS: { cls: 'text-slate-700 bg-slate-100', Icon: Smartphone },
  ANDROID: { cls: 'text-emerald-700 bg-emerald-50', Icon: Smartphone },
  WEB: { cls: 'text-[#175CFF] bg-[#EDF4FF]', Icon: Globe },
  HARDWARE: { cls: 'text-amber-800 bg-amber-50', Icon: HardDrive },
};

const SHORT: Record<Device, string> = { IOS: 'iOS', ANDROID: 'Android', WEB: 'Web', HARDWARE: 'Hardware' };

export const DeviceBadge: React.FC<{ device: Device; long?: boolean }> = ({ device, long = false }) => {
  const { cls, Icon } = STYLES[device];
  return (
    <span
      title={DEVICE_LABELS[device]}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      <Icon className="h-3 w-3" />
      <span>{long ? DEVICE_LABELS[device] : SHORT[device]}</span>
    </span>
  );
};

export const CapabilityTag: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-violet-700">
    {label}
  </span>
);
