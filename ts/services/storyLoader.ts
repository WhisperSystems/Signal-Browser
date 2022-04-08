// Copyright 2022 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { pick } from 'lodash';
import type { MessageAttributesType } from '../model-types.d';
import type { StoryDataType } from '../state/ducks/stories';
import * as log from '../logging/log';
import dataInterface from '../sql/Client';
import { getAttachmentsForMessage } from '../state/selectors/message';
import { isNotNil } from '../util/isNotNil';
import { strictAssert } from '../util/assert';

let storyData: Array<MessageAttributesType> | undefined;

export async function loadStories(): Promise<void> {
  storyData = await dataInterface.getOlderStories({});
}

export function getStoryDataFromMessageAttributes(
  message: MessageAttributesType,
  ourConversationId?: string
): StoryDataType | undefined {
  const { attachments } = message;
  const unresolvedAttachment = attachments ? attachments[0] : undefined;
  if (!unresolvedAttachment) {
    log.warn(
      `getStoryDataFromMessageAttributes: ${message.id} does not have an attachment`
    );
    return;
  }

  const [attachment] = unresolvedAttachment.path
    ? getAttachmentsForMessage(message)
    : [unresolvedAttachment];

  const selectedReaction = (
    (message.reactions || []).find(re => re.fromId === ourConversationId) || {}
  ).emoji;

  return {
    attachment,
    messageId: message.id,
    selectedReaction,
    ...pick(message, [
      'conversationId',
      'readStatus',
      'source',
      'sourceUuid',
      'timestamp',
    ]),
  };
}

export function getStoriesForRedux(): Array<StoryDataType> {
  strictAssert(storyData, 'storyData has not been loaded');

  const ourConversationId =
    window.ConversationController.getOurConversationId();

  const stories = storyData
    .map(story => getStoryDataFromMessageAttributes(story, ourConversationId))
    .filter(isNotNil);

  storyData = undefined;

  return stories;
}
