import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../Config/env.js';
import { UnauthorizedError } from './AppError.js';

export interface AccessTokenPayload {
	sub: number;
	email: string;
	role: string;
	tokenType: 'access';
}

export interface RefreshTokenPayload {
	sub: number;
	tokenType: 'refresh';
	jti: string;
}

function sign(payload: object, secret: string, expiresIn: string): string {
	return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

export function signAccessToken(input: { id: number; email: string; role: string }): string {
	const payload: Omit<AccessTokenPayload, 'sub'> & { sub: number } = {
		sub: input.id,
		email: input.email,
		role: input.role,
		tokenType: 'access',
	};
	return sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
}

export function signRefreshToken(input: { id: number; jti: string }): string {
	const payload: RefreshTokenPayload = { sub: input.id, tokenType: 'refresh', jti: input.jti };
	return sign(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
}

function verify<T>(token: string, secret: string): T {
	try {
		return jwt.verify(token, secret) as T;
	} catch {
		throw new UnauthorizedError('Jeton invalide ou expire');
	}
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	const payload = verify<AccessTokenPayload>(token, env.JWT_ACCESS_SECRET);

	if (payload.tokenType !== 'access') {
		throw new UnauthorizedError('Type de jeton invalide');
	}

	return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
	const payload = verify<RefreshTokenPayload>(token, env.JWT_REFRESH_SECRET);

	if (payload.tokenType !== 'refresh') {
		throw new UnauthorizedError('Type de jeton invalide');
	}

	return payload;
}
