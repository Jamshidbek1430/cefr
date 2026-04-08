from django.urls import re_path

from .consumers import LiveChatConsumer


websocket_urlpatterns = [
    re_path(r"ws/live-chat/(?P<lesson_id>\d+)/$", LiveChatConsumer.as_asgi()),
]
