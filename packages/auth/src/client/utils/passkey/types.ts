// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type PasskeyTransport = 'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb';
type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';

interface PublicKeyCredentialDescriptor<T> {
	type: 'public-key';
	id: T;
	transports?: PasskeyTransport[];
}

export interface PasskeyCreateOptionsJson {
	challenge: string;
	rp: {
		id: string;
		name: string;
	};
	user: {
		id: string;
		name: string;
		displayName: string;
	};
	pubKeyCredParams: {
		alg: number;
		type: 'public-key';
	}[];
	timeout: number;
	excludeCredentials: PublicKeyCredentialDescriptor<string>[];
	authenticatorSelection: {
		requireResidentKey: boolean;
		residentKey: UserVerificationRequirement;
		userVerification: UserVerificationRequirement;
	};
}

export interface PasskeyCreateOptions {
	challenge: ArrayBuffer;
	rp: {
		id: string;
		name: string;
	};
	user: {
		id: ArrayBuffer;
		name: string;
		displayName: string;
	};
	pubKeyCredParams: {
		alg: number;
		type: 'public-key';
	}[];
	timeout: number;
	excludeCredentials: PublicKeyCredentialDescriptor<ArrayBuffer>[];
	authenticatorSelection: {
		requireResidentKey: boolean;
		residentKey: UserVerificationRequirement;
		userVerification: UserVerificationRequirement;
	};
}

export interface PublicKeyCredentialAttestationResponse<T> {
	clientDataJSON: T;
	attestationObject: T;
}
export interface PasskeyCreateResult {
	id: string;
	rawId: ArrayBuffer;
	type: 'public-key';
	response: PublicKeyCredentialAttestationResponse<ArrayBuffer>;
}

export interface PasskeyCreateResultJson {
	id: string;
	rawId: string;
	type: 'public-key';
	response: PublicKeyCredentialAttestationResponse<string>;
}

export interface PasskeyGetOptionsJson {
	challenge: string;
	rpId: string;
	timeout: number;
	allowCredentials: PublicKeyCredentialDescriptor<string>[];
	userVerification: UserVerificationRequirement;
}

export interface PasskeyGetOptions {
	challenge: ArrayBuffer;
	rpId: string;
	timeout: number;
	allowCredentials: PublicKeyCredentialDescriptor<ArrayBuffer>[];
	userVerification: UserVerificationRequirement;
}

export interface PublicKeyCredentialAssertionResponse<T> {
	authenticatorData: T;
	clientDataJSON: T;
	signature: T;
	userHandle: T;
}

export interface PasskeyGetResult {
	id: string;
	rawId: ArrayBuffer;
	type: 'public-key';
	response: PublicKeyCredentialAssertionResponse<ArrayBuffer>;
}
export interface PasskeyGetResultJson {
	id: string;
	rawId: string;
	type: 'public-key';
	response: PublicKeyCredentialAssertionResponse<string>;
}
