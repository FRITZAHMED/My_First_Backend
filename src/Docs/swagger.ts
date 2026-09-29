import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../Config/env.js';

const options = {
	definition: {
		openapi: '3.0.3',
		info: {
			title: 'RHopenLabs API',
			version: '1.0.0',
			description:
				'Rhopen By Ahmed',
		},
		servers: [{ url: `http://localhost:${env.PORT}`, description: 'Developpement' }],
		tags: [
			{ name: 'Auth'},
			{ name: 'Users'},
			{ name: 'Equipment'},
			{ name: 'Breakdowns'},
			{ name: 'Requests'},
			{ name: 'LogisticService'},
			{ name: 'Submissions'},
			{ name: 'License'},
			{ name: 'Health'},
		],
		components: {
			securitySchemes: {
				bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
			},
			schemas: {
				Error: {
					type: 'object',
					properties: {
						success: { type: 'boolean', example: false },
						code: { type: 'string', example: 'VALIDATION_ERROR' },
						message: { type: 'string', example: 'Erreur de validation des donnees' },
						details: { type: 'array', items: { type: 'object' } },
					},
				},
				Tokens: {
					type: 'object',
					properties: {
						accessToken: { type: 'string' },
						refreshToken: { type: 'string' },
						tokenType: { type: 'string', example: 'Bearer' },
						expiresIn: { type: 'string', example: '15m' },
					},
				},
				User: {
					type: 'object',
					properties: {
						idUser: { type: 'integer' },
						professionalEmail: { type: 'string', format: 'email' },
						role: {
							type: 'string',
							enum: ['Administrator', 'Director', 'Manager', 'Logistician', 'Employer'],
						},
						isActive: { type: 'boolean' },
						createdAt: { type: 'string', format: 'date-time' },
					},
				},
				Equipment: {
					type: 'object',
					properties: {
						idEquipment: { type: 'integer' },
						description: { type: 'string' },
						serialNumber: { type: 'string' },
						status: {
							type: 'string',
							enum: ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'],
						},
						idUser: { type: 'integer', nullable: true },
					},
				},
				Breakdown: {
					type: 'object',
					properties: {
						idBreakdown: { type: 'integer' },
						label: { type: 'string' },
						description: { type: 'string' },
						severity: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
						status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
						idEquipment: { type: 'integer', nullable: true },
						resolvedAt: { type: 'string', format: 'date-time', nullable: true },
					},
				},
				Request: {
					type: 'object',
					properties: {
						idRequest: { type: 'integer' },
						description: { type: 'string' },
						creationDate: { type: 'string', format: 'date-time' },
					},
				},
				Assignment: {
					type: 'object',
					properties: {
						idLogisticService: { type: 'integer' },
						idRequest: { type: 'integer' },
						idLogistician: { type: 'integer' },
					},
				},
				Submission: {
					type: 'object',
					properties: {
						idUser: { type: 'integer' },
						idRequest: { type: 'integer' },
					},
				},
				License: {
					type: 'object',
					properties: {
						idLicense : { type: 'integer' },
						licenseNumber: { type: 'integer' },
						status: {
							type: 'string',
							enum: ['ACTIVE', 'EXPIRED', 'SUSPENDED'],
						},
					},
				},
			},
		},
		security: [{ bearerAuth: [] }],
	},
	apis: ['./src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options) as Record<string, unknown>;

export default swaggerSpec;
  