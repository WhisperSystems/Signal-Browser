// Copyright 2024 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import type { ProfileKeyCredentialRequestContext } from '@signalapp/libsignal-client/zkgroup';
import {
  AuthCredentialWithPni,
  ClientZkAuthOperations,
  ClientZkGroupCipher,
  ClientZkProfileOperations,
  GroupMasterKey,
  GroupSecretParams,
  ProfileKey,
  ProfileKeyCiphertext,
  ExpiringProfileKeyCredential,
  ProfileKeyCredentialPresentation,
  ExpiringProfileKeyCredentialResponse,
  ServerPublicParams,
  UuidCiphertext,
  NotarySignature,
} from '@signalapp/libsignal-client/zkgroup';
import { Aci, Pni, type ServiceId } from '@signalapp/libsignal-client';
import type { ServiceIdString, AciString, PniString } from '../types/ServiceId';
import {
  fromServiceIdObject,
  fromAciObject,
  fromPniObject,
} from '../types/ServiceId';
import { toServiceIdObject } from './ServiceId';
import { strictAssert } from './assert';

export * from '@signalapp/libsignal-client/zkgroup';

// Scenarios

export function decryptGroupBlob(
  clientZkGroupCipher: ClientZkGroupCipher,
  ciphertext: Uint8Array
): Uint8Array {
  return clientZkGroupCipher.decryptBlob(Buffer.from(ciphertext));
}

export function decodeProfileKeyCredentialPresentation(
  presentationBuffer: Uint8Array
): { profileKey: Uint8Array; userId: Uint8Array } {
  const presentation = new ProfileKeyCredentialPresentation(
    Buffer.from(presentationBuffer)
  );

  const userId = presentation.getUuidCiphertext().serialize();
  const profileKey = presentation.getProfileKeyCiphertext().serialize();

  return {
    profileKey,
    userId,
  };
}

export function decryptProfileKey(
  clientZkGroupCipher: ClientZkGroupCipher,
  profileKeyCiphertextBuffer: Uint8Array,
  serviceId: ServiceIdString
): Uint8Array {
  const profileKeyCiphertext = new ProfileKeyCiphertext(
    Buffer.from(profileKeyCiphertextBuffer)
  );

  const profileKey = clientZkGroupCipher.decryptProfileKey(
    profileKeyCiphertext,
    toServiceIdObject(serviceId)
  );

  return profileKey.serialize();
}

function decryptServiceIdObj(
  clientZkGroupCipher: ClientZkGroupCipher,
  uuidCiphertextBuffer: Uint8Array
): ServiceId {
  const uuidCiphertext = new UuidCiphertext(Buffer.from(uuidCiphertextBuffer));

  return clientZkGroupCipher.decryptServiceId(uuidCiphertext);
}

export function decryptServiceId(
  clientZkGroupCipher: ClientZkGroupCipher,
  uuidCiphertextBuffer: Uint8Array
): ServiceIdString {
  return fromServiceIdObject(
    decryptServiceIdObj(clientZkGroupCipher, uuidCiphertextBuffer)
  );
}

export function decryptAci(
  clientZkGroupCipher: ClientZkGroupCipher,
  uuidCiphertextBuffer: Uint8Array
): AciString {
  const obj = decryptServiceIdObj(clientZkGroupCipher, uuidCiphertextBuffer);
  strictAssert(obj instanceof Aci, 'userId is not ACI');
  return fromAciObject(obj);
}

export function decryptPni(
  clientZkGroupCipher: ClientZkGroupCipher,
  uuidCiphertextBuffer: Uint8Array
): PniString {
  const obj = decryptServiceIdObj(clientZkGroupCipher, uuidCiphertextBuffer);
  strictAssert(obj instanceof Pni, 'userId is not PNI');
  return fromPniObject(obj);
}

export function deriveProfileKeyVersion(
  profileKeyBase64: string,
  serviceId: ServiceIdString
): string {
  const profileKeyArray = Buffer.from(profileKeyBase64, 'base64');
  const profileKey = new ProfileKey(profileKeyArray);

  const profileKeyVersion = profileKey.getProfileKeyVersion(
    toServiceIdObject(serviceId)
  );

  return profileKeyVersion.toString();
}

export function deriveGroupPublicParams(
  groupSecretParamsBuffer: Uint8Array
): Uint8Array {
  const groupSecretParams = new GroupSecretParams(
    Buffer.from(groupSecretParamsBuffer)
  );

  return groupSecretParams.getPublicParams().serialize();
}

export function deriveGroupID(groupSecretParamsBuffer: Uint8Array): Uint8Array {
  const groupSecretParams = new GroupSecretParams(
    Buffer.from(groupSecretParamsBuffer)
  );

  return groupSecretParams.getPublicParams().getGroupIdentifier().serialize();
}

export function deriveGroupSecretParams(
  masterKeyBuffer: Uint8Array
): Uint8Array {
  const masterKey = new GroupMasterKey(Buffer.from(masterKeyBuffer));
  const groupSecretParams = GroupSecretParams.deriveFromMasterKey(masterKey);

  return groupSecretParams.serialize();
}

