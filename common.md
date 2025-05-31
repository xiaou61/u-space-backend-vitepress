这个是对于xiaou-common模块进行的解读。

## xiaou-common-bom模块

这个模块为版本管理模块。可以用于模块的一个统一版本管理。

## xiaou-common-core模块

这个为通用的核心包代码，也是每个业务模块必须要引入的依赖。

他里面引入了很多常用的依赖，例如hutool，lombok，spring-boot-starter-validation，aop，commons-lang3等。

接下来我们对里面的具体文件具体简述其作用。

### config

config目录下目前有三个配置类

分别为

#### APPlicationConfig

![image-20250530154600769](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505301546826.png)

`ApplicationConfig` 是项目的基础自动配置类

这个也可以写在启动类上面。

`@AutoConfiguration`

- 这是 Spring Boot 3 引入的注解，等价于旧版的 `@Configuration` + `@EnableAutoConfiguration`。
- 表示这是一个自动配置类，Spring Boot 启动时会自动加载该配置。

`@EnableAspectJAutoProxy`

- 开启 AOP（面向切面编程）自动代理功能。
- 支持通过 `@Aspect` 注解定义切面，例如日志切面、权限切面等。

`@EnableAsync(proxyTargetClass = true)`

- 开启异步方法支持，即允许使用 `@Async` 注解的方法异步执行。
- `proxyTargetClass = true` 表示使用 CGLIB 代理方式而非 JDK 动态代理。

`@EnableConfigurationProperties`

- 启用 Spring Boot 的 `@ConfigurationProperties` 功能，自动绑定配置文件中的属性到 Java Bean。
- 常配合 `@ConfigurationProperties(prefix = "...")` 使用，用于加载如线程池、Redis、邮件等配置。

#### 其余

剩下的都是跟线程池有关系的。

![image-20250530154820587](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505301548658.png)

### constan

这个模块放了所有的字符串常量。以及一些redis缓存字段的常量

例如

![image-20250530155018323](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505301550391.png)

### domain

这个模块存放了我们项目的一个统一结果返回类R

```java
package com.xiaou.common.domain;

import com.xiaou.common.constant.HttpStatus;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.io.Serial;
import java.io.Serializable;

/**
 * 响应信息主体
 */
@Data
@NoArgsConstructor
public class R<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 成功
     */
    public static final int SUCCESS = 200;

    /**
     * 失败
     */
    public static final int FAIL = 500;

    private int code;

    private String msg;

    private T data;

    public static <T> R<T> ok() {
        return restResult(null, SUCCESS, "操作成功");
    }

    public static <T> R<T> ok(T data) {
        return restResult(data, SUCCESS, "操作成功");
    }

    public static <T> R<T> ok(String msg) {
        return restResult(null, SUCCESS, msg);
    }

    public static <T> R<T> ok(String msg, T data) {
        return restResult(data, SUCCESS, msg);
    }

    public static <T> R<T> fail() {
        return restResult(null, FAIL, "操作失败");
    }

    public static <T> R<T> fail(String msg) {
        return restResult(null, FAIL, msg);
    }

    public static <T> R<T> fail(T data) {
        return restResult(data, FAIL, "操作失败");
    }

    public static <T> R<T> fail(String msg, T data) {
        return restResult(data, FAIL, msg);
    }

    public static <T> R<T> fail(int code, String msg) {
        return restResult(null, code, msg);
    }

    /**
     * 返回警告消息
     *
     * @param msg 返回内容
     * @return 警告消息
     */
    public static <T> R<T> warn(String msg) {
        return restResult(null, HttpStatus.WARN, msg);
    }

    /**
     * 返回警告消息
     *
     * @param msg 返回内容
     * @param data 数据对象
     * @return 警告消息
     */
    public static <T> R<T> warn(String msg, T data) {
        return restResult(data, HttpStatus.WARN, msg);
    }

    private static <T> R<T> restResult(T data, int code, String msg) {
        R<T> r = new R<>();
        r.setCode(code);
        r.setData(data);
        r.setMsg(msg);
        return r;
    }

    public static <T> Boolean isError(R<T> ret) {
        return !isSuccess(ret);
    }

    public static <T> Boolean isSuccess(R<T> ret) {
        return R.SUCCESS == ret.getCode();
    }
}

```

### exception

这里主要管理一些异常。

首先是有一个GlobalExceptionHandler

通过GlobalExceptionHandler来进行全局异常的处理。

```java
package com.xiaou.common.exception;


import cn.dev33.satoken.exception.NotLoginException;
import com.xiaou.common.domain.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {



    @ExceptionHandler(BusinessException.class)
    public R<?> businessExceptionHandler(BusinessException e) {
        log.error("BusinessException", e);
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(NotLoginException.class)
    public R<?> notLoginExceptionHandler(NotLoginException e) {
        log.error("NotLoginException", e);
        return R.fail("未登录");
    }

    @ExceptionHandler(ServiceException.class)
    public R<?> ServiceExceptionHandler(ServiceException e) {
        log.error(e.getMessage());
        return R.fail(e.getMessage());
    }

}

```

想要添加什么自定义异常可以通过这个类进行一个添加。

同时还有一个异常处理的工具类

```java
package com.xiaou.common.exception;

/**
 * 异常处理工具类
 */
public class ThrowUtils {

    /**
     * 条件成立则抛异常
     *
     * @param condition        条件
     * @param runtimeException 异常
     */
    public static void throwIf(boolean condition, RuntimeException runtimeException) {
        if (condition) {
            throw runtimeException;
        }
    }

    /**
     * 条件成立则抛异常
     *
     * @param condition 条件
     * @param errorCode 错误码
     */
    public static void throwIf(boolean condition, ErrorCode errorCode) {
        throwIf(condition, new BusinessException(errorCode));
    }

    /**
     * 条件成立则抛异常
     *
     * @param condition 条件
     * @param errorCode 错误码
     * @param message 错误信息
     */
    public static void throwIf(boolean condition, ErrorCode errorCode, String message) {
        throwIf(condition, new BusinessException(errorCode, message));
    }

}

```



可以在某些场景中避免写try-catch

### page

这里放入的是我们的通用分页对象。

我们项目规定，如果要用到分页操作，返回给前端的为pageRespDto。前端需要给我们传入的，我们操作数据库的对象为pageReqDto。这个在后面介绍分页的时候会详细说明。

### utils

这里集成了非常多的工具类

![image-20250530155526203](https://11-1305448902.cos.ap-chengdu.myqcloud.com/img/202505301555254.png)

我们在编写业务的时候，可以灵活应用这些工具类。

并且我们对commons-lang3的StringUtils进行了集成并加入了很多业务中需要的方法。

```java
public class StringUtils extends org.apache.commons.lang3.StringUtils
```

springutils则是对hutool的继承。

