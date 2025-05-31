# 业务梗概

基于spring-ai的对接deepseek对话

目前带有历史对话默认是带有10次的记忆。

业务暂时规定每天可请求无记忆的ai50次。

有记忆的ai20次。

# 接口

## GET 流式聊天API

GET /ai/deepseek/stream/chat

使用Server-Sent Events (SSE) 实现实时流式响应

请求参数

| 名称    | 位置  | 类型   | 必选 | 说明     |
| ------- | ----- | ------ | ---- | -------- |
| message | query | string | 是   | 用户消息 |

> 返回示例

![image-20250531150947320](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505311509541.png)

## GET 流式聊天API（JSON格式）

GET /ai/deepseek/stream/chat-json

返回JSON格式的流式数据

请求参数

| 名称    | 位置  | 类型   | 必选 | 说明     |
| ------- | ----- | ------ | ---- | -------- |
| message | query | string | 是   | 用户消息 |

> 返回示例

![image-20250531151137716](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505311511778.png)

## GET streamChatMemory 有历史对话

GET /ai/deepseek/stream/chat-memory

请求参数

| 名称    | 位置  | 类型   | 必选 | 说明 |
| ------- | ----- | ------ | ---- | ---- |
| message | query | string | 是   | none |

> 返回示例

> 200 Response

![image-20250531151326092](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505311513139.png)

# 技术详解

采用了redis跟spring-ai的deepseek

```xml
<!-- Redis 依赖 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-starter-model-deepseek</artifactId>
        </dependency>
```

使用起来只需要配置apikey

```yml
spring:
  ai:
    deepseek:
      api-key: xx
```

首先先看流聊天的

```java
 /**
     * 流式聊天API
     * 使用Server-Sent Events (SSE) 实现实时流式响应
     *
     * @param message 用户消息
     * @return 流式响应
     */
    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestParam String message) {
        log.info("收到流式聊天请求：{}", message);

        return smartGeneratorService.streamChat(message)
                .filter(chunk -> chunk != null && !chunk.trim().isEmpty()) // 过滤空内容
                .doOnNext(chunk -> log.debug("原始数据块: '{}'", chunk))
                .map(chunk -> chunk.trim()) // 只清理空白字符
                .filter(chunk -> !chunk.isEmpty()) // 再次过滤空内容
                .concatWith(Flux.just("[DONE]"))
                .doOnSubscribe(subscription -> log.info("开始流式响应"))
                .doOnComplete(() -> log.info("流式响应完成"))
                .doOnError(error -> log.error("流式响应出错", error))
                .onErrorReturn("[ERROR] 流式响应出现错误");
    }

```

这里用到了[DONE]表示结束。

在看具体的service核心代码就是

设置聊天模型参数（如温度、最大长度等）

```java
DeepSeekChatOptions options = DeepSeekChatOptions.builder()
        .temperature(0.9)
        .maxTokens(800)
        .build();
```

调用底层大模型的 stream 方法

```java
return chatModel.stream(new Prompt(prompt.getInstructions(), options))
    .map(response -> response.getResult().getOutput().getText());
```

这个 `chatModel.stream(...)` 就是关键点 —— 它返回一个 **Flux<String>**，每个 `String` 是大模型逐步生成的一小段回复（chunk）。

那么带有记忆的是如何实现的呢？

```java
    //带有记忆的流式聊天
    @GetMapping(value = "/chat-memory", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChatMemory(@RequestParam String message) {
        Long userId = LoginHelper.getCurrentAppUserId();
        return smartGeneratorService.streamChatWithMemory(userId.toString(), message)
                .concatWith(Flux.just("[DONE]"));
    }
```

我们用户了一个唯一标识，就是用户的id

具体的service中。

**关键技术点**

| 功能           | 技术/方式                                     |
| -------------- | --------------------------------------------- |
| 上下文记忆存储 | 使用 Redis 列表（List）存储每个会话的聊天历史 |
| 会话标识       | 用 `sessionId` 区分不同用户/会话              |
| Prompt 拼接    | 把历史对话拼接成 prompt，一起发给大模型       |
| 数据清理       | 控制最多记忆 `MAX_HISTORY` 条，超出会自动裁剪 |
| 响应方式       | 流式 SSE（`Flux<String>`）                    |

### 1. 获取聊天历史

```java
ReactiveListOperations<String, String> listOps = redisOps.opsForList();
String redisKey = "chat:history:" + sessionId;
```

- 根据 `sessionId` 获取 Redis 中对应会话的历史记录。
- Redis 列表结构类似队列，适合按顺序存储聊天记录。

```java
listOps.range(redisKey, 0, MAX_HISTORY - 1)
```

- 获取最近的 N 条历史记录。

------

### 2. 拼接 Prompt

```java
StringBuilder sb = new StringBuilder();
sb.append("你是一位友好、有帮助的AI助手。\n");
...
for (String past : historyList) {
    sb.append("用户：").append(past).append("\n");
}
sb.append("用户：").append(message);
```

- 把之前的对话和当前消息拼接成一个 Prompt。
- 这样模型就能“看到”上下文。

> 注意：这里只拼接了“用户”的话，假设之前的 AI 回复没有存进去（也可以扩展成存 `用户-助手` 对儿）。

### 3. 聊天后更新历史

```java
responseFlux.concatWith(Mono.defer(() -> {
    return listOps.leftPush(redisKey, message)
        .flatMap(len -> listOps.trim(redisKey, 0, MAX_HISTORY - 1))
        .then(Mono.empty());
}));
```

- 在流式响应 **完成后**：
  - 将当前用户输入 `message` 存入 Redis 的头部。
  - 再通过 `trim()` 保留最近的 N 条，裁剪老数据。

redis的结构就是这样的。

![image-20250531152109944](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505311521009.png)

