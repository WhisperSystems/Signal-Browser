// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React from 'react';
import type { LocalizerType } from '../types/Util';
import { ConfirmationDialog } from './ConfirmationDialog';

type PropsType = {
  i18n: LocalizerType;
  onSendAnyway: () => void;
  onCancel: () => void;
};

export function FormattingWarningModal({
  i18n,
  onSendAnyway,
  onCancel,
}: PropsType): JSX.Element | null {
  return (
    <ConfirmationDialog
      actions={[
        {
          action: onSendAnyway,
          autoClose: true,
          style: 'affirmative',
          text: i18n('icu:sendAnyway'),
        },
      ]}
      dialogName="FormattingWarningModal"
      i18n={i18n}
      onCancel={onCancel}
      onClose={onCancel}
      title={i18n('icu:SendFormatting--dialog--title')}
    >
      {i18n('icu:SendFormatting--dialog--body')}
    </ConfirmationDialog>
  );
}
