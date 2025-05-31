# 业务梗概

校园论坛功能，用于校园的发帖。

# 数据库设计

```sql
#bbs帖子表
CREATE TABLE `u_post`
(
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
    `user_id`       BIGINT       NOT NULL COMMENT '作者用户ID',
    `title`         VARCHAR(255) NOT NULL COMMENT '帖子标题',
    `content`       TEXT         NOT NULL COMMENT '帖子内容',
    `like_count`    INT        DEFAULT 0 COMMENT '点赞数',
    `comment_count` INT        DEFAULT 0 COMMENT '评论数',
    `view_count`    INT        DEFAULT 0 COMMENT '浏览数',
    `status`        TINYINT    DEFAULT 1 COMMENT '状态（1:正常，0:禁用）',
    `is_deleted`    TINYINT(1) DEFAULT 0 COMMENT '是否已删除（0：未删除，1：已删除）',
    `create_time`   DATETIME   DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`   DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_is_deleted` (`is_deleted`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='帖子表';
ALTER TABLE `u_post`
    ADD COLUMN `image_urls` JSON DEFAULT NULL COMMENT '图片地址列表（JSON数组）';
-- 添加分类字段
ALTER TABLE `u_post`
    ADD COLUMN `category` VARCHAR(64) DEFAULT NULL COMMENT '帖子分类';

-- 为分类字段添加索引
CREATE INDEX `idx_category` ON `u_post` (`category`);



CREATE TABLE u_post_like
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    post_id     BIGINT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_post (user_id, post_id)
);



CREATE TABLE u_post_comment
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    post_id     BIGINT NOT NULL COMMENT '帖子ID',
    parent_id   BIGINT   DEFAULT 0 COMMENT '父评论ID（0表示一级评论）',
    user_id     BIGINT NOT NULL COMMENT '评论者用户ID',
    content     TEXT   NOT NULL COMMENT '评论内容',
    like_count  INT      DEFAULT 0 COMMENT '点赞数',
    is_deleted  TINYINT  DEFAULT 0 COMMENT '是否删除 0否 1是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);


CREATE TABLE u_post_comment_like
(
    id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id     BIGINT NOT NULL COMMENT '用户ID',
    comment_id  BIGINT NOT NULL COMMENT '评论ID',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY uk_user_comment (user_id, comment_id),
    KEY idx_comment_id (comment_id),
    KEY idx_user_id (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='帖子评论点赞表';


```

```sql
用户（user）
   │
   ├── 发布帖子 ────────▶ 帖子表（u_post）
   │                          │
   │                          ├── 点赞（u_post_like）
   │                          ├── 评论（u_post_comment）
   │                                  │
   │                                  └── 评论点赞（u_post_comment_like）
   │
   └── 点赞、评论、浏览行为...

```

> 用户发布帖子，记录在 `u_post` 表。
>
> 用户可以对帖子点赞，记录在 `u_post_like`，一个用户对同一帖子仅可点赞一次（唯一索引约束）。
>
> 用户可对帖子进行评论，评论记录在 `u_post_comment` 中，支持一级评论与子评论。
>
> 用户可点赞某条评论，记录在 `u_post_comment_like`。

表之间的外键关系

| 主表             | 关联表                   | 关系字段     | 类型             |
| ---------------- | ------------------------ | ------------ | ---------------- |
| `u_post`         | `u_post_like`            | `post_id`    | 一对多           |
| `u_post`         | `u_post_comment`         | `post_id`    | 一对多           |
| `u_post_comment` | `u_post_comment_like`    | `comment_id` | 一对多           |
| `u_post_comment` | `u_post_comment`（自身） | `parent_id`  | 自关联（评论树） |
| 所有表           | 用户表                   | `user_id`    | 多对一           |

# 接口

接口预览

![image-20250531130226922](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505311302074.png)

## POST 创建帖子

POST /user/post/create

> Body 请求参数

```json
{
  "title": "string",
  "content": "string",
  "imageUrls": [
    "string"
  ],
  "category": "string"
}
```

其中SECOND_HAND为英文字段

```java
SECOND_HAND("second_hand", "二手闲置"),
HELP("help", "打听求助"),
DATING("dating", "恋爱交友"),
CAMPUS("campus", "校园趣事"),
JOB("job", "兼职招聘"),
OTHER("other", "其他");
```

