# revalue (Reactive Value)
Простой и интуитивный способ Реактивного Программирования

## Идея
Одна из характерных черт реактивного программирования - это, то, что при изменении входных данных, происходит автоматический пересчёт данных, зависящих от них.

Самые известные библиотеки для рекативного программирования очень функциональны, но сложны с концептуальной точки зрения.

Идея библиотеки `revalue` очень проста: нам всего лишь нужно зарегистрировать переменные и функции, которые зависят от *других* переменных и функций.

К примеру,

```javascript
// Следующий код создаст регистр `logic`
var logic = revalue(function(r) {
    var
        revenue = r.var( 150 ), // Это регистрирует переменную `revenue` (выручка) со значением 150
        cost    = r.var( 100 ), // Это регистрирует переменную `cost` (затраты) со значением 100
        
        // Следующий код создаст переменную `profit` (прибыль), которая зависит от `revenue` и `cost`, и
        // которая будет автоматически пересчитана каждый раз, когда `revenue` или `cost` изменится
        profit  = r.fun(revenue, cost).is(function(revenue, cost) {
            return revenue - cost;
        })
    ;
    
    // Так же мы можем создать "скрытую" функцию, к которой у пользователя не будет доступа,
    // но которая всё равно будет обновлена каждый раз, когда её зависимые переменные / функции
    // меняют значение. Это особенно полезно для обновления DOM.
    r.fun(profit).is(function(profit) {
        console.log("Profit is", profit);
    });

    // Возвращая следующие свойства, они окажутся в регистре `logic`.
    return {
      revenue : revenue,
      cost    : cost,
      profit  : profit
    };
});
```

Данный пример регистрирует переменные `revenue` (выручка) и `cost` (затраты), и функцию `profit` (прибыль), которая будет автоматически посчитана как `revenue` минус `cost`. Потом, мы регистрируем скрытую функцию, которая будет выводить значение `profit` каждый раз, когда её значение меняется.

Каждая переменная и функция имеет значение, и это значение можно узнать с помощью

```javascript
logic.profit.get(); // Возвращает 50
```

Или, изменить её значение с помощью

```javascript
logic.revenue.set( 150 );
```

## В чём польза?
Когда мы изменяем значение переменной или функции, то функции, которые от неё зависят, будут автоматически пересчитаны. В предыдущем примере,

```javascript
logic.profit.get();        // Возвращает 50
logic.revenue.set( 350 );  // Меняем выручку на 350 (было 150)
logic.profit.get();        // Возвращает 250
```

Этот подход по смыслу напоминает функции ячеек в Excel. Такая функциональность особенно полезна для
* Декларативного подхода к программированию
* Создания реактивного DOM и шаблонных систем
* Работы с изменением состояния в приложениях и компонентах
* Создание системы настройки [пользовательских элементов](https://learn.javascript.ru/webcomponent-core)

## Как?
Для дополнительной практики, можно ознакомиться с примерами в папке **[/demo](https://github.com/guitarino/revalue/tree/master/demo)**. Этот раздел посвящён общему обзору о том, как работать с `revalue`.

### Работа с регистрами
Есть 2 способа создания регистра:

1. Лучший способ, с помощью функции
   ```javascript
   var r1 = revalue(function(r) {
       // Заметка: r === revalue. Мы используем его в качестве аргумента для удобства.
       var
           a = r.var( 1 ), // Создаст переменную `a` со значием 1
           b = r.var( 2 ), // Создаст переменную `b` со значием 2
           // Создаст функцию `x`, значение которой всё время будет `a + b`
           x = r.fun( a, b ).is(function(a,b) {
               return a + b;
           })
       ;
       // Возвращённые свойства будут в регистре `r1`
       return {a:a, b:b, x:x}
   });
   ```

2. Альтернативный способ, с помощью объекта
   ```javascript
   var r2 = revalue({
       'a' : 1,
       'b' : 2,
       'x' : {
           dependencies: ['a','b'],
           is: function(a,b) {
               return a + b;
           }
       }
   });
   ```

Также можно добавлять переменные и функции в уже существующий регистр, если регистр использовать первым параметром:

```javascript
revalue(r1, function(r) {
    var c = r.var( 3 );
    return {c: c};
});
// Альтернативно,
revalue(r2, {
    c: 3
});
```

### Работа с переменными и функциями:
* Узнать значение:
   ```javascript
   r1.x.get(); // Возвращает 3 (потому что x = a + b = 1 + 2 = 3)
   ```

* Установить значение:
   ```javascript
   r1.a.set(220);
   r1.x.get(); // Возвращает 222 (потому что x = a + b = 220 + 2 = 222)
   ```

* Изменить зависимости функции:
   ```javascript
   r1.x.of([r1.c, r1.b]);
   r1.x.get(); // Возвращает 5 (потому что x = c + b = 3 + 2 = 5)
   ```

* Изменить саму функцию:
   ```javascript
   r1.x.is(function(a,b) {
       return a * b;
   });
   r1.x.get(); // Возвращает 6 (потому что x = c * b = 3 * 2 = 6)
   ```

Функция может зависить и от предыдущих значений её зависимостей:

```javascript
r1.x.is(function(a, b, pre_a, pre_b) {
    return a * b + pre_a * pre_b;
});
r1.b.set(10);
r1.x.get(); // Возвращает 36 (потому что x = a * b + pre_a * pre_b = 3 * 10 + 3 * 2 = 36)
```

Функция из одного регистра может зависит от функций / переменных из других регистров:

```javascript
revalue(r2, function(r) {
    var y = r.fun(r1.x).is(function(x) {
        return x / 2;
    });
    return {y: y}
});
r2.y.get(); // Возвращает 18 (потому что y = x / 2 = 36 / 2 = 18)
```

Мы также можем зарегистрировать функцию / перменную вне регистра:

```javascript
revalue.fun(r2.y).is(function(y) {
    document.getElementById('test').textContent = y;
});
```

## Установка
Размер утилиты - 1.2K минимизированная с gzip сжатием (3K минимизированная).

### Браузер
Добавьте к вашей HTML странице:

```html
<script src="path/to/revalue.js"></script>
```

### NodeJS
Добавьте revalue в качестве NodeJS модуля:

```javascript
var revalue = require('./path/to/revalue.js');
```

## [См. описание API](https://github.com/guitarino/revalue/blob/master/API.ru.md)

## Лицензия
[Лицензия MIT](https://github.com/guitarino/revalue/blob/master/LICENSE)