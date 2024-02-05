// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ServiceIdString } from '../types/ServiceId';

export type MinimalConversationType = Readonly<{
  type?: string;
  e164?: string;
  serviceId?: ServiceIdString;
  discoveredUnregisteredAt?: number;
}>;

export function isConversationSMSOnly(
  conversation: MinimalConversationType
): boolean {
  const { e164, serviceId, type } = conversation;
  // `direct` for redux, `private` for models and the database
  if (type !== 'direct' && type !== 'private') {
    return false;
  }

  if (e164 && !serviceId) {
    return true;
  }

  return conversation.discoveredUnregisteredAt !== undefined;
}
