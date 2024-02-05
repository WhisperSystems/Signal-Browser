// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ConversationAttributesType } from '../model-types';
import type { RecipientsByConversation } from '../state/ducks/stories';

import { getConversationMembers } from './getConversationMembers';
import { isNotNil } from './isNotNil';

export function getRecipientsByConversation(
  conversations: Array<ConversationAttributesType>
): RecipientsByConversation {
  const recipientsByConversation: RecipientsByConversation = {};

  conversations.forEach(attributes => {
    recipientsByConversation[attributes.id] = {
      serviceIds: getConversationMembers(attributes)
        .map(member => member.serviceId)
        .filter(isNotNil),
    };
  });

  return recipientsByConversation;
}
