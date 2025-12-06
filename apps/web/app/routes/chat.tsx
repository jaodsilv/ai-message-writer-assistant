import { useState, useEffect } from 'react';
import type { Route } from './+types/chat';
import { getServices } from '../services/container';
import { ChatInterface } from '../components/ChatInterface';
import { Message } from '../agents/ModelInterface';
import { redirect } from 'react-router';
import yaml from 'js-yaml';

export async function loader({ request }: Route.LoaderArgs) {
  const { memoryManager, fileRepository, undoService, orchestrator } = getServices();
  const url = new URL(request.url);
  let conversationId = url.searchParams.get('id');
  const showArchived = url.searchParams.get('archived') === 'true';

  const conversations = await fileRepository.list('conversations', showArchived);

  if (!conversationId && conversations.length > 0) {
    return redirect(`/chat?id=${conversations[0]}`);
  }

  if (!conversationId) {
    conversationId = 'new-conversation';
  }

  const conversation = await memoryManager.getConversation(conversationId);
  const availableModels = await orchestrator.getAvailableModels();

  return {
    messages: conversation ? conversation.messages : [],
    conversationId,
    conversations,
    context: conversation?.metadata?.context || [],
    jobDescription: conversation?.metadata?.jobDescription || '',
    availablePeople: ['Recruiter', 'Hiring Manager'],
    showArchived,
    canUndo: undoService.canUndo,
    availableModels
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const conversationId = formData.get('conversationId') as string;
  const { orchestrator, memoryManager, fileRepository, undoService, messageParser } = getServices();

  let conversation = await memoryManager.getConversation(conversationId);
  if (!conversation) {
    conversation = {
      id: conversationId,
      title: conversationId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: { context: [], jobDescription: '' }
    };
  }

  if (intent === 'sendMessage') {
    const content = formData.get('content') as string;
    if (!content) return { error: 'Missing content' };

    const userMessage: Message = { role: 'user', content };
    conversation.messages.push(userMessage);
    await memoryManager.saveConversation(conversation);
    return { success: true };
  }

  if (intent === 'updateMetadata') {
    const context = JSON.parse(formData.get('context') as string || '[]');
    const jobDescription = formData.get('jobDescription') as string;

    conversation.metadata = { ...conversation.metadata, context, jobDescription };
    await memoryManager.saveConversation(conversation);
    return { success: true };
  }

  if (intent === 'generateResponse') {
    const writerType = formData.get('writerType') as string;
    const writerName = formData.get('writerName') as string;
    const model = formData.get('model') as string;

    if (writerType === 'ai') {
      const agentContext = {
        context: conversation.metadata?.context,
        jobDescription: conversation.metadata?.jobDescription
      };

      const agentId = 'claude';
      const responseContent = await orchestrator.routeMessage(agentId, conversation.messages, agentContext, model);

      const assistantMessage: Message = { role: 'assistant', content: responseContent };
      conversation.messages.push(assistantMessage);
    } else {
      const placeholder = `[Draft for ${writerName}]`;
      const message: Message = { role: 'user', content: placeholder };
      conversation.messages.push(message);
    }

    conversation.updatedAt = new Date().toISOString();
    await memoryManager.saveConversation(conversation);
    return { success: true };
  }

  if (intent === 'newConversation') {
    const newId = `conversation-${Date.now()}`;
    return redirect(`/chat?id=${newId}`);
  }

  if (intent === 'loadConversation') {
    const fileContent = formData.get('fileContent') as string;
    const fileName = formData.get('fileName') as string;

    try {
      const data = yaml.load(fileContent) as any;
      if (!data || !data.conversation_history) {
        return { error: 'Invalid YAML format' };
      }

      const newId = fileName.replace(/\.[^/.]+$/, "") + '-' + Date.now();

      const messages: Message[] = data.conversation_history.map((item: any) => {
        let role: 'user' | 'assistant' | 'system' = 'user';
        if (item.from === 'me') {
          role = 'user';
        } else {
          role = 'assistant';
        }
        return {
          role,
          content: item.body || ''
        };
      });

      const newConversation = {
        id: newId,
        title: data.subject || newId,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          context: data.context || [],
          jobDescription: '',
          platform: data.platform,
          process_status: data.process_status
        }
      };

      await memoryManager.saveConversation(newConversation);
      return redirect(`/chat?id=${newId}`);

    } catch (e) {
      console.error('Failed to parse YAML', e);
      return { error: 'Failed to parse YAML' };
    }
  }

  if (intent === 'archive') {
    await fileRepository.archive('conversations', conversationId);
    undoService.push({ type: 'archive', collection: 'conversations', id: conversationId });
    return redirect('/chat');
  }

  if (intent === 'restore') {
    await fileRepository.restore('conversations', conversationId);
    undoService.push({ type: 'restore', collection: 'conversations', id: conversationId });
    return redirect(`/chat?id=${conversationId}`);
  }

  if (intent === 'delete') {
    await fileRepository.delete('conversations', conversationId);
    undoService.push({ type: 'delete', collection: 'conversations', id: conversationId });
    return redirect('/chat');
  }

  if (intent === 'undo') {
    const action = undoService.pop();
    if (action) {
      if (action.type === 'delete') {
        await fileRepository.restore(action.collection, action.id);
      } else if (action.type === 'archive') {
        await fileRepository.restore(action.collection, action.id);
      } else if (action.type === 'restore') {
        await fileRepository.archive(action.collection, action.id);
      }
    }
    return redirect('/chat');
  }

  if (intent === 'parseMessage') {
    const text = formData.get('text') as string;
    const parsed = messageParser.parse(text);

    const newId = `parsed-${Date.now()}`;
    const messages: Message[] = [
      { role: 'user', content: `Parsed from ${parsed.platform}:\n\n${text}` }
    ];

    const newConversation = {
      id: newId,
      title: parsed.subject || `Parsed ${parsed.platform} message`,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        context: [],
        jobDescription: '',
        platform: parsed.platform,
        recruiterName: parsed.recruiterName,
        company: parsed.company,
        email: parsed.email
      }
    };

    await memoryManager.saveConversation(newConversation);
    return redirect(`/chat?id=${newId}`);
  }

  return { error: 'Unknown intent' };
}

