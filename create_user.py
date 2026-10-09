"""Create the password-backed Airflow user needed for session authentication."""

import secrets

from airflow import models
from airflow import settings
from airflow.contrib.auth.backends.password_auth import PasswordUser
from flask_bcrypt import generate_password_hash


def create_user() -> None:
    """Create the protected user without storing a login credential."""
    session = settings.Session()
    if session.query(models.User).filter_by(username="vulhub").first():
        session.close()
        return
    user = PasswordUser(models.User())
    user.username = "vulhub"
    user.email = "vulhub@example.com"
    user._password = generate_password_hash(secrets.token_urlsafe(32), 12).decode("utf-8")
    user.superuser = True
    session.add(user)
    session.commit()
    session.close()


if __name__ == "__main__":
    create_user()
