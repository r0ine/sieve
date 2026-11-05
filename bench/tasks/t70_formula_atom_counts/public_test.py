from solution import solve

assert solve("H2O") == [["H", 2], ["O", 1]]
assert solve("Mg(OH)2") == [["H", 2], ["Mg", 1], ["O", 2]]
assert solve("K4(ON(SO3)2)2") == [["K", 4], ["N", 2], ["O", 14], ["S", 4]]
