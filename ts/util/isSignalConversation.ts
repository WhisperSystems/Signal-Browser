// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { SIGNAL_ACI } from '../types/SignalConversation';
import type { ServiceIdString } from '../types/ServiceId';

export function isSignalConversation(conversation: {
  id: string;
  serviceId?: ServiceIdString;
}): boolean {
  const { id, serviceId } = conversation;

  if (serviceId) {
    return serviceId === SIGNAL_ACI;
  }

  return window.ConversationController.isSignalConversationId(id);
}
