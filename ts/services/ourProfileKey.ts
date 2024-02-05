// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assertDev } from '../util/assert';
import * as log from '../logging/log';

import type { StorageInterface } from '../types/Storage.d';

export class OurProfileKeyService {
  private getPromise: undefined | Promise<undefined | Uint8Array>;

  private promisesBlockingGet: Array<Promise<unknown>> = [];

  private storage?: StorageInterface;

  initialize(storage: StorageInterface): void {
    log.info('Our profile key service: initializing');

    const storageReadyPromise = new Promise<void>(resolve => {
      storage.onready(() => {
        resolve();
      });
    });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.promisesBlockingGet = [storageReadyPromise];

    this.storage = storage;
  }

  get(): Promise<undefined | Uint8Array> {
    if (this.getPromise) {
      log.info(
        'Our profile key service: was already fetching. Piggybacking off of that'
      );
    } else {
      log.info('Our profile key service: kicking off a new fetch');
      this.getPromise = this.doGet();
    }
    return this.getPromise;
  }

  async set(newValue: undefined | Uint8Array): Promise<void> {
    log.info('Our profile key service: updating profile key');
    assertDev(this.storage, 'OurProfileKeyService was not initialized');
    if (newValue) {
      await this.storage.put('profileKey', newValue);
    } else {
      await this.storage.remove('profileKey');
    }
  }

  blockGetWithPromise(promise: Promise<unknown>): void {
    this.promisesBlockingGet.push(promise);
  }

  private async doGet(): Promise<undefined | Uint8Array> {
    log.info(
      `Our profile key service: waiting for ${this.promisesBlockingGet.length} promises before fetching`
    );

    await Promise.allSettled(this.promisesBlockingGet);
    this.promisesBlockingGet = [];

    delete this.getPromise;

    assertDev(this.storage, 'OurProfileKeyService was not initialized');

    log.info('Our profile key service: fetching profile key from storage');
    const result = this.storage.get('profileKey');
    if (result === undefined || result instanceof Uint8Array) {
      return result;
    }

    assertDev(
      false,
      'Profile key in storage was defined, but not an Uint8Array. Returning undefined'
    );
    return undefined;
  }
}

export const ourProfileKeyService = new OurProfileKeyService();
