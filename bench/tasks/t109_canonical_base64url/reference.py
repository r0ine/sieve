import base64


def solve(text: str) -> bytes | None:
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    if any(char not in alphabet for char in text) or len(text) % 4 == 1:
        return None
    decoded = base64.urlsafe_b64decode(text + '=' * (-len(text) % 4))
    if base64.urlsafe_b64encode(decoded).rstrip(b'=').decode('ascii') != text:
        return None
    return decoded
