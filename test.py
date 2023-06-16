import uuid

def generate_user_id():
    user_id = uuid.uuid4().int
    return user_id

user_id = generate_user_id()
print(user_id)
