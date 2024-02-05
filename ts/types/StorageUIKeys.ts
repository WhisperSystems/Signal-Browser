// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { z } from 'zod';
import type { StorageAccessType } from './Storage.d';

export const themeSettingSchema = z.enum(['system', 'light', 'dark']);
export type ThemeSettingType = z.infer<typeof themeSettingSchema>;

// Configuration keys that only affect UI
export const STORAGE_UI_KEYS: ReadonlyArray<keyof StorageAccessType> = [
  'always-relay-calls',
  'audio-notification',
  'audioMessage',
  'auto-download-update',
  'autoConvertEmoji',
  'badge-count-muted-conversations',
  'call-ringtone-notification',
  'call-system-notification',
  'customColors',
  'defaultConversationColor',
  'existingOnboardingStoryMessageIds',
  'formattingWarningShown',
  'hasCompletedSafetyNumberOnboarding',
  'hasCompletedUsernameLinkOnboarding',
  'hide-menu-bar',
  'incoming-call-notification',
  'localeOverride',
  'navTabsCollapsed',
  'notification-draw-attention',
  'notification-setting',
  'pinnedConversationIds',
  'preferred-audio-input-device',
  'preferred-audio-output-device',
  'preferred-video-input-device',
  'preferredLeftPaneWidth',
  'preferredReactionEmoji',
  'sendEditWarningShown',
  'sent-media-quality',
  'showStickerPickerHint',
  'showStickersIntroduction',
  'skinTone',
  'spell-check',
  'system-tray-setting',
  'textFormatting',
  'theme-setting',
  'zoomFactor',
];
