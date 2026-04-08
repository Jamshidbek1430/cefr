from django.urls import path
from .views import LibraryItemView

urlpatterns = [
    path('', LibraryItemView.as_view(), name='library-list'),
]
