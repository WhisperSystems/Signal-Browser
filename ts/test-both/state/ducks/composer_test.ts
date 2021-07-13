// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';

import { actions, getEmptyState, reducer } from '../../../state/ducks/composer';

import { IMAGE_JPEG } from '../../../types/MIME';
import { AttachmentType } from '../../../types/Attachment';

describe('both/state/ducks/composer', () => {
  const QUOTED_MESSAGE = {
    conversationId: '123',
    quote: {
      attachments: [],
      id: '456',
      isViewOnce: false,
      messageId: '789',
      referencedMessageNotFound: false,
    },
  };

  describe('replaceAttachments', () => {
    it('replaces the attachments state', () => {
      const { replaceAttachments } = actions;
      const state = getEmptyState();
      const attachments: Array<AttachmentType> = [{ contentType: IMAGE_JPEG }];
      const nextState = reducer(state, replaceAttachments(attachments));

      assert.deepEqual(nextState.attachments, attachments);
    });

    it('sets the high quality setting to false when there are no attachments', () => {
      const { replaceAttachments } = actions;
      const state = getEmptyState();
      const attachments: Array<AttachmentType> = [];
      const nextState = reducer(
        { ...state, shouldSendHighQualityAttachments: true },
        replaceAttachments(attachments)
      );

      assert.deepEqual(nextState.attachments, attachments);
      assert.isFalse(nextState.shouldSendHighQualityAttachments);
    });
  });

  describe('resetComposer', () => {
    it('returns composer back to empty state', () => {
      const { resetComposer } = actions;
      const nextState = reducer(
        {
          attachments: [],
          linkPreviewLoading: true,
          quotedMessage: QUOTED_MESSAGE,
          shouldSendHighQualityAttachments: true,
        },
        resetComposer()
      );

      assert.deepEqual(nextState, getEmptyState());
    });
  });

  describe('setLinkPreviewResult', () => {
    it('sets loading state when loading', () => {
      const { setLinkPreviewResult } = actions;
      const state = getEmptyState();
      const nextState = reducer(state, setLinkPreviewResult(true));

      assert.isTrue(nextState.linkPreviewLoading);
    });

    it('sets the link preview result', () => {
      const { setLinkPreviewResult } = actions;
      const state = getEmptyState();
      const nextState = reducer(
        state,
        setLinkPreviewResult(false, {
          domain: 'https://www.signal.org/',
          title: 'Signal >> Careers',
          url: 'https://www.signal.org/workworkwork',
          description:
            'Join an organization that empowers users by making private communication simple.',
          date: null,
        })
      );

      assert.isFalse(nextState.linkPreviewLoading);
      assert.equal(nextState.linkPreviewResult?.title, 'Signal >> Careers');
    });
  });

  describe('setMediaQualitySetting', () => {
    it('toggles the media quality setting', () => {
      const { setMediaQualitySetting } = actions;
      const state = getEmptyState();

      assert.isFalse(state.shouldSendHighQualityAttachments);

      const nextState = reducer(state, setMediaQualitySetting(true));

      assert.isTrue(nextState.shouldSendHighQualityAttachments);

      const nextNextState = reducer(nextState, setMediaQualitySetting(false));

      assert.isFalse(nextNextState.shouldSendHighQualityAttachments);
    });
  });

  describe('setQuotedMessage', () => {
    it('sets the quoted message', () => {
      const { setQuotedMessage } = actions;
      const state = getEmptyState();
      const nextState = reducer(state, setQuotedMessage(QUOTED_MESSAGE));

      assert.equal(nextState.quotedMessage?.conversationId, '123');
      assert.equal(nextState.quotedMessage?.quote?.id, '456');
    });
  });
});