export function encryptGroupBlob(
  clientZkGroupCipher: ClientZkGroupCipher,
  plaintext: Uint8Array
): Uint8Array {
  return clientZkGroupCipher.encryptBlob(Buffer.from(plaintext));
}

export function encryptServiceId(
  clientZkGroupCipher: ClientZkGroupCipher,
  serviceIdPlaintext: ServiceIdString
): Uint8Array {
  const uuidCiphertext = clientZkGroupCipher.encryptServiceId(
    toServiceIdObject(serviceIdPlaintext)
  );

  return uuidCiphertext.serialize();
}

export function generateProfileKeyCredentialRequest(
  clientZkProfileCipher: ClientZkProfileOperations,
  serviceId: ServiceIdString,
  profileKeyBase64: string
): { context: ProfileKeyCredentialRequestContext; requestHex: string } {
  const profileKeyArray = Buffer.from(profileKeyBase64, 'base64');
  const profileKey = new ProfileKey(profileKeyArray);

  const context =
    clientZkProfileCipher.createProfileKeyCredentialRequestContext(
      toServiceIdObject(serviceId),
      profileKey
    );
  const request = context.getRequest();
  const requestArray = request.serialize();

  return {
    context,
    requestHex: requestArray.toString('hex'),
  };
}

export function getAuthCredentialPresentation(
  clientZkAuthOperations: ClientZkAuthOperations,
  authCredentialBase64: string,
  groupSecretParamsBase64: string
): Uint8Array {
  const authCredential = new AuthCredentialWithPni(
    Buffer.from(authCredentialBase64, 'base64')
  );
  const secretParams = new GroupSecretParams(
    Buffer.from(groupSecretParamsBase64, 'base64')
  );

  const presentation =
    clientZkAuthOperations.createAuthCredentialWithPniPresentation(
      secretParams,
      authCredential
    );
  return presentation.serialize();
}

export function createProfileKeyCredentialPresentation(
  clientZkProfileCipher: ClientZkProfileOperations,
  profileKeyCredentialBase64: string,
  groupSecretParamsBase64: string
): Uint8Array {
  const profileKeyCredentialArray = Buffer.from(
    profileKeyCredentialBase64,
    'base64'
  );
  const profileKeyCredential = new ExpiringProfileKeyCredential(
    profileKeyCredentialArray
  );
  const secretParams = new GroupSecretParams(
    Buffer.from(groupSecretParamsBase64, 'base64')
  );

  const presentation =
    clientZkProfileCipher.createExpiringProfileKeyCredentialPresentation(
      secretParams,
      profileKeyCredential
    );

  return presentation.serialize();
}

export function getClientZkAuthOperations(
  serverPublicParamsBase64: string
): ClientZkAuthOperations {
  const serverPublicParams = new ServerPublicParams(
    Buffer.from(serverPublicParamsBase64, 'base64')
  );

  return new ClientZkAuthOperations(serverPublicParams);
}

export function getClientZkGroupCipher(
  groupSecretParamsBase64: string
): ClientZkGroupCipher {
  const serverPublicParams = new GroupSecretParams(
    Buffer.from(groupSecretParamsBase64, 'base64')
  );

  return new ClientZkGroupCipher(serverPublicParams);
}

export function getClientZkProfileOperations(
  serverPublicParamsBase64: string
): ClientZkProfileOperations {
  const serverPublicParams = new ServerPublicParams(
    Buffer.from(serverPublicParamsBase64, 'base64')
  );

  return new ClientZkProfileOperations(serverPublicParams);
}

export function handleProfileKeyCredential(
  clientZkProfileCipher: ClientZkProfileOperations,
  context: ProfileKeyCredentialRequestContext,
  responseBase64: string
): { credential: string; expiration: number } {
  const response = new ExpiringProfileKeyCredentialResponse(
    Buffer.from(responseBase64, 'base64')
  );
  const profileKeyCredential =
    clientZkProfileCipher.receiveExpiringProfileKeyCredential(
      context,
      response
    );

  const credentialArray = profileKeyCredential.serialize();

  return {
    credential: credentialArray.toString('base64'),
    expiration: profileKeyCredential.getExpirationTime().getTime(),
  };
}

export function deriveProfileKeyCommitment(
  profileKeyBase64: string,
  serviceId: ServiceIdString
): string {
  const profileKeyArray = Buffer.from(profileKeyBase64, 'base64');
  const profileKey = new ProfileKey(profileKeyArray);

  return profileKey
    .getCommitment(toServiceIdObject(serviceId))
    .contents.toString('base64');
}

export function verifyNotarySignature(
  serverPublicParamsBase64: string,
  message: Uint8Array,
  signature: Uint8Array
): void {
  const serverPublicParams = new ServerPublicParams(
    Buffer.from(serverPublicParamsBase64, 'base64')
  );

  const notarySignature = new NotarySignature(Buffer.from(signature));

  serverPublicParams.verifySignature(Buffer.from(message), notarySignature);
}
