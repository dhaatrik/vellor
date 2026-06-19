import React from 'react';
import { Card, Input, Button } from '../../components/ui';
import { AppSettings } from '../../types';
import { TUTOR_RANK_LEVELS } from '../../constants';

const CustomAchievementSettings: React.FC<{
  formData: AppSettings;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
}> = ({ formData, handleChange, setFormData }) => (
  <div className="mt-6">
    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Personal Achievement</h4>
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Input
          label="My Custom Achievement"
          name="customAchievement"
          placeholder="e.g. Save $5,000 for a new laptop"
          value={formData.customAchievement || ''}
          onChange={handleChange}
        />
      </div>
      <label className="flex items-center gap-2 mb-2 cursor-pointer">
        <input
          type="checkbox"
          role="switch"
          aria-checked={formData.customAchievementEarned || false}
          name="customAchievementEarned"
          checked={formData.customAchievementEarned || false}
          onChange={(e) => setFormData(prev => ({...prev, customAchievementEarned: e.target.checked}))}
          className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent bg-transparent"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 border py-2 px-3 rounded-xl hover:bg-gray-50 dark:border-white/10 dark:hover:bg-primary-light transition-colors">
          Mark as Earned
        </span>
      </label>
    </div>
  </div>
);

interface GamificationSettingsProps {
  formData: AppSettings;
  setFormData: React.Dispatch<React.SetStateAction<AppSettings>>;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const GamificationSettings: React.FC<GamificationSettingsProps> = ({ formData, setFormData, updateSettings }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleSaveGamification = () => {
    updateSettings({
      gamificationEnabled: formData.gamificationEnabled,
      customRankTitles: formData.customRankTitles,
      customAchievement: formData.customAchievement,
      customAchievementEarned: formData.customAchievementEarned
    });
  };

  return (
    <Card title="Gamification Settings" titleIcon="star">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 id="gamificationHeading" className="font-semibold text-gray-900 dark:text-white">Enable Gamification</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Show points, streaks, and ranks on your dashboard.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input role="switch" aria-checked={formData.gamificationEnabled ?? true} type="checkbox" aria-labelledby="gamificationHeading" name="gamificationEnabled" checked={formData.gamificationEnabled ?? true} onChange={(e) => setFormData(prev => ({...prev, gamificationEnabled: e.target.checked}))} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-accent"></div>
          </label>
        </div>

        {formData.gamificationEnabled !== false && (
          <>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 mt-4">Custom Rank Titles</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Rename the default tutor ranks to whatever you like.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0,1,2,3,4,5].map(idx => (
                  <Input
                    key={idx}
                    label={`Level ${idx+1} Title`}
                    value={formData.customRankTitles?.[idx] || TUTOR_RANK_LEVELS[idx].name}
                    onChange={(e) => {
                      const newArr = [...(formData.customRankTitles || TUTOR_RANK_LEVELS.map(r => r.name))];
                      newArr[idx] = e.target.value;
                      setFormData(prev => ({...prev, customRankTitles: newArr}));
                    }}
                  />
                ))}
              </div>
            </div>
            <CustomAchievementSettings
              formData={formData}
              handleChange={handleChange}
              setFormData={setFormData}
            />
          </>
        )}
        <div className="pt-4 flex justify-end">
          <Button onClick={handleSaveGamification} variant="primary" leftIcon="check-circle" className="rounded-full shadow-md shadow-accent/10">Save Gamification</Button>
        </div>
      </div>
    </Card>
  );
};