export default function ChatRoute({ loaderData }: Route.ComponentProps) {
  const { messages: initialMessages, conversationId, conversations, context, jobDescription, availablePeople, showArchived } = loaderData;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    const newMessages = [...messages, { role: 'user', content } as Message];
    setMessages(newMessages);

    try {
      const formData = new FormData();
      formData.append('intent', 'sendMessage');
      formData.append('content', content);
      formData.append('conversationId', conversationId);

      await fetch('/chat', { method: 'POST', body: formData });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMetadata = async (newContext: string[], newJobDesc: string) => {
    try {
      const formData = new FormData();
      formData.append('intent', 'updateMetadata');
      formData.append('conversationId', conversationId);
      formData.append('context', JSON.stringify(newContext));
      formData.append('jobDescription', newJobDesc);

      await fetch('/chat', { method: 'POST', body: formData });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const generateResponse = async (writerType: 'ai' | 'person', writerName: string, model?: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('intent', 'generateResponse');
      formData.append('conversationId', conversationId);
      formData.append('writerType', writerType);
      formData.append('writerName', writerName);
      if (model) formData.append('model', model);

      await fetch('/chat', { method: 'POST', body: formData });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    const formData = new FormData();
    formData.append('intent', 'newConversation');
    const res = await fetch('/chat', { method: 'POST', body: formData });
    if (res.redirected) {
      window.location.href = res.url;
    }
  };

  const handleLoadConversation = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const formData = new FormData();
      formData.append('intent', 'loadConversation');
      formData.append('fileContent', content);
      formData.append('fileName', file.name);

      const res = await fetch('/chat', { method: 'POST', body: formData });
      if (res.redirected) {
        window.location.href = res.url;
      }
    };
    reader.readAsText(file);
  };

  const handleArchive = async () => {
    const formData = new FormData();
    formData.append('intent', 'archive');
    formData.append('conversationId', conversationId);
    await fetch('/chat', { method: 'POST', body: formData });
    window.location.href = '/chat';
  };

  const handleRestore = async () => {
    const formData = new FormData();
    formData.append('intent', 'restore');
    formData.append('conversationId', conversationId);
    await fetch('/chat', { method: 'POST', body: formData });
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('conversationId', conversationId);
    await fetch('/chat', { method: 'POST', body: formData });
    window.location.href = '/chat';
  };

  const handleUndo = async () => {
    const formData = new FormData();
    formData.append('intent', 'undo');
    await fetch('/chat', { method: 'POST', body: formData });
    window.location.reload();
  };

  const handleParseMessage = async (text: string) => {
    const formData = new FormData();
    formData.append('intent', 'parseMessage');
    formData.append('text', text);
    const res = await fetch('/chat', { method: 'POST', body: formData });
    if (res.redirected) {
      window.location.href = res.url;
    }
  };

  return (
    <ChatInterface
      messages={messages}
      conversations={conversations}
      currentConversationId={conversationId}
      context={context}
      jobDescription={jobDescription}
      availablePeople={availablePeople}
      onSendMessage={sendMessage}
      onSelectConversation={(id) => window.location.href = `/chat?id=${id}`}
      onNewConversation={handleNewConversation}
      onLoadConversation={handleLoadConversation}
      onUpdateMetadata={updateMetadata}
      onGenerateResponse={generateResponse}
      isLoading={isLoading}
      onArchive={handleArchive}
      onRestore={handleRestore}
      onDelete={handleDelete}
      onUndo={handleUndo}
      onParseMessage={handleParseMessage}
      showArchived={showArchived}
      onToggleArchived={() => {
        const url = new URL(window.location.href);
        url.searchParams.set('archived', (!showArchived).toString());
        window.location.href = url.toString();
      }}
      canUndo={loaderData.canUndo}
      availableModels={loaderData.availableModels}
    />
  );
}
