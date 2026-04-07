from django.urls import path
from .views import (
    AdminUserUpdateView, 
    AdminChangeUserPasswordAPIView, AdminCreateUserAPIView,
    AdminCheckUserAPIView, AdminsListView,
    UsersExportAPIView, UsersTemplateAPIView, UsersImportAPIView,
    AdminUserListView,
)

urlpatterns = [
    path("", AdminUserListView.as_view(), name="user-list"),
    path("admins/", AdminsListView.as_view(), name="admin-list"),
    path("add/", AdminCreateUserAPIView.as_view(), name="admin-create-user"),
    path("check/", AdminCheckUserAPIView.as_view(), name="admin-check-user"),
    path("export/", UsersExportAPIView.as_view(), name="users-export"),
    path("export/template/", UsersTemplateAPIView.as_view(), name="users-export-template"),
    path("import/", UsersImportAPIView.as_view(), name="users-import"),
    path("<int:pk>/", AdminUserUpdateView.as_view(), name="user-detail"),
    path("<int:user_id>/change-password/", AdminChangeUserPasswordAPIView.as_view(), name="admin-change-user-password"),
]
