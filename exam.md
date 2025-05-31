## 业务梗概

该接口包含了刷题考试。

目前只添加了刷题。

添加题目的具体流程为：

- 首先添加题库分类
- 之后添加题库
- 之后添加问题
- 之后添加选项

根据一级分类获得子分类。

默认情况下不允许子分类再有children了。

题库有字段isExercise代表是否可以让学生进行查看练习。

根据分类ID查询题库为全部题库，前端需要根据isExercise决定是否显示。



## 数据库设计

```sql
#题库分类
DROP TABLE IF EXISTS `u_question_category`;
CREATE TABLE `u_question_category`
(
    `id`          bigint                          NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name`        varchar(50) COLLATE utf8mb4_bin NOT NULL COMMENT '分类名称',
    `parent_id`   int(11)                                  DEFAULT '0' COMMENT '父分类ID，0表示一级分类',
    `create_time` datetime                                 DEFAULT NULL COMMENT '创建时间',
    `is_deleted`  int(11)                         NOT NULL DEFAULT '0' COMMENT '逻辑删除：0代表未删除，1代表删除',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 7
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_bin
  ROW_FORMAT = DYNAMIC;


DROP TABLE IF EXISTS `u_exam_repo`;
CREATE TABLE `u_exam_repo`
(
    `id`          bigint                           NOT NULL AUTO_INCREMENT COMMENT 'id   题库表',
    `user_id`     bigint                           NOT NULL COMMENT '创建人id',
    `title`       varchar(255) COLLATE utf8mb4_bin NOT NULL COMMENT '题库标题',
    `category_id` bigint                                    DEFAULT NULL COMMENT '分类ID',
    `create_time` datetime                         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `is_deleted`  int(11)                          NOT NULL DEFAULT '0' COMMENT '逻辑删除：0代表未删除，1代表删除',
    `is_exercise` int(11)                          NOT NULL DEFAULT '0' comment '是否可以练习 默认为false',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  AUTO_INCREMENT = 100
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_bin
  ROW_FORMAT = DYNAMIC;


CREATE TABLE `u_question` (
                              `id` BIGINT NOT NULL COMMENT '试题ID',
                              `repo_id` BIGINT NOT NULL COMMENT '所属题库ID',
                              `category_id` BIGINT NOT NULL COMMENT '分类ID',
                              `type` TINYINT NOT NULL COMMENT '题目类型：1单选 2多选 3判断 4简答',
                              `content` TEXT NOT NULL COMMENT '题目内容',
                              `correct_answer` VARCHAR(1000) NOT NULL COMMENT '正确答案（选择题为A,B,C,D）',
                              `difficulty` TINYINT DEFAULT 1 COMMENT '难度：1简单 2中等 3困难',
                              `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                              `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1删除',
                              PRIMARY KEY (`id`)
) COMMENT='试题表';

CREATE TABLE `u_question_option` (
                                     `id` BIGINT NOT NULL COMMENT '选项ID',
                                     `question_id` BIGINT NOT NULL COMMENT '所属试题ID',
                                     `option_key` CHAR(1) NOT NULL COMMENT '选项标识（如A/B/C/D）',
                                     `content` TEXT NOT NULL COMMENT '选项内容',
                                     `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
                                     `is_deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0未删除 1删除',
                                     PRIMARY KEY (`id`)
) COMMENT='试题选项表';

ALTER TABLE `u_question_option`
    ADD COLUMN `image` VARCHAR(500) DEFAULT NULL COMMENT '选项配图地址',
    ADD COLUMN `sort` INT DEFAULT 0 COMMENT '排序，值越小越靠前';

```

## 接口

## 题库分类接口

## POST addCategory

POST /question/category

> Body 请求参数

```json
{
  "name": "string",
  "parentId": 0
}
```

其中parentId为0的话是一级分类，就是父分类。

```json
{
    "name": "java题库",
    "parentId": 0
}
```

## POST updateCategory

POST /question/category/update/{id}

> Body 请求参数

```json
{
  "name": "string",
  "parentId": 0
}
```

这里需要传入id可以修改其name跟parentId。

id:1928726701253492738

```json
{
    "name": "python多线程面试题",
    "parentId": 1928726166886580226
}
```

## POST deleteCategory

POST /question/category/delete/{id}

请求参数

| 名称 | 位置 | 类型    | 必选 | 说明 |
| ---- | ---- | ------- | ---- | ---- |
| id   | path | integer | 是   | none |

## GET 获得分类树

GET /question/category/tree

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1928725992940404738",
            "name": "java题库",
            "parentId": "0",
            "createTime": "2025-05-31 16:11:25",
            "children": [
                {
                    "id": "1928726652549234690",
                    "name": "java多线程",
                    "parentId": "1928725992940404738",
                    "createTime": "2025-05-31 16:14:03",
                    "children": []
                },
                {
                    "id": "1928726762716823554",
                    "name": "springboot面试",
                    "parentId": "1928725992940404738",
                    "createTime": "2025-05-31 16:14:29",
                    "children": []
                }
            ]
        },
        {
            "id": "1928726166886580226",
            "name": "python题库",
            "parentId": "0",
            "createTime": "2025-05-31 16:12:07",
            "children": [
                {
                    "id": "1928726701253492738",
                    "name": "python多线程面试题",
                    "parentId": "1928726166886580226",
                    "createTime": "2025-05-31 16:14:14",
                    "children": []
                }
            ]
        }
    ]
}
```

## GET 获得一级分类

GET /question/category/first

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1928725992940404738",
            "name": "java题库",
            "parentId": "0",
            "createTime": "2025-05-31 16:11:25",
            "children": null
        },
        {
            "id": "1928726166886580226",
            "name": "python题库",
            "parentId": "0",
            "createTime": "2025-05-31 16:12:07",
            "children": null
        }
    ]
}
```

就是获得parentId=0的。





## GET 获得子分类

GET /question/category/children/{id}

请求参数

| 名称 | 位置 | 类型    | 必选 | 说明 |
| ---- | ---- | ------- | ---- | ---- |
| id   | path | integer | 是   | none |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1928726652549234690",
            "name": "java多线程",
            "parentId": "1928725992940404738",
            "createTime": "2025-05-31 16:14:03",
            "children": null
        },
        {
            "id": "1928726762716823554",
            "name": "springboot面试",
            "parentId": "1928725992940404738",
            "createTime": "2025-05-31 16:14:29",
            "children": null
        }
    ]
}
```

