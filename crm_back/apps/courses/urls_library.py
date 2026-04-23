from django.urls import path
from .views import LibraryItemView, LibraryItemDetailView

urlpatterns = [
    path('', LibraryItemView.as_view(), name='library-list'),
    path('<int:pk>/', LibraryItemDetailView.as_view(), name='library-detail'),
]
