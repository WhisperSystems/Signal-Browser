// Copyright 2018-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

const path = require('path');

const { app } = require('electron');

const { start } = require('./base_config');

const userDataPath = app.getPath('userData');
const targetPath = path.join(userDataPath, 'ephemeral.json');

const ephemeralConfig = start('ephemeral', targetPath, {
  allowMalformedOnStartup: true,
});

module.exports = ephemeralConfig;
