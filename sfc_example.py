sfc_ex = {
    # зверху вниз
    # параметри в скобках, все редактируются
    # "type": "thread_start/end" - два паралельних хеєра

    "name": "sfc1_test",

    "description": "test sfc",

    "code-blocks": [{

        "thread": 0,

        "blocks": [

            {

                "id": 1,

                "next": 2,

                "type": "exec", # виконання функцій -  прямокутник

                "func": "lock",

                "params": {

                    "lock_id": {"type": "const", "value": "test1"},

                    "expires": {"type": "const", "value": 5}

                }

            },

            {

                "id": 2,

                "next": 3,

                "type": "set", # призначення значення,

                "func": "state",

                "var": "s1",

                "func_var_out": "value",

                "var_shared": False,

                "params": {

                    "item_id": {"type": "const", "value": "sensor:env/temp1"}

                }

            },

            {

                "id": 3,

                "next": 4,

                "next-false": 5,

                "type": "cond", # ромбік, якійсь метод який вертає або тру або фолс

                "func": "EQ",

                "params": {

                    "IN": {"type": "const", "value": 25},

                    "args": [{"type": "func", "value": {

                        "func": "state",

                        "func_var_out": "value",

                        "params": {

                            "item_id": {"type": "const",
                                        "value": "sensor:env/temp1"}

                        }}}]

                }

            },

            {

                "id": 4,

                "next": 5,

                "type": "thread_start", # тут роздвоєння які треди стартують

                "thread": [1]

            },

            {

                "id": 5,

                "next": 6,

                "type": "exec",

                "func": "start",

                "params": {

                    "unit_id": {"type": "const", "value": "pumps/pump1"}

                }

            },

            {

                "id": 6,

                "next": 7,

                "type": "thread_wait", # сходження тредів, їх очікування

                "thread": [1]

            },

            {

                "id": 7,

                "next": 8,

                "type": "exec",

                "func": "info",

                "params": {

                    "msg": {"type": "const", "value": "pumps started"}

                }

            },

            {

                "id": 8,

                "next": 9,

                "type": "exec",

                "func": "info",

                "params": {

                    "msg": {"type": "var", "value": "s1"}

                }

            },

            {

                "id": 9,

                "type": "set",

                "var": "out",

                "var_in": "s1",

                "var_in_shared": False

            }

        ]

    }, {

        "thread": 1,

        "blocks": [

            {

                "id": 10,

                "type": "exec",

                "func": "start",

                "params": {

                    "unit_id": {"type": "const", "value": "pumps/pump2"}

                }

            }

        ]

    }

    ],

    "final-blocks": [ # це енд

        {

            "id": 11,

            "type": "exec",

            "func": "unlock",

            "params": {

                "lock_id": {"type": "const", "value": "test1"}

            }

        }

    ]

}
