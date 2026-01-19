# @yambal/n8n-nodes-miniflux

n8n community node for [Miniflux](https://miniflux.app/) RSS reader.

[Miniflux](https://miniflux.app/) is a minimalist and opinionated feed reader.

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `@yambal/n8n-nodes-miniflux` and agree to the risks
4. Select **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install @yambal/n8n-nodes-miniflux
```

## Prerequisites

- Miniflux instance running
- API Token (Settings > API Keys > Create a new API key)

## Credentials

| Field | Description | Default |
|-------|-------------|---------|
| Base URL | Miniflux API URL | `http://localhost:8080` |
| API Token | X-Auth-Token for authentication | (required) |

## Operations

### Feeds
- **Get Feeds** - List all subscribed feeds
- **Create Feed** - Subscribe to a new feed
- **Refresh Feed** - Fetch new entries for a specific feed
- **Refresh All Feeds** - Fetch new entries for all feeds
- **Delete Feed** - Unsubscribe from a feed

### Entries
- **Get Entries** - List entries with filters (status, feed, category, limit)
- **Get Entry** - Get a specific entry by ID
- **Update Entry Status** - Mark entry as read/unread
- **Toggle Bookmark** - Add/remove entry from bookmarks

### Categories
- **Get Categories** - List all categories
- **Create Category** - Create a new category

### OPML
- **Export OPML** - Export all feeds as OPML
- **Import OPML** - Import feeds from OPML

## Example Usage

### Get Unread Entries
1. Add Miniflux node
2. Select "Get Entries" operation
3. Set Status to "unread"
4. Set Limit as needed

### Mark Entry as Read
1. Add Miniflux node
2. Select "Update Entry Status" operation
3. Set Entry ID
4. Set Status to "read"

## Links

- [Miniflux Official Site](https://miniflux.app/)
- [Miniflux API Documentation](https://miniflux.app/docs/api.html)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
