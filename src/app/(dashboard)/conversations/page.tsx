'use client';

import Link from 'next/link';
import { MessageSquarePlus, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ConversationsPage() {
  // TODO: Fetch conversations from API when implemented
  const conversations: unknown[] = [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground mt-1">
            Your message drafts and conversation history
          </p>
        </div>
        <Button asChild>
          <Link href="/compose">
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New Message
          </Link>
        </Button>
      </div>

      {/* Conversations List or Empty State */}
      {conversations.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No conversations yet</CardTitle>
            <CardDescription>
              Start by composing a new message. Your drafts and conversation
              history will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <Button asChild>
              <Link href="/compose">
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Compose your first message
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Conversation items will be rendered here */}
        </div>
      )}
    </div>
  );
}
