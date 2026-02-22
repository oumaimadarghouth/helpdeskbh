from api.views.chatbot import ChatAPIView
from api.views.me import MeView
from api.views.password_reset import AdminListPasswordResetRequests, AdminResendSetPasswordLink, CreatePasswordResetRequest
from api.views.profile import MyProfileView
from api.views.tickets import TicketFromDraft
from django.urls import path
from api.views.auth import LoginView
from api.views.admin_users import AdminUsersView, AdminUserToggleActiveView, AdminUserDetailView
from api.views.password import SetPassword, VerifySetPasswordToken, ChangePassword
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/users/", AdminUsersView.as_view()),
    path("admin/users/<int:user_id>/", AdminUserDetailView.as_view()),
    path("admin/users/<int:user_id>/active/", AdminUserToggleActiveView.as_view()),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/set-password/", SetPassword.as_view(), name="set-password"),
    path("auth/verify-set-password/", VerifySetPasswordToken.as_view()),
    path("chat/", ChatAPIView.as_view()),
    path("tickets/from-draft/", TicketFromDraft.as_view()),
    path("me/", MeView.as_view()),
    path("me/profile/", MyProfileView.as_view()),
        path(
        "auth/password-reset/",
        CreatePasswordResetRequest.as_view()
    ),

    path(
        "auth/admin/password-reset/",
        AdminListPasswordResetRequests.as_view()
    ),

    path(
        "auth/admin/password-reset/resend/",
        AdminResendSetPasswordLink.as_view()
    ),

    path("auth/change-password/", ChangePassword.as_view(), name="change-password"),

]
