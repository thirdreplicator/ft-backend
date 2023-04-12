-- /redis/lua/conditional_update.lua
local key = KEYS[1]
local new_timestamp = tonumber(ARGV[1])
local new_value = ARGV[2]

local current_timestamp = tonumber(redis.call('HGET', key, 'timestamp'))

if current_timestamp == nil or new_timestamp > current_timestamp then
    redis.call('HMSET', key, 'value', new_value, 'timestamp', new_timestamp)
    return 1 -- Successfully updated
else
    return redis.call('HGET', key, 'value') -- Not updated, return the current value
end