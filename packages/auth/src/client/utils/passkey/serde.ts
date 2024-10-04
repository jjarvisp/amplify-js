// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	convertArrayBufferToBase64Url,
	convertBase64UrlToArrayBuffer,
} from '../../../foundation/convert';

import {
	PasskeyCreateOptions,
	PasskeyCreateOptionsJson,
	PasskeyCreateResult,
	PasskeyCreateResultJson,
	PasskeyGetOptions,
	PasskeyGetOptionsJson,
	PasskeyGetResult,
	PasskeyGetResultJson,
} from './types';

/**
 * Deserializes Public Key Credential Creation Options JSON
 * @param input PasskeyCreateOptionsJson
 * @returns PasskeyCreateOptions
 */
export const deserializeJsonToPkcCreationOptions = (
	input: PasskeyCreateOptionsJson,
): PasskeyCreateOptions => {
	const userIdBuffer = convertBase64UrlToArrayBuffer(input.user.id);
	const challengeBuffer = convertBase64UrlToArrayBuffer(input.challenge);
	const excludeCredentialsWithBuffer = (input.excludeCredentials || []).map(
		excludeCred => ({
			...excludeCred,
			id: convertBase64UrlToArrayBuffer(excludeCred.id),
		}),
	);

	return {
		...input,
		excludeCredentials: excludeCredentialsWithBuffer,
		challenge: challengeBuffer,
		user: {
			...input.user,
			id: userIdBuffer,
		},
	};
};

/**
 * Serializes a Public Key Credential With Attestation to JSON
 * @param input PasskeyCreateResult
 * @returns PasskeyCreateResultJson
 */
export const serializePkcWithAttestationToJson = (
	input: PasskeyCreateResult,
): PasskeyCreateResultJson => {
	return {
		type: input.type,
		id: input.id,
		rawId: convertArrayBufferToBase64Url(input.rawId),
		response: {
			clientDataJSON: convertArrayBufferToBase64Url(
				input.response.clientDataJSON,
			),
			attestationObject: convertArrayBufferToBase64Url(
				input.response.attestationObject,
			),
		},
	};
};

/**
 * Deserializes Public Key Credential Get Options JSON
 * @param input PasskeyGetOptionsJson
 * @returns PasskeyGetOptions
 */
export const deserializeJsonToPkcGetOptions = (
	input: PasskeyGetOptionsJson,
): PasskeyGetOptions => {
	const challengeBuffer = convertBase64UrlToArrayBuffer(input.challenge);
	const allowedCredentialsWithBuffer = (input.allowCredentials || []).map(
		allowedCred => ({
			...allowedCred,
			id: convertBase64UrlToArrayBuffer(allowedCred.id),
		}),
	);

	return {
		...input,
		challenge: challengeBuffer,
		allowCredentials: allowedCredentialsWithBuffer,
	};
};

/**
 * Serializes a Public Key Credential With Attestation to JSON
 * @param input PasskeyGetResult
 * @returns PasskeyGetResultJson
 */
export const serializePkcWithAssertionToJson = (
	input: PasskeyGetResult,
): PasskeyGetResultJson => {
	return {
		type: input.type,
		id: input.id,
		rawId: convertArrayBufferToBase64Url(input.rawId),
		response: {
			authenticatorData: convertArrayBufferToBase64Url(
				input.response.authenticatorData,
			),
			clientDataJSON: convertArrayBufferToBase64Url(
				input.response.clientDataJSON,
			),
			signature: convertArrayBufferToBase64Url(input.response.signature),
			userHandle: convertArrayBufferToBase64Url(input.response.userHandle),
		},
	};
};
