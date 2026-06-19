const fs = require('fs');
const filepath = './pages/settings-sections/GamificationSettings.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(
  '<input\n          type="checkbox"\n          name="customAchievementEarned"\n          checked={formData.customAchievementEarned || false}\n          onChange={(e) => setFormData(prev => ({...prev, customAchievementEarned: e.target.checked}))}\n          className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent bg-transparent"\n        />',
  '<input\n          type="checkbox"\n          role="switch"\n          aria-checked={formData.customAchievementEarned || false}\n          name="customAchievementEarned"\n          checked={formData.customAchievementEarned || false}\n          onChange={(e) => setFormData(prev => ({...prev, customAchievementEarned: e.target.checked}))}\n          className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent bg-transparent"\n        />'
);

fs.writeFileSync(filepath, content);
