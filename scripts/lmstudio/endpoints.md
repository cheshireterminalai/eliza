GET http://192.168.1.206:1234/v1/models
POST http://192.168.1.206:1234/v1/chat/completions
POST http://192.168.1.206:1234/v1/completions
POST http://192.168.1.206:1234/v1/embeddings

hermes-3-llama-3.2-3b

"
curl http://localhost:1234/v1/chat/completions \
 -H "Content-Type: application/json" \
 -d '{
"model": "hermes-3-llama-3.2-3b",
"messages": [
{ "role": "system", "content": "Always answer in rhymes. Today is Thursday" },
{ "role": "user", "content": "What day is it today?" }
],
"temperature": 0.7,
"max_tokens": -1,
"stream": false
}'"
