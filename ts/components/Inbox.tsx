// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ReactNode } from 'react';
import React, { useEffect, useState, useMemo } from 'react';
import type { LocalizerType } from '../types/Util';
import * as log from '../logging/log';
import { SECOND, DAY } from '../util/durations';
import type { SmartNavTabsProps } from '../state/smart/NavTabs';

export type PropsType = {
  firstEnvelopeTimestamp: number | undefined;
  envelopeTimestamp: number | undefined;
  hasInitialLoadCompleted: boolean;
  i18n: LocalizerType;
  isCustomizingPreferredReactions: boolean;
  navTabsCollapsed: boolean;
  onToggleNavTabsCollapse: (navTabsCollapsed: boolean) => unknown;
  renderCallsTab: () => JSX.Element;
  renderChatsTab: () => JSX.Element;
  renderCustomizingPreferredReactionsModal: () => JSX.Element;
  renderNavTabs: (props: SmartNavTabsProps) => JSX.Element;
  renderStoriesTab: () => JSX.Element;
};

export function Inbox({
  firstEnvelopeTimestamp,
  envelopeTimestamp,
  hasInitialLoadCompleted,
  i18n,
  isCustomizingPreferredReactions,
  navTabsCollapsed,
  onToggleNavTabsCollapse,
  renderCallsTab,
  renderChatsTab,
  renderCustomizingPreferredReactionsModal,
  renderNavTabs,
  renderStoriesTab,
}: PropsType): JSX.Element {
  const [internalHasInitialLoadCompleted, setInternalHasInitialLoadCompleted] =
    useState(hasInitialLoadCompleted);

  const now = useMemo(() => Date.now(), []);
  const midnight = useMemo(() => {
    const date = new Date(now);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }, [now]);

  useEffect(() => {
    if (internalHasInitialLoadCompleted) {
      return;
    }

    const interval = setInterval(() => {
      const status = window.getSocketStatus();
      switch (status) {
        case 'CONNECTING':
          break;
        case 'OPEN':
          // if we've connected, we can wait for real empty event
          clearInterval(interval);
          break;
        case 'CLOSING':
        case 'CLOSED':
          clearInterval(interval);
          // if we failed to connect, we pretend we loaded
          setInternalHasInitialLoadCompleted(true);
          break;
        default:
          log.warn(
            `startConnectionListener: Found unexpected socket status ${status}; setting load to done manually.`
          );
          setInternalHasInitialLoadCompleted(true);
          break;
      }
    }, SECOND);

    return () => {
      clearInterval(interval);
    };
  }, [internalHasInitialLoadCompleted]);

  useEffect(() => {
    setInternalHasInitialLoadCompleted(hasInitialLoadCompleted);
  }, [hasInitialLoadCompleted]);

  if (!internalHasInitialLoadCompleted) {
    let loadingProgress = 0;
    if (
      firstEnvelopeTimestamp !== undefined &&
      envelopeTimestamp !== undefined
    ) {
      loadingProgress =
        Math.max(
          0,
          Math.min(
            1,
            Math.max(0, envelopeTimestamp - firstEnvelopeTimestamp) /
              Math.max(1e-23, now - firstEnvelopeTimestamp)
          )
        ) * 100;
    }

    let message: string | undefined;
    if (envelopeTimestamp !== undefined) {
      const daysBeforeMidnight = Math.ceil(
        (midnight - envelopeTimestamp) / DAY
      );

      if (daysBeforeMidnight <= 0) {
        message = i18n('icu:loadingMessages--today');
      } else if (daysBeforeMidnight === 1) {
        message = i18n('icu:loadingMessages--yesterday');
      } else {
        message = i18n('icu:loadingMessages--other', {
          daysAgo: daysBeforeMidnight,
        });
      }
    }

    return (
      <div className="app-loading-screen">
        <div className="module-title-bar-drag-area" />

        <div className="module-splash-screen__logo module-img--150" />
        {envelopeTimestamp === undefined ? (
          <div className="container">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        ) : (
          <div className="app-loading-screen__progress--container">
            <div
              className="app-loading-screen__progress--bar"
              style={{ transform: `translateX(${loadingProgress - 100}%)` }}
            />
          </div>
        )}
        {message === undefined ? (
          <div className="message-placeholder" />
        ) : (
          <div className="message">{message}</div>
        )}
        <div id="toast" />
      </div>
    );
  }

  let activeModal: ReactNode;
  if (isCustomizingPreferredReactions) {
    activeModal = renderCustomizingPreferredReactionsModal();
  }

  return (
    <>
      <div className="Inbox">
        <div className="module-title-bar-drag-area" />
        {renderNavTabs({
          navTabsCollapsed,
          onToggleNavTabsCollapse,
          renderChatsTab,
          renderCallsTab,
          renderStoriesTab,
        })}
      </div>
      {activeModal}
    </>
  );
}
