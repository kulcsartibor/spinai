# Bitbucket Code Review Agent
An AI-powered code review bot that automatically reviews pull requests using GPT-4 and provides detailed, line-by-line feedback.

## Features

- 🤖 Automatic PR reviews when opened or updated
- 📝 Line-by-line code feedback
- 🔍 Focuses on:
  - Code quality and best practices
  - Potential bugs and issues
  - Performance considerations
  - Security concerns
- 🎨 Customizable bot name and appearance
- 📊 Review tracking with SpinAI
- 🛠️ Manual PR review API for on-demand reviews

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables file and configure it:
```bash
cp .env.example .env
```

3. Fill in your `.env` file:
```env
# OpenAI API Key for the code review
OPENAI_API_KEY=your_openai_api_key_here

# Bitbucket Access Token with repository:write scope
BITBUCKET_ACCESS_TOKEN=your_bitbucket_access_token_here

# Port for the webhook server (optional)
PORT=3000
```

### Getting the Required Credentials

1. **Bitbucket Access Token**:
   - Go to Bitbucket Settings → Access tokens
   - Create a new token with `repository:write` scope
   - This token will be used to authenticate the bot

2. **OpenAI API Key**:
   - Get your API key from [OpenAI's platform](https://platform.openai.com/api-keys)
   - Make sure you have access to GPT-4

3. **SpinAI API Key**:
   - Get your API key from SpinAI's dashboard

## Setting Up Bitbucket Webhook

1. Go to your repository's Settings → Webhooks → Add webhook
2. Configure the webhook:
   - URL: Your server URL + `/webhook` (e.g., `https://your-domain.com/webhook`)
   - Triggers: Select "Pull Request: Created" and "Pull Request: Updated"
   - Skip SSL verification for testing (enable for production)

For local testing:
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, create a tunnel
ngrok http 3000
```

Use the ngrok URL as your webhook URL in Bitbucket settings.

## Usage

### Automatic Reviews
1. Start the server:
```bash
npm run dev
```

2. The bot will automatically:
   - Review new PRs when they're opened
   - Review PRs when new changes are pushed
   - Add line-specific comments with suggestions
   - Add a summary comment on the PR

### Manual PR Review API
You can trigger a manual code review for any PR using the `/review-pr` endpoint.

#### Request
```bash
POST /review-pr
Content-Type: application/json

{
  "workspace": "your-workspace",
  "repo_slug": "your-repo",
  "pull_request_id": 123
}
```

#### Example using cURL
```bash
curl -X POST http://localhost:3000/review-pr \
  -H "Content-Type: application/json" \
  -d '{
    "workspace": "your-workspace",
    "repo_slug": "your-repo", 
    "pull_request_id": 123
  }'
```

#### Response
```json
{
  "message": "Manual review completed successfully",
  "response": "Review completed",
  "totalCostCents": 12,
  "totalDurationMs": 4500,
  "sessionId": "abc123",
  "interactionId": "def456"
}
```

#### Error Responses
- **400 Bad Request**: Missing required parameters
- **404 Not Found**: PR or repository not found
- **500 Internal Server Error**: Review processing failed

#### Tips
1. You can use this API to:
   - Re-review a PR after changes
   - Review older PRs
   - Integrate with CI/CD pipelines
2. The API uses the same review logic as automatic reviews
3. You can track review costs and durations in the response

## Customization

1. **Review Focus**: Edit the prompt in `src/actions/reviewCode.ts`
2. **Comment Style**: Modify the comment formatting in `src/actions/postReviewComments.ts`

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build the project
npm run build

# Run linting
npm run lint

# Type checking
npm run check-types
```
