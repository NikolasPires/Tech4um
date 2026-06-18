import pytest
from pydantic import ValidationError
from app.schemas.user import UserCreate

def test_password_complexity():
    # Senha válida
    user_data = {
        "name": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123"
    }
    user = UserCreate(**user_data)
    assert user.password == "Password123"

    # Senha curta demais
    user_data["password"] = "Pa1"
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(**user_data)
    assert "8 characters" in str(excinfo.value) or "min_length" in str(excinfo.value)

    # Senha sem número
    user_data["password"] = "Password"
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(**user_data)
    assert "at least one number" in str(excinfo.value)

    # Senha sem letra maiúscula
    user_data["password"] = "password123"
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(**user_data)
    assert "at least one uppercase letter" in str(excinfo.value)

    # Senha sem letra minúscula
    user_data["password"] = "PASSWORD123"
    with pytest.raises(ValidationError) as excinfo:
        UserCreate(**user_data)
    assert "at least one lowercase letter" in str(excinfo.value)
