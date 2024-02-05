// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
import { ConfirmationDialog } from './ConfirmationDialog';
import type { LocalizerType } from '../types/Util';

export type PropsType = {
  i18n: LocalizerType;
  onClose: () => unknown;
  onDiscard: () => unknown;
};

export function ConfirmDiscardDialog({
  i18n,
  onClose,
  onDiscard,
}: PropsType): JSX.Element {
  return (
    <ConfirmationDialog
      dialogName="ConfirmDiscardDialog"
      actions={[
        {
          action: onDiscard,
          text: i18n('icu:discard'),
          style: 'negative',
        },
      ]}
      i18n={i18n}
      onClose={onClose}
    >
      {i18n('icu:ConfirmDiscardDialog--discard')}
    </ConfirmationDialog>
  );
}
