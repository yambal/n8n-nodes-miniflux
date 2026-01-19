import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MinifluxApi implements ICredentialType {
	name = 'minifluxApi';
	displayName = 'Miniflux API';
	documentationUrl = 'https://miniflux.app/docs/api.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://localhost:8080',
			description: 'MinifluxのベースURL',
		},
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Miniflux API Token（Settings → API Keys → Create a new API key で取得）',
		},
	];
}
