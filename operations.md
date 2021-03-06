example for operation: `5-2+30/15+2*1-20`

`OperationTree`:
```js
[
    5,
    '-',
    2,
    '+',
    30,
    '/',
    15,
    '+',
    2,
    '*',
    1,
    '-',
    20
]
```

`PriorityOperationTree`:
```js
[
    5,
    '-',
    2,
    '+',
    [
        30,
        '/',
        15
    ],
    '+',
    [
        2,
        '*',
        1
    ],
    '-',
    20
]
```

After these objects are formed, it will loop through the sorted priority queue (in this example, it does not matter) and get the resulting value `-13`.  
  
example for operation with functions: `3+2-abs(-2)`

`OperationTree`:
```js
[
    3,
    '+',
    2,
    '-',
    {
        function: 'abs',
        params: [
            -2
        ]
    }
]
```

After this tree is parsed and evaluated, the result will be 3.