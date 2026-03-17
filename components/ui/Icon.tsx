/**
 * @file Icon.tsx
 * Defines the Icon component for rendering SVG icons using lucide-react.
 */

import React from 'react';
import { IconName } from '../../types';
import * as LucideIcons from 'lucide-react';

/**
 * Props for the Icon component.
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Name of the icon to display. Must match a key in the `icons` record. */
  iconName: IconName;
  /** Optional CSS classes to apply to the SVG element. */
  className?: string;
}

/**
 * Renders a scalable SVG icon from lucide-react.
 *
 * @param {IconProps} props - The properties for the Icon component, including `iconName`.
 * @returns {React.ReactElement} A JSX element representing the SVG icon.
 */
export const Icon: React.FC<IconProps> = ({ iconName, className = 'w-6 h-6', ...props }) => {
  // Map our custom icon names to Lucide icon components
  const iconMap: Record<IconName, React.ElementType> = {
    'user': LucideIcons.User,
    'users': LucideIcons.Users,
    'academic-cap': LucideIcons.GraduationCap,
    'identification': LucideIcons.IdCard,
    'user-circle': LucideIcons.UserCircle,
    'phone': LucideIcons.Phone,
    'globe': LucideIcons.Globe,
    'currency-dollar': LucideIcons.DollarSign,
    'banknotes': LucideIcons.Banknote,
    'calendar': LucideIcons.Calendar,
    'cog': LucideIcons.Settings,
    'plus': LucideIcons.Plus,
    'pencil': LucideIcons.Pencil,
    'trash': LucideIcons.Trash2,
    'moon': LucideIcons.Moon,
    'sun': LucideIcons.Sun,
    'x-mark': LucideIcons.X,
    'arrow-left': LucideIcons.ArrowLeft,
    'arrow-right': LucideIcons.ArrowRight,
    'bars': LucideIcons.Menu,
    'search': LucideIcons.Search,
    'share': LucideIcons.Share2,
    'envelope': LucideIcons.Mail,
    'chart-bar': LucideIcons.BarChart3,
    'document-text': LucideIcons.FileText,
    'star': LucideIcons.Star,
    'bolt': LucideIcons.Zap,
    'trophy': LucideIcons.Trophy,
    'sparkles': LucideIcons.Sparkles,
    'warning': LucideIcons.AlertTriangle,
    'check-circle': LucideIcons.CheckCircle2,
    'x-circle': LucideIcons.XCircle,
    'information-circle': LucideIcons.Info,
    'arrow-right-on-rectangle': LucideIcons.LogOut,
    'user-plus': LucideIcons.UserPlus,
    'book-open': LucideIcons.BookOpen,
    'credit-card': LucideIcons.CreditCard,
    'clock': LucideIcons.Clock,
    'lock-closed': LucideIcons.Lock,
    'chevron-right': LucideIcons.ChevronRight,
    'trending-up': LucideIcons.TrendingUp,
    'crown': LucideIcons.Crown,
    'building': LucideIcons.Landmark,
    'gem': LucideIcons.Gem,
    'rocket': LucideIcons.Rocket,
    'brush': LucideIcons.Brush,
    'flame': LucideIcons.Flame,
    'award': LucideIcons.Award,
    'target': LucideIcons.Target,
    'gift': LucideIcons.Gift,
    'brain': LucideIcons.Brain,
    'handshake': LucideIcons.Handshake,
    'ticket': LucideIcons.Ticket,
    'briefcase': LucideIcons.Briefcase,
    'party-popper': LucideIcons.PartyPopper,
  };

  const LucideIcon = iconMap[iconName] || LucideIcons.HelpCircle;

  return <LucideIcon className={className} {...(props as any)} />;
};