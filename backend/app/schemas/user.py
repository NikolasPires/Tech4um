from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError

class UserBase(BaseModel):
    name: str
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise PydanticCustomError("password_length", "A senha deve conter pelo menos 8 caracteres.")
        if not any(char.isdigit() for char in v):
            raise PydanticCustomError("password_number", "A senha deve conter pelo menos um número.",)
        if not any(char.isupper() for char in v):
            raise PydanticCustomError("password_uppercase", "A senha deve conter pelo menos uma letra maiúscula.")
        if not any(char.islower() for char in v):
            raise PydanticCustomError("password_lowercase", "A senha deve conter pelo menos uma letra minúscula.")
        return v


class UserRead(UserBase):
    id: int

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str | None = None
