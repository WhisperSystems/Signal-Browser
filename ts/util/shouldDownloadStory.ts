// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ConversationAttributesType } from '../model-types.d';

import dataInterface from '../sql/Client';
import { isMe } from './whatTypeOfConversation';

const MAX_NUM_STORIES_TO_PREFETCH = 5;

export async function shouldDownloadStory(
  conversation: ConversationAttributesType
): Promise<boolean> {
  if (isMe(conversation)) {
    return true;
  }

  // We download the first time the user has posted a story
  if (!conversation.hasPostedStory) {
    return true;
  }

  const [storyReads, storyCounts] = await Promise.all([
    dataInterface.countStoryReadsByConversation(conversation.id),
    dataInterface.getStoryCount(conversation.id),
  ]);

  return storyReads > 0 && storyCounts <= MAX_NUM_STORIES_TO_PREFETCH;
}
