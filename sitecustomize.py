import uuid
uuid._uuid_generate_random = None
import redis
original_init = redis.Redis.__init__

def compatible_init(self, *args, **kwargs):
    kwargs.pop('timeout', None)
    return original_init(self, *args, **kwargs)

def compatible_push(self, name, value, tail=False):
    if tail:
        return self.rpush(name, value)
    return self.lpush(name, value)

def compatible_pop(self, name):
    return self.lpop(name)

redis.Redis.__init__ = compatible_init
redis.Redis.push = compatible_push
redis.Redis.pop = compatible_pop
