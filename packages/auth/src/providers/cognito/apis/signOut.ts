// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	CognitoUserPoolConfig,
	ConsoleLogger,
	Hub,
	clearCredentials,
	defaultStorage,
} from '@aws-amplify/core';
import {
	AMPLIFY_SYMBOL,
	AuthAction,
	JWT,
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { getAuthUserAgentValue } from '../../../utils';
import { SignOutInput } from '../types';
import { tokenOrchestrator } from '../tokenProvider';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import {
	assertAuthTokens,
	assertAuthTokensWithRefreshToken,
} from '../utils/types';
import { handleOAuthSignOut } from '../utils/oauth';
import { DefaultOAuthStore } from '../utils/signInWithRedirectStore';
import { AuthError } from '../../../errors/AuthError';
import { OAUTH_SIGNOUT_EXCEPTION } from '../../../errors/constants';
import {
	createGlobalSignOutClient,
	createRevokeTokenClient,
} from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

const logger = new ConsoleLogger('Auth');

/**
 * Signs a user out
 *
 * @param input - The SignOutInput object
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function signOut(input?: SignOutInput): Promise<void> {
	const cognitoConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(cognitoConfig);

	if (input?.global) {
		await globalSignOut(cognitoConfig);
	} else {
		await clientSignOut(cognitoConfig);
	}

	let hasOAuthConfig;

	try {
		assertOAuthConfig(cognitoConfig);
		hasOAuthConfig = true;
	} catch (err) {
		hasOAuthConfig = false;
	}
	if (hasOAuthConfig) {
		const oAuthStore = new DefaultOAuthStore(defaultStorage);
		oAuthStore.setAuthConfig(cognitoConfig);
		const { type } =
			(await handleOAuthSignOut(
				cognitoConfig,
				oAuthStore,
				tokenOrchestrator,
				input?.oauth?.redirectUrl,
			)) ?? {};
		if (type === 'error') {
			throw new AuthError({
				name: OAUTH_SIGNOUT_EXCEPTION,
				message: `An error occurred when attempting to log out from OAuth provider.`,
			});
		}
	} else {
		// complete sign out
		tokenOrchestrator.clearTokens();
		await clearCredentials();
		Hub.dispatch('auth', { event: 'signedOut' }, 'Auth', AMPLIFY_SYMBOL);
	}
}

async function clientSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const { userPoolEndpoint, userPoolId, userPoolClientId } = cognitoConfig;
		const authTokens = await tokenOrchestrator.getTokenStore().loadTokens();
		assertAuthTokensWithRefreshToken(authTokens);
		if (isSessionRevocable(authTokens.accessToken)) {
			const revokeToken = createRevokeTokenClient({
				endpointResolver: createCognitoUserPoolEndpointResolver({
					endpointOverride: userPoolEndpoint,
				}),
			});

			await revokeToken(
				{
					region: getRegionFromUserPoolId(userPoolId),
					userAgentValue: getAuthUserAgentValue(AuthAction.SignOut),
				},
				{
					ClientId: userPoolClientId,
					Token: authTokens.refreshToken,
				},
			);
		}
	} catch (err) {
		// this shouldn't throw
		logger.debug(
			'Client signOut error caught but will proceed with token removal',
		);
	}
}

async function globalSignOut(cognitoConfig: CognitoUserPoolConfig) {
	try {
		const { userPoolEndpoint, userPoolId } = cognitoConfig;
		const authTokens = await tokenOrchestrator.getTokenStore().loadTokens();
		assertAuthTokens(authTokens);
		const globalSignOutClient = createGlobalSignOutClient({
			endpointResolver: createCognitoUserPoolEndpointResolver({
				endpointOverride: userPoolEndpoint,
			}),
		});
		await globalSignOutClient(
			{
				region: getRegionFromUserPoolId(userPoolId),
				userAgentValue: getAuthUserAgentValue(AuthAction.SignOut),
			},
			{
				AccessToken: authTokens.accessToken.toString(),
			},
		);
	} catch (err) {
		// it should not throw
		logger.debug(
			'Global signOut error caught but will proceed with token removal',
		);
	}
}

const isSessionRevocable = (token: JWT) => !!token?.payload?.origin_jti;
