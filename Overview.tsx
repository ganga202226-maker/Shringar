import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Shield,
  Bell,
  Lock,
  Globe,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Platform Settings */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg text-ivory-900 mb-5">Platform Settings</h2>
        <div className="space-y-4">
          <Input label="Platform Name" defaultValue="Shringar" icon={<Globe className="w-4 h-4" />} />
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Support Email</label>
            <Input type="email" defaultValue="support@shringar.in" icon={<Globe className="w-4 h-4" />} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Commission Rate (%)</label>
            <Input type="number" defaultValue="10" min={0} max={100} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Trial Booking Limit</label>
            <Input type="number" defaultValue="3" min={1} />
          </div>
        </div>
      </motion.section>

      {/* Maintenance Mode */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-gold-200 mt-0.5" />
            <div>
              <h2 className="font-heading text-lg text-ivory-900">Maintenance Mode</h2>
              <p className="text-sm text-ivory-600 mt-1">When enabled, only admins can access the platform</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-10 h-6 bg-ivory-200 rounded-full peer peer-checked:bg-rose-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>
      </motion.section>

      {/* Security */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg text-ivory-900 mb-5">Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-sm font-medium text-ivory-900">Force Password Reset</p>
                <p className="text-xs text-ivory-600">All users will be required to reset their password on next login</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Reset All</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium text-ivory-900">2FA for Admins</p>
                <p className="text-xs text-ivory-600">Two-factor authentication enabled for all admin accounts</p>
              </div>
            </div>
            <Badge variant="success">Enabled</Badge>
          </div>
        </div>
      </motion.section>

      {/* Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg text-ivory-900 mb-5">Notification Settings</h2>
        <div className="space-y-3">
          {[
            { label: 'New Salon Registration', enabled: true },
            { label: 'New User Signups', enabled: true },
            { label: 'Flagged Reviews', enabled: true },
            { label: 'Booking Anomalies', enabled: false },
            { label: 'Payment Failures', enabled: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-ivory-900">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                <div className="w-10 h-6 bg-ivory-200 rounded-full peer peer-checked:bg-rose-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="md" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm text-success"
          >
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </motion.span>
        )}
      </div>
    </div>
  );
}