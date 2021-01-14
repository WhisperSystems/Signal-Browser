// Copyright 2020-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { isBoolean } from 'lodash';
import { boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import { GroupV1MigrationDialog, PropsType } from './GroupV1MigrationDialog';
import { setup as setupI18n } from '../../js/modules/i18n';
import enMessages from '../../_locales/en/messages.json';

const i18n = setupI18n('en', enMessages);

const contact1 = {
  title: 'Alice',
  number: '+1 (300) 555-0000',
  id: 'guid-1',
  markedUnread: false,
  type: 'direct' as const,
  lastUpdated: Date.now(),
};

const contact2 = {
  title: 'Bob',
  number: '+1 (300) 555-0001',
  id: 'guid-2',
  markedUnread: false,
  type: 'direct' as const,
  lastUpdated: Date.now(),
};

const contact3 = {
  title: 'Chet',
  number: '+1 (300) 555-0002',
  id: 'guid-3',
  markedUnread: false,
  type: 'direct' as const,
  lastUpdated: Date.now(),
};

function booleanOr(value: boolean | undefined, defaultValue: boolean): boolean {
  return isBoolean(value) ? value : defaultValue;
}

const createProps = (overrideProps: Partial<PropsType> = {}): PropsType => ({
  areWeInvited: boolean(
    'areWeInvited',
    booleanOr(overrideProps.areWeInvited, false)
  ),
  droppedMembers: overrideProps.droppedMembers || [contact3, contact1],
  hasMigrated: boolean(
    'hasMigrated',
    booleanOr(overrideProps.hasMigrated, false)
  ),
  i18n,
  invitedMembers: overrideProps.invitedMembers || [contact2],
  migrate: action('migrate'),
  onClose: action('onClose'),
});

const stories = storiesOf('Components/GroupV1MigrationDialog', module);

stories.add('Not yet migrated, basic', () => {
  return <GroupV1MigrationDialog {...createProps()} />;
});

stories.add('Migrated, basic', () => {
  return (
    <GroupV1MigrationDialog
      {...createProps({
        hasMigrated: true,
      })}
    />
  );
});

stories.add('Migrated, you are invited', () => {
  return (
    <GroupV1MigrationDialog
      {...createProps({
        hasMigrated: true,
        areWeInvited: true,
      })}
    />
  );
});

stories.add('Not yet migrated, multiple dropped and invited members', () => {
  return (
    <GroupV1MigrationDialog
      {...createProps({
        droppedMembers: [contact3, contact1, contact2],
        invitedMembers: [contact2, contact3, contact1],
      })}
    />
  );
});

stories.add('Not yet migrated, no members', () => {
  return (
    <GroupV1MigrationDialog
      {...createProps({
        droppedMembers: [],
        invitedMembers: [],
      })}
    />
  );
});

stories.add('Not yet migrated, just dropped member', () => {
  return (
    <GroupV1MigrationDialog
      {...createProps({
        invitedMembers: [],
      })}
    />
  );
});