## 题库接口

## POST 添加题库

POST /question/repo/add

> Body 请求参数

```json
{
  "title": "string",
  "categoryId": 0,
  "isExercise": 0
}
```

请求参数

```json
{
    "title": "网络工程2022级java多线程题库",
    "categoryId": 1928725992940404738,
    "isExercise": 1
}
```

## POST 修改题库

POST /question/repo/update/{id}

> Body 请求参数

```json
{
  "title": "string",
  "categoryId": 0,
  "isExercise": 0
}
```

请求参数

根据id修改。

## POST 删除题库

POST /question/repo/delete/{id}

请求参数

| 名称 | 位置 | 类型    | 必选 | 说明 |
| ---- | ---- | ------- | ---- | ---- |
| id   | path | integer | 是   | none |

> 返回示例

> 200 Response

根据id删除

## GET 根据分类ID查询题库

GET /question/repo/list/{categoryId}

请求参数

| 名称       | 位置 | 类型    | 必选 | 说明 |
| ---------- | ---- | ------- | ---- | ---- |
| categoryId | path | integer | 是   | none |

> 返回示例

> 200 Response

```java
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1928730318844936193",
            "userId": "1926882735163953154",
            "title": "网络工程2022级java多线程题库",
            "createTime": "2025-05-31 16:28:36",
            "isExercise": 1,
            "categoryId": "1928725992940404738",
            "categoryName": "java题库",
            "questionCount": null
        },
        {
            "id": "1928730616086872066",
            "userId": "1926882735163953154",
            "title": "网络工程2021级java多线程题库",
            "createTime": "2025-05-31 16:29:47",
            "isExercise": 1,
            "categoryId": "1928725992940404738",
            "categoryName": "java题库",
            "questionCount": null
        }
    ]
}
```

## 题目接口

## POST 添加试题

POST /question/add

> Body 请求参数

其中type为 1单选 2多选 3选择 4简答

```json
{
  "repoId": 1928730318844936193,
  "type": 1,
  "content": "在 Java 中，以下哪种方式不能直接用来创建新线程？",
  "correctAnswer": "C",
  "difficulty": 2,
  "options": [
    {
      "optionKey": "A",
      "content": "继承 java.lang.Thread"
    },
    {
      "optionKey": "B",
      "content": "实现 java.lang.Runnable 接口"
    },
    {
      "optionKey": "C",
      "content": "实现 java.io.Serializable 接口"
    },
    {
      "optionKey": "D",
      "content": "实现 java.util.concurrent.Callable 接口"
    }
  ]
}

```

