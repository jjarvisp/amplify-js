// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { isBrowser } from '@aws-amplify/core/internals/utils';

/**
 * Determines if passkey is supported in current context
 * Will return false if executed in non-secure context
 * @returns boolean
 */
export function getIsPasskeySupported(): boolean {
	return isBrowser() && window.isSecureContext && 'credentials' in navigator;
}
