import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';


export class Miniflux implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Miniflux',
		name: 'miniflux',
		icon: 'file:miniflux.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with Miniflux RSS reader',
		defaults: {
			name: 'Miniflux',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'minifluxApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: '操作',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					// フィード関連
					{
						name: 'フィード一覧取得',
						value: 'getFeeds',
						description: '登録済みフィード一覧を取得',
						action: 'Get all feeds',
					},
					{
						name: 'フィード追加',
						value: 'createFeed',
						description: '新しいフィードを購読',
						action: 'Create a feed',
					},
					{
						name: 'フィード更新',
						value: 'refreshFeed',
						description: '指定フィードを即座に更新',
						action: 'Refresh a feed',
					},
					{
						name: '全フィード更新',
						value: 'refreshAllFeeds',
						description: '全フィードを即座に更新',
						action: 'Refresh all feeds',
					},
					{
						name: 'フィード削除',
						value: 'deleteFeed',
						description: 'フィードを削除',
						action: 'Delete a feed',
					},
					// エントリ関連
					{
						name: 'エントリ一覧取得',
						value: 'getEntries',
						description: 'フィルタ付きエントリ一覧を取得',
						action: 'Get entries',
					},
					{
						name: 'エントリ詳細取得',
						value: 'getEntry',
						description: '特定エントリの詳細を取得',
						action: 'Get an entry',
					},
					{
						name: '既読/未読マーク',
						value: 'updateEntryStatus',
						description: 'エントリのステータスを変更',
						action: 'Update entry status',
					},
					{
						name: 'ブックマーク切替',
						value: 'toggleBookmark',
						description: 'エントリのブックマーク状態を切り替え',
						action: 'Toggle bookmark',
					},
					// カテゴリ関連
					{
						name: 'カテゴリ一覧取得',
						value: 'getCategories',
						description: 'カテゴリ一覧を取得',
						action: 'Get all categories',
					},
					{
						name: 'カテゴリ作成',
						value: 'createCategory',
						description: '新しいカテゴリを作成',
						action: 'Create a category',
					},
					// OPML
					{
						name: 'OPMLエクスポート',
						value: 'exportOpml',
						description: '全フィードをOPML形式でエクスポート',
						action: 'Export OPML',
					},
					{
						name: 'OPMLインポート',
						value: 'importOpml',
						description: 'OPMLファイルからフィードをインポート',
						action: 'Import OPML',
					},
				],
				default: 'getEntries',
			},
			// フィード追加用パラメータ
			{
				displayName: 'フィードURL',
				name: 'feedUrl',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['createFeed'],
					},
				},
				description: '購読するフィードのURL',
			},
			{
				displayName: 'カテゴリID',
				name: 'categoryId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['createFeed'],
					},
				},
				description: 'フィードを追加するカテゴリのID（0で未分類）',
			},
			// フィード操作用パラメータ
			{
				displayName: 'フィードID',
				name: 'feedId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: ['refreshFeed', 'deleteFeed'],
					},
				},
				description: '操作対象のフィードID',
			},
			// エントリ一覧取得用パラメータ
			{
				displayName: 'ステータス',
				name: 'status',
				type: 'options',
				options: [
					{ name: '全て', value: '' },
					{ name: '未読', value: 'unread' },
					{ name: '既読', value: 'read' },
					{ name: '削除済み', value: 'removed' },
				],
				default: 'unread',
				displayOptions: {
					show: {
						operation: ['getEntries'],
					},
				},
				description: 'エントリのステータスでフィルタ',
			},
			{
				displayName: 'フィードIDフィルタ',
				name: 'filterFeedId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['getEntries'],
					},
				},
				description: '特定フィードのエントリのみ取得（0で全フィード）',
			},
			{
				displayName: 'カテゴリIDフィルタ',
				name: 'filterCategoryId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						operation: ['getEntries'],
					},
				},
				description: '特定カテゴリのエントリのみ取得（0で全カテゴリ）',
			},
			{
				displayName: '取得件数',
				name: 'limit',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						operation: ['getEntries'],
					},
				},
				description: '取得するエントリ数',
			},
			{
				displayName: 'ソート順',
				name: 'order',
				type: 'options',
				options: [
					{ name: '公開日', value: 'published_at' },
					{ name: '作成日', value: 'created_at' },
					{ name: 'カテゴリタイトル', value: 'category_title' },
					{ name: 'カテゴリID', value: 'category_id' },
					{ name: 'ステータス', value: 'status' },
				],
				default: 'published_at',
				displayOptions: {
					show: {
						operation: ['getEntries'],
					},
				},
				description: 'ソートするフィールド',
			},
			{
				displayName: 'ソート方向',
				name: 'direction',
				type: 'options',
				options: [
					{ name: '降順（新しい順）', value: 'desc' },
					{ name: '昇順（古い順）', value: 'asc' },
				],
				default: 'desc',
				displayOptions: {
					show: {
						operation: ['getEntries'],
					},
				},
				description: 'ソートの方向',
			},
			// エントリ詳細取得用パラメータ
			{
				displayName: 'エントリID',
				name: 'entryId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: ['getEntry', 'updateEntryStatus', 'toggleBookmark'],
					},
				},
				description: '操作対象のエントリID',
			},
			// ステータス更新用パラメータ
			{
				displayName: '新しいステータス',
				name: 'newStatus',
				type: 'options',
				options: [
					{ name: '既読', value: 'read' },
					{ name: '未読', value: 'unread' },
				],
				default: 'read',
				displayOptions: {
					show: {
						operation: ['updateEntryStatus'],
					},
				},
				description: '設定するステータス',
			},
			// カテゴリ作成用パラメータ
			{
				displayName: 'カテゴリ名',
				name: 'categoryTitle',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['createCategory'],
					},
				},
				description: '作成するカテゴリの名前',
			},
			// OPMLインポート用パラメータ
			{
				displayName: 'OPMLデータ',
				name: 'opmlData',
				type: 'string',
				default: '',
				required: true,
				typeOptions: {
					rows: 10,
				},
				displayOptions: {
					show: {
						operation: ['importOpml'],
					},
				},
				description: 'インポートするOPML XML データ',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('minifluxApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const apiToken = credentials.apiToken as string;

		const headers = {
			'X-Auth-Token': apiToken,
			'Content-Type': 'application/json',
		};

		for (let i = 0; i < items.length; i++) {
			try {
				let response: Response;
				let data: unknown;

				switch (operation) {
					case 'getFeeds': {
						response = await fetch(`${baseUrl}/v1/feeds`, {
							method: 'GET',
							headers,
						});
						data = await response.json();
						returnData.push({
							json: { feeds: data } as IDataObject,
						});
						break;
					}

					case 'createFeed': {
						const feedUrl = this.getNodeParameter('feedUrl', i) as string;
						const categoryId = this.getNodeParameter('categoryId', i) as number;

						const body: { feed_url: string; category_id?: number } = {
							feed_url: feedUrl,
						};
						if (categoryId > 0) {
							body.category_id = categoryId;
						}

						response = await fetch(`${baseUrl}/v1/feeds`, {
							method: 'POST',
							headers,
							body: JSON.stringify(body),
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `フィード追加に失敗: ${errorText}`);
						}

						data = await response.json();
						returnData.push({
							json: { success: true, feed: data } as IDataObject,
						});
						break;
					}

					case 'refreshFeed': {
						const feedId = this.getNodeParameter('feedId', i) as number;

						response = await fetch(`${baseUrl}/v1/feeds/${feedId}/refresh`, {
							method: 'PUT',
							headers,
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `フィード更新に失敗: ${errorText}`);
						}

						returnData.push({
							json: { success: true, feedId, refreshed: true },
						});
						break;
					}

					case 'refreshAllFeeds': {
						response = await fetch(`${baseUrl}/v1/feeds/refresh`, {
							method: 'PUT',
							headers,
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `全フィード更新に失敗: ${errorText}`);
						}

						returnData.push({
							json: { success: true, refreshedAll: true },
						});
						break;
					}

					case 'deleteFeed': {
						const feedId = this.getNodeParameter('feedId', i) as number;

						response = await fetch(`${baseUrl}/v1/feeds/${feedId}`, {
							method: 'DELETE',
							headers,
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `フィード削除に失敗: ${errorText}`);
						}

						returnData.push({
							json: { success: true, feedId, deleted: true },
						});
						break;
					}

					case 'getEntries': {
						const status = this.getNodeParameter('status', i) as string;
						const filterFeedId = this.getNodeParameter('filterFeedId', i) as number;
						const filterCategoryId = this.getNodeParameter('filterCategoryId', i) as number;
						const limit = this.getNodeParameter('limit', i) as number;
						const order = this.getNodeParameter('order', i) as string;
						const direction = this.getNodeParameter('direction', i) as string;

						const params = new URLSearchParams();
						if (status) params.append('status', status);
						if (filterFeedId > 0) params.append('feed_id', filterFeedId.toString());
						if (filterCategoryId > 0) params.append('category_id', filterCategoryId.toString());
						params.append('limit', limit.toString());
						params.append('order', order);
						params.append('direction', direction);

						response = await fetch(`${baseUrl}/v1/entries?${params.toString()}`, {
							method: 'GET',
							headers,
						});

						data = await response.json();
						returnData.push({
							json: data as IDataObject,
						});
						break;
					}

					case 'getEntry': {
						const entryId = this.getNodeParameter('entryId', i) as number;

						response = await fetch(`${baseUrl}/v1/entries/${entryId}`, {
							method: 'GET',
							headers,
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `エントリ取得に失敗: ${errorText}`);
						}

						data = await response.json();
						returnData.push({
							json: { entry: data } as IDataObject,
						});
						break;
					}

					case 'updateEntryStatus': {
						const entryId = this.getNodeParameter('entryId', i) as number;
						const newStatus = this.getNodeParameter('newStatus', i) as string;

						// Miniflux API: PUT /v1/entries with entry_ids array
						response = await fetch(`${baseUrl}/v1/entries`, {
							method: 'PUT',
							headers,
							body: JSON.stringify({
								entry_ids: [entryId],
								status: newStatus,
							}),
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `ステータス更新に失敗: ${errorText}`);
						}

						returnData.push({
							json: { success: true, entryId, status: newStatus },
						});
						break;
					}

					case 'toggleBookmark': {
						const entryId = this.getNodeParameter('entryId', i) as number;

						response = await fetch(`${baseUrl}/v1/entries/${entryId}/bookmark`, {
							method: 'PUT',
							headers,
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `ブックマーク切替に失敗: ${errorText}`);
						}

						returnData.push({
							json: { success: true, entryId, bookmarkToggled: true },
						});
						break;
					}

					case 'getCategories': {
						response = await fetch(`${baseUrl}/v1/categories`, {
							method: 'GET',
							headers,
						});

						data = await response.json();
						returnData.push({
							json: { categories: data } as IDataObject,
						});
						break;
					}

					case 'createCategory': {
						const categoryTitle = this.getNodeParameter('categoryTitle', i) as string;

						response = await fetch(`${baseUrl}/v1/categories`, {
							method: 'POST',
							headers,
							body: JSON.stringify({ title: categoryTitle }),
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `カテゴリ作成に失敗: ${errorText}`);
						}

						data = await response.json();
						returnData.push({
							json: { success: true, category: data } as IDataObject,
						});
						break;
					}

					case 'exportOpml': {
						response = await fetch(`${baseUrl}/v1/export`, {
							method: 'GET',
							headers: {
								'X-Auth-Token': apiToken,
							},
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `OPMLエクスポートに失敗: ${errorText}`);
						}

						const opmlData = await response.text();
						returnData.push({
							json: { success: true, opml: opmlData },
						});
						break;
					}

					case 'importOpml': {
						const opmlData = this.getNodeParameter('opmlData', i) as string;

						response = await fetch(`${baseUrl}/v1/import`, {
							method: 'POST',
							headers: {
								'X-Auth-Token': apiToken,
								'Content-Type': 'application/xml',
							},
							body: opmlData,
						});

						if (!response.ok) {
							const errorText = await response.text();
							throw new NodeOperationError(this.getNode(), `OPMLインポートに失敗: ${errorText}`);
						}

						const importResult = await response.json();
						returnData.push({
							json: { success: true, result: importResult } as IDataObject,
						});
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