```json
{
  "repoId": 1928730318844936193,
  "type": 2,
  "content": "以下关于 Java 线程池（`java.util.concurrent.ExecutorService`）的说法，哪些是正确的？",
  "correctAnswer": "A,B,D",
  "difficulty": 3,
  "options": [
    {
      "optionKey": "A",
      "content": "使用 `Executors.newFixedThreadPool(n)` 会创建固定大小为 n 的线程池"
    },
    {
      "optionKey": "B",
      "content": "调用 `shutdown()` 方法后，线程池不再接受新任务，但会继续执行队列中已经提交的任务"
    },
    {
      "optionKey": "C",
      "content": "`newCachedThreadPool()` 在核心线程空闲 60s 后会被自动回收"
    },
    {
      "optionKey": "D",
      "content": "线程池可以通过 `RejectedExecutionHandler` 来定制任务被拒绝的处理策略"
    }
  ]
}

```

```json
{
  "repoId": 1928730318844936193,
  "type": 3,
  "content": "在 Java 中，调用 `Thread.start()` 后，线程会立即执行 `run()` 方法。 （判断对错）",
  "correctAnswer": "B",
  "difficulty": 1,
  "options": [
    {
      "optionKey": "A",
      "content": "正确"
    },
    {
      "optionKey": "B",
      "content": "错误"
    }
  ]
}

```

```java
{
  "repoId": 1928730318844936193,
  "type": 4,
  "content": "请简述 Java 内存模型（JMM）中的 happens-before 原则是什么？",
  "correctAnswer": "见选项内容",
  "difficulty": 3,
  "options": [
    {
      "optionKey": "A",
      "content": "happens-before 原则是 Java 内存模型中用于定义操作之间可见性和有序性的规则。例如：synchronized 的解锁先于加锁、volatile 写操作先于读操作、线程 start() 先于线程 run() 等。"
    }
  ]
}

```

## DELETE 批量删除试题

DELETE /question/delete

> Body 请求参数

```json
"string" 
```

请求参数

| 名称 | 位置 | 类型   | 必选 | 说明 |
| ---- | ---- | ------ | ---- | ---- |
| body | body | string | 否   | none |

```json
"1928733050150473729,1928733189455892482"
```

## GET 根据试题id获取单题详情

GET /question/get/{id}

请求参数

