import { gql } from '@apollo/client';

// Get user's chats (with RLS - only user's own chats)
export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: {created_at: desc}) {
      id
      title
      created_at
    }
  }
`;

// Create a new chat for the authenticated user
export const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: {
      title: $title
    }) {
      id
      title
      created_at
    }
  }
`;

export const GET_MESSAGES_FOR_CHAT = gql`
  subscription GetMessages($chat_id: uuid!) {
    messages(where: {chat_id: {_eq: $chat_id}}, order_by: {created_at: asc}) {
      id
      content
      role
      created_at
    }
  }
`;

export const INSERT_USER_MESSAGE = gql`
  mutation InsertUserMessage($chat_id: uuid!, $content: String!) {
    insert_messages_one(object: {chat_id: $chat_id, content: $content, role: "user"}) {
      id
      content
      role
      created_at
    }
  }
`;

export const SEND_MESSAGE_TO_BOT = gql`
  mutation SendMessageToBot($chat_id: uuid!, $message: String!) {
    sendMessage(arg1: {chat_id: $chat_id, message: $message}) {
      id
      content
    }
  }
`;