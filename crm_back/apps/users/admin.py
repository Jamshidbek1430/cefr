from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User
from .forms import CustomUserCreationForm, CustomUserChangeForm


class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    list_display = ('telegram_username', 'username', 'full_name', 'role', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role')

    fieldsets = (
        (None, {'fields': ('telegram_username', 'username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Additional', {'fields': ('role',)}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('telegram_username', 'full_name', 'username', 'password1', 'password2'),
        }),
    )

    readonly_fields = ('last_login', 'created_at', 'updated_at')

    search_fields = ('telegram_username', 'username', 'full_name', 'email')
    ordering = ('telegram_username',)
    filter_horizontal = ('groups', 'user_permissions')


admin.site.register(User, UserAdmin)
