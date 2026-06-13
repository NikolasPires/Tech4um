async def get_user_by_token(
    token: str,
    db: AsyncSession
):
    payload = decode_token(token)

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(status_code=401)

    user = await UserRepository(db).get_by_id(user_id)

    if not user:
        raise HTTPException(status_code=401)

    return user