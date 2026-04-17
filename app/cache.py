import diskcache
import os

_CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', '.cache')
_cache = diskcache.Cache(_CACHE_DIR)

def get(key):
    return _cache.get(key)

def set(key, value, ttl=7 * 24 * 3600):
    _cache.set(key, value, expire=ttl)

def clear():
    _cache.clear()