| 名称 | 位置 | 类型    | 必选 | 说明   |
| ---- | ---- | ------- | ---- | ------ |
| id   | path | integer | 是   | 试题id |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": {
        "id": "1928732785066266625",
        "repoId": "1928730318844936193",
        "categoryId": "1928725992940404738",
        "type": 1,
        "content": "在 Java 中，以下哪种方式不能直接用来创建新线程？",
        "correctAnswer": "C",
        "difficulty": 2,
        "createTime": "2025-05-31 16:38:24",
        "options": [
            {
                "id": "1928732785896738818",
                "questionId": "1928732785066266625",
                "optionKey": "A",
                "content": "继承 java.lang.Thread",
                "createTime": "2025-05-31 08:38:24",
                "isDeleted": 0,
                "image": null,
                "sort": 0
            },
            {
                "id": "1928732785896738819",
                "questionId": "1928732785066266625",
                "optionKey": "B",
                "content": "实现 java.lang.Runnable 接口",
                "createTime": "2025-05-31 08:38:24",
                "isDeleted": 0,
                "image": null,
                "sort": 0
            },
            {
                "id": "1928732785896738820",
                "questionId": "1928732785066266625",
                "optionKey": "C",
                "content": "实现 java.io.Serializable 接口",
                "createTime": "2025-05-31 08:38:24",
                "isDeleted": 0,
                "image": null,
                "sort": 0
            },
            {
                "id": "1928732785896738821",
                "questionId": "1928732785066266625",
                "optionKey": "D",
                "content": "实现 java.util.concurrent.Callable 接口",
                "createTime": "2025-05-31 08:38:24",
                "isDeleted": 0,
                "image": null,
                "sort": 0
            }
        ]
    }
}
```

## GET 根据题库id 获取题库下所有试题

GET /question/list/{repoId}

请求参数

| 名称   | 位置 | 类型    | 必选 | 说明 |
| ------ | ---- | ------- | ---- | ---- |
| repoId | path | integer | 是   | none |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        {
            "id": "1928732785066266625",
            "repoId": "1928730318844936193",
            "categoryId": "1928725992940404738",
            "type": 1,
            "content": "在 Java 中，以下哪种方式不能直接用来创建新线程？",
            "correctAnswer": "C",
            "difficulty": 2,
            "createTime": "2025-05-31 16:38:24",
            "options": [
                {
                    "id": "1928732785896738818",
                    "questionId": "1928732785066266625",
                    "optionKey": "A",
                    "content": "继承 java.lang.Thread",
                    "createTime": "2025-05-31 08:38:24",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928732785896738819",
                    "questionId": "1928732785066266625",
                    "optionKey": "B",
                    "content": "实现 java.lang.Runnable 接口",
                    "createTime": "2025-05-31 08:38:24",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928732785896738820",
                    "questionId": "1928732785066266625",
                    "optionKey": "C",
                    "content": "实现 java.io.Serializable 接口",
                    "createTime": "2025-05-31 08:38:24",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928732785896738821",
                    "questionId": "1928732785066266625",
                    "optionKey": "D",
                    "content": "实现 java.util.concurrent.Callable 接口",
                    "createTime": "2025-05-31 08:38:24",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                }
            ]
        },
        {
            "id": "1928733050150473729",
            "repoId": "1928730318844936193",
            "categoryId": "1928725992940404738",
            "type": 2,
            "content": "以下关于 Java 线程池（`java.util.concurrent.ExecutorService`）的说法，哪些是正确的？",
            "correctAnswer": "A,B,D",
            "difficulty": 3,
            "createTime": "2025-05-31 16:39:27",
            "options": [
                {
                    "id": "1928733050939002881",
                    "questionId": "1928733050150473729",
                    "optionKey": "A",
                    "content": "使用 `Executors.newFixedThreadPool(n)` 会创建固定大小为 n 的线程池",
                    "createTime": "2025-05-31 08:39:27",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928733050997723138",
                    "questionId": "1928733050150473729",
                    "optionKey": "B",
                    "content": "调用 `shutdown()` 方法后，线程池不再接受新任务，但会继续执行队列中已经提交的任务",
                    "createTime": "2025-05-31 08:39:27",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928733050997723139",
                    "questionId": "1928733050150473729",
                    "optionKey": "C",
                    "content": "`newCachedThreadPool()` 在核心线程空闲 60s 后会被自动回收",
                    "createTime": "2025-05-31 08:39:28",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928733050997723140",
                    "questionId": "1928733050150473729",
                    "optionKey": "D",
                    "content": "线程池可以通过 `RejectedExecutionHandler` 来定制任务被拒绝的处理策略",
                    "createTime": "2025-05-31 08:39:28",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                }
            ]
        },
        {
            "id": "1928733189455892482",
            "repoId": "1928730318844936193",
            "categoryId": "1928725992940404738",
            "type": 3,
            "content": "在 Java 中，调用 `Thread.start()` 后，线程会立即执行 `run()` 方法。 （判断对错）",
            "correctAnswer": "B",
            "difficulty": 1,
            "createTime": "2025-05-31 16:40:00",
            "options": [
                {
                    "id": "1928733190181507073",
                    "questionId": "1928733189455892482",
                    "optionKey": "A",
                    "content": "正确",
                    "createTime": "2025-05-31 08:40:00",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                },
                {
                    "id": "1928733190181507074",
                    "questionId": "1928733189455892482",
                    "optionKey": "B",
                    "content": "错误",
                    "createTime": "2025-05-31 08:40:01",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                }
            ]
        },
        {
            "id": "1928733870418018305",
            "repoId": "1928730318844936193",
            "categoryId": "1928725992940404738",
            "type": 4,
            "content": "请简述 Java 内存模型（JMM）中的 happens-before 原则是什么？",
            "correctAnswer": "见选项内容",
            "difficulty": 3,
            "createTime": "2025-05-31 16:42:43",
            "options": [
                {
                    "id": "1928733871076524034",
                    "questionId": "1928733870418018305",
                    "optionKey": "A",
                    "content": "happens-before 原则是 Java 内存模型中用于定义操作之间可见性和有序性的规则。例如：synchronized 的解锁先于加锁、volatile 写操作先于读操作、线程 start() 先于线程 run() 等。",
                    "createTime": "2025-05-31 08:42:43",
                    "isDeleted": 0,
                    "image": null,
                    "sort": 0
                }
            ]
        }
    ]
}
```

## GET 根据题库id 获取题库下所有的试题id

GET /question/ids/{repoId}

请求参数

| 名称   | 位置 | 类型    | 必选 | 说明 |
| ------ | ---- | ------- | ---- | ---- |
| repoId | path | integer | 是   | none |

> 返回示例

> 200 Response

```json
{
    "code": 200,
    "msg": "操作成功",
    "data": [
        "1928732785066266625",
        "1928733050150473729",
        "1928733189455892482",
        "1928733870418018305"
    ]
}
```

