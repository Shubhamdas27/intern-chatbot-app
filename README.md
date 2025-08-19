# AI Chatbot Application

A full-stack React TypeScript chatbot application with Nhost authentication, Hasura GraphQL backend, and n8n workflow integration.

## Features

✅ **Email Authentication** - Sign up/Sign in with Nhost Auth
✅ **GraphQL Only** - All backend communication via GraphQL
✅ **Real-time Chat** - Live message updates with subscriptions
✅ **Secure Permissions** - Row-Level Security (RLS) for user data
✅ **AI Chatbot** - OpenRouter integration via n8n workflows
✅ **Responsive UI** - Modern dark theme with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Apollo Client** for GraphQL
- **Lucide React** for icons

### Backend
- **Nhost** for authentication and backend
- **Hasura** for GraphQL API and permissions
- **PostgreSQL** for database
- **n8n** for workflow automation
- **OpenRouter** for AI responses

## Environment Variables

Create a `.env.local` file:

```bash
VITE_NHOST_BACKEND_URL=your_nhost_backend_url_here
```

## Database Schema

### Tables

1. **chats**
   - id (uuid, primary key)
   - user_id (uuid, foreign key to auth.users)
   - title (text)
   - created_at (timestamp)

2. **messages**
   - id (uuid, primary key)
   - chat_id (uuid, foreign key to chats)
   - content (text)
   - role (text: 'user' | 'assistant')
   - created_at (timestamp)

### Permissions

Both tables have Row-Level Security (RLS) enabled:
- Users can only access their own chats
- Users can only access messages from their own chats
- Only authenticated users can perform CRUD operations

## Hasura Actions

### sendMessage Action

```graphql
type Mutation {
  sendMessage(chat_id: uuid!, message: String!): SendMessageOutput
}

type SendMessageOutput {
  success: Boolean!
  message: String
}
```

**Webhook URL**: Your n8n webhook endpoint
**Headers**: Include authentication headers
**Permissions**: Only authenticated users

## n8n Workflow

1. **Webhook Trigger** - Receives calls from Hasura Action
2. **Validation** - Verifies user owns the chat_id
3. **OpenRouter API** - Calls AI model for response
4. **Save Response** - Inserts bot message via Hasura GraphQL
5. **Return Success** - Confirms completion to frontend

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Netlify Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Netlify

3. Configure environment variables in Netlify dashboard

4. Set up custom domain (optional)

### Environment Variables for Production

Set in Netlify dashboard:
- `VITE_NHOST_BACKEND_URL` - Your production Nhost URL

## GraphQL Operations

### Queries
- `GET_CHATS` - Fetch user's chat list
- `GET_MESSAGES_FOR_CHAT` - Subscribe to chat messages

### Mutations
- `CREATE_CHAT` - Create new chat
- `INSERT_USER_MESSAGE` - Save user message
- `SEND_MESSAGE_TO_BOT` - Trigger AI response (Hasura Action)

## Security Features

✅ **Authentication Required** - All features behind auth wall
✅ **Row-Level Security** - Database-level user isolation
✅ **GraphQL Permissions** - Role-based access control
✅ **Secure API Calls** - External calls only via n8n
✅ **Input Validation** - Form validation and sanitization

## Architecture

```
Frontend (React/TS) 
    ↓ GraphQL
Nhost/Hasura
    ↓ Webhook (Action)
n8n Workflow
    ↓ HTTP Request
OpenRouter API
    ↓ GraphQL Mutation
Back to Database
```

## Demo

1. **Sign Up** - Create account with email/password
2. **Create Chat** - Click "New Chat" to start
3. **Send Message** - Type and send your message
4. **AI Response** - Bot responds via n8n → OpenRouter
5. **Real-time Updates** - Messages appear instantly

## Assignment Submission Format

```
Name: [Your Name]
Contact: [Your Phone]
Deployed: [Your Netlify URL]
```
