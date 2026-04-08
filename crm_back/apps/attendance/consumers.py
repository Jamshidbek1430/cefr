import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import LiveMessage


class LiveChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.lesson_id = self.scope["url_route"]["kwargs"]["lesson_id"]
        self.room_group_name = f"live_{self.lesson_id}"
        self.user = self.scope.get("user", AnonymousUser())

        if not self.user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        last_messages = await self.get_last_messages()
        await self.send(text_data=json.dumps({
            "type": "history",
            "messages": last_messages,
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        payload = json.loads(text_data or "{}")
        message_type = payload.get("type", "text")
        # Support both 'content' and 'message' (per user request)
        content = (payload.get("content") or payload.get("message") or "").strip()

        if message_type not in {"text", "image"} or not content:
            return

        is_pinned = self.user.role in {"teacher", "admin"}
        message = await self.save_message(message_type, content, is_pinned)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message", # matches method name
                "message": message,
            },
        )

    async def chat_message(self, event):
        # Already sends 'type': 'message' to frontend which LivePage expects
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
        }))

    @database_sync_to_async
    def get_last_messages(self):
        messages = LiveMessage.objects.filter(
            lesson_id=self.lesson_id
        ).select_related("sender").order_by("-sent_at")[:50]
        return [self.serialize_message(message) for message in reversed(list(messages))]

    @database_sync_to_async
    def save_message(self, message_type, content, is_pinned):
        message = LiveMessage.objects.create(
            lesson_id=self.lesson_id,
            sender=self.user,
            message_type=message_type,
            content=content,
            is_pinned=is_pinned,
        )
        return self.serialize_message(message)

    def serialize_message(self, message):
        sender_username = (message.sender.telegram_username or message.sender.username or "").lstrip("@")
        sender_role = (message.sender.role or "").upper()
        return {
            "id": message.id,
            "type": message.message_type,
            "content": message.content,
            "sender_name": message.sender.full_name,
            "sender_username": sender_username,
            "sender_role": sender_role,
            "is_teacher": message.sender.role in {"teacher", "admin"},
            "is_pinned": message.is_pinned,
            "sent_at": message.sent_at.isoformat(),
        }