请求实例

```json
{
    "title": "测试帖子",
    "content": "这个是一个测试帖子",
    "category": "SECOND_HAND",
    "imageUrls": [
        "http://dummyimage.com/400x400",
        "http://dummyimage.com/400x400",
        "http://dummyimage.com/400x400",
        "http://dummyimage.com/400x400"
    ]
}
```

返回实例

```json
{
    "code": 200,
    "msg": "创建成功",
    "data": null
}
```

## POST 获取帖子详情

POST /user/post/get/{postId}

请求参数

| 名称   | 位置 | 类型    | 必选 | 说明 |
| ------ | ---- | ------- | ---- | ---- |
| postId | path | integer | 是   | none |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": "1928695867167469570",
        "userId": "1926882735163953154",
        "title": "测试帖子",
        "content": "这个是一个测试帖子",
        "likeCount": 0,
        "commentCount": 0,
        "viewCount": 1,
        "createTime": "2025-05-31 14:11:50",
        "updateTime": "2025-05-31 14:12:06",
        "imageUrls": [
            "http://dummyimage.com/400x400",
            "http://dummyimage.com/400x400",
            "http://dummyimage.com/400x400",
            "http://dummyimage.com/400x400"
        ],
        "category": "SECOND_HAND"
    }
}
```

## DELETE 删除帖子

DELETE /user/post/delete/{id}

请求参数

| 名称 | 位置 | 类型    | 必选 | 说明 |
| ---- | ---- | ------- | ---- | ---- |
| id   | path | integer | 是   | none |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "删除成功",
    "data": null
}
```

## PUT 编辑帖子

业务目前不允许编辑帖子。

## POST 分页查看帖子

POST /user/post/list

> Body 请求参数

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "fetchAll": false,
  "sortField": "string",
  "desc": true
}
```

其中fetchAll跟desc不是必须要传入的值

例如

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "sortField": "create_time"
}
```

返回值

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "pageNum": "1",
        "pageSize": "10",
        "total": "2",
        "list": [
            {
                "id": "1928696087024496642",
                "userId": "1926882735163953154",
                "title": "测试帖子2",
                "content": "这个是一个测试帖子2",
                "likeCount": 0,
                "commentCount": 0,
                "viewCount": 0,
                "createTime": "2025-05-31 14:12:36",
                "updateTime": "2025-05-31 14:12:36",
                "imageUrls": [
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400"
                ],
                "category": "SECOND_HAND"
            },
            {
                "id": "1928695867167469570",
                "userId": "1926882735163953154",
                "title": "测试帖子",
                "content": "这个是一个测试帖子",
                "likeCount": 0,
                "commentCount": 0,
                "viewCount": 1,
                "createTime": "2025-05-31 14:11:50",
                "updateTime": "2025-05-31 14:12:06",
                "imageUrls": [
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400"
                ],
                "category": "SECOND_HAND"
            }
        ],
        "pages": "1"
    }
}
```

## POST 分页查看指定分类帖子

POST /user/post/listByCategory

> Body 请求参数

```json
{
  "pageNum": 0,
  "pageSize": 0,
  "sortField": "string",
  "category": "string",
  "desc": true
}
```

例如：

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "sortField": "create_time",
  "category": "second_hand"
}
```



