// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { Database } from '@signalapp/better-sqlite3';

import type { LoggerType } from '../../types/Logging';

export default function updateToSchemaVersion57(
  currentVersion: number,
  db: Database,
  logger: LoggerType
): void {
  if (currentVersion >= 57) {
    return;
  }

  db.transaction(() => {
    db.exec(
      `
      DELETE FROM messages
      WHERE type IS 'message-history-unsynced';
      `
    );

    db.pragma('user_version = 57');
  })();

  logger.info('updateToSchemaVersion57: success!');
}
