# 二次开发要求

## 业务模块

这个是我一直在遵循的要求，一般建议如果想要二开或者贡献代码就遵循这个要求。

首先是开发业务都需要在xiaou-modules模块下新建模块来写。

模块需要首先引入

```xml
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common-core</artifactId>
</dependency>
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common-web</artifactId>
</dependency>
```

其他的根据需求按需进行引入。

一般常见的有

```xml
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common-mybatis</artifactId>
</dependency>
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common-redis</artifactId>
</dependency>
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common-satoken</artifactId>
</dependency>
```

之后模块的父pom

```xml
<parent>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-modules</artifactId>
    <version>${revision}</version>
</parent>
```

此为固定写法。

之后在启动类xiaou-admin的pom里面引入例如

```xml
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-ai</artifactId>
    <version>${revision}</version>
</dependency>
```

## 通用模块

如果想要开发common模块的通用功能。

父pom为

```xml
<parent>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common</artifactId>
    <version>${revision}</version>
</parent>
```

之后需要在xiaou-common-bom模块声明。

例如

```xml
<dependency>
    <groupId>com.xiaou</groupId>
    <artifactId>xiaou-common-websocket</artifactId>
    <version>${revision}</version>
</dependency>
```

## 贡献代码需求

需要提交pr后，提交你的接口测试图。如果前端也进行修改了，可以直接提交前后端联调测试图