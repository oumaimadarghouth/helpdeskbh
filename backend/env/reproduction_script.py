import os
import django
import sys

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bhhelpdesk.settings")
django.setup()

from api.models.user import User
from api.utils.password import create_set_password_token, get_token_obj

def run():
    print("Creating test user...")
    email = "test_repro_debug@example.com"
    # Ensure fresh start
    User.objects.filter(email=email).delete()
    
    user = User.objects.create(username=email, email=email)
    user.set_unusable_password()
    user.save()
    
    print(f"User: {user.email} (ID: {user.id})")

    print("- Generating token...")
    raw_token = create_set_password_token(user)
    print(f"Raw token: {raw_token}")

    print("- Verifying token...")
    ott = get_token_obj(raw_token)
    
    if ott:
        print(f"SUCCESS: Token found! ID: {ott.id}, Hash: {ott.token_hash}")
        if ott.is_expired():
            print("WARNING: Token is expired!")
        if ott.is_used():
            print("WARNING: Token is used!")
    else:
        print("FAILURE: Token NOT found.")

if __name__ == "__main__":
    run()
