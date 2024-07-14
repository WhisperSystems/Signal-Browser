// Copyright 2023 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
import ReactDOM from 'react-dom';

import type { PropsPreloadType } from '../../components/Preferences';
import { i18n } from '../sandboxedInit';
import { Preferences } from '../../components/Preferences';
import { startInteractionMode } from '../../services/InteractionMode';
import { strictAssert } from '../../util/assert';
import { parseEnvironment, setEnvironment } from '../../environment';

const { SettingsWindowProps } = window.Signal;

strictAssert(SettingsWindowProps, 'window values not provided');

startInteractionMode();

setEnvironment(
  parseEnvironment(window.SignalContext.getEnvironment()),
  window.SignalContext.isTestOrMockEnvironment()
);

SettingsWindowProps.onRender(
  ({
    addCustomColor,
    availableCameras,
    availableLocales,
    availableMicrophones,
    availableSpeakers,
    blockedCount,
    closeSettings,
    customColors,
    defaultConversationColor,
    deviceName,
    phoneNumber,
    doDeleteAllData,
    doneRendering,
    editCustomColor,
    getConversationsWithCustomColor,
    hasAudioNotifications,
    hasAutoConvertEmoji,
    hasAutoDownloadUpdate,
    hasAutoLaunch,
    hasCallNotifications,
    hasCallRingtoneNotification,
    hasCountMutedConversations,
    hasHideMenuBar,
    hasAnyFileTypeAllowed,
    hasIncomingCallNotifications,
    hasLinkPreviews,
    hasMediaCameraPermissions,
    hasMediaPermissions,
    hasMessageAudio,
    hasMinimizeToAndStartInSystemTray,
    hasMinimizeToSystemTray,
    hasNotificationAttention,
    hasNotifications,
    hasReadReceipts,
    hasRelayCalls,
    hasSpellCheck,
    hasStoriesDisabled,
    hasTextFormatting,
    hasTypingIndicators,
    initialSpellCheckSetting,
    isAutoDownloadUpdatesSupported,
    isAutoLaunchSupported,
    isHideMenuBarSupported,
    isMinimizeToAndStartInSystemTraySupported,
    isNotificationAttentionSupported,
    isSyncSupported,
    isSystemTraySupported,
    lastSyncTime,
    makeSyncRequest,
    notificationContent,
    onAudioNotificationsChange,
    onAutoConvertEmojiChange,
    onAutoDownloadUpdateChange,
    onAutoLaunchChange,
    onCallNotificationsChange,
    onCallRingtoneNotificationChange,
    onCountMutedConversationsChange,
    onHasStoriesDisabledChanged,
    onHideMenuBarChange,
    onIncomingCallNotificationsChange,
    onLastSyncTimeChange,
    onLocaleChange,
    onMediaCameraPermissionsChange,
    onMediaPermissionsChange,
    onMessageAudioChange,
    onAnyFileTypeAllowedChange,
    onMinimizeToAndStartInSystemTrayChange,
    onMinimizeToSystemTrayChange,
    onNotificationAttentionChange,
    onNotificationContentChange,
    onNotificationsChange,
    onRelayCallsChange,
    onSelectedCameraChange,
    onSelectedMicrophoneChange,
    onSelectedSpeakerChange,
    onSentMediaQualityChange,
    onSpellCheckChange,
    onTextFormattingChange,
    onThemeChange,
    onUniversalExpireTimerChange,
    onWhoCanFindMeChange,
    onWhoCanSeeMeChange,
    onZoomFactorChange,
    preferredSystemLocales,
    removeCustomColor,
    removeCustomColorOnConversations,
    resetAllChatColors,
    resetDefaultChatColor,
    resolvedLocale,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    sentMediaQualitySetting,
    setGlobalDefaultConversationColor,
    localeOverride,
    themeSetting,
    universalExpireTimer,
    whoCanFindMe,
    whoCanSeeMe,
    zoomFactor,
  }: PropsPreloadType) => {
    ReactDOM.render(
      <Preferences
        addCustomColor={addCustomColor}
        availableCameras={availableCameras}
        availableLocales={availableLocales}
        availableMicrophones={availableMicrophones}
        availableSpeakers={availableSpeakers}
        blockedCount={blockedCount}
        closeSettings={closeSettings}
        customColors={customColors}
        defaultConversationColor={defaultConversationColor}
        deviceName={deviceName}
        phoneNumber={phoneNumber}
        doDeleteAllData={doDeleteAllData}
        doneRendering={doneRendering}
        editCustomColor={editCustomColor}
        getConversationsWithCustomColor={getConversationsWithCustomColor}
        hasAnyFileTypeAllowed={hasAnyFileTypeAllowed}
        hasAudioNotifications={hasAudioNotifications}
        hasAutoConvertEmoji={hasAutoConvertEmoji}
        hasAutoDownloadUpdate={hasAutoDownloadUpdate}
        hasAutoLaunch={hasAutoLaunch}
        hasCallNotifications={hasCallNotifications}
        hasCallRingtoneNotification={hasCallRingtoneNotification}
        hasCountMutedConversations={hasCountMutedConversations}
        hasHideMenuBar={hasHideMenuBar}
        hasIncomingCallNotifications={hasIncomingCallNotifications}
        hasLinkPreviews={hasLinkPreviews}
        hasMediaCameraPermissions={hasMediaCameraPermissions}
        hasMediaPermissions={hasMediaPermissions}
        hasMessageAudio={hasMessageAudio}
        hasMinimizeToAndStartInSystemTray={hasMinimizeToAndStartInSystemTray}
        hasMinimizeToSystemTray={hasMinimizeToSystemTray}
        hasNotificationAttention={hasNotificationAttention}
        hasNotifications={hasNotifications}
        hasReadReceipts={hasReadReceipts}
        hasRelayCalls={hasRelayCalls}
        hasSpellCheck={hasSpellCheck}
        hasStoriesDisabled={hasStoriesDisabled}
        hasTextFormatting={hasTextFormatting}
        hasTypingIndicators={hasTypingIndicators}
        i18n={i18n}
        initialSpellCheckSetting={initialSpellCheckSetting}
        isAutoDownloadUpdatesSupported={isAutoDownloadUpdatesSupported}
        isAutoLaunchSupported={isAutoLaunchSupported}
        isHideMenuBarSupported={isHideMenuBarSupported}
        isMinimizeToAndStartInSystemTraySupported={
          isMinimizeToAndStartInSystemTraySupported
        }
        isNotificationAttentionSupported={isNotificationAttentionSupported}
        isSyncSupported={isSyncSupported}
        isSystemTraySupported={isSystemTraySupported}
        lastSyncTime={lastSyncTime}
        localeOverride={localeOverride}
        makeSyncRequest={makeSyncRequest}
        notificationContent={notificationContent}
        onAnyFileTypeAllowedChange={onAnyFileTypeAllowedChange}
        onAudioNotificationsChange={onAudioNotificationsChange}
        onAutoConvertEmojiChange={onAutoConvertEmojiChange}
        onAutoDownloadUpdateChange={onAutoDownloadUpdateChange}
        onAutoLaunchChange={onAutoLaunchChange}
        onCallNotificationsChange={onCallNotificationsChange}
        onCallRingtoneNotificationChange={onCallRingtoneNotificationChange}
        onCountMutedConversationsChange={onCountMutedConversationsChange}
        onHasStoriesDisabledChanged={onHasStoriesDisabledChanged}
        onHideMenuBarChange={onHideMenuBarChange}
        onIncomingCallNotificationsChange={onIncomingCallNotificationsChange}
        onLastSyncTimeChange={onLastSyncTimeChange}
        onLocaleChange={onLocaleChange}
        onMediaCameraPermissionsChange={onMediaCameraPermissionsChange}
        onMediaPermissionsChange={onMediaPermissionsChange}
        onMessageAudioChange={onMessageAudioChange}
        onMinimizeToAndStartInSystemTrayChange={
          onMinimizeToAndStartInSystemTrayChange
        }
        onMinimizeToSystemTrayChange={onMinimizeToSystemTrayChange}
        onNotificationAttentionChange={onNotificationAttentionChange}
        onNotificationContentChange={onNotificationContentChange}
        onNotificationsChange={onNotificationsChange}
        onRelayCallsChange={onRelayCallsChange}
        onSelectedCameraChange={onSelectedCameraChange}
        onSelectedMicrophoneChange={onSelectedMicrophoneChange}
        onSelectedSpeakerChange={onSelectedSpeakerChange}
        onSentMediaQualityChange={onSentMediaQualityChange}
        onSpellCheckChange={onSpellCheckChange}
        onTextFormattingChange={onTextFormattingChange}
        onThemeChange={onThemeChange}
        onUniversalExpireTimerChange={onUniversalExpireTimerChange}
        onWhoCanFindMeChange={onWhoCanFindMeChange}
        onWhoCanSeeMeChange={onWhoCanSeeMeChange}
        onZoomFactorChange={onZoomFactorChange}
        preferredSystemLocales={preferredSystemLocales}
        removeCustomColorOnConversations={removeCustomColorOnConversations}
        removeCustomColor={removeCustomColor}
        resetAllChatColors={resetAllChatColors}
        resetDefaultChatColor={resetDefaultChatColor}
        resolvedLocale={resolvedLocale}
        selectedCamera={selectedCamera}
        selectedMicrophone={selectedMicrophone}
        selectedSpeaker={selectedSpeaker}
        sentMediaQualitySetting={sentMediaQualitySetting}
        setGlobalDefaultConversationColor={setGlobalDefaultConversationColor}
        themeSetting={themeSetting}
        universalExpireTimer={universalExpireTimer}
        whoCanFindMe={whoCanFindMe}
        whoCanSeeMe={whoCanSeeMe}
        zoomFactor={zoomFactor}
      />,
      document.getElementById('app')
    );
  }
);
