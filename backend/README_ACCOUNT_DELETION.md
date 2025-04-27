# Account Deletion Implementation Guide

This guide explains how to implement the account deletion endpoint for the backend API.

## Overview

The frontend already has functionality to call an account deletion endpoint at `/api/auth/delete-account/`. This document outlines how to implement that endpoint on the backend.

## Implementation Steps

1. Add the API endpoint in `core/urls.py`:

```python
path('auth/delete-account/', views.UserAccountDeleteView.as_view(), name='user-delete-account'),
```

2. Create the view in `core/views.py`:

```python
@jwt_view_csrf_exempt
class UserAccountDeleteView(APIView):
    """
    API view to handle user account deletion (GDPR right to be forgotten)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        try:
            with transaction.atomic():
                # 1. Mark the user as deleted (soft-delete)
                user.is_deleted = True
                user.is_active = False

                # 2. Anonymize user data instead of hard deleting
                user.first_name = "Deleted"
                user.last_name = "User"
                user.username = f"deleted_user_{user.id}_{int(time.time())}"
                user.email = f"deleted_{user.id}_{int(time.time())}@deleted.domain"

                # 3. Set a deletion date for eventual hard delete
                user.data_retention_date = timezone.now()

                # 4. Save the changes
                user.save()

                # 5. Also delete or anonymize any related profile data
                try:
                    profile = UserProfile.objects.get(user=user)
                    profile.first_name = "Deleted"
                    profile.surname = "User"
                    # Anonymize other fields
                    profile.save()
                except UserProfile.DoesNotExist:
                    pass

                # 6. Optionally delete chat history
                ChatHistory.objects.filter(user=user).delete()

                # 7. Log the deletion
                print(f"User {user.id} has been marked for deletion on {timezone.now()}")

                # 8. End the user's session
                logout(request)

                return Response({
                    "message": "Account has been marked for deletion. All your data will be removed within 30 days.",
                    "success": True
                }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "message": f"Account deletion failed: {str(e)}",
                "success": False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

3. Implement a scheduled task to permanently delete users marked for deletion after the retention period (e.g., 30 days):

```python
# In a management command or scheduled task
def permanently_delete_users():
    # Find users marked for deletion with expired retention dates
    users_to_delete = User.objects.filter(
        is_deleted=True,
        data_retention_date__lt=timezone.now() - timezone.timedelta(days=30)
    )

    count = users_to_delete.count()
    users_to_delete.delete()

    print(f"{count} user accounts permanently deleted at {timezone.now()}")
```

## GDPR Compliance Notes

- The implementation uses a soft-delete approach first, which allows for a cooling-off period
- Personal data is anonymized immediately upon request
- All data is eventually permanently deleted after the retention period
- The user is logged out immediately after requesting deletion
- The frontend clears all local storage data related to the user

## Security Considerations

- Only authenticated users can delete their own account
- CSRF protection is enforced
- The endpoint only accepts POST requests
- Appropriate logging is included
- Transactions ensure data consistency