返回值

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "pageNum": "1",
        "pageSize": "10",
        "total": "3",
        "list": [
            {
                "id": "1928695867167469570",
                "userId": "1926882735163953154",
                "title": "测试帖子",
                "content": "这个是一个测试帖子",
                "likeCount": 0,
                "commentCount": 0,
                "viewCount": 1,
                "createTime": "2025-05-31 14:11:50",
                "updateTime": "2025-05-31 14:12:06",
                "imageUrls": [
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400"
                ],
                "category": "SECOND_HAND"
            },
            {
                "id": "1928696087024496642",
                "userId": "1926882735163953154",
                "title": "测试帖子2",
                "content": "这个是一个测试帖子2",
                "likeCount": 0,
                "commentCount": 0,
                "viewCount": 0,
                "createTime": "2025-05-31 14:12:36",
                "updateTime": "2025-05-31 14:12:36",
                "imageUrls": [
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400"
                ],
                "category": "SECOND_HAND"
            },
            {
                "id": "1928696114769817602",
                "userId": "1926882735163953154",
                "title": "测试帖子3",
                "content": "这个是一个测试帖子3",
                "likeCount": 0,
                "commentCount": 0,
                "viewCount": 0,
                "createTime": "2025-05-31 14:12:44",
                "updateTime": "2025-05-31 14:20:16",
                "imageUrls": [
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400",
                    "http://dummyimage.com/400x400"
                ],
                "category": "SECOND_HAND"
            }
        ],
        "pages": "1"
    }
}
```

## POST 帖子点赞 传入post_id

POST /user/post/like/{postId}

请求参数

| 名称   | 位置 | 类型    | 必选 | 说明 |
| ------ | ---- | ------- | ---- | ---- |
| postId | path | integer | 是   | none |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "点赞成功",
    "data": null
}
```

## GET 帖子搜索

GET /user/post/search

请求参数

| 名称    | 位置  | 类型   | 必选 | 说明 |
| ------- | ----- | ------ | ---- | ---- |
| keyword | query | string | 是   | none |

> 返回示例

> 200 Response

例子。传入参数为帖子3

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1928696114769817602",
            "userId": "1926882735163953154",
            "title": "测试帖子3",
            "content": "这个是一个测试帖子3",
            "likeCount": 1,
            "commentCount": 0,
            "viewCount": 0,
            "createTime": "2025-05-31 14:12:44",
            "updateTime": "2025-05-31 14:23:00",
            "imageUrls": [
                "http://dummyimage.com/400x400",
                "http://dummyimage.com/400x400",
                "http://dummyimage.com/400x400",
                "http://dummyimage.com/400x400"
            ],
            "category": "SECOND_HAND"
        }
    ]
}
```

## POST 刷新帖子后返回新增的帖子数量

POST /user/post/countNewPosts

> Body 请求参数

```json
{
  "lastRefreshTime": "string"
}
```

请求参数

| 名称 | 位置 | 类型                  | 必选 | 说明 |
| ---- | ---- | --------------------- | ---- | ---- |
| body | body | PostUpdateCountReqDto | 否   | none |

```json
{
    "lastRefreshTime": "2025-05-30 14:55:52"
}
```

返回

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": "3"
}
```

## POST 创建帖子评论

POST /user/post/common/create

> Body 请求参数

```json
{
  "postId": 0,
  "parentId": 0,
  "content": "string"
}
```

其中parentId（0表示一级评论）

```json
{
    "content": "这个是测试帖子3的评论",
    "parentId": 0,
    "postId": 1928696114769817602
}
```



## DELETE 删除帖子评论

DELETE /user/post/common/delete/{id}

请求参数

| 名称 | 位置 | 类型    | 必选 | 说明 |
| ---- | ---- | ------- | ---- | ---- |
| id   | path | integer | 是   | none |

## POST 分页查看帖子评论

POST /user/post/common/page

> Body 请求参数

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "fetchAll": false,
  "sortField": "string",
  "desc": true
}
```

其中fetchAll跟desc可不写

返回

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "pageNum": "1",
        "pageSize": "10",
        "total": "2",
        "list": [
            {
                "id": "1928700744354467841",
                "postId": "1928696114769817602",
                "parentId": "0",
                "userId": "1926882735163953154",
                "content": "这个是测试帖子3的评论2",
                "likeCount": 0,
                "isDeleted": 0,
                "createTime": "2025-05-31 14:31:05",
                "replies": []
            },
            {
                "id": "1928700611722186754",
                "postId": "1928696114769817602",
                "parentId": "0",
                "userId": "1926882735163953154",
                "content": "这个是测试帖子3的评论",
                "likeCount": 0,
                "isDeleted": 0,
                "createTime": "2025-05-31 14:30:33",
                "replies": []
            }
        ],
        "pages": "1"
    }
}
```

## POST 切换帖子评论的点赞状态

POST /user/post/common/like/{commentId}

请求参数

| 名称      | 位置 | 类型    | 必选 | 说明 |
| --------- | ---- | ------- | ---- | ---- |
| commentId | path | integer | 是   | none |



